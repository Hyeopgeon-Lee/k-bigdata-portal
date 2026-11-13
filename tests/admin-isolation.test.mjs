import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const routes=["index","accounts","certifications","rooms","help","learning"];
const modules=["dashboard","accounts","certifications","rooms","help","learning"];
const guarded=read("admin/js/guard.mjs");
const adminHome=read("admin/index.html"),adminCSS=read("admin/css/admin.css");
assert.match(adminHome,/admin-grid--featured/,"home uses two featured management actions");
assert.match(adminHome,/admin-grid--services/,"home groups supporting department services");
assert.match(adminHome,/admin-tile-symbol/,"portal-style illustrated management cards");
assert.match(adminHome,/brand-mark/,"same H-shaped brand mark as student portal");
assert.match(adminCSS,/\.admin-grid--services/);
assert.match(adminCSS,/@media\(max-width:700px\)/,"responsive cards and navigation");
for(const name of ["index","accounts","learning","certifications","rooms","help"]){
 const page=read("admin/"+name+".html");
 assert.match(page,/admin-header-inner header-inner/,"consistent header "+name);
 assert.match(page,/ADMIN PORTAL/,"common page eyebrow "+name);
 assert.match(page,/admin-brand-copy brand-copy/,"common portal branding "+name);
 assert.match(page,/admin.css\?v=20261113-(?:portal-home-unified|signup-notification)-1/,"updated styles "+name);
 if(name!=="index")assert.match(page,/aria-label="관리자 업무 메뉴"/,"common subpage nav "+name);
}

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
assert.match(accounts,/<option value=\"enrolled\" selected>재학<\/option>/,"students page defaults to enrolled");
assert.match(accounts,/member\.signup_type!==\"alumni\"&&member\.enrollment_status===\"enrolled\"/,"default excludes alumni even if stale status says enrolled");
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
// Verified-signup admin notifications must remain a separate, privileged workflow.
const signupAdminApi=read("supabase/functions/notify-signup-admin/index.ts");
const signupAdminMigration=read("supabase/migrations/20261113104500_signup_admin_notifications.sql");
assert.match(auth,/notify-signup-admin/,"verified signup invokes the notification server");
assert.match(accounts,/signup-admin-mail-toggle/,"super admin can toggle only the administrator alert");
assert.match(accounts,/targetUserId/,"mail deep link targets an individual signup request");
assert.match(accounts,/portal-approval-target/,"linked request is highlighted without automatic approval");
assert.match(signupAdminApi,/email_confirmed_at/,"unverified mail addresses cannot notify administrators");
assert.match(signupAdminApi,/portal_super_admin_allowed/,"notification switch uses server role authorization");
assert.match(signupAdminApi,/member.approval_status!=="pending"/,"only pending applicants can notify");
assert.match(signupAdminApi,/Idempotency-Key/,"mailer has send-level duplicate protection");
assert.match(signupAdminApi,/view=approvals&approve=/,"mail button links to the guarded admin approval page");
assert.match(signupAdminMigration,/signup_admin_notification_settings/);
assert.match(signupAdminMigration,/signup_admin_notification_deliveries/);
assert.match(signupAdminMigration,/enable row level security/g,"settings and delivery tables must be RLS-protected");
assert.match(signupAdminMigration,/revoke all .* from public, anon, authenticated/,"client roles cannot access mail settings");

const alumniAdmin=read("alumni/admin.html"),bridge=read("alumni/js/portal-bridge.mjs");
assert.match(alumniAdmin,/data-alumni-requires-admin/);
assert.match(bridge,/hasAttribute\("data-alumni-requires-admin"\)/);
assert.match(bridge,/portal_super_admin_allowed/);
for(const source of ["js/portal-auth.mjs","js/my-certifications.js","js/room.js","js/help.js","admin/js/guard.mjs","admin/js/accounts.js","admin/js/certifications.js","admin/js/rooms.js","admin/js/help.js","admin/js/learning.js"])
 execFileSync(process.execPath,["--check",new URL("../"+source,import.meta.url).pathname]);
const studentHelp=read("js/help.js"),adminHelp=read("admin/js/help.js");
const studyJS=read("js/study.js");
for(const help of [studentHelp,adminHelp]){
 assert.match(help,/summary\.addEventListener\('toggle'/,"request detail loads on expansion");
 assert.match(help,/\.select\('content,admin_reply/,"sensitive request bodies load on demand");
 assert.doesNotMatch(help,/select\('id,owner_id,legacy_request_id,category,location,title,content/,"no body in ticket list");
}
assert.match(studentHelp,/\.eq\('recipient_id',user\.id\)/,"notifications restrict recipient");
assert.match(studyJS,/\.eq\('user_id',uid\)/,"study queries explicitly scope to the signed-in user");
assert.match(studyJS,/\.gte\('started_at',kstMidnightISO\(weeks\.thisWeek\)\)/,"study history is date-bounded");
assert.match(studyJS,/\.eq\('status','active'\)\.maybeSingle\(\)/,"active session is fetched separately");
assert.doesNotMatch(studyJS,/db\.from\('study_sessions'\)\.select\('\*'\)/,"no unbounded full-column session query");
console.log("PASS: admin isolation plus lazy Help Desk details and date-bounded study queries.");
