import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('docs/.vuepress/dist');
const base = '/interview/';
async function walk(dir) {
  return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e => {
    const f=path.join(dir,e.name); return e.isDirectory()?walk(f):[f];
  }))).flat();
}
const files=await walk(root);
const htmlFiles=files.filter(f=>f.endsWith('.html'));
const errors=[];
for(const file of htmlFiles){
  const html=await readFile(file,'utf8');
  for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(!url.startsWith(base)) continue;
    const clean=decodeURIComponent(url.slice(base.length).split('#')[0].split('?')[0]);
    let target=path.join(root,clean);
    if(!clean || clean.endsWith('/')) target=path.join(target,'index.html');
    try { if(!(await stat(target)).isFile()) errors.push(`${file}: not a file ${url}`); }
    catch { errors.push(`${path.relative(root,file)}: missing ${url}`); }
  }
}
for(const route of ['index.html','ai/rag.html','agent/context-memory.html','backend/consistency.html','algorithms/lru.html','system-design/database-agent.html']){
  if(!files.includes(path.join(root,route))) errors.push(`Missing route: ${route}`);
}
if(!files.some(f=>/search/i.test(f))) errors.push('Search assets missing');
if(errors.length){console.error([...new Set(errors)].join('\n'));process.exit(1);}
console.log(`Validated ${htmlFiles.length} rendered HTML pages and local asset/navigation targets.`);
