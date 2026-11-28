/* Super-admin study attendance dashboard; RPC enforces professor authorization. */
import {isStaleSession} from './study-session-state.mjs';
import {studyShareModel,attachStudyChartShare} from './study-chart-share.mjs?v=20261128-study-share-1';
const db=window.portalSupabaseClient,$=id=>document.getElementById(id);
const DAY=86400000,Z=9*3600000;
const kdate=value=>new Date(new Date(value).getTime()+Z).toISOString().slice(0,10);
const monday=()=>{const d=new Date(Date.now()+Z);return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-(d.getUTCDay()+6)%7)).toISOString().slice(0,10);};
const dateAt=(week,offset)=>new Date(Date.parse(week+'T00:00:00Z')+offset*DAY).toISOString().slice(0,10);
const reasonLabels={personal:'개인 일정',home_study:'집에서 학습',career:'면접·자격증',condition:'컨디션',forgot:'시작 기록 누락',other:'기타'};
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>{s=Math.max(0,s||0);return Math.floor(s/3600)+'시간 '+String(Math.floor(s%3600/60)).padStart(2,'0')+'분';};
let report=null,loadSequence=0;
function selectedWeek(){
 const week=$('study-admin-week').value;
 return /^\d{4}-\d\d-\d\d$/.test(week)?week:monday();
}
function sessionDuration(s){
 if(s.status==='needs_review'||isStaleSession(s))return 0;
 if(s.status!=='active')return s.duration_seconds||0;
 return Math.max(0,Math.floor((Date.parse(s.paused_at||new Date().toISOString())-Date.parse(s.started_at))/1000)-(s.break_seconds||0));
}
function setStatus(m,bad=false){$('study-admin-status').textContent=m;$('study-admin-status').dataset.error=bad?'true':'false';}
async function load(){
 const request=++loadSequence;
 report=null;
 $('study-days-chart')?.replaceChildren();
 setStatus('자율학습 통계를 불러오는 중입니다.');
 let response;
 try{response=await db.rpc('study_admin_dashboard',{p_week_start:selectedWeek()});}
 catch(error){if(request!==loadSequence)return;throw error;}
 if(request!==loadSequence)return;
 const {data,error}=response;
 if(error||!data||!Array.isArray(data.students))throw error||Error('관리자 응답이 올바르지 않습니다.');
 report=data;
 $('study-admin-mail').checked=data.email_enabled===true;
 render();setStatus('자율학습 기록을 불러왔습니다.');
}
function render(){
 if(!report)return;
 const grade=$('study-admin-grade').value,today=kdate(Date.now()),week=selectedWeek();
 const students=report.students.filter(s=>[1,2].includes(Number(s.academic_year))&&(!grade||String(s.academic_year)===grade));
 let committed=0,met=0,missed=0,hours=0,plannedStudents=0,zeroPlanStudents=0;
 const rows=[],byGrade=new Map([1,2].map(g=>[g,{students:0,planned:0,hours:0,committed:0,met:0,rows:[]} ]));
 const scope=$('study-grade-scope');if(scope)scope.textContent=(grade?grade+'학년':'1·2학년 구분')+' · 학생 '+students.length+'명';
 for(const person of students){
  const plan=report.plans.find(p=>p.user_id===person.id),selected=plan?.weekdays||[];
  const ss=report.sessions.filter(s=>s.user_id===person.id);
  const attended=new Set(ss.filter(s=>s.status!=='needs_review'&&!isStaleSession(s)).map(s=>kdate(s.started_at)));
  const due=selected.map(d=>dateAt(week,d-1)).filter(date=>date<today);
  const attendedPlanned=due.filter(day=>attended.has(day)).length;
  const reasons=report.reasons.filter(r=>r.user_id===person.id);
  const unfulfilled=due.filter(day=>!attended.has(day));
  const hoursSec=ss.reduce((a,s)=>a+sessionDuration(s),0);
  if(plan)plannedStudents++;
  if(plan&&!selected.length)zeroPlanStudents++;
  committed+=due.length;met+=attendedPlanned;missed+=unfulfilled.length;hours+=hoursSec;
  let status='<span class="study-tag">미등록</span>';
  if(plan&&!selected.length)status='<span class="study-tag missed">0일 계획 · 확인 필요</span>';
  else if(plan&&!due.length)status='<span class="study-tag">계획 대기</span>';
  else if(due.length&&!unfulfilled.length)status='<span class="study-tag done">참여</span>';
  else if(unfulfilled.length)status='<span class="study-tag missed">미참여 '+unfulfilled.length+'일</span>';
  let desc=unfulfilled.length?unfulfilled.map(day=>{
   const r=reasons.find(x=>x.study_date===day);
   return day.slice(5)+' '+(r?(reasonLabels[r.reason]||'기타')+(r.details?' · '+safe(r.details):''):'사유 미입력');
  }).join(' / '):'—';
  const row='<tr data-study-grade="'+Number(person.academic_year)+'"><td data-label="학생"><strong>'+safe(person.name)+'</strong></td>'+
   '<td data-label="학년">'+safe(person.academic_year+'학년')+'</td>'+
   '<td data-label="계획일">'+(selected.length?selected.map(d=>['월','화','수','목','금'][d-1]).join('·'):'—')+'</td>'+
   '<td data-label="실천">'+attendedPlanned+'/'+due.length+'일</td>'+
   '<td data-label="공부시간">'+fmt(hoursSec)+'</td>'+
   '<td data-label="상태">'+status+'</td>'+
   '<td data-label="계획 없음 사유" class="study-admin-reasons">'+(plan&&!selected.length?(plan.no_plan_reason?safe(plan.no_plan_reason):'<span class="study-tag missed">사유 미작성 (기존 기록)</span>'):'—')+'</td>'+
   '<td data-label="사유" class="study-admin-reasons">'+desc+'</td></tr>';
  rows.push(row);const group=byGrade.get(Number(person.academic_year));group.students++;group.planned+=plan?1:0;group.hours+=hoursSec;group.committed+=due.length;group.met+=attendedPlanned;group.rows.push(row);
 }
 $('study-admin-summary').replaceChildren();
 for(const [label,value,sub] of [
  ['계획 등록',plannedStudents+'명','조회 학생 '+students.length+'명 · 0일 계획 '+zeroPlanStudents+'명 (확인 필요)'],
  ['계획 실천율',committed?Math.round(met/committed*100)+'%':'—','지난 학습 예정일 기준 '+met+'/'+committed],
  ['미참여',missed+'건','사유 미입력 여부 확인'],
  ['누적 공부시간',fmt(hours),'휴식시간 제외']
 ]){
  const card=document.createElement('article');card.className='learn-stat';
  const small=document.createElement('small');small.textContent=label;
  const strong=document.createElement('strong');strong.textContent=value;
  const p=document.createElement('p');p.textContent=sub;
  card.append(small,strong,p);$('study-admin-summary').append(card);
 }
 const ui=window.portalAdminUI;
 if(ui){
  ui.renderDonut(ui.chartMount($('study-admin-summary'),'study-plan-chart'),'계획 등록 현황',[
   ['계획 등록',plannedStudents],['미등록',students.length-plannedStudents]
  ],{caption:ui.gradeLabel(grade)+' · 선택 주간, 0일 계획 포함'});
  const days=[0,0,0,0,0,0,0],dailyStudents=Array.from({length:7},()=>new Set()),ids=new Set(students.map(s=>s.id));
  for(const session of report.sessions){
   if(!ids.has(session.user_id))continue;
   const seconds=sessionDuration(session);
   if(!(seconds>0))continue;
   const day=kdate(session.started_at);
   for(let i=0;i<7;i++)if(day===dateAt(week,i)){
    days[i]+=seconds;
    dailyStudents[i].add(session.user_id);
   }
  }
  const model=studyShareModel(week,grade,days,dailyStudents.map(set=>set.size));
  const mount=ui.chartMount($('study-admin-summary'),'study-days-chart');
  ui.renderBars(mount,'요일별 공부시간',model.rows.map(row=>[row.day+' · '+row.count+'명',row.hours]),{unit:'시간',caption:'실제 공부한 학생 수(중복 제외) · 휴식시간·검토 대상 세션 제외'});
  attachStudyChartShare(mount,model);
 }
 const comparison=$('study-grade-comparison');
 if(comparison&&ui){
  comparison.replaceChildren();comparison.hidden=!!grade;
  if(!grade){
   for(const [title,key,unit,max] of [['학년별 계획 등록률','planned','%',100],['학년별 누적 공부시간','hours','시간',null]]){
    const chart=document.createElement('div');comparison.append(chart);
    const values=[...byGrade].map(([g,v])=>[g+'학년',key==='hours'?Math.round(v.hours/360)/10:v.students?Math.round(v.planned/v.students*100):null]);
    ui.renderBars(chart,title,values,{unit,max,caption:'선택 주간 기준'});
   }
  }
 }
 const body=$('study-admin-table-body');
 if(!grade&&scope){
  body.innerHTML=[...byGrade].map(([g,v])=>'<tr class="study-grade-divider" data-grade-group="'+g+'"><td colspan="8"><strong>'+g+'학년</strong> · 학생 '+v.students+'명 · 계획 '+v.planned+'명 · '+fmt(v.hours)+'</td></tr>'+(v.rows.join('')||'<tr class="study-grade-empty"><td colspan="8">등록된 학생이 없습니다.</td></tr>')).join('');
 }else body.innerHTML=rows.join('')||'<tr><td colspan="8">등록된 학생이 없습니다.</td></tr>';
}
async function saveMail(){
 const input=$('study-admin-mail');input.disabled=true;
 const wanted=input.checked;
 const {data,error}=await db.from('study_settings').update({enabled:wanted,updated_at:new Date().toISOString()})
   .eq('setting_key','absence_email').select('enabled').single();
 if(error||data?.enabled!==wanted){input.checked=!wanted;setStatus('메일 발송 설정을 저장하지 못했습니다.',true);}
 else setStatus(wanted?'자율학습 미참여 메일 발송을 켰습니다.':'자율학습 미참여 메일 발송을 껐습니다.');
 input.disabled=false;
}
const base=monday(),select=$('study-admin-week');
for(let i=-4;i<=1;i++){const d=dateAt(base,i*7);select.add(new Option(d+' 주간',d));}
select.value=base;
select.addEventListener('change',()=>void load().catch(e=>setStatus('관리자 자료 조회 실패',true)));
$('study-admin-grade').value=window.portalAdminUI?.getGrade()||'';
window.portalAdminUI?.onGrade(value=>{$('study-admin-grade').value=value;render();});
$('study-admin-grade').addEventListener('change',render);
$('study-admin-refresh').addEventListener('click',()=>void load().catch(e=>setStatus('관리자 자료 조회 실패',true)));
$('study-admin-mail').addEventListener('change',()=>void saveMail());
load().catch(error=>{console.error('study admin',error);setStatus('자율학습 자료를 조회할 수 없습니다. 교수자 권한을 확인해 주세요.',true);});
