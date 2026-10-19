import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root=new URL("../",import.meta.url);
const source=fs.readFileSync(new URL("apps-script/department-calendar/PublicRegistration.gs",root),"utf8");
const store={};const created=[];let locked=false,syncs=0;
let published=[];
const props={getProperty:key=>store[key]||null,setProperty:(key,value)=>{store[key]=value;},
 setProperties:values=>Object.assign(store,values),getProperties:()=>({...store}),deleteProperty:key=>{delete store[key];}};
class Clock extends Date{constructor(...args){super(...(args.length?args:["2026-10-19T03:00:00Z"]));}}
const context=vm.createContext({Date:Clock,console:{error:()=>{}},
 PropertiesService:{getScriptProperties:()=>props},
 CalendarApp:{
  Visibility:{PRIVATE:"PRIVATE",CONFIDENTIAL:"CONFIDENTIAL"},
  getDefaultCalendar:()=>({
    createEvent:(...args)=>createMockEvent(false,args),
    createAllDayEvent:(...args)=>createMockEvent(true,args),
    getEvents:()=>created.filter(e=>!e.deleted)
  })
 },
 SpreadsheetApp:{openById:()=>({getSheetByName:()=>({
  getLastRow:()=>published.length+1,
  getRange:()=>({getValues:()=>published})
 })})},
 LockService:{getScriptLock:()=>({waitLock:()=>{assert.equal(locked,false);locked=true;},releaseLock:()=>{locked=false;}})},
 HtmlService:{XFrameOptionsMode:{ALLOWALL:"ALLOWALL"},createHtmlOutput:html=>({html,setXFrameOptionsMode(){return this;}})},
 Utilities:{formatDate:(date,zone)=>new Intl.DateTimeFormat("sv-SE",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit"}).format(date)}
});
function createMockEvent(allDay,args){
 const tags={};
 const evt={allDay,args,deleted:false,
  setTag:(key,value)=>{tags[key]=value;return evt;},getTag:key=>tags[key]||null,
  getVisibility:()=>"DEFAULT",getTitle:()=>args[0],
  getStartTime:()=>args[1],getEndTime:()=>args[2],
  isAllDayEvent:()=>allDay,getId:()=>"mock-event-"+(created.length+1),
  deleteEvent:()=>{evt.deleted=true;}
 };
 created.push(evt);return evt;
}
vm.runInContext(fs.readFileSync(new URL("apps-script/department-calendar/Code.gs",root),"utf8"),context);
vm.runInContext(source,context);
context.syncDepartmentCalendar=()=>{assert.equal(locked,false);syncs++;};
const request={action:"register",requestId:"a".repeat(32),title:"(학과) 발표회",category:"project",
 startDate:"2026-10-20",endDate:"2026-10-20",startTime:"10:00",endTime:"11:00",allDay:"false",website:""};
assert.equal(context.registerPublicSchedule_(request).ok,true);
assert.equal(created[0].args[0],"(학과) [프로젝트] 발표회");
assert.equal(created[0].getTag("kbigdata_portal_registration"),"portal-v1");
assert.equal(created[0].args[1].toISOString(),"2026-10-20T01:00:00.000Z");
assert.equal(created[0].args.length,3,"do not accept guests, descriptions or locations");
assert.equal(context.registerPublicSchedule_(request).duplicate,true);
assert.equal(created.length,1,"retries must not create duplicates");
assert.equal(context.registrationInput_({...request,title:"(하과) (학과) 발표회"}).title,"(학과) [프로젝트] 발표회");
context.registerPublicSchedule_({...request,requestId:"b".repeat(32),allDay:"true",endDate:"2026-10-22"});
assert.equal(created[1].allDay,true);
assert.equal(created[1].args[2].toISOString(),"2026-10-22T15:00:00.000Z","inclusive date converts to exclusive end");
for(const invalid of [
 {action:"delete"},{title:"(학과) "},{title:"x".repeat(101)},{category:"unknown"},
 {startDate:"2027-02-30"},{endTime:"09:00"},{startDate:"2026-10-18"},
 {endDate:"2026-12-25"},{website:"bot"},{requestId:"bad"},
 {startTime:"24:00"},{endDate:"2026-10-19"}
])assert.throws(()=>context.registrationInput_({...request,...invalid}),JSON.stringify(invalid));
store.REGISTRATION_COUNT="50";
assert.equal(context.registerPublicSchedule_({...request,requestId:"c".repeat(32)}).ok,false);
assert.equal(created.length,2);
store.REGISTRATION_COUNT="2";
const reply=context.doPost({parameter:{...request,requestId:"d".repeat(32),title:"<img src=x onerror=alert(1)>"}});
assert.ok(reply.html.includes('"ok":true'));
assert.ok(reply.html.includes('"https://portal.k-bigdata.kr"'));
assert.ok(!reply.html.includes("onerror"));
assert.equal(syncs,1);
assert.equal(context.doPost({parameter:{...request,action:"delete"}}).html.includes('"ok":false'),true);
// 원본 Google 캘린더 일정은 제목이 동일해도 공개 삭제가 불가능해야 합니다.
const native={...createMockEvent(false,["(학과) [시험] 관리자 일정",
 new Date("2026-10-20T01:00:00Z"),new Date("2026-10-20T02:00:00Z")])};
const nativeRow=context.eventPublicRow_(native);
const portalRow=context.eventPublicRow_(created[0]);
assert.equal(nativeRow[8],"calendar");
assert.equal(portalRow[8],"portal");
store.SPREADSHEET_ID="fake-private-sheet";
store.SYNC_OK="true";
published=[nativeRow,portalRow];
const deleteRequest={action:"delete",requestId:"f".repeat(32),id:nativeRow[0],website:""};
const denied=context.doPost({parameter:deleteRequest}).html;
assert.ok(denied.includes('"ok":false'));
assert.equal(native.deleted,false);
assert.equal(syncs,1);
const deleted=context.doPost({parameter:{...deleteRequest,id:portalRow[0]}}).html;
assert.ok(deleted.includes('"ok":true'));
assert.equal(created[0].deleted,true);
assert.equal(syncs,2);
assert.ok(context.doPost({parameter:{...deleteRequest,id:"x".repeat(28)}}).html.includes('"ok":false'));
assert.ok(context.doPost({parameter:{...deleteRequest,id:"invalid"}}).html.includes('"ok":false'));
context.departmentCalendar_=()=>{throw new Error("private-calendar-id-token");};
const failure=context.doPost({parameter:{...request,requestId:"e".repeat(32)}}).html;
assert.ok(failure.includes('"ok":false'));
assert.ok(!failure.includes("private-calendar-id-token"));
const manifest=JSON.parse(fs.readFileSync(new URL("apps-script/department-calendar/appsscript.json",root)));
assert.ok(manifest.oauthScopes.includes("https://www.googleapis.com/auth/calendar"));
console.log("PASS: anonymous registration and tagged-portal-only deletion, native event protection, KST, validation, idempotency and quota.");
