import { nodeOps } from './nodeOps.js'
import patchProp from './patchProp.js'

import { createRenderer } from '@myvue/runtime-core'

// 将 操作节点的函数和 处理属性的函数 合并在一起
const renderOptions = Object.assign({ patchProp }, nodeOps)

// render 采用方法采用dom方法来进行渲染
/**
 * 渲染虚拟节点到容器
 * @param vnode 虚拟节点
 * @param container 容器元素
 * @returns
 */
export const render = (vnode: any, container: any) => {
  return createRenderer(renderOptions).render(vnode, container)
}

export * from '@myvue/runtime-core'

// runtime-dom -> runtime-core -> reactivity
