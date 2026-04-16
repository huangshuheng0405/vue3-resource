import { ShapeFlags } from '@myvue/shared'

/**
 * 把vnode渲染成真实dom
 * @param renderOptions runtime-dom提供的操作dom的函数
 * @returns 一个对象包含render
 */
export function createRenderer(renderOptions: any) {
  // 解构 统一命名
  // host表示平台层的实现 core只是调用它们
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
  } = renderOptions

  /**
   * 挂载子节点数组
   * @param children 子节点数组
   * @param container 容器元素
   */
  const mountChildren = (children: any, container: any) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container)
    }
  }

  /**
   * 把一个元素VNode变成真实节点并插入
   * @param vnode 虚拟节点
   * @param container 容器元素
   */
  const mountElement = (vnode: any, container: any) => {
    const { type, children, props, shapeFlag } = vnode

    // 创建真实元素
    let el = hostCreateElement(type)

    // 处理属性
    if (props) {
      for (let key in props) {
        // 设置元素的 属性 事件 类名
        hostPatchProp(el, key, null, props[key])
      }
    }

    // 判断children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 数组
      mountChildren(children, el)
    }

    // 最后插入到容器
    hostInsert(el, container)
  }

  // 渲染走这里 更新也走这里
  /**
   * 更新虚拟节点
   * @param n1 旧的虚拟节点
   * @param n2 新的虚拟节点
   * @param container 容器元素
   * @returns
   */
  const patch = (n1: any, n2: any, container: any) => {
    if (n1 == n2) {
      // 再次渲染同一个元素直接跳过即可
      return
    }

    // n1 为 null 说明是挂载
    if (n1 === null) {
      // 初始化操作
      mountElement(n2, container)
    }
  }

  // 多次调用render会进行虚拟节点的比较 再进行更新
  const render = (vnode: any, container: any) => {
    // 将虚拟节点变成真实节点进行渲染
    patch(container._vnode || null, vnode, container)

    // 第二次渲染就会拿到旧的vnode  以后会做diff更新
    container._vnode = vnode
  }

  return {
    render
  }
}

/**
 * 对于解构
 * 换平台（Canvas、小程序），只要传不同的renderOptions即可，core代码不需要改
 */
