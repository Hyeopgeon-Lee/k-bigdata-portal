import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdirSync,readFileSync} from 'node:fs';
import {approvedStudent} from './fixtures/approved-student.mjs';
import {evaluateStudentReadiness,readinessGuide} from '../supabase/functions/ready-api/rules.mjs';
const base=process.env.PORTAL_BASE_URL||'http://127.0.0.1:8765';
const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.PORTAL_BROWSER_PATH?{executablePath:process.env.PORTAL_BROWSER_PATH}:{})});
const student={career_target:'백엔드 개발자',grade:'1',github_url:'https://github.com/fixture',notion_url:'https://www.notion.so/portfolio-12345678123456789876abcdef012345',resume_status:'작성중',cover_letter_status:'작성중'};
const repository={repo_id:'repo-fixture',repo_url:'https://github.com/fixture/'+('portfolio-project-with-long-repository-name-'.repeat(4)),is_primary:true,display_order:1};
const bundle={member:{full_name:'테스트 학생',student_no:'2026000001',academic_year:1},student,registered:true,write:true,consent:false,updated_at:new Date().toISOString(),evaluation:evaluateStudentReadiness(student,{repositoryCount:1}),checks:{},primary:{},repositories:[repository],repoChecks:[],certificates:[],plans:[],history:[],guide:readinessGuide(),notion_connection:{status:'AUTH_REQUIRED',configured:true}};
const source=readFileSync(new URL('../js/ready.js',import.meta.url),'utf8');
const output='ui-screenshots/ready';mkdirSync(output,{recursive:true});
async function fixture(width,role='student',fail=false){
 const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});
 const admin=role==='admin',alumni=role==='alumni';
 await approvedStudent(context,admin?{signup_type:'admin',full_name:'교수 계정'}:alumni?{signup_type:'alumni',enrollment_status:'graduated'}:{},alumni,admin);
 await context.route('**/js/ready.js?v=*',route=>route.fulfill({contentType:'application/javascript',body:
   'window.__readyRequests=[];window.portalSupabaseClient.functions.invoke=async(name,{body}={})=>{window.__readyRequests.push(body.action);if('+JSON.stringify(fail)+'&&window.__readyRequests.length===1)return {data:{error:"DATABASE_ERROR"},error:null};if(body.action==="mine")return {data:'+JSON.stringify(bundle)+',error:null};if(body.action==="class")return {data:{summary:{total_students:16,registered:8,github_active_7d:4,portfolio_missing:3,excellent:3,good:5,preparing:5,attention_count:3},peers:[]},error:null};return {data:{error:"FORBIDDEN"},error:null};};\n'+source
 }));
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/ready.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#ready-root')?.getAttribute('aria-busy')==='false'&&document.documentElement.dataset.portalAccess==='approved'&&!document.getElementById('learning-lock'));
 return {page,context,errors};
}
async function geometry(page,width,role){
 const result=await page.evaluate(()=>{
  const rect=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return {x:r.x,w:r.width,right:r.right}};
  return {viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,main:rect('.ready-workspace'),intro:rect('.portal-page-intro'),service:rect('.portal-service-nav'),h1:document.querySelectorAll('h1').length,offscreen:Array.from(document.querySelectorAll('.ready-workspace button,.ready-workspace .ready-link,.ready-panel,.site-header .portal-account')).filter(e=>e.getBoundingClientRect().width>0).map(e=>({t:e.textContent.trim().slice(0,35),...{x:e.getBoundingClientRect().x,right:e.getBoundingClientRect().right}})).filter(e=>e.x < -1||e.right > innerWidth+1)};
 });
 assert.equal(result.h1,1,role+' once-only title '+width);
 assert.ok(result.scroll<=result.viewport+1,role+' overflow '+width+' '+JSON.stringify(result));
 assert.ok(Math.abs(result.main.x-result.intro.x)<2&&Math.abs(result.main.x-result.service.x)<2,role+' aligned common shell '+width);
 assert.deepEqual(result.offscreen,[],role+' clipped controls '+width);
}
try{
 for(const width of [320,360,390,430,768,1280]){
  for(const role of ['student','admin','alumni']){
   const {page,context,errors}=await fixture(width,role);
   await geometry(page,width,role);
   if(role==='student'){
    assert.equal(await page.locator('#notion-start').textContent(),'내 Notion 연결하기');
    assert.equal(await page.locator('#notion-start').isEnabled(),true);
    assert.deepEqual(await page.evaluate(()=>window.__readyRequests),['mine']);
    await page.screenshot({path:output+'/student-'+width+'.png',fullPage:false});
    await page.locator('[data-tab="profile"]').click();
    assert.equal(await page.locator('input[name="notion_url"]').inputValue(),student.notion_url);
    await geometry(page,width,role+' profile');
    if(width<=430)assert.equal(await page.locator('.ready-table tbody td').first().evaluate(e=>getComputedStyle(e).display),'grid');
    await page.locator('[data-tab="class"]').click();
    await page.getByRole('heading',{name:'우리 학년 준비 현황'}).waitFor();
    await geometry(page,width,role+' class');
    await page.locator('[data-tab="guide"]').click();
    await page.locator('#readme-example').waitFor();
    await geometry(page,width,role+' guide');
   }else{
    assert.deepEqual(await page.evaluate(()=>window.__readyRequests),[],role+' never calls student-only API');
    assert.equal(await page.locator('#ready-status').isVisible(),false);
    if(role==='admin')assert.equal(await page.getByRole('link',{name:'취업 준비 관리 바로가기'}).getAttribute('href'),'admin/ready.html');
    if(role==='alumni')await page.getByRole('heading',{name:'재학생 전용 서비스'}).waitFor();
    assert.equal(await page.getByText('STUDENT_REQUIRED',{exact:true}).count(),0);
    if(role==='admin')await page.screenshot({path:output+'/admin-'+width+'.png',fullPage:false});
   }
   assert.deepEqual(errors,[],role+' browser exceptions '+width);await context.close();
  }
  console.log('PASS: '+width+'px student/admin/alumni layout, role separation and navigation.');
 }
 const {page,context,errors}=await fixture(390,'student',true);
 await page.getByRole('button',{name:'다시 불러오기'}).click();
 await page.locator('#notion-start').waitFor();
 assert.deepEqual(await page.evaluate(()=>window.__readyRequests),['mine','mine']);
 assert.deepEqual(errors,[]);await context.close();
 console.log('PASS: Korean error message and retry.');
}finally{await browser.close()}
