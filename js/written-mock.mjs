import {normalizeSubject} from "./written-dashboard.mjs?v=20261127-v1";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const button=(name,text,extra="")=>'<button type="button" class="button button-secondary" data-mock-action="'+name+'" '+extra+'>'+text+'</button>';
export function createMockExam({root,db,bank,back,enter,writable=true}){
 let session=null,index=0,timer=null,busy=false,active=false,serverOffset=0;
 const lookup=new Map(bank.map(q=>[q.id,q]));
 const call=async args=>{const {data,error}=await db.rpc("written_mock_action",args);if(error)throw error;return data;};
 const history=async()=>{
  const {data,error}=await db.from("written_mock_sessions").select("id,exam_year,exam_round,started_at,deadline,submitted_at,result").order("started_at",{ascending:false}).limit(100);
  if(error)throw error;return data||[];
 };
 const showHistory=async()=>{
  const el=root.querySelector("#written-mock-history");if(!el)return;
  try{const items=await history();if(!el.isConnected)return;const finished=items.filter(x=>x.result),activeRow=items.find(x=>!x.submitted_at);
   el.innerHTML=(activeRow&&writable?button("resume","진행 중 모의고사 이어서",'data-id="'+esc(activeRow.id)+'"'):"")+
    (finished.length?'<h4>최근 모의고사 성적 변화</h4><div class="written-parts">'+finished.slice(0,5).reverse().map(x=>'<article><small>'+x.exam_year+'년 '+x.exam_round+'회</small><progress max="100" value="'+Number(x.result.average)+'"></progress><strong>'+Number(x.result.average).toFixed(1)+'점</strong><p>'+(x.result.passed?"모의 합격":"기준 미달")+'</p></article>').join("")+'</div><div class="written-mock-history">'+finished.map(x=>'<article><strong>'+x.exam_year+'년 '+x.exam_round+'회 · '+Number(x.result.average).toFixed(1)+'점</strong><span class="written-pill '+(x.result.passed?"good":"bad")+'">'+(x.result.passed?"모의 합격":"기준 미달")+'</span><small>'+new Date(x.submitted_at).toLocaleString("ko-KR",{timeZone:"Asia/Seoul"})+'</small><p>'+x.result.subjects.map(p=>esc(normalizeSubject(p.subject))+' '+p.score+'점').join(" · ")+'</p>'+button("review","답안 확인",'data-id="'+esc(x.id)+'"')+'</article>').join("")+'</div>':"<p>완료한 모의고사가 없습니다.</p>");
  }catch{if(el.isConnected)el.textContent="모의고사 기록을 불러오지 못했습니다.";}
 };
 async function get(id){const {data,error}=await db.from("written_mock_sessions").select("*").eq("id",id).single();if(error)throw error;return data;}
 function close(){active=false;clearInterval(timer);timer=null;session=null;back();}
 function clock(){if(!session||!active)return;const seconds=Math.max(0,Math.ceil((Date.parse(session.deadline)-Date.now()-serverOffset)/1000));const node=root.querySelector("#mock-clock");if(node)node.textContent=Math.floor(seconds/60)+":"+String(seconds%60).padStart(2,"0");if(!seconds&&!busy)void submit(true);}
 function render(){
  clearInterval(timer);
  if(session.submitted_at){renderResult();return;}
  const questions=session.question_ids.map(id=>lookup.get(id));if(questions.some(q=>!q)){root.innerHTML="<p>등록 문항이 변경되어 시험을 표시할 수 없습니다.</p>"+button("close","학습현황");return;}
  const q=questions[index],picked=session.answers[q.id],answered=Object.keys(session.answers).length;
  root.innerHTML='<section class="written-dashboard"><div class="written-mock-top"><h2>실전 모의고사 · '+session.exam_year+'년 '+session.exam_round+'회</h2><strong id="mock-clock" role="timer"></strong></div><p>답안은 선택 즉시 서버에 저장됩니다. 정답은 제출 후 공개합니다. '+answered+'/60문항 응답</p><div class="written-question-numbers">'+questions.map((x,i)=>button("jump",String(i+1),'data-index="'+i+'" aria-label="'+(i+1)+'번 '+(session.answers[x.id]?"응답 완료":"미응답")+'" aria-pressed="'+(i===index)+'" '+(session.answers[x.id]?'data-answered="true"':""))).join("")+'</div><article class="bank-empty"><h3>'+q.number+'번 · '+esc(normalizeSubject(q.subject))+'</h3><p style="white-space:pre-wrap">'+esc(q.question)+'</p>'+(q.code?'<pre>'+esc(q.code)+'</pre>':"")+(q.visuals||[]).map(v=>'<img class="written-source-figure" alt="문제 그림" src="'+esc(v.dataUri)+'">').join("")+'<div class="written-mock-choices">'+q.options.map((o,i)=>'<button type="button" class="button button-secondary" data-mock-action="answer" data-answer="'+(i+1)+'" aria-pressed="'+(picked===i+1)+'">'+(i+1)+'. '+esc(o)+(q.optionVisuals?.[i]?'<img alt="선택지 그림" src="'+esc(q.optionVisuals[i].dataUri)+'">':"")+'</button>').join("")+'</div></article><p id="mock-status" role="status"></p><div class="written-actions">'+button("previous","이전",index===0?"disabled":"")+button("next","다음",index===59?"disabled":"")+button("submit","시험 제출")+button("pause","학습현황으로 (시험시간 계속)")+'</div></section>';
  clock();timer=setInterval(clock,1000);
 }
 function renderResult(){clearInterval(timer);const r=session.result;root.innerHTML='<section class="written-dashboard"><h2>모의고사 성적 · '+session.exam_year+'년 '+session.exam_round+'회</h2><p><strong>'+Number(r.average).toFixed(1)+'점</strong> · <span class="written-pill '+(r.passed?"good":"bad")+'">'+(r.passed?"모의 합격":"기준 미달")+'</span></p><div class="written-parts">'+r.subjects.map(p=>'<article><h3>'+esc(normalizeSubject(p.subject))+'</h3><strong>'+p.score+'점</strong><p>정답 '+p.correct+' / 20 · 응답 '+p.answered+' / 20</p></article>').join("")+'</div><h3>문제별 결과</h3>'+session.question_ids.map(id=>{const q=lookup.get(id);if(!q)return "";const a=session.answers[id],correct=a===q.answer;return '<details class="written-round"><summary>'+q.number+'번 · '+(a?(correct?"정답":"오답"):"미응답")+'</summary><p>'+esc(q.question)+'</p><p>내 답 '+(a||"미응답")+' · 정답 '+q.answer+'번</p><p>'+esc(q.explanation||"")+'</p></details>';}).join("")+button("close","학습현황으로")+'</section>';}
 async function submit(auto=false){if(busy||!session||session.submitted_at)return;if(!auto&&!confirm("시험을 제출하시겠습니까? 미응답 문항은 오답 처리됩니다."))return;busy=true;try{session=await call({p_action:"submit",p_id:session.id});render();}catch(e){const n=root.querySelector("#mock-status");if(n)n.textContent="제출 실패 · 연결을 확인하고 다시 제출해 주세요.";}finally{busy=false;}}
 async function start(key){if(busy)return;busy=true;try{const [year,round]=key.split("-").map(Number);session=await call({p_action:"start",p_year:year,p_round:round});active=true;enter();index=0;render();}finally{busy=false;}}
 async function resume(id){session=await get(id);active=true;enter();index=0;render();}
 root.addEventListener("click",async e=>{const b=e.target.closest("[data-mock-action]");if(!b||busy)return;const a=b.dataset.mockAction;
 try{
 if(a==="resume"&&!writable)return;
 if(a==="resume"||a==="review"){await resume(b.dataset.id);return;}
 if(!active)return;
 if(a==="close"||a==="pause"){close();return;}
 if(a==="submit"){await submit();return;}
 if(a==="jump"){index=Number(b.dataset.index);render();return;}
 if(a==="previous"||a==="next"){index=Math.max(0,Math.min(59,index+(a==="next"?1:-1)));render();return;}
 if(a==="answer"){busy=true;root.querySelectorAll("[data-mock-action]").forEach(x=>x.disabled=true);try{session=await call({p_action:"answer",p_id:session.id,p_question:session.question_ids[index],p_answer:Number(b.dataset.answer)});render();}finally{busy=false;}}
 }catch(e){const n=root.querySelector("#mock-status");if(n)n.textContent="서버 연결 실패 · 다시 시도하세요.";else alert("모의고사 기록을 불러오지 못했습니다.");if(active&&session&&!session.submitted_at)root.querySelectorAll("[data-mock-action]").forEach(x=>x.disabled=false);}
 });
 return {start,showHistory,resume,stop:()=>{clearInterval(timer);active=false;},isActive:()=>active};
}
