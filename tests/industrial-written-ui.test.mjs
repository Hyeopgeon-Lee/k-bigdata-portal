import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateWrittenQuestion} from '../js/written-exam-ui.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

const valid={
 id:'2026-2-001',examType:'industrial',year:2026,round:2,number:1,
 question:'다음 중 옳은 것은?',options:['A','B','C','D'],answer:2,
 sourceType:'official',sourceUrl:'https://example.org/exam',
 sourceVerified:true,answerVerified:true,republicationAllowed:true,
 evidence:{sourceUrl:"https://example.org/exam",answerUrl:"https://example.org/answer",rightsUrl:"https://example.org/licence",reviewer:"Quality reviewer",reviewedAt:"2026-11-23"}
};

test('written exam rejects unverified or unauthorized source data',()=>{
 assert.equal(validateWrittenQuestion(valid,'industrial'),true);
 assert.equal(validateWrittenQuestion({...valid,sourceVerified:false},'industrial'),false);
 assert.equal(validateWrittenQuestion({...valid,answerVerified:false},'industrial'),false);
 assert.equal(validateWrittenQuestion({...valid,republicationAllowed:false},'industrial'),false);
 assert.equal(validateWrittenQuestion({...valid,sourceType:'unknown'},'industrial'),false);
 assert.equal(validateWrittenQuestion({...valid,evidence:{...valid.evidence,rightsUrl:""}},'industrial'),false);
 assert.equal(validateWrittenQuestion({...valid,sourceUrl:'http://example.org'},'industrial'),false);
 assert.equal(validateWrittenQuestion({...valid,options:['A','B']},'industrial'),false);
 assert.equal(validateWrittenQuestion({...valid,answer:5},'industrial'),false);
 assert.equal(validateWrittenQuestion(valid,'engineer'),false);
});

test('written page uses the practical shared visual components without modifying practical',()=>{
 const practical=read('practical.html'),written=read('industrial-written.html');
 for(const path of ['css/practical.css','css/quiz-unified.css','css/question-browser.css']){
  assert.ok(practical.includes(path),'existing practical source '+path);
  assert.ok(written.includes(path),'written uses practical source '+path);
 }
 for(const id of ['id="bank-content"','id="bank-status"','id="study-intro"','class="bank-nav"']){
  assert.ok(written.includes(id),'written page includes '+id);
 }
 assert.ok(written.includes('js/industrial-written-ui.js'));
 assert.ok(!practical.includes('js/written-exam-ui.mjs'));
});

test('written quiz uses exact same list and solving primitives as practical',()=>{
 const practical=read('js/practical-ui.js'),written=read('js/written-exam-ui.mjs');
 for(const name of ['createQuestionBrowser','quizNavigation','quizHeading','quizDisclosure','quizFeedback','scrollToQuizAnswer','reviewControls']){
  assert.ok(practical.includes(name),'practical calls '+name);
  assert.ok(written.includes(name),'written calls '+name);
 }
 for(const name of ['bank-solve','quiz-answer','quiz-solve-actions','answer-pair','bank-result','study-nav']){
  assert.ok(written.includes(name),'shared class '+name);
 }
});

test('2020-06-06 combined exam includes 100 genuine user-provided questions, all original figures and verified answer keys',()=>{
 const data=JSON.parse(read('data/industrial-written/questions.json'));
 assert.ok(Array.isArray(data));
 const exam=data.filter(q=>q.year===2020&&q.examDate==='2020-06-06');
 assert.equal(exam.length,100);
 assert.equal(new Set(exam.map(q=>q.id)).size,100);
 assert.deepEqual(exam.map(q=>q.number),Array.from({length:100},(_,i)=>i+1));
 assert.ok(exam.every(q=>q.sourceType==='provided'&&q.answerVerified===true&&q.sourceVerified===true));
 assert.ok(exam.every(q=>validateWrittenQuestion(q,'industrial')));
 assert.ok(exam.every(q=>q.options.length===4&&q.options.every(Boolean)&&q.answer>=1&&q.answer<=4));
 assert.ok(exam.every(q=>q.roundLabel==='1·2회 통합'));
 const subjects=['데이터 베이스','전자 계산기 구조','시스템분석설계','운영체제','정보통신개론'];
 for(const subject of subjects)assert.equal(exam.filter(q=>q.subject===subject).length,20);
 assert.equal(exam.reduce((n,q)=>n+q.visuals.length,0),17);
 for(const q of exam)for(const fig of q.visuals){
  assert.match(fig.dataUri,/^data:image\/gif;base64,[A-Za-z0-9+/]+=*$/);
  assert.match(fig.sha256,/^[0-9a-f]{64}$/);
 }
});

test('2020-2026 reference registry is distinguishable from the actual question bank',()=>{
 const catalog=JSON.parse(read('data/industrial-written/sources.json'));
 const years=catalog.years.map(item=>item.year).sort();
 assert.deepEqual(years,[2020,2021,2022,2023,2024,2025,2026]);
 assert.ok(catalog.years.flatMap(y=>y.materials).length>=14);
 assert.ok(catalog.years.every(row=>row.materials.every(m=>m.rights&&m.verified&&m.url.startsWith("https://"))));
 assert.equal(JSON.parse(read('data/industrial-written/questions.json')).length,100);
});

test('2020-08-22 industrial engineer third round contains 100 source-verified questions',()=>{
 const questions=JSON.parse(read('data/industrial-written/questions-20200822.json'));
 assert.equal(questions.length,100);
 assert.deepEqual(questions.map(q=>q.number),Array.from({length:100},(_,i)=>i+1));
 assert.equal(new Set(questions.map(q=>q.id)).size,100);
 assert.ok(questions.every(q=>q.examType==='industrial'&&q.year===2020&&q.round===3&&
    q.examDate==='2020-08-22'&&q.roundLabel==='3회'&&q.answerVerified&&q.sourceVerified));
 assert.ok(questions.every(q=>validateWrittenQuestion(q,'industrial')));
 assert.equal(questions.reduce((sum,q)=>sum+(q.visuals?.length||0)+(q.optionVisuals?.length||0),0),19);
 const special=questions.find(q=>q.number===8);
 assert.equal(special.optionVisuals.length,4,'graph figure answers are preserved individually');
 for(const subject of ['데이터 베이스','전자 계산기 구조','시스템분석설계','운영체제','정보통신개론']){
   assert.equal(questions.filter(q=>q.subject===subject).length,20);
 }
 const original=JSON.parse(read('data/industrial-written/questions.json'));
 assert.equal(new Set([...original,...questions].map(q=>q.id)).size,200);
});
test('2026 second round source scan retains five pages and 60 answer-key positions without claiming individual quiz conversion',()=>{
 const data=JSON.parse(read('data/industrial-written/scans-2026-2.json'));
 assert.equal(data.examType,'industrial');
 assert.equal(data.year,2026);
 assert.equal(data.round,2);
 assert.equal(data.examDate,null);
 assert.equal(data.importStatus,'source_scan_only');
 assert.equal(data.questionCountClaimed,60);
 assert.equal(data.answerKey.length,60);
 assert.ok(data.answerKey.every(n=>Number.isInteger(n)&&n>=1&&n<=4));
 assert.equal(data.pages.length,5);
 assert.deepEqual(data.pages.slice(0,4).map(page=>[page.questionFrom,page.questionTo]),[[1,13],[14,31],[32,46],[47,60]]);
 assert.equal(data.pages.at(-1).questionFrom,null);
 assert.ok(data.pages.every(page=>page.base64Chunks.join('').length>500));
 assert.deepEqual(data.subjects.map(s=>[s.from,s.to]),[[1,20],[21,40],[41,60]]);
});
test('subject filter and multiple exam files are connected only to industrial written page',()=>{
 const browser=read('js/question-browser.js');
 const engine=read('js/written-exam-ui.mjs');
 const bootstrap=read('js/industrial-written-ui.js');
 assert.ok(browser.includes('additionalFilter.matches(q,selectedAdditional)'));
 assert.ok(browser.includes('...extraCategories'));
 assert.ok(bootstrap.includes('scanYear:2026'));
 assert.ok(bootstrap.includes('scanSubjectNames:'));
 assert.ok(engine.includes('scanJump?.addEventListener'));
 assert.ok(engine.includes('scanManifestUrl'));

 assert.ok(engine.includes('additionalFilter:{label:"과목별 필터"'));
 assert.ok(engine.includes('id="random-subject"'));
 assert.ok(bootstrap.includes('questions-20200822.json'));
 assert.ok(bootstrap.includes('scans-2026-2.json'));
 assert.ok(!read('js/practical-ui.js').includes('scans-2026-2'));
});
