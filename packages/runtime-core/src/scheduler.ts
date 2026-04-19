// @ts-nocheck
const queue = [] // 缓存当前要执行的队列

let isFlushing = false
const resolvePromsie = Promise.resolve()

// 如果同时在一个组件中更新多个状态 job肯定是同一个
// 同时开启一个异步任务
export function queueJob(job: any) {
  // 去重 同一个update只放一次
  if (!queue.includes(job)) {
    queue.push(job) // 让任务入队列
  }

  if (!isFlushing) {
    isFlushing = true

    // 微任务统一执行
    resolvePromsie.then(() => {
      isFlushing = false

      const copy = queue.slice(0) // 先拷贝再执行
      queue.length = 0

      copy.forEach((job) => job())
      copy.length = 0
    })
  }
}
