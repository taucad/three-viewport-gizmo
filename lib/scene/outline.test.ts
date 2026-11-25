import { Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { resolveOptions } from "../options/resolve";
import type { GizmoOptions } from "../types";
import { buildScene } from "./build";
import { faceOnOutline } from "./outline";
import { hoverScene } from "./update";

const resolve = (options: GizmoOptions) => resolveOptions(options, { up: new Vector3(0, 1, 0) });

describe("faceOnOutline", () => {
  it("reads the targets at rest: hovering one hidden at rest does not change the outline the camera keeps", () => {
    // Edges and corners at opacity 0 draw only while hovered; the front-right edge's bevel is the outline's arc.
    const scene = buildScene(resolve({ type: "rounded-cube", radius: 0.3, edges: { opacity: 0 }, corners: { opacity: 0 } }));
    const rest = faceOnOutline(scene.targets, scene.options);
    hoverScene(scene, "front-right");
    expect(scene.targets.find((t) => t.target.name === "front-right")!.object.visible).toBe(true);
    expect(faceOnOutline(scene.targets, scene.options)).toEqual(rest);
  });

  it("leaves out a disabled target and keeps an opaque one", () => {
    const all = buildScene(resolve({ type: "rounded-cube", radius: 0.3 }));
    const noEdges = buildScene(resolve({ type: "rounded-cube", radius: 0.3, edges: { enabled: false }, corners: { enabled: false } }));
    expect(faceOnOutline(noEdges.targets, noEdges.options)).not.toEqual(faceOnOutline(all.targets, all.options));
  });
});
