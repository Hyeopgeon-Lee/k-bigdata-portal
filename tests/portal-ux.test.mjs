import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {learningLinks,portalNavLinks,quickActions,studentJourney,services} from '../js/services.js';
import {groupSearchResults} from '../js/search.js';
import {portalPages,navigationItems} from '../js/portal-navigation-model.mjs';
import {renderHeader,renderServiceNavigation,renderToolbar} from '../scripts/portal-shell-template.mjs';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const pages=Object.keys(portalPages);
for(const page of pages){
 const html=read(page+'.html');
 assert.match(html,/<meta name="robots" content="noindex,\s*nofollow">/);
 assert.ok(html.includes('skip-link'));
 assert.ok(html.includes('footer-links'));
 assert.ok(html.includes('css/portal-ux.css'));
 assert.ok(html.includes(renderHeader(portalPages[page])),page+' shared generated header');
 assert.ok(html.includes('css/portal-navigation.css?v='),page+' common component styles');
 assert.ok(html.includes('js/portal-navigation.js?v='),page+' independent navigation initialization');
 if(portalPages[page].toolbar)assert.ok(html.includes(renderToolbar(portalPages[page])),page+' shared toolbar');
 if(page!=='index'){assert.ok(html.includes('data-learning-nav'));assert.ok(!html.includes('id="portal-query"'));}
 for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g))if(!/^(https?:|#|mailto:)/.test(url))assert.ok(existsSync(new URL(url.split(/[?#]/)[0],root)),page+' '+url);
}
assert.deepEqual(quickActions,['practical','interview','ready','apply']);
assert.equal(portalNavLinks.length,services.length,'all services appear in navigation');
assert.deepEqual(learningLinks,portalNavLinks,'legacy API remains an alias of the canonical menu');
assert.equal(new Set(portalNavLinks.map(item=>item.id)).size,portalNavLinks.length);
for(const item of portalNavLinks)assert.ok(services.some(s=>s.id===item.id));
for(const page of pages.filter(page=>page!=='index')){
 const html=read(page+'.html');
 const nav=renderServiceNavigation(portalPages[page],page);
 assert.ok(html.includes(nav),page+' service navigation matches the single template');
 assert.deepEqual([...nav.matchAll(/data-nav-id="([^"]+)"/g)].map(match=>match[1]).sort(),navigationItems.map(item=>item.id).sort(),page+' complete registry links');
 assert.equal([...nav.matchAll(/aria-current="page"/g)].length,1,page+' exactly one active service');
 assert.ok(nav.includes('data-nav-id="'+page+'" data-nav-group="'+portalPages[page].group+'" aria-current="page"'),page+' correct active service');
}
assert.equal(studentJourney.find(s=>s.id==='certifications').companion,'practical');
assert.ok(read('index.html').includes('class="dashboard-action-grid"'),'current grade-specific quick actions remain');
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
