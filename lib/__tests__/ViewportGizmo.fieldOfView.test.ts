import { afterEach, describe, expect, it, vi } from "vitest";
import { MathUtils, Mesh, PerspectiveCamera, Vector3, type Camera, type Object3D } from "three";
import { ViewportGizmo } from "../ViewportGizmo.js";
import type { GizmoOptions } from "../types.js";
import { createStubRenderer } from "./test-utils.js";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

const _v = new Vector3();

/**
 * The face-on width, in gizmo pixels, of the rounded cube's body (its 26 targets close one convex shape), projected
 * through the camera `render()` draws with. Face-on: the host looks down −Z, so the gizmo's +Z face is toward its
 * camera.
 */
function outlineWidth(options: GizmoOptions, degrees: number): number {
  const renderer = createStubRenderer();
  const container = document.body.appendChild(document.createElement("div"));
  const host = new PerspectiveCamera(50, 1, 0.1, 100);
  host.position.set(0, 0, 7);
  host.lookAt(0, 0, 0);
  const size = 320;
  const gizmo = new ViewportGizmo(host, renderer, { ...options, size, container, fieldOfView: MathUtils.degToRad(degrees) });
  const draw = vi.spyOn(renderer, "render");
  gizmo.render();
  const camera = draw.mock.calls[0]![1] as Camera;
  // The scene group holds the background, the axis lines, the 26 targets and the triad, in that order.
  const group = gizmo.root.children[0]!;
  gizmo.root.updateMatrixWorld(true);
  camera.updateMatrixWorld();
  let min = Infinity;
  let max = -Infinity;
  const meshes = group.children.slice(2, 28) as Object3D[];
  for (const target of meshes) {
    if (!(target instanceof Mesh) || !target.visible) continue;
    const position = target.geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = _v.fromBufferAttribute(position, i).applyMatrix4(target.matrixWorld).project(camera).x;
      min = Math.min(min, x);
      max = Math.max(max, x);
    }
  }
  gizmo.dispose();
  return ((max - min) * size) / 2;
}

describe("fieldOfView keeps the rounded cube's face-on outline (its drawn size), triad on and off", () => {
  const cases: Array<[string, GizmoOptions]> = [
    ["rounded-cube r 0.05", { type: "rounded-cube", radius: 0.05 }],
    ["rounded-cube r 0.3", { type: "rounded-cube", radius: 0.3 }],
    ["rounded-cube r 0.3 with the triad", { type: "rounded-cube", radius: 0.3, triad: { enabled: true } }],
    ["rounded-cube r 0.6 with the triad", { type: "rounded-cube", radius: 0.6, triad: { enabled: true } }],
  ];
  it.each(cases)("%s: within 1 % of its 26° width at 0.1°, 30°, 45° and 90°", (_, options) => {
    const base = outlineWidth(options, 26);
    const ratios = Object.fromEntries([0.1, 30, 45, 90].map((d) => [d, outlineWidth(options, d) / base]));
    const worst = Math.max(...Object.values(ratios).map((r) => Math.abs(r - 1)));
    expect(worst, JSON.stringify(ratios)).toBeLessThanOrEqual(0.01);
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
    const toggled = new ViewportGizmo(new PerspectiveCamera(), renderer, { type: "rounded-cube", container, fieldOfView });
    const off = distance(toggled);
    toggled.set({ triad: { enabled: true } });
    const fresh = new ViewportGizmo(new PerspectiveCamera(), renderer, { type: "rounded-cube", container, fieldOfView, triad: { enabled: true } });
    expect(distance(toggled)).not.toBeCloseTo(off, 3);
    expect(distance(toggled)).toBeCloseTo(distance(fresh), 12);
  });

  it("keeps the 26° outline as 2.3.0 drew it: distance 7 whatever the triad or the radius", () => {
    const renderer = createStubRenderer();
    const container = document.body.appendChild(document.createElement("div"));
    for (const options of cases.map(([, o]) => o)) {
      const gizmo = new ViewportGizmo(new PerspectiveCamera(), renderer, { ...options, container });
      const draw = vi.spyOn(renderer, "render");
      gizmo.render();
      expect((draw.mock.calls.at(-1)![1] as Camera).position.z).toBeCloseTo(7, 12);
      gizmo.dispose();
    }
  });
});

describe("fieldOfView on the classic cube (2.3.0's front-edge model, scaled with the scene)", () => {
  it("places the camera for the unit front edge, at the triad's scale while it shows", () => {
    const renderer = createStubRenderer();
    const container = document.body.appendChild(document.createElement("div"));
    const fieldOfView = MathUtils.degToRad(45);
    const t = Math.tan(fieldOfView / 2) / Math.tan(MathUtils.degToRad(13));
    for (const [triad, focus] of [[false, 1], [true, 0.7]] as const) {
      const gizmo = new ViewportGizmo(new PerspectiveCamera(), renderer, { type: "cube", container, fieldOfView, triad: { enabled: triad } });
      const draw = vi.spyOn(renderer, "render");
      gizmo.render();
      expect((draw.mock.calls.at(-1)![1] as Camera).position.z).toBeCloseTo(focus + (7 - focus) / t, 12);
      gizmo.dispose();
    }
  });
});
