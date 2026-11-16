import { afterEach, describe, expect, it, vi } from "vitest";
import type { Intersection } from "three";
import { Vector3 } from "three";
import type { GizmoAxisObject } from "../types.js";
import { mountGizmo, pointer, resetDefaultUp, targetObject } from "./test-utils.js";

const intersectedObjects = vi.fn();
vi.mock("../interaction/intersectedObjects.js", () => ({
  intersectedObjects: (...args: unknown[]) => intersectedObjects(...args),
}));

afterEach(() => {
  resetDefaultUp();
  vi.clearAllMocks();
  document.body.replaceChildren();
});

describe("hoverchange", () => {
  it("fires on focus transitions and debounces the same object", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: new Vector3(5, 5, 5) });

    const a = targetObject(gizmo, "right");
    const b = targetObject(gizmo, "top");

    const onHover = vi.fn();
    gizmo.addEventListener("hoverchange", onHover);

    intersectedObjects.mockReturnValueOnce({
      object: a,
      distance: 1,
    } as Intersection<GizmoAxisObject>);
    element.onpointermove!(pointer("pointermove"));
    expect(onHover).toHaveBeenCalledTimes(1);
    const first = onHover.mock.calls[0]![0];
    expect(first.object).toBe(a);
    expect(first.kind).toBe("face");
    expect(first.axes).toEqual(["x"]);
    expect(first.face).toBe("right");
    expect(first.direction).not.toBeNull();
    expect(first.direction!.x).toBeCloseTo(a.position.clone().normalize().x);
    expect(first.direction!.y).toBeCloseTo(a.position.clone().normalize().y);
    expect(first.direction!.z).toBeCloseTo(a.position.clone().normalize().z);

    intersectedObjects.mockReturnValueOnce({
      object: a,
      distance: 1,
    } as Intersection<GizmoAxisObject>);
    element.onpointermove!(pointer("pointermove"));
    expect(onHover).toHaveBeenCalledTimes(1);

    intersectedObjects.mockReturnValueOnce({
      object: b,
      distance: 1,
    } as Intersection<GizmoAxisObject>);
    element.onpointermove!(pointer("pointermove"));
    expect(onHover).toHaveBeenCalledTimes(2);
    const second = onHover.mock.calls[1]![0];
    expect(second.object).toBe(b);
    expect(second.kind).toBe("face");
    expect(second.axes).toEqual(["y"]);
    expect(second.face).toBe("top");

    intersectedObjects.mockReturnValueOnce(null);
    element.onpointermove!(pointer("pointermove"));
    expect(onHover).toHaveBeenCalledTimes(3);
    const cleared = onHover.mock.calls[2]![0];
    expect(cleared.object).toBeNull();
    expect(cleared.kind).toBeNull();
    expect(cleared.axes).toBeNull();
    expect(cleared.face).toBeNull();
    expect(cleared.direction).toBeNull();

    intersectedObjects.mockReturnValueOnce(null);
    element.onpointermove!(pointer("pointermove"));
    expect(onHover).toHaveBeenCalledTimes(3);
  });

  it("fires null on pointer leave once when focus existed", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const onHover = vi.fn();
    gizmo.addEventListener("hoverchange", onHover);

    const a = targetObject(gizmo, "right");
    intersectedObjects.mockReturnValueOnce({
      object: a,
      distance: 1,
    } as Intersection<GizmoAxisObject>);
    element.onpointermove!(pointer("pointermove"));
    expect(onHover).toHaveBeenCalledTimes(1);

    element.onpointerleave!(pointer("pointerleave"));
    expect(onHover).toHaveBeenCalledTimes(2);
    const leave = onHover.mock.calls[1]![0];
    expect(leave.object).toBeNull();
    expect(leave.kind).toBeNull();
    expect(leave.axes).toBeNull();
    expect(leave.face).toBeNull();
    expect(leave.direction).toBeNull();

    element.onpointerleave!(pointer("pointerleave"));
    expect(onHover).toHaveBeenCalledTimes(2);
  });

  it("includes corner identity on hover (face null)", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: new Vector3(5, 5, 5) });

    const corner = targetObject(gizmo, "top-front-right");
    expect(corner.userData.kind).toBe("corner");

    const onHover = vi.fn();
    gizmo.addEventListener("hoverchange", onHover);

    intersectedObjects.mockReturnValueOnce({
      object: corner,
      distance: 1,
    } as Intersection<GizmoAxisObject>);
    element.onpointermove!(pointer("pointermove"));

    expect(onHover).toHaveBeenCalledTimes(1);
    const evt = onHover.mock.calls[0]![0];
    expect(evt.object).toBe(corner);
    expect(evt.kind).toBe("corner");
    expect(evt.axes).toEqual(["x", "y", "z"]);
    expect(evt.face).toBeNull();
    expect(evt.direction).not.toBeNull();
  });
});
