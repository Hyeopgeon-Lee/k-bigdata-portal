// Explicit one-time legacy import only. Never migrate a previous user's local data silently.
import {getAccount} from "./learning-auth.js";
import {recordCloudAttempt,flushCloudAttempts,saveCloudDraft} from "./learning-sync.js";
import {ncpQuestions} from "../data/ncp-questions.js";
const safe=(str,fallback)=>{try{return JSON.parse(str)||fallback;}catch{return fallback;}};
export async function importLegacyLearning(){
 const account=await getAccount();if(!account.active)throw Error("승인된 재학생만 기존 기록을 가져올 수 있습니다.");
 if(!confirm("이 브라우저의 기존 학습기록이 현재 로그인한 본인의 기록인지 확인하세요. 다른 학생의 기록이 섞여 있다면 취소해야 합니다. 가져오시겠습니까?"))return {cancelled:true};
 let attempts=0,drafts=0;
 const coding=safe(localStorage.getItem("kbigdata:coding:done:v1"),[]);
 if(Array.isArray(coding))for(const id of coding.filter(x=>/^[A-Za-z0-9_-]{1,90}$/.test(x))){
  await recordCloudAttempt({bank:"coding",questionId:id,clientAttemptId:"legacy-coding-"+id,result:"completed",gradingMethod:"completion"});
  attempts++;
 }
 for(let i=0;i<localStorage.length;i++){
  const key=localStorage.key(i)||"";
  if(!key.startsWith("kbigdata:coding:draft:v1:"))continue;
  const id=key.replace("kbigdata:coding:draft:v1:","");
  if(!/^[A-Za-z0-9_-]{1,90}$/.test(id))continue;
  await saveCloudDraft("coding",id,localStorage.getItem(key)||"");drafts++;
 }
 const ncp=safe(localStorage.getItem("k-bigdata-ncp-progress-v1"),{});
 const ncpById=new Map(ncpQuestions.map(q=>[q.id,q]));
 for(const [id,answer] of Object.entries(ncp)){
  const q=ncpById.get(id);if(!q||!["A","B","C","D"].includes(answer?.choice))continue;
  const date=Date.parse(answer.at);
  await recordCloudAttempt({bank:"ncp",questionId:id,clientAttemptId:"legacy-ncp-"+id,
   result:answer.choice===q.answer?"correct":"incorrect",gradingMethod:"automatic",answerText:answer.choice,
   submittedAt:Number.isFinite(date)?new Date(date).toISOString():new Date().toISOString()});
  attempts++;
 }
 const practical=safe(localStorage.getItem("kbigdata-practical-v1"),[]);
 if(Array.isArray(practical)){
  for(const a of practical){
   if(typeof a?.id!=="string"||typeof a.questionId!=="string"||!a.viewedExplanation||(!a.autoRevealed&&typeof a.correct!=="boolean"))continue;
   const stamp=Number(a.submittedAt);if(!Number.isFinite(stamp))continue;
   const result=a.autoRevealed?"timeout":a.correct?"correct":"incorrect";
   await recordCloudAttempt({bank:"practical",questionId:a.questionId,clientAttemptId:"legacy-"+a.id,
    result,gradingMethod:a.autoRevealed?"none":a.grading==="self"?"self":"automatic",
    answerText:String(a.answer||""),elapsedSeconds:Number(a.elapsedSeconds)||0,usedHint:!!a.usedHint,
    submittedAt:new Date(stamp).toISOString(),metadata:{importedLegacy:true}});
   attempts++;
  }
 }
 await flushCloudAttempts();
 return {attempts,drafts};
}
