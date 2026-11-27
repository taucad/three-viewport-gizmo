import { afterEach, describe, expect, it, vi } from "vitest";
import { MathUtils, PerspectiveCamera, type Camera } from "three";
import { ViewportGizmo } from "../ViewportGizmo.js";
import type { GizmoOptions } from "../types.js";
import { widthRatios } from "./faceOnWidth.js";
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
  ];
  const off = { enabled: false };
  const noFaces = { background: off, x: off, y: off, z: off, nx: off, ny: off, nz: off };
  // One-sided plates only: nothing is always drawn, so the camera must start where the nearest plate first draws.
  it.each<[string, GizmoOptions, number[]]>([
    ["cube, corners only", { type: "cube", ...noFaces, corners: { opacity: 1 } }, [0.1, 10, 30, 45, 60]],
    ["cube, edges only", { type: "cube", ...noFaces, edges: { opacity: 1 } }, [0.1, 10, 30, 45, 60, 90]],
    ["cube, corners and edges only", { type: "cube", ...noFaces, corners: { opacity: 1 }, edges: { opacity: 1 } }, [0.1, 10, 30, 45, 60, 90]],
    ["rounded-cube, corners only", { type: "rounded-cube", ...noFaces, corners: { opacity: 1 } }, [0.1, 10, 30, 45, 60, 90]],
  ])("%s: drawn and within 1e-9 of its 26° width", (_, options, degrees) => {
    const ratios = widthRatios(options, degrees);
    for (const ratio of Object.values(ratios)) expect(Math.abs(ratio - 1), JSON.stringify(ratios)).toBeLessThanOrEqual(1e-9);
  });

  it("cube, corners only, at 90°: still drawn, a little smaller, since its corner plates face the camera only from 2.55", () => {
    const { 90: ratio } = widthRatios({ type: "cube", ...noFaces, corners: { opacity: 1 } }, [90]);
    expect(ratio).toBeGreaterThan(0.8);
    expect(ratio).toBeLessThan(1);
  });

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

  it("keeps the 26° outline as 2.3.0 drew it: distance 7 whatever the triad or the radius", () => {
    const renderer = createStubRenderer();
    const container = document.body.appendChild(document.createElement("div"));
    for (const options of cases.map(([, o]) => o)) {
      const gizmo = layOut(new ViewportGizmo(new PerspectiveCamera(), renderer, { ...options, container }));
      const draw = vi.spyOn(renderer, "render");
      gizmo.render();
      expect((draw.mock.calls.at(-1)![1] as Camera).position.z).toBeCloseTo(7, 12);
      gizmo.dispose();
    }
  });
});
