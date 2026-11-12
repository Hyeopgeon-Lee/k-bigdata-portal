# 자격증 공식 일정 자동 동기화

기존 학과 달력 `schedule.html`에 국가기술자격(정보처리기사/산업기사) 및 SQL 개발자(SQLD) 시험 일정을 통합 표시한다.

## 자동 실행

- GitHub Actions: `.github/workflows/certification-schedule-sync.yml`
- 한국시간 매일 07:00 / 08:00에 실행
- Supabase Edge Function: `certification-schedule-sync`
- 외부 데이터: Q-Net 공식 API (종목코드 1320 / 2290), 데이터자격검정 공식 시험일정 웹 페이지
- 공개된 확정 날짜만 등록, 날짜 변경 시 기존 행 갱신, 동일 자격·연도·회차·일정유형 중복 방지
- 수동 등록·관리자 수정 항목은 자동 덮어쓰기 금지
- 기존 Google Calendar 일정과 **화면에서만 병합**, Google Calendar 자체를 수정하지 않음
- 수집 오류 시 기존 일정을 삭제하지 않고 관리자 전용 `certification_schedule_sync_runs`에 기록

## SQLD

공식 페이지: https://www.dataq.or.kr/www/accept/schedule.do

인증키 없이 HTML의 공식 연간 일정표에 있는 SQL 개발자 회차만 읽는다. 원서접수·시험일·합격자 발표일을 각각 등록한다.
2026년 제60~63회 총 12건을 2026-11-13 기준 최초 동기화했다.
연도가 바뀌어 확정 공고가 갱신되면 그 연도에 해당하는 일정만 추가 등록한다.

## 정보처리기사·정보처리산업기사 인증키 설정

공식 API: https://www.data.go.kr/data/15074408/openapi.do

1. 공공데이터포털에서 '한국산업인력공단_국가자격 시험일정 조회 서비스' 활용신청·승인 후 본인 인증키를 확보한다.
2. Supabase 프로젝트 `k-bigdata-portal`의 **Edge Functions → Secrets**에서 `DATA_GO_KR_SERVICE_KEY` 값을 보안 비밀변수로 추가한다.
3. API 키를 GitHub 코드, 커밋, 프런트엔드 JS, 메일, 공개 문서에 쓰지 않는다.
4. 다음 자동 실행부터 올해·다음 해의 정보처리기사(1320) 및 정보처리산업기사(2290) 6개 단계별 일정을 조회한다.
5. GitHub Actions의 **Sync official Q-Net and SQLD certification dates**에서 수동 실행 후 `sources`의 `missing_key`가 `success` 또는 `not_published`로 바뀌었는지 확인한다. 수동 실행 시 입력값 `publish=true`여야 실제 반영된다.

## 접수일 알림

별도 Edge Function `certification-registration-reminder`가 매일 한국시간 09:00 및 11:00에 대상자를 재검증한 후 메일을 보낸다.

- 정보처리기사/산업기사 필기: 필기 합격·최종 취득자 제외
- 실기: 해당 종목 필기 합격자만 발송, 최종 취득자는 제외
- SQLD: 최종 취득자 제외
- 승인된 재학생만 발송, 졸업·휴학·조기취업·자퇴생 제외
- 접수 항목 하나당 학생별 1회, 발송 기록은 `certification_reminder_deliveries`
- SQLD 원서접수는 공식 홈페이지 공지 기준 첫날 오전 10시 시작이므로, 09시 안내 메일은 사전 안내로 표기한다.

## 테스트

```sh
node --test tests/certification-schedule-sync.test.mjs
node --test tests/certification-registration-reminder.test.mjs tests/certification-calendar-integration.test.mjs
```

Supabase 배포 환경과 학생 실데이터를 이용한 발송 테스트는 별도로 검증해야 한다.
