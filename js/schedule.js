import {schedules} from "../data/schedules.js?v=20261019-1";
import {SCHEDULE_API_URL} from "../data/schedule-config.js?v=20261019-google-calendar-1";

const $ = selector => document.querySelector(selector);
const CATEGORIES = Object.freeze({
  academic:"학사",exam:"시험",project:"프로젝트",
  employment:"취업",certificate:"자격증",event:"행사"
});
const isoUTC = date => date.toISOString().slice(0,10);
const parseDate = value => {
  if(typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value+"T00:00:00Z");
  return !Number.isNaN(date.getTime()) && isoUTC(date) === value ? date : null;
};
const kstToday = () => {
  const parts = new Intl.DateTimeFormat("en-US",{
    timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(new Date());
  const read = key => parts.find(part=>part.type === key)?.value;
  return read("year")+"-"+read("month")+"-"+read("day");
};
const longDate = value => {
  const parsed = parseDate(value);
  return parsed ? new Intl.DateTimeFormat("ko-KR",{
    timeZone:"UTC",month:"long",day:"numeric",weekday:"short"
  }).format(parsed) : value;
};
const dateLabel = (start,end) => start === end ? longDate(start) : longDate(start)+" ~ "+longDate(end);
const diffDays = (a,b) => Math.round((parseDate(a)-parseDate(b))/86400000);
const secureLink = value => {
  if(typeof value!=="string")return null;
  try{const url=new URL(value);return url.protocol==="https:"?url.href:null;}catch{return null;}
};
const item = (tag,className,text) => {
  const el=document.createElement(tag);
  if(className) el.className=className;
  if(text!==undefined)el.textContent=text;
  return el;
};

const today = kstToday();
const queryDate = new URLSearchParams(location.search).get("date");
let selectedDate = parseDate(queryDate)?queryDate:today;
let visibleMonth = selectedDate.slice(0,7);
let activeCategory = "all";
let keyword = "";

const normalizeEvents = source => (Array.isArray(source)?source:[])
  .filter(e=>e&&typeof e==="object"&&e.published===true&&
    typeof e.title==="string"&&e.title.trim().length>0&&
    Object.hasOwn(CATEGORIES,e.category)&&parseDate(e.startDate)&&
    parseDate(e.endDate||e.startDate)&& (e.endDate||e.startDate)>=e.startDate)
  .map(e=>({...e,endDate:e.endDate||e.startDate,title:e.title.trim()}))
  .sort((a,b)=>a.startDate.localeCompare(b.startDate)||
    (a.startTime||"").localeCompare(b.startTime||"")||a.title.localeCompare(b.title,"ko"));
let events=normalizeEvents(schedules);

const currentEvents = () => events.filter(e =>
  (activeCategory==="all"||e.category===activeCategory)&&
  (keyword===""||[e.title,e.description,e.place,CATEGORIES[e.category]]
    .some(value=>String(value||"").toLocaleLowerCase("ko").includes(keyword)))
);

function renderEvent(e, showCountdown=false) {
  const el=item("li","schedule-event");
  const top=item("div","schedule-event-top");
  const category=item("span","schedule-event-category",CATEGORIES[e.category]);
  category.dataset.category=e.category;
  top.append(category);
  if(showCountdown){
    const days=diffDays(e.startDate,today);
    const caption=days>0?"D-"+days:days===0?"D-DAY":"진행 중";
    top.append(item("span","schedule-event-dday",caption));
  }
  el.append(top,item("h4","schedule-event-title",e.title));
  const timing=dateLabel(e.startDate,e.endDate)+(e.startTime?" · "+e.startTime:"");
  el.append(item("p","schedule-event-time",timing+(e.place?" · "+e.place:"")));
  if(e.description)el.append(item("p","schedule-event-description",e.description));
  const href=secureLink(e.url);
  if(href){
    const a=item("a","schedule-event-link","관련 안내 보기 ↗");
    a.href=href;a.target="_blank";a.rel="noopener noreferrer";
    el.append(a);
  }
  return el;
}
function addEvents(root, rows, emptyMessage, showCountdown=false){
  root.replaceChildren();
  if(!rows.length){root.append(item("p","schedule-empty",emptyMessage));return;}
  const list=item("ul","schedule-event-list");
  rows.forEach(e=>list.append(renderEvent(e,showCountdown)));
  root.append(list);
}
function renderDay(){
  $("#schedule-day-title").textContent=longDate(selectedDate)+" 일정";
  const result=currentEvents().filter(e=>e.startDate<=selectedDate&&e.endDate>=selectedDate);
  addEvents($("#schedule-day-events"),result,"선택한 날짜에 등록된 일정이 없습니다.");
}
function renderUpcoming(){
  const items=currentEvents().filter(e=>e.endDate>=today);
  $("#schedule-upcoming-count").textContent=items.length+"건";
  addEvents($("#schedule-upcoming-list"),items.slice(0,8),
    events.length?"조건에 맞는 예정 일정이 없습니다.":"현재 공개된 주요 일정이 없습니다.",true);
  const note=$("#schedule-result-status");
  note.textContent=items.length>8?"가까운 일정 8건을 우선 표시합니다.":"";
}
function renderCalendar(){
  const [year,month]=visibleMonth.split("-").map(Number);
  const first=new Date(Date.UTC(year,month-1,1));
  const start=new Date(first);
  start.setUTCDate(1-first.getUTCDay());
  const root=$("#schedule-days");
  root.replaceChildren();
  $("#schedule-month-label").textContent=year+"년 "+month+"월";
  const rows=currentEvents();
  for(let offset=0;offset<42;offset++){
    const date=new Date(start);
    date.setUTCDate(start.getUTCDate()+offset);
    const key=isoUTC(date);
    const dayEvents=rows.filter(e=>e.startDate<=key&&e.endDate>=key);
    const button=item("button","schedule-day");
    button.type="button";button.dataset.date=key;
    if(key.slice(0,7)!==visibleMonth)button.classList.add("is-outside");
    if(key===today)button.classList.add("is-today");
    if(key===selectedDate)button.classList.add("is-selected");
    button.setAttribute("aria-pressed",String(key===selectedDate));
    button.setAttribute("aria-label",
      key+(key===today?" 오늘":"")+(dayEvents.length?" 일정 "+dayEvents.length+"건":""));
    button.append(item("span","schedule-day-number",String(date.getUTCDate())));
    const meta=item("span","schedule-day-meta");
    if(dayEvents.length){
      meta.append(item("span","schedule-day-dot"));
      meta.append(item("span","",String(dayEvents.length)+"건"));
    }
    button.append(meta);
    button.addEventListener("click",()=>{
      selectedDate=key;
      visibleMonth=key.slice(0,7);
      renderCalendar();
      renderDay();
    });
    root.append(button);
  }
}
function render(){
  renderCalendar();
  renderDay();
  renderUpcoming();
}
function moveMonth(offset){
  const [year,month]=visibleMonth.split("-").map(Number);
  const next=new Date(Date.UTC(year,month-1+offset,1));
  visibleMonth=isoUTC(next).slice(0,7);
  selectedDate=visibleMonth+"-01";
  render();
}
$("#schedule-prev").addEventListener("click",()=>moveMonth(-1));
$("#schedule-next").addEventListener("click",()=>moveMonth(1));
$("#schedule-today").addEventListener("click",()=>{
  selectedDate=today;visibleMonth=today.slice(0,7);render();
});
$("#schedule-query").addEventListener("input",e=>{
  keyword=e.target.value.trim().toLocaleLowerCase("ko");
  render();
});
document.querySelectorAll(".schedule-filters button[data-category]").forEach(button=>{
  button.addEventListener("click",()=>{
    activeCategory=button.dataset.category;
    document.querySelectorAll(".schedule-filters button[data-category]").forEach(b=>
      b.setAttribute("aria-pressed",String(b===button)));
    render();
  });
});
render();

/** Google Apps Script ContentService는 타 도메인에서 CORS가 보장되지 않아 JSONP로 조회합니다.
 * callback은 안전한 JS 식별자만 전송하며, 응답은 읽기 전용 공개 데이터뿐입니다.
 */
function readPublishedSchedules(urlString) {
  return new Promise((resolve,reject)=>{
    const url = new URL(urlString);
    const name="__kBigdataSchedule_"+Date.now().toString(36)+"_"+
      Math.random().toString(36).slice(2,10);
    const script=document.createElement("script");
    let finished=false;
    const finish=(err,data)=>{
      if(finished)return;
      finished=true;
      window.clearTimeout(timer);
      script.remove();
      delete window[name];
      if(err)reject(err);else resolve(data);
    };
    url.searchParams.set("callback",name);
    window[name]=value=>finish(null,value);
    script.src=url.href;
    script.async=true;
    script.onerror=()=>finish(new Error("일정 조회 요청 실패"));
    const timer=window.setTimeout(()=>finish(new Error("일정 조회 시간 초과")),15000);
    document.head.append(script);
  });
}
async function loadPublicCalendar() {
  const status=$("#schedule-sync-status");
  // 공개 Google Apps Script URL 외에는 신뢰하지 않습니다.
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(SCHEDULE_API_URL)){
    status.textContent="캘린더 자동 연동 준비 중 · 관리자가 연동을 설정하면 학과 일정이 표시됩니다.";
    return;
  }
  status.textContent="공개된 학과 일정을 불러오는 중입니다…";
  try {
    const response=await readPublishedSchedules(SCHEDULE_API_URL);
    if(response?.ok!==true||!Array.isArray(response.events))throw new Error("일정 응답 오류");
    // 원격 응답은 공개 필드만 취하며 장소/설명/링크는 표시하지 않습니다.
    events=normalizeEvents(response.events.map(e=>e && ({
      id:e.id,title:e.title,category:e.category,startDate:e.startDate,
      endDate:e.endDate,startTime:typeof e.startTime==="string"&&/^([01]\d|2[0-3]):[0-5]\d$/.test(e.startTime)?e.startTime:"",
      important:e.important===true,published:e.published===true
    })));
    render();
    status.textContent=response.updatedAt
      ? "학과 일정 최근 동기화: "+response.updatedAt+" (한국시간)"
      : "공개된 학과 일정 "+events.length+"건을 불러왔습니다.";
  }catch(error){
    events=[];
    render();
    console.error("Department schedule load failed",error);
    status.textContent="일정을 가져오지 못했습니다. 잠시 후 새로고침해 주세요.";
  }
}
loadPublicCalendar();
if(/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(SCHEDULE_API_URL)){
  // 열린 페이지도 관리자가 공개한 최신 일정으로 갱신합니다.
  setInterval(()=>{
    if(document.visibilityState==="visible")loadPublicCalendar();
  },600000);
}
