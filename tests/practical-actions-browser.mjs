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
await page.route(/https:\/\/(?:www\.)?(?:googletagmanager\.com|google-analytics\.com|analytics\.google\.com)\//,route=>route.fulfill({status:200,contentType:'application/javascript',body:''}));
const frozen=new Date('2026-10-21T09:00:01Z');
await page.clock.install({time:new Date(frozen.getTime()-1000)});
await page.clock.pauseAt(frozen);
const url=new URL('practical.html?id=R-C-0001',base.endsWith('/')?base:base+'/').href;
try{
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('#my-answer').waitFor();
  assert.equal(await page.locator('#answer-result .bank-result').count(),0);
  await page.clock.runFor(29_999);
  assert.equal(await page.locator('#solve-hint').isVisible(),false,'hint must wait for 30 seconds');
  await page.clock.runFor(1);
  assert.equal(await page.locator('#solve-hint').isVisible(),true,'hint appears at 30 seconds');
  await page.clock.runFor(29_999);
  assert.equal(await page.locator('#answer-result .bank-result').count(),0,'answer remains hidden at 59.999 seconds');
  await page.clock.runFor(1);
  assert.equal(await page.locator('#answer-result .bank-result').count(),1,'answer appears at 60 seconds');
  assert.match(await page.locator('#solve-timer').textContent(),/^60초 경과/);
  assert.equal(await page.locator('#submit-answer').isDisabled(),true,'empty late answer cannot be saved');
  assert.equal(await page.locator('#next-answer').isEnabled(),true);
  // Let the compositor render normally after the precise virtual-time checks.
  await page.clock.resume();

  for(const width of [320,360,390,430,768,1024,1280,1440,1920]){
    await page.setViewportSize({width,height:900});
    await page.evaluate(async()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'});await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
    const state=await page.evaluate(()=>{
      const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height};};
      const submit=rect('#submit-answer'),next=rect('#next-answer'),style=getComputedStyle(document.querySelector('#submit-answer'));
      const rgb=color=>color.match(/[\d.]+/g).slice(0,3).map(Number);
      const luminance=color=>rgb(color).map(c=>{const v=c/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
      const foreground=luminance(style.color),background=luminance(style.backgroundColor);
      return {width:innerWidth,display:getComputedStyle(document.querySelector('.solve-actions')).display,submit,next,gap:next.top>=submit.bottom?next.top-submit.bottom:next.left-submit.right,contrast:(Math.max(foreground,background)+.05)/(Math.min(foreground,background)+.05),opacity:style.opacity,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    assert.ok(state.gap>=11.5,`${width}px buttons need a 12px gap`);
    assert.ok(state.contrast>=4.5,`${width}px disabled label remains readable`);
    assert.equal(state.opacity,'1');
    assert.equal(state.overflow,false,`${width}px must not overflow`);
    assert.ok(state.submit.height>=48&&state.next.height>=48);
    if(state.display==='grid')assert.ok(state.submit.top>=0&&state.next.bottom<=900,'mobile actions stay within viewport');
    measurements.push(state);
    if([390,1440].includes(width)){
      await page.screenshot({path:`${output}/${engine}-${width}.png`});
      await page.locator('.solve-actions').screenshot({path:`${output}/${engine}-${width}-actions.png`});
    }
  }
  await page.setViewportSize({width:390,height:900});
  await page.locator('#my-answer').fill('late answer');
  assert.equal(await page.locator('#submit-answer').isEnabled(),true);
  await page.locator('#submit-answer').click();
  assert.equal(await page.locator('#submit-answer').isVisible(),false);
  const session=await page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('kbigdata-practical-attempt-v1')))[0]);
  assert.equal(session.autoRevealed,true);
  assert.equal(session.correct,null,'late answers remain excluded from accuracy');
  assert.equal(session.answer,'late answer');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#my-answer').waitFor();
  assert.equal(await page.locator('#my-answer').inputValue(),'late answer','reload preserves answer');
  assert.equal(await page.locator('#submit-answer').isVisible(),false);
  await page.locator('[data-action="retry"]').click();
  await page.locator('#my-answer').fill('0');
  await page.locator('#submit-answer').click();
  assert.match(await page.locator('#solve-timer').textContent(),/답 제출 · 풀이 공개/,'early submission still reveals immediately');
  assert.deepEqual(errors,[]);
  writeFileSync(`${output}/${engine}-results.json`,JSON.stringify({engine,timing:{hint:30,answer:60,boundaryChecks:true},measurements,lateSave:true,reload:true,earlySubmit:true,errors},null,2));
  console.log(`PASS ${engine}: 30s hint, exact 60s answer boundary, nine widths, 12px button gaps, readable disabled labels, late save/reload and early submit`);
}finally{await browser.close();}
