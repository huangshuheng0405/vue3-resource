import { ShapeFlags } from '@myvue/shared'
import { isSameVnode } from './createVnode.js'

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
    // 第一次渲染 让虚拟节点和真实的dom 创建关联 vnode.el = 真是dom
    // 第二次渲染新的vnode 可以和上一次的vnode做对比 之后更新对应的el元素 可以后续再复用这个dom元素
    let el = (vnode.el = hostCreateElement(type))

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

  const processElement = (n1: any, n2: any, container: any) => {
    // n1 为 null 说明是挂载
    if (n1 === null) {
      // 初始化操作
      mountElement(n2, container)
    } else {
      patchElement(n1, n2, container)
    }
  }

  /**
   * 处理属性
   * @param oldProps 旧的属性
   * @param newProps 新的属性
   * @param el 元素
   */
  const patchProps = (oldProps: any, newProps: any, el: any) => {
    // 新的要全部生效
    for (let key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key])
    }

    // 处理以前的属性
    for (let key in oldProps) {
      if (!(key in newProps)) {
        // 以前多的现在没有了 要删掉以前的attr
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
  }

  const patchChildren = (n1: any, n2: any, container: any) => {}

  const patchElement = (n1: any, n2: any, container: any) => {
    // 比较元素差异 肯定要复用元素
    // 比较属性和元素的子节点
    let el = (n2.el = n1.el) // 对dom元素的复用

    let oldProps = n1.props || {}
    let newProps = n2.props || {}

    // hostPatchProp 只针对某一个属性来处理 class style event attr
    patchProps(oldProps, newProps, el)

    //
    patchChildren(n1, n2, container)
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

    // 直接移除旧的dom元素 初始化新的dom元素
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1)
      n1 = null
    }

    // n1.shapeFlag
    processElement(n1, n2, container)
  }

  const unmount = (vnode: any) => {
    hostRemove(vnode.el)
  }

  // 多次调用render会进行虚拟节点的比较 再进行更新
  /**
   * 渲染虚拟节点
   * @param vnode 虚拟节点
   * @param container 容器元素
   */
  const render = (vnode: any, container: any) => {
    if (vnode === null) {
      if (container._vnode) {
        unmount(container._vnode)
      }
    }

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
