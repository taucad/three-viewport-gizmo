import { Vector3, type Vector3Like } from "three";
import type { GizmoUpAxis } from "../types";

/**
 * Right-handed frame `(e1, e2, u)` about an up axis `u`. Azimuth is measured
 * from `e1` toward `e2`; polar angle from `u`.
 */
export type OrbitFrame = {
  readonly e1: Readonly<Vector3>;
  readonly e2: Readonly<Vector3>;
  readonly u: Readonly<Vector3>;
  /** Azimuth of the Front face. Pole views are entered from this side, so their labels read upright. */
  readonly frontAzimuth: number;
};

const X = new Vector3(1, 0, 0);
const Y = new Vector3(0, 1, 0);
const Z = new Vector3(0, 0, 1);

/**
 * Cyclic permutations of the world axes, one per 2.x up axis.
 *
 * ponytail: the class still calls {@link orbitFrame}; K5 moves it to {@link orbitFrameAbout} and deletes both.
 */
const FRAMES: Record<GizmoUpAxis, OrbitFrame> = {
  y: { e1: Z, e2: X, u: Y, frontAzimuth: 0 },
  z: { e1: X, e2: Y, u: Z, frontAzimuth: -Math.PI / 2 },
  x: { e1: Y, e2: Z, u: X, frontAzimuth: 0 },
};

/** The orbit frame for an up axis. */
export const orbitFrame = (up: GizmoUpAxis): OrbitFrame => FRAMES[up];

/** Below this squared length the reference, projected off the up, has no direction. */
const DEGENERATE = 1e-12;

const AXES = [X, Y, Z] as const;

/**
 * The orbit frame about any unit vector `up` (R12, U8): `e1` is `reference` projected off `up`, so the reference sits
 * at azimuth 0. When `reference` is parallel to `up`, `e1` comes from the world axis least aligned with `up`.
 *
 * @param up - The orbit up; normalised here
 * @param reference - Usually the label front, so `frontAzimuth` is 0
 * @returns A new frame
 */
export function orbitFrameAbout(up: Readonly<Vector3Like>, reference: Readonly<Vector3Like>): OrbitFrame {
  const u = new Vector3().copy(up).normalize();
  const e1 = new Vector3().copy(reference).normalize();
  e1.addScaledVector(u, -e1.dot(u));

  if (e1.lengthSq() < DEGENERATE) {
    const least = AXES.reduce((best, axis) => (Math.abs(axis.dot(u)) < Math.abs(best.dot(u)) ? axis : best));
    e1.copy(least).addScaledVector(u, -least.dot(u));
  }

  e1.normalize();
  return { e1, e2: new Vector3().crossVectors(u, e1), u, frontAzimuth: 0 };
}
