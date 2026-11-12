import {createClient} from "npm:@supabase/supabase-js@2.49.10";
const url=Deno.env.get("SUPABASE_URL")!;
const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const repo="Hyeopgeon-Lee/k-bigdata-portal";
const workflow=repo+"/.github/workflows/alumni-import.yml@refs/heads/main";
const audience="kbigdata-approved-alumni-import";
const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
const reply=(value:unknown,status=200)=>new Response(JSON.stringify(value),{
 status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}
});
function b64url(value:string){
 const normalized=value.replace(/-/g,"+").replace(/_/g,"/");
 const raw=atob(normalized+"=".repeat((4-normalized.length%4)%4));
 return Uint8Array.from(raw,c=>c.charCodeAt(0));
}
async function githubIdentity(req:Request):Promise<"schedule"|"workflow_dispatch"|"push"|null>{
 const token=req.headers.get("authorization")?.replace(/^Bearer /i,"")||"";
 if(token.length>12000||token.split(".").length!==3)return null;
 const [h,p,s]=token.split(".");
 try{
  const header=JSON.parse(new TextDecoder().decode(b64url(h)));
  const claims=JSON.parse(new TextDecoder().decode(b64url(p)));
  const now=Math.floor(Date.now()/1000);
  if(header.alg!=="RS256"||typeof header.kid!=="string"||!header.kid||
    claims.iss!=="https://token.actions.githubusercontent.com"||
    claims.aud!==audience||
    claims.repository!==repo||String(claims.repository_id)!=="1396624044"||
    claims.ref!=="refs/heads/main"||claims.workflow_ref!==workflow||
    !["schedule","workflow_dispatch","push"].includes(claims.event_name)||
    typeof claims.exp!=="number"||claims.exp<=now||
    typeof claims.nbf!=="number"||claims.nbf>now+30||
    typeof claims.iat!=="number"||claims.iat>now+30)return null;
  const keys=await fetch("https://token.actions.githubusercontent.com/.well-known/jwks",{signal:AbortSignal.timeout(6000)});
  if(!keys.ok)return null;
  const jwks=await keys.json();
  const jwk=jwks.keys?.find((x:any)=>x.kid===header.kid&&x.kty==="RSA"&&x.alg==="RS256");
  if(!jwk)return null;
  const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
  const verified=await crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,b64url(s),new TextEncoder().encode(h+"."+p));
  return verified?claims.event_name:null;
 }catch{return null;}
}


type Row={
 source_id:string;full_name:string;email:string;student_no:string|null;
 graduation_year:number;mobile_phone:string;source_status:string;import_status:string
};
function randomPassword(){
 const bytes=crypto.getRandomValues(new Uint8Array(36));
 return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
}
async function record(row:Row,status:string,userId:string|null=null,errorCode:string|null=null){
 const {error}=await admin.from("portal_alumni_import_queue")
  .update({import_status:status,target_user_id:userId,error_code:errorCode,
    imported_at:status==="imported"||status==="merged"?new Date().toISOString():null})
  .eq("source_id",row.source_id).eq("import_status","pending");
 if(error)throw Error("IMPORT_AUDIT_WRITE_FAILED");
}
async function importOne(row:Row):Promise<"created"|"merged"|"review"|"failed">{
 const kstYear=new Date(Date.now()+9*60*60*1000).getUTCFullYear();
 const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email);
 const validPhone=/^01[016789][0-9]{7,8}$/.test(row.mobile_phone);
 if(row.source_status!=="APPROVED"||row.graduation_year>kstYear||
    row.graduation_year<2000||!validEmail||!validPhone||
    !row.full_name||row.full_name.length>80||
    /(^|\.)kopo\.ac\.kr$/i.test(row.email.split("@")[1]||"")){
   await record(row,"review",null,"SOURCE_VALIDATION_FAILED");
   return "review";
 }
 try{
  const {data:matches,error:lookupError}=await admin.from("profiles")
    .select("user_id,email,full_name,signup_type,enrollment_status,approval_status,graduation_year,student_no,mobile_phone,alumni_source_id")
    .eq("email",row.email).limit(2);
  if(lookupError)throw Error("PROFILE_LOOKUP_FAILED");
  if((matches||[]).length>1){
   await record(row,"review",null,"DUPLICATE_PORTAL_EMAIL");
   return "review";
  }
  const matching=matches?.[0];
  if(matching){
   if(matching.full_name!==row.full_name||matching.signup_type!=="alumni"||
      matching.enrollment_status!=="graduated"||matching.approval_status!=="approved"||
      (matching.graduation_year!=null&&matching.graduation_year!==row.graduation_year)||
      (matching.mobile_phone&&matching.mobile_phone!==row.mobile_phone)||
      (matching.alumni_source_id&&matching.alumni_source_id!==row.source_id)){
    await record(row,"review",null,"EXISTING_ACCOUNT_MISMATCH");
    return "review";
   }
   const changes:{
    alumni_source_id:string;mobile_phone?:string;student_no?:string;graduation_year?:number
   }={alumni_source_id:row.source_id};
   if(!matching.mobile_phone)changes.mobile_phone=row.mobile_phone;
   if(!matching.student_no&&row.student_no)changes.student_no=row.student_no;
   if(matching.graduation_year==null)changes.graduation_year=row.graduation_year;
   const {error:updateError}=await admin.from("profiles").update(changes).eq("user_id",matching.user_id);
   if(updateError)throw Error("PROFILE_MERGE_FAILED");
   await record(row,"merged",matching.user_id);
   return "merged";
  }

  // Create a distinct, non-disclosed 48-character password per alumni account.
  // Alumni can choose their own password via the portal reset-password form.
  // Never use a shared default password such as 1234.
  const {data:created,error:createError}=await admin.auth.admin.createUser({
   email:row.email,
   password:randomPassword(),
   email_confirm:true,
   user_metadata:{full_name:row.full_name,signup_type:"alumni",graduation_year:row.graduation_year}
  });
  if(createError||!created?.user){
   await record(row,"review",null,"AUTH_CREATE_REQUIRES_REVIEW");
   return "review";
  }
  const uid=created.user.id;
  const {error:insertError}=await admin.from("profiles").insert({
   user_id:uid,full_name:row.full_name,email:row.email,
   signup_type:"alumni",graduation_year:row.graduation_year,
   enrollment_status:"graduated",approval_status:"approved",
   student_no:row.student_no,mobile_phone:row.mobile_phone,
   alumni_source_id:row.source_id
  });
  if(insertError){
   // Roll back a newly created Auth identity if profile creation fails.
   const {error:rollbackError}=await admin.auth.admin.deleteUser(uid);
   await record(row,rollbackError?"review":"failed",rollbackError?uid:null,
     rollbackError?"ORPHAN_AUTH_REVIEW":"PROFILE_CREATE_ROLLED_BACK");
   return rollbackError?"review":"failed";
  }
  await record(row,"imported",uid);
  return "created";
 }catch(error){
  // Do not expose emails, names, or passwords in logs or responses.
  console.error("Alumni import row failed",row.source_id,String((error as Error)?.message||"").slice(0,100));
  await record(row,"failed",null,"IMPORT_UNEXPECTED_ERROR").catch(()=>{});
  return "failed";
 }
}
Deno.serve(async(request:Request)=>{
 if(request.method!=="POST")return reply({error:"METHOD_NOT_ALLOWED"},405);
 const event=await githubIdentity(request);
 if(event!=="push"&&event!=="workflow_dispatch")
  return reply({error:"GITHUB_OIDC_NOT_AUTHORIZED"},403);
 let payload:any={};try{payload=await request.json();}catch{}
 const dryRun=payload.dry_run===true;
 const {data,error}=await admin.from("portal_alumni_import_queue")
  .select("source_id,full_name,email,student_no,graduation_year,mobile_phone,source_status,import_status")
  .eq("import_status","pending").order("source_id",{ascending:true}).limit(100);
 if(error)return reply({error:"IMPORT_QUEUE_LOOKUP_FAILED"},500);
 const roster=(data||[]) as Row[];
 if(dryRun)return reply({ok:true,dry_run:true,pending:roster.length,
  review_only:roster.filter(r=>r.graduation_year>new Date(Date.now()+9*3600000).getUTCFullYear()).length});
 const stats={created:0,merged:0,review:0,failed:0};
 for(const entry of roster){
  const result=await importOne(entry);
  stats[result]++;
 }
 return reply({ok:stats.failed===0,dry_run:false,processed:roster.length,
   stats},stats.failed?207:200);
});
