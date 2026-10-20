// Main dashboard: favorites, recent shortcuts and published recruitment deadlines.
import {services} from "./services.js?v=20261016-nav-search-filters-1";
import {getFavorites,getRecent,toggleFavorite} from "./portal-personal.js?v=20261016-dashboard-1";
const $=selector=>document.querySelector(selector);
const esc=v=>String(v??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
const serviceById=id=>services.find(service=>service.id===id);
const link=service=>{const ext=/^https:\/\//.test(service.url);return '<a href="'+esc(service.url)+'"'+(ext?' target="_blank" rel="noopener noreferrer"':'')+'>'+esc(service.name)+' <span aria-hidden="true">'+(ext?'↗':'→')+'</span>'+(ext?'<span class="sr-only">외부 사이트 새 창</span>':'')+'</a>';};

// Presentation preference only: does not grant access or hide any service.
const GRADE_KEY="kbigdata:home-grade:v1";
const readSavedGrade=()=>{
  try{const value=localStorage.getItem(GRADE_KEY);return value==="1"||value==="2"?value:null;}
  catch{return null;}
};
let selectedGrade=readSavedGrade()||"1";
const gradeLayouts=Object.freeze({
 "1":{
  title:"1학년, 오늘 무엇을 배울까요?",
  lead:"개발 기초부터 프로젝트까지, 필요한 학습 서비스를 바로 시작하세요.",
  actions:["docs","jobs","project-guide","practical"],
  quickTitle:"학습 바로 시작하기",
  highlightTitle:"이어서 학습하기"
 },
 "2":{
  title:"2학년, 오늘 무엇을 준비할까요?",
  lead:"취업 준비부터 입사지원까지, 필요한 활동을 바로 시작하세요.",
  actions:["recruit","apply","interview","ready"],
  quickTitle:"취업 바로 시작하기",
  highlightTitle:"이어서 취업 준비하기"
 }
});
const quickCopy=Object.freeze({
 docs:["개발 공식문서","Spring Boot · 클라우드 · AI"],
 jobs:["IT 직무 가이드","목표 직무 탐색"],
 "project-guide":["프로젝트 가이드","기획 · 설계 · 구현"],
 practical:["코딩 · SQL 실습","C · Java · Python · SQL"],
 recruit:["추천 채용공고","기업 · 직무 · 마감일"],
 apply:["입사지원 현황","지원 이력 · 주간 목표"],
 interview:["기술면접 연습","핵심 질문 · 모의면접"],
 ready:["취업 준비 점검","GitHub · 이력서 · 포트폴리오"]
});
const quickGlyph=Object.freeze({
 docs:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z"/>',
 jobs:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 "project-guide":'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/>',
 practical:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/>',
 recruit:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
 apply:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
 interview:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9.3 9.3 0 0 1-4-.9L3 21l1.9-5.5a9.3 9.3 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z"/><path d="M8 10h9M8 14h6"/>',
 ready:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 12l2 2 4-5M9 18h6"/>'
});
function renderQuickActions(){
 const grid=$(".dashboard-action-grid");
 if(!grid)return;
 const favorites=new Set(getFavorites());
 const cards=gradeLayouts[selectedGrade].actions.map(id=>{
  const service=serviceById(id);
  if(!service)return "";
  const [label,description]=quickCopy[id];
  const external=/^https:\/\//.test(service.url);
  const favorite=favorites.has(id);
  const svg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">'+quickGlyph[id]+'</svg>';
  return '<div class="dashboard-action-tile"><a class="dashboard-action" href="'+esc(service.url)+'"'+(external?' target="_blank" rel="noopener noreferrer"':'')+'>'+
   '<span class="dashboard-action-symbol">'+svg+'</span><strong>'+esc(label)+'</strong><small>'+esc(description)+'</small>'+
   '<span class="dashboard-action-arrow" aria-hidden="true">'+(external?'↗':'→')+'</span>'+
   (external?'<span class="sr-only">새 창에서 열림</span>':'')+'</a>'+
   '<button type="button" class="dashboard-action-favorite" data-favorite="'+esc(id)+'" data-service-name="'+esc(service.name)+'" aria-label="'+esc(service.name)+(favorite?' 즐겨찾기 해제':' 즐겨찾기 추가')+'" aria-pressed="'+favorite+'" title="'+(favorite?'즐겨찾기 해제':'즐겨찾기 추가')+'">'+(favorite?'★':'☆')+'</button></div>';
 });
 grid.innerHTML=cards.join("");
}
function renderGrade(){
 const layout=gradeLayouts[selectedGrade];
 document.body.dataset.homeGrade=selectedGrade;
 const heading=$("#hero-title"),lead=$("#hero-description"),quick=$("#dashboard-start-title"),highlights=$("#dashboard-highlights-title");
 if(heading)heading.textContent=layout.title;
 if(lead)lead.textContent=layout.lead;
 if(quick)quick.textContent=layout.quickTitle;
 if(highlights)highlights.textContent=layout.highlightTitle;
 for(const button of document.querySelectorAll("button[data-home-grade]")){
  const pressed=button.dataset.homeGrade===selectedGrade;
  button.setAttribute("aria-pressed",String(pressed));
 }
 const status=$("#home-grade-status");
 if(status)status.textContent=readSavedGrade()
   ?"현재 "+selectedGrade+"학년 화면 · 언제든 변경할 수 있습니다."
   :"처음 이용하신다면 학년을 선택하세요. 이 기기에 저장됩니다.";
 renderQuickActions();
 renderPersonal();
 renderHighlights();
 window.dispatchEvent(new CustomEvent("kbigdata:home-gradechange",{detail:{grade:selectedGrade}}));
}
function chooseGrade(grade){
 if(grade!=="1"&&grade!=="2")return;
 selectedGrade=grade;
 try{localStorage.setItem(GRADE_KEY,grade);}catch{}
 renderGrade();
}

let activeTab = getFavorites().length ? "favorites" : getRecent().length ? "recent" : "favorites";
const panels = {favorites:"#favorite-services",recent:"#recent-services"};
const tabIds = {favorites:"#tab-favorites",recent:"#tab-recent"};
function showPersonalTab(next, focus=false){
  if(!panels[next])return;
  activeTab=next;
  for(const key of Object.keys(panels)){
    const panel=$(panels[key]), tab=$(tabIds[key]), selected=key===next;
    if(panel)panel.hidden=!selected;
    if(tab){tab.setAttribute("aria-selected",String(selected));tab.tabIndex=selected?0:-1;}
  }
  if(focus)$(tabIds[next])?.focus();
}
function renderPersonal(){
  const favoriteIds=getFavorites();
  const favorites=favoriteIds.map(serviceById).filter(Boolean);
  const recent=getRecent().map(serviceById).filter(Boolean);
  const favoritesRoot=$("#favorite-services"),recentRoot=$("#recent-services");
  if(favoritesRoot)favoritesRoot.innerHTML=favorites.length
    ? '<ul class="dashboard-links">'+favorites.slice(0,6).map(s=>'<li>'+link(s)+'</li>').join("")+'</ul>'
    : '<p class="dashboard-empty">자주 쓰는 서비스의 ☆을 눌러 등록하세요.</p><a class="dashboard-empty-link" href="#services">전체 서비스에서 추가하기 →</a>';
  if(recentRoot)recentRoot.innerHTML=recent.length
    ? '<ul class="dashboard-links">'+recent.slice(0,4).map(s=>'<li>'+link(s)+'</li>').join("")+'</ul>'
    : '<p class="dashboard-empty">방문한 서비스가 이 기기에 표시됩니다.</p><a class="dashboard-empty-link" href="#services">전체 서비스 둘러보기 →</a>';
  for(const button of document.querySelectorAll("[data-favorite]")){
    const active=favoriteIds.includes(button.dataset.favorite);
    const label=button.dataset.serviceName||"서비스";
    button.setAttribute("aria-pressed",String(active));
    button.textContent=active?"★":"☆";
    button.setAttribute("aria-label",label+(active?" 즐겨찾기 해제":" 즐겨찾기 추가"));
    button.title=active?"즐겨찾기 해제":"즐겨찾기 추가";
  }
  showPersonalTab(activeTab);
}
function installFavoriteButtons(){
  for(const card of document.querySelectorAll(".service-card")){
    const url=card.getAttribute("href");
    const service=services.find(item=>item.url===url);
    if(!service||card.parentElement?.classList.contains("service-tile"))continue;
    const wrap=document.createElement("div");
    wrap.className="service-tile";
    card.replaceWith(wrap);
    wrap.append(card);
    const button=document.createElement("button");
    button.type="button";
    button.className="service-favorite";
    button.dataset.favorite=service.id;
    button.dataset.serviceName=service.name;
    wrap.append(button);
  }
}
function practicalRecent(){
  try{
    const data=JSON.parse(localStorage.getItem("kbigdata-practical-preferences-v1")||"null");
    const id=data?.lastQuestionId;
    if(typeof id==="string" && /^[\w-]{1,80}$/.test(id))
      return '<a href="practical.html?id='+encodeURIComponent(id)+'">마지막 실기 문제 다시 보기 <span aria-hidden="true">→</span></a>';
  }catch{}
  return '<a href="practical.html">실기 학습 시작하기 <span aria-hidden="true">→</span></a>';
}
function deadlineLink(){
  const today=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
  const jobs=(window.K_BIGDATA_RECRUITMENTS||[])
    .filter(job=>job.active!==false && job.deadlineType==="DATE" && /^\d{4}-\d\d-\d\d$/.test(job.deadline||"") && job.deadline>=today)
    .sort((a,b)=>a.deadline.localeCompare(b.deadline));
  const first=jobs[0];
  if(!first)return '<a href="recruit.html">추천 채용공고 확인하기 <span aria-hidden="true">→</span></a>';
  const days=Math.round((Date.parse(first.deadline+"T00:00:00+09:00")-Date.parse(today+"T00:00:00+09:00"))/86400000);
  const suffix=days<=7?' · D-'+days:' · '+first.deadline.replaceAll("-",".");
  return '<a href="recruit.html?job='+encodeURIComponent(first.id)+'">'+esc(first.company||"채용공고")+esc(suffix)+' <span aria-hidden="true">→</span></a>';
}
function renderHighlights(){
  const root=$("#dashboard-highlights");
  if(!root)return;
  if(selectedGrade==="1"){
    const allowed=["docs","jobs","project-guide","practical"];
    const ids=[...new Set([...getRecent().filter(id=>allowed.includes(id)),"docs","project-guide"])].slice(0,2);
    root.innerHTML='<ul class="dashboard-links">'+ids.map(id=>'<li>'+link(serviceById(id))+'</li>').join("")+'</ul>'+
      '<p class="dashboard-caption">기술 학습과 프로젝트를 이어 가세요.</p>';
  }else{
    root.innerHTML='<ul class="dashboard-links"><li>'+practicalRecent()+'</li><li>'+deadlineLink()+'</li></ul>'+
      '<p class="dashboard-caption">채용 마감일은 학과 등록 데이터 기준입니다. 지원 전 원문을 확인하세요.</p>';
  }
}
installFavoriteButtons();
renderGrade();
document.addEventListener("click",event=>{
  const gradeButton=event.target.closest?.("button[data-home-grade]");
  if(gradeButton){chooseGrade(gradeButton.dataset.homeGrade);return;}
  const star=event.target.closest?.("button[data-favorite]");
  if(star){
    const active=toggleFavorite(star.dataset.favorite);
    showPersonalTab("favorites");
    renderPersonal();
    if(active)$("#tab-favorites")?.setAttribute("aria-selected","true");
    return;
  }
  const tab=event.target.closest?.("button[role=tab]");
  if(tab?.id==="tab-favorites")showPersonalTab("favorites");
  else if(tab?.id==="tab-recent")showPersonalTab("recent");
});
document.querySelector(".dashboard-personal-tabs")?.addEventListener("keydown",event=>{
  if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
  event.preventDefault();
  const target=(event.key==="Home"||event.key==="ArrowLeft")?"favorites":"recent";
  showPersonalTab(target,true);
});
window.addEventListener("storage",event=>{
 if(event.key==="kbigdata-portal-ui-v1"){renderPersonal();renderQuickActions();}
 if(event.key===GRADE_KEY){selectedGrade=readSavedGrade()||"1";renderGrade();}
});
