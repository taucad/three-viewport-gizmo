var kt = Object.defineProperty;
var zt = (n, s, t) => s in n ? kt(n, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[s] = t;
var y = (n, s, t) => zt(n, typeof s != "symbol" ? s + "" : s, t);
import { MathUtils as Et, Vector3 as z, Vector2 as X, Raycaster as Ut, Object3D as I, Color as Mt, CanvasTexture as Ft, RepeatWrapping as ht, SRGBColorSpace as Rt, BufferGeometry as It, BufferAttribute as W, SpriteMaterial as B, MeshBasicMaterial as G, Sprite as it, Mesh as H, SphereGeometry as xt, CylinderGeometry as Gt, BackSide as qt, Quaternion as pt, Scene as Bt, OrthographicCamera as Zt, PerspectiveCamera as jt, Vector4 as $t, Matrix4 as Ht, Spherical as Vt } from "three";
import { mergeGeometries as Xt } from "three/addons/utils/BufferGeometryUtils.js";
import { Line2NodeMaterial as Wt } from "three/webgpu";
import { Line2 as Nt } from "three/addons/lines/Line2.js";
import { Line2 as Yt } from "three/addons/lines/webgpu/Line2.js";
import { LineGeometry as Jt } from "three/addons/lines/LineGeometry.js";
import { LineMaterial as Qt } from "three/addons/lines/LineMaterial.js";
const Ct = (n, s) => {
  const [t, e] = s.split("-");
  return Object.assign(n.style, {
    left: e === "left" ? "0" : e === "center" ? "50%" : "",
    right: e === "right" ? "0" : "",
    top: t === "top" ? "0" : t === "bottom" ? "" : "50%",
    bottom: t === "bottom" ? "0" : "",
    transform: `${e === "center" ? "translateX(-50%)" : ""} ${t === "center" ? "translateY(-50%)" : ""}`
  }), s;
}, Kt = ({
  placement: n,
  size: s,
  offset: t,
  id: e,
  className: o
}) => {
  const i = document.createElement("div"), { top: r, left: l, right: p, bottom: c } = t;
  return Object.assign(i.style, {
    id: e,
    position: "absolute",
    zIndex: "1000",
    height: `${s}px`,
    width: `${s}px`,
    margin: `${r}px ${p}px ${c}px ${l}px`,
    borderRadius: "100%"
  }), Ct(i, n), e && (i.id = e), o && (i.className = o), i;
}, te = (n) => {
  const s = typeof n == "string" ? document.querySelector(n) : n;
  if (!s) throw Error("Invalid DOM element");
  return s;
}, { clamp: ot } = Et, ee = [
  ["x", 0, 3],
  ["y", 1, 4],
  ["z", 2, 5]
], dt = /* @__PURE__ */ new z();
function ut(n, s) {
  const { idleMaterial: t, hoverMaterial: e, hover: o, opacity: i } = n.userData;
  if (!t || !e) {
    n.material.opacity = s;
    return;
  }
  t.opacity = s;
  const r = i > 0 ? i : 1, l = ot(
    s * (o.opacity / r),
    0,
    1
  );
  e.opacity = l;
}
function ft({ isSphere: n }, s, t) {
  n && (dt.set(0, 0, 1).applyQuaternion(t.quaternion), ee.forEach(([e, o, i]) => {
    const r = dt[e];
    let l = s[o], p = l.userData.opacity;
    ut(
      l,
      ot(r >= 0 ? p : p / 2, 0, 1)
    ), l = s[i], p = l.userData.opacity, ut(
      l,
      ot(r >= 0 ? p / 2 : p, 0, 1)
    );
  }));
}
const ne = (n, s, t = 10) => Math.abs(n.clientX - s.x) < t && Math.abs(n.clientY - s.y) < t, mt = /* @__PURE__ */ new Ut(), _t = /* @__PURE__ */ new X(), gt = (n, s, t, e) => {
  _t.set(
    (n.clientX - s.left) / s.width * 2 - 1,
    -((n.clientY - s.top) / s.height) * 2 + 1
  ), mt.setFromCamera(_t, t);
  const o = mt.intersectObjects(
    e,
    !1
  );
  if (o.length > 0) {
    o.sort((c, d) => c.distance - d.distance);
    const r = 0.2, l = o[0].distance, p = o.filter(
      (c) => c.distance <= l + r
    );
    p.length > 1 && (p.sort((c, d) => {
      const f = c.object.userData.intersectionOrder ?? 0;
      return (d.object.userData.intersectionOrder ?? 0) - f;
    }), o.splice(0, p.length, ...p));
  }
  const i = o.length ? o[0] : null;
  return !i || !i.object.visible ? null : i;
}, N = 1e-6, oe = 1e-4, se = 2 * Math.PI, At = ["x", "y", "z"], U = [...At, "nx", "ny", "nz"], ie = ["x", "z", "y", "nx", "nz", "ny"], re = ["z", "x", "y", "nz", "nx", "ny"], Y = "Right", J = "Top", Q = "Front", K = "Left", tt = "Bottom", et = "Back", Ot = [
  "right",
  "top",
  "front",
  "left",
  "bottom",
  "back"
], Lt = 1.3, yt = (n, s = !0) => {
  const { material: t, userData: e } = n, { color: o, opacity: i } = s ? e.hover : e;
  t.color.set(o), t.opacity = i;
}, F = (n) => JSON.parse(JSON.stringify(n)), ae = {
  yUp: {
    x: Y,
    y: J,
    z: Q,
    nx: K,
    ny: tt,
    nz: et
  },
  zUp: {
    x: Y,
    y: et,
    z: J,
    nx: K,
    ny: Q,
    nz: tt
  },
  xUp: {
    x: J,
    y: Q,
    z: Y,
    nx: tt,
    ny: et,
    nz: K
  }
}, ce = (n) => {
  const s = n.type || "sphere", t = s === "sphere", e = s === "rounded-cube", o = n.resolution || t ? 64 : 128, i = I.DEFAULT_UP, r = i.z === 1, l = i.x === 1, c = ae[r ? "zUp" : l ? "xUp" : "yUp"], { container: d } = n;
  n.container = void 0, n = JSON.parse(JSON.stringify(n)), n.container = d;
  const f = r ? ie : l ? re : U;
  Ot.forEach((m, b) => {
    n[m] && (n[f[b]] = n[m]);
  });
  const h = {
    enabled: !0,
    color: 16777215,
    opacity: 1,
    scale: 0.7,
    labelColor: 2236962,
    line: !1,
    border: {
      size: 0,
      color: 14540253
    },
    hover: {
      color: t ? 16777215 : 9688043,
      labelColor: 2236962,
      opacity: 1,
      scale: 0.7,
      border: {
        size: 0,
        color: 14540253
      }
    }
  }, v = {
    line: !1,
    scale: t ? 0.45 : 0.7,
    hover: {
      scale: t ? 0.5 : 0.7
    }
  }, E = {
    type: s,
    container: document.body,
    size: 128,
    placement: "top-right",
    resolution: o,
    lineWidth: 4,
    radius: t ? 1 : e ? 0.3 : 0.2,
    smoothness: 18,
    animated: !0,
    speed: 1,
    background: {
      enabled: !0,
      color: t ? 16777215 : 14739180,
      opacity: t ? 0 : 1,
      hover: {
        color: t ? 16777215 : 14739180,
        opacity: t ? 0.2 : 1
      }
    },
    font: {
      family: "sans-serif",
      weight: 900
    },
    offset: {
      top: 10,
      left: 10,
      bottom: 10,
      right: 10
    },
    corners: {
      enabled: !t,
      color: t ? 15915362 : 16777215,
      opacity: 1,
      scale: t ? 0.15 : 0.2,
      radius: 1,
      smoothness: 18,
      hover: {
        color: t ? 16777215 : 9688043,
        opacity: 1,
        scale: t ? 0.2 : 0.225
      }
    },
    edges: {
      enabled: !t,
      color: t ? 15915362 : e ? 15658734 : 16777215,
      opacity: t ? 1 : 0,
      radius: t ? 1 : 0.125,
      smoothness: 18,
      scale: t ? 0.15 : 1,
      hover: {
        color: t ? 16777215 : 9688043,
        opacity: 1,
        scale: t ? 0.2 : 1
      }
    },
    x: {
      ...F(h),
      ...t ? { label: "X", color: 16725587, line: !0 } : { label: c.x }
    },
    y: {
      ...F(h),
      ...t ? { label: "Y", color: 9100032, line: !0 } : { label: c.y }
    },
    z: {
      ...F(h),
      ...t ? { label: "Z", color: 2920447, line: !0 } : { label: c.z }
    },
    nx: {
      ...F(v),
      label: t ? "" : c.nx
    },
    ny: {
      ...F(v),
      label: t ? "" : c.ny
    },
    nz: {
      ...F(v),
      label: t ? "" : c.nz
    }
  };
  if (st(n, E), e) {
    const m = n;
    m.edges.radius = m.radius, m.edges.scale = 1, m.edges.opacity = 1, m.edges.hover.scale = 1, m.edges.hover.opacity = 1, m.corners.radius = m.radius, m.corners.scale = 1, m.corners.opacity = 1, m.corners.hover.scale = 1, m.corners.hover.opacity = 1, m.radius = 0, U.forEach((b) => {
      m[b].scale = 1, m[b].opacity = 1, m[b].hover.scale = 1, m[b].hover.opacity = 1;
    });
  }
  return At.forEach(
    (m) => st(
      n[`n${m}`],
      F(n[m])
    )
  ), { ...n, isSphere: t };
};
function st(n, ...s) {
  if (n instanceof HTMLElement || typeof n != "object" || n === null)
    return n;
  for (const t of s)
    for (const e in t)
      e !== "container" && e in t && (n[e] === void 0 ? n[e] = t[e] : typeof t[e] == "object" && !Array.isArray(t[e]) && (n[e] = st(
        n[e] || {},
        t[e]
      )));
  return n;
}
const le = (n, s = 2) => {
  const t = new Mt(), e = s * 2, { isSphere: o, resolution: i, radius: r, font: l, corners: p, edges: c } = n, d = U.map((a) => ({ ...n[a], radius: r }));
  o && p.enabled && d.push(p), o && c.enabled && d.push(c);
  const f = document.createElement("canvas"), h = f.getContext("2d");
  f.width = i * 2 + e * 2, f.height = i * d.length + e * d.length;
  const [v, E] = x(d, i, l);
  d.forEach(
    ({
      radius: a,
      label: u,
      color: L,
      labelColor: _,
      border: g,
      hover: {
        color: k,
        labelColor: O,
        border: T
      }
    }, D) => {
      const P = i * D + D * e + s;
      S(
        s,
        P,
        s,
        i,
        a,
        u,
        g,
        L,
        _
      ), S(
        i + s * 3,
        P,
        s,
        i,
        a,
        u,
        T ?? g,
        k ?? L,
        O ?? _
      );
    }
  );
  const m = d.length, b = s / (i * 2), C = s / (i * 6), M = 1 / m, A = new Ft(f);
  return A.repeat.set(0.5 - 2 * b, M - 2 * C), A.offset.set(b, 1 - C), Object.assign(A, {
    colorSpace: Rt,
    wrapS: ht,
    wrapT: ht,
    userData: {
      offsetX: b,
      offsetY: C,
      cellHeight: M
    }
  }), A;
  function S(a, u, L, _, g, k, O, T, D) {
    if (g = g * (_ / 2), T != null && T !== "" && (P(), h.fillStyle = t.set(T).getStyle(), h.fill()), O && O.size) {
      const q = O.size * _ / 2;
      a += q, u += q, _ -= O.size * _, g = Math.max(0, g - q), P(), h.strokeStyle = t.set(O.color).getStyle(), h.lineWidth = O.size * _, h.stroke();
    }
    k && w(
      h,
      a + _ / 2,
      u + (_ + L) / 2,
      k,
      t.set(D).getStyle()
    );
    function P() {
      h.beginPath(), h.moveTo(a + g, u), h.lineTo(a + _ - g, u), h.arcTo(a + _, u, a + _, u + g, g), h.lineTo(a + _, u + _ - g), h.arcTo(a + _, u + _, a + _ - g, u + _, g), h.lineTo(a + g, u + _), h.arcTo(a, u + _, a, u + _ - g, g), h.lineTo(a, u + g), h.arcTo(a, u, a + g, u, g), h.closePath();
    }
  }
  function x(a, u, L) {
    const g = [...a].sort((V, Pt) => {
      var ct, lt;
      return (((ct = V.label) == null ? void 0 : ct.length) || 0) - (((lt = Pt.label) == null ? void 0 : lt.length) || 0);
    }).pop().label, { family: k, weight: O } = L, T = o ? Math.sqrt(Math.pow(u * 0.7, 2) / 2) : u;
    let D = T;
    n.font.size > 0 && (D = n.font.size);
    let P = 0, q = 0;
    do {
      h.font = `${O} ${D}px ${k}`;
      const V = h.measureText(g);
      P = V.width, q = V.fontBoundingBoxDescent, D--;
    } while (P > T && D > 0);
    const at = T / q, Tt = Math.min(T / P, at), Dt = Math.floor(D * Tt);
    return [`${O} ${Dt}px ${k}`, at];
  }
  function w(a, u, L, _, g) {
    a.font = v, a.textAlign = "center", a.textBaseline = "middle", a.fillStyle = g, a.fillText(_, u, L + (o ? E : 0));
  }
}, Z = (n, s, t) => {
  const e = n.clone();
  he(e, s);
  const { offsetX: o } = e.userData;
  return e.offset.setX((t ? 0.5 : 0) + o), e;
}, he = (n, s) => {
  const {
    offset: t,
    userData: { offsetY: e, cellHeight: o }
  } = n;
  t.y = 1 - (s + 1) * o + e;
};
function rt(n, s, t = 2, e = 2) {
  const o = t / 2 - n, i = e / 2 - n, r = n / t, l = (t - n) / t, p = n / e, c = (e - n) / e, d = [o, i, 0, -o, i, 0, -o, -i, 0, o, -i, 0], f = [l, c, r, c, r, p, l, p], h = [
    3 * (s + 1) + 3,
    3 * (s + 1) + 4,
    s + 4,
    s + 5,
    2 * (s + 1) + 4,
    2,
    1,
    2 * (s + 1) + 3,
    3,
    4 * (s + 1) + 3,
    4,
    0
  ], v = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11].map(
    (w) => h[w]
  );
  let E, m, b, C, M, A, S, x;
  for (let w = 0; w < 4; w++) {
    C = w < 1 || w > 2 ? o : -o, M = w < 2 ? i : -i, A = w < 1 || w > 2 ? l : r, S = w < 2 ? c : p;
    for (let a = 0; a <= s; a++)
      E = Math.PI / 2 * (w + a / s), m = Math.cos(E), b = Math.sin(E), d.push(C + n * m, M + n * b, 0), f.push(A + r * m, S + p * b), a < s && (x = (s + 1) * w + a + 4, v.push(w, x, x + 1));
  }
  return new It().setIndex(new W(new Uint32Array(v), 1)).setAttribute(
    "position",
    new W(new Float32Array(d), 3)
  ).setAttribute("uv", new W(new Float32Array(f), 2));
}
const pe = (n, s) => {
  const t = new z(), { isSphere: e, radius: o, smoothness: i, type: r } = n, p = r === "rounded-cube" ? 2 - n.edges.radius * 2 : 2, c = rt(o, i, p, p);
  return U.map((d, f) => {
    const h = f < 3, v = U[f], E = Z(s, f, !1), m = Z(s, f, !0), { enabled: b, scale: C, opacity: M, hover: A } = n[v], S = {
      map: E,
      opacity: M,
      transparent: !0
    }, x = {
      map: m,
      opacity: A.opacity,
      transparent: !0
    }, w = e ? new B(S) : new G(S), a = e ? new B(x) : new G(x), u = e ? new it(w) : new H(c, w), L = h ? v : v[1];
    if (u.position[L] = (h ? 1 : -1) * (e ? Lt : 1), !e) {
      u.lookAt(t.copy(u.position).multiplyScalar(1.7));
      const _ = I.DEFAULT_UP.z === 1, g = I.DEFAULT_UP.x === 1;
      (_ || g) && (v === "z" && _ || v === "x" && g ? u.rotateZ(-Math.PI / 2) : (v === "nz" && _ || v === "nx" && g) && u.rotateZ(Math.PI / 2));
    }
    return u.scale.setScalar(C), u.renderOrder = 1, u.visible = b, u.userData = {
      scale: C,
      opacity: M,
      hover: A,
      kind: "face",
      axes: [U[f]],
      face: Ot[f],
      idleMaterial: w,
      hoverMaterial: a
    }, u;
  });
}, vt = U.length, de = (n, s) => {
  const { isSphere: t, corners: e, type: o } = n, i = o === "rounded-cube";
  if (!e.enabled) return [];
  const { color: r, opacity: l, scale: p, radius: c, smoothness: d, hover: f } = e, h = t ? null : i ? new xt(c, d * 2, d) : rt(c, d), v = i ? 1 - c : 0.85, E = [
    1,
    1,
    1,
    -1,
    1,
    1,
    1,
    -1,
    1,
    -1,
    -1,
    1,
    1,
    1,
    -1,
    -1,
    1,
    -1,
    1,
    -1,
    -1,
    -1,
    -1,
    -1
  ].map((b) => b * v), m = new z();
  return Array(E.length / 3).fill(0).map((b, C) => {
    let M, A;
    if (t) {
      const a = Z(s, vt, !1), u = Z(s, vt, !0), L = {
        map: a,
        opacity: l,
        transparent: !0
      }, _ = {
        map: u,
        opacity: f.opacity,
        transparent: !0
      };
      M = new B(L), A = new B(_);
    } else
      M = new G({
        transparent: !0,
        opacity: l,
        color: r
      }), A = new G({
        transparent: !0,
        opacity: f.opacity,
        color: f.color ?? r
      });
    const S = t ? new it(M) : new H(h, M), x = C * 3;
    S.position.set(E[x], E[x + 1], E[x + 2]), t && S.position.normalize().multiplyScalar(1.7), S.scale.setScalar(p), S.lookAt(m.copy(S.position).multiplyScalar(2)), S.renderOrder = 1;
    const w = [
      S.position.x > 0 ? "x" : "nx",
      S.position.y > 0 ? "y" : "ny",
      S.position.z > 0 ? "z" : "nz"
    ];
    return S.userData = {
      color: r,
      opacity: l,
      scale: p,
      hover: f,
      intersectionOrder: 1,
      kind: "corner",
      axes: w,
      idleMaterial: M,
      hoverMaterial: A
    }, S;
  });
}, nt = (n, s, t) => n === 0 ? null : n > 0 ? s : t, ue = (n, s, t) => {
  const { isSphere: e, edges: o, type: i } = n, r = i === "rounded-cube";
  if (!o.enabled) return [];
  const { color: l, opacity: p, scale: c, hover: d, radius: f, smoothness: h } = o, v = r ? 2 - f * 2 : 1.2, E = e ? null : r ? new Gt(f, f, v, h * 4) : rt(f, h, v, 0.25), m = r ? 1 - f : 0.925, b = [
    0,
    1,
    1,
    0,
    -1,
    1,
    1,
    0,
    1,
    -1,
    0,
    1,
    0,
    1,
    -1,
    0,
    -1,
    -1,
    1,
    0,
    -1,
    -1,
    0,
    -1,
    1,
    1,
    0,
    1,
    -1,
    0,
    -1,
    1,
    0,
    -1,
    -1,
    0
  ].map((A) => A * m), C = new z(), M = new z(0, 1, 0);
  return Array(b.length / 3).fill(0).map((A, S) => {
    let x, w;
    if (e) {
      const O = Z(s, t, !1), T = Z(s, t, !0), D = {
        map: O,
        opacity: p,
        transparent: !0
      }, P = {
        map: T,
        opacity: d.opacity,
        transparent: !0
      };
      x = new B(D), w = new B(P);
    } else
      x = new G({
        transparent: !0,
        opacity: p,
        color: l
      }), w = new G({
        transparent: !0,
        opacity: d.opacity,
        color: d.color ?? l
      });
    const a = e ? new it(x) : new H(E, x), u = S * 3;
    a.position.set(b[u], b[u + 1], b[u + 2]), e && a.position.normalize().multiplyScalar(1.7), a.scale.setScalar(c), a.up.copy(M), a.lookAt(C.copy(a.position).multiplyScalar(2)), r ? (!e && !a.position.z && (a.rotation.z = Math.PI), !e && !a.position.x && (a.rotation.x = 0), !e && !a.position.x && (a.rotation.z = Math.PI / 2)) : !e && !a.position.y && (a.rotation.z = Math.PI / 2), a.renderOrder = 1;
    const L = nt(a.position.x, "x", "nx"), _ = nt(a.position.y, "y", "ny"), g = nt(a.position.z, "z", "nz"), k = [L, _, g].filter((O) => O !== null);
    return a.userData = {
      color: l,
      opacity: p,
      scale: c,
      hover: d,
      kind: "edge",
      axes: k,
      idleMaterial: x,
      hoverMaterial: w
    }, a;
  });
}, fe = (n, s) => {
  const {
    isSphere: t,
    background: { enabled: e, color: o, opacity: i, hover: r }
  } = s;
  let l;
  const p = new G({
    color: o,
    side: qt,
    opacity: i,
    transparent: !0,
    depthWrite: !1
  });
  if (!e) return null;
  if (t)
    l = new H(
      new xt(1.8, 64, 64),
      p
    );
  else {
    let c;
    n.forEach((d) => {
      const f = d.scale.x;
      d.scale.setScalar(0.9), d.updateMatrix();
      const h = d.geometry.clone();
      h.applyMatrix4(d.matrix), c = c ? Xt([c, h]) : h, d.scale.setScalar(f);
    }), l = new H(c, p);
  }
  return l.userData = {
    color: o,
    opacity: i,
    hover: r
  }, l;
}, me = (n, s) => {
  const t = new Mt(), e = [], o = [], { isSphere: i } = n;
  if (U.forEach((c, d) => {
    const { enabled: f, line: h, scale: v, color: E } = n[c];
    if (!f || !h) return;
    const m = d < 3 ? 1 : -1, C = (i ? Lt - v / 2 : 0.975) * m;
    e.push(
      c.includes("x") ? C : 0,
      c.includes("y") ? C : 0,
      c.includes("z") ? C : 0,
      0,
      0,
      0
    );
    const M = t.set(E).toArray();
    o.push(...M, ...M);
  }), !e.length) return null;
  const r = new Jt().setPositions(e).setColors(o);
  if (s.isWebGPURenderer === !0) {
    const c = new Wt({
      linewidth: n.lineWidth,
      vertexColors: !0,
      worldUnits: !1
    });
    return new Yt(r, c).computeLineDistances();
  }
  const p = new Qt({
    linewidth: n.lineWidth,
    vertexColors: !0,
    resolution: new X(window.innerWidth, window.innerHeight)
  });
  return new Nt(r, p).computeLineDistances();
}, _e = (n, s) => {
  const { corners: t, edges: e } = n, o = [], i = le(n), r = pe(n, i);
  o.push(...r), t.enabled && o.push(...de(n, i)), e.enabled && o.push(...ue(n, i, t.enabled ? 7 : 6));
  const l = fe(r, n), p = me(n, s);
  return [o, l, p];
}, j = (n, s = !0) => {
  const { userData: t } = n, { idleMaterial: e, hoverMaterial: o } = t;
  n.scale.setScalar((s ? t.hover : t).scale), n.material = s ? o : e;
}, { clamp: ge } = Et, ye = /* @__PURE__ */ new z();
function $(n) {
  if (!n) return { kind: null, axes: null, face: null, direction: null };
  const s = n.userData;
  return {
    kind: s.kind ?? null,
    axes: s.axes ?? null,
    face: s.face ?? null,
    direction: ye.copy(n.position).normalize().clone()
  };
}
const bt = /* @__PURE__ */ new Ht(), wt = /* @__PURE__ */ new Vt(), ve = /* @__PURE__ */ new X(), R = /* @__PURE__ */ new z(), St = /* @__PURE__ */ new $t();
class Oe extends I {
  /**
   * Creates a new ViewportGizmo instance.
   *
   * @param camera - The camera to be controlled by this gizmo
   * @param renderer - The WebGL renderer used to render the scene
   * @param options - {@link GizmoOptions}, Configuration options for the gizmo.
   * @param options.container - Parent element for the gizmo. Can be an HTMLElement or a CSS selector string
   * @param options.type - The gizmo configuration type. Either 'sphere' or 'cube', defaults to 'sphere'
   * @param options.size - Size of the gizmo widget in pixels. Defaults to 128
   * @param options.placement - Position of the gizmo in the viewport
   *    Options include:
   *    - `"top-left"`
   *    - `"top-center"`
   *    - `"top-right"`
   *    - `"center-left"`
   *    - `"center-center"`
   *    - `"center-right"`
   *    - `"bottom-left"`
   *    - `"bottom-center"`
   *    - `"bottom-right"`
   * @param options.offset - Offset of the gizmo from container edges in pixels
   * @param options.offset.left - Offset from the left edge
   * @param options.offset.top - Offset from the top edge
   * @param options.offset.right - Offset from the right edge
   * @param options.offset.bottom - Offset from the bottom edge
   * @param options.animated - Whether view changes should be animated. Defaults to true
   * @param options.speed - Animation speed multiplier. Defaults to 1
   * @param options.resolution - Texture resolution. Defaults to 64 for sphere, 128 for cube
   * @param options.lineWidth - Width of the axes lines in pixels
   * @param options.id - HTML `id` attribute for the gizmo container
   * @param options.className - HTML `class` attribute for the gizmo container
   * @param options.font - Font configuration for axis labels
   * @param options.font.family - Font family for axis labels
   * @param options.font.weight - Font weight for axis labels
   * @param options.background - Configuration for the background sphere/cube
   * @param options.background.enabled - Whether to display the background
   * @param options.background.color - Color of the background in normal state
   * @param options.background.opacity - Opacity of the background in normal state
   * @param options.background.hover.color - Color of the background when hovered
   * @param options.background.hover.opacity - Opacity of the background when hovered
   * @param options.corners - Configuration for corner indicators
   * @param options.corners.enabled - Whether to display corner indicators
   * @param options.corners.color - Base color of corner indicators
   * @param options.corners.opacity - Opacity of corner indicators
   * @param options.corners.scale - Scale multiplier for corner indicators
   * @param options.corners.radius - Radius of corner indicators
   * @param options.corners.smoothness - Smoothness of corner indicators
   * @param options.corners.hover.color - Color of corner indicators when hovered
   * @param options.corners.hover.opacity - Opacity of corner indicators when hovered
   * @param options.corners.hover.scale - Scale of corner indicators when hovered
   * @param options.edges - Configuration for edge indicators
   * @param options.edges.enabled - Whether to display edge indicators
   * @param options.edges.color - Base color of edge indicators
   * @param options.edges.opacity - Opacity of edge indicators
   * @param options.edges.scale - Scale multiplier for edge indicators
   * @param options.edges.radius - Radius of edge indicators
   * @param options.edges.smoothness - Smoothness of edge indicators
   * @param options.edges.hover.color - Color of edge indicators when hovered
   * @param options.edges.hover.opacity - Opacity of edge indicators when hovered
   * @param options.edges.hover.scale - Scale of edge indicators when hovered
   * @param options.x - Configuration for positive X axis/face
   * @param options.y - Configuration for positive Y axis/face
   * @param options.z - Configuration for positive Z axis/face
   * @param options.nx - Configuration for negative X axis/face
   * @param options.ny - Configuration for negative Y axis/face
   * @param options.nz - Configuration for negative Z axis/face
   *
   * @remarks Axis-specific configuration can also use alias names for cube mode:
   * - `right` (same as `x`)
   * - `left` (same as `nx`)
   * - `top` (same as `y`)
   * - `bottom` (same as `ny`)
   * - `front` (same as `z`)
   * - `back` (same as `nz`)
   *
   * For each axis/face configuration, the following options are available:
   * @param options.AXIS.enabled - Whether to draw the axis
   * @param options.AXIS.label - Custom text label for the axis
   * @param options.AXIS.opacity - Axis opacity
   * @param options.AXIS.scale - Scale multiplier for indicator size
   * @param options.AXIS.line - Whether to draw the axis line
   * @param options.AXIS.color - Axis indicator background color
   * @param options.AXIS.labelColor - Axis label color
   * @param options.AXIS.border.size - Border size around the axis indicator
   * @param options.AXIS.border.color - Border color around the axis indicator
   * @param options.AXIS.hover.color - Fill color on hover
   * @param options.AXIS.hover.labelColor - Label text color on hover
   * @param options.AXIS.hover.opacity - Opacity when hovered
   * @param options.AXIS.hover.scale - Indicator scale when hovered
   * @param options.AXIS.hover.border.size - Hover border size
   * @param options.AXIS.hover.border.color - Hover border color
   */
  constructor(t, e, o = {}) {
    super();
    /** Whether the gizmo is currently active and responding to user input */
    y(this, "enabled", !0);
    /** The camera being controlled by this gizmo */
    y(this, "camera");
    /** The WebGLRenderer rendering the gizmo */
    y(this, "renderer");
    /** The configuration options */
    y(this, "options");
    /** The point around which the camera rotates */
    y(this, "target", new z());
    /** Whether view changes should be animated */
    y(this, "animated", !0);
    /** The speed of view change animations. Higher values result in faster animations */
    y(this, "speed", 1);
    /**
     * Indicates whether the gizmo is currently being animated or not,
     * Useful when interacting with other camera controllers
     *
     * @readonly This value is set internally.
     **/
    y(this, "animating", !1);
    y(this, "_options");
    y(this, "_intersections");
    y(this, "_background", null);
    y(this, "_viewport", [0, 0, 0, 0]);
    y(this, "_originalViewport", [0, 0, 0, 0]);
    y(this, "_originalScissor", [0, 0, 0, 0]);
    y(this, "_scene");
    y(this, "_camera");
    y(this, "_container");
    y(this, "_domElement");
    y(this, "_domRect");
    y(this, "_dragging", !1);
    y(this, "_distance", 0);
    /** Seconds; `null` until first `_animate` tick after `_setOrientation` (first frame uses delta 0). */
    y(this, "_lastAnimateTimeSeconds", null);
    y(this, "_quaternionStart", new pt());
    y(this, "_quaternionEnd", new pt());
    y(this, "_pointerStart", new X());
    y(this, "_focus", null);
    y(this, "_placement");
    y(this, "_controls");
    y(this, "_controlsListeners");
    this.camera = t, this.renderer = e, this._scene = new Bt().add(this), this.set(o);
  }
  /** Gets the current placement of the gizmo relative to its container. */
  get placement() {
    return this._placement;
  }
  /**
   * Sets and update the placement of the gizmo relative to its container.
   *
   * @param placement - The new placement position
   */
  set placement(t) {
    this._placement = Ct(this._domElement, t), this.domUpdate();
  }
  /**
   * Regenerates the gizmo with the new options.
   *
   * @remarks
   * - Not recommended for use in real-time rendering or animation loops
   * - Provides a way to completely rebuild the gizmo with new options
   * - Can be computationally expensive, so use sparingly
   */
  set(t = {}) {
    this.dispose(), this.options = t, this._options = ce(t), this._camera = this._options.isSphere ? new Zt(-1.8, 1.8, 1.8, -1.8, 5, 10) : new jt(26, 1, 5, 10), this._camera.position.set(0, 0, 7);
    const [e, o, i] = _e(this._options, this.renderer);
    o && this.add(o), i && this.add(i), this.add(...e), this._background = o, this._intersections = e;
    const { container: r, animated: l, speed: p } = this._options;
    return this.animated = l, this.speed = p, this._container = r ? te(r) : document.body, this._domElement = Kt(this._options), this._domElement.onpointerdown = (c) => this._onPointerDown(c), this._domElement.onpointermove = (c) => this._onPointerMove(c), this._domElement.onpointerleave = () => this._onPointerLeave(), this._container.appendChild(this._domElement), this._controls && this.attachControls(this._controls), this.update(), this;
  }
  /**
   * Renders the gizmo to the screen.
   * This method handles viewport and scissor management to ensure the gizmo
   * renders correctly without affecting the main scene rendering.
   *
   * @returns The gizmo instance for method chaining
   */
  render() {
    this.animating && this._animate();
    const { renderer: t, _viewport: e } = this, o = t.getScissorTest(), i = t.autoClear, r = t.autoClearColor, l = t.autoClearDepth, p = t.autoClearStencil;
    return t.autoClear = !0, t.autoClearColor = !1, t.autoClearDepth = !0, t.autoClearStencil = !1, t.setViewport(...e), o && t.setScissor(...e), t.render(this._scene, this._camera), t.setViewport(...this._originalViewport), o && t.setScissor(...this._originalScissor), t.autoClear = i, t.autoClearColor = r, t.autoClearDepth = l, t.autoClearStencil = p, this;
  }
  /**
   * Updates the gizmo's DOM-related properties based on its current position
   * and size in the document.
   *
   * @returns The gizmo instance for method chaining
   */
  domUpdate() {
    this._domRect = this._domElement.getBoundingClientRect();
    const t = this.renderer, e = this._domRect, o = t.domElement.getBoundingClientRect(), i = t.isWebGPURenderer === !0, r = e.top - o.top, l = i ? r : t.domElement.clientHeight - (r + e.height);
    return this._viewport.splice(
      0,
      4,
      e.left - o.left,
      l,
      e.width,
      e.height
    ), t.getViewport(St).toArray(this._originalViewport), t.getScissorTest() && t.getScissor(St).toArray(this._originalScissor), this;
  }
  /**
   * Updates the gizmo's orientation to match the current camera orientation.
   *
   * @returns The gizmo instance for method chaining
   */
  cameraUpdate() {
    return this._updateOrientation(), this;
  }
  /**
   * Performs a complete update of the gizmo, including both DOM and camera-related updates.
   *
   * @param controls - Internal. Set to `false` if the update event comes from the attached controls.
   *
   * @returns The gizmo instance for method chaining
   */
  update(t = !0) {
    return t && this._controls && this._controls.update(), this.domUpdate().cameraUpdate();
  }
  /**
   * Connects OrbitControls with the gizmo, handling interaction states and updates.
   * Automatically detaches any previously attached controls.
   *
   * @param controls - The scene's {@link https://threejs.org/docs/#examples/en/controls/OrbitControls OrbitControls}
   */
  attachControls(t) {
    return this.detachControls(), this.target = t.target, this._controlsListeners = {
      start: () => t.enabled = !1,
      end: () => t.enabled = !0,
      change: () => this.update(!1)
    }, this.addEventListener("start", this._controlsListeners.start), this.addEventListener("end", this._controlsListeners.end), t.addEventListener("change", this._controlsListeners.change), this._controls = t, this;
  }
  /** Removes all control event listeners and references. Safe to call multiple times. */
  detachControls() {
    if (!(!this._controlsListeners || !this._controls))
      return this.target = new z().copy(this._controls.target), this.removeEventListener("start", this._controlsListeners.start), this.removeEventListener("end", this._controlsListeners.end), this._controls.removeEventListener(
        "change",
        this._controlsListeners.change
      ), this._controlsListeners = void 0, this._controls = void 0, this;
  }
  /** Cleans up all resources including geometries, materials, textures, and event listeners. */
  dispose() {
    var t;
    this.detachControls(), this.children.forEach((e) => {
      var r, l, p, c, d;
      this.remove(e);
      const o = e.userData;
      if (o.idleMaterial && o.hoverMaterial)
        (r = o.idleMaterial.map) == null || r.dispose(), o.idleMaterial.dispose(), o.hoverMaterial !== o.idleMaterial && ((l = o.hoverMaterial.map) == null || l.dispose(), o.hoverMaterial.dispose());
      else {
        const f = e, { material: h } = f;
        if (Array.isArray(h))
          for (const v of h) {
            const E = v;
            (p = E.map) == null || p.dispose(), E.dispose();
          }
        else if (h && typeof h == "object" && "dispose" in h) {
          const v = h;
          (c = v.map) == null || c.dispose(), v.dispose();
        }
      }
      (d = e.geometry) == null || d.dispose();
    }), (t = this._domElement) == null || t.remove();
  }
  /**
   * Updates the gizmo's orientation either based on the camera or internal state.
   *
   * @private
   * @param fromCamera - Whether to update based on camera orientation (true) or internal state (false)
   */
  _updateOrientation(t = !0) {
    t && (this.quaternion.copy(this.camera.quaternion).invert(), this.updateMatrixWorld()), ft(this._options, this._intersections, this.camera);
  }
  /**
   * Handles the animation of camera position and orientation changes.
   *
   * @private
   */
  _animate() {
    var e;
    let t = !this.animated;
    if (this.animated) {
      this._controls && (this._controls.enabled = !1);
      const o = performance.now() / 1e3, i = this._lastAnimateTimeSeconds === null ? 0 : o - this._lastAnimateTimeSeconds;
      this._lastAnimateTimeSeconds = o;
      const r = i * se * this.speed;
      this._quaternionStart.rotateTowards(this._quaternionEnd, r), t = this._quaternionStart.angleTo(this._quaternionEnd) < N;
    }
    t && this._quaternionStart.copy(this._quaternionEnd), this.camera.position.set(0, 0, 1).applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target), this.camera.quaternion.copy(this._quaternionStart), this._updateOrientation(), this.dispatchEvent({ type: "change", ...$(null) }), t && ((e = this._controls) == null || e.update(), this.animating = !1, this._lastAnimateTimeSeconds = null, this.dispatchEvent({ type: "end" }));
  }
  /**
   * Sets the camera orientation to look at the target from a specific axis.
   *
   * @private
   * @param position - The axis point position
   */
  _setOrientation(t) {
    const e = this.camera, o = this.target;
    R.copy(t), I.DEFAULT_UP.z === 1 && Math.abs(t.z) > 0.99 ? R.y = -1e-4 : I.DEFAULT_UP.x === 1 && Math.abs(t.x) > 0.99 && (R.y = oe), R.normalize().multiplyScalar(this._distance).add(o), bt.lookAt(R, o, this.up), this._quaternionEnd.setFromRotationMatrix(bt), this._quaternionStart.copy(e.quaternion), this.animating = !0, this._lastAnimateTimeSeconds = null;
  }
  /**
   * Handles the pointer down event for starting drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerDown(t) {
    if (!this.enabled) return;
    const e = (c) => {
      if (!this._dragging) {
        if (ne(c, this._pointerStart)) return;
        this._dragging = !0;
      }
      const d = ve.set(c.clientX, c.clientY).sub(this._pointerStart).multiplyScalar(1 / this._domRect.width * Math.PI), f = this.coordinateConversion(
        R.subVectors(this.camera.position, this.target)
      ), h = wt.setFromVector3(f);
      h.theta = l - d.x, h.phi = ge(
        p - d.y,
        N,
        Math.PI - N
      ), this.coordinateConversion(
        this.camera.position.setFromSpherical(h),
        !0
      ).add(this.target), this.camera.lookAt(this.target), this.quaternion.copy(this.camera.quaternion).invert(), this._updateOrientation(!1), this.dispatchEvent({ type: "change", ...$(null) });
    }, o = () => {
      if (document.removeEventListener("pointermove", e, !1), document.removeEventListener("pointerup", o, !1), !this._dragging) return this._handleClick(t);
      this._focus && (j(this._focus, !1), this._focus = null), this._dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating) return;
    t.preventDefault(), this._pointerStart.set(t.clientX, t.clientY);
    const i = this.coordinateConversion(
      R.subVectors(this.camera.position, this.target)
    ), r = wt.setFromVector3(i), l = r.theta, p = r.phi;
    this._distance = r.radius, document.addEventListener("pointermove", e, !1), document.addEventListener("pointerup", o, !1), this.dispatchEvent({ type: "start" });
  }
  /**
   * Converts the input-coordinates from the standard Y-axis up to what is set in Object3D.DEFAULT_UP.
   *
   * @private
   * @param target      - The target Vector3 to be converted
   * @param isSpherical - Whether or not the coordinates are for a sphere
   * @returns The converted coordinates
   */
  coordinateConversion(t, e = !1) {
    const { x: o, y: i, z: r } = t, l = I.DEFAULT_UP;
    return l.x === 1 ? e ? t.set(i, r, o) : t.set(r, o, i) : l.z === 1 ? e ? t.set(r, o, i) : t.set(i, r, o) : t;
  }
  /**
   * Handles pointer move events for hover effects and drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerMove(t) {
    !this.enabled || this._dragging || (this._background && yt(this._background, !0), this._handleHover(t));
  }
  /**
   * Handles pointer leave events to reset hover states.
   *
   * @private
   */
  _onPointerLeave() {
    if (!this.enabled || this._dragging) return;
    this._background && yt(this._background, !1);
    const t = this._focus !== null;
    this._focus && (j(this._focus, !1), this._focus = null), this._domElement.style.cursor = "", t && this.dispatchEvent({
      type: "hoverchange",
      object: null,
      ...$(null)
    });
  }
  /**
   * Handles click events for axis selection.
   *
   * @private
   * @param e - The pointer event
   */
  _handleClick(t) {
    const e = gt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    );
    if (this._focus && (j(this._focus, !1), this._focus = null), !e) {
      this.dispatchEvent({ type: "end" });
      return;
    }
    this._setOrientation(e.object.position), this.dispatchEvent({
      type: "change",
      ...$(e.object)
    });
  }
  /**
   * Handles hover effects for interactive elements.
   *
   * @private
   * @param e - The pointer event
   */
  _handleHover(t) {
    const e = gt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    ), o = (e == null ? void 0 : e.object) || null;
    this._focus !== o && (this._domElement.style.cursor = o ? "pointer" : "", this._focus && j(this._focus, !1), (this._focus = o) ? j(o, !0) : ft(this._options, this._intersections, this.camera), this.dispatchEvent({ type: "hoverchange", object: o, ...$(o) }));
  }
}
export {
  Oe as ViewportGizmo
};
//# sourceMappingURL=three-viewport-gizmo.js.map
