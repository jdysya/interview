---
title: 双指针与滑窗：三数之和、盛水、接雨水、最小覆盖
date: 2026-09-05
---

# 双指针与滑窗：四道题的不同不变量

> 复习优先级：P0 · 整理与来源核验：2026-09-05

本页新增 4 道题，代码由 `check:extended` 从正文提取验证。约定数组和字符串非 null；高度非负；minWindow 接受 ASCII，不能直接当作 Unicode code point 算法。面积与积水使用 long，提交题目平台时需按平台签名适配。

## 识别题型与正确性

| 题目 | 核心不变量 | 为什么能移动指针 | 复杂度 |
| --- | --- | --- | --- |
| 三数之和 | 排序后固定 i，搜索剩余区间 | 和小则增大左端，和大则减小右端 | O(n²)，复制数组 O(n) |
| 盛最多水的容器 | 宽度缩小，要寻找更高短板 | 固定短板而移动长板不会更优 | O(n)，额外 O(1) |
| 接雨水 | 处理较低一侧，其外侧存在足够挡板 | 已知该侧最大高度可确定贡献 | O(n)，额外 O(1) |
| 最小覆盖子串 | missing 是尚未覆盖的字符总数 | 覆盖完整后收缩，直到失效 | O(n+m)，ASCII 计数 O(1) |

## Java 实现

```java
static List<List<Integer>> threeSum(int[] input) {
    int[] a = input.clone(); Arrays.sort(a);
    List<List<Integer>> out = new ArrayList<>();
    for (int i = 0; i + 2 < a.length; i++) {
        if (i > 0 && a[i] == a[i - 1]) continue;
        int l = i + 1, r = a.length - 1;
        while (l < r) {
            long sum = (long) a[i] + a[l] + a[r];
            if (sum < 0) l++;
            else if (sum > 0) r--;
            else {
                out.add(List.of(a[i], a[l], a[r]));
                int lv = a[l], rv = a[r];
                while (l < r && a[l] == lv) l++;
                while (l < r && a[r] == rv) r--;
            }
        }
    }
    return out;
}
static long maxArea(int[] h) {
    int l = 0, r = h.length - 1; long best = 0;
    while (l < r) {
        best = Math.max(best, (long) Math.min(h[l], h[r]) * (r - l));
        if (h[l] <= h[r]) l++; else r--;
    }
    return best;
}
static long trap(int[] h) {
    int l = 0, r = h.length - 1, lm = 0, rm = 0; long water = 0;
    while (l <= r) {
        if (h[l] <= h[r]) {
            lm = Math.max(lm, h[l]); water += lm - h[l++];
        } else {
            rm = Math.max(rm, h[r]); water += rm - h[r--];
        }
    }
    return water;
}
static String minWindow(String s, String t) {
    for (int i = 0; i < s.length(); i++) if (s.charAt(i) >= 128) throw new IllegalArgumentException("ASCII only");
    for (int i = 0; i < t.length(); i++) if (t.charAt(i) >= 128) throw new IllegalArgumentException("ASCII only");
    if (t.isEmpty()) return "";
    int[] need = new int[128];
    for (int i = 0; i < t.length(); i++) need[t.charAt(i)]++;
    int missing = t.length(), left = 0, start = 0, best = Integer.MAX_VALUE;
    for (int right = 0; right < s.length(); right++) {
        if (need[s.charAt(right)]-- > 0) missing--;
        while (missing == 0) {
            if (right - left + 1 < best) { start = left; best = right - left + 1; }
            if (++need[s.charAt(left++)] > 0) missing++;
        }
    }
    return best == Integer.MAX_VALUE ? "" : s.substring(start, start + best);
}
```

## 手动推演

对于 `s=AAABBC, t=ABC`，读取到 C 才满足覆盖。左边三个 A 中前两个可以移除，第三个不能丢；候选得到 `ABBC`。需要两个 A 的目标与只需一个 A 的目标不同，所以必须统计数量，不能只用 Set 判断出现过。

三数之和对 `[-1,-1,0,1,2]` 固定第一个 -1，先命中 `[-1,-1,2]`，再命中 `[-1,0,1]`。下一个相同固定值要跳过，否则重复输出。

## 失败场景与边界

空数组、长度不足三、全零、重复数字、极值溢出、单调高度、目标重复字符、无解和空目标都要测试。接雨水中空数组的 l=0、r=-1 使循环不进入；不要在循环外先读 h[0]。

## 变式与追问

三数之和改成最接近目标值怎么办？盛水和接雨水为什么不是同一个题？滑窗遇到含负数的区间求和还能这样收缩吗？最小覆盖改成 Unicode 应如何同时维护 code point 索引和 UTF-16 子串位置？

## 参考资料

- [LeetCode 15：3Sum](https://leetcode.com/problems/3sum/)
- [LeetCode 11：Container With Most Water](https://leetcode.com/problems/container-with-most-water/)
- [LeetCode 42：Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/)
- [LeetCode 76：Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/)
