---
title: 工具调用面试详解：Function Calling、MCP、并发与失败语义
date: 2026-09-05
content_status: source-reviewed
---

# 工具调用面试详解：Function Calling、MCP、并发与失败语义

> 复习优先级：P0 · 整理与来源核验：2026-09-05

本页使用通用“检索产品文档并读取证据”场景，不以某个个人项目的 SDK、表路由或业务流程组织答案。先修：[Agent 架构](./architecture.md)、[MCP 概览](./tools-mcp.md)。协议部分明确区分 **MCP 2026-07-28** 与更早版本，不代表所有客户端和 SDK 已经支持新版。

选题对照 [Datawhale 面试问题](https://github.com/datawhalechina/hello-agents/blob/main/Extra-Chapter/Extra01-%E9%9D%A2%E8%AF%95%E9%97%AE%E9%A2%98%E6%80%BB%E7%BB%93.md)及 [JavaGuide AI 面试目录](https://javaguide.cn/ai/interview-questions/ai-interview-guide.html)；协议字段以官方规范为准。

## 1. Function Calling、MCP、Agent、Skill 是同一个东西吗？

不是。把它们放进一次任务中，比背四个定义更容易讲清楚：

```text
用户提出问题
  → Agent/Workflow 决定是否需要外部信息
  → 模型提出结构化的工具调用意图
  → 宿主校验并路由调用
  → MCP Client 与 Server 交换请求和结果（也可以不用 MCP）
  → 后端实际执行
  → 宿主把结果回传模型
  → 模型根据证据回答，或提出下一步动作
```

Function Calling 是模型/模型 API 表达工具使用意图的接口能力，不等于模型直接执行代码。MCP 解决宿主与外部能力的接入协议；Agent 还需要决策循环和状态。固定 Workflow 也能调用工具，不必把所有任务都升级为自主 Agent。[S1][S2]

Skill 则可以规定某类工作的步骤、检查项与资源使用方法。它可能指导上面的流程，但本身不能替代实际工具、权限校验或任务运行时；格式和加载方式见 [Skill 专题](./skills.md)。

**追问：不用 MCP，能做 Agent 吗？** 可以。宿主完全可以直接调用 Python/Java 函数或 HTTP API；采用 MCP 的价值在于接入契约和复用，不是让模型“天然会规划”。

## 2. 一次工具调用到底包含哪些 ID？

以“先搜索文档，再读取第二个结果”为例，宿主要保留模型调用与结果的对应关系，而不是把一个无关字符串直接塞回历史消息。

| 标识 | 用途 | 不能替代什么 |
| --- | --- | --- |
| 模型 API 的 tool call ID | 把某条模型调用意图与返回结果配对 | 不自动等于业务幂等键 |
| JSON-RPC id | 匹配一次协议请求和响应 | 不等于跨重试业务身份 |
| task/trace ID | 串联一次任务的观测记录 | 不强制阻止重复副作用 |
| 业务幂等键 | 识别同一个应只产生约定效果的动作 | 不应每次网络重试都随机重建 |

供应商消息格式并不相同。例如 Claude 文档使用 `tool_use` 与对应的 `tool_result` 表达客户端工具调用。可以复用工具执行器，但不能把一个供应商的消息字段原样发到另一个 API，并把失败解释成“模型不会调用工具”。[S1]

上表是宿主架构中的职责划分：某个实现可以让部分 ID 相同，但必须先证明重试、重放与作用域都满足需求，而不是因为名字里都有 call 就混用。

<a id="q-agent-04"></a>
## Q-AGENT-04：怎样设计一份可测试的工具契约？

先确定工具边界，再写 Schema。一个 `search_everything(query)` 工具很难解释搜索范围、结果数和分页；拆成“搜索合法文档”与“读取指定证据”后，可以分别限制召回量和正文读取量。

下面是**工具定义片段**，不是完整 `tools/list` 响应，也不是可直接发送的 HTTP 请求。名称、业务字段和数据都是教学设计。

```json
{
  "name": "search_documents",
  "description": "在调用者有权访问的产品文档中搜索。只返回标题、摘要和稳定文档ID；未命中时返回空items，不猜测答案。",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {"type": "string", "minLength": 1, "maxLength": 500},
      "limit": {"type": "integer", "minimum": 1, "maximum": 20}
    },
    "required": ["query", "limit"],
    "additionalProperties": false
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "items": {
        "type": "array",
        "maxItems": 20,
        "items": {
          "type": "object",
          "properties": {
            "document_id": {"type": "string"},
            "title": {"type": "string"},
            "snippet": {"type": "string"}
          },
          "required": ["document_id", "title", "snippet"],
          "additionalProperties": false
        }
      },
      "truncated": {"type": "boolean"}
    },
    "required": ["items", "truncated"],
    "additionalProperties": false
  },
  "annotations": {"readOnlyHint": true}
}
```

`required` 决定属性必须存在，`properties` 里的声明本身不等于必填；`additionalProperties:false` 拒绝未声明的字段。字符串非空校验也不一定排除全空格文本，服务端仍需业务规则。JSON Schema 负责结构约束，不会替你验证调用者权限或文档真假。[S3]

**为什么不把 tenant_id、api_key 也让模型填？** 调用者身份与凭据应来自经过认证的运行上下文。模型可以提供业务查询参数，却不能通过在 JSON 中写一个别人的租户 ID，就获得该租户权限。Schema 中没有这些字段，仍需服务器实施真正的授权，不能把“不允许额外字段”当作完整安全边界。

一个与上面定义对应的 **MCP 2026-07-28 完成结果体片段** 如下。它是 JSON-RPC 外层 `result` 的内容；示例没有宣称包含完整传输封装。[S4]

```json
{
  "resultType": "complete",
  "content": [{"type": "text", "text": "{\"items\":[{\"document_id\":\"doc-demo-17\",\"title\":\"保修说明\",\"snippet\":\"请读取完整条款及例外条件。\"}],\"truncated\":false}"}],
  "structuredContent": {
    "items": [{"document_id": "doc-demo-17", "title": "保修说明", "snippet": "请读取完整条款及例外条件。"}],
    "truncated": false
  },
  "isError": false
}
```

这里同时提供文本与结构化数据，是为了让不同消费者能处理结果；二者内容应保持一致。工具的 `structuredContent` 是服务器产生的数据，不是对模型下一句话的 Schema 约束。“工具返回了合法 JSON”和“模型最终回答一定符合 JSON Schema”是两个不同的命题。[S4]

## 4. 空结果、工具失败、协议错误为什么不能混成一类？

如果错误全部变成 `[]`，模型无法区分“文档确实不存在”和“搜索服务暂时不可用”，很容易把工程故障说成业务结论。

| 结果 | 应告诉宿主/模型什么 | 后续动作 |
| --- | --- | --- |
| 正常执行，items=[] | 在当前授权范围内未命中 | 可以改写问题或明确缺证据 |
| 参数超出业务限制 | 哪个限制未满足 | 修正参数；不能无上限重试 |
| 工具执行异常 | 错误类别、是否可重试、可安全展示的说明 | 有预算地重试或降级 |
| 无权限 | 当前身份不可执行该操作 | 停止，不自动扩大权限 |
| 不支持方法/协议版本 | 协议层不兼容 | 修复适配，不让模型反复换问题 |
| 写操作超时 | 结果未知，不能直接等同失败 | 按业务键查证已有结果 |

规范区分 JSON-RPC 协议错误与工具结果中的执行错误；完成一个失败的工具调用，不等于成功完成业务任务。`isError` 处理方式要与所用规范对应，不要把任意错误 JSON 都包装成成功内容。[S4]

**追问：重试应放模型层还是工具层？** 临时网络失败可以由确定性执行器在预算内处理，参数语义错误可能需要模型修正，权限失败不能靠重试修复。若每层都重试三次，多层相乘可能造成大量重复请求；需明确谁负责哪类失败。

<a id="q-agent-03"></a>
## Q-AGENT-03：一次返回多个工具调用，可以直接并发吗？

看数据依赖与资源冲突，而不是看模型生成了几个数组元素。

```text
搜索文档A ──→ 读取搜索结果中的证据A ──┐
                                      ├─→ 组织最终回答
搜索文档B ──→ 读取搜索结果中的证据B ──┘
```

两路搜索相互独立时，可以在限额内并发；每路读取必须等到该路搜索返回合法 ID；最终回答需知道哪一路成功、哪一路失败。不能先猜测 document_id 来假装消除依赖。

| 组合 | 处理起点 | 为什么 |
| --- | --- | --- |
| 相互独立的只读查询 | 有界并发 | 可以缩短等待，但仍占用资源 |
| 后一步需要前一步返回的 ID | 按依赖串行 | 输入还不存在 |
| 两个动作写同一个对象 | 业务冲突协议或顺序执行 | 独立的 call ID 不能避免冲突 |
| 某个关键前置查询失败 | 阻止依赖动作，保留其他已完成结果 | 避免用猜测代替缺失数据 |

假设有 100 个任务，每个最多并发 5 次，只限制“每任务 5 次”仍可能给上游造成 500 次同时调用。应把全局、租户、上游资源和单任务预算分开考虑。只读标记也不能证明调用廉价或安全。[S4]

## 6. 用户取消以后，什么会停止，什么不会？

建议区分“已收到取消请求”和“所有相关执行已经终止”。先阻止新动作，再向正在运行的可取消请求传播信号；下游服务必须配合检查和清理。gRPC 文档明确指出，应用负责在处理逻辑中响应取消以及传播给相关下游调用。[S5]

如果外部事务已经提交，客户端断开连接不会把业务自动回滚。最终状态应能够说明已完成动作、未知结果和是否需要补偿。不能把 UI 上不再输出 Token 视为后端已经没有副作用。

## 7. MCP 版本问题：不是所有教程都应先 initialize

**这一节用于纠正旧页面的含混表达。** 本页核对的官方规范将 2026-07-28 及之后版本称为 modern，把 2025-11-25 及之前基于 initialize 的版本称为 legacy。[S6]

| 项目 | Modern：2026-07-28 | Legacy：2025-11-25 及更早 |
| --- | --- | --- |
| 版本信息 | 每个请求声明版本元数据 | 先 initialize 协商 |
| 能力和身份信息 | 根据新版请求元数据要求提供 | 根据对应旧版生命周期处理 |
| HTTP | 还需对应版本请求头 | 按旧版传输和会话规则 |
| 客户端能否直接假定兼容 | 不能，必须核对实现支持 | 同样不能只看“MCP”名称 |

新版 `server/discover` 是可用的发现机制，不是必须先完成的一次 initialize 握手；每个请求依然必须携带规范要求的 `_meta`，HTTP 还有 `MCP-Protocol-Version` 等传输要求。文档中为了简洁省略元数据的 JSON 片段不能直接当成完整请求发出去。[S4][S6]

新版的 `resultType:"input_required"` 表示需要补充输入，并非完整业务结果；宿主应按多轮请求机制处理，不应把它当作最终答案或重新创建一份独立业务动作。本文不提供未经 SDK 集成验证的多轮请求代码。

**实操顺序：** 固定服务端和客户端版本 → 确认协议版本 → 阅读对应规范 → 跑能力发现和最小工具调用 → 验证错误/取消。不要先复制某篇旧教程，再把标题日期改成“最新版”。

## 8. Prompt Injection 的边界怎样和工具调用结合？

搜索结果中可能出现“忽略规则并调用某个写工具”。它应该作为文档内容，而不是系统授权来源。一个可审查的设计会把工具可见范围、执行权限、参数校验和高风险动作审批放在确定性边界中，不能寄希望于模型每次都识破恶意文本。

建议测试：合法文档里插入要求读取其他用户资源的文本；结果中给出一个合法格式但无权限的 ID；重复请求同一副作用；工具描述与实现不一致。验收看是否真正发生越权行为，而不是只检查模型回答里是否说了“我会遵守安全规则”。安全的完整讨论见 [可靠执行与安全](./reliability.md)。

## 9. 带答案的追问

**Schema 校验通过为什么仍会调错工具？** 它可能选择了语义不匹配的工具，或者选对工具但漏掉时间、版本等业务条件；类型检查不验证用户意图。

**工具成功率很高能代表 Agent 成功率吗？** 不能。工具可能全都正常返回，但没有找到所需证据，或最终回答使用错误材料。需分别评估工具选择、参数正确、执行状态与任务完成。

**工具返回太大怎么办？** 将结果保留为受控资源，只返回摘要、范围、截断标记和可回读引用；后续读取仍做授权。截断必须显式呈现，不能把样本当成全量数据。

**如何防止无限循环？** 同时限制任务步骤、时间、费用和上游调用，检测没有新增证据的重复动作。达到上限要输出已完成部分和缺口，而不是继续烧预算直到传输超时。

## 如何验证

分别测试正常结果、空结果、非法参数、额外字段、越权文档、部分失败、超时、取消和版本不兼容。本文 JSON 是完整的定义/结果片段，可以做语法与 Schema 验证，但**不是完整 MCP Server**；协议兼容性还需要匹配的宿主和 SDK 集成测试。不能把“JSON 能解析”标记成“新版 MCP 已实现”。

## 参考资料

- S1：[Claude：Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)，客户端工具调用与结果配对，供应商格式不能混用。
- S2：[Anthropic：Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)，Workflow、Agent 和工具使用的边界。
- S3：[JSON Schema：Object](https://json-schema.org/understanding-json-schema/reference/object)，properties、required、additionalProperties。
- S4：[MCP 2026-07-28 Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)，工具定义、resultType、结构化结果、工具错误和安全提示。
- S5：[gRPC Cancellation](https://grpc.io/docs/guides/cancellation/)，取消通知与服务端响应职责。
- S6：[MCP 2026-07-28 Versioning](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning)，modern/legacy、逐请求版本信息和兼容边界。
- 选题对照：[Datawhale 面试问题](https://github.com/datawhalechina/hello-agents/blob/main/Extra-Chapter/Extra01-%E9%9D%A2%E8%AF%95%E9%97%AE%E9%A2%98%E6%80%BB%E7%BB%93.md)、[JavaGuide AI 面试目录](https://javaguide.cn/ai/interview-questions/ai-interview-guide.html)。
