import { CylinderGeometry, type BufferGeometry } from "three";
import type { LabelFrame } from "../orbit/labelFrame";
import type { TargetEntry } from "../orbit/targets";
import type { SceneOptions } from "./build";
import { cornerOf, placeAt, type Placement } from "./faces";
import { roundedRectangleGeometry } from "./roundedRectangleGeometry";

/**
 * An edge along the frame axis that joins its faces, oriented by the label frame (R18): its long side is the positive
 * one of `right`, `up` or `front` that both faces are perpendicular to, never a fixed world Y.
 */
export function placeEdge(entry: TargetEntry, frame: LabelFrame, o: SceneOptions): Placement {
  const inset = o.type === "rounded-cube" ? 1 - o.edges.radius : 0.925;
  const along = [frame.right, frame.up, frame.front].find((axis) =>
    entry.faces.every((face) => frame.faces[face].direction.dot(axis) === 0)
  )!;
  return placeAt(cornerOf(entry, frame).multiplyScalar(inset), entry.direction, along);
}

/** The edge geometry, long along local X: a rounded bar on the cube, a cylinder on the rounded cube. */
export function edgeGeometry(o: SceneOptions): BufferGeometry {
  const { radius, smoothness } = o.edges;
  return o.type === "rounded-cube"
    ? new CylinderGeometry(radius, radius, 2 - 2 * radius, smoothness * 4).rotateZ(Math.PI / 2)
    : roundedRectangleGeometry(radius, smoothness, 1.2, 0.25);
}
