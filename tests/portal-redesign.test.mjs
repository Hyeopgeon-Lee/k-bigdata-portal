import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {categories,services,studentJourney,footerLinks,serviceKind} from '../js/services.js';
import {jobs,jobGroups,interviewRoleLinks} from '../js/jobs.js';
import {certifications} from '../js/certifications.js';
import {questions} from '../js/interview.js';
import {docs} from '../js/docs.js';
import {matches,searchIndex} from '../js/search.js';
const root=new URL('../',import.meta.url);
const baseline=JSON.parse(readFileSync(new URL('portal-baseline.json',import.meta.url),'utf8'));
for(const [key,data] of Object.entries({jobs,certifications,questions,docs}))assert.deepEqual(data.map(x=>x.id),baseline[key],key+' permanent IDs');
for(const [id,url] of Object.entries(baseline.services))assert.equal(services.find(s=>s.id===id)?.url,url);
assert.equal(services.length,13);assert.equal(new Set(services.map(s=>s.id)).size,13);
assert.deepEqual(Object.keys(categories),['career','learning','project','campus']);
const expected={career:['jobs','ready','apply','alumni'],learning:['certifications','practical','interview','docs','tech-blog'],project:['portfolio','project-guide'],campus:['room','help']};
for(const [category,ids] of Object.entries(expected))assert.deepEqual(services.filter(s=>s.category===category).sort((a,b)=>a.order-b.order).map(s=>s.id),ids);
assert.equal(services.find(s=>s.id==='tech-blog').url,'https://prof.k-bigdata.kr/blog/');
assert.equal(serviceKind(services.find(s=>s.id==='tech-blog')),'EXTERNAL');
assert.deepEqual(studentJourney.map(s=>s.id),['jobs','docs','certifications','project-guide','interview','ready','apply','alumni']);
for(const step of studentJourney){assert.ok(services.some(s=>s.id===step.id));if(step.companion)assert.ok(services.some(s=>s.id===step.companion));}
assert.deepEqual(jobGroups.flatMap(g=>g.ids).sort(),jobs.map(j=>j.id).sort());
for(const q of questions)for(const tag of q.jobTags){const link=interviewRoleLinks[tag];assert.ok(link);const id=new URL(link,'https://portal.k-bigdata.kr/').searchParams.get('id');if(id)assert.ok(jobs.some(j=>j.id===id));}
assert.equal(footerLinks.length,5);assert.ok(footerLinks.some(l=>l.url==='https://contest.k-bigdata.kr/'));
const pages=readdirSync(root,{recursive:true}).filter(p=>p.endsWith('.html')&&!p.startsWith('.git'));
for(const page of pages){
 const html=readFileSync(new URL(page.replaceAll('\\','/'),root),'utf8');
 assert.match(html,/<meta name="robots" content="noindex, nofollow">/,page);
 assert.ok(!html.includes('content="index, follow"'));
 for(const text of ['skip-link','menu-toggle','aria-controls="portal-nav"',page==='practical.html'?'study-footer':'footer-links'])assert.ok(html.includes(text),page+' '+text);
 for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g))if(!/^(https?:|#|mailto:)/.test(url))assert.ok(existsSync(new URL(url.split(/[?#]/)[0],root)),page+' '+url);
}
for(const service of services)if(!service.url.startsWith('https://'))assert.ok(existsSync(new URL(service.url,root)));
for(const item of searchIndex)if(!item.url.startsWith('https://'))assert.ok(existsSync(new URL(item.url.split(/[?#]/)[0],root)),item.url);
for(const job of jobs){
 assert.ok(docs.some(d=>d.jobIds.includes(job.id)),job.id+' docs');
 for(const id of job.certifications)assert.ok(certifications.some(c=>c.id===id));
 for(const c of job.interviewCategories)assert.ok(questions.some(q=>q.category===c));
}
for(const term of ['Kubernetes','쿠버네티스','K8s','DevOps','데브옵스','Cloud','클라우드','기술 블로그'])assert.ok(searchIndex.some(r=>r.url==='https://prof.k-bigdata.kr/blog/'&&matches(r.text,term)),term+' blog');
for(const type of ['IT 직무','IT 자격증','개발 공식문서','기술면접 문제','외부 학습 사이트'])assert.ok(searchIndex.some(r=>r.type===type&&matches(r.text,'Kubernetes')),type);
assert.equal(matches('JavaScript','Java'),false);assert.equal(matches('Storage','RAG'),false);
assert.equal(readFileSync(new URL('CNAME',root),'utf8').trim(),'portal.k-bigdata.kr');
const ui=readFileSync(new URL('js/learning-ui.js',root),'utf8');
assert.ok(ui.includes('docs.filter(doc => doc.jobIds.includes(job.id))'));
assert.ok(ui.includes('footerLinks.map'));
assert.ok(ui.includes('rel="noopener noreferrer"'));
assert.ok(ui.includes('closeMenu();toggle.focus()'));
console.log('PASS: all stable IDs/URLs, 4 ordered categories / 13 services, 8-step journey, blog multi-domain search, cross-links, all HTML noindex, local resources, CNAME and common footer/menu.');
