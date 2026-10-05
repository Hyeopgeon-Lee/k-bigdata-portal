import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  HINT_SECONDS,ANSWER_SECONDS,remainingSeconds,remainingAnswerSeconds,
  hintAvailable,answerDeadlineReached,canSubmit,canReveal
} from '../js/practical-core.js';

const root=new URL('../',import.meta.url);
const readText=path=>readFileSync(new URL(path,root),'utf8');
const readJson=path=>JSON.parse(readText(path));

assert.equal(HINT_SECONDS,60);
assert.equal(ANSWER_SECONDS,120);

const startedAt=1_000_000;
const attempt={startedAt,submittedAt:null,viewedExplanation:false};

assert.equal(remainingSeconds(startedAt,startedAt),60);
assert.equal(hintAvailable(attempt,startedAt+59_999),false);
assert.equal(hintAvailable(attempt,startedAt+60_000),true);
assert.equal(remainingAnswerSeconds(startedAt,startedAt+60_000),60);

assert.equal(canSubmit(attempt,'answer',startedAt+0),true);
assert.equal(canSubmit(attempt,'answer',startedAt+60_000),true);
assert.equal(canSubmit(attempt,'answer',startedAt+119_999),true);
assert.equal(canSubmit(attempt,'answer',startedAt+120_000),false);

assert.equal(answerDeadlineReached(attempt,startedAt+119_999),false);
assert.equal(answerDeadlineReached(attempt,startedAt+120_000),true);
assert.equal(canReveal(attempt,startedAt+119_999),false);
assert.equal(canReveal(attempt,startedAt+120_000),true);
assert.equal(canReveal({...attempt,submittedAt:startedAt+15_000},startedAt+15_000),true);

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

console.log('PASS: immediate submit reveal, 60s hint, 120s automatic answer/explanation reveal, mobile styling, and full hint coverage.');
