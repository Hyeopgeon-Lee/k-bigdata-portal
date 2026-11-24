import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {adjacentWrittenQuestion} from '../js/written-exam-navigation.mjs';
import {validateWrittenQuestion} from '../js/written-exam-ui.mjs';

const base=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,base),'utf8');
const blocked=[
 'data/industrial-written/questions.json',
 'data/industrial-written/questions-20200822.json',
 'data/industrial-written/scans-2025-1.json',
 'data/industrial-written/scans-2025-2.json',
 'data/industrial-written/scans-2025-3.json',
 'data/industrial-written/scans-2026-2.json',
 'data/industrial-written/sources.json'
];

test('source exam images are never committed to public GitHub',()=>{
 for(const p of blocked)assert.equal(existsSync(fileURLToPath(new URL(p,base))),false,p);
 const folder=new URL('data/industrial-written/',base);
 if(existsSync(fileURLToPath(folder))){
  assert.deepEqual(readdirSync(folder).filter(name=>/\.(?:json|pdf|hwpx|docx|png|jpg|jpeg|webp)$/i.test(name)),[]);
 }
 assert.match(read('.gitignore'),/\/data\/industrial-written\//);
});

test('portal uses structured text questions rather than raw scans',()=>{
 const loader=read('js/written-exam-data.mjs');
 const engine=read('js/written-exam-ui.mjs');
 const bootstrap=read('js/industrial-written-ui.js');
 const page=read('industrial-written.html');
 assert.match(loader,/from\("written_question_bank"\)/);
 assert.doesNotMatch(loader,/written_exam_scanned_sources|loadWrittenExamSession/);
 assert.doesNotMatch(engine,/createHistoricalWrittenViewer|loadWrittenExamSession|historicalViewer/);
 assert.doesNotMatch(bootstrap,/scanSessions|historicalSessions|manifestUrl|\.json/);
 assert.equal(existsSync(fileURLToPath(new URL('js/written-exam-historical.mjs',base))),false);
 assert.doesNotMatch(page,/이미지 문제지 등록 회차/);
 assert.match(page,/문항별 텍스트/);
});

test('2025 three rounds and 2026 second round filters remain available',()=>{
 const engine=read('js/written-exam-ui.mjs');
 const bootstrap=read('js/industrial-written-ui.js');
 const page=read('industrial-written.html');
 for(const n of [1,2,3])assert.ok(bootstrap.includes('year:2025,round:'+n));
 assert.ok(bootstrap.includes('year:2026,round:2'));
 assert.doesNotMatch(bootstrap,/year:2020/);
 assert.doesNotMatch(page,/2020년/);
 assert.match(engine,/extraCategories:\[\.\.\.new Set\(archiveSessions\.map/);
 assert.match(engine,/additionalFilter:\{label:"과목별 필터"/);
 assert.match(engine,/secondaryFilter:\{/);
 assert.match(engine,/questions:bank/);
});

test('post-2022 provided quiz permits unknown exam date with verified source and answer',()=>{
 const q={
  id:'IND-W-2026-R2-Q001',examType:'industrial',year:2026,round:2,number:1,
  roundLabel:'2회',examDate:null,sourceType:'provided',
  question:'파이프 필터 형태의 소프트웨어 아키텍처에 대한 설명으로 옳은 것은?',
  options:['노드와 간선','계층 모델','입력 처리 결과를 다음 필터에 전달','MVC 서브시스템'],
  answer:3,sourceVerified:true,answerVerified:true,visuals:[]
 };
 assert.equal(validateWrittenQuestion(q,'industrial'),true);
 assert.equal(validateWrittenQuestion({...q,options:q.options.slice(0,3)},'industrial'),false);
 assert.equal(validateWrittenQuestion({...q,answerVerified:false},'industrial'),false);
 assert.equal(validateWrittenQuestion({...q,year:2020,examDate:null},'industrial'),false);
});

test('answer and next-question navigation work without images',()=>{
 const engine=read('js/written-exam-ui.mjs');
 assert.match(engine,/attempt\.recorded=Boolean\(selectedAnswer\)/);
 assert.match(engine,/q\.answer\+'번/);
 assert.equal(engine.includes('정답을 먼저 선택하세요.'),false);
 const bank=[{id:'a'},{id:'b'},{id:'c'}];
 assert.equal(adjacentWrittenQuestion(bank,[bank[0]],'a',1,true).question.id,'b');
 assert.equal(adjacentWrittenQuestion(bank,bank,'b',1,true).question.id,'c');
 assert.equal(adjacentWrittenQuestion(bank,bank,'c',1,true),null);
});

test('existing practical question bank remains separate',()=>{
 assert.doesNotMatch(read('js/practical-ui.js'),/written-exam-data\.mjs/);
 assert.match(read('js/written-exam-ui.mjs'),/quizNavigation|quizHeading|quizDisclosure/);
});
