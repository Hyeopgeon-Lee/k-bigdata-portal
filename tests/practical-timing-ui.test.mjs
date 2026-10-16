import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  HINT_SECONDS,ANSWER_SECONDS,remainingSeconds,remainingAnswerSeconds,
  hintAvailable,answerDeadlineReached,canSubmit,canReveal
} from '../js/practical-core.js';

const root=new URL('../',import.meta.url);
const readText=path=>readFileSync(new URL(path,root),'utf8');
const readJson=path=>JSON.parse(readText(path));

assert.equal(HINT_SECONDS,30);
assert.equal(ANSWER_SECONDS,60);
const startedAt=1_000_000;
const attempt={startedAt,submittedAt:null,viewedExplanation:false};
assert.equal(remainingSeconds(startedAt,startedAt),30);
assert.equal(hintAvailable(attempt,startedAt+29_999),false);
assert.equal(hintAvailable(attempt,startedAt+30_000),true);
assert.equal(remainingAnswerSeconds(startedAt,startedAt+30_000),30);
assert.equal(canSubmit(attempt,'answer',startedAt),true);
assert.equal(canSubmit(attempt,'answer',startedAt+59_999),true);
assert.equal(canSubmit(attempt,'answer',startedAt+60_000),false);
assert.equal(answerDeadlineReached(attempt,startedAt+59_999),false);
assert.equal(answerDeadlineReached(attempt,startedAt+60_000),true);
assert.equal(canReveal(attempt,startedAt+59_999),false);
assert.equal(canReveal(attempt,startedAt+60_000),true);
assert.equal(canReveal({...attempt,submittedAt:startedAt+15_000},startedAt+15_000),true);
const late={...attempt,autoRevealed:true,submittedAt:startedAt+60_000,viewedExplanation:true};
assert.equal(canSubmit(late,'late answer',startedAt+90_000),true);
assert.equal(canSubmit({...late,lateSubmittedAt:startedAt+90_000},'another',startedAt+95_000),false);

const ui=readText('js/practical-ui.js');
assert.ok(ui.includes('답 제출하고 풀이 보기'));
assert.ok(ui.includes('id="solve-hint"'));
assert.ok(ui.includes('hintAvailable(attempt,now)'));
assert.ok(ui.includes('answerDeadlineReached(attempt,now)'));
assert.ok(ui.includes('function autoRevealAnswer'));
assert.ok(ui.includes('revealAnswer("submitted",now)'));
assert.ok(ui.includes('revealAnswer("timeout",now)'));
assert.ok(ui.includes('usedHint:true'));
assert.ok(ui.includes('autoRevealed:true'));
assert.ok(!ui.includes('id="reveal-answer"'));
assert.ok(!ui.includes('60초 이후 풀이·정답을 확인하세요'));

const css=readText('css/practical.css');
assert.ok(css.includes('.solve-hint'));
assert.ok(css.includes('.bank-timer.hint-stage'));
assert.ok(css.includes('.timeout-note'));
assert.ok(css.includes('@media(max-width:767px)'));

const base=readJson('data/practical/questions.json');
const extra=readJson('data/practical/reconstructed-extra.json');
const imported=readJson('data/practical/normalized.json').questions;
const all=[...base,...extra,...imported];
assert.equal(all.length,386);
assert.ok(all.every(q=>typeof q.hint==='string'&&q.hint.trim().length>=25));

console.log('PASS: immediate submit reveal, 30s hint, 60s automatic answer/explanation reveal, mobile styling, and full hint coverage.');
