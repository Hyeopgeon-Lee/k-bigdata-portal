import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readFileSync} from 'node:fs';
import {approvedStudent} from './fixtures/approved-student.mjs';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base=process.env.PORTAL_BASE_URL||'http://127.0.0.1:8765';
const source=readFileSync(new URL('../js/interview-ui.js',import.meta.url),'utf8');
try {
 for(const role of ['student','alumni']){
  const context=await browser.newContext({viewport:{width:390,height:850}});
  await approvedStudent(context,role==='alumni'?{signup_type:'alumni',enrollment_status:'graduated'}:{},role==='alumni');
  await context.route('**/js/interview-ui.js?v=*',route=>route.fulfill({contentType:'application/javascript',body:
   'window.__practiceRequests=[];const originalRpc=window.portalSupabaseClient.rpc.bind(window.portalSupabaseClient);window.portalSupabaseClient.rpc=async (name,args)=>{if(name==="set_my_interview_practice"){window.__practiceRequests.push(args);return {data:true,error:null}}return originalRpc(name,args)};\n'+source}));
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/interview.html?id=DS-001',{waitUntil:'domcontentloaded'});
  const mark=page.locator('[data-action="toggle-practiced"]');
  await mark.waitFor({state:'visible'});
  await page.locator('.question-answer summary').click();
  assert.equal(await page.evaluate(()=>window.__practiceRequests.length),0,'viewing model answer does not record completed practice');
  await mark.click();
  await page.waitForFunction(()=>document.querySelector('[data-action="toggle-practiced"]')?.getAttribute('aria-pressed')==='true');
  if(role==='student'){
   const calls=await page.evaluate(()=>window.__practiceRequests);
   assert.equal(calls.length,1);assert.equal(calls[0].p_question_id,'DS-001');assert.equal(calls[0].p_done,true);
   assert.match(calls[0].p_mark_id,/^[a-f0-9-]{36}$/i);
   await mark.click();
   await page.waitForFunction(()=>document.querySelector('[data-action="toggle-practiced"]')?.getAttribute('aria-pressed')==='false');
   const after=await page.evaluate(()=>window.__practiceRequests);
   assert.equal(after.length,2);assert.equal(after[1].p_mark_id,calls[0].p_mark_id);assert.equal(after[1].p_done,false);
  }else assert.equal(await page.evaluate(()=>window.__practiceRequests.length),0,'non-enrolled account does not write interview report records');
  assert.deepEqual(errors,[]);
  await context.close();console.log('PASS interview direct practice',role);
 }
}finally{await browser.close()}
