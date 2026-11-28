/* Faculty-only timer and error diagnostics. Authorization is rechecked by every RPC. */
if(window.portalAdminAllowed!==true)throw Error('ADMIN_SESSION_REQUIRED');
const db=window.portalSupabaseClient;
const by=id=>document.getElementById(id);
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const when=t=>t?new Date(t).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):'—';
const label=reason=>reason==='stale_session'?'장시간 미종료':reason==='over_12_hours'?'12시간 초과':'확인 필요';
let busy=false;
function state(message,error=false){const node=by('study-diagnostics-status');node.textContent=message;node.dataset.error=error?'true':'false';}
function render(data){
 const stale=Array.isArray(data.stale)?data.stale:[];
 const reviews=Array.isArray(data.reviews)?data.reviews:[];
 const errors=Array.isArray(data.errors)?data.errors:[];
 by('study-diagnostics-count').textContent='미종료 '+stale.length+'건 · 검토 대기 '+reviews.filter(x=>!x.review_outcome).length+'건 · 최근 오류 '+errors.length+'건';
 by('study-diagnostics-stale').innerHTML=stale.length?stale.map(s=>
  '<div class="study-diagnostic-row"><div><strong>'+safe(s.name)+'</strong><p>시작 '+safe(when(s.started_at))+' · '+(s.paused_at?'휴식 중':'진행 중')+'</p></div>'+
  '<button class="study-outline" data-flag="'+safe(s.id)+'" type="button">검토 대상으로 전환</button></div>'
 ).join(''):'<p class="study-text">확인 대상인 장시간 미종료 세션이 없습니다.</p>';
 by('study-diagnostics-reviews').innerHTML=reviews.length?reviews.map(s=>
  '<div class="study-diagnostic-row"><div><strong>'+safe(s.name)+'</strong><p>'+safe(label(s.review_reason))+
  ' · 시작 '+safe(when(s.started_at))+
  (s.review_outcome?' · 미인정 처리 완료':' · 검토 대기')+'</p></div>'+
  (s.review_outcome?'':('<div class="study-diagnostic-actions"><label>인정 시간(분) <input type="number" min="1" max="720" step="1" value="0" data-minutes="'+safe(s.id)+'"></label>'+
   '<button class="study-outline" type="button" data-review="'+safe(s.id)+'" data-decision="accepted">인정</button>'+
   '<button class="study-outline" type="button" data-review="'+safe(s.id)+'" data-decision="rejected">미인정</button></div>'))+
  '</div>'
 ).join(''):'<p class="study-text">검토 대기 기록이 없습니다.</p>';
 by('study-diagnostics-errors').innerHTML=errors.length?errors.map(e=>
  '<tr><td>'+safe(when(e.occurred_at))+'</td><td>'+safe(e.name||'탈퇴 계정')+'</td><td>'+
   safe(e.action)+'</td><td>'+safe(e.code)+'</td><td>'+safe(e.http_status??'—')+'</td></tr>'
 ).join(''):'<tr><td colspan="5">최근 14일간 기록된 오류가 없습니다.</td></tr>';
}
async function refresh(){
 state('학습 기록과 오류 이력을 확인 중입니다.');
 const {data,error}=await db.rpc('study_admin_diagnostics',{p_limit:40});
 if(error||!data)throw error||Error('STUDY_DIAGNOSTICS_EMPTY');
 render(data);state('운영 진단 자료를 불러왔습니다.');
}
async function handle(event){
 const button=event.target.closest('button[data-flag],button[data-review]');
 if(!button||busy)return;
 const flag=button.dataset.flag;
 const id=flag||button.dataset.review;
 if(!/^[0-9a-f-]{36}$/i.test(id||''))return;
 let endpoint,args;
 if(flag){
  if(!confirm('해당 미종료 세션을 교수자 확인 대상으로 전환하시겠습니까? 원본은 삭제되지 않습니다.'))return;
  endpoint='study_admin_flag_stale_session';args={p_session_id:id};
 }else{
  const decision=button.dataset.decision;
  let minutes=null;
  if(decision==='accepted'){
   const input=by('study-diagnostics-reviews').querySelector('[data-minutes="'+id+'"]');
   minutes=Number(input?.value);
   if(!Number.isInteger(minutes)||minutes<1||minutes>720){state('인정할 시간을 1~720분으로 입력해 주세요.',true);input?.focus();return;}
  }
  const note=prompt(decision==='accepted'?'검토 메모를 입력하세요(선택, 300자 이내).':'미인정 사유를 입력하세요(300자 이내).');
  if(note===null)return;
  if(note.length>300||(decision==='rejected'&&note.trim().length<2)){state('사유는 2~300자로 입력해 주세요.',true);return;}
  if(!confirm(decision==='accepted'?minutes+'분을 공식 학습시간으로 인정하시겠습니까?':'이 학습시간을 미인정 처리하시겠습니까?'))return;
  endpoint='study_admin_review_session';
  args={p_session_id:id,p_decision:decision,p_minutes:minutes,p_note:note};
 }
 busy=true;button.disabled=true;state('검토 결과를 저장 중입니다.');
 try{
  const {error}=await db.rpc(endpoint,args);
  if(error)throw error;
  await refresh();state('검토 결과를 저장했습니다.');
 }catch(error){console.error('Study admin diagnostic',error);state('저장에 실패했습니다. 기록 상태와 관리자 권한을 확인해 주세요.',true);}
 finally{busy=false;button.disabled=false;}
}
by('study-diagnostics-refresh').addEventListener('click',()=>void refresh().catch(e=>{console.error(e);state('진단 자료 조회에 실패했습니다.',true);}));
by('study-diagnostics-stale').addEventListener('click',event=>void handle(event));
by('study-diagnostics-reviews').addEventListener('click',event=>void handle(event));
export function activateDiagnostics(){return refresh().catch(e=>{console.error('Study admin diagnostics',e);state('진단 자료를 불러오지 못했습니다. 교수자 권한을 확인해 주세요.',true);});}
if(document.body.dataset.learningTabs!=='true')void activateDiagnostics();
