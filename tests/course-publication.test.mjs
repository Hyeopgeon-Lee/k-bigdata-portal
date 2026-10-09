import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {services} from '../js/services.js';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
for(const path of ['course-quiz.html','js/course-study.js','data/courses/bigdata-platform.json'])assert.equal(existsSync(new URL(path,root)),false,path+' must not be published');
for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(html|js|json)$/.test(p)&&!p.startsWith('.git')&&!p.startsWith('tests'))){assert.doesNotMatch(read(path.replaceAll('\\','/')),/course-quiz\.html|data\/courses\/bigdata-platform\.json|BDP-MID-\d+|교과목 문제풀이/,path);}
const html=read('courses.html');
assert.match(html,/빅데이터플랫폼실습/);
assert.match(html,/Rocky Linux/);
assert.match(html,/HDFS 파일 관리 및 실습 응용/);
assert.doesNotMatch(html,/문항|모범답안|힌트|순서대로 풀기|랜덤 문제|다시 풀 문제|id="progress"/);
for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g))if(!/^(https?:|#)/.test(url))assert.ok(existsSync(new URL(url.split(/[?#]/)[0],root)),url);
assert.equal(services.find(s=>s.id==='course-bigdata').name,'교과목 안내');
for(const id of ['practical','interview'])assert.ok(services.some(s=>s.id===id));
console.log('PASS: course information retained; quiz routes, payloads and links removed; other problem services retained.');
