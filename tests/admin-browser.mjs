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
  // All legacy alumni requests reuse the logged-in portal session; mock only the Edge response.
  await context.route("https://zjsindkakjfzmjgrkaou.supabase.co/functions/v1/alumni-network-api",route=>{
   const payload=route.request().postDataJSON()||{};
   const rows=payload.action==="adminList"&&payload.data?.view==="alumni"?[{
    alumni_id:"fixture-alumni",name:"졸업생 테스트",email:"alumni@example.test",
    phone:"010-1234-5678",graduation_year:2025,company:"테스트 회사",
    career_mail_enabled:true,alumni_news_mail_enabled:false,status:"APPROVED"
   }]:[];
   return route.fulfill({status:200,contentType:"application/json",
    headers:{"Access-Control-Allow-Origin":"*"},
    body:JSON.stringify({success:true,data:rows,message:"정상 처리"})});
  });

  for(const name of ["index","accounts","certifications","rooms","help","learning","alumni"]){
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
    if(name==="accounts"){
      const filter=page.locator("#portal-admin-filter");
      await filter.waitFor({state:"visible",timeout:15000});
      assert.equal(await filter.inputValue(),"enrolled","student accounts must initially show current students");
      assert.equal(await filter.locator("option:checked").textContent(),"재학");
      await filter.selectOption("all");
      assert.equal(await filter.inputValue(),"all","staff can still view all account statuses");
    }
    if(name==="alumni"){
      await page.locator(".admin-table--alumni tbody tr").first().waitFor({state:"visible",timeout:15000});
      const narrow=await page.evaluate(()=>{
        const wrap=document.querySelector("#admin-table");
        const th=[...document.querySelectorAll(".admin-table--alumni th")];
        return {
          pageWidth:document.documentElement.scrollWidth,
          viewport:document.documentElement.clientWidth,
          localScroll:wrap.scrollWidth>wrap.clientWidth,
          nowrap:th.length===8&&th.every(node=>getComputedStyle(node).whiteSpace==="nowrap")
        };
      });
      assert.ok(narrow.pageWidth<=narrow.viewport+1,"alumni mobile has no global horizontal overflow");
      assert.ok(narrow.localScroll,"wide alumni tables scroll within their panel");
      const tabWidth=await page.locator(".alumni-admin .tabs button").first().evaluate(node=>Math.round(node.getBoundingClientRect().width));
      assert.ok(tabWidth<200,"mobile alumni tabs must not consume the entire viewport width");
      assert.equal(narrow.nowrap,true,"all eight alumni table headings stay on one line");
      await page.screenshot({path:"ui-screenshots/admin/alumni-admin-mobile.png",fullPage:true});
      await page.setViewportSize({width:1280,height:900});
      const desktop=await page.evaluate(()=>({
        scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,
        shell:Math.round(document.querySelector(".admin-main").getBoundingClientRect().width),
        parent:Math.round(document.querySelector(".admin-header-inner").getBoundingClientRect().width)
      }));
      assert.ok(desktop.scroll<=desktop.viewport+1,"alumni desktop has no global overflow");
      assert.equal(desktop.shell,desktop.parent,"alumni header and content widths match");
      await page.screenshot({path:"ui-screenshots/admin/alumni-admin-desktop.png",fullPage:true});
      await page.getByRole("button",{name:"채용정보 관리"}).click();
      await page.getByText("조건에 맞는 데이터가 없습니다.").waitFor({state:"visible",timeout:15000});
      await page.getByRole("button",{name:"졸업생 현황"}).click();
      await page.locator(".admin-table--alumni tbody tr").first().waitFor({state:"visible",timeout:15000});
      await page.setViewportSize({width:390,height:850});
    }
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
 console.log("PASS: seven super-admin routes; alumni tabs, mobile table scroll and shared 390/1280px geometry.");
}finally{await browser.close();}
