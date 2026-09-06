import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('docs');
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.filter(e => !e.name.startsWith('.')).map(e => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : full.endsWith('.md') ? [full] : [];
  }))).flat();
}
const errors = [];
const files = await walk(root);
for (const file of files) {
  const text = await readFile(file, 'utf8');
  const rel = path.relative(root, file);
  if (!/^---\n[\s\S]*?\ntitle:|^---\ntitle:/m.test(text)) errors.push(`${rel}: missing title`);
  if (!/^# /m.test(text)) errors.push(`${rel}: missing heading`);
  if ((text.match(/^```/gm) ?? []).length % 2) errors.push(`${rel}: unclosed code fence`);
  if (/^(ai|agent|backend|algorithms|system-design)\//.test(rel) && !rel.endsWith('README.md')) {
    const hasSources = text.includes('## 参考资料') || /^## (?:\d+\. )?本页核验范围$/m.test(text);
    const hasReviewDate = /(?:整理与来源核验|核验日期)：\d{4}-\d{2}-\d{2}/.test(text);
    if (!hasSources) errors.push(`${rel}: missing sources`);
    if (!hasReviewDate) errors.push(`${rel}: missing review date`);
  }
  const prose = text.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
  for (const [,target] of prose.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
    if (/^(?:https?:|mailto:|#)/.test(target)) continue;
    const clean = decodeURIComponent(target.split('#')[0].split('?')[0]);
    if (!clean) continue;
    let full = clean.startsWith('/') ? path.join(root,clean) : path.resolve(path.dirname(file),clean);
    if (clean.endsWith('/')) full = path.join(full,'README.md');
    try { await access(full); } catch { errors.push(`${rel}: broken link ${target}`); }
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Validated ${files.length} Markdown pages and their local links.`);
