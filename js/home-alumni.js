// Render published alumni network jobs and news; keep errors and absent records explicit.
const root=document.getElementById("alumni-dashboard");
const jobsRoot=document.getElementById("alumni-home-jobs"),newsRoot=document.getElementById("alumni-home-news");
const endpoint="https://zjsindkakjfzmjgrkaou.supabase.co/functions/v1/alumni-network-api";
const publicKey="sb_publishable_g8oFA9J2ZFiBc-86wa2Pew_7DzoCZab";
let requested=false;
const el=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e;};
function render(destination,items,kind){
 if(!destination)return;
 const entries=Array.isArray(items)?items.slice(0,kind==="jobs"?3:4):[];
 if(!entries.length){destination.replaceChildren(el("p","alumni-home-empty",kind==="jobs"?"현재 공개된 동문 채용정보가 없습니다.":"아직 공개된 동문소식이 없습니다."));return;}
 const list=el("ul","alumni-home-list");
 for(const item of entries){
  const title=String(kind==="jobs"?(item.job_title||item.company||"채용정보"):(item.title||"동문소식")).trim();
  if(!title)continue;
  const id=kind==="jobs"?item.job_id:item.news_id;
  const safe=typeof id==="string"&&/^[A-Za-z0-9_-]{1,90}$/.test(id);
  const href=kind==="jobs"?(safe?"alumni/job-detail.html?id="+encodeURIComponent(id):"alumni/jobs.html"):
   (safe?"alumni/news-detail.html?id="+encodeURIComponent(id):"alumni/news.html");
  const a=el("a");a.href=href;a.append(el("strong","",title.slice(0,140)));
  if(kind==="jobs"){const info=[item.company,item.deadline].filter(Boolean).map(String).join(" · ");if(info)a.append(el("small","",info.slice(0,120)));}
  else {const date=String(item.event_date||item.created_at||"").slice(0,10);if(/^\d{4}-\d{2}-\d{2}$/.test(date))a.append(el("small","",date.replaceAll("-",".")));}
  const li=el("li");li.append(a);list.append(li);
 }
 destination.replaceChildren(list.childElementCount?list:el("p","alumni-home-empty","표시할 소식이 없습니다."));
}
function showError(){for(const dest of [jobsRoot,newsRoot])if(dest)dest.replaceChildren(el("p","alumni-home-empty","정보를 불러오지 못했습니다. 전체 보기에서 확인해 주세요."));}
async function load(){
 if(!root||requested||!globalThis.portalLearning?.read||document.body.dataset.homePersona!=="alumni")return;
 requested=true;root.hidden=false;
 try{
  const client=globalThis.portalSupabaseClient;if(!client)throw Error("로그인 정보가 없습니다.");
  const {data,error}=await client.auth.getSession();
  if(error||!data?.session?.access_token)throw Error("로그인 세션을 확인하지 못했습니다.");
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  let response;
  try{response=await fetch(endpoint,{method:"POST",headers:{"Authorization":"Bearer "+data.session.access_token,"apikey":publicKey,"Content-Type":"application/json"},body:JSON.stringify({action:"home",data:{}}),signal:controller.signal,credentials:"omit"});}
  finally{clearTimeout(timer);}
  const result=await response.json();
  if(!response.ok||result.success!==true)throw Error("동문소식을 조회하지 못했습니다.");
  if(document.body.dataset.homePersona!=="alumni")return;
  render(jobsRoot,result.data?.jobs,"jobs");render(newsRoot,result.data?.news,"news");
 }catch(error){console.warn("Alumni home preview unavailable",error?.message);showError();}
}
window.addEventListener("kbigdata:home-persona",()=>void load());
window.addEventListener("portal-learning-ready",()=>void load());
void load();
