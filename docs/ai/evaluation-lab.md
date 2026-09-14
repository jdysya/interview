---
title: 评测实践：数据集、评分器与发布门槛
date: 2026-09-14
content_status: source-reviewed
---

# 评测实践：数据集、评分器与发布门槛

> 复习优先级：P0 · 整理与来源核验：2026-09-14

先修：[评测概念](./evaluation.md)。目标：可以亲手计算指标，知道哪些分母不应该混在一起。

选题对照 [Hello Agents 的 RAG 与评测问题](https://github.com/datawhalechina/hello-agents/blob/main/Extra-Chapter/Extra01-%E9%9D%A2%E8%AF%95%E9%97%AE%E9%A2%98%E6%80%BB%E7%BB%93.md)。本文不评选模型名次，而是回答一个通用面试场景：候选系统平均分提高了，能否证明值得上线？所有表格样本、费用与门槛都是原创合成例子。

<KnowledgeDiagram name="evaluation" />

<a id="q-eval-01"></a>
## Q-EVAL-01：Recall、MRR 与无答案题如何计分？

**60 秒回答：** Recall@K 是前 K 个结果里召回的相关项占全部已标注相关项的比例；MRR@K 对每题取前 K 项中第一个相关结果的倒数排名，再求平均。无答案题没有相关项，不能随意令其 Recall=1 拉高均分，应单列拒答指标。

例：相关集合为 `{A,C}`，Top-3 为 `[B,C,D]`，Recall@3=1/2，RR@3=1/2。若 `[C,A,D]`，Recall=1、RR=1。相关标签不完整会限制指标解释。

### 同一个 Recall 为什么能算出两个数？

| 问题 | 标注相关证据数 | Top-K 命中数 | 每题 Recall |
| --- | --- | --- | --- |
| q1 | 2 | 1 | 1/2 |
| q2 | 8 | 2 | 1/4 |

按题平均（macro）为 `(1/2+1/4)/2=0.375`；把相关项合并计算（micro）为 `(1+2)/(2+8)=0.3`。二者分别强调“每个问题同权”和“每份相关证据同权”，必须说明聚合口径。MRR 只关心第一个相关结果：需要两个证据才能回答的题，即使 MRR=1，也可能漏掉另一条关键证据。排名指标及跨问题汇总的背景见[信息检索教材 S1](https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-ranked-retrieval-results-1.html)。

### 无答案题要与“拒答过多”一起看

先固定可回答的含义：在该身份、时间范围与证据集合下，参考标注是否足以作答。没有人工标注不等于没有答案；“该用户无权限”也不等于“数据库不存在答案”。

下面是合成的 10 题混淆矩阵：

| 金标准 | 实际作答 | 实际拒答 | 分母 |
| --- | --- | --- | --- |
| 可回答 | 5 | 1 | 6 |
| 应拒答 | 1 | 3 | 4 |

- 应拒答题的拒答率：`3/4=75%`。
- 可回答题的误拒率：`1/6≈16.7%`。
- 非拒答覆盖率：`6/10=60%`，不等于答案正确率。
- 若只报告第一个指标，一个“永远拒答”的系统能得 100%；它在可回答题上却全部误拒。

这些标签也不能判断已作答内容是否真实，必须另做事实与证据评分。不要把未知金标准偷偷归入应拒答集合，以免改变评测任务。

## 本站可运行实验

仓库 `examples/engineering_checks.py` 提供合成 JSONL 的读取、Recall/MRR/拒答统计和断言；命令见 [实验总览](../projects/experiments.md)。数据位于 `examples/eval-cases.jsonl`，不需要模型 API Key。

```json
{"id":"demo-1","relevant":["A","C"],"retrieved":["B","C","D"],"abstained":false}
```

该字段仅表示检索排序与拒答行为，不能据此计算事实正确率、引用支持性或真实业务完成率。当前合成 fixture 约定 `relevant=[]` 就是已标注的应拒答题；真实数据必须另有明确的可回答性标注。去重召回列表后再计分，避免重复 ID 贡献多次命中。K 必须为正整数；格式错误、重复题目 ID 应作为数据错误拒绝，而不是悄悄跳过。

<a id="q-eval-02"></a>
## Q-EVAL-02：Judge 分数提高能直接上线吗？

不能。Judge 可能偏好某种表达、长度或候选顺序，也可能共享被评模型的错误。需要明确 rubric、人工校准和关键失败门槛。代码运行、JSON Schema、权限、证据 ID 等能确定性检查的部分先用程序，不让 Judge 给越权结果打高分后抵消安全失败。

[MT-Bench/Chatbot Arena 原论文 S2](https://arxiv.org/abs/2306.05685)讨论了位置、冗长与自我偏好等偏差；这是具体历史实验中的发现，不代表任何当前 Judge 的固定错误率。可以这样校准：

1. 隐去候选身份，随机交换 A/B 顺序；若交换后赢家反转，记录为顺序敏感样本，不直接当成可靠胜负。
2. 用人工已裁定的正确、部分正确、错误与拒答样本校准 rubric；分开看误判类型，不能只报告总一致率。
3. 给评分器展示必要的原始证据，要求短理由和证据位置；不要求收集模型私有思维链。
4. 将候选回答当成待评数据，隔离其中要求 Judge 改分的指令。结构化输出和证据定位可做程序检查，但不构成防注入的完整证明。

这些是本站依据偏差类型整理的控制措施，不能宣称“换两个 Judge 投票就消除了偏差”。多个评分器仍可能共享偏好或错因。

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

## 同一批题配对比较，才知道改对了什么

把“正确完成且没有硬失败”记为 1，否则记为 0。同一数据集、工具快照和预算上比较两个系统：

| 六个合成任务 | 基线 A | 候选 B | 差值 B−A |
| --- | --- | --- | --- |
| q1 | 1 | 1 | 0 |
| q2 | 1 | 0 | −1 |
| q3 | 0 | 1 | 1 |
| q4 | 0 | 1 | 1 |
| q5 | 1 | 1 | 0 |
| q6 | 0 | 0 | 0 |

A 为 3/6，B 为 4/6，点估计提高约 16.7 个百分点，但同时修好 2 题、退化 1 题。若 q2 是越权访问，整体提升不能抵消它；六道题也不足以推出广泛的质量保证。

**不确定性怎么估计？** 一种选择是按任务 ID 做 paired bootstrap：每次有放回抽取任务索引，并用同一组索引抽 A/B，重新计算均值差。不要分别抽样打散配对。SciPy 的 `paired=True` 文档明确使用同一组索引。[S3](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.bootstrap.html)

若每题运行多次，先定义希望估计的是每题平均表现还是每次尝试表现；对同一会话的多轮结果不能假装相互独立。按任务或会话成组重采样，是保留依赖关系的设计选择。区间包含 0 只能说明这些数据尚不能清楚区分差异，不等于证明两者相同；区间不含 0 也不能替代收益大小、安全性与成本判断。

## pass@k 和 pass^k 不是同一个“成功率”

前者关心 k 次中至少一次成功，后者关心 k 次全部成功。只有假设每次相互独立、成功概率均为 p 时，才可写成 `1-(1-p)^k` 和 `p^k`。以 p=0.8、k=3 为例，分别是 99.2% 与 51.2%。真实任务难度不同、重试又可能依赖前次错误，不能把全体平均 p 直接代入当作实测指标。[Agent 评测 S4](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

教学计算：若某题有 n 次独立同分布采样、其中 c 次通过，随机选 k 份已采样结果，可以用组合计数计算至少一次通过的估计 `1-C(n-c,k)/C(n,k)`。这不保证产品有能力自动选出那份正确结果，也不把额外尝试算成免费。交互式连续修正应单独定义预算与整条轨迹成功标准。

以下 Python 仅用标准库，检查上述手算、参数边界和配对退化计数；不调用模型，不进行置信区间估计。

```python
from math import comb, isclose


def at_least_one(n, c, k):
    if any(type(x) is not int for x in (n, c, k)):
        raise ValueError("integer counts required")
    if not (0 <= c <= n and 1 <= k <= n):
        raise ValueError("require 0 <= c <= n and 1 <= k <= n")
    return 1.0 if n - c < k else 1 - comb(n - c, k) / comb(n, k)


def paired_summary(a, b):
    if not a or len(a) != len(b):
        raise ValueError("nonempty paired results required")
    if any(type(x) is not int or x not in (0, 1) for x in a + b):
        raise ValueError("binary integer scores required")
    gained = sum(x == 0 and y == 1 for x, y in zip(a, b))
    lost = sum(x == 1 and y == 0 for x, y in zip(a, b))
    return gained, lost, (gained - lost) / len(a)


assert isclose(((1/2) + (2/8)) / 2, 0.375)
assert isclose((1+2)/(2+8), 0.3)
assert isclose(at_least_one(5, 2, 2), 0.7)
assert at_least_one(5, 0, 2) == 0
assert at_least_one(5, 5, 2) == 1
assert at_least_one(5, 1, 5) == 1
assert isclose(at_least_one(5, 2, 1), 2/5)
assert paired_summary([1, 1, 0, 0, 1, 0], [1, 0, 1, 1, 1, 0]) == (2, 1, 1/6)
for args in [(0, 0, 1), (3, 4, 1), (3, 1, 0), (3, 1, 4), (True, 1, 1)]:
    try:
        at_least_one(*args)
    except ValueError:
        pass
    else:
        raise AssertionError("invalid counts accepted")
for a, b in [([], []), ([1], [1, 0]), ([2], [1])]:
    try:
        paired_summary(a, b)
    except ValueError:
        pass
    else:
        raise AssertionError("invalid pairs accepted")
print("Evaluation teaching model: macro/micro, pass@k and paired counts passed")
```

## 一份可审计的发布决策

| 门槛 | 要看的证据 | 不足时怎么做 |
| --- | --- | --- |
| 数据可比 | 固定题集版本、证据快照、Judge/rubric 与运行配置 | 不把新题集分数与旧题集直接相减 |
| 安全与约束 | 越权、伪造引用、破坏性动作等硬失败逐项记录 | 修复或阻止发布，不能靠均分抵消 |
| 质量与切片 | 配对增益/退化、样本量、无答案和长文等切片 | 看失败原始记录，补有代表性的样本 |
| 成本与延迟 | 端到端分位数、重试/检索/Judge 成本、人工接管 | 限流、降级或收缩适用范围 |

数据集分成开发集、回归集和保留评估集，固定版本后运行；看过保留题的失败再改 Prompt，这些题就参与了开发，不应继续称完全未见。LangSmith 提供 splits、metadata 与 version 管理，但平台允许怎么分组，不等于统计上怎么分组都合理。[S5](https://docs.langchain.com/langsmith/evaluation-concepts)

## 分层追问与验证

**为什么均分上涨也不能上线？** 改善可能集中在大量简单题，少量高风险题反而退化。应同时检查质量切片与硬失败，且保留每个退化案例。

**成功任务成本如何算？** 一种明确的运营口径是“全部尝试总成本 ÷ 成功完成任务数”，包括失败与重试的开销。若花 12 元完成 8 个任务，就是 1.5 元/成功任务，而不是只算成功那次模型调用；全失败时分母为零，指标不可计算。人工成本可单列，不能混进 Token 单价而不说明。

**工具超时样本可以删掉吗？** 不应静默删除。对端到端可用性，超时是失败；如果另报排除基础设施故障的条件成功率，也要同时给排除数量、原因与原始总体指标。

**怎样证明不是评测器坏了？** 用已知正确的参考执行验证能通过，再用缺证据、错误参数、越权和格式错等负例验证能失败；人工抽查评分器分歧最大的样本。最终文本说完成并不能代替数据库或文件状态验收。[S4](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

## 参考资料

- S1：[Introduction to Information Retrieval：Evaluation of ranked retrieval results](https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-ranked-retrieval-results-1.html)：排名评价与按查询汇总的背景；本文另行写出 macro/micro 手算。
- S2：[Zheng 等，Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685)：Judge 偏差与人工对照；不外推历史实验数值到当前所有模型。
- S3：[SciPy bootstrap](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.bootstrap.html)：配对重采样、区间方法与退化样本限制；本文没有运行 SciPy 或声称统计显著。
- S4：[Anthropic：Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)：任务/尝试/结果、评分器、pass@k 与 pass^k。本文合成例子不属于其模型实验。
- S5：[LangSmith Evaluation concepts](https://docs.langchain.com/langsmith/evaluation-concepts)：数据集版本、切分与人工反馈。核验日期 2026-09-14；不依赖具体 SDK 代码。

验证边界：仓库执行合成 fixture 与本页 Python 算术断言；未运行真实模型评测、Judge 人工校准、置信区间实验或线上 A/B 测试。
