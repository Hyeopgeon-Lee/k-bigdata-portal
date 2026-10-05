import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {formatCodeForDisplay} from '../js/practical-core.js';

const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const questions=[
  ...read('data/practical/questions.json'),
  ...read('data/practical/reconstructed-extra.json'),
  ...read('data/practical/normalized.json').questions
].filter(q=>q.enabled!==false&&(q.language==='C'||q.language==='Java')&&String(q.code||'').trim());

const normalizeAuthored=code=>String(code??'')
  .replace(/\r\n?/g,'\n')
  .split('\n')
  .map(line=>line.replace(/\t/g,'    ').replace(/[ \t]+$/,''))
  .join('\n')
  .trim();
const indent=line=>(line.match(/^ */)||[''])[0].length;
const hasAuthoredIndentation=code=>{
  const lines=String(code??'').replace(/\r\n?/g,'\n').split('\n');
  return lines.length>1&&lines.some(line=>/^[ \t]+[^\s]/.test(line));
};

let preserved=0,braceLessBodies=0;
for(const q of questions){
  const shown=formatCodeForDisplay(q.code,q.language);
  if(hasAuthoredIndentation(q.code)){
    preserved++;
    assert.equal(shown,normalizeAuthored(q.code),q.id+' authored multiline formatting changed');

    const lines=shown.split('\n');
    for(let i=0;i<lines.length-1;i++){
      const control=lines[i].trim();
      if(!/^(?:for|if|while)\s*\(.*\)\s*$/.test(control)||control.includes('{'))continue;
      let j=i+1;
      while(j<lines.length&&!lines[j].trim())j++;
      if(j>=lines.length)continue;
      const child=lines[j];
      if(child.trim()==='}'||/^else\b/.test(child.trim()))continue;
      braceLessBodies++;
      assert.ok(indent(child)>indent(lines[i]),q.id+' line '+(i+1)+' brace-less body indentation flattened');
    }
  }
}

const target=questions.find(q=>q.id==='R-IND-JAVA-0006');
assert.ok(target,'R-IND-JAVA-0006 missing');
const shown=formatCodeForDisplay(target.code,target.language);
assert.match(shown,/    static void init\(int\[\]\[\] a\) \{\n        for \(int i = 0; i < 3; i\+\+\)\n            for \(int j = 0; j < 3; j\+\+\)\n                a\[i\]\[j\] = 0;/);
assert.match(shown,/    static void data\(int\[\]\[\] a\) \{\n        int v = 1;\n        for \(int i = 0; i < 3; i\+\+\)\n            for \(int j = i; j < 3; j\+\+\)\n                a\[i\]\[j\] = v\+\+;/);

assert.ok(preserved>=220,'expected broad authored-indentation coverage');
assert.ok(braceLessBodies>=20,'expected brace-less control coverage');
console.log('PASS: preserved '+preserved+' authored C/Java code blocks; verified '+braceLessBodies+' brace-less control bodies including R-IND-JAVA-0006.');
