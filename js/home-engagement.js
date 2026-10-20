// Student-facing daily action dashboard: two grades, no account and no network.
import {DAILY_STATE_KEY,PRACTICAL_STATE_KEY,koreaDay,freshDailyState,validDailyState,makeDailyPlan} from "./home-engagement-core.mjs";
import {getAttempts,getPreferences} from "./practical-store.js";
const root=document.getElementById("home-today");
const list=document.getElementById("home-today-list");
const $=id=>document.getElementById(id);
let fallback=freshDailyState();
let storageFailure=false;
const make=(tag,className,text)=>{
  const el=document.createElement(tag);
  if(className)el.className=className;
  if(text!==undefined)el.textContent=text;
  return el;
};
function readState(day){
  try{
    const raw=localStorage.getItem(DAILY_STATE_KEY);
    return raw?validDailyState(JSON.parse(raw),day):freshDailyState(day);
  }catch{
    storageFailure=true;
    return validDailyState(fallback,day);
  }
}
function persist(state){
  fallback=state;
  try{localStorage.setItem(DAILY_STATE_KEY,JSON.stringify(state));storageFailure=false;return true;}
  catch{storageFailure=true;return false;}
}
function grade(){return document.body.dataset.homeGrade==="2"?"2":"1";}
function practiceUrl(){
  try{
    const id=getPreferences().lastQuestionId;
    if(typeof id==="string" && /^[A-Za-z0-9_-]{1,80}$/.test(id))
      return "practical.html?id="+encodeURIComponent(id);
  }catch{}
  return "practical.html";
}
function plan(){
  const day=koreaDay();
  return makeDailyPlan(grade(),getAttempts(),readState(day),day);
}
function linkTo(task){
  return task.id==="practical"?practiceUrl():task.url;
}
function render(){
  if(!root||!list)return;
  const current=plan();
  const firstYear=current.grade==="1";
  $("home-today-subtitle").textContent=firstYear
    ?"짧은 코딩 연습부터 시작해 개발 역량을 쌓아 보세요."
    :"채용 확인과 면접·실기 학습을 오늘의 행동으로 연결하세요.";
  $("home-today-recommendation").textContent=current.completed===current.total
    ?"오늘의 할 일을 모두 마쳤습니다!"
    :current.next.title;
  $("home-today-recommendation-detail").textContent=current.completed===current.total
    ?"수고했습니다. 원하면 문제를 다시 풀거나 내일 새로운 목표를 시작하세요."
    :current.next.detail;
  const action=$("home-today-primary");
  action.href=linkTo(current.next);
  action.textContent=current.completed===current.total?"다시 연습하기 →":"지금 시작하기 →";
  $("home-today-count").textContent=current.completed+" / "+current.total;
  $("home-today-progress").max=current.total;
  $("home-today-progress").value=current.completed;
  const fragment=document.createDocumentFragment();
  for(const task of current.tasks){
    const row=make("li","home-today-task"+(task.done?" is-done":""));
    const badge=make("span","home-today-task-check",task.done?"✓":"○");
    badge.setAttribute("aria-hidden","true");
    const body=make("span","home-today-task-body");
    const anchor=make("a","home-today-task-link",task.title);
    anchor.href=linkTo(task);
    body.append(anchor);
    const meta=make("span","home-today-task-detail",
      task.automatic?"자동 집계 · "+task.count+" / "+task.total+"문제":"본인이 활동 후 완료 표시");
    body.append(meta);
    row.append(badge,body);
    if(!task.automatic){
      const button=make("button","home-today-mark",task.done?"완료 취소":"완료 표시");
      button.type="button";
      button.dataset.dailyTask=task.id;
      button.setAttribute("aria-pressed",String(task.done));
      button.setAttribute("aria-label",task.title+" "+(task.done?"완료 표시 취소":"직접 완료 표시"));
      row.append(button);
    }else{
      row.append(make("span","home-today-auto",task.done?"완료":"풀이 후 반영"));
    }
    fragment.append(row);
  }
  list.replaceChildren(fragment);
  $("home-today-status").textContent=storageFailure
    ?"저장 기능이 제한되어 완료 표시가 이 기기에 유지되지 않을 수 있습니다."
    :"실기 풀이 기록은 자동 반영되고, 다른 활동은 직접 표시합니다. 기록은 이 브라우저에만 저장됩니다.";
}
function recordEvent(taskId,done,gradeValue){
  if(location.hostname!=="portal.k-bigdata.kr" || typeof window.gtag!=="function")return;
  window.gtag("event","portal_daily_task_mark",{
    task_key:taskId,audience_grade:gradeValue,action_status:done?"complete":"undo"
  });
}
if(root&&list){
  render();
  list.addEventListener("click",event=>{
    const button=event.target.closest?.("button[data-daily-task]");
    if(!button)return;
    const day=koreaDay(),current=grade();
    const state=readState(day);
    const id=button.dataset.dailyTask;
    if(!["1","2"].includes(current)||!["docs","project","recruit","interview"].includes(id))return;
    const allowed=current==="1"?["docs","project"]:["recruit","interview"];
    if(!allowed.includes(id))return;
    const done=!state.byGrade[current][id];
    if(done)state.byGrade[current][id]=true;
    else delete state.byGrade[current][id];
    const saved=persist(state);
    render();
    list.querySelector('button[data-daily-task="'+id+'"]')?.focus({preventScroll:true});
    if(saved)recordEvent(id,done,current);
  });
  window.addEventListener("kbigdata:home-gradechange",render);
  window.addEventListener("pageshow",render);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")render();});
  window.addEventListener("storage",event=>{
    if([DAILY_STATE_KEY,PRACTICAL_STATE_KEY,"kbigdata-practical-preferences-v1"].includes(event.key))render();
  });
}
