import {quizNavigation,quizHeading,quizDisclosure,quizFeedback,scrollToQuizAnswer} from "./quiz-unified.js?v=20261112-answer-focus-1";
import {createQuestionBrowser} from "./question-browser.js?v=20261116-progress-v1";
import {reviewControls} from "./study-review.js?v=20261116-concurrency-1";

const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",'"':"&quot;","'":"&#39;"}[c]));
const $=selector=>document.querySelector(selector);
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const labelFor=q=>q.year+"년 "+q.round+"회 · "+q.number+"번";
const formatDate=millis=>new Date(millis).toLocaleDateString("ko-KR",{timeZone:"Asia/Seoul"});
const action=(name,label,extra="")=>'<button type="button" class="button button-secondary" data-action="'+name+'" '+extra+'>'+esc(label)+'</button>';

export function validateWrittenQuestion(q,examType){
 if(!q||typeof q!=="object"||!q.id||!/^[A-Za-z0-9_-]{1,80}$/.test(q.id))return false;
 if(q.examType!==undefined&&q.examType!==examType)return false;
 if(!Number.isInteger(q.year)||q.year<2020||q.year>2026||!Number.isInteger(q.round)||q.round<1||q.round>4||!Number.isInteger(q.number)||q.number<1)return false;
 if(!String(q.question||"").trim()||!Array.isArray(q.options)||q.options.length!==4||!q.options.every(v=>typeof v==="string"&&v.trim()))return false;
 if(!Number.isInteger(q.answer)||q.answer<1||q.answer>4)return false;
 if(!["official","reconstructed"].includes(q.sourceType)||!/^https:\/\//.test(q.sourceUrl||""))return false;
 return q.sourceVerified===true&&q.answerVerified===true&&q.republicationAllowed===true;
}

export function mountWrittenExam({examType,label,dataUrl,storageKey}){
 const root=$("#bank-content"),status=$("#bank-status"),storageStatus=$("#storage-status");
 if(!root||!status)throw Error("필기 문제풀이 화면을 찾을 수 없습니다.");
 let bank=[],browser=null,view="bank",current=null,queue=[],queueIndex=0,queueKind="bank";
 let attempt=null,records=[],lastQuestionId="",pageLimit=24,selectedAnswer=null;
 let filters={year:"all",round:"all",subject:"all",source:"all",completion:"all",sort:"latest",query:""};
 const memoryKey=storageKey||"kbigdata-written-"+examType+"-v1";
 function readStorage(){
  try{const obj=JSON.parse(localStorage.getItem(memoryKey)||"{}");
   records=Array.isArray(obj.attempts)?obj.attempts.filter(v=>v&&typeof v.id==="string"&&Number.isInteger(v.answer)&&Number.isFinite(v.at)).slice(-5000):[];
   lastQuestionId=typeof obj.lastQuestionId==="string"?obj.lastQuestionId:"";
  }catch{records=[];}
 }
 function persist(){
  try{localStorage.setItem(memoryKey,JSON.stringify({schemaVersion:1,attempts:records.slice(-5000),lastQuestionId}));storageStatus.textContent="";}
  catch{storageStatus.textContent="브라우저 저장소를 사용할 수 없어 기록이 유지되지 않을 수 있습니다.";}
 }
 readStorage();
 function getProgress(q){
  const rows=records.filter(r=>r.id===q.id);
  if(!rows.length)return {kind:"unseen",text:"미풀이"};
  const last=rows.at(-1);
  return {kind:"done",text:"풀이 완료 · "+rows.length+"회 · 최근 "+formatDate(last.at),count:rows.length};
 }
 const attemptsFor=q=>records.filter(r=>r.id===q.id);
 const solved=id=>records.some(r=>r.id===id);
 function filtered(){
  const words=filters.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const result=bank.filter(q=>
   (filters.year==="all"||String(q.year)===filters.year)&&
   (filters.round==="all"||String(q.round)===filters.round)&&
   (filters.subject==="all"||(q.subject||"기타")===filters.subject)&&
   (filters.source==="all"||q.sourceType===filters.source)&&
   (filters.completion==="all"||(filters.completion==="solved"?solved(q.id):!solved(q.id)))&&
   words.every(term=>(q.question+" "+(q.subject||"")+" "+q.options.join(" ")).toLowerCase().includes(term)));
  if(filters.sort==="random")return shuffle(result);
  if(filters.sort==="wrong")return result.sort((a,b)=>attemptsFor(b).filter(x=>!x.correct).length-attemptsFor(a).filter(x=>!x.correct).length);
  return result.sort((a,b)=>b.year-a.year||b.round-a.round||a.number-b.number);
 }
 function shuffle(items){
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
  return copy;
 }
 function setId(id){
  const url=new URL(location.href);
  if(id)url.searchParams.set("id",id);else url.searchParams.delete("id");
  history.replaceState(history.state,"",url);
 }
 function updateNav(){
  document.querySelectorAll("[data-view]").forEach(b=>{
   const active=b.dataset.view===view&&!current;
   b.setAttribute("aria-pressed",String(active));
   b.classList.toggle("button-primary",active);
   b.classList.toggle("button-secondary",!active);
  });
  $("#quick-filters").hidden=!!current||view==="bank";
  $(".bank-nav").hidden=!!current||view==="bank";
  $("#bank-controls").hidden=!!current||view!=="bank";
  $("#usage-guide").hidden=!!current;
  document.body.classList.toggle("is-solving",!!current);
 }
 function browserView(){
  current=null;root.classList.remove("study-split");updateNav();
  root.innerHTML="";status.textContent="";
  browser.show(false);
 }
 function hideBrowser(){
  const node=$(".question-browser");if(node)node.hidden=true;
  $("main").classList.remove("qb-browsing");
 }
 function selectView(next){
  view=next;current=null;selectedAnswer=null;queue=[];queueIndex=0;
  hideBrowser();setId(null);updateNav();
  if(view==="bank"){browserView();return;}
  status.textContent=bank.length+"개 검증 문항 등록";
  if(view==="home")renderHome();
  else if(view==="random")renderRandom();
  else if(view==="wrong")renderWrong();
  else if(view==="progress")renderProgress();
  window.scrollTo({top:0,behavior:"auto"});
 }
 function renderHome(){
  const todays=records.filter(r=>formatDate(r.at)===formatDate(Date.now()));
  const pool=bank.filter(q=>!solved(q.id));
  const recommended=pool.slice(0,5);
  const last=bank.find(q=>q.id===lastQuestionId);
  root.innerHTML='<div class="study-home-grid"><section class="study-start"><p class="study-kicker">TODAY PRACTICE</p><h2>오늘 조금씩, 꾸준히</h2><p>오늘 풀이 '+todays.length+'문제 · 추천 '+recommended.length+'문제</p><progress value="'+Math.min(todays.length,Math.max(1,recommended.length))+'" max="'+Math.max(1,recommended.length)+'" aria-label="오늘 학습 진행"></progress>'+
   action("start-today","오늘 5문제 시작")+'</section><aside class="study-side"><section class="study-resume"><h2>'+(last?"이어서 풀기":"학습 시작")+'</h2><p>'+(last?esc(labelFor(last)):"기출문제를 선택하고 바로 학습을 시작하세요.")+'</p>'+(last?action("resume","마지막 문제 이어서 풀기",'data-id="'+esc(last.id)+'"'):"")+'</section><div class="study-quick-menu">'+action("quick-random","랜덤 5문제")+action("wrong-view","오답노트")+action("bank-view","전체 문제")+action("progress-view","학습현황")+'</div></aside></div>'+
   (!bank.length?'<div class="bank-empty"><h2>문제 데이터 등록 전</h2><p>검증된 공개 기출문제를 등록하면 오늘의 학습 문제를 추천합니다.</p></div>':"");
 }
 function renderRandom(){
  root.innerHTML='<section class="bank-empty"><h2>랜덤 필기 풀이</h2><div class="bank-filter-grid"><label>출제년도<select id="random-year"><option value="all">전체</option>'+uniqueYears().map(v=>'<option value="'+v+'">'+v+'년</option>').join("")+'</select></label><label>회차<select id="random-round"><option value="all">전체</option>'+uniqueRounds().map(v=>'<option value="'+v+'">'+v+'회</option>').join("")+'</select></label><label>문제 수<select id="random-count"><option>5</option><option>10</option><option>20</option></select></label></div>'+action("start-random","랜덤 연습 시작")+'<p id="random-status" role="status"></p></section>';
 }
 function renderWrong(){
  const ids=[...new Set(records.filter(r=>!r.correct).map(r=>r.id))];
  const questions=ids.map(id=>bank.find(q=>q.id===id)).filter(Boolean);
  root.innerHTML='<h2>오답노트</h2><p>틀린 문제와 이전에 선택한 답을 확인하고 다시 풀어보세요.</p>'+(questions.length?
    '<div class="bank-card-grid">'+questions.map(q=>{
      const rows=attemptsFor(q),last=rows.at(-1);
      return '<article class="bank-card"><div class="bank-badges"><span class="badge">'+esc(labelFor(q))+'</span><span class="badge">'+esc(q.subject||"필기")+'</span></div><h2>'+esc(q.question)+'</h2><p>틀린 횟수 '+rows.filter(r=>!r.correct).length+'회 · 최근 '+formatDate(last.at)+'</p><details><summary>이전 답·정답 확인</summary><p>최근 선택 '+last.answer+'번 · 정답 '+q.answer+'번</p></details>'+action("open","다시 풀기",'data-id="'+esc(q.id)+'"')+'</article>';
    }).join("")+'</div>':'<div class="bank-empty"><p>아직 기록된 오답이 없습니다.</p></div>');
 }
 function stats(rows){
  const count=rows.length,right=rows.filter(r=>r.correct).length;
  const average=count?Math.round(rows.reduce((sum,r)=>sum+Number(r.elapsedSeconds||0),0)/count):0;
  return '<p>풀이 '+count+' · 정답 '+right+' · 오답 '+(count-right)+'</p><p>정답률 '+(count?Math.round(right/count*100)+"%":"—")+' · 평균 풀이시간 '+average+'초</p>';
 }
 function renderProgress(){
  const cutoff=Date.now()-7*24*3600*1000,week=records.filter(r=>r.at>=cutoff);
  root.innerHTML='<h2>내 학습현황</h2><p>이 브라우저에 저장된 필기 학습 기록입니다.</p><section class="bank-empty"><h3>오늘 · '+today()+'</h3>'+stats(records.filter(r=>formatDate(r.at)===formatDate(Date.now())))+'</section><h3>최근 7일</h3><div class="bank-progress-grid">'+
    [...new Set(bank.map(q=>q.subject||"필기"))].map(sub=>{
      const ids=new Set(bank.filter(q=>(q.subject||"필기")===sub).map(q=>q.id));
      return '<article><h3>'+esc(sub)+'</h3>'+stats(week.filter(r=>ids.has(r.id)))+'</article>';
    }).join("")+'</div><details><summary>학습기록 관리</summary><p>브라우저 학습기록을 백업하거나 삭제할 수 있습니다.</p>'+action("export-learning","학습 기록 내보내기")+
    '<label for="import-learning">학습 기록 가져오기 (JSON)</label><input id="import-learning" type="file" accept="application/json,.json"><p id="import-status" role="status"></p>'+
    action("confirm-clear","내 학습기록 삭제")+'<div id="clear-confirm"></div></details>';
 }
 function uniqueYears(){return [...new Set(bank.map(q=>q.year))].sort((a,b)=>b-a);}
 function uniqueRounds(){return [...new Set(bank.map(q=>q.round))].sort((a,b)=>a-b);}
 function fillFilters(){
  const fill=(id,list,label)=>{
   const select=$("#"+id+"-filter"),value=select.value;
   select.innerHTML='<option value="all">전체</option>'+list.map(v=>'<option value="'+esc(v)+'">'+esc(v)+label+'</option>').join("");
   select.value=list.map(String).includes(value)?value:"all";
  };
  fill("year",uniqueYears(),"년");fill("round",uniqueRounds(),"회");
  fill("subject",[...new Set(bank.map(q=>q.subject||"필기"))].sort(),"");
 }
 function renderFilteredBank(){
  const items=filtered();
  status.textContent=items.length+"문제";
  root.innerHTML=items.length?'<div class="bank-card-grid">'+items.slice(0,pageLimit).map(q=>'<article class="bank-card"><div class="bank-badges"><span class="badge">'+esc(labelFor(q))+'</span><span class="badge">'+esc(q.subject||"필기")+'</span></div><h2>'+esc(q.question)+'</h2>'+action("open","문제 풀기",'data-id="'+esc(q.id)+'"')+'</article>').join("")+'</div>'+(items.length>pageLimit?action("load-more","문제 더 보기"):""):
   '<div class="bank-empty"><h2>조건에 맞는 문제가 없습니다.</h2><p>필터를 변경하거나 등록된 회차를 확인하세요.</p>'+action("reset","필터 초기화")+'</div>';
 }
 function openQuestion(id,items=null,fresh=false){
  const q=bank.find(item=>item.id===id);if(!q)return;
  if(items){queue=items;queueIndex=Math.max(0,queue.findIndex(item=>item.id===q.id));queueKind="bank";}
  else if(!queue.length){queue=filtered();queueIndex=Math.max(0,queue.findIndex(item=>item.id===q.id));queueKind="bank";}
  current=q;lastQuestionId=q.id;persist();selectedAnswer=null;hideBrowser();setId(q.id);
  const previous=records.filter(r=>r.id===q.id).at(-1);
  attempt={startedAt:Date.now(),usedHint:false,revealed:false,recorded:false,answer:null,correct:null};
  if(!fresh&&previous&&previous.answer>=1&&previous.answer<=4){/* A new attempt begins without preselecting the prior answer. */}
  updateNav();renderQuestion();root.querySelector("#solve-title")?.focus({preventScroll:true});window.scrollTo({top:0,behavior:"auto"});
 }
 function renderQuestion(){
  const q=current,source=q.sourceType==="official"?"공식 공개":"복원기출";
  const answerMarkup=q.options.map((option,i)=>{
    const num=i+1,picked=selectedAnswer===num;
    return '<button type="button" class="ncp-choice written-choice'+(picked?' is-selected':'')+'" data-answer-index="'+num+'" aria-pressed="'+String(picked)+'" '+(attempt.revealed?'disabled':'')+'><span class="written-choice-num">'+num+'</span><span>'+esc(option).replace(/\n/g,"<br>")+'</span></button>';
  }).join("");
  root.classList.add("study-split");root.innerHTML='<article class="bank-solve">'+
   quizNavigation({count:queue.length?(queueIndex+1)+" / "+queue.length:"1 / 1",listAction:"back",jumpAction:"answer-jump"})+
   quizHeading({title:label+" "+labelFor(q),titleId:"solve-title",badges:[source,q.subject||"필기",q.year+"년 "+q.round+"회"],
     actions:[{label:"문제 공유",tone:"share",action:"share-problem",ariaLabel:"현재 문제 공유"},
       {label:"링크 복사",tone:"copy",action:"copy-problem-link",ariaLabel:"현재 문제 링크 복사"},
       {label:"오류 신고",tone:"report",href:reportUrl(q),ariaLabel:"현재 필기문제 오류 신고"}]})+
   '<p id="share-status" class="share-status" role="status" aria-live="polite"></p>'+
   '<p class="solve-question">'+esc(q.question).replace(/\n/g,"<br>")+'</p>'+
   (q.code?'<div class="code-scroll" tabindex="0" role="region" aria-label="문제 코드"><pre><code>'+esc(q.code)+'</code></pre></div>':"")+
   '<form id="answer-form" class="quiz-answer"><label>내가 생각한 정답</label><div class="ncp-options written-options" role="group" aria-label="정답 선택">'+answerMarkup+'</div>'+
   '<p class="hint" id="answer-hint">정답이라고 생각하는 보기 하나를 선택하세요.</p>'+
   '<div class="quiz-solve-actions" role="group" aria-label="문제 풀이 도움말">'+
   '<button type="button" class="quiz-solve-action quiz-solve-action--hint" data-action="toggle-hint" aria-controls="solve-hint" aria-expanded="false">힌트 보기</button>'+
   '<button type="submit" class="study-open quiz-solve-action quiz-solve-action--answer" id="submit-answer" aria-controls="answer-result" aria-expanded="false">정답·해설 보기</button></div></form>'+
   '<section id="solve-hint" class="quiz-solve-panel" hidden><h3>힌트</h3><p>'+esc(q.hint||"문제의 핵심 개념과 선택지의 차이를 비교하세요.")+'</p></section>'+
   '<div id="answer-result"></div><nav class="study-nav">'+action("previous","이전 문제",queueIndex<=0?'disabled':'')+action("next",queueIndex>=queue.length-1?'':'')+'</nav></article>';
  const sidebar=document.createElement("aside");sidebar.className="study-side-list";
  sidebar.innerHTML='<h2>문제 목록</h2><div role="list">'+queue.map(item=>'<button type="button" data-action="pick-question" data-id="'+esc(item.id)+'"'+(item.id===q.id?' aria-current="true"':'')+'>'+esc(labelFor(item))+'</button>').join("")+'</div>';
  root.prepend(sidebar);
  $("#answer-form").addEventListener("submit",event=>{
   event.preventDefault();
   if(attempt.revealed){toggleAnswer();return;}
   if(!selectedAnswer){$("#answer-hint").textContent="정답을 먼저 선택하세요.";return;}
   attempt.answer=selectedAnswer;attempt.correct=selectedAnswer===q.answer;attempt.revealed=true;attempt.recorded=true;
   const at=Date.now(),elapsedSeconds=Math.max(0,Math.round((at-attempt.startedAt)/1000));
   records.push({id:q.id,year:q.year,round:q.round,answer:selectedAnswer,correct:attempt.correct,at,elapsedSeconds,usedHint:attempt.usedHint});
   records=records.slice(-5000);persist();browser?.refresh();
   revealAnswer();
   $("#result-heading")?.focus({preventScroll:true});
  });
 }
 function revealAnswer(){
  const q=current,correct=attempt.correct,selected=attempt.answer;
  root.querySelectorAll(".written-choice").forEach(button=>{
    const n=Number(button.dataset.answerIndex);
    button.disabled=true;
    button.classList.toggle("is-answer",n===q.answer);
    button.classList.toggle("is-mismatch",n===selected&&!correct);
  });
  const btn=$("#submit-answer");btn.type="button";btn.dataset.action="show-answer";btn.textContent="정답·해설 접기";btn.setAttribute("aria-expanded","true");
  const report='<details class="bank-sources quiz-disclosure"><summary>복원정보 / 원문 출처</summary><div class="quiz-disclosure-body"><p>'+esc(labelFor(q))+' · '+(q.sourceType==="official"?"공식 공개 문제":"비공식 복원 문제")+'</p><a target="_blank" rel="noopener noreferrer" href="'+esc(q.sourceUrl)+'">출처 확인 ↗</a></div></details>';
  $("#answer-result").innerHTML='<section class="bank-result quiz-results"><h3 tabindex="-1" id="result-heading">정답·해설</h3>'+
   quizFeedback({label:correct?"정답입니다":"오답입니다",kind:correct?"correct":"incorrect",details:"선택한 답과 정답을 비교해 보세요."})+
   '<div class="answer-pair"><div><h4>내 답</h4><pre>'+selected+'번</pre></div><div><h4>정답</h4><pre>'+q.answer+'번 · '+esc(q.options[q.answer-1])+'</pre></div></div>'+
   quizDisclosure("해설",'<section class="beginner-section beginner-why"><p class="beginner-kicker">왜 이 답인가?</p><p class="beginner-explanation">'+esc(q.explanation||"등록된 해설이 없습니다. 출처 자료를 참고하세요.").replace(/\n/g,"<br>")+'</p></section>',{open:true})+
   (q.concept?quizDisclosure("관련 개념",'<section class="beginner-section beginner-memory"><p>'+esc(q.concept)+'</p></section>'):"")+
   report+reviewControls()+action("retry","다시 풀기")+'</section>';
  const review=root.querySelector(".study-review");
  if(review){review.querySelectorAll("[data-grade]").forEach(button=>{button.disabled=true;button.setAttribute("aria-pressed",String(button.dataset.grade===(correct?"correct":"incorrect")));});review.querySelector('[role="status"]').textContent="객관식 자동 채점 · "+(correct?"정답":"오답");}
  $("#answer-result").hidden=false;
 }
 function toggleAnswer(){
  const result=$("#answer-result");if(!result)return;result.hidden=!result.hidden;
  $("#submit-answer").textContent=result.hidden?"정답·해설 보기":"정답·해설 접기";
  $("#submit-answer").setAttribute("aria-expanded",String(!result.hidden));
  if(!result.hidden)$("#result-heading")?.focus({preventScroll:true});
 }
 function reportUrl(q){
  const url=new URL("help.html",location.href);
  url.searchParams.set("source",examType+"-written");
  url.searchParams.set("id",q.id);
  return url.href;
 }
 async function copyText(value){
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);return;}
  const input=document.createElement("textarea");input.value=value;input.style.position="fixed";input.style.opacity="0";document.body.append(input);input.select();
  const ok=document.execCommand("copy");input.remove();if(!ok)throw Error("복사 실패");
 }
 function shareUrl(){
  const url=new URL(location.pathname,location.origin);url.searchParams.set("id",current.id);url.searchParams.set("share","1");return url.href;
 }
 async function shareProblem(share){
  const url=shareUrl(),message=label+" "+labelFor(current)+"\n"+current.question+"\n"+url;
  if(share&&navigator.share){try{await navigator.share({title:label+" "+labelFor(current),text:current.question,url});$("#share-status").textContent="문제를 공유했습니다.";return;}catch(e){if(e.name==="AbortError")return;}}
  try{await copyText(share?message:url);$("#share-status").textContent=share?"문제와 링크를 복사했습니다.":"문제 링크를 복사했습니다.";}catch{$("#share-status").textContent="복사에 실패했습니다.";}
 }
 function startQueue(items,kind){
  queue=items;queueIndex=0;queueKind=kind;
  if(queue.length)openQuestion(queue[0].id,null,true);
  else{const message=$("#random-status");if(message)message.textContent="조건에 맞는 검증·등록된 문제가 없습니다.";else status.textContent="등록된 문제가 없습니다.";}
 }
 root.addEventListener("click",event=>{
  const b=event.target.closest("[data-action], [data-answer-index]");if(!b)return;
  if(b.dataset.answerIndex){
   if(attempt?.revealed)return;
   selectedAnswer=Number(b.dataset.answerIndex);
   root.querySelectorAll(".written-choice").forEach(el=>{const selected=Number(el.dataset.answerIndex)===selectedAnswer;el.setAttribute("aria-pressed",String(selected));el.classList.toggle("is-selected",selected);});
   return;
  }
  const name=b.dataset.action;
  if(name==="toggle-hint"){
   const hint=$("#solve-hint");hint.hidden=!hint.hidden;b.setAttribute("aria-expanded",String(!hint.hidden));
   if(!hint.hidden&&attempt)attempt.usedHint=true;return;
  }
  if(name==="show-answer"){toggleAnswer();return;}
  if(name==="answer-jump"){scrollToQuizAnswer(root);return;}
  if(name==="back"||name==="bank-view"){selectView("bank");return;}
  if(name==="home-view"){selectView("home");return;}
  if(name==="wrong-view"){selectView("wrong");return;}
  if(name==="progress-view"){selectView("progress");return;}
  if(name==="random-again"){selectView("random");return;}
  if(name==="open"){queue=filtered();queueIndex=Math.max(0,queue.findIndex(q=>q.id===b.dataset.id));queueKind="bank";openQuestion(b.dataset.id,null,true);return;}
  if(name==="pick-question"){queueIndex=Math.max(0,queue.findIndex(q=>q.id===b.dataset.id));openQuestion(b.dataset.id);return;}
  if(name==="previous"&&queueIndex>0){openQuestion(queue[--queueIndex].id);return;}
  if(name==="next"){
   if(queueIndex<queue.length-1)openQuestion(queue[++queueIndex].id);
   else if(queueKind==="bank")selectView("bank");
   else{const count=queue.length;selectView("home");root.innerHTML='<section class="bank-empty"><h2 tabindex="-1">학습 완료</h2><p>'+count+'문제를 연습했습니다.</p>'+action("home-view","학습 시작으로")+action("wrong-view","오답노트")+'</section>';root.querySelector("h2")?.focus();}
   return;
  }
  if(name==="start-today"){startQueue(bank.filter(q=>!solved(q.id)).slice(0,5),"today");return;}
  if(name==="quick-random"){startQueue(shuffle(bank).slice(0,5),"random");return;}
  if(name==="start-random"){
   const y=$("#random-year").value,r=$("#random-round").value,count=Number($("#random-count").value);
   startQueue(shuffle(bank.filter(q=>(y==="all"||String(q.year)===y)&&(r==="all"||String(q.round)===r))).slice(0,count),"random");return;
  }
  if(name==="resume"){queue=[bank.find(q=>q.id===b.dataset.id)].filter(Boolean);queueIndex=0;queueKind="bank";openQuestion(b.dataset.id);return;}
  if(name==="retry"){openQuestion(current.id,null,true);return;}
  if(name==="show-all"){filters.completion="all";$("#completion-filter").value="all";renderFilteredBank();return;}
  if(name==="load-more"){pageLimit+=24;renderFilteredBank();return;}
  if(name==="reset"){resetFilters();return;}
  if(name==="share-problem"){void shareProblem(true);return;}
  if(name==="copy-problem-link"){void shareProblem(false);return;}
  if(name==="export-learning"){
   const blob=new Blob([JSON.stringify({schemaVersion:1,examType,attempts:records},null,2)],{type:"application/json"});
   const link=document.createElement("a"),url=URL.createObjectURL(blob);link.href=url;link.download="kbigdata-"+examType+"-written-"+today()+".json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
  }
  if(name==="confirm-clear"){$("#clear-confirm").innerHTML='<p>모든 필기 학습기록을 삭제하시겠습니까?</p>'+action("delete-learning","삭제 확인")+action("cancel-delete","취소");return;}
  if(name==="cancel-delete"){$("#clear-confirm").innerHTML="";return;}
  if(name==="delete-learning"){records=[];lastQuestionId="";persist();browser?.refresh();renderProgress();return;}
 });
 async function importLearning(event){
  if(event.target.id!=="import-learning")return;
  const file=event.target.files?.[0],notice=$("#import-status");if(!file||!notice)return;
  try{
   if(file.size>5*1024*1024)throw Error("5MB 이하 파일만 가져올 수 있습니다.");
   const content=JSON.parse(await file.text());if(content.examType!==examType||!Array.isArray(content.attempts))throw Error("다른 시험의 학습기록이거나 형식이 올바르지 않습니다.");
   const accepted=content.attempts.filter(row=>row&&/^[A-Za-z0-9_-]{1,80}$/.test(row.id)&&Number.isInteger(row.answer)&&row.answer>=1&&row.answer<=4&&typeof row.correct==="boolean"&&Number.isFinite(row.at)&&row.at>0&&Number.isFinite(row.elapsedSeconds)&&row.elapsedSeconds>=0).slice(-5000);
   records=[...records,...accepted].sort((a,b)=>a.at-b.at).slice(-5000);persist();browser?.refresh();renderProgress();$("#import-status").textContent=accepted.length+"건을 가져왔습니다.";
  }catch(e){notice.textContent=e.message||"가져오기에 실패했습니다.";}
 }
 root.addEventListener("change",event=>{void importLearning(event);});
 const sortKeys=["year","round","subject","source","completion","sort"];
 for(const key of sortKeys){$("#"+key+"-filter")?.addEventListener("change",event=>{filters[key]=event.target.value;pageLimit=24;renderFilteredBank();});}
 let timer;$("#bank-query")?.addEventListener("input",event=>{clearTimeout(timer);timer=setTimeout(()=>{filters.query=event.target.value;pageLimit=24;renderFilteredBank();},100);});
 function resetFilters(){
  filters={year:"all",round:"all",subject:"all",source:"all",completion:"all",sort:"latest",query:""};for(const key of sortKeys)$("#"+key+"-filter").value="all";
  $("#sort-filter").value="latest";$("#bank-query").value="";pageLimit=24;renderFilteredBank();
 }
 $("#bank-reset")?.addEventListener("click",resetFilters);
 async function initialize(){
  const response=await fetch(dataUrl,{cache:"no-store"});if(!response.ok)throw Error("HTTP "+response.status);
  const result=await response.json();if(!Array.isArray(result))throw Error("문제 데이터 형식 오류");
  const seen=new Set();
  bank=result.filter(q=>{
   if(!validateWrittenQuestion(q,examType)||seen.has(q.id))return false;
   seen.add(q.id);return true;
  });
  bank.sort((a,b)=>b.year-a.year||b.round-a.round||a.number-b.number);
  fillFilters();
  browser=createQuestionBrowser({
   title:label+" 필기 기출문제",questions:bank,
   category:q=>String(q.year),categoryLabel:y=>y+"년",
   secondaryFilter:{label:"회차 선택",categoryLabel:"출제년도",options:uniqueRounds().map(r=>({value:String(r),label:r+"회"})),matches:(q,r)=>String(q.round)===r},
   describe:q=>q.number+"번 · "+q.question.slice(0,85),
   searchText:q=>[q.id,q.year+"년",q.round+"회",q.subject||"",q.question,...q.options].join(" "),
   metaText:q=>labelFor(q)+" · "+(q.subject||"필기")+" · "+(q.sourceType==="official"?"공식 공개":"복원기출"),
   progressFor:getProgress,
   openQuestion(q,items){queue=items;queueIndex=items.indexOf(q);queueKind="bank";openQuestion(q.id);}
  });
  const section=$(".question-browser"),menu=document.createElement("nav");
  menu.className="bank-nav written-browser-nav";menu.setAttribute("aria-label","필기 학습 메뉴");
  menu.innerHTML='<button type="button" class="button button-secondary" data-view="home">학습 시작</button><button type="button" class="button button-primary" data-view="bank">전체 문제</button><button type="button" class="button button-secondary" data-view="random">랜덤 설정</button><button type="button" class="button button-secondary" data-view="wrong">오답노트</button><button type="button" class="button button-secondary" data-view="progress">학습현황</button>';
  section.querySelector(".qb-heading").after(menu);
  section.querySelector(".qb-progress-hint").textContent="풀이 횟수와 최근 날짜는 이 브라우저의 필기 기록 기준입니다.";
  if(!bank.length){
   const notice=document.createElement("p");
   notice.className="written-empty-notice";notice.textContent="현재 검증·등록된 문제는 0개입니다. 실제 기출문항은 원문·정답·재게시 권한 확인 후 추가됩니다.";
   section.querySelector(".qb-list").before(notice);
  }
  document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>selectView(b.dataset.view)));
  const requested=new URLSearchParams(location.search).get("id");
  if(requested&&bank.some(q=>q.id===requested)){queue=bank;queueIndex=bank.findIndex(q=>q.id===requested);queueKind="bank";openQuestion(requested);}
  else selectView("bank");
 }
 initialize().catch(err=>{
  root.innerHTML='<div class="bank-empty"><h2>문제 데이터를 불러오지 못했습니다.</h2><p>잠시 후 새로고침하거나 관리자에게 문의하세요.</p></div>';
  status.textContent="데이터 로딩 오류";console.error("Written exam data load failed",err);
 });
}
