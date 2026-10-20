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
 {title:"[1학년] 내일 프로젝트 일정",category:"project",startDate:futureDay(1),endDate:futureDay(1),startTime:"13:30",published:true},
 {title:"[2학년] 3일 뒤 취업 일정",category:"employment",startDate:futureDay(3),endDate:futureDay(3),startTime:"16:00",published:true},
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
  assert.equal(await page.locator('button[data-home-grade="1"]').getAttribute('aria-pressed'),'true','default first-grade dashboard '+width);
  assert.ok((await page.locator('#hero-title').innerText()).includes('1학년'),'first-grade heading '+width);
  assert.equal(await page.locator('.dashboard-action[href="docs.html"]').count(),1,'first-grade documentation action '+width);
  assert.equal(await page.locator('.dashboard-action[href="project-guide.html"]').count(),1,'first-grade project action '+width);

  const search=await page.locator('.portal-search').boundingBox();
  const highlights=await page.locator('.dashboard-highlights').boundingBox();
  const actions=await page.locator('.dashboard-start').boundingBox();
  assert.ok(search&&highlights&&actions,'core dashboard regions must be visible');
  await page.locator('.home-schedule-item').nth(1).waitFor({state:'attached',timeout:7000});
  const schedule=await page.locator('.dashboard-schedule').boundingBox();
  assert.ok(schedule,'department schedule card visible at '+width);
  assert.equal(await page.locator('.home-schedule-item').count(),2,'top section contains two published events');
  assert.equal(await page.locator('.home-schedule-item:visible').count(),2,'two visible event alerts '+width);
  assert.ok((await page.locator('.home-schedule-item').first().innerText()).includes('오늘 학과 일정'));
  assert.ok((await page.locator('.home-schedule-link').first().getAttribute('href')).includes('schedule.html?date='));
  const recruitAlerts=await page.locator('.home-alert-recruit').boundingBox();
  assert.ok(recruitAlerts,'recruitment card visible '+width);
  assert.ok(schedule.y<actions.y && recruitAlerts.y<actions.y,'alerts above quick actions '+width);
  if(width<=767)assert.ok(recruitAlerts.y>schedule.y,'mobile alerts stack vertically '+width);
  else assert.ok(recruitAlerts.x>schedule.x && Math.abs(recruitAlerts.y-schedule.y)<2,'desktop/tablet alerts side by side '+width);
  assert.equal(await page.locator('.home-recruit-item').count(),2,'dated recruitment preview shows 2 entries');
  assert.equal(await page.locator('#home-recruit-alert-list').isVisible(),false,'first grade hides recruiting '+width);
  assert.equal(await page.locator('#home-project-alert-list').isVisible(),true,'first grade shows projects '+width);
  assert.ok((await page.locator('#home-project-alert-list').innerText()).includes('내일 프로젝트 일정'),'1st-grade project event shown '+width);
  assert.ok(!(await page.locator('#home-project-alert-list').innerText()).includes('[1학년]'),'legacy grade tag is hidden in display '+width);
  assert.ok(!(await page.locator('#home-schedule-list').innerText()).includes('3일 뒤 취업 일정'),'1st grade excludes 2nd grade employment '+width);
  assert.ok((await page.locator('#dashboard-schedule-title').innerText()).includes('학습'),'first grade academic heading '+width);
  assert.equal(await page.locator('body').evaluate(()=>{
   const nodes=['.dashboard-schedule','.home-alert-recruit','.dashboard-start','.portal-search','.dashboard-highlights','.dashboard-personal'].map(s=>document.querySelector(s));
   return nodes.every((node,i)=>!i||Boolean(nodes[i-1].compareDocumentPosition(node)&Node.DOCUMENT_POSITION_FOLLOWING));
  }),true,'DOM order stays schedule/actions/search/highlights/personal');
  const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  assert.ok(dimensions.scroll<=dimensions.viewport+2,'horizontal overflow at '+width+': '+JSON.stringify(dimensions));
  if(width<=900){
   assert.ok(search.y>=actions.y && search.y<highlights.y,'mobile search precedes sidebar '+width);
  }else{
   const personal=await page.locator('.dashboard-personal').boundingBox();
   assert.ok(personal && highlights.y<personal.y,'right-side panels stack '+width);
   assert.ok(search.y>=actions.y+actions.height-2,'desktop search follows action row '+width);
   assert.ok(search.width>actions.width,'desktop search uses full dashboard width '+width);
  }
  if(width<=767){
   assert.equal(await page.locator('.brand-short').isVisible(),true,'short mobile brand '+width);
  }else{
   assert.equal(await page.locator('.brand-full').isVisible(),true,'full desktop/tablet brand '+width);
  }
  await page.screenshot({path:'ui-screenshots/home-'+width+'.png',fullPage:true});
  await page.locator('button[data-home-grade="2"]').click();
  assert.equal(await page.locator('button[data-home-grade="2"]').getAttribute('aria-pressed'),'true','grade switch selected '+width);
  assert.ok((await page.locator('#hero-title').innerText()).includes('2학년'),'second-grade heading '+width);
  assert.equal(await page.locator('.dashboard-action[href="recruit.html"]').count(),1,'grade-2 recruitment quick action '+width);
  assert.equal(await page.locator('.dashboard-action[href="https://apply.k-bigdata.kr/"]').count(),1,'grade-2 application quick action '+width);
  assert.ok((await page.locator('#dashboard-highlights-title').innerText()).includes('취업'),'grade-2 continuation '+width);
  assert.equal(await page.locator('#home-recruit-alert-list').isVisible(),true,'second grade shows recruiting '+width);
  assert.equal(await page.locator('#home-project-alert-list').isVisible(),false,'second grade hides project card '+width);
  assert.ok((await page.locator('#home-schedule-list').innerText()).includes('3일 뒤 취업 일정'),'2nd grade employment visible '+width);
  assert.ok(!(await page.locator('#home-schedule-list').innerText()).includes('[2학년]'),'legacy grade tag stripped on display '+width);
  assert.ok((await page.locator('#dashboard-schedule-title').innerText()).includes('취업'),'second grade academic heading '+width);
  const secondSchedule=await page.locator('.dashboard-schedule').boundingBox();
  const secondRecruit=await page.locator('.home-alert-recruit').boundingBox();
  assert.ok(width<=767?secondRecruit.y<secondSchedule.y:secondRecruit.x<secondSchedule.x,'recruitment is the first priority for grade 2 '+width);
  const secondDimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  assert.ok(secondDimensions.scroll<=secondDimensions.viewport+2,'second-grade horizontal overflow at '+width+': '+JSON.stringify(secondDimensions));
  await page.screenshot({path:'ui-screenshots/home-grade2-'+width+'.png',fullPage:true});
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
 await page.locator('button[data-home-grade="2"]').click();
 assert.equal(await page.locator('button[data-home-grade="2"]').getAttribute('aria-pressed'),'true');
 assert.equal(await page.evaluate(()=>localStorage.getItem('kbigdata:home-grade:v1')),'2','grade stored on device');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.locator('.dashboard-action[href="recruit.html"]').waitFor();
 assert.equal(await page.locator('button[data-home-grade="2"]').getAttribute('aria-pressed'),'true','grade survives reload');
 await page.locator('button[data-home-grade="1"]').click();
 assert.equal(await page.locator('button[data-home-grade="1"]').getAttribute('aria-pressed'),'true','grades can be changed repeatedly');
 assert.equal(await page.locator('.dashboard-action[href="docs.html"]').count(),1,'first-grade actions restored');
 await page.locator('.home-schedule-link').first().click();
 await page.waitForURL('**/schedule.html?date=*');
 assert.ok(new URL(page.url()).searchParams.get('date'),'schedule link opens the selected date');
 assert.deepEqual(errors,[],'no browser JS runtime errors');
 await page.close();
 console.log('PASS: 360/390/430/768/1280 layouts, no horizontal overflow, favorites, tabs, search, screenshots');
}finally{await browser.close();}
