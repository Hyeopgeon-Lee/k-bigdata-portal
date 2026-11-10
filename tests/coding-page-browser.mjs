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
    assert.match(await page.locator("#coding-statement").innerText(),/하시오\.$/,"freshman imperative ending");
    assert.match(await page.locator("#coding-input").innerText(),/^student@ubuntu:/,"Ubuntu initial-state console");
    assert.match(await page.locator("#coding-output").innerText(),/^student@ubuntu:/,"Ubuntu expected-result console");
    assert.equal(await page.locator(".coding-ubuntu-terminal-demo").count(),1,"terminal mode enabled");
    assert.equal(await page.locator("#coding-ubuntu-output-note").isVisible(),true,"environment-dependent output note visible");

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
    assert.ok((await page.locator("#coding-ubuntu-verify").innerText()).includes("ls -l report.txt"));

    await page.locator("#coding-language button[data-lang=java]").click();
    assert.equal(await page.locator("#coding-trace-button").isVisible(),true);
    assert.equal(await page.locator("#coding-ubuntu-guide").isVisible(),false);
    assert.equal(await page.locator("#coding-answer").isHidden(),true);
    await page.screenshot({path:"ui-screenshots/learning-"+width+".png",fullPage:true});

    if(width===390){
      await page.goto("http://127.0.0.1:8765/coding.html?id=C-001",{waitUntil:"domcontentloaded"});
      await page.locator("#coding-title").filter({hasText:"두 정수의 합"}).waitFor({timeout:15000});
      const autoToggle=page.locator("#coding-autocomplete-toggle");
      assert.equal(await autoToggle.isChecked(),false,"autocomplete starts OFF in new browser");
      assert.equal(await page.locator("#coding-autocomplete-status").innerText(),"꺼짐");
      await page.waitForFunction(()=>!document.querySelector("#coding-autocomplete-toggle").disabled,{timeout:20000});
      const richEditor=page.locator("#coding-editor-host .cm-content");
      await richEditor.waitFor({state:"visible",timeout:20000});
      await richEditor.click();
      await page.keyboard.type("pri",{delay:55});
      await page.waitForTimeout(500);
      assert.equal(await page.locator(".cm-tooltip-autocomplete").isVisible(),false,"OFF suppresses suggestion popup");
      await autoToggle.check();
      assert.equal(await page.locator("#coding-autocomplete-status").innerText(),"켜짐");
      await richEditor.fill("");
      await richEditor.click();
      await page.keyboard.type("pri",{delay:55});
      const completionPopup=page.locator(".cm-tooltip-autocomplete");
      await completionPopup.waitFor({state:"visible",timeout:10000});
      assert.match(await completionPopup.innerText(),/printf/,"ON offers C function completion");
      await autoToggle.uncheck();
      await completionPopup.waitFor({state:"hidden",timeout:4000});
      await richEditor.fill("");
      await richEditor.click();
      await page.keyboard.type("pri",{delay:55});
      await page.keyboard.press("Control+Space");
      await page.waitForTimeout(400);
      assert.equal(await completionPopup.isVisible(),false,"OFF also disables manual completion shortcut");

      await autoToggle.check();
      await page.reload({waitUntil:"domcontentloaded"});
      await page.waitForFunction(()=>!document.querySelector("#coding-autocomplete-toggle").disabled,{timeout:20000});
      assert.equal(await autoToggle.isChecked(),true,"ON setting saved after reload");
      await page.locator("#coding-language button[data-lang=java]").click();
      assert.equal(await autoToggle.isChecked(),true,"setting follows language switch");
      await richEditor.fill("");
      await richEditor.click();
      await page.keyboard.type("Sys",{delay:55});
      await completionPopup.waitFor({state:"visible",timeout:10000});
      assert.match(await completionPopup.innerText(),/System.out.println/,"Java-specific completions offered");
      await autoToggle.uncheck();
      await page.reload({waitUntil:"domcontentloaded"});
      await page.waitForFunction(()=>!document.querySelector("#coding-autocomplete-toggle").disabled,{timeout:20000});
      assert.equal(await autoToggle.isChecked(),false,"OFF setting persisted");
      await page.goto("http://127.0.0.1:8765/coding.html?id=PY-041");
      await page.locator("#coding-title").filter({hasText:"1부터 N까지의 합"}).waitFor({timeout:15000});
      // CodeMirror progressively hides the original textarea when CDN modules load.
      const draftEditor=page.locator("#coding-editor-host .cm-content");
      if(await draftEditor.isVisible()) await draftEditor.fill("print('연습')");
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
  // Regression: no Linux exercise should expose its command in a visible terminal example.
  const maskContext=await browser.newContext({viewport:{width:390,height:820}});
  const maskedPage=await maskContext.newPage();
  maskedPage.on("pageerror",e=>failures.push("mask-test: "+e.message));
  for(const id of ["LINUX-003","LINUX-004","LINUX-042"]){
    await maskedPage.goto("http://127.0.0.1:8765/coding.html?id="+id,{waitUntil:"domcontentloaded"});
    await maskedPage.locator("#coding-id").filter({hasText:id}).waitFor({timeout:15000});
    const before=await maskedPage.locator("#coding-input").innerText();
    const after=await maskedPage.locator("#coding-output").innerText();
    assert.ok(before.includes("[명령어 입력]"),id+" must have a starting command input marker");
    assert.ok(after.includes("[명령어 입력]"),id+" must have an expected-output command input marker");
    assert.ok(!/^student@ubuntu:[^\n$]*\$\s*(?:pwd|ls|ps\s+-ef)/m.test(after),id+" expected output must not show the solution");
    assert.ok(await maskedPage.locator("#coding-answer").isHidden(),id+" answer panel hidden before click");
    assert.ok((await maskedPage.locator("#coding-output .ubuntu-command-placeholder").count())>=1,id+" visibly highlights the input position");
  }
  await maskedPage.goto("http://127.0.0.1:8765/coding.html?id=LINUX-003",{waitUntil:"domcontentloaded"});
  await maskedPage.locator("#coding-id").filter({hasText:"LINUX-003"}).waitFor({timeout:15000});
  await maskedPage.locator("#coding-answer-button").click();
  assert.ok(await maskedPage.locator("#coding-answer").isVisible(),"student can reveal the solution on demand");
  assert.match(await maskedPage.locator("#coding-code").innerText(),/^pwd$/,"revealed answer is intact");
  await maskContext.close();
  assert.deepEqual(failures,[],"no JavaScript runtime errors in learning UI");
  console.log("PASS: learning/practical navigation parity at 360/390/430/768/1280, sharing, reporting, layout and saved drafts");
}finally{await browser.close();}
