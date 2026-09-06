---
title: 公开资料对照与内容缺口
date: 2026-09-05
---

# 公开资料对照与内容缺口

## 本轮纠正的不是主题配色，而是内容定位

此前扩充过度围绕数据库 Agent、库存与审批案例，且把简短原则写成“深化专题”。有目录、有参考资料、有测试通过，不等于内容足够支撑通用面试准备。

本轮先用公开资料检查题目覆盖，再用官方文档核对具体答案；仅重写四篇核心文章，不将整个站点标记为已经补全。

## 公开资料如何参与选题

| 资料 | 这次用它检查什么 | 使用边界 |
| --- | --- | --- |
| [JavaGuide](https://javaguide.cn/)与[线程池专题](https://javaguide.cn/java/concurrent/java-thread-pool-summary.html) | Java 后端知识组织，线程池参数、执行流程、Future 与拒绝策略覆盖 | 原作者知识整理，不代表面试频率统计；答案回到 JDK 文档核对 |
| [小林 coding 缓存一致性](https://xiaolincoding.com/redis/architecture/mysql_redis_consistency.html) | 四种操作顺序、延迟双删、消息与日志失效 | 不把概括性“保证一致性”当作严格强一致证明 |
| [Datawhale Hello Agents 面试问题](https://github.com/datawhalechina/hello-agents/blob/main/Extra-Chapter/Extra01-%E9%9D%A2%E8%AF%95%E9%97%AE%E9%A2%98%E6%80%BB%E7%BB%93.md) | LLM、Agent、RAG 与评测的具体提问范围 | 作者整理的面试经历；不扩写成未经证实的公司真题归属 |
| [JavaGuide AI 面试指南](https://javaguide.cn/ai/interview-questions/ai-interview-guide.html) | 大模型、Agent、RAG、AI 系统设计之间的覆盖关系 | 用作选题导航，不搬运答案或用其替代协议规范 |
| [System Design Primer](https://github.com/donnemartin/system-design-primer) | 需求、容量、基础组件、场景与权衡的组织方法 | 不把英文案例的规模和技术栈当作所有系统的默认方案 |

外部材料也可能过时或简化。本站的价值应当是把同一问题的机制、例子、争议和版本整合清楚，不是简单汇总网址，更不是换词复制。

## 当前修订范围

| 文章 | 已补的实质内容 | 仍未声称完成的验证 |
| --- | --- | --- |
| [线程池](../backend/jmm-threadpool.md) | 安全发布推导、AQS、参数关系、提交时间线、异常/Future、拒绝与停机 | 生产容量压测、JDK 所有版本差异 |
| [缓存一致性](../backend/cache-outbox.md) | 四种时序、提交边界、TTL 起算、可靠事件、版本水位、具体追问答案 | Redis/MySQL 故障集成测试与实际陈旧分布 |
| [RAG 检索](../ai/rag-lab.md) | 编码器对比、切块反例、RRF 计算、ANN 排障、指标与消融 | 真实模型或语料上的质量提升 |
| [工具调用](../agent/tool-contracts.md) | 执行分层、不同 ID、输入输出契约、错误/取消、MCP 版本纠正 | 完整 SDK/宿主兼容性和生产鉴权实现 |

页面中的 `content_status: source-reviewed` 仅用于本轮逐项阅读了相关来源的这四篇。它不表示无误证明，也不代表未运行的实验已经通过；代码运行与构建情况以 PR 的实际检查记录为准。

## 通用知识体系仍然有哪些缺口？

以下是下一轮审阅应覆盖的范围，**不是已经完成的内容清单**。现有概览可以作为入口，但不能代替具体问题的解答。

| 模块 | 需要深化或补齐的典型内容 | 现有入口 |
| --- | --- | --- |
| Java 语言与集合 | 泛型擦除、异常语义、HashMap 扩容、ConcurrentHashMap 操作边界 | [后端](../backend/README.md) |
| 并发与 JVM | Condition、ThreadLocal、CompletableFuture、GC 日志与内存诊断 | [并发](../backend/concurrency.md)、[JVM](../backend/jvm.md) |
| Spring 与 MyBatis | 生命周期、循环依赖条件、代理、事务传播、执行器与缓存 | [Spring](../backend/spring.md)、[MyBatis](../backend/spring-mybatis.md) |
| MySQL | B+Tree 与执行计划、联合索引、Read View、锁范围、redo/binlog 协同 | [MySQL](../backend/mysql.md) |
| Redis 与消息 | 底层结构、持久化/复制、热键、大 key、消息顺序与重复消费 | [Redis](../backend/redis.md)、[消息](../backend/messaging.md) |
| OS、网络与排障 | IO 模型、虚拟内存、TCP、HTTP/TLS、连接与线程耗尽 | [网络](../backend/network.md)、[排障](../backend/os-rpc.md) |
| LLM 应用基础 | Attention、位置编码、采样、KV cache、模型适配与结构化输出 | [AI](../ai/README.md) |
| RAG 进阶 | 检索器评估、改写、重排、GraphRAG 的适用边界与更新策略 | [RAG](../ai/rag.md) |
| Agent 与评测 | ReAct/规划、记忆、上下文、框架状态更新、评测任务与真实失败样本 | [Agent](../agent/README.md) |
| 通用系统设计 | 短链、聊天、限流、分布式 ID、通知、文件服务、模型网关 | [场景](../system-design/README.md) |

## 新文章的验收方式

给出一个明确问题和可独立阅读的答案；把原理拆开，给出具体例子或推导；至少解释一个真实成立的反例；追问需要有答案；适用版本和来源对应到相关段落。不同来源有分歧就解释分歧，不隐藏。

不强制字数，不按页数考核。仅新增一段“需考虑成本、安全、幂等”的清单，不算完成一个深入专题。图示只保留能解释依赖、交错或状态的部分，UI 不替代知识内容。
