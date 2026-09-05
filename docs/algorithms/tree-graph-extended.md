---
title: 链表、树与图：环检测、K 路合并、公共祖先和岛屿
date: 2026-09-05
---

# 链表、树与图：四道结构题

> 复习优先级：P0 · 整理与来源核验：2026-09-05

新增 4 道题。沿用原算法页与测试中的 ListNode、TreeNode：节点含 val 和 next，或 left/right。链表合并默认输入有序、无环、彼此不共享节点；岛屿网格为矩形。公共祖先题默认 p、q 均在树中，按节点身份比较。

## 不变量与证明入口

环检测：快指针每步两格、慢指针一格；进入环后相对距离每步变化一格，因此会相遇。无环时快指针先到 null，不能直接访问 fast.next.next。

K 路合并：堆中至多保存每条链表当前未输出的最小节点，弹出的最小值就是全局下一个元素。输出后把该节点的后继入堆。

最近公共祖先：左右递归分别返回找到的目标或公共祖先；两侧都非空时当前根是汇合点。一侧为空就返回另一侧结果。这依赖“两节点都存在”的前提。

岛屿：遇到未访问陆地计数一次，随后 BFS 把其连通分量全部标记。入队时就标记，避免同一点被多个邻居重复入队。

## Java 实现

```java
static boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next; fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}
static ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> heap = new PriorityQueue<>(Comparator.comparingInt(n -> n.val));
    for (ListNode node : lists) if (node != null) heap.offer(node);
    ListNode dummy = new ListNode(0), tail = dummy;
    while (!heap.isEmpty()) {
        ListNode node = heap.poll();
        if (node.next != null) heap.offer(node.next);
        tail.next = node; tail = node;
    }
    tail.next = null;
    return dummy.next;
}
static TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) return root;
    TreeNode left = lowestCommonAncestor(root.left, p, q);
    TreeNode right = lowestCommonAncestor(root.right, p, q);
    if (left != null && right != null) return root;
    return left != null ? left : right;
}
static int numIslands(char[][] grid) {
    if (grid.length == 0 || grid[0].length == 0) return 0;
    int rows = grid.length, cols = grid[0].length, count = 0;
    int[][] directions = {{1,0},{-1,0},{0,1},{0,-1}};
    Deque<int[]> queue = new ArrayDeque<>();
    for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
        if (grid[r][c] != '1') continue;
        count++; grid[r][c] = '0'; queue.offer(new int[]{r,c});
        while (!queue.isEmpty()) {
            int[] cur = queue.poll();
            for (int[] d : directions) {
                int nr = cur[0] + d[0], nc = cur[1] + d[1];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1') {
                    grid[nr][nc] = '0'; queue.offer(new int[]{nr,nc});
                }
            }
        }
    }
    return count;
}
```

## 复杂度与副作用

环检测时间 O(n)、空间 O(1)；K 路合并总节点 N，时间 O(N log k)、堆空间 O(k)，会重接原节点。公共祖先时间 O(n)、递归栈 O(h)，深链树可能栈溢出。岛屿时间 O(rows×cols)，队列最坏同阶，会修改网格；需要保留输入时先复制。

## 失败案例与测试

环形链表应测试空、单节点无环、单节点自环和尾连到中间；K 路合并测试空数组、null 子链、重复值和极值。公共祖先测试一方就是祖先，不能只测左右子树；如果目标可能不在树里，需要增加存在性检查或返回找到数量。岛屿测试全水、全陆、只有对角相接和窄长网格，四方向连通不包含对角线。

## 变式与追问

如何找环入口？链表节点能共享时为什么当前 K 路合并实现不安全？公共祖先换成 BST 可利用什么额外约束？岛屿数量改成最大面积，BFS 应额外记录什么？大量动态连接是否更适合并查集？

## 参考资料

- [LeetCode 141：Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/)
- [LeetCode 23：Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/)
- [LeetCode 236：Lowest Common Ancestor](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/)
- [LeetCode 200：Number of Islands](https://leetcode.com/problems/number-of-islands/)
