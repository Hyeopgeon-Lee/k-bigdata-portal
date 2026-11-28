/* Both legacy and unified admin mount must initialize, including late script loading. */
window.AlumniAdminOnReady=callback=>{
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",callback,{once:true});
 else callback();
};
(function(){'use strict';const U=AlumniUI;let view='overview',data=[],page=1,total=0,sequence=0,debounce,directoryStats=null,directoryGroups=null,directoryCriteria=null,overviewResults=null;const st=()=>U.qs('#admin-status'),badge=v=>`<span class="admin-badge admin-badge--${U.esc(String(v||'').toLowerCase())}">${U.esc(stateLabel(v))}</span>`;
const stateLabel=v=>({PENDING:'승인 대기',APPROVED:'승인·공개',HIDDEN:'숨김',REJECTED:'반려',EXPIRED:'마감',WAITING:'발송 대기',NOT_REQUESTED:'미요청',SENT:'발송 완료',PARTIAL_FAILED:'일부 실패',FAILED:'실패',QUOTA_BLOCKED:'한도 초과'})[v]||v||'-';
const groupLabel=v=>({alumni:'졸업생',grade1:'1학년',grade2:'2학년'})[v]||v;
const consent=v=>v===null||v===undefined||String(v).trim()===''?'미설정':/^(true|1|yes|on)$/i.test(String(v))?'동의':'거부';
const paged=()=>['alumni','requests'].includes(view);
async function rpc(name,args){const {data,error}=await window.portalSupabaseClient.rpc(name,args);if(error)throw Error(error.message||'관리자 조회 실패');return data;}
const directoryMode=()=>view==='overview'||view==='alumni';
const filterSelectors=['#admin-query','#admin-status-filter','#admin-year','#admin-consent','#admin-employment','#admin-mail-kind','#admin-mail-from','#admin-mail-to'];
const clearFilters=()=>filterSelectors.forEach(selector=>U.qs(selector).value='');
const sortContent=rows=>[...rows].sort((a,b)=>(b.status==='PENDING')-(a.status==='PENDING')||String(b.created_at||'').localeCompare(String(a.created_at||'')));
function clearResults(){
 data=[];total=0;page=1;directoryStats=null;directoryGroups=null;
 U.qs('#admin-table').replaceChildren();U.qs('#admin-table').hidden=true;
 U.qs('#admin-summary').textContent='';U.qs('#admin-summary').hidden=true;
 U.qs('#admin-pagination').hidden=true;U.qs('#alumni-admin-charts')?.remove();
}
function setStatusOptions(){
 const el=U.qs('#admin-status-filter'),previous=el.value;
 const states=directoryMode()?['APPROVED','HIDDEN']:view==='requests'||view==='mail_logs'?['SENT','PARTIAL_FAILED','FAILED','QUOTA_BLOCKED']:['PENDING','APPROVED','REJECTED','HIDDEN',...(view==='jobs'?['EXPIRED']:[])];
 el.innerHTML='<option value="">전체</option>'+states.map(value=>`<option value="${value}">${stateLabel(value)}</option>`).join('');
 el.value=states.includes(previous)?previous:'';
}
function syncView(){
 U.qs('#admin-overview').hidden=view!=='overview';
 if(view!=='overview'){U.qs('#admin-overview-counts').replaceChildren();U.qs('#admin-overview-content').replaceChildren();}
 U.qs('#admin-alumni-filters').hidden=!directoryMode();
 const mailLogs=view==='mail_logs';
 U.qs('#admin-year-field').hidden=mailLogs;
 U.qs('#admin-mail-log-filters').hidden=!mailLogs;
 U.qs('#admin-table').dataset.mailHistory=String(mailLogs);
 U.qs('#admin-search-heading').textContent=directoryMode()?'졸업생 검색':mailLogs?'메일 발송 기록 검색':'검색 및 필터';
 U.qs('#admin-search-hint').hidden=!directoryMode();
 U.qs('#admin-query').placeholder=directoryMode()?'이름, 회사, 직무':mailLogs?'제목, 발송 대상, 관련 ID':'이름, 회사, 직무, 제목';
 U.qs('#admin-refresh').textContent=directoryMode()?'졸업생 검색':'새로고침';
 U.qsa('[data-view]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.view===view)));
 setStatusOptions();
}
function showSearchPrompt(){
 U.qs('#admin-summary').textContent='검색 조건을 선택하고 졸업생 검색 버튼을 누르세요.';
 U.qs('#admin-summary').hidden=view!=='alumni';
}
function switchView(next,{keepFilters=false}={}){
 if(view===next&&!keepFilters){if(view!=='alumni')return load();return;}
 clearTimeout(debounce);sequence++;directoryCriteria=null;overviewResults=null;clearResults();
 view=next;if(!keepFilters)clearFilters();syncView();
 if(view==='alumni'){showSearchPrompt();st().hidden=true;return;}
 return load();
}
function searchDirectory(){
 if(view==='overview')switchView('alumni',{keepFilters:true});
 clearTimeout(debounce);sequence++;clearResults();
 const q=U.qs('#admin-query').value.trim(),status=U.qs('#admin-status-filter').value,year=U.qs('#admin-year').value;
 directoryCriteria={p_search:q,p_year:year,p_visibility:status,p_consent:U.qs('#admin-consent').value,p_employment:U.qs('#admin-employment').value};
 return load();
}
function renderOverview(){
 const specs=[['news','주요 동문소식','동문소식'],['jobs','신규 채용정보','채용정보']];
 const resultFor=key=>overviewResults?.[key];
 U.qs('#admin-overview-counts').innerHTML=specs.map(([key,,label])=>{
  const result=resultFor(key),count=result?.rows?.filter(x=>x.status==='PENDING').length;
  return `<div class="alumni-overview-count${count>0?' alumni-overview-count--pending':''}"><span>${label} 승인 대기</span><strong data-overview-count="${key}">${count==null?'—':count+'건'}</strong></div>`;
 }).join('');
 U.qs('#admin-overview-content').innerHTML=specs.map(([key,title,label])=>{
  const result=resultFor(key),rows=result?.rows||[],job=key==='jobs',pending=rows.filter(x=>x.status==='PENDING').length;
  let content=!result?'<p class="alumni-overview-empty">불러오는 중입니다.</p>':result.error?'<p class="alumni-overview-empty alumni-overview-error" role="alert">조회를 완료하지 못했습니다. 새로고침해 주세요.</p>':rows.length?`<div class="alumni-overview-list">${rows.slice(0,5).map(x=>{
   const heading=job?[x.company,x.job_title].filter(Boolean).join(' · '):x.title;
   const info=job?[x.recruit_type,x.employment_type,x.always_open?'상시채용':x.deadline?'마감 '+x.deadline:''].filter(Boolean).join(' · '):[x.news_type_label,x.target_name_admin,x.graduation_year?x.graduation_year+'년 졸업':''].filter(Boolean).join(' · ');
   const mail=job?(x.last_mailed_at?'최근 메일 '+String(x.last_mailed_at).slice(0,10):'메일 미발송'):'메일 '+(x.mail_status==='NOT_REQUESTED'?'미요청·미발송':x.mail_status?stateLabel(x.mail_status):'상태 미확인');
   return `<article class="alumni-overview-item${x.status==='PENDING'?' alumni-overview-item--pending':''}"><div class="alumni-overview-item-head"><h4>${U.esc(heading)||'제목 없음'}</h4>${badge(x.status)}</div><p>${U.esc(info)||'-'}</p><p>등록 ${U.esc(String(x.created_at||'').slice(0,10))||'-'} · ${U.esc(mail)}</p>${contentActions(x,key==='jobs'?'jobs':'alumni_news')}</article>`;
  }).join('')}</div>`:'<p class="alumni-overview-empty">등록된 '+label+'가 없습니다.</p>';
  if(rows.length>5)content+=`<p class="alumni-overview-note">전체 ${rows.length}건 중 상위 5건 표시 · 승인 대기 ${pending}건</p>`;
  return `<section class="alumni-overview-section" data-overview-kind="${key}"><div class="alumni-overview-section-head"><h3>${title}</h3><button type="button" data-open-view="${key}" class="button--secondary">전체 보기</button></div>${content}</section>`;
 }).join('');
}
async function loadOverview(current){
 overviewResults={};renderOverview();
 await Promise.all(['news','jobs'].map(async kind=>{
  try{
   const result=await AlumniAPI.request('adminList',{method:'POST',data:{view:kind}});
   if(current!==sequence)return;overviewResults[kind]={rows:sortContent(result.data||[])};
  }catch(error){if(current!==sequence)return;overviewResults[kind]={error:true};}
 }));
 if(current===sequence){renderOverview();st().hidden=true;}
}
async function load(){
 const current=++sequence;
 U.qs('#admin-app').hidden=false;
 if(view==='alumni'&&!directoryCriteria){clearResults();showSearchPrompt();st().hidden=true;return;}
 U.status(st(),'관리 데이터를 불러오는 중입니다.');
 if(view==='overview'){await loadOverview(current);return;}
 try{
  const q=U.qs('#admin-query').value.trim(),status=U.qs('#admin-status-filter').value;
  if(view==='alumni'){
   const criteria={...directoryCriteria};
   const result=await rpc('admin_alumni_directory',{...criteria,p_page:page,p_size:25});
   if(current!==sequence)return;data=result.rows||[];total=result.total||0;directoryStats=result;directoryGroups=null;
   const el=U.qs('#admin-employment'),prior=el.value;
   const options=[...new Set([...U.options.employmentStatus,...(result.employment_values||[]),prior].filter(Boolean))];
   el.innerHTML='<option value="">전체 취업 상태</option>'+options.map(x=>`<option value="${U.esc(x)}">${U.esc(x)}</option>`).join('');el.value=prior;
   U.qs('#admin-summary').textContent='검색 결과 '+total+'명 · 기업 '+result.companies+'곳 · 멘토링 및 연락 가능 '+result.mentor_count+'명';
  }else if(view==='requests'){
   const result=await rpc('admin_alumni_requests',{p_search:q,p_delivery:status,p_page:page});
   if(current!==sequence)return;data=result.rows||[];total=result.total||0;U.qs('#admin-summary').textContent='연락 요청 '+total+'건';
  }else{
   const result=await AlumniAPI.request('adminList',{method:'POST',data:{view}});
   if(current!==sequence)return;data=['jobs','news'].includes(view)?sortContent(result.data||[]):result.data||[];total=data.length;
  }
  render();st().hidden=true;
  if(view==='alumni'&&window.portalAdminUI&&total>data.length){
   // Only after an explicit directory search, compute the full matched distribution.
   const params={...directoryCriteria,p_size:100};
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
function contentActions(x,kind){
 const job=kind==='jobs',id=job?x.job_id:x.news_id,key=job?'job':'news',prefix=job?'adminJob':'adminNews';
 const button=(action,label,style='button--secondary')=>`<button type="button" class="${style}" data-${key}-id="${U.esc(id)}" data-action="${action}">${label}</button>`;
 const expired=job&&!x.always_open&&x.deadline&&x.deadline<new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
 let html=button('review','내용 확인');
 if(x.status==='PENDING')html+=(!expired?button(prefix+'Publish','승인·게시','button'):'')+button(prefix+'Reject','반려','button--ghost');
 if(x.status==='APPROVED')html+=(!expired?button('mail','메일 발송','button'):'')+button(prefix+'Hide','숨김','button--ghost');
 if(x.status==='HIDDEN'&&!expired)html+=button(prefix+'Publish','다시 게시');
 if(x.status==='APPROVED')html+=job?`<a class="button button--secondary" href="../alumni/job-detail.html?id=${encodeURIComponent(id)}" target="_blank" rel="noopener noreferrer">공개 페이지</a>`:`<a class="button button--secondary" href="../alumni/news-detail.html?id=${encodeURIComponent(id)}" target="_blank" rel="noopener noreferrer">공개 페이지</a>`;
 return '<div class="admin-actions">'+html+'</div>';
}
function jobsTable(rows){return`<table class="admin-table"><thead><tr><th>회사/직무</th><th>등록 졸업생</th><th>구분/마감</th><th>메일</th><th>등록/승인</th><th>상태</th><th>관리</th></tr></thead><tbody>${rows.map(x=>`<tr><td data-label="회사/직무"><strong>${U.esc(x.company)}</strong><br>${U.esc(x.job_title)}</td><td data-label="등록 졸업생">${U.esc(x.alumni_name_admin)}<br>${U.esc(x.graduation_year)}년</td><td data-label="구분/마감">${U.esc(x.recruit_type)} · ${U.esc(x.employment_type)}<br>${x.always_open?'상시채용':U.esc(x.deadline)||'-'}</td><td data-label="메일">${x.last_mailed_at?'최근 '+U.esc(String(x.last_mailed_at).slice(0,10)):'미발송'}</td><td data-label="등록/승인"><small>${U.esc(String(x.created_at||'').slice(0,10))}<br>${U.esc(String(x.approved_at||'').slice(0,10))||'-'}</small></td><td data-label="상태">${badge(x.status)}</td><td data-label="관리">${contentActions(x,'jobs')}</td></tr>`).join('')}</tbody></table>`}
function newsTable(rows){return`<table class="admin-table"><thead><tr><th>상태/종류</th><th>대상 졸업생</th><th>등록자</th><th>제목/관련일</th><th>메일</th><th>등록일</th><th>관리</th></tr></thead><tbody>${rows.map(x=>`<tr><td data-label="상태/종류">${badge(x.status)}<br>${U.esc(x.news_type_label)}</td><td data-label="대상 졸업생"><strong>${U.esc(x.target_name_admin)}</strong><br>${U.esc(x.graduation_year)}년</td><td data-label="등록자">${U.esc(submitterLabel(x.submitter_name_admin))}</td><td data-label="제목/관련일"><strong>${U.esc(x.title)}</strong><br>${U.esc(x.event_date)||'-'}</td><td data-label="메일">요청 ${x.mail_requested?'예':'아니오'}<br>${badge(x.mail_status)}</td><td data-label="등록일"><small>${U.esc(String(x.created_at||'').slice(0,10))}</small></td><td data-label="관리">${contentActions(x,'alumni_news')}</td></tr>`).join('')}</tbody></table>`}
// The API returns an internal ID when the submitter is not an alumni profile.
function submitterLabel(value){
 const name=String(value??'').trim();
 return !name||/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(name)?'이름 정보 없음':name;
}
function showContent(item,job){
 const d=U.qs('#admin-content-dialog'),detail=U.qs('#admin-content-detail');
 const filled=value=>String(value??'').trim()!=='';
 const join=(...values)=>values.filter(filled).join(' · ');
 const date=value=>String(value||'').slice(0,10);
 const pair=([label,value])=>`<div class="review-meta-item"><dt>${U.esc(label)}</dt><dd>${U.esc(value)}</dd></div>`;
 const meta=fields=>`<dl class="review-meta-grid">${fields.filter(([,value])=>filled(value)).map(pair).join('')}</dl>`;
 const section=(title,content)=>`<section class="review-section"><h3>${U.esc(title)}</h3>${content}</section>`;
 const extra=job?
 [['등록 졸업생',item.alumni_name_admin],['근무 지역',item.location],['주요 기술',item.skills],['추천 가능',item.referral_available?'가능':'불가'],['등록일',date(item.created_at)],['최근 메일 발송일',date(item.last_mailed_at)]]:
 [['회사 · 직무',join(item.company,item.job_title)],['기관 · 성과',join(item.organization,item.position_title)],['대학원 · 학위',join(item.school_name,item.degree_or_program)],['장소',item.location],['관계',item.relationship],['메일 요청',item.mail_requested?'요청함':'미요청'],['메일 상태',item.mail_status?stateLabel(item.mail_status):''],['등록일',date(item.created_at)]];
 const title=job?join(item.company,item.job_title):item.title;
 const kind=job?'채용정보':(item.news_type_label||'동문소식');
 const primary=job?
 [['채용 구분',join(item.recruit_type,item.employment_type)],['접수 마감',item.always_open?'상시채용':item.deadline]]:
 [['소식 대상',item.target_name_admin||'정보 없음'],['등록자',submitterLabel(item.submitter_name_admin)],['관련 날짜',item.event_date]];
 const body=job?item.alumni_comment:item.content;
 const url=job?item.job_url:item.external_url;
 let link='';
 if(filled(url)){
  try{const parsed=new URL(url);if(['http:','https:'].includes(parsed.protocol))link=`<a class="review-link" href="${U.esc(parsed.href)}" target="_blank" rel="noopener noreferrer">${U.esc(job?'공식 채용공고 보기 ↗':'외부 안내 페이지 보기 ↗')}<span>${U.esc(url)}</span></a>`;}catch{/* Display malformed legacy URL without making it clickable. */}
  if(!link)link=`<p class="review-body-text">${U.esc(url)}</p>`;
 }
 detail.innerHTML=`<article class="review-card">
  <header class="review-hero"><div class="review-kinds"><span class="review-kind">${U.esc(kind)}</span>${badge(item.status)}</div>
  <h3 class="review-title">${U.esc(title)||'제목 없음'}</h3></header>
  ${meta(primary)}
  ${section(job?'선배의 한마디':'소식 내용',`<div class="review-body"><p class="review-body-text">${U.esc(body)||(job?'등록된 메시지가 없습니다.':'등록된 내용이 없습니다.')}</p></div>`)}
  ${extra.some(([,value])=>filled(value))?section('추가 정보',meta(extra)):''}
  ${link?section(job?'채용공고 링크':'관련 링크',link):''}
 </article>`;
 if(!d.open)d.showModal();
 detail.scrollTop=0;
}
let mailItem=null,mailPreview=null,mailBusy=false,previewGeneration=0;
const mailDialog=()=>U.qs('#admin-mail-dialog'),mailMessage=()=>U.qs('#admin-mail-message');
const groupInputs=()=>U.qsa('#admin-mail-groups input[value]');
const chosenGroups=()=>groupInputs().filter(x=>x.checked).map(x=>x.value);
function clearMailDesign(){const design=U.qs('#admin-mail-design'),frame=U.qs('#admin-mail-frame');if(design)design.hidden=true;if(frame)frame.removeAttribute('srcdoc');}
function invalidatePreview(){previewGeneration++;mailPreview=null;U.qs('#admin-mail-preview').replaceChildren();clearMailDesign();U.qs('#admin-confirm-mail').disabled=true;mailMessage().hidden=true;}
function openMail(item,job){
 mailItem={record_id:job?item.job_id:item.news_id,kind:job?'jobs':'alumni_news'};
 U.qs('#admin-mail-subject').textContent=job?item.company+' · '+item.job_title:item.title;
 groupInputs().forEach(x=>x.checked=false);U.qs('#admin-mail-all').checked=false;invalidatePreview();mailDialog().showModal();
}
async function previewMail(){
 const groups=chosenGroups(),generation=++previewGeneration;
 if(!groups.length){U.status(mailMessage(),'발송 대상을 한 개 이상 선택하세요.','error');return}
 const button=U.qs('#admin-preview-mail');U.busy(button,true,'확인 중…');
 try{
  const res=await AlumniAPI.request('adminMailPreview',{method:'POST',data:{...mailItem,groups}});
  if(generation!==previewGeneration||!mailDialog().open)return;
  mailPreview={...res.data,groups};
  U.qs('#admin-mail-preview').innerHTML=mailPreview.counts.map(x=>`<div class="admin-mail-count"><strong>${U.esc(groupLabel(x.group))}</strong><span>${x.total}명 중 발송 가능 ${x.available}명 · 발송 완료 ${x.sent}명${x.sending?' · 처리 중 '+x.sending+'명':''}</span></div>`).join('')+`<p><strong>발송 예정: ${mailPreview.available}명</strong></p>`;
  const design=U.qs('#admin-mail-design'),frame=U.qs('#admin-mail-frame');
  if(typeof mailPreview.subject==='string')U.qs('#admin-mail-subject').textContent=mailPreview.subject;
  if(design&&frame&&typeof mailPreview.html==='string'&&mailPreview.html){
   frame.srcdoc=mailPreview.html;design.hidden=false;design.open=true;
  }else clearMailDesign();
  const quota=mailPreview.quota;
  if(quota?.daily&&quota?.monthly){
   U.qs('#admin-mail-preview').insertAdjacentHTML('beforeend',`<section class="mail-quota"><strong>Resend 무료 한도</strong><p>일일 ${quota.daily.used} / ${quota.daily.limit}건 · 월간 ${quota.monthly.used} / ${quota.monthly.limit}건</p><p>발송 가능 ${quota.available}건 · 일일 초기화 ${U.esc(new Date(quota.daily.resets_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}))}</p></section>`);
  }
  if(quota?.allowed!==true)U.status(mailMessage(),quota?.message||'발송 한도를 확인할 수 없어 발송을 차단했습니다.','error');
  U.qs('#admin-confirm-mail').disabled=!mailPreview.available||quota?.allowed!==true;
 }catch(e){if(generation===previewGeneration)U.status(mailMessage(),e.message,'error')}
 finally{U.busy(button,false)}
}
async function sendSelectedMail(){
 if(!mailPreview||mailBusy||!mailPreview.available||mailPreview.quota?.allowed!==true)return;
 const preview=mailPreview,item={...mailItem};
 if(!confirm(groupLabel(preview.groups[0])+(preview.groups.length>1?' 외 '+(preview.groups.length-1)+'개 그룹':'')+' · 발송 대상 '+preview.available+'명에게 메일을 발송할까요?'))return;
 mailBusy=true;
 const button=U.qs('#admin-confirm-mail');U.busy(button,true,'발송 중…');
 U.qs('#admin-preview-mail').disabled=true;U.qs('#admin-mail-groups').disabled=true;U.qs('#admin-close-mail').disabled=true;
 let cursor=0,sent=0,failed=0;
 try{
  do{
   const r=await AlumniAPI.request(item.kind==='jobs'?'adminJobSendMail':'adminNewsSendMail',{method:'POST',data:{...item,groups:preview.groups,token:preview.token,confirmed:true,cursor}});
   sent+=r.data.sent;failed+=r.data.failed;
   U.status(mailMessage(),'진행: 발송 '+sent+'건 / 실패 '+failed+'건');
   if(r.data.done)break;
   if(r.data.next_cursor<=cursor)throw Error('발송 진행 상태를 확인하지 못했습니다.');
   cursor=r.data.next_cursor;
  }while(true);
  U.status(mailMessage(),'발송 완료: 성공 '+sent+'건 · 실패 '+failed+'건. 이미 발송된 회원은 재발송하지 않습니다.',failed?'error':'success');
 }catch(e){U.status(mailMessage(),'발송 중단: 성공 '+sent+'건 · 실패 '+failed+'건. '+e.message+' 대상 인원을 다시 확인해 주세요.','error')}
 finally{mailBusy=false;mailPreview=null;U.qs('#admin-mail-preview').replaceChildren();clearMailDesign();U.busy(button,false);button.disabled=true;U.qs('#admin-preview-mail').disabled=false;U.qs('#admin-mail-groups').disabled=false;U.qs('#admin-close-mail').disabled=false;await load()}
}
function requestsTable(rows){return`<table class="admin-table"><thead><tr><th>일시</th><th>대상 졸업생</th><th>요청자</th><th>분야/제목</th><th>발송 상태</th><th>후속 조치</th></tr></thead><tbody>${rows.map(x=>`<tr><td data-label="일시">${U.esc(x.created_at)}<br><small>발송 ${U.esc(x.sent_at)||'-'}</small></td><td data-label="대상">${U.esc(x.target_name)||'대상 없음'}</td><td data-label="요청자">${U.esc(x.requester_name)} (${U.esc(x.requester_type)})</td><td data-label="분야/제목"><strong>${U.esc(x.category)}</strong><br>${U.esc(x.subject)}</td><td data-label="발송 상태">${badge(x.status)}</td><td data-label="후속 조치"><select aria-label="후속 처리 상태" data-followup-state><option value="open" ${x.followup_state==='open'?'selected':''}>처리 대기</option><option value="reviewing" ${x.followup_state==='reviewing'?'selected':''}>처리 중</option><option value="closed" ${x.followup_state==='closed'?'selected':''}>처리 완료</option></select><input maxlength="500" aria-label="후속 조치 메모" data-followup-note value="${U.esc(x.followup_note)}"><button data-contact-id="${U.esc(x.request_id)}" data-action="followup">저장</button><small>${U.esc(x.followup_at||'')}</small></td></tr>`).join('')}</tbody></table>`}
// Group only stored dispatches, never generate dates with no records.
const mailDayFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'});
const mailWeekdayFormat=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',weekday:'short'});
const mailTimeFormat=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
function mailLogStamp(value){
 const raw=String(value||'').trim(),iso=raw.replace(' ','T');
 // Historical timestamps without an explicit timezone represent local Korean time.
 const normalized=/^\d{4}-\d{2}-\d{2}$/.test(iso)?iso+'T00:00:00+09:00':
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(iso)?iso+'+09:00':iso;
 const ms=normalized?Date.parse(normalized):NaN;
 if(!Number.isFinite(ms))return {day:'',label:'발송일 확인 불가',time:raw||'시간 미기록',ms:-Infinity};
 const fields=Object.fromEntries(mailDayFormat.formatToParts(ms).map(x=>[x.type,x.value]));
 const day=[fields.year,fields.month,fields.day].join('-');
 return {day,label:day.replaceAll('-','.')+' ('+mailWeekdayFormat.format(ms)+')',time:/^\d{4}-\d{2}-\d{2}$/.test(iso)?'시간 미기록':mailTimeFormat.format(ms),ms};
}
function mailCount(value){const n=Number(value);return Number.isFinite(n)&&n>=0?Math.floor(n):0;}
function mailLogStatus(row){return row.status==='PARTIAL_FAILED'&&!mailCount(row.sent_count)&&mailCount(row.failed_count)>0?'FAILED':row.status;}
function mailLogGroups(row){return String(row.target_groups||'').split('|').filter(Boolean).map(groupLabel).join(' · ')||'기존 발송';}
function mailLogTotals(rows){
 return rows.reduce((sum,row)=>({
  targets:sum.targets+mailCount(row.recipient_count),
  sent:sum.sent+mailCount(row.sent_count),
  failed:sum.failed+mailCount(row.failed_count)
 }),{targets:0,sent:0,failed:0});
}
function mailLogDays(rows){
 const days=new Map();
 for(const row of rows){
  const stamp=mailLogStamp(row.sent_at);
  if(!days.has(stamp.day))days.set(stamp.day,{day:stamp.day,label:stamp.label,records:[]});
  days.get(stamp.day).records.push({row,stamp});
 }
 return [...days.values()].sort((a,b)=>b.day.localeCompare(a.day)).map(day=>({
  ...day,records:day.records.sort((a,b)=>b.stamp.ms-a.stamp.ms),...mailLogTotals(day.records.map(x=>x.row))
 }));
}
const mailNumber=n=>n.toLocaleString('ko-KR');
function mailHistoryCards(days){
 return `<div class="mail-history" aria-label="일자별 메일 발송 기록">${days.map((day,index)=>`
  <details class="mail-history-day" data-mail-day="${U.esc(day.day)}"${index===0?' open':''}>
   <summary class="mail-history-summary">
    <span class="mail-history-heading"><span class="mail-history-date">${U.esc(day.label)}</span><span class="mail-history-subtitle">발송 기록 ${mailNumber(day.records.length)}건</span></span>
    <span class="mail-history-totals" aria-label="날짜별 집계">
     <span>대상 <strong>${mailNumber(day.targets)}</strong>건</span>
     <span class="mail-history-success">성공 <strong>${mailNumber(day.sent)}</strong>건</span>
     <span class="${day.failed?'mail-history-failed':''}">실패 <strong>${mailNumber(day.failed)}</strong>건</span>
    </span><span class="mail-history-chevron" aria-hidden="true"></span>
   </summary>
   <div class="mail-history-records">${day.records.map(({row,stamp})=>`
    <article class="mail-history-record">
     <div class="mail-history-record-main">
      <div class="mail-history-record-meta"><span class="mail-history-kind">${U.esc(row.mail_kind||'메일')}</span><time${Number.isFinite(stamp.ms)?' datetime="'+new Date(stamp.ms).toISOString()+'"':''}>${U.esc(stamp.time)}</time></div>
      <h3>${U.esc(row.subject||'제목 없음')}</h3>
      <p>발송 대상: ${U.esc(mailLogGroups(row))}</p>
      ${row.related_id?`<p class="mail-history-id">관련 ID: ${U.esc(row.related_id)}</p>`:''}
     </div>
     <div class="mail-history-record-result">${badge(mailLogStatus(row))}<div class="mail-history-record-counts">
      <span>대상 <strong>${mailNumber(mailCount(row.recipient_count))}</strong>건</span>
      <span class="mail-history-success">성공 <strong>${mailNumber(mailCount(row.sent_count))}</strong>건</span>
      <span class="${mailCount(row.failed_count)?'mail-history-failed':''}">실패 <strong>${mailNumber(mailCount(row.failed_count))}</strong>건</span>
     </div></div>
    </article>`).join('')}</div>
  </details>`).join('')}</div>`;
}
function renderMailLogs(){
 const q=U.qs('#admin-query').value.trim().toLowerCase(),status=U.qs('#admin-status-filter').value,
  kind=U.qs('#admin-mail-kind').value,from=U.qs('#admin-mail-from').value,to=U.qs('#admin-mail-to').value;
 const summary=U.qs('#admin-summary'),table=U.qs('#admin-table');
 U.qs('#admin-pagination').hidden=true;U.qs('#alumni-admin-charts')?.remove();
 if(from&&to&&from>to){
  summary.textContent='시작일이 종료일보다 늦습니다.';table.innerHTML='<p class="empty">조회 기간을 다시 선택해 주세요.</p>';return;
 }
 const rows=data.filter(row=>{
  if(kind&&row.mail_kind!==kind||status&&mailLogStatus(row)!==status)return false;
  if(q&&![row.subject,row.related_id,row.mail_kind,mailLogGroups(row)].some(v=>String(v||'').toLowerCase().includes(q)))return false;
  const day=mailLogStamp(row.sent_at).day;
  return !(from&&(!day||day<from)||to&&(!day||day>to));
 });
 const days=mailLogDays(rows),totals=mailLogTotals(rows),dateCount=days.filter(x=>x.day).length;
 summary.textContent='조회 결과 · 발송일 '+mailNumber(dateCount)+'일 · 발송 기록 '+mailNumber(rows.length)+'건 · 성공 '+mailNumber(totals.sent)+'건 · 실패 '+mailNumber(totals.failed)+'건'+(days.some(x=>!x.day)?' · 날짜 미확인 기록 포함':'')+' (한국 시간 기준)';
 table.innerHTML=days.length?mailHistoryCards(days):'<p class="empty">조건에 맞는 메일 발송 기록이 없습니다.</p>';
}
function render(){
 if(view==='overview'||(view==='alumni'&&!directoryCriteria))return;
 U.qs('#admin-summary').hidden=false;U.qs('#admin-table').hidden=false;
 if(view==='mail_logs'){renderMailLogs();return;}
 const q=U.qs('#admin-query').value.toLowerCase(),status=U.qs('#admin-status-filter').value,year=U.qs('#admin-year').value;
 const rows=paged()?data:data.filter(x=>(!q||JSON.stringify(x).toLowerCase().includes(q))&&(!status||x.status===status)&&(!year||String(x.graduation_year)===year));
 const renderers={alumni:alumniTable,jobs:jobsTable,news:newsTable,requests:requestsTable};
 U.qs('#admin-table').innerHTML=rows.length?renderers[view](rows):'<p class="empty">조건에 맞는 데이터가 없습니다.</p>';
 U.qs('#admin-pagination').hidden=!paged();U.qs('#admin-page').textContent=page+' / '+Math.max(1,Math.ceil(total/25));U.qs('#admin-prev').disabled=page<=1;U.qs('#admin-next').disabled=page*25>=total;
 if(!paged())U.qs('#admin-summary').textContent='검색 결과 '+rows.length+'건'+(['jobs','news'].includes(view)?' · 전체 승인 대기 '+data.filter(x=>x.status==='PENDING').length+'건':'');
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
   ui.renderBars(charts,'조회 상태 분포',ui.groupCounts(rows,x=>stateLabel(x.status)),{unit:'건',caption:paged()?'현재 표시 페이지 기준':'현재 검색 결과 기준'});
  }
 }

}
function filterChanged(){
 if(view==='overview')return;
 if(view==='alumni'){sequence++;directoryCriteria=null;clearResults();showSearchPrompt();st().hidden=true;return;}
 page=1;
 if(paged()){clearTimeout(debounce);debounce=setTimeout(load,250);}else if(!U.qs('#admin-table').hidden)render();
}
async function utility(action,button,question){if(!confirm(question))return;U.busy(button,true,'처리 중…');try{const r=await AlumniAPI.request(action,{method:'POST',data:{}});U.status(st(),r.message,'success');await load()}catch(e){U.status(st(),e.message,'error')}finally{U.busy(button,false)}}
window.AlumniAdminOnReady(()=>{
  U.yearOptions(U.qs('#admin-year'),true);
  const employment=U.qs('#admin-employment');
  employment.innerHTML='<option value="">전체 취업 상태</option>'+U.options.employmentStatus.map(x=>`<option value="${U.esc(x)}">${U.esc(x)}</option>`).join('');
  syncView();
  U.qs('#admin-close-content').onclick=()=>U.qs('#admin-content-dialog').close();
  U.qs('#admin-close-mail').onclick=()=>mailDialog().close();
  mailDialog().addEventListener('cancel',event=>{if(mailBusy)event.preventDefault()});
  U.qs('#admin-mail-all').onchange=event=>{groupInputs().forEach(x=>x.checked=event.target.checked);invalidatePreview()};
  groupInputs().forEach(x=>x.onchange=()=>{U.qs('#admin-mail-all').checked=groupInputs().every(y=>y.checked);invalidatePreview()});
  U.qs('#admin-preview-mail').onclick=previewMail;
  U.qs('#admin-confirm-mail').onclick=sendSelectedMail;
  // The Supabase Edge API checks portal_super_admin_allowed() on every action.
  
  
  U.qs('#admin-logout').addEventListener('click',()=>{
    window.location.assign("../index.html");
  });
  Promise.resolve(window.alumniPortalReady).then(()=>load()).catch(err=>{
    U.status(st(),String(err?.message||"포털 관리자 로그인이 필요합니다."),"error");
  });
  U.qs('#admin-search-form').onsubmit=e=>{e.preventDefault();if(directoryMode())searchDirectory();else{page=1;load();}};
  U.qs('#admin-reset-search').onclick=()=>{clearFilters();filterChanged();};
  U.qs('#admin-overview-refresh').onclick=()=>load();
  U.qs('#admin-prev').onclick=()=>{if(page>1){page--;load();}};
  U.qs('#admin-next').onclick=()=>{if(page*25<total){page++;load();}};
  filterSelectors.forEach(selector=>U.qs(selector).addEventListener(selector==='#admin-query'?'input':'change',filterChanged));
  U.qsa('[data-view]').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
  document.addEventListener('alumni-admin-content-created',e=>{if(view==='overview'||view===e.detail)load();else switchView(e.detail);});
  U.qs('#admin-app').addEventListener('click',e=>{const b=e.target.closest('button[data-open-view]');if(b)switchView(b.dataset.openView);});
  U.qs('#send-consent-invites').onclick=e=>utility('adminSendCareerConsentInvites',e.currentTarget,'채용메일 수신 여부가 미설정인 졸업생에게 안내 메일을 1회 발송할까요?');U.qs('#send-news-consent-invites').onclick=e=>utility('adminSendNewsConsentInvites',e.currentTarget,'동문소식 수신 여부가 미설정인 졸업생에게 안내 메일을 1회 발송할까요?');U.qs('#run-job-digest').onclick=()=>U.qs('[data-view=jobs]').click();const handleRecordAction=async e=>{const b=e.target.closest('button[data-action]');if(!b)return;const action=b.dataset.action,job=!!b.dataset.jobId;
 if(['review','mail'].includes(action)){const records=view==='overview'?(overviewResults?.[job?'jobs':'news']?.rows||[]):data;const item=records.find(x=>job?String(x.job_id)===b.dataset.jobId:String(x.news_id)===b.dataset.newsId);if(item){if(action==='review')showContent(item,job);else openMail(item,job)}return}
 if(!confirm(action.endsWith('Publish')?'등록 정보를 승인·공개할까요? 메일은 자동으로 발송되지 않습니다.':action.endsWith('Reject')?'이 등록을 반려할까요?':'이 상태로 변경하시겠습니까?'))return;U.busy(b,true);try{if(b.dataset.action==='followup'){const row=b.closest('tr');await rpc('admin_alumni_request_followup',{p_request_id:b.dataset.contactId,p_state:row.querySelector('[data-followup-state]').value,p_note:row.querySelector('[data-followup-note]').value});U.status(st(),'후속 조치를 저장했습니다.','success');await load();return;}const payload={};if(b.dataset.jobId)payload.job_id=b.dataset.jobId;else if(b.dataset.newsId)payload.news_id=b.dataset.newsId;else payload.alumni_id=b.dataset.id;const r=await AlumniAPI.request(b.dataset.action,{method:'POST',data:payload});U.status(st(),r.message||'처리되었습니다.','success');await load()}catch(err){U.status(st(),err.message,'error')}finally{U.busy(b,false)}};
  U.qs('#admin-table').onclick=handleRecordAction;U.qs('#admin-overview-content').onclick=handleRecordAction;
})})();

(function(){'use strict';const U=AlumniUI,st=()=>U.qs('#admin-status');let alumniLoaded=false;
function payload(form){const out=Object.fromEntries(new FormData(form).entries());form.querySelectorAll('input[type="checkbox"]').forEach(x=>out[x.name]=x.checked);return out}
async function loadAlumniOptions(){if(alumniLoaded)return;const rows=(await AlumniAPI.request('adminList',{method:'POST',data:{view:'alumni'}})).data||[];const approved=rows.filter(x=>x.status==='APPROVED').sort((a,b)=>String(a.name).localeCompare(String(b.name),'ko'));const html='<option value="">졸업생 선택</option>'+approved.map(x=>`<option value="${U.esc(x.alumni_id)}">${U.esc(x.name)} · ${U.esc(x.graduation_year)}년 졸업${x.company?' · '+U.esc(x.company):''}</option>`).join('');U.qsa('[data-admin-alumni]').forEach(x=>x.innerHTML=html);alumniLoaded=true}
async function openPanel(selector){try{await loadAlumniOptions();U.qsa('.admin-create-panel').forEach(x=>x.hidden=true);const panel=U.qs(selector);panel.hidden=false;panel.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){U.status(st(),e.message,'error')}}
async function submit(form,action,confirmText){if(!confirm(confirmText))return;const button=form.querySelector('button[type="submit"]');U.busy(button,true,'게시 중…');try{const r=await AlumniAPI.request(action,{method:'POST',data:payload(form)});U.status(st(),r.message,'success');form.reset();form.closest('.admin-create-panel').hidden=true;document.dispatchEvent(new CustomEvent('alumni-admin-content-created',{detail:action==='adminCreateJob'?'jobs':'news'}))}catch(e){U.status(st(),e.message,'error')}finally{U.busy(button,false)}}
window.AlumniAdminOnReady(()=>{U.qs('#show-admin-job-form').onclick=()=>openPanel('#admin-job-create');U.qs('#show-admin-news-form').onclick=()=>openPanel('#admin-news-create');U.qsa('[data-close-create]').forEach(x=>x.onclick=()=>x.closest('.admin-create-panel').hidden=true);U.qs('#admin-job-form').onsubmit=e=>{e.preventDefault();submit(e.currentTarget,'adminCreateJob','입력한 채용공고를 승인 상태로 바로 게시할까요?')};U.qs('#admin-news-form').onsubmit=e=>{e.preventDefault();submit(e.currentTarget,'adminCreateNews','동문소식을 게시할까요? 메일 발송은 별도로 진행됩니다.')};const type=U.qs('#admin-news-type'),rel=U.qs('#admin-news-relationship'),relField=U.qs('#admin-news-relationship-field');type.onchange=()=>{const obituary=type.value==='OBITUARY';relField.hidden=!obituary;rel.required=obituary;if(!obituary)rel.value=''};const always=U.qs('#admin-job-form').elements.always_open,deadline=U.qs('#admin-job-deadline');always.onchange=()=>{deadline.disabled=always.checked;deadline.required=!always.checked;if(always.checked)deadline.value=''};deadline.required=true})})();
