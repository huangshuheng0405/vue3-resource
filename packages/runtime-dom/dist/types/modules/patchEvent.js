function createInvoker(nextValue) {
    const invoker = (e) => {
        invoker.value(e);
    };
    // 更改 invoker中的value属性 可以修改对应的调用函数
    invoker.value = nextValue;
    return invoker;
}
/**
 * 事件绑定
 * @param el 元素节点
 * @param key 事件名 例：onClick
 * @param nextValue 事件处理函数
 * @returns
 */
export function patchEvent(el, key, nextValue) {
    // vue_event_invoker
    // 拿到旧的
    const invokers = el._vei || (el._vei = {});
    // 取出事件名 要转小写 onClick -> click
    const eventName = key.slice(2).toLowerCase();
    // 是否存在同名的事件绑定
    const existingInvoker = invokers[key];
    // 更新：新值存在 旧invoker存在 （换绑）
    if (nextValue && existingInvoker) {
        // 事件换绑
        return (existingInvoker.value = nextValue);
    }
    // 新增：新值存在 旧值invoker不存在
    if (nextValue) {
        // 创建一个调用函数 并且内部会执行nextValue函数
        const invoker = (invokers[key] = createInvoker(nextValue));
        return el.addEventListener(eventName, invoker);
    }
    // 删除：新值不存在 就invoker存在
    if (existingInvoker) {
        el.removeEventListener(eventName, existingInvoker);
        invokers[key] = undefined;
    }
}
//# sourceMappingURL=patchEvent.js.map