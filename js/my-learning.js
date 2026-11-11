import {fetchLearningAttempts,fetchLearningProgress,flushLearningQueue} from './learning-activity.mjs';
const db=window.portalSupabaseClient;
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
 return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
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
 const week=attempts.filter(a=>Date.parse(a.submitted_at)>=thisMonday());
 const unique=new Set(week.map(a=>a.bank+':'+a.question_id));
 const graded=week.filter(a=>['correct','incorrect'].includes(a.result));
 const self=graded.filter(a=>a.grading_method==='self');
 const auto=graded.filter(a=>a.grading_method==='automatic');
 const pending=week.filter(a=>a.result==='ungraded'||a.result==='timeout');
 const latest=new Map(),everWrong=new Set();
 for(const a of [...attempts].reverse()){
  latest.set(a.bank+':'+a.question_id,a);
  if(a.result==='incorrect')everWrong.add(a.bank+':'+a.question_id);
 }
 const review=progress.filter(p=>{
  const k=p.bank+':'+p.question_id;return everWrong.has(k)&&latest.get(k)?.result!=='correct';
 });
 const recovered=progress.filter(p=>{
  const k=p.bank+':'+p.question_id;return everWrong.has(k)&&latest.get(k)?.result==='correct';
 });
 get('learn-summary').replaceChildren(
  stat('이번 주 풀이 문제',unique.size+'개','서로 다른 문제 수'),
  stat('이번 주 시도',week.length+'회','재풀이까지 포함'),
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
 if(!review.length)reviewRoot.append(element('p','현재 복습 대기 오답이 없습니다.','learn-empty'));
 else for(const p of review.slice(0,45)){
  const card=element('article',null,'learn-review-card');
  const section=element('div');section.append(element('strong',subjectName[subject(p)]+' · '+p.question_id),element('small','틀린 횟수 '+p.incorrect_count+'회 / 누적 '+p.attempts_count+'시도'));
  const anchor=element('a','다시 풀기');anchor.href=link(p);card.append(section,anchor);reviewRoot.append(card);
 }
 const recent=get('learn-recent');recent.replaceChildren();
 if(!attempts.length)recent.append(element('p','아직 클라우드에 기록된 풀이가 없습니다. 문제를 풀고 정답 여부를 기록해 보세요.','learn-empty'));
 else {
  const table=element('table',null,'learn-table');const head=element('thead');const tr=element('tr');
  for(const h of ['일시','과목','문제','평가 방법','결과'])tr.append(element('th',h));
  head.append(tr);table.append(head);
  const body=element('tbody');
  for(const a of attempts.slice(0,35)){
   const row=element('tr');
   for(const v of [dateTime(a.submitted_at),subjectName[subject(a)]||label[a.bank]]){
    row.append(element('td',v));
   }
   const td=element('td');const anchor=element('a',a.question_id);anchor.href=link(a);td.append(anchor);row.append(td);
   row.append(element('td',a.grading_method==='self'?'자가평가':a.grading_method==='automatic'?'브라우저 비교':'진도 기록'));
   row.append(element('td',grade[a.result]||'미판정'));body.append(row);
  }
  table.append(body);recent.append(table);
 }
 get('learn-status').textContent='클라우드 기록 '+attempts.length+'회 · 누적 '+progress.length+'문제 · 오답 복습 완료 '+recovered.length+'문제';
}
async function setupPreference(){
 const {data:{user}}=await db.auth.getUser();if(!user)return;
 const box=get('learn-opt-in'),info=get('learn-opt-status');
 if(!window.portalLearning?.write){box.disabled=true;info.textContent='휴학 등 읽기 전용 상태에서는 변경할 수 없습니다.';}
 const {data,error}=await db.from('user_preferences').select('weekly_email_opt_in').eq('user_id',user.id).maybeSingle();
 if(error){info.textContent='이메일 수신 설정을 확인하지 못했습니다.';return;}
 box.checked=data?.weekly_email_opt_in===true;
 info.textContent='수신은 기본적으로 꺼져 있으며, 재학생이 동의할 때만 개인 리포트가 발송됩니다.';
 box.addEventListener('change',async()=>{
  box.disabled=true;
  const desired=box.checked;
  const {error}=await db.from('user_preferences').upsert({user_id:user.id,weekly_email_opt_in:desired},{onConflict:'user_id'});
  box.disabled=!window.portalLearning?.write;
  if(error){box.checked=!desired;info.textContent='저장에 실패했습니다. 로그인 상태를 확인해 주세요.';}
  else info.textContent=desired?'개인 이메일 학습 리포트 수신에 동의했습니다.':'개인 이메일 리포트 수신을 해제했습니다.';
 });
}
get('learn-refresh').addEventListener('click',()=>{void load().catch(()=>get('learn-status').textContent='학습기록을 불러오지 못했습니다. 다시 시도해 주세요.');});
Promise.all([flushLearningQueue().catch(()=>{}),setupPreference()]).then(()=>load()).catch(error=>{
 console.error('Learning dashboard init',error);
 get('learn-status').textContent='학습현황을 확인하지 못했습니다. 로그인 상태를 확인해 주세요.';
});
