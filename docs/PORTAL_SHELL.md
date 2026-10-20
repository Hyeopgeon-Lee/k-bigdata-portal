# 공통 상단 UI 운영 규칙

모든 HTML의 헤더·영역 메뉴·학습 보조바는 `scripts/portal-shell-template.mjs` 한 곳에서 작성합니다. HTML 안의 `portal:*:start/end` 구역은 정적 생성물이며 직접 수정하지 않습니다. GitHub Pages는 생성물을 그대로 제공하므로 메뉴 표시에 추가 요청이나 콘텐츠 모듈 로딩을 기다리지 않습니다.

## 단일 관리 지점

- `js/services.js`: 기존 서비스 이름·경로·그룹과 메뉴 표시 순서. 문제·일정·채용 데이터는 변경하지 않습니다.
- `js/portal-navigation-model.mjs`: 페이지 제목·그룹·선택적 학습현황 기능, 공통 자산 버전.
- `scripts/portal-shell-template.mjs`: 글로벌 헤더, 현재 영역 서비스 메뉴, 다른 서비스 보기, 학습 도구바.
- `css/portal-navigation.css`: 공통 토큰과 헤더·서비스 메뉴·모바일 메뉴·도구바의 유일한 스타일 소유자.
- `js/portal-navigation.js`: 콘텐츠와 독립적인 경량 초기화. Escape·외부 클릭·반응형 전환·현재 그룹·중복 실행 방지.
- `js/portal-shell.js`: 기존 footer·검색·최근 사용·본문 보강을 유지하고 중복 초기화를 방지합니다.

## 새 페이지 / 메뉴 수정

1. 루트에 HTML을 만들고 기존 포털 기본 CSS와 콘텐츠를 연결합니다. 헤더 자리에는 `<header class="site-header"></header>`를 둡니다. 메뉴 HTML을 복사하지 않습니다.
2. 모든 새 페이지는 `portalPages`에 제목·그룹을 한 줄로 등록합니다. 선택적 도구바가 필요할 때만 종류를 추가합니다. 서비스로 노출할 페이지는 `services.js`의 서비스·메뉴 목록에도 등록합니다. 등록 누락은 생성기·CI가 바로 알려 줍니다.
3. `node scripts/build-portal-shell.mjs`를 실행합니다. 새 HTML도 자동 검색됩니다. 내부 서비스 메뉴가 없으면 생성기가 main 첫 부분에 추가합니다.
4. 공통 자산을 변경하면 `shellVersion`을 갱신하고 다시 생성합니다.
5. `node scripts/build-portal-shell.mjs --check`와 `node tests/portal-shell.test.mjs`를 실행합니다. CI는 생성물이 오래되었거나 페이지가 누락되면 실패합니다.

정적 생성물이 모든 HTML에 포함되는 것은 JavaScript 실패 시 링크를 유지하고 첫 화면 흔들림을 없애기 위한 배포 방식입니다. 원본 구현과 메뉴 데이터는 한 곳에만 존재합니다.

## 반응형 / 접근성

- 최대 너비 1240px, 데스크톱 여백 20px, 767px 이하 여백 12px.
- 헤더 76px, 900px 이하 60px. 1240px 이하에서 동일한 `메뉴 ☰`로 전환합니다.
- 모든 메뉴 버튼의 최소 터치 높이 44px. 작은 화면은 동일한 짧은 학과명과 3열 서비스 메뉴를 사용합니다.
- 현재 서비스는 생성 시 파일 경로로 선택하므로 `?id=...`와 독립적입니다. 홈의 그룹 해시 이동도 보강 스크립트가 갱신합니다.
- 글로벌 메뉴와 다른 서비스 보기는 native details/summary입니다. JavaScript 비활성 상태에서도 링크에 접근할 수 있습니다. 작은 화면에서 보강 스크립트가 메뉴를 처음 접습니다.
- 메뉴 패널은 본문 위에 배치되므로 접기·열기로 본문 위치가 바뀌지 않습니다. 메뉴는 스크롤 가능한 최대 높이를 사용합니다.
- Escape는 열린 메뉴를 닫고 summary에 포커스를 돌려줍니다. 모달이 아니므로 포커스를 가두지 않습니다.
- 기초학습·실기에도 다른 내부 페이지와 같이 보조 상단바를 표시하지 않습니다. 학습현황과 문제풀이 기능은 본문에서 유지하며 진행바·포커스 위치는 실제 헤더 높이를 사용합니다.

## 검증 / 배포

`tests/portal-shell-browser.mjs`는 11개 페이지 × 9개 화면 크기에서 계산된 스타일·좌표·메뉴 순서·현재 메뉴·키보드·뒤로 가기·새로고침·저장 상태·JS 비활성 대체 경로를 검사합니다. `ui-screenshots/portal-shell`에 JSON과 PC·모바일 화면을 저장합니다. 일정·Analytics 요청은 테스트 중 모의 처리하며 운영 데이터에 쓰지 않습니다.

`Shared portal shell QA`는 Chromium·Firefox·WebKit을 각각 검증합니다. QA 성공과 Pages 배포 성공은 별도로 확인합니다. 배포 후 실제 페이지의 `data-portal-shell` 버전과 공통 자산 버전을 확인합니다.
