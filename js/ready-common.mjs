export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const fmt=v=>v?new Date(v).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}):'미점검';
export const tag=v=>'<span class="ready-tag" data-status="'+esc(v)+'">'+esc(v||'미확인')+'</span>';
export const url=v=>{try{const u=new URL(v);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?'<a rel="noopener noreferrer" target="_blank" href="'+esc(u.href)+'">'+esc(u.href)+'</a>':esc(v)}catch{return esc(v||'미등록')}};
export const table=(heads,rows)=>'<div class="ready-scroll"><table class="ready-table" role="table"><thead role="rowgroup"><tr role="row">'+heads.map(x=>'<th scope="col" role="columnheader">'+esc(x)+'</th>').join('')+'</tr></thead><tbody role="rowgroup">'+rows.map(row=>'<tr role="row">'+row.map((x,i)=>'<td role="cell" data-label="'+esc(heads[i]||'')+'"><div class="ready-cell">'+x+'</div></td>').join('')+'</tr>').join('')+'</tbody></table></div>'+(rows.length?'':'<p class="ready-muted">등록된 내역이 없습니다.</p>');
export const cards=items=>'<div class="ready-grid">'+items.map(([label,value])=>'<div class="ready-kpi">'+esc(label)+'<strong>'+esc(value)+'</strong></div>').join('')+'</div>';
export const panel=(title,body)=>'<section class="ready-panel"><h2>'+esc(title)+'</h2>'+body+'</section>';
export const bars=s=>[['준비 우수','excellent'],['준비 양호','good'],['준비 중','preparing'],['관심 필요','attention_count']].map(([label,key])=>'<div class="ready-controls"><span>'+label+' · '+Number(s[key]||0)+'명</span></div><div class="ready-bar"><i style="width:'+Math.min(100,Math.max(0,100*Number(s[key]||0)/Math.max(1,Number(s.total_students||0))))+'%"></i></div>').join('');
const errorMessages={
 STUDENT_REQUIRED:'취업 준비 점검은 재학생 계정으로 이용할 수 있습니다.',
 FORBIDDEN:'이 서비스를 이용할 권한이 없습니다.',
 LOGIN_REQUIRED:'로그인 상태를 다시 확인해 주세요.',
 READ_ONLY:'현재 계정은 조회만 가능합니다.',
 READY_PROFILE_REQUIRED:'내 정보를 먼저 등록해 주세요.',
 NOT_FOUND:'요청한 정보를 찾을 수 없습니다.',
 DATABASE_ERROR:'정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
 CHECK_SAVE_FAILED:'점검 결과를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.',
 REQUEST_FAILED:'요청을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.',
 UNKNOWN_ACTION:'요청을 처리할 수 없습니다. 새로고침 후 다시 시도해 주세요.'
};
export function readyErrorMessage(value){
 const message=String(value||'').trim();
 return Object.hasOwn(errorMessages,message)?errorMessages[message]:/[가-힣]/.test(message)?message:'서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.';
}
function apiError(code){const e=Error(readyErrorMessage(code));e.code=String(code||'REQUEST_FAILED');return e}
export async function api(action,data={}){const {data:res,error}=await window.portalSupabaseClient.functions.invoke('ready-api',{body:{action,...data}});if(error){let m;try{m=(await error.context?.json())?.error}catch{}throw apiError(m||error.message)}if(res?.error)throw apiError(res.error);return res}
export const status=(msg,err=false)=>{const e=document.querySelector('#ready-status');if(e){e.textContent=err?readyErrorMessage(msg):msg;e.dataset.error=String(err);e.hidden=!msg}};
export const issues=e=>'<ul class="ready-checklist">'+(e.issues||[]).map(x=>'<li><strong>'+esc(x.label)+'</strong><p>'+esc(x.evidence||x.why)+'</p><p class="ready-muted">'+esc(x.how)+'</p></li>').join('')+'</ul>';
const labeled={career_target:'희망 직무',github_url:'GitHub 프로필',github_pages_url:'GitHub Pages',github_pages_repo:'GitHub Pages 저장소',notion_url:'Notion 포트폴리오',portfolio_url:'포트폴리오',blog_url:'기술 블로그',resume_status:'이력서',cover_letter_status:'자기소개서'};
export const label=k=>labeled[k]||k;
export const history=b=>table(['변경 시각','종류','항목','이전','이후','변경자'],(b.history||[]).map(x=>[esc(fmt(x.changed_at)),esc(x.category),esc(label(x.field_name)),esc(x.old_value),esc(x.new_value),esc(x.changed_by)]));
export const readmeAreas=[['introduction','프로젝트 소개'],['purpose','개발 목적'],['features','주요 기능'],['tech_stack','기술 스택'],['architecture','아키텍처'],['run_guide','설치·실행 안내'],['screenshots','실행 화면'],['role','본인 역할'],['troubleshooting','트러블슈팅']];
const value=v=>v===true?'확인':v===false?'미확인':v===''||v==null?'미점검':esc(v);
export function details(b){
 const e=b.evaluation,g=b.checks.github||{},p=b.primary.repository||{},r=b.primary.readme||{},n=b.checks.notion||{},blog=b.checks.blog||{},port=b.checks.portfolio||{};
 return panel('준비 상태',cards([['준비 상태',e.status],['GitHub 7일 활동',e.github_fresh?e.github.active_days_7d+'일':'최신 점검 필요'],['Repository',e.repository.count+'개'],['README',e.readme.status],['포트폴리오',e.portfolio.status]])+'<p class="ready-muted">GitHub 점검 '+esc(fmt(g.checked_at))+' · '+esc(g.check_status||'미점검')+'</p>'+issues(e))+
 panel('GitHub · Repository 상세',cards([['14일 활동일',g.active_days_14d??'-'],['최근 7일 커밋',g.commits_7d??'-'],['30일 커밋',g.commits_30d??'-'],['미활동 일수',g.inactive_days??'-']])+table(['저장소','대표','언어','7일 본인 커밋','업데이트','README','점검'],b.repositories.map(x=>{const c=b.repoChecks.find(y=>y.repo_id===x.repo_id&&y.kind==='repository')?.data||{},r=b.repoChecks.find(y=>y.repo_id===x.repo_id&&y.kind==='readme')?.data||{};return [url(x.repo_url),x.is_primary?'대표':'',esc(c.primary_language||'-'),esc(c.student_commits_7d??'-'),esc(c.push_status||'-'),esc(r.readme_status||'-'),esc(c.check_status||'-')]}))+
 '<details><summary>대표 저장소 품질</summary>'+table(['설명','Topics','Gitignore','License','소스','브랜치'],[[value(p.description_exists),value(p.topics_count),value(p.gitignore_exists),value(p.license_exists),value(p.source_exists),value(p.branch_count)]])+'</details>')+
 panel('README 점검 · 9가지 항목',readmeAreas.map(([k,t])=>'<div class="ready-checklist">'+esc(t)+' · '+value(r[k])+'</div>').join('')+'<p>링크 오류: '+esc(r.broken_links_count??'미점검')+' '+esc(r.broken_link_samples||'')+'</p>')+
 panel('포트폴리오 · 블로그 · Notion',table(['항목','상태','점검 시각'],[['개인 포트폴리오',value(port.site_available),esc(fmt(port.checked_at))],['GitHub Pages / '+esc(blog.platform_type||'-'),value(blog.site_available),esc(fmt(blog.checked_at))],['Notion',esc(b.notion_connection?.status==='CONNECTED'?n.activity_status||'연결됨':b.notion_connection?.status==='AUTH_REQUIRED'?'연동 필요':n.activity_status||'미점검'),esc(fmt(n.checked_at))]])+'<p>Notion 최종 수정일: '+esc(n.last_edited_at?fmt(n.last_edited_at):'미확인')+'</p><p class="ready-muted">'+esc([port.error_message,n.error_message,blog.error_message].filter(Boolean).join(' / '))+'</p>')+
 panel('서류 및 자격증',cards([['이력서',b.student.resume_status||'미작성'],['자기소개서',b.student.cover_letter_status||'미작성']])+table(['자격증','상태','최종합격일'],b.certificates.map(c=>[esc(c.certificate_name),esc(c.pass_status==='final'?'취득':'필기합격'),esc(c.final_pass_date||'-')]))+table(['준비 중 자격증'],b.plans.map(c=>[esc(c.certificate_name)])));
}
