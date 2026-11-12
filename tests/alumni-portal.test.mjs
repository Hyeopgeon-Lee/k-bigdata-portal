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
 "js/alumni.js":["myAlumniProfile","saveMyAlumniProfile"],"js/jobs.js":["jobs"],"js/job-submit.js":["verifyJobAlumni","submitJob"],
 "js/news.js":["newsList"],"js/news-submit.js":["verifyNewsAlumni","submitNews"],"js/admin.js":["adminList","adminCreateJob"]
};
const bridge=read("alumni/js/portal-bridge.mjs");
assert.match(bridge,/start_portal_session/,"reuses verified portal session");
assert.match(bridge,/portal_learning_access/,"server-side portal authorization");
assert.match(bridge,/\.eq\("user_id",user\.id\)/,"profile lookup is own user");
assert.match(bridge,/profile\?\.approval_status!=="approved"/,"only approved members");
assert.match(bridge,/storageKey:"kbigdata-portal-auth-v1"/,"uses same portal authentication storage");
assert.match(bridge,/\.alumni_source_id/,"prefills legacy account identifier");
assert.match(bridge,/profile.enrollment_status==="early_employment"&&!!sourceId/,"linked early-employed students may enter alumni service");
assert.match(bridge,/alumniPortalAuth="approved"/,"releases page after successful auth");
const cfg=read("alumni/js/config.js");
assert.match(cfg,/https:\/\/zjsindkakjfzmjgrkaou\.supabase\.co\/functions\/v1\/alumni-network-api/,"Supabase endpoint configured");
assert.doesNotMatch(cfg,/script\.google\.com/,"new portal no longer calls Apps Script");
const api=read("alumni/js/api.js");
assert.match(api,/AlumniAPI=\{request,configured\}/,"preserves API compatibility");
assert.ok(api.includes('"Authorization":"Bearer "+session.access_token'),"Supabase Auth bearer token attached");
assert.match(api,/Content-Type":"application\/json"/,"new API accepts JSON");
assert.doesNotMatch(api,/text\/plain;charset=utf-8/,"no legacy Apps Script contract");
const backend=read("supabase/functions/alumni-network-api/index.ts");
assert.match(backend,/portal_learning_access/,"server enforces portal session");
assert.match(backend,/portal_super_admin_allowed/,"admin rights checked on server");
assert.match(backend,/alumni_network_records/,"new source of truth is Supabase");
assert.match(backend,/alumni_network_mail_outbox/,"mail deduplication persisted");
assert.match(backend,/case "contact"/,"contact relay still supported");
assert.match(backend,/case "adminRunJobDigest"/,"career digest still supported");
assert.match(backend,/update\(\{alumni_source_id:recordId\}\)/,"new alumni registrations link their portal identity");
assert.match(backend,/await deliverNews\(d\)/,"admin-created news honors mail request");
assert.match(backend,/alumni_news_mail_logs/,"new news mails preserve delivery history");
assert.match(backend,/portal_super_admin_allowed/,"admin permissions cannot be set by browser token");
assert.match(backend,/function isGraduateMember/,"graduates use portal account to register");
assert.match(backend,/case "myAlumniProfile"/,"personal profile automatically loaded after login");
assert.match(backend,/case "saveMyAlumniProfile"/,"personal profile saved without PIN");
assert.match(backend,/if\(!isGraduateMember\(a\)\)/,"non-graduates cannot register");
assert.match(backend,/a\.role==="student"\|\|a\.role==="alumni"/,"student account has graduated-member eligibility");
const profileHtml=read("alumni/alumni.html"),profileJs=read("alumni/js/alumni.js");
assert.match(profileHtml,/id="alumni-account-banner"/,"graduation status message is visible");
assert.match(profileHtml,/<form id="alumni-form" hidden>/,"save form hidden until authorization");
assert.doesNotMatch(profileHtml,/id="(?:lookup-pin|reset-new-pin|pin-field|pin-recovery-panel)"/,"PIN and recovery inputs removed");
assert.doesNotMatch(profileJs,/authPin|pinReset|edit_pin/i,"PIN code removed from personal profile");
assert.doesNotMatch(read("alumni/job-submit.html"),/id="job-pin"/,"job submit no PIN");
assert.doesNotMatch(read("alumni/news-submit.html"),/id="news-pin"/,"news submit no PIN");
assert.doesNotMatch(read("alumni/js/job-submit.js"),/edit_pin|#job-pin/i,"job submit uses portal login");
assert.doesNotMatch(read("alumni/js/news-submit.js"),/edit_pin|#news-pin/i,"news submit uses portal login");
assert.match(read("supabase/migrations/20261113054000_retire_legacy_alumni_pin_hashes.sql"),/data-'edit_pin_hash'/,"retired hashes are purged");
assert.match(backend,/async function ownRecordForAccount/,"writes require server-side owner record matching");
assert.match(backend,/text\(linked\.data\.email\)\.toLowerCase\(\)!==a\.email/,"linked alumni record email must match account");
assert.match(backend,/a\.enrollment==="early_employment"&&!!a\.alumniId/,"approved early-employed candidates require immutable alumni link");
assert.match(read("docs/ALUMNI_PORTAL_INTEGRATION.md"),/아직 Apps Script 기반으로 운영됩니다/,"legacy dual-write caveat documented");

const migration=read("supabase/migrations/20261113035800_migrate_alumni_network_sheets_to_private_supabase_record_store.sql");
assert.match(migration,/enable row level security/,"private tables are RLS protected");
assert.match(migration,/revoke all on public\.alumni_network_records from public,anon,authenticated/,"raw PII not client-readable");
assert.match(read("alumni/js/portal-bridge.mjs"),/window\.alumniPortalClient=client/,"frontend shares authenticated client");

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
