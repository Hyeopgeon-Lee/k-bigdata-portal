import assert from "node:assert/strict";
import {readFileSync,readdirSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));
const read=p=>readFileSync(path.join(root,p),"utf8");
const publicPages=readdirSync(root).filter(n=>n.endsWith(".html"));
const alumniPages=readdirSync(path.join(root,"alumni")).filter(n=>n.endsWith(".html")).map(n=>"alumni/"+n);
for(const p of [...publicPages,...alumniPages]){
 const html=read(p);
 assert.doesNotMatch(html,/\bPIN\b|핀번호|동문 ID/i,p+" must not mention retired identification methods");
 assert.doesNotMatch(html,/학생용 학습·프로젝트·취업 통합 포털입니다\./,p+" should not repeat the portal description");
 assert.doesNotMatch(html,/관리자 최종 승인 후에만 게시/,p+" must not claim duplicate alumni approval");
}
const news=read("alumni/news-submit.html");
const newsJs=read("alumni/js/news-submit.js");
assert.doesNotMatch(news,/id="news-auth"|id="news-author-email"|id="news-author-name"/);
assert.doesNotMatch(newsJs,/news-author-|news-account-summary|news-account-help/);
assert.match(newsJs,/verifyNewsAlumni/);
assert.ok(read("alumni/js/common.js").includes("consent.insertAdjacentHTML('beforeend'"),"consent controls retained");
assert.match(read("alumni/js/portal-bridge.mjs"),/portal_learning_access/);
assert.match(read("supabase/functions/alumni-network-api/index.ts"),/status:"APPROVED"/);
assert.match(read("room.html"),/id="room-booking-form"/);
assert.match(read("help.html"),/id="help/);
console.log("PASS: portal copy cleanup, no retired PIN copy, account identity derived from session, consent controls preserved");
