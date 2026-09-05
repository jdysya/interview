---
title: Agent 模拟面试：工具契约、恢复和验收
date: 2026-09-05
---

# 🛠 Agent 开发模拟面试

先修结构化输出、HTTP/SQL 基础与幂等。主线不是多放几个角色，而是让模型决策可以受控执行、恢复和验收。

## 三层准备目标

| 层次 | 内容 | 达标表现 |
| --- | --- | --- |
| 先完成 | Agent/Workflow/Skill/Tool 的职责 | 能指出谁决策、谁执行、谁授权 |
| 再深入 | 工具错误、依赖并发、预算和取消 | 不把所有失败都转成重试 |
| 连接项目 | 数据库 Agent、持久执行、上下文外置 | 能说明证据、恢复点和最终状态 |

## 一轮 60 分钟训练示例

| 环节 | 问题与追问 | 验收 |
| --- | --- | --- |
| 5 分钟：架构 | [什么时候需要 Agent？](../agent/architecture.md) | 能解释不使用 Agent 的方案 |
| 10 分钟：执行 | [Q-AGENT-01：Runtime 约束](../agent/runtime-lab.md#q-agent-01) | 模型提议和程序验收分开 |
| 10 分钟：工具 | [Q-AGENT-04：MCP 契约](../agent/tool-contracts.md#q-agent-04) | 权限、Schema、错误、分页完整 |
| 10 分钟：恢复 | [Q-AGENT-02：工具成功后崩溃](../agent/runtime-lab.md#q-agent-02) | 稳定业务键、查证、参数指纹 |
| 15 分钟：项目 | [缺少分片键的数据库查询](../projects/database-agent.md#q-project-01) | 不擅自扩大生产查询范围 |
| 10 分钟：评测 | [上下文压缩丢证据](../agent/skill-context-lab.md#q-agent-06) | 有对照、回读和失败样本 |

## 必须能画的三张图

[Runtime](../agent/runtime-lab.md) 的动作循环、[数据库 Agent](../projects/database-agent.md) 的证据链、[审批项目](../projects/approval-consistency.md) 的未知结果与补偿状态。画完逐条解释每个箭头代表的动作、持久化时点和失败分支。

## 复盘与验收

不要只记“用了 LangGraph/MCP”。写下真实宿主如何保存状态、SDK 版本是什么、哪些接口由服务端保护。本站 [恢复实验](../projects/experiments.md) 只证明指定模拟窗口，不等于完整分布式 Runtime。通过 [自测题库](./README.md) 记录薄弱题，再用 [复盘模板](./review-template.md) 保存可验证结论。
