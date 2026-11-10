import {createClient} from "npm:@supabase/supabase-js@2.49.10";
const url=Deno.env.get("SUPABASE_URL")!;
const roleKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const mailKey=Deno.env.get("RESEND_API_KEY")||"";
const cronSecret=Deno.env.get("LEARNING_REPORT_CRON_SECRET")||"";
const sender=Deno.env.get("REPORT_FROM_EMAIL")||"";
const adminMail="hglee67@kopo.ac.kr";
const db=createClient(url,roleKey,{auth:{persistSession:false,autoRefreshToken:false}});
const resp=(x:unknown,status=200)=>new Response(JSON.stringify(x),{status,headers:{"Content-Type":"application/json"}});
const escape=(s:unknown)=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
function previousWeek(){
 const now=new Date(Date.now()+9*3600000),offset=(now.getUTCDay()+6)%7;
 const end=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()-offset)-9*3600000);
 const start=new Date(end.getTime()-7*86400000);
 return {start:start.toISOString(),end:end.toISOString(),date:new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()-offset-7)).toISOString().slice(0,10)};
}
async function readAttempts(start:string,end:string){
 const data:any[]=[];
 for(let offset=0;offset<100000;offset+=1000){
  const r=await db.from("learning_attempts").select("user_id,bank,question_id,result,grading_method,submitted_at").gte("submitted_at",start).lt("submitted_at",end).order("submitted_at",{ascending:true}).range(offset,offset+999);
  if(r.error)throw r.error;
  data.push(...(r.data||[]));if(!r.data||r.data.length<1000)break;
 }
 return data;
}
const html=(title:string,period:string,body:string)=>'<main style="font-family:system-ui,sans-serif;max-width:640px;margin:auto;color:#233248"><h2>'+escape(title)+'</h2><p>기간 시작: '+escape(period)+' (한국시간)</p>'+body+'<p style="color:#64748b">학습용 통계이며, 자동 판정과 자가 평가는 별도로 집계합니다.</p><a href="https://portal.k-bigdata.kr/my-learning.html">학습현황 보기</a></main>';
async function deliver(userId:string|null,email:string,kind:"student"|"super_admin",period:string,subject:string,body:string){
 const {data:entry,error}=await db.from("report_deliveries").insert({recipient_user_id:userId,recipient_email:email,report_type:kind,week_start:period,status:"pending"}).select("id").single();
 if(error?.code==="23505")return "duplicate";
 if(error)throw error;
 try{
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+mailKey,"Content-Type":"application/json","Idempotency-Key":kind+"-"+email+"-"+period},body:JSON.stringify({from:sender,to:[email],subject,html:body})});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw Error("Provider HTTP "+response.status);
  await db.from("report_deliveries").update({status:"sent",sent_at:new Date().toISOString(),provider_id:payload.id||null}).eq("id",entry.id);
  return "sent";
 }catch(e){
  await db.from("report_deliveries").update({status:"failed",error_message:String(e).slice(0,400)}).eq("id",entry.id);
  return "failed";
 }
}
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return resp({error:"METHOD_NOT_ALLOWED"},405);
 if(!cronSecret||req.headers.get("x-cron-secret")!==cronSecret)return resp({error:"UNAUTHORIZED"},401);
 if(!mailKey||!sender)return resp({error:"EMAIL_PROVIDER_NOT_CONFIGURED"},503);
 try{
  const week=previousWeek();
  const [attempts,profiles,prefs]=await Promise.all([
   readAttempts(week.start,week.end),
   db.from("profiles").select("user_id,email,full_name,approval_status,enrollment_status").eq("approval_status","approved"),
   db.from("user_preferences").select("user_id,weekly_email_opt_in").eq("weekly_email_opt_in",true)
  ]);
  if(profiles.error||prefs.error)throw Error("Failed to collect recipients");
  const byUser=new Map<string,any[]>();
  for(const r of attempts)byUser.set(r.user_id,[...(byUser.get(r.user_id)||[]),r]);
  const subscribers=new Set((prefs.data||[]).map(x=>x.user_id));
  const students=(profiles.data||[]).filter(p=>p.enrollment_status==="enrolled"&&p.email.toLowerCase()!==adminMail);
  const rate=(xs:any[])=>xs.length?Math.round(xs.filter(r=>r.result==="correct").length/xs.length*100)+"%":"집계 없음";
  const counts={sent:0,failed:0,duplicate:0};
  for(const p of students.filter(p=>subscribers.has(p.user_id))){
   const rows=byUser.get(p.user_id)||[];
   const automatic=rows.filter(x=>x.grading_method==="automatic"&&["correct","incorrect"].includes(x.result));
   const self=rows.filter(x=>x.grading_method==="self"&&["correct","incorrect"].includes(x.result));
   const wrong=rows.filter(x=>x.result==="incorrect").slice(-8).map(x=>escape(x.question_id)).join(", ")||"없음";
   const body=html("개인 주간 학습 리포트",week.date,
    "<p>"+escape(p.full_name)+"님, 이번 주 학습 요약입니다.</p><ul><li>풀이 "+rows.length+"회</li><li>고유 문제 "+new Set(rows.map(x=>x.bank+":"+x.question_id)).size+"개</li><li>자동 판정 정답률 "+rate(automatic)+"</li><li>자가 평가 정답률 "+rate(self)+"</li><li>복습 문제 "+wrong+"</li></ul>");
   const result=await deliver(p.user_id,p.email,"student",week.date,"[학과 포털] 주간 학습 리포트",body);
   counts[result as "sent"|"failed"|"duplicate"]++;
  }
  const activeStudentIds=new Set(students.map(p=>p.user_id));
  const cohortAttempts=attempts.filter(x=>activeStudentIds.has(x.user_id));
  const subjects:Record<string,number>={coding:0,ncp:0,practical:0},wrong:Record<string,number>={};
  for(const r of cohortAttempts){subjects[r.bank]=(subjects[r.bank]||0)+1;
   if(r.result==="incorrect")wrong[r.bank+":"+r.question_id]=(wrong[r.bank+":"+r.question_id]||0)+1;
  }
  const frequent=Object.entries(wrong).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([q,n])=>"<li>"+escape(q)+" · "+n+"회</li>").join("");
  const adminBody=html("학급 주간 학습 통계",week.date,"<p>학습 참여 "+new Set(cohortAttempts.map(x=>x.user_id)).size+"명 / 제출 "+cohortAttempts.length+"회</p><p>기초 "+subjects.coding+"회 · NCP "+subjects.ncp+"회 · 정보처리 "+subjects.practical+"회</p><h3>자주 틀린 문제</h3><ol>"+(frequent||"<li>없음</li>")+"</ol>");
  const adminResult=await deliver(null,adminMail,"super_admin",week.date,"[학과 포털] 학급 주간 학습 통계",adminBody);
  return resp({ok:true,counts,adminResult,weekStart:week.date});
 }catch(e){console.error("Weekly reports",e);return resp({error:"REPORT_FAILED"},500);}
});
