import {createClient} from "npm:@supabase/supabase-js@2.49.10";
const url=Deno.env.get("SUPABASE_URL")!;
const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const mailKey=Deno.env.get("RESEND_API_KEY")||"";
const from=Deno.env.get("REPORT_FROM_EMAIL")||"noreply@noreply.k-bigdata.kr";
const repo="Hyeopgeon-Lee/k-bigdata-portal";
const workflow=repo+"/.github/workflows/study-absence-reminder.yml@refs/heads/main";
const audience="kbigdata-study-absence-reminder";
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const reply=(x:unknown,status=200)=>new Response(JSON.stringify(x),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
const escape=(v:unknown)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
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

const Z=9*3600000,DAY=86400000;
const dayString=(n:number)=>new Date(n).toISOString().slice(0,10);
function previousStudyDay(){
 const shifted=Date.now()+Z;
 const yesterday=Date.UTC(new Date(shifted).getUTCFullYear(),new Date(shifted).getUTCMonth(),new Date(shifted).getUTCDate()-1);
 const w=new Date(yesterday).getUTCDay();
 if(w===0||w===6)return null;
 const monday=yesterday-((w+6)%7)*DAY;
 return {date:dayString(yesterday),week:dayString(monday),weekday:w,
   start:new Date(yesterday-Z).toISOString(),end:new Date(yesterday-Z+DAY).toISOString()};
}
function mailTemplate(name:string,date:string){
 const link="https://portal.k-bigdata.kr/study-absence.html?reason="+encodeURIComponent(date);
 return '<!doctype html><html lang="ko"><body style="margin:0;padding:28px 12px;background:#f5f7fb;color:#1a2c48;font-family:system-ui,sans-serif">'+
 '<main style="max-width:580px;margin:auto;background:#fff;border:1px solid #dce3ef;border-radius:16px;overflow:hidden">'+
 '<header style="padding:24px 26px;background:#0b1739;color:#fff"><strong style="font-size:18px">빅데이터소프트웨어공학과</strong><p style="font-size:12px;margin:5px 0 0">학과 통합 포털 · 자율학습</p></header>'+
 '<div style="padding:26px"><h2 style="font-size:22px;margin:0 0 20px">자율학습 참여 확인</h2>'+
 '<p>'+escape(name)+' 학생, 안녕하세요.</p>'+
 '<p>'+escape(date)+'에 남아서 공부하기로 계획했으나, 학과 포털에 학습 시작 기록이 없습니다.</p>'+
 '<p>학습 습관 개선에 참고할 수 있도록 아래 버튼에서 간단하게 사유를 입력해 주세요. 자세한 개인 사정은 작성하지 않아도 됩니다.</p>'+
 '<p style="text-align:center;margin:30px 0"><a href="'+link+'" style="display:inline-block;padding:14px 22px;border-radius:9px;background:#142d70;color:white;text-decoration:none;font-weight:700">미참여 사유 입력</a></p>'+
 '<p style="color:#59647a;font-size:13px">버튼을 누르면 포털 로그인 후 해당 날짜의 입력 화면으로 연결됩니다. 이미 입력했다면 별도의 회신은 필요하지 않습니다.</p></div>'+
 '<footer style="padding:16px 26px;background:#f7f9fd;font-size:12px;color:#697891">한국폴리텍대학 서울강서캠퍼스 빅데이터소프트웨어공학과</footer></main></body></html>';
}
async function deliver(user:any,day:string){
 const kind="absence";
 const {data:current,error:lookupErr}=await db.from("study_email_logs")
   .select("id,status,created_at").eq("user_id",user.user_id).eq("study_date",day).eq("kind",kind).maybeSingle();
 if(lookupErr)throw lookupErr;
 let id:number;
 if(current){
  if(current.status==="sent"||(current.status==="pending"&&Date.now()-Date.parse(current.created_at)<30*60000))return "duplicate";
  const {data:claimed,error}=await db.from("study_email_logs")
   .update({status:"pending",created_at:new Date().toISOString(),error_message:null})
   .eq("id",current.id).eq("status",current.status).select("id").maybeSingle();
  if(error||!claimed)return "duplicate";
  id=claimed.id;
 }else{
  const {data:created,error}=await db.from("study_email_logs").insert({user_id:user.user_id,study_date:day,kind,status:"pending"}).select("id").single();
  if(error?.code==="23505")return "duplicate";
  if(error)throw error;id=created.id;
 }
 try{
  const response=await fetch("https://api.resend.com/emails",{method:"POST",
    headers:{"Authorization":"Bearer "+mailKey,"Content-Type":"application/json",
     "Idempotency-Key":"study-absence-"+user.user_id+"-"+day},
    body:JSON.stringify({from,to:[user.email],subject:"[학과 포털] 자율학습 참여 확인 안내 ("+day+")",html:mailTemplate(user.full_name,day)}),
    signal:AbortSignal.timeout(10000)});
  const result=await response.json().catch(()=>({}));
  if(!response.ok||!result.id)throw Error("Resend status "+response.status);
  const {error}=await db.from("study_email_logs").update({status:"sent",sent_at:new Date().toISOString(),provider_id:result.id}).eq("id",id);
  if(error)throw error;
  return "sent";
 }catch(err){
  await db.from("study_email_logs").update({status:"failed",error_message:String(err).slice(0,300)}).eq("id",id);
  return "failed";
 }
}
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return reply({error:"METHOD_NOT_ALLOWED"},405);
 const event=await githubIdentity(req);
 if(!event)return reply({error:"OIDC_NOT_AUTHORIZED"},403);
 let payload:any={};try{payload=await req.json();}catch{}
 const dryRun=payload.dry_run===true;
 if(event==="push"&&!dryRun)return reply({error:"PUSH_MUST_DRY_RUN"},403);
 const day=previousStudyDay();
 if(!day)return reply({ok:true,skipped:"weekend",dry_run:dryRun});
 try{
  const settings=await db.from("study_settings").select("enabled").eq("setting_key","absence_email").single();
  if(settings.error)throw settings.error;
  if(!settings.data?.enabled)return reply({ok:true,date:day.date,skipped:"disabled",dry_run:dryRun});
  const [plans,students,sessions,reasons]=await Promise.all([
   db.from("study_weekly_plans").select("user_id").eq("week_start",day.week).contains("weekdays",[day.weekday]),
   db.from("profiles").select("user_id,full_name,email").eq("approval_status","approved").eq("enrollment_status","enrolled").eq("signup_type","student"),
   db.from("study_sessions").select("user_id").gte("started_at",day.start).lt("started_at",day.end),
   db.from("study_absence_reasons").select("user_id").eq("study_date",day.date)
  ]);
  for(const x of [plans,students,sessions,reasons])if(x.error)throw x.error;
  const planned=new Set((plans.data||[]).map(p=>p.user_id));
  const present=new Set((sessions.data||[]).map(s=>s.user_id));
  const explained=new Set((reasons.data||[]).map(s=>s.user_id));
  const targets=(students.data||[]).filter(s=>planned.has(s.user_id)&&!present.has(s.user_id)&&!explained.has(s.user_id)&&s.email);
  if(dryRun)return reply({ok:true,dry_run:true,date:day.date,planned:planned.size,present:present.size,
    pending:targets.length,mailConfigured:!!mailKey});
  if(!mailKey)return reply({error:"RESEND_API_KEY_NOT_CONFIGURED"},503);
  const counts={sent:0,failed:0,duplicate:0};
  for(const user of targets){const result=await deliver(user,day.date);counts[result as keyof typeof counts]++;}
  return reply({ok:true,date:day.date,counts});
 }catch(err){console.error("study absence mail",err);return reply({error:"REMINDER_FAILED"},500);}
});
