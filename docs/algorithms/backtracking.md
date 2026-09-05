---
title: 回溯：全排列、子集与组合总和
date: 2026-09-05
---

# 回溯：选择、约束、递归与恢复

> 复习优先级：P0 · 整理与来源核验：2026-09-05

新增 3 道题。默认输入非 null；排列和子集输入元素互不相同；组合总和输入是互异正整数，本实现检查该前提。

## 三种决策树不能混用

| 题目 | 每层选择 | 状态约束 | 何时收集 |
| --- | --- | --- | --- |
| 全排列 | 任一尚未使用的下标 | used 防止同元素重复选择 | 路径长度等于 n |
| 子集 | 选择后只看更后位置 | start 避免重复顺序 | 每个节点都是子集 |
| 组合总和 | 可重复使用当前及后续候选 | start 不回头，remain 递减 | remain=0 |

对 `{2,3}` 求和 7 的一种路径是 `2→2→3`。不会再枚举 `3→2→2`，因为组合按候选下标非递减生成。正数前提保证剩余值随选择下降；允许 0 或负数时这个递归可能不终止。

## Java 实现

```java
static List<List<Integer>> permute(int[] a) {
    List<List<Integer>> out = new ArrayList<>();
    buildPermutations(a, new boolean[a.length], new ArrayList<>(), out);
    return out;
}
static void buildPermutations(int[] a, boolean[] used, List<Integer> path, List<List<Integer>> out) {
    if (path.size() == a.length) { out.add(new ArrayList<>(path)); return; }
    for (int i = 0; i < a.length; i++) if (!used[i]) {
        used[i] = true; path.add(a[i]);
        buildPermutations(a, used, path, out);
        path.remove(path.size() - 1); used[i] = false;
    }
}
static List<List<Integer>> subsets(int[] a) {
    List<List<Integer>> out = new ArrayList<>();
    buildSubsets(a, 0, new ArrayList<>(), out); return out;
}
static void buildSubsets(int[] a, int start, List<Integer> path, List<List<Integer>> out) {
    out.add(new ArrayList<>(path));
    for (int i = start; i < a.length; i++) {
        path.add(a[i]); buildSubsets(a, i + 1, path, out); path.remove(path.size() - 1);
    }
}
static List<List<Integer>> combinationSum(int[] input, int target) {
    if (target < 0) throw new IllegalArgumentException("target must be nonnegative");
    int[] a = input.clone(); Arrays.sort(a);
    for (int i = 0; i < a.length; i++)
        if (a[i] <= 0 || (i > 0 && a[i] == a[i - 1])) throw new IllegalArgumentException("distinct positive candidates required");
    List<List<Integer>> out = new ArrayList<>();
    buildCombinations(a, 0, target, new ArrayList<>(), out); return out;
}
static void buildCombinations(int[] a, int start, int remain, List<Integer> path, List<List<Integer>> out) {
    if (remain == 0) { out.add(new ArrayList<>(path)); return; }
    for (int i = start; i < a.length && a[i] <= remain; i++) {
        path.add(a[i]); buildCombinations(a, i, remain - a[i], path, out); path.remove(path.size() - 1);
    }
}
```

## 正确性与复杂度

每条路径满足题目约束，恢复操作让后续分支从同一状态出发，复制 path 保证历史答案不会被之后的回溯修改。全排列含输出复制约 O(n×n!) 时间、递归辅助 O(n)；子集 O(n×2ⁿ) 时间、辅助 O(n)。组合总和按搜索树规模计费，深度最多 target/minCandidate；令候选数为 n、深度为 d，粗松上界可写 O(n^(d+1)×d)，实际受排序剪枝和 start 约束影响。不要宣称它是固定 O(n²)。输出空间需另外计算。

## 边界与测试

空排列和空集合各有一个空结果；target=0 的组合也包含一个空组合。无解返回空列表。测试每个结果的合法性、结果集合去重以及是否完整，不依赖特定遍历顺序。

## 变式与追问

输入包含重复值时怎样在同一层去重？组合总和每个元素只能使用一次时递归参数如何变化？什么时候适合剪枝，什么时候会误剪掉合法答案？为什么 `out.add(path)` 会导致答案全部被后续修改？

## 参考资料

- [LeetCode 46：Permutations](https://leetcode.com/problems/permutations/)
- [LeetCode 78：Subsets](https://leetcode.com/problems/subsets/)
- [LeetCode 39：Combination Sum](https://leetcode.com/problems/combination-sum/)
