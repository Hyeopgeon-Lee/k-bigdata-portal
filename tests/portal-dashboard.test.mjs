import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {services} from '../js/services.js';
import {getFavorites,getRecent,toggleFavorite,recordService} from '../js/portal-personal.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html');
const css=read('css/portal-ux.css');
const homeCss=read('css/home-ui.css');
const alertCss=read('css/home-alerts.css');
const homeRecruit=read('js/home-recruit-alerts.js');
const app=read('js/app.js');
const searchUI=read('js/search-ui.js');
const dashboard=read('js/home-dashboard.js');
const homeSchedule=read('js/home-schedule.js');
const shell=read('js/portal-shell.js');
const navigation=read('js/portal-ux.js');

for(const id of ['home-alerts-title','home-schedule-list','home-recruit-alert-list','dashboard-highlights','favorite-services','recent-services','services','portal-query'])
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
assert.ok(html.includes('css/home-ui.css?v=20261020-balanced-grid-2'));
assert.ok(html.includes('js/home-schedule.js?v=20261020-alerts-1'));
assert.ok(html.includes('js/home-recruit-alerts.js?v=20261020-alerts-1'));
assert.ok(html.includes('css/home-alerts.css?v=20261020-alerts-1'));
assert.ok(html.includes('class="dashboard-panel dashboard-schedule home-alert-card"'));
assert.ok(html.indexOf('home-alerts-title')<html.indexOf('hero-title'),'top alerts precede hero');
assert.ok(html.indexOf('dashboard-schedule-title')<html.indexOf('dashboard-action-grid'),'schedule card precedes quick actions in DOM');
assert.ok(html.indexOf('home-recruit-alert-list')<html.indexOf('dashboard-action-grid'),'recruitment alerts are above quick actions');
assert.ok(homeCss.includes('grid-template-areas:"start schedule" "start highlights" "search personal"'));
assert.ok(homeCss.includes('grid-template-areas:"schedule" "primary" "side"'));
assert.ok(homeSchedule.includes('.slice(0,2);'),'top preview renders two calendar entries');
assert.ok(alertCss.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'desktop two-column alerts');
assert.ok(alertCss.includes('grid-template-columns:minmax(0,1fr)'),'mobile one-column alerts');
assert.ok(alertCss.includes('grid-template-areas:"start highlights" "start personal" "search search"'),'dashboard no longer reserves a schedule cell');
assert.ok(homeRecruit.includes('deadlineType==="DATE"'),'only dated recruiting entries get D-Day');
assert.ok(homeRecruit.includes('recruit.html?job='),'recruit deep link');
assert.ok(homeSchedule.includes('event.published===true'),'only published events used');
assert.ok(homeSchedule.includes('schedule.html?date='),'calendar deep link');
assert.ok(homeSchedule.includes('kbigdata:published-schedule:v1:'),'shared public cache');
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
