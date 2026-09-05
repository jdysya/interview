---
title: "滑动窗口：最长无重复子串"
date: 2026-09-05
---

# 滑动窗口：最长无重复子串

> 复习优先级：P0 · 整理与来源核验：2026-09-05

## 题目与思路

寻找连续且字符不重复的最长片段。用左右边界表示窗口，哈希表记录字符最近出现的位置。遇到重复字符时，左边界只能向右移动，不能回退。

## Java 解法

本解法以 Unicode code point 为单位，支持表情等补充字符；这仍不等于用户视觉中的组合字素。

```java
static int longestUnique(String s) {
    int[] chars = s.codePoints().toArray();
    Map<Integer, Integer> last = new HashMap<>();
    int left = 0, answer = 0;
    for (int right = 0; right < chars.length; right++) {
        Integer position = last.put(chars[right], right);
        if (position != null) left = Math.max(left, position + 1);
        answer = Math.max(answer, right - left + 1);
    }
    return answer;
}
```

## 复杂度与边界

平均时间 O(n)，代码由于 code point 数组与哈希表使用 O(n) 额外空间。空串返回 0；`abba` 返回 2，能检验左边界是否错误回退；`🙂a🙂` 返回 2。

## 面试追问

- **子串和子序列一样吗？** 子串连续，子序列不要求连续。
- **最多 K 种字符？** 维护频次，种类过多时收缩窗口，计数变为 0 时删除键。
- **窗口方法适用于任意数组和约束吗？** 不适用；例如包含负数的和约束未必具有可单调收缩的性质。

## 参考资料

- [LeetCode 3：Longest substring](https://leetcode.com/problems/longest-substring-without-repeating-characters/)
