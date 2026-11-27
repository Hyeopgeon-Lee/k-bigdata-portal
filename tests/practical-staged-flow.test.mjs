import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {canResumeUnfinishedAttempt} from '../js/practical-core.js';

const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

const startedAt=1_000_000;
const attempt={startedAt,submittedAt:null,viewedExplanation:false};
for(const offset of [0,30_000,60_000,360_000]) assert.equal(canResumeUnfinishedAttempt(attempt,startedAt+offset),true);
assert.equal(canResumeUnfinishedAttempt({...attempt,viewedExplanation:true},startedAt+60_000),false);
assert.equal(canResumeUnfinishedAttempt({...attempt,submittedAt:startedAt+60_000},startedAt+60_000),false);

const ui=read('js/practical-ui.js');
const css=read('css/practical.css');
const html=read('practical.html');

assert.ok(ui.includes('정답·해설 보기'));
assert.ok(ui.includes('id="solve-hint"'));
assert.ok(ui.includes('bindReview('));
assert.doesNotMatch(ui,/HINT_SECONDS|ANSWER_SECONDS|REVEAL_SECONDS|WAIT_SECONDS|remainingSeconds|remainingAnswerSeconds|secondsUntilHint|secondsUntilAnswer|hintAvailable|answerDeadlineReached|shouldAutoReveal|autoRevealed|lateSubmittedAt|lateEditable|revealReason|hintShownAt/);
assert.ok(ui.includes('get elapsedSeconds()'));
assert.ok(ui.includes('usedHint:item.usedHint'));
assert.doesNotMatch(ui,/setInterval\(updateGate|autoRevealAnswer|answerDeadlineReached\(/);
assert.match(html,/css\/practical\.css\?v=[\w-]+/);
assert.match(html,/js\/practical-ui\.js\?v=[\w-]+/);

console.log('PASS: unrestricted manual hint and answer flow; session continuity and UI contracts.');
