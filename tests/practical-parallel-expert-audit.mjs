import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';

const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const text=p=>readFileSync(new URL(p,root),'utf8');
const normalize=v=>String(v??'').normalize('NFKC').trim().replace(/\s+/g,' ');
const tokenText=v=>normalize(v).toLowerCase().replace(/[^\p{L}\p{N}_]+/gu,' ').trim().replace(/\s+/g,' ');
const compact=v=>tokenText(v).replace(/\s+/g,'');
const forbiddenTrace=/값 변화가 있는 줄이면 바로 앞 실행 흐름|이 줄에서 확인할 실제 값|현재 값을 대입해 확인합니다|값을 계산합니다|변수 값을 추적합니다/;

function loadAll(){
  return [
    ...read('data/practical/questions.json'),
    ...read('data/practical/reconstructed-extra.json'),
    ...read('data/practical/normalized.json').questions
  ].filter(q=>q.enabled!==false);
}
function bucket(items,round){return items.filter((_,i)=>i%30===round);}
function topic(q){return [q.title,q.question,q.code,...(q.concepts||[])].join(' ');}
function traceText(q){return (q.solution?.trace||[]).join(' ');}
function allSolutionText(q){return [q.solution?.summary,...(q.solution?.flow||[]),traceText(q),q.solution?.keyPoint||''].join(' ');}
function answerVisible(q){
  const a=compact(q.answer),t=compact(traceText(q));
  return !a||t.includes(a);
}
function hasStateEvidence(q){
  if(q.questionType!=='output')return true;
  return /(?:시작 상태|초기 상태|현재|회차|호출|반환|=|→|참|거짓|\[[^\]]+\]|"[^"]+"|'[^']+'|\b\d+\b)/.test(traceText(q));
}
function directHintLeak(q){
  const a=tokenText(q.answer),h=tokenText(q.hint);
  if(!a||a.length<4)return false;
  const tokens=a.split(' ');
  if(tokens.every(x=>/^[-+]?\d+(?:\.\d+)?$/.test(x)))return false;
  return h.includes(a);
}
function common(q){
  assert.ok(q.id,q.id||'missing id');
  assert.ok(q.solution&&typeof q.solution==='object',q.id+' solution');
  assert.ok(Array.isArray(q.solution.flow)&&q.solution.flow.length>=1,q.id+' flow');
  assert.ok(Array.isArray(q.solution.trace)&&q.solution.trace.length>=1,q.id+' trace');
  assert.ok(String(q.solution.traceTitle||'').trim(),q.id+' traceTitle');
  assert.notDeepEqual(q.solution.flow,q.solution.trace,q.id+' flow/trace must serve different roles');
  for(const [i,item] of q.solution.trace.entries()){
    assert.ok(String(item||'').trim().length>=4,q.id+' trace '+i);
    assert.doesNotMatch(String(item),forbiddenTrace,q.id+' fallback trace '+i);
  }
  assert.ok(answerVisible(q),q.id+' canonical answer missing from stored trace');
  assert.ok(!('explanation' in q)&&!('steps' in q),q.id+' legacy solution fields');
}
function roleItems(role,all){
  if(['C','Java','Python','SQL'].includes(role))return all.filter(q=>q.language===role);
  return all;
}
function checkRole(role,q,history,all){
  common(q);
  const combined=q.hint+' '+allSolutionText(q);
  if(role==='C'){
    assert.ok(String(q.code||'').trim(),q.id+' code');
    assert.doesNotMatch(combined,/\bSQL\b|Java 코드|Python 코드/,q.id+' cross-language text');
    if(q.questionType==='output')assert.ok(hasStateEvidence(q),q.id+' output trace lacks concrete state');
    if(/포인터|역참조/.test(traceText(q)))assert.match(topic(q),/포인터|역참조|->|\*\s*[A-Za-z_]\w*|(?:int|char|float|double|void)\s*\*/,q.id+' phantom pointer');
    return;
  }
  if(role==='Java'){
    assert.ok(String(q.code||'').trim(),q.id+' code');
    assert.doesNotMatch(combined,/\bSQL\b|C 코드|Python 코드/,q.id+' cross-language text');
    if(q.questionType==='output')assert.ok(hasStateEvidence(q),q.id+' output trace lacks concrete state');
    return;
  }
  if(role==='Python'){
    assert.ok(String(q.code||'').trim(),q.id+' code');
    assert.ok(!/\t/.test(q.code||''),q.id+' tab indentation');
    assert.doesNotMatch(combined,/\bSQL\b|C 코드|Java 코드/,q.id+' cross-language text');
    if(q.questionType==='output')assert.ok(hasStateEvidence(q),q.id+' output trace lacks concrete state');
    return;
  }
  if(role==='SQL'){
    assert.match(q.solution.traceTitle,/^SQL /,q.id+' SQL trace title');
    assert.doesNotMatch(combined,/(?:C|Java|Python)\s*(?:언어|코드)/,q.id+' cross-language text');
    if(q.questionType==='sql_result')assert.match(q.code||'',/\bSELECT\b/i,q.id+' sql_result SELECT');
    if(q.questionType==='sql_write')assert.match(q.answer||'',/^\s*(SELECT|UPDATE|INSERT|DELETE|CREATE|ALTER|DROP|MERGE|WITH)\b/i,q.id+' SQL verb');
    return;
  }
  if(role==='DATA'){
    for(const f of ['id','language','title','question','answer','hint','sourceType','questionType','difficulty','grading'])assert.ok(String(q[f]??'').trim(),q.id+' '+f);
    assert.ok(String(q.solution.summary||'').trim().length>=12,q.id+' summary');
    assert.ok(!directHintLeak(q),q.id+' hint directly reveals answer');
    if(q.sourceType==='reconstructed'){
      assert.ok(['A','B','C'].includes(q.confidence),q.id+' confidence');
      assert.ok(Array.isArray(q.sources)&&q.sources.length>=1,q.id+' sources');
      assert.ok(history.some(h=>h.questionId===q.id),q.id+' exam history');
    }else{
      assert.equal(q.confidence,null,q.id+' non-reconstructed confidence');
      assert.ok(!history.some(h=>h.questionId===q.id),q.id+' invented exam history');
    }
    if(q.sourceType==='transformed')assert.ok(all.some(x=>x.id===q.originalQuestionId),q.id+' originalQuestionId');
    return;
  }
  if(role==='UX'){
    assert.ok(q.hint.length>=12&&q.hint.length<=520,q.id+' hint length');
    assert.ok(q.solution.summary.length<=900,q.id+' summary length');
    assert.ok(q.solution.flow.length<=4,q.id+' flow count');
    assert.ok(q.solution.trace.length<=10,q.id+' trace count');
    assert.ok(q.solution.flow.every(x=>String(x).length<=320),q.id+' flow item length');
    assert.ok(q.solution.trace.every(x=>String(x).length<=360),q.id+' trace item length');
    assert.ok(q.solution.trace.every(x=>/[가-힣]/.test(String(x))),q.id+' trace must be learner-readable Korean');
    const flowSet=new Set(q.solution.flow.map(x=>compact(x)));
    assert.ok(q.solution.trace.every(x=>!flowSet.has(compact(x))),q.id+' duplicated flow/trace sentence');
    return;
  }
}

const roles=['C','Java','Python','SQL','DATA','UX'];

if(isMainThread){
  const all=loadAll();
  assert.equal(all.length,386,'active practical question count');
  assert.equal(new Set(all.map(q=>q.id)).size,all.length,'unique ids');

  const started=Date.now();
  const workers=roles.map(role=>new Promise((resolve,reject)=>{
    const worker=new Worker(new URL(import.meta.url),{workerData:{role}});
    worker.on('message',message=>message.ok?resolve(message):reject(new Error(message.error)));
    worker.on('error',reject);
    worker.on('exit',code=>{if(code!==0)reject(new Error(role+' worker exited '+code));});
  }));
  const results=await Promise.all(workers);
  results.sort((a,b)=>roles.indexOf(a.role)-roles.indexOf(b.role));
  for(const r of results)console.log('PASS parallel '+r.role+' · 30/30 rounds · '+r.checked+' questions');
  assert.equal(results.length,6);
  assert.ok(results.every(r=>r.rounds===30));

  const ui=text('js/practical-ui.js');
  assert.match(ui,/solutionTrace\(q\)/,'UI must render stored solution.trace');
  assert.doesNotMatch(ui,/lineByLineExplanation\(q,displayCode\(q\)\)/,'UI must not generate runtime value traces');

  console.log('FINAL: 6 parallel expert workers × 30 rounds passed; 386 unique questions covered in '+(Date.now()-started)+'ms.');
}else{
  try{
    const all=loadAll(),history=read('data/practical/exam-history.json');
    const role=workerData.role,items=roleItems(role,all);
    let checked=0;
    for(let round=0;round<30;round++){
      const sample=bucket(items,round);
      for(const q of sample){checkRole(role,q,history,all);checked++;}
    }
    parentPort.postMessage({ok:true,role,rounds:30,checked});
  }catch(error){
    parentPort.postMessage({ok:false,role:workerData.role,error:String(error?.stack||error)});
  }
}
