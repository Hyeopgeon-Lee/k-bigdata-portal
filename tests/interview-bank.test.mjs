import assert from "node:assert/strict";
import {questions,interviewGroups,interviewJobTags,matchesInterviewCategory,selectRandomQuestions,questionSearchText,interviewSources} from "../js/interview.js";
import {renderInterviewQuestion,filterInterviewQuestions,interviewShareText} from "../js/interview-ui.js";
import {readFileSync} from "node:fs";

const expected={"자료구조·Java 컬렉션":9,"소프트웨어공학·협업":4,"Spring Boot·Backend":22,"AI·데이터 기초":16,"Java·객체지향":18,"데이터베이스·SQL":12,"네트워크·Web·HTTP":18,"운영체제·Linux":15,"Git·GitHub":7,"Docker·Kubernetes":19,"DevOps·Cloud Native·MSA":10};
assert.equal(questions.length,150);
assert.equal(interviewGroups.length,11);
assert.deepEqual(Object.fromEntries(interviewGroups.map(g=>[g,questions.filter(q=>q.group===g).length])),expected);
assert.equal(new Set(questions.map(q=>q.id)).size,150);
assert.equal(new Set(questions.map(q=>q.code)).size,150);
assert.equal(new Set(questions.map(q=>q.question.normalize("NFKC").replace(/\s+/g,"").toLowerCase())).size,150);
for(let i=1;i<=28;i++)assert.ok(questions.some(q=>q.id==="q"+i),"legacy link q"+i);
for(const q of questions){
 assert.ok(q.id && q.code && q.group && q.question && q.shortAnswer,q.id);
 assert.ok(["기초","기본","심화"].includes(q.difficulty),q.id);
 assert.ok(q.shortAnswer.length>=20 && q.shortAnswer.length<=400,q.id);
 assert.ok(q.answerSeconds>0 && q.answerSeconds<=60,q.id);
 assert.equal(q.answer,q.shortAnswer,q.id);
 assert.equal(q.detailedAnswer,"",q.id);
 assert.equal(q.extra,"",q.id);
 assert.equal(q.learningExample,null,q.id);
 assert.equal(q.workedCode,null,q.id);
 assert.equal(q.followUps.length,0,q.id);
 assert.equal(q.keywords.length,0,q.id);
 assert.ok(q.jobTags.length && q.jobTags.every(v=>interviewJobTags.includes(v)),q.id);
 assert.ok(q.sourceIds.every(id=>interviewSources[id]?.type==="official"),q.id);
 assert.ok(questionSearchText(q).includes(q.question),q.id);
 assert.ok(matchesInterviewCategory(q,q.group),q.id);
 const html=renderInterviewQuestion(q,true);
 assert.ok(html.includes("모범답안")&&html.includes("답변 확인"),q.id);
 assert.ok(html.includes("문제 공유")&&html.includes("링크 복사"),q.id);
 assert.ok(!html.includes("적용 예시")&&!html.includes("상세 설명"),q.id);
 assert.ok(!html.includes("undefined")&&!html.includes("null"),q.id);
 assert.ok(!/<details[^>]*\bopen\b/.test(html),q.id);
 assert.ok(interviewShareText(q).includes(q.question),q.id);
}
for(let i=0;i<300;i++){const pick=selectRandomQuestions(questions,10);assert.equal(pick.length,10);assert.equal(new Set(pick.map(x=>x.id)).size,10);}
for(const group of interviewGroups)assert.ok(filterInterviewQuestions(questions,{category:group}).length);
for(const term of ["JWT","쿠버네티스","K8s","트랜잭션","AI 에이전트","MCP"])assert.ok(filterInterviewQuestions(questions,{query:term}).length,term);
const html=readFileSync(new URL("../interview.html",import.meta.url),"utf8");
assert.ok(html.includes('content="noindex, nofollow"'));
assert.ok(html.includes('js/learning-ui.js?v=20261009-interview-ux-2'));
console.log("PASS: 150 records / 11 areas / legacy IDs and codes / 300 unique random sessions / filters / spoken answers / no stale explanations");
