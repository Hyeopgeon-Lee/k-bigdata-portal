/** Public, read-only and identity-free calendar gateway.
 * One upstream request per warm Edge isolate per five minutes; concurrent
 * requests to the same isolate share a promise. No Calendar credentials. */
const UPSTREAM="https://script.google.com/macros/s/AKfycbztQYTW1YT8e01ZDlcD_JUUm-UdXI7zinxxcHWRCaes7c7I3qK7-Fn8WA07hJjP-vXh/exec";
const ALLOWED_ORIGIN="https://portal.k-bigdata.kr";
const FRESH_MS=5*60*1000;
const STALE_MS=60*60*1000;
const MAX_EVENTS=4000;
const allowedCategories=new Set(["academic","exam","project","employment","certificate","event"]);
type EventRow={
 id:string;title:string;category:string;startDate:string;endDate:string;
 startTime:string;important:boolean;published:boolean;source:string;targetGrade:string
};
type Snapshot={ok:true;updatedAt:string;refreshedAt:string;events:EventRow[];stale?:boolean};
let snapshot:Snapshot|null=null;
let loadedAt=0;
let inFlight:Promise<Snapshot>|null=null;
const headers=(cache:string)=>({
 "Content-Type":"application/json; charset=utf-8",
 "Access-Control-Allow-Origin":ALLOWED_ORIGIN,
 "Access-Control-Allow-Methods":"GET, OPTIONS",
 "Access-Control-Allow-Headers":"content-type, apikey, authorization",
 "Vary":"Origin",
 "Cache-Control":cache,
 "X-Content-Type-Options":"nosniff"
});
const isDate=(s:unknown):s is string=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s);
function cleanse(raw:unknown):EventRow[]{
 if(!Array.isArray(raw)||raw.length>MAX_EVENTS)throw Error("INVALID_EVENT_COUNT");
 return raw.flatMap((item:unknown)=>{
  if(!item||typeof item!=="object")return [];
  const e=item as Record<string,unknown>;
  if(e.published!==true||typeof e.title!=="string"||!e.title.trim()||
   e.title.length>140||!allowedCategories.has(String(e.category))||
   !isDate(e.startDate)||!isDate(e.endDate)||e.startDate>e.endDate)return [];
  const grade=["1","2"].includes(String(e.targetGrade))?String(e.targetGrade):"all";
  return [{
   id:String(e.id||"").slice(0,100),title:e.title.trim(),category:String(e.category),
   startDate:e.startDate,endDate:e.endDate,
   startTime:typeof e.startTime==="string"&&/^([01]\d|2[0-3]):[0-5]\d$/.test(e.startTime)?e.startTime:"",
   important:e.important===true,published:true,
   source:e.source==="portal"?"portal":"calendar",targetGrade:grade
  }];
 });
}
const dbUrl=Deno.env.get("SUPABASE_URL")||"";
const dbKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const dbHeaders=()=>({"apikey":dbKey,"Authorization":"Bearer "+dbKey,"Content-Type":"application/json"});
async function readShared():Promise<Snapshot|null>{
 if(!dbUrl||!dbKey)return null;
 try{
  const res=await fetch(dbUrl+"/rest/v1/portal_calendar_snapshot?singleton=eq.true&select=payload,refreshed_at",{headers:dbHeaders(),signal:AbortSignal.timeout(3000)});
  if(!res.ok)return null;
  const [row]=await res.json();
  if(!row?.payload||row.payload.ok!==true)return null;
  const age=Date.now()-Date.parse(row.refreshed_at);
  if(!Number.isFinite(age)||age<0||age>=STALE_MS)return null;
  const value:Snapshot={ok:true,updatedAt:String(row.payload.updatedAt||"").slice(0,100),refreshedAt:row.refreshed_at,events:cleanse(row.payload.events)};
  snapshot=value;loadedAt=Date.parse(row.refreshed_at);
  return value;
 }catch{return null;}
}
async function writeShared(value:Snapshot){
 if(!dbUrl||!dbKey)return;
 try{
  const res=await fetch(dbUrl+"/rest/v1/portal_calendar_snapshot?on_conflict=singleton",{method:"POST",headers:{...dbHeaders(),"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({singleton:true,payload:value,refreshed_at:value.refreshedAt}),signal:AbortSignal.timeout(3000)});
  if(!res.ok)console.warn("Shared calendar cache update failed",res.status);
 }catch{console.warn("Shared calendar cache unavailable");}
}
async function refresh():Promise<Snapshot>{
 const response=await fetch(UPSTREAM,{
  headers:{"Accept":"application/json"},
  signal:AbortSignal.timeout(10000)
 });
 if(!response.ok)throw Error("UPSTREAM_HTTP_"+response.status);
 const text=await response.text();
 if(text.length>600000)throw Error("UPSTREAM_TOO_LARGE");
 const body=JSON.parse(text);
 if(body?.ok!==true)throw Error("UPSTREAM_NOT_READY");
 const events=cleanse(body.events);
 const next:Snapshot={
  ok:true,updatedAt:typeof body.updatedAt==="string"?body.updatedAt.slice(0,100):"",
  refreshedAt:new Date().toISOString(),events
 };
 snapshot=next;loadedAt=Date.now();
 await writeShared(next);
 return next;
}
async function resolve():Promise<Snapshot>{
 if(snapshot&&Date.now()-loadedAt<FRESH_MS)return snapshot;
 if(!inFlight){
  inFlight=(async()=>{
   const shared=await readShared();
   if(shared&&Date.now()-loadedAt<FRESH_MS)return shared;
   return refresh();
  })().finally(()=>{inFlight=null;});
 }
 // Serve a confirmed shared snapshot during refresh where Edge background tasks are supported.
 const runtime=(globalThis as unknown as {EdgeRuntime?:{waitUntil:(p:Promise<unknown>)=>void}}).EdgeRuntime;
 if(runtime&&snapshot&&Date.now()-loadedAt<STALE_MS){
  runtime.waitUntil(inFlight.catch(()=>{}));
  return {...snapshot,stale:true};
 }
 try{return await inFlight;}
 catch(error){
  console.error("Public calendar source failed",error instanceof Error?error.message:"UNKNOWN");
  if(snapshot&&Date.now()-loadedAt<STALE_MS)return {...snapshot,stale:true};
  throw error;
 }
}
Deno.serve(async request=>{
 const origin=request.headers.get("origin");
 if(origin&&origin!==ALLOWED_ORIGIN)return new Response(null,{status:403});
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:headers("no-store")});
 if(request.method!=="GET")return new Response(JSON.stringify({ok:false,error:"METHOD_NOT_ALLOWED"}),{status:405,headers:headers("no-store")});
 try{
  const data=await resolve();
  return new Response(JSON.stringify(data),{
   status:200,headers:headers(data.stale?"public, max-age=20":"public, max-age=60, s-maxage=300, stale-while-revalidate=60")
  });
 }catch{
  return new Response(JSON.stringify({ok:false,error:"PUBLIC_CALENDAR_UNAVAILABLE"}),{status:503,headers:headers("no-store")});
 }
});
