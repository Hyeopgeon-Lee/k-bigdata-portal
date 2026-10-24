import assert from "node:assert/strict";
import {codingProblems as seeds} from "../data/coding-samples.js";
import {javaProblems} from "../data/coding-java-98.js";
import {cFoundationProblems} from "../data/coding-c-foundations.js";
import {cAdvancedProblems} from "../data/coding-c-advanced.js";
import {pythonFoundationProblems} from "../data/coding-python-foundations.js";
import {pythonAdvancedProblems} from "../data/coding-python-advanced.js";
import {ubuntuFoundationProblems} from "../data/coding-ubuntu-foundations.js";
import {ubuntuAdvancedProblems} from "../data/coding-ubuntu-advanced.js";

const all=[...seeds,...javaProblems,...cFoundationProblems,...cAdvancedProblems,
  ...pythonFoundationProblems,...pythonAdvancedProblems,...ubuntuFoundationProblems,...ubuntuAdvancedProblems];
assert.equal(all.length,350,"all 350 problems preserved");
const byId=new Map(all.map(p=>[p.id,p]));
assert.equal(byId.size,350,"IDs remain unique");
const q=id=>{assert.ok(byId.has(id),"missing "+id);return byId.get(id);};

// October 22 C-language requests: input/output language and reliable value tracing.
const c=all.filter(p=>p.language==="c");
assert.equal(c.length,100);
for(const p of c){
  for(const row of p.trace||[]){
    assert.equal(row.length,4,p.id+" trace width");
    assert.notEqual(row[3],"단계 확인",p.id+" placeholder result");
    assert.notEqual(row[1],row[2],p.id+" duplicated target and state");
  }
  assert.equal(p.trace.at(-1)?.[3],p.output,p.id+" expected output");
}
for(const id of ["C-004","C-007","C-008","C-009","C-011","C-012","C-013",
  "C-014","C-017","C-018","C-019","C-020","C-021","C-022","C-023",
  "C-028","C-029","C-031","C-032","C-033","C-034","C-035","C-051",
  "C-059","C-064","C-065","C-067","C-068","C-081","C-091","C-092",
  "C-093","C-094","C-096","C-097","C-098","C-099"]){
  assert.match(q(id).statement,/입력받|입력으로/,id+" explains the input");
  assert.match(q(id).statement,/출력하시오/,id+" explains the output");
}
assert.match(q("C-004").statement,/int/);
assert.match(q("C-008").statement,/공백으로 구분/);
assert.match(q("C-013").statement,/나머지/);
assert.match(q("C-032").statement,/공백과 줄바꿈이 아닌/);
assert.match(q("C-035").statement,/10000 ≤ N < 50000/);
assert.match(q("C-068").statement,/공백과 줄바꿈이 아닌/);
assert.match(q("C-094").statement,/int \*q, int \*r/);
assert.match(q("C-099").statement,/반올림/);
assert.ok(q("C-008").trace.some(row=>row[3].includes("sum=6")),"C-008 computed sum trace");
assert.ok(q("C-004").trace.some(row=>row[3].includes("n=-12")),"C-004 tracked example value");

// Python requests: remove maintainer-side test comments from beginner tasks.
for(const id of ["PY-005","PY-015","PY-016","PY-027"]){
  assert.doesNotMatch(q(id).statement,/채점 입력|테스트에는|테스트는|교육용 기준으로만/,id);
}
for(const id of ["PY-005","PY-015","PY-016"])assert.match(q(id).statement,/반올림/,id);
for(const id of ["PY-041","JAVA-041"])assert.equal(q(id).level,"입문",id);
assert.match(q("JAVA-030").statement,/같으면 NO/);
assert.match(q("JAVA-006").explanation,/nextInt\(\)/);
assert.doesNotMatch(q("JAVA-006").explanation,/아래 실행 추적표/);
for(const p of javaProblems){
 assert.doesNotMatch(p.explanation,/예제 입력에 따른 변수 변화는 아래 실행 추적표/,p.id);
}

// Ubuntu requests: the command, expected effect, and task-specific guidance agree.
assert.match(q("LINUX-010").statement,/현재 디렉터리 자신/);
assert.equal(q("LINUX-010").code,"find . -maxdepth 1 -type d");
assert.doesNotMatch(q("LINUX-046").output,/아키텍처/);
for(const id of ["LINUX-031","LINUX-050"]){
 assert.match(q(id).statement,/LC_ALL=C/);
 assert.match(q(id).hint,/환경 변수/);
}
for(const p of ubuntuFoundationProblems){
 assert.doesNotMatch(p.hint,/명령어의 목적을 생각하고/,p.id);
}
assert.equal(new Set(ubuntuFoundationProblems.map(p=>p.hint)).size,ubuntuFoundationProblems.length,
 "foundation Ubuntu hints are task-specific");
console.log("PASS: Oct 22 coding reports — 350 intact, C traces and statements, Python, Java, Ubuntu");
