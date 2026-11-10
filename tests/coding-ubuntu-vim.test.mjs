import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {codingProblems as samples} from "../data/coding-samples.js";
import {ubuntuFoundationProblems} from "../data/coding-ubuntu-foundations.js";
import {ubuntuAdvancedProblems} from "../data/coding-ubuntu-advanced.js";
import {ubuntuLegacyGuides} from "../data/coding-ubuntu-legacy-guides.js";

const ubuntu = [
  ...samples.filter(q => q.language === "linux"),
  ...ubuntuFoundationProblems,
  ...ubuntuAdvancedProblems
];
assert.equal(ubuntu.length, 50, "50 Ubuntu coding lessons are registered");
const byId = new Map(ubuntu.map(p => [p.id,p]));
assert.equal(byId.size, 50, "Ubuntu lesson IDs are unique");

const vimFileTasks = {
  "LINUX-001": "project/src/main.py",
  "LINUX-002": "report.txt",
  "LINUX-011": "note.txt",
  "LINUX-047": "greeting.txt",
  "LINUX-048": "greeting.txt"
};
for (const [id,filename] of Object.entries(vimFileTasks)) {
  const lesson = byId.get(id);
  assert.ok(lesson, id+" exists");
  assert.match(lesson.code, new RegExp("\\bvim\\s+"+filename.replace(/\./g,"\\.")),
    id+" opens the file in Vim");
  assert.match(lesson.code, /:wq/, id+" documents save-and-exit");
  assert.match(lesson.statement, /Vim/, id+" explicitly requires Vim");
  assert.doesNotMatch(lesson.code, /\b(?:touch|nano|emacs|gedit)\b/,
    id+" must not use a different editor or touch for authoring");
}
for (const lesson of ubuntu) {
  assert.doesNotMatch(lesson.code, /\b(?:nano|emacs|gedit)\b/,
    lesson.id+" may not use another editor");
  if (lesson.id !== "LINUX-018") {
    assert.doesNotMatch(lesson.code, /\btouch\b/,
      lesson.id+" may not create files with touch");
  }
}
assert.equal(byId.get("LINUX-018").code, "touch memo.txt",
  "touch remains valid only for updating a file's timestamp");
assert.match(byId.get("LINUX-018").statement, /수정 시간/);
assert.doesNotMatch(byId.get("LINUX-004").input, /\btouch\b/,
  "directory listing setup should not teach touch-based file creation");

const chmod = byId.get("LINUX-002");
assert.match(chmod.code, /\bchmod 640 report\.txt\b/);
assert.match(chmod.code, /\bls -l report\.txt\b/);
assert.equal(chmod.output, "-rw-r----- (권한 표시 부분)");
assert.deepEqual(chmod.trace.map(step=>step[0]), ["Vim","chmod","ls -l"]);

const newText=byId.get("LINUX-047"),append=byId.get("LINUX-048");
assert.match(newText.code, /i → hello 입력 → Esc → :wq/,
  "Vim lesson demonstrates inserting and saving text");
assert.match(append.code, /G → o → world 입력 → Esc → :wq/,
  "Vim lesson demonstrates appending a new line safely");
assert.match(newText.explanation, /입력 모드/);
assert.match(append.explanation, /새 줄/);

for (const id of ["LINUX-001","LINUX-002"]) {
  assert.equal(ubuntuLegacyGuides[id].code,byId.get(id).code,
    id+" must have identical answers in lesson and guide");
  assert.ok(ubuntuLegacyGuides[id].commandParts.some(part=>part.token.startsWith("vim")),
    id+" guide documents Vim");
  assert.ok(ubuntuLegacyGuides[id].commandParts.some(part=>part.token.includes(":wq")),
    id+" guide explains how to save");
  assert.doesNotMatch(JSON.stringify(ubuntuLegacyGuides[id]), /\btouch\b/,
    id+" guide must not refer to touch-based file creation");
}
const script=readFileSync(new URL("../js/coding.js",import.meta.url),"utf8");
assert.match(script,/const includesVim/);
assert.match(script,/터미널 명령은 한 줄씩 실행/);
console.log("PASS: Ubuntu 50 lessons, five Vim authoring tasks, permission verification and timestamp exception.");
