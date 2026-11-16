import {
  Color,
  MeshBasicMaterial,
  SpriteMaterial,
  type ColorRepresentation,
  type Material,
  type Texture,
} from "three";
import type { GizmoMaterial, GizmoMaterialUse, GizmoResolvedOptions, GizmoTarget } from "../types";

/** Something the gizmo created and frees on `dispose()`: a material, geometry, texture or label provider. */
export type Disposable = { dispose(): void };

/** The resources a scene created, and only those (P1): a host material, sprite or texture is never in it. */
export type Owned = Set<Disposable>;

/** How a target looks in one state. Equal styles share one material (P8). */
export type TargetStyle = Readonly<{
  /** A `SpriteMaterial` (sphere) or a `MeshBasicMaterial` (cubes). */
  sprite: boolean;
  map: Texture | null;
  color: ColorRepresentation;
  opacity: number;
}>;

/** One target's material in one state. */
export type MaterialSlot = Readonly<{ target: GizmoTarget; state: GizmoMaterialUse["state"]; style: TargetStyle }>;

const _color = /*@__PURE__*/ new Color();

const keyOf = ({ state, style: { sprite, map, color, opacity } }: MaterialSlot) =>
  `${state}|${sprite ? "sprite" : "mesh"}|${map?.id ?? -1}|${_color.set(color).getHex()}|${opacity}`;

/**
 * A target material. Its flags are fixed for its life, so a cheap change writes only `color` and `opacity` and never
 * compiles a program or pipeline (P5, P9): `transparent` (labels carry alpha and opacity is a cheap option),
 * `depthWrite` on (the cube hides its own back), `toneMapped` off (gizmo colours are display colours, R6).
 */
export function targetMaterial({ sprite, map, color, opacity }: TargetStyle): MeshBasicMaterial | SpriteMaterial {
  const parameters = { map, color, opacity, transparent: true, depthWrite: true, toneMapped: false };
  return sprite ? new SpriteMaterial(parameters) : new MeshBasicMaterial(parameters);
}

/**
 * Gives every slot a material, sharing one between all slots of equal state and style (P8): six face labels idle and
 * hover, then one material per edge and corner style, so a cube holds at most 14 target materials. A material whose
 * style is still wanted is kept as it is; one no longer wanted is restyled in place for a new style of the same kind
 * and map, else disposed if the scene owns it. A new material goes through `onMaterial` with the targets that share
 * it; a replacement it returns belongs to the host and is never disposed.
 *
 * @param previous - The materials by style key from the last call; empty on build
 * @param owned - Receives the materials created here; loses those disposed here
 * @returns The materials by style key, and the material of each slot in slot order
 */
export function assignMaterials(
  slots: readonly MaterialSlot[],
  previous: ReadonlyMap<string, Material>,
  owned: Owned,
  onMaterial?: GizmoResolvedOptions["onMaterial"]
): { byKey: Map<string, Material>; bySlot: Material[] } {
  const keys = slots.map(keyOf);
  const groups = new Map<string, MaterialSlot[]>();
  keys.forEach((key, i) => (groups.get(key) ?? groups.set(key, []).get(key)!).push(slots[i]));

  const byKey = new Map<string, Material>();
  for (const key of groups.keys()) if (previous.has(key)) byKey.set(key, previous.get(key)!);
  const spare = [...previous].filter(([key]) => !groups.has(key)).map(([, material]) => material as GizmoMaterial);

  for (const [key, group] of groups) {
    if (byKey.has(key)) continue;
    const [{ state, style }] = group;
    const reuse = spare.findIndex(
      (material) =>
        ((material as Material & { isSpriteMaterial?: boolean }).isSpriteMaterial === true) === style.sprite &&
        material.map === style.map
    );
    if (reuse >= 0) {
      const [material] = spare.splice(reuse, 1);
      material.color.set(style.color);
      material.opacity = style.opacity;
      byKey.set(key, material);
      continue;
    }
    const created = targetMaterial(style);
    const material = onMaterial?.(created, { targets: group.map((slot) => slot.target), state }) ?? created;
    if (material === created) owned.add(created);
    else created.dispose();
    byKey.set(key, material);
  }

  for (const material of spare) if (owned.delete(material)) material.dispose();
  return { byKey, bySlot: keys.map((key) => byKey.get(key)!) };
}
