---
title: Agent Runtime 实验：执行意图、幂等与断点恢复
date: 2026-09-14
content_status: source-reviewed
---

# Agent Runtime 实验：执行意图、幂等与断点恢复

> 复习优先级：P0 · 整理与来源核验：2026-09-14

先修：[执行模式](./architecture.md)、[可靠执行](./reliability.md)。范围：供应商无关的教学 Runtime，不冒充完整 LangGraph 或 MCP SDK 实现。

选题来自 [Hello Agents 公开问题中的记忆、安全与 Agent 工程挑战](https://github.com/datawhalechina/hello-agents/blob/main/Extra-Chapter/Extra01-%E9%9D%A2%E8%AF%95%E9%97%AE%E9%A2%98%E6%80%BB%E7%BB%93.md)。下文以一个通用“创建导出任务”动作展开：模型决定导出哪些已授权数据，程序负责创建、恢复和查证。所有任务 ID 与故障时序均为教学设定。

<a id="q-agent-01"></a>
## Q-AGENT-01：最小 Runtime 要有什么确定性约束？

**60 秒回答：** 模型提出动作，程序检查预算和取消、校验工具与参数、执行并记录结果。业务状态与工具调用记录需要持久化，最终由验收条件决定完成。模型说“做完了”和外部状态确实正确是两件事。

<KnowledgeDiagram name="runtime" />

## Checkpoint、上下文和记忆不是同一个东西

| 对象 | 保存什么 | 丢失后的后果 | 不能承担的职责 |
| --- | --- | --- | --- |
| 模型上下文 | 本轮消息、证据摘要、可用工具 | 模型无法继续理解任务 | 不能证明远端是否已执行 |
| Checkpoint | 已保存的图状态、步骤位置与恢复元数据 | 需要重跑未持久化部分 | 不能使外部 API 与本地落盘原子化 |
| 长期记忆 | 跨任务保留的知识或偏好 | 下次任务缺少积累 | 不能代替业务账本和授权记录 |
| 动作账本 | 动作身份、参数、执行状态、结果引用 | 无法可靠判定重试身份 | 不自动阻止绕过账本的其他调用方 |

LangGraph 文档区分线程内 checkpointer 与跨线程 store；“已经接了记忆数据库”并不意味着执行恢复已实现。[Persistence S1](https://docs.langchain.com/oss/python/langgraph/persistence)

## 断点恢复会从哪一行继续？

**不要按 IDE 暂停线程理解。** LangGraph 的完整 checkpoint 位于 super-step 边界；同一步中成功节点的 pending writes 可用于故障恢复，避免重算已保存的成功节点，但未完成节点内部的外部副作用仍有不确定窗口。主动从历史 checkpoint 做 replay，也可能重新执行之后的模型和 API 调用。[Checkpointers S2](https://docs.langchain.com/oss/python/langgraph/checkpointers)

| 持久化模式 | 文档所述保存时机 | 取舍 |
| --- | --- | --- |
| `sync` | 下一步开始前同步持久化 | 增加等待，减少未保存步骤窗口 |
| `async` | 下一步运行时异步持久化 | 吞吐与延迟较好，但进程崩溃时可能丢最新状态 |
| `exit` | 正常、错误或中断退出时持久化 | 不保证中途进程崩溃可恢复最近进展 |

这三个名字对应核验日的 LangGraph Python 文档，不保证所有旧版 SDK 支持。`sync` 也只约束 checkpoint 写入，不能把远端创建导出和本地 checkpoint 变成一个事务；内存 saver 更不能提供跨进程持久化。[S2](https://docs.langchain.com/oss/python/langgraph/checkpointers)

**人工确认反例：** 节点先发送一封邮件，再调用 `interrupt` 等待确认。恢复时该节点从头运行，邮件可能再发一封。将确认放在发送之前，可以消除这条“确认恢复即重复”的路径；但发送成功后、节点结果保存前崩溃仍可能导致重发。拆节点有助于缩小重放范围，不等于获得 exactly-once。[Interrupts S3](https://docs.langchain.com/oss/python/langgraph/interrupts)

## 状态设计

| 字段 | 用途 | 不能混淆的概念 |
| --- | --- | --- |
| task_id | 整体任务身份 | 不等于某一次网络请求 ID |
| call_id | 模型提出的调用标识 | 重规划可能变化，不一定适合业务幂等 |
| idempotency_key | 稳定业务动作身份 | 应绑定动作和版本，不随网络重试变化 |
| arguments_hash | 参数指纹 | 相同键参数改变时必须报冲突 |
| status | PREPARED / SUCCEEDED 等 | 没收到回执不等于没有执行 |
| result_ref | 结果或产物定位 | 引用仍需授权与生命周期管理 |

对于导出任务，可在首次确认后由服务端生成稳定 `action_id`，以 `(tenant_id, action_id)` 标识一次业务意图；账本保存规范化参数摘要，例如数据集、过滤条件与导出格式。网络重试的请求 ID、模型重新生成的 `call_id` 可以变化，业务键不变。同一个用户明确要求“再导出一次”是新意图，才使用新动作键；不能仅按参数 Hash 永久去重。

同键不同参数必须拒绝，而不是偷偷采用新参数执行。Hash 只是比较手段，不是权限凭证；恢复时还需重新检查调用者权限、操作是否过期，以及参数是否仍属于原确认范围。[AWS 幂等 API S4](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)

<a id="q-agent-02"></a>
## Q-AGENT-02：工具成功、保存结果前崩溃怎么办？

危险窗口如下：本地已保存 PREPARED → 远端完成业务 → 本地还没保存 SUCCEEDED → 进程中断。恢复时不能单凭 checkpoint 判定远端没有执行，也不能生成新业务键直接再来一次。

| 恢复时查到的事实 | 下一步 | 禁止的推断 |
| --- | --- | --- |
| 远端已完成，键和参数匹配 | 取回原结果，补记 `SUCCEEDED` | “没有本地结果，所以再建一个” |
| 远端仍处理中 | 保持非终态，按预算继续查证 | “超时就是业务失败” |
| 权威确认未执行 | 通过同一幂等键提交 | 换新键扩大一次动作的效果 |
| 暂时查不到或查询失败 | 保持 `UNKNOWN`，重查或人工处理 | “列表没查到，所以一定没执行” |
| 键存在但参数不同 | 冲突退出并保留证据 | 自动覆盖账本继续执行 |

若远端提供可靠幂等接口，也可以用相同业务键重试并得到原结果。这里“没有重复业务效果”依赖远端幂等和持久状态，不是 Runtime 自己单方面创造的 exactly-once。

尤其注意“先查再创建”仍可能竞态：两个 worker 同时查不到，随后同时创建。必须由远端的唯一键、原子去重与业务操作约束重复效果，而非依赖前置查询。AWS 的原文明确把记录幂等标识与相关修改的原子性视为服务端实现要点；具体跨服务效果还要审查下游契约。[S4](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)

## 把恢复设计成故障矩阵

以下是本站根据上述约束整理的设计检查表，不是某框架的内置状态定义。

| 故障点 | 本地可能保留的状态 | 安全恢复方向 |
| --- | --- | --- |
| 意图保存前 | 无记录 | 仅在确定尚未发起外部请求时重新创建意图 |
| 意图落盘后、请求发送前 | `PREPARED` | 同键执行；不能只凭 `PREPARED` 假定此窗口 |
| 请求发出后失去响应 | `PREPARED` 或 `UNKNOWN` | 查证或按受保证的同键幂等重试 |
| 远端成功、本地结果未保存 | `PREPARED` 或 `UNKNOWN` | 补写原结果，而非产生第二份导出 |
| 本地成功、回复用户前崩溃 | `SUCCEEDED` | 返回已存结果引用并检查其访问权限 |
| 幂等记录已过期 | 任意非终态 | 查业务唯一记录或转人工，不能继续假设去重有效 |

设计幂等保留期时，要覆盖允许的任务恢复期和迟到请求窗口。若系统允许恢复 7 天前的任务，而供应商只为键去重 24 小时，超期直接重放就没有原先的保证；这些数值只是反例设定，不是推荐配置。[S4](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)

## 本站故障实验

`examples/engineering_checks.py` 使用两个独立 SQLite 数据库：一个代表本地调用账本，另一个代表模拟远端服务。测试在远端成功后主动抛出故障，再用新 Runtime 实例恢复；检查远端业务记录仍只有一条、结果 ID 一致、参数冲突会被拒绝。

SQLite 用来演示持久记录和唯一约束，不模拟生产数据库的所有并发或复制语义。测试覆盖指定崩溃窗口，不声称已经实现模型接入、跨机租约、完整取消或所有恢复路径。运行方式见 [实验总览](../projects/experiments.md)。

本轮把恢复检查加强为：故障后关闭本地和模拟远端的两个连接，分别重新打开原数据库文件，再恢复动作；另外验证再次丢失结果、远端临时异常后重试，仍复用原动作身份。这验证指定模型的持久记录，不是进程强杀、网络分区或真实云 API 测试。

## 预算与终止

每轮之前检查总 deadline、步骤上限和累计成本。工具自身还要有超时与输出限制。对于无进展循环，可记录连续重复动作和状态变化，触发澄清或失败退出。不要只设置单次模型 max_tokens，却允许无限轮调用。

并发 worker 恢复同一任务时，需要任务领取、租约或条件更新；即使租约过期，也仍须依靠业务幂等处理重复执行。数据库写状态与调用外部接口不宜包在一个长本地事务中假装原子化。

## 分层追问与验证

**执行意图为什么在调用前保存？** 如果先执行后记意图，崩溃后连使用过哪个业务键都可能不知道。先落盘让恢复者至少知道应查哪一次动作；但它仍不能消除外部成功、本地未知的窗口。

**租约能否阻止重复业务效果？** 租约减少同时工作的概率，但旧 worker 暂停后可能在租约过期时恢复。若要拒绝它的写入，需要下游检查递增 fencing token 或其他版本约束；无法让下游执行检查时，不能把租约当作正确性证明。[Fencing S5](https://docs.hazelcast.com/hazelcast/5.5/data-structures/fencedlock)

**调用取消成功是不是已回滚？** 不是。取消只表示停止或请求停止；先查最终状态。已产生副作用的动作需要另一个经授权、可重试的补偿动作。没有撤销接口时应清楚暴露不可逆结果。

**为什么同一动作不能每次重新问模型来重建参数？** 模型可能换工具、改变过滤条件或重新分配调用 ID，恢复会变成另一次任务。应先按已保存意图解决未知状态，再在允许的范围内重新规划。

**如何证明可靠性？** 给每个故障点定义可观察断言，分别统计接口调用次数、实际业务记录数、最终账本状态和恢复耗时。接口被调用两次但只产生一份导出，正是幂等允许的情况；仅统计“工具成功率”不能证明确切业务效果。

## 参考资料

- S1：[LangGraph Python Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)：checkpointer/store 的作用域。
- S2：[LangGraph Python Checkpointers](https://docs.langchain.com/oss/python/langgraph/checkpointers)：super-step、pending writes、replay、durability modes；以 2026-09-14 在线文档为准，本仓库不安装或声称测试该 SDK。
- S3：[LangGraph Python Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)：从节点开头恢复、副作用的位置。文档示例中的“移到中断后”解决的是中断恢复路径，不能据此推广到任意进程崩溃下的 exactly-once。
- S4：[AWS Builders' Library：Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)：请求身份、参数不匹配、迟到请求及去重保留期。
- S5：[Hazelcast 5.5 FencedLock：Fencing Tokens](https://docs.hazelcast.com/hazelcast/5.5/data-structures/fencedlock)：旧持有者恢复后的写入风险与资源端检查；不把锁 API 的保证外推到未配合检查的远端效果。
- [Python sqlite3](https://docs.python.org/3/library/sqlite3.html)：仓库教学实验所用本地数据库接口；生产环境的事务、复制和授权需独立设计。
