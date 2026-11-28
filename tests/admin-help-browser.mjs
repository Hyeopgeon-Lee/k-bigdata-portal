import assert from "node:assert/strict";
import {chromium} from "playwright";
import {approvedStudent} from "./fixtures/approved-student.mjs";

const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 const url="http://127.0.0.1:8765/admin/help.html?grade=2";
 const deniedContext=await browser.newContext({viewport:{width:390,height:850}});
 await approvedStudent(deniedContext,{academic_year:2},false,false,false);
 const denied=await deniedContext.newPage();
 await denied.goto(url,{waitUntil:"domcontentloaded"});
 await denied.locator("#admin-denied").waitFor({state:"visible"});
 assert.equal(await denied.locator("#admin-secure").isVisible(),false);
 await deniedContext.close();
 const context=await browser.newContext({viewport:{width:390,height:850},reducedMotion:"reduce"});
 await approvedStudent(context,{signup_type:"student",enrollment_status:"enrolled",academic_year:2},false,true,true);
 const page=await context.newPage(),errors=[];
 page.on("pageerror",error=>errors.push(error.message));
 await page.goto(url,{waitUntil:"domcontentloaded"});
 await page.locator("#help-status-chart .admin-chart").waitFor();
 assert.equal(await page.locator(".help-ticket").count(),2);
 const statusRow=key=>page.locator('#help-status-chart [data-help-status="'+key+'"]');
 const helpReady=()=>page.locator('#help-admin-list[aria-busy="false"]').waitFor();
 const heading=page.locator('#help-admin-list-heading');
 await statusRow('RECEIVED').click();
 await helpReady();
 assert.equal(await heading.textContent(),'접수 요청글 · 1건');
 assert.equal(await page.locator('.help-ticket .help-status').allTextContents().then(x=>x.join(',')),'접수');
 assert.equal(await statusRow('RECEIVED').getAttribute('aria-current'),'true');
 assert.equal(await statusRow('COMPLETED').locator('strong').textContent(),'1건','chart keeps whole-grade totals');
 await page.locator("[data-admin-grade='1']").click();
 await helpReady();
 assert.equal(await heading.textContent(),'접수 요청글 · 1건');
 assert.equal(await page.locator('.help-ticket strong').first().textContent(),'1학년 요청');
 await page.locator("[data-admin-grade='2']").click();
 await helpReady();
 await statusRow('CHECKING').click();
 await helpReady();
 assert.equal(await heading.textContent(),'확인 중 요청글 · 0건');
 assert.equal(await page.locator('.help-ticket').count(),0);
 await statusRow('CHECKING').click();
 await helpReady();
 assert.equal(await heading.textContent(),'전체 요청글');
 assert.equal(await page.locator('.help-ticket').count(),2);
 await statusRow('COMPLETED').click();
 await helpReady();
 assert.equal(await heading.textContent(),'완료 요청글 · 1건');
 assert.equal(await page.locator('.help-ticket .help-status').textContent(),'완료');
 await statusRow('PROCESSING').click();
 await helpReady();
 assert.equal(await heading.textContent(),'처리 중 요청글 · 0건');
 await page.locator('#help-status-reset').click();
 await helpReady();
 assert.equal(await page.locator('.help-ticket').count(),2);
 assert.equal(await page.locator('#help-status-reset').isVisible(),false);
 // Extend the isolated fake database to exercise a non-empty status, page boundaries and a save.
 await page.evaluate(()=>{
  const key="__qa_supabase_storage_v2",db=JSON.parse(localStorage.getItem(key)||"{}");
  const owner_id="22222222-2222-4222-8222-222222222221";
  db.help_requests=[
   ...Array.from({length:51},(_,i)=>({id:"filter-"+i,owner_id,category:"기타",location:"온라인 포털",title:"확인 요청 "+i,status:"CHECKING",created_at:"2026-11-28",content:"테스트 내용"})),
   {id:"filter-processing",owner_id,category:"기타",location:"온라인 포털",title:"처리 요청",status:"PROCESSING",created_at:"2026-11-28",content:"테스트 내용"}
  ];
  localStorage.setItem(key,JSON.stringify(db));
 });
 await page.locator('#admin-help-refresh').click();
 await helpReady();
 await statusRow('PROCESSING').click();
 await helpReady();
 assert.equal(await heading.textContent(),'처리 중 요청글 · 1건');
 await statusRow('CHECKING').click();
 await helpReady();
 assert.equal(await heading.textContent(),'확인 중 요청글 · 51건');
 assert.equal(await page.locator('.help-ticket').count(),50);
 await page.getByRole('button',{name:'다음',exact:true}).click();
 await helpReady();
 assert.equal(await page.locator('.help-ticket').count(),1);
 await page.locator('.help-ticket summary').click();
 await page.locator('.help-ticket select').selectOption('PROCESSING');
 await page.getByRole('button',{name:'처리 내용 저장',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#help-admin-list-heading')?.textContent==='확인 중 요청글 · 50건');
 assert.equal(await statusRow('PROCESSING').locator('strong').textContent(),'2건');
 assert.equal(await page.locator('.help-ticket').count(),50,'last page clamped after save');
 await page.locator('#help-status-reset').click();
 await helpReady();
 assert.equal(await heading.textContent(),'전체 요청글');
 // Avoid leaking this help-only fixture to the other admin regression pages.
 await page.evaluate(()=>{
  const key="__qa_supabase_storage_v2",db=JSON.parse(localStorage.getItem(key)||"{}");
  delete db.help_requests;localStorage.setItem(key,JSON.stringify(db));
 });
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:850});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,"help page overflow "+width);
 }
 assert.deepEqual(errors,[]);
 await context.close();
 console.log("PASS: help admin status drill-down — four statuses, grade filters, toggle/reset, empty results, pagination, status save, denied student and responsive widths");
}finally{await browser.close();}
