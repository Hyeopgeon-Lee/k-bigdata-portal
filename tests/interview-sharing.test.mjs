import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {questions} from "../js/interview.js";
import {renderInterviewQuestion,interviewShareText} from "../js/interview-ui.js";
import {learningReportUrl} from "../js/learning-report.js";
globalThis.location={origin:"https://portal.k-bigdata.kr"};
const root=new URL("../",import.meta.url);
const ui=readFileSync(new URL("js/interview-ui.js",root),"utf8"),css=readFileSync(new URL("css/interview.css",root),"utf8"),html=readFileSync(new URL("interview.html",root),"utf8");
for(const q of questions){
 const card=interviewShareText(q);
 assert.ok(card.includes(q.question)&&card.includes(q.group)&&card.includes(q.difficulty),q.id);
 assert.ok(!card.includes(q.shortAnswer),q.id);
 const practice=renderInterviewQuestion(q,true),browse=renderInterviewQuestion(q,false);
 assert.ok(practice.includes("문제 공유")&&practice.includes("링크 복사"),q.id);
 assert.ok(!browse.includes('interview-share-row'),q.id);
 const report=new URL(learningReportUrl("interview",q,q.group));
 assert.equal(report.origin,"https://help.k-bigdata.kr");
 assert.equal(report.pathname,"/request.html");
 assert.equal(report.searchParams.get("source"),"interview");
 assert.equal(report.searchParams.get("id"),q.id);
 assert.equal(report.searchParams.get("code"),q.code);
 assert.equal(new URL(report.searchParams.get("url")).searchParams.get("id"),q.id);
 assert.ok(!report.href.includes(encodeURIComponent(q.shortAnswer)),q.id);

}
assert.match(ui,/function shareInterviewQuestion\(q\)/);
assert.match(ui,/function copyInterviewQuestionLink\(q\)/);
assert.ok(ui.includes('action("report-problem","오류 신고"'));
assert.ok(ui.includes('learningReportUrl("interview"'));
assert.match(ui,/navigator\.share/);
assert.match(ui,/navigator\.clipboard\?\.writeText/);
assert.match(ui,/url\.searchParams\.set\("id",q\.id\)/);
assert.ok(css.includes(".interview-share-row"));
assert.ok(html.includes("js/learning-ui.js?v="));
const sample=new URL(learningReportUrl("practical",{id:"R-IND-JAVA-0006",question:"배열 출력"},"산업기사"));
assert.equal(sample.searchParams.get("source"),"practical");
assert.equal(new URL(sample.searchParams.get("url")).pathname,"/practical.html");
assert.equal(learningReportUrl("unknown",{id:"DS-001"}),"");
console.log("PASS: 150 interview and practical report links preserve IDs without exposing model answers.");
