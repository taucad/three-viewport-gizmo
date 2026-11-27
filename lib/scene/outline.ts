import { BackSide, DoubleSide, Matrix4, Mesh, Sprite, Vector3, type Material, type Object3D } from "three";
import { fieldOfViewDistance, UNIT_FACE_OUTLINE, type FaceOnOutline } from "../render/internalCamera";
import type { SceneOptions, SceneTarget } from "./build";
import { styleOf } from "./update";

/** The scene's scale while the triad shows, as Tau draws it: the cube shrinks to give the axes and labels room. */
export const TRIAD_SCENE_SCALE = 0.7;

/** Whether the triad shows for these options: on, and a cube type. */
export const triadShown = (o: Pick<SceneOptions, "type" | "triad">): boolean => o.type !== "sphere" && o.triad.enabled;

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
 * (`TRIAD_SCENE_SCALE` while the triad shows), for {@link fieldOfViewDistance}. Face-on, the drawn width at distance
 * `d` is the largest `x / (d − z)` right of the centre plus the largest `−x / (d − z)` left of it, over the points drawn
 * at `d`, so the distance holds it exactly. Read from the geometry and place of each shown target, with the targets
 * scaled as at rest (never as hovered), and of the background; not the axis lines or the triad, which run outside the
 * body. A body with nothing drawn gets the unit front edges.
 *
 * - Cube types: each triangle as its material culls it. A flat plate facing the camera's axis is drawn only beyond the
 *   distance where its plane crosses the axis (a corner plate turns away from a close camera), one facing across it
 *   always or never (the classic cube's background, seen from inside, bounds its width), one facing away never. So the
 *   classic cube's one-sided plates are held as exactly as the rounded cube's closed body, whose bevel moves the point
 *   that bounds it toward a closer camera.
 * - `sphere`: each shown sprite, a camera-facing square of side `scale` about its place, always drawn. Its background
 *   disc fills the element at every field of view (`background.ts`) and is not part of the body.
 *
 * Each side counts on its own, so a lopsided body (the sphere's smaller negative ends) keeps its width. The cube types
 * are symmetric under axis swaps, and the sphere's widest sprites sit at depth 0 in every face-on view, so the +Z face
 * stands for every face.
 *
 * @param parts - The scene's targets and background
 * @param o - Resolved options; reads `type`, `triad`, `background` and the targets' styles
 * @returns Flat `[z0, x0, from0, …]`: the centre, then nearest first the points no other point on their side is
 * nearer, wider and drawn from as far; kept for the scene until what it reads changes
 */
export function faceOnOutline({ targets, background }: OutlineParts, o: SceneOptions): FaceOnOutline {
  const scale = triadShown(o) ? TRIAD_SCENE_SCALE : 1;
  const shown = background && o.type !== "sphere" && o.background.enabled && o.background.opacity > 0;
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
    if (object instanceof Sprite) {
      const { x, z } = object.position;
      points.push([z, x + size / 2, -Infinity], [z, x - size / 2, -Infinity]);
      return;
    }
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
        points.push([_v.z, _v.x, from]);
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
  // Nearest first; a point counts only if every nearer point on its side drawn from as far is narrower.
  points.sort((a, b) => b[0] - a[0] || Math.abs(b[1]) - Math.abs(a[1]));
  // The centre, always drawn, so a side with nothing on it adds 0 (`fieldOfViewDistance`).
  const outline: number[] = [0, 0, -Infinity];
  for (const [z, x, from] of points) {
    let covered = x === 0;
    for (let i = 0; i < outline.length && !covered; i += 3)
      covered = outline[i + 1]! / (x * scale) >= 1 && outline[i + 2]! <= from * scale;
    if (!covered) outline.push(z * scale, x * scale, from * scale);
  }
  // Nothing drawn: 2.3.0's front edges, so the camera still has a place.
  const result = outline.length > 3 ? outline : UNIT_FACE_OUTLINE;
  outlines.set(targets, { key, outline: result });
  return result;
}

/**
 * Screen pixels per world unit at the gizmo's origin, for the gizmo's own camera drawn `size` pixels tall at its
 * field-of-view distance for `outline`.
 *
 * @param options - Resolved options; reads `type`, `size` and `fieldOfView`
 * @param outline - From {@link faceOnOutline}, as the camera is placed with
 * @returns CSS pixels per world unit; independent of the host canvas size and device pixel ratio
 */
export const pixelsPerUnit = (
  { type, size, fieldOfView }: Pick<SceneOptions, "type" | "size" | "fieldOfView">,
  outline: FaceOnOutline = UNIT_FACE_OUTLINE
): number => size / (2 * fieldOfViewDistance(fieldOfView, outline, type === "sphere") * Math.tan(fieldOfView / 2));
