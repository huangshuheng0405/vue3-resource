export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export enum DirtyLevel {
  Dirty = 4, // 脏值 表示依赖变了 下次取值\执行要重新计算
  NoDirty = 0 // 不脏 就用上一次缓存的结果
}

/**
 * 判断是否是 ref 类型
 * @param value
 * @returns 是否是 ref 类型
 */
export function isRef(value) {
  return value.__v_isRef
}

/**
 * 判断是否是响应式对象
 * @param value
 * @returns
 */
export function isReactive(value) {
  return value[ReactiveFlags.IS_REACTIVE]
}
