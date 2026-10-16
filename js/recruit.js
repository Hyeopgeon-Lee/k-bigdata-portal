const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

const todayKst = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0,10);
const isOpen = job => job.active !== false && (job.deadlineType !== "DATE" || !job.deadline || job.deadline >= todayKst);
const jobs = (window.K_BIGDATA_RECRUITMENTS || []).filter(isOpen);
const isUnverified = job => job.verification === "DETAILS_UNVERIFIED";
const linkedJobId = new URLSearchParams(window.location.search).get("job");

// Share a portal deep link, allowing the recipient to view the exact posting.
function jobShareUrl(job){
  const url = new URL("recruit.html", window.location.href);
  url.searchParams.set("job", job.id);
  return url.toString();
}

async function shareJob(job, status){
  const url = jobShareUrl(job);
  const data = {
    title: job.company + " 채용공고",
    text: job.title || job.position || "학과 추천 채용공고",
    url
  };
  if(navigator.share){
    try {
      await navigator.share(data);
      if(status) status.textContent = "공유했습니다.";
      return;
    } catch(error) {
      if(error?.name === "AbortError") return;
      // Fall back to link copying when the share API is unavailable.
    }
  }
  try {
    if(navigator.clipboard?.writeText){
      await navigator.clipboard.writeText(url);
    } else {
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      try {
        field.select();
        if(!document.execCommand("copy")) throw new Error("복사 실패");
      } finally {
        field.remove();
      }
    }
    if(status) status.textContent = "공유 링크를 복사했습니다.";
  } catch(error) {
    if(typeof window.prompt === "function"){
      window.prompt("아래 링크를 복사해 공유하세요.", url);
    }
    if(status) status.textContent = "자동 복사할 수 없어 공유 링크를 표시했습니다.";
  }
}

function focusLinkedJob(){
  if(!linkedJobId) return;
  const card = document.getElementById("recruit-" + linkedJobId);
  if(!card) {
    const notice = $("#recruit-link-notice");
    if(notice) notice.textContent = "공유받은 채용공고는 마감되었거나 목록에서 제외되었습니다.";
    return;
  }
  card.classList.add("recruit-card-shared");
  card.focus({preventScroll:true});
  card.scrollIntoView({block:"center", behavior:"auto"});
}
let currentSite = "전체";
const filterState={role:"전체",region:"전체",deadline:"all",sort:"deadline"};
const todayUtc=Date.parse(todayKst+"T00:00:00+09:00");
const daysUntil=job=>job.deadlineType==="DATE"&&job.deadline
  ?Math.round((Date.parse(job.deadline+"T00:00:00+09:00")-todayUtc)/86400000):null;
const daysSinceAdded=job=>job.addedAt
  ?Math.round((todayUtc-Date.parse(job.addedAt+"T00:00:00+09:00"))/86400000):null;
const isNew=job=>{const n=daysSinceAdded(job);return n!==null&&n>=0&&n<=7;};
const isSoon=job=>{const n=daysUntil(job);return n!==null&&n>=0&&n<=7;};
function roleOf(job){
 const role=(job.position||job.title||"").toLowerCase();
 if(!role) return "직무 미표기";
 if(/dba|데이터|빅데이터|분석|인공지능|ai |ai개발|머신러닝|딥러닝|ml |llm/.test(role)) return "데이터 · AI";
 if(/보안|security|정보보호/.test(role)) return "보안";
 if(/qa|qc|테스트|품질/.test(role)) return "QA · 테스트";
 if(/클라우드|시스템|서버|인프라|devops|데브옵스|sre|네트워크|관제|운영|기술지원/.test(role)) return "시스템 · 클라우드";
 if(/개발|프로그래|소프트웨어|software|엔지니어|프론트|백엔드|frontend|backend|웹 |web |flutter|react|spring|java/.test(role)) return "소프트웨어 개발";
 return "기타 직무";
}
function regionOf(job){
 const place=(job.location||"").trim();
 if(!place) return "지역 미표기";
 if(/서울/.test(place)) return "서울";
 if(/인천/.test(place)) return "인천";
 if(/경기|수원|성남|고양|부천|과천|화성|용인|안양|광명|의정부|파주/.test(place)) return "경기";
 return "기타 지역";
}
function deadlineMatches(job){
 switch(filterState.deadline){
  case "soon":return isSoon(job);
  case "new":return isNew(job);
  case "until":return job.deadlineType==="UNTIL_FILLED";
  case "unknown":return job.deadlineType!=="UNTIL_FILLED"&&daysUntil(job)===null;
  default:return true;
 }
}
function compareJobs(a,b){
 if(filterState.sort==="company")return a.company.localeCompare(b.company,"ko");
 if(filterState.sort==="recent")return (b.addedAt||"").localeCompare(a.addedAt||"")||a.company.localeCompare(b.company,"ko");
 const da=daysUntil(a),db=daysUntil(b);
 return (da===null?Number.MAX_SAFE_INTEGER:da)-(db===null?Number.MAX_SAFE_INTEGER:db)
  ||a.company.localeCompare(b.company,"ko");
}

document.addEventListener("DOMContentLoaded", () => {
  renderSummary();
  renderFilters();
  $("#recruit-query")?.addEventListener("input",renderJobs);
  for(const [id,key] of [["#recruit-role-filter","role"],["#recruit-region-filter","region"],["#recruit-deadline-filter","deadline"],["#recruit-sort","sort"]]){
    $(id)?.addEventListener("change",e=>{filterState[key]=e.target.value;renderJobs();});
  }
  $("#recruit-reset")?.addEventListener("click",()=>{
    currentSite="전체";
    Object.assign(filterState,{role:"전체",region:"전체",deadline:"all",sort:"deadline"});
    $("#recruit-query").value="";
    for(const [id,key] of [["#recruit-role-filter","role"],["#recruit-region-filter","region"],["#recruit-deadline-filter","deadline"],["#recruit-sort","sort"]])$(id).value=filterState[key];
    $("#site-filters")?.querySelectorAll("[data-site]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.site==="전체")));
    renderJobs();
  });
  $("#recruit-list")?.addEventListener("click", async event => {
    const button = event.target.closest("button[data-share-job]");
    if(!button) return;
    const job = jobs.find(item => item.id === button.dataset.shareJob);
    if(!job) return;
    await shareJob(job, button.closest(".recruit-card")?.querySelector(".recruit-share-status"));
  });
  renderJobs();
  focusLinkedJob();
});

function renderSummary(){
  const meta = window.K_BIGDATA_RECRUITMENTS_META || {};
  const pendingCount = jobs.filter(isUnverified).length;
  const count = jobs.length - pendingCount;
  const countEl = $("#recruit-count");
  const updatedEl = $("#recruit-updated");
  if(countEl) countEl.textContent = count + "건";
  if(updatedEl) updatedEl.textContent = (meta.updatedAt ? "업데이트 " + meta.updatedAt : "") + (pendingCount ? " · 상세 확인 필요 " + pendingCount + "건" : "");
}

function renderFilters(){
 const root=$("#site-filters");
 if(!root)return;
 const sites=["전체",...new Set(jobs.map(job=>job.site).filter(Boolean))];
 root.innerHTML=sites.map(site=>'<button type="button" data-site="'+esc(site)+'" aria-pressed="'+String(site===currentSite)+'">'+esc(site)+'</button>').join("");
 root.addEventListener("click",event=>{
  const button=event.target.closest("button[data-site]");
  if(!button)return;
  currentSite=button.dataset.site;
  root.querySelectorAll("button").forEach(item=>item.setAttribute("aria-pressed",String(item===button)));
  renderJobs();
 });
 for(const [selector,items,placeholder] of [
  ["#recruit-role-filter",[...new Set(jobs.map(roleOf))].sort((a,b)=>a.localeCompare(b,"ko")),"전체 직무"],
  ["#recruit-region-filter",[...new Set(jobs.map(regionOf))].sort((a,b)=>a.localeCompare(b,"ko")),"전체 지역"]
 ]){
  const select=$(selector);
  if(select)select.innerHTML='<option value="전체">'+placeholder+'</option>'+items.map(item=>'<option value="'+esc(item)+'">'+esc(item)+'</option>').join("");
 }
}

function renderJobs(){
  const root = $("#recruit-list");
  const status = $("#recruit-status");
  if(!root) return;
  const query = ($("#recruit-query")?.value || "").trim().toLocaleLowerCase("ko-KR");
  const filtered = jobs
    .filter(job=>currentSite==="전체"||job.site===currentSite)
    .filter(job=>filterState.role==="전체"||roleOf(job)===filterState.role)
    .filter(job=>filterState.region==="전체"||regionOf(job)===filterState.region)
    .filter(deadlineMatches)
    .filter(job=>!query||[job.company,job.site,job.title,job.position,job.location].filter(Boolean).join(" ").toLocaleLowerCase("ko-KR").includes(query))
    .sort(compareJobs);
  if(status) status.textContent = "검색 결과 "+filtered.length+"건 · 전체 채용중 "+jobs.length+"건";
  if(!filtered.length){
    root.innerHTML = '<p class="recruit-empty">조건에 맞는 채용공고가 없습니다.</p>';
    return;
  }
  root.innerHTML = filtered.map(job => {
    const applyUrl = "https://apply.k-bigdata.kr/register.html?job=" + encodeURIComponent(job.id);
    return '<article class="recruit-card" id="recruit-'+esc(job.id)+'" tabindex="-1">'+
      '<div class="recruit-card-head"><div class="recruit-status-badges"><span class="badge ' + (isUnverified(job) ? 'recruit-pending">정보 확인 필요' : 'recruit-open">채용중') + '</span>'+(isSoon(job)?'<span class="badge recruit-soon">마감 임박</span>':'')+(isNew(job)?'<span class="badge recruit-new">NEW</span>':'')+'</div><span class="recruit-site">'+esc(job.site)+'</span></div>'+
      '<h2>'+esc(job.company)+'</h2>'+
      (job.title ? '<p class="recruit-title">'+esc(job.title)+'</p>' : '')+
      '<p class="recruit-deadline">'+esc(deadlineText(job))+'</p>'+
      (job.position ? '<p class="recruit-meta"><strong>직종</strong> '+esc(job.position)+'</p>' : '')+
      (job.location ? '<p class="recruit-meta"><strong>근무지</strong> '+esc(job.location)+'</p>' : '')+
      (job.salary ? '<p class="recruit-meta"><strong>급여</strong> '+esc(job.salary)+'</p>' : '')+
      (!job.title && !job.position ? '<p>'+(isUnverified(job) ? '기업명·모집요건·마감일을 채용공고 원문에서 확인하세요.' : '지원직무와 상세 모집요건은 실제 채용공고에서 확인하세요.')+'</p>' : '')+
      '<div class="recruit-actions">'+
        '<a class="button button-secondary" href="'+esc(job.url)+'" target="_blank" rel="noopener noreferrer">채용공고 보기 ↗</a>'+
        '<a class="button button-primary" href="'+esc(isUnverified(job) ? "https://apply.k-bigdata.kr/register.html" : applyUrl)+'">'+(isUnverified(job) ? "공고 확인 후 등록 →" : "지원현황 등록 →")+'</a>'+
        '<button type="button" class="button button-secondary recruit-share-button" data-share-job="'+esc(job.id)+'" aria-label="'+esc(job.company+' '+(job.title || job.position || '채용공고')+' 공유하기')+'">↗ 공고 공유하기</button>'+
        '<span class="recruit-share-status" role="status" aria-live="polite"></span>'+
      '</div>'+
    '</article>';
  }).join("");
}


function deadlineText(job){
  if(job.deadlineType === "UNTIL_FILLED") return "채용시 마감";
  if(job.deadlineType === "DATE" && job.deadline){
    const [y,m,d] = job.deadline.split("-");
    const diff = Math.round((Date.parse(job.deadline+"T00:00:00+09:00") - Date.parse(todayKst+"T00:00:00+09:00")) / 86400000);
    const dday = diff >= 0 ? " · D-" + diff : "";
    return "마감 " + y + "." + m + "." + d + dday;
  }
  return "마감일 확인 필요";
}
