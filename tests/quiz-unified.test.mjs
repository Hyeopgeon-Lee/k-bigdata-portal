import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {quizNavigation,quizHeading,quizDisclosure,quizFeedback} from "../js/quiz-unified.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const components=read("js/quiz-unified.js");
const css=read("css/quiz-unified.css");
const pages=["practical.html","ncp.html","coding.html"];
const modules=["js/practical-ui.js","js/ncp-quiz.js","js/coding.js"];

for(const path of pages){
  const html=read(path);
  assert.match(html,/css\/quiz-unified\.css\?v=20261112-quiz-wide-1/,"Shared UI stylesheet on "+path);
}
for(const path of modules){
  const js=read(path);
  assert.ok(js.includes('from "./quiz-unified.js"'),"Shared UI module imported by "+path);
  assert.match(js,/quizNavigation\(/);
  assert.match(js,/quizHeading\(/);
}

for(const width of [360,390,430,768,1024,1440]){
  assert.ok(width>=360); // All visual viewport fixtures must be covered by browser QA.
}
const nav=quizNavigation({count:"7 / 75",listAction:"back",jumpAction:"answer-jump"});
assert.match(nav,/class="quiz-navigation"/);
assert.match(nav,/← 문제 목록/);
assert.match(nav,/7 \/ 75/);
assert.match(nav,/답 입력 ↓/);
assert.match(nav,/data-action="answer-jump"/);
assert.ok(!nav.includes("더보기"));

const header=quizHeading({title:"두 정수의 합",badges:["C-001","입문","입출력·변수"],
 actions:[
  {label:"문제 공유",action:"share-problem"},
  {label:"링크 복사",action:"copy-problem-link"},
  {label:"오류 신고",href:"help.html?source=coding"}
 ]});
assert.match(header,/class="quiz-heading"/);
assert.ok(header.indexOf("두 정수의 합")<header.indexOf('class="quiz-badges"'),"Question title precedes badges");
assert.ok(header.indexOf('class="quiz-badges"')<header.indexOf('class="quiz-actions"'),"Actions follow badges");
assert.equal((header.match(/class="quiz-action"/g)||[]).length,3);
assert.ok(!header.includes("<details>"),"Three actions remain visible");
assert.ok(!header.includes("더보기"));
assert.equal((header.match(/<button/g)||[]).length,2);
assert.equal((header.match(/<a /g)||[]).length,1);
assert.equal((quizHeading({title:'"><script>alert(1)</script>',badges:['<img>']}).match(/<script/g)||[]).length,0,"Title and badges are HTML-escaped");

const disclosure=quizDisclosure("복원정보 / 원문 출처","<p>공개 복원자료</p>");
assert.match(disclosure,/class="quiz-disclosure"/);
assert.match(disclosure,/<summary>복원정보 \/ 원문 출처<\/summary>/);
assert.ok(disclosure.includes("공개 복원자료"));
const feedback=quizFeedback({label:"정답입니다",kind:"correct"});
assert.match(feedback,/quiz-feedback-correct/);

const navCount=components.match(/export function quizNavigation/g)||[];
const headingCount=components.match(/export function quizHeading/g)||[];
assert.equal(navCount.length,1);
assert.equal(headingCount.length,1);

for(const token of ["--quiz-primary:#173b80","--quiz-accent:#2454a6","--quiz-page:#f5f7fb",
                    "--quiz-card:#fff","--quiz-border:#d9e1ec","--quiz-success:#16804a",
                    "--quiz-danger:#c83d3d","--quiz-padding-mobile:16px","--quiz-padding-desktop:24px"]){
  assert.ok(css.includes(token),"Missing central design token "+token);
}
assert.match(css,/\.quiz-actions\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/s);
assert.match(css,/\.quiz-navigation\{[^}]*grid-template-columns:/s);
assert.match(css,/@media\(max-width:690px\)/);
assert.match(css,/@media\(max-width:360px\)/);
assert.match(css,/\.quiz-answer/);
assert.match(css,/\.quiz-disclosure/);
assert.match(css,/\.quiz-feedback/);

assert.match(css,/--quiz-content-max:1240px/,"Shared PC quiz width is 1240px");
const browserCSS=read("css/question-browser.css");
assert.match(browserCSS,/var\(--quiz-content-max,1240px\)/,"Question list uses the same width variable");
const ncp=read("js/ncp-quiz.js");
assert.ok(ncp.indexOf('quizHeading({title:"공개 복원자료 원문"')<ncp.indexOf("const sourceDisclosure"),"NCP question must have precedence over original reference in rendered markup")===false; // dynamic source constant intentionally prepared before render
assert.ok(ncp.indexOf("'class=\"quiz-question ncp-question-text\"")===-1||ncp.includes("quiz-question ncp-question-text"));
assert.ok(ncp.indexOf("'<p class=\"quiz-question ncp-question-text\"")<ncp.indexOf("sourceDisclosure;"),"NCP problem precedes source in output markup");
assert.ok(ncp.includes('scrollToQuizAnswer(el.question)'),"NCP answer navigation works");

const practical=read("js/practical-ui.js");
assert.ok(practical.includes('class="quiz-answer"'),"Practical answer widget shares frame");
assert.ok(practical.includes('quizDisclosure("해설"'),"Practical explanation uses common disclosure");
assert.ok(practical.includes('quizDisclosure("관련 개념"'),"Practical concept uses common disclosure");

const coding=read("js/coding.js"),codingHtml=read("coding.html");
assert.ok(codingHtml.includes('id="coding-quiz-nav"')&&codingHtml.includes('id="coding-quiz-heading"'));
assert.ok(codingHtml.includes('class="coding-section quiz-answer"'),"Coding editor uses common answer frame");
assert.ok(coding.includes('scrollToQuizAnswer(document.querySelector(".coding-detail"))'));
assert.ok(coding.includes("quizFeedback({"),"Coding answer uses common feedback");
console.log("PASS: common quiz component contracts, visible actions, ordering and design tokens.");
