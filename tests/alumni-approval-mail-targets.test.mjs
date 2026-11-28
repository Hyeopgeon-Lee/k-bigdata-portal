import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {stripTypeScriptTypes} from "node:module";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const raw=read("supabase/functions/alumni-network-api/index.ts");
const migration=read("supabase/migrations/20261128100000_alumni_content_approval_mail_targets.sql");
assert.match(migration,/u\.email_confirmed_at is not null/);
assert.match(migration,/p\.approval_status='approved'/);
assert.match(migration,/p\.academic_year in \(1,2\)/);
assert.match(migration,/s\.career_enabled else s\.news_enabled/);
assert.match(migration,/revoke all on function public\.alumni_mail_recipients\(text,text,text\[\]\) from public,anon,authenticated/);
assert.match(migration,/string_to_array\(o\.record_id,'_'\)/);
assert.match(migration,/career_enabled boolean not null default false/);
assert.match(migration,/news_enabled boolean not null default false/);

const user="22222222-2222-4222-8222-222222222222";
const graduate={id:user,name:"Test",email:"graduate@example.test",role:"alumni",enrollment:"graduated",isAdmin:false};
const administrator={...graduate,id:"33333333-3333-4333-8333-333333333333",isAdmin:true};
const tables={
 alumni_profiles:[{user_id:user,is_visible:true,member:{approval_status:"approved",full_name:"Test",email:"graduate@example.test",signup_type:"alumni"}}],
 alumni_jobs:[],alumni_news:[],alumni_audit_logs:[],alumni_network_mail_outbox:[],alumni_dispatch_logs:[]
};
let next=1,mailCalls=[],membership=[{email:"graduate@example.test",group:"alumni"},{email:"first@example.test",group:"grade1"},{email:"second@example.test",group:"grade2"}];
class Query {
 constructor(table){this.table=table;this.list=tables[table];this.pred=[];this.mode="select";}
 select(){return this;} eq(k,v){this.pred.push(x=>x[k]===v);return this;}
 in(k,v){this.pred.push(x=>v.includes(x[k]));return this;}
 order(){return this;} limit(){return this;}
 insert(v){this.mode="insert";this.value=v;return this;}
 upsert(v){this.mode="upsert";this.value=v;return this;}
 update(v){this.mode="update";this.value=v;return this;}
 maybeSingle(){return this.execute(true);}
 single(){return this.execute(true);}
 then(resolve,reject){return Promise.resolve(this.execute(false)).then(resolve,reject);}
 execute(single){
  let rows=this.list.filter(x=>this.pred.every(f=>f(x)));
  if(this.mode==="insert"){const r={...this.value,id:this.value.id||next++};this.list.push(r);rows=[r];}
  if(this.mode==="upsert"){const r=this.list.find(x=>x.id===this.value.id);if(r)Object.assign(r,this.value);else this.list.push({...this.value});rows=[r||this.value];}
  if(this.mode==="update"){rows.forEach(x=>Object.assign(x,this.value));}
  return {data:structuredClone(single?rows[0]||null:rows),error:null};
 }
}
globalThis.__alumniTestDb={
 from:table=>new Query(table),
 rpc:async(name,{p_kind,p_record,p_groups})=>{
  assert.equal(name,"alumni_mail_recipients");
  return {data:membership.filter(x=>p_groups.includes(x.group)).sort((a,b)=>a.email.localeCompare(b.email)).map(person=>{
   const row=tables.alumni_network_mail_outbox.find(x=>x.record_id===p_record&&x.record_kind===p_kind&&x.recipient===person.email);
   return {...person,sent:row?.status==="sent",sending:row?.status==="sending"};
  }),error:null};
 }
};
globalThis.Deno={env:{get:key=>key==="RESEND_API_KEY"?"mock-key":"test"}};
const actualFetch=globalThis.fetch;
globalThis.fetch=async (url,options)=>{
 assert.equal(url,"https://api.resend.com/emails");const payload=JSON.parse(options.body);
 assert.equal(payload.to.length,1);mailCalls.push(payload.to[0]);
 return Response.json({id:"mock-"+mailCalls.length});
};
const source=raw.slice(raw.indexOf("\n")+1,raw.indexOf("Deno.serve("));
const mod=await import("data:text/javascript;base64,"+Buffer.from(stripTypeScriptTypes("const createClient=()=>globalThis.__alumniTestDb;\n"+source+"\nexport {handle};")).toString("base64"));
const {handle}=mod;
try {
 const submitted=await handle("submitJob",{company:"회사",job_title:"개발자",recruit_type:"신입",employment_type:"정규직",job_url:"https://example.test/job",always_open:true},graduate);
 const job=submitted.job_id;
 assert.equal(tables.alumni_jobs[0].status,"PENDING");assert.equal(mailCalls.length,0);
 const news=(await handle("submitNews",{news_type:"ACHIEVEMENT",title:"수상",content:"수상 소식",mail_requested:true},graduate)).news_id;
 assert.equal(tables.alumni_news[0].status,"PENDING");assert.equal(mailCalls.length,0);
 assert.equal((await handle("jobs",{},graduate)).data.length,0);
 assert.equal((await handle("newsList",{},graduate)).data.length,0);
 await assert.rejects(handle("adminMailPreview",{kind:"jobs",record_id:job,groups:["alumni"]},administrator),/승인/);
 await assert.rejects(handle("adminJobPublish",{job_id:job},graduate),/권한/);
 await handle("adminJobPublish",{job_id:job},administrator);
 await handle("adminNewsPublish",{news_id:news},administrator);
 assert.equal(mailCalls.length,0);assert.equal((await handle("jobs",{},graduate)).data.length,1);
 const params={kind:"alumni_news",record_id:news,groups:["alumni","grade1"]};
 await assert.rejects(handle("adminMailPreview",params,graduate),/권한/);
 const preview=(await handle("adminMailPreview",params,administrator)).data;
 assert.equal(preview.available,2);assert(!JSON.stringify(preview).includes("@example.test"));
 await assert.rejects(handle("adminNewsSendMail",{...params,token:preview.token},administrator),/변경/);
 membership.push({email:"new@example.test",group:"grade1"});
 await assert.rejects(handle("adminNewsSendMail",{...params,token:preview.token,confirmed:true},administrator),/변경/);
 membership=membership.filter(x=>x.email!=="new@example.test");
 const send=(await handle("adminNewsSendMail",{...params,token:preview.token,confirmed:true},administrator)).data;
 assert.equal(send.sent,2);assert.equal(send.failed,0);assert.deepEqual(mailCalls.sort(),["first@example.test","graduate@example.test"]);
 const repeat=(await handle("adminMailPreview",params,administrator)).data;assert.equal(repeat.available,0);
 await handle("adminNewsSendMail",{...params,token:repeat.token,confirmed:true},administrator);
 assert.equal(mailCalls.length,2);
 const secondParams={kind:"alumni_news",record_id:news,groups:["grade2"]};
 const second=(await handle("adminMailPreview",secondParams,administrator)).data;
 await handle("adminNewsSendMail",{...secondParams,token:second.token,confirmed:true},administrator);
 assert.equal(mailCalls.at(-1),"second@example.test");
 await handle("adminNewsHide",{news_id:news},administrator);
 await assert.rejects(handle("adminMailPreview",secondParams,administrator),/승인/);
 await handle("adminRunJobDigest",{},administrator);assert.equal(mailCalls.length,3);
 const jobParams={kind:"jobs",record_id:job,groups:["grade2"]};
 const jobPreview=(await handle("adminMailPreview",jobParams,administrator)).data;
 await handle("adminJobSendMail",{...jobParams,token:jobPreview.token,confirmed:true},administrator);
 assert.equal(mailCalls.length,4);assert.equal(mailCalls.at(-1),"second@example.test");
 assert(tables.alumni_dispatch_logs.every(x=>x.target_groups&&x.actor_user_id===administrator.id));
 const rejected=(await handle("submitNews",{news_type:"OTHER",title:"Test",content:"Test"},graduate)).news_id;
 await handle("adminNewsReject",{news_id:rejected},administrator);
 await assert.rejects(handle("adminNewsPublish",{news_id:rejected},administrator),/반려/);
 console.log("PASS: approval, role enforcement, group preview, student selection, changed recipients, confirmation, individual job mail, hidden state, duplicate prevention, and audit logs (mock provider only)");
}finally{globalThis.fetch=actualFetch;delete globalThis.__alumniTestDb;delete globalThis.Deno;}
