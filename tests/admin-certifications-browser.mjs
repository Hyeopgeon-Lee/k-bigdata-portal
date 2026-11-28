import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {chromium} from 'playwright';
import {approvedStudent} from './fixtures/approved-student.mjs';

mkdirSync('ui-screenshots/admin',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const url='http://127.0.0.1:8765/admin/certifications.html';
 const deniedContext=await browser.newContext({viewport:{width:390,height:850}});
 await approvedStudent(deniedContext,{signup_type:'student',enrollment_status:'enrolled',academic_year:2},false,false,false);
 const denied=await deniedContext.newPage();
 await denied.goto(url,{waitUntil:'domcontentloaded'});
 await denied.locator('#admin-denied').waitFor({state:'visible'});
 assert.equal(await denied.locator('#admin-secure').isVisible(),false);
 await deniedContext.close();

 const context=await browser.newContext({viewport:{width:390,height:850}});
 await approvedStudent(context,{signup_type:'student',enrollment_status:'enrolled',academic_year:2},false,true,true);
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.locator('#cert-grade-chart .admin-chart').waitFor({state:'visible'});
 const kpi=n=>page.locator('#cert-admin-stats .admin-kpi-value').nth(n);
 assert.equal(await kpi(0).textContent(),'3명');
 assert.equal(await kpi(1).textContent(),'2명');
 assert.equal(await kpi(4).textContent(),'2건');
 assert.equal(await kpi(5).textContent(),'1건');
 assert.equal(await page.locator('#cert-admin-list .cert-item').count(),0,'review details are not rendered on overview');
 assert.equal(await page.locator('#cert-export,#cert-admin-grade').count(),0);
 for(const selector of ['#cert-grade-chart .admin-chart','#cert-holdings-chart .admin-donut','#cert-type-chart .cert-type-track','#cert-month-chart svg'])await page.locator(selector).first().waitFor({state:'visible'});
 await page.locator('[data-admin-grade="2"]').click();
 assert.equal(await kpi(0).textContent(),'2명');
 assert.equal(await kpi(2).textContent(),'50%');
 await page.locator('#cert-tab-review').click();
 assert.equal(await page.locator('#cert-admin-status').inputValue(),'pending');
 assert.equal(await page.locator('#cert-admin-list .cert-item').count(),1);
 await page.locator('#cert-admin-list .cert-review-head').click();
 await page.locator('.cert-admin-note').waitFor();
 await page.getByRole('button',{name:'반려',exact:true}).click();
 await page.getByText('반려 사유를 입력해 주세요.',{exact:true}).waitFor();
 await page.locator('.cert-admin-note').fill('확인 자료 보완');
 page.once('dialog',d=>d.accept());
 await page.getByRole('button',{name:'반려',exact:true}).click();
 await page.getByText('확인 상태를 저장했습니다.',{exact:true}).waitFor();
 assert.equal(await page.locator('#cert-admin-list .cert-item').count(),0);
 await page.locator('#cert-admin-status').selectOption('rejected');
 await page.locator('#cert-admin-list .cert-review-head').click();
 await page.locator('.cert-admin-note').waitFor();
 assert.equal(await page.locator('.cert-admin-note').inputValue(),'확인 자료 보완');
 page.once('dialog',d=>d.accept());
 await page.getByRole('button',{name:'확인완료',exact:true}).click();
 await page.getByText('확인 상태를 저장했습니다.',{exact:true}).waitFor();
 await page.locator('#cert-tab-overview').click();
 assert.equal(await kpi(2).textContent(),'100%');
 await page.locator('#cert-tab-review').click();
 await page.locator('#cert-admin-status').selectOption('verified');
 await page.locator('#cert-admin-list .cert-review-head').filter({hasText:'2학년 학생 B'}).click();
 await page.locator('.cert-admin-note').waitFor();
 page.once('dialog',d=>d.accept());
 await page.getByRole('button',{name:'확인대기로',exact:true}).click();
 await page.getByText('확인 상태를 저장했습니다.',{exact:true}).waitFor();
 await page.locator('#cert-tab-students').click();
 assert.equal(await page.locator('.cert-student-card').count(),2);
 await page.locator('#cert-student-state').selectOption('no-verified');
 assert.equal(await page.locator('.cert-student-card').count(),1);
 await page.locator('.cert-student-head').click();
 await page.locator('.cert-student-record').waitFor();
 await page.locator('#cert-student-state').selectOption('');
 await page.locator('#cert-student-search').fill('학생 B');
 assert.equal(await page.locator('.cert-student-card').count(),1);
 await page.locator('#cert-student-search').fill('');
 await page.locator('#cert-tab-overview').click();
 await page.locator('[data-admin-grade=""]').click();
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:900});
  for(const tab of ['overview','review','students']){
   await page.locator('#cert-tab-'+tab).click();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   assert.equal(overflow,false,'certificate '+tab+' '+width+'px horizontal overflow');
   if(width===390||width===1280)await page.screenshot({path:'ui-screenshots/admin/certifications-'+tab+'-'+width+'.png',fullPage:true});
  }
 }
 assert.deepEqual(errors.filter(e=>!e.includes('net::')),[]);
 await context.close();
 console.log('PASS: certificate admin browser — 4 charts, approval/rejection/reset, cohort filters, student details, 4 viewports and denied student role');
}finally{await browser.close();}
