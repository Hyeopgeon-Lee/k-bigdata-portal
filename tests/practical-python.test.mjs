import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const bundled=resolve(dirname(process.execPath),'..','..','python','python.exe');
const python=process.env.PRACTICAL_PYTHON_BIN||(existsSync(bundled)?bundled:process.platform==='win32'?null:'python3');
if(!python){console.log('SKIP: set PRACTICAL_PYTHON_BIN to verify Python examples.');}
else{
 const questions=JSON.parse(readFileSync(new URL('../data/practical/questions.json',import.meta.url),'utf8'));
 for(const q of questions.filter(q=>q.language==='Python')){
  const result=spawnSync(python,['-I','-c',q.code],{encoding:'utf8',timeout:5000});
  assert.equal(result.status,0,q.id+': '+result.stderr);assert.equal(result.stdout.trim().replaceAll('\r',''),q.answer,q.id);
 }
 console.log('PASS: all 3 Python examples executed in isolated Python 3.');
}
