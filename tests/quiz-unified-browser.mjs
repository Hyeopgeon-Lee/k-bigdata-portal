import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {chromium} from "playwright";
import {approvedStudent} from "./fixtures/approved-student.mjs";

const base="http://127.0.0.1:8765/";
const widths=[360,390,430,768,1024,1440];
const cases=[
  {name:"practical",url:"practical.html?id=R-SQL-0015",ready:"#my-answer"},
  {name:"ncp",url:"ncp.html?id=NCP-R001",ready:"#ncp-answer-entry"},
  {name:"coding",url:"coding.html?id=C-001",ready:"#coding-editor"}
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
       assert.equal(await page.locator(".quiz-answer").count(),1,target.name+" shared answer frame");
       assert.equal(await page.locator(".quiz-actions details").count(),0,target.name+" actions may not be collapsed");
       assert.equal(await page.locator(".quiz-nav-button").count(),2,target.name+" list/answer navigation");
       assert.equal(await page.locator(".quiz-title").isVisible(),true,target.name+" title visible");
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
           nav:get(".quiz-navigation"),title:get(".quiz-title"),
           heading:get(".quiz-heading"),badge:get(".quiz-badge"),
           actions:get(".quiz-actions"),action:get(".quiz-action"),answer:get(".quiz-answer")};
       },styleKeys);
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
       if([390,1440].includes(width)){
         await page.locator(".quiz-results").first().screenshot({path:"ui-screenshots/quiz-unified/"+target.name+"-"+width+"-answer.png"});
       }
     }catch(e){failures.push({width,service:target.name,error:e.stack||String(e)});}
     finally{await context.close();}
   }
   if(Object.keys(snapshot).length===3){
     const baseline=snapshot.practical;
     for(const [name,value] of Object.entries(snapshot)){
       if(name==="practical")continue;
       for(const component of ["nav","title","badge","actions","action","answer"]){
         for(const key of styleKeys){
           if(baseline[component].style[key]!==value[component].style[key]){
             failures.push({width,service:name,component,key,
               expected:baseline[component].style[key],actual:value[component].style[key]});
           }
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
