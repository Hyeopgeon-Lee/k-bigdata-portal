import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {codingIndex} from '../data/coding-index.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
test('index generator produces all source questions with no missing or overlapping details',()=>{
 execFileSync(process.execPath,['scripts/build-learning-indexes.mjs','--check'],{cwd:new URL('../',import.meta.url)});
 assert.equal(codingIndex.length,350);
 assert.equal(new Set(codingIndex.map(q=>q.id)).size,350);
 const {bank}=json('data/practical/indexed/index.json');
 assert.equal(bank.length,386);
 const details=['c','java','python','sql'].flatMap(l=>json('data/practical/indexed/'+l+'.json'));
 assert.deepEqual(new Set(details.map(q=>q.id)),new Set(bank.map(q=>q.id)));
 assert.equal(details.length,bank.length);
 assert.ok(read('data/practical/indexed/index.json').length<read('data/practical/normalized.json').length);
});
test('single auth module and database-owned permissions',()=>{
 const auth=read('js/portal-auth.mjs'),sql=read('supabase/migrations/20261127214258_portal_perf_bootstrap_and_shared_calendar.sql');
 assert.match(auth,/rpc\("portal_bootstrap"\)/);
 assert.match(sql,/security invoker/);
 assert.match(sql,/s\.revoked_at is null and s\.expires_at>now\(\)/);
 assert.match(sql,/public\.portal_super_admin_allowed\(\)/);
 assert.match(sql,/revoke all on function public\.portal_bootstrap\(\) from public,anon/);
 assert.match(read('admin/js/guard.mjs'),/context\.isAdmin!==true/);
 assert.match(read('js/portal-navigation.js'),/portal-auth\.mjs\?v=20261128-performance-1/);
});
test('shared written read model and personal overview stay scoped',()=>{
 const sql=read('supabase/migrations/20261127215042_portal_perf_shared_written_read_model.sql');
 assert.match(sql,/security_invoker=true/);
 assert.match(sql,/NOT_AUTHORIZED/);
 const own=read('supabase/migrations/20261127215500_portal_perf_my_learning_overview.sql');
 assert.equal((own.match(/user_id=\(select auth\.uid\(\)\)/g)||[]).length,3);
 assert.match(own,/limit 35/);
 assert.doesNotMatch(own,/answer_text/);
 assert.match(read('js/written-exam-ui.mjs'),/query=query\.gte\("attempted_at",remoteCursor\)/);
});
