---
title: 资料来源与收录规则
---

# 资料来源与收录规则

本站使用原创解释与代码，外部资料保留出处，不整篇搬运。每篇文章末尾列出与其结论直接相关的原始资料；本页作为分类入口，不替代逐篇引用。

## 收录规则

优先官方文档、规范、原始论文、作者工程文章与题目原站。技术结论说明版本、前提、反例和适用范围。面试优先级是学习建议，不编造公司来源或发生频率；示例数据和设计方案不称为上线成果。

修改日期表示文件发生变化，核验日期表示实际检查了相应资料。文章附来源不自动代表其中每条结论都经过实验；可运行、手动实验、教学片段与未验证项分别标注。

## 基础机制与数据库

| 原始资料 | 类型 | 建议阅读与对应专题 |
| --- | --- | --- |
| [Java 21 Object](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html) | 官方 API | equals/hashCode 契约；Java 基础 |
| [JLS 21 Chapter 17](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html) | 语言规范 | 同步和 happens-before；JMM |
| [ThreadPoolExecutor](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html) | 官方 API | 队列、扩容、拒绝；线程池实验 |
| [Java 21 GC Guide](https://docs.oracle.com/en/java/javase/21/gctuning/) | 官方指南 | GC 日志与调优前提 |
| [MySQL 一致性读](https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html) | 官方文档 | RC/RR、快照与当前读 |
| [MySQL InnoDB 锁](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking.html) | 官方文档 | 记录、间隙、next-key 锁 |
| [MySQL redo](https://dev.mysql.com/doc/refman/8.4/en/innodb-redo-log.html) | 官方文档 | 崩溃恢复与持久性边界 |
| [Spring 传播行为](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-propagation.html) | 官方文档 | REQUIRED、REQUIRES_NEW、NESTED |
| [MyBatis Java API](https://mybatis.org/mybatis-3/java-api.html) | 官方文档 | SqlSession 与本地缓存 |
| [Redis 分布式锁](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/) | 官方文档 | 租约、故障与锁边界 |
| [Kafka Design](https://kafka.apache.org/41/design/design/) | 官方文档 | 消息可靠性与交付语义 |
| [Cache-Aside](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside) | 架构文档 | 缓存读写路径与陈旧窗口 |
| [Transactional Outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html) | 架构文档 | 业务与事件意图同事务保存 |
| [Saga](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga) | 架构文档 | 补偿与最终一致 |

## AI 与 Agent

| 原始资料 | 类型 | 建议阅读与对应专题 |
| --- | --- | --- |
| [Attention Is All You Need](https://arxiv.org/abs/1706.03762) | 原始论文 | Attention 与多头机制 |
| [RAG](https://arxiv.org/abs/2005.11401) | 原始论文 | 检索增强生成的基本思路 |
| [LoRA](https://arxiv.org/abs/2106.09685) | 原始论文 | 参数高效微调 |
| [QLoRA](https://arxiv.org/abs/2305.14314) | 原始论文 | 量化与参数高效训练 |
| [HNSW](https://arxiv.org/abs/1603.09320) | 原始论文 | 近似向量检索 |
| [Azure RAG](https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview) | 官方文档 | 数据处理、检索与评测 |
| [vLLM Prefix Caching](https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/) | 官方文档 | 前缀计算复用 |
| [Spring AI Tools](https://docs.spring.io/spring-ai/reference/api/tools.html) | 官方文档 | Java 工具执行与版本边界 |
| [ReAct](https://arxiv.org/abs/2210.03629) | 原始论文 | 根据观察进行动作选择 |
| [MCP 2026-07-28 Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) | 协议规范 | 工具定义、调用结果、错误与元数据 |
| [Agent Skills](https://agentskills.io/specification) | 格式规范 | SKILL.md 与渐进加载 |
| [LangGraph Persistence](https://docs.langchain.com/oss/python/langgraph/persistence) | 官方文档 | checkpoint、状态与存储 |
| [LangGraph Functional API](https://docs.langchain.com/oss/python/langgraph/functional-api) | 官方文档 | 任务重放与幂等要求 |
| [Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | 作者工程文章 | 上下文筛选与按需读取 |
| [Agent Evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | 作者工程文章 | 最终状态、轨迹和评测设计 |
| [OWASP Prompt Injection](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) | 安全指南 | 不可信内容与系统权限边界 |

## 算法与验证

算法题目的原站链接放在各题文末，背包课程资料使用 MIT OCW。Java 代码由文档提取测试；原站链接失效不应导致本站只剩题目标题。CI 中使用 Python unittest、Java source-file mode 与固定版本 Playwright 检查实际代码和页面，说明见 [实验总览](../projects/experiments.md)。

## 维护前的最后检查

引用是否真的支持这条结论？版本是否一致？是否把实现细节说成通用保证？是否把推测、合成数据或手动实验预期写成了验证事实？新增资料应能回答这些问题，再加入索引。
