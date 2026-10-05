import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const base=read('data/practical/questions.json');
const extra=read('data/practical/reconstructed-extra.json');
const imported=read('data/practical/normalized.json').questions;
const questions=[...base,...extra,...imported];

assert.equal(questions.length,386,'current practical bank size');
assert.equal(new Set(questions.map(q=>q.id)).size,questions.length,'question ids must be unique');

const normalize=value=>String(value??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
const banned=[/정답은/i,/정답[:：]/i,/최종\s*답/i,/출력은\s*['"0-9a-z가-힣]/i,/답은\s*['"0-9a-z가-힣]/i];

for(const q of questions){
  assert.equal(typeof q.hint,'string',q.id+' hint type');
  assert.ok(q.hint.trim().length>=25,q.id+' hint too short');
  assert.ok(q.hint.trim().length<=180,q.id+' hint too long');
  assert.ok(!banned.some(pattern=>pattern.test(q.hint)),q.id+' hint must guide without directly announcing an answer');

  const answer=normalize(q.answer);
  const hint=normalize(q.hint);
  if(answer.length>=2) assert.ok(!hint.includes(answer),q.id+' hint contains the exact answer');

  assert.ok(!/[<>]{2,}|javascript:/i.test(q.hint),q.id+' suspicious hint content');
  assert.ok(/[가-힣]/.test(q.hint),q.id+' hint should be learner-facing Korean');

  if(q.language==='SQL'){
    assert.ok(/확인|구분|적|나눠|먼저|단계|표시|조립/.test(q.hint),q.id+' SQL hint should describe a solving action');
  }else{
    assert.ok(/적|확인|표시|추적|구분|찾|계산|반영/.test(q.hint),q.id+' code hint should describe a tracing action');
  }
}

assert.equal(questions.filter(q=>q.language==='C').length,161);
assert.equal(questions.filter(q=>q.language==='Java').length,97);
assert.equal(questions.filter(q=>q.language==='Python').length,52);
assert.equal(questions.filter(q=>q.language==='SQL').length,76);
assert.equal(questions.filter(q=>q.sourceType==='reconstructed').length,182);
assert.equal(questions.filter(q=>q.sourceType==='normalized').length,142);
assert.equal(questions.filter(q=>q.sourceType==='transformed').length,58);
assert.equal(questions.filter(q=>q.sourceType==='practice').length,4);

console.log('PASS: all 386 practical questions have concise, learner-facing, non-answer-revealing hints.');
