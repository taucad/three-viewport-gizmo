import { afterEach, describe, expect, it, vi } from "vitest";
import type { GizmoRenderer } from "../backend";
import { watchViewport, type MutableViewport } from "../rect";

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
