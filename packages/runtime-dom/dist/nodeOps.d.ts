export declare const nodeOps: {
    createElement(type: any): any;
    setElementText(el: any, text: any): void;
    insert(el: any, parent: any, anchor: any): void;
    /**
     * 移除dom节点
     * @param el 节点
     */
    remove(el: any): void;
    createText(text: any): Text;
    /**
     * 设置文本
     * @param el 元素节点
     * @param text 文本内容
     */
    setText(el: any, text: any): void;
    /**
     * 获取父节点
     * @param el 节点
     * @returns 父节点
     */
    parentNode(el: any): any;
    /**
     * 获取兄弟节点
     * @param el 节点
     * @returns 下一个兄弟节点
     */
    nextSibling(el: any): any;
};
//# sourceMappingURL=nodeOps.d.ts.map