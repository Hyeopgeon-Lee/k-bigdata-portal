import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {validateWrittenQuestion} from '../js/written-exam-ui.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=relative=>JSON.parse(readFileSync(new URL('../'+relative,import.meta.url),'utf8'));
const questions=read('data/industrial-written/questions.json');
const catalog=read('data/industrial-written/sources.json');
const errors=[],warnings=[];

const isHttps=value=>{
 try{return new URL(value).protocol==='https:';}catch{return false;}
};
if(!Array.isArray(questions))errors.push('questions.json은 JSON 배열이어야 합니다.');
if(!Array.isArray(catalog.years)||catalog.examType!=='industrial')errors.push('sources.json의 형식이 올바르지 않습니다.');
const years=catalog.years||[];
const sortedYears=years.map(y=>y.year).sort((a,b)=>a-b);
if(JSON.stringify(sortedYears)!==JSON.stringify([2020,2021,2022,2023,2024,2025,2026]))errors.push('2020~2026 연도별 자료 목록이 누락되었거나 중복되었습니다.');

let referenceCount=0;
for(const year of years){
 if(!Array.isArray(year.materials)){errors.push(year.year+'년 자료 배열 누락');continue;}
 for(const source of year.materials){
  referenceCount++;
  if(!isHttps(source.url))errors.push(year.year+'년 자료 링크 HTTPS 검증 실패: '+source.label);
  if(!source.verified||!source.rights)errors.push(year.year+'년 자료 메타데이터 누락: '+source.label);
 }
}
const ids=new Set(),slots=new Set();
const byYear=Object.fromEntries(Array.from({length:7},(_,i)=>[2020+i,0]));
for(const [index,q] of (Array.isArray(questions)?questions:[]).entries()){
 const prefix='#'+(index+1)+' ';
 if(!q||typeof q!=="object"){errors.push(prefix+"문항 객체가 아닙니다.");continue;}
 if(!validateWrittenQuestion(q,'industrial'))errors.push(prefix+'문항·정답·출처·허가 증빙 불완전: '+(q?.id||'ID 없음'));
 if(ids.has(q.id))errors.push(prefix+'중복 ID: '+q.id);
 ids.add(q.id);
 const slot=[q.year,q.round,q.number].join('-');
 if(slots.has(slot))errors.push(prefix+'동일 회차 중복 문항번호: '+slot);
 slots.add(slot);
 if(q.year in byYear)byYear[q.year]++;
 if(Array.isArray(q.options)&&new Set(q.options.map(s=>s.trim())).size!==4)errors.push(prefix+'선택지 중복');
 if(q.evidence?.rightsUrl===q.sourceUrl)warnings.push(prefix+'허가 근거 URL이 원문 출처와 같습니다. 실제 재게시 허가인지 수동 검증하세요.');
}
const complete=false; // Official CBT corpus is not public; link discovery cannot certify 100% original exam coverage.
const summary={
 asOf:catalog.checkedAt||null,
 yearsIndexed:sortedYears.length,
 externalMaterialsReferenced:referenceCount,
 verifiedQuestionsRegistered:Array.isArray(questions)?questions.length:null,
 questionsByYear:byYear,
 completeOriginalCorpusVerified:complete,
 blockers:[
  '2020년 4회부터 CBT 원본 전체 문항·정답이 공식 공개되지 않음',
  '원저작권자의 재게시 허가가 확인되지 않은 자료 존재',
  '회차별 실제 출제 전체와 데이터의 일대일 대조가 불가능'
 ],
 warnings,errors
};
console.log(JSON.stringify(summary,null,2));
if(errors.length||(process.argv.includes('--require-complete')&&!complete))process.exitCode=1;
