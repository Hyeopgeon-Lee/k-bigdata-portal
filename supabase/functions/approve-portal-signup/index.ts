import {createClient} from "npm:@supabase/supabase-js@2.49.10";

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
 const safe=escaped(name);
 return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>포털 가입 승인 안내</title></head><body style="margin:0;padding:0;background:#f3f6fb;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;color:#1d304f">'+
 '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f6fb"><tr><td align="center" style="padding:38px 16px">'+
 '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #e3eaf4">'+
 '<tr><td style="padding:28px 32px;background:#16386f;color:#fff">'+
 '<div style="font-size:12px;letter-spacing:1.5px;font-weight:700;color:#b9cff4">K-BIGDATA STUDENT PORTAL</div>'+
 '<div style="margin-top:9px;font-size:19px;line-height:1.5;font-weight:800">빅데이터소프트웨어공학과</div></td></tr>'+
 '<tr><td style="padding:34px 32px 24px">'+
 '<div style="display:inline-block;border-radius:30px;background:#e9f7ee;color:#24754a;padding:8px 13px;font-weight:800;font-size:13px">✓ 가입 승인 완료</div>'+
 '<h1 style="font-size:27px;line-height:1.4;color:#172d50;margin:22px 0 15px;letter-spacing:-.5px">포털 가입이<br>승인되었습니다.</h1>'+
 '<p style="font-size:16px;line-height:1.85;color:#41536c;margin:0 0 14px"><strong style="color:#172d50">'+safe+'</strong>님, 안녕하세요.<br>학과 통합 포털 가입이 승인되었습니다. 이제 가입한 이메일과 비밀번호로 로그인하여 학습 서비스를 이용하실 수 있습니다.</p>'+
 '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:29px 0 26px"><tr><td bgcolor="#2159b9" style="border-radius:11px">'+
 '<a href="https://portal.k-bigdata.kr/" style="display:inline-block;padding:15px 31px;text-decoration:none;color:#ffffff;font-size:16px;font-weight:800">포털 로그인하기 →</a>'+
 '</td></tr></table>'+
 '<div style="border-radius:14px;background:#f4f7fc;border:1px solid #e3ebf6;padding:19px 20px">'+
 '<p style="font-size:14px;font-weight:800;color:#203a61;margin:0 0 10px">포털에서 이용할 수 있어요</p>'+
 '<p style="font-size:14px;line-height:1.9;color:#465b77;margin:0">• 정보처리·NCP 기출문제 및 기초 코딩 학습<br>• 문제 풀이 기록과 오답 복습<br>• 개인 학습현황 및 학과 서비스</p>'+
 '</div>'+
 '<p style="font-size:13px;line-height:1.8;color:#728097;margin:23px 0 0">본인이 신청한 가입이 아니라면 이 메일을 무시하고 학과 관리자에게 문의해 주세요.</p>'+
 '</td></tr><tr><td style="background:#f9fbfe;border-top:1px solid #e7edf6;padding:20px 32px;font-size:12px;line-height:1.8;color:#8390a4">'+
 '한국폴리텍대학 서울강서캠퍼스<br>빅데이터소프트웨어공학과 통합 포털<br>'+
 '<a href="https://portal.k-bigdata.kr/" style="color:#3765a8;text-decoration:none">portal.k-bigdata.kr</a><br>'+
 '본 메일은 계정 승인 안내를 위해 자동 발송되었습니다.</td></tr></table></td></tr></table></body></html>';
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
   if(!["enrolled","leave","graduated"].includes(enrollment)||
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
