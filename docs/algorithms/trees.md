---
title: "树：层序遍历与 BFS"
date: 2026-09-05
---

# 树：层序遍历与 BFS

> 复习优先级：P0 · 整理与来源核验：2026-09-05

## 题目与思路

按深度从浅到深遍历二叉树，同一层从左到右。队列保存待处理节点，每轮先固定当前队列长度，再只处理这一层的节点。

## Java 解法

`TreeNode` 具有 `int val`、`TreeNode left/right` 字段。ArrayDeque 不接受 null，所以子节点存在时才入队。

```java
static List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> answer = new ArrayList<>();
    if (root == null) return answer;
    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.addLast(root);
    while (!queue.isEmpty()) {
        int count = queue.size();
        List<Integer> level = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            TreeNode node = queue.removeFirst();
            level.add(node.val);
            if (node.left != null) queue.addLast(node.left);
            if (node.right != null) queue.addLast(node.right);
        }
        answer.add(level);
    }
    return answer;
}
```

## 复杂度与边界

时间 O(n)，辅助队列 O(w)，w 为最大层宽，最坏 O(n)；返回结果另占 O(n)。空树返回空列表，退化链状树每层只有一个节点。

## 面试追问

- **最短路径为什么经常用 BFS？** 无权图按层扩展可得到最少边数；有权图不能一般化套用。
- **锯齿层序？** 层号控制写入或输出方向，遍历逻辑仍保持明确。
- **DFS 的额外空间？** 取决于树高；递归在链状树上可达到 O(n)。

## 参考资料

- [LeetCode 102：Level order traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)
