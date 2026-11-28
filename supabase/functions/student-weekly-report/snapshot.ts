// Shared snapshot source for the dashboard and student email. Never invoked by an anonymous request.
import {createClient} from "npm:@supabase/supabase-js@2.49.10";
import {evaluateStudentReadiness} from "../ready-api/rules.mjs";
import {dateMs,shift,summarize,scheduleEvents,suggestedTasks} from "./report.mjs";
const url=Deno.env.get("SUPABASE_URL")!,key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
export const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
export const read=async(q:any)=>{const {data,error}=await q;if(error)throw Error("DATABASE_ERROR");return data};
export const eligible=()=>db.from("profiles").select("user_id,academic_year").eq("signup_type","student").eq("approval_status","approved").eq("enrollment_status","enrolled");
const rows=async(build:(from:number,to:number)=>any)=>{const results:any[]=[];for(let i=0;i<100000;i+=1000){const page=await read(build(i,i+999));results.push(...page);if(page.length<1000)return results}throw Error("REPORT_DATA_LIMIT")};
export async function calendar(){
 try{
  const res=await fetch(url+"/functions/v1/public-calendar-cache",{headers:{apikey:key,Authorization:"Bearer "+key},signal:AbortSignal.timeout(12000)});
  if(res.ok){const value=await res.json();if(value.ok===true&&Array.isArray(value.events))return {events:value.events,checked_at:value.refreshedAt||value.updatedAt||null,available:true,stale:value.stale===true};}
 }catch{/* Fall back to the shared published snapshot. */}
 const cached=await read(db.from("portal_calendar_snapshot").select("payload,refreshed_at").eq("singleton",true).maybeSingle());
 if(cached?.payload?.ok===true&&Array.isArray(cached.payload.events))return {events:cached.payload.events,checked_at:cached.refreshed_at,available:true,stale:true};
 return {events:[],available:false,checked_at:null,stale:false};
}
export const getReport=(id:string,week:string)=>read(db.from("student_weekly_reports").select("week_start,created_at,payload,completed_tasks").eq("user_id",id).eq("week_start",week).maybeSingle());
export async function generate(member:any,week:string,cal?:any){
 const id=member.user_id,existing=await getReport(id,week);
 if(existing)return existing;
 const start=new Date(dateMs(shift(week,-21))).toISOString(),end=new Date(dateMs(shift(week,7))).toISOString();
 const [attempts,written,sessions,plan,profile,repos,checks,repoChecks,certs,calendarData,certEvents,interviewPractices]=await Promise.all([
  rows((a,b)=>db.from("learning_attempts").select("bank,question_id,result,submitted_at").eq("user_id",id).gte("submitted_at",start).lt("submitted_at",end).order("submitted_at").order("id").range(a,b)),
  rows((a,b)=>db.from("written_learning_attempts").select("exam_type,question_id,attempted_at,correct").eq("user_id",id).gte("attempted_at",Date.parse(start)).lt("attempted_at",Date.parse(end)).order("attempted_at").order("exam_type").order("question_id").range(a,b)),
  rows((a,b)=>db.from("study_sessions").select("started_at,duration_seconds,status,review_outcome").eq("user_id",id).gte("started_at",start).lt("started_at",end).order("started_at").order("id").range(a,b)),
  read(db.from("study_weekly_plans").select("weekdays").eq("user_id",id).eq("week_start",week).maybeSingle()),
  read(db.from("ready_profiles").select("data,updated_at").eq("user_id",id).maybeSingle()),
  read(db.from("ready_repositories").select("repo_id").eq("user_id",id).eq("active",true).order("is_primary",{ascending:false}).order("display_order")),
  read(db.from("ready_student_checks").select("kind,checked_at,data").eq("user_id",id)),
  read(db.from("ready_repository_checks").select("repo_id,kind,checked_at,data").eq("user_id",id)),
  read(db.from("student_certifications").select("pass_status,verification_status").eq("user_id",id)),
  cal??calendar(),
  read(db.from("certification_exam_schedules").select("certificate_code,exam_round,event_type,start_date,end_date").eq("published",true).lte("start_date",shift(week,13)).gte("end_date",shift(week,7))),
  rows((a,b)=>db.from("interview_practice_events").select("question_id,practiced_at").eq("user_id",id).gte("practiced_at",new Date(dateMs(week)).toISOString()).lt("practiced_at",end).order("practiced_at").order("mark_id").range(a,b))
 ]);
 const learning=summarize(week,attempts,written,sessions,plan,interviewPractices);
 const c=Object.fromEntries(checks.map((x:any)=>[x.kind,{...x.data,checked_at:x.checked_at}]));
 const primary=Object.fromEntries(repoChecks.filter((x:any)=>x.repo_id===repos[0]?.repo_id).map((x:any)=>[x.kind,{...x.data,checked_at:x.checked_at}]));
 const evaluation=evaluateStudentReadiness({...profile?.data,grade:String(member.academic_year||"")},{...c,...primary,publicPortfolio:c.portfolio,repositoryCount:repos.length});
 const career={registered:!!profile,status:profile?(evaluation.assessment_pending?"점검 확인 필요":evaluation.status):"미등록",checked_at:evaluation.github_checked_at||null,
  github_days:evaluation.github_fresh&&evaluation.github.check_status==="SUCCESS"?evaluation.github.active_days_7d:null,
  repositories:repos.length,readme:evaluation.readme_pending?"점검 확인 필요":evaluation.readme.status,
  portfolio:evaluation.portfolio_pending?"점검 확인 필요":evaluation.portfolio.status,
  documents:evaluation.documents,certificates:certs.filter((c:any)=>c.pass_status==="final").length,
  issues:profile?evaluation.priorityIssues.map((i:any)=>({code:i.code,label:i.label})):[]};
 const events=scheduleEvents(calendarData.events,member.academic_year,week);
 const labels:Record<string,string>={registration:"접수",exam:"시험",result:"합격 발표"};
 for(const e of certEvents){const title=String(e.certificate_code).toUpperCase()+" "+e.exam_round+"회 "+(labels[e.event_type]||e.event_type);if(!events.some(x=>x.title===title&&x.start===e.start_date))events.push({title,start:e.start_date,end:e.end_date,time:"",category:"certificate",important:false})}
 events.sort((a,b)=>a.start.localeCompare(b.start)||a.time.localeCompare(b.time));
 const payload={version:1,week_start:week,week_end:shift(week,6),schedule_start:shift(week,7),schedule_end:shift(week,13),learning,career,calendar:{available:calendarData.available,stale:calendarData.stale,checked_at:calendarData.checked_at,events},tasks:suggestedTasks(learning,career,events)};
 await read(db.from("student_weekly_reports").upsert({user_id:id,week_start:week,payload},{onConflict:"user_id,week_start",ignoreDuplicates:true}));
 return await getReport(id,week);
}
