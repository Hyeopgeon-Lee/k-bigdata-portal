import {createClient} from "npm:@supabase/supabase-js@2.49.10";
export const url=Deno.env.get("SUPABASE_URL")!;
const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anon=Deno.env.get("SUPABASE_ANON_KEY")!;
export const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
export const allowOrigin="https://portal.k-bigdata.kr";
export const respond=(obj:unknown,status=200)=>new Response(JSON.stringify(obj),{status,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":allowOrigin,"Vary":"Origin","Cache-Control":"no-store"}});
export const cors={"Access-Control-Allow-Origin":allowOrigin,"Access-Control-Allow-Headers":"authorization,apikey,x-client-info,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"};
export type Caller={id:string;email:string;name:string;signup_type:string;source_id:string|null;admin:boolean};
export type RecordRow={source_id:string;data:Record<string,any>};
export const trim=(v:unknown,max=300)=>String(v??"").trim().slice(0,max);
export const yes=(v:unknown)=>v===true||String(v).toLowerCase()==="true";
export const list=(v:unknown)=>Array.isArray(v)?v.map(x=>trim(x,100)).filter(Boolean):String(v??"").split("|").map(x=>trim(x,100)).filter(Boolean);
export const maskName=(value:unknown)=>{const n=trim(value,80);return n?n[0]+"○".repeat(Math.max(1,n.length-1)):"";};
export const escape=(v:unknown)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
export const now=()=>new Date().toISOString();
export const makeId=(kind:string)=>kind+"-"+new Date().toISOString().slice(0,10).replace(/-/g,"")+ "-" +crypto.randomUUID().slice(0,8).toUpperCase();
export const allowedKinds=["alumni","jobs","alumni_news","contact_requests","job_mail_logs","alumni_news_mail_logs","alumni_consent_logs","career_consent_invites","alumni_news_consent_invites","admins","logs","pin_reset_requests"];
export async function caller(req:Request):Promise<Caller>{
 const header=req.headers.get("Authorization")||"";
 if(!/^Bearer \S+$/.test(header))throw Error("포털 로그인이 필요합니다.");
 const token=header.slice(7);
 const {data:auth,error:authError}=await db.auth.getUser(token);
 if(authError||!auth.user?.id||!auth.user.email_confirmed_at)throw Error("로그인 인증을 확인할 수 없습니다.");
 const client=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:header}}});
 const {data:access,error:accessError}=await client.rpc("portal_learning_access");
 if(accessError||access?.read!==true)throw Error("승인된 포털 세션이 필요합니다.");
 const {data:p,error:pe}=await db.from("profiles").select("full_name,email,signup_type,approval_status,enrollment_status,alumni_source_id").eq("user_id",auth.user.id).single();
 if(pe||!p||p.approval_status!=="approved")throw Error("승인되지 않은 계정입니다.");
 const {data:isAdmin,error:adminError}=await client.rpc("portal_super_admin_allowed");
 if(adminError)throw Error("포털 관리 권한을 확인하지 못했습니다.");
 return {id:auth.user.id,email:String(auth.user.email||"").toLowerCase(),name:p.full_name,
 signup_type:p.signup_type,source_id:p.alumni_source_id||null,admin:isAdmin===true};
}
export function requireAdmin(u:Caller){if(!u.admin)throw Error("관리자 권한이 필요합니다.");}
export function requireOwner(u:Caller,id?:unknown){
 if(u.signup_type!=="alumni"||!u.source_id||id&&String(id)!==u.source_id)
 throw Error("본인 졸업생 계정으로 로그인해 주세요.");
 return u.source_id;
}
export async function all(kind:string):Promise<RecordRow[]>{
 if(!allowedKinds.includes(kind))throw Error("지원하지 않는 자료입니다.");
 const {data,error}=await db.from("alumni_network_records").select("source_id,data").eq("source_kind",kind).limit(1000);
 if(error)throw Error("자료를 불러오지 못했습니다.");
 return(data||[])as RecordRow[];
}
export async function one(kind:string,id:string):Promise<RecordRow|null>{
 if(!allowedKinds.includes(kind)||!id||id.length>120)return null;
 const {data,error}=await db.from("alumni_network_records").select("source_id,data").eq("source_kind",kind).eq("source_id",id).maybeSingle();
 if(error)throw Error("자료 조회에 실패했습니다.");
 return(data||null)as RecordRow|null;
}
export async function store(kind:string,id:string,data:Record<string,any>):Promise<void>{
 if(!allowedKinds.includes(kind)||!id||id.length>120)throw Error("잘못된 저장 요청입니다.");
 const {error}=await db.from("alumni_network_records").upsert({
  source_kind:kind,source_id:id,data,updated_at:now()
 },{onConflict:"source_kind,source_id"});
 if(error)throw Error("자료 저장에 실패했습니다.");
}
export const fields=["alumni_id","name","graduation_year","employment_status","company","job","company_url","employment_year","job_description","skills","bachelor_status","bachelor_school","bachelor_major","bachelor_year","graduate_status","graduate_school_type","graduate_school","graduate_major","graduate_degree","graduate_entry_year","graduate_graduation_year","research_fields","mentoring_topics","introduction","message_to_juniors","contact_allowed","updated_at"];
export function publicAlumni(raw:Record<string,any>){
 const result:Record<string,any>={};
 for(const k of fields){const v=raw[k];result[k]=["skills","research_fields","mentoring_topics"].includes(k)?list(v):k==="contact_allowed"?yes(v):v??"";}
 if(!result.contact_allowed){delete result.mentoring_topics;delete result.message_to_juniors;}
 return result;
}
export const activeJob=(j:Record<string,any>)=>j.status==="APPROVED"&&(yes(j.always_open)||!j.deadline||String(j.deadline).slice(0,10)>=new Date(Date.now()+9*3600000).toISOString().slice(0,10));
export const newsLabels:Record<string,string>={EMPLOYMENT:"취업",JOB_CHANGE:"이직",PROMOTION:"승진·보직",STARTUP:"창업",GRADUATE_SCHOOL:"대학원·학위",ACHIEVEMENT:"수상·성과",MARRIAGE:"결혼",BIRTH_SON:"득남",BIRTH_DAUGHTER:"득녀",OBITUARY:"부고",OTHER:"기타"};
export function publicJob(j:Record<string,any>,a:Record<string,any>){
 return {job_id:j.job_id,alumni_id:j.alumni_id,company:trim(j.company,100),job_title:trim(j.job_title,100),
 recruit_type:j.recruit_type||"",employment_type:j.employment_type||"",location:j.location||"",
 job_url:j.job_url||"",deadline:String(j.deadline||"").slice(0,10),always_open:yes(j.always_open),
 skills:list(j.skills),alumni_comment:j.alumni_comment||"",referral_available:yes(j.referral_available),
 contact_allowed:yes(j.contact_allowed)&&yes(a.contact_allowed),created_at:j.created_at||"",
 alumni_name:maskName(a.name),graduation_year:String(a.graduation_year||""),alumni_job:a.job||""};
}
export function publicNews(n:Record<string,any>,a:Record<string,any>){
 const result:Record<string,any>={news_id:n.news_id,alumni_id:n.alumni_id,name:a.name||"",graduation_year:String(a.graduation_year||""),
 news_type:n.news_type,news_type_label:newsLabels[n.news_type]||"기타",created_at:n.created_at||""};
 for(const k of ["title","content","company","job_title","organization","position_title","school_name","degree_or_program","event_date","location","relationship","external_url"])
 result[k]=n[k]||"";
 return result;
}
export async function notifyAdmin(subject:string,body:string,eventId:string){
 const {data,error}=await db.from("profiles").select("email").eq("signup_type","staff").eq("approval_status","approved").limit(1);
 if(error||!data?.length)return;
 await sendMail("admin_notice","logs",eventId,data[0].email,subject,body);
}
export async function sendMail(eventType:string,kind:string,id:string,to:string,subject:string,html:string){
 const key=Deno.env.get("RESEND_API_KEY")||"";
 if(!key)return {status:"NOT_CONFIGURED"};
 const {data:existing,error:look}=await db.from("alumni_network_mail_outbox").select("id,status")
  .eq("event_type",eventType).eq("record_kind",kind).eq("record_id",id).eq("recipient",to).maybeSingle();
 if(look)throw Error("메일 기록 조회 실패");
 if(existing?.status==="sent"||existing?.status==="sending")return {status:existing.status};
 if(!existing){
  const {error}=await db.from("alumni_network_mail_outbox").insert({event_type:eventType,record_kind:kind,record_id:id,recipient:to,subject,html});
  if(error&&error.code!=="23505")throw Error("메일 발송 대기 기록 실패");
 }
 const {data:claim,error:ce}=await db.from("alumni_network_mail_outbox").update({status:"sending"})
 .eq("event_type",eventType).eq("record_kind",kind).eq("record_id",id).eq("recipient",to).in("status",["pending","failed"]).select("id").maybeSingle();
 if(ce)throw Error("메일 중복 발송 방지 실패");
 if(!claim)return {status:"ALREADY_PROCESSING"};
 try{
  const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},
   body:JSON.stringify({from:Deno.env.get("REPORT_FROM_EMAIL")||"noreply@noreply.k-bigdata.kr",to:[to],subject,html})});
  if(!r.ok)throw Error("MAIL_PROVIDER_FAILED_"+r.status);
  const json=await r.json();
  await db.from("alumni_network_mail_outbox").update({status:"sent",provider_id:json.id||null,sent_at:now(),error_message:null}).eq("id",claim.id);
  return{status:"SENT"};
 }catch(e){
  await db.from("alumni_network_mail_outbox").update({status:"failed",error_message:String((e as Error).message).slice(0,150)}).eq("id",claim.id);
  return{status:"FAILED"};
 }
}
