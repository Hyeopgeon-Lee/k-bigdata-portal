// Authenticated portal settings: own profile status and password.
const api=globalThis.portalSupabaseClient;
const byId=name=>document.getElementById(name);
function notify(name,message,kind="info"){const node=byId(name);if(!node)return;node.textContent=message;node.dataset.kind=kind;}
function busy(form,on){const button=form.querySelector('button[type="submit"]');button.disabled=on;button.setAttribute("aria-busy",String(on));}
function selectedCards(form){for(const option of form.querySelectorAll(".my-page-option"))option.classList.toggle("is-selected",Boolean(option.querySelector("input")?.checked));}
const mobileDigits=value=>String(value??"").replace(/[ -]/g,"");
const validMobile=value=>/^[0-9 -]+$/.test(String(value??"").trim())&&/^01[016789][0-9]{7,8}$/.test(mobileDigits(value));
const displayMobile=value=>String(value??"").replace(/^(01\d)(\d{3,4})(\d{4})$/,"$1-$2-$3");
function statusLabel(profile){return profile.enrollment_status==="early_employment"?"조기취업":profile.enrollment_status==="graduated"?"졸업":profile.enrollment_status==="leave"?"휴학":[1,2].includes(Number(profile.academic_year))?profile.academic_year+"학년":"학년 미설정";}
async function start(){
 if(!api||!globalThis.portalLearning?.read){notify("my-page-password-message","로그인 상태를 확인할 수 없습니다. 다시 로그인해 주세요.","error");return;}
 const context=window.portalVerifiedContext,user=context?.user;
 if(!user){notify("my-page-password-message","로그인 세션을 확인하지 못했습니다.","error");return;}
 const profile=context.profile?{...context.profile}:null;
 if(!profile){notify("my-page-password-message","회원 정보를 불러오지 못했습니다.","error");return;}
 byId("my-page-name").textContent=profile.full_name||"이름 미등록";
 byId("my-page-email").textContent=user.email||profile.email||"-";
 byId("my-page-student-no").textContent=profile.signup_type==="student"?(profile.student_no||"-"):profile.signup_type==="alumni"?profile.graduation_year+"년 졸업":"관리자";
 byId("my-page-enrollment").textContent=profile.signup_type==="student"?statusLabel(profile):profile.signup_type==="alumni"?"졸업생":"관리자";
 byId("my-page-state").textContent=profile.approval_status==="approved"?"승인 완료":"승인 확인 필요";
 // Personal qualifications are for members, not portal administrators.
 // Default-hidden shortcut is exposed only after both checks pass.
 const adminAllowed=context.isAdmin;
 byId("my-page-cert-shortcut").hidden=adminAllowed!==false||!["student","alumni"].includes(profile.signup_type);
 if(["student","alumni"].includes(profile.signup_type)){
  byId("my-page-mobile-summary").hidden=false;
  byId("my-page-mobile-summary-value").textContent=profile.mobile_phone?displayMobile(profile.mobile_phone):"미등록";
  const contactPanel=byId("my-page-contact-panel");
  const contactForm=byId("my-page-mobile-form");
  const contactInput=byId("my-page-mobile-phone");
  contactPanel.hidden=false;
  contactInput.value=profile.mobile_phone?displayMobile(profile.mobile_phone):"";
  contactForm.addEventListener("submit",async event=>{
   event.preventDefault();
   const phone=contactInput.value.trim();
   if(!validMobile(phone)){
    notify("my-page-mobile-message","휴대전화번호를 정확히 입력해 주세요. 예: 010-1234-5678","error");
    contactInput.focus();return;
   }
   if(mobileDigits(phone)===mobileDigits(profile.mobile_phone)){
    notify("my-page-mobile-message","현재 등록된 번호와 동일합니다.");return;
   }
   busy(contactForm,true);notify("my-page-mobile-message","휴대전화번호를 저장하고 있습니다.");
   try{
    const {error}=await api.rpc("update_my_mobile_phone",{p_mobile_phone:phone});
    if(error)throw error;
    profile.mobile_phone=mobileDigits(phone);
    contactInput.value=displayMobile(profile.mobile_phone);
    byId("my-page-mobile-summary-value").textContent=contactInput.value;
    notify("my-page-mobile-message","휴대전화번호를 저장했습니다.","success");
   }catch(err){
    console.error("Mobile phone update failed",err?.code||"unknown");
    notify("my-page-mobile-message","휴대전화번호를 저장하지 못했습니다. 다시 로그인한 후 시도해 주세요.","error");
   }finally{busy(contactForm,false);}
  });
 }
 if(profile.signup_type==="student"&&profile.approval_status==="approved"&&profile.enrollment_status==="enrolled"){
  const panel=byId("my-page-alumni-mail-panel"),form=byId("my-page-alumni-mail-form"),message="my-page-alumni-mail-message";
  panel.hidden=false;
  // Load independently of the other profile settings; unavailable preferences fail closed.
  api.rpc("my_student_alumni_mail_preferences").then(({data,error})=>{
   if(error||!data){notify(message,"메일 수신 설정을 불러오지 못했습니다. 다시 시도해 주세요.","error");return;}
   form.elements.career.checked=data.career_enabled===true;
   form.elements.news.checked=data.news_enabled===true;
   form.querySelector('button[type="submit"]').disabled=false;
   form.addEventListener("submit",async event=>{
    event.preventDefault();busy(form,true);
    try{const {error}=await api.rpc("set_my_student_alumni_mail_preferences",{p_career:form.elements.career.checked,p_news:form.elements.news.checked});
     if(error)throw error;notify(message,"메일 수신 설정을 저장했습니다.","success");
    }catch{notify(message,"메일 수신 설정을 저장하지 못했습니다.","error");}
    finally{busy(form,false);}
   });
  }).catch(()=>notify(message,"메일 수신 설정을 불러오지 못했습니다.","error"));
 }
 const lockNotice=byId("my-page-academic-lock-note");
 if(profile.signup_type==="alumni")lockNotice.hidden=false;
 if(profile.signup_type==="student"&&profile.approval_status==="approved"&&["enrolled","leave","graduated","early_employment"].includes(profile.enrollment_status)){
  // The server checks the same condition during every status update.
  // Fail closed if this registration check cannot be completed.
  const {data:registeredAlumni,error:registrationError}=await api.rpc("my_alumni_profile_registered");
  if(registrationError||registeredAlumni!==false){
   lockNotice.textContent=registrationError
    ?"학적 상태 변경 가능 여부를 확인하지 못했습니다. 다시 로그인한 후 시도해 주세요."
    :"졸업생 네트워크에 등록된 계정은 학적 상태를 변경할 수 없습니다. 변경이 필요하면 담당 관리자에게 문의하세요.";
   lockNotice.hidden=false;
  }else{
   byId("my-page-academic-panel").hidden=false;
  const form=byId("my-page-academic-form");
  const original=profile.enrollment_status==="early_employment"?"early_employment":profile.enrollment_status==="graduated"?"graduated":profile.enrollment_status==="leave"?"leave":[1,2].includes(Number(profile.academic_year))?String(profile.academic_year):"";
  if(original)form.elements.academic_status.value=original;
  selectedCards(form);
  form.addEventListener("change",()=>selectedCards(form));
  const requestLabels={"1":"1학년","2":"2학년","leave":"휴학","graduated":"졸업","early_employment":"조기취업"};
  const {data:previousRequest,error:requestError}=await api.rpc("my_academic_request");
  if(!requestError&&previousRequest){
   const result=({pending:"승인 대기",approved:"승인",rejected:"반려",cancelled:"취소"})[previousRequest.state]||previousRequest.state;
   notify("my-page-academic-message","최근 요청: "+(requestLabels[previousRequest.requested_status]||"")+" · "+result+(previousRequest.decision_note?" · "+previousRequest.decision_note:""));
  }
  form.addEventListener("submit",async event=>{
   event.preventDefault();
   const next=form.elements.academic_status.value;
   if(!["1","2","leave","graduated","early_employment"].includes(next)){notify("my-page-academic-message","요청할 상태를 선택해 주세요.","error");return;}
   if(next===original){notify("my-page-academic-message","현재 설정과 동일합니다.");return;}
   if(!confirm("학적 변경을 관리자에게 요청하시겠습니까? 승인 전에는 기존 학적과 이용 권한이 유지됩니다."))return;
   busy(form,true);notify("my-page-academic-message","변경 요청을 등록하고 있습니다.");
   try{
    const {error}=await api.rpc("request_my_academic_status",{p_status:next,p_reason:form.elements.academic_reason.value.trim()});
    if(error)throw error;
    notify("my-page-academic-message","학적 변경 요청을 등록했습니다. 관리자 승인 전에는 현재 학적이 유지됩니다.","success");
   }catch(err){
    console.error("Academic request failed",err?.code||"unknown");
    notify("my-page-academic-message","학적 변경 요청을 등록하지 못했습니다. 다시 시도해 주세요.","error");
   }finally{busy(form,false);}
  });
  }
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
   // The password check starts a new Auth session. Restore portal access
   // even if the subsequent password update is rejected by Auth policy.
   const {error:sessionError}=await api.rpc("start_portal_session");
   if(sessionError)throw sessionError;
   const {error:changeError}=await api.auth.updateUser({password:next});
   if(changeError)throw changeError;
   form.reset();
   notify("my-page-password-message",
     "비밀번호를 변경했습니다. 다음 로그인부터 새 비밀번호를 사용하세요.","success");
  }catch(err){
   console.error("Password change failed",err?.code||"unknown");
   notify("my-page-password-message","비밀번호 변경에 실패했습니다. 비밀번호 재설정 기능을 이용하거나 다시 시도해 주세요.","error");
  }finally{busy(form,false);}
 });
}
await start();
