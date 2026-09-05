---
title: Java 后端开发
---

# ⚙️ Java 后端开发

先讲业务不变量，再选择同步、事务和恢复机制。原有概览页保留，新页面承担机制推导和实验，不让一个短页面包揽整个技术栈。

| 主线 | 概览与机制详解 | 练习重点 |
| --- | --- | --- |
| Java | [语言基础](./java-foundations.md)、[集合](./java-collections.md) | 对象契约、泛型、资源与容器 |
| 并发 | [并发概览](./concurrency.md)、[JMM/AQS/线程池](./jmm-threadpool.md) | 发布、排队、取消、过载 |
| JVM | [GC 与排障](./jvm.md) | 日志、堆、线程与证据链 |
| Spring | [代理与事务](./spring.md)、[传播行为与 MyBatis](./spring-mybatis.md) | 代理入口、连接和缓存边界 |
| MySQL | [索引与事务总览](./mysql.md)、[MVCC](./mysql-mvcc.md)、[锁实验](./mysql-locking.md)、[日志恢复](./mysql-logging.md) | 按时序推导，不背绝对结论 |
| Redis/一致性 | [Redis](./redis.md)、[一致性总览](./consistency.md)、[缓存竞态与 Outbox](./cache-outbox.md) | 可靠传播和旧回填分开 |
| 消息/服务 | [Kafka](./messaging.md)、[HTTP 与网络](./network.md)、[OS/RPC/分片](./os-rpc.md) | 超时、重试与资源约束 |

<KnowledgeDiagram name="threadpool" />

[库存项目](../projects/inventory-reservation.md) · [审批一致性](../projects/approval-consistency.md) · [后端模拟面试](../practice/java-backend.md)
