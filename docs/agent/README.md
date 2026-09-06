---
title: Agent 开发
---

# 🛠 Agent 开发

模型提出动作，宿主控制执行，服务端实施权限，验收检查真实结果。先掌握单任务的可靠执行，再讨论更复杂的编排。

| 层次 | 专题 | 目标 |
| --- | --- | --- |
| 学习导航 | [AI Agent 开源教学项目](./learning-resources.md) | 按教材、Harness、MCP、RAG、Memory 与生产化选择可运行学习项目 |
| 架构 | [Agent 与 Workflow](./architecture.md) | 解释何时需要动态决策 |
| Runtime | [执行与恢复实验](./runtime-lab.md)、[可靠性与安全](./reliability.md) | 持久意图、幂等、查证与预算 |
| 工具 | [MCP 基础](./tools-mcp.md)、[契约与并发调度](./tool-contracts.md) | 区分协议、业务错误与权限 |
| Skill | [Skills 概念](./skills.md)、[Skill 与上下文实验](./skill-context-lab.md) | 工作方法按需加载、结果外置 |
| 记忆 | [上下文与长期记忆](./context-memory.md) | 区分模型输入、任务状态与记忆 |
| 评测 | [Trace 与失败归因](./evaluation.md) | 不只评价最终回答文本 |

<KnowledgeDiagram name="runtime" />

[数据库 Agent 项目](../projects/database-agent.md) · [岗位模拟面试](../practice/agent-engineering.md) · [自测题库](../practice/README.md)
