import assert from "node:assert/strict";
import {readFileSync,existsSync,readdirSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {spawnSync} from "node:child_process";
import {services,serviceKind} from "../js/services.js";

const root=fileURLToPath(new URL("../",import.meta.url));
const read=p=>readFileSync(path.join(root,p),"utf8");
const pages=["index.html","detail.html","contact.html","alumni.html","admin.html","jobs.html","job-detail.html","job-submit.html","news.html","news-detail.html","news-submit.html"];
const actions={
 "js/app.js":["home"],"js/detail.js":["alumniDetail"],"js/contact.js":["contact"],
 "js/alumni.js":["getOwn","findAlumniId","requestPinReset","resetPin"],"js/jobs.js":["jobs"],"js/job-submit.js":["verifyJobAlumni","submitJob"],
 "js/news.js":["newsList"],"js/news-submit.js":["verifyNewsAlumni","submitNews"],"js/admin.js":["adminList","adminLogin"]
};
const bridge=read("alumni/js/portal-bridge.mjs");
assert.match(bridge,/start_portal_session/,"reuses verified portal session");
assert.match(bridge,/portal_learning_access/,"server-side portal authorization");
assert.match(bridge,/\.eq\("user_id",user\.id\)/,"profile lookup is own user");
assert.match(bridge,/profile\?\.approval_status!=="approved"/,"only approved members");
assert.match(bridge,/storageKey:"kbigdata-portal-auth-v1"/,"uses same portal authentication storage");
assert.match(bridge,/\.alumni_source_id/,"prefills legacy account identifier");
assert.match(bridge,/alumniPortalAuth="approved"/,"releases page after successful auth");
const cfg=read("alumni/js/config.js");
assert.match(cfg,/https:\/\/script\.google\.com\/macros\/s\//,"keeps live Google Apps Script API");
const api=read("alumni/js/api.js");
assert.match(api,/AlumniAPI = \{ request, configured \}/,"preserves original API dispatcher");
assert.match(api,/Content-Type': 'text\/plain;charset=utf-8'/,"legacy Apps Script POST contract unchanged");
for(const name of pages){
 const html=read("alumni/"+name);
 assert.match(html,/id="alumni-portal-gate"/,"secure portal login gate "+name);
 assert.match(html,/alumni-portal-top/,"portal navigation "+name);
 assert.match(html,/href="\.\.\/index\.html"/,"portal home link "+name);
 assert.match(html,/id="alumni-portal-member"/,"member display "+name);
 assert.match(html,/js\/portal-bridge\.mjs\?v=/,"auth bridge included "+name);
 assert.match(html,/<meta name="robots" content="noindex,nofollow">/,"private portal search policy "+name);
 for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const url=m[1].split(/[?#]/)[0];
  if(!url||/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(url))continue;
  assert.ok(existsSync(path.resolve(root,"alumni",url)),name+" missing "+url);
 }
}
const jsfiles=readdirSync(path.join(root,"alumni/js")).filter(x=>/\.(?:js|mjs)$/.test(x));
for(const name of jsfiles){
 const p=path.join(root,"alumni/js",name);
 const check=spawnSync(process.execPath,["--check",p],{encoding:"utf8"});
 assert.equal(check.status,0,"Syntax error "+name+": "+check.stderr);
}
for(const [name,needed] of Object.entries(actions)){
 const src=read("alumni/"+name);
 for(const action of needed)assert.ok(src.includes(action),"Legacy API action "+action+" retained in "+name);
}
for(const file of ["css/style.css","css/admin-responsive.css","css/jobs.css","css/news.css","css/detail-recovery.css","favicon.svg"])
 assert.ok(existsSync(path.join(root,"alumni",file)),"Original UI asset "+file);
assert.equal(services.find(s=>s.id==="alumni")?.url,"alumni/index.html","portal directory routes to local alumni");
assert.equal(serviceKind(services.find(s=>s.id==="alumni")),"SERVICE");
for(const p of ["index.html","services.html","recruit.html"]){
 const html=read(p);
 assert.doesNotMatch(html,/href="https:\/\/alumni\.k-bigdata\.kr\/" data-nav-id="alumni"/,"no external Alumni tab in "+p);
}
assert.ok(read("scripts/build-portal-shell.mjs").includes("'alumni'"),"generator excludes namespaced alumni HTML pages");
console.log("PASS: 11 preserved Alumni Network pages, all assets, API operations, portal login and internal navigation");
