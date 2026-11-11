import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const source=read("js/portal-auth.mjs");
const loader=read("js/portal-navigation.js");
const css=read("css/portal-auth.css");

assert.match(source,/sb_publishable_[A-Za-z0-9_-]+/,"browser uses publishable API key");
assert.doesNotMatch(source,/service_role|sb_secret_[A-Za-z0-9_-]+/,"no privileged key in browser");
assert.match(source,/persistSession:true/);
assert.match(source,/autoRefreshToken:true/);
assert.match(source,/signUp\(/);
assert.match(source,/signInWithPassword\(/);
assert.match(source,/getUser\(/);
assert.match(source,/start_portal_session/);
assert.match(source,/register_portal_member/);
assert.match(source,/portal_super_admin_allowed/);
assert.match(source,/admin_list_students/);
assert.match(source,/admin_update_student/);
assert.match(source,/revoke_portal_session/);
assert.match(source,/signOut\(/);
assert.match(source,/emailRedirectTo/);
assert.match(source,/resetPasswordForEmail/);
assert.match(source,/PASSWORD_RECOVERY/);
assert.match(source,/textContent=item/,"student-supplied values use safe DOM APIs");
assert.match(loader,/import\("\.\/portal-auth\.mjs/);
const authVersion=loader.match(/portal-auth\.mjs\?v=([^"]+)/)?.[1];
assert.ok(authVersion,"shared auth module is versioned");
for(const page of ["my-learning","teacher-learning","room","help"])
 assert.ok(read(page+".html").includes("portal-auth.mjs?v="+authVersion),"direct auth import matches shared module on "+page);

assert.match(source,/portal_learning_access/);
assert.match(source,/portalAccess="approved"/,'portal requires verified session to unlock');
assert.match(source,/renderLogin\(\)/,'unauthenticated visits present login');
assert.match(css,/html:not\(\[data-portal-access="approved"\]\)/,'default portal UI is hidden');
assert.doesNotMatch(source,/포털 안내는 누구나 볼 수 있습니다/,'optional login copy removed');

for(const page of ["coding","practical","ncp","docs","interview","certifications"]){
 const html=read(page+".html");
 assert.match(html,/id="learning-lock"/);
 assert.match(html,/#learning-notice\{position:fixed/,"loading notice is styled before first paint");
 assert.match(html,/#learning-notice a\{display:none\}/,"no flashing text/link");
 assert.match(html,/portal-loading-appear/,"spinner fades in only for slower transitions");
 assert.match(html,/<noscript><style>/,"no-JavaScript fallback stays readable");
 assert.match(html,/data-module=/);
 assert.doesNotMatch(html,/<script type="module" src=/);
}
for(const page of ["room","help"]){
 const html=read(page+".html");
 assert.match(html,/id="learning-lock"/);
 assert.match(html,/#learning-notice a\{display:none\}/);
 assert.match(html,/data-module=/);
 assert.match(html,/src="js\/portal-auth\.mjs/);
}
for(const page of ["index","services","schedule","recruit"])assert.doesNotMatch(read(page+".html"),/id="learning-lock"/);
const calls=[];
globalThis.localStorage={getItem(){calls.push("read");return "legacy";},setItem(){calls.push("write");}};
const {learningLocal}=await import("../js/learning-storage.mjs");
assert.equal(learningLocal.getItem("history"),null);
learningLocal.setItem("history","new");
assert.deepEqual(calls,[]);
globalThis.portalLearning={read:true,write:false,expires:Date.now()+10000};
assert.equal(learningLocal.getItem("history"),"legacy");
learningLocal.setItem("history","new");
assert.deepEqual(calls,["read"]);
globalThis.portalLearning.write=true;
learningLocal.setItem("history","new");
assert.deepEqual(calls,["read","write"]);
globalThis.portalLearning.expires=0;
assert.equal(learningLocal.getItem("history"),null);
assert.match(source,/portal-auth-identity/,"member type selector is present");
assert.match(source,/name="signup_type" value="student" checked/,"student is selected by default");
assert.match(source,/name="signup_type" value="alumni"/,"graduates can register");
assert.match(source,/graduation_year/,"graduates provide graduation year");
assert.match(source,/identityFields\(\)\+\s*'\<label\>이름/,"member type selector precedes full name");
assert.match(source,/member.signup_type==="alumni"/,"admins see graduate membership");
assert.match(css,/portal-auth-secondary-actions/,"login actions use responsive layout");
assert.match(css,/portal-auth-type-options/,"role choices are card-styled");
assert.match(css,/max-width:\s*420px/,"narrow screens have dedicated layout");
console.log("PASS: responsive auth, graduate registration, protected routes and learning access contracts.");
