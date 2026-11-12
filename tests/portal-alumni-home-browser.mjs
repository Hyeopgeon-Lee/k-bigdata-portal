// Authenticated graduate regression: both signup-type and graduation-status routes.
import assert from "node:assert/strict";
import {chromium} from "playwright";
import {approvedStudent} from "./fixtures/approved-student.mjs";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 for(const member of [
  {signup_type:"alumni",enrollment_status:"graduated",academic_year:null},
  {signup_type:"student",enrollment_status:"graduated",academic_year:2}
 ]){
  for(const width of [390,1280]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await approvedStudent(context,member);
   await context.route("https://zjsindkakjfzmjgrkaou.supabase.co/functions/v1/alumni-network-api",route=>
    route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},
     body:JSON.stringify({success:true,data:{
      jobs:[{job_id:"JOB-1",job_title:"백엔드 개발자 채용",company:"테스트 기업",deadline:"2027-01-31"}],
      news:[{news_id:"NEWS-1",title:"동문 프로젝트 소식",event_date:"2026-11-13"}]
     }})}));
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:8765/index.html",{waitUntil:"domcontentloaded"});
   await page.locator("#alumni-dashboard").waitFor({state:"visible",timeout:15000});
   await page.locator('#alumni-home-jobs a[href="alumni/job-detail.html?id=JOB-1"]').waitFor({timeout:15000});
   assert.equal(await page.locator("#alumni-home-news a").count(),1);
   assert.equal(await page.locator('.alumni-home-primary a[href="practical.html"]').count(),1);
   assert.equal(await page.locator('.alumni-home-primary a[href="alumni/index.html"]').count(),1);
   assert.equal(await page.locator(".home-today").isVisible(),false);
   assert.equal(await page.locator(".home-grade-control").isVisible(),false);
   assert.equal(await page.locator(".dashboard-start").isVisible(),false);
   assert.equal(await page.locator(".home-shortcuts").isVisible(),true);
   assert.equal(await page.locator(".site-header").isVisible(),true);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=2,"graduate horizontal overflow "+width+": "+overflow);
   assert.deepEqual(errors,[],"graduate browser errors "+width);
   await context.close();
  }
 }
 console.log("PASS: approved alumni and promoted graduates see the alumni dashboard in mobile and desktop.");
}finally{await browser.close();}
