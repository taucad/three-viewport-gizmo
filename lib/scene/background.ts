import {
  CircleGeometry,
  MathUtils,
  Matrix4,
  Mesh,
  Quaternion,
  Vector3,
  type BufferGeometry,
  type Camera,
  type Object3D,
  type PerspectiveCamera,
} from "three";
import { mergeGeometries } from "./merge";
import type { PartBuilder } from "./build";
import { meshAttributes, targetMaterial, whiteTexture } from "./materials";

/** The 2.3.0 sphere background's radius, which filled its orthographic camera's ±1.8 frustum. */
export const BACKGROUND_RADIUS = 1.8;

/** Segments of the sphere's disc: one triangle each, and a silhouette within 0.001 units of a circle (P10). */
export const BACKGROUND_SEGMENTS = 128;

const _parent = /*@__PURE__*/ new Quaternion();

/**
 * Turns `object` to face `camera`, as a sprite does, so a quad draws with the meshes' program instead of the sprite
 * program (perf budget `programs`). Needs its parent's world matrix current; updates the object's own.
 */
export function turnToCamera(object: Object3D, camera: Camera): void {
  if (object.parent) object.parent.getWorldQuaternion(_parent).invert();
  else _parent.identity();
  camera.getWorldQuaternion(object.quaternion).premultiply(_parent);
  object.updateMatrixWorld();
}

/**
 * Turns the disc to face `camera` and moves it to the back of the 2.3.0 sphere, so the axis lines behind the origin
 * still draw in front of it as they did, sized to fill the camera's view there: the element's circle at every field
 * of view, as 2.3.0's orthographic disc was.
 */
function faceCamera(disc: Mesh, camera: Camera): void {
  turnToCamera(disc, camera);
  disc.position.set(0, 0, -BACKGROUND_RADIUS).applyQuaternion(disc.quaternion);
  const { fov, position } = camera as PerspectiveCamera;
  // Written only on change: a double stored anew is boxed (perf budget `alloc`).
  const scale = fov
    ? ((position.z + BACKGROUND_RADIUS) * Math.tan(fov * MathUtils.DEG2RAD * 0.5)) / BACKGROUND_RADIUS
    : 1;
  if (disc.scale.x !== scale) disc.scale.setScalar(scale);
  disc.updateMatrixWorld();
}

/**
 * The gizmo's background (P10). On the sphere a camera-facing disc of {@link BACKGROUND_SEGMENTS} triangles draws
 * what 2.3.0's 8,064-triangle back-facing sphere drew: its orthographic silhouette, the element's circle. On the cubes
 * the faces are merged at 0.9 scale, as in 2.3.0. Its colour and opacity follow the pointer being over the gizmo.
 *
 * It draws with the targets' program (`targetMaterial`), so it draws its front side: the cubes' far faces, which
 * 2.3.0 drew with `BackSide`, are mirrored across each face's local X, which reverses their winding and leaves the
 * shape in place (a cube face is a symmetric rectangle, and the rounded cube's six pieces mirror onto each other).
 * Only the sphere's disc writes depth, which hides nothing behind it; the cubes' must not hide the edges and line tips
 * that reach past its far faces, as in 2.3.0, so on WebGPU the cubes' background is the gizmo's second pipeline.
 */
export const background: PartBuilder = (o, { targets }, owned) => {
  const sphere = o.type === "sphere";
  const material = targetMaterial({ sprite: false, map: null, color: 0xffffff, opacity: 1 }, whiteTexture(owned));
  material.depthWrite = sphere;
  const scale = new Vector3(-0.9, 0.9, 0.9);
  const geometry: BufferGeometry = sphere
    ? new CircleGeometry(BACKGROUND_RADIUS, BACKGROUND_SEGMENTS)
    : mergeGeometries(
        targets
          .filter(({ end }) => end)
          .map(({ object }) =>
            (object as Mesh).geometry.clone().applyMatrix4(new Matrix4().compose(object.position, object.quaternion, scale))
          )
      );
  owned.add(material).add(meshAttributes(geometry));
  const object = new Mesh(geometry, material);
  return {
    object,
    face: sphere ? (camera) => faceCamera(object, camera) : undefined,
    update(o, over) {
      const { enabled, color, opacity, hover } = o.background;
      object.visible = enabled;
      material.color.set(over ? hover.color : color);
      material.opacity = over ? hover.opacity : opacity;
    },
  };
};
