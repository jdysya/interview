---
title: "二分：区间约定与 lower_bound"
date: 2026-09-05
---

# 二分：区间约定与 lower_bound

> 复习优先级：P0 · 整理与来源核验：2026-09-05

## 题目与思路

在升序数组中查找目标。先实现 lower_bound：返回第一个大于等于 target 的位置，再判断该位置是否等于 target。这种写法可以自然处理重复值。

## Java 解法

搜索区间采用左闭右开 `[left, right)`。循环内维护：left 左边都小于 target，right 及其右侧候选都大于等于 target。

```java
static int lowerBound(int[] nums, int target) {
    int left = 0, right = nums.length;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] < target) left = mid + 1;
        else right = mid;
    }
    return left;
}

static int binarySearch(int[] nums, int target) {
    int position = lowerBound(nums, target);
    return position < nums.length && nums[position] == target ? position : -1;
}
```

## 复杂度与边界

时间 O(log n)，额外空间 O(1)。测试空数组、单元素、目标在两端、完全不存在和重复值。返回 n 的 lower_bound 位置不能直接读取数组。

## 面试追问

- **查最后一个小于等于 target？** 可实现 upper_bound 后减一，处理结果为 -1。
- **为什么不能混用 left <= right？** 循环条件和区间定义要一致，否则容易死循环或漏元素。
- **如何二分答案？** 必须先证明可行性判定随答案具有单调性，例如给定速度能否在期限内完成工作。

## 参考资料

- [LeetCode 704：Binary search](https://leetcode.com/problems/binary-search/)
