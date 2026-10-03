import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {docs,docCategories,docFlows,findDocForSkill} from '../js/docs.js';
import {matches,docSearchText,searchIndex} from '../js/search.js';
import {jobs} from '../js/jobs.js';
import {questions} from '../js/interview.js';
assert.equal(docs.length,40);
assert.equal(docCategories.length,8);
assert.equal(new Set(docs.map(d=>d.id)).size,40);
assert.equal(docs.some(d=>['pandas','sklearn'].includes(d.id)),false);
for(const doc of docs){
 for(const key of ['name','english','overview','description','learn','useCases','related','tags','url'])assert.ok(doc[key]?.length,doc.id+': '+key);
 assert.equal(doc.official,true);
 assert.ok(docCategories.some(c=>c.name===doc.category));
 assert.equal(new URL(doc.url).protocol,'https:');
 for(const name of doc.related) assert.ok(findDocForSkill(name),doc.id+': '+name);
 for(const id of doc.jobIds)assert.ok(jobs.some(j=>j.id===id));
 for(const category of doc.interviewCategories)assert.ok(questions.some(q=>q.category===category));
}
for(const flow of docFlows)for(const id of flow.steps)assert.ok(docs.some(d=>d.id===id));
const cases={'스파크':'spark','Spark':'spark','PySpark':'spark','빅데이터':'hadoop','CI/CD':'jenkins','젠킨스':'jenkins','Jenkins':'jenkins','쿠버네티스':'kubernetes','K8s':'kubernetes','LLM':'ollama','로컬 LLM':'ollama','날씨 API':'weather','카카오 지도':'kakao-maps','JWT':'jwt'};
for(const [term,id] of Object.entries(cases)){
 assert.ok(matches(docSearchText(docs.find(d=>d.id===id)),term),term);
 assert.ok(searchIndex.some(r=>r.url==='docs.html?id='+id&&matches(r.text,term)),term+' portal');
}
const html=readFileSync(new URL('../docs.html',import.meta.url),'utf8');
assert.ok(html.includes('content="noindex, nofollow"'));
assert.ok(!html.includes('content="index, follow"'));
assert.ok(html.includes('rel="canonical" href="https://portal.k-bigdata.kr/docs.html"'));
assert.ok(html.includes('property="og:url"'));
console.log('PASS: 40 technologies, 8 groups, 14 local/portal search terms, related/job/interview references, SEO.');
