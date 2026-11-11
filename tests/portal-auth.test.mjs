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
assert.match(loader,/portal\.k-bigdata\.kr/,"auth gate only applies to production portal");
assert.match(loader,/import\("\.\/portal-auth\.mjs"\)/);
assert.match(css,/#portal-auth-layer\[hidden\]/,"closed dialog is hidden");
assert.doesNotMatch(loader,/data-portal-auth-lock/,"normal portal navigation cannot force login");
assert.doesNotMatch(source,/data-portal-auth-lock/,"account panel cannot hide public portal pages");
assert.match(source,/root.hidden=true; \/\/ Public portal/,"account panel starts hidden");
assert.match(source,/portal-auth-dismiss/,"all account dialogs are dismissible");
assert.match(source,/btn.textContent=currentUser\?"내 계정":"로그인"/,"guests receive optional login control");
assert.match(source,/async function activate\(interactive=false\)/,"background auth never forces a dialog");

execFileSync(process.execPath,["--check",new URL("../js/portal-auth.mjs",import.meta.url).pathname]);
console.log("PASS: auth client syntax and key security/registration/admin contracts.");
