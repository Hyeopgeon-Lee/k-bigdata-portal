import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {services} from '../js/services.js';
import {getFavorites,getRecent,toggleFavorite,recordService} from '../js/portal-personal.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const home=read('index.html'),directory=read('services.html');
const dashboard=read('js/home-dashboard.js');
const directoryJS=read('js/directory.js');
const css=read('css/home-refresh.css');
const shell=read('js/portal-shell.js');
const searchUI=read('js/search-ui.js');

const requiredHomeIds=['hero-title','hero-description','home-grade-status','portal-query','search-results',
  'dashboard-start-title','home-today','home-today-primary','home-today-progress','home-today-list',
  'home-schedule-list','home-recruit-alert-list','favorite-services','recent-services','services'];
for(const id of requiredHomeIds)assert.ok(home.includes('id="'+id+'"'),'home '+id);
assert.ok(home.indexOf('id="portal-query"')<home.indexOf('class="dashboard-action-grid"'),'search first');
assert.ok(home.indexOf('class="dashboard-action-grid"')<home.indexOf('id="home-today"'),'quick actions before daily plan');
assert.ok(home.indexOf('id="home-today"')<home.indexOf('id="home-alerts-title"'),'daily plan before schedule');
assert.ok(home.indexOf('id="services"')<home.indexOf('id="home-alerts-title"'),'school schedule follows the service directory shortcuts');
assert.ok(!home.includes('id="service-groups"'),'full catalogue no longer rendered on home');
assert.ok(!home.includes('dashboard-highlights'),'redundant continuation panel is removed');
assert.ok(home.includes('학과 주요 일정'),'clear academic section title');
assert.ok(!home.includes('놓치지 마세요'),'ambiguous mid-page notice title removed');
assert.ok(!home.includes('home-practical-card'),'duplicate practical card is removed');
assert.ok(home.includes('data-home-grade="1"')&&home.includes('data-home-grade="2"'));
assert.ok(home.includes('class="dashboard-personal-tabs" role="tablist"'));
assert.ok(home.includes('css/home-refresh.css'));
assert.ok(!home.includes('놓치지 마세요'),'outdated notice heading must not return');
assert.ok(home.includes('id="home-alerts-title" class="home-alerts-title">학과 주요 일정'),'schedule section has explicit title');
assert.ok(home.includes('class="home-see-all" href="schedule.html"'),'schedule link is in section heading');
assert.ok(css.includes('.home-alerts .home-alerts-header{display:flex;flex-direction:row;align-items:flex-start'),'schedule header stays in one row');
assert.ok(css.includes('.home-alerts .home-alerts-title{display:block;margin:0;font-size:20px;line-height:1.4;text-align:left'),'schedule heading stays left aligned');
assert.ok(css.includes('.home-alerts .dashboard-schedule-empty{padding:12px 14px'),'empty state is compact');
assert.ok(home.includes('js/home-dashboard.js?v='));
assert.ok(home.includes('js/home-engagement.js?v='));
assert.ok(home.includes('js/home-schedule.js?v='));
assert.ok(home.includes('js/home-recruit-alerts.js?v='));
assert.ok(home.includes('role="search"'));
assert.ok(home.includes('href="services.html"'));
for(const group of ['learning','career','project','campus'])
  assert.ok(home.includes('href="services.html#'+group+'"'),group+' category shortcut');
assert.ok(dashboard.includes('actions:["coding","practical","certifications","docs"]'),'1st-year launcher');
assert.ok(dashboard.includes('actions:["recruit","apply","interview","ready"]'),'2nd-year launcher');
assert.ok(dashboard.includes('kbigdata:home-grade:v1'),'local grade setting is preserved');
assert.ok(dashboard.includes('renderQuickActions()'));
assert.ok(dashboard.includes('renderPersonal()'));
assert.ok(dashboard.includes('chooseGrade('));
assert.ok(dashboard.includes('kbigdata:home-gradechange'));
assert.ok(css.includes('@media(max-width:640px)'),'mobile launcher');
assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'mobile cards');
assert.ok(css.includes('home-category-grid'),'four categories');
assert.ok(directory.includes('id="service-groups"'));
assert.ok(directory.includes('id="directory-query"'));
assert.ok(directory.includes('id="directory-status" role="status"'));
assert.ok(directory.includes('id="directory-favorites-list"'));
assert.ok(directory.includes('id="student-journey"'));
assert.ok(directoryJS.includes('toggleFavorite('));
assert.ok(directoryJS.includes('getFavorites()'));
assert.ok(directoryJS.includes('service.url'));
assert.ok(shell.includes('initRecentTracking()'));
assert.ok(searchUI.includes('event.preventDefault()'));
assert.equal(services.length,18,'the complete service registry is retained');
assert.equal(services.find(s=>s.id==='practical').name,'정보처리 기출문제');
assert.equal(services.find(s=>s.id==='ncp').name,'NCP 기출문제');
const store=new Map();
globalThis.localStorage={
 getItem:key=>store.get(key)||null,
 setItem:(key,value)=>store.set(key,value),
 removeItem:key=>store.delete(key)
};
assert.deepEqual(getFavorites(),[]);
assert.deepEqual(getRecent(),[]);
assert.equal(toggleFavorite('practical'),true);
assert.deepEqual(getFavorites(),['practical']);
assert.equal(toggleFavorite('practical'),false);
recordService('practical');recordService('interview');recordService('practical');
assert.deepEqual(getRecent(),['practical','interview']);
store.set('kbigdata-portal-ui-v1','{broken-json');
assert.deepEqual(getFavorites(),[],'broken device state handled safely');
console.log('PASS: simplified launcher, grade dashboard, separate 18-service directory, exam labels, search and device-only favorites.');
