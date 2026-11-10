import {codingProblems as sampleProblems} from "../data/coding-samples.js?v=20261111-ubuntu-vim-only-2";
import {javaProblems} from "../data/coding-java-98.js?v=20261111-java016-korean-units-1";
import {cFoundationProblems} from "../data/coding-c-foundations.js?v=20261111-essential-ranges-1";
import {cAdvancedProblems} from "../data/coding-c-advanced.js?v=20261111-essential-ranges-1";
import {pythonFoundationProblems} from "../data/coding-python-foundations.js?v=20261111-essential-ranges-1";
import {pythonAdvancedProblems} from "../data/coding-python-advanced.js?v=20261111-essential-ranges-1";



import {ubuntuPptProblems} from "../data/coding-ubuntu-ppt.js?v=20261111-ls-option-table-1";
import {learningReportUrl} from "./learning-report.js?v=20261020-study-share-1";
const codingProblems = [...sampleProblems.filter(p=>p.language!=="linux"), ...javaProblems, ...cFoundationProblems, ...cAdvancedProblems, ...pythonFoundationProblems, ...pythonAdvancedProblems, ...ubuntuPptProblems].sort((a,b) =>
  a.language.localeCompare(b.language) || Number(a.id.split("-").at(-1))-Number(b.id.split("-").at(-1))
);
// Reuse the comprehensive ls option definitions from LINUX-004 for every Ubuntu problem that uses ls.
const lsOptionRows = ubuntuPptProblems.find(p=>p.id==="LINUX-004")?.commandParts || [];

const $ = selector => document.querySelector(selector);
const labels = {java:"Java", c:"C언어", python:"Python", linux:"Ubuntu"};
const targets = {java:100, c:100, python:100, linux:50};
const DONE_KEY = "kbigdata:coding:done:v1";
const DRAFT_PREFIX = "kbigdata:coding:draft:v1:";
const AUTOCOMPLETE_KEY = "kbigdata:coding:autocomplete:v1";
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

// The first visit is OFF. Subsequent visits restore this browser's opt-in.
let autocompleteEnabled = getSafe(AUTOCOMPLETE_KEY, "off") === "on";
const autocompleteToggle = $("#coding-autocomplete-toggle");
const autocompleteStatus = $("#coding-autocomplete-status");
autocompleteToggle.checked = autocompleteEnabled;
function refreshAutocompleteStatus() {
  autocompleteStatus.textContent = autocompleteEnabled ? "켜짐" : "꺼짐";
}
refreshAutocompleteStatus();
autocompleteToggle.addEventListener("change", () => {
  if (!codeEditor) {
    autocompleteToggle.checked = autocompleteEnabled;
    return;
  }
  autocompleteEnabled = autocompleteToggle.checked;
  codeEditor.setAutocompleteEnabled(autocompleteEnabled);
  setSafe(AUTOCOMPLETE_KEY, autocompleteEnabled ? "on" : "off");
  refreshAutocompleteStatus();
});

const requestedId = new URLSearchParams(location.search).get("id");
let current = codingProblems.find(q => q.id === requestedId) || codingProblems[0];
let codeEditor = null;
let language = current.language;
let query = "";
let topicFilter = "all";
let levelFilter = "all";
let listPage = 0;
const PAGE_SIZE = 10;
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
    button.querySelector("span").textContent = number + "문제";
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
    const link=document.createElement("a");
    link.href=currentProblemLink(q);
    if(q.id===current.id)link.setAttribute("aria-current","page");
    const title=document.createElement("strong");
    title.textContent=q.title;
    const subtitle=document.createElement("small");
    subtitle.textContent=q.id+" · "+q.level+(doneIds.has(q.id)?" · 완료 ✓":"");
    if(doneIds.has(q.id))subtitle.className="coding-done";
    link.append(title,subtitle);
    link.addEventListener("click",event=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      event.preventDefault();
      showQuestion(q);
    });
    li.append(link);
    list.append(li);
  });
}
function resetReveal(id, buttonId) {
  $(id).hidden = true;
  $(buttonId).setAttribute("aria-expanded","false");
}
function updateUbuntuGuide(q) {
  const isUbuntu = q.language === "linux";
  const guide = isUbuntu ? q : null;
  document.body.classList.toggle("coding-ubuntu-mode",isUbuntu);
  document.body.classList.toggle("coding-ubuntu-terminal-demo",isUbuntu);
  $("#coding-work-heading").textContent = isUbuntu ? "명령어 직접 작성" : "직접 코딩하기";
  $("#coding-input-label").textContent = isUbuntu ? "초기 실행 환경" : "입력 예제";
  $("#coding-output-label").textContent = isUbuntu ? "예상 실행 결과" : "출력 예제";
  $("#coding-answer-button").textContent = isUbuntu ? "정답 명령어 및 해설" : "정답과 줄별 주석";
  $("#coding-answer-heading").textContent = isUbuntu ? "정답 명령어" : "정답 코드와 한 줄 주석";
  $("#coding-overall-explanation h3").textContent = isUbuntu && Array.isArray(q.vimSteps) ? "Vim 조작 방법" : isUbuntu ? "학습 개념과 풀이" : "전체 해설";
  $("#coding-copy").textContent = isUbuntu ? "명령어 복사" : "주석 없는 코드 복사";
  $("#coding-copy-tip").textContent = ({
    c:"복사한 C 코드를 vim에 붙여 넣어 직접 주석을 작성하고, 터미널에서 gcc 또는 make로 컴파일해 확인하세요.",
    java:"Java 코드를 IntelliJ에서 실행하며 각 줄이 어떤 역할을 하는지 주석으로 설명해 보세요.",
    python:"Python 코드를 VS Code, PyCharm 또는 터미널에서 실행하며 각 줄에 직접 주석을 달아 보세요.",
    linux:Array.isArray(q.vimSteps) ? "터미널 명령어를 한 줄씩 실행하고, 아래 'Vim 조작 방법'의 키 입력을 따라 하세요." : "Ubuntu 터미널에서 명령어를 한 줄씩 실행하고 결과를 확인하세요."
  })[q.language];
  $("#coding-editor").placeholder = isUbuntu ? "Ubuntu 터미널에서 사용할 명령어를 직접 작성해 보세요." : "여기에 스스로 정답을 작성해 보세요.";
  $("#coding-answer-note").hidden = isUbuntu;
  $("#coding-trace-button").hidden = isUbuntu;
  // Vim questions already contain a complete keystroke explanation: show it once in the existing answer explanation.
  $("#coding-overall-explanation").hidden = !q.explanation;
  $("#coding-ubuntu-guide").hidden = !isUbuntu;
  if(!isUbuntu) return;
  $("#coding-code").textContent = guide.code;
  $("#coding-ubuntu-verify").textContent = guide.verification;
  // Avoid repeating the same Vim procedure below the verification command.
  $("#coding-ubuntu-verify-note").textContent = Array.isArray(q.vimSteps) ? "" : (guide.verificationDetail || guide.output);
  $("#coding-ubuntu-verify-note").hidden = !$("#coding-ubuntu-verify-note").textContent;
  $("#coding-ubuntu-mistake").textContent = guide.commonMistake;
  // Include the same ls reference table whenever ls appears in an answer or a verification command.
  // LINUX-004 already presents this complete table as its main command explanation.
  const usesLs = /\bls\b/.test([guide.code || "",guide.verification || ""].join("\n"));
  const showLsOptions = usesLs && guide.id !== "LINUX-004" && lsOptionRows.length > 0;
  $("#coding-ubuntu-ls-options").hidden = !showLsOptions;
  const lsTbody = $("#coding-ubuntu-ls-option-rows");
  lsTbody.replaceChildren();
  if (showLsOptions) {
    for (const part of lsOptionRows) {
      const row = document.createElement("tr");
      for (const value of [part.token,part.meaning,part.example || "—"]) {
        const td = document.createElement("td");
        td.textContent = value;
        row.append(td);
      }
      lsTbody.append(row);
    }
  }
  $("#coding-ubuntu-guide > h3").textContent = guide.optionGuideHeading || "명령어·옵션 설명";
  const tbody = $("#coding-ubuntu-parts");
  const showExamples = guide.commandParts.some(part => Boolean(part.example));
  $("#coding-ubuntu-example-head").hidden = !showExamples;
  tbody.replaceChildren();
  for(const part of guide.commandParts){
    const row=document.createElement("tr");
    const columns = showExamples ? [part.token,part.meaning,part.example || "—"] : [part.token,part.meaning];
    for(const val of columns){
      const td=document.createElement("td");
      td.textContent=val;
      row.append(td);
    }
    tbody.append(row);
  }
}


function renderExtraExamples(q) {
  const section = $("#coding-extra-examples");
  const list = $("#coding-extra-examples-list");
  const examples = Array.isArray(q.examples) ? q.examples : [];
  list.replaceChildren();
  section.hidden = examples.length === 0;
  if (!examples.length) return;
  for (const [index, example] of examples.entries()) {
    const item = document.createElement("div");
    item.className = "coding-extra-example";
    const heading = document.createElement("h4");
    heading.textContent = "예제 " + (index + 2);
    const io = document.createElement("div");
    io.className = "coding-io";
    for (const [label, content] of [["입력", example.input], ["출력", example.output]]) {
      const cell = document.createElement("div");
      const caption = document.createElement("b");
      caption.textContent = label;
      const value = document.createElement("pre");
      value.textContent = content;
      cell.append(caption, value);
      io.append(cell);
    }
    const reason = document.createElement("p");
    reason.className = "coding-example-reason";
    reason.textContent = example.reason || "";
    item.append(heading, io, reason);
    list.append(item);
  }
}

// Keep executable answers behind the explicit answer-reveal button.
function visibleUbuntuConsole(q, transcript, expected=false) {
  if (q.language !== "linux") return String(transcript);
  const answerLines = new Set(q.code.split("\n").map(line => line.trim()));
  return String(transcript).split("\n").map(line => {
    const match = line.match(/^(student@ubuntu:[^\n$]*\$\s*)(.*)$/);
    if (!match) return line;
    const entered = match[2].trim();
    if (!entered || entered === "[명령어 입력]") return line;
    return (expected || answerLines.has(entered)) ? match[1] + "[명령어 입력]" : line;
  }).join("\n");
}

// A highlighted placeholder is rendered safely, without interpreting markup.
function renderConsoleText(pre, transcript, isUbuntu) {
  if (!isUbuntu) { pre.textContent = transcript; return; }
  const sections = transcript.split("[명령어 입력]");
  pre.replaceChildren();
  sections.forEach((section, index) => {
    pre.append(document.createTextNode(section));
    if (index < sections.length - 1) {
      const marker = document.createElement("span");
      marker.className = "ubuntu-command-placeholder";
      marker.textContent = "[명령어 입력]";
      pre.append(marker);
    }
  });
}

function showQuestion(q) {
  if (!q) return;
  current = q;
  language = q.language;
  const url = new URL(location.href);
  url.searchParams.set("id", q.id);
  history.replaceState(null, "", url);
  $("#coding-report-button").href = learningReportUrl("coding",q,labels[q.language] + " · " + q.title);
  $("#coding-id").textContent = q.id;
  $("#coding-level").textContent = q.level;
  $("#coding-topic").textContent = q.topic;
  $("#coding-title").textContent = q.title;
  $("#coding-statement").textContent = q.statement;
  renderConsoleText($("#coding-input"),visibleUbuntuConsole(q,q.input),q.language==="linux");
  renderConsoleText($("#coding-output"),visibleUbuntuConsole(q,q.output,true),q.language==="linux");
  const ubuntuOutputNote = $("#coding-ubuntu-output-note");
  ubuntuOutputNote.textContent = q.language === "linux" ? (q.outputNote || "") : "";
  ubuntuOutputNote.hidden = !ubuntuOutputNote.textContent;
  renderExtraExamples(q);
  $("#coding-editor").value = getSafe(DRAFT_PREFIX + q.id);
  $("#coding-hint-text").textContent = q.hint;
  $("#coding-code").textContent = q.code;
  const vimSteps = q.language === "linux" && Array.isArray(q.vimSteps) ? q.vimSteps : [];
  const vimList = $("#coding-vim-explanation-list");
  vimList.replaceChildren();
  for(const step of vimSteps){
    const item = document.createElement("li");
    item.textContent = step;
    vimList.append(item);
  }
  vimList.hidden = vimSteps.length === 0;
  $("#coding-explanation").textContent = q.explanation || "";
  $("#coding-explanation").hidden = vimSteps.length > 0;
  $("#coding-explanation").style.whiteSpace = q.language === "linux" ? "pre-line" : "";
  updateUbuntuGuide(q);
  codeEditor?.setContent($("#coding-editor").value, q.language, $("#coding-editor").placeholder);
  const tbody = $("#coding-trace-rows");
  tbody.replaceChildren();
  (q.trace || []).forEach(row => {
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
  $("#coding-share-status").textContent = "";
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
function currentProblemLink(q=current) {
  if (!q) return "";
  const url = new URL("coding.html", location.origin + "/");
  url.searchParams.set("id", q.id);
  return url.href;
}
async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch { /* Try legacy copy for browsers without clipboard permission. */ }
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } finally { area.remove(); }
  if (!ok) throw new Error("클립보드 접근 실패");
}
function setShareStatus(message) {
  $("#coding-share-status").textContent = message;
}
async function shareCurrentProblem() {
  if (!current) return;
  const url = currentProblemLink();
  const title = labels[current.language] + " · " + current.title;
  const preview = String(current.statement || "").replace(/\s+/g," ").slice(0,160);
  const details = { title: title, text: preview, url };
  if (navigator.share && (!navigator.canShare || navigator.canShare(details))) {
    try {
      await navigator.share(details);
      setShareStatus("문제를 공유했습니다.");
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }
  try {
    await copyText(title + "\n" + preview + "\n문제 풀기: " + url);
    setShareStatus("문제 내용과 링크를 복사했습니다.");
  } catch {
    setShareStatus("공유하지 못했습니다. 링크 복사를 다시 시도해 주세요.");
  }
}
async function copyCurrentProblemLink() {
  if (!current) return;
  try {
    await copyText(currentProblemLink());
    setShareStatus("문제 링크를 복사했습니다.");
  } catch {
    setShareStatus("복사할 수 없습니다. 브라우저의 클립보드 권한을 확인해 주세요.");
  }
}
$("#coding-share-button").addEventListener("click", () => { void shareCurrentProblem(); });
$("#coding-link-button").addEventListener("click", () => { void copyCurrentProblemLink(); });
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
  const comment = current.language === "python" ? /\s+#.*$/ : /\s+\/\/.*$/;
  const plainCode = current.language === "linux" ? current.code : current.code.split("\n").map(line => line.replace(comment,"")).join("\n");
  try {
    await navigator.clipboard.writeText(plainCode);
    const includesVim = current.language === "linux" && /(^|\n)\s*vim\s+\S+/.test(plainCode);
    $("#coding-feedback").textContent = includesVim
      ? "Vim 실습 명령어를 복사했습니다. 터미널 명령은 한 줄씩 실행하고 Vim 안에서 안내된 키를 누른 뒤 :wq로 저장·종료하세요."
      : current.language === "linux" ? "정답 명령어를 복사했습니다." : "주석 없는 정답 코드를 복사했습니다.";
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
// Native textarea fallback remains usable if the CDN is unreachable or blocked.
const nativeEditor = $("#coding-editor");
function notifyNativeEdit() {
  nativeEditor.dispatchEvent(new Event("input", {bubbles:true}));
}
nativeEditor.addEventListener("keydown", event => {
  if (codeEditor || (event.key !== "Tab" && event.key !== "Enter")) return;
  const start = nativeEditor.selectionStart, end = nativeEditor.selectionEnd;
  const value = nativeEditor.value;
  if (event.key === "Enter") {
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const spaces = value.slice(lineStart, start).match(/^[ \t]*/)?.[0] || "";
    event.preventDefault();
    nativeEditor.setRangeText("\n" + spaces, start, end, "end");
    notifyNativeEdit();
    return;
  }
  event.preventDefault();
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lastLineEnd = end > start && value[end - 1] === "\n" ? end - 1 : end;
  const firstLineEnd = value.indexOf("\n", lineStart);
  const multi = lastLineEnd > (firstLineEnd < 0 ? value.length : firstLineEnd);
  if (!multi && !event.shiftKey) {
    nativeEditor.setRangeText("    ", start, end, "end");
  } else {
    const begin = lineStart;
    const segment = value.slice(begin, lastLineEnd);
    const adjusted = segment.split("\n").map(line =>
      event.shiftKey ? line.replace(/^( {1,4}|\t)/, "") : "    " + line
    ).join("\n");
    nativeEditor.setRangeText(adjusted, begin, lastLineEnd, "select");
  }
  notifyNativeEdit();
});

refreshFilters();
showQuestion(current);
void import("./coding-editor.js?v=20261024-autocomplete-1")
  .then(({createCodingEditor}) => {
    codeEditor = createCodingEditor({
      textarea:nativeEditor,
      host:$("#coding-editor-host"),
      language:current.language,
      autocompleteEnabled,
      onChange(value) { setSafe(DRAFT_PREFIX + current.id, value); }
    });
    autocompleteToggle.disabled = false;
    refreshAutocompleteStatus();
  })
  .catch(error => {
    console.warn("CodeMirror 초기화 실패, 기본 입력창을 유지합니다.", error);
    const notice = $(".coding-notice");
    if (notice) notice.textContent += " 코드 편집기를 불러오지 못해 기본 입력창으로 표시합니다. Tab 들여쓰기는 이용할 수 있습니다.";
  });
