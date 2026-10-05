import assert from 'node:assert/strict';
import {questions,interviewSources} from '../js/interview.js';

const byId=id=>questions.find(q=>q.id===id);
const has=(id,...terms)=>{
  const q=byId(id);
  const text=[q?.shortAnswer,q?.detailedAnswer].join(' ');
  return terms.every(term=>text.includes(term));
};
const pass=(name,fn)=>{fn();console.log('PASS '+name);};

pass('01 schema completeness',()=>{assert.equal(questions.length,150);for(const q of questions)for(const f of ['id','group','question','shortAnswer','detailedAnswer'])assert.ok(q[f]);});
pass('02 unique ids',()=>assert.equal(new Set(questions.map(q=>q.id)).size,150));
pass('03 unique visible codes',()=>assert.equal(new Set(questions.map(q=>q.code)).size,150));
pass('04 unique normalized questions',()=>assert.equal(new Set(questions.map(q=>q.question.normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase())).size,150));
pass('05 legacy aliases stay consistent',()=>{for(const q of questions){assert.equal(q.answer,q.shortAnswer);assert.equal(q.extra,q.detailedAnswer);}});
pass('06 every source is official and resolvable',()=>{for(const q of questions){assert.ok(q.sourceIds.length);for(const id of q.sourceIds)assert.equal(interviewSources[id]?.type,'official',q.id+' '+id);}});
pass('07 data structure complexity answers avoid absolutes',()=>{assert.ok(has('q14','평균 O(1)','항상 O(1)인 것은 아닙니다'));assert.ok(has('DS-009','O(1)','O(log n)'));});
pass('08 graph search answer distinguishes weighted paths',()=>assert.ok(has('DS-007','가중치가 없는','가중치가 있는')));
pass('09 Java equality/hash contract',()=>{assert.ok(has('q3','참조형의 ==','equals()'));assert.ok(has('JAVA-006','같은 객체는 같은 hashCode','충돌'));});
pass('10 Java runtime memory model wording',()=>{assert.ok(has('JAVA-012','JVM','JRE','JDK'));assert.ok(has('JAVA-014','스레드별 JVM 스택','힙'));});
pass('11 normalization definitions refined',()=>assert.ok(has('DB-003','1NF','원자적','부분 함수 종속','이행 종속')));
pass('12 transaction/isolation vendor nuance',()=>{assert.ok(has('DB-004','ACID','외부 결제 API'));assert.ok(has('DB-014','Read Uncommitted','Read Committed','제품별'));});
pass('13 SQL outer join/count semantics',()=>{assert.ok(has('q7','LEFT JOIN','WHERE','NULL'));assert.ok(has('DB-018','COUNT(*)','COUNT(o.id)'));});
pass('14 process/thread and context switching',()=>{assert.ok(has('q9','독립된 주소 공간','스레드별 스택'));assert.ok(has('OS-002','레지스터','캐시'));});
pass('15 deadlock four necessary conditions',()=>assert.ok(has('q10','상호 배제','점유 대기','비선점','순환 대기','가능')));
pass('16 virtual memory/page fault nuance',()=>{assert.ok(has('OS-007','가상 주소 공간','페이지'));assert.ok(has('OS-008','모든 Page Fault가 디스크 읽기를 일으키는 것은 아닙니다'));});
pass('17 sync/async separated from blocking',()=>assert.ok(has('q2','서로 다른 두 축','제어권')));
pass('18 TCP/UDP and TCP close nuance',()=>{assert.ok(has('q11','바이트 스트림','전달·순서를 보장하지'));assert.ok(has('NET-004','항상 정확히 네 개라고 단정하지'));});
pass('19 HTTP method and idempotency semantics',()=>{assert.ok(has('NET-009','PUT','PATCH','멱등성'));assert.ok(has('NET-010','응답 코드가 같다는 뜻은 아니며','DELETE'));});
pass('20 JWT verification and confidentiality',()=>{assert.ok(has('NET-013','서명을 검증','exp·iss·aud','암호화되지'));assert.ok(byId('NET-013').sourceIds.includes('jwt'));});
pass('21 CORS browser/credential semantics',()=>assert.ok(has('NET-014','브라우저','서버 간','*를 사용할 수 없습니다')));
pass('22 Spring Framework vs Boot',()=>{assert.ok(has('SPR-001','IoC/DI','자동 설정','starter'));assert.ok(byId('SPR-001').sourceIds.includes('springboot'));});
pass('23 Spring proxy transaction rules',()=>{assert.ok(has('SPR-008','프록시','내부 호출'));assert.ok(has('q6','RuntimeException','checked 예외'));});
pass('24 Persistence LAZY/EAGER standards',()=>{assert.ok(has('SPR-012','EAGER','LAZY','힌트','provider'));assert.ok(byId('SPR-012').sourceIds.includes('persistence'));});
pass('25 Git fetch/pull/push semantics',()=>assert.ok(has('GIT-004','fetch','merge','rebase','fast-forward','push')));
pass('26 Docker persistence/network nuance',()=>{assert.ok(has('q19','호스트 커널','VM'));assert.ok(has('DK-004','볼륨','백업이나 고가용성이 보장되지는'));assert.ok(has('DK-005','EXPOSE','localhost'));});
pass('27 Kubernetes service/probe correctness',()=>{assert.ok(has('K8S-003','selector 기반 Service','EndpointSlice','selector 없는'));assert.ok(has('q22','readiness','liveness','startup probe','성공 전'));});
pass('28 HPA/resource utilization precision',()=>{assert.ok(has('K8S-010','Utilization','resource requests','노드 수를 직접 늘리는 기능은 아닙니다'));assert.ok(byId('K8S-010').sourceIds.includes('hpa'));});
pass('29 HA RTO/RPO definition and source',()=>{assert.ok(has('q18','RTO','RPO','어느 시점의 데이터'));assert.ok(byId('q18').sourceIds.includes('recovery'));});
pass('30 AI/ML answers distinguish evaluation risks',()=>{assert.ok(has('AI-003','일반화','regularization','테스트 데이터'));assert.ok(has('q28','정밀도','재현율','혼동 행렬'));assert.ok(has('AI-010','검색과 생성 품질을 따로 평가','권한'));});

console.log('FINAL: 30/30 interview accuracy regression passes across all 150 questions.');
