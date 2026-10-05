import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {beginnerSteps,beginnerExplanation,solutionFlow,solutionSummary,solutionTrace,lineByLineExplanation} from '../js/practical-explanation.js';

const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const base=read('data/practical/questions.json');
const extra=read('data/practical/reconstructed-extra.json');
const normalizedFile=read('data/practical/normalized.json');
const history=read('data/practical/exam-history.json');
const questions=[...base,...extra,...normalizedFile.questions];
const enabled=questions.filter(q=>q.enabled!==false);
const ids=new Set(questions.map(q=>q.id));
const normalize=v=>String(v??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
const compact=v=>normalize(v).replace(/[\s`'";,(){}\[\]]+/g,'');
const tokenText=v=>String(v??'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}_]+/gu,' ').trim().replace(/\s+/g,' ');
const passes=[];
const pass=(name,fn)=>{fn();passes.push(name);console.log('PASS '+String(passes.length).padStart(2,'0')+' '+name);};

pass('bank baseline is preserved',()=>assert.ok(questions.length>=386));
pass('question ids are unique',()=>assert.equal(ids.size,questions.length));
pass('R-IND-SQL-0005 keeps reconstructed source conditions',()=>{
 const q=questions.find(item=>item.id==='R-IND-SQL-0005');
 assert.ok(q,'R-IND-SQL-0005 missing');
 assert.match(q.question,/3학년 이상의 전자계산과 학생들의 이름/);
 assert.match(q.question,/프로젝트번호\(PNO\).*1, 2, 3/);
 assert.match(q.question,/주민등록번호\(JUNO\).*중복 없이/);
 assert.match(q.code,/학년\s*>=\s*3\s*\(가\)\s*학과/);
 assert.match(q.code,/SELECT\s*\(나\)\s*JUNO\s*FROM\s*WORKS\s*WHERE\s*PNO\s*\(다\)\s*\(1, 2, 3\)/i);
 assert.equal(q.answer,'AND DISTINCT IN');
});

pass('every question has an id',()=>questions.forEach(q=>assert.ok(q.id)));
pass('supported languages only',()=>questions.forEach(q=>assert.ok(['C','Java','Python','SQL'].includes(q.language),q.id)));
pass('supported source types only',()=>questions.forEach(q=>assert.ok(['reconstructed','normalized','transformed','practice'].includes(q.sourceType),q.id)));
pass('supported question types only',()=>questions.forEach(q=>assert.ok(['output','blank','sql_result','sql_write','interpret','error'].includes(q.questionType),q.id)));
pass('supported grading modes only',()=>questions.forEach(q=>assert.ok(['exact','sql_keywords','self'].includes(q.grading),q.id)));
pass('titles are present',()=>questions.forEach(q=>assert.ok(String(q.title||'').trim(),q.id)));
pass('question prompts are present',()=>questions.forEach(q=>assert.ok(String(q.question||'').trim(),q.id)));
pass('canonical answers are present',()=>questions.forEach(q=>assert.ok(String(q.answer||'').trim(),q.id)));
pass('learner hints are present and Korean',()=>questions.forEach(q=>{assert.ok(String(q.hint||'').trim(),q.id);assert.match(q.hint,/[가-힣]/,q.id);}));
pass('hints do not reveal canonical answers',()=>questions.forEach(q=>{const a=tokenText(q.answer),h=tokenText(q.hint);if(a.length>=3)assert.ok(!h.includes(a),q.id);}));
pass('solution summaries are present',()=>questions.forEach(q=>assert.ok(String(q.solution?.summary||'').trim(),q.id)));
pass('solution flows are present',()=>questions.forEach(q=>assert.ok(Array.isArray(q.solution?.flow)&&q.solution.flow.length>=1,q.id)));
pass('solution flows contain text',()=>questions.forEach(q=>q.solution.flow.forEach((s,i)=>assert.ok(String(s||'').trim(),q.id+' flow '+i))));
pass('enabled questions remain available',()=>assert.ok(enabled.length>=386));
pass('reconstructed questions keep confidence labels',()=>questions.filter(q=>q.sourceType==='reconstructed').forEach(q=>assert.ok(['A','B','C'].includes(q.confidence),q.id)));
pass('normalized questions do not claim exam confidence',()=>questions.filter(q=>q.sourceType==='normalized').forEach(q=>assert.equal(q.confidence,null,q.id)));
pass('transformed questions point to existing originals',()=>questions.filter(q=>q.sourceType==='transformed').forEach(q=>assert.ok(q.originalQuestionId&&ids.has(q.originalQuestionId),q.id)));
pass('exam history points to existing reconstructed questions',()=>history.forEach(h=>{assert.ok(ids.has(h.questionId),h.questionId);assert.equal(questions.find(q=>q.id===h.questionId).sourceType,'reconstructed',h.questionId);}));
pass('normalized aliases resolve to live questions',()=>Object.entries(normalizedFile.aliases||{}).forEach(([from,to])=>assert.ok(ids.has(to),from+' -> '+to)));
pass('reconstructed questions keep at least one source',()=>questions.filter(q=>q.sourceType==='reconstructed').forEach(q=>assert.ok(Array.isArray(q.sources)&&q.sources.length>0,q.id)));
pass('reconstructed questions keep verification notes',()=>questions.filter(q=>q.sourceType==='reconstructed').forEach(q=>assert.ok(String(q.verificationNote||'').trim(),q.id)));
pass('source urls are web urls',()=>questions.filter(q=>q.sourceType==='reconstructed').flatMap(q=>q.sources.map(s=>[q.id,s.url])).forEach(([id,url])=>assert.match(String(url||''),/^https?:\/\//,id)));
pass('non-SQL output questions include code',()=>questions.filter(q=>q.questionType==='output'&&q.language!=='SQL').forEach(q=>assert.ok(String(q.code||'').trim(),q.id)));
pass('SQL result questions include executable query text',()=>questions.filter(q=>q.questionType==='sql_result').forEach(q=>assert.ok(/\bSELECT\b/i.test(q.code||''),q.id)));
pass('SQL write answers start with a DML or DDL verb',()=>questions.filter(q=>q.questionType==='sql_write').forEach(q=>assert.match(String(q.answer||''),/^\s*(SELECT|UPDATE|INSERT|DELETE|CREATE|ALTER|DROP|MERGE|WITH)\b/i,q.id)));
pass('restored industrial code flows remain complete',()=>{
 const must={
  'R-IND-C-0001':['main(','scanf(','printf('],
  'R-IND-C-0007':['check(','main(','printf('],
  'R-IND-JAVA-0006':['static void main','static void data','static void print'],
  'R-IND-C-0021':['main(','malloc(','free('],
  'R-IND-C-0024':['main(','printf('],
  'R-IND-C-0025':['void func','func(&a)','printf('],
  'R-IND-C-0026':['void reverse','reverse(arr, 5)','printf('],
  'R-IND-C-0027':['move_count','main(','printf('],
  'R-IND-C-0028':['transform(','main(','printf(']
 };
 for(const [id,tokens] of Object.entries(must)){const q=questions.find(x=>x.id===id);assert.ok(q,id);for(const token of tokens)assert.ok(q.code.includes(token),id+' '+token);}
});
pass('2026 foreign-key blank includes all stated conditions',()=>{
 const q=questions.find(x=>x.id==='R-SQL-0012');assert.ok(q);
 assert.match(q.question,/TEAM_TF/);assert.match(q.question,/PLAYER\.TEAM_ID/);assert.match(q.question,/TEAM\.TEAM_ID2/);
 assert.equal(q.answer,'CONSTRAINT FOREIGN TEAM_ID REFERENCES TEAM_ID2');
});
pass('foreign-key DDL hint matches the task',()=>{
 const q=questions.find(x=>x.id==='REC-042');assert.ok(q);
 assert.match(q.hint,/제약조건/);assert.match(q.hint,/외래키/);assert.match(q.hint,/참조/);
 assert.doesNotMatch(q.hint,/정렬|앞에 와야/);
});

pass('every code line receives one explanation',()=>{
 questions.filter(q=>String(q.code||'').trim()).forEach(q=>{
  const expected=String(q.code).replace(/\r\n?/g,'\n').split('\n').filter(line=>line.trim()).length;
  assert.equal(lineByLineExplanation(q).length,expected,q.id);
 });
});
pass('line explanations are never empty',()=>questions.filter(q=>String(q.code||'').trim()).forEach(q=>lineByLineExplanation(q).forEach(item=>assert.ok(String(item.explanation||'').trim(),q.id+' line '+item.line))));
pass('line explanations are written for Korean beginners',()=>questions.filter(q=>String(q.code||'').trim()).forEach(q=>lineByLineExplanation(q).forEach(item=>assert.match(item.explanation,/[가-힣]/,q.id+' line '+item.line))));
pass('annotated code preserves original non-empty lines',()=>questions.filter(q=>String(q.code||'').trim()).forEach(q=>{
 const expected=String(q.code).replace(/\r\n?/g,'\n').split('\n').map((line,index)=>({line:index+1,code:line.replace(/\s+$/,'')})).filter(item=>item.code.trim());
 const actual=lineByLineExplanation(q).map(({line,code})=>({line,code}));
 assert.deepEqual(actual,expected,q.id);
}));
pass('line explanations support all four practical languages',()=>{
 for(const language of ['C','Java','Python','SQL'])assert.ok(questions.filter(q=>q.language===language&&String(q.code||'').trim()).some(q=>lineByLineExplanation(q).length>0),language);
});
pass('SQL line explanations identify common clauses',()=>{
 const samples=[
  [{language:'SQL',code:'SELECT name'},/결과|열/],
  [{language:'SQL',code:'FROM EMP'},/테이블|원본/],
  [{language:'SQL',code:'WHERE sal > 1000'},/조건/],
  [{language:'SQL',code:'GROUP BY dept'},/그룹/],
  [{language:'SQL',code:'ORDER BY sal DESC'},/정렬/]
 ];
 for(const [q,pattern] of samples)assert.match(lineByLineExplanation(q)[0].explanation,pattern);
});
pass('Python line explanations identify assignment and loops',()=>{
 const q={language:'Python',code:'x = 1\nfor i in range(3):\n    x += i\nprint(x)'};
 const notes=lineByLineExplanation(q).map(x=>x.explanation).join(' ');
 assert.match(notes,/저장/);assert.match(notes,/반복/);assert.match(notes,/출력/);
});
pass('C and Java line explanations identify control flow',()=>{
 const cNotes=lineByLineExplanation({language:'C',code:'int main(void) {\nif (a > 0) {\nprintf("%d", a);\n}\nreturn 0;\n}'}).map(x=>x.explanation).join(' ');
 const jNotes=lineByLineExplanation({language:'Java',code:'public static void main(String[] args) {\nwhile (x < 3) {\nSystem.out.println(x);\nx++;\n}\n}'}).map(x=>x.explanation).join(' ');
 assert.match(cNotes,/main/);assert.match(cNotes,/조건/);assert.match(cNotes,/출력/);
 assert.match(jNotes,/main/);assert.match(jNotes,/반복/);assert.match(jNotes,/출력/);
});
pass('practical UI renders stored trace data only',()=>{
 const ui=readFileSync(new URL('js/practical-ui.js',root),'utf8');
 assert.match(ui,/solutionTrace\(q\)/);
 assert.match(ui,/q\.solution\?\.traceTitle/);
 assert.doesNotMatch(ui,/lineByLineExplanation\(q,displayCode\(q\)\)/);
 assert.doesNotMatch(ui,/beginnerConcepts\(q\)/);
});
pass('mobile CSS contains dedicated line annotation layout',()=>{
 const css=readFileSync(new URL('css/practical.css',root),'utf8');
 assert.match(css,/\.line-explanation-list/);
 assert.match(css,/\.line-trace/);
 assert.match(css,/@media\(max-width:767px\)/);
});

pass('stored steps contain no generic solve boilerplate',()=>questions.forEach(q=>{
 const s=solutionFlow(q).join(' ');
 assert.doesNotMatch(s,/먼저 변수의 초기값과 실제 출력문을 표시합니다|이 문제의 핵심 개념은|코드나 SQL에서/,q.id);
}));
pass('stored explanations contain no generic language boilerplate',()=>questions.forEach(q=>{
 const e=solutionSummary(q);
 assert.doesNotMatch(e,/C 코드는 한 문장이|Java 코드는 변수값과 객체 상태를|Python 코드는 연산 전후의|SQL은 각 절을 한 번에 읽기보다/,q.id);
 assert.doesNotMatch(e,/먼저 주어진 테이블과 SQL을|먼저 빈칸 앞뒤 코드를|먼저 빈칸 앞뒤의 SQL을|먼저 문제에서 테이블명, 처리할 열, 값, 조건을/,q.id);
}));
pass('non-SQL explanations never mention SQL',()=>questions.filter(q=>q.language!=='SQL').forEach(q=>{
 assert.doesNotMatch([solutionSummary(q),...solutionFlow(q)].join(' '),/\bSQL\b/,q.id);
}));
pass('rendered explanation sanitizer removes boilerplate',()=>questions.forEach(q=>{
 const rendered=[beginnerExplanation(q),...beginnerSteps(q)].join(' ');
 assert.doesNotMatch(rendered,/먼저 변수의 초기값과 실제 출력문을 표시합니다|이 문제의 핵심 개념은|코드나 SQL에서/,q.id);
}));
pass('rendered explanations do not invent pointers',()=>questions.forEach(q=>{
 const topic=[q.title,...(q.concepts||[]),q.code||'',q.question||''].join(' ');
 const rendered=[beginnerExplanation(q),...beginnerSteps(q)].join(' ');
 if(!/포인터|역참조|이중 포인터|연결 리스트|->|\*\s*[A-Za-z_]\w*/.test(topic))assert.doesNotMatch(rendered,/포인터/,q.id);
}));
pass('every question keeps at least one problem-specific execution step',()=>questions.forEach(q=>assert.ok(beginnerSteps(q).length>=1,q.id)));
pass('R-IND-C-0022 stored trace keeps cumulative execution values',()=>{
 const q=questions.find(q=>q.id==='R-IND-C-0022');assert.ok(q);
 const rendered=solutionTrace(q).join(' ');
 assert.match(rendered,/999 % 329 = 12/);
 assert.match(rendered,/999 % 330 = 9/);
 assert.match(rendered,/999 % 331 = 6/);
 assert.match(rendered,/999 % 332 = 3/);
 assert.match(rendered,/999 % 333 = 0/);
 assert.match(rendered,/i=334/);
 assert.match(rendered,/334를 출력/);
 assert.doesNotMatch(rendered,/SQL|값 변화가 있는 줄이면|이 줄에서 확인할 실제 값/);
});
pass('all stored explanations remain nonempty after cleanup',()=>questions.forEach(q=>assert.ok(solutionSummary(q).trim().length>=12,q.id)));

pass('legacy explanation and steps fields are removed',()=>questions.forEach(q=>{
 assert.ok(!Object.prototype.hasOwnProperty.call(q,'explanation'),q.id+' explanation');
 assert.ok(!Object.prototype.hasOwnProperty.call(q,'steps'),q.id+' steps');
}));
pass('solution schema is the single explanation source',()=>questions.forEach(q=>{
 assert.ok(q.solution&&typeof q.solution==='object',q.id);
 assert.ok(solutionSummary(q).length>=12,q.id+' summary');
 assert.ok(solutionFlow(q).length>=1,q.id+' flow');
 assert.ok(String(q.solution.traceTitle||'').trim(),q.id+' traceTitle');
 assert.ok(solutionTrace(q).length>=1,q.id+' stored trace');
}));
pass('stored UI traces are complete Korean learning text',()=>questions.forEach(q=>{
 const trace=solutionTrace(q);
 assert.ok(trace.length>=1,q.id+' stored trace');
 trace.forEach((item,index)=>{
  assert.ok(String(item||'').trim().length>=4,q.id+' trace '+index);
  assert.match(item,/[가-힣]/,q.id+' Korean trace '+index);
  assert.doesNotMatch(item,/값 변화가 있는 줄이면 바로 앞 실행 흐름|이 줄에서 확인할 실제 값/,q.id+' fallback trace '+index);
 });
}));

pass('line explanations avoid vague fallback comments',()=>{
 const vague=[];
 questions.filter(q=>String(q.code||'').trim()).forEach(q=>lineByLineExplanation(q).forEach(item=>{
  if(/이 (?:C|Java|Python) 문장을|이 SQL 조각이/.test(item.explanation))vague.push({id:q.id,line:item.line,code:item.code.trim(),explanation:item.explanation});
 }));
 assert.deepEqual(vague,[],JSON.stringify(vague.slice(0,80),null,2));
});

assert.equal(passes.length,53);
console.log('FINAL: 53/53 practical solution + value-trace QA passes.');
