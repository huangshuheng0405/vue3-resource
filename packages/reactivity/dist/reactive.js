import { isObject } from '../node_modules/@myvue/shared/src/index.js';
import { mutableHandlers } from './baseHandler.js';
import { ReactiveFlags } from './constants.js';
// 用于记录代理后的结果
let reactiveMap = new WeakMap();
function createReactiveObject(target) {
    // 统一做判断 响应式对象必须是对象才可以
    if (!isObject(target)) {
        return;
    }
    // 如果被代理过了 访问值 会触发 get
    if (target[ReactiveFlags.IS_REACTIVE]) {
        return target;
    }
    const existProxy = reactiveMap.get(target);
    // 如果有 直接返回
    if (existProxy) {
        return existProxy;
    }
    // 代理对象
    let proxy = new Proxy(target, mutableHandlers);
    // 根据对象缓存  代理后的结果
    reactiveMap.set(target, proxy);
    return proxy;
}
/**
 * 创建响应式对象 （Reactive）
 * @param target 传入的对象
 * @returns 代理后的对象
 */
export function reactive(target) {
    return createReactiveObject(target);
}
/**
 * 转换为响应式对象
 * @param value 传入的值
 * @returns 如果是对象 则返回代理后的对象 否则返回传入的值
 */
export function toReactive(value) {
    return isObject(value) ? reactive(value) : value;
}
//# sourceMappingURL=reactive.js.map