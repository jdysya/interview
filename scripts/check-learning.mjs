import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('docs');
async function walk(dir) {
  return (await Promise.all((await readdir(dir,{withFileTypes:true})).filter(e=>!e.name.startsWith('.')).map(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat();
}
const files=(await walk(root)).filter(f=>f.endsWith('.md'));
const texts=new Map(await Promise.all(files.map(async f=>[f,await readFile(f,'utf8')])));
const questions=JSON.parse(await readFile('docs/.vuepress/data/questions.json','utf8'));
const diagrams=await readFile('docs/.vuepress/data/diagrams.ts','utf8');
const names=new Set([...diagrams.matchAll(/^  (\w+): (?:flow\(|\{)/gm)].map(m=>m[1]));
const errors=[];
for(const [file,text] of texts){
  const rel=path.relative(root,file);
  if(!/^---\n[\s\S]*?\n---\n/.test(text))errors.push(`${rel}: invalid frontmatter boundary`);
  if(/^ +(?:title|date):/m.test(text.split('\n---\n')[0]))errors.push(`${rel}: indented top-level metadata`);
  if(/^(ai|agent|backend|algorithms|system-design|projects)\//.test(rel)&&!rel.endsWith('README.md')){
    if(!text.includes('## 参考资料'))errors.push(`${rel}: sources missing`);
    if(!/整理与来源核验：\d{4}-\d{2}-\d{2}/.test(text))errors.push(`${rel}: review date missing`);
  }
  for(const [,name] of text.matchAll(/<KnowledgeDiagram\s+name="([^"]+)"/g))if(!names.has(name))errors.push(`${rel}: unknown diagram ${name}`);
  const anchors=[...text.matchAll(/<a id="([^"]+)"/g)].map(m=>m[1]);
  if(new Set(anchors).size!==anchors.length)errors.push(`${rel}: duplicate explicit anchors`);
}
const ids=new Set();
for(const q of questions){
  if(!/^Q-[A-Z]+-\d{2}$/.test(q.id)||ids.has(q.id))errors.push(`Invalid/duplicate question ID ${q.id}`);
  ids.add(q.id);
  if(!q.title||!q.topic||!['P0','P1'].includes(q.priority)||!Array.isArray(q.roles)||!q.roles.length||q.roles.some(r=>!['ai','agent','backend'].includes(r)))errors.push(`${q.id}: invalid question metadata`);
  if(!/^\/[a-z-]+\/[a-z-]+\.html#q-[a-z]+-\d{2}$/.test(q.path)){errors.push(`${q.id}: invalid route`);continue;}
  const [route,anchor]=q.path.split('#');
  const file=path.join(root,route.slice(1).replace(/\.html$/,'.md'));
  if(!texts.get(file)?.includes(`<a id="${anchor}"></a>`))errors.push(`${q.id}: target anchor missing`);
  if(anchor!==q.id.toLowerCase())errors.push(`${q.id}: anchor must match stable ID`);
}
const config=await readFile('docs/.vuepress/config.ts','utf8');
for(const [,prefix,children] of config.matchAll(/prefix: "([^"]+)", children: \[([^\]]*)\]/g)){
  for(const [,child] of children.matchAll(/"([^"]*)"/g)){
    const file=path.join(root,prefix.slice(1),child?`${child}.md`:'README.md');
    try{await access(file);}catch{errors.push(`Missing sidebar page ${file}`);}
  }
}
if(names.size!==9)errors.push(`Expected 9 diagram definitions, found ${names.size}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Learning checks: ${files.length} Markdown pages, ${questions.length} stable question anchors, ${names.size} diagrams; sidebar targets valid.`);
