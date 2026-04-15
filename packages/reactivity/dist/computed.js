import { isFunction } from 'packages/shared/src/index.js';
import { ReactiveEffect } from './effect.js';
import { trackRefValue, triggerRefValue } from './ref.js';
class ComputedRefImpl {
    setter;
    _value;
    effect;
    dep;
    constructor(getter, setter) {
        this.setter = setter;
        // 需要创建一个 effect 来收集当前计算属性的dirty属性
        this.effect = new ReactiveEffect(() => getter(this._value), () => {
            // 计算属性依赖的值变化了 应该触发渲染
            triggerRefValue(this); // 依赖的属性变化后需要重新触发重新渲染 还需要将dirty变为true
        });
    }
    get value() {
        // 让计算属性收集对应的 effect
        // 这里需要做额外处理
        if (this.effect.dirty) {
            // 默认取值一定是脏的 但是执行一次run后就不脏了
            this._value = this.effect.run();
            trackRefValue(this);
            // 如果当前在effect中访问了计算属性 计算属性是可以收集这个effect的
        }
        return this._value;
    }
    set value(newValue) {
        // 这个就是 ref的setter
        this.setter(newValue);
    }
}
export function computed(getterOrOptions) {
    let onlyGetter = isFunction(getterOrOptions);
    let getter, setter;
    if (onlyGetter) {
        getter = getterOrOptions;
        setter = () => { };
    }
    else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    return new ComputedRefImpl(getter, setter);
}
//# sourceMappingURL=computed.js.map