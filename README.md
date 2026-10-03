# K-BigData 통합 서비스 포털

한국폴리텍대학 서울강서캠퍼스 빅데이터소프트웨어공학과의 학과 서비스·취업·학습·프로젝트 진입점입니다.
Vanilla HTML/CSS/JavaScript 기반 GitHub Pages 정적 사이트이며 로그인·개인정보 저장·서버·상용 API를 추가하지 않습니다.

운영 주소: https://portal.k-bigdata.kr/

## 메뉴 구조

- 취업 · 진로: 취업 준비 점검, 입사지원 현황, 졸업생 네트워크, IT 직무 가이드
- 학습 · 역량: IT 자격증, 기술면접 문제은행, 개발 공식문서
- 프로젝트 · 성장: 학과 포트폴리오, 졸업작품 주제 가이드
- 학과 생활: 프로젝트실 예약, 학과 요청 · 신고

외부 학과 서비스는 기존 운영 사이트로 연결하며 해당 서비스 저장소를 수정하지 않습니다.

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
js/services.js              서비스와 카테고리 데이터
js/app.js                   기존 메인 카드와 Hero SVG 렌더링
js/certifications.js        자격증 데이터
js/jobs.js                  직무 데이터
js/interview.js             기술면접 질문·답변
js/docs.js                  공식문서 데이터
js/search.js                통합검색 인덱스와 동의어
js/learning-ui.js           필터·상세·검색·랜덤·모바일 메뉴
```

이미지는 외부 의존성 없이 기존 CSS/SVG를 사용합니다. ES Modules를 사용하므로 파일을 직접 열기보다 HTTP 정적 서버로 확인하세요.

## 서비스 추가 / 수정

1. `js/services.js`의 `categories`에 필요한 카테고리의 id, label, english, description을 정의합니다.
2. `services` 배열에 고유 id, name, englishName, category, description, shortDescription, url, icon, accent, tags, featured, order를 추가합니다.
3. 기존 SVG 키는 clipboard, send, users, calendar, wrench입니다. 신규 SVG는 `js/app.js`의 icons에 추가합니다.
4. category는 등록된 카테고리 id와 일치해야 합니다. 외부 URL은 공식 운영 주소를 확인합니다.

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

직무는 현재 7개와 기존 id를 유지합니다. `js/jobs.js`에서 id, name, english, overview(한 줄 정의), description(소개), tags, tasks, essentialSkills, plusSkills, recruitmentKeywords, education, studyOrder, projectIdeas, portfolio, readinessChecklist, interviewTopics, interviewCategories, certifications, relatedRoles, category, aliases를 수정합니다.
projectIdeas는 {title, description}, relatedRoles는 {name, description, id?} 배열입니다. 기존 idea 필드는 호환 목적으로 유지합니다.
jobComparisons와 jobGuidance도 같은 파일에서 관리합니다. 직무 데이터의 기술·키워드는 통합검색과 목록 내 검색에 함께 반영됩니다.
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

`js/interview.js`에 id, category, difficulty, question, answer, keywords, extra를 추가합니다.
답변은 면접에서 말할 수 있는 길이로 작성하고 예외·전제조건은 extra에 설명합니다.
기초/중급 난이도는 학습 안내이며 공식 평가 기준이 아닙니다.
카테고리는 데이터에서 자동 생성됩니다. 답변은 native details/summary로 펼칩니다.
랜덤 1개/10개는 현재 필터·검색 결과에서 중복 없이 선택하며 대상이 부족하면 가능한 수만 표시합니다.

## 통합검색

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

- `docs.html`만 index, follow와 canonical/OG 메타를 사용합니다. 나머지 HTML의 noindex, nofollow는 유지합니다. 이 정책은 인증이나 보안 기능이 아닙니다.
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
