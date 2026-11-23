import {readFileSync} from 'node:fs';
import {validateWrittenQuestion} from '../js/written-exam-ui.mjs';

const parse=relative=>JSON.parse(readFileSync(new URL('../'+relative,import.meta.url),'utf8'));
const paths=['systems','programming','database'].map(name=>'data/industrial-written/practice-'+name+'.json');
const mock=paths.flatMap(parse),pastExam=parse('data/industrial-written/questions.json');
const errors=[],groups={};
const ids=new Set(),slots=new Set(),questions=new Set();
for(const [index,q] of mock.entries()){
 if(!validateWrittenQuestion(q,'industrial'))errors.push('모의 '+(index+1)+'번 필드 누락: '+q?.id);
 if(ids.has(q.id))errors.push('중복 ID: '+q.id);
 ids.add(q.id);
 const slot=q.round+'-'+q.number;
 if(slots.has(slot))errors.push('중복 회차·번호: '+slot);
 slots.add(slot);
 if(questions.has(q.question))errors.push('동일 문제 본문: '+q.id);
 questions.add(q.question);
 if(new Set(q.options).size!==4)errors.push('선택지 중복: '+q.id);
 const group=q.round+' / '+q.subject;
 groups[group]=(groups[group]||0)+1;
}
for(const round of [1,2]){
 if(mock.filter(q=>q.round===round).length!==60)errors.push(round+'회 모의 문항 수가 60이 아닙니다.');
 for(const subject of ['정보시스템 기반 기술','프로그래밍언어 활용','데이터베이스 활용']){
  if(groups[round+' / '+subject]!==20)errors.push(round+'회 '+subject+' 20문항 불일치');
 }
}
const answerCounts=Object.fromEntries([1,2,3,4].map(i=>[i,mock.filter(q=>q.answer===i).length]));
const report={
 originalMockQuestions:mock.length,
 mockRounds:2,
 originalMockGroups:groups,
 mockAnswers:answerCounts,
 originalMocksPassStructureValidation:errors.length===0&&mock.length===120,
 actualExamQuestionsRegistered:pastExam.length,
 note:'모의문제는 AI가 자체 작성한 학습자료이며 2026년 국가기술자격 실제 출제 원문과 다릅니다. 구조 검사는 교과 정확성 전체에 대한 독립 검증을 뜻하지 않습니다.',
 errors
};
console.log(JSON.stringify(report,null,2));
if(errors.length||mock.length!==120)process.exitCode=1;
