export const subjects=["정보시스템 기반 기술","프로그래밍 언어 활용","데이터베이스 활용"];
export const normalizeSubject=s=>subjects.find(x=>x.replace(/\s/g,"")===String(s||"").replace(/\s/g,""))||String(s||"기타");
export function summarizeWritten(bank,records){
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
 const all=calc(qs),complete=all.total===60&&parts.every(p=>p.total===20&&p.solved===20),available=all.total===60&&parts.every(p=>p.total===20);
 return {key,qs,parts,...all,available,complete,passed:complete&&all.latest>=36&&parts.every(p=>p.latest>=8),goal:complete&&all.latest>=48&&parts.every(p=>p.latest>=12)};
 });
 const finished=rounds.filter(r=>r.complete).sort((a,b)=>b.lastAt-a.lastAt);
 return {all:calc(bank),rounds,finished,history};
}
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pct=(n,d)=>d?Math.round(n*100/d)+"%":"—";
const score=(n,d)=>d?(n*100/d).toFixed(1):"—";
const button=(name,label,key="",sub="")=>'<button type="button" class="button button-secondary" data-action="'+name+'" data-round="'+esc(key)+'" data-subject="'+esc(sub)+'">'+esc(label)+'</button>';
const state=r=>!r.available?"등록 미완료":!r.solved?"미학습":!r.complete?"학습 중":r.passed?"기준 충족":r.parts.some(p=>p.latest<8)?"과락":"평균 미달";
const bar=(n,d)=>'<progress max="'+Math.max(1,d)+'" value="'+n+'"></progress>';
export function writtenDashboard(bank,records,writable){
 const {all,rounds,finished}=summarizeWritten(bank,records),recent=finished[0],last3=finished.slice(0,3),avg=last3.length?score(last3.reduce((n,r)=>n+r.latest,0),last3.length*60):"—";
 const weakest=recent?.parts.filter(p=>p.latest<12).sort((a,b)=>a.latest-b.latest)[0],unfinished=rounds.find(r=>r.solved>0&&!r.complete)||rounds.find(r=>!r.solved);
 const kpi=(label,value,sub)=>'<article><small>'+label+'</small><strong>'+value+'</strong><p>'+sub+'</p></article>';
 return '<section class="written-dashboard"><h2>나의 합격 준비 현황</h2><p>합격 기준: 과목별 40점 이상 · 평균 60점 이상 / 학습 목표: 과목별 60점 이상 · 평균 80점 이상</p><div class="written-kpis">'+kpi("학습 진도",all.solved+" / "+all.total,pct(all.solved,all.total))+kpi("완료 회차",finished.length+" / "+rounds.length,"60문항 완료 기준")+kpi("최근 "+last3.length+"개 완료 회차 평균",avg+"점","최근 답안 기준")+kpi("기준 충족",finished.filter(r=>r.passed).length+" / "+finished.length,"완료 회차 기준")+'</div>'+bar(all.solved,all.total)+
 '<h3>추천 학습</h3><div class="written-actions">'+(weakest?button("round-wrong",weakest.name+" 집중 복습",recent.key,weakest.name):"")+(all.repeated.length?button("repeat-wrong","반복 오답 "+all.repeated.length+"문항"):"")+(unfinished?button("round-unseen",unfinished.key.replace("-","년 ")+"회 이어 풀기",unfinished.key):"")+'</div>'+
 '<h3>회차별 학습 성적표</h3>'+rounds.map(r=>{
 const st=state(r),cl=r.complete?(r.passed?"good":"bad"):"neutral";
 return '<details class="written-round" data-session="'+esc(r.key)+'"><summary><span><strong>'+esc(r.key.replace("-","년 ")+"회")+'</strong><small>'+r.solved+'/'+r.total+'문항 · '+r.attempts+'회 시도</small></span><span><strong>'+(r.solved?score(r.latest,60)+"점":"—")+'</strong><span class="written-pill '+cl+'">'+st+'</span></span></summary>'+bar(r.solved,r.total)+'<p>최초 '+score(r.first,60)+'점 → 최근 '+score(r.latest,60)+'점 · 풀이한 문항 정답률 '+pct(r.latest,r.solved)+' · '+(r.complete?'전체 완료':'판정 보류')+'</p>'+
 '<div class="written-parts">'+r.parts.map(p=>'<article><h4>'+esc(p.name)+'</h4><p>정답 '+p.latest+' · 오답 '+(p.solved-p.latest)+' · 미풀이 '+(p.total-p.solved)+'</p>'+bar(p.latest,p.total)+'<p>최초 '+score(p.first,20)+'점 → 최근 '+score(p.latest,20)+'점</p><p>정답률 '+pct(p.latest,p.solved)+' · 평균 '+(p.avgTime??"—")+'초 · 무힌트 '+(p.unhintedRate===null?"—":p.unhintedRate+"%")+'</p><p>반복 오답 '+p.repeated.length+' · 해결 '+p.recovered.length+'</p>'+(p.solved===20&&p.latest<8?'<p class="written-pill bad">과락 · '+(8-p.latest)+'문항 추가 정답 필요</p>':"")+(p.wrong.length?button("round-wrong","과목 오답 복습",r.key,p.name):"")+'</article>').join("")+'</div>'+
 '<div class="written-actions">'+(r.solved<r.total?button("round-unseen","미풀이 이어서",r.key):"")+(r.wrong.length?button("round-wrong","회차 오답 복습",r.key):"")+button("round-all","회차 전체 다시 풀기",r.key)+(writable&&r.available?button("mock-start","실전 모의고사",r.key):"")+'</div></details>';
 }).join("")+'<h3>실전 모의고사 기록</h3><p>60문항 · 90분</p><div id="written-mock-history" role="status">기록 확인 중…</div></section>';
}
