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
