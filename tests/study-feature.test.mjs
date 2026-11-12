import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {services,portalNavLinks} from '../js/services.js';
import {portalPages} from '../js/portal-navigation-model.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

const study=read('study.html'),student=read('js/study.js'),faculty=read('teacher-learning.html'),
  facultyJS=read('js/study-teacher.js'),worker=read('supabase/functions/study-absence-reminder/index.ts'),
  job=read('.github/workflows/study-absence-reminder.yml'),css=read('css/study.css');
assert.equal(services.find(s=>s.id==='study')?.url,'study.html');
assert.equal(portalNavLinks.find(x=>x.id==='study')?.group,'learning');
assert.equal(portalPages.study?.locked,true);
assert.ok(study.includes('id="learning-lock"'),'auth must unlock study page');
assert.ok(study.includes('data-module="js/study.js'),'student JS runs only after portal auth');
for(const id of ['study-week','study-days','study-save','study-session-primary','study-pause','study-end','study-reason-form','study-stat-rate'])
  assert.ok(study.includes('id="'+id+'"'),id+' mounted');
for(const name of ['study_weekly_plans','study_sessions','study_absence_reasons','study_start_session','study_finish_session','study_pause_session','study_resume_session'])
  assert.ok(student.includes(name),name+' database path');
assert.match(student,/portalLearning\?\.write/);
assert.match(student,/study_date:date/);
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
assert.match(worker,/study\.html\?reason=/);
assert.ok(job.includes('cron: "0 0 * * 2-6"'),'09:00 KST on Tue-Sat');
assert.match(job,/id-token: write/);
assert.ok(css.includes('max-width:760px'),'mobile layout');
console.log('PASS: portal study page, faculty administration, secure mail and mobile styling.');
