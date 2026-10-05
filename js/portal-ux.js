import {services,portalNavLinks} from "./services.js?v=20261005-6";

const esc=v=>String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const link=(url,text)=>'<a href="'+esc(url)+'">'+esc(text)+' →</a>';

function disclosure(node,title){
 if(!node||node.closest(".ux-disclosure"))return;
 const details=document.createElement("details"),summary=document.createElement("summary");
 details.className="ux-disclosure";
 summary.textContent=title;
 node.before(details);
 details.append(summary,node);
}

function detailHeading(panel){
 const heading=panel?.querySelector("h2");
 if(!heading)return;
 const h1=document.createElement("h1");
 h1.className=heading.className;
 h1.id=heading.id;
 h1.textContent=heading.textContent;
 heading.replaceWith(h1);
}

function revealHash(){
 let id;
 try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
 const node=document.getElementById(id);
 if(!node)return;
 for(let parent=node.parentElement;parent;parent=parent.parentElement)if(parent.tagName==="DETAILS")parent.open=true;
 node.scrollIntoView({block:"start",behavior:"auto"});
}

async function enhanceJobDetail(id){
 const panel=document.querySelector("#detail .detail-panel");
 if(!panel||!id)return false;
 const [{jobs},{certifications},{docs,findDocForSkill}]=await Promise.all([
  import("./jobs.js"),
  import("./certifications.js"),
  import("./docs.js")
 ]);
 const job=jobs.find(item=>item.id===id);
 if(!job)return false;

 document.querySelector(".page-hero")?.setAttribute("hidden","");
 detailHeading(panel);
 if(!panel.querySelector(".ux-at-glance")){
  const summary=document.createElement("section");
  summary.className="ux-at-glance";
  summary.setAttribute("aria-label","직무 한눈에 보기");
  const certs=certifications.filter(c=>job.certifications.includes(c.id));
  summary.innerHTML='<h3>한눈에 보기</h3><h4>핵심 기술</h4><div class="doc-related">'+job.essentialSkills.slice(0,4).map(skill=>{const doc=findDocForSkill(skill);return doc?link("docs.html?id="+doc.id,skill):'<span>'+esc(skill)+'</span>';}).join('')+'</div><h4>추천 준비</h4><div class="doc-related">'+certs.map(c=>link("certifications.html?id="+c.id,c.name)).join('')+'</div><h4>대표 프로젝트</h4><p>'+esc(job.projectIdeas[0].title)+'</p>';
  panel.querySelector(".job-jump")?.before(summary);
 }
 disclosure(panel.querySelector(".job-two-column"),"주요 업무 · 핵심 기술 · 채용 키워드");
 for(const section of [...panel.querySelectorAll(":scope > .job-section")])disclosure(section,section.querySelector("h3")?.textContent||"상세 정보");
 return true;
}

export async function initPortalUX(){
 const page=document.body.dataset.page,params=new URLSearchParams(location.search),id=params.get("id");

 for(const nav of document.querySelectorAll("[data-learning-nav]")){
  nav.classList.add("portal-service-nav");
  nav.setAttribute("aria-label","포털 서비스 바로가기");
  nav.innerHTML=portalNavLinks.map(item=>{
   const service=services.find(s=>s.id===item.id);
   if(!service)return "";
   const current=!/^https?:\/\//.test(service.url)&&location.pathname.endsWith(service.url);
   return '<a href="'+esc(service.url)+'" data-nav-group="'+esc(item.group)+'"'+(current?' aria-current="page"':'')+'>'+esc(item.label)+'</a>';
  }).join("");
  const current=nav.querySelector('[aria-current="page"]');
  if(current&&matchMedia("(max-width:767px)").matches)requestAnimationFrame(()=>current.scrollIntoView({inline:"center",block:"nearest"}));
 }

 if(!document.querySelector(".interview-home-link")&&!document.body.classList.contains("practical-page")&&!document.querySelector(".portal-mobile-home")){
  const home=document.createElement("a");
  home.href="index.html";
  home.className="portal-mobile-home";
  home.textContent="포털 홈";
  document.querySelector(".menu-toggle")?.before(home);
 }

 if(page==="docs"){
  const controls=document.querySelector("#list-controls"),input=document.querySelector("#local-query"),label=document.querySelector('label[for="local-query"]');
  if(controls&&input&&label&&!controls.contains(label))controls.prepend(label,input);
  const guide=document.querySelector("#doc-flow-guide");
  if(guide)guide.hidden=!!document.querySelector("#detail .detail-panel");
 }

 if(page==="jobs"){
  const enhanced=await enhanceJobDetail(id);
  if(!enhanced)disclosure(document.querySelector("#job-comparisons"),"직무 간 차이 이해하기");
 }

 if(page==="certifications"&&document.querySelector(".cert-detail"))document.querySelector(".page-hero")?.setAttribute("hidden","");

 for(const node of document.querySelectorAll(".checklist-card"))disclosure(node,node.querySelector("h2")?.textContent||"체크리스트");
 if(document.body.hasAttribute("data-guide-page"))disclosure(document.querySelector(".principle"),"기술보다 문제에서 시작하는 이유");

 window.addEventListener("hashchange",revealHash,{passive:true});
 document.addEventListener("click",event=>{const a=event.target.closest('a[href^="#"]');if(a)requestAnimationFrame(revealHash);});
 if(location.hash)requestAnimationFrame(revealHash);
}
