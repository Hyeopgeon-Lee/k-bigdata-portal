import {getAccount,requestCode,verifyCode,signOutPortal,koreanStatus,isConfigured} from "./learning-auth.js";
const $=s=>document.querySelector(s);
const status=(msg,error=false)=>{const n=$("#auth-status");n.textContent=msg;n.dataset.kind=error?"error":"success";};
const email=$("#email"),mode=()=>document.querySelector('input[name="mode"]:checked')?.value||"login";
const superEmail="hglee67@kopo.ac.kr";
function refreshSignup(){
 const signup=mode()==="signup",admin=email.value.trim().toLowerCase()===superEmail;
 $("#signup-fields").hidden=!signup;$("#full-name").required=signup;
 $("#student-number-label").hidden=admin;$("#student-no").required=signup&&!admin;
}
for(const input of document.querySelectorAll('input[name="mode"]'))input.addEventListener("change",refreshSignup);
email.addEventListener("input",refreshSignup);
async function renderAccount(){
 const account=await getAccount();
 $("#account-state").hidden=!account.loggedIn;
 $("#auth-form").hidden=!!account.loggedIn;
 if(!account.loggedIn){if(!account.configured)status("현재 인증 서버 연결 설정 전입니다. 관리자가 Supabase 프로젝트를 연결해야 사용할 수 있습니다.",true);return;}
 $("#account-summary").textContent=[account.profile?.full_name||account.user.email,koreanStatus(account.profile),
  account.isAdmin?"슈퍼 관리자":"학생"].join(" · ");
 $("#admin-link").hidden=!account.isAdmin;
}
$("#request-form").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!isConfigured()){status("인증 서버 설정 전입니다.",true);return;}
 const btn=$("#request-button");btn.disabled=true;
 try{await requestCode(email.value,mode()==="signup");
 $("#request-form").hidden=true;$("#verify-form").hidden=false;
 $("#otp").focus();status("인증번호를 이메일로 전송했습니다. 메일함을 확인하세요.");
 }catch(err){status(err.message||"인증번호 요청에 실패했습니다.",true);}
 finally{btn.disabled=false;}
});
$("#verify-form").addEventListener("submit",async e=>{
 e.preventDefault();const btn=$("#verify-button");btn.disabled=true;
 try{
  const isSignup=mode()==="signup";
  const account=await verifyCode(email.value,$("#otp").value,{
   fullName:isSignup?$("#full-name").value:"",
   studentNo:isSignup?$("#student-no").value:""
  });
  if(!account.profile)status("로그인했습니다. 신규 회원은 '처음 회원가입'을 선택해 이름과 학번을 등록해야 합니다.",true);
  else if(account.isAdmin)location.replace("students-admin.html");
  else if(account.active||account.readOnly)location.replace("my-learning.html");
  else status("회원가입이 접수되었습니다. 관리자 승인을 받은 뒤 학습기록 동기화를 이용할 수 있습니다.");
 }catch(err){status(err.message||"인증에 실패했습니다.",true);}
 finally{btn.disabled=false;}
});
$("#back-button").addEventListener("click",()=>{$("#verify-form").hidden=true;$("#request-form").hidden=false;status("");});
$("#logout-button").addEventListener("click",async()=>{await signOutPortal();await renderAccount();status("로그아웃했습니다.");});
refreshSignup();renderAccount().catch(e=>status(e.message,true));
