import esbuild from 'esbuild'
import { resolve } from 'path'

const rootDir = resolve(process.cwd())

const packages = [
  {
    name: '@myvue/shared',
    entry: resolve(rootDir, 'packages/shared/src/index.ts'),
    outfile: resolve(rootDir, 'packages/shared/dist/shared.js')
  },
  {
    name: '@myvue/reactivity',
    entry: resolve(rootDir, 'packages/reactivity/src/index.ts'),
    outfile: resolve(rootDir, 'packages/reactivity/dist/reactivity.js')
  },
  {
    name: '@myvue/runtime-core',
    entry: resolve(rootDir, 'packages/runtime-core/src/index.ts'),
    outfile: resolve(rootDir, 'packages/runtime-core/dist/runtime-core.js')
  },
  {
    name: '@myvue/runtime-dom',
    entry: resolve(rootDir, 'packages/runtime-dom/src/index.ts'),
    outfile: resolve(rootDir, 'packages/runtime-dom/dist/runtime-dom.js')
  }
]

async function start() {
  for (const pkg of packages) {
    const ctx = await esbuild.context({
      entryPoints: [pkg.entry],
      bundle: true,
      minify: false,
      sourcemap: true,
      target: ['es2020'],
      format: 'esm',
      outfile: pkg.outfile
    })
    await ctx.watch()
    console.log(`watching ${pkg.name}`)
  }
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
