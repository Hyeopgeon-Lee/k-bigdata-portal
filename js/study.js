/* After-school self-directed study. Auth and write permissions are provided by portal-auth.mjs. */
import {studyPlanningWeeks} from './study-week.mjs';
const db=window.portalSupabaseClient;
const $=id=>document.getElementById(id);
const Z=9*3600000,DAY=86400000;
const kstDate=t=>new Date(new Date(t).getTime()+Z).toISOString().slice(0,10);
const addDays=(day,num)=>new Date(Date.parse(day+'T00:00:00Z')+num*DAY).toISOString().slice(0,10);
const mondayOf=day=>addDays(day,-(new Date(day+'T00:00:00Z').getUTCDay()+6)%7);
const mins=secs=>Math.floor(Math.max(0,secs||0)/3600)+'시간 '+String(Math.floor((Math.max(0,secs||0)%3600)/60)).padStart(2,'0')+'분';
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels=['월','화','수','목','금'];
let uid='',week=studyPlanningWeeks().defaultWeek,selected=new Set(),plan=null,sessions=[],active=null;
let canWrite=window.portalLearning?.write===true;
function message(text,error=false){$('study-status').textContent=text;$('study-status').dataset.error=error?'true':'false';}
function getSeconds(row){
 if(row.status==='needs_review')return 0;
 if(row.status!=='active')return row.duration_seconds||0;
 const end=row.paused_at?Date.parse(row.paused_at):Date.now();
 return Math.max(0,Math.floor((end-Date.parse(row.started_at))/1000)-(row.break_seconds||0));
}
// All date boundaries are Asia/Seoul midnights; PostgreSQL stores timestamptz.
const kstMidnightISO=day=>new Date(Date.parse(day+'T00:00:00Z')-Z).toISOString();
async function load(){
 const weeks=studyPlanningWeeks();
 if(!weeks.nextWeekOpen&&week===weeks.nextWeek)week=weeks.thisWeek;
 message('클라우드 학습기록을 불러오는 중입니다.');
 const {data:identity,error:authError}=await db.auth.getUser();
 if(authError||!identity.user)throw Error('로그인 정보를 확인하지 못했습니다.');
 uid=identity.user.id;
 // A next-week plan still needs this week's sessions for today's live totals.
 const endWeek=week===weeks.nextWeek?weeks.nextWeek:weeks.thisWeek;
 const [p,s,a,m]=await Promise.all([
  db.from('study_weekly_plans')
   .select('week_start,weekdays,no_plan_reason')
   .eq('user_id',uid).eq('week_start',week).maybeSingle(),
  db.from('study_sessions')
   .select('id,status,started_at,paused_at,break_seconds,duration_seconds')
   .eq('user_id',uid)
   .gte('started_at',kstMidnightISO(weeks.thisWeek))
   .lt('started_at',kstMidnightISO(addDays(endWeek,7)))
   .order('started_at',{ascending:false}).limit(1000),
  // An unfinished session can predate this week: never hide the resume/end controls.
  db.from('study_sessions')
   .select('id,status,started_at,paused_at,break_seconds,duration_seconds')
   .eq('user_id',uid).eq('status','active').maybeSingle(),
  db.from('profiles').select('signup_type,enrollment_status').eq('user_id',uid).single()
 ]);
 if(p.error||s.error||a.error||m.error||!m.data)throw Error('학습 데이터 조회에 실패했습니다.');
 const rows=s.data||[];
 if(a.data&&!rows.some(item=>item.id===a.data.id))rows.push(a.data);
 sessions=rows.sort((left,right)=>Date.parse(right.started_at)-Date.parse(left.started_at));
 active=a.data||sessions.find(item=>item.status==='active')||null;
 const member=m.data;
 canWrite=window.portalLearning?.write===true&&member.signup_type==="student"&&member.enrollment_status==="enrolled";
 plan=p.data||null;selected=new Set(plan?.weekdays||[]);
 $('study-no-plan-reason').value=plan?.no_plan_reason||'';
 $('study-week').replaceChildren();
 const options=[[weeks.thisWeek,'이번 주']];
 if(weeks.nextWeekOpen)options.push([weeks.nextWeek,'다음 주']);
 for(const [d,label] of options){
  $('study-week').add(new Option(label+' · '+d,d));
 }
 $('study-week').value=week;
 render();
 message(canWrite?'서버에서 학습기록을 불러왔습니다.':'재학생만 자율학습 계획과 출석을 새로 등록할 수 있습니다. 기존 기록은 조회 가능합니다.');
}
function render(){
 const today=kstDate(Date.now());
 const weeks=studyPlanningWeeks();
 const nextWeekLocked=week===weeks.nextWeek&&!weeks.nextWeekOpen;
 const isNextWeek=week===weeks.nextWeek;
 $('study-plan-guidance').textContent=weeks.nextWeekOpen
  ?'학습할 날짜를 선택하세요. 다음 주 계획은 금요일부터 미리 등록할 수 있으며, 당일 오후 4시 이후에는 해당 날짜를 변경할 수 없습니다.'
  :'학습할 날짜를 선택하세요. 다음 주 계획은 금요일 0시부터 등록할 수 있습니다. 당일 오후 4시 이후에는 해당 날짜를 변경할 수 없습니다.';
 $('study-no-plan-period').textContent=isNextWeek?'다음 주':'이번 주';
 $('study-stats-heading').textContent=isNextWeek?'다음 주 실천 현황':'이번 주 실천 현황';
 $('study-days').replaceChildren();
 for(let i=0;i<5;i++){
  const day=addDays(week,i),button=document.createElement('button');
  button.type='button';button.className='study-day'+(selected.has(i+1)?' is-selected':'');
  button.dataset.index=String(i+1);
  button.setAttribute('aria-pressed',String(selected.has(i+1)));
  button.disabled=!canWrite||nextWeekLocked||day<today||(day===today&&new Date(Date.now()+Z).getUTCHours()>=16);
  button.innerHTML='<strong>'+labels[i]+'</strong><small>'+day.slice(5).replace('-','.')+'</small><span aria-hidden="true">'+(selected.has(i+1)?'✓':'＋')+'</span>';
  button.addEventListener('click',()=>{selected.has(i+1)?selected.delete(i+1):selected.add(i+1);render();});
  $('study-days').append(button);
 }
 $('study-plan-summary').textContent=selected.size?'학습 예정 '+selected.size+'일 · '+[...selected].sort().map(x=>labels[x-1]).join('·'):'학교에 남기 어려운 사유 제출 (0일)';
 $('study-save').disabled=!canWrite||nextWeekLocked;
 $('study-save').textContent=selected.size?'주간 계획 저장':'0일 계획 사유 제출';
 $('study-empty').hidden=!!selected.size;
 $('study-no-plan-reason').required=selected.size===0;
 $('study-no-plan-reason').disabled=!canWrite||nextWeekLocked||selected.size>0;
 $('study-none-plan-count').textContent=$('study-no-plan-reason').value.length+' / 300자';
 $('study-none-plan-help').textContent=plan&&!plan.weekdays?.length&&!plan.no_plan_reason
   ?'기존 0일 기록에 사유가 없습니다. 학교에 남아 공부하기 어려운 이유를 작성해 주세요.'
   :'공부할 과목이 아니라 학교에 남아 공부하기 어려운 이유를 직접 작성해 주세요. 민감한 내용은 자세히 밝히지 않아도 됩니다. 지도교수가 확인합니다.';
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
 const weeks=studyPlanningWeeks();
 if(!canWrite){message('승인된 재학생만 자율학습 계획을 등록할 수 있습니다.',true);return;}
 if(week===weeks.nextWeek&&!weeks.nextWeekOpen){message('다음 주 계획은 금요일 0시부터 등록할 수 있습니다.',true);return;}
 const noPlanReason=selected.size===0?$('study-no-plan-reason').value.trim():null;
 if(selected.size===0&&(!noPlanReason||noPlanReason.length<2||noPlanReason.length>300)){
  message('학교에 남아 공부하기 어려운 이유를 2~300자로 직접 작성해 주세요.',true);
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
    :'0일 계획 사유를 제출했습니다. 지도교수가 확인할 수 있습니다.');
 }catch(error){
  console.error(error);
  message('계획 저장에 실패했습니다. 사유와 변경 가능한 날짜를 확인해 주세요.',true);
 }finally{render();}
}
$('study-week').addEventListener('change',()=>{week=$('study-week').value;void load().catch(e=>message(e.message,true));});
$('study-save').addEventListener('click',()=>void savePlan());
$('study-no-plan-reason').addEventListener('input',()=>{$('study-none-plan-count').textContent=$('study-no-plan-reason').value.length+' / 300자';});
$('study-session-primary').addEventListener('click',()=>void session(active?'resume':'start'));
$('study-pause').addEventListener('click',()=>void session('pause'));
$('study-end').addEventListener('click',()=>{if(confirm('학습을 종료하고 귀가하시겠습니까?'))void session('finish');});
$('study-reload').addEventListener('click',()=>void load().catch(e=>message(e.message,true)));
setInterval(tick,1000);
if(!canWrite)$('study-write-note').hidden=false;
load().catch(error=>{console.error(error);message('자율학습 기록을 불러오지 못했습니다. 다시 시도해 주세요.',true);});
