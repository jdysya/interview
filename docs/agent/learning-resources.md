---
title: AI Agent 开源教学项目导航
---

# 📚 AI Agent 开源教学项目导航

> 核验日期：2026-09-06。这里优先收录 **有章节或渐进式实验、能看到真实代码、可以按路径学习** 的公开仓库，而不是简单堆砌 `awesome list`。Agent 生态更新很快，运行前仍应检查上游 README、依赖版本和官方文档。

`public GitHub repository` 不自动等于“可任意商用或再分发”。本页所说“开源教学项目”主要指教材、代码或 Notebook 对公众可获取；具体 License 以各仓库当前 `LICENSE` / 内容协议为准。

## 先看哪几个

如果不想一次打开几十个仓库，可以先从下面 10 个开始：

| 项目 | 最适合学什么 | 为什么值得先看 |
| --- | --- | --- |
| [bojieli/ai-agent-book](https://github.com/bojieli/ai-agent-book) | Agent 原理 + 工程实践 | 中文系统教材，正文、配图和大量实验放在同一仓库；适合建立整体框架 |
| [datawhalechina/hello-agents](https://github.com/datawhalechina/hello-agents) | 从 Agent 范式到 Memory、MCP、评测和项目 | 中文完整课程，理论、框架、自研 Agent、综合项目和面试补充比较齐全 |
| [microsoft/AI-Agents-for-Beginners](https://github.com/microsoft/AI-Agents-for-Beginners) | Agent 入门与设计模式 | Microsoft 官方课程，章节化、配 Notebook，并提供多语言版本 |
| [huggingface/agents-course](https://github.com/huggingface/agents-course) | Agent framework、Agentic RAG、评测 | Hugging Face 官方课程，包含 `smolagents`、LlamaIndex、LangGraph 和最终项目 |
| [shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) | Coding Agent / Agent Harness | 不只调用框架，而是从 Agent loop、工具、上下文、权限等角度理解现代 coding agent |
| [langchain-ai/langgraph-101](https://github.com/langchain-ai/langgraph-101) | LangGraph、Deep Agents、HITL | LangChain 官方 hands-on 课程，从基础 Agent 到 multi-agent、research agent 和 Deep Agents |
| [microsoft/mcp-for-beginners](https://github.com/microsoft/mcp-for-beginners) | MCP Server / Client / 安全 | Microsoft 官方 MCP 课程，覆盖 Python、Java、TypeScript、C#、Rust 等多语言 |
| [DataTalksClub/llm-zoomcamp](https://github.com/DataTalksClub/llm-zoomcamp) | RAG → Agentic RAG → 评测 → 监控 | 偏 AI application engineering，能补足“Agent demo 如何变成可评估系统” |
| [NirDiamant/RAG_Techniques](https://github.com/NirDiamant/RAG_Techniques) | 高级 RAG 技术 | 42+ runnable notebooks，适合按具体检索问题查缺补漏 |
| [NirDiamant/Agent_Memory_Techniques](https://github.com/NirDiamant/Agent_Memory_Techniques) | Agent Memory | 30 个 runnable notebooks，覆盖短期、长期、图记忆、框架和生产模式 |

## 1. 系统教材与完整课程

这些项目最接近 `ai-agent-book`：有明确学习顺序，而不是只给若干独立 demo。

| 项目 | 形式 / 语言 | 重点 | 适合阶段 | 注意点 |
| --- | --- | --- | --- | --- |
| [bojieli/ai-agent-book](https://github.com/bojieli/ai-agent-book) | 书 + 实验 / 中文 | Context、Tools、Memory、Coding Agent、评估、训练等 | 入门 → 进阶 | README 当前正在进行 2.0 结构调整，已发布 PDF 与 main 分支章节可能暂时不同步 |
| [datawhalechina/hello-agents](https://github.com/datawhalechina/hello-agents) | 在线书 + 代码 / 中文 | ReAct、Plan-and-Solve、Reflection、RAG、Memory、Context Engineering、MCP/A2A、Agentic RL、评测 | 入门 → 进阶 | 内容覆盖很广，建议优先把 Agent loop、Tools、Context、Eval 学扎实，再看低代码/多 Agent |
| [microsoft/AI-Agents-for-Beginners](https://github.com/microsoft/AI-Agents-for-Beginners) | 课程 + Notebook / 多语言 | Agent 基础、设计模式、工具、Agentic RAG、Planning、Multi-Agent、协议 | 入门 | 官方课程仍会随 Microsoft AI 技术栈演进，示例 API 要以当前分支为准 |
| [huggingface/agents-course](https://github.com/huggingface/agents-course) | 课程 + Notebook / 英文 | Agent fundamentals、`smolagents`、LlamaIndex、LangGraph、observability/eval、Agentic RAG | 入门 → 中级 | 更偏“用框架构建”，底层 runtime 机制需要配合 from-scratch 项目学习 |
| [DataTalksClub/llm-zoomcamp](https://github.com/DataTalksClub/llm-zoomcamp) | 10 周课程 + 作业 / 英文 | Agentic RAG、Vector Search、Orchestration、Evaluation、Monitoring、Hybrid Search、Rerank | 中级 | 主线是完整 LLM application，而非纯 Agent；恰好适合补生产化能力 |
| [ed-donner/agents](https://github.com/ed-donner/agents) | 6 周课程代码 / 英文 | OpenAI Agents SDK、CrewAI、LangGraph、AutoGen、MCP | 入门 → 中级 | 部分教学叙事来自配套视频/课程，仓库本身更像 code-along 材料 |
| [langchain-ai/langgraph-101](https://github.com/langchain-ai/langgraph-101) | 官方 Notebook / 英文 | 101 基础、Middleware、HITL、Guardrails、Email Agent、Multi-Agent、Research、Deep Agents | 中级 | Framework-specific；适合在理解 Agent 基础后学习 LangGraph 当前工程范式 |
| [datawhalechina/easy-langent](https://github.com/datawhalechina/easy-langent) | 在线书 + 实战 / 中文 | LangChain、LangGraph、RAG、State、Multi-Agent、综合项目 | 入门 → 中级 | 重点是 LangChain/LangGraph；若 LLM/Agent 基础薄弱，先看 Happy-LLM / Hello-Agents |
| [datawhalechina/deepagents-in-action](https://github.com/datawhalechina/deepagents-in-action) | 在线书 + 模板实验 / 中文 | Agent Harness、Deep Agents、Context Engineering、Sandbox、Skills、LangGraph | 中级 → 进阶 | 强依赖 Deep Agents 版本；仓库对最低版本有明确说明，运行时必须按章节锁版本 |
| [didilili/ai-agents-from-zero](https://github.com/didilili/ai-agents-from-zero) | 系统教程 + 项目 / 中文 | LLM、LangChain/LangGraph、RAG、MCP、Skills、部署、微调、面试 | 入门 → 求职 | 内容偏岗位导向；其中“面试高频/真实面试”等表述不能当统计事实使用 |
| [Haozhe-Xing/agent_learning](https://github.com/Haozhe-Xing/agent_learning) | Roadmap + 教程 / 中英 | RAG、Tool Use、Memory、MCP、Multi-Agent、Eval、Deployment、Agentic RL | 入门 → 进阶 | 包含自动追踪 arXiv 的内容，前沿更新适合发现线索，不替代论文和官方文档核验 |
| [Annyfee/agent-craft](https://github.com/Annyfee/agent-craft) | 15 模块代码课 / 中文 | Function Calling、LangChain、RAG、LangGraph、MCP、Agents SDK、Streamlit | 入门 → 中级 | 核验时 01–13 已开放，综合实战与部署章节仍标记为 WIP |
| [m12305/Langchain-LangGraph-agent](https://github.com/m12305/Langchain-LangGraph-agent) | 章节 + 独立 Demo / 中文 | LangChain/LangGraph、Memory、Tools、RAG、Context、MCP、Observability、Deployment | 入门 → 中级 | 核验时仓库自报 68/81 章节、60 个 Demo；后续阶段仍在建设 |
| [yaoqin5588/langchain_course](https://github.com/yaoqin5588/langchain_course) | 27 节课程代码 / 中文 | LangChain、LangGraph、Memory、Multi-Agent、Deep Agents、Langfuse、部署 | 中级 | 框架 API 变化快，适合跟着当前代码做，不宜把具体 API 形态背成长期知识 |

## 2. 从零实现 Agent / Coding Agent Harness

这一组特别适合回答：**Agent framework 外面那层 Harness 到底做了什么？为什么同一个模型换一个 harness 后表现会明显不同？**

| 项目 | 技术栈 | 主要内容 | 备注 |
| --- | --- | --- | --- |
| [shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) | Python / TypeScript | Agent loop、tools、permissions、context、skills、memory、subagents、MCP 等 | 推荐作为 Coding Agent Harness 主线 |
| [Windy3f3f3f3f/claude-code-from-scratch](https://github.com/Windy3f3f3f3f/claude-code-from-scratch) | TypeScript + Python | Agent Loop、工具系统、streaming、权限、4 层 context compression、memory、skills、Plan、Multi-Agent、MCP | 项目明确声明：依据公开可观察行为和通用写法复现，不代表 Claude Code 私有内部实现 |
| [KeWang0622/agent-zero-to-hero](https://github.com/KeWang0622/agent-zero-to-hero) | Python | 20 章、tools、errors、sessions、context、skills、MCP、subagents、tests | 无大框架依赖，适合边写边看测试 |
| [nauvalazhar/build-your-own-ai-coding-agent](https://github.com/nauvalazhar/build-your-own-ai-coding-agent) | TypeScript | Loop、read/search/edit、context compression、permissions、subagents、streaming、concurrent tools、web、persistence | 章节短，适合 TypeScript 工程师快速过一遍 |
| [decodingai-magazine/building-a-coding-agent-from-scratch-course](https://github.com/decodingai-magazine/building-a-coding-agent-from-scratch-course) | Python | Harness、skills、permissions、sandbox、steering、memory、compaction、durable runtime、remote execution、evals | 2026 新课程，内容仍可能快速演进；适合观察较新的 harness 工程实践 |
| [nerdai/llm-agents-from-scratch](https://github.com/nerdai/llm-agents-from-scratch) | Python + Notebook | 自制 Agent framework、MCP、Skills、Memory、HITL、A2A / Multi-Agent | Manning MEAP 配套仓库；核验时部分章节和 capstone 仍为 `Coming soon` |
| [acebot712/agent-from-scratch](https://github.com/acebot712/agent-from-scratch) | Pure Python | Tool use、memory、planning、multi-agent、evals、hardening；配 labs / answers / grader / quiz | 很新的教学仓库，适合作为实验补充，而不是唯一权威来源 |
| [shreshthtuli/build-your-own-super-agents](https://github.com/shreshthtuli/build-your-own-super-agents) | Jupyter / Python | Simple Agent、PydanticAI、Reflection、RAG、GraphRAG、Eval、Multi-Agent、Model Placement | 课程较新，适合专题实验 |

### 建议怎么读 Harness 项目

不要只看最终 `while` loop。每读一个项目，都尝试回答下面这些问题：

1. Model request、tool call、tool result 的协议边界在哪里？
2. Tool schema 由谁校验？危险操作由谁授权？
3. 大工具输出如何落盘、截断或摘要，而不是永久塞进 context？
4. Context compaction 触发条件是什么？压缩后哪些状态不能丢？
5. Session state、task state、long-term memory 是否被混成一个概念？
6. Tool error 是异常终止，还是作为 observation 回到模型？
7. Sub-agent 是否真正需要独立上下文、权限和预算？
8. 如何 trace、replay、eval 一次完整 trajectory？

这些问题可和本站的 [Agent 与 Workflow](./architecture.md)、[工具契约](./tool-contracts.md)、[上下文与长期记忆](./context-memory.md)、[可靠性与安全](./reliability.md)、[Trace 与失败归因](./evaluation.md) 对照学习。

## 3. MCP / A2A / Skills 专题

| 项目 | 重点 | 适合用途 | 边界 |
| --- | --- | --- | --- |
| [microsoft/mcp-for-beginners](https://github.com/microsoft/mcp-for-beginners) | MCP Server / Client、Tools、Resources、Prompts、安全、跨语言示例 | MCP 主线课程 | 具体协议语义仍以当前 MCP Specification 为准 |
| [juleswhite/python-agents-mcp-course](https://github.com/juleswhite/python-agents-mcp-course) | Python MCP、Agent loop、workspace context、错误恢复 | 写第一个 MCP Agent，理解“failing forward” | 是 Coursera 课程配套代码，完整讲解不全在 GitHub |
| [MSKazemi/ai-agent-systems-course](https://github.com/MSKazemi/ai-agent-systems-course) | MCP → A2A → LangGraph → DeepAgent → Code Executor | 将协议、编排和 Agent 组合起来练习 | 课程较新、仓库规模较小，适合作为综合 lab |
| [karanmalik-hvt/mcp-skills-tutorial](https://github.com/karanmalik-hvt/mcp-skills-tutorial) | FastMCP + `SKILL.md`、TODO notebook、grader、安全扫描 | 一天内做 MCP + Skills 实操 | 很新的实践仓库；Skill 约定需要对照目标宿主的当前规范 |

学习 MCP 时不要把“会写一个 FastMCP decorator”当成学完。至少要继续看：transport、capability/version negotiation、tool input/output schema、错误边界、权限、生命周期和客户端如何把工具暴露给模型。

## 4. RAG / Memory / Agent 生产化专题

| 项目 | 重点 | 推荐理由 | 注意点 |
| --- | --- | --- | --- |
| [NirDiamant/RAG_Techniques](https://github.com/NirDiamant/RAG_Techniques) | Chunking、Retrieval、Rerank、GraphRAG、Agentic RAG、Eval 等 | 42+ runnable notebooks，适合按问题找 technique | 更像 technique library，不是严格线性课程 |
| [NirDiamant/Agent_Memory_Techniques](https://github.com/NirDiamant/Agent_Memory_Techniques) | Short/Long-term、Episodic/Semantic、KG、Mem0、Letta、Zep、Graphiti、benchmark | Memory 专题覆盖非常完整 | 第三方 Memory framework 变化快，概念和具体 API 要分开学 |
| [NirDiamant/agents-towards-production](https://github.com/NirDiamant/agents-towards-production) | Stateful workflow、memory、MCP、FastAPI、Docker、security、observability、eval、deployment | 从 demo 补到 production concerns | 含不少 vendor-specific tutorial，产品能力和营销数字需要另行核验 |
| [NirDiamant/GenAI_Agents](https://github.com/NirDiamant/GenAI_Agents) | 50+ Agent 实现和 Notebook | 找 Agent 架构/应用案例很方便 | 更接近案例库，不建议按 README 从头背到尾 |
| [sinanuozdemir/advanced-agentic-ai-in-three-weeks](https://github.com/sinanuozdemir/advanced-agentic-ai-in-three-weeks) | Advanced RAG、multi-hop、MCP、multi-agent、memory、compression、checkpoint、eval | 适合已经会基础 Agent 后做系统实验 | O'Reilly live course 配套仓库；GitHub 公开代码不一定包含全部授课内容 |
| [AmmarMohanna/oreilly-agentic-graphrag](https://github.com/AmmarMohanna/oreilly-agentic-graphrag) | Vector RAG → KG → GraphRAG → Agentic GraphRAG → Evaluation | 5 个 Notebook 串成一个完整对比实验 | 部分 lab 需要外部 API key |
| [gianlucamazza/langchain-rag-tutorial](https://github.com/gianlucamazza/langchain-rag-tutorial) | LangChain RAG、15 类高级架构、RAGAS、SQL/Graph/Multimodal、Docker/CI | 适合按架构模式做实现对比 | 社区项目且较新；生产结论需用自己的数据和 eval 验证 |
| [nmadhire-agents/all-things-rag](https://github.com/nmadhire-agents/all-things-rag) | Dense → semantic chunk → rerank → hybrid → benchmark → ReAct → reflection → state | 同一数据集逐步改进，便于看变量差异 | 很新的小型课程，适合实验设计参考 |

## 5. LLM 基础与系统工程补课

Agent 学不好，很多时候不是“缺一个 Agent framework”，而是 LLM、retrieval、serving、evaluation 基础没有补齐。

| 项目 | 重点 | 适合什么时候看 |
| --- | --- | --- |
| [microsoft/generative-ai-for-beginners](https://github.com/microsoft/generative-ai-for-beginners) | 21 lessons：LLM、Prompt、Embeddings、Search、应用生命周期、Open Source Model、Fine-tuning、SLM | 完全没有 LLM application 基础时 |
| [datawhalechina/happy-llm](https://github.com/datawhalechina/happy-llm) | NLP → Transformer → Pretrain LLM → 手写模型 → Pretrain/SFT/PEFT → RAG/Agent | 想把“为什么 LLM 能做这些事”补扎实时 |
| [HandsOnLLM/Hands-On-Large-Language-Models](https://github.com/HandsOnLLM/Hands-On-Large-Language-Models) | O'Reilly 《Hands-On Large Language Models》配套 Notebook | 想用可视化 + Notebook 补 embeddings、Transformer、generation、semantic search 等基础 |
| [mlabonne/llm-course](https://github.com/mlabonne/llm-course) | LLM Fundamentals、LLM Scientist、LLM Engineer，含 fine-tuning / quantization / deployment | 想建立更完整的 LLM 工程地图 |
| [openai/openai-cookbook](https://github.com/openai/openai-cookbook) | API、Tool Use、Structured Output、Eval 等大量示例 | 查具体 OpenAI API pattern；它是 cookbook，不是线性教材 |
| [hassan11196/llm-systems-cookbook](https://github.com/hassan11196/llm-systems-cookbook) | 64 Notebook：GPU、Inference、Serving、RAG、Agents、Eval、Production | 想从 AI application 继续深入 LLM systems engineering；项目很新，适合作为进阶实验集 |

## 6. 只适合当“导航 / 案例库”的项目

这些也很有价值，但不要把它们和完整教材混为一谈。

| 项目 | 类型 | 怎么用 |
| --- | --- | --- |
| [datawhalechina/Agent-Learning-Hub](https://github.com/datawhalechina/Agent-Learning-Hub) | Curated roadmap | 用来找下一阶段要学什么，再回到官方资料/课程深入 |
| [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) | 100+ Agent / Skill / RAG 应用模板 | 用于找应用 pattern、拆解 Tool/Workflow/Skill，不作为 Agent 原理教材 |
| [NirDiamant/GenAI_Agents](https://github.com/NirDiamant/GenAI_Agents) | Agent implementation library | 根据场景挑 1–2 个 Notebook 复现，不需要全部运行 |
| [NirDiamant/agents-towards-production](https://github.com/NirDiamant/agents-towards-production) | Production tutorial library | 碰到 deployment / security / observability / memory 等工程问题时定向查阅 |
| [openai/openai-cookbook](https://github.com/openai/openai-cookbook) | Official cookbook | 需要某个 API / tool / eval pattern 时定向查阅 |

## 7. 按目标安排学习路线

### 路线 A：从零学 Agent

```text
Generative AI / Happy-LLM（选读基础）
        ↓
ai-agent-book 或 Hello-Agents
        ↓
Microsoft AI Agents for Beginners
        ↓
Hugging Face Agents Course
        ↓
自己实现一个最小 Agent + 一个完整项目
```

目标不是“看完四套课程”，而是最后可以不靠框架解释：

```text
Model
  ↓ tool_call
Host Runtime
  ↓ validate / authorize / execute
Tool
  ↓ result
Host Runtime
  ↓ observation
Model
```

### 路线 B：AI Application / Agent 工程

```text
Hello-Agents
    ↓
LangGraph 101 或 Easy-Langent
    ↓
MCP for Beginners
    ↓
LLM Zoomcamp
    ↓
Evaluation + Monitoring + Reliability
```

完成后至少做一个包含 **RAG / Tools / structured output / trace / eval / fallback** 的项目，而不是只做聊天 UI。

### 路线 C：Coding Agent / Agent Harness

```text
ai-agent-book 中 Agent 核心机制
    ↓
learn-claude-code
    ↓
claude-code-from-scratch
    ↓
agent-zero-to-hero / build-your-own-ai-coding-agent
    ↓
自己实现 context compaction、permission、skills、subagent、eval
```

这一条路线最值得关注的是 Harness 的可靠性，而不是“多 Agent 数量”。

### 路线 D：RAG / Research Agent

```text
LLM Zoomcamp
    ↓
RAG Techniques
    ↓
Agentic GraphRAG workshop
    ↓
Advanced Agentic AI / production tutorials
    ↓
固定数据集 + Gold Questions + Retrieval / Answer / Trajectory Eval
```

### 路线 E：面试复习

外部课程用于补案例，本站专题用于压缩成可回答的问题：

- [Agent 与 Workflow](./architecture.md)：什么时候 Agent 比固定 Workflow 更合理？
- [MCP 基础](./tools-mcp.md)：MCP 解决了什么、没有解决什么？
- [工具契约](./tool-contracts.md)：Tool schema、错误、取消、权限和并发怎么设计？
- [上下文与长期记忆](./context-memory.md)：Context、Task State、Long-term Memory 有什么区别？
- [可靠性与安全](./reliability.md)：如何处理重复执行、失败恢复、权限和预算？
- [Trace 与失败归因](./evaluation.md)：为什么不能只评 final answer？

## 8. 读开源教程时的核验规则

### 8.1 不把 Star 当质量证明

Star 只能帮助发现项目，不能证明：

- 技术结论正确；
- 适合生产环境；
- 属于“面试高频”；
- 比低 Star 的项目更先进。

### 8.2 区分三种证据

| 资料 | 可以支持什么 | 不应该支持什么 |
| --- | --- | --- |
| 教学仓库 README | 课程范围、章节、运行方式、作者自己的定位 | 协议规范的最终语义、跨版本保证 |
| Demo / Notebook | 一种可运行实现、API 使用方式 | “生产最佳实践”或普适性能结论 |
| 官方 Spec / Docs / Paper | 协议语义、API 保证、论文实验条件 | 真实面试频率、某公司内部实现 |

因此，本页用于 **选择学习资料**。真正写本站的 MCP、Tool、RAG、Memory 技术结论时，仍然回到官方规范、源码、论文或可复现实验。

### 8.3 Framework 知识和 Agent 原理分开记

例如 LangGraph 的某个 helper API 可能半年后发生变化，但下面这些问题更稳定：

- state 放在哪里；
- 谁决定下一步；
- tool execution 谁负责；
- interruption 怎么恢复；
- side effect 怎么保证幂等；
- context 怎么压缩；
- trace 如何关联一次 run；
- eval 是只看文本，还是看 trajectory。

面试时优先讲后者，再用框架 API 做例子。

## 9. 本页核验范围

本页在 2026-09-06 读取并交叉检查了上述项目的 GitHub 仓库主页 / README，主要核对 **课程结构、是否有代码或 Notebook、当前完成状态、项目自述的适用范围**。其中部分仓库是书籍、Coursera、Udemy、O'Reilly live course 的配套代码；“GitHub 可获取代码”不代表外部课程或书籍正文也免费。

对仍在快速变化的项目，本页显式保留了 `WIP`、MEAP、framework-specific、vendor-specific 等限制。技术机制的事实核验继续遵循本站的 [资料来源与核验方法](../guide/sources.md)。
