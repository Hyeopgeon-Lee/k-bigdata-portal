# 학과 포털 로그인·학습이력 기능 — 배포 안내

2026-11-11 작업 브랜치: feat/learning-auth-20261111
**현재 운영 사이트는 변경하지 않았으며 신규 Supabase 프로젝트는 생성되지 않았습니다.**

## 주요 추가 파일
- login.html, my-learning.html, students-admin.html
- js/learning-config.js, learning-auth.js, learning-login.js, learning-sync.js, learning-shell.js, learning-dashboard.js, learning-admin.js, learning-import.js
- supabase/migrations/20261111_learning_auth.sql
- supabase/functions/learning-admin/index.ts
- supabase/functions/weekly-learning-report/index.ts
- tests/learning-auth-design.test.mjs

## 인프라 준비
1. 기존 kopo-professor-union 프로젝트에는 적용하지 않습니다. 학과 포털 전용 Supabase 프로젝트를 승인된 조직에 별도로 생성합니다.
2. SQL 마이그레이션을 검토·적용하고 Supabase Security Advisor를 점검합니다.
3. js/learning-config.js에 신규 Supabase 프로젝트 URL 및 publishable key만 설정합니다. service-role 또는 secret 키는 저장소에 절대 넣지 않습니다.
4. Auth 이메일 OTP 템플릿에는 {{ .Token }}을 적용하고 인증번호 발송을 위한 커스텀 SMTP를 설정합니다.
5. 인증 도메인은 https://portal.k-bigdata.kr 로 설정합니다.
6. learning-admin Edge Function은 JWT 검증을 활성화해 배포합니다.
7. weekly-learning-report Edge Function은 JWT 검증을 비활성화하되, LEARNING_REPORT_CRON_SECRET 요청 헤더 확인으로 보호합니다.
8. 주간 메일 발송에는 RESEND_API_KEY, REPORT_FROM_EMAIL을 비밀 설정으로 등록하고 발신 도메인을 검증합니다.
9. 주간 보고서는 월요일 08:00 KST = 전날 23:00 UTC에 Cron으로 트리거합니다. cron 비밀번호는 Supabase Vault 등에 안전하게 보관합니다.

## 회원 정책
- 이메일 인증번호로 로그인하며 이름과 학번을 제출한 학생은 관리자 승인 후 이용 가능합니다.
- hglee67@kopo.ac.kr 소유자가 OTP 인증 후 이름을 등록하면 DB의 서버 측 로직이 슈퍼 관리자 역할을 부여합니다. 학번은 필요 없습니다.
- 90일 로그인 유지의 서버 측 한계는 private.portal_sessions 테이블에서 강제합니다. 재인증 때만 새 세션을 발급합니다.
- 휴학은 학습기록 읽기만 허용하고 자퇴·졸업·가입 거절·정지는 학습 API를 차단합니다.
- 학생별 개인 학습기록은 본인만 열람합니다. 교수용은 승인된 슈퍼 관리자의 서버 집계 API만 사용할 수 있습니다.
- 교수용 주간 통계는 hglee67@kopo.ac.kr 한 주소로만 발송합니다. 학생 개인 메일은 개별 수신 동의를 받아야 합니다.

## 과목별 처리
- 기초 350제: 완료 표시와 자가 평가를 구분하여 저장하고 작성 중인 코드는 서버에 초안으로 저장합니다.
- NCP: 선택 답안을 자동 판정하며 재풀이해도 기존 정오답 이벤트를 삭제하지 않습니다.
- 정보처리: 기존 30/60초 채점 규칙을 변경하지 않으며 시간 만료 건은 정답률에서 제외합니다.
- 기존 브라우저 기록은 학습현황 화면의 명시적 가져오기로만 서버에 병합합니다. 공용 PC에서 타인 기록을 자동 병합하지 않습니다.

## 자동화 테스트 및 검수
- node --test tests/learning-auth-design.test.mjs
- node --test tests/*.test.mjs
- node scripts/build-portal-shell.mjs --check
- 실제 Supabase 프로젝트에서 학생 A/B 접근 격리, 로그인 후 학적변경 시 즉시 차단, 만료 세션, PC↔모바일 동기화, 이메일 수신 동의 및 주간 중복 발송을 테스트합니다.

## 배포 전까지 남은 일
- Supabase 프로젝트 조직 선택 및 비용 조건 확인
- 프로젝트 생성, SQL 실행, 보안 점검
- OTP 메일 SMTP 및 주간 리포트 메일 API 연동
- Edge Function 배포와 Cron 설정
- 실제 학생/슈퍼 관리자 이메일로 통합 테스트
- 검증 후 GitHub Pull Request 병합

### 유의사항
GitHub Pages의 정적 문제/정답 파일은 로그인만으로 완전히 비공개가 되지 않습니다. 서버의 학생 학습기록과 계정정보만 인증과 RLS로 보호하도록 설계했습니다.
