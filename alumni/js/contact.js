(function(){
 "use strict";
 const U=AlumniUI;
 const TARGET_KEY="alumni-contact-target-v2",JOB_KEY="alumni-contact-job-v2";
/**
 * SunEditor produces HTML; the existing API accepts a restricted Quill Delta.
 * Convert to text + supported attributes in the browser, and keep the
 * backend's independent HTML escaping, link allowlist and 1,500-char validation.
 * No browser-authored HTML is sent directly to the mail endpoint.
 */
function richTextToDelta(html){
 const template=document.createElement("template");
 template.innerHTML=String(html||"");
 const ops=[],excluded=new Set(["SCRIPT","STYLE","SVG","IFRAME","OBJECT","EMBED","IMG","VIDEO","AUDIO","FORM"]);
 const blocks=new Set(["P","DIV","LI","H1","H2","H3","H4","H5","H6","BLOCKQUOTE","PRE"]);
 let total=0,tooComplex=false;
 function append(value,attrs={}){
  const chunk=String(value||"").replace(/\r\n?/g,"\n").replace(/\u00a0/g," ");
  if(!chunk)return;
  total+=chunk.length;
  if(total>1800){tooComplex=true;return;}
  const attributes=Object.keys(attrs).length?{...attrs}:undefined;
  const last=ops[ops.length-1],sig=JSON.stringify(attributes||{}),same=last&&JSON.stringify(last.attributes||{})===sig;
  if(same)last.insert+=chunk;
  else ops.push(attributes?{insert:chunk,attributes}:{insert:chunk});
  if(ops.length>300)tooComplex=true;
 }
 function newline(){
  if(ops.length&&!ops[ops.length-1].insert.endsWith("\n"))append("\n");
 }
 function visit(node,attrs={}){
  if(tooComplex)return;
  if(node.nodeType===3){append(node.nodeValue,attrs);return;}
  if(node.nodeType!==1)return;
  const tag=node.tagName;
  if(excluded.has(tag))return;
  if(tag==="BR"){append("\n");return;}
  const next={...attrs};
  if(tag==="STRONG"||tag==="B")next.bold=true;
  if(tag==="EM"||tag==="I")next.italic=true;
  if(tag==="U")next.underline=true;
  if(tag==="A"){
   const href=(node.getAttribute("href")||"").trim();
   if(/^https?:\/\/[^\s<>"']+$/i.test(href))next.link=href;
  }
  if(blocks.has(tag)&&tag!=="LI")newline();
  if(tag==="LI"){
   newline();
   const parent=node.parentElement,ordered=parent?.tagName==="OL";
   const index=ordered?Array.from(parent.children).indexOf(node)+1:0;
   append(ordered?index+". ":"• ");
  }
  for(const child of node.childNodes)visit(child,next);
  if(blocks.has(tag))newline();
 }
 for(const child of template.content.childNodes)visit(child);
 return {plain:ops.map(op=>op.insert).join("").trim(),delta:{ops},tooComplex};
}

 document.addEventListener("DOMContentLoaded",async()=>{
  const st=U.qs("#contact-status"),form=U.qs("#contact-form"),btn=U.qs("#contact-submit");
  const recipientSelect=U.qs("#contact-recipient"),area=U.qs("#message");
  let editor=null,selectedJob=null;
  const counter=U.qs("#contact-message-count"),editorField=U.qs("#contact-rich-editor");
  const updateCount=()=>{
   const content=editor?.$?.html?.get?.()||"";
   const text=editor?richTextToDelta(content).plain:area.value.trim();
   counter.textContent=text.length.toLocaleString("ko-KR")+" / 1,500자";
   counter.dataset.overLimit=String(text.length>1500);
  };
  if(window.SUNEDITOR?.create){
   try{
    const options={
     plugins:window.SUNEDITOR.plugins,
     mode:"classic",
     toolbar_sticky:-1,
     minHeight:"205px",
     width:"100%",
     placeholder:"선배에게 문의할 내용을 자세히 작성해 주세요.",
     buttonList:[["undo","redo"],"|",["bold","italic","underline"],"|",["list","link"],"|",["removeFormat"]],
     events:{onChange:()=>updateCount()}
    };
    if(window.SUNEDITOR_LANG?.ko)options.lang=window.SUNEDITOR_LANG.ko;
    editor=window.SUNEDITOR.create(editorField,options);
    const editable=U.qs(".contact-editor-wrap .sun-editor-editable");
    if(editable)editable.setAttribute("aria-label","문의 내용 입력");
   }catch(error){console.error("SunEditor initialization",error);editor=null;}
  }
  if(!editor){
   editorField.hidden=true;
   area.hidden=false;
   area.required=true;
   area.addEventListener("input",updateCount);
  }
  updateCount();
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
   const content=editor?richTextToDelta(editor.$.html.get()):{plain:area.value.trim(),delta:null};
   const plain=content.plain;
   if(plain.length<20||plain.length>1500||content.tooComplex){
    U.status(st,content.tooComplex?"문의 내용의 서식이 너무 복잡합니다. 서식을 단순하게 작성해 주세요.":"문의 내용을 20~1,500자로 입력해 주세요.","error");
    if(editor)U.qs(".contact-editor-wrap .sun-editor-editable")?.focus();else area.focus();return;
   }
   const data=Object.fromEntries(fd);
   data.alumni_id=recipientSelect.value;
   data.message=plain;
   if(content.delta)data.message_delta=content.delta;
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
