import {isExternal} from "./services.js?v=20261020-coding-1";

const esc=v=>String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

export function initGroupedSearch(){
 const input=document.querySelector("#portal-query"),root=document.querySelector("#search-results"),status=document.querySelector("#search-status"),form=document.querySelector("#portal-search-form");
 if(!input||!root)return;

 let groups=[],expanded=new Set(),timer=0,searchModule=null;
 if(status&&!input.value.trim())status.textContent="검색어를 입력하면 관련 서비스와 학습 자료를 찾습니다.";
 const loadSearch=()=>searchModule||(searchModule=import("./search.js?v=20261016-expanded-search-1"));

 function render(){
  root.innerHTML=groups.map((g,i)=>'<li class="search-group"><h3>'+esc(g.label)+' <small>'+g.items.length+'</small></h3><ul>'+g.items.slice(0,expanded.has(i)?g.items.length:4).map(r=>'<li><a href="'+esc(r.url)+'"'+(isExternal(r.url)?' target="_blank" rel="noopener noreferrer"':'')+'>'+esc(r.title)+(isExternal(r.url)?' ↗<span class="sr-only"> 외부 사이트, 새 창</span>':' →')+'</a></li>').join('')+'</ul>'+(g.items.length>4?'<button type="button" class="button button-secondary" data-search-group="'+i+'" aria-expanded="'+expanded.has(i)+'">'+esc(g.label)+(expanded.has(i)?' 접기':' 더 보기')+'</button>':'')+'</li>').join('');
 }

 async function search(){
  const query=input.value.trim();
  expanded=new Set();
  if(!query){
   groups=[];
   status.textContent="한글·영문 키워드로 검색하세요.";
   render();
   return;
  }
  status.textContent="검색 데이터를 준비하는 중입니다.";
  try{
   const {groupSearchResultsExpanded}=await loadSearch();
   const nextGroups=await groupSearchResultsExpanded(query);
   if(query!==input.value.trim())return;
   groups=nextGroups;
   status.textContent=groups.reduce((n,g)=>n+g.items.length,0)+"개 결과 · 유형별로 표시합니다.";
   render();
  }catch{
   status.textContent="검색 데이터를 불러오지 못했습니다. 다시 입력해 주세요.";
  }
 }

 form?.addEventListener("submit",event=>{
  event.preventDefault();
  clearTimeout(timer);
  void search();
 });
 input.addEventListener("input",()=>{
  clearTimeout(timer);
  timer=window.setTimeout(search,90);
 });
 input.addEventListener("focus",()=>{
  // Idle prefetch after explicit search intent, without blocking initial page rendering.
  if(!searchModule&&"requestIdleCallback" in window)requestIdleCallback(()=>loadSearch(),{timeout:1200});
 });
 root.addEventListener("click",event=>{
  const b=event.target.closest("[data-search-group]");
  if(!b)return;
  const index=Number(b.dataset.searchGroup);
  expanded.has(index)?expanded.delete(index):expanded.add(index);
  render();
  root.querySelector('[data-search-group="'+index+'"]')?.focus({preventScroll:true});
 });
}
