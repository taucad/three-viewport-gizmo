import { BoxGeometry, CylinderGeometry, PlaneGeometry, type BufferGeometry } from "three";
import { mergeGeometries as threeMerge } from "three/addons/utils/BufferGeometryUtils.js";
import { describe, expect, it } from "vitest";
import { roundedRectangleGeometry } from "./roundedRectangleGeometry";
import { mergeGeometries } from "./merge";

/** Every attribute and the index as plain arrays, so a typed-array kind does not matter. */
const contents = (geometry: BufferGeometry) => ({
  attributes: Object.fromEntries(
    Object.entries(geometry.attributes).map(([name, a]) => [name, { itemSize: a.itemSize, array: Array.from(a.array) }])
  ),
  index: geometry.index ? Array.from(geometry.index.array) : null,
});

describe("mergeGeometries", () => {
  it("matches three's merge of indexed geometries, as the axis lines and the cube faces merge them", () => {
    const parts = [
      new CylinderGeometry(1, 1, 1, 8).rotateX(1),
      new CylinderGeometry(1, 1, 1, 8).translate(0, 2, 0),
      new BoxGeometry(),
    ];
    for (const part of parts) part.deleteAttribute("uv");
    expect(contents(mergeGeometries(parts))).toEqual(contents(threeMerge(parts)));

    const faces = [roundedRectangleGeometry(0.2, 4), roundedRectangleGeometry(0.1, 2).translate(0, 0, 1)];
    expect(contents(mergeGeometries(faces))).toEqual(contents(threeMerge(faces)));
  });

  it("indexes non-indexed geometries in vertex order, as `meshAttributes` would after three's merge", () => {
    const parts = [new PlaneGeometry().toNonIndexed(), new PlaneGeometry().translate(1, 0, 0).toNonIndexed()];
    const merged = mergeGeometries(parts);
    const reference = threeMerge(parts);
    expect(contents(merged).attributes).toEqual(contents(reference).attributes);
    expect(contents(merged).index).toEqual(Array.from({ length: reference.attributes.position.count }, (_, i) => i));
  });
});
