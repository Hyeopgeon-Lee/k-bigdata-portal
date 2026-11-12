import assert from 'node:assert/strict';
import {test} from 'node:test';
import {eligibleProfile,shouldNotify} from '../supabase/functions/certification-registration-reminder/eligibility.mjs';
const profile={approval_status:'approved',enrollment_status:'enrolled',signup_type:'student',email:'student@example.com'};
const row=(certificate_code,pass_status,verification_status='verified')=>({certificate_code,pass_status,verification_status});
test('only approved enrolled students receive reminders',()=>{
 assert.equal(eligibleProfile(profile),true);
 for(const field of ['approved','pending'])assert.equal(eligibleProfile({...profile,approval_status:field}),field==='approved');
 for(const status of ['leave','withdrawn','graduated','early_employment'])assert.equal(eligibleProfile({...profile,enrollment_status:status}),false);
 assert.equal(eligibleProfile({...profile,signup_type:'alumni'}),false);
 assert.equal(eligibleProfile({...profile,email:''}),false);
});
test('written reminder excludes written and fully certified students',()=>{
 assert.equal(shouldNotify([],'engineer','written_registration'),true);
 assert.equal(shouldNotify([row('engineer','written')],'engineer','written_registration'),false);
 assert.equal(shouldNotify([row('engineer','final')],'engineer','written_registration'),false);
 assert.equal(shouldNotify([row('industrial','written')],'engineer','written_registration'),true);
 assert.equal(shouldNotify([row('engineer','written','pending')],'engineer','written_registration'),false);
 assert.equal(shouldNotify([row('engineer','written','rejected')],'engineer','written_registration'),true);
});
test('practical notice is sent only to written passers not yet certified',()=>{
 assert.equal(shouldNotify([],'industrial','practical_registration'),false);
 assert.equal(shouldNotify([row('industrial','written')],'industrial','practical_registration'),true);
 assert.equal(shouldNotify([row('industrial','final')],'industrial','practical_registration'),false);
});
test('SQLD has single registration stage, independent of other qualifications',()=>{
 assert.equal(shouldNotify([],'sqld','registration'),true);
 assert.equal(shouldNotify([row('sqld','final')],'sqld','registration'),false);
 assert.equal(shouldNotify([row('engineer','final')],'sqld','registration'),true);
 assert.equal(shouldNotify([], 'sqld','written_registration'),false);
});
