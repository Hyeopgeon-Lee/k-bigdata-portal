import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const tests=readdirSync(new URL('./',import.meta.url)).filter(name=>/^practical.*\.test\.mjs$/.test(name)||/^practical-(30pass-audit|dataset-deep-audit|parallel-expert-audit)\.mjs$/.test(name)).sort();
let failed=0;
for(const name of tests){
 const result=spawnSync(process.execPath,[fileURLToPath(new URL(name,import.meta.url))],{encoding:'utf8'});
 if(result.status!==0){failed++;console.error('FAIL '+name+'\n'+result.stdout+result.stderr);}
 else console.log('PASS '+name);
}
console.log(`PRACTICAL SUITE: ${tests.length-failed}/${tests.length} passed; ${failed} failed`);
process.exitCode=failed?1:0;
