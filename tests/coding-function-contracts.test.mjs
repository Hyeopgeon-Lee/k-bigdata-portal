import assert from "node:assert/strict";
import {codingProblems as samples} from "../data/coding-samples.js";
import {javaProblems} from "../data/coding-java-98.js";
import {cFoundationProblems} from "../data/coding-c-foundations.js";
import {cAdvancedProblems} from "../data/coding-c-advanced.js";
import {pythonFoundationProblems} from "../data/coding-python-foundations.js";
import {pythonAdvancedProblems} from "../data/coding-python-advanced.js";
import {ubuntuFoundationProblems} from "../data/coding-ubuntu-foundations.js";
import {ubuntuAdvancedProblems} from "../data/coding-ubuntu-advanced.js";

const all = [...samples,...javaProblems,...cFoundationProblems,...cAdvancedProblems,
  ...pythonFoundationProblems,...pythonAdvancedProblems,...ubuntuFoundationProblems,...ubuntuAdvancedProblems];
const byId = new Map(all.map(p => [p.id,p]));
assert.equal(all.length,350,"Every coding problem is still available");
assert.equal(byId.size,350,"No duplicate problem ID");

const functionContracts = {
  "C-067": [
    "toupper",
    "소문자",
    "대문자"
  ],
  "C-070": [
    "strlen",
    "글자 수",
    "사용하지"
  ],
  "C-071": [
    "strlen",
    "종료 문자",
    "글자 수"
  ],
  "C-072": [
    "tolower",
    "대문자",
    "소문자"
  ],
  "C-074": [
    "strcmp",
    "같으면 0",
    "다르면"
  ],
  "C-075": [
    "strcmp",
    "음수",
    "양수",
    "0"
  ],
  "C-076": [
    "strchr",
    "주소",
    "NULL"
  ],
  "C-077": [
    "fgets",
    "공백",
    "배열"
  ],
  "C-078": [
    "strlen",
    "글자 수"
  ],
  "C-079": [
    "strlen",
    "글자 수"
  ],
  "C-080": [
    "snprintf",
    "배열",
    "printf"
  ],
  "C-085": [
    "factorial",
    "곱한 값",
    "0!"
  ],
  "C-090": [
    "add(int a, int b)",
    "합",
    "sub(int a, int b)",
    "차",
    "mul(int a, int b)",
    "곱",
    "1이면",
    "2이면",
    "3이면"
  ],
  "C-094": [
    "divide",
    "*q",
    "*r",
    "반환하지"
  ],
  "JAVA-076": [
    "substring",
    "start",
    "end",
    "반환"
  ],
  "JAVA-085": [
    "factorial",
    "곱한 값",
    "0!"
  ],
  "JAVA-087": [
    "sumArray",
    "합산",
    "반환"
  ],
  "JAVA-088": [
    "maxArray",
    "가장 큰",
    "반환"
  ],
  "JAVA-090": [
    "increase",
    "1을 더한",
    "복사",
    "대입"
  ],
  "JAVA-093": [
    "addScore",
    "point",
    "변경",
    "반환값"
  ],
  "JAVA-094": [
    "getScore",
    "private",
    "반환"
  ],
  "PY-023": [
    "max()",
    "가장 큰",
    "사용하지"
  ],
  "PY-056": [
    "sum()",
    "합",
    "사용하지"
  ],
  "PY-058": [
    "max(values)",
    "min(values)",
    "가장 큰",
    "가장 작은"
  ],
  "PY-073": [
    "append(value)",
    "리스트 끝",
    "추가"
  ],
  "PY-095": [
    "factorial(n)",
    "곱한 값",
    "0!"
  ],
  "PY-099": [
    "add(a, b)",
    "합",
    "sub(a, b)",
    "차",
    "mul(a, b)",
    "곱",
    "1이면",
    "2이면",
    "3이면"
  ]
};
const reviewedIds = Object.keys(functionContracts);
assert.equal(reviewedIds.length,27,"The 27 affected questions are all covered");
for (const [id,keywords] of Object.entries(functionContracts)) {
  const problem = byId.get(id);
  assert.ok(problem, id+" exists");
  assert.ok(problem.statement?.trim(), id+" has a nonempty question statement");
  for (const keyword of keywords) {
    assert.ok(problem.statement.includes(keyword),
      id+" must explain the role of "+keyword+" in the question (not only the solution)");
  }
  assert.ok(problem.code?.trim(), id+" retains executable example code");
  assert.ok(problem.output !== undefined, id+" retains expected output");
}
for (const id of ["C-090","PY-099"]) {
  const p = byId.get(id);
  assert.match(p.statement, /add.+합[\s\S]*sub.+차[\s\S]*mul.+곱/,
    id+" documents add/sub/mul, in the problem body");
  assert.ok(p.statement.includes("\n- add"), id+" shows function contracts on separate lines");
  assert.equal(p.input,"4 2 3");
  assert.equal(p.output,"8");
}
assert.equal(byId.get("JAVA-090").output,"7\n8");
assert.equal(byId.get("C-094").output,"3 2");
assert.equal(byId.get("PY-073").output,"1 2 3 4 5");
console.log("PASS: 27 function contract problem statements, 350 unique problems, outputs preserved");
