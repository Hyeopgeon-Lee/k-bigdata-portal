import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const routes=["index","accounts","certifications","rooms","help","learning"];
const modules=["dashboard","accounts","certifications","rooms","help","learning"];
const guarded=read("admin/js/guard.mjs");
assert.match(guarded,/portal_super_admin_allowed/,"role must be server verified");
assert.match(guarded,/data!==true/,"unauthorized users denied");
assert.match(guarded,/panel\.hidden=true/,"on failure admin contents hidden");
assert.match(guarded,/await import/,"admin modules loaded after role check");
for(let i=0;i<routes.length;i++){
 const route=routes[i],html=read("admin/"+route+".html");
 assert.match(html,/<meta name="robots" content="noindex,nofollow">/,"not indexed");
 assert.ok(html.includes('id="admin-secure" hidden'),route+" is not shown before role verification");
 assert.ok(html.includes('data-admin-module="'+modules[i]+'.js"'),route+" guarded module");
 assert.match(html,/js\/guard\.mjs\?v=/,"guard active");
 assert.ok(!html.includes("service_role"),"no server secret in "+route);
 execFileSync(process.execPath,["--check",new URL("../admin/js/"+modules[i]+".js",import.meta.url).pathname]);
}
const auth=read("js/portal-auth.mjs");
assert.match(read("teacher-learning.html"),/data-requires-super-admin/,"legacy faculty route protected");
assert.match(auth,/data-requires-super-admin/,"faculty modules suppressed for students");
assert.match(auth,/href:"admin\/index.html"/);
assert.doesNotMatch(auth,/function renderAdmin\(|function renderApprovalRequests\(|function renderWithdrawnDeletion\(/,
 "shared user login must not contain manager actions");
const accounts=read("admin/js/accounts.js");
for(const term of ["renderApprovalRequests","renderAdmin","renderWithdrawnDeletion","approve-portal-signup","admin-delete-student","admin_update_student"])
 assert.ok(accounts.includes(term),"account feature preserved: "+term);
for(const [html,script,forbidden] of [
 ["my-certifications.html","js/my-certifications.js",/cert-admin-panel|cert-admin-list/],
 ["room.html","js/room.js",/room-admin-tab|room-admin-list/],
 ["help.html","js/help.js",/help-admin-tab|help-admin-list|adminEditor\(/]
]){
 assert.doesNotMatch(read(html),forbidden,"admin DOM removed from "+html);
 assert.doesNotMatch(read(script),forbidden,"admin code removed from "+script);
}
const alumniAdmin=read("alumni/admin.html"),bridge=read("alumni/js/portal-bridge.mjs");
assert.match(alumniAdmin,/data-alumni-requires-admin/);
assert.match(bridge,/hasAttribute\("data-alumni-requires-admin"\)/);
assert.match(bridge,/portal_super_admin_allowed/);
for(const source of ["js/portal-auth.mjs","js/my-certifications.js","js/room.js","js/help.js","admin/js/guard.mjs","admin/js/accounts.js","admin/js/certifications.js","admin/js/rooms.js","admin/js/help.js","admin/js/learning.js"])
 execFileSync(process.execPath,["--check",new URL("../"+source,import.meta.url).pathname]);
console.log("PASS: 6 role-guarded admin routes, 4 management modules extracted, student routes contain no admin panels.");
