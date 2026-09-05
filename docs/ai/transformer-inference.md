---
title: Transformer 与推理：从 Attention 到资源预算
date: 2026-09-05
---

# Transformer 与推理：从 Attention 到资源预算

> 复习优先级：P0 · 整理与来源核验：2026-09-05

先修：[LLM 基础](./llm-basics.md)。范围：常见自回归 Transformer 的教学模型，不假设所有新架构都使用相同 Attention 或 KV cache。

<a id="q-ai-01"></a>
## Q-AI-01：Q、K、V 分别是什么？

**60 秒回答：** 输入表示通过投影得到 Query、Key 和 Value；Query 与 Key 的匹配得到权重，再对 Value 加权聚合。常见缩放点积 Attention 可写为 `softmax(QKᵀ / sqrt(dk) + mask)V`。自回归生成需要限制对未来位置的访问，位置编码提供顺序信息，多头机制让不同子空间分别建立联系。

## 一个不依赖训练的计算例子

假设某个 Query 对两个 Key 的缩放得分是 `[0, ln(3)]`，softmax 后权重为 `[0.25,0.75]`。两个 Value 分别是 `[2,0]` 和 `[0,4]`，加权结果是 `[0.5,3]`。注意权重来自 Q/K，聚合内容来自 V；不能把三者说成“问题、知识库、最终答案”这样的固定业务对象。

位置编码、归一化、残差和前馈网络也是完整层的一部分。RoPE 影响位置相关的表示关系，不意味着模型真正拥有无限长、同等质量的上下文。

<a id="q-ai-02"></a>
## Q-AI-02：模型能装进内存就能高并发吗？

不能。权重之外还要考虑 KV cache、激活与临时缓冲、运行时开销。prefill 处理输入序列，decode 逐步生成；吞吐、首 Token 延迟、Token 间隔和整任务耗时应分开记录。请求排队和工具执行也会影响用户体验。

常见全注意力实现的未量化 KV cache 粗估为：

```text
KV 字节 ≈ 并发序列数 × 序列长度 × 层数
        × KV heads × head_dim × 每元素字节 × 2（K 和 V）
```

教学假设：32 层、8 个 KV heads、head_dim=128、长度 8192、每元素 2 字节，每序列约 1 GiB；4 个这样的序列约 4 GiB。这里没有计算分页碎片、共享前缀、滑动窗口、混合架构和其他缓冲，不是具体模型的部署承诺。

权重粗估也应区分 GB 与 GiB。FP16/BF16 约为每参数 2 字节；4bit 量化还会有 scale、未量化层与运行开销，不能把参数数乘 0.5 当作完整显存需求。

## 三类缓存的边界

| 缓存 | 复用对象 | 必须控制什么 |
| --- | --- | --- |
| 单请求 KV cache | 已处理前缀的注意力状态 | 长度、模型架构与缓存精度 |
| Prefix cache | 匹配前缀的部分计算 | 输入一致性、隔离策略、驱逐与复用率 |
| 答案缓存 | 业务输出 | 权限、时效、参数和语料版本 |

<a id="q-ai-03"></a>
## Q-AI-03：RAG 与 LoRA 如何选择？

频繁变化、要求来源的知识优先考虑检索或业务工具；稳定的格式、风格和任务行为可以评估 SFT/LoRA。LoRA 用低秩更新减少可训练参数，不代表无需高质量数据或评测；QLoRA 在量化基础模型上做参数高效训练，其训练和推理资源边界也要分别核算。

先做无需训练的基线，再比较改动收益。模型幻觉、检索缺证据和权限缺失不是同一种失败，不能靠微调一揽子解决。

## 分层追问与实验

为什么 KV heads 和 attention heads 可能不同？增加 batch 为什么可能提高吞吐却损害交互延迟？低 temperature 能保证事实正确吗？固定语料、Prompt、输出长度和预算，分别测短输入/长输入、单请求/并发；保存模型版本、量化方式、硬件、预热策略和原始耗时，不直接比较来源不同的 tok/s。

关联：[服务优化](./serving.md)、[评测实验](./evaluation-lab.md)。

## 参考资料

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [LoRA](https://arxiv.org/abs/2106.09685)
- [QLoRA](https://arxiv.org/abs/2305.14314)
- [vLLM：Automatic Prefix Caching](https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/)
