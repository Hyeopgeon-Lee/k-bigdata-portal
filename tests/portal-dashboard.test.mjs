import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {services} from '../js/services.js';
import {getFavorites,getRecent,toggleFavorite,recordService} from '../js/portal-personal.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html');
const css=read('css/portal-ux.css');
const dashboard=read('js/home-dashboard.js');
const shell=read('js/portal-shell.js');
const navigation=read('js/portal-ux.js');

for(const id of ['dashboard-highlights','favorite-services','recent-services','services','portal-query'])
  assert.ok(html.includes('id="'+id+'"'),id+' should exist');
for(const url of ['practical.html','interview.html','recruit.html','https://ready.k-bigdata.kr/'])
  assert.ok(html.includes('href="'+url+'"'),url+' should have a direct action');
assert.ok(html.indexOf('dashboard-highlights') < html.indexOf('portal-query'),'dashboard precedes search');
assert.ok(dashboard.includes('installFavoriteButtons()'));
assert.ok(dashboard.includes('renderHighlights()'));
assert.ok(css.includes('.dashboard-action-grid'));
assert.ok(css.includes('.service-favorite'));
assert.ok(css.includes('.portal-nav-compact'));
assert.ok(navigation.includes('portal-nav-more'));
assert.ok(shell.includes('initRecentTracking()'));
assert.ok(services.some(s=>s.id==='recruit'&&s.url==='recruit.html'));

const data=new Map();
globalThis.localStorage={
  getItem:key=>data.get(key)||null,
  setItem:(key,value)=>data.set(key,value),
  removeItem:key=>data.delete(key)
};
assert.deepEqual(getFavorites(),[]);
assert.deepEqual(getRecent(),[]);
assert.equal(toggleFavorite('practical'),true);
assert.deepEqual(getFavorites(),['practical']);
assert.equal(toggleFavorite('practical'),false);
assert.deepEqual(getFavorites(),[]);
assert.equal(toggleFavorite('nonexistent'),false);
recordService('practical');recordService('interview');recordService('practical');
assert.deepEqual(getRecent(),['practical','interview']);
data.set('kbigdata-portal-ui-v1','{broken-json');
assert.deepEqual(getFavorites(),[],'corrupt preferences fall back safely');
assert.deepEqual(getRecent(),[],'corrupt visit history falls back safely');
console.log('PASS: phase 1+2 dashboard, quick actions, favorites, recents, compact menu and safe local preferences.');
