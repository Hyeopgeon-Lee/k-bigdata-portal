import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const page=read("admin/alumni.html");
const old=read("alumni/admin.html");
const home=read("admin/index.html");
const css=read("admin/css/alumni.css");
const js=read("admin/js/alumni.js");
const legacy=read("alumni/js/admin.js");
assert.match(home,/href="alumni.html"/,"homepage navigates to integrated alumni admin");
for(const file of ["accounts","certifications","learning","rooms","help"])
 assert.match(read("admin/"+file+".html"),/href="alumni.html"/,file+" uses same admin menu");
assert.match(old,/location.replace\("\.\.\/admin\/alumni\.html"/,"legacy URL redirects");
for(const token of ['data-admin-module="alumni.js"','id="admin-secure" hidden',
 'admin-header-inner header-inner','ADMIN PORTAL','aria-label="관리자 업무 메뉴"',
 'id="admin-gate-status"','js/guard.mjs'])
 assert.ok(page.includes(token),"common admin shell missing "+token);
for(const token of ['id="admin-app" hidden','id="admin-table"','id="admin-job-form"',
 'id="admin-news-form"','id="send-consent-invites"','id="send-news-consent-invites"',
 'id="run-job-digest"'])
 assert.ok(page.includes(token),"legacy admin functionality missing "+token);
for(const view of ["alumni","jobs","news","requests","mail_logs"])
 assert.ok(page.includes('data-view="'+view+'"'),"management tab missing "+view);
assert.doesNotMatch(page,/src="\.\.\/alumni\/js\/admin\.js"/,"API handlers must load behind admin guard");
assert.match(js,/window\.portalAdminAllowed!==true/,"check verified admin role");
assert.match(js,/\.\.\/alumni\/js\/api\.js/,"use original secure Alumni API");
assert.match(js,/\.\.\/alumni\/js\/admin\.js/,"reuse legacy actions");
assert.match(legacy,/AlumniAdminOnReady/,"safe late script mount");
assert.match(legacy,/\.\.\/alumni\/job-detail\.html/,"job link works under integrated route");
assert.match(legacy,/\.\.\/alumni\/news-detail\.html/,"news link works under integrated route");
assert.match(css,/var\(--admin-primary\)/,"shared color tokens");
assert.match(css,/white-space:nowrap/,"table column heading nowrap");
assert.match(css,/@media\(max-width:700px\)/,"responsive");
for(const p of ["admin/js/alumni.js","alumni/js/admin.js","alumni/js/common.js"])
 execFileSync(process.execPath,["--check",new URL("../"+p,import.meta.url).pathname]);
console.log("PASS: Alumni management integrated into secure unified admin shell.");
