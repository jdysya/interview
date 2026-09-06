---
title: 内容更新与核验范围
---

# 内容更新与核验范围

日期表示具体整理范围，不代表公司真题日期，也不代表全站全部内容已经重新核验。

## 2026-09-06：新增 AI Agent 开源教学项目导航

新增 [AI Agent 开源教学项目导航](../agent/learning-resources.md)。本轮不是追加一页 `awesome list`，而是实际读取候选项目 GitHub README 后，按“是否有明确学习顺序、是否提供可运行代码或 Notebook、当前完成度、适用阶段和限制”重新分类。

资源页覆盖六类材料：系统教材与完整课程、从零实现 Agent / Coding Agent Harness、MCP / A2A / Skills、RAG / Memory / Agent 生产化、LLM 基础与系统工程，以及只适合作为导航或案例库的仓库；同时给出从零 Agent、AI Application Engineering、Coding Agent Harness、RAG / Research Agent 和面试复习五条学习路径。

本轮特别保留了项目边界：对 WIP、MEAP、外部付费课程配套代码、framework-specific、vendor-specific 和“根据公开可观察行为复现”等状态明确标注，不把 GitHub Star、作者宣传中的 production-ready / best practice / 高频面试等表述当成本站结论。技术机制仍需回到官方规范、源码、论文或实验核验。

同步修改 Agent 首页、VuePress 侧边栏与 [资料来源与核验方法](./sources.md)，让新导航可发现且能追溯本轮筛选证据。

## 2026-09-05：纠正通用定位，按公开资料重写核心章节

用户指出此前内容过于笼统，且偏向个人知识与业务案例。本轮将主线改回通用面试知识：首页和学习路线不再围绕数据库 Agent、库存和审批组织；原有案例作为教学附录保留，不删除稳定链接。

重写四篇既有页面，而不是继续增加大量浅层文章：

| 页面 | 内容变化 |
| --- | --- |
| [线程池](../backend/jmm-threadpool.md) | 补 happens-before 推导、AQS、参数关系、提交序列、Future 与拒绝/停机反例 |
| [缓存一致性](../backend/cache-outbox.md) | 展开四种时序、事务提交、TTL 起算、延迟双删、Outbox/CDC、版本水位 |
| [RAG 检索](../ai/rag-lab.md) | 编码器对比、切块反例、RRF 手算/实现、ANN 与过滤、评测计算 |
| [工具调用](../agent/tool-contracts.md) | 分层职责、ID、输入输出契约、依赖、错误/取消与 MCP 版本差异 |

新增 [公开资料对照与内容缺口](./coverage-audit.md)，明确未完成项。维护约定加入“不按用户记忆选题、先搜索阅读再写、分别记录选题与技术依据、追问必须有答案”的规则。只有本轮四篇添加 source-reviewed 标记，其他页面不做批量改日期。

本轮具体纠正：MCP 2026-07-28 规范采用逐请求版本元数据，不应继续笼统地要求所有调用先进行旧版 initialize 握手。参见 [官方版本说明](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning)。协议片段依然需要匹配的完整传输封装和 SDK，不把 JSON 解析当成集成验证。

新增示例检查提取正文中的 RRF Python 和完整 Java Future 反例运行。运行结果以对应 PR 的 Actions 为准；构建通过不说明全站内容质量已经合格。未声称完成真实 RAG 实验、Redis/MySQL 故障集成测试或完整 MCP Server。

## 历史记录：首版与第一次扩充

首版建立五个主题与 36 篇专题。第一次扩充增加后端 8 篇、AI 4 篇、Agent 3 篇，算法由 9 道扩展到 30 道，并加入 9 种 SVG、36 道自测题和三个案例。

这些数字保留为变更事实，不作为质量结论。之前的目录和测试覆盖不能替代完整机制解释，后续应逐篇审阅，而不是继续按页数扩张。

## 更新原则

实际阅读对应资料才更新核验记录；先修正影响答案的错误，再补机制、反例和比较。未验证的设计、实验步骤与已运行代码始终分开。
