import type { RenderTarget, Vector4 } from "three";
import type { GizmoViewport } from "../types";
import { isWebGPURenderer, type GizmoRenderer } from "./backend";

/** The gizmo's rectangle, written in place by {@link measureViewport}; the class exposes it as `viewport`. */
export type MutableViewport = { -readonly [Key in keyof GizmoViewport]: GizmoViewport[Key] };

/**
 * Measures `element` against the renderer's canvas and writes the rectangle in CSS pixels, in the renderer's
 * `setViewport` convention: y from the top on `WebGPURenderer`, from the bottom on `WebGLRenderer` (issue #48). Call it
 * through {@link watchViewport}, so the rectangle follows layout without a `domUpdate()` (R6). Writes into `out` and keeps
 * nothing else.
 *
 * @param renderer - The host renderer, whose canvas the rectangle is relative to
 * @param element - The gizmo's element
 * @param out - Receives the rectangle
 * @returns `out`
 */
export function measureViewport(renderer: GizmoRenderer, element: HTMLElement, out: MutableViewport): MutableViewport {
  const canvas = renderer.domElement;
  const rect = element.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const top = rect.top - canvasRect.top;
  out.x = rect.left - canvasRect.left;
  out.y = isWebGPURenderer(renderer) ? top : canvas.clientHeight - (top + rect.height);
  out.width = rect.width;
  out.height = rect.height;
  return out;
}

/** The gizmo's rectangle, measured again only when layout may have moved it: from {@link watchViewport}. */
export type ViewportWatch = {
  /** Writes the rectangle into `out`, reading layout only if something moved since the last call. Returns `out`. */
  measure(out: MutableViewport): MutableViewport;
  /** Measures again at the next {@link ViewportWatch.measure}, for an option change that moves or resizes the element. */
  invalidate(): void;
  /** Removes the listeners and the observer. */
  detach(): void;
};

/**
 * Keeps the gizmo's rectangle current without reading it from layout on every frame (I4). `getBoundingClientRect`
 * returns a new `DOMRect` (16 B) and each of its fractional coordinates comes out of the DOM binding as a new heap
 * number (12 B), so a gizmo at a subpixel offset measured on every frame allocated 76 to 82 B a frame, over the
 * 64 B idle budget, whatever the library does with the numbers.
 *
 * Instead, each frame compares eight whole-pixel layout values of the element and the canvas (offsets and sizes, read
 * as small integers, which allocate nothing) with the last measurement's; the rectangle is measured exactly, with
 * {@link measureViewport}, when one of them changed or a signal arrived since: a window `resize` (also zoom), a `scroll`
 * of anything (captured, since it does not bubble), a subpixel size change of either box (`ResizeObserver`, from the
 * next frame) or {@link ViewportWatch.invalidate}. Resize, scroll, a canvas resize and any move or resize of a pixel or
 * more are therefore picked up on the same frame, at the same subpixel rectangle as a measurement every frame; the
 * device pixel ratio never enters the rectangle, which is in CSS pixels. A move of less than half a CSS pixel with no
 * size change, or one made only by a CSS transform, is picked up at the next of these signals.
 *
 * @param renderer - The host renderer, whose canvas the rectangle is relative to
 * @param element - The gizmo's element
 * @returns The watch; call `detach()` when the gizmo is disposed
 */
export function watchViewport(renderer: GizmoRenderer, element: HTMLElement): ViewportWatch {
  const canvas = renderer.domElement;
  const seen = new Int32Array(8);
  let stale = true;
  const invalidate = () => {
    stale = true;
  };
  const view = element.ownerDocument.defaultView;
  const scroll = { capture: true, passive: true } as const;
  view?.addEventListener("resize", invalidate);
  view?.addEventListener("scroll", invalidate, scroll);
  const sizes = typeof ResizeObserver === "function" ? new ResizeObserver(invalidate) : null;
  sizes?.observe(element);
  sizes?.observe(canvas);
  return {
    measure(out) {
      // Both run every frame: `moved` records the values the next frame compares with.
      if (moved(seen, element, canvas) || stale) {
        stale = false;
        measureViewport(renderer, element, out);
      }
      return out;
    },
    invalidate,
    detach() {
      view?.removeEventListener("resize", invalidate);
      view?.removeEventListener("scroll", invalidate, scroll);
      sizes?.disconnect();
    },
  };
}

/** Whether a whole-pixel offset or size of `element` or `canvas` differs from `seen`; records the new values. */
function moved(seen: Int32Array, element: HTMLElement, canvas: HTMLCanvasElement): boolean {
  const a = element.offsetLeft;
  const b = element.offsetTop;
  const c = element.offsetWidth;
  const d = element.offsetHeight;
  const e = canvas.offsetLeft;
  const f = canvas.offsetTop;
  const g = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (seen[0] === a && seen[1] === b && seen[2] === c && seen[3] === d && seen[4] === e && seen[5] === f && seen[6] === g && seen[7] === h)
    return false;
  seen[0] = a;
  seen[1] = b;
  seen[2] = c;
  seen[3] = d;
  seen[4] = e;
  seen[5] = f;
  seen[6] = g;
  seen[7] = h;
  return true;
}

/**
 * The gizmo's rectangle on a host render target, in the target's pixels: `rect` scaled from the canvas's CSS size to
 * the target's size, so a target the size of the drawing buffer gets `rect × pixelRatio` (D15). Both backends keep their
 * canvas origin on a target (bottom-left on WebGL, top-left on WebGPU), so only the scale changes.
 *
 * @param renderer - The host renderer
 * @param rect - From {@link measureViewport}
 * @param target - The renderer's current render target
 * @param out - Receives `x, y, width, height` as `x, y, z, w`
 * @returns `out`
 */
export function targetRect(renderer: GizmoRenderer, rect: GizmoViewport, target: RenderTarget, out: Vector4): Vector4 {
  const canvas = renderer.domElement;
  // ponytail: a canvas with no CSS size (detached, display: none) maps 1:1; such a host sees no gizmo anyway.
  const sx = canvas.clientWidth ? target.width / canvas.clientWidth : 1;
  const sy = canvas.clientHeight ? target.height / canvas.clientHeight : 1;
  // Written field by field, as in `renderInRect`: fractional numbers passed to `set` are boxed when it is not inlined.
  out.x = rect.x * sx;
  out.y = rect.y * sy;
  out.z = rect.width * sx;
  out.w = rect.height * sy;
  return out;
}
