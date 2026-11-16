import {
  BackSide,
  BufferAttribute,
  Color,
  CylinderGeometry,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Sprite,
  Vector3,
  type BufferGeometry,
  type Material,
  type Object3D,
  type SpriteMaterial,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { labelFrame, type AxisEnd, type LabelFrame } from "../orbit/labelFrame";
import { targetTable, type TargetEntry } from "../orbit/targets";
import type { GizmoResolvedOptions, GizmoTarget, GizmoTargetKind } from "../types";
import { GIZMO_AXES, GIZMO_SPHERE_AXES_DISTANCE } from "../utils/constants";
import { cornerGeometry, placeCorner } from "./corners";
import { edgeGeometry, placeEdge } from "./edges";
import { atlasLabels, faceGeometry, placeFace, type LabelProvider, type LabelTextures, type Placement } from "./faces";
import type { Owned } from "./materials";
import { roundedBoxGeometry } from "./roundedBox";
import { restyleTargets, targetMaterials, targetOf } from "./update";

type DeepRequired<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends { isColor: true } | { isVector3: true }
    ? T
    : T extends object
      ? { [Key in keyof T]-?: DeepRequired<Exclude<T[Key], undefined>> }
      : T;

// ponytail: local until lane K exports a deep-required `GizmoResolvedOptions` (N1's type request); then alias it.
/** Resolved options as the scene reads them: every default filled by `resolveOptions`. */
export type SceneOptions = DeepRequired<Omit<GizmoResolvedOptions, "container" | "onMaterial">> &
  Pick<GizmoResolvedOptions, "onMaterial">;

/** One of the 26 targets as built. Hidden kinds and targets are built too, so `enabled` is a `visible` flag (U10). */
export type SceneTarget = {
  /** The target as data; its `label` follows cheap label changes. */
  target: GizmoTarget;
  readonly entry: TargetEntry;
  /** A face's axis end, whose options style it; null for an edge or corner. */
  readonly end: AxisEnd | null;
  readonly object: Mesh<BufferGeometry, Material> | Sprite;
  idle: Material;
  hover: Material;
};

/** A part that is not a target: built on a structural change, restyled in place on a cheap one. */
export type ScenePart = Readonly<{ object: Object3D; update(o: SceneOptions, pointerOver: boolean): void }>;

/** Builds one part from the options and the placed targets; registers whatever it creates in `owned`. */
export type PartBuilder = (o: SceneOptions, scene: Readonly<{ frame: LabelFrame; targets: readonly SceneTarget[] }>, owned: Owned) => ScenePart;

/** A target's geometry and where it sits. The geometry is registered in `owned` by the provider. */
export type PlacedGeometry = Readonly<{ geometry: BufferGeometry }> & Placement;

/** The geometry of every target for one cube type. */
export type GeometryProvider = (o: SceneOptions, frame: LabelFrame, owned: Owned) => (entry: TargetEntry) => PlacedGeometry;

/** The seams later tasks fill: labels (S2), axis lines (S3), background (S4), cube geometry (S5), triad (S6). */
export type SceneBuilders = Readonly<{
  labels: LabelProvider;
  geometry: Readonly<Record<"cube" | "rounded-cube", GeometryProvider>>;
  lines: PartBuilder;
  background: PartBuilder;
  triad: PartBuilder;
}>;

/** A built gizmo scene. Add `group` under the gizmo's `root`; free it with {@link disposeScene}. */
export type GizmoScene = {
  readonly group: Group;
  readonly frame: LabelFrame;
  /** All 26, in `targetTable` order. */
  readonly targets: readonly SceneTarget[];
  readonly parts: Readonly<{ background: ScenePart; lines: ScenePart; triad: ScenePart }>;
  readonly labels: LabelTextures;
  /** Everything the scene created, and only that (P1). */
  readonly owned: Owned;
  /** The target materials by style key (P8). */
  materials: Map<string, Material>;
  options: SceneOptions;
  hovered: GizmoTarget["name"] | null;
  pointerOver: boolean;
};

const PARTS: Readonly<Record<GizmoTargetKind, (entry: TargetEntry, frame: LabelFrame) => Placement>> = {
  face: (entry, frame) => placeFace(entry, frame),
  edge: placeEdge,
  corner: placeCorner,
};

/** The cube: one shared geometry per kind. */
const cubeGeometry: GeometryProvider = (o, frame, owned) => {
  const geometry = { face: faceGeometry(o), edge: edgeGeometry(o), corner: cornerGeometry(o) };
  Object.values(geometry).forEach((g) => owned.add(g));
  return (entry) => ({ geometry: geometry[entry.kind], ...PARTS[entry.kind](entry, frame) });
};

const Y = /*@__PURE__*/ new Vector3(0, 1, 0);
const _color = /*@__PURE__*/ new Color();

/**
 * One line per axis end, built whether or not it is drawn so `line` and `enabled` are `visible` flags (N1), with one
 * vertex-coloured material for all six.
 */
// ponytail: world-space cylinders sized from `lineWidth` and `size`; S3's `axisLines.ts` replaces them.
const axisLines: PartBuilder = (_, { frame }, owned) => {
  const material = new MeshBasicMaterial({ vertexColors: true, toneMapped: false });
  owned.add(material);
  const object = new Group();
  const lines = GIZMO_AXES.map((end) => {
    const geometry = new CylinderGeometry(1, 1, 1, 8).translate(0, 0.5, 0);
    geometry.setAttribute("color", new BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3));
    owned.add(geometry);
    const mesh = new Mesh(geometry, material);
    mesh.quaternion.setFromUnitVectors(Y, frame.byEnd[end].direction);
    object.add(mesh);
    return [end, mesh] as const;
  });
  return {
    object,
    update(o) {
      const radius = (o.lineWidth * 1.8) / o.size;
      for (const [end, mesh] of lines) {
        const { enabled, line, scale, color } = o[end];
        mesh.visible = enabled && line;
        mesh.scale.set(radius, o.type === "sphere" ? GIZMO_SPHERE_AXES_DISTANCE - scale / 2 : 0.975, radius);
        const colors = mesh.geometry.attributes.color as BufferAttribute;
        const { r, g, b } = _color.set(color);
        for (let i = 0; i < colors.count; i++) colors.setXYZ(i, r, g, b);
        colors.needsUpdate = true;
      }
    },
  };
};

/**
 * The 2.3.0 background: on the sphere a back-facing sphere, on the cubes the faces merged at 0.9 scale. Its colour
 * follows the pointer being over the gizmo.
 */
// ponytail: S4's camera-facing disc replaces the sphere's 8,000-triangle sphere.
const background: PartBuilder = (o, { targets }, owned) => {
  const material = new MeshBasicMaterial({ side: BackSide, transparent: true, depthWrite: false, toneMapped: false });
  const scale = new Vector3().setScalar(0.9);
  const geometry =
    o.type === "sphere"
      ? new SphereGeometry(1.8, 64, 64)
      : mergeGeometries(
          targets
            .filter(({ end }) => end)
            .map(({ object }) =>
              (object as Mesh).geometry.clone().applyMatrix4(new Matrix4().compose(object.position, object.quaternion, scale))
            )
        );
  owned.add(material).add(geometry);
  const object = new Mesh(geometry, material);
  return {
    object,
    update(o, over) {
      const { enabled, color, opacity, hover } = o.background;
      object.visible = enabled;
      material.color.set(over ? hover.color : color);
      material.opacity = over ? hover.opacity : opacity;
    },
  };
};

/** An empty slot for S6's axis triad. */
const triad: PartBuilder = () => ({ object: new Group(), update() {} });

/** The 2.3.0 look on the new build: S2 to S6 replace one builder each. */
export const DEFAULT_BUILDERS: SceneBuilders = {
  labels: atlasLabels,
  geometry: { cube: cubeGeometry, "rounded-cube": roundedBoxGeometry },
  lines: axisLines,
  background,
  triad,
};

/**
 * Builds the gizmo scene for resolved options (P1, P8): all 26 targets in the label frame, the background, the axis
 * lines and the triad slot. Every material, geometry and texture it creates is listed in `owned`.
 *
 * @param options - From `resolveOptions`
 * @param builders - Replace a default part; later tasks fill these seams
 * @returns A new scene, styled for `options`
 */
export function buildScene(options: GizmoResolvedOptions, builders: Partial<SceneBuilders> = {}): GizmoScene {
  const o = options as SceneOptions;
  const { labels, geometry, lines, background, triad } = { ...DEFAULT_BUILDERS, ...builders };
  const owned: Owned = new Set();
  const frame = labelFrame(o.up, o.frontDirection);
  const textures = labels(o);
  owned.add(textures);

  const entries = targetTable(frame);
  const draft = entries.map((entry) => ({
    entry,
    target: targetOf(entry, frame, o),
    end: entry.kind === "face" ? frame.faces[entry.faces[0]].end : null,
  }));
  const { byKey, pairs } = targetMaterials(draft, o, textures, new Map(), owned);

  const place = o.type === "sphere" ? null : geometry[o.type](o, frame, owned);
  const targets = draft.map<SceneTarget>((part, i) => {
    const { idle, hover } = pairs[i];
    let object: SceneTarget["object"];
    if (place) {
      const { geometry, position, quaternion } = place(part.entry);
      object = new Mesh(geometry, idle);
      object.position.copy(position);
      object.quaternion.copy(quaternion);
    } else {
      object = new Sprite(idle as SpriteMaterial);
      object.position.copy(part.entry.direction).multiplyScalar(part.end ? GIZMO_SPHERE_AXES_DISTANCE : 1.7);
    }
    object.renderOrder = 1;
    return { ...part, object, idle, hover };
  });

  const context = { frame, targets };
  const parts = { background: background(o, context, owned), lines: lines(o, context, owned), triad: triad(o, context, owned) };
  const group = new Group();
  group.add(parts.background.object, parts.lines.object, ...targets.map((t) => t.object), parts.triad.object);

  const scene: GizmoScene = {
    group,
    frame,
    targets,
    parts,
    labels: textures,
    owned,
    materials: byKey,
    options: o,
    hovered: null,
    pointerOver: false,
  };
  restyleTargets(scene);
  for (const part of Object.values(parts)) part.update(o, false);
  return scene;
}

/**
 * Frees exactly what the scene created (P1) and detaches its group. A host object, material or texture added under
 * the gizmo, or a host material returned from `onMaterial`, is left as it is.
 */
export function disposeScene(scene: GizmoScene): void {
  scene.group.removeFromParent();
  for (const resource of scene.owned) resource.dispose();
  scene.owned.clear();
}
