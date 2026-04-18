/**
 * 处理样式
 * @param el 元素
 * @param prevValue 以前的样式
 * @param nextValue 新的样式
 */
export function patchStyle(el: any, prevValue: any, nextValue: any) {
  let style = el.style

  // 新样式要全部生效
  for (let key in nextValue) {
    style[key] = nextValue[key]
  }

  if (prevValue) {
    for (let key in prevValue) {
      // 看以前的属性 现在有没有 如果没有就要删掉
      if (nextValue) {
        if (nextValue[key] == null) {
          style[key] = null
        }
      }
    }
  }
}
