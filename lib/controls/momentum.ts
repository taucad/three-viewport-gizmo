// Stops the motion three's controllers keep up on their own after a drag, when the gizmo takes the camera (P13 H1).
// Disabling the controls stops their input, not their motion: OrbitControls' damping and TrackballControls' inertia
// run in `update()`, which a host calls every frame whatever `enabled` is, and ArcballControls' animation runs on its
// own animation frames. Left alone, they carry the camera off the view a gizmo turn reached. None of the three has a
// public stop, so this reads their private fields, as `orbitControls.ts` does for the cached up. OrbitControls and
// TrackballControls keep that state in closures before three 0.168, where it cannot be reached; there is nothing to do.
// camera-controls needs nothing: its adapter asks the host to skip `update()` while disabled and hands it the pose.
// ponytail: delete a branch when three.js ships a public stop for that controller.

type Settable = { set(...values: number[]): unknown };
type Copyable = { copy(from: unknown): unknown };

/** OrbitControls and MapControls from three 0.168: the rotation and pan still to apply under damping. */
type OrbitMomentum = { _sphericalDelta: Settable; _panOffset: Settable & { isVector3: true } };

/** TrackballControls from three 0.168: the inertia's angle, and the pointer and wheel deltas it eases toward. */
type TrackballMomentum = {
  _lastAngle: number;
  _lastRollAngle?: number;
  _movePrev: Copyable;
  _moveCurr: object;
  _zoomStart: Copyable;
  _zoomEnd: object;
  _panStart: Copyable;
  _panEnd: object;
};

/** ArcballControls: the animation frame of its rotation or focus animation, `-1` when none runs. */
type ArcballMomentum = { _animationId: number; _timeStart: number };

const isVector = (value: unknown, flag: "isVector2" | "isVector3"): boolean =>
  (value as Record<string, unknown> | undefined)?.[flag] === true;

const isOrbit = (c: object): c is OrbitMomentum => {
  const o = c as Partial<OrbitMomentum>;
  return typeof o._sphericalDelta?.set === "function" && isVector(o._panOffset, "isVector3");
};

const isTrackball = (c: object): c is TrackballMomentum => {
  const t = c as Partial<Record<keyof TrackballMomentum, unknown>>;
  return (
    typeof t._lastAngle === "number" &&
    (["_movePrev", "_moveCurr", "_zoomStart", "_zoomEnd", "_panStart", "_panEnd"] as const).every((k) => isVector(t[k], "isVector2"))
  );
};

const isArcball = (c: object): c is ArcballMomentum =>
  typeof (c as Partial<ArcballMomentum>)._animationId === "number" && typeof (c as Partial<ArcballMomentum>)._timeStart === "number";

/**
 * Stops the motion the controls keep up on their own: OrbitControls' damping, TrackballControls' inertia and
 * ArcballControls' rotation or focus animation. Does nothing for other controls.
 *
 * @param controls - The attached controls
 */
export const stopMomentum = (controls: object): void => {
  if (isOrbit(controls)) {
    controls._sphericalDelta.set(0, 0, 0);
    controls._panOffset.set(0, 0, 0);
  } else if (isTrackball(controls)) {
    controls._lastAngle = 0;
    if (typeof controls._lastRollAngle === "number") controls._lastRollAngle = 0;
    controls._movePrev.copy(controls._moveCurr);
    controls._zoomStart.copy(controls._zoomEnd);
    controls._panStart.copy(controls._panEnd);
  } else if (isArcball(controls) && controls._animationId !== -1) {
    // What its own pointer-down does to an animation. Its state stays until its next gesture sets one.
    globalThis.cancelAnimationFrame?.(controls._animationId);
    controls._animationId = -1;
    controls._timeStart = -1;
  }
};
