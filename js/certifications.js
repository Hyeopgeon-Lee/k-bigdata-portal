// Career preparation guidance. Stable IDs and official URLs are preserved.
export const certificationGuidance = {
  "exam": "시험 일정, 응시요건, 출제기준, 시험방식 등은 변경될 수 있으므로 반드시 시행기관 공식사이트에서 최신 정보를 확인하세요.",
  "career": "자격증은 학습과 채용 준비의 한 요소입니다. 취득만으로 실무 역량이나 취업이 보장되지 않으며, 프로젝트·GitHub·포트폴리오를 함께 준비하세요."
};
export const certificationPaths = [
  {
    "title": "개발·공공 IT 분야",
    "ids": [
      "engineer",
      "industrial"
    ],
    "description": "개발 직무와 공공기관 전산·정보화 직무, 공공 정보화 사업 수행 기업을 준비한다면 적극적으로 학습하세요. 실제 공고의 필수·우대 조건은 각각 확인합니다."
  },
  {
    "title": "DevOps·클라우드 분야",
    "ids": [
      "cka",
      "ncp"
    ],
    "description": "Kubernetes 운영과 클라우드 인프라 지식을 연결하는 핵심 자격입니다. Linux·Docker·CI/CD·Monitoring을 실제 배포 프로젝트에 함께 적용하세요."
  },
  {
    "title": "데이터·DB 분야",
    "ids": [
      "sqld",
      "adsp",
      "ocp"
    ],
    "description": "SQL·모델링, 데이터 분석 기반, DB 운영의 서로 다른 역량을 보완합니다."
  },
  {
    "title": "Java 분야",
    "ids": [
      "ocjp"
    ],
    "description": "Java 언어 기본기와 객체지향을 다지고 Spring Boot 프로젝트로 확장하세요."
  },
  {
    "title": "IT 활용 분야",
    "ids": [
      "office",
      "computer",
      "word"
    ],
    "description": "업무 데이터·자동화·문서 작성 역량을 보완하며 개발 전문 역량과 구분합니다."
  }
];
export const certifications = [
  {
    "id": "engineer",
    "name": "정보처리기사",
    "english": "Engineer Information Processing",
    "category": "SW · 개발",
    "institution": "한국산업인력공단",
    "overview": "소프트웨어·정보시스템 취업 준비에 중요한 국가기술자격입니다. 특히 공공기관 전산직과 공공 정보화 사업 수행 기업을 목표로 한다면 적극적인 취득을 권장합니다.",
    "tags": [
      "Java",
      "SQL",
      "소프트웨어 공학"
    ],
    "roles": [
      "백엔드 개발자",
      "클라우드 네이티브 개발자",
      "데이터 엔지니어",
      "프론트엔드 개발자",
      "정보시스템 개발·운영",
      "공공 SI / IT서비스 분야"
    ],
    "fields": [
      "소프트웨어 설계",
      "요구사항 분석",
      "애플리케이션 개발",
      "프로그래밍",
      "Database / SQL",
      "운영체제",
      "네트워크",
      "소프트웨어 테스트",
      "정보시스템 구축 및 운영"
    ],
    "education": "Java·Spring Boot·SQL·Database·Git·REST API를 학과 프로젝트와 연결하세요. 소프트웨어 설계와 테스트를 기능 구현의 근거로 사용합니다.",
    "url": "https://www.q-net.or.kr/crf005.do?id=crf00503&jmCd=1320",
    "note": "",
    "priority": "core",
    "badges": [
      "취업 준비 핵심",
      "공공·정보화 분야 중요"
    ],
    "description": "설계·개발·데이터베이스·운영을 연결해 정보시스템을 이해하는 자격입니다. 시험 지식을 실제 API와 데이터베이스 구현에 적용하면서 개발 기본기를 함께 다지세요.",
    "importance": "공공기관 전산·정보화 직무 및 공공 정보화 사업을 수행하는 SI·IT서비스 기업의 채용을 준비할 때 특히 중요합니다. 실제 채용공고에 따라 필수 응시자격 또는 우대자격으로 활용될 수 있습니다. 모든 기관·기업의 공통 필수조건은 아니며 지원 공고를 직접 확인해야 합니다.",
    "whatYouLearn": "요구사항을 설계로 바꾸고 프로그램·데이터베이스·테스트로 구현하는 흐름을 배웁니다. 아래 분야는 학습 연계 안내이며 최신 공식 출제기준 전체를 대신하지 않습니다.",
    "careerUsage": [
      "정보처리기사 + 실제 개발 프로젝트 + GitHub 포트폴리오를 함께 준비하세요.",
      "예약·학생 신청 API에 인증/권한, 트랜잭션, 예외 처리와 테스트를 구현하세요.",
      "README에 요구사항, ERD, API 명세, 기술 선택 이유와 오류 해결·테스트 결과를 남기세요.",
      "공공기관 전산직·정보화 직무와 SI·IT서비스 기업 공고에서 자격 요건과 담당 업무를 함께 확인하세요."
    ],
    "studyOrder": [
      "프로그래밍 기초와 객체지향을 익히기",
      "데이터베이스·SQL로 관계와 조회를 구현하기",
      "요구사항·소프트웨어 설계와 테스트를 연결하기",
      "운영체제·네트워크의 동작을 이해하기",
      "공식 출제기준에 맞춰 필기·실기를 준비하기",
      "프로젝트에서 설계·구현·테스트를 실제 적용하기"
    ],
    "nextStudy": [
      "Java·Spring Boot REST API와 Spring Security",
      "SQL·DB 설계 및 테스트 코드",
      "Git·GitHub 기반 프로젝트 협업과 포트폴리오"
    ],
    "officialCheckItems": [
      "시험 일정·접수 기간·응시료와 환불 조건",
      "응시요건·제출 서류와 본인에게 적용되는 경로",
      "최신 출제기준·시험방식·시험 환경과 허용 자료",
      "시험 코드·인증 유효기간·갱신 정책"
    ],
    "aliases": "공공기관 공공 SI 정보화 전산 개발자 국가기술자격",
    "roleIds": [
      "backend",
      "native",
      "data",
      "frontend"
    ],
    "primaryRoleIds": [],
    "noteTitle": "",
    "importanceSources": [
      {
        "title": "공공기관 채용공고의 필수조건 사례 — 공고별 조건 확인",
        "url": "https://www.alio.go.kr/download/download.json?fileNo=2967177"
      },
      {
        "title": "정보화 채용공고의 우대자격 사례 — 공고별 조건 확인",
        "url": "https://www.alio.go.kr/download/download.json?fileNo=2991730"
      }
    ]
  },
  {
    "id": "industrial",
    "name": "정보처리산업기사",
    "english": "Industrial Engineer Information Processing",
    "category": "SW · 개발",
    "institution": "한국산업인력공단",
    "overview": "전문대학 IT 전공 학생이 개발·정보시스템 취업을 준비할 때 중요한 국가기술자격으로, 공공기관·공공 정보화 분야 준비에도 활용할 수 있습니다.",
    "tags": [
      "프로그래밍",
      "SQL",
      "테스트"
    ],
    "roles": [
      "백엔드 개발자",
      "프론트엔드 개발자",
      "클라우드 네이티브 개발자",
      "데이터 엔지니어",
      "정보시스템 개발·운영",
      "공공 SI / IT서비스 분야"
    ],
    "fields": [
      "소프트웨어 설계",
      "요구사항 분석",
      "애플리케이션 개발",
      "프로그래밍",
      "Database / SQL",
      "운영체제",
      "네트워크",
      "소프트웨어 테스트",
      "정보시스템 구축 및 운영"
    ],
    "education": "Java·Spring Boot·SQL·Database·Git·REST API와 프로젝트 실습에 연결합니다.",
    "url": "https://www.q-net.or.kr/crf005.do?id=crf00503&jmCd=2290",
    "note": "",
    "priority": "core",
    "badges": [
      "취업 준비 핵심",
      "공공·정보화 분야 중요"
    ],
    "description": "응용 소프트웨어·프로그래밍·데이터베이스·정보시스템의 기반 역량을 체계적으로 학습합니다. 전문대학 학생도 개인별 응시요건과 취득 가능 시점을 공식 안내에서 확인한 뒤 준비하세요.",
    "importance": "공공기관 전산·정보화 채용에서 정보처리산업기사 이상을 응시요건으로 두거나 관련 자격을 우대하는 사례가 있습니다. 공공 SI·IT서비스 분야를 목표로 한다면 적극적으로 준비하되 모든 공고에 필수라고 단정하지 않습니다.",
    "whatYouLearn": "프로그램 개발에 필요한 언어·DB·설계·시스템 기초를 연결합니다. 문제 풀이와 함께 작은 서비스의 구현·검증으로 개념을 확인하세요.",
    "careerUsage": [
      "시험 합격과 개발 실무 능력은 동일하지 않습니다. 프로젝트 개발을 병행하세요.",
      "신청·예약 API의 테이블·JOIN·권한·예외 처리·테스트를 직접 구현하세요.",
      "GitHub README에 ERD·API 명세·설계 이유와 테스트 결과를 남기세요.",
      "응시 가능한 시점과 지원 공고의 필수·우대 조건을 각각 확인하세요."
    ],
    "studyOrder": [
      "프로그래밍 기초와 객체지향을 익히기",
      "데이터베이스·SQL로 관계와 조회를 구현하기",
      "요구사항·소프트웨어 설계와 테스트를 연결하기",
      "운영체제·네트워크의 동작을 이해하기",
      "공식 출제기준에 맞춰 필기·실기를 준비하기",
      "프로젝트에서 설계·구현·테스트를 실제 적용하기"
    ],
    "nextStudy": [
      "Java·Spring Boot API와 관계형 DB 구현",
      "GitHub 협업·테스트·프로젝트 포트폴리오",
      "응시요건을 충족하면 정보처리기사의 공식 안내 검토"
    ],
    "officialCheckItems": [
      "시험 일정·접수 기간·응시료와 환불 조건",
      "응시요건·제출 서류와 본인에게 적용되는 경로",
      "최신 출제기준·시험방식·시험 환경과 허용 자료",
      "시험 코드·인증 유효기간·갱신 정책"
    ],
    "aliases": "공공기관 공공 SI 정보화 전산 개발자 전문대학",
    "roleIds": [
      "backend",
      "frontend",
      "native",
      "data"
    ],
    "primaryRoleIds": [],
    "noteTitle": "",
    "importanceSources": [
      {
        "title": "공공기관 채용공고의 필수조건 사례 — 과거 공고는 참고용",
        "url": "https://www.alio.go.kr/download/download.json?fileNo=2967177"
      },
      {
        "title": "정보화 채용공고의 우대자격 사례 — 과거 공고는 참고용",
        "url": "https://www.alio.go.kr/download/download.json?fileNo=2991730"
      }
    ]
  },
  {
    "id": "adsp",
    "name": "데이터분석준전문가(ADsP)",
    "english": "Advanced Data Analytics Semi-Professional",
    "category": "데이터 · DB",
    "institution": "한국데이터산업진흥원",
    "overview": "데이터 이해와 분석 기획·기초 통계 역량을 평가합니다.",
    "tags": [
      "데이터 분석",
      "통계",
      "분석 기획"
    ],
    "roles": [
      "데이터 엔지니어",
      "AI 개발자"
    ],
    "fields": [
      "데이터 이해",
      "분석 기획",
      "통계",
      "데이터 분석"
    ],
    "education": "빅데이터·통계·데이터 분석 학습",
    "url": "https://www.dataq.or.kr/www/main.do",
    "note": "",
    "priority": "standard",
    "badges": [],
    "description": "데이터 이해·분석 기획·통계·데이터 분석의 기반을 다지는 자격입니다. AI 모델 개발이나 서비스 구현 능력을 직접 증명하는 자격으로 과장하지 않습니다.",
    "importance": "AI 개발자와 데이터 관련 진로에서 문제·데이터·분석 방법을 연결하는 기초 지식을 보완합니다. 데이터 엔지니어에게도 품질과 활용 목적을 이해하는 기반이 됩니다.",
    "whatYouLearn": "분석 목적·가설·데이터 특성을 확인하고 통계·분석 결과를 해석하는 관점을 배웁니다.",
    "careerUsage": [
      "Python·Pandas로 데이터를 정리하고 결측·누수·편향을 점검하세요.",
      "Machine Learning 프로젝트에서 학습/검증/테스트를 분리하고 모델 평가·비교 실험을 수행하세요.",
      "데이터 출처·문제 정의·AI 적용 이유·평가 기준·오류 분석을 포트폴리오에 남기세요."
    ],
    "studyOrder": [
      "데이터 이해와 품질 확인",
      "분석 기획과 문제·가설 정의",
      "기초 통계와 결과 해석",
      "데이터 분석 방법 학습",
      "공식 범위에 맞춘 시험 준비",
      "Python 데이터 전처리·평가 프로젝트 적용"
    ],
    "nextStudy": [
      "Python·Pandas 데이터 전처리",
      "Machine Learning·모델 평가",
      "데이터 기반 AI 프로젝트와 오류 분석"
    ],
    "officialCheckItems": [
      "시험 일정·접수 기간·응시료와 환불 조건",
      "응시요건·제출 서류와 본인에게 적용되는 경로",
      "최신 출제기준·시험방식·시험 환경과 허용 자료",
      "시험 코드·인증 유효기간·갱신 정책"
    ],
    "aliases": "ADsP 데이터 분석 통계 AI",
    "roleIds": [
      "ai",
      "data"
    ],
    "primaryRoleIds": [],
    "noteTitle": "",
    "importanceSources": []
  },
  {
    "id": "sqld",
    "name": "SQLD(SQL Developer)",
    "english": "SQL Developer",
    "category": "데이터 · DB",
    "institution": "한국데이터산업진흥원",
    "overview": "SQL과 데이터 모델링의 이해 및 활용 능력을 평가합니다.",
    "tags": [
      "SQL",
      "Database",
      "데이터 모델링"
    ],
    "roles": [
      "백엔드 개발자",
      "데이터 엔지니어"
    ],
    "fields": [
      "데이터 모델링",
      "관계형 데이터베이스",
      "SQL",
      "JOIN",
      "Subquery",
      "GROUP BY / Aggregate",
      "SQL 활용"
    ],
    "education": "데이터베이스 설계·SQL 실습",
    "url": "https://www.dataq.or.kr/www/main.do",
    "note": "",
    "priority": "standard",
    "badges": [],
    "description": "SQL과 데이터 모델링을 학습하는 자격입니다. 정답 SQL을 찾는 것과 업무 규칙에 맞는 DB 설계·데이터 검증은 함께 준비해야 합니다.",
    "importance": "백엔드 개발자와 데이터 엔지니어의 공통 기반인 관계형 데이터베이스·SQL 역량을 보완합니다. 특정 DB 제품의 운영 전문 자격과는 구분하세요.",
    "whatYouLearn": "데이터 관계와 정합성을 모델로 표현하고 JOIN·Subquery·집계로 필요한 결과를 만듭니다.",
    "careerUsage": [
      "실제 프로젝트에서 ERD·테이블·PK/FK·제약조건을 직접 설계하세요.",
      "JOIN·GROUP BY·Subquery를 사용해 조회 기능을 만들고 중복·NULL·누락 데이터를 테스트하세요.",
      "README에 SQL의 목적, 실행 결과·테스트와 모델링 선택 이유를 남기세요."
    ],
    "studyOrder": [
      "Database와 관계형 모델 기본",
      "데이터 모델링과 PK/FK",
      "SQL 기본·조건 조회",
      "JOIN과 관계 조회",
      "Subquery·Aggregate",
      "프로젝트 SQL 활용·검증"
    ],
    "nextStudy": [
      "PostgreSQL 등 실제 DB의 실행 계획·인덱스",
      "백엔드 트랜잭션과 데이터 정합성",
      "Python ETL·데이터 파이프라인"
    ],
    "officialCheckItems": [
      "시험 일정·접수 기간·응시료와 환불 조건",
      "응시요건·제출 서류와 본인에게 적용되는 경로",
      "최신 출제기준·시험방식·시험 환경과 허용 자료",
      "시험 코드·인증 유효기간·갱신 정책"
    ],
    "aliases": "SQLD SQL DB Database 데이터베이스",
    "roleIds": [
      "backend",
      "data"
    ],
    "primaryRoleIds": [],
    "noteTitle": "",
    "importanceSources": []
  },
  {
    "id": "ocp",
    "name": "OCP(Oracle Certified Professional)",
    "english": "Oracle Certified Professional",
    "category": "데이터 · DB",
    "institution": "Oracle",
    "overview": "Oracle 기술에 대한 전문 역량을 인증하는 자격 체계입니다.",
    "tags": [
      "Oracle",
      "Database",
      "DB 운영"
    ],
    "roles": [
      "데이터 엔지니어",
      "백엔드 개발자"
    ],
    "fields": [
      "Oracle Database",
      "SQL",
      "Database Administration",
      "Backup / Recovery",
      "Performance",
      "Database Operation"
    ],
    "education": "데이터베이스·SQL·시스템 운영 학습",
    "url": "https://www.oracle.com/education/certification/",
    "note": "학과에서는 OCP라는 안내 명칭을 사용합니다. 현재 Oracle Certification은 제품·역할·버전 등에 따라 구분될 수 있습니다. 시험 준비 전 학과의 인정 여부와 현재 Oracle 공식 Certification을 모두 확인하세요. 이 페이지는 특정 시험의 동등성이나 인정 여부를 판정하지 않습니다.",
    "priority": "standard",
    "badges": [],
    "description": "학과 안내 명칭 OCP를 보존하며 Oracle의 특정 현행 자격과 자동으로 동일시하지 않습니다. 선택한 제품·역할·버전에 따라 학습 범위가 달라집니다.",
    "importance": "DB 운영 진로를 준비한다면 SQL뿐 아니라 권한·백업·복구·성능·운영을 배우는 계기로 활용할 수 있습니다. 현재 시험 트랙의 내용과 선행 요건은 별도로 확인해야 합니다.",
    "whatYouLearn": "DB 관련 학습 연결 예시는 아래와 같습니다. 모든 Oracle Certified Professional 트랙의 공통 시험 범위라는 뜻은 아닙니다.",
    "careerUsage": [
      "허용된 학습 환경에서 DB 권한·백업·복구를 직접 실습하세요.",
      "SQL 실행 계획과 성능 병목을 관찰하고 개선 전후 근거를 기록하세요.",
      "DB 운영 절차·복구 테스트·접근권한 설계를 README로 설명하세요."
    ],
    "studyOrder": [
      "학과 안내 명칭과 현재 Oracle 트랙 확인",
      "SQL·관계형 DB 기초",
      "선택한 트랙의 DB 관리·권한 학습",
      "Backup/Recovery와 복구 검증",
      "성능·운영 실습",
      "현재 공식 시험 요건·출제범위 확인"
    ],
    "nextStudy": [
      "DB 운영 자동화와 모니터링",
      "백업·복구 전략 및 성능 개선",
      "데이터 파이프라인의 DB 운영"
    ],
    "officialCheckItems": [
      "시험 일정·접수 기간·응시료와 환불 조건",
      "응시요건·제출 서류와 본인에게 적용되는 경로",
      "최신 출제기준·시험방식·시험 환경과 허용 자료",
      "시험 코드·인증 유효기간·갱신 정책"
    ],
    "aliases": "OCP Oracle SQL Database DB",
    "roleIds": [
      "data",
      "backend"
    ],
    "primaryRoleIds": [],
    "noteTitle": "학과 안내 명칭과 현재 Oracle Certification 안내",
    "importanceSources": []
  },
  {
    "id": "cka",
    "name": "CKA(Certified Kubernetes Administrator)",
    "english": "Certified Kubernetes Administrator",
    "category": "클라우드 · 인프라",
    "institution": "CNCF / Linux Foundation",
    "overview": "Kubernetes 클러스터를 관리하고 장애를 해결하는 능력을 확인하는 실무형 자격으로, DevOps·클라우드 네이티브 진로에 특히 중요합니다.",
    "tags": [
      "Kubernetes",
      "Cloud",
      "DevOps",
      "쿠버네티스"
    ],
    "roles": [
      "DevOps 엔지니어",
      "클라우드 네이티브 개발자",
      "클라우드 엔지니어",
      "Kubernetes 운영 / 플랫폼 엔지니어링"
    ],
    "fields": [
      "Kubernetes Architecture",
      "Pod / Deployment",
      "Service / Networking",
      "Storage",
      "Scheduling",
      "Cluster Administration",
      "Troubleshooting",
      "Logging / Monitoring",
      "Rolling Update / Rollback"
    ],
    "education": "Docker·Kubernetes·K-PaaS·Cloud Native·MSA·DevOps 교육 방향과 직접 연결됩니다.",
    "url": "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/",
    "note": "",
    "priority": "core",
    "badges": [
      "DevOps 핵심",
      "Kubernetes",
      "실무형 Certification"
    ],
    "description": "실제 Kubernetes 환경의 명령줄에서 주어진 작업을 수행하는 performance-based certification입니다. 객관식 암기 중심이 아니라 상태를 확인하고 원인을 찾아 복구하는 능력을 연습하세요.",
    "importance": "DevOps 분야에서 중요한 Kubernetes 운영 역량을 학습하고 확인하는 데 활용할 수 있는 핵심 자격입니다. Linux·Docker·CI/CD·Cloud·Monitoring·Troubleshooting과 연결해 준비해야 하며 자격 취득만으로 채용이 보장되지는 않습니다.",
    "whatYouLearn": "클러스터의 원하는 상태와 실제 상태를 비교하고 네트워크·스토리지·스케줄링·권한·워크로드 장애를 다룹니다. 정상 배포뿐 아니라 실패 상황의 진단과 복구도 연습하세요.",
    "careerUsage": [
      "Spring Boot → Docker Image → Kubernetes Deployment → Service → ConfigMap/Secret → Health Check → Rolling Update/Rollback → Monitoring 과정을 실제 프로젝트로 구현하세요.",
      "배포 매니페스트, Probe·권한·자원 설정, 배포 구조를 GitHub에 기록하되 Secret 값은 공개하지 마세요.",
      "장애 재현 → 로그·이벤트 확인 → 원인 분석 → 복구와 검증을 README·포트폴리오로 보여주세요."
    ],
    "studyOrder": [
      "Linux·Shell과 파일·권한·네트워크 기초",
      "Docker 이미지·컨테이너·Network·Volume",
      "Pod·Deployment·Service와 설정 객체",
      "Networking·Storage·Scheduling",
      "Cluster Administration과 접근권한",
      "Troubleshooting·Rolling Update/Rollback 및 관측"
    ],
    "nextStudy": [
      "CI/CD·GitOps와 Argo CD 배포",
      "Prometheus·Grafana 기반 운영 관측",
      "K-PaaS·클라우드 환경의 실제 서비스 운영"
    ],
    "officialCheckItems": [
      "시험 일정·접수 기간·응시료와 환불 조건",
      "응시요건·제출 서류와 본인에게 적용되는 경로",
      "최신 출제기준·시험방식·시험 환경과 허용 자료",
      "시험 코드·인증 유효기간·갱신 정책",
      "현재 Kubernetes 시험 버전·작업 환경·허용 문서와 접속/감독 조건"
    ],
    "aliases": "쿠버네티스 Kubernetes K8s DevOps 클라우드",
    "roleIds": [
      "devops",
      "native",
      "cloud"
    ],
    "primaryRoleIds": [],
    "noteTitle": "",
    "importanceSources": []
  },
  {
    "id": "ncp",
    "name": "NAVER CLOUD PLATFORM Certified Professional",
    "english": "NCP Certified Professional",
    "category": "클라우드 · 인프라",
    "institution": "NAVER Cloud",
    "overview": "NAVER Cloud Platform의 인프라 구성·운영·Troubleshooting 전문 지식과 관련된 자격으로, DevOps·클라우드 진로에 중요합니다.",
    "tags": [
      "NAVER Cloud",
      "Cloud",
      "Network"
    ],
    "roles": [
      "DevOps 엔지니어",
      "클라우드 엔지니어",
      "클라우드 네이티브 개발자",
      "플랫폼 엔지니어링 관련 직무"
    ],
    "fields": [
      "Compute / Server",
      "Storage",
      "Network / VPC",
      "Database",
      "Security / IAM / Sub Account",
      "Monitoring",
      "Management",
      "Troubleshooting"
    ],
    "education": "Cloud·Linux·Network·Docker·Kubernetes·K-PaaS·DevOps·MSA·클라우드 네이티브 학습에 연결합니다.",
    "url": "https://www.ncloud.com/support/certexam",
    "note": "학과 안내 명칭은 NAVER CLOUD PLATFORM Certified Professional입니다. 공식 시행기관의 Professional 안내를 확인하며 다른 단계의 자격으로 대체하지 않습니다. 공식 안내의 시험방식과 별도로 프로젝트 구축·운영 실습을 권장합니다.",
    "priority": "core",
    "badges": [
      "DevOps·Cloud 핵심",
      "NAVER Cloud"
    ],
    "description": "클라우드 인프라를 독립적으로 구성하고 문제를 해결하는 지식과 연결됩니다. 공식 안내의 필기 시험과 실제 프로젝트 실습은 구분하며 시험 준비에 구축·운영 경험을 더하세요.",
    "importance": "DevOps는 CI/CD 자동화뿐 아니라 서비스가 배포되는 인프라의 이해도 필요합니다. Compute·Storage·Network·Database·Security·Monitoring·Management·Troubleshooting을 연결하는 NCP Professional 학습은 국내 NAVER Cloud 활용 프로젝트와 기업을 준비할 때 도움이 됩니다.",
    "whatYouLearn": "서버·네트워크·데이터 저장·권한·운영 관측을 하나의 서비스 배포 구조로 이해합니다. 아래는 직무 연계 학습 분야이며 시험 과목과 동일한 목록이라고 단정하지 않습니다.",
    "careerUsage": [
      "Server·VPC·Load Balancer·Storage·Database·IAM/Sub Account·Monitoring을 조합해 웹서비스를 배포해 보세요.",
      "네트워크와 권한을 최소 범위로 설정하고 배포·접속·장애 복구를 검증하세요.",
      "README에 인프라 구성도, 접근권한 설계, 배포 절차와 운영 지표·문제 해결 근거를 남기세요.",
      "실습 전 비용·무료 사용 조건을 확인하고 예산 알림·자원 종료 절차를 정하세요. 이 페이지는 가입·결제를 실행하지 않습니다."
    ],
    "studyOrder": [
      "Cloud·Linux·Network 기본 개념",
      "Compute·Storage 구성 이해",
      "VPC·Load Balancer와 네트워크 접근 제어",
      "Database·접근권한·보안 구성",
      "Management·Monitoring과 비용 관리",
      "Troubleshooting과 실제 서비스 배포 검증"
    ],
    "nextStudy": [
      "Docker·Kubernetes 기반 서비스 운영",
      "CI/CD와 클라우드 배포 자동화",
      "백업·복구·모니터링·보안 및 비용 개선"
    ],
    "officialCheckItems": [
      "시험 일정·접수 기간·응시료와 환불 조건",
      "응시요건·제출 서류와 본인에게 적용되는 경로",
      "최신 출제기준·시험방식·시험 환경과 허용 자료",
      "시험 코드·인증 유효기간·갱신 정책"
    ],
    "aliases": "NCP NAVER Cloud 네이버 클라우드 DevOps",
    "roleIds": [
      "devops",
      "cloud",
      "native"
    ],
    "primaryRoleIds": [
      "devops",
      "cloud"
    ],
    "noteTitle": "",
    "importanceSources": []
  },
  {
    "id": "linux",
    "name": "리눅스마스터 1급",
    "english": "Linux Master Level 1",
    "category": "클라우드 · 인프라",
    "institution": "한국정보통신진흥협회(KAIT)",
    "overview": "Linux 시스템 관리와 네트워크 운영 역량을 평가합니다.",
    "tags": [
      "Linux",
      "Shell",
      "Network"
    ],
    "roles": [
      "DevOps 엔지니어",
      "클라우드 엔지니어",
      "클라우드 네이티브 개발자"
    ],
    "fields": [
      "Linux",
      "Shell",
      "Process",
      "Filesystem",
      "Permission",
      "Network",
      "System Administration"
    ],
    "education": "Linux·운영체제·서버 운영 실습",
    "url": "https://www.ihd.or.kr/",
    "note": "",
    "priority": "standard",
    "badges": [],
    "description": "명령어 암기뿐 아니라 Linux 시스템·프로세스·파일시스템·권한·네트워크의 운영 원리를 학습하는 자격입니다.",
    "importance": "DevOps·Cloud·Kubernetes를 공부하기 위한 중요한 기반 기술을 다집니다. 서비스가 실행되는 OS의 상태를 읽고 문제를 해결하는 연습이 필요합니다.",
    "whatYouLearn": "사용자·권한·프로세스·파일과 네트워크 설정을 관리하고 로그에서 장애 원인을 찾습니다.",
    "careerUsage": [
      "Linux에 웹서비스를 실행하고 프로세스·포트·권한·로그를 점검하세요.",
      "Shell로 반복 작업을 자동화하고 실패 조건·출력·복구 절차를 기록하세요.",
      "권한 오류·디스크 부족·네트워크 문제를 재현하고 진단·복구 과정을 README에 남기세요."
    ],
    "studyOrder": [
      "Linux 설치·파일시스템 탐색",
      "사용자·그룹·권한 관리",
      "프로세스와 서비스 관리",
      "Shell·반복 작업 자동화",
      "Network·로그·시스템 관리",
      "장애 진단과 프로젝트 운영 적용"
    ],
    "nextStudy": [
      "Docker·Kubernetes 운영",
      "Cloud 인프라·CI/CD",
      "모니터링·로그 분석과 장애 대응"
    ],
    "officialCheckItems": [
      "시험 일정·접수 기간·응시료와 환불 조건",
      "응시요건·제출 서류와 본인에게 적용되는 경로",
      "최신 출제기준·시험방식·시험 환경과 허용 자료",
      "시험 코드·인증 유효기간·갱신 정책"
    ],
    "aliases": "Linux 리눅스 DevOps Cloud Kubernetes",
    "roleIds": [
      "devops",
      "cloud",
      "native"
    ],
    "primaryRoleIds": [],
    "noteTitle": "",
    "importanceSources": []
  },
  {
    "id": "ocjp",
    "name": "OCJP(Oracle Certified Java Programmer)",
    "english": "Oracle Certified Java Programmer",
    "category": "Java",
    "institution": "Oracle",
    "overview": "Java 프로그래밍 역량과 객체지향 언어의 이해를 다룹니다.",
    "tags": [
      "Java",
      "OOP",
      "JVM"
    ],
    "roles": [
      "백엔드 개발자",
      "클라우드 네이티브 개발자"
    ],
    "fields": [
      "Java Syntax",
      "OOP",
      "Class",
      "Interface",
      "Exception",
      "Collection",
      "Generic",
      "Java API"
    ],
    "education": "Java·객체지향 프로그래밍의 기본기를 Spring Boot 학습의 기반으로 연결합니다. Spring 자체의 자격을 뜻하지 않습니다.",
    "url": "https://www.oracle.com/education/certification/",
    "note": "학과 안내 명칭은 OCJP입니다. 현재 Oracle Java Certification은 제품·버전별로 구분될 수 있습니다. 학과의 인정 여부와 Oracle 공식 안내를 모두 확인하세요. 기존 명칭과 현행 Java 시험을 자동으로 동일한 자격으로 간주하지 않습니다.",
    "priority": "standard",
    "badges": [],
    "description": "Java 언어와 객체지향 기본기를 다루는 학과 안내 명칭입니다. Spring 자격이 아니며 현재 Oracle Java Certification을 무조건 같은 자격이라고 단정하지 않습니다.",
    "importance": "백엔드·클라우드 네이티브 개발자가 API·서버 로직을 구현할 때 필요한 Java 언어 이해를 보완합니다. 프레임워크 사용 전에 타입·객체·예외·컬렉션의 동작을 설명할 수 있어야 합니다.",
    "whatYouLearn": "언어 문법과 객체의 관계, 예외·컬렉션·Generic·Java API를 작은 코드와 테스트로 확인하세요.",
    "careerUsage": [
      "Class·Interface로 도메인 역할을 나누고 예외·컬렉션을 사용하는 코드를 작성하세요.",
      "테스트로 동작을 검증하고 자료구조 선택·예외 처리 이유를 README에 기록하세요.",
      "언어 기본기를 Spring Boot REST API 프로젝트로 확장하세요."
    ],
    "studyOrder": [
      "학과 안내 명칭과 현행 Oracle Java 시험 확인",
      "Java Syntax·타입",
      "OOP·Class·Interface",
      "Exception·Collection·Generic",
      "Java API와 코드 실행·검증",
      "공식 범위 확인 후 프로젝트 적용"
    ],
    "nextStudy": [
      "Spring Boot·REST API",
      "JUnit 테스트와 Java 동시성",
      "DB 연동·인증/권한 프로젝트"
    ],
    "officialCheckItems": [
      "시험 일정·접수 기간·응시료와 환불 조건",
      "응시요건·제출 서류와 본인에게 적용되는 경로",
      "최신 출제기준·시험방식·시험 환경과 허용 자료",
      "시험 코드·인증 유효기간·갱신 정책"
    ],
    "aliases": "OCJP Java 자바",
    "roleIds": [
      "backend",
      "native"
    ],
    "primaryRoleIds": [],
    "noteTitle": "학과 안내 명칭과 현재 Oracle Java Certification 안내",
    "importanceSources": []
  },
  {
    "id": "office",
    "name": "사무자동화산업기사",
    "english": "Industrial Engineer Office Automation",
    "category": "IT 활용",
    "institution": "한국산업인력공단",
    "overview": "업무 자동화와 사무 정보 활용 역량을 평가합니다.",
    "tags": [
      "업무 자동화",
      "문서",
      "데이터 활용"
    ],
    "roles": [
      "IT 업무 지원",
      "개발 프로젝트 협업"
    ],
    "fields": [
      "정보 처리",
      "업무 자동화",
      "데이터 활용",
      "사무 정보화"
    ],
    "education": "데이터 정리·문서 작성·프로젝트 협업의 활용 역량을 연결합니다.",
    "url": "https://www.q-net.or.kr/crf005.do?id=crf00503&jmCd=2193",
    "note": "",
    "priority": "standard",
    "badges": [],
    "description": "정보 처리·업무 자동화·데이터 활용·사무 정보화 역량을 다룹니다. 개발 전문 자격을 대신하기보다 협업·업무 효율을 보완하는 자격입니다.",
    "importance": "반복적인 문서·표·데이터 작업을 정리하고 자동화하는 기반을 다집니다. 개발 진로에서는 프로그래밍·프로젝트 역량을 별도로 준비하세요.",
    "whatYouLearn": "업무 데이터를 정리하고 문서·표·정보 처리 도구를 업무 흐름에 맞게 활용합니다.",
    "careerUsage": [
      "반복 보고 업무의 입력·처리·검증 흐름을 정의하세요.",
      "자동화 전후 작업 과정과 오류 검증을 프로젝트 문서로 정리하세요."
    ],
    "studyOrder": [
      "사무 정보화와 업무 흐름 이해",
      "문서·표와 데이터 구조",
      "업무 도구·데이터 활용",
      "자동화 결과 검증",
      "공식 출제기준과 실기 준비"
    ],
    "nextStudy": [
      "프로젝트 문서·데이터 품질 관리",
      "Python·Shell 기반 업무 자동화"
    ],
    "officialCheckItems": [
      "시험 일정·접수 기간·응시료와 환불 조건",
      "응시요건·제출 서류와 본인에게 적용되는 경로",
      "최신 출제기준·시험방식·시험 환경과 허용 자료",
      "시험 코드·인증 유효기간·갱신 정책"
    ],
    "aliases": "사무자동화 업무 정보 처리",
    "roleIds": [],
    "primaryRoleIds": [],
    "noteTitle": "",
    "importanceSources": []
  },
  {
    "id": "computer",
    "name": "컴퓨터활용능력 1급",
    "english": "Computer Specialist in Spreadsheet & Database Level 1",
    "category": "IT 활용",
    "institution": "대한상공회의소",
    "overview": "스프레드시트와 데이터베이스의 업무 활용 능력을 평가합니다.",
    "tags": [
      "Spreadsheet",
      "Database",
      "업무 분석"
    ],
    "roles": [
      "데이터 업무 지원",
      "IT 프로젝트 협업"
    ],
    "fields": [
      "Spreadsheet",
      "Database",
      "업무 데이터 처리",
      "데이터 정리·분석"
    ],
    "education": "데이터 정리·분석·보고서 작성",
    "url": "https://license.korcham.net/",
    "note": "",
    "priority": "standard",
    "badges": [],
    "description": "Spreadsheet와 Database를 이용한 업무 데이터 처리·정리·분석 역량을 다룹니다. 전문 DB 운영이나 백엔드 개발 역량과 동일하지 않습니다.",
    "importance": "업무 데이터의 정리·검증·보고를 보완하는 자격입니다. IT 프로젝트에서도 자료 품질과 근거를 명확히 전달하는 데 활용하세요.",
    "whatYouLearn": "스프레드시트 기능과 데이터베이스 활용을 통해 데이터를 정리하고 업무 목적에 맞게 처리합니다.",
    "careerUsage": [
      "입력값·함수·조회 결과의 오류를 검증하는 업무 자료를 만드세요.",
      "데이터 출처·정리 기준·분석 한계를 보고서에 기록하세요."
    ],
    "studyOrder": [
      "컴퓨터·데이터 기본",
      "Spreadsheet의 함수·데이터 처리",
      "Database의 조회·업무 활용",
      "업무 자료 정리와 검증",
      "공식 범위에 맞춘 필기·실기 준비"
    ],
    "nextStudy": [
      "SQL·관계형 DB 기초",
      "업무 데이터 품질·시각화·보고"
    ],
    "officialCheckItems": [
      "시험 일정·접수 기간·응시료와 환불 조건",
      "응시요건·제출 서류와 본인에게 적용되는 경로",
      "최신 출제기준·시험방식·시험 환경과 허용 자료",
      "시험 코드·인증 유효기간·갱신 정책"
    ],
    "aliases": "컴퓨터활용능력 컴활 Spreadsheet Database",
    "roleIds": [],
    "primaryRoleIds": [],
    "noteTitle": "",
    "importanceSources": []
  },
  {
    "id": "word",
    "name": "워드프로세서",
    "english": "Word Processor",
    "category": "IT 활용",
    "institution": "대한상공회의소",
    "overview": "문서 편집과 사무 문서 작성 능력을 평가합니다.",
    "tags": [
      "문서 작성",
      "편집",
      "업무 활용"
    ],
    "roles": [
      "IT 업무 지원",
      "프로젝트 협업"
    ],
    "fields": [
      "문서 작성",
      "보고서",
      "프로젝트 문서",
      "기획 문서"
    ],
    "education": "기획서·보고서·프로젝트 문서 작성",
    "url": "https://license.korcham.net/",
    "note": "현재 시행기관은 워드프로세서를 단일등급으로 안내합니다. 기존 워드프로세서 1급 검색어는 별칭으로 유지하고, 같은 word ID와 공식 URL을 사용합니다.",
    "priority": "standard",
    "badges": [],
    "description": "문서 작성·편집을 통해 보고서·기획서·프로젝트 문서를 정리하는 업무 활용 자격입니다. 개발 전문성을 직접 평가하는 자격은 아닙니다.",
    "importance": "프로젝트의 목적·설계·검증 결과를 읽기 좋은 문서로 전달하는 능력을 보완합니다. 기술 구현의 증거는 코드·테스트·README도 함께 보여주세요.",
    "whatYouLearn": "문서 구조·서식·편집과 업무 문서 작성의 기본을 학습합니다.",
    "careerUsage": [
      "문제 정의·대상 사용자·기능·테스트 결과를 일관된 문서로 정리하세요.",
      "목차·표·출처·버전과 문서 접근성을 확인하세요."
    ],
    "studyOrder": [
      "문서·컴퓨터 기본",
      "문서 구조와 서식",
      "편집·표·보고서 작성",
      "기획·프로젝트 문서 정리",
      "공식 범위에 맞춘 필기·실기 준비"
    ],
    "nextStudy": [
      "GitHub README와 API·설계 문서",
      "프로젝트 발표·포트폴리오 작성"
    ],
    "officialCheckItems": [
      "시험 일정·접수 기간·응시료와 환불 조건",
      "응시요건·제출 서류와 본인에게 적용되는 경로",
      "최신 출제기준·시험방식·시험 환경과 허용 자료",
      "시험 코드·인증 유효기간·갱신 정책"
    ],
    "aliases": "워드프로세서 1급 문서 작성",
    "roleIds": [],
    "primaryRoleIds": [],
    "noteTitle": "",
    "importanceSources": []
  }
];
