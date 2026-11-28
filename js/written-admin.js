const db=window.portalSupabaseClient,root=document.getElementById("industrial-teacher-stats");
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const sub=s=>({"정보시스템기반기술":"정보시스템 기반 기술","프로그래밍언어활용":"프로그래밍 언어 활용","데이터베이스활용":"데이터베이스 활용"}[s]||s);
let seq=0;
function period(mode,offset){const kst=new Date(Date.now()+9*3600000),y=kst.getUTCFullYear(),m=kst.getUTCMonth(),d=kst.getUTCDate();let a,b;
 if(mode==="month"){a=Date.UTC(y,m+offset,1);b=Date.UTC(y,m+offset+1,1);}
 else{const mon=d-(kst.getUTCDay()+6)%7+offset*7;a=Date.UTC(y,m,mon);b=a+7*86400000;}
 return [new Date(a-9*3600000).toISOString(),new Date(b-9*3600000).toISOString(),new Date(a).toISOString().slice(0,10)+" ~ "+new Date(b-1).toISOString().slice(0,10)];
}
if(root){root.innerHTML='<h2>정보처리 필기 · 학생별 합격 준비</h2><p>선택 기간 학습량 및 기간 종료 시점까지의 누적 학습 성적입니다. 현재 재학생 기준이며 실제 시험 성적이 아닙니다.</p><div class="written-actions"><label>시험 <select id="iw-exam"><option value="industrial">산업기사</option><option value="engineer">기사</option></select></label><label>학년 <select id="iw-grade"><option value="">전체</option><option value="1">1학년</option><option value="2">2학년</option></select></label><label>기간 <select id="iw-period"><option value="week">주간</option><option value="month">월간</option></select></label><label>이전 기간 <select id="iw-offset">'+Array.from({length:13},(_,i)=>'<option value="'+(-i)+'">'+(i===0?"현재":i+"기간 전")+'</option>').join("")+'</select></label><button id="iw-refresh" type="button">새로고침</button></div><p id="iw-status" role="status"></p><div id="iw-results"></div>';
 const get=id=>document.getElementById(id);
 const ui=window.portalAdminUI;
 if(ui)get("iw-grade").value=ui.getGrade();
 async function load(){const request=++seq;get("iw-status").textContent="집계 중…";get("iw-results").replaceChildren();document.getElementById("iw-admin-chart")?.replaceChildren();const [start,end,label]=period(get("iw-period").value,Number(get("iw-offset").value));const grade=Number(get("iw-grade").value)||null,exam=get("iw-exam").value,total=exam==="engineer"?100:60;
 try{const {data,error}=await db.rpc("portal_written_summary",{p_exam_type:exam,p_start:start,p_end:end,p_grade:grade});if(error)throw error;if(request!==seq)return;
 const list=Array.isArray(data)?data:[];get("iw-status").textContent=(grade?grade+"학년":"1·2학년 구분")+" · "+label+" · "+list.length+"명 · 학습 참여 "+list.filter(s=>s.attempts>0).length+"명";
 if(ui)ui.renderDonut(ui.chartMount(get("iw-status"),"iw-admin-chart"),"필기 학습 참여",[["기간 내 학습",list.filter(s=>s.attempts>0).length],["학습 기록 없음",list.filter(s=>!(s.attempts>0)).length]],{caption:ui.gradeLabel(get("iw-grade").value)+" · 선택 시험 및 기간"});
 const renderStudent=s=>{const r=s.recent,weak=r?.subjects.filter(x=>x.correct<8).map(x=>sub(x.subject)).join(", ");return '<details class="written-round"><summary><span><strong>'+esc(s.full_name)+' · '+esc(s.academic_year)+'학년</strong><small>완료 '+s.completed+'회 · 기준 충족 '+s.passed+'회 · 이번 기간 '+s.attempts+'회 풀이</small></span><span><strong>'+(r?r.average+"점":"—")+'</strong><span class="written-pill '+(r?(r.passed?"good":"bad"):"neutral")+'">'+(r?(weak?"과락":r.passed?"기준 충족":"평균 미달"):"학습 기록 부족")+'</span></span></summary><p>누적 '+s.solved+'문항 · 기간 고유 풀이 '+s.unique_count+'문항 · 기간 모의고사 '+s.mocks+'회</p>'+(weak?'<p>과락 과목: '+esc(weak)+'</p>':'')+'<div class="written-parts">'+s.rounds.map(x=>'<article><h4>'+x.yr+'년 '+x.rnd+'회</h4><p>'+x.solved+'/'+total+' · '+(x.complete?(x.correct>=total*0.6&&x.min_correct>=8?"기준 충족":x.min_correct<8?"과락":"평균 미달"):"학습 중")+'</p>'+x.subjects.map(p=>'<p>'+esc(sub(p.subject))+' '+p.correct*5+'점 · '+p.solved+'/20</p>').join("")+'</article>').join("")+'</div></details>';};
 const targets=grade?[grade]:[1,2];
 get("iw-results").innerHTML=targets.map(g=>{
  const students=list.filter(s=>Number(s.academic_year)===g),participating=students.filter(s=>s.attempts>0).length;
  return '<section class="written-grade-section" data-grade-group="'+g+'"><h3>'+g+'학년</h3><p class="written-grade-summary">학생 '+students.length+'명 · 학습 참여 '+participating+'명</p>'+(students.map(renderStudent).join("")||"<p>해당 학생 없음</p>")+'</section>';
 }).join("");
 if(!grade){
  const unknown=list.filter(s=>![1,2].includes(Number(s.academic_year)));
  if(unknown.length)get("iw-results").insertAdjacentHTML("beforeend",'<section class="written-grade-section"><h3>학년 미설정</h3>'+unknown.map(renderStudent).join("")+'</section>');
 }
 if(ui){
  const gradeChart=document.createElement("div");gradeChart.className="learning-grade-chart-grid";
  const rootChart=document.createElement("div");gradeChart.append(rootChart);get("iw-results").prepend(gradeChart);
  ui.renderBars(rootChart,"학년별 필기 학습 참여율",targets.map(g=>{const students=list.filter(s=>Number(s.academic_year)===g);const active=students.filter(s=>s.attempts>0).length;return [g+"학년 · "+active+"/"+students.length+"명",students.length?Math.round(active/students.length*100):null];}),{unit:"%",max:100,caption:"선택 시험 및 기간 기준"});
   const achievement=document.createElement("div");gradeChart.append(achievement);const active=list.filter(s=>s.attempts>0);
   const passed=active.filter(s=>s.recent?.passed===true).length,notPassed=active.filter(s=>s.recent&&s.recent.passed!==true).length,notCompleted=active.length-passed-notPassed;
   ui.renderDonut(achievement,"필기 학습 성과 · 참여 "+active.length+"명",[["합격 기준 충족",passed],["기준 미충족",notPassed],["완료 회차 없음",notCompleted]],{caption:"선택 기간 참여 학생의 최근 완료 회차 기준 · 실제 자격시험 결과 아님"});
 }
 }catch{if(request===seq)get("iw-status").textContent="통계를 조회하지 못했습니다. 관리자 권한과 네트워크를 확인하세요.";}}
 for(const id of ["iw-exam","iw-period","iw-offset"])get(id).addEventListener("change",load);
 get("iw-grade").addEventListener("change",()=>ui?ui.setGrade(get("iw-grade").value):load());
 ui?.onGrade(value=>{get("iw-grade").value=value;void load();});get("iw-refresh").addEventListener("click",load);void load();
}