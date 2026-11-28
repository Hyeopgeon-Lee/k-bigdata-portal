import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdirSync,readFileSync} from 'node:fs';
import {approvedStudent} from './fixtures/approved-student.mjs';
import {evaluateStudentReadiness,readinessGuide} from '../supabase/functions/ready-api/rules.mjs';
import {summarize,cohort,filterStudents,checkTargets} from '../admin/js/ready-metrics.mjs';
const base=process.env.PORTAL_BASE_URL||'http://127.0.0.1:8765';
const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.PORTAL_BROWSER_PATH?{executablePath:process.env.PORTAL_BROWSER_PATH}:{})});
const source=readFileSync(new URL('../admin/js/ready.js',import.meta.url),'utf8'),now=new Date().toISOString();
const rows=Array.from({length:15},(_,i)=>{
 const academic_year=i<7?1:2,registered=i!==0&&i!==8,notion_url=i%2?'https://notion.so/12345678123456789876abcdef012345':'',student={grade:String(academic_year),notion_url,career_target:i===2?'백엔드 개발':i===5?'데이터 분석':'개발',github_url:'https://github.com/fixture'+i,portfolio_url:'https://example.test/'+('long-link-segment-'.repeat(14)),resume_status:i===10?'최종 완성':'작성중',cover_letter_status:i===10?'기본본 완성':'작성중'};
 const github={check_status:i===4?'PARTIAL':'SUCCESS',checked_at:now,active_days_7d:i%4,active_days_14d:4,inactive_days:i===2?16:2};
 const evaluation=evaluateStudentReadiness(student,{github,repositoryCount:registered?1:0});
 return {member:{user_id:'fixture-'+i,full_name:i===5?'길이가 긴 테스트 학생 이름'.repeat(3):'테스트 학생 '+i,student_no:'202600'+i,academic_year,enrollment_status:i===13?'leave':i===14?'early_employment':'enrolled'},student,registered,certificate_count:i%3===0?1:0,evaluation,notion_connection:{status:!notion_url?'UNREGISTERED':i===1?'CONNECTED':i===5?'RECONNECT_REQUIRED':'AUTH_REQUIRED',checked_at:now},updated_at:now};
});
const bundles=Object.fromEntries(rows.map(r=>[r.member.user_id,{...r,write:true,consent:false,checks:{notion:{activity_status:'Notion 연동 필요',checked_at:now}},primary:{},repositories:r.registered?[{repo_id:'repo-1',repo_url:'https://github.com/fixture/'+('long-name-'.repeat(16)),is_primary:true,display_order:1}]:[],repoChecks:[],certificates:[],plans:[],history:[{changed_at:now,category:'프로필',field_name:'portfolio_url',old_value:'https://example.test/'+('old-'.repeat(40)),new_value:'https://example.test/'+('new-'.repeat(40)),changed_by:'STUDENT'}],guide:readinessGuide()}]));
const response={rows,settings:{checking_enabled:true,weekly_mail_enabled:true},logs:[{started_at:now,finished_at:now,data:{target_count:1,success_count:1,failed_count:0,status:'SUCCESS',notion_status:'AUTH_REQUIRED',error_message:'길이가 긴 오류 '+('error-'.repeat(50))}}],snapshots:[{snapshot_date:'2026-11-23',data:{cohort:'enrolled_only',registered:8,total_students:13,attention_count:4}},{snapshot_date:'2026-11-16',data:{registered:6,total_students:12}}]};
const output='ui-screenshots/ready-admin';mkdirSync(output,{recursive:true});
async function fixture(width,role='admin',fail=false){
 const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});
 const admin=role==='admin',alumni=role==='alumni';
 await approvedStudent(context,admin?{signup_type:'admin',full_name:'교수 계정'}:alumni?{signup_type:'alumni',enrollment_status:'graduated'}:{},alumni,admin);
 await context.route('**/admin/js/ready.js?v=*',route=>route.fulfill({contentType:'application/javascript',body:
   'window.__readyAdminRequests=[];window.portalSupabaseClient.functions.invoke=async(name,{body}={})=>{window.__readyAdminRequests.push(body);if('+JSON.stringify(fail)+'&&window.__readyAdminRequests.length===1)return {data:{error:"DATABASE_ERROR"},error:null};if(body.action==="admin")return {data:'+JSON.stringify(response)+',error:null};if(body.action==="admin_detail")return {data:('+JSON.stringify(bundles)+')[body.user_id],error:null};if(body.action==="admin_check"){await new Promise(resolve=>setTimeout(resolve,120));return {data:{check_status:body.user_id==="fixture-1"?"PARTIAL":"SUCCESS"},error:null}}if(body.action==="admin_snapshot")return {data:{mail:"disabled"},error:null};if(body.action==="admin_send_weekly")return {data:{mail:"already_requested"},error:null};return {data:{error:"FORBIDDEN"},error:null};};\n'+source
 }));
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/admin/ready.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>['approved','denied'].includes(document.documentElement.dataset.adminAccess)&&!document.getElementById('learning-lock'));
 if(admin)await page.waitForFunction(()=>document.querySelector('#ready-root')?.getAttribute('aria-busy')==='false');
 return {page,context,errors};
}
async function geometry(page,width,label){
 const g=await page.evaluate(()=>({view:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,off:Array.from(document.querySelectorAll('#ready-root :is(button,.ready-student-card,.admin-chart,.ready-admin-panel,.ready-panel,.ready-admin-button-link)')).filter(el=>el.getBoundingClientRect().width&&el.getBoundingClientRect().height).map(el=>({text:el.textContent.trim().slice(0,40),left:el.getBoundingClientRect().x,right:el.getBoundingClientRect().right})).filter(r=>r.left < -1||r.right>innerWidth+1)}));
 assert.equal(g.h1,1,label+' title count');
 assert.ok(g.scroll<=g.view+1,label+' viewport overflow '+width+' '+JSON.stringify(g));
 assert.deepEqual(g.off,[],label+' clipped content '+width);
}
const chartTotal=async page=>(await page.locator('#ready-state-chart .admin-chart-legend strong').allTextContents()).reduce((n,x)=>n+Number(x.replace(/[^\d]/g,'')),0);
const requestCount=(page,action)=>page.evaluate(a=>window.__readyAdminRequests.filter(r=>r.action===a).length,action);
try{
 for(const width of [320,360,390,430,768,1280]){
  const {page,context,errors}=await fixture(width);
  await geometry(page,width,'overview');assert.equal(await chartTotal(page),13);
  assert.equal(await page.locator('#ready-state-chart .admin-donut-center').textContent(),'13명');
  assert.equal(await page.locator('#students .ready-student-card').count(),10);
  assert.match(await page.locator('#list-count').textContent(),/13명/);
  await page.screenshot({path:output+'/overview-'+width+'.png'});
  await page.locator('#next-page').click();assert.equal(await page.locator('#students .ready-student-card').count(),3);assert.equal(await page.locator('[data-detail="fixture-13"],[data-detail="fixture-14"]').count(),0);
  await page.locator('[data-admin-grade="1"]').click();assert.equal(await chartTotal(page),7);
  assert.equal(await page.locator('#students .ready-student-card').count(),7);
  await page.locator('#state').selectOption('미등록');assert.equal(await page.locator('#students .ready-student-card').count(),1);assert.equal(await page.locator('#batch').isDisabled(),true);assert.equal(await chartTotal(page),7,'chart scope does not change with list filter');
  await page.locator('#clear-filter').click();
  await page.locator('#search').fill('백엔드');assert.equal(await page.locator('#students .ready-student-card').count(),1);
  await page.locator('#search').fill('없는 학생');await page.getByText('조회된 학생이 없습니다.').waitFor();await page.locator('#clear-filter').click();
  await page.locator('[data-admin-grade="2"]').click();
  assert.equal(await chartTotal(page),6);assert.equal(await page.locator('#ready-compare-chart').isVisible(),true);assert.match(await page.locator('#ready-compare-chart h3').textContent(),/2학년 취업 서류/);await geometry(page,width,'grade 2');
  await page.locator('[data-admin-grade="1"]').click();
  await page.locator('[data-detail="fixture-1"]').click();await page.locator('#back').waitFor();
  await geometry(page,width,'detail');await page.screenshot({path:output+'/detail-'+width+'.png'});
  await page.locator('#single').click();await page.waitForFunction(()=>document.querySelector('#ready-root').getAttribute('aria-busy')==='false');
  assert.match(await page.locator('#ready-status').textContent(),/부분 점검/);
  await page.locator('#back').click();await page.locator('#ready-students').waitFor();
  assert.equal(await chartTotal(page),7);assert.equal(await page.locator('[data-admin-grade="1"]').getAttribute('aria-pressed'),'true');
  await page.locator('#ready-operations details').first().locator('summary').click();await geometry(page,width,'history');
  await page.locator('#ready-operations details').last().locator('summary').click();await geometry(page,width,'logs');
  if(width===390){
   await page.locator('#search').fill('테스트 학생 1');assert.match(await page.locator('#batch').textContent(),/1명/);
   page.once('dialog',dialog=>dialog.dismiss());await page.locator('#batch').click();assert.equal(await requestCount(page,'admin_check'),1,'cancel does not run');
   page.once('dialog',dialog=>dialog.accept());await page.locator('#batch').click();await page.waitForFunction(()=>document.querySelector('#ready-root').getAttribute('aria-busy')==='false');
   assert.equal(await requestCount(page,'admin_check'),2);assert.match(await page.locator('#ready-status').textContent(),/부분 1명/);
   await page.locator('#snapshot').click();await page.waitForFunction(()=>document.querySelector('#ready-root').getAttribute('aria-busy')==='false');assert.match(await page.locator('#ready-status').textContent(),/메일은 발송하지 않았습니다/);
   page.once('dialog',dialog=>dialog.accept());await page.locator('#send-weekly').click();await page.waitForFunction(()=>document.querySelector('#ready-root').getAttribute('aria-busy')==='false');assert.match(await page.locator('#ready-status').textContent(),/이미 발송 요청/);
  }
  assert.deepEqual(errors,[],width+' browser errors');await context.close();console.log('PASS: READY admin '+width+'px overview, grade counts, filter/pagination, details, logs and check actions.');
 }
 for(const role of ['student','alumni']){
  const {page,context,errors}=await fixture(390,role);
  assert.equal(await page.locator('#admin-denied').isVisible(),true);assert.equal(await page.locator('#admin-secure').isVisible(),false);assert.equal(await page.evaluate(()=>window.__readyAdminRequests),undefined);assert.deepEqual(errors,[]);await context.close();
 }
 const {page,context,errors}=await fixture(390,'admin',true);
 await page.getByRole('button',{name:'다시 불러오기'}).click();await page.locator('#ready-overview-title').waitFor();
 assert.equal(await requestCount(page,'admin'),2);assert.deepEqual(errors,[]);await context.close();
 console.log('PASS: non-admin access forbidden and Korean API error retry.');
}finally{await browser.close()}
