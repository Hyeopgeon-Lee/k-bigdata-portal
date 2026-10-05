import {loadPracticalBank} from "./practical-data.js?v=20261005-codefmt-2";
import {HINT_SECONDS,ANSWER_SECONDS,examLabels,typeLabels,languages,escapeHTML as esc,remainingSeconds,remainingAnswerSeconds,hintAvailable,answerDeadlineReached,canSubmit,canReveal,gradeAnswer,questionText,shuffle,recommendFive,matchesExam,localDay,summarizeAttempts,highlightCode,formatCodeForDisplay} from "./practical-core.js?v=20261005-codefmt-2";
import {getAttempts,saveAttempt,getSession,saveSession,clearLocalLearning,storageAvailable,getPreferences,savePreferences,exportLearning,importLearning} from "./practical-store.js";
import {matches} from "./search.js";

const $=selector=>document.querySelector(selector),root=$("#bank-content"),status=$("#bank-status");
let bank=[],view="home",current=null,attempt=null,timer=null,queue=[],queueIndex=0,aliases={},pageLimit=24,queueKind="random",solveActionsObserver=null;
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
function formatQuestion(text){
 const value=String(text||"").replace(" 공개 복원자료 간 초기 배열 순서 차이가 있어 아래 코드의 초기값을 기준으로 풀이합니다.","");
 const safe=esc(value);
 return value.length>=80?safe.replace(/([.!?])\s+/g,"$1<br>"):safe;
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
function stopTimer(){if(timer)clearInterval(timer);timer=null;solveActionsObserver?.disconnect();solveActionsObserver=null;}
function setUrl(id=null){const url=new URL(location.href);if(id)url.searchParams.set("id",id);else url.searchParams.delete("id");history.replaceState(null,"",url);}
function selectView(next){stopTimer();current=null;attempt=null;queue=[];view=next;pageLimit=24;setUrl();render();window.scrollTo({top:0,behavior:"auto"});}
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
 const labels={exam:examLabels[filters.exam],language:filters.language,source:compactLabels[filters.source],difficulty:filters.difficulty,type:typeLabels[filters.type],completion:filters.completion==="unseen"?"미풀이":filters.completion==="solved"?"풀이 완료":null,year:filters.year,round:filters.round==="all"?null:filters.round+"회"};
 $("#active-filters").innerHTML=Object.entries(labels).filter(([key,label])=>label&&filters[key]!=="all").map(([key,label])=>button("remove-filter",label+" ×",'data-key="'+key+'"')).join("");
}
function render(){
 savePreferences({filters:{...filters}});
 stopTimer();$("#bank-controls").hidden=!!current||view!=="bank";
 $("#quick-filters").hidden=!!current||!["home","bank"].includes(view);
 $("#study-intro").hidden=!!current||view!=="home";
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
 const all=getAttempts(),ids=[...new Set(all.filter(a=>a.correct===false).map(a=>a.questionId))];
 const items=ids.map(id=>bank.find(q=>q.id===id)).filter(Boolean);
 root.innerHTML='<h2>오답노트</h2><p>틀렸던 문제를 다시 풀어보세요.</p>'+(items.length?'<div class="bank-card-grid">'+items.map(q=>{const records=all.filter(a=>a.questionId===q.id),last=records.at(-1);return card(q,'<p>최근 풀이: '+esc(new Date(last.submittedAt).toLocaleString("ko-KR"))+'</p><p>틀린 횟수 '+records.filter(a=>a.correct===false).length+'회 · 최근 결과 '+(last.correct===true?'정답':last.correct===false?'오답':'직접 비교 대기')+'</p><details><summary>이전 답·정답 확인</summary><p>최근 입력 답</p><div class="bank-answer-preview">'+esc(last.answer)+'</div><p>정답</p><div class="bank-answer-preview">'+esc(q.answer)+'</div></details>');}).join("")+'</div>':'<div class="bank-empty"><p>아직 기록된 오답이 없습니다.</p></div>');
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
 if(!fresh&&previous&&Number.isFinite(previous.startedAt)&&previous.startedAt<=now&&(!previous.submittedAt||view!=="wrong"))attempt=previous;
 else attempt={id:globalThis.crypto?.randomUUID?.()||id+"-"+now,questionId:id,startedAt:now,submittedAt:null,answer:"",correct:null,viewedExplanation:false,hintShownAt:null,usedHint:false,autoRevealed:false,revealReason:null,retryCount:getAttempts().filter(a=>a.questionId===id).length};
 saveSession(id,attempt);savePreferences({lastQuestionId:id,learningQueue:queue.length?{ids:queue.map(q=>q.id),index:queueIndex,kind:queueKind}:null});setUrl(id);render();$("#solve-title").focus({preventScroll:true});window.scrollTo({top:0,behavior:"auto"});
}
function tablesHTML(q){return (q.tables||[]).map((t,index)=>{const hintId="table-scroll-hint-"+index;return '<div class="table-scroll" tabindex="0" role="region" aria-label="'+esc(t.name)+' 데이터 표 · 좌우 스크롤 가능" data-scroll-hint="'+hintId+'"><table><caption>'+esc(t.name)+'</caption><thead><tr>'+t.columns.map(c=>'<th scope="col">'+esc(c)+'</th>').join("")+'</tr></thead><tbody>'+t.rows.map(row=>'<tr>'+row.map(v=>'<td>'+esc(v===null?'NULL':v)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div><p id="'+hintId+'" class="scroll-hint table-scroll-hint" hidden aria-hidden="true">← 좌우로 밀어 표 보기 →</p>';}).join("");}
function formatClock(seconds){
 const safe=Math.max(0,Number(seconds)||0);
 return String(Math.floor(safe/60)).padStart(2,"0")+":"+String(safe%60).padStart(2,"0");
}
function renderQuestion(){
 const q=current,revealed=!!attempt.viewedExplanation,submitted=!!attempt.submittedAt;
 const multiline=q.questionType==="sql_write"||q.answer.includes("\n"),attributes='id="my-answer" required maxlength="10000" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-describedby="answer-hint gate-status" '+(revealed||submitted?'disabled':'');
 const input=multiline?'<textarea '+attributes+' rows="'+(q.questionType==="sql_write"?7:4)+'">'+esc(attempt.answer||"")+'</textarea>':'<input '+attributes+' type="text" enterkeyhint="done" value="'+esc(attempt.answer||"")+'">';
 const shownCode=displayCode(q);
 root.innerHTML='<article class="bank-solve"><div class="solve-progress">'+button("back","← 학습 시작")+'<strong>'+(queue.length?(queueIndex+1)+' / '+queue.length:'문제풀이')+'</strong>'+button("answer-jump","답 입력 ↓",'aria-label="정답 입력란으로 이동"')+'</div><h2 id="solve-title" tabindex="-1">'+esc(solveHeading(q))+'</h2>'+metadata(q)+'<p class="solve-question">'+formatQuestion(q.question)+'</p>'+tablesHTML(q)+(q.code?'<div class="code-scroll'+(q.language==="SQL"?' code-scroll--sql':'')+(codeNeedsFocus(q)?' code-scroll--complex':'')+'" tabindex="0" role="region" aria-label="'+esc(q.language)+' 문제 코드'+(q.language==="SQL"?'':' · 좌우 스크롤 가능')+'" data-scroll-hint="code-scroll-hint"><pre><code>'+highlightCode(shownCode)+'</code></pre></div><p id="code-scroll-hint" class="scroll-hint code-scroll-hint" hidden aria-hidden="true">← 좌우로 밀어 코드 보기 →</p>'+codeToolsHTML(q,shownCode):'')+(q.inputData?'<h3>입력 데이터</h3><pre class="input-data">'+esc(q.inputData)+'</pre>':'')+'<form id="answer-form"><label for="my-answer">내가 생각한 정답</label>'+input+'<p class="hint" id="answer-hint">'+(q.grading==="self"?'SQL은 예시답과 직접 비교해 판정합니다.':'출력의 대소문자와 줄바꿈을 확인하세요.')+'</p></form><aside id="solve-hint" class="solve-hint" aria-live="polite" hidden><p class="solve-hint-kicker">'+HINT_SECONDS+'초 힌트</p><h3>풀이 방향</h3><p>'+esc(q.hint||"문제의 실행 흐름을 단계별로 추적해 보세요.")+'</p></aside><p id="gate-status" role="status"></p><div id="answer-result"></div><div class="solve-actions"><p class="bank-timer" id="solve-timer" role="timer" aria-live="off"></p><button id="submit-answer" class="button button-primary" form="answer-form" type="submit" disabled>답 제출하고 풀이 보기</button><button id="next-answer" class="button button-primary" type="button" data-action="next" hidden>다음 문제</button></div></article>';
 requestAnimationFrame(()=>{updateHorizontalScrollHints();observeSolveActions();});
 $("#answer-form").addEventListener("submit",submitAnswer);
 $("#my-answer").addEventListener("input",()=>{if(!attempt.viewedExplanation&&!attempt.submittedAt){attempt.answer=$("#my-answer").value;saveSession(q.id,attempt);updateGate();}});
 if(attempt.submittedAt&&!attempt.viewedExplanation)revealAnswer("submitted");
 else if(attempt.viewedExplanation&&canReveal(attempt))revealAnswer("resume");
 else{
  updateGate();
  if(!attempt.viewedExplanation)timer=setInterval(updateGate,500);
 }
 storageNotice();
}
function updateGate(){
 if(!current||!$("#solve-timer"))return;
 const now=Date.now(),submitted=!!attempt.submittedAt,revealed=!!attempt.viewedExplanation;
 if(!revealed&&!submitted&&answerDeadlineReached(attempt,now)){
  autoRevealAnswer(now);
  return;
 }
 const hintRemaining=remainingSeconds(attempt.startedAt,now),answerRemaining=remainingAnswerSeconds(attempt.startedAt,now);
 const hintReady=!revealed&&hintAvailable(attempt,now);
 const hintPanel=$("#solve-hint");
 if(hintPanel)hintPanel.hidden=!hintReady;
 if(hintReady&&!attempt.hintShownAt){
  attempt={...attempt,hintShownAt:now,usedHint:true};
  saveSession(current.id,attempt);
 }
 const timerEl=$("#solve-timer");
 timerEl.classList.toggle("hint-stage",hintReady);
 timerEl.classList.toggle("revealed-stage",revealed);
 if(revealed)timerEl.textContent=attempt.autoRevealed?ANSWER_SECONDS+"초 경과 · 정답 공개":"✓ 답 제출 · 풀이 공개";
 else if(submitted)timerEl.textContent="✓ 답 제출 · 풀이 공개 중";
 else if(hintRemaining>0)timerEl.textContent="힌트까지 "+formatClock(hintRemaining)+" · 제출하면 바로 채점";
 else timerEl.textContent="힌트 제공 · 정답 공개까지 "+formatClock(answerRemaining);
 const answerEl=$("#my-answer");
 $("#submit-answer").disabled=!canSubmit(attempt,answerEl?.value||"",now);
 $("#submit-answer").hidden=submitted||revealed;
 $("#next-answer").hidden=!revealed;
 $("#next-answer").disabled=current.grading==="self"&&attempt.correct===null&&!attempt.autoRevealed;
 $("#next-answer").textContent=queue.length&&queueIndex+1===queue.length?"학습 완료":"다음 문제";
 if(revealed&&timer){clearInterval(timer);timer=null;}
}
function submitAnswer(event){
 event.preventDefault();
 const answer=$("#my-answer").value,now=Date.now();
 if(!canSubmit(attempt,answer,now)){
  if(answerDeadlineReached(attempt,now)){autoRevealAnswer(now);return;}
  $("#gate-status").textContent="자신의 답을 입력한 뒤 제출하세요.";
  return;
 }
 attempt={...attempt,answer,submittedAt:now,elapsedSeconds:Math.round((now-attempt.startedAt)/1000),correct:null,autoRevealed:false,revealReason:"submitted",usedHint:!!attempt.usedHint};
 saveSession(current.id,attempt);
 saveAttempt(attempt);
 $("#my-answer").disabled=true;
 $("#my-answer").blur();
 revealAnswer("submitted",now);
 storageNotice();
}
function autoRevealAnswer(now=Date.now()){
 if(!answerDeadlineReached(attempt,now)||attempt.viewedExplanation)return;
 revealAnswer("timeout",now);
}
function revealAnswer(reason="resume",now=Date.now()){
 if(!canReveal(attempt,now)){$("#gate-status").textContent="답을 제출하거나 "+ANSWER_SECONDS+"초까지 계속 풀어보세요.";return;}
 const isAuto=reason==="timeout"||attempt.autoRevealed===true;
 if(isAuto&&!attempt.submittedAt){
  const draft=$("#my-answer")?.value??attempt.answer??"";
  attempt={...attempt,answer:draft,submittedAt:now,elapsedSeconds:Math.round((now-attempt.startedAt)/1000),correct:null,viewedExplanation:true,usedHint:true,autoRevealed:true,revealReason:"timeout",revealedAt:now};
 }else if(!attempt.viewedExplanation){
  attempt={...attempt,correct:gradeAnswer(current,attempt.answer),viewedExplanation:true,autoRevealed:false,revealReason:"submitted",revealedAt:now};
 }
 saveSession(current.id,attempt);
 saveAttempt(attempt);
 if(timer){clearInterval(timer);timer=null;}
 const answerInput=$("#my-answer");if(answerInput)answerInput.disabled=true;
 const hintPanel=$("#solve-hint");if(hintPanel)hintPanel.hidden=true;
 const q=current,similar=bank.filter(item=>item.originalQuestionId===q.id||q.originalQuestionId&&item.originalQuestionId===q.originalQuestionId&&item.id!==q.id);
 const extraExplanation=q.explanation==="공개 복원자료의 출제 범위를 참고해 새로 구성한 학습문제입니다. 특정 회차의 실제 문제와 일치함을 검증한 자료가 아닙니다."?"":q.explanation;
 const sourceDetails=q.history.length||q.sources.length?'<details class="bank-sources"><summary>출제 이력 · 출처</summary>'+(q.history.length?'<ul>'+q.history.map(h=>'<li>'+esc(historyLabel(h))+'</li>').join("")+'</ul>':'')+(q.sources.length?'<ul>'+q.sources.map(s=>'<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.name==="데이터셋 참고 출처 (문항·회차 일치 미검증)"?"학습 자료":s.name)+' ↗<span class="sr-only"> 외부 자료, 새 창</span></a></li>').join("")+'</ul>':'')+'</details>':'';
 const resultTitle=attempt.autoRevealed?ANSWER_SECONDS+"초가 지나 정답을 공개했습니다":attempt.correct===true?'정답입니다':attempt.correct===false?'오답입니다 · 오답노트에 저장했습니다':'예시 답안과 직접 비교하세요';
 const learnerLabel=attempt.autoRevealed?ANSWER_SECONDS+"초 시점 작성 중인 답":'내 답';
 const learnerAnswer=attempt.answer?.trim()?attempt.answer:'미제출';
 const selfJudge=q.grading==="self"&&!attempt.autoRevealed?'<p>동등한 SQL은 정답으로 기록할 수 있습니다.</p><div class="practice-actions">'+button("self-correct","정답으로 기록")+button("self-wrong","오답으로 기록")+'</div>':'';
 $("#answer-result").innerHTML='<section class="bank-result"><h3 tabindex="-1" id="result-heading">'+esc(resultTitle)+'</h3>'+(attempt.autoRevealed?'<p class="timeout-note">권장 풀이 시간이 끝나 자동으로 정답과 풀이를 공개했습니다. 이 시도는 정답률에 포함하지 않습니다.</p>':'')+'<div class="answer-pair"><div><h4>'+esc(learnerLabel)+'</h4><pre>'+esc(learnerAnswer)+'</pre></div><div><h4>'+(q.grading==="self"?'예시 정답':'정답')+'</h4><pre>'+esc(q.answer)+'</pre></div></div>'+selfJudge+'<div class="concept-reveal"><h3>핵심 개념</h3><p>'+esc(q.title)+'</p></div><h3>왜 이런 답인가?</h3><ol class="bank-steps">'+q.steps.map(step=>'<li>'+esc(step)+'</li>').join("")+'</ol>'+(extraExplanation?'<details><summary>추가 설명</summary><p>'+esc(extraExplanation)+'</p></details>':'')+'<div class="practice-actions">'+button("retry","다시 풀기")+similar.slice(0,3).map(s=>button("similar","비슷한 문제",'data-id="'+esc(s.id)+'" aria-label="'+esc(s.title)+' 비슷한 문제"')).join("")+'</div>'+sourceDetails+'</section>';
 updateGate();
 if(attempt.autoRevealed){
  $("#gate-status").textContent=ANSWER_SECONDS+"초가 지나 정답과 풀이를 자동 공개했습니다.";
  $("#result-heading").scrollIntoView({block:"nearest",behavior:"smooth"});
 }else{
  $("#gate-status").textContent=attempt.usedHint?"힌트 확인 후 제출한 답을 채점했습니다.":"제출한 답을 바로 채점했습니다.";
  $("#result-heading").focus({preventScroll:true});
  $("#result-heading").scrollIntoView({block:"start",behavior:"auto"});
 }
}
root.addEventListener("click",event=>{
 const b=event.target.closest("[data-action]");if(!b)return;
 const action=b.dataset.action;
 if(action==="start-today"){
   const done=new Set(getAttempts().filter(a=>a.viewedExplanation&&localDay(new Date(a.submittedAt))===localDay()).map(a=>a.questionId));
   const plan=planToday(),remaining=plan.filter(q=>!done.has(q.id));startQueue(remaining.length?remaining:plan,"today");
 }
 if(action==="quick-random")startQueue(shuffle(basicPool().filter(q=>q.sourceType==="reconstructed")).slice(0,5),"random");
 if(action==="bank-view")selectView("bank");
 if(action==="wrong-view")selectView("wrong");
 if(action==="progress-view")selectView("progress");
 if(action==="load-more"){pageLimit+=24;render();}
 if(action==="open")openQuestion(b.dataset.id,true);
 if(action==="resume"){
   const saved=getPreferences().learningQueue;
   if(saved&&Array.isArray(saved.ids)&&saved.ids[saved.index]===b.dataset.id&&saved.ids.every(id=>bank.some(q=>q.id===id))){queue=saved.ids.map(id=>bank.find(q=>q.id===id));queueIndex=saved.index;queueKind=saved.kind;}
   else queue=[];
   openQuestion(b.dataset.id,false);
 }
 if(action==="next-unseen"){const done=new Set(getAttempts().map(a=>a.questionId)),next=sorted(bank.filter(q=>q.sourceType==="reconstructed"&&!done.has(q.id)))[0];if(next)openQuestion(next.id,false);else status.textContent="등록된 복원문제를 모두 풀었습니다. 전체 문제에서 복습하세요.";}
 if(action==="show-all"){filters.completion="all";$("#completion-filter").value="all";render();}
 if(action==="export-learning"){const url=URL.createObjectURL(new Blob([JSON.stringify(exportLearning(),null,2)],{type:"application/json"})),link=document.createElement("a");link.href=url;link.download="kbigdata-learning-"+localDay()+".json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 if(action==="back")selectView("home");
 if(action==="answer-jump"){const answer=$("#my-answer");if(answer){answer.focus({preventScroll:true});answer.scrollIntoView({block:"center",behavior:"smooth"});}}
 if(action==="code-focus"){const dialog=$("#code-dialog");if(dialog){if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");}}
 if(action==="code-close"){const dialog=$("#code-dialog");if(dialog){if(typeof dialog.close==="function")dialog.close();else dialog.removeAttribute("open");}}
 if(action==="reset")resetFilters();
 if(action==="retry")openQuestion(current.id,true);
 if(action==="similar"){queue=[];openQuestion(b.dataset.id,true);}
 if((action==="self-correct"||action==="self-wrong")&&current?.grading==="self"&&!attempt.autoRevealed&&canReveal(attempt)){
   attempt.correct=action==="self-correct";saveSession(current.id,attempt);saveAttempt(attempt);revealAnswer();
 }
 if(action==="next"&&canReveal(attempt)){
   if(current.grading==="self"&&attempt.correct===null&&!attempt.autoRevealed){$("#gate-status").textContent="SQL 예시와 비교해 정답/오답을 먼저 기록하세요.";return;}
   if(!queue.length){
     const done=new Set(getAttempts().map(a=>a.questionId));
     const next=basicPool().find(q=>q.id!==current.id&&!done.has(q.id))||basicPool().find(q=>q.id!==current.id);
     if(next)openQuestion(next.id,true);else selectView("home");
   }else{
     queueIndex++;if(queueIndex<queue.length)openQuestion(queue[queueIndex].id,true);
     else{const count=queue.length;savePreferences({learningQueue:null});selectView("home");root.innerHTML='<section class="bank-empty"><h2 tabindex="-1">학습 완료</h2><p>'+count+'문제를 연습했습니다. 어려웠던 개념은 오답노트에서 다시 확인하세요.</p>'+button("home-view","학습 시작으로")+button("quick-random","다시 5문제")+'</section>';root.querySelector("h2").focus();}
   }
 }
 if(action==="home-view")selectView("home");
 if(action==="remove-filter"){const key=b.dataset.key;if(key in filters){filters[key]="all";$("#"+key+"-filter").value="all";if(key==="exam"){const url=new URL(location.href);url.searchParams.delete("exam");history.replaceState(null,"",url);}pageLimit=24;render();}}
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
document.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{filters[b.dataset.filter]=b.dataset.value;$("#"+b.dataset.filter+"-filter").value=b.dataset.value;pageLimit=24;const url=new URL(location.href);if(filters.exam==="all")url.searchParams.delete("exam");else url.searchParams.set("exam",filters.exam);history.replaceState(null,"",url);render();}));
$("#bank-query").addEventListener("input",event=>{filters.query=event.target.value;pageLimit=24;render();});
function resetFilters(){Object.assign(filters,{exam:"all",language:"all",source:"reconstructed",difficulty:"all",type:"all",sort:"latest",query:"",completion:"unseen",year:"all",round:"all"});for(const key of ["exam","language","source","difficulty","type","sort","completion","year","round"])$("#"+key+"-filter").value=filters[key];$("#bank-query").value="";const url=new URL(location.href);url.searchParams.delete("exam");history.replaceState(null,"",url);selectView("bank");}
$("#bank-reset").addEventListener("click",resetFilters);
loadPracticalBank().then(result=>{
 bank=result.bank;aliases=result.aliases||{};
 $("#year-filter").insertAdjacentHTML("beforeend",[...new Set(bank.flatMap(q=>q.history.map(h=>h.year)))].sort((a,b)=>b-a).map(year=>'<option value="'+year+'">'+year+'년</option>').join(""));
 const saved=getPreferences().filters;
 if(saved&&typeof saved==="object"){
  for(const key of ["exam","language","source","difficulty","type","sort","completion","year","round"]){const select=$("#"+key+"-filter");if([...select.options].some(o=>o.value===saved[key])){filters[key]=saved[key];select.value=saved[key];}}
  if(typeof saved.query==="string"){filters.query=saved.query.slice(0,200);$("#bank-query").value=filters.query;}
 }
 const params=new URLSearchParams(location.search),id=params.get("id"),exam=params.get("exam");if(Object.keys(examLabels).includes(exam)){filters.exam=exam;$("#exam-filter").value=exam;}
 const savedQueue=getPreferences().learningQueue;
 if(id&&savedQueue&&Array.isArray(savedQueue.ids)&&savedQueue.ids[savedQueue.index]===(aliases[id]||id)&&savedQueue.ids.every(id=>bank.some(q=>q.id===id))){queue=savedQueue.ids.map(id=>bank.find(q=>q.id===id));queueIndex=savedQueue.index;queueKind=savedQueue.kind;}
 if(id&&bank.some(q=>q.id===(aliases[id]||id)))openQuestion(id);else{if(id)view="bank";render();if(id)status.textContent="요청한 문제를 찾을 수 없습니다. 목록에서 선택하세요.";}
}).catch(()=>{root.innerHTML='<div class="bank-empty"><h2>문제 데이터를 불러오지 못했습니다.</h2><p>네트워크 연결을 확인하고 페이지를 새로고침하세요.</p></div>';status.textContent="데이터 로딩 오류";});
window.addEventListener("pagehide",stopTimer);
window.addEventListener("pageshow",()=>{if(current){updateGate();if(!attempt.viewedExplanation&&!timer)timer=setInterval(updateGate,500);}});
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
 try{if(file.size>5*1024*1024)throw Error("5MB 이하 JSON 파일만 가져올 수 있습니다.");const count=importLearning(JSON.parse(await file.text()));renderProgress();$("#import-status").textContent=count+"건을 확인하고 기존 기록과 병합했습니다.";storageNotice();}
 catch(error){message.textContent=error instanceof SyntaxError?"JSON 파일을 확인하세요.":error.message;}
});
