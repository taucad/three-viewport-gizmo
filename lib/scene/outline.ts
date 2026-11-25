import { Matrix4, Vector3 } from "three";
import { fieldOfViewDistance, UNIT_FACE_OUTLINE, type FaceOnOutline } from "../render/internalCamera";
import type { SceneOptions, SceneTarget } from "./build";
import { styleOf } from "./update";

/** The scene's scale while the triad shows, as Tau draws it: the cube shrinks to give the axes and labels room. */
export const TRIAD_SCENE_SCALE = 0.7;

/** Whether the triad shows for these options: on, and a cube type. */
export const triadShown = (o: Pick<SceneOptions, "type" | "triad">): boolean => o.type !== "sphere" && o.triad.enabled;

/** Half the sphere's orthographic frustum height, as in `createInternalCamera`. */
const SPHERE_HALF_HEIGHT = 1.8;

const _v = /*@__PURE__*/ new Vector3();
const _m = /*@__PURE__*/ new Matrix4();

/**
 * The cube's face-on outline as the gizmo draws it, in the scene's units at its current scale (`TRIAD_SCENE_SCALE`
 * while the triad shows). Face-on, the drawn half-size at distance `d` is the largest `x / (d − z)` over its points, so
 * {@link fieldOfViewDistance} holds it exactly.
 *
 * - `rounded-cube`: the (depth, half-width) points of every shown target, reduced to those no other point is both
 *   nearer and wider than. Its pieces close one convex body whose outline runs round the bevel, so the point that
 *   bounds it moves toward the camera as the camera comes closer: a single depth (`1 − radius`) holds it only to 7 %
 *   at 90°. Read from each target's geometry, place and resting scale (never its hover scale).
 * - `cube`: 2.3.0's model, the unit front edge, scaled with the scene. Its pieces are one-sided plates (side faces
 *   that face away, corner plates that turn away from a close camera, the background seen from inside), so what bounds
 *   its drawn width changes with the field of view and no single outline holds it (recorded, P13).
 *
 * The body is symmetric about its centre and under axis swaps, so its +Z face stands for every face.
 *
 * @param targets - The scene's targets
 * @param o - Resolved options; reads `type`, `triad` and the targets' scales
 * @returns Flat `[z0, x0, z1, x1, …]`, nearest first; the unit front edge for the sphere
 */
export function faceOnOutline(targets: readonly SceneTarget[], o: SceneOptions): FaceOnOutline {
  const scale = triadShown(o) ? TRIAD_SCENE_SCALE : 1;
  if (o.type !== "rounded-cube") return scale === 1 ? UNIT_FACE_OUTLINE : UNIT_FACE_OUTLINE.map((v) => v * scale);
  const points: Array<[number, number]> = [];
  for (const target of targets) {
    const { object } = target;
    if (!object.visible || !("geometry" in object)) continue;
    const position = object.geometry.attributes.position;
    _m.compose(object.position, object.quaternion, _v.setScalar(styleOf(o, target).scale));
    for (let i = 0; i < position.count; i++) {
      _v.fromBufferAttribute(position, i).applyMatrix4(_m);
      if (_v.x > 0) points.push([_v.z, _v.x]);
    }
  }
  if (points.length === 0) return UNIT_FACE_OUTLINE;
  // Nearest first; a point counts only if it is wider than every nearer one.
  points.sort((a, b) => b[0] - a[0] || b[1] - a[1]);
  const outline: number[] = [];
  let widest = -Infinity;
  for (const [z, x] of points) {
    if (x <= widest) continue;
    widest = x;
    outline.push(z * scale, x * scale);
  }
  return outline;
}

/**
 * Screen pixels per world unit at the gizmo's origin, for the gizmo's own camera drawn `size` pixels tall: the
 * sphere's orthographic frustum, or the cube's perspective camera at its field-of-view distance for `outline`.
 *
 * @param options - Resolved options; reads `type`, `size` and `fieldOfView`
 * @param outline - From {@link faceOnOutline}, as the camera is placed with
 * @returns CSS pixels per world unit; independent of the host canvas size and device pixel ratio
 */
export const pixelsPerUnit = (
  { type, size, fieldOfView }: Pick<SceneOptions, "type" | "size" | "fieldOfView">,
  outline: FaceOnOutline = UNIT_FACE_OUTLINE
): number =>
  size /
  (type === "sphere"
    ? 2 * SPHERE_HALF_HEIGHT
    : 2 * fieldOfViewDistance(fieldOfView, outline) * Math.tan(fieldOfView / 2));
