import { EVENT_IMAGES, renderEventAnnouncement } from "../_shared/portal-mail.mjs";
import { quotaPreview, withMailQuota } from "../_shared/mail-quota.mjs";
const clean=(x:unknown,n=2000)=>String(x??"").trim().slice(0,n);
const groups=(x:unknown)=>{
 if(!Array.isArray(x)||!x.length||x.some(v=>!["alumni","grade1","grade2"].includes(String(v))))throw Error("발송 대상을 선택해 주세요.");
 return [...new Set(x.map(String))].sort();
};
const uuid=(x:unknown)=>{const s=clean(x,40);if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(s))throw Error("행사 정보가 올바르지 않습니다.");return s;};
const ok=(data:unknown)=>({success:true,data});
const date=(x:unknown,required=false)=>{const s=clean(x,80);if(!s&&!required)return null;if(!s||!Number.isFinite(Date.parse(s)))throw Error("일시를 정확하게 입력해 주세요.");return new Date(s).toISOString();};
const key=()=>Deno.env.get("RESEND_USAGE_API_KEY")||Deno.env.get("RESEND_API_KEY")||"";
const requireAdmin=(a:any)=>{if(a.isAdmin!==true)throw Error("관리자 권한이 없습니다.");};
async function query(p:any){const {data,error}=await p;if(error)throw Error(error.message||"행사 정보를 처리하지 못했습니다.");return data;}
const active=(e:any)=>e.status==="published"&&Date.parse(e.starts_at)>Date.now();
const hash=async(v:unknown)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(JSON.stringify(v)))),x=>x.toString(16).padStart(2,"0")).join("");
async function signature(user:string){
 const privateKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
 const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(privateKey),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 return Array.from(new Uint8Array(await crypto.subtle.sign("HMAC",k,new TextEncoder().encode("event-unsubscribe-v1:"+user))),b=>b.toString(16).padStart(2,"0")).join("");
}
export async function unsubscribeEvent(db:any,token:unknown){
 const [user,sig,...rest]=clean(token,150).split(".");
 if(rest.length||!sig||!/^[0-9a-f]{64}$/.test(sig))throw Error("잘못된 수신거부 링크입니다.");
 uuid(user);
 const expected=await signature(user);
 let diff=0;for(let i=0;i<64;i++)diff|=expected.charCodeAt(i)^sig.charCodeAt(i);
 if(diff)throw Error("잘못된 수신거부 링크입니다.");
 await query(db.from("portal_event_preferences").upsert({user_id:user,enabled:false,updated_at:new Date().toISOString()}));
 return ok({enabled:false});
}
export async function handleEvent(action:string,b:any,a:any,db:any,notice:any){
 const id=()=>uuid(b.id);
 const event=async()=>{const e=await query(db.from("portal_events").select("*").eq("id",id()).maybeSingle());if(!e)throw Error("행사를 찾을 수 없습니다.");return e;};
 if(action==="eventPreference"){
  if(b.enabled!==undefined){if(typeof b.enabled!=="boolean")throw Error("올바른 수신 설정이 아닙니다.");await query(db.from("portal_event_preferences").upsert({user_id:a.id,enabled:b.enabled,updated_at:new Date().toISOString()}));}
  const pref=await query(db.from("portal_event_preferences").select("enabled").eq("user_id",a.id).maybeSingle());
  return ok({enabled:pref?.enabled===true});
 }
 if(action==="eventList"){
  const profile=await query(db.from("profiles").select("signup_type,enrollment_status,academic_year,alumni_source_id").eq("user_id",a.id).single());
  const group=profile.signup_type==="student"&&profile.enrollment_status==="enrolled"?"grade"+profile.academic_year:(profile.enrollment_status==="graduated"||(profile.enrollment_status==="early_employment"&&profile.alumni_source_id))?"alumni":"";
  if(!group)return ok([]);
  const events=await query(db.from("portal_events").select("id,kind,title,description,venue,starts_at,deadline,capacity,requires_registration,image_url,status").eq("status","published").contains("groups",[group]).gte("starts_at",new Date().toISOString()).order("starts_at"));
  const mine=await query(db.from("portal_event_registrations").select("event_id,status").eq("user_id",a.id));
  return ok(events.map((e:any)=>({...e,registration:mine.find((r:any)=>r.event_id===e.id)?.status||null})));
 }
 if(action==="eventRegister"){
  await query(db.rpc("portal_event_register",{p_event:id(),p_user:a.id,p_cancel:b.cancel===true}));return ok(true);
 }
 requireAdmin(a);
 if(action==="adminEventQuota")return ok(await quotaPreview(key(),0));
 if(action==="adminEventList"){
  const events=await query(db.from("portal_events").select("*").order("starts_at",{ascending:false}).limit(300));
  const regs=await query(db.from("portal_event_registrations").select("event_id,status").limit(10000));
  const logs=await query(db.from("alumni_network_mail_outbox").select("record_id,status,event_type").eq("record_kind","portal_events").limit(10000));
  return ok(events.map((e:any)=>({...e,registered:regs.filter((r:any)=>r.event_id===e.id&&["registered","attended","absent"].includes(r.status)).length,
   attended:regs.filter((r:any)=>r.event_id===e.id&&r.status==="attended").length,
   sent:logs.filter((r:any)=>r.record_id===e.id&&r.event_type==="event_invitation"&&r.status==="sent").length,
   failed:logs.filter((r:any)=>r.record_id===e.id&&r.status==="failed").length})));
 }
 if(action==="adminEventSave"){
  const kind=clean(b.kind,20),title=clean(b.title,150),description=clean(b.description,4000),venue=clean(b.venue,200);
  if(!["축제","특강","간담회","홈커밍데이","기타"].includes(kind)||!title||!description||!venue)throw Error("필수 행사 정보를 입력해 주세요.");
  const starts_at=date(b.starts_at,true),requires_registration=b.requires_registration===true,deadline=requires_registration?date(b.deadline):null;
  const capacity=requires_registration&&clean(b.capacity)?Number(b.capacity):null;
  if(capacity!==null&&(!Number.isInteger(capacity)||capacity<1||capacity>10000))throw Error("모집 인원이 올바르지 않습니다.");
  if(deadline&&Date.parse(deadline)>Date.parse(starts_at!))throw Error("신청 마감은 행사 시작 이전이어야 합니다.");
  if(Date.parse(starts_at!)<=Date.now())throw Error("미래 행사 일정을 입력해 주세요.");
  const imageKey=clean(b.image,30);const image_url=Object.hasOwn(EVENT_IMAGES,imageKey)?EVENT_IMAGES[imageKey]:"";
  const payload={kind,title,description,venue,starts_at,deadline,capacity,requires_registration,image_url,groups:groups(b.groups),created_by:a.id};
  return ok(await query(db.from("portal_events").insert(payload).select("id").single()));
 }
 if(action==="adminEventArchive"){
  await query(db.from("portal_events").update({status:"archived",updated_at:new Date().toISOString()}).eq("id",id()));return ok(true);
 }
 if(action==="adminEventRegistrations"){
  const rows=await query(db.from("portal_event_registrations").select("user_id,status,updated_at,member:profiles(full_name,graduation_year,academic_year)").eq("event_id",id()).order("updated_at"));
  return ok(rows);
 }
 if(action==="adminEventAttendance"){
  const e=await event();if(Date.parse(e.starts_at)>Date.now())throw Error("행사 시작 이후 참석 여부를 기록할 수 있습니다.");
  if(!["attended","absent"].includes(b.status))throw Error("참석 상태를 확인해 주세요.");
  await query(db.from("portal_event_registrations").update({status:b.status,updated_at:new Date().toISOString()}).eq("event_id",e.id).eq("user_id",uuid(b.user_id)).in("status",["registered","attended","absent"]));
  return ok(true);
 }
 if(action==="adminEventPreview"||action==="adminEventSend"){
  const e=await event();if(!active(e))throw Error("진행 예정인 공개 행사만 발송할 수 있습니다.");
  const selected=groups(b.groups);if(selected.some(g=>!e.groups.includes(g)))throw Error("행사 대상에 포함되지 않은 그룹입니다.");
  const reminder=b.reminder===true;
  const load=()=>query(db.rpc("portal_event_recipients",{p_record:e.id,p_groups:selected,p_reminder:reminder}));
  const recipients=await load();
  const token=await hash([e.id,e.updated_at,selected,reminder,recipients.map((r:any)=>[r.email,r.group])]);
  const pending=recipients.filter((r:any)=>!r.sent&&!r.sending);
  const announcement=renderEventAnnouncement(e,reminder);
  if(action==="adminEventPreview")return ok({token,available:pending.length,total:recipients.length,quota:await quotaPreview(key(),pending.length),...announcement});
  if(b.confirmed!==true||b.token!==token)throw Error("발송 대상 또는 내용이 변경되었습니다. 다시 확인해 주세요.");
  const cursor=Number(b.cursor??0);if(!Number.isInteger(cursor)||cursor<0||cursor>recipients.length)throw Error("발송 위치 오류");
  const end=Math.min(cursor+3,recipients.length);
  return await withMailQuota(db,key(),pending.length,async()=>{
   let sent=0,failed=0;
   for(const r of recipients.slice(cursor,end)){
    if(r.sent||r.sending)continue;
    const latest=await event();if(!active(latest)||latest.updated_at!==e.updated_at)throw Error("행사 상태가 변경되어 발송을 중단했습니다.");
    if(!(await load()).some((v:any)=>v.email===r.email&&!v.sent&&!v.sending))continue;
    const href="https://portal.k-bigdata.kr/alumni/event-unsubscribe.html#"+r.user_id+"."+await signature(r.user_id);
    const mail=renderEventAnnouncement(e,reminder,href);
    if(await notice(reminder?"event_reminder":"event_invitation","portal_events",e.id,r.email,mail.subject,mail.html))sent++;else failed++;
   }
   return ok({sent,failed,next_cursor:end,done:end>=recipients.length});
  });
 }
 throw Error("지원하지 않는 행사 기능입니다.");
}
