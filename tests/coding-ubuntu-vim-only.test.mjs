import assert from "node:assert/strict";
import {codingProblems as samples} from "../data/coding-samples.js";
import {ubuntuFoundationProblems} from "../data/coding-ubuntu-foundations.js";
import {ubuntuAdvancedProblems} from "../data/coding-ubuntu-advanced.js";
import {ubuntuLegacyGuides} from "../data/coding-ubuntu-legacy-guides.js";

const lessons = [...samples.filter(q => q.language === "linux"), ...ubuntuFoundationProblems, ...ubuntuAdvancedProblems];
const byId = new Map(lessons.map(q => [q.id, q]));
assert.equal(lessons.length, 50, "Ubuntu still has 50 exercises");
assert.equal(byId.size, 50, "All Ubuntu exercise IDs are unique");

const vimFileLessons = ["LINUX-001", "LINUX-002", "LINUX-011", "LINUX-047", "LINUX-048"];
for (const id of vimFileLessons) {
  const q = byId.get(id);
  assert.ok(q, id + " exists");
  assert.match(q.statement, /vim/i, id + " requires Vim in the question");
  assert.match(q.code, /\\bvim\\s+[^\\n]+/, id + " opens file via Vim");
  assert.match(q.hint, /vim/i, id + " hint explains Vim");
  assert.match(q.explanation, /vim/i, id + " explanation matches the Vim workflow");
  assert.match(q.code, /:wq/, id + " gives the save and exit command");
  assert.doesNotMatch(q.code, /\\btouch\\b|\\bnano\\b|\\bgedit\\b|\\bemacs\\b|printf[^\\n]*>{1,2}/i, id + " must not substitute another editor or file writer");
}
for (const q of lessons) {
  assert.doesNotMatch(q.code, /\\bnano\\b|\\bgedit\\b|\\bemacs\\b|\\bvi\\s/i, q.id + " uses no alternate text editor");
  if (q.id !== "LINUX-018") assert.doesNotMatch(q.code, /\\btouch\\b/, q.id + " uses Vim for file creation, not touch");
}
assert.equal(byId.get("LINUX-018").code, "touch memo.txt", "touch remains valid only for updating file timestamps");
assert.match(byId.get("LINUX-018").statement, /시간 정보|수정 시간/, "timestamp lesson is not an editing lesson");

for (const id of ["LINUX-001", "LINUX-002"]) {
  const q = byId.get(id);
  const guide = ubuntuLegacyGuides[id];
  assert.ok(guide, id + " has a detailed guide");
  assert.equal(guide.code, q.code, id + " visible commands match copied commands");
  assert.ok(guide.commandParts.some(part => /vim/i.test(part.token)), id + " guide documents Vim");
  assert.doesNotMatch(JSON.stringify(guide.commandParts), /touch|nano|gedit|emacs/i, id + " guide is Vim-only");
}
assert.match(byId.get("LINUX-002").code, /chmod 640 report\\.txt/, "file permissions remain unchanged");
assert.match(byId.get("LINUX-002").code, /ls -l report\\.txt/, "permission verification remains unchanged");
assert.match(byId.get("LINUX-047").code, /\\bi\\s*→\\s*hello/, "Vim new-file lesson explains insert mode");
assert.match(byId.get("LINUX-048").code, /G\\s*→\\s*o\\s*→\\s*world/, "Vim append lesson explains navigation and opening a line");
assert.equal(byId.get("LINUX-047").topic, "Vim 편집");
assert.equal(byId.get("LINUX-048").topic, "Vim 편집");

console.log("PASS: 50 Ubuntu exercises; 5 Vim editing tasks, consistent guide and command copy, touch reserved for timestamps");
