import {ncpQuestions} from "../data/ncp-questions.js?v=20261026-quizfocus-2";
import {initPortalShell} from "./portal-shell.js?v=20261026-portal-launcher-1";

const byId=id=>document.getElementById(id);
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const KEY="k-bigdata-ncp-progress-v1";
const letters=["A","B","C","D"];
const numerals=["①","②","③","④"];
const params=new URLSearchParams(location.search);
const requestedExam=params.get("exam");
const state={
 exam:/^NCP-(200|202|207)$/.test(requestedExam||"")?requestedExam:"NCP-200",
 mode:"all",query:"",list:[],index:0,answers:{}
};
try{
 const saved=JSON.parse(localStorage.getItem(KEY)||"{}");
 if(saved&&typeof saved==="object"&&!Array.isArray(saved))state.answers=saved;
}catch{}
const el={exam:byId("ncp-exam"),search:byId("ncp-search"),question:byId("ncp-question"),
 list:byId("ncp-list"),status:byId("ncp-status"),summary:byId("ncp-summary"),
 progress:byId("ncp-progress"),prev:byId("ncp-prev"),next:byId("ncp-next")};
const recordFor=id=>{
 const record=state.answers[id];
 return record&&letters.includes(record.choice)?record:null;
};
function save(){try{localStorage.setItem(KEY,JSON.stringify(state.answers));}catch{}}
function shuffle(array){
 for(let i=array.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [array[i],array[j]]=[array[j],array[i]];
 }
 return array;
}
function filteredQuestions(){
 return ncpQuestions.filter(item=>
  (state.exam==="all"||item.exam===state.exam)&&
  (!state.query||(item.question+" "+item.topic+" "+item.id+" "+item.originalNumber).toLowerCase().includes(state.query))
 );
}
function changeSet(id){
 let questions=filteredQuestions();
 if(state.mode==="random")questions=shuffle([...questions]).slice(0,10);
 state.list=questions;
 state.index=Math.max(0,id?questions.findIndex(q=>q.id===id):0);
 render();
}
function updateProgress(){
 const completed=state.list.filter(q=>recordFor(q.id));
 const matches=completed.filter(q=>recordFor(q.id).choice===q.answer).length;
 el.summary.textContent=state.list.length?'풀이 '+completed.length+'/'+state.list.length+' · 답안 일치 '+matches:"검색 결과 없음";
 el.progress.max=Math.max(1,state.list.length);
 el.progress.value=completed.length;
}
function renderNumbers(){
 el.list.innerHTML=state.list.map((q,i)=>{
  const record=recordFor(q.id);
  const status=record?(record.choice===q.answer?"matched":"unmatched"):"";
  const desc=record?(record.choice===q.answer?"복원 답안 일치":"복원 답안 불일치"):"미풀이";
  return '<button type="button" data-index="'+i+'" class="'+(i===state.index?"current ":"")+status+
   '" aria-label="'+(i+1)+'번 '+desc+'"'+(i===state.index?' aria-current="true"':'')+'>'+String(i+1)+'</button>';
 }).join("");
}
function render(){
 updateProgress();
 renderNumbers();
 const q=state.list[state.index];
 el.prev.disabled=!q||state.index<=0;
 el.next.disabled=!q||state.index>=state.list.length-1;
 if(!q){
  el.status.textContent="검색 결과 없음";
  el.question.innerHTML='<div class="ncp-empty"><h2>검색된 문제가 없습니다.</h2><p>시험을 바꾸거나 검색어를 수정하세요.</p></div>';
  return;
 }
 el.status.textContent=(state.index+1)+' / '+state.list.length+'번';
 const answered=recordFor(q.id);
 const options=q.options.map((option,i)=>{
  const letter=letters[i],selected=answered?.choice===letter,matched=!!answered&&letter===q.answer;
  const cls=(selected?" is-selected":"")+(matched?" is-answer":"")+(answered&&selected&&!matched?" is-mismatch":"");
  return '<button type="button" class="ncp-choice'+cls+'" data-choice="'+letter+'" aria-pressed="'+Boolean(selected)+
   '"'+(answered?' disabled':'')+'><span class="ncp-choice-index" aria-hidden="true">'+numerals[i]+'</span><span>'+esc(option)+'</span></button>';
 }).join("");
 const sourceURL=/^https:\/\/notion2979\.tistory\.com\/(?:5|6|7|8|9|10)$/.test(q.sourceUrl)?q.sourceUrl:"#";
 const result=answered?
  '<section class="ncp-answer" tabindex="-1" aria-label="복원자료 답안 확인"><div class="ncp-answer-head"><strong>복원 답안 '+numerals[letters.indexOf(q.answer)]+'</strong><span class="'+(answered.choice===q.answer?"ncp-answer-match":"ncp-answer-diff")+'">'+(answered.choice===q.answer?"일치":"불일치")+'</span></div><p>'+esc(q.explanation)+'</p><button type="button" class="ncp-retry" data-retry>이 문제 다시 풀기</button></section>':"";
 el.question.innerHTML='<div class="ncp-question-meta"><span>'+esc(q.exam)+'</span><span>'+esc(q.topic)+'</span></div>'+
  '<h2 tabindex="-1">'+esc(q.question)+'</h2>'+
  '<div class="ncp-options" role="group" aria-label="선택지">'+options+'</div>'+result+
  '<div class="ncp-source-link"><a href="'+esc(sourceURL)+'" target="_blank" rel="noopener noreferrer">2025 복원 원문 '+esc(q.originalNumber)+'번 보기 ↗</a></div>';
}
function focusQuestion(){el.question.querySelector("h2")?.focus({preventScroll:true});}
function updateFilters(){
 state.mode="all";
 document.querySelectorAll("[data-mode]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.mode==="all")));
 changeSet();
}
el.exam.value=state.exam;
el.exam.addEventListener("change",()=>{state.exam=el.exam.value;updateFilters();});
el.search.addEventListener("input",()=>{state.query=el.search.value.trim().toLowerCase();updateFilters();});
document.querySelectorAll("[data-mode]").forEach(button=>button.addEventListener("click",()=>{
 state.mode=button.dataset.mode;
 document.querySelectorAll("[data-mode]").forEach(item=>item.setAttribute("aria-pressed",String(item===button)));
 changeSet();
}));
el.list.addEventListener("click",event=>{
 const button=event.target.closest("button[data-index]");
 if(!button)return;
 state.index=Number(button.dataset.index);
 render();focusQuestion();
});
el.question.addEventListener("click",event=>{
 const answer=event.target.closest("[data-choice]");
 const q=state.list[state.index];
 if(!q)return;
 if(answer&&!recordFor(q.id)&&letters.includes(answer.dataset.choice)){
  state.answers[q.id]={choice:answer.dataset.choice,at:new Date().toISOString()};
  save();render();
  el.question.querySelector(".ncp-answer")?.focus({preventScroll:true});
  return;
 }
 if(event.target.closest("[data-retry]")){
  delete state.answers[q.id];save();render();focusQuestion();
 }
});
el.prev.addEventListener("click",()=>{
 if(state.index>0){state.index--;render();focusQuestion();}
});
el.next.addEventListener("click",()=>{
 if(state.index<state.list.length-1){state.index++;render();focusQuestion();}
});
byId("ncp-reset").addEventListener("click",()=>{
 if(!confirm("저장된 NCP 문제풀이 기록을 모두 지울까요?"))return;
 state.answers={};save();render();
});
const initialID=params.get("id");
const initial=ncpQuestions.find(q=>q.id===initialID);
if(initial){
 state.exam=initial.exam;
 el.exam.value=initial.exam;
 changeSet(initial.id);
}else changeSet();
initPortalShell().catch(error=>console.error("NCP portal initialization failed",error));
