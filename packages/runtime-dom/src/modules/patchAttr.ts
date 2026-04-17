/**
 * 处理属性
 * @param el 元素
 * @param key 属性名
 * @param value 属性值
 */
export function patchAttr(el: any, key: any, value: any) {
  if (value == null) {
    el.removeAttribute(key)
  } else {
    el.setAttribute(key, value)
  }
}
