import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {services,portalNavLinks} from "../js/services.js";
import {schedules} from "../data/schedules.js";

const read = path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const html=read("schedule.html");
const js=read("js/schedule.js");
const css=read("css/schedule.css");

assert.ok(services.some(item=>item.id==="schedule"&&item.url==="schedule.html"&&item.category==="campus"));
assert.ok(portalNavLinks.some(item=>item.id==="schedule"&&item.group==="campus"));
assert.ok(Array.isArray(schedules));
assert.equal(schedules.length,0,"unverified sample events must not be shown as real schedules");
for(const id of ["schedule-query","schedule-days","schedule-prev","schedule-next",
  "schedule-today","schedule-day-events","schedule-upcoming-list","schedule-result-status"]){
  assert.ok(html.includes('id="'+id+'"'),id+" is required");
}
for(const category of ["academic","exam","project","employment","certificate","event"]){
  assert.ok(html.includes('data-category="'+category+'"'),category+" filter is required");
}
assert.match(html,/<meta name="robots" content="noindex, nofollow">/);
assert.ok(html.includes('js/analytics.js'));
assert.ok(html.includes('data-learning-nav'));
assert.ok(html.includes('css/schedule.css'));
assert.ok(html.includes('js/schedule.js'));
assert.ok(!html.includes('accounts.google.com') && !html.includes('calendar.google.com'));
assert.ok(!html.includes('type="password"'));
assert.ok(!html.includes('일정 등록</button>'));
assert.ok(js.includes('e.published===true'));
assert.ok(js.includes('timeZone:"Asia/Seoul"'));
assert.ok(js.includes('parseDate('));
assert.ok(js.includes('secureLink('));
assert.ok(css.includes("@media(max-width:767px)"));
console.log("PASS: schedule page, filtered public display, campus navigation and read-only mobile UI.");
