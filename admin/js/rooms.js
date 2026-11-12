/* Admin-only project room reservations. The database enforces admin RLS. */
const db=window.portalSupabaseClient;
if(window.portalAdminAllowed!==true||!db)throw Error("ADMIN_SESSION_REQUIRED");
const list=document.getElementById("admin-room-list"),count=document.getElementById("admin-room-count"),feedback=document.getElementById("admin-room-feedback");
const node=(tag,value,cls)=>{const e=document.createElement(tag);if(value!==undefined&&value!==null)e.textContent=String(value);if(cls)e.className=cls;return e;};
const fmt=raw=>new Intl.DateTimeFormat("ko-KR",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit",hour12:false}).format(new Date(raw));
async function load(){
 feedback.textContent="전체 예약 확인 중...";
 const [users,rows]=await Promise.all([db.rpc("admin_list_students"),
  db.from("room_reservations").select("id,owner_id,source,legacy_student_name,legacy_student_no,room_code,starts_at,ends_at,purpose,memo,status,created_at").order("created_at",{ascending:false}).limit(1000)]);
 if(users.error||rows.error){feedback.textContent="관리자 예약 조회 권한을 확인하지 못했습니다.";return;}
 const names=new Map((users.data||[]).map(x=>[x.user_id,[x.full_name,x.student_no].filter(Boolean).join(" · ")]));
 const items=rows.data||[];
 count.textContent="총 "+items.length+"건 · 예약 중 "+items.filter(x=>x.status==="ACTIVE").length+"건";
 list.replaceChildren();
 for(const r of items){
  const card=node("article",null,"room-my-card"),head=node("div",null,"room-row");
  head.append(node("strong",r.room_code+"호 · "+fmt(r.starts_at)+" ~ "+fmt(r.ends_at)));
  head.append(node("span",r.status==="ACTIVE"?"예약 중":"취소됨","room-pill"+(r.status==="ACTIVE"?"":" is-cancelled")));
  card.append(head,node("p",(r.purpose||"")+(r.memo?" · "+r.memo:""),"room-muted"));
  const who=names.get(r.owner_id)||[r.legacy_student_name,r.legacy_student_no].filter(Boolean).join(" / ")||"미연결 계정";
  card.append(node("p","예약자: "+who,"room-muted"));
  if(r.status==="ACTIVE"){
   const cancel=node("button","예약 취소","room-secondary");cancel.type="button";
   cancel.onclick=async()=>{
    if(!confirm(r.room_code+"호 "+fmt(r.starts_at)+" 예약을 취소하시겠습니까?"))return;
    cancel.disabled=true;
    const {data,error}=await db.from("room_reservations").update({status:"CANCELLED"}).eq("id",r.id).eq("status","ACTIVE").select("id");
    if(error||!data?.length){feedback.textContent="관리자 예약 취소에 실패했습니다.";cancel.disabled=false;return;}
    feedback.textContent="예약을 취소했습니다.";await load();
   };
   card.append(cancel);
  }
  list.append(card);
 }
 if(!items.length)list.append(node("p","예약 내역이 없습니다.","room-muted"));
 feedback.textContent="";
}
document.getElementById("admin-room-refresh").addEventListener("click",()=>void load());
await load();
