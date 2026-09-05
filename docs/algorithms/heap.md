---
title: "堆：第 K 大元素与 Top-K"
date: 2026-09-05
---

# 堆：第 K 大元素与 Top-K

> 复习优先级：P0 · 整理与来源核验：2026-09-05

## 题目与思路

返回数组排序后的第 K 大元素，重复值分别计数。维护最多 K 个元素的小根堆，堆中始终保存已处理部分最大的 K 个值，堆顶就是其中最小值。

## Java 解法

```java
static int kthLargest(int[] nums, int k) {
    if (k < 1 || k > nums.length) throw new IllegalArgumentException("invalid k");
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int number : nums) {
        heap.offer(number);
        if (heap.size() > k) heap.poll();
    }
    return heap.element();
}
```

## 复杂度与边界

时间 O(n log k)，额外空间 O(k)。k=1 求最大值，k=n 求最小值；负数和重复值均可处理。原题还要求思考无需整体排序的方案，这个堆解法满足该方向。

## 面试追问

- **Quickselect 更好吗？** 平均 O(n)，最坏可能 O(n²)，通常修改数组；堆更方便处理数据流。
- **海量日志 Top-K？** 先明确按出现次数还是按数值；若按频率，需要计数、分片聚合及误差/精确性约束。
- **比较器为什么不要写 a-b？** 整数相减可能溢出，使用 Integer.compare。
- **多个有序链表合并？** 每个链表头进入小根堆，弹出最小元素后放入其后继，时间 O(N log k)。

## 参考资料

- [LeetCode 215：Kth largest](https://leetcode.com/problems/kth-largest-element-in-an-array/)
