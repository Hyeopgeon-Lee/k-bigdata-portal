import {fetchLearningAttempts,fetchLearningProgress,flushLearningQueue} from './learning-activity.mjs';
const get=id=>document.getElementById(id);
const label={coding:'기초 350제',ncp:'NCP 기출',practical:'정보처리 기출'};
const grade={correct:'정답',incorrect:'오답',ungraded:'미판정',completed:'완료 표시',timeout:'시간 초과'};
const subjectOrder=['JAVA','C','PYTHON','LINUX','NCP','PRACTICAL'];
const subjectName={JAVA:'Java',C:'C언어',PYTHON:'Python',LINUX:'Ubuntu',NCP:'NCP',PRACTICAL:'정보처리'};
const totals={JAVA:100,C:100,PYTHON:100,LINUX:50,NCP:75,PRACTICAL:null};
function element(tag,txt,className){
 const n=document.createElement(tag);
 if(txt!==undefined&&txt!==null)n.textContent=String(txt);
 if(className)n.className=className;
 return n;
}
function subject(row){
 return row.bank==='coding'?String(row.question_id).split('-')[0]:row.bank==='ncp'?'NCP':'PRACTICAL';
}
function link(row){
 const path={coding:'coding.html',ncp:'ncp.html',practical:'practical.html'}[row.bank]||'index.html';
 return path+'?id='+encodeURIComponent(row.question_id);
}
function dateTime(value){
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return '날짜 미확인';
 const parts=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
 const part=type=>parts.find(item=>item.type===type)?.value||'';
 return part('month')+'.'+part('day')+'. '+part('hour')+':'+part('minute');
}
function thisMonday(){
 const now=new Date(Date.now()+9*3600000);
 const offset=(now.getUTCDay()+6)%7;
 return Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()-offset)-9*3600000;
}
function stat(title,value,details){
 const card=element('article',null,'learn-stat');
 card.append(element('small',title),element('strong',value),element('p',details));
 return card;
}
function rate(rows){
 if(!rows.length)return '계산 불가';
 return Math.round(rows.filter(a=>a.result==='correct').length/rows.length*100)+'%';
}
function buildTable(headers,rows){
 const wrap=element('table',null,'learn-table');
 const thead=element('thead'),thRow=element('tr');
 for(const h of headers)thRow.append(element('th',h));
 thead.append(thRow);wrap.append(thead);
 const body=element('tbody');
 for(const row of rows){
  const tr=element('tr');
  for(const value of row)tr.append(element('td',value));
  body.append(tr);
 }
 wrap.append(body);return wrap;
}
async function load(){
 get('learn-status').textContent='학습기록을 클라우드에서 불러오는 중입니다...';
 const [attempts,progress]=await Promise.all([fetchLearningAttempts(),fetchLearningProgress()]);
 const monday=thisMonday();
 const week=attempts.filter(a=>Date.parse(a.submitted_at)>=monday);
 const previous=attempts.filter(a=>Date.parse(a.submitted_at)>=monday-7*86400000&&Date.parse(a.submitted_at)<monday);
 const difference=week.length-previous.length;
 const unique=new Set(week.map(a=>a.bank+':'+a.question_id));
 const graded=week.filter(a=>['correct','incorrect'].includes(a.result));
 const self=graded.filter(a=>a.grading_method==='self');
 const auto=graded.filter(a=>a.grading_method==='automatic');
 const pending=week.filter(a=>a.result==='ungraded'||a.result==='timeout');
 const latest=new Map(),everWrong=new Set();
 for(const a of [...attempts].reverse()){
  if(!['correct','incorrect'].includes(a.result)&&!(a.result==='ungraded'&&a.grading_method==='self'))continue;
  latest.set(a.bank+':'+a.question_id,a);
  if(a.result==='incorrect')everWrong.add(a.bank+':'+a.question_id);
 }
 const review=progress.filter(p=>{
  const k=p.bank+':'+p.question_id;return ['incorrect','ungraded'].includes(latest.get(k)?.result);
 });
 const recovered=progress.filter(p=>{
  const k=p.bank+':'+p.question_id;return everWrong.has(k)&&latest.get(k)?.result==='correct';
 });
 get('learn-summary').replaceChildren(
  stat('이번 주 풀이 문제',unique.size+'개','서로 다른 문제 수'),
  stat('이번 주 시도',week.length+'회','지난주 전체 '+previous.length+'회 대비 '+(difference>0?'+':'')+difference+'회'),
  stat('자가평가 정답률',rate(self),'정답 '+self.filter(a=>a.result==='correct').length+' / 판정 '+self.length),
  stat('복습이 필요한 문제',review.length+'개','오답·다시 확인하기')
 );
 const subjects=get('learn-subjects');subjects.replaceChildren();
 for(const key of subjectOrder){
  const rows=progress.filter(a=>subject(a)===key);
  const total=totals[key];
  const card=element('article',null,'learn-progress-item');
  const strong=element('strong');
  strong.append(element('span',subjectName[key]),element('span',total===null?rows.length+'개 풀이':rows.length+' / '+total));
  card.append(strong);
  if(total!==null){const bar=element('progress');bar.max=total;bar.value=Math.min(rows.length,total);bar.setAttribute('aria-label',subjectName[key]+' 진도');card.append(bar);}
  card.append(element('small',rows.length+'문제 기록됨','learn-note'));
  subjects.append(card);
 }
 get('learn-rates').replaceChildren(
  (()=>{const node=element('div',null,'learn-rate');node.append(element('span','자가평가 (본인이 판정)'),element('strong',rate(self)),element('small','정답 '+self.filter(a=>a.result==='correct').length+' / '+self.length+'건, 미판정 '+pending.length+'건'));return node;})(),
  (()=>{const node=element('div',null,'learn-rate');node.append(element('span','브라우저 답안 비교 (학습용)'),element('strong',rate(auto)),element('small','정답 '+auto.filter(a=>a.result==='correct').length+' / '+auto.length+'건 · 서버 검증 시험 아님'));return node;})()
 );
 const reviewRoot=get('learn-review');reviewRoot.replaceChildren();
 if(!review.length)reviewRoot.append(element('p','현재 복습할 오답·판단 보류 문제가 없습니다.','learn-empty'));
 else for(const p of review.sort((a,b)=>b.incorrect_count-a.incorrect_count).slice(0,45)){
  const card=element('article',null,'learn-review-card');
  const section=element('div');section.append(element('strong',subjectName[subject(p)]+' · '+p.question_id),element('small','틀린 횟수 '+p.incorrect_count+'회 / 누적 '+p.attempts_count+'시도'));
  const anchor=element('a','다시 풀기');anchor.href=link(p);card.append(section,anchor);reviewRoot.append(card);
 }
 const recent=get('learn-recent');recent.replaceChildren();
 if(!attempts.length)recent.append(element('p','아직 클라우드에 기록된 풀이가 없습니다. 문제를 풀고 정답 여부를 기록해 보세요.','learn-empty'));
 else {
  const table=element('table',null,'learn-table');table.append(element('caption','최근 학습 기록','learn-sr-only'));const head=element('thead');const tr=element('tr');
  for(const h of ['일시','과목','문제','평가 방법','결과']){const th=element('th',h);th.scope='col';tr.append(th);}
  head.append(tr);table.append(head);
  const body=element('tbody');
  for(const a of attempts.slice(0,35)){
   const row=element('tr',null,'learn-history-row');
   const date=element('td',dateTime(a.submitted_at),'learn-history-date');
   const name=subjectName[subject(a)]||label[a.bank]||'기타';
   const nameCell=element('td',name,'learn-history-subject');
   const question=element('td',null,'learn-history-problem');
   const anchor=element('a',a.question_id);anchor.href=link(a);
   anchor.setAttribute('aria-label',name+' '+a.question_id+' 문제 다시 보기');
   question.append(element('span','문제','learn-mobile-label'),anchor);
   const method=element('td',a.grading_method==='self'?'자가평가':a.grading_method==='automatic'?'브라우저 비교':'진도 기록','learn-history-method');
   const outcome=element('td',a.result==='ungraded'&&a.grading_method==='self'?'판단 보류':grade[a.result]||'미판정','learn-history-result');
   outcome.dataset.result=a.result;
   row.append(date,nameCell,question,method,outcome);
   body.append(row);
  }
  table.append(body);recent.append(table);
 }
 get('learn-status').textContent='클라우드 기록 '+attempts.length+'회 · 누적 '+progress.length+'문제 · 오답 복습 완료 '+recovered.length+'문제';
}
get('learn-refresh').addEventListener('click',()=>{void load().catch(()=>get('learn-status').textContent='학습기록을 불러오지 못했습니다. 다시 시도해 주세요.');});
flushLearningQueue().catch(()=>{}).then(()=>load()).catch(error=>{
 console.error('Learning dashboard init',error);
 get('learn-status').textContent='학습현황을 확인하지 못했습니다. 로그인 상태를 확인해 주세요.';
});
