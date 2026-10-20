// Home-only, read-only recruiting deadline preview.
// Uses the exact dataset already loaded by index.html; no extra network requests.
const root = document.getElementById("home-recruit-alert-list");
const projectRoot=document.getElementById("home-project-alert-list");
const cardTitle=document.getElementById("home-alert-recruit-title");
function updateGrade(){
  const firstGrade=document.body.dataset.homeGrade!=="2";
  if(cardTitle)cardTitle.textContent=firstGrade?"프로젝트 일정":"채용 마감 임박";
  if(root)root.hidden=firstGrade;
  if(projectRoot)projectRoot.hidden=!firstGrade;
}
const MS_PER_DAY = 86400000;
function todayKst(){
  return new Date(Date.now() + 9*3600000).toISOString().slice(0,10);
}
function validDate(value){
  if(typeof value!=="string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const d=new Date(value+"T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10)===value;
}
function daysUntil(date,today){
  return Math.round((Date.parse(date+"T00:00:00Z")-Date.parse(today+"T00:00:00Z"))/MS_PER_DAY);
}
function create(tag,className,content){
  const el=document.createElement(tag);
  if(className)el.className=className;
  if(content!==undefined)el.textContent=content;
  return el;
}
function renderRecruitAlerts(){
  if(!root)return;
  const today=todayKst();
  const jobs=(Array.isArray(window.K_BIGDATA_RECRUITMENTS)?window.K_BIGDATA_RECRUITMENTS:[])
    .filter(job=>job && job.active!==false && job.deadlineType==="DATE" &&
      validDate(job.deadline) && job.deadline>=today &&
      typeof job.id==="string" && /^[A-Za-z0-9_-]{1,90}$/.test(job.id))
    .sort((a,b)=>a.deadline.localeCompare(b.deadline) ||
      String(a.company||"").localeCompare(String(b.company||""),"ko") ||
      a.id.localeCompare(b.id))
    .slice(0,2);
  if(!jobs.length){
    const fallback=create("p","home-alert-empty","현재 마감일이 확인된 진행 중 채용공고가 없습니다.");
    const browse=create("a","home-alert-empty-link","전체 채용공고 보기 →");
    browse.href="recruit.html";
    fallback.append(document.createElement("br"),browse);
    root.replaceChildren(fallback);
    return;
  }
  const list=create("ul","home-recruit-items");
  for(const job of jobs){
    const days=daysUntil(job.deadline,today);
    const li=create("li","home-recruit-item");
    const a=create("a","home-recruit-link");
    a.href="recruit.html?job="+encodeURIComponent(job.id);
    const date=create("span","home-recruit-date");
    date.append(create("span","home-recruit-day",job.deadline.slice(5).replace("-",".")));
    const countdown=create("span","home-recruit-countdown",days===0?"오늘 마감":"D-"+days);
    countdown.dataset.urgency=days<=3?"critical":days<=7?"soon":"normal";
    date.append(countdown);
    const copy=create("span","home-recruit-copy");
    const name=typeof job.company==="string"&&job.company.trim()?job.company.trim():"채용기업";
    copy.append(create("span","home-recruit-company",name));
    copy.append(create("span","home-recruit-position",typeof job.position==="string"&&job.position.trim()?job.position.trim():String(job.title||"모집 직무 확인")));
    copy.append(create("span","home-recruit-meta",job.deadline.replaceAll("-",".")+" 접수 마감 · 학과 등록 기준"));
    a.append(date,copy,create("span","home-recruit-arrow","→"));
    a.setAttribute("aria-label",name+" "+(job.position||job.title||"채용공고")+", "+(days===0?"오늘 마감":"마감 "+days+"일 전")+", 채용 상세 보기");
    li.append(a);
    list.append(li);
  }
  root.replaceChildren(list);
}
updateGrade();
window.addEventListener("kbigdata:home-gradechange",updateGrade);
renderRecruitAlerts();
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible")renderRecruitAlerts();
});
setInterval(()=>{if(document.visibilityState==="visible")renderRecruitAlerts();},600000);
