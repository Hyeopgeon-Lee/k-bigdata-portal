import assert from "node:assert/strict";
import {codingProblems as samples} from "../data/coding-samples.js";
import {cFoundationProblems} from "../data/coding-c-foundations.js";
import {cAdvancedProblems} from "../data/coding-c-advanced.js";
import {cGuidance} from "../data/coding-c-guidance.js";

const generated=[...cFoundationProblems,...cAdvancedProblems];
const c=[...samples.filter(p=>p.language==="c"),...generated];
assert.equal(c.length,100,"100 C questions preserved");
assert.equal(new Set(c.map(p=>p.id)).size,100,"C IDs unique");
assert.equal(cGuidance.size,98,"all generated C problems have bespoke guidance");
const byId=new Map(c.map(p=>[p.id,p]));
const q=id=>{const p=byId.get(id);assert.ok(p,"missing "+id);return p;};
for(const p of generated){
  const number=Number(p.id.slice(2));
  const guidance=cGuidance.get(number);
  assert.ok(guidance&&guidance.length===2,p.id+" guidance missing");
  assert.equal(p.hint,guidance[0],p.id+" hint must be authored");
  assert.equal(p.explanation,guidance[1],p.id+" explanation must be authored");
  assert.ok(p.hint.length>=18&&p.explanation.length>=18,p.id+" guidance too short");
  assert.doesNotMatch(p.hint,/입력 범위와 출력 형식을 확인한 뒤/,p.id);
  assert.doesNotMatch(p.explanation,/입력 예제와 동일한 값을 넣어 계산 과정을 추적/,p.id);
  assert.equal(p.trace.at(-1)[3],p.output,p.id+" final trace output mismatch");
  assert.equal(p.trace.some(row=>row[0]==="입력"),p.input!=="입력 없음",p.id+" incorrect input trace");
}
assert.equal(new Set(generated.map(p=>p.hint)).size,98,"duplicated hints");
assert.equal(new Set(generated.map(p=>p.explanation)).size,98,"duplicated explanations");

assert.match(q("C-005").statement,/반올림/);
assert.match(q("C-010").statement,/공백 한 칸/);
assert.match(q("C-015").statement,/소수 셋째 자리/);
assert.match(q("C-016").statement,/소수 둘째 자리/);
assert.match(q("C-025").statement,/90점 이상/);
assert.match(q("C-036").statement,/1 ≤ N ≤ 20/);
assert.match(q("C-045").statement,/72줄/);
assert.match(q("C-057").statement,/반올림/);
assert.match(q("C-061").statement,/첫째 줄/);
assert.match(q("C-062").statement,/둘째 줄/);
assert.match(q("C-063").statement,/a\[i\+1\]-a\[i\]/);
assert.equal(q("C-066").title,"문자의 ASCII 코드 출력");
assert.match(q("C-069").statement,/최대 20글자/);
for(let i=70;i<=80;i++){
 assert.match(q("C-"+String(i).padStart(3,"0")).statement,/글자/, "string lengths "+i);
}
for(let i=82;i<=90;i++) assert.match(q("C-"+String(i).padStart(3,"0")).statement,/입력받/,"function IO "+i);
assert.match(q("C-090").statement,/1이면 add/);
assert.match(q("C-089").statement,/void swap/);
assert.equal(q("C-049").level,"기초 응용");
assert.equal(q("C-050").level,"기초 응용");
assert.doesNotMatch(q("C-004").explanation,/경계 조건\(0, 음수, 100\)/);
assert.doesNotMatch(q("C-002").explanation,/입력 예제와 동일한 값을/);
assert.match(q("C-002").hint,/puts/);
assert.match(q("C-006").hint,/\\n/);
const changes=id=>q(id).trace.map(row=>row[2]).join("|");
assert.match(changes("C-008"),/sum = 1\+2\+3 = 6/);
assert.doesNotMatch(changes("C-026"),/0 개념/);
assert.doesNotMatch(changes("C-074"),/0 개념/);
const trace58=changes("C-058");
assert.ok(trace58.indexOf("min:5→-3")<trace58.indexOf("max:5→7"),"C-058 traversal order");
assert.match(changes("C-100"),/첫 번째 반복\(pass\)/);
assert.doesNotMatch(changes("C-100"),/1회 비교 교환/);
console.log("C Help regression: 100 total, 98 guided, 21 active reports covered; PASS");
