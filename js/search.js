import {services} from "./services.js";
import {certifications} from "./certifications.js";
import {jobs} from "./jobs.js";
import {docs} from "./docs.js";
import {questions} from "./interview.js";
export const normalize = value => String(value).normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu,"");
const synonyms=[["쿠버네티스","kubernetes","k8s","cka"],["자바","java","ocjp"],["클라우드","cloud"],["데브옵스","devops"],["데이터베이스","database","db","sql"],["파이썬","python"],["스프링","spring"],["도커","docker"],["리눅스","linux"],["깃허브","github"],["케이파스","kpaas"]];
export function matches(text,query){const tokens=query.trim().split(/\s+/).filter(Boolean);const hay=normalize(text);return tokens.every(token=>{const term=normalize(token);const group=synonyms.find(g=>g.map(normalize).includes(term));return (group||[term]).some(s=>hay.includes(normalize(s)));});}
export const searchIndex=[
...services.map(s=>({title:s.name,type:"학과 서비스",url:s.url,text:[s.name,s.englishName,s.description,...s.tags].join(" ")})),
...certifications.map(c=>({title:c.name,type:"IT 자격증",url:"certifications.html?id="+c.id,text:[c.name,c.english,c.category,c.overview,...c.tags,...c.roles].join(" ")})),
...jobs.map(j=>({title:j.name,type:"IT 직무",url:"jobs.html?id="+j.id,text:[j.name,j.overview,j.aliases,...j.tags].join(" ")})),
...docs.map(d=>({title:d.name+" 공식문서",type:"개발 공식문서",url:d.url,text:[d.name,d.overview,d.category,d.aliases].join(" ")})),
...[...new Set(questions.map(q=>q.category))].map(category=>({title:category+" 기술면접 문제",type:"기술면접",url:"interview.html?category="+encodeURIComponent(category),text:category})),
{title:"문제 발견부터 포트폴리오까지",type:"프로젝트 가이드",url:"project-guide.html#process",text:"프로젝트 문제 발견 사용자 데이터 API 기능 기술 스택 MVP GitHub README 테스트 배포 시연 포트폴리오"}
];
