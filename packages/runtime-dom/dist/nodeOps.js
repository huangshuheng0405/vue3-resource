// 主要是对节点的增删改查
export const nodeOps = {
    createElement(type) {
        return document.createElement(type);
    },
    setElementText(el, text) {
        el.textContent = text;
    },
    insert(el, parent, anchor) {
        // 如果第三个参数不传  等价于 appendChild
        parent.insertBefore(el, anchor || null);
    },
    /**
     * 移除dom节点
     * @param el 节点
     */
    remove(el) {
        const parent = el.parentNode;
        if (parent) {
            parent.removeChild(el);
        }
    },
    createText(text) {
        return document.createTextNode(text);
    },
    /**
     * 设置文本
     * @param el 元素节点
     * @param text 文本内容
     */
    setText(el, text) {
        el.nodeValue = text;
    },
    /**
     * 获取父节点
     * @param el 节点
     * @returns 父节点
     */
    parentNode(el) {
        return el.parentNode;
    },
    /**
     * 获取兄弟节点
     * @param el 节点
     * @returns 下一个兄弟节点
     */
    nextSibling(el) {
        return el.nextSibling;
    }
};
//# sourceMappingURL=nodeOps.js.map