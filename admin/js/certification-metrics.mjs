/** Certificate metrics use the current enrolled roster, never registration rows as the denominator. */
export const gradeOf=p=>['1','2'].includes(String(p?.academic_year))?String(p.academic_year):'other';
export const gradeName=g=>g==='other'?'학년 미설정':g+'학년';
export const eligibleStudent=p=>Boolean(p?.user_id)&&p.enrollment_status==='enrolled'&&(!p.approval_status||p.approval_status==='approved')&&(!p.signup_type||p.signup_type==='student');
export const normalize=value=>String(value??'').trim().replace(/\s+/g,' ').toLocaleLowerCase('ko-KR');
export function cohort(profiles,grade=''){
 return [...new Map(profiles.filter(eligibleStudent).map(p=>[p.user_id,p])).values()].filter(p=>!grade||gradeOf(p)===grade);
}
export const isFinal=c=>c.pass_status==='final'&&c.verification_status==='verified';
export const isWritten=c=>c.pass_status==='written'&&c.verification_status==='verified';
export function kstMonth(now=new Date()){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
 return parts.year+'-'+parts.month;
}
export function recentMonths(now=new Date(),count=6){
 const [y,m]=kstMonth(now).split('-').map(Number);
 return Array.from({length:count},(_,i)=>new Date(Date.UTC(y,m-1-(count-1-i),1)).toISOString().slice(0,7));
}
const certKey=c=>c.certificate_code&&c.certificate_code!=='other'?'code:'+c.certificate_code:'name:'+normalize(c.certificate_name);
const byName=(a,b)=>String(a).localeCompare(String(b),'ko');
export function summarize(profiles,records,grade='',now=new Date()){
 const roster=cohort(profiles,grade);
 const members=new Map(roster.map(p=>[p.user_id,p]));
 const scoped=records.filter(c=>members.has(c.user_id));
 const byStudent=new Map(roster.map(p=>[p.user_id,[]]));
 for(const c of scoped)byStudent.get(c.user_id).push(c);
 const students=roster.map(profile=>{
  const rows=byStudent.get(profile.user_id);
  const final=new Map();
  for(const record of rows.filter(isFinal).sort((a,b)=>String(a.final_pass_date||'').localeCompare(String(b.final_pass_date||'')))){
   if(!final.has(certKey(record)))final.set(certKey(record),record);
  }
  const written=new Set(rows.filter(isWritten).map(certKey).filter(key=>!final.has(key)));
  const pending=rows.filter(c=>c.verification_status==='pending').length;
  const rejected=rows.filter(c=>c.verification_status==='rejected').length;
  return {profile,rows,final:[...final.values()],finalCount:final.size,writtenCount:written.size,pending,rejected,
   state:final.size?'acquired':written.size?'written':pending?'pending':rejected?'rejected':'unregistered'};
 });
 const holders=students.filter(s=>s.finalCount>0).length;
 const total=students.length;
 const grades=(grade?[grade]:['1','2',...(students.some(s=>gradeOf(s.profile)==='other')?['other']:[])]);
 const gradeRates=grades.map(g=>{
  const list=students.filter(s=>gradeOf(s.profile)===g),n=list.filter(s=>s.finalCount>0).length;
  return {grade:g,total:list.length,holders:n,rate:list.length?Math.round(n/list.length*1000)/10:null};
 });
 const typeMap=new Map(),months=recentMonths(now),monthly=months.map(month=>({month,counts:Object.fromEntries(grades.map(g=>[g,0]))}));
 for(const student of students){
  const g=gradeOf(student.profile);
  for(const c of student.final){
   const key=certKey(c);
   if(!typeMap.has(key))typeMap.set(key,{name:c.certificate_name,counts:Object.fromEntries(grades.map(g=>[g,0])),total:0});
   const type=typeMap.get(key);type.counts[g]++;type.total++;
   const month=monthly.find(m=>m.month===String(c.final_pass_date||'').slice(0,7));
   if(month)month.counts[g]++;
  }
 }
 return {roster,scoped,students,total,holders,rate:total?Math.round(holders/total*1000)/10:null,noVerified:total-holders,
  finalCount:students.reduce((n,s)=>n+s.finalCount,0),pending:scoped.filter(c=>c.verification_status==='pending').length,
  holdings:[students.filter(s=>s.finalCount===0).length,students.filter(s=>s.finalCount===1).length,students.filter(s=>s.finalCount===2).length,students.filter(s=>s.finalCount>=3).length],
  gradeRates,grades,types:[...typeMap.values()].sort((a,b)=>b.total-a.total||byName(a.name,b.name)),monthly};
}
export function reviewRows(model,query='',status='pending'){
 const needle=normalize(query),members=new Map(model.roster.map(p=>[p.user_id,p]));
 return model.scoped.filter(c=>(!status||c.verification_status===status)&&[members.get(c.user_id).full_name,members.get(c.user_id).student_no,c.certificate_name].some(v=>normalize(v).includes(needle)))
  .sort((a,b)=>Number(b.verification_status==='pending')-Number(a.verification_status==='pending')||String(b.created_at||'').localeCompare(String(a.created_at||''))||byName(a.id,b.id));
}
export function studentRows(model,query='',state='',sort='name'){
 const needle=normalize(query);
 return model.students.filter(s=>(!state||(state==='no-verified'?s.finalCount===0:state==='written'?s.writtenCount>0:state==='pending'?s.pending>0:s.state===state))&&
  [s.profile.full_name,s.profile.student_no,...s.rows.map(c=>c.certificate_name)].some(v=>normalize(v).includes(needle)))
  .sort((a,b)=>(sort==='high'?b.finalCount-a.finalCount:sort==='low'?a.finalCount-b.finalCount:0)||byName(a.profile.full_name,b.profile.full_name)||byName(a.profile.student_no,b.profile.student_no));
}
