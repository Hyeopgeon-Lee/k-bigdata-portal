/* Preserve portal authentication on the embedded Alumni Network pages.
 * Supabase Edge Functions now enforce member ownership and administrator permissions.
 * Legacy PINs are retired and no longer control account access.
 */
import {createClient} from "https://esm.sh/@supabase/supabase-js@2.119.0?bundle";

const ui=document.getElementById("alumni-portal-gate");
const message=document.getElementById("alumni-portal-gate-text");
const client=createClient(
  "https://zjsindkakjfzmjgrkaou.supabase.co",
  "sb_publishable_g8oFA9J2ZFiBc-86wa2Pew_7DzoCZab",
  {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,
    storageKey:"kbigdata-portal-auth-v1"}}
);
window.alumniPortalClient=client;
function block(reason){
 document.documentElement.dataset.alumniPortalAuth="blocked";
 if(message)message.textContent=reason;
 if(ui)ui.hidden=false;
}
async function authorize(){
 try{
  const {data:{user},error:userError}=await client.auth.getUser();
  if(userError||!user){block("학과 통합 포털 로그인이 필요합니다.");return;}
  // Bind the current verified Auth session to a non-revoked portal session.
  const {error:sessionError}=await client.rpc("start_portal_session");
  if(sessionError){block("포털 계정이 승인되었는지 확인한 후 다시 로그인해 주세요.");return;}
  const {data:access,error:accessError}=await client.rpc("portal_learning_access");
  if(accessError||access?.read!==true){block("포털 계정 이용 권한을 확인하지 못했습니다.");return;}
  const {data:profile,error:profileError}=await client.from("profiles")
   .select("full_name,signup_type,approval_status,alumni_source_id,graduation_year")
   .eq("user_id",user.id).single();
  if(profileError||profile?.approval_status!=="approved"){
   block("승인된 포털 회원만 졸업생 네트워크를 이용할 수 있습니다.");return;
  }
  const label=document.getElementById("alumni-portal-member");
  if(label)label.textContent=profile.full_name||"이름 미등록";
  const sourceId=profile.signup_type==="alumni"?profile.alumni_source_id:null;
  if(sourceId){
   for(const selector of ["#lookup-id","#job-alumni-id","#news-alumni-id"]){
    const field=document.querySelector(selector);
    if(field&&!field.value)field.value=sourceId;
   }
  }
  // Expose only self identity, never stored PINs, contact details or service keys.
  window.alumniPortalMember={name:profile.full_name||"",email:user.email||"",
   graduationYear:profile.graduation_year||null,alumniId:sourceId||null};
  document.documentElement.dataset.alumniPortalAuth="approved";
  if(ui)ui.hidden=true;
 }catch(error){
  console.error("Alumni portal bridge unavailable",error?.code||"unknown");
  block("포털 인증 상태를 확인할 수 없습니다. 다시 로그인해 주세요.");
 }
}
window.alumniPortalReady=authorize();
await window.alumniPortalReady;
document.addEventListener("visibilitychange",()=>{
 if(!document.hidden&&document.documentElement.dataset.alumniPortalAuth==="approved"){
  client.auth.getUser().then(({data,error})=>{if(error||!data.user)block("포털 로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");})
   .catch(()=>block("포털 로그인을 확인하지 못했습니다."));
 }
});
