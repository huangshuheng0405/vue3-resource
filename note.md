$ pnpm i @vue/shared --workspace --filter @vue/reactivity

## add package

```bash
pnpm add @myvue/reactivity@workspace:* --filter @myvue/runtime-dom
```

它的意思拆开看：

- `pnpm add ...`：给某个包安装/添加依赖（会写进它的 `package.json` 的 `dependencies` 里）。
- `@myvue/reactivity@workspace:*`：
  - `@myvue/reactivity` 这个依赖不是去 npm 下载
  - 而是用 `workspace:*` 指定“从当前 monorepo/workspace 里找同名包并链接（软链）”
- `--filter @myvue/runtime-dom`：
  - 指定“这次 add 作用于哪个 workspace 子包”
  - 也就是给 `packages/runtime-dom/package.json` 加依赖，而不是给根目录加
