import { vi } from "vitest";
import type { GizmoTargetName } from "../index.js";
import type { LegacyGizmoOptions, GizmoAxisObject } from "../types.js";
import { ViewportGizmo } from "../ViewportGizmo.js";
import type { WebGLRenderer } from "three";
import { Object3D, PerspectiveCamera, Vector3, Vector4 } from "three";

/** The object `gizmo.root` draws for the target `name`: the child placed along the target's direction. */
export function targetObject(gizmo: ViewportGizmo, name: GizmoTargetName): GizmoAxisObject {
  const target = gizmo.targets.find((candidate) => candidate.name === name);
  const object = gizmo.root.children.find(
    (child) => child.userData.kind && target && child.position.clone().normalize().distanceTo(target.direction) < 1e-9
  );
  if (!object) throw new Error(`no object for target ${name}`);
  return object as GizmoAxisObject;
}

/** The objects `gizmo.root` draws for its targets, in `gizmo.targets` order. */
export function targetObjects(gizmo: ViewportGizmo): GizmoAxisObject[] {
  return gizmo.targets.map((target) => targetObject(gizmo, target.name));
}

export type StubRendererOptions = {
  readonly isWebGPURenderer?: boolean;
};

/** Minimal renderer stub — never performs GL / WebGPU initialization. */
export function createStubRenderer(
  options: StubRendererOptions = {}
): WebGLRenderer {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;

  Object.defineProperty(canvas, "clientWidth", {
    value: 800,
    configurable: true,
    enumerable: true,
  });
  Object.defineProperty(canvas, "clientHeight", {
    value: 600,
    configurable: true,
    enumerable: true,
  });

  const stub = {
    domElement: canvas,
    isWebGPURenderer: options.isWebGPURenderer === true,
    autoClear: true,
    getViewport: (target: Vector4): Vector4 => target.set(0, 0, 800, 600),
    getScissorTest: (): boolean => false,
    getScissor: (target: Vector4): Vector4 => target.set(0, 0, 800, 600),
    setViewport: (): void => {
      /* No-op. */
    },
    setScissor: (): void => {
      /* No-op. */
    },
    clear: (): void => {
      /* No-op. */
    },
    render: (): void => {
      /* No-op. */
    },
  };
  return stub as unknown as WebGLRenderer;
}

export type CreateGizmoOptions = {
  readonly defaultUp?: Vector3;
  readonly cameraPosition: Vector3;
  readonly gizmoOptions?: LegacyGizmoOptions;
};

export function createGizmo({
  defaultUp = new Vector3(0, 1, 0),
  cameraPosition,
  gizmoOptions = { type: "cube" },
}: CreateGizmoOptions): ViewportGizmo {
  Object3D.DEFAULT_UP.copy(defaultUp);
  const camera = new PerspectiveCamera(50, 1, 0.1, 1000);
  camera.up.copy(defaultUp);
  camera.position.copy(cameraPosition);
  camera.lookAt(0, 0, 0);
  return new ViewportGizmo(camera, createStubRenderer(), gizmoOptions);
}

/**
 * Creates a gizmo in a fresh container whose element measures as a 128 px square at the page origin.
 *
 * @returns The gizmo, its element and the container, which the caller removes
 */
export function mountGizmo({ gizmoOptions = { type: "cube" }, ...options }: CreateGizmoOptions) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const gizmo = createGizmo({ ...options, gizmoOptions: { ...gizmoOptions, container } });
  const element = container.firstElementChild as HTMLElement;
  element.getBoundingClientRect = () => DOMRect.fromRect({ x: 0, y: 0, width: 128, height: 128 });
  gizmo.update();
  return { gizmo, element, container };
}

/** A pointer event at (20, 20) for the element's `on*` handlers, which jsdom does not route dispatched events to. */
export function pointer(type: string): PointerEvent {
  return new MouseEvent(type, { clientX: 20, clientY: 20 }) as PointerEvent;
}

export function resetDefaultUp(): void {
  Object3D.DEFAULT_UP.set(0, 1, 0);
}

/** One frame of an animated view change, at 60 frames per second. */
export const FRAME_MS = 1000 / 60;

/**
 * Renders `gizmo` once per frame, `FRAME_MS` apart on a mocked `performance.now`
 * that starts at `startMs`, until its view change ends.
 *
 * @returns The number of frames rendered
 */
export function runFlight(
  gizmo: ViewportGizmo,
  onFrame?: (frame: number) => void,
  startMs = 0
): number {
  let now = startMs;
  const spy = vi.spyOn(performance, "now").mockImplementation(() => now);
  let frame = 0;
  for (; gizmo.animating && frame < 600; frame++) {
    gizmo.render();
    onFrame?.(frame);
    now += FRAME_MS;
  }
  spy.mockRestore();
  return frame;
}
