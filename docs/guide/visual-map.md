---
title: 可视化学习地图
date: 2026-09-05
---

# 🗺 可视化学习地图

图示帮助解释因果与失败分支，不表示真实系统已经部署。每张图提供文字版；窄屏内可横向滚动，图标同时配有文字，不靠颜色区分状态。图示由本站 SVG 组件绘制，无远程图片服务和额外图表依赖。

## 数据、模型与执行

<KnowledgeDiagram name="rag" />

沿着 [RAG 实验](../ai/rag-lab.md) → [评测实践](../ai/evaluation-lab.md) → [Java AI 服务](../ai/java-service.md) 学习。

<KnowledgeDiagram name="runtime" />

沿着 [Runtime 实验](../agent/runtime-lab.md) → [工具契约](../agent/tool-contracts.md) → [Skill 与上下文](../agent/skill-context-lab.md) 学习。

## 从后端基础到项目

<KnowledgeDiagram name="cache" />

缓存问题先看 [竞态与 Outbox](../backend/cache-outbox.md)，不要把删除成功等同于线性一致。

<KnowledgeDiagram name="mvcc" />

通过 [MVCC](../backend/mysql-mvcc.md) 和 [双会话锁实验](../backend/mysql-locking.md) 区分版本可见性与互斥。

<KnowledgeDiagram name="inventory" />

最后进入 [库存预占项目](../projects/inventory-reservation.md) 与 [审批一致性项目](../projects/approval-consistency.md)，说明状态、幂等键和恢复点。

## 读图后必须回答

一条箭头是什么事件？失败后停在哪个状态？哪一步有外部副作用？什么事实必须落盘？图里省略了哪些约束？能否写出一个反例或测试验证这条箭头？

[打开自测题库](../practice/README.md)
