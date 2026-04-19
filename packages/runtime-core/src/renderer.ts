import { ShapeFlags, hasOwn } from '@myvue/shared'
import { Fragment, isSameVnode, Text } from './createVnode.js'
import { getSequence } from './LIS.js'
import { reactive, ReactiveEffect } from '@myvue/reactivity'
import { queueJob } from './scheduler.js'
import { createComponentInstance, setupComponent } from './components.js'

/**
 * 把vnode渲染成真实dom
 * @param renderOptions runtime-dom提供的操作dom的函数
 * @returns 一个对象包含render
 */
export function createRenderer(renderOptions: any) {
  // 解构 统一命名
  // host表示平台层的实现 core只是调用它们
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp
  } = renderOptions

  /**
   * 挂载子节点数组
   * @param children 子节点数组
   * @param container 容器元素
   */
  const mountChildren = (children: any, container: any) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container)
    }
  }

  /**
   * 把一个元素VNode变成真实节点并插入
   * @param vnode 虚拟节点
   * @param container 容器元素
   * @param anchor 用于插入到某个兄弟节点前面
   */
  const mountElement = (vnode: any, container: any, anchor: any = null) => {
    const { type, children, props, shapeFlag } = vnode

    // 创建真实元素
    // 第一次渲染 让虚拟节点和真实的dom 创建关联 vnode.el = 真实dom
    // 第二次渲染新的vnode 可以和上一次的vnode做对比 之后更新对应的el元素 可以后续再复用这个dom元素
    let el = (vnode.el = hostCreateElement(type)) // el接受的值就是 一个真实dom元素

    // 处理属性
    if (props) {
      for (let key in props) {
        // 设置元素的 属性 事件 类名
        hostPatchProp(el, key, null, props[key])
      }
    }

    // 判断children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 数组
      mountChildren(children, el)
    }

    // 最后插入到容器
    hostInsert(el, container, anchor)
  }

  /**
   * 处理元素节点
   * @param vnode1 旧的虚拟节点
   * @param vnode2 新的虚拟节点
   * @param container 容器元素
   */
  const processElement = (
    vnode1: any,
    vnode2: any,
    container: any,
    anchor: any = null
  ) => {
    // vnode1 为 null 说明是挂载
    if (vnode1 === null) {
      // 初始化操作
      mountElement(vnode2, container, anchor)
    } else {
      // 更新元素节点
      patchElement(vnode1, vnode2, container)
    }
  }

  /**
   * 处理属性
   * @param oldProps 旧的属性
   * @param newProps 新的属性
   * @param el 元素
   */
  const patchProps = (oldProps: any, newProps: any, el: any) => {
    // 新的要全部生效
    for (let key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key])
    }

    // 处理以前的属性
    for (let key in oldProps) {
      if (!(key in newProps)) {
        // 以前多的现在没有了 要删掉以前的attr
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
  }

  /**
   * 移除子节点数组
   * @param children 子节点数组
   */
  const unmountChildren = (children: any) => {
    for (let i = 0; i < children.length; i++) {
      let child = children[i]
      // 移除节点
      unmount(child)
    }
  }

  /**
   * 新旧元素都是数组 diff算法
   * @param c1 旧的子节点数组
   * @param c2 新的子节点数组
   * @param el 元素
   */
  const patchKeyedChildren = (c1: any, c2: any, el: any) => {
    // 全量 diff 算法 两个数组的比对
    // 1. 减少比对范围 先从头开始比 再从尾开始比较  确定不一样的范围
    // 2. 从头比对 再从尾比对 如果有多余的或者新增的直接操作即可

    let i = 0 // 开始比对的索引
    let e1 = c1.length - 1 // 旧的子节点数组的结束索引
    let e2 = c2.length - 1 // 新的子节点数组的结束索引

    // 从头比对
    // (a b) c
    // (a b) d e
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]

      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el) // 更新当前节点的属性和儿子 递归比较字节点
      } else {
        break
      }
      i++
    }

    // 从尾对比
    // a (b c)
    // d e (b c)
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el) // 更新当前节点的属性和儿子 递归比较子节点
      } else {
        break
      }
      e1--
      e2--
    }

    // 处理增加 和 删除的特殊情况 [a,b,c] [a,b] 和 [c,a,b] [a,b]

    // a b
    // a b c => i=2 e1=1 e2=2 =>  u>e1 && i<=e2

    // a b
    // c a b => i = 0 e1=-1 e2=0 => i>e1 && i<=e2

    // 旧的遍历完了，新的还有剩余 说明需要挂载新节点
    if (i > e1) {
      // 新的多
      if (i <= e2) {
        // 有插入的部分
        // insert
        let nextPos = e2 + 1 // 看一下当前下一个元素是否存在
        let anchor = c2[nextPos]?.el

        while (i <= e2) {
          patch(null, c2[i], el, anchor)
          i++
        }
      }

      // a,b,c,d,e,f
      // a,b  =>  i = 2  e1 = 5  e2 = 1   i <= e1 都是要插入的
      // 新的遍历完，旧的还有剩余，说明需要卸载旧节点
    } else if (i > e2) {
      if (i <= e1) {
        // c,a,b
        // a,b   =>  i = 0  e1 = 1  e2 = -1  =>  i <= e1
        while (i <= e1) {
          unmount(c1[i])
          i++
        }
      }
    } else {
      // 以上确认不变化的节点 并且对插入和移除做了处理
      // 接下来就是特殊比对方式

      let s1 = i
      let s2 = i

      // a b c d
      // b a e c

      const keyToNewIndexMap = new Map() // 做一个映射表用于快速查找 看老的是否在新的里面还有  没有就删除 有的话就更新

      // 插入的过程中 可能新的元素多 需要创建
      let toBePatched = e2 - s2 + 1 // 要倒序插入的个数 加1是因为数组下标从0开始

      // 根据新的节点 找到老的对应位置
      let newIndexToOldMapIndex = new Array(toBePatched).fill(0)

      // 遍历新的节点 存储新的节点的key的索引关系
      for (let i = s2; i <= e2; i++) {
        const vnode = c2[i]
        keyToNewIndexMap.set(vnode.key, i)
      }

      for (let i = s1; i <= e1; i++) {
        const vnode = c1[i]
        const newIndex = keyToNewIndexMap.get(vnode.key) // 旧节点在新数组的索引

        if (newIndex == undefined) {
          // 如果新的里面找不到说明 老的有 新的没有 要删除
          unmount(vnode)
        } else {
          // 比较前后节点的差异 更新属性和儿子
          // i 可能是0的情况 为了保证0是没有比对过的元素 直接 i + 1
          newIndexToOldMapIndex[newIndex - s2] = i + 1
          patch(vnode, c2[newIndex], el) // 复用 直接更新即可
        }
      }

      // 最长递增子序列
      let increasingSeq = getSequence(newIndexToOldMapIndex)

      let j = increasingSeq.length - 1 // 索引
      // 调整顺序
      // 我们可以按照新的队列 倒叙插入insertBefore 通过参照物往前面插入

      // 倒序插入
      for (let i = toBePatched - 1; i >= 0; i--) {
        let newIndex = s2 + i // h 对应的索引 找下一个元素为参照物 来进行插入

        let anchor = c2[newIndex + 1]?.el
        let vnode = c2[newIndex]

        if (!vnode.el) {
          patch(null, vnode, el, anchor) // 创建插入
        } else {
          if (i == increasingSeq[j]) {
            j-- // 做了diff算法的优化
          } else {
            hostInsert(vnode.el, el, anchor) // 接着倒序插入
          }
        }
      }
    }
  }

  /**
   * 处理子节点
   * @param n1 旧的虚拟节点
   * @param n2 新的虚拟节点
   * @param el 容器元素
   */
  const patchChildren = (n1: any, n2: any, el: any) => {
    const c1 = n1.children
    const c2 = n2.children

    const prevShapeFlag = n1.shapeFlag
    const curShapeFlag = n2.shapeFlag

    // 1. 新的是文本 老的是数组 移除老的
    // 2. 新的是文本 老的也是文本 内容不相同替换
    // 3. 老的是数组 新的是数组 全量 diff 算法
    // 4. 老的是数组 新的不是数组 移除老的子节点
    // 5. 老的是文本 新的是空
    // 6. 老的是文本 新的是数组
    if (curShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 情况1
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1)
      }
      // 情况2
      if (c1 !== c2) {
        hostSetElementText(el, c2)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 情况3
        if (curShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 全量 diff 算法 两个数组的比对
          patchKeyedChildren(c1, c2, el)
        } else {
          // 情况4
          unmountChildren(c1)
        }
      } else {
        // 情况5
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, '')
        }

        // 情况6
        if (curShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el)
        }
      }
    }
  }

  /**
   * 更新元素节点
   * @param n1 旧的虚拟节点
   * @param n2 新的虚拟节点
   * @param container 容器元素
   */
  const patchElement = (n1: any, n2: any, container: any) => {
    // 比较元素差异 肯定要复用元素
    // 比较属性和元素的子节点
    let el = (n2.el = n1.el) // 对dom元素的复用

    let oldProps = n1.props || {}
    let newProps = n2.props || {}

    // hostPatchProp 只针对某一个属性来处理 class style event attr
    patchProps(oldProps, newProps, el)

    // 处理子节点
    patchChildren(n1, n2, el)
  }

  /**
   * 处理文本节点
   * @param vnode1 旧的虚拟节点
   * @param vnode2 新的虚拟节点
   * @param container 容器元素
   */
  const processText = (vnode1: any, vnode2: any, container: any) => {
    if (vnode1 == null) {
      // 虚拟节点要关联真实节点 将节点插入到页面当中
      hostInsert((vnode2.el = hostCreateText(vnode2.children)), container)
    } else {
      const el = (vnode2.el = vnode1.el)
      if (vnode1.children !== vnode2.children) {
        hostSetText(el, vnode2.children)
      }
    }
  }

  /**
   * 处理fragment节点
   * @param vnode1 旧的虚拟节点
   * @param vnode2 新的虚拟节点
   * @param container 容器元素
   */
  const processFragment = (vnode1: any, vnode2: any, container: any) => {
    if (vnode1 == null) {
      // fragment节点的挂载
      mountChildren(vnode2.children, container)
    } else {
      // fragment节点的更新
      patchChildren(vnode1, vnode2, container)
    }
  }

  function setupRenderEffect(instance: any, container: any, anchor: any) {
    const { render } = instance

    const componentUpdateFn = () => {
      // 我们要在这里面区分 是第一次 还是 后续更新
      if (!instance.isMounted) {
        const subTree = render.call(instance.proxy, instance.proxy)
        instance.subTree = subTree
        instance.isMounted = true
        patch(null, subTree, container, anchor)
      } else {
        // 基于状态的组件更新
        const subTree = render.call(instance.proxy, instance.proxy)
        patch(instance.subTree, subTree, container, anchor)
        instance.subTree = subTree
      }
    }

    let effect = new ReactiveEffect(componentUpdateFn, () => {
      queueJob(update)
    })

    // @ts-ignore
    const update = (instance.update = () => {
      effect.run()
    })
    update()
  }

  /**
   * 挂载组件
   * @param vnode2 组件的虚拟节点
   * @param container 容器元素
   * @param anchor 锚点元素
   */
  const mountComponent = (vnode2: any, container: any, anchor: any) => {
    // 1. 先创建组件实例
    const instance = (vnode2.component = createComponentInstance(vnode2))

    // 2. 给实例属性赋值
    setupComponent(instance)

    // 3. 创建一个effect
    setupRenderEffect(instance, container, anchor)
  }

  /**
   * 处理组件
   * @param vnode1 旧的虚拟节点
   * @param vnode2 新的虚拟节点
   * @param container 容器元素
   * @param anchor 锚点元素
   */
  const processComponent = (
    vnode1: any,
    vnode2: any,
    container: any,
    anchor: any
  ) => {
    if (vnode1 === null) {
      // 组件的挂载
      mountComponent(vnode2, container, anchor)
    } else {
      // 组建的关系
    }
  }

  // 渲染走这里 更新也走这里
  /**
   * 更新虚拟节点
   * @param vnode1 旧的虚拟节点
   * @param vnode2 新的虚拟节点
   * @param container 容器元素
   * @returns
   */
  const patch = (
    vnode1: any,
    vnode2: any,
    container: any,
    anchor: any = null
  ) => {
    if (vnode1 == vnode2) {
      // 再次渲染同一个元素直接跳过即可
      return
    }

    // 说明type/key 变了 不能复用
    if (vnode1 && !isSameVnode(vnode1, vnode2)) {
      unmount(vnode1) // 直接删除旧的真实节点
      vnode1 = null // 当作首次挂载处理
    }

    // 增加了 处理 文本 fragment 组件 的情况
    const { type, shapeFlag } = vnode2
    switch (type) {
      case Text:
        processText(vnode1, vnode2, container)
        break
      case Fragment:
        processFragment(vnode1, vnode2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode1, vnode2, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          // 对组件的处理 vue3中函数式组件以及废弃了
          processComponent(vnode1, vnode2, container, anchor)
        }
        break
    }
  }

  /**
   * 移除虚拟节点
   * @param vnode 虚拟节点
   */
  const unmount = (vnode: any) => {
    if (vnode.type === Fragment) {
      unmountChildren(vnode.children)
    } else {
      hostRemove(vnode.el)
    }
  }

  // 多次调用render会进行虚拟节点的比较 再进行更新
  /**
   * 渲染虚拟节点
   * @param vnode 虚拟节点
   * @param container 容器元素
   */
  const render = (vnode: any, container: any) => {
    if (vnode === null) {
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      // 将虚拟节点变成真实节点进行渲染
      patch(container._vnode || null, vnode, container)

      // 第二次渲染就会拿到旧的vnode  以后会做diff更新
      container._vnode = vnode
    }
  }

  return {
    render
  }
}

/**
 * 对于解构
 * 换平台（Canvas、小程序），只要传不同的renderOptions即可，core代码不需要改
 */
