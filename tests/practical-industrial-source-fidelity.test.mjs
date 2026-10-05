import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const questions=[
  ...read('data/practical/questions.json'),
  ...read('data/practical/reconstructed-extra.json'),
  ...read('data/practical/normalized.json').questions
];
const byId=new Map(questions.map(q=>[q.id,q]));
const history=read('data/practical/exam-history.json').filter(h=>h.examType==='industrial_engineer');
const ids=[...new Set(history.map(h=>h.questionId))];
const q=id=>{const item=byId.get(id);assert.ok(item,id+' missing');return item;};

assert.equal(history.length,73,'industrial exam history count changed unexpectedly');
assert.equal(ids.length,70,'industrial unique reconstructed question count changed unexpectedly');
assert.equal(new Set(history.map(h=>[h.year,h.round,h.questionNumber].join('-'))).size,history.length,'duplicate industrial exam slot');

for(const h of history){
  const item=q(h.questionId);
  assert.equal(item.sourceType,'reconstructed',h.questionId+' must remain reconstructed');
  assert.ok(h.questionNumber>=1&&h.questionNumber<=20,h.questionId+' invalid question number');
  assert.ok(Array.isArray(item.sources)&&item.sources.length>=1,h.questionId+' missing sources');
  assert.ok(item.sources.some(s=>s.url===h.sourceUrl),h.questionId+' missing primary history source '+h.sourceUrl);
  assert.ok(String(item.verificationNote||'').trim(),h.questionId+' missing verification note');
}

// 2022-1 #18: original condition must remain, not only two function names.
assert.match(q('R-IND-SQL-0001').question,/학생 수가 5명 이상/);
assert.match(q('R-IND-SQL-0001').question,/중간고사 평균/);
assert.equal(q('R-IND-SQL-0001').answer,'AVG COUNT');

// 2023-1 #18: answer 1234526 is only solvable when source flowchart numbering is visible.
{
  const x=q('R-IND-C-0013');
  for(const label of ['①','②','③','④','⑤','⑥'])assert.match(x.code,new RegExp(label),x.id+' missing '+label);
  assert.match(x.question,/문장 커버리지/);
  assert.equal(x.answer,'1234526');
}

// 2023-3 #13: preserve full pointer-parameter context.
{
  const x=q('R-IND-C-0019');
  assert.match(x.code,/int compare\(int i, int j, int \*ma, int \*in\)/);
  assert.match(x.code,/compare\(3, 7, \(가\), \(나\)\)/);
  assert.equal(x.answer,'&max &min');
}

// 2024-1 #6: the source has five blanks; never collapse it to only three SQL keywords.
{
  const x=q('R-IND-SQL-0004');
  assert.match(x.question,/표\(table\).*기본 단위를 \(가\)/s);
  assert.match(x.question,/가능한 값의 집합을 \(나\)/s);
  assert.match(x.code,/\(다\)/);
  assert.match(x.code,/\(라\)/);
  assert.match(x.code,/\(마\)/);
  assert.equal(x.answer,'릴레이션 도메인 AND HAVING VALUES');
}

// 2024-1 #9: both source processing conditions must remain.
{
  const x=q('R-IND-SQL-0005');
  assert.match(x.question,/3학년 이상의 전자계산과/);
  assert.match(x.question,/PNO.*1, 2, 3/s);
  assert.match(x.question,/JUNO.*중복 없이/s);
  assert.equal(x.answer,'AND DISTINCT IN');
}

// 2024-2 #12/#13: processing conditions are part of the question, not optional prose.
{
  const x=q('R-IND-SQL-0009');
  assert.match(x.question,/윤정희/);
  assert.match(x.question,/임선호/);
  assert.equal(x.answer,'INTO VALUES SET');
}
{
  const x=q('R-IND-SQL-0010');
  assert.match(x.question,/성별이 '여'.*'GOLD'/s);
  assert.match(x.question,/가입년도를 기준으로 오름차순/);
  assert.match(x.question,/김.*시작하지 않는/s);
  assert.equal(x.answer,'AND ASC NOT');
}

// 2022-3 #15: preserve source method name and nested loop structure.
{
  const x=q('R-IND-JAVA-0006');
  assert.match(x.code,/prnt\(a\)/);
  assert.match(x.code,/static void prnt\(int\[\]\[\] a\)/);
  assert.match(x.code,/for \(int i = 0; i < 3; i\+\+\)\n\s+for \(int j = i; j < 3; j\+\+\)/);
  assert.equal(x.answer,'123\n 45\n  6');
}

// 2024-3 #9/#14/#18/#19: do not rename/rewrite source structures into invented equivalents.
assert.match(q('R-IND-C-0026').code,/void func\(int \*arr, int n\)/);
assert.match(q('R-IND-C-0026').code,/int \*ptr1 = &arr\[0\]/);
assert.match(q('R-IND-C-0027').code,/int factorial\(int n, int from, int to, int temp\)/);
assert.match(q('R-JAVA-0012').code,/class Collection<T>/);
assert.match(q('R-JAVA-0012').code,/new Collection<>\(0\)\.print\(\)/);
assert.match(q('R-IND-C-0028').code,/int num = 6/);
assert.match(q('R-IND-C-0028').code,/num = arr\[2\]/);

// 2025-3: preserve publisher-preview identifiers and output form.
assert.match(q('R-IND-PY-0003').code,/^a=\{/);
assert.match(q('R-IND-PY-0003').code,/a\.get\("grade","none"\)/);
assert.match(q('R-IND-SQL-0012').code,/CONSTRAINT const_gd \[빈칸\]/);
assert.match(q('R-IND-C-0029').code,/printf\("%d ", \*p \+ \*\(p - 1\)\)/);

console.log('PASS: industrial source fidelity · 73 history entries · 70 unique reconstructed questions · high-risk source anchors verified.');
