import { SphereGeometry, Vector3, type BufferGeometry } from "three";
import type { LabelFrame } from "../orbit/labelFrame";
import type { TargetEntry } from "../orbit/targets";
import type { SceneOptions } from "./build";
import { cornerOf, placeAt, type Placement } from "./faces";
import { roundedRectangleGeometry } from "./roundedRectangleGeometry";

/** A corner facing out along its diagonal, upright about the label up. */
export function placeCorner(entry: TargetEntry, frame: LabelFrame, o: SceneOptions): Placement {
  const inset = o.type === "rounded-cube" ? 1 - o.corners.radius : 0.85;
  const x = new Vector3().crossVectors(frame.up, entry.direction).normalize();
  return placeAt(cornerOf(entry, frame).multiplyScalar(inset), entry.direction, x);
}

/** The corner geometry: a rounded square on the cube, a sphere on the rounded cube. */
export function cornerGeometry(o: SceneOptions): BufferGeometry {
  const { radius, smoothness } = o.corners;
  return o.type === "rounded-cube"
    ? new SphereGeometry(radius, smoothness * 2, smoothness)
    : roundedRectangleGeometry(radius, smoothness);
}
