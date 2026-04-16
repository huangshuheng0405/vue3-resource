export declare enum ShapeFlags {
    ELEMENT = 1,// 普通 HTML/SVG 元素
    FUNCTIONAL_COMPONENT = 2,// 函数式组件
    STATEFUL_COMPONENT = 4,// 普通有状态组件
    TEXT_CHILDREN = 8,// 子节点是纯文本
    ARRAY_CHILDREN = 16,// 子节点是数组
    SLOTS_CHILDREN = 32,// 子节点是插槽
    TELEPORT = 64,// Teleport 组件
    SUSPENSE = 128,// Suspense 组件
    COMPONENT_SHOULD_KEEP_ALIVE = 256,
    COMPONENT_KEPT_ALIVE = 512,
    COMPONENT = 6
}
//# sourceMappingURL=shapeFlags.d.ts.map