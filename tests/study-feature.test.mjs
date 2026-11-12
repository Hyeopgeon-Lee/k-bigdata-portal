import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {services,portalNavLinks} from '../js/services.js';
import {portalPages} from '../js/portal-navigation-model.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

const study=read('study.html'),student=read('js/study.js'),faculty=read('teacher-learning.html'),
  facultyJS=read('js/study-teacher.js'),worker=read('supabase/functions/study-absence-reminder/index.ts'),
  job=read('.github/workflows/study-absence-reminder.yml'),css=read('css/study.css');

const studyIds=new Set([...study.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
const studyAccessors=[...student.matchAll(/\$\('([^']+)'\)/g)].map(match=>match[1]);
for(const id of new Set(studyAccessors))assert.ok(studyIds.has(id),
  'study.js must not access a missing DOM element: '+id);

assert.equal(services.find(s=>s.id==='study')?.url,'study.html');
assert.equal(portalNavLinks.find(x=>x.id==='study')?.group,'learning');
assert.equal(portalPages.study?.locked,true);
assert.ok(study.includes('id="learning-lock"'),'auth must unlock study page');
assert.ok(study.includes('data-module="js/study.js'),'student JS runs only after portal auth');
assert.match(study,/id="study-no-plan-reason"/,'mandatory no-plan explanation is shown on zero-day weeks');
assert.match(study,/minlength="2" maxlength="300"/,'reasonable explanation length');
assert.match(student,/no_plan_reason:noPlanReason/,'student stores explanation with weekly plan');
assert.match(student,/selected\.size===0&&\(!noPlanReason/,'empty reason cannot be submitted');
assert.match(student,/\$\('study-no-plan-reason'\)\.required=selected\.size===0/,'reason required only if no weekdays');
assert.match(faculty,/계획 없음 사유/,'teacher column is present');
assert.match(facultyJS,/plan\.no_plan_reason/,'teacher sees saved explanation');
assert.doesNotMatch(study,/예:\s*이번 주에는 자격증 시험 준비/,'no copied opt-out excuse should be suggested');
assert.match(study,/자격증·코딩·프로젝트 준비도 자율학습에 포함/,'study subjects are not reasons to opt out');
assert.match(study,/공부할 과목이 아니라 학교에 남아 공부하기 어려운 이유/,'students must explain inability to stay');
assert.match(study,/0일 제출은 자율학습 면제 승인이 아닙니다/,'zero-day submission is not automatic exemption');
assert.match(facultyJS,/0일 계획 · 확인 필요/,'zero-day plans require faculty attention');
assert.match(facultyJS,/zeroPlanStudents/,'faculty dashboard highlights zero-day cases');


for(const id of ['study-week','study-days','study-save','study-session-primary','study-pause','study-end','study-stat-rate'])
  assert.ok(study.includes('id="'+id+'"'),id+' mounted');
for(const name of ['study_weekly_plans','study_sessions','study_start_session','study_finish_session','study_pause_session','study_resume_session'])
  assert.ok(student.includes(name),name+' database path');
assert.match(student,/portalLearning\?\.write/);
assert.doesNotMatch(study,/id="study-reason-form"/,'absence form separate from plan page');
assert.doesNotMatch(student,/study_absence_reasons/,'plan page does not save absence reasons');
assert.ok(faculty.includes('id="teacher-study-panel"'));
assert.ok(faculty.includes('data-module="js/study-teacher.js'));
for(const id of ['study-admin-table-body','study-admin-week','study-admin-grade','study-admin-mail'])
  assert.ok(faculty.includes('id="'+id+'"'));
assert.match(facultyJS,/study_admin_dashboard/);
assert.match(facultyJS,/study_settings/);
assert.match(worker,/githubIdentity\(req\)/);
assert.match(worker,/PUSH_MUST_DRY_RUN/);
assert.match(worker,/if\(!settings\.data\?\.enabled\)/);
assert.match(worker,/study_email_logs/);
assert.match(worker,/Idempotency-Key/);
assert.match(worker,/study-absence\.html\?reason=/);
assert.ok(job.includes('cron: "0 0 * * 2-6"'),'09:00 KST on Tue-Sat');
assert.match(job,/id-token: write/);
assert.ok(css.includes('max-width:760px'),'mobile layout');
console.log('PASS: portal study page, faculty administration, secure mail and mobile styling.');
