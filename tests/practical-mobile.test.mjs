import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildBank,canSubmit,canReveal,remainingSeconds,remainingAnswerSeconds,hintAvailable,answerDeadlineReached,recommendFive,matchesExam,shuffle,escapeHTML,gradeAnswer} from '../js/practical-core.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const base=JSON.parse(read('data/practical/questions.json')),imported=JSON.parse(read('data/practical/normalized.json'));
const bank=buildBank([...base,...imported.questions],JSON.parse(read('data/practical/exam-history.json')));
assert.equal(bank.length,220);assert.equal(new Set(bank.map(q=>q.id)).size,220);
for(const q of bank){assert.ok(q.answer&&q.solution?.summary&&q.solution?.flow?.length>=1);if(q.sourceType==='reconstructed')assert.ok(q.history.length&&q.sources.length);if(q.originalQuestionId)assert.ok(bank.some(p=>p.id===q.originalQuestionId));}
const startedAt=100000,a={startedAt,submittedAt:null,answer:'20'};
for(const offset of [0,20000,30000,59999]){
 assert.equal(canSubmit(a,a.answer,startedAt+offset),true);
 assert.equal(hintAvailable(a,startedAt+offset),false);
}
assert.equal(hintAvailable(a,startedAt+60000),true);
assert.equal(remainingAnswerSeconds(startedAt,startedAt+60000),60);
assert.equal(canSubmit(a,a.answer,startedAt+119999),true);
assert.equal(answerDeadlineReached(a,startedAt+119999),false);
assert.equal(answerDeadlineReached(a,startedAt+120000),true);
assert.equal(canSubmit(a,a.answer,startedAt+120000),false);
assert.equal(canReveal(a,startedAt+119999),false);
assert.equal(canReveal(a,startedAt+120000),true);
assert.equal(canReveal({...a,submittedAt:startedAt+20000},startedAt+20000),true);
assert.equal(canSubmit({...a,submittedAt:startedAt+20000},'21',startedAt+60000),false);
assert.equal(canSubmit(a,'',startedAt),false);
const fake=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
globalThis.localStorage=fake();globalThis.sessionStorage=fake();
const store=await import('../js/practical-store.js');
const confirmed={...a,id:'confirmed',questionId:bank[0].id,submittedAt:startedAt+20000,elapsedSeconds:20,correct:null,viewedExplanation:false};
store.saveSession(confirmed.questionId,confirmed);store.saveAttempt(confirmed);
globalThis.sessionStorage=fake();
const resumed=store.getSession(confirmed.questionId);
assert.equal(resumed.startedAt,startedAt);assert.equal(resumed.answer,'20');assert.equal(resumed.submittedAt,startedAt+20000);
assert.equal(canReveal(resumed,startedAt+20000),true,'submitted answers reveal immediately');
assert.equal(store.getAttempts()[0].correct,null,'stored confirmation does not pre-grade outside UI');
store.saveSession(confirmed.questionId,{...a,id:'retry',questionId:confirmed.questionId,startedAt:startedAt+70000,answer:''});
assert.equal(remainingSeconds(store.getSession(confirmed.questionId).startedAt,startedAt+70000),60);
assert.equal(canReveal(store.getSession(confirmed.questionId),startedAt+70000),false);
for(const exam of ['all','engineer','industrial_engineer'])for(const language of ['all','C','Java','Python','SQL']){
 const pool=bank.filter(q=>matchesExam(q,exam,bank)&&(language==='all'||q.language===language));
 const plan=recommendFive(pool,[],'2026-10-04');
 assert.equal(plan.length,Math.min(5,pool.length));assert.equal(new Set(plan.map(q=>q.id)).size,plan.length);
 assert.deepEqual(plan,recommendFive(pool,[],'2026-10-04'));
 assert.ok(plan.every(q=>pool.includes(q)));
}
assert.deepEqual(recommendFive([],[],'2026-10-04'),[]);
assert.equal(new Set(shuffle(bank).slice(0,20).map(q=>q.id)).size,20);
assert.equal(matchesExam(bank.find(q=>q.id==='T-C-0001'),'industrial_engineer',bank),false,'variant inherits actual parent exam');
assert.equal(gradeAnswer(bank.find(q=>q.grading==='self'),'alternative SQL'),null);
assert.ok(!escapeHTML('<img src=x onerror=alert(1)>').includes('<img'));
const ui=read('js/practical-ui.js'),html=read('practical.html');
assert.match(html,/<meta name="robots" content="noindex, nofollow">/);
assert.ok(ui.includes('answerDeadlineReached(attempt,now)'));assert.ok(ui.includes('hintAvailable(attempt,now)'));assert.ok(ui.includes('autoRevealAnswer'));assert.ok(ui.includes('attempt.submittedAt&&!attempt.viewedExplanation'));assert.ok(ui.includes('correct:null'));
assert.ok(ui.includes('aliases[id]||id'));assert.ok(ui.includes('params.get("exam")'));
assert.ok(ui.includes('rel="noopener noreferrer"'));assert.ok(ui.includes('slice(0,pageLimit)'));
assert.ok(!ui.includes('첨부 데이터 516'));
assert.ok(html.includes('data-filter="language"')&&html.includes('study-header'));
console.log('PASS: immediate submit reveal, 60s hint / 120s auto-answer boundaries, persistence, retry, exam-language pools, grading, aliases, paging, noindex, escaping and links.');
