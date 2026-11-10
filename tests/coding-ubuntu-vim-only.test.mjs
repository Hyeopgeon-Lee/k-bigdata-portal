import assert from "node:assert/strict";
import {ubuntuPptProblems as lessons} from "../data/coding-ubuntu-ppt.js";

assert.equal(lessons.length,50,"All 50 active Ubuntu exercises are present");
const byId=new Map(lessons.map(x=>[x.id,x]));
assert.equal(byId.size,50,"IDs are unique");

const editing=["LINUX-001","LINUX-002","LINUX-011","LINUX-023","LINUX-024","LINUX-025"];
for(const id of editing){
 const q=byId.get(id);
 assert.ok(q,id+" exists");
 assert.match(q.code,/(?:^|\n)vim\s+[^\n]+/,id+" edits with Vim");
 assert.match(q.statement,/Vim/i,id+" explains Vim in question");
 assert.match([q.explanation,...(q.vimSteps||[])].join(" "),/:wq/,id+" explains saving before exit without duplicating Vim steps");
 assert.ok(Array.isArray(q.vimSteps)&&q.vimSteps.length>=3,id+" supplies explicit Vim keystrokes");
 assert.match(q.vimSteps.join(" "),/:wq/,id+" explains Vim save/exit keystrokes");
 assert.match(q.vimSteps.join(" "),/Enter(?: 키)?(?:를|로| )/,id+" explains how to execute Vim commands");
}
for(const q of lessons){
 assert.match(q.statement,/시오\.$/,q.id+" must use an imperative first-year prompt");
 assert.match(q.input,/^student@ubuntu:/,q.id+" setup is a terminal screenshot-style transcript");
 assert.match(q.output,/^student@ubuntu:/,q.id+" expected result is a terminal screenshot-style transcript");
 assert.doesNotMatch(q.code,/\b(?:touch|nano|gedit|emacs)\b/i,q.id+" no non-PPT editor or touch file-creation method");
 assert.equal(q.input,q.initialState,q.id+" duplicate setup data must agree");
 assert.equal(q.output,q.afterState,q.id+" duplicate result data must agree");
}
assert.ok(byId.get("LINUX-018").code.startsWith("grep -n"),"LOG search remains PPT-based");
assert.match(byId.get("LINUX-023").vimSteps.join(" "),/i 키.*linux study.*Esc 키.*:wq/s,"insert-mode, text, normal-mode, save sequence");
assert.match(byId.get("LINUX-024").vimSteps.join(" "),/:2.*dd.*:wq/s,"line deletion sequence");
assert.match(byId.get("LINUX-024").code,/cat memo\.txt/,"Vim deletion is verified");
assert.match(byId.get("LINUX-025").code,/cat memo\.txt/,"Vim substitution is verified");
assert.match(byId.get("LINUX-025").vimSteps.join(" "),/:%s\/linux\/Linux\/g.*:wq/s,"global substitution sequence");
assert.ok(byId.get("LINUX-047").code.startsWith("gzip"),"compression is not an editor lesson");
console.log("PASS: 50 active Ubuntu lessons preserve Vim-only editing, terminal transcripts and imperative prompts.");
