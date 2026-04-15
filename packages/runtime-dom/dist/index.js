import { nodeOps } from './nodeOps.js';
import patchProp from './patchProp.js';
// 将节点操作和属性合并在一起
// @ts-ignore
import { createRenderer } from '@myvue/runtime-core';
const renderOptions = Object.assign({ patchProp }, nodeOps);
// render 采用方法采用dom方法来进行渲染
export const render = (vnode, container) => {
    return createRenderer(renderOptions).render(vnode, container);
};
// @ts-ignore
export * from '@myvue/runtime-core';
// runtime-dom -> runtime-core -> reactivity
//# sourceMappingURL=index.js.map