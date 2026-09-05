---
title: DP 与贪心：LIS、LCS、打家劫舍、背包与区间选择
date: 2026-09-05
---

# DP 与贪心：七道题的状态、转移与证明

> 复习优先级：P0 · 整理与来源核验：2026-09-05

新增 7 道题。默认输入非 null，rob 金额、canJump 步数非负，区间起点严格小于终点。LCS 以 Java char 为单位；背包重量为正整数且 weight/value 长度一致。金额、价值与最大子数组和使用 long。

## 状态与转移

| 题目 | 状态或贪心选择 | 核心理由 |
| --- | --- | --- |
| LIS | tails[len-1] 是长度 len 的最小结尾 | 较小结尾给后续更多扩展可能；它不是最终子序列 |
| LCS | dp[i][j]：两个前缀的最长公共子序列 | 末字符相同则对角+1，否则舍弃一端 |
| 打家劫舍 | 当前最优=max(不选当前，选当前+隔一个最优) | 相邻不能同时选 |
| 0/1 背包 | dp[c]：容量至多 c 的最高价值 | 倒序容量使每个物品最多用一次 |
| 跳跃游戏 | 已能到达范围的最右边界 | 只在可达位置继续扩展 |
| 删除重叠区间 | 优先保留最早结束区间 | 给剩余区间保留最多空间，可做交换论证 |
| 最大子数组和 | 以当前元素结尾的最优和 | 要么延续上段，要么从当前重启 |

## Java 实现

```java
static int lengthOfLIS(int[] a) {
    int[] tails = new int[a.length]; int size = 0;
    for (int x : a) {
        int l = 0, r = size;
        while (l < r) { int m = l + (r-l)/2; if (tails[m] < x) l = m + 1; else r = m; }
        tails[l] = x; if (l == size) size++;
    }
    return size;
}
static int lengthOfLCS(String a, String b) {
    int[] dp = new int[b.length() + 1];
    for (int i = 1; i <= a.length(); i++) {
        int diagonal = 0;
        for (int j = 1; j <= b.length(); j++) {
            int old = dp[j];
            dp[j] = a.charAt(i-1) == b.charAt(j-1) ? diagonal + 1 : Math.max(dp[j], dp[j-1]);
            diagonal = old;
        }
    }
    return dp[b.length()];
}
static long rob(int[] a) {
    long prev2 = 0, prev1 = 0;
    for (int x : a) { long cur = Math.max(prev1, prev2 + x); prev2 = prev1; prev1 = cur; }
    return prev1;
}
static long knapsack01(int[] weight, int[] value, int capacity) {
    if (weight.length != value.length || capacity < 0) throw new IllegalArgumentException("invalid shape/capacity");
    long[] dp = new long[capacity + 1];
    for (int i = 0; i < weight.length; i++) {
        if (weight[i] <= 0) throw new IllegalArgumentException("positive weight required");
        for (int c = capacity; c >= weight[i]; c--) dp[c] = Math.max(dp[c], dp[c-weight[i]] + value[i]);
    }
    return dp[capacity];
}
static boolean canJump(int[] a) {
    if (a.length == 0) return false;
    long reach = 0;
    for (int i = 0; i < a.length && i <= reach; i++) {
        reach = Math.max(reach, (long) i + a[i]);
        if (reach >= a.length - 1) return true;
    }
    return false;
}
static int eraseOverlapIntervals(int[][] intervals) {
    if (intervals.length == 0) return 0;
    int[][] a = Arrays.stream(intervals).map(int[]::clone).toArray(int[][]::new);
    Arrays.sort(a, Comparator.comparingInt(x -> x[1]));
    int kept = 1, end = a[0][1];
    for (int i = 1; i < a.length; i++) if (a[i][0] >= end) { kept++; end = a[i][1]; }
    return a.length - kept;
}
static long maxSubArray(int[] a) {
    if (a.length == 0) return 0; // 本站为空数组定义返回 0；原题通常要求非空。
    long ending = a[0], best = a[0];
    for (int i = 1; i < a.length; i++) { ending = Math.max(a[i], ending + a[i]); best = Math.max(best, ending); }
    return best;
}
```

## 一个关键反例：背包不能正序遍历容量

只有一个重量 2、价值 3 的物品，容量 4。0/1 背包答案应为 3。若正序更新，先令 dp[2]=3，再使用本轮 dp[2] 令 dp[4]=6，相当于重复使用同一物品。倒序遍历保留上一轮状态，避免这一错误。

## 复杂度与边界

LIS 时间 O(n log n)、空间 O(n)；LCS 时间 O(nm)、空间 O(m)；rob、canJump、maxSubArray 时间 O(n)、额外 O(1)；0/1 背包时间 O(nC)、空间 O(C)，容量巨大时不适用；区间选择排序 O(n log n)、复制 O(n)。

测试全相等 LIS、空 LCS、全负最大子数组、单元素跳跃、前方出现不可跨越的零、区间端点相接、背包容量零。本页区间端点相接不视为重叠；不要与合并区间页的规则混淆。

## 变式与追问

LIS 改非递减时二分比较如何改变？LCS 改公共子串时状态能否保留？环形打家劫舍怎样拆两段？背包要求恰好装满时初始化为什么不同？想恢复最优选择而不只返回数值，需要保存什么？

## 参考资料

- [LeetCode 300：LIS](https://leetcode.com/problems/longest-increasing-subsequence/)
- [LeetCode 1143：LCS](https://leetcode.com/problems/longest-common-subsequence/)
- [LeetCode 198：House Robber](https://leetcode.com/problems/house-robber/)
- [LeetCode 55：Jump Game](https://leetcode.com/problems/jump-game/)
- [LeetCode 435：Non-overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals/)
- [LeetCode 53：Maximum Subarray](https://leetcode.com/problems/maximum-subarray/)
- [MIT 6.006：Dynamic Programming / Knapsack 课程资料](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/)
