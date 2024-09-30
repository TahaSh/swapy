var Kt = Object.defineProperty;
var Gt = (r, t, e) => t in r ? Kt(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var R = (r, t, e) => Gt(r, typeof t != "symbol" ? t + "" : t, e);
function dt(r, t) {
  if (r.size !== t.size)
    return !1;
  for (let [e, i] of r)
    if (!t.has(e) || t.get(e) !== i)
      return !1;
  return !0;
}
let Zt = 0;
function Jt() {
  return Zt++ + "";
}
var Qt = Object.defineProperty, te = (r, t, e) => t in r ? Qt(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e, o = (r, t, e) => te(r, typeof t != "symbol" ? t + "" : t, e);
class rt {
  constructor(t) {
    o(this, "x"), o(this, "y"), o(this, "target"), this.x = t.x, this.y = t.y, this.target = t.target;
  }
}
class vt extends rt {
}
class at extends rt {
}
class ot extends rt {
}
class lt extends rt {
}
class $t {
  constructor(t) {
    o(this, "pluginId"), o(this, "pluginName"), o(this, "viewName"), o(this, "dataName"), o(this, "dataValue"), this.event = t, this.pluginId = t.pluginId, this.pluginName = t.pluginName, this.viewName = t.viewName, this.dataName = t.dataName, this.dataValue = t.dataValue;
  }
}
function ee(r) {
  return r.replace(/(?:^\w|[A-Z]|\b\w)/g, function(t, e) {
    return e === 0 ? t.toLowerCase() : t.toUpperCase();
  }).replace(/\s+/g, "").replace(/-+/g, "");
}
function Ct(r) {
  return r.split("").map((t, e) => t.toUpperCase() === t ? `${e !== 0 ? "-" : ""}${t.toLowerCase()}` : t).join("");
}
class et {
  constructor(t) {
    o(this, "node"), this.node = t.node;
  }
}
class gt {
  constructor(t) {
    o(this, "node"), this.node = t.node;
  }
}
class ie {
  constructor(t) {
    o(this, "_eventBus"), o(this, "_observer"), this._eventBus = t, this._observer = new MutationObserver(this._handler.bind(this)), this._observer.observe(document.body, {
      childList: !0,
      subtree: !0,
      attributes: !0,
      attributeOldValue: !0
    });
  }
  _handler(t) {
    t.forEach((e) => {
      e.addedNodes.forEach((s) => {
        if (!(s instanceof HTMLElement) || s.dataset.velViewId || s.parentElement && typeof s.parentElement.dataset.velAdded < "u")
          return;
        let n = s;
        if (s.dataset.velView || (n = s.querySelector("[data-vel-view][data-vel-plugin]")), !n) return;
        this._eventBus.emitEvent(et, { node: n });
        const a = n.querySelectorAll("[data-vel-plugin]");
        a.length && a.forEach((l) => {
          this._eventBus.emitEvent(et, { node: l });
        });
      }), e.removedNodes.forEach((s) => {
        if (!(s instanceof HTMLElement) || typeof s.dataset.velProcessing < "u") return;
        const n = s.querySelectorAll("[data-vel-plugin]");
        n.length && n.forEach((a) => {
          this._eventBus.emitEvent(gt, { node: a });
        }), this._eventBus.emitEvent(gt, { node: s });
      });
      const i = e.attributeName;
      if (i === "data-vel-view" && this._eventBus.emitEvent(et, {
        node: e.target
      }), i && /data-vel-data-.+/gi.test(i)) {
        const s = e.target, n = s.dataset.velPluginId || "", a = s.dataset.velPlugin || "", l = s.dataset.velView || "", h = s.getAttribute(i);
        if (h && h !== e.oldValue) {
          const g = ee(
            i.replace("data-vel-data-", "")
          );
          this._eventBus.emitEvent($t, {
            pluginId: n,
            pluginName: a,
            viewName: l,
            dataName: g,
            dataValue: h
          });
        }
      }
    });
  }
}
class se {
  execute(t) {
    this.call(t);
  }
}
class Lt extends se {
  constructor(t) {
    super(), o(this, "_handler"), this._handler = t;
  }
  getHandler() {
    return this._handler;
  }
  call(t) {
    this._handler(t);
  }
}
class pt {
  constructor() {
    o(this, "_listeners", /* @__PURE__ */ new Map()), o(this, "_keyedListeners", /* @__PURE__ */ new Map());
  }
  subscribeToEvent(t, e, i) {
    if (i) {
      this._subscribeToKeyedEvent(t, e, i);
      return;
    }
    let s = this._listeners.get(t);
    s || (s = [], this._listeners.set(t, s)), s.push(new Lt(e));
  }
  removeEventListener(t, e, i) {
    if (i) {
      this._removeKeyedEventListener(t, e, i);
      return;
    }
    let s = this._listeners.get(t);
    s && (s = s.filter(
      (n) => n.getHandler() !== e
    ), this._listeners.set(t, s));
  }
  _subscribeToKeyedEvent(t, e, i) {
    let s = this._keyedListeners.get(t);
    s || (s = /* @__PURE__ */ new Map(), this._keyedListeners.set(t, s));
    let n = s.get(i);
    n || (n = [], s.set(i, n)), n.push(new Lt(e));
  }
  _removeKeyedEventListener(t, e, i) {
    let s = this._keyedListeners.get(t);
    if (!s)
      return;
    let n = s.get(i);
    n && (n = n.filter(
      (a) => a.getHandler() !== e
    ), s.set(i, n));
  }
  emitEvent(t, e, i) {
    if (i) {
      this._emitKeyedEvent(t, e, i);
      return;
    }
    const s = this._listeners.get(t);
    s && s.forEach((n) => {
      n.execute(e);
    });
  }
  _emitKeyedEvent(t, e, i) {
    const s = this._keyedListeners.get(t);
    if (!s) return;
    const n = s.get(i);
    n && n.forEach((a) => {
      a.execute(e);
    });
  }
  _convertListener(t) {
    return (e) => t(e);
  }
  subscribeToPluginReadyEvent(t, e, i = !1) {
    if (i) {
      this.subscribeToEvent(
        Dt,
        this._convertListener(t),
        e
      );
      return;
    }
    this.subscribeToEvent(
      Ot,
      this._convertListener(t),
      e
    );
  }
  emitPluginReadyEvent(t, e, i = !1) {
    if (i) {
      this.emitEvent(
        Dt,
        e,
        t
      );
      return;
    }
    this.emitEvent(
      Ot,
      e,
      t
    );
  }
  reset() {
    this._listeners.clear();
  }
}
let ne = 0;
function zt() {
  return ne++ + "";
}
class Wt {
  constructor(t, e, i, s, n, a, l) {
    o(this, "_registry"), o(this, "_eventBus"), o(this, "_appEventBus"), o(this, "_internalEventBus"), o(this, "_initialized", !1), o(this, "_config"), o(this, "_pluginFactory"), o(this, "_pluginName"), o(this, "_id"), o(this, "_pluginKey"), o(this, "_layoutIdViewMapWaitingToEnter"), o(this, "_apiData"), o(this, "_isReady", !1), this._id = zt(), this._pluginFactory = t, this._pluginName = e, this._registry = i, this._eventBus = s, this._appEventBus = n, this._internalEventBus = new pt(), this._config = a, this._layoutIdViewMapWaitingToEnter = /* @__PURE__ */ new Map(), this._pluginKey = l, this._apiData = {}, this._appEventBus.subscribeToPluginReadyEvent(
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
    this._internalEventBus.emitEvent(t, e, this.pluginKey);
  }
  on(t, e) {
    this._internalEventBus.subscribeToEvent(t, e, this.pluginKey);
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
        var s, n;
        if ((s = t.onAddCallbacks) != null && s.afterRemoved && t.layoutId) {
          const a = this._layoutIdViewMapWaitingToEnter.get(
            t.layoutId
          );
          (n = a == null ? void 0 : a.onAddCallbacks) == null || n.afterEnter(a), this._layoutIdViewMapWaitingToEnter.delete(t.layoutId);
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
    const e = t.previousRect.viewportOffset, i = t.previousRect.size, s = t.rotation.degrees < 0 ? 0 : Math.sin(t.rotation.radians) * i.height * t.scale.y, n = t.rotation.degrees > 0 ? 0 : Math.sin(t.rotation.radians) * i.width * t.scale.y, a = t.element.cloneNode(!0);
    t.element.remove(), a.style.cssText = "", a.style.position = "absolute", a.style.left = `${e.left + s}px`, a.style.top = `${e.top - n}px`, a.style.width = `${i.width}px`, a.style.height = `${i.height}px`, a.style.transform = `
      scale3d(${t.scale.x}, ${t.scale.y}, 1) rotate(${t.rotation.degrees}deg)
    `, a.style.pointerEvents = "none", a.dataset.velRemoved = "", document.body.appendChild(a);
    const l = this._registry.createView(a, t.name);
    return l.setAsTemporaryView(), l.styles.position = "absolute", l.styles.left = `${e.left + s}px`, l.styles.top = `${e.top - n}px`, l.rotation.setDegrees(t.rotation.degrees, !1), l.scale.set({ x: t.scale.x, y: t.scale.y }, !1), l.size.set(
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
    var e, i, s;
    !((e = t.onAddCallbacks) != null && e.onInitialLoad) && !this._initialized || ((i = t.onAddCallbacks) == null || i.beforeEnter(t), !((s = t.onAddCallbacks) != null && s.afterRemoved) || !this._initialized ? requestAnimationFrame(() => {
      var n;
      (n = t.onAddCallbacks) == null || n.afterEnter(t);
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
class re extends Wt {
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
class ft extends Wt {
  isRenderable() {
    return !1;
  }
}
class ae {
  constructor(t) {
    o(this, "_plugin"), this._plugin = t;
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
function ct(r, t, e, i, s, n) {
  if (oe(r))
    return new r(
      r,
      r.pluginName,
      t,
      e,
      i,
      s,
      n
    );
  const a = new re(
    r,
    r.pluginName,
    t,
    e,
    i,
    s,
    n
  ), l = new ae(a);
  return r(l), a;
}
function oe(r) {
  var t;
  return ((t = r.prototype) == null ? void 0 : t.constructor.toString().indexOf("class ")) === 0;
}
class u {
  constructor(t, e) {
    o(this, "x"), o(this, "y"), this.x = t, this.y = e;
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
class le {
  constructor(t) {
    o(this, "_element"), o(this, "_callback"), this._element = t, this._observe();
  }
  setElement(t) {
    this._element = t, this._observe();
  }
  _observe() {
    var t;
    const e = new MutationObserver(() => {
      var n;
      (n = this._callback) == null || n.call(this, !1);
    }), i = {
      attributes: !0,
      childList: !0,
      attributeOldValue: !0
    };
    e.observe(this._element, i), new ResizeObserver(() => {
      var n;
      (n = this._callback) == null || n.call(this, !0);
    }).observe(this._element);
    function s(n, a) {
      let l, h = !0;
      return function() {
        h && (n(), h = !1), clearTimeout(l), l = setTimeout(() => {
          n(), h = !0;
        }, a);
      };
    }
    (t = this._element.parentElement) == null || t.addEventListener(
      "scroll",
      s(() => {
        var n;
        (n = this._callback) == null || n.call(this, !0);
      }, 30)
    ), window.addEventListener(
      "scroll",
      s(() => {
        var n;
        (n = this._callback) == null || n.call(this, !0);
      }, 30)
    ), window.addEventListener(
      "resize",
      s(() => {
        var n;
        (n = this._callback) == null || n.call(this, !0);
      }, 30)
    );
  }
  onChange(t) {
    this._callback = t;
  }
}
function he(r) {
  return new le(r);
}
function ue(r, t) {
  const e = t.x - r.x, i = t.y - r.y;
  return Math.sqrt(e * e + i * i);
}
function _(r, t) {
  const e = r - t;
  return Math.abs(e) <= 0.01;
}
function x(r) {
  let t = r.match(/^([\d.]+)([a-zA-Z%]*)$/);
  t || (t = "0px".match(/^([\d.]+)([a-zA-Z%]*)$/));
  const e = parseFloat(t[1]), i = t[2];
  return { value: e, unit: i, valueWithUnit: r };
}
function ce(r, t, e = !1) {
  if (r === t) return !0;
  if (r.length !== t.length) return !1;
  for (let i = 0; i < r.length; i++)
    if (e && !_(r[i].value, t[i].value) || r[i].value !== t[i].value)
      return !1;
  return !0;
}
function It(r, t) {
  return ce(r, t, !0);
}
class G {
  constructor(t, e, i, s) {
    o(this, "_topLeft"), o(this, "_topRight"), o(this, "_bottomLeft"), o(this, "_bottomRight"), this._topLeft = t, this._topRight = e, this._bottomLeft = i, this._bottomRight = s;
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
    const e = this._convertToPercentage(this._topLeft, t), i = this._convertToPercentage(this._topRight, t), s = this._convertToPercentage(this._bottomLeft, t), n = this._convertToPercentage(this._bottomRight, t);
    return `${e.h} ${i.h} ${n.h} ${s.h} / ${e.v} ${i.v} ${n.v} ${s.v}`;
  }
  _convertToPercentage(t, e) {
    if (t.unit === "%")
      return { h: `${t.value}%`, v: `${t.value}%` };
    const i = t.value / e.width * 100, s = t.value / e.height * 100;
    return { h: `${i}%`, v: `${s}%` };
  }
}
function _t(r) {
  const t = r.split(" ").map((i) => x(i)), e = {
    value: 0,
    unit: "",
    valueWithUnit: "0"
  };
  switch (t.length) {
    case 1:
      return new G(t[0], t[0], t[0], t[0]);
    case 2:
      return new G(t[0], t[1], t[0], t[1]);
    case 3:
      return new G(t[0], t[1], t[2], t[1]);
    case 4:
      return new G(t[0], t[1], t[3], t[2]);
    default:
      return new G(
        e,
        e,
        e,
        e
      );
  }
}
function de(r, t) {
  const e = a(r.topLeft, t), i = a(r.topRight, t), s = a(r.bottomLeft, t), n = a(r.bottomRight, t);
  return {
    v: {
      topLeft: e.v,
      topRight: i.v,
      bottomRight: n.v,
      bottomLeft: s.v
    },
    h: {
      topLeft: e.h,
      topRight: i.h,
      bottomRight: n.h,
      bottomLeft: s.h
    }
  };
  function a(l, h) {
    if (l.unit === "%")
      return {
        h: x(`${l.value}%`),
        v: x(`${l.value}%`)
      };
    const g = l.value / h.width * 100, d = l.value / h.height * 100;
    return { h: x(`${g}%`), v: x(`${d}%`) };
  }
}
function Nt(r, t) {
  return _(r.topLeft.value, t.topLeft.value) && _(r.topRight.value, t.topRight.value) && _(r.bottomRight.value, t.bottomRight.value) && _(r.bottomLeft.value, t.bottomLeft.value);
}
class ge {
  constructor(t) {
    o(this, "_value"), this._value = t;
  }
  get value() {
    return this._value;
  }
  equals(t) {
    return _(this.value, t.value);
  }
}
function pe(r) {
  return new ge(parseFloat(r));
}
class _e {
  constructor(t, e) {
    o(this, "_x"), o(this, "_y"), this._x = t, this._y = e;
  }
  get value() {
    return new u(this._x, this._y);
  }
}
function me(r, t) {
  const [e, i] = r.split(" "), s = x(e), n = x(i);
  return new _e(
    s.value / t.width,
    n.value / t.height
  );
}
function Mt(r, t) {
  const e = ve(r), i = r.offsetWidth, s = r.offsetHeight;
  return {
    viewportOffset: {
      left: Math.round(e.left),
      top: Math.round(e.top),
      right: Math.round(e.right),
      bottom: Math.round(e.bottom)
    },
    pageOffset: t.read({
      width: i,
      height: s
    }),
    size: {
      width: i,
      height: s
    }
  };
}
function ve(r) {
  const t = r.getBoundingClientRect();
  return {
    left: t.left,
    top: t.top,
    right: t.right,
    bottom: t.bottom,
    width: t.width,
    height: t.height
  };
}
function Bt(r) {
  let t = r, e = 0, i = 0;
  for (; t; )
    e += t.offsetTop, i += t.offsetLeft, t = t.offsetParent;
  return { top: e, left: i };
}
class fe {
  constructor(t) {
    o(this, "_currentPageRect"), o(this, "_view"), o(this, "_element"), o(this, "_offsetLeft"), o(this, "_offsetTop"), o(this, "_width"), o(this, "_height"), o(this, "_parentWidth"), o(this, "_parentHeight"), o(this, "_parentEl"), o(this, "_isSvg"), o(this, "_invalid"), this._invalid = !0, this._view = t, this._element = t.element, this._isSvg = !!this._element.closest("svg"), this._offsetLeft = 0, this._offsetTop = 0, this._width = 0, this._height = 0, this._parentWidth = 0, this._parentHeight = 0, this._offsetLeft = 0, this._parentEl = this._element.parentElement, window.addEventListener("resize", () => {
      this.invalidate();
    });
  }
  invalidate() {
    this._invalid = !0;
  }
  read(t) {
    if (this._isSvg)
      return this._currentPageRect || (this._currentPageRect = Bt(this._element)), this._currentPageRect;
    const e = this._element.parentElement, i = this._element.offsetLeft, s = this._element.offsetTop, n = t.width, a = t.height, l = (e == null ? void 0 : e.offsetWidth) || 0, h = (e == null ? void 0 : e.offsetHeight) || 0;
    return (this._offsetLeft !== i || this._offsetTop !== s || !_(this._width, n) || !_(this._height, a)) && this._view._children.forEach(
      (g) => g.elementReader.invalidatePageRect()
    ), !this._invalid && this._currentPageRect && this._offsetLeft === i && this._offsetTop === s && _(this._width, n) && _(this._height, a) && _(this._parentWidth, l) && _(this._parentHeight, h) && this._parentEl === e ? this._currentPageRect : (this._offsetLeft = i, this._offsetTop = s, this._width = n, this._height = a, this._parentWidth = l, this._parentHeight = h, this._parentEl = e, this._currentPageRect = Bt(this._element), this._invalid = !1, this._currentPageRect);
  }
}
function we(r) {
  return new fe(r);
}
class ye {
  constructor(t) {
    o(this, "_element"), o(this, "_rect"), o(this, "_computedStyle"), o(this, "_pageRectReader"), o(this, "_scroll"), this._element = t.element, this._pageRectReader = we(t), this._rect = Mt(this._element, this._pageRectReader), this._computedStyle = getComputedStyle(this._element), this._scroll = this._calculateScroll();
  }
  invalidatePageRect() {
    this._pageRectReader.invalidate();
  }
  update(t = !1) {
    this._rect = Mt(this._element, this._pageRectReader), this._computedStyle = getComputedStyle(this._element), t && (this._scroll = this._calculateScroll());
  }
  get rect() {
    return this._rect;
  }
  get opacity() {
    return pe(this._computedStyle.opacity);
  }
  get borderRadius() {
    return _t(this._computedStyle.borderRadius);
  }
  get origin() {
    return me(
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
function Ft(r) {
  return new ye(r);
}
function mt(r, t) {
  const e = {
    set: (i, s, n) => (typeof i[s] == "object" && i[s] !== null ? i[s] = mt(n, t) : (t(), i[s] = n), !0),
    get: (i, s) => typeof i[s] == "object" && i[s] !== null ? mt(i[s], t) : i[s]
  };
  return new Proxy(r, e);
}
const st = 0.01, wt = {
  speed: 15
};
class yt {
  constructor(t) {
    o(this, "name", "dynamic"), o(this, "_config"), this._config = t;
  }
  get config() {
    return this._config;
  }
}
class Ve extends yt {
  update({ animatorProp: t, current: e, target: i, dt: s }) {
    const n = u.sub(i, e), a = u.scale(n, this._config.speed);
    let l = u.add(e, u.scale(a, s));
    return this._shouldFinish(i, e, a) && (l = i, requestAnimationFrame(() => {
      t.callCompleteCallback();
    })), t.callUpdateCallback(), l;
  }
  _shouldFinish(t, e, i) {
    return u.sub(t, e).magnitude < st && i.magnitude < st;
  }
}
class be extends yt {
  update({ animatorProp: t, current: e, target: i, dt: s }) {
    const n = (i - e) * this._config.speed;
    let a = e + n * s;
    return _(a, i) && (a = i, requestAnimationFrame(() => {
      t.callCompleteCallback();
    })), t.callUpdateCallback(), a;
  }
}
class Pe extends yt {
  update({ animatorProp: t, current: e, target: i, dt: s }) {
    return i.map((n, a) => {
      const l = e[a], h = n.value === 0 ? l.unit : n.unit, g = (n.value - l.value) * this._config.speed, d = l.value + g * s;
      let p = x(`${d}${h}`);
      return this._shouldFinish(n.value, l.value, g) && (p = n, requestAnimationFrame(() => {
        t.callCompleteCallback();
      })), t.callUpdateCallback(), p;
    });
  }
  _shouldFinish(t, e, i) {
    return Math.abs(t - e) < st && Math.abs(i) < st;
  }
}
class Vt {
  constructor() {
    o(this, "name", "instant"), o(this, "_config", {});
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
const bt = {
  stiffness: 0.5,
  damping: 0.75,
  speed: 10
}, nt = 0.01;
class Pt {
  constructor(t) {
    o(this, "name", "spring"), o(this, "_config"), this._config = t;
  }
  get config() {
    return this._config;
  }
}
class Ee extends Pt {
  constructor() {
    super(...arguments), o(this, "_velocity", new u(0, 0));
  }
  update({ animatorProp: t, current: e, target: i, dt: s }) {
    const n = u.scale(
      u.scale(u.sub(e, i), -1),
      this._config.stiffness
    );
    this._velocity = u.add(this._velocity, n), this._velocity = u.scale(this._velocity, this._config.damping);
    let a = u.add(
      e,
      u.scale(this._velocity, s * this._config.speed)
    );
    return this._shouldFinish(i, e) && (a = i, requestAnimationFrame(() => {
      t.callCompleteCallback();
    })), a;
  }
  _shouldFinish(t, e) {
    return u.sub(t, e).magnitude < nt && this._velocity.magnitude < nt;
  }
}
class Re extends Pt {
  constructor() {
    super(...arguments), o(this, "_velocity", 0);
  }
  update({ animatorProp: t, current: e, target: i, dt: s }) {
    const n = -(e - i) * this._config.stiffness;
    this._velocity += n, this._velocity *= this._config.damping;
    let a = e + this._velocity * s * this._config.speed;
    return _(a, i) && (a = i, requestAnimationFrame(() => {
      t.callCompleteCallback();
    })), a;
  }
}
class xe extends Pt {
  constructor() {
    super(...arguments), o(this, "_velocity", 0);
  }
  update({ animatorProp: t, current: e, target: i, dt: s }) {
    return i.map((n, a) => {
      const l = e[a], h = n.value === 0 ? l.unit : n.unit, g = -(l.value - n.value) * this._config.stiffness;
      this._velocity += g, this._velocity *= this._config.damping;
      const d = l.value + this._velocity * s * this._config.speed;
      let p = x(`${d}${h}`);
      return this._shouldFinish(n.value, l.value) && (p = n, requestAnimationFrame(() => {
        t.callCompleteCallback();
      })), p;
    });
  }
  _shouldFinish(t, e) {
    return Math.abs(t - e) < nt && Math.abs(this._velocity) < nt;
  }
}
function Ae(r) {
  return r;
}
const Et = {
  duration: 350,
  ease: Ae
};
class Rt {
  constructor(t) {
    o(this, "name", "tween"), o(this, "_config"), o(this, "_startTime"), this._config = t;
  }
  get config() {
    return this._config;
  }
  reset() {
    this._startTime = void 0;
  }
}
class Te extends Rt {
  update({ animatorProp: t, initial: e, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return _(n, 1) ? (requestAnimationFrame(() => {
      t.callCompleteCallback();
    }), i) : u.add(
      e,
      u.scale(u.sub(i, e), this._config.ease(n))
    );
  }
}
class Se extends Rt {
  update({ animatorProp: t, initial: e, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return _(n, 1) ? (requestAnimationFrame(() => {
      t.callCompleteCallback();
    }), i) : e.map((a, l) => {
      const h = i[l], g = h.value === 0 ? a.unit : h.unit, d = a.value + this._config.ease(n) * (i[l].value - a.value);
      return x(`${d}${g}`);
    });
  }
}
class Ce extends Rt {
  update({ animatorProp: t, initial: e, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return _(n, 1) ? (requestAnimationFrame(() => {
      t.callCompleteCallback();
    }), i) : e + (i - e) * this._config.ease(n);
  }
}
class xt {
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
class tt extends xt {
  createInstantAnimator() {
    return new Vt();
  }
  createTweenAnimator(t) {
    return new Te({ ...Et, ...t });
  }
  createDynamicAnimator(t) {
    return new Ve({ ...wt, ...t });
  }
  createSpringAnimator(t) {
    return new Ee({ ...bt, ...t });
  }
}
class Le extends xt {
  createInstantAnimator() {
    return new Vt();
  }
  createTweenAnimator(t) {
    return new Se({ ...Et, ...t });
  }
  createDynamicAnimator(t) {
    return new Pe({
      ...wt,
      ...t
    });
  }
  createSpringAnimator(t) {
    return new xe({ ...bt, ...t });
  }
}
class kt extends xt {
  createInstantAnimator() {
    return new Vt();
  }
  createDynamicAnimator(t) {
    return new be({ ...wt, ...t });
  }
  createTweenAnimator(t) {
    return new Ce({ ...Et, ...t });
  }
  createSpringAnimator(t) {
    return new Re({ ...bt, ...t });
  }
}
function Z(r) {
  return structuredClone(r);
}
class Ie {
  constructor(t) {
    o(this, "_viewProp"), o(this, "_completeCallback"), o(this, "_updateCallback"), o(this, "_isAnimating"), this._viewProp = t, this._isAnimating = !1;
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
class k {
  constructor(t, e, i) {
    o(this, "_animatorProp"), o(this, "_animator"), o(this, "_initialValue"), o(this, "_previousValue"), o(this, "_targetValue"), o(this, "_currentValue"), o(this, "_hasChanged"), o(this, "_view"), o(this, "_animatorFactory"), o(this, "_previousRenderValue"), this._animatorProp = new Ie(this), this._animatorFactory = t, this._initialValue = Z(e), this._previousValue = Z(e), this._targetValue = Z(e), this._currentValue = Z(e), this._hasChanged = !1, this._previousRenderValue = void 0, this._view = i, this._animator = this._animatorFactory.createInstantAnimator();
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
    var i, s;
    this._previousValue = Z(this._currentValue), this._targetValue = t, e ? ((s = (i = this._animator).reset) == null || s.call(i), this.animator.markAsAnimating()) : this._currentValue = t, this._hasChanged = !0;
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
class Ne extends k {
  constructor() {
    super(...arguments), o(this, "_invertedBorderRadius"), o(this, "_forceStyleUpdateThisFrame", !1), o(this, "_updateWithScale", !1);
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
      const h = _t(t.trim());
      i = {
        topLeft: h.value.topLeft.valueWithUnit,
        topRight: h.value.topRight.valueWithUnit,
        bottomRight: h.value.bottomRight.valueWithUnit,
        bottomLeft: h.value.bottomLeft.valueWithUnit
      };
    } else
      i = t;
    const s = i.topLeft ? x(i.topLeft) : this._currentValue[0], n = i.topRight ? x(i.topRight) : this._currentValue[1], a = i.bottomRight ? x(i.bottomRight) : this._currentValue[2], l = i.bottomLeft ? x(i.bottomLeft) : this._currentValue[3];
    this._setTarget([s, n, a, l], e);
  }
  reset(t = !0) {
    this._setTarget(this._initialValue, t);
  }
  update(t, e) {
    if (this._forceStyleUpdateThisFrame)
      this._hasChanged = !0, this._forceStyleUpdateThisFrame = !1;
    else if (this._view.scale.isAnimating && this._updateWithScale)
      this._hasChanged = !0;
    else if (It(this._targetValue, this._currentValue)) {
      this._hasChanged = !It(
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
    this._invertedBorderRadius = de(
      _t(
        `${this._currentValue[0].valueWithUnit} ${this._currentValue[1].valueWithUnit} ${this._currentValue[2].valueWithUnit} ${this._currentValue[3].valueWithUnit}`
      ).value,
      {
        width: t,
        height: e
      }
    );
  }
  get shouldRender() {
    return this._hasChanged ? this._previousRenderValue ? !(Nt(
      this.renderValue.v,
      this._previousRenderValue.v
    ) && Nt(this.renderValue.h, this._previousRenderValue.h)) : !0 : !1;
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
class Me extends k {
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
class Be extends k {
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
class Fe extends k {
  constructor() {
    super(...arguments), o(this, "_animateLayoutUpdateNextFrame", !1), o(this, "_parentScaleInverse", new u(1, 1));
  }
  get _parentDiff() {
    let t = this._view._parent, e = 0, i = 0;
    if (t) {
      const s = t.rect.pageOffset, n = t.getScroll(), a = {
        left: t.previousRect.viewportOffset.left + n.x,
        top: t.previousRect.viewportOffset.top + n.y
      };
      e = a.left - s.left, i = a.top - s.top;
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
    const e = typeof t.x > "u" ? this.initialX : t.x, i = typeof t.y > "u" ? this.initialY : t.y, s = new u(e, i), n = new u(this.initialX, this.initialY), a = new u(this.x, this.y), l = u.sub(a, n), h = u.sub(s, n);
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
      const h = this._view._parent, g = h ? h.scale.x : 1, d = h ? h.scale.y : 1;
      this._parentScaleInverse = new u(1 / g, 1 / d), this._parentScaleInverse.equals(new u(1, 1)) || (this._hasChanged = !0);
    }
    if (this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y)
      return;
    const i = this._view._parent, s = i ? i.scale.x : 1, n = i ? i.scale.y : 1, a = i ? i.scale._previousValue.x : 1, l = i ? i.scale._previousValue.y : 1;
    this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: new u(
        this._currentValue.x * s,
        this._currentValue.y * n
      ),
      target: this._targetValue,
      initial: new u(
        this._previousValue.x * a,
        this._previousValue.y * l
      ),
      ts: t,
      dt: e
    }), this._currentValue = new u(
      this._currentValue.x / s,
      this._currentValue.y / n
    );
  }
  _runLayoutTransition() {
    const t = !(this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y), e = !(this._view.scale._targetValue.x === this._view.scale._currentValue.x && this._view.scale._targetValue.y === this._view.scale._currentValue.y), i = t || e, s = this._rect.pageOffset.left - this._previousRect.pageOffset.left, n = this._rect.pageOffset.top - this._previousRect.pageOffset.top, a = this._previousRect.size.width / this._rect.size.width, l = this._previousRect.size.height / this._rect.size.height;
    let h = !1;
    if (s !== 0 || n !== 0 || !Number.isNaN(a) && a !== 1 || !Number.isNaN(l) && l !== 1 ? h = !0 : h = (() => {
      const g = this._view._parents;
      for (let d = 0; d < g.length; d++) {
        const p = g[d], w = p.previousRect.size.width / p.rect.size.width, V = p.previousRect.size.height / p.rect.size.height;
        if (w !== 1 || V !== 1)
          return !0;
      }
      return !1;
    })(), h) {
      if (this._currentValue.x !== 0 || this._currentValue.y !== 0 || this._view.scale._currentValue.x !== 1 || this._view.scale._currentValue.y !== 1) {
        if (!i) {
          const C = this._rect.pageOffset.left - this._previousRect.pageOffset.left, $ = this._rect.pageOffset.top - this._previousRect.pageOffset.top;
          this._setTarget(
            new u(this._currentValue.x - C, this._currentValue.y - $),
            !1
          );
          return;
        }
        const E = this._view._parent, X = this._rect.pageOffset, H = this._view.getScroll(), N = {
          left: this._previousRect.viewportOffset.left + H.x,
          top: this._previousRect.viewportOffset.top + H.y
        }, ht = N.left - X.left, Q = N.top - X.top;
        let D = 0, M = 0, P = 0, B = 0;
        if (E) {
          const C = E.rect.pageOffset, $ = E.getScroll(), c = {
            left: E.previousRect.viewportOffset.left + $.x,
            top: E.previousRect.viewportOffset.top + $.y
          };
          D = c.left - C.left, M = c.top - C.top;
          const m = N.top - c.top, v = N.left - c.left, j = E.scale.y * m;
          P = (m - j) / E.scale.y;
          const f = E.scale.x * v;
          B = (v - f) / E.scale.x;
        }
        this._setTarget(
          new u(ht - D + B, Q - M + P),
          !1
        ), i && (this._animateLayoutUpdateNextFrame = !0);
        return;
      }
      this._animateLayoutUpdateNextFrame = !0;
      const g = this._previousRect, d = this._rect, p = this._view._parent;
      let w = 0, V = 0;
      p && (w = p.previousRect.viewportOffset.left - p.rect.viewportOffset.left), p && (V = p.previousRect.viewportOffset.top - p.rect.viewportOffset.top);
      let y = 1, A = 1;
      p && (y = p.previousRect.size.width / p.rect.size.width, A = p.previousRect.size.height / p.rect.size.height);
      const b = p ? p.previousRect.viewportOffset.left : 0, O = p ? p.previousRect.viewportOffset.top : 0, q = g.viewportOffset.left - b, T = g.viewportOffset.top - O, U = q / y - q, Y = T / A - T;
      let S = g.viewportOffset.left - d.viewportOffset.left - w + U, L = g.viewportOffset.top - d.viewportOffset.top - V + Y;
      S = Number.isFinite(S) ? S : 0, L = Number.isFinite(L) ? L : 0, this._setTarget(new u(S, L), !1);
    } else this._animateLayoutUpdateNextFrame && (this._setTarget(this._initialValue, !0), this._animateLayoutUpdateNextFrame = !1);
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
class ke extends k {
  constructor() {
    super(...arguments), o(this, "_unit", "deg");
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
class Oe extends k {
  constructor() {
    super(...arguments), o(this, "_animateLayoutUpdateNextFrame", !1);
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
    let i = this._currentValue.x, s = this._currentValue.y;
    t.width && (i = t.width / this._rect.size.width), t.height && (s = t.height / this._rect.size.height), !t.width && t.height && (i = s), !t.height && t.width && (s = i);
    const n = { x: i, y: s };
    this._setTarget(new u(n.x, n.y), e);
  }
  reset(t = !0) {
    this._setTarget(new u(1, 1), t);
  }
  update(t, e) {
    if (this._view.layoutOption !== "position") {
      if ((this._view.isInverseEffectEnabled || this._view.isLayoutTransitionEnabled) && !this._view.isTemporaryView && this._runLayoutTransition(), this._view.isInverseEffectEnabled) {
        const i = this._view._parent, s = i ? i.scale.x : 1, n = i ? i.scale.y : 1;
        this._hasChanged = s !== 1 || n !== 1;
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
    let s = !1;
    if ((!Number.isNaN(e) && e !== 1 || !Number.isNaN(i) && i !== 1) && (s = !0), s) {
      if (this._currentValue.x !== 1 || this._currentValue.y !== 1) {
        const g = this._view.previousRect.size.width / this._view.rect.size.width, d = this._view.previousRect.size.height / this._view.rect.size.height;
        this._setTarget(
          new u(this._currentValue.x * g, this._currentValue.y * d),
          !1
        ), t && (this._animateLayoutUpdateNextFrame = !0);
        return;
      }
      const n = this._previousRect.size.width / this._rect.size.width, a = this._previousRect.size.height / this._rect.size.height, l = n, h = a;
      this._view.viewProps.borderRadius.applyScaleInverse(), this._setTarget(new u(l, h), !1), this._animateLayoutUpdateNextFrame = !0;
    } else this._animateLayoutUpdateNextFrame && (this._setTarget(this._initialValue, !0), this._animateLayoutUpdateNextFrame = !1);
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
    const t = this._view._parent ? this._view._parent.scale.x : 1, e = this._view._parent ? this._view._parent.scale.y : 1, i = this._currentValue.x / t, s = this._currentValue.y / e;
    return new u(i, s);
  }
  projectStyles() {
    const t = this.renderValue, e = `scale3d(${t.x}, ${t.y}, 1)`;
    return this._previousRenderValue = t, e;
  }
  isTransform() {
    return !0;
  }
}
class De extends k {
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
class $e {
  constructor(t) {
    o(this, "_props", /* @__PURE__ */ new Map()), this._props.set(
      "position",
      new Fe(new tt(), new u(0, 0), t)
    ), this._props.set(
      "scale",
      new Oe(new tt(), new u(1, 1), t)
    ), this._props.set(
      "rotation",
      new ke(new kt(), 0, t)
    ), this._props.set(
      "size",
      new De(
        new tt(),
        new u(t.rect.size.width, t.rect.size.height),
        t
      )
    ), this._props.set(
      "opacity",
      new Me(
        new kt(),
        t.elementReader.opacity.value,
        t
      )
    ), this._props.set(
      "borderRadius",
      new Ne(
        new Le(),
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
      new Be(
        new tt(),
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
class ze {
  constructor(t, e, i, s) {
    o(this, "id"), o(this, "name"), o(this, "element"), o(this, "styles", {}), o(this, "_viewProps"), o(this, "_previousRect"), o(this, "_onAddCallbacks"), o(this, "_onRemoveCallback"), o(this, "_skipFirstRenderFrame"), o(this, "_layoutTransition"), o(this, "_registry"), o(this, "_layoutId"), o(this, "_elementReader"), o(this, "_viewParents"), o(this, "_temporaryView"), o(this, "_inverseEffect"), o(this, "_renderNextTick"), o(this, "_layoutOption"), o(this, "_elementObserver"), o(this, "_hasReadElement"), o(this, "_shouldReadRect"), o(this, "_readWithScroll"), o(this, "_externalUserStyles"), this._registry = i, this.id = zt(), this.name = e, this.element = t, this.element.dataset.velViewId = this.id, this._elementReader = Ft(this), this._viewParents = this._getParents(), this._previousRect = this._elementReader.rect, this._viewProps = new $e(this), this._skipFirstRenderFrame = !0, this._layoutId = s, this._layoutTransition = !1, this._temporaryView = !1, this.styles = mt(this.styles, () => {
      this._renderNextTick = !0;
    }), this._externalUserStyles = this._getExternalUserStyles(), this._renderNextTick = !1, this._layoutOption = this._getLayoutOption(), this._hasReadElement = !1, this._shouldReadRect = !1, this._readWithScroll = !1, this._elementObserver = he(t), this._elementObserver.onChange((n) => {
      if (this._hasReadElement) {
        this._shouldReadRect = !1;
        return;
      }
      this._externalUserStyles = this._getExternalUserStyles(), this._shouldReadRect = !0, this._readWithScroll = n;
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
    this.element = t, this._elementReader = Ft(this), this.element.dataset.velViewId = this.id, this._elementObserver.setElement(t), this._viewParents = this._getParents();
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
    if (!i) return e;
    for (i = i.closest("[data-vel-view-id]"); i; ) {
      const s = i.dataset.velViewId;
      if (s) {
        const n = this._registry.getViewById(s);
        n && e.push(n);
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
      const s = t[`velData${i[0].toUpperCase()}${i.slice(1)}`];
      return !e[i] && s && (e[i] = s), e;
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
    const i = this.element.getBoundingClientRect(), s = {
      x: i.left,
      y: i.top
    };
    return t >= s.x && t <= s.x + i.width && e >= s.y && e <= s.y + i.height;
  }
  // Using AABB collision detection
  overlapsWith(t) {
    const e = t._localWidth * t.scale.x, i = t._localHeight * t.scale.y, s = this._localWidth * this.scale.x, n = this._localHeight * this.scale.y;
    return this.position.x < t.position.x + e && this.position.x + s > t.position.x && this.position.y < t.position.y + i && this.position.y + n > t.position.y;
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
    let s;
    for (; (s = i.exec(t)) !== null; ) {
      const [n, a, l] = s;
      if (!l.trim()) continue;
      const h = a.replace(/^-\w+-/, "");
      (!e.has(h) || !a.startsWith("-")) && e.set(
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
    const e = this._viewProps.allProps(), i = e.filter((n) => n.isTransform()), s = e.filter((n) => !n.isTransform());
    if (i.some((n) => n.hasChanged())) {
      const n = i.reduce((a, l, h) => (a += l.projectStyles(), h < i.length - 1 && (a += " "), h === i.length - 1 && (a += ";"), a), "transform: ");
      t += n;
    }
    s.forEach((n) => {
      n.hasChanged() && (t += n.projectStyles());
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
    ], s = {};
    for (const n in e)
      e.hasOwnProperty(n) && (s[Ct(n)] = e[n]);
    return t.split(";").map((n) => n.trim()).filter(Boolean).filter((n) => {
      const a = n.indexOf(":");
      if (a === -1) return !1;
      const l = n.slice(0, a).trim();
      return !s.hasOwnProperty(l) && !i.includes(l);
    }).join("; ");
  }
  _getUserStyles() {
    return Object.keys(this.styles).reduce((t, e) => {
      if (!e) return t;
      const i = Ct(e).replace("webkit", "-webkit").replace("moz", "-moz");
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
      var i, s;
      const n = (i = this.viewProps.getPropByName(e)) == null ? void 0 : i.getAnimator();
      n && ((s = t.viewProps.getPropByName(e)) == null || s.setAnimator(n.name, n.config));
    });
  }
  getChildren(t) {
    const e = this.element.querySelectorAll("*"), i = Array.from(e).filter((s) => {
      const n = s;
      return typeof n.dataset.velViewId < "u" && n.dataset.velView === t;
    }).map((s) => s.dataset.velViewId);
    return this._registry.getViewsById(i);
  }
  getChild(t) {
    return this.getChildren(t)[0];
  }
  getParent(t) {
    const e = this.element.closest(
      `[data-vel-view="${t}"]`
    );
    if (!e) return;
    const i = e.dataset.velViewId;
    if (i)
      return this._registry.getViewById(i);
  }
}
class We {
  constructor(t, e) {
    o(this, "_appEventBus"), o(this, "_eventBus"), o(this, "_plugins", []), o(this, "_views", []), o(this, "_viewsPerPlugin", /* @__PURE__ */ new Map()), o(this, "_viewsToBeCreated", []), o(this, "_viewsToBeRemoved", []), o(this, "_viewsCreatedInPreviousFrame", []), o(this, "_layoutIdToViewMap", /* @__PURE__ */ new Map()), o(this, "_eventPluginsPerPlugin", /* @__PURE__ */ new Map()), o(this, "_pluginNameToPluginFactoryMap", /* @__PURE__ */ new Map()), o(this, "_pluginNameToPluginConfigMap", /* @__PURE__ */ new Map()), this._appEventBus = t, this._eventBus = e;
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
    if (e && e.length > 0) return e;
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
    const s = this.getPluginByName(e);
    if (s)
      return s.id;
  }
  _isScopedElement(t) {
    const e = this._getPluginNameForElement(t);
    if (!e)
      return !1;
    const i = this._pluginNameToPluginFactoryMap.get(e), s = i == null ? void 0 : i.scope;
    return t.dataset.velView === s;
  }
  _removeElementsWithParent(t) {
    const e = new Set(t);
    return t.filter((i) => {
      let s = i.parentElement;
      for (; s; ) {
        if (e.has(s))
          return !1;
        s = s.parentElement;
      }
      return !0;
    });
  }
  _handleAddedViews() {
    this._viewsCreatedInPreviousFrame.forEach((n) => {
      n.markAsAdded();
    }), this._viewsCreatedInPreviousFrame = [];
    const t = this._removeElementsWithParent(
      this._viewsToBeCreated
    ), e = Array.from(
      new Set(
        t.filter(
          (n) => this._isScopedElement(n) && !this._isElementIgnored(n)
        )
      )
    ), i = t.filter(
      (n) => !this._isScopedElement(n) && !this._isElementIgnored(n)
    );
    this._viewsToBeCreated = [], e.forEach((n) => {
      const a = this._getPluginNameForElement(n), l = this._pluginNameToPluginFactoryMap.get(a), h = this._pluginNameToPluginConfigMap.get(a), g = n.dataset.velPluginKey, d = ct(
        l,
        this,
        this._eventBus,
        this._appEventBus,
        h,
        g
      );
      this._plugins.push(d);
      const p = n.dataset.velView, w = this._createNewView(n, p, d);
      w.isInverseEffectEnabled && w.setAnimatorsFromParent(), d.notifyAboutViewAdded(w);
    });
    const s = i.filter((n) => !!this._getPluginIdForElement(n));
    s.length !== 0 && s.forEach((n) => {
      const a = this._getPluginIdForElement(n), l = n.dataset.velView;
      if (!l || !a) return;
      const h = this._getPluginById(a);
      if (!h)
        return;
      const g = this._getLayoutIdForElement(n, h);
      let d;
      g && this._layoutIdToViewMap.has(g) ? (d = this._layoutIdToViewMap.get(g), d.setElement(n), d.setPluginId(h.id), this._createChildrenForView(d, h)) : d = this._createNewView(n, l, h), d.isInverseEffectEnabled && d.setAnimatorsFromParent(), h.notifyAboutViewAdded(d);
    });
  }
  _getLayoutIdForElement(t, e) {
    const i = t.dataset.velLayoutId;
    if (i)
      return `${i}-${e.id}`;
  }
  _createNewView(t, e, i) {
    const s = this._getLayoutIdForElement(t, i), n = this.createView(t, e, s);
    return i.addView(n), n.layoutId && this._layoutIdToViewMap.set(n.layoutId, n), this._createChildrenForView(n, i), this._appEventBus.emitPluginReadyEvent(i.pluginName, i.api, !0), requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._appEventBus.emitPluginReadyEvent(i.pluginName, i.api);
      });
    }), n;
  }
  _createChildrenForView(t, e) {
    const i = t.element.querySelectorAll("*");
    if (i.length) {
      if (Array.from(i).some(
        (s) => this._getPluginNameForElement(s) !== e.pluginName
      )) {
        console.log(
          `%c WARNING: The plugin "${e.pluginName}" has view(s) created for a different plugin. Make sure all views inside that plugin don't have data-vel-plugin set or the pluginName is set to "${e.pluginName}"`,
          "background: #885500"
        );
        return;
      }
      Array.from(i).filter((s) => !this._isElementIgnored(s)).forEach((s) => {
        const n = s, a = n.dataset.velView ? n.dataset.velView : `${t.name}-child`, l = this._getLayoutIdForElement(n, e), h = this.createView(n, a, l);
        l && !this._layoutIdToViewMap.has(l) && this._layoutIdToViewMap.set(l, h), e.addView(h), e.notifyAboutViewAdded(h);
      });
    }
  }
  _handleRemoveView(t) {
    this._plugins.forEach((e) => {
      if (!this._viewsPerPlugin.get(e.id)) return;
      const i = this._getPluginViewById(e, t);
      i && e.removeView(i);
    });
  }
  removeViewById(t, e) {
    this._unassignViewFromPlugin(t, e), this._views = this._views.filter((i) => i.id !== t);
  }
  _unassignViewFromPlugin(t, e) {
    const i = this._viewsPerPlugin.get(e);
    if (!i) return;
    const s = i.indexOf(t);
    s !== -1 && i.splice(s, 1);
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
      const s = this.getPluginByName(t);
      if (s) {
        const n = (this._eventPluginsPerPlugin.get(s.id) || []).map((a) => this._getPluginById(a)).filter((a) => typeof a < "u");
        i.push(s), i.push(...n);
      }
    } else
      i = this._plugins;
    i.forEach((s) => {
      this._destroyPlugin(s);
    }), requestAnimationFrame(() => {
      e == null || e();
    });
  }
  _destroyPlugin(t) {
    const e = this.getViewsForPlugin(t);
    e.forEach((i) => {
      i.layoutId && this._layoutIdToViewMap.delete(i.layoutId), i.destroy();
    }), this._views = this._views.filter(
      (i) => !e.find((s) => s.id === i.id)
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
      const s = this.getPluginByName(t);
      if (s) {
        const n = (this._eventPluginsPerPlugin.get(s.id) || []).map((a) => this._getPluginById(a)).filter((a) => typeof a < "u");
        i.push(s), i.push(...n);
      }
    } else
      i = this._plugins;
    requestAnimationFrame(() => {
      i.forEach((s) => {
        this._resetPlugin(s);
      }), requestAnimationFrame(() => {
        e == null || e();
      });
    });
  }
  _resetPlugin(t) {
    const e = t.config, i = t.pluginFactory, s = t.internalBusEvent, n = !t.isRenderable(), a = this.getViewsForPlugin(t);
    a.forEach((l) => {
      l.layoutId && this._layoutIdToViewMap.delete(l.layoutId), l.destroy();
    }), this._views = this._views.filter(
      (l) => !a.find((h) => h.id === l.id)
    ), this._viewsPerPlugin.delete(t.id), this._plugins = this._plugins.filter((l) => l.id !== t.id), n || requestAnimationFrame(() => {
      this.createPlugin(
        i,
        this._eventBus,
        e
      ).setInternalEventBus(s);
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
  createPlugin(t, e, i = {}, s = !1) {
    if (!t.pluginName)
      throw Error(
        `Plugin ${t.name} must contain a pluginName field`
      );
    let n = [];
    if (t.scope) {
      const h = s ? `[data-vel-plugin=${t.pluginName}][data-vel-view=${t.scope}]:not([data-vel-plugin-id])` : `[data-vel-plugin=${t.pluginName}][data-vel-view=${t.scope}]`, g = document.querySelectorAll(h);
      this._pluginNameToPluginFactoryMap.has(t.pluginName) || this._pluginNameToPluginFactoryMap.set(
        t.pluginName,
        t
      ), this._pluginNameToPluginConfigMap.has(t.pluginName) || this._pluginNameToPluginConfigMap.set(t.pluginName, i), g ? n = Array.from(g) : n = [document.documentElement];
    } else
      n = [document.documentElement];
    const a = n.map((h) => {
      const g = h.dataset.velPluginKey, d = ct(
        t,
        this,
        e,
        this._appEventBus,
        i,
        g
      );
      this._plugins.push(d);
      let p = [];
      h !== document.documentElement && p.push(h);
      const w = h.querySelectorAll(
        `[data-vel-plugin=${d.pluginName}]`
      );
      p = [...p, ...w];
      const V = p.filter((y) => {
        if (this._isElementIgnored(y))
          return !1;
        if (!y.parentElement)
          return !0;
        const A = this._getPluginNameForElement(y.parentElement);
        return !(A && A.length > 0);
      });
      return V.length && V.forEach((y) => {
        const A = y.dataset.velView;
        if (!A) return;
        const b = this._createNewView(y, A, d);
        d.notifyAboutViewAdded(b);
      }), d;
    });
    if (a && a.length > 0)
      return a[0];
    const l = ct(
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
    const s = new ze(t, e, this, i);
    return this._views.push(s), this._viewsCreatedInPreviousFrame.push(s), s;
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
    return e ? e.map((i) => this._views.find((s) => s.id === i)).filter((i) => !!i) : [];
  }
  getViewsByNameForPlugin(t, e) {
    return this.getViewsForPlugin(t).filter(
      (i) => i.name === e
    );
  }
}
class Ot {
  constructor(t) {
    o(this, "pluginApi"), this.pluginApi = t.pluginApi;
  }
}
class Dt {
  constructor(t) {
    o(this, "pluginApi"), this.pluginApi = t.pluginApi;
  }
}
class At {
  constructor() {
    o(this, "previousTime", 0), o(this, "registry"), o(this, "eventBus"), o(this, "appEventBus"), this.eventBus = new pt(), this.appEventBus = new pt(), this.registry = new We(this.appEventBus, this.eventBus), new ie(this.eventBus);
  }
  static create() {
    return new At();
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
    const s = this.registry.getPluginByName(i, e);
    if (!s)
      throw new Error(
        `You can't call getPlugin for ${i} with key: ${e} because it does not exist in your app`
      );
    return s.api;
  }
  getPlugins(t, e) {
    let i = typeof t == "string" ? t : t.pluginName;
    const s = this.registry.getPluginsByName(i, e);
    if (s.length === 0)
      throw new Error(
        `You can't call getPlugins for ${i} with key: ${e} because they don't exist in your app`
      );
    return s.map((n) => n.api);
  }
  onPluginEvent(t, e, i, s) {
    requestAnimationFrame(() => {
      const n = this.registry.getPluginByName(
        t.pluginName,
        s
      );
      n && n.on(e, i);
    });
  }
  removePluginEventListener(t, e, i) {
    const s = this.registry.getPluginByName(t.pluginName);
    s && s.removeListener(e, i);
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
      this.eventBus.emitEvent(vt, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    }), document.addEventListener("pointermove", (t) => {
      this.eventBus.emitEvent(at, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    }), document.addEventListener("pointerdown", (t) => {
      this.eventBus.emitEvent(ot, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    }), document.addEventListener("pointerup", (t) => {
      this.eventBus.emitEvent(lt, {
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
    this.eventBus.subscribeToEvent(et, this.onNodeAdded.bind(this)), this.eventBus.subscribeToEvent(
      gt,
      this.onNodeRemoved.bind(this)
    ), this.eventBus.subscribeToEvent(
      $t,
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
function qe() {
  return At.create();
}
class qt {
  constructor(t) {
    o(this, "view"), o(this, "previousX"), o(this, "previousY"), o(this, "x"), o(this, "y"), o(this, "pointerX"), o(this, "pointerY"), o(this, "isDragging"), o(this, "target"), o(this, "directions", []), o(this, "width"), o(this, "height"), o(this, "distance"), o(this, "stopped"), o(this, "hasMoved"), this.props = t, this.previousX = t.previousX, this.previousY = t.previousY, this.x = t.x, this.y = t.y, this.pointerX = t.pointerX, this.pointerY = t.pointerY, this.width = t.width, this.height = t.height, this.distance = t.distance, this.view = t.view, this.isDragging = t.isDragging, this.stopped = t.stopped, this.target = t.target, this.directions = t.directions, this.hasMoved = t.hasMoved;
  }
}
class Ut extends ft {
  constructor() {
    super(...arguments), o(this, "_pointerX", 0), o(this, "_pointerY", 0), o(this, "_initialPointer", new u(0, 0)), o(this, "_initialPointerPerView", /* @__PURE__ */ new Map()), o(this, "_pointerDownPerView", /* @__PURE__ */ new Map()), o(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map()), o(this, "_stopTimer", 0);
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
    t.subscribeToEvent(ot, ({ x: e, y: i }) => {
      this._initialPointer = new u(e, i), this.getViews().forEach((s) => {
        this._pointerDownPerView.set(s.id, s.intersects(e, i));
        const n = s.isLayoutTransitionEnabled ? s.position.initialX : s.position.x, a = s.isLayoutTransitionEnabled ? s.position.initialY : s.position.y, l = new u(e - n, i - a);
        this._pointerX = e, this._pointerY = i, this._initialPointerPerView.set(s.id, l);
      });
    }), t.subscribeToEvent(lt, () => {
      this.getViews().forEach((e) => {
        this._pointerDownPerView.get(e.id) && this._initialPointerPerView.get(e.id) && (this._pointerDownPerView.set(e.id, !1), this._emitEvent(e, []));
      });
    }), t.subscribeToEvent(at, ({ x: e, y: i }) => {
      this._pointerX = e, this._pointerY = i, this.getViews().forEach((s) => {
        if (this._pointerDownPerView.get(s.id) && this._initialPointerPerView.get(s.id)) {
          this._viewPointerPositionLog.has(s.id) || this._viewPointerPositionLog.set(s.id, []);
          const n = new u(e, i), a = this._viewPointerPositionLog.get(s.id);
          a && a.push(new u(e, i));
          const l = a && a.length >= 2 ? a[a.length - 2] : n.clone(), h = this._calculateDirections(
            l,
            n
          );
          this._emitEvent(s, h), clearTimeout(this._stopTimer), this._stopTimer = setTimeout(() => {
            this._pointerDownPerView.get(s.id) === !0 && this._emitEvent(s, h, !0);
          }, 120);
        }
      });
    });
  }
  _emitEvent(t, e, i = !1) {
    const s = this._viewPointerPositionLog.get(t.id), n = !(typeof s > "u" || s.length <= 1), a = s && s.length >= 2 ? s[s.length - 2] : null, l = this._pointerX - this._initialPointerPerView.get(t.id).x, h = this._pointerY - this._initialPointerPerView.get(t.id).y, g = this._pointerX, d = this._pointerY, p = a ? a.x - this._initialPointerPerView.get(t.id).x : l, w = a ? a.y - this._initialPointerPerView.get(t.id).y : h, V = this._pointerY - this._initialPointer.y, y = this._pointerX - this._initialPointer.x, A = ue(this._initialPointer, {
      x: this._pointerX,
      y: this._pointerY
    }), b = this._pointerDownPerView.get(t.id) === !0;
    b || this._viewPointerPositionLog.clear();
    const O = {
      view: t,
      target: t.element,
      previousX: p,
      previousY: w,
      x: l,
      y: h,
      pointerX: g,
      pointerY: d,
      distance: A,
      width: y,
      height: V,
      isDragging: b,
      directions: e,
      stopped: i,
      hasMoved: n
    };
    this.emit(qt, O);
  }
  _calculateDirections(t, e) {
    const i = {
      up: u.sub(new u(t.x, t.y - 1), t),
      down: u.sub(new u(t.x, t.y + 1), t),
      left: u.sub(new u(t.x - 1, t.y), t),
      right: u.sub(new u(t.x + 1, t.y), t)
    }, s = u.sub(e, t).unitVector;
    return [
      { direction: "up", projection: s.dot(i.up) },
      {
        direction: "down",
        projection: s.dot(i.down)
      },
      {
        direction: "left",
        projection: s.dot(i.left)
      },
      {
        direction: "right",
        projection: s.dot(i.right)
      }
    ].filter(
      (n) => n.projection > 0
    ).map(
      (n) => n.direction
    );
  }
}
o(Ut, "pluginName", "DragEventPlugin");
class Ue {
  constructor(t) {
    o(this, "view"), o(this, "direction"), this.props = t, this.view = t.view, this.direction = t.direction;
  }
}
class Ye extends ft {
  constructor() {
    super(...arguments), o(this, "_viewIsPointerDownMap", /* @__PURE__ */ new Map()), o(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map()), o(this, "_targetPerView", /* @__PURE__ */ new Map());
  }
  subscribeToEvents(t) {
    t.subscribeToEvent(ot, ({ x: e, y: i, target: s }) => {
      this.getViews().forEach((n) => {
        this._targetPerView.set(n.id, s), n.intersects(e, i) && this._viewIsPointerDownMap.set(n.id, !0);
      });
    }), t.subscribeToEvent(at, ({ x: e, y: i }) => {
      this.getViews().forEach((s) => {
        this._viewIsPointerDownMap.get(s.id) && (this._viewPointerPositionLog.has(s.id) || this._viewPointerPositionLog.set(s.id, []), this._viewPointerPositionLog.get(s.id).push(new u(e, i)));
      });
    }), t.subscribeToEvent(lt, ({ x: e, y: i }) => {
      this.getViews().forEach((n) => {
        if (!this._viewIsPointerDownMap.get(n.id) || !this._viewPointerPositionLog.has(n.id))
          return;
        const a = new u(e, i), l = this._viewPointerPositionLog.get(n.id), h = l[l.length - 2] || a.clone(), g = this._targetPerView.get(n.id), d = s(h, a);
        g && n.hasElement(g) && d.hasSwiped && this.emit(Ue, {
          view: n,
          direction: d.direction
        }), this._viewPointerPositionLog.set(n.id, []), this._viewIsPointerDownMap.set(n.id, !1);
      });
      function s(n, a) {
        const l = {
          up: u.sub(new u(n.x, n.y - 1), n),
          down: u.sub(new u(n.x, n.y + 1), n),
          left: u.sub(new u(n.x - 1, n.y), n),
          right: u.sub(new u(n.x + 1, n.y), n)
        }, h = u.sub(a, n).unitVector, g = [
          "up",
          "down",
          "left",
          "right"
        ], d = [
          h.dot(l.up),
          h.dot(l.down),
          h.dot(l.left),
          h.dot(l.right)
        ], p = Math.max(...d), w = d.indexOf(p), V = g[w], y = u.sub(a, n).magnitude;
        return {
          hasSwiped: h.dot(l[V]) * y > 30,
          direction: V
        };
      }
    });
  }
}
o(Ye, "pluginName", "SwipeEventPlugin");
class Xe {
  constructor(t) {
    o(this, "view"), this.props = t, this.view = t.view;
  }
}
class He extends ft {
  subscribeToEvents(t) {
    t.subscribeToEvent(vt, ({ x: e, y: i, target: s }) => {
      this.getViews().forEach((n) => {
        const a = s, l = n.element === a || n.element.contains(a);
        n.intersects(e, i) && l && this.emit(Xe, {
          view: n
        });
      });
    });
  }
}
o(He, "pluginName", "ClickEventPlugin");
const je = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PointerClickEvent: vt,
  PointerDownEvent: ot,
  PointerMoveEvent: at,
  PointerUpEvent: lt
}, Symbol.toStringTag, { value: "Module" }));
function Ke(r) {
  let t = Yt(r) || window;
  t === document.body && (t = window);
  let e = 0, i = 0, s = !1, n = () => {
  };
  return t.addEventListener("scroll", () => {
    s && n();
  }), {
    container: t,
    onScroll(a) {
      n = a;
    },
    startScrollTracking() {
      s || (e = t instanceof Element ? t.scrollTop : t.scrollY, i = t instanceof Element ? t.scrollLeft : t.scrollX, s = !0);
    },
    getScrollOffset() {
      const a = t instanceof Element ? t.scrollTop : t.scrollY;
      return {
        x: (t instanceof Element ? t.scrollLeft : t.scrollX) - i,
        y: a - e
      };
    },
    endScrollTracking() {
      e = 0, i = 0, s = !1;
    },
    width: t instanceof Element ? t.clientWidth : t.innerWidth,
    height: t instanceof Element ? t.clientHeight : t.innerHeight
  };
}
function Yt(r) {
  const e = r instanceof HTMLElement && window.getComputedStyle(r).overflowY, i = e !== "visible" && e !== "hidden";
  if (r) {
    if (i && r.scrollHeight >= r.clientHeight)
      return r;
  } else return null;
  return Yt(r.parentNode) || document.body;
}
class it {
  constructor(t) {
    R(this, "data");
    this.data = t.data;
  }
}
class Xt {
  constructor(t) {
    R(this, "data");
    R(this, "hasChanged");
    this.data = t.data, this.hasChanged = t.hasChanged;
  }
}
class Ht {
}
class jt {
  constructor(t) {
    R(this, "data");
    this.data = t.data;
  }
}
function J(r) {
  return {
    map: new Map(r),
    array: Array.from(r).map(([e, i]) => ({ slotId: e, itemId: i })),
    object: Array.from(r).reduce(
      (e, [i, s]) => (e[i] = s, e),
      {}
    )
  };
}
function Ge(r) {
  if (r.map)
    return {
      map: new Map(r.map),
      array: Array.from(r.map).map(([e, i]) => ({
        slotId: e,
        itemId: i
      })),
      object: Array.from(r.map).reduce(
        (e, [i, s]) => (e[i] = s, e),
        {}
      )
    };
  if (r.object) {
    const t = { ...r.object };
    return {
      map: new Map(Object.entries(t)),
      array: Object.entries(t).map(([e, i]) => ({
        slotId: e,
        itemId: i
      })),
      object: t
    };
  } else {
    const t = [...r.array];
    return {
      map: new Map(t.map(({ slotId: e, itemId: i }) => [e, i])),
      array: t,
      object: t.reduce((e, { slotId: i, itemId: s }) => (e[i] = s, e), {})
    };
  }
}
const I = (r) => {
  const t = r.useEventPlugin(Ut);
  t.on(qt, $);
  let e, i, s, n, a, l = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), g, d, p = null, w = null, V, y, A = !0, b, O, q, T, U = !1, Y = !1, S = () => {
  }, L = !1;
  r.api({
    setEnabled(c) {
      A = c;
    },
    setData(c) {
      const m = Ge(c);
      l = new Map(m.map), h = new Map(l);
    },
    setAutoScrollOnDrag(c) {
      L = c;
    }
  });
  function E() {
    return {
      animation: e.data.configAnimation,
      continuousMode: typeof e.data.configContinuousMode < "u",
      manualSwap: typeof e.data.configManualSwap < "u",
      swapMode: e.data.configSwapMode,
      autoScrollOnDrag: L
    };
  }
  function X() {
    const c = E().animation;
    return c === "dynamic" ? {
      animator: "dynamic",
      config: {}
    } : c === "spring" ? {
      animator: "spring",
      config: {
        damping: 0.7,
        stiffness: 0.62
      }
    } : c === "none" ? {
      animator: "instant",
      config: {}
    } : {
      animator: "instant",
      config: {}
    };
  }
  function H(c) {
    return () => {
      Y = !dt(c, h), l = c, h = new Map(l);
    };
  }
  r.setup(() => {
    e = r.getView("root"), s = r.getViews("slot"), n = r.getViews("item"), i = Ke(n[0].element), i.onScroll(() => {
      D();
    }), O = E().continuousMode, q = E().manualSwap, s.forEach((c) => {
      N(c);
    }), Q(), h = new Map(l), requestAnimationFrame(() => {
      r.emit(jt, { data: J(l) });
    });
  });
  function N(c) {
    const m = c.getChild("item");
    m && ht(m), l.set(
      c.element.dataset.swapySlot,
      m ? m.element.dataset.swapyItem : null
    );
  }
  function ht(c) {
    const m = X();
    c.styles.position = "relative", c.styles.userSelect = "none", c.styles.webkitUserSelect = "none", c.position.setAnimator(m.animator, m.config), c.scale.setAnimator(m.animator, m.config), c.layoutTransition(!0), requestAnimationFrame(() => {
      const v = c.getChild("handle");
      v ? (t.addView(v), v.styles.touchAction = "none") : (t.addView(c), c.styles.touchAction = "none");
    });
  }
  r.onViewAdded((c) => {
    if (r.initialized)
      if (c.name === "item") {
        n = r.getViews("item");
        const m = c.getParent("slot");
        N(m), Q(), h = new Map(l), r.emit(it, { data: J(l) });
      } else c.name === "slot" && (s = r.getViews("slot"));
  });
  function Q() {
    const c = X();
    r.getViews("root-child").forEach((v) => {
      v.position.setAnimator(c.animator, c.config), v.scale.setAnimator(c.animator, c.config), v.layoutTransition(!0);
    });
  }
  function D() {
    if (!b) return;
    if (!g || !d) {
      const K = a.getScroll();
      g = b.pointerX - a.position.x + K.x, d = b.pointerY - a.position.y + K.y;
    }
    (!V || !y) && (V = a.size.width, y = a.size.height);
    const c = a.size.width / V, m = a.size.height / y, v = g * (c - 1), j = d * (m - 1), { x: f, y: z } = i.getScrollOffset();
    a.position.set(
      {
        x: b.x - v - (p || 0) + f,
        y: b.y - j - (w || 0) + z
      },
      a.scale.x !== 1 || a.scale.y !== 1
    );
  }
  const M = 20, P = 100;
  let B = 0, C = 0;
  r.subscribeToEvents((c) => {
    c.subscribeToEvent(je.PointerMoveEvent, ({ x: m, y: v }) => {
      i && (i.height - v <= P ? B = Math.max(
        0,
        M * (1 - Math.min(i.height - v, P) / P)
      ) : v <= P ? B = -1 * Math.max(
        0,
        M * (1 - Math.min(v, P) / P)
      ) : B = 0, i.width - m <= P ? C = Math.max(
        0,
        M * (1 - Math.min(i.width - m, P) / P)
      ) : m <= P ? C = -1 * Math.max(
        0,
        M * (1 - Math.min(m, P) / P)
      ) : C = 0);
    });
  }), r.update(() => {
    b != null && b.isDragging && L && i.container.scrollBy({ top: B, left: C });
  });
  function $(c) {
    if (!A || !c.hasMoved) return;
    const m = E().swapMode, v = c.view.name === "handle";
    if (a = v ? c.view.getParent("item") : c.view, T || (T = a.getParent("slot")), p === null && w === null) {
      const f = v ? c.view.position.initialX - c.view.position.x : 0, z = v ? c.view.position.initialY - c.view.position.y : 0;
      p = c.view.position.x - a.position.x - f, w = c.view.position.y - a.position.y - z;
    }
    const j = s.some(
      (f) => f.intersects(c.pointerX, c.pointerY)
    );
    c.isDragging ? (i.startScrollTracking(), U || (U = !0, r.emit(Ht, {})), b = c, D(), s.forEach((f) => {
      var St;
      if (!f.intersects(c.pointerX, c.pointerY)) {
        f !== T && f.element.removeAttribute("data-swapy-highlighted");
        return;
      }
      if (typeof f.element.dataset.swapyHighlighted > "u" && (f.element.dataset.swapyHighlighted = ""), !T || (m === "stop" || m !== "drop" && !O) && !c.stopped)
        return;
      const z = f.element.dataset.swapySlot, K = (St = f.getChild("item")) == null ? void 0 : St.element.dataset.swapyItem, ut = T.element.dataset.swapySlot, Tt = a.element.dataset.swapyItem;
      if (!z || !ut || !Tt)
        return;
      const W = new Map(l);
      W.set(z, Tt), K ? W.set(ut, K) : W.set(ut, null), S = H(new Map(W)), dt(W, h) || (!q && m !== "drop" && S(), T = null, m !== "drop" && r.emit(it, { data: J(W) }));
    }), n.forEach((f) => {
      f.styles.zIndex = f === a ? "2" : "";
    })) : (s.forEach((f) => {
      f.element.removeAttribute("data-swapy-highlighted");
    }), a.position.reset(), T = null, g = null, d = null, V = null, y = null, b = null, p = null, w = null, U = !1, m === "drop" && (j || (S = H(new Map(l))), S(), r.emit(it, { data: J(l) })), S = () => {
    }, r.emit(Xt, {
      data: J(l),
      hasChanged: Y
    }), Y = !1, i.endScrollTracking()), requestAnimationFrame(() => {
      D();
    });
  }
};
I.pluginName = "Swapy";
I.scope = "root";
let F;
function Ze() {
  return F ? (F.updatePlugin(I), F) : (F = qe(), F.addPlugin(I), F.run(), F);
}
const Je = {
  animation: "dynamic",
  continuousMode: !0,
  manualSwap: !1,
  swapMode: "hover",
  autoScrollOnDrag: !1
};
function Qe(r) {
  let t = !0;
  const e = r.querySelectorAll("[data-swapy-slot]");
  return e.length === 0 && (console.error("There are no slots defined in your root element:", r), t = !1), e.forEach((i) => {
    const s = i, n = s.dataset.swapySlot;
    (!n || n.length === 0) && (console.error(i, "does not contain a slotId using data-swapy-slot"), t = !1);
    const a = s.children;
    a.length > 1 && (console.error(
      "slot:",
      `"${n}"`,
      "cannot contain more than one element"
    ), t = !1);
    const l = a[0];
    l && (!l.dataset.swapyItem || l.dataset.swapyItem.length === 0) && (console.error(
      "slot:",
      `"${n}"`,
      "does not contain an element with item id using data-swapy-item"
    ), t = !1);
  }), t;
}
function ti(r, t = {}) {
  const e = Jt();
  return r.dataset.velPluginKey = e, r.dataset.velPlugin = "Swapy", r.dataset.velView = "root", r.dataset.velDataConfigAnimation = t.animation, r.dataset.velDataConfigSwapMode = t.swapMode, t.continuousMode && (r.dataset.velDataConfigContinuousMode = "true"), t.manualSwap && (r.dataset.velDataConfigManualSwap = "true"), Array.from(
    r.querySelectorAll("[data-swapy-slot]")
  ).forEach((l) => {
    l.dataset.velView = "slot";
  }), Array.from(
    r.querySelectorAll("[data-swapy-item]")
  ).forEach((l) => {
    l.dataset.velView = "item", l.dataset.velLayoutId = l.dataset.swapyItem;
    const h = l.querySelector("[data-swapy-handle]");
    h && (h.dataset.velView = "handle");
  }), Array.from(
    r.querySelectorAll("[data-swapy-text]")
  ).forEach((l) => {
    l.dataset.velLayoutPosition = "";
  }), Array.from(
    r.querySelectorAll("[data-swapy-exclude]")
  ).forEach((l) => {
    l.dataset.velIgnore = "";
  }), e;
}
function ei(r) {
  const t = Array.from(
    r.querySelectorAll("[data-swapy-slot]:not([data-vel-view])")
  );
  t.forEach((i) => {
    i.dataset.velView = "slot";
  });
  const e = Array.from(
    r.querySelectorAll("[data-swapy-item]:not([data-vel-view])")
  );
  return e.forEach((i) => {
    i.dataset.velView = "item", i.dataset.velLayoutId = i.dataset.swapyItem;
    const s = i.querySelector("[data-swapy-handle]");
    s && (s.dataset.velView = "handle"), Array.from(
      i.querySelectorAll("[data-swapy-text]")
    ).forEach((l) => {
      l.dataset.velLayoutPosition = "";
    }), Array.from(
      i.querySelectorAll("[data-swapy-exclude]")
    ).forEach((l) => {
      l.dataset.velIgnore = "";
    });
  }), e.length > 0 || t.length > 0;
}
function ni(r, t = {}) {
  if (!r)
    throw new Error(
      "Cannot create a Swapy instance because the element you provided does not exist on the page!"
    );
  const e = { ...Je, ...t }, i = r;
  if (!Qe(i))
    throw new Error(
      "Cannot create a Swapy instance because your HTML structure is invalid. Fix all above errors and then try!"
    );
  const s = ti(i, e), n = new ii(i, s, e);
  return {
    onSwap(a) {
      n.setSwapCallback(a);
    },
    onSwapEnd(a) {
      n.setSwapEndCallback(a);
    },
    onSwapStart(a) {
      n.setSwapStartCallback(a);
    },
    enable(a) {
      n.setEnabled(a);
    },
    destroy() {
      n.destroy();
    },
    setData(a) {
      n.setData(a);
    }
  };
}
class ii {
  constructor(t, e, i) {
    R(this, "_rootEl");
    R(this, "_veloxiApp");
    R(this, "_slotElMap");
    R(this, "_itemElMap");
    R(this, "_swapCallback");
    R(this, "_swapEndCallback");
    R(this, "_swapStartCallback");
    R(this, "_previousMap");
    R(this, "_pluginKey");
    this._rootEl = t, this._veloxiApp = Ze(), this._slotElMap = this._createSlotElMap(), this._itemElMap = this._createItemElMap(), this.setAutoScrollOnDrag(i.autoScrollOnDrag), this._pluginKey = e, this._veloxiApp.onPluginEvent(
      I,
      jt,
      ({ data: s }) => {
        this._previousMap = s.map;
      },
      e
    ), this._veloxiApp.onPluginEvent(
      I,
      it,
      (s) => {
        var n;
        this._previousMap && dt(this._previousMap, s.data.map) || (i.manualSwap || this._applyOrder(s.data.map), this._previousMap = s.data.map, (n = this._swapCallback) == null || n.call(this, s));
      },
      e
    ), this._veloxiApp.onPluginEvent(
      I,
      Xt,
      (s) => {
        var n;
        (n = this._swapEndCallback) == null || n.call(this, s);
      },
      e
    ), this._veloxiApp.onPluginEvent(
      I,
      Ht,
      () => {
        var s;
        (s = this._swapStartCallback) == null || s.call(this);
      },
      e
    ), this.setupMutationObserver();
  }
  setupMutationObserver() {
    new MutationObserver((e) => {
      e.some((i) => i.type === "childList") && ei(this._rootEl) && (this._slotElMap = this._createSlotElMap(), this._itemElMap = this._createItemElMap());
    }).observe(this._rootEl, {
      childList: !0,
      subtree: !0
    });
  }
  setData(t) {
    try {
      this._veloxiApp.getPlugin(
        "Swapy",
        this._pluginKey
      ).setData(t);
    } catch {
    }
  }
  destroy() {
    this._veloxiApp.destroy("Swapy");
  }
  setEnabled(t) {
    requestAnimationFrame(() => {
      try {
        this._veloxiApp.getPlugin(
          "Swapy",
          this._pluginKey
        ).setEnabled(t);
      } catch {
      }
    });
  }
  setAutoScrollOnDrag(t) {
    requestAnimationFrame(() => {
      try {
        this._veloxiApp.getPlugin(
          "Swapy",
          this._pluginKey
        ).setAutoScrollOnDrag(t);
      } catch {
      }
    });
  }
  setSwapCallback(t) {
    this._swapCallback = t;
  }
  setSwapEndCallback(t) {
    this._swapEndCallback = t;
  }
  setSwapStartCallback(t) {
    this._swapStartCallback = t;
  }
  _applyOrder(t) {
    Array.from(t.keys()).forEach((e) => {
      var a;
      if (t.get(e) === ((a = this._previousMap) == null ? void 0 : a.get(e)))
        return;
      const i = t.get(e);
      if (!i) return;
      const s = this._slotElMap.get(e), n = this._itemElMap.get(i);
      !s || !n || (s.innerHTML = "", s.appendChild(n));
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
  ni as createSwapy
};
