export function patchStyle(el, prevValue, nextValue) {
    let style = el.style;
    // 新样式要全部生效
    for (let key in nextValue) {
        style[key] = nextValue[key];
    }
    if (prevValue) {
        for (let key in prevValue) {
            // 看以前的属性 现在有没有 如果没有就要删掉
            if (nextValue[key] == null) {
                style[key] = null;
            }
        }
    }
}
//# sourceMappingURL=patchStyle.js.map