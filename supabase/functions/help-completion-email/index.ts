import {createClient} from "npm:@supabase/supabase-js@2.49.10";
import { renderPortalMail, mailParagraph, mailDetails, mailCallout } from "../_shared/portal-mail.mjs";

const origin="https://portal.k-bigdata.kr";
const cors={
 "Access-Control-Allow-Origin":origin,
 "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
 "Access-Control-Allow-Methods":"POST, OPTIONS",
 "Content-Type":"application/json",
 "Cache-Control":"no-store",
 "Vary":"Origin"
};
const send=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:cors});
const env=(name:string)=>Deno.env.get(name)||"";
const url=env("SUPABASE_URL");
const service=createClient(url,env("SUPABASE_SERVICE_ROLE_KEY"),{
 auth:{persistSession:false,autoRefreshToken:false}
});
const escape=(value:unknown)=>String(value??"").replace(/[&<>"']/g,char=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[char]||char));
const requestPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Delivery={
 id:string;request_id:string;recipient_id:string;request_title:string;result_text:string;
 status:"pending"|"sending"|"sent"|"failed"|"skipped";
 attempts:number;attempted_at:string|null;created_at:string;sent_at:string|null;last_error:string|null
};
const label=(status:string)=>({pending:"queued",sending:"sending",sent:"sent",failed:"failed",skipped:"skipped"}[status]||"unknown");
function formatMail(name:string,title:string,result:string,completedAt:string){
 const finished=new Date(completedAt).toLocaleString("ko-KR",{timeZone:"Asia/Seoul"});
 const href="https://portal.k-bigdata.kr/help.html";
 const heading="학과 요청 처리 결과 안내";
 const html=renderPortalMail({kind:"help",title:heading,category:"처리 완료",
  bodyHtml:mailParagraph(name+"님, 등록하신 학과 요청이 완료 처리되었습니다.")+mailDetails([["요청 제목",title],["처리 상태","완료"],["처리 일시",finished]],"help")+mailCallout(result,"help","관리자 처리 결과"),
  actions:[{href,label:"내 요청 내역 확인하기"}],footerNote:"이 메일은 학과 요청 완료 결과를 안내합니다. 추가 문의는 포털의 학과 요청 메뉴에서 등록해 주세요."});
 const text=heading+"\n"+name+"님, 등록하신 학과 요청이 완료 처리되었습니다.\n\n"+
  "요청 제목: "+title+"\n처리 상태: 완료\n처리 일시: "+finished+
  "\n\n관리자 처리 결과:\n"+result+"\n\n내 요청 확인: "+href;
 return {html,text};
}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 if(req.method!=="POST")return send({error:"METHOD_NOT_ALLOWED"},405);
 const incomingOrigin=req.headers.get("origin");
 if(incomingOrigin&&incomingOrigin!==origin)return send({error:"ORIGIN_NOT_ALLOWED"},403);
 const jwt=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
 if(!jwt)return send({error:"LOGIN_REQUIRED"},401);
 const actor=createClient(url,env("SUPABASE_ANON_KEY"),{
  global:{headers:{Authorization:"Bearer "+jwt}},
  auth:{persistSession:false,autoRefreshToken:false}
 });
 const {data:who,error:userError}=await actor.auth.getUser(jwt);
 if(userError||!who.user)return send({error:"LOGIN_REQUIRED"},401);
 const {data:isAdmin,error:roleError}=await actor.rpc("portal_super_admin_allowed");
 if(roleError||isAdmin!==true)return send({error:"ADMIN_REQUIRED"},403);

 let body:{action?:string;request_id?:unknown};
 try{body=await req.json();}catch{return send({error:"INVALID_JSON"},400);}
 const action=body?.action||"send";
 if(!["status","send"].includes(action)||typeof body?.request_id!=="string"||!requestPattern.test(body.request_id))
   return send({error:"INVALID_REQUEST"},400);
 const requestId=body.request_id;
 try{
  const {data:rows,error:rowError}=await service.from("help_completion_email_deliveries")
   .select("id,request_id,recipient_id,request_title,result_text,status,attempts,attempted_at,created_at,sent_at,last_error")
   .eq("request_id",requestId).order("created_at",{ascending:false}).limit(1);
  if(rowError)throw rowError;
  const row=(rows?.[0]||null) as Delivery|null;
  if(!row)return send({ok:true,mailStatus:"not_queued"});
  if(action==="status")return send({ok:true,mailStatus:label(row.status),sentAt:row.sent_at});
  if(row.status==="sent")return send({ok:true,mailStatus:"sent",alreadySent:true,sentAt:row.sent_at});
  if(row.status==="skipped")return send({ok:true,mailStatus:"skipped"});
  const {data:ticket,error:ticketError}=await service.from("help_requests")
   .select("id,status,owner_id,updated_at")
   .eq("id",requestId).maybeSingle();
  if(ticketError)throw ticketError;
  if(!ticket||ticket.status!=="COMPLETED"||ticket.owner_id!==row.recipient_id){
   await service.from("help_completion_email_deliveries").update({
    status:"skipped",last_error:"REQUEST_NOT_COMPLETED"
   }).eq("id",row.id).in("status",["pending","failed"]);
   return send({ok:true,mailStatus:"skipped"});
  }
  // An in-flight request must not trigger another provider call.
  if(row.status==="sending"&&row.attempted_at&&Date.now()-Date.parse(row.attempted_at)<300000)
   return send({ok:true,mailStatus:"sending"});
  // CAS claim: concurrent admin clicks cannot start two sends.
  const attemptNumber=row.attempts+1;
  const {data:claimed,error:claimError}=await service.from("help_completion_email_deliveries")
   .update({status:"sending",attempts:attemptNumber,attempted_at:new Date().toISOString(),last_error:null})
   .eq("id",row.id).eq("status",row.status).eq("attempts",row.attempts).select("id").maybeSingle();
  if(claimError)throw claimError;
  if(!claimed)return send({ok:true,mailStatus:"sending"});
  try{
   const {data:recipient,error:recipientError}=await service.auth.admin.getUserById(row.recipient_id);
   if(recipientError)throw Error("RECIPIENT_LOOKUP_FAILED");
   const confirmed=recipient?.user?.email_confirmed_at;
   const email=recipient?.user?.email;
   if(!email||!confirmed)throw Error("RECIPIENT_EMAIL_NOT_VERIFIED");
   const {data:profile,error:profileError}=await service.from("profiles")
    .select("full_name").eq("user_id",row.recipient_id).maybeSingle();
   if(profileError)throw Error("RECIPIENT_PROFILE_FAILED");
   const resendKey=env("RESEND_API_KEY");
   if(!resendKey)throw Error("RESEND_API_KEY_NOT_CONFIGURED");
   const sender=env("REPORT_FROM_EMAIL")||"noreply@noreply.k-bigdata.kr";
   const contents=formatMail(profile?.full_name||"학생",row.request_title,row.result_text,row.created_at);
   const subject="[빅데이터SW학과] 학과 요청 처리 완료 - "+row.request_title.replace(/[\r\n]+/g," ").slice(0,65);
   const response=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{
     "Authorization":"Bearer "+resendKey,
     "Content-Type":"application/json",
     "Idempotency-Key":"kbigdata-help-completed-"+row.id
    },
    body:JSON.stringify({
     from:"빅데이터소프트웨어공학과 <"+sender+">",
     to:[email],
     subject,
     ...contents
    })
   });
   const provider=await response.json().catch(()=>({}));
   if(!response.ok||typeof provider?.id!=="string")throw Error("RESEND_HTTP_"+response.status);
   const {error:savedError}=await service.from("help_completion_email_deliveries")
    .update({status:"sent",sent_at:new Date().toISOString(),provider_message_id:provider.id,last_error:null})
    .eq("id",row.id).eq("status","sending").eq("attempts",attemptNumber);
   if(savedError)throw savedError;
   return send({ok:true,mailStatus:"sent"});
  }catch(error){
   const code=(error instanceof Error?error.message:"MAIL_DELIVERY_FAILED").slice(0,180);
   console.error("Help completion email failed:",code);
   await service.from("help_completion_email_deliveries")
    .update({status:"failed",last_error:code})
    .eq("id",row.id).eq("status","sending").eq("attempts",attemptNumber);
   return send({ok:true,mailStatus:"failed"});
  }
 }catch(error){
  console.error("Help completion notification unavailable",error);
  return send({error:"HELP_MAIL_UNAVAILABLE"},500);
 }
});
