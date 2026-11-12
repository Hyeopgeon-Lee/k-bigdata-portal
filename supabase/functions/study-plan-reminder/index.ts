import {createClient} from "npm:@supabase/supabase-js@2.49.10";
const url=Deno.env.get("SUPABASE_URL")!;
const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const mailKey=Deno.env.get("RESEND_API_KEY")||"";
const from=Deno.env.get("REPORT_FROM_EMAIL")||"noreply@noreply.k-bigdata.kr";
const repo="Hyeopgeon-Lee/k-bigdata-portal";
const workflow=repo+"/.github/workflows/study-plan-reminder.yml@refs/heads/main";
const audience="kbigdata-study-plan-reminder";
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


const KST=9*3600000,DAY=86400000;
const portalLink="https://portal.k-bigdata.kr/study.html";
function currentKoreanWeek(now=Date.now()){
  const date=new Date(now+KST);
  const localMonday=Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()-((date.getUTCDay()+6)%7));
  return {week:new Date(localMonday).toISOString().slice(0,10),
    weekday:date.getUTCDay(),hour:date.getUTCHours()};
}
function mailTemplate(name:string,week:string){
 const dateLabel=week.slice(0,4)+"년 "+Number(week.slice(5,7))+"월 "+Number(week.slice(8,10))+"일";
 return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'+
 '<body style="margin:0;padding:0;background:#f1f5fa;color:#20314b;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif">'+
 '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f1f5fa"><tr><td align="center" style="padding:32px 14px">'+
 '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e0e8f2">'+
 '<tr><td style="background:#16386f;padding:29px 30px;color:#ffffff">'+
 '<div style="font-size:12px;letter-spacing:1.3px;font-weight:bold;color:#c6dbfa">K-BIGDATA STUDENT PORTAL</div>'+
 '<div style="margin-top:9px;font-size:19px;line-height:1.5;font-weight:bold">빅데이터소프트웨어공학과</div>'+
 '<div style="margin-top:5px;font-size:12px;color:#c6dbfa">한국폴리텍대학 서울강서캠퍼스</div></td></tr>'+
 '<tr><td style="padding:32px 30px 27px">'+
 '<span style="display:inline-block;padding:7px 12px;background:#eaf2ff;border-radius:30px;color:#2256a2;font-size:12px;font-weight:bold">매주 월요일 · 주간 자율학습 계획</span>'+
 '<h1 style="margin:20px 0 12px;color:#142747;font-size:25px;line-height:1.43;letter-spacing:-.5px">이번 주 자율학습 계획을<br>등록해 주세요.</h1>'+
 '<p style="margin:0 0 13px;font-size:15px;line-height:1.9;color:#435771"><strong style="color:#173b70">'+escape(name)+'</strong> 학생, 안녕하세요.<br>'+
 dateLabel+'부터 시작하는 주간 자율학습 계획이 아직 등록되지 않았습니다.</p>'+
 '<p style="margin:0;color:#435771;font-size:15px;line-height:1.85">학교에 남아 공부할 요일을 선택해 저장해 주세요. 이번 주 남아서 공부할 날이 없다면, <strong>0일 계획을 선택하고 사유를 작성</strong>하여 제출할 수 있습니다.</p>'+
 '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:28px 0"><tr><td align="center" bgcolor="#1c4ea3" style="border-radius:11px">'+
 '<a href="'+portalLink+'" style="display:block;text-decoration:none;padding:16px 14px;color:#ffffff;font-size:16px;font-weight:bold;border-radius:11px">이번 주 학습계획 등록하기 →</a>'+
 '</td></tr></table>'+
 '<p style="margin:0;color:#67768e;font-size:13px;line-height:1.8">버튼을 누르면 학과 포털 로그인 후 자율학습 계획 등록 화면으로 이동합니다. 이미 계획을 등록했다면 이 메일은 무시해 주세요.</p>'+
 '</td></tr><tr><td style="border-top:1px solid #e3eaf5;background:#f9fbff;padding:21px 30px;color:#738198;font-size:12px;line-height:1.8">'+
 '한국폴리텍대학 서울강서캠퍼스 · 빅데이터소프트웨어공학과<br>'+
 '<a href="'+portalLink+'" style="color:#3563a8;text-decoration:none">'+portalLink+'</a><br>'+
 '본 메일은 주간 학습계획 미등록자를 대상으로 자동 발송되었습니다.</td></tr></table></td></tr></table></body></html>';
}
async function hasPlan(userId:string,week:string):Promise<boolean>{
 const {data,error}=await db.from("study_weekly_plans").select("user_id")
  .eq("user_id",userId).eq("week_start",week).maybeSingle();
 if(error)throw error;
 // Including an empty weekday array: a submitted zero-day plan is still registered.
 return !!data;
}
async function deliver(student:{user_id:string,full_name:string,email:string},week:string){
 if(await hasPlan(student.user_id,week))return "registered" as const;
 const kind="plan_reminder";
 const q=db.from("study_email_logs");
 const {data:current,error:lookupError}=await q.select("id,status,created_at")
  .eq("user_id",student.user_id).eq("study_date",week).eq("kind",kind).maybeSingle();
 if(lookupError)throw lookupError;
 let id:number;
 if(current){
   if(current.status==="sent"||
     (current.status==="pending"&&Date.now()-Date.parse(current.created_at)<30*60000))return "duplicate" as const;
   const {data:claimed,error}=await q.update({status:"pending",created_at:new Date().toISOString(),error_message:null})
     .eq("id",current.id).eq("status",current.status).select("id").maybeSingle();
   if(error)throw error;
   if(!claimed)return "duplicate" as const;
   id=claimed.id;
 }else{
   const {data:created,error}=await q.insert({user_id:student.user_id,study_date:week,kind,status:"pending"})
     .select("id").single();
   if(error?.code==="23505")return "duplicate" as const;
   if(error||!created)throw error||new Error("MAIL_CLAIM_FAILED");
   id=created.id;
 }
 try{
   // Re-read after claiming: don't mail a student who just registered the plan.
   if(await hasPlan(student.user_id,week)){
     await q.delete().eq("id",id).eq("status","pending");
     return "registered" as const;
   }
   const response=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{"Authorization":"Bearer "+mailKey,"Content-Type":"application/json",
      "Idempotency-Key":"study-plan-reminder-"+student.user_id+"-"+week},
    body:JSON.stringify({
      from:"빅데이터소프트웨어공학과 포털 <"+from+">",
      to:[student.email],
      subject:"[학과 포털] 이번 주 자율학습 계획을 등록해 주세요",
      html:mailTemplate(student.full_name,week),
      text:student.full_name+" 학생, "+week+" 주간 자율학습 계획을 등록해 주세요.\n"+
       "계획 등록: "+portalLink+"\n남아서 공부하는 날이 없다면 사유와 함께 0일 계획을 제출할 수 있습니다."
    }),
    signal:AbortSignal.timeout(12000)
   });
   const result=await response.json().catch(()=>({}));
   if(!response.ok||!result.id)throw Error("RESEND_HTTP_"+response.status);
   const {error:saveError}=await q.update({status:"sent",sent_at:new Date().toISOString(),provider_id:result.id,error_message:null})
    .eq("id",id);
   if(saveError)throw saveError;
   return "sent" as const;
 }catch(error){
   await q.update({status:"failed",error_message:String(error).slice(0,300)}).eq("id",id);
   return "failed" as const;
 }
}
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return reply({error:"METHOD_NOT_ALLOWED"},405);
 const event=await githubIdentity(req);
 if(!event)return reply({error:"OIDC_NOT_AUTHORIZED"},403);
 let payload:any={};try{payload=await req.json();}catch{}
 const dryRun=payload.dry_run===true;
 // Only the Monday GitHub schedule may send real mail. Push and manual dispatch are preview-only.
 if(event!=="schedule"&&!dryRun)return reply({error:"SCHEDULE_ONLY_SENDING"},403);
 const clock=currentKoreanWeek();
 if(!dryRun&&(clock.weekday!==1||clock.hour<12))
   return reply({ok:true,skipped:"outside_monday_noon_window",week:clock.week,dry_run:false});
 try{
  const [setting,plans,students]=await Promise.all([
   db.from("study_settings").select("enabled").eq("setting_key","plan_reminder_email").single(),
   db.from("study_weekly_plans").select("user_id").eq("week_start",clock.week),
   db.from("profiles").select("user_id,full_name,email")
    .eq("signup_type","student").eq("approval_status","approved").eq("enrollment_status","enrolled")
  ]);
  for(const result of [setting,plans,students])if(result.error)throw result.error;
  if(!setting.data?.enabled)return reply({ok:true,week:clock.week,skipped:"disabled",dry_run:dryRun});
  const registered=new Set((plans.data||[]).map(item=>item.user_id));
  const eligible=(students.data||[]).filter(user=>Boolean(user.email));
  const targets=eligible.filter(user=>!registered.has(user.user_id));
  if(dryRun)return reply({ok:true,dry_run:true,week:clock.week,eligible:eligible.length,
   registered:eligible.length-targets.length,unregistered:targets.length,mailConfigured:!!mailKey});
  if(!mailKey)return reply({error:"RESEND_API_KEY_NOT_CONFIGURED"},503);
  const counts={sent:0,failed:0,duplicate:0,registered:0};
  for(let start=0;start<targets.length;start+=5){
   const batch=await Promise.all(targets.slice(start,start+5).map(user=>deliver(user,clock.week)));
   for(const result of batch)counts[result]++;
  }
  return reply({ok:counts.failed===0,week:clock.week,eligible:eligible.length,
   registered:eligible.length-targets.length,counts},counts.failed?502:200);
 }catch(error){
  console.error("Plan reminder processing failed",error);
  return reply({error:"PLAN_REMINDER_FAILED"},500);
 }
});
