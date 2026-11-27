import { describe, expect, it, vi } from "vitest";
import {
  type BufferGeometry,
  type Material,
  MathUtils,
  Mesh,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  Vector3,
} from "three";
import { createStubRenderer } from "../__tests__/test-utils";
import { ViewportGizmoError } from "../errors";
import { resolveOptions } from "../options/resolve";
import { buildScene } from "../scene/build";
import { faceOnOutline } from "../scene/outline";
import {
  DEFAULT_FIELD_OF_VIEW,
  UNIT_FACE_OUTLINE,
  createInternalCamera,
  fieldOfViewDistance,
  setFieldOfView,
} from "./internalCamera";
import { warmUp } from "./warmUp";

/** Normalised device x of a point on the front face, after the camera's world matrix is current. */
const ndcX = (camera: PerspectiveCamera, point: Vector3): number => {
  camera.updateMatrixWorld();
  return point.clone().project(camera).x;
};

/** Every geometry and material under `root`, in traversal order. */
const resourcesOf = (root: Object3D): (BufferGeometry | Material)[] => {
  const resources: (BufferGeometry | Material)[] = [];
  root.traverse((object) => {
    const { geometry, material } = object as Partial<Mesh>;
    if (geometry) resources.push(geometry);
    for (const entry of [material].flat()) if (entry) resources.push(entry);
  });
  return resources;
};

describe("createInternalCamera", () => {
  it("matches 2.3.0 at the default field of view", () => {
    const camera = createInternalCamera(false) as PerspectiveCamera;
    expect(camera).toBeInstanceOf(PerspectiveCamera);
    expect(camera.fov).toBeCloseTo(26, 12);
    expect(camera.position.toArray()).toEqual([0, 0, 7]);
    expect(camera.near).toBeCloseTo(5, 12);
    expect(camera.far).toBeCloseTo(10, 12);
  });

  it("gives the sphere a perspective camera that draws its sprites at the size of 2.3.0's orthographic ±1.8", () => {
    const resolved = resolveOptions({ type: "sphere" }, { up: new Vector3(0, 1, 0) });
    const scene = buildScene(resolved);
    const camera = createInternalCamera(true, DEFAULT_FIELD_OF_VIEW, faceOnOutline({ targets: scene.targets }, resolved));
    expect(camera).toBeInstanceOf(PerspectiveCamera);
    expect(camera.fov).toBeCloseTo(26, 12);
    // Face-on its widest sprites sit at depth 0, where the view is ±1.8 as 2.3.0's was.
    expect(camera.position.z * Math.tan(DEFAULT_FIELD_OF_VIEW / 2)).toBeCloseTo(1.8, 12);
    expect(camera.position.z - camera.near).toBeCloseTo(2, 12);
    expect(camera.far - camera.position.z).toBeCloseTo(3, 12);
    const orthographic = new OrthographicCamera(-1.8, 1.8, 1.8, -1.8, 5, 10);
    orthographic.position.set(0, 0, 7);
    camera.updateMatrixWorld();
    orthographic.updateMatrixWorld();
    const edge = new Vector3(1.65, 0, 0);
    expect(edge.clone().project(camera).x).toBeCloseTo(edge.clone().project(orthographic).x, 12);
  });
});

describe("setFieldOfView", () => {
  it("takes radians and writes three's degrees", () => {
    const camera = createInternalCamera(false) as PerspectiveCamera;
    setFieldOfView(camera, Math.PI / 3);
    expect(camera.fov).toBeCloseTo(60, 12);
  });

  it.each([5, 26, 45, 60, 90])("keeps the front face's projected size at %i°", (degrees) => {
    const reference = createInternalCamera(false) as PerspectiveCamera;
    const camera = createInternalCamera(false, degrees * MathUtils.DEG2RAD) as PerspectiveCamera;
    const faceEdge = new Vector3(0.5, 0, 1);
    expect(ndcX(camera, faceEdge)).toBeCloseTo(ndcX(reference, faceEdge), 12);
    expect(camera.position.z).toBeCloseTo(fieldOfViewDistance(degrees * MathUtils.DEG2RAD), 12);
  });

  it("holds the clip margins around the origin and keeps near positive", () => {
    const camera = createInternalCamera(false) as PerspectiveCamera;
    setFieldOfView(camera, Math.PI / 4);
    expect(camera.position.z - camera.near).toBeCloseTo(2, 12);
    expect(camera.far - camera.position.z).toBeCloseTo(3, 12);

    setFieldOfView(camera, 3);
    expect(camera.near).toBeGreaterThan(0);
  });

  it("updates the projection matrix", () => {
    const camera = createInternalCamera(false) as PerspectiveCamera;
    const before = camera.projectionMatrix.clone();
    setFieldOfView(camera, Math.PI / 2);
    expect(camera.projectionMatrix.equals(before)).toBe(false);
  });

  it("follows the field of view on the sphere too", () => {
    const camera = createInternalCamera(true);
    const before = camera.projectionMatrix.clone();
    setFieldOfView(camera, Math.PI / 2, UNIT_FACE_OUTLINE, true);
    expect(camera.projectionMatrix.equals(before)).toBe(false);
    expect(camera.fov).toBeCloseTo(90, 12);
    expect(camera.position.z).toBeCloseTo(fieldOfViewDistance(Math.PI / 2, UNIT_FACE_OUTLINE, true), 12);
  });

  // 26 is degrees passed by mistake: 26 rad is outside (0, π).
  it.each([0, -1, Math.PI, Number.NaN, Number.POSITIVE_INFINITY, 26])("refuses %s with INVALID_OPTION", (value) => {
    const camera = createInternalCamera(false);
    try {
      setFieldOfView(camera, value);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ViewportGizmoError);
      expect((error as ViewportGizmoError).code).toBe("INVALID_OPTION");
    }
  });

  it.each(["cube", "rounded-cube", "sphere"] as const)(
    "rebuilds no geometry or material and compiles nothing new for a %s",
    async (type) => {
      const renderer = createStubRenderer();
      const options = resolveOptions({ type }, { up: new Vector3(0, 1, 0) });
      const root = new Object3D().add(buildScene(options).group);
      const scene = new Scene().add(root);
      const camera = createInternalCamera(type === "sphere");

      const resources = resourcesOf(root);
      expect(resources.length).toBeGreaterThan(0);
      const snapshot = () => resources.map((resource) => ("version" in resource ? resource.version : 0));
      const versions = snapshot();
      const children = root.children.slice();
      const disposed = vi.fn();
      for (const resource of resources) resource.addEventListener("dispose", disposed);

      const compileAsync = vi.fn(async () => {});
      Object.assign(renderer, { compileAsync });
      await warmUp(renderer, scene, camera);
      expect(compileAsync).toHaveBeenCalledWith(scene, camera);
      // Without KHR_parallel_shader_compile, compile synchronously: three's compileAsync would log a warning.
      const compile = vi.fn();
      Object.assign(renderer, { compile, extensions: { has: () => false } });
      await warmUp(renderer, scene, camera);
      expect(compile).toHaveBeenCalledWith(scene, camera);
      expect(compileAsync).toHaveBeenCalledTimes(1);

      setFieldOfView(camera, Math.PI / 3);

      expect(root.children).toEqual(children);
      expect(snapshot()).toEqual(versions);
      expect(disposed).not.toHaveBeenCalled();
      expect(resourcesOf(root)).toEqual(resources);
    }
  );
});

describe("DEFAULT_FIELD_OF_VIEW", () => {
  it("is 26° in radians", () => {
    expect(DEFAULT_FIELD_OF_VIEW).toBeCloseTo((26 * Math.PI) / 180, 15);
  });
});

describe("fieldOfViewDistance", () => {
  /** The drawn width of `outline` at `distance`, over the view's half-height: the points drawn from there, each side. */
  const width = (outline: readonly number[], distance: number, degrees: number) => {
    let right = 0;
    let left = 0;
    for (let i = 0; i < outline.length; i += 3) {
      if (outline[i + 2]! > distance) continue;
      const x = outline[i + 1]! / (distance - outline[i]!);
      right = Math.max(right, x);
      left = Math.max(left, -x);
    }
    return (right + left) / Math.tan((degrees * MathUtils.DEG2RAD) / 2);
  };
  /** `points` right of the centre and their mirror images left of it. */
  const mirrored = (points: readonly number[]) => points.concat(points.map((v, i) => (i % 3 === 1 ? -v : v)));

  it("is 2.3.0's 1 + 6 tan(13°) / tan(fov / 2) for the unit front edges, and 7 at 26° for any outline", () => {
    for (const degrees of [0.1, 10, 45, 90, 170])
      expect(fieldOfViewDistance(degrees * MathUtils.DEG2RAD)).toBeCloseTo(
        1 + (6 * Math.tan(DEFAULT_FIELD_OF_VIEW / 2)) / Math.tan((degrees * MathUtils.DEG2RAD) / 2),
        12
      );
    expect(fieldOfViewDistance(DEFAULT_FIELD_OF_VIEW, [0.7, 1, -Infinity, 0.9, -0.6, -Infinity])).toBe(7);
  });

  it("holds a many-point outline's face-on width exactly, whichever point bounds it", () => {
    // Nearer points narrower, as round a bevel.
    const arc = mirrored([0.9, 0.7, -Infinity, 0.85, 0.8, -Infinity, 0.79, 0.86, -Infinity, 0.7, 0.9, -Infinity]);
    const at26 = width(arc, 7, 26);
    for (const degrees of [0.1, 30, 60, 90, 150])
      expect(width(arc, fieldOfViewDistance(degrees * MathUtils.DEG2RAD, arc), degrees)).toBeCloseTo(at26, 12);
  });

  it("holds a lopsided outline's width, each side bounded by its own point", () => {
    // Right: wide at depth 0 and narrow near the camera; left: one far point and one nearer.
    const lopsided = [0, 1.65, -Infinity, 1.2, 1.28, -Infinity, 0, -1.2, -Infinity, 1.2, -1.28, -Infinity, -1.3, -0.3, -Infinity];
    for (const sphere of [false, true]) {
      const at26 = width(lopsided, fieldOfViewDistance(DEFAULT_FIELD_OF_VIEW, lopsided, sphere), 26);
      for (const degrees of [0.1, 30, 60, 90])
        expect(width(lopsided, fieldOfViewDistance(degrees * MathUtils.DEG2RAD, lopsided, sphere), degrees)).toBeCloseTo(at26, 12);
    }
  });

  it("gives the sphere its orthographic ±1.8 width at every field of view", () => {
    const sprites = [1.3, 0.35, -Infinity, 1.3, -0.35, -Infinity, 0, 1.65, -Infinity, 0, -1.525, -Infinity];
    for (const degrees of [0.1, 26, 45, 90])
      expect(width(sprites, fieldOfViewDistance(degrees * MathUtils.DEG2RAD, sprites, true), degrees)).toBeCloseTo(3.175 / 1.8, 12);
  });

  it("counts a plate only from the distance that draws it, and holds the size across its turn", () => {
    // The classic cube's background side (1 at 0.9, always) and a large corner plate (1.2 at 0.7) drawn beyond 2.55:
    // the corner bounds the size until the camera comes too near for it to face, then the background does.
    const plates = mirrored([0.9, 1, -Infinity, 0.7, 1.2, 2.55]);
    const at26 = width(plates, 7, 26);
    for (const degrees of [0.1, 5, 20, 45, 90]) {
      const distance = fieldOfViewDistance(degrees * MathUtils.DEG2RAD, plates);
      expect(width(plates, distance, degrees)).toBeCloseTo(at26, 12);
    }
    expect(fieldOfViewDistance(Math.PI / 2, plates)).toBeLessThan(2.55);
    // Counting the corner plate at 90° though it faces away would put the camera farther.
    const always = mirrored([0.9, 1, -Infinity, 0.7, 1.2, -Infinity]);
    expect(fieldOfViewDistance(Math.PI / 2, always)).toBeGreaterThan(fieldOfViewDistance(Math.PI / 2, plates));
  });

  it("finds a plate that turns toward the camera on the way out, and the least distance that holds the size", () => {
    // Only a far plate is drawn at first; the near point, drawn from 3, then bounds the size.
    const outline = mirrored([0.95, 0.5, 3, -0.5, 0.9, -Infinity]);
    for (const degrees of [10, 45, 90]) {
      const distance = fieldOfViewDistance(degrees * MathUtils.DEG2RAD, outline);
      expect(width(outline, distance, degrees)).toBeCloseTo(width(outline, 7, 26), 12);
    }
  });
});
