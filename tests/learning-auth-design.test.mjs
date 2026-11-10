import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("learning account modules parse",()=>{
 for(const name of ["learning-config","learning-auth","learning-login","learning-sync","learning-shell","learning-dashboard","learning-admin","learning-import","coding","ncp-quiz","practical-store","practical-ui"]){
  const filename=new URL("../js/"+name+".js",import.meta.url).pathname;
  const run=spawnSync(process.execPath,["--check",filename],{encoding:"utf8"});
  assert.equal(run.status,0,name+": "+run.stderr);
 }
});
test("login screens and original exercise pages remain linked",()=>{
 for(const name of ["login","my-learning","students-admin"]){assert.match(read(name+".html"),/<main/);}
 for(const name of ["coding","ncp","practical"]){assert.match(read(name+".html"),/learning-shell\.js/);}
 assert.match(read("coding.html"),/coding-correct-button/);
 assert.match(read("coding.html"),/coding-wrong-button/);
});
test("database policy protects personal history and 90-day session",()=>{
 const sql=read("supabase/migrations/20261111_learning_auth.sql");
 assert.match(sql,/private\.portal_sessions/);
 assert.match(sql,/interval '90 days'/);
 assert.match(sql,/email_confirmed_at is not null/);
 assert.match(sql,/hglee67@kopo\.ac\.kr/);
 for(const tab of ["profiles","account_roles","learning_attempts","learning_progress","learning_drafts","report_deliveries","admin_audit_log"]){
  assert.match(sql,new RegExp("alter table public\\."+tab+" enable row level security","i"));
 }
 assert.doesNotMatch(sql,/grant\s+update\s+on\s+public\.account_roles/i);
});
test("exercises preserve every submitted result",()=>{
 assert.match(read("js/practical-store.js"),/viewedExplanation/);
 assert.match(read("js/practical-store.js"),/recordCloudAttempt/);
 assert.match(read("js/ncp-quiz.js"),/recordCloudAttempt/);
 assert.match(read("js/coding.js"),/gradingMethod:"self"/);
 assert.match(read("js/learning-sync.js"),/ignoreDuplicates:true/);
});
test("professor report delivers to a single fixed address",()=>{
 const report=read("supabase/functions/weekly-learning-report/index.ts");
 assert.match(report,/hglee67@kopo\.ac\.kr/);
 assert.match(report,/super_admin/);
});
