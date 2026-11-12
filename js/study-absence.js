/* Standalone absence form. Portal Auth initializes this module after access approval. */
const db=window.portalSupabaseClient;
const el=id=>document.getElementById(id);
const kinds=new Set(["personal","home_study","career","condition","forgot","other"]);
const date=new URLSearchParams(location.search).get("reason")||"";
function validDate(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const d=new Date(value+"T00:00:00Z");
 return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===value;
}
function status(id,text,kind="info"){
 const node=el(id);node.textContent=text;node.dataset.kind=kind;
}
async function init(){
 const form=el("study-reason-form");
 if(!validDate(date)){
  el("study-reason-date").textContent="날짜 미지정";
  status("absence-load-status","메일의 미참여 사유 입력 버튼으로 접속해 주세요. 날짜가 포함된 링크가 필요합니다.","error");
  return;
 }
 el("study-reason-date").textContent=date;
 if(!db||window.portalLearning?.read!==true){
  status("absence-load-status","포털 로그인과 접근 권한을 확인할 수 없습니다. 다시 로그인해 주세요.","error");return;
 }
 const {data:{user},error:authError}=await db.auth.getUser();
 if(authError||!user){
  status("absence-load-status","로그인 상태를 확인하지 못했습니다. 다시 로그인해 주세요.","error");return;
 }
 const {data:prior,error:loadError}=await db.from("study_absence_reasons")
  .select("reason,details").eq("user_id",user.id).eq("study_date",date).maybeSingle();
 if(loadError){
  status("absence-load-status","이미 제출한 사유를 불러오지 못했습니다. 다시 시도해 주세요.","error");return;
 }
 if(prior){
  el("study-reason-select").value=prior.reason;
  el("study-reason-details").value=prior.details||"";
 }
 form.hidden=false;
 const {data:member,error:memberError}=await db.from("profiles").select("signup_type,enrollment_status").eq("user_id",user.id).single();
 if(memberError||!member){status("absence-load-status","학적 상태를 확인하지 못했습니다.","error");return;}
 const canWrite=window.portalLearning?.write===true&&member.signup_type==="student"&&member.enrollment_status==="enrolled";
 for(const id of ["study-reason-select","study-reason-details","study-reason-submit"])el(id).disabled=!canWrite;
 status("absence-load-status",!canWrite?"현재 계정은 사유 저장이 제한됩니다.":prior?"기존 제출 내용이 있습니다. 필요하면 수정하여 저장하세요.":"해당 날짜에 참여하지 못한 사유를 선택해 주세요.",canWrite?"info":"error");
 const details=el("study-reason-details");
 const updateCount=()=>{el("absence-character-count").textContent=details.value.length+" / 500자";};
 details.addEventListener("input",updateCount);
 updateCount();
 form.addEventListener("submit",async event=>{
  event.preventDefault();
  const reason=el("study-reason-select").value;
  const description=details.value.trim();
  if(!canWrite){status("study-reason-feedback","현재 계정은 사유 저장이 제한됩니다.","error");return;}
  if(!kinds.has(reason)){status("study-reason-feedback","미참여 사유를 선택해 주세요.","error");el("study-reason-select").focus();return;}
  if(description.length>500){status("study-reason-feedback","추가 설명은 500자 이하로 입력해 주세요.","error");return;}
  const button=el("study-reason-submit");button.disabled=true;
  status("study-reason-feedback","사유를 저장하고 있습니다.");
  try{
   const {error}=await db.from("study_absence_reasons")
    .upsert({user_id:user.id,study_date:date,reason,details:description},{onConflict:"user_id,study_date"});
   if(error)throw error;
   status("study-reason-feedback","미참여 사유를 저장했습니다. 필요하면 내용을 수정해 다시 제출할 수 있습니다.","success");
  }catch(error){
   console.error("Absence reason save failed",error?.code||"unknown");
   status("study-reason-feedback","사유를 저장하지 못했습니다. 로그인 상태와 네트워크 연결을 확인해 주세요.","error");
  }finally{button.disabled=false;}
 });
}
await init();
