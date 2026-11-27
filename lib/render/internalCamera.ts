import { MathUtils, OrthographicCamera, PerspectiveCamera } from "three";
import { ViewportGizmoError } from "../errors";

/** The 2.3.0 vertical field of view of the cube's camera, in radians (26°). */
export const DEFAULT_FIELD_OF_VIEW = 26 * MathUtils.DEG2RAD;

/** Camera distance at {@link DEFAULT_FIELD_OF_VIEW}. */
const BASE_DISTANCE = 7;

/**
 * The gizmo body's face-on outline: flat `[z0, x0, from0, z1, x1, from1, …]` (depth toward the camera, half-width,
 * nearest camera distance that draws it) points in the gizmo's world units, from `faceOnOutline`. Its drawn half-size
 * at camera distance `d` is the largest `x / (d − z)` over the points with `from ≤ d`: a one-sided plate facing the
 * camera's axis shows only beyond the distance where its plane crosses that axis (`-Infinity`: always drawn).
 */
export type FaceOnOutline = readonly number[];

/** The unit cube's front edge, 2.3.0's model of the outline: half-width 1 at depth 1, always drawn. */
export const UNIT_FACE_OUTLINE: FaceOnOutline = [1, 1, -Infinity];

/** Clip margins in front of and behind the origin: 2.3.0's near 5 and far 10 at distance 7. */
const NEAR_MARGIN = 2;
const FAR_MARGIN = 3;

/** Smallest near plane, for wide fields of view that bring the camera inside the near margin. */
const MIN_NEAR = 0.01;

/**
 * The camera distance that draws `outline` face-on at its size at the default field of view and distance 7 (2.3.0's
 * camera), under `fieldOfView`. Exact, in closed form: the drawn half-size of the points drawn at `d`,
 * `max x / ((d − z) · tan(fieldOfView / 2))`, falls as `d` grows and is at most `h` exactly when
 * `d ≥ z + x / (h · tan(fieldOfView / 2))` for each of them. One-sided plates draw only from their `from`, so from the
 * nearest any point can be, each pass adds the points drawn from a camera that far, until none moves it. This holds
 * the outline the gizmo draws (the cube's plates and background, the rounded cube's arc, the triad's scale), not one
 * depth; for {@link UNIT_FACE_OUTLINE} it is 2.3.0's `1 + 6 · tan(13°) / tan(fieldOfView / 2)`.
 *
 * @param fieldOfView - Vertical field of view in radians, in `(0, π)`
 * @param outline - The drawn body's face-on outline
 * @returns The distance from the gizmo's origin to its camera; 7 at the default field of view for any outline
 */
export const fieldOfViewDistance = (fieldOfView: number, outline: FaceOnOutline = UNIT_FACE_OUTLINE): number => {
  if (fieldOfView === DEFAULT_FIELD_OF_VIEW) return BASE_DISTANCE;
  const base = Math.tan(DEFAULT_FIELD_OF_VIEW / 2);
  let half = 0;
  let distance = -Infinity;
  for (let i = 0; i < outline.length; i += 3) {
    if (outline[i + 2]! <= BASE_DISTANCE) half = Math.max(half, outline[i + 1]! / ((BASE_DISTANCE - outline[i]!) * base));
    distance = Math.max(distance, outline[i]!);
  }
  const t = half * Math.tan(fieldOfView / 2);
  for (let previous = NaN; distance !== previous; ) {
    previous = distance;
    for (let i = 0; i < outline.length; i += 3)
      if (outline[i + 2]! <= previous) distance = Math.max(distance, outline[i]! + outline[i + 1]! / t);
  }
  return distance;
};

/**
 * Applies `fieldOfView` to the gizmo's own camera in place: field of view, distance, near and far, then the
 * projection. Touches no geometry, material or scene object, so it compiles nothing. An orthographic camera
 * (the sphere) has no field of view and is left unchanged.
 *
 * @param camera - The camera from {@link createInternalCamera}
 * @param fieldOfView - Vertical field of view in radians, in `(0, π)`
 * @param outline - The drawn body's face-on outline, whose size the distance keeps
 * @throws {ViewportGizmoError} `INVALID_OPTION` when `fieldOfView` is not a finite number in `(0, π)`
 */
export const setFieldOfView = (
  camera: PerspectiveCamera | OrthographicCamera,
  fieldOfView: number,
  outline: FaceOnOutline = UNIT_FACE_OUTLINE
): void => {
  if (!(Number.isFinite(fieldOfView) && fieldOfView > 0 && fieldOfView < Math.PI)) {
    throw new ViewportGizmoError(
      "INVALID_OPTION",
      `fieldOfView must be radians in (0, π), got ${fieldOfView}; three.js's \`fov\` is degrees, convert with MathUtils.degToRad.`
    );
  }
  if (!(camera instanceof PerspectiveCamera)) return;

  const distance = fieldOfViewDistance(fieldOfView, outline);
  camera.fov = fieldOfView * MathUtils.RAD2DEG;
  camera.position.set(0, 0, distance);
  camera.near = Math.max(MIN_NEAR, distance - NEAR_MARGIN);
  camera.far = distance + FAR_MARGIN;
  camera.updateProjectionMatrix();
};

/**
 * Creates the gizmo's own camera: orthographic for the sphere, perspective for the cube types.
 * At the default field of view it matches 2.3.0 exactly (26°, distance 7, near 5, far 10).
 *
 * @param isSphere - Whether the gizmo type is `sphere`
 * @param fieldOfView - Vertical field of view in radians; ignored by the sphere
 * @param outline - The drawn body's face-on outline; ignored by the sphere
 * @returns The camera, looking down -z at the origin
 */
export const createInternalCamera = (
  isSphere: boolean,
  fieldOfView = DEFAULT_FIELD_OF_VIEW,
  outline: FaceOnOutline = UNIT_FACE_OUTLINE
): PerspectiveCamera | OrthographicCamera => {
  if (isSphere) {
    const camera = new OrthographicCamera(-1.8, 1.8, 1.8, -1.8, 5, 10);
    camera.position.set(0, 0, BASE_DISTANCE);
    return camera;
  }
  const camera = new PerspectiveCamera();
  setFieldOfView(camera, fieldOfView, outline);
  return camera;
};
