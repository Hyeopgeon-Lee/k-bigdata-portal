import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';

const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const normalize=v=>String(v??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
const compact=v=>normalize(v).replace(/[\s`'"“”‘’;,(){}\[\].!?/:_-]+/g,'');
const oldGenericHints=new Set([
  '포인터가 현재 어느 위치를 가리키는지 인덱스나 노드 이름으로 바꿔 적고, 역참조할 때 읽히는 값만 순서대로 추적하세요.',
  '반복마다 조건식, 핵심 변수, 출력 여부를 표로 적고, 건너뛰기나 종료가 발생한 지점을 별도로 표시하세요.',
  '참조 변수의 선언 타입과 실제 객체 타입을 따로 적고, 필드 접근과 메서드 호출이 각각 어떤 타입을 기준으로 결정되는지 구분하세요.',
  '각 문장이 실행된 직후 변수와 객체 상태를 한 줄씩 적고, 마지막 출력문이 실제로 참조하는 값을 확인하세요.',
  '빈칸의 앞뒤 문장을 먼저 읽고, 각 위치가 데이터 선택·조건·집계·정렬·변경 중 어떤 역할인지 문장으로 바꿔 보세요.',
  '비트 연산이 있는 식은 각 피연산자를 이진 형태로 생각하고, 연산 우선순위에 따라 한 단계씩 결과를 갱신하세요.',
  '자료구조가 변경되는 연산 직후의 상태를 매번 다시 적고, 연산이 반환한 값과 컨테이너에 남은 값을 구분하세요.',
  '빈칸의 앞뒤 연산자와 자료형을 먼저 확인하고, 그 자리에 들어갈 표현식이 전체 문장의 역할과 맞는지 검토하세요.'
]);

function loadAll(){
  return [
    ...read('data/practical/questions.json'),
    ...read('data/practical/reconstructed-extra.json'),
    ...read('data/practical/normalized.json').questions
  ].filter(q=>q.enabled!==false);
}
function bucket(items,round){return items.filter((_,i)=>i%30===round);}
function topic(q){return [q.title,q.question,q.code,...(q.concepts||[])].join(' ');}
function solution(q){return [q.solution?.summary,...(q.solution?.flow||[]),q.solution?.keyPoint||''].join(' ');}

function roleItems(role,all){
  if(role==='C') return all.filter(q=>q.language==='C');
  if(role==='Java') return all.filter(q=>q.language==='Java');
  if(role==='Python') return all.filter(q=>q.language==='Python');
  if(role==='SQL') return all.filter(q=>q.language==='SQL');
  return all;
}
function check(role,q,history,all){
  if(role==='스키마'){
    for(const f of ['id','language','title','question','answer','hint','sourceType','questionType','difficulty','grading']) assert.ok(String(q[f]??'').trim(),q.id+' '+f);
    assert.ok(q.solution&&String(q.solution.summary||'').trim().length>=12,q.id+' summary');
    assert.ok(Array.isArray(q.solution.flow)&&q.solution.flow.length>=1,q.id+' flow');
    assert.ok(!('explanation' in q)&&!('steps' in q),q.id+' legacy');
    return;
  }
  if(role==='C'){
    assert.ok(String(q.code||'').trim(),q.id+' code');
    assert.doesNotMatch(q.hint+' '+solution(q),/\bSQL\b|Java 코드|Python 코드/,q.id+' cross language');
    return;
  }
  if(role==='Java'){
    assert.ok(String(q.code||'').trim(),q.id+' code');
    assert.doesNotMatch(q.hint+' '+solution(q),/\bSQL\b|C 코드|Python 코드/,q.id+' cross language');
    if(q.id==='R-JAVA-0010') assert.match(q.hint,/catch|finally|예외/,q.id+' exception hint');
    return;
  }
  if(role==='Python'){
    assert.ok(String(q.code||'').trim(),q.id+' code');
    assert.ok(!/\t/.test(q.code||''),q.id+' tab');
    assert.doesNotMatch(q.hint+' '+solution(q),/\bSQL\b|C 코드|Java 코드/,q.id+' cross language');
    return;
  }
  if(role==='SQL'){
    if(q.questionType==='sql_result') assert.match(q.code||'',/\bSELECT\b/i,q.id+' select');
    if(q.questionType==='sql_write') assert.match(q.answer||'',/^\s*(SELECT|UPDATE|INSERT|DELETE|CREATE|ALTER|DROP|MERGE|WITH)\b/i,q.id+' verb');
    assert.doesNotMatch(q.hint+' '+solution(q),/(?:C|Java|Python)\s*(?:언어|코드)/,q.id+' cross language');
    return;
  }
  if(role==='정답'){
    assert.ok(String(q.answer||'').trim(),q.id+' answer');
    const a=compact(q.answer),h=compact(q.hint);
    if(a.length>=3) assert.ok(!h.includes(a),q.id+' hint leaks answer');
    if(q.questionType==='sql_result'||q.questionType==='sql_write') assert.equal(q.language,'SQL',q.id+' sql type');
    return;
  }
  if(role==='해설'){
    const s=compact(q.solution.summary);
    for(const f of q.solution.flow){
      const x=compact(f);
      assert.ok(!(s===x||(s.length>16&&x.length>16&&(s.includes(x)||x.includes(s)))),q.id+' summary-flow duplicate');
    }
    assert.doesNotMatch(solution(q),/먼저 변수의 초기값과 실제 출력문을 표시합니다|이 문제의 핵심 개념은|코드나 SQL에서|앞 단계의 (?:연산|계산)|계산을 끝까지 적용|최종 결과를 확인합니다/,q.id+' boilerplate');
    return;
  }
  if(role==='힌트'){
    assert.ok(!oldGenericHints.has(q.hint),q.id+' old generic hint');
    const t=topic(q),h=q.hint||'';
    if(/포인터|역참조/.test(h)) assert.match(t,/포인터|역참조|->|\*\s*[A-Za-z_]\w*|(?:int|char|float|double|void)\s*\*/,q.id+' pointer hint');
    if(/비트 연산자|2진수/.test(h)&&/연산자/.test(h)) assert.match(t,/[&|^]|<<|>>|비트|XOR|AND|OR|시프트/,q.id+' bit hint');
    return;
  }
  if(role==='초급교육'){
    assert.ok(q.hint.length>=20,q.id+' hint short');
    assert.ok(/[가-힣]/.test(q.hint),q.id+' Korean hint');
    assert.ok(/[가-힣]/.test(solution(q)),q.id+' Korean solution');
    assert.ok(q.solution.flow.every(s=>String(s).trim().length>=8),q.id+' flow short');
    return;
  }
  if(role==='출처'){
    if(q.sourceType==='reconstructed'){
      assert.ok(['A','B','C'].includes(q.confidence),q.id+' confidence');
      assert.ok(q.sources?.length>=1,q.id+' sources');
      if(['A','B'].includes(q.confidence)) assert.ok(q.sources.length>=2,q.id+' source count');
      assert.ok(history.some(h=>h.questionId===q.id),q.id+' history');
    }else{
      assert.equal(q.confidence,null,q.id+' confidence null');
      assert.ok(!history.some(h=>h.questionId===q.id),q.id+' invented history');
    }
    if(q.sourceType==='transformed') assert.ok(all.some(x=>x.id===q.originalQuestionId),q.id+' original');
    return;
  }
  if(role==='모바일'){
    assert.ok(q.title.length<=80,q.id+' title');
    assert.ok(q.question.length<=900,q.id+' question');
    assert.ok(q.hint.length<=520,q.id+' hint');
    assert.ok(q.solution.summary.length<=900,q.id+' summary');
    assert.ok(q.solution.flow.length<=8,q.id+' flow count');
    assert.ok(q.solution.flow.every(s=>String(s).length<=320),q.id+' flow len');
    return;
  }
  if(role==='보안'){
    const text=[q.id,q.title,q.question,q.code,q.answer,q.hint,solution(q)].join(' ');
    assert.doesNotMatch(text,/<script|javascript:|onerror=|onload=/i,q.id+' unsafe');
    assert.doesNotMatch(text,/\b(?:TODO|FIXME|TBD)\b/i,q.id+' unfinished');
    assert.doesNotMatch(text,/\bislnt\b/i,q.id+' typo');
    return;
  }
}

const roles=['스키마','C','Java','Python','SQL','정답','해설','힌트','초급교육','출처','모바일','보안'];

if(isMainThread){
  const started=Date.now();
  const workers=roles.map(role=>new Promise((resolve,reject)=>{
    const worker=new Worker(new URL(import.meta.url),{workerData:{role}});
    worker.on('message',resolve);
    worker.on('error',reject);
    worker.on('exit',code=>{if(code!==0)reject(new Error(role+' worker exited '+code));});
  }));
  const results=await Promise.all(workers);
  results.sort((a,b)=>roles.indexOf(a.role)-roles.indexOf(b.role));
  for(const r of results) console.log('PASS parallel '+r.role+' · 30/30 rounds · '+r.checked+' checks');
  assert.equal(results.length,12);
  assert.ok(results.every(r=>r.rounds===30));
  console.log('FINAL: 12 parallel expert workers × 30 rounds = 360 parallel review rounds passed in '+(Date.now()-started)+'ms.');
}else{
  const all=loadAll();
  const history=read('data/practical/exam-history.json');
  const role=workerData.role;
  const items=roleItems(role,all);
  if(role==='힌트'){
    const freq=new Map();
    for(const q of all){const h=String(q.hint||'').trim();freq.set(h,(freq.get(h)||0)+1);}
    const repeated=[...freq.entries()].filter(([,count])=>count>=10);
    assert.deepEqual(repeated,[],JSON.stringify(repeated,null,2));
  }
  let checked=0;
  for(let round=0;round<30;round++){
    const sample=bucket(items,round);
    for(const q of sample){check(role,q,history,all);checked++;}
  }
  parentPort.postMessage({role,rounds:30,checked});
}
