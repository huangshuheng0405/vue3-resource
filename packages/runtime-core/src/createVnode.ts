import { isString, ShapeFlags } from '@myvue/shared'

/**
 * 创建虚拟节点
 * @param type 节点类型 'div'
 * @param props 属性 class style onClick
 * @param children 子节点 文本、数组、空
 * @returns
 */
export function createVNode(type: any, props: any, children?: any) {
  // 位运算标记
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
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
