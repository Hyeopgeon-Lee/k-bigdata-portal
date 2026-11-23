import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateWrittenQuestion} from '../js/written-exam-ui.mjs';

const destination=fileURLToPath(new URL('../data/industrial-written/questions.json',import.meta.url));
const args=process.argv.slice(2),file=args.find(arg=>arg.endsWith('.json'));
const write=args.includes('--write');
if(!file){
 console.error('사용: node scripts/import-industrial-written.mjs 입력문항.json [--write]');
 process.exit(2);
}
const parse=path=>JSON.parse(readFileSync(path,'utf8'));
const current=parse(destination);
const incoming=parse(resolve(file));
if(!Array.isArray(current)||!Array.isArray(incoming))throw Error('기존/입력 JSON은 문항 배열이어야 합니다.');
const ids=new Set(current.map(row=>row.id));
const slots=new Set(current.map(row=>[row.year,row.round,row.number].join(':')));
const invalid=[],accepted=[];
for(const [i,q] of incoming.entries()){
 const prefix='입력 '+(i+1)+'번';
 if(!validateWrittenQuestion(q,'industrial')){invalid.push(prefix+': 근거·정답·권한 검증 누락');continue;}
 const slot=[q.year,q.round,q.number].join(':');
 if(ids.has(q.id)||slots.has(slot)){invalid.push(prefix+': 중복 '+q.id+'/'+slot);continue;}
 if(new Set(q.options.map(v=>v.trim())).size!==4){invalid.push(prefix+': 선택지 중복');continue;}
 ids.add(q.id);slots.add(slot);accepted.push(q);
}
console.log(JSON.stringify({existing:current.length,incoming:incoming.length,accepted:accepted.length,errors:invalid,writeMode:write},null,2));
if(invalid.length){console.error('검증 오류가 있어 등록하지 않습니다.');process.exit(1);}
if(!write){
 console.log('검증 전용입니다. 원저작권자의 허가 근거를 직접 확인한 후 --write로 반영할 수 있습니다.');
}else{
 const sorted=[...current,...accepted].sort((a,b)=>b.year-a.year||b.round-a.round||a.number-b.number);
 writeFileSync(destination,JSON.stringify(sorted,null,2)+'\n','utf8');
 console.log('등록 완료: '+accepted.length+'문항. 배포 전 회차별 누락을 별도 확인하세요.');
}
