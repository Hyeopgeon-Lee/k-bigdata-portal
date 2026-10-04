// Official learning hub. Stable IDs preserve existing links; all content lives here.
export const docCategories = [
  {
    "name": "Programming",
    "label": "Programming",
    "description": "언어 기초에서 웹·앱 인터페이스까지",
    "icon": "M8 5 2 12l6 7M16 5l6 7-6 7M14 3l-4 18"
  },
  {
    "name": "Backend · Security · MSA",
    "label": "Backend · Security · MSA",
    "description": "API 구현, 인증·인가와 서비스 간 통신",
    "icon": "M4 4h16v6H4zM4 14h16v6H4zM7 7h1M7 17h1"
  },
  {
    "name": "Database · Data Platform",
    "label": "Database",
    "description": "데이터 저장, SQL과 캐시",
    "icon": "M3 6c0-5 18-5 18 0s-18 5-18 0v12c0 5 18 5 18 0V6M3 12c0 5 18 5 18 0"
  },
  {
    "name": "Big Data · Streaming",
    "label": "Big Data",
    "description": "분산 저장·처리와 실시간 데이터 흐름",
    "icon": "M4 4h5v5H4zM15 4h5v5h-5zM9 15h6v6H9zM6 9v3h12V9M12 12v3"
  },
  {
    "name": "Cloud Native",
    "label": "Cloud Native",
    "description": "컨테이너, 배포·복구와 플랫폼",
    "icon": "M7 18H5a4 4 0 0 1 0-8 7 7 0 0 1 14-1 5 5 0 0 1 0 9h-2M9 14h6v7H9z"
  },
  {
    "name": "DevOps · CI/CD · Observability",
    "label": "DevOps",
    "description": "협업, 자동 배포와 운영 관측",
    "icon": "M4 19V5M4 19h17M8 15l4-5 4 2 5-7"
  },
  {
    "name": "AI · Computer Vision · LLM",
    "label": "AI · LLM",
    "description": "모델 학습, 영상 처리와 로컬 생성형 AI",
    "icon": "M7 7h10v10H7zM10 10h4v4h-4zM9 2v5M15 2v5M9 17v5M15 17v5M2 9h5M2 15h5M17 9h5M17 15h5"
  },
  {
    "name": "Open API · External Services",
    "label": "Open API",
    "description": "검증된 외부 데이터와 서비스 연결",
    "icon": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3c-6 6-6 12 0 18 6-6 6-12 0-18"
  }
];
export const docFlows = [
  {
    "title": "Big Data: 역할을 구분하세요",
    "steps": [
      "hadoop",
      "spark",
      "kafka"
    ],
    "description": "Hadoop의 HDFS는 분산 저장, Spark는 분산 처리, Kafka는 이벤트 스트리밍을 담당합니다. Hadoop에는 MapReduce 처리도 포함됩니다. 저장·처리·스트리밍 요구에 맞는 도구를 선택하세요."
  },
  {
    "title": "Cloud Native: 실행부터 배포 관리까지",
    "steps": [
      "docker",
      "kubernetes",
      "helm",
      "kpaas"
    ],
    "description": "애플리케이션 → Docker 이미지·컨테이너 → Kubernetes 운영. Helm은 배포 패키징, K-PaaS는 플랫폼 활용입니다. 프로젝트 환경에 맞게 선택하세요."
  },
  {
    "title": "DevOps: 변경을 전달하고 관측하기",
    "steps": [
      "git",
      "github",
      "actions",
      "jenkins",
      "docker",
      "kubernetes",
      "argocd",
      "prometheus",
      "grafana"
    ],
    "description": "Git·GitHub로 협업 → Actions 또는 Jenkins로 테스트·빌드 → Kubernetes·Argo CD로 배포 → Prometheus·Grafana로 관측. Actions와 Jenkins 중 프로젝트 환경에 맞는 CI 도구를 선택하세요."
  },
  {
    "title": "생성형 AI: 모델과 실행 환경",
    "steps": [
      "gemma",
      "ollama"
    ],
    "description": "Gemma는 LLM 모델 계열, Ollama는 로컬 실행 환경입니다. 모델 선택과 API 연동에 더해 데이터 이용 조건·응답 평가·오류 분석을 함께 준비하세요."
  }
];
export const docs = [
  {
    "id": "java",
    "name": "Java",
    "english": "Java",
    "category": "Programming",
    "subcategory": "",
    "overview": "백엔드·클라우드 애플리케이션을 만드는 프로그래밍 언어",
    "description": "객체와 타입을 이용해 도메인 로직을 표현합니다. 문법 다음에는 컬렉션·예외·동시성의 동작을 작은 코드와 테스트로 확인하세요.",
    "learn": [
      "OOP",
      "Collections",
      "Exception",
      "Stream",
      "Concurrency"
    ],
    "useCases": [
      "예약 시스템의 서버 로직과 테스트 구현",
      "Spring 기반 REST API 개발"
    ],
    "related": [
      "Spring Boot",
      "Spring Data JPA",
      "Docker"
    ],
    "tags": [
      "OOP",
      "Collections",
      "Exception",
      "Stream",
      "Concurrency"
    ],
    "aliases": "자바 JDK",
    "url": "https://dev.java/learn/",
    "official": true,
    "jobIds": [
      "backend",
      "native"
    ],
    "interviewCategories": [
      "Java"
    ],
    "note": ""
  },
  {
    "id": "python",
    "name": "Python",
    "english": "Python",
    "category": "Programming",
    "subcategory": "",
    "overview": "데이터 처리·AI·자동화에 사용하는 프로그래밍 언어",
    "description": "파일과 API 데이터를 다루는 기본기를 먼저 익히고 모듈·가상 환경·예외 처리를 학습합니다. 데이터 파이프라인과 추론 서비스의 공통 기반입니다.",
    "learn": [
      "Syntax",
      "Data Structures",
      "Modules",
      "Virtual Environment",
      "Exceptions"
    ],
    "useCases": [
      "공공데이터 수집과 정제 스크립트",
      "AI 모델 추론 API의 데이터 처리"
    ],
    "related": [
      "Apache Spark",
      "PyTorch",
      "Ollama"
    ],
    "tags": [
      "Syntax",
      "Data Structures",
      "Modules",
      "Virtual Environment",
      "Exceptions"
    ],
    "aliases": "파이썬",
    "url": "https://docs.python.org/3/",
    "official": true,
    "jobIds": [
      "data",
      "ai"
    ],
    "interviewCategories": [
      "AI / 빅데이터"
    ],
    "note": ""
  },
  {
    "id": "vue",
    "name": "Vue.js",
    "english": "Vue.js",
    "category": "Programming",
    "subcategory": "웹 · 앱",
    "overview": "컴포넌트 기반으로 웹 화면과 사용자 경험을 구현하는 프레임워크",
    "description": "기존 학과 학습 링크를 유지합니다. 반응형 데이터와 컴포넌트를 이해하고 API의 Loading·Empty·Error 상태를 화면에 표현하세요.",
    "learn": [
      "Component",
      "Reactivity",
      "Router",
      "State",
      "API"
    ],
    "useCases": [
      "예약 서비스의 반응형 화면",
      "데이터 대시보드의 검색과 오류 처리"
    ],
    "related": [
      "Spring Boot",
      "Kakao Maps"
    ],
    "tags": [
      "Component",
      "Reactivity",
      "Router",
      "State",
      "API"
    ],
    "aliases": "뷰 vue",
    "url": "https://vuejs.org/guide/introduction.html",
    "official": true,
    "jobIds": [
      "frontend"
    ],
    "interviewCategories": [],
    "note": ""
  },
  {
    "id": "flutter",
    "name": "Flutter",
    "english": "Flutter",
    "category": "Programming",
    "subcategory": "웹 · 앱",
    "overview": "하나의 코드 기반으로 여러 플랫폼의 앱 화면을 만드는 UI 도구",
    "description": "기존 학과 학습 링크를 유지합니다. Widget과 상태 관리, 비동기 요청을 학습하고 실제 기기에서 입력·접근성을 확인하세요.",
    "learn": [
      "Widget",
      "Dart",
      "State",
      "Async",
      "Navigation"
    ],
    "useCases": [
      "학과 안내 모바일 앱",
      "위치·날씨 데이터를 보여주는 앱"
    ],
    "related": [
      "OpenWeather API",
      "Kakao Maps"
    ],
    "tags": [
      "Widget",
      "Dart",
      "State",
      "Async",
      "Navigation"
    ],
    "aliases": "플러터",
    "url": "https://docs.flutter.dev/",
    "official": true,
    "jobIds": [
      "frontend"
    ],
    "interviewCategories": [],
    "note": ""
  },
  {
    "id": "spring",
    "name": "Spring Boot",
    "english": "Spring Boot",
    "category": "Backend · Security · MSA",
    "subcategory": "",
    "overview": "Java 기반 웹 애플리케이션과 REST API 서버 개발을 위한 Spring 프레임워크",
    "description": "자동 설정과 의존성 주입으로 서버를 구성합니다. Controller·Service의 책임을 나누고 예외 처리·검증·테스트를 함께 구현하세요.",
    "learn": [
      "REST API",
      "Controller",
      "Service",
      "Dependency Injection",
      "Spring MVC"
    ],
    "useCases": [
      "학생 신청·예약 API",
      "MSA 서비스와 클라우드 애플리케이션"
    ],
    "related": [
      "Java",
      "Spring Security",
      "PostgreSQL",
      "Redis",
      "Docker"
    ],
    "tags": [
      "REST API",
      "Controller",
      "Service",
      "Dependency Injection",
      "Spring MVC"
    ],
    "aliases": "스프링 부트 configuration",
    "url": "https://docs.spring.io/spring-boot/index.html",
    "official": true,
    "jobIds": [
      "backend",
      "native"
    ],
    "interviewCategories": [
      "Spring Boot"
    ],
    "note": ""
  },
  {
    "id": "security",
    "name": "Spring Security",
    "english": "Spring Security",
    "category": "Backend · Security · MSA",
    "subcategory": "",
    "overview": "Spring 애플리케이션의 인증과 인가를 담당하는 보안 프레임워크",
    "description": "사용자 확인과 기능별 권한 검사를 구분합니다. Filter Chain과 세션·토큰 방식을 이해하고 허용·거부 경로를 테스트하세요.",
    "learn": [
      "Authentication",
      "Authorization",
      "SecurityFilterChain",
      "OAuth2",
      "JWT"
    ],
    "useCases": [
      "로그인과 역할별 API 접근 제어",
      "외부 로그인 연동"
    ],
    "related": [
      "Spring Boot",
      "OAuth 2.0",
      "JWT"
    ],
    "tags": [
      "Authentication",
      "Authorization",
      "SecurityFilterChain",
      "OAuth2",
      "JWT"
    ],
    "aliases": "스프링 시큐리티 보안",
    "url": "https://docs.spring.io/spring-security/reference/",
    "official": true,
    "jobIds": [
      "backend",
      "native"
    ],
    "interviewCategories": [
      "Spring Boot",
      "네트워크"
    ],
    "note": ""
  },
  {
    "id": "jpa",
    "name": "Spring Data JPA",
    "english": "Spring Data JPA",
    "category": "Backend · Security · MSA",
    "subcategory": "",
    "overview": "JPA 기반 데이터 접근 코드를 Repository 중심으로 구성하는 기술",
    "description": "객체와 테이블의 관계, 영속성 컨텍스트와 트랜잭션을 학습합니다. 생성된 SQL을 확인하고 N+1 조회와 인덱스를 함께 점검하세요.",
    "learn": [
      "Repository",
      "Entity",
      "Transaction",
      "JPQL",
      "Pagination"
    ],
    "useCases": [
      "예약·주문 데이터 저장",
      "조건 검색과 페이지별 조회"
    ],
    "related": [
      "Java",
      "Spring Boot",
      "PostgreSQL"
    ],
    "tags": [
      "Repository",
      "Entity",
      "Transaction",
      "JPQL",
      "Pagination"
    ],
    "aliases": "제이피에이 ORM",
    "url": "https://docs.spring.io/spring-data/jpa/reference/",
    "official": true,
    "jobIds": [
      "backend"
    ],
    "interviewCategories": [
      "데이터베이스 / SQL"
    ],
    "note": ""
  },
  {
    "id": "spring-cloud",
    "name": "Spring Cloud",
    "english": "Spring Cloud",
    "category": "Backend · Security · MSA",
    "subcategory": "",
    "overview": "분산 서비스의 설정·라우팅·서비스 통신을 지원하는 Spring 도구 모음",
    "description": "단일 라이브러리가 아닌 여러 프로젝트의 모음입니다. 서비스 분리가 필요한 이유와 장애 전파를 먼저 이해하고 Boot와 호환되는 버전을 선택하세요.",
    "learn": [
      "MSA",
      "Config",
      "Gateway",
      "Discovery",
      "Circuit Breaker"
    ],
    "useCases": [
      "환경별 설정 관리",
      "API Gateway와 장애 격리 구현"
    ],
    "related": [
      "Spring Boot",
      "OpenFeign",
      "Spring HTTP Service Client",
      "Kubernetes"
    ],
    "tags": [
      "MSA",
      "Config",
      "Gateway",
      "Discovery",
      "Circuit Breaker"
    ],
    "aliases": "스프링 클라우드",
    "url": "https://spring.io/projects/spring-cloud/",
    "official": true,
    "jobIds": [
      "native"
    ],
    "interviewCategories": [
      "MSA"
    ],
    "note": ""
  },
  {
    "id": "http-client",
    "name": "Spring HTTP Service Client",
    "english": "Spring HTTP Service Client",
    "category": "Backend · Security · MSA",
    "subcategory": "",
    "overview": "Java 인터페이스로 HTTP API 호출을 선언하는 Spring의 클라이언트 기능",
    "description": "HTTP Interface에 요청 규칙을 선언하고 클라이언트와 연결합니다. Timeout·응답 오류·재시도 정책을 설계하여 서비스 간 호출 실패를 다루세요.",
    "learn": [
      "HTTP Interface",
      "HttpExchange",
      "RestClient",
      "WebClient",
      "Timeout"
    ],
    "useCases": [
      "외부 OpenAPI 연동",
      "MSA 서비스 간 REST 호출"
    ],
    "related": [
      "Spring Boot",
      "Spring Cloud",
      "OpenFeign"
    ],
    "tags": [
      "HTTP Interface",
      "HttpExchange",
      "RestClient",
      "WebClient",
      "Timeout"
    ],
    "aliases": "Spring HTTP Interface HTTP Service Clients",
    "url": "https://docs.spring.io/spring-framework/reference/integration/rest-clients.html#rest-http-interface",
    "official": true,
    "jobIds": [
      "backend",
      "native"
    ],
    "interviewCategories": [
      "MSA",
      "네트워크"
    ],
    "note": ""
  },
  {
    "id": "openfeign",
    "name": "OpenFeign",
    "english": "OpenFeign",
    "category": "Backend · Security · MSA",
    "subcategory": "",
    "overview": "인터페이스 선언으로 서비스 간 REST API 호출을 구현하는 기술",
    "description": "Spring Cloud 통합 기능으로 요청·응답 매핑을 구성합니다. 기존 MSA 코드를 이해하는 데 활용하고 신규 개발에서는 HTTP Service Client도 비교하세요.",
    "learn": [
      "FeignClient",
      "REST API",
      "Encoder",
      "Decoder",
      "Timeout"
    ],
    "useCases": [
      "기존 MSA의 서비스 통신",
      "외부 API 클라이언트 구성"
    ],
    "related": [
      "Spring Cloud",
      "Spring HTTP Service Client"
    ],
    "tags": [
      "FeignClient",
      "REST API",
      "Encoder",
      "Decoder",
      "Timeout"
    ],
    "aliases": "오픈페인 feign",
    "url": "https://docs.spring.io/spring-cloud-openfeign/reference/",
    "official": true,
    "jobIds": [
      "native"
    ],
    "interviewCategories": [
      "MSA"
    ],
    "note": "Spring 공식 안내는 OpenFeign을 기능 완성(feature-complete) 상태로 설명하며 Spring HTTP Service Clients로 전환을 권고합니다."
  },
  {
    "id": "oauth",
    "name": "OAuth 2.0",
    "english": "OAuth 2.0",
    "category": "Backend · Security · MSA",
    "subcategory": "",
    "overview": "외부 애플리케이션에 자원 접근 권한을 위임하는 표준",
    "description": "OAuth는 권한 위임이며 자체로 사용자 신원 확인 규격은 아닙니다. 로그인에는 OpenID Connect 등과의 관계를 이해하고 Authorization Code·PKCE 흐름을 학습하세요.",
    "learn": [
      "Authorization Code",
      "PKCE",
      "Access Token",
      "Scope",
      "Redirect URI"
    ],
    "useCases": [
      "외부 로그인·권한 위임의 흐름 설계",
      "API 접근 범위 제한"
    ],
    "related": [
      "Spring Security",
      "JWT",
      "Naver Developers",
      "Kakao Developers"
    ],
    "tags": [
      "Authorization Code",
      "PKCE",
      "Access Token",
      "Scope",
      "Redirect URI"
    ],
    "aliases": "oauth2 오어스 OIDC",
    "url": "https://www.rfc-editor.org/rfc/rfc6749",
    "official": true,
    "jobIds": [
      "backend"
    ],
    "interviewCategories": [
      "네트워크"
    ],
    "note": "RFC 6749와 함께 최신 보안 권고 RFC 9700을 확인하세요. 오래된 예제의 비밀번호 직접 전달 방식은 권장하지 않습니다."
  },
  {
    "id": "jwt",
    "name": "JWT",
    "english": "JWT",
    "category": "Backend · Security · MSA",
    "subcategory": "",
    "overview": "서명 또는 암호화 가능한 Claim 전달용 JSON 토큰 형식",
    "description": "JWT는 인증 시스템 자체가 아닙니다. 서명 검증·만료·발급자·대상 검사를 구현하고 단순 Base64 디코딩을 신뢰하지 마세요.",
    "learn": [
      "Claims",
      "Signature",
      "Expiration",
      "Issuer",
      "Audience"
    ],
    "useCases": [
      "토큰 기반 API 접근 제어",
      "서비스 간 Claim 전달"
    ],
    "related": [
      "Spring Security",
      "OAuth 2.0"
    ],
    "tags": [
      "Claims",
      "Signature",
      "Expiration",
      "Issuer",
      "Audience"
    ],
    "aliases": "JSON Web Token 제이더블유티",
    "url": "https://www.rfc-editor.org/rfc/rfc7519",
    "official": true,
    "jobIds": [
      "backend"
    ],
    "interviewCategories": [
      "네트워크"
    ],
    "note": "서명된 JWT의 Payload는 기본적으로 비밀이 아닙니다. 민감정보를 담지 않고 RFC 8725의 보안 권고도 확인하세요."
  },
  {
    "id": "postgresql",
    "name": "PostgreSQL",
    "english": "PostgreSQL",
    "category": "Database · Data Platform",
    "subcategory": "",
    "overview": "관계형 데이터를 저장하고 SQL로 조회하는 데이터베이스",
    "description": "테이블·관계·제약 조건부터 학습하고 JOIN·트랜잭션·인덱스를 실제 실행 계획으로 확인합니다. 백업과 복구도 프로젝트 운영의 일부입니다.",
    "learn": [
      "SQL",
      "JOIN",
      "Transaction",
      "Index",
      "EXPLAIN"
    ],
    "useCases": [
      "신청·예약 서비스의 관계형 데이터 저장",
      "데이터 파이프라인 적재와 품질 검사"
    ],
    "related": [
      "Spring Data JPA",
      "Python",
      "Redis",
      "Apache Spark"
    ],
    "tags": [
      "SQL",
      "JOIN",
      "Transaction",
      "Index",
      "EXPLAIN"
    ],
    "aliases": "포스트그레스 데이터베이스 DB",
    "url": "https://www.postgresql.org/docs/",
    "official": true,
    "jobIds": [
      "backend",
      "data",
      "cloud"
    ],
    "interviewCategories": [
      "데이터베이스 / SQL"
    ],
    "note": ""
  },
  {
    "id": "redis",
    "name": "Redis",
    "english": "Redis",
    "category": "Database · Data Platform",
    "subcategory": "",
    "overview": "메모리 중심 데이터 저장으로 빠른 조회와 캐시를 지원하는 기술",
    "description": "Cache·Session·Pub/Sub에 활용합니다. TTL과 캐시 무효화, 장애 시 원본 DB로 돌아가는 흐름을 설계하고 영속성 옵션을 구분하세요.",
    "learn": [
      "Cache",
      "TTL",
      "Session",
      "Pub/Sub",
      "Persistence"
    ],
    "useCases": [
      "Spring Boot API 조회 캐시",
      "세션 공유와 이벤트 알림"
    ],
    "related": [
      "Spring Boot",
      "PostgreSQL",
      "Docker"
    ],
    "tags": [
      "Cache",
      "TTL",
      "Session",
      "Pub/Sub",
      "Persistence"
    ],
    "aliases": "레디스 인메모리",
    "url": "https://redis.io/docs/latest/",
    "official": true,
    "jobIds": [
      "backend"
    ],
    "interviewCategories": [
      "데이터베이스 / SQL"
    ],
    "note": ""
  },
  {
    "id": "hadoop",
    "name": "Apache Hadoop",
    "english": "Apache Hadoop",
    "category": "Big Data · Streaming",
    "subcategory": "",
    "overview": "여러 서버에 대용량 데이터를 분산 저장하고 처리하는 플랫폼",
    "description": "HDFS로 데이터를 나누어 저장하고 YARN으로 처리 자원을 관리합니다. MapReduce는 분산 처리 방식이며 Spark와 역할을 비교할 수 있습니다.",
    "learn": [
      "HDFS",
      "YARN",
      "MapReduce",
      "Cluster",
      "Distributed Storage"
    ],
    "useCases": [
      "대용량 로그의 분산 저장",
      "빅데이터 플랫폼 구성"
    ],
    "related": [
      "Apache Spark",
      "Apache Kafka",
      "Python"
    ],
    "tags": [
      "HDFS",
      "YARN",
      "MapReduce",
      "Cluster",
      "Distributed Storage"
    ],
    "aliases": "하둡 빅데이터 분산저장",
    "url": "https://hadoop.apache.org/docs/stable/",
    "official": true,
    "jobIds": [
      "data"
    ],
    "interviewCategories": [
      "AI / 빅데이터"
    ],
    "note": ""
  },
  {
    "id": "spark",
    "name": "Apache Spark",
    "english": "Apache Spark",
    "category": "Big Data · Streaming",
    "subcategory": "",
    "overview": "대규모 데이터를 클러스터에서 병렬 처리하는 분산 데이터 처리 엔진",
    "description": "DataFrame·SQL로 ETL과 분석을 수행합니다. Partition과 Shuffle이 실행 비용에 미치는 영향을 확인하고 배치·스트리밍의 차이를 이해하세요.",
    "learn": [
      "RDD",
      "DataFrame",
      "Spark SQL",
      "PySpark",
      "Streaming"
    ],
    "useCases": [
      "공공데이터 ETL과 대용량 분석",
      "로그 처리·배치 데이터 파이프라인"
    ],
    "related": [
      "Apache Hadoop",
      "Apache Kafka",
      "Python",
      "Kubernetes"
    ],
    "tags": [
      "RDD",
      "DataFrame",
      "Spark SQL",
      "PySpark",
      "Streaming"
    ],
    "aliases": "스파크 pyspark 빅데이터 분산처리 cluster",
    "url": "https://spark.apache.org/docs/latest/",
    "official": true,
    "jobIds": [
      "data"
    ],
    "interviewCategories": [
      "AI / 빅데이터"
    ],
    "note": ""
  },
  {
    "id": "kafka",
    "name": "Apache Kafka",
    "english": "Apache Kafka",
    "category": "Big Data · Streaming",
    "subcategory": "",
    "overview": "대규모 실시간 이벤트를 저장하고 전달하는 분산 스트리밍 플랫폼",
    "description": "Producer가 Topic에 이벤트를 기록하고 Consumer가 자신의 위치를 관리하며 읽습니다. Partition·Consumer Group과 재처리·중복 처리 전략을 학습하세요.",
    "learn": [
      "Producer",
      "Consumer",
      "Topic",
      "Partition",
      "Consumer Group"
    ],
    "useCases": [
      "실시간 로그 파이프라인",
      "MSA 이벤트와 데이터 스트리밍"
    ],
    "related": [
      "Apache Spark",
      "Apache Hadoop",
      "Spring Boot"
    ],
    "tags": [
      "Producer",
      "Consumer",
      "Topic",
      "Partition",
      "Consumer Group"
    ],
    "aliases": "카프카 빅데이터 broker",
    "url": "https://kafka.apache.org/documentation/",
    "official": true,
    "jobIds": [
      "data",
      "native"
    ],
    "interviewCategories": [
      "MSA",
      "AI / 빅데이터"
    ],
    "note": ""
  },
  {
    "id": "docker",
    "name": "Docker",
    "english": "Docker",
    "category": "Cloud Native",
    "subcategory": "",
    "overview": "애플리케이션과 실행 의존성을 이미지로 묶어 컨테이너로 실행하는 도구",
    "description": "컨테이너는 호스트 커널을 공유하는 격리된 실행 환경입니다. Dockerfile·Image·Registry와 Volume·Network를 구분하고 작은 이미지를 재현 가능하게 빌드하세요.",
    "learn": [
      "Container",
      "Dockerfile",
      "Image",
      "Registry",
      "Volume",
      "Network"
    ],
    "useCases": [
      "API·DB 개발 환경 재현",
      "CI에서 배포 이미지 빌드"
    ],
    "related": [
      "Spring Boot",
      "Kubernetes",
      "GitHub Actions"
    ],
    "tags": [
      "Container",
      "Dockerfile",
      "Image",
      "Registry",
      "Volume"
    ],
    "aliases": "도커 network",
    "url": "https://docs.docker.com/",
    "official": true,
    "jobIds": [
      "backend",
      "native",
      "devops",
      "cloud",
      "ai"
    ],
    "interviewCategories": [
      "Docker"
    ],
    "note": ""
  },
  {
    "id": "kubernetes",
    "name": "Kubernetes",
    "english": "Kubernetes",
    "category": "Cloud Native",
    "subcategory": "",
    "overview": "컨테이너 애플리케이션의 배포·확장·복구를 관리하는 플랫폼",
    "description": "Pod가 실행 단위이며 Deployment가 원하는 상태를 유지합니다. Service·설정·Secret·Probe를 조합하고 장애를 직접 재현해 복구를 확인하세요.",
    "learn": [
      "Pod",
      "Deployment",
      "Service",
      "ConfigMap",
      "Secret",
      "Ingress",
      "Namespace",
      "Scaling"
    ],
    "useCases": [
      "예약 API의 여러 복제본 운영",
      "상태 검사와 자동 복구·확장"
    ],
    "related": [
      "Docker",
      "Helm",
      "K-PaaS",
      "Argo CD",
      "Prometheus"
    ],
    "tags": [
      "Pod",
      "Deployment",
      "Service",
      "ConfigMap",
      "Secret"
    ],
    "aliases": "쿠버네티스 k8s ingress namespace scaling",
    "url": "https://kubernetes.io/docs/home/",
    "official": true,
    "jobIds": [
      "native",
      "devops",
      "cloud"
    ],
    "interviewCategories": [
      "Kubernetes"
    ],
    "note": ""
  },
  {
    "id": "helm",
    "name": "Helm",
    "english": "Helm",
    "category": "Cloud Native",
    "subcategory": "",
    "overview": "Chart로 Kubernetes 애플리케이션의 패키징과 배포를 관리하는 도구",
    "description": "반복되는 매니페스트를 Template과 Values로 정리합니다. 환경별 설정을 나누고 Release 변경·Rollback을 테스트하세요.",
    "learn": [
      "Chart",
      "Values",
      "Template",
      "Release",
      "Rollback"
    ],
    "useCases": [
      "개발·운영 환경별 배포 설정",
      "여러 리소스를 묶은 앱 설치"
    ],
    "related": [
      "Kubernetes",
      "Argo CD",
      "K-PaaS"
    ],
    "tags": [
      "Chart",
      "Values",
      "Template",
      "Release",
      "Rollback"
    ],
    "aliases": "헬름",
    "url": "https://helm.sh/docs/",
    "official": true,
    "jobIds": [
      "native",
      "devops",
      "cloud"
    ],
    "interviewCategories": [
      "Kubernetes"
    ],
    "note": ""
  },
  {
    "id": "kpaas",
    "name": "K-PaaS",
    "english": "K-PaaS",
    "category": "Cloud Native",
    "subcategory": "",
    "overview": "개방형 클라우드 플랫폼의 구성과 애플리케이션 배포를 배우는 학과 연계 기술",
    "description": "공식 포털에서 플랫폼 문서와 배포 가이드를 찾아 사용 중인 구성에 맞게 학습합니다. Container Platform·Kubernetes·PaaS의 역할을 구분하세요.",
    "learn": [
      "Cloud Native",
      "Container Platform",
      "Kubernetes",
      "PaaS",
      "Deployment"
    ],
    "useCases": [
      "학과 프로젝트의 플랫폼 배포",
      "클라우드 네이티브 서비스 운영 실습"
    ],
    "related": [
      "Docker",
      "Kubernetes",
      "Helm",
      "Spring Boot"
    ],
    "tags": [
      "Cloud Native",
      "Container Platform",
      "Kubernetes",
      "PaaS",
      "Deployment"
    ],
    "aliases": "케이파스 클라우드 K PaaS",
    "url": "https://k-paas.or.kr/",
    "official": true,
    "jobIds": [
      "native",
      "cloud"
    ],
    "interviewCategories": [
      "Cloud"
    ],
    "note": ""
  },
  {
    "id": "git",
    "name": "Git",
    "english": "Git",
    "category": "DevOps · CI/CD · Observability",
    "subcategory": "",
    "overview": "코드 변경 이력과 여러 작업 흐름을 관리하는 분산 버전관리 도구",
    "description": "의미 있는 Commit과 Branch로 작업을 나눕니다. Merge 충돌 해결과 Rebase의 이력 변경을 이해하고 공유 이력을 신중히 다루세요.",
    "learn": [
      "Commit",
      "Branch",
      "Merge",
      "Rebase",
      "Remote"
    ],
    "useCases": [
      "팀 프로젝트의 변경 추적",
      "기능별 개발과 코드 복구"
    ],
    "related": [
      "GitHub",
      "GitHub Actions",
      "Argo CD"
    ],
    "tags": [
      "Commit",
      "Branch",
      "Merge",
      "Rebase",
      "Remote"
    ],
    "aliases": "깃 버전관리",
    "url": "https://git-scm.com/docs",
    "official": true,
    "jobIds": [
      "backend",
      "native",
      "devops",
      "cloud",
      "data",
      "ai",
      "frontend"
    ],
    "interviewCategories": [
      "DevOps"
    ],
    "note": ""
  },
  {
    "id": "github",
    "name": "GitHub",
    "english": "GitHub",
    "category": "DevOps · CI/CD · Observability",
    "subcategory": "",
    "overview": "Git 저장소를 중심으로 코드 리뷰·이슈·자동화를 협업하는 플랫폼",
    "description": "Repository의 README와 Issues로 문제·작업을 기록하고 Pull Request에서 변경 이유·테스트 근거를 공유합니다. Pages는 정적 사이트 배포에 활용합니다.",
    "learn": [
      "Repository",
      "Pull Request",
      "Issues",
      "Actions",
      "Pages"
    ],
    "useCases": [
      "팀 코드 리뷰와 작업 관리",
      "포트폴리오·정적 사이트 공개"
    ],
    "related": [
      "Git",
      "GitHub Actions"
    ],
    "tags": [
      "Repository",
      "Pull Request",
      "Issues",
      "Actions",
      "Pages"
    ],
    "aliases": "깃허브 collaboration",
    "url": "https://docs.github.com/en",
    "official": true,
    "jobIds": [
      "devops",
      "frontend"
    ],
    "interviewCategories": [
      "DevOps"
    ],
    "note": ""
  },
  {
    "id": "actions",
    "name": "GitHub Actions",
    "english": "GitHub Actions",
    "category": "DevOps · CI/CD · Observability",
    "subcategory": "",
    "overview": "GitHub 저장소 이벤트를 이용해 테스트·빌드·배포를 자동화하는 기능",
    "description": "Workflow 안의 Job·Step이 Runner에서 실행됩니다. 최소 권한과 Secret을 설정하고 테스트 실패 시 배포를 차단하세요.",
    "learn": [
      "Workflow",
      "Job",
      "Step",
      "Runner",
      "CI/CD"
    ],
    "useCases": [
      "Pull Request 자동 테스트",
      "Docker 이미지 빌드·배포 자동화"
    ],
    "related": [
      "GitHub",
      "Docker",
      "Kubernetes",
      "Argo CD"
    ],
    "tags": [
      "Workflow",
      "Job",
      "Step",
      "Runner",
      "CI/CD"
    ],
    "aliases": "깃허브 액션",
    "url": "https://docs.github.com/en/actions",
    "official": true,
    "jobIds": [
      "devops"
    ],
    "interviewCategories": [
      "DevOps"
    ],
    "note": ""
  },
  {
    "id": "jenkins",
    "name": "Jenkins",
    "english": "Jenkins",
    "category": "DevOps · CI/CD · Observability",
    "subcategory": "",
    "overview": "Pipeline으로 테스트·빌드·배포를 자동화하는 오픈소스 서버",
    "description": "Jenkinsfile에 단계와 실패 처리를 기록합니다. Agent·Credential을 안전하게 구성하고 빌드 결과·배포 로그를 추적하세요.",
    "learn": [
      "Pipeline",
      "Jenkinsfile",
      "Build",
      "Test",
      "Deploy"
    ],
    "useCases": [
      "API 테스트·이미지 빌드 파이프라인",
      "환경별 승인과 배포 자동화"
    ],
    "related": [
      "Git",
      "Docker",
      "Kubernetes",
      "Argo CD"
    ],
    "tags": [
      "Pipeline",
      "Jenkinsfile",
      "Build",
      "Test",
      "Deploy"
    ],
    "aliases": "젠킨스 CI/CD",
    "url": "https://www.jenkins.io/doc/",
    "official": true,
    "jobIds": [
      "devops",
      "cloud"
    ],
    "interviewCategories": [
      "DevOps"
    ],
    "note": ""
  },
  {
    "id": "argocd",
    "name": "Argo CD",
    "english": "Argo CD",
    "category": "DevOps · CI/CD · Observability",
    "subcategory": "",
    "overview": "Git의 선언적 설정을 Kubernetes에 동기화하는 GitOps 지속적 배포 도구",
    "description": "빌드를 수행하는 CI 도구와 역할이 다릅니다. Git의 원하는 상태와 클러스터 상태를 비교하고 Sync·Health·변경 검토를 운영하세요.",
    "learn": [
      "GitOps",
      "Application",
      "Sync",
      "Health",
      "Deployment"
    ],
    "useCases": [
      "Git 기반 Kubernetes 배포",
      "환경 상태 차이 추적"
    ],
    "related": [
      "Git",
      "Kubernetes",
      "Helm",
      "GitHub Actions"
    ],
    "tags": [
      "GitOps",
      "Application",
      "Sync",
      "Health",
      "Deployment"
    ],
    "aliases": "아르고 씨디 argocd CI/CD",
    "url": "https://argo-cd.readthedocs.io/en/stable/",
    "official": true,
    "jobIds": [
      "devops",
      "cloud",
      "native"
    ],
    "interviewCategories": [
      "DevOps",
      "Kubernetes"
    ],
    "note": ""
  },
  {
    "id": "prometheus",
    "name": "Prometheus",
    "english": "Prometheus",
    "category": "DevOps · CI/CD · Observability",
    "subcategory": "",
    "overview": "시스템의 Metric을 수집하고 질의·알림에 사용하는 모니터링 도구",
    "description": "수치형 시계열 데이터를 수집합니다. Exporter·Label·PromQL을 학습하고 로그·트레이스와 메트릭의 차이를 구분하세요.",
    "learn": [
      "Metrics",
      "Exporter",
      "PromQL",
      "Alert",
      "Time Series"
    ],
    "useCases": [
      "API 지연·오류율 관측",
      "클러스터 자원과 장애 알림"
    ],
    "related": [
      "Grafana",
      "Kubernetes",
      "Spring Boot"
    ],
    "tags": [
      "Metrics",
      "Exporter",
      "PromQL",
      "Alert",
      "Time Series"
    ],
    "aliases": "프로메테우스 observability",
    "url": "https://prometheus.io/docs/introduction/overview/",
    "official": true,
    "jobIds": [
      "devops",
      "cloud",
      "native"
    ],
    "interviewCategories": [
      "DevOps"
    ],
    "note": ""
  },
  {
    "id": "grafana",
    "name": "Grafana",
    "english": "Grafana",
    "category": "DevOps · CI/CD · Observability",
    "subcategory": "",
    "overview": "여러 데이터 소스를 대시보드로 시각화하는 관측 도구",
    "description": "Prometheus 등을 연결해 지표의 시간 변화와 상관관계를 봅니다. 의미 있는 단위·기간·임계값을 사용하고 장애 확인에 필요한 화면을 설계하세요.",
    "learn": [
      "Dashboard",
      "Visualization",
      "Monitoring",
      "Alerting",
      "Data Source"
    ],
    "useCases": [
      "API 운영 지표 대시보드",
      "배포 전후 성능과 자원 비교"
    ],
    "related": [
      "Prometheus",
      "Kubernetes"
    ],
    "tags": [
      "Dashboard",
      "Visualization",
      "Monitoring",
      "Alerting",
      "Data Source"
    ],
    "aliases": "그라파나 observability",
    "url": "https://grafana.com/docs/grafana/latest/",
    "official": true,
    "jobIds": [
      "devops",
      "cloud"
    ],
    "interviewCategories": [
      "DevOps"
    ],
    "note": ""
  },
  {
    "id": "tensorflow",
    "name": "TensorFlow",
    "english": "TensorFlow",
    "category": "AI · Computer Vision · LLM",
    "subcategory": "모델 학습 · 영상 처리",
    "overview": "딥러닝 모델 학습과 추론을 구현하는 플랫폼",
    "description": "데이터 분리와 평가 기준을 정한 뒤 신경망을 학습합니다. GPU 사용 여부와 배포 환경의 제약을 확인하고 모델 저장·추론을 연결하세요.",
    "learn": [
      "Deep Learning",
      "Neural Network",
      "GPU",
      "Training",
      "Inference"
    ],
    "useCases": [
      "이미지 분류 모델과 추론 API",
      "모델별 정확도·지연 시간 비교"
    ],
    "related": [
      "Python",
      "OpenCV",
      "Docker",
      "PyTorch"
    ],
    "tags": [
      "Deep Learning",
      "Neural Network",
      "GPU",
      "Training",
      "Inference"
    ],
    "aliases": "텐서플로",
    "url": "https://www.tensorflow.org/learn",
    "official": true,
    "jobIds": [
      "ai"
    ],
    "interviewCategories": [
      "AI / 빅데이터"
    ],
    "note": ""
  },
  {
    "id": "pytorch",
    "name": "PyTorch",
    "english": "PyTorch",
    "category": "AI · Computer Vision · LLM",
    "subcategory": "모델 학습 · 영상 처리",
    "overview": "Tensor와 자동 미분으로 딥러닝 학습·추론을 구현하는 프레임워크",
    "description": "Training Loop와 데이터 로더를 이해하고 평가 모드·추론 모드를 구분합니다. 재현 가능한 실험과 오류 분석을 프로젝트에 기록하세요.",
    "learn": [
      "Tensor",
      "Autograd",
      "GPU",
      "Training",
      "Inference"
    ],
    "useCases": [
      "객체인식 모델 학습과 비교 실험",
      "AI 추론 서비스 구현"
    ],
    "related": [
      "Python",
      "OpenCV",
      "TensorFlow",
      "Docker"
    ],
    "tags": [
      "Tensor",
      "Autograd",
      "GPU",
      "Training",
      "Inference"
    ],
    "aliases": "파이토치",
    "url": "https://docs.pytorch.org/docs/stable/index.html",
    "official": true,
    "jobIds": [
      "ai"
    ],
    "interviewCategories": [
      "AI / 빅데이터"
    ],
    "note": ""
  },
  {
    "id": "opencv",
    "name": "OpenCV",
    "english": "OpenCV",
    "category": "AI · Computer Vision · LLM",
    "subcategory": "모델 학습 · 영상 처리",
    "overview": "이미지·동영상 처리와 Computer Vision을 구현하는 라이브러리",
    "description": "색 공간·크기·전처리와 카메라 입력을 학습합니다. 객체인식 프로젝트에서는 모델 입출력과 연결하고 조명·각도별 오류를 기록하세요.",
    "learn": [
      "Computer Vision",
      "Image Processing",
      "Video",
      "Camera",
      "Object Detection"
    ],
    "useCases": [
      "카메라 기반 객체인식 프로젝트",
      "영상 전처리와 탐지 결과 시각화"
    ],
    "related": [
      "Python",
      "PyTorch",
      "TensorFlow"
    ],
    "tags": [
      "Computer Vision",
      "Image Processing",
      "Video",
      "Camera",
      "Object Detection"
    ],
    "aliases": "오픈씨브이 객체인식",
    "url": "https://docs.opencv.org/4.x/",
    "official": true,
    "jobIds": [
      "ai"
    ],
    "interviewCategories": [
      "AI / 빅데이터"
    ],
    "note": ""
  },
  {
    "id": "ollama",
    "name": "Ollama",
    "english": "Ollama",
    "category": "AI · Computer Vision · LLM",
    "subcategory": "LLM · Generative AI",
    "overview": "LLM을 로컬 PC나 GPU 서버에서 실행하고 API로 사용하는 도구",
    "description": "모델을 내려받아 실행하고 REST API로 서비스와 연결합니다. 모델 자체가 아닌 실행 환경이며 RAM·VRAM·라이선스·응답 품질을 확인하세요.",
    "learn": [
      "Local LLM",
      "Model Pull",
      "Model Run",
      "REST API",
      "Inference"
    ],
    "useCases": [
      "문서 질의·RAG·AI Agent의 로컬 추론",
      "사용자 질문에 대한 생성 결과 평가"
    ],
    "related": [
      "Gemma",
      "Python",
      "Docker"
    ],
    "tags": [
      "Local LLM",
      "Model Pull",
      "Model Run",
      "REST API",
      "Inference"
    ],
    "aliases": "올라마 로컬 LLM prompt 생성형 AI",
    "url": "https://docs.ollama.com/",
    "official": true,
    "jobIds": [
      "ai"
    ],
    "interviewCategories": [
      "AI / 빅데이터"
    ],
    "note": "모델 이용 조건, 입력 데이터의 개인정보, 응답 오류를 확인하세요."
  },
  {
    "id": "gemma",
    "name": "Gemma",
    "english": "Gemma",
    "category": "AI · Computer Vision · LLM",
    "subcategory": "LLM · Generative AI",
    "overview": "Google의 공개 가중치 기반 생성형 AI 모델 계열",
    "description": "Gemma는 모델이고 Ollama는 모델을 실행할 수 있는 환경입니다. 모델별 지원 기능·메모리·이용 조건을 확인하고 동일한 평가 데이터로 결과를 비교하세요.",
    "learn": [
      "LLM",
      "Prompt",
      "Inference",
      "Fine-tuning",
      "Local Deployment"
    ],
    "useCases": [
      "로컬 생성형 AI의 모델 비교",
      "문서 질의 응답의 품질·지연 평가"
    ],
    "related": [
      "Ollama",
      "Python",
      "PyTorch"
    ],
    "tags": [
      "LLM",
      "Prompt",
      "Inference",
      "Fine-tuning",
      "Local Deployment"
    ],
    "aliases": "젬마 제미마 생성형 AI",
    "url": "https://ai.google.dev/gemma/docs",
    "official": true,
    "jobIds": [
      "ai"
    ],
    "interviewCategories": [
      "AI / 빅데이터"
    ],
    "note": "Gemma 이용 조건을 확인하고 Fine-tuning은 개념부터 학습하세요."
  },
  {
    "id": "publicdata",
    "name": "공공데이터포털 OpenAPI",
    "english": "공공데이터포털 OpenAPI",
    "category": "Open API · External Services",
    "subcategory": "",
    "overview": "공공기관의 교통·행정·복지 등 데이터를 API로 조회하는 공식 포털",
    "description": "데이터셋별 활용 신청·키·응답 형식·갱신 주기를 확인합니다. 전체 공공데이터가 API 형태이거나 실시간인 것은 아닙니다.",
    "learn": [
      "OpenAPI",
      "REST API",
      "JSON/XML",
      "API Key",
      "Pagination"
    ],
    "useCases": [
      "지역 복지·교통 정보 서비스",
      "공공 통계 데이터 수집 파이프라인"
    ],
    "related": [
      "Python",
      "Spring HTTP Service Client",
      "PostgreSQL"
    ],
    "tags": [
      "OpenAPI",
      "REST API",
      "JSON/XML",
      "API Key",
      "Pagination"
    ],
    "aliases": "공공 데이터 기상 행정 복지 지역정보 통계",
    "url": "https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do",
    "official": true,
    "jobIds": [
      "backend",
      "data"
    ],
    "interviewCategories": [
      "네트워크"
    ],
    "note": ""
  },
  {
    "id": "weather",
    "name": "OpenWeather API",
    "english": "OpenWeather API",
    "category": "Open API · External Services",
    "subcategory": "",
    "overview": "날씨·예보·온도·습도 등의 기상 데이터를 REST API로 제공하는 서비스",
    "description": "위치와 요청 단위·시간대를 지정해 날씨 데이터를 가져옵니다. 제공 API별 범위·요금·호출 한도를 확인하고 장애 시 대체 화면을 만드세요.",
    "learn": [
      "Weather",
      "Forecast",
      "REST API",
      "API Key",
      "Coordinates"
    ],
    "useCases": [
      "날씨 기반 활동 추천",
      "도시별 날씨 비교와 캐시"
    ],
    "related": [
      "Python",
      "Spring HTTP Service Client",
      "Redis"
    ],
    "tags": [
      "Weather",
      "Forecast",
      "REST API",
      "API Key",
      "Coordinates"
    ],
    "aliases": "날씨 API 오픈웨더 기상 온도 습도",
    "url": "https://openweathermap.org/api",
    "official": true,
    "jobIds": [
      "backend",
      "frontend",
      "data"
    ],
    "interviewCategories": [
      "네트워크"
    ],
    "note": ""
  },
  {
    "id": "naver",
    "name": "Naver Developers",
    "english": "Naver Developers",
    "category": "Open API · External Services",
    "subcategory": "",
    "overview": "네이버 검색·로그인 등 공개 API의 공식 개발자 안내",
    "description": "현재 제품 안내의 검색·로그인 기능을 중심으로 학습합니다. 공통 가이드의 오래된 API 예시만 보고 구현하지 말고 개별 서비스 제공 여부를 확인하세요.",
    "learn": [
      "Search API",
      "Login",
      "OAuth2",
      "REST API",
      "Client ID"
    ],
    "useCases": [
      "검색 결과를 활용한 정보 탐색",
      "네이버 로그인 연동"
    ],
    "related": [
      "OAuth 2.0",
      "Spring Security",
      "Naver Maps"
    ],
    "tags": [
      "Search API",
      "Login",
      "OAuth2",
      "REST API",
      "Client ID"
    ],
    "aliases": "네이버 개발자 검색 API",
    "url": "https://developers.naver.com/products/intro/plan/plan.md",
    "official": true,
    "jobIds": [
      "backend",
      "frontend"
    ],
    "interviewCategories": [
      "네트워크"
    ],
    "note": "프로젝트에서 사용할 API의 인증 방식·호출 한도·요금을 확인하세요."
  },
  {
    "id": "naver-maps",
    "name": "Naver Maps",
    "english": "Naver Maps",
    "category": "Open API · External Services",
    "subcategory": "",
    "overview": "네이버 클라우드의 지도·주소 변환·경로 탐색 API",
    "description": "지도 표시와 Geocoding·Reverse Geocoding의 역할을 구분합니다. 서버용 Secret을 브라우저에 노출하지 말고 각 API 인증 방식·도메인 제한을 확인하세요.",
    "learn": [
      "Map",
      "Geocoding",
      "Reverse Geocoding",
      "Directions",
      "Coordinates"
    ],
    "useCases": [
      "학과 주변 위치 기반 정보",
      "주소와 좌표 변환 서비스"
    ],
    "related": [
      "Naver Developers",
      "Spring HTTP Service Client"
    ],
    "tags": [
      "Map",
      "Geocoding",
      "Reverse Geocoding",
      "Directions",
      "Coordinates"
    ],
    "aliases": "네이버 지도 위치 기반",
    "url": "https://api.ncloud-docs.com/docs/application-maps-overview",
    "official": true,
    "jobIds": [
      "backend",
      "frontend"
    ],
    "interviewCategories": [
      "네트워크"
    ],
    "note": ""
  },
  {
    "id": "kakao",
    "name": "Kakao Developers",
    "english": "Kakao Developers",
    "category": "Open API · External Services",
    "subcategory": "",
    "overview": "카카오 로그인·메시지 등 서비스 API의 공식 개발자 안내",
    "description": "앱 등록과 사용자 동의·권한·토큰을 이해하고 필요한 기능만 요청합니다. 메시지 API는 권한·사용 조건이 있으므로 임의 사용자 발송 기능으로 가정하지 마세요.",
    "learn": [
      "Kakao Login",
      "REST API",
      "OAuth2",
      "Consent",
      "Messaging"
    ],
    "useCases": [
      "카카오 로그인 연동",
      "동의와 권한 범위 안의 메시지 기능"
    ],
    "related": [
      "OAuth 2.0",
      "Spring Security",
      "Kakao Maps"
    ],
    "tags": [
      "Kakao Login",
      "REST API",
      "OAuth2",
      "Consent",
      "Messaging"
    ],
    "aliases": "카카오 개발자 검색 메시지",
    "url": "https://developers.kakao.com/docs/ko",
    "official": true,
    "jobIds": [
      "backend",
      "frontend"
    ],
    "interviewCategories": [
      "네트워크"
    ],
    "note": ""
  },
  {
    "id": "kakao-maps",
    "name": "Kakao Maps",
    "english": "Kakao Maps",
    "category": "Open API · External Services",
    "subcategory": "",
    "overview": "지도 표시·장소 검색·주소와 좌표 처리를 지원하는 지도 API",
    "description": "Web 지도 API의 지도·Marker를 학습하고 장소·주소 검색은 공식 Local API 안내와 함께 확인합니다. 브라우저 위치 요청에는 사용자 권한과 실패 처리가 필요합니다.",
    "learn": [
      "Map",
      "Place Search",
      "Address",
      "Coordinates",
      "Geolocation"
    ],
    "useCases": [
      "주변 시설 검색과 지도 표시",
      "프로젝트 장소·경로 안내 화면"
    ],
    "related": [
      "Kakao Developers",
      "Vue.js"
    ],
    "tags": [
      "Map",
      "Place Search",
      "Address",
      "Coordinates",
      "Geolocation"
    ],
    "aliases": "카카오 지도 카카오맵",
    "url": "https://apis.map.kakao.com/web/documentation/",
    "official": true,
    "jobIds": [
      "frontend",
      "backend"
    ],
    "interviewCategories": [
      "네트워크"
    ],
    "note": ""
  },
  {
    "id": "youtube",
    "name": "YouTube Data API",
    "english": "YouTube Data API",
    "category": "Open API · External Services",
    "subcategory": "",
    "overview": "동영상·채널·재생목록·검색 데이터를 조회하는 공식 API",
    "description": "리소스와 요청 파라미터를 이해하고 API Key·OAuth가 필요한 요청을 구분합니다. 검색 비용과 할당량·영상 이용 정책을 먼저 확인하세요.",
    "learn": [
      "Video",
      "Channel",
      "Playlist",
      "Search",
      "Quota"
    ],
    "useCases": [
      "학과 프로젝트 시연 영상 목록",
      "채널별 영상 탐색 서비스"
    ],
    "related": [
      "OAuth 2.0",
      "Spring HTTP Service Client",
      "Vue.js"
    ],
    "tags": [
      "Video",
      "Channel",
      "Playlist",
      "Search",
      "Quota"
    ],
    "aliases": "유튜브 동영상 채널 재생목록",
    "url": "https://developers.google.com/youtube/v3",
    "official": true,
    "jobIds": [
      "backend",
      "frontend"
    ],
    "interviewCategories": [
      "네트워크"
    ],
    "note": ""
  }
];
export const findDocForSkill = value => {
  const key = String(value).toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
  return docs.find(doc => [doc.name,doc.english,...(doc.skillNames||[])].some(name => name.toLowerCase().replace(/[^a-z0-9가-힣]/g, "") === key));
};
