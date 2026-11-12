import assert from "node:assert/strict";
import {readFileSync,readdirSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {isRestrictedSignupEmail} from "../js/email-policy.mjs";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const source=read("js/portal-auth.mjs");
const loader=read("js/portal-navigation.js");
const css=read("css/portal-auth.css");

assert.match(source,/sb_publishable_[A-Za-z0-9_-]+/,"browser uses publishable API key");
assert.doesNotMatch(source,/service_role|sb_secret_[A-Za-z0-9_-]+/,"no privileged key in browser");
assert.match(source,/persistSession:true/);
assert.match(source,/autoRefreshToken:true/);
assert.match(source,/signUp\(/);
assert.match(source,/isRestrictedSignupEmail\(email\)/,"signup validates forbidden email domains");
assert.match(source,/signupEmailInput\.setCustomValidity/,"input shows a native validation error");
assert.match(source,/isRestrictedSignupEmail\(user\.email\)/,"unregistered existing school accounts cannot complete signup");
for(const email of ["student@kopo.ac.kr","teacher@kangseo.kopo.ac.kr","a@deep.campus.kopo.ac.kr","STUDENT@KOPO.AC.KR"])
 assert.equal(isRestrictedSignupEmail(email),true,email+" should be blocked");
for(const email of ["student@gmail.com","person@naver.com","person@notkopo.ac.kr","person@kopo.ac.kr.evil.test","bad-email"])
 assert.equal(isRestrictedSignupEmail(email),false,email+" should not be incorrectly blocked");
const migration=read("supabase/migrations/20261112113500_block_kopo_domain_new_signups.sql");
assert.match(migration,/before insert or update of email on auth\.users/,"direct Auth API registration is protected");
assert.match(migration,/before insert on public\.profiles/,"older profile registration RPCs are protected");

assert.match(source,/function card\(title,inner,focusTarget="#portal-auth-title"\)/,"dialog supports initial focus selector");
assert.match(source,/\$\(focusTarget\)\?\.focus\?\.\(\{preventScroll:true\}\)/,"dialog focuses selected field without scrolling");
assert.match(source,/'#portal-login-form input\[name="email"\]'\)/,"login focuses email before heading");
assert.match(source,/autocomplete="username"/,"email retains username autofill");
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
for(const page of ["my-learning","teacher-learning","room","help","mypage"])
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
for(const page of ["room","help","mypage"]){
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
assert.match(source,/name="academic_year" value="1" required/,"first-year signup choice is required");
assert.match(source,/name="academic_year" value="2" required/,"second-year signup choice is required");
assert.match(source,/gradeGroup.hidden=alumni/,"alumni do not see student grade");
assert.match(source,/data:\{full_name,student_no,signup_type,graduation_year,academic_year,mobile_phone:mobileDigits\(mobile_phone\)\}/,"signup metadata includes phone and grade");
assert.match(source,/name="mobile_phone" type="tel"/,"signup uses mobile input");
assert.match(source,/validMobile\(mobile_phone\)/,"signup validates phone before calling Auth");
assert.match(source,/register_portal_member_v4/,"phone and grade are registered using backend validation");
assert.match(source,/p_mobile_phone:/,"signup phone is passed to registration RPC");
assert.match(source,/p_academic_year:/,"both signup paths pass grade");

assert.match(source,/identityFields\(\)\+\s*'\<label\>이름/,"member type selector precedes full name");
assert.match(source,/member.signup_type==="alumni"/,"admins see graduate membership");
assert.match(source,/mailTd\.hidden=graduated/,"graduate weekly mail controls are hidden");
assert.match(source,/member\.signup_type==="alumni"\|\|\["graduated","early_employment"\]\.includes\(enrollment\.value\)/,"alumni, graduates and early-employed students are excluded from the mail UI");
assert.match(css,/\.portal-admin-table td\[hidden\]/,"hidden mail cells do not occupy mobile grid tracks");
assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,"mobile student cards use two columns");
assert.match(css,/portal-auth-secondary-actions/,"login actions use responsive layout");
assert.match(css,/portal-auth-type-options/,"role choices are card-styled");
assert.match(css,/max-width:\s*420px/,"narrow screens have dedicated layout");
// The verified profile name is displayed only by the shared account UI.
assert.match(source,/window\.portalMemberName=/,"shared profile name getter is present");
assert.match(source,/currentProfile\?\.full_name/,"display name comes from the verified profile");
assert.match(source,/portal-account-name/,"top account UI still renders the member name");
assert.doesNotMatch(source,/portal-account-email/,"account summary does not expose email as identity");
// No page body should duplicate the login name rendered by the shared header.
for(const page of ["help","room"]){
 const html=read(page+".html"),script=read("js/"+page+".js");
 assert.doesNotMatch(html,new RegExp('id="'+page+'-identity"'),page+" has no redundant body login label");
 assert.doesNotMatch(script,new RegExp(page+"-identity"),page+" does not try to populate a removed label");
 assert.match(html,new RegExp("js/"+page+"\\.js\\?v=20261112-body-login-removed-1"),page+" loads the cleaned script");
}
// Guard every service script against reintroducing a visible login identity label.
for(const file of readdirSync(new URL("../js/",import.meta.url))){
 if(!/\.(?:js|mjs)$/.test(file))continue;
 assert.doesNotMatch(read("js/"+file),/['"]로그인\s*[:：]\s*['"]\s*\+/,file+" must not inject login identity into the page body");
}
// Permanent deletion must be an explicit, status-gated server action.
execFileSync(process.execPath,["--check",new URL("../js/portal-auth.mjs",import.meta.url).pathname]);
const deletionApi=read("supabase/functions/admin-delete-student/index.ts");
assert.match(source,/renderWithdrawnDeletion/,"delete confirmation screen is present");
assert.match(source,/member.enrollment_status!=="withdrawn"/,"delete action requires saved withdrawn status");
assert.match(source,/admin-delete-student/,"delete action calls the protected backend");
assert.match(source,/confirmWord:\s*word\.value\.trim\(\)/,"explicit confirmation phrase is sent");
assert.match(deletionApi,/portal_super_admin_allowed/,"backend checks server verified admin authorization");
assert.match(deletionApi,/data\.enrollment_status!=="withdrawn"/,"backend independently checks withdrawal");
assert.match(deletionApi,/data\.signup_type==="alumni"/,"backend blocks alumni deletion");
assert.match(deletionApi,/role\.role==="super_admin"/,"backend blocks admin deletion");
assert.match(deletionApi,/confirmWord!=="영구삭제"/,"backend demands irreversible action confirmation");
assert.match(deletionApi,/admin\.auth\.admin\.deleteUser/,"backend removes Supabase Auth account");
assert.match(deletionApi,/storage\.from\("help-attachments"\)\.remove/,"backend removes student attachments");
assert.doesNotMatch(source,/SUPABASE_SERVICE_ROLE_KEY/,"browser must never have service role keys");


// Signup approval is a separate, pending-only admin queue.
const approvalApi=read("supabase/functions/approve-portal-signup/index.ts");
const approvalMigration=read("supabase/migrations/20261112082000_signup_approval_email_notifications.sql");
assert.match(source,/onClick:renderApprovalRequests/,"account menu links to separate approval queue");
assert.match(source,/filter\(member=>member\.approval_status==="pending"\)/,"approval screen shows pending requests only");
assert.match(source,/filter\(member=>member\.approval_status!=="pending"\)/,"student manager hides pending requests");
assert.match(source,/approve-portal-signup/,"approval goes through protected server API");
assert.match(source,/retryApprovalEmail/,"approval email can be retried if delivery failed");
assert.match(approvalApi,/portal_super_admin_allowed/,"backend authorizes actual super admin");
assert.match(approvalApi,/email_confirmed_at/,"backend requires verified applicant email");
assert.match(approvalApi,/admin_update_student/,"backend uses existing authorized approval RPC");
assert.match(approvalApi,/Idempotency-Key/,"Resend retries use duplicate protection");
assert.match(approvalApi,/noreply@noreply\.k-bigdata\.kr/,"uses verified sender domain");
assert.match(approvalApi,/https:\/\/api\.resend\.com\/emails/,"uses Resend transactional API");
assert.match(approvalApi,/notificationStatus:"failed"/,"mail failures are reported separately from account approval");
assert.match(approvalMigration,/enable row level security/,"approval email log has RLS");
assert.match(approvalMigration,/revoke all .* from anon, authenticated/,"browser clients cannot read email delivery records");
assert.match(css,/portal-approval-item/,"approval queue has dedicated mobile cards");

console.log("PASS: responsive auth, protected routes and verified display names across portal.");
