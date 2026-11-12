import assert from 'node:assert/strict';
import {test} from 'node:test';
import {parseQnetJson,parseSqldHtml} from '../supabase/functions/certification-schedule-sync/parsers.mjs';
const officialSample=String.raw`<h4>2026년도 일정</h4><table><caption>2026년 국가공인 데이터 관련 자격증 시험 일정표</caption>
<tbody class="sch tab3"><tr><td rowspan="2">SQL 전문가</td><td>제54회</td></tr>
<tr><td rowspan="5">SQL 개발자 <div><img alt="SQL 개발자" /></div></td></tr>
<tr><td>제60회</td><td>-</td><td>2.2~6</td><td>2.20</td><td>3.7(토)</td><td>3.20~24</td><td>3.27</td><td>-</td></tr>
<tr><td>제61회</td><td>-</td><td>4.27~5.1</td><td>5.15</td><td>5.31(일)</td><td>6.12~16</td><td>6.19</td><td>-</td></tr>
<tr><td>제62회</td><td>-</td><td>7.20~24</td><td>8.7</td><td>8.22(토)</td><td>9.4~8</td><td>9.11</td><td>-</td></tr>
<tr><td>제63회</td><td>-</td><td>10.12~16</td><td>10.30</td><td>11.14(토)</td><td>11.27~12.1</td><td>12.4</td><td>-</td></tr>
</tbody></table>`;
test('K-DATA official SQLD table parses 4 rounds, 12 events, and cross-month dates',()=>{
 const p=parseSqldHtml(officialSample);
 assert.equal(p.year,2026);assert.equal(p.rounds,4);assert.equal(p.events.length,12);
 const reg=p.events.find(x=>x.exam_round===61&&x.event_type==='registration');
 assert.equal(reg.start_date,'2026-04-27');assert.equal(reg.end_date,'2026-05-01');
 assert.equal(p.events.find(x=>x.exam_round===63&&x.event_type==='result').start_date,'2026-12-04');
});
test('K-DATA rejects guesses, altered markup, and invalid chronology',()=>{
 assert.throws(()=>parseSqldHtml(officialSample.replace('2026년 국가공인','2027년 국가공인').replace('2026년도 일정','2027년도 일정').replace('2.2~6','2.50~60')), /INVALID_OFFICIAL_DATE/);
 assert.throws(()=>parseSqldHtml(officialSample.replace('3.7(토)','1.7(토)')),/SQLD_CHRONOLOGY_ERROR/);
 assert.throws(()=>parseSqldHtml('<html>no official schedule</html>'),/INVALID_OFFICIAL_HTML/);
});
const qnetItem={implYy:'2027',implSeq:'1',qualgbCd:'T',jmCd:'1320',
 docRegStartDt:'20270110',docRegEndDt:'20270113',
 docExamStartDt:'20270210',docExamEndDt:'20270223',
 docPassDt:'20270301',pracRegStartDt:'20270303',pracRegEndDt:'20270305',
 pracExamStartDt:'20270410',pracExamEndDt:'20270420',pracPassDt:'20270510'};
test('Q-Net JSON maps two-level official dates into 6 events',()=>{
 const p=parseQnetJson({response:{header:{resultCode:'00'},body:{items:{item:[qnetItem]}}}},2027,'engineer');
 assert.equal(p.events.length,6);assert.equal(p.events[0].start_date,'2027-01-10');
 assert.equal(p.events[5].event_type,'final_result');
 assert.equal(parseQnetJson({response:{header:{resultCode:'00'},body:{items:{item:[qnetItem]}}}},2027,'industrial').events.length,0);
});
test('Q-Net rejects missing required date and API error without publishing',()=>{
 assert.throws(()=>parseQnetJson({response:{header:{resultCode:'20'},body:{items:[]}}},2027,'engineer'),/QNET_API_RESULT_ERROR/);
 assert.throws(()=>parseQnetJson({response:{header:{resultCode:'00'},body:{items:{item:[{...qnetItem,pracRegStartDt:''}]}}}},2027,'engineer'),/QNET_ROUND_INCOMPLETE/);
});
