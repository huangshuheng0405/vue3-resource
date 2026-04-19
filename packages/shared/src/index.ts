/**
 * 判断是否为对象
 * @param value 任意值
 * @returns 是否为对象
 */
export function isObject(value: any) {
  return typeof value === 'object' && value !== null
}

/**
 * 判断是否为函数
 * @param value 任意值
 * @returns 是否为函数
 */
export function isFunction(value: any) {
  return typeof value === 'function'
}

/**
 * 判断是否为字符串
 * @param value 任意值
 * @returns 是否为字符串
 */
export function isString(value: any) {
  return typeof value === 'string'
}

/**
 * 判断是否为虚拟节点
 * @param value 任意值
 * @returns 是否为虚拟节点
 */
export function isVNode(value: any) {
  return value.__v_isVnode
}

const hasOwnProperty = Object.prototype.hasOwnProperty

export const hasOwn = (value: any, key: any) => hasOwnProperty.call(value, key)

export * from './shapeFlags.js'
