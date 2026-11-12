# 졸업생 네트워크 — 포털 Supabase 전환 운영 가이드

## 운영 주소
- 통합 사용자 서비스: https://portal.k-bigdata.kr/alumni/index.html
- 포털 통합 관리자: https://portal.k-bigdata.kr/alumni/admin.html
- 포털 로그인 및 비밀번호 재설정: https://portal.k-bigdata.kr/
- 기존 독립 서비스: https://alumni.k-bigdata.kr/ — 원본 데이터 및 구형 서비스로 유지, 아직 중단·리디렉션하지 않음

## 2026-11-13 졸업생 정보 등록·수정 — 로그인 일원화

- 포털에 재학생으로 가입한 회원은 학적 상태가 `졸업(graduated)`이 된 후에만 졸업생 정보를 등록합니다. 재학·휴학 중에는 등록 버튼 대신 마이페이지 학적 상태 안내를 표시합니다.
- 기존 동문 회원은 포털 로그인 직후 본인 동문 정보를 자동 조회하며, 별도 동문 ID 입력·수정 PIN·PIN 찾기 없이 수정할 수 있습니다.
- 포털 Supabase Auth에서 검증한 계정의 이름·이메일로 서버가 본인 정보를 확인하고 `profiles.alumni_source_id`를 연결합니다. 이미 연결된 동문은 다른 사람의 ID를 전달해도 수정할 수 없습니다.
- 최초 등록 및 기존 정보 수정은 `PENDING`으로 저장되어 관리자 승인 후 공개됩니다. 기존 재학생의 포털 계정 및 학습기록은 변경하지 않습니다.
- 채용공고·동문소식 등록 화면에서도 PIN 입력은 제거됐으며 기존 동문 소유권 검증을 계속 적용합니다.
- 사용하지 않는 PIN 및 PIN 재설정 인증 해시는 Supabase 활성 데이터에서 제거합니다. 기존 독립 도메인용 Google Sheets 백업과 운영 정책은 별도로 보존됩니다.

## 기능 및 페이지
- `index.html`: 졸업생 검색, 취업 현황, 최신 채용·동문소식
- `detail.html`: 졸업생 공개 프로필·연결 게시물
- `contact.html`: 동문에게 비공개 연락 요청 및 서버 메일 전달
- `alumni.html`: 동문 정보 등록·본인 수정·수신동의
- `jobs.html`, `job-detail.html`, `job-submit.html`: 채용정보 검색·열람·게시 신청
- `news.html`, `news-detail.html`, `news-submit.html`: 동문 소식 열람·게시 신청, 부고 대상 선택
- `admin.html`: 프로필·채용·소식 승인·반려·숨김·재게시, 관리자 직접 게시, 연락 요청 내역, 메일 발송 기록, 수신동의 안내·채용 Digest 수동 발송

## 백엔드 및 계정
포털 내부 `alumni/` 페이지는 `alumni/js/api.js`에서 Supabase Edge Function
`alumni-network-api`를 호출하며 더 이상 Google Apps Script 엔드포인트에 요청하지 않습니다.
인증은 Supabase Auth 액세스 토큰과 `portal_learning_access()` 서버 권한 검사입니다.
동문 본인 작성은 본인 계정에 연결된 `profiles.alumni_source_id`와 확인된 이메일로 제한합니다.
관리자 작업은 요청마다 `portal_super_admin_allowed()`로 검증합니다.
기존 동문 PIN 및 별도의 Google 관리자 로그인은 포털 쓰기 권한에 사용되지 않습니다.

## 원본 자료 보존
기존 Google Sheets의 alumni, jobs, alumni_news, contact_requests, mail/logs,
수신동의 변경 이력, PIN 복구 기록을 원본 ID와 함께 Supabase
`public.alumni_network_records`로 이관했습니다. 이 테이블은 RLS 적용 및
익명/일반 인증 사용자 직접 접근 권한이 제거되어 있으며 Edge Function에서만 읽고 씁니다.
PIN 해시는 과거 이관 기록에 남아 있을 수 있으나 신규 로그인에 사용하지 않습니다.
메일 발송은 Resend 및 `public.alumni_network_mail_outbox`의 수신자·행위별
중복 발송 방지 상태를 활용합니다. 기존 발송 이력을 새 이메일로 재발송하지 않습니다.
기존 Google Sheets 데이터를 삭제하지 않았습니다.

## 필수 보안 및 최종 전환 점검
1. 비로그인·미승인 계정으로 동문 프로필·관리자 API가 차단되는지 확인.
2. 실제 승인 졸업생 계정으로 내 정보 로딩·수정 및 원본 Alumni ID 유지 여부 확인.
3. 실제 승인 졸업생 계정으로 채용공고·동문소식 등록 후 관리자 승인→공개까지 확인.
4. 교수 관리자 포털 계정으로 관리자 리스트, 승인·반려·숨김, 메일 발송 옵션 확인.
5. 연락 요청이 수신 동의한 졸업생에게만 전달되고, 수신 허용되지 않은 대상은 거부되는지 확인.
6. 중복 발송 방지, 채용 Digest, 뉴스 메일 기록 및 모바일 화면에서 동작 확인.
7. 원본 Google Sheets의 최신 변경분과 Supabase 이관 시점 이후 데이터 차이를 확인하고 정합성 확보.

**주의:** 포털 내부 서비스는 Supabase로 전환했으나 기존 `alumni.k-bigdata.kr`은
아직 Apps Script 기반으로 운영됩니다. 두 사이트에서 동시에 수정하면 자료가 달라질 수 있습니다.
실제 로그인·메일 E2E 검증 및 마지막 증분 동기화를 마치기 전에는 기존 사이트
리디렉션이나 Apps Script 쓰기 중단을 완료했다고 표기하지 마세요.

## 자동 검사
`node tests/alumni-portal.test.mjs`
GitHub Actions의 Alumni Network Portal Integration QA에서 기능 경로·인증·스크립트 문법·내부 링크를 검사합니다.
실제 인증 계정으로 변경·전송하는 브라우저 테스트는 자동 검사 범위 밖입니다.
