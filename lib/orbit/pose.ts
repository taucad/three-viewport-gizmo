import { MathUtils, Matrix4, Quaternion, Vector3 } from "three";
import type { GizmoLimits } from "../types";
import type { OrbitFrame } from "./frame";

const { clamp } = MathUtils;

/**
 * A camera about a target: azimuth and polar angle in an {@link OrbitFrame}, and a roll residual about the line of
 * sight (L1). At rest the roll is 0; it is non-zero only inside a transition that eases it out.
 */
export type OrbitPose = {
  azimuth: number;
  polar: number;
  /** Radians about the line of sight from upright in the frame; positive turns the scene clockwise. Default 0. */
  roll?: number;
};

/** The camera state a pose is read from and written to. */
export type OrbitCamera = {
  readonly position: Vector3;
  readonly quaternion: Quaternion;
};

/** The polar angle stays this far off the poles, so position-based controllers keep the azimuth. */
export const POLE_EPSILON = 1e-4;

/** Below this `sin(polar)` the azimuth of a position is undefined and is read from the camera's right vector. */
export const POLE_SINE = 1e-3;

const TWO_PI = 2 * Math.PI;

const _back = /*@__PURE__*/ new Vector3();
const _right = /*@__PURE__*/ new Vector3();
const _up = /*@__PURE__*/ new Vector3();
const _screenUp = /*@__PURE__*/ new Vector3();
const _matrix = /*@__PURE__*/ new Matrix4();
const _roll = /*@__PURE__*/ new Quaternion();

/** Keeps the polar angle off the poles by {@link POLE_EPSILON}. */
export const clampPolar = (polar: number) => clamp(polar, POLE_EPSILON, Math.PI - POLE_EPSILON);

/** Wraps an angle to `(−π, π]`. */
export const wrapAngle = (angle: number) => angle - TWO_PI * Math.ceil((angle - Math.PI) / TWO_PI);

/** Whether both azimuth limits are finite, so they apply. */
export const hasAzimuthLimits = (limits: GizmoLimits | undefined) =>
  Number.isFinite(limits?.minAzimuthAngle) && Number.isFinite(limits?.maxAzimuthAngle);

/**
 * Clamps `pose` in place to `limits` and off the poles (U5). Azimuth limits follow `OrbitControls`: both must be
 * finite, and a window with `min > max` wraps through ±π.
 *
 * @returns `pose`
 */
export function clampPose<Pose extends OrbitPose>(pose: Pose, limits: GizmoLimits | undefined): Pose {
  const minPolar = Math.max(limits?.minPolarAngle ?? 0, POLE_EPSILON);
  const maxPolar = Math.min(limits?.maxPolarAngle ?? Math.PI, Math.PI - POLE_EPSILON);
  pose.polar = clamp(pose.polar, minPolar, Math.max(minPolar, maxPolar));
  if (!hasAzimuthLimits(limits)) return pose;

  // ponytail: OrbitControls.update()'s azimuth clamp, so limits read from attached controls agree with them.
  let min = limits!.minAzimuthAngle!;
  let max = limits!.maxAzimuthAngle!;
  if (min < -Math.PI) min += TWO_PI;
  else if (min > Math.PI) min -= TWO_PI;
  if (max < -Math.PI) max += TWO_PI;
  else if (max > Math.PI) max -= TWO_PI;
  const theta = wrapAngle(pose.azimuth);
  pose.azimuth =
    min <= max ? clamp(theta, min, max) : theta > (min + max) / 2 ? Math.max(min, theta) : Math.min(max, theta);
  return pose;
}

/**
 * The orientation of `pose`: the upright basis (right, up, back) of its two angles, turned by its roll about the line
 * of sight. With no roll it equals `lookAt` with the frame's up.
 *
 * @returns `out`
 */
export function poseQuaternion(pose: Readonly<OrbitPose>, { e1, e2, u }: OrbitFrame, out: Quaternion): Quaternion {
  const { azimuth } = pose;
  const polar = clampPolar(pose.polar);
  const sinPolar = Math.sin(polar);

  _back
    .copy(e1)
    .multiplyScalar(sinPolar * Math.cos(azimuth))
    .addScaledVector(e2, sinPolar * Math.sin(azimuth))
    .addScaledVector(u, Math.cos(polar));
  _right.copy(e1).multiplyScalar(-Math.sin(azimuth)).addScaledVector(e2, Math.cos(azimuth));
  _up.crossVectors(_back, _right);

  out.setFromRotationMatrix(_matrix.makeBasis(_right, _up, _back));
  const { roll } = pose;
  if (roll) {
    // setFromAxisAngle, inlined: a double passed to a call the JIT does not inline is boxed (I4).
    const s = Math.sin(roll / 2);
    out.premultiply(_roll.set(_back.x * s, _back.y * s, _back.z * s, Math.cos(roll / 2)));
  }
  return out;
}

/** Places the camera at `pose`, `radius` from `target`. */
export function writePose(
  camera: OrbitCamera,
  pose: Readonly<OrbitPose>,
  frame: OrbitFrame,
  target: Readonly<Vector3>,
  radius: number
) {
  poseQuaternion(pose, frame, camera.quaternion);
  camera.position.copy(target).addScaledVector(_back, radius);
}

/**
 * Reads the pose of a camera looking at `target`, with its roll from upright in `frame`. At a pole, where the position
 * carries no azimuth, the azimuth comes from the camera's right vector and the roll is 0.
 *
 * @returns A new pose
 */
export function readPose(
  camera: OrbitCamera,
  { e1, e2, u }: OrbitFrame,
  target: Readonly<Vector3>
): Required<OrbitPose> {
  _back.subVectors(camera.position, target).normalize();
  const polar = Math.acos(clamp(_back.dot(u), -1, 1));

  if (!(Math.sin(polar) > POLE_SINE)) {
    _right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    return { azimuth: Math.atan2(-_right.dot(e1), _right.dot(e2)), polar: clampPolar(polar), roll: 0 };
  }

  const azimuth = Math.atan2(_back.dot(e2), _back.dot(e1));
  _right.copy(e1).multiplyScalar(-Math.sin(azimuth)).addScaledVector(e2, Math.cos(azimuth));
  _up.crossVectors(_back, _right);
  _screenUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
  const roll = Math.atan2(_right.crossVectors(_up, _screenUp).dot(_back), _up.dot(_screenUp));

  return { azimuth, polar: clampPolar(polar), roll };
}

/** The pose that looks from `direction` toward the target. Poles take the Front azimuth. */
export function targetPose(direction: Readonly<Vector3>, frame: OrbitFrame): OrbitPose {
  const { e1, e2, u, frontAzimuth } = frame;
  _back.copy(direction).normalize();
  const polar = Math.acos(clamp(_back.dot(u), -1, 1));
  const azimuth = Math.sin(polar) > POLE_SINE ? Math.atan2(_back.dot(e2), _back.dot(e1)) : frontAzimuth;

  return { azimuth, polar: clampPolar(polar) };
}
