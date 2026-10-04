# 학생 통합 포털 개편 검수

검수일: 2026-10-04. 기준 커밋: d21c25b(main). 기존 파일 구조와 색상·SVG·카드·상세 UI를 재사용.

## 변경 전 구조

- 4개 카테고리·11개 서비스, 초기 ready/apply/alumni/room/help 중심 Hero.
- 직무 7개·자격증 10개·면접 150개·공식문서 40개. 공통 learning-ui, 검색 데이터 모듈, Pages root 배포.
- Footer는 페이지마다 달랐고 docs.html만 index, follow. 메뉴 일부는 태블릿에서 숨겨지는 CSS가 있었음.
- portal-baseline.json에 기존 서비스 URL과 전체 데이터 ID를 기록. 콘텐츠 데이터와 시험 안내는 보존.

## 개편

- 4영역 Hero를 카테고리 anchor로 연결. 메인에 직무→학습→자격증→프로젝트→면접→준비점검→지원→동문 8단계 제공.
- 서비스 10개: 기술블로그 한 항목 추가. 글 수집·복제 없음. GUIDE/SERVICE/EXTERNAL과 내부 → / 외부 ↗ 구분.
- 직무 목록 핵심 5개 / 연계 2개. 함께 학습할 기술은 기존 docs.jobIds에서 자동 생성. 자격증 관계 합집합·기존 면접 category 링크 유지.
- 면접 직무 태그에서 직무 가이드로 복귀 가능. 기존 질문 ID·랜덤 연습 유지.
- Footer는 services.footerLinks의 외부 사이트 5개로 통일. 모든 6개 HTML noindex, nofollow. 로그인·robots.txt 차단 추가 없음.

## 자동 검사

- job-guide / certifications-guide / interview-bank / docs-hub / portal-redesign 전체 실행.
- 7개 직무, 10개 자격증, 150개 면접, 40개 문서 ID 및 기존 서비스 URL 보존 검사.
- 기술블로그와 기존 검색 동의어, 짧은 기술명 오탐 방지, 내부 경로 존재·교차 데이터 참조 검사.
- CNAME 그대로 유지. 개인정보·내부 점수·서버·새 프레임워크 추가 없음.

## 브라우저 검사

- 로컬 실제 렌더링: 메인 10개 카드, 준비 흐름 8단계, Footer 5개 링크.
- 7개 주요 화면 × 7개 해상도 = 49개 조합. 각 조합에서 실제 viewport 폭을 기록.
- 화면: index, jobs 목록, jobs DevOps 상세, certifications NCP 상세, docs, interview, project-guide.
- 해상도: 360×800 / 390×844 / 412×915 / 768×1024 / 1024×768 / 1440×900 / 1920×1080.
- 문서 가로 넘침 및 본문·카드·상세·Footer의 화면 폭 초과 없음. PC·390px Hero 스크린샷 시각 검수.
- 직무 7개와 자격증 10개 상세 표시 및 각 Footer 정상. DevOps 상세: CKA/NCP/Linux 자격증, Docker/Kubernetes/GitHub Actions/Jenkins/Argo CD/Prometheus/Grafana 공식문서와 4개 면접 분야 연결.
- Kubernetes 통합검색 40개 결과에서 직무·자격증·문서·면접·기술블로그 동시 확인. RAG 직무 검색 AI 1개, Big Data 문서 필터 3개 확인.
- 모바일 메뉴 열기 시 6개 링크 표시, Escape 닫힘과 버튼 focus 복귀 확인.
- 랜덤 10문제 1/10→2/10, 답변 펼침·꼬리질문·다음 문제 답변 숨김 초기화 확인.
- 검수 탭 Console error/warn 없음.

## 외부 링크·운영 확인

- ready/apply/alumni/room/help/portfolio, 교수 기술블로그, 학과 공식/홍보, 작품전시회: HTTP 최종 응답 200. 외부 서비스 저장소 변경 없음.
- 운영 도메인 직접 브라우저 접근은 저장된 사용자 차단 설정으로 거부됨. 다른 브라우저·raw HTTP·CDP 등으로 우회하지 않음.
- 최종 확인 범위는 로컬 QA와 GitHub Pages 배포 상태. 운영 화면 직접 검수는 접근 설정 해제 후 필요.
- noindex는 접속 차단이나 즉시 검색 결과 삭제가 아님. 검색엔진 재수집 시간이 필요할 수 있음.
