import { ReactiveEffect } from './effect.js';
declare class ComputedRefImpl<T> {
    setter: any;
    _value: T;
    readonly effect: ReactiveEffect;
    dep: any;
    constructor(getter: any, setter: any);
    get value(): T;
    set value(newValue: T);
}
export declare function computed(getterOrOptions: any): ComputedRefImpl<unknown>;
export {};
//# sourceMappingURL=computed.d.ts.map