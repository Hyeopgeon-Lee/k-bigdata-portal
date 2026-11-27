import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {studyPlanningWeeks} from '../js/study-week.mjs';
import {studyWeeklyTotals} from '../js/study-weekly-hours.mjs';

const kstFridayMidnight=studyPlanningWeeks(Date.parse('2026-11-19T15:00:00Z'));
assert.equal(kstFridayMidnight.thisWeek,'2026-11-16');
assert.equal(kstFridayMidnight.defaultWeek,'2026-11-23');
assert.equal(kstFridayMidnight.nextWeekOpen,true);

const secondsFor=row=>row.duration_seconds||0;
const rows=[
 {started_at:'2026-11-15T15:00:00Z',duration_seconds:3600}, // Monday 00:00 KST
 {started_at:'2026-11-17T03:00:00Z',duration_seconds:5400}, // Tuesday 12:00 KST
 {started_at:'2026-11-18T06:00:00Z',duration_seconds:7200}, // Wednesday KST
 {started_at:'2026-11-19T03:00:00Z',duration_seconds:1800}, // Thursday KST
 {started_at:'2026-11-19T15:00:00Z',duration_seconds:9000}, // Friday 00:00 KST
 {started_at:'2026-11-20T14:59:59Z',duration_seconds:120}, // Friday 23:59 KST
 {started_at:'2026-11-20T15:00:00Z',duration_seconds:3600}, // Saturday excluded
 {started_at:'2026-11-22T15:00:00Z',duration_seconds:3600}, // Following Monday excluded
 {started_at:'2026-11-15T14:59:59Z',duration_seconds:3600} // Previous Sunday excluded
];
const totals=studyWeeklyTotals(rows,kstFridayMidnight.thisWeek,secondsFor);
assert.deepEqual(totals.days,['2026-11-16','2026-11-17','2026-11-18','2026-11-19','2026-11-20']);
assert.deepEqual(totals.seconds,[3600,5400,7200,1800,9120]);
assert.equal(totals.totalSeconds,27120);
assert.deepEqual(studyWeeklyTotals([],kstFridayMidnight.thisWeek,secondsFor).seconds,[0,0,0,0,0]);

const source=readFileSync(new URL('../js/study.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../study.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../css/study.css',import.meta.url),'utf8');
assert.match(source,/\.in\('week_start',\[weeks\.thisWeek,week\]\)/,
 'both weeks should be fetched for the selected plan and current-week stats');
assert.match(source,/currentPlan=plans\.find\(row=>row\.week_start===weeks\.thisWeek\)/);
assert.match(source,/weekly=sessions\.filter\(s=>kstDate\(s\.started_at\)>=weeks\.thisWeek/);
assert.match(source,/updateWeeklyHours\(weeks\.thisWeek\)/);
assert.doesNotMatch(source,/study-stats-heading'\)\.textContent=isNextWeek/,
 'weekly stats must not switch to next week on Fridays');
assert.match(source,/todaySelected=mondayOf\(today\)===weeks\.thisWeek/);
assert.match(source,/if\(week===weeks\.thisWeek\)currentPlan=plan/);
for(let i=0;i<5;i++){
 assert.ok(html.includes('id="study-weekday-date-'+i+'"'));
 assert.ok(html.includes('id="study-weekday-total-'+i+'"'));
}
assert.match(html,/id="study-week-range"/);
assert.match(html,/js\/study\.js\?v=20261128-performance-1/);
assert.match(css,/study-weekly-days/);
assert.match(css,/@media\(max-width:760px\)/);
console.log('PASS: current-week weekday totals remain stable while Friday next-week planning opens.');
