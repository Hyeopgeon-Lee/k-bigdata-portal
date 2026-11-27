export const subjects=["정보시스템 기반 기술","프로그래밍 언어 활용","데이터베이스 활용"];
export const engineerSubjects=["소프트웨어 설계","소프트웨어 개발","데이터베이스 구축","프로그래밍 언어 활용","정보시스템 구축 관리"];
export const writtenConfig=type=>({subjects:type==="engineer"?engineerSubjects:subjects,total:type==="engineer"?100:60,minutes:type==="engineer"?150:90});
export const normalizeSubject=s=>[...subjects,...engineerSubjects].find(x=>x.replace(/\s/g,"")===String(s||"").replace(/\s/g,""))||String(s||"기타");
export function summarizeWritten(bank,records,examType="industrial"){
 const {subjects,total}=writtenConfig(examType);
 const byId=new Map(bank.map(q=>[q.id,q])),history=new Map();
 for(const r of records){if(!byId.has(r.id))continue;let list=history.get(r.id);if(!list)history.set(r.id,list=[]);list.push({...r,correct:r.answer===byId.get(r.id).answer});}
 for(const list of history.values())list.sort((a,b)=>a.at-b.at||a.answer-b.answer);
 const calc=qs=>{
 let solved=0,first=0,latest=0,attempts=0,seconds=0,unhinted=0,unhintedRight=0,lastAt=0,wrong=[],repeated=[],recovered=[];
 for(const q of qs){const list=history.get(q.id)||[];if(!list.length)continue;
 solved++;first+=Number(list[0].correct);latest+=Number(list.at(-1).correct);lastAt=Math.max(lastAt,list.at(-1).at);
 if(!list.at(-1).correct){wrong.push(q);if(list.filter(r=>!r.correct).length>=2)repeated.push(q);}else if(list.some(r=>!r.correct))recovered.push(q);
 for(const r of list){attempts++;seconds+=r.elapsedSeconds||0;if(!r.usedHint){unhinted++;unhintedRight+=Number(r.correct);}}
 }
 return {total:qs.length,solved,first,latest,attempts,lastAt,wrong,repeated,recovered,avgTime:attempts?Math.round(seconds/attempts):null,unhintedRate:unhinted?Math.round(unhintedRight/unhinted*100):null};
 };
 const groups=new Map();for(const q of bank){const key=q.year+"-"+q.round;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(q);}
 const rounds=[...groups].sort((a,b)=>b[0].localeCompare(a[0])).map(([key,qs])=>{
 const parts=subjects.map(name=>({name,...calc(qs.filter(q=>normalizeSubject(q.subject)===name))}));
 const all=calc(qs),complete=all.total===total&&parts.every(p=>p.total===20&&p.solved===20),available=all.total===total&&parts.every(p=>p.total===20);
 return {key,qs,parts,...all,available,complete,passed:complete&&all.latest>=total*.6&&parts.every(p=>p.latest>=8),goal:complete&&all.latest>=total*.8&&parts.every(p=>p.latest>=12)};
 });
 const finished=rounds.filter(r=>r.complete).sort((a,b)=>b.lastAt-a.lastAt);
 return {all:calc(bank),rounds,finished,history};
}
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pct=(n,d)=>d?((n>0&&n/d<.01)?(n*100/d).toFixed(1):Math.round(n*100/d))+"%":"—";
const score=(n,d)=>d?(n*100/d).toFixed(1):"—";
const button=(name,label,key="",sub="")=>'<button type="button" class="button button-secondary" data-action="'+name+'" data-round="'+esc(key)+'" data-subject="'+esc(sub)+'">'+esc(label)+'</button>';
const state=r=>!r.available?"등록 미완료":!r.solved?"미학습":!r.complete?"학습 중":r.passed?"기준 충족":r.parts.some(p=>p.latest<8)?"과락":"평균 미달";
const bar=(n,d)=>'<progress max="'+Math.max(1,d)+'" value="'+n+'"></progress>';
export function writtenDashboard(bank,records,writable,selectedYear="",examType="industrial"){
 const {subjects,total}=writtenConfig(examType);
 const {all,rounds,finished,history}=summarizeWritten(bank,records,examType),last3=finished.slice(0,3),avg=last3.length?score(last3.reduce((n,r)=>n+r.latest,0),last3.length*total):"";
 const unfinished=rounds.find(r=>r.available&&r.solved>0&&!r.complete)||rounds.find(r=>r.available&&!r.solved);
 const kpi=(label,value,sub)=>'<article><small>'+label+'</small><strong>'+value+'</strong><p>'+sub+'</p></article>';
 const progressPct=all.total?all.solved/all.total*100:0;
 const years=[...new Set(rounds.map(r=>r.key.split("-")[0]))],year=years.includes(selectedYear)?selectedYear:(unfinished?.key.split("-")[0]||years[0]);
 const sorted=rounds.filter(r=>r.key.startsWith(year+"-")).sort((a,b)=>Number(b.solved>0&&!b.complete)-Number(a.solved>0&&!a.complete)||b.key.localeCompare(a.key));
 const parts=subjects.map(name=>{const qs=bank.filter(q=>normalizeSubject(q.subject)===name),solved=qs.filter(q=>history.has(q.id)),right=solved.filter(q=>history.get(q.id).at(-1).correct).length;return {name,total:qs.length,solved:solved.length,right};});
 return '<section class="written-dashboard written-overview"><h2>나의 합격 준비 현황</h2><p class="written-muted">합격 기준: 평균 60점 · 과목별 40점 이상 | 학습 목표: 평균 80점 · 과목별 60점 이상</p><div class="written-kpis">'+kpi("기출 연습 진도",pct(all.solved,all.total),all.solved+" / "+all.total+"문항")+kpi("완료 회차",finished.length+" / "+rounds.length,total+"문항 완료 기준")+kpi("완료 회차 평균",avg?avg+"점":"—",last3.length?"최근 "+last3.length+"회차 최신 답안":"완료 회차 없음")+kpi("미해결 오답",all.wrong.length+"문항","해결 "+all.recovered.length+"문항")+'</div><div class="written-chart-grid practice-chart-grid"><section class="written-chart-card chart-donut-card"><div class="chart-heading"><h3>기출 학습 진도</h3><span class="written-pill">전체 '+all.total+'문항</span></div><div class="chart-donut-content"><div class="chart-donut" style="--chart-progress:'+progressPct+'%" role="img" aria-label="학습 진도 '+pct(all.solved,all.total)+'"><div><strong>'+pct(all.solved,all.total)+'</strong><small>학습 완료</small></div></div><div class="chart-donut-legend"><p><i></i>풀이 완료 <strong>'+all.solved+'문항</strong></p><p><i></i>미풀이 <strong>'+(all.total-all.solved)+'문항</strong></p></div></div></section><section class="written-chart-card"><div class="chart-heading"><h3>과목별 기출 학습량</h3><span class="written-pill">풀이 문항 기준</span></div><div class="subject-chart">'+parts.map(p=>'<div class="subject-chart-row"><div><strong>'+esc(p.name)+'</strong><b>'+p.solved+'/'+p.total+'</b></div><div class="subject-chart-track"><div style="width:'+(p.total?p.solved/p.total*100:0)+'%"></div></div></div>').join('')+'</div></section></div>'+
 '<section class="written-recommend"><h3>오늘의 추천 학습</h3><div class="written-actions">'+(unfinished?button("round-unseen",unfinished.key.replace("-","년 ")+"회 이어 풀기",unfinished.key):"")+(all.repeated.length?button("repeat-wrong","반복 오답 "+all.repeated.length+"문항"):"")+(all.wrong.length?button("unresolved-wrong","미해결 오답 "+all.wrong.length+"문항"):"")+button("practice-weak","기출 취약·미학습 과목 10문제")+ '</div><div id="written-mock-recommend"></div></section>'+
 '<div id="written-mock-summary"></div><h3>과목별 기출 연습</h3><div class="written-parts overview-subjects">'+parts.map(p=>'<article><h4>'+esc(p.name)+'</h4><strong class="overview-number">'+pct(p.right,p.solved)+'</strong><p>'+p.solved+' / '+p.total+'문항 풀이 · 정답 '+p.right+'문항</p>'+bar(p.solved,p.total)+button("practice-subject","과목 10문제","",p.name)+'</article>').join("")+'</div>'+
 '<h3>회차별 학습 성적표</h3><div class="written-year-tabs" role="group" aria-label="회차 연도">'+years.map(y=>'<button type="button" class="button button-secondary" data-action="round-year" data-year="'+y+'" aria-pressed="'+(y===year)+'">'+y+'년</button>').join("")+'</div><div class="written-round-list">'+sorted.map(r=>{
 const st=state(r),cl=r.complete?(r.passed?"good":"bad"):"neutral";
 return '<details class="written-round" data-session="'+esc(r.key)+'"><summary><span><strong>'+esc(r.key.replace("-","년 ")+"회")+'</strong><small>'+r.solved+'/'+r.total+'문항 · '+r.attempts+'회 시도</small>'+bar(r.solved,r.total)+'</span><span><strong>'+(r.complete?score(r.latest,total)+"점":r.solved?"정답률 "+pct(r.latest,r.solved):"—")+'</strong><span class="written-pill '+cl+'">'+st+'</span></span></summary><p>'+(r.complete?'최초 '+score(r.first,total)+'점 → 최근 '+score(r.latest,total)+'점':'완료 후 회차 점수 산출 · 풀이한 문항 정답률 '+pct(r.latest,r.solved))+'</p><div class="written-parts">'+r.parts.map(p=>'<article><h4>'+esc(p.name)+'</h4><p>정답 '+p.latest+' · 오답 '+(p.solved-p.latest)+' · 미풀이 '+(p.total-p.solved)+'</p>'+bar(p.solved,p.total)+'<p>'+(p.solved===20?'최초 '+score(p.first,20)+'점 → 최근 '+score(p.latest,20)+'점':'정답률 '+pct(p.latest,p.solved))+'</p><p>평균 풀이시간 '+(p.avgTime===null?"—":p.avgTime+"초")+' · 무힌트 '+(p.unhintedRate===null?"—":p.unhintedRate+"%")+'</p><p>반복 오답 '+p.repeated.length+' · 해결 '+p.recovered.length+'</p>'+(p.solved===20&&p.latest<8?'<p class="written-pill bad">과락 · '+(8-p.latest)+'문항 추가 정답 필요</p>':"")+(p.wrong.length?button("round-wrong","과목 오답 복습",r.key,p.name):"")+'</article>').join("")+'</div><div class="written-actions">'+(r.solved<r.total?button("round-unseen","미풀이 이어서",r.key):"")+(r.wrong.length?button("round-wrong","회차 오답 복습",r.key):"")+button("round-all","회차 전체 다시 풀기",r.key)+(writable&&r.available?button("mock-start","회차 모의고사",r.key):"")+'</div></details>';
 }).join("")+'</div><h3>실전 모의고사 기록</h3><div id="written-mock-history" role="status">기록 확인 중…</div></section>';
}
