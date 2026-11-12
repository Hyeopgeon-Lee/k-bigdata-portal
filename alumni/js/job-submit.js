(function(){
 "use strict";
 const U=AlumniUI;
 document.addEventListener("DOMContentLoaded",async()=>{
  const form=U.qs("#job-submit-form"),st=U.qs("#job-submit-status"),submit=U.qs("#job-submit-button");
  const gate=U.qs("#job-auth"),always=U.qs('[name="always_open"]'),deadline=U.qs('[name="deadline"]');
  always.addEventListener("change",()=>{deadline.disabled=always.checked;deadline.required=!always.checked;if(always.checked)deadline.value="";});
  always.dispatchEvent(new Event("change"));
  try{
   await window.alumniPortalReady;
   if(document.documentElement.dataset.alumniPortalAuth!=="approved")throw Error("포털 로그인이 필요합니다.");
   // JWT is the only member identity. No Alumni ID, PIN or second confirmation.
   await AlumniAPI.request("verifyJobAlumni",{method:"POST",data:{}});
   gate.hidden=true;form.hidden=false;
   U.status(st,"포털 계정으로 작성자가 확인되었습니다. 채용정보를 등록할 수 있습니다.","success");
  }catch(e){form.hidden=true;U.status(st,e?.message||"회원 정보를 확인하지 못했습니다.","error");return;}
  form.addEventListener("submit",async e=>{
   e.preventDefault();
   if(!form.reportValidity())return;
   const data=Object.fromEntries(new FormData(form));
   Object.assign(data,{always_open:always.checked,referral_available:data.referral_available==="true",contact_allowed:data.contact_allowed==="true"});
   U.busy(submit,true,"게시 중…");
   try{
    const r=await AlumniAPI.request("submitJob",{method:"POST",data});
    form.hidden=true;
    U.status(st,r.message||"채용정보가 게시되었습니다.","success");
   }catch(err){U.status(st,err.message,"error")}
   finally{U.busy(submit,false)}
  });
 });
})();
