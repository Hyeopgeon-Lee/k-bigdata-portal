import {db,read,generate,getReport,calendar} from "../student-weekly-report/snapshot.ts";
import {dateKey,lastWeek,shift,dateMs} from "../student-weekly-report/report.mjs";
import {renderStudentMail,selectNews,excludeRepublishedNews,selectJobs,studentEligible} from "./student-mail.mjs";
/* GitHub Actions OIDC authorizes this job; no reusable webhook secret. */
const mailKey=Deno.env.get("RESEND_API_KEY")||"";
const sender=Deno.env.get("REPORT_FROM_EMAIL")||"noreply@noreply.k-bigdata.kr";
const adminMail="hglee67@kopo.ac.kr";
const repo="Hyeopgeon-Lee/k-bigdata-portal";
const workflow=repo+"/.github/workflows/weekly-learning-report.yml@refs/heads/main";
const audience="kbigdata-weekly-learning-report";
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
async function reportControls(){
 const {data,error}=await db.from("weekly_report_controls").select("report_type,enabled");
 if(error||!data||!["super_admin","student"].every(type=>data.some(s=>s.report_type===type)))throw Error("REPORT_CONTROLS_UNAVAILABLE");
 return {faculty:data.find(x=>x.report_type==="super_admin")?.enabled===true,
   students:data.find(x=>x.report_type==="student")?.enabled===true};
}
function industrialFaculty(rows:any[]){
 const active=rows.filter(x=>x.attempts>0),atRisk=rows.filter(x=>x.recent&&!x.recent.passed);
 return '<h3>정보처리산업기사 필기</h3><p>주간 참여 '+active.length+'/'+rows.length+'명 · 총 풀이 '+rows.reduce((n,x)=>n+x.attempts,0)+'회 · 모의고사 '+rows.reduce((n,x)=>n+x.mocks,0)+'회 · 최근 완료 회차 기준 미달 '+atRisk.length+'명</p><p><a href="https://portal.k-bigdata.kr/teacher-learning.html">학생별 회차·과목 통계</a></p>';
}
async function deliver(userId:string|null,email:string,kind:"super_admin"|"student",period:string,subject:string,body:string){
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
async function facultyReport(week:string,students:any[],adminIds:Set<string>){
  const period={date:week,start:new Date(dateMs(week)).toISOString(),end:new Date(dateMs(shift(week,7))).toISOString()};
  const adminProfile=await read(db.from("profiles").select("user_id,email").eq("email",adminMail).maybeSingle());
  if(!adminProfile||!adminIds.has(adminProfile.user_id))throw Error("Missing verified super admin profile");
  const verified=await db.auth.admin.getUserById(adminProfile.user_id);
  if(verified.error||verified.data.user?.email?.toLowerCase()!==adminMail||!verified.data.user?.email_confirmed_at)throw Error("Unverified super admin");
  const [attempts,writtenRows]=await Promise.all([allAttempts(new Date(dateMs(shift(week,-7))).toISOString(),period.end),read(db.rpc("written_weekly_service_summary",{p_start:period.start,p_end:period.end}))]);
  if(!Array.isArray(writtenRows))throw Error("Written statistics unavailable");
  const studentSet=new Set(students.map(s=>s.user_id));
  const cohort=attempts.filter(x=>studentSet.has(x.user_id)&&x.submitted_at>=period.start);
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
    "<h3>과목별 시도</h3><ul>"+subjects+"</ul><h3>반복 오답 문제</h3><ol>"+top+"</ol>"+industrialFaculty(writtenRows)+
    '<p><a href="https://portal.k-bigdata.kr/teacher-learning.html">교수 전용 학급 학습통계 확인</a></p>');
  return await deliver(null,adminMail,"super_admin",period.date,"[학과 포털] 주간 학급 학습 보고서",body);
}
// Shared, private weekly snapshot plus latest approved alumni notices at send time.
async function publicNotices(includeJobs:boolean,week:string){
 const [allNews,jobs]=await Promise.all([
  read(db.from("alumni_news").select("id,news_type,title,content,event_date,status,approved_at,created_at").eq("status","APPROVED").order("approved_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false,nullsFirst:false}).limit(100)),
  includeJobs?read(db.from("alumni_jobs").select("id,company,job_title,recruit_type,employment_type,location,deadline,always_open,status,approved_at,created_at").eq("status","APPROVED").order("id").limit(1000)):Promise.resolve([])
 ]);
 const recent=selectNews(allNews,week,100);
 const audit=recent.length?await read(db.from("alumni_audit_logs").select("target_id,previous_status,new_status,created_at").eq("target_kind","alumni_news").eq("new_status","APPROVED").in("target_id",recent.map((n:any)=>n.id)).order("created_at",{ascending:true}).limit(1000)):[];
 const news=excludeRepublishedNews(recent,audit,week).slice(0,3);
 return {news,jobs};
}
async function currentStudent(id:string,admins:Set<string>){
 const profile=await read(db.from("profiles").select("user_id,email,full_name,academic_year,approval_status,enrollment_status,signup_type").eq("user_id",id).maybeSingle());
 return studentEligible(profile,admins)?profile:null;
}
async function verifiedStudent(student:any){
 const {data,error}=await db.auth.admin.getUserById(student.user_id);
 return !error&&data.user?.email_confirmed_at&&data.user.email?.toLowerCase()===student.email.toLowerCase();
}
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return response({error:"METHOD_NOT_ALLOWED"},405);
 const event=await githubIdentity(req);
 if(!event)return response({error:"OIDC_NOT_AUTHORIZED"},403);
 let payload:any={};
 try{payload=await req.json();}catch{}
 const dryRun=payload.dry_run===true;
 if(event==="push"&&!dryRun)return response({error:"PUSH_MUST_DRY_RUN"},403);
 // Only a signed scheduled invocation or explicit dispatch may send; push is preview-only.
 const cursor=typeof payload.cursor==="string"?payload.cursor:"";
 if(cursor&&!/^[0-9a-f-]{36}$/i.test(cursor))return response({error:"BAD_CURSOR"},400);
 const week=lastWeek();
 const counts={sent:0,failed:0,duplicate:0};
 try{
  const controls=await reportControls();
  if(!controls.faculty&&!controls.students&&!dryRun)return response({ok:true,weekStart:week,controls,skipped:"both_disabled",counts,next:null});
  if(!mailKey&&!dryRun)return response({error:"RESEND_API_KEY_NOT_CONFIGURED"},503);
  const [profiles,roles]=await Promise.all([
    read(db.from("profiles").select("user_id,email,full_name,academic_year,approval_status,enrollment_status,signup_type").eq("approval_status","approved").eq("enrollment_status","enrolled").eq("signup_type","student").in("academic_year",[1,2]).order("user_id")),
    read(db.from("account_roles").select("user_id").eq("role","super_admin"))
  ]);
  const admins=new Set<string>(roles.map((r:any)=>r.user_id));
  const students=profiles.filter((p:any)=>studentEligible(p,admins));
  const members=students.filter((p:any)=>!cursor||p.user_id>cursor).slice(0,5);
  const next=members.length===5&&students.some((p:any)=>p.user_id>members[4].user_id)?members[4].user_id:null;
  const notices=await publicNotices(members.some((m:any)=>Number(m.academic_year)===2),week);
  const today=dateKey(Date.now());
  let adminResult="disabled",skippedUnverified=0,verifiedCount=0,previewed=0;
  if(!cursor&&controls.faculty&&!dryRun&&(await reportControls()).faculty){
   try{adminResult=await facultyReport(week,students,admins);counts[adminResult as keyof typeof counts]++}
   catch{adminResult="failed";counts.failed++}
  }
  let calPromise:Promise<any>|undefined;
  for(const candidate of members){
   try{
    if(!dryRun&&!(await reportControls()).students)break;
    const student=await currentStudent(candidate.user_id,admins);
    if(!student||!(await verifiedStudent(student))){skippedUnverified++;continue}
    verifiedCount++;
    let report=await getReport(student.user_id,week);
    if(!report&&!dryRun){
     // Retry missing 08:00 snapshots using the exact dashboard generator, never zeros.
     calPromise??=calendar();
     report=await generate(student,week,await calPromise);
    }
    if(!report){if(dryRun)continue;throw Error("SNAPSHOT_MISSING")}
    const certificates=await read(db.from("student_certifications").select("certificate_code,pass_status,verification_status").eq("user_id",student.user_id).in("certificate_code",["engineer","industrial","ncp"]));
    const preview=renderStudentMail(student,report,certificates,notices.news,notices.jobs,today);
    previewed++;
    if(dryRun)continue;
    // Recheck opt-in and eligibility immediately before each external delivery.
    if(!(await reportControls()).students)break;
    const latest=await currentStudent(student.user_id,admins);
    if(!latest||latest.email!==student.email||latest.academic_year!==student.academic_year||!(await verifiedStudent(latest))){skippedUnverified++;continue}
    const state=await deliver(student.user_id,student.email,"student",week,preview.subject,preview.html);
    counts[state as keyof typeof counts]++;
    await new Promise(resolve=>setTimeout(resolve,650));
   }catch{counts.failed++}
  }
  return response({ok:true,dry_run:dryRun,weekStart:week,controls,counts,adminResult,skippedUnverified,verifiedCount,previewed,cohortSize:students.length,approvedNews:selectNews(notices.news,week).length,openJobs:selectJobs(notices.jobs,2,today).length,emailProviderConfigured:!!mailKey,senderConfigured:!!sender,next:controls.students||dryRun?next:null});
 }catch{console.error("Weekly report processing failed");return response({error:"REPORT_FAILED"},500)}
});
