var Ut = Object.defineProperty;
var kt = (n, o, t) => o in n ? Ut(n, o, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[o] = t;
var g = (n, o, t) => kt(n, typeof o != "symbol" ? o + "" : o, t);
import { MathUtils as xt, Vector3 as D, Vector2 as J, Raycaster as Rt, Object3D as U, Color as At, CanvasTexture as It, RepeatWrapping as mt, SRGBColorSpace as Gt, BufferGeometry as qt, BufferAttribute as K, SpriteMaterial as Z, MeshBasicMaterial as G, Sprite as lt, Mesh as V, SphereGeometry as Ot, CylinderGeometry as Bt, BackSide as Zt, Quaternion as H, Scene as jt, OrthographicCamera as $t, PerspectiveCamera as Ht, Vector4 as Vt, Matrix4 as Xt, Spherical as Wt } from "three";
import { mergeGeometries as Qt } from "three/addons/utils/BufferGeometryUtils.js";
import { Line2NodeMaterial as Nt } from "three/webgpu";
import { Line2 as Yt } from "three/addons/lines/Line2.js";
import { Line2 as Jt } from "three/addons/lines/webgpu/Line2.js";
import { LineGeometry as Kt } from "three/addons/lines/LineGeometry.js";
import { LineMaterial as te } from "three/addons/lines/LineMaterial.js";
const Lt = (n, o) => {
  const [t, e] = o.split("-");
  return Object.assign(n.style, {
    left: e === "left" ? "0" : e === "center" ? "50%" : "",
    right: e === "right" ? "0" : "",
    top: t === "top" ? "0" : t === "bottom" ? "" : "50%",
    bottom: t === "bottom" ? "0" : "",
    transform: `${e === "center" ? "translateX(-50%)" : ""} ${t === "center" ? "translateY(-50%)" : ""}`
  }), o;
}, ee = ({
  placement: n,
  size: o,
  offset: t,
  id: e,
  className: s
}) => {
  const i = document.createElement("div"), { top: a, left: l, right: p, bottom: c } = t;
  return Object.assign(i.style, {
    id: e,
    position: "absolute",
    zIndex: "1000",
    height: `${o}px`,
    width: `${o}px`,
    margin: `${a}px ${p}px ${c}px ${l}px`,
    borderRadius: "100%"
  }), Lt(i, n), e && (i.id = e), s && (i.className = s), i;
}, ne = (n) => {
  const o = typeof n == "string" ? document.querySelector(n) : n;
  if (!o) throw Error("Invalid DOM element");
  return o;
}, { clamp: at } = xt, se = [
  ["x", 0, 3],
  ["y", 1, 4],
  ["z", 2, 5]
], ft = /* @__PURE__ */ new D();
function _t(n, o) {
  const { idleMaterial: t, hoverMaterial: e, hover: s, opacity: i } = n.userData;
  if (!t || !e) {
    n.material.opacity = o;
    return;
  }
  t.opacity = o;
  const a = i > 0 ? i : 1, l = at(
    o * (s.opacity / a),
    0,
    1
  );
  e.opacity = l;
}
function gt({ isSphere: n }, o, t) {
  n && (ft.set(0, 0, 1).applyQuaternion(t.quaternion), se.forEach(([e, s, i]) => {
    const a = ft[e];
    let l = o[s], p = l.userData.opacity;
    _t(
      l,
      at(a >= 0 ? p : p / 2, 0, 1)
    ), l = o[i], p = l.userData.opacity, _t(
      l,
      at(a >= 0 ? p / 2 : p, 0, 1)
    );
  }));
}
const oe = (n, o, t = 10) => Math.abs(n.clientX - o.x) < t && Math.abs(n.clientY - o.y) < t, yt = /* @__PURE__ */ new Rt(), vt = /* @__PURE__ */ new J(), bt = (n, o, t, e) => {
  vt.set(
    (n.clientX - o.left) / o.width * 2 - 1,
    -((n.clientY - o.top) / o.height) * 2 + 1
  ), yt.setFromCamera(vt, t);
  const s = yt.intersectObjects(
    e,
    !1
  );
  if (s.length > 0) {
    s.sort((c, d) => c.distance - d.distance);
    const a = 0.2, l = s[0].distance, p = s.filter(
      (c) => c.distance <= l + a
    );
    p.length > 1 && (p.sort((c, d) => {
      const m = c.object.userData.intersectionOrder ?? 0;
      return (d.object.userData.intersectionOrder ?? 0) - m;
    }), s.splice(0, p.length, ...p));
  }
  const i = s.length ? s[0] : null;
  return !i || !i.object.visible ? null : i;
}, W = 1e-6, ie = 2 * Math.PI, Tt = ["x", "y", "z"], k = [...Tt, "nx", "ny", "nz"], re = ["x", "z", "y", "nx", "nz", "ny"], ae = ["z", "x", "y", "nz", "nx", "ny"], tt = "Right", et = "Top", nt = "Front", st = "Left", ot = "Bottom", it = "Back", Ct = [
  "right",
  "top",
  "front",
  "left",
  "bottom",
  "back"
], Pt = 1.3, wt = (n, o = !0) => {
  const { material: t, userData: e } = n, { color: s, opacity: i } = o ? e.hover : e;
  t.color.set(s), t.opacity = i;
}, R = (n) => JSON.parse(JSON.stringify(n)), ce = {
  yUp: {
    x: tt,
    y: et,
    z: nt,
    nx: st,
    ny: ot,
    nz: it
  },
  zUp: {
    x: tt,
    y: it,
    z: et,
    nx: st,
    ny: nt,
    nz: ot
  },
  xUp: {
    x: et,
    y: nt,
    z: tt,
    nx: ot,
    ny: it,
    nz: st
  }
}, le = (n) => {
  const o = n.type || "sphere", t = o === "sphere", e = o === "rounded-cube", s = n.resolution || t ? 64 : 128, i = U.DEFAULT_UP, a = i.z === 1, l = i.x === 1, c = ce[a ? "zUp" : l ? "xUp" : "yUp"], { container: d } = n;
  n.container = void 0, n = JSON.parse(JSON.stringify(n)), n.container = d;
  const m = a ? re : l ? ae : k;
  Ct.forEach((f, b) => {
    n[f] && (n[m[b]] = n[f]);
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
  }, M = {
    type: o,
    container: document.body,
    size: 128,
    placement: "top-right",
    resolution: s,
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
      ...R(h),
      ...t ? { label: "X", color: 16725587, line: !0 } : { label: c.x }
    },
    y: {
      ...R(h),
      ...t ? { label: "Y", color: 9100032, line: !0 } : { label: c.y }
    },
    z: {
      ...R(h),
      ...t ? { label: "Z", color: 2920447, line: !0 } : { label: c.z }
    },
    nx: {
      ...R(v),
      label: t ? "" : c.nx
    },
    ny: {
      ...R(v),
      label: t ? "" : c.ny
    },
    nz: {
      ...R(v),
      label: t ? "" : c.nz
    }
  };
  if (ct(n, M), e) {
    const f = n;
    f.edges.radius = f.radius, f.edges.scale = 1, f.edges.opacity = 1, f.edges.hover.scale = 1, f.edges.hover.opacity = 1, f.corners.radius = f.radius, f.corners.scale = 1, f.corners.opacity = 1, f.corners.hover.scale = 1, f.corners.hover.opacity = 1, f.radius = 0, k.forEach((b) => {
      f[b].scale = 1, f[b].opacity = 1, f[b].hover.scale = 1, f[b].hover.opacity = 1;
    });
  }
  return Tt.forEach(
    (f) => ct(
      n[`n${f}`],
      R(n[f])
    )
  ), { ...n, isSphere: t };
};
function ct(n, ...o) {
  if (n instanceof HTMLElement || typeof n != "object" || n === null)
    return n;
  for (const t of o)
    for (const e in t)
      e !== "container" && e in t && (n[e] === void 0 ? n[e] = t[e] : typeof t[e] == "object" && !Array.isArray(t[e]) && (n[e] = ct(
        n[e] || {},
        t[e]
      )));
  return n;
}
const he = (n, o = 2) => {
  const t = new At(), e = o * 2, { isSphere: s, resolution: i, radius: a, font: l, corners: p, edges: c } = n, d = k.map((r) => ({ ...n[r], radius: a }));
  s && p.enabled && d.push(p), s && c.enabled && d.push(c);
  const m = document.createElement("canvas"), h = m.getContext("2d");
  m.width = i * 2 + e * 2, m.height = i * d.length + e * d.length;
  const [v, M] = x(d, i, l);
  d.forEach(
    ({
      radius: r,
      label: u,
      color: T,
      labelColor: _,
      border: y,
      hover: {
        color: F,
        labelColor: L,
        border: C
      }
    }, P) => {
      const z = i * P + P * e + o;
      S(
        o,
        z,
        o,
        i,
        r,
        u,
        y,
        T,
        _
      ), S(
        i + o * 3,
        z,
        o,
        i,
        r,
        u,
        C ?? y,
        F ?? T,
        L ?? _
      );
    }
  );
  const f = d.length, b = o / (i * 2), A = o / (i * 6), E = 1 / f, O = new It(m);
  return O.repeat.set(0.5 - 2 * b, E - 2 * A), O.offset.set(b, 1 - A), Object.assign(O, {
    colorSpace: Gt,
    wrapS: mt,
    wrapT: mt,
    userData: {
      offsetX: b,
      offsetY: A,
      cellHeight: E
    }
  }), O;
  function S(r, u, T, _, y, F, L, C, P) {
    if (y = y * (_ / 2), C != null && C !== "" && (z(), h.fillStyle = t.set(C).getStyle(), h.fill()), L && L.size) {
      const q = L.size * _ / 2;
      r += q, u += q, _ -= L.size * _, y = Math.max(0, y - q), z(), h.strokeStyle = t.set(L.color).getStyle(), h.lineWidth = L.size * _, h.stroke();
    }
    F && w(
      h,
      r + _ / 2,
      u + (_ + T) / 2,
      F,
      t.set(P).getStyle()
    );
    function z() {
      h.beginPath(), h.moveTo(r + y, u), h.lineTo(r + _ - y, u), h.arcTo(r + _, u, r + _, u + y, y), h.lineTo(r + _, u + _ - y), h.arcTo(r + _, u + _, r + _ - y, u + _, y), h.lineTo(r + y, u + _), h.arcTo(r, u + _, r, u + _ - y, y), h.lineTo(r, u + y), h.arcTo(r, u, r + y, u, y), h.closePath();
    }
  }
  function x(r, u, T) {
    const y = [...r].sort((X, Ft) => {
      var dt, ut;
      return (((dt = X.label) == null ? void 0 : dt.length) || 0) - (((ut = Ft.label) == null ? void 0 : ut.length) || 0);
    }).pop().label, { family: F, weight: L } = T, C = s ? Math.sqrt(Math.pow(u * 0.7, 2) / 2) : u;
    let P = C;
    n.font.size > 0 && (P = n.font.size);
    let z = 0, q = 0;
    do {
      h.font = `${L} ${P}px ${F}`;
      const X = h.measureText(y);
      z = X.width, q = X.fontBoundingBoxDescent, P--;
    } while (z > C && P > 0);
    const pt = C / q, zt = Math.min(C / z, pt), Dt = Math.floor(P * zt);
    return [`${L} ${Dt}px ${F}`, pt];
  }
  function w(r, u, T, _, y) {
    r.font = v, r.textAlign = "center", r.textBaseline = "middle", r.fillStyle = y, r.fillText(_, u, T + (s ? M : 0));
  }
}, j = (n, o, t) => {
  const e = n.clone();
  pe(e, o);
  const { offsetX: s } = e.userData;
  return e.offset.setX((t ? 0.5 : 0) + s), e;
}, pe = (n, o) => {
  const {
    offset: t,
    userData: { offsetY: e, cellHeight: s }
  } = n;
  t.y = 1 - (o + 1) * s + e;
};
function ht(n, o, t = 2, e = 2) {
  const s = t / 2 - n, i = e / 2 - n, a = n / t, l = (t - n) / t, p = n / e, c = (e - n) / e, d = [s, i, 0, -s, i, 0, -s, -i, 0, s, -i, 0], m = [l, c, a, c, a, p, l, p], h = [
    3 * (o + 1) + 3,
    3 * (o + 1) + 4,
    o + 4,
    o + 5,
    2 * (o + 1) + 4,
    2,
    1,
    2 * (o + 1) + 3,
    3,
    4 * (o + 1) + 3,
    4,
    0
  ], v = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11].map(
    (w) => h[w]
  );
  let M, f, b, A, E, O, S, x;
  for (let w = 0; w < 4; w++) {
    A = w < 1 || w > 2 ? s : -s, E = w < 2 ? i : -i, O = w < 1 || w > 2 ? l : a, S = w < 2 ? c : p;
    for (let r = 0; r <= o; r++)
      M = Math.PI / 2 * (w + r / o), f = Math.cos(M), b = Math.sin(M), d.push(A + n * f, E + n * b, 0), m.push(O + a * f, S + p * b), r < o && (x = (o + 1) * w + r + 4, v.push(w, x, x + 1));
  }
  return new qt().setIndex(new K(new Uint32Array(v), 1)).setAttribute(
    "position",
    new K(new Float32Array(d), 3)
  ).setAttribute("uv", new K(new Float32Array(m), 2));
}
const de = (n, o) => {
  const t = new D(), { isSphere: e, radius: s, smoothness: i, type: a } = n, p = a === "rounded-cube" ? 2 - n.edges.radius * 2 : 2, c = ht(s, i, p, p);
  return k.map((d, m) => {
    const h = m < 3, v = k[m], M = j(o, m, !1), f = j(o, m, !0), { enabled: b, scale: A, opacity: E, hover: O } = n[v], S = {
      map: M,
      opacity: E,
      transparent: !0
    }, x = {
      map: f,
      opacity: O.opacity,
      transparent: !0
    }, w = e ? new Z(S) : new G(S), r = e ? new Z(x) : new G(x), u = e ? new lt(w) : new V(c, w), T = h ? v : v[1];
    if (u.position[T] = (h ? 1 : -1) * (e ? Pt : 1), !e) {
      u.lookAt(t.copy(u.position).multiplyScalar(1.7));
      const _ = U.DEFAULT_UP.z === 1, y = U.DEFAULT_UP.x === 1;
      (_ || y) && (v === "z" && _ || v === "x" && y ? u.rotateZ(-Math.PI / 2) : (v === "nz" && _ || v === "nx" && y) && u.rotateZ(Math.PI / 2));
    }
    return u.scale.setScalar(A), u.renderOrder = 1, u.visible = b, u.userData = {
      scale: A,
      opacity: E,
      hover: O,
      kind: "face",
      axes: [k[m]],
      face: Ct[m],
      idleMaterial: w,
      hoverMaterial: r
    }, u;
  });
}, St = k.length, ue = (n, o) => {
  const { isSphere: t, corners: e, type: s } = n, i = s === "rounded-cube";
  if (!e.enabled) return [];
  const { color: a, opacity: l, scale: p, radius: c, smoothness: d, hover: m } = e, h = t ? null : i ? new Ot(c, d * 2, d) : ht(c, d), v = i ? 1 - c : 0.85, M = [
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
  ].map((b) => b * v), f = new D();
  return Array(M.length / 3).fill(0).map((b, A) => {
    let E, O;
    if (t) {
      const r = j(o, St, !1), u = j(o, St, !0), T = {
        map: r,
        opacity: l,
        transparent: !0
      }, _ = {
        map: u,
        opacity: m.opacity,
        transparent: !0
      };
      E = new Z(T), O = new Z(_);
    } else
      E = new G({
        transparent: !0,
        opacity: l,
        color: a
      }), O = new G({
        transparent: !0,
        opacity: m.opacity,
        color: m.color ?? a
      });
    const S = t ? new lt(E) : new V(h, E), x = A * 3;
    S.position.set(M[x], M[x + 1], M[x + 2]), t && S.position.normalize().multiplyScalar(1.7), S.scale.setScalar(p), S.lookAt(f.copy(S.position).multiplyScalar(2)), S.renderOrder = 1;
    const w = [
      S.position.x > 0 ? "x" : "nx",
      S.position.y > 0 ? "y" : "ny",
      S.position.z > 0 ? "z" : "nz"
    ];
    return S.userData = {
      color: a,
      opacity: l,
      scale: p,
      hover: m,
      intersectionOrder: 1,
      kind: "corner",
      axes: w,
      idleMaterial: E,
      hoverMaterial: O
    }, S;
  });
}, rt = (n, o, t) => n === 0 ? null : n > 0 ? o : t, me = (n, o, t) => {
  const { isSphere: e, edges: s, type: i } = n, a = i === "rounded-cube";
  if (!s.enabled) return [];
  const { color: l, opacity: p, scale: c, hover: d, radius: m, smoothness: h } = s, v = a ? 2 - m * 2 : 1.2, M = e ? null : a ? new Bt(m, m, v, h * 4) : ht(m, h, v, 0.25), f = a ? 1 - m : 0.925, b = [
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
  ].map((O) => O * f), A = new D(), E = new D(0, 1, 0);
  return Array(b.length / 3).fill(0).map((O, S) => {
    let x, w;
    if (e) {
      const L = j(o, t, !1), C = j(o, t, !0), P = {
        map: L,
        opacity: p,
        transparent: !0
      }, z = {
        map: C,
        opacity: d.opacity,
        transparent: !0
      };
      x = new Z(P), w = new Z(z);
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
    const r = e ? new lt(x) : new V(M, x), u = S * 3;
    r.position.set(b[u], b[u + 1], b[u + 2]), e && r.position.normalize().multiplyScalar(1.7), r.scale.setScalar(c), r.up.copy(E), r.lookAt(A.copy(r.position).multiplyScalar(2)), a ? (!e && !r.position.z && (r.rotation.z = Math.PI), !e && !r.position.x && (r.rotation.x = 0), !e && !r.position.x && (r.rotation.z = Math.PI / 2)) : !e && !r.position.y && (r.rotation.z = Math.PI / 2), r.renderOrder = 1;
    const T = rt(r.position.x, "x", "nx"), _ = rt(r.position.y, "y", "ny"), y = rt(r.position.z, "z", "nz"), F = [T, _, y].filter((L) => L !== null);
    return r.userData = {
      color: l,
      opacity: p,
      scale: c,
      hover: d,
      kind: "edge",
      axes: F,
      idleMaterial: x,
      hoverMaterial: w
    }, r;
  });
}, fe = (n, o) => {
  const {
    isSphere: t,
    background: { enabled: e, color: s, opacity: i, hover: a }
  } = o;
  let l;
  const p = new G({
    color: s,
    side: Zt,
    opacity: i,
    transparent: !0,
    depthWrite: !1
  });
  if (!e) return null;
  if (t)
    l = new V(
      new Ot(1.8, 64, 64),
      p
    );
  else {
    let c;
    n.forEach((d) => {
      const m = d.scale.x;
      d.scale.setScalar(0.9), d.updateMatrix();
      const h = d.geometry.clone();
      h.applyMatrix4(d.matrix), c = c ? Qt([c, h]) : h, d.scale.setScalar(m);
    }), l = new V(c, p);
  }
  return l.userData = {
    color: s,
    opacity: i,
    hover: a
  }, l;
}, _e = (n, o) => {
  const t = new At(), e = [], s = [], { isSphere: i } = n;
  if (k.forEach((c, d) => {
    const { enabled: m, line: h, scale: v, color: M } = n[c];
    if (!m || !h) return;
    const f = d < 3 ? 1 : -1, A = (i ? Pt - v / 2 : 0.975) * f;
    e.push(
      c.includes("x") ? A : 0,
      c.includes("y") ? A : 0,
      c.includes("z") ? A : 0,
      0,
      0,
      0
    );
    const E = t.set(M).toArray();
    s.push(...E, ...E);
  }), !e.length) return null;
  const a = new Kt().setPositions(e).setColors(s);
  if (o.isWebGPURenderer === !0) {
    const c = new Nt({
      linewidth: n.lineWidth,
      vertexColors: !0,
      worldUnits: !1
    });
    return new Jt(a, c).computeLineDistances();
  }
  const p = new te({
    linewidth: n.lineWidth,
    vertexColors: !0,
    resolution: new J(window.innerWidth, window.innerHeight)
  });
  return new Yt(a, p).computeLineDistances();
}, ge = (n, o) => {
  const { corners: t, edges: e } = n, s = [], i = he(n), a = de(n, i);
  s.push(...a), t.enabled && s.push(...ue(n, i)), e.enabled && s.push(...me(n, i, t.enabled ? 7 : 6));
  const l = fe(a, n), p = _e(n, o);
  return [s, l, p];
}, $ = (n, o = !0) => {
  const { userData: t } = n, { idleMaterial: e, hoverMaterial: s } = t;
  n.scale.setScalar((o ? t.hover : t).scale), n.material = o ? s : e;
}, { clamp: ye } = xt, ve = /* @__PURE__ */ new D();
function B(n) {
  if (!n) return { kind: null, axes: null, face: null, direction: null };
  const o = n.userData;
  return {
    kind: o.kind ?? null,
    axes: o.axes ?? null,
    face: o.face ?? null,
    direction: ve.copy(n.position).normalize().clone()
  };
}
const Q = /* @__PURE__ */ new Xt(), Mt = /* @__PURE__ */ new Wt(), be = /* @__PURE__ */ new J(), I = /* @__PURE__ */ new D(), Et = /* @__PURE__ */ new Vt(), N = /* @__PURE__ */ new H().setFromAxisAngle(new D(0, 0, 1), Math.PI / 2), Y = /* @__PURE__ */ new H().setFromAxisAngle(new D(0, 0, 1), -Math.PI / 2);
class Te extends U {
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
  constructor(t, e, s = {}) {
    super();
    /** Whether the gizmo is currently active and responding to user input */
    g(this, "enabled", !0);
    /** The camera being controlled by this gizmo */
    g(this, "camera");
    /** The WebGLRenderer rendering the gizmo */
    g(this, "renderer");
    /** The configuration options */
    g(this, "options");
    /** The point around which the camera rotates */
    g(this, "target", new D());
    /** Whether view changes should be animated */
    g(this, "animated", !0);
    /** The speed of view change animations. Higher values result in faster animations */
    g(this, "speed", 1);
    /**
     * Indicates whether the gizmo is currently being animated or not,
     * Useful when interacting with other camera controllers
     *
     * @readonly This value is set internally.
     **/
    g(this, "animating", !1);
    g(this, "_options");
    g(this, "_intersections");
    g(this, "_background", null);
    g(this, "_viewport", [0, 0, 0, 0]);
    g(this, "_originalViewport", [0, 0, 0, 0]);
    g(this, "_originalScissor", [0, 0, 0, 0]);
    g(this, "_scene");
    g(this, "_camera");
    g(this, "_container");
    g(this, "_domElement");
    g(this, "_domRect");
    g(this, "_dragging", !1);
    g(this, "_distance", 0);
    /** Seconds; `null` until first `_animate` tick after `_setOrientation` (first frame uses delta 0). */
    g(this, "_lastAnimateTimeSeconds", null);
    g(this, "_targetQuaternion", new H());
    g(this, "_quaternionStart", new H());
    g(this, "_quaternionEnd", new H());
    g(this, "_pointerStart", new J());
    g(this, "_focus", null);
    g(this, "_placement");
    g(this, "_controls");
    g(this, "_controlsListeners");
    this.camera = t, this.renderer = e, this._scene = new jt().add(this), this.set(s);
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
    this._placement = Lt(this._domElement, t), this.domUpdate();
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
    this.dispose(), this.options = t, this._options = le(t), this._camera = this._options.isSphere ? new $t(-1.8, 1.8, 1.8, -1.8, 5, 10) : new Ht(26, 1, 5, 10), this._camera.position.set(0, 0, 7);
    const [e, s, i] = ge(this._options, this.renderer);
    s && this.add(s), i && this.add(i), this.add(...e), this._background = s, this._intersections = e;
    const { container: a, animated: l, speed: p } = this._options;
    return this.animated = l, this.speed = p, this._container = a ? ne(a) : document.body, this._domElement = ee(this._options), this._domElement.onpointerdown = (c) => this._onPointerDown(c), this._domElement.onpointermove = (c) => this._onPointerMove(c), this._domElement.onpointerleave = () => this._onPointerLeave(), this._container.appendChild(this._domElement), this._controls && this.attachControls(this._controls), this.update(), this;
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
    const { renderer: t, _viewport: e } = this, s = t.getScissorTest(), i = t.autoClear;
    return t.autoClear = !1, t.setViewport(...e), s && t.setScissor(...e), t.clear(!1, !0, !1), t.render(this._scene, this._camera), t.setViewport(...this._originalViewport), s && t.setScissor(...this._originalScissor), t.autoClear = i, this;
  }
  /**
   * Updates the gizmo's DOM-related properties based on its current position
   * and size in the document.
   *
   * @returns The gizmo instance for method chaining
   */
  domUpdate() {
    this._domRect = this._domElement.getBoundingClientRect();
    const t = this.renderer, e = this._domRect, s = t.domElement.getBoundingClientRect(), i = t.isWebGPURenderer === !0, a = e.top - s.top, l = i ? a : t.domElement.clientHeight - (a + e.height);
    return this._viewport.splice(
      0,
      4,
      e.left - s.left,
      l,
      e.width,
      e.height
    ), t.getViewport(Et).toArray(this._originalViewport), t.getScissorTest() && t.getScissor(Et).toArray(this._originalScissor), this;
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
      return this.target = new D().copy(this._controls.target), this.removeEventListener("start", this._controlsListeners.start), this.removeEventListener("end", this._controlsListeners.end), this._controls.removeEventListener(
        "change",
        this._controlsListeners.change
      ), this._controlsListeners = void 0, this._controls = void 0, this;
  }
  /** Cleans up all resources including geometries, materials, textures, and event listeners. */
  dispose() {
    var t;
    this.detachControls(), this.children.forEach((e) => {
      var a, l, p, c, d;
      this.remove(e);
      const s = e.userData;
      if (s.idleMaterial && s.hoverMaterial)
        (a = s.idleMaterial.map) == null || a.dispose(), s.idleMaterial.dispose(), s.hoverMaterial !== s.idleMaterial && ((l = s.hoverMaterial.map) == null || l.dispose(), s.hoverMaterial.dispose());
      else {
        const m = e, { material: h } = m;
        if (Array.isArray(h))
          for (const v of h) {
            const M = v;
            (p = M.map) == null || p.dispose(), M.dispose();
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
    t && (this.quaternion.copy(this.camera.quaternion).invert(), this.updateMatrixWorld()), gt(this._options, this._intersections, this.camera);
  }
  /**
   * Handles the animation of camera position and orientation changes.
   *
   * @private
   */
  _animate() {
    const { position: t, quaternion: e } = this.camera;
    if (t.set(0, 0, 1), !this.animated) {
      t.applyQuaternion(this._quaternionEnd).multiplyScalar(this._distance).add(this.target), e.copy(this._targetQuaternion), this._updateOrientation(), this.animating = !1, this._lastAnimateTimeSeconds = null, this.dispatchEvent({ type: "change", ...B(null) }), this.dispatchEvent({ type: "end" });
      return;
    }
    this._controls && (this._controls.enabled = !1);
    const s = performance.now() / 1e3, i = this._lastAnimateTimeSeconds === null ? 0 : s - this._lastAnimateTimeSeconds;
    this._lastAnimateTimeSeconds = s;
    const a = i * ie * this.speed;
    if (this._quaternionStart.rotateTowards(this._quaternionEnd, a), t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target), e.rotateTowards(this._targetQuaternion, a), this._updateOrientation(), requestAnimationFrame(
      () => this.dispatchEvent({ type: "change", ...B(null) })
    ), this._quaternionStart.angleTo(this._quaternionEnd) < W) {
      if (this._controls) {
        const l = this.camera.position.clone().sub(this.target).normalize();
        U.DEFAULT_UP.z === 1 && Math.abs(l.z) > 0.99 ? this.camera.position.set(0, -1e-6, this.camera.position.z) : U.DEFAULT_UP.x === 1 && Math.abs(l.x) > 0.99 && this.camera.position.set(this.camera.position.x, W, 0), this._controls.update(), this._controls.enabled = !0;
      }
      this.animating = !1, this._lastAnimateTimeSeconds = null, this.dispatchEvent({ type: "end" });
    }
  }
  /**
   * Sets the camera orientation to look at the target from a specific axis.
   *
   * @private
   * @param position - The axis point position
   */
  _setOrientation(t) {
    const e = this.camera, s = this.target;
    if (I.copy(t).multiplyScalar(this._distance), Q.setPosition(I).lookAt(I, this.position, this.up), this._targetQuaternion.setFromRotationMatrix(Q), I.add(s), Q.lookAt(I, s, this.up), this._quaternionEnd.setFromRotationMatrix(Q), this._quaternionStart.copy(e.quaternion), U.DEFAULT_UP.z === 1 && Math.abs(t.z) > 0.99) {
      const i = Math.sign(t.z);
      this._targetQuaternion.multiply(i === 1 ? Y : N), this._quaternionEnd.multiply(i === 1 ? Y : N);
    } else if (U.DEFAULT_UP.x === 1 && Math.abs(t.x) > 0.99) {
      const i = Math.sign(t.x);
      this._targetQuaternion.multiply(i === 1 ? Y : N), this._quaternionEnd.multiply(i === 1 ? Y : N);
    }
    this.animating = !0, this._lastAnimateTimeSeconds = null, this.dispatchEvent({ type: "start" });
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
        if (oe(c, this._pointerStart)) return;
        this._dragging = !0;
      }
      const d = be.set(c.clientX, c.clientY).sub(this._pointerStart).multiplyScalar(1 / this._domRect.width * Math.PI), m = this.coordinateConversion(
        I.subVectors(this.camera.position, this.target)
      ), h = Mt.setFromVector3(m);
      h.theta = l - d.x, h.phi = ye(
        p - d.y,
        W,
        Math.PI - W
      ), this.coordinateConversion(
        this.camera.position.setFromSpherical(h),
        !0
      ).add(this.target), this.camera.lookAt(this.target), this.quaternion.copy(this.camera.quaternion).invert(), this._updateOrientation(!1), this.dispatchEvent({ type: "change", ...B(null) });
    }, s = () => {
      if (document.removeEventListener("pointermove", e, !1), document.removeEventListener("pointerup", s, !1), !this._dragging) return this._handleClick(t);
      this._focus && ($(this._focus, !1), this._focus = null), this._dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating) return;
    t.preventDefault(), this._pointerStart.set(t.clientX, t.clientY);
    const i = this.coordinateConversion(
      I.subVectors(this.camera.position, this.target)
    ), a = Mt.setFromVector3(i), l = a.theta, p = a.phi;
    this._distance = a.radius, document.addEventListener("pointermove", e, !1), document.addEventListener("pointerup", s, !1), this.dispatchEvent({ type: "start" });
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
    const { x: s, y: i, z: a } = t, l = U.DEFAULT_UP;
    return l.x === 1 ? e ? t.set(i, a, s) : t.set(a, s, i) : l.z === 1 ? e ? t.set(a, s, i) : t.set(i, a, s) : t;
  }
  /**
   * Handles pointer move events for hover effects and drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerMove(t) {
    !this.enabled || this._dragging || (this._background && wt(this._background, !0), this._handleHover(t));
  }
  /**
   * Handles pointer leave events to reset hover states.
   *
   * @private
   */
  _onPointerLeave() {
    if (!this.enabled || this._dragging) return;
    this._background && wt(this._background, !1);
    const t = this._focus !== null;
    this._focus && ($(this._focus, !1), this._focus = null), this._domElement.style.cursor = "", t && this.dispatchEvent({
      type: "hoverchange",
      object: null,
      ...B(null)
    });
  }
  /**
   * Handles click events for axis selection.
   *
   * @private
   * @param e - The pointer event
   */
  _handleClick(t) {
    const e = bt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    );
    this._focus && ($(this._focus, !1), this._focus = null), e && (this._setOrientation(e.object.position), this.dispatchEvent({
      type: "change",
      ...B(e.object)
    }));
  }
  /**
   * Handles hover effects for interactive elements.
   *
   * @private
   * @param e - The pointer event
   */
  _handleHover(t) {
    const e = bt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    ), s = (e == null ? void 0 : e.object) || null;
    this._focus !== s && (this._domElement.style.cursor = s ? "pointer" : "", this._focus && $(this._focus, !1), (this._focus = s) ? $(s, !0) : gt(this._options, this._intersections, this.camera), this.dispatchEvent({ type: "hoverchange", object: s, ...B(s) }));
  }
}
export {
  Te as ViewportGizmo
};
//# sourceMappingURL=three-viewport-gizmo.js.map
