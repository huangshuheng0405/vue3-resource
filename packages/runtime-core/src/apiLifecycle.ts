import {
  currentInstance,
  setCurrentInstance,
  unSetCurrentInstance
} from './components.js'

export const enum Lifecycle {
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u'
}

function createHook(type: Lifecycle) {
  // 将当前的实例存到了此钩子上
  return (hook: () => void, target = currentInstance) => {
    if (target) {
      // 当前钩子是在组件中运行的
      // 看当前钩子是否存放 发布订阅
      const hooks = target[type] || (target[type] = [])

      // 让currentInstance 存到这个函数内
      // 在执行函数内部保证实例是否正确
      const wrapHook = () => {
        setCurrentInstance(target)
        hook.call(target)
        unSetCurrentInstance()
      }

      hooks.push(wrapHook) // 这里有问题 setup执行完毕后 就会将instance清空
    }
  }
}

const onBeforeMount = createHook(Lifecycle.BEFORE_MOUNT)
const onMounted = createHook(Lifecycle.MOUNTED)
const onBeforeUpdate = createHook(Lifecycle.BEFORE_UPDATE)
const onUpdated = createHook(Lifecycle.UPDATED)
export { onBeforeMount, onMounted, onBeforeUpdate, onUpdated }

export function invokeArray(fns: any[]) {
  for (let i = 0; i < fns.length; i++) {
    fns[i]()
  }
}
