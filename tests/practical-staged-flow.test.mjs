import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  HINT_SECONDS,ANSWER_SECONDS,remainingSeconds,remainingAnswerSeconds,
  hintAvailable,answerDeadlineReached,canSubmit,canReveal
} from '../js/practical-core.js';

const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

assert.equal(HINT_SECONDS,60);
assert.equal(ANSWER_SECONDS,120);

const startedAt=1_000_000;
const attempt={startedAt,submittedAt:null,viewedExplanation:false};

assert.equal(remainingSeconds(startedAt,startedAt),60);
assert.equal(remainingSeconds(startedAt,startedAt+59_999),1);
assert.equal(remainingSeconds(startedAt,startedAt+60_000),0);

assert.equal(hintAvailable(attempt,startedAt+59_999),false);
assert.equal(hintAvailable(attempt,startedAt+60_000),true);
assert.equal(hintAvailable(attempt,startedAt+119_999),true);

assert.equal(remainingAnswerSeconds(startedAt,startedAt+60_000),60);
assert.equal(remainingAnswerSeconds(startedAt,startedAt+119_999),1);
assert.equal(remainingAnswerSeconds(startedAt,startedAt+120_000),0);

assert.equal(canSubmit(attempt,'42',startedAt+1),true);
assert.equal(canSubmit(attempt,'42',startedAt+60_000),true);
assert.equal(canSubmit(attempt,'42',startedAt+119_999),true);
assert.equal(canSubmit(attempt,'42',startedAt+120_000),false);
assert.equal(canSubmit(attempt,'   ',startedAt+80_000),false);

assert.equal(canReveal(attempt,startedAt+119_999),false);
assert.equal(answerDeadlineReached(attempt,startedAt+119_999),false);
assert.equal(answerDeadlineReached(attempt,startedAt+120_000),true);
assert.equal(canReveal(attempt,startedAt+120_000),true);

const early={...attempt,submittedAt:startedAt+20_000};
assert.equal(canReveal(early,startedAt+20_000),true,'submitted answer must reveal immediately');
assert.equal(hintAvailable(early,startedAt+70_000),false,'submitted answer must not later show hint');
assert.equal(canSubmit(early,'43',startedAt+70_000),false,'submitted answer is immutable');

const ui=read('js/practical-ui.js');
const css=read('css/practical.css');
const html=read('practical.html');

assert.ok(ui.includes('답 제출하고 풀이 보기'));
assert.ok(ui.includes('hintAvailable(attempt,now)'));
assert.ok(ui.includes('answerDeadlineReached(attempt,now)'));
assert.ok(ui.includes('autoRevealAnswer(now)'));
assert.ok(ui.includes('revealAnswer("submitted",now)'));
assert.ok(ui.includes('revealAnswer("timeout",now)'));
assert.ok(ui.includes('correct:null'));
assert.ok(ui.includes('autoRevealed:true'));
assert.ok(ui.includes('usedHint:true'));
assert.ok(!ui.includes('풀이·정답 확인</button>'),'manual delayed-reveal button must be removed');

const formEnd=ui.indexOf('</form><aside id="solve-hint"');
assert.ok(formEnd>=0,'hint panel should be after the answer form to avoid moving the active input');
assert.ok(css.includes('.solve-hint[hidden]{display:none !important}'));
assert.ok(css.includes('@media(max-width:767px)'));
assert.ok(css.includes('.bank-timer.hint-stage'));
assert.ok(html.includes('css/practical.css?v=20261005-solution-2'));
assert.ok(html.includes('js/practical-ui.js?v=20261006-indent-1'));

console.log('PASS: 0-60 self solve, 60-120 hint, immediate submit grading, 120-second auto reveal, and responsive staged UI contract.');
