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
