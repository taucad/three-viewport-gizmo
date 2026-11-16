import { afterEach, describe, expect, it, vi } from "vitest";
import type { Intersection } from "three";
import { Vector3 } from "three";
import type { GizmoAxisObject } from "../types.js";
import { createGizmo, resetDefaultUp, targetObject } from "./test-utils.js";

const intersectedObjects = vi.fn();
vi.mock("../interaction/intersectedObjects.js", () => ({
  intersectedObjects: (...args: unknown[]) => intersectedObjects(...args),
}));

afterEach(() => {
  resetDefaultUp();
  vi.restoreAllMocks();
});

describe("click flight", () => {
  it("keeps the camera upright on every frame from the Z-up corner to Top", () => {
    const up = new Vector3(0, 0, 1);
    const container = document.createElement("div");
    document.body.appendChild(container);
    const gizmo = createGizmo({
      defaultUp: up,
      cameraPosition: new Vector3(1, 1, 1).multiplyScalar(10),
      gizmoOptions: { type: "cube", container },
    });
    const top = targetObject(gizmo, "top");
    expect(top.position.z).toBeGreaterThan(0);
    intersectedObjects.mockReturnValue({ object: top, distance: 1 } as Intersection<GizmoAxisObject>);

    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);

    // jsdom does not route dispatched pointer events to `onpointerdown`; call the handler.
    const element = container.firstElementChild as HTMLElement;
    element.onpointerdown!(new MouseEvent("pointerdown", { clientX: 20, clientY: 20 }) as PointerEvent);
    document.dispatchEvent(new MouseEvent("pointerup", { clientX: 20, clientY: 20 }));
    expect(gizmo.animating).toBe(true);

    const right = new Vector3();
    for (let frame = 0; gizmo.animating && frame < 600; frame++) {
      gizmo.render();
      now += 1000 / 60;
      right.set(1, 0, 0).applyQuaternion(gizmo.camera.quaternion);
      expect(Math.abs(right.dot(up)), `frame ${frame}`).toBeLessThan(1e-9);
    }
    expect(gizmo.animating).toBe(false);

    gizmo.dispose();
    container.remove();
  });
});
