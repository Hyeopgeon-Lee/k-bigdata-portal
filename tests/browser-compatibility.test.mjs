import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const pages=['index.html','jobs.html','certifications.html','docs.html','interview.html','practical.html','project-guide.html'];
const runtime=[
 'js/app.js','js/certifications-ui.js','js/certifications.js','js/docs.js','js/interview-ui.js','js/interview.js',
 'js/interview-links.js','js/job-guide-ui.js','js/jobs.js','js/learning-ui.js','js/portal-shell.js','js/portal-ux.js','js/practical-core.js','js/practical-data.js',
 'js/practical-store.js','js/practical-ui.js','js/search-core.js','js/search-ui.js','js/search.js','js/services.js'
];
const js=runtime.map(read).join('\n');
const style=read('css/style.css');
const practical=read('css/practical.css');
const portal=read('css/portal-ux.css');
const practicalUi=read('js/practical-ui.js');
const interviewUi=read('js/interview-ui.js');
const store=read('js/practical-store.js');
const app=read('js/app.js');

const checks=[
 ['01 all pages have viewport meta',pages.every(p=>/<meta name="viewport"/.test(read(p)))],
 ['02 all pages load shared CSS',pages.every(p=>/css\/style\.css\?v=20261005-browser-1/.test(read(p)))],
 ['03 runtime uses standards-based ES modules',pages.every(p=>p==='index.html'||/type="module"/.test(read(p)))&&/type="module"/.test(read('index.html'))],
 ['04 no unsupported Array findLast/toSorted dependency',!/\.findLast\(|\.findLastIndex\(|\.toSorted\(|\.toReversed\(|\.with\(/.test(js)],
 ['05 IntersectionObserver has fallback',app.includes('"IntersectionObserver" in window')&&app.includes('card.classList.add("is-visible")')],
 ['06 ResizeObserver is feature-detected',practicalUi.includes('if("ResizeObserver" in window)')],
 ['07 VisualViewport is optional',practicalUi.includes('window.visualViewport?.addEventListener')],
 ['08 dialog has open fallback',practicalUi.includes('typeof dialog.showModal==="function"')&&practicalUi.includes('dialog.setAttribute("open","")')],
 ['09 dialog close has fallback',practicalUi.includes('typeof dialog.close==="function"')&&practicalUi.includes('dialog.removeAttribute("open")')],
 ['10 crypto.randomUUID has fallback',/crypto\?\.randomUUID\?\.\(\)\|\|id\+"-"\+now/.test(practicalUi)],
 ['11 practical Web Share is feature-detected',practicalUi.includes('navigator.share&&(!navigator.canShare||navigator.canShare(shareData))')],
 ['12 interview Web Share is feature-detected',interviewUi.includes('navigator.share&&(!navigator.canShare||navigator.canShare(shareData))')],
 ['13 practical clipboard has fallback',practicalUi.includes('navigator.clipboard?.writeText')&&practicalUi.includes('document.execCommand("copy")')],
 ['14 interview clipboard has fallback',interviewUi.includes('navigator.clipboard?.writeText')&&interviewUi.includes('document.execCommand("copy")')],
 ['15 file import has FileReader fallback',practicalUi.includes('function readFileText(file)')&&practicalUi.includes('new FileReader()')],
 ['16 storage exceptions are contained',/try\{localStorage\.setItem/.test(store)&&/catch\{storageAvailable=false/.test(store)],
 ['17 shared blur has Safari prefix',style.includes('-webkit-backdrop-filter: blur(16px)')&&style.includes('backdrop-filter: blur(16px)')],
 ['18 practical blur has Safari prefix',practical.includes('-webkit-backdrop-filter:blur(12px)')&&practical.includes('backdrop-filter:blur(12px)')],
 ['19 svh has vh fallback',practical.includes('max-height:52vh')&&practical.includes('max-height:52svh')],
 ['20 dvh has vh fallback',practical.includes('height:100vh')&&practical.includes('height:100dvh')],
 ['21 dynamic dialog calc has vh fallback',practical.includes('height:calc(100vh - 58px - env(safe-area-inset-top))')&&practical.includes('height:calc(100dvh - 58px - env(safe-area-inset-top))')],
 ['22 logical overscroll has x fallback',practical.includes('overscroll-behavior-x:contain')&&practical.includes('overscroll-behavior-inline:contain')],
 ['23 Firefox scrollbar rule is non-critical enhancement',portal.includes('scrollbar-width:none')&&portal.includes('::-webkit-scrollbar')],
 ['24 iOS safe-area is present',/env\(safe-area-inset-bottom\)/.test(practical)&&/viewport-fit=cover/.test(read('practical.html'))],
 ['25 sticky layouts retain normal backgrounds',/position:\s*sticky/.test(style)&&/background: rgba\(255, 255, 255, \.88\)/.test(style)],
 ['26 no CSS :has dependency',![style,practical,portal,read('css/learning.css'),read('css/interview.css'),read('css/jobs.css')].some(c=>/:has\(/.test(c))],
 ['27 no service worker dependency',!/serviceWorker\.register|new SharedWorker|new Worker\(/.test(js)],
 ['28 no hardware permission dependency',!/getUserMedia\(|geolocation\.|Bluetooth|serial\.requestPort/.test(js)],
 ['29 Safari Firefox build version is active',read('practical.html').includes('20261005-browser-1')&&read('interview.html').includes('20261005-browser-1')],
 ['30 browser compatibility fixes do not remove core modules',runtime.every(path=>read(path).trim().length>0)&&pages.every(path=>read(path).includes('</html>'))]
];

for(const [name,ok] of checks){assert.ok(ok,name);console.log('PASS '+name);}
console.log('FINAL: 30/30 Safari/Firefox source-level compatibility checks passed.');
