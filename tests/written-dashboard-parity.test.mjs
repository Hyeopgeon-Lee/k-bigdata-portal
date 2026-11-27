import assert from "node:assert/strict";
import {writtenConfig,writtenDashboard,writtenPeriodSeries,writtenPeriodChart,summarizeWritten} from "../js/written-dashboard.mjs";
for(const type of ["engineer","industrial"]){
 const c=writtenConfig(type),bank=c.subjects.flatMap((subject,i)=>Array.from({length:20},(_,j)=>({id:type+"-"+i+"-"+j,subject,year:2025,round:1,answer:1})));
 const records=bank.map((q,i)=>({id:q.id,answer:i%2?2:1,at:Date.parse("2026-11-26T16:00:00Z"),elapsedSeconds:30}));
 const s=summarizeWritten(bank,records,type);assert.equal(s.all.total,c.total);assert.equal(s.all.latest,c.total/2);assert.equal(s.rounds[0].parts.length,c.subjects.length);assert.equal(s.rounds[0].complete,true);assert.equal(s.rounds[0].passed,false);
 const html=writtenDashboard(bank,records,true,"2025",type);for(const title of ["기출 학습 진도","최근 풀이 결과","과목별 기출 학습량","과목별 최근 정답률","회차별 학습 성적표","실전 모의고사 기록"])assert.ok(html.includes(title));assert.ok(html.includes("전체 "+c.total+"문항"));for(const subject of c.subjects)assert.ok(html.includes(subject));
 const rows=[...s.history.values()].flat();const now=Date.parse("2026-11-27T03:00:00Z");const series=writtenPeriodSeries(rows,7,now);assert.equal(series.length,7);assert.equal(series.at(-1).day,"2026-11-27");assert.equal(series.at(-1).right,c.total/2);assert.equal(series.at(-1).wrong,c.total/2);assert.equal(series[0].right,0);assert.ok(writtenPeriodChart(rows,7,now).includes("총 "+c.total+"회 풀이"));
 assert.equal(writtenPeriodSeries([],0,now).length,1);
 console.log(type+": dashboard parity passed");
}
