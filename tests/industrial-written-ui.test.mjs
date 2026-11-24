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

test('written exam loads only 2020 playable questions from Supabase',()=>{
 const loader=read('js/written-exam-data.mjs');
 const engine=read('js/written-exam-ui.mjs');
 const bootstrap=read('js/industrial-written-ui.js');
 assert.match(loader,/portalSupabaseClient/);
 assert.match(loader,/from\("written_question_bank"\)/);
 assert.doesNotMatch(loader,/written_exam_scanned_sources/);
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

test('2020 round and subject filters remain active, image menus removed',()=>{
 const engine=read('js/written-exam-ui.mjs');
 const browser=read('js/question-browser.js');
 const page=read('industrial-written.html');
 const bootstrap=read('js/industrial-written-ui.js');
 assert.match(engine,/additionalFilter:\{label:"과목별 필터"/);
 assert.match(engine,/secondaryFilter:\{/);
 assert.match(browser,/additionalFilter\.matches\(q,selectedAdditional\)/);
 assert.doesNotMatch(page,/2025년|2026년|이미지 문제지|원본 이미지/);
 assert.doesNotMatch(bootstrap,/2025|2026/);
 assert.match(page,/2020년/);
});

test('practical question-bank implementation is separate',()=>{
 const engine=read('js/written-exam-ui.mjs');
 assert.match(engine,/quizNavigation|quizHeading|quizDisclosure/);
 assert.doesNotMatch(read('js/practical-ui.js'),/written-exam-data.mjs/);
});
