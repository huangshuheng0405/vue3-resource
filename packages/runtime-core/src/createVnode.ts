import { isObject, isString, ShapeFlags } from '@myvue/shared'

/**
 * 创建虚拟节点
 * @param type 节点类型 'div'
 * @param props 属性 class style onClick
 * @param children 子节点 文本、数组、空
 * @returns
 */
export function createVNode(type: any, props: any, children?: any) {
  // 位运算标记
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
      ? ShapeFlags.STATEFUL_COMPONENT
      : 0
  const vnode = {
    __v_isVnode: true,
    type,
    props,
    children,
    key: props?.key, // diff算法后面需要的key
    el: null, // 虚拟节点需要的真实节点是谁
    shapeFlag
  }

  // 根据 children 补充 shapeFlag 标记
  if (children) {
    if (Array.isArray(children)) {
      vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    } else {
      children = String(children)
      vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    }
  }

  return vnode
}

/**
 * 判断是否是同一个虚拟节点
 * @param n1 虚拟节点1
 * @param n2 虚拟节点2
 * @returns 是否是同一个虚拟节点
 */
export function isSameVnode(n1: any, n2: any) {
  return n1.type === n2.type && n1.key === n2.key
}

export const Text = Symbol('Text')

export const Fragment = Symbol('Fragment')
