---
title: "Java 并发、锁与线程池"
date: 2026-09-05
---

# Java 并发、锁与线程池

> 复习优先级：P0 · 整理与来源核验：2026-09-05

## 面试题：volatile 为什么不能保证 i++ 线程安全？

**60 秒回答：** volatile 提供可见性和特定的有序性保证，`i++` 仍包含读取、加一、写回的复合步骤，多个线程可能覆盖更新。应使用原子变量、锁或其他同步机制，并先确定需要保护的业务不变量。

## 锁与内存模型

`synchronized` 提供互斥和 monitor 的同步语义；`ReentrantLock` 可提供可中断获取、超时获取与多个 Condition。CAS 比较并更新一个位置，复杂业务可能还需版本号或更大粒度的锁。判断线程间先后关系时用 happens-before，而不是用“刷新主内存”替代所有细节。

## 面试题：线程池怎么设？

先量化到达率、服务耗时、CPU/IO 占比、下游连接上限和可接受排队时间，再压测。无界队列可能掩盖过载并扩大内存与延迟；拒绝策略应符合业务，关键任务不能静默丢弃。监控活跃线程、队列长度、等待时间、超时和拒绝数。

## 虚拟线程的版本边界

虚拟线程适合大量阻塞 IO 的并发任务，不会让 CPU 密集计算自动更快。JDK 21 的 pinning 行为与后续版本不同；JEP 491 在 JDK 24 改进了 monitor 场景。面试不要把“synchronized 一定导致虚拟线程 pinning”当作所有 JDK 的固定结论。数据库连接池等有限资源仍需并发控制。

## 常见追问

- **死锁怎么查？** 找等待环路与持锁栈，统一加锁顺序、缩小锁范围，必要时超时与重试。
- **线程中断等于强制停止吗？** 不是，通常是协作式取消；阻塞方法和业务循环需正确响应。
- **ThreadLocal 有什么风险？** 线程复用时数据串用或残留；生命周期结束时清理，异步切换需明确传播策略。

## 参考资料

- [Java 21：java.util.concurrent](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html)
- [Java 21：Virtual threads](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html)
- [Java 24：Virtual threads](https://docs.oracle.com/en/java/javase/24/core/virtual-threads.html)
