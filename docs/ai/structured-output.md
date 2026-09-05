---
title: "结构化输出与 Function Calling"
date: 2026-09-05
---

# 结构化输出与 Function Calling

> 复习优先级：P0 · 整理与来源核验：2026-09-05

## 面试题：JSON mode、Structured Output 和 Tool Calling 有什么区别？

**60 秒回答：** JSON 格式约束解决可解析性；Schema 约束进一步要求字段与类型满足指定结构；Tool Calling 表示模型提出一个工具及参数，由应用程序鉴权、执行并回传结果。三者都不能替代业务校验，参数符合 Schema 也可能查错用户或使用错误时间范围。

## 工具调用闭环

1. 定义简短、无歧义的工具描述与 JSON Schema，区分必填、可选、默认值和单位。
2. 接收模型提出的调用，解析并校验参数。
3. 应用根据登录态检查权限、配额、环境和副作用；用户身份不能由模型传入值直接决定。
4. 调用实际 API，设置超时、幂等键和结果大小限制。
5. 将执行结果关联原调用 ID，传回成功数据或可处理的错误，再决定是否继续。

## 一个业务约束示例

查询参数包含 `start_date` 和 `end_date`，两者都是合法日期，仍需检查先后顺序、最大跨度、用户可见的数据范围。JSON Schema 提供结构约束，应用完成跨字段和领域校验。

## 常见追问

- **模型返回函数名就已经执行了吗？** 没有，执行者是应用的工具运行层。
- **并行调用适合所有工具吗？** 只适合相互独立的调用。先查订单再退款存在依赖。
- **结构化输出是否永远成功？** 需处理拒绝、截断、网络错误、Schema 不支持等情况，具体能力看供应商与模型版本。
- **修复 JSON 可以无限重试吗？** 不应；设置次数与时间预算，并返回可观测的错误。

## 参考资料

- [Claude：Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [JSON Schema：对象校验](https://json-schema.org/understanding-json-schema/reference/object)
