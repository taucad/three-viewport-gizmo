import { BackSide, DoubleSide, Matrix4, Mesh, Vector3, type Material, type Object3D } from "three";
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
const _a = /*@__PURE__*/ new Vector3();
const _b = /*@__PURE__*/ new Vector3();
const _n = /*@__PURE__*/ new Vector3();
const _m = /*@__PURE__*/ new Matrix4();
const outlines = /*@__PURE__*/ new WeakMap<readonly SceneTarget[], { key: string; outline: FaceOnOutline }>();

/** The scene parts the body is drawn with: the targets and the background. */
export type OutlineParts = Readonly<{ targets: readonly SceneTarget[]; background?: Object3D }>;

/**
 * The gizmo body's face-on outline as the gizmo draws it at rest, in the scene's units at its current scale
 * (`TRIAD_SCENE_SCALE` while the triad shows), for {@link fieldOfViewDistance}. Face-on, the drawn half-size at
 * distance `d` is the largest `x / (d − z)` over the points drawn at `d`, so the distance holds it exactly. Read from
 * the geometry and place of each shown target, with the targets scaled as at rest (never as hovered), and of the
 * background; not the axis lines or the triad, which run outside the body. The sphere (orthographic) and a body with nothing drawn get the unit front edge.
 *
 * Each triangle counts as its material culls it. A flat plate facing the camera's axis is drawn only beyond the
 * distance where its plane crosses the axis (a corner plate turns away from a close camera), one facing across it
 * always or never (the classic cube's background, seen from inside, bounds its width), one facing away never. So the
 * classic cube's one-sided plates are held as exactly as the rounded cube's closed body, whose bevel moves the point
 * that bounds it toward a closer camera.
 *
 * The body is symmetric about its centre and under axis swaps, so its +Z face stands for every face.
 *
 * @param parts - The scene's targets and background
 * @param o - Resolved options; reads `type`, `triad`, `background` and the targets' styles
 * @returns Flat `[z0, x0, from0, …]`, nearest first, reduced to the points no other point is nearer, wider and drawn
 * from as far; kept for the scene until what it reads changes
 */
export function faceOnOutline({ targets, background }: OutlineParts, o: SceneOptions): FaceOnOutline {
  if (o.type === "sphere") return UNIT_FACE_OUTLINE;
  const scale = triadShown(o) ? TRIAD_SCENE_SCALE : 1;
  const shown = background && o.background.enabled && o.background.opacity > 0;
  // What the outline reads, so the camera, the lines and the triad share one reading per change.
  let key = `${scale}|${shown}`;
  for (const target of targets) {
    const { enabled, opacity, scale } = styleOf(o, target);
    key += `|${enabled && opacity > 0 ? scale : 0}:${target.idle.side}`;
  }
  const cached = outlines.get(targets);
  if (cached?.key === key) return cached.outline;
  const points: Array<[number, number, number]> = [];
  const add = (object: Object3D, size: number, material: Material) => {
    if (!(object instanceof Mesh)) return;
    const { geometry } = object;
    const position = geometry.attributes.position;
    const index = geometry.index!;
    const { side } = material;
    _m.compose(object.position, object.quaternion, _v.setScalar(size));
    for (let i = 0; i < index.count; i += 3) {
      _a.fromBufferAttribute(position, index.getX(i)).applyMatrix4(_m);
      _b.fromBufferAttribute(position, index.getX(i + 1)).applyMatrix4(_m).sub(_a);
      _n.fromBufferAttribute(position, index.getX(i + 2)).applyMatrix4(_m).sub(_a);
      // The front's normal (counter-clockwise winding): a camera at (0, 0, d) sees it when `(camera − a) · n > 0`.
      _n.crossVectors(_b, _n);
      if (side === BackSide) _n.negate();
      const across = _n.z * _n.z <= 1e-12 * _n.lengthSq();
      let from = -Infinity;
      if (side !== DoubleSide) {
        if (across ? _a.dot(_n) >= 0 : _n.z < 0) continue;
        if (!across) from = _a.dot(_n) / _n.z;
      }
      for (let k = 0; k < 3; k++) {
        _v.fromBufferAttribute(position, index.getX(i + k)).applyMatrix4(_m);
        if (_v.x > 0) points.push([_v.z, _v.x, from]);
      }
    }
  };
  for (const target of targets) {
    // At rest, as `restyleTargets` draws it unhovered: a hover shows a target hidden at opacity 0, and must not move
    // the camera at the next `set()`.
    const { enabled, opacity, scale } = styleOf(o, target);
    if (enabled && opacity > 0) add(target.object, scale, target.idle);
  }
  if (shown) add(background, 1, (background as Mesh).material as Material);
  // Nearest first; a point counts only if every nearer point drawn from as far is narrower.
  points.sort((a, b) => b[0] - a[0] || b[1] - a[1]);
  const outline: number[] = [];
  for (const [z, x, from] of points) {
    let covered = false;
    for (let i = 0; i < outline.length && !covered; i += 3)
      covered = outline[i + 1]! >= x * scale && outline[i + 2]! <= from * scale;
    if (!covered) outline.push(z * scale, x * scale, from * scale);
  }
  // Nothing drawn: 2.3.0's front edges, so the camera still has a place.
  const result = outline.length ? outline : UNIT_FACE_OUTLINE;
  outlines.set(targets, { key, outline: result });
  return result;
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
