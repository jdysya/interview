---
title: 前缀和、单调栈与区间：计数、等待和合并
date: 2026-09-05
---

# 前缀和、单调栈与区间：三道题的状态选择

> 复习优先级：P0 · 整理与来源核验：2026-09-05

新增 3 道题。默认输入非 null，区间每项恰有两个端点且起点不大于终点。和与计数使用 long，防止大量零或大数累加溢出。

## 为什么选择这些状态？

和为 K 的子数组：`prefix[j]-prefix[i]=k`，处理当前位置时查询此前 `prefix-k` 出现次数。初始前缀 0 出现一次，才能统计从下标 0 开始的子数组。先查询再插入当前前缀，避免把长度为 0 的区间算进去。

每日温度：栈保存“还没找到更高温度”的下标，温度单调不增。当前温度严格更高才弹出；相同温度不能作为更暖的一天。每个下标最多入栈出栈一次。

合并区间：按起点排序，维护最后一个已合并区间。新区间与末尾重叠时扩展右端，否则开启新段。本页把端点相接也视为可合并，与后面删除重叠区间的边界约定不同。

## Java 实现

```java
static long subarraySum(int[] a, long k) {
    Map<Long, Long> freq = new HashMap<>(); freq.put(0L, 1L);
    long prefix = 0, count = 0;
    for (int x : a) {
        prefix += x;
        count += freq.getOrDefault(prefix - k, 0L);
        freq.merge(prefix, 1L, Long::sum);
    }
    return count;
}
static int[] dailyTemperatures(int[] t) {
    int[] answer = new int[t.length]; Deque<Integer> stack = new ArrayDeque<>();
    for (int i = 0; i < t.length; i++) {
        while (!stack.isEmpty() && t[i] > t[stack.peek()]) {
            int j = stack.pop(); answer[j] = i - j;
        }
        stack.push(i);
    }
    return answer;
}
static int[][] mergeIntervals(int[][] intervals) {
    int[][] a = Arrays.stream(intervals).map(int[]::clone).toArray(int[][]::new);
    Arrays.sort(a, Comparator.comparingInt(x -> x[0]));
    List<int[]> out = new ArrayList<>();
    for (int[] cur : a) {
        if (out.isEmpty() || cur[0] > out.get(out.size() - 1)[1]) out.add(cur);
        else out.get(out.size() - 1)[1] = Math.max(out.get(out.size() - 1)[1], cur[1]);
    }
    return out.toArray(int[][]::new);
}
```

## 前缀和推演：数组 [1,-1,1]，k=1

| 已处理元素 | 当前 prefix | 查询 prefix-k | 新增答案 |
| --- | --- | --- | --- |
| 1 | 1 | 0，此前出现 1 次 | 1 |
| -1 | 0 | -1，此前 0 次 | 0 |
| 1 | 1 | 0，此前出现 2 次 | 2 |

总数为 3。负数破坏简单“和大则收缩”的单调性，所以本题不要套用正数滑窗模板。

## 复杂度与边界

前缀和时间期望 O(n)、空间 O(n)；单调栈时间 O(n)、空间 O(n)；合并区间排序 O(n log n)、复制和输出 O(n)。测试全零计数、正负交替、相同温度、严格下降、空区间、包含区间、端点相接和输入不应被修改的契约。

## 变式与追问

子数组和改成“能被 K 整除”怎样处理余数和负数？找下一个更大元素与更小元素如何改变栈？只需输出合并后总长度时怎样处理闭区间和半开区间？比较器为什么不能直接 `a[0]-b[0]`？

## 参考资料

- [LeetCode 560：Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/)
- [LeetCode 739：Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)
- [LeetCode 56：Merge Intervals](https://leetcode.com/problems/merge-intervals/)
