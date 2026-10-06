import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const ui=readFileSync(new URL('js/practical-ui.js',root),'utf8');
const css=readFileSync(new URL('css/practical.css',root),'utf8');
const html=readFileSync(new URL('practical.html',root),'utf8');

assert.match(ui,/function problemShareUrl\(q=current\)/);
assert.match(ui,/url\.searchParams\.set\("id",q\.id\)/);
assert.match(ui,/url\.searchParams\.set\("share","1"\)/);
assert.match(ui,/function problemShareText\(q=current\)/);
assert.match(ui,/solveHeading\(q\),q\.language\+" · "\+q\.title,preview/);

assert.match(ui,/navigator\.share/,'native Web Share API should be used when available');
assert.match(ui,/navigator\.clipboard\?\.writeText/,'clipboard API fallback should exist');
assert.match(ui,/document\.execCommand\("copy"\)/,'legacy copy fallback should exist');

assert.match(ui,/data-action="share-problem"|button\("share-problem","문제 공유"/);
assert.match(ui,/button\("copy-problem-link","링크 복사"/);
assert.match(ui,/id="share-status"/);
assert.match(ui,/if\(action==="share-problem"\)void shareCurrentProblem\(\)/);
assert.match(ui,/if\(action==="copy-problem-link"\)void copyCurrentProblemLink\(\)/);

assert.match(ui,/shared=params\.get\("share"\)==="1"/);
assert.match(ui,/canonical\.searchParams\.delete\("share"\)/);
assert.match(ui,/openQuestion\(id,shared\)/);
assert.match(ui,/if\(!shared&&id&&savedQueue/,'shared links must not inherit a local saved learning queue');

const shareTextBlock=ui.slice(ui.indexOf('function problemShareText'),ui.indexOf('async function copyText'));
assert.ok(!/answer|hint|attempt|submittedAt|correct/.test(shareTextBlock),'share card must not include answer, hint, attempt, or grading state');

assert.match(css,/\.solve-share-row/);
assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,'mobile share actions should fit in two equal columns');
assert.match(css,/\.share-status:empty\{display:none\}/);

assert.match(html,/css\/practical\.css\?v=[\w-]+/);
assert.match(html,/js\/practical-ui\.js\?v=[\w-]+/);

console.log('PASS: current-problem link copy and card sharing are privacy-safe, fresh-start deep links with responsive controls.');
