---
title: RAG 实验：切块、召回、重排与失败定位
date: 2026-09-05
---

# RAG 实验：切块、召回、重排与失败定位

> 复习优先级：P0 · 整理与来源核验：2026-09-05

先修：[RAG 总览](./rag.md)、[检索](./retrieval.md)。目标：把“效果不好”变成能归因、能回归的失败样本。

<a id="q-rag-01"></a>
## Q-RAG-01：怎么证明问题出在切块？

**60 秒回答：** 固定模型、问题、语料和检索预算，检查原文是否含答案、解析是否保留信息、正确证据是否成为可检索单元、是否被召回与重排保留。比较不同切块方案的阶段指标，而不是只看最终回答变好了没有。

<KnowledgeDiagram name="rag" />

## 先建立可以追踪的文档

每个块保留 `document_id / version / chunk_id / heading_path / location / tenant_id / acl`。对于扫描 PDF，先检查 OCR；对于表格，保留列名、单位和必要标题。表格被切碎后，“库存 18”可能失去仓库、SKU 或时间语义，检索调参无法自动恢复这些缺失条件。

| 方案 | 适用起点 | 需要防的失败 |
| --- | --- | --- |
| 固定大小与重叠 | 快速基线、结构较弱文本 | 断句、跨块条件丢失、重复召回 |
| 标题/段落结构切块 | 章节结构明确的文档 | 过短块失去上下文、章节过长 |
| 父子块 | 小块召回、较大证据提供背景 | 父块膨胀、权限或版本不一致 |
| 表格/代码专用处理 | 结构强的数据 | 单位、表头、函数边界被拆断 |

块大小与 overlap 是实验变量，不给所有语料设一个“最佳值”。改变切块后相关性标注也要映射到文档位置，不能沿用已经失效的 chunk ID。

## 实验台账

```json
{
  "query_id": "rag-demo-01",
  "corpus_version": "demo-v1",
  "relevant_evidence": ["doc-1#section-2"],
  "retrieved": ["chunk-8", "chunk-3"],
  "reranked": ["chunk-3", "chunk-8"],
  "context_ids": ["chunk-3"],
  "answer_citations": ["chunk-3"],
  "failure_stage": null
}
```

这是自定义实验记录格式，不是模型供应商 API。日志应保存证据 ID 和必要脱敏内容，不把未授权原文写进共享日志。

<a id="q-rag-02"></a>
## Q-RAG-02：命中了正确证据，为什么仍然答错？

正确块可能在 rerank 后被截掉，或在组装上下文时被预算过滤；也可能多个版本冲突，模型选错证据。即使证据完整，单位换算、时间口径和计算仍可能出错。引用 ID 正确也不代表引用内容支持结论，应把引用存在性与支持性分开验证。

## 最小消融安排

| 实验 | 固定因素 | 唯一改动 | 应观察 |
| --- | --- | --- | --- |
| A | 模型、语料、问题、预算 | 固定块 vs 标题块 | 正确证据可检索率、Recall |
| B | 切块、问题、模型 | 关键词 vs 混合召回 | Recall、低频实体、数字问题 |
| C | 召回候选集合 | 是否重排 | MRR、证据进入上下文比例 |
| D | 最终证据 | Prompt 或生成模型 | 忠实性、拒答、计算正确性 |

## 如何运行与验收

先运行 [评测实践](./evaluation-lab.md) 的离线评分器确认指标逻辑，再接真实检索器。当前仓库的合成数据只是验证评分器，不代表已经测出某种 Embedding 或 Rerank 的业务效果。

验收必须含“无答案、过期版本、未授权文档、表格单位、跨段条件”切片。新增线上坏例时脱敏并版本化，保留集不反复用于调参。

## 分层追问

高 Recall 但延迟超标如何取舍？为什么前十行样本不能代表全部数据？ACL 应在哪里约束？删除文档后向量、原文、缓存和引用分别怎样失效？怎样检测引用了已删除版本？

## 参考资料

- [Azure AI Search：RAG Overview](https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview)
- [Elasticsearch：RRF](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion)
- [RAG 原始论文](https://arxiv.org/abs/2005.11401)
