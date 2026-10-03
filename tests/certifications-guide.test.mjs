import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {certifications,certificationPaths} from '../js/certifications.js';
import {jobs} from '../js/jobs.js';
import {matches,certificationSearchText,searchIndex} from '../js/search.js';
const baseline={
  "engineer": "https://www.q-net.or.kr/crf005.do?id=crf00503&jmCd=1320",
  "industrial": "https://www.q-net.or.kr/crf005.do?id=crf00503&jmCd=2290",
  "adsp": "https://www.dataq.or.kr/www/main.do",
  "sqld": "https://www.dataq.or.kr/www/main.do",
  "ocp": "https://www.oracle.com/education/certification/",
  "cka": "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/",
  "ncp": "https://www.ncloud.com/support/certexam",
  "linux": "https://www.ihd.or.kr/",
  "ocjp": "https://www.oracle.com/education/certification/",
  "office": "https://www.q-net.or.kr/crf005.do?id=crf00503&jmCd=2193",
  "computer": "https://license.korcham.net/",
  "word": "https://license.korcham.net/"
};
assert.deepEqual(certifications.map(c=>c.id),Object.keys(baseline));
assert.equal(certifications.length,12);
assert.deepEqual(certifications.filter(c=>c.priority==='core').map(c=>c.id),['engineer','industrial','cka','ncp']);
for(const cert of certifications){
 assert.equal(cert.url,baseline[cert.id]);
 for(const field of ['description','importance','whatYouLearn','careerUsage','studyOrder','nextStudy','officialCheckItems'])assert.ok(cert[field]?.length,cert.id+': '+field);
 assert.ok(cert.studyOrder.length>=4&&cert.studyOrder.length<=6);
 for(const id of [...cert.roleIds,...cert.primaryRoleIds])assert.ok(jobs.some(j=>j.id===id));
 if(cert.priority==='core')assert.ok(cert.badges.length);
 assert.ok(!/졸업점수|졸업실적|졸업 인정|배점|합격점수|시험시간|[0-9]+점/.test(JSON.stringify(cert)));
}
for(const path of certificationPaths)for(const id of path.ids)assert.ok(certifications.some(c=>c.id===id));
for(const job of jobs)for(const id of job.certifications)assert.ok(certifications.some(c=>c.id===id));
const cases={'정보처리기사':'engineer','정보처리산업기사':'industrial','공공기관':'engineer','공공 SI':'industrial','정보화':'engineer','개발자':'engineer','CKA':'cka','Kubernetes':'cka','쿠버네티스':'cka','K8s':'cka','DevOps':'cka','NCP':'ncp','NAVER Cloud':'ncp','클라우드':'ncp','Cloud':'ncp','SQL':'sqld','SQLD':'sqld','DB':'sqld','Database':'sqld','Java':'ocjp','OCJP':'ocjp','Linux':'linux','리눅스':'linux'};
for(const [term,id] of Object.entries(cases)){
 assert.ok(matches(certificationSearchText(certifications.find(c=>c.id===id)),term),term);
 assert.ok(searchIndex.some(r=>r.url==='certifications.html?id='+id&&matches(r.text,term)),term+' portal');
}
assert.ok(readFileSync(new URL('../certifications.html',import.meta.url),'utf8').includes('content="noindex, nofollow"'));
assert.deepEqual(certifications.filter(c=>c.preparationGuide).map(c=>c.id),['engineer','industrial','sqld','ncp']);
for (const id of ['engineer','industrial']) {
 const guide=certifications.find(c=>c.id===id).preparationGuide;
 assert.ok(guide.target.includes('1학년') && guide.target.includes('제1회'));
 assert.ok(guide.steps.some(text=>text.includes('학사')||text.includes('학위')));
 assert.ok(guide.steps.some(text=>text.includes('4월')&&text.includes('겨울방학')));
 assert.ok(guide.steps.some(text=>text.includes('7월')&&text.includes('학과 안내')));
 assert.ok(!guide.target.includes('반드시 합격'));
}
assert.ok(certifications.find(c=>c.id==='sqld').preparationGuide.target.includes('1학년 1학기 데이터베이스'));
assert.ok(certifications.find(c=>c.id==='ncp').preparationGuide.target.includes('리눅스·클라우드컴퓨팅'));
console.log('PASS: 12 stable IDs/URLs, 4 core badges, 23 search terms, role links, 4 preparation guides, no internal scores.');
