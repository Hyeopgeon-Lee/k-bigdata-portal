import {createClient} from "npm:@supabase/supabase-js@2.49.10";
import {parseSqldHtml,parseQnetJson} from "./parsers.mjs";
const repo="Hyeopgeon-Lee/k-bigdata-portal";
const workflow=repo+"/.github/workflows/certification-schedule-sync.yml@refs/heads/main";
const audience="kbigdata-certification-schedule-sync";
const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
 {auth:{persistSession:false,autoRefreshToken:false}});
const response=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,
 headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});

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




type Source='qnet_api'|'dataq_official';
type Event={certificate_code:string;exam_year:number;exam_round:number;event_type:string;start_date:string;end_date:string;official_url:string;published:boolean};
type Summary={source_type:Source;source_year:number|null;status:string;candidate_events:number;inserted_events:number;updated_events:number;unchanged_events:number;skipped_events:number;message:string};
const qnetUrl='https://apis.data.go.kr/B490007/qualExamSchd/getQualExamSchdList';
const sqldUrl='https://www.dataq.or.kr/www/accept/schedule.do';
const todayKst=()=>new Date(Date.now()+9*3600000).toISOString().slice(0,10);
const summary=(source:Source,year:number|null,status='success',message=''):Summary=>({
 source_type:source,source_year:year,status,candidate_events:0,
 inserted_events:0,updated_events:0,unchanged_events:0,skipped_events:0,message
});
function errorCode(error:unknown):string {
 // Never leak secrets, credentials, URLs containing a serviceKey, raw HTML, or student records.
 const value=error&&typeof error==='object'?
  (typeof (error as any).code==='string'?'CODE_'+(error as any).code:String((error as any).message||'UNKNOWN_ERROR')):
  'UNKNOWN_ERROR';
 return value.replace(/[^\w가-힣 -]/g,'_').slice(0,150);
}
async function logRun(s:Summary,dryRun:boolean){
 const {error}=await db.from('certification_schedule_sync_runs').insert({
  ...s,run_mode:dryRun?'dry_run':'production'
 });
 if(error)console.error('SYNC_AUDIT_FAILED',error.code);
}
async function processEvents(s:Summary,events:Event[],dryRun:boolean){
 s.candidate_events=events.length;
 if(!events.length)return s;
 if(events.length>100)throw Error('UNEXPECTED_EVENT_COUNT');
 const year=events[0].exam_year,code=events[0].certificate_code;
 if(events.some(x=>x.exam_year!==year||x.certificate_code!==code||!x.published))
   throw Error('INVALID_EVENT_SET');
 const {data:existing,error:readErr}=await db.from('certification_exam_schedules')
  .select('id,certificate_code,exam_year,exam_round,event_type,start_date,end_date,official_url,published,source_type,manual_override')
  .eq('exam_year',year).eq('certificate_code',code);
 if(readErr)throw readErr;
 const byKey=new Map((existing||[]).map(x=>[x.exam_round+'|'+x.event_type,x]));
 const newEvents:Event[]=[];
 for(const event of events){
  const match=byKey.get(event.exam_round+'|'+event.event_type);
  if(!match){newEvents.push(event);continue;}
  if(match.manual_override||match.source_type==='manual'||
     match.source_type!==s.source_type){
   s.skipped_events++;continue;
  }
  const changed=['start_date','end_date','official_url','published'].some(field=>
     String(match[field as keyof typeof match])!==String(event[field as keyof Event]));
  if(!changed){s.unchanged_events++;continue;}
  if(!dryRun){
    const {error:updateErr}=await db.from('certification_exam_schedules')
     .update({...event,source_type:s.source_type,source_synced_at:new Date().toISOString()})
     .eq('id',match.id).eq('source_type',s.source_type).eq('manual_override',false);
    if(updateErr)throw updateErr;
  }
  s.updated_events++;
 }
 if(newEvents.length){
  if(!dryRun){
   const at=new Date().toISOString();
   const {error:insertErr}=await db.from('certification_exam_schedules')
    .upsert(newEvents.map(x=>({...x,source_type:s.source_type,source_synced_at:at,manual_override:false})),
      {onConflict:'certificate_code,exam_year,exam_round,event_type',ignoreDuplicates:true});
   if(insertErr)throw insertErr;
  }
  s.inserted_events+=newEvents.length;
 }
 return s;
}
async function runSqld(dryRun:boolean){
 let s=summary('dataq_official',null);
 try{
  const page=await fetch(sqldUrl,{
    headers:{'User-Agent':'Mozilla/5.0 (compatible; KBigdataExamScheduleSync/1.0; educational calendar)','Accept':'text/html'},
    signal:AbortSignal.timeout(16000)
  });
  if(!page.ok)throw Error('SQLD_HTTP_'+page.status);
  const html=await page.text();
  const parsed=parseSqldHtml(html);
  s.source_year=parsed.year;
  // The official page only publishes its currently confirmed year; no guessed next-year dates.
  await processEvents(s,parsed.events,dryRun);
  s.message='OFFICIAL_ANNUAL_TABLE_'+parsed.year+'_ROUNDS_'+parsed.rounds;
 }catch(error){
  s.status=errorCode(error).includes('HTTP_')?'source_unavailable':'parse_failed';
  s.message=errorCode(error);
 }
 await logRun(s,dryRun);
 return s;
}
function keyForPublicApi(){
 const raw=(Deno.env.get('DATA_GO_KR_SERVICE_KEY')||'').trim();
 if(!raw)return '';
 // Both encoded and decoded data.go.kr keys can be supplied; URLSearchParams handles escaping once.
 if(raw.includes('%')){try{return decodeURIComponent(raw)}catch{return raw}}
 return raw;
}
async function runQnet(year:number,code:'engineer'|'industrial',key:string,dryRun:boolean){
 const s=summary('qnet_api',year);
 if(!key){
  s.status='missing_key';s.message='DATA_GO_KR_SERVICE_KEY_NOT_CONFIGURED';
  await logRun(s,dryRun);return s;
 }
 try{
  const url=new URL(qnetUrl);
  for(const [k,v] of Object.entries({
    serviceKey:key,numOfRows:'100',pageNo:'1',dataFormat:'json',implYy:String(year),
    qualgbCd:'T',jmCd:code==='engineer'?'1320':'2290'
  }))url.searchParams.set(k,v);
  // Never print URL: it contains the service key.
  const upstream=await fetch(url,{
    headers:{'Accept':'application/json','User-Agent':'KBigdataExamScheduleSync/1.0'},
    signal:AbortSignal.timeout(16000)
  });
  if(!upstream.ok)throw Error('QNET_HTTP_'+upstream.status);
  const body=await upstream.json();
  const parsed=parseQnetJson(body,year,code);
  if(parsed.rounds===0){
    s.status='not_published';
    s.message='NO_OFFICIAL_ROUND_PUBLISHED_'+code+'_'+year;
  }else{
    await processEvents(s,parsed.events,dryRun);
    s.message='OFFICIAL_QNET_API_'+code+'_'+year+'_ROUNDS_'+parsed.rounds;
  }
 }catch(error){
  const msg=errorCode(error);
  s.status=msg.startsWith('QNET_HTTP_')?'source_unavailable':'parse_failed';
  s.message=msg;
 }
 await logRun(s,dryRun);
 return s;
}
Deno.serve(async req=>{
 if(req.method!=='POST')return response({ok:false,error:'METHOD_NOT_ALLOWED'},405);
 const origin=await githubIdentity(req);
 if(!origin)return response({ok:false,error:'UNAUTHORIZED'},401);
 const body=await req.json().catch(()=>({}));
 // workflow_dispatch is safely dry-run unless explicitly requested, while scheduled and
 // deploy-push runs register only official validated dates.
 const dryRun=origin==='workflow_dispatch'&&body?.dry_run!==false;
 const nowYear=Number(todayKst().slice(0,4));
 const results:Summary[]=[];
 results.push(await runSqld(dryRun));
 const key=keyForPublicApi();
 for(const year of [nowYear,nowYear+1]){
  for(const code of ['engineer','industrial'] as const)results.push(await runQnet(year,code,key,dryRun));
 }
 const failed=results.filter(x=>!['success','not_published','missing_key'].includes(x.status));
 const totals=results.reduce((a,s)=>({
   new:a.new+s.inserted_events,updated:a.updated+s.updated_events,
   unchanged:a.unchanged+s.unchanged_events,skipped:a.skipped+s.skipped_events
 }),{new:0,updated:0,unchanged:0,skipped:0});
 return response({ok:failed.length===0,mode:dryRun?'dry_run':'production',
  date:todayKst(),totals,
  sources:results.map(({source_type,source_year,status,candidate_events,inserted_events,updated_events,unchanged_events,skipped_events,message})=>
  ({source_type,source_year,status,candidate_events,inserted_events,updated_events,unchanged_events,skipped_events,message}))});
});
