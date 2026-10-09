import {services,serviceKind} from "./services.js?v=20261009-course-info-1";
import {certifications} from "./certifications.js";
import {jobs} from "./jobs.js";
import {docs} from "./docs.js";
import {questions,questionSearchText} from "./interview.js?v=20261005-accuracy-1";
import {normalize,matches,jobSearchText,docSearchText,certificationSearchText} from "./search-core.js?v=20261005-perf-1";
export {normalize,matches,jobSearchText,docSearchText,certificationSearchText} from "./search-core.js?v=20261005-perf-1";
export const searchIndex=[
...services.map(s=>({title:s.name,type:serviceKind(s)==="EXTERNAL"?"외부 학습 사이트":serviceKind(s)==="GUIDE"?"포털 가이드":"학과 서비스",url:s.url,text:[s.name,s.englishName,s.description,s.aliases,s.source,...s.tags].join(" ")})),
...certifications.map(c=>({title:c.name,type:"IT 자격증",url:"certifications.html?id="+c.id,text:certificationSearchText(c,jobs)})),
...jobs.map(j=>({title:j.name,type:"IT 직무",url:"jobs.html?id="+j.id,text:jobSearchText(j)})),
...docs.map(d=>({title:d.name+" 공식문서",type:"개발 공식문서",url:"docs.html?id="+d.id,text:docSearchText(d)})),
...[...new Set(questions.map(q=>q.category))].map(category=>({title:category+" 기술면접 문제",type:"기술면접",url:"interview.html?category="+encodeURIComponent(category),text:questions.filter(q=>q.category===category).map(questionSearchText).join(" ")})),
...questions.map(q=>({title:q.question,type:"기술면접 문제",url:"interview.html?id="+encodeURIComponent(q.id),text:questionSearchText(q)})),
{title:"문제 발견부터 포트폴리오까지",type:"프로젝트 가이드",url:"project-guide.html#process",text:"프로젝트 문제 발견 사용자 데이터 API 기능 기술 스택 MVP GitHub README 테스트 배포 시연 포트폴리오"}
];
// Keep one index; exact title matches outrank incidental mentions inside answers.
export function groupSearchResults(query,index=searchIndex){
 if(!query.trim())return [];
 const labels={"개발 공식문서":"공식문서","IT 직무":"관련 직무","IT 자격증":"자격증","기술면접":"기술면접","기술면접 문제":"기술면접","외부 학습 사이트":"외부 학습","포털 가이드":"학습·서비스","학과 서비스":"학습·서비스","프로젝트 가이드":"프로젝트"};
 const needle=normalize(query),groups=new Map();
 for(const item of index.filter(item=>matches(item.text,query))){
  const exact=normalize(item.title)===needle?100:normalize(item.title).includes(needle)?50:0;
  const score=exact+(item.type==="개발 공식문서"?8:item.type==="IT 직무"?6:item.type==="IT 자격증"?5:0);
  const label=labels[item.type]||item.type;
  if(!groups.has(label))groups.set(label,[]);
  groups.get(label).push({...item,score});
 }
 return [...groups].map(([label,items])=>({label,items:items.sort((a,b)=>b.score-a.score),score:Math.max(...items.map(i=>i.score))})).sort((a,b)=>b.score-a.score);
}
