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

describe("_handleClick change payload", () => {
  it("dispatches enriched change for a face hit", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const internals = getInternals(gizmo);
    internals._distance = gizmo.camera.position.length();

    const face = internals._intersections[0]!;
    intersectedObjects.mockReturnValue({
      object: face,
      distance: 1,
    } as Intersection<GizmoAxisObject>);

    const onChange = vi.fn();
    gizmo.addEventListener("change", onChange);

    internals._handleClick({} as PointerEvent);

    expect(onChange).toHaveBeenCalledTimes(1);
    const detail = onChange.mock.calls[0]![0];
    expect(detail.kind).toBe("face");
    expect(detail.axes).toEqual(["x"]);
    expect(detail.face).toBe("right");
    expect(detail.direction).not.toBeNull();
    expect(detail.direction!.x).toBeCloseTo(face.position.clone().normalize().x);
    expect(detail.direction!.y).toBeCloseTo(face.position.clone().normalize().y);
    expect(detail.direction!.z).toBeCloseTo(face.position.clone().normalize().z);
  });
});
