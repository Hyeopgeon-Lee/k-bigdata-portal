import {api,esc,fmt,url,table,panel,status,details,history,readyErrorMessage} from '../../js/ready-common.mjs?v=20261128-ready-ui-2';
import {READY_STATES,effectiveStatus,githubCategory,notionLabel,percentage,cohort,filterStudents,summarize,checkTargets,gradeComparison,documentCounts,snapshotRows,labelCheck} from './ready-metrics.mjs?v=20261128-ready-enrolled-1';
const root=document.querySelector('#ready-root'),$=s=>root.querySelector(s),ui=window.portalAdminUI;
const pageSize=10;
let d=null,grade=ui.getGrade(),search='',state='all',page=1,busy=false,view='list',refreshNeeded=false;
const gradeName=()=>ui.gradeLabel(grade);
const gradeRows=()=>cohort(d?.rows||[],grade);
const filtered=()=>filterStudents(gradeRows(),state,search);
const num=value=>Number(value||0).toLocaleString('ko-KR');
const action=(id,text,{secondary=false,disabled=false}={})=>'<button type="button" id="'+id+'" class="'+(secondary?'ready-admin-secondary':'ready-admin-primary')+'" data-ready-action'+(disabled?' data-unavailable="true" disabled':'')+'>'+esc(text)+'</button>';
const selection=(label,kind)=>'<span class="ready-admin-pill" data-tone="'+esc(kind||'neutral')+'">'+esc(label)+'</span>';
const tone=s=>({'준비 우수':'good','준비 양호':'good','준비 중':'blue','관심 필요':'warning','미등록':'neutral','상태 미확인':'warning','연결 완료':'good','학생 동의 대기':'blue','다시 연결 필요':'warning','링크 확인 필요':'warning','관리자 설정 필요':'warning','상태 확인 필요':'warning','주 3일 이상 활동':'good','14일 이상 미활동':'warning','점검 필요':'warning','부분 점검':'warning'}[s]||'neutral');
const badge=s=>selection(s,tone(s));
const enrollment=r=>r.member?.enrollment_status==='leave'?'휴학':r.member?.enrollment_status==='early_employment'?'조기취업':'';
const academic=r=>['1','2'].includes(String(r.member?.academic_year))?r.member.academic_year+'학년':'학년 미설정';
const setStatus=(message,error=false)=>status(message,error);
function syncControls(){
 root.setAttribute('aria-busy',String(busy));
 root.querySelectorAll('[data-ready-action]').forEach(el=>{el.disabled=busy||el.dataset.unavailable==='true';});
}
function setBusy(value){busy=value;syncControls()}
async function guarded(fn){
 if(busy)return;
 setBusy(true);
 try{await fn()}catch(e){setStatus(e.message||'처리 중 오류가 발생했습니다.',true)}finally{setBusy(false)}
}
function readyHeader(title,description,extra=''){
 return '<div class="ready-admin-section-head"><div><h2>'+esc(title)+'</h2><p>'+esc(description)+'</p></div>'+extra+'</div>';
}
function setUnavailable(button,value){button.dataset.unavailable=String(value);button.disabled=busy||value}
async function fetchOverview(){const result=await api('admin');if(!Array.isArray(result.rows))throw Error('학생 현황을 조회하지 못했습니다.');d={...result,rows:cohort(result.rows)};refreshNeeded=false;}
function renderOverview(){
 view='list';
 root.innerHTML='<section class="admin-grade-panel ready-grade-panel" aria-label="공통 학년 필터"><div class="admin-grade-heading"><strong>학년별 조회</strong><span>다른 관리자 화면에서도 선택 유지</span></div><div class="admin-grade-group" role="group" aria-label="학년 선택">'+[['','전체'],['1','1학년'],['2','2학년']].map(([g,l])=>'<button type="button" class="admin-grade-choice" data-admin-grade="'+g+'" data-ready-action aria-pressed="'+(grade===g)+'">'+l+'</button>').join('')+'</div></section>'+
 '<div class="ready-admin-jump"><a href="#ready-students">학생 목록 ↓</a><a href="#ready-operations">정기 운영 ↓</a>'+action('refresh','새로고침',{secondary:true})+'</div>'+
 '<section class="ready-admin-overview" aria-labelledby="ready-overview-title"><div class="ready-admin-section-head"><div><h2 id="ready-overview-title">취업 준비 현황</h2><p id="ready-scope"></p></div><span class="ready-admin-scope" id="ready-scope-label"></span></div><div id="ready-kpis"></div><div class="admin-chart-grid ready-admin-charts"><div id="ready-state-chart"></div><div id="ready-github-chart"></div><div id="ready-notion-chart"></div><div id="ready-compare-chart"></div></div></section>'+
 '<section class="ready-admin-panel" id="ready-students">'+readyHeader('학생별 준비 현황','선택 학년 내에서 상태 또는 이름·학번·직무로 찾아보세요.')+'<div class="ready-admin-filters"><label>준비 상태<select id="state" data-ready-action><option value="all">전체 상태</option>'+READY_STATES.map(s=>'<option value="'+esc(s)+'">'+esc(s)+'</option>').join('')+'</select></label><label>학생 검색<input id="search" type="search" data-ready-action maxlength="80" placeholder="이름 · 학번 · 희망 직무"></label>'+action('clear-filter','검색 초기화',{secondary:true})+'</div><div class="ready-admin-list-toolbar"><p id="list-count" aria-live="polite"></p>'+action('batch','일괄 점검')+'</div><p class="ready-admin-note">일괄 점검은 현재 학년·검색·상태 조건에 맞는 READY 등록 재학생(조기취업·휴학 제외)을 대상으로 합니다.</p><div id="students" class="ready-student-grid"></div><div id="ready-pager" class="ready-admin-pagination" aria-label="학생 목록 페이지"></div></section>'+
 '<section id="ready-operations" class="ready-admin-panel">'+operationsMarkup()+'</section>';
 $('#state').value=state;$('#search').value=search;
 root.querySelectorAll('[data-admin-grade]').forEach(el=>el.onclick=()=>{if(!busy)ui.setGrade(el.dataset.adminGrade)});
 $('#state').onchange=e=>{state=e.target.value;page=1;renderList()};
 $('#search').oninput=e=>{search=e.target.value;page=1;renderList()};
 $('#clear-filter').onclick=()=>{state='all';search='';page=1;$('#state').value=state;$('#search').value=search;renderList()};
 $('#refresh').onclick=()=>guarded(async()=>{setStatus('최신 학생 현황을 불러오는 중입니다.');await fetchOverview();renderOverview();setStatus('최신 현황을 불러왔습니다.')});
 $('#batch').onclick=batchCheck;
 $('#snapshot').onclick=()=>guarded(async()=>{setStatus('이번 주 집계를 생성하는 중입니다.');await api('admin_snapshot');await fetchOverview();renderOverview();setStatus('이번 주 집계를 생성했습니다. 메일은 발송하지 않았습니다.')});
 $('#send-weekly').onclick=()=>{if(busy||!d.settings?.weekly_mail_enabled||!confirm('이번 주 교수용 READY 리포트를 등록된 학과 관리자 이메일로 발송할까요? (주 1회)'))return;void guarded(async()=>{setStatus('주간 리포트 발송을 요청했습니다.');const response=await api('admin_send_weekly');const messages={sent:'주간 리포트 발송 완료(이미 발송된 주에는 재발송하지 않습니다).',pending:'이번 주 발송 요청이 처리 중입니다.',already_requested:'이번 주에는 이미 발송 요청이 있습니다.',failed:'이번 주 발송 기록에 실패가 있습니다.'};await fetchOverview();renderOverview();setStatus(messages[response?.mail]||'발송 상태를 확인해 주세요.',response?.mail==='failed')})};
 renderDashboard();
 renderList();
 const snapshotChart=snapshotRows(d.snapshots||[]);
 ui.renderBars($('#ready-snapshot-chart'),'주간 READY 등록 학생 추이',snapshotChart,{unit:'명',caption:'전체 학년 · 재학생 기준 최근 8회 집계 (기존 기준 기록은 아래 세부 기록에서 확인)'});
 syncControls();
}
function renderDashboard(){
 const rows=gradeRows(),s=summarize(rows),rate=percentage(s.registered,s.total);
 $('#ready-scope-label').textContent=gradeName();
 $('#ready-scope').textContent='재학생 '+s.total+'명 · READY 등록 '+s.registered+'명 ('+(rate===null?'—':rate+'%')+') · 조기취업·휴학 제외';
 ui.renderKPIs($('#ready-kpis'),[['재학생',s.total,'명'],['READY 등록',s.registered,'명'],['관심 필요 (등록)',s.attention,'명'],['GitHub 주 3일 이상',s.weekly,'명'],['Notion 연결 완료',s.connected,'명'],['자격증 최종합격',s.certificateHolders,'명']]);
 const prepare=s.status.filter(([l,n])=>l!=='상태 미확인'||n>0);
 ui.renderDonut($('#ready-state-chart'),'취업 준비 상태',prepare,{unit:'명',caption:'미등록을 별도 분류 · 선택 학년 재학생 '+s.total+'명'});
 ui.renderBars($('#ready-github-chart'),'GitHub 활동 및 점검 상태',s.github,{unit:'명',max:Math.max(1,s.total),caption:'최근 36시간 내 점검 기준 · 재학생만 집계 · 실패·오래된 점검은 점검 필요로 표시'});
 ui.renderBars($('#ready-notion-chart'),'Notion 포트폴리오 연동',s.notion.filter(([label,count])=>count>0||['연결 완료','학생 동의 대기','미등록'].includes(label)),{unit:'명',max:Math.max(1,s.total),caption:'주소 등록 '+s.linked+'명 / OAuth 연결 '+s.connected+'명 · 연결은 실제 페이지 점검 성공과 별개'});
 const compare=$('#ready-compare-chart');
 if(!grade){
  compare.hidden=false;
  ui.renderBars(compare,'학년별 READY 등록률',gradeComparison(d.rows),{unit:'%',caption:'1·2학년 재학생 비교 · 등록 재학생/재학생',max:100});
 }else if(grade==='2'){
  compare.hidden=false;const docs=documentCounts(rows);
  ui.renderBars(compare,'2학년 취업 서류 준비',docs.rows,{unit:'명',caption:'2학년 재학생 '+docs.total+'명 기준 · 이력서 최종 완성 / 자기소개서 기본본 이상',max:Math.max(1,docs.total)});
 }else{compare.hidden=true;compare.replaceChildren()}
}
function studentCard(r){
 const member=r.member||{},e=r.evaluation||{},s=effectiveStatus(r),notion=notionLabel(r),github=githubCategory(r),enroll=enrollment(r),issues=Array.isArray(e.priorityIssues)?e.priorityIssues:[];
 const active=e.github_fresh&&['SUCCESS','PARTIAL'].includes(e.github?.check_status)&&e.github?.active_days_7d!=null&&String(e.github.active_days_7d).trim()!==''&&Number.isFinite(Number(e.github.active_days_7d))?e.github.active_days_7d+'일':'미점검';
 const issueText=r.registered?(issues.length?issues.slice(0,3).map(x=>esc(x.label)).join(' · '):'우선 보완 사항 없음'):'READY 정보 등록 필요';
 return '<article class="ready-student-card" data-student-state="'+esc(s)+'"><header><div class="ready-student-identity"><h3>'+esc(member.full_name||'이름 미등록')+'</h3><p>'+esc(academic(r))+' · '+esc(member.student_no||'학번 미등록')+(enroll?' · '+esc(enroll):'')+'</p></div>'+badge(s)+'</header><p class="ready-student-career"><span>희망 직무</span><strong>'+esc(r.student?.career_target||'미등록')+'</strong></p><dl class="ready-student-facts"><div><dt>GitHub 7일 활동</dt><dd>'+esc(active)+' <small>'+esc(github)+'</small></dd></div><div><dt>Notion 연동</dt><dd>'+badge(notion)+'</dd></div><div><dt>README</dt><dd>'+esc(r.registered?e.readme?.status||'미점검':'미등록')+'</dd></div><div><dt>자격증 최종합격</dt><dd>'+num(r.certificate_count)+'건</dd></div></dl><div class="ready-student-priority"><span>우선 확인</span><p>'+issueText+'</p></div><button type="button" class="ready-admin-secondary ready-student-detail" data-ready-action data-detail="'+esc(member.user_id)+'" aria-label="'+esc((member.full_name||'학생')+' 상세 보기')+'">학생 상세 보기 →</button></article>';
}
function renderList(){
 const rows=filtered(),all=gradeRows(),targets=checkTargets(rows),pages=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.max(1,Math.min(page,pages));
 $('#list-count').textContent='조회 '+rows.length+'명 / '+gradeName()+' '+all.length+'명';
 const batch=$('#batch');batch.textContent='일괄 점검 · '+targets.length+'명';setUnavailable(batch,!targets.length);
 $('#students').innerHTML=rows.length?rows.slice((page-1)*pageSize,page*pageSize).map(studentCard).join(''):'<div class="ready-admin-empty"><strong>조회된 학생이 없습니다.</strong><p>학년 또는 검색 조건을 변경해 주세요.</p></div>';
 $('#ready-pager').innerHTML=rows.length>pageSize?action('prev-page','← 이전',{secondary:true,disabled:page===1})+'<span>'+page+' / '+pages+'페이지</span>'+action('next-page','다음 →',{secondary:true,disabled:page===pages}):'';
 $('#prev-page')?.addEventListener('click',()=>{if(!busy){page--;renderList()}});
 $('#next-page')?.addEventListener('click',()=>{if(!busy){page++;renderList()}});
 root.querySelectorAll('[data-detail]').forEach(el=>el.onclick=()=>guarded(async()=>{setStatus('학생 상세 정보를 불러오는 중입니다.');const detail=await api('admin_detail',{user_id:el.dataset.detail});renderDetail(detail);document.querySelector('#ready-status')?.scrollIntoView({block:'start'});$('#back')?.focus({preventScroll:true});setStatus('학생 상세 현황을 확인하세요.')}));
 syncControls();
}
async function batchCheck(){
 if(busy)return;
 const targets=checkTargets(filtered());
 if(!targets.length||!confirm(gradeName()+' · 선택 조건의 등록 학생 '+targets.length+'명을 점검할까요? 조기취업자와 휴학생은 제외됩니다.'))return;
 await guarded(async()=>{
  const results={SUCCESS:0,PARTIAL:0,FAILED:0,SKIPPED:0};
  for(let i=0;i<targets.length;i++){
   setStatus('GitHub·포트폴리오 점검 중 '+(i+1)+' / '+targets.length+'명');
   try{const response=await api('admin_check',{user_id:targets[i].member.user_id});const key=response?.status==='SKIPPED'?'SKIPPED':response?.check_status;if(Object.hasOwn(results,key))results[key]++;else results.FAILED++}catch{results.FAILED++}
  }
  const message='일괄 점검 완료 · GitHub 정상 '+results.SUCCESS+'명 · 부분 '+results.PARTIAL+'명 · 실패 '+results.FAILED+'명 · 재시도 '+results.SKIPPED+'명';
  try{await fetchOverview();renderOverview();setStatus(message+' · Notion은 최신 연동/점검 상태를 확인하세요.')}catch{refreshNeeded=true;setStatus(message+' · 목록 갱신 실패. 새로고침해 주세요.',true)}
 });
}
function operationsMarkup(){
 const settings=d.settings||{},logs=d.logs||[],snapshots=d.snapshots||[];
 const logsMarkup=table(['시작','종료','대상','정상','실패','GitHub','Notion','오류'],logs.map(x=>[esc(fmt(x.started_at)),esc(fmt(x.finished_at)),esc(x.data?.target_count??'—'),esc(x.data?.success_count??'—'),esc(x.data?.failed_count??'—'),esc(labelCheck(x.data?.status)),esc(labelCheck(x.data?.notion_status)),esc(x.data?.error_message||'—')]));
 const snapshotMarkup=table(['기준일','집계 기준','전체','등록','준비 우수','준비 양호','준비 중','관심 필요','GitHub 주 3일'],snapshots.map(x=>[esc(x.snapshot_date),esc(x.data?.cohort==='enrolled_only'?'재학생':'기존 집계'),esc(x.data?.total_students??'—'),esc(x.data?.registered??'—'),esc(x.data?.excellent??'—'),esc(x.data?.good??'—'),esc(x.data?.preparing??'—'),esc(x.data?.attention_count??'—'),esc(x.data?.github_active_7d??'—')]));
 return readyHeader('정기 운영 · 주간 리포트','학년·목록 필터와 별개로 학과 재학생만 점검·집계합니다.')+
 '<div class="ready-admin-operations-status"><div><span>정기 자동점검</span>'+selection(settings.checking_enabled?'활성화':'중지',settings.checking_enabled?'good':'warning')+'</div><div><span>교수용 주간 메일</span>'+selection(settings.weekly_mail_enabled?'활성화':'중지',settings.weekly_mail_enabled?'good':'warning')+'</div></div><div class="ready-admin-actions">'+action('snapshot','이번 주 집계 생성',{secondary:true})+action('send-weekly','주간 리포트 메일 발송',{disabled:!settings.weekly_mail_enabled})+'</div><p class="ready-admin-note">집계 생성은 메일을 발송하지 않습니다. 주간 메일은 같은 주에 중복 발송하지 않습니다.</p><div id="ready-snapshot-chart" class="ready-chart-history"></div><details class="ready-admin-disclosure"><summary>주간 스냅샷 세부 기록 ('+snapshots.length+'건)</summary><p class="ready-admin-note">기존 집계는 저장 당시 기준을 보존하고, 재학생만 집계한 기록과 구분합니다. 추이 차트는 재학생 기준만 표시합니다.</p>'+snapshotMarkup+'</details><details class="ready-admin-disclosure"><summary>최근 자동·수동 점검 기록 ('+logs.length+'건)</summary>'+logsMarkup+'</details>';
}
function renderDetail(b){
 view='detail';
 const id=b.member.user_id,s=effectiveStatus(b),notion=notionLabel(b),canCheck=b.registered&&b.member.enrollment_status==='enrolled';
 const linkRows=[['GitHub',b.student.github_url],['Notion',b.student.notion_url],['포트폴리오',b.student.portfolio_url],['기술 블로그',b.student.blog_url]];
 root.innerHTML='<section class="ready-admin-panel ready-detail-head"><div class="ready-admin-section-head"><div><h2>'+esc(b.member.full_name)+' · '+esc(academic(b))+'</h2><p>'+esc(b.member.student_no)+' · '+esc(b.student.career_target||'희망 직무 미등록')+(enrollment(b)?' · '+esc(enrollment(b)):'')+'</p></div>'+badge(s)+'</div><div class="ready-admin-actions">'+action('back','← 학생 목록',{secondary:true})+action('single','지금 점검하기',{disabled:!canCheck})+'<a class="ready-admin-secondary ready-admin-button-link" href="accounts.html?view=students&amp;user='+encodeURIComponent(id)+'">상담 · 취업지도 및 교수 메모</a></div><div class="ready-detail-notion"><span>Notion 연동 상태</span>'+badge(notion)+'<span>마지막 점검 '+esc(fmt(b.notion_connection?.checked_at||b.checks?.notion?.checked_at))+'</span></div><dl class="ready-detail-links">'+linkRows.map(([label,value])=>'<div><dt>'+label+'</dt><dd>'+url(value)+'</dd></div>').join('')+'</dl></section>'+details(b)+panel('변경 이력',history(b));
 $('#back').onclick=()=>guarded(async()=>{if(refreshNeeded){try{await fetchOverview()}catch(e){renderOverview();setStatus('목록을 갱신하지 못했습니다. 새로고침해 주세요.',true);return}}renderOverview();$('#ready-students')?.scrollIntoView({block:'start'});setStatus('학생 목록을 표시했습니다.')});
 $('#single').onclick=()=>guarded(async()=>{if(!canCheck)return;setStatus('학생 GitHub·포트폴리오 점검 중입니다.');const r=await api('admin_check',{user_id:id});refreshNeeded=true;const result=r?.status==='SKIPPED'?'다시 시도 필요':labelCheck(r?.check_status);try{const detail=await api('admin_detail',{user_id:id});renderDetail(detail);setStatus('GitHub 점검 결과: '+result+' · Notion 상태는 상세 내역에서 확인하세요.',r?.check_status==='FAILED')}catch{setStatus('점검 요청 처리 완료 · 상세 갱신에 실패했습니다. 다시 조회해 주세요.',true)}});
 syncControls();
}
function loadFailure(message){
 root.innerHTML='<section class="ready-admin-panel"><h2>학생 현황을 불러오지 못했습니다.</h2><p>'+esc(readyErrorMessage(message))+'</p>'+action('retry','다시 불러오기')+'</section>';
 $('#retry').onclick=init;syncControls();
}
ui.onGrade(value=>{grade=value;page=1;if(view==='list'&&d&&!busy){renderDashboard();renderList();}});
async function init(){await guarded(async()=>{setStatus('학생 현황 확인 중…');try{await fetchOverview();renderOverview();setStatus('최신 취업 준비 현황을 확인하세요.')}catch(e){loadFailure(e.message);setStatus(e.message,true)}})}
void init();
