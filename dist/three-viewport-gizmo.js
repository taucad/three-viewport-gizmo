var ue = Object.defineProperty;
var he = (s, e, t) => e in s ? ue(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var v = (s, e, t) => he(s, typeof e != "symbol" ? e + "" : e, t);
import { Vector3 as A, Vector2 as K, Raycaster as fe, Object3D as H, Color as Qt, CanvasTexture as pe, RepeatWrapping as Dt, SRGBColorSpace as me, BufferGeometry as Yt, BufferAttribute as ct, Sprite as At, SpriteMaterial as Mt, Mesh as $, MeshBasicMaterial as ut, SphereGeometry as Jt, CylinderGeometry as ge, BackSide as ye, InstancedBufferGeometry as _e, Float32BufferAttribute as Pt, InstancedInterleavedBuffer as St, InterleavedBufferAttribute as X, WireframeGeometry as ve, Box3 as zt, Sphere as Kt, ShaderMaterial as be, ShaderLib as lt, UniformsUtils as te, UniformsLib as dt, Vector4 as Q, Line3 as we, Matrix4 as ee, MathUtils as Se, Quaternion as J, Scene as xe, OrthographicCamera as Ee, PerspectiveCamera as Ae, Spherical as Me } from "three";
const ne = (s, e) => {
  const [t, n] = e.split("-");
  return Object.assign(s.style, {
    left: n === "left" ? "0" : n === "center" ? "50%" : "",
    right: n === "right" ? "0" : "",
    top: t === "top" ? "0" : t === "bottom" ? "" : "50%",
    bottom: t === "bottom" ? "0" : "",
    transform: `${n === "center" ? "translateX(-50%)" : ""} ${t === "center" ? "translateY(-50%)" : ""}`
  }), e;
}, ze = ({
  placement: s,
  size: e,
  offset: t,
  id: n,
  className: i
}) => {
  const o = document.createElement("div"), { top: c, left: a, right: d, bottom: u } = t;
  return Object.assign(o.style, {
    id: n,
    position: "absolute",
    zIndex: "1000",
    height: `${e}px`,
    width: `${e}px`,
    margin: `${c}px ${d}px ${u}px ${a}px`,
    borderRadius: "100%"
  }), ne(o, s), n && (o.id = n), i && (o.className = i), o;
}, Ue = (s) => {
  const e = typeof s == "string" ? document.querySelector(s) : s;
  if (!e) throw Error("Invalid DOM element");
  return e;
};
function xt(s, e, t) {
  return Math.max(e, Math.min(t, s));
}
const Te = [
  ["x", 0, 3],
  ["y", 1, 4],
  ["z", 2, 5]
], Rt = /* @__PURE__ */ new A();
function Gt({ isSphere: s }, e, t) {
  s && (Rt.set(0, 0, 1).applyQuaternion(t.quaternion), Te.forEach(([n, i, o]) => {
    const c = Rt[n];
    let a = e[i], d = a.userData.opacity;
    a.material.opacity = xt(c >= 0 ? d : d / 2, 0, 1), a = e[o], d = a.userData.opacity, a.material.opacity = xt(c >= 0 ? d / 2 : d, 0, 1);
  }));
}
const Le = (s, e, t = 10) => Math.abs(s.clientX - e.x) < t && Math.abs(s.clientY - e.y) < t, It = /* @__PURE__ */ new fe(), Ft = /* @__PURE__ */ new K(), kt = (s, e, t, n) => {
  Ft.set(
    (s.clientX - e.left) / e.width * 2 - 1,
    -((s.clientY - e.top) / e.height) * 2 + 1
  ), It.setFromCamera(Ft, t);
  const i = It.intersectObjects(
    n,
    !1
  );
  if (i.length > 0) {
    i.sort((u, r) => u.distance - r.distance);
    const c = 0.2, a = i[0].distance, d = i.filter(
      (u) => u.distance <= a + c
    );
    d.length > 1 && (d.sort((u, r) => {
      const h = u.object.userData.intersectionOrder ?? 0;
      return (r.object.userData.intersectionOrder ?? 0) - h;
    }), i.splice(0, d.length, ...d));
  }
  const o = i.length ? i[0] : null;
  return !o || !o.object.visible ? null : o;
}, et = 1e-6, Ce = 2 * Math.PI, ie = ["x", "y", "z"], q = [...ie, "nx", "ny", "nz"], Oe = ["x", "z", "y", "nx", "nz", "ny"], Be = ["z", "x", "y", "nz", "nx", "ny"], ht = "Right", ft = "Top", pt = "Front", mt = "Left", gt = "Bottom", yt = "Back", se = [
  "right",
  "top",
  "front",
  "left",
  "bottom",
  "back"
], oe = 1.3, Ht = (s, e = !0) => {
  const { material: t, userData: n } = s, { color: i, opacity: o } = e ? n.hover : n;
  t.color.set(i), t.opacity = o;
}, j = (s) => JSON.parse(JSON.stringify(s)), De = {
  yUp: {
    x: ht,
    y: ft,
    z: pt,
    nx: mt,
    ny: gt,
    nz: yt
  },
  zUp: {
    x: ht,
    y: yt,
    z: ft,
    nx: mt,
    ny: pt,
    nz: gt
  },
  xUp: {
    x: ft,
    y: pt,
    z: ht,
    nx: gt,
    ny: yt,
    nz: mt
  }
}, Pe = (s) => {
  const e = s.type || "sphere", t = e === "sphere", n = e === "rounded-cube", i = s.resolution || t ? 64 : 128, o = H.DEFAULT_UP, c = o.z === 1, a = o.x === 1, u = De[c ? "zUp" : a ? "xUp" : "yUp"], { container: r } = s;
  s.container = void 0, s = JSON.parse(JSON.stringify(s)), s.container = r;
  const h = c ? Oe : a ? Be : q;
  se.forEach((p, w) => {
    s[p] && (s[h[w]] = s[p]);
  });
  const l = {
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
  }, f = {
    line: !1,
    scale: t ? 0.45 : 0.7,
    hover: {
      scale: t ? 0.5 : 0.7
    }
  }, b = {
    type: e,
    container: document.body,
    size: 128,
    placement: "top-right",
    resolution: i,
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
      ...j(l),
      ...t ? { label: "X", color: 16725587, line: !0 } : { label: u.x }
    },
    y: {
      ...j(l),
      ...t ? { label: "Y", color: 9100032, line: !0 } : { label: u.y }
    },
    z: {
      ...j(l),
      ...t ? { label: "Z", color: 2920447, line: !0 } : { label: u.z }
    },
    nx: {
      ...j(f),
      label: t ? "" : u.nx
    },
    ny: {
      ...j(f),
      label: t ? "" : u.ny
    },
    nz: {
      ...j(f),
      label: t ? "" : u.nz
    }
  };
  if (Et(s, b), n) {
    const p = s;
    p.edges.radius = p.radius, p.edges.scale = 1, p.edges.opacity = 1, p.edges.hover.scale = 1, p.edges.hover.opacity = 1, p.corners.radius = p.radius, p.corners.scale = 1, p.corners.opacity = 1, p.corners.hover.scale = 1, p.corners.hover.opacity = 1, p.radius = 0, q.forEach((w) => {
      p[w].scale = 1, p[w].opacity = 1, p[w].hover.scale = 1, p[w].hover.opacity = 1;
    });
  }
  return ie.forEach(
    (p) => Et(
      s[`n${p}`],
      j(s[p])
    )
  ), { ...s, isSphere: t };
};
function Et(s, ...e) {
  if (s instanceof HTMLElement || typeof s != "object" || s === null)
    return s;
  for (const t of e)
    for (const n in t)
      n !== "container" && n in t && (s[n] === void 0 ? s[n] = t[n] : typeof t[n] == "object" && !Array.isArray(t[n]) && (s[n] = Et(
        s[n] || {},
        t[n]
      )));
  return s;
}
const Re = (s, e = 2) => {
  const t = new Qt(), n = e * 2, { isSphere: i, resolution: o, radius: c, font: a, corners: d, edges: u } = s, r = q.map((g) => ({ ...s[g], radius: c }));
  i && d.enabled && r.push(d), i && u.enabled && r.push(u);
  const h = document.createElement("canvas"), l = h.getContext("2d");
  h.width = o * 2 + n * 2, h.height = o * r.length + n * r.length;
  const [f, b] = O(r, o, a);
  r.forEach(
    ({
      radius: g,
      label: E,
      color: D,
      labelColor: S,
      border: x,
      hover: {
        color: C,
        labelColor: B,
        border: P
      }
    }, R) => {
      const k = o * R + R * n + e;
      _(
        e,
        k,
        e,
        o,
        g,
        E,
        x,
        D,
        S
      ), _(
        o + e * 3,
        k,
        e,
        o,
        g,
        E,
        P ?? x,
        C ?? D,
        B ?? S
      );
    }
  );
  const p = r.length, w = e / (o * 2), M = e / (o * 6), L = 1 / p, y = new pe(h);
  return y.repeat.set(0.5 - 2 * w, L - 2 * M), y.offset.set(w, 1 - M), Object.assign(y, {
    colorSpace: me,
    wrapS: Dt,
    wrapT: Dt,
    userData: {
      offsetX: w,
      offsetY: M,
      cellHeight: L
    }
  }), y;
  function _(g, E, D, S, x, C, B, P, R) {
    if (x = x * (S / 2), P != null && P !== "" && (k(), l.fillStyle = t.set(P).getStyle(), l.fill()), B && B.size) {
      const V = B.size * S / 2;
      g += V, E += V, S -= B.size * S, x = Math.max(0, x - V), k(), l.strokeStyle = t.set(B.color).getStyle(), l.lineWidth = B.size * S, l.stroke();
    }
    C && m(
      l,
      g + S / 2,
      E + (S + D) / 2,
      C,
      t.set(R).getStyle()
    );
    function k() {
      l.beginPath(), l.moveTo(g + x, E), l.lineTo(g + S - x, E), l.arcTo(g + S, E, g + S, E + x, x), l.lineTo(g + S, E + S - x), l.arcTo(g + S, E + S, g + S - x, E + S, x), l.lineTo(g + x, E + S), l.arcTo(g, E + S, g, E + S - x, x), l.lineTo(g, E + x), l.arcTo(g, E, g + x, E, x), l.closePath();
    }
  }
  function O(g, E, D) {
    const x = [...g].sort((tt, de) => {
      var Ot, Bt;
      return (((Ot = tt.label) == null ? void 0 : Ot.length) || 0) - (((Bt = de.label) == null ? void 0 : Bt.length) || 0);
    }).pop().label, { family: C, weight: B } = D, P = i ? Math.sqrt(Math.pow(E * 0.7, 2) / 2) : E;
    let R = P;
    s.font.size > 0 && (R = s.font.size);
    let k = 0, V = 0;
    do {
      l.font = `${B} ${R}px ${C}`;
      const tt = l.measureText(x);
      k = tt.width, V = tt.fontBoundingBoxDescent, R--;
    } while (k > P && R > 0);
    const Ct = P / V, ce = Math.min(P / k, Ct), le = Math.floor(R * ce);
    return [`${B} ${le}px ${C}`, Ct];
  }
  function m(g, E, D, S, x) {
    g.font = f, g.textAlign = "center", g.textBaseline = "middle", g.fillStyle = x, g.fillText(S, E, D + (i ? b : 0));
  }
}, Ge = (s, e) => s.offset.x = (e ? 0.5 : 0) + s.userData.offsetX, Ut = (s, e) => {
  const {
    offset: t,
    userData: { offsetY: n, cellHeight: i }
  } = s;
  t.y = 1 - (e + 1) * i + n;
};
function Tt(s, e, t = 2, n = 2) {
  const i = t / 2 - s, o = n / 2 - s, c = s / t, a = (t - s) / t, d = s / n, u = (n - s) / n, r = [i, o, 0, -i, o, 0, -i, -o, 0, i, -o, 0], h = [a, u, c, u, c, d, a, d], l = [
    3 * (e + 1) + 3,
    3 * (e + 1) + 4,
    e + 4,
    e + 5,
    2 * (e + 1) + 4,
    2,
    1,
    2 * (e + 1) + 3,
    3,
    4 * (e + 1) + 3,
    4,
    0
  ], f = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11].map(
    (m) => l[m]
  );
  let b, p, w, M, L, y, _, O;
  for (let m = 0; m < 4; m++) {
    M = m < 1 || m > 2 ? i : -i, L = m < 2 ? o : -o, y = m < 1 || m > 2 ? a : c, _ = m < 2 ? u : d;
    for (let g = 0; g <= e; g++)
      b = Math.PI / 2 * (m + g / e), p = Math.cos(b), w = Math.sin(b), r.push(M + s * p, L + s * w, 0), h.push(y + c * p, _ + d * w), g < e && (O = (e + 1) * m + g + 4, f.push(m, O, O + 1));
  }
  return new Yt().setIndex(new ct(new Uint32Array(f), 1)).setAttribute(
    "position",
    new ct(new Float32Array(r), 3)
  ).setAttribute("uv", new ct(new Float32Array(h), 2));
}
const Ie = (s, e) => {
  const t = new A(), { isSphere: n, radius: i, smoothness: o, type: c } = s, d = c === "rounded-cube" ? 2 - s.edges.radius * 2 : 2, u = Tt(i, o, d, d);
  return q.map((r, h) => {
    const l = h < 3, f = q[h], b = h ? e.clone() : e;
    Ut(b, h);
    const { enabled: p, scale: w, opacity: M, hover: L } = s[f], y = {
      map: b,
      opacity: M,
      transparent: !0
    }, _ = n ? new At(new Mt(y)) : new $(u, new ut(y)), O = l ? f : f[1];
    if (_.position[O] = (l ? 1 : -1) * (n ? oe : 1), !n) {
      _.lookAt(t.copy(_.position).multiplyScalar(1.7));
      const m = H.DEFAULT_UP.z === 1, g = H.DEFAULT_UP.x === 1;
      (m || g) && (f === "z" && m || f === "x" && g ? _.rotateZ(-Math.PI / 2) : (f === "nz" && m || f === "nx" && g) && _.rotateZ(Math.PI / 2));
    }
    return _.scale.setScalar(w), _.renderOrder = 1, _.visible = p, _.userData = {
      scale: w,
      opacity: M,
      hover: L,
      kind: "face",
      axes: [q[h]],
      face: se[h]
    }, _;
  });
}, Fe = (s, e) => {
  const { isSphere: t, corners: n, type: i } = s, o = i === "rounded-cube";
  if (!n.enabled) return [];
  const { color: c, opacity: a, scale: d, radius: u, smoothness: r, hover: h } = n, l = t ? null : o ? new Jt(u, r * 2, r) : Tt(u, r), f = {
    transparent: !0,
    opacity: a
  }, b = o ? 1 - u : 0.85, p = [
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
  ].map((M) => M * b), w = new A();
  return Array(p.length / 3).fill(0).map((M, L) => {
    if (t) {
      const m = e.clone();
      Ut(m, 6), f.map = m;
    } else
      f.color = c;
    const y = t ? new At(new Mt(f)) : new $(l, new ut(f)), _ = L * 3;
    y.position.set(p[_], p[_ + 1], p[_ + 2]), t && y.position.normalize().multiplyScalar(1.7), y.scale.setScalar(d), y.lookAt(w.copy(y.position).multiplyScalar(2)), y.renderOrder = 1;
    const O = [
      y.position.x > 0 ? "x" : "nx",
      y.position.y > 0 ? "y" : "ny",
      y.position.z > 0 ? "z" : "nz"
    ];
    return y.userData = {
      color: c,
      opacity: a,
      scale: d,
      hover: h,
      intersectionOrder: 1,
      kind: "corner",
      axes: O
    }, y;
  });
}, _t = (s, e, t) => s === 0 ? null : s > 0 ? e : t, ke = (s, e, t) => {
  const { isSphere: n, edges: i, type: o } = s, c = o === "rounded-cube";
  if (!i.enabled) return [];
  const { color: a, opacity: d, scale: u, hover: r, radius: h, smoothness: l } = i, f = c ? 2 - h * 2 : 1.2, b = n ? null : c ? new ge(h, h, f, l * 4) : Tt(h, l, f, 0.25), p = {
    transparent: !0,
    opacity: d
  }, w = c ? 1 - h : 0.925, M = [
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
  ].map((_) => _ * w), L = new A(), y = new A(0, 1, 0);
  return Array(M.length / 3).fill(0).map((_, O) => {
    if (n) {
      const C = e.clone();
      Ut(C, t), p.map = C;
    } else
      p.color = a;
    const m = n ? new At(new Mt(p)) : new $(b, new ut(p)), g = O * 3;
    m.position.set(M[g], M[g + 1], M[g + 2]), n && m.position.normalize().multiplyScalar(1.7), m.scale.setScalar(u), m.up.copy(y), m.lookAt(L.copy(m.position).multiplyScalar(2)), c ? (!n && !m.position.z && (m.rotation.z = Math.PI), !n && !m.position.x && (m.rotation.x = 0), !n && !m.position.x && (m.rotation.z = Math.PI / 2)) : !n && !m.position.y && (m.rotation.z = Math.PI / 2), m.renderOrder = 1;
    const E = _t(m.position.x, "x", "nx"), D = _t(m.position.y, "y", "ny"), S = _t(m.position.z, "z", "nz"), x = [E, D, S].filter((C) => C !== null);
    return m.userData = {
      color: a,
      opacity: d,
      scale: u,
      hover: r,
      kind: "edge",
      axes: x
    }, m;
  });
};
function He(s, e = !1) {
  const t = s[0].index !== null, n = new Set(Object.keys(s[0].attributes)), i = new Set(Object.keys(s[0].morphAttributes)), o = {}, c = {}, a = s[0].morphTargetsRelative, d = new Yt();
  let u = 0;
  for (let r = 0; r < s.length; ++r) {
    const h = s[r];
    let l = 0;
    if (t !== (h.index !== null))
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
    for (const f in h.attributes) {
      if (!n.has(f))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + '. All geometries must have compatible attributes; make sure "' + f + '" attribute exists among all geometries, or in none of them.'), null;
      o[f] === void 0 && (o[f] = []), o[f].push(h.attributes[f]), l++;
    }
    if (l !== n.size)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". Make sure all geometries have the same number of attributes."), null;
    if (a !== h.morphTargetsRelative)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". .morphTargetsRelative must be consistent throughout all geometries."), null;
    for (const f in h.morphAttributes) {
      if (!i.has(f))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ".  .morphAttributes must be consistent throughout all geometries."), null;
      c[f] === void 0 && (c[f] = []), c[f].push(h.morphAttributes[f]);
    }
    if (e) {
      let f;
      if (t)
        f = h.index.count;
      else if (h.attributes.position !== void 0)
        f = h.attributes.position.count;
      else
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + r + ". The geometry must have either an index or a position attribute"), null;
      d.addGroup(u, f, r), u += f;
    }
  }
  if (t) {
    let r = 0;
    const h = [];
    for (let l = 0; l < s.length; ++l) {
      const f = s[l].index;
      for (let b = 0; b < f.count; ++b)
        h.push(f.getX(b) + r);
      r += s[l].attributes.position.count;
    }
    d.setIndex(h);
  }
  for (const r in o) {
    const h = jt(o[r]);
    if (!h)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + r + " attribute."), null;
    d.setAttribute(r, h);
  }
  for (const r in c) {
    const h = c[r][0].length;
    if (h === 0) break;
    d.morphAttributes = d.morphAttributes || {}, d.morphAttributes[r] = [];
    for (let l = 0; l < h; ++l) {
      const f = [];
      for (let p = 0; p < c[r].length; ++p)
        f.push(c[r][p][l]);
      const b = jt(f);
      if (!b)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + r + " morphAttribute."), null;
      d.morphAttributes[r].push(b);
    }
  }
  return d;
}
function jt(s) {
  let e, t, n, i = -1, o = 0;
  for (let u = 0; u < s.length; ++u) {
    const r = s[u];
    if (e === void 0 && (e = r.array.constructor), e !== r.array.constructor)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."), null;
    if (t === void 0 && (t = r.itemSize), t !== r.itemSize)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."), null;
    if (n === void 0 && (n = r.normalized), n !== r.normalized)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."), null;
    if (i === -1 && (i = r.gpuType), i !== r.gpuType)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."), null;
    o += r.count * t;
  }
  const c = new e(o), a = new ct(c, t, n);
  let d = 0;
  for (let u = 0; u < s.length; ++u) {
    const r = s[u];
    if (r.isInterleavedBufferAttribute) {
      const h = d / t;
      for (let l = 0, f = r.count; l < f; l++)
        for (let b = 0; b < t; b++) {
          const p = r.getComponent(l, b);
          a.setComponent(l + h, b, p);
        }
    } else
      c.set(r.array, d);
    d += r.count * t;
  }
  return i !== void 0 && (a.gpuType = i), a;
}
const je = (s, e) => {
  const {
    isSphere: t,
    background: { enabled: n, color: i, opacity: o, hover: c }
  } = e;
  let a;
  const d = new ut({
    color: i,
    side: ye,
    opacity: o,
    transparent: !0,
    depthWrite: !1
  });
  if (!n) return null;
  if (t)
    a = new $(
      new Jt(1.8, 64, 64),
      d
    );
  else {
    let u;
    s.forEach((r) => {
      const h = r.scale.x;
      r.scale.setScalar(0.9), r.updateMatrix();
      const l = r.geometry.clone();
      l.applyMatrix4(r.matrix), u = u ? He([u, l]) : l, r.scale.setScalar(h);
    }), a = new $(u, d);
  }
  return a.userData = {
    color: i,
    opacity: o,
    hover: c
  }, a;
}, Wt = new zt(), nt = new A();
class re extends _e {
  constructor() {
    super(), this.isLineSegmentsGeometry = !0, this.type = "LineSegmentsGeometry";
    const e = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0], t = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2], n = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
    this.setIndex(n), this.setAttribute("position", new Pt(e, 3)), this.setAttribute("uv", new Pt(t, 2));
  }
  applyMatrix4(e) {
    const t = this.attributes.instanceStart, n = this.attributes.instanceEnd;
    return t !== void 0 && (t.applyMatrix4(e), n.applyMatrix4(e), t.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  setPositions(e) {
    let t;
    e instanceof Float32Array ? t = e : Array.isArray(e) && (t = new Float32Array(e));
    const n = new St(t, 6, 1);
    return this.setAttribute("instanceStart", new X(n, 3, 0)), this.setAttribute("instanceEnd", new X(n, 3, 3)), this.instanceCount = this.attributes.instanceStart.count, this.computeBoundingBox(), this.computeBoundingSphere(), this;
  }
  setColors(e) {
    let t;
    e instanceof Float32Array ? t = e : Array.isArray(e) && (t = new Float32Array(e));
    const n = new St(t, 6, 1);
    return this.setAttribute("instanceColorStart", new X(n, 3, 0)), this.setAttribute("instanceColorEnd", new X(n, 3, 3)), this;
  }
  fromWireframeGeometry(e) {
    return this.setPositions(e.attributes.position.array), this;
  }
  fromEdgesGeometry(e) {
    return this.setPositions(e.attributes.position.array), this;
  }
  fromMesh(e) {
    return this.fromWireframeGeometry(new ve(e.geometry)), this;
  }
  fromLineSegments(e) {
    const t = e.geometry;
    return this.setPositions(t.attributes.position.array), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new zt());
    const e = this.attributes.instanceStart, t = this.attributes.instanceEnd;
    e !== void 0 && t !== void 0 && (this.boundingBox.setFromBufferAttribute(e), Wt.setFromBufferAttribute(t), this.boundingBox.union(Wt));
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new Kt()), this.boundingBox === null && this.computeBoundingBox();
    const e = this.attributes.instanceStart, t = this.attributes.instanceEnd;
    if (e !== void 0 && t !== void 0) {
      const n = this.boundingSphere.center;
      this.boundingBox.getCenter(n);
      let i = 0;
      for (let o = 0, c = e.count; o < c; o++)
        nt.fromBufferAttribute(e, o), i = Math.max(i, n.distanceToSquared(nt)), nt.fromBufferAttribute(t, o), i = Math.max(i, n.distanceToSquared(nt));
      this.boundingSphere.radius = Math.sqrt(i), isNaN(this.boundingSphere.radius) && console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.", this);
    }
  }
  toJSON() {
  }
  applyMatrix(e) {
    return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."), this.applyMatrix4(e);
  }
}
dt.line = {
  worldUnits: { value: 1 },
  linewidth: { value: 1 },
  resolution: { value: new K(1, 1) },
  dashOffset: { value: 0 },
  dashScale: { value: 1 },
  dashSize: { value: 1 },
  gapSize: { value: 1 }
  // todo FIX - maybe change to totalSize
};
lt.line = {
  uniforms: te.merge([
    dt.common,
    dt.fog,
    dt.line
  ]),
  vertexShader: (
    /* glsl */
    `
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`
  ),
  fragmentShader: (
    /* glsl */
    `
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`
  )
};
class Lt extends be {
  constructor(e) {
    super({
      type: "LineMaterial",
      uniforms: te.clone(lt.line.uniforms),
      vertexShader: lt.line.vertexShader,
      fragmentShader: lt.line.fragmentShader,
      clipping: !0
      // required for clipping support
    }), this.isLineMaterial = !0, this.setValues(e);
  }
  get color() {
    return this.uniforms.diffuse.value;
  }
  set color(e) {
    this.uniforms.diffuse.value = e;
  }
  get worldUnits() {
    return "WORLD_UNITS" in this.defines;
  }
  set worldUnits(e) {
    e === !0 ? this.defines.WORLD_UNITS = "" : delete this.defines.WORLD_UNITS;
  }
  get linewidth() {
    return this.uniforms.linewidth.value;
  }
  set linewidth(e) {
    this.uniforms.linewidth && (this.uniforms.linewidth.value = e);
  }
  get dashed() {
    return "USE_DASH" in this.defines;
  }
  set dashed(e) {
    e === !0 !== this.dashed && (this.needsUpdate = !0), e === !0 ? this.defines.USE_DASH = "" : delete this.defines.USE_DASH;
  }
  get dashScale() {
    return this.uniforms.dashScale.value;
  }
  set dashScale(e) {
    this.uniforms.dashScale.value = e;
  }
  get dashSize() {
    return this.uniforms.dashSize.value;
  }
  set dashSize(e) {
    this.uniforms.dashSize.value = e;
  }
  get dashOffset() {
    return this.uniforms.dashOffset.value;
  }
  set dashOffset(e) {
    this.uniforms.dashOffset.value = e;
  }
  get gapSize() {
    return this.uniforms.gapSize.value;
  }
  set gapSize(e) {
    this.uniforms.gapSize.value = e;
  }
  get opacity() {
    return this.uniforms.opacity.value;
  }
  set opacity(e) {
    this.uniforms && (this.uniforms.opacity.value = e);
  }
  get resolution() {
    return this.uniforms.resolution.value;
  }
  set resolution(e) {
    this.uniforms.resolution.value.copy(e);
  }
  get alphaToCoverage() {
    return "USE_ALPHA_TO_COVERAGE" in this.defines;
  }
  set alphaToCoverage(e) {
    this.defines && (e === !0 !== this.alphaToCoverage && (this.needsUpdate = !0), e === !0 ? this.defines.USE_ALPHA_TO_COVERAGE = "" : delete this.defines.USE_ALPHA_TO_COVERAGE);
  }
}
const vt = new Q(), qt = new A(), Nt = new A(), z = new Q(), U = new Q(), G = new Q(), bt = new A(), wt = new ee(), T = new we(), Vt = new A(), it = new zt(), st = new Kt(), I = new Q();
let F, N;
function Zt(s, e, t) {
  return I.set(0, 0, -e, 1).applyMatrix4(s.projectionMatrix), I.multiplyScalar(1 / I.w), I.x = N / t.width, I.y = N / t.height, I.applyMatrix4(s.projectionMatrixInverse), I.multiplyScalar(1 / I.w), Math.abs(Math.max(I.x, I.y));
}
function We(s, e) {
  const t = s.matrixWorld, n = s.geometry, i = n.attributes.instanceStart, o = n.attributes.instanceEnd, c = Math.min(n.instanceCount, i.count);
  for (let a = 0, d = c; a < d; a++) {
    T.start.fromBufferAttribute(i, a), T.end.fromBufferAttribute(o, a), T.applyMatrix4(t);
    const u = new A(), r = new A();
    F.distanceSqToSegment(T.start, T.end, r, u), r.distanceTo(u) < N * 0.5 && e.push({
      point: r,
      pointOnLine: u,
      distance: F.origin.distanceTo(r),
      object: s,
      face: null,
      faceIndex: a,
      uv: null,
      uv1: null
    });
  }
}
function qe(s, e, t) {
  const n = e.projectionMatrix, o = s.material.resolution, c = s.matrixWorld, a = s.geometry, d = a.attributes.instanceStart, u = a.attributes.instanceEnd, r = Math.min(a.instanceCount, d.count), h = -e.near;
  F.at(1, G), G.w = 1, G.applyMatrix4(e.matrixWorldInverse), G.applyMatrix4(n), G.multiplyScalar(1 / G.w), G.x *= o.x / 2, G.y *= o.y / 2, G.z = 0, bt.copy(G), wt.multiplyMatrices(e.matrixWorldInverse, c);
  for (let l = 0, f = r; l < f; l++) {
    if (z.fromBufferAttribute(d, l), U.fromBufferAttribute(u, l), z.w = 1, U.w = 1, z.applyMatrix4(wt), U.applyMatrix4(wt), z.z > h && U.z > h)
      continue;
    if (z.z > h) {
      const y = z.z - U.z, _ = (z.z - h) / y;
      z.lerp(U, _);
    } else if (U.z > h) {
      const y = U.z - z.z, _ = (U.z - h) / y;
      U.lerp(z, _);
    }
    z.applyMatrix4(n), U.applyMatrix4(n), z.multiplyScalar(1 / z.w), U.multiplyScalar(1 / U.w), z.x *= o.x / 2, z.y *= o.y / 2, U.x *= o.x / 2, U.y *= o.y / 2, T.start.copy(z), T.start.z = 0, T.end.copy(U), T.end.z = 0;
    const p = T.closestPointToPointParameter(bt, !0);
    T.at(p, Vt);
    const w = Se.lerp(z.z, U.z, p), M = w >= -1 && w <= 1, L = bt.distanceTo(Vt) < N * 0.5;
    if (M && L) {
      T.start.fromBufferAttribute(d, l), T.end.fromBufferAttribute(u, l), T.start.applyMatrix4(c), T.end.applyMatrix4(c);
      const y = new A(), _ = new A();
      F.distanceSqToSegment(T.start, T.end, _, y), t.push({
        point: _,
        pointOnLine: y,
        distance: F.origin.distanceTo(_),
        object: s,
        face: null,
        faceIndex: l,
        uv: null,
        uv1: null
      });
    }
  }
}
class Ne extends $ {
  constructor(e = new re(), t = new Lt({ color: Math.random() * 16777215 })) {
    super(e, t), this.isLineSegments2 = !0, this.type = "LineSegments2";
  }
  // for backwards-compatibility, but could be a method of LineSegmentsGeometry...
  computeLineDistances() {
    const e = this.geometry, t = e.attributes.instanceStart, n = e.attributes.instanceEnd, i = new Float32Array(2 * t.count);
    for (let c = 0, a = 0, d = t.count; c < d; c++, a += 2)
      qt.fromBufferAttribute(t, c), Nt.fromBufferAttribute(n, c), i[a] = a === 0 ? 0 : i[a - 1], i[a + 1] = i[a] + qt.distanceTo(Nt);
    const o = new St(i, 2, 1);
    return e.setAttribute("instanceDistanceStart", new X(o, 1, 0)), e.setAttribute("instanceDistanceEnd", new X(o, 1, 1)), this;
  }
  raycast(e, t) {
    const n = this.material.worldUnits, i = e.camera;
    i === null && !n && console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');
    const o = e.params.Line2 !== void 0 && e.params.Line2.threshold || 0;
    F = e.ray;
    const c = this.matrixWorld, a = this.geometry, d = this.material;
    N = d.linewidth + o, a.boundingSphere === null && a.computeBoundingSphere(), st.copy(a.boundingSphere).applyMatrix4(c);
    let u;
    if (n)
      u = N * 0.5;
    else {
      const h = Math.max(i.near, st.distanceToPoint(F.origin));
      u = Zt(i, h, d.resolution);
    }
    if (st.radius += u, F.intersectsSphere(st) === !1)
      return;
    a.boundingBox === null && a.computeBoundingBox(), it.copy(a.boundingBox).applyMatrix4(c);
    let r;
    if (n)
      r = N * 0.5;
    else {
      const h = Math.max(i.near, it.distanceToPoint(F.origin));
      r = Zt(i, h, d.resolution);
    }
    it.expandByScalar(r), F.intersectsBox(it) !== !1 && (n ? We(this, t) : qe(this, i, t));
  }
  onBeforeRender(e) {
    const t = this.material.uniforms;
    t && t.resolution && (e.getViewport(vt), this.material.uniforms.resolution.value.set(vt.z, vt.w));
  }
}
class ae extends re {
  constructor() {
    super(), this.isLineGeometry = !0, this.type = "LineGeometry";
  }
  setPositions(e) {
    const t = e.length - 3, n = new Float32Array(2 * t);
    for (let i = 0; i < t; i += 3)
      n[2 * i] = e[i], n[2 * i + 1] = e[i + 1], n[2 * i + 2] = e[i + 2], n[2 * i + 3] = e[i + 3], n[2 * i + 4] = e[i + 4], n[2 * i + 5] = e[i + 5];
    return super.setPositions(n), this;
  }
  setColors(e) {
    const t = e.length - 3, n = new Float32Array(2 * t);
    for (let i = 0; i < t; i += 3)
      n[2 * i] = e[i], n[2 * i + 1] = e[i + 1], n[2 * i + 2] = e[i + 2], n[2 * i + 3] = e[i + 3], n[2 * i + 4] = e[i + 4], n[2 * i + 5] = e[i + 5];
    return super.setColors(n), this;
  }
  setFromPoints(e) {
    const t = e.length - 1, n = new Float32Array(6 * t);
    for (let i = 0; i < t; i++)
      n[6 * i] = e[i].x, n[6 * i + 1] = e[i].y, n[6 * i + 2] = e[i].z || 0, n[6 * i + 3] = e[i + 1].x, n[6 * i + 4] = e[i + 1].y, n[6 * i + 5] = e[i + 1].z || 0;
    return super.setPositions(n), this;
  }
  fromLine(e) {
    const t = e.geometry;
    return this.setPositions(t.attributes.position.array), this;
  }
}
class Ve extends Ne {
  constructor(e = new ae(), t = new Lt({ color: Math.random() * 16777215 })) {
    super(e, t), this.isLine2 = !0, this.type = "Line2";
  }
}
const Ze = (s) => {
  const e = new Qt(), t = [], n = [], { isSphere: i } = s;
  if (q.forEach((a, d) => {
    const { enabled: u, line: r, scale: h, color: l } = s[a];
    if (!u || !r) return;
    const f = d < 3 ? 1 : -1, p = (i ? oe - h / 2 : 0.975) * f;
    t.push(
      a.includes("x") ? p : 0,
      a.includes("y") ? p : 0,
      a.includes("z") ? p : 0,
      0,
      0,
      0
    );
    const w = e.set(l).toArray();
    n.push(...w, ...w);
  }), !t.length) return null;
  const o = new ae().setPositions(t).setColors(n), c = new Lt({
    linewidth: s.lineWidth,
    vertexColors: !0,
    resolution: new K(window.innerWidth, window.innerHeight)
  });
  return new Ve(o, c).computeLineDistances();
}, Xe = (s) => {
  const { corners: e, edges: t } = s, n = [], i = Re(s), o = Ie(s, i);
  n.push(...o), e.enabled && n.push(...Fe(s, i)), t.enabled && n.push(...ke(s, i, e.enabled ? 7 : 6));
  const c = je(o, s), a = Ze(s);
  return [n, c, a];
}, Y = (s, e = !0) => {
  const { material: t, userData: n } = s, { opacity: i, color: o, scale: c } = e ? n.hover : n;
  s.scale.setScalar(c), t.opacity = i, t.map ? Ge(t.map, e) : t.color.set(o);
}, $e = /* @__PURE__ */ new A();
function Z(s) {
  if (!s) return { kind: null, axes: null, face: null, direction: null };
  const e = s.userData;
  return {
    kind: e.kind ?? null,
    axes: e.axes ?? null,
    face: e.face ?? null,
    direction: $e.copy(s.position).normalize().clone()
  };
}
const ot = /* @__PURE__ */ new ee(), Xt = /* @__PURE__ */ new Me(), Qe = /* @__PURE__ */ new K(), W = /* @__PURE__ */ new A(), $t = /* @__PURE__ */ new Q(), rt = /* @__PURE__ */ new J().setFromAxisAngle(new A(0, 0, 1), Math.PI / 2), at = /* @__PURE__ */ new J().setFromAxisAngle(new A(0, 0, 1), -Math.PI / 2);
class Ke extends H {
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
  constructor(t, n, i = {}) {
    super();
    /** Whether the gizmo is currently active and responding to user input */
    v(this, "enabled", !0);
    /** The camera being controlled by this gizmo */
    v(this, "camera");
    /** The WebGLRenderer rendering the gizmo */
    v(this, "renderer");
    /** The configuration options */
    v(this, "options");
    /** The point around which the camera rotates */
    v(this, "target", new A());
    /** Whether view changes should be animated */
    v(this, "animated", !0);
    /** The speed of view change animations. Higher values result in faster animations */
    v(this, "speed", 1);
    /**
     * Indicates whether the gizmo is currently being animated or not,
     * Useful when interacting with other camera controllers
     *
     * @readonly This value is set internally.
     **/
    v(this, "animating", !1);
    v(this, "_options");
    v(this, "_intersections");
    v(this, "_background", null);
    v(this, "_viewport", [0, 0, 0, 0]);
    v(this, "_originalViewport", [0, 0, 0, 0]);
    v(this, "_originalScissor", [0, 0, 0, 0]);
    v(this, "_scene");
    v(this, "_camera");
    v(this, "_container");
    v(this, "_domElement");
    v(this, "_domRect");
    v(this, "_dragging", !1);
    v(this, "_distance", 0);
    /** Seconds; `null` until first `_animate` tick after `_setOrientation` (first frame uses delta 0). */
    v(this, "_lastAnimateTimeSeconds", null);
    v(this, "_targetQuaternion", new J());
    v(this, "_quaternionStart", new J());
    v(this, "_quaternionEnd", new J());
    v(this, "_pointerStart", new K());
    v(this, "_focus", null);
    v(this, "_placement");
    v(this, "_controls");
    v(this, "_controlsListeners");
    this.camera = t, this.renderer = n, this._scene = new xe().add(this), this.set(i);
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
    this._placement = ne(this._domElement, t), this.domUpdate();
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
    this.dispose(), this.options = t, this._options = Pe(t), this._camera = this._options.isSphere ? new Ee(-1.8, 1.8, 1.8, -1.8, 5, 10) : new Ae(26, 1, 5, 10), this._camera.position.set(0, 0, 7);
    const [n, i, o] = Xe(this._options);
    i && this.add(i), o && this.add(o), this.add(...n), this._background = i, this._intersections = n;
    const { container: c, animated: a, speed: d } = this._options;
    return this.animated = a, this.speed = d, this._container = c ? Ue(c) : document.body, this._domElement = ze(this._options), this._domElement.onpointerdown = (u) => this._onPointerDown(u), this._domElement.onpointermove = (u) => this._onPointerMove(u), this._domElement.onpointerleave = () => this._onPointerLeave(), this._container.appendChild(this._domElement), this._controls && this.attachControls(this._controls), this.update(), this;
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
    const { renderer: t, _viewport: n } = this, i = t.getScissorTest(), o = t.autoClear;
    return t.autoClear = !1, t.setViewport(...n), i && t.setScissor(...n), t.clear(!1, !0, !1), t.render(this._scene, this._camera), t.setViewport(...this._originalViewport), i && t.setScissor(...this._originalScissor), t.autoClear = o, this;
  }
  /**
   * Updates the gizmo's DOM-related properties based on its current position
   * and size in the document.
   *
   * @returns The gizmo instance for method chaining
   */
  domUpdate() {
    this._domRect = this._domElement.getBoundingClientRect();
    const t = this.renderer, n = this._domRect, i = t.domElement.getBoundingClientRect();
    return this._viewport.splice(
      0,
      4,
      n.left - i.left,
      t.domElement.clientHeight - (n.top - i.top + n.height),
      n.width,
      n.height
    ), t.getViewport($t).toArray(this._originalViewport), t.getScissorTest() && t.getScissor($t).toArray(this._originalScissor), this;
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
      return this.target = new A().copy(this._controls.target), this.removeEventListener("start", this._controlsListeners.start), this.removeEventListener("end", this._controlsListeners.end), this._controls.removeEventListener(
        "change",
        this._controlsListeners.change
      ), this._controlsListeners = void 0, this._controls = void 0, this;
  }
  /** Cleans up all resources including geometries, materials, textures, and event listeners. */
  dispose() {
    var t;
    this.detachControls(), this.children.forEach((n) => {
      var o, c, a, d;
      this.remove(n);
      const i = n;
      (o = i.material) == null || o.dispose(), (a = (c = i.material) == null ? void 0 : c.map) == null || a.dispose(), (d = i.geometry) == null || d.dispose();
    }), (t = this._domElement) == null || t.remove();
  }
  /**
   * Updates the gizmo's orientation either based on the camera or internal state.
   *
   * @private
   * @param fromCamera - Whether to update based on camera orientation (true) or internal state (false)
   */
  _updateOrientation(t = !0) {
    t && (this.quaternion.copy(this.camera.quaternion).invert(), this.updateMatrixWorld()), Gt(this._options, this._intersections, this.camera);
  }
  /**
   * Handles the animation of camera position and orientation changes.
   *
   * @private
   */
  _animate() {
    const { position: t, quaternion: n } = this.camera;
    if (t.set(0, 0, 1), !this.animated) {
      t.applyQuaternion(this._quaternionEnd).multiplyScalar(this._distance).add(this.target), n.copy(this._targetQuaternion), this._updateOrientation(), this.animating = !1, this._lastAnimateTimeSeconds = null, this.dispatchEvent({ type: "change", ...Z(null) }), this.dispatchEvent({ type: "end" });
      return;
    }
    this._controls && (this._controls.enabled = !1);
    const i = performance.now() / 1e3, o = this._lastAnimateTimeSeconds === null ? 0 : i - this._lastAnimateTimeSeconds;
    this._lastAnimateTimeSeconds = i;
    const c = o * Ce * this.speed;
    if (this._quaternionStart.rotateTowards(this._quaternionEnd, c), t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target), n.rotateTowards(this._targetQuaternion, c), this._updateOrientation(), requestAnimationFrame(
      () => this.dispatchEvent({ type: "change", ...Z(null) })
    ), this._quaternionStart.angleTo(this._quaternionEnd) < et) {
      if (this._controls) {
        const a = this.camera.position.clone().sub(this.target).normalize();
        H.DEFAULT_UP.z === 1 && Math.abs(a.z) > 0.99 ? this.camera.position.set(0, -1e-6, this.camera.position.z) : H.DEFAULT_UP.x === 1 && Math.abs(a.x) > 0.99 && this.camera.position.set(this.camera.position.x, et, 0), this._controls.update(), this._controls.enabled = !0;
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
    const n = this.camera, i = this.target;
    if (W.copy(t).multiplyScalar(this._distance), ot.setPosition(W).lookAt(W, this.position, this.up), this._targetQuaternion.setFromRotationMatrix(ot), W.add(i), ot.lookAt(W, i, this.up), this._quaternionEnd.setFromRotationMatrix(ot), this._quaternionStart.copy(n.quaternion), H.DEFAULT_UP.z === 1 && Math.abs(t.z) > 0.99) {
      const o = Math.sign(t.z);
      this._targetQuaternion.multiply(o === 1 ? at : rt), this._quaternionEnd.multiply(o === 1 ? at : rt);
    } else if (H.DEFAULT_UP.x === 1 && Math.abs(t.x) > 0.99) {
      const o = Math.sign(t.x);
      this._targetQuaternion.multiply(o === 1 ? at : rt), this._quaternionEnd.multiply(o === 1 ? at : rt);
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
    const n = (u) => {
      if (!this._dragging) {
        if (Le(u, this._pointerStart)) return;
        this._dragging = !0;
      }
      const r = Qe.set(u.clientX, u.clientY).sub(this._pointerStart).multiplyScalar(1 / this._domRect.width * Math.PI), h = this.coordinateConversion(
        W.subVectors(this.camera.position, this.target)
      ), l = Xt.setFromVector3(h);
      l.theta = a - r.x, l.phi = xt(
        d - r.y,
        et,
        Math.PI - et
      ), this.coordinateConversion(
        this.camera.position.setFromSpherical(l),
        !0
      ).add(this.target), this.camera.lookAt(this.target), this.quaternion.copy(this.camera.quaternion).invert(), this._updateOrientation(!1), this.dispatchEvent({ type: "change", ...Z(null) });
    }, i = () => {
      if (document.removeEventListener("pointermove", n, !1), document.removeEventListener("pointerup", i, !1), !this._dragging) return this._handleClick(t);
      this._focus && (Y(this._focus, !1), this._focus = null), this._dragging = !1, this.dispatchEvent({ type: "end" });
    };
    if (this.animating) return;
    t.preventDefault(), this._pointerStart.set(t.clientX, t.clientY);
    const o = this.coordinateConversion(
      W.subVectors(this.camera.position, this.target)
    ), c = Xt.setFromVector3(o), a = c.theta, d = c.phi;
    this._distance = c.radius, document.addEventListener("pointermove", n, !1), document.addEventListener("pointerup", i, !1), this.dispatchEvent({ type: "start" });
  }
  /**
   * Converts the input-coordinates from the standard Y-axis up to what is set in Object3D.DEFAULT_UP.
   *
   * @private
   * @param target      - The target Vector3 to be converted
   * @param isSpherical - Whether or not the coordinates are for a sphere
   * @returns The converted coordinates
   */
  coordinateConversion(t, n = !1) {
    const { x: i, y: o, z: c } = t, a = H.DEFAULT_UP;
    return a.x === 1 ? n ? t.set(o, c, i) : t.set(c, i, o) : a.z === 1 ? n ? t.set(c, i, o) : t.set(o, c, i) : t;
  }
  /**
   * Handles pointer move events for hover effects and drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  _onPointerMove(t) {
    !this.enabled || this._dragging || (this._background && Ht(this._background, !0), this._handleHover(t));
  }
  /**
   * Handles pointer leave events to reset hover states.
   *
   * @private
   */
  _onPointerLeave() {
    if (!this.enabled || this._dragging) return;
    this._background && Ht(this._background, !1);
    const t = this._focus !== null;
    this._focus && (Y(this._focus, !1), this._focus = null), this._domElement.style.cursor = "", t && this.dispatchEvent({
      type: "hoverchange",
      object: null,
      ...Z(null)
    });
  }
  /**
   * Handles click events for axis selection.
   *
   * @private
   * @param e - The pointer event
   */
  _handleClick(t) {
    const n = kt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    );
    this._focus && (Y(this._focus, !1), this._focus = null), n && (this._setOrientation(n.object.position), this.dispatchEvent({
      type: "change",
      ...Z(n.object)
    }));
  }
  /**
   * Handles hover effects for interactive elements.
   *
   * @private
   * @param e - The pointer event
   */
  _handleHover(t) {
    const n = kt(
      t,
      this._domRect,
      this._camera,
      this._intersections
    ), i = (n == null ? void 0 : n.object) || null;
    this._focus !== i && (this._domElement.style.cursor = i ? "pointer" : "", this._focus && Y(this._focus, !1), (this._focus = i) ? Y(i, !0) : Gt(this._options, this._intersections, this.camera), this.dispatchEvent({ type: "hoverchange", object: i, ...Z(i) }));
  }
}
export {
  Ke as ViewportGizmo
};
//# sourceMappingURL=three-viewport-gizmo.js.map
