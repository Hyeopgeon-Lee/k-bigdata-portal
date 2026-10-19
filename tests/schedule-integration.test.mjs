import assert from "node:assert/strict";
import vm from "node:vm";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {services} from "../js/services.js";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const gs=read("apps-script/department-calendar/Code.gs");
const js=read("js/schedule.js");
const page=read("schedule.html");
const config=read("data/schedule-config.js");

assert.ok(services.some(s=>s.id==="schedule"&&s.url==="schedule.html"));
assert.match(config,/SCHEDULE_API_URL\s*=\s*"(?:https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec)?"/);
assert.match(page,/id="schedule-sync-status"/);
assert.match(page,/\(학과\)/);
assert.match(js,/readPublishedSchedules/);
assert.match(js,/e\.published===true/);
assert.match(js,/window\[name\]/);
assert.match(js,/Asia\/Seoul/);
assert.match(gs,/everyMinutes\(10\)/);
assert.ok(!gs.includes("function doPost("));

const store={"SPREADSHEET_ID":"fake-private-sheet","LAST_SYNC_AT":"2026-10-19 18:00:00","SYNC_OK":"true"};
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
 console:{...console,error:()=>{}},
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
  computeDigest:(_,value)=>Array.from(createHash("sha256").update(value).digest()),
  DigestAlgorithm:{SHA_256:"SHA_256"},
  base64EncodeWebSafe:bytes=>Buffer.from(bytes).toString("base64url")
 },
 ContentService:{
  MimeType:{JAVASCRIPT:"application/javascript",JSON:"application/json"},
  createTextOutput:content=>({setMimeType:type=>({content,type})})
 }
});
vm.runInContext(gs,context,{filename:"Code.gs"});
assert.equal(context.departmentCalendar_(),defaultCalendar);
assert.equal(secondaryReads,0,"secondary room calendars must never be read");
store.CALENDAR_ID="ignored-secondary-calendar";
assert.equal(context.departmentCalendar_(),defaultCalendar);
assert.equal(secondaryReads,0);

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
assert.equal(context.eventPublicRow_(event(" (학과) 앞 공백")),null);
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
store.SYNC_OK="false";
const failed=JSON.parse(context.doGet({parameter:{}}).content);
assert.equal(failed.ok,false);
assert.equal(failed.events.length,0,"failed sync must not serve stale published events");
assert.ok(!JSON.stringify(failed).includes("fake-private-sheet"));
store.SYNC_OK="true";
privateRows[0][1]="</script><script>alert(1)</script>";
assert.ok(!context.doGet({parameter:{callback:"safe"}}).content.includes("<"));

// 실행/저장/트리거 서비스는 모의 객체로 검증합니다. 실제 Google 실행과 구분합니다.
let savedRows=[],calendarEvents=[],triggers=[],createdSheets=0;
const sheet={
 getLastRow:()=>savedRows.length+1,
 setFrozenRows:()=>{},
 getRange:(row,col,count,width)=>({
  setNumberFormat:format=>{assert.equal(format,"@");},
  setValues:values=>{if(row===2)savedRows=values.map(r=>Array.from(r));},
  getValues:()=>savedRows,
  clearContent:()=>{savedRows=[];}
 })
};
const spreadsheet={getId:()=>"fake-private-sheet",getUrl:()=>"private-sheet-url",
 getSheets:()=>[{setName:()=>{}}],getSheetByName:()=>sheet,
 setSpreadsheetTimeZone:tz=>assert.equal(tz,"Asia/Seoul")};
context.SpreadsheetApp={openById:()=>spreadsheet,create:()=>{createdSheets++;return spreadsheet;},flush:()=>{}};
context.LockService={getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>{}})};
context.Logger={log:()=>{}};
context.ScriptApp={getProjectTriggers:()=>triggers,
 deleteTrigger:t=>{triggers=triggers.filter(x=>x!==t);},
 newTrigger:name=>({timeBased:()=>({everyMinutes:n=>{
  assert.equal(n,10);return {create:()=>triggers.push({getHandlerFunction:()=>name})};
 }})})};
defaultCalendar.getEvents=()=>calendarEvents;
delete store.SPREADSHEET_ID;
context.setupDepartmentCalendar();
context.setupDepartmentCalendar();
assert.equal(createdSheets,1,"setup must reuse its private spreadsheet");
assert.equal(triggers.length,1,"setup must not duplicate synchronization triggers");
calendarEvents=[event("(학과) [시험] 등록 테스트"),event("개인 회의")];
context.syncDepartmentCalendar();
assert.equal(savedRows.length,1);
assert.equal(savedRows[0][1],"등록 테스트");
calendarEvents=[event("(학과) [시험] 제목 수정")];
context.syncDepartmentCalendar();
assert.equal(savedRows[0][1],"제목 수정");
calendarEvents=[event("(학과) 날짜 변경","DEFAULT",false,"2026-10-21T01:00:00Z","2026-10-21T02:00:00Z")];
context.syncDepartmentCalendar();
assert.equal(savedRows[0][3],"2026-10-21");
calendarEvents=[event("접두어 제거")];
context.syncDepartmentCalendar();
assert.equal(savedRows.length,0);
calendarEvents=[event("(학과) 반복","DEFAULT",false,"2026-10-21T01:00:00Z","2026-10-21T02:00:00Z"),
 event("(학과) 반복","DEFAULT",false,"2026-10-22T01:00:00Z","2026-10-22T02:00:00Z")];
context.syncDepartmentCalendar();
assert.equal(new Set(savedRows.map(r=>r[0])).size,2,"recurring instances must have distinct IDs");
calendarEvents=[];
context.syncDepartmentCalendar();
assert.equal(savedRows.length,0,"deleted events must disappear");
defaultCalendar.getEvents=()=>{throw new Error("private credential error");};
assert.throws(()=>context.syncDepartmentCalendar());
assert.equal(store.SYNC_OK,"false");
assert.equal(JSON.parse(context.doGet({parameter:{}}).content).events.length,0);
console.log("PASS (mock services): setup reuse, one trigger, create/edit/move/delete/unpublish, recurring IDs, failed sync.");
console.log("PASS: primary calendar only, exact prefix, private-event filtering, safe publication, timezone, JSONP read-only response.");
