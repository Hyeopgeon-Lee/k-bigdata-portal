/* After-school self-directed study. Auth and write permissions are provided by portal-auth.mjs. */
const db=window.portalSupabaseClient;
const $=id=>document.getElementById(id);
const Z=9*3600000,DAY=86400000;
const kstDate=t=>new Date(new Date(t).getTime()+Z).toISOString().slice(0,10);
const currentMonday=()=>{
  const d=new Date(Date.now()+Z),delta=(d.getUTCDay()+6)%7;
  return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-delta)).toISOString().slice(0,10);
};
const addDays=(day,num)=>new Date(Date.parse(day+'T00:00:00Z')+num*DAY).toISOString().slice(0,10);
const mondayOf=day=>addDays(day,-(new Date(day+'T00:00:00Z').getUTCDay()+6)%7);
const mins=secs=>Math.floor(Math.max(0,secs||0)/3600)+'시간 '+String(Math.floor((Math.max(0,secs||0)%3600)/60)).padStart(2,'0')+'분';
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels=['월','화','수','목','금'];
const reasons={personal:'개인 일정·가정 사정',home_study:'집에서 학습',career:'면접·자격증·외부 활동',condition:'컨디션 문제',forgot:'시작 버튼 기록 누락',other:'기타'};
let uid='',week=currentMonday(),selected=new Set(),plan=null,sessions=[],absences=[],active=null;
const canWrite=window.portalLearning?.write===true;
function message(text,error=false){$('study-status').textContent=text;$('study-status').dataset.error=error?'true':'false';}
function getSeconds(row){
 if(row.status==='needs_review')return 0;
 if(row.status!=='active')return row.duration_seconds||0;
 const end=row.paused_at?Date.parse(row.paused_at):Date.now();
 return Math.max(0,Math.floor((end-Date.parse(row.started_at))/1000)-(row.break_seconds||0));
}
async function load(){
 message('클라우드 학습기록을 불러오는 중입니다.');
 const [u,p,s,a]=await Promise.all([
  db.auth.getUser(),
  db.from('study_weekly_plans').select('*').gte('week_start',addDays(currentMonday(),-7)).lte('week_start',addDays(currentMonday(),7)),
  db.from('study_sessions').select('*').order('started_at',{ascending:false}).limit(300),
  db.from('study_absence_reasons').select('*').gte('study_date',addDays(currentMonday(),-7)).order('study_date',{ascending:false})
 ]);
 if(u.error||!u.data.user||p.error||s.error||a.error)throw Error('학습 데이터 조회에 실패했습니다.');
 uid=u.data.user.id;sessions=s.data||[];absences=a.data||[];
 active=sessions.find(x=>x.status==='active')||null;
 const found=(p.data||[]).find(x=>x.week_start===week);
 plan=found||null;selected=new Set(found?.weekdays||[]);
 $('study-no-plan-reason').value=found?.no_plan_reason||'';
 $('study-week').replaceChildren();
 for(const [d,label] of [[currentMonday(),'이번 주'],[addDays(currentMonday(),7),'다음 주']]){
  $('study-week').add(new Option(label+' · '+d,d));
 }
 $('study-week').value=week;
 render();
 message('서버에서 학습기록을 불러왔습니다.');
}
function render(){
 const today=kstDate(Date.now());
 $('study-days').replaceChildren();
 for(let i=0;i<5;i++){
  const day=addDays(week,i),button=document.createElement('button');
  button.type='button';button.className='study-day'+(selected.has(i+1)?' is-selected':'');
  button.dataset.index=String(i+1);
  button.setAttribute('aria-pressed',String(selected.has(i+1)));
  button.disabled=!canWrite||day<today||(day===today&&new Date(Date.now()+Z).getUTCHours()>=16);
  button.innerHTML='<strong>'+labels[i]+'</strong><small>'+day.slice(5).replace('-','.')+'</small><span aria-hidden="true">'+(selected.has(i+1)?'✓':'＋')+'</span>';
  button.addEventListener('click',()=>{selected.has(i+1)?selected.delete(i+1):selected.add(i+1);render();});
  $('study-days').append(button);
 }
 $('study-plan-summary').textContent=selected.size?'학습 예정 '+selected.size+'일 · '+[...selected].sort().map(x=>labels[x-1]).join('·'):'이번 주 계획 없음 (0일)';
 $('study-save').disabled=!canWrite;
 $('study-empty').hidden=!!selected.size;
 $('study-no-plan-reason').required=selected.size===0;
 $('study-no-plan-reason').disabled=!canWrite||selected.size>0;
 $('study-no-plan-count').textContent=$('study-no-plan-reason').value.length+' / 300자';
 $('study-none-plan-help').textContent=plan&&!plan.weekdays?.length&&!plan.no_plan_reason
   ?'기존에 사유 없이 저장된 0일 계획입니다. 다시 저장하려면 사유를 입력해 주세요.'
   :'이번 주 남아서 공부할 날짜를 선택하지 않은 이유를 입력해 주세요. 개인 사정은 자세히 작성하지 않아도 됩니다.';
 const todaysPlan=(sessions.some(s=>kstDate(s.started_at)===today));
 const todaySelected=week===mondayOf(today)&&selected.has(new Date(today+'T00:00:00Z').getUTCDay()||7);
 $('study-today-note').textContent=todaySelected?'오늘은 학습계획에 등록한 날입니다.':'계획하지 않은 날도 자율학습을 기록할 수 있습니다.';
 $('study-session-primary').textContent=active?(active.paused_at?'학습 재개':'학습 진행 중'):'학습 시작';
 $('study-session-primary').disabled=!canWrite||!!(active&&!active.paused_at);
 $('study-pause').hidden=!active||!!active.paused_at;
 $('study-end').hidden=!active;
 $('study-pause').disabled=!canWrite;
 $('study-end').disabled=!canWrite;
 const todaySessions=sessions.filter(s=>kstDate(s.started_at)===today);
 $('study-today-total').textContent=mins(todaySessions.reduce((sum,s)=>sum+getSeconds(s),0));
 $('study-live-label').textContent=active?(active.paused_at?'휴식 중 · 공부시간 일시정지':'공부시간 기록 중'):(todaysPlan?'오늘의 학습 기록':'학습 시작 전');
 const weekly=sessions.filter(s=>kstDate(s.started_at)>=week&&kstDate(s.started_at)<addDays(week,7));
 const studyDays=new Set(weekly.map(s=>kstDate(s.started_at)));
 const pledged=[...selected].map(i=>addDays(week,i-1)).filter(day=>day<today||(day===today&&studyDays.has(day)));
 const met=pledged.filter(day=>studyDays.has(day)).length;
 $('study-stat-planned').textContent=selected.size+'일';
 $('study-stat-attended').textContent=studyDays.size+'일';
 $('study-stat-hours').textContent=mins(weekly.reduce((sum,s)=>sum+getSeconds(s),0));
 $('study-stat-rate').textContent=pledged.length?Math.round(met/pledged.length*100)+'%':'—';
 const history=$('study-history');history.replaceChildren();
 for(const s of weekly.slice(0,15)){
  const row=document.createElement('div');row.className='study-history-row';
  const stamp=new Date(s.started_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
  row.innerHTML='<span>'+safe(stamp)+'</span><strong>'+safe(s.status==='active'?'진행 중':s.status==='needs_review'?'시간 확인 필요':mins(s.duration_seconds))+'</strong>';
  history.append(row);
 }
 if(!weekly.length)history.textContent='이번 주 자율학습 기록이 없습니다.';
 renderReason();
}
function tick(){
 if(!uid)return;
 if(active){
  const today=kstDate(Date.now());
  const todays=sessions.filter(s=>kstDate(s.started_at)===today);
  $('study-today-total').textContent=mins(todays.reduce((sum,s)=>sum+getSeconds(s),0));
 }
}
async function session(action){
 const button=action==='start'?'study-session-primary':action==='pause'?'study-pause':'study-end';
 $(button).disabled=true;message('학습시간을 서버에 기록하는 중입니다.');
 try{
  const rpc={start:'study_start_session',pause:'study_pause_session',resume:'study_resume_session',finish:'study_finish_session'}[action];
  const {data,error}=await db.rpc(rpc);
  if(error)throw error;
  if(action==='finish'&&data?.status==='needs_review')message('12시간을 초과한 기록은 교수자 확인이 필요합니다.',true);
  else message(action==='start'?'학습을 시작했습니다.':action==='finish'?'오늘도 수고하셨습니다. 학습시간을 저장했습니다.':'학습 상태를 변경했습니다.');
  const found=sessions.findIndex(s=>s.id===data.id);
  if(found>=0)sessions[found]=data;else sessions.unshift(data);
  active=sessions.find(s=>s.status==='active')||null;render();
 }catch(error){console.error(error);message('저장하지 못했습니다. 연결 상태와 계정 권한을 확인해 주세요.',true);render();}
}
async function savePlan(){
 const noPlanReason=selected.size===0?$('study-no-plan-reason').value.trim():null;
 if(selected.size===0&&(!noPlanReason||noPlanReason.length<2||noPlanReason.length>300)){
  message('학습계획이 없다면 사유를 2~300자로 입력해야 합니다.',true);
  $('study-no-plan-reason').focus();
  return;
 }
 $('study-save').disabled=true;message('학습계획 저장 중입니다.');
 try{
  const weekdays=[...selected].sort((a,b)=>a-b);
  const {data,error}=await db.from('study_weekly_plans')
   .upsert({user_id:uid,week_start:week,weekdays,no_plan_reason:noPlanReason},{onConflict:'user_id,week_start'})
   .select('weekdays,no_plan_reason').single();
  if(error||!data)throw error||new Error('SAVE_NOT_CONFIRMED');
  plan=data;
  $('study-no-plan-reason').value=data.no_plan_reason||'';
  message(weekdays.length
    ?'주간 학습계획을 저장했습니다. 약속한 날 미참여 시 확인 메일을 보냅니다.'
    :'학습계획 없음과 사유를 저장했습니다.');
 }catch(error){
  console.error(error);
  message('계획 저장에 실패했습니다. 사유와 변경 가능한 날짜를 확인해 주세요.',true);
 }finally{render();}
}
function renderReason(){
 const requested=new URL(location.href).searchParams.get('reason');
 const section=$('study-reason-section');
 if(!requested){section.hidden=true;return;}
 section.hidden=false;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(requested)){section.textContent='잘못된 날짜입니다.';return;}
 $('study-reason-date').textContent=requested;
 const old=absences.find(a=>a.study_date===requested);
 $('study-reason-select').value=old?.reason||'personal';
 $('study-reason-details').value=old?.details||'';
 $('study-reason-feedback').textContent=old?'이전에 제출한 사유가 있습니다.':'';
 $('study-reason-form').dataset.date=requested;
}
async function submitReason(event){
 event.preventDefault();
 if(!canWrite){$('study-reason-feedback').textContent='현재 계정은 사유 등록이 제한됩니다.';return;}
 const date=$('study-reason-form').dataset.date,reason=$('study-reason-select').value,details=$('study-reason-details').value.trim();
 if(!reasons[reason]||details.length>500)return;
 $('study-reason-submit').disabled=true;
 const {error}=await db.from('study_absence_reasons').upsert({user_id:uid,study_date:date,reason,details},{onConflict:'user_id,study_date'});
 $('study-reason-submit').disabled=false;
 $('study-reason-feedback').textContent=error?'사유 저장에 실패했습니다. 등록한 학습일인지 확인해 주세요.':'미참여 사유가 저장되었습니다.';
 if(!error){absences=[...absences.filter(a=>a.study_date!==date),{study_date:date,reason,details}];}
}
$('study-week').addEventListener('change',()=>{week=$('study-week').value;void load().catch(e=>message(e.message,true));});
$('study-save').addEventListener('click',()=>void savePlan());
$('study-no-plan-reason').addEventListener('input',()=>{$('study-none-plan-count').textContent=$('study-no-plan-reason').value.length+' / 300자';});
$('study-session-primary').addEventListener('click',()=>void session(active?'resume':'start'));
$('study-pause').addEventListener('click',()=>void session('pause'));
$('study-end').addEventListener('click',()=>{if(confirm('학습을 종료하고 귀가하시겠습니까?'))void session('finish');});
$('study-reason-form').addEventListener('submit',submitReason);
$('study-reload').addEventListener('click',()=>void load().catch(e=>message(e.message,true)));
setInterval(tick,1000);
if(!canWrite)$('study-write-note').hidden=false;
load().catch(error=>{console.error(error);message('자율학습 기록을 불러오지 못했습니다. 다시 시도해 주세요.',true);});
