// Official exam subjects and department learning connections are stored separately.
export const certificationPaths = [
  {
    "title": "개발·정보시스템",
    "ids": [
      "engineer",
      "industrial"
    ]
  },
  {
    "title": "클라우드·DevOps",
    "ids": [
      "cka",
      "ncp",
      "linux"
    ]
  },
  {
    "title": "데이터·DB",
    "ids": [
      "adsp",
      "sqld"
    ]
  },
  {
    "title": "IT 활용",
    "ids": [
      "office",
      "computer",
      "word"
    ]
  }
];

export const certifications = [
  {
    "id": "engineer",
    "name": "정보처리기사",
    "category": "개발·정보시스템",
    "institution": "한국산업인력공단 (Q-Net)",
    "priority": "core",
    "summary": "소프트웨어 설계·개발과 정보시스템 구축·운영 역량을 평가하는 국가기술자격입니다. 민간 IT 기업, SI·IT서비스 및 공공 IT 분야의 개발·정보시스템 직무를 준비할 때 중요하게 준비하는 자격입니다.",
    "examScope": [
      {
        "stage": "필기",
        "subjects": [
          "소프트웨어설계",
          "소프트웨어개발",
          "데이터베이스구축",
          "프로그래밍언어활용",
          "정보시스템구축관리"
        ]
      },
      {
        "stage": "실기",
        "subjects": [
          "정보처리 실무"
        ]
      }
    ],
    "departmentCourses": [
      "프로그래밍",
      "데이터베이스·SQL",
      "운영체제·네트워크",
      "소프트웨어 설계·테스트"
    ],
    "relatedJobIds": [
      "backend",
      "native",
      "data",
      "frontend"
    ],
    "recommendedTiming": "학위·관련 경력으로 응시요건을 충족하면 1학년 취득을 권장합니다. 그 외에는 1학년 겨울방학에 필기·실기를 함께 준비하고 응시 가능한 제1회 최종 합격을 목표로 하세요. 최근 5년 기출·복원문제는 이해가 어려워도 먼저 모두 풀어보고 해설로 복습하세요.",
    "url": "https://www.q-net.or.kr/crf005.do?id=crf00503s02&jmCd=1320&jmInfoDivCcd=B0",
    "aliases": [
      "정보처리",
      "개발자",
      "공공기관",
      "공공 SI",
      "정보화"
    ]
  },
  {
    "id": "industrial",
    "name": "정보처리산업기사",
    "category": "개발·정보시스템",
    "institution": "한국산업인력공단 (Q-Net)",
    "priority": "core",
    "summary": "정보시스템 기반 기술, 프로그래밍과 데이터베이스 활용 역량을 평가하는 국가기술자격입니다. 전문대학 IT 전공 학생이 민간 IT 기업, SI·IT서비스 및 공공 IT 분야 취업을 준비할 때 우선적으로 준비할 자격입니다.",
    "examScope": [
      {
        "stage": "필기",
        "subjects": [
          "정보시스템 기반 기술",
          "프로그래밍언어 활용",
          "데이터베이스 활용"
        ]
      },
      {
        "stage": "실기",
        "subjects": [
          "정보처리 실무"
        ]
      }
    ],
    "departmentCourses": [
      "프로그래밍",
      "데이터베이스·SQL",
      "운영체제·네트워크",
      "소프트웨어 설계·테스트"
    ],
    "relatedJobIds": [
      "backend",
      "native",
      "data",
      "frontend"
    ],
    "recommendedTiming": "학위·관련 경력으로 응시요건을 충족하면 1학년 취득을 권장합니다. 그 외에는 1학년 겨울방학에 필기·실기를 함께 준비하고 응시 가능한 제1회 최종 합격을 목표로 하세요. 최근 5년 기출·복원문제는 이해가 어려워도 먼저 모두 풀어보고 해설로 복습하세요.",
    "url": "https://www.q-net.or.kr/crf005.do?id=crf00503s02&jmCd=2290&jmInfoDivCcd=B0",
    "aliases": [
      "정보처리",
      "개발자",
      "공공기관",
      "공공 SI",
      "정보화"
    ]
  },
  {
    "id": "adsp",
    "name": "데이터분석준전문가(ADsP)",
    "english": "Advanced Data Analytics Semi-Professional",
    "category": "데이터·DB",
    "institution": "한국데이터산업진흥원",
    "summary": "데이터 이해, 분석 기획과 데이터 분석의 기초 지식을 평가하는 자격입니다.",
    "examScope": [
      {
        "stage": "시험 영역",
        "subjects": [
          "데이터 이해",
          "데이터분석 기획",
          "데이터분석"
        ]
      }
    ],
    "departmentCourses": [
      "데이터 이해",
      "기초 통계",
      "데이터 분석"
    ],
    "relatedJobIds": [
      "analyst",
      "data",
      "ai"
    ],
    "url": "https://www.dataq.or.kr/www/sub/a_06.do",
    "aliases": [
      "ADsP",
      "데이터분석",
      "통계"
    ]
  },
  {
    "id": "sqld",
    "name": "SQLD(SQL Developer)",
    "english": "SQL Developer",
    "category": "데이터·DB",
    "institution": "한국데이터산업진흥원",
    "summary": "데이터 모델링의 이해와 SQL 기본·활용 능력을 평가하는 자격입니다.",
    "examScope": [
      {
        "stage": "시험 영역",
        "subjects": [
          "데이터 모델링의 이해",
          "SQL 기본 및 활용"
        ]
      }
    ],
    "departmentCourses": [
      "데이터베이스 설계",
      "데이터 모델링",
      "SQL"
    ],
    "relatedJobIds": [
      "backend",
      "data",
      "analyst"
    ],
    "recommendedTiming": "1학년 1학기 데이터베이스 수업과 함께 준비해 1학년 2학기 종료 전 취득을 목표로 합니다.",
    "url": "https://www.dataq.or.kr/www/sub/a_04.do",
    "aliases": [
      "SQLD",
      "SQL",
      "DB",
      "Database",
      "데이터베이스"
    ]
  },
  {
    "id": "cka",
    "name": "CKA",
    "english": "Certified Kubernetes Administrator",
    "category": "클라우드·DevOps",
    "institution": "Linux Foundation / CNCF",
    "priority": "core",
    "summary": "Kubernetes 클러스터를 구성·관리하고 장애를 해결하는 능력을 명령줄 과제로 평가하는 실무형 자격입니다. DevOps·클라우드 네이티브 직무 준비에 중요한 Kubernetes 자격입니다.",
    "examScope": [
      {
        "stage": "Domains & Competencies",
        "subjects": [
          "Cluster Architecture, Installation & Configuration",
          "Workloads & Scheduling",
          "Services & Networking",
          "Storage",
          "Troubleshooting"
        ]
      }
    ],
    "departmentCourses": [
      "Linux",
      "Docker",
      "Kubernetes",
      "K-PaaS"
    ],
    "relatedJobIds": [
      "devops",
      "cloud",
      "native"
    ],
    "url": "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/",
    "aliases": [
      "CKA",
      "쿠버네티스",
      "K8s",
      "DevOps"
    ]
  },
  {
    "id": "ncp",
    "name": "NAVER CLOUD PLATFORM Certified Professional",
    "category": "클라우드·DevOps",
    "institution": "NAVER Cloud",
    "priority": "core",
    "summary": "NAVER Cloud Platform의 서비스 구성·운영과 문제 해결 지식을 평가하는 Professional 자격입니다. 국내 클라우드·DevOps 직무 준비와 NAVER Cloud 서비스 이해에 활용합니다.",
    "examScope": [
      {
        "stage": "Professional 시험 영역",
        "subjects": [
          "Overview",
          "Compute / Storage",
          "Network / Media",
          "Database / Management / Analytics",
          "Troubleshooting"
        ]
      }
    ],
    "departmentCourses": [
      "리눅스",
      "클라우드컴퓨팅",
      "네트워크",
      "클라우드 서버·스토리지",
      "접근권한·모니터링"
    ],
    "relatedJobIds": [
      "cloud",
      "devops",
      "native",
      "system"
    ],
    "recommendedTiming": "리눅스·클라우드컴퓨팅 수강 후 1학년 2학기 종료 전 취득을 권장합니다.",
    "url": "https://www.ncloud.com/support/certexam",
    "aliases": [
      "NCP",
      "NAVER Cloud",
      "네이버 클라우드",
      "Cloud",
      "DevOps"
    ]
  },
  {
    "id": "linux",
    "name": "리눅스마스터 1급",
    "category": "클라우드·DevOps",
    "institution": "한국정보통신진흥협회 (KAIT)",
    "summary": "Linux 시스템 관리와 네트워크·서비스 운영 역량을 평가하는 자격입니다.",
    "examScope": [
      {
        "stage": "시험 영역",
        "subjects": [
          "리눅스 실무의 이해",
          "리눅스 시스템 관리",
          "네트워크 및 서비스의 활용"
        ]
      }
    ],
    "departmentCourses": [
      "Linux",
      "운영체제",
      "서버·네트워크 운영"
    ],
    "relatedJobIds": [
      "system",
      "devops",
      "cloud",
      "native"
    ],
    "url": "https://www.ihd.or.kr/introducesubject1.do",
    "aliases": [
      "Linux",
      "리눅스",
      "리눅스마스터"
    ]
  },
  {
    "id": "office",
    "name": "사무자동화산업기사",
    "category": "IT 활용",
    "institution": "한국산업인력공단 (Q-Net)",
    "summary": "사무자동화 시스템과 프로그램·네트워크의 기초 지식, 사무자동화 실무 능력을 평가하는 국가기술자격입니다.",
    "examScope": [
      {
        "stage": "필기",
        "subjects": [
          "사무자동화시스템",
          "프로그래밍일반",
          "네트워크 일반"
        ]
      },
      {
        "stage": "실기",
        "subjects": [
          "사무자동화 실무"
        ]
      }
    ],
    "url": "https://www.q-net.or.kr/crf005.do?id=crf00503s02&jmCd=2193&jmInfoDivCcd=B0",
    "aliases": [
      "사무자동화",
      "오피스"
    ]
  },
  {
    "id": "computer",
    "name": "컴퓨터활용능력 1급",
    "category": "IT 활용",
    "institution": "대한상공회의소",
    "summary": "컴퓨터의 기초 지식과 스프레드시트·데이터베이스 프로그램 활용 능력을 평가하는 국가기술자격입니다.",
    "examScope": [
      {
        "stage": "필기",
        "subjects": [
          "컴퓨터 일반",
          "스프레드시트 일반",
          "데이터베이스 일반"
        ]
      },
      {
        "stage": "실기",
        "subjects": [
          "스프레드시트 실무",
          "데이터베이스 실무"
        ]
      }
    ],
    "url": "https://license.korcham.net/co/examguide.do?cd=0103&mm=21",
    "aliases": [
      "컴활",
      "컴퓨터활용",
      "Excel",
      "Access"
    ]
  },
  {
    "id": "word",
    "name": "워드프로세서",
    "category": "IT 활용",
    "institution": "대한상공회의소",
    "summary": "워드프로세서의 기초 지식과 문서 편집 능력을 평가하는 국가기술자격입니다.",
    "examScope": [
      {
        "stage": "필기",
        "subjects": [
          "워드프로세싱 용어 및 기능",
          "PC 운영체제",
          "PC 기본상식"
        ]
      },
      {
        "stage": "실기",
        "subjects": [
          "문서편집 기능"
        ]
      }
    ],
    "url": "https://ml.korcham.net/co/examguide.do?cd=01&jmcd=0102",
    "aliases": [
      "워드",
      "문서편집"
    ]
  }
];
