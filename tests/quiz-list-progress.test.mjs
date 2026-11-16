import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import {describeQuestionProgress,progressDate,createLearningProgressStore} from "../js/learning-list-progress.mjs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("KST dates are used at midnight, not UTC",()=>{
 assert.equal(progressDate("2026-11-15T15:00:00Z"),"2026.11.16");
 assert.equal(progressDate("2026-11-15T14:59:59Z"),"2026.11.15");
 assert.equal(progressDate("garbage"),"");
});

test("cloud totals are authoritative and never added to device history",()=>{
 const row={attempts_count:3,last_attempt_at:"2026-11-16T07:12:00Z"};
 const record=describeQuestionProgress(row,{count:4,lastAttemptAt:Date.now()});
 assert.equal(record.kind,"done");
 assert.equal(record.count,3);
 assert.equal(record.source,"cloud");
 assert.equal(record.text,"풀이 완료 · 3회 · 최근 2026.11.16");
});
test("older local attempts are disclosed without fabricating cloud statistics",()=>{
 const local=describeQuestionProgress(null,{count:2,lastAttemptAt:Date.parse("2026-11-12T13:21:00Z")});
 assert.equal(local.kind,"local");
 assert.equal(local.count,2);
 assert.match(local.text,/이 기기 풀이 기록 · 2회 · 최근 2026.11.12 · 서버 확인 전/);
 const legacy=describeQuestionProgress(null,{exists:true});
 assert.match(legacy.text,/횟수 미확인/);
 assert.equal(legacy.kind,"local");
});
test("unknown cloud state is never falsely described as unattempted",()=>{
 assert.equal(describeQuestionProgress(null,null,"ready").kind,"unseen");
 assert.equal(describeQuestionProgress(null,null,"login").kind,"unknown");
 assert.equal(describeQuestionProgress(null,null,"error").kind,"unknown");
 assert.equal(describeQuestionProgress(null,null,"loading").kind,"loading");
});
test("bank identifiers are validated before DB access",()=>{
 assert.throws(()=>createLearningProgressStore({bank:"unknown"}),/INVALID_PROGRESS_BANK/);
});
test("all three services use the same searchable list status and completion filter",()=>{
 const common=read("js/question-browser.js");
 const activity=read("js/learning-activity.mjs");
 assert.match(common,/qb-progress-filter/);
 assert.match(common,/qb-progress-detail/);
 assert.match(common,/progressFilter==="done"/);
 assert.match(common,/progressFilter==="unseen"/);
 assert.match(common,/return \{show,resume,refresh:render\}/);
 assert.match(activity,/fetchLearningProgress\(bank=null\)/);
 assert.match(activity,/query\.eq\('bank',bank\)/);
 for(const path of ["js/coding.js","js/practical-ui.js","js/ncp-quiz.js"]){
  const code=read(path);
  assert.match(code,/createLearningProgressStore/);
  assert.match(code,/progressFor:q=>/);
  assert.match(code,/\.attach\(\)/);
 }
 for(const path of ["coding.html","practical.html","ncp.html"])
  assert.match(read(path),/question-browser\.css\?v=20261116-progress-v1/);
});
