// F0 spike (P2): candidate mechanisms that make the gizmo draw over the host's depth inside its
// rectangle and keep the host's depth outside it. Drives the real 2.3.0 gizmo through its private
// fields; F1 moves the chosen mechanism into lib/render/frame.ts and deletes this directory.
// ?backend=webgl|webgpu&depth=default|reversed|log&type=cube|sphere
const q = new URLSearchParams(location.search);
const backend = q.get('backend') || 'webgl';
const depth = q.get('depth') || 'default';
const type = q.get('type') || 'cube';
const W = 800, H = 600;
const THREE = backend === 'webgpu' ? await import('three/webgpu') : await import('three');
const { ViewportGizmo } = await import('@lib/index');

const wrap = document.getElementById('wrap');
wrap.style.width = W + 'px'; wrap.style.height = H + 'px';
const params = { antialias: true, reversedDepthBuffer: depth === 'reversed', logarithmicDepthBuffer: depth === 'log' };
const renderer = backend === 'webgpu' ? new THREE.WebGPURenderer(params) : new THREE.WebGLRenderer(params);
renderer.setPixelRatio(1); renderer.setSize(W, H); wrap.appendChild(renderer.domElement);
if (backend === 'webgpu') await renderer.init();
renderer.info.autoReset = false;
// WebGLRenderer drops reversedDepthBuffer silently without EXT_clip_control.
const depthActive = depth !== 'reversed' || backend === 'webgpu' || renderer.state.buffers.depth.getReversed();

// Host: a box at the centre, a near wall over the gizmo's corner, and a far red quad drawn after the gizmo.
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
camera.position.set(3, 2, 4); camera.lookAt(0, 0, 0);
const scene = new THREE.Scene().add(camera);
scene.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: 0x4488cc })));
// The wall sits 0.105 from the eye, so its depth is nearer than any gizmo fragment's (internal camera near 5, far 10).
const k = 0.105 / 0.5;
const wall = new THREE.Mesh(new THREE.PlaneGeometry(0.5 * k, 0.4 * k), new THREE.MeshBasicMaterial({ color: 0x33aa55 }));
wall.position.set((0.05 + 0.25) * k, (0.05 + 0.2) * k, -0.105); camera.add(wall); // top-right quadrant, under the gizmo
const far = new THREE.Scene();
const quad = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
quad.position.copy(camera.position).multiplyScalar(-1); quad.lookAt(camera.position); far.add(quad);
const empty = new THREE.Scene();

const g = new ViewportGizmo(camera, renderer, { type, container: wrap });
g.update(); g.render(); // puts root in the gizmo's scene
const gScene = g._scene, gCamera = g._camera, rect = g._viewport;
// three r184 maps AlwaysDepth to NeverDepth under a reversed depth buffer on both backends
// (ReversedDepthFuncs in three/src/utils.js), so "always" is spelled NeverDepth there.
const reversed = backend === 'webgpu' ? renderer.reversedDepthBuffer : renderer.capabilities.reversedDepthBuffer;
const ALWAYS = reversed ? THREE.NeverDepth : THREE.AlwaysDepth;

// Candidate C: a depth-reset quad. Static, a sibling of root (root turns, the internal camera never moves),
// just inside the internal camera's far plane (z = 7 - 10), drawn first, writing depth only.
const reset = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true, depthTest: true, depthFunc: THREE.AlwaysDepth }),
);
reset.position.z = 7 - 9.9; reset.renderOrder = -Infinity; reset.frustumCulled = false; reset.visible = false;
reset.matrixAutoUpdate = false; reset.updateMatrix();
gScene.add(reset);
// Candidate E: depth prepass of the gizmo's own geometry with depthFunc Always (keeps host depth off the silhouette).
const prepass = new THREE.MeshBasicMaterial({ colorWrite: false });

const v = new THREE.Vector4(), s = new THREE.Vector4();
const gizmoMaterials = [];
g.root.traverse((o) => { if (o.material) gizmoMaterials.push(o.material); });

/** Draws the gizmo with `kind`, then restores the host's viewport, scissor and clear flags. */
function drawGizmo(kind) {
  if (kind === 'baseline') { g.render(); return; } // 2.3.0: viewport plus inline autoClearDepth
  const r = renderer;
  r.getViewport(v); r.getScissor(s);
  const st = r.getScissorTest(), { autoClear, autoClearColor, autoClearDepth, autoClearStencil } = r;
  r.setViewport(...rect); r.setScissor(...rect); r.setScissorTest(true);
  r.autoClear = false;
  try {
    if (kind === 'scissorInline') { // A: always scissor, keep the inline clear
      Object.assign(r, { autoClear: true, autoClearColor: false, autoClearDepth: true, autoClearStencil: false });
      r.render(gScene, gCamera);
    } else if (kind === 'scissorClearDepth') { // B: renderer.clearDepth() inside viewport and scissor
      r.clearDepth(); r.render(gScene, gCamera);
    } else if (kind === 'resetQuad' || kind === 'resetQuadNaive') { // C, and C without the reversed-depth spelling
      reset.material.depthFunc = kind === 'resetQuad' ? ALWAYS : THREE.AlwaysDepth;
      reset.visible = true; r.render(gScene, gCamera); reset.visible = false;
    } else if (kind === 'depthAlways') { // D: no reset, the gizmo ignores depth
      for (const m of gizmoMaterials) m.depthFunc = ALWAYS;
      r.render(gScene, gCamera);
      for (const m of gizmoMaterials) m.depthFunc = THREE.LessEqualDepth;
    } else if (kind === 'prepass') { // E
      prepass.depthFunc = ALWAYS; gScene.overrideMaterial = prepass; r.render(gScene, gCamera); gScene.overrideMaterial = null;
      r.render(gScene, gCamera);
    } else if (kind === 'none') { // control: no depth handling at all, the wall must hide the gizmo
      r.render(gScene, gCamera);
    } else throw new Error(kind);
  } finally {
    r.setViewport(v); r.setScissor(s); r.setScissorTest(st);
    Object.assign(r, { autoClear, autoClearColor, autoClearDepth, autoClearStencil });
  }
}

const c2d = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
const readFrame = async () => {
  if (backend === 'webgl') { c2d.canvas.width = W; c2d.canvas.height = H; c2d.drawImage(renderer.domElement, 0, 0); return c2d.getImageData(0, 0, W, H).data; }
  const { device, context } = renderer.backend;
  const texture = context.getCurrentTexture();
  const bytesPerRow = Math.ceil((W * 4) / 256) * 256;
  const buffer = device.createBuffer({ size: bytesPerRow * H, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
  const encoder = device.createCommandEncoder();
  encoder.copyTextureToBuffer({ texture }, { buffer, bytesPerRow }, [W, H]);
  device.queue.submit([encoder.finish()]);
  await buffer.mapAsync(GPUMapMode.READ);
  const src = new Uint8Array(buffer.getMappedRange()), out = new Uint8ClampedArray(W * H * 4), bgra = texture.format.startsWith('bgra');
  for (let row = 0; row < H; row++) for (let col = 0; col < W; col++) {
    const i = row * bytesPerRow + col * 4, o = (row * W + col) * 4;
    out[o] = src[i + (bgra ? 2 : 0)]; out[o + 1] = src[i + 1]; out[o + 2] = src[i + (bgra ? 0 : 2)]; out[o + 3] = src[i + 3];
  }
  buffer.unmap(); buffer.destroy();
  return out;
};

// The gizmo's rectangle in top-left canvas pixels.
const box = g._domElement.getBoundingClientRect(), cbox = renderer.domElement.getBoundingClientRect();
const R = { x: box.left - cbox.left, y: box.top - cbox.top, w: box.width, h: box.height };
const inside = (i) => { const p = i >> 2, x = p % W, y = (p / W) | 0; return x >= R.x && x < R.x + R.w && y >= R.y && y < R.y + R.h; };
const same = (a, b, i, tol) => Math.abs(a[i] - b[i]) <= tol && Math.abs(a[i + 1] - b[i + 1]) <= tol && Math.abs(a[i + 2] - b[i + 2]) <= tol;

/** Host frame: box and wall, optionally the gizmo, then (farAfter) the far quad, under the host's scissor state. */
async function frame(kind, hostScissor, farAfter = true) {
  renderer.setScissorTest(hostScissor); if (hostScissor) renderer.setScissor(0, 0, W, H);
  renderer.autoClear = true; renderer.render(scene, camera);
  if (kind) drawGizmo(kind);
  const restored = renderer.getScissorTest() === hostScissor;
  if (farAfter) { renderer.autoClear = false; renderer.render(far, camera); renderer.autoClear = true; }
  const d = await readFrame(); renderer.setScissorTest(false);
  return { d, restored };
}
/** The gizmo alone over a clear colour: pixels equal over black and over white are fully covered by it. */
async function gizmoOver(color) {
  renderer.setClearColor(color, 1); renderer.autoClear = true; renderer.render(empty, camera);
  drawGizmo('baseline'); const d = await readFrame(); renderer.setClearColor(0x000000, 0);
  return d;
}

let mask;
window.S = {
  env: () => ({ backend, depth, depthActive, reversed, type, webgpuBackend: !!renderer.backend?.isWebGPUBackend, rect: R }),
  /**
   * outsideChanged: pixels outside the rectangle that differ from the same frame without the gizmo (must be 0).
   * insideWrong: pixels the gizmo fully covers that do not show the gizmo over the near wall (must be 0).
   * lateCovers: of those, pixels a host draw after the gizmo (the far quad) covers; informational, it
   * depends on how the gizmo camera's depth compares with the host's.
   */
  async probe(kind, hostScissor) {
    if (!mask) {
      const [b, w] = [await gizmoOver(0x000000), await gizmoOver(0xffffff)];
      mask = []; for (let i = 0; i < b.length; i += 4) if (inside(i) && same(b, w, i, 2)) mask.push(i);
      mask.ref = b;
    }
    const without = (await frame(null, hostScissor)).d;
    const { d: withG, restored } = await frame(kind, hostScissor);
    const { d: noFar, restored: restored2 } = await frame(kind, hostScissor, false);
    let outsideChanged = 0, insideWrong = 0, lateCovers = 0;
    for (let i = 0; i < withG.length; i += 4) if (!inside(i) && !same(withG, without, i, 2)) outsideChanged++;
    for (const i of mask) {
      if (!same(noFar, mask.ref, i, 3)) insideWrong++;
      else if (!same(withG, mask.ref, i, 3)) lateCovers++;
    }
    const c = ((H / 2) * W + W / 2) * 4;
    return { outsideChanged, insideWrong, lateCovers, covered: mask.length, centre: [withG[c], withG[c + 1], withG[c + 2]], restored: restored && restored2 };
  },
  /** Draws and mean CPU time of one gizmo draw, over n frames. */
  async cost(kind, n = 300) {
    renderer.render(scene, camera); drawGizmo(kind);
    const draws = () => (backend === 'webgl' ? renderer.info.render.calls : renderer.info.render.drawCalls);
    renderer.info.reset(); drawGizmo(kind); const perFrame = draws();
    let t = 0;
    for (let i = 0; i < n; i++) { renderer.render(scene, camera); const t0 = performance.now(); drawGizmo(kind); t += performance.now() - t0; }
    if (backend === 'webgpu') await renderer.backend.device.queue.onSubmittedWorkDone(); else renderer.getContext().finish();
    return { draws: perFrame, us: Math.round((t / n) * 1000 * 10) / 10 };
  },
};
window.READY = true;
