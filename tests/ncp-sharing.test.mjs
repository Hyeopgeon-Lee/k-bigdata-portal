import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ncpQuestions} from "../data/ncp-questions.js";
import {learningReportUrl} from "../js/learning-report.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const ui=read("js/ncp-quiz.js"),css=read("css/ncp-quiz.css"),html=read("ncp.html");
globalThis.location={origin:"https://portal.k-bigdata.kr"};

for(const q of ncpQuestions){
 const report=new URL(learningReportUrl("ncp",q,q.exam+" · 원문 "+q.originalNumber+"번"));
 const problem=new URL(report.searchParams.get("url"));
 assert.equal(report.origin,"https://help.k-bigdata.kr");
 assert.equal(report.pathname,"/request.html");
 assert.equal(report.searchParams.get("source"),"ncp");
 assert.equal(report.searchParams.get("id"),q.id);
 assert.equal(report.searchParams.get("label"),q.exam+" · 원문 "+q.originalNumber+"번");
 assert.equal(problem.origin,"https://portal.k-bigdata.kr");
 assert.equal(problem.pathname,"/ncp.html");
 assert.equal(problem.searchParams.get("id"),q.id);
 assert.ok(!report.searchParams.has("answer")&&!report.searchParams.has("explanation"));
 assert.ok(!report.href.includes(encodeURIComponent(q.explanation)));
}

for(const action of ["share-problem","copy-problem-link","report-problem"])
 assert.ok(ui.includes('data-action="'+action+'"'),"Missing NCP action: "+action);
assert.match(ui,/function problemShareUrl\(q\)/);
assert.match(ui,/url\.searchParams\.set\("id",q\.id\)/);
assert.match(ui,/const initialID=params\.get\("id"\)/,"Shared links must open the exact problem");
assert.match(ui,/navigator\.share/);
assert.match(ui,/navigator\.clipboard\?\.writeText/);
assert.match(ui,/document\.execCommand\("copy"\)/);
assert.match(ui,/learningReportUrl\("ncp",q/);
assert.match(ui,/id="ncp-share-status".*role="status"/);
const shareText=ui.slice(ui.indexOf("function problemShareText"),ui.indexOf("async function copyText"));
assert.ok(!/\.answer|\.explanation|\.options|state\.answers/.test(shareText),"Do not reveal model answers in shared text");
assert.match(css,/\.ncp-share-row/);
assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(html,/ncp-quiz\.js\?v=20261027-ncp-share-1/);
assert.match(html,/ncp-quiz\.css\?rev=20261027-ncp-share-1/);
console.log("PASS: NCP problem sharing and reporting link all 75 IDs without leaking answers.");
