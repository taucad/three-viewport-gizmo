import { Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { resolveOptions } from "../options/resolve";
import { fieldOfViewDistance, UNIT_FACE_OUTLINE } from "../render/internalCamera";
import type { GizmoOptions } from "../types";
import { buildScene, type GizmoScene } from "./build";
import { faceOnOutline, TRIAD_SCENE_SCALE } from "./outline";
import { hoverScene, updateScene } from "./update";

const resolve = (options: GizmoOptions) => resolveOptions(options, { up: new Vector3(0, 1, 0) });
const outlineOf = (scene: GizmoScene) =>
  faceOnOutline({ targets: scene.targets, background: scene.parts.background.object }, scene.options);

/** The outline as `[z, x, from]` points. */
const pointsOf = (outline: readonly number[]) =>
  Array.from({ length: outline.length / 3 }, (_, i) => outline.slice(i * 3, i * 3 + 3) as [number, number, number]);

describe("faceOnOutline", () => {
  it("reads the targets at rest: hovering one hidden at rest does not change the outline the camera keeps", () => {
    // Edges and corners at opacity 0 draw only while hovered; the front-right edge's bevel is the outline's arc.
    const scene = buildScene(resolve({ type: "rounded-cube", radius: 0.3, edges: { opacity: 0 }, corners: { opacity: 0 } }));
    const rest = [...outlineOf(scene)];
    hoverScene(scene, "front-right");
    expect(scene.targets.find((t) => t.target.name === "front-right")!.object.visible).toBe(true);
    expect(outlineOf(scene)).toEqual(rest);
  });

  it("leaves out a disabled target and keeps an opaque one", () => {
    const all = buildScene(resolve({ type: "rounded-cube", radius: 0.3 }));
    const noEdges = buildScene(resolve({ type: "rounded-cube", radius: 0.3, edges: { enabled: false }, corners: { enabled: false } }));
    expect(outlineOf(noEdges)).not.toEqual(outlineOf(all));
  });

  it("takes in the classic cube's background: its side plates, seen from inside, are drawn from any distance", () => {
    const scene = buildScene(resolve({ type: "cube" }));
    const points = pointsOf(outlineOf(scene));
    // The background is the faces at 0.9 facing in: its side plates reach half-width 1 at depth 0.9.
    expect(points.some(([z, x, from]) => Math.abs(z - 0.9) < 1e-6 && Math.abs(x - 1) < 1e-6 && from === -Infinity)).toBe(true);
    const without = buildScene(resolve({ type: "cube", background: { enabled: false } }));
    expect(Math.max(...pointsOf(outlineOf(without)).map(([, x]) => x))).toBeLessThan(1.02);
    expect(pointsOf(outlineOf(without)).some(([, x]) => x === 1)).toBe(false);
  });

  it("draws the classic cube's front corner plates only from a camera beyond where their plane crosses the axis", () => {
    const scene = buildScene(resolve({ type: "cube", background: { enabled: false } }));
    const points = pointsOf(outlineOf(scene));
    // A corner plate at 0.85 (1, 1, 1) facing (1, 1, 1): its plane crosses the axis at 3 × 0.85.
    const corner = points.filter(([, x]) => x > 1);
    expect(corner.length).toBeGreaterThan(0);
    for (const [, , from] of corner) expect(from).toBeCloseTo(2.55, 9);
    // The front face plate (depth 1) shows from beyond its own plane; the back plates never do.
    expect(points.every(([z, , from]) => from >= z - 1e-9 || from === -Infinity)).toBe(true);
    expect(points.every(([z]) => z > -0.5)).toBe(true);
  });

  it("scales with the triad", () => {
    const plain = pointsOf(outlineOf(buildScene(resolve({ type: "cube" }))));
    const triad = pointsOf(outlineOf(buildScene(resolve({ type: "cube", triad: { enabled: true } }))));
    expect(triad.map((p) => p.map((v) => v / TRIAD_SCENE_SCALE))).toEqual(
      plain.map((p) => p.map((v) => (v === -Infinity ? v : expect.closeTo(v, 9))))
    );
  });

  it("is read once per change: the camera, the lines and the triad share it", () => {
    const scene = buildScene(resolve({ type: "rounded-cube" }));
    const first = outlineOf(scene);
    expect(outlineOf(scene)).toBe(first);
    updateScene(scene, resolve({ type: "rounded-cube", x: { color: 0xff0000 } }));
    expect(outlineOf(scene)).toBe(first);
    updateScene(scene, resolve({ type: "rounded-cube", triad: { enabled: true } }));
    expect(outlineOf(scene)).not.toBe(first);
  });

  it("gives the sphere, drawn orthographic, the unit front edge, and keeps 2.3.0's distance for it", () => {
    const scene = buildScene(resolve({ type: "sphere" }));
    expect(outlineOf(scene)).toBe(UNIT_FACE_OUTLINE);
    expect(fieldOfViewDistance(Math.PI / 2, UNIT_FACE_OUTLINE)).toBeCloseTo(1 + 6 * Math.tan((13 * Math.PI) / 180), 12);
  });
});
