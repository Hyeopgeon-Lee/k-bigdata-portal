// Production auth RPC is mocked; browser assertions cover registered and unregistered states.
import assert from "node:assert/strict";
import {chromium} from "playwright";
import {approvedStudent} from "./fixtures/approved-student.mjs";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 for(const member of [
  {profile:{signup_type:"student",academic_year:2,enrollment_status:"graduated"},registered:true,locked:true},
  {profile:{signup_type:"student",academic_year:2,enrollment_status:"early_employment"},registered:true,locked:true},
  {profile:{signup_type:"student",academic_year:2,enrollment_status:"enrolled"},registered:false,locked:false},
  {profile:{signup_type:"alumni",graduation_year:2025,enrollment_status:"graduated"},registered:true,locked:true}
 ]){
  const context=await browser.newContext({viewport:{width:390,height:900}});
  await approvedStudent(context,member.profile,member.registered);
  const page=await context.newPage(),errors=[];
  page.on("pageerror",err=>errors.push(err.message));
  await page.goto("http://127.0.0.1:8765/mypage.html",{waitUntil:"domcontentloaded"});
  await page.locator("#my-page-name").waitFor({state:"visible",timeout:15000});
  await page.waitForFunction(()=>document.querySelector("#my-page-name")?.textContent==="Student");
  const editable=await page.locator("#my-page-academic-panel").isVisible();
  assert.equal(editable,!member.locked,"academic edit state");
  assert.equal(await page.locator("#my-page-academic-lock-note").isVisible(),member.locked,"lock notice");
  assert.equal(await page.locator("#my-page-contact-panel").isVisible(),true,"phone editor is still available");
  assert.equal(await page.locator("#my-page-password-form").isVisible(),true,"password editor is still available");
  assert.deepEqual(errors,[],"no runtime errors");
  await context.close();
 }
 console.log("PASS: registered alumni academic status locked, enrolled students retain editor and other settings work.");
}finally{await browser.close();}
