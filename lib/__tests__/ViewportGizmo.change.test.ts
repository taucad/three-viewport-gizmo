import { afterEach, describe, expect, it, vi } from "vitest";
import type { Intersection } from "three";
import { Vector3 } from "three";
import type { GizmoAxisObject } from "../types.js";
import { mountGizmo, pointer, resetDefaultUp, runFlight, targetObject } from "./test-utils.js";

const intersectedObjects = vi.fn();
vi.mock("../interaction/intersectedObjects.js", () => ({
  intersectedObjects: (...args: unknown[]) => intersectedObjects(...args),
}));

afterEach(() => {
  resetDefaultUp();
  vi.clearAllMocks();
});

/** Presses and releases on the spot: a click. */
function click(element: HTMLElement) {
  element.onpointerdown!(pointer("pointerdown"));
  document.dispatchEvent(pointer("pointerup"));
}

describe("click change payload", () => {
  it("dispatches enriched change for a face hit", () => {
    const { gizmo, element, container } = mountGizmo({ cameraPosition: new Vector3(5, 5, 5) });

    const face = targetObject(gizmo, "right");
    intersectedObjects.mockReturnValue({
      object: face,
      distance: 1,
    } as Intersection<GizmoAxisObject>);

    const onChange = vi.fn();
    gizmo.addEventListener("change", onChange);

    click(element);

    expect(onChange).toHaveBeenCalledTimes(1);
    const detail = onChange.mock.calls[0]![0];
    expect(detail.kind).toBe("face");
    expect(detail.axes).toEqual(["x"]);
    expect(detail.face).toBe("right");
    expect(detail.direction).not.toBeNull();
    expect(detail.direction!.x).toBeCloseTo(face.position.clone().normalize().x);
    expect(detail.direction!.y).toBeCloseTo(face.position.clone().normalize().y);
    expect(detail.direction!.z).toBeCloseTo(face.position.clone().normalize().z);

    gizmo.dispose();
    container.remove();
  });

  it("emits one balanced interaction with no change after end", () => {
    const queuedFrames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      queuedFrames.push(callback);
      return queuedFrames.length;
    });

    const { gizmo, element, container } = mountGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    intersectedObjects.mockReturnValue({
      object: targetObject(gizmo, "right"),
      distance: 1,
    } as Intersection<GizmoAxisObject>);

    const events: string[] = [];
    gizmo.addEventListener("start", () => events.push("start"));
    gizmo.addEventListener("change", () => events.push("change"));
    gizmo.addEventListener("end", () => events.push("end"));

    click(element);

    runFlight(gizmo);
    expect(gizmo.animating).toBe(false);
    queuedFrames.splice(0).forEach((callback) => callback(0));

    expect(events.filter((event) => event === "start")).toHaveLength(1);
    expect(events.filter((event) => event === "end")).toHaveLength(1);
    expect(events.at(-1)).toBe("end");

    gizmo.dispose();
    container.remove();
  });

  it("balances pointer start with end when a click misses the gizmo", () => {
    intersectedObjects.mockReturnValue(null);
    const { gizmo, element, container } = mountGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const events: string[] = [];
    gizmo.addEventListener("start", () => events.push("start"));
    gizmo.addEventListener("end", () => events.push("end"));

    click(element);

    expect(events).toEqual(["start", "end"]);

    gizmo.dispose();
    container.remove();
  });
});
