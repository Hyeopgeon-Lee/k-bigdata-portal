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
async function reportControls(){
 const {data,error}=await db.from("weekly_report_controls").select("report_type,enabled");
 if(error||!data||!["super_admin","student"].every(type=>data.some(s=>s.report_type===type)))throw Error("REPORT_CONTROLS_UNAVAILABLE");
 return {faculty:data.find(x=>x.report_type==="super_admin")?.enabled===true,
   students:data.find(x=>x.report_type==="student")?.enabled===true};
}
const questionKey=(item:any)=>item.bank+":"+item.question_id;
const judged=(rows:any[])=>rows.filter(x=>["correct","incorrect"].includes(x.result));
function studentBody(student:any,all:any[],period:{start:string;end:string;date:string}){
 const mine=all.filter(x=>x.user_id===student.user_id).sort((a,b)=>Date.parse(a.submitted_at)-Date.parse(b.submitted_at));
 const week=mine.filter(x=>x.submitted_at>=period.start);
 const previous=mine.filter(x=>x.submitted_at<period.start);
 const evaluated=judged(week),self=evaluated.filter(x=>x.grading_method==="self");
 const automatic=evaluated.filter(x=>x.grading_method==="automatic");
 const oldLatest=new Map<string,string>(),latest=new Map<string,string>(),errors=new Map<string,number>();
 for(const x of previous)if(["correct","incorrect","ungraded"].includes(x.result))oldLatest.set(questionKey(x),x.result);
 const improved=new Set<string>(),wrongSeen=new Set<string>();
 for(const x of week){
   const key=questionKey(x);
   if(x.result==="incorrect"){wrongSeen.add(key);errors.set(key,(errors.get(key)||0)+1);}
   if(x.result==="correct"&&(wrongSeen.has(key)||oldLatest.get(key)==="incorrect"))improved.add(key);
   if(["correct","incorrect","ungraded"].includes(x.result))latest.set(key,x.result);
 }
 for(const [key,value] of oldLatest)if(!latest.has(key))latest.set(key,value);
 const review=[...latest].filter(([key,result])=>result==="incorrect"||result==="ungraded")
   .sort((a,b)=>(errors.get(b[0])||0)-(errors.get(a[0])||0)).slice(0,5);
 const link=(key:string)=>{
   const cut=key.indexOf(":");if(cut<0)return escape(key);
   const bank=key.slice(0,cut),question=key.slice(cut+1),path=({coding:"coding.html",ncp:"ncp.html",practical:"practical.html"} as Record<string,string>)[bank];
   return path&&/^[\\w-]{1,100}$/.test(question)?
      '<a href="https://portal.k-bigdata.kr/'+path+'?id='+encodeURIComponent(question)+'">'+escape(question)+'</a>':escape(question);
 };
 const recovered=[...improved].filter(key=>latest.get(key)==="correct").slice(0,8);
 const difference=week.length-previous.length;
 const studentName=String(student.full_name||"학생").trim().slice(0,80);
 const part='<p>'+escape(studentName)+' 학생의 최근 1주일 학습 요약입니다.</p>'+
   '<p>풀이 '+week.length+'회 / 서로 다른 문제 '+new Set(week.map(questionKey)).size+'개 · 지난주 '+previous.length+
     '회 대비 '+(difference>0?"+":"")+difference+'회</p>'+
   '<p>자가평가 정답률 '+pct(self.filter(x=>x.result==="correct").length,self.length)+
     ' · 브라우저 답안 비교 '+pct(automatic.filter(x=>x.result==="correct").length,automatic.length)+'</p>'+
   '<h3>오답에서 정답으로 개선한 문제</h3><ul>'+
     (recovered.length?recovered.map(x=>'<li>'+link(x)+'</li>').join(""):"<li>이번 주 개선 기록 없음</li>")+'</ul>'+
   '<h3>다음 주 추천 복습 문제</h3><ol>'+
     (review.length?review.map(([key])=>'<li>'+link(key)+'</li>').join(""):"<li>기록된 오답·미판정 문제 없음</li>")+'</ol>'+
   '<p>복습 추천은 실제 학습 기록을 기준으로 하며 시험 성적을 보장하지 않습니다.</p>';
 return html("주간 개인 학습 리포트",period.date,part);
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
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return response({error:"METHOD_NOT_ALLOWED"},405);
 const event=await githubIdentity(req);
 if(!event)return response({error:"OIDC_NOT_AUTHORIZED"},403);
 let payload:any={};
 try{payload=await req.json();}catch{}
 const dryRun=payload.dry_run===true;
 if(event==="push"&&!dryRun)return response({error:"PUSH_MUST_DRY_RUN"},403);
 try{
  const controls=await reportControls();
  const period=lastWeek();
  if(!controls.faculty&&!controls.students)return response({ok:true,weekStart:period.date,controls,skipped:"both_disabled",counts:{sent:0,failed:0,duplicate:0}});
  if(!mailKey&&!dryRun)return response({error:"RESEND_API_KEY_NOT_CONFIGURED"},503);
  const priorStart=new Date(Date.parse(period.start)-7*86400000).toISOString();
  const [attempts,profiles,admins]=await Promise.all([
   allAttempts(priorStart,period.end),
   db.from("profiles").select("user_id,email,full_name,approval_status,enrollment_status").eq("approval_status","approved"),
   db.from("account_roles").select("user_id").eq("role","super_admin")
  ]);
  if(profiles.error||admins.error)throw Error("Recipient lookup failed");
  const adminId=admins.data?.find(x=>(profiles.data||[]).some(p=>p.user_id===x.user_id&&p.email?.toLowerCase()===adminMail))?.user_id;
  if(controls.faculty){
   if(!adminId)throw Error("Missing verified super admin profile");
   const verified=await db.auth.admin.getUserById(adminId);
   if(verified.error||verified.data.user?.email?.toLowerCase()!==adminMail||!verified.data.user?.email_confirmed_at)throw Error("Unverified super admin");
  }
  const students=(profiles.data||[]).filter(p=>p.enrollment_status==="enrolled"&&p.user_id!==adminId);
  const studentSet=new Set(students.map(s=>s.user_id));
  const cohort=attempts.filter(x=>studentSet.has(x.user_id)&&x.submitted_at>=period.start);
  if(dryRun)return response({ok:true,dry_run:true,oidc:event,weekStart:period.date,controls,
    cohortSize:students.length,attempts:cohort.length,
    studentEmailRecipients:controls.students?students.filter(s=>s.email).length:0,
    adminEmailRecipients:controls.faculty?1:0,emailProviderConfigured:!!mailKey,senderConfigured:!!sender});
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
  let adminResult="disabled";
  if(controls.faculty){
    adminResult=await deliver(null,adminMail,"super_admin",period.date,"[학과 포털] 주간 학급 학습 보고서",body);
    counts[adminResult as keyof typeof counts]++;
  }
  let skippedUnverified=0;
  if(controls.students){
    for(const student of students){
      if(!student.email){skippedUnverified++;continue;}
      // Never email an account that has not verified its address.
      const {data:verified,error:checkError}=await db.auth.admin.getUserById(student.user_id);
      if(checkError||!verified.user?.email_confirmed_at||
         verified.user.email?.toLowerCase()!==student.email.toLowerCase()){
        skippedUnverified++;continue;
      }
      // Recheck before each delivery so a newly disabled switch stops the remainder.
      const live=await reportControls();
      if(!live.students)break;
      const body=studentBody(student,attempts,period);
      const state=await deliver(student.user_id,student.email,"student",period.date,
        "[학과 포털] 나의 주간 학습 리포트",body);
      counts[state as keyof typeof counts]++;
      await new Promise(resolve=>setTimeout(resolve,650));
    }
  }
  return response({ok:true,controls,counts,adminResult,skippedUnverified,weekStart:period.date});
 }catch(error){console.error("Weekly learning report failed",error);return response({error:"REPORT_FAILED"},500);}
});
