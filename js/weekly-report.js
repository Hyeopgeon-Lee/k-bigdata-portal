const $=id=>document.getElementById(id);
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);if(cls)e.className=cls;return e};
const link=(href,text)=>{const a=node('a',text);a.href=href;return a};
const safeHref=href=>['my-learning.html','study.html','ready.html','schedule.html'].includes(href)?href:'mypage.html';
const fmt=n=>Number(n||0).toLocaleString('ko-KR');
const short=d=>String(d||'').slice(5).replace('-','.');
const hours=s=>{const mins=Math.round(Number(s||0)/60);return mins>=60?Math.floor(mins/60)+'시간 '+mins%60+'분':mins+'분'};
const stamp=d=>d?new Intl.DateTimeFormat('ko-KR',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Seoul'}).format(new Date(d)):'미확인';
const set=(id,text)=>{$(id).textContent=text};
const api=()=>window.portalSupabaseClient;
const call=async body=>{const {data,error}=await api().functions.invoke('student-weekly-report',{body});if(error||!data)throw Error('REPORT_UNAVAILABLE');return data};
let current=null,seq=0;
const kpi=(label,value,note,accent)=>{const e=node('div',undefined,'wr-kpi');e.dataset.accent=accent;e.append(node('span',label,'wr-kpi-label'),node('strong',value,'wr-kpi-value'),node('small',note));return e};
function bars(target,data,{label,value,display,kind}){
 const root=$(target),max=Math.max(1,...data.map(value));root.replaceChildren();
 const chart=node('div',undefined,'wr-bars '+(kind||''));
 for(const item of data){const amount=value(item),col=node('div',undefined,'wr-bar-col'),slot=node('div',undefined,'wr-bar-slot'),bar=node('span',undefined,'wr-bar');
  bar.style.height=amount>0?Math.max(3,amount/max*100)+'%':'0%';slot.append(bar);col.append(node('strong',display(amount),'wr-bar-value'),slot,node('span',label(item),'wr-bar-label'));chart.append(col)}
 root.append(chart);
}
function lineChart(target,trend){
 const root=$(target);root.replaceChildren();
 const max=Math.max(1,...trend.map(t=>t.attempts)),w=440,h=156,pad=24;
 const points=trend.map((t,i)=>({x:pad+i*(w-2*pad)/Math.max(1,trend.length-1),y:h-22-t.attempts/max*(h-54)}));
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
 svg.setAttribute('viewBox','0 0 '+w+' '+h);svg.setAttribute('aria-hidden','true');svg.classList.add('wr-line');
 const shape=(tag,attrs)=>{const el=document.createElementNS(ns,tag);for(const [key,v] of Object.entries(attrs))el.setAttribute(key,v);svg.append(el);return el};
 for(const y of [28,80,134])shape('line',{x1:pad,y1:y,x2:w-pad,y2:y,stroke:'#e4eaf3','stroke-dasharray':'4 5'});
 if(points.length){const path=points.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' ');
 shape('path',{d:path+' L'+points.at(-1).x+' 134 L'+points[0].x+' 134 Z',fill:'#e9f1ff'});
 shape('path',{d:path,fill:'none',stroke:'#3165d6','stroke-width':3,'stroke-linejoin':'round'});
 points.forEach((p,i)=>{shape('circle',{cx:p.x,cy:p.y,r:5,fill:'#3165d6',stroke:'#fff','stroke-width':2});const t=shape('text',{x:p.x,y:p.y-12,'text-anchor':'middle',fill:'#24375c','font-size':13,'font-weight':'700'});t.textContent=fmt(trend[i].attempts)})}
 const labels=node('div',undefined,'wr-line-labels');
 for(const t of trend){const label=node('span',short(t.week));label.append(node('small',fmt(t.attempts)+'회'));labels.append(label)}
 root.append(svg,labels);
}
function renderTasks(report){
 const tasks=report.payload.tasks,done=new Set(report.completed_tasks),box=$('wr-tasks');
 set('wr-task-count',done.size+'/'+tasks.length+' 완료');$('wr-task-progress').style.width=(tasks.length?done.size/tasks.length*100:0)+'%';box.replaceChildren();
 for(const task of tasks){
  const row=node('div',undefined,'wr-task'),label=node('label'),check=node('input');check.type='checkbox';check.checked=done.has(task.id);label.append(check,node('span',task.label));row.append(label,link(safeHref(task.href),'이동 →'));box.append(row);
  check.addEventListener('change',async()=>{const intended=check.checked,reference=current;for(const el of box.querySelectorAll('input'))el.disabled=true;set('wr-task-status','저장 중…');
   try{const data=await call({action:'task',week_start:report.week_start,task_id:task.id,done:intended});if(current!==reference)return;report.completed_tasks=data.completed_tasks;renderTasks(report);set('wr-task-status','저장했습니다.')}
   catch{if(current!==reference)return;check.checked=!intended;set('wr-task-status','저장하지 못했습니다. 다시 시도해 주세요.');for(const el of box.querySelectorAll('input'))el.disabled=false}
  });
 }
}
function render(report){
 const p=report.payload,l=p.learning,c=p.career,cal=p.calendar;current=report;
 set('wr-title','나의 성장 리포트');set('wr-period',p.week_start+' ~ '+p.week_end+' · 지난주 학습');
 set('wr-generated','생성 '+stamp(report.created_at)+' (KST)');
 const prior=l.trend.at(-2)?.attempts,delta=l.attempts-prior;
 $('wr-kpis').replaceChildren(kpi('문제풀이',fmt(l.attempts)+'회',Number.isFinite(prior)?'전주 대비 '+(delta>0?'+':'')+delta+'회':'지난주 기록','blue'),kpi('판정 정답률',l.accuracy===null?'—':l.accuracy+'%',fmt(l.correct)+' / '+fmt(l.graded)+'회 정·오답 (자가평가 포함)','violet'),kpi('자율학습',hours(l.study_seconds),l.review_pending?'확인 대기 '+l.review_pending+'건':'완료 기록 기준','green'),kpi('취업 준비',c.status,c.github_days===null?'GitHub 확인 필요':'최근 7일 활동 '+c.github_days+'일','amber'));
 lineChart('wr-trend',l.trend);
 set('wr-study-note','완료 기록 · '+(l.plan_days===null?'계획 기록 없음':'계획 '+l.plan_days+'일')+(l.review_pending?' · 확인 대기 '+l.review_pending+'건':''));
 bars('wr-study',l.days,{label:x=>'월화수목금토일'[l.days.indexOf(x)],value:x=>x.study_seconds,display:hours,kind:'wr-study-bars'});
 const subjects=$('wr-subjects');subjects.replaceChildren();
 const restricted=l.subject_scope==='fundamentals';
 const visibleSubjects=restricted?l.subjects.filter(s=>['coding','ncp','interview'].includes(s.id)&&s.attempts>0):l.subjects;
 $('wr-subject-card').hidden=restricted&&visibleSubjects.length===0;
 set('wr-subject-note',(restricted?'기초학습 · 미취득 NCP · 기술면접 실제 기록':l.subject_scope==='written_pass'?'합격한 필기 과목 제외 · 실기 학습 포함':'지난주 풀이 횟수 · 정답/오답 기록 기준 (자가평가 포함)')+(l.ncp_acquired?' · NCP 취득 과목 제외':''));
 const max=Math.max(1,...visibleSubjects.map(x=>x.attempts));
 for(const s of visibleSubjects){const row=node('div',undefined,'wr-subject'),head=node('div',undefined,'wr-subject-head'),track=node('div',undefined,'wr-subject-track'),bar=node('span');bar.style.width=s.attempts/max*100+'%';head.append(node('strong',s.label),node('span',s.id==='interview'?fmt(s.attempts)+'회 연습 · '+fmt(s.questions)+'문항':fmt(s.attempts)+'회 · '+(s.accuracy===null?'—':s.accuracy+'%')));track.append(bar);row.append(head,track);subjects.append(row)}
 set('wr-career-note',c.registered?'생성 시점의 최신 점검 · GitHub '+stamp(c.checked_at):'취업 준비 정보가 아직 등록되지 않았습니다.');
 const career=$('wr-career');career.replaceChildren();
 const statuses=[['GitHub 활동',c.github_days===null?'확인 필요':c.github_days+'일 / 7일'],['Repository',c.repositories+'개 등록'],['README',c.readme],['Notion · 포트폴리오',c.portfolio],['최종 합격 자격증',c.certificates+'개']];
 if(c.documents)statuses.push(['이력서',c.documents.resume],['자기소개서',c.documents.cover_letter]);
 for(const [name,value] of statuses){const row=node('div',undefined,'wr-career-row');row.append(node('span',name),node('strong',value));career.append(row)}
 set('wr-calendar-note',p.schedule_start+' ~ '+p.schedule_end+(cal.available?(cal.stale?' · 이전 일정 캐시':' · 공개 일정'):' · 학과 일정 조회 불가')+(cal.checked_at?' ('+stamp(cal.checked_at)+')':''));
 const events=$('wr-events');events.replaceChildren();
 if(!cal.events.length)events.append(node('p',cal.available?'표시할 공개 일정이 없습니다.':'학과 일정에서 최신 정보를 확인해 주세요.','wr-empty'));
 for(const e of cal.events){const row=node('div',undefined,'wr-event'),date=node('div',short(e.start),'wr-event-date'),description=node('div',undefined,'wr-event-detail');description.append(node('strong',e.title),node('small',(e.end!==e.start?short(e.start)+' ~ '+short(e.end):e.start)+(e.time?' · '+e.time:'')+(e.important?' · 중요':'')));row.append(date,description);events.append(row)}
 renderTasks(report);
 $('wr-content').hidden=false;set('wr-status','');
}
async function load(week){
 const request=++seq;current=null;$('wr-content').hidden=true;$('wr-week').disabled=true;$('wr-retry').hidden=true;set('wr-status','주간 리포트를 불러오는 중입니다.');
 try{
  const data=await call({action:'mine',...(week?{week_start:week}:{})});
  if(request!==seq)return;
  const weeks=[...new Set([data.latest,...data.weeks,...(week?[week]:[])])].sort().reverse();
  const picker=$('wr-week');picker.replaceChildren();
  for(const w of weeks){const opt=node('option',w+(w===data.latest?' (최근 완료 주)':''));opt.value=w;picker.append(opt)}
  picker.value=week||data.latest;picker.disabled=false;
  if(!data.report){set('wr-status','선택한 주차에는 저장된 리포트가 없습니다. 최근 완료 주를 선택해 주세요.');return}
  render(data.report);
 }catch{if(request!==seq)return;set('wr-status','주간 리포트를 불러오지 못했습니다. 다시 조회해 주세요.');$('wr-retry').hidden=false;$('wr-week').disabled=!$('wr-week').options.length}
}
const ctx=window.portalVerifiedContext;
if(!ctx?.user||ctx.isAdmin!==false||ctx.profile?.signup_type!=='student'||ctx.profile?.approval_status!=='approved'||ctx.profile?.enrollment_status!=='enrolled')set('wr-status','이 페이지는 승인된 재학생 본인만 이용할 수 있습니다.');
else{
 const initial=new URL(location.href).searchParams.get('week');const week=initial&&/^\d{4}-\d{2}-\d{2}$/.test(initial)?initial:undefined;
 $('wr-week').addEventListener('change',()=>{const w=$('wr-week').value;const u=new URL(location.href);u.searchParams.set('week',w);history.replaceState(null,'',u);void load(w)});
 $('wr-retry').addEventListener('click',()=>void load($('wr-week').value||week));
 void load(week);
}
