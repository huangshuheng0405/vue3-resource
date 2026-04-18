function getSequence(arr) {
  const result = [0] // 存的是 当前LIS序列元素在元素组的下标
  const len = arr.length

  const p = result.slice(0) // 存的是 前驱下标  用来回溯整条序列

  let start, end

  debugger
  for (let i = 0; i < len; i++) {
    const currentValue = arr[i]

    if (currentValue !== 0) {
      // 下标为0的元素 表示 旧列表不存在
      let resultLastIndex = result[result.length - 1]

      if (arr[resultLastIndex] < currentValue) {
        // 如果比当前最长序列的结尾还大 直接追加
        p[i] = result[result.length - 1] // 正常放入的时候 存前一个节点索引
        result.push(i) // 直接将当前索引放入结果集
        continue
      }
    }

    start = 0
    end = result.length - 1

    // 二分查找一个 大于等于 currentValue 的节点
    while (start < end) {
      const middle = Math.floor((start + end) / 2)
      if (arr[result[middle]] < currentValue) {
        start = middle + 1
      } else {
        end = middle
      }
    }

    // 因为结尾更小 更容易让整条序列变长
    if (currentValue < arr[result[start]]) {
      p[i] = result[start - 1] // 记录前驱节点的索引
      result[start] = i // 替换
    }
  }

  // p 为前驱节点的列表 需要根据最后一个节点做追溯
  let l = result.length
  let last = result[l - 1] // 取出最后一项

  // 回溯：把result从结尾表还原成整条LIS下标序列
  while (l-- > 0) {
    result[l] = last
    last = p[last] // 在数组中找到最后一个
  }
  //  需要创建一个 前驱节点  进行倒序追溯
  return result
}
