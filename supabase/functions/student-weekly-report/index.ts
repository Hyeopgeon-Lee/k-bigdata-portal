import {createClient} from "npm:@supabase/supabase-js@2.49.10";
import {githubIdentity} from "./oidc.ts";
import {lastWeek,validWeek,reportForCertificates} from "./report.mjs";
import {db,read,eligible,calendar,getReport,generate} from "./snapshot.ts";
const url=Deno.env.get("SUPABASE_URL")!,anon=Deno.env.get("SUPABASE_ANON_KEY")!;
const headers={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Access-Control-Allow-Origin":"https://portal.k-bigdata.kr","Access-Control-Allow-Headers":"authorization, apikey, x-client-info, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"};
const reply=(data:any,status=200)=>new Response(JSON.stringify(data),{status,headers});
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return reply({error:"METHOD"},405);
 try{
 const body=await req.json().catch(()=>({}));
 const latest=lastWeek();
 if(body.action==="scheduled"){
  const event=await githubIdentity(req);
  if(!event)return reply({error:"NOT_AUTHORIZED"},403);
  if(event==="push"||body.dry_run===true)return reply({ok:true,dry_run:true,week:latest});
  const offset=Number(body.offset??0);if(!Number.isSafeInteger(offset)||offset<0||offset>10000)return reply({error:"BAD_OFFSET"},400);
  const members=await read(eligible().order("user_id").range(offset,offset+4));
  const cal=members.length?await calendar():null;
  const results=await Promise.allSettled(members.map((m:any)=>generate(m,latest,cal)));
  const failures=results.filter(r=>r.status==="rejected").length;
  return reply({ok:failures===0,processed:members.length,failures,next:members.length===5?offset+5:null,week:latest},failures?500:200);
 }
 const token=req.headers.get("authorization")?.replace(/^Bearer /i,"")||"";
 if(!token)return reply({error:"LOGIN_REQUIRED"},401);
 const caller=createClient(url,anon,{global:{headers:{Authorization:"Bearer "+token}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data:auth,error}=await caller.auth.getUser(token);
 if(error||!auth.user||!auth.user.email_confirmed_at)return reply({error:"LOGIN_REQUIRED"},401);
 const access=await read(caller.rpc("ready_access"));
 if(access?.admin===true||access?.read!==true||access?.write!==true)return reply({error:"STUDENT_ONLY"},403);
 const member=await read(eligible().eq("user_id",auth.user.id).maybeSingle());
 if(!member)return reply({error:"STUDENT_ONLY"},403);
 const week=body.week_start??latest;
 if(!validWeek(week)||week>latest)return reply({error:"INVALID_WEEK"},400);
 if(body.action==="task"){
  if(typeof body.task_id!=="string"||typeof body.done!=="boolean")return reply({error:"BAD_TASK"},400);
  const completed=await read(db.rpc("student_weekly_report_task",{p_user:member.user_id,p_week:week,p_task:body.task_id,p_done:body.done}));
  if(!Array.isArray(completed))return reply({error:"TASK_NOT_FOUND"},404);
  return reply({completed_tasks:completed});
 }
 if(body.action!=="mine")return reply({error:"BAD_ACTION"},400);
 // Apply the current student's certificate policy to this view, including already saved weeks.
 const [report,history,certificates]=await Promise.all([
  week===latest?generate(member,week):getReport(member.user_id,week),
  read(db.from("student_weekly_reports").select("week_start").eq("user_id",member.user_id).order("week_start",{ascending:false}).limit(104)),
  read(db.from("student_certifications").select("certificate_code,pass_status,verification_status").eq("user_id",member.user_id).in("certificate_code",["engineer","industrial","ncp"]))
 ]);
 // Ensure the just-generated latest week appears in the selector even if the parallel history query completed first.
 const weeks=[...new Set([...(report?[report.week_start]:[]),...history.map((w:any)=>w.week_start)])].sort().reverse();
 return reply({report:reportForCertificates(report,certificates),latest,weeks});
 }catch{console.error("Student weekly report request failed");return reply({error:"REPORT_UNAVAILABLE"},500)}
});
