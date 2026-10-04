import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {jobs,jobGuidance} from '../js/jobs.js';
import {certifications,certificationGuidance} from '../js/certifications.js';
import {docs} from '../js/docs.js';
import {questions,interviewSources,selectRandomQuestions} from '../js/interview.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const defensive=/취업.{0,8}보장|합격.{0,8}보장|출제.{0,8}보장|공통 채용 요건|모든 기업의 공통|판정하지|의미하지 않습니다|뜻하지 않습니다|적성 판정|대신하지 않습니다/;
for(const [name,value] of Object.entries({jobs,jobGuidance,certifications,certificationGuidance,docs})){
 assert.ok(!defensive.test(JSON.stringify(value)),name+' contains defensive student guidance');
}
for(const file of ['interview.html','js/interview-ui.js','js/interview.js','data/interview-sources.js','css/interview.css','css/learning.css']){
 assert.ok(!/interviewEditorialSources|interviewReviewDate|interview-editorial|interview-review-date|interview-reference-list/.test(read(file)),file);
}
assert.ok(!read('interview.html').includes('browse-one'));
assert.ok(!read('interview.html').includes('browse-ten'));
const practical=read('js/practical-ui.js');
assert.ok(!/q\.verificationNote|q\.confidence|confidence-policy|bank-stats/.test(practical));
assert.ok(practical.includes('q.history.map')&&practical.includes('q.sources.map'));
assert.ok(practical.includes('rel="noopener noreferrer"'));
assert.ok(practical.includes('canReveal')&&practical.includes('remainingSeconds'));
assert.ok(practical.includes('복구할 수 없습니다'));
assert.ok(!read('js/learning-ui.js').includes('시험 전에 반드시 확인할 내용'));
assert.ok(!read('js/learning-ui.js').includes('공공기관 채용공고 참고 사례'));
assert.ok(read('js/learning-ui.js').includes('API Key·호출 한도'));
assert.ok(read('js/learning-ui.js').includes('Secret'));
assert.ok(docs.find(d=>d.id==='jwt').note.includes('민감정보'));
assert.ok(docs.find(d=>d.id==='gemma').note.includes('이용 조건'));
assert.equal(questions.length,150);
assert.equal(jobs.length,11);
assert.equal(certifications.length,12);
assert.equal(docs.length,40);
// Navigation wraps; only code/table content keeps independent horizontal scrolling.
for(const file of ['css/jobs.css','css/learning.css','css/portal-ux.css','css/practical.css']){
 assert.ok(!read(file).includes('overflow-x:auto'),file+' has a horizontal navigation strip');
}
assert.ok(read('css/practical.css').includes('.bank-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))'));
assert.ok(read('css/practical.css').includes('.code-scroll,.table-scroll{max-width:100%;overflow:auto'));
for(const q of questions)for(const id of q.sourceIds)assert.ok(interviewSources[id]);
assert.equal(new Set(selectRandomQuestions(questions,10).map(q=>q.id)).size,10);
for(const page of ['index','jobs','certifications','docs','interview','practical','project-guide']){
 assert.ok(read(page+'.html').includes('content="noindex, nofollow"'));
}
console.log('PASS: student guidance cleanup, removed editorial dependencies, preserved official/security references, timer and source metadata boundaries, counts and noindex.');
