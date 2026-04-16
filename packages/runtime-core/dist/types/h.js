import { isObject, isString, isVNode, ShapeFlags } from '@myvue/shared';
import { createVNode } from './createVnode.js';
export function h(type, propsChildren, children) {
    let l = arguments.length;
    if (l === 2) {
        // 是对象不是数组 可能是属性或者虚拟节点  h(div, 虚拟节点 或 属性)
        if (isObject(propsChildren) && !Array.isArray(propsChildren)) {
            // 虚拟节点
            if (isVNode(propsChildren)) {
                // h('div', h('a'))  这种情况
                return createVNode(type, null, [propsChildren]);
            }
            else {
                // 属性
                createVNode(type, propsChildren);
            }
        }
        // 儿子是 数组或文本
        createVNode(type, null, propsChildren);
    }
    else {
        if (l > 3) {
            children = Array.from(arguments).slice(2);
        }
        if (l === 3 && isVNode(children)) {
            children = [children];
        }
        return createVNode(type, propsChildren, children);
    }
}
//# sourceMappingURL=h.js.map