const db=window.portalSupabaseClient,root=document.getElementById("industrial-teacher-stats");
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const sub=s=>({"정보시스템기반기술":"정보시스템 기반 기술","프로그래밍언어활용":"프로그래밍 언어 활용","데이터베이스활용":"데이터베이스 활용"}[s]||s);
let seq=0;
function period(mode,offset){const kst=new Date(Date.now()+9*3600000),y=kst.getUTCFullYear(),m=kst.getUTCMonth(),d=kst.getUTCDate();let a,b;
 if(mode==="month"){a=Date.UTC(y,m+offset,1);b=Date.UTC(y,m+offset+1,1);}
 else{const mon=d-(kst.getUTCDay()+6)%7+offset*7;a=Date.UTC(y,m,mon);b=a+7*86400000;}
 return [new Date(a-9*3600000).toISOString(),new Date(b-9*3600000).toISOString(),new Date(a).toISOString().slice(0,10)+" ~ "+new Date(b-1).toISOString().slice(0,10)];
}
if(root){root.innerHTML='<h2>정보처리산업기사 필기 · 학생별 합격 준비</h2><p>선택 기간 학습량 및 기간 종료 시점까지의 누적 학습 성적입니다. 현재 재학생 기준이며 실제 시험 성적이 아닙니다.</p><div class="written-actions"><label>학년 <select id="iw-grade"><option value="">전체</option><option value="1">1학년</option><option value="2">2학년</option></select></label><label>기간 <select id="iw-period"><option value="week">주간</option><option value="month">월간</option></select></label><label>이전 기간 <select id="iw-offset">'+Array.from({length:13},(_,i)=>'<option value="'+(-i)+'">'+(i===0?"현재":i+"기간 전")+'</option>').join("")+'</select></label><button id="iw-refresh" type="button">새로고침</button></div><p id="iw-status" role="status"></p><div id="iw-results"></div>';
 const get=id=>document.getElementById(id);
 async function load(){const request=++seq;get("iw-status").textContent="집계 중…";get("iw-results").replaceChildren();const [start,end,label]=period(get("iw-period").value,Number(get("iw-offset").value));const grade=Number(get("iw-grade").value)||null;
 try{const {data,error}=await db.rpc("written_industrial_summary",{p_start:start,p_end:end,p_grade:grade});if(error)throw error;if(request!==seq)return;
 const list=Array.isArray(data)?data:[];get("iw-status").textContent=label+" · "+list.length+"명 · 학습 참여 "+list.filter(s=>s.attempts>0).length+"명";
 get("iw-results").innerHTML=list.map(s=>{const r=s.recent,weak=r?.subjects.filter(x=>x.correct<8).map(x=>sub(x.subject)).join(", ");return '<details class="written-round"><summary><span><strong>'+esc(s.full_name)+' · '+esc(s.academic_year)+'학년</strong><small>완료 '+s.completed+'회 · 기준 충족 '+s.passed+'회 · 이번 기간 '+s.attempts+'회 풀이</small></span><span><strong>'+(r?r.average+"점":"—")+'</strong><span class="written-pill '+(r?(r.passed?"good":"bad"):"neutral")+'">'+(r?(weak?"과락":r.passed?"기준 충족":"평균 미달"):"학습 기록 부족")+'</span></span></summary><p>누적 '+s.solved+'문항 · 기간 고유 풀이 '+s.unique_count+'문항 · 기간 모의고사 '+s.mocks+'회</p>'+(weak?'<p>과락 과목: '+esc(weak)+'</p>':'')+'<div class="written-parts">'+s.rounds.map(x=>'<article><h4>'+x.yr+'년 '+x.rnd+'회</h4><p>'+x.solved+'/60 · '+(x.complete?(x.correct>=36&&x.min_correct>=8?"기준 충족":x.min_correct<8?"과락":"평균 미달"):"학습 중")+'</p>'+x.subjects.map(p=>'<p>'+esc(sub(p.subject))+' '+p.correct*5+'점 · '+p.solved+'/20</p>').join("")+'</article>').join("")+'</div></details>';}).join("")||"<p>해당 학생 없음</p>";
 }catch{if(request===seq)get("iw-status").textContent="통계를 조회하지 못했습니다. 관리자 권한과 네트워크를 확인하세요.";}}
 for(const id of ["iw-grade","iw-period","iw-offset"])get(id).addEventListener("change",load);get("iw-refresh").addEventListener("click",load);void load();
}