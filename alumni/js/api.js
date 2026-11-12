/* All Alumni Network read and write actions go to Supabase, never to Google Sheets or Apps Script. */
(function(){
 "use strict";
 const config=Object.freeze({
  endpoint:"https://zjsindkakjfzmjgrkaou.supabase.co/functions/v1/alumni-network-api",
  apiUrl:"https://zjsindkakjfzmjgrkaou.supabase.co",
  publishable:"sb_publishable_g8oFA9J2ZFiBc-86wa2Pew_7DzoCZab"
 });
 let clientPromise;
 async function getClient(){
  if(window.alumniPortalClient)return window.alumniPortalClient;
  if(!clientPromise)clientPromise=import("https://esm.sh/@supabase/supabase-js@2.119.0?bundle")
   .then(({createClient})=>createClient(config.apiUrl,config.publishable,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:"kbigdata-portal-auth-v1"}
   }));
  return clientPromise;
 }
 const configured=()=>true;
 async function request(action,options={}){
  const client=await getClient();
  // Independently enforce an authenticated session on every call.
  const {data:{session},error:sessionError}=await client.auth.getSession();
  if(sessionError||!session?.access_token)throw Error("포털 로그인이 필요합니다. 통합 포털에서 로그인해 주세요.");
  if(window.alumniPortalReady){
   await window.alumniPortalReady;
   if(document.documentElement.dataset.alumniPortalAuth!=="approved")
    throw Error("승인된 포털 계정으로 로그인해 주세요.");
  }
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),30000);
  try{
   const response=await fetch(config.endpoint,{
    method:"POST",
    headers:{"Authorization":"Bearer "+session.access_token,
     "apikey":config.publishable,"Content-Type":"application/json"},
    body:JSON.stringify({action,data:options.method==="POST"?(options.data||{}):(options.params||{})}),
    signal:controller.signal,credentials:"omit"
   });
   const result=await response.json().catch(()=>({success:false,message:"서버 응답을 확인할 수 없습니다."}));
   if(!response.ok||result.success!==true)
    throw Error(result.message||"졸업생 네트워크 요청에 실패했습니다.");
   return result;
  }catch(error){
   if(error?.name==="AbortError")throw Error("요청 처리 시간이 초과됐습니다. 다시 시도해 주세요.");
   throw error;
  }finally{clearTimeout(timeout);}
 }
 window.AlumniAPI={request,configured};
})();
