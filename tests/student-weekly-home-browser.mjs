import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
import {approvedStudent} from './fixtures/approved-student.mjs';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base=process.env.PORTAL_BASE_URL||'http://127.0.0.1:8765';
mkdirSync('ui-screenshots/weekly',{recursive:true});
const cases=[
 {width:320,role:'student',time:'2026-11-29T23:58:00Z',expected:false,advance:120000,after:true},
 {width:390,role:'student',time:'2026-11-30T14:58:00Z',expected:true,advance:120000,after:false},
 {width:1280,role:'second',time:'2026-11-30T01:00:00Z',expected:true},
 {width:390,role:'student',time:'2026-11-30T15:00:01Z',expected:false},
 {width:390,role:'student',time:'2026-11-29T05:00:00Z',expected:false},
 ...['admin','alumni','leave','early'].map(role=>({width:390,role,time:'2026-11-30T01:00:00Z',expected:false}))
];
try {
 for(const {width,role,time,expected,advance,after} of cases){
  const ctx=await browser.newContext({viewport:{width,height:900},timezoneId:'America/New_York'});
  await approvedStudent(ctx,role==='admin'?{signup_type:'admin'}:role==='alumni'?{signup_type:'alumni',enrollment_status:'graduated'}:role==='leave'?{academic_year:1,enrollment_status:'leave'}:role==='early'?{academic_year:1,enrollment_status:'early_employment'}:role==='second'?{academic_year:2}:{academic_year:1},role==='alumni',role==='admin');
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install({time:new Date(time)});
  await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.portalAccess==='approved'&&!!window.portalVerifiedContext);
  const card=page.locator('#home-weekly-report'),link=page.locator('#home-weekly-report-link');
  const verify=async visible=>{
   await card.waitFor({state:visible?'visible':'hidden'});
   assert.equal(await card.isVisible(),visible,role+' '+time);
   if(visible){
    assert.equal(await link.getAttribute('href'),'weekly-report.html?week=2026-11-23');
    assert.match(await page.locator('#home-weekly-report-period').textContent(),/11월 23일 ~ 11월 29일/);
    assert.ok(await page.evaluate(()=>{const c=document.getElementById('home-weekly-report').getBoundingClientRect(),b=document.getElementById('home-weekly-report-link').getBoundingClientRect();return c.left>=-1&&c.right<=innerWidth+1&&b.left>=c.left&&b.right<=c.right&&b.height>=44}));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'home overflow '+width);
   }
  };
  await verify(expected);
  if(expected&&[390,1280].includes(width))await page.screenshot({path:'ui-screenshots/weekly/home-announcement-'+width+'.png',fullPage:false});
  if(advance){await page.clock.fastForward(advance);await verify(after)}
  if(!advance&&expected){
   await link.click();await page.waitForURL('**/weekly-report.html?week=2026-11-23');
  }
  assert.deepEqual(errors,[]);
  await ctx.close();console.log('PASS Monday home',width,role,time,expected,after);
 }
}finally{await browser.close()}
