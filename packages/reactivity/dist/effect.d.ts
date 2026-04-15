import { DirtyLevel } from './constants.js';
export declare function effect(fn: any, options?: any): () => any;
export declare let activeEffect: any;
export declare class ReactiveEffect {
    fn: any;
    scheduler: any;
    _trackId: number;
    deps: never[];
    _depsLength: number;
    _running: number;
    _dirtyLevel: DirtyLevel;
    active: boolean;
    /**
     * effect 类
     * @param fn 用户编写的函数
     * @param scheduler 如果fn中依赖的数据发生变化后 需要重新调用 -> run()
     */
    constructor(fn: any, scheduler: any);
    get dirty(): boolean;
    set dirty(value: boolean);
    run(): any;
    /***
     * 停止effect的执行
     */
    stop(): void;
}
export declare function trackEffect(effect: ReactiveEffect, dep: any): void;
/**
 * 触发key相关联的所有effect集合 执行里面的回调函数
 * @param dep 对象里的key对应的所有effect集合
 */
export declare const triggerEffect: (dep: any) => void;
//# sourceMappingURL=effect.d.ts.map