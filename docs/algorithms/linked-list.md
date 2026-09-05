---
title: "链表：反转与指针不变量"
date: 2026-09-05
---

# 链表：反转与指针不变量

> 复习优先级：P0 · 整理与来源核验：2026-09-05

## 题目与思路

原地反转单链表，返回新头结点。保持 `previous` 指向已反转部分，`current` 指向尚未处理部分。改写 next 之前先保存后继，否则会丢失剩余链表。

## Java 解法

`ListNode` 具有 `int val` 与 `ListNode next` 两个字段，输入约定为无环链表。

```java
static ListNode reverseList(ListNode head) {
    ListNode previous = null;
    ListNode current = head;
    while (current != null) {
        ListNode next = current.next;
        current.next = previous;
        previous = current;
        current = next;
    }
    return previous;
}
```

## 复杂度与边界

时间 O(n)，额外空间 O(1)。空链表返回 null，单节点保持不变。递归写法也可行，但额外调用栈 O(n)，长链表可能栈溢出。

## 面试追问

- **反转指定区间？** 用 dummy 节点统一头部边界，保存区间前驱和区间后继，反转后重新连接。
- **每 K 个一组反转？** 先确认这一组够 K 个，再修改指针；不够的尾部按题意保留。
- **如何找环入口？** 快慢指针相遇后，一指针从头开始，两者同速前进，再次相遇是入口，需要说明路程关系。

## 手工验证

对长度 0、1、2、4 的链表逐步画出三个指针的位置。结束后检查旧头的 next 为 null，并确认没有因连错指针形成环。

## 参考资料

- [LeetCode 206：Reverse linked list](https://leetcode.com/problems/reverse-linked-list/)
