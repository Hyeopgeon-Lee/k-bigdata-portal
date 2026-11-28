import {api,esc,fmt,tag,url,table,panel,status,label} from './ready-common.mjs?v=20261128-ready-ui-2';
import {dashboard,classDashboard,historyTimeline} from './ready-student.mjs?v=20261129-ready-dashboard-1';
const root=document.querySelector('#ready-root');
const role=window.portalVerifiedContext;let b,tab='dashboard',busy=false,dirty=false,classCache=null,viewId=0,historyPage=0,checkTimer;
const $=s=>root.querySelector(s);
const field=(key,type='text')=>'<label>'+esc(label(key))+'<input name="'+key+'" type="'+type+'" maxlength="'+(type==='url'?1000:200)+'" value="'+esc(b.student[key]||'')+'" '+(!b.write?'disabled':'')+'></label>';
const choices=(key,options)=>'<label>'+esc(label(key))+'<select name="'+key+'" '+(!b.write?'disabled':'')+'>'+options.map(v=>'<option '+(v===(b.student[key]||'미작성')?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select></label>';
const disabled=()=>!b.write?'disabled':'';
function notionPanel(){
 const n=b.notion_connection||{},saved=!!b.student.notion_url,connected=n.has_connection||['CONNECTED','RECONNECT_REQUIRED'].includes(n.status),labelMap={UNREGISTERED:'포트폴리오 URL 미등록',INVALID_URL:'Notion 페이지 링크 확인 필요',NOT_CONFIGURED:'관리자 설정 대기',AUTH_REQUIRED:'학생 연동 필요',CONNECTED:'연결 완료',RECONNECT_REQUIRED:'권한 갱신 필요'};
 const label=labelMap[n.status]||'연동 정보 확인 필요';
 const allowed=b.write&&saved&&n.configured&&n.status!=='INVALID_URL';
 return '<div class="ready-notion-card"><h3>개인 Notion 포트폴리오 연동</h3><p>'+tag(label)+'</p><p class="ready-muted">마지막 수정: '+esc(b.checks.notion?.last_edited_at?fmt(b.checks.notion.last_edited_at):'미확인')+' · 마지막 점검: '+esc(fmt(b.checks.notion?.checked_at))+'</p><p class="ready-muted">개인 Notion 계정에서 등록한 포트폴리오 페이지를 선택하면 최종 수정일만 자동점검합니다. 페이지 본문을 저장하거나 수정하지 않습니다. 연결을 언제든 해제할 수 있습니다.</p>'+
 '<div class="ready-controls">'+(!saved?'<button id="notion-edit" class="ready-secondary" '+disabled()+'>포트폴리오 링크 입력</button>':'<button id="notion-start" '+(!allowed?'disabled':'')+'>'+(connected?'Notion 다시 연결':'내 Notion 연결하기')+'</button>')+(connected?' <button id="notion-disconnect" class="ready-secondary">연결 해제</button>':'')+'</div></div>';
}
function bindNotion(){
 const edit=$('#notion-edit'),start=$('#notion-start'),disconnect=$('#notion-disconnect');
 if(edit)edit.onclick=()=>go('profile','notion_url');
 if(start)start.onclick=async()=>{if(busy||!b.write||dirty&&!confirm('저장하지 않은 입력 내용이 있습니다. 연결을 진행할까요?'))return;busy=true;start.disabled=true;status('Notion 인증 화면으로 연결하는 중…');try{
  const d=await api('notion_start'),u=new URL(d.authorization_url);
  if(u.protocol!=='https:'||u.hostname!=='api.notion.com'||u.pathname!=='/v1/oauth/authorize')throw Error('인증 주소를 확인할 수 없습니다.');
  location.assign(u.href);
 }catch(e){status(e.message,true);start.disabled=false;busy=false}};
 if(disconnect)disconnect.onclick=async()=>{if(busy||dirty&&!confirm('저장하지 않은 입력 내용이 있습니다. 계속할까요?')||!confirm('포털의 Notion 읽기 권한을 해제할까요?'))return;busy=true;disconnect.disabled=true;try{
  const d=await api('notion_disconnect');await load();status(d.revoked?'연결을 해제했습니다.':'포털 연결을 해제했습니다. Notion 설정에서도 해당 연결을 제거해 주세요.');
 }catch(e){status(e.message,true);render()}finally{busy=false}};
}
async function completeOAuth(){
 let value;
 try{value=sessionStorage.getItem('ready-notion-oauth');sessionStorage.removeItem('ready-notion-oauth')}catch{return;}
 if(!value||!b.write)return;
 const q=JSON.parse(value);tab='dashboard';
 if(q.error){await load();status('Notion 인증이 취소되었습니다. 준비가 되면 다시 연결하세요.',true);return;}
 if(!q.code||!q.state)return;
 status('Notion 연결을 확인하고 있습니다…');
 try{await api('notion_complete',{code:q.code,state:q.state});await load();status('Notion 연결 및 최초 수정일 점검을 완료했습니다.');}
 catch(e){await load();status(e.message,true);}
}
async function load(){b=await api('mine',{history:false});dirty=false;classCache=null;render();status(!b.write?'현재 취업 준비 점검 대상이 아닙니다. 재학생만 점검할 수 있으며 조기취업자·휴학생은 기존 정보를 조회하거나 Notion 연결을 해제할 수 있습니다.':b.registered?'':'처음 이용하시나요? 내 정보를 등록해 주세요.');}
function canCheck(){return !(Date.parse(b.next_manual_check_at||'')>Date.now())}
function go(next,field=''){
 if(busy)return;
 if(dirty&&next!==tab&&!confirm('저장하지 않은 입력 내용이 있습니다. 다른 메뉴로 이동할까요?'))return;
 if(next!==tab){dirty=false;tab=next;historyPage=0;render()}
 if(field){const target=root.querySelector('[name="'+CSS.escape(field)+'"],#'+CSS.escape(field));if(target){target.scrollIntoView({block:'center'});if(target.matches('input,select,button'))target.focus({preventScroll:true})}}
}
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
async function act(action,payload={},message='저장했습니다.'){
 if(busy||!b.write)return;
 if(dirty&&action!=='save_profile'&&!confirm('저장하지 않은 내 정보가 있습니다. 이 작업을 진행할까요?'))return;
 busy=true;
 const controls=[...root.querySelectorAll('button,input,select')].map(x=>[x,x.disabled]);
 controls.forEach(([x])=>x.disabled=true);
 root.setAttribute('aria-busy','true');
 status(action==='manual_check'?'GitHub·포트폴리오 점검 중입니다. 잠시 기다려 주세요.':'처리 중…');
 let committed=false;
 try{
  const r=await api(action,payload);committed=true;dirty=false;await load();
  status(r.message||message+((r.overall_check_status||r.check_status)?' · '+({SUCCESS:'완료',PARTIAL:'부분 완료',FAILED:'점검 실패'}[r.overall_check_status||r.check_status]||r.overall_check_status||r.check_status):''));
 }catch(e){
  status(e.message+(committed?' · 요청은 처리되었으나 최신 화면 조회에 실패했습니다. 다시 불러오세요.':''),true);
 }finally{busy=false;controls.forEach(([x,was])=>{if(x.isConnected)x.disabled=was});root.setAttribute('aria-busy','false')}
}
async function showClass(content,id,force=false){
 content.innerHTML=panel('학급 현황','<p>학년별 통계를 불러오는 중입니다.</p>');
 try{
  let d=classCache?.data;
  if(force||!d||Date.now()-classCache.time>60000){d=await api('class');classCache={data:d,time:Date.now()}}
  if(id!==viewId||tab!=='class')return;
  content.innerHTML='<div class="ready-class-refresh"><button class="ready-secondary" id="ready-refresh-class">통계 새로고침</button></div>'+classDashboard(d,b.member.academic_year);
  $('#ready-refresh-class').onclick=()=>showClass(content,id,true);
 }catch(e){if(id!==viewId)return;content.innerHTML=panel('학급 현황','<p>학급 현황을 불러오지 못했습니다.</p><button id="ready-class-retry">다시 시도</button>');$('#ready-class-retry').onclick=()=>showClass(content,id,true);status(e.message,true)}
}
async function showHistory(content,id){
 content.innerHTML=panel('정보 변경 이력','<p>변경 이력을 불러오는 중입니다.</p>');
 try{
  const data=Array.isArray(b.history)?{history:b.history.slice(historyPage*30,historyPage*30+30),has_more:b.history.length>(historyPage+1)*30}:await api('history',{offset:historyPage*30});
  if(id!==viewId||tab!=='history')return;
  content.innerHTML=panel('정보 변경 이력',historyTimeline(data.history||[])+'<div class="ready-controls"><button class="ready-secondary" id="ready-history-prev" '+(historyPage===0?'disabled':'')+'>이전</button><span>'+ (historyPage+1)+' 페이지</span><button class="ready-secondary" id="ready-history-next" '+(!data.has_more?'disabled':'')+'>다음</button></div>');
  $('#ready-history-prev').onclick=()=>{historyPage--;showHistory(content,id)};$('#ready-history-next').onclick=()=>{historyPage++;showHistory(content,id)};
 }catch(e){if(id!==viewId)return;content.innerHTML=panel('정보 변경 이력','<p>이력을 불러오지 못했습니다.</p><button id="ready-history-retry">다시 시도</button>');$('#ready-history-retry').onclick=()=>showHistory(content,id);status(e.message,true)}
}
function render(){
 root.setAttribute('aria-busy','false');
 clearTimeout(checkTimer);const id=++viewId;
 const tabs=[['dashboard','내 현황'],['profile',b.write?'내 정보 수정':'내 정보 조회'],['class','학급 현황'],['guide','준비 기준'],['history','변경 이력']];
 root.innerHTML='<nav class="ready-tabs" aria-label="취업 준비 메뉴">'+tabs.map(([v,t])=>'<button class="ready-tab" data-tab="'+v+'" aria-pressed="'+(tab===v)+'">'+t+'</button>').join('')+'</nav><div id="ready-content"></div>';
 const content=$('#ready-content');root.querySelectorAll('[data-tab]').forEach(x=>x.onclick=()=>{go(x.dataset.tab)});
 if(tab==='dashboard'){
  content.innerHTML=dashboard(b,notionPanel(),canCheck());bindNotion();
  $('#check-now').onclick=()=>act('manual_check',{},'점검을 완료했습니다.');$('#edit-profile').onclick=()=>go('profile');
  root.querySelectorAll('[data-ready-go]').forEach(x=>x.onclick=()=>go(x.dataset.readyGo,x.dataset.readyField));
  if(b.write&&!canCheck())checkTimer=setTimeout(()=>{if(tab==='dashboard'&&!busy)render()},Math.min(600001,Math.max(500,Date.parse(b.next_manual_check_at)-Date.now()+200)));
 }else if(tab==='profile'){
  content.innerHTML=panel('내 정보 '+(!b.write?'조회':b.registered?'수정':'등록'),'<p>포털 회원: '+esc(b.member.full_name)+' · '+esc(b.member.student_no)+' · '+esc(b.member.academic_year)+'학년</p><form id="profile-form"><h3>희망 직무 · GitHub</h3><div class="ready-form">'+field('career_target')+field('github_url','url')+'</div><h3>포트폴리오 · 기술 블로그</h3><div class="ready-form">'+['github_pages_url','github_pages_repo','notion_url','portfolio_url','blog_url'].map(k=>field(k,'url')).join('')+'</div><h3>입사 서류</h3><div class="ready-form">'+choices('resume_status',['미작성','작성중','1차 완성','최종 완성'])+choices('cover_letter_status',['미작성','작성중','기본본 완성','기업 지원 가능'])+'</div><p><label><input name="peer_share_consent" type="checkbox" '+(b.consent?'checked ':'')+disabled()+'> 학급 현황에 내 이름·준비 상태·활동일·README·포트폴리오 상태를 공개하는 데 동의합니다. 동의하지 않아도 이용할 수 있습니다.</label></p><button '+disabled()+'>저장</button></form>')+
  notionPanel()+panel('Repository 관리 (최대 5개)',b.registered?table(['저장소','대표','순서','관리'],b.repositories.map(r=>[url(r.repo_url),r.is_primary?'대표':'<button data-primary="'+esc(r.repo_id)+'" '+disabled()+'>대표 지정</button>', '<input aria-label="저장소 표시 순서" type="number" min="1" max="99" data-order="'+esc(r.repo_id)+'" value="'+esc(r.display_order)+'" '+disabled()+'>','<button data-reorder="'+esc(r.repo_id)+'" '+disabled()+'>순서 저장</button> <button class="ready-secondary" data-remove="'+esc(r.repo_id)+'" '+disabled()+'>삭제</button>']))+'<form id="repo-form" class="ready-controls"><label>GitHub Repository URL<input required name="repo_url" type="url" placeholder="https://github.com/user/project" '+disabled()+'></label><button '+(!b.write||b.repositories.length>=5?'disabled':'')+'>추가</button></form>':'<p>내 정보를 먼저 저장하세요.</p>')+
  panel('자격증 준비 계획',b.registered?table(['준비 중 자격증','관리'],b.plans.map(x=>[esc(x.certificate_name),'<button class="ready-secondary" data-plan-remove="'+esc(x.id)+'" '+disabled()+'>삭제</button>']))+'<form id="plan-form" class="ready-controls"><label>자격증명<input required name="name" maxlength="120" '+disabled()+'></label><button '+disabled()+'>준비 계획 추가</button></form><p>취득·필기합격·수정·삭제는 <a href="my-certifications.html">포털 나의 자격증</a>에서 관리합니다.</p>':'<p>내 정보를 먼저 저장하세요.</p>');
  bindNotion();
  $('#profile-form').oninput=()=>{dirty=true};
  $('#profile-form').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.peer_share_consent=e.target.elements.peer_share_consent.checked;act('save_profile',{profile:d})};
  if($('#repo-form'))$('#repo-form').onsubmit=e=>{e.preventDefault();act('repo_add',{repo_url:e.target.elements.repo_url.value})};
  root.querySelectorAll('[data-primary]').forEach(x=>x.onclick=()=>act('repo_update',{repo_id:x.dataset.primary,is_primary:true,display_order:b.repositories.find(r=>r.repo_id===x.dataset.primary).display_order}));
  root.querySelectorAll('[data-reorder]').forEach(x=>x.onclick=()=>act('repo_update',{repo_id:x.dataset.reorder,display_order:[...root.querySelectorAll('[data-order]')].find(i=>i.dataset.order===x.dataset.reorder).value}));
  root.querySelectorAll('[data-remove]').forEach(x=>x.onclick=()=>{if(confirm('이 저장소를 활성 목록에서 삭제할까요?'))act('repo_remove',{repo_id:x.dataset.remove})});
  if($('#plan-form'))$('#plan-form').onsubmit=e=>{e.preventDefault();act('plan_add',{name:e.target.elements.name.value})};
  root.querySelectorAll('[data-plan-remove]').forEach(x=>x.onclick=()=>{if(confirm('준비 계획을 삭제할까요?'))act('plan_remove',{id:x.dataset.planRemove})});
 }else if(tab==='class'){
  void showClass(content,id);
 }else if(tab==='history'){void showHistory(content,id)}
 else{
  content.innerHTML=panel('취업 준비 판정 기준','<p class="ready-muted">'+(String(b.member.academic_year)==='2'?'2학년은 이력서와 자기소개서 준비 기준까지 적용됩니다.':'1학년은 GitHub, 대표 저장소, README, 포트폴리오에 집중하세요.')+'</p>'+(b.guide||[]).map(g=>'<div class="ready-panel"><h3>'+esc(g.title)+'</h3><p>'+esc(g.criterion)+'</p><p>'+esc(g.how)+'</p></div>').join(''))+
  panel('README 작성 예시','<p>프로젝트 소개·목적·기능·기술 스택·아키텍처·실행 안내·화면·역할·트러블슈팅을 실제 근거와 함께 작성하세요.</p><pre id="readme-example"></pre><button id="copy-readme">README 예시 복사</button>');
  const example="# Campus Planner — 학습 일정 관리 서비스 (README 작성 예시)\n\n> 이 문서는 학생들이 README 작성 방법을 참고하기 위한 **가상 프로젝트 예시**입니다. 실제 구현·테스트·기여 경험에 맞게 모든 항목을 수정하세요. 아래 명령어와 기능은 예시 구조를 전제로 하며 이 저장소에서 실행되는 프로그램을 제공하지는 않습니다.\n\n## 프로젝트 소개\n\nCampus Planner는 대학생이 수업·팀프로젝트·자격증 학습 일정을 한곳에 등록하고 관리하는 웹서비스를 가정한 예시 프로젝트입니다. 사용자는 일정의 마감일과 진행 상태를 확인하고, 완료한 학습 활동을 기록할 수 있습니다.\n\n- 프로젝트 유형: 팀프로젝트(예시)\n- 개발 기간: YYYY.MM ~ YYYY.MM(본인 프로젝트의 실제 기간으로 교체)\n- 저장소: 본인의 GitHub Repository URL을 입력\n- 시연 URL: 실제 배포 주소가 있다면 입력하고, 없다면 생략\n\n## 개발 목적\n\n팀프로젝트 일정과 개인 학습 일정을 여러 앱에 나누어 기록하면 마감일을 놓치기 쉽습니다. 이를 해결하기 위해 일정의 생성부터 완료 처리까지 한 화면에서 관리하도록 설계했다고 가정합니다. 이 예시의 학습 목표는 REST API 설계, 데이터베이스 모델링, 프론트엔드 상태 관리, 예외 처리 경험을 문서로 설명하는 것입니다.\n\n## 주요 기능\n\n| 기능 | 설명 | 관련 API(예시) |\n| --- | --- | --- |\n| 일정 목록 | 마감일순 일정 조회와 진행 상태 필터 | GET /api/schedules |\n| 일정 등록 | 제목·마감일·분류를 입력하여 등록 | POST /api/schedules |\n| 일정 수정 | 기존 일정의 내용과 마감일 수정 | PUT /api/schedules/{id} |\n| 완료 처리 | 진행 중인 일정을 완료로 변경 | PATCH /api/schedules/{id}/complete |\n| 입력 검증 | 빈 제목·잘못된 날짜 입력에 대한 오류 표시 | 400 Bad Request |\n\n실제 구현하지 않은 기능은 적지 마세요. 로그인, 알림, AI 추천 등은 구현한 경우에만 추가하세요.\n\n## 기술 스택\n\n| 구분 | 기술(예시) | 선택 이유 |\n| --- | --- | --- |\n| Backend | Java 17, Spring Boot 4, Spring Web, Spring Data JPA | REST API와 데이터 접근 계층 구현 |\n| Database | H2(로컬 개발용) | 별도 DB 서버 없이 빠르게 기능 검증 |\n| Frontend | Vue 3, Vite, JavaScript | 컴포넌트 기반 UI 및 빠른 개발 |\n| 협업 | Git, GitHub | 이슈·브랜치·Pull Request 이력 관리 |\n| 검증 | JUnit 5 | 서비스 로직과 API 동작 테스트 |\n\n버전·라이브러리·도구는 실제 프로젝트의 build.gradle, package.json에 맞춰 기재하세요.\n\n## 시스템 구조\n\n예시 구조는 브라우저의 Vue 화면에서 Spring Boot REST API를 호출하고, 서버가 JPA를 통해 H2 데이터베이스에 접근하는 3계층 구조입니다.\n\n~~~text\n[사용자 브라우저]\n       |\n       v\n[Vue 3 / Vite]\n       | HTTP/JSON\n       v\n[Spring Boot REST Controller]\n       |\n       v\n[Service / Repository (JPA)]\n       |\n       v\n[H2 Database]\n~~~\n\n예시 폴더 구성:\n\n~~~text\ncampus-planner/\n├── backend/        # Spring Boot 프로젝트\n├── frontend/       # Vue 프로젝트\n├── docs/           # 설계 문서, 화면 캡처\n└── README.md       # 현재 문서\n~~~\n\n가능하다면 실제 ERD, 데이터 흐름, 배포 구조와 주요 컴포넌트 간 관계도도 추가하세요.\n\n## 설치 및 실행\n\n다음은 위 폴더 구조를 갖춘 프로젝트를 가정한 **명령어 예시**입니다. 실제 Repository의 실행 명령, 운영체제별 차이 및 필수 환경변수를 확인한 뒤 고쳐 쓰세요.\n\n필수 환경: JDK 17 이상(프로젝트 설정과 호환되는 버전), Node.js(프로젝트가 요구하는 버전), Git.\n\n~~~bash\n# 1. 본인 GitHub 주소로 교체하여 프로젝트 받기\ngit clone https://github.com/YOUR-ID/campus-planner.git\ncd campus-planner\n\n# 2. 백엔드 실행 (macOS/Linux)\ncd backend\n./gradlew bootRun\n# Windows: gradlew.bat bootRun\n\n# 3. 다른 터미널에서 프론트엔드 실행\ncd frontend\nnpm install\nnpm run dev\n~~~\n\n- 백엔드 예시 주소: http://localhost:8080\n- 프론트엔드 예시 주소: http://localhost:5173\n- H2 접속 설정 및 CORS 허용 주소는 실제 프로젝트 설정값을 문서에 추가\n- 데이터베이스 계정, 토큰, 비밀번호가 필요한 프로젝트는 **값이 없는 환경변수 목록**만 설명하고 비밀 값은 GitHub에 올리지 않기\n\n## 실행 화면\n\n| 화면(예시) | 사용자가 확인할 내용 |\n| --- | --- |\n| 일정 목록 | 일정 제목, 마감일, 진행 상태 및 필터 결과 |\n| 일정 등록 | 입력 폼과 저장 후 목록 반영 |\n| 오류 처리 | 잘못된 날짜 제출 시 오류 메시지 |\n\n실제 README에서는 위 설명과 함께 **본인이 직접 캡처한 화면 이미지**를 넣으세요. 화면 이미지 파일을 저장소에 추가한 다음 Markdown 이미지 링크의 경로가 실제로 존재하는지 확인해야 합니다. 캡처나 실행 결과를 아직 준비하지 않았다면 시연했다고 주장하지 마세요.\n\n## 담당 역할\n\n- 참여 형태: 팀원(예시) — 실제 팀원 수와 본인 역할로 수정\n- 본인 담당: 일정 API 설계, 일정 CRUD 구현, 입력값 검증, 서비스 계층 테스트(예시)\n- 협업 방식: 기능별 브랜치 작업과 Pull Request 코드 리뷰(예시)\n- 기여 근거: 본인이 작성한 Commit 또는 Pull Request 링크를 기재\n\n단순히 \"백엔드 개발\"이라고 쓰기보다 어떤 기능을 **직접** 구현했고, 어떤 결과를 만들었는지 구체적으로 작성하세요. 다른 팀원이 만든 화면이나 기능을 본인의 작업으로 표시하지 마세요.\n\n## 트러블슈팅\n\n**문제(예시):** 프론트엔드 개발 서버에서 백엔드 API를 호출했을 때 브라우저가 CORS 오류를 표시했습니다.\n\n**원인 분석(예시):** 프론트엔드 개발 주소와 백엔드 API 주소의 출처가 달랐고, 서버의 허용 출처 설정을 확인할 필요가 있었습니다. 브라우저 개발자 도구에서 요청의 Origin과 응답 헤더를 점검했습니다.\n\n**해결 과정(예시):** 개발 환경에서 필요한 프론트엔드 출처만 허용하도록 서버 CORS 정책을 구성했습니다. 모든 출처를 무조건 허용하는 대신 환경에 따라 허용 주소를 분리했습니다.\n\n**검증 방법(예시):** 개발자 도구의 Network 탭에서 사전 요청 및 실제 API 응답을 확인하고, 정상·오류 응답을 모두 테스트했습니다.\n\n실제 프로젝트의 오류 로그, 재현 절차, 수정 전후 차이, 테스트 결과를 근거로 작성하세요. 위 사례는 작성 형식 참고용이며 실제 해결 이력이 아닙니다.\n";
  $('#readme-example').textContent=example;$('#copy-readme').onclick=async()=>{try{await navigator.clipboard.writeText(example);status('README 예시를 복사했습니다.')}catch{status('복사 권한을 확인하세요.',true)}};
 }
}
function accessPanel(kind){
 document.querySelector('.ready-related').hidden=true;
 root.setAttribute('aria-busy','false');
 if(kind==='admin'){
  status('');
  root.innerHTML=panel('취업 준비 관리','<div class="ready-access-card"><span class="ready-access-badge">관리자 계정</span><p>학생별 취업 준비 현황과 GitHub·Notion 점검 결과는 관리자 페이지에서 확인할 수 있습니다.</p><div class="ready-controls"><a class="ready-link" href="admin/ready.html">취업 준비 관리 바로가기</a><a class="ready-link ready-secondary" href="admin/index.html">관리자 홈</a></div></div>');
 }else{
  status('');
  root.innerHTML=panel('재학생 전용 서비스','<div class="ready-access-card"><p>취업 준비 점검은 재학생 계정으로 이용할 수 있습니다. 다른 취업·진로 서비스는 포털 메뉴에서 확인하세요.</p><div class="ready-controls"><a class="ready-link" href="services.html#career">취업 · 진로 서비스</a><a class="ready-link ready-secondary" href="mypage.html">내 회원정보</a></div></div>');
 }
}
async function init(){
 // UI uses the verified portal bootstrap role only for navigation. The server remains the authority.
 if(role?.isAdmin===true){accessPanel('admin');return}
 if(role?.profile&&(role.profile.signup_type!=='student'||!['enrolled','leave','early_employment'].includes(role.profile.enrollment_status))){accessPanel('nonstudent');return}
 root.setAttribute('aria-busy','true');
 try{await load();await completeOAuth()}
 catch(e){
  if(e.code==='STUDENT_REQUIRED'||e.code==='FORBIDDEN'){
   accessPanel(role?.isAdmin===true?'admin':'nonstudent');return
  }
  root.setAttribute('aria-busy','false');
  status(e.message,true);
  root.innerHTML=panel('준비 현황을 불러오지 못했습니다.','<p>네트워크 또는 로그인 상태를 확인한 후 다시 시도하세요.</p><div class="ready-controls"><button id="ready-retry">다시 불러오기</button><a class="ready-link ready-secondary" href="index.html">포털 홈</a></div>');
  $('#ready-retry').onclick=()=>{root.innerHTML='';status('준비 현황을 불러오는 중입니다.');void init()};
 }
}
void init();
