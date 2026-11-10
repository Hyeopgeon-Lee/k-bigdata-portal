import {getClient,getAccount} from "./learning-auth.js";
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let students=[];
async function api(action,args={}){
 const client=await getClient();
 const {data,error}=await client.functions.invoke("learning-admin",{body:{action,...args}});
 if(error)throw error;
 if(data?.error)throw Error(data.error);
 return data;
}
async function start(){
 const account=await getAccount();
 if(!account.isAdmin||!account.active){$("#admin-status").textContent="슈퍼 관리자 계정에서만 접근할 수 있습니다.";return;}
 $("#admin-panel").hidden=false;await refresh();
}
async function refresh(){
 try{
 const [result,stats]=await Promise.all([api("students"),api("summary")]);
 students=result.students||[];
 const counts={
  total:students.length,pending:students.filter(x=>x.approval_status==="pending").length,
  enrolled:students.filter(x=>x.enrollment_status==="enrolled"&&x.approval_status==="approved").length
 };
 $("#admin-counts").innerHTML=[["전체 가입",counts.total],["가입 승인 대기",counts.pending],["재학",counts.enrolled]]
  .map(([name,n])=>'<article>'+esc(name)+'<strong>'+n+'명</strong></article>').join("");
 $("#admin-summary").textContent="이번 주 풀이 "+(stats.attempts||0)+"회 · 고유 학습문제 "+(stats.unique||0)+"개 · 참여 학생 "+(stats.activeStudents||0)+"명";
 show();$("#admin-status").textContent="최신 상태를 불러왔습니다.";
 }catch(e){$("#admin-status").textContent="관리 정보를 가져오지 못했습니다: "+e.message;}
}
function show(){
 const q=$("#student-search").value.trim().toLowerCase();
 $("#student-rows").innerHTML=students.filter(x=>(x.full_name+" "+(x.student_no||"")).toLowerCase().includes(q))
 .map(x=>{
  const approvals=["pending","approved","rejected","suspended"].map(status=>'<option value="'+status+'"'+(status===x.approval_status?" selected":"")+'>'+({pending:"승인 대기",approved:"승인",rejected:"거절",suspended:"정지"}[status])+'</option>').join("");
  const enrollments=["enrolled","leave","withdrawn","graduated"].map(status=>'<option value="'+status+'"'+(status===x.enrollment_status?" selected":"")+'>'+({enrolled:"재학",leave:"휴학",withdrawn:"자퇴",graduated:"졸업"}[status])+'</option>').join("");
  return '<tr data-id="'+esc(x.user_id)+'"><td>'+esc(x.full_name)+'</td><td>'+esc(x.student_no||"—")+'</td><td><select aria-label="가입상태">'+approvals+'</select></td><td><select aria-label="학적상태">'+enrollments+'</select></td><td><button type="button" data-save>저장</button></td></tr>';
 }).join("")||'<tr><td colspan="5">일치하는 학생이 없습니다.</td></tr>';
}
$("#student-search").addEventListener("input",show);
$("#student-rows").addEventListener("click",async e=>{
 const button=e.target.closest("button[data-save]");if(!button)return;
 const tr=button.closest("tr");const [approval,enrollment]=[...tr.querySelectorAll("select")].map(x=>x.value);
 if(!confirm("학생 학적·가입 상태를 변경하시겠습니까?"))return;
 button.disabled=true;
 try{await api("update",{userId:tr.dataset.id,approvalStatus:approval,enrollmentStatus:enrollment});
 await refresh();$("#admin-status").textContent="변경 내역을 저장했습니다.";
 }catch(err){$("#admin-status").textContent="변경 실패: "+err.message;}
 finally{button.disabled=false;}
});
start().catch(e=>{$("#admin-status").textContent=e.message;});
