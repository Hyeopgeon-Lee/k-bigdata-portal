import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const sql=read("supabase/migrations/20261116201000_help_completion_email_notifications.sql");
const edge=read("supabase/functions/help-completion-email/index.ts");
const admin=read("admin/js/help.js");

test("only newly completed, account-linked requests create email events",()=>{
 assert.match(sql,/AFTER UPDATE OF status ON public\.help_requests/);
 assert.match(sql,/OLD\.status IS DISTINCT FROM NEW\.status/);
 assert.match(sql,/NEW\.status = 'COMPLETED'/);
 assert.match(sql,/NEW\.owner_id IS NOT NULL/);
 assert.match(sql,/btrim\(NEW\.admin_reply\) = ''/);
 assert.match(sql,/HELP_COMPLETION_REPLY_REQUIRED/);
 assert.doesNotMatch(sql,/INSERT INTO public\.help_completion_email_deliveries[\s\S]*SELECT[\s\S]*FROM public\.help_requests/);
});
test("completion event log is private with limited service-role access",()=>{
 assert.match(sql,/ENABLE ROW LEVEL SECURITY/);
 assert.match(sql,/REVOKE ALL ON TABLE public\.help_completion_email_deliveries FROM PUBLIC, anon, authenticated/);
 assert.match(sql,/GRANT ALL ON TABLE public\.help_completion_email_deliveries TO service_role/);
 assert.match(sql,/ON DELETE CASCADE/);
 assert.match(sql,/status IN \('pending','sending','sent','failed','skipped'\)/);
});
test("mailer uses verified recipient and a stable idempotency key",()=>{
 assert.match(edge,/actor\.rpc\("portal_super_admin_allowed"\)/);
 assert.match(edge,/actor\.auth\.getUser\(jwt\)/);
 assert.match(edge,/service\.auth\.admin\.getUserById\(row\.recipient_id\)/);
 assert.match(edge,/email_confirmed_at/);
 assert.match(edge,/Idempotency-Key/);
 assert.match(edge,/\.eq\("attempts",row\.attempts\)/);
 assert.match(edge,/row\.status==="sent"/);
 assert.match(edge,/ticket\.status!=="COMPLETED"/);
 assert.match(edge,/RESEND_API_KEY/);
 assert.match(edge,/escape\(result\)/);
 assert.match(edge,/mailStatus:"not_queued"/);
});
test("admin completion saves the answer before attempting email, supports retry",()=>{
 const update=admin.indexOf("api.from('help_requests').update(");
 const send=admin.indexOf("else await completionMail(request,mailHint,mailButton,'send');");
 assert.ok(update>0&&send>update);
 assert.match(admin,/newStatus==='COMPLETED'&&!newReply/);
 assert.match(admin,/\.select\('id'\)\.single\(\)/);
 assert.match(admin,/mailButton\.onclick=\(\)=>void completionMail/);
 assert.match(admin,/oldStatus!=='COMPLETED'/);
 assert.match(admin,/요청자 포털 계정이 연결되지 않아/);
 assert.match(read("admin/help.html"),/data-admin-module-version="20261128-ui-1"/);
});
