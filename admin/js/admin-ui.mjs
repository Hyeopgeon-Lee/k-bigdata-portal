/* Shared, admin-only UI. Charts are rendered locally from authorized query results;
 * no external chart library, analytics service, or fabricated data. */
const KEY="portal.admin.grade.v1";
const valid=value=>["","1","2"].includes(String(value??""))?String(value??""):"";
export function readGrade(){
 try{return valid(localStorage.getItem(KEY));}catch{return "";}
}
let grade=readGrade();
const listeners=new Set();
const notify=()=>{for(const handler of listeners)handler(grade);};
export function setGrade(value){
 const next=valid(value);if(next===grade)return;
 grade=next;try{localStorage.setItem(KEY,grade);}catch{}
 const url=new URL(location.href);
 if(url.searchParams.has("grade")){url.searchParams.set("grade",grade);history.replaceState(history.state,"",url);}

 for(const button of document.querySelectorAll("[data-admin-grade]"))button.setAttribute("aria-pressed",String(button.dataset.adminGrade===grade));
 notify();
}
export function onGrade(handler){listeners.add(handler);return ()=>listeners.delete(handler);}
export const getGrade=()=>grade;
export const gradeLabel=value=>value?value+"학년":"전체 학년";
const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
const format=n=>Number(n).toLocaleString("ko-KR",{maximumFractionDigits:1});
const normal=value=>value!==null&&value!==undefined&&value!==""&&Number.isFinite(Number(value))&&Number(value)>=0?Number(value):null;
const colors=["#245e9d","#53a5a0","#8196df","#d08b35","#8b6fae","#8798a9"];
function chartPanel(root,title,caption){
 if(!root)return null;
 const section=element("section","admin-chart");
 section.append(element("h3","admin-chart-title",title));if(caption)section.append(element("p","admin-chart-caption",caption));
 root.replaceChildren(section);return section;
}
export function renderBars(root,title,rows,{unit="건",caption="",max=null}={}){
 const panel=chartPanel(root,title,caption);if(!panel)return;
 if(!rows.length){panel.append(element("p","admin-chart-empty","집계된 데이터가 없습니다."));return;}
 const values=rows.map(r=>normal(r[1])),limit=max??Math.max(1,...values.filter(v=>v!==null));
 const list=element("div","admin-chart-bars");
 rows.forEach(([label,value,tone,href],i)=>{
  const count=values[i],row=element(href?"a":"div","admin-chart-row"+(href?" admin-chart-drilldown":"")),head=element("div","admin-chart-label");
  if(href){row.href=href;row.setAttribute("aria-label",label+" 상세 목록 보기");}
  head.append(element("span","",label),element("strong","",count===null?"—":format(count)+unit));
  const track=element("div","admin-chart-track"),bar=element("span","admin-chart-fill");
  track.setAttribute("aria-hidden","true");bar.style.width=(count===null?0:Math.min(100,100*count/Math.max(limit,1)))+"%";
  bar.style.background=tone==="warning"?"#b56b1b":colors[i%colors.length];track.append(bar);
  row.append(head,track);list.append(row);
 });
 panel.append(list);
}
export function renderDonut(root,title,rows,{unit="명",caption=""}={}){
 const panel=chartPanel(root,title,caption);if(!panel)return;
 const counts=rows.map(r=>normal(r[1])),total=counts.reduce((a,b)=>a+(b??0),0);
 if(counts.some(v=>v===null)){panel.append(element("p","admin-chart-empty","일부 집계값을 조회하지 못했습니다."));return;}
 const grid=element("div","admin-donut-layout"),circle=element("div","admin-donut"),center=element("span","admin-donut-center",format(total)+unit);
 circle.setAttribute("aria-hidden","true");let offset=0;
 const stops=counts.flatMap((v,i)=>{const start=offset;offset+=total?100*v/total:0;return [colors[i%colors.length]+" "+start+"%",colors[i%colors.length]+" "+offset+"%"];});
 if(total)circle.style.background="conic-gradient("+stops.join(",")+")";
 circle.append(center);const legend=element("ul","admin-chart-legend");
 rows.forEach(([label],i)=>{const row=element("li"),swatch=element("span","admin-chart-swatch");swatch.style.background=colors[i%colors.length];row.append(swatch,element("span","",label),element("strong","",format(counts[i])+unit));legend.append(row);});
 grid.append(circle,legend);panel.append(grid);
}
export function renderKPIs(root,items){
 if(!root)return;
 const grid=element("div","admin-kpis");
 for(const [label,value,unit="",href] of items){
  const tile=element(href?"a":"article","admin-kpi");if(href)tile.href=href;
  tile.append(element("span","admin-kpi-label",label),element("strong","admin-kpi-value",normal(value)===null?"—":format(value)+unit));
  if(href)tile.append(element("span","admin-kpi-link","상세 보기 →"));
  grid.append(tile);
 }
 root.replaceChildren(grid);
}
export function chartMount(anchor,id,position="afterend"){
 if(!anchor)return null;
 let root=document.getElementById(id);if(root)return root;
 root=element("div","admin-chart-mount");root.id=id;anchor.insertAdjacentElement(position,root);return root;
}
export const matchesGrade=(profile,value)=>!value||String(profile?.academic_year)===value;
export function groupCounts(rows,key){
 const counts=new Map();for(const row of rows){const label=key(row)||"미설정";counts.set(label,(counts.get(label)||0)+1);}
 return [...counts].sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0]),"ko"));
}
export function setupAdminUI(){
 const panel=document.getElementById("admin-secure"),page=document.body.dataset.adminPage;
 const query=new URLSearchParams(location.search);
 if(query.has("grade"))setGrade(query.get("grade"));
 // Keep the existing task destinations; mobile menu is a compact disclosure, not a sideways strip.
 let nav=panel.querySelector('.admin-menu[aria-label="관리자 업무 메뉴"]');
 if(!nav&&page==="index"){
  nav=element("nav","admin-menu");nav.setAttribute("aria-label","관리자 업무 메뉴");
  for(const tile of panel.querySelectorAll("a.admin-tile")){
   const a=element("a","",tile.querySelector("strong")?.textContent||tile.textContent);a.href=tile.getAttribute("href");nav.append(a);
  }
  panel.prepend(nav);
 }
 if(nav){
  const names={"관리자 홈":"관리자 홈","가입 승인 요청":"가입 승인","통합 사용자 관리":"사용자 관리","학급 학습통계":"학습통계","학생 자격증 관리":"자격증 관리","실전 모의고사 생성":"모의고사","프로젝트실 관리":"프로젝트실","학과 요청 관리":"학과 요청","졸업생 네트워크 관리":"졸업생 관리"};
  for(const a of nav.querySelectorAll("a")){const full=a.textContent.trim();if(names[full]){a.setAttribute("aria-label",full);a.textContent=names[full];}}
  nav.id="admin-work-nav";const button=element("button","admin-nav-toggle","관리자 메뉴");
  button.type="button";button.setAttribute("aria-expanded","false");button.setAttribute("aria-controls",nav.id);
  button.onclick=()=>{const open=button.getAttribute("aria-expanded")!=="true";button.setAttribute("aria-expanded",String(open));nav.classList.toggle("admin-nav-open",open);};
  nav.before(button);
 }
 if(["home","index","accounts","learning","certifications","rooms","help"].includes(page)){
  const section=element("section","admin-grade-panel");
  section.setAttribute("aria-label","공통 학년 필터");
  const heading=element("div","admin-grade-heading");heading.append(element("strong","","학년별 조회"),element("span","","다른 관리 화면에서도 선택 유지"));
  const group=element("div","admin-grade-group");group.setAttribute("role","group");group.setAttribute("aria-label","학년 선택");
  for(const [v,label] of [["","전체"],["1","1학년"],["2","2학년"]]){
   const b=element("button","admin-grade-choice",label);b.type="button";b.dataset.adminGrade=v;b.setAttribute("aria-pressed",String(grade===v));b.onclick=()=>setGrade(v);group.append(b);
  }
  section.append(heading,group);
  (nav||panel.firstElementChild)?.insertAdjacentElement(nav?"afterend":"beforebegin",section);
 }
 window.portalAdminUI={getGrade,setGrade,onGrade,gradeLabel,renderBars,renderDonut,renderKPIs,chartMount,groupCounts,matchesGrade};
}
