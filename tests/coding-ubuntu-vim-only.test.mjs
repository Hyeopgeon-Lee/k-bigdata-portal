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
 assert.match(q.explanation,/:wq/,id+" explains saving before exit");
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
assert.ok(byId.get("LINUX-047").code.startsWith("gzip"),"compression is not an editor lesson");
console.log("PASS: 50 active Ubuntu lessons preserve Vim-only editing, terminal transcripts and imperative prompts.");
