export declare enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive"
}
export declare enum DirtyLevel {
    Dirty = 4,// 脏值 表示依赖变了 下次取值\执行要重新计算
    NoDirty = 0
}
/**
 * 判断是否是 ref 类型
 * @param value
 * @returns 是否是 ref 类型
 */
export declare function isRef(value: any): any;
/**
 * 判断是否是响应式对象
 * @param value
 * @returns
 */
export declare function isReactive(value: any): any;
//# sourceMappingURL=constants.d.ts.map