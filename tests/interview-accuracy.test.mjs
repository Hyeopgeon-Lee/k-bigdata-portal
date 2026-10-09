import assert from "node:assert/strict";
import {questions} from "../js/interview.js";

const get=id=>{const q=questions.find(x=>x.id===id);assert.ok(q,id);return q;};
const includes=(id,needle,field="shortAnswer")=>assert.ok(get(id)[field].includes(needle),id+" missing "+needle);
const pairs=[
 ["DS-005","스크럼"],["DS-006","프로파일"],["DS-007","@ConfigurationProperties"],["DS-009","도구"],["DS-014","권한"],
 ["q3","equals()"],["DB-011","AOP"],["DB-016","RestClient"],["DB-017","MCP"],["DB-018","멀티에이전트"],
 ["SPR-001","자동 설정"],["q6","롤백"],["K8S-003","NodePort"],["q17","Scale Out"],["q28","재현율"],["AI-010","RAG"]
];
for(const [id,term] of pairs)includes(id,term);
for(const id of ["DS-005","DS-006","DS-007","DS-009","DB-017","DB-018"]){
 const q=get(id);
 assert.ok(q.question && q.shortAnswer && q.group);
 assert.ok(!q.question.includes("#NAME?")&&!q.shortAnswer.includes("#NAME?"));
}
assert.ok(get("DB-017").sourceIds.includes("mcp"));
assert.ok(get("DS-005").sourceIds.includes("scrum"));
assert.ok(get("DB-016").question.includes("Spring Boot 4.x"));
assert.ok(get("DB-017").question.includes("MCP"));
assert.ok(get("DB-018").question.includes("멀티에이전트"));
assert.ok(get("q3").shortAnswer.includes("=="));
assert.ok(get("AI-010").shortAnswer.includes("검색"));
for(const q of questions){assert.ok(q.shortAnswer.length<400);assert.ok(!/[\u0000-\u0008]/.test(q.shortAnswer));}
console.log("PASS: 16 topic-specific spot checks / AI Agent & MCP / Java / Spring / Kubernetes / RAG / 150 oral-answer bounds");
