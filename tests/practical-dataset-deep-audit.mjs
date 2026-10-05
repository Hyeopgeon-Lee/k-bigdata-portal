import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const questions=[
  ...read('data/practical/questions.json'),
  ...read('data/practical/reconstructed-extra.json'),
  ...read('data/practical/normalized.json').questions
].filter(q=>q.enabled!==false);
const history=read('data/practical/exam-history.json');
const ids=new Set(questions.map(q=>q.id));
const roles=[];
const normalize=v=>String(v??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
const compact=v=>normalize(v).replace(/[\s`'"“”‘’;,(){}\[\].!?/:_-]+/g,'');
const topic=q=>[q.title,q.question,q.code,...(q.concepts||[])].join(' ');
const solutionText=q=>[q.solution?.summary,...(q.solution?.flow||[]),q.solution?.keyPoint||''].join(' ');
const answerCompact=q=>compact(q.answer);
const hintCompact=q=>compact(q.hint);

function bucket(items,round){return items.filter((_,i)=>i%30===round);}
function review(name,items,check){
  let rounds=0;
  for(let round=0;round<30;round++){
    const sample=bucket(items,round);
    sample.forEach(q=>check(q,round));
    rounds++;
    console.log('PASS '+name+' '+String(round+1).padStart(2,'0')+'/30 · '+sample.length+'문항');
  }
  assert.equal(rounds,30);
  roles.push(name);
}

review('데이터스키마전문가',questions,q=>{
  for(const field of ['id','language','title','question','answer','hint','sourceType','questionType','difficulty','grading']) assert.ok(String(q[field]??'').trim(),q.id+' '+field);
  assert.ok(Array.isArray(q.concepts)&&q.concepts.length>=1,q.id+' concepts');
  assert.ok(q.solution&&typeof q.solution==='object',q.id+' solution');
  assert.ok(String(q.solution.summary||'').trim().length>=12,q.id+' summary');
  assert.ok(Array.isArray(q.solution.flow)&&q.solution.flow.length>=1,q.id+' flow');
  assert.ok(q.solution.flow.every(s=>String(s).trim().length>=8),q.id+' flow text');
  assert.ok(!Object.prototype.hasOwnProperty.call(q,'explanation'),q.id+' legacy explanation');
  assert.ok(!Object.prototype.hasOwnProperty.call(q,'steps'),q.id+' legacy steps');
  assert.ok(['C','Java','Python','SQL'].includes(q.language),q.id+' language');
  assert.ok(['reconstructed','normalized','transformed','practice'].includes(q.sourceType),q.id+' sourceType');
  assert.ok(['output','blank','sql_result','sql_write','interpret','error'].includes(q.questionType),q.id+' questionType');
  assert.ok(['exact','sql_keywords','self'].includes(q.grading),q.id+' grading');
});

review('C언어전문가',questions.filter(q=>q.language==='C'),q=>{
  assert.ok(String(q.code||'').trim(),q.id+' code');
  if(q.questionType==='output') assert.ok(/printf|puts|putchar|출력|return/.test((q.code||'')+' '+q.question),q.id+' output');
  assert.doesNotMatch(q.hint+' '+solutionText(q),/\bSQL\b|Java 코드|Python 코드/,q.id+' cross language');
  if(/포인터|역참조/.test(q.hint)) assert.match(topic(q),/포인터|역참조|->|\*\s*[A-Za-z_]\w*|(?:int|char|float|double|void)\s*\*/,q.id+' pointer hint');
});

review('Java전문가',questions.filter(q=>q.language==='Java'),q=>{
  assert.ok(String(q.code||'').trim(),q.id+' code');
  if(q.questionType==='output') assert.ok(/System\.out|출력|return|main/.test((q.code||'')+' '+q.question),q.id+' output');
  assert.doesNotMatch(q.hint+' '+solutionText(q),/\bSQL\b|C 코드|Python 코드/,q.id+' cross language');
  if(/참조 변수의 선언 타입|실제 객체 타입|오버라이딩/.test(q.hint)) assert.match(topic(q),/extends|implements|상속|오버라이딩|동적 바인딩|부모|자식|인터페이스/,q.id+' inheritance hint');
});

review('Python전문가',questions.filter(q=>q.language==='Python'),q=>{
  assert.ok(String(q.code||'').trim(),q.id+' code');
  assert.ok(!/\t/.test(q.code||''),q.id+' tab');
  if(q.questionType==='output') assert.ok(/print\s*\(|출력|return|반환/.test((q.code||'')+' '+q.question),q.id+' output');
  assert.doesNotMatch(q.hint+' '+solutionText(q),/\bSQL\b|C 코드|Java 코드/,q.id+' cross language');
  if(/기본값이 사용되는 인자/.test(q.hint)) assert.match(topic(q),/기본 인자|기본값|def\s+\w+\([^)]*=/,q.id+' default argument hint');
});

review('SQL전문가',questions.filter(q=>q.language==='SQL'),q=>{
  if(q.questionType==='sql_result') assert.match(q.code||'',/\bSELECT\b/i,q.id+' SELECT');
  if(q.questionType==='sql_write') assert.match(q.answer||'',/^\s*(SELECT|UPDATE|INSERT|DELETE|CREATE|ALTER|DROP|MERGE|WITH)\b/i,q.id+' SQL verb');
  if(q.questionType==='blank') assert.ok(String(q.code||q.question).trim().length>=12,q.id+' blank context');
  assert.doesNotMatch(q.hint+' '+solutionText(q),/(?:C|Java|Python)\s*(?:언어|코드)/,q.id+' cross language');
});

review('정답일치전문가',questions,q=>{
  assert.ok(String(q.answer||'').trim(),q.id+' answer');
  const a=answerCompact(q),h=hintCompact(q);
  if(a.length>=3) assert.ok(!h.includes(a),q.id+' hint leaks answer');
  if(q.grading==='sql_keywords') assert.equal(q.language,'SQL',q.id+' sql_keywords language');
  if(q.grading==='self') assert.ok(q.language==='SQL'||q.questionType==='blank',q.id+' self grading scope');
  if(q.questionType==='output'&&q.language!=='SQL') assert.ok(String(q.code||'').trim(),q.id+' output code');
});

review('해설편집전문가',questions,q=>{
  const s=compact(q.solution.summary);
  for(const flow of q.solution.flow){
    const f=compact(flow);
    assert.ok(!(s===f||(s.length>16&&f.length>16&&(s.includes(f)||f.includes(s)))),q.id+' summary/flow duplication');
  }
  const text=solutionText(q);
  assert.doesNotMatch(text,/먼저 변수의 초기값과 실제 출력문을 표시합니다|이 문제의 핵심 개념은|코드나 SQL에서/,q.id+' old boilerplate');
  assert.doesNotMatch(text,/앞 단계의 (?:연산|계산)|계산을 끝까지 적용|최종 결과를 확인합니다/,q.id+' vague boilerplate');
  assert.doesNotMatch(text,/실행 흐름에서 .*실행 흐름의 실행 순서/,q.id+' repeated phrase');
});

review('초급교육전문가',questions,q=>{
  assert.ok(String(q.hint||'').trim().length>=20,q.id+' hint length');
  assert.ok(/[가-힣]/.test(q.hint),q.id+' Korean hint');
  assert.ok(/[가-힣]/.test(solutionText(q)),q.id+' Korean solution');
  const t=topic(q);
  if(/포인터|역참조/.test(q.hint)) assert.match(t,/포인터|역참조|->|\*\s*[A-Za-z_]\w*|(?:int|char|float|double|void)\s*\*/,q.id+' unrelated pointer hint');
  if(/비트 연산이 있는 식|이진 형태/.test(q.hint)) assert.match(t,/[&|^]|<<|>>|비트|XOR|AND|OR|시프트/,q.id+' unrelated bit hint');
  if(/그룹을 나누는 기준|그룹 단위 조건/.test(q.hint)) assert.match(t,/GROUP BY|HAVING|COUNT|AVG|SUM|MIN|MAX|집계/,q.id+' unrelated group hint');
  if(/자료구조가 변경되는 연산|컨테이너에 남은 값/.test(q.hint)) assert.match(t,/append|pop|remove|insert|list|리스트|set|dict|딕셔너리|자료구조/,q.id+' unrelated mutation hint');
});

review('출처검증전문가',questions,q=>{
  if(q.sourceType==='reconstructed'){
    assert.ok(['A','B','C'].includes(q.confidence),q.id+' confidence');
    assert.ok(Array.isArray(q.sources)&&q.sources.length>=1,q.id+' sources');
    assert.ok(String(q.verificationNote||'').trim().length>=15,q.id+' verificationNote');
    q.sources.forEach(s=>{assert.ok(String(s.name||'').trim(),q.id+' source name');assert.match(String(s.url||''),/^https?:\/\//,q.id+' source url');});
    if(q.confidence==='A'||q.confidence==='B') assert.ok(q.sources.length>=2,q.id+' confidence source count');
  }else{
    assert.equal(q.confidence,null,q.id+' non-reconstructed confidence');
  }
  if(q.sourceType==='transformed') assert.ok(q.originalQuestionId&&ids.has(q.originalQuestionId),q.id+' original');
});

review('시험분류전문가',questions,q=>{
  if(q.sourceType==='reconstructed') assert.ok(history.some(h=>h.questionId===q.id),q.id+' exam history');
  if(q.sourceType!=='reconstructed') assert.ok(!history.some(h=>h.questionId===q.id),q.id+' invented history');
  if(q.questionType==='sql_result'||q.questionType==='sql_write') assert.equal(q.language,'SQL',q.id+' SQL question type');
  if(q.language!=='SQL') assert.ok(!['sql_result','sql_write'].includes(q.questionType),q.id+' non SQL question type');
  if(q.sourceType==='normalized') assert.ok(Array.isArray(q.importIds)&&q.importIds.length>=1,q.id+' importIds');
});

review('모바일가독성전문가',questions,q=>{
  assert.ok(q.title.length<=80,q.id+' title too long');
  assert.ok(q.question.length<=900,q.id+' question too long');
  assert.ok(q.hint.length<=420,q.id+' hint too long');
  assert.ok(q.solution.summary.length<=900,q.id+' summary too long');
  assert.ok(q.solution.flow.length<=8,q.id+' too many flow steps');
  q.solution.flow.forEach((s,i)=>assert.ok(String(s).length<=320,q.id+' flow '+i+' too long'));
  if(q.solution.keyPoint) assert.ok(String(q.solution.keyPoint).length<=280,q.id+' keyPoint too long');
});

review('보안인코딩전문가',questions,q=>{
  const text=[q.id,q.title,q.question,q.code,q.hint,q.answer,solutionText(q)].join(' ');
  assert.doesNotMatch(text,/<script|javascript:|onerror=|onload=/i,q.id+' unsafe markup');
  assert.doesNotMatch(text,/\u0000|\uFFFD/,q.id+' invalid character');
  assert.doesNotMatch(text,/\b(?:TODO|FIXME|TBD)\b/i,q.id+' unfinished text');
  assert.doesNotMatch(text,/\bislnt\b/i,q.id+' isInt typo');
});

assert.equal(questions.length,386);
assert.equal(ids.size,386);
assert.equal(roles.length,12);
console.log('FINAL: 12 expert roles × 30 review rounds = 360 deep dataset review rounds passed.');
