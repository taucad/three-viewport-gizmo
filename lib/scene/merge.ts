import { BufferAttribute, BufferGeometry } from "three";

/**
 * The gizmo's geometries merged into one indexed geometry, as three's `mergeGeometries` merges them without groups:
 * each attribute of the first geometry concatenated as `Float32`, and each index offset by the vertices before it (a
 * non-indexed geometry draws its vertices in order). Every geometry must carry the first one's attributes.
 *
 * Local so the root entry pulls in no `BufferGeometryUtils` (S3 gzip row).
 */
export function mergeGeometries(geometries: readonly BufferGeometry[]): BufferGeometry {
  const merged = new BufferGeometry();
  for (const [name, { itemSize }] of Object.entries(geometries[0].attributes)) {
    const values = geometries.flatMap((geometry) => Array.from(geometry.getAttribute(name).array as ArrayLike<number>));
    merged.setAttribute(name, new BufferAttribute(new Float32Array(values), itemSize));
  }
  const index: number[] = [];
  let offset = 0;
  for (const geometry of geometries) {
    const count = geometry.attributes.position.count;
    const own = geometry.index ? Array.from(geometry.index.array) : Array.from({ length: count }, (_, i) => i);
    for (const i of own) index.push(i + offset);
    offset += count;
  }
  return merged.setIndex(index);
}
