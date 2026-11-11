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
      ||!["enrolled","leave","withdrawn","graduated"].includes(data.enrollmentStatus))return json({error:"INVALID_STATUS"},400);
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
