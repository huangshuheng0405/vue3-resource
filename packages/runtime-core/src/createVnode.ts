import { isObject, isString, ShapeFlags } from '@myvue/shared'

/**
 * 创建虚拟节点
 * @param type 节点类型 字符串（div）或者 对象（data() render()）  其余情况先给0
 * @param props 属性 class style onClick
 * @param children 子节点 文本、数组、空
 * @returns
 */
export function createVNode(type: any, props: any, children?: any) {
  // 位运算标记  一个数字可以同时表示多个信息 （元素/组件 + children类型）
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
      ? ShapeFlags.STATEFUL_COMPONENT // 有状态组件
      : 0
  const vnode = {
    __v_isVnode: true, // 虚拟节点标识
    type, // 节点类型（元素名/组件对象/Text/Fragment）（元素名/组件对象/Text/Fragment）
    props, // 属性  class/style/onClick/自定义 props）
    children, // 孩子 文本/数组/空
    key: props?.key, // diff 用来判断是否同一个节点，以及做列表 diff
    el: null, // 将来挂载后对应的真实 DOM 节点（mount 时会赋值）
    shapeFlag // 上面算出来的类型标记
  }

  // 根据 children 再补充 shapeFlag 标记
  if (children) {
    if (Array.isArray(children)) {
      vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN // 补充孩子是数组
    } else if (isObject(children)) {
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN // 组件的孩子
    } else {
      vnode.children = String(children)
      vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN // 补充孩子是文本
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
