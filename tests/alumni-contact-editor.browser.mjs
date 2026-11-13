import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
import {chromium} from "playwright";

const url="http://127.0.0.1:8765/alumni/contact.html";
mkdirSync("ui-screenshots/alumni-contact",{recursive:true});
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:920}});
  // Offline fixture: do not authenticate with or send email via production services.
  const bridgeStub='document.documentElement.dataset.alumniPortalAuth="approved";window.alumniPortalReady=Promise.resolve(true);document.getElementById("alumni-portal-gate")?.remove();';
  const apiStub='window.AlumniAPI={request:async(action,options={})=>{if(action==="list")return {data:[{alumni_id:"test-graduate",name:"졸업생",graduation_year:2024,company:"테스트회사",job:"개발자",contact_allowed:true}]};if(action==="contact"){window.__sentPayload=options.data;return {success:true};}return {data:null};}};';
  await context.route("**/alumni/js/portal-bridge.mjs*",route=>route.fulfill({contentType:"application/javascript",body:bridgeStub}));
  await context.route("**/alumni/js/api.js*",route=>route.fulfill({contentType:"application/javascript",body:apiStub}));
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("console",msg=>{if(msg.type()==="error")errors.push(msg.text());});
  await page.goto(url,{waitUntil:"load",timeout:35000});
  await page.locator("#contact-form").waitFor({state:"visible",timeout:20000});
  const editor=page.locator(".contact-editor-wrap .sun-editor");
  await editor.waitFor({state:"visible",timeout:15000});
  const metrics=await page.evaluate(()=>{
   const buttons=[...document.querySelectorAll(".contact-editor-wrap .sun-editor button")]
    .filter(b=>b.getBoundingClientRect().height>0).map(b=>({h:b.getBoundingClientRect().height,w:b.getBoundingClientRect().width}));
   return {scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,
    buttons,editable:!!document.querySelector(".contact-editor-wrap .sun-editor-editable"),
    sunEditorVersion:!!window.SUNEDITOR};
  });
  assert.equal(metrics.sunEditorVersion,true,"SunEditor JS bundle loaded");
  assert.equal(metrics.editable,true,"editable region visible");
  assert.ok(metrics.buttons.length>=5,"real toolbar controls rendered");
  assert.ok(metrics.buttons.every(b=>b.h<=42),"compact toolbar: "+JSON.stringify(metrics.buttons));
  assert.ok(metrics.scroll<=metrics.viewport+1,"no horizontal overflow on "+width+"px");
  const input=page.locator(".contact-editor-wrap .sun-editor-editable").first();
  await input.click();
  await page.keyboard.type("선배님 안녕하세요. 실무 개발자 취업 준비 과정에 대해 구체적인 조언을 부탁드립니다. 감사합니다.",{delay:6});
  await page.locator("#contact-recipient").selectOption("test-graduate");
  await page.locator("#category").selectOption("취업 준비");
  await page.locator("#subject").fill("개발자 취업 준비 관련 질문");
  await page.locator('input[name="share_contact"][value="email"]').check();
  await page.locator("#contact-submit").click();
  await page.waitForFunction(()=>!!window.__sentPayload,null,{timeout:10000});
  const payload=await page.evaluate(()=>window.__sentPayload);
  assert.ok(payload.message.includes("실무 개발자 취업 준비"),"plain text retained");
  assert.ok(payload.message_delta?.ops?.length,"safe rich text delta retained");
  assert.equal(payload.share_email,true);
  assert.equal(payload.share_phone,false);
  assert.equal(payload.share_competencies,false);
  assert.deepEqual(errors,[],"no JS or CDN errors");
  await page.screenshot({path:"ui-screenshots/alumni-contact/contact-"+width+".png",fullPage:true});
  console.log("PASS: "+width+"px SunEditor loaded, toolbar compact, safe message sent");
  await context.close();
 }
}finally{await browser.close();}
