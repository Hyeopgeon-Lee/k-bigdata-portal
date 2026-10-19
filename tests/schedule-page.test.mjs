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
assert.ok(html.includes('id="schedule-register-form"'));
assert.ok(!html.includes('Google 캘린더에서 제목이'));
assert.ok(js.includes('e.published===true'));
assert.ok(js.includes('timeZone:"Asia/Seoul"'));
assert.ok(js.includes('parseDate('));
assert.ok(js.includes('secureLink('));
assert.ok(css.includes("@media(max-width:767px)"));
assert.ok(html.includes('id="schedule-action-status"'),"delete result status is required");
assert.ok(html.includes('class="schedule-register-pair"'),"date/time fields stay paired");
assert.ok(js.includes('e.source==="portal"'),"only verified portal entries render delete control");
assert.ok(js.includes('kbigdata-schedule-delete'),"deleted event response is checked");
assert.ok(css.includes(".schedule-delete-button"),"schedule deletion control has a visible style");
console.log("PASS: schedule page, filtered display, public registration and mobile UI.");
