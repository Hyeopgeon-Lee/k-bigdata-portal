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

const deliveryStates={
 sent:['발송 요청 완료','sent'],
 failed:['발송 실패','failed'],
 pending:['처리 중','pending'],
 paused:['발송 보류','paused'],
 none:['발송 기록 없음','none']
};
function formatSentAt(iso){
 if(!iso)return '—';
 const value=new Date(iso);
 if(Number.isNaN(value.getTime()))return '—';
 return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(value);
}
function weekLabel(day){
 const beginning=new Date(day+'T00:00:00+09:00');
 if(Number.isNaN(beginning.getTime()))return day||'—';
 const end=new Date(beginning.getTime()+6*86400000);
 return date(beginning)+' ~ '+date(end);
}
function mailCard(title,state,value,description){
 const item=node('article',null,'learn-mail-card');
 const head=node('div',null,'learn-mail-card-head');
 const badge=node('span',deliveryStates[state]?.[0]||'확인 필요','learn-mail-tag');
 badge.dataset.state=state;
 head.append(node('strong',title),badge);
 item.append(head,node('div',value,'learn-mail-card-value'),node('p',description));
 return item;
}
function latestFaculty(history){
 const item=(history||[]).find(entry=>entry.weekStart);
 return item?.status||'none';
}
function renderMail(data){
 const period=(data.history||[])[0];
 const rec=(data.recentFaculty||[]).find(x=>x.weekStart===data.lastCompletedWeek);
 const state=rec?.status||'none';
 const facultyMessage=state==='sent'?'서비스 접수 시각: '+formatSentAt(rec.sentAt):
   state==='failed'?'발송 오류가 기록되었습니다. '+(rec.errorMessage||'오류 정보를 확인하세요.'):
   state==='pending'?'발송 요청을 처리 중입니다.':'이번 집계 주의 발송 기록이 없습니다.';
 const facultyValue=state==='sent'?'접수 완료':state==='failed'?'실패':state==='pending'?'대기 중':'기록 없음';
 const studentPaused=data.studentSendingPaused===true;
 const studentCount=period?.students?.sent||0;
 const studentState=studentPaused?'paused':period?.students?.failed?'failed':studentCount?'sent':period?.students?.pending?'pending':'none';
 const studentDescription=studentPaused?
   '학생용 이메일은 현재 발송하지 않습니다. 과거 기록은 아래에서 확인할 수 있습니다.':
   '실패 '+(period?.students?.failed||0)+'건 · 처리 중 '+(period?.students?.pending||0)+'건';
 get('teacher-mail-period').textContent='최근 완료 집계 주: '+weekLabel(data.lastCompletedWeek)+' (한국시간)';
 get('teacher-mail-cards').replaceChildren(
  mailCard('교수자 주간 리포트',state,facultyValue,facultyMessage),
  mailCard('학생 주간 리포트',studentState,studentPaused?'발송 중지':studentCount+'건 접수',studentDescription)
 );
 const meta=get('teacher-mail-meta');meta.replaceChildren();
 const metaRows=[
  '교수자 수신 계정: hglee67@kopo.ac.kr',
  '다음 예약 시각: '+formatSentAt(data.nextScheduledAt),
  '승인된 재학생: '+(data.activeStudents??0)+'명',
  '학생 이메일 신청: '+(data.optedInStudents??0)+'명',
  '기록 조회 시각: '+formatSentAt(data.checkedAt),
  '학생 발송 정책: '+(studentPaused?'일시 보류':'사용 중')
 ];
 for(const entry of metaRows)meta.append(node('p',entry));
 const history=(data.history||[]).map(item=>{
  const f=item.faculty||{},s=item.students||{};
  const faculty=f.sent?'접수 완료':f.failed?'실패':f.pending?'처리 중':'기록 없음';
  return [weekLabel(item.weekStart),faculty,(s.sent||0)+'건',(s.failed||0)+'건',(s.pending||0)+'건'];
 });
 get('teacher-mail-history').replaceChildren(history.length?
  table(['학습 집계 주','교수자','학생 접수','학생 실패','학생 대기'],history):
  node('p','확인할 주간 발송 기록이 없습니다.','learn-empty')
 );
 const recipients=data.recentStudents||[];
 get('teacher-mail-student-count').textContent='('+recipients.length+'건)';
 const studentRows=recipients.map(x=>[
  weekLabel(x.weekStart),x.recipientEmail,
  deliveryStates[x.status]?.[0]||'확인 필요',
  formatSentAt(x.sentAt),x.status==='failed'?(x.errorMessage||'오류 원인 미확인'):'—'
 ]);
 get('teacher-mail-students').replaceChildren(studentRows.length?
  table(['학습 집계 주','수신 이메일','발송 상태','접수 시각','실패 정보'],studentRows):
  node('p',studentPaused?'학생 이메일 발송이 보류되어 발송 기록이 없습니다.':'학생에게 발송한 리포트 기록이 없습니다.','learn-empty')
 );
 get('teacher-mail-content').hidden=false;
 const total=(data.history||[]).reduce((n,entry)=>n+(entry.students?.total||0),0);
 get('teacher-mail-status').textContent='최근 8주 서버 발송 기록을 확인했습니다. 학생 기록 '+total+'건 · 교수자와 학생의 상태를 분리해 표시합니다.';
}
async function loadDeliveries(){
 const status=get('teacher-mail-status');
 if(!status)return;
 status.textContent='실제 이메일 발송 기록을 확인하고 있습니다.';
 const {data,error}=await db.functions.invoke('learning-admin',{body:{action:'deliveries'}});
 if(error||!data?.ok||!Array.isArray(data.history)){
  get('teacher-mail-content').hidden=true;
  status.textContent='발송 기록을 조회하지 못했습니다. 관리자 로그인과 서버 연결을 확인한 뒤 다시 시도해 주세요.';
  return;
 }
 renderMail(data);
}
get('teacher-refresh').addEventListener('click',()=>{
 const button=get('teacher-refresh');button.disabled=true;button.textContent='새로고침 중...';
 void Promise.allSettled([load(),loadDeliveries()]).finally(()=>{button.disabled=false;button.textContent='통계 새로고침';});
});
load().catch(error=>{console.error('Professor learning report',error);get('teacher-status').textContent='학급 통계 조회에 실패했습니다. 슈퍼 관리자 계정으로 로그인해 주세요.';});
loadDeliveries().catch(error=>{console.error('Weekly email record lookup',error);get('teacher-mail-status').textContent='발송 이력을 불러오지 못했습니다. 다시 시도해 주세요.';});

