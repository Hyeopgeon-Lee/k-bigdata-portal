# K-BigData 통합 서비스 포털

한국폴리텍대학 서울강서캠퍼스 빅데이터소프트웨어공학과의 학생용 학습·프로젝트·취업 통합 포털입니다.
Vanilla HTML/CSS/JavaScript 기반 GitHub Pages 정적 사이트이며 로그인·개인정보 저장·서버·상용 API를 추가하지 않습니다.

운영 주소: https://portal.k-bigdata.kr/

## 메뉴 구조

- 취업 · 진로: IT 직무 가이드, 취업 준비 점검, 입사지원 현황, 졸업생 네트워크
- 학습 · 역량: IT 자격증, 실기 코딩·SQL 문제은행, 기술면접 문제은행, 개발 공식문서, 기술 블로그
- 프로젝트 · 성장: 학과 포트폴리오, 졸업작품 주제 가이드
- 학과 생활: 프로젝트실 예약, 학과 요청 · 신고

학생 준비 흐름: 직무 탐색 → 기술 학습 → 자격증 준비 → 프로젝트 → 기술면접 → 취업 준비 점검 → 입사지원 → 졸업생 네트워크. 메인의 8단계 링크는 현재 필요한 단계부터 사용할 수 있는 안내이며 학년별 로드맵이나 판정 기능이 아닙니다.

외부 학과 서비스는 기존 운영 사이트로 연결하며 해당 서비스 저장소를 수정하지 않습니다. 기술블로그는 최신 기술 변화·개념·실무 흐름을, 개발 공식문서는 정확한 사용법과 공식 Reference를 제공합니다. 블로그 게시글은 복제하거나 수집하지 않고 서비스 항목 하나만 검색합니다.

## 파일 구조

```text
index.html                  메인 서비스 허브
certifications.html         IT 자격증 목록 / ?id=cka 상세
jobs.html                   IT 직무 목록 / ?id=data 상세
interview.html              기술면접 학습 / ?category=Kubernetes
docs.html                   개발 공식문서
project-guide.html          문제 해결형 프로젝트 제작 가이드
CNAME                       운영 도메인
favicon.svg                 브랜드 아이콘
css/style.css               기존 디자인 시스템
css/learning.css            공통 정보 페이지 / 검색 / 모바일 메뉴
js/services.js              서비스·카테고리·준비 흐름·공통 Footer 데이터
js/app.js                   메인 카드·4영역 Hero 아이콘·준비 흐름 렌더링
js/certifications.js        자격증 데이터
js/jobs.js                  직무 데이터
js/interview.js             문제 데이터 공개 API / 검색 / 균형 랜덤 선택
js/interview-ui.js          문제은행 전용 필터·답변·모의면접 UI
data/interview-questions.js 기술면접 150문제 데이터
data/interview-sources.js   공식 검수 문서와 출제 주제 참고 자료
js/docs.js                  공식문서 데이터
js/search.js                통합검색 인덱스와 동의어
js/learning-ui.js           필터·상세·검색·랜덤·모바일 메뉴
```

이미지는 외부 의존성 없이 기존 CSS/SVG를 사용합니다. ES Modules를 사용하므로 파일을 직접 열기보다 HTTP 정적 서버로 확인하세요.

## 서비스 추가 / 수정

1. `js/services.js`의 `categories`에 필요한 카테고리의 id, label, english, description을 정의합니다.
2. `services` 배열에 고유 id, name, englishName, category, description, shortDescription, url, icon, accent, tags, featured, order를 추가합니다.
3. 기존 SVG 키는 clipboard, send, users, calendar, wrench, book입니다. 신규 SVG는 `js/app.js`의 icons에 추가합니다.
4. category는 등록된 카테고리 id와 일치해야 합니다. 외부 URL은 공식 운영 주소를 확인합니다.
5. serviceKind는 내부 GUIDE / 운영 SERVICE / 외부 학습 EXTERNAL을 구분합니다. 기술블로그의 source는 출처, aliases는 검색 별칭입니다.
6. studentJourney는 메인의 준비 흐름(기존 service id 참조), footerLinks는 모든 페이지의 대표 외부 사이트 5개를 관리합니다. Footer 링크를 바꿀 때 HTML 여러 곳을 수정하지 않습니다.

카테고리별 메인 카드와 통합검색 서비스 항목은 자동 생성됩니다. 카테고리 자체를 변경할 때는 각 HTML의 공통 Navigation도 함께 수정하세요. 서비스 수를 화면에 하드코딩하지 않습니다.

## 자격증 추가 / 수정

`js/certifications.js`에서 id, name, english, category, institution, priority, badges, overview, description, importance, tags, whatYouLearn, fields, roles, roleIds, primaryRoleIds, education, careerUsage, studyOrder, nextStudy, officialCheckItems, url, note, noteTitle, aliases, importanceSources를 관리합니다. 선택적 preparationGuide({title,target,steps,note})는 학과 권장 취득 시기와 준비 계획이며 4개 자격증 상세에서 사용합니다. 공식 시험 일정·응시요건과 구분하며 새 연도에 공식 일정과 학과 안내를 다시 확인하세요.
priority는 core/standard로 핵심 4개 영역과 카드 강조만 제어하며 점수·랭킹을 뜻하지 않습니다. certificationPaths는 진로별 안내, certificationGuidance는 공통 주의사항입니다.
roleIds·primaryRoleIds는 기존 jobs id를 사용합니다. 직무 → 자격증 링크는 기존 직무 데이터의 certifications와 자격증 roleIds의 합집합으로 표시하며 반대 방향도 같은 관계를 사용합니다.
시험 일정·비용·버전·시험시간·유효기간 같은 변경 가능한 값은 하드코딩하지 않습니다. 중요도는 취업 준비 안내이며 채용·실무 능력을 보장하지 않습니다.
`node tests/certifications-guide.test.mjs`로 12개 ID·URL 보존, 핵심 4개, 필드·검색·직무 연결·민감 내용 미노출을 확인합니다.
현재 등록 범위는 지정된 12개 자격증입니다. 운영자가 승인하지 않은 자격증을 임의로 추가하지 않습니다.
명칭 체계가 바뀐 경우 학과 안내 명칭을 보존하고 note에 현재 시행기관 안내를 구분합니다.
시험 일정·비용·응시 자격은 하드코딩하지 않고 공식 시행기관 버튼으로 안내합니다.
상세 URL은 `certifications.html?id=고유id`입니다.

## 직무 추가 / 수정

직무는 현재 7개와 기존 id를 유지합니다. jobGroups는 핵심 진출 5개 / 연계 개발 2개를 구분하며 우열·취업 보장·자격 판정이 아닙니다. 상세의 함께 학습할 기술은 docs.jobIds에서 생성하고, 기존 기술 태그와 자격증·면접 연결도 보존합니다. `js/jobs.js`에서 id, name, english, overview(한 줄 정의), description(소개), tags, tasks, essentialSkills, plusSkills, recruitmentKeywords, education, studyOrder, projectIdeas, portfolio, readinessChecklist, interviewTopics, interviewCategories, certifications, relatedRoles, category, aliases를 수정합니다.
projectIdeas는 {title, description}, relatedRoles는 {name, description, id?} 배열입니다. 기존 idea 필드는 호환 목적으로 유지합니다.
jobComparisons와 jobGuidance도 같은 파일에서 관리합니다. interviewRoleLinks는 면접의 직무 태그에서 직무 가이드로 돌아가는 연결을 관리합니다. 직무 데이터의 기술·키워드는 통합검색과 목록 내 검색에 함께 반영됩니다.
체크리스트는 브라우저 메모리의 자체 점검 UI이며 저장·전송·판정을 하지 않습니다.
interviewCategories는 현재 문제은행의 정확한 카테고리 이름을 사용합니다. 연결된 카테고리가 상세의 모든 면접 주제를 다루는 것은 아닙니다.
certifications는 자격증 데이터의 id 배열입니다. 삭제한 자격증 id를 직무에서 참조하지 않도록 확인하세요.
상세 URL은 `jobs.html?id=고유id`입니다. 직무와 학과 학습의 연계는 학습 안내이며 채용을 보장하지 않습니다.

## 공식문서 추가

직무 가이드 회귀 검사는 저장소 root에서 `node tests/job-guide.test.mjs`로 실행합니다. 별도 설치·빌드 시스템은 필요하지 않습니다. 직무 필드, 23개 검색 키워드, 자격증·면접 연결, 기존 서비스 URL과 noindex를 검사합니다.

`js/docs.js`의 docs 배열에 id, name, english, category, subcategory, overview, description, learn, useCases, related, tags, aliases, url, official, jobIds, interviewCategories, note를 정의합니다. 공식 개발사·기관 문서만 연결하고 official은 true로 유지합니다.
8개 분야는 docCategories에서 관리합니다: Programming / Backend · Security · MSA / Database · Data Platform / Big Data · Streaming / Cloud Native / DevOps · CI/CD · Observability / AI · Computer Vision · LLM / Open API · External Services.
기본 38개 기술과 기존 Vue.js·Flutter를 보존한 40개 목록입니다. pandas·scikit-learn은 제외했습니다. LLM 하위 영역은 subcategory로 구분합니다.
상세 URL은 `docs.html?id=고유id`입니다. related는 등록된 기술명 배열이며 일치하는 기술은 내부 상세 링크로 연결됩니다. jobIds는 기존 직무 id, interviewCategories는 현재 문제은행의 정확한 카테고리 이름을 사용합니다.
직무 상세의 기술 태그는 findDocForSkill로 일치하는 공식문서에 연결합니다. docFlows의 예시는 도구 간 역할 안내이며 필수 설치 순서가 아닙니다.
목록과 통합검색은 설명·학습·활용·연관 기술·별칭까지 검색합니다. API 카드는 실제 API 호출이나 유료 서비스 가입을 추가하지 않습니다. 키·요금·할당량·약관은 제공기관에서 확인합니다.
`node tests/docs-hub.test.mjs`와 `node tests/job-guide.test.mjs`로 데이터·검색·내부 연결·SEO 회귀 검사를 실행합니다.

## 기술면접 문제 추가

`data/interview-questions.js`의 해당 addGroup 안에 q(id, subCategory, difficulty, question, shortAnswer, detailedAnswer, keywords, followUps, overrides)를 추가합니다. 파일 상단의 작성 안내를 확인하세요.
고유 id는 영구 링크이므로 기존 q1~q28을 포함해 변경하지 않습니다. code는 분야별 표시 번호입니다. group은 10개 탐색 분야, category는 기존 jobs/docs의 연결 이름을 유지하는 호환 필드입니다.
jobTags와 sourceIds는 그룹 기본값을 사용하며 필요한 문제만 overrides에서 재정의합니다. 직무 태그는 공통/백엔드/Java/데이터엔지니어/AI개발/클라우드/DevOps 중 선택합니다.
shortAnswer는 말로 설명할 2~4문장, detailedAnswer는 전제·예외를 포함한 3~7문장, keywords는 3~6개, followUps는 1~3개를 권장합니다. 난이도는 기초/기본/심화이며 학습 안내이지 공식 평가가 아닙니다.
`data/interview-sources.js`에 공식 문서 출처를 등록하고 개념·예외를 대조하세요. 면접 정리 저장소와 기업 글은 주제 선정 참고이며 답변을 복사하지 않습니다.
답변은 처음에 닫힌 native details/summary로 표시합니다. 분야·직무·검색을 함께 적용하며 랜덤 10문제는 중복 없이 분야를 골고루 선택해 한 문제씩 진행합니다. 대상이 적으면 실제 개수만 연습합니다. 완료·재시작을 제공하지만 점수·학습 이력은 저장하지 않습니다.
직접 링크는 `interview.html?id=고유id`, 기존 분야 링크는 `interview.html?category=Kubernetes`처럼 유지합니다. 직무 필터는 `?job=DevOps`, 검색은 `?q=JWT`를 지원합니다.
`node tests/interview-bank.test.mjs`로 데이터·검색·500회 랜덤 선택·기존 연결·답변 초기 숨김을 검사합니다. 문제 수를 변경하면 테스트의 목표 개수도 의도에 맞게 갱신하세요. 브라우저 검수 기록은 `tests/interview-bank-qa.md`에 있습니다.

## 실기 코딩·SQL 문제은행

`practical.html`은 종이 풀이 → 최소 60초 → 내 답 제출 → 정답·단계별 풀이 → 오답 재풀이 흐름입니다. 기존 기술면접 문제은행과 별개의 학습 기능입니다. 정보처리기사·산업기사 상세에서 `?exam=engineer` / `?exam=industrial_engineer`로 연결합니다. 영구 문제 링크는 `practical.html?id=문제ID`입니다.

현재 공개한 것은 **초기 검증분**입니다. 복원기출 5개(기사 출제 이력 4건, 산업기사 1건), 변형 4개, 추가 연습 4개입니다. 요청된 258문항을 확보했다고 표시하지 않습니다. 신뢰도 B 4개, C 1개이며 재출제는 아직 확인하지 못했습니다. 산업기사 2022~2024년 9개 회차의 공개 출처 목록은 `data/practical/source-catalogue.json`에 기록했습니다. 출처 확보와 문항 등록은 다릅니다. 원문 대량 복제·변경은 재사용 조건 확인 전 진행하지 않으며, 코드 오류·회차·정답·독립 출처 검수가 필요합니다. `coverage.json`과 페이지의 확보 범위를 함께 갱신하세요.

```text
data/practical/questions.json     고유 문제 master (정답·풀이 포함)
data/practical/exam-history.json  출제 이력 / questionId 참조
data/practical/coverage.json      실제 확보 범위·미확보 안내
js/practical-core.js              집계·정답 판정·60초 규칙·검색 문자열
js/practical-data.js              JSON 로딩 adapter
js/practical-store.js             기기 내 저장 adapter
js/practical-ui.js                목록·풀이·오답·랜덤·학습현황
css/practical.css                 기존 디자인을 재사용한 전용 스타일
tests/practical-bank.test.mjs     데이터·잠금·저장·정직한 집계 검사
```

### 문제·이력 추가

1. questions.json에 영구 `id`, `language`(C/Java/Python/SQL), `title`, `question`, `code`, `questionType`, `difficulty`(기본/실전/고난도), `concepts`, `answer`, `steps`(단계 배열), `explanation`, `sourceType`, `sources`, `enabled`, `createdAt`, `updatedAt`를 정의합니다. 샘플 테이블은 `tables: [{name,columns,rows}]`, 입력값은 `inputData`를 사용할 수 있습니다.
2. `sourceType`은 reconstructed / transformed / practice를 엄격히 구분합니다. 실제 출처 없는 문제에 reconstructed를 사용하지 않습니다. 출처는 `{name,url}`, 검토 메모는 verificationNote입니다. 검토한 답과 원 자료의 오류·차이를 기록하고, 코드·문제의 재사용 권리도 확인하세요. 공개 웹에서 보인다는 이유만으로 장문·대량 원문을 복제하지 않습니다.
3. 복원기출에만 `confidence` A/B/C를 지정합니다. A는 독립적인 다수 출처가 필요합니다. 같은 자료를 재게시한 사이트들을 독립 출처로 세지 않습니다. 출처가 충돌하면 제외하거나 B/C와 차이 설명을 사용합니다.
4. exam-history.json에는 영구 `id`, `questionId`, `examType`(engineer/industrial_engineer), `year`, `round`, `questionNumber`(확인 불가 시 null), `sourceName`, `sourceUrl`, `verificationNote`를 저장합니다. 출처가 여러 개라고 출제 이력을 여러 번 추가하지 않습니다. 동일 문제가 별도 회차에서 확인됐을 때만 같은 questionId에 새 이력을 연결합니다. 단순히 같은 개념은 재출제로 간주하지 않습니다.
5. 변형은 `originalQuestionId`로 원 복원문제에 연결하며 실제 출제 이력을 부여하지 않습니다. 추가 연습도 이력을 만들지 않습니다. 필요하면 보조문제의 `examTypes`로 대상 시험을 제한합니다. 기본은 두 시험 공통 학습입니다.
6. 문자열 정답은 exact 방식입니다. 앞뒤·연속 가로 공백을 정리하지만 줄바꿈과 대소문자는 구별합니다. 검토한 다른 표현만 acceptedAnswers 배열에 추가합니다. SQL 키워드 빈칸은 `grading: "sql_keywords"`로 대소문자와 쉼표 구분을 정리할 수 있습니다(문자열 리터럴 문제에는 사용하지 않습니다). 임의 SQL의 동등성을 확인할 수 없으므로 SQL 작성은 `grading: "self"`를 사용하여 제출·공개 후 직접 판정합니다. 자동 판정은 공식 시험 채점이 아닙니다.
7. UI의 통계는 실제 데이터로 계산합니다. 대표 숫자는 복원기출 출제 이력 수이며 고유 문제 수와 구분합니다. 언어/시험 집계·재출제 수·신뢰도 집계도 데이터 기준입니다. 테스트의 초기 검증분 개수는 의도적으로 실제 등록량에 맞게 수정합니다.

### 저장·학습시간·보안 범위

- 제출 시도·답·정오 여부·풀이시간·해설 확인·재풀이 횟수를 LocalStorage에 저장합니다. 이름·학번·로그인·기기 식별자·학생 순위·서버 전송은 없습니다. 정답률은 판정된 시도만 분모로 쓰며 재풀이도 시도로 집계합니다.
- SessionStorage는 현재 문제의 시작시각·초안·제출 상태를 보관합니다. 새로고침으로 60초를 생략하지 못하도록 시작시각을 유지하고, 명시적 재풀이와 오답 복습은 새 60초를 시작합니다. 저장이 차단되면 메모리로 작동하고 화면에 제한을 알립니다.
- 이는 학습 습관 장치이지 보안 시험 시스템이 아닙니다. 정적 JSON에 정답이 포함되어 개발자 도구·파일 직접 열기로 읽을 수 있습니다. 이런 접근까지 차단한다고 주장하지 않습니다. 클라이언트 시계/저장소를 조작하는 강제 우회도 막지 않습니다.
- 공용 기기에서는 학습현황의 기록 삭제를 사용하세요. 삭제 확인 UI가 있으며 복구 불가입니다. 저장소 초기화·기기 변경 시 기록이 유지되지 않습니다.
- 랜덤은 기본 복원기출만, 5/10/20개 중복 없는 선택입니다. 데이터가 부족하면 실제 수만 제공합니다. 오늘의 문제는 날짜별·언어별 복원문제를 선택하며 필수 수행을 강요하지 않습니다.
- 향후 승인된 GAS/Sheets 연동 시 data/store adapter를 교체할 수 있으나 현재는 연결·서버·추가 API를 만들지 않습니다.

`node tests/practical-bank.test.mjs` 및 기존 테스트를 실행하세요. practical-sql.test.mjs는 Node 24의 내장 SQLite로 예시 SQL을 검증합니다. practical-python.test.mjs는 알려진 bundled Python 또는 PRACTICAL_PYTHON_BIN에서 Python 예시를 실행하며 사용 가능한 Python이 없으면 명확하게 SKIP합니다. 브라우저 런타임에는 이 도구들이 필요 없습니다. 기능·반응형 실측 결과와 데이터 확보 제한은 `tests/practical-bank-qa.md`에 기록합니다. 이 페이지 역시 noindex, nofollow를 유지합니다.

## 통합검색 동작

`js/search.js`가 각 데이터에서 인덱스를 생성합니다. 한글/영문·대소문자·주요 별칭을 고려합니다.
새 동의어는 synonyms 배열에 추가합니다. 여러 검색어는 AND 조건입니다.
검색어는 서버에 전송하거나 저장하지 않습니다.

## GitHub Pages / Custom domain

1. 저장소 Settings → Pages에서 Deploy from a branch, main, /(root)를 선택합니다.
2. Custom domain을 `portal.k-bigdata.kr`로 지정합니다.
3. root의 CNAME은 아래 한 줄을 유지합니다.

```text
portal.k-bigdata.kr
```

4. DNS 관리 화면에서 portal CNAME을 `Hyeopgeon-Lee.github.io`로 연결합니다. 동일 호스트의 충돌하는 A/AAAA 레코드를 확인합니다.
5. DNS 확인과 인증서 발급을 기다린 뒤 Enforce HTTPS를 확인합니다.
6. 커밋 후 Actions의 pages build and deployment 성공과 최신 커밋 반영을 확인합니다.

Pages 설정은 저장소 관리자 권한, DNS 설정은 도메인 관리자 권한이 필요합니다. CNAME 파일만으로 DNS가 설정되지는 않습니다.
복구 시 GitHub에서 해당 변경 커밋을 revert하여 기록을 보존합니다.

## 검증 체크리스트

- portal.k-bigdata.kr의 모든 HTML 페이지는 noindex, nofollow를 유지한다. 새 HTML도 동일하게 적용합니다. 검색 결과 비노출 정책이며 접속 차단·인증·보안 기능이 아닙니다. robots.txt의 전체 크롤링 차단으로 대체하지 않습니다. 외부 공개 사이트의 SEO는 변경하지 않습니다. 기존에 이미 색인된 결과 제거에는 검색엔진 재수집 시간이 필요할 수 있습니다.
- 기존 외부 서비스 주소, 포트폴리오, 학과 홈페이지·홍보 링크 유지.
- 새 페이지 목록·필터·검색·상세·홈 복귀·모바일 메뉴·키보드 탐색 확인.
- Kubernetes / 쿠버네티스 검색에서 CKA, 관련 직무, 문서, 면접 카테고리 확인.
- 360×800, 390×844, 412×915, 768×1024, 1024×768, 1440×900, 1920×1080에서 가로 넘침·버튼·긴 제목·Footer 확인.
- 랜덤 10문제 중복 없음, 현재 검색 결과에서만 선택되는지 확인.
- Console 오류 및 내부 링크 404, 공식 외부 링크 확인.
- reduced-motion에서 불필요한 움직임이 멈추는지 확인.

## 공식 링크 확인 메모

2026-10-03 기준 Q-Net, Oracle, NAVER Cloud, Linux Foundation, 개발 공식문서 및 학과 공식 홈페이지/홍보 페이지의 공식 출처를 확인했습니다.
DataQ·KAIT·대한상공회의소는 공식 출처를 확인했으나 자동 수집 제한 또는 시간 초과가 있어 응시 전에 해당 기관 사이트의 최신 안내를 직접 확인하세요.
OCP·OCJP는 제품/버전별 현행 체계와 구분하고, 워드프로세서 1급은 현재 단일등급 안내를 함께 표시합니다.

## 학생 포털 개편 회귀 검사

`node tests/portal-redesign.test.mjs`와 기존 job-guide / certifications-guide / interview-bank / docs-hub 테스트를 모두 실행합니다. portal-baseline.json은 개편 전 main 커밋의 서비스 URL·7개 직무·12개 자격증·150개 면접·40개 문서 ID 목록입니다. ID를 변경하지 않으며 정책 변경이 없는 한 기준 파일도 임의 갱신하지 않습니다.
모바일 Navigation·키보드·7개 해상도·브라우저 Console·운영 화면 검수는 tests/portal-redesign-qa.md에 기록합니다.
