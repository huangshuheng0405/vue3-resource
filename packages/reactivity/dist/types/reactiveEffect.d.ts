/**
 * 创建一个依赖集合
 * @param cleanup 清理函数 用于清理不需要的属性
 * @param key 键值
 * @returns 依赖集合
 */
export declare const createDep: (cleanup: any, key: any) => any;
/**
 * 读取对象的key对应的依赖集合 收集依赖
 * @param target 目标对象
 * @param key 键值
 */
export declare function track(target: any, key: any): void;
/**
 * 找到target对应的key对应的依赖集合 触发相关的所有effect
 * @param target
 * @param key
 * @param newValue
 * @param oldValue
 * @returns
 */
export declare function trigger(target: any, key: any, newValue: any, oldValue: any): void;
//# sourceMappingURL=reactiveEffect.d.ts.map