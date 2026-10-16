import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {services} from '../js/services.js';
import {getFavorites,getRecent,toggleFavorite,recordService} from '../js/portal-personal.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html');
const css=read('css/portal-ux.css');
const homeCss=read('css/home-ui.css');
const app=read('js/app.js');
const searchUI=read('js/search-ui.js');
const dashboard=read('js/home-dashboard.js');
const shell=read('js/portal-shell.js');
const navigation=read('js/portal-ux.js');

for(const id of ['dashboard-highlights','favorite-services','recent-services','services','portal-query'])
  assert.ok(html.includes('id="'+id+'"'),id+' should exist');
for(const url of ['practical.html','interview.html','recruit.html','https://ready.k-bigdata.kr/'])
  assert.ok(html.includes('href="'+url+'"'),url+' should have a direct action');
assert.ok(html.indexOf('dashboard-action-grid') < html.indexOf('portal-search-form'),'quick actions precede search');
assert.ok(html.indexOf('portal-search-form') < html.indexOf('dashboard-highlights'),'search precedes personal panels on mobile');
assert.ok(html.indexOf('dashboard-highlights') < html.indexOf('favorite-services'),'learning precedes shortcuts');
assert.ok(html.includes('class="brand-short"') && html.includes('class="brand-full"'));
assert.ok(html.includes('role="tablist"') && html.includes('role="tabpanel"'));
assert.ok(html.includes('role="search"'));
assert.ok(html.includes('id="search-status" role="status"'));
assert.ok(!html.includes('id="service-groups" aria-live'));
assert.equal((html.match(/class="dashboard-action-favorite"/g)||[]).length,4);
assert.ok(html.includes('css/home-ui.css?v=20261016-ui-review-2'));
assert.ok(dashboard.includes('installFavoriteButtons()'));
assert.ok(dashboard.includes('renderHighlights()'));
assert.ok(homeCss.includes('.dashboard-action-grid'));
assert.ok(homeCss.includes('.service-summary'));
assert.ok(homeCss.includes('.dashboard-action-favorite'));
assert.ok(homeCss.includes('.dashboard-personal-panel[hidden]'));
assert.ok(homeCss.includes('@media(max-width:767px)'));
assert.ok(homeCss.includes('@media(max-width:1190px)'));
assert.ok(homeCss.includes('.brand-short'));
assert.ok(app.includes('class="service-summary"'));
assert.ok(dashboard.includes('showPersonalTab('));
assert.ok(searchUI.includes('form?.addEventListener("submit"'));
assert.ok(searchUI.includes('event.preventDefault()'));
assert.ok(homeCss.includes('.service-favorite'));
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
console.log('PASS: mobile-first dashboard, search, accessible tabs, compact service directory, quick favorites and local preferences.');
