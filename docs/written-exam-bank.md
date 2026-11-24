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


## 2026-11-23 원문·재게시 검증 결과

- 한국산업인력공단은 국가기술자격 문제의 무단 복제·배포·전자출판을 금지한다고 공지했습니다. 출처: https://hrdc.hrdkorea.or.kr/hrdc/166829
- Q-net은 CBT 방식 필기문제와 가답안·확정답안을 공개하지 않는다고 안내합니다. 출처: https://www.q-net.or.kr/anc002.do?gId=99&gSite=Q&id=anc00203
- 정보처리산업기사 필기는 2020년 4회부터 CBT였으며 2022년 출제기준이 변경되었습니다. 출처: https://eduon.com/info/support/noticeView/1442/
- 시나공이 게시한 2026년 2회 자료 첫 페이지는 개인 용도로만 사용 가능하며 다른 매체에 무단 복제·전재할 수 없다고 명시합니다. 해당 PDF: https://www.sinagong.co.kr/pds/001002001/past-exams/421/download/450
- `data/industrial-written/sources.json`에는 2020~2026년 **7개 연도, 외부 자료 참조 14건**을 기록했습니다. 외부 자료를 확인했다는 뜻이며 문항의 정확성이나 포털 재게시 가능 여부가 확인됐다는 뜻이 아닙니다.
- 따라서 2020~2026년 **모든 실제 출제 문항을 100% 수집해 포털에 재게시**하는 것은 현재 공개정보 및 권리 범위만으로 달성할 수 없습니다.

### 문항별 독립 증빙

문항 공개 전에 `sourceVerified`, `answerVerified`, `republicationAllowed`가 모두 true여야 합니다. 이제 별도 `evidence` 객체도 필수입니다.

```json
{
  "evidence": {
    "sourceUrl": "https://example.org/source-proof",
    "answerUrl": "https://example.org/answer-proof",
    "rightsUrl": "https://example.org/rightsholder-license",
    "reviewer": "교육 콘텐츠 검토자",
    "reviewedAt": "2026-11-23"
  }
}
```

위 URL은 **형식 예시일 뿐** 실제 사용 허가를 뜻하지 않습니다. `rightsUrl`은 원저작권자나 권한을 위임받은 주체의 재게시 허가 문서여야 합니다. 자동 검사에서 URL 형식이 유효하다는 사실만으로 허가의 진위와 원문 동일성이 증명되는 것은 아닙니다.

2026년 11월 23일 기준, 위 조건을 만족하는 문항은 **0개**입니다. 출처 자료를 임의로 복제하거나 재구성한 문항을 실제 기출로 표시하지 않습니다.

등록 자료의 데이터 정합성과 출처 목록은 `node scripts/audit-industrial-written.mjs`로 점검합니다. 실제 100% 검증을 위해서는 **매 회차 공식 출제 문항 수와 정답 원본, 재게시 허가 문서**의 확보가 별도로 필요합니다.


## 권리·정답 증빙이 완료된 자료의 일괄 등록

```sh
node scripts/import-industrial-written.mjs /path/to/approved-questions.json
node scripts/import-industrial-written.mjs /path/to/approved-questions.json --write
node scripts/audit-industrial-written.mjs
node --test tests/industrial-written-ui.test.mjs
```

첫 번째 명령은 검증 전용이며 파일을 변경하지 않습니다. 두 번째 명령은 모든 문항이 검증을 통과할 때만 `data/industrial-written/questions.json`에 추가합니다. 기존 데이터는 보존하고 문항 ID 및 회차·번호 중복을 거부합니다. **단, 시스템의 형식 검증은 원저작권자 이용 허락과 정답의 실제 진위를 대신하지 않습니다.** 사전에 허가 문서와 답안 근거를 사람이 검토해야 합니다.

## 학습기록과 미래 확장

현재 필기 정답·오답 기록은 **해당 브라우저에 별도로 저장**됩니다. 실기 기록 및 Supabase 서버 통계와 혼합되지 않습니다. 필기 데이터베이스·교수자 통계 연동은 별도 인증·RLS 및 `learning-activity.mjs` 은행 유형 추가가 필요합니다.

추후 정보처리기사 필기는 산업기사 화면을 새 HTML로 복사하고 `mountWrittenExam({examType:"engineer",label:"정보처리기사",dataUrl:"data/engineer-written/questions.json",storageKey:"kbigdata-engineer-written-v1"})`을 사용해 **동일한 UI 엔진**을 연결합니다. 두 자격증의 기출과 기록은 분리합니다.

## 현재 콘텐츠 상태

본 작업은 UI 통합 작업입니다. `data/industrial-written/questions.json`은 빈 배열로 시작합니다. 문제 0건인 상태를 완성된 기출문제 수집으로 표시하지 않습니다.

## 자체 제작 모의문제 삭제 (2026-11-24)

이전에 생성한 자체 제작 모의 120문항은 요청에 따라 GitHub 저장소와 Supabase `public.written_question_bank`에서 삭제했습니다. 실제 기출문제 원문 DB는 0문항이며, 연도별 출처 목록과 기존 실기 기능은 유지합니다.


## 2020~2022년 출처 링크 DB 등록 (2026-11-24)

- Supabase `public.written_exam_source_references` 테이블에 2020년 3건, 2021년 2건, 2022년 2건, **총 7개 외부 기출자료 참조 링크**를 등록했습니다.
- 문항·보기·정답 원문을 저장한 `public.written_question_bank`는 **0문항**입니다. 링크 기록은 시험 원문 재게시 허가나 문항의 독립 검증을 뜻하지 않습니다.
- 전용 출처 테이블은 RLS가 켜져 있으며 방문자는 조회만 가능합니다. 원문 등록을 위해서는 해당 자료의 재게시 권한 확인이 필요합니다.
- 실제 기출자료 저작권 안내: https://hrdc.hrdkorea.or.kr/hrdc/166813



## 2020년 6월 6일 정보처리산업기사 필기 1·2회 통합 원문 등록 (2026-11-24)

사용자 업로드 자료 `정보처리산업기사20200606(교사용).hwpx`를 기준으로 한 번에 100문항을 추출하고, 원문 내 선택지의 정답 강조 표시와 마지막의 정답표를 전 문항(100/100) 대조했습니다.

- 시험 유형: **정보처리산업기사 필기**, 2020년 1·2회 통합, 2020-06-06
- 총문항: 100개(데이터 베이스·전자 계산기 구조·시스템분석설계·운영체제·정보통신개론 각각 20개)
- 원문에서 추출된 GIF 그림·도표: **17개**, 각 문항 `visuals[].dataUri`에 원래 바이너리 값을 base64로 보존
- 문항 파일: `data/industrial-written/questions.json`
- DB: Supabase `public.written_question_bank`의 `source_type='provided'` 레코드 100건
- 전 문항 `sourceVerified=true`, `answerVerified=true`는 **업로드한 파일 내부의 문항·정답표 대조**를 의미하며, 출제기관 원본이나 기출 저작권자의 전재 허가를 의미하지 않습니다.
- `republicationAllowed=false`는 문서 확인만으로 재게시 허가를 확인할 수 없다는 뜻입니다. 추가 권리 확인이 필요합니다.
- 문제에 원본 해설은 없으므로 별도 해설을 자동 생성하지 않았습니다. 학생 풀이 기록은 기존 저장소와 분리됩니다.

실제 기출문제 원문에 해당하는 자료를 추가하면서, `sourceType='provided'`를 새로 지원하고 사용자 제공 출처와 정답표 검증 내용을 문제 화면에 표시합니다. 기존 `practical.html`과 실기 문제풀이 코드는 수정하지 않았습니다.



## 2020년 3회 및 2026년 2회 사용자 제공 자료 (2026-11-24)

- `정보처리산업기사20200606(교사용).hwpx`: 2020-06-06 1·2회 통합, 5과목 × 20문항, 100문항; 기존 `questions.json` 유지
- `정보처리산업기사20200822(교사용).hwpx`: 2020-08-22 3회, 5과목 × 20문항, 100문항; `questions-20200822.json` 추가. 문항별 정답 표시와 원본 정답표 100/100 일치, 그림 19개 (8번 문제의 그림 보기 4개 포함)
- `2026년2회_정보처리산업기사 필기 기출문제1.docx`: 연도 2026, 회차 2회, **정확한 시험일 미기재**. 60문항 스캔 자료(문제지 4쪽, 정답표 1쪽)를 `scans-2026-2.json`에 원본 이미지로 보존. 일부 스캔 글자 배치와 겹침이 있어 60문항을 개별 텍스트 문제은행으로 등록하지 않음
- 포털 Supabase `public.written_exam_sessions`에 세 시험의 시험일·회차·과목별 문항 수·등록 상태 저장
- 학생 문제풀이가 가능한 검증 문항: **2020년 자료 200문항**. 원본 스캔으로만 제공하는 2026년 자료: **60문항** (개별 풀이 미지원)
- 공통 문제 브라우저는 출제년도→회차→과목별 필터를 지원하고, 랜덤 풀이도 과목별 출제가 가능. 기존 실기 엔진과 데이터는 수정하지 않음

자료에서 명시되지 않은 정확한 시험일이나 누락된 보기/문항 내용을 임의로 생성하지 않습니다. 사용자가 제공한 자료를 구조화·보관한 것이며 출제기관의 재게시 허가를 뜻하지 않습니다.



## 2026-11-24 추가 파일 등록·과목 필터

- `정보처리산업기사20200822(교사용).hwpx`: **2020-08-22, 3회**, 100문항(5과목 × 20문항). GitHub `data/industrial-written/questions-20200822.json` 및 Supabase `written_question_bank`에 저장. 문항별 답안 표시와 교사용 정답표 대조, 원본 그림 포함.
- `정보처리산업기사20200606(교사용).hwpx`: **2020-06-06, 1·2회 통합**, 100문항(5과목 × 20문항). 기존 등록 유지.
- `2026년2회_정보처리산업기사 필기 기출문제1.docx`: **2026년 2회**, 원본 스캔 5쪽(문제 1~60번, 답안표), 이미지 5개와 60개 답안표 위치. 정확한 응시일은 파일명에서 확인되지 않아 `examDate: null`로 보존. GitHub `data/industrial-written/scans-2026-2.json` 및 Supabase `written_exam_scanned_sources`에 **스캔 자료로** 저장함. 개별 문항 텍스트·선택지 판독과 정답의 독립 검증이 완료되지 않아 `written_question_bank`에 60개 자동채점 문항으로 등록한 것으로 계산하지 않음.
- 포털 문제 목록에서 **출제년도, 회차, 과목**을 결합해 필터링. 2020년 2개 시험은 문제 번호별 풀이 가능하며, 2026년 2회는 원본 문서 페이지를 과목별로 조회할 수 있음.
- 현재 정보처리산업기사 필기 자동채점 가능 문제: **200문항**. 등록된 시험 원본 스캔: **2026년 2회 1건(60문항 수록, 변환 대기)**.
- 기존 실기 페이지와 실기 학습기록은 변경하지 않음.



## 2025년 필기 1·2·3회 등록 (2026-11-24)

사용자가 제공한 이미지형 DOCX 파일을 기준으로 시험회차를 별도 관리합니다.

| 시험 | 업로드 원본 | 문항 수 | 페이지 이미지 | 자동채점 |
|---|---|---:|---:|---|
| 2025년 1회 | `2025년1회_정보처리산업기사필기 기출문제.docx` | 60 | 6쪽(문제지 5+정답표 1) | 미등록 |
| 2025년 2회 | `2025년2회_정보처리산업기사필기 기출문제.docx` | 60 | 5쪽(문제지 4+정답표 1) | 미등록 |
| 2025년 3회 | `2025년3회_정보처리산업기사 필기_기출문제.docx` | 60 | 5쪽(문제지 4+정답표 1) | 미등록 |

- **원본 문항 구성:** 정보시스템 기반 기술(1~20), 프로그래밍언어 활용(21~40), 데이터베이스 활용(41~60).
- **등록 파일:** `data/industrial-written/scans-2025-1.json`, `scans-2025-2.json`, `scans-2025-3.json`. DOCX에서 렌더링한 각 페이지를 WebP 이미지로 포함합니다. 원본 DOCX 바이너리 그 자체를 GitHub에 복제한 것은 아닙니다.
- **DB:** Supabase `public.written_exam_scanned_sources`의 `industrial-2025-1`, `industrial-2025-2`, `industrial-2025-3`에 동일한 페이지·정답표 JSON을 저장했습니다. GitHub 데이터와 DB `manifest` JSON이 세 회차 모두 일치함을 검증했습니다.
- **시험일:** 업로드 파일명에 실제 시험일이 없으므로 `examDate: null` 유지. 2020년은 기존 `2020-06-06 1·2회 통합`, `2020-08-22 3회` 정보를 유지합니다.
- **정답표:** 각 60개 정답 번호는 렌더링된 문서의 정답표를 육안으로 전사했습니다. 독립된 외부 답안과 대조하지 않았으므로 정답의 사실 확인은 미완료입니다.
- **화질 유의:** DOCX가 다수의 이미지 조각으로 구성되어 일부 질문과 선택지가 중첩·흐림 상태입니다. 문제 본문과 4개 보기 텍스트가 완전 검증되지 않아 2025년 180문항을 `written_question_bank`의 자동채점 문항으로 등록하지 않았습니다.
- **UI:** 연도 → 시험회차(2020년 1·2회 통합/3회, 2025년 1/2/3회, 2026년 2회) → 시험 과목을 결합해 선택합니다. 2025년에는 해당 과목이 포함된 스캔 페이지를 보여 주고, 2020년에는 기존 200문항을 직접 풀이할 수 있습니다.
- **기존 실기:** `practical.html`, `js/practical-ui.js`와 실기 기록은 변경하지 않았습니다.

