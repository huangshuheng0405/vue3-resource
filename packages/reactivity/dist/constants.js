export var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
})(ReactiveFlags || (ReactiveFlags = {}));
export var DirtyLevel;
(function (DirtyLevel) {
    DirtyLevel[DirtyLevel["Dirty"] = 4] = "Dirty";
    DirtyLevel[DirtyLevel["NoDirty"] = 0] = "NoDirty"; // 不脏 就用上一次缓存的结果
})(DirtyLevel || (DirtyLevel = {}));
/**
 * 判断是否是 ref 类型
 * @param value
 * @returns 是否是 ref 类型
 */
export function isRef(value) {
    return value.__v_isRef;
}
/**
 * 判断是否是响应式对象
 * @param value
 * @returns
 */
export function isReactive(value) {
    return value[ReactiveFlags.IS_REACTIVE];
}
//# sourceMappingURL=constants.js.map