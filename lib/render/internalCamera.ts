import { MathUtils, PerspectiveCamera } from "three";
import { ViewportGizmoError } from "../errors";

/** The 2.3.0 vertical field of view of the cube's camera, in radians (26°). */
export const DEFAULT_FIELD_OF_VIEW = 26 * MathUtils.DEG2RAD;

/** Camera distance at {@link DEFAULT_FIELD_OF_VIEW}. */
const BASE_DISTANCE = 7;

/**
 * The gizmo body's face-on outline: flat `[z0, x0, from0, z1, x1, from1, …]` (depth toward the camera, signed
 * horizontal extent, nearest camera distance that draws it) points in the gizmo's world units, from `faceOnOutline`.
 * Its drawn width at camera distance `d` is the largest `x / (d − z)` to the right plus the largest `−x / (d − z)` to
 * the left, over the points with `from ≤ d`: a one-sided plate facing the camera's axis shows only beyond the distance
 * where its plane crosses that axis (`-Infinity`: always drawn).
 */
export type FaceOnOutline = readonly number[];

/** The unit cube's front edges, 2.3.0's model of the outline: half-width 1 at depth 1 each side, always drawn. */
export const UNIT_FACE_OUTLINE: FaceOnOutline = [1, 1, -Infinity, 1, -1, -Infinity];

/** Half the sphere's 2.3.0 orthographic frustum: its size at the default field of view. */
export const SPHERE_HALF_HEIGHT = 1.8;

/** Clip margins in front of and behind the origin: 2.3.0's near 5 and far 10 at distance 7. */
const NEAR_MARGIN = 2;
const FAR_MARGIN = 3;

/** Smallest near plane, for wide fields of view that bring the camera inside the near margin. */
const MIN_NEAR = 0.01;

/**
 * The camera distance that draws `outline` face-on at its 2.3.0 width under `fieldOfView`: the cube types' width at
 * the default field of view and distance 7, or the sphere's in its orthographic ±1.8 frustum. Exact, in closed form:
 * the width is the largest sum over a point each side, `x_r / (d − z_r) − x_l / (d − z_l)`, each sum falls as `d`
 * grows, so the width is at most its target `w` exactly when `d` is at least every pair's larger root of
 * `x_r / (d − z_r) − x_l / (d − z_l) = w` (a quadratic; a point at `x = 0` stands on either side, for a side with
 * nothing drawn). One-sided plates draw only
 * from their `from`, so from the nearest any point can be each pass adds the pairs drawn from a camera that far, until
 * none moves it. This holds the outline the gizmo draws (the cube's plates and background, the rounded cube's arc, the
 * sphere's sprites, smaller on its negative ends, the triad's scale), not one depth; for {@link UNIT_FACE_OUTLINE} it
 * is 2.3.0's `1 + 6 · tan(13°) / tan(fieldOfView / 2)`.
 *
 * @param fieldOfView - Vertical field of view in radians, in `(0, π)`
 * @param outline - The drawn body's face-on outline
 * @param sphere - Whether the 2.3.0 width is the sphere's orthographic one
 * @returns The distance from the gizmo's origin to its camera; 7 for a cube type at the default field of view
 */
export const fieldOfViewDistance = (
  fieldOfView: number,
  outline: FaceOnOutline = UNIT_FACE_OUTLINE,
  sphere = false
): number => {
  if (fieldOfView === DEFAULT_FIELD_OF_VIEW && !sphere) return BASE_DISTANCE;
  const base = Math.tan(DEFAULT_FIELD_OF_VIEW / 2);
  const n = outline.length;
  // Each side's 2.3.0 half-width, in units of the view's half-height at the origin.
  let right = 0;
  let left = 0;
  let distance = -Infinity;
  for (let i = 0; i < n; i += 3) {
    const z = outline[i]!;
    const x = outline[i + 1]!;
    const half = outline[i + 2]! <= BASE_DISTANCE ? x / (sphere ? SPHERE_HALF_HEIGHT : (BASE_DISTANCE - z) * base) : 0;
    if (half > right) right = half;
    if (-half > left) left = -half;
    if (z > distance) distance = z;
  }
  const w = (right + left) * Math.tan(fieldOfView / 2);
  for (let previous = NaN; distance !== previous; ) {
    previous = distance;
    for (let i = 0; i < n; i += 3) {
      const zr = outline[i]!;
      const xr = outline[i + 1]!;
      if (xr < 0 || outline[i + 2]! > previous) continue;
      for (let j = 0; j < n; j += 3) {
        const zl = outline[j]!;
        const xl = outline[j + 1]!;
        if (xl > 0 || outline[j + 2]! > previous) continue;
        // w·d² − b·d + c = 0, from `xr · (d − zl) − xl · (d − zr) = w · (d − zr) · (d − zl)`.
        const b = w * (zr + zl) + xr - xl;
        const c = w * zr * zl + xr * zl - xl * zr;
        distance = Math.max(distance, (b + Math.sqrt(b * b - 4 * w * c)) / (2 * w));
      }
    }
  }
  return distance;
};

/**
 * Applies `fieldOfView` to the gizmo's own camera in place: field of view, distance, near and far, then the
 * projection. Touches no geometry, material or scene object, so it compiles nothing.
 *
 * @param camera - The camera from {@link createInternalCamera}
 * @param fieldOfView - Vertical field of view in radians, in `(0, π)`
 * @param outline - The drawn body's face-on outline, whose size the distance keeps
 * @param sphere - Whether the gizmo is the sphere, which keeps its 2.3.0 orthographic size
 * @throws {ViewportGizmoError} `INVALID_OPTION` when `fieldOfView` is not a finite number in `(0, π)`
 */
export const setFieldOfView = (
  camera: PerspectiveCamera,
  fieldOfView: number,
  outline: FaceOnOutline = UNIT_FACE_OUTLINE,
  sphere = false
): void => {
  if (!(Number.isFinite(fieldOfView) && fieldOfView > 0 && fieldOfView < Math.PI)) {
    throw new ViewportGizmoError(
      "INVALID_OPTION",
      `fieldOfView must be radians in (0, π), got ${fieldOfView}; three.js's \`fov\` is degrees, convert with MathUtils.degToRad.`
    );
  }
  const distance = fieldOfViewDistance(fieldOfView, outline, sphere);
  camera.fov = fieldOfView * MathUtils.RAD2DEG;
  camera.position.set(0, 0, distance);
  camera.near = Math.max(MIN_NEAR, distance - NEAR_MARGIN);
  camera.far = distance + FAR_MARGIN;
  camera.updateProjectionMatrix();
};

/**
 * Creates the gizmo's own camera, a perspective camera for every type. At the default field of view a cube type's
 * matches 2.3.0 exactly (26°, distance 7, near 5, far 10), and the sphere draws its face-on outline at the size of
 * 2.3.0's orthographic camera.
 *
 * @param isSphere - Whether the gizmo type is `sphere`
 * @param fieldOfView - Vertical field of view in radians
 * @param outline - The drawn body's face-on outline
 * @returns The camera, looking down -z at the origin
 */
export const createInternalCamera = (
  isSphere: boolean,
  fieldOfView = DEFAULT_FIELD_OF_VIEW,
  outline: FaceOnOutline = UNIT_FACE_OUTLINE
): PerspectiveCamera => {
  const camera = new PerspectiveCamera();
  setFieldOfView(camera, fieldOfView, outline, isSphere);
  return camera;
};
