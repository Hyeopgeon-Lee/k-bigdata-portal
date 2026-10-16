// Main dashboard: favorites, recent shortcuts and published recruitment deadlines.
import {services} from "./services.js?v=20261016-nav-search-filters-1";
import {getFavorites,getRecent,toggleFavorite} from "./portal-personal.js?v=20261016-dashboard-1";
const $=selector=>document.querySelector(selector);
const esc=v=>String(v??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
const serviceById=id=>services.find(service=>service.id===id);
const link=service=>'<a href="'+esc(service.url)+'"'+(/^https:\/\//.test(service.url)?' target="_blank" rel="noopener noreferrer"':'')+'>'+esc(service.name)+' <span aria-hidden="true">→</span></a>';

function renderPersonal(){
  const favorites=getFavorites().map(serviceById).filter(Boolean);
  const recent=getRecent().map(serviceById).filter(Boolean);
  const favoritesRoot=$("#favorite-services"), recentRoot=$("#recent-services");
  if(favoritesRoot)favoritesRoot.innerHTML=favorites.length
    ? '<ul class="dashboard-links">'+favorites.slice(0,6).map(s=>'<li>'+link(s)+'</li>').join("")+'</ul>'
    : '<p class="dashboard-empty">즐겨찾기가 없습니다. 아래 서비스 카드의 ☆을 눌러 등록하세요.</p>';
  if(recentRoot)recentRoot.innerHTML=recent.length
    ? '<ul class="dashboard-links">'+recent.slice(0,4).map(s=>'<li>'+link(s)+'</li>').join("")+'</ul>'
    : '<p class="dashboard-empty">서비스를 이용하면 이 기기에 최근 방문 목록이 표시됩니다.</p>';
  document.querySelectorAll("[data-favorite]").forEach(button=>{
    const active=getFavorites().includes(button.dataset.favorite);
    button.setAttribute("aria-pressed",String(active));
    button.textContent=active?"★":"☆";
    button.setAttribute("aria-label",(button.dataset.serviceName||"서비스")+(active?" 즐겨찾기 해제":" 즐겨찾기 추가"));
    button.title=active?"즐겨찾기 해제":"즐겨찾기 추가";
  });
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
  const button=event.target.closest?.("button[data-favorite]");
  if(!button)return;
  toggleFavorite(button.dataset.favorite);
  renderPersonal();
});
window.addEventListener("storage",event=>{if(event.key==="kbigdata-portal-ui-v1")renderPersonal();});
