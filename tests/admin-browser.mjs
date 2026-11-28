import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
import {chromium} from "playwright";
import {approvedStudent} from "./fixtures/approved-student.mjs";

mkdirSync("ui-screenshots/admin",{recursive:true});
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 for(const admin of [false,true]){
  const context=await browser.newContext({viewport:{width:390,height:850}});
  await approvedStudent(context,{signup_type:"student",enrollment_status:"enrolled",academic_year:2},false,admin,admin);
  const newsFixture={news_id:"NTEST",title:"테스트 동문소식",content:"승인 전 관리자 검토용 내용",status:"PENDING",news_type_label:"취업",mail_status:"WAITING",mail_requested:true,created_at:"2026-11-28"};
  const mailRequests=[];
  // All legacy alumni requests reuse the logged-in portal session; mock only the Edge response.
  await context.route("https://zjsindkakjfzmjgrkaou.supabase.co/functions/v1/alumni-network-api",route=>{
   const payload=route.request().postDataJSON()||{};
   if(payload.action==="adminNewsPublish")newsFixture.status="APPROVED";
   if(payload.action==="adminMailPreview"||payload.action==="adminNewsSendMail"){
    mailRequests.push(payload);
    const result=payload.action==="adminMailPreview"?{token:"mock",counts:payload.data.groups.map(group=>({group,total:3,sent:1,sending:0,available:2})),available:payload.data.groups.length*2}:{sent:4,failed:0,done:true,next_cursor:4};
    return route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify({success:true,data:result})});
   }
   const rows=payload.action==="adminList"&&payload.data?.view==="alumni"?[{
    alumni_id:"fixture-alumni",name:"졸업생 테스트",email:"alumni@example.test",
    phone:"010-1234-5678",graduation_year:2025,company:"테스트 회사",
    career_mail_enabled:true,alumni_news_mail_enabled:false,status:"APPROVED"
   }]:payload.action==="adminList"&&payload.data?.view==="news"?[newsFixture]:[];
   return route.fulfill({status:200,contentType:"application/json",
    headers:{"Access-Control-Allow-Origin":"*"},
    body:JSON.stringify({success:true,data:rows,message:"정상 처리"})});
  });

  for(const name of ["index","accounts","certifications","rooms","help","learning","alumni","mock-exam"]){
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
    if(!["alumni","mock-exam"].includes(name)){
      await page.locator(".admin-grade-group").waitFor({state:"visible"});
      assert.equal(await page.locator("[data-admin-grade][aria-pressed=true]").getAttribute("data-admin-grade"),name==="index"?"":"2");
      assert.equal(await page.locator("[data-admin-grade='2']").evaluate(b=>Math.round(b.getBoundingClientRect().height)),48);
    }
    if(name!=="index"){
      assert.equal(await page.locator(".admin-nav-toggle").isVisible(),true);
      await page.locator(".admin-nav-toggle").click();
      assert.equal(await page.locator("#admin-work-nav").isVisible(),true);
      await page.locator(".admin-nav-toggle").click();
    }
    if(name==="accounts"){
      const filter=page.locator("#users-status");
      await filter.waitFor({state:"visible",timeout:15000});
      assert.equal(await page.locator("#users-grade").inputValue(),"2","grade preference persists across routes");
      await page.getByRole("button",{name:"상세보기"}).first().waitFor();
      assert.equal(await page.locator(".users-table tbody tr").count(),2);
      await page.locator("[data-admin-grade='1']").click();
      await page.getByText("테스트 학생",{exact:true}).waitFor();
      assert.equal(await page.locator(".users-table tbody tr").count(),1);
      await page.locator("[data-admin-grade='2']").click();
      await page.getByText("2학년 학생 A",{exact:true}).waitFor();
      assert.equal(await filter.inputValue(),"enrolled","student accounts must initially show current students");
      assert.equal(await filter.locator("option:checked").textContent(),"재학");
      await page.getByRole("button",{name:"상세보기"}).first().waitFor({state:"visible",timeout:15000});
      await page.getByRole("button",{name:"상세보기"}).first().click();
      await page.locator("#user-profile-form").waitFor({state:"visible"});
      await page.getByRole("button",{name:"학습현황",exact:true}).click();
      await page.getByText("서비스별 학습량 및 정답률").waitFor({state:"visible"});
      await page.getByRole("button",{name:"← 사용자 목록"}).click();
      await filter.selectOption("all");
      assert.equal(await filter.inputValue(),"all","staff can still view all account statuses");
    }
    if(name==="certifications"){
      await page.locator("#cert-status-chart .admin-chart").waitFor();
      assert.equal(await page.locator("#cert-admin-grade").inputValue(),"2");
      assert.equal(await page.locator("#cert-admin-list .cert-item").count(),2);
      await page.locator("[data-admin-grade='1']").click();
      await page.getByText("테스트 학생 · 1학년",{exact:true}).waitFor();
      assert.equal(await page.locator("#cert-admin-list .cert-item").count(),1);
      await page.locator("[data-admin-grade='2']").click();
      await page.locator("#cert-admin-list .cert-item").nth(1).waitFor();
    }
    if(name==="rooms"){
      await page.locator("#admin-room-week-chart .admin-chart").waitFor();
      assert.equal(await page.locator(".room-my-card").count(),2);
      await page.locator("[data-admin-grade='1']").click();
      await page.getByText("1학년 예약",{exact:true}).waitFor();
      assert.equal(await page.locator(".room-my-card").count(),1);
      await page.locator("[data-admin-grade='2']").click();
      await page.locator(".room-my-card").nth(1).waitFor();
    }
    if(name==="help"){
      await page.locator("#help-status-chart .admin-chart").waitFor();
      assert.equal(await page.locator(".help-ticket").count(),2);
      await page.locator("[data-admin-grade='1']").click();
      await page.getByText("1학년 요청",{exact:true}).waitFor();
      assert.equal(await page.locator(".help-ticket").count(),1);
      await page.locator("[data-admin-grade='2']").click();
      await page.locator(".help-ticket").nth(1).waitFor();
    }
    if(name==="learning"){
      await page.locator(".lv-kpi").first().waitFor();
      assert.equal(await page.locator(".lv-kpi").count(),2);
      assert.equal(await page.locator("#teacher-content").isVisible(),false);
      assert.equal(await page.locator(".lv-grade-card").count(),0);
      assert.equal(await page.locator("#learning-panel-study").isVisible(),false);
      assert.equal(await page.locator("#learning-panel-written").isVisible(),false);
      assert.equal(await page.locator("#learning-panel-operations").isVisible(),false);
      assert.deepEqual(await page.evaluate(()=>window.__learningRequests),["summary:week"]);
      await page.locator(".lv-columns").first().getByRole("button",{name:"제출 답안"}).first().click();
      await page.getByText("해당하는 제출 기록이 없습니다.").waitFor();
      await page.locator(".lv-answer-panel").getByRole("button",{name:"닫기"}).click();
      await page.getByRole("tab",{name:"자율학습"}).click();
      await page.locator("#study-days-chart .admin-chart").waitFor();
      assert.equal(await page.locator("#study-plan-chart").count(),0);
      assert.equal(await page.locator("#study-admin-table-body tr").count(),2);
      assert.deepEqual(await page.locator("#study-days-chart .admin-chart-label").first().locator("span,strong").allTextContents(),["월 · 1명","2시간"]);
      await page.locator("[data-admin-grade='1']").click();
      await page.locator("#study-admin-table-body tr").first().waitFor();
      assert.equal(await page.locator("#study-admin-table-body tr").count(),1);
      assert.deepEqual(await page.locator("#study-days-chart .admin-chart-label").first().locator("span,strong").allTextContents(),["월 · 1명","1.5시간"]);
      // Sharing is local and transfers only the selected week/grade aggregate PNG.
      const chart=page.locator("#study-days-chart");
      const week=await page.locator("#study-admin-week").inputValue();
      assert.match(await chart.locator(".study-share-manual").inputValue(),/1학년 주간 자율학습 현황/);
      await page.evaluate(()=>{
       Object.defineProperty(navigator,"canShare",{configurable:true,value:({files})=>files[0]?.type==="image/png"});
       Object.defineProperty(navigator,"share",{configurable:true,value:async({files,title,text})=>{
        const file=files[0],bitmap=await createImageBitmap(file);
        window.__studyShared={name:file.name,width:bitmap.width,height:bitmap.height,title,text,signature:[...new Uint8Array((await file.arrayBuffer()).slice(0,8))]};
        bitmap.close();
       }});
      });
      await chart.getByRole("button",{name:"밴드 공유하기",exact:true}).click();
      await page.waitForFunction(()=>window.__studyShared?.width===1080);
      const shared=await page.evaluate(()=>window.__studyShared);
      assert.equal(shared.height,1320);
      assert.equal(shared.title,"1학년 주간 자율학습 현황");
      assert.ok(shared.name.includes(week));
      assert.ok(shared.text.includes(week.replaceAll("-",".")));
      assert.match(shared.text,/월요일 · 1명 · 1.5시간/);
      assert.deepEqual(shared.signature,[137,80,78,71,13,10,26,10]);
      const downloadEvent=page.waitForEvent("download");
      await chart.getByRole("button",{name:"이미지 다운로드",exact:true}).click();
      const downloaded=await downloadEvent;
      assert.equal(downloaded.suggestedFilename(),shared.name);
      await page.locator("#study-admin-week").selectOption({index:3});
      await chart.getByRole("button",{name:"밴드 공유하기",exact:true}).waitFor();
      const previousWeek=await page.locator("#study-admin-week").inputValue();
      assert.notEqual(previousWeek,week);
      assert.ok((await chart.locator(".study-share-manual").inputValue()).includes(previousWeek.replaceAll("-",".")));
      await chart.getByRole("button",{name:"밴드 공유하기",exact:true}).click();
      await page.waitForFunction(w=>window.__studyShared?.name.includes(w),previousWeek);
      await page.locator("#study-admin-week").selectOption(week);
      await chart.getByRole("button",{name:"밴드 공유하기",exact:true}).waitFor();
      await page.evaluate(()=>{delete navigator.share;delete navigator.canShare;});


      await page.getByRole("button",{name:"월간 통계",exact:true}).click();
      await page.locator("#teacher-study-period-summary .learn-stat").first().waitFor();
      assert.equal(await page.locator("#study-week-view").isVisible(),false);
      assert.equal(await page.locator("#teacher-study-period-summary .learn-stat").count(),4);
      await page.getByRole("button",{name:"주간 관리",exact:true}).click();
      await page.locator("#study-days-chart .admin-chart").waitFor();
      await page.locator("[data-admin-grade='']").click();
      assert.equal(await page.locator("#study-admin-table-body .study-grade-divider").count(),2);
      assert.deepEqual(await page.locator("#study-days-chart .admin-chart-label").first().locator("span,strong").allTextContents(),["월 · 2명","3.5시간"]);
      await page.getByRole("tab",{name:"필기시험"}).click();
      await page.locator("#iw-results [data-grade-group='1'] .written-round").first().waitFor();
      assert.equal(await page.locator("#iw-results [data-grade-group='1'] .written-round").count(),1);
      assert.equal(await page.locator("#iw-results [data-grade-group='2'] .written-round").count(),2);
      assert.equal(await page.getByText("필기 학습 성과 · 참여 3명",{exact:true}).count(),1);
      await page.getByRole("tab",{name:"운영 관리"}).click();
      await page.locator("#teacher-mail-settings").waitFor();
      await page.getByText("운영 진단 자료를 불러왔습니다.").waitFor();
      assert.equal(await page.locator(".admin-grade-panel").isVisible(),false);
      assert.equal(await page.locator("#teacher-mail-faculty").isChecked(),true);
      await page.waitForFunction(()=>!document.getElementById("study-admin-mail").disabled);
      assert.equal(await page.locator("#study-admin-mail").isChecked(),false);
      await page.getByRole("tab",{name:"문제 풀이"}).click();
      await page.locator(".lv-grade-card[data-grade='1']").waitFor();
      assert.equal(await page.locator(".lv-grade-card").count(),2);
      assert.equal(await page.locator(".lv-kpi").count(),2);
      assert.equal(await page.locator(".lv-columns").first().locator(".lv-subject").count(),8);
      assert.match(await page.locator(".lv-columns").first().locator(".lv-subject").first().textContent(),/Java.*3명.*9회 풀이/);
      assert.match(await page.locator(".lv-grade-card[data-grade='1'] .lv-grade-count").textContent(),/참여 1명 \/ 재학생 1명/);
      assert.match(await page.locator(".lv-grade-card[data-grade='2'] .lv-grade-count").textContent(),/참여 2명 \/ 재학생 2명/);
      await page.screenshot({path:"ui-screenshots/admin/learning-grade-comparison-mobile.png",fullPage:true});
      await page.locator(".lv-grade-card[data-grade='1'] button").click();
      await page.waitForFunction(()=>document.querySelector(".lv-kpi-value")?.textContent.includes("1명"));
      assert.equal(await page.locator(".lv-grade-card").count(),0);
      await page.locator(".lv-columns").first().getByRole("button",{name:"필기 상세"}).last().click();
      await page.locator("#iw-results [data-grade-group='1'] .written-round").first().waitFor();
      assert.equal(await page.locator("#iw-exam").inputValue(),"engineer");
      assert.equal(await page.locator("#iw-results [data-grade-group='2']").count(),0);
      await page.getByRole("tab",{name:"자율학습"}).click();
      await page.locator("#study-days-chart .admin-chart").waitFor();
      assert.equal(await page.locator("#study-admin-table-body [data-study-grade='2']").count(),0);
      await page.locator("[data-admin-grade='2']").click();
      assert.equal(await page.locator("#study-admin-table-body tr").count(),2);
      const layout=()=>page.evaluate(()=>{
       const grid=document.querySelector("#study-admin-summary");
       const section=document.querySelector("#teacher-study-panel");
       return {
        grid:getComputedStyle(grid).display,
        columns:getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        sectionBackground:getComputedStyle(section).backgroundColor,
        pageWidth:document.documentElement.scrollWidth,
        viewport:document.documentElement.clientWidth
       };
      });
      const mobile=await layout();
      assert.equal(mobile.grid,"grid","admin learning KPI layout restored");
      assert.equal(mobile.columns,2,"admin mobile learning cards use two columns");
      assert.equal(mobile.sectionBackground,"rgb(255, 255, 255)","learning section background restored");
      assert.ok(mobile.pageWidth<=mobile.viewport+1,"admin learning mobile has no global horizontal overflow");
      await page.screenshot({path:"ui-screenshots/admin/learning-admin-mobile.png",fullPage:true});
      await page.setViewportSize({width:1280,height:900});
      const wide=await layout();
      assert.equal(wide.columns,4,"admin desktop learning cards use four columns");
      assert.ok(wide.pageWidth<=wide.viewport+1,"admin learning desktop has no global overflow");
      await page.screenshot({path:"ui-screenshots/admin/learning-admin-desktop.png",fullPage:true});
      await page.setViewportSize({width:390,height:850});
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
      assert.ok(!narrow.localScroll,"mobile alumni cards do not scroll horizontally");
      const tabWidth=await page.locator(".alumni-admin .tabs button").first().evaluate(node=>Math.round(node.getBoundingClientRect().width));
      assert.ok(tabWidth<200,"mobile alumni tabs must not consume the entire viewport width");
      assert.equal(narrow.nowrap,true,"desktop table headings retain their nowrap rule");
      assert.equal(await page.locator(".admin-table--alumni thead").isVisible(),false,"mobile uses readable record cards");
      await page.locator("#alumni-admin-charts .admin-chart").first().waitFor();
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
      await page.locator("#admin-year").selectOption("2025");
      await page.waitForFunction(()=>document.getElementById("admin-summary")?.textContent.includes("1명"));
      assert.equal(await page.locator(".admin-table--alumni tbody tr").count(),1);
      await page.locator("#admin-year").selectOption("");
      await page.waitForFunction(()=>document.getElementById("admin-summary")?.textContent.includes("2명"));
      await page.setViewportSize({width:390,height:850});
      page.on("dialog",dialog=>dialog.accept());
      await page.locator('[data-view="news"]').click();
      await page.getByRole("button",{name:"내용 확인",exact:true}).click();
      await page.getByText("승인 전 관리자 검토용 내용",{exact:true}).waitFor();
      await page.locator("#admin-close-content").click();
      assert.equal(await page.locator('[data-action="mail"]').count(),0);
      await page.getByRole("button",{name:"승인·게시",exact:true}).click();
      await page.getByRole("button",{name:"메일 발송",exact:true}).click();
      assert.equal(await page.locator("#admin-confirm-mail").isDisabled(),true);
      await page.locator('#admin-mail-groups input[value="alumni"]').check();
      await page.locator('#admin-mail-groups input[value="grade2"]').check();
      await page.locator("#admin-preview-mail").click();
      await page.getByText("발송 예정: 4명",{exact:true}).waitFor();
      assert.ok(await page.locator("#admin-mail-dialog").evaluate(el=>el.scrollWidth<=el.clientWidth+1));
      await page.screenshot({path:"ui-screenshots/admin/alumni-mail-targets-mobile.png"});
      await page.locator('#admin-mail-groups input[value="grade1"]').check();
      assert.equal(await page.locator("#admin-confirm-mail").isDisabled(),true);
      await page.locator('#admin-mail-groups input[value="grade1"]').uncheck();
      await page.locator("#admin-preview-mail").click();
      await page.getByText("발송 예정: 4명",{exact:true}).waitFor();
      await page.locator("#admin-confirm-mail").click();
      await page.getByText("발송 완료: 성공 4건",{exact:false}).waitFor();
      assert.deepEqual(mailRequests.at(-1).data.groups,["alumni","grade2"]);
      assert.equal(mailRequests.at(-1).data.confirmed,true);
      await page.locator("#admin-close-mail").click();

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
      assert.equal(result.tiles,8,"eight management tasks including printable mock exams");
      assert.equal(await page.locator('a.admin-tile[href="mock-exam.html"]').count(),1,"printable exam menu exists");
      assert.equal(result.cols,2,"compact two-column shortcuts on mobile");
      assert.ok(result.tileHeight>=100,"full touch-height cards");
      assert.ok(result.scroll<=result.viewport+1,"no mobile horizontal overflow");
      await page.locator("#admin-overview-attention .admin-chart").waitFor();
      await page.locator("#admin-overview-kpis").getByText("3명",{exact:true}).waitFor();
      await page.locator("[data-admin-grade='2']").click();
      await page.waitForFunction(()=>document.getElementById("admin-overview-caption")?.textContent==="2학년 · 승인된 재학생 기준");
      await page.locator("#admin-overview-kpis").getByText("2명",{exact:true}).first().waitFor();
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
    if(name==="mock-exam")await page.locator("#exam-subject-chart .admin-chart").waitFor();
    for(const width of [360,390,430,768,1280]){
      await page.setViewportSize({width,height:850});
      const geometry=await page.evaluate(()=>({viewport:innerWidth,body:document.documentElement.scrollWidth}));
      assert.ok(geometry.body<=geometry.viewport+1,name+" "+width+"px no global overflow");
      const clipped=await page.evaluate(()=>[...document.querySelectorAll("#admin-secure button")].filter(b=>b.getBoundingClientRect().width>0&&b.getBoundingClientRect().height>0&&b.scrollWidth>b.clientWidth+2).map(b=>b.textContent.trim()).filter(Boolean));
      assert.deepEqual(clipped,[],name+" "+width+"px button labels fit");
      if(width===390||width===1280)await page.screenshot({path:"ui-screenshots/admin/"+name+"-"+width+".png",fullPage:true});
    }
    await page.setViewportSize({width:390,height:850});
    if(name==="accounts"){
      await page.goto("http://127.0.0.1:8765/admin/accounts.html?view=approvals");
      await page.getByText("2학년 가입 대기",{exact:true}).waitFor();
      assert.equal(await page.locator(".portal-approval-item:visible").count(),1);
      await page.locator("[data-admin-grade='1']").click();
      await page.getByText("1학년 가입 대기",{exact:true}).waitFor();
      assert.equal(await page.locator(".portal-approval-item:visible").count(),1);
      await page.locator("[data-admin-grade='2']").click();
      await page.getByText("2학년 가입 대기",{exact:true}).waitFor();
      await page.screenshot({path:"ui-screenshots/admin/approvals-390.png",fullPage:true});
    }
   }
   assert.deepEqual(errors.filter(e=>!e.includes("net::")),[],name+" JS exceptions");
   await page.close();
  }
  if(!admin){
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:8765/my-learning.html",{waitUntil:"domcontentloaded"});
   // Wait until the login gate has opened and the fixture overview has rendered.
   await page.locator("#learn-summary .learn-stat").first().waitFor({state:"visible",timeout:20000});
   await page.locator("#learn-recent .learn-history-row").first().waitFor({state:"visible",timeout:10000});
   const layout=()=>page.evaluate(()=>{
    const grid=document.querySelector("#learn-summary");
    const section=document.querySelector(".learn-section");
    return {display:getComputedStyle(grid).display,
     columns:getComputedStyle(grid).gridTemplateColumns.split(" ").length,
     radius:getComputedStyle(section).borderTopLeftRadius,
     historyOverflow:getComputedStyle(document.querySelector("#learn-recent")).overflowX,
     historyRow:getComputedStyle(document.querySelector(".learn-history-row")).display,
     scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth};
   });
   const mobile=await layout();
   assert.equal(mobile.display,"grid","student learning overview grid restored");
   assert.equal(mobile.columns,2,"student mobile has two learning card columns");
   assert.equal(mobile.radius,"14px","student learning sections have restored card borders");
   assert.equal(mobile.historyRow,"grid","student mobile history displays responsive cards");
   assert.equal(mobile.historyOverflow,"visible","mobile history cards do not need a local scrollbar");
   assert.ok(mobile.scroll<=mobile.viewport+1,"student mobile has no global horizontal overflow");
   await page.setViewportSize({width:1280,height:900});
   const wide=await layout();
   assert.equal(wide.columns,4,"student desktop has four learning card columns");
   assert.equal(wide.historyRow,"table-row","student desktop history displays a table");
   assert.equal(wide.historyOverflow,"auto","student desktop history contains wide tables");
   assert.ok(wide.scroll<=wide.viewport+1,"student desktop has no global horizontal overflow");
   await page.close();
  }
  await context.close();
 }
 console.log("PASS: eight super-admin routes; alumni tabs, mobile table scroll and shared 390/1280px geometry.");
}finally{await browser.close();}
