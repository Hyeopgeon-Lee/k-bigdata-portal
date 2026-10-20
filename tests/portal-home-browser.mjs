import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {chromium} from 'playwright';

mkdirSync('ui-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PORTAL_BROWSER_CHANNEL?{channel:process.env.PORTAL_BROWSER_CHANNEL}:{}),args:['--no-sandbox']});
const errors=[];
const widths=[360,390,430,768,1280];
const futureDay=offset=>{
 const date=new Date(Date.now()+9*3600000);
 date.setUTCDate(date.getUTCDate()+offset);
 return date.toISOString().slice(0,10);
};
const sampleEvents=[
 {title:"오늘 학과 일정",category:"academic",startDate:futureDay(0),endDate:futureDay(0),startTime:"09:00",published:true},
 {title:"내일 프로젝트 일정",category:"project",startDate:futureDay(1),endDate:futureDay(1),startTime:"13:30",published:true},
 {title:"3일 뒤 취업 일정",category:"employment",startDate:futureDay(3),endDate:futureDay(3),startTime:"16:00",published:true},
 {title:"비공개 일정은 표시되지 않음",category:"event",startDate:futureDay(2),endDate:futureDay(2),published:false}
];
const mockPublicSchedule=page=>page.route("https://script.google.com/macros/s/**",route=>{
 const callback=new URL(route.request().url()).searchParams.get("callback");
 if(!callback?.startsWith("__kBigdataHomeSchedule_"))return route.continue();
 return route.fulfill({
  status:200,contentType:"application/javascript",
  body:callback+"("+JSON.stringify({ok:true,events:sampleEvents,updatedAt:"테스트"})+")"
 });
});
try{
 for(const width of widths){
  const page=await browser.newPage({viewport:{width,height:900}});
  page.on('pageerror',error=>errors.push(width+': '+String(error)));
  await mockPublicSchedule(page);
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.locator('.service-card').first().waitFor({timeout:12000});
  assert.ok(await page.locator('.service-card').count()>=13,'service directory must render at '+width);
  assert.equal(await page.locator('.dashboard-action-favorite').count(),4,'quick favorite actions');
  const search=await page.locator('.portal-search').boundingBox();
  const highlights=await page.locator('.dashboard-highlights').boundingBox();
  const actions=await page.locator('.dashboard-start').boundingBox();
  assert.ok(search&&highlights&&actions,'core dashboard regions must be visible');
  await page.locator('.home-schedule-item').nth(2).waitFor({state:'attached',timeout:7000});
  const schedule=await page.locator('.dashboard-schedule').boundingBox();
  assert.ok(schedule,'department schedule card visible at '+width);
  assert.equal(await page.locator('.home-schedule-item').count(),3,'3 published events in DOM');
  assert.equal(await page.locator('.home-schedule-item:visible').count(),width<=767?2:3,'responsive preview count '+width);
  assert.ok((await page.locator('.home-schedule-item').first().innerText()).includes('오늘 학과 일정'));
  assert.ok((await page.locator('.home-schedule-link').first().getAttribute('href')).includes('schedule.html?date='));
  if(width<=900)assert.ok(schedule.y<actions.y,'schedule precedes quick actions on narrow screens '+width);
  else assert.ok(schedule.x>actions.x && schedule.y<highlights.y,'schedule is upper right on desktop '+width);
  assert.equal(await page.locator('body').evaluate(()=>{
   const nodes=['.dashboard-schedule','.dashboard-start','.portal-search','.dashboard-highlights','.dashboard-personal'].map(s=>document.querySelector(s));
   return nodes.every((node,i)=>!i||Boolean(nodes[i-1].compareDocumentPosition(node)&Node.DOCUMENT_POSITION_FOLLOWING));
  }),true,'DOM order stays schedule/actions/search/highlights/personal');
  const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  assert.ok(dimensions.scroll<=dimensions.viewport+2,'horizontal overflow at '+width+': '+JSON.stringify(dimensions));
  if(width<=900){
   assert.ok(search.y>=actions.y && search.y<highlights.y,'mobile search should precede sidebar at '+width);
  }else{
   assert.ok(search.x<highlights.x,'desktop search should stay in primary column');
   const personal=await page.locator('.dashboard-personal').boundingBox();
   assert.ok(Math.abs(search.y-personal.y)<2,'search and shortcuts share the last row');
   assert.ok(Math.abs(search.y+search.height-personal.y-personal.height)<2,'desktop bottom edges align');
   assert.ok(Math.abs(actions.y+actions.height-highlights.y-highlights.height)<2,'actions align with upper right stack');
   assert.ok(Math.abs(search.y-actions.y-actions.height-16)<2,'no empty area below primary actions');
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
 await mockPublicSchedule(page);
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
 await page.waitForFunction(()=>document.querySelector('#search-status')?.textContent?.includes('개 결과'),null,{timeout:20000});
 const searchText=await page.locator('#search-status').textContent();
 assert.match(searchText,/\d+개 결과/);
 await page.reload({waitUntil:'domcontentloaded'});
 await page.locator('.service-card').first().waitFor();
 assert.equal(await favorite.getAttribute('aria-pressed'),'true','favorite survives reload');
 await favorite.click();
 assert.equal(await favorite.getAttribute('aria-pressed'),'false','favorite can be removed');
 await page.locator('.home-schedule-link').first().click();
 await page.waitForURL('**/schedule.html?date=*');
 assert.ok(new URL(page.url()).searchParams.get('date'),'schedule link opens the selected date');
 assert.deepEqual(errors,[],'no browser JS runtime errors');
 await page.close();
 console.log('PASS: 360/390/430/768/1280 layouts, no horizontal overflow, favorites, tabs, search, screenshots');
}finally{await browser.close();}
