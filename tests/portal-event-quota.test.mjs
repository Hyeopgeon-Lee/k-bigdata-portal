import assert from 'node:assert/strict';
import {getMailQuota,quotaDecision,quotaPreview,withMailQuota} from '../supabase/functions/_shared/mail-quota.mjs';
import {renderEventAnnouncement,EVENT_IMAGES} from '../supabase/functions/_shared/portal-mail.mjs';
const resets_at='2027-01-01T00:00:00Z';
const usage=(daily,monthly)=>async()=>Response.json({emails:{daily:{used:daily,limit:100,resets_at},monthly:{used:monthly,limit:3000,resets_at}}});
let q=await getMailQuota('test',usage(78,1240));assert.equal(q.available,22);assert.equal(quotaDecision(q,22).allowed,true);assert.match(quotaDecision(q,35).message,/13건 초과/);
q=await getMailQuota('test',usage(1,2999));assert.equal(q.available,1);assert.match(quotaDecision(q,2).message,/월간/);
assert.equal((await quotaPreview('test',1,async()=>new Response('',{status:403}))).allowed,false);
assert.equal((await quotaPreview('test',1,async()=>Response.json({}))).allowed,false);
let calls=[];const db={rpc:async(name)=>{calls.push(name);return {data:true,error:null}}};const old=globalThis.fetch;globalThis.fetch=usage(99,100);
try{await assert.rejects(withMailQuota(db,'test',2,()=>{throw Error('must not send')}),/초과/);assert.deepEqual(calls,['portal_mail_lock','portal_mail_unlock']);assert.equal(await withMailQuota(db,'test',1,()=>42),42);}finally{globalThis.fetch=old}
const e={id:'test',kind:'특강',title:'<script>unsafe</script>',description:'실제 학과 활동',venue:'8320',starts_at:'2026-12-12T05:00:00Z',image_url:EVENT_IMAGES.presentation,requires_registration:true,capacity:20};
const mail=renderEventAnnouncement(e);assert.match(mail.html,/project-presentation-2026.jpg/);assert.match(mail.html,/행사 상세 및 참여 신청/);assert(!mail.html.includes('<script>'));assert(!renderEventAnnouncement({...e,image_url:'https://evil.test/a.jpg'}).html.includes('evil.test'));
console.log('PASS: account daily/monthly caps, fail-closed, mutex release, real image and HTML safety');
