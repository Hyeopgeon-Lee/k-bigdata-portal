import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateWrittenQuestion} from '../js/written-exam-ui.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

const valid={
 id:'2026-2-001',examType:'industrial',year:2026,round:2,number:1,
 question:'다음 중 옳은 것은?',options:['A','B','C','D'],answer:2,
 sourceType:'official',sourceUrl:'https://example.org/exam',
 sourceVerified:true,answerVerified:true,republicationAllowed:true
};

test('written exam rejects unverified or unauthorized source data',()=>{
 assert.equal(validateWrittenQuestion(valid,'industrial'),true);
 assert.equal(validateWrittenQuestion({...valid,sourceVerified:false},'industrial'),false);
 assert.equal(validateWrittenQuestion({...valid,answerVerified:false},'industrial'),false);
 assert.equal(validateWrittenQuestion({...valid,republicationAllowed:false},'industrial'),false);
 assert.equal(validateWrittenQuestion({...valid,sourceType:'unknown'},'industrial'),false);
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
