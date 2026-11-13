// Main dashboard: favorites, recent shortcuts and published recruitment deadlines.
import {services} from "./services.js?v=20261112-alumni-integrated-1";
import {getFavorites,getRecent,toggleFavorite} from "./portal-personal.js?v=20261111-db-sync-1";
const $=selector=>document.querySelector(selector);
const esc=v=>String(v??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
const serviceById=id=>services.find(service=>service.id===id);
const link=service=>{const ext=/^https:\/\//.test(service.url);return '<a href="'+esc(service.url)+'"'+(ext?' target="_blank" rel="noopener noreferrer"':'')+'>'+esc(service.name)+' <span aria-hidden="true">'+(ext?'↗':'→')+'</span>'+(ext?'<span class="sr-only">외부 사이트 새 창</span>':'')+'</a>';};

// Only the authenticated profile determines the dashboard's grade.
let selectedGrade=null;
const isGraduateProfile=profile=>Boolean(profile)&&(profile.signup_type==="alumni"||profile.enrollment_status==="graduated");
const isAdminProfile=profile=>profile?.is_admin===true||profile?.signup_type==="staff";
let graduateMode=false;
let adminMode=false;
function showGraduateHome(){
 if(graduateMode)return;
 graduateMode=true;
 document.body.dataset.homePersona="alumni";
 document.body.dataset.homeGrade="graduate";
 const root=$("#alumni-dashboard");if(root)root.hidden=false;
 const eyebrow=$(".portal-welcome-copy .eyebrow");if(eyebrow)eyebrow.textContent="ALUMNI PORTAL";
 const title=$("#hero-title"),lead=$("#hero-description");
 if(title)title.textContent="졸업생 포털";
 if(lead)lead.textContent="졸업 후에도 기출문제 학습과 동문 네트워크를 이용하세요.";
 for(const selector of [".home-grade-control",".portal-search",".dashboard-start",".home-today",".home-catalog",".home-alerts"]){
  const element=$(selector);if(element)element.hidden=true;
 }
 window.dispatchEvent(new CustomEvent("kbigdata:home-persona",{detail:{persona:"alumni"}}));
}
function showAdminHome(){
 if(adminMode)return;
 adminMode=true;
 document.body.dataset.homePersona="admin";
 document.body.dataset.homeGrade="admin";
 const eyebrow=$(".portal-welcome-copy .eyebrow");
 if(eyebrow)eyebrow.textContent="ADMIN PORTAL";
 const heading=$("#hero-title"),lead=$("#hero-description");
 if(heading)heading.textContent="관리자 포털";
 if(lead)lead.textContent="학과 운영과 학생 계정 관리를 위한 서비스를 이용하세요.";
 // A verified super administrator is not a first- or second-year student.
 // Remove both the missing-grade warning and the grade-registration link.
 for(const selector of [".home-grade-control",".dashboard-start",".home-today",".home-alerts"]){
  const element=$(selector);if(element)element.hidden=true;
 }
 window.dispatchEvent(new CustomEvent("kbigdata:home-persona",{detail:{persona:"admin"}}));
}
const gradeLayouts=Object.freeze({
 "1":{
  title:"1학년, 오늘 무엇을 배울까요?",
  lead:"개발 기초부터 프로젝트까지, 필요한 학습 서비스를 바로 시작하세요.",
  actions:["coding","practical","certifications","docs"],
  quickTitle:"빠른 실행",
  highlightTitle:"이어서 학습하기"
 },
 "2":{
  title:"2학년, 오늘 무엇을 준비할까요?",
  lead:"취업 준비부터 입사지원까지, 필요한 활동을 바로 시작하세요.",
  actions:["recruit","apply","interview","ready"],
  quickTitle:"빠른 실행",
  highlightTitle:"이어서 취업 준비하기"
 }
});
const quickCopy=Object.freeze({
 coding:["기초 프로그래밍·명령어 350제","Java · C · Python · Ubuntu"],
 docs:["개발 공식문서","Spring Boot · 클라우드 · AI"],
 jobs:["IT 직무 가이드","목표 직무 탐색"],
 "project-guide":["프로젝트 가이드","기획 · 설계 · 구현"],
 practical:["정보처리 기출문제","C · Java · Python · SQL"],
 certifications:["IT 자격증","기사 · 산업기사 시험 안내"],
 recruit:["추천 채용공고","기업 · 직무 · 마감일"],
 apply:["입사지원 현황","지원 이력 · 주간 목표"],
 interview:["기술면접 연습","핵심 질문 · 모의면접"],
 ready:["취업 준비 점검","GitHub · 이력서 · 포트폴리오"]
});
const quickGlyph=Object.freeze({
 coding:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/>',
 docs:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z"/>',
 jobs:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 "project-guide":'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/>',
 practical:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/>',
 certifications:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/>',
 recruit:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
 apply:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
 interview:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9.3 9.3 0 0 1-4-.9L3 21l1.9-5.5a9.3 9.3 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z"/><path d="M8 10h9M8 14h6"/>',
 ready:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 12l2 2 4-5M9 18h6"/>'
});
function renderQuickActions(){
 const grid=$(".dashboard-action-grid");
 if(!grid||!selectedGrade||graduateMode)return;
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
 if(graduateMode||adminMode)return;
 const layout=selectedGrade?gradeLayouts[selectedGrade]:null;
 document.body.dataset.homeGrade=selectedGrade||"unregistered";
 const heading=$("#hero-title"),lead=$("#hero-description");
 const quick=$("#dashboard-start-title"),highlights=$("#dashboard-highlights-title");
 if(heading)heading.textContent=layout?.title||"학년 정보가 등록되지 않았습니다.";
 if(lead)lead.textContent=layout?.lead||"마이페이지에서 현재 학년을 등록하면 학년별 메인화면이 자동으로 표시됩니다.";
 if(quick&&layout)quick.textContent=layout.quickTitle;
 if(highlights&&layout)highlights.textContent=layout.highlightTitle;
 const gradeLabel=$("#home-grade-label");
 if(gradeLabel)gradeLabel.textContent=selectedGrade?selectedGrade+"학년":"학년 미등록";
 const status=$("#home-grade-status");
 if(status)status.textContent=selectedGrade
   ?"포털 회원정보에 등록된 학년이 자동 적용되었습니다."
   :"마이페이지에서 학적 상태와 학년을 확인해 주세요.";
 const link=$("#home-grade-action");
 if(link)link.hidden=Boolean(selectedGrade);
 // Missing grade must not show the first-year schedule or activities by default.
 for(const selector of [".dashboard-start",".home-today",".home-alerts"]){
  const section=$(selector);if(section)section.hidden=!selectedGrade;
 }
 if(!layout){
  $(".dashboard-action-grid")?.replaceChildren();
  return;
 }
 const notice=$("#home-alerts-subtitle");
 if(notice)notice.textContent=selectedGrade==="1"
  ?"1학년·공통 학과 일정을 확인하세요."
  :"2학년·공통 일정과 채용 마감일을 확인하세요.";
 const practiceDescription=$("#home-practical-description");
 if(practiceDescription)practiceDescription.textContent=selectedGrade==="1"
  ?"코드 읽기·값 추적·SQL 기초부터 익혀 보세요."
  :"정보처리기사·산업기사 실전 기출과 취약 영역을 반복 학습하세요.";
 renderQuickActions();
 renderPersonal();
 renderHighlights();
 window.dispatchEvent(new CustomEvent("kbigdata:home-gradechange",{detail:{grade:selectedGrade}}));
}

function loadAccountGrade(){
 if(!globalThis.portalLearning?.read)return;
 const profile=globalThis.portalHomeProfile?.();
 if(isAdminProfile(profile)){showAdminHome();return;}
 if(isGraduateProfile(profile)){showGraduateHome();return;}
 const registeredGrade=profile?.signup_type==="student"?String(profile.academic_year??""):"";
 selectedGrade=["1","2"].includes(registeredGrade)?registeredGrade:null;
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
    : '<p class="dashboard-empty">자주 쓰는 서비스의 ☆을 눌러 등록하세요.</p><a class="dashboard-empty-link" href="services.html">전체 서비스에서 추가하기 →</a>';
  if(recentRoot)recentRoot.innerHTML=recent.length
    ? '<ul class="dashboard-links">'+recent.slice(0,4).map(s=>'<li>'+link(s)+'</li>').join("")+'</ul>'
    : '<p class="dashboard-empty">방문한 서비스가 이 기기에 표시됩니다.</p><a class="dashboard-empty-link" href="services.html">전체 서비스 둘러보기 →</a>';
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
    const data=JSON.parse(learningLocal.getItem("kbigdata-practical-preferences-v1")||"null");
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
  if(!root||!selectedGrade||graduateMode)return;
  if(!selectedGrade||graduateMode)return;
  if(selectedGrade==="1"){
    const allowed=["docs","jobs","project-guide","certifications","practical"];
    const ids=[...new Set([...getRecent().filter(id=>allowed.includes(id)),"docs","project-guide"])].slice(0,2);
    root.innerHTML='<ul class="dashboard-links">'+ids.map(id=>'<li>'+link(serviceById(id))+'</li>').join("")+'</ul>'+
      '<p class="dashboard-caption">기술 학습과 프로젝트를 이어 가세요.</p>';
  }else{
    root.innerHTML='<ul class="dashboard-links"><li>'+practicalRecent()+'</li><li>'+deadlineLink()+'</li></ul>'+
      '<p class="dashboard-caption">채용 마감일은 학과 등록 데이터 기준입니다. 지원 전 원문을 확인하세요.</p>';
  }
}
installFavoriteButtons();
// Home persona is resolved after the server-authorized profile is available.
// Avoid showing an unregistered-student heading before admin role verification.
document.addEventListener("click",event=>{
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
window.addEventListener("portal-personal-updated",()=>{renderPersonal();renderQuickActions();renderHighlights();});

window.addEventListener("portal-learning-ready",loadAccountGrade);
if(globalThis.portalLearning?.read)loadAccountGrade();
