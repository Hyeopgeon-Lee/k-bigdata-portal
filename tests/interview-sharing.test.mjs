import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {questions} from "../js/interview.js";
import {renderInterviewQuestion,interviewShareText} from "../js/interview-ui.js";
const root=new URL("../",import.meta.url);
const ui=readFileSync(new URL("js/interview-ui.js",root),"utf8"),css=readFileSync(new URL("css/interview.css",root),"utf8"),html=readFileSync(new URL("interview.html",root),"utf8");
for(const q of questions){
 const card=interviewShareText(q);
 assert.ok(card.includes(q.question)&&card.includes(q.group)&&card.includes(q.difficulty),q.id);
 assert.ok(!card.includes(q.shortAnswer),q.id);
 const practice=renderInterviewQuestion(q,true),browse=renderInterviewQuestion(q,false);
 assert.ok(practice.includes("문제 공유")&&practice.includes("링크 복사"),q.id);
 assert.ok(!browse.includes('interview-share-row'),q.id);
}
assert.match(ui,/function shareInterviewQuestion\(q\)/);
assert.match(ui,/function copyInterviewQuestionLink\(q\)/);
assert.match(ui,/navigator\.share/);
assert.match(ui,/navigator\.clipboard\?\.writeText/);
assert.match(ui,/url\.searchParams\.set\("id",q\.id\)/);
assert.ok(css.includes(".interview-share-row"));
assert.ok(html.includes("js/learning-ui.js?v="));
console.log("PASS: 150 links keep IDs and do not expose answers in shared text.");
