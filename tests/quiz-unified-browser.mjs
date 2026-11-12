import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {chromium} from "playwright";
import {approvedStudent} from "./fixtures/approved-student.mjs";

const base="http://127.0.0.1:8765/";
const widths=[360,390,430,768,1024,1280,1440];
const cases=[
  {name:"practical",url:"practical.html?id=R-SQL-0015",ready:"#my-answer"},
  {name:"ncp",url:"ncp.html?id=NCP-R007",ready:"#ncp-answer-entry"},
  {name:"coding",url:"coding.html?id=C-006",ready:"#coding-work-heading"}
];
mkdirSync("ui-screenshots/quiz-unified",{recursive:true});
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const failures=[],measurements=[];
const styleKeys=["display","backgroundColor","color","fontFamily","fontSize","fontWeight","lineHeight",
  "borderTopColor","borderTopWidth","borderTopLeftRadius","paddingTop","paddingLeft","columnGap","minHeight"];
try{
 for(const width of widths){
   const snapshot={};
   for(const target of cases){
     const context=await browser.newContext({viewport:{width,height:900},reducedMotion:"reduce",permissions:["clipboard-read","clipboard-write"]});
     await approvedStudent(context);
     await context.route(/https:\/\/(?:www\.)?(?:googletagmanager\.com|google-analytics\.com|analytics\.google\.com)\//,
       route=>route.fulfill({status:200,contentType:"application/javascript",body:""}));
     const page=await context.newPage();
     page.on("pageerror",e=>failures.push({width,service:target.name,error:e.message}));
     try{
       await page.goto(new URL(target.url,base).href,{waitUntil:"domcontentloaded"});
       await page.locator(target.ready).waitFor({timeout:20000,state:"visible"});
       await page.locator(".quiz-navigation").waitFor({timeout:15000});
       assert.equal(await page.locator(".quiz-navigation").count(),1,target.name+" shared navigation");
       assert.equal(await page.locator(".quiz-heading").count(),1,target.name+" shared heading");
       assert.equal(await page.locator(".quiz-actions .quiz-action").count(),3,target.name+" three actions");
       const tones=["share","copy","report"];
       const actionColors=[];
       for(const tone of tones){
         const action=page.locator(".quiz-actions .quiz-action--"+tone);
         assert.equal(await action.count(),1,target.name+" "+tone+" action present");
         const result=await action.evaluate(el=>{
           const css=getComputedStyle(el);
           return {backgroundColor:css.backgroundColor,color:css.color,borderColor:css.borderTopColor};
         });
         actionColors.push(result);
       }
       assert.equal(new Set(actionColors.map(item=>item.backgroundColor)).size,3,
         target.name+" must display three different action colors");

       assert.equal(await page.locator(".quiz-answer").count(),1,target.name+" shared answer frame");
       assert.equal(await page.locator(".quiz-actions details").count(),0,target.name+" actions may not be collapsed");
       assert.equal(await page.locator(".quiz-nav-button").count(),2,target.name+" list/answer navigation");
       assert.equal(await page.locator(".quiz-title").isVisible(),true,target.name+" title visible");
       // Top "답 입력 ↓" must move keyboard focus to the real answer control.
       // It must not alter the chosen option, typed answer or reveal the solution.
       const jump=page.locator(".quiz-nav-jump");
       if(target.name==="ncp")
         assert.equal(await page.locator('.ncp-choice[aria-pressed="true"]').count(),0,
           "NCP navigation must not pick a choice before click");
       await jump.click();
       const focus=await page.evaluate(()=>{
         const active=document.activeElement;
         return {
           inAnswer:!!document.querySelector(".quiz-answer")?.contains(active),
           codingRich:active?.classList.contains("cm-content")===true,
           codingNative:active?.id==="coding-editor",
           ncpChoice:active?.matches(".ncp-choice")===true,
           practicalInput:active?.id==="my-answer"
         };
       });
       assert.equal(focus.inAnswer,true,target.name+" answer jump must focus inside the answer card");
       if(target.name==="coding"){
         assert.ok(focus.codingRich||focus.codingNative,
           "C-006 answer jump must put typing caret in CodeMirror or visible textarea");
         if(focus.codingRich)
           assert.equal(await page.locator("#coding-editor").isVisible(),false,
             "Rich editor focus must not use the hidden native textarea");
       }else if(target.name==="ncp"){
         assert.equal(focus.ncpChoice,true,"NCP answer jump must focus a choice, not the hint button");
         assert.equal(await page.locator('.ncp-choice[aria-pressed="true"]').count(),0,
           "NCP jump must not choose an option");
         await page.locator(".ncp-choice").nth(1).click();
         await jump.click();
         assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute("aria-pressed")),"true",
           "NCP must return focus to the already-selected option");
       }else{
         assert.equal(focus.practicalInput,true,"Information Processing answer jump must focus its input");
       }
       // The focus test clicks the jump button. Clear mouse hover before the
       // unrelated CSS parity snapshots; keyboard focus must remain unchanged.
       await page.mouse.move(0,0);

       assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),
         false,target.name+" whole page must not scroll horizontally at "+width);
       snapshot[target.name]=await page.evaluate((keys)=>{
         const get=selector=>{
           const el=document.querySelector(selector);
           const c=getComputedStyle(el),b=el.getBoundingClientRect();
           return {style:Object.fromEntries(keys.map(k=>[k,c[k]])),
             rect:{x:Math.round(b.x),width:Math.round(b.width),height:Math.round(b.height)}};
         };
         return {card:get(".ncp-panel,.bank-solve,.coding-detail"),
           nav:get(".quiz-navigation"),navList:get(".quiz-nav-list"),navJump:get(".quiz-nav-jump"),
           title:get(".quiz-title"),
           heading:get(".quiz-heading"),badge:get(".quiz-badge"),
           actions:get(".quiz-actions"),action:get(".quiz-action"),answer:get(".quiz-answer")};
       },styleKeys);
       snapshot[target.name].actionColors=actionColors;
       assert.deepEqual(snapshot[target.name].navList.style,snapshot[target.name].navJump.style,
         target.name+" list and answer navigation must have identical computed styles at "+width+"px");
       for(const dimension of ["width","height"]){
         assert.ok(Math.abs(snapshot[target.name].navList.rect[dimension]-
                            snapshot[target.name].navJump.rect[dimension])<=1,
           target.name+" list and answer navigation "+dimension+" differs at "+width+"px");
       }
       const expectedNavHeight=width<=690?44:46;
       assert.ok(Math.abs(snapshot[target.name].navList.rect.height-expectedNavHeight)<=1,
         target.name+" nav button must be "+expectedNavHeight+"px high at "+width+"px");

       const desktopCardTarget=Math.min(1240,width-(width<=690?24:32));
       assert.ok(Math.abs(snapshot[target.name].card.rect.width-desktopCardTarget)<=2,
         target.name+" detail width at "+width+": expected "+desktopCardTarget+"px, got "+snapshot[target.name].card.rect.width+"px");
       if([390,1440].includes(width)){
         await page.screenshot({path:"ui-screenshots/quiz-unified/"+target.name+"-"+width+"-question.png"});
       }
       if(target.name==="ncp"){
         assert.ok((await page.locator(".quiz-question").innerText()).length>6);
         const questionY=(await page.locator(".quiz-question").boundingBox()).y;
         const originY=(await page.locator(".ncp-original-reference").boundingBox());
         assert.ok(!originY||questionY<originY.y,"NCP problem must be above original source");
         await page.locator(".ncp-choice").first().click();
         await page.locator("[data-open]").click();
       }else if(target.name==="practical"){
         await page.locator("#my-answer").fill("학습 확인");
         await page.locator("#submit-answer").click();
       }else{
         await page.locator("#coding-answer-button").click();
       }
       await page.locator(".quiz-results").first().waitFor({timeout:10000,state:"visible"});
       assert.ok((await page.locator(".quiz-disclosure").count())>=1,target.name+" explanation accordion");
       assert.ok((await page.locator(".study-review [data-grade]").count())>=3,target.name+" grade feedback controls");
       const answerButton=page.locator(".quiz-solve-action--answer").first();
       const answerPanel=page.locator(target.name==="practical"?"#answer-result":
                                     target.name==="ncp"?"#ncp-answer-results":"#coding-answer");
       assert.equal(await answerButton.getAttribute("aria-expanded"),"true",
         target.name+" must expose expanded state on first reveal");
       await page.locator(".study-review").first().evaluate(el=>el.dataset.toggleTest="preserved");
       const answeredQuestion=target.name==="practical"?await page.locator("#my-answer").inputValue():
         target.name==="ncp"?await page.locator(".ncp-choice[aria-pressed=true]").first().getAttribute("data-choice"):
         await page.locator("#coding-editor").inputValue();
       await answerButton.click();
       assert.equal(await answerPanel.isVisible(),false,target.name+" second click collapses solution");
       assert.equal(await answerButton.getAttribute("aria-expanded"),"false",target.name+" collapsed ARIA state");
       assert.match(await answerButton.innerText(),/정답.*해설 보기/);
       await answerButton.click();
       assert.equal(await answerPanel.isVisible(),true,target.name+" third click reopens solution");
       assert.equal(await answerButton.getAttribute("aria-expanded"),"true",target.name+" expanded ARIA state");
       assert.equal(await page.locator(".study-review").first().getAttribute("data-toggle-test"),"preserved",
         target.name+" must keep review controls mounted");
       const afterAnswer=target.name==="practical"?await page.locator("#my-answer").inputValue():
         target.name==="ncp"?await page.locator(".ncp-choice[aria-pressed=true]").first().getAttribute("data-choice"):
         await page.locator("#coding-editor").inputValue();
       assert.equal(afterAnswer,answeredQuestion,target.name+" answer must survive toggle");

       if([390,1440].includes(width)){
         await page.locator(".quiz-results").first().screenshot({path:"ui-screenshots/quiz-unified/"+target.name+"-"+width+"-answer.png"});
       }
       // Switching to the list must use the same responsive max-width as the detail.
       await page.locator(".quiz-nav-list").click();
       await page.locator("main .question-browser").waitFor({state:"visible",timeout:10000});
       const listWidth=await page.locator("main .question-browser").evaluate(node=>Math.round(node.getBoundingClientRect().width));
       const expectedListWidth=Math.min(1240,width-(width<=650?24:32));
       assert.ok(Math.abs(listWidth-expectedListWidth)<=2,target.name+" list width at "+width+
         ": expected "+expectedListWidth+"px, got "+listWidth+"px");
       snapshot[target.name].listWidth=listWidth;
       if([390,1440].includes(width)){
         await page.screenshot({path:"ui-screenshots/quiz-unified/"+target.name+"-"+width+"-list.png"});
       }
     }catch(e){failures.push({width,service:target.name,error:e.stack||String(e)});}
     finally{await context.close();}
   }
   if(Object.keys(snapshot).length===3){
     const baseline=snapshot.practical;
     for(const [name,value] of Object.entries(snapshot)){
       if(name==="practical")continue;
       assert.deepEqual(value.actionColors,baseline.actionColors,
         "Three quiz action colors must match across services at "+width+"px for "+name);
       for(const component of ["nav","navList","navJump","title","badge","actions","action","answer"]){
         for(const key of styleKeys){
           if(baseline[component].style[key]!==value[component].style[key]){
             failures.push({width,service:name,component,key,
               expected:baseline[component].style[key],actual:value[component].style[key]});
           }
         }
       }
       for(const component of ["navList","navJump"]){
         for(const dimension of ["width","height"]){
           if(Math.abs(value[component].rect[dimension]-baseline[component].rect[dimension])>1)
             failures.push({width,service:name,component,dimension,
               expected:baseline[component].rect[dimension],actual:value[component].rect[dimension]});
         }
       }
       if(Math.abs(value.card.rect.width-baseline.card.rect.width)>2){
         failures.push({width,service:name,component:"card width",expected:baseline.card.rect.width,actual:value.card.rect.width});
       }
     }
   }
   measurements.push({width,snapshot});
 }
}finally{await browser.close();}
writeFileSync("ui-screenshots/quiz-unified/results.json",JSON.stringify({measurements,failures},null,2));
if(failures.length){console.error(JSON.stringify(failures.slice(0,60),null,2));process.exitCode=1;}
else console.log("PASS: Shared quiz cards, navigation, action buttons, answer frames, review flow, color and layout across 360–1440px.");
