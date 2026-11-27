/* Server-authorized operational health. Never expose database credentials. */
if(window.portalAdminAllowed!==true)throw Error("ADMIN_ACCESS_DENIED");
const db=window.portalSupabaseClient;
const element=id=>document.getElementById(id);
const root=element("admin-monitor-metrics");
const state=element("admin-monitor-status");
const refreshButton=element("admin-monitor-refresh");
let updating=false,lastUpdated=0;
const fields=[
 ["DB 연결 사용","dbConnections","dbMaxConnections"],
 ["실행 중 쿼리","activeQueries"],
 ["학습 세션 진행 중","studyActive"],
 ["교수자 검토 대기","studyNeedsReview"],
 ["최근 24시간 풀이 저장","attempts24h"],
 ["최근 24시간 학생 학습 오류","studentStudyErrors24h"],
 ["학과 요청 메일 실패","helpMailFailed24h"],
 ["자율학습 메일 실패","studyMailFailed24h"],
 ["주간 보고서 메일 실패","weeklyMailFailed24h"],
 ["학습 통계 배치 실패","aggregationFailed24h"],
 ["누적 DB 데드락","deadlocksTotal"]
];
function make(tag,value,className){
 const node=document.createElement(tag);
 if(className)node.className=className;
 node.textContent=String(value);
 return node;
}
function render(data){
 const fragment=document.createDocumentFragment();
 for(const [name,key,denominator] of fields){
  const value=Number(data[key]||0);
  const max=denominator?Number(data[denominator]||0):null;
  const tile=make("article","","admin-monitor-tile");
  tile.append(make("small",name),make("strong",max?value+" / "+max:value.toLocaleString("ko-KR")));
  if((max&&max>0&&value/max>=.8)||(!max&&name.includes("실패")&&value>0))
   tile.classList.add("admin-monitor-warning");
  fragment.append(tile);
 }
 root.replaceChildren(fragment);
 const used=Number(data.dbConnections||0),capacity=Number(data.dbMaxConnections||1);
 const failCount=["helpMailFailed24h","studyMailFailed24h","weeklyMailFailed24h","aggregationFailed24h"]
   .reduce((total,key)=>total+Number(data[key]||0),0);
 const time=new Date(data.observedAt).toLocaleString("ko-KR",{timeZone:"Asia/Seoul"});
 state.textContent="DB 확인 "+time+" · "+(used>=capacity*.8?"DB 연결 여유가 부족합니다. 연결 풀을 점검하세요.":failCount?"발송·배치 오류 "+failCount+"건 확인 필요.":"운영 DB 지표 정상 범위.")+
  " · HTTP 상태코드 429/502/503은 Supabase API 로그에서 별도 확인";
 lastUpdated=Date.now();
}
async function refresh(){
 if(updating)return;
 updating=true;refreshButton.disabled=true;
 state.textContent="운영 서버 지표를 확인 중입니다.";
 try{
  const {data,error}=await db.rpc("portal_admin_health_summary");
  if(error||!data)throw error||Error("HEALTH_DATA_UNAVAILABLE");
  render(data);
 }catch(error){
  console.warn("Portal health query failed",error?.code||error?.message||"NETWORK");
  state.textContent="운영 지표를 조회하지 못했습니다. 관리자 권한과 연결을 확인하세요.";
 }finally{updating=false;refreshButton.disabled=false;}
}
refreshButton.addEventListener("click",()=>void refresh());
document.addEventListener("visibilitychange",()=>{
 if(!document.hidden&&Date.now()-lastUpdated>300000)void refresh();
});
setInterval(()=>{if(!document.hidden&&Date.now()-lastUpdated>300000)void refresh();},300000);
void refresh();

// Current grade is reflected in every student KPI. System health below stays global.
const ui=window.portalAdminUI;
const overview=document.createElement("section");overview.className="admin-overview";overview.setAttribute("aria-labelledby","admin-overview-title");
overview.innerHTML='<div class="admin-section-head"><div><h2 id="admin-overview-title">학과 운영 현황</h2><p id="admin-overview-caption" role="status">학년별 현황 조회 중…</p></div></div><div id="admin-overview-kpis"></div><div class="admin-chart-grid"><div id="admin-overview-grade"></div><div id="admin-overview-attention"></div></div>';
document.getElementById("admin-secure").querySelector(".admin-section").before(overview);
let overviewSequence=0;
async function overviewLoad(value=ui.getGrade()){
 const seq=++overviewSequence,caption=element("admin-overview-caption");
 caption.textContent=ui.gradeLabel(value)+" · 승인된 재학생 기준 · 조회 중…";
 for(const id of ["admin-overview-kpis","admin-overview-grade","admin-overview-attention"])element(id).replaceChildren();
 const args={p_grade:value?Number(value):null,p_status:"enrolled",p_approval:"approved",p_type:"student",p_page:1,p_size:1};
 async function count(extra={}){
  try{const {data,error}=await db.rpc("admin_user_list",{...args,...extra});if(error||!data||!Number.isFinite(Number(data.total)))return null;return data;}
  catch{return null;}
 }
 const [cohort,missingPlan,inactive,missingCert,pending,academic]=await Promise.all([
  count(),count({p_attention:"no_plan"}),count({p_attention:"inactive"}),count({p_attention:"no_cert"}),
  count({p_status:"all",p_approval:"pending",p_type:value?"student":"all"}),
  count({p_status:"all",p_approval:"all",p_type:value?"student":"all",p_attention:"academic"})
 ]);
 if(seq!==overviewSequence)return;
 const total=cohort?.total??null,subtract=x=>total===null||x===null?null:Math.max(0,total-Number(x.total));
 const link=(status="enrolled",attention="all",approval="approved")=>"accounts.html?"+new URLSearchParams({view:"students",grade:value,status,attention,approval}).toString();
 ui.renderKPIs(element("admin-overview-kpis"),[
  ["승인된 재학생",total,"명",link()],
  ["이번 주 계획 등록",subtract(missingPlan),"명","learning.html"],
  ["최근 7일 학습 기록",subtract(inactive),"명","learning.html"],
  ["확인된 자격증 취득",subtract(missingCert),"명","certifications.html"]
 ]);
 const c=cohort?.counts;
 ui.renderDonut(element("admin-overview-grade"),"1·2학년 재학 계정 비교", [["1학년",c?.grade1],["2학년",c?.grade2]],{caption:"전체 학년 비교 · 승인 상태와 무관한 재학 계정, 학년 미설정 제외"});
 ui.renderBars(element("admin-overview-attention"),ui.gradeLabel(value)+" · 확인 필요",[
  ["가입 승인 대기",pending?.total,"warning",link("all","all","pending")],["학적 변경 요청 대상",academic?.total,"warning",link("all","academic","all")],
  ["이번 주 계획 미등록",missingPlan?.total,null,link("enrolled","no_plan")],["최근 7일 학습 기록 없음",inactive?.total,null,link("enrolled","inactive")],["확인된 최종합격 없음",missingCert?.total,null,link("enrolled","no_cert")]
 ],{unit:"명",caption:"학습·계획·자격증은 승인된 재학생 기준. 각 항목은 중복될 수 있습니다."});
 caption.textContent=ui.gradeLabel(value)+" · 승인된 재학생 기준"+([cohort,missingPlan,inactive,missingCert,pending,academic].some(x=>x===null)?" · 일부 조회 실패":"");
}
ui.onGrade(overviewLoad);void overviewLoad();
