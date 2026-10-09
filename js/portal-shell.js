import {initPortalUX} from "./portal-ux.js?v=20261009-course-removed-2";
import {initGroupedSearch} from "./search-ui.js?v=20261005-perf-1";
import {footerLinks} from "./services.js?v=20261009-course-removed-2";

const esc=v=>String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

export async function initPortalShell(){
 document.querySelectorAll(".footer-links").forEach(root=>{
  root.innerHTML='<p>학과 대표 사이트</p>'+footerLinks.map(link=>'<a href="'+esc(link.url)+'" target="_blank" rel="noopener noreferrer">'+esc(link.name)+' ↗<span class="sr-only"> 외부 사이트, 새 창</span></a>').join('');
 });
 document.querySelectorAll("#current-year").forEach(el=>el.textContent=new Date().getFullYear());

 const toggle=document.querySelector(".menu-toggle"),nav=document.querySelector("#portal-nav");
 const closeMenu=()=>{nav?.classList.remove("is-open");toggle?.setAttribute("aria-expanded","false");};
 toggle?.addEventListener("click",()=>{
  const open=toggle.getAttribute("aria-expanded")!=="true";
  toggle.setAttribute("aria-expanded",String(open));
  nav?.classList.toggle("is-open",open);
 });
 nav?.addEventListener("click",event=>{if(event.target.closest("a"))closeMenu();});
 document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&toggle?.getAttribute("aria-expanded")==="true"){
   closeMenu();
   toggle.focus();
  }
 });
 document.addEventListener("click",event=>{if(!event.target.closest(".site-header"))closeMenu();});

 await initPortalUX();
 initGroupedSearch();
}
