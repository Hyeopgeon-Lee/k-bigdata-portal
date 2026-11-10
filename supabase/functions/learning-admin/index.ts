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
   const {data:activeStudents,error:studentError}=await admin.from("profiles").select("user_id").eq("approval_status","approved").eq("enrollment_status","enrolled").neq("email","hglee67@kopo.ac.kr");
   if(studentError)throw studentError;
   const allowed=new Set((activeStudents||[]).map(x=>x.user_id));
   const records=(await allAttempts(mondayStartUTC())).filter(x=>allowed.has(x.user_id)),participants=new Set(records.map(x=>x.user_id));
   const subjects:Record<string,number>={coding:0,ncp:0,practical:0};
   const wrong:Record<string,number>={};
   for(const r of records){subjects[r.bank]=(subjects[r.bank]||0)+1;
    if(r.result==="incorrect")wrong[r.bank+":"+r.question_id]=(wrong[r.bank+":"+r.question_id]||0)+1;
   }
   const topWrong=Object.entries(wrong).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([question,count])=>({question,count}));
   return json({attempts:records.length,unique:new Set(records.map(x=>x.user_id+":"+x.bank+":"+x.question_id)).size,activeStudents:participants.size,subjects,topWrong});
  }
  return json({error:"UNKNOWN_ACTION"},400);
 }catch(e){console.error("learning-admin",e);return json({error:"SERVER_ERROR"},500);}
});
