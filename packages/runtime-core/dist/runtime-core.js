// packages/shared/dist/shared.js
var ShapeFlags = /* @__PURE__ */ ((ShapeFlags22) => {
  ShapeFlags22[ShapeFlags22["ELEMENT"] = 1] = "ELEMENT";
  ShapeFlags22[ShapeFlags22["FUNCTIONAL_COMPONENT"] = 2] = "FUNCTIONAL_COMPONENT";
  ShapeFlags22[ShapeFlags22["STATEFUL_COMPONENT"] = 4] = "STATEFUL_COMPONENT";
  ShapeFlags22[ShapeFlags22["TEXT_CHILDREN"] = 8] = "TEXT_CHILDREN";
  ShapeFlags22[ShapeFlags22["ARRAY_CHILDREN"] = 16] = "ARRAY_CHILDREN";
  ShapeFlags22[ShapeFlags22["SLOTS_CHILDREN"] = 32] = "SLOTS_CHILDREN";
  ShapeFlags22[ShapeFlags22["TELEPORT"] = 64] = "TELEPORT";
  ShapeFlags22[ShapeFlags22["SUSPENSE"] = 128] = "SUSPENSE";
  ShapeFlags22[ShapeFlags22["COMPONENT_SHOULD_KEEP_ALIVE"] = 256] = "COMPONENT_SHOULD_KEEP_ALIVE";
  ShapeFlags22[ShapeFlags22["COMPONENT_KEPT_ALIVE"] = 512] = "COMPONENT_KEPT_ALIVE";
  ShapeFlags22[ShapeFlags22["COMPONENT"] = 6] = "COMPONENT";
  return ShapeFlags22;
})(ShapeFlags || {});
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

// packages/runtime-core/src/createVnode.ts
function createVNode(type, props, children) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0;
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
      vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    } else {
      vnode.children = String(children);
      vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
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

// packages/reactivity/dist/reactivity.js
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
    __publicField(this, "fn", fn);
    __publicField(this, "scheduler", scheduler);
    __publicField(this, "_trackId", 0);
    __publicField(this, "deps", []);
    __publicField(this, "_depsLength", 0);
    __publicField(this, "_running", 0);
    __publicField(
      this,
      "_dirtyLevel",
      4
      /* Dirty */
    );
    __publicField(this, "active", true);
    this.fn = fn;
    this.scheduler = scheduler;
  }
  get dirty() {
    return this._dirtyLevel === 4;
  }
  set dirty(value) {
    this._dirtyLevel = value ? 4 : 0;
  }
  run() {
    this._dirtyLevel = 0;
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
    if (effect2._dirtyLevel < 4) {
      effect2._dirtyLevel = 4;
    }
    if (effect2.scheduler) {
      if (!effect2._running) {
        effect2.scheduler();
      }
    }
  }
};
function isObject2(value) {
  return typeof value === "object" && value !== null;
}
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
var mutableHandlers = {
  get(target, key, receiver) {
    if (key === "__v_isReactive") {
      return true;
    }
    track(target, key);
    let res = Reflect.get(target, key, receiver);
    if (isObject2(res)) {
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
var reactiveMap = /* @__PURE__ */ new WeakMap();
function createReactiveObject(target) {
  if (!isObject2(target)) {
    return;
  }
  if (target[
    "__v_isReactive"
    /* IS_REACTIVE */
  ]) {
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
function createComponentInstance(vnode) {
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
    propsOptions: vnode.type.props,
    // 用户声明的哪些属性是组件属性
    component: null,
    proxy: null
    // 用来代理 props  attrs data 让用户更方便使用
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
function setupComponent(instance) {
  const { vnode } = instance;
  initProps(instance, vnode.props);
  instance.proxy = new Proxy(instance, handler);
  const { data = () => {
  }, render } = vnode.type;
  if (!isFunction(data)) {
    return console.warn("data option must be a function");
  } else {
    instance.data = reactive(data.call(instance.proxy));
  }
  instance.render = render;
}
var publicPropety = {
  $attrs: (instance) => instance.attrs,
  $slots: (instance) => instance.vnode.slots
};
var handler = {
  get(target, key) {
    const { data, props } = target;
    if (data && hasOwn(data, key)) {
      return data[key];
    } else if (props && hasOwn(props, key)) {
      return props[key];
    }
    const getter = publicPropety[key];
    if (getter) {
      return getter(target);
    }
    return target[key];
  },
  set(target, key, newValue, receiver) {
    const { data, props } = target;
    if (data && hasOwn(data, key)) {
      data[key] = newValue;
    } else if (props && hasOwn(props, key)) {
      console.warn("props are readonly");
      return false;
    }
    return true;
  }
};

// packages/runtime-core/src/renderer.ts
function createRenderer(renderOptions) {
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
  } = renderOptions;
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container);
    }
  };
  const mountElement = (vnode, container, anchor = null) => {
    const { type, children, props, shapeFlag } = vnode;
    let el = vnode.el = hostCreateElement(type);
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);
    }
    hostInsert(el, container, anchor);
  };
  const processElement = (vnode1, vnode2, container, anchor = null) => {
    if (vnode1 === null) {
      mountElement(vnode2, container, anchor);
    } else {
      patchElement(vnode1, vnode2, container);
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
  const patchChildren = (n1, n2, el) => {
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const curShapeFlag = n2.shapeFlag;
    if (curShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        hostSetElementText(el, c2);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (curShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          patchKeyedChildren(c1, c2, el);
        } else {
          unmountChildren(c1);
        }
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, "");
        }
        if (curShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el);
        }
      }
    }
  };
  const patchElement = (n1, n2, container) => {
    let el = n2.el = n1.el;
    let oldProps = n1.props || {};
    let newProps = n2.props || {};
    patchProps(oldProps, newProps, el);
    patchChildren(n1, n2, el);
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
  const processFragment = (vnode1, vnode2, container) => {
    if (vnode1 == null) {
      mountChildren(vnode2.children, container);
    } else {
      patchChildren(vnode1, vnode2, container);
    }
  };
  const updateComponentPreRender = (instance, next) => {
    instance.next = null;
    instance.vnode = next;
    updateProps(instance, instance.props, next.props);
  };
  function setupRenderEffect(instance, container, anchor) {
    const { render: render2 } = instance;
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        const subTree = render2.call(instance.proxy, instance.proxy);
        instance.subTree = subTree;
        instance.isMounted = true;
        patch(null, subTree, container, anchor);
      } else {
        const { next } = instance;
        if (next) {
          updateComponentPreRender(instance, next);
        }
        const subTree = render2.call(instance.proxy, instance.proxy);
        patch(instance.subTree, subTree, container, anchor);
        instance.subTree = subTree;
      }
    };
    let effect = new ReactiveEffect(componentUpdateFn, () => {
      queueJob(update);
    });
    const update = instance.update = () => {
      effect.run();
    };
    update();
  }
  const mountComponent = (vnode2, container, anchor) => {
    const instance = vnode2.component = createComponentInstance(vnode2);
    setupComponent(instance);
    setupRenderEffect(instance, container, anchor);
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
  const processComponent = (vnode1, vnode2, container, anchor) => {
    if (vnode1 === null) {
      mountComponent(vnode2, container, anchor);
    } else {
      updateComponent(vnode1, vnode2);
    }
  };
  const patch = (vnode1, vnode2, container, anchor = null) => {
    if (vnode1 == vnode2) {
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
        processFragment(vnode1, vnode2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode1, vnode2, container, anchor);
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(vnode1, vnode2, container, anchor);
        }
        break;
    }
  };
  const unmount = (vnode) => {
    if (vnode.type === Fragment) {
      unmountChildren(vnode.children);
    } else {
      hostRemove(vnode.el);
    }
  };
  const render = (vnode, container) => {
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
    render
  };
}
export {
  Fragment,
  Text,
  createRenderer,
  createVNode,
  h,
  isSameVnode
};
//# sourceMappingURL=runtime-core.js.map
