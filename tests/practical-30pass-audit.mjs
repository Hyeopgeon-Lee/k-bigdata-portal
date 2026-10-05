import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

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
const passes=[];
const pass=(name,fn)=>{fn();passes.push(name);console.log('PASS '+String(passes.length).padStart(2,'0')+' '+name);};

pass('bank baseline is preserved',()=>assert.ok(questions.length>=386));
pass('question ids are unique',()=>assert.equal(ids.size,questions.length));
pass('every question has an id',()=>questions.forEach(q=>assert.ok(q.id)));
pass('supported languages only',()=>questions.forEach(q=>assert.ok(['C','Java','Python','SQL'].includes(q.language),q.id)));
pass('supported source types only',()=>questions.forEach(q=>assert.ok(['reconstructed','normalized','transformed','practice'].includes(q.sourceType),q.id)));
pass('supported question types only',()=>questions.forEach(q=>assert.ok(['output','blank','sql_result','sql_write','interpret','error'].includes(q.questionType),q.id)));
pass('supported grading modes only',()=>questions.forEach(q=>assert.ok(['exact','sql_keywords','self'].includes(q.grading),q.id)));
pass('titles are present',()=>questions.forEach(q=>assert.ok(String(q.title||'').trim(),q.id)));
pass('question prompts are present',()=>questions.forEach(q=>assert.ok(String(q.question||'').trim(),q.id)));
pass('canonical answers are present',()=>questions.forEach(q=>assert.ok(String(q.answer||'').trim(),q.id)));
pass('learner hints are present and Korean',()=>questions.forEach(q=>{assert.ok(String(q.hint||'').trim(),q.id);assert.match(q.hint,/[가-힣]/,q.id);}));
pass('hints do not reveal canonical answers',()=>questions.forEach(q=>{const a=compact(q.answer),h=compact(q.hint);if(a.length>=3)assert.ok(!h.includes(a),q.id);}));
pass('explanations are present',()=>questions.forEach(q=>assert.ok(String(q.explanation||'').trim(),q.id)));
pass('solution steps are present',()=>questions.forEach(q=>assert.ok(Array.isArray(q.steps)&&q.steps.length>=1,q.id)));
pass('solution steps contain text',()=>questions.forEach(q=>q.steps.forEach((s,i)=>assert.ok(String(s||'').trim(),q.id+' step '+i))));
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

assert.equal(passes.length,30);
console.log('FINAL: 30/30 practical content QA passes.');
