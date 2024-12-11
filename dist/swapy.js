function rt(t) {
  return typeof t == "object" && t !== null && "x" in t && "y" in t && "unit" in t && typeof t.unit == "string" && typeof t.x == "object" && typeof t.y == "object" && "topLeft" in t.x && "topRight" in t.x && "bottomRight" in t.x && "bottomLeft" in t.x && "topLeft" in t.y && "topRight" in t.y && "bottomRight" in t.y && "bottomLeft" in t.y;
}
function gt(t) {
  var h;
  const e = t.match(/(\d+(?:\.\d+)?)(px|%)/g);
  if (!e)
    return {
      x: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
      y: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
      unit: "px"
    };
  const n = e.map((s) => {
    const [c, f, m] = s.match(/(\d+(?:\.\d+)?)(px|%)/) ?? [];
    return { value: parseFloat(f), unit: m };
  }), o = ((h = n[0]) == null ? void 0 : h.unit) || "px";
  if (n.some((s) => s.unit !== o))
    throw new Error("Inconsistent units in border-radius string.");
  const [l, i, d, u] = n.map((s) => s.value), a = {
    topLeft: l ?? 0,
    topRight: i ?? l ?? 0,
    bottomRight: d ?? l ?? 0,
    bottomLeft: u ?? i ?? l ?? 0
  };
  return {
    x: { ...a },
    y: { ...a },
    unit: o
  };
}
function ht({ x: t, y: e, unit: n }, o, l) {
  if (n === "px") {
    const i = {
      topLeft: t.topLeft / o,
      topRight: t.topRight / o,
      bottomLeft: t.bottomLeft / o,
      bottomRight: t.bottomRight / o
    }, d = {
      topLeft: e.topLeft / l,
      topRight: e.topRight / l,
      bottomLeft: e.bottomLeft / l,
      bottomRight: e.bottomRight / l
    };
    return { x: i, y: d, unit: "px" };
  } else if (n === "%")
    return { x: t, y: e, unit: "%" };
  return { x: t, y: e, unit: n };
}
function z(t) {
  return `
    ${t.x.topLeft}${t.unit} ${t.x.topRight}${t.unit} ${t.x.bottomRight}${t.unit} ${t.x.bottomLeft}${t.unit}
    /
    ${t.y.topLeft}${t.unit} ${t.y.topRight}${t.unit} ${t.y.bottomRight}${t.unit} ${t.y.bottomLeft}${t.unit}
  `;
}
function it(t) {
  return t.x.topLeft === 0 && t.x.topRight === 0 && t.x.bottomRight === 0 && t.x.bottomLeft === 0 && t.y.topLeft === 0 && t.y.topRight === 0 && t.y.bottomRight === 0 && t.y.bottomLeft === 0;
}
function at(t) {
  return typeof t == "object" && "x" in t && "y" in t;
}
function R(t, e) {
  return { x: t, y: e };
}
function xt(t, e) {
  return R(t.x + e.x, t.y + e.y);
}
function vt(t, e) {
  return R(t.x - e.x, t.y - e.y);
}
function It(t, e) {
  return R(t.x * e, t.y * e);
}
function C(t, e, n) {
  return t + (e - t) * n;
}
function At(t, e, n) {
  return xt(t, It(vt(e, t), n));
}
function pt(t, e, n) {
  return {
    x: {
      topLeft: C(t.x.topLeft, e.x.topLeft, n),
      topRight: C(t.x.topRight, e.x.topRight, n),
      bottomRight: C(t.x.bottomRight, e.x.bottomRight, n),
      bottomLeft: C(t.x.bottomLeft, e.x.bottomLeft, n)
    },
    y: {
      topLeft: C(t.y.topLeft, e.y.topLeft, n),
      topRight: C(t.y.topRight, e.y.topRight, n),
      bottomRight: C(t.y.bottomRight, e.y.bottomRight, n),
      bottomLeft: C(t.y.bottomLeft, e.y.bottomLeft, n)
    },
    unit: t.unit
  };
}
function Et(t, e, n) {
  return W((n - t) / (e - t), 0, 1);
}
function V(t, e, n, o, l) {
  return C(n, o, Et(t, e, l));
}
function W(t, e, n) {
  return Math.min(Math.max(t, e), n);
}
const Xt = {
  duration: 350,
  easing: (t) => t
};
function yt(t, e, n, o) {
  let l = !1;
  const i = () => {
    l = !0;
  }, d = { ...Xt, ...o };
  let u;
  function a(h) {
    u === void 0 && (u = h);
    const s = h - u, c = W(s / d.duration, 0, 1), f = Object.keys(t), m = Object.keys(e);
    if (!f.every((g) => m.includes(g))) {
      console.error("animate Error: `from` keys are different than `to`");
      return;
    }
    const v = {};
    f.forEach((g) => {
      typeof t[g] == "number" && typeof e[g] == "number" ? v[g] = C(
        t[g],
        e[g],
        d.easing(c)
      ) : rt(t[g]) && rt(e[g]) ? v[g] = pt(
        t[g],
        e[g],
        d.easing(c)
      ) : at(t[g]) && at(e[g]) && (v[g] = At(
        t[g],
        e[g],
        d.easing(c)
      ));
    }), n(v, c >= 1, c), c < 1 && !l && requestAnimationFrame(a);
  }
  return requestAnimationFrame(a), i;
}
const Tt = {
  startDelay: 0
};
function Dt(t, e) {
  const n = { ...Tt, ...e };
  let o = t.el(), l = !1, i = null, d = null, u = null, a = null, h = 0, s = 0, c = 0, f = 0, m = 0, v = 0, g = 0, T = 0, r = 0, I = 0, E = null, p;
  o.addEventListener("pointerdown", w), document.body.addEventListener("pointerup", x), document.body.addEventListener("pointermove", X), document.body.addEventListener("touchmove", D, { passive: !1 });
  function w(y) {
    if (l || !y.isPrimary) return;
    n.startDelay > 0 ? (u == null || u({ el: y.target }), p = setTimeout(() => {
      B();
    }, n.startDelay)) : B();
    function B() {
      E = y.target, y.preventDefault();
      const L = t.boundingRect(), q = t.layoutRect();
      m = q.x, v = q.y, c = L.x - m, f = L.y - v, h = y.clientX - c, s = y.clientY - f, g = y.clientX, T = y.clientY, r = (y.clientX - L.x) / L.width, I = (y.clientY - L.y) / L.height, l = !0, X(y);
    }
  }
  function A() {
    const y = t.layoutRect();
    h -= m - y.x, s -= v - y.y, m = y.x, v = y.y;
  }
  function x(y) {
    if (!l) {
      p && (clearTimeout(p), p = null, a == null || a({ el: y.target }));
      return;
    }
    if (!y.isPrimary) return;
    l = !1;
    const B = y.clientX - g, L = y.clientY - T;
    d == null || d({
      x: c,
      y: f,
      pointerX: y.clientX,
      pointerY: y.clientY,
      width: B,
      height: L,
      relativeX: r,
      relativeY: I,
      el: E
    }), E = null;
  }
  function X(y) {
    if (!l) {
      p && (clearTimeout(p), p = null, a == null || a({ el: y.target }));
      return;
    }
    if (!y.isPrimary) return;
    y.preventDefault();
    const B = y.clientX - g, L = y.clientY - T, q = c = y.clientX - h, U = f = y.clientY - s;
    i == null || i({
      width: B,
      height: L,
      x: q,
      y: U,
      pointerX: y.clientX,
      pointerY: y.clientY,
      relativeX: r,
      relativeY: I,
      el: E
    });
  }
  function D(y) {
    if (!l) return !0;
    y.preventDefault();
  }
  function M(y) {
    i = y;
  }
  function H(y) {
    d = y;
  }
  function _(y) {
    u = y;
  }
  function P(y) {
    a = y;
  }
  function $() {
    o.removeEventListener("pointerdown", w), o = t.el(), o.addEventListener("pointerdown", w);
  }
  function N() {
    t.el().removeEventListener("pointerdown", w), document.body.removeEventListener("pointerup", x), document.body.removeEventListener("pointermove", X), document.body.removeEventListener("touchmove", D), i = null, d = null, u = null, a = null;
  }
  return {
    onDrag: M,
    onDrop: H,
    onHold: _,
    onRelease: P,
    onElementUpdate: $,
    destroy: N,
    readjust: A
  };
}
function Mt(t) {
  return 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
}
function bt(t) {
  return 1 - Math.pow(1 - t, 3);
}
function k(t) {
  return {
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height
  };
}
function Z(t) {
  let e = t, n = 0, o = 0;
  for (; e; )
    n += e.offsetTop, o += e.offsetLeft, e = e.offsetParent;
  return {
    x: o,
    y: n,
    width: t.offsetWidth,
    height: t.offsetHeight
  };
}
function st(t, e) {
  return t.x >= e.x && t.x <= e.x + e.width && t.y >= e.y && t.y <= e.y + e.height;
}
function Lt(t) {
  let e = t, n = 0, o = 0;
  for (; e; ) {
    const l = (i) => {
      const d = getComputedStyle(i);
      return /(auto|scroll)/.test(
        d.overflow + d.overflowY + d.overflowX
      );
    };
    if (e === document.body) {
      o += window.scrollX, n += window.scrollY;
      break;
    }
    l(e) && (o += e.scrollLeft, n += e.scrollTop), e = e.parentElement;
  }
  return { x: o, y: n };
}
function K(t) {
  let e = "unread", n, o, l, i, d, u, a, h, s, c, f;
  function m() {
    n = t.currentTransform(), o = t.boundingRect(), l = Lt(t.el()), f = ct(t.el()).map(({ parent: I, children: E }) => ({
      parent: {
        el: I,
        initialRect: k(I.getBoundingClientRect())
      },
      children: E.map((p) => {
        const w = p;
        return w.originalBorderRadius || (w.originalBorderRadius = getComputedStyle(p).borderRadius), {
          el: p,
          borderRadius: gt(w.originalBorderRadius),
          initialRect: k(p.getBoundingClientRect())
        };
      })
    })), e = "readInitial";
  }
  function v() {
    if (e !== "readInitial")
      throw new Error(
        "FlipView: Cannot read final values before reading initial values"
      );
    s = t.layoutRect(), u = o.width / s.width, a = o.height / s.height, i = o.x - s.x - n.dragX + l.x, d = o.y - s.y - n.dragY + l.y, h = ht(
      t.borderRadius(),
      u,
      a
    );
    const r = ct(t.el());
    f = f.map(
      ({ parent: E, children: p }, w) => {
        const A = r[w].parent;
        return {
          parent: {
            ...E,
            el: A,
            finalRect: Z(A)
          },
          children: p.map((x, X) => {
            const D = r[w].children[X];
            let M = Z(D);
            return D.hasAttribute("data-swapy-text") && (M = {
              ...M,
              width: x.initialRect.width,
              height: x.initialRect.height
            }), {
              ...x,
              el: D,
              finalRect: M
            };
          })
        };
      }
    );
    const I = {
      translateX: i,
      translateY: d,
      scaleX: u,
      scaleY: a
    };
    t.el().style.transformOrigin = "0 0", t.el().style.borderRadius = z(
      h
    ), t.setTransform(I), c = [], f.forEach(({ parent: E, children: p }) => {
      const w = p.map(
        ({ el: A, initialRect: x, finalRect: X, borderRadius: D }) => Yt(
          A,
          x,
          X,
          D,
          E.initialRect,
          E.finalRect
        )
      );
      c.push(...w);
    }), e = "readFinal";
  }
  function g() {
    if (e !== "readFinal")
      throw new Error("FlipView: Cannot get transition values before reading");
    return {
      from: {
        width: o.width,
        height: o.height,
        translate: R(i, d),
        scale: R(u, a),
        borderRadius: h
      },
      to: {
        width: s.width,
        height: s.height,
        translate: R(0, 0),
        scale: R(1, 1),
        borderRadius: t.borderRadius()
      }
    };
  }
  function T() {
    if (e !== "readFinal")
      throw new Error(
        "FlipView: Cannot get children transition values before reading"
      );
    return c;
  }
  return {
    readInitial: m,
    readFinalAndReverse: v,
    transitionValues: g,
    childrenTransitionData: T
  };
}
function Yt(t, e, n, o, l, i) {
  t.style.transformOrigin = "0 0";
  const d = l.width / i.width, u = l.height / i.height, a = e.width / n.width, h = e.height / n.height, s = ht(
    o,
    a,
    h
  ), c = e.x - l.x, f = n.x - i.x, m = e.y - l.y, v = n.y - i.y, g = (c - f * d) / d, T = (m - v * u) / u;
  return t.style.transform = `translate(${g}px, ${T}px) scale(${a / d}, ${h / u})`, t.style.borderRadius = z(s), {
    el: t,
    fromTranslate: R(g, T),
    fromScale: R(a, h),
    fromBorderRadius: s,
    toBorderRadius: o,
    parentScale: { x: d, y: u }
  };
}
function ct(t) {
  const e = [];
  function n(o) {
    const l = Array.from(o.children);
    l.length > 0 && (e.push({
      parent: o,
      children: l
    }), l.forEach((i) => n(i)));
  }
  return n(t), e;
}
function mt(t) {
  const e = [];
  let n = t, o = {
    dragX: 0,
    dragY: 0,
    translateX: 0,
    translateY: 0,
    scaleX: 1,
    scaleY: 1
  };
  const l = gt(
    window.getComputedStyle(n).borderRadius
  ), i = {
    el: () => n,
    setTransform: d,
    clearTransform: u,
    currentTransform: () => o,
    borderRadius: () => l,
    layoutRect: () => Z(n),
    boundingRect: () => k(n.getBoundingClientRect()),
    usePlugin: h,
    destroy: s,
    updateElement: c
  };
  function d(f) {
    o = { ...o, ...f }, a();
  }
  function u() {
    o = {
      dragX: 0,
      dragY: 0,
      translateX: 0,
      translateY: 0,
      scaleX: 1,
      scaleY: 1
    }, a();
  }
  function a() {
    const { dragX: f, dragY: m, translateX: v, translateY: g, scaleX: T, scaleY: r } = o;
    f === 0 && m === 0 && v === 0 && g === 0 && T === 1 && r === 1 ? n.style.transform = "" : n.style.transform = `translate(${f + v}px, ${m + g}px) scale(${T}, ${r})`;
  }
  function h(f, m) {
    const v = f(i, m);
    return e.push(v), v;
  }
  function s() {
    e.forEach((f) => f.destroy());
  }
  function c(f) {
    if (!f) return;
    const m = n.style.cssText;
    n = f, n.style.cssText = m, e.forEach((v) => v.onElementUpdate());
  }
  return i;
}
function Ct(t, e, n) {
  return n.map((o) => ({
    slotId: o.slot,
    itemId: o.item,
    item: o.item === "" ? null : t.find((l) => o.item === l[e])
  }));
}
function Rt(t, e) {
  return t.map((n) => ({
    item: n[e],
    slot: n[e]
  }));
}
function Ht(t, e, n, o, l, i = !1) {
  const d = e.filter(
    (h) => !o.some((s) => s.item === h[n])
  ).map((h) => ({
    slot: h[n],
    item: h[n]
  }));
  let u;
  i ? u = o.map((h) => e.some((s) => s[n] === h.item) ? h : { slot: h.slot, item: "" }) : u = o.filter(
    (h) => e.some((s) => s[n] === h.item) || !h.item
  );
  const a = [
    ...u,
    ...d
  ];
  l(a), (d.length > 0 || u.length !== o.length) && requestAnimationFrame(() => {
    t == null || t.update();
  });
}
const jt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dynamicSwapy: Ht,
  initSlotItemMap: Rt,
  toSlottedItems: Ct
}, Symbol.toStringTag, { value: "Module" })), $t = {
  animation: "dynamic",
  enabled: !0,
  swapMode: "hover",
  dragOnHold: !1,
  autoScrollOnDrag: !1,
  dragAxis: "both",
  manualSwap: !1
};
function wt(t) {
  switch (t) {
    case "dynamic":
      return { easing: bt, duration: 300 };
    case "spring":
      return { easing: Mt, duration: 350 };
    case "none":
      return { easing: (e) => e, duration: 1 };
  }
}
function Wt(t, e) {
  const n = { ...$t, ...e }, o = Bt({ slots: [], items: [], config: n });
  let l = [], i = [];
  d();
  function d() {
    if (!Nt(t))
      throw new Error(
        "Cannot create a Swapy instance because your HTML structure is invalid. Fix all above errors and then try!"
      );
    l = Array.from(t.querySelectorAll("[data-swapy-slot]")).map(
      (r) => Ot(r, o)
    ), o.setSlots(l), i = Array.from(t.querySelectorAll("[data-swapy-item]")).map(
      (r) => _t(r, o)
    ), o.setItems(i), o.syncSlotItemMap(), i.forEach((r) => {
      r.onDrag(({ pointerX: I, pointerY: E }) => {
        a();
        let p = !1;
        l.forEach((w) => {
          const A = w.rect();
          st({ x: I, y: E }, A) && (p = !0, w.isHighlighted() || w.highlight());
        }), !p && o.config().swapMode === "drop" && r.slot().highlight(), n.swapMode === "hover" && u(r, { pointerX: I, pointerY: E });
      }), r.onDrop(({ pointerX: I, pointerY: E }) => {
        h(), n.swapMode === "drop" && u(r, { pointerX: I, pointerY: E });
      }), r.onHold(() => {
        a();
      }), r.onRelease(() => {
        h();
      });
    });
  }
  function u(r, { pointerX: I, pointerY: E }) {
    l.forEach((p) => {
      const w = p.rect();
      if (st({ x: I, y: E }, w)) {
        if (r.id() === p.itemId()) return;
        o.config().swapMode === "hover" && r.setContinuousDrag(!0);
        const A = r.slot(), x = p.item();
        if (!o.eventHandlers().onBeforeSwap({
          fromSlot: A.id(),
          toSlot: p.id(),
          draggingItem: r.id(),
          swapWithItem: (x == null ? void 0 : x.id()) || ""
        }))
          return;
        if (o.config().manualSwap) {
          const X = structuredClone(o.slotItemMap());
          o.swapItems(r, p);
          const D = o.slotItemMap(), M = K(r.view());
          M.readInitial();
          const H = x ? K(x.view()) : null;
          H == null || H.readInitial();
          let _ = 0, P = 0;
          const $ = Q(
            r.view().el()
          );
          $ instanceof Window ? (_ = $.scrollY, P = $.scrollX) : (_ = $.scrollTop, P = $.scrollLeft), o.eventHandlers().onSwap({
            oldSlotItemMap: X,
            newSlotItemMap: D,
            fromSlot: A.id(),
            toSlot: p.id(),
            draggingItem: r.id(),
            swappedWithItem: (x == null ? void 0 : x.id()) || ""
          }), requestAnimationFrame(() => {
            const N = t.querySelectorAll("[data-swapy-item]");
            o.items().forEach((y) => {
              const B = Array.from(N).find(
                (L) => L.dataset.swapyItem === y.id()
              );
              y.view().updateElement(B);
            }), o.syncSlotItemMap(), M.readFinalAndReverse(), H == null || H.readFinalAndReverse(), J(r, M), x && H && J(x, H), $.scrollTo({
              left: P,
              top: _
            });
          });
        } else {
          let X = 0, D = 0;
          const M = Q(
            r.view().el()
          );
          M instanceof Window ? (X = M.scrollY, D = M.scrollX) : (X = M.scrollTop, D = M.scrollLeft), ft(r, p, !0), x && ft(x, A), M.scrollTo({
            left: D,
            top: X
          });
          const H = o.slotItemMap();
          o.syncSlotItemMap();
          const _ = o.slotItemMap();
          o.eventHandlers().onSwap({
            oldSlotItemMap: H,
            newSlotItemMap: _,
            fromSlot: A.id(),
            toSlot: p.id(),
            draggingItem: r.id(),
            swappedWithItem: (x == null ? void 0 : x.id()) || ""
          });
        }
      }
    });
  }
  function a() {
    t.querySelectorAll("img").forEach((r) => {
      r.style.pointerEvents = "none";
    }), t.style.userSelect = "none", t.style.webkitUserSelect = "none";
  }
  function h() {
    t.querySelectorAll("img").forEach((r) => {
      r.style.pointerEvents = "";
    }), t.style.userSelect = "", t.style.webkitUserSelect = "";
  }
  function s(r) {
    o.config().enabled = r;
  }
  function c(r) {
    o.eventHandlers().onSwapStart = r;
  }
  function f(r) {
    o.eventHandlers().onSwap = r;
  }
  function m(r) {
    o.eventHandlers().onSwapEnd = r;
  }
  function v(r) {
    o.eventHandlers().onBeforeSwap = r;
  }
  function g() {
    T(), requestAnimationFrame(() => {
      d();
    });
  }
  function T() {
    i.forEach((r) => r.destroy()), l.forEach((r) => r.destroy()), o.destroy(), i = [], l = [];
  }
  return {
    enable: s,
    slotItemMap: () => o.slotItemMap(),
    onSwapStart: c,
    onSwap: f,
    onSwapEnd: m,
    onBeforeSwap: v,
    update: g,
    destroy: T
  };
}
function Bt({
  slots: t,
  items: e,
  config: n
}) {
  const o = {
    slots: t,
    items: e,
    config: n,
    slotItemMap: { asObject: {}, asMap: /* @__PURE__ */ new Map(), asArray: [] },
    zIndexCount: 1,
    eventHandlers: {
      onSwapStart: () => {
      },
      onSwap: () => {
      },
      onSwapEnd: () => {
      },
      onBeforeSwap: () => !0
    },
    scrollOffsetWhileDragging: { x: 0, y: 0 },
    scrollHandler: null
  };
  let l = {
    ...o
  };
  const i = (c) => {
    var f;
    (f = l.scrollHandler) == null || f.call(l, c);
  };
  window.addEventListener("scroll", i);
  function d(c) {
    return l.slots.find((f) => f.id() === c);
  }
  function u(c) {
    return l.items.find((f) => f.id() === c);
  }
  function a() {
    const c = {}, f = /* @__PURE__ */ new Map(), m = [];
    l.slots.forEach((v) => {
      var r;
      const g = v.id(), T = ((r = v.item()) == null ? void 0 : r.id()) || "";
      c[g] = T, f.set(g, T), m.push({ slot: g, item: T });
    }), l.slotItemMap = { asObject: c, asMap: f, asArray: m };
  }
  function h(c, f) {
    var p;
    const m = l.slotItemMap, v = c.id(), g = ((p = f.item()) == null ? void 0 : p.id()) || "", T = f.id(), r = c.slot().id();
    m.asObject[T] = v, m.asObject[r] = g, m.asMap.set(T, v), m.asMap.set(r, g);
    const I = m.asArray.findIndex(
      (w) => w.slot === T
    ), E = m.asArray.findIndex(
      (w) => w.slot === r
    );
    m.asArray[I].item = v, m.asArray[E].item = g;
  }
  function s() {
    window.removeEventListener("scroll", i), l = { ...o };
  }
  return {
    slots: () => l.slots,
    items: () => l.items,
    config: () => n,
    setItems: (c) => l.items = c,
    setSlots: (c) => l.slots = c,
    slotById: d,
    itemById: u,
    zIndex: (c = !1) => c ? ++l.zIndexCount : l.zIndexCount,
    resetZIndex: () => {
      l.zIndexCount = 1;
    },
    eventHandlers: () => l.eventHandlers,
    syncSlotItemMap: a,
    slotItemMap: () => l.slotItemMap,
    onScroll: (c) => {
      l.scrollHandler = c;
    },
    swapItems: h,
    destroy: s
  };
}
function Ot(t, e) {
  const n = mt(t);
  function o() {
    return n.el().dataset.swapySlot;
  }
  function l() {
    const s = n.el().children[0];
    return (s == null ? void 0 : s.dataset.swapyItem) || null;
  }
  function i() {
    return k(n.el().getBoundingClientRect());
  }
  function d() {
    const s = n.el().children[0];
    if (s)
      return e.itemById(s.dataset.swapyItem);
  }
  function u() {
    e.slots().forEach((s) => {
      s.view().el().removeAttribute("data-swapy-highlighted");
    });
  }
  function a() {
    u(), n.el().setAttribute("data-swapy-highlighted", "");
  }
  function h() {
  }
  return {
    id: o,
    view: () => n,
    itemId: l,
    rect: i,
    item: d,
    highlight: a,
    unhighlightAllSlots: u,
    isHighlighted: () => n.el().hasAttribute("data-swapy-highlighted"),
    destroy: h
  };
}
function _t(t, e) {
  const n = mt(t), o = {};
  let l = null, i = null, d = !1, u = !0, a;
  const h = Pt();
  let s = () => {
  }, c = () => {
  }, f = () => {
  }, m = () => {
  };
  const { onDrag: v, onDrop: g, onHold: T, onRelease: r } = n.usePlugin(Dt, {
    startDelay: e.config().dragOnHold ? 400 : 0
  }), I = R(0, 0), E = R(0, 0), p = R(0, 0), w = R(0, 0);
  let A = null, x = null;
  T((S) => {
    e.config().enabled && (N() && !$(S.el) || L() && B(S.el) || f == null || f(S));
  }), r((S) => {
    e.config().enabled && (N() && !$(S.el) || L() && B(S.el) || m == null || m(S));
  });
  function X(S) {
    var Y;
    q(), G().highlight(), (Y = o.drop) == null || Y.call(o), e.slots().forEach((O) => {
      const F = O.view().boundingRect();
      O.view().el().style.width = `${F.width}px`, O.view().el().style.flexShrink = "0", O.view().el().style.height = `${F.height}px`;
    });
    const b = e.slotItemMap();
    e.eventHandlers().onSwapStart({
      draggingItem: tt(),
      fromSlot: et(),
      slotItemMap: b
    }), i = b, n.el().style.position = "relative", n.el().style.zIndex = `${e.zIndex(!0)}`, A = Q(S.el), e.config().autoScrollOnDrag && (l = Ft(
      A,
      e.config().dragAxis
    ), l.updatePointer({
      x: S.pointerX,
      y: S.pointerY
    })), I.x = window.scrollX, I.y = window.scrollY, p.x = 0, p.y = 0, A instanceof HTMLElement && (E.x = A.scrollLeft, E.y = A.scrollTop, x = () => {
      w.x = A.scrollLeft - E.x, w.y = A.scrollTop - E.y, n.setTransform({
        dragX: ((a == null ? void 0 : a.width) || 0) + p.x + w.x,
        dragY: ((a == null ? void 0 : a.height) || 0) + p.y + w.y
      });
    }, A.addEventListener("scroll", x)), e.onScroll(() => {
      p.x = window.scrollX - I.x, p.y = window.scrollY - I.y;
      const O = w.x || 0, F = w.y || 0;
      n.setTransform({
        dragX: ((a == null ? void 0 : a.width) || 0) + p.x + O,
        dragY: ((a == null ? void 0 : a.height) || 0) + p.y + F
      });
    });
  }
  v((S) => {
    var b;
    if (e.config().enabled) {
      if (!d) {
        if (N() && !$(S.el) || L() && B(S.el))
          return;
        X(S);
      }
      d = !0, l && l.updatePointer({
        x: S.pointerX,
        y: S.pointerY
      }), a = S, (b = o.drop) == null || b.call(o), h(() => {
        n.el().style.position = "relative";
        const Y = S.width + p.x + w.x, O = S.height + p.y + w.y;
        e.config().dragAxis === "y" ? n.setTransform({
          dragY: O
        }) : e.config().dragAxis === "x" ? n.setTransform({
          dragX: Y
        }) : n.setTransform({
          dragX: Y,
          dragY: O
        }), s == null || s(S);
      });
    }
  }), g((S) => {
    if (!d) return;
    U(), d = !1, u = !1, a = null, A && (A.removeEventListener("scroll", x), x = null), A = null, w.x = 0, w.y = 0, p.x = 0, p.y = 0, l && (l.destroy(), l = null), G().unhighlightAllSlots(), c == null || c(S), e.eventHandlers().onSwapEnd({
      slotItemMap: e.slotItemMap(),
      hasChanged: i != null && i.asMap ? !qt(
        i == null ? void 0 : i.asMap,
        e.slotItemMap().asMap
      ) : !1
    }), i = null, e.onScroll(null), e.slots().forEach((Y) => {
      Y.view().el().style.width = "", Y.view().el().style.flexShrink = "", Y.view().el().style.height = "";
    }), e.config().manualSwap && e.config().swapMode === "drop" ? requestAnimationFrame(b) : b();
    function b() {
      const Y = n.currentTransform(), O = Y.dragX + Y.translateX, F = Y.dragY + Y.translateY;
      o.drop = yt(
        { translate: R(O, F) },
        { translate: R(0, 0) },
        ({ translate: nt }, ot) => {
          ot ? d || (n.clearTransform(), n.el().style.transformOrigin = "") : n.setTransform({
            dragX: 0,
            dragY: 0,
            translateX: nt.x,
            translateY: nt.y
          }), ot && (e.items().forEach((lt) => {
            lt.isDragging() || (lt.view().el().style.zIndex = "");
          }), e.resetZIndex(), n.el().style.position = "", u = !0);
        },
        wt(e.config().animation)
      );
    }
  });
  function D(S) {
    s = S;
  }
  function M(S) {
    c = S;
  }
  function H(S) {
    f = S;
  }
  function _(S) {
    m = S;
  }
  function P() {
    return n.el().querySelector("[data-swapy-handle]");
  }
  function $(S) {
    const b = P();
    return b ? b === S || b.contains(S) : !1;
  }
  function N() {
    return P() !== null;
  }
  function y() {
    return Array.from(n.el().querySelectorAll("[data-swapy-no-drag]"));
  }
  function B(S) {
    const b = y();
    return !b || b.length === 0 ? !1 : b.includes(S) || b.some((Y) => Y.contains(S));
  }
  function L() {
    return y().length > 0;
  }
  function q() {
    n.el().setAttribute("data-swapy-dragging", "");
  }
  function U() {
    n.el().removeAttribute("data-swapy-dragging");
  }
  function St() {
    s = null, c = null, f = null, m = null, a = null, i = null, l && (l.destroy(), l = null), A && x && A.removeEventListener("scroll", x), n.destroy();
  }
  function tt() {
    return n.el().dataset.swapyItem;
  }
  function G() {
    return e.slotById(n.el().parentElement.dataset.swapySlot);
  }
  function et() {
    return n.el().parentElement.dataset.swapySlot;
  }
  return {
    id: tt,
    view: () => n,
    slot: G,
    slotId: et,
    onDrag: D,
    onDrop: M,
    onHold: H,
    onRelease: _,
    destroy: St,
    isDragging: () => d,
    cancelAnimation: () => o,
    dragEvent: () => a,
    store: () => e,
    continuousDrag: () => u,
    setContinuousDrag: (S) => u = S
  };
}
function ft(t, e, n = !1) {
  if (n) {
    const l = e.item();
    l && (e.view().el().style.position = "relative", l.view().el().style.position = "absolute");
  } else {
    const l = t.slot();
    l.view().el().style.position = "", t.view().el().style.position = "";
  }
  if (!t)
    return;
  const o = K(t.view());
  o.readInitial(), e.view().el().appendChild(t.view().el()), o.readFinalAndReverse(), J(t, o);
}
function Pt() {
  let t = !1;
  return (e) => {
    t || (t = !0, requestAnimationFrame(() => {
      e(), t = !1;
    }));
  };
}
function J(t, e) {
  var u, a, h, s;
  (a = (u = t.cancelAnimation()).moveToSlot) == null || a.call(u), (s = (h = t.cancelAnimation()).drop) == null || s.call(h);
  const n = wt(t.store().config().animation), o = e.transitionValues();
  let l = t.view().currentTransform(), i = 0, d = !1;
  t.cancelAnimation().moveToSlot = yt(
    {
      translate: o.from.translate,
      scale: o.from.scale,
      borderRadius: o.from.borderRadius
    },
    {
      translate: o.to.translate,
      scale: o.to.scale,
      borderRadius: o.to.borderRadius
    },
    ({ translate: c, scale: f, borderRadius: m }, v, g) => {
      if (t.isDragging()) {
        i !== 0 && (d = !0);
        const r = t.dragEvent().relativeX, I = t.dragEvent().relativeY;
        t.continuousDrag() ? t.view().setTransform({
          translateX: C(
            l.translateX,
            l.translateX + (o.from.width - o.to.width) * r,
            n.easing(g - i)
          ),
          translateY: C(
            l.translateY,
            l.translateY + (o.from.height - o.to.height) * I,
            n.easing(g - i)
          ),
          scaleX: f.x,
          scaleY: f.y
        }) : t.view().setTransform({ scaleX: f.x, scaleY: f.y });
      } else
        l = t.view().currentTransform(), i = g, d ? t.view().setTransform({
          scaleX: f.x,
          scaleY: f.y
        }) : t.view().setTransform({
          dragX: 0,
          dragY: 0,
          translateX: c.x,
          translateY: c.y,
          scaleX: f.x,
          scaleY: f.y
        });
      const T = e.childrenTransitionData();
      T.forEach(
        ({
          el: r,
          fromTranslate: I,
          fromScale: E,
          fromBorderRadius: p,
          toBorderRadius: w,
          parentScale: A
        }) => {
          const x = C(
            A.x,
            1,
            n.easing(g)
          ), X = C(
            A.y,
            1,
            n.easing(g)
          );
          r.style.transform = `translate(${I.x + (0 - I.x / x) * n.easing(g)}px, ${I.y + (0 - I.y / X) * n.easing(g)}px) scale(${C(
            E.x / x,
            1 / x,
            n.easing(g)
          )}, ${C(
            E.y / X,
            1 / X,
            n.easing(g)
          )})`, it(p) || (r.style.borderRadius = z(
            pt(
              p,
              w,
              n.easing(g)
            )
          ));
        }
      ), it(m) || (t.view().el().style.borderRadius = z(m)), v && (t.isDragging() || (t.view().el().style.transformOrigin = "", t.view().clearTransform()), t.view().el().style.borderRadius = "", T.forEach(({ el: r }) => {
        r.style.transform = "", r.style.transformOrigin = "", r.style.borderRadius = "";
      }));
    },
    n
  );
}
function j(...t) {
  console.error("Swapy Error:", ...t);
}
function Nt(t) {
  const e = t;
  let n = !0;
  const o = e.querySelectorAll("[data-swapy-slot]");
  e || (j("container passed to createSwapy() is undefined or null"), n = !1), o.forEach((u) => {
    const a = u, h = a.dataset.swapySlot, s = a.children, c = s[0];
    (!h || h.length === 0) && (j(a, "does not contain a slotId using data-swapy-slot"), n = !1), s.length > 1 && (j("slot:", `"${h}"`, "cannot contain more than one element"), n = !1), c && (!c.dataset.swapyItem || c.dataset.swapyItem.length === 0) && (j(
      "slot",
      `"${h}"`,
      "does not contain an element with an item id using data-swapy-item"
    ), n = !1);
  });
  const l = Array.from(o).map(
    (u) => u.dataset.swapySlot
  ), i = e.querySelectorAll("[data-swapy-item]"), d = Array.from(i).map(
    (u) => u.dataset.swapyItem
  );
  if (ut(l)) {
    const u = dt(l);
    j(
      "your container has duplicate slot ids",
      `(${u.join(", ")})`
    ), n = !1;
  }
  if (ut(d)) {
    const u = dt(d);
    j(
      "your container has duplicate item ids",
      `(${u.join(", ")})`
    ), n = !1;
  }
  return n;
}
function ut(t) {
  return new Set(t).size !== t.length;
}
function dt(t) {
  const e = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set();
  for (const o of t)
    e.has(o) ? n.add(o) : e.add(o);
  return Array.from(n);
}
function qt(t, e) {
  if (t.size !== e.size) return !1;
  for (const [n, o] of t)
    if (e.get(n) !== o) return !1;
  return !0;
}
function Q(t) {
  let e = t;
  for (; e; ) {
    const n = window.getComputedStyle(e), o = n.overflowY, l = n.overflowX;
    if ((o === "auto" || o === "scroll") && e.scrollHeight > e.clientHeight || (l === "auto" || l === "scroll") && e.scrollWidth > e.clientWidth)
      return e;
    e = e.parentElement;
  }
  return window;
}
function Ft(t, e) {
  let l = !1, i, d = 0, u = 0, a = 0, h = 0, s = 0, c = 0, f = null;
  t instanceof HTMLElement ? (i = k(t.getBoundingClientRect()), d = t.scrollHeight - i.height, u = t.scrollWidth - i.width) : (i = {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight
  }, d = document.documentElement.scrollHeight - window.innerHeight, u = document.documentElement.scrollWidth - window.innerWidth);
  function m() {
    t instanceof HTMLElement ? (a = t.scrollTop, h = t.scrollLeft) : (a = window.scrollY, h = window.scrollX);
  }
  function v(r) {
    l = !1;
    const I = i.y, E = i.y + i.height, p = i.x, w = i.x + i.width, A = Math.abs(I - r.y) < Math.abs(E - r.y), x = Math.abs(p - r.x) < Math.abs(w - r.x);
    if (m(), e !== "x")
      if (A) {
        const X = I - r.y;
        if (X >= -100) {
          const D = W(X, -100, 0);
          s = -V(-100, 0, 0, 5, D), l = !0;
        }
      } else {
        const X = E - r.y;
        if (X <= 100) {
          const D = W(X, 0, 100);
          s = V(100, 0, 0, 5, D), l = !0;
        }
      }
    if (e !== "y")
      if (x) {
        const X = p - r.x;
        if (X >= -100) {
          const D = W(X, -100, 0);
          c = -V(-100, 0, 0, 5, D), l = !0;
        }
      } else {
        const X = w - r.x;
        if (X <= 100) {
          const D = W(X, 0, 100);
          c = V(100, 0, 0, 5, D), l = !0;
        }
      }
    l && (f && cancelAnimationFrame(f), g());
  }
  function g() {
    m(), e !== "x" && (s = a + s >= d ? 0 : s), e !== "y" && (c = h + c >= u ? 0 : c), t.scrollBy({ top: s, left: c }), l && (f = requestAnimationFrame(g));
  }
  function T() {
    l = !1;
  }
  return {
    updatePointer: v,
    destroy: T
  };
}
export {
  Wt as createSwapy,
  Q as getClosestScrollableContainer,
  jt as utils
};
