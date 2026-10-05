import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {questions} from '../js/interview.js';
import {renderInterviewQuestion,interviewShareText} from '../js/interview-ui.js';

const root=new URL('../',import.meta.url);
const ui=readFileSync(new URL('js/interview-ui.js',root),'utf8');
const css=readFileSync(new URL('css/interview.css',root),'utf8');
const html=readFileSync(new URL('interview.html',root),'utf8');

const q=questions[0];
const card=interviewShareText(q);
assert.ok(card.includes('기술면접 문제'));
assert.ok(card.includes(q.group));
assert.ok(card.includes(q.difficulty));
assert.ok(card.includes(q.question));
assert.ok(!card.includes(q.shortAnswer));
assert.ok(!card.includes(q.detailedAnswer));

const rendered=renderInterviewQuestion(q,true);
assert.ok(rendered.includes('문제 공유'));
assert.ok(rendered.includes('링크 복사'));
assert.ok(rendered.includes('id="interview-share-status"'));
assert.ok(rendered.includes('aria-live="polite"'));

const browseRendered=renderInterviewQuestion(q,false);
assert.ok(!browseRendered.includes('interview-share-row'),'share controls should be limited to active practice questions');

assert.match(ui,/function shareInterviewQuestion\(q\)/);
assert.match(ui,/function copyInterviewQuestionLink\(q\)/);
assert.match(ui,/navigator\.share/);
assert.match(ui,/navigator\.clipboard\?\.writeText/);
assert.match(ui,/document\.execCommand\("copy"\)/);
assert.match(ui,/url\.searchParams\.set\("id",q\.id\)/);
assert.ok(!/q\.shortAnswer|q\.detailedAnswer|q\.answer|q\.extra/.test(
  ui.slice(ui.indexOf('export function interviewShareText'),ui.indexOf('async function copyText'))
));

assert.match(css,/\.interview-share-row/);
assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(css,/min-height:44px/);

assert.ok(html.includes('css/interview.css?v=20261005-browser-1'));
assert.ok(html.includes('js/learning-ui.js?v=20261005-perf-4'));

console.log('PASS: active technical interview questions support native card sharing and link copy without exposing answers.');
