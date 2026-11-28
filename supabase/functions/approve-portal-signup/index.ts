import {createClient} from "npm:@supabase/supabase-js@2.49.10";
import { renderPortalMail, mailParagraph, mailCallout } from "../_shared/portal-mail.mjs";

// Only an authenticated super administrator can approve or resend signup mail.
const allowedOrigin="https://portal.k-bigdata.kr";
const headers={
  "Access-Control-Allow-Origin":allowedOrigin,
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Content-Type":"application/json",
  "Vary":"Origin"
};
const respond=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers});
const url=Deno.env.get("SUPABASE_URL")!;
const anonKey=Deno.env.get("SUPABASE_ANON_KEY")!;
const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const server=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
const escaped=(value:string)=>value.replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]||c));

function emailHtml(name:string){
 return renderPortalMail({kind:"approval",title:"포털 가입이 승인되었습니다.",category:"가입 승인 완료",
  bodyHtml:mailParagraph(name+"님, 안녕하세요. 학과 통합 포털 가입이 승인되었습니다. 이제 가입한 이메일과 비밀번호로 로그인하여 학습 서비스를 이용하실 수 있습니다.")+
   mailCallout("• 정보처리·NCP 기출문제 및 기초 코딩 학습\n• 문제 풀이 기록과 오답 복습\n• 개인 학습현황 및 학과 서비스","approval","포털에서 이용할 수 있어요"),
  actions:[{href:"https://portal.k-bigdata.kr/",label:"포털 로그인하기"}],footerNote:"본인이 신청한 가입이 아니라면 이 메일을 무시하고 학과 관리자에게 문의해 주세요."});
}
const dateNow=()=>new Date().toISOString();
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return respond({error:"METHOD_NOT_ALLOWED"},405);
 const origin=req.headers.get("origin");
 if(origin&&origin!==allowedOrigin)return respond({error:"ORIGIN_NOT_ALLOWED"},403);
 const jwt=req.headers.get("authorization")?.replace(/^Bearer /i,"");
 if(!jwt)return respond({error:"UNAUTHORIZED"},401);
 const actor=createClient(url,anonKey,{global:{headers:{Authorization:"Bearer "+jwt}},
   auth:{persistSession:false,autoRefreshToken:false}});
 const {data:who,error:userError}=await actor.auth.getUser(jwt);
 if(userError||!who.user||who.user.email?.toLowerCase()!=="hglee67@kopo.ac.kr")
   return respond({error:"ADMIN_NOT_AUTHORIZED"},403);
 const {data:allowed,error:adminError}=await actor.rpc("portal_super_admin_allowed");
 if(adminError||allowed!==true)return respond({error:"ADMIN_NOT_AUTHORIZED"},403);
 try{
  const input=await req.json();
  if(input.action==="email_statuses"){
   const {data,error}=await server.from("signup_approval_emails")
     .select("user_id,delivery_status,sent_at,attempted_at");
   if(error)throw error;
   return respond({ok:true,notifications:data||[]});
  }
  if(!["approve","retry"].includes(input.action)||
     !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(input.userId||"")))
   return respond({error:"INVALID_REQUEST"},400);
  const {data:member,error:lookupError}=await server.from("profiles")
    .select("user_id,full_name,email,approval_status,enrollment_status,signup_type")
    .eq("user_id",input.userId).maybeSingle();
  if(lookupError||!member)return respond({error:"STUDENT_NOT_FOUND"},404);
  const {data:role}=await server.from("account_roles").select("role").eq("user_id",input.userId).maybeSingle();
  if(role?.role==="super_admin")return respond({error:"CANNOT_APPROVE_ADMIN"},403);
  const {data:authInfo,error:authError}=await server.auth.admin.getUserById(input.userId);
  if(authError||!authInfo?.user?.email_confirmed_at||
     authInfo.user.email?.toLowerCase()!==member.email?.toLowerCase())
   return respond({error:"EMAIL_NOT_VERIFIED"},409);
  if(input.action==="approve"){
   if(!["pending","rejected","suspended"].includes(member.approval_status))
     return respond({error:"ALREADY_APPROVED_OR_UNAVAILABLE"},409);
   const enrollment=String(input.enrollmentStatus||member.enrollment_status);
   if(!["enrolled","leave","graduated","early_employment"].includes(enrollment)||
      (member.signup_type==="alumni"&&enrollment!=="graduated"))
     return respond({error:"INVALID_ENROLLMENT"},400);
   const {error:approveError}=await actor.rpc("admin_update_student",{
    p_target_user_id:member.user_id,p_approval_status:"approved",p_enrollment_status:enrollment
   });
   if(approveError)throw approveError;
  }else if(member.approval_status!=="approved"){
   return respond({error:"NOT_APPROVED"},409);
  }

  // A unique database row and Resend idempotency key prevent accidental duplicate sends.
  const table=server.from("signup_approval_emails");
  let {data:record,error:recordError}=await table.select("*").eq("user_id",member.user_id).maybeSingle();
  if(recordError)throw recordError;
  if(!record){
   const inserted=await table.insert({user_id:member.user_id,recipient_email:member.email,
     delivery_status:"sending",attempted_at:dateNow()}).select("*").maybeSingle();
   if(inserted.error){
    // A concurrent approval may have created the record.
    const existing=await table.select("*").eq("user_id",member.user_id).maybeSingle();
    if(existing.error||!existing.data)throw inserted.error;
    record=existing.data;
   }else{
    record=inserted.data;
    // This invocation owns the newly created send claim.
    if(record)record._claimed=true;
   }
  }
  if(record?.delivery_status==="sent")
    return respond({approved:true,notificationStatus:"sent",alreadySent:true});
  if(!record?._claimed){
   const stale=record?.delivery_status==="sending" &&
     Date.now()-Date.parse(record.attempted_at)>180000;
   if(record?.delivery_status==="sending"&&!stale)
     return respond({approved:true,notificationStatus:"sending"});
   const claim=await server.from("signup_approval_emails")
     .update({delivery_status:"sending",attempted_at:dateNow(),last_error:null})
     .eq("user_id",member.user_id).eq("delivery_status",stale?"sending":"failed")
     .select("user_id");
   if(claim.error)throw claim.error;
   if(!claim.data?.length)return respond({approved:true,notificationStatus:"sending"});
  }
  const key=Deno.env.get("RESEND_API_KEY");
  try{
   if(!key)throw Error("RESEND_API_KEY_NOT_CONFIGURED");
   const message=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json",
      "Idempotency-Key":"kbigdata-signup-approval-"+member.user_id},
    body:JSON.stringify({
     from:"빅데이터소프트웨어공학과 포털 <noreply@noreply.k-bigdata.kr>",
     to:[member.email],
     subject:"[빅데이터소프트웨어공학과] 포털 가입이 승인되었습니다",
     html:emailHtml(member.full_name),
     text:member.full_name+"님, 학과 통합 포털 가입이 승인되었습니다.\nhttps://portal.k-bigdata.kr/ 에서 로그인해 주세요."
    })
   });
   const result=await message.json().catch(()=>({}));
   if(!message.ok||!result.id)throw Error("RESEND_HTTP_"+message.status);
   const saved=await server.from("signup_approval_emails").update({
     delivery_status:"sent",provider_message_id:result.id,
     sent_at:dateNow(),last_error:null
   }).eq("user_id",member.user_id);
   if(saved.error)throw saved.error;
   return respond({approved:true,notificationStatus:"sent"});
  }catch(error){
   const message=error instanceof Error?error.message:"EMAIL_SEND_FAILED";
   await server.from("signup_approval_emails").update({
     delivery_status:"failed",last_error:message.slice(0,180)
   }).eq("user_id",member.user_id);
   return respond({approved:true,notificationStatus:"failed"});
  }
 }catch(error){
  console.error("Approval operation failed",error);
  return respond({error:"APPROVAL_FAILED"},500);
 }
});
