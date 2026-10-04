// Replace this adapter to integrate an approved backend later. Nothing is transmitted.
const key="kbigdata-practical-v1", sessionKey="kbigdata-practical-attempt-v1", preferencesKey="kbigdata-practical-preferences-v1";
let memory=[],sessions={},preferences={};
export let storageAvailable=true;
function read(kind,key,fallback){try{return JSON.parse(globalThis[kind].getItem(key))||fallback;}catch{storageAvailable=false;return fallback;}}
export function getAttempts(){const data=read("localStorage",key,memory);return Array.isArray(data)?data.filter(a=>a&&typeof a.questionId==="string"&&Number.isFinite(a.submittedAt)&&Number.isFinite(a.elapsedSeconds)):[];}
function writeAttempts(items){memory=items;try{localStorage.setItem(key,JSON.stringify(items));}catch{storageAvailable=false;}}
export function saveAttempt(item){const items=getAttempts(),index=items.findIndex(a=>a.id===item.id);if(index<0)items.push(item);else items[index]=item;writeAttempts(items);}
export function getSession(id){const data=read("localStorage",sessionKey,null)||read("sessionStorage",sessionKey,sessions);sessions=data&&typeof data==="object"&&!Array.isArray(data)?data:{};return sessions[id];}
export function saveSession(id,item){getSession(id);sessions[id]=item;try{localStorage.setItem(sessionKey,JSON.stringify(sessions));sessionStorage.setItem(sessionKey,JSON.stringify(sessions));}catch{storageAvailable=false;}}
export function getPreferences(){const data=read("localStorage",preferencesKey,preferences);return data&&typeof data==="object"&&!Array.isArray(data)?data:{};}
export function savePreferences(value){preferences={...getPreferences(),...value};try{localStorage.setItem(preferencesKey,JSON.stringify(preferences));}catch{storageAvailable=false;}}
export function exportLearning(){return {format:"kbigdata-practical",version:1,exportedAt:new Date().toISOString(),attempts:getAttempts(),preferences:getPreferences()};}
export function importLearning(data){
 if(data?.format!=="kbigdata-practical"||data.version!==1||!Array.isArray(data.attempts)||data.attempts.length>10000)throw Error("지원하는 학습 기록 파일이 아닙니다.");
 const items=data.attempts;
 if(items.some(a=>!a||typeof a.id!=="string"||a.id.length>200||typeof a.questionId!=="string"||a.questionId.length>200||!Number.isFinite(a.submittedAt)||a.submittedAt<0||!Number.isFinite(a.elapsedSeconds)||a.elapsedSeconds<0||typeof a.answer!=="string"||a.answer.length>10000||![true,false,null].includes(a.correct)))throw Error("학습 기록 형식이 올바르지 않습니다.");
 const merged=new Map(getAttempts().map(a=>[a.id,a]));for(const a of items)if(!merged.has(a.id))merged.set(a.id,a);
 writeAttempts([...merged.values()].sort((a,b)=>a.submittedAt-b.submittedAt));
 // Never import running sessions or timer/unlock state.
 return items.length;
}
export function clearLocalLearning(){writeAttempts([]);sessions={};preferences={};try{sessionStorage.removeItem(sessionKey);localStorage.removeItem(sessionKey);localStorage.removeItem(preferencesKey);}catch{storageAvailable=false;}}
