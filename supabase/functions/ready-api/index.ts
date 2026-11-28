import {createClient} from "npm:@supabase/supabase-js@2.49.10";
import {evaluateStudentReadiness,readinessGuide} from "./rules.mjs";
import {checkStudent,repoParts} from "./checks.mjs";
import {githubIdentity} from "./oidc.ts";
const url=Deno.env.get("SUPABASE_URL")!, key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, anon=Deno.env.get("SUPABASE_ANON_KEY")!;
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const origin="https://portal.k-bigdata.kr", stamp=()=>new Date().toISOString(), date=()=>new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
const headers={"Content-Type":"application/json","Cache-Control":"no-store","Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization, apikey, x-client-info, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"};
const reply=(data:any,status=200)=>new Response(JSON.stringify(data),{status,headers});
const read=async(q:any)=>{const {data,error}=await q;if(error)throw Error("DATABASE_ERROR");return data};
const write=read;
const cols="user_id,full_name,student_no,academic_year,enrollment_status";
const activeMembers=()=>read(db.from("profiles").select(cols).eq("approval_status","approved").eq("signup_type","student").in("enrollment_status",["enrolled","leave","early_employment"]).order("academic_year").order("full_name"));
const settings=()=>read(db.from("ready_operations").select("*").eq("singleton",true).single());
const text=(v:any,max=200)=>String(v??"").trim().slice(0,max);
const fields=["career_target","github_url","github_pages_url","github_pages_repo","notion_url","portfolio_url","blog_url","resume_status","cover_letter_status"];
const docStatus:Record<string,string[]>={resume_status:["미작성","작성 중","1차 완성","최종 완성"],cover_letter_status:["미작성","작성 중","기본본 완성","기업 지원 가능"]};
function cleanURL(v:any){if(!v)return "";const u=new URL(text(v,1000));if(!["http:","https:"].includes(u.protocol)||u.username||u.password||u.port)throw Error("URL을 확인하세요.");return u.href}
async function bundle(m:any,detail=false){
 const id=m.user_id;
 const [profile,repos,checks,repoChecks,certs,plans]=await Promise.all([
 read(db.from("ready_profiles").select("data,peer_share_consent_at,updated_at,last_manual_update_at").eq("user_id",id).maybeSingle()),
 read(db.from("ready_repositories").select("*").eq("user_id",id).eq("active",true).order("is_primary",{ascending:false}).order("display_order")),
 read(db.from("ready_student_checks").select("kind,checked_at,data").eq("user_id",id)),
 read(db.from("ready_repository_checks").select("repo_id,kind,checked_at,data").eq("user_id",id)),
 read(db.from("student_certifications").select("id,certificate_name,pass_status,final_pass_date,verification_status").eq("user_id",id)),
 read(db.from("ready_certificate_plans").select("id,certificate_name").eq("user_id",id).order("created_at"))
 ]);
 const s={...profile?.data,grade:String(m.academic_year||""),name:m.full_name,student_no:m.student_no};
 const c=Object.fromEntries(checks.map((x:any)=>[x.kind,{...x.data,checked_at:x.checked_at}]));
 const r=repoChecks.filter((x:any)=>x.repo_id===repos[0]?.repo_id);
 const primary=Object.fromEntries(r.map((x:any)=>[x.kind,{...x.data,checked_at:x.checked_at}]));
 const evaluation=evaluateStudentReadiness(s,{...c,...primary,publicPortfolio:c.portfolio,repositoryCount:repos.length});
 const result:any={member:m,student:s,registered:!!profile,consent:!!profile?.peer_share_consent_at,updated_at:profile?.last_manual_update_at,evaluation,checks:c,primary,certificates:certs,plans,repositories:repos,repoChecks};
 if(detail)result.history=await read(db.from("ready_change_history").select("changed_at,category,field_name,old_value,new_value,changed_by").eq("user_id",id).order("changed_at",{ascending:false}).limit(300));
 return result;
}
const compact=(b:any)=>({member:b.member,registered:b.registered,evaluation:b.evaluation,certificate_count:b.certificates.filter((c:any)=>c.pass_status==="final").length,updated_at:b.updated_at,consent:b.consent,student:b.student});
const stats=(rows:any[])=>({total_students:rows.length,registered:rows.filter(b=>b.registered).length,excellent:rows.filter(b=>b.evaluation.status==="준비 우수").length,good:rows.filter(b=>b.evaluation.status==="준비 양호").length,preparing:rows.filter(b=>b.evaluation.status==="준비 중").length,attention_count:rows.filter(b=>b.evaluation.status==="관심 필요").length,github_active_7d:rows.filter(b=>b.evaluation.github.active_days_7d>=3&&b.evaluation.github_fresh).length,github_inactive_14d:rows.filter(b=>b.evaluation.github_fresh&&b.evaluation.github.check_status==="SUCCESS"&&Number(b.evaluation.github.inactive_days)>=14).length,readme_missing:rows.filter(b=>b.evaluation.readme.status==="README 미작성").length,readme_needs_work:rows.filter(b=>["README 보완 필요","README 내용 부족"].includes(b.evaluation.readme.status)).length,portfolio_missing:rows.filter(b=>!b.evaluation.portfolio.registered).length,grade2_resume_incomplete:rows.filter(b=>b.student.grade==="2"&&b.student.resume_status!=="최종 완성").length,grade2_cover_incomplete:rows.filter(b=>b.student.grade==="2"&&!["기업 지원 가능","기본본 완성"].includes(b.student.cover_letter_status)).length,certificate_holders:rows.filter(b=>b.certificate_count>0).length});
async function roster(){const members=await activeMembers(),out=[];for(let i=0;i<members.length;i+=6)out.push(...await Promise.all(members.slice(i,i+6).map((m:any)=>bundle(m).then(compact))));return out}
async function saveProfile(id:string,body:any,old:any){
 const next={...old?.data};
 for(const f of fields)if(Object.hasOwn(body,f)){
  const v=text(body[f],f.includes("url")||f==="github_pages_repo"?1000:200);
  if(docStatus[f]&&!docStatus[f].includes(v))throw Error("문서 준비 상태를 확인하세요.");
  next[f]=f.includes("url")||f==="github_pages_repo"?cleanURL(v):v;
 }
 if(next.github_url){const p=repoParts(next.github_url);next.github_username=p.owner;}else next.github_username="";
 if(next.github_pages_repo)repoParts(next.github_pages_repo,true);
 const consent=body.peer_share_consent===true?(old?.peer_share_consent_at||stamp()):body.peer_share_consent===false?null:old?.peer_share_consent_at||null;
 await write(db.from("ready_profiles").upsert({user_id:id,data:next,peer_share_consent_at:consent,updated_at:stamp(),last_manual_update_at:stamp()}));
 const history=fields.filter(f=>String(old?.data?.[f]||"")!==String(next[f]||"")).map(f=>({user_id:id,category:"프로필",field_name:f,old_value:String(old?.data?.[f]||""),new_value:String(next[f]||""),changed_by:"STUDENT"}));
 if(!!consent!==!!old?.peer_share_consent_at)history.push({user_id:id,category:"프로필",field_name:"peer_share_consent",old_value:old?.peer_share_consent_at?"동의":"미동의",new_value:consent?"동의":"미동의",changed_by:"STUDENT"});
 if(history.length)await write(db.from("ready_change_history").insert(history));
 return {saved:true};
}
async function runCheck(id:string,self:boolean,token?:string){
 const claimed=await read(db.rpc("ready_claim_check",{p_user:id,p_self:self}));if(!claimed)return {status:"SKIPPED",message:"점검 중이거나 10분 뒤 다시 시도해 주세요."};
 try{return await checkStudent(db,id,token||Deno.env.get("READY_GITHUB_TOKEN")||Deno.env.get("GITHUB_TOKEN")||"")}
 finally{await write(db.from("ready_profiles").update({check_lease_until:null}).eq("user_id",id))}
}
const esc=(v:any)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
async function weekly(send:boolean){
 const rows=await roster(),cur=stats(rows),today=date(),week=new Date(today+"T00:00:00Z");week.setUTCDate(week.getUTCDate()-(week.getUTCDay()+6)%7);const monday=week.toISOString().slice(0,10);
 const previous=await read(db.from("ready_weekly_snapshots").select("data").lt("snapshot_date",today).order("snapshot_date",{ascending:false}).limit(1).maybeSingle());
 await write(db.from("ready_weekly_snapshots").upsert({snapshot_date:today,data:cur,source:"portal"}));
 if(!send)return {current:cur,previous:previous?.data,mail:"disabled"};
 const existing=await read(db.from("ready_report_deliveries").select("status").eq("week_start",monday).maybeSingle());if(existing)return {mail:existing.status};
 const mailKey=Deno.env.get("RESEND_API_KEY");if(!mailKey)throw Error("메일 연동 설정 필요");
 const {error}=await db.from("ready_report_deliveries").insert({week_start:monday,status:"pending"});if(error)return {mail:"already_requested"};
 const names:Record<string,string>={total_students:"전체 학생",registered:"등록",excellent:"준비 우수",good:"준비 양호",preparing:"준비 중",attention_count:"관심 필요",github_active_7d:"GitHub 7일 활동 충족",github_inactive_14d:"14일 이상 미활동",readme_missing:"README 미작성",readme_needs_work:"README 보완",portfolio_missing:"포트폴리오 미등록",grade2_resume_incomplete:"2학년 이력서 미완성",grade2_cover_incomplete:"2학년 자기소개서 미완성",certificate_holders:"자격증 취득"};
 const html='<main style="font:15px/1.6 system-ui;color:#243950"><h1>취업 준비 주간 리포트</h1><table><tr><th>항목</th><th>이번 주</th><th>전주 대비</th></tr>'+Object.entries(cur).map(([k,v])=>'<tr><td>'+esc(names[k]||k)+'</td><td>'+v+'</td><td>'+(previous?.data?.[k]!=null?v-Number(previous.data[k]):"-")+'</td></tr>').join("")+'</table><h2>우선 확인 학생</h2><ul>'+rows.filter(b=>b.evaluation.priorityIssues.length).sort((a,b)=>["관심 필요","준비 중","준비 양호","준비 우수"].indexOf(a.evaluation.status)-["관심 필요","준비 중","준비 양호","준비 우수"].indexOf(b.evaluation.status)).slice(0,20).map(b=>'<li>'+esc(b.member.full_name)+' · '+esc(b.student.grade)+'학년 · '+esc(b.evaluation.priorityIssues.map((x:any)=>x.label).join(" / "))+'</li>').join("")+'</ul><a href="'+origin+'/admin/ready.html">포털 취업지도</a></main>';
 try{const res=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+mailKey,"Content-Type":"application/json","Idempotency-Key":"ready-week-"+monday},body:JSON.stringify({from:Deno.env.get("REPORT_FROM_EMAIL")||"noreply@noreply.k-bigdata.kr",to:["hglee67@kopo.ac.kr"],subject:"[READY] "+monday+" 학생 취업 준비 주간 점검",html}),signal:AbortSignal.timeout(10000)});if(!res.ok)throw Error("메일 발송 실패");const body=await res.json();await write(db.from("ready_report_deliveries").update({status:"sent",sent_at:stamp(),provider_id:body.id}).eq("week_start",monday));return {mail:"sent"}}
 catch(e){await write(db.from("ready_report_deliveries").update({status:"failed",updated_at:stamp()}).eq("week_start",monday));throw e}
}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{headers});
 if(req.method!=="POST")return reply({error:"METHOD_NOT_ALLOWED"},405);
 try{
  const token=req.headers.get("Authorization")?.replace(/^Bearer /i,"")||"";
  if(!token||token.length>12000)return reply({error:"LOGIN_REQUIRED"},401);
  const raw=await req.text();if(raw.length>25000)return reply({error:"REQUEST_TOO_LARGE"},413);const b=JSON.parse(raw),action=b.action;
  if(["scheduled_list","scheduled_check","scheduled_weekly"].includes(action)){
   if(!await githubIdentity(req))return reply({error:"FORBIDDEN"},403);
   const op=await settings();
   if(action==="scheduled_weekly"){if(!op.checking_enabled)return reply({disabled:true});return reply(await weekly(op.weekly_mail_enabled))}
   if(!op.checking_enabled)return reply({disabled:true,ids:[]});
   const members=(await activeMembers()).filter((m:any)=>m.enrollment_status!=="leave"),registered=await read(db.from("ready_profiles").select("user_id"));
   const ids=members.filter((m:any)=>registered.some((r:any)=>r.user_id===m.user_id)).map((m:any)=>m.user_id);
   if(action==="scheduled_list")return reply({ids});
   if(!ids.includes(b.user_id))return reply({error:"NOT_FOUND"},404);
   return reply(await runCheck(b.user_id,false,text(b.github_token,300)));
  }
  const caller=createClient(url,anon,{global:{headers:{Authorization:"Bearer "+token}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data:auth,error}=await caller.auth.getUser(token);if(error||!auth.user)return reply({error:"LOGIN_REQUIRED"},401);
  const a=await read(caller.rpc("ready_access"));if(!a?.read&&!a?.admin)return reply({error:"FORBIDDEN"},403);
  const id=auth.user.id;
  if(action==="admin"||action==="admin_detail"||action==="admin_check"||action==="admin_settings"||action==="admin_snapshot"){
   if(!a.admin)return reply({error:"FORBIDDEN"},403);
   if(action==="admin"){const rows=await roster();return reply({rows,summary:stats(rows),settings:await settings(),logs:await read(db.from("ready_check_runs").select("*").order("started_at",{ascending:false}).limit(50)),snapshots:await read(db.from("ready_weekly_snapshots").select("*").order("snapshot_date",{ascending:false}).limit(15))})}
   if(action==="admin_settings"){const op=await settings();return reply({settings:op})}
   if(action==="admin_snapshot")return reply(await weekly(false));
   const m=(await activeMembers()).find((x:any)=>x.user_id===b.user_id);if(!m)return reply({error:"NOT_FOUND"},404);
   if(action==="admin_detail")return reply(await bundle(m,true));
   if(m.enrollment_status==="leave")return reply({error:"휴학생 점검 제외"},400);return reply(await runCheck(m.user_id,false));
  }
  if(!a.read)return reply({error:"STUDENT_REQUIRED"},403);
  const member=await read(db.from("profiles").select(cols).eq("user_id",id).single());
  if(action==="mine")return reply({...await bundle(member,true),write:a.write,guide:readinessGuide()});
  if(action==="class"){
   const rows=(await roster()).filter(x=>x.member.academic_year===member.academic_year);
   return reply({summary:stats(rows),peers:rows.filter(x=>x.consent&&x.registered).map(x=>({name:x.member.full_name,status:x.evaluation.status,days:x.evaluation.github_fresh?x.evaluation.github.active_days_7d:null,readme:x.evaluation.readme.status,portfolio:x.evaluation.portfolio.status}))});
  }
  if(!a.write)return reply({error:"READ_ONLY"},403);
  const old=await read(db.from("ready_profiles").select("*").eq("user_id",id).maybeSingle());
  if(action==="save_profile")return reply(await saveProfile(id,b.profile||{},old));
  if(!old)return reply({error:"READY_PROFILE_REQUIRED"},400);
  if(action==="repo_add"||action==="repo_update"||action==="repo_remove"){
   const mode=action.slice(5),p=mode==="add"?repoParts(b.repo_url,true):null;
   return reply(await write(db.rpc("ready_repository_mutate",{p_user:id,p_action:mode,p_repo_id:text(b.repo_id,100),p_data:p?{repo_owner:p.owner,repo_name:p.repo,repo_url:"https://github.com/"+p.owner+"/"+p.repo,is_primary:b.is_primary===true}:{is_primary:b.is_primary===true,display_order:Math.max(1,Math.min(99,Number(b.display_order)||1))}})));
  }
  if(action==="plan_add"||action==="plan_remove"){
   if(action==="plan_add"){const name=text(b.name,120);if(name.length<2)return reply({error:"자격증명을 입력하세요."},400);await write(db.from("ready_certificate_plans").insert({user_id:id,certificate_name:name}))}
   else await write(db.from("ready_certificate_plans").delete().eq("id",b.id).eq("user_id",id));
   return reply({saved:true});
  }
  if(action==="manual_check")return reply(await runCheck(id,true));
  return reply({error:"UNKNOWN_ACTION"},400);
 }catch(e){const message=e instanceof Error?e.message:"REQUEST_FAILED";return reply({error:["DATABASE_ERROR","CHECK_SAVE_FAILED"].includes(message)?"처리 중 오류가 발생했습니다.":message.slice(0,180)},400)}
});
