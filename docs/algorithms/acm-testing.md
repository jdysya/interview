---
title: Java ACM 与对拍：多组输入、溢出和非唯一答案
date: 2026-09-05
---

# Java ACM 与对拍：从能运行到有证据

> 复习优先级：P0 · 整理与来源核验：2026-09-05

本页是工程训练，不计入 30 道算法题。输入格式以题目为准：有些题有 T，有些读到 EOF，不能通用地假设第一行一定是测试数量。

## 可运行的多组输入模板

演示格式：T；每组先 n，再 n 个 int；输出每组和（long）。解析器检查 EOF、非数字和 int 溢出，允许负数。这个程序只演示输入输出，不是某个构造题的解法。

```java
public class Main {
    static final class FastScanner {
        private final java.io.InputStream in = new java.io.BufferedInputStream(System.in);
        Integer nextIntOrNull() throws java.io.IOException {
            int c;
            do { c = in.read(); } while (c != -1 && c <= 32);
            if (c == -1) return null;
            boolean negative = c == '-';
            if (negative) c = in.read();
            if (c < '0' || c > '9') throw new NumberFormatException("Expected integer");
            long value = 0;
            while (c >= '0' && c <= '9') {
                value = value * 10 + c - '0';
                if (value > 2147483648L) throw new NumberFormatException("Integer overflow");
                c = in.read();
            }
            if (c != -1 && c > 32) throw new NumberFormatException("Invalid token");
            long signed = negative ? -value : value;
            if (signed < Integer.MIN_VALUE || signed > Integer.MAX_VALUE) throw new NumberFormatException("Integer overflow");
            return (int) signed;
        }
        int nextInt() throws java.io.IOException {
            Integer value = nextIntOrNull();
            if (value == null) throw new java.io.EOFException("Incomplete case");
            return value;
        }
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); Integer cases = fs.nextIntOrNull();
        if (cases == null) return;
        if (cases < 0) throw new IllegalArgumentException("Negative case count");
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < cases; t++) {
            int n = fs.nextInt(); if (n < 0) throw new IllegalArgumentException("Negative length");
            long sum = 0;
            for (int i = 0; i < n; i++) sum += fs.nextInt();
            out.append(sum).append('\n');
        }
        System.out.print(out);
    }
}
```

## 多组输入测试

```text
输入：
2
3 1 2 3
2 -2147483648 2147483647
输出：
6
-1
```

`check:extended` 同时提取并运行这段模板，检查示例结果。空输入应无输出，截断输入应报错而不是把缺失数字读成 0。

## 不同测试对象用不同判定器

| 输出类型 | 正确的检查方式 | 常见误判 |
| --- | --- | --- |
| 唯一数值 | 与暴力答案比较 | 忽略溢出、误差或模数 |
| 无序集合 | 规范化后比较内容和重数 | 排序前直接比较输出字符串 |
| 构造方案 | 验证范围、唯一性、约束和目标值 | 合法方案与样例不一样就判错 |
| 最优构造 | 合法性检查 + 最优值对照 | 只验合法但没有达到最优 |
| 判定 NO | 小规模穷举检查是否真无解 | 只检测 YES 的输出合法性 |

## 小规模暴力对拍

先写一个容易证明正确、但只处理小 n 的 oracle，生成固定种子的随机输入，再运行优化算法。出现差异时保存种子和输入，尽量删元素、缩数值缩小反例，并加入固定回归测试。随机测试通过不等于数学证明。

本站扩展测试对三数之和、容器面积、积水、子数组计数、LIS、背包、跳跃等做小规模对拍。构造题没有通用 checker，应把题目中每条约束逐条翻译成可执行检查。

## 分层追问与边界

先转 long 再运算与算完再转有什么区别？多组数据的容器是否清空？递归深度是否可能栈溢出？PriorityQueue 比较器会不会溢出？输出顺序不唯一时怎样保证没有漏解或重复？

## 参考资料

- [Java 21：InputStream](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/InputStream.html)
- [Java 21：Integer](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Integer.html)
- [Java 21：Comparator](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Comparator.html)
