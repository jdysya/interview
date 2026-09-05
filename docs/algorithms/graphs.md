---
title: "图：课程表与拓扑排序"
date: 2026-09-05
---

# 图：课程表与拓扑排序

> 复习优先级：P0 · 整理与来源核验：2026-09-05

## 题目与思路

课程有前置依赖，判断能否全部完成。把前置课连向后续课，使用 Kahn 算法：先取所有入度为 0 的节点，每移除一个节点就减少后续节点的入度。

## Java 解法

输入 `[a, b]` 表示先学 b 再学 a，编号约定在 `[0, n)`。

```java
static boolean canFinish(int n, int[][] prerequisites) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
    int[] indegree = new int[n];
    for (int[] pair : prerequisites) {
        graph.get(pair[1]).add(pair[0]);
        indegree[pair[0]]++;
    }
    Deque<Integer> queue = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indegree[i] == 0) queue.add(i);
    int completed = 0;
    while (!queue.isEmpty()) {
        int current = queue.removeFirst();
        completed++;
        for (int next : graph.get(current)) {
            if (--indegree[next] == 0) queue.addLast(next);
        }
    }
    return completed == n;
}
```

## 复杂度与边界

时间 O(V+E)，空间 O(V+E)。没有依赖则全部可完成；自环与多节点环都无法完成；图可以不连通。

## 面试追问

- **如何返回学习顺序？** 将出队节点加入结果；结果长度不足 n 则存在环。
- **为什么移除数量不足说明有环？** 剩余节点都有入边；有限图沿剩余前驱持续回溯必然重复节点。
- **Agent 的计划能直接看作 DAG 吗？** 无环依赖计划可以，存在重试或重规划的运行状态还需单独表达。

## 参考资料

- [LeetCode 207：Course schedule](https://leetcode.com/problems/course-schedule/)
