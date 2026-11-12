/* Administrator-only verification and summary of student certificates. */
const api=window.portalSupabaseClient;
if(window.portalAdminAllowed!==true||!api)throw Error("ADMIN_SESSION_REQUIRED");
const el=id=>document.getElementById(id);
const make=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(className)n.className=className;return n;};
const readableDate=value=>value?String(value).replaceAll('-','.'):'-';
const pill=(text,kind)=>make('span',text,'cert-badge'+(kind?' is-'+kind:''));
const button=(text,action,id)=>{const b=make('button',text,'cert-secondary');b.type='button';b.dataset.action=action;b.dataset.id=id;return b;};
const message=(id,text,kind='info')=>{const n=el(id);if(n){n.textContent=text;n.dataset.kind=kind;}};
const todayInKorea=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let all=[],profileById=new Map(),admin=true;
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

el('cert-admin-panel').hidden=false;
for(const id of ['cert-admin-search','cert-admin-grade','cert-admin-status'])
 el(id).addEventListener(id==='cert-admin-search'?'input':'change',renderAdmin);
el('cert-export').addEventListener('click',exportCSV);
el('cert-admin-list').addEventListener('click',async event=>{
 const b=event.target.closest('button[data-action]');if(!b)return;
 const entry=all.find(x=>x.id===b.dataset.id);if(!entry)return;
 const card=b.closest('.cert-item'),note=card.querySelector('.cert-admin-note').value.trim();
 const next={verify:'verified',reject:'rejected',pending:'pending'}[b.dataset.action];if(!next)return;
 if(!window.confirm(entry.certificate_name+' 기록의 확인 상태를 변경할까요?'))return;
 b.disabled=true;message('cert-admin-message','확인 상태 저장 중입니다.');
 const {error}=await api.from('student_certifications')
  .update({verification_status:next,verification_note:next==='pending'?'':note}).eq('id',entry.id);
 if(error){message('cert-admin-message','확인 상태를 저장하지 못했습니다.','error');b.disabled=false;return;}
 try{await loadAdmin();}catch(err){message('cert-admin-message','저장했지만 목록 갱신에 실패했습니다.','error');}
});
try{await loadAdmin();}
catch(error){console.error('Certificate admin query',error?.code||'unknown');message('cert-admin-message','관리자 목록을 불러오지 못했습니다.','error');}
