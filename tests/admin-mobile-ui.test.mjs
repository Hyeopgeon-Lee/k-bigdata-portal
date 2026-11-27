import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {groupCounts,matchesGrade,gradeLabel} from "../admin/js/admin-ui.mjs";
const read=file=>readFileSync(new URL("../"+file,import.meta.url),"utf8");
for(const page of ["index","accounts","learning","certifications","rooms","help","alumni","mock-exam"]){
 const html=read("admin/"+page+".html");
 assert.match(html,/admin-mobile\.css\?v=20261128-ui-1/);
 assert.match(html,/guard\.mjs\?v=20261128-ui-1/);
 assert.match(html,/data-admin-module-version="20261128-ui-1"/);
}
assert.match(read("admin/js/guard.mjs"),/await import\("\.\/admin-ui\.mjs/);
assert.ok(read("admin/js/guard.mjs").indexOf("context.isAdmin!==true")<read("admin/js/guard.mjs").indexOf("setupAdminUI"));
assert.match(read("admin/css/admin-mobile.css"),/--admin-action-height:48px/);
assert.match(read("admin/css/admin-mobile.css"),/word-break:keep-all/);
assert.match(read("admin/js/rooms.js"),/q\.in\("owner_id",ids\)/);
assert.match(read("admin/js/help.js"),/q\.in\("owner_id",ids\)/);
assert.match(read("admin/js/certifications.js"),/const scoped=gradeRecords/);
assert.match(read("admin/js/dashboard.js"),/p_grade:value\?Number\(value\):null/);
assert.match(read("alumni/js/admin.js"),/p_year:year/);
assert.deepEqual(groupCounts([{academic_year:1},{academic_year:2},{academic_year:2},{}],x=>x.academic_year),[[2,2],[1,1],["미설정",1]]);
assert.equal(matchesGrade({academic_year:2},"1"),false);
assert.equal(matchesGrade({academic_year:2},"2"),true);
assert.equal(matchesGrade({}, ""),true);
assert.equal(gradeLabel("1"),"1학년");
console.log("PASS: shared admin mobile styling, guard order, grade-scoped queries, and chart grouping");
