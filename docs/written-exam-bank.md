# 정보처리 필기 문제은행 운영 가이드

## 현재 구성

- 산업기사 필기 화면: `industrial-written.html`
- 공통 필기 문제풀이 엔진: `js/written-exam-ui.mjs`
- 산업기사 설정: `js/industrial-written-ui.js`
- 검증된 산업기사 기출 JSON: `data/industrial-written/questions.json`
- 필기 전용 객관식 스타일: `css/written-exam.css`
- 기존 실기 UI 재사용: `js/question-browser.js`, `js/quiz-unified.js`, `css/practical.css`, `css/question-browser.css`, `css/quiz-unified.css`

기존 `practical.html` 및 `js/practical-ui.js`와 실기 기출 데이터는 수정하지 않습니다.

## 문항 입력 필드

문항은 JSON 배열에 저장하며, 각 객체에는 다음 필드가 필요합니다.

| 필드 | 형식 | 의미 |
|---|---|---|
| id | 문자열 | 문항별 고유 ID (영문/숫자/밑줄/하이픈) |
| examType | 문자열 | `industrial` 또는 향후 `engineer` |
| year, round, number | 정수 | 출제 연도, 회차, 문항 번호 |
| question | 문자열 | 검증된 문제 본문 |
| options | 문자열 4개 배열 | ①~④ 보기 |
| answer | 정수 (1~4) | 정답 보기 번호 |
| subject | 문자열 | 과목명 |
| explanation | 문자열 | 정답 해설 (가능한 경우) |
| sourceType | 문자열 | `official` / `reconstructed` |
| sourceUrl | HTTPS URL | 공식 또는 확인된 원문/복원자료 출처 |
| sourceVerified | boolean | 해당 회차·문항의 출처 검증 완료 |
| answerVerified | boolean | 정답 검증 완료 |
| republicationAllowed | boolean | 포털 내 재게시 허용 근거 확인 완료 |

위 세 검증 플래그가 모두 true가 아니면 문제은행에 노출되지 않습니다. 공개 열람할 수 있는 문제라고 해서 재배포가 허용된 것은 아닙니다.

## 운영 절차

1. 연도·회차별 공개 자료를 수집하고 공식/복원 자료를 분류합니다.
2. 문항 수와 원문, 정답을 출처별로 대조합니다.
3. 재게시 허용 범위가 명확한 자료만 등록합니다.
4. `node --test tests/industrial-written-ui.test.mjs`로 검증합니다.
5. `node scripts/build-portal-shell.mjs`로 공통 메뉴를 재생성하고 전체 회귀 테스트 후 배포합니다.

원문 미확인 문항을 유사문제로 대체하거나 실기 문제와 결합하지 않습니다.

## 학습기록과 미래 확장

현재 필기 정답·오답 기록은 **해당 브라우저에 별도로 저장**됩니다. 실기 기록 및 Supabase 서버 통계와 혼합되지 않습니다. 필기 데이터베이스·교수자 통계 연동은 별도 인증·RLS 및 `learning-activity.mjs` 은행 유형 추가가 필요합니다.

추후 정보처리기사 필기는 산업기사 화면을 새 HTML로 복사하고 `mountWrittenExam({examType:"engineer",label:"정보처리기사",dataUrl:"data/engineer-written/questions.json",storageKey:"kbigdata-engineer-written-v1"})`을 사용해 **동일한 UI 엔진**을 연결합니다. 두 자격증의 기출과 기록은 분리합니다.

## 현재 콘텐츠 상태

본 작업은 UI 통합 작업입니다. `data/industrial-written/questions.json`은 빈 배열로 시작합니다. 문제 0건인 상태를 완성된 기출문제 수집으로 표시하지 않습니다.
