const labels={enrolled:"재학",leave:"휴학",withdrawn:"자퇴",graduated:"졸업",early_employment:"조기취업",approved:"승인",pending:"대기",rejected:"반려",suspended:"정지",student:"학생 가입",alumni:"졸업생 가입",cancelled:"취소",completed:"완료",active:"진행 중",needs_review:"검토 필요",correct:"정답",incorrect:"오답",timeout:"시간 초과",ungraded:"미채점",written:"필기합격",final:"최종합격",verified:"확인완료",preparing:"준비 중",applied:"지원",interview:"면접",offer:"합격",employed:"취업",1:"1학년",2:"2학년",coding_java:"Java",coding_c:"C",coding_python:"Python",coding_ubuntu:"Ubuntu",practical:"정보처리 실기",written_engineer:"정보처리기사 필기",written_industrial:"정보처리산업기사 필기",technical_interview:"기술면접",interview:"기술면접",ncp:"NCP"};
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const val=v=>esc(v??"-")||"-";
const label=v=>val(labels[v]||v);
const date=v=>v?new Date(v).toLocaleDateString("ko-KR",{timeZone:"Asia/Seoul"}):"-";
const datetime=v=>v?new Date(v).toLocaleString("ko-KR",{timeZone:"Asia/Seoul"}):"-";
const int=v=>Number(v||0).toLocaleString("ko-KR");
const kstToday=()=>new Date().toLocaleDateString("sv-SE",{timeZone:"Asia/Seoul"});
const options=(list,selected)=>list.map(([v,t])=>'<option value="'+esc(v)+'"'+(String(v)===String(selected)?" selected":"")+'>'+esc(t)+'</option>').join("");
const statusList=[["all","전체 학적"],["enrolled","재학"],["leave","휴학"],["early_employment","조기취업"],["graduated","졸업"],["withdrawn","자퇴"]];
const approvalList=[["all","전체 가입 상태"],["approved","승인"],["pending","대기"],["rejected","반려"],["suspended","정지"]];
const attentionList=[["all","전체"],["academic","학적 변경 요청"],["mail_failed","승인메일 실패"],["no_plan","이번 주 자율학습 계획 미등록"],["inactive","최근 7일 기록된 학습 없음"],["mock_failed","모의고사 불합격 기록"],["no_cert","확인된 최종합격 자격증 없음"],["no_application","2학년 입사지원 기록 미등록"],["followup","상담 후속 조치 기한 도래"]];
const careerList=[["","미입력"],["preparing","준비 중"],["applied","지원 중"],["interview","면접"],["offer","합격"],["employed","취업"]];
const tabs=[["profile","기본·계정 정보"],["learning","학습현황"],["study","자율학습"],["certifications","자격증"],["guidance","상담·취업지도"],["services","서비스 이용"],["alumni","졸업생"],["history","변경 이력"]];
const table=(heads,rows)=>rows.length?'<div class="users-table-scroll"><table class="users-table"><thead><tr>'+heads.map(x=>'<th scope="col">'+esc(x)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map((v,i)=>'<td data-label="'+esc(heads[i])+'"><div class="admin-cell-value">'+v+'</div></td>').join("")+'</tr>').join("")+'</tbody></table></div>':'<p class="users-empty">등록된 기록이 없습니다.</p>';
const field=(name,title,value,type="text",extra="")=>'<label>'+esc(title)+'<input name="'+esc(name)+'" type="'+esc(type)+'" value="'+esc(value??"")+'" '+extra+'></label>';
const select=(name,title,items,value,extra="")=>'<label>'+esc(title)+'<select name="'+esc(name)+'" '+extra+'>'+options(items,value)+'</select></label>';
const consent=v=>v==null||String(v).trim()===""?"미설정":/^(true|1|yes|on)$/i.test(String(v))?"동의":"거부";
const roleText=p=>p.enrollment_status==="enrolled"&&p.academic_year?esc(p.academic_year)+"학년":label(p.enrollment_status);
const ui=window.portalAdminUI;
let stopGrade;
let state={status:"enrolled",grade:ui.getGrade(),approval:"all",type:"all",attention:"all",search:"",page:1};
export async function renderUnifiedUsers(ctx){
 const {client,root,card,status,renderAccount,approvePortalMember,retryApprovalEmail,renderWithdrawnDeletion}=ctx;
 const $=s=>root.querySelector(s);
 const query=new URLSearchParams(location.search);
 for(const [name,choices] of [["status",statusList],["attention",attentionList],["approval",approvalList]]){const value=query.get(name);if(choices.some(([v])=>v===value))state[name]=value;}
 const rpc=async(name,args={})=>{const {data,error}=await client.rpc(name,args);if(error)throw error;return data;};
 const notice=(node,message,error=false)=>{if(node){node.textContent=message;node.dataset.error=String(error);}};
 let generation=0, selected=null, listResult=null, debounce, detailTab="profile", days=30;
 stopGrade?.();stopGrade=ui.onGrade(value=>{state.grade=value;state.page=1;if(query.has("grade"))query.set("grade",value);if(!selected)void list();});
 const goList=()=>{selected=null;query.delete("user");history.replaceState(null,"",location.pathname+"?"+query.toString());return list();};
 const searchParam=query.get("user");
 async function list(){
  const ticket=++generation;selected=null;
  card("통합 사용자 관리",'<div class="users-layout"><p class="portal-auth-lead">학생과 졸업생의 계정·학적·학습·자격증·지도 현황을 관리합니다.</p>'+
    '<div id="users-filter-kpis"></div><div id="users-grade-chart"></div><details class="admin-filter-detail"><summary>전체 학적 구성 및 빠른 분류</summary><div id="users-kpis" class="users-kpis" aria-label="전체 학적별 인원"><p>인원 확인 중…</p></div></details>'+
    '<div class="users-actions"><a class="users-link" href="accounts.html?view=approvals">가입 승인 요청</a><a class="users-link" href="alumni.html">졸업생 네트워크 관리</a><button type="button" id="users-stats">운영 통계 보기</button></div>'+
    '<section id="users-stats-panel" hidden></section>'+
    '<div class="admin-main-filter">'+field("search","사용자 검색",state.search,"search",'id="users-search" placeholder="이름 · 학번 · 이메일 · 연락처" autocomplete="off"')+
    select("status","학적 상태",statusList,state.status,'id="users-status"')+'</div><details class="admin-filter-detail"'+(state.approval!=="all"||state.attention!=="all"||state.type!=="all"?' open':'')+'><summary>상세 검색 조건</summary><div class="users-filters">'+
    select("grade","학년",[["","전체 학년"],["1","1학년"],["2","2학년"]],state.grade,'id="users-grade"')+
    select("approval","가입 상태",approvalList,state.approval,'id="users-approval"')+
    select("type","가입 유형",[["all","전체"],["student","학생"],["alumni","졸업생"]],state.type,'id="users-type"')+
    select("attention","관리 대상",attentionList,state.attention,'id="users-attention"')+
    '</div></details><div class="users-list-meta" id="users-meta" aria-live="polite">목록 조회 중…</div><div id="users-table"></div>'+
    '<div class="users-pagination"><button id="users-prev">이전</button><span id="users-page"></span><button id="users-next">다음</button></div>'+
    '<p class="users-note">목록 이메일은 일부 마스킹됩니다. 상세정보는 관리자만 조회할 수 있습니다. 로그인하지 않은 학습은 기록에 포함되지 않으며, 등록된 기록이 없다는 사실만으로 미학습으로 판단하지 않습니다.</p></div>');
  $(".portal-auth-card").classList.add("users-card");
  const filters=["status","grade","approval","type","attention"];
  for(const name of filters)$("#users-"+name).addEventListener("change",e=>{state[name]=e.target.value;state.page=1;if(name==="grade"){ui.setGrade(state.grade);return;}reload();});
  $("#users-search").addEventListener("input",e=>{state.search=e.target.value;state.page=1;clearTimeout(debounce);debounce=setTimeout(()=>reload(),300);});
  $("#users-prev").onclick=()=>{if(state.page>1){state.page--;reload();}};
  $("#users-next").onclick=()=>{if(state.page*25<(listResult?.total||0)){state.page++;reload();}};
  $("#users-kpis").onclick=e=>{const b=e.target.closest("button[data-filter]");if(!b)return;const f=b.dataset.filter;state.status=f.startsWith("grade")?"enrolled":["academic","mail_failed","pending"].includes(f)?"all":f;state.grade=f.startsWith("grade")?f.slice(-1):ui.getGrade();state.attention=["academic","mail_failed"].includes(f)?f:"all";state.approval=f==="pending"?"pending":"all";state.type="all";state.page=1;if(state.grade!==ui.getGrade())ui.setGrade(state.grade);else list();};
  $("#users-table").onclick=e=>{const b=e.target.closest("button[data-user]");if(b){selected=b.dataset.user;detailTab="profile";detail(selected);}};
  $("#users-stats").onclick=async()=>{
   const panel=$("#users-stats-panel");if(!panel.hidden){panel.hidden=true;return;}
   panel.hidden=false;panel.textContent="운영 통계 조회 중…";
   try{
    if(state.grade){
     const args={p_status:"enrolled",p_grade:Number(state.grade),p_type:"student",p_approval:"approved",p_page:1,p_size:1};
     const [cohort,plan,active,cert]=await Promise.all([rpc("admin_user_list",args),...["no_plan","inactive","no_cert"].map(p_attention=>rpc("admin_user_list",{...args,p_attention}))]);
     if(ticket!==generation)return;
     ui.renderBars(panel,ui.gradeLabel(state.grade)+" · 재학생 운영 지표",[
      ["승인된 재학생",cohort.total],["이번 주 계획 등록",cohort.total-plan.total],["최근 7일 학습 기록",cohort.total-active.total],["확인된 최종합격 자격증",cohort.total-cert.total]
     ],{unit:"명",caption:"선택 학년 승인 재학생 기준"});
    }else{
     const x=await rpc("admin_user_statistics");if(ticket!==generation)return;
     ui.renderBars(panel,"전체 학과 운영 지표",[
      ["승인된 재학생",x.enrolled],["이번 주 계획 등록",x.plan],["최근 7일 문제풀이",x.active_learning],["확인된 자격증 취득 학생",x.certified],["조기취업 상태",x.early],["동문 등록",x.alumni_registered],["가입 승인 대기",x.pending],["승인메일 실패",x.mail_failed]
     ],{unit:"명",caption:"학습·계획·자격증 지표는 승인된 재학생 기준입니다."});
    }
   }catch{panel.textContent="운영 통계를 불러오지 못했습니다.";}
  };
  let sequence=0;
  async function reload(){
   const run=++sequence;const meta=$("#users-meta");if(!meta)return;
   meta.textContent="목록 조회 중…";$("#users-prev").disabled=$("#users-next").disabled=true;
   try{
    const result=await rpc("admin_user_list",{p_search:state.search.trim(),p_status:state.status,p_grade:state.grade?Number(state.grade):null,p_approval:state.approval,p_type:state.type,p_attention:state.attention,p_page:state.page,p_size:25});
    if(ticket!==generation||run!==sequence)return;
    listResult=result;const c=result.counts||{};
    const kpis=[["grade1","1학년",c.grade1],["grade2","2학년",c.grade2],["early_employment","조기취업",c.early_employment],["leave","휴학",c.leave],["graduated","졸업",c.graduated],["withdrawn","자퇴",c.withdrawn],["pending","승인 대기",c.pending],["academic","학적 요청",c.requests],["mail_failed","메일 실패",c.mail_failed]];
    $("#users-kpis").innerHTML=kpis.map(([f,n,v])=>'<button class="users-kpi" type="button" data-filter="'+f+'"><small>'+n+'</small><strong>'+int(v)+'명</strong></button>').join("");
    ui.renderDonut($("#users-grade-chart"),"전체 재학 계정 학년 비교",[["1학년",c.grade1??0],["2학년",c.grade2??0]],{caption:"현재 검색과 별개인 전체 재학 계정"});
    ui.renderKPIs($("#users-filter-kpis"),[[ui.gradeLabel(state.grade)+" · 검색 결과",result.total,"명"]]);
    const total=Number(result.total||0),pages=Math.max(1,Math.ceil(total/25));
    if(state.page>pages){state.page=pages;return reload();}
    meta.textContent=ui.gradeLabel(state.grade)+" · 검색 결과 "+int(total)+"명 · 전체 등록 "+int(c.all)+"명";
    $("#users-table").innerHTML=table(["이름","학번 / 졸업년도","학적","가입 상태","이메일","학적 요청 / 메일","상세"],(result.rows||[]).map(p=>[
     '<strong>'+val(p.full_name)+'</strong><small class="users-sub">'+label(p.signup_type)+'</small>',
     val(p.student_no|| (p.graduation_year?p.graduation_year+"년":"-")),roleText(p),'<span class="users-pill">'+label(p.approval_status)+'</span>',val(p.email_mask),
     p.pending_academic?'<span class="users-warn">학적 요청</span>':p.mail_status==="failed"?'<span class="users-warn">메일 실패</span>':p.signup_type==="student"&&p.enrollment_status==="enrolled"&&p.approval_status==="approved"?(p.weekly_opt_in?"주간메일 후보":"주간메일 제외"):"주간메일 대상 아님",
     '<button class="users-detail-btn" type="button" data-user="'+esc(p.user_id)+'">상세보기</button>'
    ]));
    $("#users-page").textContent=state.page+" / "+pages;$("#users-prev").disabled=state.page<=1;$("#users-next").disabled=state.page>=pages;
   }catch(e){if(ticket!==generation||run!==sequence)return;meta.textContent="사용자 목록을 불러오지 못했습니다. 다시 시도해 주세요.";$("#users-table").innerHTML='<button type="button" id="users-retry">다시 조회</button>';$("#users-retry").onclick=reload;}
  }
  await reload();
 }
 async function detail(id){
  const ticket=++generation;selected=id;query.set("view","students");query.set("user",id);history.replaceState(null,"",location.pathname+"?"+query.toString());
  card("사용자 상세 관리",'<div class="users-layout"><div class="users-actions"><button id="users-back">← 사용자 목록</button><a class="users-link" href="accounts.html?view=approvals">가입 승인 요청</a></div><div id="user-heading" class="users-detail-header">사용자 조회 중…</div><nav class="users-tabs" aria-label="사용자 관리 탭">'+tabs.map(([v,t])=>'<button type="button" data-tab="'+v+'" aria-pressed="'+(v===detailTab)+'">'+t+'</button>').join("")+'</nav><div id="user-detail-panel" aria-live="polite"></div></div>');
  $(".portal-auth-card").classList.add("users-card");
  $("#users-back").onclick=goList;
  $(".users-tabs").onclick=e=>{const b=e.target.closest("button[data-tab]");if(!b)return;detailTab=b.dataset.tab;for(const x of $(".users-tabs").querySelectorAll("button"))x.setAttribute("aria-pressed",String(x===b));loadTab();};
  let profileData=null,tabSequence=0;
  try{profileData=await rpc("admin_user_detail",{p_user_id:id,p_tab:"profile"});if(ticket!==generation)return;
   const p=profileData.profile;
   $("#user-heading").innerHTML='<div><strong>'+val(p.full_name)+'</strong><p>'+roleText(p)+' · '+label(p.signup_type)+' · '+val(p.student_no||p.graduation_year)+'</p></div><span class="users-pill">'+label(p.approval_status)+'</span>';
   await loadTab();
  }catch{if(ticket===generation)$("#user-detail-panel").textContent="사용자 정보를 불러오지 못했습니다.";}
  async function loadTab(){
   const run=++tabSequence,tab=detailTab,panel=$("#user-detail-panel");if(!panel)return;
   panel.textContent="정보 조회 중…";
   try{
    const x=tab==="profile"?profileData:await rpc("admin_user_detail",{p_user_id:id,p_tab:tab,p_days:days});
    if(ticket!==generation||run!==tabSequence)return;
    const p=profileData.profile;
    if(tab==="profile")renderProfile(panel,p,x);
    else if(tab==="learning")renderLearning(panel,x);
    else if(tab==="study")renderStudy(panel,x);
    else if(tab==="certifications")panel.innerHTML='<h3>등록 자격증</h3>'+table(["자격증","취득 상태","확인 상태","필기일","최종일"],x.items.map(c=>[val(c.certificate_name),label(c.pass_status),label(c.verification_status),date(c.written_pass_date),date(c.final_pass_date)]))+'<a class="users-link" href="certifications.html">전체 자격증 확인·승인 관리 ↗</a>';
    else if(tab==="services")panel.innerHTML='<h3>프로젝트실 예약</h3>'+table(["회의실","시작","종료","목적","상태"],x.rooms.map(r=>[val(r.room_code),datetime(r.starts_at),datetime(r.ends_at),val(r.purpose),label(r.status)]))+'<a class="users-link" href="rooms.html">전체 예약 관리 ↗</a><h3>학과 요청</h3>'+table(["제목","분류","상태","수정일"],x.requests.map(r=>[val(r.title),val(r.category),label(r.status),datetime(r.updated_at)]))+'<a class="users-link" href="help.html">학과 요청 관리 ↗</a>';
    else if(tab==="guidance")renderGuidance(panel,x);
    else if(tab==="alumni")renderAlumni(panel,x);
    else if(tab==="history")panel.innerHTML='<h3>학적 변경 이력</h3>'+table(["변경일","이전 학적","변경 학적"],x.academic.map(r=>[datetime(r.changed_at),label(r.old_enrollment_status)+" · "+label(r.old_academic_year),label(r.new_enrollment_status)+" · "+label(r.new_academic_year)]))+'<h3>관리자 변경 이력</h3>'+table(["변경일","이전","변경"],x.audit.map(r=>[datetime(r.created_at),val(r.old_status),val(r.new_status)]))+'<h3>학적 변경 요청</h3>'+table(["요청일","요청 상태","사유","처리","처리일","관리자 의견"],x.requests.map(r=>[datetime(r.requested_at),label(r.requested_status),val(r.reason),label(r.state),datetime(r.decided_at),val(r.decision_note)]));
   }catch(e){if(ticket!==generation||run!==tabSequence)return;panel.textContent="탭의 데이터를 불러오지 못했습니다. 다시 선택하여 시도하세요.";}
  }
  async function doAction(button,action,success){button.disabled=true;notice($("#user-action-status"),"처리 중…");try{await action();if(ticket!==generation)return;await detail(id);const n=$("#user-action-status");if(n)notice(n,success);}catch(e){notice($("#user-action-status"),"저장하지 못했습니다. 입력값과 계정 상태를 확인하세요.",true);button.disabled=false;}}
  function renderProfile(panel,p,x){
   const student=p.signup_type==="student",locked=x.deletion&&["running","failed"].includes(x.deletion.state);
   const r=x.academic_request;
   panel.innerHTML='<h3>기본 정보</h3><form id="user-profile-form" class="users-form">'+
    field("name","이름",p.full_name,"text","required minlength=2 maxlength=80")+
    field("student_no","학번",p.student_no,"text",student?"maxlength=30":"disabled")+
    select("grade","학년",[["","미설정"],["1","1학년"],["2","2학년"]],p.academic_year,student?"":"disabled")+
    field("phone","휴대전화",p.mobile_phone,"tel","maxlength=20")+
    field("email","로그인 이메일",p.email,"email","readonly")+
    field("joined","가입일",date(p.created_at),"text","readonly")+
    field("last_login","최근 인증 로그인",datetime(x.last_sign_in_at),"text","readonly")+
    field("graduation","졸업년도",p.graduation_year,"text","readonly")+
    (student?'<label class="users-check"><input name="weekly" type="checkbox" '+(x.weekly_opt_in===true?"checked":"")+'> 주간 학습 메일 수신 설정 (현재 학적이 재학·승인 상태여야 발송 대상입니다)</label>':'')+
    '<p class="users-note users-wide">로그인 이메일은 인증 계정과 연결되므로 여기서 직접 변경하지 않습니다. 학번 변경 시 기존 사용자 ID를 유지합니다.</p><button type="submit" '+(locked?"disabled":"")+'>기본 정보 저장</button></form>'+
    '<h3>계정 및 학적 상태</h3><form id="user-status-form" class="users-form">'+
    select("approval","가입 상태",approvalList.filter(([v])=>v!=="all"),p.approval_status)+
    select("enrollment","학적",statusList.filter(([v])=>v!=="all"),p.enrollment_status,student?"":"disabled")+
    '<p class="users-note users-wide">졸업·조기취업·휴학 등으로 변경되면 재학생 전용 학습 및 메일 대상이 변경됩니다. 기존 기록은 유지됩니다.</p><button type="submit" '+(locked?"disabled":"")+'>학적 · 계정 상태 저장</button></form>'+
    (x.mail_status==="failed"?'<button type="button" id="user-retry-mail">가입 승인 메일 재시도</button>':'')+
    (r?.state==="pending"?'<section class="users-request"><h3>학적 변경 요청</h3><p>요청: <strong>'+label(r.requested_status)+'</strong> · '+datetime(r.requested_at)+'</p><p>사유: '+val(r.reason)+'</p><label>관리자 의견<input id="user-request-note" maxlength="500"></label><div class="users-actions"><button id="user-request-approve">승인</button><button id="user-request-reject" class="users-secondary">반려</button></div></section>':r?'<p class="users-note">최근 학적 변경 요청: '+label(r.requested_status)+' · '+label(r.state)+'</p>':'')+
    (locked?'<p class="users-warn">영구삭제 작업 '+label(x.deletion.state)+' · '+val(x.deletion.step)+' · '+val(x.deletion.error_code)+'</p>':'')+
    (student&&p.enrollment_status==="withdrawn"?'<section class="users-danger-zone"><h3>자퇴생 계정 정리</h3><p>자퇴 상태는 데이터 보존 상태입니다. 영구 삭제는 보존 의무 및 삭제 대상을 확인한 뒤 별도 실행하세요.</p><button id="user-delete" type="button" class="users-danger">영구 삭제 검토 / 재시도</button></section>':'')+
    '<p id="user-action-status" role="status" class="users-note"></p>';
   $("#user-profile-form").onsubmit=e=>{e.preventDefault();const f=e.currentTarget.elements;if(!confirm("기본 정보를 저장하시겠습니까?"))return;doAction(e.currentTarget.querySelector("button"),()=>rpc("admin_user_edit",{p_user_id:id,p_name:f.name.value,p_student_no:f.student_no.value,p_grade:f.grade.value?Number(f.grade.value):null,p_phone:f.phone.value,p_weekly:student?f.weekly.checked:false}),"기본 정보를 저장했습니다.");};
   $("#user-status-form").onsubmit=e=>{e.preventDefault();const f=e.currentTarget.elements;if(!confirm("이 사용자의 학적 및 계정 상태를 변경하시겠습니까?"))return;
    if(f.approval.value==="approved"&&p.approval_status!=="approved"&&f.enrollment.value==="withdrawn"){notice($("#user-action-status"),"자퇴 상태로는 계정을 재승인할 수 없습니다.",true);return;}
    doAction(e.currentTarget.querySelector("button"),async()=>{
     if(f.approval.value==="approved"&&p.approval_status!=="approved"){const result=await approvePortalMember(p,f.enrollment.value);if(result.notificationStatus==="failed")return;}
     else await rpc("admin_update_student",{p_target_user_id:id,p_approval_status:f.approval.value,p_enrollment_status:f.enrollment.value});
    },"계정 및 학적 상태를 저장했습니다.");
   };
   if($("#user-retry-mail"))$("#user-retry-mail").onclick=e=>doAction(e.currentTarget,()=>retryApprovalEmail(p),"메일 재시도 요청을 처리했습니다. 발송 상태를 확인하세요.");
   for(const [v,approve] of [["approve",true],["reject",false]]){const b=$("#user-request-"+v);if(b)b.onclick=()=>{if(confirm("학적 변경 요청을 "+(approve?"승인":"반려")+"하시겠습니까?"))doAction(b,()=>rpc("admin_decide_academic_request",{p_request_id:r.id,p_approve:approve,p_note:$("#user-request-note").value}),"학적 변경 요청을 처리했습니다.");};}
   if($("#user-delete"))$("#user-delete").onclick=()=>renderWithdrawnDeletion(p);
  }
  function renderLearning(panel,x){
   const attempts=x.summary.reduce((n,r)=>n+Number(r.attempts),0);
   panel.innerHTML='<div class="users-actions">'+select("period","조회 기간",[["7","최근 7일"],["30","최근 30일"],["90","최근 90일"],["365","최근 1년"]],days,'id="users-days"')+'</div><h3>서비스별 학습량 및 정답률</h3><p class="users-note">기간 중 기록된 풀이 '+int(attempts)+'건 · 정답률은 채점된 시도만 계산합니다.</p>'+
   (x.summary?.length?'<div class="users-bars">'+x.summary.map(r=>{const rate=r.graded?Math.round(100*r.correct/r.graded):0;return '<div class="users-bar-row"><div><strong>'+label(r.bank)+'</strong><span>'+int(r.attempts)+'회 · '+(r.graded?rate+"%":"미채점")+'</span></div><div class="users-bar"><span style="width:'+rate+'%"></span></div><small>최근 '+datetime(r.recent)+' · 채점 '+int(r.graded)+'건</small></div>';}).join("")+'</div>':'<p class="users-empty">조회 기간의 학습기록이 없습니다.</p>')+
   '<h3>최근 문제풀이 (최대 30건)</h3>'+table(["일시","서비스","문제 ID","결과"],x.recent.map(r=>[datetime(r.submitted_at),label(r.bank),val(r.question_id),label(r.result)]))+
   '<h3>실전 모의고사 (최대 20건)</h3>'+table(["시험","응시일","평균","결과"],x.mocks.map(r=>[label("written_"+r.exam_type),datetime(r.submitted_at),val(r.result?.average),r.result?.passed===true?"합격":r.result?.passed===false?"불합격":"미확인"]))+
   '<a class="users-link" href="learning.html">학급 학습통계 ↗</a>';
   $("#users-days").onchange=e=>{days=Number(e.target.value);loadTab();};
  }
  function renderStudy(panel,x){
   const plan=x.plan;panel.innerHTML='<div class="users-kpis"><div class="users-kpi"><small>이번 주 완료 학습시간</small><strong>'+((x.seconds||0)/3600).toFixed(1)+'시간</strong></div><div class="users-kpi"><small>이번 주 계획</small><strong>'+(plan?"등록":"미등록")+'</strong></div></div>'+
   '<h3>이번 주 학습계획</h3><p>'+ (plan?('계획: '+val((plan.weekdays||[]).map(d=>({1:"월",2:"화",3:"수",4:"목",5:"금",6:"토",7:"일"})[d]||d).join(", "))+' · '+val(plan.no_plan_reason||"")):"등록된 계획이 없습니다.")+'</p><h3>최근 자율학습 (최대 100건)</h3>'+
   table(["시작","종료","시간(분)","상태"],x.sessions.map(s=>[datetime(s.started_at),datetime(s.ended_at),int(Math.round((s.duration_seconds||0)/60)),label(s.status)]))+'<a class="users-link" href="learning.html">학급 자율학습 통계 ↗</a>';
  }
  function renderGuidance(panel,x){
   const g=x.guidance||{};panel.innerHTML='<h3>학적·취업지도 정보</h3><p class="users-note">관리자가 확인한 상태를 직접 기록합니다. 외부 취업 사이트의 지원 수치와 자동 동기화되지 않습니다.</p><form id="user-guidance-form" class="users-form">'+
    field("return_date","복학 예정일",g.return_date,"date")+field("employment_date","입사일",g.employment_date,"date")+field("expected_graduation_date","졸업 예정일",g.expected_graduation_date,"date")+
    field("employer","기업",g.employer,"text","maxlength=160")+field("job_title","직무",g.job_title,"text","maxlength=160")+
    select("career_stage","취업 준비 단계",careerList,g.career_stage)+field("application_count","확인된 지원 건수",g.application_count,"number","min=0 max=10000")+field("next_interview","다음 면접일",g.next_interview,"date")+field("follow_up","다음 확인일",g.follow_up,"date")+
    '<button type="submit">지도 정보 저장</button></form><div class="users-actions"><a class="users-link" href="ready.html">취업 준비 서비스 ↗</a><a class="users-link" href="https://apply.k-bigdata.kr/" target="_blank" rel="noopener noreferrer">입사지원 서비스 ↗</a></div>'+
    '<h3>상담 및 후속지도</h3><form id="user-note-form" class="users-form">'+field("meeting_date","상담일",kstToday(),"date","required")+field("topic","상담 주제","","text","required maxlength=140")+
    '<label class="users-wide">상담 기록<textarea name="note" maxlength="2000" rows="4" placeholder="학생지도에 필요한 최소 정보만 작성하세요"></textarea></label><label class="users-wide">후속 조치<textarea name="next_action" maxlength="1000" rows="2"></textarea></label>'+field("follow_up","후속 조치 기한","","date")+'<button type="submit">상담 기록 추가</button></form>'+
    table(["상담일","주제","기록","후속 조치","기한","처리"],x.notes.map(n=>[date(n.meeting_date),val(n.topic),val(n.note),val(n.next_action),date(n.follow_up),n.completed_at?"완료":'<button data-note="'+esc(n.id)+'" type="button">완료 처리</button>']))+
    '<p id="user-action-status" role="status" class="users-note"></p>';
   $("#user-guidance-form").onsubmit=e=>{e.preventDefault();doAction(e.currentTarget.querySelector("button"),()=>rpc("admin_user_guidance_save",{p_user_id:id,p_data:Object.fromEntries(new FormData(e.currentTarget))}),"지도 정보를 저장했습니다.");};
   $("#user-note-form").onsubmit=e=>{e.preventDefault();doAction(e.currentTarget.querySelector("button"),()=>rpc("admin_user_note",{p_user_id:id,p_data:Object.fromEntries(new FormData(e.currentTarget))}),"상담 기록을 추가했습니다.");};
   for(const b of panel.querySelectorAll("[data-note]"))b.onclick=()=>doAction(b,()=>rpc("admin_user_note",{p_user_id:id,p_data:{action:"complete",id:b.dataset.note}}),"후속 조치를 완료했습니다.");
  }
  function renderAlumni(panel,x){
   const a=x.alumni;
   panel.innerHTML='<h3>동문 네트워크 정보</h3>'+(a?'<div class="users-data-grid">'+[
    ["졸업연도",a.graduation_year],["취업 상태",a.employment_status],["회사",a.company],["직무",a.job],["기술",a.skills],["멘토링 분야",a.mentoring_topics],["연락 허용",consent(a.contact_allowed)],["채용메일",consent(a.career_mail_enabled)],["동문소식메일",consent(a.alumni_news_mail_enabled)],["프로필 공개",a.is_visible?"공개":"비공개"],["최종 갱신",datetime(a.updated_at)]
   ].map(([n,v])=>'<div><small>'+esc(n)+'</small><strong>'+val(v)+'</strong></div>').join("")+'</div>':'<p class="users-empty">동문 프로필 미등록 · 계정과 학적 변경은 기본정보 탭에서 관리하세요.</p>')+
   '<h3>동문 연락 요청</h3>'+table(["요청자","분야","제목","상태","요청일","발송일"],x.contacts.map(r=>[val(r.requester_name),val(r.category),val(r.subject),val(r.status),datetime(r.created_at),datetime(r.sent_at)]))+'<a class="users-link" href="alumni.html">동문 네트워크 관리 ↗</a>';
  }
 }
 if(searchParam&&/^[0-9a-f-]{36}$/i.test(searchParam))await detail(searchParam);else await list();
}
