import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NOTION_REDIRECT,notionPageId,stateDigest,notionConfigured,encryptCredentials,decryptCredentials,startNotion,finishNotion,checkNotion} from '../supabase/functions/ready-api/notion.mjs';
const env={READY_NOTION_CLIENT_ID:'test-client',READY_NOTION_CLIENT_SECRET:'test-only-secret',READY_NOTION_ENCRYPTION_KEY:'test-only-key'};
globalThis.Deno={env:{get:k=>env[k]}};
const page='12345678-1234-5678-9876-abcdef012345',url='https://student.notion.site/Portfolio-'+page.replaceAll('-','')+'?source=copy_link';
const uid='00000000-0000-4000-8000-000000000001',other='00000000-0000-4000-8000-000000000002',cid='00000000-0000-4000-8000-000000000003';
assert.equal(notionPageId(url),page);
assert.equal(notionPageId('https://www.notion.so/'+page),page);
for(const invalid of ['https://notion.so.attacker.test/'+page,'http://notion.so/'+page,'https://notion.so/?page='+page,'https://x:pass@notion.so/'+page,'https://notion.so:8443/'+page,'https://notion.site/portfolio'])assert.equal(notionPageId(invalid),null);
const credentials={access_token:'dummy-access',refresh_token:'dummy-refresh'};
assert.equal(notionConfigured(),true);
const ciphertext=await encryptCredentials(uid,page,cid,credentials);
assert.ok(!ciphertext.includes(credentials.access_token));
assert.notEqual(ciphertext,await encryptCredentials(uid,page,cid,credentials));
const row={user_id:uid,page_id:page,connection_id:cid,encrypted_credentials:ciphertext};
assert.deepEqual(await decryptCredentials(row),credentials);
await assert.rejects(decryptCredentials({...row,user_id:other}),/NOTION_RECONNECT/);
await assert.rejects(decryptCredentials({...row,page_id:other}),/NOTION_RECONNECT/);
await assert.rejects(decryptCredentials({...row,connection_id:other}),/NOTION_RECONNECT/);
assert.match(await stateDigest('test'),/^[a-f0-9]{64}$/);
let pending,connection=null,check=null;
const ok=data=>({data,error:null});
const db={
 from(table){
  let op='select',value,filters={};
  const q={select(){return q},eq(k,v){filters[k]=v;return q},is(k,v){filters[k]=v;return q},gt(){return q},update(v){op='update';value=v;return q},upsert(v){op='upsert';value=v;return q},delete(){op='delete';return q},maybeSingle(){return Promise.resolve(run())},then(resolve,reject){return Promise.resolve(run()).then(resolve,reject)}};
  function run(){
   if(table==='ready_notion_oauth_states'){
    if(op==='upsert'){pending=value;return ok(null)}
    const matched=pending&&Object.entries(filters).every(([k,v])=>pending[k]===v);
    if(op==='delete'){if(matched)pending=null;return ok(null)}
    if(op==='update'){if(!matched)return ok(null);Object.assign(pending,value);return ok({page_id:pending.page_id})}
    return ok(matched?pending:null);
   }
   return ok(connection&&Object.entries(filters).every(([k,v])=>connection[k]===v)?connection:null);
  }
  return q;
 },
 async rpc(name,p){
  if(name==='ready_notion_finish'){assert.equal(p.p_user,uid);assert.equal(p.p_page_id,page);assert.equal(p.p_state_hash,pending.state_hash);assert.ok(pending.claimed_at);connection={...row,connection_id:p.p_connection_id,encrypted_credentials:p.p_encrypted};pending=null;return ok(true)}
  if(name==='ready_notion_store_check'){check=p.p_data;return ok(true)}
  throw Error(name);
 }
};
let calls=[];
globalThis.fetch=async(url,init)=>{
 calls.push(url);
 assert.ok(url.startsWith('https://api.notion.com/v1/'));
 assert.equal(init.redirect,'error');
 if(url.endsWith('/oauth/token')){const body=JSON.parse(init.body);assert.equal(body.grant_type,'authorization_code');assert.equal(body.redirect_uri,NOTION_REDIRECT);assert.match(init.headers.Authorization,/^Basic /);return Response.json(credentials)}
 assert.equal(url,'https://api.notion.com/v1/pages/'+page);
 assert.equal(init.headers.Authorization,'Bearer dummy-access');
 return Response.json({object:'page',id:page,last_edited_time:new Date().toISOString(),properties:{private:'do not store'}});
};
const authorization=new URL((await startNotion(db,uid,url)).authorization_url);
const state=authorization.searchParams.get('state');
assert.equal(authorization.searchParams.get('redirect_uri'),NOTION_REDIRECT);
assert.equal(authorization.searchParams.get('owner'),'user');
assert.equal(pending.state_hash,await stateDigest(state));
assert.ok(!JSON.stringify(pending).includes(state));
await assert.rejects(finishNotion(db,other,{state,code:'code'},url),/다른 계정/);
assert.equal(calls.length,0);
await assert.rejects(finishNotion(db,uid,{state,code:'code'},'https://notion.so/'+other),/다른 계정/);
assert.equal(calls.length,0);
assert.equal((await finishNotion(db,uid,{state,code:'code'},url)).connected,true);
assert.equal(check.check_status,'SUCCESS');assert.equal(check.activity_status,'최근 업데이트');
assert.ok(!JSON.stringify(check).includes('private'));
assert.equal(calls.length,2);
await assert.rejects(finishNotion(db,uid,{state,code:'code'},url),/다른 계정/);
assert.equal(calls.length,2);
assert.equal((await checkNotion(db,uid,url)).check_status,'SUCCESS');
assert.equal((await checkNotion(db,other,url)).check_status,'AUTH_REQUIRED');
assert.equal(calls.length,3);
delete env.READY_NOTION_CLIENT_ID;
assert.equal((await checkNotion(db,uid,url)).check_status,'NOT_CONFIGURED');
assert.equal(calls.length,3);
const callback=readFileSync(new URL('../notion/callback.html',import.meta.url),'utf8');
assert.match(callback,/history\.replaceState/);assert.match(callback,/no-referrer/);assert.ok(!/<script[^>]*src=/.test(callback));
const migration=readFileSync(new URL('../supabase/migrations/20261128142000_ready_notion_oauth.sql',import.meta.url),'utf8');
assert.match(migration,/ready_notion_connections enable row level security/);assert.match(migration,/revoke all on public.ready_notion_oauth_states,public.ready_notion_connections from public,anon,authenticated/);
console.log('PASS: OAuth state, account/page binding, token encryption, replay prevention, consent scope, no secret disclosure, privacy-preserving callback.');
