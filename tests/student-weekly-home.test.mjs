import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {weeklyReportWindow,weeklyReportEligible,mountWeeklyReportCard} from '../js/home-weekly-report.mjs';
const ms=s=>Date.parse(s);
const opens=ms('2026-11-30T00:00:00Z'),closes=ms('2026-11-30T15:00:00Z');
for(const [now,visible] of [['2026-11-29T23:59:59.999Z',false],['2026-11-30T00:00:00Z',true],['2026-11-30T14:59:59.999Z',true],['2026-11-30T15:00:00Z',false],['2026-12-03T08:00:00Z',false],['2026-11-29T14:59:59Z',false]])assert.equal(weeklyReportWindow(ms(now)).visible,visible,now);
const window=weeklyReportWindow(opens);
assert.equal(window.weekStart,'2026-11-23');assert.equal(window.weekEnd,'2026-11-29');assert.equal(window.period,'11월 23일 ~ 11월 29일');
assert.equal(weeklyReportWindow(opens-1).next,opens);assert.equal(window.next,closes);assert.equal(weeklyReportWindow(closes).next,opens+7*86400000);
const year=weeklyReportWindow(ms('2027-01-04T00:00:00Z'));
assert.equal(year.weekStart,'2026-12-28');assert.equal(year.weekEnd,'2027-01-03');assert.equal(year.period,'2026년 12월 28일 ~ 2027년 1월 3일');
const base={user:{id:'fixture'},isAdmin:false,profile:{signup_type:'student',approval_status:'approved',enrollment_status:'enrolled',academic_year:1}};
const access={read:true,write:true,expires:opens+86400000};
assert.equal(weeklyReportEligible(base,access,opens),true);
assert.equal(weeklyReportEligible({...base,profile:{...base.profile,academic_year:'2'}},access,opens),true);
for(const context of [null,{...base,isAdmin:true},{...base,profile:{...base.profile,signup_type:'alumni'}},{...base,profile:{...base.profile,approval_status:'pending'}},...['graduated','leave','early_employment','withdrawn'].map(enrollment_status=>({...base,profile:{...base.profile,enrollment_status}})),{...base,profile:{...base.profile,academic_year:null}}])assert.equal(weeklyReportEligible(context,access,opens),false);
assert.equal(weeklyReportEligible(base,{...access,write:false},opens),false);
assert.equal(weeklyReportEligible(base,{...access,expires:opens},opens),false);
// Verify UI updates on the exact boundary, with no reload or server requests.
const originalNow=Date.now;
let now=opens-1,timer,eventHandlers=new Map(),docHandlers=new Map();
const card={hidden:true},period={textContent:''},link={href:'weekly-report.html'};
const fakeDoc={getElementById:id=>({'home-weekly-report':card,'home-weekly-report-period':period,'home-weekly-report-link':link})[id],addEventListener:(k,v)=>docHandlers.set(k,v),removeEventListener:k=>docHandlers.delete(k)};
const fakeWin={portalVerifiedContext:base,portalLearning:access,setTimeout:(fn,delay)=>{timer={fn,delay};return 1},clearTimeout:()=>{},addEventListener:(k,v)=>eventHandlers.set(k,v),removeEventListener:k=>eventHandlers.delete(k)};
try{
 Date.now=()=>now;const mounted=mountWeeklyReportCard(fakeDoc,fakeWin);
 assert.equal(card.hidden,true);assert.equal(timer.delay,1);
 now=opens;timer.fn();assert.equal(card.hidden,false);assert.equal(link.href,'weekly-report.html?week=2026-11-23');assert.equal(period.textContent,'11월 23일 ~ 11월 29일 학습 리포트');
 now=closes-1;docHandlers.get('visibilitychange')();assert.equal(card.hidden,false);assert.equal(timer.delay,1);
 now=closes;timer.fn();assert.equal(card.hidden,true);
 now=opens;fakeWin.portalVerifiedContext=null;eventHandlers.get('portal-learning-ready')();assert.equal(card.hidden,true);
 mounted.dispose();assert.equal(eventHandlers.size,0);assert.equal(docHandlers.size,0);
}finally{Date.now=originalNow}
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.ok(html.indexOf('class="dashboard-intro')<html.indexOf('id="home-weekly-report"'));
assert.ok(html.indexOf('id="home-weekly-report"')<html.indexOf('class="portal-search"'));
assert.match(html,/id="home-weekly-report"[^>]*hidden>/);
const src=readFileSync(new URL('../js/home-weekly-report.mjs',import.meta.url),'utf8');assert.doesNotMatch(src,/fetch\(|\.rpc\(|\.functions\.invoke/);
console.log('PASS: Monday KST boundaries, previous-week link, year rollover, enrollment and session expiry, dynamic show/hide without API calls.');
