// ../shared/dist/shared.mjs
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

// src/createVnode.ts
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

// src/h.ts
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

// src/renderer.ts
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
  const render = (vnode, container) => {
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode;
  };
  return {
    render
  };
}
export {
  createRenderer,
  createVNode,
  h
};
//# sourceMappingURL=runtime-core.mjs.map
