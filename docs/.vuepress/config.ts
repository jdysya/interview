import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
import { hopeTheme } from "vuepress-theme-hope";

const sections = [
  { text: "学习路线", prefix: "/guide/", children: ["", "question-bank", "answer-method", "sources", "updates"] },
  { text: "AI 应用开发", prefix: "/ai/", children: ["", "llm-basics", "rag", "retrieval", "structured-output", "evaluation", "serving"] },
  { text: "Agent 开发", prefix: "/agent/", children: ["", "architecture", "tools-mcp", "skills", "context-memory", "reliability", "evaluation"] },
  { text: "后端开发", prefix: "/backend/", children: ["", "java-collections", "concurrency", "jvm", "spring", "mysql", "redis", "consistency", "messaging", "network"] },
  { text: "算法题", prefix: "/algorithms/", children: ["", "arrays", "sliding-window", "linked-list", "binary-search", "trees", "graphs", "dynamic-programming", "heap", "lru"] },
  { text: "场景设计", prefix: "/system-design/", children: ["", "short-url", "group-chat", "flash-sale", "approval", "rag-platform", "database-agent"] },
];

export default defineUserConfig({
  base: "/interview/",
  lang: "zh-CN",
  title: "面试知识库",
  description: "AI 应用、Agent、Java 后端、算法与场景设计：回答要点、追问与官方资料。",
  bundler: viteBundler(),
  theme: hopeTheme({
    hostname: "https://jdysya.github.io/interview/",
    author: "Interview Wiki",
    repo: "jdysya/interview",
    docsDir: "docs",
    docsBranch: "main",
    navbar: [
      { text: "开始复习", link: "/guide/" },
      { text: "AI 应用", link: "/ai/" },
      { text: "Agent", link: "/agent/" },
      { text: "后端", link: "/backend/" },
      { text: "算法", link: "/algorithms/" },
      { text: "场景设计", link: "/system-design/" },
    ],
    sidebar: sections.map(section => ({ ...section, collapsible: true })),
    darkmode: "switch",
    pure: true,
    breadcrumb: true,
    displayFooter: true,
    footer: "先说明边界，再解释机制，最后验证方案。",
    copyright: false,
    contributors: false,
    lastUpdated: true,
    editLink: true,
    pageInfo: ["reading-time"],
    plugins: {
      slimsearch: { indexContent: true },
      copyCode: true,
    },
  }),
});
