/**
 * F0 spike (P2): which depth mechanism keeps the host's depth outside the gizmo's rectangle and
 * still draws the gizmo over the host inside it, on both backends, with standard, reversed and
 * logarithmic depth. Every candidate's outcome is asserted, so the table stays reproducible.
 * F1 deletes this directory when it lands the chosen mechanism (resetQuad).
 */
import { expect, measured, test } from "../../fixtures";

const kinds = ["baseline", "scissorInline", "scissorClearDepth", "resetQuad", "resetQuadNaive", "depthAlways", "prepass", "none"] as const;
type Kind = (typeof kinds)[number];
type Probe = { outsideChanged: number; insideWrong: number; lateCovers: number; covered: number; centre: number[]; restored: boolean };

/** Expected pass (outside unchanged, inside correct, host scissor restored); the same for host scissor off and on. */
const expected = (kind: Kind, backend: string, depth: string, type: string): boolean =>
  ({
    baseline: false, // 2.3.0: whole-canvas depth clear (Finding 2) with scissor off, a stale scissor restore (G3) with it on
    scissorInline: backend === "webgl", // WebGPU's depthLoadOp clear ignores the scissor
    scissorClearDepth: backend === "webgl", // the same: renderer.clearDepth() clears the whole attachment on WebGPU
    resetQuad: true, // the chosen mechanism
    resetQuadNaive: depth !== "reversed", // three r184 turns AlwaysDepth into NeverDepth under reversed depth
    depthAlways: type === "cube", // the convex cube survives back-to-front order; the sphere's sprites do not
    prepass: false, // overrideMaterial loses the labels' alpha, and every gizmo draw runs twice
    none: false, // control: the near wall hides the gizmo
  })[kind];

for (const type of ["cube", "sphere"] as const) {
  for (const depth of ["default", "reversed", "log"] as const) {
    test(`F0 depth candidates, ${type}, ${depth} depth`, async ({ page, open }, info) => {
      const backend = info.project.name;
      test.setTimeout(300_000); // software WebGPU (SwiftShader) reads back 48 full frames slowly
      await open(); // checks the WebGPU adapter; the spike page is opened below
      await page.goto(`/tests/browser/spikes/depth-reset/index.html?${new URLSearchParams({ backend, depth, type })}`);
      await page.waitForFunction("window.READY === true", null, { timeout: 30_000 });
      const S = <T>(e: string) => page.evaluate<T>(`S.${e}`);
      const env = await S<{ depthActive: boolean; webgpuBackend: boolean }>("env()");
      test.skip(!env.depthActive, "WebGLRenderer has no EXT_clip_control here, so no reversed depth");
      const rows: Record<string, unknown> = {};
      const failures: string[] = [];
      for (const kind of kinds) {
        for (const scissor of [false, true]) {
          const p = await S<Probe>(`probe('${kind}', ${scissor})`);
          const pass = p.outsideChanged === 0 && p.insideWrong === 0 && p.restored;
          rows[`${kind}/${scissor ? "on" : "off"}`] = { ...p, pass };
          if (pass !== expected(kind, backend, depth, type)) failures.push(`${kind} scissor ${scissor}: ${JSON.stringify(p)}`);
          expect(p.covered, "the gizmo covers pixels to compare").toBeGreaterThan(500);
        }
        rows[`${kind}/cost`] = await S(`cost('${kind}', 100)`);
      }
      measured(info, { env, rows });
      expect(failures).toEqual([]);
    });
  }
}
