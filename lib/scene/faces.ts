import { Matrix4, PlaneGeometry, Quaternion, Vector3, type BufferGeometry, type Texture } from "three";
import type { AxisEnd, LabelFrame } from "../orbit/labelFrame";
import type { TargetEntry } from "../orbit/targets";
import type { GizmoOptionsFallback } from "../types";
import { GIZMO_AXES } from "../utils/constants";
import { axesMap, cloneAxisMap } from "./axesMap";
import type { Disposable } from "./materials";
import { roundedRectangleGeometry } from "./roundedRectangleGeometry";
import type { SceneOptions } from "./build";

/** Where a target's geometry sits: local +Z points outward, local +X along its long side or its label's right. */
export type Placement = Readonly<{ position: Vector3; quaternion: Quaternion }>;

const _y = /*@__PURE__*/ new Vector3();
const _basis = /*@__PURE__*/ new Matrix4();

/** A placement at `position` with local +Z along `out` and local +X along `x`; both unit and perpendicular. */
export function placeAt(position: Vector3, out: Readonly<Vector3>, x: Readonly<Vector3>): Placement {
  _y.crossVectors(out, x);
  return { position, quaternion: new Quaternion().setFromRotationMatrix(_basis.makeBasis(x, _y, out)) };
}

/** The sum of a target's face directions: a face's axis, an edge's `(±1, ±1, 0)` or a corner's `(±1, ±1, ±1)`. */
export const cornerOf = (entry: TargetEntry, frame: LabelFrame): Vector3 =>
  entry.faces.reduce((sum, face) => sum.add(frame.faces[face].direction), new Vector3());

/**
 * A face at `distance` from the centre with its label's top towards the face's `textUp` from the label frame (O1), so
 * every face reads upright on every up and front. This replaces 2.x's per-up `rotateZ` turns of the poles.
 */
export function placeFace(entry: TargetEntry, frame: LabelFrame, distance = 1): Placement {
  const { direction, textUp } = frame.faces[entry.faces[0]];
  return placeAt(direction.clone().multiplyScalar(distance), direction, new Vector3().crossVectors(textUp, direction));
}

/**
 * The face geometry: a rounded rectangle on the cube; on the rounded cube a square by type (N1), since its edges and
 * corners do the rounding and `radius` sizes them.
 */
export function faceGeometry(o: SceneOptions): BufferGeometry {
  if (o.type !== "rounded-cube") return roundedRectangleGeometry(o.radius, o.smoothness);
  const side = 2 - 2 * o.edges.radius;
  return new PlaneGeometry(side, side);
}

/** The label textures of a scene. Every texture it hands out is its own and freed by its `dispose()`. */
export type LabelTextures = Disposable & {
  /** The texture of a face, by its axis end, or of every edge or corner sprite of the sphere. */
  texture(part: AxisEnd | "edge" | "corner", state: "idle" | "hover"): Texture;
  /** Redraws every texture in place for a cheap change: same textures, new pixels. */
  update(o: SceneOptions): void;
};

/** Makes the label textures for a build. S2's one-texture-per-label provider replaces {@link atlasLabels}. */
export type LabelProvider = (o: SceneOptions) => LabelTextures;

const ATLAS_ROWS = [...GIZMO_AXES, "corner", "edge"] as const;

/**
 * The 2.3.0 atlas as a label provider: one canvas, one clone per part and state with its cell locked at creation. Its
 * clones share one source, so a redraw uploads once.
 */
// ponytail: adapts 2.x `axesMap` until S2 lands `labels.ts`; the atlas always holds the sphere's edge and corner rows.
export const atlasLabels: LabelProvider = (o) => {
  const draw = (o: SceneOptions) =>
    axesMap({
      ...o,
      isSphere: o.type === "sphere",
      corners: { ...o.corners, enabled: true },
      edges: { ...o.edges, enabled: true },
    } as unknown as GizmoOptionsFallback);
  const atlas = draw(o);
  const textures = new Map<string, Texture>();
  return {
    texture(part, state) {
      const key = `${part}|${state}`;
      let texture = textures.get(key);
      if (!texture) textures.set(key, (texture = cloneAxisMap(atlas, ATLAS_ROWS.indexOf(part), state === "hover")));
      return texture;
    },
    update(next) {
      atlas.image = draw(next).image;
      for (const texture of textures.values()) texture.needsUpdate = true;
    },
    dispose() {
      for (const texture of textures.values()) texture.dispose();
      atlas.dispose();
    },
  };
};
