import {createClient} from "npm:@supabase/supabase-js@2.49.10";
const origin="https://portal.k-bigdata.kr";
const headers={"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json","Vary":"Origin"};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
const url=Deno.env.get("SUPABASE_URL")!;
const publishable=Deno.env.get("SUPABASE_ANON_KEY")!;
const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin=createClient(url,service,{auth:{autoRefreshToken:false,persistSession:false}});
function mondayStartUTC(){
 const now=new Date(),kst=new Date(now.getTime()+9*3600000),dow=(kst.getUTCDay()+6)%7;
 const y=kst.getUTCFullYear(),m=kst.getUTCMonth(),d=kst.getUTCDate()-dow;
 return new Date(Date.UTC(y,m,d)-9*3600000).toISOString();
}
async function authorized(req:Request){
 const token=req.headers.get("authorization")?.replace(/^Bearer /i,"");
 if(!token)return false;
 const client=createClient(url,publishable,{global:{headers:{Authorization:"Bearer "+token}},auth:{autoRefreshToken:false,persistSession:false}});
 const {data:who,error}=await client.auth.getUser(token);
 if(error||!who.user)return false;
 const {data:allowed,error:permissionError}=await client.rpc("portal_super_admin_allowed");
 return !permissionError&&allowed===true&&who.user.email?.toLowerCase()==="hglee67@kopo.ac.kr";
}
async function allAttempts(from:string){
 let out:any[]=[];
 for(let page=0;page<100;page++){
  const {data,error}=await admin.from("learning_attempts")
   .select("user_id,bank,question_id,result,grading_method,submitted_at")
   .gte("submitted_at",from).order("submitted_at",{ascending:false})
   .range(page*1000,(page+1)*1000-1);
  if(error)throw error;
  out=out.concat(data||[]);
  if(!data||data.length<1000)break;
 }
 return out;
}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return json({error:"METHOD_NOT_ALLOWED"},405);
 if(req.headers.get("origin")&&req.headers.get("origin")!==origin)return json({error:"ORIGIN_NOT_ALLOWED"},403);
 if(!await authorized(req))return json({error:"ADMIN_NOT_AUTHORIZED"},403);
 try{
  const data=await req.json(),action=data.action;
  if(action==="students"){
   const {data:students,error}=await admin.from("profiles")
    .select("user_id,full_name,email,student_no,approval_status,enrollment_status,academic_year,class_name,created_at")
    .neq("email","hglee67@kopo.ac.kr").order("created_at",{ascending:false}).limit(1000);
   if(error)throw error;
   return json({students});
  }
  if(action==="update"){
   if(!/^[0-9a-f-]{36}$/i.test(String(data.userId||"")))return json({error:"INVALID_USER"},400);
   if(!["pending","approved","rejected","suspended"].includes(data.approvalStatus)
      ||!["enrolled","leave","withdrawn","graduated","early_employment"].includes(data.enrollmentStatus))return json({error:"INVALID_STATUS"},400);
   const {data:target,error:findError}=await admin.from("profiles").select("user_id,email,approval_status,enrollment_status").eq("user_id",data.userId).single();
   if(findError||!target)return json({error:"STUDENT_NOT_FOUND"},404);
   if(target.email?.toLowerCase()==="hglee67@kopo.ac.kr")return json({error:"CANNOT_EDIT_SUPER_ADMIN"},403);
   const jwt=req.headers.get("authorization")!.replace(/^Bearer /i,"");
   const actorClient=createClient(url,publishable,{global:{headers:{Authorization:"Bearer "+jwt}},auth:{persistSession:false}});
   const who=await actorClient.auth.getUser(jwt);
   if(!who.data.user?.id)return json({error:"ADMIN_NOT_AUTHORIZED"},403);
   const {error:changeError}=await admin.rpc("admin_change_student",{
    p_actor_user_id:who.data.user.id,p_target_user_id:target.user_id,
    p_approval_status:data.approvalStatus,p_enrollment_status:data.enrollmentStatus
   });
   if(changeError)throw changeError;
   return json({ok:true});
  }

  if(action==="mail_settings"){
    // Read-only controls; browser never receives service credentials.
    const [settings,profiles]=await Promise.all([
      admin.from("weekly_report_controls").select("report_type,enabled,updated_at"),
      admin.from("profiles").select("user_id,email").eq("approval_status","approved").eq("enrollment_status","enrolled").neq("email","hglee67@kopo.ac.kr").limit(2000)
    ]);
    if(settings.error||profiles.error)throw Error("MAIL_SETTINGS_QUERY_FAILED");
    if(!["super_admin","student"].every(type=>settings.data?.some(r=>r.report_type===type)))throw Error("MAIL_SETTINGS_INCOMPLETE");
    return json({ok:true,settings:settings.data,studentRecipientCount:(profiles.data||[]).filter(r=>r.email).length,
      professorRecipient:"hglee67@kopo.ac.kr",schedule:"매주 월요일 08:00 (한국시간)"});
  }
  if(action==="update_mail_setting"){
    if(!["super_admin","student"].includes(data.reportType)||typeof data.enabled!=="boolean")
      return json({error:"INVALID_MAIL_SETTING"},400);
    const token=req.headers.get("authorization")!.replace(/^Bearer /i,"");
    const caller=createClient(url,publishable,{auth:{autoRefreshToken:false,persistSession:false}});
    const {data:identity,error:identityError}=await caller.auth.getUser(token);
    if(identityError||!identity.user||identity.user.email?.toLowerCase()!=="hglee67@kopo.ac.kr")
      return json({error:"ADMIN_NOT_AUTHORIZED"},403);
    const {data:saved,error:saveError}=await admin.from("weekly_report_controls")
      .update({enabled:data.enabled,updated_at:new Date().toISOString(),updated_by:identity.user.id})
      .eq("report_type",data.reportType).select("report_type,enabled,updated_at").single();
    if(saveError||!saved)throw Error("MAIL_SETTING_SAVE_FAILED");
    return json({ok:true,setting:saved});
  }
  if(action==="deliveries"){
    // Only the verified super administrator can read delivery records. RLS remains closed to clients.
    const now=new Date();
    const thisMonday=Date.parse(mondayStartUTC());
    const lastCompleted=thisMonday-7*86400000;
    const kstDate=(stamp:number)=>new Date(stamp+9*3600000).toISOString().slice(0,10);
    const weeks=Array.from({length:8},(_,i)=>kstDate(lastCompleted-i*7*86400000));
    const nextRunThisWeek=thisMonday+8*3600000;
    const nextScheduledAt=new Date(nextRunThisWeek>now.getTime()?nextRunThisWeek:nextRunThisWeek+7*86400000).toISOString();
    const [logResult,profileResult,preferenceResult]=await Promise.all([
      admin.from("report_deliveries")
        .select("id,recipient_email,report_type,week_start,status,created_at,sent_at,error_message")
        .gte("week_start",weeks[weeks.length-1]).lte("week_start",weeks[0])
        .order("week_start",{ascending:false}).order("created_at",{ascending:false}).limit(2000),
      admin.from("profiles")
        .select("user_id,email").eq("approval_status","approved").eq("enrollment_status","enrolled")
        .neq("email","hglee67@kopo.ac.kr").limit(2000),
      admin.from("user_preferences").select("user_id,weekly_email_opt_in").eq("weekly_email_opt_in",true).limit(2000)
    ]);
    if(logResult.error||profileResult.error||preferenceResult.error)throw Error("DELIVERY_DATA_UNAVAILABLE");
    const logs=logResult.data||[];
    const recipients=profileResult.data||[];
    const opted=new Set((preferenceResult.data||[]).map(x=>x.user_id));
    const count=(rows:any[])=>({
      sent:rows.filter(x=>x.status==="sent").length,
      failed:rows.filter(x=>x.status==="failed").length,
      pending:rows.filter(x=>x.status==="pending").length,
      total:rows.length
    });
    const history=weeks.map(weekStart=>{
      const items=logs.filter(x=>x.week_start===weekStart);
      const faculty=items.filter(x=>x.report_type==="super_admin");
      const students=items.filter(x=>x.report_type==="student");
      return {weekStart,faculty:count(faculty),students:count(students),
        facultyLastSentAt:faculty.find(x=>x.status==="sent")?.sent_at||null};
    });
    const recentStudents=logs.filter(x=>x.report_type==="student").slice(0,30).map(x=>({
      id:x.id,recipientEmail:x.recipient_email,weekStart:x.week_start,
      status:x.status,sentAt:x.sent_at,errorMessage:x.status==="failed"?x.error_message:null
    }));
    const recentFaculty=logs.filter(x=>x.report_type==="super_admin").slice(0,8).map(x=>({
      weekStart:x.week_start,status:x.status,sentAt:x.sent_at,
      errorMessage:x.status==="failed"?x.error_message:null
    }));
    return json({ok:true,checkedAt:now.toISOString(),lastCompletedWeek:weeks[0],
      nextScheduledAt,studentSendingPaused:true,
      activeStudents:recipients.length,
      optedInStudents:recipients.filter(x=>opted.has(x.user_id)).length,
      history,recentFaculty,recentStudents});
  }
  if(action==="summary"){
    const activeRows=await admin.from("profiles").select("user_id,academic_year,class_name")
      .eq("approval_status","approved").eq("enrollment_status","enrolled").neq("email","hglee67@kopo.ac.kr");
    if(activeRows.error)throw activeRows.error;
    // Group/class selection only matches registered profile fields, never user-supplied SQL.
    const year=Number.isInteger(Number(data.academicYear))&&Number(data.academicYear)>=2020&&Number(data.academicYear)<=2100?Number(data.academicYear):null;
    const className=typeof data.className==="string"&&data.className.length<=60?data.className:null;
    const students=(activeRows.data||[]).filter(p=>(!year||p.academic_year===year)&&(!className||p.class_name===className));
    const allowed=new Set(students.map(x=>x.user_id));
    const thisStart=mondayStartUTC();
    const previousStart=new Date(Date.parse(thisStart)-7*86400000).toISOString();
    const now=new Date().toISOString();
    const attempts=(await allAttempts(previousStart)).filter(x=>allowed.has(x.user_id));
    const current=attempts.filter(x=>x.submitted_at>=thisStart&&x.submitted_at<now);
    const previous=attempts.filter(x=>x.submitted_at>=previousStart&&x.submitted_at<thisStart);
    const subjectKey=(r:any)=>r.bank==="coding"?String(r.question_id).split("-")[0]:r.bank==="ncp"?"NCP":"PRACTICAL";
    function calculate(items:any[]){
      const people=new Set(items.map(x=>x.user_id));
      const judged=(method:string)=>items.filter(x=>x.grading_method===method&&["correct","incorrect"].includes(x.result));
      const self=judged("self"),automatic=judged("automatic");
      const accuracy=(xs:any[])=>xs.length?Math.round(xs.filter(x=>x.result==="correct").length/xs.length*100):null;
      const subjects:Record<string,{attempts:number,unique:number,wrong:number}>={};
      for(const key of ["JAVA","C","PYTHON","LINUX","NCP","PRACTICAL"]){
        const rows=items.filter(x=>subjectKey(x)===key);
        subjects[key]={attempts:rows.length,unique:new Set(rows.map(x=>x.user_id+":"+x.question_id)).size,wrong:rows.filter(x=>x.result==="incorrect").length};
      }
      return {
        attempts:items.length,unique:new Set(items.map(x=>x.user_id+":"+x.bank+":"+x.question_id)).size,
        activeStudents:people.size,participationRate:allowed.size?Math.round(people.size/allowed.size*100):null,
        selfCorrect:self.filter(x=>x.result==="correct").length,selfTotal:self.length,selfAccuracy:accuracy(self),
        autoCorrect:automatic.filter(x=>x.result==="correct").length,autoTotal:automatic.length,autoAccuracy:accuracy(automatic),
        pending:items.filter(x=>x.result==="ungraded"||x.result==="timeout").length,subjects
      };
    }
    const aggregate=calculate(current),baseline=calculate(previous);
    const counts:Record<string,number>={};
    for(const r of current)if(r.result==="incorrect"){
      const key=r.bank+":"+r.question_id;counts[key]=(counts[key]||0)+1;
    }
    // With fewer than five students, suppress question-level breakdowns.
    const insufficient=allowed.size>0&&allowed.size<5;
    const topWrong=insufficient?[]:Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,12)
      .map(([question,count])=>({question,count}));
    const profileFilter={availableYears:[...new Set((activeRows.data||[]).map(p=>p.academic_year).filter(Boolean))].sort().reverse(),
      availableClasses:[...new Set((activeRows.data||[]).map(p=>p.class_name).filter(Boolean))].sort()};
    return json({ok:true,weekStart:thisStart,previousWeekStart:previousStart,cohortSize:allowed.size,
      ...profileFilter,current:aggregate,previous:baseline,topWrong,smallCohortHidden:insufficient});
  }
  return json({error:"UNKNOWN_ACTION"},400);
 }catch(e){console.error("learning-admin",e);return json({error:"SERVER_ERROR"},500);}
});
