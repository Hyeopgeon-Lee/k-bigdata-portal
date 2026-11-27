import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {canResumeUnfinishedAttempt} from '../js/practical-core.js';

const root=new URL('../',import.meta.url);
const readText=path=>readFileSync(new URL(path,root),'utf8');
const readJson=path=>JSON.parse(readText(path));

const startedAt=1_000_000;
const attempt={startedAt,submittedAt:null,viewedExplanation:false};
for(const offset of [0,30_000,60_000,360_000]) assert.equal(canResumeUnfinishedAttempt(attempt,startedAt+offset),true);
assert.equal(canResumeUnfinishedAttempt({...attempt,viewedExplanation:true},startedAt+60_000),false);
assert.equal(canResumeUnfinishedAttempt({...attempt,submittedAt:startedAt+60_000},startedAt+60_000),false);

const ui=readText('js/practical-ui.js');
assert.ok(ui.includes('정답·해설 보기'));
assert.ok(ui.includes('id="solve-hint"'));
assert.ok(ui.includes('bindReview('));
assert.doesNotMatch(ui,/HINT_SECONDS|ANSWER_SECONDS|REVEAL_SECONDS|WAIT_SECONDS|remainingSeconds|remainingAnswerSeconds|secondsUntilHint|secondsUntilAnswer|hintAvailable|answerDeadlineReached|shouldAutoReveal|autoRevealed|lateSubmittedAt|lateEditable|revealReason|hintShownAt/);
assert.ok(ui.includes('elapsedSeconds:Math.round'));
assert.ok(ui.includes('usedHint:item.usedHint'));
assert.doesNotMatch(ui,/setInterval\(updateGate|autoRevealAnswer|answerDeadlineReached\(/);
const css=readText('css/practical.css');
assert.ok(css.includes('.solve-hint'));
assert.doesNotMatch(css,/\.bank-timer|\.timeout-note/);

assert.ok(css.includes('@media(max-width:767px)'));

const base=readJson('data/practical/questions.json');
const extra=readJson('data/practical/reconstructed-extra.json');
const imported=readJson('data/practical/normalized.json').questions;
const all=[...base,...extra,...imported];
assert.equal(all.length,386);
assert.ok(all.every(q=>typeof q.hint==='string'&&q.hint.trim().length>=25));

console.log('PASS: unrestricted manual hint and answer flow; session continuity and UI contracts.');
