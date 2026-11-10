import {getClient,getAccount,koreanStatus} from "./learning-auth.js";
import {flushCloudAttempts} from "./learning-sync.js";
const $=s=>document.querySelector(s);
const labels={coding:"기초 프로그래밍·Ubuntu",ncp:"NCP",practical:"정보처리"};
const totals={coding:350,ncp:75,practical:220};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const link=row=>({coding:"coding.html",ncp:"ncp.html",practical:"practical.html"}[row.bank]||"index.html")+"?id="+encodeURIComponent(row.question_id);
async function load(){
 const note=$("#account-note"),account=await getAccount();
 if(!account.loggedIn){note.innerHTML='로그인이 필요합니다. <a href="login.html">이메일로 로그인하기</a>';return;}
 note.textContent=(account.profile?.full_name||account.user.email)+" · "+koreanStatus(account.profile);
 if(!(account.active||account.readOnly))return;
 $("#learning-main").hidden=false;
 await flushCloudAttempts();
 const client=await getClient();
 const [progress,attempts,prefs]=await Promise.all([
  client.from("learning_progress").select("bank,question_id,last_result,attempts_count,correct_count,incorrect_count,last_attempt_at").eq("user_id",account.user.id).limit(1000),
  client.from("learning_attempts").select("bank,question_id,result,grading_method,submitted_at").eq("user_id",account.user.id).gte("submitted_at",new Date(Date.now()-7*86400000).toISOString()).limit(2000),
  client.from("user_preferences").select("weekly_email_opt_in").eq("user_id",account.user.id).maybeSingle()
 ]);
 if(progress.error||attempts.error){note.textContent="학습기록을 가져오지 못했습니다. 다시 시도해 주세요.";return;}
 const records=progress.data||[],week=attempts.data||[];
 const activeWeek=new Set(week.map(x=>x.bank+":"+x.question_id));
 const retry=records.filter(x=>x.last_result==="incorrect");
 $("#learning-summary").innerHTML=[
  ["학습한 고유문제",records.length+"문제"],
  ["최근 7일 학습",activeWeek.size+"문제"],
  ["복습 필요",retry.length+"문제"]
 ].map(([label,value])=>'<article><span>'+esc(label)+'</span><strong>'+esc(value)+'</strong></article>').join("");
 $("#bank-progress").innerHTML=Object.keys(totals).map(bank=>{
  const subset=records.filter(x=>x.bank===bank),wrong=subset.filter(x=>x.last_result==="incorrect").length;
  return '<tr><th>'+labels[bank]+'</th><td>'+subset.length+' / '+totals[bank]+'</td><td>'+Math.round(subset.length/totals[bank]*100)+'%</td><td>'+wrong+'</td></tr>';
 }).join("");
 $("#wrong-list").innerHTML=retry.sort((a,b)=>new Date(b.last_attempt_at)-new Date(a.last_attempt_at)).slice(0,25)
  .map(x=>'<tr><td>'+esc(x.question_id)+'</td><td>오답 (총 '+x.incorrect_count+'회)</td><td><a href="'+link(x)+'">다시 풀기</a></td></tr>').join("")||'<tr><td colspan="3">현재 복습할 오답이 없습니다.</td></tr>';
 $("#weekly-opt-in").checked=!!prefs.data?.weekly_email_opt_in;
 const automatic=week.filter(x=>x.grading_method==="automatic"&&["correct","incorrect"].includes(x.result));
 const self=week.filter(x=>x.grading_method==="self"&&["correct","incorrect"].includes(x.result));
 const rate=x=>x.length?Math.round(x.filter(a=>a.result==="correct").length/x.length*100)+"%":"집계 없음";
 const rateEl=document.createElement("p");rateEl.className="learning-note";
 rateEl.textContent="최근 7일 자동 판정 정답률: "+rate(automatic)+" · 자가 평가 정답률: "+rate(self);
 $("#learning-summary").after(rateEl);
 $("#weekly-opt-in").addEventListener("change",async e=>{
  const {error}=await client.from("user_preferences").upsert({user_id:account.user.id,weekly_email_opt_in:e.target.checked,updated_at:new Date().toISOString()},{onConflict:"user_id"});
  $("#mail-status").textContent=error?"저장 실패: "+error.message:"수신 설정을 저장했습니다.";
 },{once:false});
}
$("#refresh-button").addEventListener("click",()=>location.reload());
load().catch(e=>{$("#account-note").textContent="학습현황을 표시할 수 없습니다: "+e.message;});
