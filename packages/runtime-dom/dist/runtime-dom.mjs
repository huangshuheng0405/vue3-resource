// src/nodeOps.ts
var nodeOps = {
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

// src/modules/patchAttr.ts
function patchAttr(el, key, value) {
  if (value === null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key);
  }
}

// src/modules/patchClass.ts
function patchClass(el, nextValue) {
  if (nextValue == null) {
    el.removeAttribute("class");
  } else {
    el.className = nextValue;
  }
}

// src/modules/patchEvent.ts
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

// src/modules/patchStyle.ts
function patchStyle(el, prevValue, nextValue) {
  let style = el.style;
  for (let key in nextValue) {
    style[key] = nextValue[key];
  }
  if (prevValue) {
    for (let key in prevValue) {
      if (nextValue[key] == null) {
        style[key] = null;
      }
    }
  }
}

// src/patchProp.ts
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

// ../runtime-core/dist/runtime-core.mjs
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
function isString(value) {
  return typeof value === "string";
}
function isVNode(value) {
  return value.__v_isVnode;
}
function createVNode(type, props, children) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
  const vnode = {
    __v_isVnode: true,
    type,
    props,
    children,
    key: props?.key,
    // diff算法后面需要的key
    el: null,
    // 虚拟节点需要的真实节点是谁
    shapeFlag
  };
  if (children) {
    if (Array.isArray(children)) {
      vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    } else {
      children = String(children);
      vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
  }
  return vnode;
}
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
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container);
    }
  };
  const mountElement = (vnode, container) => {
    const { type, children, props, shapeFlag } = vnode;
    let el = hostCreateElement(type);
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
    hostInsert(el, container);
  };
  const patch = (n1, n2, container) => {
    if (n1 == n2) {
      return;
    }
    if (n1 === null) {
      mountElement(n2, container);
    }
  };
  const render2 = (vnode, container) => {
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode;
  };
  return {
    render: render2
  };
}

// src/index.ts
var renderOptions = Object.assign({ patchProp }, nodeOps);
var render = (vnode, container) => {
  return createRenderer(renderOptions).render(vnode, container);
};
export {
  createRenderer,
  createVNode,
  h,
  render
};
//# sourceMappingURL=runtime-dom.mjs.map
