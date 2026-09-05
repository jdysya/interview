---
title: 操作系统、RPC 与分片：工程排障的共同方法
date: 2026-09-05
---

# 操作系统、RPC 与分片：工程排障的共同方法

> 复习优先级：P1 · 整理与来源核验：2026-09-05

目标：区分 CPU、内存、IO、排队和外部等待。Linux 命令只适用于 Linux；不要直接照搬到 macOS。RPC 与分片配置需按实际框架版本核对，本页不绑定某个厂商平台。

<a id="q-ops-01"></a>
## Q-OPS-01：接口变慢时如何分解时间？

**60 秒回答：** 先确定时间范围和受影响请求，再把耗时拆成入口排队、线程池排队、连接等待、数据库或 RPC 执行、序列化与响应传输。对照流量、错误率、CPU、GC 和发布事件，建立证据链，不先假设一定是数据库慢。

| 现象 | 机制线索 | 验证方式 |
| --- | --- | --- |
| CPU 高 | 计算热点、忙等、GC | CPU profile、线程栈、GC 记录 |
| CPU 低但响应慢 | 锁等待、IO、连接等待 | 阻塞栈、等待队列、下游 Trace |
| RSS 高但堆不高 | 堆外、线程栈、映射等 | 原生内存与进程映射分析 |
| 内存压力与缺页增加 | 工作集超出可用资源等 | 缺页、swap、IO 与时间相关性 |

进程是资源和地址空间隔离单位，线程共享进程内的许多资源但有自己的执行栈。虚拟地址空间不等于已占用物理内存；阻塞 IO 和多路复用是不同的等待组织方式。epoll 可帮助管理大量 IO 就绪事件，但不会自动让数据库查询更快。

## 观察命令示例

```bash
# 在有授权的 Linux 测试主机上，替换 PID。
top -H -p PID
ps -L -p PID -o pid,tid,pcpu,stat,comm
jcmd PID Thread.print
jcmd PID GC.heap_info
ss -s
```

命令输出可能包含业务信息，不直接提交公共仓库。诊断工具也有开销；采样、堆转储和生产权限应按团队流程控制。

<a id="q-ops-02"></a>
## Q-OPS-02：RPC 重试为什么会放大故障？

当 A→B→C 每层各重试三次时，下游尝试次数可能乘法增长。应把端到端 deadline 向下传播，给每层设预算，限定可重试错误并加入退避与抖动。请求超时不代表服务端停止执行，写操作应先有业务幂等键或状态查询。

| 机制 | 目的 | 不能代替什么 |
| --- | --- | --- |
| 超时 | 控制等待时长 | 不保证远端副作用取消 |
| 限流 | 控制到达速率 | 不等于限制在途并发 |
| Bulkhead | 隔离资源池 | 不修复错误业务逻辑 |
| 熔断 | 故障时减少无效调用 | 不提供数据库事务保证 |

<a id="q-ops-03"></a>
## Q-OPS-03：分库分表后有哪些新约束？

先明确逻辑表、分片键、路由规则与数据范围，再讨论查询。缺少分片键可能触发多路由；全局排序、分页、聚合和 JOIN 需要跨分片协调。分片数量增加也带来连接、索引、迁移与运维成本，不能只说“数据多就分库分表”。

扩容应描述旧新路由共存、存量迁移、增量追平、校验、流量切换与回退。全局唯一 ID 不等于路由键；业务 ID 可唯一但不能帮助缩小查询范围。

## 分层追问与验证

为何 QPS 不高也可能连接池耗尽？平均延迟正常但 P99 很差怎么定位？重试前剩余 deadline 太短应怎么办？分片聚合的 LIMIT 能否简单推到每个分片？设计测试时覆盖慢节点、部分超时、热点分片和路由版本切换。

关联：[线程池](./jmm-threadpool.md)、[数据库 Agent](../projects/database-agent.md)。

## 参考资料

- [Linux man-pages：epoll](https://man7.org/linux/man-pages/man7/epoll.7.html)
- [Oracle Java 21：Troubleshooting Guide](https://docs.oracle.com/en/java/javase/21/troubleshoot/)
- [gRPC：Deadlines](https://grpc.io/docs/guides/deadlines/)
- [AWS Builders Library：Timeouts, retries and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
