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
function learningPeriod(mode:"week"|"month",offset:number){
 const KST=9*3600000,DAY=86400000,now=Date.now(),today=new Date(now+KST);
 const y=today.getUTCFullYear(),m=today.getUTCMonth(),d=today.getUTCDate();
 let start:number,end:number,previousStart:number,previousEnd:number;
 if(mode==="week"){
  const monday=d-(today.getUTCDay()+6)%7;
  start=Date.UTC(y,m,monday+offset*7)-KST;
  end=start+7*DAY;
  previousStart=start-7*DAY;
  previousEnd=start;
 }else{
  start=Date.UTC(y,m+offset,1)-KST;
  end=Date.UTC(y,m+offset+1,1)-KST;
  previousStart=Date.UTC(y,m+offset-1,1)-KST;
  previousEnd=start;
 }
 // For a live period compare only the same elapsed time in the prior period.
 const partial=offset===0;
 const currentEnd=partial?Math.min(now,end):end;
 const compareEnd=partial?Math.min(previousEnd,previousStart+Math.max(0,currentEnd-start)):previousEnd;
 return {start:new Date(start).toISOString(),end:new Date(end).toISOString(),
  previousStart:new Date(previousStart).toISOString(),previousEnd:new Date(previousEnd).toISOString(),
  currentEnd:new Date(currentEnd).toISOString(),compareEnd:new Date(compareEnd).toISOString(),partial};
}
async function allAttempts(from:string,to:string){
 let out:any[]=[];
 for(let page=0;page<100;page++){
  const {data,error}=await admin.from("learning_attempts")
   .select("user_id,bank,question_id,result,grading_method,submitted_at")
   .gte("submitted_at",from).lt("submitted_at",to).order("submitted_at",{ascending:false})
   .range(page*1000,(page+1)*1000-1);
  if(error)throw error;
  out=out.concat(data||[]);
  if(!data||data.length<1000)break;
   if(page===99)throw Error("LEARNING_ATTEMPTS_LIMIT_REACHED");
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

  if(action==="reaggregate"){
    const mode=data.period==="week"?"week":data.period==="month"?"month":null;
    const offset=Number(data.offset);
    if(!mode||!Number.isInteger(offset)||offset>=0||offset<(mode==="week"?-52:-24))
      return json({error:"INVALID_PERIOD"},400);
    const range=learningPeriod(mode,offset);
    const startDate=new Date(Date.parse(range.start)+9*3600000).toISOString().slice(0,10);
    const {data:result,error}=await admin.rpc("learning_refresh_closed_period",{
      p_period_type:mode,p_period_start:startDate,p_trigger:"manual_admin"
    });
    if(error||!result?.ok)return json({error:"REAGGREGATION_FAILED",jobId:result?.jobId??null},500);
    return json({ok:true,result});
  }
  if(action==="summary"){
    const grade=data.grade===undefined||data.grade===null||data.grade===""?0:Number(data.grade);
    if(!Number.isInteger(grade)||![0,1,2].includes(grade))
      return json({error:"INVALID_GRADE"},400);
    const mode=data.period===undefined||data.period==="week"?"week":data.period==="month"?"month":null;
    const offset=data.offset===undefined?0:Number(data.offset);
    if(!mode||!Number.isInteger(offset)||offset>0||offset<(mode==="week"?-52:-24))
      return json({error:"INVALID_PERIOD"},400);
    const range=learningPeriod(mode,offset);
    const dateKst=(iso:string)=>new Date(Date.parse(iso)+9*3600000).toISOString().slice(0,10);
    const startDate=dateKst(range.start),previousDate=dateKst(range.previousStart);
    async function getSaved(date:string){
      const {data:row,error}=await admin.from("learning_period_stats")
        .select("period_type,period_start,period_end,grade,cohort_size,metrics,study_metrics,top_wrong,cohort_basis,calculated_at")
        .eq("period_type",mode).eq("period_start",date).eq("grade",grade).maybeSingle();
      if(error)throw error;
      return row;
    }
    // A current period is computed from live database rows. Closed periods are never
    // recomputed by a normal page visit; the only source is the saved snapshot.
    const [past,previous]=await Promise.all([
      offset===0?Promise.resolve(null):getSaved(startDate),
      getSaved(previousDate)
    ]);
    if(offset<0&&!past){
      const {data:jobs,error:jobError}=await admin.from("learning_aggregation_jobs")
        .select("job_status,finished_at")
        .eq("period_type",mode).eq("period_start",startDate)
        .order("started_at",{ascending:false}).limit(1);
      if(jobError)throw jobError;
      return json({ok:true,period:mode,offset,periodStart:range.start,periodEnd:range.end,
        snapshotStatus:jobs?.[0]?.job_status==="failed"?"failed":"missing",
        previousAvailable:previous!==null,current:null,previous:previous?.metrics??null});
    }
    let report:any;
    if(offset===0){
      const {data:computed,error}=await admin.rpc("learning_compute_interval",{
        p_from:range.start,p_to:range.currentEnd,p_grade:grade,
        p_roster_type:"live",p_roster_period:mode,p_roster_start:startDate
      });
      if(error||!computed?.current)throw error||Error("LIVE_AGGREGATION_UNAVAILABLE");
      report=computed;
    }else{
      report={cohortSize:past.cohort_size,current:past.metrics,study:past.study_metrics,
        topWrong:past.top_wrong,smallCohortHidden:past.cohort_size>0&&past.cohort_size<5};
    }
    return json({ok:true,period:mode,offset,periodStart:range.start,periodEnd:range.end,
      currentDataEnd:range.currentEnd,previousPeriodStart:range.previousStart,
      previousDataEnd:offset===0?range.previousEnd:range.previousEnd,
      partial:offset===0,snapshotStatus:offset===0?"live":"completed",
      cohortBasis:past?.cohort_basis??null,calculatedAt:past?.calculated_at??null,
      previousAvailable:previous!==null,cohortSize:report.cohortSize,
      current:report.current,previous:previous?.metrics??null,study:report.study,
      topWrong:report.topWrong,smallCohortHidden:report.smallCohortHidden});
  }
  return json({error:"UNKNOWN_ACTION"},400);
 }catch(e){console.error("learning-admin",e);return json({error:"SERVER_ERROR"},500);}
});
