const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

const todayKst = new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
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

document.addEventListener("DOMContentLoaded", () => {
  renderSummary();
  renderFilters();
  $("#recruit-query")?.addEventListener("input", renderJobs);
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
  const root = $("#site-filters");
  if(!root) return;
  const sites = ["전체", ...new Set(jobs.map(job => job.site).filter(Boolean))];
  root.innerHTML = sites.map(site => '<button type="button" data-site="'+esc(site)+'" aria-pressed="'+String(site === currentSite)+'">'+esc(site)+'</button>').join("");
  root.addEventListener("click", event => {
    const button = event.target.closest("button[data-site]");
    if(!button) return;
    currentSite = button.dataset.site;
    root.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    renderJobs();
  });
}

function renderJobs(){
  const root = $("#recruit-list");
  const status = $("#recruit-status");
  if(!root) return;
  const query = ($("#recruit-query")?.value || "").trim().toLocaleLowerCase("ko-KR");
  const filtered = jobs
    .filter(job => currentSite === "전체" || job.site === currentSite)
    .filter(job => !query || [job.company, job.site, job.title, job.position, job.location].filter(Boolean).join(" ").toLocaleLowerCase("ko-KR").includes(query))
    .sort((a,b) => a.company.localeCompare(b.company, "ko"));
  if(status) status.textContent = filtered.length + "건의 채용공고";
  if(!filtered.length){
    root.innerHTML = '<p class="recruit-empty">조건에 맞는 채용공고가 없습니다.</p>';
    return;
  }
  root.innerHTML = filtered.map(job => {
    const applyUrl = "https://apply.k-bigdata.kr/register.html?job=" + encodeURIComponent(job.id);
    return '<article class="recruit-card" id="recruit-'+esc(job.id)+'" tabindex="-1">'+
      '<div class="recruit-card-head"><span class="badge ' + (isUnverified(job) ? 'recruit-pending">정보 확인 필요' : 'recruit-open">채용중') + '</span><span class="recruit-site">'+esc(job.site)+'</span></div>'+
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
