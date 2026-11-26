import {approvedStudent} from './fixtures/approved-student.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.PORTAL_BASE_URL||'http://127.0.0.1:8765';
const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try{
 for(const width of [360,390,768,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  await approvedStudent(context,{academic_year:1});
  await context.route(/https:\/\/(?:www\.)?(?:googletagmanager\.com|google-analytics\.com)\//,route=>route.fulfill({status:200,contentType:'application/javascript',body:''}));
  const page=await context.newPage();
  await page.goto(base+'/k-bigdata-hub.html');
  await page.locator('.kh-primary').waitFor({state:'visible',timeout:15000});
  assert.equal(await page.locator('.kh-primary').getAttribute('href'),'https://chromewebstore.google.com/detail/k-bigdata-hub/ifmnjdcbbojifiogejdhfonbidmpolfp?hl=ko');
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('.kh-steps li').count(),5);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no overflow at '+width);
  await page.locator('.kh-faq details summary').first().click();
  assert.ok(await page.locator('.kh-faq details[open] p').first().isVisible());
  const video=page.locator('video');
  await video.evaluate(el=>{el.muted=true;el.load()});
  await page.waitForFunction(()=>document.querySelector('video').readyState>=1,{timeout:15000});
  assert.ok(await video.evaluate(el=>el.duration>55&&el.duration<65));
  await video.evaluate(el=>el.play());
  await page.waitForFunction(()=>document.querySelector('video').currentTime>0.1);
  await video.evaluate(el=>el.pause());
  if(width===390||width===1280)await page.screenshot({path:'/tmp/hub-'+width+'.png',fullPage:true});
  await page.goto(base+'/services.html');
  await page.locator('.directory-catalog a[href="k-bigdata-hub.html"]').waitFor({state:'visible',timeout:15000});
  await page.locator('#directory-query').fill('K-BigData Hub');
  assert.ok(await page.locator('.directory-catalog a[href="k-bigdata-hub.html"]').isVisible());
  await page.locator('.directory-catalog a[href="k-bigdata-hub.html"]').click();
  await page.waitForURL('**/k-bigdata-hub.html');
  await context.close();
  console.log('PASS '+width+'px: page, install link, video playback and directory search');
 }
}finally{await browser.close()}
