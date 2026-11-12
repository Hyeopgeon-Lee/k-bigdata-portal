import {Caller,all,one,store,db,now,makeId,trim,yes,list,requireOwner,escape,notifyAdmin,sendMail} from "./shared.ts";

const approved=async(id:string)=>{
 const a=await one("alumni",id);
 if(!a||a.data.status!=="APPROVED")throw Error("승인된 졸업생 정보를 찾을 수 없습니다.");
 return a.data;
};
const fields=["employment_status","company","job","company_url","employment_year","job_description",
 "skills","bachelor_status","bachelor_school","bachelor_major","bachelor_year","graduate_status","graduate_school_type",
 "graduate_school","graduate_major","graduate_degree","graduate_entry_year","graduate_graduation_year",
 "research_fields","mentoring_topics","introduction","message_to_juniors","contact_allowed"];
function profilePayload(b:Record<string,any>,email:string,existing:Record<string,any>){
 const p={...existing};
 for(const k of fields){
  if(["skills","research_fields","mentoring_topics"].includes(k))p[k]=list(b[k]).join("|").slice(0,300);
  else if(k==="contact_allowed")p[k]=yes(b[k]);
  else p[k]=trim(b[k],["introduction","message_to_juniors","job_description"].includes(k)?1200:300);
 }
 p.name=existing.name||trim(b.name,80);
 p.email=email;
 p.phone=trim(b.phone||existing.phone,25);
 p.career_mail_enabled=yes(b.career_mail_enabled);
 p.alumni_news_mail_enabled=yes(b.alumni_news_mail_enabled);
 if(!/^01[016789][0-9 -]{7,12}$/.test(String(p.phone)))throw Error("휴대전화 형식을 확인해 주세요.");
 if(!p.name||p.name.length<2)throw Error("이름을 확인해 주세요.");
 if(!p.employment_status||!p.bachelor_status||!p.graduate_status)throw Error("필수 학적·진로 정보를 입력해 주세요.");
 if(p.contact_allowed&&!yes(b.contact_consent))throw Error("연락 요청 수신 동의가 필요합니다.");
 return p;
}
async function consentHistory(id:string,before:any,after:any,kind:string){
 const had=String(before??""),has=String(after??"");
 if(had===has)return;
 const id2=makeId("C");
 await store("alumni_consent_logs",id2,{log_id:id2,alumni_id:id,consent_type:kind,previous_value:had,new_value:has,changed_at:now()});
}
export async function writeAction(action:string,b:Record<string,any>,u:Caller):Promise<any>{
 if(action==="findAlumniId"||action==="requestPinReset"||action==="resetPin")
  throw Error("PIN 인증은 종료되었습니다. 포털 계정에서 비밀번호 재설정을 이용해 주세요.");
 if(action==="register"||action==="update"){
  if(u.signup_type!=="alumni")throw Error("졸업생 포털 계정으로 로그인해 주세요.");
  if(!yes(b.privacy_consent)||!yes(b.identity_consent))throw Error("개인정보 이용 및 본인확인 동의가 필요합니다.");
  const currentId=u.source_id;
  if(action==="update"&&(!currentId||b.alumni_id!==currentId))throw Error("본인의 동문 정보만 수정할 수 있습니다.");
  if(action==="register"&&currentId)throw Error("이미 동문으로 등록되어 있습니다. 내 정보 수정을 이용해 주세요.");
  const id=currentId||makeId("A");
  const source=currentId?(await one("alumni",currentId))?.data||null:null;
  if(action==="update"&&!source)throw Error("본인 동문 정보를 찾을 수 없습니다.");
  const profile=await db.from("profiles").select("full_name,graduation_year,mobile_phone").eq("user_id",u.id).single();
  if(profile.error||!profile.data)throw Error("포털 본인 정보를 확인하지 못했습니다.");
  const row=profilePayload(b,u.email,source||{});
  const expectedName=trim(profile.data.full_name,80),expectedYear=profile.data.graduation_year;
  if(row.name!==expectedName||Number(b.graduation_year)!==Number(expectedYear))
   throw Error("포털에 등록된 이름과 졸업연도를 변경할 수 없습니다. 마이페이지에서 확인해 주세요.");
  const prevCareer=source?.career_mail_enabled??"",prevNews=source?.alumni_news_mail_enabled??"";
  Object.assign(row,{alumni_id:id,graduation_year:expectedYear,status:"PENDING",
    created_at:source?.created_at||now(),updated_at:now()});
  delete row.edit_pin_hash;delete row.approval_nonce_hash;delete row.approval_token_expires_at;
  await store("alumni",id,row);
  if(!currentId){
   const {data:linked,error:linkError}=await db.from("profiles").update({alumni_source_id:id})
    .eq("user_id",u.id).is("alumni_source_id",null).select("user_id").maybeSingle();
   if(linkError||!linked)throw Error("계정과 동문 정보 연결에 실패했습니다. 관리자에게 문의해 주세요.");
  }
  await Promise.all([
   consentHistory(id,prevCareer,row.career_mail_enabled,"CAREER_MAIL"),
   consentHistory(id,prevNews,row.alumni_news_mail_enabled,"ALUMNI_NEWS_MAIL")
  ]);
  await notifyAdmin("졸업생 프로필 승인 요청","<p>"+escape(row.name)+"님의 동문 정보 승인 요청이 등록되었습니다.</p><p>포털 관리자 화면에서 검토해 주세요.</p>",id);
  return{message:action==="register"?"등록이 완료되었습니다. 관리자 승인 후 공개됩니다.":"수정이 완료되었습니다. 관리자 재승인 후 공개됩니다.",alumni_id:id};
 }
 if(action==="submitJob"){
  const id=requireOwner(u,b.alumni_id);
  await approved(id);
  const company=trim(b.company,100),job_title=trim(b.job_title,100),job_url=trim(b.job_url,500);
  if(!company||!job_title||!/^https:\/\/[^ ]{3,}$/.test(job_url)||!["신입","경력","신입·경력"].includes(b.recruit_type)||
   !["정규직","계약직","인턴","기타"].includes(b.employment_type))throw Error("채용정보 필수값과 URL을 확인해 주세요.");
  if(!yes(b.always_open)&&!/^\d{4}-\d{2}-\d{2}$/.test(trim(b.deadline,10)))
   throw Error("마감일을 입력하거나 상시채용을 선택해 주세요.");
  const jid=makeId("J"),entry={job_id:jid,alumni_id:id,company,job_title,job_url,
   recruit_type:b.recruit_type,employment_type:b.employment_type,location:trim(b.location,100),
   deadline:yes(b.always_open)?"":trim(b.deadline,10),always_open:yes(b.always_open),
   skills:Array.isArray(b.skills)?list(b.skills).join("|"):trim(b.skills,300).replace(/\s*,\s*/g,"|"),
   alumni_comment:trim(b.alumni_comment,800),referral_available:yes(b.referral_available),
   contact_allowed:yes(b.contact_allowed),status:"PENDING",approved_at:"",approved_by:"",
   last_mailed_at:"",created_at:now(),updated_at:now()};
  await store("jobs",jid,entry);
  await notifyAdmin("동문 채용공고 승인 요청","<p>"+escape(company)+" / "+escape(job_title)+" 승인 요청이 있습니다.</p>",jid);
  return{message:"채용정보 등록 신청이 완료되었습니다. 관리자 승인 후 공개됩니다.",job_id:jid};
 }
 if(action==="submitNews"){
  const id=requireOwner(u,b.alumni_id);await approved(id);
  const type=trim(b.news_type,30);
  if(!["EMPLOYMENT","JOB_CHANGE","PROMOTION","STARTUP","GRADUATE_SCHOOL","ACHIEVEMENT","MARRIAGE","BIRTH_SON","BIRTH_DAUGHTER","OBITUARY","OTHER"].includes(type))
   throw Error("소식 종류를 선택해 주세요.");
  const title=trim(b.title,120),content=trim(b.content,2000);
  if(!title||!content)throw Error("제목과 내용을 입력해 주세요.");
  const target=type==="OBITUARY"?trim(b.target_alumni_id,40):id;
  if(type==="OBITUARY"){await approved(target);if(!trim(b.relationship,60))throw Error("고인과의 관계를 확인해 주세요.");}
  if(b.external_url&&!/^https:\/\/[^ ]{3,}$/.test(trim(b.external_url,500)))throw Error("외부 주소는 HTTPS를 사용해 주세요.");
  const nid=makeId("N"),entry:Record<string,any>={
   news_id:nid,alumni_id:target,submitted_by_alumni_id:id,
   news_type:type,title,content,
   mail_requested:yes(b.mail_requested),mail_status:yes(b.mail_requested)?"WAITING":"NOT_REQUESTED",
   status:"PENDING",approved_at:"",approved_by:"",created_at:now(),updated_at:now()};
  for(const k of ["company","job_title","organization","position_title","school_name","degree_or_program","location","relationship","event_date","external_url"])
   entry[k]=trim(k==="relationship"&&b.relationship==="기타"?b.relationship_other:b[k],k==="event_date"?30:500);
  await store("alumni_news",nid,entry);
  await notifyAdmin("동문소식 승인 요청","<p>"+escape(title)+" 승인 요청이 있습니다.</p>",nid);
  return{message:"동문소식 등록 신청이 완료되었습니다. 관리자 승인 후 공개됩니다.",news_id:nid};
 }
 if(action==="contact"){
  if(b.website)throw Error("요청을 처리할 수 없습니다.");
  const target=trim(b.alumni_id,40),alum=await approved(target);
  if(!yes(alum.contact_allowed))throw Error("현재 연락 요청을 받지 않는 졸업생입니다.");
  if(b.job_id){
   const job=await one("jobs",trim(b.job_id,40));
   if(!job||job.data.alumni_id!==target||job.data.status!=="APPROVED"||!yes(job.data.contact_allowed))
    throw Error("해당 채용정보의 문의가 허용되지 않았습니다.");
  }
  const text=trim(b.message,3000),subject=trim(b.subject,140),name=trim(b.requester_name,40);
  if(text.length<20||!subject||!name)throw Error("연락 요청 내용을 20자 이상 입력해 주세요.");
  const email=trim(b.requester_email,120).toLowerCase();
  if(email!==u.email)throw Error("연락 요청 이메일은 포털 로그인 이메일과 일치해야 합니다.");
  const past=await all("contact_requests");
  const recent=past.filter(r=>r.data.requester_user_id===u.id&&Date.now()-Date.parse(r.data.created_at)<86400000);
  if(recent.length>=5||recent.some(x=>x.data.alumni_id===target&&Date.now()-Date.parse(x.data.created_at)<1800000))
   throw Error("연락 요청 횟수 제한에 도달했습니다. 잠시 후 다시 시도해 주세요.");
  const mobile=trim(b.requester_phone,25);
  if(yes(b.share_phone)&&!/^01[016789][0-9 -]{7,12}$/.test(mobile))
   throw Error("전달할 휴대전화 번호를 입력해 주세요.");
  const rid=makeId("R");
  const data={request_id:rid,alumni_id:target,requester_user_id:u.id,requester_name:name,
   requester_type:trim(b.requester_type,12),requester_student_id_or_year:trim(b.requester_student_id_or_year,30),
   requester_email:email,requester_phone:mobile,share_email:yes(b.share_email),share_phone:yes(b.share_phone),
   category:trim(b.category,50),subject,message:text,status:"PENDING",created_at:now(),sent_at:""};
  await store("contact_requests",rid,data);
  const html="<h2>동문 네트워크 연락 요청</h2><p>요청자: "+escape(name)+"</p><p>주제: "+escape(subject)+"</p><p>"+escape(text).replace(/\n/g,"<br>")+"</p>"+
   (data.share_email?"<p>회신 이메일: "+escape(email)+"</p>":"")+
   (data.share_phone?"<p>회신 휴대전화: "+escape(mobile)+"</p>":"");
  const response=await sendMail("contact","contact_requests",rid,String(alum.email||""), "[BigData Alumni] 동문 연락 요청",html);
  if(response.status==="SENT")await store("contact_requests",rid,{...data,status:"SENT",sent_at:now()});
  else if(response.status==="FAILED")await store("contact_requests",rid,{...data,status:"FAILED"});
  if(response.status!=="SENT")throw Error("연락 요청이 접수됐으나 메일 전달에 실패했습니다. 관리자에게 확인해 주세요.");
  return{message:"연락 요청이 전달되었습니다.",request_id:rid};
 }
 throw Error("지원하지 않는 저장 요청입니다.");
}