---
title: Java AI 服务：模型适配、工具边界与流式交付
date: 2026-09-05
---

# Java AI 服务：模型适配、工具边界与流式交付

> 复习优先级：P0 · 整理与来源核验：2026-09-05

目标：用已有 Java 后端知识建立受控 AI 服务，而不是让 Controller 直接把模型输出交给数据库。下文是供应商无关的设计；Spring AI API 需按所选版本另写适配器。

<a id="q-service-01"></a>
## Q-SERVICE-01：怎样隔离模型与业务权限？

**60 秒回答：** Controller 解析并认证用户，应用服务建立服务端身份与预算，模型适配器只负责生成候选回答或动作。工具网关在执行时重新校验权限、参数和业务约束。租户、数据库凭据和允许范围由服务端身份决定，不从模型参数中直接信任。

```text
HTTP 请求 → 身份/限流 → 应用服务 → ModelAdapter
                           ↓ 候选动作
                       ToolGateway → 已授权业务服务
                           ↓
                     状态、审计、结果引用
```

## 接口形状

```java
record Principal(String tenantId, String userId) {}
record QueryRequest(String dataSourceId, String queryId, int maxRows) {}
record QueryResult(String resultId, int returnedRows, boolean truncated) {}
interface QueryGateway {
    QueryResult execute(Principal principal, QueryRequest request);
}
```

示意使用受控 queryId，而不是向初学者提供一个可直接执行任意 SQL 的端点。生产 NL2SQL 应另有生成、AST 校验、权限和预算路径，见 [数据库 Agent](../projects/database-agent.md)。参数正确不等于动作授权；`maxRows` 有上限也不保证扫描成本低。

## 结构化输出不等于语义正确

先校验完整输出格式，再校验字段类型、枚举、范围、字段之间关系，最后判断业务允许性。未知工具、超出权限的数据源、参数冲突不能靠“再试一次”自动放行。重试次数、模型总预算和错误反馈应受控，不把数据库原始异常、凭据或未授权 Schema 返回模型。

<a id="q-service-02"></a>
## Q-SERVICE-02：流式输出断线后怎样恢复？

区分 Token 展示流与持久化任务。短对话可以明确断线后重新请求；长任务应返回 task_id，把执行状态保存在服务端，并提供查询或事件回放。SSE 的事件 ID 和重连机制不自动等于模型可以从任意 Token 无损续算。

| 事件 | 客户端动作 | 服务端边界 |
| --- | --- | --- |
| started | 保存 task_id | 已创建可查询任务 |
| delta | 追加临时展示 | 不执行尚未完整的工具参数 |
| tool_status | 展示具体执行状态 | 不泄露敏感参数 |
| completed | 标记最终产物 | 验收完成后才发送 |
| failed / cancelled | 展示原因与恢复入口 | 区分取消请求和副作用实际状态 |

## 框架版本注意

核验时 Spring AI 文档区分 2.0 的 ToolCallingAdvisor 路径与早期内部调用循环。不要混用 1.x 示例和 2.x 架构描述。项目应固定 BOM、模型客户端与测试版本，并用集成测试验证工具执行、异常与取消；本站没有把这些示意代码冒充一个已经验证的 Spring AI 完整应用。

## 分层追问与验证

在鉴权和执行之间权限被撤销怎么办？流式 JSON 尚未结束能否调用工具？模型请求超时但工具成功如何记账？缓存键是否包含权限域和语料版本？测试至少包含未知工具、非法参数、跨租户访问、上游 429、连接中断和重复 request_id。

关联：[Runtime](../agent/runtime-lab.md)、[服务性能](./serving.md)、[Spring/MyBatis](../backend/spring-mybatis.md)。

## 参考资料

- [Spring AI：Tool Calling](https://docs.spring.io/spring-ai/reference/api/tools.html)
- [MDN：Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [JSON Schema：Object](https://json-schema.org/understanding-json-schema/reference/object)
