import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {codingProblems as samples} from "../data/coding-samples.js";
import {javaProblems} from "../data/coding-java-98.js";
import {cFoundationProblems} from "../data/coding-c-foundations.js";
import {cAdvancedProblems} from "../data/coding-c-advanced.js";
import {pythonFoundationProblems} from "../data/coding-python-foundations.js";
import {pythonAdvancedProblems} from "../data/coding-python-advanced.js";
import {ubuntuFoundationProblems} from "../data/coding-ubuntu-foundations.js";
import {ubuntuAdvancedProblems} from "../data/coding-ubuntu-advanced.js";

const all = [...samples, ...javaProblems, ...cFoundationProblems, ...cAdvancedProblems,
  ...pythonFoundationProblems, ...pythonAdvancedProblems, ...ubuntuFoundationProblems, ...ubuntuAdvancedProblems];
const map = new Map(all.map(problem => [problem.id, problem]));
const q = id => {
  const problem = map.get(id);
  assert.ok(problem, "missing exercise " + id);
  return problem;
};
assert.equal(all.length, 350);
assert.equal(map.size, 350);

assert.match(q("C-002").code, /printf\("Hello World\\n"\)/);
assert.match(q("C-002").explanation, /printf/);
assert.doesNotMatch(q("C-004").code, /scanf\([^;]+!=\s*1/);
assert.match(q("C-012").code, /int a = 0;/);
assert.match(q("C-012").code, /int b = 0;/);
assert.match(q("C-012").code, /int sum = a \+ b;/);
assert.match(q("C-012").code, /int diff = a - b;/);
assert.match(q("C-012").code, /int product = a \* b;/);
assert.doesNotMatch(q("C-019").code, /long long/);
assert.match(q("C-019").statement, /정수 N.*N\+1과 N-1/);
assert.match(q("C-047").code, /\n        for \(int c/);
assert.match(q("C-047").code, /\n            printf\("\*"\);/);
assert.match(q("C-066").code, /\(int\)ch/);
assert.doesNotMatch(q("C-066").code, /\(unsigned int\)/);
assert.match(q("C-072").code, /for \(int i/);
assert.doesNotMatch(q("C-072").code, /for\s*\(size_t/);

assert.doesNotMatch(q("JAVA-008").code, /Locale\.US/);
assert.match(q("JAVA-008").code, /System\.out\.printf\("%.2f%n"/);
assert.doesNotMatch(q("JAVA-055").code, /StringBuilder/);
assert.match(q("JAVA-055").code, /System\.out\.print\(a\)/);
assert.match(q("PY-001").code, /int\(input\(\)\)/);
assert.doesNotMatch(q("PY-012").code, /map\(/);
assert.match(q("PY-012").code, /parts = input\(\)\.split\(\)/);
assert.equal(q("LINUX-015").code, "mv draft.txt final.txt");
assert.equal(q("LINUX-038").code, "df -h .");
assert.match(q("LINUX-038").title, /파일 시스템/);
assert.equal(q("LINUX-046").code, "dpkg -s python3");

const html = readFileSync(new URL("../coding.html", import.meta.url), "utf8");
const script = readFileSync(new URL("../js/coding.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../css/coding.css", import.meta.url), "utf8");
assert.match(html, /id="coding-copy-tip"/);
assert.match(script, /VS Code, PyCharm 또는 터미널/);
assert.match(script, /vim에 붙여 넣어/);
assert.match(script, /document\.createElement\("a"\)/);
assert.match(script, /link\.href=currentProblemLink\(q\)/);
assert.match(css, /\.coding-question-list a/);
assert.match(html, /<a id="coding-report-button"/);
console.log("PASS: Nov 10, 2026 Help reports — 15 exercises and accessible learning links.");