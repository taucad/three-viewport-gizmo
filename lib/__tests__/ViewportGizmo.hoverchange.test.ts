import { afterEach, describe, expect, it, vi } from "vitest";
import type { Intersection } from "three";
import { Vector3 } from "three";
import type { GizmoAxisObject } from "../types.js";
import { createGizmo, getInternals, resetDefaultUp } from "./test-utils.js";

const intersectedObjects = vi.fn();
vi.mock("../utils/intersectedObjects.js", () => ({
  intersectedObjects: (...args: unknown[]) => intersectedObjects(...args),
}));

afterEach(() => {
  resetDefaultUp();
  vi.clearAllMocks();
});

describe("hoverchange", () => {
  it("fires on focus transitions and debounces the same object", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const internals = getInternals(gizmo);
    internals._distance = gizmo.camera.position.length();

    const a = internals._intersections[0]!;
    const b = internals._intersections[1]!;

    const onHover = vi.fn();
    gizmo.addEventListener("hoverchange", onHover);

    intersectedObjects.mockReturnValueOnce({
      object: a,
      distance: 1,
    } as Intersection<GizmoAxisObject>);
    internals._handleHover({} as PointerEvent);
    expect(onHover).toHaveBeenCalledTimes(1);
    expect(onHover.mock.calls[0]?.[0].object).toBe(a);

    intersectedObjects.mockReturnValueOnce({
      object: a,
      distance: 1,
    } as Intersection<GizmoAxisObject>);
    internals._handleHover({} as PointerEvent);
    expect(onHover).toHaveBeenCalledTimes(1);

    intersectedObjects.mockReturnValueOnce({
      object: b,
      distance: 1,
    } as Intersection<GizmoAxisObject>);
    internals._handleHover({} as PointerEvent);
    expect(onHover).toHaveBeenCalledTimes(2);
    expect(onHover.mock.calls[1]?.[0].object).toBe(b);

    intersectedObjects.mockReturnValueOnce(null);
    internals._handleHover({} as PointerEvent);
    expect(onHover).toHaveBeenCalledTimes(3);
    expect(onHover.mock.calls[2]?.[0].object).toBeNull();

    intersectedObjects.mockReturnValueOnce(null);
    internals._handleHover({} as PointerEvent);
    expect(onHover).toHaveBeenCalledTimes(3);
  });

  it("fires null from _onPointerLeave once when focus existed", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const internals = getInternals(gizmo);
    const onHover = vi.fn();
    gizmo.addEventListener("hoverchange", onHover);

    const a = internals._intersections[0]!;
    intersectedObjects.mockReturnValueOnce({
      object: a,
      distance: 1,
    } as Intersection<GizmoAxisObject>);
    internals._handleHover({} as PointerEvent);
    expect(onHover).toHaveBeenCalledTimes(1);

    internals._onPointerLeave();
    expect(onHover).toHaveBeenCalledTimes(2);
    expect(onHover.mock.calls[1]?.[0].object).toBeNull();

    internals._onPointerLeave();
    expect(onHover).toHaveBeenCalledTimes(2);
  });
});
