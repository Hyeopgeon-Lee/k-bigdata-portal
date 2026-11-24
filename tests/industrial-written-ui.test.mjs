import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const base=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,base),'utf8');
const forbidden=[
 'data/industrial-written/questions.json',
 'data/industrial-written/questions-20200822.json',
 'data/industrial-written/scans-2025-1.json',
 'data/industrial-written/scans-2025-2.json',
 'data/industrial-written/scans-2025-3.json',
 'data/industrial-written/scans-2026-2.json',
 'data/industrial-written/sources.json'
];

test('original question documents and scanned image payloads are not committed in GitHub',()=>{
 for(const p of forbidden)assert.equal(existsSync(fileURLToPath(new URL(p,base))),false,p+' must not be public');
});

test('written exam loads its data from Supabase, not public JSON files',()=>{
 const loader=read('js/written-exam-data.mjs'),engine=read('js/written-exam-ui.mjs');
 const bootstrap=read('js/industrial-written-ui.js');
 assert.match(loader,/portalSupabaseClient/);
 assert.match(loader,/from\("written_question_bank"\)/);
 assert.match(loader,/from\("written_exam_scanned_sources"\)/);
 assert.match(engine,/loadWrittenExamQuestions\(examType\)/);
 assert.match(engine,/loadWrittenExamScan\(examType,source.year,source.round\)/);
 for(const p of forbidden)assert.equal(bootstrap.includes(p),false);
 assert.equal(engine.includes('mountWrittenSources'),false);
 assert.equal(bootstrap.includes('sourceIndexUrl'),false);
});

test('answer is revealed even with no option selected, and only chosen answers are saved',()=>{
 const engine=read('js/written-exam-ui.mjs');
 assert.match(engine,/attempt.recorded=Boolean\(selectedAnswer\)/);
 assert.match(engine,/if\(selectedAnswer\)\{/);
 assert.match(engine,/attempt\.answer=selectedAnswer/);
 assert.match(engine,/q\.answer\+'번/);
 assert.equal(engine.includes('정답을 먼저 선택하세요.'),false);
 assert.equal(engine.includes('q.sourceFileName'),false);
});

test('scanned papers have an explicit answer button and per-subject answer key',()=>{
 const scan=read('js/written-exam-scans.mjs');
 assert.match(scan,/정답 보기/);
 assert.match(scan,/answerToggle\.addEventListener\("click"/);
 assert.match(scan,/answerPanel\.hidden=!answerPanel\.hidden/);
 assert.match(scan,/data\.subjects\?\.find/);
 assert.equal(scan.includes('sourceFileName'),false);
 assert.equal(scan.includes('referenceUrl'),false);
});

test('2020 year and 2025-2026 rounds keep their filters',()=>{
 const engine=read('js/written-exam-ui.mjs');
 const bootstrap=read('js/industrial-written-ui.js');
 const browser=read('js/question-browser.js');
 const page=read('industrial-written.html');
 assert.match(engine,/additionalFilter:\{label:"과목별 필터"/);
 assert.match(engine,/secondaryFilter:\{/);
 assert.match(browser,/additionalFilter\.matches\(q,selectedAdditional\)/);
 for(const round of ['{year:2025,round:1','{year:2025,round:2','{year:2025,round:3','{year:2026,round:2'])
  assert.ok(bootstrap.includes(round),round);
 assert.equal(page.includes('source-filter'),false);
 assert.equal(page.includes('data/industrial-written/'),false);
});

test('existing practical question UI remains separate',()=>{
 const engine=read('js/written-exam-ui.mjs');
 assert.match(engine,/quizNavigation/);
 assert.match(engine,/quizHeading/);
 assert.match(engine,/quizDisclosure/);
 assert.match(engine,/createQuestionBrowser/);
 assert.equal(read('js/practical-ui.js').includes('written-exam-data.mjs'),false);
});
