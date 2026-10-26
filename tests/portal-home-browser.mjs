// Browser acceptance for the compact dashboard and directory, run with a local HTTP server on :8765.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const widths=[360,390,768,1280];
try{
 for(const width of widths){
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.locator('.dashboard-action[href="practical.html"]').waitFor({timeout:15000});
  assert.equal(await page.locator('.dashboard-action').count(),4,'four actions '+width);
  assert.equal(await page.locator('.home-category-grid a').count(),4,'four category shortcuts '+width);
  assert.equal(await page.locator('#home-today-list .home-today-task').count(),3,'daily plan '+width);
  assert.equal(await page.locator('#service-groups').count(),0,'full service catalogue is not on home');
  assert.equal(await page.locator('.dashboard-action[href="practical.html"]').count(),1,'shared exam shortcut '+width);
  const second=page.locator('button[data-home-grade="2"]');
  await second.click();
  await page.locator('.dashboard-action[href="recruit.html"]').waitFor();
  assert.equal(await second.getAttribute('aria-pressed'),'true','grade setting '+width);
  await page.locator('button[data-home-grade="1"]').click();
  await page.locator('.dashboard-action-favorite[data-favorite="practical"]').click();
  assert.equal(await page.locator('#favorite-services a[href="practical.html"]').count(),1,'favorite shortcut '+width);
  const homeWidth=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(homeWidth<=2,'home has no horizontal overflow at '+width+': '+homeWidth);
  await page.goto('http://127.0.0.1:8765/services.html',{waitUntil:'domcontentloaded'});
  await page.locator('.directory-catalog .service-card').first().waitFor({timeout:15000});
  assert.equal(await page.locator('.directory-catalog .service-card').count(),18,'all services remain visible '+width);
  assert.equal(await page.locator('.directory-favorite-button').count(),18,'favorite buttons '+width);
  assert.ok((await page.locator('#directory-favorites-list').innerText()).includes('정보처리 기출문제'));
  await page.locator('#directory-query').fill('NCP');
  assert.ok(await page.locator('.directory-service-tile:visible').count()>=1,'NCP search '+width);
  assert.ok((await page.locator('#directory-status').innerText()).includes('개 서비스'));
  await page.locator('#directory-clear').click();
  assert.equal(await page.locator('.directory-service-tile:visible').count(),18,'search reset '+width);
  const directoryWidth=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(directoryWidth<=2,'directory has no horizontal overflow at '+width+': '+directoryWidth);
  assert.deepEqual(errors,[], 'no page exceptions at '+width);
  await context.close();
 }
 console.log('PASS: home, directory, grades, local favorites, search, all links and responsive widths');
}finally{await browser.close();}
