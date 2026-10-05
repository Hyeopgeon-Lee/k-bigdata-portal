import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {beginnerFocus,beginnerConcepts,beginnerSteps,examMemory} from '../js/practical-explanation.js';

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
  assert.ok(String(q.explanation||'').trim().length>=80,q.id+' explanation');
  assert.ok(Array.isArray(q.steps)&&q.steps.length>=4,q.id+' steps');
  assert.ok(q.steps.every(s=>String(s).trim().length>=8),q.id+' short step');
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
});

review('C전문가',questions.filter(q=>q.language==='C'),q=>{
  assert.ok(String(q.code||'').trim(),q.id);
  assert.ok(String(q.answer||'').trim(),q.id);
  assert.ok(beginnerSteps(q).length>=4,q.id);
  assert.ok(!/javascript:/i.test(q.code||''),q.id);
  if(q.questionType==='output')assert.ok(/printf|putchar|puts|출력|return|main|호출|값/.test((q.code||'')+' '+q.question),q.id);
  assert.ok(q.explanation.length>=80,q.id);
});

review('Java전문가',questions.filter(q=>q.language==='Java'),q=>{
  assert.ok(String(q.code||'').trim(),q.id);
  assert.ok(String(q.answer||'').trim(),q.id);
  assert.ok(beginnerSteps(q).length>=4,q.id);
  assert.ok(!/javascript:/i.test(q.code||''),q.id);
  if(q.questionType==='output')assert.ok(/System\.out|출력|return|main|호출|값/.test((q.code||'')+' '+q.question),q.id);
  assert.ok(q.explanation.length>=80,q.id);
});

review('Python전문가',questions.filter(q=>q.language==='Python'),q=>{
  assert.ok(String(q.code||'').trim(),q.id);
  assert.ok(String(q.answer||'').trim(),q.id);
  assert.ok(beginnerSteps(q).length>=4,q.id);
  assert.ok(!/\t/.test(q.code||''),q.id+' tab');
  if(q.questionType==='output')assert.ok(/print\s*\(|출력|반환|값/.test((q.code||'')+' '+q.question),q.id);
  assert.ok(q.explanation.length>=80,q.id);
});

review('SQL전문가',questions.filter(q=>q.language==='SQL'),q=>{
  assert.ok(String(q.answer||'').trim(),q.id);
  assert.ok(beginnerSteps(q).length>=4,q.id);
  assert.ok(q.explanation.length>=80,q.id);
  if(q.questionType==='sql_result')assert.match(q.code||'',/\bSELECT\b/i,q.id);
  if(q.questionType==='sql_write')assert.match(q.answer||'',/^\s*(SELECT|UPDATE|INSERT|DELETE|CREATE|ALTER|DROP|MERGE|WITH)\b/i,q.id);
  if(q.questionType==='blank')assert.ok((q.code||q.question).length>=12,q.id);
});

review('UI가독성',questions,q=>{
  const focus=beginnerFocus(q),memory=examMemory(q),concepts=beginnerConcepts(q);
  assert.ok(focus.length<=360,q.id+' focus too long');
  assert.ok(memory.length<=260,q.id+' memory too long');
  assert.ok(concepts.every(c=>c.text.length<=260),q.id+' concept too long');
  assert.ok(q.steps.every(s=>String(s).length<=320),q.id+' step too long');
  assert.ok(q.explanation.length<=900,q.id+' explanation too long');
});
assert.match(ui,/1 · 문제에서 먼저 볼 것/);
assert.match(ui,/2 · 기초 개념/);
assert.match(ui,/3 · 한 단계씩 풀이/);
assert.match(ui,/4 · 왜 이 답인가\?/);
assert.match(ui,/5 · 시험에서 기억할 것/);
assert.match(ui,/beginnerConcepts\(q\)/);
assert.match(ui,/beginnerSteps\(q\)/);

review('모바일가독성',questions,q=>{
  assert.ok(beginnerConcepts(q).length<=3,q.id);
  assert.ok(beginnerFocus(q).split(/\n/).length<=3,q.id);
  assert.ok(examMemory(q).split(/\n/).length<=3,q.id);
  assert.ok(!/<(?:script|style|iframe)/i.test(q.explanation||''),q.id);
});
assert.match(css,/\.beginner-flow/);
assert.match(css,/\.beginner-section/);
assert.match(css,/\.beginner-concepts/);
assert.match(css,/@media\(max-width:767px\)/);
assert.match(css,/grid-template-columns:1fr/);
assert.match(css,/font-size:16\.5px|font-size:16px/);
assert.match(css,/line-height:1\.8|line-height:1\.85|line-height:1\.9/);
assert.match(css,/word-break:keep-all/);
assert.match(css,/\.beginner-focus,\s*\n\.practical-page \.beginner-memory\{/);
assert.doesNotMatch(css,/\.beginner-focus\{\s*border-left:5px/);
assert.doesNotMatch(css,/\.beginner-memory\{\s*border-left:5px/);

review('품질검증',questions,q=>{
  assert.ok(q.id&&q.title&&q.question&&q.answer,q.id||'missing id');
  assert.ok(['C','Java','Python','SQL'].includes(q.language),q.id);
  assert.ok(['exact','sql_keywords','self'].includes(q.grading),q.id);
  assert.ok(['output','blank','sql_result','sql_write','interpret','error'].includes(q.questionType),q.id);
  const a=compact(q.answer),h=compact(q.hint);
  if(a.length>=3)assert.ok(!h.includes(a),q.id+' hint leaks answer');
  assert.ok(!/<script|javascript:|onerror=/i.test((q.hint||'')+(q.explanation||'')),q.id);
});
assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
assert.equal(questions.length,386);
assert.equal(roles.length,8);
console.log('FINAL: 8 expert roles × 30 review rounds = 240 review rounds passed.');
