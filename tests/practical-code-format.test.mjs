import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {formatCodeForDisplay} from '../js/practical-core.js';

const root=new URL('../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const questions=[
  ...read('data/practical/questions.json'),
  ...read('data/practical/reconstructed-extra.json'),
  ...read('data/practical/normalized.json').questions
];

assert.equal(questions.length,386);

const screenshot=questions.find(q=>q.id==='R-IND-C-0014');
assert.ok(screenshot,'screenshot question must remain in the bank');
const screenshotCode=formatCodeForDisplay(screenshot.code,screenshot.language);
assert.match(screenshotCode,/while\(r>=4\) \{\n {4}r=r-n;\n {4}q\+\+;\n\}/);
assert.ok(!screenshotCode.includes('while(r>=4){r=r-n;q++;}'));

const compactBlock=/\b(?:if|for|while|switch|catch|try|else|do|class|interface|struct|union)\b[^\n{=]*\{[^}\n]*\S/;
const oneLineMethod=/\)\s*\{\s*[^}\n]+\}/;
const tightBrace=/\)\{/;

for(const q of questions){
  const formatted=formatCodeForDisplay(q.code,q.language);
  assert.equal(typeof formatted,'string',q.id+' formatted code type');
  if(!q.code)continue;

  if(q.language==='C'||q.language==='Java'){
    const lines=formatted.split(/\r?\n/);
    assert.ok(!lines.some(line=>compactBlock.test(line)),q.id+' compact structural block remains');
    assert.ok(!lines.some(line=>oneLineMethod.test(line)),q.id+' one-line method/function body remains');
    assert.ok(!lines.some(line=>tightBrace.test(line)),q.id+' missing space before structural brace');

    for(const line of lines){
      const scrub=line.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,'').replace(/\/\/.*$/,'');
      let depth=0,statements=0;
      for(const c of scrub){if(c==='(')depth++;else if(c===')')depth--;else if(c===';'&&depth===0)statements++;}
      assert.ok(statements<2,q.id+' multiple top-level statements remain on one line: '+line);
      assert.ok(line.length<=100,q.id+' formatted non-SQL line is too wide: '+line.length);
    }
  }
}

const initializer='int a[] = {1, 2, 3};';
assert.equal(formatCodeForDisplay(initializer,'C'),initializer,'array initializer should stay compact');

const forHeader='for (int i = 0; i < 3; i++) { a[i]++; }';
assert.equal(
  formatCodeForDisplay(forHeader,'C'),
  'for (int i = 0; i < 3; i++) {\n    a[i]++;\n}',
  'for-header semicolons must not be split'
);

const literal='printf("{x;}"); // { not a block';
assert.equal(formatCodeForDisplay(literal,'C'),literal,'string/comment braces must remain literal');

const java='class Parent { int value() { return 3; } }';
assert.equal(
  formatCodeForDisplay(java,'Java'),
  'class Parent {\n    int value() {\n        return 3;\n    }\n}',
  'one-line Java class/method should become readable'
);

console.log('PASS: all 386 practical questions render readable code; compact C/Java blocks and multi-statement lines are normalized safely.');
