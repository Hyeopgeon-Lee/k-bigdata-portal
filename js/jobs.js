// Department career guide. IDs are stable public URLs; technologies are preparation examples.
export const jobs = [
  {
    "id": "backend",
    "name": "백엔드 개발자",
    "english": "Backend Developer",
    "overview": "Java/Spring 등을 이용해 API, 비즈니스 로직, 데이터베이스, 인증·권한 등 서비스의 서버 영역을 개발합니다.",
    "description": "화면에서 보낸 요청을 받아 업무 규칙에 맞게 처리하고, 데이터를 안전하게 저장하며 결과를 API로 돌려줍니다. 예약 중복이나 잘못된 접근처럼 정상 흐름 밖의 문제도 다룹니다. 클라우드 네이티브 개발이 배포 환경에 맞는 확장·복구 설계까지 강조한다면, 백엔드는 서버 기능과 데이터 정합성에 중심을 둡니다.",
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
      "REST API",
      "HTTP",
      "SQL",
      "RDBMS",
      "JPA",
      "Git"
    ],
    "plusSkills": [
      "Spring Security",
      "JWT",
      "Redis",
      "Message Queue",
      "JUnit",
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
      "SQL·JOIN·테이블 제약조건 → Spring Boot API·JPA·트랜잭션",
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
    "category": "IT 직무",
    "idea": "신청 마감·정원·취소 규칙을 정의하고, 동시 요청에서도 중복 예약이 생기지 않도록 DB 제약과 트랜잭션을 구현합니다. 권한별 API와 경쟁 상황 테스트를 포함하세요."
  },
  {
    "id": "native",
    "name": "클라우드 네이티브 개발자",
    "english": "Cloud Native Developer",
    "overview": "애플리케이션을 컨테이너와 Kubernetes 환경에 맞게 설계해 확장·배포·복구가 쉬운 서비스를 개발합니다.",
    "description": "Kubernetes 명령어를 실행하는 것만이 아니라, 인스턴스가 늘거나 재시작돼도 기능과 데이터가 안정적으로 유지되는 애플리케이션을 만듭니다. 상태와 설정을 분리하고 외부 의존성 실패·타임아웃을 설계하며 운영에서 원인을 추적할 수 있게 합니다. MSA는 선택 가능한 구조이지 모든 프로젝트의 필수 출발점은 아닙니다.",
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
    "category": "IT 직무",
    "idea": "다중 인스턴스에서도 정원과 신청 데이터가 일관되게 유지되도록 구현합니다. readiness·롤링 업데이트와 부하 시험으로 요청 손실·지연을 확인하세요."
  },
  {
    "id": "devops",
    "name": "DevOps 엔지니어",
    "english": "DevOps Engineer",
    "overview": "테스트·빌드·배포와 운영 확인을 자동화해 안정적인 소프트웨어 전달 체계를 만듭니다.",
    "description": "개발과 운영 사이의 반복 작업을 코드로 만들고 변경이 안전하게 사용자에게 전달되도록 합니다. 단순 서버 관리가 아니라 테스트 실패를 차단하고 배포·복구를 재현할 수 있는 흐름을 설계하는 역할입니다. 클라우드 인프라 설계와 업무가 겹치지만 핵심은 전달 과정의 자동화와 신뢰성입니다.",
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
      "GitHub",
      "CI/CD",
      "Docker",
      "Kubernetes",
      "Shell"
    ],
    "plusSkills": [
      "GitHub Actions",
      "Jenkins",
      "Terraform",
      "Ansible",
      "Prometheus",
      "Grafana",
      "Argo CD",
      "GitOps",
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
    "category": "IT 직무",
    "idea": "Pull Request 테스트가 실패하면 병합·배포를 막고, 승인된 변경만 버전 이미지로 전달합니다. 환경별 설정과 배포 후 health 확인을 포함하세요."
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
      "Linux",
      "Network",
      "Cloud",
      "TCP/IP",
      "DNS",
      "HTTP/HTTPS",
      "Security",
      "IAM"
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
        "description": "웹·앱·DB의 접근 경로를 분리하고 IAM·방화벽·HTTPS를 적용합니다. 허용되지 않은 접근을 검증하며 예상 비용을 기록하세요."
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
      "클라이언트에서 앱·DB까지 네트워크 경로를 설명할 수 있다.",
      "Linux·DNS·포트·HTTPS 문제를 구간별로 점검할 수 있다.",
      "Compute·네트워크·저장소를 구성하고 선택 이유를 말할 수 있다.",
      "IAM과 보안 규칙으로 최소 권한을 적용할 수 있다.",
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
    "aliases": "클라우드 인프라 네트워크 서버",
    "category": "IT 직무",
    "idea": "웹·앱·DB의 접근 경로를 분리하고 IAM·방화벽·HTTPS를 적용합니다. 허용되지 않은 접근을 검증하며 예상 비용을 기록하세요."
  },
  {
    "id": "data",
    "name": "데이터 엔지니어",
    "english": "Data Engineer",
    "overview": "여러 출처의 데이터를 수집·정제·저장·가공해 분석과 AI가 안정적으로 사용할 데이터 환경을 구축합니다.",
    "description": "데이터를 가져오는 것에서 끝내지 않고 누락·중복·스키마 변경과 장애 후 재처리까지 책임지는 흐름을 만듭니다. 데이터 분석가가 데이터를 활용해 해석·의사결정을 돕는다면, 데이터 엔지니어는 그 데이터가 신뢰할 수 있게 공급되는 파이프라인과 플랫폼을 구축합니다. AI 개발자와는 데이터 계약과 품질 기준을 함께 정합니다.",
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
    "category": "IT 직무",
    "idea": "서로 다른 파일/API를 표준 스키마로 적재하고 누락·중복·단위 오류를 검사합니다. 출처·라이선스와 품질 실패 시 격리·재처리를 구현하세요."
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
    "education": "Python·SQL·빅데이터에서 데이터 준비를, AI 학습에서 모델·평가의 기초를 연결합니다. Spring Boot 또는 웹 API와 Vue.js·Flutter 화면을 통해 AI 결과를 사용자 흐름에 적용하고 Docker·Cloud Native로 실행 환경을 재현하세요. LLM·RAG·Agent는 AI 기초 위에 확장하는 실무 예시이며 특정 교과목 개설을 의미하지 않습니다.",
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
      "추론 API·화면 흐름·지연·비용·성능 측정과 개인정보·편향·도구 권한 검토를 제시합니다."
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
    "category": "IT 직무",
    "idea": "사용이 허용된 데이터로 규칙 기반과 ML 모델을 비교합니다. 클래스별 정밀도·재현율과 오류 사례, 담당자 수정 피드백·추론 API를 구현하세요."
  },
  {
    "id": "frontend",
    "name": "프론트엔드 개발자",
    "english": "Frontend Developer",
    "overview": "사용자가 웹서비스에서 직접 보고 조작하는 화면과 사용자 경험을 구현합니다.",
    "description": "디자인을 화면으로 옮기는 것에 더해 API 요청과 상태 변화, 입력·오류·접근성을 설계합니다. 느린 네트워크나 비어 있는 결과에서도 사용자가 다음 행동을 알 수 있도록 만듭니다. 백엔드와 API 계약을 맞추고 모바일·키보드·보조기술에서 같은 기능을 이용할 수 있게 검증합니다.",
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
      "REST API",
      "Git"
    ],
    "plusSkills": [
      "TypeScript",
      "Vue.js",
      "React",
      "State Management",
      "Web Accessibility",
      "Web Performance",
      "Testing"
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
      "REST API·Loading/Empty/Error → Vue.js 컴포넌트·상태 관리",
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
    "category": "IT 직무",
    "idea": "실제 또는 모의 API를 연동하고 로딩·빈 결과·실패·재시도를 구현합니다. 요청 순서 경쟁, 필터·검색 상태와 키보드 사용을 검증하세요."
  }
];
export const jobComparisons = [
  {
    "title": "백엔드 vs 클라우드 네이티브",
    "roles": [
      "backend",
      "native"
    ],
    "description": "백엔드는 서버 기능·업무 규칙·데이터 정합성 구현이 중심입니다. 클라우드 네이티브는 그 앱이 컨테이너·Kubernetes 환경에서 확장·배포·복구될 수 있도록 상태·설정·관측까지 설계합니다. 두 역량은 이어지며 MSA가 항상 필요한 것은 아닙니다."
  },
  {
    "title": "DevOps vs 클라우드 엔지니어",
    "roles": [
      "devops",
      "cloud"
    ],
    "description": "DevOps는 개발·테스트·빌드·배포·운영 확인의 자동화가 중심입니다. 클라우드 엔지니어는 서버·네트워크·스토리지·IAM·보안의 설계와 운영이 중심입니다. 조직에 따라 한 사람이 두 영역을 맡거나 역할이 겹칠 수 있습니다."
  },
  {
    "title": "데이터 엔지니어 vs AI 개발자",
    "roles": [
      "data",
      "ai"
    ],
    "description": "데이터 엔지니어는 분석과 AI에 신뢰할 데이터를 공급하는 흐름·플랫폼을 만듭니다. AI 개발자는 데이터를 이용해 모델·AI 기능을 개발·평가하고 서비스에 적용합니다. 분석가는 데이터를 해석해 의사결정을 돕는 역할로 구분됩니다."
  }
];
export const jobGuidance = {
skills: "필수 기술은 이 가이드에서 먼저 익힐 기초 역량이며 모든 기업의 공통 채용 요건은 아닙니다. 추가 기술은 실무 활용 예시입니다. 공고의 담당 업무·필수/우대 조건을 나누어 읽고 실제 요구 수준과 맞춰 준비하세요.",
readiness: "스스로 준비를 점검하는 학습 기준입니다. 체크 수로 합격 여부를 판단하지 않으며 특정 기업 취업을 보장하지 않습니다. 각 항목을 직접 구현한 코드·테스트·설명으로 증명해 보세요.",
interview: "아래 링크는 현재 문제은행의 관련 기초 카테고리입니다. JPA·Vue·LLM·RAG 등 모든 주제를 다루지는 않으므로 공식문서와 본인 프로젝트의 설계·실패 사례도 함께 준비하세요."
};
