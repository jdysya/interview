---
title: Agent Runtime 实验：执行意图、幂等与断点恢复
date: 2026-09-05
---

# Agent Runtime 实验：执行意图、幂等与断点恢复

> 复习优先级：P0 · 整理与来源核验：2026-09-05

先修：[执行模式](./architecture.md)、[可靠执行](./reliability.md)。范围：供应商无关的教学 Runtime，不冒充完整 LangGraph 或 MCP SDK 实现。

<a id="q-agent-01"></a>
## Q-AGENT-01：最小 Runtime 要有什么确定性约束？

**60 秒回答：** 模型提出动作，程序检查预算和取消、校验工具与参数、执行并记录结果。业务状态与工具调用记录需要持久化，最终由验收条件决定完成。模型说“做完了”和外部状态确实正确是两件事。

<KnowledgeDiagram name="runtime" />

## 状态设计

| 字段 | 用途 | 不能混淆的概念 |
| --- | --- | --- |
| task_id | 整体任务身份 | 不等于某一次网络请求 ID |
| call_id | 模型提出的调用标识 | 重规划可能变化，不一定适合业务幂等 |
| idempotency_key | 稳定业务动作身份 | 应绑定动作和版本，不随网络重试变化 |
| arguments_hash | 参数指纹 | 相同键参数改变时必须报冲突 |
| status | PREPARED / SUCCEEDED 等 | 没收到回执不等于没有执行 |
| result_ref | 结果或产物定位 | 引用仍需授权与生命周期管理 |

<a id="q-agent-02"></a>
## Q-AGENT-02：工具成功、保存结果前崩溃怎么办？

危险窗口如下：本地已保存 PREPARED → 远端完成业务 → 本地还没保存 SUCCEEDED → 进程中断。恢复时不能单凭 checkpoint 判定远端没有执行，也不能生成新业务键直接再来一次。

```text
恢复 PREPARED
  ├─ 按业务键查证远端：已完成 → 取回原结果并保存
  ├─ 权威确认未执行 → 用同一业务键执行
  └─ 仍未知 → 保持待查证 / 告警，不伪造失败或成功
```

若远端提供可靠幂等接口，也可以用相同业务键重试并得到原结果。这里“没有重复业务效果”依赖远端幂等和持久状态，不是 Runtime 自己单方面创造的 exactly-once。

## 本站故障实验

`examples/engineering_checks.py` 使用两个独立 SQLite 数据库：一个代表本地调用账本，另一个代表模拟远端服务。测试在远端成功后主动抛出故障，再用新 Runtime 实例恢复；检查远端业务记录仍只有一条、结果 ID 一致、参数冲突会被拒绝。

SQLite 用来演示持久记录和唯一约束，不模拟生产数据库的所有并发或复制语义。测试覆盖指定崩溃窗口，不声称已经实现模型接入、跨机租约、完整取消或所有恢复路径。运行方式见 [实验总览](../projects/experiments.md)。

## 预算与终止

每轮之前检查总 deadline、步骤上限和累计成本。工具自身还要有超时与输出限制。对于无进展循环，可记录连续重复动作和状态变化，触发澄清或失败退出。不要只设置单次模型 max_tokens，却允许无限轮调用。

并发 worker 恢复同一任务时，需要任务领取、租约或条件更新；即使租约过期，也仍须依靠业务幂等处理重复执行。数据库写状态与调用外部接口不宜包在一个长本地事务中假装原子化。

## 分层追问与验证

checkpoint、工作上下文、长期记忆分别保存什么？执行意图在调用前还是调用后保存？参数指纹为什么重要？远端成功但查询接口暂时返回不存在怎么办？验证要记录真实状态和调用次数，并区分“接口被调用多次”和“业务效果发生多次”。

## 参考资料

- [LangGraph：Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
- [LangGraph：Functional API](https://docs.langchain.com/oss/python/langgraph/functional-api)
- [Python：sqlite3](https://docs.python.org/3/library/sqlite3.html)
