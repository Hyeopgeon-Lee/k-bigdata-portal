/* Both legacy and unified admin mount must initialize, including late script loading. */
window.AlumniAdminOnReady=callback=>{
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",callback,{once:true});
 else callback();
};
(function(){'use strict';const U=AlumniUI;let view='alumni',data=[],page=1,total=0,sequence=0,debounce,directoryStats=null,directoryGroups=null;const st=()=>U.qs('#admin-status'),badge=v=>`<span class="admin-badge admin-badge--${U.esc(String(v||'').toLowerCase())}">${U.esc(v)}</span>`;
const consent=v=>v===null||v===undefined||String(v).trim()===''?'미설정':/^(true|1|yes|on)$/i.test(String(v))?'동의':'거부';
const paged=()=>['alumni','requests'].includes(view);
async function rpc(name,args){const {data,error}=await window.portalSupabaseClient.rpc(name,args);if(error)throw Error(error.message||'관리자 조회 실패');return data;}
async function load(){
 const current=++sequence;U.status(st(),'관리 데이터를 불러오는 중입니다.');
 try{
  const q=U.qs('#admin-query').value.trim(),status=U.qs('#admin-status-filter').value,year=U.qs('#admin-year').value;
  if(view==='alumni'){
   const result=await rpc('admin_alumni_directory',{p_search:q,p_year:year,p_visibility:status,p_consent:U.qs('#admin-consent').value,p_employment:U.qs('#admin-employment').value,p_page:page,p_size:25});
   if(current!==sequence)return;data=result.rows||[];total=result.total||0;directoryStats=result;directoryGroups=null;
   const el=U.qs('#admin-employment'),prior=el.value;
   el.innerHTML='<option value="">전체 취업 상태</option>'+result.employment_values.map(x=>`<option value="${U.esc(x)}">${U.esc(x)}</option>`).join('');el.value=prior;
   U.qs('#admin-summary').textContent='검색 결과 '+total+'명 · 기업 '+result.companies+'곳 · 멘토링 및 연락 가능 '+result.mentor_count+'명';
  }else if(view==='requests'){
   const result=await rpc('admin_alumni_requests',{p_search:q,p_delivery:status,p_page:page});
   if(current!==sequence)return;data=result.rows||[];total=result.total||0;U.qs('#admin-summary').textContent='연락 요청 '+total+'건';
  }else{
   const result=await AlumniAPI.request('adminList',{method:'POST',data:{view}});
   if(current!==sequence)return;data=result.data||[];total=data.length;
  }
  U.qs('#admin-app').hidden=false;render();st().hidden=true;
  if(view==='alumni'&&window.portalAdminUI&&total>data.length){
   // Exact distribution over the filtered directory, not just the first 25 records.
   const params={p_search:q,p_year:year,p_visibility:status,p_consent:U.qs('#admin-consent').value,p_employment:U.qs('#admin-employment').value,p_size:100};
   const allRows=[];
   try{
    for(let p=1;p<=Math.ceil(total/100);p++){
     const batch=await rpc('admin_alumni_directory',{...params,p_page:p});
     if(current!==sequence)return;
     allRows.push(...(batch.rows||[]));
    }
    if(current!==sequence)return;
    if(allRows.length===total&&new Set(allRows.map(x=>x.alumni_id)).size===total){directoryGroups=allRows;render();}
   }catch{/* The initial chart is explicitly labelled as current page only. */}
  }
 }catch(e){if(current===sequence)U.status(st(),e.message,'error');}
}
function alumniTable(rows){return`<table class="admin-table admin-table--alumni"><thead><tr><th>이름 / 계정</th><th>졸업 / 갱신</th><th>회사 / 직무</th><th>기술·멘토링</th><th>채용메일</th><th>동문소식메일</th><th>상태</th><th>관리</th></tr></thead><tbody>${rows.map(x=>`<tr><td data-label="이름"><strong>${U.esc(x.name)}</strong><br><small>${U.esc(x.approval_status==='approved'?'승인':x.approval_status)}</small></td><td data-label="졸업">${U.esc(x.graduation_year)}<br><small>${U.esc(String(x.updated_at||'').slice(0,10))}</small></td><td data-label="회사">${U.esc(x.company)||'-'}<br>${U.esc(x.job)||'-'}<br><small>${U.esc(x.employment_status||'')}</small></td><td data-label="기술·멘토링">${U.esc(x.skills)||'-'}<br>${U.esc(x.mentoring_topics)||'-'}</td><td data-label="채용메일">${consent(x.career_mail_enabled)}</td><td data-label="동문소식메일">${consent(x.alumni_news_mail_enabled)}</td><td data-label="상태">${badge(x.status)}</td><td data-label="관리"><div class="admin-actions"><a class="button button--secondary" href="accounts.html?view=students&user=${encodeURIComponent(x.alumni_id)}">통합 상세</a>${x.approval_status==='approved'?`<button class="button--ghost" data-id="${U.esc(x.alumni_id)}" data-action="${x.status==='HIDDEN'?'adminShow':'adminHide'}">${x.status==='HIDDEN'?'공개':'비공개'}</button>`:''}</div></td></tr>`).join('')}</tbody></table>`}
function jobsTable(rows){return`<table class="admin-table"><thead><tr><th>회사/직무</th><th>등록 졸업생</th><th>구분/마감</th><th>추천</th><th>등록/승인</th><th>상태</th><th>관리</th></tr></thead><tbody>${rows.map(x=>`<tr><td data-label="회사/직무"><strong>${U.esc(x.company)}</strong><br>${U.esc(x.job_title)}</td><td data-label="등록 졸업생">${U.esc(x.alumni_name_admin)}<br>${U.esc(x.graduation_year)}년</td><td data-label="구분/마감">${U.esc(x.recruit_type)} · ${U.esc(x.employment_type)}<br>${x.always_open?'상시채용':U.esc(x.deadline)||'-'}</td><td data-label="추천">${x.referral_available?'가능':'일반'}</td><td data-label="등록/승인"><small>${U.esc(x.created_at)}<br>${U.esc(x.approved_at)||'-'}</small></td><td data-label="상태">${badge(x.status)}</td><td data-label="관리"><div class="admin-actions"><a class="button button--secondary" href="../alumni/job-detail.html?id=${encodeURIComponent(x.job_id)}" target="_blank">상세</a><button class="button--ghost" data-job-id="${U.esc(x.job_id)}" data-action="adminJobHide">숨김</button><button class="button--secondary" data-job-id="${U.esc(x.job_id)}" data-action="adminJobPublish">다시 게시</button></div></td></tr>`).join('')}</tbody></table>`}
function newsTable(rows){return`<table class="admin-table"><thead><tr><th>상태/종류</th><th>대상 졸업생</th><th>등록자</th><th>제목/관련일</th><th>메일</th><th>등록일</th><th>관리</th></tr></thead><tbody>${rows.map(x=>`<tr><td data-label="상태/종류">${badge(x.status)}<br>${U.esc(x.news_type_label)}</td><td data-label="대상 졸업생"><strong>${U.esc(x.target_name_admin)}</strong><br>${U.esc(x.graduation_year)}년</td><td data-label="등록자">${U.esc(x.submitter_name_admin)}</td><td data-label="제목/관련일"><strong>${U.esc(x.title)}</strong><br>${U.esc(x.event_date)||'-'}</td><td data-label="메일">요청 ${x.mail_requested?'예':'아니오'}<br>${badge(x.mail_status)}</td><td data-label="등록일"><small>${U.esc(x.created_at)}</small></td><td data-label="관리"><div class="admin-actions"><a class="button button--secondary" href="../alumni/news-detail.html?id=${encodeURIComponent(x.news_id)}" target="_blank">상세</a><button data-news-id="${U.esc(x.news_id)}" data-action="adminNewsSendMail" ${x.status!=='APPROVED'?'disabled':''}>메일 발송</button><button class="button--ghost" data-news-id="${U.esc(x.news_id)}" data-action="adminNewsHide">숨김</button><button class="button--secondary" data-news-id="${U.esc(x.news_id)}" data-action="adminNewsPublish">다시 게시</button></div></td></tr>`).join('')}</tbody></table>`}
function requestsTable(rows){return`<table class="admin-table"><thead><tr><th>일시</th><th>대상 졸업생</th><th>요청자</th><th>분야/제목</th><th>발송 상태</th><th>후속 조치</th></tr></thead><tbody>${rows.map(x=>`<tr><td data-label="일시">${U.esc(x.created_at)}<br><small>발송 ${U.esc(x.sent_at)||'-'}</small></td><td data-label="대상">${U.esc(x.target_name)||'대상 없음'}</td><td data-label="요청자">${U.esc(x.requester_name)} (${U.esc(x.requester_type)})</td><td data-label="분야/제목"><strong>${U.esc(x.category)}</strong><br>${U.esc(x.subject)}</td><td data-label="발송 상태">${badge(x.status)}</td><td data-label="후속 조치"><select aria-label="후속 처리 상태" data-followup-state><option value="open" ${x.followup_state==='open'?'selected':''}>처리 대기</option><option value="reviewing" ${x.followup_state==='reviewing'?'selected':''}>처리 중</option><option value="closed" ${x.followup_state==='closed'?'selected':''}>처리 완료</option></select><input maxlength="500" aria-label="후속 조치 메모" data-followup-note value="${U.esc(x.followup_note)}"><button data-contact-id="${U.esc(x.request_id)}" data-action="followup">저장</button><small>${U.esc(x.followup_at||'')}</small></td></tr>`).join('')}</tbody></table>`}
function logsTable(rows){return`<table class="admin-table"><thead><tr><th>발송일</th><th>종류</th><th>관련 ID/제목</th><th>대상</th><th>성공</th><th>실패</th><th>상태</th></tr></thead><tbody>${rows.map(x=>`<tr><td data-label="발송일">${U.esc(x.sent_at)}</td><td data-label="종류">${U.esc(x.mail_kind)}</td><td data-label="관련 ID/제목"><small>${U.esc(x.related_id)}</small><br>${U.esc(x.subject)}</td><td data-label="대상">${U.esc(x.recipient_count)}</td><td data-label="성공">${U.esc(x.sent_count)}</td><td data-label="실패">${U.esc(x.failed_count)}</td><td data-label="상태">${badge(x.status)}</td></tr>`).join('')}</tbody></table>`}
function render(){
 const q=U.qs('#admin-query').value.toLowerCase(),status=U.qs('#admin-status-filter').value,year=U.qs('#admin-year').value;
 const rows=paged()?data:data.filter(x=>(!q||JSON.stringify(x).toLowerCase().includes(q))&&(!status||x.status===status)&&(!year||String(x.graduation_year)===year));
 const renderers={alumni:alumniTable,jobs:jobsTable,news:newsTable,requests:requestsTable,mail_logs:logsTable};
 U.qs('#admin-table').innerHTML=rows.length?renderers[view](rows):'<p class="empty">조건에 맞는 데이터가 없습니다.</p>';
 U.qs('#admin-pagination').hidden=!paged();U.qs('#admin-page').textContent=page+' / '+Math.max(1,Math.ceil(total/25));U.qs('#admin-prev').disabled=page<=1;U.qs('#admin-next').disabled=page*25>=total;
 if(!paged())U.qs('#admin-summary').textContent='검색 결과 '+rows.length+'건';
 U.qs('#admin-alumni-filters').hidden=view!=='alumni';
 const ui=window.portalAdminUI;
 if(ui){
  for(const cell of U.qs('#admin-table').querySelectorAll('td')){
   const content=document.createElement('div');content.className='admin-cell-value';content.append(...cell.childNodes);cell.append(content);
  }
  const charts=ui.chartMount(U.qs('#admin-summary'),'alumni-admin-charts');
  charts.replaceChildren();
  if(view==='alumni'){
   const kpis=document.createElement('div'),grid=document.createElement('div');grid.className='admin-chart-grid';charts.append(kpis,grid);
   ui.renderKPIs(kpis,[['검색 졸업생',total,'명'],['등록 기업',directoryStats?.companies,'곳'],['연락 가능 멘토',directoryStats?.mentor_count,'명']]);
   const a=document.createElement('div'),b=document.createElement('div');grid.append(a,b);
   const groupRows=directoryGroups||rows,scope=groupRows.length===total?'전체 검색 결과 '+total+'명 기준':'현재 표시 페이지 '+rows.length+'명 기준';
   ui.renderBars(a,'졸업연도별 구성',ui.groupCounts(groupRows,x=>x.graduation_year?String(x.graduation_year)+'년':'미설정'),{unit:'명',caption:scope});
   ui.renderBars(b,'취업 상태',ui.groupCounts(groupRows,x=>x.employment_status),{unit:'명',caption:scope+' · 공식 취업률 아님'});
  }else{
   ui.renderBars(charts,'조회 상태 분포',ui.groupCounts(rows,x=>x.status),{unit:'건',caption:paged()?'현재 표시 페이지 기준':'현재 검색 결과 기준'});
  }
 }

}
function filterChanged(){page=1;if(paged()){clearTimeout(debounce);debounce=setTimeout(load,250);}else render();}
async function utility(action,button,question){if(!confirm(question))return;U.busy(button,true,'처리 중…');try{const r=await AlumniAPI.request(action,{method:'POST',data:{}});U.status(st(),r.message,'success');await load()}catch(e){U.status(st(),e.message,'error')}finally{U.busy(button,false)}}
window.AlumniAdminOnReady(()=>{
  U.yearOptions(U.qs('#admin-year'),true);
  // The Supabase Edge API checks portal_super_admin_allowed() on every action.
  
  
  U.qs('#admin-logout').addEventListener('click',()=>{
    window.location.assign("../index.html");
  });
  Promise.resolve(window.alumniPortalReady).then(()=>load()).catch(err=>{
    U.status(st(),String(err?.message||"포털 관리자 로그인이 필요합니다."),"error");
  });
  U.qs('#admin-refresh').onclick=load;U.qs('#admin-prev').onclick=()=>{if(page>1){page--;load();}};U.qs('#admin-next').onclick=()=>{if(page*25<total){page++;load();}};['#admin-query','#admin-status-filter','#admin-year','#admin-consent','#admin-employment'].forEach(s=>U.qs(s).addEventListener(s==='#admin-query'?'input':'change',filterChanged));U.qsa('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;page=1;U.qs('#admin-status-filter').value='';U.qs('#admin-year').value='';U.qsa('[data-view]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));load()});U.qs('#send-consent-invites').onclick=e=>utility('adminSendCareerConsentInvites',e.currentTarget,'채용메일 수신 여부가 미설정인 졸업생에게 안내 메일을 1회 발송할까요?');U.qs('#send-news-consent-invites').onclick=e=>utility('adminSendNewsConsentInvites',e.currentTarget,'동문소식 수신 여부가 미설정인 졸업생에게 안내 메일을 1회 발송할까요?');U.qs('#run-job-digest').onclick=e=>utility('adminRunJobDigest',e.currentTarget,'발송 대기 중인 채용정보 다이제스트를 지금 처리할까요?');U.qs('#admin-table').onclick=async e=>{const b=e.target.closest('button[data-action]');if(!b||!confirm('이 상태로 변경하시겠습니까?'))return;U.busy(b,true);try{if(b.dataset.action==='followup'){const row=b.closest('tr');await rpc('admin_alumni_request_followup',{p_request_id:b.dataset.contactId,p_state:row.querySelector('[data-followup-state]').value,p_note:row.querySelector('[data-followup-note]').value});U.status(st(),'후속 조치를 저장했습니다.','success');await load();return;}const payload={};if(b.dataset.jobId)payload.job_id=b.dataset.jobId;else if(b.dataset.newsId)payload.news_id=b.dataset.newsId;else payload.alumni_id=b.dataset.id;const r=await AlumniAPI.request(b.dataset.action,{method:'POST',data:payload});U.status(st(),r.message||'처리되었습니다.','success');await load()}catch(err){U.status(st(),err.message,'error')}finally{U.busy(b,false)}}})})();

(function(){'use strict';const U=AlumniUI,st=()=>U.qs('#admin-status');let alumniLoaded=false;
function payload(form){const out=Object.fromEntries(new FormData(form).entries());form.querySelectorAll('input[type="checkbox"]').forEach(x=>out[x.name]=x.checked);return out}
async function loadAlumniOptions(){if(alumniLoaded)return;const rows=(await AlumniAPI.request('adminList',{method:'POST',data:{view:'alumni'}})).data||[];const approved=rows.filter(x=>x.status==='APPROVED').sort((a,b)=>String(a.name).localeCompare(String(b.name),'ko'));const html='<option value="">졸업생 선택</option>'+approved.map(x=>`<option value="${U.esc(x.alumni_id)}">${U.esc(x.name)} · ${U.esc(x.graduation_year)}년 졸업${x.company?' · '+U.esc(x.company):''}</option>`).join('');U.qsa('[data-admin-alumni]').forEach(x=>x.innerHTML=html);alumniLoaded=true}
async function openPanel(selector){try{await loadAlumniOptions();U.qsa('.admin-create-panel').forEach(x=>x.hidden=true);const panel=U.qs(selector);panel.hidden=false;panel.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){U.status(st(),e.message,'error')}}
async function submit(form,action,confirmText){if(!confirm(confirmText))return;const button=form.querySelector('button[type="submit"]');U.busy(button,true,'게시 중…');try{const r=await AlumniAPI.request(action,{method:'POST',data:payload(form)});U.status(st(),r.message,'success');form.reset();form.closest('.admin-create-panel').hidden=true;U.qs('#admin-refresh').click()}catch(e){U.status(st(),e.message,'error')}finally{U.busy(button,false)}}
window.AlumniAdminOnReady(()=>{U.qs('#show-admin-job-form').onclick=()=>openPanel('#admin-job-create');U.qs('#show-admin-news-form').onclick=()=>openPanel('#admin-news-create');U.qsa('[data-close-create]').forEach(x=>x.onclick=()=>x.closest('.admin-create-panel').hidden=true);U.qs('#admin-job-form').onsubmit=e=>{e.preventDefault();submit(e.currentTarget,'adminCreateJob','입력한 채용공고를 승인 상태로 바로 게시할까요?')};U.qs('#admin-news-form').onsubmit=e=>{e.preventDefault();const mail=e.currentTarget.elements.send_mail.checked;submit(e.currentTarget,'adminCreateNews',mail?'동문소식을 게시하고 수신 동의자에게 이메일을 발송할까요?':'동문소식을 메일 없이 바로 게시할까요?')};const type=U.qs('#admin-news-type'),rel=U.qs('#admin-news-relationship'),relField=U.qs('#admin-news-relationship-field');type.onchange=()=>{const obituary=type.value==='OBITUARY';relField.hidden=!obituary;rel.required=obituary;if(!obituary)rel.value=''};const always=U.qs('#admin-job-form').elements.always_open,deadline=U.qs('#admin-job-deadline');always.onchange=()=>{deadline.disabled=always.checked;deadline.required=!always.checked;if(always.checked)deadline.value=''};deadline.required=true})})();
