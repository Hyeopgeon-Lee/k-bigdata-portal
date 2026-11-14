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
    }finally{await context.close();}
  }
}finally{await browser.close();}
