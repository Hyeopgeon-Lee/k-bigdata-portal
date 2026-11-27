import {fetchLearningAttempts,fetchLearningProgress} from "./learning-activity.mjs?v=20261127-coding-dashboard";
const grades={correct:"정답",incorrect:"오답",ungraded:"판단 보류",completed:"완료",timeout:"시간 초과"};
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const day=t=>t&&Number.isFinite(new Date(t).getTime())?new Intl.DateTimeFormat("sv-SE",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(t)):"";
const pct=(a,b)=>b?Math.round(a/b*1000)/10:0;
const ratio=(a,b)=>b?pct(a,b)+"%":"—";
const dateLabel=t=>day(t)?day(t)+" "+new Intl.DateTimeFormat("ko-KR",{timeZone:"Asia/Seoul",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date(t)):"기록 없음";
export function summarizeCoding(questions,attempts,progress=[]){
 const map=new Map(questions.map(q=>[q.id,{q,events:[],result:null,wrong:0,count:0,date:null}]));
 const superseded=new Set(attempts.map(a=>a.metadata?.corrects_attempt_id).filter(Boolean));
 const unique=new Set();
 for(const a of [...attempts].sort((a,b)=>String(a.submitted_at).localeCompare(String(b.submitted_at)))){
  if(a.bank!=="coding"||!map.has(a.question_id)||superseded.has(a.client_attempt_id)||(a.client_attempt_id&&unique.has(a.client_attempt_id)))continue;
  if(a.client_attempt_id)unique.add(a.client_attempt_id);
  const v=map.get(a.question_id);v.events.push(a);v.result=a.result;v.date=a.submitted_at;v.count++;if(a.result==="incorrect")v.wrong++;
 }
 for(const p of progress){const v=map.get(p.question_id);if(v&&!v.count){v.result=p.last_result;v.date=p.last_attempt_at;v.count=p.attempts_count||1;v.wrong=p.incorrect_count||0;}}
 return [...map.values()];
}
export function mountCodingDashboard({questions,labels,openList,openSet}){
 const main=document.querySelector("main"),nav=document.createElement("nav"),panel=document.createElement("section");
 nav.className="coding-dashboard-nav";nav.setAttribute("aria-label","기초학습 메뉴");
 nav.innerHTML='<button data-view="bank" type="button">전체 문제</button><button data-view="review" type="button">복습노트</button><button data-view="progress" type="button">학습현황</button>';
 panel.className="coding-dashboard-panel";panel.hidden=true;
 main.querySelector(".portal-page-intro").after(nav);nav.after(panel);
 let view="bank",records=[],attempts=[],ready=false,error=false,request=0,period=7,filter="incorrect",lang="all",topicLang="all",goal=20;
 const goalKey=()=> "coding:goal:"+ String(globalThis.portalVerifiedUserId||"device");
 const canRead=()=>globalThis.portalLearning?.read===true&&Date.now()<globalThis.portalLearning.expires;
 function button(label,action,extra=""){return '<button type="button" class="cd-btn" data-action="'+action+'" '+extra+'>'+esc(label)+'</button>'}
 function kpi(label,value,sub=""){return '<article class="cd-kpi"><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong><small>'+esc(sub)+'</small></article>'}
 function group(arr){return {done:arr.filter(v=>v.result).length,c:arr.filter(v=>v.result==="correct").length,w:arr.filter(v=>v.result==="incorrect").length,p:arr.filter(v=>v.result==="ungraded").length};}
 function bar(n,total,color=""){return '<div class="cd-track" role="progressbar" aria-valuenow="'+pct(n,total)+'" aria-valuemin="0" aria-valuemax="100"><span class="'+color+'" style="width:'+pct(n,total)+'%"></span></div>'}
 function section(title,content){return '<article class="cd-card"><h3>'+esc(title)+'</h3>'+content+'</article>'}
 function select(id,selected,options){return '<select aria-label="'+(id==="period"?"기간":"학습 영역")+'" data-select="'+id+'">'+options.map(([k,v])=>'<option value="'+esc(k)+'"'+(String(k)===String(selected)?" selected":"")+'>'+esc(v)+'</option>').join("")+'</select>'}
 const options=[["all","전체 영역"],...Object.entries(labels)];
 function row(v){return '<div class="cd-record"><div><small>'+esc(labels[v.q.language])+' · '+esc(v.q.id)+' · '+esc(v.q.topic)+'</small><strong>'+esc(v.q.title)+'</strong><small>풀이 '+v.count+'회 · 오답 '+v.wrong+'회 · '+esc(dateLabel(v.date))+'</small></div><span class="cd-pill '+esc(v.result)+'">'+esc(grades[v.result]||"미학습")+'</span>'+button("다시 풀기","single",'data-id="'+esc(v.q.id)+'"')+'</div>'}
 function list(arr){return arr.length?arr.map(row).join(""):'<p class="cd-empty">해당하는 학습 기록이 없습니다.</p>'}
 function setView(next){
  view=next;if(next==="bank")request++;nav.querySelectorAll("button").forEach(b=>{b.setAttribute("aria-pressed",String(b.dataset.view===next));});
  panel.hidden=next==="bank";main.classList.toggle("cd-dashboard-open",next!=="bank");
  if(next!=="bank"){render();refresh();}
 }
 async function refresh(){
  if(view==="bank")return;
  const n=++request;if(!canRead()){ready=false;error=false;records=[];attempts=[];render();return;}
  if(!ready)render();
  try{
   const [a,p]=await Promise.all([fetchLearningAttempts("coding"),fetchLearningProgress("coding")]);
   if(n!==request)return;
   // Pending events have no reliable submission date until synced; cloud totals are authoritative.
   attempts=a;records=summarizeCoding(questions,a,p);ready=true;error=false;
   try{goal=Math.max(1,Math.min(350,Number(localStorage.getItem(goalKey()))||20));}catch{}
  }catch(e){if(n!==request)return;error=true;ready=false;}
  render();
 }
 function render(){
  if(view==="bank")return;
  const heading='<h2>'+(view==="review"?"복습노트":"학습현황")+'</h2>';
  if(!canRead()){panel.innerHTML=heading+'<div class="cd-card"><p>개인 학습 기록은 로그인 후 확인할 수 있습니다.</p></div>';return;}
  if(!ready){panel.innerHTML=heading+'<div class="cd-card" role="status">'+(error?'학습 기록을 불러오지 못했습니다. '+button("다시 시도","refresh"):"학습 기록을 불러오는 중…")+'</div>';return;}
  const g=group(records),wrong=records.filter(v=>v.result==="incorrect"),pending=records.filter(v=>v.result==="ungraded"),repeat=wrong.filter(v=>v.wrong>=2),solved=records.filter(v=>v.result==="correct"&&v.wrong>0),todo=records.filter(v=>!v.result);
  const recent=[...records].filter(v=>v.result).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const queue=arr=>arr.slice().sort((a,b)=>b.wrong-a.wrong||String(b.date).localeCompare(String(a.date)));
  if(view==="review"){
   const sets={incorrect:wrong,ungraded:pending,repeat,solved};
   const items=queue(sets[filter].filter(v=>lang==="all"||v.q.language===lang));
   panel.innerHTML=heading+'<div class="cd-kpis">'+kpi("미해결 오답",wrong.length+"문제")+kpi("판단 보류",pending.length+"문제")+kpi("반복 오답",repeat.length+"문제")+kpi("복습 해결",solved.length+"문제")+'</div>'+section("복습 현황",'<div class="cd-line"><span>해결률</span><strong>'+ratio(solved.length,solved.length+wrong.length)+'</strong></div>'+bar(solved.length,solved.length+wrong.length,"good"))+'<div class="cd-toolbar">'+Object.entries({incorrect:"미해결",ungraded:"판단 보류",repeat:"반복 오답",solved:"해결"}).map(([k,label])=>button(label+" ("+sets[k].length+")","filter",'data-filter="'+k+'" aria-pressed="'+(filter===k)+'"')).join("")+select("lang",lang,options)+button("이 항목 연속 다시 풀기","review-set",items.length?"":"disabled")+'</div>'+list(items);
   panel._set=items;return;
  }
  const today=day(new Date()),byDay=new Map();
  for(const v of records)for(const a of v.events){const key=day(a.submitted_at);if(!key)continue;if(!byDay.has(key))byDay.set(key,new Map());byDay.get(key).set(v.q.id,a.result);}
  const todayCount=byDay.get(today)?.size||0;
  let streak=0;const cursor=new Date();while(byDay.has(day(cursor))){streak++;cursor.setUTCDate(cursor.getUTCDate()-1);}
  const days=period==="all"?[...byDay.keys()].sort():Array.from({length:Number(period)},(_,i)=>{const d=new Date();d.setUTCDate(d.getUTCDate()-Number(period)+1+i);return day(d);});
  const values=days.map(d=>({d,results:[...(byDay.get(d)?.values()||[])]})),max=Math.max(1,...values.map(v=>v.results.length)),sum=values.reduce((s,v)=>s+v.results.length,0);
  const trend='<div class="cd-chart-scroll"><div class="cd-trend" style="--days:'+Math.max(7,values.length)+'">'+values.map(({d,results})=>{const c=results.filter(x=>x==="correct").length,w=results.filter(x=>x==="incorrect").length,p=results.length-c-w;return '<div class="cd-day"><strong>'+results.length+'</strong><div class="cd-day-track" title="'+esc(d+' · 정답 '+c+' / 오답 '+w+' / 기타 '+p)+'"><div style="height:'+pct(results.length,max)+'%"><i class="good" style="flex:'+c+'"></i><i class="bad" style="flex:'+w+'"></i><i class="pending" style="flex:'+p+'"></i></div></div><small>'+esc(d.slice(5))+'</small></div>'}).join("")+'</div></div><div class="cd-legend"><span>🟢 정답</span><span>🔴 오답</span><span>🟠 판단 보류·기타</span></div><p>기간 학습량 '+sum+'문제 · 일평균 '+(days.length?(sum/days.length).toFixed(1):"0")+'문제 · 연속 학습 '+streak+'일</p>';
  const areas=Object.entries(labels).map(([k,label])=>{const a=records.filter(v=>v.q.language===k),s=group(a);return '<div class="cd-area"><div class="cd-line"><strong>'+esc(label)+'</strong><span>'+s.done+' / '+a.length+'문제 · '+pct(s.done,a.length)+'%</span></div>'+bar(s.done,a.length)+'<small>정답 '+s.c+' · 오답 '+s.w+' · 보류 '+s.p+' · 자기평가 정답률 '+ratio(s.c,s.c+s.w)+'</small>'+button("미학습 풀기","language",'data-lang="'+k+'" '+(s.done===a.length?"disabled":""))+'</div>'}).join("");
  const topics=new Map();for(const v of records){if(topicLang!=="all"&&v.q.language!==topicLang)continue;const key=labels[v.q.language]+" · "+(v.q.topic||"기타");if(!topics.has(key))topics.set(key,[]);topics.get(key).push(v);}
  const ranked=[...topics].map(([key,arr])=>({key,arr,...group(arr)})).sort((a,b)=>(a.c+a.w<3)-(b.c+b.w<3)||pct(a.c,a.c+a.w)-pct(b.c,b.c+b.w)||b.w-a.w);
  const weak=ranked.find(t=>t.c+t.w>=3&&pct(t.c,t.c+t.w)<60);
  const topicRows=ranked.map(t=>'<div class="cd-area"><div class="cd-line"><strong>'+esc(t.key)+'</strong><span>'+ (t.c+t.w<3?"평가 데이터 부족":ratio(t.c,t.c+t.w))+'</span></div>'+bar(t.c,t.c+t.w,t.c+t.w<3?"muted":pct(t.c,t.c+t.w)<60?"bad":"good")+'<small>정답 '+t.c+' / 평가 '+(t.c+t.w)+' · 완료 '+t.done+' / '+t.arr.length+'</small></div>').join("");
  panel.innerHTML=heading+'<p class="cd-note">계정에 저장된 학습 기록 기준 · 정답률은 자기평가 결과이며 판단 보류는 제외합니다.</p><div class="cd-kpis">'+kpi("전체 문제",questions.length+"문제","4개 학습 영역")+kpi("학습 완료",g.done+"문제","미학습 "+todo.length+"문제")+kpi("전체 진도율",pct(g.done,questions.length)+"%")+kpi("자기평가 정답률",ratio(g.c,g.c+g.w),"평가 "+(g.c+g.w)+"문제")+kpi("오늘 학습",todayCount+"문제","오늘 학습 고유 문항")+kpi("복습 필요",wrong.length+pending.length+"문제","오답 "+wrong.length+" · 보류 "+pending.length)+'</div><div class="cd-grid">'+section("전체 학습 진도",'<div class="cd-donut-row"><div class="cd-donut" role="img" aria-label="진도율 '+pct(g.done,questions.length)+'%" style="--p:'+pct(g.done,questions.length)+'%"><div><strong>'+pct(g.done,questions.length)+'%</strong><small>전체 진도율</small></div></div><div><p>학습 완료 <b>'+g.done+'</b>문제</p><p>미학습 <b>'+todo.length+'</b>문제</p><p>정답 '+g.c+' · 오답 '+g.w+' · 판단 보류 '+g.p+'</p></div></div>')+section("오늘의 학습 목표",'<label>하루 목표 문항 <input type="number" min="1" max="350" data-goal value="'+goal+'"></label>'+button("목표 저장","goal")+'<div class="cd-line"><strong>'+todayCount+' / '+goal+'문제</strong><span>'+pct(Math.min(todayCount,goal),goal)+'%</span></div>'+bar(Math.min(todayCount,goal),goal,"good")+'<p>'+ (todayCount>=goal?"오늘 목표를 달성했습니다!":(goal-todayCount)+"문제를 더 학습하면 목표를 달성합니다.")+'</p>')+'</div>'+section("영역별 학습현황",areas)+section("학습 추이",select("period",period,[[7,"최근 7일"],[30,"최근 30일"],["all","전체 기간"]])+trend)+section("주제별 취약 영역",select("topicLang",topicLang,options)+'<p class="cd-note">평가 3문제 이상인 주제부터 분석합니다.</p><div class="cd-topics">'+topicRows+'</div>')+section("추천 학습",'<div class="cd-toolbar">'+button("이어서 학습하기","continue",recent.length?"":"disabled")+button("오답 복습하기","go-review")+button("미학습 문제 풀기","unseen",todo.length?"":"disabled")+button("취약 영역 집중 학습","weak",weak?"":"disabled")+'</div><p>'+esc(weak?weak.key+" · 우선 복습 추천":"평가 기록이 쌓이면 취약 영역을 추천합니다.")+'</p>')+section("최근 학습 기록",list(recent.slice(0,10)));
  panel._set=todo;panel._recent=recent;panel._weak=weak?.arr||[];
 }
 function start(items){if(!items.length)return;setView("bank");openSet(items.map(v=>v.q));}
 nav.addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(!b)return;setView(b.dataset.view);if(view==="bank")openList();});
 panel.addEventListener("change",e=>{const k=e.target.dataset.select;if(k==="lang")lang=e.target.value;if(k==="topicLang")topicLang=e.target.value;if(k==="period")period=e.target.value==="all"?"all":Number(e.target.value);if(k)render();});
 panel.addEventListener("click",e=>{const b=e.target.closest("[data-action]");if(!b)return;switch(b.dataset.action){
 case "refresh":refresh();break;case "filter":filter=b.dataset.filter;render();break;
 case "single":start(records.filter(v=>v.q.id===b.dataset.id));break;case "review-set":case "unseen":start(panel._set);break;
 case "language":start(records.filter(v=>v.q.language===b.dataset.lang&&!v.result));break;
 case "continue":{const last=panel._recent[0];const remaining=records.filter(v=>v.q.language===last?.q.language&&!v.result);start(remaining.length?remaining:panel._recent.slice(0,1));break;}case "weak":start(panel._weak.filter(v=>v.result!=="correct"));break;
 case "go-review":filter="incorrect";setView("review");break;
 case "goal":{const value=Number(panel.querySelector("[data-goal]").value);if(Number.isInteger(value)&&value>=1&&value<=350){goal=value;try{localStorage.setItem(goalKey(),String(goal));}catch{}render();}else panel.querySelector("[data-goal]").reportValidity();break;}
 }});
 document.addEventListener("portal-learning-sync",()=>{if(view!=="bank")refresh();});
 window.addEventListener("portal-learning-ready",()=>{if(view!=="bank")refresh();});
 setView("bank");return {showBank:()=>setView("bank")};
}
