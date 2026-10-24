import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  scheduleShareUrl,scheduleShareText,bandWebShareUrl,bandAppShareUrl,buildScheduleIcs
} from "../js/schedule-sharing.js";

const schedule={
  id:"A".repeat(28),title:"실무 프로젝트 발표, 결과 공유",
  category:"project",targetGrade:"2",
  startDate:"2026-11-01",endDate:"2026-11-01",startTime:"09:00",
  published:true,source:"calendar"
};
const link=new URL(scheduleShareUrl(schedule));
assert.equal(link.origin,"https://portal.k-bigdata.kr");
assert.equal(link.pathname,"/schedule.html");
assert.equal(link.searchParams.get("date"),"2026-11-01");
assert.equal(link.searchParams.get("event"),schedule.id);
assert.equal(new URL(scheduleShareUrl({...schedule,id:"bad id"})).searchParams.has("event"),false);
assert.ok(scheduleShareText(schedule).includes("2학년"));
assert.ok(scheduleShareText(schedule).includes("09:00"));
assert.ok(scheduleShareText(schedule).includes(scheduleShareUrl(schedule)));

const band=new URL(bandWebShareUrl(schedule));
assert.equal(band.origin,"https://band.us");
assert.equal(band.pathname,"/plugin/share");
assert.equal(band.searchParams.get("route"),"portal.k-bigdata.kr");
assert.equal(band.searchParams.get("body"),scheduleShareText(schedule));
assert.ok(bandAppShareUrl(schedule).startsWith("bandapp://create/post?text="));
assert.ok(bandAppShareUrl(schedule).includes(encodeURIComponent(scheduleShareText(schedule))));

const date=new Date("2026-10-24T00:00:00Z");
const timed=buildScheduleIcs(schedule,date);
assert.ok(timed.includes("BEGIN:VCALENDAR\r\n"));
assert.ok(timed.includes("DTSTART;TZID=Asia/Seoul:20261101T090000"));
assert.ok(!timed.includes("DTEND;TZID=Asia/Seoul:"),"published API does not contain end time");
assert.ok(timed.includes("DTSTAMP:20261024T000000Z"));
assert.ok(timed.includes("END:VCALENDAR\r\n"));
const complete=buildScheduleIcs({...schedule,endTime:"11:00"},date);
assert.ok(complete.includes("DTEND;TZID=Asia/Seoul:20261101T110000"));
const whole=buildScheduleIcs({...schedule,startTime:"",endDate:"2026-11-03"},date);
assert.ok(whole.includes("DTSTART;VALUE=DATE:20261101"));
assert.ok(whole.includes("DTEND;VALUE=DATE:20261104"),"inclusive source end date converted to exclusive iCal end");
const long=buildScheduleIcs({...schedule,title:"긴 일정 ".repeat(70)},date);
for(const line of long.split("\r\n")) assert.ok(Buffer.byteLength(line,"utf8")<=75,"iCal line folding limit");

const js=readFileSync(new URL("../js/schedule.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../css/schedule.css",import.meta.url),"utf8");
const html=readFileSync(new URL("../schedule.html",import.meta.url),"utf8");
for(const action of ["밴드 공유","링크 복사","캘린더 저장"]){
  assert.ok(js.includes(action),"missing sharing action: "+action);
}
assert.ok(js.includes('e.source==="portal"'),"portal-only deletion must remain");
assert.ok(js.includes("e.published===true"),"public-only projection must remain");
assert.ok(js.includes("selectLinkedEvent"),"shared link resolves specific event");
assert.ok(css.includes(".schedule-share-button"));
assert.ok(html.includes("20261024-share-1"),"asset cache busting required");
console.log("PASS: Band post URLs, per-event deep links, iCalendar KST, inclusive days, no invented end time, accessible actions.");
