(function(){
 "use strict";
 const U=AlumniUI;
 const TARGET_KEY="alumni-contact-target-v2",JOB_KEY="alumni-contact-job-v2";
 document.addEventListener("DOMContentLoaded",async()=>{
  const st=U.qs("#contact-status"),form=U.qs("#contact-form"),btn=U.qs("#contact-submit");
  const recipientSelect=U.qs("#contact-recipient"),area=U.qs("#message");
  let editor=null,selectedJob=null;
  if(window.Quill){
   editor=new window.Quill("#contact-rich-editor",{
    theme:"snow",
    modules:{toolbar:[["bold","italic","underline"],[{list:"ordered"},{list:"bullet"}],["link"]]}
   });
  }else{U.qs("#contact-rich-editor").hidden=true;area.hidden=false;area.required=true;}
  try{
   await window.alumniPortalReady;
   if(document.documentElement.dataset.alumniPortalAuth!=="approved")
    throw Error("승인된 포털 로그인이 필요합니다.");
   const list=(await AlumniAPI.request("list")).data||[];
   const mentors=list.filter(x=>x.contact_allowed===true);
   if(!mentors.length)throw Error("현재 연락 요청을 받는 선배가 없습니다.");
   for(const a of mentors){
    const label=[a.name,a.graduation_year?a.graduation_year+"년 졸업":"",a.company,a.job].filter(Boolean).join(" · ");
    recipientSelect.add(new Option(label,String(a.alumni_id)));
   }
   const selected=sessionStorage.getItem(TARGET_KEY);
   if(selected&&mentors.some(x=>String(x.alumni_id)===selected))recipientSelect.value=selected;
   const storedJob=sessionStorage.getItem(JOB_KEY);
   if(storedJob&&recipientSelect.value){
    const j=(await AlumniAPI.request("jobDetail",{params:{id:storedJob}})).data;
    if(j&&j.contact_allowed&&j.alumni_id===recipientSelect.value){
     selectedJob=j;
     const category=U.qs('[name="category"]');
     if(!Array.from(category.options).some(o=>o.value==="채용정보 문의"))
      category.add(new Option("채용정보 문의","채용정보 문의"));
     category.value="채용정보 문의";
     U.qs('[name="subject"]').value=j.company+" "+j.job_title+" 채용 문의";
    }
   }
   const renderTitle=()=>{
    const label=recipientSelect.selectedOptions[0]?.textContent||"";
    U.qs("#contact-title").textContent=recipientSelect.value?"선배에게 연락 요청 · "+label.split(" · ")[0]:"선배에게 연락 요청";
   };
   recipientSelect.addEventListener("change",()=>{
    if(selectedJob&&selectedJob.alumni_id!==recipientSelect.value)selectedJob=null;
    renderTitle();
   });
   renderTitle();
   st.hidden=true;form.hidden=false;
  }catch(error){form.hidden=true;U.status(st,error?.message||"선배 정보를 불러오지 못했습니다.","error");return;}
  form.addEventListener("submit",async event=>{
   event.preventDefault();
   if(!recipientSelect.value){U.status(st,"연락할 선배를 선택해 주세요.","error");return;}
   if(!form.reportValidity())return;
   const fd=new FormData(form),share=fd.get("share_contact");
   const plain=editor?editor.getText().trim():area.value.trim();
   if(plain.length<20||plain.length>1500){
    U.status(st,"문의 내용을 20~1,500자로 입력해 주세요.","error");
    if(editor)editor.focus();else area.focus();return;
   }
   const data=Object.fromEntries(fd);
   data.alumni_id=recipientSelect.value;
   data.message=plain;
   if(editor)data.message_delta=editor.getContents();
   data.share_email=share==="email"||share==="both";
   data.share_phone=share==="phone"||share==="both";
   data.share_competencies=fd.get("share_competencies")==="on";
   if(selectedJob)data.job_id=selectedJob.job_id;
   delete data.share_contact;delete data.recipient;
   U.busy(btn,true,"전송 중…");
   U.status(st,"선배에게 연락 요청을 전달하고 있습니다.");
   try{
    await AlumniAPI.request("contact",{method:"POST",data});
    sessionStorage.removeItem(TARGET_KEY);sessionStorage.removeItem(JOB_KEY);
    form.hidden=true;
    U.status(st,"연락 요청이 정상 전달되었습니다.","success");
   }catch(error){U.status(st,error?.message||"연락 요청이 실패했습니다.","error");}
   finally{U.busy(btn,false)}
  });
 });
})();
