/** Cohort metrics computed only from the authenticated admin roster. */
export const READY_STATES=['미등록','관심 필요','준비 중','준비 양호','준비 우수','상태 미확인'];
export const NOTION_LABELS={UNREGISTERED:'미등록',INVALID_URL:'링크 확인 필요',NOT_CONFIGURED:'관리자 설정 필요',AUTH_REQUIRED:'학생 동의 대기',CONNECTED:'연결 완료',RECONNECT_REQUIRED:'다시 연결 필요',UNKNOWN:'상태 확인 필요'};
export const CHECK_LABELS={SUCCESS:'정상',PARTIAL:'부분 점검',FAILED:'점검 실패',SKIPPED:'다시 시도 필요',AUTH_REQUIRED:'인증 필요',NOT_CONFIGURED:'관리자 설정 필요'};
const knownNumber=value=>value!==null&&value!==undefined&&String(value).trim()!==''&&Number.isFinite(Number(value))&&Number(value)>=0;
export function effectiveStatus(row){
 if(!row.registered)return '미등록';
 const s=row.evaluation?.status;
 return READY_STATES.slice(1,-1).includes(s)?s:'상태 미확인';
}
export function githubCategory(row){
 const e=row.evaluation||{},g=e.github||{};
 if(!row.registered||!Number(e.repository?.count||0))return '저장소 미등록';
 if(!e.github_fresh||!['SUCCESS','PARTIAL'].includes(g.check_status))return '점검 필요';
 if(knownNumber(g.active_days_7d)&&Number(g.active_days_7d)>=3)return '주 3일 이상 활동';
 if(g.check_status==='PARTIAL')return '부분 점검';
 if(knownNumber(g.inactive_days)&&Number(g.inactive_days)>=14)return '14일 이상 미활동';
 if(!knownNumber(g.active_days_7d))return '점검 필요';
 return '주 3일 미만 활동';
}
export function notionCategory(row){
 if(!row.student?.notion_url)return 'UNREGISTERED';
 return Object.hasOwn(NOTION_LABELS,row.notion_connection?.status)?row.notion_connection.status:'UNKNOWN';
}
export function notionLabel(row){return NOTION_LABELS[notionCategory(row)]}
const count=(rows,fn)=>rows.filter(fn).length;
export const percentage=(num,den)=>den?Math.round(1000*num/den)/10:null;
export const eligibleStudent=row=>row.member?.enrollment_status==='enrolled';
export function cohort(rows,grade=''){
 return rows.filter(row=>eligibleStudent(row)&&(!grade||String(row.member?.academic_year)===String(grade)));
}
export function filterStudents(rows,state='all',search=''){
 const needle=search.trim().toLocaleLowerCase('ko-KR');
 return cohort(rows).filter(row=>(state==='all'||effectiveStatus(row)===state)&&[row.member?.full_name,row.member?.student_no,row.student?.career_target,row.student?.github_username].map(v=>String(v||'')).join(' ').toLocaleLowerCase('ko-KR').includes(needle));
}
export function summarize(rows){
 rows=cohort(rows);
 const status=READY_STATES.map(label=>[label,count(rows,r=>effectiveStatus(r)===label)]);
 const github=['주 3일 이상 활동','주 3일 미만 활동','14일 이상 미활동','부분 점검','점검 필요','저장소 미등록'].map(label=>[label,count(rows,r=>githubCategory(r)===label),label==='14일 이상 미활동'?'warning':undefined]);
 const notion=['CONNECTED','AUTH_REQUIRED','RECONNECT_REQUIRED','INVALID_URL','NOT_CONFIGURED','UNKNOWN','UNREGISTERED'].map(key=>[NOTION_LABELS[key],count(rows,r=>notionCategory(r)===key),['RECONNECT_REQUIRED','INVALID_URL','NOT_CONFIGURED','UNKNOWN'].includes(key)?'warning':undefined]);
 return {total:rows.length,registered:count(rows,r=>r.registered),attention:count(rows,r=>effectiveStatus(r)==='관심 필요'),weekly:count(rows,r=>githubCategory(r)==='주 3일 이상 활동'),inactive:count(rows,r=>githubCategory(r)==='14일 이상 미활동'),linked:count(rows,r=>!!r.student?.notion_url),connected:count(rows,r=>notionCategory(r)==='CONNECTED'),certificateHolders:count(rows,r=>Number(r.certificate_count)>0),status,github,notion};
}
export const checkTargets=rows=>cohort(rows).filter(r=>r.registered);
export function gradeComparison(rows){
 const groups=[['1학년',cohort(rows,'1')],['2학년',cohort(rows,'2')]];
 const other=cohort(rows).filter(r=>!['1','2'].includes(String(r.member?.academic_year)));
 if(other.length)groups.push(['학년 미설정',other]);
 return groups.map(([label,group])=>{const registered=count(group,r=>r.registered);return [label+' · '+registered+'/'+group.length+'명',percentage(registered,group.length)]});
}
export function documentCounts(rows){
 const second=cohort(rows,'2');
 return {total:second.length,rows:[['이력서 최종 완성',count(second,r=>r.registered&&r.student?.resume_status==='최종 완성')],['자기소개서 기본본 이상',count(second,r=>r.registered&&['기본본 완성','기업 지원 가능'].includes(r.student?.cover_letter_status))]]};
}
export function snapshotRows(snapshots){
 return snapshots.filter(x=>x.data?.cohort==='enrolled_only').sort((a,b)=>String(a.snapshot_date).localeCompare(String(b.snapshot_date))).slice(-8).map(x=>[String(x.snapshot_date||''),knownNumber(x.data?.registered)?Number(x.data.registered):null]);
}
export const labelCheck=(value)=>CHECK_LABELS[value]||(/[가-힣]/.test(String(value||''))?String(value):'미점검');
