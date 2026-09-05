# 面试知识库 · Interview Wiki

面向 AI 应用开发、Agent 开发与 Java 后端开发的中文 VuePress Theme Hope Wiki。

[站点](https://jdysya.github.io/interview/) · [专题索引](docs/guide/question-bank.md) · [自测](docs/practice/README.md) · [可视化地图](docs/guide/visual-map.md) · [实验说明](docs/projects/experiments.md)

## 内容

保留首版 36 篇专题，在此基础上增加机制详解、3 条项目主线和岗位模拟面试。算法从 9 道扩充至 30 道；另有 36 道带稳定 ID 的机制自测题、9 种 SVG 图示。文章、题目和实验分别计数。

自测支持岗位/关键词/未掌握筛选、0–4 分评分及 JSON 导入导出。数据只保存在浏览器 localStorage，无服务端账号和同步服务。图示提供文字说明与窄屏横向滚动。

## 开发与验证

Node.js 24、Java 21、Python 3。依赖由 package-lock.json 固定；Python 示例只用标准库。

```bash
npm ci
npm run docs:dev
```

```bash
npm run check:content
npm run check:learning
npm run check:algorithms
npm run check:extended
npm run check:engineering
npm run docs:build
npm run check:dist
```

浏览器 UI 检查由 CI 安装隔离的固定版本 Playwright 后运行 `scripts/check-ui.mjs`，不修改站点依赖。具体覆盖与未验证项见实验说明；以对应提交的 Actions 结果为准，不把文档预期当作已运行证据。

## 发布

`.github/workflows/deploy.yml` 校验 PR；main 推送和手动运行时构建并发布。GitHub Settings → Pages → Source 使用 GitHub Actions。PR 不部署生产站点。

站点 base 为 `/interview/`。更名或绑定域名时，检查 `docs/.vuepress/config.ts`、产物校验和 UI 测试的路径。构建产物位于 `docs/.vuepress/dist`，不提交到 main。

## 维护

新增文章同步更新章节 README、专题索引、导航、来源目录和更新记录；自测题更新 `docs/.vuepress/data/questions.json` 并给目标章节稳定锚点。图示在 `diagrams.ts` 维护，必须有可理解的文字说明。

参见 [AGENTS.md](AGENTS.md)、[CONTRIBUTING.md](CONTRIBUTING.md) 和 [内容模板](templates/topic.md)。不公开公司内部信息，不把教学设计写成真实上线成果，不虚构性能数据或面试来源。
