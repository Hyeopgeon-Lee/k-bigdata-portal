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
const history=read('data/practical/exam-history.json').filter(h=>h.examType==='engineer');
const ids=[...new Set(history.map(h=>h.questionId))];
const q=id=>{const item=byId.get(id);assert.ok(item,id+' missing');return item;};

assert.equal(history.length,113,'engineer exam history count changed unexpectedly');
assert.equal(ids.length,113,'engineer unique reconstructed question count changed unexpectedly');

const numbered=history.filter(h=>Number.isInteger(h.questionNumber));
assert.equal(new Set(numbered.map(h=>[h.year,h.round,h.questionNumber].join('-'))).size,numbered.length,'duplicate numbered engineer exam slot');
for(const h of history){
  const item=q(h.questionId);
  assert.equal(item.sourceType,'reconstructed',h.questionId+' must remain reconstructed');
  if(h.questionNumber==null){
    assert.match(String(h.verificationNote||''),/번호|순서|추정/,h.questionId+' null question number needs explicit uncertainty note');
  }else{
    assert.ok(h.questionNumber>=1&&h.questionNumber<=20,h.questionId+' invalid question number');
  }
  assert.ok(Array.isArray(item.sources)&&item.sources.length>=1,h.questionId+' missing sources');
  assert.ok(item.sources.some(s=>s.url===h.sourceUrl),h.questionId+' missing primary history source '+h.sourceUrl);
  assert.ok(String(item.verificationNote||'').trim(),h.questionId+' missing verification note');
}

// 2020-1: source explicitly identifies these as questions 12 and 13.
assert.equal(history.find(h=>h.questionId==='R-C-0001')?.questionNumber,12);
assert.equal(history.find(h=>h.questionId==='R-JAVA-0001')?.questionNumber,13);
assert.match(q('R-C-0001').code,/int a\[5\] = \{75, 95, 85, 100, 50\}/);
assert.match(q('R-C-0001').code,/int i, j;/);
assert.match(q('R-C-0001').code,/int temp;/);
assert.match(q('R-JAVA-0001').code,/public class Soojebi/);
assert.match(q('R-JAVA-0001').code,/int a\[\] = \{0, 1, 2, 3\}/);

// 2022-1: preserve original func1/func2 object-reference structure.
assert.match(q('R-JAVA-0034').code,/static void func1\(A m\)/);
assert.match(q('R-JAVA-0034').code,/static void func2\(A m\)/);
assert.match(q('R-JAVA-0034').code,/A m = new A\(\)/);
assert.equal(q('R-JAVA-0034').answer,'2000');

// 2024-1: source identifiers and control structure are part of the reconstructed code.
assert.match(q('R-JAVA-0003').code,/class Connection/);
assert.match(q('R-JAVA-0003').code,/Connection conn1 = Connection\.get\(\)/);
assert.match(q('R-C-0005').code,/char \*fir_str/);
assert.match(q('R-C-0005').code,/char \*end_str/);
assert.match(q('R-PY-0006').code,/^a = \["Seoul"/);
assert.match(q('R-PY-0006').code,/str = "S"/);
assert.doesNotMatch(JSON.stringify(q('R-PY-0006').acceptedAnswers||[]),/Soyaaar/);
assert.match(q('R-JAVA-0004').code,/class classOne/);
assert.match(q('R-JAVA-0004').code,/class classTwo extends classOne/);
assert.match(q('R-C-0006').code,/else if \(!\(isupper\(p\[i\]\) \|\| islower\(p\[i\]\) \|\| isdigit\(p\[i\]\)\)\)/);

// 2024-2: keep full source semantics instead of simplified equivalents.
assert.match(q('R-JAVA-0005').code,/if \(a == b\)[\s\S]*System\.out\.print\("O"\)[\s\S]*else[\s\S]*System\.out\.print\("N"\)/);
assert.match(q('R-PY-0007').code,/def fnCalculation\(x, y\)/);
assert.match(q('R-PY-0007').code,/a = "abdcabcabca"/);
assert.match(q('R-SQL-0007').question,/신입 사원/);
assert.match(q('R-SQL-0007').question,/부서 테이블/);
assert.equal(q('R-SQL-0007').answer,'VALUES SELECT FROM SET');

// 2024-3: preserve source function/class identifiers.
assert.match(q('R-PY-0009').code,/def func\(lst\)/);
assert.match(q('R-C-0012').code,/int func\(\)/);
assert.match(q('R-C-0012').code,/static int x = 0/);
assert.match(q('R-C-0013').code,/void func\(struct Node \*node\)/);
assert.match(q('R-C-0013').code,/struct Node \*current/);
assert.match(q('R-PY-0010').code,/def func\(value\)/);
assert.match(q('R-JAVA-0011').code,/class B/);
assert.match(q('R-JAVA-0011').code,/class D extends B/);

// 2025-1/2: source naming and pointer/reference structure.
assert.match(q('R-C-0023').code,/typedef struct Data/);
assert.match(q('R-C-0023').code,/Data\* insert/);
assert.match(q('R-C-0023').code,/Data\* reconnect/);
assert.match(q('R-JAVA-0013').code,/change\(String\[\] data, String s\)/);
assert.match(q('R-JAVA-0016').code,/class BO/);
assert.match(q('R-JAVA-0016').code,/BO t = arr\[0\]/);
assert.match(q('R-PY-0011').code,/^lst = \[1,2,3\]/);
assert.match(q('R-PY-0011').code,/dst = \{i: i\*2 for i in lst\}/);

// 2025-3: primary source's full class context must remain.
assert.match(q('R-JAVA-0006').code,/interface Machine/);
assert.match(q('R-JAVA-0006').code,/class WashingMachine \[빈칸\] Machine/);
assert.match(q('R-JAVA-0007').code,/class Rectangle/);
assert.match(q('R-JAVA-0007').code,/class Square extends Rectangle/);
assert.match(q('R-JAVA-0008').code,/enum Tri/);
assert.match(q('R-JAVA-0008').code,/public String code\(\)/);

// 2026-1: don't normalize away the source's identifiers.
assert.match(q('R-C-0018').code,/double arr1\(int p\[\], int len\)/);
assert.match(q('R-C-0018').code,/double arr2\(int \*p, int len\)/);
assert.match(q('R-JAVA-0017').code,/A a = new B\(\)/);
assert.match(q('R-PY-0012').code,/^i = input\(\)/);
assert.match(q('R-PY-0012').code,/c = ''.join/);
assert.match(q('R-C-0019').code,/struct fns/);
assert.match(q('R-C-0019').code,/int \*dummy/);
assert.match(q('R-PY-0013').code,/^lst = list\(range\(10\)\)/);
assert.match(q('R-PY-0014').code,/def f\(a\)/);
assert.match(q('R-JAVA-0018').code,/int x1 = 9/);
assert.match(q('R-JAVA-0018').code,/String x3 = "3"/);

console.log('PASS: engineer source fidelity · 113 history entries · 113 unique reconstructed questions · high-risk source anchors verified.');
