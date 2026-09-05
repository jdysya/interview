---
title: Spring 事务与 MyBatis：代理、连接和缓存边界
date: 2026-09-05
---

# Spring 事务与 MyBatis：代理、连接和缓存边界

> 复习优先级：P0 · 整理与来源核验：2026-09-05

先修：[Spring 总览](./spring.md)。范围：Spring 声明式事务概念与 MyBatis 3；具体 Spring Boot/Framework 依赖版本必须在自己的实验项目固定。

<a id="q-spring-01"></a>
## Q-SPRING-01：三种传播行为如何选择？

**60 秒回答：** REQUIRED 通常加入已有物理事务；REQUIRES_NEW 使用独立物理事务，外层资源可能仍被占用；NESTED 通常基于同一物理事务的保存点，依赖事务管理器与数据库支持。先明确失败应影响哪一组业务数据，再选传播行为。

| 场景 | 可能选择 | 必须解释的代价 |
| --- | --- | --- |
| 同一业务动作的多个写入共同成功 | REQUIRED | 内层标记 rollback-only 会影响整体提交 |
| 独立记录确需单独提交 | REQUIRES_NEW | 内外事务不再原子一致，连接资源可能增加 |
| 局部失败回到保存点后继续外层 | NESTED | 不是独立提交；并非所有管理器都支持 |

## 代理路径示例

```java
// 示意：两个 Bean，事务入口通过 Spring 代理调用。
@Service
class OrderService {
    private final AuditService audit;
    OrderService(AuditService audit) { this.audit = audit; }
    @Transactional
    public void place() {
        // 写订单（省略 Mapper）
        audit.record();
        throw new IllegalStateException("order failed");
    }
}
@Service
class AuditService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record() { /* 写独立审计记录 */ }
}
```

预期：在匹配数据源和事务配置、且审计写成功的前提下，订单回滚而审计保留。把 record 改成同一 Bean 里的 `this.record()` 不能假定仍经过代理。以上是教学片段，省略依赖、导入和 Mapper，不宣称是可直接启动的完整应用。

<a id="q-spring-02"></a>
## Q-SPRING-02：一级缓存为什么不是跨请求缓存？

MyBatis 默认一级缓存与 SqlSession 生命周期相关。Spring 集成通常通过 SqlSessionTemplate 管理会话，具体复用与事务边界有关；不能把 Mapper 单例误读成全站共享一个永久缓存。写操作、提交、回滚和清理会影响缓存；`localCacheScope=STATEMENT` 会改变复用范围。

一个排查实验：同一事务内连续执行相同查询，观察实际发出的 SQL；另一个会话修改数据后，再观察当前会话和新事务查询的差异。注意这同时受到 MyBatis 缓存和数据库隔离级别影响，必须分离变量，不能把所有旧读都归因于 MVCC。

使用 `#{}` 参数绑定值；`${}` 是文本替换，不能让未经校验的用户输入或模型输出直接决定 SQL 片段。动态表名无法用值占位符解决，应经服务器白名单映射。

<a id="q-spring-03"></a>
## Q-SPRING-03：自动配置为什么没有生效？

先查依赖是否在 classpath、配置类条件是否满足、用户自定义 Bean 是否导致配置退让、属性是否被正确加载。使用 condition evaluation report，而不是反复添加注解碰运气。多数据源时还要逐一确认 Mapper、SqlSessionFactory 与事务管理器的绑定关系。

## 失败场景与追问

内层 REQUIRED 标记回滚但外层捕获异常，最后还能正常提交吗？所有线程都持有外层连接又等待 REQUIRES_NEW 连接会怎样？SQL 日志没有第二次查询，是一级缓存还是业务缓存？@Transactional 能回滚 HTTP 服务已执行的动作吗？

## 如何验证

建议在自己的 Spring 实验项目写集成测试：代理内外调用对比、传播行为矩阵、受检异常策略、不同 SqlSession 的查询日志。不要把 mock Mapper 的单元测试当作验证真实事务和数据库锁的证据。

关联：[审批项目](../projects/approval-consistency.md)、[Java AI 服务边界](../ai/java-service.md)。

## 参考资料

- [Spring：Transaction Propagation](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-propagation.html)
- [MyBatis 3：Java API 与 Local Cache](https://mybatis.org/mybatis-3/java-api.html)
- [MyBatis-Spring：SqlSessionTemplate](https://mybatis.org/spring/sqlsession.html)
- [Spring Boot：Auto-configuration](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html)
