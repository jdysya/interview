---
title: MySQL MVCC：版本可见性与双事务推导
date: 2026-09-14
content_status: source-reviewed
---

# MySQL MVCC：版本可见性与双事务推导

> 复习优先级：P0 · 整理与来源核验：2026-09-14

适用：MySQL 8.4 / InnoDB。先修：[MySQL 总览](./mysql.md)。目标：不只背 RC/RR，而是按执行顺序判断每次查询的结果。

选题对照 [JavaGuide 的事务与当前读/快照读问题](https://github.com/Snailclimb/JavaGuide/blob/main/docs/database/mysql/mysql-questions-01.md)，技术答案以 MySQL 8.4 手册和固定源码标签为准。特别纠正两个容易混淆的概括：MVCC 不是“行锁升级版”，RR 快照也不默认在 `BEGIN` 时产生。下文数字和会话顺序均为原创教学设定，不是真实数据库测量。

## 先分清：隔离级别、读法、实现机制

| 层次 | 回答的问题 | 例子 |
| --- | --- | --- |
| 隔离级别 | 事务允许观察到哪些并发变化？ | RC、RR |
| 读法 | 这条 SQL 依据历史视图还是锁定的当前记录？ | 普通一致性读、`FOR UPDATE` |
| 实现机制 | 如何选择版本、如何限制竞争？ | undo + Read View、记录锁/间隙锁 |

这里讨论 RC/RR 下普通 `SELECT`，不把结论套到所有隔离级别或 `INSERT ... SELECT`。MVCC 解决“读哪个版本”；锁解决“谁能修改或锁定记录”。两者可以共存：写者持有记录锁时，另一个事务通常仍能一致性读取可见旧版本；但写写竞争仍需要协调。[一致性读 S1](https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html)、[锁定读 S4](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html)

<a id="q-db-01"></a>
## Q-DB-01：RR 为什么能重复读取旧版本？

**60 秒回答：** 一致性读通过 Read View 判断版本是否可见，必要时沿 undo 重建旧版本。RC 通常为每条一致性读语句建立新快照；RR 通常复用事务第一次一致性读的快照。事务自己的修改对自己可见。锁定读、UPDATE 不能直接套用普通快照读的结论。

<KnowledgeDiagram name="mvcc" />

## 版本链不是给每个事务复制一张表

InnoDB 聚簇记录上的 `DB_TRX_ID` 标识最近一次修改它的事务，`DB_ROLL_PTR` 指向 undo 信息。读者检查当前版本；若不可见，用 undo 重建更旧版本并继续判断。`DB_ROW_ID` 与自动生成聚簇索引有关，不是可见性的时间戳。删除先表现为删除标记；若该删除版本对当前视图不可见，读者仍可能重建并读取删除前的行。[多版本机制 S2](https://dev.mysql.com/doc/refman/8.4/en/innodb-multi-versioning.html)

教学例：某行依次被事务 80、95、106 修改，值为 10、15、30。当前记录是 `(106,30)`。若视图拒绝 106、接受 95，读到 15，而非最旧的 10。若这行是事务 106 才插入的，之前没有可见版本，则查询结果里没有这行。undo 主要保存恢复旧内容所需的信息，不意味着每一步都保存整行完整副本。

## 双会话实验

仅在本地测试库执行。先单独建表并提交：

```sql
CREATE TABLE mvcc_demo (id INT PRIMARY KEY, value INT NOT NULL) ENGINE=InnoDB;
INSERT INTO mvcc_demo VALUES (1, 10);
```

两终端按表中的顺序执行，不要把整列一次性粘贴运行。

| 时刻 | 会话 A | 会话 B | 推导 |
| --- | --- | --- | --- |
| 1 | `SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;` | | 为后续事务设置 RR |
| 2 | `START TRANSACTION;` | | 普通 BEGIN 不意味着此时已建立快照 |
| 3 | `SELECT value FROM mvcc_demo WHERE id=1;` | | 首次一致性读，预期 10 |
| 4 | | `UPDATE mvcc_demo SET value=20 WHERE id=1;` | B 使用 autocommit=1，语句结束即提交 |
| 5 | `SELECT value FROM mvcc_demo WHERE id=1;` | | 仍预期 10 |
| 6 | `SELECT value FROM mvcc_demo WHERE id=1 FOR UPDATE;` | | 假设没有其他写入，预期 20 |
| 7 | `SELECT value FROM mvcc_demo WHERE id=1;` | | 仍预期 10；锁定读不刷新原 Read View |
| 8 | `UPDATE mvcc_demo SET value=value+1 WHERE id=1;` | | 根据当前值 20 更新为 21，不是 11 |
| 9 | `SELECT value FROM mvcc_demo WHERE id=1;` | | 预期 21：自己的修改可见 |
| 10 | `ROLLBACK;` | | 撤销 A 的加一并释放锁；B 的 20 保留 |

将值重置为 10、把隔离级别换成 RC 重做，第 5 步预期 20。这是待你在 MySQL 环境复现的实验，不是本站 CI 已运行的数据库测试。

<a id="q-db-02"></a>
## Q-DB-02：Read View 如何判断版本可见？

快照记录创建者、当时活跃的其他读写事务 ID，以及可见性边界。固定源码标签 `mysql-8.4.0` 中，`ReadView::changes_visible` 的判定可整理如下。注意源码命名：`m_up_limit_id` 是数值较小的可见边界，`m_low_limit_id` 才是较大的不可见边界，不能按英文直觉倒置。[源码 S3](https://github.com/mysql/mysql-server/blob/mysql-8.4.0/storage/innobase/include/read0types.h)

1. 是创建者自己的版本，或 ID 小于 `m_up_limit_id`：可见。
2. ID 大于或等于 `m_low_limit_id`：不可见；**等于也不可见**。
3. 落在中间：在 `m_ids` 中则不可见，不在则可见。
4. 不可见时继续找旧版本，而非让整个查询立即失败。

假设创建者为 100，其他活跃事务集合为 `{90,102}`，较小边界为 90，较大边界为 105：

| 版本事务 ID | 可见性 | 原因 |
| --- | --- | --- |
| 80 | 可见 | 早于当时最老活跃事务 |
| 90 | 不可见 | 建快照时还活跃；之后提交不改变旧快照 |
| 95 | 可见 | 小于 105 且不在活跃集合中 |
| 100 | 可见 | 自己的修改 |
| 102 | 不可见 | 在活跃集合中 |
| 105 | 不可见 | 恰好到达较大边界 |
| 106 | 不可见 | 晚于快照边界 |

事务 90 后来提交，也不改变这个既有 RR 视图中的活跃集合。事务 95 已提交而 90 未提交完全可能：事务 ID 的分配次序不是提交次序。RC 的下一条一致性读新建视图，才有机会接受 90 的版本。

以下是独立的 Python 教学模型，只验证上述判定和链遍历；不是 InnoDB 实现、purge 模型或数据库集成测试。源码示例检查会直接提取此代码运行。

```python
def visible(writer, creator, lower, upper, active):
    if writer == creator or writer < lower:
        return True
    if writer >= upper:
        return False
    return writer not in active


def read_version(chain, view):
    # chain 为新到旧的 (writer, value)；不建模删除标记。
    for writer, value in chain:
        if visible(writer, **view):
            return value
    return None


view = dict(creator=100, lower=90, upper=105, active={90, 102})
expected = {80: True, 90: False, 95: True, 100: True,
            102: False, 105: False, 106: False}
assert {t: visible(t, **view) for t in expected} == expected
assert read_version([(106, 30), (95, 15), (80, 10)], view) == 15
assert read_version([(106, 30)], view) is None
assert read_version([(100, 21), (106, 20), (80, 10)], view) == 21
empty_view = dict(creator=0, lower=105, upper=105, active=set())
assert visible(104, **empty_view) and not visible(105, **empty_view)
print("Read View teaching model: boundaries and version traversal passed")
```

## 失败场景与反例

“RR 中同一事务所有 SQL 都看到同一数据集”是错的。原有快照 + 自己的写入，可能拼出数据库从未整体存在过的状态。[S1](https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html)

原创双行推导：初始两行 `(id=1,value=10)`、`(id=2,value=20)`；A 首次一致性读看见 `(10,20)`；B 在同一事务中把两行改成 `(100,200)` 并提交；A 对第一行执行 `value=value+1`，随后普通查询两行得到 `(101,20)`。原因分别是 A 自己写入的 101、第二行历史快照中的 20。外部已提交状态依次为 `(10,20)` 和 `(100,200)`，不是 `(101,20)`。因此业务不能先按旧快照计算绝对值，再盲目覆盖当前记录。

长事务也不是免费保存历史；仍被活跃视图需要的更新 undo 不能立即回收。应结合活跃事务、undo 历史积压和写入速率定位，不能把“事务时间长”直接等价为“必然锁全表”。[S2](https://dev.mysql.com/doc/refman/8.4/en/innodb-multi-versioning.html)

## 分层追问

**为什么 RC 连续两次查询可能不同？** 每条一致性读使用自己的视图，期间提交的变化可在下一次出现；不是查询进行到一半就持续更新视图。

**先普通查询再 `FOR UPDATE`，能保护先前判断吗？** 不能追溯保护。拿到锁后必须重新验证条件，并在同一事务里完成写入；或者把条件放进原子更新并检查受影响行数。并发事务可能在两次查询之间已修改数据。[S4](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html)

**当前读是不是“读取未提交的新值”？** 不是脏读。若目标记录正被其他写事务占用，默认锁定读可能等待其结束；`NOWAIT` 会报错，`SKIP LOCKED` 会跳过被锁记录，不能把后者当作完整业务视图。[S4](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html)

**RR 是否在任意 SQL 组合下都不会出现新增行？** 不能这样答。普通一致性读复用视图，而锁定范围防止并发插入依赖锁和访问范围；当前读、自己的修改与一致性读混用应逐条分析，不能用一句“MVCC 解决幻读”代替推导。锁范围见[锁实验](./mysql-locking.md)。

## 如何验证

记录版本、隔离级别、autocommit、每条语句开始与提交顺序。分别改变“B 在 A 第一次 SELECT 前提交”和“B 在其后提交”，不能只给出一份看似随机的结果。用 [锁实验](./mysql-locking.md) 进一步观察等待；可见性与锁互斥是两条不同的分析轴。

## 参考资料

- S1：[MySQL 8.4 §17.7.2.3](https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html)：RC/RR 快照时机、自己的修改、混合版本反例；不把它外推为所有 SQL 的读法。
- S2：[MySQL 8.4 §17.3](https://dev.mysql.com/doc/refman/8.4/en/innodb-multi-versioning.html)：undo、记录元数据、旧版本保留。
- S3：[MySQL mysql-8.4.0 源码 read0types.h](https://github.com/mysql/mysql-server/blob/mysql-8.4.0/storage/innobase/include/read0types.h)：`changes_visible` 与边界字段；固定标签避免后续源码移动。
- S4：[MySQL 8.4 §17.7.2.4](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html)：锁定读、等待和跳过锁定记录的限制。

核验范围：上述机制与来源已复核，Python 只验证教学模型；两组 MySQL 会话实验尚未在本次运行中连接真实 MySQL 执行，表中结果是基于所列条件的推导。
