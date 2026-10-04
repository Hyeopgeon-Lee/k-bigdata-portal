import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { jobs, jobComparisons,jobGroups,jobMetadata,jobIdentity } from '../js/jobs.js';
import { certifications } from '../js/certifications.js';
import { questions } from '../js/interview.js';
import { services } from '../js/services.js';
import { matches, jobSearchText, searchIndex } from '../js/search.js';

assert.deepEqual(jobs.map(j => j.id), ['backend','native','devops','cloud','data','ai','frontend','system','qa','mobile','analyst']);
assert.equal(new Set(jobs.map(j=>j.id)).size,11);
assert.deepEqual(jobGroups.map(g=>g.name),['소프트웨어 개발','클라우드·인프라','데이터·AI','품질·테스트']);
for (const job of jobs) {
  for (const field of ['overview','description','essentialSkills','plusSkills','recruitmentKeywords','education','studyOrder','portfolio','interviewTopics','relatedRoles']) assert.ok(job[field]?.length, `${job.id}: ${field}`);
  assert.ok(job.tasks.length >= 5 && job.tasks.length <= 8);
  assert.ok(job.projectIdeas.length >= 3);
  assert.ok(job.careerPath.length && job.suitability);
  assert.equal(jobIdentity(job.id).name,job.name);
  assert.ok(jobMetadata(job.id).canonical.endsWith('?id='+job.id));
  assert.ok(job.readinessChecklist.length >= 5 && job.readinessChecklist.length <= 7);
  assert.ok(job.interviewTopics.length >= 5 && job.interviewTopics.length <= 8);
  for (const project of job.projectIdeas) assert.ok(project.title && project.description);
  for (const id of job.certifications) assert.ok(certifications.some(c => c.id === id), `${job.id}: certificate ${id}`);
  for (const category of job.interviewCategories) assert.ok(questions.some(q => q.category === category));
  for (const role of job.relatedRoles) if (role.id) assert.ok(jobs.some(j => j.id === role.id));
}
assert.equal(jobComparisons.length, 7);
assert.ok(!jobs.find(j=>j.id==='backend').essentialSkills.includes('JPA'));
assert.ok(!jobs.find(j=>j.id==='devops').essentialSkills.includes('GitHub'));
assert.equal(jobs.find(j=>j.id==='ai').tracks.length,3);
assert.equal(jobMetadata('unknown').canonical,'https://portal.k-bigdata.kr/jobs.html');
assert.equal(jobIdentity('unknown'),null);
const metadataUI=readFileSync(new URL('../js/job-guide-ui.js',import.meta.url),'utf8');
for(const key of ['og:title','og:description','og:url','application/ld+json','Occupation'])assert.ok(metadataUI.includes(key));
const terms = ['Java','Spring','Spring Boot','JWT','Vue','Python','SQL','ETL','Docker','Kubernetes','쿠버네티스','CI/CD','DevOps','Cloud','클라우드','MSA','K-PaaS','LLM','RAG','AI Agent','Vector DB','GitHub Actions','Linux'];
for (const term of terms) {
  const local = jobs.filter(j => matches(jobSearchText(j), term));
  assert.ok(local.length, `local search: ${term}`);
  assert.ok(searchIndex.some(r => r.type === 'IT 직무' && matches(r.text, term)), `portal search: ${term}`);
}
for(const [id,terms] of Object.entries({system:['SE','서버관리','시스템관리','리눅스'],qa:['QA','테스터','자동화테스트','SDET'],mobile:['앱','Dart','Android','iOS'],analyst:['데이터분석','분석가','Pandas','BI','Dashboard']}))for(const term of terms)assert.ok(matches(jobSearchText(jobs.find(j=>j.id===id)),term),id+' '+term);
assert.deepEqual(jobs.filter(j => matches(jobSearchText(j), 'RAG')).map(j => j.id), ['ai']);
assert.equal(matches('JavaScript', 'Java'), false);
assert.equal(matches('Storage', 'RAG'), false);
for (const page of ['index.html','jobs.html','certifications.html','docs.html','interview.html','project-guide.html']) {
  const html = readFileSync(new URL('../' + page, import.meta.url), 'utf8');
  assert.ok(html.includes('content="noindex, nofollow"'));
  for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|#)/.test(value)) continue;
    assert.ok(existsSync(new URL('../' + value.split(/[?#]/)[0], import.meta.url)), `${page}: ${value}`);
  }
}
for (const id of ['ready','apply','alumni','room','help','portfolio']) assert.equal(services.find(s => s.id === id).url, `https://${id}.k-bigdata.kr/`);
const source = readFileSync(new URL('../js/jobs.js', import.meta.url), 'utf8');
assert.equal(/졸업점수|졸업실적|졸업인정 자격증|졸업 조건 충족/.test(source), false);
console.log(`PASS: ${jobs.length} roles, ${terms.length} search keywords, certificate/interview links, stable service URLs and noindex.`);
