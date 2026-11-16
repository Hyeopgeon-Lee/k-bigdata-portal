import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {isStaleSession,studyActionButton,describeStudyError} from '../js/study-session-state.mjs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const session=(started_at)=>({status:'active',started_at});
test('stale detection allows an overnight session without cutting off at midnight',()=>{
 const started='2026-11-15T14:30:00Z'; // 23:30 in Seoul
 assert.equal(isStaleSession(session(started),Date.parse('2026-11-15T17:00:00Z')),false);
 assert.equal(isStaleSession(session(started),Date.parse('2026-11-15T20:31:00Z')),true);
 assert.equal(isStaleSession(session('2026-11-16T00:00:00Z'),Date.parse('2026-11-16T12:01:00Z')),true);
 assert.equal(isStaleSession({...session(started),status:'completed'},Date.now()),false);
});
test('start and resume both target the same primary control',()=>{
 assert.equal(studyActionButton('start'),'study-session-primary');
 assert.equal(studyActionButton('restart'),'study-session-primary');
 assert.equal(studyActionButton('resume'),'study-session-primary');
 assert.equal(studyActionButton('pause'),'study-pause');
});
test('display precise common errors without disclosing backend details',()=>{
 assert.match(describeStudyError({code:'42501',status:403}).message,/권한/);
 assert.match(describeStudyError({message:'Failed to fetch'}).message,/인터넷/);
 assert.match(describeStudyError({code:'STUDY_TIMEOUT'}).message,/지연/);
});
test('study UI reconciles server state and never silently reuses abandoned timers',()=>{
 const src=read('js/study.js'),html=read('study.html'),auth=read('js/portal-auth.mjs');
 assert.match(src,/study_restart_stale_session/);
 assert.match(src,/isStaleSession\(active\)/);
 assert.match(src,/await load\(\)/);
 assert.match(src,/sessionBusy/);
 assert.match(src,/study_report_client_error/);
 assert.match(src,/Promise\.race/);
 assert.match(html,/id="study-action-note"/);
 assert.match(auth,/if\(error\)\{console\.warn\("Portal access recheck deferred"/);
 assert.doesNotMatch(auth,/checkLearning\(\)\.catch\(resetLearning\)/);
});
test('faculty dashboard has review controls and server-side protected diagnostics',()=>{
 const html=read('admin/learning.html'),js=read('js/study-diagnostics.js');
 const migration=read('supabase/migrations/20261116095000_study_session_recovery_and_admin_diagnostics.sql');
 for(const id of ['study-diagnostics-status','study-diagnostics-stale','study-diagnostics-reviews','study-diagnostics-errors'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(js,/study_admin_diagnostics/);
 assert.match(js,/study_admin_review_session/);
 assert.match(js,/study_admin_flag_stale_session/);
 assert.match(migration,/private\.portal_study_write_allowed\(\)/);
 assert.match(migration,/public\.portal_super_admin_allowed\(\)/);
 assert.match(migration,/ENABLE ROW LEVEL SECURITY/);
 assert.match(migration,/REVOKE ALL ON FUNCTION public\.study_admin_review_session/);
});
