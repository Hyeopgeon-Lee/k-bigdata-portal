// Official certification schedules share the existing department calendar.
// The database records are the source of truth for both calendar and email reminders.
// Only the SUPER ADMIN may publish or amend official dates.
const names={engineer:'정보처리기사',industrial:'정보처리산업기사',sqld:'SQLD'};
const eventNames={
 written_registration:'필기 원서접수',written_exam:'필기시험',written_result:'필기 합격발표',
 practical_registration:'실기 원서접수',practical_exam:'실기시험',final_result:'최종 합격발표',
 registration:'원서접수',exam:'시험',result:'합격발표'
};
const labels={
 engineer:[['written_registration','필기 원서접수'],['written_exam','필기시험'],['written_result','필기 합격발표'],['practical_registration','실기 원서접수'],['practical_exam','실기시험'],['final_result','최종 합격발표']],
 industrial:[['written_registration','필기 원서접수'],['written_exam','필기시험'],['written_result','필기 합격발표'],['practical_registration','실기 원서접수'],['practical_exam','실기시험'],['final_result','최종 합격발표']],
 sqld:[['registration','원서접수'],['exam','시험'],['result','합격발표']]
};
const officialHome={engineer:'https://www.q-net.or.kr/',industrial:'https://www.q-net.or.kr/',sqld:'https://www.dataq.or.kr/www/accept/schedule.do'};
const dom=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
const koreaToday=()=>new Date(Date.now()+9*3600000).toISOString().slice(0,10);
function asCalendarEvent(row){
 return {
  id:'cert-'+row.id.replaceAll('-',''),
  title:'['+names[row.certificate_code]+'] '+row.exam_year+'년 '+row.exam_round+'회 '+eventNames[row.event_type],
  category:'certificate',
  startDate:row.start_date,
  endDate:row.end_date,
  targetGrade:'all',
  startTime:'',
  published:true,
  important:row.event_type.includes('registration'),
  url:row.official_url,
  description:(row.source_type==='manual'?'관리자 등록':'공식 자료 자동 동기화')+' · 변경사항은 공식 사이트에서 확인하세요.',
  source:'certification'
 };
}
export function initCertificationSchedule({onEvents}){
 let active=false,admin=false,allRows=[],editingId=null,loading=null;
 const getApi=()=>window.portalSupabaseClient;
 const status=document.querySelector('#schedule-sync-status');
 let adminRoot=null;
 const setStatus=(s)=>{if(adminRoot)adminRoot.querySelector('[data-cert-status]').textContent=s;};
 async function fetchEvents(){
  if(loading)return loading;
  const api=getApi();
  if(!api||!window.portalLearning?.read)return;
  loading=(async()=>{
   const {data,error}=await api.from('certification_exam_schedules')
    .select('id,certificate_code,exam_year,exam_round,event_type,start_date,end_date,official_url,published,source_type,source_synced_at,manual_override')
    .order('start_date',{ascending:true});
   if(error)throw error;
   allRows=data||[];
   onEvents(allRows.filter(row=>row.published).map(asCalendarEvent));
   if(admin)renderAdminList();
   return allRows;
  })();
  try{return await loading;}
  catch(error){
   console.error('Official certification schedule unavailable',error?.code||'unknown');
   if(status)status.dataset.certificationSync='failed';
   setStatus('자격증 공식 일정을 불러오지 못했습니다. 새로고침해 주세요.');
  }finally{loading=null;}
 }
 function field(name){return adminRoot.querySelector('[name="'+name+'"]');}
 function updateEventType(){
  const code=field('certificate_code').value;
  const select=field('event_type'),previous=select.value;
  select.replaceChildren();
  for(const [value,label] of labels[code]){const option=new Option(label,value);select.append(option);}
  if(labels[code].some(x=>x[0]===previous))select.value=previous;
  field('official_url').value=officialHome[code];
  field('exam_round').max=code==='sqld'?'200':'10';
 }
 function clearForm(){
  editingId=null;
  const f=adminRoot.querySelector('form');f.reset();
  field('exam_year').value=koreaToday().slice(0,4);
  field('start_date').value=koreaToday();
  field('end_date').value=koreaToday();
  field('published').checked=true;
  updateEventType();
  adminRoot.querySelector('[data-cert-save]').textContent='공식 일정 등록';
 }
 function renderAdminList(){
  if(!adminRoot)return;
  const root=adminRoot.querySelector('[data-cert-list]');root.replaceChildren();
  if(!allRows.length){root.append(dom('p','등록된 공식 자격증 일정이 없습니다.','schedule-empty'));return;}
  for(const row of [...allRows].sort((a,b)=>a.start_date.localeCompare(b.start_date)).slice(-80)){
   const item=dom('div',undefined,'schedule-event'),head=dom('div',undefined,'schedule-event-top');
   head.append(dom('strong',names[row.certificate_code]+' · '+row.exam_year+'년 '+row.exam_round+'회 · '+eventNames[row.event_type]));
   head.append(dom('span',row.published?'공개':'비공개','schedule-grade-badge'));
   const from=row.source_type==='qnet_api'?'자동 · Q-Net':
    row.source_type==='dataq_official'?'자동 · SQLD':'수동 등록';
   head.append(dom('span',from+(row.manual_override?' · 관리자 고정':''),'schedule-grade-badge'));
   item.append(head,dom('p',row.start_date+' ~ '+row.end_date,'schedule-event-time'));
   const buttons=dom('div',undefined,'schedule-event-actions');
   const edit=dom('button','수정','schedule-share-button');edit.type='button';
   edit.addEventListener('click',()=>{
    editingId=row.id;
    for(const key of ['certificate_code','exam_year','exam_round','start_date','end_date','official_url'])field(key).value=row[key];
    updateEventType();field('event_type').value=row.event_type;field('official_url').value=row.official_url;
    field('published').checked=row.published;
    adminRoot.querySelector('[data-cert-save]').textContent='공식 일정 수정';
    adminRoot.open=true;field('certificate_code').focus();
    setStatus('수정 중인 일정: '+names[row.certificate_code]+' '+row.exam_round+'회 '+eventNames[row.event_type]);
   });
   const automated=row.source_type!=='manual';
   const remove=dom('button',automated?'달력에서 숨기기':'삭제','schedule-delete-button');remove.type='button';
   remove.addEventListener('click',async()=>{
    const question=automated?'자동 연동 일정의 공개를 중단할까요? 다음 동기화에서도 다시 공개하지 않습니다.':
      '수동 등록 일정을 삭제할까요? 기존 발송 기록도 삭제됩니다.';
    if(!window.confirm(question))return;
    remove.disabled=true;
    const source=getApi().from('certification_exam_schedules');
    const {error}=automated
      ?await source.update({published:false,manual_override:true}).eq('id',row.id)
      :await source.delete().eq('id',row.id);
    if(error){setStatus('일정 변경 실패: 관리자 권한 또는 연결 상태를 확인해 주세요.');remove.disabled=false;return;}
    if(editingId===row.id)clearForm();
    await fetchEvents();setStatus(automated?'자동 일정의 공개를 중단했습니다.':'일정을 삭제했습니다.');
   });
   buttons.append(edit,remove);item.append(buttons);root.append(item);
  }
 }
 async function loadSyncSummary(){
  if(!adminRoot)return;
  const {data,error}=await getApi().from('certification_schedule_sync_runs')
   .select('source_type,source_year,status,inserted_events,updated_events,created_at')
   .order('created_at',{ascending:false}).limit(30);
  const node=adminRoot.querySelector('[data-sync-summary]');
  if(error){node.textContent='자동 연동 상태를 조회하지 못했습니다.';return;}
  const rows=data||[];
  const sqld=rows.find(x=>x.source_type==='dataq_official');
  const qnet=rows.find(x=>x.source_type==='qnet_api');
  const description=(record,label)=>{
    if(!record)return label+': 아직 실행 기록 없음';
    if(record.status==='missing_key')return label+': 공공데이터포털 API 인증키 설정 필요';
    if(record.status==='not_published')return label+': '+record.source_year+'년 일정 미발표';
    if(record.status!=='success')return label+': 공식 일정 연동 오류';
    const time=new Date(record.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'});
    return label+': 정상 ('+record.source_year+'년, 신규 '+record.inserted_events+'건 · 변경 '+record.updated_events+'건, '+time+')';
  };
  node.textContent=description(sqld,'SQLD')+' / '+description(qnet,'Q-Net');
 }
 function showAdminForm(){
  if(adminRoot)return;
  adminRoot=dom('details',undefined,'schedule-card schedule-registration');
  adminRoot.id='certification-official-schedules';
  adminRoot.innerHTML=String.raw`<summary>자격증 공식 일정 관리 · SUPER ADMIN</summary>
   <p>정보처리기사·산업기사는 Q-Net 공식 API, SQLD는 데이터자격검정 공식 표에서 매일 확인해 자동 등록합니다. 공개된 접수 시작일에는 대상 재학생에게만 자동 메일이 발송됩니다.</p>
   <p data-sync-summary role="status" aria-live="polite">공식 일정 자동 동기화 상태를 확인 중입니다…</p>
   <form data-cert-form>
    <div class="schedule-register-grid">
     <label>자격증<select name="certificate_code"><option value="engineer">정보처리기사</option><option value="industrial">정보처리산업기사</option><option value="sqld">SQLD</option></select></label>
     <label>연도<input name="exam_year" type="number" min="2025" max="2100" required></label>
     <label>회차<input name="exam_round" type="number" min="1" max="200" value="1" required></label>
     <label>일정 유형<select name="event_type" required></select></label>
     <div class="schedule-register-pair"><label>시작일<input name="start_date" type="date" required></label>
     <label>종료일<input name="end_date" type="date" required></label></div>
    </div>
    <label>공식 안내·접수 링크<input name="official_url" type="url" maxlength="500" required></label>
    <label class="schedule-all-day"><input name="published" type="checkbox" checked> 공식 일정 검증 완료 · 학과 달력에 공개</label>
    <div class="schedule-register-actions"><button data-cert-save type="submit">공식 일정 등록</button><button data-cert-reset type="button">입력 초기화</button></div>
    <p role="status" aria-live="polite" data-cert-status></p>
   </form><h3>등록된 자격증 일정</h3><div data-cert-list></div>`;
  const toolbar=document.querySelector('.schedule-toolbar');
  toolbar.parentNode.insertBefore(adminRoot,toolbar);
  field('certificate_code').addEventListener('change',updateEventType);
  field('start_date').addEventListener('change',()=>{
   if(field('end_date').value<field('start_date').value)field('end_date').value=field('start_date').value;
  });
  adminRoot.querySelector('[data-cert-reset]').addEventListener('click',clearForm);
  adminRoot.querySelector('[data-cert-form]').addEventListener('submit',async event=>{
   event.preventDefault();
   const start=field('start_date').value,end=field('end_date').value;
   if(end<start){setStatus('종료일은 시작일보다 빠를 수 없습니다.');return;}
   const payload={};
   for(const key of ['certificate_code','event_type','start_date','end_date','official_url'])payload[key]=field(key).value.trim();
   payload.exam_year=Number(field('exam_year').value);
   payload.exam_round=Number(field('exam_round').value);
   payload.published=field('published').checked;
   // Explicit administrator edits take precedence over subsequent automatic source updates.
   if(editingId){
     const original=allRows.find(x=>x.id===editingId);
     if(original&&original.source_type!=='manual')payload.manual_override=true;
   }
   const url=new URL(payload.official_url);
   if(url.protocol!=='https:'){setStatus('공식 링크는 HTTPS만 허용합니다.');return;}
   const button=adminRoot.querySelector('[data-cert-save]');button.disabled=true;
   setStatus('저장 중입니다…');
   try{
    const api=getApi();
    const response=editingId
     ?await api.from('certification_exam_schedules').update(payload).eq('id',editingId).select('id').single()
     :await api.from('certification_exam_schedules').insert(payload).select('id').single();
    if(response.error)throw response.error;
    clearForm();await fetchEvents();
    setStatus('자격증 일정을 저장했습니다. 공개된 일정은 기존 학과 달력에 표시됩니다.');
   }catch(error){
    setStatus(error?.code==='23505'?'이미 같은 자격증·연도·회차·유형의 일정이 있습니다. 기존 항목을 수정해 주세요.':'저장하지 못했습니다. 공식 일정 정보와 관리자 권한을 확인해 주세요.');
   }finally{button.disabled=false;}
  });
  clearForm();renderAdminList();
 }
 async function bootstrap(){
  if(active||!getApi()||!window.portalLearning?.read)return;
  active=true;
  const api=getApi();
  try{
   const {data,error}=await api.rpc('portal_super_admin_allowed');
   admin=!error&&data===true;
   if(admin){showAdminForm();await loadSyncSummary();}
   await fetchEvents();
   window.setInterval(()=>{if(!document.hidden){fetchEvents();if(admin)loadSyncSummary();}},10*60*1000);
  }catch(error){console.error('Certification schedule bootstrap failed',error?.code||'unknown');}
 }
 window.addEventListener('portal-learning-ready',bootstrap);
 if(window.portalLearning?.read)bootstrap();
}
