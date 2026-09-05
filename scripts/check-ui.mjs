// CI browser smoke tests. Browser plugin not available in authoring environment;
// regular Playwright runs against the actual built VuePress output.
import { createServer } from 'node:http';
import { readFile, mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const modulePath=process.env.WIKI_PLAYWRIGHT_MODULE;
if(!modulePath)throw new Error('Set WIKI_PLAYWRIGHT_MODULE to the isolated Playwright index.mjs');
const { chromium }=await import(pathToFileURL(modulePath).href);
const root=path.resolve('docs/.vuepress/dist');
const output=path.resolve('.test-artifacts');await mkdir(output,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.woff':'font/woff','.webp':'image/webp','.ico':'image/x-icon'};
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
    if(!pathname.startsWith('/interview/')){res.writeHead(404);res.end('Not found');return;}
    let file=path.resolve(root,pathname.slice('/interview/'.length)||'index.html');
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    if((await stat(file)).isDirectory())file=path.join(file,'index.html');
    const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data);
  }catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true});
const report={origin,viewports:[],checks:[],console:[],status:'running'};
let activePage;
function pass(label){report.checks.push(label);console.log(`UI PASS: ${label}`);}
async function noOverflow(page,label){
  const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  assert(sizes.scroll<=sizes.client+2,`${label}: document overflow ${JSON.stringify(sizes)}`);pass(`${label}: no document horizontal overflow`);
}
async function ready(page,url,title){
  const response=await page.goto(origin+url,{waitUntil:'networkidle'});
  assert.equal(response?.status(),200);assert((await page.title()).includes(title));
  await page.locator('h1').first().waitFor();assert((await page.locator('h1').first().innerText()).length>3);
  assert.equal(await page.locator('vite-error-overlay').count(),0);pass(`page identity and meaningful render: ${url}`);
}
try{
  for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
    const context=await browser.newContext({viewport,acceptDownloads:true});
    const page=await context.newPage();activePage=page;report.viewports.push(viewport);
    page.on('pageerror',error=>report.console.push(`pageerror: ${error.message}`));
    page.on('console',message=>{if(['error','warning'].includes(message.type()))report.console.push(`${message.type()}: ${message.text()}`);});
    await ready(page,'/interview/','面试知识库');
    await noOverflow(page,`home ${viewport.width}`);
    await page.screenshot({path:path.join(output,`home-${viewport.width}.png`),fullPage:true});
    await ready(page,'/interview/practice/','面试训练');
    const board=page.locator('.practice-board');await board.locator('button').first().waitFor();
    await page.waitForFunction(()=>!document.querySelector('.practice-board button')?.disabled);
    assert.equal(await board.locator('.question-row').count(),36);
    const search=board.locator('input[type=search]');await search.fill('Q-DB-01');
    await page.waitForFunction(()=>document.querySelectorAll('.question-row').length===1);
    const score=board.getByLabel('Q-DB-01 自评分',{exact:true});await score.selectOption('3');
    await page.reload({waitUntil:'networkidle'});
    await page.waitForFunction(()=>!document.querySelector('.practice-board button')?.disabled);
    assert.equal(await board.getByLabel('Q-DB-01 自评分',{exact:true}).inputValue(),'3');
    pass(`score persists after reload ${viewport.width}`);
    await board.locator('input[type=search]').fill('Q-DB-01');
    await board.locator('input[type=checkbox]').check();
    await page.waitForFunction(()=>document.querySelectorAll('.question-row').length===0);
    assert((await board.innerText()).includes('没有匹配题目'));
    await board.locator('input[type=checkbox]').uncheck();await board.locator('input[type=search]').fill('');
    await board.locator('.practice-controls select').first().selectOption('agent');
    const agentCount=await board.locator('.question-row').count();assert(agentCount>0&&agentCount<36);pass(`role and weak-item filters ${viewport.width}`);
    await board.locator('.practice-controls select').first().selectOption('all');
    const downloadPromise=page.waitForEvent('download');await board.getByRole('button',{name:'导出进度',exact:true}).click();
    const download=await downloadPromise;const saved=path.join(output,`progress-${viewport.width}.json`);await download.saveAs(saved);
    const data=JSON.parse(await readFile(saved,'utf8'));assert.equal(data.version,1);assert.equal(data.scores['Q-DB-01'],3);
    page.once('dialog',dialog=>dialog.accept());await board.getByRole('button',{name:'清空评分',exact:true}).click();
    assert.equal(await board.getByLabel('Q-DB-01 自评分',{exact:true}).inputValue(),'');
    await board.locator('input[type=file]').setInputFiles(saved);
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('interview-wiki-practice-v1')||'{}')['Q-DB-01']===3);
    pass(`progress export, reset and import ${viewport.width}`);
    await noOverflow(page,`practice ${viewport.width}`);
    await page.screenshot({path:path.join(output,`practice-${viewport.width}.png`),fullPage:true});
    await ready(page,'/interview/guide/visual-map.html','可视化学习地图');
    assert.equal(await page.locator('.knowledge-diagram svg').count(),5);
    const diagramProblems=await page.locator('.knowledge-diagram svg').evaluateAll(svgs=>svgs.flatMap(svg=>{
      const problems=[];if(!svg.querySelector('title')?.textContent||!svg.querySelector('desc')?.textContent)problems.push('missing accessible text');
      const view=svg.viewBox.baseVal;
      for(const text of svg.querySelectorAll('text')){const b=text.getBBox();const matrix=text.getCTM();const svgMatrix=svg.getCTM();if(!matrix||!svgMatrix)continue;const transform=svgMatrix.inverse().multiply(matrix);const x=b.x*transform.a+b.y*transform.c+transform.e;const y=b.x*transform.b+b.y*transform.d+transform.f;if(x < -2||y < -2||x+b.width>view.width+2||y+b.height>view.height+2)problems.push(`text outside viewBox: ${text.textContent}`);}
      return problems;
    }));
    assert.deepEqual(diagramProblems,[]);
    const first=page.locator('.knowledge-diagram').first();await first.locator('summary').click();assert(await first.locator('details').evaluate(el=>el.open));
    await noOverflow(page,`diagrams ${viewport.width}`);
    await page.screenshot({path:path.join(output,`diagrams-${viewport.width}.png`),fullPage:true});
    pass(`SVG labels, text alternatives and disclosure ${viewport.width}`);
    await context.close();activePage=undefined;
  }
  assert.deepEqual(report.console.filter(x=>x.startsWith('pageerror:')||x.startsWith('error:')),[],'Unexpected browser errors');
  report.status='passed';pass('No browser runtime or console errors');
}catch(error){
  report.status='failed';report.error=String(error);
  if(activePage)await activePage.screenshot({path:path.join(output,'failure.png'),fullPage:true}).catch(()=>{});
  throw error;
}finally{
  await writeFile(path.join(output,'ui-report.json'),JSON.stringify(report,null,2));
  await browser.close();await new Promise(resolve=>server.close(resolve));
}
