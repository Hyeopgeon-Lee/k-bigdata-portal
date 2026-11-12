# 졸업생 네트워크 통합 운영 가이드

## 포털 경로
- 통합 진입: https://portal.k-bigdata.kr/alumni/index.html
- 동문 검색·상세: index.html, detail.html
- 연락 요청: contact.html
- 정보 등록·수정 및 PIN 찾기: alumni.html
- 채용정보: jobs.html, job-detail.html, job-submit.html
- 동문소식: news.html, news-detail.html, news-submit.html
- 관리: admin.html

## 변경 사항
포털 서비스 목록의 `alumni` 주소를 외부 사이트가 아닌 `alumni/index.html`로 변경했습니다.
기존 사이트 `https://alumni.k-bigdata.kr`는 그대로 유지합니다.
11개 HTML 페이지, 18개 원본 JS 및 5개 스타일, SVG 아이콘을
동일한 상대경로로 복제하고 포털 공통 복귀 메뉴 및 인증 확인을 추가했습니다.
동문 서비스 전체가 기존 Apps Script Web App 및 운영 Google Sheets를 그대로 사용하므로
게시물, PIN, 연락 요청, 채용공고 및 동문소식 승인·알림·발송 이력은 새로 복사하거나 지우지 않았습니다.

## 인증 체계
포털 복제 페이지는 포털 Supabase Auth 계정이 있고 서버가 읽기 권한을 승인한 회원만 입장합니다.
상단에 현재 로그인 사용자 이름과 통합 포털 홈·서비스·마이페이지 바로가기를 표시합니다.
이미 이관된 졸업생 계정은 Alumni Source ID를 원본 수정·공고·소식 등록 화면에
자동 입력합니다. 그러나 **원본 편집 PIN을 자동 조회하거나 해제하지 않습니다.**
등록·수정·관리자 승인·연락 요청 이메일 발송은 **기존 Google Apps Script 서버가
원래의 PIN/관리자 세션/승인 정책을 검증**합니다.

따라서 이 배포는 **화면·메뉴·포털 세션 연동**이며, Google Sheets 전체 데이터를
Supabase로 재이관하거나 동문 PIN·관리자 암호 로그인을 Supabase 단일 인증으로 대체하지는 않습니다.
기존 관리자 Google OAuth Client에는 `portal.k-bigdata.kr` 승인 원본이 없을 수 있으므로,
관리자 암호 로그인은 유지하고 Google 관리자 인증은 기존
https://alumni.k-bigdata.kr/admin.html 에서 사용할 수 있도록 우회 링크를 제공했습니다.
추후 진정한 단일 로그인(쓰기 권한 포함)을 원하면 Apps Script 서버에 포털 JWT 검증을
도입하거나 동문 데이터·메일 기능을 모두 Supabase로 안전하게 이전해야 합니다.

## 배포 체크
- `node tests/alumni-portal.test.mjs` 통과: 파일 경로, HTML, 브리지, 기본 API, JavaScript 문법
- 포털 서비스를 사용해 `alumni/index.html` 접속 후 검색·상세 화면 확인
- 동문 ID/PIN 수정·등록, 연락 요청, 채용공고·동문소식 승인과 메일은
  계정 권한이 필요하므로 관리자가 실제 계정으로 직접 검증 필요
- 원본 동문사이트와 포털 복제 화면이 동시에 같은 Google Sheets 데이터에 연결됨
- 외부 매뉴얼 PDF는 기존 공개 원본 사이트 주소를 사용합니다.
