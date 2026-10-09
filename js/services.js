export const categories = {
  "career": {
    "id": "career",
    "label": "취업 · 진로",
    "english": "CAREER",
    "description": "목표 직무를 찾고 취업 준비 점검·입사지원·동문 연결로 이어가세요"
  },
  "learning": {
    "id": "learning",
    "label": "학습 · 역량",
    "english": "LEARNING",
    "description": "자격증·기술면접·공식 Reference와 기술 흐름을 함께 학습하세요"
  },
  "project": {
    "id": "project",
    "label": "프로젝트 · 성장",
    "english": "PROJECT & GROWTH",
    "description": "선배들의 결과물을 살펴보고 문제 해결형 졸업작품을 설계하세요"
  },
  "campus": {
    "id": "campus",
    "label": "학과 생활",
    "english": "CAMPUS LIFE",
    "description": "학습 공간과 학과 시설을 더 편리하게 이용하세요"
  }
};
export const services = [
  {
    id:"practical", name:"실기 코딩·SQL 문제은행", englishName:"PAPER FIRST PRACTICE",
    category:"learning", url:"practical.html", icon:"book", accent:"blue", order:9.5,
    description:"정보처리기사·산업기사 실기 C, Java, Python, SQL 비공식 복원기출을 직접 손으로 풀어보세요.",
    shortDescription:"실기 코딩·SQL 복원기출을 종이와 펜으로 직접 추적하세요.",
    tags:["C","Java","Python","SQL"], aliases:"실기 코딩 SQL 문제은행 종이 풀이 복원기출 정보처리기사 정보처리산업기사 오답노트", featured:false
  },
  {
    "id": "ready",
    "name": "취업 준비 점검",
    "englishName": "Career Ready",
    "category": "career",
    "description": "GitHub, 이력서, 자기소개서, 프로젝트, 자격증 등 취업 준비 현황을 등록하고 점검하는 서비스",
    "shortDescription": "취업 준비 상태를 한눈에 점검하세요.",
    "url": "https://ready.k-bigdata.kr/",
    "icon": "clipboard",
    "accent": "blue",
    "tags": [
      "GitHub",
      "이력서",
      "자기소개서",
      "프로젝트",
      "포트폴리오"
    ],
    "featured": true,
    "order": 1
  },
  {
    id:"recruit",
    name:"추천 채용공고",
    englishName:"Job Openings",
    category:"career",
    description:"학과에서 확인한 현재 채용공고를 한 곳에서 보고 지원현황 등록까지 바로 연결하는 서비스",
    shortDescription:"추천 채용공고를 확인하고 바로 지원현황에 연결하세요.",
    url:"recruit.html",
    icon:"clipboard",
    accent:"blue",
    tags:["채용공고","기업","신입","입사지원"],
    featured:true,
    order:1.5
  },
  {
    "id": "apply",
    "name": "입사지원 현황",
    "englishName": "Job Apply",
    "category": "career",
    "description": "학생별 기업 입사지원 내용을 등록하고 주간 지원 목표 및 지원 현황을 확인하는 서비스",
    "shortDescription": "지원한 기업과 주간 목표를 관리하세요.",
    "url": "https://apply.k-bigdata.kr/",
    "icon": "send",
    "accent": "indigo",
    "tags": [
      "기업지원",
      "지원직무",
      "주간목표",
      "지원이력"
    ],
    "featured": false,
    "order": 2
  },
  {
    "id": "alumni",
    "name": "졸업생 네트워크",
    "englishName": "Alumni Network",
    "category": "career",
    "description": "졸업생 정보, 채용정보, 동문소식 및 선배와의 연락을 지원하는 학과 네트워크 서비스",
    "shortDescription": "선배와 후배를 연결하는 학과 네트워크입니다.",
    "url": "https://alumni.k-bigdata.kr/",
    "icon": "users",
    "accent": "purple",
    "tags": [
      "졸업생",
      "채용정보",
      "동문소식",
      "선배연락"
    ],
    "featured": false,
    "order": 3
  },
  {
    "id": "room",
    "name": "프로젝트실 예약",
    "englishName": "Project Room",
    "category": "campus",
    "description": "빅데이터소프트웨어공학과 프로젝트실 8318호와 8319호의 예약 및 사용 현황을 확인하는 서비스",
    "shortDescription": "프로젝트실 8318 · 8319를 예약하세요.",
    "url": "https://room.k-bigdata.kr/",
    "icon": "calendar",
    "accent": "cyan",
    "tags": [
      "8318",
      "8319",
      "예약",
      "프로젝트",
      "스터디"
    ],
    "featured": false,
    "order": 4
  },
  {
    "id": "help",
    "name": "학과 요청 · 신고",
    "englishName": "Help Desk",
    "category": "campus",
    "description": "장비·시설 고장 및 학과 운영과 관련한 요청사항을 등록하고 처리상태를 확인하는 서비스",
    "shortDescription": "시설·장비 문제와 요청사항을 빠르게 접수하세요.",
    "url": "https://help.k-bigdata.kr/",
    "icon": "wrench",
    "accent": "teal",
    "tags": [
      "시설",
      "장비",
      "고장신고",
      "요청사항"
    ],
    "featured": false,
    "order": 5
  },
  {
    "id": "portfolio",
    "name": "학과 포트폴리오",
    "englishName": "Project Archive",
    "category": "project",
    "description": "졸업생과 재학생이 만든 졸업작품 및 프로젝트실습 소프트웨어의 시연 기록을 살펴보는 서비스",
    "shortDescription": "선배들의 졸업작품과 프로젝트 시연을 살펴보세요.",
    "url": "https://portfolio.k-bigdata.kr/",
    "icon": "users",
    "accent": "purple",
    "tags": [
      "졸업작품",
      "프로젝트실습",
      "시연영상",
      "아이디어"
    ],
    "featured": false,
    "order": 6
  },
  {
    "id": "project-guide",
    "name": "졸업작품 주제 가이드",
    "englishName": "Problem Solving Guide",
    "category": "project",
    "description": "기술부터 정하지 않고 실제 문제를 발견해 소프트웨어 서비스로 해결하는 주제 선정 안내",
    "shortDescription": "기존 문제를 발견하고 해결하는 졸업작품을 설계하세요.",
    "url": "project-guide.html",
    "icon": "clipboard",
    "accent": "blue",
    "tags": [
      "문제발견",
      "사용자",
      "MVP",
      "검증"
    ],
    "featured": false,
    "order": 7
  },
  {
    "id": "jobs",
    "name": "IT 직무 가이드",
    "englishName": "IT Career Guide",
    "category": "career",
    "shortDescription": "실제 IT 직무의 역할과 필요한 기술을 이해하세요.",
    "description": "실제 IT 직무의 역할과 필요한 기술을 이해하세요.",
    "icon": "users",
    "order": 0,
    "url": "jobs.html",
    "accent": "blue",
    "tags": [],
    "featured": false
  },
  {
    "id": "resume",
    "name": "자기소개서 작성 가이드",
    "englishName": "Cover Letter Guide",
    "category": "career",
    "shortDescription": "항목별 좋은·나쁜 예시와 AI 프롬프트로 자기소개서를 준비하세요.",
    "description": "신입 IT 직무 자기소개서 작성 원칙, 항목별 좋은 예시·나쁜 예시, AI 프롬프트 템플릿을 제공합니다.",
    "icon": "clipboard",
    "order": 0.5,
    "url": "resume.html",
    "accent": "indigo",
    "tags": ["자기소개서", "좋은 예시", "나쁜 예시", "AI 프롬프트"],
    "aliases": "자소서 자기소개서 작성법 지원동기 성장과정 성격 장단점 직무역량 프로젝트 협업 입사 후 포부 AI 프롬프트",
    "featured": false
  },
  {
    "id": "certifications",
    "name": "IT 자격증",
    "englishName": "IT Certifications",
    "category": "learning",
    "shortDescription": "교육과 IT 직무에 관련된 주요 자격증을 확인하세요.",
    "description": "교육과 IT 직무에 관련된 주요 자격증을 확인하세요.",
    "icon": "clipboard",
    "order": 9,
    "url": "certifications.html",
    "accent": "blue",
    "tags": [],
    "featured": false
  },
  {
    "id": "interview",
    "name": "기술면접 문제은행",
    "englishName": "Interview Practice",
    "category": "learning",
    "shortDescription": "신입 IT 기술면접 핵심 질문을 짧게 반복 연습하세요.",
    "description": "신입 IT 기술면접 핵심 질문을 짧게 반복 연습하세요.",
    "icon": "users",
    "order": 10,
    "url": "interview.html",
    "accent": "blue",
    "tags": [],
    "featured": false
  },
  {
    "id": "docs",
    "name": "개발 공식문서",
    "englishName": "Developer Docs",
    "category": "learning",
    "shortDescription": "정확한 기술 사용법과 공식 Reference를 확인하세요.",
    "description": "정확한 기술 사용법과 공식 Reference를 확인하세요.",
    "icon": "clipboard",
    "order": 11,
    "url": "docs.html",
    "accent": "blue",
    "tags": [],
    "featured": false
  },
  {
    "id": "tech-blog", "name": "기술 블로그", "englishName": "TECH BLOG",
    "category": "learning", "url": "https://prof.k-bigdata.kr/blog/",
    "description": "AI·클라우드·DevOps·빅데이터 등 최신 IT 기술과 실무 흐름을 학습하세요.",
    "shortDescription": "AI·클라우드·DevOps·빅데이터 등 최신 IT 기술과 실무 흐름을 학습하세요.",
    "source": "이협건 교수 기술 블로그", "aliases": "Kubernetes 쿠버네티스 K8s 데브옵스 클라우드 기술 변화 블로그",
    "icon": "book", "accent": "blue", "tags": ["AI", "Cloud Native", "DevOps", "Big Data"],
    "featured": false, "order": 12
  }
];

export const serviceKind = service => service.id === "tech-blog" ? "EXTERNAL" : /^https:\/\//.test(service.url) ? "SERVICE" : "GUIDE";
export const serviceAudience = service => ["ready","apply","room","help"].includes(service.id) ? "학생 운영" : service.id === "alumni" ? "동문 네트워크" : ["portfolio","tech-blog"].includes(service.id) ? "공개 참고자료" : "포털 학습";
export const isExternal = url => /^https:\/\//.test(url);
export const studentJourney = [
  {id:"jobs", title:"직무 탐색", description:"어떤 일을 하고 무엇을 준비할지 찾기"},
  {id:"docs", title:"기술 학습", description:"공식 Reference와 실무 흐름 함께 읽기", companion:"tech-blog"},
  {id:"certifications", title:"자격증·실기 준비", description:"목표 직무에 맞는 자격과 실기 연습", companion:"practical"},
  {id:"project-guide", title:"프로젝트", description:"사용자 문제를 발견하고 구현·검증하기", companion:"portfolio"},
  {id:"resume", title:"자기소개서", description:"내 경험을 직무와 연결해 설득력 있게 정리하기"},
  {id:"interview", title:"기술면접", description:"자신의 말로 설명하고 꼬리질문 연습하기"},
  {id:"ready", title:"취업 준비 점검", description:"GitHub·포트폴리오·이력서 확인하기"},
  {id:"apply", title:"입사지원", description:"실제 지원 기업과 진행 상황 관리하기"},
  {id:"alumni", title:"졸업생 네트워크", description:"선배의 경험과 채용 정보 나누기"}
];
export const quickActions = ["practical","interview","ready","apply"];
export const portalNavLinks = [
  {id:"jobs",label:"직무",group:"career"},
  {id:"resume",label:"자소서",group:"career"},
  {id:"ready",label:"취업준비",group:"career"},
  {id:"apply",label:"입사지원",group:"career"},
  {id:"alumni",label:"졸업생",group:"career"},
  {id:"certifications",label:"자격증",group:"learning"},
  {id:"practical",label:"실기",group:"learning"},
  {id:"interview",label:"기술면접",group:"learning"},
  {id:"docs",label:"공식문서",group:"learning"},
  {id:"tech-blog",label:"기술블로그 ↗",group:"learning"},
  {id:"project-guide",label:"프로젝트가이드",group:"project"},
  {id:"portfolio",label:"포트폴리오 ↗",group:"project"},
  {id:"room",label:"프로젝트실 ↗",group:"campus"},
  {id:"help",label:"학과요청 ↗",group:"campus"}
];
// Backward-compatible alias for older code/tests.
export const learningLinks = portalNavLinks;
export const footerLinks = [
  {name:"학과 공식 홈페이지", url:"https://www.kopo.ac.kr/kangseo/content.do?menu=1547"},
  {name:"학과 홍보 홈페이지", url:"https://ai.k-bigdata.kr/"},
  {name:"교수 기술 블로그", url:"https://prof.k-bigdata.kr/blog/"},
  {name:"학과 포트폴리오", url:"https://portfolio.k-bigdata.kr/"},
  {name:"프로젝트 작품전시회", url:"https://contest.k-bigdata.kr/"}
];
