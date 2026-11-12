import {all,one,publicAlumni,publicJob,publicNews,activeJob,maskName,yes,trim,requireAdmin,requireOwner,Caller} from "./shared.ts";
export async function readAction(action:string,b:Record<string,any>,u:Caller):Promise<any>{
 const needed=["alumni","jobs","alumni_news"];
 const items=await Promise.all(needed.map(all));
 const aRows=items[0].map(x=>x.data),jRows=items[1].map(x=>x.data),nRows=items[2].map(x=>x.data);
 const approved=aRows.filter(a=>a.status==="APPROVED");
 const amap=new Map(aRows.map(a=>[String(a.alumni_id),a]));
 const publicJobs=jRows.filter(activeJob).map(j=>publicJob(j,amap.get(String(j.alumni_id))||{}))
  .sort((x,y)=>String(y.created_at).localeCompare(String(x.created_at)));
 const publicNewsRows=nRows.filter(n=>n.status==="APPROVED").map(n=>publicNews(n,amap.get(String(n.alumni_id))||{}))
  .sort((x,y)=>String(y.event_date||y.created_at).localeCompare(String(x.event_date||x.created_at)));
 const id=trim(b.id||b.alumni_id||"",120);
 switch(action){
 case "home":return{alumni:approved.map(publicAlumni),jobs:publicJobs.slice(0,3),news:publicNewsRows.slice(0,5)};
 case "list":return approved.map(publicAlumni);
 case "detail":{const a=approved.find(x=>x.alumni_id===id);if(!a)throw Error("졸업생 정보를 찾을 수 없습니다.");return publicAlumni(a);}
 case "alumniDetail":{
  const a=approved.find(x=>x.alumni_id===id);if(!a)throw Error("졸업생 정보를 찾을 수 없습니다.");
  return{profile:publicAlumni(a),jobs:publicJobs.filter(j=>j.alumni_id===id),news:publicNewsRows.filter(n=>n.alumni_id===id)};
 }
 case "careerPublic":return approved.filter(a=>a.employment_status==="취업 중"&&a.company&&a.job)
  .map(a=>({graduation_year:String(a.graduation_year||""),masked_name:maskName(a.name),company:a.company,job:a.job}))
  .sort((a,b)=>String(b.graduation_year).localeCompare(String(a.graduation_year))||a.company.localeCompare(b.company));
 case "jobs":return publicJobs;
 case "jobDetail":{const j=publicJobs.find(x=>x.job_id===id);if(!j)throw Error("채용정보를 찾을 수 없습니다.");return j;}
 case "alumniJobs":return publicJobs.filter(j=>j.alumni_id===id);
 case "newsList":return publicNewsRows;
 case "newsDetail":{const n=publicNewsRows.find(n=>n.news_id===id);if(!n)throw Error("동문소식을 찾을 수 없습니다.");return n;}
 case "alumniNews":return publicNewsRows.filter(n=>n.alumni_id===id);
 case "getOwn":{
  const ownId=requireOwner(u,b.alumni_id);
  const record=aRows.find(a=>a.alumni_id===ownId);
  if(!record)throw Error("본인 동문 정보가 없습니다.");
  const safe={...record};for(const key of ["edit_pin_hash","approval_nonce_hash","approval_token_expires_at"])delete safe[key];
  return safe;
 }
 case "verifyJobAlumni":
 case "verifyNewsAlumni":{
  const ownId=requireOwner(u,b.alumni_id);
  const a=approved.find(x=>x.alumni_id===ownId);if(!a)throw Error("승인된 졸업생 정보가 없습니다.");
  return{alumni_id:a.alumni_id,name:a.name,graduation_year:String(a.graduation_year)};
 }
 case "newsAlumniSearch":{
  requireOwner(u,b.alumni_id);
  const q=trim(b.query,60).toLowerCase();
  if(!q)throw Error("검색어를 입력해 주세요.");
  return approved.filter(a=>[a.name,a.company,a.job,a.graduation_year].join(" ").toLowerCase().includes(q))
   .slice(0,20).map(a=>({alumni_id:a.alumni_id,name:maskName(a.name),graduation_year:String(a.graduation_year||""),company:a.company||"",job:a.job||""}));
 }
 case "adminList":{
  requireAdmin(u);const view=trim(b.view||"alumni",30);
  if(view==="alumni")return aRows.map(a=>({...publicAlumni(a),email:a.email||"",phone:a.phone||"",status:a.status,
   created_at:a.created_at||"",career_mail_enabled:a.career_mail_enabled??"",alumni_news_mail_enabled:a.alumni_news_mail_enabled??""}));
  if(view==="jobs")return jRows.map(j=>{
   const a=amap.get(String(j.alumni_id))||{};
   return {...publicJob(j,a),status:j.status,approved_at:j.approved_at||"",created_at:j.created_at||"",
    alumni_name_admin:a.name||"",job_url:undefined};
  });
  if(view==="news")return nRows.map(n=>{
   const a=amap.get(String(n.alumni_id))||{};
   const submit=amap.get(String(n.submitted_by_alumni_id))||{};
   return {...publicNews(n,a),target_name_admin:a.name||"",submitter_name_admin:submit.name||n.submitted_by_alumni_id||"",
    status:n.status,mail_requested:yes(n.mail_requested),mail_status:n.mail_status||"",created_at:n.created_at||""};
  });
  if(view==="requests")return (await all("contact_requests")).map(x=>{
   const d=x.data;
   return Object.fromEntries(Object.entries(d).filter(([k])=>!["requester_email","requester_phone","message"].includes(k)));
  });
  if(view==="mail_logs"){
   const [jobs,news]=await Promise.all([all("job_mail_logs"),all("alumni_news_mail_logs")]);
   const historic=jobs.map(x=>({...x.data,mail_kind:"채용정보",related_id:x.data.job_ids,subject:"채용정보 Digest"}))
    .concat(news.map(x=>({...x.data,mail_kind:"동문소식",related_id:x.data.news_id})));
   return historic.sort((a,b)=>String(b.sent_at||"").localeCompare(String(a.sent_at||"")));
  }
  throw Error("관리 목록 구분이 올바르지 않습니다.");
 }
 default:throw Error("지원하지 않는 조회 요청입니다.");
 }
}