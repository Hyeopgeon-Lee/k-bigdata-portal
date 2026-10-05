import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {formatCodeForDisplay} from '../js/practical-core.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const base=JSON.parse(read('data/practical/questions.json'));
const extra=JSON.parse(read('data/practical/reconstructed-extra.json'));
const imported=JSON.parse(read('data/practical/normalized.json'));
const questions=[...base,...extra,...imported.questions];

assert.ok(questions.length>=386,'expanded practical bank must retain at least 386 questions');
assert.equal(new Set(questions.map(q=>q.id)).size,questions.length,'question IDs must stay unique');

const maxLine=code=>Math.max(0,...String(code||'').split(/\r?\n/).map(line=>line.length));
const tall=questions.filter(q=>String(q.code||'').split(/\r?\n/).length>=16);
const wide=questions.filter(q=>maxLine(q.code)>=80);
const wideNonSql=wide.filter(q=>q.language!=='SQL');
const longQuestions=questions.filter(q=>String(q.question||'').length>=80);
const longAnswers=questions.filter(q=>String(q.answer||'').length>=80);

assert.equal(wideNonSql.length,0,'C/Java/Python code lines >=80 chars must be reformatted for phone reading');
assert.ok(Math.max(...questions.map(q=>maxLine(q.code)))<=120,'no practical source line should exceed 120 chars');
const formatted=questions.map(q=>({...q,displayCode:formatCodeForDisplay(q.code,q.language)}));
assert.equal(formatted.filter(q=>['C','Java'].includes(q.language)&&/\)\{/.test(q.displayCode)).length,0,'display formatter must separate structural braces');
assert.equal(formatted.filter(q=>['C','Java'].includes(q.language)&&/\)\s*\{\s*[^}\n]+\}/.test(q.displayCode)).length,0,'display formatter must expand one-line function/method bodies');
assert.ok(Math.max(...formatted.filter(q=>q.language!=='SQL').map(q=>maxLine(q.displayCode)))<=100,'formatted non-SQL code must fit mobile-friendly line width');
assert.ok(Math.max(...questions.map(q=>String(q.question||'').length))<=120,'question prompts should remain concise enough for sentence formatting');

const ui=read('js/practical-ui.js');
const css=read('css/practical.css');
assert.ok(ui.includes('function formatQuestion(text)'),'long prompts need sentence-aware rendering');
assert.ok(ui.includes('formatCodeForDisplay'),'all practical code must pass through the shared display formatter');
assert.ok(ui.includes('function codeNeedsFocus(q)'),'complex code needs mobile focus classification');
assert.ok(ui.includes('button("code-focus"')&&ui.includes('action==="code-focus"'),'complex code needs a full-screen reader trigger and handler');
assert.ok(ui.includes('code-scroll--complex'),'complex code needs bounded mobile height');
assert.match(ui,/CROSS JOIN\|JOIN\|ON\|FROM/,'SQL formatter must break plain JOIN and ON as well as FROM');
assert.ok(css.includes('.code-dialog'),'full-screen code dialog styles must exist');
assert.ok(css.includes('max-height:52svh'),'complex inline code must not consume the entire phone viewport');
assert.ok(css.includes('.solve-question br'),'long prompts must visually separate sentences');

console.log(JSON.stringify({
 total:questions.length,
 tallCode:tall.length,
 wideCode:wide.length,
 longQuestions:longQuestions.length,
 longAnswers:longAnswers.length,
 maxRawLine:Math.max(...questions.map(q=>maxLine(q.code)))
},null,2));
console.log('PASS: practical mobile readability guardrails.');
