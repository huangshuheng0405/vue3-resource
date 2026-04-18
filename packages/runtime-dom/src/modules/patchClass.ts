/**
 * 处理类名
 * @param el 元素
 * @param nextValue 新的类名
 */
export function patchClass(el: any, nextValue: any) {
  if (nextValue == null) {
    el.removeAttribute('class')
  } else {
    el.className = nextValue
  }
}
