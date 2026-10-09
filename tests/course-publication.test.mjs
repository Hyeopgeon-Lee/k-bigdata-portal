import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {services} from '../js/services.js';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
for(const path of ['courses.html','css/course-study.css','course-quiz.html','js/course-study.js','data/courses/bigdata-platform.json'])assert.equal(existsSync(new URL(path,root)),false,path+' must not be published');
for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(html|js|json)$/.test(p)&&!p.startsWith('.git')&&!p.startsWith('tests'))){assert.doesNotMatch(read(path.replaceAll('\\','/')),/courses\.html|course-bigdata|course-quiz\.html|data\/courses\/bigdata-platform\.json|BDP-MID-\d+|교과목 문제풀이/,path);}
assert.ok(!services.some(s=>s.id==='course-bigdata'));
for(const id of ['practical','interview'])assert.ok(services.some(s=>s.id===id));
console.log('PASS: course page, quiz routes, payloads and links removed; other problem services retained.');
