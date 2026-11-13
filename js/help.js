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
let user=null,writer=false,activeTab='my',cached=[];
function tab(name){
 activeTab=name;
 for(const btn of document.querySelectorAll('[data-help-tab]')){
  const selected=btn.dataset.helpTab===name;
  btn.setAttribute('aria-selected',String(selected));
 }
 for(const panel of document.querySelectorAll('[data-help-panel]'))panel.hidden=panel.dataset.helpPanel!==name;
 if(name==='my')loadRequests();


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
   .select('content,admin_reply').eq('id',request.id).eq('owner_id',user.id).maybeSingle();
  loading=false;
  if(error||!data){body.replaceChildren(node('p','요청 상세를 불러오지 못했습니다. 다시 펼쳐 주세요.','help-meta'));return;}
  body.replaceChildren(node('p',data.content,'help-content'));
  if(request.legacy_request_id)body.append(node('p','기존 요청번호: '+request.legacy_request_id,'help-meta'));
  if(data.admin_reply)body.append(node('div','관리자 답변: '+data.admin_reply,'help-reply'));
  const details=node('div',null,'help-extra');
  const open=node('button','대화·첨부파일 보기','help-secondary');open.type='button';
  open.addEventListener('click',()=>openDetail(request,details,open));
  body.append(open,details);loaded=true;
 });
 article.append(heading,meta,summary);
 return article;
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
 if(request.owner_id===user.id){
  const field=node('label','추가 메시지','help-field');
  const area=document.createElement('textarea');area.rows=3;area.maxLength=3000;field.append(area);
  const send=node('button','메시지 등록','help-secondary');send.type='button';
  const hint=node('p','','help-inline-status');
  send.onclick=async()=>{
   const body=area.value.trim();
   if(!body){hint.textContent='메시지 내용을 입력하세요.';return;}
   send.disabled=true;
   const {error}=await api.from('help_messages').insert({
    request_id:request.id,author_id:user.id,sender_role:'student',body
   });
   send.disabled=false;
   if(error){hint.textContent='메시지를 등록하지 못했습니다.';return;}
   await openDetail(request,target,button);
  };
  target.append(field,send,hint);
 }
}
async function loadRequests(){
 const root=el('help-my-list');
 root.replaceChildren(node('p','요청을 불러오는 중...','help-meta'));
 const {data,error}=await api.from('help_requests')
  .select('id,owner_id,legacy_request_id,category,location,title,status,created_at')
  .eq('owner_id',user.id).order('created_at',{ascending:false}).limit(200);
 if(error){root.textContent='요청을 불러오지 못했습니다. 로그인 상태를 확인하세요.';return;}
 cached=data||[];root.replaceChildren();
 if(!cached.length){root.append(node('p','아직 등록한 요청이 없습니다.','help-meta'));return;}
 for(const request of cached)root.append(card(request));
}
async function loadNotifications(){
 const root=el('help-notice-list');root.replaceChildren(node('p','알림을 불러오는 중...','help-meta'));
 const {data,error}=await api.from('help_notifications').select('id,type,created_at,is_read').eq('recipient_id',user.id).order('created_at',{ascending:false}).limit(50);
 if(error){root.textContent='알림을 확인할 수 없습니다.';return;}
 root.replaceChildren();
 for(const item of data||[]){
  const label=item.type==='status'?'요청 처리 상태가 변경되었습니다.':item.type==='reply'?'관리자 답변이 등록되었습니다.':'새 메시지가 등록되었습니다.';
  root.append(node('p',label+' · '+readableDate(item.created_at)+(item.is_read?'':' · 새 알림'),'help-message'));
 }
 if(!data?.length)root.append(node('p','새 알림이 없습니다.','help-meta'));
 const unread=(data||[]).filter(a=>!a.is_read).map(a=>a.id);
 if(unread.length){
  const button=node('button','알림 모두 읽음 처리','help-secondary');button.type='button';
  button.onclick=async()=>{
   const {error:e}=await api.from('help_notifications').update({is_read:true}).in('id',unread);
   if(e)say('알림 상태를 저장하지 못했습니다.');else loadNotifications();
  };root.append(button);
 }
}
function initForm(){
 const form=el('help-create-form');
 form.elements.category.append(...categories.map(value=>new Option(value,value)));
 form.elements.location.append(...locations.map(value=>new Option(value,value)));
 form.addEventListener('submit',async event=>{
  event.preventDefault();const send=el('help-send');const file=form.elements.photo.files[0];
  if(file&&(!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)||file.size>5242880)){
   say('첨부파일은 JPG·PNG·WebP·PDF 중 5MB 이하만 가능합니다.');return;
  }
  send.disabled=true;say('요청을 등록하고 있습니다...');
  const payload={
   owner_id:user.id,category:form.elements.category.value,location:form.elements.location.value,
   title:form.elements.title.value.trim(),content:form.elements.content.value.trim()
  };
  const {data,error}=await api.from('help_requests').insert(payload).select('id').single();
  if(error){say('요청 등록 실패: 로그인 및 재학생 승인 상태를 확인해 주세요.');send.disabled=false;return;}
  let fileError=false;
  if(file){
   const extension=file.type==='application/pdf'?'pdf':file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
   const storagePath=user.id+'/'+data.id+'/'+crypto.randomUUID()+'.'+extension;
   const uploaded=await api.storage.from('help-attachments').upload(storagePath,file,{upsert:false,contentType:file.type});
   if(uploaded.error)fileError=true;
   else{
    const saved=await api.from('help_attachments').insert({
     request_id:data.id,uploader_id:user.id,storage_path:storagePath,file_name:file.name.slice(0,180)
    });
    if(saved.error)fileError=true;
   }
  }
  form.reset();send.disabled=false;
  say(fileError?'요청은 등록됐지만 첨부파일 저장에 실패했습니다.':'요청이 정상적으로 등록되었습니다.');
  tab('my');
 });
}
async function start(){
 if(!api){say('포털 인증 모듈을 불러오지 못했습니다.');return;}
 const {data:{user:current},error}=await api.auth.getUser();
 if(error||!current){say('로그인이 필요합니다.');return;}
 user=current;
 writer=window.portalLearning?.write===true;
 if(!writer){
  el('help-body').hidden=true;
  say('학과 요청·문의는 승인된 재학생만 이용할 수 있습니다. 휴학·졸업·자퇴 계정은 이용이 제한됩니다.');
  return;
 }
 el('help-body').hidden=false;
 el('help-create-tab').hidden=!writer;
 initForm();
 document.querySelectorAll('[data-help-tab]').forEach(button=>button.onclick=()=>tab(button.dataset.helpTab));
 const query=new URLSearchParams(location.search);
 const source=query.get('source'),problemId=query.get('id');
 const pages={coding:'coding.html',ncp:'ncp.html',practical:'practical.html',interview:'interview.html'};
 if(Object.hasOwn(pages,source)&&/^[A-Za-z0-9_-]{1,80}$/.test(problemId||'')){
   const titles={coding:'기초학습',ncp:'NCP 기출문제',practical:'정보처리 실기',interview:'기술면접'};
   const f=el('help-create-form');
   f.elements.category.value='학습문제 오류 신고';
   f.elements.location.value='온라인 포털';
   // Older shared links may include a question preview; newer links only need source + id.
   const preview=(query.get('question')||'').replace(/\s+/g,' ').trim().slice(0,100);
   f.elements.title.value=('['+titles[source]+' 오류] '+problemId+(preview?' '+preview:'')).slice(0,80);
   const problemUrl=new URL(pages[source],location.origin+'/');
   problemUrl.searchParams.set('id',problemId);
   f.elements.content.value='문제 ID: '+problemId+'\n문제 유형: '+titles[source]+'\n문제 화면: '+problemUrl.href+'\n\n오류 내용:\n';
   tab('new');

 }else tab('my');
}
start().catch(error=>{console.error('Help initialization failed',error);say('요청 서비스를 연결할 수 없습니다.');});
