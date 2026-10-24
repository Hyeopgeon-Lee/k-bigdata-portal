import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
import {chromium} from "playwright";

mkdirSync("ui-screenshots",{recursive:true});
const browser = await chromium.launch({headless:true,args:["--no-sandbox"]});
const failures=[];
const widths=[360,390,430,768,1280];
try{
  for(const width of widths){
    const context=await browser.newContext({viewport:{width,height:820},permissions:["clipboard-read","clipboard-write"]});
    const page=await context.newPage();
    page.on("pageerror",e=>failures.push(width+": "+e.message));
    await page.goto("http://127.0.0.1:8765/coding.html?id=LINUX-002",{waitUntil:"domcontentloaded"});
    await page.locator("#coding-title").filter({hasText:"파일 접근 권한 설정"}).waitFor({timeout:15000});
    assert.match(await page.locator("#coding-heading").innerText(),/기초 프로그래밍·명령어 350제/);
    assert.equal(await page.locator("#coding-available").innerText(),"350문제");
    assert.equal((await page.locator("#coding-language button[data-lang=linux] span").innerText()),"50문제");
    assert.equal(await page.locator("#coding-trace-button").isVisible(),false);
    assert.equal(await page.locator("#coding-share-button").isVisible(),true);
    assert.equal(await page.locator("#coding-link-button").isVisible(),true);
    assert.equal(await page.locator("#coding-report-button").isVisible(),true);
    assert.ok(await page.locator("#coding-answer").isHidden(),"answer must start hidden");
    await page.locator(".portal-service-nav.portal-nav-compact").waitFor({timeout:12000});
    const codingNav=await page.evaluate(()=>{
      const nav=document.querySelector(".portal-nav-current");
      const selected=nav.querySelector('a[aria-current="page"]');
      const css=getComputedStyle(selected);
      return {
        heading:nav.querySelector(".portal-nav-title").textContent,
        tabs:[...nav.querySelectorAll(".portal-nav-items a")].map(a=>a.textContent),
        active:selected.textContent,
        buttonStyle:{background:css.backgroundColor,color:css.color,minHeight:css.minHeight,borderRadius:css.borderRadius},
        toolbarCount:document.querySelectorAll(".study-header").length
      };
    });
    assert.equal(codingNav.heading,"학습 · 역량");
    assert.equal(codingNav.active,"기초학습");
    const practicePage=await context.newPage();
    await practicePage.goto("http://127.0.0.1:8765/practical.html",{waitUntil:"domcontentloaded"});
    await practicePage.locator(".portal-service-nav.portal-nav-compact").waitFor({timeout:12000});
    const practicalNav=await practicePage.evaluate(()=>{
      const nav=document.querySelector(".portal-nav-current");
      const selected=nav.querySelector('a[aria-current="page"]');
      const css=getComputedStyle(selected);
      return {
        heading:nav.querySelector(".portal-nav-title").textContent,
        tabs:[...nav.querySelectorAll(".portal-nav-items a")].map(a=>a.textContent),
        active:selected.textContent,
        buttonStyle:{background:css.backgroundColor,color:css.color,minHeight:css.minHeight,borderRadius:css.borderRadius},
        toolbarCount:document.querySelectorAll(".study-header").length
      };
    });
    assert.equal(practicalNav.heading,codingNav.heading,"matching learning group heading "+width);
    assert.deepEqual(practicalNav.tabs,codingNav.tabs,"matching learning navigation buttons "+width);
    assert.equal(practicalNav.active,"실기");
    assert.deepEqual(practicalNav.buttonStyle,codingNav.buttonStyle,"matching active navigation button styles "+width);
    assert.equal(practicalNav.toolbarCount,0,"practical auxiliary toolbar removed "+width);
    assert.equal(codingNav.toolbarCount,0,"coding auxiliary toolbar removed "+width);
    await practicePage.close();
    const bounds=await page.evaluate(()=>({content:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
    assert.ok(bounds.content<=bounds.viewport+2,"no horizontal overflow width "+width+" "+JSON.stringify(bounds));

    assert.equal(await page.locator("#coding-summary").isVisible(),true,"study status remains available in content");
    await page.locator("#coding-link-button").click();
    await page.waitForFunction(()=>document.querySelector("#coding-share-status")?.textContent?.includes("문제 링크를 복사"),null,{timeout:7000});
    assert.match(await page.locator("#coding-share-status").innerText(),/문제 링크를 복사/);
    const link=await page.evaluate(()=>navigator.clipboard.readText());
    assert.equal(new URL(link).searchParams.get("id"),"LINUX-002");

    await page.locator("#coding-share-button").click();
    await page.waitForFunction(()=>document.querySelector("#coding-share-status")?.textContent?.includes("링크를 복사"),null,{timeout:7000});
    assert.match(await page.locator("#coding-share-status").innerText(),/링크를 복사/);
    const shareText=await page.evaluate(()=>navigator.clipboard.readText());
    assert.ok(shareText.includes("LINUX-002"),"problem share must preserve unique question link");

    await page.locator("#coding-answer-button").click();
    assert.equal(await page.locator("#coding-ubuntu-guide").isVisible(),true);
    assert.ok((await page.locator("#coding-ubuntu-parts").innerText()).includes("chmod"));
    assert.ok((await page.locator("#coding-ubuntu-verify").innerText()).includes("stat"));

    await page.locator("#coding-language button[data-lang=java]").click();
    assert.equal(await page.locator("#coding-trace-button").isVisible(),true);
    assert.equal(await page.locator("#coding-ubuntu-guide").isVisible(),false);
    assert.equal(await page.locator("#coding-answer").isHidden(),true);
    await page.screenshot({path:"ui-screenshots/learning-"+width+".png",fullPage:true});

    if(width===390){
      await page.goto("http://127.0.0.1:8765/coding.html?id=PY-041");
      await page.locator("#coding-title").filter({hasText:"1부터 N까지의 합"}).waitFor({timeout:15000});
      // CodeMirror progressively hides the original textarea when CDN modules load.
      const richEditor=page.locator("#coding-editor-host .cm-content");
      if(await richEditor.isVisible()) await richEditor.fill("print('연습')");
      else await page.locator("#coding-editor").fill("print('연습')");
      await page.waitForFunction(()=>document.querySelector("#coding-editor")?.value==="print('연습')");
      await page.reload({waitUntil:"domcontentloaded"});
      await page.locator("#coding-title").filter({hasText:"1부터 N까지의 합"}).waitFor({timeout:15000});
      await page.waitForFunction(()=>document.querySelector("#coding-editor")?.value==="print('연습')");
      assert.equal(await page.locator("#coding-editor").inputValue(),"print('연습')","draft survives reload");
      await page.route("https://help.k-bigdata.kr/request.html**",route=>route.fulfill({status:200,contentType:"text/html",body:"<html><body>신고 양식으로 이동</body></html>"}));
      await Promise.all([
        page.waitForURL(/help\.k-bigdata\.kr\/request\.html/, {timeout:12000}),
        page.locator("#coding-report-button").click()
      ]);
      const report=new URL(page.url());
      assert.equal(report.searchParams.get("source"),"coding");
      assert.equal(report.searchParams.get("id"),"PY-041");
      assert.ok(report.searchParams.get("url").includes("coding.html?id=PY-041"));
    }
    await context.close();
  }
  assert.deepEqual(failures,[],"no JavaScript runtime errors in learning UI");
  console.log("PASS: learning/practical navigation parity at 360/390/430/768/1280, sharing, reporting, layout and saved drafts");
}finally{await browser.close();}
