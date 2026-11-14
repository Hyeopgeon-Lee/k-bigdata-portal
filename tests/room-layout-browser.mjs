import assert from "node:assert/strict";
import {chromium} from "playwright";
import {approvedStudent} from "./fixtures/approved-student.mjs";

const widths=[320,360,390,430,768,1024,1280,1440,1920];
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
  for(const width of widths){
    const context=await browser.newContext({viewport:{width,height:850}});
    await approvedStudent(context);
    const page=await context.newPage();
    try{
      await page.goto("http://127.0.0.1:8765/room.html",{waitUntil:"domcontentloaded"});
      await page.waitForFunction(()=>document.documentElement.dataset.portalAccess==="approved",{timeout:15000});
      await page.waitForFunction(()=>
        !document.getElementById("learning-lock") &&
        (document.querySelector(".room-layout")?.getBoundingClientRect().width||0)>0,
        {timeout:16000});
      await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});

      const dims=await page.evaluate(()=>{
        const box=selector=>{
          const element=document.querySelector(selector);
          assertElement(element,selector);
          const rect=element.getBoundingClientRect();
          return {x:Math.round(rect.left),width:Math.round(rect.width)};
        };
        function assertElement(element,selector){if(!element)throw Error("Element missing "+selector);}
        return {hero:box(".portal-page-intro"),layout:box(".room-layout"),nav:box(".portal-service-nav"),
          viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth};
      });
      const gutter=width<=767?32:48;
      const expected=Math.min(width-gutter,1280);
      assert.deepEqual(dims.hero,dims.layout,"Hero and reservation content must align at "+width+"px");
      assert.deepEqual(dims.nav,dims.layout,"Portal navigation and room content must align at "+width+"px");
      assert.ok(Math.abs(dims.layout.width-expected)<=1,
        "Room reservation width at "+width+"px must equal "+expected+", got "+dims.layout.width);
      assert.ok(dims.scroll<=dims.viewport+1,"No horizontal overflow at "+width+"px");
      console.log("PASS "+width+"px: room content "+dims.layout.width+"px");
      if(width===390){
        // The validation message must be visible in the booking form on a phone.
        await page.locator('[data-room-tab="new"]').click();
        assert.equal(await page.locator('#room-full-day').isVisible(),false,
          'Students must not see the full-day reservation button');
        assert.match(await page.locator('#room-role-rule').innerText(),/최대 3시간/);
        const tomorrow=await page.evaluate(()=>new Date(Date.now()+86400000).toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'}));
        await page.locator('#room-date').fill(tomorrow);
        await page.locator('select[name="start"]').selectOption('10:00');
        await page.locator('select[name="end"]').selectOption('18:00');
        assert.match(await page.locator('#room-duration-hint').innerText(),/8시간/);
        await page.locator('#room-submit').click();
        assert.equal(await page.locator('#room-booking-feedback').isVisible(),true);
        assert.match(await page.locator('#room-booking-feedback').innerText(),/최대 3시간/);
        assert.equal(await page.locator('[data-room-tab="new"]').getAttribute('aria-selected'),'true',
          'Invalid booking must stay on the form');
        await page.locator('select[name="end"]').selectOption('13:00');
        assert.match(await page.locator('#room-duration-hint').innerText(),/3시간/);
        await page.locator('#room-submit').click();
        await page.waitForFunction(()=>document.querySelector('[data-room-tab="mine"]')?.getAttribute('aria-selected')==='true');
        assert.match(await page.locator('#room-my-list').innerText(),/8318호/,
          'Exactly three-hour booking must be inserted using the browser fixture');
        console.log('PASS mobile booking: 8-hour reservation rejected with inline message, 3-hour reservation accepted');
      }
    }finally{await context.close();}
  }

  const adminContext=await browser.newContext({viewport:{width:390,height:850}});
  await approvedStudent(adminContext,{},false,true);
  try{
    const adminPage=await adminContext.newPage();
    await adminPage.goto('http://127.0.0.1:8765/room.html',{waitUntil:'domcontentloaded'});
    await adminPage.waitForFunction(()=>document.documentElement.dataset.portalAccess==='approved' &&
      !document.getElementById('learning-lock') &&
      document.querySelector('#room-app')?.hidden===false,{timeout:16000});
    await adminPage.locator('[data-room-tab="new"]').click();
    assert.equal(await adminPage.locator('#room-full-day').isVisible(),true,
      'The server-authorized administrator sees full day option');
    assert.match(await adminPage.locator('#room-role-rule').innerText(),/최대 13시간/);
    await adminPage.locator('#room-full-day').click();
    assert.equal(await adminPage.locator('select[name="start"]').inputValue(),'09:00');
    assert.equal(await adminPage.locator('select[name="end"]').inputValue(),'22:00');
    assert.match(await adminPage.locator('#room-duration-hint').innerText(),/13시간/);
    await adminPage.locator('#room-submit').click();
    await adminPage.waitForFunction(()=>document.querySelector('[data-room-tab="mine"]')?.getAttribute('aria-selected')==='true');
    assert.match(await adminPage.locator('#room-my-list').innerText(),/8318호/,
      '13-hour reservation is accepted for the administrator in the browser fixture');
    console.log('PASS mobile admin booking: full-day action is visible, 09:00-22:00 reservation succeeds');
  }finally{await adminContext.close();}
}finally{await browser.close();}
