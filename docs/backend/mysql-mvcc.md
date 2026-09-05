---
title: MySQL MVCC：版本可见性与双事务推导
date: 2026-09-05
---

# MySQL MVCC：版本可见性与双事务推导

> 复习优先级：P0 · 整理与来源核验：2026-09-05

适用：MySQL 8.4 / InnoDB。先修：[MySQL 总览](./mysql.md)。目标：不只背 RC/RR，而是按执行顺序判断每次查询的结果。

<a id="q-db-01"></a>
## Q-DB-01：RR 为什么能重复读取旧版本？

**60 秒回答：** 一致性读通过 Read View 判断版本是否可见，必要时沿 undo 重建旧版本。RC 通常为每条一致性读语句建立新快照；RR 通常复用事务第一次一致性读的快照。事务自己的修改对自己可见。锁定读、UPDATE 不能直接套用普通快照读的结论。

<KnowledgeDiagram name="mvcc" />

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
| 7 | `ROLLBACK;` | | 释放 A 的锁与事务资源 |

将值重置为 10、把隔离级别换成 RC 重做，第 5 步预期 20。这是待你在 MySQL 环境复现的实验，不是本站 CI 已运行的数据库测试。

<a id="q-db-02"></a>
## Q-DB-02：Read View 如何判断版本可见？

用教学模型表达：快照记录创建者、当时尚未完成的读写事务集合，以及事务 ID 的可见性边界。先判断是否是自己的版本，再判断版本事务是否早于低边界、是否晚于高边界、是否位于当时的活跃集合。不可见就尝试更旧版本；不要把事务 ID 大小直接理解成提交时间先后。

假设活跃集合为 `{90,100}`，创建者为 100，快照建立时下一个待分配事务 ID 为 105：

| 版本事务 ID | 可见性 | 原因 |
| --- | --- | --- |
| 80 | 可见 | 早于当时最老活跃事务 |
| 90 | 不可见 | 建快照时还活跃；之后提交不改变旧快照 |
| 95 | 可见 | 小于 105 且不在活跃集合中 |
| 100 | 可见 | 自己的修改 |
| 106 | 不可见 | 晚于快照边界 |

这是帮助推导的简化模型，不是可直接替换 InnoDB 实现的代码。可结合官方源码 `ReadView::changes_visible` 检查字段含义。

## 失败场景与反例

“RR 中同一事务所有 SQL 都看到同一数据集”是错的：自己的写入、当前读和快照读混用会改变观察结果。长事务也不是免费保存历史；旧快照可能延缓历史版本回收。不要仅用事务持续时间判断影响，应同时观察活跃事务、历史版本积压和具体查询。

## 分层追问

基础：RC 第一次与第二次查询可能不同，原因是什么？机制：建快照后活跃事务提交，该版本会突然变得可见吗？实现：普通查询之后再锁定查询，业务必须满足怎样的不变量？反例：A 更新了某些行，再执行普通 SELECT，是否仍是整个数据库某一时刻的完全快照？

## 如何验证

记录版本、隔离级别、autocommit、每条语句开始与提交顺序。分别改变“B 在 A 第一次 SELECT 前提交”和“B 在其后提交”，不能只给出一份看似随机的结果。用 [锁实验](./mysql-locking.md) 进一步观察等待；可见性与锁互斥是两条不同的分析轴。

## 参考资料

- [MySQL 8.4：Consistent Nonlocking Reads](https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html)
- [MySQL 8.4：Multi-Versioning](https://dev.mysql.com/doc/refman/8.4/en/innodb-multi-versioning.html)
- [MySQL 官方源码：read0types.h](https://github.com/mysql/mysql-server/blob/8.4/storage/innobase/include/read0types.h)
