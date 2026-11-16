import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const auth=read('js/portal-auth.mjs'),study=read('js/study.js'),activity=read('js/learning-activity.mjs');
const cal=read('supabase/functions/public-calendar-cache/index.ts');
const alumni=read('supabase/functions/alumni-network-api/index.ts');
const sql=read('supabase/migrations/20261116213000_portal_50_user_health_and_indexes.sql');
const admin=read('admin/index.html');

test('auth checks are throttled without weakening server authorization',()=>{
 assert.match(auth,/MIN_ACCESS_CHECK_SPACING_MS=60000/);
 assert.match(auth,/portalVerifiedUserId=user\.id/);
 assert.match(auth,/client\.rpc\("portal_learning_access"\)/);
 assert.match(auth,/window\.portalVerifiedUserId=null/);
 assert.match(study,/portalVerifiedUserId/);
 for(const p of ['js/portal-personal.js','js/home-engagement.js','js/learning-activity.mjs'])
  assert.match(read(p),/portalVerifiedUserId/,p);
 const nav=read('js/portal-navigation.js');
 assert.match(nav,/portal-auth\.mjs\?v=20261116-concurrency-1/);
 for(const p of ['study.html','help.html','admin/index.html'])
  assert.match(read(p),/portal-auth\.mjs\?v=20261116-concurrency-1/);
});
test('home, directory and shared shell reuse one personal-state singleton',()=>{
 const files=['js/portal-shell.js','js/home-dashboard.js','js/directory.js'];
 const modules=files.map(p=>read(p).match(/\.\/portal-personal\.js\?v=[a-zA-Z0-9-]+/)?.[0]);
 assert.ok(modules.every(Boolean),'personal module imported everywhere');
 assert.equal(new Set(modules).size,1,'browser must not instantiate duplicate personal state');
 assert.match(read('index.html'),/home-dashboard\.js\?v=20261116-concurrency-2/);
 assert.match(read('services.html'),/directory\.js\?v=20261116-concurrency-2/);
});
test('learning writes are batched, idempotent and cross-tab serialized',()=>{
 assert.match(activity,/LEARNING_BATCH_SIZE=25/);
 assert.match(activity,/ignoreDuplicates:true/);
 assert.match(activity,/onConflict:'user_id,client_attempt_id'/);
 assert.match(activity,/navigator\?\.locks\?\.request/);
 assert.match(activity,/learningRetryDelay/);
 assert.match(activity,/if\(items\.length>500\)throw/);
 assert.doesNotMatch(activity,/\.insert\(record\)/);
 assert.match(activity,/window\.addEventListener\('storage'/);
});
test('published calendar uses coalesced server-to-server cache',()=>{
 assert.match(cal,/const FRESH_MS=5\*60\*1000/);
 assert.match(cal,/let inFlight:Promise<Snapshot>\|null=null/);
 assert.match(cal,/e\.published!==true/);
 assert.match(cal,/allowedCategories/);
 assert.match(cal,/request\.method!=="GET"/);
 for(const p of ['js/schedule.js','js/home-schedule.js'])
  assert.match(read(p),/\/functions\/v1\/public-calendar-cache/);
 assert.match(read('js/schedule.js'),/force\?await readPublishedSchedules/);
});
test('published alumni list cache never caches personal/administrator responses',()=>{
 assert.match(alumni,/const PUBLIC_CACHEABLE=new Set\(\["list","home","jobs","newsList","careerPublic"\]\)/);
 assert.match(alumni,/const CACHE_MS=30000/);
 assert.match(alumni,/publishedInFlight/);
 assert.match(alumni,/admin\.from\("alumni_profiles"\)/);
});
test('health is admin-only and RLS protected, with targeted FK indexes',()=>{
 assert.match(sql,/IF NOT public\.portal_super_admin_allowed\(\)/);
 assert.match(sql,/REVOKE ALL ON FUNCTION public\.portal_admin_health_summary\(\) FROM PUBLIC,anon/);
 assert.match(sql,/private\.portal_academic_status_history ENABLE ROW LEVEL SECURITY/);
 for(const key of ['help_attachments_uploader_idx','help_messages_author_idx','portal_academic_history_user_idx'])
  assert.ok(sql.includes(key));
 assert.match(admin,/id="admin-monitor-metrics"/);
 assert.match(read('admin/js/dashboard.js'),/portal_admin_health_summary/);
});
test('staging load test refuses the production portal and project',()=>{
 const code=read('tests/load/staging-50-users.js');
 assert.match(code,/portal\.k-bigdata\.kr/);
 assert.match(code,/zjsindkakjfzmjgrkaou/);
 assert.match(code,/STAGING_USERS_JSON/);
 assert.match(code,/learning_attempts/);
 assert.match(code,/portal_learning_access/);
 const workflow=read('.github/workflows/staging-50-users.yml');
 assert.match(workflow,/workflow_dispatch/);
 assert.match(workflow,/confirm_staging_only/);
});
