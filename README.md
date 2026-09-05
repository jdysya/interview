# 面试知识库 · Interview Wiki

面向 AI 应用开发、Agent 开发与 Java 后端开发的中文面试 Wiki。

- [站点地址](https://jdysya.github.io/interview/)（需要先在仓库启用 GitHub Pages）
- [题目索引](docs/guide/question-bank.md)
- [学习路线](docs/guide/README.md)
- [资料来源](docs/guide/sources.md)
- [更新记录](docs/guide/updates.md)

首版：2026-09-05，36 篇专题，包含 9 道 Java 算法详解与 6 道场景设计。每篇提供机制、边界与参考资料。

## 本地开发

Node.js 24，Java 17+（校验算法示例）。

```bash
npm ci
npm run docs:dev
```

验证与构建：

```bash
npm run check:content
npm run check:algorithms
npm run docs:build
npm run check:dist
```

构建产物位于 `docs/.vuepress/dist`，不提交到 main。Node/npm 依赖由 package-lock.json 固定。

## GitHub Pages 首次配置

进入 [Settings → Pages](https://github.com/jdysya/interview/settings/pages)，将 Build and deployment → Source 设为 **GitHub Actions**。

`.github/workflows/deploy.yml` 在 PR 时校验构建；main 推送和手动运行时校验、构建并发布。首次启用 Pages 后，若之前部署失败，可在 Actions 重跑失败任务。PR 不部署生产站点。

站点路径固定为 `/interview/`。更换仓库名或绑定域名时，同步修改 `docs/.vuepress/config.ts` 中的 base 与 hostname，以及 `scripts/check-dist.mjs` 的检查基准。

## 内容维护

日常修改 `docs` 中的 Markdown，新增页面同步更新导航与题目索引。版本敏感内容核对官方来源。详见 [维护约定](AGENTS.md) 与 [贡献说明](CONTRIBUTING.md)。

本站不需要运行时模型 API 密钥、数据库或服务器。搜索索引在构建时生成，页面在浏览器端检索。
