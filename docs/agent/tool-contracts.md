---
title: 工具契约与调度：MCP、并发、错误和取消
date: 2026-09-05
---

# 工具契约与调度：MCP、并发、错误和取消

> 复习优先级：P0 · 整理与来源核验：2026-09-05

先修：[MCP 概览](./tools-mcp.md)。协议参考：MCP 2026-07-28；以下 JSON 是工具定义示意，不是省略握手后即可发送的完整请求。

<a id="q-agent-03"></a>
## Q-AGENT-03：多个工具调用能否直接并发？

**60 秒回答：** 先判断数据依赖、资源竞争和副作用。两个相互独立的只读查询可在预算内并发；后一步依赖前一步结果时必须等待；对同一业务对象的写动作需要顺序、并发控制或明确的冲突语义。只读不代表便宜，也不代表调用者有权限。

| 调用组合 | 调度策略 | 必须考虑 |
| --- | --- | --- |
| 两个独立 Schema 查询 | 有界并发 | 上游限流、权限、合并错误 |
| 数据源解析 → 查询 | 串行依赖 | 不能猜测未返回的数据源 |
| 同一库存的释放与扣减 | 业务条件更新 | 不能只靠并发调用库 |
| 查询 + 大文件生成 | 独立任务或队列 | 内存、取消、结果生命周期 |

调度限制应包括全局、租户和具体上游资源，避免每个任务并发数很小、总量却无限增长。部分失败应保留成功结果并标明缺失部分，不把空结果、超时和无权限统一转成空列表。

<a id="q-agent-04"></a>
## Q-AGENT-04：怎样写可测试的 MCP 工具契约？

```json
{
  "name": "query_result_page",
  "description": "读取当前用户有权访问的已生成查询结果的一页；不执行新 SQL。",
  "inputSchema": {
    "type": "object",
    "properties": {
      "result_id": {"type": "string", "minLength": 1},
      "offset": {"type": "integer", "minimum": 0},
      "limit": {"type": "integer", "minimum": 1, "maximum": 100}
    },
    "required": ["result_id", "offset", "limit"],
    "additionalProperties": false
  },
  "annotations": {"readOnlyHint": true}
}
```

服务端根据认证身份验证 result_id 所有权、过期时间和可见字段；不能因为模型知道一个 ID 就授权读取。readOnlyHint 是描述性元数据，不是权限执行机制。输出可定义 outputSchema，并把数据、分页游标、截断标记和结果版本分开。

## 错误契约

| 情况 | 处理 | 重试原则 |
| --- | --- | --- |
| 未知方法或不合法协议请求 | 协议错误 | 修正调用，不盲重试 |
| 工具执行失败 | 使用规范规定的工具结果错误形态 | 看具体业务错误是否可重试 |
| 权限不足 | 不泄露数据和凭据 | 需正确授权，不自动升级 |
| 结果已过期 | 告知过期及重新生成条件 | 不静默指向其他人的结果 |
| 上游超时 | 标记未知或临时失败 | 写操作先查证，读操作按预算 |

MCP 2026-07-28 的完整结果形态包含 `resultType`；发送请求还要遵守该版要求的 `_meta` 等协议元数据。工具定义并不涵盖完整传输实现，应由匹配版本的 SDK 处理，而不是复制旧版 JSON-RPC 示例后宣称兼容。

## 取消语义

用户取消后先阻止新动作，再向可取消的正在执行操作传播取消信号。已经提交的数据库事务或远端业务不能因 HTTP 连接关闭而被视为撤销。任务应明确 CANCEL_REQUESTED 与实际终止状态，保留已发生的副作用，必要时进入补偿。

## 分层追问与测试

相同业务键不同参数怎么办？模型伪造 tenant_id 会怎样？返回一万行时怎样分页、外置和回读？测试正常页、空页、负 offset、超大 limit、额外参数、过期资源、越权资源和上游超时；契约测试之外还需做真实 SDK/传输集成测试。

## 参考资料

- [MCP 2026-07-28：Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- [JSON Schema：Object](https://json-schema.org/understanding-json-schema/reference/object)
- [gRPC：Cancellation](https://grpc.io/docs/guides/cancellation/)
