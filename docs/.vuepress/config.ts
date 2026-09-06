import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
import { hopeTheme } from "vuepress-theme-hope";

const sections = [
  { text: "🧭 学习与资料", prefix: "/guide/", children: ["", "question-bank", "answer-method", "coverage-audit", "visual-map", "sources", "updates"] },
  { text: "🧠 AI 应用开发", prefix: "/ai/", children: ["", "llm-basics", "transformer-inference", "rag", "retrieval", "rag-lab", "structured-output", "evaluation", "evaluation-lab", "serving", "java-service"] },
  { text: "🛠 Agent 开发", prefix: "/agent/", children: ["", "architecture", "runtime-lab", "tools-mcp", "tool-contracts", "skills", "skill-context-lab", "context-memory", "reliability", "evaluation"] },
  { text: "⚙️ 后端开发", prefix: "/backend/", children: ["", "java-foundations", "java-collections", "concurrency", "jmm-threadpool", "jvm", "spring", "spring-mybatis", "mysql", "mysql-mvcc", "mysql-locking", "mysql-logging", "redis", "consistency", "cache-outbox", "messaging", "network", "os-rpc"] },
  { text: "🧩 算法题", prefix: "/algorithms/", children: ["", "arrays", "sliding-window", "linked-list", "binary-search", "trees", "graphs", "dynamic-programming", "heap", "lru", "two-pointers", "prefix-stack", "tree-graph-extended", "backtracking", "dp-greedy", "acm-testing"] },
  { text: "🏗 场景设计", prefix: "/system-design/", children: ["", "short-url", "group-chat", "flash-sale", "approval", "rag-platform", "database-agent"] },
  { text: "🔬 附录：案例与实验", prefix: "/projects/", children: ["", "database-agent", "inventory-reservation", "approval-consistency", "experiments"] },
  { text: "🎯 面试训练", prefix: "/practice/", children: ["", "java-backend", "ai-application", "agent-engineering", "review-template"] },
];
export default defineUserConfig({
  base: "/interview/", lang: "zh-CN", title: "面试知识库",
  description: "Java 后端、AI 应用与 Agent 的通用面试知识：公开资料选题、机制推导、具体反例和来源核验。",
  bundler: viteBundler(),
  theme: hopeTheme({
    hostname: "https://jdysya.github.io/interview/", author: "Interview Wiki",
    repo: "jdysya/interview", docsDir: "docs", docsBranch: "main",
    navbar: [
      { text: "🧭 开始", link: "/guide/" },
      { text: "知识专题", children: [{text:"🧠 AI 应用",link:"/ai/"},{text:"🛠 Agent",link:"/agent/"},{text:"⚙️ 后端",link:"/backend/"}] },
      { text: "🧩 算法", link: "/algorithms/" },
      { text: "🏗 场景", link: "/system-design/" },
      { text: "资料与核验", link: "/guide/sources.html" },
      { text: "🎯 自测", link: "/practice/" },
    ],
    sidebar: sections.map(section => ({ ...section, collapsible: true })),
    darkmode: "switch", pure: true, breadcrumb: true, displayFooter: true,
    footer: "先说明边界，再解释机制，最后验证方案。", copyright: false,
    contributors: false, lastUpdated: true, editLink: true, pageInfo: ["reading-time"],
    plugins: { slimsearch: { indexContent: true }, copyCode: true },
  }),
});
