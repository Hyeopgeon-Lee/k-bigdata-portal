import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {portalPages,navigationItems} from '../js/portal-navigation-model.mjs';
import {services} from '../js/services.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page=read('room.html');
const logic=read('js/room.js');
const adminPage=read('admin/rooms.html'),adminLogic=read('admin/js/rooms.js');
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
assert.match(page,/id="room-duration-hint"/,'inline duration guidance displayed beside time fields');
assert.match(page,/id="room-booking-feedback" class="room-booking-feedback" role="alert"/,'reservation errors announced immediately before submit');
assert.match(page,/20261114-booking-feedback-1/,'page busts reservation JS and CSS caches');
assert.match(page,/data-room-tab="mine"/);
assert.doesNotMatch(page,/id="room-admin-tab"/,'student page has no admin tab');
assert.match(adminPage,/id="admin-room-list"/,'administrator-only full booking list');
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
assert.match(adminLogic,/admin_list_students/,'admin profiles queried only inside admin page');
assert.doesNotMatch(logic,/room-admin-list/,'admin reservation list removed from user JS');
assert.match(logic,/data-room-option/);
assert.match(logic,/function bookingValidation\(form\)/);
assert.match(logic,/minutes>180/,'reservations over 3 hours are rejected before insert');
assert.match(logic,/bookingNotice\(check\.message\)/,'invalid input is explained at submit');
assert.match(logic,/form\.elements\[name\]\.addEventListener\('change',refreshDurationHint\)/,'live duration feedback on selection changes');
assert.match(logic,/fillTimeSelect\(form\.elements\.end,true\)/,'22:00 is available as an end time');
assert.match(css,/\.room-booking-feedback\[hidden\]/,'hidden status messages are not displayed');
assert.doesNotMatch(logic,/script\.google\.com/);
assert.doesNotMatch(logic,/service_role|sb_secret_/);
assert.doesNotMatch(logic,/innerHTML/,'student-supplied content must be DOM text only');
assert.match(css,/max-width:700px/,'responsive UI');
assert.match(css,/\.room-hero,\.room-layout\{max-width:var\(--container,1240px\)\}/,
  'room hero and reservation panels share the portal 1240px container');
assert.doesNotMatch(css,/\.room-layout\{max-width:1050px\}/,'legacy narrow room layout removed');
assert.match(page,/css\/room\.css\?v=20261114-booking-feedback-1/,
  'updated room CSS asset referenced');


for(const [id,definition] of Object.entries(portalPages)){
 if(!definition.group)continue;
 const html=read(id+'.html');
 assert.match(html,/href="room\.html" data-nav-id="room"/,'campus navigation '+id);
 assert.doesNotMatch(html,/href="https:\/\/room\.k-bigdata\.kr\/" data-nav-id="room"/,'no legacy room link '+id);
}
console.log('PASS: project room login, reservation flow, admin controls, responsive UI and shared portal navigation.');
