/* Aggregated, super-admin-only data comes from the guarded Edge Function. */
const db=window.portalSupabaseClient, get=id=>document.getElementById(id);
const names={JAVA:'Java',C:'C언어',PYTHON:'Python',LINUX:'Ubuntu',NCP:'NCP',PRACTICAL:'정보처리'};
let gradeFilter='', periodMode='week',periodOffset=0,requestSequence=0;
const node=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined&&text!==null)el.textContent=String(text);if(className)el.className=className;return el;};
function card(label,value,sub){
 const c=node('article',null,'learn-stat');c.append(node('small',label),node('strong',value),node('p',sub));return c;
}
function date(iso){return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric'}).format(new Date(iso));}
function table(headers,rows){
 const el=node('table',null,'learn-table'),head=node('thead'),tr=node('tr');
 for(const h of headers)tr.append(node('th',h));head.append(tr);el.append(head);
 const body=node('tbody');
 for(const record of rows){const row=node('tr');record.forEach((val,index)=>{const cell=node('td');cell.append(val instanceof Node?val:String(val));cell.dataset.label=headers[index];row.append(cell);});body.append(row);}
 el.append(body);return el;
}
function delta(a,b,suffix=''){
 if(!Number.isFinite(a)||!Number.isFinite(b))return '—';
 const change=a-b;return (change>0?'+':'')+change+suffix;
}
function renderFilters(){
 if(get('teacher-filters'))return;
 const panel=node('div',null,'learn-filter');panel.id='teacher-filters';
 const gradeRow=node('div',null,'learn-control-row');
 gradeRow.append(node('span','학년','learn-control-title'));
 const gradeButtons=node('div',null,'learn-button-group');
 gradeButtons.setAttribute('role','group');gradeButtons.setAttribute('aria-label','학년 선택');
 for(const [label,value] of [['전체',''],['1학년','1'],['2학년','2']]){
  const button=node('button',label,'learn-choice-button');
  button.type='button';button.dataset.learningGrade=value;
  button.setAttribute('aria-pressed',String(value===gradeFilter));
  button.addEventListener('click',()=>{
   if(gradeFilter===value)return;
   gradeFilter=value;
   for(const item of gradeButtons.querySelectorAll('button'))item.setAttribute('aria-pressed',String(item.dataset.learningGrade===gradeFilter));
   const studyGrade=get('study-admin-grade');
   if(studyGrade){studyGrade.value=gradeFilter;studyGrade.dispatchEvent(new Event('change'));}
   void load();
  });
  gradeButtons.append(button);
 }
 gradeRow.append(gradeButtons);panel.append(gradeRow);
 const periodRow=node('div',null,'learn-control-row');
 periodRow.append(node('span','조회 기간','learn-control-title'));
 const periodGroup=node('div',null,'learn-button-group');
 periodGroup.setAttribute('role','group');periodGroup.setAttribute('aria-label','통계 집계 기간');
 for(const [label,value] of [['주간','week'],['월간','month']]){
  const button=node('button',label,'learn-choice-button');
  button.type='button';button.dataset.learningPeriod=value;
  button.setAttribute('aria-pressed',String(value===periodMode));
  button.addEventListener('click',()=>{
   if(periodMode===value)return;
   periodMode=value;periodOffset=0;
   for(const item of periodGroup.querySelectorAll('button'))item.setAttribute('aria-pressed',String(item.dataset.learningPeriod===periodMode));
   void load();
  });
  periodGroup.append(button);
 }
 periodRow.append(periodGroup);panel.append(periodRow);
 const history=node('div',null,'learn-period-navigation');
 const previous=node('button','〈 이전','learn-period-arrow');
 previous.type='button';previous.id='teacher-period-previous';
 previous.setAttribute('aria-label','이전 주 또는 이전 월 통계');
 previous.addEventListener('click',()=>{
  if(periodOffset<=(periodMode==='week'?-52:-24))return;
  periodOffset--;void load();
 });
 const label=node('strong','이번 주','learn-period-label');label.id='teacher-period-label';
 label.setAttribute('aria-live','polite');
 const next=node('button','다음 〉','learn-period-arrow');
 next.type='button';next.id='teacher-period-next';
 next.setAttribute('aria-label','다음 주 또는 다음 월 통계');
 next.addEventListener('click',()=>{if(periodOffset>=0)return;periodOffset++;void load();});
 const today=node('button','현재 기간','learn-period-today');
 today.type='button';today.id='teacher-period-current';
 today.addEventListener('click',()=>{if(periodOffset===0)return;periodOffset=0;void load();});
 const rebuild=node('button','재집계','learn-period-arrow');
 rebuild.type='button';rebuild.id='teacher-period-rebuild';
 rebuild.setAttribute('aria-label','선택한 과거 기간 통계 재집계');
 rebuild.addEventListener('click',async()=>{
  if(periodOffset===0||rebuild.disabled)return;
  if(!confirm('선택한 기간의 학습 통계를 다시 계산할까요? 과거 학년별 집계 대상은 유지됩니다.'))return;
  rebuild.disabled=true;get('teacher-status').textContent='통계를 재집계하는 중입니다...';
  try{
   const {data,error}=await db.functions.invoke('learning-admin',{body:{action:'reaggregate',period:periodMode,offset:periodOffset}});
   if(error||!data?.ok)throw error||Error('재집계 실패');
   await load();
  }catch(error){
   console.error('Reaggregate learning statistics',error);
   get('teacher-status').textContent='재집계에 실패했습니다. 관리자 권한 및 배치 오류를 확인해 주세요.';
  }finally{rebuild.disabled=false;}
 });
 const state=node('span','집계 중','learn-period-state');
 state.id='teacher-period-state';state.dataset.state='live';state.setAttribute('role','status');
 history.append(previous,label,next,today,rebuild,state);panel.append(history);
 get('teacher-refresh').parentElement.prepend(panel);
 updatePeriodControls();
}
function updatePeriodControls(data){
 const previous=get('teacher-period-previous'),next=get('teacher-period-next'),current=get('teacher-period-current');
 if(!previous||!next||!current)return;
 previous.disabled=periodOffset<=(periodMode==='week'?-52:-24);
 next.disabled=periodOffset>=0;
 current.disabled=periodOffset===0;
 const rebuild=get('teacher-period-rebuild');
 if(rebuild)rebuild.hidden=periodOffset>=0;
 const state=get('teacher-period-state');
 if(state){
  const kind=data?.snapshotStatus||(periodOffset===0?'live':'loading');
  state.dataset.state=kind;
  state.textContent=({live:'집계 중',completed:'확정',missing:'미생성',failed:'집계 오류',loading:'조회 중'})[kind]||'확인 필요';
 }
 const periodLabel=get('teacher-period-label');
 if(data?.periodStart&&data?.periodEnd){
  const last=new Date(Date.parse(data.periodEnd)-1).toISOString();
  periodLabel.textContent=periodMode==='week'?
   date(data.periodStart)+' ~ '+date(last):
   new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long'}).format(new Date(data.periodStart));
 }else periodLabel.textContent=periodOffset===0?(periodMode==='week'?'이번 주':'이번 달'):'기간 조회 중';
}
const answers=node('section');
answers.setAttribute('aria-live','polite');
let answerRequest=0;
const results={correct:'정답',incorrect:'오답',completed:'완료',ungraded:'미판정',timeout:'시간 초과'};
function action(label,callback){
 const button=node('button',label,'learn-period-arrow');
 button.type='button';button.addEventListener('click',callback);return button;
}
async function showAnswers(subject,wrong,periodStart,offset=0){
 const seq=++answerRequest;
 const start=new Date(Date.parse(periodStart)+9*3600000).toISOString().slice(0,10);
 answers.replaceChildren(node('p','제출 답안 조회 중…'));
 try{
  const {data,error}=await db.rpc('admin_learning_answers',{
   p_period:periodMode,p_start:start,p_grade:Number(gradeFilter),p_subject:subject,p_wrong:wrong,p_offset:offset
  });
  if(seq!==answerRequest)return;
  if(error)throw error;
  answers.replaceChildren(node('h3',names[subject]+' · '+(wrong?'오답':'전체 시도')),
   action(wrong?'전체 시도 보기':'오답만 보기',()=>showAnswers(subject,!wrong,periodStart)),
   action('닫기',()=>{answerRequest++;answers.replaceChildren();}));
  if(!data.length)answers.append(node('p','해당하는 제출 기록이 없습니다.'));
  else answers.append(table(['학생','제출 시각','문제','결과','제출 답안'],data.slice(0,25).map(row=>{
   const raw=node('pre',row.answer_text||'저장된 답안 없음');
   raw.style.whiteSpace='pre-wrap';raw.style.overflowWrap='anywhere';
   return [row.student||'이름 미확인',new Date(row.submitted_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}),row.question_id,results[row.result]||row.result,raw];
  })));
  if(offset)answers.append(action('이전 25건',()=>showAnswers(subject,wrong,periodStart,offset-25)));
  if(data.length>25)answers.append(action('다음 25건',()=>showAnswers(subject,wrong,periodStart,offset+25)));
 }catch{if(seq===answerRequest)answers.replaceChildren(node('p','제출 답안을 조회하지 못했습니다. 다시 선택해 주세요.'));}
}
async function load(){
 const status=get('teacher-status'),sequence=++requestSequence;
 answerRequest++;answers.replaceChildren();get('teacher-content').hidden=true;
 renderFilters();updatePeriodControls();
 status.textContent='선택한 학년과 기간의 학습통계를 불러오는 중입니다...';
 const {data,error}=await db.functions.invoke('learning-admin',{body:{
  action:'summary',period:periodMode,offset:periodOffset,...(gradeFilter?{grade:Number(gradeFilter)}:{})
 }});
 if(sequence!==requestSequence)return;
 if(error||!data?.ok){
  get('teacher-content').hidden=true;
  status.textContent='학습통계를 조회하지 못했습니다. 관리자 권한과 서버 상태를 확인해 주세요.';
  return;
 }
 updatePeriodControls(data);
 if(!data.current){
  get('teacher-content').hidden=true;
  status.textContent=data.snapshotStatus==='failed'?
   '선택한 기간의 자동 집계가 실패했습니다. 재집계 버튼을 이용해 주세요.':
   '선택한 기간의 확정 통계가 아직 없습니다. 자동 복구 또는 재집계를 이용해 주세요.';
  return;
 }
 get('teacher-content').hidden=false;
 const a=data.current,b=data.previous;
 const thisPeriod=periodMode==='week'?'해당 주':'해당 월';
 const lastPeriod=periodMode==='week'?'전주':'전월';
 const compared=lastPeriod+(data.partial?' 전체':'');
 get('teacher-summary').replaceChildren(
  card('집계 대상 재학생',data.cohortSize+'명',data.partial?'현재 재학생':'기간 마감 시점 재학생'),
  card(thisPeriod+' 참여율',a.participationRate===null?'대상 없음':a.participationRate+'%',a.activeStudents+'명 참여'),
  card(thisPeriod+' 풀이',a.unique+'문제',a.attempts+'회 시도 · '+compared+' 대비 '+delta(a.attempts,b?.attempts,'회')),
  card('자가평가 정답률',a.selfAccuracy===null?'집계 없음':a.selfAccuracy+'%',a.selfCorrect+'/'+a.selfTotal+'건')
 );
 get('teacher-subjects').replaceChildren(table(['과목',thisPeriod+' 시도','고유 풀이','오답 횟수',compared+' 시도'],
  Object.keys(names).map(key=>[names[key],action(String(a.subjects?.[key]?.attempts??0),()=>showAnswers(key,false,data.periodStart)),a.subjects?.[key]?.unique??0,
   action(String(a.subjects?.[key]?.wrong??0),()=>showAnswers(key,true,data.periodStart)),b?.subjects?.[key]?.attempts??'—'])
 ),answers);
 const rates=get('teacher-rates');rates.replaceChildren();
 for(const [label,correct,total,rate] of [
  ['자가평가',a.selfCorrect,a.selfTotal,a.selfAccuracy],
  ['브라우저 정답 비교',a.autoCorrect,a.autoTotal,a.autoAccuracy]
 ]){
  const item=node('article',null,'learn-rate');
  item.append(node('span',label),node('strong',rate==null?'집계 없음':rate+'%'),
    node('small',correct+' / '+total+'건 · 미판정 제외'));
  rates.append(item);
 }
 const wrong=get('teacher-wrong');wrong.replaceChildren();
 if(data.smallCohortHidden)wrong.append(node('p','5명 미만 집계 대상의 문제별 오답 내역은 표시하지 않습니다.','learn-empty'));
 else if(!data.topWrong?.length)wrong.append(node('p','선택한 기간에 기록된 오답이 없습니다.','learn-empty'));
 else for(const rec of data.topWrong){
  const item=node('div',null,'learn-review-card');
  item.append(node('strong',rec.question),node('small',rec.count+'회 오답'));wrong.append(item);
 }
 get('teacher-comparison').replaceChildren(table(['지표',thisPeriod,compared,'변화'],[
  ['학습 참여 학생',a.activeStudents,b?.activeStudents??'—',delta(a.activeStudents,b?.activeStudents,'명')],
  ['전체 풀이 시도',a.attempts,b?.attempts??'—',delta(a.attempts,b?.attempts,'회')],
  ['서로 다른 풀이',a.unique,b?.unique??'—',delta(a.unique,b?.unique,'문제')],
  ['자가평가 정답률',a.selfAccuracy==null?'—':a.selfAccuracy+'%',b?.selfAccuracy==null?'—':b.selfAccuracy+'%',delta(a.selfAccuracy,b?.selfAccuracy,'%p')],
  ['브라우저 답안 일치율',a.autoAccuracy==null?'—':a.autoAccuracy+'%',b?.autoAccuracy==null?'—':b.autoAccuracy+'%',delta(a.autoAccuracy,b?.autoAccuracy,'%p')]
 ]));
 const study=get('teacher-study-period-summary');
 if(study&&data.study){
  const v=data.study,sec=Number(v.studySeconds||0),hours=Math.floor(sec/3600),minutes=Math.floor((sec%3600)/60);
  const rate=v.dueDays?Math.round(Number(v.attendedPlannedDays||0)*100/Number(v.dueDays))+'%':'—';
  study.replaceChildren(
   card('계획 등록',v.plannedStudents+'명','0일 계획 '+v.zeroPlanStudents+'명'),
   card('계획 실천율',rate,(v.attendedPlannedDays||0)+' / '+(v.dueDays||0)+'일'),
   card('누적 공부시간',hours+'시간 '+String(minutes).padStart(2,'0')+'분','검토 대상·휴식시간 제외'),
   card('참여 일수',v.attendedDays+'일','학생별 참여일 합계')
  );
 }
 status.textContent='조회 기간: '+get('teacher-period-label').textContent+
  (data.partial?' · 현재 시각까지 실시간 집계 · 지난 기간 전체 확정치와 비교':' · 저장된 확정 통계 조회')+
  (data.cohortBasis==='late_backfill'?' · 사후 집계(과거 학적은 확인 가능한 범위로 복원)':'')+
  (!data.previousAvailable?' · 비교 기간 통계 미생성':'')+
  ' · 참여 '+a.activeStudents+'명';
}

const mailInputs={
 super_admin:get('teacher-mail-faculty'),
 student:get('teacher-mail-students')
};
const mailStatus=get('teacher-mail-status');
function setMailStatus(message,visible=false){
 mailStatus.textContent=message;
 mailStatus.classList.toggle('learn-sr-only',!visible);
}
function showMailState(type,enabled){
 const input=mailInputs[type];
 if(input)input.checked=enabled;
}
async function loadMailSettings(){
 setMailStatus('설정 확인 중…',true);
 for(const input of Object.values(mailInputs))input.disabled=true;
 const {data,error}=await db.functions.invoke('learning-admin',{body:{action:'mail_settings'}});
 if(error||!data?.ok||!Array.isArray(data.settings)){
  get('teacher-mail-settings').hidden=true;
  setMailStatus('메일 설정을 불러오지 못했습니다. 새로고침 후 다시 시도하세요.',true);
  return;
 }
 const faculty=data.settings.find(x=>x.report_type==='super_admin');
 const students=data.settings.find(x=>x.report_type==='student');
 if(typeof faculty?.enabled!=='boolean'||typeof students?.enabled!=='boolean'){
  get('teacher-mail-settings').hidden=true;
  setMailStatus('메일 설정을 확인할 수 없습니다.',true);
  return;
 }
 showMailState('super_admin',faculty.enabled);
 showMailState('student',students.enabled);
 for(const input of Object.values(mailInputs))input.disabled=false;
 get('teacher-mail-settings').hidden=false;
 setMailStatus('메일 발송 설정을 불러왔습니다.');
}
async function saveMailSetting(type,enabled){
 const input=mailInputs[type];
 const previous=!enabled;
 input.disabled=true;
 setMailStatus('설정 저장 중…');
 try{
  const {data,error}=await db.functions.invoke('learning-admin',{body:{
   action:'update_mail_setting',reportType:type,enabled
  }});
  if(error||!data?.ok||data.setting?.report_type!==type||data.setting?.enabled!==enabled)
   throw new Error('MAIL_SETTING_NOT_SAVED');
  showMailState(type,enabled);
  setMailStatus('저장되었습니다.');
 }catch(error){
  console.error('Weekly mail setting update failed',error);
  showMailState(type,previous);
  setMailStatus('저장하지 못했습니다. 다시 시도하세요.',true);
 }finally{
  input.disabled=false;
 }
}
for(const [type,input] of Object.entries(mailInputs)){
 input?.addEventListener('change',()=>{void saveMailSetting(type,input.checked);});
}
get('teacher-refresh').addEventListener('click',()=>{
 const button=get('teacher-refresh');button.disabled=true;button.textContent='새로고침 중...';
 void Promise.allSettled([load(),loadMailSettings()]).finally(()=>{button.disabled=false;button.textContent='통계 새로고침';});
});
load().catch(error=>{console.error('Professor learning report',error);get('teacher-status').textContent='학급 통계 조회에 실패했습니다. 슈퍼 관리자 계정으로 로그인해 주세요.';});
loadMailSettings().catch(error=>{console.error('Weekly mail settings',error);setMailStatus('발송 설정을 불러오지 못했습니다. 다시 시도해 주세요.',true);});
