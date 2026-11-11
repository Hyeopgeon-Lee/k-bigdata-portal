import {services} from "./services.js?v=20261026-card-label-1";
const LEGACY_KEY="kbigdata-portal-ui-v1";
const validIds=new Set(services.map(service=>service.id));
const state={favorites:[],recent:[]};
let userId=null,loaded=false,loadPromise=null,writeQueue=Promise.resolve();
const authorized=()=>globalThis.portalLearning?.read===true&&Date.now()<globalThis.portalLearning.expires;
const canWrite=()=>authorized()&&globalThis.portalLearning?.write===true;
const client=()=>globalThis.portalSupabaseClient;
const notify=()=>window.dispatchEvent(new Event("portal-personal-updated"));
function validList(items,limit){return [...new Set((items||[]).filter(id=>validIds.has(id)))].slice(0,limit);}
async function load(){
 if(!authorized()||!client())return;
 if(loadPromise)return loadPromise;
 loadPromise=(async()=>{
  const {data:{user},error:authError}=await client().auth.getUser();
  if(authError||!user)throw Error("LOGIN_REQUIRED");
  userId=user.id;
  const [favs,recent]=await Promise.all([
   client().from("user_favorites").select("service_id").eq("user_id",userId).order("created_at",{ascending:false}).limit(12),
   client().from("user_recent_services").select("service_id").eq("user_id",userId).order("last_opened_at",{ascending:false}).limit(8)
  ]);
  if(favs.error||recent.error)throw favs.error||recent.error;
  state.favorites=validList(favs.data?.map(x=>x.service_id),12);
  state.recent=validList(recent.data?.map(x=>x.service_id),8);
  loaded=true;notify();
 })().catch(error=>{
  console.error("Personal services sync failed",error);
  window.dispatchEvent(new Event("portal-personal-error"));
 }).finally(()=>{loadPromise=null;});
 return loadPromise;
}
export const getFavorites=()=>state.favorites.slice();
export const getRecent=()=>state.recent.slice();
export const isPersonalLoaded=()=>loaded;
export function toggleFavorite(id){
 if(!validIds.has(id)||!loaded||!canWrite())return state.favorites.includes(id);
 const old=state.favorites.slice(),already=old.includes(id);
 if(!already&&old.length>=12)return false;
 state.favorites=already?old.filter(item=>item!==id):[id,...old];notify();
 writeQueue=writeQueue.then(async()=>{
  const response=already
   ? await client().from("user_favorites").delete().eq("user_id",userId).eq("service_id",id)
   : await client().from("user_favorites").upsert({user_id:userId,service_id:id,created_at:new Date().toISOString()},{onConflict:"user_id,service_id"});
  if(response.error)throw response.error;
 }).catch(async error=>{console.error("Favorite update failed",error);await load();window.dispatchEvent(new Event("portal-personal-error"));});
 return !already;
}
function matchService(raw){
 try{
  const url=new URL(raw,location.href);
  if(!["https:","http:"].includes(url.protocol))return null;
  return services.find(service=>{
   const dest=new URL(service.url,location.origin);
   return url.origin===dest.origin&&(url.pathname===dest.pathname||(dest.origin!==location.origin&&url.pathname.startsWith(dest.pathname.endsWith("/")?dest.pathname:dest.pathname+"/")));
  })||null;
 }catch{return null;}
}
const recorded=new Map();
export function recordService(id){
 if(!validIds.has(id)||!loaded||!canWrite())return;
 const previous=recorded.get(id)||0;
 if(Date.now()-previous<60000)return;
 recorded.set(id,Date.now());
 state.recent=[id,...state.recent.filter(v=>v!==id)].slice(0,8);notify();
 writeQueue=writeQueue.then(async()=>{
  const {error}=await client().from("user_recent_services").upsert({user_id:userId,service_id:id,last_opened_at:new Date().toISOString()},{onConflict:"user_id,service_id"});
  if(error)throw error;
 }).catch(error=>console.error("Recent service save failed",error));
}
export async function importLegacyShortcuts(){
 if(!canWrite())throw Error("읽기 전용 계정은 가져올 수 없습니다.");
 await load();
 let value;
 try{value=JSON.parse(globalThis.localStorage.getItem(LEGACY_KEY)||"null");}catch{}
 const favorites=validList(value?.favorites,12),recent=validList(value?.recent,8);
 if(!favorites.length&&!recent.length)return 0;
 const newFaves=favorites.filter(id=>!state.favorites.includes(id)).slice(0,12-state.favorites.length);
 const newRecent=recent.filter(id=>!state.recent.includes(id));
 const results=await Promise.all([
  newFaves.length?client().from("user_favorites").upsert(newFaves.map(service_id=>({user_id:userId,service_id})),{onConflict:"user_id,service_id"}):Promise.resolve({error:null}),
  newRecent.length?client().from("user_recent_services").upsert(newRecent.map(service_id=>({user_id:userId,service_id})),{onConflict:"user_id,service_id"}):Promise.resolve({error:null})
 ]);
 const issue=results.find(x=>x.error)?.error;
 if(issue)throw issue;
 await load();
 return newFaves.length+newRecent.length;
}
export function initRecentTracking(){
 async function onReady(){
  await load();
  const current=matchService(location.href);
  if(current)recordService(current.id);
 }
 window.addEventListener("portal-learning-ready",()=>void onReady());
 if(authorized())void onReady();
 document.addEventListener("click",event=>{
  const target=event.target;
  if(!(target instanceof Element))return;
  const anchor=target.closest("a[href]");
  if(!anchor)return;
  const service=matchService(anchor.href);
  if(service&&loaded){
   recordService(service.id);
   if(location.hostname==="portal.k-bigdata.kr"&&typeof window.gtag==="function")
    window.gtag("event","portal_service_open",{service_key:service.id,page_context:document.documentElement.dataset.portalPage||"unknown"});
  }
 });
}
