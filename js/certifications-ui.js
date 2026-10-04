// Pure certificate renderers: content comes only from the explicit certificate model.
const esc = value => String(value ?? "").replace(/[&<>'"]/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[character]));
const array = value => Array.isArray(value) ? value : [];
const hrefId = value => esc(encodeURIComponent(String(value ?? "")));
const safeOfficialURL = value => {
  try { const url = new URL(value); return ["https:","http:"].includes(url.protocol) ? esc(url.href) : ""; }
  catch { return ""; }
};
const coreLabel = item => item.priority === "core" ? (/클라우드|DevOps|cloud/i.test(item.category || "") ? "Cloud·DevOps 핵심" : "취업 준비 핵심") : "";
const badge = item => coreLabel(item) ? '<div class="cert-badges"><span class="badge cert-priority-badge">'+esc(coreLabel(item))+'</span></div>' : "";
const section = (title, body) => '<section class="job-section"><h2>'+esc(title)+'</h2>'+body+'</section>';
const icon = '<span class="resource-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6l2 2 2-2h6v16h-6l-2 2-2-2H4ZM12 6v16M7 9h2M15 9h2M7 13h2M15 13h2"/></svg></span>';

export function renderCertificateCard(item) {
  return '<article class="resource-card cert-card'+(item.priority === "core" ? ' cert-core' : '')+'" data-cert-id="'+esc(item.id)+'">'+icon+'<p><span class="badge">'+esc(item.category)+'</span></p>'+badge(item)+'<h2>'+esc(item.name)+'</h2><p class="cert-institution">'+esc(item.institution)+'</p><p class="cert-overview">'+esc(item.summary)+'</p><a class="card-link" href="certifications.html?id='+hrefId(item.id)+'">상세 보기 →<span class="sr-only"> · '+esc(item.name)+'</span></a></article>';
}

export function renderCertificateDetail(item, jobs = []) {
  const roles = [...new Set(array(item.relatedJobIds))].map(id => array(jobs).find(job => job.id === id)).filter(Boolean).slice(0,4);
  const scope = array(item.examScope).map(group => '<div class="cert-exam-stage">'+(group.stage ? '<h3>'+esc(group.stage)+'</h3>' : '')+'<ul>'+array(group.subjects).map(subject => '<li>'+esc(subject)+'</li>').join('')+'</ul></div>').join('');
  const courses = array(item.departmentCourses);
  const officialURL = safeOfficialURL(item.url);
  const actions = [];
  if (officialURL) actions.push('<a class="button button-primary" href="'+officialURL+'" target="_blank" rel="noopener noreferrer">공식 사이트 ↗<span class="sr-only"> · '+esc(item.name)+' 외부 사이트, 새 창</span></a>');
  if (roles.length) actions.push('<a class="button button-secondary" href="jobs.html?id='+hrefId(roles[0].id)+'">관련 직무 보기</a>');
  if (["engineer","industrial","industrial_engineer"].includes(item.id)) actions.push('<a class="button button-secondary" href="practical.html?exam='+(item.id === "engineer" ? "engineer" : "industrial_engineer")+'">실기 문제 연습</a>');
  return '<article class="detail-panel cert-detail"><a class="back-link" href="certifications.html">← 전체 자격증</a><h1 tabindex="-1">'+esc(item.name)+'</h1>'+(item.english ? '<p class="english">'+esc(item.english)+'</p>' : '')+'<p class="cert-institution"><strong>시행기관</strong> '+esc(item.institution)+'</p>'+badge(item)+section('자격증 소개','<p class="cert-overview">'+esc(item.summary)+'</p>')+section('주요 시험 영역',scope)+(courses.length ? section('학과 교육과의 연결','<div class="tags">'+courses.map(course => '<span>'+esc(course)+'</span>').join('')+'</div>') : '')+(roles.length ? section('관련 IT 직무','<div class="job-topic-links">'+roles.map(role => '<a href="jobs.html?id='+hrefId(role.id)+'">'+esc(role.name)+' →</a>').join('')+'</div>') : '')+(item.recommendedTiming ? section('권장 취득 시기','<p>'+esc(item.recommendedTiming)+'</p>') : '')+(item.note ? '<aside class="notice cert-note"><p>'+esc(item.note)+'</p></aside>' : '')+'<div class="detail-actions">'+actions.join('')+'</div></article>';
}
