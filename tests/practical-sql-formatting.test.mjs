import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {formatCodeForDisplay,formatSqlForDisplay} from '../js/practical-core.js';

const root=new URL('../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const bank=[
 ...read('data/practical/questions.json'),
 ...read('data/practical/reconstructed-extra.json'),
 ...read('data/practical/normalized.json').questions
];
const sql=bank.filter(q=>q.language==='SQL');
assert.equal(bank.length,386);
assert.equal(sql.length,76);
let checked=0;
for(const q of sql){
 for(const original of [q.code,q.answer]){
  if(!original)continue;
  const shown=formatSqlForDisplay(original);
  assert.equal(shown.replace(/\s/g,''),original.replace(/\s/g,''),q.id+' SQL content changed');
  assert.equal(formatSqlForDisplay(shown),shown,q.id+' SQL formatting changed on second pass');
  checked++;
 }
}
const code=id=>formatCodeForDisplay(bank.find(q=>q.id===id).code,'SQL');
assert.match(code('R-SQL-0015'),/RIGHT OUTER JOIN B\n {4}ON A\.id=B\.id\nWHERE A\.id IS NULL;/);
assert.match(code('R-SQL-0010'),/\n {4}SELECT name\n {4}FROM project\n {4}WHERE project_id IN \(\n {8}SELECT project_id/);
assert.match(code('REC-023'),/\nFROM employee\)\nORDER BY name;/);
assert.match(code('REC-040'),/CASE WHEN score>=80 THEN 'PASS' ELSE 'RETRY' END/);
assert.match(code('R-IND-SQL-0005'),/^1\) SELECT 이름/m);
assert.match(formatSqlForDisplay("SELECT 'FROM JOIN WHERE' FROM T;"),/'FROM JOIN WHERE'/);
assert.match(formatSqlForDisplay("SELECT 1 -- WHERE is a comment\nFROM T;"),/-- WHERE is a comment/);
assert.ok(checked>=100);
console.log('PASS: '+sql.length+' SQL questions, '+checked+' code/answer blocks formatted without changing query tokens.');
