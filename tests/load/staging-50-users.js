/* k6: 50 simultaneously active, distinct approved test users.
 * DO NOT run this against production. A separate staging Supabase project
 * and disposable staging accounts are mandatory. */
import http from "k6/http";
import {check,sleep} from "k6";
import {URL} from "k6/url";
const BASE=String(__ENV.STAGING_BASE_URL||"").replace(/\/$/,"");
const DB=String(__ENV.STAGING_SUPABASE_URL||"").replace(/\/$/,"");
const KEY=String(__ENV.STAGING_SUPABASE_ANON_KEY||"");
const TARGET=Number(__ENV.CONCURRENT_VUS||50);
const USERS_JSON=__ENV.STAGING_USERS_JSON||"[]";
const PRODUCTION_PORTAL="portal.k-bigdata.kr";
const PRODUCTION_PROJECT="zjsindkakjfzmjgrkaou";
const validStaging=()=>{
 try{
  const base=new URL(BASE), db=new URL(DB);
  return base.protocol==="https:"&&db.protocol==="https:"&&
   base.hostname!==PRODUCTION_PORTAL&&!base.hostname.endsWith("."+PRODUCTION_PORTAL)&&
   !db.hostname.includes(PRODUCTION_PROJECT)&&base.hostname!==db.hostname&&
   !BASE.includes("github.io")&&
   [10,25,50,75].includes(TARGET);
 }catch{return false;}
};
export const options={
 stages:[
  {duration:"2m",target:Math.min(TARGET,10)},
  {duration:"3m",target:Math.min(TARGET,25)},
  {duration:"9m",target:TARGET},
  {duration:"2m",target:0}
 ],
 thresholds:{
  http_req_failed:["rate<0.01"],
  http_req_duration:["p(95)<1000","p(99)<3000"]
 },
 userAgent:"kbigdata-staging-load-test/1.0"
};
export function setup(){
 if(!validStaging())throw Error("STAGING_REQUIRED: production targets and unknown hostnames are forbidden");
 if(!KEY||KEY.startsWith("sb_secret_"))throw Error("STAGING_PUBLISHABLE_KEY_REQUIRED");
 let users;
 try{users=JSON.parse(USERS_JSON);}catch{throw Error("INVALID_STAGING_USERS_JSON");}
 if(!Array.isArray(users)||users.length<TARGET||
   new Set(users.map(x=>x.email)).size<TARGET||
   users.some(x=>typeof x.email!=="string"||typeof x.password!=="string"||!x.password))
  throw Error("ONE_DISTINCT_STAGING_ACCOUNT_PER_VU_REQUIRED");
 return {users:users.slice(0,TARGET)};
}
const api={headers:{"apikey":KEY,"Content-Type":"application/json"}};
let token="",userId="";
function requestApi(path,method="GET",payload){
 const headers={...api.headers,Authorization:"Bearer "+token};
 return http.request(method,DB+path,payload===undefined?null:JSON.stringify(payload),{headers,timeout:"12s"});
}
function ensureSignedIn(user){
 if(token&&userId)return true;
 const response=http.post(DB+"/auth/v1/token?grant_type=password",
  JSON.stringify({email:user.email,password:user.password}),{headers:api.headers,timeout:"12s"});
 if(!check(response,{"staging password login succeeds":r=>r.status===200}))return false;
 let body;
 try{body=response.json();}catch{return false;}
 if(!body?.access_token||!body?.user?.id)return false;
 token=body.access_token;userId=body.user.id;
 const portal=requestApi("/rest/v1/rpc/start_portal_session","POST",{});
 return check(portal,{"portal session starts":r=>r.status===200});
}
export default function(data){
 const user=data.users[__VU-1];
 if(!user)return;
 const page=["index.html","coding.html","practical.html","ncp.html","schedule.html"][(__ITER+__VU)%5];
 const html=http.get(BASE+"/"+page,{timeout:"12s"});
 check(html,{"static page available":r=>r.status===200});
 if(!ensureSignedIn(user)){sleep(3);return;}
 const access=requestApi("/rest/v1/rpc/portal_learning_access","POST",{});
 if(!check(access,{"read access available":r=>r.status===200})){sleep(3);return;}
 const pref={headers:{...api.headers,Authorization:"Bearer "+token}};
 const read=http.batch([
  ["GET",DB+"/rest/v1/learning_progress?select=bank,question_id,attempts_count&bank=eq.coding&limit=100",null,pref],
  ["GET",DB+"/rest/v1/study_weekly_plans?select=week_start,weekdays&limit=5",null,pref],
  ["GET",DB+"/rest/v1/help_requests?select=id,status&limit=5",null,pref],
  ["GET",DB+"/functions/v1/public-calendar-cache",null,{timeout:"12s"}]
 ]);
 for(const response of read)check(response,{"study and catalog reads succeed":r=>r.status===200});
 const timestamp=Date.now(),id="load-"+__VU+"-"+__ITER+"-"+timestamp;
 const attempts=[0,1].map(i=>({
  user_id:userId,bank:"coding",question_id:"JAVA-001",result:"ungraded",
  grading_method:"self",client_attempt_id:id+"-"+i,answer_text:"load test",
  metadata:{source:"load-test",staging_only:true},used_hint:false
 }));
 const saved=http.post(DB+"/rest/v1/learning_attempts?on_conflict=user_id,client_attempt_id",JSON.stringify(attempts),{
  headers:{...pref.headers,Prefer:"resolution=ignore-duplicates,return=minimal"},timeout:"12s"
 });
 check(saved,{"batch answer save succeeds":r=>r.status===201||r.status===200||r.status===204});
 const day=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
 const room=requestApi("/rest/v1/rpc/room_schedule","POST",{p_date:day});
 check(room,{"room schedule available":r=>r.status===200});
 // A start+finish round-trip checks transaction locking. Staging only!
 const started=requestApi("/rest/v1/rpc/study_start_session","POST",{});
 if(check(started,{"staging study session starts":r=>r.status===200})){
  const done=requestApi("/rest/v1/rpc/study_finish_session","POST",{});
  check(done,{"staging study session finishes":r=>r.status===200});
 }
 sleep(10+Math.random()*10);
}
