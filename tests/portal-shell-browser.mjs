import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chromium,firefox,webkit} from 'playwright';
import {portalPages,navigationItems,shellVersion} from '../js/portal-navigation-model.mjs';

const base=process.env.PORTAL_BASE_URL||'http://127.0.0.1:8765';
const engine=process.env.PORTAL_ENGINE||'chromium';
const widths=[320,360,390,430,768,1024,1280,1440,1920];
const output='ui-screenshots/portal-shell';
mkdirSync(output,{recursive:true});
const launch={headless:true,...(engine==='chromium'?{args:['--no-sandbox'],...(process.env.PORTAL_BROWSER_CHANNEL?{channel:process.env.PORTAL_BROWSER_CHANNEL}:{})}:{})};
const browser=await ({chromium,firefox,webkit}[engine]).launch(launch);
const failures=[],evidence=[],baseline=new Map(),groupBaseline=new Map();
const record=(name,error)=>failures.push({name,error:error.stack||String(error)});
const check=(name,fn)=>{try{fn();}catch(error){record(name,error);}};
const url=file=>new URL(file,base.endsWith('/')?base:base+'/').href;
async function prepare(context){
  // Isolate public read-only UI tests from production analytics and calendar calls.
  await context.route(/https:\/\/(?:www\.)?(?:googletagmanager\.com|google-analytics\.com|analytics\.google\.com)\//,route=>route.fulfill({status:200,contentType:'application/javascript',body:''}));
  await context.route('https://script.google.com/**',route=>{
    assert.equal(route.request().method(),'GET','browser audit must never write to production calendar');
    const callback=new URL(route.request().url()).searchParams.get('callback');
    return route.fulfill({status:200,contentType:callback?'application/javascript':'application/json',body:callback?`${callback}(${JSON.stringify({ok:true,events:[],updatedAt:'browser audit fixture'})});`:JSON.stringify({ok:true,events:[]})});
  });
}
function monitor(page,label){
  page.on('pageerror',error=>record(label+' JavaScript',error));
  page.on('console',message=>{if(message.type()==='error')record(label+' console',new Error(message.text()));});
  page.on('response',response=>{if(new URL(response.url()).origin===new URL(base).origin&&response.status()>=400)record(label+' HTTP '+response.status(),new Error(response.url()));});
}
async function ready(page,file){
  await page.goto(url(file),{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.portalNavigationReady==='true');
  await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
}
async function snapshot(page){
  return page.evaluate(()=>{
    const properties=['backgroundColor','color','fontFamily','fontSize','fontWeight','lineHeight','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderTopColor','borderRadius','paddingTop','paddingRight','paddingBottom','paddingLeft','columnGap','rowGap','minHeight','boxSizing','position','zIndex'];
    const style=node=>Object.fromEntries(properties.map(key=>[key,getComputedStyle(node)[key]]));
    const rect=node=>{const b=node.getBoundingClientRect();return Object.fromEntries(['x','y','width','height'].map(key=>[key,Math.round(b[key]*100)/100]));};
    const component=selector=>{const node=document.querySelector(selector);return node?{style:style(node),rect:rect(node)}:null;};
    const nav=document.querySelector('.portal-service-nav');
    const active=nav?.querySelector('.portal-nav-current [aria-current="page"]');
    const commonHeader=Object.fromEntries(['.site-header','.header-inner','.brand','.brand-mark','.brand-copy','.brand-copy strong','.brand-copy small','.brand-full','.brand-short','.menu-toggle'].map(selector=>[selector,component(selector)]));
    const relativeRect=node=>{const value=rect(node),origin=rect(nav);value.x=Math.round((value.x-origin.x)*100)/100;value.y=Math.round((value.y-origin.y)*100)/100;return value;};
    const buttons=[...(nav?.querySelectorAll('.portal-nav-current .portal-nav-items a')||[])].map(node=>{const value=style(node);delete value.backgroundColor;delete value.color;delete value.borderTopColor;return {id:node.dataset.navId,style:value,rect:relativeRect(node)};});
    const moreNode=nav?.querySelector('.portal-nav-more summary');
    return {header:commonHeader,headerCount:document.querySelectorAll('.site-header').length,mainCount:document.querySelectorAll('main').length,shell:document.querySelector('.site-header')?.dataset.portalShell,scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,headerLinks:[...document.querySelectorAll('#portal-nav a')].map(a=>({href:a.getAttribute('href'),text:a.textContent.trim()})),active:active?{id:active.dataset.navId,style:style(active)}:null,buttons,allServices:[...(nav?.querySelectorAll('[data-nav-id]')||[])].map(a=>a.dataset.navId),toolbar:component('.study-header'),more:moreNode?{style:style(moreNode),rect:relativeRect(moreNode)}:null,brandText:[...document.querySelectorAll('.brand-full,.brand-short')].filter(el=>getComputedStyle(el).display!=='none').map(el=>el.textContent)};
  });
}
async function interactions(page,width,id){
  const menu=page.locator('.portal-menu'),summary=menu.locator(':scope > summary');
  if(width<=1240){
    assert.equal(await menu.getAttribute('open'),null,'compact menu initially closed');
    await summary.click();
    await page.waitForFunction(()=>document.querySelector('.portal-menu > summary').getAttribute('aria-expanded')==='true');
    assert.equal(await summary.getAttribute('aria-expanded'),'true');
    assert.equal(await page.locator('#portal-nav').isVisible(),true);
    await page.keyboard.press('Escape');
    assert.equal(await summary.getAttribute('aria-expanded'),'false');
    assert.equal(await summary.evaluate(el=>el===document.activeElement),true,'Escape restores menu focus');
    await summary.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('.portal-menu > summary').getAttribute('aria-expanded')==='true');await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement.closest('#portal-nav')!==null),true,'Tab enters links');
    await page.keyboard.press('Escape');
    await summary.click();await page.locator('main').click({position:{x:2,y:2}});
    assert.equal(await menu.getAttribute('open'),null,'outside click closes menu');
  }else assert.equal(await page.locator('#portal-nav').isVisible(),true,'desktop links visible');
  if(id!=='index'){
    const other=page.locator('.portal-nav-more'),toggle=other.locator(':scope > summary');
    await toggle.click();assert.equal(await other.getAttribute('open'),'','other services expand');
    assert.equal(await other.locator('.portal-nav-other').isVisible(),true);
    await page.keyboard.press('Escape');assert.equal(await other.getAttribute('open'),null);
    assert.equal(await toggle.evaluate(el=>el===document.activeElement),true);
    if(width<=1240){await toggle.click();await summary.click();assert.equal(await other.getAttribute('open'),null,'disclosures close outside each other');await page.keyboard.press('Escape');}
  }
  const brand=page.locator('.site-header .brand');
  const b=await brand.boundingBox();assert.ok(b.x>=0&&b.x+b.width<=width+1,'brand fits viewport');
  if(width<=1240){const s=await summary.boundingBox();assert.ok(s.x>=b.x+b.width-1&&s.x+s.width<=width+1,'menu button fits without overlapping brand');}
}

try{
  for(const width of widths){
    const context=await browser.newContext({viewport:{width,height:900}});await prepare(context);
    for(const [id,definition] of Object.entries(portalPages)){
      const label=`${engine} ${width} ${id}`,page=await context.newPage();monitor(page,label);
      try{
        await ready(page,id+'.html');
        const state=await snapshot(page);evidence.push({engine,width,page:id,...state});
        check(label+' parity',()=>{
          assert.equal(state.headerCount,1);assert.equal(state.mainCount,1);assert.equal(state.shell,shellVersion);
          assert.equal(state.header['.site-header'].rect.height,width<=900?60:76,'shared header height');
          assert.ok(state.scroll<=state.viewport+1,'no horizontal overflow '+state.scroll+'/'+state.viewport);
          const key=String(width);
          if(!baseline.has(key))baseline.set(key,{header:state.header,links:state.headerLinks});
          else{assert.deepEqual(state.header,baseline.get(key).header,'computed header styles and coordinates match index');assert.deepEqual(state.headerLinks,baseline.get(key).links,'global menu order and destinations');}
          if(definition.group){
            assert.equal(state.active?.id,id,'query-independent current service');
            assert.deepEqual([...state.allServices].sort(),navigationItems.map(item=>item.id).sort(),'all service links preserved');
            const groupKey=width+':'+definition.group;
            if(!groupBaseline.has(groupKey))groupBaseline.set(groupKey,{buttons:state.buttons,active:state.active.style,more:state.more});
            else{const reference=groupBaseline.get(groupKey);assert.deepEqual(state.buttons,reference.buttons,'same service group button geometry and typography');assert.deepEqual(state.active.style,reference.active,'same active style');assert.deepEqual(state.more,reference.more,'same other-services control');}
          }
          if(definition.toolbar)assert.equal(state.toolbar.rect.height>0,width<=900,'toolbar visibility follows shared breakpoint');
        });
        try{await interactions(page,width,id);}catch(error){record(label+' interactions',error);}
        if(width===390||width===1440)await page.screenshot({path:`${output}/${engine}-${id}-${width}.png`,fullPage:true});
      }catch(error){record(label,error);await page.screenshot({path:`${output}/${engine}-${id}-${width}-failure.png`}).catch(()=>{});}
      finally{await page.close();}
    }
    await context.close();
    console.log(`${engine}: completed all ${Object.keys(portalPages).length} pages at ${width}px`);
  }
  const context=await browser.newContext({viewport:{width:390,height:844}});await prepare(context);
  const page=await context.newPage();monitor(page,engine+' navigation regression');
  try{
    await ready(page,'coding.html?id=LINUX-002');
    await page.locator('#coding-title').filter({hasText:'파일 접근 권한 설정'}).waitFor();
    assert.equal(await page.locator('.portal-nav-current [aria-current="page"]').getAttribute('data-nav-id'),'coding');
    await page.locator('#coding-done-button').click();
    const saved=await page.evaluate(()=>localStorage.getItem('kbigdata:coding:done:v1'));
    assert.ok(JSON.parse(saved).includes('LINUX-002'),'existing learning completion persists');
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('#coding-done-button').getAttribute('aria-pressed'),'true');
    await page.locator('.portal-nav-current a[data-nav-id="docs"]').click();await page.waitForURL('**/docs.html');
    assert.equal(await page.locator('.portal-nav-current [aria-current="page"]').getAttribute('data-nav-id'),'docs');
    await page.goBack({waitUntil:'domcontentloaded'});assert.ok(page.url().includes('id=LINUX-002'));
    assert.equal(await page.evaluate(()=>localStorage.getItem('kbigdata:coding:done:v1')),saved,'navigation preserves existing state');
    await page.addScriptTag({url:url('js/portal-navigation.js?v='+shellVersion)});
    const summary=page.locator('.portal-menu > summary');await summary.click();
    await page.waitForFunction(()=>document.querySelector('.portal-menu > summary').getAttribute('aria-expanded')==='true');
    assert.equal(await summary.getAttribute('aria-expanded'),'true','duplicate script does not double-toggle');await page.keyboard.press('Escape');
    await page.locator('.site-header .brand').click();await page.waitForURL('**/index.html');
    await page.locator('.portal-menu > summary').click();await page.locator('#portal-nav [data-portal-group="learning"]').click();
    await page.waitForURL('**/index.html#learning');await page.waitForFunction(()=>document.querySelector('#portal-nav [data-portal-group="learning"]').getAttribute('aria-current')==='location');assert.equal(await page.locator('#portal-nav [data-portal-group="learning"]').getAttribute('aria-current'),'location');
    await page.goBack();await page.waitForFunction(()=>document.querySelector('#portal-nav a').getAttribute('aria-current')==='page');assert.equal(await page.locator('#portal-nav a').first().getAttribute('aria-current'),'page');
    // The virtual keyboard cannot be summoned by headless engines. A reduced
    // visual viewport while an input has focus checks the same layout constraint.
    await ready(page,'coding.html?id=LINUX-002');await page.locator('input').first().focus();await page.setViewportSize({width:390,height:420});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'focused input in a short viewport does not overflow');
  }catch(error){record(engine+' deep-link/state/back/keyboard regression',error);}finally{await context.close();}
  const noScript=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});await prepare(noScript);
  for(const id of Object.keys(portalPages)){
    const page=await noScript.newPage();
    try{await page.goto(url(id+'.html'));assert.equal(await page.locator('#portal-nav a').count(),6);assert.equal(await page.locator('#portal-nav').isVisible(),true,'native details fallback keeps header links usable');const state=await snapshot(page),reference=evidence.find(row=>row.page===id&&row.width===390);assert.deepEqual(state.header,reference.header,'source header has identical geometry and styles before enhancement');assert.deepEqual(state.buttons,reference.buttons,'service menu does not shift when content JavaScript starts');await page.locator('.portal-menu > summary').click();assert.equal(await page.locator('#portal-nav').isVisible(),false,'native summary closes panel without JavaScript');if(id!=='index'){await page.locator('.portal-nav-more > summary').click();assert.equal(await page.locator('.portal-nav-other').isVisible(),true);}}
    catch(error){record(engine+' no-JavaScript '+id,error);}finally{await page.close();}
  }
  await noScript.close();
  const failedContent=await browser.newContext({viewport:{width:390,height:900}});await prepare(failedContent);
  await failedContent.route('**/js/**',route=>route.request().url().includes('/portal-navigation.js')?route.continue():route.fulfill({status:200,contentType:'application/javascript',body:''}));
  for(const id of Object.keys(portalPages)){
    const page=await failedContent.newPage();
    try{await ready(page,id+'.html');const state=await snapshot(page),reference=evidence.find(row=>row.page===id&&row.width===390);assert.deepEqual(state.header,reference.header,'shell layout survives failed content modules');assert.deepEqual(state.buttons,reference.buttons,'service layout survives failed content modules');await interactions(page,390,id);}
    catch(error){record(engine+' failed-content-module fallback '+id,error);}finally{await page.close();}
  }
  await failedContent.close();
}finally{
  await browser.close();
  writeFileSync(`${output}/${engine}-results.json`,JSON.stringify({engine,base,shellVersion,widths,pages:Object.keys(portalPages),checks:evidence.length,failures,evidence},null,2));
}
if(failures.length){console.error(JSON.stringify(failures.slice(0,20).map(failure=>({name:failure.name,error:failure.error.slice(0,1000)})),null,2));throw new Error(`${failures.length} shared shell browser checks failed; see ${output}/${engine}-results.json`);}
console.log(`PASS: ${engine} ${evidence.length} page/viewport cases, menu keyboard/touch interactions, deep links, persistence, native fallback and same-origin network checks.`);
