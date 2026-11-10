import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync, writeFileSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {codingProblems as samples} from "../data/coding-samples.js";
import {cFoundationProblems} from "../data/coding-c-foundations.js";
import {cAdvancedProblems} from "../data/coding-c-advanced.js";
import {cGuidance} from "../data/coding-c-guidance.js";

const problems = [...samples.filter(p => p.language === "c"), ...cFoundationProblems, ...cAdvancedProblems];
const byId = new Map(problems.map(p => [p.id, p]));
const q = id => {
  const entry = byId.get(id);
  assert.ok(entry, "missing " + id);
  return entry;
};
assert.equal(problems.length, 100, "C coding exercises remain at 100");
assert.equal(byId.size, 100, "C coding IDs must be unique");
assert.equal(cGuidance.size, 98, "authored guidance must cover 98 generated exercises");

function topLevelComma(s) {
  let literal = "", escaped = false, round = 0, square = 0, curly = 0;
  for (const char of s) {
    if (literal) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === literal) literal = "";
      continue;
    }
    if (char === '"' || char === "'") { literal = char; continue; }
    if (char === "(") round++;
    if (char === ")") round--;
    if (char === "[") square++;
    if (char === "]") square--;
    if (char === "{") curly++;
    if (char === "}") curly--;
    if (char === "," && round === 0 && square === 0 && curly === 0) return true;
  }
  return false;
}
function sourceWithoutLearningComments(code) {
  return code.split("\n").map(line => line.replace(/\s+\/\/.*$/, "")).join("\n");
}
let inspectedLines = 0;
for (const entry of problems) {
  const code = sourceWithoutLearningComments(entry.code);
  assert.doesNotMatch(code, /\b(?:puts|putchar)\s*\(/, entry.id + " must teach printf output");
  assert.doesNotMatch(code, /\bif\s*\(\s*scanf\s*\(/, entry.id + " must not test scanf return status");
  assert.match(code, /#include <stdio\.h>/, entry.id + " C include");
  assert.ok(entry.output && entry.statement, entry.id + " retains the question and expected output");

  let depth = 0;
  let activeCaseDepth = -1;
  for (const line of code.split("\n")) {
    const text = line.trim();
    if (!text || text.startsWith("#")) continue;
    const declaration = text.match(/^(?:int|char|double|float|long|size_t|unsigned int)\s+(.+);$/);
    if (declaration) assert.equal(topLevelComma(declaration[1]), false, entry.id + " declares multiple variables in one line");

    if (text.startsWith("}")) {
      depth--;
      if (activeCaseDepth > depth) activeCaseDepth = -1;
    }
    assert.ok(depth >= 0, entry.id + " closes an unstarted block");
    const label = /^(?:case\b|default:)/.test(text);
    const offset = activeCaseDepth >= 0 && depth >= activeCaseDepth && !label ? 1 : 0;
    assert.equal(
      line.length - line.trimStart().length,
      (depth + offset) * 4,
      entry.id + " wrong indentation: " + text
    );
    if (label) activeCaseDepth = depth;
    if (text.endsWith("{")) depth++;
    inspectedLines++;
  }
  assert.equal(depth, 0, entry.id + " has unbalanced braces");
}
for (const [id, guide] of cGuidance) {
  assert.doesNotMatch(guide.join("\n"), /\bputs\b|\bputchar\b/, "outdated help " + id);
}
assert.match(q("C-002").code, /printf\("Hello World\\n"\)/);
assert.match(q("C-003").code, /printf\("C Language\\n"\)/);
assert.match(q("C-021").code, /printf\("POSITIVE\\n"\)/);
assert.match(q("C-013").code, /scanf\("%d %d",\s*&a,\s*&b\);/);
assert.match(q("C-013").code, /if \(b == 0\)/);
assert.match(q("C-094").code, /if \(b == 0\)/);
// For C-049 through C-051, avoid unnecessary do-while in beginner exercises.
for (const id of ["C-049", "C-050", "C-051"]) {
  assert.doesNotMatch(q(id).code, /\bdo\s*\{/, id + " should not use do-while");
  assert.match(q(id).code, /\bwhile\s*\(/, id + " should use a plain while");
}
assert.match(q("C-049").code, /int digits=1;/);
assert.match(q("C-049").code, /while \(n >= 10\)/);

assert.match(q("C-047").code, /\n            printf\("\*"\)/);
assert.match(q("C-052").code, /\n        if \(n%d==0\) \{/);
assert.match(q("C-064").code, /\n            if \(a\[j\]>a\[j\+1\]\) \{/);
assert.match(q("C-100").code, /\n                struct Student temp/);
assert.match(q("C-073").code, /for \(int i = 0; word\[i\]/);
for (const id of ["C-071", "C-073", "C-077", "C-078", "C-079"]) {
  assert.doesNotMatch(q(id).code, /\bsize_t\b/, id + " should use a beginner-friendly index type");
}
assert.match(q("C-071").code, /printf\("%d\\n",length\)/);
assert.match(q("C-076").code, /int index = -1;/);
assert.match(q("C-076").code, /if \(found != NULL\)/);
assert.match(q("C-080").code, /snprintf로 결과 문자열을 지정된 크기의 배열에 저장합니다/);


// Optional real execution validation: C_CODING_RUNTIME_TEST=1 node tests/coding-c-printf-format.test.mjs
// Compile and execute every authored sample input with gcc, comparing exact expected output.
if (process.env.C_CODING_RUNTIME_TEST === "1") {
  const compiler = spawnSync("gcc", ["--version"], {encoding:"utf8"});
  assert.equal(compiler.status, 0, "gcc is required for runtime validation");
  const workdir = mkdtempSync(join(tmpdir(), "coding-c-"));
  try {
    for (const exercise of problems) {
      const sourceFile = join(workdir, exercise.id + ".c");
      const executable = join(workdir, exercise.id);
      writeFileSync(sourceFile, sourceWithoutLearningComments(exercise.code), "utf8");
      const build = spawnSync("gcc", ["-std=c11", "-Wall", "-Wextra", sourceFile, "-o", executable], {
        encoding:"utf8", timeout:20000
      });
      assert.equal(build.status, 0, exercise.id + " gcc compilation failed: " + build.stderr);
      const input = exercise.input === "입력 없음" ? "" : exercise.input + "\n";
      const execution = spawnSync(executable, [], {encoding:"utf8", input, timeout:3000});
      assert.equal(execution.status, 0, exercise.id + " execution failed: " + execution.stderr);
      assert.equal(execution.stdout.trimEnd(), exercise.output.trimEnd(), exercise.id + " output differs");
    }
  } finally {
    rmSync(workdir, {recursive:true,force:true});
  }
  console.log("PASS: gcc compiled and executed all 100 C programs with expected example output.");
}
console.log("PASS: 100 C exercises, " + inspectedLines + " indentation-checked lines, printf-only examples.");
