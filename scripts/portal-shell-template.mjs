import {groups,navigationItems,officialWebsite,shellVersion} from '../js/portal-navigation-model.mjs';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Explicit focusability gives Safari/WebKit the same Tab order as other engines.
const focusable=html=>html.replace(/<a /g,'<a tabindex="0" ');
export function renderHeader(page){
  return focusable(`<header class="site-header" data-portal-shell="${shellVersion}">
  <div class="container header-inner">
    <a class="brand" href="index.html" aria-label="통합 서비스 포털 홈"><span class="brand-mark" aria-hidden="true"><span></span></span><span class="brand-copy"><strong><span class="brand-full">빅데이터소프트웨어공학과</span><span class="brand-short">빅데이터SW학과</span></strong><small>학생 통합 포털</small></span></a>
    <details class="portal-menu" open>
      <summary class="menu-toggle" aria-controls="portal-nav">메뉴 <span aria-hidden="true">☰</span></summary>
      <nav class="main-nav" id="portal-nav" aria-label="주요 메뉴">
        <a href="services.html"${page.directory?' aria-current="page"':''}>전체 서비스</a>
        ${groups.map(group=>`<a href="services.html#${group.id}" data-portal-group="${group.id}"${(page.group||page.navGroup)===group.id?' aria-current="location"':''}>${esc(group.label)}</a>`).join('\n        ')}
        <a class="nav-external" href="${officialWebsite}">학과 홈페이지 ↗</a>
      </nav>
    </details>
  </div>
</header>`);
}
function serviceLink(item,current){
  const external=/^https?:/.test(item.url);
  return `<a href="${esc(item.url)}" data-nav-id="${item.id}" data-nav-group="${item.group}"${item.id===current?' aria-current="page"':''}${external?' target="_blank" rel="noopener noreferrer"':''}>${esc(item.label)}${external?'<span class="sr-only"> 외부 사이트, 새 창</span>':''}</a>`;
}
export function renderServiceNavigation(page,id){
  if(!page.eyebrow)return '';
  const currentGroup=page.group||page.navGroup;
  const current=groups.find(group=>group.id===currentGroup);
  const ordered=current?[current,...groups.filter(group=>group.id!==currentGroup)]:groups;
  return focusable(`<nav class="container learning-cross-nav portal-service-nav portal-nav-compact" aria-label="현재 영역과 다른 서비스 바로가기" data-learning-nav>
  <div class="portal-nav-current"><strong class="portal-nav-title">${esc(current?.label||page.title)}</strong></div>
  <details class="portal-nav-more"><summary>서비스 메뉴</summary><div class="portal-nav-other">${ordered.map(group=>`<section class="portal-nav-other-group"><strong>${esc(group.label)}</strong><div>${navigationItems.filter(item=>item.group===group.id).map(item=>serviceLink(item,id)).join('')}</div></section>`).join('')}<a href="services.html" class="portal-nav-all">전체 서비스 목록 →</a></div></details>
</nav>`);
}
function renderIntroExtras(id){
  if(id==='interview')return '<p id="interview-stats" class="interview-stats" aria-live="polite"></p>';
  if(id==='project-guide')return '<div class="guide-actions"><a class="button button-primary" href="#process">주제 선정 시작하기 <span aria-hidden="true">↓</span></a><a class="button button-secondary" href="https://portfolio.k-bigdata.kr/">선배 작품 살펴보기 <span aria-hidden="true">↗</span></a></div>';
  if(id==='docs')return '';
  return '';
}
export function renderPageIntro(page,id){
  if(!page.eyebrow)return '';
  const headingId=page.headingId||'portal-intro-title-'+id;
  const title=id==='project-guide'?'기술보다 <em>문제에서 시작하세요</em>':esc(page.title);
  const introId=id==='practical'?' id="study-intro"':'';
  return focusable(`<section${introId} class="container portal-page-intro${page.quiz?' portal-page-intro--quiz':''}" aria-labelledby="${esc(headingId)}">
  <a class="portal-page-back" href="index.html">← 포털 홈</a>
  <p class="portal-page-eyebrow">${esc(page.eyebrow)}</p>
  <h1 id="${esc(headingId)}" class="portal-page-title">${title}</h1>
  <p class="portal-page-description">${esc(page.description)}</p>
  ${renderIntroExtras(id)}
</section>`);
}
export function renderToolbar(page){
  if(!page.toolbar)return '';
  const action=page.toolbar==='coding'?'id="coding-progress-jump"':'data-view="progress"';
  return focusable(`<div class="${page.toolbar==='coding'?'coding-study-header ':''}study-header" aria-label="학습 도구 상단 메뉴"><div class="portal-toolbar-inner"><a href="index.html">← 포털</a><strong>${esc(page.title)}</strong><button type="button" ${action}>학습현황</button></div></div>`);
}
