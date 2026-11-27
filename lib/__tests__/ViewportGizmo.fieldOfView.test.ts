import { afterEach, describe, expect, it, vi } from "vitest";
import { MathUtils, PerspectiveCamera, type Camera } from "three";
import { ViewportGizmo } from "../ViewportGizmo.js";
import type { GizmoOptions } from "../types.js";
import { faceOnWidth, MEASURE_SIZE, widthRatios } from "./faceOnWidth.js";
import { createStubRenderer, layOut } from "./test-utils.js";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("fieldOfView keeps the body's face-on width (its drawn size), triad on and off", () => {
  const cases: Array<[string, GizmoOptions]> = [
    ["cube", { type: "cube" }],
    ["cube with the triad", { type: "cube", triad: { enabled: true } }],
    ["cube r 0.5, large corners", { type: "cube", radius: 0.5, corners: { scale: 0.35 } }],
    ["cube with its edges shown", { type: "cube", edges: { opacity: 1 } }],
    ["cube without its background", { type: "cube", background: { enabled: false } }],
    ["rounded-cube r 0.05", { type: "rounded-cube", radius: 0.05 }],
    ["rounded-cube r 0.3", { type: "rounded-cube", radius: 0.3 }],
    ["rounded-cube r 0.3 with the triad", { type: "rounded-cube", radius: 0.3, triad: { enabled: true } }],
    ["rounded-cube r 0.6 with the triad", { type: "rounded-cube", radius: 0.6, triad: { enabled: true } }],
    ["sphere", { type: "sphere" }],
    ["sphere with the triad asked for (the cube types' only)", { type: "sphere", triad: { enabled: true } }],
    ["sphere with its edges and corners", { type: "sphere", edges: { enabled: true }, corners: { enabled: true } }],
    ["sphere with +X enlarged alone", { type: "sphere", x: { scale: 1.2 } }],
  ];
  // Exact by construction: the distance is solved from the outline the gizmo draws, so only rounding is left.
  it.each(cases)("%s: within 1e-9 of its 26° width from 0.1° to 100°", (_, options) => {
    const ratios = widthRatios(options, [0.1, 1, 10, 30, 45, 60, 90, 100]);
    const worst = Math.max(...Object.values(ratios).map((r) => Math.abs(r - 1)));
    expect(worst, JSON.stringify(ratios)).toBeLessThanOrEqual(1e-9);
  });

  it("re-places the camera when set() toggles the triad (a cheap change) at a wide field of view", () => {
    const renderer = createStubRenderer();
    const container = document.body.appendChild(document.createElement("div"));
    const fieldOfView = MathUtils.degToRad(60);
    const distance = (gizmo: ViewportGizmo) => {
      const draw = vi.spyOn(renderer, "render");
      gizmo.render();
      return (draw.mock.calls.at(-1)![1] as Camera).position.z;
    };
    const toggled = layOut(new ViewportGizmo(new PerspectiveCamera(), renderer, { type: "rounded-cube", container, fieldOfView }));
    const off = distance(toggled);
    toggled.set({ triad: { enabled: true } });
    const fresh = layOut(new ViewportGizmo(new PerspectiveCamera(), renderer, { type: "rounded-cube", container, fieldOfView, triad: { enabled: true } }));
    expect(distance(toggled)).not.toBeCloseTo(off, 3);
    expect(distance(toggled)).toBeCloseTo(distance(fresh), 12);
  });

  it("draws the sphere at 2.3.0's orthographic width at every field of view", () => {
    // Its widest sprites, +X (scale 0.7) and −X (0.45), 1.3 from the centre, in the ±1.8 view.
    for (const degrees of [0.1, 26, 90]) expect(faceOnWidth({ type: "sphere" }, degrees)).toBeCloseTo((MEASURE_SIZE * 3.175) / 3.6, 9);
  });

  it("keeps the cube types' 26° camera as 2.3.0 placed it: distance 7 whatever the triad or the radius", () => {
    const renderer = createStubRenderer();
    const container = document.body.appendChild(document.createElement("div"));
    for (const options of cases.map(([, o]) => o).filter((o) => o.type !== "sphere")) {
      const gizmo = layOut(new ViewportGizmo(new PerspectiveCamera(), renderer, { ...options, container }));
      const draw = vi.spyOn(renderer, "render");
      gizmo.render();
      expect((draw.mock.calls.at(-1)![1] as Camera).position.z).toBeCloseTo(7, 12);
      gizmo.dispose();
    }
  });
});
