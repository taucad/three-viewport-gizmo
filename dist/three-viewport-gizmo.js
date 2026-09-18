var Rt = Object.defineProperty;
var It = (e, s, t) => s in e ? Rt(e, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[s] = t;
var g = (e, s, t) => It(e, typeof s != "symbol" ? s + "" : s, t);
import { MathUtils as Et, Vector3 as k, Vector2 as H, Raycaster as Ft, Object3D as nt, Color as xt, CanvasTexture as Ut, RepeatWrapping as ht, SRGBColorSpace as Gt, BufferGeometry as qt, BufferAttribute as X, SpriteMaterial as q, MeshBasicMaterial as U, Sprite as it, Mesh as $, SphereGeometry as Ct, CylinderGeometry as Bt, BackSide as Zt, Quaternion as pt, Scene as jt, OrthographicCamera as $t, PerspectiveCamera as Vt, Vector4 as Ht, Matrix4 as Xt, Spherical as Wt } from "three";
import { mergeGeometries as Nt } from "three/addons/utils/BufferGeometryUtils.js";
import { Line2NodeMaterial as Yt } from "three/webgpu";
import { Line2 as Jt } from "three/addons/lines/Line2.js";
import { Line2 as Qt } from "three/addons/lines/webgpu/Line2.js";
import { LineGeometry as Kt } from "three/addons/lines/LineGeometry.js";
import { LineMaterial as te } from "three/addons/lines/LineMaterial.js";
const At = (e, s) => {
  const [t, n] = s.split("-");
  return Object.assign(e.style, {
    left: n === "left" ? "0" : n === "center" ? "50%" : "",
    right: n === "right" ? "0" : "",
    top: t === "top" ? "0" : t === "bottom" ? "" : "50%",
    bottom: t === "bottom" ? "0" : "",
    transform: `${n === "center" ? "translateX(-50%)" : ""} ${t === "center" ? "translateY(-50%)" : ""}`
  }), s;
}, ee = ({
  placement: e,
  size: s,
  offset: t,
  id: n,
  className: o
}) => {
  const i = document.createElement("div"), { top: r, left: c, right: p, bottom: l } = t;
  return Object.assign(i.style, {
    id: n,
    position: "absolute",
    zIndex: "1000",
    height: `${s}px`,
    width: `${s}px`,
    margin: `${r}px ${p}px ${l}px ${c}px`,
    borderRadius: "100%"
  }), At(i, e), n && (i.id = n), o && (i.className = o), i;
}, ne = (e) => {
  const s = typeof e == "string" ? document.querySelector(e) : e;
  if (!s) throw Error("Invalid DOM element");
  return s;
}, { clamp: ot } = Et, oe = [
  ["x", 0, 3],
  ["y", 1, 4],
  ["z", 2, 5]
], ut = /* @__PURE__ */ new k();
function dt(e, s) {
  const { idleMaterial: t, hoverMaterial: n, hover: o, opacity: i } = e.userData;
  if (!t || !n) {
    e.material.opacity = s;
    return;
  }
  t.opacity = s;
  const r = i > 0 ? i : 1, c = ot(
    s * (o.opacity / r),
    0,
    1
  );
  n.opacity = c;
}
function ft({ isSphere: e }, s, t) {
  e && (ut.set(0, 0, 1).applyQuaternion(t.quaternion), oe.forEach(([n, o, i]) => {
    const r = ut[n];
    let c = s[o], p = c.userData.opacity;
    dt(
      c,
      ot(r >= 0 ? p : p / 2, 0, 1)
    ), c = s[i], p = c.userData.opacity, dt(
      c,
      ot(r >= 0 ? p / 2 : p, 0, 1)
    );
  }));
}
const se = (e, s, t = 10) => Math.abs(e.clientX - s.x) < t && Math.abs(e.clientY - s.y) < t, mt = /* @__PURE__ */ new Ft(), _t = /* @__PURE__ */ new H(), yt = (e, s, t, n) => {
  _t.set(
    (e.clientX - s.left) / s.width * 2 - 1,
    -((e.clientY - s.top) / s.height) * 2 + 1
  ), mt.setFromCamera(_t, t);
  const o = mt.intersectObjects(
    n,
    !1
  );
  if (o.length > 0) {
    o.sort((l, u) => l.distance - u.distance);
    const r = 0.2, c = o[0].distance, p = o.filter(
      (l) => l.distance <= c + r
    );
    p.length > 1 && (p.sort((l, u) => {
      const f = l.object.userData.intersectionOrder ?? 0;
      return (u.object.userData.intersectionOrder ?? 0) - f;
    }), o.splice(0, p.length, ...p));
  }
  const i = o.length ? o[0] : null;
  return !i || !i.object.visible ? null : i;
}, W = 1e-6, gt = 1e-4, ie = 2 * Math.PI, Ot = ["x", "y", "z"], R = [...Ot, "nx", "ny", "nz"], re = ["x", "z", "y", "nx", "nz", "ny"], ae = ["z", "x", "y", "nz", "nx", "ny"], N = "Right", Y = "Top", J = "Front", Q = "Left", K = "Bottom", tt = "Back", Lt = [
  "right",
  "top",
  "front",
  "left",
  "bottom",
  "back"
], Tt = 1.3, vt = (e, s = !0) => {
  const { material: t, userData: n } = e, { color: o, opacity: i } = s ? n.hover : n;
  t.color.set(o), t.opacity = i;
}, I = (e) => JSON.parse(JSON.stringify(e)), ce = {
  yUp: {
    x: N,
    y: Y,
    z: J,
    nx: Q,
    ny: K,
    nz: tt
  },
  zUp: {
    x: N,
    y: tt,
    z: Y,
    nx: Q,
    ny: J,
    nz: K
  },
  xUp: {
    x: Y,
    y: J,
    z: N,
    nx: K,
    ny: tt,
    nz: Q
  }
}, le = (e) => {
  const s = e.type || "sphere", t = s === "sphere", n = s === "rounded-cube", o = e.resolution || t ? 64 : 128, i = e.up ?? Dt(nt.DEFAULT_UP), r = i === "z", c = i === "x", l = ce[r ? "zUp" : c ? "xUp" : "yUp"], { container: u } = e;
  e.container = void 0, e = JSON.parse(JSON.stringify(e)), e.container = u;
  const f = r ? re : c ? ae : R;
  Lt.forEach((m, b) => {
    e[m] && (e[f[b]] = e[m]);
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
    up: i,
    container: document.body,
    size: 128,
    placement: "top-right",
    resolution: o,
    lineWidth: 4,
    radius: t ? 1 : n ? 0.3 : 0.2,
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
      color: t ? 15915362 : n ? 15658734 : 16777215,
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
      ...I(h),
      ...t ? { label: "X", color: 16725587, line: !0 } : { label: l.x }
    },
    y: {
      ...I(h),
      ...t ? { label: "Y", color: 9100032, line: !0 } : { label: l.y }
    },
    z: {
      ...I(h),
      ...t ? { label: "Z", color: 2920447, line: !0 } : { label: l.z }
    },
    nx: {
      ...I(v),
      label: t ? "" : l.nx
    },
    ny: {
      ...I(v),
      label: t ? "" : l.ny
    },
    nz: {
      ...I(v),
      label: t ? "" : l.nz
    }
  };
  if (st(e, M), n) {
    const m = e;
    m.edges.radius = m.radius, m.edges.scale = 1, m.edges.opacity = 1, m.edges.hover.scale = 1, m.edges.hover.opacity = 1, m.corners.radius = m.radius, m.corners.scale = 1, m.corners.opacity = 1, m.corners.hover.scale = 1, m.corners.hover.opacity = 1, m.radius = 0, R.forEach((b) => {
      m[b].scale = 1, m[b].opacity = 1, m[b].hover.scale = 1, m[b].hover.opacity = 1;
    });
  }
  return Ot.forEach(
    (m) => st(
      e[`n${m}`],
      I(e[m])
    )
  ), { ...e, isSphere: t };
}, Dt = (e) => e.z === 1 ? "z" : e.x === 1 ? "x" : "y";
function st(e, ...s) {
  if (e instanceof HTMLElement || typeof e != "object" || e === null)
    return e;
  for (const t of s)
    for (const n in t)
      n !== "container" && n in t && (e[n] === void 0 ? e[n] = t[n] : typeof t[n] == "object" && !Array.isArray(t[n]) && (e[n] = st(
        e[n] || {},
        t[n]
      )));
  return e;
}
const he = (e, s = 2) => {
  const t = new xt(), n = s * 2, { isSphere: o, resolution: i, radius: r, font: c, corners: p, edges: l } = e, u = R.map((a) => ({ ...e[a], radius: r }));
  o && p.enabled && u.push(p), o && l.enabled && u.push(l);
  const f = document.createElement("canvas"), h = f.getContext("2d");
  f.width = i * 2 + n * 2, f.height = i * u.length + n * u.length;
  const [v, M] = x(u, i, c);
  u.forEach(
    ({
      radius: a,
      label: d,
      color: L,
      labelColor: _,
      border: y,
      hover: {
        color: z,
        labelColor: O,
        border: T
      }
    }, D) => {
      const P = i * D + D * n + s;
      S(
        s,
        P,
        s,
        i,
        a,
        d,
        y,
        L,
        _
      ), S(
        i + s * 3,
        P,
        s,
        i,
        a,
        d,
        T ?? y,
        z ?? L,
        O ?? _
      );
    }
  );
  const m = u.length, b = s / (i * 2), C = s / (i * 6), E = 1 / m, A = new Ut(f);
  return A.repeat.set(0.5 - 2 * b, E - 2 * C), A.offset.set(b, 1 - C), Object.assign(A, {
    colorSpace: Gt,
    wrapS: ht,
    wrapT: ht,
    userData: {
      offsetX: b,
      offsetY: C,
      cellHeight: E
    }
  }), A;
  function S(a, d, L, _, y, z, O, T, D) {
    if (y = y * (_ / 2), T != null && T !== "" && (P(), h.fillStyle = t.set(T).getStyle(), h.fill()), O && O.size) {
      const G = O.size * _ / 2;
      a += G, d += G, _ -= O.size * _, y = Math.max(0, y - G), P(), h.strokeStyle = t.set(O.color).getStyle(), h.lineWidth = O.size * _, h.stroke();
    }
    z && w(
      h,
      a + _ / 2,
      d + (_ + L) / 2,
      z,
      t.set(D).getStyle()
    );
    function P() {
      h.beginPath(), h.moveTo(a + y, d), h.lineTo(a + _ - y, d), h.arcTo(a + _, d, a + _, d + y, y), h.lineTo(a + _, d + _ - y), h.arcTo(a + _, d + _, a + _ - y, d + _, y), h.lineTo(a + y, d + _), h.arcTo(a, d + _, a, d + _ - y, y), h.lineTo(a, d + y), h.arcTo(a, d, a + y, d, y), h.closePath();
    }
  }
  function x(a, d, L) {
    const y = [...a].sort((V, kt) => {
      var ct, lt;
      return (((ct = V.label) == null ? void 0 : ct.length) || 0) - (((lt = kt.label) == null ? void 0 : lt.length) || 0);
    }).pop().label, { family: z, weight: O } = L, T = o ? Math.sqrt(Math.pow(d * 0.7, 2) / 2) : d;
    let D = T;
    e.font.size > 0 && (D = e.font.size);
    let P = 0, G = 0;
    do {
      h.font = `${O} ${D}px ${z}`;
      const V = h.measureText(y);
      P = V.width, G = V.fontBoundingBoxDescent, D--;
    } while (P > T && D > 0);
    const at = T / G, Pt = Math.min(T / P, at), zt = Math.floor(D * Pt);
    return [`${O} ${zt}px ${z}`, at];
  }
  function w(a, d, L, _, y) {
    a.font = v, a.textAlign = "center", a.textBaseline = "middle", a.fillStyle = y, a.fillText(_, d, L + (o ? M : 0));
  }
}, B = (e, s, t) => {
  const n = e.clone();
  pe(n, s);
  const { offsetX: o } = n.userData;
  return n.offset.setX((t ? 0.5 : 0) + o), n;
}, pe = (e, s) => {
  const {
    offset: t,
    userData: { offsetY: n, cellHeight: o }
  } = e;
  t.y = 1 - (s + 1) * o + n;
};
function rt(e, s, t = 2, n = 2) {
  const o = t / 2 - e, i = n / 2 - e, r = e / t, c = (t - e) / t, p = e / n, l = (n - e) / n, u = [o, i, 0, -o, i, 0, -o, -i, 0, o, -i, 0], f = [c, l, r, l, r, p, c, p], h = [
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
  let M, m, b, C, E, A, S, x;
  for (let w = 0; w < 4; w++) {
    C = w < 1 || w > 2 ? o : -o, E = w < 2 ? i : -i, A = w < 1 || w > 2 ? c : r, S = w < 2 ? l : p;
    for (let a = 0; a <= s; a++)
      M = Math.PI / 2 * (w + a / s), m = Math.cos(M), b = Math.sin(M), u.push(C + e * m, E + e * b, 0), f.push(A + r * m, S + p * b), a < s && (x = (s + 1) * w + a + 4, v.push(w, x, x + 1));
  }
  return new qt().setIndex(new X(new Uint32Array(v), 1)).setAttribute(
    "position",
    new X(new Float32Array(u), 3)
  ).setAttribute("uv", new X(new Float32Array(f), 2));
}
const ue = (e, s) => {
  const t = new k(), { isSphere: n, radius: o, smoothness: i, type: r } = e, p = r === "rounded-cube" ? 2 - e.edges.radius * 2 : 2, l = rt(o, i, p, p);
  return R.map((u, f) => {
    const h = f < 3, v = R[f], M = B(s, f, !1), m = B(s, f, !0), { enabled: b, scale: C, opacity: E, hover: A } = e[v], S = {
      map: M,
      opacity: E,
      transparent: !0
    }, x = {
      map: m,
      opacity: A.opacity,
      transparent: !0
    }, w = n ? new q(S) : new U(S), a = n ? new q(x) : new U(x), d = n ? new it(w) : new $(l, w), L = h ? v : v[1];
    if (d.position[L] = (h ? 1 : -1) * (n ? Tt : 1), !n) {
      d.up.set(0, 0, 0)[e.up] = 1, d.lookAt(t.copy(d.position).multiplyScalar(1.7));
      const _ = e.up === "z", y = e.up === "x";
      (_ || y) && (v === "z" && _ || v === "x" && y ? d.rotateZ(-Math.PI / 2) : (v === "nz" && _ || v === "nx" && y) && d.rotateZ(Math.PI / 2));
    }
    return d.scale.setScalar(C), d.renderOrder = 1, d.visible = b, d.userData = {
      scale: C,
      opacity: E,
      hover: A,
      kind: "face",
      axes: [R[f]],
      face: Lt[f],
      idleMaterial: w,
      hoverMaterial: a
    }, d;
  });
}, bt = R.length, de = (e, s) => {
  const { isSphere: t, corners: n, type: o } = e, i = o === "rounded-cube";
  if (!n.enabled) return [];
  const { color: r, opacity: c, scale: p, radius: l, smoothness: u, hover: f } = n, h = t ? null : i ? new Ct(l, u * 2, u) : rt(l, u), v = i ? 1 - l : 0.85, M = [
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
  ].map((b) => b * v), m = new k();
  return Array(M.length / 3).fill(0).map((b, C) => {
    let E, A;
    if (t) {
      const a = B(s, bt, !1), d = B(s, bt, !0), L = {
        map: a,
        opacity: c,
        transparent: !0
      }, _ = {
        map: d,
        opacity: f.opacity,
        transparent: !0
      };
      E = new q(L), A = new q(_);
    } else
      E = new U({
        transparent: !0,
        opacity: c,
        color: r
      }), A = new U({
        transparent: !0,
        opacity: f.opacity,
        color: f.color ?? r
      });
    const S = t ? new it(E) : new $(h, E), x = C * 3;
    S.position.set(M[x], M[x + 1], M[x + 2]), t && S.position.normalize().multiplyScalar(1.7), S.scale.setScalar(p), S.up.set(0, 0, 0)[e.up] = 1, S.lookAt(m.copy(S.position).multiplyScalar(2)), S.renderOrder = 1;
    const w = [
      S.position.x > 0 ? "x" : "nx",
      S.position.y > 0 ? "y" : "ny",
      S.position.z > 0 ? "z" : "nz"
    ];
    return S.userData = {
      color: r,
      opacity: c,
      scale: p,
      hover: f,
      intersectionOrder: 1,
      kind: "corner",
      axes: w,
      idleMaterial: E,
      hoverMaterial: A
    }, S;
  });
}, et = (e, s, t) => e === 0 ? null : e > 0 ? s : t, fe = (e, s, t) => {
  const { isSphere: n, edges: o, type: i } = e, r = i === "rounded-cube";
  if (!o.enabled) return [];
  const { color: c, opacity: p, scale: l, hover: u, radius: f, smoothness: h } = o, v = r ? 2 - f * 2 : 1.2, M = n ? null : r ? new Bt(f, f, v, h * 4) : rt(f, h, v, 0.25), m = r ? 1 - f : 0.925, b = [
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
  ].map((A) => A * m), C = new k(), E = new k(0, 1, 0);
  return Array(b.length / 3).fill(0).map((A, S) => {
    let x, w;
    if (n) {
      const O = B(s, t, !1), T = B(s, t, !0), D = {
        map: O,
        opacity: p,
        transparent: !0
      }, P = {
        map: T,
        opacity: u.opacity,
        transparent: !0
      };
      x = new q(D), w = new q(P);
    } else
      x = new U({
        transparent: !0,
        opacity: p,
        color: c
      }), w = new U({
        transparent: !0,
        opacity: u.opacity,
        color: u.color ?? c
      });
    const a = n ? new it(x) : new $(M, x), d = S * 3;
    a.position.set(b[d], b[d + 1], b[d + 2]), n && a.position.normalize().multiplyScalar(1.7), a.scale.setScalar(l), a.up.copy(E), a.lookAt(C.copy(a.position).multiplyScalar(2)), r ? (!n && !a.position.z && (a.rotation.z = Math.PI), !n && !a.position.x && (a.rotation.x = 0), !n && !a.position.x && (a.rotation.z = Math.PI / 2)) : !n && !a.position.y && (a.rotation.z = Math.PI / 2), a.renderOrder = 1;
    const L = et(a.position.x, "x", "nx"), _ = et(a.position.y, "y", "ny"), y = et(a.position.z, "z", "nz"), z = [L, _, y].filter((O) => O !== null);
    return a.userData = {
      color: c,
      opacity: p,
      scale: l,
      hover: u,
      kind: "edge",
      axes: z,
      idleMaterial: x,
      hoverMaterial: w
    }, a;
  });
}, me = (e, s) => {
  const {
    isSphere: t,
    background: { enabled: n, color: o, opacity: i, hover: r }
  } = s;
  let c;
  const p = new U({
    color: o,
    side: Zt,
    opacity: i,
    transparent: !0,
    depthWrite: !1
  });
  if (!n) return null;
  if (t)
    c = new $(
      new Ct(1.8, 64, 64),
      p
    );
  else {
    let l;
    e.forEach((u) => {
      const f = u.scale.x;
      u.scale.setScalar(0.9), u.updateMatrix();
      const h = u.geometry.clone();
      h.applyMatrix4(u.matrix), l = l ? Nt([l, h]) : h, u.scale.setScalar(f);
    }), c = new $(l, p);
  }
  return c.userData = {
    color: o,
    opacity: i,
    hover: r
  }, c;
}, _e = (e, s) => {
  const t = new xt(), n = [], o = [], { isSphere: i } = e;
  if (R.forEach((l, u) => {
    const { enabled: f, line: h, scale: v, color: M } = e[l];
    if (!f || !h) return;
    const m = u < 3 ? 1 : -1, C = (i ? Tt - v / 2 : 0.975) * m;
    n.push(
      l.includes("x") ? C : 0,
      l.includes("y") ? C : 0,
      l.includes("z") ? C : 0,
      0,
      0,
      0
    );
    const E = t.set(M).toArray();
    o.push(...E, ...E);
  }), !n.length) return null;
  const r = new Kt().setPositions(n).setColors(o);
  if (s.isWebGPURenderer === !0) {
    const l = new Yt({
      linewidth: e.lineWidth,
      vertexColors: !0,
      worldUnits: !1
    });
    return new Qt(r, l).computeLineDistances();
  }
  const p = new te({
    linewidth: e.lineWidth,
    vertexColors: !0,
    resolution: new H(window.innerWidth, window.innerHeight)
  });
  return new Jt(r, p).computeLineDistances();
}, ye = (e, s) => {
  const { corners: t, edges: n } = e, o = [], i = he(e), r = ue(e, i);
  o.push(...r), t.enabled && o.push(...de(e, i)), n.enabled && o.push(...fe(e, i, t.enabled ? 7 : 6));
  const c = me(r, e), p = _e(e, s);
  return [o, c, p];
}, Z = (e, s = !0) => {
  const { userData: t } = e, { idleMaterial: n, hoverMaterial: o } = t;
  e.scale.setScalar((s ? t.hover : t).scale), e.material = s ? o : n;
}, { clamp: ge } = Et, ve = /* @__PURE__ */ new k();
function j(e) {
  if (!e) return { kind: null, axes: null, face: null, direction: null };
  const s = e.userData;
  return {
    kind: s.kind ?? null,
    axes: s.axes ?? null,
    face: s.face ?? null,
    direction: ve.copy(e.position).normalize().clone()
  };
}
const wt = /* @__PURE__ */ new Xt(), St = /* @__PURE__ */ new Wt(), be = /* @__PURE__ */ new H(), F = /* @__PURE__ */ new k(), Mt = /* @__PURE__ */ new Ht();
class Le extends nt {
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
  constructor(t, n, o = {}) {
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
    g(this, "target", new k());
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
    g(this, "_quaternionStart", new pt());
    g(this, "_quaternionEnd", new pt());
    g(this, "_pointerStart", new H());
    g(this, "_focus", null);
    g(this, "_placement");
    g(this, "_controls");
    g(this, "_controlsListeners");
    this.camera = t, this.renderer = n, this._scene = new jt().add(this), this.set(o);
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
    this._placement = At(this._domElement, t), this.domUpdate();
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
    const n = this._controls;
    this.dispose(), this.options = t, this._options = le(t), this.up.set(0, 0, 0)[this._options.up] = 1, this._camera = this._options.isSphere ? new $t(-1.8, 1.8, 1.8, -1.8, 5, 10) : new Vt(26, 1, 5, 10), this._camera.position.set(0, 0, 7);
    const [o, i, r] = ye(this._options, this.renderer);
    i && this.add(i), r && this.add(r), this.add(...o), this._background = i, this._intersections = o;
    const { container: c, animated: p, speed: l } = this._options;
    return this.animated = p, this.speed = l, this._container = c ? ne(c) : document.body, this._domElement = ee(this._options), this._domElement.onpointerdown = (u) => this._onPointerDown(u), this._domElement.onpointermove = (u) => this._onPointerMove(u), this._domElement.onpointerleave = () => this._onPointerLeave(), this._container.appendChild(this._domElement), n && this.attachControls(n), this.update(), this;
  }
  /**
   * Keeps a gizmo built without an explicit `up` option on the process-wide
   * `Object3D.DEFAULT_UP`: when that global moves to another axis, the gizmo
   * regenerates through {@link set} so faces, drags and clicks follow it.
   *
   * @private
   * @returns Whether the gizmo was regenerated
   */
  _syncDefaultUp() {
    return this.options.up !== void 0 || Dt(nt.DEFAULT_UP) === this._options.up ? !1 : (this.set(this.options), !0);
  }
  /**
   * Renders the gizmo to the screen.
   * This method handles viewport and scissor management to ensure the gizmo
   * renders correctly without affecting the main scene rendering.
   *
   * @returns The gizmo instance for method chaining
   */
  render() {
    this._syncDefaultUp(), this.animating && this._animate();
    const { renderer: t, _viewport: n } = this, o = t.getScissorTest(), i = t.autoClear, r = t.autoClearColor, c = t.autoClearDepth, p = t.autoClearStencil;
    return t.autoClear = !0, t.autoClearColor = !1, t.autoClearDepth = !0, t.autoClearStencil = !1, t.setViewport(...n), o && t.setScissor(...n), t.render(this._scene, this._camera), t.setViewport(...this._originalViewport), o && t.setScissor(...this._originalScissor), t.autoClear = i, t.autoClearColor = r, t.autoClearDepth = c, t.autoClearStencil = p, this;
  }
  /**
   * Updates the gizmo's DOM-related properties based on its current position
   * and size in the document.
   *
   * @returns The gizmo instance for method chaining
   */
  domUpdate() {
    this._domRect = this._domElement.getBoundingClientRect();
    const t = this.renderer, n = this._domRect, o = t.domElement.getBoundingClientRect(), i = t.isWebGPURenderer === !0, r = n.top - o.top, c = i ? r : t.domElement.clientHeight - (r + n.height);
    return this._viewport.splice(
      0,
      4,
      n.left - o.left,
      c,
      n.width,
      n.height
    ), t.getViewport(Mt).toArray(this._originalViewport), t.getScissorTest() && t.getScissor(Mt).toArray(this._originalScissor), this;
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
    return this._syncDefaultUp() ? this : (t && this._controls && this._controls.update(), this.domUpdate().cameraUpdate());
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
      return this.target = new k().copy(this._controls.target), this.removeEventListener("start", this._controlsListeners.start), this.removeEventListener("end", this._controlsListeners.end), this._controls.removeEventListener(
        "change",
        this._controlsListeners.change
      ), this._controlsListeners = void 0, this._controls = void 0, this;
  }
  /** Cleans up all resources including geometries, materials, textures, and event listeners. */
  dispose() {
    var t;
    this.detachControls(), this.children.forEach((n) => {
      var r, c, p, l, u;
      this.remove(n);
      const o = n.userData;
      if (o.idleMaterial && o.hoverMaterial)
        (r = o.idleMaterial.map) == null || r.dispose(), o.idleMaterial.dispose(), o.hoverMaterial !== o.idleMaterial && ((c = o.hoverMaterial.map) == null || c.dispose(), o.hoverMaterial.dispose());
      else {
        const f = n, { material: h } = f;
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
      (u = n.geometry) == null || u.dispose();
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
    var n;
    let t = !this.animated;
    if (this.animated) {
      this._controls && (this._controls.enabled = !1);
      const o = performance.now() / 1e3, i = this._lastAnimateTimeSeconds === null ? 0 : o - this._lastAnimateTimeSeconds;
      this._lastAnimateTimeSeconds = o;
      const r = i * ie * this.speed;
      this._quaternionStart.rotateTowards(this._quaternionEnd, r), t = this._quaternionStart.angleTo(this._quaternionEnd) < W;
    }
    t && this._quaternionStart.copy(this._quaternionEnd), this.camera.position.set(0, 0, 1).applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target), this.camera.quaternion.copy(this._quaternionStart), this._updateOrientation(), this.dispatchEvent({ type: "change", ...j(null) }), t && ((n = this._controls) == null || n.update(), this.animating = !1, this._lastAnimateTimeSeconds = null, this.dispatchEvent({ type: "end" }));
  }
  /**
   * Sets the camera orientation to look at the target from a specific axis.
   *
   * @private
   * @param position - The axis point position
   */
  _setOrientation(t) {
    const n = this.camera, o = this.target;
    F.copy(t);
    const { up: i } = this._options;
    i === "z" && Math.abs(t.z) > 0.99 ? F.y = -gt : i === "x" && Math.abs(t.x) > 0.99 && (F.y = gt), F.normalize().multiplyScalar(this._distance).add(o), wt.lookAt(F, o, this.up), this._quaternionEnd.setFromRotationMatrix(wt), this._quaternionStart.copy(n.quaternion), this.animating = !0, this._lastAnimateTimeSeconds = null;
  }
  /**
   * Handles the pointer down event for starting drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerDown(t) {
    if (!this.enabled) return;
    const n = (l) => {
      if (!this._dragging) {
        if (se(l, this._pointerStart)) return;
        this._dragging = !0;
      }
      const u = be.set(l.clientX, l.clientY).sub(this._pointerStart).multiplyScalar(1 / this._domRect.width * Math.PI), f = this.coordinateConversion(
        F.subVectors(this.camera.position, this.target)
      ), h = St.setFromVector3(f);
      h.theta = c - u.x, h.phi = ge(
        p - u.y,
        W,
        Math.PI - W
      ), this.coordinateConversion(
        this.camera.position.setFromSpherical(h),
        !0
      ).add(this.target), this.camera.lookAt(this.target), this.quaternion.copy(this.camera.quaternion).invert(), this._updateOrientation(!1), this.dispatchEvent({ type: "change", ...j(null) });
    }, o = () => {
      if (document.removeEventListener("pointermove", n, !1), document.removeEventListener("pointerup", o, !1), !this._dragging) return this._handleClick(t);
      this._focus && (Z(this._focus, !1), this._focus = null), this._dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating) return;
    t.preventDefault(), this._pointerStart.set(t.clientX, t.clientY);
    const i = this.coordinateConversion(
      F.subVectors(this.camera.position, this.target)
    ), r = St.setFromVector3(i), c = r.theta, p = r.phi;
    this._distance = r.radius, document.addEventListener("pointermove", n, !1), document.addEventListener("pointerup", o, !1), this.dispatchEvent({ type: "start" });
  }
  /**
   * Converts the input-coordinates from the standard Y-axis up to this gizmo's `up` axis.
   *
   * @private
   * @param target      - The target Vector3 to be converted
   * @param isSpherical - Whether or not the coordinates are for a sphere
   * @returns The converted coordinates
   */
  coordinateConversion(t, n = !1) {
    const { x: o, y: i, z: r } = t, { up: c } = this._options;
    return c === "x" ? n ? t.set(i, r, o) : t.set(r, o, i) : c === "z" ? n ? t.set(r, o, i) : t.set(i, r, o) : t;
  }
  /**
   * Handles pointer move events for hover effects and drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerMove(t) {
    !this.enabled || this._dragging || (this._background && vt(this._background, !0), this._handleHover(t));
  }
  /**
   * Handles pointer leave events to reset hover states.
   *
   * @private
   */
  _onPointerLeave() {
    if (!this.enabled || this._dragging) return;
    this._background && vt(this._background, !1);
    const t = this._focus !== null;
    this._focus && (Z(this._focus, !1), this._focus = null), this._domElement.style.cursor = "", t && this.dispatchEvent({
      type: "hoverchange",
      object: null,
      ...j(null)
    });
  }
  /**
   * Handles click events for axis selection.
   *
   * @private
   * @param e - The pointer event
   */
  _handleClick(t) {
    const n = yt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    );
    if (this._focus && (Z(this._focus, !1), this._focus = null), !n) {
      this.dispatchEvent({ type: "end" });
      return;
    }
    this._setOrientation(n.object.position), this.dispatchEvent({
      type: "change",
      ...j(n.object)
    });
  }
  /**
   * Handles hover effects for interactive elements.
   *
   * @private
   * @param e - The pointer event
   */
  _handleHover(t) {
    const n = yt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    ), o = (n == null ? void 0 : n.object) || null;
    this._focus !== o && (this._domElement.style.cursor = o ? "pointer" : "", this._focus && Z(this._focus, !1), (this._focus = o) ? Z(o, !0) : ft(this._options, this._intersections, this.camera), this.dispatchEvent({ type: "hoverchange", object: o, ...j(o) }));
  }
}
export {
  Le as ViewportGizmo
};
//# sourceMappingURL=three-viewport-gizmo.js.map
