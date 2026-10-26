import {ncpQuestions} from "../data/ncp-questions.js";
import {initPortalShell} from "./portal-shell.js?v=20261020-unified-shell-1";

const byId=id=>document.getElementById(id);
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const KEY="k-bigdata-ncp-progress-v1";
const KEYS=["A","B","C","D"];
const params=new URLSearchParams(location.search);
const state={exam:/^NCP-(200|202|207)$/.test(params.get("exam")||"")?params.get("exam"):"all",difficulty:"all",query:"",mode:"all",list:[],index:0,answers:{}};
try{const stored=JSON.parse(localStorage.getItem(KEY)||"{}");if(stored&&typeof stored==="object"&&!Array.isArray(stored))state.answers=stored;}catch{}
const elements={exam:byId("ncp-exam"),difficulty:byId("ncp-difficulty"),search:byId("ncp-search"),question:byId("ncp-question"),list:byId("ncp-list"),status:byId("ncp-status"),metrics:byId("ncp-metrics"),summary:byId("ncp-summary"),prev:byId("ncp-prev"),next:byId("ncp-next")};
const valid=record=>record&&typeof record.choice==="string"&&KEYS.includes(record.choice);
const getRecord=id=>valid(state.answers[id])?state.answers[id]:null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(state.answers));}catch{}}
function matches(item){return (state.exam==="all"||item.exam===state.exam)&&(state.difficulty==="all"||item.difficulty===state.difficulty)&&(!state.query||(item.question+" "+item.topic+" "+item.area+" "+item.id).toLowerCase().includes(state.query));}
function shuffle(items){for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}return items;}
function setItems(preferredId){
  let items=ncpQuestions.filter(matches);
  if(state.mode==="random")items=shuffle([...items]).slice(0,10);
  state.list=items;
  state.index=Math.max(0,preferredId?items.findIndex(q=>q.id===preferredId):0);
  if(preferredId&&state.index<0)state.index=0;
  render();
}
function renderStats(){
 const all=ncpQuestions.filter(q=>state.exam==="all"||q.exam===state.exam);
 const attempted=all.filter(q=>getRecord(q.id));
 const correct=attempted.filter(q=>getRecord(q.id).choice===q.answer).length;
 const rate=attempted.length?Math.round(correct/attempted.length*100):0;
 elements.metrics.innerHTML='<div><strong>'+all.length+'</strong><span>전체 연습문제</span></div><div><strong>'+attempted.length+'</strong><span>풀이 완료</span></div><div><strong>'+correct+'</strong><span>정답 수</span></div><div><strong>'+rate+'%</strong><span>정답률</span></div>';
 const progress=byId("ncp-progress");
 progress.max=Math.max(1,all.length);progress.value=attempted.length;
 elements.summary.textContent='이 기기 기록 · '+attempted.length+'/'+all.length+'문항 풀이 · 정답률 '+rate+'%';
}
function renderList(){
 elements.list.innerHTML=state.list.map((q,i)=>{
 const record=getRecord(q.id);
 const badge=record?(record.choice===q.answer?"맞힘":"오답"):"미풀이";
 return '<button type="button" data-index="'+i+'" class="'+(i===state.index?"current ":"")+(record?(record.choice===q.answer?"correct":"wrong"):"")+'" aria-current="'+(i===state.index?"true":"false")+'" aria-label="'+(i+1)+'번 '+badge+'">'+(i+1)+'<span class="sr-only"> '+badge+'</span></button>';
 }).join("");
}
function render(){
 renderStats();
 renderList();
 const item=state.list[state.index];
 elements.prev.disabled=!item||state.index===0;
 elements.next.disabled=!item||state.index===state.list.length-1;
 if(!item){elements.question.innerHTML='<div class="ncp-empty"><h2>일치하는 문제가 없습니다.</h2><p>시험·난이도·검색어를 변경해 주세요.</p></div>';elements.status.textContent="검색 결과 없음";return;}
 const record=getRecord(item.id);
 const finished=!!record;
 elements.status.textContent=(state.index+1)+' / '+state.list.length+'문제 · '+item.exam+' · '+item.difficulty+' 난이도';
 const choices=item.options.map((option,i)=>{
 const letter=KEYS[i],selected=record&&record.choice===letter,correct=finished&&item.answer===letter;
 return '<button type="button" class="ncp-choice'+(selected?" selected":"")+(correct?" is-correct":"")+(finished&&selected&&!correct?" is-wrong":"")+'" data-choice="'+letter+'" aria-pressed="'+!!selected+'" '+(finished?"disabled":"")+'><span class="choice-letter">'+letter+'</span><span>'+esc(option)+'</span></button>';
 }).join("");
 const result=finished?'<section class="ncp-answer '+(record.choice===item.answer?"success":"retry")+'" aria-label="채점 결과"><strong>'+(record.choice===item.answer?"정답입니다.":"오답입니다. 정답: "+item.answer)+'</strong><p>'+esc(item.explanation)+'</p><a href="'+esc(item.sourceUrl)+'" target="_blank" rel="noopener noreferrer">공식문서에서 확인 ↗</a></section>':
 '<p class="ncp-help">답을 선택하면 바로 채점되고, 해설과 공식문서 링크가 표시됩니다.</p>';
 elements.question.innerHTML='<div class="ncp-question-meta"><span>'+esc(item.id)+'</span><span>'+esc(item.exam)+'</span><span>'+esc(item.topic)+'</span><span>난이도 '+esc(item.difficulty)+'</span></div>'+
 '<h2 tabindex="-1">'+esc(item.question)+'</h2><div class="ncp-options" role="group" aria-label="정답 선택">'+choices+'</div>'+result+
 '<div class="ncp-question-actions"><button type="button" class="ncp-light-button" id="ncp-share">문제 링크 복사</button><a class="ncp-light-button" href="https://help.k-bigdata.kr/" target="_blank" rel="noopener noreferrer">문제 오류 신고 ↗</a></div>';
}
function showChoice(letter){
 const item=state.list[state.index];if(!item||getRecord(item.id)||!KEYS.includes(letter))return;
 state.answers[item.id]={choice:letter,at:new Date().toISOString()};save();render();
 const result=elements.question.querySelector(".ncp-answer");
 if(result)result.setAttribute("tabindex","-1"),result.focus({preventScroll:true});
}
function updateFilters(){
 state.mode="all";
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mode==="all")));
 setItems();
}
elements.exam.value=state.exam;
elements.exam.addEventListener("change",()=>{state.exam=elements.exam.value;updateFilters();});
elements.difficulty.addEventListener("change",()=>{state.difficulty=elements.difficulty.value;updateFilters();});
elements.search.addEventListener("input",()=>{state.query=elements.search.value.trim().toLowerCase();updateFilters();});
document.querySelectorAll("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>{
 state.mode=btn.dataset.mode;
 document.querySelectorAll("[data-mode]").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));
 setItems();
}));
elements.list.addEventListener("click",e=>{
 const target=e.target.closest("button[data-index]");
 if(!target)return;state.index=Number(target.dataset.index);render();elements.question.querySelector("h2")?.focus({preventScroll:true});
});
elements.question.addEventListener("click",async e=>{
 const choice=e.target.closest("[data-choice]");
 if(choice){showChoice(choice.dataset.choice);return;}
 if(e.target.closest("#ncp-share")){
 const item=state.list[state.index];if(!item)return;
 const url=new URL(location.href);url.search="";url.searchParams.set("id",item.id);
 try{await navigator.clipboard.writeText(url.href);elements.status.textContent="문제 링크를 복사했습니다.";}catch{elements.status.textContent="복사할 수 없습니다. 주소창의 링크를 이용해 주세요.";}
 }
});
elements.prev.addEventListener("click",()=>{if(state.index>0){state.index--;render();elements.question.querySelector("h2")?.focus({preventScroll:true});}});
elements.next.addEventListener("click",()=>{if(state.index<state.list.length-1){state.index++;render();elements.question.querySelector("h2")?.focus({preventScroll:true});}});
byId("ncp-reset").addEventListener("click",()=>{
 if(!confirm("저장된 NCP 문제풀이 기록을 모두 삭제할까요?"))return;
 state.answers={};save();render();
});
const initial=params.get("id");
if(initial&&ncpQuestions.some(q=>q.id===initial)){const selected=ncpQuestions.find(q=>q.id===initial);state.exam=selected.exam;elements.exam.value=state.exam;setItems(initial);}
else setItems();
initPortalShell().catch(error=>console.error("NCP portal shell",error));