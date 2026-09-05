---
title: "Java 集合与 ConcurrentHashMap"
date: 2026-09-05
---

# Java 集合与 ConcurrentHashMap

> 复习优先级：P0 · 整理与来源核验：2026-09-05

## 面试题：HashMap 的 get 和 put 一定是 O(1) 吗？

**60 秒回答：** 平均情况下哈希分布合理时接近 O(1)，碰撞、扩容和具体键比较会影响性能。应结合数组、桶内结构、负载因子和扩容说明。HashMap 非线程安全，键对象参与 equals/hashCode 的字段在入表后被修改可能导致查找失败。

## 需要说清的机制

- `equals` 相等的对象必须有相同 `hashCode`，反过来不成立。
- ArrayList 的随机访问为 O(1)，中间插删需要移动元素；LinkedList 节点插删前还可能需要 O(n) 定位。
- 对 OpenJDK 常见实现，HashMap 碰撞严重时可以树化；具体阈值是实现细节，不能替代理解索引过程。
- ConcurrentHashMap 的单次操作有并发保障，`containsKey` 后 `put` 这样的多步组合并不自动原子，应使用 `putIfAbsent`、`compute` 等合适方法。

## 面试题：ConcurrentHashMap 为什么不允许 null？

null 会让“无映射”和“映射到 null”难以区分，尤其在并发状态变化时。还应知道迭代不是某一时刻全表一致快照；不要用遍历结果推断跨键业务事务。

## 常见追问

- **computeIfAbsent 内适合远程调用吗？** 尽量保持回调短小；长阻塞会影响相关更新，初始化过程也需考虑失败和并发。
- **Hashtable、synchronizedMap 和 ConcurrentHashMap 怎么选？** 根据访问方式、复合操作与并发需求，不能用“线程安全”一词掩盖所有差异。
- **扩容为什么昂贵？** 需要分配新表、迁移或重定位桶，还会造成内存和延迟压力。

## 练习

实现按单词并发计数：先解释 `map.get(k) + 1` 的竞态，再比较 `merge` 与 `LongAdder` 的使用范围；如果要求读取瞬间的跨键一致统计，需要额外设计。

## 参考资料

- [Java 21：ConcurrentHashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html)
- [Java 21：HashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html)
