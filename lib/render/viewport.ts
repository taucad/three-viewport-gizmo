import { Vector4, type Camera, type Scene } from "three";
import type { GizmoViewport } from "../types";
import { isWebGPURenderer, type GizmoRenderer } from "./backend";

// The render path's one seam: F1's frame module (capture and restore, scissor, depth reset inside the rectangle only,
// render-target rectangles) replaces `renderInRect` and this file. Until then this is the 2.3.0 path, depth cleared by
// `autoClearDepth` (the F1 rows of the browser gate stay expected failures).

/** The gizmo's rectangle, written by {@link measureViewport}. */
export type MutableViewport = { -readonly [Key in keyof GizmoViewport]: GizmoViewport[Key] };

const _viewport = /*@__PURE__*/ new Vector4();
const _scissor = /*@__PURE__*/ new Vector4();

/**
 * Measures `element` against the renderer's canvas and writes the rectangle in CSS pixels, in the renderer's
 * `setViewport` convention: y from the top on `WebGPURenderer`, from the bottom on `WebGLRenderer` (issue #48).
 *
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

/**
 * Renders `scene` into `rect` over the host's frame, clearing depth only, and restores the host's viewport, scissor and
 * clear flags in `finally`.
 */
export function renderInRect(renderer: GizmoRenderer, scene: Scene, camera: Camera, rect: GizmoViewport): void {
  const scissorTest = renderer.getScissorTest();
  const { autoClear, autoClearColor, autoClearDepth, autoClearStencil } = renderer;
  const v = renderer.getViewport(_viewport);
  const s = scissorTest ? renderer.getScissor(_scissor) : _scissor;

  try {
    // Clear depth inside the render pass, not with renderer.clear(): on WebGPU that adds an output pass over the
    // sub-rectangle and leaves a translucent halo.
    renderer.autoClear = true;
    renderer.autoClearColor = false;
    renderer.autoClearDepth = true;
    renderer.autoClearStencil = false;
    renderer.setViewport(rect.x, rect.y, rect.width, rect.height);
    if (scissorTest) renderer.setScissor(rect.x, rect.y, rect.width, rect.height);
    renderer.render(scene, camera);
  } finally {
    renderer.setViewport(v.x, v.y, v.z, v.w);
    if (scissorTest) renderer.setScissor(s.x, s.y, s.z, s.w);
    renderer.autoClear = autoClear;
    renderer.autoClearColor = autoClearColor;
    renderer.autoClearDepth = autoClearDepth;
    renderer.autoClearStencil = autoClearStencil;
  }
}
