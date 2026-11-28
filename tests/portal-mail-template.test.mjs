import assert from 'node:assert/strict';
import {renderAlumniAnnouncement,renderPortalMail,mailParagraph,mailDetails,mailCallout,mailButton} from '../supabase/functions/_shared/portal-mail.mjs';
const news=renderAlumniAnnouncement('alumni_news','N-test',{news_type:'GRADUATE_SCHOOL',title:'이유진 졸업생, 숭실대학교 정보과학대학원 정보보안과 합격',school_name:'숭실대학교 정보과학대학원',degree_or_program:'정보보안과',content:'첫 문단\n\n축하합니다. <script>alert(1)</script>',approved_at:'2026-11-28T12:00:00Z'});
assert.match(news.html,/이유진 졸업생의 대학원 합격을 축하합니다!/);
assert.match(news.html,/숭실대학교 정보과학대학원/);
assert.match(news.html,/&lt;script&gt;/);assert.doesNotMatch(news.html,/<script/);
assert.match(news.html,/news-detail.html\?id=N-test/);
assert.match(news.html,/mypage.html/);assert.match(news.html,/alumni\/alumni.html/);
assert.match(news.html,/2026\.11\.28/);
const job=renderAlumniAnnouncement('jobs','J-test',{company:'LINE Pay',job_title:'Server Engineer',employment_type:'정규직',recruit_type:'경력',always_open:'TRUE',location:'',skills:'Java|SQL',alumni_comment:'지원 내용을 확인하세요.'});
for(const x of ['LINE Pay','Server Engineer','정규직','경력','상시채용','Java · SQL','job-detail.html?id=J-test','채용정보 자세히 보기'])assert(job.html.includes(x));
assert(!job.html.includes('근무 지역'));
assert.match(job.html,/#147455/);
const obituary=renderAlumniAnnouncement('alumni_news','N-2',{news_type:'OBITUARY',title:'부고 안내',content:'삼가 고인의 명복을 빕니다.',location:'장례식장',relationship:'부친'});
assert.match(obituary.html,/배경|#334155/);assert(!obituary.html.includes('축하합니다'));
assert.match(obituary.html,/고인과의 관계/);
for(const kind of ['news','career','study','report','exam','approval','help','contact','obituary']){
 const html=renderPortalMail({kind,title:'제목',bodyHtml:mailParagraph('<img src=x>')+mailCallout('결과 <script>',kind)+mailDetails([['빈 값',''],['항목','값']],kind),actions:[{href:'https://portal.k-bigdata.kr/',label:'자세히 보기'}]});
 assert.match(html,/max-width:620px/);assert.match(html,/role="presentation"/);assert.match(html,/한국폴리텍대학 서울강서캠퍼스/);assert.match(html,/빅데이터소프트웨어공학과/);assert.doesNotMatch(html,/<script|<img|빈 값/);
 assert.match(html,/&lt;img src=x&gt;/);assert.match(html,/&lt;script&gt;/);
}
assert.equal(mailButton('javascript:alert(1)','unsafe'),'');
assert.equal(mailButton('https://user:password@example.test','unsafe'),'');
console.log('PASS: branded mobile email frame, typed news/job cards, date, opt-out links, safe text and URLs, obituary styling, empty-field omission.');
