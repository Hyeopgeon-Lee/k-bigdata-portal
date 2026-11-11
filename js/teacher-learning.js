/* Aggregated, super-admin-only data comes from the guarded Edge Function. */
const db=window.portalSupabaseClient, get=id=>document.getElementById(id);
const names={JAVA:'Java',C:'C언어',PYTHON:'Python',LINUX:'Ubuntu',NCP:'NCP',PRACTICAL:'정보처리'};
let yearFilter='',classFilter='';
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
function renderFilters(values){
 if(get('teacher-filters'))return;
 const panel=node('div',null,'learn-filter');panel.id='teacher-filters';
 const yearLabel=node('label','학년도');const years=node('select');years.id='teacher-year';
 years.add(new Option('전체 학년도',''));
 for(const year of values.availableYears||[])years.add(new Option(year+'학년도',String(year)));
 years.value=yearFilter;
 const clsLabel=node('label','반');const classes=node('select');classes.id='teacher-class';
 classes.add(new Option('전체 반',''));
 for(const item of values.availableClasses||[])classes.add(new Option(item,item));
 classes.value=classFilter;
 yearLabel.append(years);clsLabel.append(classes);panel.append(yearLabel,clsLabel);
 get('teacher-refresh').parentElement.prepend(panel);
 years.addEventListener('change',()=>{yearFilter=years.value;void load();});
 classes.addEventListener('change',()=>{classFilter=classes.value;void load();});
}
async function load(){
 const status=get('teacher-status');status.textContent='관리자 권한과 학급 통계를 확인하는 중입니다...';
 const {data,error}=await db.functions.invoke('learning-admin',{body:{
  action:'summary',...(yearFilter?{academicYear:Number(yearFilter)}:{}),...(classFilter?{className:classFilter}:{})
 }});
 if(error||!data?.ok||!data.current){get('teacher-content').hidden=true;status.textContent='관리자 통계에 접근할 수 없습니다. 슈퍼 관리자 로그인과 서버 설정을 확인해 주세요.';return;}
 renderFilters(data);
 get('teacher-content').hidden=false;
 const a=data.current,b=data.previous;
 get('teacher-summary').replaceChildren(
  card('집계 대상 재학생',data.cohortSize+'명','승인된 재학 학생만'),
  card('이번 주 참여율',a.participationRate===null?'대상 없음':a.participationRate+'%',a.activeStudents+'명 참여'),
  card('이번 주 풀이',a.unique+'문제',a.attempts+'회 시도 · 전주 대비 '+delta(a.attempts,b.attempts,'회')),
  card('자가평가 정답률',a.selfAccuracy===null?'집계 없음':a.selfAccuracy+'%',a.selfCorrect+'/'+a.selfTotal+'건 · 자동 판정과 구분')
 );
 get('teacher-subjects').replaceChildren(table(['과목','이번 주 시도','고유 풀이','오답 횟수','전주 시도'],
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
 else if(!data.topWrong?.length)wrong.append(node('p','이번 주 기록된 오답이 없습니다.','learn-empty'));
 else for(const rec of data.topWrong){
  const item=node('div',null,'learn-review-card');item.append(node('strong',rec.question),node('small',rec.count+'회 오답'));wrong.append(item);
 }
 get('teacher-comparison').replaceChildren(table(['지표','이번 주','지난주','변화'],[
  ['학습 참여 학생',a.activeStudents,b.activeStudents,delta(a.activeStudents,b.activeStudents,'명')],
  ['전체 풀이 시도',a.attempts,b.attempts,delta(a.attempts,b.attempts,'회')],
  ['서로 다른 풀이',a.unique,b.unique,delta(a.unique,b.unique,'문제')],
  ['자가평가 정답률',a.selfAccuracy===null?'—':a.selfAccuracy+'%',b.selfAccuracy===null?'—':b.selfAccuracy+'%',delta(a.selfAccuracy,b.selfAccuracy,'%p')],
  ['브라우저 답안 일치율',a.autoAccuracy===null?'—':a.autoAccuracy+'%',b.autoAccuracy===null?'—':b.autoAccuracy+'%',delta(a.autoAccuracy,b.autoAccuracy,'%p')]
 ]));
 status.textContent='학습통계 기준 주: '+date(data.weekStart)+'부터 · 참여 인원 '+a.activeStudents+'명 · 아직 학습기록이 없으면 0으로 표시합니다.';
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
