import { Euler, MathUtils, Mesh, Object3D, OrthographicCamera, PerspectiveCamera, Quaternion, Scene, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { resolveOptions } from "../options/resolve";
import { createInternalCamera } from "../render/internalCamera";
import { BACKGROUND_RADIUS } from "./background";
import { buildScene, faceScene } from "./build";
import { faceOnOutline } from "./outline";
import { updateScene } from "./update";

const sphere = () => buildScene(resolveOptions({ type: "sphere" }, { up: new Vector3(0, 1, 0) }));

/** A spread of host camera orientations, including the poles and a roll. */
const ORIENTATIONS = [
  [0, 0, 0],
  [Math.PI / 2, 0, 0],
  [-Math.PI / 2, 0, 0],
  [0.5, -0.7, 0],
  [2.1, 0.4, 1.3],
  [-1, 3, -2.5],
  [Math.PI, 0, 0],
].map(([x, y, z]) => new Quaternion().setFromEuler(new Euler(x, y, z)));

describe("sphere background", () => {
  it("draws at most 300 triangles (P10)", () => {
    const { geometry } = sphere().parts.background.object as Mesh;
    const count = geometry.index ? geometry.index.count : geometry.attributes.position.count;
    expect(count / 3).toBeLessThanOrEqual(300);
  });

  it.each(ORIENTATIONS.map((q, i) => [i, q] as const))("faces the gizmo camera at orientation %i", (_, q) => {
    const scene = sphere();
    const root = new Object3D();
    const world = new Scene().add(root);
    root.add(scene.group);
    root.quaternion.copy(q).invert();
    const camera = new OrthographicCamera(-1.8, 1.8, 1.8, -1.8, 5, 10);
    camera.position.set(0, 0, 7);
    world.updateMatrixWorld();
    const disc = scene.parts.background.object as Mesh;
    faceScene(scene, camera);

    const normal = new Vector3(0, 0, 1).transformDirection(disc.matrixWorld);
    const toCamera = new Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
    expect(normal.distanceTo(toCamera)).toBeLessThan(1e-6);
    // Behind the origin, where 2.3.0's back-facing sphere drew.
    expect(new Vector3().setFromMatrixPosition(disc.matrixWorld).distanceTo(new Vector3(0, 0, -BACKGROUND_RADIUS))).toBeLessThan(1e-6);
  });

  it.each([0.1, 26, 60, 90])("fills the element's circle through the gizmo's perspective camera at %s°", (degrees) => {
    const fieldOfView = MathUtils.degToRad(degrees);
    const scene = buildScene(resolveOptions({ type: "sphere", fieldOfView }, { up: new Vector3(0, 1, 0) }));
    const world = new Scene().add(scene.group);
    // Placed as the gizmo places it, for the sphere's outline.
    const camera = createInternalCamera(true, fieldOfView, faceOnOutline({ targets: scene.targets }, scene.options));
    world.updateMatrixWorld();
    camera.updateMatrixWorld();
    faceScene(scene, camera);
    const disc = scene.parts.background.object as Mesh;
    // The disc's rim, as drawn: the edge of the view in every direction, as 2.3.0's orthographic disc was.
    const rim = new Vector3(BACKGROUND_RADIUS, 0, 0).applyMatrix4(disc.matrixWorld).project(camera);
    expect(Math.hypot(rim.x, rim.y)).toBeCloseTo(1, 9);
  });

  it("follows a cheap fieldOfView change, set with the options rather than each frame", () => {
    const scene = sphere();
    const disc = scene.parts.background.object as Mesh;
    const at26 = disc.scale.x;
    updateScene(scene, resolveOptions({ type: "sphere", fieldOfView: Math.PI / 2 }, { up: new Vector3(0, 1, 0) }));
    expect(disc.scale.x).not.toBeCloseTo(at26, 3);
    faceScene(scene, createInternalCamera(true, Math.PI / 2));
    expect(disc.scale.x).toBe(disc.scale.y);
  });
});
