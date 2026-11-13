import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const ui=read('js/teacher-learning.js');
const api=read('supabase/functions/learning-admin/index.ts');
const admin=read('admin/learning.html');
const legacy=read('teacher-learning.html');
const batch=read('supabase/migrations/20261113023452_schedule_learning_weekly_monthly_rollups_and_repair.sql');
const schema=read('supabase/migrations/20261113023133_learning_period_snapshot_tables_and_metrics.sql');
for(const path of ['js/teacher-learning.js','admin/js/learning.js']){
 const result=spawnSync(process.execPath,['--check',fileURLToPath(new URL('../'+path,import.meta.url))],{encoding:'utf8'});
 assert.equal(result.status,0,path+': '+result.stderr);
}
assert.match(ui,/button\.dataset\.learningGrade/);
assert.match(ui,/action:'reaggregate'/);
assert.match(ui,/snapshotStatus/);
assert.match(ui,/teacher-study-period-summary/);
assert.match(ui,/data\.previousAvailable/);
assert.match(api,/learning_compute_interval/);
assert.match(api,/learning_refresh_closed_period/);
assert.match(api,/snapshotStatus:/);
assert.doesNotMatch(api,/allAttempts\(range\.previousStart/);
for(const source of [admin,legacy]){
 assert.match(source,/id="teacher-study-period-summary"/);
 assert.match(source,/id="study-admin-grade"/);
 assert.doesNotMatch(source,/id="study-admin-grade"><option/);
}
assert.match(schema,/learning_period_members/);
assert.match(schema,/learning_period_stats/);
assert.match(schema,/learning_aggregation_jobs/);
assert.match(schema,/learning_compute_interval/);
assert.match(schema,/revoke all on function public\.learning_refresh_closed_period/);
assert.match(batch,/kbigdata-learning-week-close/);
assert.match(batch,/kbigdata-learning-month-close/);
assert.match(batch,/kbigdata-learning-repair/);
assert.match(batch,/time zone 'Asia\/Seoul'/);

const start=api.indexOf('function learningPeriod('),end=api.indexOf('Deno.serve(',start);
assert.ok(start>0&&end>start);
const periodCode=api.slice(start,end).replace('mode:"week"|"month",offset:number','mode,offset')
  .replace('let start:number,end:number,previousStart:number,previousEnd:number;','let start,end,previousStart,previousEnd;');
const fixedTime=Date.parse('2026-11-13T02:25:00.000Z');
class Clock extends Date{static now(){return fixedTime;}}
const range=new Function('Date',periodCode+';return learningPeriod;')(Clock);
const week=range('week',0),month=range('month',0),prevWeek=range('week',-1);
assert.equal(week.start,'2026-11-08T15:00:00.000Z');
assert.equal(week.end,'2026-11-15T15:00:00.000Z');
assert.equal(month.start,'2026-10-31T15:00:00.000Z');
assert.equal(month.end,'2026-11-30T15:00:00.000Z');
assert.equal(prevWeek.start,'2026-11-01T15:00:00.000Z');
assert.equal(prevWeek.end,week.start);
assert.equal(week.partial,true);
assert.equal(prevWeek.partial,false);
console.log('PASS: snapshot analytics UI, secured SQL rollups, scheduled jobs, KST date boundaries.');
