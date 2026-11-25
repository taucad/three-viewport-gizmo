import { Vector4 } from "three";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GizmoRenderer } from "../backend";
import { clipRect, watchViewport, type MutableViewport } from "../rect";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

/** A gizmo element over an 800 × 600 canvas, whose whole-pixel layout values the test can move. */
function setup() {
  const canvas = document.createElement("canvas");
  const element = document.createElement("div");
  document.body.append(canvas, element);
  const layout = new Map<string, number>([
    ["clientWidth", 800],
    ["clientHeight", 600],
  ]);
  for (const node of [canvas, element])
    for (const key of ["offsetLeft", "offsetTop", "offsetWidth", "offsetHeight", "clientWidth", "clientHeight"])
      Object.defineProperty(node, key, { configurable: true, get: () => layout.get(`${node === canvas ? "" : "element."}${key}`) ?? 0 });
  const canvasRect = vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 800, 600));
  const elementRect = vi.spyOn(element, "getBoundingClientRect").mockReturnValue(new DOMRect(663.7, 8.4, 128, 128));
  const renderer = { domElement: canvas } as unknown as GizmoRenderer;
  const out: MutableViewport = { x: 0, y: 0, width: 0, height: 0 };
  /** How many times the next `measure` reads layout through `getBoundingClientRect`. */
  const reads = (watch: ReturnType<typeof watchViewport>) => {
    const before = elementRect.mock.calls.length + canvasRect.mock.calls.length;
    watch.measure(out);
    return elementRect.mock.calls.length + canvasRect.mock.calls.length - before;
  };
  return { canvas, element, layout, elementRect, renderer, out, reads };
}

describe("watchViewport (I4: no layout read while nothing moved, R6: no call after a layout change)", () => {
  it("measures the subpixel rectangle on the first frame, then reads no rectangle while nothing moves", () => {
    const { element, renderer, out, reads } = setup();
    const watch = watchViewport(renderer, element);
    expect(reads(watch)).toBe(2);
    expect(out).toEqual({ x: 663.7, y: 600 - 136.4, width: 128, height: 128 });
    for (let i = 0; i < 3; i++) expect(reads(watch)).toBe(0);
    watch.detach();
  });

  it.each([
    ["the window resizes (zoom too)", () => window.dispatchEvent(new Event("resize"))],
    ["any element scrolls (the event does not bubble)", (e: HTMLElement) => e.dispatchEvent(new Event("scroll"))],
    ["the canvas's CSS size changes by a pixel", (_: HTMLElement, l: Map<string, number>) => l.set("clientWidth", 801)],
    ["the element's whole-pixel offset changes", (_: HTMLElement, l: Map<string, number>) => l.set("element.offsetLeft", 1)],
    ["the element's size changes by a pixel", (_: HTMLElement, l: Map<string, number>) => l.set("element.offsetWidth", 129)],
    ["the canvas moves by a pixel", (_: HTMLElement, l: Map<string, number>) => l.set("offsetTop", 1)],
  ])("remeasures on the same frame when %s", (_, move) => {
    const { element, layout, elementRect, renderer, out, reads } = setup();
    const watch = watchViewport(renderer, element);
    reads(watch);
    move(element, layout);
    elementRect.mockReturnValue(new DOMRect(670.25, 8.4, 128, 128));
    expect(reads(watch)).toBe(2);
    expect(out.x).toBe(670.25);
    expect(reads(watch)).toBe(0);
    watch.detach();
  });

  it("remeasures on the same frame when a positioned container moves the element and not the canvas", () => {
    const { element, elementRect, renderer, out, reads } = setup();
    // The element's offsets are relative to its container, which moves; none of the element's own values change.
    const container = document.createElement("div");
    let left = 0;
    Object.defineProperty(container, "offsetLeft", { configurable: true, get: () => left });
    Object.defineProperty(element, "offsetParent", { configurable: true, get: () => container });
    const watch = watchViewport(renderer, element);
    reads(watch);
    left = 100;
    elementRect.mockReturnValue(new DOMRect(763.7, 8.4, 128, 128));
    expect(reads(watch)).toBe(2);
    expect(out.x).toBe(763.7);
    expect(reads(watch)).toBe(0);
    watch.detach();
  });

  it("remeasures after invalidate(), for an option change that moves or resizes the element", () => {
    const { element, renderer, reads } = setup();
    const watch = watchViewport(renderer, element);
    reads(watch);
    watch.invalidate();
    expect(reads(watch)).toBe(2);
    watch.detach();
  });

  it("observes both sizes for subpixel changes, and detach() stops every signal", () => {
    const observers: Array<{ callback: () => void; observed: Element[]; disconnected: boolean }> = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        record: (typeof observers)[number];
        constructor(callback: () => void) {
          this.record = { callback, observed: [], disconnected: false };
          observers.push(this.record);
        }
        observe(target: Element) {
          this.record.observed.push(target);
        }
        disconnect() {
          this.record.disconnected = true;
        }
      }
    );
    const { canvas, element, renderer, reads } = setup();
    const watch = watchViewport(renderer, element);
    reads(watch);
    expect(observers).toHaveLength(1);
    expect(observers[0]!.observed).toEqual([element, canvas]);
    observers[0]!.callback();
    expect(reads(watch)).toBe(2);

    const removed = vi.spyOn(window, "removeEventListener");
    watch.detach();
    expect(observers[0]!.disconnected).toBe(true);
    expect(removed.mock.calls.map(([type]) => type).sort()).toEqual(["resize", "scroll"]);
  });
});

describe("clipRect (the scissor of a rectangle partly or wholly off the render area)", () => {
  const clip = (x: number, y: number, width: number, height: number) => {
    const out = new Vector4(-1, -1, -1, -1);
    return { inside: clipRect(new Vector4(x, y, width, height), 800, 600, out), out: out.toArray() };
  };

  it.each([
    ["inside", [664, 8, 128, 128], [664, 8, 128, 128]],
    ["past the right edge", [736, 8, 128, 128], [736, 8, 64, 128]],
    ["past the left edge", [-28.5, 8, 128, 128], [0, 8, 99.5, 128]],
    ["past the top and bottom edges", [8, -30, 128, 700], [8, 0, 128, 600]],
    ["over the whole area", [-10, -10, 900, 700], [0, 0, 800, 600]],
  ] as const)("keeps the part %s", (_, rect, expected) => {
    expect(clip(...rect)).toEqual({ inside: true, out: expected });
  });

  it.each([
    ["right of the area", [960, 48, 192, 192]],
    ["left of it", [-200, 48, 192, 192]],
    ["above or below it", [8, 600, 128, 128]],
    ["touching its edge only", [800, 8, 128, 128]],
    ["empty", [8, 8, 0, 0]],
    ["not a number", [Number.NaN, 8, 128, 128]],
  ] as const)("reports nothing inside, and writes nothing, for a rectangle %s", (_, rect) => {
    expect(clip(...rect)).toEqual({ inside: false, out: [-1, -1, -1, -1] });
  });
});
