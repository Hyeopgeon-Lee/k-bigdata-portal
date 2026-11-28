import assert from "node:assert/strict";
import {studyShareModel,studyShareText,drawStudyShareCanvas,attachStudyChartShare} from "../js/study-chart-share.mjs";
const m=studyShareModel("2026-12-28","1",[3600,1800,0,1,0,0,0],[1,2,0,1,0,0,0]);
assert.equal(m.period,"2026.12.28.(월) ~ 2027.01.03.(일)");
assert.equal(m.title,"1학년 주간 자율학습 현황");
assert.deepEqual(m.rows.map(({hours,count})=>[hours,count]),[[1,1],[.5,2],[0,0],[0,1],[0,0],[0,0],[0,0]]);
assert.equal(m.total,1.5);
assert.equal(studyShareModel("2026-11-23","2",[],[]).gradeLabel,"2학년");
assert.equal(studyShareModel("2026-11-23","",[],[]).gradeLabel,"전체 학년");
assert.throws(()=>studyShareModel("2026-02-30","1",[],[]),/INVALID_STUDY_WEEK/);
const text=studyShareText(m);
assert.match(text,/2026\.12\.28\.\(월\) ~ 2027\.01\.03\.\(일\)/);
assert.match(text,/월요일 · 1명 · 1시간/);
assert.match(text,/일요일 · 0명 · 0시간/);
assert.match(text,/주간 누적 공부시간: 1.5시간/);
// Inspect drawing instructions to ensure all visible aggregate values are included.
const drawn=[];const ctx={fillRect(){},beginPath(){},moveTo(){},arcTo(){},closePath(){},fill(){},fillText(value){drawn.push(value);}};
const canvas={getContext:()=>ctx};assert.equal(drawStudyShareCanvas(canvas,m),canvas);
assert.equal(canvas.width,1080);assert.equal(canvas.height,1320);
for(const value of [m.title,m.period,"월요일 · 1명","일요일 · 0명","1.5시간","한국폴리텍대학 서울강서캠퍼스"])assert.ok(drawn.includes(value),value);
console.log("PASS: weekly PNG data and chart labels, selected grade, year transition, rounded total");

/* Interaction test without platform dependencies. The browser test separately verifies actual PNG decoding. */
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.events={};this.hidden=false;this.disabled=false;}
 setAttribute(key,value){this[key]=value;}
 append(...children){this.children.push(...children);}
 insertBefore(child,before){this.children.splice(this.children.indexOf(before),0,child);}
 querySelector(selector){const key=selector.slice(1);return this.children.find(c=>c.className===key)||null;}
 addEventListener(name,fn){this.events[name]=fn;}
 async click(){if(this.tag==="a"){downloads.push(this.download);return;}return this.events.click?.();}
 remove(){} focus(){} select(){}
}
const downloads=[],shared=[];
const fakeCanvas=new Element("canvas");
fakeCanvas.getContext=()=>ctx;
fakeCanvas.toDataURL=()=>"data:image/png;base64,iVBORw0KGgo=";
const root=new Element("div"),chart=new Element("section"),bars=new Element("div");
chart.className="admin-chart";bars.className="admin-chart-bars";root.append(chart);chart.append(bars);
globalThis.document={createElement:tag=>tag==="canvas"?fakeCanvas:new Element(tag),body:new Element("body")};
Object.defineProperty(globalThis,"navigator",{configurable:true,value:{
 canShare:({files})=>files[0]?.type==="image/png",
 share:async data=>{shared.push(data);},
 clipboard:{writeText:async text=>{globalThis.copiedText=text;}}
}});
const previousTimeout=globalThis.setTimeout;globalThis.setTimeout=fn=>{fn();};
try{
 attachStudyChartShare(root,m);
 const controls=chart.querySelector(".study-chart-share"),actions=controls.querySelector(".study-chart-share-actions");
 const [shareButton,downloadButton,copyButton]=actions.children;
 assert.equal(shareButton.textContent,"밴드 공유하기");
 await shareButton.click();
 assert.equal(shared.length,1);
 assert.equal(shared[0].files[0].type,"image/png");
 assert.match(shared[0].files[0].name,/1학년_2026-12-28_2027-01-03\.png$/);
 assert.equal(shared[0].text,studyShareText(m));
 assert.equal(shareButton.disabled,false);
 await downloadButton.click();
 assert.equal(downloads[0],shared[0].files[0].name);
 navigator.canShare=()=>false;await shareButton.click();assert.equal(downloads.length,2);
 const status=controls.querySelector(".study-share-status");
 assert.match(status.textContent,/지원하지 않습니다/);
 navigator.canShare=()=>true;navigator.share=async()=>{throw new DOMException("aborted","AbortError");};
 await shareButton.click();assert.match(status.textContent,/취소/);assert.equal(downloads.length,2);
 await copyButton.click();assert.equal(globalThis.copiedText,studyShareText(m));
 navigator.clipboard.writeText=async()=>{throw Error("denied");};
 await copyButton.click();assert.equal(controls.querySelector(".study-share-manual").hidden,false);
}finally{globalThis.setTimeout=previousTimeout;}
console.log("PASS: share, download, unsupported browser, cancellation, copy and manual fallback");
