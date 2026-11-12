import {createClient} from "npm:@supabase/supabase-js@2.49.10";
import {eligibleProfile,shouldNotify} from "./eligibility.mjs";
const repo="Hyeopgeon-Lee/k-bigdata-portal";
const workflow=repo+"/.github/workflows/certification-registration-reminder.yml@refs/heads/main";
const audience="kbigdata-certification-registration-reminder";
const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
const resendKey=Deno.env.get("RESEND_API_KEY")||"";
const sender=Deno.env.get("REPORT_FROM_EMAIL")||"";
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
const escape=(v:unknown)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));

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



type EventKind='written_registration'|'practical_registration'|'registration';
type Schedule={id:string;certificate_code:'engineer'|'industrial'|'sqld';event_type:EventKind;exam_year:number;exam_round:number;start_date:string;end_date:string;official_url:string;published:boolean};
type Student={user_id:string;full_name:string;email:string;approval_status:string;enrollment_status:string;signup_type:string};
type Certification={user_id:string;certificate_code:string;pass_status:string;verification_status:string};
const certificateNames={engineer:'정보처리기사',industrial:'정보처리산업기사',sqld:'SQLD'};
const kindNames={written_registration:'필기 원서접수',practical_registration:'실기 원서접수',registration:'원서접수'};
const koreaClock=()=>new Date(Date.now()+9*3600000).toISOString();
function emailBody(s:Student, exam:Schedule){
 const name=certificateNames[exam.certificate_code],kind=kindNames[exam.event_type];
 const duration=exam.start_date===exam.end_date?exam.start_date:exam.start_date+' ~ '+exam.end_date;
 const official=new URL(exam.official_url);
 if(official.protocol!=='https:')throw Error('INSECURE_OFFICIAL_URL');
 const title=name+' '+exam.exam_year+'년 '+exam.exam_round+'회 '+kind;
 const html='<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'+
 '<body style="margin:0;background:#f1f5fa;font-family:Arial,Malgun Gothic,sans-serif;color:#20314b">'+
 '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:25px 12px">'+
 '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #e0e8f2;border-radius:16px;overflow:hidden">'+
 '<tr><td style="padding:28px;background:#16386f;color:white"><div style="font-size:12px;color:#d1e1fb;font-weight:bold">K-BIGDATA · EXAM REMINDER</div>'+
 '<div style="font-size:20px;font-weight:bold;margin-top:8px">자격증 원서접수 안내</div><div style="font-size:13px;margin-top:8px">한국폴리텍대학 서울강서캠퍼스 · 빅데이터소프트웨어공학과</div></td></tr>'+
 '<tr><td style="padding:29px"><p style="font-size:15px;line-height:1.8">'+escape(s.full_name)+' 학생, <strong>'+escape(kind)+'</strong>가 시작되었습니다.</p>'+
 '<h1 style="font-size:21px;line-height:1.5;color:#183d75">'+escape(title)+'</h1>'+
 '<div style="padding:17px;background:#f4f7fc;border-radius:10px;font-size:15px;line-height:1.8"><strong>접수 기간</strong><br>'+escape(duration)+'</div>'+
 '<p style="font-size:14px;line-height:1.8;color:#53647c">시험 응시를 계획하고 있다면 공식 접수 사이트에서 원서를 제출해 주세요. 포털에서 대신 접수하지는 않습니다.</p>'+
 '<a style="display:block;padding:15px;background:#1c4ea3;color:#fff;text-decoration:none;text-align:center;border-radius:10px;font-weight:bold" href="'+escape(official.href)+'">공식 사이트에서 원서접수하기</a>'+
 '<p style="font-size:13px;line-height:1.8;color:#67768e;margin-top:22px">이미 해당 자격증의 필기 또는 최종 합격 내역이 있다면 <a href="https://portal.k-bigdata.kr/my-certifications.html">포털 나의 자격증</a>에서 상태를 확인해 주세요.</p>'+
 '</td></tr><tr><td style="border-top:1px solid #e4ebf5;padding:19px 28px;background:#f9fbff;color:#78889e;font-size:12px;line-height:1.8">대상: 승인된 재학생 중 해당 시험 단계의 접수가 필요한 학생<br>본 메일은 공식 일정에 따라 자동 발송됩니다.</td></tr></table></td></tr></table></body></html>';
 return {subject:'[학과 포털] '+title+' 시작 안내',html,text:s.full_name+' 학생, '+title+' 접수가 시작되었습니다.\n접수기간: '+duration+'\n공식 사이트: '+official.href+'\n포털 나의 자격증: https://portal.k-bigdata.kr/my-certifications.html'};
}
async function sendReminder(student:Student,exam:Schedule){
 const claim=db.from('certification_reminder_deliveries');
 const payload={schedule_id:exam.id,user_id:student.user_id,recipient_email:student.email,status:'pending'};
 const {data:created,error:claimErr}=await claim.insert(payload).select('id').single();
 let id:number;
 if(claimErr?.code==='23505'){
  const {data:existing,error:lookup}=await claim.select('id,status').eq('schedule_id',exam.id).eq('user_id',student.user_id).maybeSingle();
  if(lookup)throw lookup;
  if(!existing||existing.status!=='failed')return 'duplicate';
  const {data:reclaimed,error:reErr}=await claim.update({status:'pending',error_message:null})
    .eq('id',existing.id).eq('status','failed').select('id').maybeSingle();
  if(reErr)throw reErr;
  if(!reclaimed)return 'duplicate';
  id=reclaimed.id;
 }else if(claimErr||!created)throw claimErr||Error('CLAIM_FAILED');
 else id=created.id;
 try{
  const {data:profile,error:perr}=await db.from('profiles').select('user_id,full_name,email,approval_status,enrollment_status,signup_type').eq('user_id',student.user_id).maybeSingle();
  if(perr)throw perr;
  const {data:passed,error:cerr}=await db.from('student_certifications').select('certificate_code,pass_status,verification_status')
    .eq('user_id',student.user_id).eq('certificate_code',exam.certificate_code);
  if(cerr)throw cerr;
  if(!eligibleProfile(profile)||!shouldNotify(passed,exam.certificate_code,exam.event_type)){
    await claim.update({status:'skipped',error_message:'ELIGIBILITY_CHANGED'}).eq('id',id);
    return 'skipped';
  }
  if(!resendKey||!sender)throw Error('MAIL_CONFIGURATION_MISSING');
  const msg=emailBody(profile,exam);
  const response=await fetch('https://api.resend.com/emails',{
   method:'POST',
   headers:{'Authorization':'Bearer '+resendKey,'Content-Type':'application/json',
      'Idempotency-Key':'certificate-registration-'+exam.id+'-'+student.user_id},
   body:JSON.stringify({from:'빅데이터소프트웨어공학과 포털 <'+sender+'>',to:[profile.email],...msg}),
   signal:AbortSignal.timeout(15000)
  });
  const result=await response.json().catch(()=>({}));
  if(!response.ok||!result.id)throw Error('MAIL_PROVIDER_'+response.status);
  const {error:saveError}=await claim.update({status:'sent',recipient_email:profile.email,provider_id:result.id,sent_at:new Date().toISOString(),error_message:null}).eq('id',id);
  if(saveError)throw saveError;
  return 'sent';
 }catch(error){
  await claim.update({status:'failed',error_message:String(error).slice(0,250)}).eq('id',id);
  return 'failed';
 }
}
Deno.serve(async req=>{
 if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
 const eventName=await githubIdentity(req);
 if(!eventName)return json({error:'UNAUTHORIZED'},401);
 const body=await req.json().catch(()=>({}));
 const dryRun=eventName!=='schedule'||body?.dry_run!==false;
 const now=koreaClock(),today=now.slice(0,10),hour=Number(now.slice(11,13));
 if(eventName==='schedule'&&(hour<9||hour>17))return json({ok:true,skipped:'OUTSIDE_KST_SEND_WINDOW',today});
 try{
  const {data:rows,error:sErr}=await db.from('certification_exam_schedules')
   .select('id,certificate_code,event_type,exam_year,exam_round,start_date,end_date,official_url,published')
   .eq('published',true).eq('start_date',today)
   .in('event_type',['written_registration','practical_registration','registration']);
  if(sErr)throw sErr;
  const schedules=(rows||[]) as Schedule[];
  if(!schedules.length)return json({ok:true,today,dry_run:dryRun,scheduled:0,eligible:0,sent:0});
  const {data:profiles,error:pErr}=await db.from('profiles')
   .select('user_id,full_name,email,approval_status,enrollment_status,signup_type')
   .eq('approval_status','approved').eq('enrollment_status','enrolled').eq('signup_type','student');
  if(pErr)throw pErr;
  const students=((profiles||[]) as Student[]).filter(eligibleProfile);
  const {data:certs,error:cErr}=await db.from('student_certifications').select('user_id,certificate_code,pass_status,verification_status')
   .in('user_id',students.map(s=>s.user_id));
  if(cErr)throw cErr;
  const certByUser=new Map<string,Certification[]>();
  for(const row of (certs||[]) as Certification[]){
   const found=certByUser.get(row.user_id)||[];found.push(row);certByUser.set(row.user_id,found);
  }
  const targets=schedules.flatMap(exam=>students.filter(student=>
     shouldNotify(certByUser.get(student.user_id)||[],exam.certificate_code,exam.event_type)).map(student=>({student,exam})));
  if(dryRun)return json({ok:true,today,dry_run:true,scheduled:schedules.length,eligible:targets.length,sent:0});
  const result={sent:0,failed:0,skipped:0,duplicate:0};
  for(const {student,exam} of targets){
   const status=await sendReminder(student,exam);
   result[status as keyof typeof result]++;
   await new Promise(resolve=>setTimeout(resolve,600));
  }
  return json({ok:true,today,dry_run:false,scheduled:schedules.length,eligible:targets.length,...result});
 }catch(error){
  console.error('CERTIFICATION_REMINDER_ERROR',String(error).slice(0,220));
  return json({ok:false,error:'REMINDER_RUN_FAILED'},500);
 }
});
