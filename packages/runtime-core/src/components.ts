import { proxyRefs, reactive } from '@myvue/reactivity'
import { hasOwn, isFunction, ShapeFlags } from '@myvue/shared'

/**
 * 创建组件实例
 * @param vnode 组件的虚拟节点
 * @returns 组件实例
 */
export function createComponentInstance(vnode: any) {
  const instance = {
    data: null, // 状态
    vnode: vnode, // 组件的虚拟节点
    subTree: null, // 子树
    isMounted: false, // 是否挂载完成
    update: null, // 组件的更新函数
    props: {},
    attrs: {},
    slots: {}, // 组件的插槽
    propsOptions: vnode.type.props, // 用户声明的哪些属性是组件属性
    component: null,
    proxy: null, // 用来代理 props  attrs data 让用户更方便使用
    setupState: null
  }

  return instance
}

/**
 * 初始化属性
 * @param instance 组件实例
 * @param rawProps 虚拟节点的属性
 */
const initProps = (instance: any, rawProps: any) => {
  const props = {}
  const attrs = {}

  const propsOptions = instance.propsOptions || {}
  if (rawProps) {
    for (let key in rawProps) {
      // 用所有的来分裂
      const value = rawProps[key]

      if (key in propsOptions) {
        // ket 在instance.propOptions （组件声明的props）
        // @ts-ignore
        props[key] = value // props 不需要深度响应式 最好用shallowReactive（这里还没实现）
      } else {
        // @ts-ignore
        attrs[key] = value
      }
    }
  }
  instance.props = reactive(props)
  instance.attrs = attrs
}

export function initSlots(instance: any, children: any) {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    instance.slots = children
  } else {
    instance.slots = {}
  }
}

export function setupComponent(instance: any) {
  const { vnode } = instance
  // 属性赋值
  initProps(instance, vnode.props)
  // 插槽赋值
  initSlots(instance, vnode.children)
  // 赋值代理对象
  instance.proxy = new Proxy(instance, handler)

  const { data = () => {}, render, setup } = vnode.type
  if (setup) {
    const setupContext = {}
    const setupResult = setup(instance.props, setupContext)

    if (isFunction(setupResult)) {
      instance.render = setupResult
    } else {
      instance.setupState = proxyRefs(setupResult) // 将返回的值脱ref
    }
  }

  if (!isFunction(data)) {
    return console.warn('data option must be a function')
  } else {
    // data 必须是函数
    instance.data = reactive(data.call(instance.proxy))
  }

  if (!instance.render) {
    // 没有render用自己的render
    instance.render = render // render赋值
  }
}

// 通过映射关系 来获取到不同的属性
const publicPropety: any = {
  $attrs: (instance: any) => instance.attrs,
  $slots: (instance: any) => instance.slots
}

const handler = {
  get(target: any, key: any) {
    // data 和 props 属性中的名字不要重名
    const { data, props, setupState } = target

    if (data && hasOwn(data, key)) {
      return data[key]
    } else if (props && hasOwn(props, key)) {
      return props[key]
    } else if (setupState && hasOwn(setupState, key)) {
      return setupState[key]
    }

    // 对于一些无法修改的属性 $slots $attrs ....  $attrs -> instance.attrs
    const getter: any = publicPropety[key] // 通过不同的策略拿到不同的方法
    if (getter) {
      return getter(target)
    }
    return target[key]
  },
  set(target: any, key: any, newValue: any, receiver: any) {
    const { data, props, setupState } = target

    if (data && hasOwn(data, key)) {
      data[key] = newValue
    } else if (props && hasOwn(props, key)) {
      // props[key] = newValue
      // 用户可以修改属性的嵌套属性 内部不会报错 但是不合法
      console.warn('props are readonly')
      return false
    } else if (setupState && hasOwn(setupState, key)) {
      setupState[key] = newValue
      // return false
    }

    return true
  }
}
