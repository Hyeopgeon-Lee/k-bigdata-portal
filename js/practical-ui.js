import {loadPracticalBank} from "./practical-data.js";
import {sourceLabels,examLabels,typeLabels,languages,escapeHTML as esc,remainingSeconds,canSubmit,canReveal,gradeAnswer,bankStats,questionText,shuffle,dailyQuestions,localDay,summarizeAttempts,highlightCode} from "./practical-core.js";
import {getAttempts,saveAttempt,getSession,saveSession,clearLocalLearning,storageAvailable,getPreferences,savePreferences,exportLearning,importLearning} from "./practical-store.js";
import {matches} from "./search.js";

const $=selector=>document.querySelector(selector),root=$("#bank-content"),status=$("#bank-status");
let bank=[],coverage={},view="bank",current=null,attempt=null,timer=null,queue=[],queueIndex=0;
const filters={exam:"all",language:"all",source:"reconstructed",difficulty:"all",type:"all",sort:"latest",query:"",completion:"unseen"};
const badge=(text,cls="")=>'<span class="badge '+cls+'">'+esc(text)+'</span>';
const button=(action,label,extra="")=>'<button type="button" class="button button-secondary" data-action="'+action+'" '+extra+'>'+esc(label)+'</button>';
const historyLabel=h=>examLabels[h.examType]+" "+h.year+"년 "+h.round+"회"+(h.questionNumber?" · "+h.questionNumber+"번":"");
function metadata(q){return '<div class="bank-badges">'+badge(sourceLabels[q.sourceType],"source-"+q.sourceType)+badge(q.language)+badge(q.difficulty)+badge(typeLabels[q.questionType])+(q.confidence?badge("복원 신뢰도 "+q.confidence):"")+'</div>';}
function latest(q){return Math.max(0,...q.history.map(h=>h.year*10+h.round));}
function storageNotice(){ $("#storage-status").textContent=storageAvailable?"":"브라우저 저장소를 사용할 수 없어 이번 화면의 임시 기록만 유지합니다. 새로고침·탭 종료 시 기록이 사라질 수 있습니다."; }
function pool(){const done=new Set(getAttempts().map(a=>a.questionId));return bank.filter(q=>(filters.completion==="all"||(filters.completion==="solved"?done.has(q.id):!done.has(q.id)))&&(filters.exam==="all"||q.history.some(h=>h.examType===filters.exam)||(q.sourceType!=="reconstructed"&&(q.examTypes||Object.keys(examLabels)).includes(filters.exam)))&&(filters.language==="all"||q.language===filters.language)&&(filters.source==="all"||q.sourceType===filters.source)&&(filters.difficulty==="all"||q.difficulty===filters.difficulty)&&(filters.type==="all"||q.questionType===filters.type)&&matches(questionText(q),filters.query));}
function sorted(items){
 const attempts=getAttempts(),rate=q=>{const a=attempts.filter(a=>a.questionId===q.id&&typeof a.correct==="boolean");return a.length?a.filter(a=>!a.correct).length/a.length:-1;};
 if(filters.sort==="random")return shuffle(items);
 const difficulty={"기본":0,"실전":1,"고난도":2};
 return [...items].sort((a,b)=>filters.sort==="frequency"?b.history.length-a.history.length||latest(b)-latest(a):filters.sort==="difficulty"?difficulty[a.difficulty]-difficulty[b.difficulty]:filters.sort==="wrong"?rate(b)-rate(a):latest(b)-latest(a));
}
function card(q,extra=""){
 const h=[...q.history].sort((a,b)=>b.year*10+b.round-a.year*10-a.round)[0];
 return '<article class="bank-card">'+metadata(q)+'<small>'+esc(h?historyLabel(h):"출제 이력 없음 · 보조 연습")+'</small><h2>'+esc(q.title)+'</h2><p>'+esc(q.concepts.join(" · "))+'</p>'+(q.sourceType==="reconstructed"?'<p class="bank-frequency">확인된 출제 '+q.history.length+'회'+(q.history.length>1?' · 재출제 문제':'')+'</p>':'')+extra+button("open","문제 풀기",'data-id="'+esc(q.id)+'"')+'</article>';
}
function stopTimer(){if(timer)clearInterval(timer);timer=null;}
function setUrl(id=null){const url=new URL(location.href);if(id)url.searchParams.set("id",id);else url.searchParams.delete("id");history.replaceState(null,"",url);}
function selectView(next){stopTimer();current=null;attempt=null;queue=[];view=next;setUrl();render();}
function render(){
 savePreferences({filters:{...filters}});
 stopTimer();$("#bank-controls").hidden=!!current||view!=="bank";
 $("#today-overview").hidden=!!current||view!=="bank";
 document.querySelectorAll("[data-view]").forEach(b=>{const selected=!current&&b.dataset.view===view;b.setAttribute("aria-pressed",String(selected));b.classList.toggle("button-primary",selected);b.classList.toggle("button-secondary",!selected);});
 status.textContent="";
 if(current){renderQuestion();return;}
 if(view==="bank"){
   const last=getPreferences().lastQuestionId,resume=bank.find(q=>q.id===last),session=resume&&getSession(resume.id);
   const resumeHTML=resume?'<aside class="paper-notice"><h2>이어서 학습하기</h2><p>'+esc(resume.title)+(session?.submittedAt?' · 제출한 문제':' · 진행 중인 문제')+'</p>'+button("resume","마지막 문제 이어서 보기",'data-id="'+esc(resume.id)+'"')+button("next-unseen","다음 미풀이 문제")+'</aside>':'';
   const available=sorted(pool());status.textContent=available.length+"개 고유 문제 · 확인된 출제 이력 "+available.filter(q=>q.sourceType==="reconstructed").flatMap(q=>q.history).length+"건";
   root.innerHTML=resumeHTML+(available.length?'<div class="bank-card-grid">'+available.map(q=>card(q)).join("")+'</div>':'<div class="bank-empty"><h2>등록된 조건의 문제가 없습니다.</h2><p>아직 검증·등록하지 못한 회차일 수 있습니다. 다른 조건을 선택하세요.</p>'+button("show-all","전체 문제 보기")+button("reset","필터 초기화")+'</div>');
 }else if(view==="today"){
   const today=dailyQuestions(bank,localDay());root.innerHTML='<h2>오늘의 문제 · '+esc(localDay())+'</h2><p>언어별 한 문제씩 권장합니다. 모두 풀어야 하는 것은 아닙니다.</p><div class="bank-card-grid">'+today.map(q=>card(q)).join("")+'</div>';
 }else if(view==="random") renderRandom();
 else if(view==="wrong")renderWrong();
 else if(view==="progress")renderProgress();
 storageNotice();
}
function renderRandom(){
 root.innerHTML='<section class="bank-empty"><h2>랜덤 종이 풀이</h2><p>중복 없이 선택합니다. 등록된 문제가 요청 수보다 적으면 가능한 수만 연습합니다.</p><div class="bank-filter-grid"><label>시험<select id="random-exam"><option value="all">전체</option>'+Object.entries(examLabels).map(([id,label])=>'<option value="'+id+'">'+label+'</option>').join("")+'</select></label><label>언어<select id="random-language"><option value="all">전체</option>'+languages.map(l=>'<option>'+l+'</option>').join("")+'</select></label><label>종류<select id="random-source"><option value="reconstructed">복원기출만</option><option value="all">전체 종류</option></select></label><label>문제 수<select id="random-count"><option>5</option><option>10</option><option>20</option></select></label></div>'+button("start-random","랜덤 연습 시작")+'<p id="random-status" role="status"></p></section>';
}
function renderWrong(){
 const all=getAttempts(),ids=[...new Set(all.filter(a=>a.correct===false).map(a=>a.questionId))];
 const items=ids.map(id=>bank.find(q=>q.id===id)).filter(Boolean);
 root.innerHTML='<h2>오답노트</h2><p>이전에 틀렸던 문제를 모았습니다. 다시 풀 때는 정답과 이전 답을 숨기고 새 60초 풀이를 시작합니다.</p>'+(items.length?'<div class="bank-card-grid">'+items.map(q=>{const records=all.filter(a=>a.questionId===q.id),last=records.at(-1);return card(q,'<p>최근 풀이: '+esc(new Date(last.submittedAt).toLocaleString("ko-KR"))+'</p><p>틀린 횟수 '+records.filter(a=>a.correct===false).length+'회 · 최근 결과 '+(last.correct===true?'정답':last.correct===false?'오답':'직접 비교 대기')+'</p><details><summary>이전 답·정답 확인</summary><p>최근 입력 답</p><div class="bank-answer-preview">'+esc(last.answer)+'</div><p>정답</p><div class="bank-answer-preview">'+esc(q.answer)+'</div></details>');}).join("")+'</div>':'<div class="bank-empty"><p>아직 기록된 오답이 없습니다.</p></div>');
}
function statsHTML(s){return '<p>풀이 '+s.total+' · 정답 '+s.correct+' · 오답 '+s.wrong+' · 판정 대기 '+s.pending+'</p><p>정답률 '+(s.rate===null?'—':s.rate+'%')+' · 평균 풀이시간 '+s.average+'초</p>';}
function renderProgress(){
 const all=getAttempts(),today=localDay(),cutoff=new Date();cutoff.setHours(0,0,0,0);cutoff.setDate(cutoff.getDate()-6);
 const week=all.filter(a=>a.submittedAt>=cutoff.getTime());
 root.innerHTML='<h2>내 학습현황</h2><p>제출한 풀이 시도 기준입니다. 재풀이도 한 번의 시도로 집계하며 미판정 SQL은 정답률에서 제외합니다.</p><section class="bank-empty"><h3>오늘 · '+today+'</h3>'+statsHTML(summarizeAttempts(all.filter(a=>localDay(new Date(a.submittedAt))===today)))+'</section><h3>최근 7일 · 오늘 포함</h3><div class="bank-progress-grid">'+languages.map(language=>'<article><h3>'+language+'</h3>'+statsHTML(summarizeAttempts(week.filter(a=>bank.find(q=>q.id===a.questionId)?.language===language)))+'</article>').join("")+'</div><p class="hint">다른 브라우저·기기와 동기화되지 않습니다. 순위와 학생 간 비교는 제공하지 않습니다.</p><details><summary>학습기록 관리</summary><p>삭제하면 이 기기에 저장된 풀이와 오답노트가 모두 지워지며 복구할 수 없습니다.</p>'+button("export-learning","학습 기록 내보내기")+'<label for="import-learning">학습 기록 가져오기 (JSON, 현재 기록과 병합)</label><input id="import-learning" type="file" accept=".json,application/json"><p id="import-status" role="status"></p>'+button("confirm-clear","내 학습기록 삭제")+'<div id="clear-confirm"></div></details>';
}
function openQuestion(id,fresh=false){
 const q=bank.find(q=>q.id===id);if(!q)return;
 const previous=getSession(id),now=Date.now();current=q;
 // Wrong-note reattempts and explicit retries always start a fresh thinking period.
 if(!fresh&&previous&&Number.isFinite(previous.startedAt)&&previous.startedAt<=now&&(!previous.submittedAt||view!=="wrong"))attempt=previous;
 else attempt={id:globalThis.crypto?.randomUUID?.()||id+"-"+now,questionId:id,startedAt:now,submittedAt:null,answer:"",correct:null,viewedExplanation:false,retryCount:getAttempts().filter(a=>a.questionId===id).length};
 saveSession(id,attempt);savePreferences({lastQuestionId:id});setUrl(id);render();$("#solve-title").focus({preventScroll:true});$("#solve-title").scrollIntoView({block:"start",behavior:"auto"});
}
function tablesHTML(q){return (q.tables||[]).map(t=>'<div class="table-scroll" tabindex="0" role="region" aria-label="'+esc(t.name)+' 데이터 표"><table><caption>'+esc(t.name)+'</caption><thead><tr>'+t.columns.map(c=>'<th scope="col">'+esc(c)+'</th>').join("")+'</tr></thead><tbody>'+t.rows.map(row=>'<tr>'+row.map(v=>'<td>'+esc(v===null?'NULL':v)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>').join("");}
function renderQuestion(){
 const q=current,submitted=!!attempt.submittedAt;
 root.innerHTML='<article class="bank-solve">'+button("back","← 문제 목록")+'<p class="section-kicker">'+(queue.length?'랜덤 연습 '+(queueIndex+1)+' / '+queue.length:esc(q.id))+'</p><h2 id="solve-title" tabindex="-1">'+esc(q.title)+'</h2>'+metadata(q)+'<aside class="paper-notice"><strong>반드시 종이와 펜으로 직접 풀어보세요.</strong><p>코드를 실행하거나 AI에게 질문하지 말고, 변수 값과 실행 순서를 직접 추적하세요.</p></aside><p>'+esc(q.question)+'</p>'+tablesHTML(q)+(q.code?'<div class="code-scroll" tabindex="0" role="region" aria-label="'+esc(q.language)+' 문제 코드 · 좌우 스크롤 가능"><pre><code>'+highlightCode(q.code)+'</code></pre></div>':'')+(q.inputData?'<h3>입력 데이터</h3><pre>'+esc(q.inputData)+'</pre>':'')+'<p class="bank-timer" id="solve-timer" role="timer" aria-live="off"></p><p id="gate-status" role="status"></p><form id="answer-form"><label for="my-answer">내가 생각한 정답</label><textarea id="my-answer" rows="'+(q.language==="SQL"?5:3)+'" required maxlength="10000" '+(submitted?'disabled':'')+' placeholder="종이에 풀이한 답을 입력하세요.">'+esc(attempt.answer||"")+'</textarea><p class="hint">'+(q.grading==="self"?'SQL 작성은 동등한 표현이 여러 개일 수 있어 예시 답안과 직접 비교합니다.':'대소문자·출력 줄바꿈도 확인하세요. 앞뒤 공백과 연속 가로 공백은 무시합니다.')+'</p><button id="submit-answer" class="button button-primary" type="submit" disabled>내 답 제출</button></form><div class="practice-actions"><button id="reveal-answer" class="button button-secondary" type="button" data-action="reveal" disabled>풀이 및 정답 보기</button></div><div id="answer-result"></div><section class="job-section"><h3>확인한 출제 이력</h3>'+(q.history.length?'<ul>'+q.history.map(h=>'<li>'+esc(historyLabel(h))+'</li>').join("")+'</ul>':'<p>변형·추가 연습문제에는 실제 출제 횟수를 부여하지 않습니다.</p>')+'</section></article>';
 $("#answer-form").addEventListener("submit",submitAnswer);
 $("#my-answer").addEventListener("input",()=>{if(!attempt.submittedAt){attempt.answer=$("#my-answer").value;saveSession(q.id,attempt);updateGate();}});
 updateGate();timer=setInterval(updateGate,500);
 if(attempt.viewedExplanation&&canReveal(attempt))revealAnswer();
 storageNotice();
}
function updateGate(){
 if(!current||!$("#solve-timer"))return;
 const remaining=remainingSeconds(attempt.startedAt),submitted=!!attempt.submittedAt;
 $("#solve-timer").textContent=remaining?' 정답 확인까지 '+String(Math.floor(remaining/60)).padStart(2,"0")+':'+String(remaining%60).padStart(2,"0"):submitted?'내 답 제출 완료':'60초가 지났습니다. 자신의 답을 먼저 제출하세요.';
 $("#submit-answer").disabled=!canSubmit(attempt,$("#my-answer").value);
 $("#reveal-answer").disabled=!canReveal(attempt);
 if(!remaining&&timer){clearInterval(timer);timer=null;}
}
function submitAnswer(event){
 event.preventDefault();const answer=$("#my-answer").value;
 if(!canSubmit(attempt,answer)){$("#gate-status").textContent="60초 동안 직접 풀고 자신의 답을 입력한 뒤 제출하세요.";return;}
 const now=Date.now();attempt={...attempt,answer,submittedAt:now,elapsedSeconds:Math.round((now-attempt.startedAt)/1000),correct:gradeAnswer(current,answer)};
 saveSession(current.id,attempt);saveAttempt(attempt);$("#my-answer").disabled=true;updateGate();$("#gate-status").textContent="답을 제출했습니다. 풀이 및 정답 보기로 비교하세요.";$("#reveal-answer").focus();storageNotice();
}
function revealAnswer(){
 if(!canReveal(attempt)){$("#gate-status").textContent="60초 대기와 답 제출을 먼저 완료하세요.";return;}
 attempt.viewedExplanation=true;saveSession(current.id,attempt);saveAttempt(attempt);
 const q=current,similar=bank.filter(item=>item.originalQuestionId===q.id||q.originalQuestionId&&item.originalQuestionId===q.originalQuestionId&&item.id!==q.id);
 $("#answer-result").innerHTML='<section class="bank-result"><h3 tabindex="-1" id="result-heading">'+(attempt.correct===true?'정답입니다':attempt.correct===false?'오답입니다 · 오답노트에 저장했습니다':'예시 답안과 직접 비교하세요')+'</h3><h4>내 답</h4><pre>'+esc(attempt.answer)+'</pre><h4>'+(q.grading==="self"?'예시 정답':'정답')+'</h4><pre>'+esc(q.answer)+'</pre><h3>단계별 풀이</h3><ol class="bank-steps">'+q.steps.map(step=>'<li>'+esc(step)+'</li>').join("")+'</ol><p>'+esc(q.explanation)+'</p>'+(q.grading==="self"?'<p>동등한 SQL은 정답으로 기록할 수 있습니다. 결과와 그룹·조건을 확인하고 선택하세요.</p><div class="practice-actions">'+button("self-correct","비교 완료 · 정답으로 기록")+button("self-wrong","비교 완료 · 오답으로 기록")+'</div>':'')+'<details class="bank-sources"><summary>복원 출처·검토 메모 확인</summary>'+(q.sources.length?'<ul>'+q.sources.map(s=>'<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.name)+' ↗<span class="sr-only"> 외부 복원자료, 새 창</span></a></li>').join("")+'</ul><p>'+esc(q.verificationNote)+'</p>':'<p>포털 자체 작성 연습문제입니다. 실제 출제된 문제라는 뜻이 아닙니다.</p>')+'</details><div class="practice-actions">'+button("retry","다시 풀기 · 새 60초")+similar.map(s=>button("similar","같은 개념의 변형문제 풀기",'data-id="'+esc(s.id)+'"')).join("")+(queue.length?button("next",queueIndex+1===queue.length?'랜덤 연습 완료':'다음 문제'):"")+'</div></section>';
 $("#result-heading").focus({preventScroll:true});$("#result-heading").scrollIntoView({block:"start",behavior:"auto"});
}
root.addEventListener("click",event=>{
 const b=event.target.closest("[data-action]");if(!b)return;
 const action=b.dataset.action;
 if(action==="open")openQuestion(b.dataset.id,true);
 if(action==="resume")openQuestion(b.dataset.id,false);
 if(action==="next-unseen"){const done=new Set(getAttempts().map(a=>a.questionId)),next=sorted(bank.filter(q=>q.sourceType==="reconstructed"&&!done.has(q.id)))[0];if(next)openQuestion(next.id,false);else status.textContent="등록된 복원문제를 모두 풀었습니다. 전체 문제에서 복습하세요.";}
 if(action==="show-all"){filters.completion="all";$("#completion-filter").value="all";render();}
 if(action==="export-learning"){const url=URL.createObjectURL(new Blob([JSON.stringify(exportLearning(),null,2)],{type:"application/json"})),link=document.createElement("a");link.href=url;link.download="kbigdata-learning-"+localDay()+".json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 if(action==="back")selectView("bank");
 if(action==="reset")resetFilters();
 if(action==="retry")openQuestion(current.id,true);
 if(action==="similar"){queue=[];openQuestion(b.dataset.id,true);}
 if(action==="reveal")revealAnswer();
 if((action==="self-correct"||action==="self-wrong")&&current?.grading==="self"&&canReveal(attempt)){
   attempt.correct=action==="self-correct";saveSession(current.id,attempt);saveAttempt(attempt);revealAnswer();
 }
 if(action==="next"&&canReveal(attempt)){
   if(current.grading==="self"&&attempt.correct===null){$("#gate-status").textContent="SQL 예시와 비교해 정답/오답을 먼저 기록하세요.";return;}
   queueIndex++;if(queueIndex<queue.length)openQuestion(queue[queueIndex].id,true);else{const count=queue.length;selectView("random");root.innerHTML='<section class="bank-empty"><h2>랜덤 연습 완료</h2><p>'+count+'문제를 직접 풀이했습니다. 오답노트에서 어려웠던 개념을 다시 확인하세요.</p>'+button("random-again","다시 랜덤 연습")+'</section>';}
 }
 if(action==="random-again")selectView("random");
 if(action==="start-random"){
   const exam=$("#random-exam").value,language=$("#random-language").value,source=$("#random-source").value;
   const candidates=bank.filter(q=>(exam==="all"||q.history.some(h=>h.examType===exam)||(q.sourceType!=="reconstructed"&&(q.examTypes||Object.keys(examLabels)).includes(exam)))&&(language==="all"||q.language===language)&&(source==="all"||q.sourceType===source));
   queue=shuffle(candidates).slice(0,Number($("#random-count").value));queueIndex=0;
   if(queue.length)openQuestion(queue[0].id,true);else $("#random-status").textContent="조건에 맞는 검증·등록된 문제가 없습니다.";
 }
 if(action==="confirm-clear")$("#clear-confirm").innerHTML='<p>학습기록을 삭제하시겠습니까?</p>'+button("delete-learning","삭제 확인")+button("cancel-delete","취소");
 if(action==="cancel-delete")$("#clear-confirm").innerHTML="";
 if(action==="delete-learning"){clearLocalLearning();render();}
});
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>selectView(b.dataset.view)));
for(const key of ["exam","language","source","difficulty","type","sort","completion"]){$("#"+key+"-filter").addEventListener("change",event=>{filters[key]=event.target.value;render();});}
$("#bank-query").addEventListener("input",event=>{filters.query=event.target.value;render();});
function resetFilters(){Object.assign(filters,{exam:"all",language:"all",source:"reconstructed",difficulty:"all",type:"all",sort:"latest",query:"",completion:"unseen"});for(const key of ["exam","language","source","difficulty","type","sort","completion"])$("#"+key+"-filter").value=filters[key];$("#bank-query").value="";selectView("bank");}
$("#bank-reset").addEventListener("click",resetFilters);
loadPracticalBank().then(result=>{
 bank=result.bank;coverage=result.coverage;
 const saved=getPreferences().filters;
 if(saved&&typeof saved==="object"){
  for(const key of ["exam","language","source","difficulty","type","sort","completion"]){const select=$("#"+key+"-filter");if([...select.options].some(o=>o.value===saved[key])){filters[key]=saved[key];select.value=saved[key];}}
  if(typeof saved.query==="string"){filters.query=saved.query.slice(0,200);$("#bank-query").value=filters.query;}
 }
 const stats=bankStats(bank);
 $("#today-overview").innerHTML='<h2>오늘의 문제</h2><p class="hint">매일 언어별 한 문제씩 권장합니다. 지금 필요한 문제만 선택해도 됩니다.</p><div class="job-topic-links">'+dailyQuestions(bank,localDay()).map(q=>'<a href="practical.html?id='+esc(q.id)+'">'+esc(q.language)+' · '+esc(q.title)+' →</a>').join("")+'</div>';
 $("#bank-stats").innerHTML=[['복원기출 출제 이력',stats.history],...languages.map(l=>[l,stats.languages[l]])].map(([name,count])=>'<div><strong>'+count+'</strong><span>'+name+'</span></div>').join("");
 $("#coverage-notice").textContent=coverage.notice+' 고유 복원문제 '+stats.unique+'개 · 기사 '+stats.exams.engineer+'건 · 산업기사 '+stats.exams.industrial_engineer+'건 · 재출제 '+stats.repeated+'개.';
 $("#coverage-pending").textContent="검토일 "+coverage.reviewDate+" · 아직 확보하지 못한 범위: "+coverage.pending;$("#confidence-policy").textContent=coverage.confidencePolicy;
 const params=new URLSearchParams(location.search),id=params.get("id"),exam=params.get("exam");if(Object.keys(examLabels).includes(exam)){filters.exam=exam;$("#exam-filter").value=exam;}
 if(id&&bank.some(q=>q.id===id))openQuestion(id);else{render();if(id)status.textContent="요청한 문제를 찾을 수 없습니다. 등록된 목록에서 선택하세요.";}
}).catch(()=>{root.innerHTML='<div class="bank-empty"><h2>문제 데이터를 불러오지 못했습니다.</h2><p>네트워크 연결을 확인하고 페이지를 새로고침하세요.</p></div>';status.textContent="데이터 로딩 오류";});
window.addEventListener("pagehide",stopTimer);
window.addEventListener("pageshow",()=>{if(current){updateGate();if(!attempt.submittedAt&&remainingSeconds(attempt.startedAt)>0&&!timer)timer=setInterval(updateGate,500);}});
root.addEventListener("change",async event=>{
 if(event.target.id!=="import-learning")return;
 const message=$("#import-status"),file=event.target.files[0];if(!file)return;
 try{if(file.size>5*1024*1024)throw Error("5MB 이하 JSON 파일만 가져올 수 있습니다.");const count=importLearning(JSON.parse(await file.text()));renderProgress();$("#import-status").textContent=count+"건을 확인하고 기존 기록과 병합했습니다.";storageNotice();}
 catch(error){message.textContent=error instanceof SyntaxError?"JSON 파일을 확인하세요.":error.message;}
});
