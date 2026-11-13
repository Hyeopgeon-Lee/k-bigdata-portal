import {recordLearningAttempt} from "./learning-activity.mjs";

export const gradeLabels = {correct:"맞혔어요", incorrect:"틀렸어요", ungraded:"판단 보류"};
export function reviewControls() {
  const buttons = Object.entries(gradeLabels).map(([value,label]) =>
    '<button type="button" data-grade="'+value+'" aria-pressed="false">'+label+'</button>').join("");
  return '<section class="study-review"><h3>내 풀이 결과</h3><div role="group" aria-label="내 풀이 결과">'+buttons+'</div><p role="status"></p></section>';
}

export function bindReview(container, eventData, previous, onSaved) {
  const buttons = [...container.querySelectorAll("[data-grade]")];
  const status = container.querySelector("[role=status]");
  let attemptId = eventData.clientAttemptId || crypto.randomUUID();
  function mark(result) {
    for(const button of buttons) {
      button.disabled = true;
      button.setAttribute("aria-pressed", String(button.dataset.grade === result));
    }
  }
  if(previous) {
    mark(previous);
    status.textContent = "내 기록 · "+(gradeLabels[previous]||"이전 풀이 기록");
    return;
  }
  for(const button of buttons) button.addEventListener("click", async () => {
    const result = button.dataset.grade;
    mark(result);
    status.textContent = "저장 중…";
    try {
      const response = await recordLearningAttempt({...eventData, clientAttemptId:attemptId,
        result, gradingMethod:"self", metadata:{...eventData.metadata, assessment:"student_self_review", evaluation:result}});
      if(response.state === "saved" || response.state === "pending") {
        status.textContent = response.state === "saved" ? gradeLabels[result]+" · 저장됨" : "이 기기에 저장 · 동기화 대기";
        onSaved(result);
        return;
      }
      status.textContent = "이 계정은 읽기 전용입니다.";
    } catch(error) {
      status.textContent = error.message==="ANSWER_TOO_LONG"?"답안을 10,000자 이내로 줄인 뒤 다시 제출해 주세요.":"저장하지 못했습니다. 다시 선택해 주세요.";
    }
    for(const item of buttons) { item.disabled=false; item.setAttribute("aria-pressed","false"); }
  });
}
