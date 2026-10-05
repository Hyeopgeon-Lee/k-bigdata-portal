import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {learningLinks,portalNavLinks,quickActions,studentJourney,services} from '../js/services.js';
import {groupSearchResults} from '../js/search.js';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const pages=['index','jobs','certifications','docs','interview','practical','project-guide'];
for(const page of pages){
 const html=read(page+'.html');
 assert.match(html,/<meta name="robots" content="noindex, nofollow">/);
 assert.ok(html.includes('skip-link'));
 assert.ok(html.includes('footer-links'));
 assert.ok(html.includes('css/portal-ux.css'));
 if(page!=='index'){assert.ok(html.includes('data-learning-nav'));assert.ok(!html.includes('id="portal-query"'));}
 for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g))if(!/^(https?:|#|mailto:)/.test(url))assert.ok(existsSync(new URL(url.split(/[?#]/)[0],root)),page+' '+url);
}
assert.deepEqual(quickActions,['practical','interview','ready','apply']);
assert.equal(portalNavLinks.length,13);
assert.equal(learningLinks.length,13);
for(const item of portalNavLinks)assert.ok(services.some(s=>s.id===item.id));
for(const page of pages.filter(page=>page!=='index')){
 const html=read(page+'.html');
 const nav=html.match(/<nav class="container learning-cross-nav portal-service-nav"[\s\S]*?<\/nav>/)?.[0]||'';
 assert.equal([...nav.matchAll(/<a /g)].length,13,page+' complete portal nav');
}
assert.equal(studentJourney.find(s=>s.id==='certifications').companion,'practical');
assert.ok(read('index.html').includes('id="quick-actions"'));
assert.equal([...read('project-guide.html').matchAll(/<details class="step">/g)].length,11);
assert.ok(read('docs.html').includes('id="docs-more"'));
assert.deepEqual(groupSearchResults(''),[]);
for(const term of ['Kubernetes','쿠버네티스','K8s']){
 const groups=groupSearchResults(term);
 for(const label of ['공식문서','관련 직무','자격증','기술면접'])assert.ok(groups.some(g=>g.label===label));
 assert.ok(groups.find(g=>g.label==='공식문서').items.some(x=>x.url==='docs.html?id=kubernetes'));
}
assert.equal(groupSearchResults('Kubernetes')[0].label,'공식문서');
assert.match(read('css/practical.css'),/calc\(var\(--portal-header-height\) \+ var\(--study-header-height\)\)/);
console.log('Portal UX navigation, grouping, progressive disclosure and noindex verified');
