import {services,learningLinks} from "./services.js";
import {jobs} from "./jobs.js";
import {certifications} from "./certifications.js";
import {docs,findDocForSkill} from "./docs.js";
const esc=v=>String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const link=(url,text)=>'<a href="'+esc(url)+'">'+esc(text)+' →</a>';

// Wrap existing nodes, rather than duplicating or rewriting their content.
function disclosure(node,title){
 if(!node||node.closest(".ux-disclosure"))return;
 const details=document.createElement("details"),summary=document.createElement("summary");
 details.className="ux-disclosure";summary.textContent=title;
 node.before(details);details.append(summary,node);
}
function detailHeading(panel){const heading=panel.querySelector('h2');if(!heading)return;const h1=document.createElement('h1');h1.className=heading.className;h1.id=heading.id;h1.textContent=heading.textContent;heading.replaceWith(h1);}
function revealHash(){
 let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const node=document.getElementById(id);
 if(!node)return;
 for(let parent=node.parentElement;parent;parent=parent.parentElement)if(parent.tagName==="DETAILS")parent.open=true;
 node.scrollIntoView({block:"start",behavior:"auto"});
}
export function initPortalUX(){
 const page=document.body.dataset.page,params=new URLSearchParams(location.search),id=params.get("id");
 for(const nav of document.querySelectorAll("[data-learning-nav]")){
  nav.innerHTML=learningLinks.map(item=>{const service=services.find(s=>s.id===item.id);return '<a href="'+esc(service.url)+'"'+(location.pathname.endsWith(service.url)?' aria-current="page"':'')+'>'+esc(item.label)+'</a>';}).join('');
  // Practice focus keeps its compact app header, with navigation available below home content.
  if(document.body.classList.contains("practical-page"))document.querySelector(".bank-disclaimer")?.before(nav);
 }
 if(!document.querySelector(".interview-home-link")&&!document.body.classList.contains("practical-page")){
  const home=document.createElement("a");home.href="index.html";home.className="portal-mobile-home";home.textContent="포털 홈";document.querySelector(".menu-toggle")?.before(home);
 }
 if(page==="docs"){
  const controls=document.querySelector("#list-controls"),input=document.querySelector("#local-query"),label=document.querySelector('label[for="local-query"]');
  controls?.prepend(label,input);
  const guide=document.querySelector("#doc-flow-guide");if(guide)guide.hidden=!!docs.find(doc=>doc.id===id);
 }
 const job=page==="jobs"?jobs.find(j=>j.id===id):null;
 if(job){
  document.querySelector(".page-hero").hidden=true;
  const panel=document.querySelector("#detail .detail-panel"),summary=document.createElement("section");
  detailHeading(panel);
  summary.className="ux-at-glance";summary.setAttribute("aria-label","직무 한눈에 보기");
  const certs=certifications.filter(c=>job.certifications.includes(c.id));
  summary.innerHTML='<h3>한눈에 보기</h3><h4>핵심 기술</h4><div class="doc-related">'+job.essentialSkills.slice(0,4).map(skill=>{const doc=findDocForSkill(skill);return doc?link("docs.html?id="+doc.id,skill):'<span>'+esc(skill)+'</span>';}).join('')+'</div><h4>추천 준비</h4><div class="doc-related">'+certs.map(c=>link("certifications.html?id="+c.id,c.name)).join('')+'</div><h4>대표 프로젝트</h4><p>'+esc(job.projectIdeas[0].title)+'</p>';
  panel.querySelector(".job-jump").before(summary);
  disclosure(panel.querySelector(".job-two-column"),"주요 업무 · 핵심 기술 · 채용 키워드");
  for(const section of [...panel.querySelectorAll(":scope > .job-section")])disclosure(section,section.querySelector("h3").textContent);
 }
 if(page==="jobs"&&!job)disclosure(document.querySelector("#job-comparisons"),"직무 간 차이 이해하기");
 if(page==="certifications"){
  disclosure(document.querySelector(".cert-paths"),"진로별 자격증 선택 안내");
  const cert=certifications.find(c=>c.id===id),panel=document.querySelector(".cert-detail");
  if(cert&&panel){
   detailHeading(panel);
   document.querySelector(".page-hero").hidden=true;
   const relatedDocs=docs.filter(doc=>[doc.name,doc.english,...(doc.skillNames||[])].some(name=>[...cert.fields,...cert.tags,cert.education].some(field=>String(field).toLowerCase().includes(name.toLowerCase()))));
   const relatedJobs=jobs.filter(job=>job.certifications.includes(cert.id));
   const next=document.createElement("section");next.className="ux-at-glance";
   next.innerHTML='<h3>바로 학습하기</h3><div class="doc-related">'+(['engineer','industrial'].includes(cert.id)?link("practical.html?exam="+(cert.id==="engineer"?"engineer":"industrial_engineer"),"실기 문제 연습"):'')+relatedDocs.slice(0,4).map(d=>link("docs.html?id="+d.id,d.name)).join('')+link("interview.html","기술면접 연습")+link("jobs.html","관련 직무 탐색")+'</div>';
   panel.querySelector(".cert-importance").before(next);
   const pathways=document.createElement('div');pathways.className='doc-related';pathways.innerHTML=relatedJobs.slice(0,3).map(job=>link('jobs.html?id='+job.id,job.name)).join('');next.append(pathways);
   for(const section of [...panel.querySelectorAll(":scope > .job-section")])disclosure(section,section.querySelector("h3").textContent);
   disclosure(panel.querySelector(".cert-preparation"),"학과 권장 취득 시기와 준비 계획");
  }
 }
 for(const node of document.querySelectorAll(".checklist-card"))disclosure(node,node.querySelector("h2").textContent);
 if(document.body.hasAttribute("data-guide-page"))disclosure(document.querySelector(".principle"),"기술보다 문제에서 시작하는 이유");
 // Opening a deep section also opens its ancestor disclosure.
 window.addEventListener("hashchange",revealHash);
 document.addEventListener("click",event=>{const a=event.target.closest('a[href^="#"]');if(a)requestAnimationFrame(revealHash);});
 if(location.hash)requestAnimationFrame(revealHash);
}
