// Compact read-only preview of published department events.
// Reuses the schedule page's public endpoint and 30-minute local snapshot.
// No private Google Calendar event or credential is read or cached.
import {SCHEDULE_API_URL} from "../data/schedule-config.js?v=20261019-google-calendar-live-1";
import {publishedGrade} from "../data/calendar-grade-bridge.js?v=20261020-synced-1";

const root = document.getElementById("home-schedule-list");
const gradeHeading = document.getElementById("dashboard-schedule-title");
const selectedGrade = () => document.body.dataset.homeGrade === "2" ? "2" : "1";
const PUBLIC_API_PATTERN = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
const CACHE_KEY = "kbigdata:published-schedule:v2:" + SCHEDULE_API_URL;
const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_EVENTS = 4000;
const CATEGORIES = Object.freeze({
  academic:"학사",exam:"시험",project:"프로젝트",
  employment:"취업",certificate:"자격증",event:"행사"
});
const weekdayFormatter = new Intl.DateTimeFormat("ko-KR",{timeZone:"UTC",weekday:"short"});
const todayKst = () => {
  const parts = new Intl.DateTimeFormat("en-US",{
    timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(new Date());
  const get = key => parts.find(part => part.type === key)?.value;
  return get("year")+"-"+get("month")+"-"+get("day");
};
const isDate = value => {
  if(typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const date = new Date(value+"T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value;
};
const create = (tag,className,content) => {
  const element = document.createElement(tag);
  if(className)element.className=className;
  if(content!==undefined)element.textContent=content;
  return element;
};
const publishedEvents = values => (Array.isArray(values)?values:[])
  .filter(event=>event && typeof event==="object" && event.published===true &&
    typeof event.title==="string" && event.title.trim() &&
    Object.hasOwn(CATEGORIES,event.category) && isDate(event.startDate) &&
    isDate(event.endDate||event.startDate) &&
    (event.endDate||event.startDate)>=event.startDate)
  .slice(0,MAX_EVENTS)
  .map(event=>{
    const rawTitle=event.title.trim().slice(0,140);
    const tag=rawTitle.match(/^\[(1학년|2학년)\]\s*(.*)$/);
    const targetGrade=publishedGrade(event,tag?tag[2].trim():rawTitle);
    return {
    title:tag?tag[2].trim():rawTitle,
    targetGrade,
    category:event.category,
    startDate:event.startDate,
    endDate:event.endDate||event.startDate,
    startTime:typeof event.startTime==="string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(event.startTime)
      ?event.startTime:"",
    published:true
  };
  });
const startDay = date => new Date(date+"T00:00:00Z");
const dayLabel = (date,today) => {
  const [year,month,day] = date.split("-");
  const dayName = weekdayFormatter.format(startDay(date));
  return (year===today.slice(0,4)?"":year+".")+
    Number(month)+"."+Number(day)+"("+dayName+")";
};
const eventDateLabel = (event,today) => event.startDate===event.endDate
  ?dayLabel(event.startDate,today)
  :dayLabel(event.startDate,today)+" ~ "+dayLabel(event.endDate,today);
const makeEvent = (event,today) => {
  const entry=create("li","home-schedule-item");
  const url="schedule.html?date="+encodeURIComponent(event.startDate<=today?today:event.startDate);
  const link=create("a","home-schedule-link");
  link.href=url;
  const date=create("span","home-schedule-date");
  const start=event.startDate<=today && event.endDate>=today?today:event.startDate;
  date.append(create("span","home-schedule-day",start.slice(5).replace("-",".")));
  const days=Math.round((startDay(event.startDate)-startDay(today))/86400000);
  const countdown=event.startDate<today?"진행 중":days===0?"오늘":"D-"+days;
  const countdownEl=create("span","home-schedule-countdown",countdown);
  countdownEl.dataset.urgency=days<=3?"critical":days<=7?"soon":"normal";
  date.append(countdownEl);
  const body=create("span","home-schedule-text");
  body.append(create("span","home-schedule-title",event.title));
  const meta=create("span","home-schedule-meta");
  meta.append(create("span","home-schedule-category",CATEGORIES[event.category]));
  if(event.targetGrade!=="all")meta.append(create("span","home-schedule-grade",event.targetGrade+"학년"));
  meta.append(create("span","",eventDateLabel(event,today)+(event.startTime?" · "+event.startTime:" · 종일")));
  body.append(meta);
  link.append(date,body,create("span","home-schedule-arrow","→"));
  link.setAttribute("aria-label",event.title+", "+eventDateLabel(event,today)+
    (event.startTime?" "+event.startTime:" 종일")+", 전체 일정에서 확인");
  entry.append(link);
  return entry;
};
const empty = (destination,message) => destination?.replaceChildren(create("p","dashboard-schedule-empty",message));
let currentPublishedEvents=[];
const visibleToGrade = (event,grade) => grade==="1" ? event.targetGrade==="1" : event.targetGrade==="2"||event.targetGrade==="all";
const sortedUpcoming = (events,today,limit=2) => events.filter(event=>event.endDate>=today)
  .sort((a,b)=>{
    const activeA=a.startDate<=today?0:1,activeB=b.startDate<=today?0:1;
    return activeA-activeB || a.startDate.localeCompare(b.startDate) ||
      a.startTime.localeCompare(b.startTime) || a.title.localeCompare(b.title,"ko");
  }).slice(0,limit);
function renderList(destination,events,today,message){
  if(!destination)return;
  if(!events.length){empty(destination,message);return;}
  const list=create("ul","home-schedule-items");
  events.forEach(event=>list.append(makeEvent(event,today)));
  destination.replaceChildren(list);
}
const render = events => {
  currentPublishedEvents=events;
  const today=todayKst();
  const grade=selectedGrade();
  if(gradeHeading)gradeHeading.textContent=grade==="1"?"1학년 주요 일정":"2학년 · 공통 일정";
  const permitted=events.filter(event=>visibleToGrade(event,grade));
  renderList(root,sortedUpcoming(permitted,today,grade==="1"?3:2),today,
    grade==="1"?"현재 공개된 1학년 대상 예정 일정이 없습니다."
      :"현재 공개된 2학년·공통 예정 일정이 없습니다.");
};
window.addEventListener("kbigdata:home-gradechange",()=>render(currentPublishedEvents));
const readCache = () => {
  try{
    const saved=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");
    const age=Date.now()-saved?.savedAt;
    if(saved?.version!==1||!Number.isFinite(age)||age<0||
      age>CACHE_TTL_MS||!Array.isArray(saved.events)||saved.events.length>MAX_EVENTS)return null;
    return publishedEvents(saved.events);
  }catch{return null;}
};
const writeCache = (events,updatedAt) => {
  try{
    if(events.length>MAX_EVENTS)return;
    const payload=JSON.stringify({version:1,savedAt:Date.now(),updatedAt:updatedAt||"",events});
    if(payload.length<750000)localStorage.setItem(CACHE_KEY,payload);
  }catch{ /* Disabled or full local storage must not block the preview. */ }
};
function getPublishedCalendar(){
  return new Promise((resolve,reject)=>{
    const url=new URL(SCHEDULE_API_URL);
    const callback="__kBigdataHomeSchedule_"+Date.now().toString(36)+"_"+
      Math.random().toString(36).slice(2,10);
    url.searchParams.set("callback",callback);
    const script=document.createElement("script");
    let finished=false;
    let timer;
    const finish=(error,data)=>{
      if(finished)return;
      finished=true;
      clearTimeout(timer);
      script.remove();
      delete window[callback];
      if(error)reject(error);else resolve(data);
    };
    window[callback]=data=>finish(null,data);
    script.async=true;
    script.src=url.href;
    script.onerror=()=>finish(new Error("일정 요청 실패"));
    timer=setTimeout(()=>finish(new Error("일정 요청 시간 초과")),15000);
    document.head.append(script);
  });
}
let activeLoad=null;
async function refresh(){
  if(activeLoad)return activeLoad;
  const work=(async()=>{
    if(!PUBLIC_API_PATTERN.test(SCHEDULE_API_URL)){
      empty(root,"학과 일정 연결을 확인할 수 없습니다. 전체 일정을 이용해 주세요.");
      return;
    }
    try{
      const response=await getPublishedCalendar();
      if(response?.ok!==true||!Array.isArray(response.events))
        throw new Error("공개 일정 응답 오류");
      const next=publishedEvents(response.events);
      render(next);
      writeCache(next,response.updatedAt);
    }catch(error){
      // Match schedule.html fail-closed behavior: no unverified stale calendar content.
      try{localStorage.removeItem(CACHE_KEY);}catch{}
      currentPublishedEvents=[];
      empty(root,"일정을 불러오지 못했습니다. 전체 일정에서 다시 확인해 주세요.");
      console.error("Department schedule preview load failed",error);
    }
  })();
  activeLoad=work;
  try{return await work;}finally{activeLoad=null;}
}
if(root){
  const cached=readCache();
  if(cached!==null)render(cached);
  refresh();
  setInterval(()=>{if(document.visibilityState==="visible")refresh();},600000);
  window.addEventListener("storage",event=>{
    if(event.key!==CACHE_KEY||!event.newValue)return;
    const snapshot=readCache();
    if(snapshot!==null)render(snapshot);
  });
}
