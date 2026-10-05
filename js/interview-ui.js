import {questions, interviewGroups, interviewJobTags, questionSearchText, matchesInterviewCategory, selectRandomQuestions, interviewSources} from "./interview.js?v=20261005-accuracy-1";
import {matches} from "./search.js";
import {interviewRoleLinks} from "./jobs.js";
const esc=value=>String(value??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const external=s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.name)+' ↗<span class="sr-only"> 외부 문서, 새 창</span></a>';
const action=(key,text,primary=false,extra="")=>'<button type="button" class="button button-'+(primary?'primary':'secondary')+'" data-action="'+key+'" '+extra+'>'+esc(text)+'</button>';
const meta=q=>'<div class="question-meta"><span class="badge">'+esc(q.group)+'</span><span class="badge">'+esc(q.difficulty)+'</span><span class="question-code">'+esc(q.code)+'</span></div>';
const roles=q=>'<p class="question-role">관련 직무 · '+q.jobTags.map(t=>'<a href="'+esc(interviewRoleLinks[t])+'">'+esc(t)+'<span class="sr-only"> 직무 가이드</span></a>').join(' · ')+'</p>';
export function renderInterviewQuestion(q,practice=false){
 return '<article class="question" data-question-id="'+esc(q.id)+'">'+meta(q)+'<h2'+(practice?' tabindex="-1" id="practice-question-heading"':'')+'>'+esc(q.question)+'</h2>'+roles(q)+'<p class="hint">30초 정도 머릿속으로 답을 정리한 뒤 확인하세요.</p><details class="question-answer"><summary><span class="answer-toggle">답변 확인</span><span class="sr-only"> · '+esc(q.code)+'</span></summary><div class="answer-content"><h3>핵심 답변</h3><p class="short-answer">'+esc(q.shortAnswer)+'</p><h3>핵심 키워드</h3><div class="tags">'+q.keywords.map(t=>'<span>'+esc(t)+'</span>').join('')+'</div><details class="answer-extra"><summary>상세 설명 보기</summary><p>'+esc(q.detailedAnswer)+'</p></details><details class="answer-extra"><summary>꼬리질문 '+q.followUps.length+'개 보기<span class="sr-only"> · 면접관이 이어서 물어볼 수 있는 질문</span></summary><ol class="follow-ups">'+q.followUps.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol></details><details class="question-sources"><summary>공식문서 확인</summary><ul>'+q.sourceIds.map(id=>interviewSources[id]).filter(Boolean).map(s=>'<li>'+external(s)+'</li>').join('')+'</ul></details></div></details></article>';
}
export const practiceModeButtonId=(session,direct)=>direct?null:session?(session.mode==="one"?"random-one":"random-ten"):"show-all";
export const filterInterviewQuestions=(items,{category="전체",job="전체",difficulty="전체",query=""}={})=>items.filter(q=>matchesInterviewCategory(q,category)&&(job==="전체"||q.jobTags.includes(job))&&(difficulty==="전체"||q.difficulty===difficulty)&&matches(questionSearchText(q),query));
export function initInterview(){
 const $=s=>document.querySelector(s),root=$("#items"),controls=$("#list-controls"),input=$("#local-query"),status=$("#list-status"),params=new URLSearchParams(location.search),levels=["기초","기본","심화"];
 const filters={category:questions.some(q=>matchesInterviewCategory(q,params.get("category")))?params.get("category"):"전체",job:interviewJobTags.includes(params.get("job"))?params.get("job"):"전체",difficulty:levels.includes(params.get("difficulty"))?params.get("difficulty"):"전체",query:params.get("q")||""};
 let direct=questions.find(q=>q.id===params.get("id")),session=null,lastRandom=direct?.id||null,limit=20,mode=direct?"PRACTICE_ONE":params.size?"BROWSE":"HOME";
 input.value=filters.query;$("#interview-stats").textContent=questions.length+"문제 · "+interviewGroups.length+"개 분야";
 if(params.has("id")&&!direct)$("#detail").textContent="요청한 문제를 찾을 수 없습니다. 목록에서 다른 문제를 선택하세요.";
 const pool=()=>filterInterviewQuestions(questions,filters);
 function syncURL(){const url=new URL(location.href);url.search="";for(const [k,v]of Object.entries(filters))if(v&&v!=="전체")url.searchParams.set(k==="query"?"q":k,v);if(direct)url.searchParams.set("id",direct.id);history.replaceState(null,"",url);}
 function buttons(id,values,current,key){const el=$(id),scroll=el.scrollLeft;el.innerHTML=values.map(v=>'<button type="button" data-filter="'+key+'" data-value="'+esc(v)+'" aria-pressed="'+(v===current)+'">'+esc(v)+'</button>').join('');el.scrollLeft=scroll;}
 function syncFilters(){buttons("#filters",["전체",...interviewGroups],interviewGroups.includes(filters.category)?filters.category:questions.find(q=>q.category===filters.category)?.group||"전체","category");buttons("#job-filters",["전체",...interviewJobTags],filters.job,"job");buttons("#difficulty-filters",["전체",...levels],filters.difficulty,"difficulty");const applied=Object.entries(filters).filter(([,v])=>v&&v!=="전체");$("#active-interview-filter").innerHTML=applied.map(([k,v])=>action("remove-filter",v+" ×",false,'data-key="'+k+'" aria-label="'+esc(v)+' 조건 해제"')).join('');$("#reset-interview").hidden=!applied.length;}
 function listCard(q){return '<article class="question">'+meta(q)+'<h2>'+esc(q.question)+'</h2>'+roles(q)+action("select","이 문제 연습하기",false,'data-id="'+esc(q.id)+'"')+'<a class="question-permalink" href="interview.html?id='+encodeURIComponent(q.id)+'"><span class="sr-only">'+esc(q.question)+' </span>문제 링크 →</a></article>';}
 function render(focus=false){
  document.body.dataset.interviewMode=mode;$("#interview-home").hidden=mode!=="HOME"&&mode!=="BROWSE";$(".page-hero").hidden=mode.startsWith("PRACTICE")||mode==="COMPLETE";controls.hidden=mode!=="BROWSE";status.hidden=mode!=="BROWSE";syncFilters();
  if(mode==="HOME")root.innerHTML="";
  else if(mode==="BROWSE"){const available=pool();root.innerHTML=available.length?available.slice(0,limit).map(listCard).join('')+(available.length>limit?action("more","문제 더 보기"):""):'<section class="notice"><h2 tabindex="-1">조건에 맞는 문제가 없습니다.</h2><p>다른 분야를 선택하거나 필터를 초기화하세요.</p>'+action("reset","필터 초기화")+'</section>';status.textContent=available.length+"문제 중 "+Math.min(limit,available.length)+"문제 표시";}
  else if(mode==="COMPLETE")root.innerHTML='<section class="practice-complete"><h2 tabindex="-1">모의 기술면접 완료</h2><p>'+session.items.length+'문제를 연습했습니다.</p><p>다시 풀어볼 문제를 정리한 뒤 공식문서와 프로젝트 코드로 복습하세요.</p><div class="practice-actions">'+action("restart","다시 10문제",true)+action("one","랜덤 1문제")+action("all","문제 찾아보기")+'</div></section>';
  else{const q=direct||session.items[session.index],ten=mode==="PRACTICE_TEN";root.innerHTML='<section class="practice-session" aria-label="한 문제씩 면접 연습"><div class="practice-progress">'+action("home","← 학습 시작")+'<strong>'+(ten?(session.index+1)+" / "+session.items.length:"한 문제 연습")+'</strong></div>'+renderInterviewQuestion(q,true)+'<div class="interview-bottom" aria-label="학습 진행">'+(ten?action("previous","이전",false,session.index===0?'disabled':''):'')+action("next",ten?(session.index===session.items.length-1?"연습 완료":"다음 문제"):"다른 문제",true)+'</div><p class="hint">가능하면 실제 면접처럼 소리 내어 설명해보세요.</p></section>';if(session?.opened.has(q.id))root.querySelector(".question-answer").open=true;}
  if(focus){root.querySelector('h2')?.focus({preventScroll:true});root.scrollIntoView({block:"start",behavior:"auto"});}
 }
 function browse(){direct=null;session=null;mode="BROWSE";syncURL();render();$("#filter-panel summary").focus({preventScroll:true});controls.scrollIntoView({block:"start",behavior:"auto"});}
 function start(count){const available=pool(),picked=selectRandomQuestions(count===1&&available.length>1?available.filter(q=>q.id!==lastRandom):available,count);direct=null;$("#detail").textContent="";if(!picked.length){browse();return;}session={items:picked,index:0,mode:count===1?"one":"ten",opened:new Set()};lastRandom=picked[0].id;mode=count===1?"PRACTICE_ONE":"PRACTICE_TEN";syncURL();render(true);}
 function reset(){Object.assign(filters,{category:"전체",job:"전체",difficulty:"전체",query:""});input.value="";limit=20;browse();}
 $("#random-one").addEventListener("click",()=>start(1));$("#random-ten").addEventListener("click",()=>start(10));$("#show-all").addEventListener("click",browse);$("#reset-interview").addEventListener("click",reset);
 input.addEventListener("input",()=>{filters.query=input.value;limit=20;syncURL();render();});
 controls.addEventListener("click",event=>{const b=event.target.closest('button[data-filter]');if(!b)return;filters[b.dataset.filter]=b.dataset.value;limit=20;syncURL();render();[...controls.querySelectorAll('button[data-filter]')].find(el=>el.dataset.filter===b.dataset.filter&&el.dataset.value===b.dataset.value)?.focus({preventScroll:true});});
 $(".learning-content").addEventListener("click",event=>{const b=event.target.closest('button[data-action]');if(!b)return;const key=b.dataset.action;
  if(key==="all")browse();if(key==="one")start(1);if(key==="restart")start(10);if(key==="reset")reset();
  if(key==="home"){mode="HOME";session=null;direct=null;syncURL();render();$("#random-one").focus();}
  if(key==="more"){limit+=20;render();root.querySelectorAll('.question')[limit-20]?.querySelector('button')?.focus({preventScroll:true});}
  if(key==="select"){direct=questions.find(q=>q.id===b.dataset.id);lastRandom=direct.id;session=null;mode="PRACTICE_ONE";syncURL();render(true);}
  if(key==="remove-filter"){filters[b.dataset.key]=b.dataset.key==="query"?"":"전체";input.value=filters.query;limit=20;syncURL();render();$("#filter-panel summary").focus({preventScroll:true});}
  if(key==="previous"&&session&&session.index>0){session.index--;render(true);}
  if(key==="next"){if(mode==="PRACTICE_ONE")start(1);else if(session){session.index++;mode=session.index>=session.items.length?"COMPLETE":"PRACTICE_TEN";render(true);}}
 });
 root.addEventListener("toggle",event=>{const d=event.target;if(!d.classList.contains("question-answer"))return;d.querySelector(".answer-toggle").textContent=d.open?"답변 숨기기":"답변 확인";if(session){const id=d.closest('[data-question-id]').dataset.questionId;if(d.open)session.opened.add(id);else session.opened.delete(id);}},true);
 render(!!direct);$("#interview-fallback").hidden=true;
}
