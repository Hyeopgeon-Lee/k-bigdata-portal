import { createClient } from "npm:@supabase/supabase-js@2.49.10";
const url=Deno.env.get("SUPABASE_URL")!;
const secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const publishable=Deno.env.get("SUPABASE_ANON_KEY")!;
const resend=Deno.env.get("RESEND_API_KEY")||"";
const from=Deno.env.get("REPORT_FROM_EMAIL")||"noreply@noreply.k-bigdata.kr";
const site="https://portal.k-bigdata.kr";
const headers={
 "Access-Control-Allow-Origin":site,
 "Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info",
 "Access-Control-Allow-Methods":"POST,OPTIONS",
 "Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",
 "Vary":"Origin"
};
const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const okay=(data:unknown,message?:string,extra:Record<string,unknown>={})=>({success:true,data,...(message?{message}:{}),...extra});
const err=(message:string,status=400)=>new Response(JSON.stringify({success:false,message}),{status,headers});
const result=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers});
const text=(v:unknown,max=2000)=>String(v??"").trim().slice(0,max);
const yes=(v:unknown)=>["true","1","yes","on"].includes(String(v??"").trim().toLowerCase());
const strList=(v:unknown)=>Array.isArray(v)?v.map(x=>text(x,100)).filter(Boolean):text(v).split("|").map(s=>s.trim()).filter(Boolean);
const esc=(v:unknown)=>text(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
const now=()=>new Date().toISOString();
const dateOnly=(v:unknown)=>text(v,40).slice(0,10);
const validUrl=(v:unknown)=>{try{const u=new URL(String(v));return ["https:","http:"].includes(u.protocol);}catch{return false;}};
const id=(prefix:string)=>prefix+crypto.randomUUID().replaceAll("-","").slice(0,18).toUpperCase();
const NEWS_LABELS:Record<string,string>={
 EMPLOYMENT:"취업",JOB_CHANGE:"이직",PROMOTION:"승진·보직",STARTUP:"창업",
 GRADUATE_SCHOOL:"대학원·학위",ACHIEVEMENT:"수상·성과",MARRIAGE:"결혼",
 BIRTH_SON:"득남",BIRTH_DAUGHTER:"득녀",OBITUARY:"부고",OTHER:"기타"
};
const PROFILE_PUBLIC=["alumni_id","name","graduation_year","employment_status","company","job","company_url","employment_year",
 "job_description","skills","bachelor_status","bachelor_school","bachelor_major","bachelor_year","graduate_status",
 "graduate_school_type","graduate_school","graduate_major","graduate_degree","graduate_entry_year",
 "graduate_graduation_year","research_fields","mentoring_topics","introduction","message_to_juniors","contact_allowed","updated_at"];
const PROFILE_EDIT=["name","student_id","graduation_year","email","phone","employment_status","company","job",
 "company_url","employment_year","job_description","skills","bachelor_status","bachelor_school","bachelor_major",
 "bachelor_year","graduate_status","graduate_school_type","graduate_school","graduate_major","graduate_degree",
 "graduate_entry_year","graduate_graduation_year","research_fields","mentoring_topics","introduction",
 "message_to_juniors","contact_allowed","career_mail_enabled","alumni_news_mail_enabled"];
const JOB_EDIT=["company","job_title","recruit_type","employment_type","location","job_url","deadline","always_open",
 "skills","alumni_comment","referral_available","contact_allowed"];
const NEWS_EDIT=["news_type","title","content","company","job_title","organization","position_title","school_name",
 "degree_or_program","event_date","location","relationship","external_url","mail_requested"];
const PII=new Set(["email","phone","student_id","edit_pin_hash","career_mail_consent_at",
 "career_mail_updated_at","alumni_news_mail_consent_at","alumni_news_mail_updated_at"]);
type Rec={source_kind:string;source_id:string;data:Record<string,unknown>};
type Actor={id:string;name:string;email:string;role:string;enrollment:string;alumniId:string|null;isAdmin:boolean};
async function rows(kind:string):Promise<Rec[]>{
 const {data,error}=await admin.from("alumni_network_records").select("source_kind,source_id,data")
  .eq("source_kind",kind).order("source_id",{ascending:true}).limit(2000);
 if(error)throw Error("DB_READ_"+kind);
 return (data||[]) as Rec[];
}
async function one(kind:string,recordId:string):Promise<Rec|null>{
 const {data,error}=await admin.from("alumni_network_records").select("source_kind,source_id,data")
  .eq("source_kind",kind).eq("source_id",recordId).maybeSingle();
 if(error)throw Error("DB_LOOKUP_"+kind);
 return (data as Rec|null)||null;
}
async function put(kind:string,recordId:string,data:Record<string,unknown>){
 const {error}=await admin.from("alumni_network_records").upsert({
  source_kind:kind,source_id:recordId,data,updated_at:now()
 },{onConflict:"source_kind,source_id"});
 if(error){console.error("Alumni save",kind,error.code);throw Error("DB_WRITE_FAILED");}
}
function cleanProfile(a:Record<string,unknown>){
 const o:Record<string,unknown>={};
 for(const key of PROFILE_PUBLIC)o[key]=a[key]??"";
 for(const key of ["skills","research_fields","mentoring_topics"])o[key]=strList(o[key]);
 o.contact_allowed=yes(a.contact_allowed);
 if(!o.contact_allowed){delete o.mentoring_topics;delete o.message_to_juniors;}
 return o;
}
function maskName(v:unknown){const s=text(v,80);return s.length>1?s[0]+"*"+s.slice(2):s;}
function cleanJob(j:Record<string,unknown>,a:Record<string,unknown>={}){
 return {job_id:text(j.job_id),alumni_id:text(j.alumni_id),company:text(j.company),job_title:text(j.job_title),
 recruit_type:text(j.recruit_type),employment_type:text(j.employment_type),location:text(j.location),
 job_url:text(j.job_url),deadline:dateOnly(j.deadline),always_open:yes(j.always_open),
 skills:strList(j.skills),alumni_comment:text(j.alumni_comment),referral_available:yes(j.referral_available),
 contact_allowed:yes(j.contact_allowed)&&yes(a.contact_allowed),
 created_at:text(j.created_at),alumni_name:maskName(a.name),graduation_year:text(a.graduation_year),
 alumni_job:text(a.job)};
}
function cleanNews(n:Record<string,unknown>,a:Record<string,unknown>={}){
 const ret:Record<string,unknown>={};
 for(const k of ["news_id","alumni_id","news_type","title","content","company","job_title","organization",
 "position_title","school_name","degree_or_program","location","relationship","external_url","created_at"])
  ret[k]=text(n[k]);
 ret.name=text(a.name);ret.graduation_year=text(a.graduation_year);
 ret.news_type_label=NEWS_LABELS[text(n.news_type)]||"기타";
 ret.event_date=dateOnly(n.event_date);return ret;
}
function visibleJob(j:Record<string,unknown>){
 return j.status==="APPROVED"&&(yes(j.always_open)||!dateOnly(j.deadline)||dateOnly(j.deadline)>=now().slice(0,10));
}
async function mail(to:string,subject:string,html:string,key:string){
 if(!resend)throw Error("메일 발송 설정이 준비되지 않았습니다.");
 const response=await fetch("https://api.resend.com/emails",{
  method:"POST",headers:{"Authorization":"Bearer "+resend,"Content-Type":"application/json",
   "Idempotency-Key":key.slice(0,250)},
  body:JSON.stringify({from:"빅데이터소프트웨어공학과 졸업생 네트워크 <"+from+">",
   to:[to],subject,html}),signal:AbortSignal.timeout(13000)
 });
 const responseData=await response.json().catch(()=>({}));
 if(!response.ok||!responseData.id)throw Error("메일 발송 오류 ("+response.status+")");
 return String(responseData.id);
}
async function notice(event:string,kind:string,recordId:string,to:string,subject:string,body:string){
 const {data:existing,error:foundError}=await admin.from("alumni_network_mail_outbox")
  .select("id,status").eq("event_type",event).eq("record_kind",kind)
  .eq("record_id",recordId).eq("recipient",to).maybeSingle();
 if(foundError)throw Error("MAIL_LOG_READ_FAILED");
 if(existing?.status==="sent")return true;
 let row=existing;
 if(!row){
  const {data, error}=await admin.from("alumni_network_mail_outbox")
   .insert({event_type:event,record_kind:kind,record_id:recordId,recipient:to,
    subject,html:body,status:"pending"}).select("id,status").single();
  if(error?.code==="23505")return true;
  if(error)throw Error("MAIL_LOG_CREATE_FAILED");
  row=data;
 }
 const {data:claimed,error:claimError}=await admin.from("alumni_network_mail_outbox")
 .update({status:"sending"}).eq("id",row!.id).in("status",["pending","failed"]).select("id").maybeSingle();
 if(claimError)throw Error("MAIL_LOG_CLAIM_FAILED");
 if(!claimed)return true;
 try{
  const provider=await mail(to,subject,body,"alumni-"+event+"-"+kind+"-"+recordId+"-"+to);
  await admin.from("alumni_network_mail_outbox").update({
   status:"sent",provider_id:provider,error_message:null,sent_at:now()
  }).eq("id",row!.id);
  return true;
 }catch(e){
  await admin.from("alumni_network_mail_outbox").update({
   status:"failed",error_message:text((e as Error)?.message,250)
  }).eq("id",row!.id);
  return false;
 }
}
async function actor(request:Request):Promise<Actor>{
 const token=(request.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 if(token.split(".").length!==3)throw Error("포털 로그인이 필요합니다.");
 const userDb=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false},
   global:{headers:{Authorization:"Bearer "+token}}});
 const {data:{user},error:userError}=await userDb.auth.getUser(token);
 if(userError||!user?.email||!user.email_confirmed_at)throw Error("인증된 포털 회원만 이용할 수 있습니다.");
 const {data:access,error:accessError}=await userDb.rpc("portal_learning_access");
 if(accessError||access?.read!==true)throw Error("승인된 포털 로그인 세션이 필요합니다.");
 const [{data:profile,error:profileError},{data:isAdmin,error:adminError}]=await Promise.all([
  admin.from("profiles").select("full_name,email,signup_type,enrollment_status,approval_status,alumni_source_id")
   .eq("user_id",user.id).single(),
  userDb.rpc("portal_super_admin_allowed")
 ]);
 if(profileError||!profile||profile.approval_status!=="approved")
  throw Error("승인된 포털 계정만 이용할 수 있습니다.");
 if(adminError)throw Error("계정 권한을 확인할 수 없습니다.");
 return {id:user.id,name:profile.full_name,email:String(user.email).toLowerCase(),
  role:profile.signup_type,enrollment:profile.enrollment_status,
  alumniId:profile.alumni_source_id||null,isAdmin:isAdmin===true};
}
async function owned(a:Actor,idParam:string|undefined,requiredApproval=true):Promise<Rec>{
 const idText=text(idParam||a.alumniId,120);
 if(!idText)throw Error("등록된 졸업생 정보를 찾을 수 없습니다. 먼저 동문 정보를 등록하세요.");
 const row=await one("alumni",idText);
 if(!row)throw Error("졸업생 정보를 찾을 수 없습니다.");
 const isOwner=(a.alumniId===idText)
   ||(String(row.data.email||"").toLowerCase()===a.email
    &&text(row.data.name)===a.name
    &&(a.role==="alumni"||a.enrollment==="graduated"));
 if(!isOwner)throw Error("본인 졸업생 정보만 수정할 수 있습니다.");
 if(requiredApproval&&row.data.status!=="APPROVED")throw Error("동문정보 승인 후 등록할 수 있습니다.");
 return row;
}
async function adminOnly(a:Actor){
 if(!a.isAdmin)throw Error("관리자 권한이 없습니다.");
}
function updatedPayload(base:Record<string,unknown>,data:Record<string,unknown>,keys:string[]){
 const obj={...base};
 for(const k of keys)if(Object.hasOwn(data,k)){
  obj[k]=["skills","mentoring_topics","research_fields"].includes(k)?strList(data[k]).join("|"):
    ["contact_allowed","always_open","referral_available","mail_requested",
     "career_mail_enabled","alumni_news_mail_enabled"].includes(k)?String(yes(data[k])).toUpperCase():text(data[k],k==="content"?2000:800);
 }
 return obj;
}
async function sendToAdmin(subject:string,body:string,kind:string,id0:string){
 return notice("approval",kind,id0,"hglee67@kopo.ac.kr",subject,
  '<div style="font-family:sans-serif;line-height:1.8;background:#f5f7fb;padding:25px"><div style="max-width:570px;margin:auto;padding:25px;background:#fff;border:1px solid #dde5f2;border-radius:13px"><h2>'+esc(subject)+'</h2><p>'+esc(body)+'</p><p><a href="https://portal.k-bigdata.kr/alumni/admin.html">관리자 승인 화면에서 확인하기</a></p></div></div>');
}
async function handle(action:string,b:Record<string,unknown>,a:Actor){
 const allAlumni=async()=>await rows("alumni");
 const approved=async()=> (await allAlumni()).filter(r=>r.data.status==="APPROVED");
 const allJobs=async()=>await rows("jobs");
 const allNews=async()=>await rows("alumni_news");
 const publicList=async()=> (await approved()).map(r=>cleanProfile(r.data));
 const jobList=async()=>{
  const am=new Map((await allAlumni()).map(r=>[text(r.source_id),r.data]));
  return (await allJobs()).filter(r=>visibleJob(r.data))
   .sort((x,y)=>text(y.data.approved_at||y.data.created_at).localeCompare(text(x.data.approved_at||x.data.created_at)))
   .map(r=>cleanJob(r.data,am.get(r.source_id)||am.get(text(r.data.alumni_id))||{}));
 };
 const newsList=async()=>{
  const am=new Map((await allAlumni()).map(r=>[r.source_id,r.data]));
  return (await allNews()).filter(r=>r.data.status==="APPROVED")
   .sort((x,y)=>text(y.data.event_date||y.data.created_at).localeCompare(text(x.data.event_date||x.data.created_at)))
   .map(r=>cleanNews(r.data,am.get(text(r.data.alumni_id))||{}));
 };
 const getProfile=async(k:string)=>{
  const row=await one("alumni",k);
  if(!row||row.data.status!=="APPROVED")throw Error("졸업생 정보를 찾을 수 없습니다.");
  return row;
 };
 switch(action){
 case "list":return okay(await publicList());
 case "detail":return okay(cleanProfile((await getProfile(text(b.id))).data));
 case "home":{
  const [alumni,jobs,news]=await Promise.all([publicList(),jobList(),newsList()]);
  return okay({alumni,jobs:jobs.slice(0,3),news:news.slice(0,5)});
 }
 case "alumniDetail":{
  const k=text(b.id),[profile,jobs,news]=await Promise.all([getProfile(k),jobList(),newsList()]);
  return okay({profile:cleanProfile(profile.data),jobs:jobs.filter(j=>j.alumni_id===k),news:news.filter(n=>n.alumni_id===k)});
 }
 case "careerPublic":return okay((await publicList()).filter(p=>p.employment_status==="취업 중"));
 case "jobs":return okay(await jobList());
 case "jobDetail":{
  const item=(await jobList()).find(j=>j.job_id===text(b.id));
  if(!item)throw Error("채용정보를 찾을 수 없습니다.");
  return okay(item);
 }
 case "alumniJobs":return okay((await jobList()).filter(j=>j.alumni_id===text(b.id)));
 case "newsList":return okay(await newsList());
 case "newsDetail":{
  const item=(await newsList()).find(n=>n.news_id===text(b.id));
  if(!item)throw Error("동문소식을 찾을 수 없습니다.");
  return okay(item);
 }
 case "alumniNews":return okay((await newsList()).filter(n=>n.alumni_id===text(b.id)));
 case "getOwn":{
  const row=await owned(a,text(b.alumni_id),false);
  const payload={...row.data};
  delete payload.edit_pin_hash;delete payload.approval_nonce_hash;
  for(const k of ["skills","research_fields","mentoring_topics"])payload[k]=strList(payload[k]);
  for(const k of ["career_mail_enabled","alumni_news_mail_enabled","contact_allowed"])
   payload[k]=yes(payload[k]);
  return okay(payload);
 }
 case "verifyJobAlumni":case "verifyNewsAlumni":{
  const o=await owned(a,text(b.alumni_id));
  return okay({alumni_id:o.source_id,name:maskName(o.data.name),graduation_year:text(o.data.graduation_year)});
 }
 case "newsAlumniSearch":{
  await owned(a,text(b.alumni_id));
  const q=text(b.query,80).toLowerCase();
  if(!q)throw Error("검색어를 입력해 주세요.");
  return okay((await approved()).filter(r=>[r.data.name,r.data.company,r.data.job,r.data.graduation_year]
   .join(" ").toLowerCase().includes(q)).slice(0,20).map(r=>({
    alumni_id:r.source_id,name:maskName(r.data.name),graduation_year:text(r.data.graduation_year),
    company:text(r.data.company),job:text(r.data.job)})));
 }
 case "findAlumniId":{
  const r=(await allAlumni()).find(x=>text(x.data.email).toLowerCase()===a.email
   &&text(x.data.name)===a.name);
  return {success:true,message:r?"등록된 본인 Alumni ID: "+r.source_id:"연결된 졸업생 정보가 없습니다. 학과 포털에서 정보를 등록해 주세요."};
 }
 case "requestPinReset":case "resetPin":
  return {success:true,message:"PIN 인증은 종료되었습니다. 포털 로그인과 비밀번호 재설정을 이용해 주세요."};
 case "register":case "update":{
  if(!["alumni"].includes(a.role)&&a.enrollment!=="graduated")
   throw Error("졸업생으로 승인된 포털 회원만 정보를 등록할 수 있습니다.");
  if(text(b.name)!==a.name||text(b.email).toLowerCase()!==a.email)
   throw Error("로그인 계정의 이름과 인증된 이메일을 사용해 주세요.");
  if(!yes(b.privacy_consent)||!yes(b.identity_consent))
   throw Error("개인정보 이용 및 본인 확인 동의가 필요합니다.");
  if(!text(b.graduation_year)||!text(b.employment_status)||!text(b.phone))
   throw Error("필수 항목을 입력해 주세요.");
  if(yes(b.contact_allowed)&&(!yes(b.contact_consent)||!strList(b.mentoring_topics).length))
   throw Error("연락 요청 허용 시 관련 동의와 상담 분야를 선택해 주세요.");
  const existing=action==="update"?await owned(a,text(b.alumni_id),false):null;
  if(action==="register"&&(await allAlumni()).some(r=>text(r.data.email).toLowerCase()===a.email))
   throw Error("이미 등록된 이메일입니다. 정보 수정 탭을 이용해 주세요.");
  const recordId=existing?.source_id||id("A"),previous=existing?.data||{};
  const d=updatedPayload(previous,b,PROFILE_EDIT);
  d.alumni_id=recordId;d.name=a.name;d.email=a.email;
  d.status="PENDING";d.updated_at=now();d.created_at=previous.created_at||now();
  // Historical edit PIN hashes are retained only for imported snapshots, never used for authorization.
  delete d.edit_pin_hash;delete d.auth_pin;delete d.edit_pin;
  if(action==="register"){
   d.career_mail_consent_at=yes(b.career_mail_enabled)?now():"";
   d.alumni_news_mail_consent_at=yes(b.alumni_news_mail_enabled)?now():"";
  }
  await put("alumni",recordId,d);
  await sendToAdmin("동문정보 "+(action==="register"?"신규 등록":"수정")+" 승인 요청",
   a.name+"님의 동문정보 검토가 필요합니다.", "alumni",recordId).catch(()=>{});
  return {success:true,message:"동문정보를 저장했습니다. 관리자 승인 후 공개됩니다.",alumni_id:recordId};
 }
 case "submitJob":case "adminCreateJob":{
  if(action==="adminCreateJob")await adminOnly(a);
  const owner=action==="submitJob"?await owned(a,text(b.alumni_id)):await getProfile(text(b.alumni_id));
  for(const required of ["company","job_title","recruit_type","employment_type","job_url"])
   if(!text(b[required]))throw Error("필수 채용정보를 입력해 주세요.");
  if(!validUrl(b.job_url))throw Error("정확한 채용공고 URL을 입력해 주세요.");
  if(!yes(b.always_open)&&(!dateOnly(b.deadline)||dateOnly(b.deadline)<now().slice(0,10)))
   throw Error("유효한 채용 마감일을 입력해 주세요.");
  const jid=id("J"),d=updatedPayload({},b,JOB_EDIT);
  Object.assign(d,{job_id:jid,alumni_id:owner.source_id,status:action==="adminCreateJob"?"APPROVED":"PENDING",
   created_at:now(),updated_at:now(),approved_at:action==="adminCreateJob"?now():"",
   approved_by:action==="adminCreateJob"?a.email:"",last_mailed_at:""});
  await put("jobs",jid,d);
  if(action==="submitJob")await sendToAdmin("동문 채용공고 승인 요청",
   a.name+"님의 "+text(b.company)+" 채용공고 검토가 필요합니다.","jobs",jid).catch(()=>{});
  return {success:true,message:action==="adminCreateJob"?"채용공고가 게시되었습니다.":"채용정보 등록 신청이 완료됐습니다. 관리자 승인 후 공개됩니다.",job_id:jid};
 }
 case "submitNews":case "adminCreateNews":{
  if(action==="adminCreateNews")await adminOnly(a);
  else await owned(a,text(b.alumni_id));
  const type=text(b.news_type);
  if(!NEWS_LABELS[type]||!text(b.title)||!text(b.content))
   throw Error("소식 종류와 제목, 내용을 입력해 주세요.");
  if(text(b.title).length>120||text(b.content).length>2000)
   throw Error("소식 길이가 허용 범위를 초과했습니다.");
  if(b.external_url&&!validUrl(b.external_url))throw Error("유효한 외부 링크를 입력해 주세요.");
  const target=action==="adminCreateNews"?text(b.target_alumni_id):
   type==="OBITUARY"?text(b.target_alumni_id):text(b.alumni_id);
  if(!target)throw Error("소식 대상 졸업생을 선택해 주세요.");
  await getProfile(target);
  const nid=id("N"),d=updatedPayload({},b,NEWS_EDIT);
  Object.assign(d,{news_id:nid,alumni_id:target,
   submitted_by_alumni_id:action==="adminCreateNews"?"ADMIN:"+a.email:text(b.alumni_id),
   status:action==="adminCreateNews"?"APPROVED":"PENDING",
   mail_requested:String(yes(b.mail_requested||b.send_mail)).toUpperCase(),
   mail_status:yes(b.mail_requested||b.send_mail)?"WAITING":"NOT_REQUESTED",
   approved_at:action==="adminCreateNews"?now():"",approved_by:action==="adminCreateNews"?a.email:"",
   created_at:now(),updated_at:now()});
  await put("alumni_news",nid,d);
  if(action==="submitNews")await sendToAdmin("동문소식 승인 요청",
   a.name+"님의 동문소식 검토가 필요합니다.","alumni_news",nid).catch(()=>{});
  return {success:true,message:action==="adminCreateNews"?"동문소식이 게시되었습니다.":"동문소식 등록 신청이 완료됐습니다. 관리자 승인 후 공개됩니다.",news_id:nid};
 }
 case "contact":{
  if(!text(b.alumni_id)||!text(b.subject)||text(b.message).length<20)
   throw Error("제목과 20자 이상의 문의 내용을 입력해 주세요.");
  const recipient=await getProfile(text(b.alumni_id));
  if(!yes(recipient.data.contact_allowed))throw Error("현재 연락을 받지 않는 졸업생입니다.");
  if(b.job_id){
   const j=await one("jobs",text(b.job_id));
   if(!j||!visibleJob(j.data)||text(j.data.alumni_id)!==recipient.source_id||
    !yes(j.data.contact_allowed))throw Error("채용정보 문의가 허용되지 않았습니다.");
  }
  // Verified portal email and profile prevent impersonation through form inputs.
  const prev=(await rows("contact_requests")).filter(r=>text(r.data.requester_email).toLowerCase()===a.email
    &&text(r.data.alumni_id)===recipient.source_id
    &&Date.parse(text(r.data.created_at))>Date.now()-3600000);
  if(prev.length>=3)throw Error("연락 요청이 너무 잦습니다. 잠시 후 다시 이용해 주세요.");
  const rid=id("R");
  const requestData:Record<string,unknown>={request_id:rid,alumni_id:recipient.source_id,
   requester_name:a.name,requester_type:a.role==="alumni"?"졸업생":"재학생",
   requester_student_id_or_year:text(b.requester_student_id_or_year,30),
   requester_email:a.email,requester_phone:text(b.requester_phone,20),
   share_email:String(yes(b.share_email)).toUpperCase(),
   share_phone:String(yes(b.share_phone)).toUpperCase(),
   category:text(b.category,40),subject:text(b.subject,100),message:text(b.message,1500),
   status:"PENDING",created_at:now(),sent_at:""};
  await put("contact_requests",rid,requestData);
  const body='<h2>학과 동문 연락 요청</h2><p>'+esc(a.name)+'님이 연락을 요청했습니다.</p>'+
   '<p><strong>문의: </strong>'+esc(requestData.subject)+'</p><p style="white-space:pre-wrap">'+esc(requestData.message)+'</p>'+
   (yes(b.share_email)?'<p>답장 이메일: '+esc(a.email)+'</p>':'')+
   (yes(b.share_phone)?'<p>연락처: '+esc(b.requester_phone)+'</p>':'');
  const sent=await notice("contact","contact_requests",rid,text(recipient.data.email),
   "[빅데이터SW 동문] 새로운 연락 요청",body);
  requestData.status=sent?"SENT":"FAILED";
  requestData.sent_at=sent?now():"";
  await put("contact_requests",rid,requestData);
  if(!sent)throw Error("요청은 저장됐지만 메일 발송에 실패했습니다. 관리자에게 문의해 주세요.");
  return {success:true,message:"연락 요청이 정상적으로 전달되었습니다."};
 }
 case "adminLogin":{
  await adminOnly(a);
  return {success:true,admin_token:"PORTAL_SUPER_ADMIN",message:"포털 관리자 인증 완료"};
 }
 case "adminLogout":return {success:true,message:"관리자 화면을 종료했습니다."};
 case "adminList":{
  await adminOnly(a);
  const view=text(b.view)||"alumni";
  if(view==="alumni")return okay((await allAlumni()).map(r=>{
   const x=cleanProfile(r.data);
   return {...x,email:text(r.data.email),phone:text(r.data.phone),status:text(r.data.status),
    created_at:text(r.data.created_at),career_mail_enabled:yes(r.data.career_mail_enabled),
    alumni_news_mail_enabled:yes(r.data.alumni_news_mail_enabled)};
  }));
  if(view==="jobs"){
   const am=new Map((await allAlumni()).map(r=>[r.source_id,r.data]));
   return okay((await allJobs()).map(r=>{
    const d=cleanJob(r.data,am.get(text(r.data.alumni_id))||{});
    return {...d,status:r.data.status,approved_at:r.data.approved_at,
     alumni_name_admin:am.get(text(r.data.alumni_id))?.name||""};
   }));
  }
  if(view==="news"){
   const am=new Map((await allAlumni()).map(r=>[r.source_id,r.data]));
   return okay((await allNews()).map(r=>{
    const d=cleanNews(r.data,am.get(text(r.data.alumni_id))||{});
    return {...d,status:r.data.status,mail_requested:yes(r.data.mail_requested),
      mail_status:r.data.mail_status,
      target_name_admin:am.get(text(r.data.alumni_id))?.name||"",
      submitter_name_admin:am.get(text(r.data.submitted_by_alumni_id))?.name||text(r.data.submitted_by_alumni_id)};
   }));
  }
  if(view==="requests")return okay((await rows("contact_requests")).map(r=>({
   request_id:r.source_id,alumni_id:r.data.alumni_id,requester_name:r.data.requester_name,
   requester_type:r.data.requester_type,category:r.data.category,subject:r.data.subject,
   status:r.data.status,created_at:r.data.created_at
  })));
  if(view==="mail_logs"){
   const [jobs,news]=await Promise.all([rows("job_mail_logs"),rows("alumni_news_mail_logs")]);
   return okay([...jobs.map(r=>({mail_kind:"채용정보",related_id:r.data.job_ids,
      subject:"채용정보 Digest",...r.data})),
    ...news.map(r=>({mail_kind:"동문소식",related_id:r.data.news_id,...r.data}))]
    .sort((x,y)=>text(y.sent_at).localeCompare(text(x.sent_at))));
  }
  throw Error("관리 목록이 올바르지 않습니다.");
 }
 case "adminApprove":case "adminReject":case "adminHide":
 case "adminJobApprove":case "adminJobReject":case "adminJobHide":case "adminJobPublish":
 case "adminNewsApprove":case "adminNewsReject":case "adminNewsHide":
 case "adminNewsPublish":case "adminNewsApproveAndMail":{
  await adminOnly(a);
  const isAlumni=action.startsWith("admin")&&!action.includes("Job")&&!action.includes("News");
  const kind=isAlumni?"alumni":action.includes("Job")?"jobs":"alumni_news";
  const key=isAlumni?"alumni_id":kind==="jobs"?"job_id":"news_id";
  const record=await one(kind,text(b[key]));
  if(!record)throw Error("대상 등록 정보를 찾을 수 없습니다.");
  const after=action.includes("Reject")?"REJECTED":action.includes("Hide")?"HIDDEN":"APPROVED";
  if(after==="APPROVED"&&record.data.status==="REJECTED"&&!action.includes("Publish"))
   throw Error("반려된 등록은 다시 신청해야 합니다.");
  record.data.status=after;record.data.updated_at=now();
  if(after==="APPROVED"){record.data.approved_at=now();record.data.approved_by=a.email;}
  if(action==="adminNewsApproveAndMail")record.data.mail_status="WAITING";
  await put(kind,record.source_id,record.data);
  if(action==="adminNewsApproveAndMail"){
   const recipients=(await approved()).filter(x=>yes(x.data.alumni_news_mail_enabled));
   const subj="[동문소식] "+text(record.data.title,120);
   const body='<h2>'+esc(record.data.title)+'</h2><p>'+esc(record.data.content)+'</p>';
   let count=0;
   for(const receiver of recipients){
    if(await notice("news_digest",kind,record.source_id,text(receiver.data.email),subj,body))count++;
   }
   record.data.mail_status=count===recipients.length?"SENT":"PARTIAL_FAILED";
   await put(kind,record.source_id,record.data);
  }
  return {success:true,message:"상태 변경이 완료되었습니다."};
 }
 case "adminRunJobDigest":{
  await adminOnly(a);
  const jobs=(await allJobs()).filter(r=>visibleJob(r.data)&&!text(r.data.last_mailed_at));
  const recipients=(await approved()).filter(x=>yes(x.data.career_mail_enabled));
  if(!jobs.length||!recipients.length)return {success:true,message:"발송할 채용공고 또는 수신 동의자가 없습니다."};
  const subj="[동문 채용정보] 새로운 채용공고 "+jobs.length+"건";
  const body='<h2>빅데이터SW 동문 채용정보</h2>'+jobs.map(r=>
   '<p><strong>'+esc(r.data.company)+' · '+esc(r.data.job_title)+'</strong><br><a href="'+esc(r.data.job_url)+'">채용공고 보기</a></p>').join("");
  let sent=0;
  for(const person of recipients)if(await notice("job_digest","job_mail_logs",jobs.map(x=>x.source_id).join("_"),
   text(person.data.email),subj,body))sent++;
  if(sent===recipients.length)for(const job of jobs){
   job.data.last_mailed_at=now();await put("jobs",job.source_id,job.data);
  }
  const mailId=id("M");
  await put("job_mail_logs",mailId,{mail_id:mailId,job_ids:jobs.map(x=>x.source_id).join("|"),
   recipient_count:String(recipients.length),sent_count:String(sent),
   failed_count:String(recipients.length-sent),sent_at:now(),status:sent===recipients.length?"SENT":"PARTIAL_FAILED"});
  return {success:true,message:"채용 메일 발송 "+sent+"건 / 전체 "+recipients.length+"건"};
 }
 case "adminSendCareerConsentInvites":case "adminSendNewsConsentInvites":{
  await adminOnly(a);
  const career=action==="adminSendCareerConsentInvites";
  const key=career?"career_mail_enabled":"alumni_news_mail_enabled";
  let sent=0,failed=0;
  for(const person of await approved()){
   if(text(person.data[key]))continue;
   const email=text(person.data.email);
   const message="학과 포털 로그인 후 졸업생 네트워크의 내 정보에서 "+(career?"채용공고":"동문소식")+" 메일 수신 여부를 설정해 주세요.";
   if(await notice("consent_"+key,"alumni",person.source_id,email,"[동문 네트워크] 수신 설정 안내",
    '<p>'+esc(person.data.name)+'님,</p><p>'+esc(message)+'</p><p><a href="https://portal.k-bigdata.kr/alumni/alumni.html">내 정보 수정</a></p>'))sent++;
   else failed++;
  }
  return {success:true,message:"안내 메일 "+sent+"건 발송, "+failed+"건 실패"};
 }
 default:throw Error("지원하지 않는 기능입니다: "+text(action,60));
 }
}
Deno.serve(async(request:Request)=>{
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(request.method!=="POST")return err("POST 요청만 허용됩니다.",405);
 const origin=request.headers.get("origin");
 if(origin&&origin!==site)return err("허용되지 않는 사이트입니다.",403);
 let body:Record<string,unknown>;
 try{body=await request.json();}catch{return err("요청 JSON이 올바르지 않습니다.");}
 const action=text(body.action,80);
 if(!action)return err("요청 기능이 지정되지 않았습니다.");
 try{
  const a=await actor(request);
  const data=await handle(action,(body.data&&typeof body.data==="object"&&!Array.isArray(body.data)?
   body.data:{} ) as Record<string,unknown>,a);
  return result(data);
 }catch(e){
  const message=text((e as Error)?.message,280)||"요청을 처리하지 못했습니다.";
  const forbidden=/권한|인증|로그인|본인|승인된 포털/.test(message);
  console.error("Alumni API",action,forbidden?"AUTH_ERROR":"ACTION_ERROR");
  return err(message,forbidden?403:400);
 }
});
