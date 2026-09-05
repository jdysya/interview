---
title: InnoDB 锁：双会话实验与死锁排查
date: 2026-09-05
---

# InnoDB 锁：双会话实验与死锁排查

> 复习优先级：P0 · 整理与来源核验：2026-09-05

适用：MySQL 8.4 / InnoDB。先修：[MVCC](./mysql-mvcc.md)。目标：根据索引、条件、隔离级别和执行计划推导锁，而不是背“锁行还是锁表”。

<a id="q-db-03"></a>
## Q-DB-03：唯一索引等值查询一定只锁一行吗？

**60 秒回答：** 对完整唯一键查找且命中记录的典型锁定读，通常只需要记录锁；查找不存在的键、只使用复合唯一键的一部分、使用范围条件时不能直接套用。RR 和 RC 的间隙锁策略也不同。锁住的是所访问索引上的记录或间隙，不是 SQL 文本里的一个抽象行号。

## 本地准备

```sql
CREATE TABLE lock_demo (id INT PRIMARY KEY, balance INT NOT NULL) ENGINE=InnoDB;
INSERT INTO lock_demo VALUES (10,100),(20,100),(30,100);
```

两会话均设为 RR；B 可设置 `innodb_lock_wait_timeout=5` 避免长时间等待。只在测试库运行，实验结束全部 `ROLLBACK`。

| 实验 | 会话 A，开启事务后执行 | 会话 B | 预期与条件 |
| --- | --- | --- | --- |
| 命中唯一键 | `SELECT * FROM lock_demo WHERE id=20 FOR UPDATE;` | `UPDATE lock_demo SET balance=99 WHERE id=20;` | 等待 A 释放记录锁 |
| 相邻插入 | 保持上一条 A 锁 | `INSERT INTO lock_demo VALUES(21,100);` | 没有其他锁时通常可完成 |
| 不存在键 | 新事务：`SELECT * FROM lock_demo WHERE id=15 FOR UPDATE;` | `INSERT INTO lock_demo VALUES(15,100);` | RR 下受到相应间隙锁限制 |

重新执行前恢复测试数据，避免上一实验残留影响结论。需要比较 RC 时重新设置隔离级别并开启新事务。

<a id="q-db-04"></a>
## Q-DB-04：死锁为什么不能仅靠增加超时解决？

死锁是等待图中的环，不是“某一条 SQL 特别慢”。例如 A 先更新 id=10，B 先更新 id=20，接着 A 请求 id=20，B 请求 id=10。若死锁检测开启，数据库会选择受害事务回滚；业务必须能正确处理整个事务的重试。

```sql
-- A: BEGIN; UPDATE lock_demo SET balance=balance-1 WHERE id=10;
-- B: BEGIN; UPDATE lock_demo SET balance=balance-1 WHERE id=20;
-- A: UPDATE lock_demo SET balance=balance+1 WHERE id=20; -- 等待
-- B: UPDATE lock_demo SET balance=balance+1 WHERE id=10; -- 形成环
SHOW ENGINE INNODB STATUS;
```

两会话按顺序交错执行。检测受害者不固定，不应断言一定是 B。回滚或提交幸存事务后再做下一轮。

## 排查路径

先找到等待 SQL 和持锁 SQL，再看索引访问、事务边界与锁对象。可查询 `performance_schema.data_locks`、`data_lock_waits`，结合 `EXPLAIN` 解释锁范围。监控账号需要适当权限；生产环境不要为了观察而随意开启长事务。

修复通常包括统一访问顺序、缩短事务、补合适索引与减少一次锁定行数。重试应有次数上限和退避；包含远端副作用时还要先解决幂等，否则数据库重试可能导致重复外部操作。

## 失败场景与反例

没有索引的 UPDATE 可能扫描并锁定大量记录，但不能直接说引擎一定改成了 table lock。增加索引也不是对所有 SQL 都有效，优化器可能因数据分布选择其他路径。不要把测试库三行数据的锁现象直接外推到生产负载。

## 分层追问与验证

基础：记录锁、间隙锁、next-key lock 分别限制什么？机制：为什么某些间隙锁彼此不冲突，却能阻止插入？实现：转账按账户 ID 排序加锁能解决哪些环，不能解决哪些跨系统问题？验证：保存完整时间顺序、执行计划和锁快照，修改一个因素后重做。

## 参考资料

- [MySQL 8.4：InnoDB Locking](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking.html)
- [MySQL 8.4：Deadlocks](https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlocks.html)
- [MySQL 8.4：data_lock_waits](https://dev.mysql.com/doc/refman/8.4/en/performance-schema-data-lock-waits-table.html)
