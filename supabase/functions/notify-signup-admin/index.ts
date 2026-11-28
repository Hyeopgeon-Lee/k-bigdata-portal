import {createClient} from "npm:@supabase/supabase-js@2.49.10";
import { renderPortalMail, mailParagraph, mailDetails } from "../_shared/portal-mail.mjs";

// Mail notification is server-only. A verified applicant may notify only about
// their own pending account; only the existing super administrator can alter settings.
const origin="https://portal.k-bigdata.kr";
const headers={
  "Access-Control-Allow-Origin":origin,
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Content-Type":"application/json",
  "Vary":"Origin"
};
const respond=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers});
const service=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{
  auth:{persistSession:false,autoRefreshToken:false}
});
const safe=(value:unknown)=>String(value??"").replace(/[&<>"']/g,part=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[part]||part));
const settingsTable="signup_admin_notification_settings";
const deliveryTable="signup_admin_notification_deliveries";
const recipient="hglee67@kopo.ac.kr";

type PendingMember={
  user_id:string;full_name:string;email:string;student_no:string|null;
  academic_year:number|null;graduation_year:number|null;
  signup_type:string;approval_status:string;created_at:string
};
function mailContent(member:PendingMember){
  const type=member.signup_type==="alumni"?"졸업생":"재학생";
  const detail=member.signup_type==="alumni"
    ? "졸업연도 · "+String(member.graduation_year??"")+"년"
    : "학년 · "+String(member.academic_year??"")+"학년 / 학번 · "+String(member.student_no||"-");
  const requested=new Date(member.created_at).toLocaleString("ko-KR",{timeZone:"Asia/Seoul"});
  const link="https://portal.k-bigdata.kr/admin/accounts.html?view=approvals&approve="+encodeURIComponent(member.user_id);
  const html=renderPortalMail({kind:"approval",title:"새로운 회원가입 요청이 있습니다.",category:"관리자 가입 승인 요청",
   bodyHtml:mailParagraph("이메일 인증을 완료한 회원의 가입을 검토해 주세요.")+mailDetails([["가입 유형",type],["이름",member.full_name],["가입 정보",detail],["이메일",member.email],["인증 여부","이메일 인증 완료"],["신청일시",requested]],"approval"),
   actions:[{href:link,label:"가입 승인하기"}],footerNote:"보안을 위해 관리자 로그인 후 해당 회원의 승인 버튼을 직접 눌러 확정해야 합니다. 링크를 열기만 해서는 승인되지 않습니다."});
  const text=type+" "+member.full_name+"님의 가입 요청이 접수되었습니다.\n"+detail.replaceAll(" · "," / ")+
    "\n이메일: "+member.email+"\n이메일 인증 완료\n신청일시: "+requested+
    "\n\n관리자 로그인 후 가입 승인하기: "+link;
  return {html,text};
}
Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
  if(req.method!=="POST")return respond({error:"METHOD_NOT_ALLOWED"},405);
  const requestOrigin=req.headers.get("origin");
  if(requestOrigin&&requestOrigin!==origin)return respond({error:"ORIGIN_NOT_ALLOWED"},403);
  const jwt=req.headers.get("authorization")?.replace(/^Bearer /i,"");
  if(!jwt)return respond({error:"UNAUTHORIZED"},401);
  const actor=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{
    global:{headers:{Authorization:"Bearer "+jwt}},
    auth:{persistSession:false,autoRefreshToken:false}
  });
  const {data:identity,error:userError}=await actor.auth.getUser(jwt);
  if(userError||!identity.user)return respond({error:"UNAUTHORIZED"},401);
  let input:{action?:string;enabled?:unknown};
  try{input=await req.json();}catch{return respond({error:"INVALID_JSON"},400);}
  try{
    if(input.action==="settings"||input.action==="set_settings"){
      // Both checks are required, not merely the JWT authenticated role.
      if(identity.user.email?.toLowerCase()!==recipient)
        return respond({error:"ADMIN_NOT_AUTHORIZED"},403);
      const {data:isSuper,error:roleError}=await actor.rpc("portal_super_admin_allowed");
      if(roleError||isSuper!==true)return respond({error:"ADMIN_NOT_AUTHORIZED"},403);
      const {data:before,error:settingsError}=await service.from(settingsTable)
        .select("enabled,updated_at").eq("setting_key","new_signup").single();
      if(settingsError||!before)throw settingsError||Error("SETTINGS_MISSING");
      if(input.action==="settings")return respond({ok:true,enabled:before.enabled,updatedAt:before.updated_at});
      if(typeof input.enabled!=="boolean")return respond({error:"INVALID_SETTING"},400);
      if(input.enabled===before.enabled)
        return respond({ok:true,enabled:before.enabled,updatedAt:before.updated_at});
      const {data:saved,error:saveError}=await service.from(settingsTable)
        .update({enabled:input.enabled,updated_at:new Date().toISOString(),updated_by:identity.user.id})
        .eq("setting_key","new_signup").select("enabled,updated_at").single();
      if(saveError||!saved)throw saveError||Error("SETTINGS_SAVE_FAILED");
      const {error:auditError}=await service.from("signup_admin_notification_setting_events")
        .insert({enabled:input.enabled,actor_user_id:identity.user.id});
      if(auditError)console.error("Notification setting audit failed",auditError);
      return respond({ok:true,enabled:saved.enabled,updatedAt:saved.updated_at});
    }
    if(input.action!=="notify")return respond({error:"INVALID_ACTION"},400);
    if(!identity.user.email_confirmed_at)return respond({error:"EMAIL_NOT_VERIFIED"},403);
    const {data:member,error:memberError}=await service.from("profiles")
      .select("user_id,full_name,email,student_no,academic_year,graduation_year,signup_type,approval_status,created_at")
      .eq("user_id",identity.user.id).maybeSingle();
    if(memberError)throw memberError;
    if(!member||member.approval_status!=="pending"||
        !["student","alumni"].includes(member.signup_type)||
        member.email?.toLowerCase()!==identity.user.email?.toLowerCase())
      return respond({error:"NO_VERIFIED_PENDING_SIGNUP"},403);
    const {data:setting,error:settingError}=await service.from(settingsTable)
      .select("enabled").eq("setting_key","new_signup").single();
    if(settingError||!setting)throw settingError||Error("SETTINGS_MISSING");
    if(setting.enabled!==true)return respond({ok:true,notificationStatus:"disabled"});
    const table=service.from(deliveryTable);
    let {data:record,error:readError}=await table.select("*").eq("user_id",member.user_id).maybeSingle();
    if(readError)throw readError;
    let claimed=false;
    if(!record){
      const inserted=await table.insert({
        user_id:member.user_id,recipient_email:recipient,
        delivery_status:"sending",attempted_at:new Date().toISOString()
      }).select("*").maybeSingle();
      if(!inserted.error&&inserted.data){record=inserted.data;claimed=true;}
      else{
        // Another request may have inserted the same unique user ID.
        const existing=await table.select("*").eq("user_id",member.user_id).maybeSingle();
        if(existing.error||!existing.data)throw inserted.error||existing.error;
        record=existing.data;
      }
    }
    if(record.delivery_status==="sent")return respond({ok:true,notificationStatus:"sent",alreadySent:true});
    if(!claimed){
      const age=Date.now()-Date.parse(record.attempted_at);
      if(record.delivery_status==="sending"&&age<180000)
        return respond({ok:true,notificationStatus:"sending"});
      if(record.delivery_status==="failed"&&age<300000)
        return respond({ok:true,notificationStatus:"failed",retryLater:true});
      const {data:claimedRows,error:claimError}=await service.from(deliveryTable)
        .update({delivery_status:"sending",attempted_at:new Date().toISOString(),last_error:null})
        .eq("user_id",member.user_id).eq("delivery_status",record.delivery_status)
        .eq("attempted_at",record.attempted_at).select("user_id");
      if(claimError)throw claimError;
      if(!claimedRows?.length)return respond({ok:true,notificationStatus:"sending"});
    }
    const key=Deno.env.get("RESEND_API_KEY");
    try{
      if(!key)throw Error("RESEND_API_KEY_NOT_CONFIGURED");
      const {html,text}=mailContent(member as PendingMember);
      const result=await fetch("https://api.resend.com/emails",{
        method:"POST",
        headers:{
          "Authorization":"Bearer "+key,
          "Content-Type":"application/json",
          "Idempotency-Key":"kbigdata-admin-new-signup-"+member.user_id
        },
        body:JSON.stringify({
          from:"빅데이터소프트웨어공학과 포털 <noreply@noreply.k-bigdata.kr>",
          to:[recipient],
          subject:"[학과 포털] 신규 회원가입 승인 요청 - "+member.full_name,
          html,text
        })
      });
      const delivery=await result.json().catch(()=>({}));
      if(!result.ok||!delivery.id)throw Error("RESEND_HTTP_"+result.status);
      const {error:writeError}=await service.from(deliveryTable).update({
        delivery_status:"sent",provider_message_id:delivery.id,
        sent_at:new Date().toISOString(),last_error:null
      }).eq("user_id",member.user_id);
      if(writeError)throw writeError;
      return respond({ok:true,notificationStatus:"sent"});
    }catch(error){
      const message=error instanceof Error?error.message:"MAIL_SEND_FAILED";
      console.error("Admin signup mail delivery failed:",message);
      await service.from(deliveryTable).update({
        delivery_status:"failed",last_error:message.slice(0,180)
      }).eq("user_id",member.user_id);
      return respond({ok:true,notificationStatus:"failed"});
    }
  }catch(error){
    console.error("Signup notification request failed",error);
    return respond({error:"NOTIFICATION_UNAVAILABLE"},500);
  }
});
