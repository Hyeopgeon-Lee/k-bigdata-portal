// Replace this adapter to integrate an approved backend later. Nothing is transmitted.
const key="kbigdata-practical-v1", sessionKey="kbigdata-practical-attempt-v1";
let memory=[],sessions={};
export let storageAvailable=true;
function read(kind,key,fallback){try{return JSON.parse(globalThis[kind].getItem(key))||fallback;}catch{storageAvailable=false;return fallback;}}
export function getAttempts(){const data=read("localStorage",key,memory);return Array.isArray(data)?data.filter(a=>a&&typeof a.questionId==="string"&&Number.isFinite(a.submittedAt)&&Number.isFinite(a.elapsedSeconds)):[];}
function writeAttempts(items){memory=items;try{localStorage.setItem(key,JSON.stringify(items));}catch{storageAvailable=false;}}
export function saveAttempt(item){const items=getAttempts(),index=items.findIndex(a=>a.id===item.id);if(index<0)items.push(item);else items[index]=item;writeAttempts(items);}
export function getSession(id){const data=read("sessionStorage",sessionKey,sessions);sessions=data&&typeof data==="object"&&!Array.isArray(data)?data:{};return sessions[id];}
export function saveSession(id,item){sessions[id]=item;try{sessionStorage.setItem(sessionKey,JSON.stringify(sessions));}catch{storageAvailable=false;}}
export function clearLocalLearning(){writeAttempts([]);sessions={};try{sessionStorage.removeItem(sessionKey);}catch{storageAvailable=false;}}
