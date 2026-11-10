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


import {ubuntuPptProblems} from '../data/coding-ubuntu-ppt.js';
import {learningReportUrl} from '../js/learning-report.js';
import {completionCatalog, codingCompletionOptions} from '../js/coding-completion-data.js';

const html=readFileSync(new URL('../coding.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../js/coding.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../css/coding.css',import.meta.url),'utf8');
const services=readFileSync(new URL('../js/services.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const list=[...seeds.filter(p=>p.language!=='linux'),...javaProblems,...cFoundationProblems,...cAdvancedProblems,...pythonFoundationProblems,...pythonAdvancedProblems,...ubuntuPptProblems];
assert.equal(list.length,350,'all 350 exercises must be present');

const java016=list.find(p=>p.id==='JAVA-016');
assert.ok(java016,'JAVA-016 is present');
assert.match(java016.statement,/분.*초.*한글 단위/,'JAVA-016 question requires Korean time units');
assert.equal(java016.input,'125','JAVA-016 sample input is preserved');
assert.equal(java016.output,'2분 5초','JAVA-016 expected output has Korean units');
assert.match(java016.code,/System\.out\.println\(minutes \+ "분 " \+ remain \+ "초"\)/,'JAVA-016 Java code prints minute/second labels');
assert.match(java016.explanation,/2분 5초/,'JAVA-016 explanation matches output');

const unique=new Set(list.map(p=>p.id));
assert.equal(unique.size,350,'exercise IDs must be unique');
assert.equal(ubuntuPptProblems.length,50,'PPT-based Linux exercises count');
const linux003=ubuntuPptProblems.find(p=>p.id==='LINUX-003');
assert.ok(linux003,'LINUX-003 must exist');
assert.ok(ubuntuPptProblems.every(p=>p.statement.trim().endsWith('시오.')),'50 Linux tasks use imperative sentences');
assert.ok(ubuntuPptProblems.every(p=>/^student@ubuntu:[^\n]+\$ /.test(p.input)&&/^student@ubuntu:[^\n]+\$ /.test(p.output)),'50 Linux tasks show Ubuntu terminal screens');
assert.ok(ubuntuPptProblems.every(p=>p.input===p.initialState&&p.output===p.afterState),'Ubuntu console and state panels are consistent');
assert.ok(ubuntuPptProblems.every(p=>p.input.includes('[명령어 입력]')&&p.output.includes('[명령어 입력]')),'All 50 terminal examples have a student input marker');
const terminalPrompt=/^student@ubuntu:[^\n$]*\$\s*(.*)$/;
for(const p of ubuntuPptProblems){
  const answers=new Set(p.code.split('\n').map(line=>line.trim()).filter(Boolean));
  for(const line of p.input.split('\n')){
    const m=line.match(terminalPrompt);
    if(m)assert.ok(!answers.has(m[1].trim()),p.id+' setup must not reveal solution commands');
  }
  for(const line of p.output.split('\n')){
    const m=line.match(terminalPrompt);
    if(m)assert.ok(!m[1].trim()||m[1].trim()==='[명령어 입력]',p.id+' expected output may not reveal a command');
  }
}
assert.ok(js.includes('coding-ubuntu-terminal-demo",isUbuntu'),'Both Ubuntu console panels receive terminal styling');
assert.ok(html.includes('coding-ubuntu-output-note'),'Output note is available when system-dependent values vary');
assert.ok(!html.includes('id="coding-vim-steps"')&&!html.includes('id="coding-vim-steps-list"'),'Vim duplicate section removed');
assert.ok(!html.includes('id="coding-ubuntu-vim-steps"')&&!html.includes('id="coding-ubuntu-vim-list"'),'Duplicated Vim instructions removed');
assert.ok(!js.includes('function renderVimSteps(q)')&&!js.includes('const vimList ='),'No duplicated Vim instruction renderer remains');
assert.ok(js.includes('isUbuntu && !Array.isArray(q.vimSteps)'),'Vim uses the existing single explanation section');

assert.match(linux003.statement,/하시오\.$/,'question uses imperative phrasing');
assert.equal(linux003.code,'pwd','answer remains available in the answer panel');
assert.ok(js.includes('function visibleUbuntuConsole(q, transcript, expected=false)'), 'UI has reusable Ubuntu command sanitizer');
assert.ok(js.includes('function renderConsoleText(pre, transcript, isUbuntu)'), 'UI displays emphasized input marker safely');
assert.ok(js.includes('visibleUbuntuConsole(q,q.input)')&&js.includes('visibleUbuntuConsole(q,q.output,true)'),
  'both Ubuntu terminal examples are sanitized before display');
assert.deepEqual(ubuntuPptProblems.reduce((acc,p)=>(acc[p.level]=(acc[p.level]??0)+1,acc),{}),{'입문':15,'기초 응용':25,'종합 활용':10},'PPT-based difficulty distribution');
assert.ok(ubuntuPptProblems.every((p,n)=>p.id==='LINUX-'+String(n+1).padStart(3,'0')&&p.pptSource),'Linux IDs and PPT sources');
assert.ok(ubuntuPptProblems.every(p=>p.input.startsWith('student@ubuntu:')&&p.output.startsWith('student@ubuntu:')),'50 Ubuntu terminal examples');
assert.ok(ubuntuPptProblems.every(p=>p.statement.split(/\.\s+/).every(sentence=>/시오\.?$/.test(sentence))),'50 imperative freshman questions');
assert.ok(ubuntuPptProblems.every(p=>p.initialState===p.input&&p.afterState===p.output),'consistent example and internal state');
assert.ok(html.includes('id="coding-ubuntu-output-note"'),'expected-result output caveat present');
assert.ok(!html.includes('coding-ubuntu-states'),'duplicate before/after details removed');
assert.ok(js.includes('coding-ubuntu-terminal-demo",isUbuntu'),'all Ubuntu questions use terminal presentation');

assert.ok(js.includes('...ubuntuPptProblems')&&!js.includes('ubuntuLegacyGuides'),'browser uses only the PPT Linux data');
assert.match(html,/js\/coding\.js\?v=20261111-[\w-]+/,'up-to-date script reference');
const firstVisitAutocomplete=html.includes('id="coding-autocomplete-toggle" type="checkbox" role="switch"')
  && !/<input[^>]+id="coding-autocomplete-toggle"[^>]+checked/.test(html);
assert.ok(firstVisitAutocomplete,'autocomplete switch exists and is initially unchecked');
assert.match(js,/kbigdata:coding:autocomplete:v1/,'saved opt-in key');
assert.match(js,/autocompleteEnabled = getSafe\(AUTOCOMPLETE_KEY, "off"\) === "on"/);
for(const lang of ['java','c','python','linux']) {
  assert.ok(completionCatalog[lang].length>=20,lang+' keywords available');
  assert.deepEqual(codingCompletionOptions(lang,'p','',false),[],lang+' one-character suggestions do not activate');
}
assert.ok(codingCompletionOptions('c','pri','',false).some(item=>item.label==='printf'));
assert.ok(codingCompletionOptions('python','pri','',false).some(item=>item.label==='print'));
assert.ok(codingCompletionOptions('java','Sys','',false).some(item=>item.label==='System.out.println'));
assert.ok(codingCompletionOptions('linux','mk','',false).some(item=>item.label==='mkdir'));
assert.ok(codingCompletionOptions('c','va','int variableName = 10;',false).some(item=>item.label==='variableName'));

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
assert.ok(js.includes('learningReportUrl("coding",q'),'coding issue report uses URL helper');
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
console.log('PASS: 350 unique questions including 50 PPT-grounded Linux exercises, difficulty breakdown and unchanged other languages');
