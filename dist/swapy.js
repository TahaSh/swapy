var Ot = Object.defineProperty;
var Wt = (n, t, e) => t in n ? Ot(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var R = (n, t, e) => Wt(n, typeof t != "symbol" ? t + "" : t, e);
function Ct(n, t) {
  if (n.size !== t.size)
    return !1;
  for (let [e, i] of n)
    if (!t.has(e) || t.get(e) !== i)
      return !1;
  return !0;
}
let Dt = 0;
function qt() {
  return Dt++ + "";
}
var Ut = Object.defineProperty, Ht = (n, t, e) => t in n ? Ut(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e, a = (n, t, e) => (Ht(n, typeof t != "symbol" ? t + "" : t, e), e);
class Y {
  constructor(t) {
    a(this, "x"), a(this, "y"), a(this, "target"), this.x = t.x, this.y = t.y, this.target = t.target;
  }
}
class Nt extends Y {
}
class et extends Y {
}
class it extends Y {
}
class st extends Y {
}
class Lt {
  constructor(t) {
    a(this, "pluginId"), a(this, "pluginName"), a(this, "viewName"), a(this, "dataName"), a(this, "dataValue"), this.event = t, this.pluginId = t.pluginId, this.pluginName = t.pluginName, this.viewName = t.viewName, this.dataName = t.dataName, this.dataValue = t.dataValue;
  }
}
function Yt(n) {
  return n.replace(/(?:^\w|[A-Z]|\b\w)/g, function(t, e) {
    return e === 0 ? t.toLowerCase() : t.toUpperCase();
  }).replace(/\s+/g, "").replace(/-+/g, "");
}
function yt(n) {
  return n.split("").map((t, e) => t.toUpperCase() === t ? `${e !== 0 ? "-" : ""}${t.toLowerCase()}` : t).join("");
}
class q {
  constructor(t) {
    a(this, "node"), this.node = t.node;
  }
}
class G {
  constructor(t) {
    a(this, "node"), this.node = t.node;
  }
}
class Xt {
  constructor(t) {
    a(this, "_eventBus"), a(this, "_observer"), this._eventBus = t, this._observer = new MutationObserver(this._handler.bind(this)), this._observer.observe(document.body, {
      childList: !0,
      subtree: !0,
      attributes: !0,
      attributeOldValue: !0
    });
  }
  _handler(t) {
    t.forEach((e) => {
      e.addedNodes.forEach((r) => {
        if (!(r instanceof HTMLElement) || r.dataset.velViewId || r.parentElement && typeof r.parentElement.dataset.velAdded < "u")
          return;
        let s = r;
        if (r.dataset.velView || (s = r.querySelector("[data-vel-view][data-vel-plugin]")), !s)
          return;
        this._eventBus.emitEvent(q, { node: s });
        const o = s.querySelectorAll("[data-vel-plugin]");
        o.length && o.forEach((l) => {
          this._eventBus.emitEvent(q, { node: l });
        });
      }), e.removedNodes.forEach((r) => {
        if (!(r instanceof HTMLElement) || typeof r.dataset.velProcessing < "u")
          return;
        const s = r.querySelectorAll("[data-vel-plugin]");
        s.length && s.forEach((o) => {
          this._eventBus.emitEvent(G, { node: o });
        }), this._eventBus.emitEvent(G, { node: r });
      });
      const i = e.attributeName;
      if (i === "data-vel-view" && this._eventBus.emitEvent(q, {
        node: e.target
      }), i && /data-vel-data-.+/gi.test(i)) {
        const r = e.target, s = r.dataset.velPluginId || "", o = r.dataset.velPlugin || "", l = r.dataset.velView || "", h = r.getAttribute(i);
        if (h && h !== e.oldValue) {
          const d = Yt(
            i.replace("data-vel-data-", "")
          );
          this._eventBus.emitEvent(Lt, {
            pluginId: s,
            pluginName: o,
            viewName: l,
            dataName: d,
            dataValue: h
          });
        }
      }
    });
  }
}
class jt {
  execute(t) {
    this.call(t);
  }
}
class Vt extends jt {
  constructor(t) {
    super(), a(this, "_handler"), this._handler = t;
  }
  getHandler() {
    return this._handler;
  }
  call(t) {
    this._handler(t);
  }
}
class Z {
  constructor() {
    a(this, "_listeners", /* @__PURE__ */ new Map()), a(this, "_keyedListeners", /* @__PURE__ */ new Map());
  }
  subscribeToEvent(t, e, i) {
    if (i) {
      this._subscribeToKeyedEvent(t, e, i);
      return;
    }
    let r = this._listeners.get(t);
    r || (r = [], this._listeners.set(t, r)), r.push(new Vt(e));
  }
  removeEventListener(t, e, i) {
    if (i) {
      this._removeKeyedEventListener(t, e, i);
      return;
    }
    let r = this._listeners.get(t);
    r && (r = r.filter(
      (s) => s.getHandler() !== e
    ), this._listeners.set(t, r));
  }
  _subscribeToKeyedEvent(t, e, i) {
    let r = this._keyedListeners.get(t);
    r || (r = /* @__PURE__ */ new Map(), this._keyedListeners.set(t, r));
    let s = r.get(i);
    s || (s = [], r.set(i, s)), s.push(new Vt(e));
  }
  _removeKeyedEventListener(t, e, i) {
    let r = this._keyedListeners.get(t);
    if (!r)
      return;
    let s = r.get(i);
    s && (s = s.filter(
      (o) => o.getHandler() !== e
    ), r.set(i, s));
  }
  emitEvent(t, e, i) {
    if (i) {
      this._emitKeyedEvent(t, e, i);
      return;
    }
    const r = this._listeners.get(t);
    r && r.forEach((s) => {
      s.execute(e);
    });
  }
  _emitKeyedEvent(t, e, i) {
    const r = this._keyedListeners.get(t);
    if (!r)
      return;
    const s = r.get(i);
    s && s.forEach((o) => {
      o.execute(e);
    });
  }
  _convertListener(t) {
    return (e) => t(e);
  }
  subscribeToPluginReadyEvent(t, e, i = !1) {
    if (i) {
      this.subscribeToEvent(
        It,
        this._convertListener(t),
        e
      );
      return;
    }
    this.subscribeToEvent(
      Tt,
      this._convertListener(t),
      e
    );
  }
  emitPluginReadyEvent(t, e, i = !1) {
    if (i) {
      this.emitEvent(
        It,
        e,
        t
      );
      return;
    }
    this.emitEvent(
      Tt,
      e,
      t
    );
  }
  reset() {
    this._listeners.clear();
  }
}
let Kt = 0;
function St() {
  return Kt++ + "";
}
class Bt {
  constructor(t, e, i, r, s, o, l) {
    a(this, "_registry"), a(this, "_eventBus"), a(this, "_appEventBus"), a(this, "_internalEventBus"), a(this, "_initialized", !1), a(this, "_config"), a(this, "_pluginFactory"), a(this, "_pluginName"), a(this, "_id"), a(this, "_pluginKey"), a(this, "_layoutIdViewMapWaitingToEnter"), a(this, "_apiData"), a(this, "_isReady", !1), this._id = St(), this._pluginFactory = t, this._pluginName = e, this._registry = i, this._eventBus = r, this._appEventBus = s, this._internalEventBus = new Z(), this._config = o, this._layoutIdViewMapWaitingToEnter = /* @__PURE__ */ new Map(), this._pluginKey = l, this._apiData = {}, this._appEventBus.subscribeToPluginReadyEvent(
      () => {
        this._isReady = !0;
      },
      this._pluginName,
      !0
    );
  }
  get api() {
    return this._apiData;
  }
  _setApi(t) {
    this._apiData = t;
  }
  get pluginName() {
    return this._pluginName;
  }
  get pluginFactory() {
    return this._pluginFactory;
  }
  get pluginKey() {
    return this._pluginKey;
  }
  get id() {
    return this._id;
  }
  get config() {
    return { ...this._config };
  }
  getViews(t) {
    return t ? this._registry.getViewsByNameForPlugin(this, t) : this._registry.getViewsForPlugin(this);
  }
  getView(t) {
    return t ? this._registry.getViewsByNameForPlugin(this, t)[0] : this._registry.getViewsForPlugin(this)[0];
  }
  getViewById(t) {
    return this._registry.getViewById(t);
  }
  addView(t) {
    this._registry.assignViewToPlugin(t, this);
  }
  setInternalEventBus(t) {
    this._internalEventBus = t;
  }
  get internalBusEvent() {
    return this._internalEventBus;
  }
  emit(t, e) {
    this._internalEventBus.emitEvent(t, e);
  }
  on(t, e) {
    this._internalEventBus.subscribeToEvent(t, e);
  }
  removeListener(t, e) {
    this._internalEventBus.removeEventListener(t, e);
  }
  useEventPlugin(t, e = {}) {
    const i = this._registry.createPlugin(
      t,
      this._eventBus,
      e
    );
    return this._registry.associateEventPluginWithPlugin(this.id, i.id), i;
  }
  notifyAboutDataChanged(t) {
    this.onDataChanged(t);
  }
  // @ts-ignore
  onDataChanged(t) {
  }
  removeView(t) {
    t.onRemoveCallback ? this._invokeRemoveCallback(t) : this._deleteView(t), this.onViewRemoved(t);
  }
  _invokeRemoveCallback(t) {
    const e = this._createTemporaryView(t);
    requestAnimationFrame(() => {
      var i;
      (i = e.onRemoveCallback) == null || i.call(e, e, () => {
        var r, s;
        if ((r = t.onAddCallbacks) != null && r.afterRemoved && t.layoutId) {
          const o = this._layoutIdViewMapWaitingToEnter.get(
            t.layoutId
          );
          (s = o == null ? void 0 : o.onAddCallbacks) == null || s.afterEnter(o), this._layoutIdViewMapWaitingToEnter.delete(t.layoutId);
        }
        this._deleteView(e, !0);
      }), setTimeout(() => {
        e.element.parentElement && this._deleteView(e, !0);
      }, 1e4);
    });
  }
  _deleteView(t, e = !1) {
    (e || !t.layoutId) && (this._registry.removeViewById(t.id, this.id), t.element.remove());
  }
  // This is a temporary view for deleted view. We need to create it
  // to show it again so the user can animate it before it disappears.
  _createTemporaryView(t) {
    const e = t.previousRect.viewportOffset, i = t.previousRect.size, r = t.rotation.degrees < 0 ? 0 : Math.sin(t.rotation.radians) * i.height * t.scale.y, s = t.rotation.degrees > 0 ? 0 : Math.sin(t.rotation.radians) * i.width * t.scale.y, o = t.element.cloneNode(!0);
    t.element.remove(), o.style.cssText = "", o.style.position = "absolute", o.style.left = `${e.left + r}px`, o.style.top = `${e.top - s}px`, o.style.width = `${i.width}px`, o.style.height = `${i.height}px`, o.style.transform = `
      scale3d(${t.scale.x}, ${t.scale.y}, 1) rotate(${t.rotation.degrees}deg)
    `, o.style.pointerEvents = "none", o.dataset.velRemoved = "", document.body.appendChild(o);
    const l = this._registry.createView(o, t.name);
    return l.setAsTemporaryView(), l.styles.position = "absolute", l.styles.left = `${e.left + r}px`, l.styles.top = `${e.top - s}px`, l.rotation.setDegrees(t.rotation.degrees, !1), l.scale.set({ x: t.scale.x, y: t.scale.y }, !1), l.size.set(
      { width: t._localWidth, height: t._localHeight },
      !1
    ), t._copyAnimatorsToAnotherView(l), t.onRemoveCallback && l.onRemove(t.onRemoveCallback), l;
  }
  // @ts-ignore
  onViewRemoved(t) {
  }
  notifyAboutViewAdded(t) {
    this.onViewAdded(t), this._invokeAddCallbacks(t);
  }
  _invokeAddCallbacks(t) {
    var e, i, r;
    !((e = t.onAddCallbacks) != null && e.onInitialLoad) && !this._initialized || ((i = t.onAddCallbacks) == null || i.beforeEnter(t), !((r = t.onAddCallbacks) != null && r.afterRemoved) || !this._initialized ? requestAnimationFrame(() => {
      var s;
      (s = t.onAddCallbacks) == null || s.afterEnter(t);
    }) : t.layoutId && this._layoutIdViewMapWaitingToEnter.set(t.layoutId, t));
  }
  // @ts-ignore
  onViewAdded(t) {
  }
  init() {
    !this._initialized && this._isReady && (this.setup(), this._initialized = !0);
  }
  setup() {
  }
  // @ts-ignore
  subscribeToEvents(t) {
  }
}
class Gt extends Bt {
  isRenderable() {
    return !0;
  }
  isInitialized() {
    return this._initialized;
  }
  get initialized() {
    return this._initialized;
  }
  // @ts-ignore
  update(t, e) {
  }
  render() {
  }
  addView(t) {
    t.setPluginId(this.id), super.addView(t);
  }
}
class rt extends Bt {
  isRenderable() {
    return !1;
  }
}
class Zt {
  constructor(t) {
    a(this, "_plugin"), this._plugin = t;
  }
  get initialized() {
    return this._plugin.isInitialized();
  }
  get config() {
    return this._plugin.config;
  }
  setup(t) {
    this._plugin.setup = t;
  }
  api(t) {
    this._plugin._setApi(t);
  }
  update(t) {
    this._plugin.update = t;
  }
  render(t) {
    this._plugin.render = t;
  }
  getViews(t) {
    return this._plugin.getViews(t);
  }
  getView(t) {
    return this._plugin.getView(t);
  }
  getViewById(t) {
    return this._plugin.getViewById(t);
  }
  useEventPlugin(t, e = {}) {
    return this._plugin.useEventPlugin(t, e);
  }
  emit(t, e) {
    this._plugin.emit(t, e);
  }
  on(t, e) {
    this._plugin.on(t, e);
  }
  onDataChanged(t) {
    this._plugin.onDataChanged = t;
  }
  onViewRemoved(t) {
    this._plugin.onViewRemoved = t;
  }
  onViewAdded(t) {
    this._plugin.onViewAdded = t;
  }
  subscribeToEvents(t) {
    this._plugin.subscribeToEvents = t;
  }
}
function j(n, t, e, i, r, s) {
  if (Jt(n))
    return new n(
      n,
      n.pluginName,
      t,
      e,
      i,
      r,
      s
    );
  const o = new Gt(
    n,
    n.pluginName,
    t,
    e,
    i,
    r,
    s
  ), l = new Zt(o);
  return n(l), o;
}
function Jt(n) {
  var t;
  return ((t = n.prototype) == null ? void 0 : t.constructor.toString().indexOf("class ")) === 0;
}
class u {
  constructor(t, e) {
    a(this, "x"), a(this, "y"), this.x = t, this.y = e;
  }
  get magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }
  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  get unitVector() {
    const t = new u(0, 0), e = this.magnitude;
    return e !== 0 && (t.x = this.x / e, t.y = this.y / e), t;
  }
  add(t) {
    this.x += t.x, this.y += t.y;
  }
  sub(t) {
    this.x -= t.x, this.y -= t.y;
  }
  scale(t) {
    this.x *= t, this.y *= t;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y;
  }
  equals(t) {
    return this.x === t.x && this.y === t.y;
  }
  clone() {
    return new u(this.x, this.y);
  }
  static scale(t, e) {
    return new u(t.x * e, t.y * e);
  }
  static sub(t, e) {
    return new u(t.x - e.x, t.y - e.y);
  }
  static add(t, e) {
    return new u(t.x + e.x, t.y + e.y);
  }
}
class Qt {
  constructor(t) {
    a(this, "_element"), a(this, "_callback"), this._element = t, this._observe();
  }
  setElement(t) {
    this._element = t, this._observe();
  }
  _observe() {
    var t;
    const e = new MutationObserver(() => {
      var s;
      (s = this._callback) == null || s.call(this, !1);
    }), i = {
      attributes: !0,
      childList: !0,
      attributeOldValue: !0
    };
    e.observe(this._element, i), new ResizeObserver(() => {
      var s;
      (s = this._callback) == null || s.call(this, !0);
    }).observe(this._element);
    function r(s, o) {
      let l, h = !0;
      return function() {
        h && (s(), h = !1), clearTimeout(l), l = setTimeout(() => {
          s(), h = !0;
        }, o);
      };
    }
    (t = this._element.parentElement) == null || t.addEventListener(
      "scroll",
      r(() => {
        var s;
        (s = this._callback) == null || s.call(this, !0);
      }, 30)
    ), window.addEventListener(
      "scroll",
      r(() => {
        var s;
        (s = this._callback) == null || s.call(this, !0);
      }, 30)
    ), window.addEventListener(
      "resize",
      r(() => {
        var s;
        (s = this._callback) == null || s.call(this, !0);
      }, 30)
    );
  }
  onChange(t) {
    this._callback = t;
  }
}
function te(n) {
  return new Qt(n);
}
function ee(n, t) {
  const e = t.x - n.x, i = t.y - n.y;
  return Math.sqrt(e * e + i * i);
}
function _(n, t) {
  const e = n - t;
  return Math.abs(e) <= 0.01;
}
function V(n) {
  let t = n.match(/^([\d.]+)([a-zA-Z%]*)$/);
  t || (t = "0px".match(/^([\d.]+)([a-zA-Z%]*)$/));
  const e = parseFloat(t[1]), i = t[2];
  return { value: e, unit: i, valueWithUnit: n };
}
function ie(n, t, e = !1) {
  if (n === t)
    return !0;
  if (n.length !== t.length)
    return !1;
  for (let i = 0; i < n.length; i++)
    if (e && !_(n[i].value, t[i].value) || n[i].value !== t[i].value)
      return !1;
  return !0;
}
function Pt(n, t) {
  return ie(n, t, !0);
}
class B {
  constructor(t, e, i, r) {
    a(this, "_topLeft"), a(this, "_topRight"), a(this, "_bottomLeft"), a(this, "_bottomRight"), this._topLeft = t, this._topRight = e, this._bottomLeft = i, this._bottomRight = r;
  }
  get value() {
    return {
      topLeft: this._topLeft,
      topRight: this._topRight,
      bottomRight: this._bottomRight,
      bottomLeft: this._bottomLeft
    };
  }
  equals(t) {
    return _(this.value.topLeft.value, t.value.topLeft.value) && _(this.value.topRight.value, t.value.topRight.value) && _(this.value.bottomRight.value, t.value.bottomRight.value) && _(this.value.bottomLeft.value, t.value.bottomLeft.value);
  }
  toCssPercentageForNewSize(t) {
    const e = this._convertToPercentage(this._topLeft, t), i = this._convertToPercentage(this._topRight, t), r = this._convertToPercentage(this._bottomLeft, t), s = this._convertToPercentage(this._bottomRight, t);
    return `${e.h} ${i.h} ${s.h} ${r.h} / ${e.v} ${i.v} ${s.v} ${r.v}`;
  }
  _convertToPercentage(t, e) {
    if (t.unit === "%")
      return { h: `${t.value}%`, v: `${t.value}%` };
    const i = t.value / e.width * 100, r = t.value / e.height * 100;
    return { h: `${i}%`, v: `${r}%` };
  }
}
function J(n) {
  const t = n.split(" ").map((i) => V(i)), e = {
    value: 0,
    unit: "",
    valueWithUnit: "0"
  };
  switch (t.length) {
    case 1:
      return new B(t[0], t[0], t[0], t[0]);
    case 2:
      return new B(t[0], t[1], t[0], t[1]);
    case 3:
      return new B(t[0], t[1], t[2], t[1]);
    case 4:
      return new B(t[0], t[1], t[3], t[2]);
    default:
      return new B(
        e,
        e,
        e,
        e
      );
  }
}
function se(n, t) {
  const e = o(n.topLeft, t), i = o(n.topRight, t), r = o(n.bottomLeft, t), s = o(n.bottomRight, t);
  return {
    v: {
      topLeft: e.v,
      topRight: i.v,
      bottomRight: s.v,
      bottomLeft: r.v
    },
    h: {
      topLeft: e.h,
      topRight: i.h,
      bottomRight: s.h,
      bottomLeft: r.h
    }
  };
  function o(l, h) {
    if (l.unit === "%")
      return {
        h: V(`${l.value}%`),
        v: V(`${l.value}%`)
      };
    const d = l.value / h.width * 100, c = l.value / h.height * 100;
    return { h: V(`${d}%`), v: V(`${c}%`) };
  }
}
function bt(n, t) {
  return _(n.topLeft.value, t.topLeft.value) && _(n.topRight.value, t.topRight.value) && _(n.bottomRight.value, t.bottomRight.value) && _(n.bottomLeft.value, t.bottomLeft.value);
}
class re {
  constructor(t) {
    a(this, "_value"), this._value = t;
  }
  get value() {
    return this._value;
  }
  equals(t) {
    return _(this.value, t.value);
  }
}
function ne(n) {
  return new re(parseFloat(n));
}
class ae {
  constructor(t, e) {
    a(this, "_x"), a(this, "_y"), this._x = t, this._y = e;
  }
  get value() {
    return new u(this._x, this._y);
  }
}
function oe(n, t) {
  const [e, i] = n.split(" "), r = V(e), s = V(i);
  return new ae(
    r.value / t.width,
    s.value / t.height
  );
}
function Et(n, t) {
  const e = le(n), i = n.offsetWidth, r = n.offsetHeight;
  return {
    viewportOffset: {
      left: Math.round(e.left),
      top: Math.round(e.top),
      right: Math.round(e.right),
      bottom: Math.round(e.bottom)
    },
    pageOffset: t.read({
      width: i,
      height: r
    }),
    size: {
      width: i,
      height: r
    }
  };
}
function le(n) {
  const t = n.getBoundingClientRect();
  return {
    left: t.left,
    top: t.top,
    right: t.right,
    bottom: t.bottom,
    width: t.width,
    height: t.height
  };
}
function Rt(n) {
  let t = n, e = 0, i = 0;
  for (; t; )
    e += t.offsetTop, i += t.offsetLeft, t = t.offsetParent;
  return { top: e, left: i };
}
class he {
  constructor(t) {
    a(this, "_currentPageRect"), a(this, "_view"), a(this, "_element"), a(this, "_offsetLeft"), a(this, "_offsetTop"), a(this, "_width"), a(this, "_height"), a(this, "_parentWidth"), a(this, "_parentHeight"), a(this, "_parentEl"), a(this, "_isSvg"), a(this, "_invalid"), this._invalid = !0, this._view = t, this._element = t.element, this._isSvg = !!this._element.closest("svg"), this._offsetLeft = 0, this._offsetTop = 0, this._width = 0, this._height = 0, this._parentWidth = 0, this._parentHeight = 0, this._offsetLeft = 0, this._parentEl = this._element.parentElement, window.addEventListener("resize", () => {
      this.invalidate();
    });
  }
  invalidate() {
    this._invalid = !0;
  }
  read(t) {
    if (this._isSvg)
      return this._currentPageRect || (this._currentPageRect = Rt(this._element)), this._currentPageRect;
    const e = this._element.parentElement, i = this._element.offsetLeft, r = this._element.offsetTop, s = t.width, o = t.height, l = (e == null ? void 0 : e.offsetWidth) || 0, h = (e == null ? void 0 : e.offsetHeight) || 0;
    return (this._offsetLeft !== i || this._offsetTop !== r || !_(this._width, s) || !_(this._height, o)) && this._view._children.forEach(
      (d) => d.elementReader.invalidatePageRect()
    ), !this._invalid && this._currentPageRect && this._offsetLeft === i && this._offsetTop === r && _(this._width, s) && _(this._height, o) && _(this._parentWidth, l) && _(this._parentHeight, h) && this._parentEl === e ? this._currentPageRect : (this._offsetLeft = i, this._offsetTop = r, this._width = s, this._height = o, this._parentWidth = l, this._parentHeight = h, this._parentEl = e, this._currentPageRect = Rt(this._element), this._invalid = !1, this._currentPageRect);
  }
}
function ue(n) {
  return new he(n);
}
class ce {
  constructor(t) {
    a(this, "_element"), a(this, "_rect"), a(this, "_computedStyle"), a(this, "_pageRectReader"), a(this, "_scroll"), this._element = t.element, this._pageRectReader = ue(t), this._rect = Et(this._element, this._pageRectReader), this._computedStyle = getComputedStyle(this._element), this._scroll = this._calculateScroll();
  }
  invalidatePageRect() {
    this._pageRectReader.invalidate();
  }
  update(t = !1) {
    this._rect = Et(this._element, this._pageRectReader), this._computedStyle = getComputedStyle(this._element), t && (this._scroll = this._calculateScroll());
  }
  get rect() {
    return this._rect;
  }
  get opacity() {
    return ne(this._computedStyle.opacity);
  }
  get borderRadius() {
    return J(this._computedStyle.borderRadius);
  }
  get origin() {
    return oe(
      this._computedStyle.transformOrigin,
      this._rect.size
    );
  }
  _calculateScroll() {
    let t = this._element, e = 0, i = 0;
    for (; t; )
      e += t.scrollTop, i += t.scrollLeft, t = t.offsetParent;
    return i += window.scrollX, e += window.scrollY, { y: e, x: i };
  }
  get scroll() {
    return this._scroll;
  }
}
function xt(n) {
  return new ce(n);
}
function Q(n, t) {
  const e = {
    set: (i, r, s) => (typeof i[r] == "object" && i[r] !== null ? i[r] = Q(s, t) : (t(), i[r] = s), !0),
    get: (i, r) => typeof i[r] == "object" && i[r] !== null ? Q(i[r], t) : i[r]
  };
  return new Proxy(n, e);
}
const U = 0.01, nt = {
  speed: 15
};
class at {
  constructor(t) {
    a(this, "name", "dynamic"), a(this, "_config"), this._config = t;
  }
  get config() {
    return this._config;
  }
}
class de extends at {
  update({ animatorProp: t, current: e, target: i, dt: r }) {
    const s = u.sub(i, e), o = u.scale(s, this._config.speed);
    let l = u.add(e, u.scale(o, r));
    return this._shouldFinish(i, e, o) && (l = i, requestAnimationFrame(() => {
      t.callCompleteCallback();
    })), t.callUpdateCallback(), l;
  }
  _shouldFinish(t, e, i) {
    return u.sub(t, e).magnitude < U && i.magnitude < U;
  }
}
class ge extends at {
  update({ animatorProp: t, current: e, target: i, dt: r }) {
    const s = (i - e) * this._config.speed;
    let o = e + s * r;
    return _(o, i) && (o = i, requestAnimationFrame(() => {
      t.callCompleteCallback();
    })), t.callUpdateCallback(), o;
  }
}
class pe extends at {
  update({ animatorProp: t, current: e, target: i, dt: r }) {
    return i.map((s, o) => {
      const l = e[o], h = s.value === 0 ? l.unit : s.unit, d = (s.value - l.value) * this._config.speed, c = l.value + d * r;
      let p = V(`${c}${h}`);
      return this._shouldFinish(s.value, l.value, d) && (p = s, requestAnimationFrame(() => {
        t.callCompleteCallback();
      })), t.callUpdateCallback(), p;
    });
  }
  _shouldFinish(t, e, i) {
    return Math.abs(t - e) < U && Math.abs(i) < U;
  }
}
class ot {
  constructor() {
    a(this, "name", "instant"), a(this, "_config", {});
  }
  get config() {
    return this._config;
  }
  update(t) {
    return requestAnimationFrame(() => {
      t.animatorProp.callCompleteCallback();
    }), t.target;
  }
}
const lt = {
  stiffness: 0.5,
  damping: 0.75,
  speed: 10
}, H = 0.01;
class ht {
  constructor(t) {
    a(this, "name", "spring"), a(this, "_config"), this._config = t;
  }
  get config() {
    return this._config;
  }
}
class _e extends ht {
  constructor() {
    super(...arguments), a(this, "_velocity", new u(0, 0));
  }
  update({ animatorProp: t, current: e, target: i, dt: r }) {
    const s = u.scale(
      u.scale(u.sub(e, i), -1),
      this._config.stiffness
    );
    this._velocity = u.add(this._velocity, s), this._velocity = u.scale(this._velocity, this._config.damping);
    let o = u.add(
      e,
      u.scale(this._velocity, r * this._config.speed)
    );
    return this._shouldFinish(i, e) && (o = i, requestAnimationFrame(() => {
      t.callCompleteCallback();
    })), o;
  }
  _shouldFinish(t, e) {
    return u.sub(t, e).magnitude < H && this._velocity.magnitude < H;
  }
}
class ve extends ht {
  constructor() {
    super(...arguments), a(this, "_velocity", 0);
  }
  update({ animatorProp: t, current: e, target: i, dt: r }) {
    const s = -(e - i) * this._config.stiffness;
    this._velocity += s, this._velocity *= this._config.damping;
    let o = e + this._velocity * r * this._config.speed;
    return _(o, i) && (o = i, requestAnimationFrame(() => {
      t.callCompleteCallback();
    })), o;
  }
}
class me extends ht {
  constructor() {
    super(...arguments), a(this, "_velocity", 0);
  }
  update({ animatorProp: t, current: e, target: i, dt: r }) {
    return i.map((s, o) => {
      const l = e[o], h = s.value === 0 ? l.unit : s.unit, d = -(l.value - s.value) * this._config.stiffness;
      this._velocity += d, this._velocity *= this._config.damping;
      const c = l.value + this._velocity * r * this._config.speed;
      let p = V(`${c}${h}`);
      return this._shouldFinish(s.value, l.value) && (p = s, requestAnimationFrame(() => {
        t.callCompleteCallback();
      })), p;
    });
  }
  _shouldFinish(t, e) {
    return Math.abs(t - e) < H && Math.abs(this._velocity) < H;
  }
}
function fe(n) {
  return n;
}
const ut = {
  duration: 350,
  ease: fe
};
class ct {
  constructor(t) {
    a(this, "name", "tween"), a(this, "_config"), a(this, "_startTime"), this._config = t;
  }
  get config() {
    return this._config;
  }
  reset() {
    this._startTime = void 0;
  }
}
class we extends ct {
  update({ animatorProp: t, initial: e, target: i, ts: r }) {
    this._startTime || (this._startTime = r);
    const s = Math.min(1, (r - this._startTime) / this._config.duration);
    return _(s, 1) ? (requestAnimationFrame(() => {
      t.callCompleteCallback();
    }), i) : u.add(
      e,
      u.scale(u.sub(i, e), this._config.ease(s))
    );
  }
}
class ye extends ct {
  update({ animatorProp: t, initial: e, target: i, ts: r }) {
    this._startTime || (this._startTime = r);
    const s = Math.min(1, (r - this._startTime) / this._config.duration);
    return _(s, 1) ? (requestAnimationFrame(() => {
      t.callCompleteCallback();
    }), i) : e.map((o, l) => {
      const h = i[l], d = h.value === 0 ? o.unit : h.unit, c = o.value + this._config.ease(s) * (i[l].value - o.value);
      return V(`${c}${d}`);
    });
  }
}
class Ve extends ct {
  update({ animatorProp: t, initial: e, target: i, ts: r }) {
    this._startTime || (this._startTime = r);
    const s = Math.min(1, (r - this._startTime) / this._config.duration);
    return _(s, 1) ? (requestAnimationFrame(() => {
      t.callCompleteCallback();
    }), i) : e + (i - e) * this._config.ease(s);
  }
}
class dt {
  createAnimatorByName(t, e) {
    switch (t) {
      case "instant":
        return this.createInstantAnimator();
      case "dynamic":
        return this.createDynamicAnimator(e);
      case "tween":
        return this.createTweenAnimator(e);
      case "spring":
        return this.createSpringAnimator(e);
    }
    return this.createInstantAnimator();
  }
}
class D extends dt {
  createInstantAnimator() {
    return new ot();
  }
  createTweenAnimator(t) {
    return new we({ ...ut, ...t });
  }
  createDynamicAnimator(t) {
    return new de({ ...nt, ...t });
  }
  createSpringAnimator(t) {
    return new _e({ ...lt, ...t });
  }
}
class Pe extends dt {
  createInstantAnimator() {
    return new ot();
  }
  createTweenAnimator(t) {
    return new ye({ ...ut, ...t });
  }
  createDynamicAnimator(t) {
    return new pe({
      ...nt,
      ...t
    });
  }
  createSpringAnimator(t) {
    return new me({ ...lt, ...t });
  }
}
class At extends dt {
  createInstantAnimator() {
    return new ot();
  }
  createDynamicAnimator(t) {
    return new ge({ ...nt, ...t });
  }
  createTweenAnimator(t) {
    return new Ve({ ...ut, ...t });
  }
  createSpringAnimator(t) {
    return new ve({ ...lt, ...t });
  }
}
function F(n) {
  return structuredClone(n);
}
class be {
  constructor(t) {
    a(this, "_viewProp"), a(this, "_completeCallback"), a(this, "_updateCallback"), a(this, "_isAnimating"), this._viewProp = t, this._isAnimating = !1;
  }
  set(t, e) {
    this._viewProp.setAnimator(t, e);
  }
  get name() {
    return this._viewProp.getAnimator().name;
  }
  onComplete(t) {
    this._completeCallback = t;
  }
  get isAnimating() {
    return this._isAnimating;
  }
  markAsAnimating() {
    this._isAnimating = !0;
  }
  callCompleteCallback() {
    var t;
    (t = this._completeCallback) == null || t.call(this), this._isAnimating = !1;
  }
  onUpdate(t) {
    this._updateCallback = t;
  }
  callUpdateCallback() {
    var t;
    (t = this._updateCallback) == null || t.call(this);
  }
}
class I {
  constructor(t, e, i) {
    a(this, "_animatorProp"), a(this, "_animator"), a(this, "_initialValue"), a(this, "_previousValue"), a(this, "_targetValue"), a(this, "_currentValue"), a(this, "_hasChanged"), a(this, "_view"), a(this, "_animatorFactory"), a(this, "_previousRenderValue"), this._animatorProp = new be(this), this._animatorFactory = t, this._initialValue = F(e), this._previousValue = F(e), this._targetValue = F(e), this._currentValue = F(e), this._hasChanged = !1, this._previousRenderValue = void 0, this._view = i, this._animator = this._animatorFactory.createInstantAnimator();
  }
  get shouldRender() {
    return !0;
  }
  get isAnimating() {
    return this.animator.isAnimating;
  }
  getAnimator() {
    return this._animator;
  }
  get animator() {
    return this._animatorProp;
  }
  get _rect() {
    return this._view.rect;
  }
  get _previousRect() {
    return this._view.previousRect;
  }
  setAnimator(t, e) {
    this._animator = this._animatorFactory.createAnimatorByName(
      t,
      e
    );
  }
  _setTarget(t, e = !0) {
    var i, r;
    this._previousValue = F(this._currentValue), this._targetValue = t, e ? ((r = (i = this._animator).reset) == null || r.call(i), this.animator.markAsAnimating()) : this._currentValue = t, this._hasChanged = !0;
  }
  hasChanged() {
    return this._hasChanged;
  }
  destroy() {
    this._hasChanged = !1;
  }
  // @ts-ignore
  update(t, e) {
  }
}
class Ee extends I {
  constructor() {
    super(...arguments), a(this, "_invertedBorderRadius"), a(this, "_forceStyleUpdateThisFrame", !1), a(this, "_updateWithScale", !1);
  }
  setFromElementPropValue(t) {
    this._setTarget(
      [
        t.value.topLeft,
        t.value.topRight,
        t.value.bottomRight,
        t.value.bottomLeft
      ],
      !0
    );
  }
  enableUpdateWithScale() {
    this._updateWithScale = !0;
  }
  disableUpdateWithScale() {
    this._updateWithScale = !1;
  }
  get value() {
    return {
      topLeft: this._currentValue[0],
      topRight: this._currentValue[1],
      bottomRight: this._currentValue[2],
      bottomLeft: this._currentValue[3]
    };
  }
  get invertedBorderRadius() {
    return this._invertedBorderRadius;
  }
  set(t, e = !0) {
    let i;
    if (typeof t == "string") {
      const h = J(t.trim());
      i = {
        topLeft: h.value.topLeft.valueWithUnit,
        topRight: h.value.topRight.valueWithUnit,
        bottomRight: h.value.bottomRight.valueWithUnit,
        bottomLeft: h.value.bottomLeft.valueWithUnit
      };
    } else
      i = t;
    const r = i.topLeft ? V(i.topLeft) : this._currentValue[0], s = i.topRight ? V(i.topRight) : this._currentValue[1], o = i.bottomRight ? V(i.bottomRight) : this._currentValue[2], l = i.bottomLeft ? V(i.bottomLeft) : this._currentValue[3];
    this._setTarget([r, s, o, l], e);
  }
  reset(t = !0) {
    this._setTarget(this._initialValue, t);
  }
  update(t, e) {
    if (this._forceStyleUpdateThisFrame)
      this._hasChanged = !0, this._forceStyleUpdateThisFrame = !1;
    else if (this._view.scale.isAnimating && this._updateWithScale)
      this._hasChanged = !0;
    else if (Pt(this._targetValue, this._currentValue)) {
      this._hasChanged = !Pt(
        this._targetValue,
        this._initialValue
      );
      return;
    }
    this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
      ts: t,
      dt: e
    }), this._updateWithScale && this._applyScaleInverse();
  }
  applyScaleInverse() {
    this._updateWithScale && (this._forceStyleUpdateThisFrame = !0);
  }
  _applyScaleInverse() {
    if (_(this._view.scale.x, 1) && _(this._view.scale.y, 1))
      return;
    const t = this._rect.size.width * this._view.scale.x, e = this._rect.size.height * this._view.scale.y;
    this._invertedBorderRadius = se(
      J(
        `${this._currentValue[0].valueWithUnit} ${this._currentValue[1].valueWithUnit} ${this._currentValue[2].valueWithUnit} ${this._currentValue[3].valueWithUnit}`
      ).value,
      {
        width: t,
        height: e
      }
    );
  }
  get shouldRender() {
    return this._hasChanged ? this._previousRenderValue ? !(bt(
      this.renderValue.v,
      this._previousRenderValue.v
    ) && bt(this.renderValue.h, this._previousRenderValue.h)) : !0 : !1;
  }
  get renderValue() {
    return this.invertedBorderRadius ? {
      v: {
        topLeft: this.invertedBorderRadius.v.topLeft,
        topRight: this.invertedBorderRadius.v.topRight,
        bottomLeft: this.invertedBorderRadius.v.bottomLeft,
        bottomRight: this.invertedBorderRadius.v.bottomRight
      },
      h: {
        topLeft: this.invertedBorderRadius.h.topLeft,
        topRight: this.invertedBorderRadius.h.topRight,
        bottomLeft: this.invertedBorderRadius.h.bottomLeft,
        bottomRight: this.invertedBorderRadius.h.bottomRight
      }
    } : {
      v: {
        topLeft: this.value.topLeft,
        topRight: this.value.topRight,
        bottomLeft: this.value.bottomLeft,
        bottomRight: this.value.bottomRight
      },
      h: {
        topLeft: this.value.topLeft,
        topRight: this.value.topRight,
        bottomLeft: this.value.bottomLeft,
        bottomRight: this.value.bottomRight
      }
    };
  }
  projectStyles() {
    const t = this.renderValue, e = `border-radius: ${t.h.topLeft.valueWithUnit} ${t.h.topRight.valueWithUnit} ${t.h.bottomRight.valueWithUnit} ${t.h.bottomLeft.valueWithUnit} / ${t.v.topLeft.valueWithUnit} ${t.v.topRight.valueWithUnit} ${t.v.bottomRight.valueWithUnit} ${t.v.bottomLeft.valueWithUnit};`;
    return this._previousRenderValue = t, e;
  }
  isTransform() {
    return !1;
  }
}
class Re extends I {
  setFromElementPropValue(t) {
    this._setTarget(t.value, !0);
  }
  get value() {
    return this._currentValue;
  }
  set(t, e = !0) {
    this._setTarget(t, e);
  }
  reset(t = !0) {
    this._setTarget(1, t);
  }
  update(t, e) {
    if (_(this._targetValue, this._currentValue)) {
      this._hasChanged = !_(this._targetValue, this._initialValue);
      return;
    }
    this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
      ts: t,
      dt: e
    });
  }
  get shouldRender() {
    return this._hasChanged ? typeof this._previousRenderValue > "u" ? !0 : this.renderValue !== this._previousRenderValue : !1;
  }
  get renderValue() {
    return this.value;
  }
  projectStyles() {
    const t = this.renderValue, e = `opacity: ${t};`;
    return this._previousRenderValue = t, e;
  }
  isTransform() {
    return !1;
  }
}
class xe extends I {
  get x() {
    return this._currentValue.x;
  }
  get y() {
    return this._currentValue.y;
  }
  set(t) {
    const e = { x: this.x, y: this.y, ...t };
    if (e.x < 0 || e.x > 1) {
      console.log(
        `%c WARNING: ${this._view.name}.origin.x property can only be a value from 0 to 1`,
        "background: #885500"
      );
      return;
    }
    if (e.y < 0 || e.y > 1) {
      console.log(
        `%c WARNING: ${this._view.name}.origin.y property can only be a value from 0 to 1`,
        "background: #885500"
      );
      return;
    }
    this._setTarget(new u(e.x, e.y), !1);
  }
  reset() {
    this._setTarget(this._initialValue, !1);
  }
  get shouldRender() {
    if (!this._hasChanged)
      return !1;
    if (!this._previousRenderValue)
      return !0;
    const t = this.renderValue;
    return !(_(t.x, this._previousRenderValue.x) && _(t.y, this._previousRenderValue.y));
  }
  get renderValue() {
    return new u(this.x * 100, this.y * 100);
  }
  projectStyles() {
    const t = this.renderValue, e = `transform-origin: ${t.x}% ${t.y}%;`;
    return this._previousRenderValue = t, e;
  }
  isTransform() {
    return !1;
  }
}
class Ae extends I {
  constructor() {
    super(...arguments), a(this, "_animateLayoutUpdateNextFrame", !1), a(this, "_parentScaleInverse", new u(1, 1));
  }
  get _parentDiff() {
    let t = this._view._parent, e = 0, i = 0;
    if (t) {
      const r = t.rect.pageOffset, s = t.getScroll(), o = {
        left: t.previousRect.viewportOffset.left + s.x,
        top: t.previousRect.viewportOffset.top + s.y
      };
      e = o.left - r.left, i = o.top - r.top;
    }
    return { parentDx: e, parentDy: i };
  }
  get x() {
    return this._currentValue.x + this._rect.pageOffset.left + this._parentDiff.parentDx;
  }
  get y() {
    return this._currentValue.y + this._rect.pageOffset.top + this._parentDiff.parentDy;
  }
  get initialX() {
    return this._rect.pageOffset.left;
  }
  get initialY() {
    return this._rect.pageOffset.top;
  }
  progressTo(t) {
    const e = typeof t.x > "u" ? this.initialX : t.x, i = typeof t.y > "u" ? this.initialY : t.y, r = new u(e, i), s = new u(this.initialX, this.initialY), o = new u(this.x, this.y), l = u.sub(o, s), h = u.sub(r, s);
    return 1 - u.sub(h, l).magnitude / h.magnitude;
  }
  set(t, e = !0) {
    const i = { x: this.x, y: this.y, ...t };
    this._setTarget(
      new u(
        i.x - this._rect.pageOffset.left,
        i.y - this._rect.pageOffset.top
      ),
      e
    );
  }
  reset(t = !0) {
    this._setTarget(new u(0, 0), t);
  }
  update(t, e) {
    if ((this._view.isInverseEffectEnabled || this._view.isLayoutTransitionEnabled) && !this._view.isTemporaryView && this._runLayoutTransition(), this._view.isInverseEffectEnabled) {
      const h = this._view._parent, d = h ? h.scale.x : 1, c = h ? h.scale.y : 1;
      this._parentScaleInverse = new u(1 / d, 1 / c), this._parentScaleInverse.equals(new u(1, 1)) || (this._hasChanged = !0);
    }
    if (this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y)
      return;
    const i = this._view._parent, r = i ? i.scale.x : 1, s = i ? i.scale.y : 1, o = i ? i.scale._previousValue.x : 1, l = i ? i.scale._previousValue.y : 1;
    this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: new u(
        this._currentValue.x * r,
        this._currentValue.y * s
      ),
      target: this._targetValue,
      initial: new u(
        this._previousValue.x * o,
        this._previousValue.y * l
      ),
      ts: t,
      dt: e
    }), this._currentValue = new u(
      this._currentValue.x / r,
      this._currentValue.y / s
    );
  }
  _runLayoutTransition() {
    const t = !(this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y), e = !(this._view.scale._targetValue.x === this._view.scale._currentValue.x && this._view.scale._targetValue.y === this._view.scale._currentValue.y), i = t || e, r = this._rect.pageOffset.left - this._previousRect.pageOffset.left, s = this._rect.pageOffset.top - this._previousRect.pageOffset.top, o = this._previousRect.size.width / this._rect.size.width, l = this._previousRect.size.height / this._rect.size.height;
    let h = !1;
    if (r !== 0 || s !== 0 || !Number.isNaN(o) && o !== 1 || !Number.isNaN(l) && l !== 1 ? h = !0 : h = (() => {
      const d = this._view._parents;
      for (let c = 0; c < d.length; c++) {
        const p = d[c], w = p.previousRect.size.width / p.rect.size.width, m = p.previousRect.size.height / p.rect.size.height;
        if (w !== 1 || m !== 1)
          return !0;
      }
      return !1;
    })(), h) {
      if (this._currentValue.x !== 0 || this._currentValue.y !== 0 || this._view.scale._currentValue.x !== 1 || this._view.scale._currentValue.y !== 1) {
        if (!i) {
          const z = this._rect.pageOffset.left - this._previousRect.pageOffset.left, O = this._rect.pageOffset.top - this._previousRect.pageOffset.top;
          this._setTarget(
            new u(this._currentValue.x - z, this._currentValue.y - O),
            !1
          );
          return;
        }
        const v = this._view._parent, E = this._rect.pageOffset, x = this._view.getScroll(), A = {
          left: this._previousRect.viewportOffset.left + x.x,
          top: this._previousRect.viewportOffset.top + x.y
        }, k = A.left - E.left, $ = A.top - E.top;
        let pt = 0, _t = 0, vt = 0, mt = 0;
        if (v) {
          const z = v.rect.pageOffset, O = v.getScroll(), W = {
            left: v.previousRect.viewportOffset.left + O.x,
            top: v.previousRect.viewportOffset.top + O.y
          };
          pt = W.left - z.left, _t = W.top - z.top;
          const ft = A.top - W.top, wt = A.left - W.left, $t = v.scale.y * ft;
          vt = (ft - $t) / v.scale.y;
          const zt = v.scale.x * wt;
          mt = (wt - zt) / v.scale.x;
        }
        this._setTarget(
          new u(k - pt + mt, $ - _t + vt),
          !1
        ), i && (this._animateLayoutUpdateNextFrame = !0);
        return;
      }
      this._animateLayoutUpdateNextFrame = !0;
      const d = this._previousRect, c = this._rect, p = this._view._parent;
      let w = 0, m = 0;
      p && (w = p.previousRect.viewportOffset.left - p.rect.viewportOffset.left), p && (m = p.previousRect.viewportOffset.top - p.rect.viewportOffset.top);
      let y = 1, f = 1;
      p && (y = p.previousRect.size.width / p.rect.size.width, f = p.previousRect.size.height / p.rect.size.height);
      const b = p ? p.previousRect.viewportOffset.left : 0, C = p ? p.previousRect.viewportOffset.top : 0, L = d.viewportOffset.left - b, S = d.viewportOffset.top - C, M = L / y - L, X = S / f - S;
      let g = d.viewportOffset.left - c.viewportOffset.left - w + M, P = d.viewportOffset.top - c.viewportOffset.top - m + X;
      g = Number.isFinite(g) ? g : 0, P = Number.isFinite(P) ? P : 0, this._setTarget(new u(g, P), !1);
    } else
      this._animateLayoutUpdateNextFrame && (this._setTarget(this._initialValue, !0), this._animateLayoutUpdateNextFrame = !1);
  }
  get shouldRender() {
    if (!this._hasChanged)
      return !1;
    if (!this._previousRenderValue)
      return !0;
    const t = this.renderValue;
    return !(_(t.x, this._previousRenderValue.x) && _(t.y, this._previousRenderValue.y));
  }
  get renderValue() {
    let t = 0, e = 0;
    return (this._view.isInverseEffectEnabled || this._view.isLayoutTransitionEnabled) && (t = (this._rect.size.width * this._parentScaleInverse.x * this._view.scale.x - this._rect.size.width) * this._view.origin.x, e = (this._rect.size.height * this._parentScaleInverse.y * this._view.scale.y - this._rect.size.height) * this._view.origin.y), new u(
      this._currentValue.x + t,
      this._currentValue.y + e
    );
  }
  projectStyles() {
    const t = this.renderValue, e = `translate3d(${t.x}px, ${t.y}px, 0px)`;
    return this._previousRenderValue = t, e;
  }
  isTransform() {
    return !0;
  }
}
class Te extends I {
  constructor() {
    super(...arguments), a(this, "_unit", "deg");
  }
  get degrees() {
    let t = this._currentValue;
    return this._unit === "rad" && (t = t * (180 / Math.PI)), t;
  }
  get radians() {
    let t = this._currentValue;
    return this._unit === "deg" && (t = t * (Math.PI / 180)), t;
  }
  setDegrees(t, e = !0) {
    this._unit = "deg", this._setTarget(t, e);
  }
  setRadians(t, e = !0) {
    this._unit = "rad", this._setTarget(t, e);
  }
  reset(t = !0) {
    this._setTarget(0, t);
  }
  update(t, e) {
    this._targetValue !== this._currentValue && (this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
      ts: t,
      dt: e
    }));
  }
  get shouldRender() {
    if (!this._hasChanged)
      return !1;
    if (typeof this._previousRenderValue > "u")
      return !0;
    const t = this.renderValue;
    return !_(t, this._previousRenderValue);
  }
  get renderValue() {
    return this._currentValue;
  }
  projectStyles() {
    const t = this.renderValue, e = `rotate(${t}${this._unit})`;
    return this._previousRenderValue = t, e;
  }
  isTransform() {
    return !0;
  }
}
class Ie extends I {
  constructor() {
    super(...arguments), a(this, "_animateLayoutUpdateNextFrame", !1);
  }
  get x() {
    return this._currentValue.x;
  }
  get y() {
    return this._currentValue.y;
  }
  set(t, e = !0) {
    const i = { x: this._currentValue.x, y: this._currentValue.y, ...typeof t == "number" ? { x: t, y: t } : t };
    this._setTarget(new u(i.x, i.y), e);
  }
  setWithSize(t, e = !0) {
    let i = this._currentValue.x, r = this._currentValue.y;
    t.width && (i = t.width / this._rect.size.width), t.height && (r = t.height / this._rect.size.height), !t.width && t.height && (i = r), !t.height && t.width && (r = i);
    const s = { x: i, y: r };
    this._setTarget(new u(s.x, s.y), e);
  }
  reset(t = !0) {
    this._setTarget(new u(1, 1), t);
  }
  update(t, e) {
    if (this._view.layoutOption !== "position") {
      if ((this._view.isInverseEffectEnabled || this._view.isLayoutTransitionEnabled) && !this._view.isTemporaryView && this._runLayoutTransition(), this._view.isInverseEffectEnabled) {
        const i = this._view._parent, r = i ? i.scale.x : 1, s = i ? i.scale.y : 1;
        this._hasChanged = r !== 1 || s !== 1;
      }
      this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y || (this._currentValue = this._animator.update({
        animatorProp: this._animatorProp,
        current: this._currentValue,
        target: this._targetValue,
        initial: new u(this._previousValue.x, this._previousValue.y),
        ts: t,
        dt: e
      }));
    }
  }
  _runLayoutTransition() {
    const t = !(this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y), e = this._previousRect.size.width / this._rect.size.width, i = this._previousRect.size.height / this._rect.size.height;
    let r = !1;
    if ((!Number.isNaN(e) && e !== 1 || !Number.isNaN(i) && i !== 1) && (r = !0), r) {
      if (this._currentValue.x !== 1 || this._currentValue.y !== 1) {
        const d = this._view.previousRect.size.width / this._view.rect.size.width, c = this._view.previousRect.size.height / this._view.rect.size.height;
        this._setTarget(
          new u(this._currentValue.x * d, this._currentValue.y * c),
          !1
        ), t && (this._animateLayoutUpdateNextFrame = !0);
        return;
      }
      const s = this._previousRect.size.width / this._rect.size.width, o = this._previousRect.size.height / this._rect.size.height, l = s, h = o;
      this._view.viewProps.borderRadius.applyScaleInverse(), this._setTarget(new u(l, h), !1), this._animateLayoutUpdateNextFrame = !0;
    } else
      this._animateLayoutUpdateNextFrame && (this._setTarget(this._initialValue, !0), this._animateLayoutUpdateNextFrame = !1);
  }
  get shouldRender() {
    if (!this._hasChanged)
      return !1;
    if (!this._previousRenderValue)
      return !0;
    const t = this.renderValue;
    return !(_(t.x, this._previousRenderValue.x) && _(t.y, this._previousRenderValue.y));
  }
  get renderValue() {
    const t = this._view._parent ? this._view._parent.scale.x : 1, e = this._view._parent ? this._view._parent.scale.y : 1, i = this._currentValue.x / t, r = this._currentValue.y / e;
    return new u(i, r);
  }
  projectStyles() {
    const t = this.renderValue, e = `scale3d(${t.x}, ${t.y}, 1)`;
    return this._previousRenderValue = t, e;
  }
  isTransform() {
    return !0;
  }
}
class Ce extends I {
  get width() {
    return this._view.rect.size.width;
  }
  get height() {
    return this._view.rect.size.height;
  }
  get localWidth() {
    return this._currentValue.x;
  }
  get localHeight() {
    return this._currentValue.y;
  }
  get widthAfterScale() {
    const t = this._view.scale.x;
    return this.localWidth * t;
  }
  get heightAfterScale() {
    const t = this._view.scale.y;
    return this.localHeight * t;
  }
  get initialWidth() {
    return this._initialValue.x;
  }
  get initialHeight() {
    return this._initialValue.y;
  }
  set(t, e = !0) {
    const i = { width: this._currentValue.x, height: this._currentValue.y, ...t };
    this._setTarget(new u(i.width, i.height), e);
  }
  setWidth(t, e = !0) {
    const i = { width: this._currentValue.x, height: this._currentValue.y, width: t };
    this._setTarget(new u(i.width, i.height), e);
  }
  setHeight(t, e = !0) {
    const i = { width: this._currentValue.x, height: this._currentValue.y, height: t };
    this._setTarget(new u(i.width, i.height), e);
  }
  reset(t = !0) {
    this._setTarget(
      new u(this.initialWidth, this.initialHeight),
      t
    );
  }
  update(t, e) {
    this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y || (this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
      ts: t,
      dt: e
    }));
  }
  get shouldRender() {
    if (!this._hasChanged)
      return !1;
    if (!this._previousRenderValue)
      return !0;
    const t = this.renderValue;
    return !(_(t.x, this._previousRenderValue.x) && _(t.y, this._previousRenderValue.y));
  }
  get renderValue() {
    return new u(this._currentValue.x, this._currentValue.y);
  }
  projectStyles() {
    const t = this.renderValue, e = `width: ${t.x}px; height: ${t.y}px;`;
    return this._previousRenderValue = t, e;
  }
  isTransform() {
    return !1;
  }
}
class Ne {
  constructor(t) {
    a(this, "_props", /* @__PURE__ */ new Map()), this._props.set(
      "position",
      new Ae(new D(), new u(0, 0), t)
    ), this._props.set(
      "scale",
      new Ie(new D(), new u(1, 1), t)
    ), this._props.set(
      "rotation",
      new Te(new At(), 0, t)
    ), this._props.set(
      "size",
      new Ce(
        new D(),
        new u(t.rect.size.width, t.rect.size.height),
        t
      )
    ), this._props.set(
      "opacity",
      new Re(
        new At(),
        t.elementReader.opacity.value,
        t
      )
    ), this._props.set(
      "borderRadius",
      new Ee(
        new Pe(),
        [
          t.elementReader.borderRadius.value.topLeft,
          t.elementReader.borderRadius.value.topRight,
          t.elementReader.borderRadius.value.bottomRight,
          t.elementReader.borderRadius.value.bottomLeft
        ],
        t
      )
    ), this._props.set(
      "origin",
      new xe(
        new D(),
        t.elementReader.origin.value,
        t
      )
    );
  }
  allProps() {
    return Array.from(this._props.values());
  }
  allPropNames() {
    return Array.from(this._props.keys());
  }
  getPropByName(t) {
    return this._props.get(t);
  }
  get position() {
    return this._props.get("position");
  }
  get scale() {
    return this._props.get("scale");
  }
  get rotation() {
    return this._props.get("rotation");
  }
  get size() {
    return this._props.get("size");
  }
  get opacity() {
    return this._props.get("opacity");
  }
  get borderRadius() {
    return this._props.get("borderRadius");
  }
  get origin() {
    return this._props.get("origin");
  }
}
class Le {
  constructor(t, e, i, r) {
    a(this, "id"), a(this, "name"), a(this, "element"), a(this, "styles", {}), a(this, "_viewProps"), a(this, "_previousRect"), a(this, "_onAddCallbacks"), a(this, "_onRemoveCallback"), a(this, "_skipFirstRenderFrame"), a(this, "_layoutTransition"), a(this, "_registry"), a(this, "_layoutId"), a(this, "_elementReader"), a(this, "_viewParents"), a(this, "_temporaryView"), a(this, "_inverseEffect"), a(this, "_renderNextTick"), a(this, "_layoutOption"), a(this, "_elementObserver"), a(this, "_hasReadElement"), a(this, "_shouldReadRect"), a(this, "_readWithScroll"), a(this, "_externalUserStyles"), this._registry = i, this.id = St(), this.name = e, this.element = t, this.element.dataset.velViewId = this.id, this._elementReader = xt(this), this._viewParents = this._getParents(), this._previousRect = this._elementReader.rect, this._viewProps = new Ne(this), this._skipFirstRenderFrame = !0, this._layoutId = r, this._layoutTransition = !1, this._temporaryView = !1, this.styles = Q(this.styles, () => {
      this._renderNextTick = !0;
    }), this._externalUserStyles = this._getExternalUserStyles(), this._renderNextTick = !1, this._layoutOption = this._getLayoutOption(), this._hasReadElement = !1, this._shouldReadRect = !1, this._readWithScroll = !1, this._elementObserver = te(t), this._elementObserver.onChange((s) => {
      if (this._hasReadElement) {
        this._shouldReadRect = !1;
        return;
      }
      this._externalUserStyles = this._getExternalUserStyles(), this._shouldReadRect = !0, this._readWithScroll = s;
    });
  }
  destroy() {
    this._viewProps.allProps().forEach((t) => t.destroy()), this.element.removeAttribute("data-vel-view-id"), this.element.removeAttribute("data-vel-plugin-id"), this._renderNextTick = !0;
  }
  get elementReader() {
    return this._elementReader;
  }
  get layoutOption() {
    return this._layoutOption;
  }
  _getLayoutOption() {
    return this.element.closest("[data-vel-layout-position]") ? "position" : this.element.closest("[data-vel-layout-size]") ? "size" : "all";
  }
  setElement(t) {
    this.element = t, this._elementReader = xt(this), this.element.dataset.velViewId = this.id, this._elementObserver.setElement(t);
  }
  get layoutId() {
    return this._layoutId;
  }
  get position() {
    return this._viewProps.position;
  }
  get scale() {
    return this._viewProps.scale;
  }
  get _children() {
    const t = this.element.querySelectorAll("*");
    return Array.from(t).map((e) => e.dataset.velViewId).filter((e) => e && typeof e == "string").map((e) => this._registry.getViewById(e)).filter((e) => !!e);
  }
  get _parent() {
    return this._parents[0];
  }
  get _parents() {
    return this._viewParents;
  }
  _getParents() {
    var t;
    const e = [];
    let i = this.element.parentElement;
    if (!i)
      return e;
    for (i = i.closest("[data-vel-view-id]"); i; ) {
      const r = i.dataset.velViewId;
      if (r) {
        const s = this._registry.getViewById(r);
        s && e.push(s);
      }
      i = (t = i.parentElement) == null ? void 0 : t.closest(
        "[data-vel-view-id]"
      );
    }
    return e;
  }
  get rotation() {
    return this._viewProps.rotation;
  }
  get size() {
    return this._viewProps.size;
  }
  get _localWidth() {
    return this._viewProps.size.localWidth;
  }
  get _localHeight() {
    return this._viewProps.size.localHeight;
  }
  get opacity() {
    return this._viewProps.opacity;
  }
  get borderRadius() {
    return this._viewProps.borderRadius;
  }
  get origin() {
    return this._viewProps.origin;
  }
  get data() {
    const t = this.element.dataset;
    return Object.keys(t).filter((e) => e.includes("velData")).map((e) => e.replace("velData", "")).map((e) => `${e[0].toLowerCase()}${e.slice(1)}`).reduce((e, i) => {
      const r = t[`velData${i[0].toUpperCase()}${i.slice(1)}`];
      return !e[i] && r && (e[i] = r), e;
    }, {});
  }
  get onAddCallbacks() {
    return this._onAddCallbacks;
  }
  get onRemoveCallback() {
    return this._onRemoveCallback;
  }
  get isLayoutTransitionEnabled() {
    return this._layoutTransition;
  }
  get hasLayoutTransitionEnabledForParents() {
    return this._parents.some((t) => t.isLayoutTransitionEnabled);
  }
  get isInverseEffectEnabled() {
    let t = !1;
    for (let e = 0; e < this._parents.length; e++) {
      const i = this._parents[e];
      if (typeof i._inverseEffect < "u") {
        t = i._inverseEffect;
        break;
      }
    }
    return t;
  }
  layoutTransition(t) {
    this._layoutTransition = t, this.inverseEffect(t);
  }
  inverseEffect(t) {
    this._inverseEffect = t, t && this._children.forEach((e) => {
      if (e.position.animator.name === "instant") {
        const i = this.viewProps.position.getAnimator();
        e.position.setAnimator(
          i.name,
          i.config
        );
      }
      if (e.scale.animator.name === "instant") {
        const i = this.viewProps.scale.getAnimator();
        e.scale.setAnimator(i.name, i.config);
      }
    });
  }
  setAnimatorsFromParent() {
    let t = this._parent;
    for (; t && !t._inverseEffect; )
      t = t._parent;
    if (t) {
      if (this.position.animator.name === "instant") {
        const e = t.viewProps.position.getAnimator();
        this.position.setAnimator(e.name, e.config);
      }
      if (this.scale.animator.name === "instant") {
        const e = t.viewProps.scale.getAnimator();
        this.scale.setAnimator(e.name, e.config);
      }
    }
  }
  get _isRemoved() {
    return !this._registry.getViewById(this.id);
  }
  setPluginId(t) {
    this.element.dataset.velPluginId = t;
  }
  hasElement(t) {
    return this.element.contains(t);
  }
  getScroll() {
    return this._elementReader.scroll;
  }
  intersects(t, e) {
    const i = this.element.getBoundingClientRect(), r = {
      x: i.left,
      y: i.top
    };
    return t >= r.x && t <= r.x + i.width && e >= r.y && e <= r.y + i.height;
  }
  // Using AABB collision detection
  overlapsWith(t) {
    const e = t._localWidth * t.scale.x, i = t._localHeight * t.scale.y, r = this._localWidth * this.scale.x, s = this._localHeight * this.scale.y;
    return this.position.x < t.position.x + e && this.position.x + r > t.position.x && this.position.y < t.position.y + i && this.position.y + s > t.position.y;
  }
  distanceTo(t) {
    const e = new u(this.position.x, this.position.y), i = new u(t.position.x, t.position.y);
    return u.sub(i, e).magnitude;
  }
  read() {
    this._shouldReadRect && (this._elementReader.update(this._readWithScroll), this._children.forEach((t) => {
      t.setHasReadElement(!0), t.elementReader.update(this._readWithScroll);
    }), this._shouldReadRect = !1, this._readWithScroll = !1), this.setHasReadElement(!1);
  }
  setHasReadElement(t) {
    this._hasReadElement = t;
  }
  get rect() {
    return this._elementReader.rect;
  }
  get previousRect() {
    return this._previousRect;
  }
  update(t, e) {
    this._viewProps.allProps().forEach((i) => i.update(t, e));
  }
  _updatePreviousRect() {
    this._previousRect = this._elementReader.rect;
  }
  setAsTemporaryView() {
    this._temporaryView = !0;
  }
  get isTemporaryView() {
    return this._temporaryView;
  }
  get shouldRender() {
    return this._renderNextTick || this._viewProps.allProps().some((t) => t.shouldRender);
  }
  _cleanCssText(t) {
    const e = /* @__PURE__ */ new Map(), i = /([-\w]+)\s*:\s*([^;]+)\s*;?/g;
    let r;
    for (; (r = i.exec(t)) !== null; ) {
      const [s, o, l] = r;
      if (!l.trim())
        continue;
      const h = o.replace(/^-\w+-/, "");
      (!e.has(h) || !o.startsWith("-")) && e.set(
        h,
        `${h}: ${l.trim()}`
      );
    }
    return Array.from(e.values()).join("; ");
  }
  render() {
    if (!this.shouldRender)
      return;
    if (this._isRemoved && this._skipFirstRenderFrame) {
      this._skipFirstRenderFrame = !1;
      return;
    }
    let t = "";
    const e = this._viewProps.allProps(), i = e.filter((s) => s.isTransform()), r = e.filter((s) => !s.isTransform());
    if (i.some((s) => s.hasChanged())) {
      const s = i.reduce((o, l, h) => (o += l.projectStyles(), h < i.length - 1 && (o += " "), h === i.length - 1 && (o += ";"), o), "transform: ");
      t += s;
    }
    r.forEach((s) => {
      s.hasChanged() && (t += s.projectStyles());
    }), t += this._getUserStyles(), this._cleanCssText(this.element.style.cssText) !== this._cleanCssText(t) && (this.element.style.cssText = t), this._renderNextTick = !1;
  }
  _getExternalUserStyles() {
    const t = this.element.style.cssText, e = this.styles;
    if (t.length === 0)
      return "";
    const i = [
      "transform",
      "transform-origin",
      "opacity",
      "width",
      "height",
      "border-radius"
    ], r = {};
    for (const s in e)
      e.hasOwnProperty(s) && (r[yt(s)] = e[s]);
    return t.split(";").map((s) => s.trim()).filter(Boolean).filter((s) => {
      const o = s.indexOf(":");
      if (o === -1)
        return !1;
      const l = s.slice(0, o).trim();
      return !r.hasOwnProperty(l) && !i.includes(l);
    }).join("; ");
  }
  _getUserStyles() {
    return Object.keys(this.styles).reduce((t, e) => {
      if (!e)
        return t;
      const i = yt(e).replace("webkit", "-webkit").replace("moz", "-moz");
      return t + `${i}: ${this.styles[e]}; `;
    }, this._externalUserStyles);
  }
  markAsAdded() {
    delete this.element.dataset.velProcessing;
  }
  onAdd(t) {
    this._onAddCallbacks = t;
  }
  onRemove(t) {
    this._onRemoveCallback = t;
  }
  get viewProps() {
    return this._viewProps;
  }
  getPropByName(t) {
    return this._viewProps.getPropByName(t);
  }
  _copyAnimatorsToAnotherView(t) {
    t.viewProps.allPropNames().forEach((e) => {
      var i, r;
      const s = (i = this.viewProps.getPropByName(e)) == null ? void 0 : i.getAnimator();
      s && ((r = t.viewProps.getPropByName(e)) == null || r.setAnimator(s.name, s.config));
    });
  }
  getChildren(t) {
    const e = this.element.querySelectorAll("*"), i = Array.from(e).filter((r) => {
      const s = r;
      return typeof s.dataset.velViewId < "u" && s.dataset.velView === t;
    }).map((r) => r.dataset.velViewId);
    return this._registry.getViewsById(i);
  }
  getChild(t) {
    return this.getChildren(t)[0];
  }
  getParent(t) {
    const e = this.element.closest(
      `[data-vel-view="${t}"]`
    );
    if (!e)
      return;
    const i = e.dataset.velViewId;
    if (i)
      return this._registry.getViewById(i);
  }
}
class Se {
  constructor(t, e) {
    a(this, "_appEventBus"), a(this, "_eventBus"), a(this, "_plugins", []), a(this, "_views", []), a(this, "_viewsPerPlugin", /* @__PURE__ */ new Map()), a(this, "_viewsToBeCreated", []), a(this, "_viewsToBeRemoved", []), a(this, "_viewsCreatedInPreviousFrame", []), a(this, "_layoutIdToViewMap", /* @__PURE__ */ new Map()), a(this, "_eventPluginsPerPlugin", /* @__PURE__ */ new Map()), a(this, "_pluginNameToPluginFactoryMap", /* @__PURE__ */ new Map()), a(this, "_pluginNameToPluginConfigMap", /* @__PURE__ */ new Map()), this._appEventBus = t, this._eventBus = e;
  }
  update() {
    this._handleRemovedViews(), this._handleAddedViews();
  }
  associateEventPluginWithPlugin(t, e) {
    let i = this._eventPluginsPerPlugin.get(t);
    i || (i = [], this._eventPluginsPerPlugin.set(t, i)), i.push(e);
  }
  _handleRemovedViews() {
    const t = this._viewsToBeRemoved.filter((e) => e.dataset.velViewId);
    t.length && (t.forEach((e) => {
      const i = e.dataset.velViewId;
      i && this._handleRemoveView(i);
    }), this._viewsToBeRemoved = []);
  }
  _getPluginNameForElement(t) {
    const e = t.dataset.velPlugin;
    if (e && e.length > 0)
      return e;
    const i = t.closest("[data-vel-plugin]");
    if (i)
      return i.dataset.velPlugin;
  }
  _getPluginIdForElement(t) {
    const e = this._getPluginNameForElement(t);
    if (!e)
      return;
    const i = t.closest("[data-vel-plugin-id]");
    if (i)
      return i.dataset.velPluginId;
    const r = this.getPluginByName(e);
    if (r)
      return r.id;
  }
  _isScopedElement(t) {
    const e = this._getPluginNameForElement(t);
    if (!e)
      return !1;
    const i = this._pluginNameToPluginFactoryMap.get(e), r = i == null ? void 0 : i.scope;
    return t.dataset.velView === r;
  }
  _removeElementsWithParent(t) {
    const e = new Set(t);
    return t.filter((i) => {
      let r = i.parentElement;
      for (; r; ) {
        if (e.has(r))
          return !1;
        r = r.parentElement;
      }
      return !0;
    });
  }
  _handleAddedViews() {
    this._viewsCreatedInPreviousFrame.forEach((s) => {
      s.markAsAdded();
    }), this._viewsCreatedInPreviousFrame = [];
    const t = this._removeElementsWithParent(
      this._viewsToBeCreated
    ), e = t.filter(
      (s) => this._isScopedElement(s) && !this._isElementIgnored(s)
    ), i = t.filter(
      (s) => !this._isScopedElement(s) && !this._isElementIgnored(s)
    );
    this._viewsToBeCreated = [], e.forEach((s) => {
      const o = this._getPluginNameForElement(s), l = this._pluginNameToPluginFactoryMap.get(o), h = this._pluginNameToPluginConfigMap.get(o), d = s.dataset.velPluginKey, c = j(
        l,
        this,
        this._eventBus,
        this._appEventBus,
        h,
        d
      );
      this._plugins.push(c);
      const p = s.dataset.velView, w = this._createNewView(s, p, c);
      w.isInverseEffectEnabled && w.setAnimatorsFromParent(), c.notifyAboutViewAdded(w);
    });
    const r = i.filter((s) => !!this._getPluginIdForElement(s));
    r.length !== 0 && r.forEach((s) => {
      const o = this._getPluginIdForElement(s), l = s.dataset.velView;
      if (!l || !o)
        return;
      const h = this._getPluginById(o);
      if (!h)
        return;
      const d = this._getLayoutIdForElement(s, h);
      let c;
      d && this._layoutIdToViewMap.has(d) ? (c = this._layoutIdToViewMap.get(d), c.setElement(s), c.setPluginId(h.id), this._createChildrenForView(c, h)) : c = this._createNewView(s, l, h), c.isInverseEffectEnabled && c.setAnimatorsFromParent(), h.notifyAboutViewAdded(c);
    });
  }
  _getLayoutIdForElement(t, e) {
    const i = t.dataset.velLayoutId;
    if (i)
      return `${i}-${e.id}`;
  }
  _createNewView(t, e, i) {
    const r = this._getLayoutIdForElement(t, i), s = this.createView(t, e, r);
    return i.addView(s), s.layoutId && this._layoutIdToViewMap.set(s.layoutId, s), this._createChildrenForView(s, i), this._appEventBus.emitPluginReadyEvent(i.pluginName, i.api, !0), requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._appEventBus.emitPluginReadyEvent(i.pluginName, i.api);
      });
    }), s;
  }
  _createChildrenForView(t, e) {
    const i = t.element.querySelectorAll("*");
    if (i.length) {
      if (Array.from(i).some(
        (r) => this._getPluginNameForElement(r) !== e.pluginName
      )) {
        console.log(
          `%c WARNING: The plugin "${e.pluginName}" has view(s) created for a different plugin. Make sure all views inside that plugin don't have data-vel-plugin set or the pluginName is set to "${e.pluginName}"`,
          "background: #885500"
        );
        return;
      }
      Array.from(i).filter((r) => !this._isElementIgnored(r)).forEach((r) => {
        const s = r, o = s.dataset.velView ? s.dataset.velView : `${t.name}-child`, l = this._getLayoutIdForElement(s, e), h = this.createView(s, o, l);
        l && !this._layoutIdToViewMap.has(l) && this._layoutIdToViewMap.set(l, h), e.addView(h), e.notifyAboutViewAdded(h);
      });
    }
  }
  _handleRemoveView(t) {
    this._plugins.forEach((e) => {
      if (!this._viewsPerPlugin.get(e.id))
        return;
      const i = this._getPluginViewById(e, t);
      i && e.removeView(i);
    });
  }
  removeViewById(t, e) {
    this._unassignViewFromPlugin(t, e), this._views = this._views.filter((i) => i.id !== t);
  }
  _unassignViewFromPlugin(t, e) {
    const i = this._viewsPerPlugin.get(e);
    if (!i)
      return;
    const r = i.indexOf(t);
    r !== -1 && i.splice(r, 1);
  }
  getViewById(t) {
    return this._views.find((e) => e.id === t);
  }
  getViewsById(t) {
    return this._views.filter((e) => t.includes(e.id));
  }
  _getPluginById(t) {
    return this._plugins.find((e) => e.id === t);
  }
  _getPluginViewById(t, e) {
    return this.getViewsForPlugin(t).find((i) => i.id === e);
  }
  destroy(t, e) {
    if (!t) {
      this._destroyAll(e);
      return;
    }
    let i = [];
    if (t && t.length > 0) {
      const r = this.getPluginByName(t);
      if (r) {
        const s = (this._eventPluginsPerPlugin.get(r.id) || []).map((o) => this._getPluginById(o)).filter((o) => typeof o < "u");
        i.push(r), i.push(...s);
      }
    } else
      i = this._plugins;
    requestAnimationFrame(() => {
      i.forEach((r) => {
        this._destroyPlugin(r);
      }), requestAnimationFrame(() => {
        e == null || e();
      });
    });
  }
  _destroyPlugin(t) {
    const e = this.getViewsForPlugin(t);
    e.forEach((i) => {
      i.layoutId && this._layoutIdToViewMap.delete(i.layoutId), i.destroy();
    }), this._views = this._views.filter(
      (i) => !e.find((r) => r.id === i.id)
    ), this._viewsPerPlugin.delete(t.id), this._plugins = this._plugins.filter((i) => i.id !== t.id);
  }
  _destroyAll(t) {
    this._views.forEach((e) => e.destroy()), requestAnimationFrame(() => {
      this._plugins = [], this._views = [], this._viewsPerPlugin.clear(), this._viewsToBeCreated = [], this._viewsToBeRemoved = [], this._viewsCreatedInPreviousFrame = [], this._layoutIdToViewMap.clear(), this._eventPluginsPerPlugin.clear(), t == null || t();
    });
  }
  reset(t, e) {
    let i = [];
    if (t && t.length > 0) {
      const r = this.getPluginByName(t);
      if (r) {
        const s = (this._eventPluginsPerPlugin.get(r.id) || []).map((o) => this._getPluginById(o)).filter((o) => typeof o < "u");
        i.push(r), i.push(...s);
      }
    } else
      i = this._plugins;
    requestAnimationFrame(() => {
      i.forEach((r) => {
        this._resetPlugin(r);
      }), requestAnimationFrame(() => {
        e == null || e();
      });
    });
  }
  _resetPlugin(t) {
    const e = t.config, i = t.pluginFactory, r = t.internalBusEvent, s = !t.isRenderable(), o = this.getViewsForPlugin(t);
    o.forEach((l) => {
      l.layoutId && this._layoutIdToViewMap.delete(l.layoutId), l.destroy();
    }), this._views = this._views.filter(
      (l) => !o.find((h) => h.id === l.id)
    ), this._viewsPerPlugin.delete(t.id), this._plugins = this._plugins.filter((l) => l.id !== t.id), s || requestAnimationFrame(() => {
      this.createPlugin(
        i,
        this._eventBus,
        e
      ).setInternalEventBus(r);
    });
  }
  queueNodeToBeCreated(t) {
    this._viewsToBeCreated.push(t);
  }
  queueNodeToBeRemoved(t) {
    this._viewsToBeRemoved.push(t);
  }
  notifyPluginAboutDataChange(t) {
    const e = this._plugins.filter(
      (i) => i.id === t.pluginId
    );
    !e || !e.length || e.forEach((i) => {
      i.notifyAboutDataChanged({
        dataName: t.dataName,
        dataValue: t.dataValue,
        viewName: t.viewName
      });
    });
  }
  getPlugins() {
    return this._plugins;
  }
  getRenderablePlugins() {
    function t(e) {
      return e.isRenderable();
    }
    return this._plugins.filter(t);
  }
  getPluginByName(t, e) {
    return this._plugins.find((i) => e ? i.pluginKey === e && i.pluginName === t : i.pluginName === t);
  }
  getPluginsByName(t, e) {
    return this._plugins.filter((i) => e ? i.pluginKey === e && i.pluginName === t : i.pluginName === t);
  }
  hasPlugin(t) {
    return t.pluginName ? !!this.getPluginByName(t.pluginName) : !1;
  }
  createPlugin(t, e, i = {}, r = !1) {
    if (!t.pluginName)
      throw Error(
        `Plugin ${t.name} must contain a pluginName field`
      );
    let s = [];
    if (t.scope) {
      const h = r ? `[data-vel-plugin=${t.pluginName}][data-vel-view=${t.scope}]:not([data-vel-plugin-id])` : `[data-vel-plugin=${t.pluginName}][data-vel-view=${t.scope}]`, d = document.querySelectorAll(h);
      this._pluginNameToPluginFactoryMap.has(t.pluginName) || this._pluginNameToPluginFactoryMap.set(
        t.pluginName,
        t
      ), this._pluginNameToPluginConfigMap.has(t.pluginName) || this._pluginNameToPluginConfigMap.set(t.pluginName, i), d ? s = Array.from(d) : s = [document.documentElement];
    } else
      s = [document.documentElement];
    const o = s.map((h) => {
      const d = h.dataset.velPluginKey, c = j(
        t,
        this,
        e,
        this._appEventBus,
        i,
        d
      );
      this._plugins.push(c);
      let p = [];
      h !== document.documentElement && p.push(h);
      const w = h.querySelectorAll(
        `[data-vel-plugin=${c.pluginName}]`
      );
      p = [...p, ...w];
      const m = p.filter((y) => {
        if (this._isElementIgnored(y))
          return !1;
        if (!y.parentElement)
          return !0;
        const f = this._getPluginNameForElement(y.parentElement);
        return !(f && f.length > 0);
      });
      return m.length && m.forEach((y) => {
        const f = y.dataset.velView;
        if (!f)
          return;
        const b = this._createNewView(y, f, c);
        c.notifyAboutViewAdded(b);
      }), c;
    });
    if (o && o.length > 0)
      return o[0];
    const l = j(
      t,
      this,
      e,
      this._appEventBus,
      i
    );
    return t.scope || console.log(
      `%c WARNING: The plugin "${l.pluginName}" is created but there are no elements using it on the page`,
      "background: #885500"
    ), l;
  }
  updatePlugin(t, e, i = {}) {
    return this.createPlugin(t, e, i, !0);
  }
  getViews() {
    return this._views;
  }
  createView(t, e, i) {
    const r = new Le(t, e, this, i);
    return this._views.push(r), this._viewsCreatedInPreviousFrame.push(r), r;
  }
  _isElementIgnored(t) {
    return t.closest("[data-vel-ignore]");
  }
  assignViewToPlugin(t, e) {
    this._viewsPerPlugin.has(e.id) || this._viewsPerPlugin.set(e.id, []);
    const i = this._viewsPerPlugin.get(e.id);
    i.includes(t.id) || i.push(t.id);
  }
  getViewsForPlugin(t) {
    const e = this._viewsPerPlugin.get(t.id);
    return e ? e.map((i) => this._views.find((r) => r.id === i)).filter((i) => !!i) : [];
  }
  getViewsByNameForPlugin(t, e) {
    return this.getViewsForPlugin(t).filter(
      (i) => i.name === e
    );
  }
}
class Tt {
  constructor(t) {
    a(this, "pluginApi"), this.pluginApi = t.pluginApi;
  }
}
class It {
  constructor(t) {
    a(this, "pluginApi"), this.pluginApi = t.pluginApi;
  }
}
class gt {
  constructor() {
    a(this, "previousTime", 0), a(this, "registry"), a(this, "eventBus"), a(this, "appEventBus"), this.eventBus = new Z(), this.appEventBus = new Z(), this.registry = new Se(this.appEventBus, this.eventBus), new Xt(this.eventBus);
  }
  static create() {
    return new gt();
  }
  addPlugin(t, e = {}) {
    this.registry.hasPlugin(t) || this.registry.createPlugin(t, this.eventBus, e);
  }
  updatePlugin(t, e = {}) {
    this.registry.hasPlugin(t) && this.registry.updatePlugin(t, this.eventBus, e);
  }
  reset(t, e) {
    this.registry.reset(t, e);
  }
  destroy(t, e) {
    this.registry.destroy(t, e);
  }
  getPlugin(t, e) {
    let i = typeof t == "string" ? t : t.pluginName;
    const r = this.registry.getPluginByName(i, e);
    if (!r)
      throw new Error(
        `You can't call getPlugin for ${i} with key: ${e} because it does not exist in your app`
      );
    return r.api;
  }
  getPlugins(t, e) {
    let i = typeof t == "string" ? t : t.pluginName;
    const r = this.registry.getPluginsByName(i, e);
    if (r.length === 0)
      throw new Error(
        `You can't call getPlugins for ${i} with key: ${e} because they don't exist in your app`
      );
    return r.map((s) => s.api);
  }
  onPluginEvent(t, e, i, r) {
    const s = this.registry.getPluginByName(
      t.pluginName,
      r
    );
    s && s.on(e, i);
  }
  removePluginEventListener(t, e, i) {
    const r = this.registry.getPluginByName(t.pluginName);
    r && r.removeListener(e, i);
  }
  run() {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", this.start.bind(this)) : this.start();
  }
  start() {
    this.setup(), requestAnimationFrame(this.tick.bind(this));
  }
  setup() {
    this.listenToNativeEvents(), this.subscribeToEvents();
  }
  listenToNativeEvents() {
    document.addEventListener("click", (t) => {
      this.eventBus.emitEvent(Nt, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    }), document.addEventListener("pointermove", (t) => {
      this.eventBus.emitEvent(et, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    }), document.addEventListener("pointerdown", (t) => {
      this.eventBus.emitEvent(it, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    }), document.addEventListener("pointerup", (t) => {
      this.eventBus.emitEvent(st, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    });
  }
  tick(t) {
    let e = (t - this.previousTime) / 1e3;
    e > 0.016 && (e = 1 / 60), this.previousTime = t, this.eventBus.reset(), this.subscribeToEvents(), this.read(), this.update(t, e), this.render(), requestAnimationFrame(this.tick.bind(this));
  }
  subscribeToEvents() {
    this.eventBus.subscribeToEvent(q, this.onNodeAdded.bind(this)), this.eventBus.subscribeToEvent(
      G,
      this.onNodeRemoved.bind(this)
    ), this.eventBus.subscribeToEvent(
      Lt,
      this.onDataChanged.bind(this)
    ), this.registry.getPlugins().forEach((t) => {
      t.subscribeToEvents(this.eventBus);
    });
  }
  onNodeAdded({ node: t }) {
    this.registry.queueNodeToBeCreated(t);
  }
  onNodeRemoved({ node: t }) {
    this.registry.queueNodeToBeRemoved(t);
  }
  onDataChanged(t) {
    this.registry.notifyPluginAboutDataChange(t);
  }
  read() {
    this.registry.getViews().forEach((t) => {
      t.read();
    });
  }
  update(t, e) {
    this.registry.update(), this.registry.getPlugins().slice().reverse().forEach((i) => {
      i.init();
    }), this.registry.getRenderablePlugins().forEach((i) => {
      i.update(t, e);
    }), this.registry.getViews().forEach((i) => {
      i.update(t, e);
    }), this.registry.getViews().forEach((i) => {
      i._updatePreviousRect();
    });
  }
  render() {
    this.registry.getRenderablePlugins().forEach((t) => {
      t.render();
    }), this.registry.getViews().forEach((t) => {
      t.render();
    });
  }
}
function Be() {
  return gt.create();
}
class Ft {
  constructor(t) {
    a(this, "view"), a(this, "previousX"), a(this, "previousY"), a(this, "x"), a(this, "y"), a(this, "pointerX"), a(this, "pointerY"), a(this, "isDragging"), a(this, "target"), a(this, "directions", []), a(this, "width"), a(this, "height"), a(this, "distance"), a(this, "stopped"), this.props = t, this.previousX = t.previousX, this.previousY = t.previousY, this.x = t.x, this.y = t.y, this.pointerX = t.pointerX, this.pointerY = t.pointerY, this.width = t.width, this.height = t.height, this.distance = t.distance, this.view = t.view, this.isDragging = t.isDragging, this.stopped = t.stopped, this.target = t.target, this.directions = t.directions;
  }
}
class Mt extends rt {
  constructor() {
    super(...arguments), a(this, "_pointerX", 0), a(this, "_pointerY", 0), a(this, "_initialPointer", new u(0, 0)), a(this, "_initialPointerPerView", /* @__PURE__ */ new Map()), a(this, "_pointerDownPerView", /* @__PURE__ */ new Map()), a(this, "_targetPerView", /* @__PURE__ */ new Map()), a(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map()), a(this, "_stopTimer", 0);
  }
  setup() {
    document.addEventListener("selectstart", this.onSelect.bind(this));
  }
  onSelect(t) {
    this._isDragging && t.preventDefault();
  }
  get _isDragging() {
    return Array.from(this._pointerDownPerView.values()).some(
      (t) => !!t
    );
  }
  subscribeToEvents(t) {
    t.subscribeToEvent(it, ({ x: e, y: i, target: r }) => {
      this._initialPointer = new u(e, i), this.getViews().forEach((s) => {
        this._pointerDownPerView.set(s.id, s.intersects(e, i)), this._targetPerView.set(s.id, r);
        const o = new u(
          e - s.position.x,
          i - s.position.y
        );
        this._pointerX = e, this._pointerY = i, this._initialPointerPerView.set(s.id, o);
      });
    }), t.subscribeToEvent(st, () => {
      this.getViews().forEach((e) => {
        this._pointerDownPerView.get(e.id) && this._initialPointerPerView.get(e.id) && (this._pointerDownPerView.set(e.id, !1), this._emitEvent(e, []));
      });
    }), t.subscribeToEvent(et, ({ x: e, y: i }) => {
      this._pointerX = e, this._pointerY = i, this.getViews().forEach((r) => {
        if (this._pointerDownPerView.get(r.id) && this._initialPointerPerView.get(r.id)) {
          this._viewPointerPositionLog.has(r.id) || this._viewPointerPositionLog.set(r.id, []);
          const s = new u(e, i), o = this._viewPointerPositionLog.get(r.id);
          o && o.push(new u(e, i));
          const l = o && o.length >= 2 ? o[o.length - 2] : s.clone(), h = this._calculateDirections(
            l,
            s
          );
          this._emitEvent(r, h), clearTimeout(this._stopTimer), this._stopTimer = setTimeout(() => {
            this._emitEvent(r, h, !0);
          }, 120);
        }
      });
    });
  }
  _emitEvent(t, e, i = !1) {
    const r = this._viewPointerPositionLog.get(t.id), s = r && r.length >= 2 ? r[r.length - 2] : null, o = this._pointerX - this._initialPointerPerView.get(t.id).x, l = this._pointerY - this._initialPointerPerView.get(t.id).y, h = this._pointerX, d = this._pointerY, c = s ? s.x - this._initialPointerPerView.get(t.id).x : o, p = s ? s.y - this._initialPointerPerView.get(t.id).y : l, w = this._pointerY - this._initialPointer.y, m = this._pointerX - this._initialPointer.x, y = ee(this._initialPointer, {
      x: this._pointerX,
      y: this._pointerY
    }), f = this._targetPerView.get(t.id);
    if (!f || !t.hasElement(f))
      return;
    const b = this._pointerDownPerView.get(t.id) === !0;
    b || this._viewPointerPositionLog.clear();
    const C = {
      view: t,
      target: f,
      previousX: c,
      previousY: p,
      x: o,
      y: l,
      pointerX: h,
      pointerY: d,
      distance: y,
      width: m,
      height: w,
      isDragging: b,
      directions: e,
      stopped: i
    };
    this.emit(Ft, C);
  }
  _calculateDirections(t, e) {
    const i = {
      up: u.sub(new u(t.x, t.y - 1), t),
      down: u.sub(new u(t.x, t.y + 1), t),
      left: u.sub(new u(t.x - 1, t.y), t),
      right: u.sub(new u(t.x + 1, t.y), t)
    }, r = u.sub(e, t).unitVector;
    return [
      { direction: "up", projection: r.dot(i.up) },
      {
        direction: "down",
        projection: r.dot(i.down)
      },
      {
        direction: "left",
        projection: r.dot(i.left)
      },
      {
        direction: "right",
        projection: r.dot(i.right)
      }
    ].filter(
      (s) => s.projection > 0
    ).map(
      (s) => s.direction
    );
  }
}
a(Mt, "pluginName", "DragEventPlugin");
class Fe {
  constructor(t) {
    a(this, "view"), a(this, "direction"), this.props = t, this.view = t.view, this.direction = t.direction;
  }
}
class Me extends rt {
  constructor() {
    super(...arguments), a(this, "_viewIsPointerDownMap", /* @__PURE__ */ new Map()), a(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map()), a(this, "_targetPerView", /* @__PURE__ */ new Map());
  }
  subscribeToEvents(t) {
    t.subscribeToEvent(it, ({ x: e, y: i, target: r }) => {
      this.getViews().forEach((s) => {
        this._targetPerView.set(s.id, r), s.intersects(e, i) && this._viewIsPointerDownMap.set(s.id, !0);
      });
    }), t.subscribeToEvent(et, ({ x: e, y: i }) => {
      this.getViews().forEach((r) => {
        this._viewIsPointerDownMap.get(r.id) && (this._viewPointerPositionLog.has(r.id) || this._viewPointerPositionLog.set(r.id, []), this._viewPointerPositionLog.get(r.id).push(new u(e, i)));
      });
    }), t.subscribeToEvent(st, ({ x: e, y: i }) => {
      this.getViews().forEach((s) => {
        if (!this._viewIsPointerDownMap.get(s.id) || !this._viewPointerPositionLog.has(s.id))
          return;
        const o = new u(e, i), l = this._viewPointerPositionLog.get(s.id), h = l[l.length - 2] || o.clone(), d = this._targetPerView.get(s.id), c = r(h, o);
        d && s.hasElement(d) && c.hasSwiped && this.emit(Fe, {
          view: s,
          direction: c.direction
        }), this._viewPointerPositionLog.set(s.id, []), this._viewIsPointerDownMap.set(s.id, !1);
      });
      function r(s, o) {
        const l = {
          up: u.sub(new u(s.x, s.y - 1), s),
          down: u.sub(new u(s.x, s.y + 1), s),
          left: u.sub(new u(s.x - 1, s.y), s),
          right: u.sub(new u(s.x + 1, s.y), s)
        }, h = u.sub(o, s).unitVector, d = [
          "up",
          "down",
          "left",
          "right"
        ], c = [
          h.dot(l.up),
          h.dot(l.down),
          h.dot(l.left),
          h.dot(l.right)
        ], p = Math.max(...c), w = c.indexOf(p), m = d[w], y = u.sub(o, s).magnitude;
        return {
          hasSwiped: h.dot(l[m]) * y > 30,
          direction: m
        };
      }
    });
  }
}
a(Me, "pluginName", "SwipeEventPlugin");
class ke {
  constructor(t) {
    a(this, "view"), this.props = t, this.view = t.view;
  }
}
class $e extends rt {
  subscribeToEvents(t) {
    t.subscribeToEvent(Nt, ({ x: e, y: i, target: r }) => {
      this.getViews().forEach((s) => {
        const o = r, l = s.element === o || s.element.contains(o);
        s.intersects(e, i) && l && this.emit(ke, {
          view: s
        });
      });
    });
  }
}
a($e, "pluginName", "ClickEventPlugin");
class tt {
  constructor(t) {
    R(this, "data");
    this.data = t.data;
  }
}
class kt {
  constructor(t) {
    R(this, "data");
    this.data = t.data;
  }
}
function K(n) {
  return {
    map: new Map(n),
    array: Array.from(n).map(([e, i]) => ({ slot: e, item: i })),
    object: Array.from(n).reduce(
      (e, [i, r]) => (e[i] = r, e),
      {}
    )
  };
}
const N = (n) => {
  const t = n.useEventPlugin(Mt);
  t.on(Ft, X);
  let e, i, r, s, o = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), h, d, c, p, w = !0, m, y, f;
  n.api({
    setEnabled(g) {
      w = g;
    }
  });
  function b() {
    return {
      animation: e.data.configAnimation,
      continuousMode: typeof e.data.configContinuousMode < "u"
    };
  }
  function C() {
    const g = b().animation;
    return g === "dynamic" ? {
      animator: "dynamic",
      config: {}
    } : g === "spring" ? {
      animator: "spring",
      config: {
        damping: 0.7,
        stiffness: 0.62
      }
    } : g === "none" ? {
      animator: "instant",
      config: {}
    } : {
      animator: "instant",
      config: {}
    };
  }
  n.setup(() => {
    e = n.getView("root"), i = n.getViews("slot"), r = n.getViews("item"), y = b().continuousMode, r.forEach((g) => {
      L(g);
    }), S(), l = new Map(o), n.emit(kt, { data: K(o) });
  });
  function L(g) {
    const P = C();
    g.styles.position = "relative", g.styles.touchAction = "none", g.styles.userSelect = "none", g.styles.webkitUserSelect = "none", g.position.setAnimator(P.animator, P.config), g.scale.setAnimator(P.animator, P.config), g.layoutTransition(!0);
    const v = g.getChild("handle");
    v ? t.addView(v) : t.addView(g);
    const E = g.getParent("slot").element;
    o.set(E.dataset.swapySlot, g.element.dataset.swapyItem);
  }
  n.onViewAdded((g) => {
    n.initialized && g.name === "item" && (L(g), S(), r = n.getViews("item"), l = new Map(o), n.emit(tt, { data: K(o) }));
  });
  function S() {
    const g = C();
    n.getViews("root-child").forEach((v) => {
      v.position.setAnimator(g.animator, g.config), v.scale.setAnimator(g.animator, g.config), v.layoutTransition(!0);
    });
  }
  function M() {
    if (!m) return;
    if (!h || !d) {
      const x = s.getScroll();
      h = m.pointerX - s.position.x + x.x, d = m.pointerY - s.position.y + x.y;
    }
    (!c || !p) && (c = s.size.width, p = s.size.height);
    const g = s.size.width / c, P = s.size.height / p, v = h * (g - 1), E = d * (P - 1);
    s.position.set(
      {
        x: m.x - v,
        y: m.y - E
      },
      s.scale.x !== 1 || s.scale.y !== 1
    );
  }
  function X(g) {
    if (!w) return;
    s = g.view.name === "handle" ? g.view.getParent("item") : g.view, f || (f = s.getParent("slot")), g.isDragging ? (m = g, M(), i.forEach((v) => {
      var $;
      if (!v.intersects(g.pointerX, g.pointerY)) {
        v !== f && v.element.removeAttribute("data-swapy-highlighted");
        return;
      }
      if (typeof v.element.dataset.swapyHighlighted > "u" && (v.element.dataset.swapyHighlighted = ""), !g.stopped && !y)
        return;
      const E = v.element.dataset.swapySlot, x = ($ = v.getChild("item")) == null ? void 0 : $.element.dataset.swapyItem, A = f.element.dataset.swapySlot, k = s.element.dataset.swapyItem;
      !E || !A || !k || (o.set(E, k), x ? o.set(A, x) : o.set(A, null), Ct(o, l) || (l = new Map(o), f = null, n.emit(tt, { data: K(o) })));
    }), r.forEach((v) => {
      v.styles.zIndex = v === s ? "2" : "";
    })) : (i.forEach((v) => {
      v.element.removeAttribute("data-swapy-highlighted");
    }), s.position.reset(), f = null, h = null, d = null, c = null, p = null, m = null), requestAnimationFrame(() => {
      M();
    });
  }
};
N.pluginName = "Swapy";
N.scope = "root";
let T;
function ze() {
  return T ? (T.updatePlugin(N), T) : (T = Be(), T.addPlugin(N), T.run(), T);
}
const Oe = {
  animation: "dynamic",
  continuousMode: !0
};
function We(n) {
  let t = !0;
  const e = n.querySelectorAll("[data-swapy-slot]");
  return e.length === 0 && (console.error("There are no slots defined in your root element:", n), t = !1), e.forEach((i) => {
    const r = i, s = r.dataset.swapySlot;
    (!s || s.length === 0) && (console.error(i, "does not contain a slotId using data-swapy-slot"), t = !1);
    const o = r.children;
    o.length > 1 && (console.error(
      "slot:",
      `"${s}"`,
      "cannot contain more than one element"
    ), t = !1);
    const l = o[0];
    l && (!l.dataset.swapyItem || l.dataset.swapyItem.length === 0) && (console.error(
      "slot:",
      `"${s}"`,
      "does not contain an element with item id using data-swapy-item"
    ), t = !1);
  }), t;
}
function De(n, t = {}) {
  const e = qt();
  return n.dataset.velPluginKey = e, n.dataset.velPlugin = "Swapy", n.dataset.velView = "root", n.dataset.velDataConfigAnimation = t.animation, t.continuousMode && (n.dataset.velDataConfigContinuousMode = "true"), Array.from(
    n.querySelectorAll("[data-swapy-slot]")
  ).forEach((l) => {
    l.dataset.velView = "slot";
  }), Array.from(
    n.querySelectorAll("[data-swapy-item]")
  ).forEach((l) => {
    l.dataset.velView = "item", l.dataset.velLayoutId = l.dataset.swapyItem;
    const h = l.querySelector("[data-swapy-handle]");
    h && (h.dataset.velView = "handle");
  }), Array.from(
    n.querySelectorAll("[data-swapy-text]")
  ).forEach((l) => {
    l.dataset.velLayoutPosition = "";
  }), Array.from(
    n.querySelectorAll("[data-swapy-exclude]")
  ).forEach((l) => {
    l.dataset.velIgnore = "";
  }), e;
}
function qe(n) {
  const t = Array.from(
    n.querySelectorAll("[data-swapy-item]:not([data-vel-view]")
  );
  return t.forEach((e) => {
    e.dataset.velView = "item", e.dataset.velLayoutId = e.dataset.swapyItem;
    const i = e.querySelector("[data-swapy-handle]");
    i && (i.dataset.velView = "handle"), Array.from(
      e.querySelectorAll("[data-swapy-text]")
    ).forEach((o) => {
      o.dataset.velLayoutPosition = "";
    }), Array.from(
      e.querySelectorAll("[data-swapy-exclude]")
    ).forEach((o) => {
      o.dataset.velIgnore = "";
    });
  }), t.length > 0;
}
function Ye(n, t = {}) {
  if (!n)
    throw new Error(
      "Cannot create a Swapy instance because the element you provided does not exist on the page!"
    );
  const e = { ...Oe, ...t }, i = n;
  if (!We(i))
    throw new Error(
      "Cannot create a Swapy instance because your HTML structure is invalid. Fix all above errors and then try!"
    );
  const r = De(i, e), s = new Ue(i, r);
  return {
    onSwap(o) {
      s.setSwapCallback(o);
    },
    enable(o) {
      s.setEnabled(o);
    }
  };
}
class Ue {
  constructor(t, e) {
    R(this, "_rootEl");
    R(this, "_veloxiApp");
    R(this, "_slotElMap");
    R(this, "_itemElMap");
    R(this, "_swapCallback");
    R(this, "_previousMap");
    this._rootEl = t, this._veloxiApp = ze(), this._slotElMap = this._createSlotElMap(), this._itemElMap = this._createItemElMap(), this._veloxiApp.onPluginEvent(
      N,
      kt,
      ({ data: i }) => {
        this._previousMap = i.map;
      },
      e
    ), this._veloxiApp.onPluginEvent(
      N,
      tt,
      (i) => {
        var r;
        this._previousMap && Ct(this._previousMap, i.data.map) || (this._applyOrder(i.data.map), (r = this._swapCallback) == null || r.call(this, i), this._previousMap = i.data.map);
      },
      e
    ), this.setupMutationObserver();
  }
  setupMutationObserver() {
    new MutationObserver((e) => {
      e.some((i) => i.type === "childList") && qe(this._rootEl) && (this._slotElMap = this._createSlotElMap(), this._itemElMap = this._createItemElMap());
    }).observe(this._rootEl, {
      childList: !0,
      subtree: !0
    });
  }
  setEnabled(t) {
    this._veloxiApp.getPlugin("Swapy").setEnabled(t);
  }
  setSwapCallback(t) {
    this._swapCallback = t;
  }
  _applyOrder(t) {
    Array.from(t.keys()).forEach((e) => {
      var o;
      if (t.get(e) === ((o = this._previousMap) == null ? void 0 : o.get(e)))
        return;
      const i = t.get(e);
      if (!i) return;
      const r = this._slotElMap.get(e), s = this._itemElMap.get(i);
      !r || !s || (r.innerHTML = "", r.appendChild(s));
    });
  }
  _createSlotElMap() {
    return Array.from(
      this._rootEl.querySelectorAll("[data-swapy-slot]")
    ).reduce((t, e) => (t.set(e.dataset.swapySlot, e), t), /* @__PURE__ */ new Map());
  }
  _createItemElMap() {
    return Array.from(
      this._rootEl.querySelectorAll("[data-swapy-item]")
    ).reduce((t, e) => (t.set(e.dataset.swapyItem, e), t), /* @__PURE__ */ new Map());
  }
}
export {
  Ye as createSwapy
};
