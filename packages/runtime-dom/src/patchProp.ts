// 主要是对节点元素的属性操作class style event

import { patchAttr } from './modules/patchAttr.js'
import { patchClass } from './modules/patchClass.js'
import { patchEvent } from './modules/patchEvent.js'
import { patchStyle } from './modules/patchStyle.js'

// diff
/**
 * 对属性进行diff操作
 * @param el 元素节点
 * @param key 属性名
 * @param prevValue 以前的属性值
 * @param nextValue 新的属性值
 * @returns
 */
export default function patchProp(
  el: any,
  key: string,
  prevValue: any,
  nextValue: any
) {
  if (key === 'class') {
    // 给元素绑定class属性
    return patchClass(el, nextValue)
  } else if (key === 'style') {
    // 给元素绑定style属性
    // {color:red}  {backgroundColor:red}
    return patchStyle(el, prevValue, nextValue)
  } else if (/^on[^a-z]/.test(key)) {
    // 给元素绑定事件属性
    // el.addEventListener(key, nextValue)
    return patchEvent(el, key, nextValue)
  } else {
    // 给元素绑定其他属性
    return patchAttr(el, key, nextValue)
  }
}
