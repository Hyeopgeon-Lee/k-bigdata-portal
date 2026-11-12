import {createClient} from "npm:@supabase/supabase-js@2.49.10";
const url=Deno.env.get("SUPABASE_URL")!;
const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const mailKey=Deno.env.get("RESEND_API_KEY")||"";
const from=Deno.env.get("REPORT_FROM_EMAIL")||"noreply@noreply.k-bigdata.kr";
const adminMail="hglee67@kopo.ac.kr";
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
function mailTemplate(name:string,week:string,slot:string){
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
 '<span style="display:inline-block;padding:7px 12px;background:#eaf2ff;border-radius:30px;color:#2256a2;font-size:12px;font-weight:bold">자율학습 계획 · '+escape(slot==="mon12"?"1차 안내":slot==="mon17"?"2차 안내":"3차 안내")+'</span>'+
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
async function deliver(student:{user_id:string,full_name:string,email:string},week:string,slot:string){
 if(await hasPlan(student.user_id,week))return "registered" as const;
 const kind=slot==="mon12"?"plan_reminder":slot==="mon17"?"plan_reminder_mon17":"plan_reminder_tue12";
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
      "Idempotency-Key":"study-plan-reminder-"+student.user_id+"-"+week+(slot==="mon12"?"":"-"+slot)},
    body:JSON.stringify({
      from:"빅데이터소프트웨어공학과 포털 <"+from+">",
      to:[student.email],
      subject:"[학과 포털] 주간 자율학습 계획 "+(slot==="mon12"?"등록 안내":slot==="mon17"?"2차 안내":"마지막 안내"),
      html:mailTemplate(student.full_name,week,slot),
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

type Slot="mon12"|"mon17"|"tue12"|"wed08";
const slotHours:Record<Slot,{day:number,start:number,end:number}>={
 mon12:{day:1,start:12,end:17},
 mon17:{day:1,start:17,end:23},
 tue12:{day:2,start:12,end:19},
 wed08:{day:3,start:8,end:15}
};
function allowedTime(slot:Slot,now=Date.now()){
 const day=new Date(now+KST),range=slotHours[slot];
 return day.getUTCDay()===range.day&&day.getUTCHours()>=range.start&&day.getUTCHours()<range.end;
}
type Student={user_id:string;full_name:string;email:string;academic_year:number|null};
type Plan={user_id:string;weekdays:number[];no_plan_reason:string|null};
function aggregate(students:Student[],plans:Plan[]){
 const byUser=new Map(plans.map(p=>[p.user_id,p]));
 const registered=students.filter(s=>byUser.has(s.user_id));
 const unregistered=students.filter(s=>!byUser.has(s.user_id));
 const zero=students.flatMap(s=>{
   const p=byUser.get(s.user_id);
   return p&&Array.isArray(p.weekdays)&&p.weekdays.length===0?[{student:s,reason:p.no_plan_reason}]:[];
 });
 const grades=[1,2].map(grade=>({
   grade,
   total:students.filter(s=>Number(s.academic_year)===grade).length,
   unregistered:unregistered.filter(s=>Number(s.academic_year)===grade).length,
   zero:zero.filter(s=>Number(s.student.academic_year)===grade).length
 }));
 return {registered,unregistered,zero,grades,
   positive:registered.length-zero.length,
   eligible:students.length};
}
function adminTemplate(week:string,report:ReturnType<typeof aggregate>){
 const label=(grade:number|null)=>Number(grade)===1?"1학년":Number(grade)===2?"2학년":"학년 미지정";
 const escapedDate=escape(week);
 const stat=(number:number,title:string,sub:string)=>'<td width="33%" style="padding:6px;vertical-align:top"><div style="background:#eef4fc;border-radius:11px;padding:15px 7px;text-align:center">'+
  '<strong style="display:block;font-size:26px;color:#163e78">'+number+'</strong><span style="font-size:13px;color:#213d63;font-weight:bold">'+title+
  '</span><div style="font-size:11px;color:#68788f;margin-top:5px">'+sub+'</div></div></td>';
 const zeroRows=report.zero.map(({student,reason})=>'<tr><td style="padding:12px;border-bottom:1px solid #e7edf5"><strong>'+
  escape(student.full_name)+'</strong><div style="font-size:12px;color:#718098">'+label(student.academic_year)+'</div></td>'+
  '<td style="padding:12px;border-bottom:1px solid #e7edf5;line-height:1.7;word-break:break-word">'+
  (reason?.trim()?escape(reason):'<span style="color:#b45309;font-weight:bold">사유 미입력 (이전 기록)</span>')+'</td></tr>').join("");
 const unregisteredRows=report.unregistered.map(s=>'<tr><td style="padding:11px;border-bottom:1px solid #e7edf5"><strong>'+
  escape(s.full_name)+'</strong></td><td style="padding:11px;border-bottom:1px solid #e7edf5">'+label(s.academic_year)+'</td>'+
  '<td style="padding:11px;border-bottom:1px solid #e7edf5;color:#b45309;font-weight:bold">계획 미등록</td></tr>').join("");
 const gradeRows=report.grades.map(g=>'<tr><td style="padding:9px;border-bottom:1px solid #e7edf5">'+g.grade+
  '학년</td><td style="padding:9px;border-bottom:1px solid #e7edf5;text-align:center">'+g.total+
  '</td><td style="padding:9px;border-bottom:1px solid #e7edf5;text-align:center">'+g.zero+
  '</td><td style="padding:9px;border-bottom:1px solid #e7edf5;text-align:center">'+g.unregistered+'</td></tr>').join("");
 return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'+
  '<body style="margin:0;background:#f2f5fa;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;color:#243650">'+
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:30px 12px">'+
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:630px;background:#fff;border:1px solid #e1e7f0;border-radius:16px;overflow:hidden">'+
  '<tr><td style="background:#173b72;color:#fff;padding:28px 28px 23px"><div style="color:#c6d8f6;font-size:12px;font-weight:bold;letter-spacing:1px">K-BIGDATA · WEEKLY STUDY STATUS</div>'+
  '<h1 style="font-size:23px;line-height:1.4;margin:10px 0">자율학습 계획 등록 현황</h1>'+
  '<div style="color:#dbe8ff;font-size:14px">'+escapedDate+' 시작 주간 · 수요일 오전 8시 기준</div></td></tr>'+
  '<tr><td style="padding:25px 22px 26px">'+
  '<p style="margin:0 4px 14px;font-size:14px;line-height:1.75;color:#52627b">승인된 재학생의 주간 자율학습 계획을 종합한 보고서입니다. 0일 계획은 등록 완료로 구분하고, 미등록 학생만 별도로 집계했습니다.</p>'+
  '<table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>'+
  stat(report.eligible,"대상 재학생","승인 · 재학")+
  stat(report.zero.length,"0일 계획","사유 확인 대상")+
  stat(report.unregistered.length,"미등록","관리자 확인 대상")+'</tr></table>'+
  '<h2 style="font-size:17px;color:#18395f;margin:26px 4px 9px">학년별 현황</h2>'+
  '<table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;border-collapse:collapse"><thead><tr style="background:#f1f5fa;color:#38516f"><th style="padding:10px;text-align:left">학년</th><th>대상</th><th>0일</th><th>미등록</th></tr></thead><tbody>'+gradeRows+'</tbody></table>'+
  '<h2 style="font-size:17px;color:#18395f;margin:26px 4px 8px">0일 계획 사유 <span style="color:#72839a;font-size:14px">('+report.zero.length+'명)</span></h2>'+
  '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px"><thead><tr style="background:#f1f5fa;color:#38516f"><th style="text-align:left;padding:10px;width:30%">학생</th><th style="text-align:left;padding:10px">등록 사유</th></tr></thead><tbody>'+
  (zeroRows||'<tr><td colspan="2" style="padding:15px;color:#708098">0일 계획 등록자가 없습니다.</td></tr>')+'</tbody></table>'+
  '<h2 style="font-size:17px;color:#18395f;margin:26px 4px 8px">계획 미등록 학생 <span style="color:#72839a;font-size:14px">('+report.unregistered.length+'명)</span></h2>'+
  '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px"><thead><tr style="background:#f1f5fa;color:#38516f"><th style="text-align:left;padding:10px">학생</th><th style="text-align:left;padding:10px">학년</th><th style="text-align:left;padding:10px">상태</th></tr></thead><tbody>'+
  (unregisteredRows||'<tr><td colspan="3" style="padding:15px;color:#237b55">모든 대상 학생이 계획을 등록했습니다.</td></tr>')+'</tbody></table>'+
  '<p style="font-size:13px;color:#536985;line-height:1.7;margin:22px 4px">계획 등록 '+report.registered.length+'명 (1일 이상 '+report.positive+'명, 0일 '+report.zero.length+'명) · 미등록 '+
  report.unregistered.length+'명</p>'+
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0"><tr><td align="center" style="background:#2459a4;border-radius:10px">'+
  '<a href="https://portal.k-bigdata.kr/teacher-learning.html" style="display:block;padding:15px;color:#fff;font-size:15px;font-weight:bold;text-decoration:none">자율학습 관리자 화면 확인 →</a></td></tr></table>'+
  '<div style="font-size:12px;color:#7a899f;line-height:1.7;border-top:1px solid #e7edf5;padding-top:17px">한국폴리텍대학 서울강서캠퍼스 빅데이터소프트웨어공학과<br>'+
  '수신 전용 관리자 종합 보고서 · 학생의 개인정보 및 사유는 지도 목적에만 활용해 주세요.</div>'+
  '</td></tr></table></td></tr></table></body></html>';
}
async function sendAdminReport(week:string,report:ReturnType<typeof aggregate>){
 const q=db.from("study_plan_admin_reports"),type="weekly_status";
 const {data:previous,error:readError}=await q.select("week_start,status,created_at")
  .eq("week_start",week).eq("report_type",type).maybeSingle();
 if(readError)throw readError;
 if(previous&&(previous.status==="sent"||
  (previous.status==="pending"&&Date.now()-Date.parse(previous.created_at)<30*60000)))return "duplicate";
 if(previous){
  const {data:claim,error}=await q.update({status:"pending",created_at:new Date().toISOString(),error_message:null})
    .eq("week_start",week).eq("report_type",type).eq("status",previous.status).select("week_start").maybeSingle();
  if(error)throw error;
  if(!claim)return "duplicate";
 }else{
  const {error}=await q.insert({week_start:week,report_type:type,status:"pending"});
  if(error?.code==="23505")return "duplicate";
  if(error)throw error;
 }
 try{
  const res=await fetch("https://api.resend.com/emails",{
   method:"POST",
   headers:{"Authorization":"Bearer "+mailKey,"Content-Type":"application/json",
     "Idempotency-Key":"study-plan-admin-weekly-"+week},
   body:JSON.stringify({from:"빅데이터소프트웨어공학과 포털 <"+from+">",
    to:[adminMail],subject:"[학과 포털] 자율학습 계획 종합 현황 · "+week,
    html:adminTemplate(week,report),
    text:"주간 자율학습 계획 현황 ("+week+")\n대상: "+report.eligible+"명\n등록: "+
      report.registered.length+"명\n0일: "+report.zero.length+"명\n미등록: "+report.unregistered.length+
      "명\n관리자 화면: https://portal.k-bigdata.kr/teacher-learning.html"}),
   signal:AbortSignal.timeout(15000)
  });
  const body=await res.json().catch(()=>({}));
  if(!res.ok||!body.id)throw Error("RESEND_HTTP_"+res.status);
  const {error:saveError}=await q.update({status:"sent",sent_at:new Date().toISOString(),provider_id:body.id,error_message:null})
   .eq("week_start",week).eq("report_type",type);
  if(saveError)throw saveError;
  return "sent";
 }catch(err){
  await q.update({status:"failed",error_message:String(err).slice(0,300)})
   .eq("week_start",week).eq("report_type",type);
  return "failed";
 }
}
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return reply({error:"METHOD_NOT_ALLOWED"},405);
 const event=await githubIdentity(req);
 if(!event)return reply({error:"OIDC_NOT_AUTHORIZED"},403);
 let payload:any={};try{payload=await req.json();}catch{}
 const dryRun=payload.dry_run===true;
 if(event!=="schedule"&&!dryRun)return reply({error:"SCHEDULE_ONLY_SENDING"},403);
 const slot=payload.slot;
 if(!["mon12","mon17","tue12","wed08"].includes(slot))return reply({error:"INVALID_SLOT"},400);
 if(!dryRun&&!allowedTime(slot as Slot))
   return reply({ok:true,skipped:"outside_schedule_window",slot,dry_run:false});
 const week=currentKoreanWeek().week;
 try{
  const [plans,students]=await Promise.all([
   db.from("study_weekly_plans").select("user_id,weekdays,no_plan_reason").eq("week_start",week),
   db.from("profiles").select("user_id,full_name,email,academic_year")
    .eq("signup_type","student").eq("approval_status","approved").eq("enrollment_status","enrolled")
  ]);
  for(const x of [plans,students])if(x.error)throw x.error;
  const eligible=(students.data||[]) as Student[];
  const registeredPlans=(plans.data||[]) as Plan[];
  const data=aggregate(eligible,registeredPlans);
  if(slot==="wed08"){
   if(dryRun)return reply({ok:true,dry_run:true,slot,week,eligible:data.eligible,registered:data.registered.length,
     zero_day:data.zero.length,unregistered:data.unregistered.length,mailConfigured:!!mailKey});
   if(!mailKey)return reply({error:"RESEND_API_KEY_NOT_CONFIGURED"},503);
   const result=await sendAdminReport(week,data);
   return reply({ok:result!=="failed",slot,week,report:result,eligible:data.eligible,
    registered:data.registered.length,zero_day:data.zero.length,unregistered:data.unregistered.length},
    result==="failed"?502:200);
  }
  const setting=await db.from("study_settings").select("enabled").eq("setting_key","plan_reminder_email").single();
  if(setting.error)throw setting.error;
  if(!setting.data?.enabled)return reply({ok:true,week,slot,skipped:"disabled",dry_run:dryRun});
  if(dryRun)return reply({ok:true,dry_run:true,slot,week,eligible:data.eligible,
   registered:data.registered.length,unregistered:data.unregistered.length,mailConfigured:!!mailKey});
  if(!mailKey)return reply({error:"RESEND_API_KEY_NOT_CONFIGURED"},503);
  const counts={sent:0,failed:0,duplicate:0,registered:0};
  const mailable=data.unregistered.filter(user=>Boolean(user.email));
  for(let start=0;start<mailable.length;start+=5){
   const batch=await Promise.all(mailable.slice(start,start+5)
    .map(user=>deliver(user,week,slot)));
   for(const result of batch)counts[result]++;
  }
  return reply({ok:counts.failed===0,slot,week,eligible:data.eligible,registered:data.registered.length,
   counts},counts.failed?502:200);
 }catch(error){
  console.error("Study plan mail processing failed",error);
  return reply({error:"STUDY_PLAN_REPORT_FAILED"},500);
 }
});
