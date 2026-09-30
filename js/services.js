export const categories = {
  career: { id: "career", label: "취업 · 진로", english: "CAREER", description: "취업 준비부터 실제 입사지원과 졸업생 네트워크까지" },
  campus: { id: "campus", label: "학과 생활", english: "CAMPUS LIFE", description: "학습 공간과 학과 시설을 더 편리하게 이용하세요" }
};

export const services = [
  { id: "ready", name: "취업 준비 점검", englishName: "Career Ready", category: "career", description: "GitHub, 이력서, 자기소개서, 프로젝트, 자격증 등 취업 준비 현황을 등록하고 점검하는 서비스", shortDescription: "취업 준비 상태를 한눈에 점검하세요.", url: "https://ready.k-bigdata.kr/", icon: "clipboard", accent: "blue", tags: ["GitHub", "이력서", "자기소개서", "프로젝트", "포트폴리오"], featured: true, order: 1 },
  { id: "apply", name: "입사지원 현황", englishName: "Job Apply", category: "career", description: "학생별 기업 입사지원 내용을 등록하고 주간 지원 목표 및 지원 현황을 확인하는 서비스", shortDescription: "지원한 기업과 주간 목표를 관리하세요.", url: "https://apply.k-bigdata.kr/", icon: "send", accent: "indigo", tags: ["기업지원", "지원직무", "주간목표", "지원이력"], featured: false, order: 2 },
  { id: "alumni", name: "졸업생 네트워크", englishName: "Alumni Network", category: "career", description: "졸업생 정보, 채용정보, 동문소식 및 선배와의 연락을 지원하는 학과 네트워크 서비스", shortDescription: "선배와 후배를 연결하는 학과 네트워크입니다.", url: "https://alumni.k-bigdata.kr/", icon: "users", accent: "purple", tags: ["졸업생", "채용정보", "동문소식", "선배연락"], featured: false, order: 3 },
  { id: "room", name: "프로젝트실 예약", englishName: "Project Room", category: "campus", description: "빅데이터소프트웨어공학과 프로젝트실 8318호와 8319호의 예약 및 사용 현황을 확인하는 서비스", shortDescription: "프로젝트실 8318 · 8319를 예약하세요.", url: "https://room.k-bigdata.kr/", icon: "calendar", accent: "cyan", tags: ["8318", "8319", "예약", "프로젝트", "스터디"], featured: false, order: 4 },
  { id: "help", name: "학과 요청 · 신고", englishName: "Help Desk", category: "campus", description: "장비·시설 고장 및 학과 운영과 관련한 요청사항을 등록하고 처리상태를 확인하는 서비스", shortDescription: "시설·장비 문제와 요청사항을 빠르게 접수하세요.", url: "https://help.k-bigdata.kr/", icon: "wrench", accent: "teal", tags: ["시설", "장비", "고장신고", "요청사항"], featured: false, order: 5 }
];
