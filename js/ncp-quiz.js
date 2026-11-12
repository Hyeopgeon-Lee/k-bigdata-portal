import {quizNavigation,quizHeading,quizDisclosure,quizFeedback,scrollToQuizAnswer} from "./quiz-unified.js?v=20261112-answer-focus-1";
import {createQuestionBrowser} from "./question-browser.js";
import {bindReview,reviewControls,gradeLabels} from "./study-review.js";
import {learningLocal as localStorage, learningSession as sessionStorage} from "./learning-storage.mjs";
const drafts=new Map();
import {ncpQuestions} from "../data/ncp-questions.js?v=20261026-quizfocus-2";
import {initPortalShell} from "./portal-shell.js?v=20261026-card-label-1";
import {learningReportUrl} from "./learning-report.js?v=20261027-ncp-report-1";

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
const cloudStatus=document.createElement("p");
cloudStatus.id="ncp-cloud-status";cloudStatus.setAttribute("role","status");
cloudStatus.setAttribute("aria-live","polite");cloudStatus.className="ncp-status";
cloudStatus.textContent="";
el.summary.insertAdjacentElement("afterend",cloudStatus);
const recordFor=id=>{
 const record=state.answers[id];
 return record&&(record.grade||letters.includes(record.choice))?record:null;
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
function problemShareUrl(q){
 const url=new URL("ncp.html",location.origin);
 url.searchParams.set("id",q.id);
 return url.href;
}
function problemShareText(q){
 return ["NCP 학습용 재서술 문제 · "+q.exam,"공개 복원 원문 "+q.originalNumber+"번: "+q.sourceUrl,String(q.question).replace(/\s+/g," ").trim()].join("\n");
}
async function copyText(value){
 if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);return;}
 const area=document.createElement("textarea");
 area.value=value;
 area.readOnly=true;
 area.style.position="fixed";
 area.style.opacity="0";
 document.body.append(area);
 try{
  area.select();
  if(!document.execCommand("copy"))throw new Error("복사할 수 없습니다.");
 }finally{area.remove();}
}
function setShareStatus(message){
 const status=el.question.querySelector("#ncp-share-status");
 if(status)status.textContent=message;
}
async function shareCurrentProblem(q){
 const url=problemShareUrl(q),text=problemShareText(q);
 const shareData={title:"NCP 기출문제 · "+q.exam,text,url};
 if(navigator.share&&(!navigator.canShare||navigator.canShare(shareData))){
  try{
   await navigator.share(shareData);
   setShareStatus("문제를 공유했습니다.");
   return;
  }catch(error){if(error?.name==="AbortError")return;}
 }
 try{
  await copyText(text+"\n문제 풀기: "+url);
  setShareStatus("문제 내용과 링크를 복사했습니다.");
 }catch{setShareStatus("공유할 수 없습니다. 다시 시도해 주세요.");}
}
async function copyCurrentProblemLink(q){
 try{
  await copyText(problemShareUrl(q));
  setShareStatus("문제 링크를 복사했습니다.");
 }catch{setShareStatus("링크를 복사할 수 없습니다. 다시 시도해 주세요.");}
}
function renderNumbers(){
 if(!state.list.length){el.list.textContent="검색 결과가 없습니다. 검색어나 시험을 변경하세요.";return;}
 el.list.innerHTML=state.list.map((q,i)=>{
  const record=recordFor(q.id);
  const status=record?.grade?(record.grade==="correct"?"matched":record.grade==="incorrect"?"unmatched":""):(record?(record.choice===q.answer?"matched":"unmatched"):"");
  const desc=gradeLabels[record?.grade] || (record?(record.choice===q.answer?"학습용 정답 일치":"학습용 정답 불일치"):"미평가");
  return '<button type="button" data-index="'+i+'" class="'+(i===state.index?"current ":"")+status+
   '" aria-label="'+(i+1)+'번 · 공개 복원 원문 '+q.originalNumber+'번 · '+desc+'"'+(i===state.index?' aria-current="true"':'')+'>'+String(i+1)+(record?.grade?' · '+gradeLabels[record.grade]:'')+'</button>';
 }).join("");
}
function render(){
 updateProgress();
 renderNumbers();
 const q=state.list[state.index];
 el.prev.disabled=!q||state.index<=0;
 el.next.disabled=!q;
 el.next.textContent=state.index===state.list.length-1?"목록으로":"다음 문제";
 if(!q){
  el.status.textContent="검색 결과 없음";
  el.question.innerHTML='<div class="ncp-empty"><h2>검색된 문제가 없습니다.</h2><p>시험을 바꾸거나 검색어를 수정하세요.</p></div>';
  return;
 }
 if(document.body.dataset.ncpView==="question"){const url=new URL(location.href);url.searchParams.set("id",q.id);history.replaceState(history.state,"",url);}
 el.status.textContent=(state.index+1)+' / '+state.list.length+'번';
 let draft=drafts.get(q.id);
 if(!draft){draft={id:crypto.randomUUID(),choice:"",open:false,hintOpen:false,answerVisible:false};drafts.set(q.id,draft);}
 const prior=recordFor(q.id);
 const answered=prior || (draft.open?draft:null);
 const options=q.options.map((option,i)=>{
  const letter=letters[i],selected=(answered||draft).choice===letter,matched=!!answered&&letter===q.answer;
  const cls=(selected?" is-selected":"")+(matched?" is-answer":"")+(answered&&selected&&!matched?" is-mismatch":"");
  return '<button type="button" class="ncp-choice'+cls+'" data-choice="'+letter+'" aria-pressed="'+Boolean(selected)+
   '"'+(answered?' disabled':'')+'><span class="ncp-choice-index" aria-hidden="true">'+numerals[i]+'</span><span>'+esc(option)+'</span></button>';
 }).join("");
 const sourceURL=/^https:\/\/notion2979\.tistory\.com\/(?:5|6|7|8|9|10)$/.test(q.sourceUrl)?q.sourceUrl:"#";
 const originalReference='<section class="ncp-original-reference" aria-label="공개 복원자료 원문 확인">'+
  '<div><strong>복원정보 · 원문 '+esc(q.originalNumber)+'번</strong><p>위 문제와 선택지는 학습용으로 재서술되어 원문과 다를 수 있습니다.</p></div>'+
  '<a href="'+esc(sourceURL)+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(q.exam)+' 공개 복원자료 원문 '+esc(q.originalNumber)+'번 새 창에서 확인">문제·선택지 원문 확인 ↗</a></section>';
 const result=answered?
   '<section class="ncp-answer quiz-results" tabindex="-1" aria-label="학습용 정답 확인">'+
   quizFeedback({label:"학습용 정답 "+numerals[letters.indexOf(q.answer)],
     details:!answered.choice?"선택하지 않음":answered.choice===q.answer?"선택한 답안과 일치":"선택한 답안과 불일치",
     kind:!answered.choice?"neutral":answered.choice===q.answer?"correct":"incorrect"})+
   quizDisclosure("해설",'<p>'+esc(q.explanation)+'</p>',{open:true})+
   '<button type="button" class="ncp-retry" data-retry>이 문제 다시 풀기</button></section>':"";
 const sourceDisclosure=quizDisclosure("복원정보 / 원문 출처",originalReference);
 const actions=[
   {label:"문제 공유",tone:"share",action:"share-problem",ariaLabel:"현재 NCP 문제 공유"},
   {label:"링크 복사",tone:"copy",action:"copy-problem-link",ariaLabel:"현재 NCP 문제 링크 복사"},
   {label:"오류 신고",tone:"report",href:learningReportUrl("ncp",q,q.exam+" · 원문 "+q.originalNumber+"번"),ariaLabel:"현재 NCP 문제 오류 신고"}
 ];
 el.question.innerHTML=
   quizNavigation({count:(state.index+1)+" / "+state.list.length,listAction:"ncp-list",jumpAction:"ncp-answer-jump"})+
   quizHeading({title:"공개 복원자료 원문 "+q.originalNumber+"번",
     titleId:"ncp-question-title",badges:[q.exam,q.topic],actions})+
   '<p id="ncp-share-status" class="ncp-share-status" role="status" aria-live="polite"></p>'+
   '<p class="quiz-question ncp-question-text">'+esc(q.question)+'</p>'+
   '<section class="quiz-answer" id="ncp-answer-entry"><h3>정답 입력</h3>'+
   '<div class="ncp-options" role="group" aria-label="선택지">'+options+'</div>'+
   '<div class="quiz-solve-actions" role="group" aria-label="문제 풀이 도움말">'+
   '<button type="button" class="quiz-solve-action quiz-solve-action--hint" data-toggle-hint aria-controls="ncp-hint" aria-expanded="'+String(!!draft.hintOpen)+'">힌트 보기</button>'+
   '<button type="button" class="study-open quiz-solve-action quiz-solve-action--answer" '+(answered?'data-show-answer':'data-open')+
   ' aria-controls="ncp-answer-results" aria-expanded="'+String(!!answered&&!!draft.answerVisible)+'">'+
   (answered&&draft.answerVisible?'정답·해설 접기':'정답·해설 보기')+'</button>'+
   '</div></section>'+
   '<section id="ncp-hint" class="quiz-solve-panel"'+(draft.hintOpen?'':' hidden')+'><h3>힌트</h3><p>'+
   esc(q.hint||("문제의 핵심 주제인 ‘"+q.topic+"’를 기준으로 각 선택지의 역할을 비교하세요. 문제의 조건과 일치하는 기능을 찾아보세요."))+
   '</p></section>'+(answered?'<div id="ncp-answer-results"'+(draft.answerVisible?'':' hidden')+'>'+result+reviewControls()+'</div>':"")+sourceDisclosure;
 if(answered)bindReview(el.question.querySelector(".study-review"),{bank:"ncp",questionId:q.id,
   clientAttemptId:draft.id,answerText:answered.choice,metadata:{exam:q.exam,choice_matches:answered.choice?answered.choice===q.answer:null,verified_server_grade:false}},
   prior?.grade,result=>{state.answers[q.id]={choice:answered.choice,grade:result};save();renderNumbers();updateProgress();});
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
 document.body.dataset.ncpView="question";
 state.index=Number(button.dataset.index);
 render();focusQuestion();el.question.scrollIntoView({block:"start"});
});
el.question.addEventListener("click",event=>{
 if(event.target.closest("[data-list]")){openNcpList();return;}
 const answer=event.target.closest("[data-choice]");
 const q=state.list[state.index];
 if(!q)return;
 const action=event.target.closest("button[data-action]")?.dataset.action;
 if(action==="share-problem"){void shareCurrentProblem(q);return;}
 if(action==="copy-problem-link"){void copyCurrentProblemLink(q);return;}
 if(action==="ncp-answer-jump"){scrollToQuizAnswer(el.question);return;}
 if(answer&&!recordFor(q.id)){
  drafts.get(q.id).choice=answer.dataset.choice;render();
  el.question.querySelector('[data-choice="'+answer.dataset.choice+'"]').focus();return;
 }
 if(event.target.closest("[data-toggle-hint]")){
   const currentDraft=drafts.get(q.id);currentDraft.hintOpen=!currentDraft.hintOpen;
   const panel=el.question.querySelector("#ncp-hint");
   panel.hidden=!currentDraft.hintOpen;
   event.target.closest("[data-toggle-hint]").setAttribute("aria-expanded",String(currentDraft.hintOpen));
   return;
 }
 if(event.target.closest("[data-show-answer]")){
   const currentDraft=drafts.get(q.id);
   currentDraft.answerVisible=!currentDraft.answerVisible;
   const result=el.question.querySelector("#ncp-answer-results");
   const button=event.target.closest("[data-show-answer]");
   if(result)result.hidden=!currentDraft.answerVisible;
   button.setAttribute("aria-expanded",String(currentDraft.answerVisible));
   button.textContent=currentDraft.answerVisible?"정답·해설 접기":"정답·해설 보기";
   if(currentDraft.answerVisible)result?.querySelector(".ncp-answer")?.focus({preventScroll:true});
   return;
 }
 if(event.target.closest("[data-open]")){
   const currentDraft=drafts.get(q.id);
   currentDraft.open=true;currentDraft.answerVisible=true;
   render();
   el.question.querySelector(".ncp-answer")?.focus({preventScroll:true});
   return;
 }
 if(event.target.closest("[data-retry]")){
  drafts.delete(q.id);delete state.answers[q.id];save();render();focusQuestion();
 }
});
el.prev.addEventListener("click",()=>{
 if(state.index>0){state.index--;render();focusQuestion();}
});
el.next.addEventListener("click",()=>{
 if(state.index<state.list.length-1){state.index++;render();focusQuestion();}else openNcpList();
});
byId("ncp-reset").addEventListener("click",()=>{
 if(!confirm("이 기기에 표시된 답안 선택만 초기화할까요? 클라우드 풀이 이력은 삭제되지 않습니다."))return;
 drafts.clear();state.answers={};save();render();cloudStatus.textContent="화면 선택 내역을 초기화했습니다. 이전 학습 결과는 클라우드에 보존됩니다.";
});
function openNcpList(){browserEntry.show();}
const browserEntry=createQuestionBrowser({
 title:"NCP 기출문제",questions:ncpQuestions,category:q=>q.exam,categoryLabel:key=>key,
 describe:q=>q.question,searchText:q=>[q.id,q.question,q.topic,q.originalNumber].join(" "),initialCategory:requestedExam||"",
 openQuestion(q,items){state.list=items;state.index=items.indexOf(q);document.body.dataset.ncpView="question";render();focusQuestion();el.question.scrollIntoView();},
});
document.body.dataset.ncpView=params.has("id")?"question":"list";
const initialID=params.get("id");
const initial=ncpQuestions.find(q=>q.id===initialID);
if(initial&&!browserEntry.resume(initialID)){
 state.exam=initial.exam;
 el.exam.value=initial.exam;
 changeSet(initial.id);
}else if(!initial){changeSet();browserEntry.show(false);}
initPortalShell().catch(error=>console.error("NCP portal initialization failed",error));
