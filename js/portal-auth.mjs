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
css.href="css/portal-auth.css?v=20261112-member-mobile-2";
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
// Share the verified, server-backed display name across all portal pages.
// An email address must never be used as a visible member-name fallback.
window.portalMemberName=()=>String(currentProfile?.full_name||"").trim()||"이름 미등록";
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
        '<span id="portal-account-role" class="portal-account-role"></span>'+
      '</div>'+
    '</div><div id="portal-account-actions"></div>');
  $(".portal-auth-card").classList.add("portal-account-card");
  const dismiss=document.createElement("button");
  dismiss.type="button";dismiss.className="portal-account-dismiss";
  dismiss.setAttribute("aria-label","내 계정 창 닫기");dismiss.textContent="×";
  dismiss.addEventListener("click",()=>{root.hidden=true;opener?.focus();});
  $(".portal-auth-card").insertBefore(dismiss,$(".portal-account-profile"));
  const memberName=window.portalMemberName();
  $("#portal-account-avatar").textContent=memberName==="이름 미등록"?"?":memberName.slice(0,1);
  $("#portal-account-name").textContent=memberName;
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
    addAction(management,{title:"가입 승인 요청",detail:"승인을 기다리는 가입 신청만 확인",onClick:renderApprovalRequests,secondary:true});
    addAction(management,{title:"학생 계정 관리",detail:"기존 계정과 학적 상태 관리",onClick:renderAdmin,secondary:true});
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
async function renderWithdrawnDeletion(member){
  if(!isAdmin||member.enrollment_status!=="withdrawn"||member.signup_type==="alumni"){renderAdmin();return;}
  card("자퇴 학생 영구 삭제",
    '<p class="portal-auth-lead">삭제 대상과 연결된 학습·예약·요청 데이터를 확인합니다. 삭제한 계정은 복구할 수 없습니다.</p>'+
    '<p id="portal-delete-member" class="portal-delete-member"></p>'+
    '<p id="portal-delete-loading" class="portal-auth-note">삭제 대상 기록을 확인하고 있습니다.</p>'+
    '<ul id="portal-delete-counts" class="portal-delete-counts" hidden></ul>'+
    '<div id="portal-delete-confirm" class="portal-delete-confirm" hidden>'+
      '<p class="portal-delete-warning">영구 삭제 시 계정, 연결된 학습 기록, 개인 설정, 예약, 요청 및 첨부파일이 제거됩니다. 학번과 이름이 일치하지 않는 구형 기록 및 포털 외부 서비스의 데이터는 별도 확인이 필요합니다.</p>'+
      '<label>확인할 학생 이름<input id="portal-delete-name" type="text" autocomplete="off" placeholder="학생 이름을 정확히 입력"></label>'+
      '<label>확인 문구<input id="portal-delete-word" type="text" autocomplete="off" placeholder="영구삭제"></label>'+
      '<button id="portal-delete-confirm-button" type="button" class="portal-auth-danger" disabled>이 학생의 데이터 영구 삭제</button>'+
    '</div>'+
    '<div class="portal-auth-actions"><button id="portal-delete-back" type="button">학생 목록으로 돌아가기</button></div>');
  $("#portal-delete-member").textContent=member.full_name+" · "+member.email;
  $("#portal-delete-back").addEventListener("click",renderAdmin);
  const {data:preview,error:previewError}=await client.functions.invoke("admin-delete-student",{
    body:{action:"preview",userId:member.user_id}
  });
  if(previewError||!preview?.ok){
    $("#portal-delete-loading").textContent="삭제 대상 확인에 실패했습니다. 학적이 자퇴로 저장되었는지 확인해 주세요.";
    return;
  }
  $("#portal-delete-loading").textContent="아래 항목을 확인하고 두 확인 문구를 입력해야 삭제할 수 있습니다.";
  $("#portal-delete-counts").hidden=false;
  const labels=[
    ["learning","문제 풀이 기록"],["progress","학습 진도"],["drafts","답안 임시 저장"],
    ["reservations","프로젝트실 예약"],["requests","요청 게시글"],
    ["messages","작성한 요청 메시지"],["files","첨부파일"],
    ["mail","메일 발송 이력"],["favorites","즐겨찾기"]
  ];
  for(const [key,label] of labels){
    const li=document.createElement("li");
    const count=Number(preview.counts?.[key]||0);
    li.textContent=label+" "+count.toLocaleString("ko-KR")+"건";
    $("#portal-delete-counts").append(li);
  }
  const confirmBox=$("#portal-delete-confirm");confirmBox.hidden=false;
  const name=$("#portal-delete-name"),word=$("#portal-delete-word"),button=$("#portal-delete-confirm-button");
  const check=()=>{button.disabled=name.value.trim()!==preview.fullName||word.value.trim()!=="영구삭제";};
  name.addEventListener("input",check);word.addEventListener("input",check);
  button.addEventListener("click",async()=>{
    if(button.disabled)return;
    if(!window.confirm(preview.fullName+" 학생의 모든 계정 연결 데이터를 영구 삭제합니다. 이 작업은 되돌릴 수 없습니다. 실행하시겠습니까?"))return;
    button.disabled=true;$("#portal-delete-back").disabled=true;
    const {data:result,error}=await client.functions.invoke("admin-delete-student",{
      body:{action:"delete",userId:member.user_id,fullName:name.value.trim(),
        confirmWord:word.value.trim(),version:preview.version}
    });
    if(error||!result?.deleted){
      $("#portal-delete-loading").textContent="삭제 실패: 서버에서 작업을 완료하지 못했습니다. 일부 데이터가 처리되었을 수 있으므로 관리자 확인이 필요합니다.";
      $("#portal-delete-back").disabled=false;
      check();
      return;
    }
    await renderAdmin();
    status(preview.fullName+" 학생의 계정과 연결 데이터를 영구 삭제했습니다.");
  });
}


async function approvePortalMember(member,enrollmentStatus){
  const {data,error}=await client.functions.invoke("approve-portal-signup",{
    body:{action:"approve",userId:member.user_id,enrollmentStatus:enrollmentStatus||member.enrollment_status}
  });
  if(error||!data?.approved)throw error||Error("APPROVAL_FAILED");
  return data;
}
async function retryApprovalEmail(member){
  const {data,error}=await client.functions.invoke("approve-portal-signup",{
    body:{action:"retry",userId:member.user_id}
  });
  if(error||!data?.approved)throw error||Error("EMAIL_RETRY_FAILED");
  return data;
}
async function renderApprovalRequests(){
  if(!isAdmin){renderAccount();return;}
  card("가입 승인 요청",
    '<p class="portal-auth-lead">가입 신청 후 이메일 인증을 마친 회원의 승인 요청만 표시합니다. 승인 시 신청자에게 포털 이용 안내 메일이 발송됩니다.</p>'+
    '<p id="portal-approval-count" class="portal-approval-count" role="status">승인 대기 목록 확인 중…</p>'+
    '<div id="portal-approval-list" class="portal-approval-list" aria-label="가입 승인 대기 목록"></div>'+
    '<div id="portal-approval-retry" class="portal-approval-retry" hidden></div>'+
    '<div class="portal-auth-actions"><button id="portal-approval-back" type="button">내 계정으로 돌아가기</button></div>');
  $(".portal-auth-card").classList.add("portal-requests-card");
  $("#portal-approval-back").addEventListener("click",renderAccount);
  const {data,error}=await client.rpc("admin_list_students");
  const list=$("#portal-approval-list");
  if(!list)return;
  if(error){$("#portal-approval-count").textContent="승인 요청을 불러오지 못했습니다.";return;}
  const pending=(data||[]).filter(member=>member.approval_status==="pending");
  const count=$("#portal-approval-count");
  let remaining=pending.length;
  const redraw=()=>{
    count.textContent=remaining?"승인 대기 "+remaining+"명":"현재 승인 대기 중인 가입 요청이 없습니다.";
    if(!remaining){
      const empty=document.createElement("p");
      empty.className="portal-approval-empty";
      empty.textContent="새로운 가입 신청이 들어오면 이곳에 표시됩니다.";
      list.replaceChildren(empty);
    }
  };
  for(const member of pending){
    const item=document.createElement("article");item.className="portal-approval-item";
    const top=document.createElement("div");top.className="portal-approval-item-header";
    const title=document.createElement("h2");title.textContent=member.full_name||"이름 미등록";
    const badge=document.createElement("span");badge.className="portal-approval-badge";
    badge.textContent=member.signup_type==="alumni"?"졸업생":"재학생";
    top.append(title,badge);
    const details=document.createElement("div");details.className="portal-approval-meta";
    const id=document.createElement("span");id.textContent=member.signup_type==="alumni"?
      "졸업년도 · "+(member.graduation_year||"-")+"년":"학번 · "+(member.student_no||"-");
    const email=document.createElement("span");email.textContent=member.email||"";
    const date=document.createElement("span");
    date.textContent="신청일 · "+(member.created_at?new Date(member.created_at).toLocaleDateString("ko-KR"):"-");
    details.append(id,email,date);
    const actions=document.createElement("div");actions.className="portal-approval-buttons";
    const approve=document.createElement("button");approve.type="button";approve.className="portal-approval-accept";
    approve.textContent="승인 및 이메일 발송";
    const reject=document.createElement("button");reject.type="button";reject.className="portal-approval-reject";
    reject.textContent="반려";
    const busy=(value)=>{approve.disabled=value;reject.disabled=value;};
    approve.addEventListener("click",async()=>{
      if(!window.confirm(member.full_name+"님의 가입을 승인하고 알림 메일을 발송하시겠습니까?"))return;
      busy(true);status("승인 및 안내 메일을 처리하고 있습니다.");
      try{
        const result=await approvePortalMember(member);
        item.remove();remaining--;redraw();
        if(result.notificationStatus==="sent")status(member.full_name+"님 승인 완료 · 안내 메일 발송 성공");
        else if(result.notificationStatus==="sending")status(member.full_name+"님 승인 완료 · 메일 발송 처리 중입니다.");
        else{
          status(member.full_name+"님 승인 완료 · 메일 발송 실패 (재시도 가능)");
          const retry=$("#portal-approval-retry");retry.hidden=false;retry.replaceChildren();
          const message=document.createElement("p");
          message.textContent=member.full_name+"님의 계정은 승인되었지만 메일 발송에 실패했습니다.";
          const button=document.createElement("button");button.type="button";button.textContent="안내 메일 재시도";
          button.addEventListener("click",async()=>{
            button.disabled=true;
            try{
              const sent=await retryApprovalEmail(member);
              if(sent.notificationStatus==="sent"){retry.hidden=true;status("승인 안내 메일이 발송되었습니다.");}
              else{status("메일 발송 처리 중입니다. 잠시 후 확인해 주세요.");button.disabled=false;}
            }catch{status("메일 재시도에 실패했습니다.");button.disabled=false;}
          });
          retry.append(message,button);
        }
      }catch{status("승인에 실패했습니다. 관리자 권한과 네트워크 상태를 확인해 주세요.");busy(false);}
    });
    reject.addEventListener("click",async()=>{
      if(!window.confirm(member.full_name+"님의 가입 신청을 반려하시겠습니까?"))return;
      busy(true);
      const {error:rejectError}=await client.rpc("admin_update_student",{
        p_target_user_id:member.user_id,p_approval_status:"rejected",
        p_enrollment_status:member.enrollment_status
      });
      if(rejectError){status("반려 처리에 실패했습니다.");busy(false);return;}
      item.remove();remaining--;redraw();status(member.full_name+"님의 가입 요청을 반려했습니다.");
    });
    actions.append(approve,reject);item.append(top,details,actions);list.append(item);
  }
  redraw();
}

async function renderAdmin(){
  if(!isAdmin){renderAccount();return;}
  card("학생 계정 관리",
    '<p class="portal-auth-lead">승인 대기 신청은 별도의 ‘가입 승인 요청’에서 관리합니다. 이곳에서는 기존 회원의 가입 상태와 학적을 관리합니다. 주간 학습 메일은 승인된 재학생에게만 발송합니다.</p>'+
    '<div class="portal-admin-toolbar">'+
      '<label>학생 검색<input id="portal-admin-search" type="search" placeholder="이름 · 학번 · 이메일" autocomplete="off"></label>'+
      '<label>학적 상태<select id="portal-admin-filter"><option value="all">전체 학생</option><option value="enrolled">재학</option><option value="leave">휴학</option><option value="withdrawn">자퇴</option><option value="graduated">졸업</option></select></label>'+
    '</div>'+
    '<p class="portal-admin-summary" id="portal-admin-summary" aria-live="polite"></p>'+
    '<div class="portal-admin-scroll"><table class="portal-admin-table"><thead><tr><th>이름</th><th>가입 유형</th><th>학번 / 졸업년도</th><th>이메일</th><th>가입 상태</th><th>학적</th><th>주간 메일</th><th>변경</th></tr></thead><tbody id="portal-student-list"></tbody></table></div>'+
    '<p class="portal-auth-note">졸업생·휴학생·자퇴생은 주간 메일 대상이 아닙니다. 실제 발송은 이메일 인증과 전체 발송 스위치에 따릅니다. 자퇴생의 영구 삭제는 학적 저장 후 별도로 진행합니다.</p>'+
    '<div class="portal-auth-actions"><button type="button" id="portal-admin-close">닫기</button></div>');
  $("#portal-admin-close").addEventListener("click",renderAccount);
  const {data,error}=await client.rpc("admin_list_students");
  if(error){status("학생 목록을 불러오지 못했습니다. 관리자 권한을 확인해 주세요.");return;}
  const body=$("#portal-student-list");
  const options=(items,value)=>{
    const select=document.createElement("select");
    for(const [v,label] of items){const option=document.createElement("option");option.value=v;option.textContent=label;select.append(option);}
    select.value=value;return select;
  };
  const rows=[];
  for(const member of (data||[]).filter(member=>member.approval_status!=="pending")){
    const tr=document.createElement("tr");
    tr.className="portal-admin-member-row";
    const identity=[member.full_name,member.signup_type==="alumni"?"졸업생":"재학생",
       member.signup_type==="alumni"?member.graduation_year+"년 졸업":member.student_no||"-",member.email];
    identity.forEach((item,index)=>{
      const td=document.createElement("td");td.textContent=item;
      td.dataset.label=["이름","가입 유형","학번 / 졸업년도","이메일"][index];tr.append(td);
    });
    const approval=options([["approved","승인"],["rejected","반려"],["suspended","정지"]],member.approval_status);
    const enrollment=options([["enrolled","재학"],["leave","휴학"],["withdrawn","자퇴"],["graduated","졸업"]],member.enrollment_status);
    if(member.signup_type==="alumni"){enrollment.value="graduated";enrollment.disabled=true;enrollment.title="졸업생의 학적은 졸업으로 유지됩니다.";}
    approval.setAttribute("aria-label",member.full_name+" 가입 상태");
    enrollment.setAttribute("aria-label",member.full_name+" 학적");
    for(const [select,label] of [[approval,"가입 상태"],[enrollment,"학적"]]){
      const td=document.createElement("td");td.dataset.label=label;td.append(select);tr.append(td);
    }
    const mailTd=document.createElement("td");mailTd.dataset.label="주간 메일";
    const mailStatus=document.createElement("span");mailStatus.className="portal-admin-mail-status";
    const updateMailStatus=()=>{
      const graduated=member.signup_type==="alumni"||enrollment.value==="graduated";
      // No weekly mail controls for alumni, including graduates who originally signed up as students.
      mailTd.hidden=graduated;
      const eligible=approval.value==="approved"&&enrollment.value==="enrolled"&&member.signup_type!=="alumni";
      const unsaved=approval.value!==member.approval_status||enrollment.value!==member.enrollment_status;
      mailStatus.textContent=(eligible?"발송 후보":"발송 제외")+(unsaved?" · 저장 전":"");
      mailStatus.dataset.eligible=String(eligible);
    };
    approval.addEventListener("change",updateMailStatus);
    enrollment.addEventListener("change",updateMailStatus);
    updateMailStatus();
    mailTd.append(mailStatus);tr.append(mailTd);
    const td=document.createElement("td");td.dataset.label="변경";
    const save=document.createElement("button");save.type="button";save.textContent="저장";
    save.setAttribute("aria-label",member.full_name+" 계정 상태 저장");
    save.addEventListener("click",async()=>{
      if(!window.confirm(member.full_name+" 학생의 계정 상태를 변경하시겠습니까?"))return;
      save.disabled=true;
      try{
        let result=null;
        if(approval.value==="approved"&&member.approval_status!=="approved")
          result=await approvePortalMember(member,enrollment.value);
        else{
          const {error}=await client.rpc("admin_update_student",{
            p_target_user_id:member.user_id,p_approval_status:approval.value,p_enrollment_status:enrollment.value
          });
          if(error)throw error;
        }
        member.approval_status=approval.value;
        member.enrollment_status=enrollment.value;
        updateMailStatus();syncDeleteButton();updateResults();
        if(result?.notificationStatus==="failed"){
          retryMail.hidden=false;
          status("계정 승인은 완료되었으나 메일 발송에 실패했습니다. ‘메일 재시도’를 선택하세요.");
        }else if(result?.notificationStatus==="sending"){
          status(member.full_name+"님의 계정 승인 완료 · 메일 발송 중");
        }else if(result?.notificationStatus==="sent"){
          retryMail.hidden=true;status(member.full_name+"님의 계정 승인 및 안내 메일 발송 완료");
        }else status(member.full_name+"님의 계정·학적 상태를 저장했습니다.");
      }catch{status("저장 실패: 관리자 권한과 입력값을 확인해 주세요.");}
      finally{save.disabled=false;}
    });
    const actions=document.createElement("div");actions.className="portal-admin-row-actions";
    const deleteButton=document.createElement("button");
    deleteButton.type="button";deleteButton.className="portal-admin-delete-button";
    deleteButton.textContent="영구 삭제";
    deleteButton.setAttribute("aria-label",member.full_name+" 계정과 연결 데이터 영구 삭제");
    const syncDeleteButton=()=>{
      deleteButton.hidden=member.enrollment_status!=="withdrawn"||member.signup_type==="alumni";
      deleteButton.disabled=enrollment.value!==member.enrollment_status;
    };
    enrollment.addEventListener("change",syncDeleteButton);
    deleteButton.addEventListener("click",()=>renderWithdrawnDeletion(member));
    const retryMail=document.createElement("button");
    retryMail.type="button";retryMail.className="portal-admin-retry-mail";
    retryMail.textContent="메일 재시도";retryMail.hidden=true;
    retryMail.addEventListener("click",async()=>{
      retryMail.disabled=true;
      try{
        const result=await retryApprovalEmail(member);
        if(result.notificationStatus==="sent"){retryMail.hidden=true;status(member.full_name+"님의 승인 안내 메일 발송 완료");}
        else status("메일 처리 중입니다. 잠시 후 확인해 주세요.");
      }catch{status("메일 재시도에 실패했습니다.");}
      retryMail.disabled=false;
    });
    actions.append(save,retryMail,deleteButton);td.append(actions);tr.append(td);body.append(tr);
    rows.push({member,tr,searchText:identity.join(" ").toLowerCase(),retryMail});
    syncDeleteButton();
  }
  const updateResults=()=>{
    const term=String($("#portal-admin-search").value||"").trim().toLowerCase();
    const filter=$("#portal-admin-filter").value;
    let visible=0;
    for(const {member,tr,searchText} of rows){
      const show=(filter==="all"||member.enrollment_status===filter)&&searchText.includes(term);
      tr.hidden=!show;if(show)visible++;
    }
    const tally={enrolled:0,leave:0,withdrawn:0,graduated:0};
    for(const {member} of rows)if(member.enrollment_status in tally)tally[member.enrollment_status]++;
    $("#portal-admin-summary").textContent=
      "재학 "+tally.enrolled+"명 · 휴학 "+tally.leave+"명 · 자퇴 "+tally.withdrawn+"명 · 졸업 "+tally.graduated+"명 · 표시 "+visible+"명";
  };
  $("#portal-admin-search").addEventListener("input",updateResults);
  $("#portal-admin-filter").addEventListener("change",updateResults);
  updateResults();
  const {data:mailRecords,error:mailError}=await client.functions.invoke("approve-portal-signup",{
    body:{action:"email_statuses"}
  });
  if(!mailError&&mailRecords?.notifications&&$("#portal-student-list")===body){
    const failed=new Set(mailRecords.notifications.filter(n=>n.delivery_status==="failed").map(n=>n.user_id));
    for(const row of rows)if(row.member.approval_status==="approved"&&failed.has(row.member.user_id))
      row.retryMail.hidden=false;
  }
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
