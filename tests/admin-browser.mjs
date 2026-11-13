import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
import {chromium} from "playwright";
import {approvedStudent} from "./fixtures/approved-student.mjs";

mkdirSync("ui-screenshots/admin",{recursive:true});
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 for(const admin of [false,true]){
  const context=await browser.newContext({viewport:{width:390,height:850}});
  await approvedStudent(context,{signup_type:"student",enrollment_status:"enrolled",academic_year:2},false,admin);
  for(const name of ["index","accounts","certifications","rooms","help","learning"]){
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:8765/admin/"+name+".html",{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>["approved","denied"].includes(document.documentElement.dataset.adminAccess),null,{timeout:20000});
   const selector=admin?"#admin-secure":"#admin-denied";
   await page.locator(selector).waitFor({state:"visible",timeout:20000});
   assert.equal(await page.locator("#admin-secure").isVisible(),admin,name+" contents restricted");
   assert.equal(await page.locator("#admin-denied").isVisible(),!admin,name+" denial shown");
   assert.equal(await page.locator("#admin-gate-status").isVisible(),!admin);
   if(admin){
    assert.equal(await page.locator(".admin-intro h1").isVisible(),true);
    assert.equal(await page.locator(".brand-mark").isVisible(),true,"shared H logo "+name);
    if(name==="index"){
      const result=await page.evaluate(()=>{
       const grid=document.querySelector(".admin-grid--featured");
       const tile=grid?.querySelector(".admin-tile");
       return {tiles:document.querySelectorAll(".admin-tile").length,
        cols:getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        tileHeight:Math.round(tile.getBoundingClientRect().height),
        scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth};
      });
      assert.equal(result.tiles,7,"seven management tasks preserved");
      assert.equal(result.cols,1,"featured cards are single column on mobile");
      assert.ok(result.tileHeight>=100,"full touch-height cards");
      assert.ok(result.scroll<=result.viewport+1,"no mobile horizontal overflow");
      await page.screenshot({path:"ui-screenshots/admin/admin-home-mobile.png",fullPage:true});
      await page.setViewportSize({width:1280,height:900});
      const wide=await page.evaluate(()=>({
       featured:getComputedStyle(document.querySelector(".admin-grid--featured")).gridTemplateColumns.split(" ").length,
       services:getComputedStyle(document.querySelector(".admin-grid--services")).gridTemplateColumns.split(" ").length,
       scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth
      }));
      assert.equal(wide.featured,2,"two priority tiles on desktop");
      assert.equal(wide.services,3,"three service columns on desktop");
      assert.ok(wide.scroll<=wide.viewport+1,"no desktop overflow");
      await page.screenshot({path:"ui-screenshots/admin/admin-home-desktop.png",fullPage:true});
      await page.setViewportSize({width:390,height:850});
    }
   }
   assert.deepEqual(errors.filter(e=>!e.includes("net::")),[],name+" JS exceptions");
   await page.close();
  }
  await context.close();
 }
 console.log("PASS: six super-admin routes, denied students, portal-style home at 390/1280px with no overflow.");
}finally{await browser.close();}
