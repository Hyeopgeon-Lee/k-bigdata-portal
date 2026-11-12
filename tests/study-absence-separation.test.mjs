import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const plan=read("study.html");
const planScript=read("js/study.js");
const reasonPage=read("study-absence.html");
const reasonScript=read("js/study-absence.js");
const worker=read("supabase/functions/study-absence-reminder/index.ts");
const nav=read("js/portal-navigation-model.mjs");
const stylesheet=read("css/study-absence.css");

assert.doesNotMatch(plan,/id="study-reason-form"/,"plan page must not contain absence form");
assert.doesNotMatch(planScript,/study_absence_reasons|renderReason\(|submitReason\(/,"plan page must not manage absence reasons");
assert.match(plan,/location\.replace\("study-absence\.html"\+location\.search\)/,"old email links redirect, keeping query");
assert.match(nav,/'study-absence': \{title:'자율학습 미참여 사유', group:null, locked:true\}/);
assert.match(reasonPage,/id="learning-lock"/,"form is login-gated before page rendering");
assert.match(reasonPage,/data-portal-page="study-absence"/);
assert.match(reasonPage,/data-module="js\/study-absence\.js/,"form JS loads after login");
assert.match(reasonPage,/href="study.html"/,"return to independent plan page");
for(const id of ["study-reason-date","study-reason-form","study-reason-select","study-reason-details","study-reason-submit","study-reason-feedback"]){
 assert.ok(reasonPage.includes('id="'+id+'"'),"missing "+id);
}
assert.doesNotMatch(reasonPage,/study-week|study-days|study-save|study-session-primary/,"no weekly plan controls in separate form");
assert.match(reasonScript,/new URLSearchParams\(location\.search\)\.get\("reason"\)/,"date read from email URL");
assert.match(reasonScript,/if\(!validDate\(date\)\)/,"date is checked");
assert.match(reasonScript,/d\.toISOString\(\)\.slice\(0,10\)===value/,"invalid calendar days rejected");
assert.match(reasonScript,/window\.portalLearning\?\.write===true/,"write requires authorized session");
assert.match(reasonScript,/eq\("user_id",user\.id\)/,"prior entry only queried for current user");
assert.match(reasonScript,/study_absence_reasons/);
assert.match(reasonScript,/onConflict:"user_id,study_date"/,"save preserves current schema");
assert.match(reasonScript,/if\(!kinds\.has\(reason\)\)/,"reason allowlist");
assert.match(reasonScript,/description\.length>500/,"input length limited");
assert.match(worker,/study-absence\.html\?reason=/,"email now opens new page");
assert.match(worker,/>미참여 사유 입력</,"button still present");
assert.match(stylesheet,/@media\(max-width:640px\)/,"mobile layout covered");
for(const p of ["js/study.js","js/study-absence.js","js/portal-navigation-model.mjs"])
 execFileSync("node",["--check",new URL("../"+p,import.meta.url).pathname],{stdio:"pipe"});
console.log("PASS: standalone absence form, legacy link, email link, authorization, mobile styling");
