import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {chromium} from 'playwright';

mkdirSync('ui-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[];
const widths=[360,390,430,768,1280];
try{
 for(const width of widths){
  const page=await browser.newPage({viewport:{width,height:900}});
  page.on('pageerror',error=>errors.push(width+': '+String(error)));
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.locator('.service-card').first().waitFor({timeout:12000});
  assert.ok(await page.locator('.service-card').count()>=13,'service directory must render at '+width);
  assert.equal(await page.locator('.dashboard-action-favorite').count(),4,'quick favorite actions');
  const search=await page.locator('.portal-search').boundingBox();
  const highlights=await page.locator('.dashboard-highlights').boundingBox();
  const actions=await page.locator('.dashboard-start').boundingBox();
  assert.ok(search&&highlights&&actions,'core dashboard regions must be visible');
  const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  assert.ok(dimensions.scroll<=dimensions.viewport+2,'horizontal overflow at '+width+': '+JSON.stringify(dimensions));
  if(width<=900){
   assert.ok(search.y>=actions.y && search.y<highlights.y,'mobile search should precede sidebar at '+width);
  }else{
   assert.ok(search.x<highlights.x,'desktop search should stay in primary column');
  }
  if(width<=767){
   assert.equal(await page.locator('.brand-short').isVisible(),true,'short mobile brand '+width);
  }else{
   assert.equal(await page.locator('.brand-full').isVisible(),true,'full desktop/tablet brand '+width);
  }
  await page.screenshot({path:'ui-screenshots/home-'+width+'.png',fullPage:true});
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844}});
 page.on('pageerror',error=>errors.push('interaction: '+String(error)));
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('.service-card').first().waitFor();
 const favorite=page.locator('.dashboard-action-favorite[data-favorite="practical"]');
 await favorite.click();
 assert.equal(await favorite.getAttribute('aria-pressed'),'true','quick favorite toggles on');
 assert.ok((await page.locator('#favorite-services').innerText()).includes('실기 코딩'),'favorite appears in personal shortcuts');
 await page.locator('#tab-recent').click();
 assert.equal(await page.locator('#tab-recent').getAttribute('aria-selected'),'true');
 await page.locator('#tab-recent').press('ArrowLeft');
 assert.equal(await page.locator('#tab-favorites').getAttribute('aria-selected'),'true','tabs support arrow keys');
 await page.locator('#portal-query').fill('SQL');
 await page.locator('.portal-search-submit').click();
 await page.waitForFunction(()=>document.querySelector('#search-status')?.textContent?.includes('개 결과'),{timeout:20000});
 const searchText=await page.locator('#search-status').textContent();
 assert.match(searchText,/\\d+개 결과/);
 assert.deepEqual(errors,[],'no browser JS runtime errors');
 await page.close();
 console.log('PASS: 360/390/430/768/1280 layouts, no horizontal overflow, favorites, tabs, search, screenshots');
}finally{await browser.close();}
