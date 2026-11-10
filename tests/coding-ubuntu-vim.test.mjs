import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ubuntuPptProblems as ubuntu} from "../data/coding-ubuntu-ppt.js";

assert.equal(ubuntu.length,50,"50 PPT-based Ubuntu exercises are active");
const byId=new Map(ubuntu.map(p=>[p.id,p]));
assert.equal(byId.size,50,"IDs are unique");

const vimTasks={
 "LINUX-001":"project/src/main.py",
 "LINUX-002":"report.txt",
 "LINUX-011":"note.txt",
 "LINUX-023":"memo.txt",
 "LINUX-024":"memo.txt",
 "LINUX-025":"memo.txt"
};
for(const [id,name] of Object.entries(vimTasks)){
 const p=byId.get(id);
 assert.ok(p,id+" exists");
 assert.ok(p.code.includes("vim "+name),id+" uses Vim");
 assert.match(p.statement,/Vim/i,id+" question mentions Vim");
 assert.match(p.explanation,/:wq/,id+" provides save and exit explanation");
 assert.match(p.input,/^student@ubuntu:/,id+" initial console");
 assert.match(p.output,/^student@ubuntu:/,id+" expected console");
 assert.doesNotMatch(p.code,/\b(?:nano|gedit|emacs|touch)\b/,id+" must not use other editor or file initializer");
}
for(const p of ubuntu) assert.doesNotMatch(p.code,/\b(?:nano|gedit|emacs|touch)\b/,p.id+" only uses PPT-approved methods");
assert.match(byId.get("LINUX-002").code,/chmod 640 report\.txt/);
assert.match(byId.get("LINUX-002").output,/-rw-r-----/);
assert.match(byId.get("LINUX-023").output,/linux study/);
assert.doesNotMatch(byId.get("LINUX-024").output,/\ntwo\n/);
assert.match(byId.get("LINUX-025").output,/Linux first/);
const js=readFileSync(new URL("../js/coding.js",import.meta.url),"utf8");
assert.match(js,/const includesVim/,"copy feedback handles Vim interactively");
assert.match(js,/터미널 명령은 한 줄씩 실행/);
console.log("PASS: six active PPT-based Vim editing exercises and 50 editor-policy checks.");
