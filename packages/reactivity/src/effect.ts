import { DirtyLevel } from './constants.js'

export function effect(fn, options?) {
  // 创建一个响应式 effect 数据变化了后可以重新执行
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run()
  })
  // 先执行一次 为了 收集依赖
  _effect.run()

  if (options) {
    Object.assign(_effect, options) // 用户传递的覆盖掉内置的
  }
  // 返回一个runner函数 外部可以手动调用 runner 让effect 再跑一次
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

// 当前正在收集依赖的 effect
// 全局单例 当某个effect在run中执行 把它赋值给 activeEffect
export let activeEffect

function preCleanEffect(effect) {
  effect._depsLength = 0
  effect._trackId++ // 如果同一个effect执行 id就是相同的
}

function postCleanEffect(effect) {
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect) // 删除映射表中对应的effect
    }
    effect.deps.length = effect._depsLength // 更新列表长度
  }
}

export class ReactiveEffect {
  _trackId = 0 // 用于记录当前effect执行了几次
  deps = [] // 双向记录的dep列表 （effect依赖了哪些dep）
  _depsLength = 0 // 本次run实际用到的dep数量 用于清理多余dep
  _running = 0 // 正在运行次数 防止自己又触发自己导致递归死循环
  _dirtyLevel = DirtyLevel.Dirty // 脏标记
  public active = true // 创建的 effect 是响应式的

  /**
   * effect 类
   * @param fn 用户编写的函数
   * @param scheduler 如果fn中依赖的数据发生变化后 需要重新调用 -> run()
   */
  constructor(
    public fn,
    public scheduler
  ) {
    this.fn = fn
    this.scheduler = scheduler
  }

  public get dirty() {
    return this._dirtyLevel === DirtyLevel.Dirty
  }

  public set dirty(value) {
    this._dirtyLevel = value ? DirtyLevel.Dirty : DirtyLevel.NoDirty
  }

  run() {
    this._dirtyLevel = DirtyLevel.NoDirty // 每次运行后此值就不脏了
    if (!this.active) {
      return this.fn() // 不是激活的 执行后 什么都不用做
    }
    // 解决嵌套 effect
    let lastEffect = activeEffect // 记录上一个effectEffect
    try {
      activeEffect = this
      // effect重新执行前 需要将上一次的依赖清除  effect.deps
      preCleanEffect(this)
      this._running++
      return this.fn() // 依赖收集
    } finally {
      this._running--
      postCleanEffect(this)
      activeEffect = lastEffect
    }
  }

  /***
   * 停止effect的执行
   */
  stop() {
    if (this.active) {
      this.active = false
      preCleanEffect(this)
      postCleanEffect(this)
    }
  }
}

/**
 * 把effect从某个dep移除
 * @param dep 依赖的dep
 * @param effect 依赖的effect
 */
function cleanDepEffect(dep, effect) {
  dep.delete(effect)
  if (dep.size === 0) {
    dep.cleanup() // 如果map为空 则调用清理函数
  }
}

// 双向记忆
export function trackEffect(effect: ReactiveEffect, dep) {
  // 需要重新的去收集依赖 将不需要的移除掉
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId) // 更新id
  }
  let oldDep = effect.deps[effect._depsLength]
  // 如果没有存过
  if (oldDep !== dep) {
    if (oldDep) {
      // 删掉旧值
      cleanDepEffect(oldDep, effect)
    }
    // 换成新的依赖
    effect.deps[effect._depsLength++] = dep
  } else {
    effect._depsLength++ // 重复的依赖 不需要重复添加
  }
}

/**
 * 触发key相关联的所有effect集合 执行里面的回调函数
 * @param dep 对象里的key对应的所有effect集合
 */
export const triggerEffect = (dep) => {
  for (const effect of dep.keys()) {
    // 依赖变了 这个effect的结果就不可信 下次要更新
    if (effect._dirtyLevel < DirtyLevel.Dirty) {
      effect._dirtyLevel = DirtyLevel.Dirty
    }
    // scheduler会调用effect.run() 重新执行effect
    if (effect.scheduler) {
      if (!effect._running) {
        effect.scheduler() // 相当于 effect.run()
      }
    }
  }
}
