/**
 * 创建虚拟节点
 * @param type 节点类型 'div'
 * @param props 属性 class style onClick
 * @param children 子节点 文本、数组、空
 * @returns
 */
export declare function createVNode(type: any, props: any, children?: any): {
    __v_isVnode: boolean;
    type: any;
    props: any;
    children: any;
    key: any;
    el: null;
    shapeFlag: number;
};
/**
 * 判断是否是同一个虚拟节点
 * @param n1 虚拟节点1
 * @param n2 虚拟节点2
 * @returns 是否是同一个虚拟节点
 */
export declare function isSameVnode(n1: any, n2: any): boolean;
export declare const Text: unique symbol;
export declare const Fragment: unique symbol;
//# sourceMappingURL=createVnode.d.ts.map