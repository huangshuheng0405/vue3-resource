import { isObject, isString, isVNode, ShapeFlags } from '@myvue/shared'
import { createVNode } from './createVnode.js'

/**
 * 创建虚拟节点
 * @param type 节点类型 'div'
 * @param propsOrChildren 属性 class style onClick
 * @param children 子节点 文本、数组、空
 * @returns
 */
export function h(type: string, propsOrChildren?: any, children?: any[]) {
  let l = arguments.length

  // 只有两个参数的情况
  if (l === 2) {
    // 是对象不是数组 可能是属性或者虚拟节点  h(div, 虚拟节点 或 属性)
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      // 虚拟节点
      if (isVNode(propsOrChildren)) {
        // h('div', h('a'))  这种情况  把vnode包装成数组children
        return createVNode(type, null, [propsOrChildren])
      } else {
        // 属性  h('div', { id: 'app' })
        return createVNode(type, propsOrChildren)
      }
    }

    // 儿子是 数组或文本  h('div', 'hello vue3')  h('div', [h('a'), 'hello vue3'])
    return createVNode(type, null, propsOrChildren)
  } else {
    // 参数大于3个的情况
    if (l > 3) {
      // h('div', 'hello vue3', h('a'), h('b'), 'hello vue3')
      // 从第三个参数开始把 children 转为数组
      children = Array.from(arguments).slice(2)
    }

    // 参数等于3个的情况
    // h('div', 'hello vue3', h('a'))
    if (l === 3 && isVNode(children)) {
      children = [children]
    }

    return createVNode(type, propsOrChildren, children)
  }
}

// 一句话： h() 就是把各种调用方式“归一化”，最后喂给 createVNode() 。
