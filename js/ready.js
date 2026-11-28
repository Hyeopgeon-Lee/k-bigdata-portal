import {api,esc,fmt,tag,url,table,cards,panel,bars,status,issues,history,label,details} from './ready-common.mjs?v=20261128-ready-1';
const root=document.querySelector('#ready-root');let b,tab='dashboard',busy=false;
const $=s=>root.querySelector(s);
const field=(key,type='text')=>'<label>'+esc(label(key))+'<input name="'+key+'" type="'+type+'" maxlength="'+(type==='url'?1000:200)+'" value="'+esc(b.student[key]||'')+'" '+(!b.write?'disabled':'')+'></label>';
const choices=(key,options)=>'<label>'+esc(label(key))+'<select name="'+key+'" '+(!b.write?'disabled':'')+'>'+options.map(v=>'<option '+(v===(b.student[key]||'미작성')?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select></label>';
const disabled=()=>!b.write?'disabled':'';
async function load(){b=await api('mine');render();status(b.registered?'취업 준비 현황을 확인하세요.':'처음 이용하시나요? 내 정보를 등록해 주세요.');}
async function act(action,payload={},message='저장했습니다.'){if(busy)return;busy=true;root.querySelectorAll('button,input,select').forEach(x=>x.disabled=true);status(action==='manual_check'?'GitHub·포트폴리오 점검 중입니다. 잠시 기다려 주세요.':'처리 중…');try{const r=await api(action,payload);await load();status(r.message||message+(r.check_status?' · '+r.check_status:''));}catch(e){status(e.message,true);render()}finally{busy=false}}
function render(){
 const tabs=[['dashboard','내 현황'],['profile','내 정보 수정'],['class','학급 현황'],['guide','준비 기준 · README 예시'],['history','변경 이력']];
 root.innerHTML='<div class="ready-controls" role="group" aria-label="취업 준비 메뉴">'+tabs.map(([v,t])=>'<button class="ready-tab" data-tab="'+v+'" aria-pressed="'+(tab===v)+'">'+t+'</button>').join('')+'</div><div id="ready-content"></div>';
 const content=$('#ready-content');root.querySelectorAll('[data-tab]').forEach(x=>x.onclick=()=>{if(busy)return;tab=x.dataset.tab;render()});
 if(tab==='dashboard'){
  content.innerHTML=panel('내 취업 준비 현황','<p><strong>'+esc(b.member.full_name)+'</strong> · '+esc(b.member.student_no)+' · '+esc(b.member.academic_year)+'학년</p><p class="ready-muted">학번·이름·학년은 통합 포털 회원정보와 연결됩니다. 최근 정보 수정: '+esc(fmt(b.updated_at))+'</p><div class="ready-controls"><button id="check-now" '+(!b.registered||!b.write?'disabled':'')+'>지금 점검하기</button><button id="edit-profile" class="ready-secondary">'+(b.registered?'정보 수정':'정보 등록')+'</button></div>')+details(b);
  $('#check-now').onclick=()=>act('manual_check',{},'점검을 완료했습니다.');$('#edit-profile').onclick=()=>{tab='profile';render()};
 }else if(tab==='profile'){
  content.innerHTML=panel('내 정보 '+(b.registered?'수정':'등록'),'<p>포털 회원: '+esc(b.member.full_name)+' · '+esc(b.member.student_no)+' · '+esc(b.member.academic_year)+'학년</p><form id="profile-form"><div class="ready-form">'+field('career_target')+['github_url','github_pages_url','github_pages_repo','notion_url','portfolio_url','blog_url'].map(k=>field(k,'url')).join('')+choices('resume_status',['미작성','작성 중','1차 완성','최종 완성'])+choices('cover_letter_status',['미작성','작성 중','기본본 완성','기업 지원 가능'])+'</div><p><label><input name="peer_share_consent" type="checkbox" '+(b.consent?'checked ':'')+disabled()+'> 학급 현황에 내 이름·준비 상태·활동일·README·포트폴리오 상태를 공개하는 데 동의합니다. 동의하지 않아도 이용할 수 있습니다.</label></p><button '+disabled()+'>저장</button></form>')+
  panel('Repository 관리 (최대 5개)',b.registered?table(['저장소','대표','순서','관리'],b.repositories.map(r=>[url(r.repo_url),r.is_primary?'대표':'<button data-primary="'+esc(r.repo_id)+'" '+disabled()+'>대표 지정</button>', '<input aria-label="저장소 표시 순서" type="number" min="1" max="99" data-order="'+esc(r.repo_id)+'" value="'+esc(r.display_order)+'" '+disabled()+'>','<button data-reorder="'+esc(r.repo_id)+'" '+disabled()+'>순서 저장</button> <button class="ready-secondary" data-remove="'+esc(r.repo_id)+'" '+disabled()+'>삭제</button>']))+'<form id="repo-form" class="ready-controls"><label>GitHub Repository URL<input required name="repo_url" type="url" placeholder="https://github.com/user/project" '+disabled()+'></label><button '+(!b.write||b.repositories.length>=5?'disabled':'')+'>추가</button></form>':'<p>내 정보를 먼저 저장하세요.</p>')+
  panel('자격증 준비 계획',b.registered?table(['준비 중 자격증','관리'],b.plans.map(x=>[esc(x.certificate_name),'<button class="ready-secondary" data-plan-remove="'+esc(x.id)+'" '+disabled()+'>삭제</button>']))+'<form id="plan-form" class="ready-controls"><label>자격증명<input required name="name" maxlength="120" '+disabled()+'></label><button '+disabled()+'>준비 계획 추가</button></form><p>취득·필기합격·수정·삭제는 <a href="my-certifications.html">포털 나의 자격증</a>에서 관리합니다.</p>':'<p>내 정보를 먼저 저장하세요.</p>');
  $('#profile-form').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.peer_share_consent=e.target.elements.peer_share_consent.checked;act('save_profile',{profile:d})};
  if($('#repo-form'))$('#repo-form').onsubmit=e=>{e.preventDefault();act('repo_add',{repo_url:e.target.elements.repo_url.value})};
  root.querySelectorAll('[data-primary]').forEach(x=>x.onclick=()=>act('repo_update',{repo_id:x.dataset.primary,is_primary:true,display_order:b.repositories.find(r=>r.repo_id===x.dataset.primary).display_order}));
  root.querySelectorAll('[data-reorder]').forEach(x=>x.onclick=()=>act('repo_update',{repo_id:x.dataset.reorder,display_order:[...root.querySelectorAll('[data-order]')].find(i=>i.dataset.order===x.dataset.reorder).value}));
  root.querySelectorAll('[data-remove]').forEach(x=>x.onclick=()=>{if(confirm('이 저장소를 활성 목록에서 삭제할까요?'))act('repo_remove',{repo_id:x.dataset.remove})});
  if($('#plan-form'))$('#plan-form').onsubmit=e=>{e.preventDefault();act('plan_add',{name:e.target.elements.name.value})};
  root.querySelectorAll('[data-plan-remove]').forEach(x=>x.onclick=()=>{if(confirm('준비 계획을 삭제할까요?'))act('plan_remove',{id:x.dataset.planRemove})});
 }else if(tab==='class'){
  content.innerHTML=panel('학급 현황','<p>학년별 통계와 동의한 학생의 공개 현황을 불러오는 중입니다.</p>');
  api('class').then(d=>{if(tab!=='class')return;content.innerHTML=panel('우리 학년 준비 현황',cards([['전체',d.summary.total_students],['등록',d.summary.registered],['GitHub 주 3일 이상',d.summary.github_active_7d],['포트폴리오 미등록',d.summary.portfolio_missing]])+bars(d.summary))+
  panel('공개 동의 학생','<p class="ready-muted">동의한 학생의 제한된 준비 현황만 공개합니다. 학번·연락처·링크 등은 공유하지 않습니다.</p>'+table(['이름','준비 상태','최근 7일 활동일','README','포트폴리오'],d.peers.map(x=>[esc(x.name),tag(x.status),esc(x.days??'미점검'),esc(x.readme),esc(x.portfolio)])))}).catch(e=>status(e.message,true));
 }else if(tab==='history'){content.innerHTML=panel('정보 변경 이력',history(b))}
 else{
  content.innerHTML=panel('취업 준비 판정 기준',(b.guide||[]).map(g=>'<div class="ready-panel"><h3>'+esc(g.title)+'</h3><p>'+esc(g.criterion)+'</p><p>'+esc(g.how)+'</p></div>').join(''))+
  panel('README 작성 예시','<p>프로젝트 소개·목적·기능·기술 스택·아키텍처·실행 안내·화면·역할·트러블슈팅을 실제 근거와 함께 작성하세요.</p><pre id="readme-example"></pre><button id="copy-readme">README 예시 복사</button>');
  const example='# 프로젝트 이름\n\n## 프로젝트 소개\n해결하려는 실제 문제와 사용자를 설명합니다.\n\n## 개발 목적\n문제의 원인과 개선 목표를 구체적으로 기록합니다.\n\n## 주요 기능\n- 사용자가 수행하는 핵심 기능과 흐름\n\n## 기술 스택\n언어, 프레임워크, 데이터베이스 및 선택 이유\n\n## 아키텍처\n서비스 구성 요소와 데이터 처리 흐름\n\n## 설치 및 실행 안내\n필요 환경, 설치 명령, 환경변수 예시, 실행 명령\n\n## 실행 화면\n![실행 화면](docs/screenshot.png)\n\n## 본인 역할\n담당 기능, 구현 방식, 기여한 결과와 개선 사항\n\n## 트러블슈팅\n발생한 문제, 원인 분석, 해결 과정 및 검증 결과';
  $('#readme-example').textContent=example;$('#copy-readme').onclick=async()=>{try{await navigator.clipboard.writeText(example);status('README 예시를 복사했습니다.')}catch{status('복사 권한을 확인하세요.',true)}};
 }
}
load().catch(e=>status(e.message,true));
