// Device-only shortcuts: no identity, login or network transmission.
import {services} from "./services.js?v=20261026-card-label-1";
const KEY = "kbigdata-portal-ui-v1";
const validIds = new Set(services.map(service => service.id));
const blank = () => ({favorites:[], recent:[]});

function readState(){
  try{
    const data = JSON.parse(localStorage.getItem(KEY) || "null");
    if(!data || typeof data !== "object") return blank();
    return {
      favorites: Array.isArray(data.favorites) ? [...new Set(data.favorites.filter(id => validIds.has(id)))].slice(0,12) : [],
      recent: Array.isArray(data.recent) ? data.recent.filter(id => validIds.has(id)).slice(0,8) : []
    };
  }catch{return blank();}
}
function writeState(state){
  try{localStorage.setItem(KEY, JSON.stringify(state));return true;}
  catch{return false;}
}
export function getFavorites(){return readState().favorites;}
export function getRecent(){return readState().recent;}
export function toggleFavorite(id){
  if(!validIds.has(id))return false;
  const state=readState(), pos=state.favorites.indexOf(id);
  if(pos>=0)state.favorites.splice(pos,1);
  else state.favorites.unshift(id);
  writeState(state);
  return state.favorites.includes(id);
}
function matchService(raw){
  try{
    const url=new URL(raw,location.href);
    if(!["https:","http:"].includes(url.protocol))return null;
    return services.find(service=>{
      const destination=new URL(service.url,location.origin);
      if(url.origin!==destination.origin)return false;
      return destination.origin===location.origin
        ? url.pathname===destination.pathname
        : url.pathname===destination.pathname || url.pathname.startsWith(destination.pathname.endsWith("/")?destination.pathname:destination.pathname+"/");
    }) || null;
  }catch{return null;}
}
export function recordService(id){
  if(!validIds.has(id))return;
  const state=readState();
  state.recent=[id,...state.recent.filter(item=>item!==id)].slice(0,8);
  writeState(state);
}
export function initRecentTracking(){
  const current=matchService(location.href);
  if(current)recordService(current.id);
  document.addEventListener("click",event=>{
    const target=event.target;
    if(!(target instanceof Element))return;
    const anchor=target.closest("a[href]");
    if(!anchor)return;
    const service=matchService(anchor.href);
    if(service){
      recordService(service.id);
      // Only approved service IDs are measured; no search terms, personal identifiers or task contents.
      if(location.hostname==="portal.k-bigdata.kr"&&typeof window.gtag==="function"){
        window.gtag("event","portal_service_open",{
          service_key:service.id,
          page_context:document.documentElement.dataset.portalPage||"unknown"
        });
      }
    }
  });
}
