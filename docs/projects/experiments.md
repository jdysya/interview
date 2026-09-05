---
title: 实验总览：运行命令、覆盖范围与未验证项
date: 2026-09-05
---

# 实验总览：运行命令、覆盖范围与未验证项

> 复习优先级：P0 · 整理与来源核验：2026-09-05

本站实验使用合成数据，不需要模型 API Key、生产数据库或外部服务。执行记录以对应提交的 GitHub Actions 为准；文档中的预期不自动等于已经运行通过。

## 运行方式

在仓库根目录，安装 Java 21、Python 3 和项目声明的 Node 环境后：

```bash
npm ci
npm run check:content
npm run check:learning
npm run check:algorithms
npm run check:extended
npm run check:engineering
npm run docs:build
npm run check:dist
```

Python 实验只使用标准库。算法脚本从实际 Markdown 提取 Java 代码再运行，避免“文档代码错了、单独维护的测试实现却是对的”。

## 实验清单

| 实验 | 文件 | 实际覆盖 | 不代表什么 |
| --- | --- | --- | --- |
| 原有 9 道算法 | scripts/check-algorithms.mjs | 已发布题解代码和边界用例 | 不是穷尽所有输入 |
| 新增 21 道算法 | scripts/check-extended.mjs | 示例、边界与部分随机对拍 | 随机测试不替代证明 |
| 线程池饱和 | examples/ThreadPoolChecks.java | 核心→队列→扩容→拒绝 | 不代表业务压测吞吐 |
| 远端成功后恢复 | examples/engineering_checks.py | 双 SQLite 账本、稳定业务键、参数冲突 | 不代表真实跨机服务所有语义 |
| 库存状态机 | 同上 | 预占、释放、扣减互斥与事务内更新 | 不代表 MySQL 多连接竞争测试 |
| 缓存竞态 | 同上 | 确定顺序重现旧值晚回填 | 不代表真实网络故障集成测试 |
| 评测逻辑 | examples/eval-cases.jsonl 与 Python 脚本 | Recall、MRR、无答案拒答分开统计 | 不代表模型质量结果 |
| 页面与自测交互 | scripts/check-ui.mjs | 图示、筛选、评分、刷新持久化、桌面与窄屏 | 不代表所有浏览器都测试 |

## 实验报告模板

记录：提交 SHA、运行命令、依赖版本、输入与种子、预期、实际输出、失败时日志和截图。性能实验另记录硬件、预热、并发、样本数、分位数、失败率；不要只保留一个最快样本。

MySQL 双会话实验需要自行准备测试数据库，本轮 CI 不安装 MySQL。Spring/MyBatis 和 Java AI 服务中的片段是教学示意，不包含完整框架集成项目。真实 LLM 的检索、上下文压缩 A/B 与生成质量实验仍需接入模型后另行执行。

## 如何阅读失败

格式检查失败先定位文件和题目 ID；算法失败保留输入并转成固定回归用例；工程实验失败先判断测试前提还是机制错误；页面测试失败不能用“构建成功”替代。遇到版本变化，更新实际核验过的页面，不批量刷新全部日期。

## 参考资料

- [Java 21：ThreadPoolExecutor](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html)
- [Python：unittest](https://docs.python.org/3/library/unittest.html)
- [Playwright：Test assertions](https://playwright.dev/docs/test-assertions)
