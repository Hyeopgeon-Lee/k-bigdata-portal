import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const size=path=>statSync(new URL(path,root)).size;
const staticImports=source=>[...source.matchAll(/^import\s+[^;]+?from\s+["']([^"']+)["'];?$/gm)].map(m=>m[1]);

const learning=read('js/learning-ui.js');
const shell=read('js/portal-shell.js');
const portalUx=read('js/portal-ux.js');
const searchUi=read('js/search-ui.js');
const practicalUi=read('js/practical-ui.js');
const practicalData=read('js/practical-data.js');
const interviewUi=read('js/interview-ui.js');
const jobs=read('js/jobs.js');

const passes=[
 ['01 lightweight shell routes non-catalog pages',()=>{
   for(const page of ['index.html','practical.html','project-guide.html']){
    const html=read(page);
    assert.ok(html.includes('js/portal-shell.js?v=20261005-perf-4'),page);
    assert.ok(!html.includes('js/learning-ui.js'),page);
   }
 }],
 ['02 catalog pages keep page-aware loader',()=>{
   for(const page of ['jobs.html','certifications.html','docs.html','interview.html']){
    assert.ok(read(page).includes('js/learning-ui.js?v=20261005-perf-5'),page);
   }
 }],
 ['03 learning loader has no static heavy datasets',()=>{
   const imports=staticImports(learning);
   for(const heavy of ['./jobs.js','./docs.js','./certifications.js','./interview.js','./search.js'])assert.ok(!imports.includes(heavy),heavy);
   assert.ok(imports.some(x=>x.includes('portal-shell.js')));
   assert.ok(imports.some(x=>x.includes('search-core.js')));
 }],
 ['04 page datasets are loaded only by page intent',()=>{
   for(const token of ['import("./jobs.js")','import("./docs.js")','import("./certifications.js")','import("./interview-ui.js?v=20261005-perf-3")'])assert.ok(learning.includes(token),token);
   assert.ok(learning.includes('if(page==="certifications")'));
   assert.ok(learning.includes('if(page==="jobs")'));
   assert.ok(learning.includes('if(page==="docs")'));
 }],
 ['05 global search index is lazy and debounced',()=>{
   assert.ok(!staticImports(searchUi).some(x=>x.includes('search.js')));
   assert.ok(searchUi.includes('import("./search.js?v=20261005-perf-1")'));
   assert.ok(searchUi.includes('setTimeout(search,90)'));
 }],
 ['06 practical bank avoids global portal index',()=>{
   assert.ok(practicalUi.includes('from "./search-core.js?v=20261005-perf-1"'));
   assert.ok(!practicalUi.includes('from "./search.js"'));
   assert.ok(practicalUi.includes('bankSearchTimer'));
   assert.ok(practicalUi.includes('setTimeout(()=>{filters.query=value;pageLimit=24;render();},80)'));
   assert.ok(practicalData.includes('const [questions,extraReconstructed,history,coverage,imported]=await Promise.all(['));
   assert.ok(!practicalData.includes('const imported=await load("../data/practical/normalized.json")'));
 }],
 ['07 interview practice avoids jobs/search payloads',()=>{
   assert.ok(interviewUi.includes('from "./search-core.js?v=20261005-perf-1"'));
   assert.ok(interviewUi.includes('from "./interview-links.js?v=20261005-perf-3"'));
   assert.ok(!interviewUi.includes('from "./search.js"'));
   assert.ok(!interviewUi.includes('from "./jobs.js"'));
   assert.ok(interviewUi.includes('interviewSearchTimer'));
 }],
 ['08 portal UX imports heavy data only for job detail',()=>{
   const imports=staticImports(portalUx);
   for(const heavy of ['./jobs.js','./docs.js','./certifications.js'])assert.ok(!imports.includes(heavy),heavy);
   assert.ok(portalUx.includes('async function enhanceJobDetail'));
   assert.ok(portalUx.includes('import("./jobs.js")'));
   assert.ok(portalUx.includes('import("./certifications.js")'));
   assert.ok(portalUx.includes('import("./docs.js")'));
 }],
 ['09 initial home shell stays within raw-source budget',()=>{
   const bytes=['js/app.js','js/portal-shell.js','js/portal-ux.js','js/search-ui.js','js/services.js'].reduce((n,p)=>n+size(p),0);
   assert.ok(bytes<40*1024,'home initial static source '+bytes+' bytes');
   assert.ok(shell.includes('await initPortalUX()'));
   assert.ok(shell.includes('initGroupedSearch()'));
 }],
 ['10 detail cross-links no longer load 150 interview answers',()=>{
   assert.ok(!learning.includes('questions.some('));
   assert.ok(!learning.includes('import("./interview.js'));
   assert.ok(learning.includes('const categories=item.interviewCategories||[]'));
   assert.ok(learning.includes('const interviewLinks = job.interviewCategories||[]'));
   assert.ok(jobs.startsWith('export {interviewRoleLinks} from "./interview-links.js";'));
 }]
];

for(const [name,run] of passes){run();console.log('PASS '+name);}
console.log('FINAL: 10/10 portal performance architecture passes.');
