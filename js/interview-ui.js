import {questions, interviewGroups, interviewJobTags, questionSearchText, matchesInterviewCategory,
  selectRandomQuestions, interviewSources, interviewEditorialSources, interviewReviewDate} from "./interview.js";
import {matches} from "./search.js";

const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;"}[c]));
const tags = values => '<div class="tags">' + values.map(value => '<span>' + esc(value) + '</span>').join("") + '</div>';
const external = source => '<a href="' + esc(source.url) + '" target="_blank" rel="noopener noreferrer">' + esc(source.name) + ' ↗<span class="sr-only"> 외부 문서, 새 창</span></a>';

export function renderInterviewQuestion(item, practice = false) {
  const sources = item.sourceIds.map(id => interviewSources[id]).filter(Boolean);
  return '<article class="question" data-question-id="' + esc(item.id) + '"><div class="question-meta"><span class="question-code">' + esc(item.code) + '</span><span class="badge">' + esc(item.group) + '</span><span class="badge">' + esc(item.difficulty) + '</span></div>' +
    '<h2' + (practice ? ' tabindex="-1" id="practice-question-heading"' : '') + '>' + esc(item.question) + '</h2><p class="question-role">관련 직무 · ' + esc(item.jobTags.join(" · ")) + '</p>' +
    '<details class="question-answer"><summary><span class="answer-toggle">답변 보기</span><span class="sr-only"> · ' + esc(item.code) + '</span></summary><div class="answer-content"><h3>핵심 답변</h3><p class="short-answer">' + esc(item.shortAnswer) + '</p><h3>상세 설명</h3><p>' + esc(item.detailedAnswer) + '</p><h3>핵심 키워드</h3>' + tags(item.keywords) +
    '<h3>면접관이 이어서 물어볼 수 있는 질문</h3><ol class="follow-ups">' + item.followUps.map(text => '<li>' + esc(text) + '</li>').join("") + '</ol>' +
    '<details class="question-sources"><summary>개념 확인용 공식 문서</summary><ul>' + sources.map(source => '<li>' + external(source) + '</li>').join("") + '</ul></details></div></details>' +
    (!practice ? '<a class="question-permalink" href="interview.html?id=' + esc(item.id) + '">이 문제만 연습하기 →<span class="sr-only"> · ' + esc(item.code) + '</span></a>' : '') + '</article>';
}

export function initInterview() {
  const root = document.querySelector("#items"), detail = document.querySelector("#detail");
  const filters = document.querySelector("#filters"), roles = document.querySelector("#job-filters");
  const input = document.querySelector("#local-query"), status = document.querySelector("#list-status");
  const params = new URLSearchParams(location.search);
  const requestedCategory = params.get("category"), requestedRole = params.get("job");
  let active = questions.some(q => matchesInterviewCategory(q, requestedCategory)) ? requestedCategory : "전체";
  let job = interviewJobTags.includes(requestedRole) ? requestedRole : "전체";
  let query = params.get("q") || "", session = null, direct = questions.find(q => q.id === params.get("id"));
  let lastRandom = null;
  input.value = query;
  document.querySelector("#interview-stats").textContent = "전체 " + questions.length + "문제 · " + interviewGroups.length + "개 분야";
  if (params.has("id") && !direct) detail.innerHTML = '<p class="notice" role="status">요청한 문제를 찾을 수 없습니다. 전체 목록에서 선택하세요.</p>';
  else if (requestedCategory && active === "전체" && requestedCategory !== "전체") detail.innerHTML = '<p class="notice" role="status">요청한 분야를 찾을 수 없어 전체 문제를 표시합니다.</p>';
  const sourceRoot = document.querySelector("#interview-reference-list");
  sourceRoot.innerHTML = interviewEditorialSources.map(source => '<li>' + external(source) + '</li>').join("");
  document.querySelector("#interview-review-date").textContent = interviewReviewDate;

  function pool() {
    return questions.filter(item => matchesInterviewCategory(item, active) && (job === "전체" || item.jobTags.includes(job)) && matches(questionSearchText(item), query));
  }
  function filterButtons(element, values, current, key) {
    const scroll = element.scrollLeft;
    element.innerHTML = values.map(value => '<button type="button" data-' + key + '="' + esc(value) + '" aria-pressed="' + (current === value) + '">' + esc(value) + '</button>').join("");
    element.scrollLeft = scroll;
  }
  function render(focusQuestion = false) {
    filterButtons(filters, ["전체", ...interviewGroups], interviewGroups.includes(active) || active === "전체" ? active : questions.find(q => q.category === active)?.group, "category");
    filterButtons(roles, ["전체", ...interviewJobTags], job, "job");
    document.querySelector("#active-interview-filter").textContent = active !== "전체" && !interviewGroups.includes(active) ? "기존 연결 분야: " + active + " · 분야 버튼을 선택하면 해당 전체 학습 분야로 전환합니다." : "";
    const available = pool();
    document.querySelector("#random-one").disabled = !available.length;
    document.querySelector("#random-ten").disabled = !available.length;
    if (session?.complete) {
      root.innerHTML = '<section class="practice-complete" aria-labelledby="practice-done"><p class="section-kicker">PRACTICE COMPLETE</p><h2 id="practice-done" tabindex="-1">모의 기술면접 완료</h2><p>' + session.items.length + '문제를 연습했습니다. 말하기 어려웠던 개념과 꼬리질문을 공식 문서·프로젝트 코드로 다시 확인하세요.</p><p class="hint">점수를 계산하거나 학습 결과를 저장하지 않습니다.</p><div class="practice-actions"><button type="button" class="button button-primary" data-action="restart">다시 10문제</button><button type="button" class="button button-secondary" data-action="all">전체 문제 보기</button></div></section>';
      status.textContent = "모의 기술면접 " + session.items.length + "문제 완료";
      if (focusQuestion) {const heading=document.querySelector("#practice-done");heading.focus({preventScroll:true});heading.scrollIntoView({block:"start",behavior:"auto"});}
    } else if (session || direct) {
      const item = direct || session.items[session.index];
      root.innerHTML = '<section class="practice-session" aria-label="한 문제씩 말하기 연습"><div class="practice-progress"><p>' + (direct ? "선택한 기술면접 문제" : session.items.length === 1 ? "랜덤 기술면접" : "모의 기술면접") + '</p>' + (!direct ? '<strong>' + (session.index + 1) + ' / ' + session.items.length + '</strong>' : '') + '</div><p class="hint">먼저 30초 정도 자신의 말로 답해보고, 답변과 꼬리질문을 확인하세요.</p>' + renderInterviewQuestion(item, true) + '<div class="practice-actions">' + (!direct ? '<button type="button" class="button button-primary" data-action="next">' + (session.items.length === 1 ? "다른 랜덤 문제" : session.index === session.items.length - 1 ? "연습 완료" : "다음 문제") + '</button>' : '') + '<button type="button" class="button button-secondary" data-action="all">전체 문제 보기</button></div></section>';
      status.textContent = direct ? "선택한 문제 1개 · " + item.code : "필터 결과 " + available.length + "개에서 선택 · " + (session.index + 1) + " / " + session.items.length;
      if (focusQuestion) {const heading=document.querySelector("#practice-question-heading");heading.focus({preventScroll:true});heading.scrollIntoView({block:"start",behavior:"auto"});}
    } else {
      root.innerHTML = available.length ? available.map(item => renderInterviewQuestion(item)).join("") : '<div class="notice"><h2>검색 결과가 없습니다</h2><p>다른 키워드를 사용하거나 분야·직무 필터를 초기화해 보세요.</p><button type="button" class="button button-secondary" data-action="reset">필터 초기화</button></div>';
      status.textContent = "전체 " + questions.length + "문제 중 " + available.length + "문제 · 분야 " + active + " · 직무 " + job;
    }
  }
  function clearPractice() {session = null; direct = null; detail.innerHTML = "";}
  function start(count) {
    const available = pool();
    let candidates = count === 1 && available.length > 1 ? available.filter(q => q.id !== lastRandom) : available;
    const picked = selectRandomQuestions(candidates, count);
    clearPractice();
    if (picked.length) {session = {items:picked, index:0, complete:false}; lastRandom = picked[0].id;}
    render(true);
  }
  function reset() {active = "전체"; job = "전체"; query = ""; input.value = ""; clearPractice(); render();}
  function showAll() {clearPractice(); render(); root.querySelector("summary")?.focus({preventScroll:true});}
  filters.addEventListener("click", event => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    active = button.dataset.category; clearPractice(); render();
    [...filters.querySelectorAll("button")].find(b => b.dataset.category === active)?.focus({preventScroll:true});
  });
  roles.addEventListener("click", event => {
    const button = event.target.closest("button[data-job]");
    if (!button) return;
    job = button.dataset.job; clearPractice(); render();
    [...roles.querySelectorAll("button")].find(b => b.dataset.job === job)?.focus({preventScroll:true});
  });
  input.addEventListener("input", () => {query = input.value; clearPractice(); render();});
  document.querySelector("#random-one").addEventListener("click", () => start(1));
  document.querySelector("#random-ten").addEventListener("click", () => start(10));
  document.querySelector("#show-all").addEventListener("click", showAll);
  document.querySelector("#reset-interview").addEventListener("click", reset);
  root.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    if (button.dataset.action === "all") showAll();
    if (button.dataset.action === "reset") reset();
    if (button.dataset.action === "restart") start(10);
    if (button.dataset.action === "next" && session) {
      if (session.items.length === 1) start(1);
      else {session.index++; session.complete = session.index >= session.items.length; render(true);}
    }
  });
  root.addEventListener("toggle", event => {
    const details = event.target;
    if (!details.classList.contains("question-answer")) return;
    details.querySelector(".answer-toggle").textContent = details.open ? "답변 숨기기" : "답변 보기";
  }, true);
  render();
}
