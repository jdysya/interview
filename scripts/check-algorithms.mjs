import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const pages=['arrays','sliding-window','linked-list','binary-search','trees','graphs','dynamic-programming','heap','lru'];
const snippets=[];
for(const page of pages){
  const text=await readFile(`docs/algorithms/${page}.md`,'utf8');
  const blocks=[...text.matchAll(/```java\n([\s\S]*?)\n```/g)];
  if(!blocks.length) throw new Error(`No Java snippet in ${page}`);
  snippets.push(...blocks.map(m=>m[1]));
}
const harness=await readFile('scripts/AlgorithmChecks.java.inc','utf8');
const dir=await mkdtemp(join(tmpdir(),'interview-java-'));
try{
  const source=join(dir,'AlgorithmChecks.java');
  await writeFile(source,`import java.util.*;\npublic class AlgorithmChecks {\n${snippets.join('\n')}\n${harness}\n}\n`);
  execFileSync('java',['-Dfile.encoding=UTF-8',source],{stdio:'inherit'});
}finally{ await rm(dir,{recursive:true,force:true}); }
