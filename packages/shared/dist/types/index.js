/**
 * 判断是否为对象
 * @param value 任意值
 * @returns 是否为对象
 */
export function isObject(value) {
    return typeof value === 'object' && value !== null;
}
/**
 * 判断是否为函数
 * @param value 任意值
 * @returns 是否为函数
 */
export function isFunction(value) {
    return typeof value === 'function';
}
/**
 * 判断是否为字符串
 * @param value 任意值
 * @returns 是否为字符串
 */
export function isString(value) {
    return typeof value === 'string';
}
/**
 * 判断是否为虚拟节点
 * @param value 任意值
 * @returns 是否为虚拟节点
 */
export function isVNode(value) {
    return value.__v_isVnode;
}
export * from './shapeFlags.js';
//# sourceMappingURL=index.js.map