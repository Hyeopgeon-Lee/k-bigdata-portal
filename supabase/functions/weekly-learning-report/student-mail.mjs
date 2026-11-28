// Pure, email-client compatible student report rendering. All personal content is escaped.
import {dateKey,reportForCertificates} from "../student-weekly-report/report.mjs";
const portal='https://portal.k-bigdata.kr/';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=v=>Number.isFinite(Number(v))?Math.max(0,Number(v)):0;
const number=v=>n(v).toLocaleString('ko-KR');
const fmtDate=d=>{const [y,m,day]=String(d||'').split('-').map(Number);return m&&day?m+'월 '+day+'일':'미확인'};
const short=d=>String(d||'').slice(5).replace('-','.');
const duration=s=>{const min=Math.round(n(s)/60);return min>=60?Math.floor(min/60)+'시간 '+min%60+'분':min+'분'};
const isTrue=v=>['true','1','yes','on'].includes(String(v??'').trim().toLowerCase());
const dateOnly=v=>{const d=String(v??'').slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d+'T00:00:00Z'))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d?d:''};
const newest=(a,b)=>String(b.approved_at||b.created_at||'').localeCompare(String(a.approved_at||a.created_at||''))||String(a.id).localeCompare(String(b.id));
export function selectNews(rows){return (rows||[]).filter(x=>x.status==='APPROVED'&&String(x.title||'').trim()).sort(newest).slice(0,3)}
export function selectJobs(rows,grade,today){
 if(Number(grade)!==2)return [];
 return (rows||[]).filter(x=>x.status==='APPROVED'&&String(x.job_title||'').trim()&&(isTrue(x.always_open)||(dateOnly(x.deadline)&&dateOnly(x.deadline)>=today)))
 .sort((a,b)=>(isTrue(a.always_open)?'9999-12-31':dateOnly(a.deadline)).localeCompare(isTrue(b.always_open)?'9999-12-31':dateOnly(b.deadline))||newest(a,b));
}
export const studentEligible=(p,adminIds=new Set())=>p?.signup_type==='student'&&p.approval_status==='approved'&&p.enrollment_status==='enrolled'&&[1,2].includes(Number(p.academic_year))&&!adminIds.has(p.user_id)&&!!p.email;
const row=(content,style='')=>'<tr><td style="'+style+'">'+content+'</td></tr>';
const table=(body,style='')=>'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;'+style+'">'+body+'</table>';
const paragraph=(v,style='')=>'<p style="margin:0 0 9px;'+style+'">'+v+'</p>';
const muted='color:#64748b;font-size:13px;line-height:1.65;';
const section=(title,body)=>'<tr><td style="padding:23px 18px 19px;border-top:1px solid #e1e8f1;"><h2 style="margin:0 0 13px;font-size:19px;line-height:1.35;color:#183961;">'+esc(title)+'</h2>'+body+'</td></tr>';
const link=(path,label,primary=false)=>table(row('<a href="'+portal+path+'" style="display:block;color:'+(primary?'#ffffff':'#2454a4')+';font-weight:bold;text-decoration:none;font-size:15px;line-height:22px;padding:13px 10px;border:1px solid '+(primary?'#17488f':'#bdd2f0')+';border-radius:9px;background:'+(primary?'#17488f':'#f3f7fd')+';text-align:center;">'+esc(label)+' &rarr;</a>','padding:9px 0 0;'));
const pill=(label,fg='#2859a8',bg='#edf4ff')=>'<span style="display:inline-block;border-radius:5px;background:'+bg+';color:'+fg+';padding:3px 7px;font-weight:bold;font-size:12px;">'+esc(label)+'</span>';
const tile=(label,value,note,bg,fg)=>'<td width="50%" valign="top" style="padding:5px;">'+table(row(paragraph(esc(label),'font-size:13px;color:#53657c;')+'<p style="margin:0 0 5px;font-size:21px;line-height:1.35;font-weight:bold;color:'+fg+';">'+esc(value)+'</p>'+paragraph(esc(note),muted+'margin:0;'),'background:'+bg+';padding:13px;border-radius:10px;'))+'</td>';
const bar=(v,max,color='#3978cc')=>{const pct=Math.max(0,Math.min(100,Math.round(n(v)/Math.max(1,max)*100)));return table('<tr>'+(pct?'<td bgcolor="'+color+'" width="'+pct+'%" style="height:10px;font-size:0;line-height:10px;">&nbsp;</td>':'')+(pct<100?'<td bgcolor="#e6edf6" width="'+(100-pct)+'%" style="height:10px;font-size:0;line-height:10px;">&nbsp;</td>':'')+'</tr>','border-radius:5px;overflow:hidden;')};
const metricRows=(list,label,value,detail)=>{const max=Math.max(1,...list.map(value));return list.map((x,i)=>table('<tr><td style="padding:3px 0;font-weight:bold;color:#334155;font-size:14px;">'+esc(label(x))+'</td><td align="right" style="padding:3px 0;font-size:14px;color:#183961;">'+esc(detail(x))+'</td></tr>'+row(bar(value(x),max,i===list.length-1?'#2456ad':'#6b99dc'),'padding:4px 0 10px;').replace('<td ','<td colspan="2" '))).join('')};
const infoRow=(name,value)=>'<tr><td style="padding:9px 0;border-bottom:1px solid #e6edf5;color:#52657e;font-size:14px;">'+esc(name)+'</td><td align="right" style="padding:9px 0;border-bottom:1px solid #e6edf5;font-size:14px;font-weight:bold;color:#183961;">'+esc(value??'미확인')+'</td></tr>';
const clip=(v,max=140)=>{const s=String(v??'').replace(/\s+/g,' ').trim();return s.length>max?s.slice(0,max)+'…':s};
const NEWS_TYPES={EMPLOYMENT:"취업",JOB_CHANGE:"이직",PROMOTION:"승진·보직",STARTUP:"창업",GRADUATE_SCHOOL:"대학원·학위",ACHIEVEMENT:"수상·성과",MARRIAGE:"결혼",BIRTH_SON:"득남",BIRTH_DAUGHTER:"득녀",OBITUARY:"부고",OTHER:"기타"};
const detailPath=(kind,id)=>'alumni/'+kind+'-detail.html?id='+encodeURIComponent(String(id??''));
const panel=body=>table(row(body,'padding:12px;border:1px solid #dce5f0;border-radius:9px;'),'margin-bottom:9px;');
export function renderStudentMail(student,report,certificates=[],newsRows=[],jobRows=[],today=dateKey(Date.now())){
 if(!report?.payload)throw Error('SNAPSHOT_MISSING');
 const p=reportForCertificates(report,certificates).payload,l=p.learning,c=p.career,cal=p.calendar;
 const grade=Number(student.academic_year),news=selectNews(newsRows),jobs=selectJobs(jobRows,grade,today);
 const previous=l.trend?.at(-2)?.attempts,delta=n(l.attempts)-n(previous);
 const range=fmtDate(p.week_start)+' ~ '+fmtDate(p.week_end);
 const title='[빅데이터SW학과] '+Number(p.week_start.slice(5,7))+'월 '+Math.ceil(Number(p.week_start.slice(8,10))/7)+'주차 나의 주간 리포트';
 let seq=0;
 const add=(label,body)=>section(String(++seq).padStart(2,'0')+'. '+label,body);
 let content=row('<p style="margin:0 0 6px;color:#c6d9f5;font-size:12px;letter-spacing:.06em;">BIG DATA SOFTWARE · WEEKLY REPORT</p><h1 style="margin:0 0 9px;color:#fff;font-size:26px;line-height:1.35;">나의 주간 성장 리포트</h1><p style="margin:0;color:#e1edff;font-size:15px;">'+esc(range)+' · '+grade+'학년</p>','background:#15396c;padding:23px 18px;border-radius:12px 12px 0 0;');
 content+=row(paragraph('<strong>'+esc(clip(student.full_name||'학생',80))+' 학생님, 안녕하세요!</strong>','font-size:16px;')+paragraph('지난주 성장 기록과 이번 주 학과 소식을 전해드립니다.',muted)+table('<tr>'+tile('문제 풀이',number(l.attempts)+'회',previous==null?'지난주 기록':'전주 대비 '+(delta>0?'+':'')+delta+'회','#edf4ff','#2859ad')+tile('판정 정답률',l.accuracy==null?'집계 없음':number(l.accuracy)+'%','자가평가 포함','#f4f0ff','#7350c4')+'</tr><tr>'+tile('자율학습',duration(l.study_seconds),l.review_pending?'확인 대기 '+number(l.review_pending)+'건':'완료 기록 기준','#eaf7f3','#14816b')+tile('취업 준비',c.status||'미확인',c.github_days==null?'GitHub 확인 필요':'GitHub 활동 '+number(c.github_days)+'일','#fff4e6','#af701e')+'</tr>'),'padding:18px 13px 14px;');
 if(l.trend?.length)content+=add('최근 4주 학습 추이',paragraph('주차별 문제 풀이 횟수',muted)+metricRows(l.trend,x=>short(x.week),x=>x.attempts,x=>number(x.attempts)+'회'));
 const subjects=l.subjects||[];
 if(subjects.length)content+=add('과목별 학습 현황',paragraph('풀이 횟수 · 판정 정답률 (자가평가 포함)',muted)+metricRows(subjects.filter(x=>x.id!=='interview'),x=>x.label,x=>x.attempts,x=>number(x.attempts)+'회 · '+(x.accuracy==null?'—':number(x.accuracy)+'%'))+subjects.filter(x=>x.id==='interview'&&x.attempts>0).map(x=>panel(pill('기술면접')+' <strong>'+number(x.attempts)+'회 연습 · '+number(x.questions)+'문항</strong>')).join(''));
 const github=c.github_days==null?paragraph('GitHub 활동: 점검 확인 필요',muted):paragraph('최근 7일 중 GitHub 활동 <strong>'+number(c.github_days)+'일 / 7일</strong>',muted)+bar(Math.min(7,n(c.github_days)),7,'#20976c');
 content+=add('취업 준비 현황',(!c.registered?paragraph('취업 준비 정보가 아직 등록되지 않았습니다.',muted):'')+github+table(infoRow('Repository',number(c.repositories)+'개 등록')+infoRow('README',c.readme)+infoRow('Notion · 포트폴리오',c.portfolio)+infoRow('최종 합격 자격증',number(c.certificates)+'개')+(c.documents?infoRow('이력서',c.documents.resume)+infoRow('자기소개서',c.documents.cover_letter):'')));
 const events=cal.events||[];
 content+=add('이번 주 학과 일정',paragraph(esc(fmtDate(p.schedule_start)+' ~ '+fmtDate(p.schedule_end))+(cal.stale?' · 이전 일정 기준':''),muted)+(events.length?events.slice(0,6).map(e=>panel(pill(short(e.start)+(e.end!==e.start?'~'+short(e.end):'')+(e.time?' '+e.time:''))+' '+(e.important?pill('중요','#a35a16','#fff4e6')+' ':'')+paragraph(esc(clip(e.title,140)),'font-size:15px;font-weight:bold;margin:5px 0 0;'))).join(''):paragraph(cal.available?'표시할 공개 일정이 없습니다.':'학과 일정 최신 정보를 확인해 주세요.',muted))+(events.length>6?paragraph('외 '+(events.length-6)+'건',muted):'')+link('schedule.html','학과 일정 전체 보기'));
 if(news.length)content+=add('동문소식',news.map(x=>panel(pill(NEWS_TYPES[x.news_type]||'동문소식')+paragraph('<a style="color:#183961;text-decoration:none;font-weight:bold;" href="'+portal+detailPath('news',x.id)+'">'+esc(clip(x.title,100))+'</a>','margin:6px 0 4px;')+(x.content?paragraph(esc(clip(x.content,120)),muted+'margin:0;'):''))).join('')+link('alumni/news.html','동문소식 전체 보기'));
 if(jobs.length)content+=add('채용공고 '+jobs.length+'건',jobs.slice(0,3).map(x=>{
  const dl=dateOnly(x.deadline),d=isTrue(x.always_open)?null:Math.round((Date.parse(dl)-Date.parse(today))/86400000);
  return panel(pill(isTrue(x.always_open)?'상시채용':'접수 중','#147455','#e9f7ef')+(d!=null?' '+pill(d===0?'D-DAY':'D-'+d,d<=7?'#9a5714':'#2859a8',d<=7?'#fff1df':'#edf4ff'):'')+paragraph(esc(clip(x.company,80)),muted+'margin:5px 0 1px;')+paragraph('<a style="font-weight:bold;color:#183961;text-decoration:none;" href="'+portal+detailPath('job',x.id)+'">'+esc(clip(x.job_title,120))+'</a>','margin:0 0 3px;')+paragraph(esc([x.employment_type,x.location,x.recruit_type].filter(Boolean).join(' · ')),muted+'margin:0;')+(d!=null?paragraph('접수 마감: '+esc(fmtDate(dl)),'color:#a35a16;font-size:13px;margin:5px 0 0;'):''));
 }).join('')+link('alumni/jobs.html','채용공고 전체 보기'));
 const tasks=(p.tasks||[]).slice(0,5).map(t=>t.label);
 if(jobs.length)tasks.push('관심 기업 채용공고 확인하기');
 if(tasks.length)content+=add('이번 주 추천 활동',tasks.map(t=>paragraph('&#9633; '+esc(t),'font-size:14px;color:#334155;margin:0 0 8px;')).join(''));
 content+=row(link('weekly-report.html?week='+encodeURIComponent(p.week_start),'나의 주간 리포트 상세 보기',true)+paragraph('로그인 후 본인의 리포트를 확인할 수 있습니다. 정답률은 판정 기록이며 시험 성적이 아닙니다.',muted+'margin:12px 0 0;'),'padding:10px 18px 20px;');
 content+=row(paragraph('한국폴리텍대학 서울강서캠퍼스<br><strong>빅데이터소프트웨어공학과</strong>','color:#546983;font-size:13px;text-align:center;margin:0;'),'padding:18px;background:#f3f6fa;border-radius:0 0 12px 12px;');
 return {subject:title,html:'<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#edf2f7;color:#25374f;font-family:Arial,\'Malgun Gothic\',sans-serif;line-height:1.6;">'+table(row('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #dbe5f0;border-radius:12px;">'+content+'</table>','padding:12px 8px;'))+'</body></html>'};
}
