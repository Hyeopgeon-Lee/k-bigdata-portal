import {recordLearningAttempt,correctCodingGrade} from "./learning-activity.mjs?v=20261127-grade-correction-1";

export const gradeLabels = {correct:"맞혔어요", incorrect:"틀렸어요", ungraded:"판단 보류"};
export function reviewControls() {
  const buttons = Object.entries(gradeLabels).map(([value,label]) =>
    '<button type="button" data-grade="'+value+'" aria-pressed="false">'+label+'</button>').join("");
  return '<section class="study-review"><h3>내 풀이 결과</h3><div role="group" aria-label="내 풀이 결과">'+buttons+'</div><p role="status"></p></section>';
}

export function bindReview(container, eventData, previous, onSaved, {onBusy=()=>{}}={}) {
  const buttons = [...container.querySelectorAll("[data-grade]")];
  const status = container.querySelector("[role=status]");
  const attemptId = eventData.clientAttemptId || crypto.randomUUID();
  const editable = eventData.bank === "coding";
  let selected=previous, busy=false;
  function mark(result, locked) {
    for(const button of buttons) {
      button.disabled = locked;
      button.setAttribute("aria-pressed", String(button.dataset.grade === result));
    }
  }
  function savedLabel(result, changed=false) {
    return gradeLabels[result]+" · "+(changed?"수정됨":"저장됨")+
      (editable?" (다른 버튼을 눌러 변경할 수 있어요.)":"");
  }
  if(previous) {
    mark(previous,!editable);
    status.textContent = "내 기록 · "+(gradeLabels[previous]||"이전 풀이 기록")+
      (editable?" · 다른 버튼을 눌러 변경할 수 있어요.":"");
    if(!editable)return;
  }
  for(const button of buttons) button.addEventListener("click", async () => {
    const result = button.dataset.grade;
    if(busy||result===selected)return;
    const correcting=editable&&!!selected;
    busy=true;onBusy(true);
    mark(result,true);
    status.textContent = correcting?"수정 중…":"저장 중…";
    try {
      const response = correcting
        ? await correctCodingGrade(eventData.questionId,attemptId,result)
        : await recordLearningAttempt({...eventData, clientAttemptId:attemptId,
          result, gradingMethod:"self", metadata:{...eventData.metadata, assessment:"student_self_review", evaluation:result}});
      if(response.state === "saved" || response.state === "pending") {
        selected=result;
        status.textContent = response.state === "saved" ? savedLabel(result,correcting) : "이 기기에 저장 · 동기화 대기";
        onSaved(result);
        return;
      }
      status.textContent = "이 계정은 읽기 전용입니다.";
    } catch(error) {
      status.textContent = error.message==="ANSWER_TOO_LONG"?"답안을 10,000자 이내로 줄인 뒤 다시 제출해 주세요.":
        correcting?"결과를 수정하지 못했습니다. 연결을 확인하고 다시 선택해 주세요.":"저장하지 못했습니다. 다시 선택해 주세요.";
    } finally {
      busy=false;onBusy(false);
      mark(selected,!editable&&!!selected);
    }
  });
}
