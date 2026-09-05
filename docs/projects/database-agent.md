---
title: 项目深挖：数据库查询 Agent 的受控执行链路
date: 2026-09-05
---

# 项目深挖：数据库查询 Agent 的受控执行链路

> 复习优先级：P0 · 整理与来源核验：2026-09-05

这是 [场景概览](../system-design/database-agent.md) 的深化版。目标是解释业务数据并提供可追溯证据；非目标是允许模型任意遍历生产库、修改业务数据或代替权限系统。

<KnowledgeDiagram name="database" />

## 需求与不变量

用户给出自然语言问题，Agent 结合代码和授权元数据定位逻辑表与数据源，生成只读查询、验证后执行并解释结果。系统始终满足：身份不能由模型指定；执行范围不能超出授权；SQL 不能因重试绕过校验；答案中的统计不能把截断样本冒充全量。

## 状态与数据模型

```text
CREATED → RESOLVING → SCHEMA_READY → VALIDATED → RUNNING → COMPLETED
             ↓             ↓            ↓          ↓
        NEEDS_INPUT   NEEDS_INPUT     REJECTED    UNKNOWN / FAILED
```

这是教学状态划分。`UNKNOWN` 表示执行状态尚未查明，不等于查询没有发生。每轮保存 task_id、身份引用、代码证据、逻辑表、路由版本、SQL 指纹、校验结果、执行预算与产物引用。

| 对象 | 核心字段 | 目的 |
| --- | --- | --- |
| query_task | task_id、tenant_ref、goal、status、deadline | 任务边界 |
| query_plan | task_id、datasource_id、route_version、sql_hash | 固定待执行计划 |
| query_run | run_id、plan_id、status、started_at、result_ref | 查证与恢复 |
| result_metadata | result_id、owner_scope、expires_at、row_count、truncated | 结果权限和生命周期 |

字段是设计示意，不强制必须拆成四张表；实际可按事务与访问模式合并。

## 工具拆分与返回约束

| 工具 | 输入 | 输出与校验 |
| --- | --- | --- |
| locate_code | 仓库范围、业务标识 | 路径、行范围、逻辑表证据 |
| resolve_datasource | 受控配置引用、环境 | datasource_id；不返回密码 |
| resolve_route | 逻辑表、分片条件 | 路由集合、规则版本、缺少条件 |
| describe_schema | 数据源、允许的表 | 字段、类型、索引、注释 |
| validate_query | SQL、路由、预算 | 固定计划 ID、指纹、校验说明 |
| execute_plan | 校验通过的计划 ID | run_id、执行状态、结果引用 |
| read_result | result_id、页码或聚合请求 | 受控片段、截断与来源 |

校验和执行之间还应防止计划被替换，执行端重新确认权限和计划有效期。把校验结果记在 Prompt 里并不等于执行端受约束。

<a id="q-project-01"></a>
## Q-PROJECT-01：缺少分片键怎么办？

**60 秒回答：** 先判断问题是否可以补充分片条件、是否存在授权聚合数据源，以及全路由的成本和业务必要性。如果缺少关键条件，就澄清或拒绝执行，而不是默认枚举所有生产分片。对有限多路由查询明确并发上限、总超时、结果合并和部分失败语义。

例如“某仓库昨天的盘亏总量”，需要仓库范围、时区、业务日期口径和记录状态。SQL 能运行不等于语义正确；跨分片加总还要检查数据是否重复、分片边界是否迁移、单位是否统一。

## SQL 安全与修复循环

SQL 由模型提出，使用匹配方言的 AST 做语句、对象、函数与多语句校验；数据库使用只读且最小权限的身份，执行端设置超时、扫描和输出限制。LIMIT 限制返回行数，不自动限制 JOIN、聚合或函数成本。

错误修复只在限定次数内发生。把脱敏的字段不存在、类型不匹配反馈给模型，要求生成新计划并重新校验；不能在执行失败后直接换库、扩大权限或删除过滤条件来追求“成功”。

## 容量与预算示例

若教学假设同时有 20 个任务、每任务最多 2 个读工具，也不能只设置每任务并发=2 就结束；还要考虑全局最多 40 个在途工具、单数据源限额、连接池和限流。模型步骤、工具超时、任务 deadline 分层配置。数字是设计练习，不是实际性能成绩。

## 故障与验收

| 用例 | 期待行为 |
| --- | --- |
| 表名猜错、Schema 漂移 | 重新取证或受控修复，不自动访问相似表 |
| 缺分片键 | 明确缺失条件和成本，不静默全路由 |
| 工具返回含“忽略权限” | 当作不可信数据，不改变系统授权 |
| SQL 超时 | 返回真实状态与范围，按预算终止或查证 |
| 结果过大 | 外置原件、明确截断、按权限回读 |
| 用户权限被撤销 | 执行和读取时重新校验，不复用旧授权答案 |

金标准用例同时保存允许的 SQL 语义、期望数据范围和结果样本。执行成功率、语义正确率、权限违规、总成本分别统计。

## 项目追问与实现状态

为何 SDK 能访问动态配置？Skill、工具和 Runtime 分别在哪里？为什么不用一个万能 SQL 工具？查询日志怎样脱敏？怎样证明模型没有越权？本站已提供架构、契约与通用恢复实验；未连接任何实际数据库平台，也没有完整生产 MCP Server。

## 参考资料

- [MCP 2026-07-28：Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- [MySQL 8.4：EXPLAIN](https://dev.mysql.com/doc/refman/8.4/en/explain.html)
- [OWASP：SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
