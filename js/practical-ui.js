import {quizNavigation,quizHeading,quizDisclosure,quizFeedback,scrollToQuizAnswer} from "./quiz-unified.js?v=20261112-answer-focus-1";
import {createQuestionBrowser} from "./question-browser.js?v=20261112-exam-facets-1";
import {bindReview,reviewControls,gradeLabels} from "./study-review.js";
import {loadPracticalBank} from "./practical-data.js?v=20261006-audit-2";
import {examLabels,typeLabels,languages,escapeHTML as esc,questionText,shuffle,recommendFive,matchesExam,localDay,summarizeAttempts,highlightCode,formatCodeForDisplay,canResumeUnfinishedAttempt} from "./practical-core.js?v=20261112-practical-resume-1";
import {getAttempts,saveAttempt,getSession,saveSession,clearLocalLearning,storageAvailable,getPreferences,savePreferences,exportLearning,importLearning} from "./practical-store.js";
import {matches} from "./search-core.js?v=20261005-perf-1";
import {beginnerExplanation,examMemory,solutionTrace} from "./practical-explanation.js?v=20261006-audit-2";
import {learningReportUrl} from "./learning-report.js?v=20261009-1";

const $=selector=>document.querySelector(selector),root=$("#bank-content"),status=$("#bank-status");
let bank=[],view="bank",current=null,attempt=null,queue=[],queueIndex=0,aliases={},pageLimit=24,queueKind="random",solveActionsObserver=null;
let browserEntry;
const filters={exam:"all",language:"all",source:"reconstructed",difficulty:"all",type:"all",sort:"latest",query:"",completion:"unseen",year:"all",round:"all"};
const compactLabels={reconstructed:"복원기출",normalized:"기출유형 연습",transformed:"기출 변형",practice:"추가 연습"};
const badge=(text,cls="")=>'<span class="badge '+cls+'">'+esc(text)+'</span>';
const button=(action,label,extra="")=>'<button type="button" class="button button-secondary" data-action="'+action+'" '+extra+'>'+esc(label)+'</button>';
const historyLabel=h=>examLabels[h.examType]+" "+h.year+"년 "+h.round+"회"+(h.questionNumber?" · "+h.questionNumber+"번":"");
function metadata(q){return '<div class="bank-badges">'+badge(compactLabels[q.sourceType],"source-"+q.sourceType)+badge(q.language)+badge(q.difficulty)+'</div>';}
function variantDetail(q){
 const sameTitle=bank.filter(item=>item.title===q.title).length;
 if(sameTitle<2)return "";
 const update=q.question.match(/사원번호\s*(\d+).*?급여를\s*(\d+)/);
 if(update)return "사원 "+update[1]+" → 급여 "+update[2];
 const insert=q.question.match(/각각\s*(\d+)\s*,\s*'([^']+)'/);
 if(insert)return insert[1]+" · "+insert[2]+" 입력";
 const array=String(q.code||"").match(/=\s*(\{\{[^;\n]+?\}\}|\{[^;\n]+?\})\s*;/);
 if(array){
   const values=array[1].replace(/[{}]/g," ").replace(/\s*,\s*/g," · ").replace(/\s+/g," ").trim();
   return "초기값 "+values.slice(0,44);
 }
 return "";
}
function cardTitle(q){const detail=variantDetail(q);return detail?q.title+" · "+detail:q.title;}
function solveHeading(q){
 const h=[...q.history].sort((a,b)=>b.year*10+b.round-a.year*10-a.round)[0];
 if(q.sourceType==="reconstructed"&&h)return historyLabel(h);
 return q.language+" · "+(typeLabels[q.questionType]||"실기")+" 문제";
}
function displayCode(q){
 return formatCodeForDisplay(q.code,q.language);
}
function displayAnswer(q){
 const answer=String(q.answer??"");
 return q.language==="SQL"&&/^\s*(?:SELECT|WITH|UPDATE|INSERT|DELETE|CREATE|ALTER|DROP|MERGE|TRUNCATE)\b/i.test(answer)
  ?formatCodeForDisplay(answer,"SQL"):answer;
}
function formatQuestion(text){
 const value=String(text||"").replace(" 공개 복원자료 간 초기 배열 순서 차이가 있어 아래 코드의 초기값을 기준으로 풀이합니다.","");
 const safe=esc(value);
 return value.length>=80?safe.replace(/\n/g,"<br>").replace(/(^|[^\d])([.!?])[ \t]+/g,"$1$2<br>"):safe;
}
function codeNeedsFocus(q){
 const code=displayCode(q);
 if(!code)return false;
 const lines=code.split(/\r?\n/);
 const maxLine=Math.max(...lines.map(line=>line.length));
 return lines.length>=16||maxLine>=72;
}
function codeToolsHTML(q,shownCode){
 if(!codeNeedsFocus(q))return "";
 const sqlClass=q.language==="SQL"?" code-dialog--sql":"";
 return '<div class="code-mobile-tools">'+button("code-focus","코드 크게 보기",'aria-haspopup="dialog" aria-controls="code-dialog"')+'</div><dialog id="code-dialog" class="code-dialog'+sqlClass+'" aria-labelledby="code-dialog-title"><div class="code-dialog-head"><strong id="code-dialog-title">'+esc(q.language)+' 코드</strong><button type="button" class="button button-secondary" data-action="code-close">닫기</button></div><div class="code-dialog-scroll"><pre><code>'+highlightCode(shownCode)+'</code></pre></div></dialog>';
}
function updateHorizontalScrollHints(){
 document.querySelectorAll("[data-scroll-hint]").forEach(region=>{
  const hint=document.getElementById(region.dataset.scrollHint);
  if(!hint)return;
  const hasOverflow=region.scrollWidth>region.clientWidth+2;
  hint.hidden=!hasOverflow;
  region.classList.toggle("has-horizontal-overflow",hasOverflow);
 });
}
function observeSolveActions(){
 solveActionsObserver?.disconnect();
 solveActionsObserver=null;
 const actions=document.querySelector(".solve-actions");
 if(!actions){document.body.style.removeProperty("--solve-actions-height");return;}
 const update=()=>document.body.style.setProperty("--solve-actions-height",Math.ceil(actions.getBoundingClientRect().height)+"px");
 update();
 if("ResizeObserver" in window){
  solveActionsObserver=new ResizeObserver(update);
  solveActionsObserver.observe(actions);
 }
}
function latest(q){return Math.max(0,...q.history.map(h=>h.year*10+h.round));}
function storageNotice(){ $("#storage-status").textContent=storageAvailable?"":"브라우저 저장소를 사용할 수 없어 이번 화면의 임시 기록만 유지합니다. 새로고침·탭 종료 시 기록이 사라질 수 있습니다."; }
function basicPool(){return bank.filter(q=>matchesExam(q,filters.exam,bank)&&(filters.language==="all"||q.language===filters.language));}
function pool(){const done=new Set(getAttempts().map(a=>a.questionId));return basicPool().filter(q=>(filters.completion==="all"||(filters.completion==="solved"?done.has(q.id):!done.has(q.id)))&&(filters.source==="all"||q.sourceType===filters.source)&&(filters.difficulty==="all"||q.difficulty===filters.difficulty)&&(filters.type==="all"||q.questionType===filters.type)&&((filters.year==="all"&&filters.round==="all")||q.history.some(h=>(filters.year==="all"||String(h.year)===filters.year)&&(filters.round==="all"||String(h.round)===filters.round)))&&matches(questionText(q),filters.query));}
function sorted(items){
 const attempts=getAttempts(),rate=q=>{const a=attempts.filter(a=>a.questionId===q.id&&typeof a.correct==="boolean");return a.length?a.filter(a=>!a.correct).length/a.length:-1;};
 if(filters.sort==="random")return shuffle(items);
 const difficulty={"기본":0,"실전":1,"고난도":2};
 return [...items].sort((a,b)=>filters.sort==="frequency"?b.history.length-a.history.length||latest(b)-latest(a):filters.sort==="difficulty"?difficulty[a.difficulty]-difficulty[b.difficulty]:filters.sort==="wrong"?rate(b)-rate(a):latest(b)-latest(a));
}
function card(q,extra=""){
 const h=[...q.history].sort((a,b)=>b.year*10+b.round-a.year*10-a.round)[0];
 return '<article class="bank-card">'+metadata(q)+(h?'<small>'+esc(historyLabel(h))+'</small>':'')+'<h2>'+esc(cardTitle(q))+'</h2>'+extra+button("open",view==="wrong"?"다시 풀기":"문제 풀기",'data-id="'+esc(q.id)+'"')+'</article>';
}
function disconnectSolveObserver(){solveActionsObserver?.disconnect();solveActionsObserver=null;}
function setUrl(id=null){const url=new URL(location.href);if(id)url.searchParams.set("id",id);else url.searchParams.delete("id");history.replaceState(history.state,"",url);}
function problemShareUrl(q=current){
 if(!q)return "";
 const url=new URL(location.pathname,location.origin);
 url.searchParams.set("id",q.id);
 url.searchParams.set("share","1");
 return url.href;
}
function problemShareText(q=current){
 if(!q)return "";
 const prompt=String(q.question||"").replace(" 공개 복원자료 간 초기 배열 순서 차이가 있어 아래 코드의 초기값을 기준으로 풀이합니다.","").replace(/\s+/g," ").trim();
 const preview=prompt.length>150?prompt.slice(0,147)+"...":prompt;
 return [solveHeading(q),q.language+" · "+q.title,preview].filter(Boolean).join("\n");
}
async function readFileText(file){
 if(typeof file.text==="function")return file.text();
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(String(reader.result??""));
  reader.onerror=()=>reject(reader.error||new Error("파일을 읽을 수 없습니다."));
  reader.readAsText(file);
 });
}
async function copyText(text){
 if(navigator.clipboard?.writeText){
  await navigator.clipboard.writeText(text);
  return;
 }
 const area=document.createElement("textarea");
 area.value=text;
 area.setAttribute("readonly","");
 area.style.position="fixed";
 area.style.opacity="0";
 document.body.append(area);
 area.select();
 const ok=document.execCommand("copy");
 area.remove();
 if(!ok)throw new Error("복사할 수 없습니다.");
}
function setShareStatus(message){
 const el=$("#share-status");
 if(el)el.textContent=message;
}
async function shareCurrentProblem(){
 if(!current)return;
 const url=problemShareUrl(current),text=problemShareText(current);
 const shareData={title:solveHeading(current)+" · "+current.title,text,url};
 if(navigator.share&&(!navigator.canShare||navigator.canShare(shareData))){
  try{
   await navigator.share(shareData);
   setShareStatus("문제를 공유했습니다.");
   return;
  }catch(error){
   if(error?.name==="AbortError")return;
  }
 }
 try{
  await copyText(text+"\n문제 풀기: "+url);
  setShareStatus("문제 카드와 링크를 복사했습니다.");
 }catch{
  setShareStatus("공유할 수 없습니다. 다시 시도해 주세요.");
 }
}
async function copyCurrentProblemLink(){
 if(!current)return;
 try{
  await copyText(problemShareUrl(current));
  setShareStatus("문제 링크를 복사했습니다.");
 }catch{
  setShareStatus("링크를 복사할 수 없습니다. 다시 시도해 주세요.");
 }
}
function selectView(next){disconnectSolveObserver();current=null;attempt=null;queue=[];view=next;pageLimit=24;setUrl();render();window.scrollTo({top:0,behavior:"auto"});}
function planToday(){
 const key=[localDay(),filters.exam,filters.language].join(":");
 const plans=getPreferences().dailyPlans||{},ids=plans[key];
 if(Array.isArray(ids)&&ids.every(id=>basicPool().some(q=>q.id===id)))return ids.map(id=>bank.find(q=>q.id===id));
 const selected=recommendFive(basicPool(),getAttempts(),localDay());
 const recent=Object.fromEntries(Object.entries(plans).filter(([key])=>key.startsWith(localDay())));
 savePreferences({dailyPlans:{...recent,[key]:selected.map(q=>q.id)}});
 return selected;
}
function startQueue(items,kind){
 queue=items;queueIndex=0;queueKind=kind;
 if(queue.length)openQuestion(queue[0].id,true);
 else status.textContent="선택한 조건의 문제가 없습니다. 시험·언어를 변경하세요.";
}
function renderHome(){
 const plan=planToday(),done=new Set(getAttempts().filter(a=>a.viewedExplanation&&localDay(new Date(a.submittedAt))===localDay()).map(a=>a.questionId));
 const completed=plan.filter(q=>done.has(q.id)).length,last=bank.find(q=>q.id===getPreferences().lastQuestionId),session=last&&getSession(last.id);
 root.innerHTML='<div class="study-home-grid"><section class="study-start"><p class="study-kicker">TODAY PRACTICE</p><h2>오늘 조금씩, 꾸준히</h2><p>오늘 '+completed+' / '+plan.length+' 완료</p><progress max="'+Math.max(1,plan.length)+'" value="'+completed+'" aria-label="오늘 추천 문제 진행"></progress><button class="button button-primary study-primary" type="button" data-action="start-today">'+(completed===plan.length&&plan.length?'오늘 문제 다시 연습':'오늘 5문제 시작')+'</button>'+(plan.length<5?'<p class="hint">선택한 조건에서 '+plan.length+'문제를 연습할 수 있습니다.</p>':'')+'</section><aside class="study-side">'+(last&&session?'<section class="study-resume"><h2>이어서 풀기</h2><p>'+esc(last.language+' · '+last.title)+'</p>'+button("resume",session.viewedExplanation?"마지막 풀이 이어보기":session.submittedAt?"답 확정 · 이어서 보기":"진행 중 · 이어서 풀기",'data-id="'+esc(last.id)+'"')+'</section>':'<section class="study-resume study-resume-empty"><h2>학습 시작</h2><p>오늘의 추천 5문제로 바로 시작하거나 원하는 문제를 찾아보세요.</p></section>')+'<div class="study-quick-menu">'+button("quick-random","랜덤 5문제")+button("wrong-view","오답노트")+button("bank-view","전체 문제")+button("progress-view","학습현황")+'</div></aside></div><p class="hint study-paper-hint">가능하면 종이에, 이동 중에는 머릿속으로 실행 흐름을 먼저 추적하세요.</p>';
}
function syncFilters(){
 document.querySelectorAll("[data-filter]").forEach(b=>b.setAttribute("aria-pressed",String(filters[b.dataset.filter]===b.dataset.value)));
 const labels={query:filters.query,exam:examLabels[filters.exam],language:filters.language,source:compactLabels[filters.source],difficulty:filters.difficulty,type:typeLabels[filters.type],completion:filters.completion==="unseen"?"미풀이":filters.completion==="solved"?"풀이 완료":null,year:filters.year,round:filters.round==="all"?null:filters.round+"회"};
 $("#active-filters").innerHTML=Object.entries(labels).filter(([key,label])=>label&&filters[key]!=="all").map(([key,label])=>button("remove-filter",label+" ×",'data-key="'+key+'"')).join("");
}
function render(){
 savePreferences({filters:{...filters}});
 root.classList.remove("study-split");
 disconnectSolveObserver();$("#bank-controls").hidden=!!current||view!=="bank";
 $("#quick-filters").hidden=!!current||!["home","bank"].includes(view);
 // The shared page introduction is always visible in list, home and question modes.
 $("#study-intro").hidden=false;
 $(".bank-nav").hidden=!!current||view==="home";
 $("#usage-guide").hidden=!!current;
 document.body.classList.toggle("is-solving",!!current);
 syncFilters();
 document.querySelectorAll("[data-view]").forEach(b=>{const selected=!current&&b.dataset.view===view;b.setAttribute("aria-pressed",String(selected));b.classList.toggle("button-primary",selected);b.classList.toggle("button-secondary",!selected);});
 status.textContent="";
 if(current){renderQuestion();return;}
 if(view==="home")renderHome();
 else if(view==="bank"){
   const available=sorted(pool());status.textContent=available.length+"문제 · 출제 이력 "+available.filter(q=>q.sourceType==="reconstructed").flatMap(q=>q.history).length+"건";
   root.innerHTML=(available.length?'<div class="bank-card-grid">'+available.slice(0,pageLimit).map(q=>card(q)).join("")+'</div>'+(available.length>pageLimit?button("load-more","문제 더 보기"):''):'<div class="bank-empty"><h2>선택한 조건의 문제가 없습니다.</h2><p>풀이 상태나 문제 종류를 변경해 보세요.</p>'+button("show-all","풀이한 문제도 보기")+button("reset","필터 초기화")+'</div>');
 }else if(view==="random") renderRandom();
 else if(view==="wrong")renderWrong();
 else if(view==="progress")renderProgress();
 storageNotice();
}
function renderRandom(){
 root.innerHTML='<section class="bank-empty"><h2>랜덤 종이 풀이</h2><div class="bank-filter-grid"><label>시험<select id="random-exam"><option value="all">전체</option>'+Object.entries(examLabels).map(([id,label])=>'<option value="'+id+'">'+label+'</option>').join("")+'</select></label><label>언어<select id="random-language"><option value="all">전체</option>'+languages.map(l=>'<option>'+l+'</option>').join("")+'</select></label><label>종류<select id="random-source"><option value="reconstructed">복원기출만</option><option value="all">전체 종류</option></select></label><label>문제 수<select id="random-count"><option>5</option><option>10</option><option>20</option></select></label></div>'+button("start-random","랜덤 연습 시작")+'<p id="random-status" role="status"></p></section>';
 $("#random-exam").value=filters.exam;$("#random-language").value=filters.language;
}
function renderWrong(){
 const all=getAttempts(),ids=[...new Set(all.filter(a=>a.correct===false||a.reviewGrade==="ungraded").map(a=>a.questionId))];
 const items=ids.map(id=>bank.find(q=>q.id===id)).filter(Boolean);
 root.innerHTML='<h2>오답노트</h2><p>틀렸거나 판단을 보류한 문제를 다시 풀어보세요.</p>'+(items.length?'<div class="bank-card-grid">'+items.map(q=>{const records=all.filter(a=>a.questionId===q.id),last=records.at(-1);return card(q,'<p>최근 풀이: '+esc(new Date(last.submittedAt).toLocaleString("ko-KR"))+'</p><p>틀린 횟수 '+records.filter(a=>a.correct===false).length+'회 · 최근 결과 '+(last.correct===true?'정답':last.correct===false?'오답':last.reviewGrade==='ungraded'?'판단 보류':'직접 비교 대기')+'</p><details><summary>이전 답·정답 확인</summary><p>최근 입력 답</p><div class="bank-answer-preview">'+esc(last.answer)+'</div><p>정답</p><div class="bank-answer-preview">'+esc(displayAnswer(q))+'</div></details>');}).join("")+'</div>':'<div class="bank-empty"><p>아직 기록된 오답이 없습니다.</p></div>');
}
function statsHTML(s){return '<p>풀이 '+s.total+' · 정답 '+s.correct+' · 오답 '+s.wrong+' · 판정 대기 '+s.pending+'</p><p>정답률 '+(s.rate===null?'—':s.rate+'%')+' · 평균 풀이시간 '+s.average+'초</p>';}
function renderProgress(){
 const all=getAttempts(),today=localDay(),cutoff=new Date();cutoff.setHours(0,0,0,0);cutoff.setDate(cutoff.getDate()-6);
 const week=all.filter(a=>a.submittedAt>=cutoff.getTime());
 root.innerHTML='<h2>내 학습현황</h2><p>SQL 직접 비교를 마치면 정답률에 반영됩니다.</p><section class="bank-empty"><h3>오늘 · '+today+'</h3>'+statsHTML(summarizeAttempts(all.filter(a=>localDay(new Date(a.submittedAt))===today)))+'</section><h3>최근 7일 · 오늘 포함</h3><div class="bank-progress-grid">'+languages.map(language=>'<article><h3>'+language+'</h3>'+statsHTML(summarizeAttempts(week.filter(a=>bank.find(q=>q.id===a.questionId)?.language===language)))+'</article>').join("")+'</div><details><summary>학습기록 관리</summary><p>삭제하면 이 기기에 저장된 풀이와 오답노트가 모두 지워지며 복구할 수 없습니다.</p>'+button("export-learning","학습 기록 내보내기")+'<label for="import-learning">학습 기록 가져오기 (JSON, 현재 기록과 병합)</label><input id="import-learning" type="file" accept=".json,application/json"><p id="import-status" role="status"></p>'+button("confirm-clear","내 학습기록 삭제")+'<div id="clear-confirm"></div></details>';
}
function openQuestion(id,fresh=false){
 id=aliases[id]||id;
 const q=bank.find(q=>q.id===id);if(!q)return;
 const previous=getSession(id),now=Date.now();current=q;
 // Wrong-note reattempts and explicit retries always start a fresh thinking period.
 if(!fresh&&view!=="wrong"&&canResumeUnfinishedAttempt(previous,now))attempt=previous;
 else attempt={id:globalThis.crypto?.randomUUID?.()||id+"-"+now,questionId:id,startedAt:now,submittedAt:null,answer:"",correct:null,viewedExplanation:false,hintShownAt:null,usedHint:false,autoRevealed:false,revealReason:null,retryCount:getAttempts().filter(a=>a.questionId===id).length};
 saveSession(id,attempt);savePreferences({lastQuestionId:id,learningQueue:queue.length?{ids:queue.map(q=>q.id),index:queueIndex,kind:queueKind}:null});setUrl(id);render();$("#solve-title").focus({preventScroll:true});window.scrollTo({top:0,behavior:"auto"});
}
function tablesHTML(q){return (q.tables||[]).map((t,index)=>{const hintId="table-scroll-hint-"+index;return '<div class="table-scroll" tabindex="0" role="region" aria-label="'+esc(t.name)+' 데이터 표 · 좌우 스크롤 가능" data-scroll-hint="'+hintId+'"><table><caption>'+esc(t.name)+'</caption><thead><tr>'+t.columns.map(c=>'<th scope="col">'+esc(c)+'</th>').join("")+'</tr></thead><tbody>'+t.rows.map(row=>'<tr>'+row.map(v=>'<td>'+esc(v===null?'NULL':v)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div><p id="'+hintId+'" class="scroll-hint table-scroll-hint" hidden aria-hidden="true">← 좌우로 밀어 표 보기 →</p>';}).join("");}
function renderQuestion(){
 const q=current,revealed=!!attempt.viewedExplanation,submitted=!!attempt.submittedAt;
 const traceItems=solutionTrace(q);
 const multiline=q.questionType==="sql_write"||q.answer.includes("\n"), lateEditable=attempt.autoRevealed&&!attempt.lateSubmittedAt,attributes='id="my-answer" maxlength="10000" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-describedby="answer-hint" '+((revealed||submitted)&&!lateEditable?'disabled':'');
 const input=multiline?'<textarea '+attributes+' rows="'+(q.questionType==="sql_write"?7:4)+'">'+esc(attempt.answer||"")+'</textarea>':'<input '+attributes+' type="text" enterkeyhint="done" value="'+esc(attempt.answer||"")+'">';
 const shownCode=displayCode(q);
 root.innerHTML='<article class="bank-solve">'+
  quizNavigation({count:queue.length?(queueIndex+1)+" / "+queue.length:(bank.findIndex(item=>item.id===q.id)+1)+" / "+bank.length,
    listAction:"back",jumpAction:"answer-jump"})+
  quizHeading({title:solveHeading(q),titleId:"solve-title",
    badges:[compactLabels[q.sourceType]||q.sourceType,q.language,q.difficulty],
    actions:[
      {label:"문제 공유",tone:"share",action:"share-problem",ariaLabel:"현재 문제 카드 공유"},
      {label:"링크 복사",tone:"copy",action:"copy-problem-link",ariaLabel:"현재 문제 링크 복사"},
      {label:"오류 신고",tone:"report",href:learningReportUrl("practical",q,solveHeading(q)),ariaLabel:"현재 실기문제 오류 신고"}
    ]})+
  '<p id="share-status" class="share-status" role="status" aria-live="polite"></p><p class="solve-question">'+formatQuestion(q.question)+'</p>'+tablesHTML(q)+(q.code?'<div class="code-scroll'+(q.language==="SQL"?' code-scroll--sql':'')+(codeNeedsFocus(q)?' code-scroll--complex':'')+'" tabindex="0" role="region" aria-label="'+esc(q.language)+' 문제 코드'+(q.language==="SQL"?'':' · 좌우 스크롤 가능')+'" data-scroll-hint="code-scroll-hint"><pre><code>'+highlightCode(shownCode)+'</code></pre></div><p id="code-scroll-hint" class="scroll-hint code-scroll-hint" hidden aria-hidden="true">← 좌우로 밀어 코드 보기 →</p>'+codeToolsHTML(q,shownCode):'')+(q.inputData?'<h3>입력 데이터</h3><pre class="input-data">'+esc(q.inputData)+'</pre>':'')+'<form id="answer-form" class="quiz-answer"><label for="my-answer">내가 생각한 정답</label>'+input+'<p class="hint" id="answer-hint">'+(q.grading==="self"?'SQL은 예시답과 직접 비교해 판정합니다.':'출력의 대소문자와 줄바꿈을 확인하세요.')+'</p><div class="quiz-solve-actions" role="group" aria-label="문제 풀이 도움말">'+
   '<button type="button" id="practical-hint-button" class="quiz-solve-action quiz-solve-action--hint" data-action="toggle-hint" aria-controls="solve-hint" aria-expanded="false">힌트 보기</button>'+
   '<button type="submit" id="submit-answer" class="study-open quiz-solve-action quiz-solve-action--answer" aria-controls="answer-result" aria-expanded="false">정답·해설 보기</button>'+
   (traceItems.length?'<button type="button" id="practical-trace-button" class="quiz-solve-action quiz-solve-action--trace" data-action="toggle-trace" aria-controls="solve-trace" aria-expanded="false">값 변화 추적</button>':'')+
   '</div></form><section id="solve-hint" class="quiz-solve-panel" hidden><h3>힌트</h3><p>'+esc(q.hint||"실행 흐름을 단계별로 추적해 보세요.")+'</p></section>'+
   (traceItems.length?'<section id="solve-trace" class="quiz-solve-panel" hidden><h3>값 변화 추적</h3><ol>'+traceItems.map(item=>'<li>'+esc(item)+'</li>').join("")+'</ol></section>':'')+
   '<div id="answer-result"></div><nav class="study-nav">'+button("previous","이전 문제",queueIndex<=0?'disabled':'')+button("next",queue.length&&queueIndex===queue.length-1?(queueKind==="bank"?"목록으로":"세트 결과 보기"):"다음 문제")+'</nav></article>';
 const choices=queue.length?queue:sorted(basicPool());
 const sidebar=document.createElement("aside");
 sidebar.className="study-side-list";
 sidebar.innerHTML='<h2>문제 목록</h2><div role="list">'+choices.map(item=>'<button type="button" data-action="pick-question" data-id="'+esc(item.id)+'"'+(item.id===q.id?' aria-current="true"':'')+'>'+esc(item.language+" · "+item.title)+'</button>').join("")+'</div>';
 root.prepend(sidebar);
 root.classList.add("study-split");
 requestAnimationFrame(()=>{updateHorizontalScrollHints();observeSolveActions();});
 $("#answer-form").addEventListener("submit",event=>{
   event.preventDefault();attempt.answer=$("#my-answer").value;
   attempt.viewedExplanation=true;saveSession(q.id,attempt);revealAnswer();
   $("#result-heading").focus();
 });
 // Hint and trace use shared buttons; their click handler records hint usage.
 $("#my-answer").addEventListener("input",()=>{attempt.answer=$("#my-answer").value;saveSession(q.id,attempt);});
 if(attempt.viewedExplanation)revealAnswer({expanded:false});
 storageNotice();
}
function revealAnswer({expanded=true}={}){
 const answerButton=$("#submit-answer");
 answerButton.type="button";answerButton.dataset.action="show-answer";
 answerButton.setAttribute("aria-controls","answer-result");
 answerButton.setAttribute("aria-expanded",String(expanded));
 answerButton.textContent=expanded?"정답·해설 접기":"정답·해설 보기";
 $("#my-answer").disabled=true;
 const q=current;
 const extraExplanation=beginnerExplanation(q);
 const traceItems=solutionTrace(q);
 const traceTitle=String(q.solution?.traceTitle||"실행 순서와 값 변화");
 const traceBlock=traceItems.length?'<section class="beginner-section beginner-trace"><p class="beginner-kicker">1 · '+esc(traceTitle)+'</p><p class="line-guide">앞 단계에서 나온 값을 다음 단계의 현재 값으로 이어서 확인합니다.</p><ol class="bank-steps trace-steps">'+traceItems.map(item=>'<li>'+esc(item)+'</li>').join("")+'</ol></section>':'';
 const sourceDetails=q.history.length||q.sources.length?'<details class="bank-sources quiz-disclosure"><summary>복원정보 / 원문 출처</summary><div class="quiz-disclosure-body">'+(q.history.length?'<ul>'+q.history.map(h=>'<li>'+esc(historyLabel(h))+'</li>').join("")+'</ul>':'')+(q.sources.length?'<ul>'+q.sources.map(s=>'<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.name==="데이터셋 참고 출처 (문항·회차 일치 미검증)"?"학습 자료":s.name)+' ↗<span class="sr-only"> 외부 자료, 새 창</span></a></li>').join("")+'</ul>':'')+'</div></details>':'';
 const whyNo=traceItems.length?2:1,memoryNo=whyNo+1;
 const conceptBlock='<section class="beginner-section beginner-memory"><p class="beginner-kicker">'+memoryNo+' · 시험에서 꼭 기억할 것</p><p>'+esc(examMemory(q))+'</p></section>';
 const learningGuide='<div class="beginner-flow" aria-label="기초부터 보는 문제 풀이">'+traceBlock+
   '<section class="beginner-section beginner-why"><p class="beginner-kicker">'+whyNo+' · 왜 이 답인가?</p><p class="beginner-explanation">'+esc(extraExplanation)+'</p></section></div>';
 $("#answer-result").innerHTML='<section class="bank-result quiz-results">'+
   '<h3 tabindex="-1" id="result-heading">정답·해설</h3>'+
   quizFeedback({label:"정답·해설 공개",details:"예시 답안과 비교한 후 내 풀이 결과를 선택하세요."})+
   '<div class="answer-pair"><div><h4>내 답</h4><pre>'+esc(attempt.answer||"미입력")+
   '</pre></div><div><h4>'+(q.grading==="self"?"예시 답안":"정답")+'</h4><pre>'+esc(displayAnswer(q))+'</pre></div></div>'+
   quizDisclosure("해설",learningGuide,{open:true})+
   quizDisclosure("관련 개념",conceptBlock)+sourceDetails+
   reviewControls()+button("retry","다시 풀기")+'</section>';
 $("#answer-result").hidden=!expanded;
 const item=attempt;
 bindReview(root.querySelector(".study-review"),{bank:"practical",questionId:q.id,clientAttemptId:item.id,answerText:item.answer,
   elapsedSeconds:Math.round((Date.now()-item.startedAt)/1000),usedHint:item.usedHint},
   item.reviewGrade||(item.submittedAt?"historical":null),result=>{
     item.reviewGrade=result;item.correct=result==="correct"?true:result==="incorrect"?false:null;
     item.submittedAt=Date.now();item.elapsedSeconds=Math.round((item.submittedAt-item.startedAt)/1000);
     item.selfGraded=true;saveAttempt(item);
     if(getSession(q.id)?.id===item.id)saveSession(q.id,item);
   });
}
root.addEventListener("click",event=>{
 const b=event.target.closest("[data-action]");if(!b)return;
 const action=b.dataset.action;
 if(action==="toggle-hint"||action==="toggle-trace"){
   const panel=document.getElementById(action==="toggle-hint"?"solve-hint":"solve-trace");
   if(!panel)return;
   panel.hidden=!panel.hidden;
   b.setAttribute("aria-expanded",String(!panel.hidden));
   if(action==="toggle-hint"&&!panel.hidden){
     attempt.usedHint=true;saveSession(current.id,attempt);
   }
   return;
 }
 if(action==="show-answer"){
   const result=document.getElementById("answer-result");
   if(!result)return;
   result.hidden=!result.hidden;
   b.setAttribute("aria-expanded",String(!result.hidden));
   b.textContent=result.hidden?"정답·해설 보기":"정답·해설 접기";
   if(!result.hidden)result.querySelector("#result-heading")?.focus({preventScroll:true});
   return;
 }
 if(action==="start-today"){
   const done=new Set(getAttempts().filter(a=>a.viewedExplanation&&localDay(new Date(a.submittedAt))===localDay()).map(a=>a.questionId));
   const plan=planToday(),remaining=plan.filter(q=>!done.has(q.id));startQueue(remaining.length?remaining:plan,"today");
 }
 if(action==="quick-random")startQueue(shuffle(basicPool().filter(q=>q.sourceType==="reconstructed")).slice(0,5),"random");
 if(action==="bank-view")selectView("bank");
 if(action==="wrong-view")selectView("wrong");
 if(action==="progress-view")selectView("progress");
 if(action==="load-more"){pageLimit+=24;render();}
 if(action==="open"){
   queue=sorted(pool());queueIndex=queue.findIndex(q=>q.id===b.dataset.id);queueKind="bank";
   if(queueIndex<0){queue=[bank.find(q=>q.id===b.dataset.id)];queueIndex=0;}
   openQuestion(b.dataset.id,view==="wrong");
 }
 if(action==="resume"){
   const saved=getPreferences().learningQueue;
   if(saved&&Array.isArray(saved.ids)&&saved.ids[saved.index]===b.dataset.id&&saved.ids.every(id=>bank.some(q=>q.id===id))){queue=saved.ids.map(id=>bank.find(q=>q.id===id));queueIndex=saved.index;queueKind=saved.kind;}
   else queue=[];
   openQuestion(b.dataset.id,false);
 }
 if(action==="next-unseen"){const done=new Set(getAttempts().map(a=>a.questionId)),next=sorted(bank.filter(q=>q.sourceType==="reconstructed"&&!done.has(q.id)))[0];if(next)openQuestion(next.id,false);else status.textContent="등록된 복원문제를 모두 풀었습니다. 전체 문제에서 복습하세요.";}
 if(action==="show-all"){filters.completion="all";$("#completion-filter").value="all";render();}
 if(action==="export-learning"){const url=URL.createObjectURL(new Blob([JSON.stringify(exportLearning(),null,2)],{type:"application/json"})),link=document.createElement("a");link.href=url;link.download="kbigdata-learning-"+localDay()+".json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 if(action==="back"){selectView("bank");browserEntry.show();}
 if(action==="answer-jump"){scrollToQuizAnswer(root);return;}
 if(action==="share-problem")void shareCurrentProblem();
 if(action==="copy-problem-link")void copyCurrentProblemLink();
 if(action==="code-focus"){const dialog=$("#code-dialog");if(dialog){if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");}}
 if(action==="code-close"){const dialog=$("#code-dialog");if(dialog){if(typeof dialog.close==="function")dialog.close();else dialog.removeAttribute("open");}}
 if(action==="reset")resetFilters();
 if(action==="retry")openQuestion(current.id,true);
 if(action==="similar"){queue=[];openQuestion(b.dataset.id,true);}
 if(action==="pick-question"){
   if(!queue.length){queue=sorted(basicPool());queueKind="bank";}
   queueIndex=queue.findIndex(item=>item.id===b.dataset.id);openQuestion(b.dataset.id,false);
 }
 if(action==="previous"&&queueIndex>0)openQuestion(queue[--queueIndex].id,false);
 if(action==="next"){
   if(!queue.length){
     const done=new Set(getAttempts().map(a=>a.questionId));
     const next=basicPool().find(q=>q.id!==current.id&&!done.has(q.id))||basicPool().find(q=>q.id!==current.id);
     if(next)openQuestion(next.id,true);else selectView("home");
   }else{
     queueIndex++;if(queueIndex<queue.length)openQuestion(queue[queueIndex].id,false);
     else if(queueKind==="bank"){selectView("bank");browserEntry.show();}
     else{const count=queue.length;savePreferences({learningQueue:null});selectView("home");root.innerHTML='<section class="bank-empty"><h2 tabindex="-1">학습 완료</h2><p>'+count+'문제를 연습했습니다. 어려웠던 개념은 오답노트에서 다시 확인하세요.</p>'+button("home-view","학습 시작으로")+button("quick-random","다시 5문제")+'</section>';root.querySelector("h2").focus();}
   }
 }
 if(action==="home-view")selectView("home");

 if(action==="random-again")selectView("random");
 if(action==="start-random"){
   const exam=$("#random-exam").value,language=$("#random-language").value,source=$("#random-source").value;
   const candidates=bank.filter(q=>matchesExam(q,exam,bank)&&(language==="all"||q.language===language)&&(source==="all"||q.sourceType===source));
   queue=shuffle(candidates).slice(0,Number($("#random-count").value));queueIndex=0;queueKind="random";
   if(queue.length)openQuestion(queue[0].id,true);else $("#random-status").textContent="조건에 맞는 검증·등록된 문제가 없습니다.";
 }
 if(action==="confirm-clear")$("#clear-confirm").innerHTML='<p>학습기록을 삭제하시겠습니까?</p>'+button("delete-learning","삭제 확인")+button("cancel-delete","취소");
 if(action==="cancel-delete")$("#clear-confirm").innerHTML="";
 if(action==="delete-learning"){clearLocalLearning();render();}
});
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>selectView(b.dataset.view)));
for(const key of ["exam","language","source","difficulty","type","sort","completion","year","round"]){$("#"+key+"-filter").addEventListener("change",event=>{filters[key]=event.target.value;pageLimit=24;render();});}
document.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{filters[b.dataset.filter]=b.dataset.value;$("#"+b.dataset.filter+"-filter").value=b.dataset.value;pageLimit=24;const url=new URL(location.href);if(filters.exam==="all")url.searchParams.delete("exam");else url.searchParams.set("exam",filters.exam);history.replaceState(history.state,"",url);render();}));
let bankSearchTimer=0;$("#bank-query").addEventListener("input",event=>{const value=event.target.value;clearTimeout(bankSearchTimer);bankSearchTimer=window.setTimeout(()=>{filters.query=value;pageLimit=24;render();},80);});
$("#active-filters").addEventListener("click",event=>{
 const chip=event.target.closest("button[data-key]");
 if(!chip)return;
 const key=chip.dataset.key;
 if(key==="query"){
   clearTimeout(bankSearchTimer);filters.query="";$("#bank-query").value="";
 }else{
   filters[key]="all";$("#"+key+"-filter").value="all";
 }
 if(key==="exam"){
   const url=new URL(location.href);url.searchParams.delete("exam");history.replaceState(history.state,"",url);
 }
 pageLimit=24;render();
 ($("#active-filters button")||$("#source-filter")).focus({preventScroll:true});
});
function resetFilters(){clearTimeout(bankSearchTimer);Object.assign(filters,{exam:"all",language:"all",source:"all",difficulty:"all",type:"all",sort:"latest",query:"",completion:"all",year:"all",round:"all"});for(const key of ["exam","language","source","difficulty","type","sort","completion","year","round"])$("#"+key+"-filter").value=filters[key];$("#bank-query").value="";const url=new URL(location.href);url.searchParams.delete("exam");history.replaceState(history.state,"",url);selectView("bank");}
$("#bank-reset").addEventListener("click",resetFilters);
loadPracticalBank().then(result=>{
 bank=result.bank;aliases=result.aliases||{};
 $("#year-filter").insertAdjacentHTML("beforeend",[...new Set(bank.flatMap(q=>q.history.map(h=>h.year)))].sort((a,b)=>b-a).map(year=>'<option value="'+year+'">'+year+'년</option>').join(""));
 const saved=getPreferences().filters;
 if(saved&&typeof saved==="object"){
  for(const key of ["exam","language","source","difficulty","type","sort","completion","year","round"]){const select=$("#"+key+"-filter");if([...select.options].some(o=>o.value===saved[key])){filters[key]=saved[key];select.value=saved[key];}}
  if(typeof saved.query==="string"){filters.query=saved.query.slice(0,200);$("#bank-query").value=filters.query;}
 }
 const params=new URLSearchParams(location.search),id=params.get("id"),exam=params.get("exam"),shared=params.get("share")==="1";if(Object.keys(examLabels).includes(exam)){filters.exam=exam;$("#exam-filter").value=exam;}if(shared){const canonical=new URL(location.href);canonical.searchParams.delete("share");history.replaceState(history.state,"",canonical);}
 browserEntry=createQuestionBrowser({
   title:"정보처리 기출문제",questions:sorted(bank),
   category:q=>q.language,categoryLabel:key=>key,
   secondaryFilter:{
     label:"시험 구분",categoryLabel:"프로그래밍 언어",
     options:Object.entries(examLabels).map(([value,label])=>({value,label})),
     initialValue:Object.hasOwn(examLabels,exam)?exam:(Object.hasOwn(examLabels,filters.exam)?filters.exam:""),
     matches:(q,value)=>matchesExam(q,value,bank),
     onChange:value=>{
       filters.exam=value||"all";
       $("#exam-filter").value=filters.exam;
       savePreferences({filters:{...filters}});
       const url=new URL(location.href);
       if(value)url.searchParams.set("exam",value);
       else url.searchParams.delete("exam");
       history.replaceState(history.state,"",url);
     }
   },
   metaText:q=>{
     const types=q.sourceType==="reconstructed"
       ? [...new Set(q.history.map(h=>h.examType))]
       : (Array.isArray(q.examTypes)?q.examTypes:[]);
     const labels=types.filter(key=>Object.hasOwn(examLabels,key)).map(key=>examLabels[key]);
     const examName=labels.length===2?"기사·산업기사 공통":labels[0]||"시험 구분 미확인";
     const provenance=labels.length&&q.sourceType!=="reconstructed"?" · 학습유형":"";
     return q.language+" · "+q.id+" · "+examName+provenance;
   },
   describe:q=>q.title,searchText:q=>[q.id,questionText(q)].join(" "),
   openQuestion(q,items){queue=items;queueIndex=items.indexOf(q);queueKind="bank";openQuestion(q.id,false);},
 });
 if(browserEntry.resume(id))return;
 const savedQueue=getPreferences().learningQueue;
 if(!shared&&id&&savedQueue&&Array.isArray(savedQueue.ids)&&savedQueue.ids[savedQueue.index]===(aliases[id]||id)&&savedQueue.ids.every(id=>bank.some(q=>q.id===id))){queue=savedQueue.ids.map(id=>bank.find(q=>q.id===id));queueIndex=savedQueue.index;queueKind=savedQueue.kind;}
 if(id&&bank.some(q=>q.id===(aliases[id]||id)))openQuestion(id,shared);else{if(id)view="bank";render();browserEntry.show(false);if(id)status.textContent="요청한 문제를 찾을 수 없습니다. 목록에서 선택하세요.";}
}).catch(()=>{root.innerHTML='<div class="bank-empty"><h2>문제 데이터를 불러오지 못했습니다.</h2><p>네트워크 연결을 확인하고 페이지를 새로고침하세요.</p></div>';status.textContent="데이터 로딩 오류";});
window.addEventListener("pagehide",disconnectSolveObserver);
window.addEventListener("resize",()=>{if(current)requestAnimationFrame(()=>{updateHorizontalScrollHints();observeSolveActions();});});
function adjustKeyboard(){
 const viewport=window.visualViewport;
 const inset=viewport&&document.activeElement?.id==="my-answer"?Math.max(0,window.innerHeight-viewport.height-viewport.offsetTop):0;
 document.body.style.setProperty("--keyboard-inset",inset+"px");
}
window.visualViewport?.addEventListener("resize",adjustKeyboard);
window.visualViewport?.addEventListener("scroll",adjustKeyboard);
root.addEventListener("focusin",adjustKeyboard);root.addEventListener("focusout",()=>setTimeout(adjustKeyboard,0));
root.addEventListener("change",async event=>{
 if(event.target.id!=="import-learning")return;
 const message=$("#import-status"),file=event.target.files[0];if(!file)return;
 try{if(file.size>5*1024*1024)throw Error("5MB 이하 JSON 파일만 가져올 수 있습니다.");const count=importLearning(JSON.parse(await readFileText(file)));renderProgress();$("#import-status").textContent=count+"건을 확인하고 기존 기록과 병합했습니다.";storageNotice();}
 catch(error){message.textContent=error instanceof SyntaxError?"JSON 파일을 확인하세요.":error.message;}
});

document.addEventListener("portal-learning-sync",event=>{const node=document.getElementById("practical-cloud-status");if(node)node.textContent=event.detail?.message||"";});
