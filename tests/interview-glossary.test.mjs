import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {questions, questionSearchText, getInterviewGlossary} from "../js/interview.js";
import {interviewGlossary, interviewGlossaryByQuestion} from "../data/interview-glossary.js";
import {renderInterviewQuestion,interviewShareText} from "../js/interview-ui.js";

assert.equal(questions.length,150,"150 reviewed oral interview questions must remain unchanged");
assert.equal(Object.keys(interviewGlossaryByQuestion).length,150,"curated mapping covers all 150 questions");
assert.equal(Object.keys(interviewGlossary).length,202,"vocabulary definitions must not silently disappear");
assert.deepEqual(new Set(Object.keys(interviewGlossaryByQuestion)),new Set(questions.map(q=>q.id)),"question IDs must match");
const used=new Set();
for(const q of questions){
 const ids=interviewGlossaryByQuestion[q.id];
 assert.ok(Array.isArray(ids)&&ids.length>=1&&ids.length<=3,q.id+" requires 1-3 relevant terms");
 assert.equal(new Set(ids).size,ids.length,q.id+" duplicate glossary term");
 const terms=getInterviewGlossary(q);
 assert.deepEqual(terms.map(x=>x.id),ids,q.id+" term order must be explicitly curated");
 for(const term of terms){
   assert.ok(term.title.length>=2&&term.definition.length>=25&&term.meaning.length>=20,q.id+" incomplete term: "+term.id);
   assert.ok(!/[<>]/.test(term.title+term.definition+term.meaning),q.id+" unsafe text / possible HTML");
   used.add(term.id);
 }
 assert.ok(questionSearchText(q).includes(terms[0].title),q.id+" glossary search");
 const html=renderInterviewQuestion(q,true);
 assert.ok(html.includes('<details class="interview-more">'),q.id+" must be expandable");
 assert.ok(html.includes("더 알아보기 · 핵심 기술 용어"),q.id);
 assert.ok(html.includes("알아둘 점"),q.id);
 assert.ok(html.includes(terms[0].title),q.id);
 assert.ok(!/<details[^>]*\bopen\b/.test(html),q.id+" answer and glossary must be closed by default");
 assert.ok(!interviewShareText(q).includes(terms[0].definition),q.id+" shared question should not include answers");
}
assert.equal(used.size,Object.keys(interviewGlossary).length,"unused vocabulary should be removed");
const titles=Object.values(interviewGlossary).map(t=>t.title);
assert.equal(new Set(titles).size,titles.length,"term titles must be unique");
for(const id of ["q23","NET-013","K8S-001","DEV-001"]){
 assert.ok(getInterviewGlossary(id).some(t=>t.id==="cloudnative"),id+" should teach cloud native");
}
assert.ok(getInterviewGlossary("q23").some(t=>t.id==="msa"));
assert.ok(getInterviewGlossary("q23").some(t=>t.id==="monolith"));
assert.ok(getInterviewGlossary("DB-017").some(t=>t.id==="mcp"));
assert.ok(getInterviewGlossary("DB-018").some(t=>t.id==="multiagent"));
assert.ok(getInterviewGlossary("DS-009").some(t=>t.id==="agent"));
assert.ok(getInterviewGlossary("NET-004").some(t=>t.id==="tcpclose"));
assert.ok(!getInterviewGlossary("NET-004").some(t=>t.id==="handshake"));
assert.ok(interviewGlossary.cloudnative.meaning.includes("필수 조건은 아닙니다"));
assert.ok(interviewGlossary.msa.meaning.includes("데이터 일관성"));
assert.ok(interviewGlossary.mcp.definition.includes("도구·리소스·프롬프트"));
const html=readFileSync(new URL("../interview.html",import.meta.url),"utf8");
const css=readFileSync(new URL("../css/interview.css",import.meta.url),"utf8");
const lazy=readFileSync(new URL("../js/learning-ui.js",import.meta.url),"utf8");
const ui=readFileSync(new URL("../js/interview-ui.js",import.meta.url),"utf8");
assert.ok(html.includes("css/interview.css?v=20261009-glossary-1"));
assert.ok(html.includes("js/learning-ui.js?v=20261009-glossary-1"));
assert.ok(lazy.includes("interview-ui.js?v=20261009-glossary-1"));
assert.ok(ui.includes("interview.js?v=20261009-glossary-1"));
assert.ok(css.includes("interview-more>summary")&&css.includes("min-height:52px"));
assert.ok(css.includes("@media(max-width:480px)"));
assert.ok(css.includes("word-break:keep-all")&&css.includes("overflow-wrap:anywhere"));
console.log("PASS: 150/150 question-specific term mappings, 202 glossary entries used, accessible collapsed sections, search, MSA/cloud-native/MCP, share privacy, responsive CSS, cache versions.");
