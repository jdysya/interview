---
title: 题目与专题索引
---

# 题目与专题索引

本站分开维护“知识专题”和“可独立自测的问题”。36 道带稳定 ID 的机制追问在 [交互自测题库](../practice/README.md) 中按岗位和掌握程度筛选；30 道算法另有 [算法总索引](../algorithms/README.md)。题目 ID 和路径由校验脚本检查，不用文章数量冒充独立题目数量。

## 知识专题

| 模块 | 概览 | 深入与实践 |
| --- | --- | --- |
| AI 应用 | [LLM](../ai/llm-basics.md)、[RAG](../ai/rag.md)、[检索](../ai/retrieval.md)、[结构化输出](../ai/structured-output.md)、[评测](../ai/evaluation.md)、[服务](../ai/serving.md) | [模型与推理](../ai/transformer-inference.md)、[RAG 实验](../ai/rag-lab.md)、[评测实践](../ai/evaluation-lab.md)、[Java AI](../ai/java-service.md) |
| Agent | [架构](../agent/architecture.md)、[MCP](../agent/tools-mcp.md)、[Skill](../agent/skills.md)、[上下文](../agent/context-memory.md)、[可靠性](../agent/reliability.md)、[评测](../agent/evaluation.md) | [Runtime](../agent/runtime-lab.md)、[工具契约](../agent/tool-contracts.md)、[Skill/上下文实验](../agent/skill-context-lab.md) |
| 后端 | [Java 集合](../backend/java-collections.md)、[并发](../backend/concurrency.md)、[JVM](../backend/jvm.md)、[Spring](../backend/spring.md)、[MySQL](../backend/mysql.md)、[Redis](../backend/redis.md)、[一致性](../backend/consistency.md)、[Kafka](../backend/messaging.md)、[网络](../backend/network.md) | [语言基础](../backend/java-foundations.md)、[JMM/线程池](../backend/jmm-threadpool.md)、[Spring/MyBatis](../backend/spring-mybatis.md)、[MVCC](../backend/mysql-mvcc.md)、[锁](../backend/mysql-locking.md)、[日志](../backend/mysql-logging.md)、[缓存/Outbox](../backend/cache-outbox.md)、[OS/RPC](../backend/os-rpc.md) |

## 场景与项目

| 场景概览 | 对应深化 |
| --- | --- |
| [短链系统](../system-design/short-url.md) | 容量、重定向、缓存与滥用治理 |
| [群聊与消息同步](../system-design/group-chat.md) | 顺序、同步与离线消息 |
| [秒杀与库存](../system-design/flash-sale.md) | [库存状态机项目](../projects/inventory-reservation.md) |
| [审批工单](../system-design/approval.md) | [恢复与补偿项目](../projects/approval-consistency.md) |
| [多租户知识库](../system-design/rag-platform.md) | [RAG 实验](../ai/rag-lab.md)、[评测实践](../ai/evaluation-lab.md) |
| [数据库查询 Agent](../system-design/database-agent.md) | [受控执行项目](../projects/database-agent.md) |

## 按训练目标进入

[Java 后端模拟面试](../practice/java-backend.md) · [AI 应用模拟面试](../practice/ai-application.md) · [Agent 模拟面试](../practice/agent-engineering.md) · [可视化地图](./visual-map.md)

P0/P1 是学习建议，不代表统计得到的面试频率。新题须有解答、追问和来源；尚未实现的设计和未运行的实验明确标注。
