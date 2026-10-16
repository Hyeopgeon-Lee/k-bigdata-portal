// Main dashboard: favorites, recent shortcuts and published recruitment deadlines.
import {services} from "./services.js?v=20261016-nav-search-filters-1";
import {getFavorites,getRecent,toggleFavorite} from "./portal-personal.js?v=20261016-dashboard-1";
const $=selector=>document.querySelector(selector);
const esc=v=>String(v??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
const serviceById=id=>services.find(service=>service.id===id);
const link=service=>{const ext=/^https:\/\//.test(service.url);return '<a href="'+esc(service.url)+'"'+(ext?' target="_blank" rel="noopener noreferrer"':'')+'>'+esc(service.name)+' <span aria-hidden="true">'+(ext?'↗':'→')+'</span>'+(ext?'<span class="sr-only">외부 사이트 새 창</span>':'')+'</a>';};

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
  root.innerHTML='<ul class="dashboard-links"><li>'+practicalRecent()+'</li><li>'+deadlineLink()+'</li></ul><p class="dashboard-caption">채용 마감일은 학과 등록 데이터 기준입니다. 지원 전 원문을 확인하세요.</p>';
}
installFavoriteButtons();
renderPersonal();
renderHighlights();
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
window.addEventListener("storage",event=>{if(event.key==="kbigdata-portal-ui-v1")renderPersonal();});
