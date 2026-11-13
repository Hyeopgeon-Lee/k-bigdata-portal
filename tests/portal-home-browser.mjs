import {approvedStudent} from "./fixtures/approved-student.mjs";
// Browser acceptance for the compact dashboard and directory, run with a local HTTP server on :8765.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const widths=[360,390,768,1280];
try{
 for(const width of widths){
  const context=await browser.newContext({viewport:{width,height:900}});
  await approvedStudent(context,{academic_year:1});
    const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.locator('.dashboard-action[href="practical.html"]').waitFor({timeout:15000});
  assert.equal(await page.locator('.dashboard-action').count(),4,'four actions '+width);
  assert.equal(await page.locator('.home-category-grid a').count(),4,'four category shortcuts '+width);
  await page.waitForFunction(()=>document.querySelectorAll('#home-today-list .home-today-task').length===3);
  assert.equal(await page.locator('#home-today-list .home-today-task').count(),3,'daily plan '+width);
  assert.equal(await page.locator('#service-groups').count(),0,'full service catalogue is not on home');
  assert.equal(await page.locator('.dashboard-action[href="practical.html"]').count(),1,'shared exam shortcut '+width);
  assert.equal(await page.locator('button[data-home-grade]').count(),0,'grade picker removed '+width);
  assert.equal((await page.locator('#home-grade-label').innerText()).trim(),'1학년','registered grade '+width);
  assert.equal(await page.locator('.dashboard-action[href="recruit.html"]').count(),0,'no 2nd grade actions '+width);
  await page.locator('.dashboard-action-favorite[data-favorite="practical"]').click();
  assert.equal(await page.locator('#favorite-services a[href="practical.html"]').count(),1,'favorite shortcut '+width);
  const homeWidth=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(homeWidth<=2,'home has no horizontal overflow at '+width+': '+homeWidth);
  await page.goto('http://127.0.0.1:8765/services.html',{waitUntil:'domcontentloaded'});
  await page.locator('.directory-catalog .service-card').first().waitFor({timeout:15000});
  assert.equal(await page.locator('.directory-catalog .service-card').count(),19,'all services remain visible '+width);
  assert.equal(await page.locator('.directory-favorite-button').count(),19,'favorite buttons '+width);
  await page.waitForFunction(()=>document.querySelector('#directory-favorites-list')?.textContent?.includes('정보처리 기출문제'));
  await page.locator('.directory-favorites summary').click();
  assert.ok((await page.locator('#directory-favorites-list').innerText()).includes('정보처리 기출문제'));
  await page.locator('#directory-query').fill('NCP');
  assert.ok(await page.locator('.directory-service-tile:visible').count()>=1,'NCP search '+width);
  assert.ok((await page.locator('#directory-status').innerText()).includes('개 서비스'));
  await page.locator('#directory-clear').click();
  assert.equal(await page.locator('.directory-service-tile:visible').count(),19,'search reset '+width);
  const directoryWidth=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(directoryWidth<=2,'directory has no horizontal overflow at '+width+': '+directoryWidth);
  assert.deepEqual(errors,[], 'no page exceptions at '+width);
  await context.close();
 }
 // The member's currently registered grade overrides an old device or preference value.
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  await approvedStudent(context,{academic_year:2});
  await context.addInitScript(()=>{
   localStorage.setItem("kbigdata:home-grade:v1","1");
   localStorage.setItem("__qa_supabase_storage_v2",JSON.stringify({
    user_preferences:[{user_id:"fixture",preferred_grade:"1"}]
   }));
  });
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.locator('.dashboard-action[href="recruit.html"]').waitFor({timeout:15000});
  assert.equal((await page.locator('#home-grade-label').innerText()).trim(),'2학년');
  assert.equal(await page.locator('.dashboard-action[href="coding.html"]').count(),0,'registered second-year actions only');
  assert.equal((await page.locator('#dashboard-schedule-title').innerText()).includes('2학년'),true);
  assert.equal(await page.locator('button[data-home-grade]').count(),0);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('.dashboard-action[href="recruit.html"]').waitFor({timeout:15000});
  assert.equal((await page.locator('#home-grade-label').innerText()).trim(),'2학년','reload keeps registered grade');
  assert.deepEqual(errors,[],'second grade page exceptions '+width);
  await context.close();
 }
 // An unset grade must not be silently treated as first year.
 {
  const context=await browser.newContext({viewport:{width:390,height:900}});
  await approvedStudent(context,{academic_year:null});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#home-grade-label')?.textContent==='학년 미등록',{timeout:15000});
  assert.equal(await page.locator('.home-today').isVisible(),false,'no misleading first-year daily tasks');
  assert.equal(await page.locator('.home-alerts').isVisible(),false,'no misleading grade schedule');
  assert.equal(await page.locator('#home-grade-action').isVisible(),true,'my page has grade registration');
  assert.equal(await page.locator('.portal-search').isVisible(),true,'general services remain available');
  assert.deepEqual(errors,[],'unregistered grade page exceptions');
  await context.close();
 }
 // The super administrator has no student grade and must never see a missing-grade warning.
 {
  const context=await browser.newContext({viewport:{width:390,height:900}});
  await approvedStudent(context,{signup_type:"staff",academic_year:null,enrollment_status:"enrolled"},false,true);
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("http://127.0.0.1:8765/index.html",{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>document.body.dataset.homePersona==="admin",{timeout:15000});
  assert.equal((await page.locator("#hero-title").innerText()).trim(),"관리자 포털");
  assert.equal(await page.locator(".home-grade-control").isVisible(),false,"admin does not require a grade");
  assert.equal(await page.locator("#home-grade-action").isVisible(),false,"admin sees no grade registration");
  assert.equal(await page.locator(".home-today").isVisible(),false,"admin has no student daily plan");
  assert.equal(await page.locator(".portal-search").isVisible(),true,"general services still available");
  assert.ok(!(await page.locator("body").innerText()).includes("학년 정보가 등록되지 않았습니다."),"no false missing-grade notice for admin");
  assert.deepEqual(errors,[],"admin page exceptions");
  await context.close();
 }
 console.log('PASS: profile-based first/second-year home, no grade picker, preference override ignored, admin, alumni and responsive layouts');
}finally{await browser.close();}
