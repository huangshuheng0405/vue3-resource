/**
 * 创建响应式数据
 * @param value
 * @returns
 */
export declare function ref(value: any): RefImpl;
declare class RefImpl {
    rawValue: any;
    __v_isRef: boolean;
    _value: any;
    dep: any;
    constructor(rawValue: any);
    get value(): any;
    set value(newValue: any);
}
/**
 * 收集依赖
 * @param ref
 */
export declare function trackRefValue(ref: any): void;
/**
 * 触发回调函数
 * @param ref
 */
export declare function triggerRefValue(ref: any): void;
declare class ObjectRefImpl {
    _object: any;
    _key: any;
    constructor(_object: any, _key: any);
    get value(): any;
    set value(newValue: any);
}
export declare function toRef(object: object, key: any): ObjectRefImpl;
export declare function toRefs(object: any): {};
export declare function proxyRefs(objectWithRef: RefImpl): RefImpl;
export {};
//# sourceMappingURL=ref.d.ts.map