import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../apps-script/department-calendar.gs",import.meta.url),"utf8");
const sample=(title,options={})=>({
  getTitle:()=>title,
  getId:()=>title,
  getVisibility:()=>options.private?"private":"default",
  isAllDayEvent:()=>Boolean(options.allDay),
  getAllDayStartDate:()=>new Date("2026-11-10T00:00:00+09:00"),
  getAllDayEndDate:()=>new Date("2026-11-12T00:00:00+09:00"),
  getStartTime:()=>new Date("2026-11-10T09:00:00+09:00"),
  getEndTime:()=>new Date("2026-11-10T11:00:00+09:00")
});
function harness(){
 const sampleEvents=[
  sample("개인 병원 방문"),
  sample("(학과) [시험] 중간고사"),
  sample("(학과) [프로젝트] 졸업작품 발표",{allDay:true}),
  sample("(학과) 내부 협의",{private:true}),
  sample("부모님 생신 (학과)")
 ];
 const calendar={getEvents:()=>sampleEvents};
 const cache={get:()=>null,put:()=>{}};
 const context={
  Date,JSON,Math,Number,String,RegExp,isNaN,Error,
  CalendarApp:{getDefaultCalendar:()=>calendar,Visibility:{PRIVATE:"private"}},
  CacheService:{getScriptCache:()=>cache},
  Utilities:{formatDate:(v,tz,fmt)=>{
   const p=new Intl.DateTimeFormat("en-CA",{
    timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit",
    ...(fmt==="HH:mm"?{hour:"2-digit",minute:"2-digit",hourCycle:"h23"}:{})
   }).formatToParts(v);
   const x=k=>p.find(p=>p.type===k)?.value;
   return fmt==="HH:mm"?x("hour")+":"+x("minute"):x("year")+"-"+x("month")+"-"+x("day");
  }},
  ContentService:{MimeType:{JSON:"json",JAVASCRIPT:"js"},createTextOutput:text=>({
   text,setMimeType(type){this.type=type;return this}
  })}
 };
 vm.createContext(context);
 vm.runInContext(source,context);
 return context;
}

test("public feed excludes personal and Private events and strips the prefix",()=>{
 const h=harness();
 const data=h.getDepartmentEvents_("2026-11-01","2026-12-01");
 assert.equal(data.ok,true);
 assert.equal(data.events.length,2);
 assert.deepEqual(Array.from(data.events,e=>e.title),["중간고사","졸업작품 발표"]);
 assert.deepEqual(Array.from(data.events,e=>e.category),["exam","project"]);
 assert.equal(data.events[1].endDate,"2026-11-11");
 assert.equal(data.events[0].startTime,"09:00");
 assert.equal(data.events[1].startTime,"");
 assert.ok(data.events.every(e=>!Object.hasOwn(e,"description")&&!Object.hasOwn(e,"attendees")));
});

test("invalid range returns generic error and JSONP only uses restricted callback",()=>{
 const h=harness();
 const bad=h.doGet({parameter:{start:"2026-02-30",end:"2026-03-01",prefix:"alert"}});
 assert.equal(bad.type,"json");
 assert.match(bad.text,/"ok":false/);
 const good=h.doGet({parameter:{start:"2026-11-01",end:"2026-12-01",prefix:"__departmentScheduleCallback_test"}});
 assert.equal(good.type,"js");
 assert.ok(good.text.startsWith("__departmentScheduleCallback_test("));
});
