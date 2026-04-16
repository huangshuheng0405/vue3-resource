import minimist from 'minimist'
import { createRequire } from 'module'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import esbuild from 'esbuild'

// "dev": "node scripts/dev.js runtime-dom -f esm"

// 拿到 runtime-dom -f esm
const args = minimist(process.argv.slice(2))

const target = args._[0] // 打包哪个项目
const format = args.f || 'iife' // 打包后的模块化规范

const __filename = fileURLToPath(import.meta.url) // 获取当前文件的绝对路径
const __dirname = dirname(__filename) // 获取当前文件所在目录
const require = createRequire(import.meta.url) // 相当于 commonjs 的 require
const pkg = require(`../packages/${target}/package.json`)

const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)

esbuild
  .context({
    entryPoints: [entry], // 入口
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`), //  出口
    bundle: true, // reactivity shared 会打包到一起
    sourcemap: true, // 调试代码
    format: format, // cjs esm iife
    globalName: pkg.buildOptions?.name // 全局变量名
  })
  .then((context) => {
    console.log('start dev by esbuild')

    return context.watch() // 监听文件变化 持续进行打包
  })
