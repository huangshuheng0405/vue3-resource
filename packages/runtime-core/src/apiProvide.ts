import { currentInstance } from './components.js'

export function provide(key: any, value: any) {
  if (!currentInstance) return

  const parentProvide = currentInstance.parent?.provides
  let provides = currentInstance.provides
  if (parentProvide === provides) {
    // 如果在子组件上新增了 provides 需要拷贝一份全新的
    provides = currentInstance.provides = Object.create(provides)
  }

  provides[key] = value
}

export function inject(key: any, defaultValue?: any) {
  if (!currentInstance) return

  const provides = currentInstance.parent?.provides

  if (provides && key in provides) {
    return provides[key] // 从provides取出来使用
  } else {
    return defaultValue // 默认的inject
  }
}
