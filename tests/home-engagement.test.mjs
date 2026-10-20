import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  TODAY_TASKS,DAILY_STATE_KEY,koreaDay,freshDailyState,validDailyState,
  completedPracticalCount,makeDailyPlan
} from "../js/home-engagement-core.mjs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const day="2026-10-20";
const ts=time=>Date.parse(time);
assert.equal(koreaDay(ts("2026-10-20T14:59:59Z")),"2026-10-20","KST day boundary before midnight");
assert.equal(koreaDay(ts("2026-10-20T15:00:00Z")),"2026-10-21","KST day boundary after midnight");
assert.equal(Object.keys(TODAY_TASKS).length,2,"two independent grades");
assert.equal(TODAY_TASKS["1"].length,3);
assert.equal(TODAY_TASKS["2"].length,3);
assert.equal(TODAY_TASKS["1"][0].id,"practical");
assert.equal(TODAY_TASKS["2"][0].id,"recruit");
assert.equal(DAILY_STATE_KEY,"kbigdata:daily-plan:v1");
const attempts=[
  {questionId:"A",submittedAt:ts("2026-10-20T04:00:00Z"),viewedExplanation:true,autoRevealed:false,correct:false},
  {questionId:"A",submittedAt:ts("2026-10-20T05:00:00Z"),viewedExplanation:true,autoRevealed:false,correct:true},
  {questionId:"B",submittedAt:ts("2026-10-20T09:00:00Z"),viewedExplanation:true,autoRevealed:false,correct:true},
  {questionId:"C",submittedAt:ts("2026-10-20T10:00:00Z"),viewedExplanation:true,autoRevealed:true},
  {questionId:"D",submittedAt:ts("2026-10-20T10:00:00Z"),viewedExplanation:false},
  {questionId:"E",submittedAt:ts("2026-10-19T10:00:00Z"),viewedExplanation:true,autoRevealed:false}
];
assert.equal(completedPracticalCount(attempts,day),2,"only distinct, finished, manually submitted questions from today");
assert.equal(completedPracticalCount(null,day),0);
assert.equal(completedPracticalCount([],day),0);
const broken={date:day,byGrade:{"1":{docs:"yes",project:true,practical:true},"2":{recruit:true,interview:true,practical:true}}};
const normalized=validDailyState(broken,day);
assert.deepEqual(normalized.byGrade["1"],{project:true},"only valid manual task completions accepted");
assert.deepEqual(normalized.byGrade["2"],{recruit:true,interview:true},"no fake practical completion accepted");
assert.deepEqual(validDailyState(broken,"2026-10-21"),freshDailyState("2026-10-21"),"next day resets manual checklist");
const first=makeDailyPlan("1",attempts,normalized,day);
assert.equal(first.completed,2,"first year has verified practice and checked project");
assert.equal(first.next.id,"docs","next activity skips completed goals");
const second=makeDailyPlan("2",attempts,normalized,day);
assert.equal(second.completed,3,"second year count kept independently");
assert.equal(second.next.id,"recruit","completion state still provides a useful review action");
const blank=makeDailyPlan("2",[],freshDailyState(day),day);
assert.equal(blank.completed,0);
assert.equal(blank.next.id,"recruit","second year starts with recruitment");
assert.equal(makeDailyPlan("1",[],freshDailyState(day),day).next.id,"practical","first year starts with coding");
const html=read("index.html"),css=read("css/home-engagement.css"),ui=read("js/home-engagement.js");
for(const id of ["home-today","home-today-subtitle","home-today-primary","home-today-progress","home-today-list","home-today-status"])
  assert.ok(html.includes('id="'+id+'"'),id+" is mounted");
assert.ok(html.indexOf('id="home-alerts-title"')<html.indexOf('id="home-today"'));
assert.ok(html.indexOf('id="home-today"')<html.indexOf('id="home-practical-title"'));
assert.ok(html.includes('js/home-engagement.js?v=20261020-engagement-1'));
assert.ok(html.includes('css/home-engagement.css?v=20261020-engagement-1'));
assert.ok(ui.includes('kbigdata:home-gradechange'),"grade changes refresh the checklist");
assert.ok(ui.includes('visibilitychange'),"practice progress refreshes on return");
assert.ok(ui.includes('aria-pressed'),"manual completion is accessible");
assert.ok(css.includes('@media(max-width:767px)'),"mobile layout is present");
assert.ok(css.includes('min-width:0'),"dashboard supports narrow screens");
console.log("PASS: grade-specific daily goals, authentic practical count, independent local marks, daily reset and integration contracts.");
