import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {studyPlanningWeeks} from '../js/study-week.mjs';

const at=timestamp=>studyPlanningWeeks(Date.parse(timestamp));
assert.deepEqual(at('2026-11-12T14:59:59Z'),{
 thisWeek:'2026-11-09',nextWeek:'2026-11-16',nextWeekOpen:false,defaultWeek:'2026-11-09'
},'Thursday 23:59 KST must not open next-week planning');
assert.deepEqual(at('2026-11-12T15:00:00Z'),{
 thisWeek:'2026-11-09',nextWeek:'2026-11-16',nextWeekOpen:true,defaultWeek:'2026-11-16'
},'Friday 00:00 KST must open and select next week');
assert.equal(at('2026-11-13T10:00:00Z').defaultWeek,'2026-11-16','Friday evening is still open');
assert.equal(at('2026-11-15T14:59:59Z').defaultWeek,'2026-11-16','Sunday evening remains open');
assert.deepEqual(at('2026-11-15T15:00:00Z'),{
 thisWeek:'2026-11-16',nextWeek:'2026-11-23',nextWeekOpen:false,defaultWeek:'2026-11-16'
},'Monday 00:00 KST should reset the calendar');
assert.equal(at('2026-12-31T15:00:00Z').defaultWeek,'2027-01-04','year rollover correctly');
const study=readFileSync(new URL('../js/study.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../study.html',import.meta.url),'utf8');
assert.match(study,/studyPlanningWeeks\(\)\.defaultWeek/);
assert.match(study,/if\(weeks\.nextWeekOpen\)options\.push/);
assert.match(study,/nextWeekLocked/);
assert.match(study,/member\.signup_type==="student"&&member\.enrollment_status==="enrolled"/,'student permissions retained');
assert.match(study,/day===today&&new Date\(Date\.now\(\)\+Z\)\.getUTCHours\(\)>=16/,'4 PM cutoff retained');
assert.match(html,/id="study-plan-guidance"/);
assert.match(html,/js\/study\.js\?v=20261113-next-week-friday-v1/);
console.log('PASS: Friday opening, KST rollover, next-week defaults and existing access controls.');
