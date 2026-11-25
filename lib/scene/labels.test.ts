import { afterEach, describe, expect, it, vi } from "vitest";
import { Vector3, type CanvasTexture } from "three";
import { resolveOptions } from "../options/resolve";
import type { GizmoOptions } from "../types";
import { GIZMO_AXES } from "../utils/constants";
import type { SceneOptions } from "./build";
import { canvasLabels, labelTexels, textureBytes } from "./labels";

const resolve = (options: GizmoOptions) =>
  resolveOptions(options, { up: new Vector3(0, 1, 0) }) as unknown as SceneOptions;

/** Every texture a cube or sphere scene asks for: its faces, and on the sphere its edge and corner sprites. */
const request = (o: SceneOptions) => {
  const labels = canvasLabels(o);
  const parts = o.type === "sphere" ? [...GIZMO_AXES, "edge", "corner"] as const : GIZMO_AXES;
  const textures = new Set(parts.flatMap((part) => [labels.texture(part, "idle"), labels.texture(part, "hover")]));
  return { labels, textures: [...textures] as CanvasTexture[] };
};

const side = (texture: CanvasTexture) => (texture.image as HTMLCanvasElement).width;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("canvasLabels", () => {
  it.each([1, 2])("gives the default cube 12 textures within 1.5 MB at device pixel ratio %d", (dpr) => {
    vi.stubGlobal("devicePixelRatio", dpr);
    const o = resolve({ type: "cube" });
    const { textures } = request(o);
    expect(textures).toHaveLength(12);
    // 128 CSS px, faces at scale 0.7: 64.7 px across, so 65 texels at 1 and 130 at 2.
    for (const texture of textures) expect(side(texture)).toBe(dpr === 1 ? 65 : 130);
    expect(textures.reduce((sum, t) => sum + textureBytes(side(t)), 0)).toBeLessThanOrEqual(1.5 * 2 ** 20);
  });

  it("shares a part's texture between idle and hover where their looks are equal (D14)", () => {
    const o = resolve({ type: "cube", x: { hover: { color: 0xffffff } } });
    const { labels, textures } = request(o);
    expect(textures).toHaveLength(10); // x and nx (it fills from x) hover like they rest
    expect(labels.texture("x", "hover")).toBe(labels.texture("x", "idle"));
    expect(labels.texture("y", "hover")).not.toBe(labels.texture("y", "idle"));
  });

  it("sizes sphere labels from size and device pixel ratio unless resolution is set (D13)", () => {
    vi.stubGlobal("devicePixelRatio", 3);
    const o = resolve({ size: 256 });
    // 256 CSS px over ±1.8 units, the x sprite at its hover scale 0.7: 49.8 px, 299 texels at 3 oversampled 2×.
    expect(labelTexels(o, "x", 3)).toBe(299);
    expect(labelTexels(o, "edge", 3)).toBe(86); // hover scale 0.2: 14.2 px
    expect(labelTexels(resolve({ size: 256, resolution: 512 }), "x", 3)).toBe(512);
    expect(labelTexels(resolve({ size: 256, resolution: 32 }), "x", 3)).toBe(32);
  });

  it("frees a hover texture that a cheap change makes equal to idle, and redraws the rest in place", () => {
    const o = resolve({ type: "cube" });
    const { labels, textures } = request(o);
    const hover = labels.texture("y", "hover");
    const dispose = vi.spyOn(hover, "dispose");
    const idle = labels.texture("y", "idle");
    const version = idle.version;
    labels.update(resolve({ type: "cube", y: { hover: { color: 0xffffff } } }));
    expect(dispose).toHaveBeenCalled();
    expect(labels.texture("y", "hover")).toBe(idle);
    expect(idle.version).toBeGreaterThan(version);
    labels.dispose();
    expect(textures).toHaveLength(12);
  });

  it("draws rounded-cube faces edge to edge, since its pieces carry the rounding (S5)", () => {
    const radii: number[] = [];
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () =>
        new Proxy(
          {
            arcTo: (...args: number[]) => radii.push(args[4]),
            measureText: (text: string) => ({ width: text.length * 10 }),
          },
          { get: (target, key) => (key in target ? target[key as keyof typeof target] : () => {}) }
        ) as never
    );
    request(resolve({ type: "rounded-cube" }));
    expect(radii.length).toBeGreaterThan(0);
    expect(new Set(radii)).toEqual(new Set([0]));
    radii.length = 0;
    request(resolve({ type: "cube" }));
    expect(Math.min(...radii)).toBeGreaterThan(0);
  });

  it("draws at finite coordinates when the browser has no font bounding box metrics (U3)", () => {
    const calls: { font: string; y: number }[] = [];
    let font = "";
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () =>
        new Proxy(
          {
            set font(value: string) {
              font = value;
            },
            get font() {
              return font;
            },
            measureText: (text: string) => ({ width: text.length * 10 }), // no bounding box metrics at all
            fillText: (_: string, __: number, y: number) => calls.push({ font, y }),
          },
          { get: (target, key) => (key in target ? target[key as keyof typeof target] : () => {}) }
        ) as never
    );
    for (const type of ["sphere", "cube"] as const) request(resolve({ type }));
    expect(calls.length).toBeGreaterThan(0);
    for (const { font, y } of calls) {
      expect(Number.isFinite(y)).toBe(true);
      expect(font).toMatch(/^900 \d+px sans-serif$/);
    }
  });

  /** A face whose load the test settles: `status` and `loaded` as a `FontFace` has them. */
  type Face = { status: FontFaceLoadStatus; loaded: Promise<unknown>; settle(): void };
  const face = (): Face => {
    let settle!: () => void;
    const f: Face = {
      status: "loading",
      loaded: new Promise<void>((r) => (settle = r)),
      settle: () => {
        f.status = "loaded";
        settle();
      },
    };
    return f;
  };

  /**
   * A `document.fonts` stand-in. `load()` adds a loading face and starts a round as the engines do: `loading`, with a
   * fresh `ready`, or with `ready` left already settled (`stale`, what Safari 27.2 was seen to do).
   * `event: false` fires `loading` with no `fontfaces`, as Chromium does.
   */
  const fontSet = ({ status = "loaded", stale = false }: { status?: FontFaceSetLoadStatus; stale?: boolean } = {}) => {
    const faces: Face[] = [];
    let finish = () => {};
    const fonts = Object.assign(new EventTarget(), {
      status,
      ready: Promise.resolve() as Promise<unknown>,
      forEach: (fn: (f: Face) => void) => faces.forEach(fn),
      load({ event = true } = {}) {
        const f = face();
        faces.push(f);
        // `ready` stays one promise while the set is loading.
        if (fonts.status !== "loading" && !stale) fonts.ready = new Promise<void>((r) => (finish = r));
        fonts.status = "loading";
        fonts.dispatchEvent(Object.assign(new Event("loading"), { fontfaces: event ? [f] : [] }));
        return f;
      },
      /** Settles every face, then the set. */
      async done() {
        for (const f of faces) f.settle();
        fonts.status = "loaded";
        finish();
        await flush();
      },
    });
    if (status === "loading") fonts.ready = new Promise<void>((r) => (finish = r));
    vi.stubGlobal("document", Object.assign(document, { fonts }));
    return fonts;
  };
  const flush = async () => {
    for (let i = 0; i < 10; i++) await Promise.resolve();
  };

  /** Animation frames the test runs by hand. */
  const frames = () => {
    const queue: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => queue.push(cb));
    return async () => {
      for (const cb of queue.splice(0)) cb(0);
      await flush();
    };
  };

  it("redraws once when a round of font loading ends, after a frame, with no set() and no loadingdone", async () => {
    const frame = frames();
    const fonts = fontSet();
    const { labels } = request(resolve({ type: "cube" }));
    const texture = labels.texture("x", "idle");
    const version = texture.version;
    labels.onRedraw = vi.fn();
    fonts.load();
    fonts.load(); // a second face joins the same round
    expect(labels.onRedraw).not.toHaveBeenCalled();
    await fonts.done();
    expect(labels.onRedraw).not.toHaveBeenCalled(); // the canvas sees the face at the next rendering update
    await frame();
    expect(texture.version).toBeGreaterThan(version);
    expect(labels.onRedraw).toHaveBeenCalledOnce();
    fonts.load();
    await fonts.done();
    await frame();
    expect(labels.onRedraw).toHaveBeenCalledTimes(2);
  });

  it("waits for the faces when `ready` is already settled at `loading` (Safari)", async () => {
    const frame = frames();
    const fonts = fontSet({ stale: true });
    const { labels } = request(resolve({ type: "cube" }));
    labels.onRedraw = vi.fn();
    const f = fonts.load();
    await flush();
    await frame();
    expect(labels.onRedraw).not.toHaveBeenCalled();
    f.settle();
    await flush();
    await frame();
    expect(labels.onRedraw).toHaveBeenCalledOnce();
  });

  it("finds loading faces in the set when the event names none (Chromium), and waits for one that joins", async () => {
    const frame = frames();
    const fonts = fontSet({ stale: true });
    const { labels } = request(resolve({ type: "cube" }));
    labels.onRedraw = vi.fn();
    const first = fonts.load({ event: false });
    const second = fonts.load({ event: false }); // joins the round under way: no second round
    first.settle();
    await flush();
    await frame();
    expect(labels.onRedraw).not.toHaveBeenCalled();
    second.settle();
    await flush();
    await frame();
    expect(labels.onRedraw).toHaveBeenCalledOnce();
  });

  it("keeps the round open for a face that starts loading during its frame wait", async () => {
    const frame = frames();
    const fonts = fontSet({ stale: true });
    const { labels } = request(resolve({ type: "cube" }));
    labels.onRedraw = vi.fn();
    const first = fonts.load();
    first.settle();
    await flush(); // the round now waits for its frame
    const late = fonts.load(); // its `loading` arrives while the round is waiting
    await frame();
    expect(labels.onRedraw).not.toHaveBeenCalled();
    late.settle();
    await flush();
    await frame();
    expect(labels.onRedraw).toHaveBeenCalledOnce();
  });

  it("falls back to the set's `ready` when no face is loading", async () => {
    const frame = frames();
    const fonts = fontSet();
    const { labels } = request(resolve({ type: "cube" }));
    labels.onRedraw = vi.fn();
    let finish!: () => void;
    fonts.ready = new Promise<void>((r) => (finish = r));
    fonts.dispatchEvent(new Event("loading"));
    await flush();
    await frame();
    expect(labels.onRedraw).not.toHaveBeenCalled();
    finish();
    await flush();
    await frame();
    expect(labels.onRedraw).toHaveBeenCalledOnce();
  });

  it("counts a round already under way at construction", async () => {
    const frame = frames();
    const fonts = fontSet({ status: "loading" });
    const { labels } = request(resolve({ type: "cube" }));
    labels.onRedraw = vi.fn();
    await fonts.done();
    await frame();
    expect(labels.onRedraw).toHaveBeenCalledOnce();
  });

  it("never redraws after dispose, even for a round pending at dispose or its frame", async () => {
    const frame = frames();
    const fonts = fontSet();
    const { labels } = request(resolve({ type: "cube" }));
    labels.texture("x", "idle");
    labels.onRedraw = vi.fn();
    fonts.load();
    labels.dispose();
    await fonts.done();
    await frame();
    fonts.load();
    await fonts.done();
    await frame();
    const late = fontSet();
    const other = canvasLabels(resolve({ type: "cube" }));
    other.onRedraw = vi.fn();
    late.load();
    await late.done(); // the round is waiting for its frame
    other.dispose();
    await frame();
    expect(labels.onRedraw).not.toHaveBeenCalled();
    expect(other.onRedraw).not.toHaveBeenCalled();
  });
});
