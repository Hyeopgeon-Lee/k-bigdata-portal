import assert from "node:assert/strict";
import {renderLearningVisualization} from "../js/learning-visualization.mjs";
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.className="";this.textContent="";this.dataset={};this.style={};this.attrs={};this.events={};this.value="";}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=[...children];}
 setAttribute(key,value){this.attrs[key]=value;}
 addEventListener(key,fn){this.events[key]=fn;}
}
globalThis.document={createElement:tag=>new Element(tag)};
const select=(root,cls)=>[...(root.className.split(" ").includes(cls)?[root]:[]),...root.children.flatMap(x=>select(x,cls))];
const text=root=>[root.textContent,...root.children.map(text)].join(" ");
const stats={cohortSize:12,activeStudents:8,attempts:39,subjects:{JAVA:{participants:6,attempts:30},PYTHON:{participants:3,attempts:9}},grades:[{grade:1,cohortSize:7,activeStudents:5,attempts:24},{grade:2,cohortSize:5,activeStudents:3,attempts:15}],questions:[
 {subject:"JAVA",question:"JAVA-001",participants:6,correctStudents:2,incorrectStudents:3,ungradedStudents:1,attempts:12,wrongAttempts:8},
 {subject:"PYTHON",question:"PY-001",participants:3,correctStudents:3,incorrectStudents:0,ungradedStudents:0,attempts:9,wrongAttempts:0}
],daily:[{date:"2026-11-23",grade1:5,grade2:3}]};
const root=new Element("div");let selected="",subjectOpened="",writtenOpened="";
renderLearningVisualization(root,stats,{range:"11.23 ~ 11.29",basis:"live",onGrade:value=>{selected=value;},onSubject:key=>{subjectOpened=key;},onWritten:key=>{writtenOpened=key;}});
assert.equal(select(root,"lv-kpi").length,2);
assert.match(text(select(root,"lv-kpi")[0]),/8명/);
assert.equal(select(root,"lv-subject").length,8);
assert.match(text(select(root,"lv-subject")[0]),/Java.*6명.*30회 풀이/);
assert.equal(select(root,"lv-grade-card").length,2);
assert.match(text(select(root,"lv-grade-card")[0]),/참여 5명 \/ 재학생 7명/);
select(root,"lv-detail-button")[0].events.click();assert.equal(selected,"1");
select(root,"lv-detail-button")[2].events.click();assert.equal(subjectOpened,"JAVA");
select(root,"lv-detail-button").at(-1).events.click();assert.equal(writtenOpened,"ENGINEER");
assert.equal(select(root,"lv-question").length,2);
assert.match(text(select(root,"lv-question")[0]),/참여 6명.*40%.*정답 2명.*오답 3명.*미판정 1명.*12회 풀이.*8회/);
assert.equal(select(root,"lv-stacked")[0].attrs["aria-label"],"정답 2명, 오답 3명, 미판정 1명");
assert.deepEqual(select(root,"lv-segment").slice(0,3).map(x=>x.style.flex),["2","3","1"]);
assert.match(text(select(root,"lv-daily-row")[0]),/5명.*3명/);
const [subject,sort]=select(root,"lv-select");
subject.value="PYTHON";subject.events.change();assert.equal(select(root,"lv-question").length,1);assert.match(text(select(root,"lv-question")[0]),/PY-001.*참여 3명.*100%/);
subject.value="NCP";subject.events.change();assert.equal(select(root,"lv-question").length,0);assert.match(text(root),/해당 과목의 풀이 기록이 없습니다/);
subject.value="";subject.events.change();sort.value="participants";sort.events.change();assert.match(text(select(root,"lv-question")[0]),/JAVA-001/);
renderLearningVisualization(root,{...stats,smallCohortHidden:true});assert.equal(select(root,"lv-question").length,0);assert.match(text(root),/5명 미만/);
renderLearningVisualization(root,{...stats,questions:[],grades:[stats.grades[1]]},{grade:"2",basis:"snapshot"});assert.equal(select(root,"lv-grade-card").length,0);assert.equal(select(root,"lv-daily-line").length,1);assert.match(text(root),/확정 통계/);
renderLearningVisualization(root,null);assert.match(text(root),/통계를 조회할 수 없습니다/);
console.log("PASS: distinct student counts, grade and subject selection, result segments, daily breakdown, no-data and privacy states");

/* Ensure the export uses exactly the currently rendered aggregate and no answer/student records. */
import {learningShareModel,learningShareText,drawLearningShareCanvas} from "../js/learning-chart-share.mjs";
const names={JAVA:"Java",C:"C언어",PYTHON:"Python",LINUX:"Ubuntu",NCP:"NCP",PRACTICAL:"정보처리 실기",INDUSTRIAL:"산업기사 필기",ENGINEER:"기사 필기"};
const dates={periodStart:"2026-12-28T00:00:00+09:00",periodEnd:"2027-01-04T00:00:00+09:00"};
const exportStats={...stats,daily:[{date:"2026-12-28",grade1:5,grade2:3},{date:"2026-12-29",grade1:0,grade2:2}],studentName:"비공개정보",questions:[{answer:"비공개답안"}]};
const model=learningShareModel(exportStats,{...dates,subjectNames:names,partial:true,grade:""});
assert.equal(model.range,"2026.12.28.(월) ~ 2027.01.03.(일)");
assert.equal(model.filename,"문제풀이_전체학년_2026-12-28_2027-01-03.png");
assert.equal(model.title,"전체 학년 주간 문제 풀이 학습현황");
assert.deepEqual(model.rows.map(row=>row.counts),[[5,3],[0,2]]);
assert.equal(model.subjects.length,8);
assert.equal(model.subjects[0].participants,6);
assert.equal(model.basis,"실시간 집계");
const copy=learningShareText(model);
assert.match(copy,/12\/28\(월\) · 1학년 5명 \/ 2학년 3명/);
assert.match(copy,/Java · 6명/);assert.doesNotMatch(copy,/비공개/);
const g2=learningShareModel({...exportStats,cohortSize:5,activeStudents:3,attempts:15,subjects:{JAVA:{participants:3}}},{...dates,grade:"2",subjectNames:names,basis:"snapshot"});
assert.deepEqual(g2.grades,[2]);assert.deepEqual(g2.rows.map(r=>r.counts),[[3],[2]]);
assert.doesNotMatch(learningShareText(g2),/1학년/);
assert.match(learningShareText(g2),/Java · 3명/);
const drawn=[];
const ctx={fillRect(){},beginPath(){},moveTo(){},arcTo(){},closePath(){},fill(){},fillText(value,x,y,size){drawn.push({value,x,y,size});}};
const canvas={getContext:()=>ctx};drawLearningShareCanvas(canvas,model);
assert.equal(canvas.width,1080);
assert.ok(canvas.height>1500&&canvas.height<2000);
for(const value of [model.title,model.range,"요일별 문제 풀이 참여 학생 수","과목별 학습 참여 학생","Java","8명","39회","5","3","0","6명"])
 assert.ok(drawn.some(d=>d.value===value),value);
assert.ok(drawn.every(d=>d.x>=0&&d.x<=1080&&d.y>=0&&d.y<=canvas.height));
const month=learningShareModel({...exportStats,daily:Array.from({length:31},(_,i)=>({date:"2027-01-"+String(i+1).padStart(2,"0"),grade1:1,grade2:2}))},{period:"month",periodStart:"2027-01-01T00:00:00+09:00",periodEnd:"2027-02-01T00:00:00+09:00",subjectNames:names});
assert.equal(month.rows.length,31);assert.equal(month.title,"전체 학년 월간 문제 풀이 학습현황");
drawn.length=0;drawLearningShareCanvas(canvas,month);assert.ok(canvas.height>2600&&canvas.height<3200);
assert.ok(drawn.some(d=>d.value==="1/31"));assert.ok(drawn.some(d=>d.value==="일별 문제 풀이 참여 학생 수"));
renderLearningVisualization(root,exportStats,{...dates,range:"12.28 ~ 1.3"});
assert.equal(select(root,"lv-share").length,1);assert.equal(select(root,"study-share-band").length,1);
assert.match(select(root,"study-share-manual")[0].value,/2026\.12\.28\.\(월\) ~ 2027\.01\.03\.\(일\)/);
renderLearningVisualization(root,{...exportStats,subjects:{JAVA:{participants:3}}},{...dates,grade:"2"});
assert.match(select(root,"study-share-manual")[0].value,/2학년 주간/);
assert.doesNotMatch(select(root,"study-share-manual")[0].value,/1학년/);
renderLearningVisualization(root,null);assert.equal(select(root,"lv-share").length,0);
console.log("PASS: combined export model, day/subject counts, inclusive KST range, year transition, month layout, grade scope, redraw and aggregate-only privacy");

// Web Share, file fallback, cancellation and copied text use the same model.
const downloads=[],shared=[];
const fakeCanvas={getContext:()=>ctx,toDataURL:()=>"data:image/png;base64,iVBORw0KGgo="};
const oldCreate=document.createElement;
document.createElement=tag=>{
 if(tag==="canvas")return fakeCanvas;
 const element=oldCreate(tag);
 element.click=async()=>{if(tag==="a")downloads.push(element.download);else await element.events.click?.();};
 element.remove=()=>{};element.focus=()=>{};element.select=()=>{};
 return element;
};
document.body=new Element("body");
Object.defineProperty(globalThis,"navigator",{configurable:true,value:{
 canShare:({files})=>files.length===1&&files[0].type==="image/png",
 share:async data=>shared.push(data),
 clipboard:{writeText:async value=>{globalThis.copiedLearningText=value;}}
}});
const originalTimeout=globalThis.setTimeout;globalThis.setTimeout=fn=>{fn();};
try{
 renderLearningVisualization(root,exportStats,{...dates,grade:""});
 const [band,download,copyButton]=select(root,"study-chart-share-actions")[0].children;
 const status=select(root,"study-share-status")[0];
 await band.click();assert.equal(shared.length,1);assert.equal(shared[0].files.length,1);
 assert.equal(shared[0].files[0].name,model.filename);assert.equal(shared[0].files[0].type,"image/png");
 assert.match(shared[0].text,/요일별 문제 풀이 참여 학생 수[\s\S]*과목별 학습 참여 학생/);
 await download.click();assert.equal(downloads[0],model.filename);
 navigator.canShare=()=>false;await band.click();assert.equal(downloads.length,2);assert.match(status.textContent,/지원하지 않습니다/);
 navigator.canShare=()=>true;navigator.share=async()=>{throw new DOMException("aborted","AbortError");};
 await band.click();assert.match(status.textContent,/취소/);assert.equal(downloads.length,2);assert.equal(band.disabled,false);
 await copyButton.click();assert.match(globalThis.copiedLearningText,/Java · 6명/);
 navigator.clipboard.writeText=async()=>{throw Error("denied");};await copyButton.click();
 assert.equal(select(root,"study-share-manual")[0].hidden,false);
}finally{globalThis.setTimeout=originalTimeout;}
console.log("PASS: combined PNG share, single image, download and unsupported-browser fallback, cancellation and clipboard");
