import { BackSide, DoubleSide, MathUtils, Mesh, PerspectiveCamera, Sprite, Vector3, type Camera, type Object3D } from "three";
import { vi } from "vitest";
import { ViewportGizmo } from "../ViewportGizmo.js";
import type { GizmoOptions } from "../types.js";
import { createStubRenderer, layOut } from "./test-utils.js";

const _a = new Vector3();
const _b = new Vector3();
const _c = new Vector3();
const _n = new Vector3();
const _d = new Vector3();
const _eye = new Vector3();

/** Gizmo CSS pixels the measurements are made at. */
export const MEASURE_SIZE = 320;

/**
 * The face-on width, in gizmo pixels, of the gizmo's drawn body: every target and the background as the renderer
 * draws them (front faces only, as each material culls; sprites as screen-aligned quads), not the axis lines or the
 * triad. Face-on: the host looks down −Z, so the gizmo's +Z face is toward its camera. Projects through the camera
 * `render()` draws with.
 *
 * @param options - Gizmo options; `size` and `fieldOfView` are set here
 * @param degrees - The gizmo's `fieldOfView` in degrees
 */
export function faceOnWidth(options: GizmoOptions, degrees: number): number {
  const renderer = createStubRenderer();
  const container = document.body.appendChild(document.createElement("div"));
  const host = new PerspectiveCamera(50, 1, 0.1, 100);
  host.position.set(0, 0, 7);
  host.lookAt(0, 0, 0);
  const size = MEASURE_SIZE;
  const gizmo = layOut(new ViewportGizmo(host, renderer, { ...options, size, container, fieldOfView: MathUtils.degToRad(degrees) }));
  const draw = vi.spyOn(renderer, "render");
  gizmo.render();
  const camera = draw.mock.calls[0]![1] as Camera;
  // The scene group holds the background, the axis lines, the 26 targets and the triad, in that order.
  const group = gizmo.root.children[0]!;
  gizmo.root.updateMatrixWorld(true);
  camera.updateMatrixWorld();
  camera.getWorldPosition(_eye);
  let min = Infinity;
  let max = -Infinity;
  const add = (v: Vector3) => {
    const x = v.project(camera).x;
    min = Math.min(min, x);
    max = Math.max(max, x);
  };
  const body = [group.children[0], ...group.children.slice(2, 28)] as Object3D[];
  for (const object of body) {
    if (!object.visible) continue;
    if (object instanceof Sprite) {
      if (object.material.opacity <= 0) continue;
      // A sprite is a unit quad in the view plane through its centre.
      _a.setFromMatrixPosition(object.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
      for (const s of [-0.5, 0.5]) add(_b.set(_a.x + s * object.scale.x, _a.y, _a.z).applyMatrix4(camera.matrixWorld));
      continue;
    }
    if (!(object instanceof Mesh) || object.material.opacity <= 0) continue;
    const { side } = object.material;
    const position = object.geometry.attributes.position;
    const index = object.geometry.index!;
    const count = object.geometry.drawRange.count === Infinity ? index.count : Math.min(index.count, object.geometry.drawRange.count);
    for (let i = 0; i < count; i += 3) {
      _a.fromBufferAttribute(position, index.getX(i)).applyMatrix4(object.matrixWorld);
      _b.fromBufferAttribute(position, index.getX(i + 1)).applyMatrix4(object.matrixWorld);
      _c.fromBufferAttribute(position, index.getX(i + 2)).applyMatrix4(object.matrixWorld);
      _n.subVectors(_b, _a).cross(_d.subVectors(_c, _a));
      const facing = _n.dot(_eye.clone().sub(_a));
      if (side !== DoubleSide && (side === BackSide ? facing >= 0 : facing <= 0)) continue;
      add(_a.clone());
      add(_b.clone());
      add(_c.clone());
    }
  }
  gizmo.dispose();
  container.remove();
  return ((max - min) * size) / 2;
}

/** The face-on width at each field of view, relative to the width at the default 26°. */
export function widthRatios(options: GizmoOptions, degrees: readonly number[] = [0.1, 30, 45, 90]): Record<number, number> {
  const base = faceOnWidth(options, 26);
  return Object.fromEntries(degrees.map((d) => [d, faceOnWidth(options, d) / base]));
}
