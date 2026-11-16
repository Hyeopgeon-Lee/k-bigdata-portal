/* Supabase-backed private Help Desk. Access is always enforced server-side by RLS. */
const api=window.portalSupabaseClient;
const el=id=>document.getElementById(id);
const say=(message)=>{el('help-feedback').textContent=message;};
const statusText={RECEIVED:'접수',CHECKING:'확인 중',PROCESSING:'처리 중',COMPLETED:'완료'};
const categories=['PC·실습실 장애','소프트웨어 설치·오류','네트워크·인터넷','시설·비품','수업 관련','프로젝트 지원','취업·진로 문의','학과 운영 건의','학습문제 오류 신고','기타'];
const locations=['8311호','8315호','8316호','8317호','8318호','8319호','8320호','온라인 포털','기타'];
function node(tag,text,cls){
 const n=document.createElement(tag);
 if(text!==undefined && text!==null)n.textContent=String(text);
 if(cls)n.className=cls;
 return n;
}
function input(name,label,value,maxlength){
 const wrap=node('label',label,'help-field');
 const field=document.createElement('input');
 field.name=name;field.value=value||'';
 if(maxlength)field.maxLength=maxlength;
 wrap.append(field);return {wrap,field};
}
function options(values,selected){
 const select=document.createElement('select');
 for(const value of values){
  const option=document.createElement('option');
  option.value=value;option.textContent=statusText[value]||value;select.append(option);
 }
 if(selected)select.value=selected;
 return select;
}
function readableDate(raw){const d=new Date(raw);return Number.isNaN(d.getTime())?'':d.toLocaleString('ko-KR');}
let user=null,admin=true,writer=false,activeTab='admin',cached=[];
function tab(name){
 activeTab=name;
 for(const btn of document.querySelectorAll('[data-help-tab]')){
  const selected=btn.dataset.helpTab===name;
  btn.setAttribute('aria-selected',String(selected));
 }
 for(const panel of document.querySelectorAll('[data-help-panel]'))panel.hidden=panel.dataset.helpPanel!==name;
 if(name==='my')loadRequests(false);
 if(name==='admin')loadRequests(true);
 if(name==='notice')loadNotifications();
}
function card(request){
 const article=node('article',null,'help-ticket');
 const heading=node('div',null,'help-ticket-heading');
 const title=node('strong',request.title);
 const badge=node('span',statusText[request.status]||request.status,'help-status');
 const meta=node('p',readableDate(request.created_at)+' · '+request.category+' · '+request.location,'help-meta');
 heading.append(title,badge);
 const summary=document.createElement('details');
 summary.className='help-ticket-details';
 summary.append(node('summary','요청 내용 및 처리 내역 보기'));
 const body=node('div',null,'help-ticket-body');
 summary.append(body);
 let loading=false,loaded=false;
 summary.addEventListener('toggle',async()=>{
  if(!summary.open||loading||loaded)return;
  loading=true;body.replaceChildren(node('p','요청 내용을 불러오는 중...','help-meta'));
  const {data,error}=await api.from('help_requests')
   .select('content,admin_reply,legacy_student_name,legacy_student_no').eq('id',request.id).maybeSingle();
  loading=false;
  if(error||!data){body.replaceChildren(node('p','요청 상세를 불러오지 못했습니다. 다시 펼쳐 주세요.','help-meta'));return;}
  request.admin_reply=data.admin_reply;
  body.replaceChildren(node('p',data.content,'help-content'));
  if(request.legacy_request_id)body.append(node('p','기존 요청번호: '+request.legacy_request_id,'help-meta'));
  const identity=[data.legacy_student_name,data.legacy_student_no].filter(Boolean).join(' / ');
  if(identity)body.append(node('p','기존 작성자: '+identity+' (포털 계정 미연결)','help-meta'));
  if(data.admin_reply)body.append(node('div','관리자 답변: '+data.admin_reply,'help-reply'));
  const details=node('div',null,'help-extra');
  const open=node('button','대화·첨부파일 보기','help-secondary');open.type='button';
  open.addEventListener('click',()=>openDetail(request,details,open));
  body.append(open,details,adminEditor(request,badge));loaded=true;
 });
 article.append(heading,meta,summary);
 return article;
}
const mailLabels={
 sent:'요청자에게 처리 결과 메일이 발송되었습니다.',
 sending:'요청자에게 처리 결과 메일을 발송 중입니다.',
 queued:'메일 발송이 대기 중입니다. 발송을 다시 시도할 수 있습니다.',
 failed:'처리 결과는 저장됐지만 메일 발송에 실패했습니다. 다시 시도할 수 있습니다.',
 skipped:'현재 요청 상태에서는 메일을 발송하지 않습니다.',
 not_queued:'기존에 완료된 요청이거나 계정이 연결되지 않아 자동 메일 대상이 아닙니다.'
};
async function completionMail(request,mailHint,mailButton,action='send'){
 if(!request.owner_id){
  mailHint.textContent='요청자 포털 계정이 연결되지 않아 결과 메일을 발송하지 않습니다.';
  mailButton.hidden=true;
  return false;
 }
 mailButton.disabled=true;
 mailHint.textContent=action==='send'?'결과 메일 발송을 확인 중입니다.':'발송 상태를 확인 중입니다.';
 try{
  const {data,error}=await api.functions.invoke('help-completion-email',{
   body:{action,request_id:request.id}
  });
  if(error||!data?.ok)throw error||Error('MAIL_RESULT_NOT_AVAILABLE');
  const state=data.mailStatus;
  mailHint.textContent=mailLabels[state]||'메일 발송 상태를 확인하지 못했습니다.';
  mailButton.hidden=state==='not_queued'||state==='skipped';
  mailButton.textContent=state==='sent'?'발송 완료':'메일 다시 발송';
  mailButton.disabled=state==='sent'||state==='sending';
  return state==='sent';
 }catch(error){
  console.error('Help completion email:',error);
  mailHint.textContent='요청 처리 내용은 저장되었지만 메일 상태를 확인할 수 없습니다. 다시 시도해 주세요.';
  mailButton.disabled=false;
  return false;
 }
}
function adminEditor(request,badge){
 const panel=node('div',null,'help-editor');
 const label=node('label','처리 상태','help-field');
 const select=options(Object.keys(statusText),request.status);label.append(select);
 const replyLabel=node('label','관리자 처리 결과 · 완료 시 요청자에게 메일로 안내','help-field');
 const reply=document.createElement('textarea');reply.maxLength=3000;reply.rows=4;reply.value=request.admin_reply||'';
 replyLabel.append(reply);
 const button=node('button','처리 내용 저장','help-primary');button.type='button';
 const message=node('p','', 'help-inline-status');message.setAttribute('role','status');
 const mailHint=node('p','','help-inline-status');mailHint.setAttribute('role','status');
 const mailButton=node('button','결과 메일 확인·재시도','help-secondary');mailButton.type='button';
 mailButton.hidden=request.status!=='COMPLETED'||!request.owner_id;
 mailButton.onclick=()=>void completionMail(request,mailHint,mailButton,'send');
 if(request.status==='COMPLETED'){
  if(request.owner_id)void completionMail(request,mailHint,mailButton,'status');
  else mailHint.textContent='과거 요청 또는 작성자 계정이 연결되지 않아 메일을 발송할 수 없습니다.';
 }
 button.onclick=async()=>{
  const newStatus=select.value;
  const newReply=reply.value.trim();
  if(newStatus==='COMPLETED'&&!newReply){
   message.textContent='완료 처리하려면 요청자에게 전달할 처리 결과를 입력해 주세요.';
   reply.focus();return;
  }
  const oldStatus=request.status;
  button.disabled=true;message.textContent='요청 상태와 답변을 저장 중입니다...';
  try{
   const {data,error}=await api.from('help_requests').update({
    status:newStatus,admin_reply:newReply,updated_at:new Date().toISOString()
   }).eq('id',request.id).select('id').single();
   if(error||!data)throw error||Error('HELP_UPDATE_FAILED');
   request.status=newStatus;request.admin_reply=newReply;badge.textContent=statusText[newStatus]||newStatus;
   message.textContent='상태와 처리 결과를 저장했습니다.';
   mailButton.hidden=newStatus!=='COMPLETED'||!request.owner_id;
   if(newStatus==='COMPLETED'&&oldStatus!=='COMPLETED'){
    if(!request.owner_id)mailHint.textContent='작성자 포털 계정 미연결로 이메일은 발송하지 않습니다.';
    else await completionMail(request,mailHint,mailButton,'send');
   }else if(newStatus!=='COMPLETED'){
    mailHint.textContent='';
   }else if(oldStatus==='COMPLETED'){
    mailHint.textContent='기존 완료 건의 수정은 새 결과 메일을 자동 발송하지 않습니다.';
    if(request.owner_id)await completionMail(request,mailHint,mailButton,'status');
   }
  }catch(error){
   console.error('Help status save failed',error);
   message.textContent='저장 실패: 로그인 권한 또는 네트워크 상태를 확인해 주세요.';
  }finally{button.disabled=false;}
 };
 panel.append(label,replyLabel,button,message,mailHint,mailButton);
 return panel;
}
async function openDetail(request,target,button){
 button.disabled=true;target.replaceChildren(node('p','불러오는 중...','help-meta'));
 const [messages,files]=await Promise.all([
  api.from('help_messages').select('id,sender_role,body,created_at').eq('request_id',request.id).order('created_at',{ascending:true}),
  api.from('help_attachments').select('id,file_name,storage_path').eq('request_id',request.id)
 ]);
 button.disabled=false;
 if(messages.error||files.error){target.textContent='상세 내용을 읽지 못했습니다.';return;}
 target.replaceChildren();
 target.append(node('h3','대화 내역'));
 if(!messages.data?.length)target.append(node('p','아직 추가 대화가 없습니다.','help-meta'));
 for(const item of messages.data||[]){
  target.append(node('p',(item.sender_role==='admin'?'관리자':'학생')+' · '+readableDate(item.created_at)+'\n'+item.body,'help-message'));
 }
 if(files.data?.length)target.append(node('h3','첨부파일'));
 for(const f of files.data||[]){
  const link=node('button',f.file_name,'help-secondary');link.type='button';
  link.onclick=async()=>{
   link.disabled=true;
   const {data,error}=await api.storage.from('help-attachments').createSignedUrl(f.storage_path,60);
   link.disabled=false;
   if(error||!data?.signedUrl){say('첨부파일에 접근할 수 없습니다.');return;}
   const a=document.createElement('a');a.href=data.signedUrl;a.target='_blank';a.rel='noopener noreferrer';
   document.body.append(a);a.click();a.remove();
  };
  target.append(link);
 }
 if(request.owner_id===user.id || admin){
  const field=node('label','추가 메시지','help-field');
  const area=document.createElement('textarea');area.rows=3;area.maxLength=3000;field.append(area);
  const send=node('button','메시지 등록','help-secondary');send.type='button';
  const hint=node('p','','help-inline-status');
  send.onclick=async()=>{
   const body=area.value.trim();
   if(!body){hint.textContent='메시지 내용을 입력하세요.';return;}
   send.disabled=true;
   const {error}=await api.from('help_messages').insert({
    request_id:request.id,author_id:user.id,sender_role:admin?'admin':'student',body
   });
   send.disabled=false;
   if(error){hint.textContent='메시지를 등록하지 못했습니다.';return;}
   await openDetail(request,target,button);
  };
  target.append(field,send,hint);
 }
}
async function loadRequests(all){
 const root=el(all?'help-admin-list':'help-my-list');
 root.replaceChildren(node('p','요청을 불러오는 중...','help-meta'));
 const cols='id,owner_id,legacy_request_id,category,location,title,status,created_at';
 let query=api.from('help_requests').select(cols).order('created_at',{ascending:false}).limit(200);
 if(!all)query=query.eq('owner_id',user.id);
 const {data,error}=await query;
 if(error){root.textContent='요청을 불러오지 못했습니다. 로그인 상태를 확인하세요.';return;}
 cached=data||[];
 root.replaceChildren();
 if(!cached.length){root.append(node('p',all?'요청이 없습니다.':'아직 등록한 요청이 없습니다.','help-meta'));return;}
 if(all){
  const counts=Object.fromEntries(Object.keys(statusText).map(key=>[key,cached.filter(row=>row.status===key).length]));
  el('help-admin-counts').textContent='총 '+cached.length+'건 · 접수 '+counts.RECEIVED+' · 확인 '+counts.CHECKING+' · 처리 '+counts.PROCESSING+' · 완료 '+counts.COMPLETED;
 }
 for(const request of cached)root.append(card(request));
}

// Super-admin role was checked by admin/js/guard.mjs before this module loaded.
if(window.portalAdminAllowed!==true)throw Error("ADMIN_SESSION_REQUIRED");
const {data:{user:active},error:authError}=await api.auth.getUser();
if(authError||!active)throw Error("ADMIN_LOGIN_REQUIRED");
user=active;
document.getElementById("admin-help-refresh").addEventListener("click",()=>void loadRequests(true));
await loadRequests(true);
