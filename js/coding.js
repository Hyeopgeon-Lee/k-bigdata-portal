import {codingProblems as sampleProblems} from "../data/coding-samples.js?v=20261020-a";
import {javaProblems} from "../data/coding-java-98.js?v=20261020-java100-b";
const codingProblems = [...sampleProblems, ...javaProblems].sort((a,b) =>
  a.language.localeCompare(b.language) || Number(a.id.split("-").at(-1))-Number(b.id.split("-").at(-1))
);

const $ = selector => document.querySelector(selector);
const labels = {java:"Java", c:"C언어", python:"Python", linux:"Ubuntu"};
const targets = {java:100, c:100, python:100, linux:50};
const DONE_KEY = "kbigdata:coding:done:v1";
const DRAFT_PREFIX = "kbigdata:coding:draft:v1:";
const getSafe = (key, fallback = "") => {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
};
const setSafe = (key, value) => {
  try { localStorage.setItem(key, value); } catch { /* Private browsing or storage full */ }
};
const knownIds = new Set(codingProblems.map(p => p.id));
let doneIds = new Set();
try {
  const saved = JSON.parse(getSafe(DONE_KEY, "[]"));
  if (Array.isArray(saved)) doneIds = new Set(saved.filter(id => knownIds.has(id)));
} catch { doneIds = new Set(); }

const requestedId = new URLSearchParams(location.search).get("id");
let current = codingProblems.find(q => q.id === requestedId) || codingProblems[0];
let language = current.language;
let query = "";
let topicFilter = "all";
let levelFilter = "all";
let listPage = 0;
const PAGE_SIZE = 12;
function refreshFilters() {
  const topics = [...new Set(codingProblems.filter(q=>q.language===language).map(q=>q.topic))];
  const topicControl=$("#coding-topic-filter");
  topicControl.replaceChildren();
  const all=new Option("단원 전체","all");
  topicControl.add(all);
  topics.forEach(t=>topicControl.add(new Option(t,t)));
  topicControl.value=topics.includes(topicFilter)?topicFilter:"all";
  topicFilter=topicControl.value;
  $("#coding-level-filter").value=levelFilter;
}

function matching() {
  return codingProblems.filter(q => q.language === language &&
    (topicFilter==="all" || q.topic===topicFilter) &&
    (levelFilter==="all" || q.level===levelFilter) &&
    (!query || (q.id+" "+q.title+" "+q.statement+" "+q.topic+" "+q.level).toLocaleLowerCase().includes(query))
  );
}
function updateSummary() {
  $("#coding-available").textContent = codingProblems.length + "문제";
  $("#coding-completed").textContent = doneIds.size + "문제";
  document.querySelectorAll("#coding-language button").forEach(button => {
    const lang = button.dataset.lang;
    const number = codingProblems.filter(q => q.language === lang).length;
    button.setAttribute("aria-pressed", String(language === lang));
    button.querySelector("span").textContent = "목표 " + targets[lang] + " · 공개 " + number;
  });
}
function listQuestions(syncPage=false) {
  const list = $("#coding-questions");
  list.replaceChildren();
  const items = matching();
  if(syncPage){
    const position=items.findIndex(q=>q.id===current.id);
    if(position>=0)listPage=Math.floor(position/PAGE_SIZE);
  }
  listPage=Math.min(Math.max(0,listPage),Math.max(0,Math.ceil(items.length/PAGE_SIZE)-1));
  const pageCount=Math.ceil(items.length/PAGE_SIZE);
  $("#coding-list-count").textContent = items.length + "개 공개";
  $("#coding-match-count").textContent = labels[language] + " · " + items.length + "개 결과";
  $("#coding-page-label").textContent = items.length ? (listPage+1)+" / "+pageCount+"페이지" : "검색 결과 없음";
  $("#coding-page-prev").disabled = listPage===0;
  $("#coding-page-next").disabled = listPage>=pageCount-1;
  if(!items.length) {
    const li=document.createElement("li");
    li.className="coding-empty";
    li.textContent="일치하는 공개 문제가 없습니다.";
    list.append(li);
    return;
  }
  items.slice(listPage*PAGE_SIZE,(listPage+1)*PAGE_SIZE).forEach(q=>{
    const li=document.createElement("li");
    const button=document.createElement("button");
    button.type="button";
    button.setAttribute("aria-current",String(q.id===current.id));
    const title=document.createElement("strong");
    title.textContent=q.title;
    const subtitle=document.createElement("small");
    subtitle.textContent=q.id+" · "+q.level+(doneIds.has(q.id)?" · 완료 ✓":"");
    if(doneIds.has(q.id))subtitle.className="coding-done";
    button.append(title,subtitle);
    button.addEventListener("click",()=>showQuestion(q));
    li.append(button);
    list.append(li);
  });
}
function resetReveal(id, buttonId) {
  $(id).hidden = true;
  $(buttonId).setAttribute("aria-expanded","false");
}
function showQuestion(q) {
  if (!q) return;
  current = q;
  language = q.language;
  const url = new URL(location.href);
  url.searchParams.set("id", q.id);
  history.replaceState(null, "", url);
  $("#coding-id").textContent = q.id;
  $("#coding-level").textContent = q.level;
  $("#coding-topic").textContent = q.topic;
  $("#coding-title").textContent = q.title;
  $("#coding-statement").textContent = q.statement;
  $("#coding-input").textContent = q.input;
  $("#coding-output").textContent = q.output;
  $("#coding-editor").value = getSafe(DRAFT_PREFIX + q.id);
  $("#coding-hint-text").textContent = q.hint;
  $("#coding-code").textContent = q.code;
  $("#coding-explanation").textContent = q.explanation;
  const tbody = $("#coding-trace-rows");
  tbody.replaceChildren();
  q.trace.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cellValue => {
      const td = document.createElement("td");
      td.textContent = cellValue;
      tr.append(td);
    });
    tbody.append(tr);
  });
  resetReveal("#coding-hint","#coding-hint-button");
  resetReveal("#coding-answer","#coding-answer-button");
  resetReveal("#coding-trace","#coding-trace-button");
  $("#coding-feedback").textContent = "";
  const done = doneIds.has(q.id);
  $("#coding-done-button").setAttribute("aria-pressed",String(done));
  $("#coding-done-button").textContent = done ? "완료 표시 취소" : "스스로 풀었어요 ✓";
  updateSummary();
  listQuestions(true);
}
function reveal(blockId, buttonId) {
  const block = $(blockId), btn = $(buttonId);
  const open = block.hidden;
  block.hidden = !open;
  btn.setAttribute("aria-expanded",String(open));
}
$("#coding-hint-button").addEventListener("click", () => reveal("#coding-hint","#coding-hint-button"));
$("#coding-answer-button").addEventListener("click", () => reveal("#coding-answer","#coding-answer-button"));
$("#coding-trace-button").addEventListener("click", () => reveal("#coding-trace","#coding-trace-button"));
$("#coding-editor").addEventListener("input", event => {
  setSafe(DRAFT_PREFIX + current.id, event.target.value);
});
$("#coding-done-button").addEventListener("click", () => {
  if (doneIds.has(current.id)) {
    doneIds.delete(current.id);
    $("#coding-feedback").textContent = "완료 표시를 취소했습니다.";
  } else {
    doneIds.add(current.id);
    $("#coding-feedback").textContent = "스스로 해결한 문제로 표시했습니다. 자동 채점 결과는 아닙니다.";
  }
  setSafe(DONE_KEY, JSON.stringify([...doneIds]));
  const done = doneIds.has(current.id);
  $("#coding-done-button").setAttribute("aria-pressed",String(done));
  $("#coding-done-button").textContent = done ? "완료 표시 취소" : "스스로 풀었어요 ✓";
  updateSummary();
  listQuestions(true);
});
$("#coding-next-button").addEventListener("click", () => {
  const items = matching();
  if (!items.length) return;
  const pos = items.findIndex(q => q.id === current.id);
  const next = items[(pos + 1) % items.length];
  showQuestion(next);
  $("#coding-title").scrollIntoView({behavior:"smooth",block:"start"});
});
$("#coding-copy").addEventListener("click", async () => {
  const comment = current.language === "python" || current.language === "linux"
    ? /\s+#.*$/ : /\s+\/\/.*$/;
  const plainCode = current.code.split("\n").map(line => line.replace(comment,"")).join("\n");
  try {
    await navigator.clipboard.writeText(plainCode);
    $("#coding-feedback").textContent = "주석 없는 정답 코드를 복사했습니다.";
  } catch {
    $("#coding-feedback").textContent = "자동 복사를 지원하지 않는 브라우저입니다. 정답 코드를 직접 선택하여 복사해 주세요.";
  }
});
$("#coding-search").addEventListener("input", e => {
  query = e.target.value.trim().toLocaleLowerCase();
  const found = matching();
  if (found.length && !found.some(q => q.id === current.id)) showQuestion(found[0]);
  else listQuestions();
});
document.querySelectorAll("#coding-language button").forEach(button => {
  button.addEventListener("click", () => {
    language = button.dataset.lang;
    query = "";
    topicFilter = "all";
    levelFilter = "all";
    listPage = 0;
    $("#coding-search").value = "";
    refreshFilters();
    const first = codingProblems.find(q => q.language === language);
    if (first) showQuestion(first);
  });
});
$("#coding-topic-filter").addEventListener("change",event=>{
  topicFilter=event.target.value;
  listPage=0;
  const first=matching()[0];
  if(first)showQuestion(first);
  else listQuestions();
});
$("#coding-level-filter").addEventListener("change",event=>{
  levelFilter=event.target.value;
  listPage=0;
  const first=matching()[0];
  if(first)showQuestion(first);
  else listQuestions();
});
$("#coding-page-prev").addEventListener("click",()=>{
  listPage=Math.max(0,listPage-1);listQuestions();
});
$("#coding-page-next").addEventListener("click",()=>{
  listPage++;listQuestions();
});
refreshFilters();
showQuestion(current);
