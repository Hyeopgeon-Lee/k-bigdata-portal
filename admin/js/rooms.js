/* Admin-only project room reservations. The database enforces admin RLS. */
const db=window.portalSupabaseClient;
if(window.portalAdminAllowed!==true||!db)throw Error("ADMIN_SESSION_REQUIRED");
const list=document.getElementById("admin-room-list"),count=document.getElementById("admin-room-count"),feedback=document.getElementById("admin-room-feedback");
const node=(tag,value,cls)=>{const e=document.createElement(tag);if(value!==undefined&&value!==null)e.textContent=String(value);if(cls)e.className=cls;return e;};
const fmt=raw=>new Intl.DateTimeFormat("ko-KR",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(new Date(raw));
const ui=window.portalAdminUI;
const PAGE_SIZE=50;let page=0,requestId=0,studentsCache=null;
async function load(){
 const current=++requestId;
 feedback.textContent="선택 학년 예약 확인 중…";
 list.replaceChildren();
 count.textContent="조회 중…";
 document.getElementById("admin-room-chart")?.replaceChildren();
 document.getElementById("admin-room-week-chart")?.replaceChildren();
 const grade=ui.getGrade();
 const users=await (studentsCache||db.rpc("admin_list_students"));
 if(current!==requestId)return;
 if(users.error){feedback.textContent="학생 정보를 불러오지 못했습니다.";return;}
 studentsCache=users;
 const profiles=users.data||[],ids=profiles.filter(x=>ui.matchesGrade(x,grade)).map(x=>x.user_id);
 const scope=q=>grade?q.in("owner_id",ids):q;
 const names=new Map(profiles.map(x=>[x.user_id,[x.full_name,x.student_no,x.academic_year?x.academic_year+"학년":""].filter(Boolean).join(" · ")]));
 const chart=ui.chartMount(count,"admin-room-chart");chart.replaceChildren();
 const empty={data:[],count:0,error:null};
 const [rows,active,cancelled]=grade&&!ids.length?[empty,empty,empty]:await Promise.all([
  scope(db.from("room_reservations").select("id,owner_id,source,legacy_student_name,legacy_student_no,room_code,starts_at,ends_at,purpose,memo,status,created_at",{count:"exact"})).order("created_at",{ascending:false}).order("id").range(page*PAGE_SIZE,(page+1)*PAGE_SIZE-1),
  scope(db.from("room_reservations").select("id",{count:"exact",head:true})).eq("status","ACTIVE"),
  scope(db.from("room_reservations").select("id",{count:"exact",head:true})).eq("status","CANCELLED")
 ]);
 if(current!==requestId)return;
 if(rows.error||active.error||cancelled.error){feedback.textContent="관리자 예약 조회 권한을 확인하지 못했습니다.";return;}
 const items=rows.data||[];
 count.textContent=ui.gradeLabel(grade)+" · 총 "+rows.count+"건 · 예약 중 "+active.count+"건"+(grade?" · 계정 연결 예약 기준":"");
 ui.renderDonut(chart,"예약 상태",[["예약 중",active.count],["취소됨",cancelled.count]],{unit:"건",caption:ui.gradeLabel(grade)+" · 전체 조회 결과"});
 // Count active reservation starts for each of the next seven calendar days in Korea.
 const today=new Date().toLocaleDateString("sv-SE",{timeZone:"Asia/Seoul"});
 const dayStart=new Date(today+"T00:00:00+09:00"),days=Array.from({length:8},(_,i)=>new Date(dayStart.getTime()+i*86400000));
 const weekChart=ui.chartMount(chart,"admin-room-week-chart");weekChart.replaceChildren();
 async function readWeek(){
  if(grade&&!ids.length)return [];
  const result=[];
  for(let offset=0;;offset+=500){
   const {data,error}=await scope(db.from("room_reservations").select("id,starts_at")).eq("status","ACTIVE")
    .gte("starts_at",dayStart.toISOString()).lt("starts_at",days[7].toISOString()).order("starts_at").order("id").range(offset,offset+499);
   if(error)throw error;result.push(...(data||[]));if((data||[]).length<500)return result;
  }
 }
 void readWeek().then(res=>{
  if(current!==requestId)return;
  const dayCounts=days.slice(0,7).map((d,i)=>[new Intl.DateTimeFormat("ko-KR",{timeZone:"Asia/Seoul",month:"numeric",day:"numeric",weekday:"short"}).format(d),res.filter(x=>Date.parse(x.starts_at)>=d.getTime()&&Date.parse(x.starts_at)<days[i+1].getTime()).length]);
  ui.renderBars(weekChart,"향후 7일 예약",dayCounts,{unit:"건",caption:"시작일 기준 · 취소된 예약 제외"});
 }).catch(()=>{if(current===requestId)weekChart.textContent="주간 예약 현황을 조회하지 못했습니다."});
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
 const pages=Math.max(1,Math.ceil(rows.count/PAGE_SIZE));if(page>=pages){page=pages-1;return load();}
 const nav=node("div",null,"room-row"),prev=node("button","이전","room-secondary"),next=node("button","다음","room-secondary");prev.type=next.type="button";prev.disabled=page===0;next.disabled=page+1>=pages;prev.onclick=()=>{page--;void load();};next.onclick=()=>{page++;void load();};nav.append(prev,node("span",(page+1)+" / "+pages),next);list.append(nav);
 feedback.textContent="";
}
ui.onGrade(()=>{page=0;void load();});
document.getElementById("admin-room-refresh").addEventListener("click",()=>{studentsCache=null;page=0;void load();});
await load();
