import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
for(const path of [
 'js/learning-activity.mjs','js/my-learning.js','js/teacher-learning.js',
 'js/coding.js','js/ncp-quiz.js','js/practical-store.js','js/practical-ui.js'
]){
 const check=spawnSync(process.execPath,['--check',fileURLToPath(new URL('../'+path,import.meta.url))],{encoding:'utf8'});
 assert.equal(check.status,0,path+' syntax: '+check.stderr);
}
const coding=read('coding.html'),src=read('js/coding.js'),ncp=read('js/ncp-quiz.js'),practical=read('js/practical-store.js');
const my=read('my-learning.html'),teacher=read('teacher-learning.html');
const service=read('js/services.js');
const review=read('js/study-review.js');
for(const result of ['correct','incorrect','ungraded'])assert.ok(review.includes(result));
for(const source of [src,ncp,read('js/practical-ui.js')])assert.match(source,/bindReview\(/);
assert.match(src,/debounceCloudDraft/);
assert.match(practical,/saveAttempt\(/);
assert.doesNotMatch(coding,/coding-done-button/);
assert.doesNotMatch(my,/주간 이메일 발송을 잠시 보류/);
assert.match(my,/id="learn-review"/);
assert.match(teacher,/id="teacher-summary"/);
assert.match(teacher,/id="teacher-wrong"/);
assert.match(teacher,/id="teacher-mail-faculty"/);
assert.match(teacher,/role="switch"/);
assert.match(teacher,/id="teacher-mail-students"/);
const teacherUI=read('js/teacher-learning.js');
const teacherCSS=read('css/learning-dashboard.css');
assert.match(teacherUI,/action:'mail_settings'/);
assert.match(teacherUI,/action:'update_mail_setting'/);
assert.match(teacherUI,/saveMailSetting/);
assert.match(teacherCSS,/data-page="teacher-learning"/);
assert.ok(teacherCSS.includes("@media(max-width:700px)"));
assert.match(read('js/portal-auth.mjs'),/my-learning\.html/);
assert.match(read('js/portal-auth.mjs'),/teacher-learning\.html/);
for(const html of [my,teacher]){assert.match(html,/id="learning-lock"/);assert.match(html,/data-module="js\/(?:my|teacher)-learning\.js/);}
const mail=read('supabase/functions/weekly-learning-report/index.ts');
const admin=read('supabase/functions/learning-admin/index.ts');
const workflow=read('.github/workflows/weekly-learning-report.yml');
assert.match(workflow,/cron: "0 23 \* \* 0"/);
assert.match(workflow,/id-token: write/);
assert.match(workflow,/dry_run/);
assert.match(mail,/crypto\.subtle\.verify/);
assert.match(mail,/workflow_ref/);
assert.match(mail,/githubIdentity/);
assert.match(mail,/report_deliveries/);
assert.match(mail,/reportControls/);
assert.match(mail,/studentBody/);
assert.match(mail,/if\(!controls.faculty&&!controls.students\)/);
assert.match(mail,/email_confirmed_at/);
assert.match(mail,/studentEmailRecipients:controls.students/);
assert.match(mail,/enrollment_status,signup_type/,"weekly recipient query includes signup type");
assert.match(mail,/p\.signup_type!=="alumni"/,"alumni are excluded server-side from weekly reports");
assert.match(mail,/deliver\(student.user_id/);
assert.match(admin,/smallCohortHidden/);
assert.ok(admin.includes('if(action==="mail_settings")'));
assert.ok(admin.includes('if(action==="update_mail_setting")'));
assert.match(admin,/weekly_report_controls/);
assert.match(admin,/report_deliveries/);
assert.doesNotMatch(read('js/learning-activity.mjs'),/service_role|sb_secret_/);
// Test an offline student submission followed by a successful sync.
const store=new Map(),logged=[];
globalThis.localStorage={
 getItem:key=>store.get(key)||null,
 setItem:(key,value)=>store.set(key,String(value))
};
globalThis.document={dispatchEvent:()=>{}};
if(typeof globalThis.CustomEvent==='undefined')globalThis.CustomEvent=class{constructor(type,options){this.type=type;this.detail=options.detail;}};
globalThis.portalLearning={read:true,write:true,expires:Date.now()+86400000};
let unavailable=true;
globalThis.portalSupabaseClient={
 auth:{async getUser(){return {data:{user:{id:'11111111-1111-4111-8111-111111111111',email:'student@test.edu'}},error:null};}},
 from(table){
  assert.equal(table,'learning_attempts');
  return {async insert(payload){
   if(unavailable)return {error:{code:'PGRST_OFFLINE'}};
   if(!logged.some(row=>row.client_attempt_id===payload.client_attempt_id))logged.push(payload);
   return {error:null};
  }};
 }
};
const {recordLearningAttempt,flushLearningQueue}=await import('../js/learning-activity.mjs');
const result=await recordLearningAttempt({bank:'coding',questionId:'JAVA-001',result:'incorrect',gradingMethod:'self',answerText:'if(a>b)'});
assert.equal(result.state,'pending');
assert.equal(logged.length,0);
unavailable=false;
assert.equal((await flushLearningQueue()).state,'saved');
assert.equal(logged.length,1);
assert.equal(logged[0].result,'incorrect');
await recordLearningAttempt({bank:'coding',questionId:'JAVA-001',result:'correct',gradingMethod:'self',answerText:'if(a>b)'});
assert.equal(logged.length,2,'retrying a problem is a new attempt');
assert.notEqual(logged[0].client_attempt_id,logged[1].client_attempt_id);
console.log('PASS: cloud attempt retries, self-grade distinctions, study dashboards, OIDC weekly reports.');
