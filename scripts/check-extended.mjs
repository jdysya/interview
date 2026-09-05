import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const pages = ['two-pointers','prefix-stack','tree-graph-extended','backtracking','dp-greedy'];
const snippets = [];
for (const page of pages) {
  const text = await readFile(`docs/algorithms/${page}.md`, 'utf8');
  const blocks = [...text.matchAll(/```java\n([\s\S]*?)\n```/g)];
  if (blocks.length !== 1) throw new Error(`Expected one tested Java block: ${page}`);
  snippets.push(blocks[0][1]);
}
const harness = await readFile('scripts/ExtendedChecks.java.inc', 'utf8');
const dir = await mkdtemp(join(tmpdir(), 'interview-extended-'));
try {
  const source = join(dir, 'ExtendedChecks.java');
  await writeFile(source, `import java.util.*;\npublic class ExtendedChecks {\n${snippets.join('\n')}\n${harness}\n}\n`);
  execFileSync('java', ['-Dfile.encoding=UTF-8', source], {stdio:'inherit', timeout:120000});
  const acm = await readFile('docs/algorithms/acm-testing.md', 'utf8');
  const block = /```java\n([\s\S]*?)\n```/.exec(acm);
  if (!block) throw new Error('ACM code missing');
  const main = join(dir, 'Main.java'); await writeFile(main, block[1]);
  const output = execFileSync('java', [main], {input:'2\n3 1 2 3\n2 -2147483648 2147483647\n',encoding:'utf8',timeout:30000});
  if (output.replace(/\r/g,'') !== '6\n-1\n') throw new Error(`Unexpected ACM result: ${output}`);
  console.log('Published ACM parser example passed.');
} finally { await rm(dir, {recursive:true, force:true}); }
