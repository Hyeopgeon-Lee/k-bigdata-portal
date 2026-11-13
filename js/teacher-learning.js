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
 for(const record of rows){const row=node('tr');record.forEach((val,index)=>{const cell=node('td',val);cell.dataset.label=headers[index];row.append(cell);});body.append(row);}
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
 history.append(previous,label,next,today);panel.append(history);
 get('teacher-refresh').parentElement.prepend(panel);
 updatePeriodControls();
}
function updatePeriodControls(data){
 const previous=get('teacher-period-previous'),next=get('teacher-period-next'),current=get('teacher-period-current');
 if(!previous||!next||!current)return;
 previous.disabled=periodOffset<=(periodMode==='week'?-52:-24);
 next.disabled=periodOffset>=0;
 current.disabled=periodOffset===0;
 const periodLabel=get('teacher-period-label');
 if(data?.periodStart&&data?.periodEnd){
  const last=new Date(Date.parse(data.periodEnd)-1).toISOString();
  periodLabel.textContent=periodMode==='week'?
   date(data.periodStart)+' ~ '+date(last):
   new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long'}).format(new Date(data.periodStart));
 }else periodLabel.textContent=periodOffset===0?(periodMode==='week'?'이번 주':'이번 달'):'기간 조회 중';
}
async function load(){
 const status=get('teacher-status'),sequence=++requestSequence;
 renderFilters();updatePeriodControls();
 status.textContent='선택한 학년과 기간의 학습통계를 불러오는 중입니다...';
 const {data,error}=await db.functions.invoke('learning-admin',{body:{
  action:'summary',period:periodMode,offset:periodOffset,...(gradeFilter?{grade:Number(gradeFilter)}:{})
 }});
 if(sequence!==requestSequence)return;
 if(error||!data?.ok||!data.current){get('teacher-content').hidden=true;status.textContent='학습통계를 조회하지 못했습니다. 관리자 권한과 서버 상태를 확인해 주세요.';return;}
 updatePeriodControls(data);
 get('teacher-content').hidden=false;
 const a=data.current,b=data.previous;
 const thisPeriod=periodMode==='week'?'해당 주':'해당 월';
 const lastPeriod=periodMode==='week'?'전주':'전월';
 const compared=lastPeriod+(data.partial?' 같은 경과 기간':'');
 get('teacher-summary').replaceChildren(
  card('집계 대상 재학생',data.cohortSize+'명','승인된 재학 학생만'),
  card(thisPeriod+' 참여율',a.participationRate===null?'대상 없음':a.participationRate+'%',a.activeStudents+'명 참여'),
  card(thisPeriod+' 풀이',a.unique+'문제',a.attempts+'회 시도 · '+compared+' 대비 '+delta(a.attempts,b.attempts,'회')),
  card('자가평가 정답률',a.selfAccuracy===null?'집계 없음':a.selfAccuracy+'%',a.selfCorrect+'/'+a.selfTotal+'건 · 자동 판정과 구분')
 );
 get('teacher-subjects').replaceChildren(table(['과목',thisPeriod+' 시도','고유 풀이','오답 횟수',lastPeriod+' 시도'],
  Object.keys(names).map(key=>[names[key],a.subjects?.[key]?.attempts??0,a.subjects?.[key]?.unique??0,a.subjects?.[key]?.wrong??0,b.subjects?.[key]?.attempts??0])
 ));
 const rates=get('teacher-rates');rates.replaceChildren();
 for(const [label,correct,total,rate] of [
  ['자가평가',a.selfCorrect,a.selfTotal,a.selfAccuracy],
  ['브라우저 정답 비교',a.autoCorrect,a.autoTotal,a.autoAccuracy]
 ]){
  const item=node('article',null,'learn-rate');item.append(node('span',label),node('strong',rate===null?'집계 없음':rate+'%'),node('small',correct+' / '+total+'건 · 미판정 제외'));rates.append(item);
 }
 const wrong=get('teacher-wrong');wrong.replaceChildren();
 if(data.smallCohortHidden)wrong.append(node('p','5명 미만 학급의 문제별 오답 통계는 개인정보 보호를 위해 표시하지 않습니다.','learn-empty'));
 else if(!data.topWrong?.length)wrong.append(node('p','선택한 기간에 기록된 오답이 없습니다.','learn-empty'));
 else for(const rec of data.topWrong){
  const item=node('div',null,'learn-review-card');item.append(node('strong',rec.question),node('small',rec.count+'회 오답'));wrong.append(item);
 }
 get('teacher-comparison').replaceChildren(table(['지표',thisPeriod,compared,'변화'],[
  ['학습 참여 학생',a.activeStudents,b.activeStudents,delta(a.activeStudents,b.activeStudents,'명')],
  ['전체 풀이 시도',a.attempts,b.attempts,delta(a.attempts,b.attempts,'회')],
  ['서로 다른 풀이',a.unique,b.unique,delta(a.unique,b.unique,'문제')],
  ['자가평가 정답률',a.selfAccuracy===null?'—':a.selfAccuracy+'%',b.selfAccuracy===null?'—':b.selfAccuracy+'%',delta(a.selfAccuracy,b.selfAccuracy,'%p')],
  ['브라우저 답안 일치율',a.autoAccuracy===null?'—':a.autoAccuracy+'%',b.autoAccuracy===null?'—':b.autoAccuracy+'%',delta(a.autoAccuracy,b.autoAccuracy,'%p')]
 ]));
 status.textContent='조회 기간: '+get('teacher-period-label').textContent+
  ' · '+(data.partial?'진행 중인 기간은 현재 시점까지 집계 · '+compared+' 비교':'종료된 기간 전체 집계')+
  ' · 참여 '+a.activeStudents+'명 · 기록이 없으면 0으로 표시합니다.';
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
