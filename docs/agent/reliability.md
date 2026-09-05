---
title: "Agent 可靠执行、幂等与安全"
date: 2026-09-05
---

# Agent 可靠执行、幂等与安全

> 复习优先级：P0 · 整理与来源核验：2026-09-05

## 面试题：Agent 中途断电，恢复后怎样避免重复操作？

**60 秒回答：** 持久化任务状态和工具调用记录；具有副作用的动作使用业务幂等键，并尽量能够查询执行状态。checkpoint 只表示框架记录到了哪里，不能单独保证外部业务恰好执行一次。对执行成功但回执丢失的情况，应按业务键查证，而不是重新生成一个请求。

## 关键机制

1. 持久化 `task_id / step_id / call_id / idempotency_key / status / result_ref`。
2. 区分可重试错误（临时网络、限流）与不可重试错误（无权限、参数不合法）。
3. 指数退避加抖动，限制尝试次数、任务总时间与总成本；不要在多层都无边界重试。
4. 并发限制按用户、任务和上游资源设置；依赖动作按顺序执行。
5. 确认中断后重放语义，节点重执行时不重复发送邮件、扣费或创建工单。

## 面试题：如何防 Prompt Injection？

把网页、文档和工具返回视为数据来源，不能让其中的“忽略规则”直接改变系统权限。工具端实施最小权限、环境隔离、输入校验和输出限制；敏感操作按具体权限流程执行。Prompt 是一层防护，不能代替系统边界。

## 常见追问

- **Human-in-the-loop 放在哪？** 在需要人做领域判断或授权的具体动作前，展示可审查参数与影响。
- **失败就回滚吗？** 外部副作用往往只能补偿，补偿也可能失败，需要记录、重试和人工兜底。
- **为什么不能只靠 Redis 锁？** 锁过期、进程暂停、故障切换都可能带来重复执行，业务唯一约束仍然需要。

## 参考资料

- [LangGraph：Durable execution](https://docs.langchain.com/oss/python/langgraph/durable-execution)
- [LangGraph：Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)
- [OWASP：Prompt Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)
