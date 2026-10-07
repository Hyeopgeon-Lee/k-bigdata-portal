const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

const jobs = (window.K_BIGDATA_RECRUITMENTS || []).filter(job => job.active !== false);
let currentSite = "전체";

document.addEventListener("DOMContentLoaded", () => {
  renderSummary();
  renderFilters();
  $("#recruit-query")?.addEventListener("input", renderJobs);
  renderJobs();
});

function renderSummary(){
  const meta = window.K_BIGDATA_RECRUITMENTS_META || {};
  const count = jobs.length;
  const countEl = $("#recruit-count");
  const updatedEl = $("#recruit-updated");
  if(countEl) countEl.textContent = count + "건";
  if(updatedEl) updatedEl.textContent = meta.updatedAt ? "업데이트 " + meta.updatedAt : "";
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
    .filter(job => !query || (job.company + " " + job.site).toLocaleLowerCase("ko-KR").includes(query))
    .sort((a,b) => a.company.localeCompare(b.company, "ko"));
  if(status) status.textContent = filtered.length + "건의 채용공고";
  if(!filtered.length){
    root.innerHTML = '<p class="recruit-empty">조건에 맞는 채용공고가 없습니다.</p>';
    return;
  }
  root.innerHTML = filtered.map(job => {
    const applyUrl = "https://apply.k-bigdata.kr/register.html?job=" + encodeURIComponent(job.id);
    return '<article class="recruit-card">'+
      '<div class="recruit-card-head"><span class="badge recruit-open">채용중</span><span class="recruit-site">'+esc(job.site)+'</span></div>'+
      '<h2>'+esc(job.company)+'</h2>'+
      '<p>지원직무와 상세 모집요건은 실제 채용공고에서 확인하세요.</p>'+
      '<div class="recruit-actions">'+
        '<a class="button button-secondary" href="'+esc(job.url)+'" target="_blank" rel="noopener noreferrer">채용공고 보기 ↗</a>'+
        '<a class="button button-primary" href="'+esc(applyUrl)+'">지원현황 등록 →</a>'+
      '</div>'+
    '</article>';
  }).join("");
}
