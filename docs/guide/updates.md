---
title: 近期核验与变化
---

# 近期核验与变化

日期记录实际整理与核验范围，不代表公司真题日期，也不声称覆盖所有行业更新。

## 2026-09-05：机制详解、项目与可视化扩充

保留首版 36 篇专题与稳定路径，新增后端 8 篇、AI 4 篇、Agent 3 篇深化内容；增加数据库 Agent、库存预占、审批一致性三条项目主线及实验说明。算法由 9 道扩展到 30 道，新增 ACM 输入与对拍指南。

加入 9 种源代码维护的 SVG 图示、36 道带稳定 ID 的机制自测题，以及三条岗位模拟面试。自评分仅保存当前浏览器，可 JSON 导入导出；图示支持文字替代和窄屏滚动。

工程检查增加：题目锚点和导航、新增算法提取测试与固定种子对拍、SQLite 模拟恢复/库存/缓存/评测测试、Java 线程池饱和实验、桌面和窄屏浏览器交互测试。**运行是否通过以对应提交的 Actions 记录为准**，不以文章中的预期代替测试证据。

未包含：生产数据库平台连接、完整 Spring AI/MCP Server、MySQL 双会话自动化环境、真实模型的 RAG 或上下文压缩 A/B 结果。这些边界同时写入各文章和 [实验说明](../projects/experiments.md)。

## 首版技术核验记录

| 核验项 | 对准备的影响 | 官方来源 |
| --- | --- | --- |
| MCP 2026-07-28 规范 | 标记协议版本，检查 SDK 兼容，不混用旧版握手与结果格式 | [发布说明](https://blog.modelcontextprotocol.io/posts/2026-07-28/) |
| Agent 评估扩展到任务与环境状态 | 验收最终状态、重复运行、成本预算与失败归因 | [Agent evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) |
| Context engineering 与按需加载 | 大结果精简、原件保留、引用回读 | [Context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) |
| JDK 24 虚拟线程 monitor 改进 | 回答 pinning 时区分 JDK 21 与后续版本 | [Java 24 文档](https://docs.oracle.com/en/java/javase/24/core/virtual-threads.html) |

## 本轮新增核验入口

MySQL 8.4 文档用于 MVCC、锁与日志；Java 21 API/JLS 用于语言和线程池；Spring/MyBatis 官方文档用于代理、传播行为和会话；Spring AI Tools 页用于说明不同版本的执行循环边界。每篇文末给出对应原始来源。

## 更新原则

只有实际核验相关内容才更新核验日期。基础算法优先补证明、边界与测试；框架 API 固定版本后再写可运行集成示例。现有页面修改时间不自动等于其中全部技术结论重新核验。
