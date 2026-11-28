import assert from 'node:assert/strict';
import {lastWeek,validWeek,shift,summarize,scheduleEvents,suggestedTasks,reportForCertificates} from '../supabase/functions/student-weekly-report/report.mjs';
import {readFileSync} from 'node:fs';
assert.equal(lastWeek(Date.parse('2026-11-29T14:59:59Z')),'2026-11-16');
assert.equal(lastWeek(Date.parse('2026-11-29T15:00:00Z')),'2026-11-23');
assert.equal(lastWeek(Date.parse('2027-01-03T15:00:00Z')),'2026-12-28');
assert.ok(validWeek('2026-11-23')); assert.ok(!validWeek('2026-11-24'));assert.ok(!validWeek('2026-02-30'));
assert.equal(shift('2026-12-28',7),'2027-01-04');
const date=(d)=>new Date(d).toISOString();
const attempts=[
 {bank:'coding',question_id:'a',submitted_at:date('2026-11-22T15:00:00Z'),result:'correct'},
 {bank:'coding',question_id:'a',submitted_at:date('2026-11-22T16:00:00Z'),result:'incorrect'},
 {bank:'coding',question_id:'b',submitted_at:date('2026-11-22T16:01:00Z'),result:'timeout'},
 {bank:'practical',question_id:'c',submitted_at:date('2026-11-29T14:59:59Z'),result:'ungraded'},
 {bank:'coding',question_id:'d',submitted_at:date('2026-11-29T15:00:00Z'),result:'correct'},
 {bank:'coding',question_id:'e',submitted_at:date('2026-11-22T14:59:59Z'),result:'correct'}
];
const written=[{exam_type:'industrial',question_id:'a',attempted_at:Date.parse('2026-11-23T15:00:00Z'),correct:true}];
const sessions=[{started_at:'2026-11-23T12:00:00Z',duration_seconds:3600,status:'completed'},{started_at:'2026-11-23T12:00:00Z',duration_seconds:7200,status:'needs_review'},{started_at:'2026-11-23T12:00:00Z',duration_seconds:7200,status:'needs_review',review_outcome:'rejected'},{started_at:'2026-11-29T15:00:00Z',duration_seconds:1800,status:'completed'}];
const l=summarize('2026-11-23',attempts,written,sessions,{weekdays:[1,3]});
assert.equal(l.attempts,5);assert.equal(l.questions,4);assert.equal(l.graded,3);assert.equal(l.correct,2);assert.equal(l.accuracy,67);assert.equal(l.study_seconds,3600);assert.equal(l.review_pending,1);assert.equal(l.trend.at(-2).attempts,1);assert.equal(l.days[0].study_seconds,3600);assert.equal(l.plan_days,2);
const zero=summarize('2026-11-23',[],[],[],null);assert.equal(zero.accuracy,null);assert.equal(zero.plan_days,null);
const event={published:true,title:'일정',startDate:'2026-11-29',endDate:'2026-12-01',targetGrade:'1'};
const events=scheduleEvents([event,{...event,targetGrade:'2'},{...event,published:false},{...event,targetGrade:'all',startDate:'2026-12-07',endDate:'2026-12-08'}],1,'2026-11-23');
assert.equal(events.length,1);
assert.ok(suggestedTasks(zero,{registered:false,issues:[]},[]).some(t=>t.id==='ready-register'));
assert.ok(suggestedTasks(l,{registered:true,issues:[{code:'readme_missing',label:'README 작성'}]},events).some(t=>t.id==='ready-readme_missing'));
const edge=readFileSync(new URL('../supabase/functions/student-weekly-report/index.ts',import.meta.url),'utf8');
assert.match(edge,/caller\.auth\.getUser\(token\)/);assert.match(edge,/caller\.rpc\("ready_access"\)/);assert.match(edge,/eligible\(\)\.eq\("user_id",auth\.user\.id\)/);assert.doesNotMatch(edge,/body\.user_id/);
const sql=readFileSync(new URL('../supabase/migrations/20261128180000_student_weekly_reports.sql',import.meta.url),'utf8');assert.match(sql,/enable row level security/);assert.match(sql,/revoke all on public\.student_weekly_reports from public, anon, authenticated/);
console.log('PASS: KST boundaries, activity counts, ungraded and review exclusions, calendar grade restrictions, tasks and access rules.');

const auth=readFileSync(new URL('../js/portal-auth.mjs',import.meta.url),'utf8');
const account=auth.slice(auth.indexOf('const accountSettings=addSection'),auth.indexOf('// Personal learning and device-data migration'));
assert.match(account,/마이페이지[\s\S]*나의 주간 리포트[\s\S]*나의 자격증/);
assert.match(account,/if\(!isAdmin&&activeWrite&&currentProfile\?\.signup_type==="student"&&currentProfile\?\.approval_status==="approved"&&currentProfile\?\.enrollment_status==="enrolled"\)addAction\(accountSettings,\{title:"나의 주간 리포트".*href:"weekly-report.html"/);

// Both relevant final certificates qualify independently. Pending final registrations
// are included (as in the portal's registered final-pass count); rejected and written-only do not qualify.
const snapshot={week_start:'2026-11-23',payload:{learning:{...l,subjects:[
 {id:'coding',attempts:3},{id:'ncp',attempts:0},{id:'engineer',attempts:5},{id:'industrial',attempts:2},{id:'practical',attempts:4}
 ]},tasks:[]},completed_tasks:['test']};
const before=JSON.stringify(snapshot);
for(const certificate_code of ['engineer','industrial']){
 for(const verification_status of ['verified','pending']){
  const report=reportForCertificates(snapshot,[{certificate_code,pass_status:'final',verification_status}]);
  assert.deepEqual(report.payload.learning.subjects.map(x=>x.id),['coding']);
  assert.equal(report.payload.learning.subject_scope,'fundamentals');
  assert.equal(report.payload.learning.attempts,l.attempts,'overall metrics remain undisturbed');
  assert.deepEqual(report.completed_tasks,['test']);
 }
}
for(const cert of [
 {certificate_code:'engineer',pass_status:'written',verification_status:'verified'},
 {certificate_code:'industrial',pass_status:'final',verification_status:'rejected'},
 {certificate_code:'sqld',pass_status:'final',verification_status:'verified'}
])assert.equal(reportForCertificates(snapshot,[cert]),snapshot);
const noBasics={...snapshot,payload:{...snapshot.payload,learning:{...snapshot.payload.learning,subjects:snapshot.payload.learning.subjects.map(s=>s.id==='coding'?{...s,attempts:0}:s)}}};
assert.equal(reportForCertificates(noBasics,[{certificate_code:'engineer',pass_status:'final',verification_status:'pending'}]).payload.learning.subjects.length,0);
const bothBasics={...snapshot,payload:{...snapshot.payload,learning:{...snapshot.payload.learning,subjects:snapshot.payload.learning.subjects.map(s=>s.id==='ncp'?{...s,attempts:2}:s)}}};
assert.deepEqual(reportForCertificates(bothBasics,[{certificate_code:'industrial',pass_status:'final',verification_status:'verified'}]).payload.learning.subjects.map(s=>s.id),['coding','ncp']);
assert.equal(JSON.stringify(snapshot),before,'existing weekly snapshot must remain immutable');
assert.match(edge,/reportForCertificates\(report,certificates\)/);
assert.match(edge,/from\("student_certifications"\)\.select\("certificate_code,pass_status,verification_status"\)\.eq\("user_id",member\.user_id\)/);
console.log('PASS: independent article/industrial final-pass filter, zero attempts, historical snapshot immutability.');
