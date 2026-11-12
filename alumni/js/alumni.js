(function(){
 'use strict';
 const U=AlumniUI;
 const skills=['Java','Spring Boot','Python','AI','빅데이터','클라우드','Docker','Kubernetes','DevOps','데이터베이스','프론트엔드'];
 const topics=['취업 준비','회사 정보','직무 상담','개발 공부','AI','빅데이터','클라우드','대학원 진학','자격증','포트폴리오','면접','기타'];
 function renderChecks(name,options){
  U.qs('[data-checks="'+name+'"]').innerHTML=options.map(value=>
   '<label class="check"><input type="checkbox" name="'+name+'" value="'+value+'">'+value+'</label>'
  ).join('');
 }
 function syncOptions(){
  U.selectOptions(U.qs('[name="employment_status"]'),U.options.employmentStatus,{selected:'취업 중'});
  U.selectOptions(U.qs('[name="bachelor_status"]'),U.options.bachelorStatus);
  U.selectOptions(U.qs('[name="graduate_status"]'),U.options.graduateStatus);
  U.selectOptions(U.qs('[name="graduate_school_type"]'),U.options.graduateSchoolType);
  U.selectOptions(U.qs('[name="graduate_degree"]'),U.options.graduateDegree);
 }
 function conditional(field,section,show,required=[]){
  const input=U.qs('[name="'+field+'"]'),box=U.qs(section);
  const sync=()=>{
   const visible=show(input.value);
   box.hidden=!visible;
   required.forEach(name=>{const el=U.qs('[name="'+name+'"]');if(el)el.required=visible;});
  };
  input.addEventListener('change',sync);sync();
 }
 function values(form){
  const data=Object.fromEntries(new FormData(form));
  for(const name of ['skills','mentoring_topics'])
   data[name]=U.qsa('[name="'+name+'"]:checked').map(el=>el.value);
  if(data.skills_other)data.skills.push(...data.skills_other.split(',').map(v=>v.trim()).filter(Boolean));
  for(const name of ['privacy_consent','identity_consent','contact_consent','career_mail_enabled','alumni_news_mail_enabled'])
   data[name]=!!U.qs('[name="'+name+'"]')?.checked;
  return data;
 }
 function fill(data){
  for(const [name,value] of Object.entries(data)){
   const nodes=U.qsa('[name="'+name+'"]');
   if(!nodes.length)continue;
   if(nodes[0].type==='checkbox'){
    const items=Array.isArray(value)?value:String(value||'').split('|');
    for(const node of nodes)
     node.checked=['career_mail_enabled','alumni_news_mail_enabled'].includes(name)?
      value===true||value==='TRUE':items.includes(node.value);
   }else nodes[0].value=value==null?'':String(value);
  }
  U.qs('[name="privacy_consent"]').checked=true;
  U.qs('[name="identity_consent"]').checked=true;
  for(const name of ['employment_status','bachelor_status','graduate_status','contact_allowed'])
   U.qs('[name="'+name+'"]').dispatchEvent(new Event('change'));
 }
 document.addEventListener('DOMContentLoaded',async()=>{
  const form=U.qs('#alumni-form'),save=U.qs('#alumni-submit'),notice=U.qs('#form-status');
  const heading=U.qs('#alumni-account-title'),desc=U.qs('#alumni-account-description');
  const myPage=U.qs('#alumni-account-mypage');
  U.yearOptions(U.qs('#form-graduation-year'));
  // Graduation must have occurred, not be a future year.
  for(const option of [...U.qs('#form-graduation-year').options])
   if(option.value&&Number(option.value)>new Date().getFullYear())option.remove();
  renderChecks('skills',skills);
  renderChecks('mentoring_topics',topics);
  syncOptions();
  const activeJobs=['취업 중','대학원 연구실(석사과정)','대학원 연구실(박사과정)'];
  conditional('employment_status','#employment-fields',v=>activeJobs.includes(v),['company','job']);
  conditional('bachelor_status','#bachelor-fields',v=>['재학','취득','취득 예정'].includes(v));
  conditional('graduate_status','#graduate-fields',v=>['재학','휴학','수료','졸업'].includes(v),
   ['graduate_school_type','graduate_school','graduate_major']);
  conditional('contact_allowed','#mentoring-fields',v=>v==='true');
  try{
   await window.alumniPortalReady;
   if(document.documentElement.dataset.alumniPortalAuth!=='approved')
    throw Error('승인된 학과 포털 계정으로 로그인해 주세요.');
   const response=await AlumniAPI.request('myAlumniProfile',{method:'POST'});
   const info=response.data;
   if(!info?.eligible){
    heading.textContent='졸업 후 등록할 수 있습니다';
    desc.textContent='등록된 학생 계정은 그대로 유지됩니다. 졸업한 뒤 마이페이지에서 학적 상태를 졸업으로 저장하면 이곳에서 정보를 등록할 수 있습니다.';
    myPage.hidden=false;
    return;
   }
   const identity=info.identity||{};
   form.hidden=false;
   const name=U.qs('[name="name"]'),email=U.qs('[name="email"]');
   name.value=identity.name||'';
   email.value=identity.email||'';
   name.readOnly=true;email.readOnly=true;
   if(identity.studentNo){
    const student=U.qs('[name="student_id"]');
    student.value=identity.studentNo;
    student.readOnly=true;
   }
   if(identity.phone)U.qs('[name="phone"]').value=identity.phone;
   if(identity.graduationYear)
    U.qs('[name="graduation_year"]').value=String(identity.graduationYear);
   if(info.registered&&info.profile){
    fill(info.profile);
    name.value=identity.name||'';
    email.value=identity.email||'';
    if(identity.studentNo)U.qs('[name="student_id"]').value=identity.studentNo;
    U.qs('[name="mode"]').value='update';
    U.qs('[name="alumni_id"]').value=info.profile.alumni_id||'';
    heading.textContent='등록된 내 정보 수정';
    desc.textContent='포털 로그인을 통해 본인 확인이 완료됐습니다. PIN 없이 정보를 수정할 수 있으며 저장된 변경 사항은 관리자 승인 후 공개됩니다.';
    save.textContent='수정 내용 저장';
   }else{
    heading.textContent='졸업생 정보 신규 등록';
    desc.textContent='졸업 상태가 확인되었습니다. 졸업연도와 진로 정보를 입력해 주세요. 관리자 승인 후 공개됩니다.';
    save.textContent='졸업생 정보 등록 신청';
   }
  }catch(error){
   heading.textContent='계정 정보를 불러오지 못했습니다';
   desc.textContent='포털 로그인 상태를 확인한 후 다시 이용해 주세요.';
   U.status(notice,error?.message||'내 정보를 불러올 수 없습니다.','error');
   form.hidden=true;
   return;
  }
  form.addEventListener('submit',async event=>{
   event.preventDefault();
   if(!form.reportValidity())return;
   const payload=values(form);
   if(payload.contact_allowed==='true'&&!payload.mentoring_topics.length)
    return U.status(notice,'연락 요청을 허용하려면 상담 가능 분야를 선택해 주세요.','error');
   if(payload.contact_allowed==='true'&&!payload.contact_consent)
    return U.status(notice,'연락 요청을 허용하려면 연락 요청 수신 동의를 선택해 주세요.','error');
   U.busy(save,true,'저장 중…');
   try{
    const response=await AlumniAPI.request('saveMyAlumniProfile',{method:'POST',data:payload});
    U.qs('[name="alumni_id"]').value=response.alumni_id;
    U.qs('[name="mode"]').value='update';
    window.alumniPortalMember={...(window.alumniPortalMember||{}),alumniId:response.alumni_id};
    heading.textContent='등록된 내 정보 수정';
    desc.textContent='저장했습니다. 변경된 정보는 관리자 검토 후 공개됩니다.';
    U.status(notice,'졸업생 정보가 저장되었습니다. 관리자 승인 후 공개됩니다.','success');
    save.textContent='수정 내용 저장';
   }catch(error){
    U.status(notice,error?.message||'저장하지 못했습니다. 다시 시도해 주세요.','error');
   }finally{U.busy(save,false);}
  });
 });
})();