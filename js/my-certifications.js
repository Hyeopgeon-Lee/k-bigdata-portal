// Self-reported qualifications; Supabase RLS and database trigger enforce ownership/review.
const api=globalThis.portalSupabaseClient;
const el=id=>document.getElementById(id);
const make=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(className)n.className=className;return n;};
const choices=[
  {code:'engineer',name:'정보처리기사',category:'국가기술자격',twoStage:true},
  {code:'industrial',name:'정보처리산업기사',category:'국가기술자격',twoStage:true},
  {code:'bigdata',name:'빅데이터분석기사',category:'국가기술자격',twoStage:true},
  {code:'office',name:'사무자동화산업기사',category:'국가기술자격',twoStage:true},
  {code:'computer',name:'컴퓨터활용능력 1급',category:'국가기술자격',twoStage:true},
  {code:'word',name:'워드프로세서',category:'국가기술자격',twoStage:true},
  {code:'nca',name:'NAVER CLOUD NCA',category:'클라우드',twoStage:false},
  {code:'ncp',name:'NAVER CLOUD NCP Professional',category:'클라우드',twoStage:false},
  {code:'nce',name:'NAVER CLOUD NCE Expert',category:'클라우드',twoStage:false},
  {code:'cka',name:'CKA',category:'클라우드',twoStage:false},
  {code:'aws',name:'AWS 자격증',category:'클라우드',twoStage:false},
  {code:'sqld',name:'SQLD (SQL 개발자)',category:'데이터·DB',twoStage:false},
  {code:'sqlp',name:'SQLP (SQL 전문가)',category:'데이터·DB',twoStage:false},
  {code:'adsp',name:'ADsP (데이터분석 준전문가)',category:'데이터·DB',twoStage:false},
  {code:'adp',name:'ADP (데이터분석 전문가)',category:'데이터·DB',twoStage:false},
  {code:'linux',name:'리눅스마스터 1급',category:'기타 IT',twoStage:true},
  {code:'network',name:'네트워크관리사 2급',category:'기타 IT',twoStage:true},
  {code:'other',name:'기타 자격증 (직접 입력)',category:'기타 IT',twoStage:false}
];
let user=null,own=[],all=[],profileById=new Map(),editingId=null,admin=false;
const findChoice=code=>choices.find(x=>x.code===code);
const readableDate=value=>value?String(value).replaceAll('-','.'):'-';
function message(id,text,kind='info'){const n=el(id);if(n){n.textContent=text;n.dataset.kind=kind;}}
function todayInKorea(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function pill(text,kind){const n=make('span',text,'cert-badge'+(kind?' is-'+kind:''));return n;}
function button(text,action,id){const b=make('button',text,'cert-secondary');b.type='button';b.dataset.action=action;b.dataset.id=id;return b;}
function fillOptions(){
  const select=el('cert-code');
  let prev='',group=null;
  for(const c of choices){
    if(c.category!==prev){group=document.createElement('optgroup');group.label=c.category;select.append(group);prev=c.category;}
    group.append(new Option(c.name,c.code));
  }
}
function currentStage(){return document.querySelector('input[name="cert-stage"]:checked')?.value||'final';}
function syncForm(){
  const code=el('cert-code').value;
  const choice=findChoice(code);
  const two=Boolean(choice?.twoStage);
  el('cert-other-wrap').hidden=code!=='other';
  el('cert-other-name').required=code==='other';
  el('cert-written-option').hidden=!two;
  if(!two&&currentStage()==='written')document.querySelector('input[name="cert-stage"][value="final"]').checked=true;
  const written=currentStage()==='written';
  el('cert-date-label').textContent=written?'필기합격일 *':'최종합격일 *';
  el('cert-number').disabled=written;
  if(written)el('cert-number').value='';
}
function resetForm(){
  editingId=null;
  el('cert-form').reset();
  el('cert-date').value='';
  el('cert-save').textContent='자격증 등록';
  el('cert-cancel').hidden=true;
  el('cert-form-heading').textContent='자격증 등록';
  message('cert-form-message','');
  syncForm();
}
function startEdit(item){
  editingId=item.id;
  el('cert-code').value=item.certificate_code;
  el('cert-other-name').value=item.certificate_code==='other'?item.certificate_name:'';
  document.querySelector('input[name="cert-stage"][value="'+item.pass_status+'"]').checked=true;
  syncForm();
  el('cert-date').value=item.pass_status==='written'?(item.written_pass_date||''):(item.final_pass_date||'');
  el('cert-number').value=item.certificate_number||'';
  el('cert-save').textContent='변경사항 저장';
  el('cert-cancel').hidden=false;
  el('cert-form-heading').textContent='자격증 수정';
  message('cert-form-message','필기합격에서 최종합격으로 변경할 때는 새로운 최종합격일을 선택하세요.');
  el('cert-form').scrollIntoView({behavior:'smooth',block:'start'});
  el('cert-code').focus();
}
function renderOwn(){
  el('cert-count-final').textContent=own.filter(x=>x.pass_status==='final').length+'건';
  el('cert-count-written').textContent=own.filter(x=>x.pass_status==='written').length+'건';
  el('cert-count-verified').textContent=own.filter(x=>x.verification_status==='verified').length+'건';
  const box=el('cert-list');box.replaceChildren();
  if(!own.length){box.append(make('p','등록된 자격증이 없습니다. 왼쪽에서 첫 자격증을 등록해 주세요.','cert-empty'));return;}
  for(const c of own){
    const card=make('article',undefined,'cert-item'),head=make('div',undefined,'cert-item-head');
    const title=make('div',c.certificate_name,'cert-item-title'),badges=make('div',undefined,'cert-badges');
    badges.append(pill(c.pass_status==='written'?'필기합격':'최종합격',c.pass_status==='final'?'final':''),pill(
      ({pending:'확인대기',verified:'확인완료',rejected:'반려'})[c.verification_status]||'확인대기',
      c.verification_status==='verified'?'verified':c.verification_status==='rejected'?'rejected':''));
    head.append(title,badges);
    const date=c.pass_status==='written'?c.written_pass_date:c.final_pass_date;
    card.append(head,make('div','합격일 '+readableDate(date)+(c.certificate_number?' · 자격번호 '+c.certificate_number:''),'cert-item-meta'));
    if(c.pass_status==='written')card.append(make('p','실기 합격 후 「수정」에서 최종합격으로 변경하세요.','cert-hint'));
    if(c.verification_status==='rejected'&&c.verification_note)card.append(make('p','관리자 확인 의견: '+c.verification_note,'cert-hint'));
    const actions=make('div',undefined,'cert-item-actions');
    actions.append(button('수정','edit',c.id),button('삭제','delete',c.id));
    card.append(actions);box.append(card);
  }
}
async function loadOwn(){
  const {data,error}=await api.from('student_certifications').select('*').eq('user_id',user.id).order('created_at',{ascending:false});
  if(error)throw error;
  own=data||[];
  renderOwn();
}
async function save(event){
  event.preventDefault();
  const form=el('cert-form'),saveButton=el('cert-save');
  const code=el('cert-code').value,choice=findChoice(code),stage=currentStage(),date=el('cert-date').value;
  const name=code==='other'?el('cert-other-name').value.trim():choice?.name;
  if(!choice||!name||name.length<2||name.length>120){message('cert-form-message','자격증을 정확히 선택하거나 이름을 입력해 주세요.','error');return;}
  if(stage==='written'&&!choice.twoStage){message('cert-form-message','해당 자격증은 최종합격으로 등록해 주세요.','error');return;}
  if(!date||date>todayInKorea()){message('cert-form-message','오늘 이전의 올바른 합격일을 선택해 주세요.','error');return;}
  const previous=own.find(x=>x.id===editingId);
  const duplicate=own.some(x=>x.id!==editingId&&x.certificate_code===code&&x.certificate_name.trim().toLowerCase()===name.toLowerCase());
  if(duplicate){message('cert-form-message','이미 등록된 자격증입니다. 기존 기록을 수정해 주세요.','error');return;}
  const payload={
    certificate_code:code,certificate_name:name,pass_status:stage,
    written_pass_date:stage==='written'?date:(previous?.certificate_code===code?previous.written_pass_date:null),
    final_pass_date:stage==='final'?date:null,
    certificate_number:stage==='final'?(el('cert-number').value.trim()||null):null
  };
  saveButton.disabled=true;message('cert-form-message','저장 중입니다.');
  try{
    const result=editingId
      ?await api.from('student_certifications').update(payload).eq('id',editingId).eq('user_id',user.id).select('id').single()
      :await api.from('student_certifications').insert({...payload,user_id:user.id}).select('id').single();
    if(result.error)throw result.error;
    resetForm();await loadOwn();
    message('cert-page-message','자격증 정보를 저장했습니다. 관리자 확인 전까지 확인대기로 표시됩니다.','success');
    if(admin)await loadAdmin();
  }catch(error){
    console.error('Certificate save failed',error?.code||'unknown');
    message('cert-form-message',error?.code==='23505'?'이미 등록된 자격증입니다. 기존 기록을 수정해 주세요.':'저장하지 못했습니다. 다시 시도해 주세요.','error');
  }finally{saveButton.disabled=false;}
}
async function deleteOwn(item){
  if(!confirm('「'+item.certificate_name+'」 기록을 삭제할까요? 삭제한 기록은 복구할 수 없습니다.'))return;
  message('cert-page-message','삭제 중입니다.');
  const {error}=await api.from('student_certifications').delete().eq('id',item.id).eq('user_id',user.id);
  if(error){message('cert-page-message','삭제하지 못했습니다. 다시 시도해 주세요.','error');return;}
  if(editingId===item.id)resetForm();
  await loadOwn();if(admin)await loadAdmin();
  message('cert-page-message','삭제했습니다.','success');
}
function studentInfo(id){
  const p=profileById.get(id)||{};
  const grade=['graduated','early_employment'].includes(p.enrollment_status)?(p.enrollment_status==='graduated'?'졸업':'조기취업'):[1,2].includes(Number(p.academic_year))?p.academic_year+'학년':'학년 미설정';
  return {name:p.full_name||'이름 미확인',student:p.student_no||'',grade};
}
function filteredAdmin(){
  const query=el('cert-admin-search').value.trim().toLowerCase();
  const grade=el('cert-admin-grade').value,status=el('cert-admin-status').value;
  return all.filter(c=>{
    const p=profileById.get(c.user_id)||{};
    const info=studentInfo(c.user_id);
    if(query&&![info.name,info.student,c.certificate_name].some(v=>String(v).toLowerCase().includes(query)))return false;
    if(status&&c.verification_status!==status)return false;
    if(grade==='graduate'&&!['graduated','early_employment'].includes(p.enrollment_status))return false;
    if(['1','2'].includes(grade)&&(String(p.academic_year)!==grade||!['enrolled','leave'].includes(p.enrollment_status)))return false;
    return true;
  });
}
function renderAdmin(){
  if(!admin)return;
  const panel=el('cert-admin-stats');panel.replaceChildren();
  for(const [label,count] of [
    ['전체 등록',all.length],
    ['확인대기',all.filter(x=>x.verification_status==='pending').length],
    ['확인완료 최종합격',all.filter(x=>x.verification_status==='verified'&&x.pass_status==='final').length]
  ]){
    const article=make('article');article.append(make('span',label),make('strong',count+'건'));panel.append(article);
  }
  const records=filteredAdmin(),list=el('cert-admin-list');list.replaceChildren();
  if(!records.length)list.append(make('p','검색 조건에 해당하는 등록 내용이 없습니다.','cert-empty'));
  for(const c of records){
    const info=studentInfo(c.user_id),card=make('article',undefined,'cert-item');
    const head=make('div',undefined,'cert-item-head'),badges=make('div',undefined,'cert-badges');
    head.append(make('strong',info.name+' · '+info.grade,'cert-item-title'));
    badges.append(pill(c.pass_status==='written'?'필기합격':'최종합격',c.pass_status==='final'?'final':''),pill(
      ({pending:'확인대기',verified:'확인완료',rejected:'반려'})[c.verification_status],c.verification_status==='verified'?'verified':c.verification_status==='rejected'?'rejected':''));
    head.append(badges);card.append(head);
    card.append(make('div',info.student+' · '+c.certificate_name+' · '+readableDate(c.pass_status==='written'?c.written_pass_date:c.final_pass_date),'cert-item-meta'));
    const note=make('input');note.className='cert-admin-note';note.maxLength=500;note.placeholder='관리자 확인 의견 (선택)';note.value=c.verification_note||'';note.setAttribute('aria-label',info.name+' '+c.certificate_name+' 관리자 확인 의견');
    card.append(note);
    const actions=make('div',undefined,'cert-item-actions');
    actions.append(button('확인완료','verify',c.id),button('반려','reject',c.id),button('확인대기로','pending',c.id));
    card.append(actions);list.append(card);
  }
  const grouped=new Map();
  for(const c of all.filter(x=>x.pass_status==='final'&&x.verification_status==='verified')){
    if(!grouped.has(c.certificate_name))grouped.set(c.certificate_name,new Set());
    grouped.get(c.certificate_name).add(c.user_id);
  }
  const byType=el('cert-admin-by-type');byType.replaceChildren();
  if(!grouped.size)byType.append(make('p','확인완료된 최종합격 기록이 없습니다.','cert-empty'));
  else for(const [name,users] of [...grouped.entries()].sort((a,b)=>b[1].size-a[1].size)){
    const r=make('div',undefined,'cert-item cert-item-head');r.append(make('strong',name,'cert-item-title'),make('span',users.size+'명','cert-item-meta'));byType.append(r);
  }
  message('cert-admin-message','등록 '+all.length+'건 중 '+records.length+'건 표시 · 통계는 관리자 확인완료 건을 별도 집계합니다.');
}
async function loadAdmin(){
  if(!admin)return;
  const [students,certs]=await Promise.all([
    api.rpc('admin_list_students'),
    api.from('student_certifications').select('*').order('created_at',{ascending:false}).limit(1000)
  ]);
  if(students.error||certs.error)throw students.error||certs.error;
  profileById=new Map((students.data||[]).map(p=>[p.user_id,p]));
  all=certs.data||[];
  renderAdmin();
}
function csvCell(value){
  let text=String(value??'');
  if(/^[=+\-@\t\r]/.test(text))text="'"+text;
  return '"'+text.replaceAll('"','""')+'"';
}
function exportCSV(){
  const headers=['이름','학번','학년','자격증','합격구분','필기합격일','최종합격일','자격번호','확인상태','관리자의견'];
  const values=filteredAdmin().map(c=>{
    const s=studentInfo(c.user_id);
    return [s.name,s.student,s.grade,c.certificate_name,c.pass_status==='written'?'필기합격':'최종합격',c.written_pass_date||'',c.final_pass_date||'',c.certificate_number||'',({pending:'확인대기',verified:'확인완료',rejected:'반려'})[c.verification_status],c.verification_note||''];
  });
  const blob=new Blob(['\ufeff'+[headers,...values].map(row=>row.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob),anchor=document.createElement('a');
  anchor.href=url;anchor.download='student-certifications-'+todayInKorea()+'.csv';document.body.append(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function start(){
  if(!api||!globalThis.portalLearning?.read){message('cert-page-message','포털 로그인 상태를 확인할 수 없습니다.','error');return;}
  const {data:{user:active},error:authError}=await api.auth.getUser();
  if(authError||!active){message('cert-page-message','로그인 세션을 확인할 수 없습니다.','error');return;}
  user=active;fillOptions();resetForm();
  el('cert-date').max=todayInKorea();
  el('cert-code').addEventListener('change',()=>{syncForm();el('cert-date').value='';});
  for(const r of document.querySelectorAll('input[name="cert-stage"]'))r.addEventListener('change',()=>{syncForm();el('cert-date').value='';});
  el('cert-cancel').addEventListener('click',resetForm);
  el('cert-form').addEventListener('submit',event=>{void save(event);});
  el('cert-list').addEventListener('click',event=>{
    const b=event.target.closest('button[data-action]');if(!b)return;
    const item=own.find(x=>x.id===b.dataset.id);if(!item)return;
    if(b.dataset.action==='edit')startEdit(item);
    if(b.dataset.action==='delete')void deleteOwn(item);
  });
  try{await loadOwn();message('cert-page-message','자격증 기록을 불러왔습니다.');}
  catch(error){console.error('Own qualifications query',error?.code||'unknown');message('cert-page-message','자격증 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.','error');}
  const {data:isAdmin,error:adminError}=await api.rpc('portal_super_admin_allowed');
  admin=!adminError&&isAdmin===true;
  if(!admin)return;
  el('cert-admin-panel').hidden=false;
  for(const id of ['cert-admin-search','cert-admin-grade','cert-admin-status'])el(id).addEventListener(id==='cert-admin-search'?'input':'change',renderAdmin);
  el('cert-export').addEventListener('click',exportCSV);
  el('cert-admin-list').addEventListener('click',async event=>{
    const b=event.target.closest('button[data-action]');if(!b)return;
    const entry=all.find(x=>x.id===b.dataset.id);
    if(!entry)return;
    const card=b.closest('.cert-item'),note=card.querySelector('.cert-admin-note').value.trim();
    const next={verify:'verified',reject:'rejected',pending:'pending'}[b.dataset.action];
    if(!next)return;
    b.disabled=true;message('cert-admin-message','확인 상태 저장 중입니다.');
    const {error}=await api.from('student_certifications')
      .update({verification_status:next,verification_note:next==='pending'?'':note}).eq('id',entry.id);
    if(error){message('cert-admin-message','확인 상태를 저장하지 못했습니다.','error');b.disabled=false;return;}
    try{await loadAdmin();await loadOwn();}
    catch(err){message('cert-admin-message','저장했지만 목록 갱신에 실패했습니다. 새로고침해 주세요.','error');}
  });
  try{await loadAdmin();}
  catch(error){console.error('Qualification admin listing',error?.code||'unknown');message('cert-admin-message','관리자 목록을 불러오지 못했습니다. 계정 권한을 확인해 주세요.','error');}
}
await start();
