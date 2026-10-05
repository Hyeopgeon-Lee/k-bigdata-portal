import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {HINT_SECONDS,ANSWER_SECONDS,buildBank,bankStats,remainingSeconds,remainingAnswerSeconds,hintAvailable,answerDeadlineReached,canSubmit,canReveal,gradeAnswer,dailyQuestions,shuffle,summarizeAttempts,highlightCode,questionText,sourceLabels,typeLabels} from '../js/practical-core.js';
import {services} from '../js/services.js';
import {matches,searchIndex} from '../js/search.js';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
const questions=JSON.parse(read('data/practical/questions.json')),history=JSON.parse(read('data/practical/exam-history.json')),bank=buildBank(questions,history);
assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
assert.equal(new Set(history.map(h=>h.id)).size,history.length);
const instances=new Set();
for(const h of history){assert.ok(bank.some(q=>q.id===h.questionId&&q.sourceType==='reconstructed'));assert.ok(['engineer','industrial_engineer'].includes(h.examType));assert.ok(h.year>=2020&&h.year<=2026);assert.ok(h.round>=1&&h.round<=4);assert.match(h.sourceUrl,/^https:\/\//);assert.ok(h.verificationNote);const key=[h.examType,h.year,h.round,h.questionId].join(':');assert.ok(!instances.has(key));instances.add(key);}
for(const q of bank){
 for(const field of ['title','question','code','answer','explanation','hint','language','difficulty'])assert.ok(q[field],q.id+' '+field);
 assert.ok(['C','Java','Python','SQL'].includes(q.language));assert.ok(sourceLabels[q.sourceType]);assert.ok(typeLabels[q.questionType]);assert.ok(['기본','실전','고난도'].includes(q.difficulty));assert.ok(q.concepts.length&&q.steps.length>=3);
 if(q.sourceType==='reconstructed'){assert.ok(q.history.length);assert.ok(q.sources.length);assert.ok(['A','B','C'].includes(q.confidence));if(q.confidence==='B')assert.ok(new Set(q.sources.map(s=>s.url)).size>=2);}
 else {assert.equal(q.history.length,0);assert.equal(q.confidence,null);}
 if(q.sourceType==='transformed')assert.ok(bank.some(item=>item.id===q.originalQuestionId&&item.sourceType==='reconstructed'));
 for(const s of q.sources)assert.match(s.url,/^https:\/\//);
 assert.equal(gradeAnswer(q,q.answer),true);
}
assert.deepEqual(bankStats(bank),{unique:16,history:18,repeated:2,languages:{C:4,Java:2,Python:5,SQL:7},exams:{engineer:4,industrial_engineer:14}});
const repeated=buildBank(questions,[...history,{...history[0],id:'synthetic-test-only',year:2023,round:3}]);
assert.equal(bankStats(repeated).unique,16);assert.equal(bankStats(repeated).history,19);assert.equal(bankStats(repeated).repeated,3);
const startedAt=1000,attempt={startedAt,submittedAt:null};
assert.equal(HINT_SECONDS,60);assert.equal(ANSWER_SECONDS,120);
assert.equal(remainingSeconds(startedAt,1000),60);assert.equal(remainingSeconds(startedAt,60999),1);assert.equal(remainingSeconds(startedAt,61000),0);
assert.equal(remainingAnswerSeconds(startedAt,61000),60);assert.equal(remainingAnswerSeconds(startedAt,120999),1);assert.equal(remainingAnswerSeconds(startedAt,121000),0);
assert.equal(hintAvailable(attempt,startedAt+59999),false);assert.equal(hintAvailable(attempt,startedAt+60000),true);
assert.equal(answerDeadlineReached(attempt,startedAt+119999),false);assert.equal(answerDeadlineReached(attempt,startedAt+120000),true);
assert.equal(canSubmit(attempt,'8',startedAt),true);assert.equal(canSubmit(attempt,'8',startedAt+60000),true);assert.equal(canSubmit(attempt,'8',startedAt+119999),true);assert.equal(canSubmit(attempt,'8',startedAt+120000),false);assert.equal(canSubmit(attempt,' ',startedAt+60000),false);
assert.equal(canReveal(attempt,startedAt+90000),false);assert.equal(canReveal({...attempt,submittedAt:startedAt+20000},startedAt+20000),true);assert.equal(canReveal(attempt,startedAt+120000),true);
assert.equal(canSubmit({...attempt,submittedAt:startedAt+61000},'8',startedAt+62000),false);
const sql=bank.find(q=>q.grading==='self');assert.equal(gradeAnswer(sql,'different SQL'),null);assert.equal(gradeAnswer(bank[0],'incorrect'),false);
assert.equal(gradeAnswer(bank.find(q=>q.id==='R-SQL-0001'),'order, SCORE, desc'),true);
assert.equal(gradeAnswer(bank.find(q=>q.id==='T-PY-0001'),'10\n12'),true);assert.equal(gradeAnswer(bank.find(q=>q.id==='T-PY-0001'),'10 12'),false);
assert.equal(dailyQuestions(bank,'2026-10-04').length,4);assert.deepEqual(dailyQuestions(bank,'2026-10-04'),dailyQuestions(bank,'2026-10-04'));
assert.equal(new Set(shuffle(bank).map(q=>q.id)).size,bank.length);
assert.ok(matches(questionText(bank.find(q=>q.id==='R-SQL-0001')),'2022 1회 ORDER BY'));
assert.ok(!highlightCode('<script>alert(1)</script>').includes('<script>'));
assert.deepEqual(summarizeAttempts([{correct:true,elapsedSeconds:60},{correct:false,elapsedSeconds:80},{correct:null,elapsedSeconds:100}]),{total:3,correct:1,wrong:1,pending:1,rate:50,average:80});
assert.ok(services.some(s=>s.id==='practical'&&s.url==='practical.html'));
for(const term of ['실기','SQL','정보처리산업기사','오답노트'])assert.ok(searchIndex.some(s=>s.url==='practical.html'&&matches(s.text,term)));
assert.ok(read('js/certifications-ui.js').includes('실기 문제 연습'));
assert.ok(read('js/certifications-ui.js').includes('practical.html?exam='));
const html=read('practical.html');assert.match(html,/<meta name="robots" content="noindex, nofollow">/);assert.ok(!html.includes('258'));assert.ok(html.includes('value="reconstructed"'));
const ui=read('js/practical-ui.js');assert.ok(ui.includes('if(!canSubmit(attempt,answer,now))'));assert.ok(ui.includes('answerDeadlineReached(attempt,now)'));assert.ok(ui.includes('hintAvailable(attempt,now)'));assert.ok(ui.includes('autoRevealAnswer'));assert.ok(ui.includes('rel="noopener noreferrer"'));
// Storage adapter: reload continuity, attempts idempotency, blocked storage fallback.
const fake=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
globalThis.localStorage=fake();globalThis.sessionStorage=fake();
const store=await import('../js/practical-store.js');
store.saveSession('q',attempt);assert.equal(store.getSession('q').startedAt,startedAt);
const record={id:'attempt-1',questionId:'q',submittedAt:61000,elapsedSeconds:60,correct:false,answer:'test'};
store.saveAttempt(record);store.saveAttempt({...record,viewedExplanation:true});assert.equal(store.getAttempts().length,1);assert.equal(store.getAttempts()[0].viewedExplanation,true);
globalThis.localStorage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
assert.equal(store.getAttempts().length,1);store.saveAttempt({...record,id:'attempt-2'});assert.equal(store.getAttempts().length,2);assert.equal(store.storageAvailable,false);
console.log('PASS: source/history integrity, 60-second hint / 120-second answer boundaries, immediate submit reveal, grading, storage, daily/random, noindex and certificate CTA.');
