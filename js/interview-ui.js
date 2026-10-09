import {questions, interviewGroups, interviewJobTags, questionSearchText, matchesInterviewCategory, selectRandomQuestions, interviewSources, getInterviewGlossary} from "./interview.js?v=20261009-interview-ux-1";
import {matches} from "./search-core.js?v=20261005-perf-1";
import {interviewRoleLinks} from "./interview-links.js?v=20261005-perf-3";
import {INTERVIEW_HISTORY_KEY,createInterviewSession,interviewSessionStats,serializeInterviewState,restoreInterviewState} from "./interview-session.js?v=20261009-interview-ux-1";
const esc=value=>String(value??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const external=s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.name)+' ↗<span class="sr-only"> 외부 문서, 새 창</span></a>';
const action=(key,text,primary=false,extra="")=>'<button type="button" class="button button-'+(primary?'primary':'secondary')+'" data-action="'+key+'" '+extra+'>'+esc(text)+'</button>';
const meta=q=>'<div class="question-meta"><span class="badge">'+esc(q.group)+'</span><span class="badge">'+esc(q.difficulty)+'</span><span class="question-code">'+esc(q.code)+'</span></div>';
const roles=q=>'<p class="question-role">관련 직무 · '+q.jobTags.map(t=>'<a href="'+esc(interviewRoleLinks[t])+'">'+esc(t)+'<span class="sr-only"> 직무 가이드</span></a>').join(' · ')+'</p>';
export function interviewShareUrl(q){
 if(!q)return "";
 const url=new URL(location.pathname,location.origin);
 url.searchParams.set("id",q.id);
 return url.href;
}
export function interviewShareText(q){
 if(!q)return "";
 return ["기술면접 문제",q.group+" · "+q.difficulty,q.question].join("\n");
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
 if(!ok)throw new Error("copy failed");
}
function setShareStatus(message){
 const el=document.querySelector("#interview-share-status");
 if(el)el.textContent=message;
}
async function shareInterviewQuestion(q){
 if(!q)return;
 const url=interviewShareUrl(q),text=interviewShareText(q);
 const shareData={title:"기술면접 문제 · "+q.group,text,url};
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
async function copyInterviewQuestionLink(q){
 if(!q)return;
 try{
  await copyText(interviewShareUrl(q));
  setShareStatus("문제 링크를 복사했습니다.");
 }catch{
  setShareStatus("링크를 복사할 수 없습니다. 다시 시도해 주세요.");
 }
}
export function renderInterviewQuestion(q,practice=false,options={}){
 const share=practice?'<div class="interview-share-row" aria-label="문제 공유">'+action("share-problem","문제 공유",false,'aria-label="현재 기술면접 문제 공유"')+action("copy-problem-link","링크 복사",false,'aria-label="현재 기술면접 문제 링크 복사"')+'</div><p id="interview-share-status" class="interview-share-status" role="status" aria-live="polite"></p>':"";
 const sources=(q.sourceIds||[]).map(id=>interviewSources[id]).filter(Boolean);
 const reference=sources.length?'<details class="question-sources"><summary>관련 공식문서</summary><ul>'+sources.map(s=>'<li>'+external(s)+'</li>').join('')+'</ul></details>':"";
 const terms=getInterviewGlossary(q);
 const glossary=terms.length?'<details class="interview-more"><summary>더 알아보기 · 핵심 기술 용어 <span class="interview-term-count">'+terms.length+'개</span></summary>'+
   '<p class="interview-more-guide">면접 답변을 보기 전에도 용어의 뜻과 활용을 확인할 수 있습니다.</p>'+
   '<dl class="interview-term-list">'+terms.map(term=>'<div class="interview-term"><dt>'+esc(term.title)+'</dt>'+
   '<dd class="interview-term-definition">'+esc(term.definition)+'</dd>'+
   (term.meaning?'<dd class="interview-term-meaning"><strong>알아둘 점</strong> '+esc(term.meaning)+'</dd>':"")+
   '</div>').join('')+'</dl></details>':"";
 const seconds=Number.isFinite(q.answerSeconds)?' · 약 '+q.answerSeconds+'초 답변':"";
 const mark=options.allowMark?'<div class="interview-mark-practice">'+action("toggle-practiced",options.practiced?"연습 완료 표시 취소":"직접 답변 연습했어요",false,'aria-pressed="'+String(!!options.practiced)+'"')+'<p>실제로 소리 내어 연습한 경우에만 표시하세요. 모범답안 확인과 별도로 기록합니다.</p></div>':"";
 return '<article class="question" data-question-id="'+esc(q.id)+'">'+meta(q)+'<h2'+(practice?' tabindex="-1" id="practice-question-heading"':'')+'>'+esc(q.question)+'</h2>'+roles(q)+share+
   '<p class="hint">먼저 직접 답해 보세요. 간단한 질문은 10초만 답해도 충분합니다.</p>'+
   '<details class="question-answer"><summary><span class="answer-toggle">답변 확인</span><span class="sr-only"> · '+esc(q.code)+'</span></summary>'+
   '<div class="answer-content"><h3>모범답안'+esc(seconds)+'</h3><p class="short-answer">'+esc(q.shortAnswer)+'</p>'+reference+'</div></details>'+
   glossary+mark+'</article>';
}
export const practiceModeButtonId=(session,direct)=>direct?null:session?(session.mode==="one"?"random-one":"random-ten"):"show-all";
export const filterInterviewQuestions=(items,{category="전체",job="전체",difficulty="전체",query=""}={})=>items.filter(q=>matchesInterviewCategory(q,category)&&(job==="전체"||q.jobTags.includes(job))&&(difficulty==="전체"||q.difficulty===difficulty)&&matches(questionSearchText(q),query));
export function initInterview(){
 const $=s=>document.querySelector(s),root=$("#items"),controls=$("#list-controls"),input=$("#local-query"),status=$("#list-status"),
   params=new URLSearchParams(location.search),levels=["기초","기본","심화"];
 const defaultFilters=()=>({category:"전체",job:"전체",difficulty:"전체",query:""});
 let filters=defaultFilters(),direct=null,session=null,lastRandom=null,limit=20,mode="HOME",bottomObserver=null,interviewSearchTimer=0;

 function loadFromURL(){
   const p=new URLSearchParams(location.search);
   filters={
     category:questions.some(q=>matchesInterviewCategory(q,p.get("category")))?p.get("category"):"전체",
     job:interviewJobTags.includes(p.get("job"))?p.get("job"):"전체",
     difficulty:levels.includes(p.get("difficulty"))?p.get("difficulty"):"전체",query:p.get("q")||""
   };
   direct=questions.find(q=>q.id===p.get("id"))||null;
   session=null;limit=20;lastRandom=direct?.id||null;mode=direct?"PRACTICE_ONE":p.size?"BROWSE":"HOME";
   $("#detail").textContent=p.has("id")&&!direct?"요청한 문제를 찾을 수 없습니다. 목록에서 다른 문제를 선택하세요.":"";
 }
 function restoreState(value){
   const saved=restoreInterviewState(value?.[INTERVIEW_HISTORY_KEY],questions);
   if(!saved)return false;
   ({mode,direct,session,filters,limit,lastRandom}=saved);
   if(!interviewGroups.includes(filters.category)&&!questions.some(q=>q.category===filters.category))filters.category="전체";
   if(!interviewJobTags.includes(filters.job))filters.job="전체";
   if(!levels.includes(filters.difficulty))filters.difficulty="전체";
   input.value=filters.query;
   $("#detail").textContent="";
   return true;
 }
 function saveState(push=false){
   const base=history.state&&typeof history.state==="object"?history.state:{};
   const snapshot=serializeInterviewState({mode,direct,session,filters,limit,lastRandom});
   const url=new URL(location.href);url.search="";
   if(mode==="BROWSE"){
     for(const [k,v]of Object.entries(filters)){
       if(v&&v!=="전체")url.searchParams.set(k==="query"?"q":k,v);
     }
   }
   if(direct)url.searchParams.set("id",direct.id);
   history[push?"pushState":"replaceState"]({...base,[INTERVIEW_HISTORY_KEY]:snapshot},"",url);
 }
 function buttons(id,values,current,key){
   const el=$(id),scroll=el.scrollLeft;
   el.innerHTML=values.map(v=>'<button type="button" data-filter="'+key+'" data-value="'+esc(v)+'" aria-pressed="'+(v===current)+'">'+esc(v)+'</button>').join("");
   el.scrollLeft=scroll;
 }
 function syncFilters(){
   buttons("#filters",["전체",...interviewGroups],interviewGroups.includes(filters.category)?filters.category:questions.find(q=>q.category===filters.category)?.group||"전체","category");
   buttons("#job-filters",["전체",...interviewJobTags],filters.job,"job");
   buttons("#difficulty-filters",["전체",...levels],filters.difficulty,"difficulty");
   const applied=Object.entries(filters).filter(([,v])=>v&&v!=="전체");
   $("#active-interview-filter").innerHTML=applied.map(([k,v])=>action("remove-filter",v+" ×",false,'data-key="'+k+'" aria-label="'+esc(v)+' 조건 해제"')).join("");
   $("#reset-interview").hidden=!applied.length;
 }
 function listCard(q){
   return '<article class="question">'+meta(q)+'<h2>'+esc(q.question)+'</h2>'+roles(q)+
     action("select","이 문제 연습하기",false,'data-id="'+esc(q.id)+'"')+
     '<a class="question-permalink" href="interview.html?id='+encodeURIComponent(q.id)+'"><span class="sr-only">'+esc(q.question)+' </span>문제 링크 →</a></article>';
 }
 const pool=()=>filterInterviewQuestions(questions,filters);
 function updateProgress(){
   const el=root.querySelector(".practice-status");
   if(!el||!session)return;
   const info=interviewSessionStats(session);
   el.textContent="직접 연습 "+info.practiced+" / "+info.total+" · 모범답안 확인 "+info.checked+" / "+info.total;
 }
 function adjustBottom(){
   const bar=root.querySelector(".interview-bottom");
   if(bar)document.body.style.setProperty("--interview-bottom-offset",Math.ceil(bar.getBoundingClientRect().height+24)+"px");
   else document.body.style.removeProperty("--interview-bottom-offset");
 }
 function render(focus=false){
   bottomObserver?.disconnect();bottomObserver=null;
   document.body.dataset.interviewMode=mode;
   $("#interview-home").hidden=mode!=="HOME"&&mode!=="BROWSE";
   $(".page-hero").hidden=mode.startsWith("PRACTICE")||mode==="COMPLETE";
   controls.hidden=mode!=="BROWSE";status.hidden=mode!=="BROWSE";syncFilters();
   if(mode==="HOME")root.innerHTML="";
   else if(mode==="BROWSE"){
     const available=pool();
     root.innerHTML=available.length?available.slice(0,limit).map(listCard).join("")+
       (available.length>limit?action("more","문제 더 보기"):""):
       '<section class="notice"><h2 tabindex="-1">조건에 맞는 문제가 없습니다.</h2><p>다른 분야를 선택하거나 필터를 초기화하세요.</p>'+action("reset","필터 초기화")+'</section>';
     status.textContent=available.length+"문제 중 "+Math.min(limit,available.length)+"문제 표시";
   }else if(mode==="COMPLETE"){
     const info=interviewSessionStats(session);
     const reminder=info.unchecked.length?
       '<details class="interview-review"><summary>모범답안 미확인 '+info.unchecked.length+'문제 보기</summary><ol>'+
       info.unchecked.map(q=>'<li><a href="interview.html?id='+encodeURIComponent(q.id)+'">'+esc(q.question)+'</a></li>').join("")+
       '</ol></details>':'<p>모든 문제의 모범답안을 확인했습니다.</p>';
     root.innerHTML='<section class="practice-complete"><h2 tabindex="-1">10문제 모의면접 진행 결과</h2>'+
       '<p>10개 문항을 모두 살펴봤습니다. 아래 수치는 실제 연습 여부를 구분한 기록입니다.</p>'+
       '<div class="interview-results"><p><strong>'+info.practiced+' / '+info.total+'</strong><span>직접 연습 표시</span></p>'+
       '<p><strong>'+info.checked+' / '+info.total+'</strong><span>모범답안 확인</span></p>'+
       '<p><strong>'+info.unchecked.length+'문제</strong><span>모범답안 미확인</span></p></div>'+
       reminder+'<div class="practice-actions">'+action("restart","다시 10문제",true)+action("one","랜덤 1문제")+action("all","문제 찾아보기")+'</div></section>';
   }else{
     const q=direct||session?.items[session.index],ten=mode==="PRACTICE_TEN";
     if(!q){mode="HOME";return render(focus);}
     root.innerHTML='<section class="practice-session" aria-label="한 문제씩 면접 연습"><div class="practice-progress">'+
       action("home","← 학습 시작")+'<strong>'+(ten?(session.index+1)+" / "+session.items.length:"한 문제 연습")+'</strong></div>'+
       (session?'<p class="practice-status" role="status" aria-live="polite"></p>':"")+
       renderInterviewQuestion(q,true,{allowMark:!!session,practiced:!!session?.practiced.has(q.id)})+
       '<div class="interview-bottom" aria-label="학습 진행">'+
       (ten?action("previous","이전",false,session.index===0?'disabled':""):"")+
       action("next",ten?(session.index===session.items.length-1?"결과 보기":"다음 문제"):"다른 문제",true)+
       '</div></section>';
     if(session?.opened.has(q.id))root.querySelector(".question-answer").open=true;
     if(session?.glossaryOpened.has(q.id))root.querySelector(".interview-more").open=true;
     updateProgress();
   }
   const bar=root.querySelector(".interview-bottom");
   if(bar&&typeof ResizeObserver!=="undefined"){
     bottomObserver=new ResizeObserver(adjustBottom);bottomObserver.observe(bar);
   }
   adjustBottom();
   if(focus){
     root.querySelector("h2")?.focus({preventScroll:true});
     root.scrollIntoView({block:"start",behavior:"auto"});
   }
 }
 function browse(push=true){
   clearTimeout(interviewSearchTimer);
   direct=null;session=null;mode="BROWSE";saveState(push);render();
   $("#filter-panel summary").focus({preventScroll:true});
   controls.scrollIntoView({block:"start",behavior:"auto"});
 }
 function start(count){
   clearTimeout(interviewSearchTimer);filters.query=input.value;
   const available=pool(),picked=selectRandomQuestions(count===1&&available.length>1?available.filter(q=>q.id!==lastRandom):available,count);
   if(!picked.length){browse();return;}
   direct=null;$("#detail").textContent="";
   session=createInterviewSession(picked,count===1?"one":"ten");
   lastRandom=picked[0].id;mode=count===1?"PRACTICE_ONE":"PRACTICE_TEN";
   saveState(true);render(true);
 }
 function reset(){
   filters=defaultFilters();input.value="";limit=20;browse();
 }
 $("#interview-stats").textContent=questions.length+"문제 · "+interviewGroups.length+"개 분야";
 if(!restoreState(history.state)){loadFromURL();saveState();}
 input.value=filters.query;
 $("#random-one").addEventListener("click",()=>start(1));
 $("#random-ten").addEventListener("click",()=>start(10));
 $("#show-all").addEventListener("click",()=>browse());
 $("#reset-interview").addEventListener("click",reset);
 input.addEventListener("input",()=>{
   clearTimeout(interviewSearchTimer);
   interviewSearchTimer=window.setTimeout(()=>{
     filters.query=input.value;limit=20;saveState();render();
   },180);
 });
 controls.addEventListener("click",event=>{
   const b=event.target.closest('button[data-filter]');if(!b)return;
   clearTimeout(interviewSearchTimer);filters.query=input.value;
   filters[b.dataset.filter]=b.dataset.value;limit=20;saveState(true);render();
   [...controls.querySelectorAll('button[data-filter]')]
     .find(el=>el.dataset.filter===b.dataset.filter&&el.dataset.value===b.dataset.value)?.focus({preventScroll:true});
 });
 $(".learning-content").addEventListener("click",event=>{
   const b=event.target.closest('button[data-action]');if(!b)return;
   const key=b.dataset.action;
   if(key==="all")browse();
   if(key==="one")start(1);
   if(key==="restart")start(10);
   if(key==="reset")reset();
   if(key==="home"){
     mode="HOME";session=null;direct=null;saveState(true);render();$("#random-one").focus();
   }
   if(key==="more"){
     const oldLimit=limit;limit+=20;saveState();render();
     root.querySelectorAll(".question")[oldLimit]?.querySelector("button")?.focus({preventScroll:true});
   }
   if(key==="select"){
     direct=questions.find(q=>q.id===b.dataset.id)||null;
     if(!direct)return;
     lastRandom=direct.id;session=null;mode="PRACTICE_ONE";saveState(true);render(true);
   }
   if(key==="remove-filter"){
     filters[b.dataset.key]=b.dataset.key==="query"?"":"전체";
     input.value=filters.query;limit=20;saveState(true);render();
     $("#filter-panel summary").focus({preventScroll:true});
   }
   if(key==="share-problem"){const q=direct||session?.items?.[session.index];if(q)void shareInterviewQuestion(q);}
   if(key==="copy-problem-link"){const q=direct||session?.items?.[session.index];if(q)void copyInterviewQuestionLink(q);}
   if(key==="toggle-practiced"&&session){
     const q=session.items[session.index];if(!q)return;
     if(session.practiced.has(q.id))session.practiced.delete(q.id);else session.practiced.add(q.id);
     const marked=session.practiced.has(q.id);
     b.setAttribute("aria-pressed",String(marked));
     b.textContent=marked?"연습 완료 표시 취소":"직접 답변 연습했어요";
     updateProgress();saveState();
   }
   if(key==="previous"&&session&&session.index>0){session.index--;saveState(true);render(true);}
   if(key==="next"){
     if(mode==="PRACTICE_ONE")start(1);
     else if(session){
       session.index++;
       mode=session.index>=session.items.length?"COMPLETE":"PRACTICE_TEN";
       saveState(true);render(true);
     }
   }
 });
 root.addEventListener("toggle",event=>{
   const d=event.target;
   if(!d.classList.contains("question-answer")&&!d.classList.contains("interview-more"))return;
   const qid=d.closest("[data-question-id]")?.dataset.questionId;
   if(d.classList.contains("question-answer")){
     d.querySelector(".answer-toggle").textContent=d.open?"답변 숨기기":"답변 확인";
     if(session&&qid){
       if(d.open){session.opened.add(qid);session.checked.add(qid);}else session.opened.delete(qid);
     }
   }else if(session&&qid){
     if(d.open)session.glossaryOpened.add(qid);else session.glossaryOpened.delete(qid);
   }
   if(session){updateProgress();saveState();}
 },true);
 window.addEventListener("resize",adjustBottom,{passive:true});
 window.addEventListener("popstate",event=>{
   clearTimeout(interviewSearchTimer);
   if(!restoreState(event.state))loadFromURL();
   input.value=filters.query;
   render(true);
 });
 render(!!direct||mode==="PRACTICE_TEN"||mode==="COMPLETE");
 $("#interview-fallback").hidden=true;
}
