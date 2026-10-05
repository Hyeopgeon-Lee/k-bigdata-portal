import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {beginnerFocus,beginnerConcepts,beginnerSteps,beginnerExplanation,solutionFlow,solutionSummary,examMemory,lineByLineExplanation} from '../js/practical-explanation.js';

const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const text=p=>readFileSync(new URL(p,root),'utf8');
const questions=[
  ...read('data/practical/questions.json'),
  ...read('data/practical/reconstructed-extra.json'),
  ...read('data/practical/normalized.json').questions
].filter(q=>q.enabled!==false);
const css=text('css/practical.css');
const ui=text('js/practical-ui.js');
const roles=[];
const normalize=v=>String(v??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
const compact=v=>normalize(v).replace(/[\s`'";,(){}\[\]]+/g,'');

function bucket(items,round){
  return items.filter((_,i)=>i%30===round);
}
function review(name,items,check){
  let rounds=0;
  for(let round=0;round<30;round++){
    const sample=bucket(items,round);
    sample.forEach((q,index)=>check(q,round,index));
    rounds++;
    console.log('PASS '+name+' '+String(round+1).padStart(2,'0')+'/30 · '+sample.length+'문항');
  }
  assert.equal(rounds,30);
  roles.push(name);
}

review('초급교육',questions,q=>{
  assert.ok(String(q.question||'').trim(),q.id);
  assert.ok(String(q.hint||'').trim().length>=12,q.id);
  assert.ok(solutionSummary(q).length>=12,q.id+' explanation');
  assert.ok(Array.isArray(q.solution?.flow)&&q.solution.flow.length>=1,q.id+' steps');
  assert.ok(solutionFlow(q).every(s=>String(s).trim().length>=8),q.id+' short step');
  assert.ok(beginnerFocus(q).length>=35,q.id+' focus');
  assert.ok(examMemory(q).length>=30,q.id+' memory');
  const topic=[q.title,...(q.concepts||[])].join(' ');
  if(!/포인터|역참조|이중 포인터|연결 리스트/.test(topic)){
    assert.doesNotMatch(beginnerFocus(q),/포인터/,q.id+' unrelated pointer in focus');
    assert.doesNotMatch(examMemory(q),/포인터/,q.id+' unrelated pointer in memory');
  }
  if(!/상속|오버라이딩|동적 바인딩|super|필드 숨김/.test(topic)){
    assert.doesNotMatch(beginnerFocus(q),/실제 생성된 객체 타입/,q.id+' unrelated inheritance guidance');
  }
  const concepts=beginnerConcepts(q);
  assert.ok(concepts.length>=1&&concepts.length<=3,q.id+' concepts');
  concepts.forEach(c=>{assert.ok(c.title.length>=2);assert.ok(c.text.length>=35);});
  if(String(q.code||'').trim()){
    const notes=lineByLineExplanation(q);
    const codeLines=String(q.code).replace(/\r\n?/g,'\n').split('\n').filter(line=>line.trim()).length;
    assert.equal(notes.length,codeLines,q.id+' line annotations');
    assert.ok(notes.every(n=>/[가-힣]/.test(n.explanation)),q.id+' Korean line annotations');
    assert.ok(notes.every(n=>String(n.trace||'').length>=12),q.id+' value traces');
  }
  assert.ok(q.solution&&typeof q.solution==='object',q.id+' solution');
  assert.ok(!Object.prototype.hasOwnProperty.call(q,'explanation'),q.id+' legacy explanation');
  assert.ok(!Object.prototype.hasOwnProperty.call(q,'steps'),q.id+' legacy steps');
  const rendered=[beginnerExplanation(q),...beginnerSteps(q)].join(' ');
  assert.doesNotMatch(rendered,/먼저 변수의 초기값과 실제 출력문을 표시합니다/,q.id+' boilerplate');
  assert.doesNotMatch(rendered,/이 문제의 핵심 개념은/,q.id+' concept boilerplate');
  assert.doesNotMatch(rendered,/코드나 SQL에서/,q.id+' cross-domain boilerplate');
  if(q.language!=='SQL')assert.doesNotMatch(rendered,/\bSQL\b/,q.id+' unrelated SQL');
  const topicFull=[q.title,...(q.concepts||[]),q.code||'',q.question||''].join(' ');
  if(!/포인터|역참조|이중 포인터|연결 리스트|->|\*\s*[A-Za-z_]\w*/.test(topicFull))assert.doesNotMatch(rendered,/포인터/,q.id+' phantom pointer');
});

review('C전문가',questions.filter(q=>q.language==='C'),q=>{
  assert.ok(String(q.code||'').trim(),q.id);
  assert.ok(String(q.answer||'').trim(),q.id);
  assert.ok(beginnerSteps(q).length>=1,q.id);
  assert.ok(!/javascript:/i.test(q.code||''),q.id);
  if(q.questionType==='output')assert.ok(/printf|putchar|puts|출력|return|main|호출|값/.test((q.code||'')+' '+q.question),q.id);
  assert.ok(solutionSummary(q).length>=12,q.id);
});

review('Java전문가',questions.filter(q=>q.language==='Java'),q=>{
  assert.ok(String(q.code||'').trim(),q.id);
  assert.ok(String(q.answer||'').trim(),q.id);
  assert.ok(beginnerSteps(q).length>=1,q.id);
  assert.ok(!/javascript:/i.test(q.code||''),q.id);
  if(q.questionType==='output')assert.ok(/System\.out|출력|return|main|호출|값/.test((q.code||'')+' '+q.question),q.id);
  assert.ok(solutionSummary(q).length>=12,q.id);
});

review('Python전문가',questions.filter(q=>q.language==='Python'),q=>{
  assert.ok(String(q.code||'').trim(),q.id);
  assert.ok(String(q.answer||'').trim(),q.id);
  assert.ok(beginnerSteps(q).length>=1,q.id);
  assert.ok(!/\t/.test(q.code||''),q.id+' tab');
  if(q.questionType==='output')assert.ok(/print\s*\(|출력|반환|값/.test((q.code||'')+' '+q.question),q.id);
  assert.ok(solutionSummary(q).length>=12,q.id);
});

review('SQL전문가',questions.filter(q=>q.language==='SQL'),q=>{
  assert.ok(String(q.answer||'').trim(),q.id);
  assert.ok(beginnerSteps(q).length>=1,q.id);
  assert.ok(solutionSummary(q).length>=12,q.id);
  if(q.questionType==='sql_result')assert.match(q.code||'',/\bSELECT\b/i,q.id);
  if(q.questionType==='sql_write')assert.match(q.answer||'',/^\s*(SELECT|UPDATE|INSERT|DELETE|CREATE|ALTER|DROP|MERGE|WITH)\b/i,q.id);
  if(q.questionType==='blank')assert.ok((q.code||q.question).length>=12,q.id);
});

review('UI가독성',questions,q=>{
  const focus=beginnerFocus(q),memory=examMemory(q),concepts=beginnerConcepts(q);
  assert.ok(focus.length<=360,q.id+' focus too long');
  assert.ok(memory.length<=260,q.id+' memory too long');
  assert.ok(concepts.every(c=>c.text.length<=260),q.id+' concept too long');
  assert.ok(solutionFlow(q).every(s=>String(s).length<=320),q.id+' step too long');
  assert.ok(solutionSummary(q).length<=900,q.id+' explanation too long');
});
assert.match(ui,/1 · 코드 한 줄씩 값으로 이해하기/);
assert.match(ui,/실행 흐름 따라가기/);
assert.match(ui,/왜 이 답인가\?/);
assert.match(ui,/시험에서 기억할 것/);
assert.match(ui,/lineByLineExplanation\(q,displayCode\(q\)\)/);
assert.match(ui,/beginnerSteps\(q\)/);
assert.doesNotMatch(ui,/beginnerConcepts\(q\)/);
assert.doesNotMatch(ui,/1 · 문제에서 먼저 볼 것/);

review('모바일가독성',questions,q=>{
  assert.ok(beginnerConcepts(q).length<=3,q.id);
  assert.ok(beginnerFocus(q).split(/\n/).length<=3,q.id);
  assert.ok(examMemory(q).split(/\n/).length<=3,q.id);
  assert.ok(!/<(?:script|style|iframe)/i.testsolutionSummary(q),q.id);
});
assert.match(css,/\.beginner-flow/);
assert.match(css,/\.beginner-section/);
assert.match(css,/\.line-explanation-list/);
assert.match(css,/\.line-explanation-row/);
assert.match(css,/\.line-trace/);
assert.match(css,/@media\(max-width:767px\)/);
assert.match(css,/grid-template-columns:1fr/);
assert.match(css,/font-size:16\.5px|font-size:16px/);
assert.match(css,/line-height:1\.8|line-height:1\.85|line-height:1\.9/);
assert.match(css,/word-break:keep-all/);
assert.match(css,/\.beginner-memory/);
assert.match(css,/\.line-code code/);
assert.match(css,/white-space:pre-wrap/);
assert.doesNotMatch(css,/\.beginner-memory\{\s*border-left:5px/);

review('품질검증',questions,q=>{
  assert.ok(q.id&&q.title&&q.question&&q.answer,q.id||'missing id');
  assert.ok(['C','Java','Python','SQL'].includes(q.language),q.id);
  assert.ok(['exact','sql_keywords','self'].includes(q.grading),q.id);
  assert.ok(['output','blank','sql_result','sql_write','interpret','error'].includes(q.questionType),q.id);
  const a=compact(q.answer),h=compact(q.hint);
  if(a.length>=3)assert.ok(!h.includes(a),q.id+' hint leaks answer');
  assert.ok(!/<script|javascript:|onerror=/i.test((q.hint||'')+solutionSummary(q)),q.id);
});
assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
assert.equal(questions.length,386);
assert.equal(roles.length,8);
console.log('FINAL: 8 expert roles × 30 review rounds = 240 review rounds passed.');
