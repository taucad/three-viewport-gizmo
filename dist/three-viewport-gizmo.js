var Ut = Object.defineProperty;
var kt = (n, s, t) => s in n ? Ut(n, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[s] = t;
var g = (n, s, t) => kt(n, typeof s != "symbol" ? s + "" : s, t);
import { MathUtils as xt, Vector3 as z, Vector2 as J, Raycaster as Rt, Object3D as U, Color as At, CanvasTexture as It, RepeatWrapping as mt, SRGBColorSpace as Gt, BufferGeometry as qt, BufferAttribute as K, SpriteMaterial as Z, MeshBasicMaterial as G, Sprite as lt, Mesh as V, SphereGeometry as Ct, CylinderGeometry as Bt, BackSide as Zt, Quaternion as H, Scene as jt, OrthographicCamera as $t, PerspectiveCamera as Ht, Vector4 as Vt, Matrix4 as Xt, Spherical as Wt } from "three";
import { mergeGeometries as Qt } from "three/addons/utils/BufferGeometryUtils.js";
import { Line2NodeMaterial as Nt } from "three/webgpu";
import { Line2 as Yt } from "three/addons/lines/Line2.js";
import { Line2 as Jt } from "three/addons/lines/webgpu/Line2.js";
import { LineGeometry as Kt } from "three/addons/lines/LineGeometry.js";
import { LineMaterial as te } from "three/addons/lines/LineMaterial.js";
const Ot = (n, s) => {
  const [t, e] = s.split("-");
  return Object.assign(n.style, {
    left: e === "left" ? "0" : e === "center" ? "50%" : "",
    right: e === "right" ? "0" : "",
    top: t === "top" ? "0" : t === "bottom" ? "" : "50%",
    bottom: t === "bottom" ? "0" : "",
    transform: `${e === "center" ? "translateX(-50%)" : ""} ${t === "center" ? "translateY(-50%)" : ""}`
  }), s;
}, ee = ({
  placement: n,
  size: s,
  offset: t,
  id: e,
  className: o
}) => {
  const i = document.createElement("div"), { top: r, left: c, right: p, bottom: l } = t;
  return Object.assign(i.style, {
    id: e,
    position: "absolute",
    zIndex: "1000",
    height: `${s}px`,
    width: `${s}px`,
    margin: `${r}px ${p}px ${l}px ${c}px`,
    borderRadius: "100%"
  }), Ot(i, n), e && (i.id = e), o && (i.className = o), i;
}, ne = (n) => {
  const s = typeof n == "string" ? document.querySelector(n) : n;
  if (!s) throw Error("Invalid DOM element");
  return s;
}, { clamp: at } = xt, oe = [
  ["x", 0, 3],
  ["y", 1, 4],
  ["z", 2, 5]
], ft = /* @__PURE__ */ new z();
function _t(n, s) {
  const { idleMaterial: t, hoverMaterial: e, hover: o, opacity: i } = n.userData;
  if (!t || !e) {
    n.material.opacity = s;
    return;
  }
  t.opacity = s;
  const r = i > 0 ? i : 1, c = at(
    s * (o.opacity / r),
    0,
    1
  );
  e.opacity = c;
}
function gt({ isSphere: n }, s, t) {
  n && (ft.set(0, 0, 1).applyQuaternion(t.quaternion), oe.forEach(([e, o, i]) => {
    const r = ft[e];
    let c = s[o], p = c.userData.opacity;
    _t(
      c,
      at(r >= 0 ? p : p / 2, 0, 1)
    ), c = s[i], p = c.userData.opacity, _t(
      c,
      at(r >= 0 ? p / 2 : p, 0, 1)
    );
  }));
}
const se = (n, s, t = 10) => Math.abs(n.clientX - s.x) < t && Math.abs(n.clientY - s.y) < t, yt = /* @__PURE__ */ new Rt(), vt = /* @__PURE__ */ new J(), bt = (n, s, t, e) => {
  vt.set(
    (n.clientX - s.left) / s.width * 2 - 1,
    -((n.clientY - s.top) / s.height) * 2 + 1
  ), yt.setFromCamera(vt, t);
  const o = yt.intersectObjects(
    e,
    !1
  );
  if (o.length > 0) {
    o.sort((l, u) => l.distance - u.distance);
    const r = 0.2, c = o[0].distance, p = o.filter(
      (l) => l.distance <= c + r
    );
    p.length > 1 && (p.sort((l, u) => {
      const m = l.object.userData.intersectionOrder ?? 0;
      return (u.object.userData.intersectionOrder ?? 0) - m;
    }), o.splice(0, p.length, ...p));
  }
  const i = o.length ? o[0] : null;
  return !i || !i.object.visible ? null : i;
}, W = 1e-6, ie = 2 * Math.PI, Lt = ["x", "y", "z"], k = [...Lt, "nx", "ny", "nz"], re = ["x", "z", "y", "nx", "nz", "ny"], ae = ["z", "x", "y", "nz", "nx", "ny"], tt = "Right", et = "Top", nt = "Front", ot = "Left", st = "Bottom", it = "Back", Tt = [
  "right",
  "top",
  "front",
  "left",
  "bottom",
  "back"
], Pt = 1.3, wt = (n, s = !0) => {
  const { material: t, userData: e } = n, { color: o, opacity: i } = s ? e.hover : e;
  t.color.set(o), t.opacity = i;
}, R = (n) => JSON.parse(JSON.stringify(n)), ce = {
  yUp: {
    x: tt,
    y: et,
    z: nt,
    nx: ot,
    ny: st,
    nz: it
  },
  zUp: {
    x: tt,
    y: it,
    z: et,
    nx: ot,
    ny: nt,
    nz: st
  },
  xUp: {
    x: et,
    y: nt,
    z: tt,
    nx: st,
    ny: it,
    nz: ot
  }
}, le = (n) => {
  const s = n.type || "sphere", t = s === "sphere", e = s === "rounded-cube", o = n.resolution || t ? 64 : 128, i = U.DEFAULT_UP, r = i.z === 1, c = i.x === 1, l = ce[r ? "zUp" : c ? "xUp" : "yUp"], { container: u } = n;
  n.container = void 0, n = JSON.parse(JSON.stringify(n)), n.container = u;
  const m = r ? re : c ? ae : k;
  Tt.forEach((f, b) => {
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
      ...R(h),
      ...t ? { label: "X", color: 16725587, line: !0 } : { label: l.x }
    },
    y: {
      ...R(h),
      ...t ? { label: "Y", color: 9100032, line: !0 } : { label: l.y }
    },
    z: {
      ...R(h),
      ...t ? { label: "Z", color: 2920447, line: !0 } : { label: l.z }
    },
    nx: {
      ...R(v),
      label: t ? "" : l.nx
    },
    ny: {
      ...R(v),
      label: t ? "" : l.ny
    },
    nz: {
      ...R(v),
      label: t ? "" : l.nz
    }
  };
  if (ct(n, M), e) {
    const f = n;
    f.edges.radius = f.radius, f.edges.scale = 1, f.edges.opacity = 1, f.edges.hover.scale = 1, f.edges.hover.opacity = 1, f.corners.radius = f.radius, f.corners.scale = 1, f.corners.opacity = 1, f.corners.hover.scale = 1, f.corners.hover.opacity = 1, f.radius = 0, k.forEach((b) => {
      f[b].scale = 1, f[b].opacity = 1, f[b].hover.scale = 1, f[b].hover.opacity = 1;
    });
  }
  return Lt.forEach(
    (f) => ct(
      n[`n${f}`],
      R(n[f])
    )
  ), { ...n, isSphere: t };
};
function ct(n, ...s) {
  if (n instanceof HTMLElement || typeof n != "object" || n === null)
    return n;
  for (const t of s)
    for (const e in t)
      e !== "container" && e in t && (n[e] === void 0 ? n[e] = t[e] : typeof t[e] == "object" && !Array.isArray(t[e]) && (n[e] = ct(
        n[e] || {},
        t[e]
      )));
  return n;
}
const he = (n, s = 2) => {
  const t = new At(), e = s * 2, { isSphere: o, resolution: i, radius: r, font: c, corners: p, edges: l } = n, u = k.map((a) => ({ ...n[a], radius: r }));
  o && p.enabled && u.push(p), o && l.enabled && u.push(l);
  const m = document.createElement("canvas"), h = m.getContext("2d");
  m.width = i * 2 + e * 2, m.height = i * u.length + e * u.length;
  const [v, M] = x(u, i, c);
  u.forEach(
    ({
      radius: a,
      label: d,
      color: L,
      labelColor: _,
      border: y,
      hover: {
        color: F,
        labelColor: O,
        border: T
      }
    }, P) => {
      const D = i * P + P * e + s;
      S(
        s,
        D,
        s,
        i,
        a,
        d,
        y,
        L,
        _
      ), S(
        i + s * 3,
        D,
        s,
        i,
        a,
        d,
        T ?? y,
        F ?? L,
        O ?? _
      );
    }
  );
  const f = u.length, b = s / (i * 2), A = s / (i * 6), E = 1 / f, C = new It(m);
  return C.repeat.set(0.5 - 2 * b, E - 2 * A), C.offset.set(b, 1 - A), Object.assign(C, {
    colorSpace: Gt,
    wrapS: mt,
    wrapT: mt,
    userData: {
      offsetX: b,
      offsetY: A,
      cellHeight: E
    }
  }), C;
  function S(a, d, L, _, y, F, O, T, P) {
    if (y = y * (_ / 2), T != null && T !== "" && (D(), h.fillStyle = t.set(T).getStyle(), h.fill()), O && O.size) {
      const q = O.size * _ / 2;
      a += q, d += q, _ -= O.size * _, y = Math.max(0, y - q), D(), h.strokeStyle = t.set(O.color).getStyle(), h.lineWidth = O.size * _, h.stroke();
    }
    F && w(
      h,
      a + _ / 2,
      d + (_ + L) / 2,
      F,
      t.set(P).getStyle()
    );
    function D() {
      h.beginPath(), h.moveTo(a + y, d), h.lineTo(a + _ - y, d), h.arcTo(a + _, d, a + _, d + y, y), h.lineTo(a + _, d + _ - y), h.arcTo(a + _, d + _, a + _ - y, d + _, y), h.lineTo(a + y, d + _), h.arcTo(a, d + _, a, d + _ - y, y), h.lineTo(a, d + y), h.arcTo(a, d, a + y, d, y), h.closePath();
    }
  }
  function x(a, d, L) {
    const y = [...a].sort((X, Ft) => {
      var ut, dt;
      return (((ut = X.label) == null ? void 0 : ut.length) || 0) - (((dt = Ft.label) == null ? void 0 : dt.length) || 0);
    }).pop().label, { family: F, weight: O } = L, T = o ? Math.sqrt(Math.pow(d * 0.7, 2) / 2) : d;
    let P = T;
    n.font.size > 0 && (P = n.font.size);
    let D = 0, q = 0;
    do {
      h.font = `${O} ${P}px ${F}`;
      const X = h.measureText(y);
      D = X.width, q = X.fontBoundingBoxDescent, P--;
    } while (D > T && P > 0);
    const pt = T / q, Dt = Math.min(T / D, pt), zt = Math.floor(P * Dt);
    return [`${O} ${zt}px ${F}`, pt];
  }
  function w(a, d, L, _, y) {
    a.font = v, a.textAlign = "center", a.textBaseline = "middle", a.fillStyle = y, a.fillText(_, d, L + (o ? M : 0));
  }
}, j = (n, s, t) => {
  const e = n.clone();
  pe(e, s);
  const { offsetX: o } = e.userData;
  return e.offset.setX((t ? 0.5 : 0) + o), e;
}, pe = (n, s) => {
  const {
    offset: t,
    userData: { offsetY: e, cellHeight: o }
  } = n;
  t.y = 1 - (s + 1) * o + e;
};
function ht(n, s, t = 2, e = 2) {
  const o = t / 2 - n, i = e / 2 - n, r = n / t, c = (t - n) / t, p = n / e, l = (e - n) / e, u = [o, i, 0, -o, i, 0, -o, -i, 0, o, -i, 0], m = [c, l, r, l, r, p, c, p], h = [
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
  let M, f, b, A, E, C, S, x;
  for (let w = 0; w < 4; w++) {
    A = w < 1 || w > 2 ? o : -o, E = w < 2 ? i : -i, C = w < 1 || w > 2 ? c : r, S = w < 2 ? l : p;
    for (let a = 0; a <= s; a++)
      M = Math.PI / 2 * (w + a / s), f = Math.cos(M), b = Math.sin(M), u.push(A + n * f, E + n * b, 0), m.push(C + r * f, S + p * b), a < s && (x = (s + 1) * w + a + 4, v.push(w, x, x + 1));
  }
  return new qt().setIndex(new K(new Uint32Array(v), 1)).setAttribute(
    "position",
    new K(new Float32Array(u), 3)
  ).setAttribute("uv", new K(new Float32Array(m), 2));
}
const ue = (n, s) => {
  const t = new z(), { isSphere: e, radius: o, smoothness: i, type: r } = n, p = r === "rounded-cube" ? 2 - n.edges.radius * 2 : 2, l = ht(o, i, p, p);
  return k.map((u, m) => {
    const h = m < 3, v = k[m], M = j(s, m, !1), f = j(s, m, !0), { enabled: b, scale: A, opacity: E, hover: C } = n[v], S = {
      map: M,
      opacity: E,
      transparent: !0
    }, x = {
      map: f,
      opacity: C.opacity,
      transparent: !0
    }, w = e ? new Z(S) : new G(S), a = e ? new Z(x) : new G(x), d = e ? new lt(w) : new V(l, w), L = h ? v : v[1];
    if (d.position[L] = (h ? 1 : -1) * (e ? Pt : 1), !e) {
      d.lookAt(t.copy(d.position).multiplyScalar(1.7));
      const _ = U.DEFAULT_UP.z === 1, y = U.DEFAULT_UP.x === 1;
      (_ || y) && (v === "z" && _ || v === "x" && y ? d.rotateZ(-Math.PI / 2) : (v === "nz" && _ || v === "nx" && y) && d.rotateZ(Math.PI / 2));
    }
    return d.scale.setScalar(A), d.renderOrder = 1, d.visible = b, d.userData = {
      scale: A,
      opacity: E,
      hover: C,
      kind: "face",
      axes: [k[m]],
      face: Tt[m],
      idleMaterial: w,
      hoverMaterial: a
    }, d;
  });
}, St = k.length, de = (n, s) => {
  const { isSphere: t, corners: e, type: o } = n, i = o === "rounded-cube";
  if (!e.enabled) return [];
  const { color: r, opacity: c, scale: p, radius: l, smoothness: u, hover: m } = e, h = t ? null : i ? new Ct(l, u * 2, u) : ht(l, u), v = i ? 1 - l : 0.85, M = [
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
  ].map((b) => b * v), f = new z();
  return Array(M.length / 3).fill(0).map((b, A) => {
    let E, C;
    if (t) {
      const a = j(s, St, !1), d = j(s, St, !0), L = {
        map: a,
        opacity: c,
        transparent: !0
      }, _ = {
        map: d,
        opacity: m.opacity,
        transparent: !0
      };
      E = new Z(L), C = new Z(_);
    } else
      E = new G({
        transparent: !0,
        opacity: c,
        color: r
      }), C = new G({
        transparent: !0,
        opacity: m.opacity,
        color: m.color ?? r
      });
    const S = t ? new lt(E) : new V(h, E), x = A * 3;
    S.position.set(M[x], M[x + 1], M[x + 2]), t && S.position.normalize().multiplyScalar(1.7), S.scale.setScalar(p), S.lookAt(f.copy(S.position).multiplyScalar(2)), S.renderOrder = 1;
    const w = [
      S.position.x > 0 ? "x" : "nx",
      S.position.y > 0 ? "y" : "ny",
      S.position.z > 0 ? "z" : "nz"
    ];
    return S.userData = {
      color: r,
      opacity: c,
      scale: p,
      hover: m,
      intersectionOrder: 1,
      kind: "corner",
      axes: w,
      idleMaterial: E,
      hoverMaterial: C
    }, S;
  });
}, rt = (n, s, t) => n === 0 ? null : n > 0 ? s : t, me = (n, s, t) => {
  const { isSphere: e, edges: o, type: i } = n, r = i === "rounded-cube";
  if (!o.enabled) return [];
  const { color: c, opacity: p, scale: l, hover: u, radius: m, smoothness: h } = o, v = r ? 2 - m * 2 : 1.2, M = e ? null : r ? new Bt(m, m, v, h * 4) : ht(m, h, v, 0.25), f = r ? 1 - m : 0.925, b = [
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
  ].map((C) => C * f), A = new z(), E = new z(0, 1, 0);
  return Array(b.length / 3).fill(0).map((C, S) => {
    let x, w;
    if (e) {
      const O = j(s, t, !1), T = j(s, t, !0), P = {
        map: O,
        opacity: p,
        transparent: !0
      }, D = {
        map: T,
        opacity: u.opacity,
        transparent: !0
      };
      x = new Z(P), w = new Z(D);
    } else
      x = new G({
        transparent: !0,
        opacity: p,
        color: c
      }), w = new G({
        transparent: !0,
        opacity: u.opacity,
        color: u.color ?? c
      });
    const a = e ? new lt(x) : new V(M, x), d = S * 3;
    a.position.set(b[d], b[d + 1], b[d + 2]), e && a.position.normalize().multiplyScalar(1.7), a.scale.setScalar(l), a.up.copy(E), a.lookAt(A.copy(a.position).multiplyScalar(2)), r ? (!e && !a.position.z && (a.rotation.z = Math.PI), !e && !a.position.x && (a.rotation.x = 0), !e && !a.position.x && (a.rotation.z = Math.PI / 2)) : !e && !a.position.y && (a.rotation.z = Math.PI / 2), a.renderOrder = 1;
    const L = rt(a.position.x, "x", "nx"), _ = rt(a.position.y, "y", "ny"), y = rt(a.position.z, "z", "nz"), F = [L, _, y].filter((O) => O !== null);
    return a.userData = {
      color: c,
      opacity: p,
      scale: l,
      hover: u,
      kind: "edge",
      axes: F,
      idleMaterial: x,
      hoverMaterial: w
    }, a;
  });
}, fe = (n, s) => {
  const {
    isSphere: t,
    background: { enabled: e, color: o, opacity: i, hover: r }
  } = s;
  let c;
  const p = new G({
    color: o,
    side: Zt,
    opacity: i,
    transparent: !0,
    depthWrite: !1
  });
  if (!e) return null;
  if (t)
    c = new V(
      new Ct(1.8, 64, 64),
      p
    );
  else {
    let l;
    n.forEach((u) => {
      const m = u.scale.x;
      u.scale.setScalar(0.9), u.updateMatrix();
      const h = u.geometry.clone();
      h.applyMatrix4(u.matrix), l = l ? Qt([l, h]) : h, u.scale.setScalar(m);
    }), c = new V(l, p);
  }
  return c.userData = {
    color: o,
    opacity: i,
    hover: r
  }, c;
}, _e = (n, s) => {
  const t = new At(), e = [], o = [], { isSphere: i } = n;
  if (k.forEach((l, u) => {
    const { enabled: m, line: h, scale: v, color: M } = n[l];
    if (!m || !h) return;
    const f = u < 3 ? 1 : -1, A = (i ? Pt - v / 2 : 0.975) * f;
    e.push(
      l.includes("x") ? A : 0,
      l.includes("y") ? A : 0,
      l.includes("z") ? A : 0,
      0,
      0,
      0
    );
    const E = t.set(M).toArray();
    o.push(...E, ...E);
  }), !e.length) return null;
  const r = new Kt().setPositions(e).setColors(o);
  if (s.isWebGPURenderer === !0) {
    const l = new Nt({
      linewidth: n.lineWidth,
      vertexColors: !0,
      worldUnits: !1
    });
    return new Jt(r, l).computeLineDistances();
  }
  const p = new te({
    linewidth: n.lineWidth,
    vertexColors: !0,
    resolution: new J(window.innerWidth, window.innerHeight)
  });
  return new Yt(r, p).computeLineDistances();
}, ge = (n, s) => {
  const { corners: t, edges: e } = n, o = [], i = he(n), r = ue(n, i);
  o.push(...r), t.enabled && o.push(...de(n, i)), e.enabled && o.push(...me(n, i, t.enabled ? 7 : 6));
  const c = fe(r, n), p = _e(n, s);
  return [o, c, p];
}, $ = (n, s = !0) => {
  const { userData: t } = n, { idleMaterial: e, hoverMaterial: o } = t;
  n.scale.setScalar((s ? t.hover : t).scale), n.material = s ? o : e;
}, { clamp: ye } = xt, ve = /* @__PURE__ */ new z();
function B(n) {
  if (!n) return { kind: null, axes: null, face: null, direction: null };
  const s = n.userData;
  return {
    kind: s.kind ?? null,
    axes: s.axes ?? null,
    face: s.face ?? null,
    direction: ve.copy(n.position).normalize().clone()
  };
}
const Q = /* @__PURE__ */ new Xt(), Mt = /* @__PURE__ */ new Wt(), be = /* @__PURE__ */ new J(), I = /* @__PURE__ */ new z(), Et = /* @__PURE__ */ new Vt(), N = /* @__PURE__ */ new H().setFromAxisAngle(new z(0, 0, 1), Math.PI / 2), Y = /* @__PURE__ */ new H().setFromAxisAngle(new z(0, 0, 1), -Math.PI / 2);
class Le extends U {
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
    g(this, "enabled", !0);
    /** The camera being controlled by this gizmo */
    g(this, "camera");
    /** The WebGLRenderer rendering the gizmo */
    g(this, "renderer");
    /** The configuration options */
    g(this, "options");
    /** The point around which the camera rotates */
    g(this, "target", new z());
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
    this.camera = t, this.renderer = e, this._scene = new jt().add(this), this.set(o);
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
    this._placement = Ot(this._domElement, t), this.domUpdate();
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
    const [e, o, i] = ge(this._options, this.renderer);
    o && this.add(o), i && this.add(i), this.add(...e), this._background = o, this._intersections = e;
    const { container: r, animated: c, speed: p } = this._options;
    return this.animated = c, this.speed = p, this._container = r ? ne(r) : document.body, this._domElement = ee(this._options), this._domElement.onpointerdown = (l) => this._onPointerDown(l), this._domElement.onpointermove = (l) => this._onPointerMove(l), this._domElement.onpointerleave = () => this._onPointerLeave(), this._container.appendChild(this._domElement), this._controls && this.attachControls(this._controls), this.update(), this;
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
    const { renderer: t, _viewport: e } = this, o = t.getScissorTest(), i = t.autoClear, r = t.autoClearColor, c = t.autoClearDepth, p = t.autoClearStencil;
    return t.autoClear = !0, t.autoClearColor = !1, t.autoClearDepth = !0, t.autoClearStencil = !1, t.setViewport(...e), o && t.setScissor(...e), t.render(this._scene, this._camera), t.setViewport(...this._originalViewport), o && t.setScissor(...this._originalScissor), t.autoClear = i, t.autoClearColor = r, t.autoClearDepth = c, t.autoClearStencil = p, this;
  }
  /**
   * Updates the gizmo's DOM-related properties based on its current position
   * and size in the document.
   *
   * @returns The gizmo instance for method chaining
   */
  domUpdate() {
    this._domRect = this._domElement.getBoundingClientRect();
    const t = this.renderer, e = this._domRect, o = t.domElement.getBoundingClientRect(), i = t.isWebGPURenderer === !0, r = e.top - o.top, c = i ? r : t.domElement.clientHeight - (r + e.height);
    return this._viewport.splice(
      0,
      4,
      e.left - o.left,
      c,
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
      return this.target = new z().copy(this._controls.target), this.removeEventListener("start", this._controlsListeners.start), this.removeEventListener("end", this._controlsListeners.end), this._controls.removeEventListener(
        "change",
        this._controlsListeners.change
      ), this._controlsListeners = void 0, this._controls = void 0, this;
  }
  /** Cleans up all resources including geometries, materials, textures, and event listeners. */
  dispose() {
    var t;
    this.detachControls(), this.children.forEach((e) => {
      var r, c, p, l, u;
      this.remove(e);
      const o = e.userData;
      if (o.idleMaterial && o.hoverMaterial)
        (r = o.idleMaterial.map) == null || r.dispose(), o.idleMaterial.dispose(), o.hoverMaterial !== o.idleMaterial && ((c = o.hoverMaterial.map) == null || c.dispose(), o.hoverMaterial.dispose());
      else {
        const m = e, { material: h } = m;
        if (Array.isArray(h))
          for (const v of h) {
            const M = v;
            (p = M.map) == null || p.dispose(), M.dispose();
          }
        else if (h && typeof h == "object" && "dispose" in h) {
          const v = h;
          (l = v.map) == null || l.dispose(), v.dispose();
        }
      }
      (u = e.geometry) == null || u.dispose();
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
    const o = performance.now() / 1e3, i = this._lastAnimateTimeSeconds === null ? 0 : o - this._lastAnimateTimeSeconds;
    this._lastAnimateTimeSeconds = o;
    const r = i * ie * this.speed;
    if (this._quaternionStart.rotateTowards(this._quaternionEnd, r), t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target), e.rotateTowards(this._targetQuaternion, r), this._updateOrientation(), requestAnimationFrame(
      () => this.dispatchEvent({ type: "change", ...B(null) })
    ), this._quaternionStart.angleTo(this._quaternionEnd) < W) {
      if (this._controls) {
        const c = this.camera.position.clone().sub(this.target).normalize();
        U.DEFAULT_UP.z === 1 && Math.abs(c.z) > 0.99 ? this.camera.position.set(0, -1e-6, this.camera.position.z) : U.DEFAULT_UP.x === 1 && Math.abs(c.x) > 0.99 && this.camera.position.set(this.camera.position.x, W, 0), this._controls.update(), this._controls.enabled = !0;
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
    const e = this.camera, o = this.target;
    if (I.copy(t).multiplyScalar(this._distance), Q.setPosition(I).lookAt(I, this.position, this.up), this._targetQuaternion.setFromRotationMatrix(Q), I.add(o), Q.lookAt(I, o, this.up), this._quaternionEnd.setFromRotationMatrix(Q), this._quaternionStart.copy(e.quaternion), U.DEFAULT_UP.z === 1 && Math.abs(t.z) > 0.99) {
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
    const e = (l) => {
      if (!this._dragging) {
        if (se(l, this._pointerStart)) return;
        this._dragging = !0;
      }
      const u = be.set(l.clientX, l.clientY).sub(this._pointerStart).multiplyScalar(1 / this._domRect.width * Math.PI), m = this.coordinateConversion(
        I.subVectors(this.camera.position, this.target)
      ), h = Mt.setFromVector3(m);
      h.theta = c - u.x, h.phi = ye(
        p - u.y,
        W,
        Math.PI - W
      ), this.coordinateConversion(
        this.camera.position.setFromSpherical(h),
        !0
      ).add(this.target), this.camera.lookAt(this.target), this.quaternion.copy(this.camera.quaternion).invert(), this._updateOrientation(!1), this.dispatchEvent({ type: "change", ...B(null) });
    }, o = () => {
      if (document.removeEventListener("pointermove", e, !1), document.removeEventListener("pointerup", o, !1), !this._dragging) return this._handleClick(t);
      this._focus && ($(this._focus, !1), this._focus = null), this._dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating) return;
    t.preventDefault(), this._pointerStart.set(t.clientX, t.clientY);
    const i = this.coordinateConversion(
      I.subVectors(this.camera.position, this.target)
    ), r = Mt.setFromVector3(i), c = r.theta, p = r.phi;
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
    const { x: o, y: i, z: r } = t, c = U.DEFAULT_UP;
    return c.x === 1 ? e ? t.set(i, r, o) : t.set(r, o, i) : c.z === 1 ? e ? t.set(r, o, i) : t.set(i, r, o) : t;
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
    ), o = (e == null ? void 0 : e.object) || null;
    this._focus !== o && (this._domElement.style.cursor = o ? "pointer" : "", this._focus && $(this._focus, !1), (this._focus = o) ? $(o, !0) : gt(this._options, this._intersections, this.camera), this.dispatchEvent({ type: "hoverchange", object: o, ...B(o) }));
  }
}
export {
  Le as ViewportGizmo
};
//# sourceMappingURL=three-viewport-gizmo.js.map
