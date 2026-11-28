export const DAY=86400000,KST=9*3600000;
export const dateKey=(ms)=>new Date(ms+KST).toISOString().slice(0,10);
export const dateMs=(key)=>Date.parse(key+'T00:00:00+09:00');
export const shift=(key,days)=>dateKey(dateMs(key)+days*DAY);
export function lastWeek(now=Date.now()){
 const local=new Date(now+KST),mon=Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate()-(local.getUTCDay()+6)%7)-KST;
 return dateKey(mon-7*DAY);
}
export const validWeek=(key)=>typeof key==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(key)&&Number.isFinite(dateMs(key))&&dateKey(dateMs(key))===key&&new Date(dateMs(key)+KST).getUTCDay()===1;
export const BANKS={coding:'기초학습',ncp:'NCP',practical:'정보처리 실기',engineer:'정보처리기사 필기',industrial:'산업기사 필기'};
export function summarize(week,attempts,written,sessions,plan){
 const start=dateMs(week),end=start+7*DAY;
 const all=[...attempts.map(a=>({bank:a.bank,time:Date.parse(a.submitted_at),result:a.result,question:a.question_id})),...written.map(a=>({bank:a.exam_type,time:Number(a.attempted_at),result:a.correct===true?'correct':a.correct===false?'incorrect':'ungraded',question:a.question_id}))].filter(a=>a.bank in BANKS&&Number.isFinite(a.time));
 const last=all.filter(a=>a.time>=start&&a.time<end);
 const metric=rows=>{const correct=rows.filter(a=>a.result==='correct').length,graded=rows.filter(a=>['correct','incorrect'].includes(a.result)).length;return {attempts:rows.length,questions:new Set(rows.map(a=>a.bank+':'+a.question)).size,correct,graded,accuracy:graded?Math.round(correct*100/graded):null}};
 const sessionTime=s=>Date.parse(s.started_at);
 const approved=s=>s.status==='completed';
 const seconds=s=>Math.max(0,Number(s.duration_seconds)||0);
 const studyIn=(a,b)=>sessions.filter(s=>sessionTime(s)>=a&&sessionTime(s)<b);
 const hours=rows=>rows.filter(approved).reduce((n,s)=>n+seconds(s),0);
 const weekly=studyIn(start,end);
 return {
  ...metric(last),study_seconds:hours(weekly),review_pending:weekly.filter(s=>s.status==='needs_review'&&!s.review_outcome).length,
  active_days:new Set(last.map(a=>dateKey(a.time))).size,
  subjects:Object.entries(BANKS).map(([id,label])=>({id,label,...metric(last.filter(a=>a.bank===id))})),
  trend:Array.from({length:4},(_,i)=>{const a=start-(3-i)*7*DAY,b=a+7*DAY;return {week:dateKey(a),...metric(all.filter(x=>x.time>=a&&x.time<b)),study_seconds:hours(studyIn(a,b))}}),
  days:Array.from({length:7},(_,i)=>({date:shift(week,i),study_seconds:hours(studyIn(start+i*DAY,start+(i+1)*DAY)),attempts:last.filter(x=>dateKey(x.time)===shift(week,i)).length})),
  plan_days:Array.isArray(plan?.weekdays)?plan.weekdays.length:null
 };
}
// View-time policy: preserve the original weekly snapshot and all aggregate metrics.
export function reportForCertificates(report,certificates){
 if(!report)return report;
 const relevant=(Array.isArray(certificates)?certificates:[]).filter(c=>
  ['engineer','industrial'].includes(c?.certificate_code)&&c.verification_status!=='rejected');
 const acquired=relevant.some(c=>c.pass_status==='final');
 const passedWritten=new Set(relevant.filter(c=>c.pass_status==='written').map(c=>c.certificate_code));
 if(!acquired&&!passedWritten.size)return report;
 const learning=report.payload.learning;
 const subjects=acquired
  ?learning.subjects.filter(s=>['coding','ncp'].includes(s.id)&&s.attempts>0)
  :learning.subjects.filter(s=>!passedWritten.has(s.id));
 return {...report,payload:{...report.payload,learning:{...learning,
  subject_scope:acquired?'fundamentals':'written_pass',subjects}}};
}
export function scheduleEvents(events,grade,week){
 const from=shift(week,7),to=shift(week,13);
 return (Array.isArray(events)?events:[]).filter(e=>e?.published===true&&['all',String(grade)].includes(String(e.targetGrade))&&typeof e.title==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(e.startDate)&&/^\d{4}-\d{2}-\d{2}$/.test(e.endDate)&&e.startDate<=to&&e.endDate>=from)
 .map(e=>({title:e.title.slice(0,140),start:e.startDate,end:e.endDate,time:String(e.startTime||'').slice(0,5),category:String(e.category||'').slice(0,30),important:e.important===true}))
 .sort((a,b)=>a.start.localeCompare(b.start)||a.time.localeCompare(b.time)||a.title.localeCompare(b.title));
}
export function suggestedTasks(learning,career,events){
 const tasks=[];
 if(learning.attempts===0)tasks.push({id:'learning-start',label:'학습 문제 풀이 시작하기',href:'my-learning.html'});
 else if(learning.graded>learning.correct)tasks.push({id:'learning-review',label:'지난주 오답 다시 풀기',href:'my-learning.html'});
 else tasks.push({id:'learning-next',label:'이번 주 학습 이어가기',href:'my-learning.html'});
 if(!learning.study_seconds)tasks.push({id:'study-plan',label:'이번 주 자율학습 계획 세우기',href:'study.html'});
 else tasks.push({id:'study-record',label:'이번 주 자율학습 실천하기',href:'study.html'});
 if(!career.registered)tasks.push({id:'ready-register',label:'취업 준비 정보 등록하기',href:'ready.html'});
 else for(const issue of career.issues.slice(0,2))tasks.push({id:'ready-'+issue.code,label:issue.label,href:'ready.html'});
 if(events.length)tasks.push({id:'schedule-review',label:'이번 주 학과 일정과 마감 확인하기',href:'schedule.html'});
 return tasks;
}
