import assert from "node:assert/strict";
import {chromium} from "playwright";
import {approvedStudent} from "./fixtures/approved-student.mjs";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 for(const admin of [false,true]){
  const context=await browser.newContext({viewport:{width:390,height:800}});
  await approvedStudent(context,{signup_type:"student",enrollment_status:"enrolled",academic_year:2},false,admin);
  for(const name of ["index","accounts","certifications","rooms","help","learning"]){
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:8765/admin/"+name+".html",{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>["approved","denied"].includes(document.documentElement.dataset.adminAccess),null,{timeout:20000});
   assert.equal(await page.locator("#admin-secure").isVisible(),admin,name+" contents restricted");
   assert.equal(await page.locator("#admin-denied").isVisible(),!admin,name+" denial shown");
   assert.equal(await page.locator("#admin-gate-status").isVisible(),!admin);
   if(admin){
    assert.equal(await page.locator("#admin-secure").isVisible(),true);
    assert.ok(await page.locator(".admin-intro h1").isVisible());
   }
   assert.deepEqual(errors.filter(e=>!e.includes("net::")) ,[],name+" JS exceptions");
   await page.close();
  }
  await context.close();
 }
 console.log("PASS: unauthorized members denied all six admin routes, signed-in super-admin allowed.");
}finally{await browser.close();}
