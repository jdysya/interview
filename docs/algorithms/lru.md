---
title: "设计题：O(1) LRU 缓存"
date: 2026-09-05
---

# 设计题：O(1) LRU 缓存

> 复习优先级：P0 · 整理与来源核验：2026-09-05

## 题目与思路

缓存容量有限，访问与写入把条目标记为最近使用，超限淘汰最久未使用项。哈希表提供按键定位，双向链表维护访问顺序。以下给出手写实现，便于解释各操作如何保持平均 O(1)。

## Java 解法

头尾哨兵减少边界分支，最近使用节点靠近 head。未命中返回 -1，容量为 0 时不存储。

```java
static class LRUCache {
    static class Node {
        int key, value;
        Node prev, next;
        Node(int key, int value) { this.key = key; this.value = value; }
    }
    final int capacity;
    final Map<Integer, Node> map = new HashMap<>();
    final Node head = new Node(0, 0), tail = new Node(0, 0);
    LRUCache(int capacity) {
        if (capacity < 0) throw new IllegalArgumentException("negative capacity");
        this.capacity = capacity;
        head.next = tail; tail.prev = head;
    }
    void unlink(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    void first(Node node) {
        node.next = head.next; node.prev = head;
        head.next.prev = node; head.next = node;
    }
    int get(int key) {
        Node node = map.get(key);
        if (node == null) return -1;
        unlink(node); first(node);
        return node.value;
    }
    void put(int key, int value) {
        if (capacity == 0) return;
        Node node = map.get(key);
        if (node != null) {
            node.value = value;
            unlink(node); first(node);
            return;
        }
        node = new Node(key, value);
        map.put(key, node); first(node);
        if (map.size() > capacity) {
            Node removed = tail.prev;
            unlink(removed); map.remove(removed.key);
        }
    }
}
```

## 复杂度与边界

get/put 平均 O(1)，空间 O(capacity)。测试覆盖更新已有 key、读取改变顺序、容量 1 和容量 0。该教学实现不是线程安全缓存。

## 面试追问

- **LinkedHashMap 可以实现吗？** 可以，访问顺序模式配合淘汰逻辑；仍需解释底层为何需要链表。
- **get 是只读吗？** LRU 的 get 修改链表顺序，并发时也需要保护。
- **LRU 适合所有负载吗？** 扫描型访问可能冲掉热点；生产缓存还要考虑 TTL、频率、容量估算和并发。

## 参考资料

- [LeetCode 146：LRU cache](https://leetcode.com/problems/lru-cache/)
