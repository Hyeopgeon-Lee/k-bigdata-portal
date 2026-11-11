/* One semantic question shell for Information Processing, NCP and Coding.
 * Services own their datasets, answer widgets and grading. This module owns
 * navigation, heading, metadata, actions, disclosure and result presentation.
 * Do not clone these visual components in service-specific markup. */
const escapeHTML=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const attr=(name,value)=>value===undefined||value===null||value===""?"":' '+name+'="'+escapeHTML(value)+'"';
export function quizNavigation({count="1 / 1",listAction,listId,counterId,jumpAction,jumpId}={}){
  return '<nav class="quiz-navigation" aria-label="문제 탐색">'+
    '<button type="button" class="quiz-nav-button quiz-nav-list"'+attr("data-action",listAction)+attr("data-list",listAction==="ncp-list"?"true":undefined)+attr("id",listId)+'>← 문제 목록</button>'+
    '<strong class="quiz-counter"'+attr("id",counterId)+' aria-live="polite">'+escapeHTML(count)+'</strong>'+
    '<button type="button" class="quiz-nav-button quiz-nav-jump"'+attr("data-action",jumpAction)+attr("id",jumpId)+' aria-label="정답 입력 영역으로 이동">답 입력 ↓</button>'+
  '</nav>';
}
export function quizHeading({title="",titleId="",badges=[],actions=[]}={}){
  const chips=badges.map((badge,index)=>{
    const data=typeof badge==="string"?{label:badge}:badge;
    return '<span class="quiz-badge'+(index===0?' quiz-badge-primary':'')+'"'+attr("id",data.id)+'>'+escapeHTML(data.label||"")+'</span>';
  }).join("");
  const actionHTML=actions.map(action=>{
    const label=escapeHTML(action.label);
    if(action.href!==undefined)return '<a class="quiz-action" href="'+escapeHTML(action.href)+'"'+attr("id",action.id)+attr("aria-label",action.ariaLabel)+'>'
      +label+'</a>';
    return '<button type="button" class="quiz-action"'+attr("id",action.id)+attr("data-action",action.action)+attr("aria-label",action.ariaLabel)+'>'
      +label+'</button>';
  }).join("");
  return '<header class="quiz-heading">'+
    '<h2 class="quiz-title" tabindex="-1"'+attr("id",titleId)+'>'+escapeHTML(title)+'</h2>'+
    '<div class="quiz-badges" aria-label="문제 분류">'+chips+'</div>'+
    '<div class="quiz-actions" role="group" aria-label="문제 공유 및 오류 신고">'+actionHTML+'</div>'+
  '</header>';
}
export function quizDisclosure(title,html,{open=false,className=""}={}){
  return '<details class="quiz-disclosure'+(className?' '+escapeHTML(className):'')+'"'+(open?' open':'')+'>'+
    '<summary>'+escapeHTML(title)+'</summary><div class="quiz-disclosure-body">'+html+'</div></details>';
}
/* Keep dynamic editor/content nodes and their listeners intact when installing
 * the same explanation accordion as the other two services. */
export function mountQuizDisclosure(container,{title="해설",open=true}={}){
  if(!container)return null;
  const existing=container.querySelector(":scope > .quiz-disclosure");
  if(existing)return existing;
  const details=document.createElement("details");
  details.className="quiz-disclosure";details.open=open;
  const summary=document.createElement("summary");summary.textContent=title;
  const body=document.createElement("div");body.className="quiz-disclosure-body";
  while(container.firstChild)body.append(container.firstChild);
  details.append(summary,body);container.append(details);
  return details;
}
export function quizFeedback({label="",details="",kind="neutral"}={}){
  const safeKind=["correct","incorrect","neutral"].includes(kind)?kind:"neutral";
  return '<div class="quiz-feedback quiz-feedback-'+safeKind+'" role="status"><strong>'+escapeHTML(label)+'</strong>'+
    (details?'<span>'+escapeHTML(details)+'</span>':'')+'</div>';
}
export function scrollToQuizAnswer(root=document){
  const target=root.querySelector(".quiz-answer input:not([disabled]),.quiz-answer textarea:not([disabled]),.quiz-answer .cm-content,.quiz-answer button:not([disabled])")
    ||root.querySelector(".quiz-answer");
  if(!target)return;
  target.scrollIntoView({block:"center",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
  if(typeof target.focus==="function")target.focus({preventScroll:true});
}
