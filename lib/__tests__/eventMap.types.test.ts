import { describe, expectTypeOf, it } from "vitest";
import type { Vector3 } from "three";
import type {
  GizmoTargetKind,
  GizmoAxisName,
  GizmoAxisObject,
  GizmoAxisObjectUserData,
  GizmoFaceName,
  LegacyGizmoEventMap,
} from "../types.js";
import { GIZMO_AXES, GIZMO_FACES } from "../utils/constants.js";

describe("LegacyGizmoEventMap + userData contracts", () => {
  it("change and hoverchange carry identity fields", () => {
    expectTypeOf<LegacyGizmoEventMap["change"]>().toMatchTypeOf<{
      kind: GizmoTargetKind | null;
      axes: readonly GizmoAxisName[] | null;
      face: GizmoFaceName | null;
      direction: Vector3 | null;
    }>();
    expectTypeOf<LegacyGizmoEventMap["hoverchange"]>().toMatchTypeOf<{
      object: GizmoAxisObject | null;
      kind: GizmoTargetKind | null;
      axes: readonly GizmoAxisName[] | null;
      face: GizmoFaceName | null;
      direction: Vector3 | null;
    }>();
  });

  it("GizmoAxisObjectUserData optional fields", () => {
    expectTypeOf<GizmoAxisObjectUserData["kind"]>().toEqualTypeOf<
      GizmoTargetKind | undefined
    >();
    expectTypeOf<GizmoAxisObjectUserData["axes"]>().toEqualTypeOf<
      readonly GizmoAxisName[] | undefined
    >();
    expectTypeOf<GizmoAxisObjectUserData["face"]>().toEqualTypeOf<
      GizmoFaceName | undefined
    >();
    expectTypeOf<GizmoAxisObjectUserData["intersectionOrder"]>().toEqualTypeOf<
      number | undefined
    >();
  });

  it("constants tuples narrow to name unions (regression sentinel)", () => {
    expectTypeOf<(typeof GIZMO_FACES)[number]>().toEqualTypeOf<GizmoFaceName>();
    expectTypeOf<(typeof GIZMO_AXES)[number]>().toEqualTypeOf<GizmoAxisName>();
  });
});
