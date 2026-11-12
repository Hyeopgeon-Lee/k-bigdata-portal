import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {portalPages,navigationItems} from '../js/portal-navigation-model.mjs';
import {services} from '../js/services.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page=read('room.html');
const logic=read('js/room.js');
const css=read('css/room.css');
const room=services.find(s=>s.id==='room');
assert.equal(room?.url,'room.html','room service is now in the portal');
assert.equal(portalPages.room?.group,'campus');
assert.equal(portalPages.room?.locked,true,'booking requires portal login');
assert.equal(navigationItems.find(i=>i.id==='room')?.url,'room.html');

assert.match(page,/id="learning-lock"/);
assert.match(page,/id="learning-notice"/);
assert.match(page,/portal-loading-appear/);
assert.match(page,/src="js\/portal-auth\.mjs/);
assert.match(page,/data-module="js\/room\.js/);
assert.match(page,/id="room-booking-form"/);
assert.match(page,/data-room-tab="mine"/);
assert.match(page,/id="room-admin-tab"/);
assert.match(page,/name="room_code"/);
assert.doesNotMatch(page,/name="pin"/i);
assert.doesNotMatch(page,/https:\/\/room\.k-bigdata\.kr/);
assert.ok(page.includes('8318')&&page.includes('8319'));

assert.match(logic,/portalSupabaseClient/);
assert.match(logic,/portalLearning\?\.write/);
assert.match(logic,/portal_super_admin_allowed/);
assert.match(logic,/room_schedule/);
assert.match(logic,/from\('room_reservations'\)/);
assert.match(logic,/eq\('owner_id',person\.id\)/);
assert.match(logic,/update\(\{status:'CANCELLED'\}\)/);
assert.match(logic,/data-room-option/);
assert.doesNotMatch(logic,/script\.google\.com/);
assert.doesNotMatch(logic,/service_role|sb_secret_/);
assert.doesNotMatch(logic,/innerHTML/,'student-supplied content must be DOM text only');
assert.match(css,/max-width:700px/,'responsive UI');
assert.match(css,/\.room-hero,\.room-layout\{max-width:var\(--container,1240px\)\}/,
  'room hero and reservation panels share the portal 1240px container');
assert.doesNotMatch(css,/\.room-layout\{max-width:1050px\}/,'legacy narrow room layout removed');
assert.match(page,/css\/room\.css\?v=20261112-room-wide-1/,
  'updated room CSS asset referenced');


for(const [id,definition] of Object.entries(portalPages)){
 if(!definition.group)continue;
 const html=read(id+'.html');
 assert.match(html,/href="room\.html" data-nav-id="room"/,'campus navigation '+id);
 assert.doesNotMatch(html,/href="https:\/\/room\.k-bigdata\.kr\/" data-nav-id="room"/,'no legacy room link '+id);
}
console.log('PASS: project room login, reservation flow, admin controls, responsive UI and shared portal navigation.');
