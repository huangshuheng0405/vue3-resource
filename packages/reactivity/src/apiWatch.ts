import { isFunction, isObject } from 'packages/shared/src/index.js'
import { ReactiveEffect } from './effect.js'
import { isReactive } from './constants.js'
import { isRef } from './constants.js'

/**
 * 监听对象
 * @param source 监听对象
 * @param callback 回调函数
 * @param options 配置选项
 * @returns
 */
export function watch(source, callback, options = {} as any) {
  // watchEffect 也是基于doWatch来实现的
  return doWatch(source, callback, options)
}

/**
 * 深度遍历 强行触发 getter
 * @param source 监听对象
 * @param depth 深度遍历的深度
 * @param currentDepth 当前遍历的深度
 * @param seen 已遍历的对象集合
 * @returns
 */
function traverse(source, depth, currentDepth = 0, seen = new Set()) {
  if (!isObject(source)) return source

  // 控制遍历深度
  if (depth) {
    if (currentDepth >= depth) {
      return source
    }
    currentDepth++ // 根据deep属性 来看是否深度
  }

  // 防止死循环 如果有个对象里有个属性指向了自己 避免无限递归
  if (seen.has(source)) return source
  seen.add(source)

  // 遍历对象的每一个 key
  for (let key in source) {
    // source[key] 这一步 出发了响应式的 Proxy get拦截
    // 从而让当前的 activeEffecct被收集到对应的dep中
    traverse(source[key], depth, currentDepth, seen)
  }

  return source // 遍历就会触发get
}

export function watchEffect(source, options = {} as any) {
  // watchEffect 没有callback
  return doWatch(source, null, options)
}

/**
 * 实现watch
 * @param source 监听对象
 * @param callback 回调函数
 * @param param2
 * @returns 取消监听的函数
 */
function doWatch(source, callback, { deep, depth, immediate }) {
  const reactiveGetter = (source) =>
    traverse(source, deep === false ? 1 : undefined)

  let getter
  // 判断监听对象是 ref reactive 还是 函数

  // 如果是 reactive 就用traverse去深层触发他的get
  if (isReactive(source)) getter = () => reactiveGetter(source)
  // 如果是 ref 就访问一下.value 触发trackRefValue
  else if (isRef(source)) getter = () => source.value
  // 如果是函数 () => state.a 自己就是现成的getter
  else if (isFunction(source)) getter = source
  // 产生一个可以给ReactiveEffect 来使用的getter 需要对这个对象进行取值操作 会关联当前的reactiveEffect
  let oldValue

  let clean
  const onCleanup = (fn) => {
    clean = () => {
      fn()
      clean = undefined
    }
  }

  // 会触发传进来的回调函数
  const job = () => {
    if (callback) {
      // 重新执行getter 拿到新值
      const newValue = effect.run()

      if (clean) {
        // 在执行回调前 先调用上一次的清理操作
        clean()
      }

      // 触发回调函数
      callback(newValue, oldValue, onCleanup)
      oldValue = newValue
    } else {
      // watchEffect 的实现逻辑
      effect.run()
    }
  }

  const effect = new ReactiveEffect(getter, job)
  if (callback) {
    if (immediate) {
      // 立即执行一次
      job()
    } else {
      // 立即执行一次 进行依赖收集
      oldValue = effect.run()
    }
  } else {
    // watchEffect 的实现逻辑
    effect.run()
  }

  const unwatch = () => {
    effect.stop()
  }

  return unwatch
}
