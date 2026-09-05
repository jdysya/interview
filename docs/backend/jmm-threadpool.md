---
title: JMM、AQS 与线程池：从不变量到过载保护
date: 2026-09-05
---

# JMM、AQS 与线程池：从不变量到过载保护

> 复习优先级：P0 · 整理与来源核验：2026-09-05

适用：Java 21 语言和并发 API。先修：[并发总览](./concurrency.md)。目标：能解释发布、互斥、排队、取消分别解决什么问题。

<a id="q-java-01"></a>
## Q-JAVA-01：volatile 的 happens-before 怎样推导？

**60 秒回答：** `volatile` 写与后续读取同一变量的读建立同步关系，结合程序顺序和传递性可以实现安全发布；它不把多步读改写合并成原子操作。需要区分可见性、有序性、单次原子更新以及多变量业务不变量。

```java
// 一次发布、单写者的示意；不能不加协议地复用为多轮信号。
class Publication {
    int payload;
    volatile boolean ready;
    void publish() { payload = 42; ready = true; }
    Integer read() { return ready ? payload : null; }
}
```

读线程观察到 `ready=true` 后，能利用 `payload` 写 → `ready` 写 → `ready` 读 → `payload` 读的 happens-before 链。改成普通 boolean 就失去这个发布保证。循环多轮时还要解决版本对应和覆盖，不能只让标志反复翻转。

<a id="q-java-02"></a>
## Q-JAVA-02：为什么 maximumPoolSize 很大仍然堆积？

<KnowledgeDiagram name="threadpool" />

典型提交路径是核心线程、队列、非核心线程、拒绝处理。无界队列可以持续接收任务，导致通常不会通过队列满来扩展到 maximumPoolSize。结果是延迟和内存不断增加，而不是工作线程按期待增加。

## 最小可复现实验

[实验目录](../projects/experiments.md) 中的 Java 程序使用 `core=1 / max=2 / queue=1`，用 CountDownLatch 阻塞工作任务：第一任务占核心线程，第二任务排队，第三任务触发第二工作线程，第四任务被拒绝。实验靠同步屏障而不是 `sleep` 猜测时序。

估算时可以先用 `在途任务数 ≈ 到达率 × 平均响应时间` 判断数量级，但其稳态前提、排队时间和尾延迟必须说明。CPU 型、阻塞 IO 型任务应分别压测，下游数据库只有十条连接时不能用一千个线程凭空提高数据库产能。

| 信号 | 可能解释 | 下一步证据 |
| --- | --- | --- |
| 队列长，CPU 低 | IO 阻塞、锁等待、连接池耗尽 | 线程栈、下游耗时、连接等待 |
| CPU 高，队列长 | 计算饱和或无效循环 | CPU profile、热点代码 |
| 拒绝数增加 | 有界保护触发或线程池关闭 | 运行状态、到达率、业务降级 |

<a id="q-java-03"></a>
## Q-JAVA-03：AQS 与业务幂等有什么区别？

AQS 提供基于同步状态和等待队列构建同步器的基础，子类实现获取/释放语义。ReentrantLock 等同步器利用这类机制协调单个进程内线程。公平性、中断和超时需结合具体同步器理解；CAS 失败和入队也不是业务失败的同义词。

业务幂等则要求同一业务动作重复到达时效果一致，可能跨进程重启、消息重投和不同机器。JVM 锁、Redis 锁、业务唯一约束分别处于不同层面，不能用 AQS 保证远端工单只创建一次。

## 取消与失败边界

`Future.cancel(true)` 是尝试中断，不是强制杀死代码。循环要检查中断，阻塞调用应配置超时；捕获 InterruptedException 后要按策略退出或恢复中断标记。`shutdownNow` 同样不能保证不合作的任务立即停止。CallerRunsPolicy 会把压力传回提交线程，但事件循环或关键请求线程未必适合承接阻塞任务。

## 分层追问与验证

能否画出发布关系？能否构造丢失更新？队列满时为什么不直接无限创建线程？线程池任务里再向同一个饱和池提交子任务并等待会怎样？验证应观察队列等待、执行时间、取消响应与拒绝行为，而不只看最终结果。

## 参考资料

- [JLS 21：Threads and Locks](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html)
- [Java 21：ThreadPoolExecutor](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html)
- [Java 21：AbstractQueuedSynchronizer](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/AbstractQueuedSynchronizer.html)
