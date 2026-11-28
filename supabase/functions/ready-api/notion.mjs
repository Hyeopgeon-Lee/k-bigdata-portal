// Read only the specific saved portfolio page. OAuth credentials remain encrypted server-side.
export const NOTION_REDIRECT='https://portal.k-bigdata.kr/notion/callback.html';
const API='https://api.notion.com/v1', VERSION='2026-03-11', UTF8=new TextEncoder();
const connCols='user_id,connection_id,page_id,encrypted_credentials';
const getEnv=k=>globalThis.Deno?.env.get(k)||'';
export const notionConfigured=()=>!!(getEnv('READY_NOTION_CLIENT_ID')&&getEnv('READY_NOTION_CLIENT_SECRET'));
const clientID=()=>getEnv('READY_NOTION_CLIENT_ID');
const clientSecret=()=>getEnv('READY_NOTION_CLIENT_SECRET');
const b64=b=>btoa(String.fromCharCode(...b));
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const decode=b=>new TextDecoder().decode(b);
const stamp=()=>new Date().toISOString();
const read=async q=>{const {data,error}=await q;if(error)throw Error('DATABASE_ERROR');return data};
export function notionPageId(value){
 try{
  const u=new URL(value);
  if(u.protocol!=='https:'||u.username||u.password||u.port||!['notion.so','notion.site','notion.com'].some(h=>u.hostname===h||u.hostname.endsWith('.'+h)))return null;
  const leaf=u.pathname.replace(/\/$/,'').split('/').pop()||'';
  const id=leaf.match(/(?:^|[-_])([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{32})$/i)?.[1];
  if(!id)return null;
  const hex=id.replace(/-/g,'').toLowerCase();return hex.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/,'$1-$2-$3-$4-$5');
 }catch{return null;}
}
export const stateDigest=async state=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',UTF8.encode(state))),x=>x.toString(16).padStart(2,'0')).join('');
const stateValue=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
const aad=(uid,page,cid)=>UTF8.encode('ready-notion-v1:'+uid+':'+page+':'+cid);
async function key(){
 const secret=getEnv('READY_NOTION_ENCRYPTION_KEY')||clientSecret();
 if(!secret)throw Error('Notion OAuth 설정이 필요합니다.');
 const raw=await crypto.subtle.importKey('raw',UTF8.encode(secret),'HKDF',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt:UTF8.encode('kbigdata-portal-ready-notion-v1'),info:UTF8.encode('student-oauth-credentials')},raw,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function encryptCredentials(uid,page,cid,credentials){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad(uid,page,cid)},await key(),UTF8.encode(JSON.stringify(credentials)));
 return 'v1.'+b64(iv)+'.'+b64(new Uint8Array(cipher));
}
export async function decryptCredentials(row){
 const [v,iv,cipher]=row.encrypted_credentials.split('.');
 if(v!=='v1'||!iv||!cipher)throw Error('NOTION_RECONNECT');
 try{return JSON.parse(decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(iv),additionalData:aad(row.user_id,row.page_id,row.connection_id)},await key(),unb64(cipher))))}
 catch{throw Error('NOTION_RECONNECT');}
}
async function oauth(path,body){
 if(!notionConfigured())throw Error('Notion OAuth 관리자 설정이 필요합니다.');
 // Only the official token endpoint receives credentials. Never return response bodies on failure.
 const r=await fetch(API+path,{method:'POST',headers:{Authorization:'Basic '+b64(UTF8.encode(clientID()+':'+clientSecret())), 'Content-Type':'application/json','Notion-Version':VERSION},body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(10000)});
 return r;
}
function tokens(value){
 if(typeof value.access_token!=='string'||!value.access_token||value.access_token.length>10000||value.refresh_token!=null&&typeof value.refresh_token!=='string'||String(value.refresh_token||'').length>10000)throw Error('Notion 인증 응답을 확인할 수 없습니다.');
 return {access_token:value.access_token,refresh_token:value.refresh_token||null};
}
async function getPage(pid,access){
 return await fetch(API+'/pages/'+pid,{headers:{Authorization:'Bearer '+access,'Notion-Version':VERSION},redirect:'error',signal:AbortSignal.timeout(10000)});
}
async function resultFromPage(res,pid){
 if(!res.ok)return null;
 const page=await res.json();
 // Store date only; discard all page properties and content.
 if(page.object!=='page'||String(page.id).toLowerCase()!==pid||page.in_trash===true||page.archived===true||!Number.isFinite(Date.parse(page.last_edited_time)))return null;
 const last=page.last_edited_time,age=Math.max(0,Math.floor((Date.now()-Date.parse(last))/86400000));
 return {last_edited_at:last,inactive_days:age,activity_status:age<30?'최근 업데이트':age<60?'업데이트 필요':'장기 미업데이트',check_status:'SUCCESS'};
}
async function revoke(credentials){
 if(!credentials?.access_token||!notionConfigured())return false;
 try{const r=await oauth('/oauth/revoke',{token:credentials.access_token});return r.ok||r.status===401;}catch{return false;}
}
export async function notionStatus(db,uid,value){
 const page=notionPageId(value);
 const row=await read(db.from('ready_notion_connections').select('page_id,connected_at').eq('user_id',uid).maybeSingle());
 const base={configured:notionConfigured(),has_connection:!!row};
 if(!value)return {...base,status:'UNREGISTERED'};
 if(!page)return {...base,status:'INVALID_URL'};
 if(!base.configured)return {...base,status:'NOT_CONFIGURED'};
 return {...base,status:row?.page_id===page?'CONNECTED':'AUTH_REQUIRED',connected_at:row?.page_id===page?row.connected_at:null};
}
export async function startNotion(db,uid,value){
 if(!notionConfigured())throw Error('관리자가 Notion OAuth 앱을 설정한 후 연결할 수 있습니다.');
 const pid=notionPageId(value);
 if(!pid)throw Error('포털 내 정보에 Notion 포트폴리오 페이지 링크를 먼저 저장하세요.');
 const old=await read(db.from('ready_notion_oauth_states').select('created_at').eq('user_id',uid).maybeSingle());
 if(old&&Date.now()-Date.parse(old.created_at)<2000)throw Error('잠시 후 다시 연결하세요.');
 const state=stateValue(),hash=await stateDigest(state);
 await read(db.from('ready_notion_oauth_states').upsert({user_id:uid,state_hash:hash,page_id:pid,expected_url:value,expires_at:new Date(Date.now()+10*60000).toISOString(),claimed_at:null,created_at:stamp()}));
 const u=new URL(API+'/oauth/authorize');
 u.search=new URLSearchParams({client_id:clientID(),response_type:'code',owner:'user',redirect_uri:NOTION_REDIRECT,state}).toString();
 return {authorization_url:u.href};
}
export async function finishNotion(db,uid,body,value){
 const state=typeof body.state==='string'?body.state:'',code=typeof body.code==='string'?body.code:'';
 if(!/^[0-9a-f]{64}$/.test(state)||!code||code.length>3000)throw Error('Notion 인증 요청을 다시 시작하세요.');
 const hash=await stateDigest(state),pid=notionPageId(value);
 const pending=await read(db.from('ready_notion_oauth_states').update({claimed_at:stamp()}).eq('user_id',uid).eq('state_hash',hash).eq('expected_url',value).is('claimed_at',null).gt('expires_at',stamp()).select('page_id').maybeSingle());
 if(!pending||pending.page_id!==pid)throw Error('인증 요청이 만료되었거나 다른 계정입니다. 다시 연결하세요.');
 let credentials=null,committed=false;
 try{
  const r=await oauth('/oauth/token',{grant_type:'authorization_code',code,redirect_uri:NOTION_REDIRECT});
  if(!r.ok)throw Error('Notion 인증을 완료하지 못했습니다. 다시 연결하세요.');
  credentials=tokens(await r.json());
  const pageResult=await resultFromPage(await getPage(pid,credentials.access_token),pid);
  if(!pageResult)throw Error('등록한 포트폴리오 페이지에 접근할 수 없습니다. Notion 인증 화면에서 해당 페이지를 선택하세요.');
  const cid=crypto.randomUUID();
  const encrypted=await encryptCredentials(uid,pid,cid,credentials);
  const saved=await read(db.rpc('ready_notion_finish',{p_user:uid,p_state_hash:hash,p_page_id:pid,p_connection_id:cid,p_encrypted:encrypted}));
  if(!saved)throw Error('포트폴리오 주소 또는 연결 상태가 변경되었습니다. 다시 연결하세요.');
  committed=true;
  await read(db.rpc('ready_notion_store_check',{p_user:uid,p_page_id:pid,p_connection_id:cid,p_expected_url:value,p_data:pageResult}));
  return {connected:true,notion:pageResult};
 }catch(e){if(credentials&&!committed)await revoke(credentials);throw e;}
 finally{await read(db.from('ready_notion_oauth_states').delete().eq('user_id',uid).eq('state_hash',hash))}
}
export async function disconnectNotion(db,uid){
 const row=await read(db.rpc('ready_notion_disconnect',{p_user:uid}));
 let revoked=true;
 if(row){try{revoked=await revoke(await decryptCredentials(row))}catch{revoked=false;}}
 return {disconnected:true,revoked};
}
const failed=(activity_status,check_status,error_message)=>({activity_status,check_status,error_message});
export async function checkNotion(db,uid,value){
 const pid=notionPageId(value),row=pid?await read(db.from('ready_notion_connections').select(connCols).eq('user_id',uid).eq('page_id',pid).maybeSingle()):null;
 const save=async data=>{await read(db.rpc('ready_notion_store_check',{p_user:uid,p_page_id:pid,p_connection_id:row?.connection_id||null,p_expected_url:value||'',p_data:data}));return data};
 if(!value)return save({activity_status:'미등록',check_status:'SUCCESS'});
 if(!pid)return save(failed('링크 확인 필요','FAILED','Notion 페이지 ID가 포함된 공유 링크를 등록하세요.'));
 if(!notionConfigured())return save(failed('관리자 설정 필요','NOT_CONFIGURED','Notion OAuth 관리자 설정 필요'));
 if(!row)return save(failed('Notion 연동 필요','AUTH_REQUIRED','학생이 포털에서 해당 Notion 페이지의 접근 권한을 허용해야 합니다.'));
 let creds;
 try{creds=await decryptCredentials(row)}catch{return save(failed('다시 연결 필요','AUTH_REQUIRED','Notion 연결 인증 갱신이 필요합니다.'))}
 try{
  let r=await getPage(pid,creds.access_token);
  if(r.status===401&&creds.refresh_token){
   const refreshed=await oauth('/oauth/token',{grant_type:'refresh_token',refresh_token:creds.refresh_token});
   if(!refreshed.ok){
    if(refreshed.status===400||refreshed.status===401)return save(failed('다시 연결 필요','AUTH_REQUIRED','Notion 인증이 만료되거나 취소되었습니다.'));
    return save(failed('일시 점검 실패','FAILED','Notion 인증 서비스 일시 오류'));
   }
   creds=tokens(await refreshed.json());
   const encrypted=await encryptCredentials(uid,pid,row.connection_id,creds);
   const updated=await read(db.from('ready_notion_connections').update({encrypted_credentials:encrypted,updated_at:stamp()}).eq('user_id',uid).eq('connection_id',row.connection_id).select('connection_id').maybeSingle());
   if(!updated){await revoke(creds);return failed('연결 해제','AUTH_REQUIRED','연결이 변경되었습니다.');}
   r=await getPage(pid,creds.access_token);
  }
  if(r.status===401||r.status===403||r.status===404)return save(failed('다시 연결 필요','AUTH_REQUIRED','등록한 페이지의 Notion 접근 권한을 확인하고 다시 연결하세요.'));
  const page=await resultFromPage(r,pid);
  return save(page||failed('일시 점검 실패','FAILED','Notion 페이지 상태를 확인하지 못했습니다.'));
 }catch(e){if(e.message==='DATABASE_ERROR')throw e;return save(failed('일시 점검 실패','FAILED','Notion API 연결 또는 응답 오류'))}
}
