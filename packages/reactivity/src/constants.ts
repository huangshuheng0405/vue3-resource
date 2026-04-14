export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export enum DirtyLevel {
  Dirty = 4, // 脏值 表示依赖变了 下次取值\执行要重新计算
  NoDirty = 0 // 不脏 就用上一次缓存的结果
}
