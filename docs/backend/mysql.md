---
title: "MySQL 索引、MVCC 与锁"
date: 2026-09-05
---

# MySQL 索引、MVCC 与锁

> 复习优先级：P0 · 整理与来源核验：2026-09-05

## 面试题：联合索引 (a, b, c) 为什么强调最左前缀？

**60 秒回答：** B+Tree 的组合键按字段顺序排序，先按 a，再在 a 相同范围内按 b 和 c。能否有效缩小扫描范围取决于条件、排序、数据分布和优化器。不能机械地说“范围条件后面的列完全失效”，后续列仍可能参与索引条件过滤或覆盖。

## 查询优化步骤

先确认 SQL 语义与数据量，再检查执行计划中的访问方式、扫描行数、过滤、回表、临时表与排序。用真实参数验证；`EXPLAIN ANALYZE` 会实际执行查询，应控制环境和范围。覆盖索引减少回表，但索引增加写入与空间成本。

## 面试题：RC 和 RR 下 Read View 何时生成？

以 InnoDB 为例，RC 的一致性读通常每次建立新快照；RR 通常复用事务内首次一致性读建立的快照。`START TRANSACTION` 本身不总是立即创建快照。MVCC 依靠版本信息与 undo 等机制判断可见性。

普通 SELECT 的一致性读与 `SELECT ... FOR UPDATE` 等锁定读不同，后者需要读取并锁定合适的当前记录。混用时不能认为所有查询都只看同一快照。

## 锁与幻读

记录锁、间隙锁和 next-key lock 的作用取决于隔离级别、访问索引与条件。RR 的快照读与锁定读通过不同机制应对并发变化，不能简单说“RR 永远不可能看到幻行”。锁定范围过大时应检查索引与执行计划。

## 常见追问

- **无索引 UPDATE 一定锁整张表吗？** 应讨论扫描和锁定范围，不能把逻辑效果直接等同于 table lock。
- **深分页怎么优化？** 适用时使用稳定排序和游标条件，避免高 offset 重复扫描；说明并发数据变化的语义。
- **死锁如何处理？** 事务短、访问顺序一致、索引合理；业务需能够重试数据库选出的受害事务。

## 参考资料

- [MySQL 8.4：Isolation levels](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html)
- [MySQL 8.4：Multiple-column indexes](https://dev.mysql.com/doc/refman/8.4/en/multiple-column-indexes.html)
- [MySQL 8.4：InnoDB locking](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking.html)
