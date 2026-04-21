import { ShapeFlags } from '@myvue/shared'

export const Teleport = {
  __isTeleport: true,
  remove(vnode: any, unmountChildren: any) {
    const { shapeFlag, children } = vnode
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      unmountChildren(children)
    }
  },
  process(
    vnode1: any,
    vnode2: any,
    container: any,
    anchor: any,
    parentComponent: any,
    internals: any
  ) {
    let { mountChildren, patchChildren, move } = internals

    if (!vnode1) {
      // 首次渲染
      const target = (vnode2.target = document.querySelector(vnode2.props.to))
      if (target) {
        mountChildren(vnode2.children, target, anchor, parentComponent)
      }
    } else {
      // 更新渲染
      patchChildren(vnode1, vnode2, vnode2.target, anchor, parentComponent)

      if (vnode2.props.to !== vnode1.props.to) {
        const nextTarget = document.querySelector(vnode2.props.to)
        vnode2.children.forEach((child: any) => {
          move(child, nextTarget, anchor)
        })
      }
    }
  }
}

export const isTeleport = (value: any) => value.__isTeleport
