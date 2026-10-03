import {certifications} from "./certifications.js";
import {jobs,jobComparisons,jobGuidance} from "./jobs.js";
import {docs,docCategories,docFlows,findDocForSkill} from "./docs.js";
import {questions} from "./interview.js";
import {matches,searchIndex,jobSearchText,docSearchText} from "./search.js";
const esc=v=>String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const list=items=>"<ul>"+items.map(v=>"<li>"+esc(v)+"</li>").join("")+"</ul>";
const tags=items=>'<div class="tags">'+items.map(v=>"<span>"+esc(v)+"</span>").join("")+"</div>";
const icon='<span class="resource-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6l2 2 2-2h6v16h-6l-2 2-2-2H4ZM12 6v16M7 9h2M15 9h2M7 13h2M15 13h2"/></svg></span>';
document.querySelectorAll("#current-year").forEach(el=>el.textContent=new Date().getFullYear());
const toggle=document.querySelector(".menu-toggle"),nav=document.querySelector("#portal-nav");
function closeMenu(){nav?.classList.remove("is-open");toggle?.setAttribute("aria-expanded","false");}
toggle?.addEventListener("click",()=>{const open=toggle.getAttribute("aria-expanded")!=="true";toggle.setAttribute("aria-expanded",String(open));nav.classList.toggle("is-open",open);});
nav?.addEventListener("click",e=>{if(e.target.closest("a"))closeMenu();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&toggle?.getAttribute("aria-expanded")==="true"){closeMenu();toggle.focus();}});
document.addEventListener("click",e=>{if(!e.target.closest(".site-header"))closeMenu();});
const portalQuery=document.querySelector("#portal-query");
portalQuery?.addEventListener("input",()=>{
const query=portalQuery.value.trim(),results=query?searchIndex.filter(item=>matches(item.text,query)):[];
document.querySelector("#search-status").textContent=query?results.length+"개 결과":"한글·영문 키워드로 검색하세요.";
document.querySelector("#search-results").innerHTML=results.map(r=>'<li><a href="'+esc(r.url)+'">'+esc(r.title)+'<small>'+esc(r.type)+'</small></a></li>').join("");
});


const docLink = doc => '<a href="docs.html?id='+esc(doc.id)+'">'+esc(doc.name)+'</a>';
const skillTags = values => '<div class="tags doc-related">'+values.map(value=>{const doc=findDocForSkill(value);return doc?'<a href="docs.html?id='+esc(doc.id)+'">'+esc(value)+'<span class="sr-only"> 공식문서 학습 안내</span></a>':'<span>'+esc(value)+'</span>';}).join("")+'</div>';
const relatedDocs = item => '<div class="doc-related">'+item.related.map(name=>{const doc=findDocForSkill(name);return doc?docLink(doc):'<span>'+esc(name)+'</span>';}).join("")+'</div>';
const officialLink = item => '<a class="button button-primary doc-official" href="'+esc(item.url)+'" target="_blank" rel="noopener noreferrer">공식문서 열기 ↗<span class="sr-only"> · '+esc(item.name)+' 외부 사이트, 새 창</span></a>';
function renderDocCard(item){
 const group=docCategories.find(c=>c.name===item.category);
 return '<article class="resource-card doc-card"><span class="resource-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+esc(group.icon)+'"/></svg></span><p><span class="badge">'+esc(item.category)+'</span></p><h2>'+esc(item.name)+'</h2>'+(item.subcategory?'<p class="doc-subcategory">'+esc(item.subcategory)+'</p>':'')+'<p>'+esc(item.overview)+'</p>'+tags(item.tags.slice(0,5))+'<div class="doc-card-related"><h3>연관 기술</h3>'+relatedDocs({...item,related:item.related.slice(0,3)})+'</div><div class="doc-card-actions"><a class="doc-detail-link" href="docs.html?id='+esc(item.id)+'">학습·활용 보기 →<span class="sr-only"> · '+esc(item.name)+'</span></a>'+officialLink(item)+'</div></article>';
}
function renderDocDetail(item){
 const roles=item.jobIds.map(id=>jobs.find(j=>j.id===id)).filter(Boolean);
 const categories=item.interviewCategories.filter(category=>questions.some(q=>q.category===category));
 return '<p>'+esc(item.description)+'</p>'+(item.note?'<aside class="notice"><h3>학습 전에 확인하세요</h3><p>'+esc(item.note)+'</p></aside>':'')+'<div class="doc-detail-grid"><section class="job-info-card"><h3>무엇을 공부하나요?</h3>'+list(item.learn)+'</section><section class="job-info-card"><h3>프로젝트에서 어떻게 활용하나요?</h3>'+list(item.useCases)+'</section></div><section class="job-section"><h3>함께 배우는 연관 기술</h3>'+relatedDocs(item)+'</section><section class="job-section"><h3>연결되는 IT 직무</h3><div class="job-topic-links">'+roles.map(role=>'<a href="jobs.html?id='+esc(role.id)+'">'+esc(role.name)+' →</a>').join("")+'</div></section>'+(categories.length?'<section class="job-section"><h3>관련 기술면접 학습</h3><div class="job-topic-links">'+categories.map(category=>'<a href="interview.html?category='+esc(encodeURIComponent(category))+'">'+esc(category)+' 문제 →</a>').join("")+'</div><p class="hint">현재 문제은행의 관련 기초 분야입니다. 이 기술의 모든 개념을 다루지는 않습니다.</p></section>':'')+(item.category.startsWith("Open API")?'<aside class="notice"><h3>API 사용 전 체크</h3><p>앱 등록·API Key·호출 한도·요금·이용 약관을 확인하세요. 서버용 Secret은 HTML이나 GitHub 공개 저장소에 넣지 않습니다. 위치·개인정보는 동의와 최소 수집 원칙을 적용하세요. 이 포털은 API를 호출하거나 가입·결제를 대신하지 않습니다.</p></aside>':'')+'<p class="hint">공식문서의 버전과 프로젝트 버전을 맞춰 읽으세요. 링크는 공식 제공자 사이트이며 외부 사이트의 정책·내용은 변경될 수 있습니다.</p><div class="detail-actions">'+officialLink(item)+'<a class="button button-secondary" href="project-guide.html">프로젝트 제작 가이드</a></div>';
}

function renderJobDetail(job) {
  const section = (title, body, id) => '<section class="job-section"'+(id?' id="'+esc(id)+'"':"")+'><h3>'+esc(title)+'</h3>'+body+'</section>';
  const certs = job.certifications.map(id => certifications.find(c => c.id === id)).filter(Boolean);
  const interviewLinks = job.interviewCategories.filter(category => questions.some(q => q.category === category));
  const related = job.relatedRoles.map(role => '<li>'+(role.id?'<a href="jobs.html?id='+esc(role.id)+'">'+esc(role.name)+'</a>':'<strong>'+esc(role.name)+'</strong>')+'<p>'+esc(role.description)+'</p></li>').join("");
  const checklist = '<ul class="job-checklist">'+job.readinessChecklist.map((text,i)=>'<li><label><input type="checkbox" id="ready-'+esc(job.id)+'-'+i+'"><span>'+esc(text)+'</span></label></li>').join("")+'</ul>';
  const projectCards = '<div class="job-projects">'+job.projectIdeas.map(project=>'<article class="job-info-card"><h4>'+esc(project.title)+'</h4><p>'+esc(project.description)+'</p></article>').join("")+'</div>';
  const skillsCard=(title,values)=>'<section class="job-info-card"><h3>'+esc(title)+'</h3>'+skillTags(values)+'</section>';
  return '<nav class="job-jump" aria-label="직무 상세 빠른 이동"><a href="#job-study">학습 순서</a><a href="#job-projects">프로젝트</a><a href="#job-portfolio">포트폴리오</a><a href="#job-readiness">신입 준비</a><a href="#job-interview">면접</a></nav>'+
    section("이 직무는 어떤 일을 하나요?",'<p>'+esc(job.description)+'</p>')+
    '<div class="job-two-column"><section class="job-info-card"><h3>주요 업무</h3>'+list(job.tasks)+'</section>'+skillsCard("필수 기술",job.essentialSkills)+skillsCard("추가로 배우면 좋은 기술",job.plusSkills)+skillsCard("채용공고에서 찾아볼 키워드",job.recruitmentKeywords)+'</div><p class="hint">'+esc(jobGuidance.skills)+'</p>'+
    section("학과 교육과의 연결",'<p>'+esc(job.education)+'</p>')+
    section("어떤 기술부터 공부할까요?",'<ol>'+job.studyOrder.map(step=>'<li>'+esc(step)+'</li>').join("")+'</ol>',"job-study")+
    section("추천 프로젝트",projectCards,"job-projects")+
    section("포트폴리오에서 보여줘야 할 것",list(job.portfolio),"job-portfolio")+
    section("신입 준비 체크리스트",'<p class="hint">'+esc(jobGuidance.readiness)+' 체크 상태는 저장하거나 전송하지 않습니다.</p>'+checklist,"job-readiness")+
    section("기술면접 준비",list(job.interviewTopics)+'<div class="job-topic-links">'+interviewLinks.map(category=>'<a href="interview.html?category='+esc(encodeURIComponent(category))+'">'+esc(category)+' 문제 →</a>').join("")+'</div><p class="hint">'+esc(jobGuidance.interview)+'</p><a class="back-link" href="docs.html">개발 공식문서 살펴보기 →</a>',"job-interview")+
    section("관련 IT 자격증",'<ul>'+certs.map(c=>'<li><a href="certifications.html?id='+esc(c.id)+'">'+esc(c.name)+'</a></li>').join("")+'</ul>')+
    section("연관 직무",'<ul class="job-related">'+related+'</ul>')+
    '<div class="detail-actions"><a class="button button-primary" href="https://portfolio.k-bigdata.kr/">학과 프로젝트 보기 ↗</a><a class="button button-secondary" href="https://ready.k-bigdata.kr/">취업 준비 점검 ↗</a><a class="button button-secondary" href="project-guide.html">프로젝트 제작 가이드</a><a class="button button-secondary" href="interview.html">기술면접 학습</a></div>';
}

const page=document.body.dataset.page;
if(page){
const data={certifications,jobs,docs,interview:questions}[page];
const params=new URLSearchParams(location.search),id=params.get("id");
const selected=data.find(item=>item.id===id);
const flowRoot=document.querySelector("#doc-flows");
if(flowRoot){flowRoot.hidden=!!selected;flowRoot.innerHTML=docFlows.map(flow=>'<details class="doc-flow"><summary>'+esc(flow.title)+'</summary><p>'+esc(flow.description)+'</p><div class="doc-related">'+flow.steps.map(id=>docLink(docs.find(doc=>doc.id===id))).join("")+'</div></details>').join("");}
if(page==="jobs"){
  const comparisonRoot=document.querySelector("#job-comparisons");
  comparisonRoot.hidden=!!selected;
  comparisonRoot.innerHTML='<h2>직무의 차이를 이해하고 선택하세요</h2><div class="job-comparison-grid">'+jobComparisons.map(item=>'<article class="job-info-card"><h3>'+esc(item.title)+'</h3><p>'+esc(item.description)+'</p><div class="job-topic-links">'+item.roles.map(id=>{const role=jobs.find(j=>j.id===id);return '<a href="jobs.html?id='+esc(id)+'">'+esc(role.name)+' →</a>';}).join("")+'</div></article>').join("")+'</div>';
}
const root=document.querySelector("#items"),detail=document.querySelector("#detail"),controls=document.querySelector("#list-controls");
const certLink=id=>{const c=certifications.find(c=>c.id===id);return c?'<li><a href="certifications.html?id='+esc(id)+'">'+esc(c.name)+'</a></li>':"";};
if(selected&&(page==="certifications"||page==="jobs"||page==="docs")){
controls.hidden=true;root.hidden=true;
detail.innerHTML='<article class="detail-panel"><a class="back-link" href="'+page+'.html">← 전체 목록</a><p><span class="badge">'+esc(selected.category)+'</span></p><h2 tabindex="-1">'+esc(selected.name)+'</h2><p>'+esc(selected.english)+'</p><p>'+esc(selected.overview)+'</p>'+tags(selected.tags)+(page==="certifications"?
'<h3>시행기관</h3><p>'+esc(selected.institution)+'</p>'+(selected.note?'<div class="notice"><strong>학과 안내 명칭과 현재 시행기관 안내</strong><p>'+esc(selected.note)+'</p></div>':"")+'<div class="detail-columns"><section><h3>관련 IT 직무</h3>'+list(selected.roles)+'</section><section><h3>주요 학습 분야</h3>'+list(selected.fields)+'</section></div><h3>학과 교육과의 연계</h3><p>'+esc(selected.education)+'</p><p class="hint">교육 연계는 학습 분야 안내이며 응시 자격이나 시험 면제를 의미하지 않습니다. 일정·요건·시험 범위는 시행기관에서 확인하세요.</p><div class="detail-actions"><a class="button button-primary" href="'+esc(selected.url)+'">공식 사이트에서 자세히 보기 ↗</a><a class="button button-secondary" href="jobs.html">IT 직무 살펴보기</a></div>':
(page==="docs"?renderDocDetail(selected):renderJobDetail(selected)))+'</article>';
}else{
if(id){detail.innerHTML='<p class="notice" role="status">요청한 항목을 찾을 수 없습니다. 전체 목록에서 선택하세요.</p>';}
const cats=page==="docs"?docCategories.map(c=>c.name):[...new Set(data.map(item=>item.category))];
let active=cats.includes(params.get("category"))?params.get("category"):"전체",query="",random=null;
const filters=document.querySelector("#filters"),input=document.querySelector("#local-query");
function pool(){return data.filter(item=>(active==="전체"||item.category===active)&&matches(page==="jobs"?jobSearchText(item):page==="docs"?docSearchText(item):[item.name,item.english,item.overview,item.question,item.answer,item.category,...(item.tags||[]),...(item.keywords||[])].join(" "),query));}
function card(item){if(page==="docs")return renderDocCard(item);return '<article class="resource-card">'+icon+'<p><span class="badge">'+esc(item.category)+'</span></p><h2>'+esc(item.name)+'</h2>'+(item.english?'<p class="english">'+esc(item.english)+'</p>':"")+'<p>'+esc(item.overview)+'</p>'+tags(item.tags||[])+'<a class="card-link" href="'+esc(page==="docs"?item.url:page+".html?id="+item.id)+'">'+(page==="docs"?"공식문서 열기 ↗":"자세히 보기 →")+'<span class="sr-only"> · '+esc(item.name)+'</span></a></article>';}
function question(item){return '<article class="question"><span class="badge">'+esc(item.category)+'</span> <span class="badge">'+esc(item.difficulty)+'</span><h2>'+esc(item.question)+'</h2><details><summary>답변 보기 / 접기</summary><p>'+esc(item.answer)+'</p><h3>핵심 키워드</h3>'+tags(item.keywords)+'<h3>추가 설명</h3><p>'+esc(item.extra)+'</p></details></article>';}
function render(){const scroll=filters.scrollLeft;const available=pool(),items=random||available;filters.innerHTML=["전체",...cats].map(c=>'<button type="button" data-category="'+esc(c)+'" aria-pressed="'+String(c===active)+'">'+esc(page==="docs"?(docCategories.find(group=>group.name===c)?.label||c):c)+'</button>').join("");filters.scrollLeft=scroll;root.innerHTML=items.map(page==="interview"?question:card).join("");document.querySelector("#list-status").textContent=items.length?items.length+"개 "+(random?"랜덤 문제 (필터 결과 "+available.length+"개)":"항목"):"검색 결과가 없습니다."; }
filters.addEventListener("click",e=>{const button=e.target.closest("button");if(!button)return;active=button.dataset.category;random=null;render();[...filters.querySelectorAll("button")].find(b=>b.dataset.category===active)?.focus();});
input.addEventListener("input",()=>{query=input.value;random=null;render();});
function pick(count){const items=[...pool()];for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}random=items.slice(0,count);render();}
document.querySelector("#random-one")?.addEventListener("click",()=>pick(1));
document.querySelector("#random-ten")?.addEventListener("click",()=>pick(10));
document.querySelector("#show-all")?.addEventListener("click",()=>{random=null;render();});
render();
}
}
