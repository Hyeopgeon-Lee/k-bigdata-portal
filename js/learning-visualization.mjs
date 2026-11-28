/* Admin-only charts. All counts come from the authorized aggregate, never from sample data. */
const names={JAVA:"Java",C:"C언어",PYTHON:"Python",LINUX:"Ubuntu",NCP:"NCP",PRACTICAL:"정보처리 실기",INDUSTRIAL:"산업기사 필기",ENGINEER:"기사 필기"};
const fmt=n=>Number(n).toLocaleString("ko-KR");
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const ratio=(n,d)=>d?Math.round(100*n/d):null;
const percent=(n,d)=>d?Math.min(100,100*n/d):0;
const pctText=(n,d)=>d?ratio(n,d)+"%":"—";
const n=v=>Number.isFinite(Number(v))?Math.max(0,Number(v)):0;
function panel(title,description){const s=el("section","lv-panel");s.append(el("h3","lv-title",title),el("p","lv-caption",description));return s;}
function bar(value,max,kind="blue"){const track=el("div","lv-track");const fill=el("span","lv-fill lv-"+kind);fill.style.width=percent(value,max)+"%";track.setAttribute("aria-hidden","true");track.append(fill);return track;}
function metric(label,value,detail,tone){const tile=el("article","lv-kpi lv-kpi-"+tone);tile.append(el("span","lv-kpi-label",label),el("strong","lv-kpi-value",value),el("small","lv-kpi-detail",detail));return tile;}
function legend(entries){const group=el("div","lv-legend");for(const [tone,label] of entries){const item=el("span","lv-legend-item");item.append(el("i","lv-swatch lv-"+tone),el("span","",label));group.append(item);}return group;}
function renderQuestions(root,stats){
 const s=panel("문제별 학습 결과","학생 1명당 최근 판정 결과 · 정답률은 판정된 학생만 기준");
 root.append(s);
 if(stats.smallCohortHidden){s.append(el("p","lv-empty","집계 대상이 5명 미만인 경우 문제별 결과를 표시하지 않습니다."));return;}
 const list=Array.isArray(stats.questions)?stats.questions:[];
 if(!list.length){s.append(el("p","lv-empty","선택한 기간에 기록된 문제 풀이가 없습니다."));return;}
 const controls=el("div","lv-controls"),label=el("label","lv-select-label","과목");
 const filter=el("select","lv-select");
 filter.setAttribute("aria-label","문제별 결과 과목 선택");
 for(const [value,text] of [["","전체 과목"],...Object.entries(names)]){const op=el("option","",text);op.value=value;filter.append(op);}
 label.append(filter);
 const sortLabel=el("label","lv-select-label","정렬");
 const sort=el("select","lv-select");sort.setAttribute("aria-label","문제별 결과 정렬");
 for(const [value,text] of [["wrong","오답 학생 수"],["participants","참여 학생 수"],["attempts","오답 횟수"],["accuracy","낮은 정답률"]]){const op=el("option","",text);op.value=value;sort.append(op);}
 sortLabel.append(sort);controls.append(label,sortLabel);
 const grid=el("div","lv-question-grid"),info=el("p","lv-caption");
 s.append(controls,legend([["green","정답 학생"],["red","오답 학생"],["gray","미판정"]]),info,grid);
 const draw=()=>{
  const selected=list.filter(q=>!filter.value||q.subject===filter.value),score=q=>n(q.correctStudents)+n(q.incorrectStudents)?n(q.correctStudents)/(n(q.correctStudents)+n(q.incorrectStudents)):2;
  selected.sort((a,b)=>sort.value==="participants"?n(b.participants)-n(a.participants)||n(b.incorrectStudents)-n(a.incorrectStudents):sort.value==="attempts"?n(b.wrongAttempts)-n(a.wrongAttempts)||n(b.incorrectStudents)-n(a.incorrectStudents):sort.value==="accuracy"?score(a)-score(b)||n(b.participants)-n(a.participants):n(b.incorrectStudents)-n(a.incorrectStudents)||n(b.participants)-n(a.participants)||n(b.wrongAttempts)-n(a.wrongAttempts));
  info.textContent="과목별 오답 학생 수 상위 12문제 집계 · 현재 "+Math.min(12,selected.length)+"개 표시";
  grid.replaceChildren();
  if(!selected.length){grid.append(el("p","lv-empty","해당 과목의 풀이 기록이 없습니다."));return;}
  for(const q of selected.slice(0,12)){
   const total=n(q.participants),correct=n(q.correctStudents),wrong=n(q.incorrectStudents),pending=n(q.ungradedStudents),judged=correct+wrong;
   const item=el("article","lv-question"),header=el("div","lv-question-head"),qid=el("div","lv-question-id");
   qid.append(el("small","",names[q.subject]||q.subject),el("strong","",q.question));
   header.append(qid,el("span","lv-badge","참여 "+fmt(total)+"명"));
   const stat=el("div","lv-question-rate");
   const rate=el("strong",judged&&correct/judged<0.6?"lv-text-red":"lv-text-green",pctText(correct,judged));
   stat.append(el("span","","정답률"),rate);
   const stacked=el("div","lv-stacked");
   stacked.setAttribute("role","img");stacked.setAttribute("aria-label","정답 "+correct+"명, 오답 "+wrong+"명, 미판정 "+pending+"명");
   for(const [amount,tone] of [[correct,"green"],[wrong,"red"],[pending,"gray"]]){if(!amount)continue;const seg=el("span","lv-segment lv-"+tone);seg.style.flex=String(amount);stacked.append(seg);}
   const values=el("div","lv-question-values");
   for(const [amount,tone,text] of [[correct,"green","정답"],[wrong,"red","오답"],[pending,"gray","미판정"]]){
    const item=el("span","lv-text-"+tone,text+" "+fmt(amount)+"명");values.append(item);
   }
   item.append(header,stat,stacked,values,el("p","lv-question-attempts","전체 "+fmt(n(q.attempts))+"회 풀이 · 오답 "+fmt(n(q.wrongAttempts))+"회"));
   grid.append(item);
  }
 };
 filter.addEventListener("change",draw);sort.addEventListener("change",draw);draw();
}
export function renderLearningVisualization(root,stats,{grade="",period="week",range="",basis="",onGrade}={}){
 root.replaceChildren();
 if(!stats||!stats.subjects){root.append(el("p","lv-empty","참여 학생 수 통계를 조회할 수 없습니다. 기존 상세 통계는 아래에서 확인할 수 있습니다."));return;}
 const wrap=el("div","learning-viz");
 const cohort=n(stats.cohortSize),active=n(stats.activeStudents),attempts=n(stats.attempts);
 const summary=el("div","lv-summary");
 const scope=el("div","lv-scope");
 const scopeText=grade?grade+"학년":"전체 학년";
 const basisText=basis==="historical"?"과거 학적 명단 기준 추가 집계":basis==="snapshot"?"확정 통계":"실시간 집계";
 scope.append(el("strong","",scopeText+" · "+range),el("span","lv-basis",basisText));
 const kpis=el("div","lv-kpis");
 kpis.append(metric("집계 대상 재학생",fmt(cohort)+"명","선택한 학년 기준","blue"),
  metric("학습 참여 학생",fmt(active)+"명","중복 제외 · "+fmt(Math.max(0,cohort-active))+"명 미참여","green"),
  metric("학습 참여율",pctText(active,cohort),"참여 "+fmt(active)+" / "+fmt(cohort)+"명","blue"),
  metric("문제 풀이",fmt(attempts)+"회","8개 학습 서비스 전체 시도","purple"));
 summary.append(scope,kpis);wrap.append(summary);
 const grades=Array.isArray(stats.grades)?stats.grades:[];
 const comparison=panel(grade?grade+"학년 참여 현황":"1·2학년 학습 참여율","학생 수와 비율을 동일한 기준으로 비교합니다.");
 const gradeGrid=el("div","lv-grade-grid");
 for(const g of grades){
  const tone=Number(g.grade)===1?"blue":"teal",size=n(g.cohortSize),participating=n(g.activeStudents);
  const card=el("article","lv-grade-card lv-grade-"+tone),head=el("div","lv-grade-head");card.dataset.grade=String(g.grade);
  head.append(el("strong","",g.grade+"학년"),el("b","lv-text-"+tone,pctText(participating,size)));
  card.append(head,bar(participating,size,tone),el("p","lv-grade-count","참여 "+fmt(participating)+"명 / 재학생 "+fmt(size)+"명 · 미참여 "+fmt(Math.max(0,size-participating))+"명"),el("p","lv-caption","문제 풀이 "+fmt(n(g.attempts))+"회"));
  if(!grade&&onGrade){const b=el("button","lv-detail-button",g.grade+"학년 상세 보기");b.type="button";b.addEventListener("click",()=>onGrade(String(g.grade)));card.append(b);}
  gradeGrid.append(card);
 }
 comparison.append(gradeGrid);wrap.append(comparison);
 const columns=el("div","lv-columns");
 const subjectPanel=panel("과목별 학습 참여 학생","막대는 재학생 대비 참여 인원 · 풀이 횟수 별도 표시");
 for(const [key,label] of Object.entries(names)){
  const v=stats.subjects[key]||{},row=el("div","lv-subject"),head=el("div","lv-subject-head"),counts=el("div","lv-subject-count");
  counts.append(el("strong","lv-text-blue",fmt(n(v.participants))+"명"),el("small","",fmt(n(v.attempts))+"회 풀이"));
  head.append(el("strong","",label),counts);row.append(head,bar(n(v.participants),cohort,"blue"));subjectPanel.append(row);
 }
 columns.append(subjectPanel);
 const dailyPanel=panel(period==="week"?"요일별 문제 풀이 참여 학생 수":"일별 문제 풀이 참여 학생 수","한국시간 기준 · 같은 날 동일 학생은 한 명으로 계산");
 const daily=Array.isArray(stats.daily)?stats.daily:[];
 const visibleGrades=grade?[Number(grade)]:[1,2];
 dailyPanel.append(legend(visibleGrades.map(g=>[g===1?"blue":"teal",g+"학년"])));
 if(!daily.length){dailyPanel.append(el("p","lv-empty","일별 학습 기록이 없습니다."));}
 else{
  const chart=el("div","lv-daily-chart"),max=Math.max(1,...grades.map(g=>n(g.cohortSize)));
  for(const d of daily){
   const date=new Date(d.date+"T12:00:00+09:00");
   const caption=new Intl.DateTimeFormat("ko-KR",{timeZone:"Asia/Seoul",month:"numeric",day:"numeric",weekday:"short"}).format(date);
   const row=el("div","lv-daily-row"),bars=el("div","lv-daily-bars");
   row.append(el("span","lv-day-label",caption));
   for(const g of visibleGrades){
    const num=n(d["grade"+g]),line=el("div","lv-daily-line");line.append(bar(num,max,g===1?"blue":"teal"),el("strong","lv-text-"+(g===1?"blue":"teal"),fmt(num)+"명"));bars.append(line);
   }
   row.append(bars);chart.append(row);
  }
  dailyPanel.append(chart);
 }
 columns.append(dailyPanel);wrap.append(columns);renderQuestions(wrap,stats);root.append(wrap);
}
