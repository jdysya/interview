---
title: Skill 与上下文实验：渐进加载、结果外置和证据保留
date: 2026-09-05
---

# Skill 与上下文实验：渐进加载、结果外置和证据保留

> 复习优先级：P0 · 整理与来源核验：2026-09-05

先修：[Skills](./skills.md)、[上下文与记忆](./context-memory.md)。目标：让工作方法可复用，让压缩效果可测量。

<a id="q-agent-05"></a>
## Q-AGENT-05：Skill 文件怎样约束查询工作流？

**60 秒回答：** Skill 说明何时使用、如何组织工作、必须提供什么证据、何时澄清或停止；工具承担实际执行能力，权限由宿主和服务端约束。Skill 不是替代鉴权的安全边界，也不因为有一份 Markdown 就自动产生自主决策循环。

建议目录：

```text
safe-database-analysis/
├── SKILL.md
└── references/
    └── acceptance.md
```

一个最小 SKILL.md 的内容可以是：

```markdown
---
name: safe-database-analysis
description: 当用户要求根据业务问题定位数据源、执行已授权只读查询并解释结果时使用。
---
# 数据库分析工作方法
先确定时间范围、指标定义和用户授权范围。
通过代码证据定位逻辑表，不猜测生产库名。
查询受控数据源与路由；缺少分片键时评估代价并澄清。
读取必要 Schema，再生成候选 SQL，交由服务端校验。
仅执行校验通过且权限匹配的查询。
保留 SQL、数据版本、结果引用和截断标记。
答案必须说明口径、来源和局限；结果未知或越权时停止。
需要验收细节时再读取 references/acceptance.md。
```

上例是教学模板。宿主是否支持相同加载规则、脚本与资源布局需按实现确认。不要把所有 reference 全量塞入每次 Prompt，也不要把凭据写入 Skill。

<a id="q-agent-06"></a>
## Q-AGENT-06：如何衡量压缩是否丢失关键证据？

把任务目标、约束、状态、已确认事实、来源 ID、未解决问题和副作用记录视为必须保留的信息。大结果原件保存为受控资源，上下文只放 Schema、统计、样本和引用。模型可以按 ID 定向回读，摘要不是唯一事实来源。

## 对照实验

| 条件 | 输入策略 | 应记录 |
| --- | --- | --- |
| A | 原始完整工具输出 | Token 数、延迟、完成情况 |
| B | 结构化提取后输出 | 必要字段是否丢失、任务正确率 |
| C | 摘要 + 原件引用 + 定向回读 | 回读次数、证据恢复率、总成本 |

固定同一任务、工具结果和预算。设计必须使用尾部一条记录、跨页字段关联、早期约束和已执行动作状态的题目，避免只测试摘要本来就容易保留的内容。压缩率只是工程指标，不等于质量提高。

## 结果引用示意

```json
{
  "result_id": "demo-result-17",
  "schema": ["warehouse_id", "sku_id", "available"],
  "returned_rows": 100,
  "truncated": true,
  "summary_scope": "仅针对本次返回的100行，不代表全量",
  "next_offset": 100
}
```

如果工具只返回前 100 行，不能把这些行的求和包装成全库总库存。获取统计时应让确定性工具执行正确范围的聚合，或者明确标注抽样方法与不确定性。

## 失败边界与追问

摘要丢了分片键怎么办？结果引用过期怎么办？长期记忆里的权限已撤销怎么办？删历史消息是否破坏调用和结果配对？不要把任务状态、长期记忆和模型当前输入混为一谈；对必须审计的副作用记录应另行持久化。

## 如何验证

为每个任务写一份“必须保留的事实清单”，比较 A/B/C 是否能正确找回这些事实、引用是否有效、后续动作是否重复。本站提供工作方法和实验协议，尚未提供真实模型的 A/B/C 质量实测，不编造节省百分比。

关联：[数据库 Agent 项目](../projects/database-agent.md)、[评测实践](../ai/evaluation-lab.md)。

## 参考资料

- [Agent Skills Specification](https://agentskills.io/specification)
- [Anthropic：Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [LangGraph：Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
