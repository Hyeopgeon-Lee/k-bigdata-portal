import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdirSync,readFileSync} from 'node:fs';
import {approvedStudent} from './fixtures/approved-student.mjs';
import {summarize,suggestedTasks,reportForCertificates} from '../supabase/functions/student-weekly-report/report.mjs';
const base=process.env.PORTAL_BASE_URL||'http://127.0.0.1:8765';
const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.PORTAL_BROWSER_PATH?{executablePath:process.env.PORTAL_BROWSER_PATH}:{})});
const week='2026-11-23',learning=summarize(week,[
 {bank:'coding',question_id:'JAVA-001',submitted_at:'2026-11-23T01:00:00Z',result:'correct'},
 {bank:'coding',question_id:'JAVA-002',submitted_at:'2026-11-23T01:00:00Z',result:'incorrect'},
 {bank:'practical',question_id:'P-1',submitted_at:'2026-11-25T01:00:00Z',result:'correct'},
 {bank:'coding',question_id:'JAVA-001',submitted_at:'2026-11-17T01:00:00Z',result:'correct'}
],[],[{started_at:'2026-11-23T01:00:00Z',duration_seconds:7260,status:'completed'},{started_at:'2026-11-24T01:00:00Z',duration_seconds:3600,status:'completed'}],{weekdays:[1,2,3]});
const career={registered:true,status:'준비 양호',checked_at:'2026-11-30T00:15:00Z',github_days:4,repositories:2,readme:'README 보완 필요',portfolio:'최근 업데이트',documents:{resume:'1차 완성',cover_letter:'기본본 완성'},certificates:1,issues:[{code:'readme_quality',label:'README 보완 필요 · 프로젝트 주요 기능'}]};
const events=[{title:'학과 프로젝트 발표',start:'2026-12-02',end:'2026-12-02',time:'14:00',important:true},{title:'기말고사 대비 학습',start:'2026-12-03',end:'2026-12-04',time:'',important:false}];
const payload={version:1,week_start:week,week_end:'2026-11-29',schedule_start:'2026-11-30',schedule_end:'2026-12-06',learning,career,calendar:{available:true,stale:false,checked_at:'2026-11-30T00:00:00Z',events},tasks:suggestedTasks(learning,career,events)};
const response={report:{week_start:week,created_at:'2026-11-30T00:00:00Z',payload,completed_tasks:[]},latest:week,weeks:[week,'2026-11-16']};
const source=readFileSync(new URL('../js/weekly-report.js',import.meta.url),'utf8');
const mock='window.__requests=[];let reportData='+JSON.stringify(response)+';window.portalSupabaseClient.functions.invoke=async (name,{body})=>{window.__requests.push(body.action);if(body.action==="task"){reportData.report.completed_tasks=body.done?[body.task_id]:[];return {data:{completed_tasks:reportData.report.completed_tasks},error:null}} if(body.week_start==="2026-11-16")return {data:{...reportData,report:null},error:null};return {data:reportData,error:null};};\n'+source;
mkdirSync('ui-screenshots/weekly',{recursive:true});
try{
 for(const width of [320,360,390,768,1280]){
  for(const role of width===390?['student','admin','alumni','leave']:['student']){
   const context=await browser.newContext({viewport:{width,height:900}});
   await approvedStudent(context,role==='admin'?{signup_type:'admin'}:role==='alumni'?{signup_type:'alumni',enrollment_status:'graduated'}:role==='leave'?{enrollment_status:'leave'}:{},role==='alumni',role==='admin');
   const certMode=role==='student'&&[320,360].includes(width);
   const noBasics=width===360;
   const certCandidate=noBasics?{...response.report,payload:{...payload,learning:{...learning,subjects:learning.subjects.map(s=>['coding','ncp'].includes(s.id)?{...s,attempts:0}:s)}}}:response.report;
   const scoped=certMode?{...response,report:reportForCertificates(certCandidate,[{certificate_code:noBasics?'industrial':'engineer',pass_status:'final',verification_status:'pending'}])}:response;
   const scopedMock=mock.replace(JSON.stringify(response),JSON.stringify(scoped));
   await context.route('**/js/weekly-report.js?v=*',route=>route.fulfill({contentType:'application/javascript',body:scopedMock}));
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/weekly-report.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>!document.getElementById('learning-lock')&&document.documentElement.dataset.portalAccess==='approved');
   if(role==='student'){
    await page.locator('#wr-content').waitFor({state:'visible'});
    assert.equal(await page.locator('.wr-kpi').count(),4);assert.equal(await page.locator('.wr-card').count(),6);assert.equal(await page.locator('.wr-event').count(),2);
    if(certMode){
     assert.equal(await page.locator('#wr-subject-card').isVisible(),!noBasics);
     assert.deepEqual(await page.locator('#wr-subjects .wr-subject-head strong').allTextContents(),noBasics?[]:['기초학습']);
     assert.equal(await page.locator('.wr-kpi').count(),4);
    }else{
     assert.equal(await page.locator('#wr-subject-card').isVisible(),true);
     assert.equal(await page.locator('#wr-subjects .wr-subject').count(),5);
    }
    await page.locator('.wr-task input').first().check();
    await page.waitForFunction(()=>document.querySelector('#wr-task-count').textContent.startsWith('1/'));
    assert.ok(await page.locator('.wr-task input').first().isChecked());
    await page.selectOption('#wr-week','2026-11-16');
    await page.waitForFunction(()=>document.querySelector('#wr-status').textContent.includes('저장된 리포트가 없습니다'));
    await page.selectOption('#wr-week',week);await page.locator('#wr-content').waitFor({state:'visible'});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'viewport overflow '+width);
    assert.ok(await page.evaluate(()=>Array.from(document.querySelectorAll('.wr a,.wr select,.wr-card,.wr-kpi')).filter(e=>e.getBoundingClientRect().width>0).every(e=>e.getBoundingClientRect().left>=-1&&e.getBoundingClientRect().right<=innerWidth+1)),'clipped content '+width);
    if([390,1280].includes(width))await page.screenshot({path:'ui-screenshots/weekly/'+width+'.png',fullPage:true});
   }else{
    assert.ok(await page.locator('#wr-content').isHidden());
    assert.match(await page.locator('#wr-status').textContent(),/승인된 재학생/);
    assert.equal(await page.evaluate(()=>window.__requests.length),0);
   }
   await page.goto(base+'/mypage.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!document.getElementById('learning-lock')&&document.documentElement.dataset.portalAccess==='approved');
   assert.equal(await page.locator('#my-page-weekly-shortcut').count(),0,'duplicate My Page shortcut removed');
   await page.locator('#portal-account-button').click();
   const settings=page.locator('.portal-account-section').filter({has:page.getByRole('heading',{name:'계정 설정',exact:true})});
   const titles=await settings.locator('.portal-account-action-title').allTextContents();
   assert.deepEqual(titles,role==='student'?['마이페이지','나의 주간 리포트','나의 자격증']:role==='admin'?['마이페이지']:['마이페이지','나의 자격증'],role+' account menu order');
   const reportLink=settings.getByRole('link',{name:/나의 주간 리포트/});
   assert.equal(await reportLink.count(),role==='student'?1:0,role+' account menu visibility');
   if(role==='student'){
    assert.match(await reportLink.getAttribute('href'),/weekly-report\.html$/);
    await reportLink.click();
    await page.waitForURL('**/weekly-report.html');
    await page.locator('#wr-content').waitFor({state:'visible'});
   }
   assert.deepEqual(errors,[]);
   await context.close();console.log('PASS',width,role);
  }
 }
}finally{await browser.close()}
