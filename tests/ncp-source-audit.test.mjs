import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ncpQuestions} from "../data/ncp-questions.js";
import {ncpResources} from "../data/ncp-resources.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const sourceLinks=[
 "https://notion2979.tistory.com/5",
 "https://notion2979.tistory.com/6",
 "https://notion2979.tistory.com/7",
 "https://notion2979.tistory.com/8",
 "https://notion2979.tistory.com/9",
 "https://notion2979.tistory.com/10"
];
const examCounts={ "NCP-200":19,"NCP-202":20,"NCP-207":36 };
assert.equal(ncpQuestions.length,75,"Only sourced reconstruction questions may be published.");
assert.equal(ncpResources.length,39,"Public source directory must match the visible count.");
assert.equal(new Set(ncpQuestions.map(item=>item.id)).size,ncpQuestions.length,"No duplicate problem IDs.");
assert.equal(new Set(ncpQuestions.map(item=>item.exam+"/"+item.originalNumber)).size,ncpQuestions.length,"Each reconstructed original number must be unique.");
for(const [exam,count] of Object.entries(examCounts))
 assert.equal(ncpQuestions.filter(item=>item.exam===exam).length,count,"Exam count "+exam);

function expectedSource(q){
 if(q.exam==="NCP-200")return q.originalNumber<=30?sourceLinks[0]:sourceLinks[1];
 if(q.exam==="NCP-202")return q.originalNumber<=50?sourceLinks[2]:sourceLinks[3];
 if(q.exam==="NCP-207")return q.originalNumber<=45?sourceLinks[4]:sourceLinks[5];
 throw new Error("Unknown examination "+q.exam);
}
for(const q of ncpQuestions){
 assert.ok(/^NCP-R[0-9]{3}$/.test(q.id),"All published questions must have reconstruction IDs.");
 assert.ok(Number.isInteger(q.originalNumber)&&q.originalNumber>0,"Every question has original source number.");
 assert.equal(q.sourceUrl,expectedSource(q),"Original problem number must map to the correct public source: "+q.id);
 assert.equal(q.type,"2025년 공개 복원문제 기반 재서술","Questions must not claim to be official released exam originals.");
 assert.ok(Array.isArray(q.options)&&q.options.length===4&&q.options.every(Boolean),"Four alternatives per question");
 assert.ok(["A","B","C","D"].includes(q.answer),"Answer key is a valid letter.");
 assert.ok(q.question&&q.explanation&&q.answerStatus,"Question and provenance are present.");
 assert.ok(ncpResources.some(r=>r.url===q.sourceUrl),"Source appears in the directory: "+q.id);
}
const html=read("ncp.html"),quiz=read("js/ncp-quiz.js"),services=read("js/services.js");
for(const url of sourceLinks)assert.ok(html.includes(url),"Source post linked directly from portal.");
assert.ok(html.includes("75문항")&&html.includes("공개 복원문제 원문 바로가기"),"Public labeling is truthful.");
assert.ok(html.includes("39개 보기"),"Source count label is current.");
assert.ok(quiz.includes("item.originalNumber")&&quiz.includes("item.sourceUrl"),"Each answer must cite its original problem.");
assert.ok(!html.includes("학습용 자체 제작 문제 90개"),"Unattributed old questions must not be published.");
assert.ok(services.includes("복원기출 75문항"),"Home service card uses reconstruction terminology.");
console.log("PASS: 75 source-numbered NCP reconstructed items, 39 resource links and accurate portal labeling.");
