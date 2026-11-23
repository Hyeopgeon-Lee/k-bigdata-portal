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

test('data begins empty, never contains generated questions',()=>{
 const data=JSON.parse(read('data/industrial-written/questions.json'));
 assert.ok(Array.isArray(data));
 for(const row of data)assert.ok(validateWrittenQuestion(row,'industrial'));
});

test('2020-2026 reference registry is distinguishable from the actual question bank',()=>{
 const catalog=JSON.parse(read('data/industrial-written/sources.json'));
 const years=catalog.years.map(item=>item.year).sort();
 assert.deepEqual(years,[2020,2021,2022,2023,2024,2025,2026]);
 assert.ok(catalog.years.flatMap(y=>y.materials).length>=14);
 assert.ok(catalog.years.every(row=>row.materials.every(m=>m.rights&&m.verified&&m.url.startsWith("https://"))));
 assert.deepEqual(JSON.parse(read('data/industrial-written/questions.json')),[]);
});

test('original industrial written mock bank has 120 validated distinct questions in six 20-question subject/round blocks',()=>{
 const files=['systems','programming','database'].map(name=>'data/industrial-written/practice-'+name+'.json');
 const all=files.flatMap(file=>JSON.parse(read(file)));
 assert.equal(all.length,120);
 assert.equal(new Set(all.map(q=>q.id)).size,120,'all mock question IDs are unique');
 assert.equal(new Set(all.map(q=>q.question)).size,120,'original stems are unique');
 assert.equal(new Set(all.map(q=>q.round+':'+q.number)).size,120,'no duplicate question numbers within a mock round');
 assert.ok(all.every(q=>validateWrittenQuestion(q,'industrial')),'only complete independently authored mock questions are accepted');
 assert.ok(all.every(q=>q.sourceType==='practice'&&q.authorship==='original'&&q.explanation.trim().length>=12));
 assert.ok(all.every(q=>Array.isArray(q.options)&&q.options.length===4&&new Set(q.options).size===4));
 for(const round of [1,2]){
  const rows=all.filter(q=>q.round===round);
  assert.equal(rows.length,60);
  assert.deepEqual(rows.map(q=>q.number).sort((a,b)=>a-b),Array.from({length:60},(_,i)=>i+1));
  for(const subject of ['정보시스템 기반 기술','프로그래밍언어 활용','데이터베이스 활용']){
   assert.equal(rows.filter(q=>q.subject===subject).length,20);
  }
 }
 for(const answer of [1,2,3,4])assert.equal(all.filter(q=>q.answer===answer).length,30);
 assert.ok(!all.some(q=>q.sourceVerified||q.republicationAllowed),'original mock questions must not masquerade as official or permissioned exam reproductions');
});
