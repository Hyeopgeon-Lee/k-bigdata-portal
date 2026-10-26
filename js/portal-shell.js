import {initPortalUX} from "./portal-ux.js?v=20261026-portal-launcher-1";
import {initRecentTracking} from "./portal-personal.js?v=20261026-portal-launcher-1";
import {initGroupedSearch} from "./search-ui.js?v=20261026-portal-launcher-1";
import {footerLinks} from "./services.js?v=20261026-portal-launcher-1";

const esc=v=>String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

export function initPortalShell(){
 if(globalThis.__kbigdataPortalShellPromise)return globalThis.__kbigdataPortalShellPromise;
 return globalThis.__kbigdataPortalShellPromise=(async()=>{
 document.querySelectorAll(".footer-links").forEach(root=>{
  root.innerHTML='<p>학과 대표 사이트</p>'+footerLinks.map(link=>'<a href="'+esc(link.url)+'" target="_blank" rel="noopener noreferrer">'+esc(link.name)+' ↗<span class="sr-only"> 외부 사이트, 새 창</span></a>').join('');
 });
 document.querySelectorAll("#current-year").forEach(el=>el.textContent=new Date().getFullYear());

 initRecentTracking();
 await initPortalUX();
 initGroupedSearch();
 })();
}
