import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
import {services} from "../js/services.js";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const gs=read("apps-script/department-calendar/Code.gs");
const js=read("js/schedule.js");
const page=read("schedule.html");
const config=read("data/schedule-config.js");

assert.ok(services.some(s=>s.id==="schedule"&&s.url==="schedule.html"));
assert.match(config,/SCHEDULE_API_URL\s*=\s*""/);
assert.match(page,/id="schedule-sync-status"/);
assert.match(page,/\(학과\)/);
assert.match(js,/readPublishedSchedules/);
assert.match(js,/e\.published===true/);
assert.match(js,/window\[name\]/);
assert.match(js,/Asia\/Seoul/);
assert.match(gs,/everyMinutes\(10\)/);
assert.ok(!gs.includes("function doPost("));

const store={"SPREADSHEET_ID":"fake-private-sheet","LAST_SYNC_AT":"2026-10-19 18:00:00"};
const props={
 getProperty:key=>store[key]||null,
 setProperty:(key,value)=>{store[key]=value;},
 setProperties:values=>Object.assign(store,values)
};
let secondaryReads=0;
const defaultCalendar={getEvents:()=>[]};
const fmt = (date,mask) => {
 const parts=new Intl.DateTimeFormat("en-CA",{
  timeZone:"Asia/Seoul", year:"numeric",month:"2-digit",day:"2-digit",
  hour:"2-digit",minute:"2-digit",hourCycle:"h23"
 }).formatToParts(date);
 const get=part=>parts.find(x=>x.type===part)?.value;
 return mask==="HH:mm" ? get("hour")+":"+get("minute")
  :get("year")+"-"+get("month")+"-"+get("day");
};
const privateRows=[["safe-id","시험 안내","exam","2026-10-20","2026-10-20","10:30",false,true]];
const context=vm.createContext({
 console,
 Date, String, Object,
 PropertiesService:{getScriptProperties:()=>props},
 CalendarApp:{
  Visibility:{DEFAULT:"DEFAULT",PRIVATE:"PRIVATE",CONFIDENTIAL:"CONFIDENTIAL",PUBLIC:"PUBLIC"},
  getDefaultCalendar:()=>defaultCalendar,
  getCalendarById:()=>{secondaryReads++;return null;}
 },
 SpreadsheetApp:{
  openById:id=>{
   assert.equal(id,"fake-private-sheet");
   return {getSheetByName:()=>({
    getLastRow:()=>2,
    getRange:()=>({getValues:()=>privateRows})
   })};
  }
 },
 Utilities:{
  formatDate:(date,tz,mask)=>{assert.equal(tz,"Asia/Seoul");return fmt(date,mask);},
  computeDigest:()=>[1,2,3,4],
  DigestAlgorithm:{SHA_256:"SHA_256"},
  base64EncodeWebSafe:()=>"stable123"
 },
 ContentService:{
  MimeType:{JAVASCRIPT:"application/javascript",JSON:"application/json"},
  createTextOutput:content=>({setMimeType:type=>({content,type})})
 }
});
vm.runInContext(gs,context,{filename:"Code.gs"});
assert.equal(context.departmentCalendar_(),defaultCalendar);
assert.equal(secondaryReads,0,"secondary room calendars must never be read");

function event(title,visibility="DEFAULT",allDay=false,start="2026-10-20T01:30:00Z",end="2026-10-20T02:30:00Z"){
 return {
  getVisibility:()=>visibility,getTitle:()=>title,
  getStartTime:()=>new Date(start),getEndTime:()=>new Date(end),
  getId:()=>("private-calendar-id-do-not-publish"),
  isAllDayEvent:()=>allDay,
  getDescription:()=>{throw new Error("description read unexpectedly")},
  getGuestList:()=>{throw new Error("guest list read unexpectedly")},
  getLocation:()=>{throw new Error("location read unexpectedly")}
 };
}
assert.equal(context.eventPublicRow_(event("개인 진료 예약")),null);
assert.equal(context.eventPublicRow_(event("주간회의 (학과) 참고")),null);
assert.equal(context.eventPublicRow_(event("(학과) 비공개","PRIVATE")),null);
assert.equal(context.eventPublicRow_(event("(학과) 비밀","CONFIDENTIAL")),null);
const row=context.eventPublicRow_(event("(학과) [시험] 중간고사"));
assert.equal(row[1],"중간고사");
assert.equal(row[2],"exam");
assert.equal(row[3],"2026-10-20");
assert.equal(row[4],"2026-10-20");
assert.equal(row[5],"10:30");
assert.equal(row.length,8);
assert.equal(row[7],true);
assert.ok(!row.join(" ").includes("private-calendar-id"));
const allDay=context.eventPublicRow_(event("(학과) [프로젝트] 발표","DEFAULT",true,
  "2026-10-19T15:00:00Z","2026-10-20T15:00:00Z"));
assert.equal(allDay[3],"2026-10-20");
assert.equal(allDay[4],"2026-10-20","all-day end is exclusive");
assert.equal(allDay[5],"");
const formula=context.eventPublicRow_(event("(학과) =IMPORTXML(\"https://example.org\")"));
assert.ok(formula[1].startsWith("'="),"spreadsheet formula injection should be escaped");
const data=context.doGet({parameter:{callback:"__kCallback"}});
assert.equal(data.type,"application/javascript");
assert.match(data.content,/^__kCallback\(/);
const raw=JSON.parse(data.content.slice("__kCallback(".length,-2));
assert.equal(raw.ok,true);
assert.equal(raw.events.length,1);
assert.equal(raw.events[0].title,"시험 안내");
assert.equal(raw.events[0].published,true);
assert.equal(Object.hasOwn(raw.events[0],"description"),false);
assert.equal(Object.hasOwn(raw.events[0],"attendees"),false);
assert.equal(Object.hasOwn(raw.events[0],"calendarId"),false);
assert.equal(Object.hasOwn(raw.events[0],"place"),false);
assert.equal(context.doGet({parameter:{callback:"alert(1)"}}).type,"application/json");
console.log("PASS: primary calendar only, exact prefix, private-event filtering, safe publication, timezone, JSONP read-only response.");
