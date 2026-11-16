import {
  BackSide,
  CircleGeometry,
  FrontSide,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3,
  type BufferGeometry,
  type Camera,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { PartBuilder } from "./build";

/** The 2.3.0 sphere background's radius, which fills the sphere camera's ±1.8 frustum. */
export const BACKGROUND_RADIUS = 1.8;

/** Segments of the sphere's disc: one triangle each, and a silhouette within 0.001 units of a circle (P10). */
export const BACKGROUND_SEGMENTS = 128;

const _parent = /*@__PURE__*/ new Quaternion();

/**
 * Turns the disc to face `camera` and moves it to the back of the 2.3.0 sphere, so the axis lines behind the origin
 * still draw in front of it as they did. Runs before the renderer reads the disc's world matrix.
 */
function faceCamera(this: Mesh, _renderer: unknown, _scene: unknown, camera: Camera): void {
  if (this.parent) this.parent.getWorldQuaternion(_parent).invert();
  else _parent.identity();
  camera.getWorldQuaternion(this.quaternion).premultiply(_parent);
  this.position.set(0, 0, -BACKGROUND_RADIUS).applyQuaternion(this.quaternion);
  this.updateMatrixWorld();
}

/**
 * The gizmo's background (P10). On the sphere a camera-facing disc of {@link BACKGROUND_SEGMENTS} triangles draws
 * what 2.3.0's 8,064-triangle back-facing sphere drew: its orthographic silhouette. On the cubes the faces are merged
 * at 0.9 scale, as in 2.3.0. Its colour and opacity follow the pointer being over the gizmo.
 */
export const background: PartBuilder = (o, { targets }, owned) => {
  const sphere = o.type === "sphere";
  const material = new MeshBasicMaterial({
    side: sphere ? FrontSide : BackSide,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const scale = new Vector3().setScalar(0.9);
  const geometry: BufferGeometry = sphere
    ? new CircleGeometry(BACKGROUND_RADIUS, BACKGROUND_SEGMENTS)
    : mergeGeometries(
        targets
          .filter(({ end }) => end)
          .map(({ object }) =>
            (object as Mesh).geometry.clone().applyMatrix4(new Matrix4().compose(object.position, object.quaternion, scale))
          )
      );
  owned.add(material).add(geometry);
  const object = new Mesh(geometry, material);
  if (sphere) object.onBeforeRender = faceCamera;
  return {
    object,
    update(o, over) {
      const { enabled, color, opacity, hover } = o.background;
      object.visible = enabled;
      material.color.set(over ? hover.color : color);
      material.opacity = over ? hover.opacity : opacity;
    },
  };
};
