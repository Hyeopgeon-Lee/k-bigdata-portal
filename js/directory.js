// Service-directory controls reuse the canonical service registry and existing browser-only favorites.
import "./app.js?v=20261026-portal-launcher-1";
import {services} from "./services.js?v=20261026-portal-launcher-1";
import {getFavorites,toggleFavorite} from "./portal-personal.js?v=20261026-portal-launcher-1";
const input=document.getElementById("directory-query");
const clear=document.getElementById("directory-clear");
const category=document.getElementById("directory-category");
const favoriteFilter=document.getElementById("directory-only-favorites");
const status=document.getElementById("directory-status");
const favoritesList=document.getElementById("directory-favorites-list");
const favoritesCount=document.getElementById("directory-favorite-count");
const text=service=>[service.name,service.englishName,service.shortDescription,service.description,service.aliases,...(service.tags||[])].filter(Boolean).join(" ").toLocaleLowerCase("ko-KR");
const normalized=value=>value.trim().toLocaleLowerCase("ko-KR");
const serviceByUrl=url=>services.find(service=>service.url===url);
const byId=new Map(services.map(service=>[service.id,service]));
const esc=value=>String(value??"").replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character]));
const extern=url=>/^https:\/\//.test(url);
let onlyFavorites=false;

function renderFavorites(){
 const ids=getFavorites(),items=ids.map(id=>byId.get(id)).filter(Boolean);
 favoritesCount.textContent=ids.length+"개";
 favoritesList.innerHTML=items.length
  ? '<ul>'+items.map(service=>'<li><a href="'+esc(service.url)+'"'+(extern(service.url)?' target="_blank" rel="noopener noreferrer"':'')+'>'+esc(service.name)+(extern(service.url)?' ↗':' →')+'</a></li>').join("")+'</ul>'
  : '<p>각 서비스 카드의 ☆ 버튼으로 자주 쓰는 메뉴를 등록하세요.</p>';
}
function render(){
 const query=normalized(input.value);
 const favorites=new Set(getFavorites());
 let visible=0;
 for(const card of document.querySelectorAll(".directory-catalog .service-card")){
  const service=serviceByUrl(card.getAttribute("href"));
  if(!service)continue;
  const matches=(!query||text(service).includes(query))&&(!category.value||service.category===category.value)&&(!onlyFavorites||favorites.has(service.id));
  card.parentElement.hidden=!matches;
  if(matches)visible++;
  const button=card.parentElement.querySelector(".directory-favorite-button");
  if(button){
   const active=favorites.has(service.id);
   button.textContent=active?"★":"☆";
   button.setAttribute("aria-pressed",String(active));
   button.setAttribute("aria-label",service.name+(active?" 즐겨찾기 해제":" 즐겨찾기 추가"));
   button.title=active?"즐겨찾기 해제":"즐겨찾기 추가";
  }
 }
 for(const group of document.querySelectorAll(".directory-catalog .service-group")){
  group.hidden=!group.querySelector(".directory-service-tile:not([hidden])");
 }
 status.textContent=(query||onlyFavorites||category.value?"검색 결과 ":"전체 ")+visible+"개 서비스"+(onlyFavorites?" · 즐겨찾기 필터":"");
 favoriteFilter.setAttribute("aria-pressed",String(onlyFavorites));
 favoriteFilter.textContent=onlyFavorites?"★ 즐겨찾기만 표시 중":"☆ 즐겨찾기만";
 renderFavorites();
}
for(const card of document.querySelectorAll(".directory-catalog .service-card")){
 const service=serviceByUrl(card.getAttribute("href"));
 if(!service)continue;
 const wrapper=document.createElement("div");
 wrapper.className="directory-service-tile";
 card.replaceWith(wrapper);
 wrapper.append(card);
 const favorite=document.createElement("button");
 favorite.type="button";
 favorite.className="directory-favorite-button";
 favorite.dataset.favorite=service.id;
 wrapper.append(favorite);
}
input?.addEventListener("input",render);
category?.addEventListener("change",render);
favoriteFilter?.addEventListener("click",()=>{onlyFavorites=!onlyFavorites;render();});
clear?.addEventListener("click",()=>{input.value="";category.value="";onlyFavorites=false;render();input.focus();});
document.getElementById("service-groups")?.addEventListener("click",event=>{
 const favorite=event.target.closest(".directory-favorite-button");
 if(!favorite)return;
 event.preventDefault();
 toggleFavorite(favorite.dataset.favorite);
 render();
});
window.addEventListener("storage",event=>{if(event.key==="kbigdata-portal-ui-v1")render();});
render();
