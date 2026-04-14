import { isObject } from '@myvue/shared/src/index.js'
import { track, trigger } from './reactiveEffect.js'
import { reactive } from './reactive.js'
import { ReactiveFlags } from './constants.js'

export const mutableHandlers: ProxyHandler<object> = {
  get(target, key, receiver) {
    // 只有代理对象有 get set
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    // 当取值的时候 应该让相响应式属性 和 effect 映射起来
    track(target, key) // 收集这个对象上的属性 和 effect 关联在一起
    let res = Reflect.get(target, key, receiver)
    // 当取的值也是对象的时候 要对这个对象进行代理 递归处理
    if (isObject(res)) {
      return reactive(res)
    }
    // 依赖收集
    return res
  },

  set(target, key, newValue, receiver) {
    let oldValue = target[key]
    let result = Reflect.set(target, key, newValue, receiver)
    // 修改的值与原来相同就不修改
    if (oldValue !== newValue) {
      // 触发页面更新
      trigger(target, key, newValue, oldValue)
    }

    // 触发更新
    return result
  }
}
export { ReactiveFlags }
