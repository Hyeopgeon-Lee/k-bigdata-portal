// Authenticated portal settings: own profile status and password.
const api=globalThis.portalSupabaseClient;
const byId=name=>document.getElementById(name);
function notify(name,message,kind="info"){const node=byId(name);if(!node)return;node.textContent=message;node.dataset.kind=kind;}
function busy(form,on){const button=form.querySelector('button[type="submit"]');button.disabled=on;button.setAttribute("aria-busy",String(on));}
function selectedCards(form){for(const option of form.querySelectorAll(".my-page-option"))option.classList.toggle("is-selected",Boolean(option.querySelector("input")?.checked));}
function statusLabel(profile){return profile.enrollment_status==="leave"?"휴학":[1,2].includes(Number(profile.academic_year))?profile.academic_year+"학년":"학년 미설정";}
async function start(){
 if(!api||!globalThis.portalLearning?.read){notify("my-page-password-message","로그인 상태를 확인할 수 없습니다. 다시 로그인해 주세요.","error");return;}
 const {data:{user},error:authError}=await api.auth.getUser();
 if(authError||!user){notify("my-page-password-message","로그인 세션을 확인하지 못했습니다.","error");return;}
 const {data:profile,error:profileError}=await api.from("profiles")
  .select("full_name,email,student_no,signup_type,academic_year,enrollment_status,approval_status,graduation_year")
  .eq("user_id",user.id).single();
 if(profileError||!profile){notify("my-page-password-message","회원 정보를 불러오지 못했습니다.","error");return;}
 byId("my-page-name").textContent=profile.full_name||"이름 미등록";
 byId("my-page-email").textContent=user.email||profile.email||"-";
 byId("my-page-student-no").textContent=profile.signup_type==="student"?(profile.student_no||"-"):profile.signup_type==="alumni"?profile.graduation_year+"년 졸업":"관리자";
 byId("my-page-enrollment").textContent=profile.signup_type==="student"?statusLabel(profile):profile.signup_type==="alumni"?"졸업생":"관리자";
 byId("my-page-state").textContent=profile.approval_status==="approved"?"승인 완료":"승인 확인 필요";
 if(profile.signup_type==="student"&&profile.approval_status==="approved"&&["enrolled","leave"].includes(profile.enrollment_status)){
  byId("my-page-academic-panel").hidden=false;
  const form=byId("my-page-academic-form");
  const original=profile.enrollment_status==="leave"?"leave":[1,2].includes(Number(profile.academic_year))?String(profile.academic_year):"";
  if(original)form.elements.academic_status.value=original;
  selectedCards(form);form.addEventListener("change",()=>selectedCards(form));
  form.addEventListener("submit",async event=>{
   event.preventDefault();
   const next=form.elements.academic_status.value;
   if(!["1","2","leave"].includes(next)){notify("my-page-academic-message","변경할 상태를 선택해 주세요.","error");return;}
   if(next===original){notify("my-page-academic-message","현재 설정과 동일합니다.");return;}
   if(next==="leave"&&!confirm("휴학으로 변경하면 기존 학습기록은 보존되지만 새 학습기록을 저장할 수 없습니다. 변경할까요?"))return;
   busy(form,true);notify("my-page-academic-message","학적 상태를 저장하고 있습니다.");
   try{
    const {error}=await api.rpc("update_my_academic_status",{p_status:next});
    if(error)throw error;
    sessionStorage.setItem("portal:mypage-success","포털 학적 상태를 저장했습니다. 메인화면 기본 학년에도 반영됩니다.");
    location.reload();
   }catch(err){
    console.error("Academic status update failed",err?.code||"unknown");
    notify("my-page-academic-message","학적 상태를 저장하지 못했습니다. 다시 로그인한 후 시도해 주세요.","error");
    busy(form,false);
   }
  });
 }
 const flash=sessionStorage.getItem("portal:mypage-success");
 if(flash){sessionStorage.removeItem("portal:mypage-success");notify("my-page-academic-message",flash,"success");}
 const form=byId("my-page-password-form");
 form.addEventListener("submit",async event=>{
  event.preventDefault();
  const current=form.elements.old_password.value;
  const next=form.elements.new_password.value;
  const repeated=form.elements.confirm_password.value;
  if(next.length<8){notify("my-page-password-message","새 비밀번호를 8자 이상 입력해 주세요.","error");return;}
  if(next!==repeated){notify("my-page-password-message","새 비밀번호 확인 입력이 일치하지 않습니다.","error");return;}
  if(next===current){notify("my-page-password-message","기존 비밀번호와 다른 비밀번호를 설정해 주세요.","error");return;}
  busy(form,true);notify("my-page-password-message","현재 비밀번호를 확인하고 있습니다.");
  try{
   // Re-verify credentials with Supabase before changing password.
   const {error:checkError}=await api.auth.signInWithPassword({email:user.email,password:current});
   if(checkError){notify("my-page-password-message","현재 비밀번호가 일치하지 않습니다.","error");return;}
   const {error:changeError}=await api.auth.updateUser({password:next});
   if(changeError)throw changeError;
   // The re-login rotates the auth session ID, so register its portal session.
   const {error:sessionError}=await api.rpc("start_portal_session");
   form.reset();
   notify("my-page-password-message",sessionError?
     "비밀번호가 변경되었습니다. 다시 로그인해 주세요.":
     "비밀번호를 변경했습니다. 다음 로그인부터 새 비밀번호를 사용하세요.","success");
  }catch(err){
   console.error("Password change failed",err?.code||"unknown");
   notify("my-page-password-message","비밀번호 변경에 실패했습니다. 비밀번호 재설정 기능을 이용하거나 다시 시도해 주세요.","error");
  }finally{busy(form,false);}
 });
}
await start();
