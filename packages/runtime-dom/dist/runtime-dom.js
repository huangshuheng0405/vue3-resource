// packages/runtime-dom/src/nodeOps.ts
var nodeOps = {
  /**
   *
   * @param type
   * @returns 返回一个真实dom对象
   */
  createElement(type) {
    return document.createElement(type);
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  insert(el, parent, anchor) {
    parent.insertBefore(el, anchor || null);
  },
  /**
   * 移除dom节点
   * @param el 节点
   */
  remove(el) {
    const parent = el.parentNode;
    if (parent) {
      parent.removeChild(el);
    }
  },
  createText(text) {
    return document.createTextNode(text);
  },
  /**
   * 设置文本
   * @param el 元素节点
   * @param text 文本内容
   */
  setText(el, text) {
    el.nodeValue = text;
  },
  /**
   * 获取父节点
   * @param el 节点
   * @returns 父节点
   */
  parentNode(el) {
    return el.parentNode;
  },
  /**
   * 获取兄弟节点
   * @param el 节点
   * @returns 下一个兄弟节点
   */
  nextSibling(el) {
    return el.nextSibling;
  }
};

// packages/runtime-dom/src/modules/patchAttr.ts
function patchAttr(el, key, value) {
  if (value == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
}

// packages/runtime-dom/src/modules/patchClass.ts
function patchClass(el, nextValue) {
  if (nextValue == null) {
    el.removeAttribute("class");
  } else {
    el.className = nextValue;
  }
}

// packages/runtime-dom/src/modules/patchEvent.ts
function createInvoker(nextValue) {
  const invoker = (e) => {
    invoker.value(e);
  };
  invoker.value = nextValue;
  return invoker;
}
function patchEvent(el, key, nextValue) {
  const invokers = el._vei || (el._vei = {});
  const eventName = key.slice(2).toLowerCase();
  const existingInvoker = invokers[key];
  if (nextValue && existingInvoker) {
    return existingInvoker.value = nextValue;
  }
  if (nextValue) {
    const invoker = invokers[key] = createInvoker(nextValue);
    return el.addEventListener(eventName, invoker);
  }
  if (existingInvoker) {
    el.removeEventListener(eventName, existingInvoker);
    invokers[key] = void 0;
  }
}

// packages/runtime-dom/src/modules/patchStyle.ts
function patchStyle(el, prevValue, nextValue) {
  let style = el.style;
  for (let key in nextValue) {
    style[key] = nextValue[key];
  }
  if (prevValue) {
    for (let key in prevValue) {
      if (nextValue) {
        if (nextValue[key] == null) {
          style[key] = null;
        }
      }
    }
  }
}

// packages/runtime-dom/src/patchProp.ts
function patchProp(el, key, prevValue, nextValue) {
  if (key === "class") {
    return patchClass(el, nextValue);
  } else if (key === "style") {
    return patchStyle(el, prevValue, nextValue);
  } else if (/^on[^a-z]/.test(key)) {
    return patchEvent(el, key, nextValue);
  } else {
    return patchAttr(el, key, nextValue);
  }
}

// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}
function isFunction(value) {
  return typeof value === "function";
}
function isString(value) {
  return typeof value === "string";
}
function isVNode(value) {
  return value.__v_isVnode;
}
var hasOwnProperty = Object.prototype.hasOwnProperty;
var hasOwn = (value, key) => hasOwnProperty.call(value, key);

// packages/runtime-core/src/teleport.ts
var Teleport = {
  __isTeleport: true,
  remove(vnode, unmountChildren) {
    const { shapeFlag, children } = vnode;
    if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
      unmountChildren(children);
    }
  },
  process(vnode1, vnode2, container, anchor, parentComponent, internals) {
    let { mountChildren, patchChildren, move } = internals;
    if (!vnode1) {
      const target = vnode2.target = document.querySelector(vnode2.props.to);
      if (target) {
        mountChildren(vnode2.children, target, anchor, parentComponent);
      }
    } else {
      patchChildren(vnode1, vnode2, vnode2.target, anchor, parentComponent);
      if (vnode2.props.to !== vnode1.props.to) {
        const nextTarget = document.querySelector(vnode2.props.to);
        vnode2.children.forEach((child) => {
          move(child, nextTarget, anchor);
        });
      }
    }
  }
};
var isTeleport = (value) => value.__isTeleport;

// packages/runtime-core/src/createVnode.ts
function createVNode(type, props, children) {
  const shapeFlag = isString(type) ? 1 /* ELEMENT */ : isTeleport(type) ? 64 /* TELEPORT */ : isObject(type) ? 4 /* STATEFUL_COMPONENT */ : 0;
  if (Array.isArray(children)) {
  }
  const vnode = {
    __v_isVnode: true,
    // 虚拟节点标识
    type,
    // 节点类型（元素名/组件对象/Text/Fragment）（元素名/组件对象/Text/Fragment）
    props,
    // 属性  class/style/onClick/自定义 props）
    children,
    // 孩子 文本/数组/空
    key: props?.key,
    // diff 用来判断是否同一个节点，以及做列表 diff
    el: null,
    // 将来挂载后对应的真实 DOM 节点（mount 时会赋值）
    shapeFlag
    // 上面算出来的类型标记
  };
  if (children) {
    if (Array.isArray(children)) {
      vnode.shapeFlag |= 16 /* ARRAY_CHILDREN */;
    } else if (isObject(children)) {
      vnode.shapeFlag |= 32 /* SLOTS_CHILDREN */;
    } else {
      vnode.children = String(children);
      vnode.shapeFlag |= 8 /* TEXT_CHILDREN */;
    }
  }
  return vnode;
}
function isSameVnode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
var Text = /* @__PURE__ */ Symbol("Text");
var Fragment = /* @__PURE__ */ Symbol("Fragment");

// packages/runtime-core/src/h.ts
function h(type, propsOrChildren, children) {
  let l = arguments.length;
  if (l === 2) {
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      } else {
        return createVNode(type, propsOrChildren);
      }
    }
    return createVNode(type, null, propsOrChildren);
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2);
    }
    if (l === 3 && isVNode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}

// packages/runtime-core/src/LIS.ts
function getSequence(arr) {
  const result = [0];
  const len = arr.length;
  const p = result.slice(0);
  let start, end;
  for (let i = 0; i < len; i++) {
    const currentValue = arr[i];
    if (currentValue !== 0) {
      let resultLastIndex = result[result.length - 1];
      if (arr[resultLastIndex] < currentValue) {
        p[i] = result[result.length - 1];
        result.push(i);
        continue;
      }
    }
    start = 0;
    end = result.length - 1;
    while (start < end) {
      const middle = Math.floor((start + end) / 2);
      if (arr[result[middle]] < currentValue) {
        start = middle + 1;
      } else {
        end = middle;
      }
    }
    if (currentValue < arr[result[start]]) {
      p[i] = result[start - 1];
      result[start] = i;
    }
  }
  let l = result.length;
  let last = result[l - 1];
  while (l-- > 0) {
    result[l] = last;
    last = p[last];
  }
  return result;
}

// packages/reactivity/src/constants.ts
var ReactiveFlags = /* @__PURE__ */ ((ReactiveFlags2) => {
  ReactiveFlags2["IS_REACTIVE"] = "__v_isReactive";
  return ReactiveFlags2;
})(ReactiveFlags || {});
var DirtyLevel = /* @__PURE__ */ ((DirtyLevel2) => {
  DirtyLevel2[DirtyLevel2["Dirty"] = 4] = "Dirty";
  DirtyLevel2[DirtyLevel2["NoDirty"] = 0] = "NoDirty";
  return DirtyLevel2;
})(DirtyLevel || {});
function isRef(value) {
  return value.__v_isRef;
}
function isReactive(value) {
  return value["__v_isReactive" /* IS_REACTIVE */];
}

// packages/reactivity/src/effect.ts
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
  if (options) {
    Object.assign(_effect, options);
  }
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
var activeEffect;
function preCleanEffect(effect2) {
  effect2._depsLength = 0;
  effect2._trackId++;
}
function postCleanEffect(effect2) {
  if (effect2.deps.length > effect2._depsLength) {
    for (let i = effect2._depsLength; i < effect2.deps.length; i++) {
      cleanDepEffect(effect2.deps[i], effect2);
    }
    effect2.deps.length = effect2._depsLength;
  }
}
var ReactiveEffect = class {
  // 创建的 effect 是响应式的
  /**
   * effect 类
   * @param fn 用户编写的函数
   * @param scheduler 如果fn中依赖的数据发生变化后 需要重新调用 -> run()
   */
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.fn = fn;
    this.scheduler = scheduler;
  }
  fn;
  scheduler;
  _trackId = 0;
  // 用于记录当前effect执行了几次
  deps = [];
  // 双向记录的dep列表 （effect依赖了哪些dep）
  _depsLength = 0;
  // 本次run实际用到的dep数量 用于清理多余dep
  _running = 0;
  // 正在运行次数 防止自己又触发自己导致递归死循环
  _dirtyLevel = 4 /* Dirty */;
  // 脏标记
  active = true;
  get dirty() {
    return this._dirtyLevel === 4 /* Dirty */;
  }
  set dirty(value) {
    this._dirtyLevel = value ? 4 /* Dirty */ : 0 /* NoDirty */;
  }
  run() {
    this._dirtyLevel = 0 /* NoDirty */;
    if (!this.active) {
      return this.fn();
    }
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      preCleanEffect(this);
      this._running++;
      return this.fn();
    } finally {
      this._running--;
      postCleanEffect(this);
      activeEffect = lastEffect;
    }
  }
  /***
   * 停止effect的执行
   */
  stop() {
    if (this.active) {
      this.active = false;
      preCleanEffect(this);
      postCleanEffect(this);
    }
  }
};
function cleanDepEffect(dep, effect2) {
  dep.delete(effect2);
  if (dep.size === 0) {
    dep.cleanup();
  }
}
function trackEffect(effect2, dep) {
  if (dep.get(effect2) !== effect2._trackId) {
    dep.set(effect2, effect2._trackId);
  }
  let oldDep = effect2.deps[effect2._depsLength];
  if (oldDep !== dep) {
    if (oldDep) {
      cleanDepEffect(oldDep, effect2);
    }
    effect2.deps[effect2._depsLength++] = dep;
  } else {
    effect2._depsLength++;
  }
}
var triggerEffect = (dep) => {
  for (const effect2 of dep.keys()) {
    if (effect2._dirtyLevel < 4 /* Dirty */) {
      effect2._dirtyLevel = 4 /* Dirty */;
    }
    if (effect2.scheduler) {
      if (!effect2._running) {
        effect2.scheduler();
      }
    }
  }
};

// packages/reactivity/src/reactiveEffect.ts
var targetMap = /* @__PURE__ */ new WeakMap();
var createDep = (cleanup, key) => {
  const dep = /* @__PURE__ */ new Map();
  dep.cleanup = cleanup;
  dep.name = key;
  return dep;
};
function track(target, key) {
  if (!activeEffect) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(
      key,
      dep = createDep(() => {
        depsMap.delete(key);
      }, key)
    );
  }
  trackEffect(activeEffect, dep);
}
function trigger(target, key, newValue, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  let dep = depsMap.get(key);
  if (!dep) return;
  triggerEffect(dep);
}

// packages/reactivity/src/baseHandler.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    track(target, key);
    let res = Reflect.get(target, key, receiver);
    if (isObject(res)) {
      return reactive(res);
    }
    return res;
  },
  set(target, key, newValue, receiver) {
    let oldValue = target[key];
    let result = Reflect.set(target, key, newValue, receiver);
    if (oldValue !== newValue) {
      trigger(target, key, newValue, oldValue);
    }
    return result;
  }
};

// packages/reactivity/src/reactive.ts
var reactiveMap = /* @__PURE__ */ new WeakMap();
function createReactiveObject(target) {
  if (!isObject(target)) {
    return;
  }
  if (target["__v_isReactive" /* IS_REACTIVE */]) {
    return target;
  }
  const existProxy = reactiveMap.get(target);
  if (existProxy) {
    return existProxy;
  }
  let proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}
function reactive(target) {
  return createReactiveObject(target);
}
function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}

// packages/reactivity/src/ref.ts
function ref(value) {
  return createRef(value);
}
function createRef(value) {
  return new RefImpl(value);
}
var RefImpl = class {
  constructor(rawValue) {
    this.rawValue = rawValue;
    this._value = toReactive(rawValue);
  }
  rawValue;
  __v_isRef = true;
  // 增加ref 标识
  _value;
  // 用来保存ref的值
  dep;
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue;
      this._value = toReactive(newValue);
      triggerRefValue(this);
    }
  }
};
function trackRefValue(ref2) {
  if (activeEffect) {
    trackEffect(
      activeEffect,
      ref2.dep = ref2.dep || createDep(() => ref2.dep = void 0, `undefined`)
    );
  }
}
function triggerRefValue(ref2) {
  let dep = ref2.dep;
  if (dep) {
    triggerEffect(dep);
  }
}
var ObjectRefImpl = class {
  constructor(_object, _key) {
    this._object = _object;
    this._key = _key;
  }
  _object;
  _key;
  get value() {
    return this._object[this._key];
  }
  set value(newValue) {
    this._object[this._key] = newValue;
  }
};
function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}
function toRefs(object) {
  const res = {};
  for (let key in object) {
    res[key] = toRef(object, key);
  }
  return res;
}
function proxyRefs(objectWithRef) {
  return new Proxy(objectWithRef, {
    get(target, key, receiver) {
      let r = Reflect.get(target, key, receiver);
      return r.__v_isRef ? r.value : r;
    },
    set(target, key, newValue, receiver) {
      const oldValue = target[key];
      if (oldValue.__v_isRef) {
        oldValue.value = newValue;
        return true;
      } else {
        return Reflect.set(target, key, newValue, receiver);
      }
    }
  });
}

// packages/reactivity/src/computed.ts
var ComputedRefImpl = class {
  constructor(getter, setter) {
    this.setter = setter;
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {
        triggerRefValue(this);
      }
    );
  }
  setter;
  _value;
  effect;
  dep;
  get value() {
    if (this.effect.dirty) {
      this._value = this.effect.run();
      trackRefValue(this);
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
};
function computed(getterOrOptions) {
  let onlyGetter = isFunction(getterOrOptions);
  let getter, setter;
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}

// packages/reactivity/src/apiWatch.ts
function watch(source, callback, options = {}) {
  return doWatch(source, callback, options);
}
function traverse(source, depth, currentDepth = 0, seen = /* @__PURE__ */ new Set()) {
  if (!isObject(source)) return source;
  if (depth) {
    if (currentDepth >= depth) {
      return source;
    }
    currentDepth++;
  }
  if (seen.has(source)) return source;
  seen.add(source);
  for (let key in source) {
    traverse(source[key], depth, currentDepth, seen);
  }
  return source;
}
function watchEffect(source, options = {}) {
  return doWatch(source, null, options);
}
function doWatch(source, callback, { deep, depth, immediate }) {
  const reactiveGetter = (source2) => traverse(source2, deep === false ? 1 : void 0);
  let getter;
  if (isReactive(source)) getter = () => reactiveGetter(source);
  else if (isRef(source)) getter = () => source.value;
  else if (isFunction(source)) getter = source;
  let oldValue;
  let clean;
  const onCleanup = (fn) => {
    clean = () => {
      fn();
      clean = void 0;
    };
  };
  const job = () => {
    if (callback) {
      const newValue = effect2.run();
      if (clean) {
        clean();
      }
      callback(newValue, oldValue, onCleanup);
      oldValue = newValue;
    } else {
      effect2.run();
    }
  };
  const effect2 = new ReactiveEffect(getter, job);
  if (callback) {
    if (immediate) {
      job();
    } else {
      oldValue = effect2.run();
    }
  } else {
    effect2.run();
  }
  const unwatch = () => {
    effect2.stop();
  };
  return unwatch;
}

// packages/runtime-core/src/scheduler.ts
var queue = [];
var isFlushing = false;
var resolvePromsie = Promise.resolve();
function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  if (!isFlushing) {
    isFlushing = true;
    resolvePromsie.then(() => {
      isFlushing = false;
      const copy = queue.slice(0);
      queue.length = 0;
      copy.forEach((job2) => job2());
      copy.length = 0;
    });
  }
}

// packages/runtime-core/src/components.ts
function createComponentInstance(vnode, parent) {
  const instance = {
    data: null,
    // 状态
    vnode,
    // 组件的虚拟节点
    subTree: null,
    // 子树
    isMounted: false,
    // 是否挂载完成
    update: null,
    // 组件的更新函数
    props: {},
    attrs: {},
    slots: {},
    // 组件的插槽
    propsOptions: vnode.type.props,
    // 用户声明的哪些属性是组件属性
    component: null,
    proxy: null,
    // 用来代理 props  attrs data 让用户更方便使用
    setupState: null,
    exposed: null,
    parent,
    provides: parent ? parent.provides : /* @__PURE__ */ Object.create(null)
  };
  return instance;
}
var initProps = (instance, rawProps) => {
  const props = {};
  const attrs = {};
  const propsOptions = instance.propsOptions || {};
  if (rawProps) {
    for (let key in rawProps) {
      const value = rawProps[key];
      if (key in propsOptions) {
        props[key] = value;
      } else {
        attrs[key] = value;
      }
    }
  }
  instance.props = reactive(props);
  instance.attrs = attrs;
};
function initSlots(instance, children) {
  if (instance.vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
    instance.slots = children;
  } else {
    instance.slots = {};
  }
}
function setupComponent(instance) {
  const { vnode } = instance;
  initProps(instance, vnode.props);
  initSlots(instance, vnode.children);
  instance.proxy = new Proxy(instance, handler);
  const { data = () => {
  }, render: render2, setup } = vnode.type;
  if (setup) {
    const setupContext = {
      slots: instance.slots,
      attrs: instance.attrs,
      expose: (value) => {
        instance.exposed = value;
      },
      emit(event, ...payload) {
        const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;
        const handler2 = instance.vnode.props[eventName];
        handler2 && handler2(...payload);
      }
    };
    setCurrentInstance(instance);
    const setupResult = setup(instance.props, setupContext);
    unSetCurrentInstance();
    if (isFunction(setupResult)) {
      instance.render = setupResult;
    } else {
      instance.setupState = proxyRefs(setupResult);
    }
  }
  if (!isFunction(data)) {
    return console.warn("data option must be a function");
  } else {
    instance.data = reactive(data.call(instance.proxy));
  }
  if (!instance.render) {
    instance.render = render2;
  }
}
var publicPropety = {
  $attrs: (instance) => instance.attrs,
  $slots: (instance) => instance.slots
};
var handler = {
  get(target, key) {
    const { data, props, setupState } = target;
    if (data && hasOwn(data, key)) {
      return data[key];
    } else if (props && hasOwn(props, key)) {
      return props[key];
    } else if (setupState && hasOwn(setupState, key)) {
      return setupState[key];
    }
    const getter = publicPropety[key];
    if (getter) {
      return getter(target);
    }
    return target[key];
  },
  set(target, key, newValue, receiver) {
    const { data, props, setupState } = target;
    if (data && hasOwn(data, key)) {
      data[key] = newValue;
    } else if (props && hasOwn(props, key)) {
      console.warn("props are readonly");
      return false;
    } else if (setupState && hasOwn(setupState, key)) {
      setupState[key] = newValue;
    }
    return true;
  }
};
var currentInstance = null;
var setCurrentInstance = (instance) => {
  currentInstance = instance;
};
var unSetCurrentInstance = () => {
  currentInstance = null;
};

// packages/runtime-core/src/renderer.ts
function createRenderer(renderOptions2) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp
  } = renderOptions2;
  const normalize = (children = []) => {
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        if (typeof children[i] === "string" || typeof children[i] === "number") {
          children[i] = createVNode(Text, null, String(children[i]));
        }
      }
    }
    return children;
  };
  const mountChildren = (children, container, anchor = null, parentComponent) => {
    normalize(children);
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container, anchor, parentComponent);
    }
  };
  const mountElement = (vnode, container, anchor = null, parentComponent) => {
    const { type, children, props, shapeFlag } = vnode;
    let el = vnode.el = hostCreateElement(type);
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (shapeFlag & 8 /* TEXT_CHILDREN */) {
      hostSetElementText(el, children);
    } else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
      mountChildren(children, el, anchor, parentComponent);
    }
    hostInsert(el, container, anchor);
  };
  const processElement = (vnode1, vnode2, container, anchor = null, parentComponent) => {
    if (vnode1 === null) {
      mountElement(vnode2, container, anchor, parentComponent);
    } else {
      patchElement(vnode1, vnode2, container, anchor, parentComponent);
    }
  };
  const patchProps = (oldProps, newProps, el) => {
    for (let key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key]);
    }
    for (let key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  };
  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      unmount(child);
    }
  };
  const patchKeyedChildren = (c1, c2, el) => {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        let nextPos = e2 + 1;
        let anchor = c2[nextPos]?.el;
        while (i <= e2) {
          patch(null, c2[i], el, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      if (i <= e1) {
        while (i <= e1) {
          unmount(c1[i]);
          i++;
        }
      }
    } else {
      let s1 = i;
      let s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      let toBePatched = e2 - s2 + 1;
      let newIndexToOldMapIndex = new Array(toBePatched).fill(0);
      for (let i2 = s2; i2 <= e2; i2++) {
        const vnode = c2[i2];
        keyToNewIndexMap.set(vnode.key, i2);
      }
      for (let i2 = s1; i2 <= e1; i2++) {
        const vnode = c1[i2];
        const newIndex = keyToNewIndexMap.get(vnode.key);
        if (newIndex == void 0) {
          unmount(vnode);
        } else {
          newIndexToOldMapIndex[newIndex - s2] = i2 + 1;
          patch(vnode, c2[newIndex], el);
        }
      }
      let increasingSeq = getSequence(newIndexToOldMapIndex);
      let j = increasingSeq.length - 1;
      for (let i2 = toBePatched - 1; i2 >= 0; i2--) {
        let newIndex = s2 + i2;
        let anchor = c2[newIndex + 1]?.el;
        let vnode = c2[newIndex];
        if (!vnode.el) {
          patch(null, vnode, el, anchor);
        } else {
          if (i2 == increasingSeq[j]) {
            j--;
          } else {
            hostInsert(vnode.el, el, anchor);
          }
        }
      }
    }
  };
  const patchChildren = (n1, n2, el, anchor, parentComponent) => {
    const c1 = n1.children;
    const c2 = normalize(n2.children);
    const prevShapeFlag = n1.shapeFlag;
    const curShapeFlag = n2.shapeFlag;
    if (curShapeFlag & 8 /* TEXT_CHILDREN */) {
      if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        hostSetElementText(el, c2);
      }
    } else {
      if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
        if (curShapeFlag & 16 /* ARRAY_CHILDREN */) {
          patchKeyedChildren(c1, c2, el);
        } else {
          unmountChildren(c1);
        }
      } else {
        if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
          hostSetElementText(el, "");
        }
        if (curShapeFlag & 16 /* ARRAY_CHILDREN */) {
          mountChildren(c2, el, anchor, parentComponent);
        }
      }
    }
  };
  const patchElement = (n1, n2, container, anchor, parentComponent) => {
    let el = n2.el = n1.el;
    let oldProps = n1.props || {};
    let newProps = n2.props || {};
    patchProps(oldProps, newProps, el);
    patchChildren(n1, n2, el, anchor, parentComponent);
  };
  const processText = (vnode1, vnode2, container) => {
    if (vnode1 == null) {
      hostInsert(vnode2.el = hostCreateText(vnode2.children), container);
    } else {
      const el = vnode2.el = vnode1.el;
      if (vnode1.children !== vnode2.children) {
        hostSetText(el, vnode2.children);
      }
    }
  };
  const processFragment = (vnode1, vnode2, container, anchor, parentComponent) => {
    if (vnode1 == null) {
      mountChildren(vnode2.children, container, anchor, parentComponent);
    } else {
      patchChildren(vnode1, vnode2, container, anchor, parentComponent);
    }
  };
  const updateComponentPreRender = (instance, next) => {
    instance.next = null;
    instance.vnode = next;
    updateProps(instance, instance.props, next.props);
  };
  function setupRenderEffect(instance, container, anchor, parentComponent) {
    const { render: render3 } = instance;
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        const subTree = render3.call(instance.proxy, instance.proxy);
        instance.subTree = subTree;
        instance.isMounted = true;
        patch(null, subTree, container, anchor, instance);
      } else {
        const { next } = instance;
        if (next) {
          updateComponentPreRender(instance, next);
        }
        const subTree = render3.call(instance.proxy, instance.proxy);
        patch(instance.subTree, subTree, container, anchor, instance);
        instance.subTree = subTree;
      }
    };
    let effect2 = new ReactiveEffect(componentUpdateFn, () => {
      queueJob(update);
    });
    const update = instance.update = () => {
      effect2.run();
    };
    update();
  }
  const mountComponent = (vnode2, container, anchor, parentComponent) => {
    const instance = vnode2.component = createComponentInstance(
      vnode2,
      parentComponent
    );
    setupComponent(instance);
    setupRenderEffect(instance, container, anchor, parentComponent);
  };
  const hasPropsChance = (prevProps, nextProps) => {
    let nKeys = Object.keys(nextProps);
    if (Object.keys(prevProps).length !== Object.keys(nextProps).length) {
      return true;
    }
    for (let i = 0; i < nKeys.length; i++) {
      const key = nKeys[i];
      if (prevProps[key] !== nextProps[key]) {
        return true;
      }
    }
    return false;
  };
  const updateProps = (instance, prevProps, nextProps) => {
    if (hasPropsChance(prevProps, nextProps)) {
      for (let key in nextProps) {
        instance.props[key] = nextProps[key];
      }
      for (let key in instance.props) {
        if (!(key in nextProps)) {
          delete instance.props[key];
        }
      }
    }
  };
  const shouldComponentUpdate = (vnode1, vnode2) => {
    const { props: prevProp, children: prevChildren } = vnode1;
    const { props: nextProps, children: nextChildren } = vnode2;
    if (prevChildren || nextChildren) return true;
    if (prevProp === nextProps) return false;
    return hasPropsChance(prevProp, nextProps);
  };
  const updateComponent = (vnode1, vnode2) => {
    const instance = vnode2.component = vnode1.component;
    if (shouldComponentUpdate(vnode1, vnode2)) {
      instance.next = vnode2;
      instance.update();
    }
  };
  const processComponent = (vnode1, vnode2, container, anchor, parentComponent) => {
    if (vnode1 === null) {
      mountComponent(vnode2, container, anchor, parentComponent);
    } else {
      updateComponent(vnode1, vnode2);
    }
  };
  const patch = (vnode1, vnode2, container, anchor = null, parentComponent = null) => {
    if (vnode1 === vnode2) {
      return;
    }
    if (vnode1 && !isSameVnode(vnode1, vnode2)) {
      unmount(vnode1);
      vnode1 = null;
    }
    const { type, shapeFlag } = vnode2;
    switch (type) {
      case Text:
        processText(vnode1, vnode2, container);
        break;
      case Fragment:
        processFragment(vnode1, vnode2, container, anchor, parentComponent);
        break;
      default:
        if (shapeFlag & 1 /* ELEMENT */) {
          processElement(vnode1, vnode2, container, anchor, parentComponent);
        } else if (shapeFlag & 64 /* TELEPORT */) {
          type.process(vnode1, vnode2, container, anchor, parentComponent, {
            mountChildren,
            patchChildren,
            move(vnode, container2, anchor2) {
              hostInsert(
                vnode.component ? vnode.component.subTree.el : vnode.el,
                container2,
                anchor2
              );
            }
          });
        } else if (shapeFlag & 6 /* COMPONENT */) {
          processComponent(vnode1, vnode2, container, anchor, parentComponent);
        }
        break;
    }
  };
  const unmount = (vnode) => {
    const { shapeFlag } = vnode;
    if (vnode.type === Fragment) {
      unmountChildren(vnode.children);
    } else if (shapeFlag & 6 /* COMPONENT */) {
      unmount(vnode.component.subTree);
    } else if (shapeFlag & 64 /* TELEPORT */) {
      vnode.type.remove(vnode, unmountChildren);
    } else {
      hostRemove(vnode.el);
    }
  };
  const render2 = (vnode, container) => {
    if (vnode === null) {
      if (container._vnode) {
        unmount(container._vnode);
      }
    } else {
      patch(container._vnode || null, vnode, container);
      container._vnode = vnode;
    }
  };
  return {
    render: render2
  };
}

// packages/runtime-core/src/apiProvide.ts
function provide(key, value) {
  if (!currentInstance) return;
  const parentProvide = currentInstance.parent?.provides;
  let provides = currentInstance.provides;
  if (parentProvide === provides) {
    provides = currentInstance.provides = Object.create(provides);
  }
  provides[key] = value;
}
function inject(key, defaultValue) {
  if (!currentInstance) return;
  const provides = currentInstance.parent?.provides;
  if (provides && key in provides) {
    return provides[key];
  } else {
    return defaultValue;
  }
}

// packages/runtime-dom/src/index.ts
var renderOptions = Object.assign({ patchProp }, nodeOps);
var render = (vnode, container) => {
  return createRenderer(renderOptions).render(vnode, container);
};
export {
  DirtyLevel,
  Fragment,
  ReactiveEffect,
  ReactiveFlags,
  Teleport,
  Text,
  activeEffect,
  computed,
  createRenderer,
  createVNode,
  effect,
  h,
  inject,
  isReactive,
  isRef,
  isSameVnode,
  isTeleport,
  provide,
  proxyRefs,
  reactive,
  ref,
  render,
  toReactive,
  toRef,
  toRefs,
  trackEffect,
  trackRefValue,
  triggerEffect,
  triggerRefValue,
  watch,
  watchEffect
};
//# sourceMappingURL=runtime-dom.js.map
