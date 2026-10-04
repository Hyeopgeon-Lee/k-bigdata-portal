// Department career guide. IDs are stable public URLs; technologies are preparation examples.
export const jobGroups = [
  {
    "name": "소프트웨어 개발",
    "ids": [
      "backend",
      "frontend",
      "mobile",
      "native"
    ],
    "description": "API·웹·앱과 컨테이너 환경의 애플리케이션 구현"
  },
  {
    "name": "클라우드·인프라",
    "ids": [
      "system",
      "cloud",
      "devops"
    ],
    "description": "서버·클라우드 기반 운영과 소프트웨어 전달 자동화"
  },
  {
    "name": "데이터·AI",
    "ids": [
      "data",
      "analyst",
      "ai"
    ],
    "description": "데이터 공급·해석과 AI 기능의 개발·평가"
  },
  {
    "name": "품질·테스트",
    "ids": [
      "qa"
    ],
    "description": "요구사항 검증·결함 예방과 테스트 자동화"
  }
];
// Interview tags differ from role titles; keep their navigation mapping in one place.
export const interviewRoleLinks = {
  "공통":"jobs.html", "백엔드":"jobs.html?id=backend", "Java":"jobs.html?id=backend",
  "데이터엔지니어":"jobs.html?id=data", "AI개발":"jobs.html?id=ai",
  "클라우드":"jobs.html?id=cloud", "DevOps":"jobs.html?id=devops",
  "시스템":"jobs.html?id=system", "QA":"jobs.html?id=qa", "모바일":"jobs.html?id=mobile", "데이터분석":"jobs.html?id=analyst"
};
export const jobs = [
  {
    "id": "backend",
    "name": "백엔드 개발자",
    "english": "Backend Developer",
    "overview": "Java/Spring 등을 이용해 API, 비즈니스 로직, 데이터베이스, 인증·권한 등 서비스의 서버 영역을 개발합니다.",
    "description": "화면에서 보낸 요청을 받아 업무 규칙에 맞게 처리하고, 데이터를 안전하게 저장하며 결과를 API로 돌려줍니다. 예약 중복이나 잘못된 접근처럼 정상 흐름 밖의 문제도 다룹니다. 클라우드 네이티브 개발이 배포 환경에 맞는 확장·복구 설계까지 강조한다면, 백엔드는 서버 기능과 데이터 정합성에 중심을 둡니다. JPA와 MyBatis는 데이터 접근을 구현하는 선택지입니다. 먼저 SQL·트랜잭션을 이해하고 프로젝트와 채용공고에 맞는 도구를 익히세요.",
    "tasks": [
      "REST API와 외부 API 연동을 설계하고 요청·응답 계약을 관리합니다.",
      "업무 규칙을 서비스 계층으로 구현하고 경계 조건을 검증합니다.",
      "관계형 DB의 테이블·제약조건·SQL을 설계합니다.",
      "트랜잭션과 동시성 제어로 중복 신청·재고 오류를 방지합니다.",
      "인증과 인가를 분리하고 사용자별 접근 권한을 적용합니다.",
      "예외 응답 규격, 로그와 요청 추적 정보를 관리합니다.",
      "단위·통합 테스트로 정상·실패 경로를 검증합니다.",
      "쿼리와 API의 병목을 측정하고 성능을 개선합니다."
    ],
    "essentialSkills": [
      "Java",
      "Spring Boot",
      "HTTP",
      "REST API",
      "SQL",
      "RDBMS",
      "Git",
      "Testing"
    ],
    "plusSkills": [
      "JPA",
      "MyBatis",
      "Spring Security",
      "JWT",
      "Redis",
      "Message Queue / Kafka",
      "Docker",
      "Linux",
      "Observability"
    ],
    "recruitmentKeywords": [
      "Java",
      "Spring",
      "Spring Boot",
      "REST API",
      "JPA",
      "MyBatis",
      "SQL",
      "Oracle",
      "PostgreSQL",
      "MySQL",
      "Git"
    ],
    "education": "Java의 객체지향·예외 처리에서 시작해 Spring Boot의 API, SQL·Database의 데이터 설계를 연결합니다. Spring Security로 인증·권한 흐름을 학습하고 Docker·Cloud Native 학습으로 서버를 실행·배포하는 경험을 확장하세요.",
    "studyOrder": [
      "Java 객체지향·컬렉션·예외 처리와 Git → HTTP·REST 요청/응답 이해",
      "SQL·JOIN·테이블 제약조건 → Spring Boot API·트랜잭션·테스트 → JPA 또는 MyBatis로 데이터 접근 구현",
      "Spring Security·인가 → 테스트·로그 → 측정 결과가 있는 성능 개선"
    ],
    "projectIdeas": [
      {
        "title": "학생 신청·예약 시스템",
        "description": "신청 마감·정원·취소 규칙을 정의하고, 동시 요청에서도 중복 예약이 생기지 않도록 DB 제약과 트랜잭션을 구현합니다. 권한별 API와 경쟁 상황 테스트를 포함하세요."
      },
      {
        "title": "채용관리·학과 서비스 API",
        "description": "학생·담당자의 권한을 분리하고 지원 상태 변경 이력을 관리합니다. 외부 API 실패·타임아웃과 일관된 오류 응답을 테스트하세요."
      },
      {
        "title": "쇼핑몰 주문 API",
        "description": "주문·재고의 정합성과 중복 요청 방지를 구현합니다. 실제 결제 없이 모의 연동으로 실패·롤백 시나리오를 검증하고 쿼리 개선 전후를 비교하세요."
      }
    ],
    "portfolio": [
      "README에 사용자 문제, API 범위와 Java/Spring 선택 이유를 작성하고 본인 기여를 명시합니다.",
      "ERD에 관계·제약조건을 표시하고 API 명세에 인증·오류 응답 예시를 포함합니다.",
      "동시 신청·권한 위반·트랜잭션 실패 테스트와 실행 방법을 제시합니다.",
      "N+1 또는 느린 SQL의 원인, 실행 계획과 동일 조건의 개선 전후 지표를 기록합니다.",
      "개인정보를 제거한 로그 예시와 장애 재현·해결 과정을 연결합니다."
    ],
    "readinessChecklist": [
      "CRUD를 넘어 자원·상태·오류를 고려한 REST API를 설계하고 설명할 수 있다.",
      "DB 테이블과 제약조건을 설계하고 JOIN을 직접 작성할 수 있다.",
      "로그인과 역할별 인가를 구현하고 접근 거부를 테스트할 수 있다.",
      "트랜잭션 범위와 중복 요청 처리 방법을 설명할 수 있다.",
      "예외 응답과 안전한 로그를 구현할 수 있다.",
      "단위·통합 테스트를 실행하고 실패 원인을 설명할 수 있다."
    ],
    "interviewTopics": [
      "HTTP·REST·상태 코드",
      "Transaction·격리 수준·동시성",
      "Index·실행 계획",
      "JOIN·NULL·정규화",
      "Spring DI·프록시",
      "JPA·영속성·N+1",
      "Authentication·Authorization·JWT",
      "테스트·예외·로그"
    ],
    "interviewCategories": [
      "Java",
      "Spring Boot",
      "데이터베이스 / SQL",
      "네트워크"
    ],
    "certifications": [
      "engineer",
      "industrial",
      "sqld",
      "ocjp"
    ],
    "relatedRoles": [
      {
        "id": "native",
        "name": "클라우드 네이티브 개발자",
        "description": "서버 기능에 컨테이너 환경의 확장·복구 설계를 더합니다."
      },
      {
        "id": "devops",
        "name": "DevOps 엔지니어",
        "description": "테스트·빌드·배포의 반복 가능한 전달 과정을 설계합니다."
      },
      {
        "name": "Platform Engineer / DBA",
        "description": "공통 개발 플랫폼 또는 DB 운영·성능 분야로 확장할 수 있습니다. 별도 직무 카드가 아닌 연관 분야입니다."
      }
    ],
    "tags": [
      "Java",
      "Spring Boot",
      "SQL",
      "REST API",
      "JPA"
    ],
    "aliases": "백엔드 서버 개발 자바 스프링 인증 인가",
    "category": "소프트웨어 개발",
    "idea": "신청 마감·정원·취소 규칙을 정의하고, 동시 요청에서도 중복 예약이 생기지 않도록 DB 제약과 트랜잭션을 구현합니다. 권한별 API와 경쟁 상황 테스트를 포함하세요.",
    "suitability": "서버 API와 DB 구현이 재미있다",
    "careerPath": [
      "백엔드 개발자",
      "Cloud Native / Full-stack / DBA 분야"
    ]
  },
  {
    "id": "native",
    "name": "클라우드 네이티브 개발자",
    "english": "Cloud Native Application Developer",
    "overview": "애플리케이션을 컨테이너와 Kubernetes 환경에 맞게 설계해 확장·배포·복구가 쉬운 서비스를 개발합니다.",
    "description": "Kubernetes 명령어를 실행하는 것만이 아니라, 인스턴스가 늘거나 재시작돼도 기능과 데이터가 안정적으로 유지되는 애플리케이션을 만듭니다. 상태와 설정을 분리하고 외부 의존성 실패·타임아웃을 설계하며 운영에서 원인을 추적할 수 있게 합니다. 채용시장에서는 백엔드 개발자·플랫폼 개발자·클라우드 플랫폼 개발자 등의 직무명으로 Cloud Native 역량을 요구하기도 합니다. MSA는 서비스 분리가 필요한 문제와 운영 부담을 비교해 선택하세요.",
    "tasks": [
      "애플리케이션을 컨테이너화하고 재현 가능한 Docker 이미지를 작성합니다.",
      "Pod·Deployment·Service로 배포하고 업데이트·복구 흐름을 구현합니다.",
      "업무 경계를 기준으로 서비스 분리와 API 계약을 설계합니다.",
      "서비스 간 타임아웃·재시도·멱등성과 장애 전파를 다룹니다.",
      "환경 설정과 Secret을 코드에서 분리하고 주입 방식을 관리합니다.",
      "세션·파일 등 상태를 인스턴스 수명과 분리합니다.",
      "Health Check와 정상 종료를 구현해 안전한 배포를 지원합니다.",
      "로그·메트릭·트레이스로 요청과 병목을 관측합니다."
    ],
    "essentialSkills": [
      "Java",
      "Spring Boot",
      "Docker",
      "Kubernetes",
      "Linux",
      "REST API",
      "Git"
    ],
    "plusSkills": [
      "MSA",
      "K-PaaS",
      "API Gateway",
      "Service Discovery",
      "Config",
      "Secret",
      "Helm",
      "Observability",
      "OpenTelemetry"
    ],
    "recruitmentKeywords": [
      "Cloud Native",
      "Java",
      "Spring Boot",
      "Docker",
      "Kubernetes",
      "MSA",
      "K-PaaS",
      "Helm",
      "API Gateway",
      "OpenTelemetry"
    ],
    "education": "Java·Spring Boot로 API를 만든 뒤 Docker·Kubernetes에서 실행합니다. K-PaaS·Cloud Native·MSA 학습을 통해 설정·상태·서비스 경계를 검토하고 DevOps 학습과 연결해 관측 가능한 배포를 경험하세요.",
    "studyOrder": [
      "Java·Spring Boot API·HTTP → Linux·Docker 이미지와 실행",
      "Kubernetes Pod·Deployment·Service → ConfigMap·Secret·probe",
      "상태 분리·장애 복구·관측 → 필요한 경우 MSA·Helm·K-PaaS로 확장"
    ],
    "projectIdeas": [
      {
        "title": "확장 가능한 행사 신청 서비스",
        "description": "다중 인스턴스에서도 정원과 신청 데이터가 일관되게 유지되도록 구현합니다. readiness·롤링 업데이트와 부하 시험으로 요청 손실·지연을 확인하세요."
      },
      {
        "title": "예약·알림 서비스 분리",
        "description": "예약과 알림의 업무 경계를 정의하고 알림 장애가 예약 완료를 막지 않도록 설계합니다. 재시도·중복 방지·서비스 간 트레이스를 시연하세요."
      },
      {
        "title": "K-PaaS 기반 학과 API 배포",
        "description": "설정·Secret·상태 저장소를 분리한 앱을 배포합니다. Pod 종료나 의존성 지연 실험으로 복구와 관측이 어떻게 동작하는지 기록하세요."
      }
    ],
    "portfolio": [
      "구성도에 서비스 경계·상태 저장소·요청 경로와 분리 이유를 표시합니다.",
      "Dockerfile·배포 manifest·설정 예시를 공개하되 Secret 실제 값은 제거합니다.",
      "Pod 종료·업데이트·의존성 장애 실험의 조건과 복구 결과를 기록합니다.",
      "동일 조건의 확장 전후 지연·오류율을 비교하고 병목 한계를 설명합니다.",
      "로그·메트릭·트레이스 화면을 문제 진단 과정과 함께 제시합니다."
    ],
    "readinessChecklist": [
      "직접 만든 API를 Docker 이미지로 빌드·실행할 수 있다.",
      "Pod·Deployment·Service의 역할과 요청 경로를 설명할 수 있다.",
      "설정·Secret·영속 데이터를 컨테이너 수명과 분리할 수 있다.",
      "readiness·liveness·정상 종료의 차이를 설명하고 적용할 수 있다.",
      "인스턴스 재시작·확장에도 주요 기능이 유지되는지 검증할 수 있다.",
      "MSA의 장점뿐 아니라 통신·일관성·운영 비용을 설명할 수 있다."
    ],
    "interviewTopics": [
      "Container·이미지·격리",
      "Dockerfile·멀티스테이지",
      "Pod·Deployment",
      "Service·네트워킹",
      "ConfigMap·Secret",
      "Health Check·정상 종료",
      "MSA·멱등성·타임아웃",
      "상태 분리·확장·Observability"
    ],
    "interviewCategories": [
      "Docker",
      "Kubernetes",
      "MSA",
      "Cloud"
    ],
    "certifications": [
      "cka",
      "ocjp",
      "engineer"
    ],
    "relatedRoles": [
      {
        "id": "backend",
        "name": "백엔드 개발자",
        "description": "서버의 업무 규칙과 데이터 정합성을 깊게 다룹니다."
      },
      {
        "id": "devops",
        "name": "DevOps 엔지니어",
        "description": "애플리케이션의 전달·운영 자동화로 연결됩니다."
      },
      {
        "name": "Platform Engineer",
        "description": "개발자가 공통 배포·관측 기반을 이용하도록 플랫폼을 설계하는 확장 분야입니다."
      }
    ],
    "tags": [
      "Spring Boot",
      "Docker",
      "Kubernetes",
      "Cloud Native",
      "MSA"
    ],
    "aliases": "쿠버네티스 k8s 클라우드 네이티브 케이파스",
    "category": "소프트웨어 개발",
    "idea": "다중 인스턴스에서도 정원과 신청 데이터가 일관되게 유지되도록 구현합니다. readiness·롤링 업데이트와 부하 시험으로 요청 손실·지연을 확인하세요.",
    "suitability": "Spring Boot 앱을 컨테이너/Kubernetes 환경까지 고려해 개발하고 싶다",
    "careerPath": [
      "클라우드 네이티브 개발자",
      "Platform Engineer"
    ]
  },
  {
    "id": "devops",
    "name": "DevOps 엔지니어",
    "english": "DevOps Engineer",
    "overview": "테스트·빌드·배포와 운영 확인을 자동화해 안정적인 소프트웨어 전달 체계를 만듭니다.",
    "description": "개발과 운영 사이의 반복 작업을 코드로 만들고 변경이 안전하게 사용자에게 전달되도록 합니다. 단순 서버 관리가 아니라 테스트 실패를 차단하고 배포·복구를 재현할 수 있는 흐름을 설계하는 역할입니다. 클라우드 인프라 설계와 업무가 겹치지만 핵심은 전달 과정의 자동화와 신뢰성입니다. Git이 버전관리의 핵심이고 GitHub·GitLab·Bitbucket은 이를 활용하는 협업 플랫폼입니다. 한 플랫폼으로 전달 흐름을 구현한 뒤 차이를 이해하면 됩니다.",
    "tasks": [
      "CI/CD에서 코드 변경·자동 테스트·빌드·배포 단계를 설계합니다.",
      "Docker 이미지를 빌드하고 버전과 산출물을 추적합니다.",
      "Kubernetes 등 실행 환경에 일관되게 배포합니다.",
      "개발·검증·운영 환경 설정과 Secret을 분리합니다.",
      "Infrastructure as Code로 환경 변경을 검토·재현합니다.",
      "로그·메트릭·알림으로 배포 후 상태를 확인합니다.",
      "장애 원인을 분석하고 롤백·복구 절차를 훈련합니다.",
      "배포 권한·승인·실패 차단 기준을 관리합니다."
    ],
    "essentialSkills": [
      "Linux",
      "Git",
      "Shell",
      "CI/CD",
      "Docker",
      "Kubernetes",
      "IaC 기본 개념"
    ],
    "plusSkills": [
      "GitHub Actions",
      "GitLab CI",
      "Jenkins",
      "Terraform",
      "Ansible",
      "Argo CD",
      "GitOps",
      "Prometheus",
      "Grafana",
      "OpenTelemetry"
    ],
    "recruitmentKeywords": [
      "DevOps",
      "CI/CD",
      "GitHub Actions",
      "Jenkins",
      "Linux",
      "Docker",
      "Kubernetes",
      "Terraform",
      "Argo CD",
      "GitOps",
      "Prometheus",
      "Grafana"
    ],
    "education": "Docker·Kubernetes·K-PaaS·DevOps 학습을 Java/Spring Boot 프로젝트의 테스트·배포 흐름에 연결합니다. Cloud Native·MSA 서비스에서는 여러 배포 대상과 설정을 관리하는 이유를 이해하세요. Linux·Shell·IaC 도구는 구현을 지원하는 실무 학습 예시입니다.",
    "studyOrder": [
      "Git 브랜치·리뷰 → Linux·Shell·프로세스·로그 확인",
      "자동 테스트·빌드 → GitHub Actions 등 CI/CD → Docker 산출물 관리",
      "Kubernetes 배포·롤백 → 모니터링·Secret 관리 → IaC·GitOps 확장"
    ],
    "projectIdeas": [
      {
        "title": "실패를 차단하는 팀 CI/CD",
        "description": "Pull Request 테스트가 실패하면 병합·배포를 막고, 승인된 변경만 버전 이미지로 전달합니다. 환경별 설정과 배포 후 health 확인을 포함하세요."
      },
      {
        "title": "롤백 가능한 Kubernetes 배포",
        "description": "오류가 있는 버전을 검증 환경에 배포하고 지표로 실패를 감지해 이전 버전으로 복구합니다. DB 변경 호환성과 수동 승인 지점을 문서화하세요."
      },
      {
        "title": "재현 가능한 운영 환경",
        "description": "IaC와 설정 자동화로 검증 환경을 구성합니다. 코드 리뷰·권한·자원 정리 절차와 모니터링 알림을 마련하고 변경 전후를 기록하세요."
      }
    ],
    "portfolio": [
      "README에 commit→테스트→이미지→배포의 흐름과 승인·차단 기준을 그립니다.",
      "실제 workflow와 성공·실패 실행 기록을 연결해 재현성을 보여줍니다.",
      "잘못된 배포를 감지한 로그·지표와 롤백 시연, 복구 시간을 제시합니다.",
      "환경 설정 예시와 Secret 주입·최소 권한 설계를 값 노출 없이 설명합니다.",
      "IaC 변경 리뷰·환경 재생성 절차와 운영 runbook을 공개합니다."
    ],
    "readinessChecklist": [
      "Git 이력·브랜치·Pull Request 흐름을 설명할 수 있다.",
      "Linux에서 로그·프로세스·포트를 확인할 수 있다.",
      "테스트·빌드·배포 파이프라인을 직접 구성할 수 있다.",
      "실패한 테스트나 배포가 다음 단계로 진행되지 않게 할 수 있다.",
      "환경별 설정과 Secret을 저장소와 분리할 수 있다.",
      "배포 후 상태를 관측하고 이전 버전으로 복구할 수 있다."
    ],
    "interviewTopics": [
      "Git·브랜치·리뷰",
      "CI/CD·산출물",
      "Linux·Shell·권한",
      "Docker·이미지",
      "Kubernetes·배포",
      "Monitoring·로그·알림",
      "Rollback·DB 호환성",
      "IaC·GitOps·Secret"
    ],
    "interviewCategories": [
      "DevOps",
      "Linux",
      "Docker",
      "Kubernetes"
    ],
    "certifications": [
      "cka",
      "linux",
      "ncp"
    ],
    "relatedRoles": [
      {
        "id": "cloud",
        "name": "클라우드 엔지니어",
        "description": "전달 체계가 실행되는 인프라 설계·운영과 연결됩니다."
      },
      {
        "name": "SRE / Platform Engineer",
        "description": "서비스 신뢰성 목표·장애 대응 또는 개발팀의 공통 플랫폼으로 전문성을 확장합니다."
      }
    ],
    "tags": [
      "Linux",
      "CI/CD",
      "Docker",
      "Kubernetes",
      "Git"
    ],
    "aliases": "데브옵스 배포 자동화 깃허브 액션",
    "category": "클라우드·인프라",
    "idea": "Pull Request 테스트가 실패하면 병합·배포를 막고, 승인된 변경만 버전 이미지로 전달합니다. 환경별 설정과 배포 후 health 확인을 포함하세요.",
    "suitability": "배포·운영의 반복 작업을 자동화하고 싶다",
    "careerPath": [
      "DevOps 엔지니어",
      "SRE / Platform Engineer"
    ]
  },
  {
    "id": "cloud",
    "name": "클라우드 엔지니어",
    "english": "Cloud Engineer",
    "overview": "클라우드의 서버·네트워크·스토리지·보안·데이터베이스 인프라를 설계하고 안정적으로 운영합니다.",
    "description": "애플리케이션이 실행되는 기반을 만들고 누가 어디에 접근할 수 있는지, 장애 시 어떻게 복구할지 설계합니다. 가용성·성능·비용의 균형을 근거로 판단합니다. DevOps가 개발·테스트·배포 자동화 중심이라면 클라우드 엔지니어는 인프라 자체의 설계·운영 중심이며 실무에서 두 영역은 겹칠 수 있습니다.",
    "tasks": [
      "VM/Compute와 용량·확장 구성을 설계합니다.",
      "Virtual Network/VPC·서브넷·라우팅·Load Balancer를 구성합니다.",
      "Storage와 Managed Database의 접근·보존·복구 방식을 관리합니다.",
      "IAM·Firewall/Security Group으로 최소 권한을 적용합니다.",
      "DNS·HTTP/HTTPS와 인증서·접속 경로를 점검합니다.",
      "Monitoring과 로그로 자원·장애 징후를 확인합니다.",
      "Backup·Disaster Recovery 절차를 설계하고 복원을 시험합니다.",
      "비용·자원 사용을 추적하고 불필요한 자원을 관리합니다."
    ],
    "essentialSkills": [
      "AWS / NCP / Azure / GCP 중 최소 하나",
      "Linux",
      "TCP/IP",
      "DNS",
      "HTTP/HTTPS",
      "Network",
      "IAM",
      "Security"
    ],
    "plusSkills": [
      "Docker",
      "Kubernetes",
      "Terraform",
      "Monitoring",
      "Backup/DR",
      "FinOps"
    ],
    "recruitmentKeywords": [
      "Cloud Engineer",
      "Cloud",
      "Linux",
      "VPC",
      "Network",
      "IAM",
      "Load Balancer",
      "Security Group",
      "Managed Database",
      "Terraform",
      "Backup",
      "FinOps"
    ],
    "education": "Cloud Native·Docker·Kubernetes·K-PaaS 학습에서 서비스가 실행되는 네트워크·저장소·접근권한을 함께 살펴보세요. SQL·Database 학습은 관리형 DB 구성과 복구 이해에 연결됩니다. Linux·네트워크·IAM·비용 관리는 해당 기술을 운영하기 위한 기초·실무 학습 분야입니다.",
    "studyOrder": [
      "Linux·TCP/IP·DNS·HTTP/HTTPS → 클라우드 자원과 네트워크 경로",
      "Compute·Storage·DB·Load Balancer → IAM·보안 규칙",
      "모니터링·복원 시험·비용 기록 → 필요에 따라 Terraform·컨테이너 운영"
    ],
    "projectIdeas": [
      {
        "title": "최소 권한 웹서비스 인프라",
        "description": "NCP 등 하나의 플랫폼에서 Client → DNS → Load Balancer → VPC/Subnet → Compute → Database/Storage를 구성합니다. IAM·Security Group·HTTPS로 웹·앱·DB 접근을 분리하고 접근 거부·모니터링·백업 복원 시험과 예상 비용을 기록하세요."
      },
      {
        "title": "복구 가능한 데이터 서비스",
        "description": "백업 정책과 복구 목표를 정하고 모의 장애에서 복원합니다. 복제와 백업의 차이, 실제 복구 시간·데이터 손실 범위를 설명하세요."
      },
      {
        "title": "부하·비용 균형 실험",
        "description": "검증 환경에서 부하 분산과 용량 변경을 비교합니다. 지연·오류·자원 사용과 비용을 동일 조건으로 측정하고 실험 후 자원 정리를 포함하세요."
      }
    ],
    "portfolio": [
      "구성도에 서브넷·접속 경로·보안 경계·저장소를 명시합니다.",
      "IAM·보안 규칙의 선택 이유와 접근 허용/거부 시험 결과를 제시합니다.",
      "백업·복원 runbook과 목표 대비 실제 복구 시간·손실 범위를 기록합니다.",
      "부하 시험 조건·관측 지표·비용 산정의 가정과 한계를 공개합니다.",
      "재현 가능한 구성 예시를 제공하고 인증정보·실제 비밀 값은 제외합니다."
    ],
    "readinessChecklist": [
      "선택한 클라우드에서 Client → DNS → Load Balancer → VPC/Subnet → Compute → Database/Storage 경로를 구성하고 설명할 수 있다.",
      "Linux·DNS·포트·HTTPS 문제를 구간별로 점검할 수 있다.",
      "Compute·네트워크·저장소를 구성하고 선택 이유를 말할 수 있다.",
      "IAM·Security Group·HTTPS로 접근을 제한하고 허용/거부를 시험할 수 있다.",
      "백업에서 실제 복원하고 결과를 기록할 수 있다.",
      "가용성·성능·비용의 절충과 운영 제한을 설명할 수 있다."
    ],
    "interviewTopics": [
      "TCP/IP·라우팅·서브넷",
      "DNS·HTTP/HTTPS·TLS",
      "IAM·최소 권한",
      "Load Balancer·확장",
      "Storage·Managed Database",
      "Monitoring·장애 진단",
      "Backup·DR·RTO/RPO",
      "비용·자원 관리"
    ],
    "interviewCategories": [
      "Cloud",
      "네트워크",
      "Linux",
      "운영체제"
    ],
    "certifications": [
      "ncp",
      "cka",
      "linux"
    ],
    "relatedRoles": [
      {
        "id": "devops",
        "name": "DevOps 엔지니어",
        "description": "인프라 위에서 안전한 전달·운영 자동화를 구성합니다."
      },
      {
        "name": "SRE / Platform Engineer",
        "description": "신뢰성 목표나 공통 인프라 플랫폼 분야로 확장할 수 있습니다."
      }
    ],
    "tags": [
      "Cloud",
      "Linux",
      "Network",
      "IAM",
      "Security"
    ],
    "aliases": "클라우드 인프라 네트워크 서버 AWS NCP Azure GCP",
    "category": "클라우드·인프라",
    "idea": "웹·앱·DB의 접근 경로를 분리하고 IAM·방화벽·HTTPS를 적용합니다. 허용되지 않은 접근을 검증하며 예상 비용을 기록하세요.",
    "suitability": "클라우드 인프라와 네트워크 구성에 관심이 있다",
    "careerPath": [
      "클라우드 엔지니어",
      "Infrastructure Architect / Platform Engineer"
    ]
  },
  {
    "id": "data",
    "name": "데이터 엔지니어",
    "english": "Data Engineer",
    "overview": "여러 출처의 데이터를 수집·정제·저장·가공해 분석과 AI가 안정적으로 사용할 데이터 환경을 구축합니다.",
    "description": "데이터를 가져오는 것에서 끝내지 않고 누락·중복·스키마 변경과 장애 후 재처리까지 책임지는 흐름을 만듭니다. 데이터 분석가가 데이터를 활용해 해석·의사결정을 돕는다면, 데이터 엔지니어는 그 데이터가 신뢰할 수 있게 공급되는 파이프라인과 플랫폼을 구축합니다. AI 개발자와는 데이터 계약과 품질 기준을 함께 정합니다. Spark/Kafka 사용 여부보다 중복·지연·증분 적재·멱등성·재처리·데이터 품질 문제를 어떤 기준으로 해결했는지가 중요합니다.",
    "tasks": [
      "API·파일·DB 등 출처에서 데이터를 수집하고 이용 조건을 확인합니다.",
      "ETL/ELT로 정제·변환·적재 흐름을 설계합니다.",
      "Data Modeling과 스키마·변경 이력을 관리합니다.",
      "누락·중복·형식·참조 관계 등 Data Quality를 검사합니다.",
      "배치 작업의 의존성과 실행 일정을 관리합니다.",
      "필요한 경우 스트리밍 데이터의 지연·중복을 처리합니다.",
      "장애 시 재처리·증분 적재·멱등성을 구현합니다.",
      "처리량·지연·품질 지표와 오류를 모니터링합니다."
    ],
    "essentialSkills": [
      "Python",
      "SQL",
      "RDBMS",
      "Data Modeling",
      "ETL/ELT",
      "Linux",
      "Git"
    ],
    "plusSkills": [
      "Airflow",
      "Kafka",
      "Spark",
      "dbt",
      "Object Storage",
      "Data Warehouse",
      "Data Lake",
      "Lakehouse",
      "Cloud",
      "Data Quality"
    ],
    "recruitmentKeywords": [
      "Data Engineer",
      "Python",
      "SQL",
      "ETL",
      "ELT",
      "Airflow",
      "Kafka",
      "Spark",
      "Data Pipeline",
      "Data Warehouse",
      "Data Lake",
      "Lakehouse"
    ],
    "education": "Python·SQL·Database로 수집·변환·저장 흐름을 구현하고 빅데이터 학습으로 대용량 처리와 데이터 품질을 연결합니다. AI에서 필요한 입력 데이터를 이해하고 Docker·Cloud Native 학습으로 파이프라인 실행 환경을 재현하세요. Airflow·Kafka·Spark는 확장 학습 예시입니다.",
    "studyOrder": [
      "Python 파일·API 처리 → SQL·JOIN·테이블·Data Modeling",
      "작은 배치 ETL/ELT → 품질 검사·증분 적재·실패 재처리",
      "스케줄링·관측 → 필요 규모에 따라 Airflow·Kafka·Spark·Cloud 확장"
    ],
    "projectIdeas": [
      {
        "title": "공공데이터 품질 파이프라인",
        "description": "서로 다른 파일/API를 표준 스키마로 적재하고 누락·중복·단위 오류를 검사합니다. 출처·라이선스와 품질 실패 시 격리·재처리를 구현하세요."
      },
      {
        "title": "채용공고 데이터 적재 실습",
        "description": "사용이 허용된 데이터나 모의 데이터로 증분 수집과 중복 방지·변경 이력을 구현합니다. 분석용 테이블 설계와 SQL 검증을 포함하세요."
      },
      {
        "title": "이벤트 스트림 집계",
        "description": "모의 이벤트의 중복·지연 도착·처리 실패를 주입하고 집계 결과의 정확성을 확인합니다. 배치와 스트리밍 선택 이유와 재처리 범위를 기록하세요."
      }
    ],
    "portfolio": [
      "README에 출처·라이선스·데이터 사전·파이프라인 구성도를 제공합니다.",
      "스키마·키·증분 기준·변환 규칙과 데이터 계약을 설명합니다.",
      "누락·중복·형식 오류를 주입한 품질 검사 결과와 실패 처리 기록을 제시합니다.",
      "같은 입력을 재실행해도 결과가 중복되지 않는 재처리 검증을 보여줍니다.",
      "처리량·지연·자원 사용을 동일 조건에서 측정하고 확장 한계를 설명합니다."
    ],
    "readinessChecklist": [
      "Python으로 API·파일 데이터를 읽고 오류를 처리할 수 있다.",
      "SQL·JOIN·집계와 테이블·키 설계를 설명할 수 있다.",
      "수집→정제→적재 파이프라인을 재현할 수 있다.",
      "누락·중복·스키마 변화에 대한 검사 기준을 만들 수 있다.",
      "실패한 작업을 안전하게 재처리할 수 있다.",
      "데이터 출처·권한·품질 지표와 처리 한계를 설명할 수 있다."
    ],
    "interviewTopics": [
      "SQL·JOIN·Index",
      "Data Modeling·스키마",
      "ETL/ELT·변환 위치",
      "Batch·의존성",
      "Streaming·지연·중복",
      "Data Quality·누락·정합성",
      "증분 적재·멱등성·재처리",
      "모니터링·파티션·처리량"
    ],
    "interviewCategories": [
      "데이터베이스 / SQL",
      "AI / 빅데이터",
      "Linux",
      "Cloud"
    ],
    "certifications": [
      "sqld",
      "adsp",
      "engineer",
      "industrial",
      "ocp"
    ],
    "relatedRoles": [
      {
        "id": "analyst",
        "name": "데이터 분석가",
        "description": "공급된 데이터를 해석해 가설과 의사결정 근거를 만듭니다."
      },
      {
        "name": "Data Platform Engineer / DBA",
        "description": "공통 데이터 플랫폼이나 DB 운영·성능 분야로 확장합니다."
      },
      {
        "name": "MLOps / Data Analyst",
        "description": "모델용 데이터 운영 또는 분석·해석 분야와 협업하며, 각각의 책임은 구분됩니다."
      },
      {
        "id": "ai",
        "name": "AI 개발자",
        "description": "공급된 데이터로 모델·AI 기능을 개발하고 평가합니다."
      }
    ],
    "tags": [
      "Python",
      "SQL",
      "ETL/ELT",
      "Data Modeling",
      "Data Quality"
    ],
    "aliases": "데이터 파이프라인 데이터 모델링 분석 플랫폼",
    "category": "데이터·AI",
    "idea": "서로 다른 파일/API를 표준 스키마로 적재하고 누락·중복·단위 오류를 검사합니다. 출처·라이선스와 품질 실패 시 격리·재처리를 구현하세요.",
    "suitability": "데이터를 안정적으로 수집·처리하는 것이 재미있다",
    "careerPath": [
      "데이터 엔지니어",
      "Data Platform / MLOps 분야"
    ]
  },
  {
    "id": "ai",
    "name": "AI 개발자",
    "english": "AI Developer",
    "overview": "머신러닝·딥러닝 및 생성형 AI로 사용자 문제를 해결하는 AI 기능을 개발하고 실제 서비스에 연결합니다.",
    "description": "문제와 데이터에 맞게 모델 학습 또는 API 활용 방식을 선택하고 결과가 유용한지 평가합니다. Computer Vision·NLP뿐 아니라 LLM·RAG·Vector Database·Embedding·AI Agent·Multimodal AI와 Model/API Serving도 서비스 개발의 활용 범위입니다. 모든 기술을 한 번에 익히는 것이 아니라 문제에 필요한 기술을 선택하고 정확도·지연·비용·안전을 검증합니다.",
    "tasks": [
      "사용자 문제와 AI 적용 이유·비AI 기준선을 정의합니다.",
      "데이터 준비와 Train/Validation/Test 분리·누수를 점검합니다.",
      "Machine Learning·Deep Learning 모델을 선정·학습하고 비교합니다.",
      "평가 지표와 오류 분석으로 과적합·편향·실패 사례를 확인합니다.",
      "추론 API와 Model/API Serving을 구현하고 서비스에 연동합니다.",
      "LLM API·Embedding·Vector 검색을 활용해 RAG를 구성합니다.",
      "AI Agent·Multimodal 기능에 필요한 도구·권한·실패 경계를 설계합니다.",
      "AI 결과 평가·사용자 피드백과 개인정보·비용·지연을 검토합니다."
    ],
    "essentialSkills": [
      "Python",
      "SQL",
      "Data Processing",
      "Machine Learning",
      "Model Evaluation",
      "REST API",
      "Git"
    ],
    "plusSkills": [
      "Deep Learning",
      "PyTorch",
      "Computer Vision",
      "NLP",
      "LLM",
      "RAG",
      "Vector DB",
      "Embedding",
      "AI Agent",
      "Multimodal",
      "Docker",
      "Cloud"
    ],
    "recruitmentKeywords": [
      "AI Developer",
      "Python",
      "Machine Learning",
      "Deep Learning",
      "PyTorch",
      "Computer Vision",
      "NLP",
      "LLM",
      "RAG",
      "Vector Database",
      "Embedding",
      "AI Agent",
      "Multimodal",
      "Model Serving",
      "Evaluation"
    ],
    "education": "Python·SQL·빅데이터에서 데이터 준비를, AI 학습에서 모델·평가의 기초를 연결합니다. Spring Boot 또는 웹 API와 Vue.js·Flutter 화면을 통해 AI 결과를 사용자 흐름에 적용하고 Docker·Cloud Native로 실행 환경을 재현하세요. LLM·RAG·Agent는 프로젝트 목표에 맞춰 추가 학습하세요.",
    "studyOrder": [
      "Python·SQL·데이터 처리 → 통계·Machine Learning·분할·평가",
      "기준 모델 비교·오류 분석 → 추론 API와 사용자 화면",
      "문제에 따라 Deep Learning/CV/NLP 또는 LLM·RAG → 비용·지연·안전 평가 후 Agent·Multimodal 확장"
    ],
    "projectIdeas": [
      {
        "title": "문의 분류·처리 보조 서비스",
        "description": "사용이 허용된 데이터로 규칙 기반과 ML 모델을 비교합니다. 클래스별 정밀도·재현율과 오류 사례, 담당자 수정 피드백·추론 API를 구현하세요."
      },
      {
        "title": "근거를 제시하는 학습자료 RAG",
        "description": "공개·이용 허용 문서를 수집·분할하고 Embedding·Vector DB 검색을 구현합니다. 정답·근거가 있는 평가셋으로 검색 품질·답변 근거·모른다는 응답·지연·비용을 비교하세요."
      },
      {
        "title": "제한된 도구를 사용하는 AI Agent",
        "description": "조회 중심 모의 도구와 명확한 권한·호출 횟수·비용 제한을 둡니다. 잘못된 도구 선택·프롬프트 주입·실패 복구·사람 확인 시점을 평가하고 실행 추적을 남기세요."
      }
    ],
    "portfolio": [
      "문제·데이터·AI 적용 이유와 비AI 기준선을 README에 명시합니다. 단순 ChatGPT API 호출만으로 완성된 프로젝트를 주장하지 않습니다.",
      "학습/검증/테스트 분할, 전처리와 누수 방지·데이터 권한을 기록합니다.",
      "기준 모델·RAG 설정 등 비교 실험의 평가셋·지표·조건·결과를 제공합니다.",
      "실패 유형과 오류 분석, 사용자 피드백에 따른 변경·한계를 보여줍니다.",
      "추론 API·화면 흐름·지연·비용·성능 측정과 개인정보·편향·도구 권한 검토를 제시합니다.",
      "외부 LLM API 호출 자체를 성과로 과장하지 않고 평가 데이터·기준선·오류 유형·정확도·비용·지연·개인정보와 안전성 검토를 제시합니다."
    ],
    "readinessChecklist": [
      "사용자 문제와 AI가 필요한 이유를 기준선과 비교해 설명할 수 있다.",
      "학습·검증·테스트를 분리하고 데이터 누수를 점검할 수 있다.",
      "문제에 맞는 평가 지표와 오류 분석을 수행할 수 있다.",
      "모델 또는 API 결과를 실제 사용자 흐름에 연결할 수 있다.",
      "RAG·Embedding·LLM의 역할과 한계를 구분할 수 있다.",
      "개인정보·편향·지연·비용과 Agent 권한 위험을 설명할 수 있다."
    ],
    "interviewTopics": [
      "Train/Validation/Test·데이터 누수",
      "Overfitting·일반화",
      "Evaluation Metric·비교 실험",
      "Inference·Serving·지연",
      "LLM·환각·비용",
      "RAG·검색·근거 평가",
      "Embedding·Vector 검색",
      "AI Agent·도구 권한·안전"
    ],
    "interviewCategories": [
      "AI / 빅데이터",
      "데이터베이스 / SQL",
      "Cloud",
      "네트워크"
    ],
    "certifications": [
      "adsp",
      "engineer"
    ],
    "relatedRoles": [
      {
        "name": "ML Engineer / MLOps Engineer",
        "description": "모델 구현·추론 최적화 또는 모델 배포·평가·데이터 변화 대응으로 전문성을 확장합니다."
      },
      {
        "id": "data",
        "name": "데이터 엔지니어",
        "description": "모델이 사용할 데이터 흐름과 품질을 구축하는 분야입니다."
      }
    ],
    "tags": [
      "Python",
      "Machine Learning",
      "LLM",
      "RAG",
      "Evaluation"
    ],
    "aliases": "인공지능 머신러닝 딥러닝 생성형 에이전트 벡터 검색 AI Agent Vector DB",
    "category": "데이터·AI",
    "idea": "사용이 허용된 데이터로 규칙 기반과 ML 모델을 비교합니다. 클래스별 정밀도·재현율과 오류 사례, 담당자 수정 피드백·추론 API를 구현하세요.",
    "tracks": [
      {
        "name": "AI/ML Track",
        "skills": [
          "Python",
          "Machine Learning",
          "PyTorch",
          "Model Evaluation"
        ],
        "goal": "작은 데이터셋으로 기준 모델과 개선 모델을 비교하고 과적합·평가 지표를 설명합니다."
      },
      {
        "name": "Vision/NLP Track",
        "skills": [
          "Deep Learning",
          "Computer Vision",
          "NLP",
          "Data Processing"
        ],
        "goal": "이미지 또는 텍스트 중 한 종류를 선택하고 오분류·전처리·데이터 누수 영향을 분석합니다."
      },
      {
        "name": "Generative AI Track",
        "skills": [
          "LLM",
          "Embedding",
          "Vector DB",
          "RAG",
          "AI Agent",
          "Evaluation"
        ],
        "goal": "고정 평가 질문으로 검색·응답 품질과 비용·지연·개인정보·안전성 경계를 검증합니다."
      }
    ],
    "trackGuidance": "모든 기술을 익힐 필요는 없습니다. 지원하려는 직무와 프로젝트에 맞는 한 영역을 선택해 깊게 준비하는 것이 중요합니다.",
    "suitability": "AI 모델이나 LLM 기능을 평가하며 서비스를 만들고 싶다",
    "careerPath": [
      "AI 개발자",
      "ML Engineer / MLOps Engineer"
    ]
  },
  {
    "id": "frontend",
    "name": "프론트엔드 개발자",
    "english": "Frontend Developer",
    "overview": "사용자가 웹서비스에서 직접 보고 조작하는 화면과 사용자 경험을 구현합니다.",
    "description": "디자인을 화면으로 옮기는 것에 더해 API 요청과 상태 변화, 입력·오류·접근성을 설계합니다. 느린 네트워크나 비어 있는 결과에서도 사용자가 다음 행동을 알 수 있도록 만듭니다. 백엔드와 API 계약을 맞추고 모바일·키보드·보조기술에서 같은 기능을 이용할 수 있게 검증합니다. 학과에서는 Vue.js를 먼저 연결하고, React는 지원 기업의 기술 스택에 맞춰 확장하세요. 먼저 한 프레임워크로 사용자 흐름을 완성하세요.",
    "tasks": [
      "HTML·CSS와 컴포넌트로 일관된 UI를 구현합니다.",
      "모바일·태블릿·PC의 반응형 레이아웃을 검증합니다.",
      "REST API를 연동하고 요청·응답·인증 흐름을 처리합니다.",
      "화면 상태와 Loading·Empty·Error 흐름을 관리합니다.",
      "입력 검증과 이해 가능한 오류 안내를 구현합니다.",
      "키보드·focus·semantic HTML 등 접근성을 개선합니다.",
      "렌더링·번들·네트워크 성능을 측정하고 최적화합니다.",
      "테스트와 사용자 피드백으로 사용 흐름을 개선합니다."
    ],
    "essentialSkills": [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "REST API",
      "Git",
      "Vue.js 또는 React"
    ],
    "plusSkills": [
      "React",
      "Vue.js",
      "Next.js",
      "Nuxt",
      "State Management",
      "Testing",
      "Web Accessibility",
      "Web Performance"
    ],
    "recruitmentKeywords": [
      "Frontend",
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "Vue",
      "Vue.js",
      "React",
      "REST API",
      "State Management",
      "Accessibility",
      "Testing"
    ],
    "education": "HTML·CSS·JavaScript 기초와 Vue.js의 컴포넌트·상태·API 연동을 중요하게 연결하세요. Spring Boot API와 협업해 요청·오류 계약을 맞추고 Flutter 학습에서는 모바일 사용자 흐름을 비교할 수 있습니다. React·TypeScript는 채용공고에 따라 확장하는 기술 예시입니다.",
    "studyOrder": [
      "HTML 의미 구조·CSS 반응형 → JavaScript 비동기·DOM·Git",
      "TypeScript·컴포넌트·상태 관리 → Vue.js로 API 연동 → 공고에 따라 React 확장",
      "입력 검증·접근성·테스트·성능 측정 → 필요한 경우 TypeScript·React 확장"
    ],
    "projectIdeas": [
      {
        "title": "모바일 공공정보 검색 UI",
        "description": "실제 또는 모의 API를 연동하고 로딩·빈 결과·실패·재시도를 구현합니다. 요청 순서 경쟁, 필터·검색 상태와 키보드 사용을 검증하세요."
      },
      {
        "title": "신청·예약 대시보드",
        "description": "폼 검증과 권한별 화면을 설계하고 서버 오류를 사용자에게 명확히 안내합니다. 중복 제출 방지·모바일·접근성 테스트를 포함하세요."
      },
      {
        "title": "Vue.js 프로젝트 탐색 화면",
        "description": "컴포넌트와 상태를 분리해 목록·필터·상세 흐름을 구성합니다. 긴 텍스트·빈 데이터·이미지 실패와 렌더링 성능을 테스트하세요."
      }
    ],
    "portfolio": [
      "README에 사용자 흐름·컴포넌트 구조·상태 관리와 선택 이유를 설명합니다.",
      "API 계약·연동 화면과 Loading·Empty·Error·재시도 예시를 제시합니다.",
      "모바일·태블릿·PC 화면과 긴 제목·입력 오류·중복 제출 테스트를 기록합니다.",
      "키보드 탐색·focus·label·대비 등 접근성 확인 결과를 제공합니다.",
      "성능 측정 조건과 개선 전후를 비교하고 본인 기여·남은 한계를 명시합니다."
    ],
    "readinessChecklist": [
      "HTML·CSS·JavaScript로 반응형 화면을 직접 구현할 수 있다.",
      "Vue.js의 컴포넌트·props·상태 흐름을 설명할 수 있다.",
      "API를 연동하고 Loading·Empty·Error 상태를 구분할 수 있다.",
      "폼 검증·중복 제출 방지·서버 오류 안내를 구현할 수 있다.",
      "키보드와 모바일에서 핵심 사용자 흐름을 완료할 수 있다.",
      "테스트·성능 측정 결과와 개선 근거를 설명할 수 있다."
    ],
    "interviewTopics": [
      "HTML 의미 구조·접근성",
      "CSS 레이아웃·반응형",
      "JavaScript 비동기·이벤트 루프",
      "HTTP·REST·오류 응답",
      "Vue.js 컴포넌트·상태",
      "인증·브라우저 보안",
      "Loading/Empty/Error·요청 경쟁",
      "테스트·웹 성능"
    ],
    "interviewCategories": [
      "컴퓨터공학 기초",
      "네트워크",
      "자료구조 / 알고리즘"
    ],
    "certifications": [
      "engineer",
      "industrial"
    ],
    "relatedRoles": [
      {
        "id": "backend",
        "name": "백엔드 개발자",
        "description": "API 계약·데이터 처리까지 이해하는 방향으로 확장합니다."
      },
      {
        "name": "Full-stack / UI Engineer",
        "description": "서버까지 구현하거나 공통 UI·접근성·성능 분야를 깊게 다루는 진로입니다."
      }
    ],
    "tags": [
      "HTML",
      "CSS",
      "JavaScript",
      "Vue.js",
      "REST API"
    ],
    "aliases": "프론트엔드 프런트엔드 웹 화면 뷰 Vue",
    "category": "소프트웨어 개발",
    "idea": "실제 또는 모의 API를 연동하고 로딩·빈 결과·실패·재시도를 구현합니다. 요청 순서 경쟁, 필터·검색 상태와 키보드 사용을 검증하세요.",
    "suitability": "웹 화면과 사용자 경험을 만드는 것이 재미있다",
    "careerPath": [
      "프론트엔드 개발자",
      "UI Engineer / Full-stack 분야"
    ]
  },
  {
    "id": "system",
    "name": "시스템 엔지니어",
    "english": "System Engineer",
    "overview": "서버·운영체제·네트워크·스토리지 인프라를 구축·운영하고 장애를 예방·분석·복구합니다.",
    "description": "서비스가 실행되는 서버와 운영체제의 상태를 확인하고 장애 구간을 좁혀 복구하는 역할입니다. System Engineer는 Server & Infrastructure 운영 기반, Cloud Engineer는 클라우드 자원 설계·운영, DevOps Engineer는 개발·테스트·배포 자동화에 중심을 둡니다. 작은 Linux VM에서 서비스 한 개를 안정적으로 운영하는 경험부터 시작하세요.",
    "tasks": [
      "Linux/Windows Server를 설치·설정하고 패치·업데이트 전후 서비스를 검증합니다.",
      "사용자·그룹·파일 권한과 서비스 실행 계정을 관리합니다.",
      "프로세스·서비스·포트와 CPU·Memory·Disk·Network 상태를 확인합니다.",
      "TCP/IP·DNS·HTTP/HTTPS 접속 문제를 구간별로 진단합니다.",
      "스토리지·백업 정책을 구성하고 실제 복원 가능성을 시험합니다.",
      "로그·모니터링으로 장애를 탐지하고 원인과 영향을 분석합니다.",
      "가상화 환경을 운영하고 Shell/Python으로 반복 작업을 자동화합니다.",
      "장애 복구 순서와 재발 방지 조치를 Runbook으로 작성합니다."
    ],
    "essentialSkills": [
      "Linux",
      "TCP/IP",
      "DNS",
      "HTTP/HTTPS",
      "Server",
      "Network",
      "Shell",
      "Git",
      "Monitoring"
    ],
    "plusSkills": [
      "VMware",
      "Docker",
      "Ansible",
      "Python",
      "Prometheus",
      "Grafana",
      "Cloud",
      "Backup/DR"
    ],
    "recruitmentKeywords": [
      "System Engineer",
      "시스템 엔지니어",
      "서버 운영",
      "Linux",
      "Windows Server",
      "인프라",
      "네트워크",
      "가상화",
      "Monitoring",
      "Backup"
    ],
    "education": "Linux·클라우드컴퓨팅 학습에서 프로세스·권한·네트워크를 확인하고 Spring Boot·Database 서비스를 실행해 보세요. Python은 운영 점검 자동화, Docker·Kubernetes·K-PaaS는 기존 OS·네트워크 기반을 확장하는 학습으로 연결합니다. Windows Server·VMware는 채용공고에 따라 추가할 기술 예시입니다.",
    "studyOrder": [
      "Linux 파일·사용자·권한 → 프로세스·서비스·로그 → Git으로 설정 변경 기록",
      "TCP/IP·DNS·HTTP → 웹·앱·DB 운영 → 최소 권한·백업 복원",
      "지표·알림 → 장애 주입·복구 Runbook → Shell 자동화 → 공고에 따라 가상화·Cloud 확장"
    ],
    "projectIdeas": [
      {
        "title": "Linux 웹서비스 운영환경 구축",
        "description": "Nginx + Spring Boot + PostgreSQL을 VM에 구성하고 자동 시작·실행 계정·로그 순환을 적용합니다. 프로세스 종료와 잘못된 권한을 재현해 서비스 복구 절차와 복구시간을 기록하세요."
      },
      {
        "title": "서버 모니터링과 알림",
        "description": "Prometheus/Grafana로 CPU·Memory·Disk·Network 지표를 수집하고 임계치 알림을 설정합니다. 부하와 디스크 사용 증가를 제한된 실습 VM에서 재현하고 알림 지연·오탐을 비교하세요."
      },
      {
        "title": "장애 분석·복구 실습",
        "description": "격리된 VM에서 서비스 중단·DNS 오류·디스크 부족을 재현합니다. 탐지 → 구간 진단 → 복구 → 재발 방지 흐름을 로그와 Runbook으로 남기고 백업 복원도 검증하세요."
      }
    ],
    "portfolio": [
      "서버·프로세스·네트워크 구성도와 실행 계정·권한 선택 이유를 제시합니다.",
      "설치·자동 시작·백업·복원 명령과 재현 가능한 설정 예시를 비밀 값 없이 공개합니다.",
      "장애별 증상·로그·진단 명령·원인·복구시간을 표 또는 타임라인으로 기록합니다.",
      "모니터링 화면과 알림 시험 결과, 정상 기준과 오탐 개선을 보여줍니다.",
      "운영 Runbook에 확인 순서·안전한 복구·검증·롤백과 본인 기여를 적습니다."
    ],
    "readinessChecklist": [
      "Linux 사용자·권한·서비스 실행 계정을 설정할 수 있다.",
      "프로세스·포트·로그로 서비스 중단 원인을 구분할 수 있다.",
      "DNS·네트워크·HTTPS 문제를 구간별로 진단할 수 있다.",
      "CPU·Memory·Disk 지표를 읽고 원인을 가설로 설명할 수 있다.",
      "백업 데이터를 실제 복원하고 결과를 검증할 수 있다.",
      "동료가 따라 할 수 있는 Runbook과 자동화 스크립트를 작성할 수 있다."
    ],
    "interviewTopics": [
      "프로세스·스레드·메모리",
      "Linux 권한·서비스·로그",
      "TCP/IP·DNS·HTTP/HTTPS",
      "디스크·파일시스템·스토리지",
      "Monitoring·알림·장애 분석",
      "Backup·복원·RTO/RPO",
      "가상화·Container·최소 권한"
    ],
    "interviewCategories": [
      "운영체제",
      "Linux",
      "네트워크",
      "Docker"
    ],
    "certifications": [
      "linux",
      "ncp",
      "engineer",
      "industrial"
    ],
    "relatedRoles": [
      {
        "id": "cloud",
        "name": "클라우드 엔지니어",
        "description": "OS 운영 기반을 클라우드 네트워크·IAM·관리형 자원 설계로 확장합니다."
      },
      {
        "id": "devops",
        "name": "DevOps 엔지니어",
        "description": "운영 경험을 소프트웨어 전달·배포 자동화로 확장합니다."
      },
      {
        "name": "Infrastructure Architect / Network Engineer",
        "description": "경험을 쌓은 뒤 인프라 전체 설계 또는 네트워크 분야로 확장할 수 있습니다."
      }
    ],
    "tags": [
      "Linux",
      "Network",
      "Shell",
      "Monitoring"
    ],
    "aliases": "시스템 서버 인프라 Linux 리눅스 네트워크 서버관리 시스템관리 SE Server Infrastructure",
    "suitability": "서버·Linux·네트워크 장애 해결이 재미있다",
    "careerPath": [
      "시스템 엔지니어",
      "클라우드 엔지니어",
      "Infrastructure Architect"
    ],
    "category": "클라우드·인프라"
  },
  {
    "id": "qa",
    "name": "QA 엔지니어",
    "english": "QA Engineer",
    "overview": "요구사항에 맞는 동작을 검증하고 결함을 예방하며 테스트 자동화로 소프트웨어 품질을 개선합니다.",
    "description": "Software QA / Test Engineer는 제품의 위험과 요구사항을 바탕으로 무엇을 어떻게 시험할지 설계합니다. 개발자가 기능을 구현하는 데 중심을 둔다면 QA는 정상·오류·경계 조건과 릴리즈 위험을 검증하는 데 중심을 둡니다. 단순히 오류를 찾는 것뿐 아니라 재현 가능한 근거와 자동 회귀 검사를 개발팀에 제공합니다.",
    "tasks": [
      "요구사항과 사용자 흐름에서 품질 위험·수용 기준을 정리합니다.",
      "Test Scenario·Test Case와 우선순위·테스트 데이터를 설계합니다.",
      "기능·API·통합·회귀·E2E 테스트로 정상·오류·경계 조건을 검증합니다.",
      "결함 재현 조건·기대 결과·실제 결과를 Bug Report로 전달합니다.",
      "테스트 결과와 미해결 결함을 관리하고 릴리즈 위험을 설명합니다.",
      "안정적인 테스트 자동화를 작성하고 CI/CD에 연동합니다.",
      "환경·브라우저·네트워크 차이에 따른 문제와 불안정한 테스트 원인을 분석합니다.",
      "개발자와 원인을 확인하고 수정 후 재검증·회귀 범위를 정합니다."
    ],
    "essentialSkills": [
      "Software Testing",
      "Test Case",
      "Test Scenario",
      "HTTP",
      "REST API",
      "Postman",
      "SQL",
      "Git",
      "Bug Tracking"
    ],
    "plusSkills": [
      "Playwright",
      "Selenium",
      "Cypress",
      "Appium",
      "pytest",
      "JUnit",
      "JMeter",
      "k6",
      "GitHub Actions",
      "Jenkins"
    ],
    "recruitmentKeywords": [
      "QA Engineer",
      "Software QA",
      "Test Engineer",
      "테스트 설계",
      "회귀 테스트",
      "API Test",
      "Automation",
      "Postman",
      "Playwright",
      "SDET"
    ],
    "education": "Spring Boot·SQL·Database 학습으로 API와 데이터 변경을 이해하고 Java·Python으로 테스트 로직을 작성하세요. Vue.js·Flutter 화면은 핵심 사용자 시나리오 검증에 연결됩니다. DevOps 학습의 자동 테스트·CI 흐름을 활용하되 별도의 QA 교과목이 존재한다고 가정하지 않습니다.",
    "studyOrder": [
      "요구사항·수용 기준 → 테스트 시나리오·경계값·동등 분할 → Bug Report",
      "HTTP·API·SQL 확인 → Postman 정상·오류 케이스 → Newman 실행",
      "Playwright 또는 Selenium으로 핵심 E2E → CI 자동 회귀 → 공고에 따라 성능·앱 테스트"
    ],
    "projectIdeas": [
      {
        "title": "웹서비스 QA와 결함 보고",
        "description": "팀 서비스 요구사항을 수용 기준과 Test Case로 연결합니다. 모바일·권한·빈 결과·오류 흐름을 시험하고 재현 절차·기대/실제 결과·우선순위를 포함한 결함 보고서를 작성하세요."
      },
      {
        "title": "API 자동 테스트",
        "description": "예약 API를 Postman/Newman으로 검사하고 인증 실패·잘못된 입력·중복 요청을 포함합니다. 테스트 데이터 초기화·결과 검증과 실패 로그를 구현해 반복 실행에서도 같은 결과인지 확인하세요."
      },
      {
        "title": "CI 기반 E2E 회귀 검사",
        "description": "Playwright 또는 Selenium으로 로그인·신청·취소 흐름을 자동화합니다. PR마다 GitHub Actions에서 실행하고 오류를 의도적으로 넣어 실패 차단·추적 자료가 생성되는지 검증하세요."
      }
    ],
    "portfolio": [
      "요구사항 → 수용 기준 → Test Case → 결과 → 결함의 추적 관계를 제시합니다.",
      "위험 기반 우선순위와 제외한 테스트 범위·이유를 설명합니다.",
      "재현 가능한 Bug Report와 수정 전후 재검증 결과를 개인정보 없이 공개합니다.",
      "자동 테스트 코드·데이터 초기화·CI 성공/실패 실행 기록을 연결합니다.",
      "불안정한 테스트 원인과 개선 전후 재현성, 테스트 시간·검증 범위를 보여줍니다."
    ],
    "readinessChecklist": [
      "요구사항을 정상·오류·경계 조건의 테스트로 바꿀 수 있다.",
      "누구나 재현 가능한 Bug Report를 작성할 수 있다.",
      "HTTP 응답과 DB 변경을 함께 확인할 수 있다.",
      "독립적인 테스트 데이터와 반복 가능한 자동 테스트를 만들 수 있다.",
      "수정 후 회귀 범위를 설명하고 실행할 수 있다.",
      "CI 실패 로그로 제품 결함과 테스트 자체 문제를 구분할 수 있다."
    ],
    "interviewTopics": [
      "테스트 수준·단위·통합·E2E",
      "경계값·동등 분할·테스트 데이터",
      "HTTP 상태·인증·API 검증",
      "SQL·트랜잭션·데이터 정합성",
      "결함 재현·회귀·릴리즈 위험",
      "테스트 격리·불안정성·CI",
      "개발자·QA 협업과 근거 전달"
    ],
    "interviewCategories": [
      "Spring Boot",
      "네트워크",
      "데이터베이스 / SQL",
      "Git·GitHub"
    ],
    "certifications": [
      "engineer",
      "industrial",
      "sqld"
    ],
    "relatedRoles": [
      {
        "id": "backend",
        "name": "백엔드 개발자",
        "description": "제품 기능과 데이터 처리를 구현하며 QA와 수용 기준·결함을 확인합니다."
      },
      {
        "name": "Test Automation Engineer / SDET",
        "description": "테스트 자동화 설계와 개발 역량을 깊게 쌓아 품질 검증 플랫폼을 구현하는 방향입니다."
      }
    ],
    "tags": [
      "Testing",
      "REST API",
      "SQL",
      "Automation"
    ],
    "aliases": "QA 품질 테스트 테스터 자동화테스트 Software QA Test Engineer SDET",
    "suitability": "버그를 재현하고 품질을 개선하는 것이 재미있다",
    "careerPath": [
      "QA Engineer",
      "Test Automation Engineer",
      "SDET"
    ],
    "category": "품질·테스트"
  },
  {
    "id": "mobile",
    "name": "모바일 앱 개발자",
    "english": "Mobile App Developer",
    "overview": "스마트폰 앱의 화면·상태·API 통신을 구현하고 기기 환경과 오류 상황에서도 사용할 수 있는 경험을 만듭니다.",
    "description": "웹 브라우저 화면과 달리 앱 수명주기·기기 권한·화면 크기·네트워크 전환을 고려합니다. Flutter는 Dart로 UI를 구성하는 크로스플랫폼 도구이며 Android/iOS 네이티브 개발은 각 플랫폼 SDK를 직접 사용하는 방식입니다. 코드 공유 범위와 기기 기능 요구를 비교해 선택하고, 먼저 한 앱의 핵심 흐름을 끝까지 구현하세요.",
    "tasks": [
      "Widget·Layout으로 화면과 접근 가능한 터치 흐름을 구현합니다.",
      "REST API를 비동기로 호출하고 Loading·Empty·Error·재시도를 처리합니다.",
      "상태 관리와 화면 이동을 분리해 데이터 일관성을 유지합니다.",
      "로그인·토큰 갱신·기기 저장·민감정보 취급을 설계합니다.",
      "앱 수명주기·네트워크 전환·권한 거부 상황을 처리합니다.",
      "작은 화면·글자 확대·기기 차이에 대응하고 성능을 점검합니다.",
      "단위·Widget·통합 테스트로 핵심 시나리오를 검증합니다.",
      "빌드·배포·릴리즈 변경 내용을 관리하고 오류를 재현합니다."
    ],
    "essentialSkills": [
      "Dart",
      "Flutter",
      "Widget",
      "Layout",
      "State Management",
      "REST API",
      "Async Programming",
      "Git"
    ],
    "plusSkills": [
      "Provider",
      "Riverpod",
      "BLoC",
      "Firebase",
      "Android",
      "iOS",
      "Local Storage",
      "App Testing",
      "CI/CD"
    ],
    "recruitmentKeywords": [
      "Flutter",
      "Dart",
      "Mobile App",
      "Android",
      "iOS",
      "Widget",
      "State Management",
      "REST API",
      "비동기",
      "앱 테스트"
    ],
    "education": "학과의 Flutter로 화면·상태·비동기 통신을 익히고 Spring Boot의 API 계약·인증과 SQL·Database의 데이터 구조를 연결하세요. Vue.js에서 경험한 UI 상태·입력 검증을 비교할 수 있습니다. 네이티브 SDK·Firebase·배포 자동화는 지원 공고와 프로젝트 요구에 맞춰 추가합니다.",
    "studyOrder": [
      "Dart 타입·비동기 → Flutter Widget·Layout·화면 이동",
      "REST API → Loading·Empty·Error → 상태 관리 한 방식 → 인증·저장",
      "오프라인·수명주기·권한 처리 → Widget/통합 테스트 → 실제 기기 빌드·시연"
    ],
    "projectIdeas": [
      {
        "title": "Flutter + Spring Boot 예약 앱",
        "description": "정원·시간·취소 규칙이 있는 API를 연결하고 토큰 만료·중복 제출·통신 실패를 처리합니다. 사용자 역할별 화면과 예약 충돌 응답을 테스트하고 실제 기기에서 시연하세요."
      },
      {
        "title": "공공데이터 기반 생활 앱",
        "description": "출처·API 제한을 확인한 날씨나 지역 정보를 표시하고 캐시·마지막 갱신시각·오프라인 안내를 구현합니다. 응답 지연·실패·빈 데이터를 주입해 복구 흐름을 검증하세요."
      },
      {
        "title": "로그인·상태관리·오프라인 앱",
        "description": "할 일이나 신청 초안을 로컬에 보존하고 재접속 후 동기화합니다. 로그아웃·앱 재시작·네트워크 전환 시 데이터와 권한이 섞이지 않는지 시험하고 동기화 충돌 정책을 기록하세요."
      }
    ],
    "portfolio": [
      "화면 흐름·상태 관리·API 계약과 기술 선택 이유를 README에 제시합니다.",
      "로그인·토큰 만료·권한 거부·오프라인·재시작 시나리오를 시연합니다.",
      "Loading·Empty·Error와 입력 검증을 정상 화면과 함께 보여줍니다.",
      "Widget/통합 테스트 실행 방법·실패 재현·수정 결과를 연결합니다.",
      "실제 기기 화면과 측정 조건을 공개하고 저장 데이터·비밀 키는 제외합니다."
    ],
    "readinessChecklist": [
      "Dart 비동기와 Widget 상태 갱신을 설명할 수 있다.",
      "다양한 화면 크기와 글자 확대에서 핵심 동작을 사용할 수 있다.",
      "API 실패·빈 결과·재시도를 UI로 처리할 수 있다.",
      "로그인·토큰 만료·로그아웃 흐름을 구현할 수 있다.",
      "앱 재시작·오프라인에서 필요한 데이터를 안전하게 보존할 수 있다.",
      "테스트와 실제 기기 시연으로 만든 앱을 설명할 수 있다."
    ],
    "interviewTopics": [
      "비동기·요청 순서·오류 처리",
      "상태 관리·화면 수명주기",
      "HTTP·REST·인증·토큰",
      "로컬 저장·캐시·동기화",
      "Widget·Layout·접근성",
      "단위·통합 테스트·기기 차이"
    ],
    "interviewCategories": [
      "컴퓨터공학 기초",
      "네트워크",
      "데이터베이스 / SQL",
      "Git·GitHub"
    ],
    "certifications": [
      "engineer",
      "industrial"
    ],
    "relatedRoles": [
      {
        "id": "frontend",
        "name": "프론트엔드 개발자",
        "description": "웹 브라우저에서 UI와 API 연동을 구현하며 앱과 사용 환경이 다릅니다."
      },
      {
        "id": "backend",
        "name": "백엔드 개발자",
        "description": "앱이 사용하는 API·업무 규칙·데이터를 구현합니다."
      },
      {
        "name": "Android / iOS Developer",
        "description": "플랫폼 SDK·기기 기능·배포를 깊게 다루는 네이티브 앱 개발로 확장할 수 있습니다."
      }
    ],
    "tags": [
      "Flutter",
      "Dart",
      "REST API",
      "State Management"
    ],
    "aliases": "앱 모바일 Flutter Dart Android iOS 스마트폰 크로스플랫폼",
    "suitability": "스마트폰 앱을 만드는 것이 재미있다",
    "careerPath": [
      "모바일 앱 개발자",
      "Android / iOS Developer"
    ],
    "category": "소프트웨어 개발"
  },
  {
    "id": "analyst",
    "name": "데이터 분석가",
    "english": "Data Analyst",
    "overview": "SQL·Python/R·통계·시각화로 데이터를 해석하고 의사결정에 필요한 근거를 제공합니다.",
    "description": "문제 정의 → 데이터 확인 → 정제 → 분석 → 시각화 → 해석 → 의사결정 흐름으로 가설을 검토합니다. 데이터 엔지니어가 신뢰할 데이터 파이프라인을 구축한다면 분석가는 지표의 의미와 변화 원인을 설명합니다. 예쁜 그래프만 만드는 것이 아니라 표본·누락·편향·인과 해석의 한계와 가능한 다음 행동을 전달해야 합니다.",
    "tasks": [
      "사용자·업무 질문을 가설과 지표 정의로 구체화합니다.",
      "SQL로 데이터를 추출하고 집계 기준·기간·분모를 확인합니다.",
      "결측·중복·이상치와 조인 증폭 등 품질 문제를 검사·정제합니다.",
      "탐색적 데이터 분석(EDA)으로 분포·관계·변화를 확인합니다.",
      "통계와 비교 분석으로 가설을 검토하고 불확실성을 설명합니다.",
      "대시보드·차트로 핵심 지표와 해석을 전달합니다.",
      "분석 코드·데이터 사전·계산식·출처를 관리해 재현성을 확보합니다.",
      "관계자와 결과·한계·후속 실험 또는 의사결정 대안을 논의합니다."
    ],
    "essentialSkills": [
      "SQL",
      "Python",
      "Pandas",
      "Statistics",
      "Data Visualization",
      "Data Cleaning",
      "Exploratory Data Analysis",
      "Communication"
    ],
    "plusSkills": [
      "R",
      "Tableau",
      "Power BI",
      "Looker Studio",
      "Machine Learning",
      "A/B Test",
      "Dashboard",
      "Business Metrics"
    ],
    "recruitmentKeywords": [
      "Data Analyst",
      "데이터 분석",
      "SQL",
      "Python",
      "Pandas",
      "통계",
      "BI",
      "시각화",
      "Dashboard",
      "지표",
      "A/B Test"
    ],
    "education": "SQL·Database로 정확한 집계와 JOIN을 익히고 Python·빅데이터 학습을 정제·EDA·시각화에 연결하세요. AI의 평가·편향 개념은 분석 한계를 이해하는 데 도움이 됩니다. R·BI 도구·A/B Test는 지원 공고와 분석 목표에 맞춰 추가 학습하세요.",
    "studyOrder": [
      "SQL·JOIN·집계 → 데이터 사전·키·분모 확인 → Python/Pandas 정제",
      "문제·가설·지표 → EDA·기초 통계 → 차트·해석·한계 설명",
      "재현 가능한 보고서 → 대시보드 검증 → 공고에 따라 BI·A/B Test 확장"
    ],
    "projectIdeas": [
      {
        "title": "공공데이터 지역 비교 분석",
        "description": "지역별 교통·시설·인구 자료로 질문과 지표를 정의합니다. 단위·기간·누락을 검토하고 인구 등 분모를 보정해 비교하며 결과의 한계와 가능한 정책·서비스 제안을 작성하세요."
      },
      {
        "title": "사용자 행동 분석과 대시보드",
        "description": "모의 이벤트로 방문·전환·재방문 지표를 정의하고 중복·테스트 계정을 제거합니다. SQL과 대시보드 합계를 대조하고 변화 원인 가설과 추가 수집할 데이터를 제시하세요."
      },
      {
        "title": "채용공고 기술 수요 분석",
        "description": "사용이 허용된 공고 자료의 중복·분류 기준·표본 편향을 점검합니다. 직무·기간별 기술 키워드를 분석하고 검색 규칙·오분류 검수·해석 한계를 공개해 취업 준비 제안을 만드세요."
      }
    ],
    "portfolio": [
      "질문·가설·지표의 분자/분모·기간·데이터 사전을 처음에 제시합니다.",
      "원본 출처·이용 조건·정제 규칙·품질 검사와 재현 가능한 SQL/Notebook을 공개합니다.",
      "조인 전후 행 수·집계 대조·결측 처리의 근거를 보여줍니다.",
      "차트마다 발견·가능한 설명·한계·다음 행동을 함께 적습니다.",
      "상관관계를 인과로 단정하지 않고 표본 편향과 불확실성을 설명합니다."
    ],
    "readinessChecklist": [
      "질문을 측정 가능한 지표와 가설로 바꿀 수 있다.",
      "SQL JOIN·집계 결과가 중복되거나 누락되지 않는지 검증할 수 있다.",
      "Python/Pandas로 결측·중복을 처리하고 이유를 설명할 수 있다.",
      "분포·표본·상관과 인과의 차이를 설명할 수 있다.",
      "차트와 대시보드 수치를 원 데이터와 대조할 수 있다.",
      "분석 결과·한계·의사결정 제안을 비전공자에게 설명할 수 있다."
    ],
    "interviewTopics": [
      "SQL·JOIN·GROUP BY·NULL",
      "데이터 품질·중복·누락·분모",
      "기초 통계·분포·표본",
      "EDA·이상치·시각화 선택",
      "상관·인과·편향·A/B Test",
      "재현성·지표 정의·결과 전달"
    ],
    "interviewCategories": [
      "데이터베이스 / SQL",
      "AI / 빅데이터"
    ],
    "certifications": [
      "sqld",
      "adsp",
      "ocp"
    ],
    "relatedRoles": [
      {
        "id": "data",
        "name": "데이터 엔지니어",
        "description": "분석에 사용할 데이터 수집·저장·파이프라인을 구축합니다."
      },
      {
        "id": "ai",
        "name": "AI 개발자",
        "description": "예측·AI 기능을 개발하고 평가해 서비스에 적용합니다."
      },
      {
        "name": "BI Analyst / Product Analyst",
        "description": "업무 지표·제품 행동 분석에 전문성을 쌓는 방향이며 기업별 역할 범위는 다릅니다."
      }
    ],
    "tags": [
      "SQL",
      "Python",
      "Pandas",
      "Statistics"
    ],
    "aliases": "데이터분석 분석가 SQL Python Pandas BI 시각화 Dashboard 통계 EDA",
    "suitability": "데이터에서 의미를 찾고 설명하는 것이 재미있다",
    "careerPath": [
      "데이터 분석가",
      "BI / Product Analyst"
    ],
    "category": "데이터·AI"
  }
];
export const jobComparisons = [
  {
    "title": "백엔드 vs 클라우드 네이티브",
    "roles": [
      "backend",
      "native"
    ],
    "description": "서버 업무 규칙·API·데이터 정합성과, 컨테이너 환경의 상태·확장·복구 설계를 비교하세요. 두 역량은 이어지며 MSA는 선택입니다."
  },
  {
    "title": "시스템 vs 클라우드 엔지니어",
    "roles": [
      "system",
      "cloud"
    ],
    "description": "서버·OS·네트워크 운영 기반과, 클라우드 네트워크·IAM·관리형 자원 설계가 중심인 역할을 구분하세요."
  },
  {
    "title": "클라우드 vs DevOps 엔지니어",
    "roles": [
      "cloud",
      "devops"
    ],
    "description": "인프라 설계·운영과, 코드 변경에서 테스트·배포까지 이어지는 전달 자동화를 구분하세요. 조직에 따라 겹칩니다."
  },
  {
    "title": "QA vs 백엔드 개발자",
    "roles": [
      "qa",
      "backend"
    ],
    "description": "품질 위험·테스트 설계·검증과 제품 기능 구현을 구분하세요. 결함 예방과 수용 기준은 함께 협의합니다."
  },
  {
    "title": "데이터 엔지니어 vs 데이터 분석가",
    "roles": [
      "data",
      "analyst"
    ],
    "description": "신뢰할 데이터 공급·파이프라인과, 지표·가설·해석·의사결정 근거가 중심인 역할을 구분하세요."
  },
  {
    "title": "데이터 엔지니어 vs AI 개발자",
    "roles": [
      "data",
      "ai"
    ],
    "description": "데이터 계약·품질·재처리와 모델·AI 기능의 평가·서비스 적용을 구분하세요."
  },
  {
    "title": "프론트엔드 vs 모바일 앱 개발자",
    "roles": [
      "frontend",
      "mobile"
    ],
    "description": "브라우저 UI와 스마트폰 앱을 구분하세요. 앱은 기기 권한·수명주기·오프라인과 배포 방식도 고려합니다."
  }
];
export const jobGuidance = {
skills: "핵심 기술은 프로젝트에서 직접 구현하고 설명해 보세요. 추가 기술은 지원 공고의 담당 업무와 필수·우대 조건에 맞춰 선택하세요.",
readiness: "각 항목을 직접 구현한 코드·테스트·문서·프로젝트 결과로 증명하세요.",
interview: "관련 문제를 자신의 말로 설명하고, 프로젝트의 설계와 오류 해결 경험을 함께 준비하세요."
};

// One role catalogue for future resume.html: do not duplicate IDs or names.
export const jobById = id => jobs.find(job => job.id === id);
export const jobLearningDocs = (job,docs) => docs.filter(doc => doc.jobIds.includes(job.id) || [doc.name,doc.english,...(doc.skillNames||[])].some(name=>[...job.essentialSkills,...job.plusSkills].some(skill=>skill.toLowerCase()===name.toLowerCase())) || (job.essentialSkills.includes('SQL')&&doc.id==='postgresql'));
export const jobIdentity = id => { const job=jobById(id);return job?{id:job.id,name:job.name,english:job.english,aliases:job.aliases}:null; };
export const jobMetadata = id => {const job=jobById(id),title=job?job.name+" 직무가이드 | 빅데이터소프트웨어공학과 취업 포털":"IT 직무 가이드 | K-BigData Portal";return {title,description:job?.overview||"11개 IT 직무의 역할, 학습 순서, 프로젝트와 포트폴리오 준비를 분야별로 확인하세요.",canonical:"https://portal.k-bigdata.kr/jobs.html"+(job?"?id="+encodeURIComponent(job.id):"")};};
