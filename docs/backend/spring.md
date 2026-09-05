---
title: "Spring IOC、AOP 与事务失效"
date: 2026-09-05
---

# Spring IOC、AOP 与事务失效

> 复习优先级：P0 · 整理与来源核验：2026-09-05

## 面试题：为什么同类内部调用 @Transactional 方法可能不生效？

**60 秒回答：** Spring 常用代理模式织入事务，调用要经过代理才能被拦截。同一个对象内部通过 this 调用另一个方法会绕过代理。应调整职责、从代理入口调用或使用合适的编程式事务，而不是简单在所有方法上加注解。

## IOC 与 AOP 要点

IOC 容器管理对象创建、依赖注入与生命周期。Bean 默认作用域是 singleton，但 singleton 不代表线程安全。代理通常分为基于接口的 JDK 代理和基于子类的代理；final/private 等限制应结合代理机制讨论。

循环依赖要先判断构造器还是属性注入、Bean 作用域和容器配置；不能把某些单例场景的早期引用机制当作所有循环依赖都能解决。更好的设计常是拆分职责。

## 面试题：事务还会在哪些情况下不符合预期？

| 情况 | 应检查什么 |
| --- | --- |
| 异常被 catch 后吞掉 | 代理是否看到触发回滚的异常，是否显式标记 rollback-only |
| 抛出受检异常 | 默认回滚规则与项目自定义配置 |
| 新线程/异步方法 | 事务上下文通常绑定线程，不能自动跨线程传播 |
| 调了外部 HTTP/Dubbo | 本地数据库事务不能回滚远端副作用 |
| 传播行为不符合预期 | REQUIRED、REQUIRES_NEW、NESTED 的真实边界与数据库支持 |

## 常见追问

- **REQUIRES_NEW 为什么可能增加连接压力？** 内层独立事务可能需要额外连接，外层资源仍被占用。
- **事务越大越安全吗？** 持锁时间、日志、死锁和回滚成本也更高，应围绕最小一致性边界设计。
- **工单服务成功，本地写库失败，注解能解决吗？** 不能；需要幂等、状态查询与补偿，见场景设计中的审批工单。

## 参考资料

- [Spring：Using @Transactional](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
- [Spring：Proxying mechanisms](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)
