import assert from 'node:assert/strict';
import {readFileSync, existsSync, statSync} from 'node:fs';
import {questions, interviewGroups, interviewJobTags, matchesInterviewCategory, selectRandomQuestions, questionSearchText, interviewSources} from '../js/interview.js';
import {renderInterviewQuestion,practiceModeButtonId} from '../js/interview-ui.js';
import {matches, searchIndex, normalize} from '../js/search.js';
import {jobs} from '../js/jobs.js';
import {docs} from '../js/docs.js';

const counts = {'자료구조·알고리즘':15,'Java·객체지향':18,'데이터베이스·SQL':18,'운영체제·Linux':14,'네트워크·Web·HTTP':17,'Spring Boot·Backend':18,'Git·GitHub':8,'Docker·Kubernetes':18,'DevOps·Cloud Native·MSA':14,'AI·데이터 기초':10};
assert.equal(practiceModeButtonId(null,null),'show-all');
assert.equal(practiceModeButtonId({mode:'one'},null),'random-one');
assert.equal(practiceModeButtonId({mode:'ten',items:[questions[0]]},null),'random-ten');
assert.equal(practiceModeButtonId({mode:'ten',complete:true},null),'random-ten');
assert.equal(practiceModeButtonId(null,questions[0]),null);
assert.equal(questions.length,150);
assert.deepEqual(interviewGroups,Object.keys(counts));
assert.equal(new Set(questions.map(q=>q.id)).size,150);
assert.equal(new Set(questions.map(q=>q.code)).size,150);
assert.equal(new Set(questions.map(q=>normalize(q.question))).size,150);
for(let i=1;i<=28;i++)assert.ok(questions.some(q=>q.id==='q'+i),'legacy q'+i);
for(const [group,count]of Object.entries(counts))assert.equal(questions.filter(q=>q.group===group).length,count);
for(const q of questions){
  for(const field of ['id','code','category','group','subCategory','difficulty','question','shortAnswer','detailedAnswer'])assert.ok(q[field]?.trim(),q.id+': '+field);
  assert.ok(['기초','기본','심화'].includes(q.difficulty));
  assert.ok(q.keywords.length>=3&&q.keywords.length<=6);
  assert.ok(q.followUps.length>=1&&q.followUps.length<=3);
  assert.ok(q.jobTags.length&&q.jobTags.every(tag=>interviewJobTags.includes(tag)));
  assert.ok(q.sourceIds.length&&q.sourceIds.every(id=>interviewSources[id]?.type==='official'));
  assert.ok(q.shortAnswer.length>=65&&q.shortAnswer.length<400);
  assert.ok(q.detailedAnswer.length>=90&&q.detailedAnswer.length<650);
  assert.equal(q.answer,q.shortAnswer);assert.equal(q.extra,q.detailedAnswer);
  const html=renderInterviewQuestion(q);
  assert.ok(html.includes('class="question-answer"'));
  assert.ok(!/<details[^>]*\bopen\b/.test(html));
  for(const heading of ['핵심 답변','상세 설명','핵심 키워드','면접관이 이어서 물어볼 수 있는 질문'])assert.ok(html.includes(heading));
  assert.ok(html.includes('rel="noopener noreferrer"'));
}
const difficulties=Object.fromEntries(['기초','기본','심화'].map(level=>[level,questions.filter(q=>q.difficulty===level).length]));
assert.deepEqual(difficulties,{'기초':63,'기본':74,'심화':13});
const allText=questions.map(questionSearchText).join(' ');
const required=['Array','Linked List','Stack','Queue','Hash Table','Collision','Big-O','Binary Search','BFS','DFS','Tree','Graph','Heap','Priority Queue','Recursion','Sorting','OOP','캡슐화','상속','추상화','다형성','Overloading','Overriding','Interface','Abstract Class','equals','hashCode','StringBuilder','StringBuffer','ArrayList','LinkedList','HashMap','Checked','Unchecked','JVM','JDK','JRE','GC','Thread','synchronized','DBMS','RDBMS','Primary Key','Foreign Key','Unique','1NF','2NF','3NF','Transaction','ACID','B-Tree','Clustered','INNER JOIN','LEFT JOIN','WHERE','HAVING','GROUP BY','Subquery','DELETE','TRUNCATE','DROP','NoSQL','Lock','Deadlock','Isolation Level','Connection Pool','N+1','Context Switching','CPU Scheduling','Race Condition','Critical Section','Mutex','Semaphore','Paging','Virtual Memory','Page Fault','Thrashing','OSI','TCP/IP','TCP','UDP','SYN','FIN','HTTPS','TLS','DNS','HTTP','GET','POST','PUT','PATCH','DELETE','Cookie','Session','JWT','CORS','REST','WebSocket','IoC','DI','Bean','Scope','Component Scan','Controller','Service','Repository','MVC','DispatcherServlet','Filter','Interceptor','AOP','@Transactional','JPA','Hibernate','Entity','Persistence Context','Lazy Loading','Eager Loading','DTO','ExceptionHandler','Validation','Spring Security','Authentication','Authorization','Git','GitHub','Commit','Branch','Merge','Rebase','Conflict','Fetch','Pull','Push','Pull Request','.gitignore','Git Flow','Dockerfile','Layer','Volume','Port Mapping','Network','Compose','Pod','Deployment','ReplicaSet','ConfigMap','Secret','Namespace','Ingress','PersistentVolume','PersistentVolumeClaim','Liveness','Readiness','Rolling Update','HPA','DevOps','CI/CD','Jenkins','Jenkinsfile','Pipeline','Blue-Green','Canary','Cloud Native','MSA','API Gateway','Service Discovery','Configuration','Load Balancing','Stateless','Scale Up','Scale Out','Orchestration','Circuit Breaker','Observability','Logging','Monitoring','Machine Learning','Deep Learning','Training','Inference','Overfitting','Validation','Classification','Regression','LLM','Token','Embedding','Transformer','RAG'];
for(const term of required)assert.ok(normalize(allText).includes(normalize(term)),'coverage '+term);
for(const code of [200,201,204,400,401,403,404,409,500,502,503])assert.ok(allText.includes(String(code)));
for(const term of ['JWT','Spring Security JWT','쿠버네티스','K8s','CI/CD','Jenkins','리눅스','자료구조','SQL','트랜잭션','RAG','fetch','DevOps']){
  assert.ok(questions.some(q=>matches(questionSearchText(q),term)),'local '+term);
  assert.ok(searchIndex.some(item=>item.type==='기술면접 문제'&&matches(item.text,term)),'portal '+term);
}
for(const item of [...jobs,...docs])for(const category of item.interviewCategories)assert.ok(questions.some(q=>matchesInterviewCategory(q,category)));
for(const tag of interviewJobTags)assert.ok(questions.some(q=>q.jobTags.includes(tag)));
for(let i=0;i<500;i++){
  const picked=selectRandomQuestions(questions,10);
  assert.equal(picked.length,10);assert.equal(new Set(picked.map(q=>q.id)).size,10);
  assert.equal(new Set(picked.map(q=>q.group)).size,10);
}
const small=questions.filter(q=>q.group==='Git·GitHub');
assert.equal(selectRandomQuestions(small,10).length,8);
assert.equal(selectRandomQuestions([],10).length,0);
assert.equal(selectRandomQuestions([...small,small[0]],10).length,8);
const original=questions.map(q=>q.id);selectRandomQuestions(questions,10);assert.deepEqual(questions.map(q=>q.id),original);
const escaped=renderInterviewQuestion({...questions[0],question:'<script>alert(1)</script>',shortAnswer:'<img src=x onerror=alert(1)>'});
assert.ok(!escaped.includes('<script>'));assert.ok(!escaped.includes('<img'));
const html=readFileSync(new URL('../interview.html',import.meta.url),'utf8');
assert.ok(html.includes('content="noindex, nofollow"'));
for(const [,path]of html.matchAll(/(?:href|src)="([^"]+)"/g))if(!/^(https?:|#)/.test(path))assert.ok(existsSync(new URL('../'+path.split(/[?#]/)[0],import.meta.url)));
assert.ok(statSync(new URL('../data/interview-questions.js',import.meta.url)).size<300000);
console.log('PASS: 28 legacy IDs, 150 unique questions / 10 fields, 63/74/13 difficulties, required topic coverage, hidden answers, search/links, 500 balanced random sessions, short/empty pools, escaping, SEO.');
console.log(JSON.stringify(counts));
