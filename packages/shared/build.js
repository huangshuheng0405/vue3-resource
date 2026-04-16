import esbuild from 'esbuild'

esbuild
  .context({
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ['es2020'],
    format: 'esm',
    outfile: 'dist/shared.mjs'
  })
  .then((context) => {
    console.log('successfully build by esbuild')

    // 持续监听文件变化 持续进行打包
    return context.watch()
  })
