---
title: 资料来源与核验方法
---

# 资料来源与核验方法

**先读资料，再写文章。** 题目覆盖与技术答案是两种不同证据：公开题库说明值得检查哪些问题，官方文档、源码、论文帮助验证机制。本站应给出完整原创解释，而不是让读者自己从外链拼答案。

## 题目覆盖来源

[JavaGuide](https://javaguide.cn/)用于后端知识体系与公开面试问题对照；[小林 coding](https://xiaolincoding.com/redis/architecture/mysql_redis_consistency.html)用于缓存一致性问题的时序覆盖；[Datawhale Hello Agents 面试问题](https://github.com/datawhalechina/hello-agents/blob/main/Extra-Chapter/Extra01-%E9%9D%A2%E8%AF%95%E9%97%AE%E9%A2%98%E6%80%BB%E7%BB%93.md)与[JavaGuide AI 指南](https://javaguide.cn/ai/interview-questions/ai-interview-guide.html)用于 LLM、RAG、Agent 和评测选题；[System Design Primer](https://github.com/donnemartin/system-design-primer)用于通用系统设计范围。

这些资料不证明某题的实际出现频率。即使作者说明来自真实面试，也仅归属于作者的报告；不替它编造公司、年份或百分比。具体覆盖和当前缺口见 [审阅记录](./coverage-audit.md)。

## 2026-09-06：AI Agent 开源教学项目导航

[AI Agent 开源教学项目导航](../agent/learning-resources.md) 的目标是帮助选择可实践的公开学习材料，而不是用社区教程替代协议、论文或官方文档。本轮实际读取并比较了候选项目的 GitHub 仓库主页 / README，重点核对：是否存在明确章节或渐进式实验、是否提供真实代码或 Notebook、当前完成状态、技术覆盖和作者声明的适用范围。

主线课程重点核对了 [AI Agent Book](https://github.com/bojieli/ai-agent-book)、[Hello-Agents](https://github.com/datawhalechina/hello-agents)、[Microsoft AI Agents for Beginners](https://github.com/microsoft/AI-Agents-for-Beginners)、[Hugging Face Agents Course](https://github.com/huggingface/agents-course)、[LangGraph 101](https://github.com/langchain-ai/langgraph-101)、[LLM Zoomcamp](https://github.com/DataTalksClub/llm-zoomcamp)；Harness 方向核对了 [learn-claude-code](https://github.com/shareAI-lab/learn-claude-code)、[Claude Code From Scratch](https://github.com/Windy3f3f3f3f/claude-code-from-scratch)、[Agent Zero to Hero](https://github.com/KeWang0622/agent-zero-to-hero) 等；专题方向核对了 [MCP for Beginners](https://github.com/microsoft/mcp-for-beginners)、[RAG Techniques](https://github.com/NirDiamant/RAG_Techniques)、[Agent Memory Techniques](https://github.com/NirDiamant/Agent_Memory_Techniques) 和多组生产化 / LLM systems 教学仓库。完整候选与限制说明保留在导航页，不在本页重复整个清单。

本轮核验只支持“这个仓库当前公开了哪些课程结构、代码、实验和项目状态”。GitHub Star 不作为质量证明；README 中的 production-ready、best practice、真实面试、高频、性能等宣传性描述也不自动升级为本站事实。MCP、Tool Calling、LangGraph、模型 API 等技术语义需要写入正式专题时，仍回到相应官方规范、源码、论文或可复现实验重新核验。

## 本轮实际阅读的技术依据

| 主题 | 原始资料 | 支持的内容 |
| --- | --- | --- |
| 并发规范 | [JLS 21 Chapter 17](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html) | 同步关系、happens-before、单次发布的推导 |
| 同步器 | [AQS 21](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/AbstractQueuedSynchronizer.html) | state、独占/共享与等待协调 |
| 线程池 | [ThreadPoolExecutor 21](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html)、[CallerRunsPolicy](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.CallerRunsPolicy.html) | 参数和队列关系、拒绝、关闭后的丢弃语义 |
| 异步任务 | [FutureTask](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/FutureTask.html)、[ExecutorService](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ExecutorService.html) | 返回值、失败、取消与停机 |
| 缓存 | [Microsoft Cache-Aside](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside) | 常见读写顺序与一致性限制 |
| 可靠事件 | [AWS Outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)、[Debezium MySQL](https://debezium.io/documentation/reference/stable/connectors/mysql.html) | 事件意图、重复投递、快照和 binlog |
| 检索与重排 | [Sentence Transformers](https://sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html) | Bi-Encoder 与 Cross-Encoder 分工 |
| 文档切块 | [Microsoft Chunking](https://learn.microsoft.com/en-us/azure/search/vector-search-how-to-chunk-documents) | 长度、结构与重叠策略 |
| 排名融合 | [Elasticsearch RRF](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion) | 基于排名的融合公式 |
| 向量查询 | [pgvector](https://github.com/pgvector/pgvector#filtering) | 精确/近似查询与过滤、迭代扫描的实现边界 |
| 长上下文 | [Lost in the Middle](https://arxiv.org/abs/2307.03172) | 历史实验中的证据位置敏感性，不外推为所有当前模型结论 |
| 工具执行 | [Claude Tool Use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)、[Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | 宿主执行、调用结果配对与编排选择 |
| MCP | [2026-07-28 Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)、[Versioning](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning) | 定义、结果类型、新旧版本协商方式的区别 |
| Schema 与取消 | [JSON Schema Object](https://json-schema.org/understanding-json-schema/reference/object)、[gRPC Cancellation](https://grpc.io/docs/guides/cancellation/) | 结构限制与服务端响应取消的职责 |

上表是本轮重写四篇文章的来源范围，不代表所有既有章节重新核验。各篇正文的 S1、S2 等标记对应其文末资料，教学例子与数值另行说明为原创推导。

## 其他已有章节的来源

MySQL、Spring、Redis、Kafka、论文和算法原题链接仍保留在各自章节文末；旧页面的来源日期不因这次修改而统一更新。需要维护某篇文章时，必须重新读取相应版本资料，不能仅从本目录摘一个链接就打上“已核验”。

## 冲突、实验与版权

来源冲突时先核对条件、版本和保证强度。例如“最终能通过重试修复”不等于“任何时刻都一致”，“协议当前版本”不等于“所用 SDK 已支持”。保留不确定性和反例，不强行把来源拼成一致结论。

合成数据只验证示例逻辑，不用于宣称真实模型质量、性能提升或生产经验。代码、构建、浏览器和业务验证分别记录，不能互相替代。

引用保留作者、标题与链接，原创组织解释和案例，不复制整篇文章、付费题解或他人图解。每篇应可以独立学习，但不冒充外部资料的原创研究成果。
