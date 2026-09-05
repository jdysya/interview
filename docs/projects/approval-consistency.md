---
title: 项目深挖：审批工单与本地关联的恢复和补偿
date: 2026-09-05
---

# 项目深挖：审批工单与本地关联的恢复和补偿

> 复习优先级：P0 · 整理与来源核验：2026-09-05

深化 [审批场景](../system-design/approval.md)。假设远端支持按稳定业务键幂等创建、状态查询和符合业务规则的撤销；若实际接口不支持，必须重新评估保证。

## 一致性目标与非目标

本地只有在确认远端工单存在且保存关联后，才标记业务成功；远端结果未知时保留处理中状态；放弃业务时撤销远端并最终记录一致终态。这是可恢复的最终一致方案，不是任意时刻都原子的分布式事务。

<KnowledgeDiagram name="approval" />

<a id="q-project-03"></a>
## Q-PROJECT-03：不新增表怎样保存恢复意图？

**60 秒回答：** 可在现有业务行保存 request_id、参数指纹、approval_id、sync_status、version 和重试时间，在远端调用前持久化意图。业务失败不提交成功状态，但为了恢复仍需保留处理中或失败记录。若连任何持久意图都不允许保存，就不能承诺进程崩溃后的自动补偿可靠性。

## 状态转换表

| 当前状态 | 事件 | 下一状态与动作 |
| --- | --- | --- |
| PENDING | 创建成功 | 保存工单 ID，进入 LINKED |
| PENDING | 超时未知 | UNKNOWN，按 request_id 查证 |
| UNKNOWN | 权威查证存在 | 保存关联进入 LINKED，或按已记录放弃意图补偿 |
| UNKNOWN | 权威确认未创建 | 同键重试或按业务关闭 |
| LINKED / UNKNOWN | 业务决定放弃 | COMPENSATING，查询后执行幂等撤销 |
| COMPENSATING | 确认已撤销或确认未创建 | CLOSED |
| 任意处理中 | 非法版本或重复任务 | 重新读取状态，不盲目覆盖 |

图示是主要路径，表格补齐 LINKED 后发起撤销和确认未创建的分支。真实审批可能已进入不可撤销阶段，此时不能强行承诺撤销成功，应进入冲突处理或人工兜底。

## 正常链路和持久化时点

```text
本地短事务：保存请求号、参数指纹、PENDING，提交
→ 远端 create(request_id, payload)
→ 本地短事务：条件更新 approval_id、LINKED，提交
→ 返回业务成功
```

远端调用不要长时间占着本地事务和行锁。返回成功前本地关联失败时，优先按既定业务策略重试关联；如果决定放弃，则先保存放弃意图再执行撤销。不能同一请求一会儿重试成功、一会儿执行补偿，而没有并发协调。

## 调用超时的处理

查询接口也可能有延迟或暂时错误。只有当远端提供足够权威的“未创建”语义时才能据此安全重试；否则继续用同键幂等调用或保持未知。新生成 request_id 会绕过原幂等约束，是恢复流程中的典型错误。

## 补偿任务与并发

后台按 `sync_status + next_retry_at` 扫描，使用版本条件领取或续租。租约到期可能导致双 worker，远端幂等仍然不可缺少。记录最近错误、次数和下次尝试时间，设置重试上限与告警；不要把失败记录删掉来让界面看起来干净。

## 故障注入矩阵

| 注入点 | 应观察 |
| --- | --- |
| 保存 PENDING 前退出 | 远端尚未被调用 |
| PENDING 后、创建前退出 | 恢复可找到请求号 |
| 创建成功、保存关联前退出 | 查证原工单，不重复创建 |
| 撤销成功、保存 CLOSED 前退出 | 查证撤销或幂等重试 |
| 相同键换了参数 | 明确冲突，不返回原成功冒充新请求成功 |
| 后台与用户撤销并发 | 不覆盖新版本，不恢复已放弃业务为成功 |

## 实验与边界

[恢复实验](./experiments.md) 验证“模拟远端成功、本地结果未保存”的窗口，以及同键参数冲突。没有实现真实审批 SDK、所有撤销规则或生产重试调度；不能把这些未覆盖路径写成已经上线验证的成果。

## 分层追问

为什么本地 @Transactional 不够？支持撤销为什么仍可能不一致？只在 catch 中撤销漏掉哪个窗口？请求号在哪个时点保存？补偿失败由谁发现？如何保证同键不同参数不被错误复用？

## 参考资料

- [Microsoft：Saga Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga)
- [Spring：Declarative Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
- [AWS Builders Library：Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
