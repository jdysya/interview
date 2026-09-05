---
title: "哈希表：两数之和"
date: 2026-09-05
---

# 哈希表：两数之和

> 复习优先级：P0 · 整理与来源核验：2026-09-05

## 题目与思路

给定整数数组与目标和，找两个不同下标。原题保证存在唯一答案；这里额外约定无解时返回空数组。先说 O(n²) 枚举，再用哈希表记录已扫描数字的下标，把寻找补数降为平均 O(1)。

**不变量：** 处理下标 i 前，表中只包含 i 之前的元素。因此先查再插入可以避免使用同一个元素两次。

## Java 解法

代码中的集合来自 `java.util.*`。补数使用 long 计算，避免整数边界输入发生溢出。

```java
static int[] twoSum(int[] nums, int target) {
    Map<Long, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        long need = (long) target - nums[i];
        Integer previous = seen.get(need);
        if (previous != null) return new int[] {previous, i};
        seen.put((long) nums[i], i);
    }
    return new int[0];
}
```

## 复杂度与边界

平均时间 O(n)，额外空间 O(n)。`[4,4]` 与目标 8 应返回不同下标；单元素不能匹配自己；负数正常处理。哈希表复杂度依赖实现与碰撞情况。

## 面试追问

- **数组有序怎么办？** 首尾双指针，和偏小右移左指针、偏大左移右指针，时间 O(n)、额外空间 O(1)。
- **返回所有不重复数对呢？** 需要定义按值还是按下标去重，以及重复数字的计数规则。
- **三数之和怎么做？** 排序后枚举一个数，其余两数用双指针，注意跳过重复值。

## 参考资料

- [LeetCode 1：Two Sum](https://leetcode.com/problems/two-sum/)
