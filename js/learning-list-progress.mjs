/* Per-question summary displayed by the three public-facing quiz lists.
 * The cloud progress table is authoritative; historical browser records are
 * shown separately and are never added to cloud counts. */
import {fetchLearningProgress} from "./learning-activity.mjs?v=20261116-concurrency-1";

export function progressDate(value){
 const date=new Date(value);
 if(!Number.isFinite(date.getTime()))return "";
 const parts=new Intl.DateTimeFormat("en-US",{
  timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"
 }).formatToParts(date);
 const byType=Object.fromEntries(parts.map(p=>[p.type,p.value]));
 return [byType.year,byType.month,byType.day].join(".");
}
const positiveCount=value=>Number.isFinite(Number(value))?Math.max(0,Math.floor(Number(value))):0;

export function describeQuestionProgress(cloud,local,phase="ready"){
 const count=positiveCount(cloud?.attempts_count);
 if(count>0)return {
  kind:"done",count,source:"cloud",
  date:progressDate(cloud.last_attempt_at),
  text:"풀이 완료 · "+count+"회"+(progressDate(cloud.last_attempt_at)?" · 최근 "+progressDate(cloud.last_attempt_at):"")
 };
 const deviceCount=positiveCount(local?.count);
 if(deviceCount>0||local?.exists===true){
  const day=progressDate(local?.lastAttemptAt);
  return {kind:"local",count:deviceCount,source:"device",date:day,
   text:"이 기기 풀이 기록 · "+(deviceCount?deviceCount+"회":"횟수 미확인")+(day?" · 최근 "+day:"")+" · 서버 확인 전"};
 }
 if(phase==="loading")return {kind:"loading",count:0,source:"none",date:"",text:"풀이 기록 확인 중"};
 if(phase==="error")return {kind:"unknown",count:0,source:"none",date:"",text:"서버 기록을 확인하지 못했습니다"};
 if(phase==="login")return {kind:"unknown",count:0,source:"none",date:"",text:"로그인 후 풀이 기록 확인"};
 return {kind:"unseen",count:0,source:"cloud",date:"",text:"미풀이 · 기록 없음"};
}

export function createLearningProgressStore({bank,localRecord=()=>null,onChange=()=>{}}){
 if(!["coding","practical","ncp"].includes(bank))throw new Error("INVALID_PROGRESS_BANK");
 let cloudRows=new Map(),phase="loading",inFlight=null,refreshAgain=false,lastUpdated=0;
 const get=id=>describeQuestionProgress(cloudRows.get(id),localRecord(id),phase);
 function changed(){try{onChange();}catch(error){console.warn("Progress view update failed",error);}}
 async function refresh(){
  if(inFlight){refreshAgain=true;return inFlight;}
  if(!globalThis.portalLearning?.read||Date.now()>=(globalThis.portalLearning?.expires||0)){
   phase="login";cloudRows.clear();changed();return;
  }
  inFlight=(async()=>{
   try{
    const rows=await fetchLearningProgress(bank);
    cloudRows=new Map(rows.filter(r=>r.bank===bank).map(row=>[row.question_id,row]));
    phase="ready";lastUpdated=Date.now();
   }catch(error){
    phase=cloudRows.size?"ready":"error";
    console.warn("Question progress unavailable",bank,error?.code||error?.message||error);
   }finally{changed();}
  })();
  try{await inFlight;}
  finally{
   inFlight=null;
   if(refreshAgain){refreshAgain=false;void refresh();}
  }
 }
 function attach(){
  globalThis.window?.addEventListener("portal-learning-ready",()=>void refresh());
  globalThis.document?.addEventListener("portal-learning-sync",event=>{
   if(event.detail?.state==="saved")void refresh();
   else if(event.detail?.state==="pending")changed();
  });
  globalThis.window?.addEventListener("online",()=>void refresh());
  globalThis.document?.addEventListener("visibilitychange",()=>{
   if(!document.hidden&&Date.now()-lastUpdated>10000)void refresh();
  });
  void refresh();
 }
 return {get,refresh,attach,get phase(){return phase;}};
}
