---
title: 项目深挖：库存预占、释放与扣减的状态机
date: 2026-09-05
---

# 项目深挖：库存预占、释放与扣减的状态机

> 复习优先级：P0 · 整理与来源核验：2026-09-05

这是库存类业务的通用设计练习，不代表某公司的实现。先修：[事务锁](../backend/mysql-locking.md)、[一致性](../backend/consistency.md)。

## 需求与业务不变量

假设实际库存为 actual，预占为 reserved，可售为 `actual - reserved`；预占成功后不能让可售为负。审核通过把预占转为实际扣减，驳回或作废释放预占。对同一份预占，扣减和释放只能成功一种；终态请求重复到达不重复改变库存。

<KnowledgeDiagram name="inventory" />

图中的 PENDING/UNKNOWN 涉及外部调用意图与查证；本地实验专注 RESERVED/RELEASED/DEDUCTED 的互斥转换，不覆盖所有跨系统故障。

## 数据与幂等键

| 对象 | 字段示例 | 约束 |
| --- | --- | --- |
| 库存 | sku_id、actual、reserved、version | 更新不能破坏库存不变量 |
| 预占记录 | reservation_key、sku_id、qty、status | key 唯一，参数固定 |
| 业务任务 | task_id、detail_id、revision、state | 合法流转、版本匹配 |

业务键可以采用 `task_id + detail_id + revision + operation`。重新提交且明细已改变时，应产生新的业务轮次，不能把新需求错误命中为旧请求的幂等结果；网络重试则继续复用同一业务键。

## 预占的条件更新

```sql
UPDATE stock
SET reserved = reserved + :qty,
    version = version + 1
WHERE sku_id = :sku
  AND actual - reserved >= :qty
  AND version = :expected_version;
```

影响行数为 0 要区分版本冲突、记录缺失和库存不足，不能全部当作无权限或系统异常。更新库存与写预占记录应在库存服务自己的本地事务内；跨服务业务单状态仍要通过幂等、查询与补偿协调。

<a id="q-project-02"></a>
## Q-PROJECT-02：释放和转扣减同时到达怎么办？

**60 秒回答：** 两种动作竞争同一个前置状态 RESERVED，用数据库条件更新只允许一个成功，再在同一本地事务中调整库存。入口锁用于降低竞争，数据库状态和唯一约束保证业务规则。重复同一动作返回已记录结果，冲突动作不能伪装成成功。

```sql
UPDATE reservation
SET status = :target
WHERE reservation_key = :key AND status = 'RESERVED';
```

成功者继续更新库存：释放只减 reserved；扣减同时减 actual 与 reserved。任何一步失败，本地事务整体回滚。失败者查询终态：若目标相同则按幂等返回；若终态冲突则返回冲突或按业务处理，不再次修改库存。

## 驳回重提与外部未知结果

驳回时先查明上次预占状态并确认释放，再根据新明细启动新 revision。预占超时不等于失败：按业务键查证；远端没有可靠查询或幂等保证时，必须承认不能安全地盲重试。

若业务允许降级到非预占路径，应确认没有残留预占，并在审批通过时使用另一条明确的库存校验流程。降级并不自动消除库存不足风险，业务规则需要单独定义。

## 故障矩阵

| 故障 | 恢复动作 | 验收重点 |
| --- | --- | --- |
| 重复提交 | 相同键查记录 | 库存只预占一次 |
| 预占已成但响应丢失 | 同键查证或幂等重试 | 不产生两份预占 |
| 释放和扣减竞争 | 条件更新争夺 RESERVED | 只出现一个合法终态 |
| 更新状态后库存更新失败 | 回滚本地事务 | 不留下半完成状态 |
| 长期未审批 | 按业务期限处理或告警 | 不能擅自释放仍有效的业务预占 |

## 如何验证与项目表述

运行 [Python 状态机实验](./experiments.md)，测试重复预占、参数冲突、库存不足、重复释放、释放后扣减冲突和反向顺序。该测试验证固定执行顺序与事务逻辑，不等于 MySQL 多连接并发压测；后续应在目标数据库做竞争和故障注入。

面试要说明自己实际写了哪层代码、哪些接口由其他服务提供、验证覆盖到哪里。不要把通用教学图直接称为生产状态机。

## 参考资料

- [MySQL 8.4：Locking Reads](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html)
- [Microsoft：Saga Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga)
- [Python sqlite3：Transaction Control](https://docs.python.org/3/library/sqlite3.html#transaction-control)
