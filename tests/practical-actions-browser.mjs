import {approvedStudent} from "./fixtures/approved-student.mjs";
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chromium,firefox,webkit} from 'playwright';

const engine=process.env.PORTAL_ENGINE||'chromium';
const base=process.env.PORTAL_BASE_URL||'http://127.0.0.1:8765';
const output=process.env.PRACTICAL_ACTIONS_OUTPUT||'ui-screenshots/portal-shell/practical-actions';
mkdirSync(output,{recursive:true});
const browser=await ({chromium,firefox,webkit}[engine]).launch({headless:true,...(engine==='chromium'&&process.env.PORTAL_BROWSER_CHANNEL?{channel:process.env.PORTAL_BROWSER_CHANNEL}:{})});
const page=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});
const errors=[],measurements=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
await approvedStudent(page.context());
await page.route(/https:\/\/(?:www\.)?(?:googletagmanager\.com|google-analytics\.com|analytics\.google\.com)\//,route=>route.fulfill({status:200,contentType:'application/javascript',body:''}));
const url=new URL('practical.html?id=R-C-0001',base.endsWith('/')?base:base+'/').href;
try{
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('#my-answer').waitFor();
  assert.equal(await page.locator('#answer-result .bank-result').count(),0);
  await page.locator('[data-action="back"]').click();
  await page.locator('[data-category="Java"]').click();
  await page.locator('.qb-search input').fill('no-such-question');
  assert.ok(await page.locator('.qb-random').isDisabled());
  await page.locator('.qb-search button').click();
  await page.locator('.qb-random').click();
  assert.equal(await page.locator("#submit-answer").isEnabled(),true);
  await page.locator("#submit-answer").click();
  await page.locator('[data-grade="ungraded"]').click();
  await page.waitForFunction(()=>document.querySelector(".study-review [role=status]")?.textContent.includes("저장됨"));
  for(const width of [320,360,390,430,768,1024,1280,1440,1920]){
    await page.setViewportSize({width,height:900});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,"horizontal overflow at "+width);
    const button=await page.locator('[data-grade="correct"]').boundingBox();
    assert.ok(button.height>=44,"touch target at "+width);
    measurements.push({width,button});
    if([390,1440].includes(width))await page.locator(".study-review").screenshot({path:output+"/"+engine+"-"+width+".png"});
  }
  await page.reload();
  await page.locator('[data-grade="ungraded"][aria-pressed="true"]').waitFor();
  await page.locator('[data-action="retry"]').click();
  assert.equal(await page.locator("#answer-result .bank-result").count(),0);
  assert.deepEqual(errors,[]);
  writeFileSync(output+"/"+engine+"-results.json",JSON.stringify(measurements,null,2));
}finally{await browser.close();}
