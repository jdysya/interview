---
title: "动态规划：零钱兑换"
date: 2026-09-05
---

# 动态规划：零钱兑换

> 复习优先级：P0 · 整理与来源核验：2026-09-05

## 题目与思路

每种正整数面额可以使用任意次，求组成目标金额的最少硬币数。定义 `dp[x]` 为凑出 x 的最少数量，不可达状态设为大值，`dp[0]=0`。

## Java 解法

约定 amount 为非负且可分配对应 DP 数组，coins 中面额均为正整数；这些也是算法成立的输入前提。

```java
static int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);
    dp[0] = 0;
    for (int value = 1; value <= amount; value++) {
        for (int coin : coins) {
            if (coin <= value) {
                dp[value] = Math.min(dp[value], dp[value - coin] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}
```

## 正确性与复杂度

最优解最后一枚硬币为 coin 时，前面必须是 value-coin 的最优解，否则可以替换为更优方案。枚举最后一枚硬币覆盖所有情况。时间 O(amount × 面额数)，额外空间 O(amount)，是依赖数值大小的伪多项式复杂度。

## 边界与追问

- amount=0 返回 0；面额为 `[3]`、金额为 5 时返回 -1。
- **为什么不能贪心？** 面额 `[1,3,4]`、金额 6，先拿 4 得到三枚，3+3 只需两枚。
- **如果求组合数？** 状态含义与转移顺序需要重设，区分组合与排列。
- **每枚硬币只能用一次？** 属于另一种背包约束，不能直接沿用无限次转移。

## 参考资料

- [LeetCode 322：Coin change](https://leetcode.com/problems/coin-change/)
