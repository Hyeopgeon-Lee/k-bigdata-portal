import {recordLearningAttempt} from "./learning-activity.mjs?v=20261116-concurrency-1";
export {reviewControls,gradeLabels} from "./study-review.js?v=20261116-concurrency-1";
import {gradeLabels} from "./study-review.js?v=20261116-concurrency-1";
export function bindReview(container,eventData,previous,onSaved){
 const buttons=[...container.querySelectorAll("[data-grade]")],status=container.querySelector("[role=status]");
 let result=previous||null,attemptId=eventData.clientAttemptId||crypto.randomUUID(),busy=false;
 function mark(){for(const b of buttons){b.disabled=busy;b.setAttribute("aria-pressed",String(b.dataset.grade===result));}}
 mark();if(result)status.textContent="내 기록 · "+gradeLabels[result]+" · 다른 결과를 선택해 수정할 수 있습니다.";
 for(const b of buttons)b.addEventListener("click",async()=>{
  const next=b.dataset.grade;if(busy||next===result)return;
  const correction=!!result, nextId=correction?crypto.randomUUID():attemptId;
  busy=true;mark();status.textContent="저장 중…";
  try{
   const response=await recordLearningAttempt({...eventData,clientAttemptId:nextId,result:next,gradingMethod:"self",metadata:{...eventData.metadata,assessment:"student_self_review",evaluation:next,...(correction?{corrects_attempt_id:attemptId}:{})}});
   if(response.state!=="saved"&&response.state!=="pending")throw new Error("READONLY");
   result=next;attemptId=nextId;onSaved(result,attemptId);
   status.textContent=gradeLabels[result]+(response.state==="saved"?" · 저장됨":" · 동기화 대기")+" · 결과 수정 가능";
  }catch(e){status.textContent="저장하지 못했습니다. 다시 선택해 주세요.";}finally{busy=false;mark();}
 });
}
