---
title: 缓存竞态与 Outbox：从失败窗口到可验证保证
date: 2026-09-05
---

# 缓存竞态与 Outbox：从失败窗口到可验证保证

> 复习优先级：P0 · 整理与来源核验：2026-09-05

先修：[缓存一致性概览](./consistency.md)。目标：区分“可靠传播失效事件”和“禁止所有旧值回填”。

<a id="q-cache-01"></a>
## Q-CACHE-01：先更新数据库再删缓存有什么竞态？

**60 秒回答：** 写库后删除缓存是常用 Cache-Aside 写路径，但写库成功、删缓存失败，以及旧读请求晚于删除回填，都可能留下旧值。必须说明允许的陈旧窗口，并分别处理事件丢失、乱序、重复、旧回填和副本延迟。

<KnowledgeDiagram name="cache" />

## 可运行的竞态模型

[实验目录](../projects/experiments.md) 的 Python 测试按确定顺序交错：读取得到 v1 → 写库 v2 → 删除缓存 → 旧读回填 v1。它能稳定重现逻辑反例，不依赖线程调度随机碰撞；但它不是 Redis/MySQL 网络故障的集成压测。

| 方案 | 处理了什么 | 剩余边界 |
| --- | --- | --- |
| TTL | 限定一份已写缓存的存活时间 | 晚回填会重新开始 TTL，不能按写库时刻简单计上限 |
| 删除重试 | 删除临时失败 | 重试成功之后仍可能出现旧回填 |
| 延迟双删 | 尝试覆盖常见时序窗口 | 依赖延迟假设，不是严格保证 |
| 版本写入协议 | 拒绝比已知新版本更旧的候选 | 缓存失效后仍需保留版本水位或权威校验 |
| 关键请求读权威源 | 避开缓存陈旧 | 还需明确是否读取主库与一致性要求 |

<a id="q-cache-02"></a>
## Q-CACHE-02：Outbox 解决了什么，又没有解决什么？

业务写入和 outbox 事件在同一个本地事务提交，由独立投递器读取未发送事件并发送。进程在数据库提交之后崩溃时，事件仍可恢复。它解决的是本地数据与发送意图之间的原子保存，不自动保证消费者只执行一次，也不自动消除读回填竞态。

```sql
-- 教学表结构；与业务表必须处于同一个事务边界。
CREATE TABLE outbox_event (
  event_id VARCHAR(64) PRIMARY KEY,
  aggregate_id VARCHAR(64) NOT NULL,
  aggregate_version BIGINT NOT NULL,
  payload TEXT NOT NULL,
  status VARCHAR(16) NOT NULL,
  next_retry_at TIMESTAMP NULL
);
-- BEGIN;
-- UPDATE business_row ...;
-- INSERT INTO outbox_event (...) VALUES (...);
-- COMMIT;
```

发送成功但标记 SENT 前崩溃会重复投递。消费者应使用 event_id 或业务版本处理重复；并发投递器需领取租约或受控抢占。按业务对象的顺序与全局顺序不是一回事。

## 版本协议的隐藏问题

只执行“缓存有 v2 时拒绝 v1”并不够：如果删除缓存后连 v2 的版本信息也没了，晚到的 v1 又可能被接受。设计时需要明确版本水位的存储、生命周期、所有读写路径的原子校验，以及水位丢失后的处理。跨 Redis 和数据库的一次先查后写，也不能凭空变成原子操作。

## 分层追问

发送成功后本地标记失败怎么办？消费者已经失效缓存，旧请求随后才回填怎么办？CDC 延迟如何影响陈旧窗口？如何区分热点回源保护与一致性保证？什么场景值得放弃缓存而直接读取权威数据？

## 如何验证

列出每个崩溃点：提交前、提交后发送前、发送后标记前、消费后确认前。注入重复与乱序事件，并保留一个延迟的旧读请求跨越整个过程。验收同时检查业务效果、事件可恢复性和缓存版本，不只检查“最终有消息”。

关联：[审批项目](../projects/approval-consistency.md)、[Agent 恢复](../agent/runtime-lab.md)。

## 参考资料

- [Microsoft：Cache-Aside](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside)
- [AWS：Transactional Outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)
