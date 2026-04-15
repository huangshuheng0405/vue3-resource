import { activeEffect, trackEffect, triggerEffect } from './effect.js';
import { toReactive } from './reactive.js';
import { createDep } from './reactiveEffect.js';
/**
 * 创建响应式数据
 * @param value
 * @returns
 */
export function ref(value) {
    return createRef(value);
}
/**
 * 创建响应式数据 （Ref）
 * @param value
 * @returns
 */
function createRef(value) {
    return new RefImpl(value);
}
class RefImpl {
    rawValue;
    __v_isRef = true; // 增加ref 标识
    _value; // 用来保存ref的值
    dep;
    constructor(rawValue) {
        this.rawValue = rawValue;
        this._value = toReactive(rawValue);
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (newValue !== this.rawValue) {
            this.rawValue = newValue;
            this._value = toReactive(newValue);
            triggerRefValue(this);
        }
    }
}
/**
 * 收集依赖
 * @param ref
 */
export function trackRefValue(ref) {
    if (activeEffect) {
        trackEffect(activeEffect, (ref.dep = ref.dep || createDep(() => (ref.dep = undefined), `undefined`)));
    }
}
/**
 * 触发回调函数
 * @param ref
 */
export function triggerRefValue(ref) {
    let dep = ref.dep;
    if (dep) {
        triggerEffect(dep); // 触发依赖更新
    }
}
class ObjectRefImpl {
    _object;
    _key;
    constructor(_object, _key) {
        this._object = _object;
        this._key = _key;
    }
    get value() {
        return this._object[this._key];
    }
    set value(newValue) {
        this._object[this._key] = newValue;
    }
}
export function toRef(object, key) {
    return new ObjectRefImpl(object, key);
}
export function toRefs(object) {
    const res = {};
    for (let key in object) {
        // 每个属性调用 toRef 方法 生成响应式数据
        res[key] = toRef(object, key);
    }
    return res;
}
export function proxyRefs(objectWithRef) {
    return new Proxy(objectWithRef, {
        get(target, key, receiver) {
            let r = Reflect.get(target, key, receiver);
            return r.__v_isRef ? r.value : r; // 自动去掉 ref 标识
        },
        set(target, key, newValue, receiver) {
            const oldValue = target[key];
            if (oldValue.__v_isRef) {
                oldValue.value = newValue; // 如果老值是 ref 需要给 ref 赋值
                return true;
            }
            else {
                return Reflect.set(target, key, newValue, receiver);
            }
        }
    });
}
//# sourceMappingURL=ref.js.map