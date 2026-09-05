---
title: Java 基础：对象契约、泛型、异常与资源管理
date: 2026-09-05
---

# Java 基础：对象契约、泛型、异常与资源管理

> 复习优先级：P0 · 整理与来源核验：2026-09-05

适用：Java 21。目标：从业务代码中的错误反推语言机制，而非逐个背名词。

<a id="q-java-04"></a>
## Q-JAVA-04：equals 与 hashCode 为什么必须配套？

**60 秒回答：** equals 表示逻辑相等，hashCode 为哈希容器提供分桶依据；相等对象必须具有相同哈希值，相同哈希值不保证对象相等。把参与比较或散列的字段修改掉，会破坏已入容器键的可检索性。默认 Object.equals 比较对象身份，业务值对象需定义自己的语义。

```java
record AccountKey(String tenant, long id) {}
// record 根据组件生成 equals/hashCode；组件应符合所需稳定性。
Map<AccountKey, String> users = new HashMap<>();
users.put(new AccountKey("demo", 7), "Alice");
assert "Alice".equals(users.get(new AccountKey("demo", 7)));
```

注意 record 是浅层不可变：组件若是可变 List，其内容仍可变，不能因此宣称整个对象图不可变。排序容器还依赖比较器，比较结果为 0 的等价关系应与业务去重目标一致。

<a id="q-java-05"></a>
## Q-JAVA-05：泛型、异常与资源释放有哪些易错点？

`List<Integer>` 不是 `List<Number>` 的子类型。`? extends T` 适合从中读出 T，不允许随便写入某个具体 T；`? super T` 适合写入 T，但读取时只保证 Object。类型擦除不意味着编译器不检查泛型，反射和原始类型也不应被用来规避接口契约。

受检异常需要调用方捕获或声明；运行时异常不要求同样的编译期处理。事务是否回滚是框架策略，不应从异常的名字直接推断。错误链应保留 cause，避免只留下 `e.getMessage()` 使定位信息丢失。

```java
try (var reader = java.nio.file.Files.newBufferedReader(
        java.nio.file.Path.of("input.txt"), java.nio.charset.StandardCharsets.UTF_8)) {
    String first = reader.readLine();
    System.out.println(first == null ? "empty" : first);
}
```

try-with-resources 负责关闭资源，按声明的逆序关闭；主体和关闭都抛异常时需要理解 suppressed exception。它不会自动使对远端接口的多次调用成为事务。

## 更多基础机制

| 主题 | 正确回答应包含 | 反例或测试 |
| --- | --- | --- |
| String 与编码 | 不可变、UTF-16 code unit 与 code point 区分 | emoji 的 length 不等于字符数量 |
| 数值与比较 | int 溢出、long 转换位置、浮点误差 | `(long)(a+b)` 可能已经先溢出 |
| BigDecimal | 数值比较和 scale 语义、构造来源 | `equals` 与 `compareTo` 并不等价 |
| 反射 | 运行时元信息、访问控制、模块边界 | 不能假设 private 总能任意访问 |
| IO | 字节/字符、缓冲、编码、资源生命周期 | 不能用默认编码跨环境读写业务数据 |

## 分层追问

为什么 HashMap 查找先用哈希再比较？可变键如何触发“明明在 Map 里却 get 不到”？泛型的生产者和消费者各是哪一侧？捕获异常后返回空列表会掩盖哪些失败？对上传文件应怎样限制大小和路径？

## 如何验证

写三个测试：两个不同实例但逻辑相等的键可以取回同一值；修改可变键后观察查找失败；包含 emoji 的字符串分别计算 UTF-16 长度和 code point 数。异常测试检查根因和 suppressed 信息，而不是只判断“抛了异常”。

关联：[集合](./java-collections.md)、[ACM 与测试](../algorithms/acm-testing.md)、[Spring 与 MyBatis](./spring-mybatis.md)。

## 参考资料

- [Java 21：Object 契约](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html)
- [Java 21：BigDecimal](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html)
- [JLS 21：Types, Values, and Variables](https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html)
- [JLS 21：try-with-resources](https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html#jls-14.20.3)
