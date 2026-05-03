import type { GizmoOptions, GizmoAxisObject } from "../types.js";
import { ViewportGizmo } from "../ViewportGizmo.js";
import type { WebGLRenderer } from "three";
import {
  Object3D,
  PerspectiveCamera,
  Quaternion,
  Vector3,
  Vector4,
} from "three";
export type ViewportGizmoInternals = {
  _quaternionStart: Quaternion;
  _quaternionEnd: Quaternion;
  _targetQuaternion: Quaternion;
  _focus: GizmoAxisObject | null;
  _intersections: GizmoAxisObject[];
  _distance: number;
  _lastAnimateTimeSeconds: number | null;
  _setOrientation: (position: Vector3) => void;
  _handleHover: (e: PointerEvent) => void;
  _onPointerLeave: () => void;
  _animate: () => void;
};

export function getInternals(gizmo: ViewportGizmo): ViewportGizmoInternals {
  return gizmo as unknown as ViewportGizmoInternals;
}

export function createStubRenderer(): WebGLRenderer {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  return {
    domElement: canvas,
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
  } as unknown as WebGLRenderer;
}

export type CreateGizmoOptions = {
  readonly defaultUp?: Vector3;
  readonly cameraPosition: Vector3;
  readonly gizmoOptions?: GizmoOptions;
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

export function resetDefaultUp(): void {
  Object3D.DEFAULT_UP.set(0, 1, 0);
}
