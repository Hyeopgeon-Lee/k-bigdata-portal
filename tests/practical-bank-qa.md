# 실기 코딩·SQL 문제은행 구현·검증 보고

검토일: 2026-10-04. **기능 구현과 초기 검증 데이터 공개 단계이며, 요청된 258문항 구축 완료 보고가 아닙니다.**

## 파일 및 기존 구조

최신 main의 HTML 6개, 공통 style/learning CSS, 서비스·직무·자격증·문서·면접 데이터, learning-ui, search, app, 기존 회귀 테스트와 영구 ID 기준 파일을 확인했습니다. 기존 ES Modules·Vanilla JS·GitHub Pages 구조를 유지하며 신규 기능만 분리했습니다. 별도 빌드·서버·DB·GAS·로그인·학생 순위는 없습니다.

수정: README.md, js/services.js, js/learning-ui.js, tests/portal-redesign.test.mjs.

신규: practical.html, css/practical.css, js/practical-core.js, js/practical-data.js, js/practical-store.js, js/practical-ui.js, data/practical/questions.json, data/practical/exam-history.json, data/practical/coverage.json, tests/practical-bank.test.mjs, tests/practical-sql.test.mjs, tests/practical-python.test.mjs, 본 보고서.

신규 URL: https://portal.k-bigdata.kr/practical.html

직접 문제 링크: practical.html?id=R-PY-0001 등. 시험 진입: ?exam=engineer / ?exam=industrial_engineer.

## 구현 화면·기능

- 첫 화면의 종이·펜 안내, 실제 등록량 자동 통계, 오늘의 문제, 기본 복원기출 필터.
- 통합 master/history 데이터. 기사·산업기사 / 언어 / 문제 종류 / 난이도 / 문제유형 / 검색 필터.
- 최신 출제 / 출제 횟수 / 난이도 / 이 기기의 개인 오답률 / 랜덤 정렬.
- 복원·변형·연습의 서로 다른 Badge, 신뢰도, 확인한 회차와 출제 횟수. 동일 개념만으로 재출제를 표시하지 않음.
- 코드의 로컬 lexical syntax highlighting, SQL 샘플 표, 영역 내부 스크롤.
- 60초 전 제출·정답 공개 불가. JavaScript 가드와 실제 disabled 양쪽 적용.
- 새로고침 시 SessionStorage 시작시각과 초안 유지. 60초 후에도 답 제출 전 정답 비공개.
- 제출 후 별도 공개 버튼, 내 답·정답·단계별 풀이·출처·변형 연결.
- 정오 기록, 오답노트, 새 60초로 다시 풀기. SQL 작성은 예시와 직접 비교·판정하며 임의 SQL 동등성을 자동 판정하지 않음.
- 기본 복원기출만 랜덤, 시험/언어/종류 및 5/10/20문제 선택. 대상이 부족하면 실제 수만 진행, 중복 없는 큐, 다음·완료 UI.
- 오늘의 C/Java/Python/SQL 권장 문제. 현재 언어별 복원문제가 한 개뿐이어서 매일 동일 문제이며, 데이터가 추가되면 날짜별 선택 가능.
- 오늘·최근 7일 언어별 시도/정오/판정 대기/정답률/평균 시간. 시도 단위이고 재풀이도 포함. 시간은 시작~제출 경과시간으로 비활성 시간도 포함.
- LocalStorage 기기 내 기록과 삭제 확인 UI. 개인정보 식별자·서버 전송 없음. 저장 차단 시 메모리 fallback과 제한 안내.
- 메인 학습·역량 서비스 카드 및 통합검색, 기사·산업기사 상세 CTA와 문제은행의 반대 방향 링크.

## 실제 등록 데이터

| 구분 | 수 |
| --- | ---: |
| 고유 비공식 복원기출 | 4 |
| 확인한 전체 출제 이력 | 4 |
| 기사 출제 이력 | 4 |
| 산업기사 출제 이력 | 0 |
| 복원 C | 1 |
| 복원 Java | 1 |
| 복원 Python | 1 |
| 복원 SQL | 1 |
| 재출제 확인 고유 문제 | 0 |
| 신뢰도 A / B / C | 0 / 4 / 0 |
| 기출 기반 변형 | 4 |
| 추가 연습문제 | 4 |
| 전체 고유 학습문제 | 12 |

두 출처를 같은 출제 이력으로 합쳤으며 출처 개수를 문항 개수로 세지 않습니다. 별도 회차 재출제는 검증하지 못했으므로 표시하지 않습니다. 재출제 집계 로직은 실제 데이터와 분리한 합성 테스트 fixture로 검증했습니다. 258/98/73/31/56 같은 목표 수를 사이트 통계로 하드코딩하지 않습니다.

## 확보·미확보 범위와 출처

확인: 기사 2020년 1회의 배열·정렬 일부, 기사 2022년 1회의 Python 기본 인자와 SQL 정렬 빈칸 일부.

미확보: 기사 2020~2026년 2회 전 회차의 나머지 C/Java/Python/SQL, 산업기사 2022~2026년 2회 전 회차. 특히 요청된 산업기사 80문항과 최신 2025/2026 회차는 등록하지 않았습니다. ‘없음’은 미검증·미등록이며 실제 출제되지 않았다는 뜻이 아닙니다.

주요 공개 복원자료:

- [밍지: 2020년 1·2회 코드 해설](https://techtrail.tistory.com/entry/정보처리기사-실기-2020년-1회-2회-기출-코드-해설-C언어-Java-Python)
- [Devinus: 2020년 프로그래밍 분석](https://devinus.tistory.com/36)
- [개발슝이: 2020년 1회](https://smkim9202.tistory.com/252)
- [코딩하는 핑가: 2022년 1회 복원](https://ss-o.tistory.com/165)
- [개발하는 엉배: Python 복원](https://sancheck-developer.tistory.com/151)
- [unit-15: 2022년 1회](https://unit-15.tistory.com/219)

초기 배열 순서·함수 구성·출력 공백·샘플 데이터 차이를 확인하고 검토 메모에 기록했습니다. 문법 오류를 수정하고 공통 핵심을 정리했으며 원 시험지와 정확히 일치한다고 주장하지 않습니다. 자료의 독립성까지 입증하지 못해 A는 부여하지 않았습니다. 변형·연습은 자체 작성이며 실제 회차 이력을 붙이지 않았습니다. 대량 자료 추가 전 출처별 원문 재사용 범위를 별도로 확인해야 합니다.

개념 확인: [Oracle 배열 문서](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/arrays.html), [Python 기본 인자](https://docs.python.org/3/tutorial/controlflow.html#default-argument-values), [PostgreSQL 정렬](https://www.postgresql.org/docs/current/queries-order.html). Python 3예시 3개를 실제 실행하고, 표를 사용하는 SQL 예시 2개를 SQLite 메모리 DB에서 실행했습니다. C·Java는 수동 단계 추적 검수이며 설치된 C compiler/JDK compiler가 없어 이번 검수에서 컴파일 실행을 완료했다고 주장하지 않습니다.

## 자동 테스트

기존 certifications-guide, docs-hub, interview-bank, job-guide, portal-redesign와 신규 practical-bank, practical-sql, practical-python 총 8종 통과.

- 7개 직무 / 12개 자격증 / 150개 면접 / 40개 문서의 기존 ID 유지.
- 기존 서비스 URL 및 CNAME 유지, 카테고리 4개 유지, 신규 서비스 하나 추가(13개).
- JSON ID·이력 참조·빈 답/풀이·종류·난이도·신뢰도·정직한 집계 검증.
- 59.999초 잠금, 60초 제출, 미제출 공개 금지, SQL 직접 판정, 저장 idempotency/차단 fallback.
- 출제 이력과 고유 문제 분리, 합성 fixture 재출제 집계, 날짜별 선택·중복 없는 shuffle.
- HTML 모든 내부 파일의 noindex, nofollow와 로컬 href/src 존재 검사.
- 기존 면접 500회 랜덤 선택 회귀 검사를 유지.

## 브라우저 직접 검수

수정 소스를 로컬 HTTP 정적 서버에서 브라우저로 검수했습니다. Console error/warn 및 로딩 resource 오류 없음.

| 해상도 | 목록·C 코드 상세 |
| --- | --- |
| 360×800 | 페이지 가로 넘침 없음, 코드 영역만 내부 스크롤 |
| 390×844 | 정상, SQL 표·코드·입력·버튼·모바일 메뉴 확인 |
| 412×915 | 페이지 가로 넘침 없음 |
| 768×1024 | 정상, 코드 전체 폭 내 표시 |
| 1024×768 | 정상 |
| 1440×900 | 정상 |
| 1920×1080 | 정상, 최대 콘텐츠 폭 유지 |

- 초기 01:00: 제출 disabled / 공개 disabled / 답·해설 DOM 비어 있음.
- 틀린 답 초안 입력 후 즉시 새로고침: 초안·대기 시작시각 유지, 공개 잠금 유지.
- 실제 시간 경과 후 제출 가능, 제출 후에도 공개 클릭 전 답·해설 DOM 비어 있음.
- 공개 후 오답 저장, 단계별 설명 확인, 오답노트 진입과 새 60초 재풀이 시 이전 답·정답 비공개.
- SQL 샘플 테이블 4행 표시, 동등한 SQL을 미판정으로 처리, 직접 정답 판정 후 기록 변경.
- 전체 종류 12 / SQL 3 / 2022 1회 ORDER BY 검색 1개 실측.
- 랜덤 기본 복원기출만: 전체 5개 요청 시 실제 4개 큐. Python만 선택 시 1/1 → 답 제출 → 공개 → 연습 완료 흐름 확인.
- 오늘의 문제 4개, 학습현황 오늘·언어별 통계 확인.
- 모바일 메뉴 열기·Escape 닫기, 존재하지 않는 문제 ID의 안내와 목록 복귀.
- 메인 신규 카드 및 ‘실기 SQL’ 통합검색, 기사 CTA 클릭 후 기사 필터 적용, 산업기사 CTA URL 확인.

## 운영·제한

GitHub Pages 배포 상태는 해당 변경 커밋의 Actions에서 확인하고 최종 응답에 보고합니다. 운영 도메인의 브라우저 직접 접속은 현재 저장된 사용자 브라우저 제한 때문에 수행하지 않았고 우회하지 않았습니다. 로컬 검수와 Pages 성공을 운영 화면 직접 확인으로 과장하지 않습니다.

60초는 학습 습관 장치이지 보안 시스템이 아닙니다. 정적 JSON의 정답을 파일·개발자 도구로 읽는 행위를 차단하지 않으며, 기기 시계·저장소 조작까지 막지 않습니다. 저장 이력은 개인정보 식별자 없이 기기 내에만 있고, 다른 기기와 동기화되지 않습니다. 공유 기기·저장소 삭제·브라우저 차단의 한계를 안내했습니다.

남은 핵심 작업은 전체 회차 출처 확보·재사용 범위 확인·정답 실행 검수와 실제 258문항에 대한 대조입니다. 출처/원본 데이터 없이 동일한 템플릿 변형으로 숫자를 채우지 않습니다.
