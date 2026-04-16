/**
 *
 * @param renderOptions runtime-dom的那套dom能力
 * @returns 一个对象包含render
 */
export declare function createRenderer(renderOptions: any): {
    render: (vnode: any, container: any) => void;
};
/**
 * 对于解构
 * 换平台（Canvas、小程序），只要传不同的renderOptions即可，core代码不需要改
 */
//# sourceMappingURL=renderer.d.ts.map