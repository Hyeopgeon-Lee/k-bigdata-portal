import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderPageIntro} from '../scripts/portal-shell-template.mjs';
import {portalPages} from '../js/portal-navigation-model.mjs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url));
const types={'engineer-written':'정보처리기사','industrial-written':'정보처리산업기사'};
for(const [page,label] of Object.entries(types)){
  test(page+' offers the matching local downloadable PDF',()=>{
    const html=read(page+'.html').toString('utf8');
    const intro=renderPageIntro(portalPages[page],page);
    const path='media/manuals/'+page+'-guide.pdf';
    assert.ok(html.includes(intro),'generated intro must match the shared template');
    assert.ok(intro.includes('href="'+path+'"'));
    assert.ok(intro.includes('download="'+label+'_필기_문제풀이_사용설명서.pdf"'));
    assert.ok(intro.includes('aria-label="'+label+' 필기 사용설명서 PDF 다운로드"'));
    assert.equal((html.match(/written-manual-download/g)||[]).length,1);
    assert.equal(read(path).subarray(0,5).toString(),'%PDF-');
    assert.ok(read(path).length>10000);
  });
}
test('download link does not add a lesson menu or appear during an active question',()=>{
  for(const page of ['practical','coding','ncp']){
    assert.ok(!renderPageIntro(portalPages[page],page).includes('written-manual-download'));
  }
  const css=read('css/written-exam.css').toString();
  assert.match(css,/\.written-bank-page\.is-solving #study-intro>\.written-manual-download/);
  assert.ok(css.includes('.written-mock-screen:not(.mock-result)'));
  assert.match(css,/@media\(max-width:767px\)/);
});
