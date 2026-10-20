import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {codingProblems as seeds} from '../data/coding-samples.js';
import {javaProblems} from '../data/coding-java-98.js';
import {cFoundationProblems} from '../data/coding-c-foundations.js';
import {cAdvancedProblems} from '../data/coding-c-advanced.js';
import {pythonFoundationProblems} from '../data/coding-python-foundations.js';
import {pythonAdvancedProblems} from '../data/coding-python-advanced.js';
import {ubuntuFoundationProblems} from '../data/coding-ubuntu-foundations.js';
import {ubuntuAdvancedProblems} from '../data/coding-ubuntu-advanced.js';
import {learningReportUrl} from '../js/learning-report.js';

const html=readFileSync(new URL('../coding.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../js/coding.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../css/coding.css',import.meta.url),'utf8');
const services=readFileSync(new URL('../js/services.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const list=[...seeds,...javaProblems,...cFoundationProblems,...cAdvancedProblems,...pythonFoundationProblems,...pythonAdvancedProblems,...ubuntuFoundationProblems,...ubuntuAdvancedProblems];
assert.equal(list.length,350,'all 350 exercises must be present');
const unique=new Set(list.map(p=>p.id));
assert.equal(unique.size,350,'exercise IDs must be unique');
for(const [lang,target] of Object.entries({java:100,c:100,python:100,linux:50}))
  assert.equal(list.filter(p=>p.language===lang).length,target,lang+' count');
assert.ok(html.includes('기초 프로그래밍·명령어 350제'));
assert.ok(services.includes('기초 프로그래밍·명령어 350제'));
assert.ok(html.includes('전체 문제')&&html.includes('내 완료'));
for(const redundant of ['FIRST SEMESTER · CODING FOUNDATIONS','현재 공개된 예제','문제 제작 목표','총 302문제'])
  assert.ok(!html.includes(redundant),'remove redundant: '+redundant);
for(const id of ['coding-share-button','coding-link-button','coding-report-button','coding-share-status','coding-hint-button','coding-answer-button','coding-trace-button','coding-ubuntu-guide','coding-next-button','coding-available','coding-completed'])
  assert.ok(html.includes('id="'+id+'"'),'missing interactive control '+id);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'HTML ids must be unique');
assert.ok(js.includes('navigator.share')&&js.includes('navigator.clipboard')&&js.includes('document.execCommand'),'share and fallbacks wired');
assert.ok(js.includes('learningReportUrl("coding",current'),'coding issue report uses URL helper');
assert.ok(js.includes('url.searchParams.set("id", q.id)'),'shared deep links preserve question id');
assert.ok(js.includes('history.replaceState'),'deep link remains stable on question selection');
assert.ok(css.includes('.coding-share-actions')&&css.includes('@media(max-width:530px)'),'responsive share actions');
for(const moduleFile of ['js/coding.js','js/learning-report.js']){
  const check=spawnSync(process.execPath,['--check',fileURLToPath(new URL('../'+moduleFile,import.meta.url))],{encoding:'utf8'});
  assert.equal(check.status,0,moduleFile+' syntax: '+check.stderr);
}
globalThis.location={origin:'https://portal.k-bigdata.kr'};
const url=learningReportUrl('coding',{id:'LINUX-025',title:'줄 수 세기',code:'secret solution'},'Ubuntu · 파일 내용·검색');
const reported=new URL(url);
assert.equal(reported.origin,'https://help.k-bigdata.kr');
assert.equal(reported.pathname,'/request.html');
assert.equal(reported.searchParams.get('source'),'coding');
assert.equal(reported.searchParams.get('id'),'LINUX-025');
assert.equal(reported.searchParams.get('question'),'줄 수 세기');
assert.equal(reported.searchParams.has('code'),false,'solution must not leak into report URL');
const original=new URL(reported.searchParams.get('url'));
assert.equal(original.href,'https://portal.k-bigdata.kr/coding.html?id=LINUX-025');
assert.equal(learningReportUrl('unknown',{id:'test'}),'');
assert.match(index, /type="module" src="js\/app\.js\?v=[^"]+"/,'home loads versioned service registry entry');
console.log('PASS: 350 unique questions, refreshed learning title, responsive share controls, canonical links, report URL and unchanged language views');
