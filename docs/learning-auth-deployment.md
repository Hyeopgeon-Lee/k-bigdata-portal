# 학과 포털 로그인·학습이력 기능 — 배포 안내

2026-11-11 작업 브랜치: feat/learning-auth-20261111
**2026-11-11: Supabase 서울 리전 신규 프로젝트 생성, DB·RLS 마이그레이션 적용, Edge Functions 배포, 공개 클라이언트 키 연결까지 완료했습니다. 운영 GitHub Pages(main)는 아직 변경하지 않았습니다.**

## 주요 추가 파일
- login.html, my-learning.html, students-admin.html
- js/learning-config.js, learning-auth.js, learning-login.js, learning-sync.js, learning-shell.js, learning-dashboard.js, learning-admin.js, learning-import.js
- supabase/migrations/20261111_learning_auth.sql
- supabase/functions/learning-admin/index.ts
- supabase/functions/weekly-learning-report/index.ts
- tests/learning-auth-design.test.mjs

## 인프라 준비
1. 전용 Supabase 프로젝트 **k-bigdata-portal / zjsindkakjfzmjgrkaou / ap-northeast-2** 생성 완료. 기존 교수회 프로젝트는 미변경.
2. DB 마이그레이션 `learning_auth_initial` 및 `learning_auth_indexes` 적용 완료. 10개 테이블 RLS 활성화 및 주요 역할 권한 검증 완료. Security Advisor의 공개 authenticated SECURITY DEFINER RPC 경고는 신원 확인/세션 확인 후 본인에 한정해 작동하도록 설계된 함수로 확인해야 합니다.
3. js/learning-config.js에 URL 및 공개 publishable key 연결 완료. service-role 또는 secret 키는 저장소에 넣지 않았습니다.
4. **필수 미완료:** Supabase Authentication > Email Templates > Magic Link에서 `supabase/templates/magic_link_otp.html` 내용을 적용하세요. 반드시 `{{ .Token }}`을 포함해야 6자리 OTP가 메일로 발송됩니다. Authentication > SMTP Settings에서 커스텀 SMTP 계정을 연결해 학과 학생 이메일로 발송되도록 설정해야 합니다. 기본 SMTP는 조직 팀 메일 외 수신처 제한이 있어 실제 학생 가입에 사용할 수 없습니다.
5. **미완료:** Authentication > URL Configuration에서 Site URL을 `https://portal.k-bigdata.kr`로 설정하고 Redirect URLs에 동일 출처를 등록하세요.
6. `learning-admin` Edge Function v2 배포 완료 (JWT 검증 활성화).
7. `weekly-learning-report` Edge Function v2 배포 완료 (JWT 검증 비활성화). **실제 발송은 미활성**: `LEARNING_REPORT_CRON_SECRET` 헤더 보호 및 Resend 자격증명 검증 후 사용해야 합니다.
8. **미완료:** Resend 등 메일 서비스에서 도메인 검증 후 `RESEND_API_KEY`, `REPORT_FROM_EMAIL`을 Supabase Edge Function Secrets에 등록하세요.
9. **미완료:** 주간 보고서는 월요일 08:00 KST = 전날 23:00 UTC에 Cron으로 트리거해야 합니다. cron 비밀번호는 Supabase Vault 등에 안전하게 보관하세요. 리포트는 슈퍼 관리자 `hglee67@kopo.ac.kr` 한 사람에게만 집계본이 발송되도록 코드가 제한합니다.

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
- 완료: 신규 Supabase 프로젝트 생성, SQL/인덱스 적용, RLS 10개 테이블 검증, 2개 Edge Functions 배포, 공개 URL·키 GitHub 코드 연결
- 미완료: OTP 이메일 템플릿 적용, 실제 학생 대상 SMTP 연결
- 미완료: 주간 리포트 메일 공급자/비밀키 및 Cron 설정
- 미완료: 로그인된 슈퍼 관리자와 학생으로 실제 회원가입·RLS·90일 만료·학적 관리 테스트
- 미완료: GitHub PR #32 브라우저 전체 검수 완료 및 main 병합

### 유의사항
GitHub Pages의 정적 문제/정답 파일은 로그인만으로 완전히 비공개가 되지 않습니다. 서버의 학생 학습기록과 계정정보만 인증과 RLS로 보호하도록 설계했습니다.
