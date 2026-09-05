---
title: Java 并发面试详解：happens-before、AQS、线程池与 Future 陷阱
date: 2026-09-05
content_status: source-reviewed
---

# Java 并发面试详解：happens-before、AQS、线程池与 Future 陷阱

> 复习优先级：P0 · 整理与来源核验：2026-09-05

本页以 **Java 21** 语言规范和并发 API 为基准。选题对照 [JavaGuide 线程池专题](https://javaguide.cn/java/concurrent/java-thread-pool-summary.html)，技术结论以 JLS、JDK 文档与具体程序行为核对。阅读目标不是记住“七个参数”，而是能预测给定任务序列会排队、执行、拒绝还是永久等待。

<a id="q-java-01"></a>
## Q-JAVA-01：volatile 为什么能安全发布，却不能让 i++ 线程安全？

**先分清两个问题：** 安全发布关心另一个线程能否看到已经构造好的数据；复合更新关心多个步骤是否作为一个不可分割的操作执行。`volatile` 可以建立 happens-before 关系，却不把读取、计算和写回自动合并。[S1]

```java
// 一次发布、一个写线程；不是反复复用的多轮通信协议。
class Publication {
    int payload;
    volatile boolean ready;
    void publish() { payload = 42; ready = true; }
    Integer read() { return ready ? payload : null; }
}
```

假设没有其他线程修改这两个字段：读线程读取 `ready` 得到 true，才能进入读取 payload 的分支。推导链条为：

```text
payload = 42
  → 同线程程序顺序
ready = true（volatile 写）
  → 对同一 volatile 的后续读建立同步关系
读取 ready 得到 true
  → 同线程程序顺序
读取 payload
```

利用 happens-before 的传递性，可以推导最后读取的 payload 是已经发布的 42；不是因为“CPU 恰好把缓存刷了”。把 ready 改成普通字段，就不再有这条同步链。JLS 同时规定了解锁到后续加锁、线程启动等同步关系；面试时应指出使用的是哪条规则。[S1]

再看 `volatile int count; count++;` 的合法交错：A 读到 0，B 读到 0，A 写 1，B 写 1。单次读写即使可见，两次自增仍只得到 1。这里需要原子读改写、锁，或者重新设计计数方式。

**追问：把 ready 反复设为 false/true，就可以通信多轮吗？** 不可以直接推出。读线程可能错过轮次，payload 也可能被下一轮覆盖。需要带序号的数据、队列、锁或其他明确的交接协议；一次发布例子的证明不能无限外推。

<a id="q-java-03"></a>
## Q-JAVA-03：AQS 到底是什么，获取失败后为什么需要队列？

AQS 是用一个同步状态与等待机制构建同步器的基础类。子类定义“何时算获取成功、何时算释放成功”，AQS 提供排队、阻塞、唤醒等协调基础；既支持独占，也支持共享模式。[S2]

以**简化的独占锁模型**说明，而不是逐行复刻某个 JDK 的内部实现：

```text
尝试以原子方式获取同步状态
├─ 成功：进入临界区
└─ 失败：进入等待流程，适当时机阻塞
            ↑ 被唤醒后仍要重新判断能否获取
持有者释放状态 → 通知合适的等待者继续竞争
```

只有不断 CAS 重试，会让竞争者持续占用 CPU；等待队列与 park/unpark 帮助协调等待。但“被唤醒”不是“已经拿到锁”，等待者需要重新检查条件。公平性也不是“有队列就自动公平”，要看具体同步器的获取策略。[S2]

`state` 的含义由实现定义：可以表示重入次数、可用许可数量等，不能把它固定理解成一个布尔值。CAS 保护的是指定内存状态的一次条件更新；复杂的不变量仍要说明保护范围。

**兼容原题：AQS 与业务幂等有什么区别？** 前者处理进程内同步器的线程协调，后者处理重复业务请求的效果，可能跨进程、重启和消息重放。它们不是替代关系。理解这个边界后，面试重点仍应回到 AQS 的 state、获取/释放与等待，而不是把整个并发章节写成某个业务案例。

<a id="q-java-02"></a>
## Q-JAVA-02：maximumPoolSize 很大，为什么任务还是堆积？

**核心回答：** `ThreadPoolExecutor` 通常先扩展到 corePoolSize，之后优先尝试入队，队列不能接收才尝试继续增加 worker。使用无界队列时，队列很难因容量拒绝任务，因此最大线程数不是“队列一长就会自动达到的线程数”。[S3]

<KnowledgeDiagram name="threadpool" />

注意比较的是**当前 worker 数量**，而不是“正在忙的线程数量”。即使已经创建的 worker 有空闲，只要数量低于 corePoolSize，新任务也可能触发创建。线程通常按需创建，配置 core=8 不等于构造函数返回时就已经有 8 个工作线程。[S3]

### 七个参数怎样一起起作用？

| 参数 | 它控制什么 | 必须回答的关联问题 |
| --- | --- | --- |
| corePoolSize | 优先维持的 worker 数量 | 为什么 core 未满时不先入队？ |
| maximumPoolSize | worker 数量上限 | 队列未满时为什么不继续扩容？ |
| keepAliveTime | 符合回收条件的空闲等待时间 | 允许核心超时时会改变什么？ |
| unit | 存活时间单位 | 毫秒和秒配置错误有什么后果？ |
| workQueue | 等待任务的存储/交接方式 | 容量和排序策略怎样影响延迟？ |
| threadFactory | 创建线程 | 命名、异常处理和创建失败怎样观测？ |
| handler | 无法接受任务时的处理 | 是报错、转移执行，还是静默丢弃？ |

这是一组配置决策，不是七个彼此独立的术语。核心线程也不是创建后永久贴着“核心”标签的特定线程，线程是否超时退出要结合当时池状态和参数判断。

### 手推一次提交过程

设 `core=2, max=4, queueCapacity=2`，所有已启动任务都被同步屏障阻塞，池一直运行，线程创建没有失败：

| 第几个提交 | 处理结果 | 此后 worker 数 / 队列长度 |
| --- | --- | --- |
| 1 | 创建 worker 执行 | 1 / 0 |
| 2 | 创建 worker 执行 | 2 / 0 |
| 3 | 入队 | 2 / 1 |
| 4 | 入队 | 2 / 2 |
| 5 | 队列满，创建 worker 直接执行 | 3 / 2 |
| 6 | 队列满，创建 worker 直接执行 | 4 / 2 |
| 7 | 不能继续入队或扩容，触发拒绝 | 4 / 2 |

这是根据上述假设推导的确定序列。特别注意：第 5、6 个任务可以早于队列里的第 3、4 个任务执行。因此“使用 FIFO 队列”不等于“整个线程池按提交顺序完成”。

### 队列换掉后，会怎样？

`ArrayBlockingQueue` 需要指定容量，容量满会触发扩容或拒绝；`LinkedBlockingQueue` 可以指定容量，不指定时默认上限很大，容易把过载表现为长时间排队；`SynchronousQueue` 不保存排队元素，需要与接收线程交接，交接失败时池更容易走增加 worker 的路径。[S3]

这几种选择没有脱离负载的最优答案。先想清楚要限制的是内存、等待时间、线程数还是下游连接，而不是习惯性把队列写成无界。

## 4. execute 和 submit 的异常处理有什么不同？

`execute` 接收 Runnable；`submit` 返回 Future，标准的执行器实现通常将任务包装为 FutureTask。FutureTask 会记录任务结果或异常，调用 `get()` 时才能观察结果或得到 `ExecutionException`。因此调用了 submit 却不检查返回值，可能让任务异常在业务层长期无人处理。[S4][S5]

| 情况 | 应观察什么 |
| --- | --- |
| execute 的任务向外抛出异常 | 工作线程的异常处理、监控与日志 |
| submit 的任务抛出异常 | Future 的完成状态；get 的 ExecutionException |
| 任务根本没有被接受 | 拒绝策略是否抛异常，Future 是否被取消 |
| 等待结果超过预算 | 有超时的 get、取消与资源清理 |

“submit 会吞掉所有异常”不准确：它将任务异常转换为 Future 中可观察的失败状态；真正的问题往往是调用方从不检查。

## 5. CallerRunsPolicy 真的能保证任务不丢吗？

不能。它在执行器尚未关闭时，可能由提交线程直接执行被拒绝任务；**执行器关闭后会丢弃该任务**。这不是语义猜测，而是该策略的官方 API 契约。[S6]

进一步推导一个容易漏掉的后果：`submit` 创建了 FutureTask，拒绝策略既不执行它、也不抛异常或取消它，调用方仍可能拿到一个永不自然完成的 Future。用没有超时的 `get()` 等待，可能一直挂住。

下面是完整的 Java 21 程序，用已关闭的线程池构造该场景，不依赖线程调度碰运气。保存为 `RejectedFutureDemo.java` 后运行 `java RejectedFutureDemo.java`。

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

public class RejectedFutureDemo {
    public static void main(String[] args) throws Exception {
        ThreadPoolExecutor pool = new ThreadPoolExecutor(
            1, 1, 1, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(1),
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
        AtomicBoolean executed = new AtomicBoolean(false);
        Future<Integer> future = null;
        try {
            pool.shutdown();
            future = pool.submit(() -> {
                executed.set(true);
                return 42;
            });
            if (executed.get() || future.isDone()) {
                throw new AssertionError("Expected discarded, unfinished task");
            }
            try {
                future.get(100, TimeUnit.MILLISECONDS);
                throw new AssertionError("Expected TimeoutException");
            } catch (TimeoutException expected) {
                System.out.println("PASS: discarded task left an unfinished Future");
            }
        } finally {
            if (future != null) future.cancel(false);
            pool.shutdownNow();
            if (!pool.awaitTermination(1, TimeUnit.SECONDS)) {
                throw new AssertionError("Executor did not terminate");
            }
        }
    }
}
```

**这不是说 CallerRunsPolicy 应该永远禁用。** 它可以给生产者施加背压，但必须考虑调用线程能否执行该任务、停机时怎么办、结果怎样反馈。例如在事件循环线程中执行阻塞任务，会把原本异步隔离的问题传回关键线程。禁止丢失的业务任务还需要持久化与明确的提交结果，不能靠一个拒绝策略名称作承诺。

## 6. 四种拒绝策略该怎样回答？

| 策略 | 基本行为 | 不能忽略的后果 |
| --- | --- | --- |
| AbortPolicy | 抛 RejectedExecutionException | 调用方必须处理，异常本身不会自动保存任务 |
| CallerRunsPolicy | 未关闭时由调用者执行；关闭时丢弃 | 可能阻塞调用者，不能保证停机时不丢 |
| DiscardPolicy | 静默丢弃 | 业务看不到失败；submit 的 Future 可能未完成 |
| DiscardOldestPolicy | 移除队头再尝试提交 | 队头不一定是业务上最不重要的任务 |

“选择一个策略”只是起点。需要给被拒绝的请求确定的反馈、监控拒绝次数；如转入持久队列，也要处理转存失败，不能在拒绝处理器中无限阻塞。[S3]

## 7. shutdown、shutdownNow、cancel 分别能保证什么？

`shutdown` 停止接受新任务，但允许已有任务继续；`shutdownNow` 尝试中断运行任务，并返回尚未开始的排队任务。二者都不是“杀死任意 Java 代码”的开关。[S5]

`cancel(true)` 可以尝试中断正在运行的任务，但任务必须响应中断或依靠下游超时。Future 显示取消，不代表某个远端请求已经撤销。如果任务忽略中断，或者阻塞在不响应中断的操作中，资源还可能继续占用。

停机流程应包含停止接收、等待期限、取消/中断、处理未执行任务和最终资源清理。不要把 `awaitTermination` 当成会主动停止任务的方法，它是在等待终止条件。

## 8. 线程池大小怎么定，为什么不能只背 CPU 核数乘二？

先判断任务花时间在哪里：CPU 计算、IO 等待、锁竞争，还是等待下游连接。增加线程只对可重叠的等待有可能有帮助；对已经饱和的 CPU 或有限的数据库连接，继续加线程可能只是把排队搬到别处。

一个**数量级推导**：若稳定处理 200 次/秒，每次在某个阶段平均占用 0.05 秒，该阶段平均约有 10 个请求在途。这里用的是到达率与平均停留时间关系；它不能直接证明“线程数应该为 10”，也没有覆盖突发、尾延迟和资源上限。应按真实负载压测并保留余量，而不是从一个公式推导所有参数。

| 现象 | 最先补的证据 | 可能的动作 |
| --- | --- | --- |
| 队列增长，CPU 很低 | 线程栈、锁等待、连接池等待 | 修复阻塞；按资源预算调整并发 |
| CPU 已饱和 | CPU profile、请求量、热点路径 | 减少计算、限流、扩实例 |
| 拒绝突然增加 | 池是否关闭、队列容量、流量突增 | 区分停机错误与过载保护 |
| 个别任务一直不结束 | 下游超时、递归提交、取消响应 | 设置期限、拆分依赖、修复无界等待 |

## 9. 两个需要真正推导的追问

**同一个池里的任务又 submit 子任务并 get，会怎样？** 假设池有两个线程，两个父任务各占一个线程，分别把子任务放入同一队列后等待。没有线程执行子任务，父任务又不释放线程，就形成线程饥饿死锁。增加一点队列容量不能解决这个依赖循环。

**一个拒绝策略为什么会影响接口超时？** 如果它把任务交给请求线程执行，异步任务耗时就进入接口的响应路径。此时必须看接口预算和调用线程角色，而不只是观察线程池是否抛异常。

## 如何验证

本页完整 main 可独立运行；发布示例是用于解释规范的单次通信片段，不是并发压力测试。已有 [线程池屏障实验](../projects/experiments.md)演示 core → queue → expand → reject；压力与生产容量仍需实际服务测量。验证记录与内容质量分开，不把断言数量作为文章正确性的替代。

## 参考资料

- S1：[JLS 21 Chapter 17](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html)，重点是同步关系和 happens-before 的传递性。
- S2：[Java 21 AbstractQueuedSynchronizer](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/AbstractQueuedSynchronizer.html)，state、独占/共享模式与排队基础。
- S3：[Java 21 ThreadPoolExecutor](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html)，队列选择、线程增长、拒绝与钩子说明。
- S4：[Java 21 FutureTask](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/FutureTask.html)，任务完成、异常和取消状态。
- S5：[Java 21 ExecutorService](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ExecutorService.html)，submit、关闭与等待终止。
- S6：[Java 21 CallerRunsPolicy](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.CallerRunsPolicy.html)，注意执行器关闭后的丢弃行为。
- 选题对照：[JavaGuide 线程池详解](https://javaguide.cn/java/concurrent/java-thread-pool-summary.html)。本文的任务序列和代码反例独立编写，未搬运原文。
