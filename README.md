# vue3-resource

Vue3源码采用`monorepo`架构

## @vue/reactivity

Vue3基石，基于ES6的`Proxy`实现，负责追踪数据变化并触发更新

- 核心API：`ref`、`reactive`、`computed`、`effect`、`watch`
- 作用将普通对象转换为响应式对象，并管理依赖收集（track）与触发更新（trigger）

## @vue/runtime-core

与平台无关的渲染器核心，只要把VNode渲染成真是节点，但不直到真是节点是什么（DOM、Canvas、小程序）

- 作用：实现虚拟DOM（VNode）的渲染器、组件系统（生命周期、Setup函数）、指令和插件机制
- 依赖：它依赖`reactivity`模块来观察数据变化

## @vue/runtime-dom

针对浏览器的渲染实现

- 作用：封装了对原生DOM的操作（如`appendChild`、`textContext`、属性更新等），并向用户暴露了`createApp`等API

## @vue/shared

内部使用的公共工具库（如类型判断、常量定义），不暴露给终端用户

## \_running

effect里自己该自己依赖的值

```js
const state = reactive({ count: 0 })

effect(() => {
  console.log('run', state.count)
  state.count++ // 在 effect 运行时又触发了 set -> trigger
})
```

- 第一次`run`读`state.count`，收集依赖
- 然后`state.count++`会走`set` -> `triggerEffect(dep)`
- `triggerEffect` 会尝试重新调度同一个effect
- 如果没有`\_running`保护：scheduler立即`run()`->又->`count++`->又触发->无限递归，堆栈爆掉
- 有`\_running`保护：当前effect正在run(`\_running=1`)，触发时检测就会跳过scheduler，避免递归死循环

## watch

1. 收集依赖：利用`traverse`函数强行读取对象的所有属性，触发`Proxy.get`->`track`，把创建的`ReactiveEffect`塞进每个属性的依赖列表
2. 触发更新：当修改属性时，触发`Proxy.set`->`trigger`，找到刚才的`ReactiveEffect`，发现它有`scheduler`（即`job`），就执行job
3. 执行回调：`job`里执行用户的`callback`
