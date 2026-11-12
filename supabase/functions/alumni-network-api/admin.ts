import {all,one,store,now,makeId,trim,yes,list,escape,sendMail,requireAdmin,Caller} from "./shared.ts";
const approved=async (id:string)=>{
 const x=await one("alumni",id);
 if(!x||x.data.status!=="APPROVED")throw Error("승인된 동문 정보를 선택해 주세요.");
 return x.data;
};
async function subscribers(kind:"career_mail_enabled"|"alumni_news_mail_enabled"){
 return (await all("alumni")).map(x=>x.data).filter(x=>x.status==="APPROVED"&&yes(x[kind])&&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(x.email||"")));
}
async function sendNews(n:Record<string,any>){
 const prior=await all("alumni_news_mail_logs");
 if(prior.some(x=>x.data.news_id===n.news_id&&x.data.status==="SENT"))return{status:"ALREADY_SENT",sent:0,failed:0};
 const targets=await subscribers("alumni_news_mail_enabled");
 let sent=0,failed=0;
 const subject="[BigData Alumni] "+trim(n.title,110);
 const html="<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:22px\"><h2>동문소식</h2>"+
 "<h3>"+escape(n.title)+"</h3><p>"+escape(n.content).replace(/\n/g,"<br>")+"</p>"+
 "<a href=\"https://portal.k-bigdata.kr/alumni/news-detail.html?id="+encodeURIComponent(n.news_id)+"\">자세히 보기</a></div>";
 for(const a of targets){
  const result=await sendMail("alumni_news","alumni_news",n.news_id,String(a.email),subject,html);
  if(["SENT","sent"].includes(result.status))sent++;else failed++;
 }
 const status=failed?(sent?"PARTIAL_FAILED":"FAILED"):"SENT";
 const logId=makeId("NM");
 await store("alumni_news_mail_logs",logId,{mail_id:logId,news_id:n.news_id,news_type:n.news_type,
  subject,recipient_count:targets.length,sent_count:sent,failed_count:failed,sent_at:now(),status});
 await store("alumni_news",n.news_id,{...n,mail_status:status,updated_at:now()});
 return{status,sent,failed};
}
async function jobDigest(){
 const rows=(await all("jobs")).map(x=>x.data);
 const today=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
 const unmailed=rows.filter(x=>x.status==="APPROVED"&&!x.last_mailed_at&&
  (yes(x.always_open)||!x.deadline||String(x.deadline).slice(0,10)>=today));
 if(!unmailed.length)return{message:"발송 대기 중인 신규 채용공고가 없습니다.",status:"NO_JOBS"};
 const recipients=await subscribers("career_mail_enabled");
 const subject="[BigData Alumni] 동문 추천 채용공고 "+unmailed.length+"건";
 const html="<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:22px\"><h2>선배가 알려주는 채용정보</h2>"+
 unmailed.map(x=>"<p><strong>"+escape(x.company)+" · "+escape(x.job_title)+"</strong><br><a href=\"https://portal.k-bigdata.kr/alumni/job-detail.html?id="+encodeURIComponent(x.job_id)+"\">채용공고 보기</a></p>").join("")+"</div>";
 const batchId=unmailed.map(j=>j.job_id).join("|");
 let sent=0,failed=0;
 for(const person of recipients){
  const r=await sendMail("job_digest","jobs",batchId,String(person.email),subject,html);
  if(["SENT","sent"].includes(r.status))sent++;else failed++;
 }
 const sentAt=now(),status=failed?(sent?"PARTIAL":"FAILED"):"SENT";
 const mailId=makeId("M");
 await store("job_mail_logs",mailId,{mail_id:mailId,job_ids:batchId,recipient_count:recipients.length,
  sent_count:sent,failed_count:failed,sent_at:sentAt,status});
 // Do not mark a partially delivered digest fully sent. Retry is idempotent via outbox.
 if(!failed)for(const job of unmailed)await store("jobs",job.job_id,{...job,last_mailed_at:sentAt,updated_at:sentAt});
 return{message:"채용정보 안내: 성공 "+sent+"명, 실패 "+failed+"명",status,sent,failed};
}
async function consentInvites(kind:"career_mail_enabled"|"alumni_news_mail_enabled"){
 const event=kind==="career_mail_enabled"?"career_consent":"news_consent";
 const tab=kind==="career_mail_enabled"?"career_consent_invites":"alumni_news_consent_invites";
 const sent=new Set((await all(tab)).filter(r=>r.data.status==="SENT").map(r=>r.data.alumni_id));
 const people=(await all("alumni")).map(x=>x.data).filter(a=>a.status==="APPROVED"&&
   (a[kind]===""||a[kind]==null)&&!sent.has(a.alumni_id)&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(a.email||"")));
 let success=0,failed=0;
 for(const p of people){
  const html="<p>"+escape(p.name)+" 동문님, 동문 네트워크의 이메일 수신 설정을 선택하실 수 있습니다.</p>"+
   "<p>수신을 원하지 않으면 별도로 설정하지 않으셔도 됩니다.</p>"+
   "<a href=\"https://portal.k-bigdata.kr/alumni/alumni.html\">포털에서 수신 설정하기</a>";
  const r=await sendMail(event,tab,p.alumni_id,p.email,"[BigData Alumni] 이메일 수신 설정 안내",html);
  if(["SENT","sent"].includes(r.status)){
   const id=makeId("I");await store(tab,id,{invite_id:id,alumni_id:p.alumni_id,sent_at:now(),status:"SENT"});success++;
  }else failed++;
 }
 return{message:"수신 설정 안내: 성공 "+success+"명, 실패 "+failed+"명",sent:success,failed};
}
export async function adminAction(action:string,b:Record<string,any>,u:Caller):Promise<any>{
 requireAdmin(u);
 const aid=trim(b.alumni_id,40),jid=trim(b.job_id,40),nid=trim(b.news_id,40);
 if(["adminApprove","adminReject","adminHide"].includes(action)){
  const row=await one("alumni",aid);if(!row)throw Error("동문 정보를 찾을 수 없습니다.");
  const status=action==="adminApprove"?"APPROVED":action==="adminReject"?"REJECTED":"HIDDEN";
  await store("alumni",aid,{...row.data,status,updated_at:now(),approved_by:u.email});
  return{message:"졸업생 상태가 변경되었습니다."};
 }
 if(["adminJobApprove","adminJobReject","adminJobHide","adminJobPublish"].includes(action)){
  const row=await one("jobs",jid);if(!row)throw Error("채용정보가 없습니다.");
  const status=action==="adminJobReject"?"REJECTED":action==="adminJobHide"?"HIDDEN":"APPROVED";
  if(action==="adminJobApprove"&&row.data.status!=="PENDING")throw Error("승인 대기 중인 공고가 아닙니다.");
  const at=now();await store("jobs",jid,{...row.data,status,updated_at:at,approved_by:u.email,
   approved_at:status==="APPROVED"?(row.data.approved_at||at):row.data.approved_at});
  return{message:"채용정보 상태가 변경되었습니다."};
 }
 if(["adminNewsApproveAndMail","adminNewsApprove","adminNewsReject","adminNewsHide","adminNewsPublish"].includes(action)){
  const row=await one("alumni_news",nid);if(!row)throw Error("동문소식이 없습니다.");
  const isApproval=["adminNewsApproveAndMail","adminNewsApprove"].includes(action);
  if(isApproval&&row.data.status!=="PENDING")throw Error("승인 대기 중인 소식이 아닙니다.");
  const status=action==="adminNewsReject"?"REJECTED":action==="adminNewsHide"?"HIDDEN":"APPROVED";
  const stamp=now(),entry={...row.data,status,updated_at:stamp,
   approved_by:status==="APPROVED"?u.email:row.data.approved_by,
   approved_at:status==="APPROVED"?(row.data.approved_at||stamp):row.data.approved_at};
  await store("alumni_news",nid,entry);
  if(action==="adminNewsApproveAndMail"){
   const mail=await sendNews(entry);
   return{message:"동문소식을 게시했습니다. 메일 발송: "+mail.status};
  }
  return{message:"동문소식 상태를 변경했습니다."};
 }
 if(action==="adminCreateJob"){
  const a=await approved(aid);
  const company=trim(b.company,100),job_title=trim(b.job_title,100),job_url=trim(b.job_url,500);
  if(!company||!job_title||!/^https:\/\/\S+$/.test(job_url))throw Error("회사·직무·공고 URL을 입력해 주세요.");
  const id=makeId("J"),date=now();
  const data={job_id:id,alumni_id:aid,company,job_title,job_url,
   recruit_type:trim(b.recruit_type,20),employment_type:trim(b.employment_type,20),location:trim(b.location,100),
   deadline:yes(b.always_open)?"":trim(b.deadline,10),always_open:yes(b.always_open),
   skills:trim(b.skills,300).replace(/\s*,\s*/g,"|"),alumni_comment:trim(b.alumni_comment,800),
   referral_available:yes(b.referral_available),contact_allowed:yes(b.contact_allowed),
   status:"APPROVED",approved_at:date,approved_by:u.email,created_at:date,updated_at:date,
   last_mailed_at:yes(b.queue_mail)?"":date};
  await store("jobs",id,data);
  return{message:"관리자 채용공고가 게시되었습니다.",job_id:id};
 }
 if(action==="adminCreateNews"){
  await approved(trim(b.target_alumni_id||b.alumni_id,40));
  const type=trim(b.news_type,30),title=trim(b.title,120),content=trim(b.content,2000);
  if(!title||!content||!["EMPLOYMENT","JOB_CHANGE","PROMOTION","STARTUP","GRADUATE_SCHOOL","ACHIEVEMENT","MARRIAGE","BIRTH_SON","BIRTH_DAUGHTER","OBITUARY","OTHER"].includes(type))
   throw Error("소식 종류·제목·내용을 확인해 주세요.");
  const id=makeId("N"),at=now();
  const data:Record<string,any>={news_id:id,alumni_id:trim(b.target_alumni_id||b.alumni_id,40),
   submitted_by_alumni_id:"ADMIN:"+u.email,news_type:type,title,content,mail_requested:yes(b.send_mail),
   mail_status:yes(b.send_mail)?"WAITING":"NOT_REQUESTED",
   status:"APPROVED",approved_by:u.email,approved_at:at,created_at:at,updated_at:at};
  for(const k of ["company","job_title","organization","position_title","school_name","degree_or_program","event_date","location","relationship","external_url"])
   data[k]=trim(b[k],500);
  await store("alumni_news",id,data);
  if(yes(b.send_mail)){const m=await sendNews(data);return{message:"동문소식 게시 완료 · 메일 "+m.status,news_id:id};}
  return{message:"동문소식이 게시되었습니다.",news_id:id};
 }
 if(action==="adminRunJobDigest")return await jobDigest();
 if(action==="adminSendCareerConsentInvites")return await consentInvites("career_mail_enabled");
 if(action==="adminSendNewsConsentInvites")return await consentInvites("alumni_news_mail_enabled");
 if(action==="adminLogout")return{message:"관리자 화면을 종료했습니다."};
 throw Error("지원하지 않는 관리자 작업입니다.");
}