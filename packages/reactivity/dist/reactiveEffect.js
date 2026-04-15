import { activeEffect, trackEffect, triggerEffect } from './effect.js';
const targetMap = new WeakMap(); // 存放依赖收集的关系
// - targetMap: WeakMap<target, depsMap>
// - depsMap: Map<key, dep>   ---管这个对象上每个key的dep
// - dep: Map<effect, trackId/flag> ---管这个key被哪些effect用到了
/**
 * 创建一个依赖集合
 * @param cleanup 清理函数 用于清理不需要的属性
 * @param key 键值
 * @returns 依赖集合
 */
export const createDep = (cleanup, key) => {
    const dep = new Map();
    dep.cleanup = cleanup; // 如果这个dep最后空了 就把depsMap中对应的key删除（减少无用映射）
    dep.name = key; // 标识用途 方便debug时这个dep对应哪个key
    return dep;
};
/**
 * 读取对象的key对应的依赖集合 收集依赖
 * @param target 目标对象
 * @param key 键值
 */
export function track(target, key) {
    if (!activeEffect) {
        // 说明不是在effect(()=> ...)时发生的读取  或是 普通读值不需要建立依赖关系
        return;
    }
    // depsMap 管这个对象上每个key的dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        // 没有就创建
        targetMap.set(target, (depsMap = new Map()));
    }
    // dep管这个key被哪些effect用到了
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = createDep(() => {
            depsMap.delete(key); // 后面用于清理不需要的属性
        }, key)));
    }
    trackEffect(activeEffect, dep); // 将当前的effect放入dep中 后续可以根据值的变化 触发此dep中存放的effect
}
// baseHandler.ts 调用的 在Proxy的set里调用的
/**
 * 找到target对应的key对应的依赖集合 触发相关的所有effect
 * @param target
 * @param key
 * @param newValue
 * @param oldValue
 * @returns
 */
export function trigger(target, key, newValue, oldValue) {
    // 根据 target 找depsMap，找不到就说明从来没人依赖过他，直接返回
    const depsMap = targetMap.get(target);
    // 找不到对象直接返回
    if (!depsMap)
        return;
    let dep = depsMap.get(key);
    if (!dep)
        return;
    // 修改属性对应的 effect
    triggerEffect(dep);
}
//# sourceMappingURL=reactiveEffect.js.map