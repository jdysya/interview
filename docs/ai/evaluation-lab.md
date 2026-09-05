---
title: 评测实践：数据集、评分器与发布门槛
date: 2026-09-05
---

# 评测实践：数据集、评分器与发布门槛

> 复习优先级：P0 · 整理与来源核验：2026-09-05

先修：[评测概念](./evaluation.md)。目标：可以亲手计算指标，知道哪些分母不应该混在一起。

<KnowledgeDiagram name="evaluation" />

<a id="q-eval-01"></a>
## Q-EVAL-01：Recall、MRR 与无答案题如何计分？

**60 秒回答：** Recall@K 是前 K 个结果里召回的相关项占全部已标注相关项的比例；MRR@K 对每题取前 K 项中第一个相关结果的倒数排名，再求平均。无答案题没有相关项，不能随意令其 Recall=1 拉高均分，应单列拒答指标。

例：相关集合为 `{A,C}`，Top-3 为 `[B,C,D]`，Recall@3=1/2，RR@3=1/2。若 `[C,A,D]`，Recall=1、RR=1。相关标签不完整会限制指标解释。

## 本站可运行实验

仓库 `examples/engineering_checks.py` 提供合成 JSONL 的读取、Recall/MRR/拒答统计和断言；命令见 [实验总览](../projects/experiments.md)。数据位于 `examples/eval-cases.jsonl`，不需要模型 API Key。

```json
{"id":"demo-1","relevant":["A","C"],"retrieved":["B","C","D"],"abstained":false}
```

该字段仅表示检索排序与拒答行为，不能据此计算事实正确率、引用支持性或真实业务完成率。去重召回列表后再计分，避免重复 ID 贡献多次命中。K 必须为正整数；格式错误、重复题目 ID 应作为数据错误拒绝，而不是悄悄跳过。

<a id="q-eval-02"></a>
## Q-EVAL-02：Judge 分数提高能直接上线吗？

不能。Judge 可能偏好某种表达、长度或候选顺序，也可能共享被评模型的错误。需要明确 rubric、人工校准和关键失败门槛。代码运行、JSON Schema、权限、证据 ID 等能确定性检查的部分先用程序，不让 Judge 给越权结果打高分后抵消安全失败。

## 一个可执行的评测拆分

| 层 | 数据要求 | 评分方式 |
| --- | --- | --- |
| 检索 | 问题、相关证据 ID | Recall、MRR；需要时另做 graded nDCG |
| 引用 | 声称内容、引用位置、原文 | ID 存在性程序检查 + 支持性标注 |
| 生成 | 参考要点、允许等价答案、拒答条件 | 规则 / 人工 / 校准后的 Judge |
| 工具任务 | 起始状态、允许动作、最终状态 | 验证实际业务状态，不只看最终文本 |
| 工程 | 输入量、输出量、重试、时间戳 | P50/P95、失败率、成功任务成本 |

## Rubric 示意

每项分别记分：事实要点完整性 0–2、证据支持 0–2、时间与单位正确性 0–2。无依据的关键断言、越权访问、伪造引用为单独失败项；不允许靠语言流畅度补偿。保留评分理由和证据，但不要求保存模型私有思维链。

发布门槛应在比较前制定。教学示例可以要求“既有确定性检查全部通过、关键切片不回退、延迟不超项目预算”；具体阈值由业务风险和样本量决定，本站不编造一个通用 95% 指标。

## 分层追问与验证

为什么只报平均分会掩盖问题？同一批题配对比较有什么意义？如何区分抽样波动和实质改进？成本要不要包含重试、检索和人工接管？建立开发集与保留集，保存版本、随机种子和原始结果；合成小样本只用于检查逻辑，不用于宣布统计显著。

## 参考资料

- [LangSmith：Evaluation concepts](https://docs.langchain.com/langsmith/evaluation-concepts)
- [Anthropic：Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
