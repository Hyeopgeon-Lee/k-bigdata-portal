import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {adjacentWrittenQuestion} from '../js/written-exam-navigation.mjs';

const base=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,base),'utf8');
const prohibited=[
 'data/industrial-written/questions.json',
 'data/industrial-written/questions-20200822.json',
 'data/industrial-written/scans-2025-1.json',
 'data/industrial-written/scans-2025-2.json',
 'data/industrial-written/scans-2025-3.json',
 'data/industrial-written/scans-2026-2.json',
 'data/industrial-written/sources.json'
];

test('question/image originals are not committed to the public repository',()=>{
 for(const p of prohibited)assert.equal(existsSync(fileURLToPath(new URL(p,base))),false,p);
 const materials=new URL('data/industrial-written/',base);
 if(existsSync(fileURLToPath(materials))){
  const leaked=readdirSync(materials).filter(name=>/\.(?:json|pdf|docx|hwpx|png|jpe?g|webp|gif)$/i.test(name));
  assert.deepEqual(leaked,[]);
 }
 assert.match(read('.gitignore'),/\/data\/industrial-written\//);
});

test('written exam uses Supabase for retained 2025 and 2026 sessions',()=>{
 const loader=read('js/written-exam-data.mjs');
 const engine=read('js/written-exam-ui.mjs');
 const bootstrap=read('js/industrial-written-ui.js');
 assert.match(loader,/portalSupabaseClient/);
 assert.match(loader,/from\("written_question_bank"\)/);
 assert.match(loader,/written_exam_scanned_sources/);
 assert.match(loader,/eq\("exam_year",year\)/);
 assert.match(loader,/eq\("exam_round",round\)/);
 assert.match(engine,/loadWrittenExamQuestions\(examType\)/);
 assert.doesNotMatch(engine,/mountWrittenExamScans|scanSessions|written-scan-shortcuts/);
 assert.doesNotMatch(bootstrap,/scanSessions|scanSubjectNames|manifestUrl|data\/industrial-written/);
 assert.equal(existsSync(fileURLToPath(new URL('js/written-exam-scans.mjs',base))),false);
});

test('written exam continues to expose answers without recording unselected choices',()=>{
 const engine=read('js/written-exam-ui.mjs');
 assert.match(engine,/attempt.recorded=Boolean\(selectedAnswer\)/);
 assert.match(engine,/if\(selectedAnswer\)\{/);
 assert.match(engine,/q.answer\+'번/);
 assert.equal(engine.includes('정답을 먼저 선택하세요.'),false);
});

test('adjacent question navigation works across one-item or truncated queues',()=>{
 const bank=[{id:'a'},{id:'b'},{id:'c'}];
 const target=adjacentWrittenQuestion(bank,[bank[0]],'a',1,true);
 assert.equal(target.question.id,'b');
 assert.equal(target.index,1);
 assert.equal(target.queue.length,3);
 assert.equal(adjacentWrittenQuestion(bank,bank,'b',1,true).question.id,'c');
 assert.equal(adjacentWrittenQuestion(bank,[bank[1]],'b',-1,true).question.id,'a');
 assert.equal(adjacentWrittenQuestion(bank,bank,'c',1,true),null);
 assert.equal(adjacentWrittenQuestion(bank,[bank[0]],'a',1,false),null);
});

test('next and previous buttons are wired to adjacency navigation',()=>{
 const engine=read('js/written-exam-ui.mjs');
 assert.match(engine,/if\(name==="previous"\|\|name==="next"\)/);
 assert.match(engine,/adjacentWrittenQuestion\(bank,queue,current.id,direction/);
 assert.match(engine,/openQuestion\(target.question.id\)/);
});

test('2020 controls stay removed while 2025 and 2026 subject filters work',()=>{
 const engine=read('js/written-exam-ui.mjs');
 const browser=read('js/question-browser.js');
 const page=read('industrial-written.html');
 const bootstrap=read('js/industrial-written-ui.js');
 assert.match(engine,/additionalFilter:\{label:"과목별 필터"/);
 assert.match(engine,/secondaryFilter:\{/);
 assert.match(browser,/additionalFilter\.matches\(q,selectedAdditional\)/);
 assert.doesNotMatch(page,/2020년|2020-06-06|2020-08-22/);
 assert.match(page,/2025년/);
 assert.match(engine,/const archivedOnly=bank.length===0&&archiveSessions.length>0/);
 assert.match(engine,/initialCategory:archivedOnly\?chosenYear/);
 assert.match(engine,/initialValue:archivedOnly\?chosenSession:undefined/);
 assert.match(engine,/if\(!bank.length&&!archiveSessions.length\)/);
 assert.match(page,/2026년/);
 assert.doesNotMatch(page,/이미지 문제지 등록 회차/);
 for(const r of [1,2,3])assert.match(bootstrap,new RegExp('year:2025,round:'+r));
 assert.match(bootstrap,/year:2026,round:2/);
});

test('practical question-bank implementation is separate',()=>{
 const engine=read('js/written-exam-ui.mjs');
 assert.match(engine,/quizNavigation|quizHeading|quizDisclosure/);
 assert.doesNotMatch(read('js/practical-ui.js'),/written-exam-data.mjs/);
});


test('2025 three rounds and 2026 second round restore without public originals or shortcut gallery',()=>{
 const app=read('js/industrial-written-ui.js');
 const ui=read('js/written-exam-ui.mjs');
 const viewer=read('js/written-exam-historical.mjs');
 const loader=read('js/written-exam-data.mjs');
 assert.match(ui,/extraCategories:\[\.\.\.new Set\(archiveSessions\.map/);
 assert.match(ui,/historicalViewer=createHistoricalWrittenViewer/);
 assert.match(ui,/extraCategories/);
 assert.match(ui,/historicalSubjects/);
 assert.match(viewer,/data\.answerKey\.length!==60/);
 assert.match(viewer,/answerKey\[i-1\]/);
 assert.match(viewer,/String\(year\)==="2025"\|\|String\(year\)==="2026"/);
 assert.match(viewer,/정답 보기/);
 assert.match(loader,/eq\("exam_round",round\)/);
 assert.doesNotMatch(app,/data\/industrial-written|\.json|scanManifestUrl/);
 assert.match(app,/year:2026,round:2/);
 assert.doesNotMatch(ui,/written-scan-shortcuts|이미지 문제지 등록 회차/);
});

test('2025-2026 archive suppresses nonfunctional practice tabs when 2020 is absent',()=>{
 const engine=read('js/written-exam-ui.mjs');
 const page=read('industrial-written.html');
 assert.match(engine,/if\(archivedOnly\)\{/);
 assert.match(engine,/chosenYear=chosenSession\.split\("-"\)\[0\]/);
 assert.match(engine,/latest=\[\.\.\.archiveSessions\]\.sort/);
 assert.match(engine,/button\.hidden=true/);
 assert.doesNotMatch(page,/2020년/);
});

test('2026 year includes only second round without restoring 2020 or publishing source file',()=>{
 const engine=read('js/written-exam-ui.mjs');
 const viewer=read('js/written-exam-historical.mjs');
 const loader=read('js/written-exam-data.mjs');
 const bootstrap=read('js/industrial-written-ui.js');
 assert.match(engine,/s.year===2026&&s.round===2/);
 assert.match(engine,/chosenSession.startsWith\(chosenYear\+"-"\)/);
 assert.match(viewer,/Number\(year\)===2026&&Number\(round\)===2/);
 assert.match(loader,/year===2026&&round===2/);
 assert.match(bootstrap,/year:2026,round:2/);
 assert.doesNotMatch(bootstrap,/year:2020/);
 assert.doesNotMatch(read('industrial-written.html'),/2020년/);
});
