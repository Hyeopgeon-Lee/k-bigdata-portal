import {createClient} from "npm:@supabase/supabase-js@2.49.10";
/* GitHub Actions OIDC authorizes this job; no reusable webhook secret. */
const url=Deno.env.get("SUPABASE_URL")!;
const roleKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const mailKey=Deno.env.get("RESEND_API_KEY")||"";
const sender=Deno.env.get("REPORT_FROM_EMAIL")||"noreply@noreply.k-bigdata.kr";
const adminMail="hglee67@kopo.ac.kr";
const repo="Hyeopgeon-Lee/k-bigdata-portal";
const workflow=repo+"/.github/workflows/weekly-learning-report.yml@refs/heads/main";
const audience="kbigdata-weekly-learning-report";
const db=createClient(url,roleKey,{auth:{persistSession:false,autoRefreshToken:false}});
const response=(obj:unknown,status=200)=>new Response(JSON.stringify(obj),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
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
function lastWeek(){
 const kst=new Date(Date.now()+9*3600000),day=(kst.getUTCDay()+6)%7;
 const end=Date.UTC(kst.getUTCFullYear(),kst.getUTCMonth(),kst.getUTCDate()-day)-9*3600000;
 const start=end-7*86400000;
 return {start:new Date(start).toISOString(),end:new Date(end).toISOString(),
   date:new Date(start+9*3600000).toISOString().slice(0,10)};
}
async function allAttempts(start:string,end:string){
 const all:any[]=[];
 for(let from=0;from<100000;from+=1000){
  const {data,error}=await db.from("learning_attempts").select("user_id,bank,question_id,result,grading_method,submitted_at")
    .gte("submitted_at",start).lt("submitted_at",end).order("submitted_at",{ascending:true}).range(from,from+999);
  if(error)throw error;all.push(...(data||[]));if(!data||data.length<1000)break;
 }
 return all;
}
const html=(title:string,date:string,body:string)=>'<main style="max-width:650px;margin:20px auto;font:15px/1.7 system-ui,sans-serif;color:#25374f">'+
 '<h2>'+escape(title)+'</h2><p>집계 시작: '+escape(date)+' (한국시간 월요일) · 종료: 다음 월요일 00:00</p>'+body+
 '<p style="color:#687d96;font-size:13px">정답률은 자동 채점 시험 점수가 아닙니다. 자가평가와 브라우저 답안 비교를 구분합니다.</p>'+
 '<p><a href="https://portal.k-bigdata.kr/my-learning.html">나의 학습현황</a></p></main>';
function pct(correct:number,total:number){return total?Math.round(correct/total*100)+"%":"집계 없음";}
async function deliver(userId:string|null,email:string,kind:"super_admin",period:string,subject:string,body:string){
 const q=db.from("report_deliveries");
 const {data:existing,error:lookupError}=await q.select("id,status,created_at").eq("recipient_email",email).eq("report_type",kind).eq("week_start",period).maybeSingle();
 if(lookupError)throw lookupError;
 let id:number;
 if(existing){
  if(existing.status==="sent")return "duplicate";
  if(existing.status==="pending"&&Date.now()-Date.parse(existing.created_at)<20*60000)return "duplicate";
  const {data:claimed,error:claimError}=await db.from("report_deliveries").update({status:"pending",error_message:null})
    .eq("id",existing.id).eq("status",existing.status).select("id").maybeSingle();
  if(claimError||!claimed)return "duplicate";
  id=claimed.id;
 }else{
  const {data:newRow,error}=await db.from("report_deliveries").insert({
   recipient_user_id:userId,recipient_email:email,report_type:kind,week_start:period,status:"pending"
  }).select("id").single();
  if(error?.code==="23505")return "duplicate";
  if(error)throw error;
  id=newRow.id;
 }
 try{
  const delivered=await fetch("https://api.resend.com/emails",{
   method:"POST",headers:{"Authorization":"Bearer "+mailKey,"Content-Type":"application/json",
    "Idempotency-Key":kind+"-"+email+"-"+period},
   body:JSON.stringify({from:sender,to:[email],subject,html:body}),
   signal:AbortSignal.timeout(10000)
  });
  const payload=await delivered.json().catch(()=>({}));
  if(!delivered.ok||!payload.id)throw Error("Provider HTTP "+delivered.status);
  const {error}=await db.from("report_deliveries").update({status:"sent",sent_at:new Date().toISOString(),provider_id:payload.id}).eq("id",id);
  if(error)throw error;return "sent";
 }catch(error){
  await db.from("report_deliveries").update({status:"failed",error_message:String(error).slice(0,300)}).eq("id",id);
  return "failed";
 }
}
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return response({error:"METHOD_NOT_ALLOWED"},405);
 const event=await githubIdentity(req);
 if(!event)return response({error:"OIDC_NOT_AUTHORIZED"},403);
 let payload:any={};
 try{payload=await req.json();}catch{}
 const dryRun=payload.dry_run===true;
 if(event==="push"&&!dryRun)return response({error:"PUSH_MUST_DRY_RUN"},403);
 if(!mailKey&&!dryRun)return response({error:"RESEND_API_KEY_NOT_CONFIGURED"},503);
 try{
  const period=lastWeek();
  const [attempts,profiles,admins]=await Promise.all([
   allAttempts(period.start,period.end),
   db.from("profiles").select("user_id,email,full_name,approval_status,enrollment_status").eq("approval_status","approved"),
   db.from("account_roles").select("user_id").eq("role","super_admin")
  ]);
  if(profiles.error||admins.error)throw Error("Recipient lookup failed");
  const adminId=admins.data?.find(x=>(profiles.data||[]).some(p=>p.user_id===x.user_id&&p.email?.toLowerCase()===adminMail))?.user_id;
  if(!adminId)throw Error("Missing verified super admin profile");
  const verified=await db.auth.admin.getUserById(adminId);
  if(verified.error||verified.data.user?.email?.toLowerCase()!==adminMail||!verified.data.user?.email_confirmed_at)throw Error("Unverified super admin");
  const students=(profiles.data||[]).filter(p=>p.enrollment_status==="enrolled"&&p.user_id!==adminId);
  const studentSet=new Set(students.map(s=>s.user_id));
  const cohort=attempts.filter(x=>studentSet.has(x.user_id));
  if(dryRun)return response({ok:true,dry_run:true,oidc:event,weekStart:period.date,
    cohortSize:students.length,attempts:cohort.length,studentEmailRecipients:0,
    adminEmailRecipients:1,emailProviderConfigured:!!mailKey,senderConfigured:!!sender});
  const counts={sent:0,failed:0,duplicate:0};
  const subjectKey=(x:any)=>x.bank==="coding"?String(x.question_id).split("-")[0]:x.bank==="ncp"?"NCP":"PRACTICAL";
  const subjects=["JAVA","C","PYTHON","LINUX","NCP","PRACTICAL"].map(key=>
    "<li>"+escape({JAVA:"Java",C:"C",PYTHON:"Python",LINUX:"Ubuntu",NCP:"NCP",PRACTICAL:"정보처리"}[key])+
    ": "+cohort.filter(x=>subjectKey(x)===key).length+"회</li>").join("");
  const self=cohort.filter(x=>x.grading_method==="self"&&["correct","incorrect"].includes(x.result));
  const automatic=cohort.filter(x=>x.grading_method==="automatic"&&["correct","incorrect"].includes(x.result));
  const wrong:Record<string,number>={};
  for(const x of cohort)if(x.result==="incorrect")wrong[x.bank+":"+x.question_id]=(wrong[x.bank+":"+x.question_id]||0)+1;
  const top=students.length>0&&students.length<5?"<li>소수 학급 문제별 집계는 비공개</li>":
    Object.entries(wrong).sort((a,b)=>b[1]-a[1]).slice(0,10)
      .map(([id,n])=>"<li>"+escape(id)+" · "+n+"회</li>").join("")||"<li>없음</li>";
  const participants=new Set(cohort.map(x=>x.user_id)).size;
  const body=html("학급 주간 학습 리포트",period.date,
    "<p>집계 재학생 "+students.length+"명 / 학습 참여 "+participants+"명 ("+
      (students.length?Math.round(participants/students.length*100)+"%":"대상 없음")+")</p>"+
    "<p>총 시도 "+cohort.length+"회 · 고유 풀이 "+new Set(cohort.map(x=>x.user_id+":"+x.bank+":"+x.question_id)).size+"문제</p>"+
    "<p>자가평가 정답률 "+pct(self.filter(x=>x.result==="correct").length,self.length)+
     " · 브라우저 답안 비교 "+pct(automatic.filter(x=>x.result==="correct").length,automatic.length)+"</p>"+
    "<h3>과목별 시도</h3><ul>"+subjects+"</ul><h3>반복 오답 문제</h3><ol>"+top+"</ol>"+
    '<p><a href="https://portal.k-bigdata.kr/teacher-learning.html">교수 전용 학급 학습통계 확인</a></p>');
  const adminResult=await deliver(null,adminMail,"super_admin",period.date,"[학과 포털] 주간 학급 학습 보고서",body);
  if(adminResult==="sent")counts.sent++;
  else if(adminResult==="failed")counts.failed++;
  else if(adminResult==="duplicate")counts.duplicate++;
  return response({ok:true,counts,adminResult,studentSendingPaused:true,weekStart:period.date});
 }catch(error){console.error("Weekly learning report failed",error);return response({error:"REPORT_FAILED"},500);}
});
