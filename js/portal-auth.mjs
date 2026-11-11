/* Portal Auth: Supabase Auth + server-authorized profile and 90-day portal session. */
/* Public publishable key only; NEVER place a secret/service-role key here. */
import {createClient} from "https://esm.sh/@supabase/supabase-js@2.119.0?bundle";

const client=createClient("https://zjsindkakjfzmjgrkaou.supabase.co", "sb_publishable_g8oFA9J2ZFiBc-86wa2Pew_7DzoCZab",{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:"kbigdata-portal-auth-v1"}
});
window.portalSupabaseClient=client;
const root=document.createElement("div");
root.id="portal-auth-layer";
root.hidden=true; // The whole portal requires an authorized account.
document.body.append(root);
const css=document.createElement("link");
css.rel="stylesheet";
css.href="css/portal-auth.css?v=20261111-header-controls-1";
document.head.append(css);

const locked=document.getElementById("learning-lock");
let activeUser=null;
let activeWrite=false;
let expires=0;
function resetLearning(){
  activeUser=null;
  window.portalLearning=null;
  delete document.documentElement.dataset.portalAccess;
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
let opener=null;
root.addEventListener("keydown",event=>{
  if(event.key==="Escape"){if(document.documentElement.dataset.portalAccess==="approved"){root.hidden=true;opener?.focus();}return;}
  if(event.key!=="Tab")return;
  const fields=[...root.querySelectorAll("button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href]")].filter(el=>el.getClientRects().length);
  const target=event.shiftKey?fields.at(-1):fields[0];
  if(event.shiftKey?(document.activeElement===fields[0]||document.activeElement.id==="portal-auth-title"):document.activeElement===fields.at(-1)){event.preventDefault();target?.focus();}
});
function card(title,inner){
  if(root.hidden)opener=document.activeElement;
  root.hidden=false;
  root.innerHTML='<section class="portal-auth-card" role="dialog" aria-modal="true" aria-labelledby="portal-auth-title">'+
    '<p class="portal-auth-eyebrow">K-BIGDATA STUDENT PORTAL</p><h1 id="portal-auth-title" tabindex="-1">'+title+'</h1>'+inner+
    '<p id="portal-auth-status" role="status" aria-live="polite"></p></section>';
  $("#portal-auth-title")?.focus?.();
}
function renderLogin(message=""){
  card("포털 로그인",'<p class="portal-auth-lead">학과 통합 포털은 로그인 후 이용할 수 있습니다. 재학생과 졸업생은 이메일 인증 및 계정 승인 후 사용할 수 있습니다.</p>'+
   '<form id="portal-login-form" class="portal-auth-form">'+
   '<label>이메일<input name="email" type="email" autocomplete="username" required></label>'+
   '<label>비밀번호<input name="password" type="password" autocomplete="current-password" required></label>'+
   '<button class="portal-auth-primary" type="submit">로그인</button></form>'+
   '<div class="portal-auth-actions portal-auth-secondary-actions"><button type="button" data-view="signup">회원가입</button>'+
   '<button type="button" class="portal-auth-subtle" data-view="forgot">비밀번호 재설정</button></div>');
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
function identityFields(){
  return '<fieldset class="portal-auth-identity"><legend>가입 유형</legend>'+
    '<div class="portal-auth-type-options">'+
    '<label class="portal-auth-type-option"><input type="radio" name="signup_type" value="student" checked><span><strong>재학생</strong><small>학번으로 가입</small></span></label>'+
    '<label class="portal-auth-type-option"><input type="radio" name="signup_type" value="alumni"><span><strong>졸업생</strong><small>졸업년도로 가입</small></span></label>'+
    '</div></fieldset>'+
    '<label data-identity="student">학번<input name="student_no" maxlength="30" pattern="[0-9A-Za-z\\-]{3,30}" autocomplete="off" placeholder="학번 입력" required></label>'+
    '<label data-identity="alumni" hidden>졸업년도<input name="graduation_year" type="number" inputmode="numeric" min="1900" max="'+new Date().getFullYear()+'" placeholder="예: 2025" disabled></label>';
}
function bindIdentity(form,initial){
  const {signup_type,student_no,graduation_year}=form.elements;
  signup_type.value=initial==="alumni"?"alumni":"student";
  function sync(){
    const alumni=signup_type.value==="alumni";
    for(const field of [student_no,graduation_year]){
      const visible=(field===graduation_year)===alumni;
      field.disabled=!visible;
      field.required=visible;
      field.closest("label").hidden=!visible;
    }
    for(const label of form.querySelectorAll(".portal-auth-type-option")){
      label.classList.toggle("is-selected",label.querySelector('input').checked);
    }
  }
  for(const radio of form.querySelectorAll('input[name="signup_type"]'))radio.addEventListener("change",sync);
  sync();
}
function eligible(profile){
  return ["enrolled","leave"].includes(profile.enrollment_status) ||
    (profile.signup_type==="alumni" && profile.enrollment_status==="graduated");
}
function renderSignup(){
  card("회원가입",'<p class="portal-auth-lead">재학생은 학번을, 졸업생은 졸업년도를 입력해 주세요. 교수·관리자는 기존 계정으로 로그인하세요.</p>'+
   '<form id="portal-signup-form" class="portal-auth-form">'+
   identityFields()+
   '<label>이름<input name="full_name" maxlength="80" minlength="2" autocomplete="name" required></label>'+
   '<label>이메일<input name="email" type="email" autocomplete="email" required></label>'+
   '<label>비밀번호 (8자 이상)<input name="password" type="password" minlength="8" autocomplete="new-password" required></label>'+
   '<button class="portal-auth-primary" type="submit">가입하고 인증메일 받기</button></form>'+
   '<div class="portal-auth-actions portal-auth-return-actions"><button type="button" data-view="login">로그인으로 돌아가기</button></div>');
  const form=$("#portal-signup-form");
  bindIdentity(form);
  form.addEventListener("submit",async e=>{
    e.preventDefault();const fd=new FormData(form);
    const email=String(fd.get("email")).trim().toLowerCase();
    const full_name=String(fd.get("full_name")).trim();
    if(email===professorEmail){status("교수·관리자는 기존 계정으로 로그인하세요.");return;}
    const signup_type=fd.get("signup_type"), student_no=fd.get("student_no")?.trim()||null;
    const graduation_year=signup_type==="alumni"?Number(fd.get("graduation_year")):null;
    const btn=form.querySelector('button[type="submit"]');btn.disabled=true;
    status("인증메일을 발송하고 있습니다...");
    try{
      const {error}=await client.auth.signUp({
        email,password:String(fd.get("password")),
        options:{emailRedirectTo:locked?location.href:resetLink,data:{full_name,student_no,signup_type,graduation_year}}
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
    '<div class="portal-auth-actions portal-auth-return-actions"><button type="button" data-view="login">로그인으로 돌아가기</button></div>');
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
  card("회원 정보 입력",'<p class="portal-auth-lead">학습 서비스를 이용하려면 가입 유형에 맞는 정보를 등록해 주세요.</p>'+
    '<form id="portal-complete-form" class="portal-auth-form">'+
    identityFields()+
    '<label>이름<input name="full_name" maxlength="80" minlength="2" required></label>'+
    '<button class="portal-auth-primary" type="submit">정보 등록</button></form>');
  const form=$("#portal-complete-form"),isProfessor=user.email?.toLowerCase()===professorEmail;
  form.elements.full_name.value=user.user_metadata?.full_name||"";
  form.elements.student_no.value=user.user_metadata?.student_no||"";
  bindIdentity(form,user.user_metadata?.signup_type);
  form.elements.graduation_year.value=user.user_metadata?.graduation_year||"";
  if(isProfessor){
     const typeGroup=form.querySelector(".portal-auth-identity");typeGroup.hidden=true;
     for(const radio of typeGroup.querySelectorAll("input"))radio.disabled=true;
     form.elements.graduation_year.disabled=true;
     form.elements.graduation_year.required=false;
     form.elements.graduation_year.closest("label").hidden=true;
     form.elements.student_no.disabled=true;
     form.elements.student_no.closest("label").hidden=true;
   }
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const {error}=await client.rpc("register_portal_member_v2",{
      p_name:form.elements.full_name.value.trim(),
      p_student_no:isProfessor||form.elements.student_no.disabled?null:form.elements.student_no.value.trim(),
      p_signup_type:isProfessor?"student":form.elements.signup_type.value,p_graduation_year:form.elements.graduation_year.disabled?null:Number(form.elements.graduation_year.value)
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
  delete document.documentElement.dataset.portalAccess;
  window.portalLearning=null;
  renderLogin();
}
function showAccount(){
  let btn=document.getElementById("portal-account-button");
  if(!btn){
    btn=document.createElement("button");btn.id="portal-account-button";btn.type="button";
    document.querySelector(".site-header .header-inner")?.append(btn);
  }
  if(!btn)return;
  const label=currentUser?"내 계정":"로그인";
  btn.classList.add("portal-account-trigger");
  btn.dataset.signedIn=currentUser?"true":"false";
  btn.setAttribute("aria-label",currentUser?"내 계정 열기":"로그인");
  btn.title=label;
  btn.innerHTML='<svg class="portal-account-trigger-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+
    '<circle cx="12" cy="8" r="3.5"/><path d="M5 20v-1.5a7 7 0 0 1 14 0V20"/></svg>'+
    '<span class="portal-account-button-text">'+label+'</span>';
  btn.onclick=()=>{
    const menu=document.querySelector(".site-header .portal-menu");
    if(menu?.open && window.matchMedia("(max-width: 1240px)").matches)menu.open=false;
    if(!currentUser)return renderLogin();
    if(!currentProfile)return renderComplete(currentUser);
    if(currentProfile.approval_status!=="approved" ||
       !eligible(currentProfile))return renderPending(currentProfile);
    return renderAccount();
  };
}

function renderAccount(){
  card("내 계정",
    '<div class="portal-account-profile" aria-label="현재 로그인 계정">'+
      '<span id="portal-account-avatar" class="portal-account-avatar" aria-hidden="true"></span>'+
      '<div class="portal-account-identity">'+
        '<p id="portal-account-name" class="portal-account-name"></p>'+
        '<p id="portal-account-email" class="portal-account-email"></p>'+
        '<span id="portal-account-role" class="portal-account-role"></span>'+
      '</div>'+
    '</div><div id="portal-account-actions"></div>');
  $(".portal-auth-card").classList.add("portal-account-card");
  const dismiss=document.createElement("button");
  dismiss.type="button";dismiss.className="portal-account-dismiss";
  dismiss.setAttribute("aria-label","내 계정 창 닫기");dismiss.textContent="×";
  dismiss.addEventListener("click",()=>{root.hidden=true;opener?.focus();});
  $(".portal-auth-card").insertBefore(dismiss,$(".portal-account-profile"));
  $("#portal-account-avatar").textContent=(currentProfile?.full_name||"U").trim().slice(0,1)||"U";
  $("#portal-account-name").textContent=currentProfile?.full_name||"사용자";
  $("#portal-account-email").textContent=currentUser?.email||"";
  $("#portal-account-role").textContent=isAdmin?"관리자":
    currentProfile?.signup_type==="alumni"?"졸업생 · "+currentProfile.graduation_year+"년 졸업":
    currentProfile?.enrollment_status==="leave"?"휴학 · 학습 기록 읽기 전용":"재학생";

  const area=$("#portal-account-actions");
  const addSection=(heading)=>{
    const section=document.createElement("section");
    section.className="portal-account-section";
    const title=document.createElement("h2");title.textContent=heading;
    const list=document.createElement("div");list.className="portal-account-list";
    section.append(title,list);area.append(section);return list;
  };
  const addAction=(list,{title,detail,href,onClick,secondary=false})=>{
    const element=document.createElement(href?"a":"button");
    element.className="portal-account-action"+(secondary?" portal-account-secondary":"");
    if(href)element.href=href;
    else {element.type="button";element.addEventListener("click",onClick);}
    const copy=document.createElement("span");copy.className="portal-account-copy";
    const name=document.createElement("span");name.className="portal-account-action-title";name.textContent=title;
    const description=document.createElement("span");description.className="portal-account-action-detail";description.textContent=detail;
    const chevron=document.createElement("span");chevron.className="portal-account-chevron";
    chevron.setAttribute("aria-hidden","true");chevron.textContent=href?"→":"›";
    copy.append(name,description);element.append(copy,chevron);list.append(element);
  };

  const learning=addSection("학습");
  addAction(learning,{title:"나의 학습현황",detail:"풀이 기록과 오답 복습",href:"my-learning.html"});
  if(isAdmin)addAction(learning,{title:"학급 주간 학습통계",detail:"학생들의 주간 학습 결과 확인",href:"teacher-learning.html"});

  if(activeWrite){
    const settings=addSection("개인 설정");
    addAction(settings,{title:"기존 기록 가져오기",detail:"이 기기의 즐겨찾기·할 일을 계정으로 옮기기",onClick:importDevicePersonalData,secondary:true});
  }
  if(isAdmin){
    const management=addSection("관리자 기능");
    addAction(management,{title:"학생 계정 관리",detail:"가입 승인 및 학적 상태 변경",onClick:renderAdmin,secondary:true});
  }

  const footer=document.createElement("div");footer.className="portal-account-footer";
  const out=document.createElement("button");out.type="button";out.className="portal-account-logout";out.textContent="로그아웃";
  out.addEventListener("click",logout);
  footer.append(out);area.after(footer);
}

async function importDevicePersonalData(){
 if(!currentUser||!activeWrite)return;
 if(!window.confirm("현재 기기에 남아 있는 즐겨찾기·오늘의 할 일이 본인의 기록인지 확인하세요. 확인을 누르면 이 계정으로 가져옵니다."))return;
 status("기존 개인 설정을 가져오고 있습니다.");
 try{
  const {importLegacyShortcuts}=await import("./portal-personal.js?v=20261111-db-sync-1");
  const imported=await importLegacyShortcuts();
  const day=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
  let legacy=null;try{legacy=JSON.parse(localStorage.getItem("kbigdata:daily-plan:v1")||"null");}catch{}
  const rows=[];
  if(legacy?.date===day&&legacy.byGrade){
   for(const [g,ids] of Object.entries({"1":["docs","project"],"2":["recruit","interview"]})){
    for(const id of ids)if(legacy.byGrade[g]?.[id]===true)
     rows.push({user_id:currentUser.id,task_date:day,task_key:g+":"+id});
   }
  }
  if(rows.length){
   const {error}=await client.from("daily_task_checks").upsert(rows,{onConflict:"user_id,task_date,task_key"});
   if(error)throw error;
  }
  const savedGrade=localStorage.getItem("kbigdata:home-grade:v1");
  if(["1","2"].includes(savedGrade)){
   const {error}=await client.from("user_preferences").upsert({user_id:currentUser.id,preferred_grade:savedGrade},{onConflict:"user_id"});
   if(error)throw error;
  }
  status("기존 개인 설정 "+(imported+rows.length)+"건을 가져왔습니다. 학년 설정이 있다면 함께 반영했습니다.");
  window.dispatchEvent(new Event("portal-personal-updated"));
  window.dispatchEvent(new Event("portal-learning-ready"));
 }catch(error){console.error("Device import failed",error);status("기존 기록을 가져오지 못했습니다. 새로고침 후 다시 시도해 주세요.");}
}
async function renderAdmin(){
  if(!isAdmin){renderAccount();return;}
  card("재학생·졸업생 계정 관리",'<p class="portal-auth-lead">가입 승인과 재학 상태를 변경할 수 있습니다. 변경 내용은 감사 기록에 저장됩니다.</p>'+
    '<div class="portal-admin-scroll"><table class="portal-admin-table"><thead><tr><th>이름</th><th>가입 유형</th><th>학번 / 졸업년도</th><th>이메일</th><th>가입 승인</th><th>학적</th><th>변경</th></tr></thead><tbody id="portal-student-list"></tbody></table></div>'+
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
    for(const item of [member.full_name,member.signup_type==="alumni"?"졸업생":"재학생",
       member.signup_type==="alumni"?member.graduation_year+"년 졸업":member.student_no||"-",member.email]){
      const td=document.createElement("td");td.textContent=item;tr.append(td);
    }
    const approval=options([["pending","대기"],["approved","승인"],["rejected","반려"],["suspended","정지"]],member.approval_status);
    const enrollment=options([["enrolled","재학"],["leave","휴학"],["withdrawn","자퇴"],["graduated","졸업"]],member.enrollment_status);
     if(member.signup_type==="alumni"){enrollment.value="graduated";enrollment.disabled=true;enrollment.title="졸업생의 학적은 졸업으로 유지됩니다.";}
    for(const select of [approval,enrollment]){const td=document.createElement("td");td.append(select);tr.append(td);}
    const td=document.createElement("td");const save=document.createElement("button");save.type="button";save.textContent="저장";
    save.addEventListener("click",async()=>{
      if(!window.confirm("선택한 회원의 계정 상태를 변경하시겠습니까?"))return;
      save.disabled=true;
      const {error}=await client.rpc("admin_update_student",{
        p_target_user_id:member.user_id,p_approval_status:approval.value,p_enrollment_status:enrollment.value
      });
      status(error?"저장 실패: 관리자 권한과 입력값을 확인하세요.":"회원 상태를 저장했습니다.");
      save.disabled=false;
    });td.append(save);tr.append(td);body.append(tr);
  }
  if(!data?.length)status("등록된 학생 계정이 없습니다.");
}
async function activate(interactive=true){
  if(inRecovery)return;
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user){
    currentUser=null;currentProfile=null;isAdmin=false;
    showAccount();renderLogin();
    return;
  }
  currentUser=user;
  currentProfile=null;isAdmin=false;
  let profile=null;
  const {data:found,error:readError}=await client.from("profiles").select("*").eq("user_id",user.id).maybeSingle();
  if(readError){
    renderLogin("회원 정보를 확인하지 못했습니다.");
    return;
  }
  if(found)profile=found;
  else{
    const name=String(user.user_metadata?.full_name||"").trim();
    if(!name){
      renderComplete(user);
      showAccount();return;
    }
    const {data:registered,error:regError}=await client.rpc("register_portal_member_v2",{
      p_name:name,p_student_no:user.user_metadata?.student_no||null,
      p_signup_type:user.user_metadata?.signup_type||"student",p_graduation_year:user.user_metadata?.graduation_year||null
    });
    if(regError){
      renderComplete(user);status("회원 정보를 확인해 다시 입력해 주세요.");
      showAccount();return;
    }
    profile=registered;
  }
  const {data:expiry,error:sessionError}=await client.rpc("start_portal_session");
  if(sessionError){
    await client.auth.signOut();
    currentUser=null;currentProfile=null;isAdmin=false;
    showAccount();
    renderLogin("로그인 세션이 만료되었거나 취소되었습니다. 다시 로그인해 주세요.");
    return;
  }
  currentProfile=profile;
  const {data:allowed}=await client.rpc("portal_super_admin_allowed");
  isAdmin=allowed===true;
  if(profile.approval_status!=="approved" || !eligible(profile)){
    showAccount();
    renderPending(profile);
    return;
  }
  expires=Date.parse(expiry);
  if(!Number.isFinite(expires)||expires<=Date.now()){await logout();return;}
  const {data:access,error:accessError}=await client.rpc("portal_learning_access");
  if(accessError || access?.read!==true){
    renderPending(profile);
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
  document.documentElement.dataset.portalAccess="approved";
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
  showAccount();renderLogin("학습 권한을 확인하지 못했습니다. 새로고침해 주세요.");
}
