import assert from "node:assert/strict";
import {legacyGradeOverrides,publishedGrade,visibleToGrade} from "../data/calendar-grade-bridge.js";
const fixtures=[
 ["2026-10-21","발표회 이력서 제출","2"],
 ["2026-10-23","중학생진로체험","1"],
 ["2026-10-26","졸업작품설치","2"],
 ["2026-10-28","졸업발표회","2"],
 ["2026-11-17","쪽지시험","1"],
 ["2026-11-23","쪽지시험","1"]
];
assert.equal(Object.keys(legacyGradeOverrides).length,fixtures.length);
for(const [startDate,title,grade] of fixtures){
 const event={startDate,title};
 assert.equal(publishedGrade(event,title),grade,"grade from confirmed memo: "+title);
 assert.equal(publishedGrade({...event,targetGrade:"all"},title),"all","updated API overrides temporary bridge");
 assert.equal(publishedGrade({...event,targetGrade:"1"},title),"1","updated API overrides temporary bridge");
}
assert.equal(publishedGrade({startDate:"2026-10-21",title:"기타 행사"},"기타 행사"),"all","do not alter unmatched events");
assert.equal(publishedGrade({startDate:"2026-11-21",title:"발표회 이력서 제출"},"발표회 이력서 제출"),"all","do not accidentally match different dates");
assert.equal(publishedGrade({startDate:"2026-10-29",title:"[2학년] 졸업발표회"},"졸업발표회"),"2","legacy calendar title tag works");
assert.equal(publishedGrade({startDate:"2026-10-29",title:"[1학년] 안내"},"안내"),"1","legacy first-year title tag works");
assert.equal(publishedGrade({startDate:"2026-10-29",title:"[1학년] 안내",targetGrade:"all"},"안내"),"all","explicit common tag honored");
// Regression: common events are visible for BOTH grades, specific events only for their own.
for(const grade of ["1","2"]){
 assert.equal(visibleToGrade({targetGrade:"all"},grade),true,"common event for "+grade+"학년");
 assert.equal(visibleToGrade({targetGrade:grade},grade),true,"specific event for "+grade+"학년");
 assert.equal(visibleToGrade({targetGrade:grade==="1"?"2":"1"},grade),false,"other grade hidden");
}
assert.equal(visibleToGrade({targetGrade:"all"},"3"),false,"unknown grade has no permission");
console.log("PASS: calendar grade detection and shared-event visibility for both dashboards.");
