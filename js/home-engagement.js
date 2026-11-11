import {koreaDay,freshDailyState,makeDailyPlan} from "./home-engagement-core.mjs";
import {getPreferences} from "./practical-store.js";
const $=id=>document.getElementById(id);
const root=$("home-today"),list=$("home-today-list");
const db=()=>globalThis.portalSupabaseClient;
const canWrite=()=>globalThis.portalLearning?.write===true;
const make=(tag,cls,txt)=>{
 const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el;
};
const state={day:koreaDay(),manual:freshDailyState(),attempts:[],custom:[],userId:null,loaded:false,busy:false,error:""};
const grade=()=>document.body.dataset.homeGrade==="2"?"2":"1";
const practiceUrl=()=>{
 try{const id=getPreferences().lastQuestionId;if(typeof id==="string"&&/^[A-Za-z0-9_-]{1,80}$/.test(id))return "practical.html?id="+encodeURIComponent(id);}catch{}
 return "practical.html";
};
const linkTo=task=>task.id==="practical"?practiceUrl():task.url||"#home-today";
const notify=(message)=>{$("home-today-status").textContent=message;};
function todayRange(day){
 const from=new Date(day+"T00:00:00+09:00");
 return [from.toISOString(),new Date(from.getTime()+86400000).toISOString()];
}
async function load(){
 if(!root||!db()||!globalThis.portalLearning?.read||state.busy)return;
 state.busy=true;const day=koreaDay(),[start,end]=todayRange(day);
 try{
  const {data:{user},error:userError}=await db().auth.getUser();
  if(userError||!user)throw userError||Error("로그인이 필요합니다.");
  state.userId=user.id;
  const [checks,custom,attempts]=await Promise.all([
   db().from("daily_task_checks").select("task_key").eq("user_id",user.id).eq("task_date",day),
   db().from("personal_tasks").select("id,title,due_date,status,completed_at").eq("user_id",user.id).lte("due_date",day).order("created_at",{ascending:false}).limit(100),
   db().from("learning_attempts").select("question_id,result,submitted_at").eq("user_id",user.id).eq("bank","practical").gte("submitted_at",start).lt("submitted_at",end).limit(200)
  ]);
  if(checks.error||custom.error||attempts.error)throw checks.error||custom.error||attempts.error;
  const daily=freshDailyState(day);
  for(const entry of checks.data||[]){
   const [g,id]=String(entry.task_key).split(":");
   if(daily.byGrade[g]&&["docs","project","recruit","interview"].includes(id))daily.byGrade[g][id]=true;
  }
  state.day=day;state.manual=daily;
  state.custom=(custom.data||[]).filter(item=>item.status==="open"||(item.completed_at&&koreaDay(Date.parse(item.completed_at))===day));
  state.attempts=(attempts.data||[]).filter(item=>item.result!=="timeout").map(item=>({
   questionId:item.question_id,submittedAt:Date.parse(item.submitted_at),viewedExplanation:true,autoRevealed:false
  }));
  state.loaded=true;state.error="";render();
 }catch(error){
  state.error="개인 학습 정보를 불러오지 못했습니다. 새로고침해 다시 시도해 주세요.";
  console.error("Daily tasks sync failed",error);render();
 }finally{state.busy=false;}
}
function render(){
 if(!root||!list)return;
 const current=makeDailyPlan(grade(),state.attempts,state.manual,state.day);
 const custom=state.custom.map(t=>({...t,done:t.status==="done"}));
 const completed=current.completed+custom.filter(t=>t.done).length;
 const total=current.total+custom.length;
 const next=current.tasks.find(t=>!t.done)||custom.find(t=>!t.done);
 const finished=state.loaded&&completed===total;
 $("home-today-subtitle").textContent=grade()==="1"
  ?"코딩과 자격증 학습을 꾸준히 준비하세요."
  :"채용·기술면접·자격증을 오늘의 행동으로 연결하세요.";
 $("home-today-recommendation").textContent=finished?"오늘의 할 일을 모두 마쳤습니다!":next?.title||"오늘의 학습을 시작하세요";
 $("home-today-recommendation-detail").textContent=finished
  ?"완료한 활동은 계정에 기록되며 다른 기기에서도 확인할 수 있습니다."
  :next?.detail||"나에게 필요한 할 일을 등록해 보세요.";
 const action=$("home-today-primary");
 action.href=next?linkTo(next):"practical.html";
 action.textContent=finished?"다시 연습하기 →":next?.url||next?.id==="practical"?"지금 시작하기 →":"목록에서 확인하기 ↓";
 $("home-today-count").textContent=completed+" / "+total;
 $("home-today-progress").max=Math.max(1,total);
 $("home-today-progress").value=completed;
 const fragment=document.createDocumentFragment();
 for(const task of current.tasks){
  const row=make("li","home-today-task"+(task.done?" is-done":""));
  const badge=make("span","home-today-task-check",task.done?"✓":"○");badge.setAttribute("aria-hidden","true");
  const body=make("span","home-today-task-body"),anchor=make("a","home-today-task-link",task.title);
  anchor.href=linkTo(task);body.append(anchor);
  body.append(make("span","home-today-task-detail",task.automatic?"학습기록 자동 집계 · "+task.count+" / "+task.total+"문제":"본인이 활동 후 완료 표시"));
  row.append(badge,body);
  if(task.automatic)row.append(make("span","home-today-auto",task.done?"완료":"풀이 후 반영"));
  else{
   const btn=make("button","home-today-mark",task.done?"완료 취소":"완료 표시");
   btn.type="button";btn.dataset.dailyTask=grade()+":"+task.id;btn.disabled=!state.loaded||!canWrite();
   btn.setAttribute("aria-pressed",String(task.done));row.append(btn);
  }
  fragment.append(row);
 }
 for(const item of custom){
  const row=make("li","home-today-task"+(item.done?" is-done":""));
  row.append(make("span","home-today-task-check",item.done?"✓":"○"));
  const body=make("span","home-today-task-body");
  body.append(make("span","home-today-task-link",item.title));
  body.append(make("span","home-today-task-detail",item.due_date<state.day?"미완료 이월 · "+item.due_date:"개인 할 일"));
  row.append(body);
  const mark=make("button","home-today-mark",item.done?"완료 취소":"완료 표시");
  mark.type="button";mark.dataset.personalId=item.id;mark.disabled=!canWrite();mark.setAttribute("aria-pressed",String(item.done));
  row.append(mark);
  const del=make("button","home-today-delete","삭제");del.type="button";del.dataset.personalDelete=item.id;del.disabled=!canWrite();del.setAttribute("aria-label",item.title+" 삭제");
  row.append(del);fragment.append(row);
 }
 list.replaceChildren(fragment);
 notify(state.error||(!state.loaded?"개인 학습 정보를 불러오는 중입니다.":!canWrite()?"읽기 전용 계정입니다. 학습 내용은 열람만 가능합니다.":"완료 정보는 계정에 저장되어 PC와 모바일에 동기화됩니다."));
 const form=$("home-custom-task-form");if(form)form.hidden=!state.loaded||!canWrite();
}
async function changeDaily(key){
 const [g,id]=key.split(":");
 const allowed={1:["docs","project"],2:["recruit","interview"]};
 if(!state.loaded||!canWrite()||!allowed[g]?.includes(id))return;
 const already=state.manual.byGrade[g]?.[id]===true;
 const query=already
  ? db().from("daily_task_checks").delete().eq("user_id",state.userId).eq("task_date",state.day).eq("task_key",key)
  : db().from("daily_task_checks").upsert({user_id:state.userId,task_date:state.day,task_key:key},{onConflict:"user_id,task_date,task_key"});
 const {error}=await query;
 if(error)throw error;
}
async function updateCustom(id,mode){
 const item=state.custom.find(row=>row.id===id);
 if(!item||!canWrite())return;
 if(mode==="delete"){
  if(!window.confirm("선택한 개인 할 일을 삭제하시겠습니까?"))return;
  const {error}=await db().from("personal_tasks").delete().eq("user_id",state.userId).eq("id",id);
  if(error)throw error;
 }else{
  const status=item.status==="done"?"open":"done";
  const {error}=await db().from("personal_tasks").update({status,completed_at:status==="done"?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq("user_id",state.userId).eq("id",id);
  if(error)throw error;
 }
}
function ensureForm(){
 const tracker=root?.querySelector(".home-today-tracker");
 if(!tracker||$("home-custom-task-form"))return;
 const form=make("form","home-custom-task-form");form.id="home-custom-task-form";
 const input=make("input");input.name="title";input.type="text";input.required=true;input.maxLength=100;input.placeholder="나의 할 일 추가";input.setAttribute("aria-label","오늘 할 일 입력");
 const submit=make("button",null,"추가");submit.type="submit";form.append(input,submit);
 tracker.append(form);
 form.addEventListener("submit",async event=>{
  event.preventDefault();if(!state.loaded||!canWrite()||state.busy)return;
  const title=input.value.trim();if(!title||title.length>100)return;
  submit.disabled=true;
  try{
   const {error}=await db().from("personal_tasks").insert({user_id:state.userId,title,due_date:koreaDay()});
   if(error)throw error;
   input.value="";await load();
  }catch(error){console.error(error);notify("할 일을 저장하지 못했습니다. 다시 시도해 주세요.");}
  finally{submit.disabled=false;}
 });
}
if(root&&list){
 ensureForm();render();
 list.addEventListener("click",async event=>{
  const btn=event.target.closest?.("button[data-daily-task],button[data-personal-id],button[data-personal-delete]");
  if(!btn||btn.disabled||state.busy)return;
  btn.disabled=true;
  try{
   if(btn.dataset.dailyTask)await changeDaily(btn.dataset.dailyTask);
   else await updateCustom(btn.dataset.personalId||btn.dataset.personalDelete,btn.dataset.personalDelete?"delete":"toggle");
   await load();
  }catch(error){console.error(error);notify("변경사항을 저장하지 못했습니다. 다시 시도해 주세요.");btn.disabled=false;}
 });
 window.addEventListener("kbigdata:home-gradechange",render);
 window.addEventListener("portal-learning-ready",()=>void load());
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)void load();});
 window.addEventListener("pageshow",()=>void load());
 if(globalThis.portalLearning?.read)void load();
}
