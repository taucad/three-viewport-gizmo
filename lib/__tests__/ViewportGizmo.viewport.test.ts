import { afterEach, describe, expect, it, vi } from "vitest";
import { PerspectiveCamera, Scene } from "three";
import { ViewportGizmo } from "../ViewportGizmo.js";
import { createStubRenderer, resetDefaultUp } from "./test-utils.js";

afterEach(() => {
  resetDefaultUp();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("domUpdate viewport Y", () => {
  const camera = new PerspectiveCamera(50, 1, 0.1, 1000);
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);

  /** The viewport `render()` draws the gizmo into, for a top-right 128 px gizmo on an 800 × 600 canvas. */
  function renderedViewport(isWebGPURenderer: boolean) {
    const renderer = createStubRenderer({ isWebGPURenderer });
    vi.spyOn(renderer.domElement, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 800, height: 600 })
    );
    const container = document.createElement("div");
    document.body.appendChild(container);

    const gizmo = new ViewportGizmo(camera, renderer, {
      type: "cube",
      container,
      placement: "top-right",
      size: 128,
      offset: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    vi.spyOn(container.firstElementChild!, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 672, y: 0, width: 128, height: 128 })
    );
    gizmo.update(false);

    const setViewport = vi.spyOn(renderer, "setViewport");
    gizmo.render();
    return setViewport.mock.calls[0];
  }

  it("draws at a bottom-origin Y when using legacy WebGL-style renderer", () => {
    expect(renderedViewport(false)).toEqual([672, 472, 128, 128]);
  });

  it("draws at a top-origin Y when using WebGPURenderer", () => {
    expect(renderedViewport(true)).toEqual([672, 0, 128, 128]);
  });
});

describe("root", () => {
  it("keeps drawing after a host scene adopts its root (probe P3)", () => {
    const renderer = createStubRenderer();
    const draw = vi.spyOn(renderer, "render");
    const camera = new PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(5, 5, 5);
    const gizmo = new ViewportGizmo(camera, renderer, { type: "cube" });

    new Scene().add(gizmo.root);
    gizmo.render();

    const [drawn] = draw.mock.calls[0]!;
    expect(drawn.children).toEqual([gizmo.root]);
    expect(gizmo.root.children.length).toBeGreaterThan(20);
  });
});
