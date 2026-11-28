import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const source=readFileSync(new URL("../alumni/js/admin.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../admin/alumni.html",import.meta.url),"utf8");
assert.match(html,/data-view="overview" aria-selected="true"/);
assert.match(html,/id="admin-table" class="table-wrap" hidden/);
assert.ok(html.indexOf('id="admin-overview"')<html.indexOf('id="admin-filter-panel"'));
const nodes=new Map(),listeners=new Map();
function element(name){
 return {name,hidden:false,value:"",textContent:"",innerHTML:"",dataset:{},events:{},
  replaceChildren(){this.innerHTML="";},append(){},remove(){nodes.delete(name);},
  addEventListener(event,fn){this.events[event]=fn;},setAttribute(key,value){this[key]=value;},
  querySelectorAll(){return [];},showModal(){this.open=true;},close(){this.open=false;},
  elements:{always_open:{checked:false}}};
}
const node=name=>{if(!nodes.has(name))nodes.set(name,element(name));return nodes.get(name);};
const tabNames=["overview","news","jobs","alumni","requests","mail_logs"];
const tabs=tabNames.map(view=>Object.assign(element(view),{dataset:{view}}));
const tab=view=>tabs.find(b=>b.dataset.view===view);
const status=(el,message)=>{el.textContent=message;el.hidden=false;};
const esc=value=>String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const UI={qs:selector=>selector.startsWith("[data-view=")?tab(selector.slice(11,-1)):selector==="#alumni-admin-charts"?nodes.get(selector)||null:node(selector),
 qsa:selector=>selector==="[data-view]"?tabs:[],esc,status,busy(){},yearOptions(){},options:{employmentStatus:["취업 중","구직 중"]}};
const news=[{news_id:"n-new",title:"최신 공개 소식",status:"APPROVED",created_at:"2026-11-28",mail_status:"NOT_REQUESTED"},{news_id:"n-pending",title:"승인 대기 소식",status:"PENDING",created_at:"2026-11-27",content:"상세 내용",mail_status:"WAITING"}];
const jobs=[{job_id:"j-pending",company:"회사 <테스트>",job_title:"개발자",status:"PENDING",always_open:true,created_at:"2026-11-28"}];
const apiCalls=[],rpcCalls=[];
let nextDirectory;
const rows=Array.from({length:26},(_,i)=>({alumni_id:"alumni-"+i,name:"졸업생 "+i,graduation_year:2025,status:"APPROVED",employment_status:"취업 중"}));
const api={async request(action,{data}){
 apiCalls.push({action,data:{...data}});
 if(action==="adminList")return {data:data.view==="news"?news:data.view==="jobs"?jobs:[]};
 if(action==="adminNewsPublish")news.find(n=>n.news_id===data.news_id).status="APPROVED";
 return {message:"완료"};
}};
const window={AlumniUI:UI,portalSupabaseClient:{async rpc(name,args){
 rpcCalls.push({name,args:{...args}});
 if(nextDirectory){const response=nextDirectory;nextDirectory=null;return response;}
 const result=args.p_year==="2024"?[]:rows;
 return {data:{rows:result.slice((args.p_page-1)*args.p_size,args.p_page*args.p_size),total:result.length,employment_values:["취업 중"],companies:1,mentor_count:0}};
}},portalAdminUI:{chartMount(){return node("#alumni-admin-charts");},renderKPIs(){},renderBars(){},groupCounts(){return [];}}};
const document={readyState:"complete",addEventListener(event,fn){listeners.set(event,fn);},createElement(){return element("chart");}};
const sandbox={window,document,AlumniUI:UI,AlumniAPI:api,confirm:()=>true,console,setTimeout,clearTimeout};
vm.runInNewContext(source,sandbox,{filename:"alumni/js/admin.js"});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const submit=()=>node("#admin-search-form").onsubmit({preventDefault(){}});
const change=(selector,value)=>{const el=node(selector);el.value=value;el.events[selector==="#admin-query"?"input":"change"]();};
await flush();
assert.deepEqual(apiCalls.map(x=>x.data.view),["news","jobs"]);
assert.equal(rpcCalls.length,0);
assert.equal(nodes.has("#alumni-admin-charts"),false);
const overview=node("#admin-overview-content").innerHTML;
assert.ok(overview.includes("승인 대기 소식"));
assert.ok(overview.indexOf("승인 대기 소식")<overview.indexOf("최신 공개 소식"));
assert.ok(overview.includes("회사 &lt;테스트&gt;"));
assert.match(node("#admin-overview-counts").innerHTML,/data-overview-count="news">1건/);
assert.match(node("#admin-overview-counts").innerHTML,/data-overview-count="jobs">1건/);
change("#admin-year","2025");change("#admin-query","테스트");
await flush();assert.equal(rpcCalls.length,0);
submit();await flush();
assert.equal(tab("alumni")["aria-selected"],"true");
assert.equal(node("#admin-overview").hidden,true);
assert.equal(rpcCalls.length,2,"search may fetch one extra batch for exact chart totals");
assert.equal(rpcCalls[0].args.p_year,"2025");
assert.equal(rpcCalls[0].args.p_search,"테스트");
assert.equal(node("#admin-table").hidden,false);
assert.match(node("#admin-summary").textContent,/검색 결과 26명/);
assert.ok(nodes.has("#alumni-admin-charts"));
change("#admin-year","2024");await flush();
assert.equal(node("#admin-table").hidden,true);
assert.equal(nodes.has("#alumni-admin-charts"),false);
assert.equal(rpcCalls.length,2);
submit();await flush();
assert.equal(rpcCalls.length,3);
assert.match(node("#admin-table").innerHTML,/조건에 맞는 데이터가 없습니다/);
tab("overview").onclick();await flush();
assert.equal(rpcCalls.length,3);
assert.ok(node("#admin-overview-content").innerHTML.includes("승인 대기 소식"));
const reviewButton={dataset:{action:"review",newsId:"n-pending"}};
await node("#admin-overview-content").onclick({target:{closest:()=>reviewButton}});
assert.equal(node("#admin-content-dialog").open,true);
assert.match(node("#admin-content-detail").innerHTML,/상세 내용/);
node("#admin-close-content").onclick();
const publishButton={dataset:{action:"adminNewsPublish",newsId:"n-pending"}};
await node("#admin-overview-content").onclick({target:{closest:()=>publishButton}});
assert.match(node("#admin-overview-counts").innerHTML,/data-overview-count="news">0건/);
assert.ok(node("#admin-overview-content").innerHTML.includes('data-news-id="n-pending" data-action="mail"'));
assert.equal(apiCalls.filter(x=>x.action==="adminNewsSendMail").length,0,"approval does not send mail");
tab("alumni").onclick();await flush();
assert.equal(node("#admin-table").hidden,true);
assert.equal(rpcCalls.length,3,"opening directory alone never searches");
let deliver;
nextDirectory=new Promise(resolve=>{deliver=resolve;});
submit();await flush();assert.equal(rpcCalls.length,4);
change("#admin-query","다른 검색");
deliver({data:{rows,total:26,employment_values:[],companies:1,mentor_count:0}});
await flush();assert.equal(node("#admin-table").hidden,true,"outdated directory response is discarded");
assert.equal(rpcCalls.length,4);
console.log("PASS: overview content/counts, pending priority, explicit directory search, criteria invalidation, stale response protection, approval and no automatic mail");
