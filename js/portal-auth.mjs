/* Portal Auth: Supabase Auth + server-authorized profile and 90-day portal session. */
/* Public publishable key only; NEVER place a secret/service-role key here. */
import {createClient} from "https://esm.sh/@supabase/supabase-js@2.119.0?bundle";

const client=createClient("https://zjsindkakjfzmjgrkaou.supabase.co", "sb_publishable_g8oFA9J2ZFiBc-86wa2Pew_7DzoCZab",{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:"kbigdata-portal-auth-v1"}
});
const root=document.createElement("div");
root.id="portal-auth-layer";
root.hidden=true; // Public portal is always usable without signing in.
document.body.append(root);
const css=document.createElement("link");
css.rel="stylesheet";
css.href="css/portal-auth.css?v=20261111";
document.head.append(css);

const locked=document.getElementById("learning-lock");
let activeUser=null;
let activeWrite=false;
let expires=0;
function resetLearning(){
  if(!activeUser)return;
  activeUser=null;
  window.portalLearning=null;
  document.documentElement.style.visibility="hidden";
  location.reload();
}
async function checkLearning(){
  if(!activeUser)return;
  const {data,error}=await client.rpc("portal_learning_access");
  if(error || !data?.read || data.write!==activeWrite || Date.now()>=expires)resetLearning();
}
window.addEventListener("pageshow",event=>{if(event.persisted)location.reload();});
document.addEventListener("visibilitychange",()=>{if(!document.hidden)checkLearning().catch(resetLearning);});
setInterval(()=>checkLearning().catch(resetLearning),60000);
const professorEmail="hglee67@kopo.ac.kr";
let currentUser=null;
let currentProfile=null;
let isAdmin=false;
let inRecovery=false;
const resetLink=location.origin+"/index.html";
const statusText=(error)=>error?.message==="Invalid login credentials"?"이메일 또는 비밀번호가 올바르지 않습니다.": "요청을 처리하지 못했습니다. 입력 내용과 네트워크 상태를 확인해 주세요.";
const $=(selector)=>root.querySelector(selector);
const status=(message)=>{const node=$("#portal-auth-status");if(node)node.textContent=message;};
function card(title,inner){
  root.hidden=false;
  root.innerHTML='<section class="portal-auth-card" role="dialog" aria-modal="true" aria-labelledby="portal-auth-title">'+
    '<button type="button" class="portal-auth-dismiss" id="portal-auth-dismiss" aria-label="닫고 포털 이용하기">닫기</button>'+
    '<p class="portal-auth-eyebrow">K-BIGDATA STUDENT PORTAL</p><h1 id="portal-auth-title" tabindex="-1">'+title+'</h1>'+inner+
    '<p id="portal-auth-status" role="status" aria-live="polite"></p></section>';
  $("#portal-auth-dismiss").addEventListener("click",()=>{if(locked&&!activeUser)location.assign("/");else root.hidden=true;});
  $("#portal-auth-title")?.focus?.();
}
function renderLogin(message=""){
  card("포털 로그인",'<p class="portal-auth-lead">포털 안내는 누구나 볼 수 있습니다. 학습 자료와 이 브라우저의 학습 기록은 이메일 인증 및 계정 승인 후 이용할 수 있습니다.</p>'+
   '<form id="portal-login-form" class="portal-auth-form">'+
   '<label>이메일<input name="email" type="email" autocomplete="username" required></label>'+
   '<label>비밀번호<input name="password" type="password" autocomplete="current-password" required></label>'+
   '<button class="portal-auth-primary" type="submit">로그인</button></form>'+
   '<div class="portal-auth-actions"><button type="button" data-view="signup">회원가입</button>'+
   '<button type="button" data-view="forgot">비밀번호 재설정</button></div>');
  if(message)status(message);
  $("#portal-login-form").addEventListener("submit",async e=>{
    e.preventDefault();const fd=new FormData(e.currentTarget); const btn=e.currentTarget.querySelector("button");
    btn.disabled=true;status("로그인 중입니다...");
    try{
      const {error}=await client.auth.signInWithPassword({email:String(fd.get("email")).trim(),password:String(fd.get("password"))});
      if(error)throw error;await activate(true);
    }catch(error){status(statusText(error));btn.disabled=false;}
  });
  $('[data-view="signup"]').addEventListener("click",()=>renderSignup());
  $('[data-view="forgot"]').addEventListener("click",()=>renderForgot());
}
function renderSignup(){
  card("학생 회원가입",'<p class="portal-auth-lead">이름과 학번을 정확히 입력하세요. 교수 계정은 학번을 입력하지 않습니다.</p>'+
   '<form id="portal-signup-form" class="portal-auth-form">'+
   '<label>이름<input name="full_name" maxlength="80" minlength="2" autocomplete="name" required></label>'+
   '<label>학번<input id="portal-student-no" name="student_no" maxlength="30" pattern="[0-9A-Za-z-]{3,30}" required></label>'+
   '<label>이메일<input name="email" type="email" autocomplete="email" required></label>'+
   '<label>비밀번호 (8자 이상)<input name="password" type="password" minlength="8" autocomplete="new-password" required></label>'+
   '<button class="portal-auth-primary" type="submit">가입하고 인증메일 받기</button></form>'+
   '<div class="portal-auth-actions"><button type="button" data-view="login">로그인으로 돌아가기</button></div>');
  const form=$("#portal-signup-form");
  form.elements.email.addEventListener("input",()=>{
    const professor=form.elements.email.value.trim().toLowerCase()===professorEmail;
    form.elements.student_no.required=!professor;
    form.elements.student_no.disabled=professor;
    form.elements.student_no.closest("label").hidden=professor;
  });
  form.addEventListener("submit",async e=>{
    e.preventDefault();const fd=new FormData(form);
    const email=String(fd.get("email")).trim().toLowerCase();
    const full_name=String(fd.get("full_name")).trim();
    const student_no=email===professorEmail?null:String(fd.get("student_no")||"").trim();
    const btn=form.querySelector('button[type="submit"]');btn.disabled=true;
    status("인증메일을 발송하고 있습니다...");
    try{
      const {error}=await client.auth.signUp({
        email,password:String(fd.get("password")),
        options:{emailRedirectTo:locked?location.href:resetLink,data:{full_name,student_no}}
      });
      if(error)throw error;
      renderLogin("가입 요청이 접수되었습니다. 이메일의 인증 링크를 클릭한 후 로그인하세요. 학생 계정은 관리자 승인 후 이용할 수 있습니다.");
    }catch(error){status(statusText(error));btn.disabled=false;}
  });
  $('[data-view="login"]').addEventListener("click",()=>renderLogin());
}
function renderForgot(){
  card("비밀번호 재설정",'<p class="portal-auth-lead">등록된 이메일로 비밀번호 변경 링크를 발송합니다.</p>'+
    '<form id="portal-reset-form" class="portal-auth-form">'+
    '<label>이메일<input name="email" type="email" autocomplete="email" required></label>'+
    '<button class="portal-auth-primary" type="submit">재설정 메일 발송</button></form>'+
    '<div class="portal-auth-actions"><button type="button" data-view="login">로그인으로 돌아가기</button></div>');
  $("#portal-reset-form").addEventListener("submit",async e=>{
    e.preventDefault();const email=e.currentTarget.elements.email.value.trim();
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:resetLink});
    status(error?statusText(error):"이메일 주소가 등록되어 있다면 재설정 링크가 발송됩니다.");
  });
  $('[data-view="login"]').addEventListener("click",()=>renderLogin());
}
function renderNewPassword(){
  inRecovery=true;
  card("새 비밀번호 설정",'<form id="portal-new-password" class="portal-auth-form">'+
      '<label>새 비밀번호 (8자 이상)<input name="password" type="password" minlength="8" autocomplete="new-password" required></label>'+
      '<button class="portal-auth-primary" type="submit">비밀번호 변경</button></form>');
  $("#portal-new-password").addEventListener("submit",async e=>{
    e.preventDefault();const {error}=await client.auth.updateUser({password:e.currentTarget.elements.password.value});
    if(error){status(statusText(error));return;}
    inRecovery=false;await logout();
    renderLogin("비밀번호가 변경되었습니다. 새 비밀번호로 로그인하세요.");
  });
}
function renderPending(profile){
  const approval={pending:"관리자 승인 대기",rejected:"가입 반려",suspended:"이용 정지",approved:"승인 완료"}[profile.approval_status]||"계정 확인 필요";
  const enrollment={enrolled:"재학",leave:"휴학",withdrawn:"자퇴",graduated:"졸업"}[profile.enrollment_status]||"미확인";
  card("계정 이용 안내",'<p class="portal-auth-lead" id="portal-member-status"></p>'+
    '<p class="portal-auth-note">계정 상태 변경은 담당 교수 관리자에게 문의하세요.</p>'+
    '<button id="portal-pending-logout" class="portal-auth-primary" type="button">로그아웃</button>');
  $("#portal-member-status").textContent=approval+" · "+enrollment;
  $("#portal-pending-logout").addEventListener("click",logout);
}
function renderComplete(user){
  card("회원 정보 입력",'<p class="portal-auth-lead">학습 서비스를 이용하려면 이름과 학번을 등록해야 합니다.</p>'+
    '<form id="portal-complete-form" class="portal-auth-form">'+
    '<label>이름<input name="full_name" maxlength="80" minlength="2" required></label>'+
    '<label id="portal-complete-student">학번<input name="student_no" pattern="[0-9A-Za-z-]{3,30}" required></label>'+
    '<button class="portal-auth-primary" type="submit">정보 등록</button></form>');
  const form=$("#portal-complete-form"),isProfessor=user.email?.toLowerCase()===professorEmail;
  form.elements.full_name.value=user.user_metadata?.full_name||"";
  form.elements.student_no.value=user.user_metadata?.student_no||"";
  if(isProfessor){form.elements.student_no.required=false;$("#portal-complete-student").hidden=true;}
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const {error}=await client.rpc("register_portal_member",{
      p_name:form.elements.full_name.value.trim(),
      p_student_no:isProfessor?null:form.elements.student_no.value.trim()
    });
    if(error){status(statusText(error));return;}
    await activate(true);
  });
}
async function logout(){
  try{await client.rpc("revoke_portal_session");}catch{}
  await client.auth.signOut();
  currentUser=null;currentProfile=null;isAdmin=false;
  showAccount();
  root.hidden=true;
}
function showAccount(){
  let btn=document.getElementById("portal-account-button");
  if(!btn){
    btn=document.createElement("button");btn.id="portal-account-button";btn.type="button";
    document.querySelector(".site-header .header-inner")?.append(btn);
  }
  if(!btn)return;
  btn.textContent=currentUser?"내 계정":"로그인";
  btn.onclick=()=>{
    if(!currentUser)return renderLogin();
    if(!currentProfile)return renderComplete(currentUser);
    if(currentProfile.approval_status!=="approved" ||
       !["enrolled","leave"].includes(currentProfile.enrollment_status))return renderPending(currentProfile);
    return renderAccount();
  };
}
function renderAccount(){
  card("내 계정",'<p id="portal-account-info" class="portal-auth-lead"></p>'+
    '<div class="portal-auth-actions" id="portal-account-actions"></div>');
  $("#portal-account-info").textContent=(currentProfile?.full_name||"사용자")+" · "+(currentUser?.email||"")+
    (currentProfile?.enrollment_status==="leave"?" · 휴학(학습 기록 읽기 전용)":"");
  const area=$("#portal-account-actions");
  if(isAdmin){const admin=document.createElement("button");admin.type="button";admin.textContent="학생 계정 관리";
    admin.addEventListener("click",renderAdmin);area.append(admin);}
  const close=document.createElement("button");close.type="button";close.textContent="닫기";
  close.addEventListener("click",()=>{if(locked&&!activeUser)location.assign("/");else root.hidden=true;});area.append(close);
  const out=document.createElement("button");out.type="button";out.textContent="로그아웃";
  out.addEventListener("click",logout);area.append(out);
}
async function renderAdmin(){
  if(!isAdmin){renderAccount();return;}
  card("학생 계정 관리",'<p class="portal-auth-lead">가입 승인과 재학 상태를 변경할 수 있습니다. 변경 내용은 감사 기록에 저장됩니다.</p>'+
    '<div class="portal-admin-scroll"><table class="portal-admin-table"><thead><tr><th>이름</th><th>학번</th><th>이메일</th><th>가입 승인</th><th>학적</th><th>변경</th></tr></thead><tbody id="portal-student-list"></tbody></table></div>'+
    '<div class="portal-auth-actions"><button type="button" id="portal-admin-close">닫기</button></div>');
  $("#portal-admin-close").addEventListener("click",renderAccount);
  const {data,error}=await client.rpc("admin_list_students");
  if(error){status("학생 목록을 불러오지 못했습니다. 관리자 권한을 확인해 주세요.");return;}
  const body=$("#portal-student-list");
  const options=(items,value)=>{const select=document.createElement("select");
    for(const [v,label] of items){const option=document.createElement("option");option.value=v;option.textContent=label;select.append(option);}
    select.value=value;return select;};
  for(const member of data||[]){
    const tr=document.createElement("tr");
    for(const item of [member.full_name,member.student_no||"-",member.email]){
      const td=document.createElement("td");td.textContent=item;tr.append(td);
    }
    const approval=options([["pending","대기"],["approved","승인"],["rejected","반려"],["suspended","정지"]],member.approval_status);
    const enrollment=options([["enrolled","재학"],["leave","휴학"],["withdrawn","자퇴"],["graduated","졸업"]],member.enrollment_status);
    for(const select of [approval,enrollment]){const td=document.createElement("td");td.append(select);tr.append(td);}
    const td=document.createElement("td");const save=document.createElement("button");save.type="button";save.textContent="저장";
    save.addEventListener("click",async()=>{
      if(!window.confirm("선택한 학생의 계정 상태를 변경하시겠습니까?"))return;
      save.disabled=true;
      const {error}=await client.rpc("admin_update_student",{
        p_target_user_id:member.user_id,p_approval_status:approval.value,p_enrollment_status:enrollment.value
      });
      status(error?"저장 실패: 관리자 권한과 입력값을 확인하세요.":"학생 상태를 저장했습니다.");
      save.disabled=false;
    });td.append(save);tr.append(td);body.append(tr);
  }
  if(!data?.length)status("등록된 학생 계정이 없습니다.");
}
async function activate(interactive=Boolean(locked)){
  if(inRecovery)return;
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user){
    currentUser=null;currentProfile=null;isAdmin=false;
    showAccount();if(locked)renderLogin();else root.hidden=true;
    return;
  }
  currentUser=user;
  currentProfile=null;isAdmin=false;
  let profile=null;
  const {data:found,error:readError}=await client.from("profiles").select("*").eq("user_id",user.id).maybeSingle();
  if(readError){
    if(interactive)renderLogin("회원 정보를 확인하지 못했습니다.");
    else root.hidden=true;
    return;
  }
  if(found)profile=found;
  else{
    const name=String(user.user_metadata?.full_name||"").trim();
    if(!name){
      if(interactive)renderComplete(user);
      else root.hidden=true;
      showAccount();return;
    }
    const {data:registered,error:regError}=await client.rpc("register_portal_member",{
      p_name:name,p_student_no:user.user_metadata?.student_no||null
    });
    if(regError){
      if(interactive){renderComplete(user);status("회원 정보를 확인해 다시 입력해 주세요.");}
      else root.hidden=true;
      showAccount();return;
    }
    profile=registered;
  }
  const {data:expiry,error:sessionError}=await client.rpc("start_portal_session");
  if(sessionError){
    await client.auth.signOut();
    currentUser=null;currentProfile=null;isAdmin=false;
    showAccount();
    if(interactive)renderLogin("로그인 세션이 만료되었거나 취소되었습니다. 다시 로그인해 주세요.");
    else root.hidden=true;
    return;
  }
  currentProfile=profile;
  const {data:allowed}=await client.rpc("portal_super_admin_allowed");
  isAdmin=allowed===true;
  if(profile.approval_status!=="approved" || !["enrolled","leave"].includes(profile.enrollment_status)){
    showAccount();
    if(interactive)renderPending(profile);
    else root.hidden=true;
    return;
  }
  expires=Date.parse(expiry);
  if(!Number.isFinite(expires)||expires<=Date.now()){await logout();if(locked)renderLogin();return;}
  const {data:access,error:accessError}=await client.rpc("portal_learning_access");
  if(accessError || access?.read!==true){
    if(interactive)renderPending(profile);
    return;
  }
  if(activeUser && activeUser!==user.id){resetLearning();return;}
  activeUser=user.id;
  activeWrite=access.write===true;
  function expire(){
    if(Date.now()>=expires)resetLearning();
    else setTimeout(expire,Math.min(expires-Date.now(),2147483647));
  }
  expire();
  window.portalLearning={read:true,write:activeWrite,expires};
  root.hidden=true;
  showAccount();
  for(const entry of document.querySelectorAll("script[data-module]")){
    await import(new URL(entry.dataset.module,document.baseURI).href);
    entry.removeAttribute("data-module");
  }
  document.getElementById("learning-notice")?.remove();
  locked?.remove();
  window.dispatchEvent(new Event("portal-learning-ready"));

}
client.auth.onAuthStateChange((event,session)=>{
  if(activeUser && (event==="SIGNED_OUT" || (session && session.user.id!==activeUser)))resetLearning();
  if(event==="PASSWORD_RECOVERY")queueMicrotask(()=>renderNewPassword());
});
showAccount();
try{await activate();}catch(error){
  console.error("Portal Auth initialization error",error);
  showAccount();if(locked)renderLogin("학습 권한을 확인하지 못했습니다. 새로고침해 주세요.");else root.hidden=true;
}
