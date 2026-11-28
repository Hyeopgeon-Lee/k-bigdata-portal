/* Approved super-admin account and membership management.
 * Only loaded by guarded admin pages; all mutations are server authorized. */
const client=window.portalSupabaseClient;
if(window.portalAdminAllowed!==true||!client)throw Error("ADMIN_SESSION_REQUIRED");
const root=document.getElementById("admin-accounts-workspace");
const isAdmin=true;
const $=selector=>root.querySelector(selector);
const status=message=>{const node=$("#portal-auth-status");if(node)node.textContent=message;};
function card(title,inner){
 root.innerHTML='<div class="portal-auth-card admin-inline-card" role="region" aria-labelledby="portal-auth-title">'+
 '<h2 id="portal-auth-title"></h2>'+inner+
 '<p id="portal-auth-status" role="status" aria-live="polite"></p></div>';
 $("#portal-auth-title").textContent=title;
}
function renderAccount(){location.href="index.html";}
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
    const listUrl=new URL(location.href);listUrl.searchParams.delete("user");history.replaceState(null,"",listUrl);
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
    '<section class="signup-admin-mail-settings" aria-labelledby="signup-admin-mail-title">'+
      '<div class="signup-admin-mail-copy"><strong id="signup-admin-mail-title">신규 가입 관리자 알림 메일</strong>'+
      '<p>이메일 인증 완료 후 승인 대기자가 등록되면 관리자에게 메일을 보냅니다.</p>'+
      '<small>수신: hglee67@kopo.ac.kr</small><small id="signup-admin-mail-status" role="status">발송 설정 확인 중…</small></div>'+
      '<label class="signup-admin-mail-control" for="signup-admin-mail-toggle">'+
        '<input type="checkbox" id="signup-admin-mail-toggle" role="switch" disabled aria-label="신규 가입 관리자 알림 메일 발송">'+
        '<span class="signup-admin-mail-track" aria-hidden="true"></span>'+
        '<span id="signup-admin-mail-state">확인 중</span>'+
      '</label></section>'+
    '<p id="portal-approval-count" class="portal-approval-count" role="status">승인 대기 목록 확인 중…</p>'+
    '<div id="portal-approval-list" class="portal-approval-list" aria-label="가입 승인 대기 목록"></div>'+
    '<div id="portal-approval-retry" class="portal-approval-retry" hidden></div>'+
    '<div class="portal-auth-actions"><button id="portal-approval-back" type="button">내 계정으로 돌아가기</button></div>');
  $(".portal-auth-card").classList.add("portal-requests-card");
  $("#portal-approval-back").addEventListener("click",renderAccount);
  // Read/write this global delivery switch only through the super-admin-gated Edge API.
  const mailToggle=$("#signup-admin-mail-toggle");
  const mailStatus=$("#signup-admin-mail-status");
  const mailState=$("#signup-admin-mail-state");
  const displayMailSetting=(enabled)=>{
    mailToggle.checked=enabled;mailState.textContent=enabled?"ON":"OFF";
    mailStatus.textContent=enabled?"신규 가입 승인 요청 메일을 발송합니다.":"발송 중지 중 · 관리자 승인 및 학생 안내 메일은 정상 작동합니다.";
  };
  const {data:mailSettings,error:mailSettingError}=await client.functions.invoke("notify-signup-admin",{
    body:{action:"settings"}
  });
  if(mailSettingError||!mailSettings?.ok){
    mailStatus.textContent="알림 설정을 읽지 못했습니다. 페이지를 새로고침해 주세요.";
    mailState.textContent="확인 실패";
  }else{
    displayMailSetting(mailSettings.enabled===true);
    mailToggle.disabled=false;
  }
  mailToggle.addEventListener("change",async()=>{
    const desired=mailToggle.checked;
    mailToggle.disabled=true;mailState.textContent="저장 중";
    mailStatus.textContent="알림 설정을 저장하고 있습니다.";
    try{
      const {data:result,error:saveError}=await client.functions.invoke("notify-signup-admin",{
        body:{action:"set_settings",enabled:desired}
      });
      if(saveError||!result?.ok)throw saveError||Error("MAIL_SETTING_SAVE_FAILED");
      displayMailSetting(result.enabled===true);
    }catch{
      displayMailSetting(!desired);
      mailStatus.textContent="설정을 저장하지 못했습니다. 다시 시도해 주세요.";
    }finally{mailToggle.disabled=false;}
  });
  const {data,error}=await client.rpc("admin_pending_signup_requests");
  const list=$("#portal-approval-list");
  if(!list)return;
  if(error){$("#portal-approval-count").textContent="승인 요청을 불러오지 못했습니다.";return;}
  const pending=(data||[]).filter(member=>member.approval_status==="pending");
  // Links in admin notification emails focus the exact signup request;
  // the link itself can never approve a member without this page's admin session.
  const mailTarget=new URLSearchParams(location.search).get("approve");
  const targetUserId=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mailTarget||"")?mailTarget:null;
  let targetItem=null;
  const count=$("#portal-approval-count");
  const ui=window.portalAdminUI;
  const summary=document.createElement("div");summary.className="admin-chart-mount";count.before(summary);
  let remaining=pending.length;
  const redraw=()=>{
    const grade=ui.getGrade(),items=[...list.querySelectorAll(".portal-approval-item")];
    const selected=items.filter(item=>!grade||item.dataset.grade===grade);
    for(const item of items)item.hidden=!selected.includes(item);
    count.textContent=ui.gradeLabel(grade)+" · 승인 대기 "+selected.length+"명";
    list.querySelector(".portal-approval-empty")?.remove();
    if(!selected.length){
      const empty=document.createElement("p");empty.className="portal-approval-empty";
      empty.textContent="선택한 학년에 가입 승인 요청이 없습니다.";list.append(empty);
    }
    ui.renderBars(summary,"가입 승인 대기 · 전체 학년 비교",[
      ["1학년",items.filter(x=>x.dataset.grade==="1").length],
      ["2학년",items.filter(x=>x.dataset.grade==="2").length],
      ["기타·학년 미설정",items.filter(x=>!["1","2"].includes(x.dataset.grade)).length]
    ],{unit:"명",caption:"승인 대기 목록 기준"});
  };
  ui.onGrade(redraw);
  for(const member of pending){
    const item=document.createElement("article");item.className="portal-approval-item";item.dataset.grade=member.signup_type==="student"?String(member.academic_year||""):"";
    const top=document.createElement("div");top.className="portal-approval-item-header";
    const title=document.createElement("h2");title.textContent=member.full_name||"이름 미등록";
    const badge=document.createElement("span");badge.className="portal-approval-badge";
    badge.textContent=member.signup_type==="alumni"?"졸업생":member.academic_year?member.academic_year+"학년":"학년 미설정";
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
    approve.textContent=member.user_id===targetUserId?"이 회원 가입 승인하기":"승인 및 이메일 발송";
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
    if(member.user_id===targetUserId)targetItem=item;
  }
  redraw();
  if(targetUserId){
    if(targetItem){
      if(targetItem.hidden)ui.setGrade(targetItem.dataset.grade);
      targetItem.classList.add("portal-approval-target");
      targetItem.setAttribute("aria-label","메일에서 선택한 가입 신청");
      list.prepend(targetItem);
      const targetButton=targetItem.querySelector(".portal-approval-accept");
      targetButton?.focus({preventScroll:true});
      targetItem.scrollIntoView({block:"center",behavior:"smooth"});
    }else{
      const lookup=await client.rpc("admin_user_detail",{p_user_id:targetUserId,p_tab:"profile"});
      const already=lookup.data?.profile;
      const message=document.createElement("p");
      message.className="portal-approval-link-notice";
      message.textContent=already?.approval_status==="approved"
        ?"메일에서 선택한 회원은 이미 승인되었습니다."
        :already?.approval_status==="rejected"
          ?"메일에서 선택한 가입 요청은 반려 처리되었습니다."
          :"해당 승인 대기 요청을 찾을 수 없습니다.";
      list.prepend(message);
    }
  }
}

// The unified directory keeps the existing approval and explicit permanent-deletion flows.
async function renderAdmin(){
  await import("./unified-users.mjs?v=20261128-ready-1").then(mod=>mod.renderUnifiedUsers({
    client,root,card,status,renderAccount,approvePortalMember,retryApprovalEmail,renderWithdrawnDeletion
  }));
}

if(new URLSearchParams(location.search).get("view")==="approvals")await renderApprovalRequests();
else await renderAdmin();
