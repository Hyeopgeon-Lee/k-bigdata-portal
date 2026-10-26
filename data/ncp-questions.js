// NCP Professional 공식 문서 기반 자체 제작 연습문제. 실제 기출·복원 문제 원문이 아닙니다.
// 출처와 기술 사양은 시험 전 다시 확인하세요.
export const ncpQuestions = [
  {
    "id": "NCP-001",
    "exam": "NCP-200",
    "area": "Overview",
    "topic": "Overview",
    "difficulty": "하",
    "question": "NCP Professional의 200 시험에서 다루는 대표 영역의 조합은?",
    "options": [
      "Network와 Database",
      "Troubleshooting 단독",
      "Application/AI와 Security",
      "Overview와 Compute/Storage"
    ],
    "answer": "D",
    "explanation": "공식 시험 안내에 200은 Overview, Compute/Storage로 구분됩니다.",
    "sourceUrl": "https://edu.ncloud.com/certi/rating",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-002",
    "exam": "NCP-200",
    "area": "Overview",
    "topic": "Overview",
    "difficulty": "하",
    "question": "NCP Professional 자격 취득을 위해 모두 합격해야 하는 시험 코드는?",
    "options": [
      "200·202만",
      "200·202·207",
      "100·200·202",
      "301·302·303"
    ],
    "answer": "B",
    "explanation": "Professional은 200·202·207 총 3개 시험으로 구성됩니다.",
    "sourceUrl": "https://edu.ncloud.com/certi/rating",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-003",
    "exam": "NCP-200",
    "area": "Overview",
    "topic": "Overview",
    "difficulty": "하",
    "question": "NCP 기술자격시험의 과목별 출제 문항 수는?",
    "options": [
      "100문항",
      "40문항",
      "20문항",
      "60문항"
    ],
    "answer": "D",
    "explanation": "네이버클라우드 공식 FAQ가 각 과목당 60문항이라고 안내합니다.",
    "sourceUrl": "https://www.ncloud.com/support/faq/edu/1937?categoryCode2=QCRT",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-004",
    "exam": "NCP-200",
    "area": "Compute",
    "topic": "Compute / Auto Scaling",
    "difficulty": "하",
    "question": "Auto Scaling에서 새 서버의 사양을 미리 정의하는 구성 요소는?",
    "options": [
      "NAT Gateway",
      "Launch Configuration",
      "Cloud Log Analytics",
      "Target Group"
    ],
    "answer": "B",
    "explanation": "Launch Configuration은 Auto Scaling 서버 생성을 위한 템플릿입니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/autoscaling-info",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-005",
    "exam": "NCP-200",
    "area": "Compute",
    "topic": "Compute / Auto Scaling",
    "difficulty": "하",
    "question": "Auto Scaling 정책에 따라 서버를 자동 증감시키는 논리적 서버 집합은?",
    "options": [
      "Auto Scaling Group",
      "Subnet Group",
      "Object Storage Bucket",
      "Network ACL"
    ],
    "answer": "A",
    "explanation": "Auto Scaling Group은 Launch Configuration을 이용해 서버를 동적으로 관리합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/autoscaling-info",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-006",
    "exam": "NCP-200",
    "area": "Compute",
    "topic": "Compute / Auto Scaling",
    "difficulty": "중",
    "question": "트래픽이 주기적으로 매일 오후에 급증한다. 적합한 Auto Scaling 방법은?",
    "options": [
      "무작위 서버 재부팅",
      "Object Storage 공개 전환",
      "일정 기반 Scaling",
      "매번 수동 서버 복구"
    ],
    "answer": "C",
    "explanation": "예측 가능한 주기적 부하에는 일정 기반 확장이 적합합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/autoscaling-info",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-007",
    "exam": "NCP-200",
    "area": "Compute",
    "topic": "Compute / Auto Scaling",
    "difficulty": "중",
    "question": "트래픽의 증가 시점을 예측하기 어렵다. 적절한 확장 방식은?",
    "options": [
      "오브젝트 버킷 정책 삭제",
      "모니터링 조건에 따른 정책 기반 Scaling",
      "매월 고정 시간에만 축소",
      "관리자 비밀번호 교체"
    ],
    "answer": "B",
    "explanation": "예측하기 힘든 수요는 메트릭이나 이벤트 기준 정책으로 대응합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/autoscaling-info",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-008",
    "exam": "NCP-200",
    "area": "Compute",
    "topic": "Compute / Auto Scaling",
    "difficulty": "중",
    "question": "Launch Configuration 생성 자체에 서버 사용 요금이 발생하는가?",
    "options": [
      "버킷 개수에 비례해 부과된다",
      "항상 서버 1대분 요금이 즉시 부과된다",
      "실제 서버가 생성되지 않으므로 템플릿만으로는 서버 요금이 없다",
      "Load Balancer 비용과 동일하다"
    ],
    "answer": "C",
    "explanation": "Launch Configuration은 서버 생성 템플릿이며 자체적으로 가상 서버를 띄우지 않습니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/autoscaling-info",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-009",
    "exam": "NCP-200",
    "area": "Compute",
    "topic": "Compute / Auto Scaling",
    "difficulty": "중",
    "question": "Auto Scaling과 Load Balancer를 연결하는 주된 목적은?",
    "options": [
      "DB 스키마를 자동 변경하기 위해",
      "서버 증감에 맞춰 트래픽 분산 대상을 관리하기 위해",
      "스토리지를 영구 삭제하기 위해",
      "VPC CIDR을 확장하기 위해"
    ],
    "answer": "B",
    "explanation": "Auto Scaling Group과 Load Balancer를 연결하면 대상 서버 관리가 자동화됩니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/autoscaling-info",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-010",
    "exam": "NCP-200",
    "area": "Compute",
    "topic": "Compute / Auto Scaling",
    "difficulty": "중",
    "question": "공식 가이드에서 Auto Scaling Group 한 개당 생성 가능한 서버 상한은?",
    "options": [
      "30대",
      "100대",
      "10대",
      "무제한"
    ],
    "answer": "A",
    "explanation": "공식 Auto Scaling 사양에는 그룹당 서버 최대 30대로 명시되어 있습니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/autoscaling-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-011",
    "exam": "NCP-200",
    "area": "Compute",
    "topic": "Compute / Auto Scaling",
    "difficulty": "중",
    "question": "공식 가이드에서 계정당 Launch Configuration 생성 가능 최대 수는?",
    "options": [
      "500개",
      "3개",
      "100개",
      "10개"
    ],
    "answer": "C",
    "explanation": "Auto Scaling 사양에는 계정당 Launch Configuration 최대 100개가 명시됩니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/autoscaling-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-012",
    "exam": "NCP-200",
    "area": "Compute",
    "topic": "Compute / Auto Scaling",
    "difficulty": "중",
    "question": "다음 중 공식 가이드상 Auto Scaling이 지원하지 않는 서버 종류는?",
    "options": [
      "서버 이미지 기반 일반 서버",
      "일반 가상 서버",
      "GPU 서버",
      "지원 조건을 만족하는 가상 서버"
    ],
    "answer": "C",
    "explanation": "공식 Auto Scaling 사양의 사용 불가 항목에 GPU 서버가 포함됩니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/autoscaling-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-013",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / NAS",
    "difficulty": "하",
    "question": "다수 서버에서 동일 파일을 공유해야 할 때 적합한 저장소 서비스는?",
    "options": [
      "NAS",
      "Auto Scaling",
      "Cloud Insight",
      "Global DNS"
    ],
    "answer": "A",
    "explanation": "NAS는 여러 서버가 볼륨을 마운트하여 파일을 공유하는 서비스입니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/nas-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-014",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / NAS",
    "difficulty": "하",
    "question": "Linux 서버에서 NAS 볼륨을 일반적으로 마운트할 때 사용하는 프로토콜은?",
    "options": [
      "NFS",
      "SNMP",
      "SMTP",
      "POP3"
    ],
    "answer": "A",
    "explanation": "공식 NAS 가이드는 Linux 서버의 NFS 볼륨 마운트를 안내합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/nas-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-015",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / NAS",
    "difficulty": "하",
    "question": "Windows 서버에 NAS 공유 볼륨을 연결하는 대표 프로토콜은?",
    "options": [
      "NTP",
      "ICMP",
      "CIFS",
      "BGP"
    ],
    "answer": "C",
    "explanation": "공식 NAS 가이드는 Windows에서 CIFS 방식 볼륨을 사용하도록 안내합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/nas-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-016",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / NAS",
    "difficulty": "중",
    "question": "공식 NAS 기본 사양에서 제공하는 기능으로 맞는 것은?",
    "options": [
      "DNS 레코드 등록만 지원",
      "스냅샷 및 모니터링 알림",
      "VPC 대역 자동 배정",
      "SMTP 메일 서버 호스팅 전용 기능"
    ],
    "answer": "B",
    "explanation": "NAS는 데이터 복구용 스냅샷과 사용량 이벤트/알림 기능을 제공합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/nas-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-017",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / NAS",
    "difficulty": "중",
    "question": "NAS 볼륨 생성 시 설정 가능한 데이터 암호화 방식은?",
    "options": [
      "Base64",
      "AES-256",
      "MD5 해시만",
      "ROT13"
    ],
    "answer": "B",
    "explanation": "NAS 가이드는 볼륨 생성 시 AES-256 암호화 선택을 안내합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/nas-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-018",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / NAS",
    "difficulty": "중",
    "question": "새 NAS 볼륨 사용의 일반적인 순서는?",
    "options": [
      "Load Balancer 삭제 후 파일 복사",
      "DB 백업 복원 후 스케일아웃",
      "서버 삭제 후 DNS 등록",
      "볼륨 생성·접근 설정 후 서버에서 마운트"
    ],
    "answer": "D",
    "explanation": "볼륨을 만들고 접근 제어를 설정한 뒤 서버에서 마운트합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/nas-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-019",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / Object Storage",
    "difficulty": "하",
    "question": "Object Storage에서 파일 등의 객체를 담는 논리적 공간은?",
    "options": [
      "Launch Configuration",
      "서브넷",
      "리더 노드",
      "버킷(Bucket)"
    ],
    "answer": "D",
    "explanation": "Object Storage는 버킷을 만들고 그 안에 객체를 저장합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/objectstorage-use-bucket",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-020",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / Object Storage",
    "difficulty": "중",
    "question": "Object Storage 콘솔에서 업로드 가능한 단일 파일 최대 크기는?",
    "options": [
      "100KB",
      "10TB",
      "20GB",
      "1GB"
    ],
    "answer": "D",
    "explanation": "공식 사용 가이드는 콘솔의 단일 파일 업로드 최대 1GB라고 명시합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/objectstorage-use-file",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-021",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / Object Storage",
    "difficulty": "중",
    "question": "Object Storage에서 콘솔 한도를 넘는 큰 객체를 업로드하는 방법은?",
    "options": [
      "Cloud Insight 알림만 등록",
      "VPN 터널 종료",
      "Network ACL 비활성화",
      "객체 업로드 API 사용"
    ],
    "answer": "D",
    "explanation": "문서상 대형 파일은 API 경로로 업로드할 수 있습니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/objectstorage-use-file",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-022",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / Object Storage",
    "difficulty": "상",
    "question": "공식 문서에서 Object Storage 업로드 API의 단일 객체 최대 한도는?",
    "options": [
      "1GB",
      "100MB",
      "10TB",
      "100TB"
    ],
    "answer": "C",
    "explanation": "가이드에 API 단일 파일 최대 10TB가 명시되어 있습니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/objectstorage-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-023",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / Object Storage",
    "difficulty": "중",
    "question": "Object Storage 과금 항목에 포함되는 것은?",
    "options": [
      "저장량·API 요청·네트워크 전송",
      "오직 서버 CPU 사용 시간",
      "가상화 호스트 라이선스만",
      "DNS 레코드 개수만"
    ],
    "answer": "A",
    "explanation": "공식 안내에는 저장량, API 요청 수, 전송 요금 항목이 있습니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/objectstorage-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-024",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / Object Storage",
    "difficulty": "중",
    "question": "Object Storage의 버킷 저장 용량에 관한 설명으로 맞는 것은?",
    "options": [
      "버킷당 100GB까지만",
      "버킷당 NAS 용량과 동일",
      "버킷당 1GB까지",
      "버킷 저장 용량에 별도 한도가 명시되어 있지 않다"
    ],
    "answer": "D",
    "explanation": "공식 사용 준비 문서에는 버킷의 저장 용량 제한이 없다고 안내됩니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/objectstorage-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-025",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / Object Storage",
    "difficulty": "상",
    "question": "계정에서 생성 가능한 Object Storage 버킷 상한(공식 가이드)은?",
    "options": [
      "1,000개",
      "10,000개",
      "3개",
      "30개"
    ],
    "answer": "A",
    "explanation": "Object Storage 사양 문서에 버킷 1,000개 이하 제한이 제시됩니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/objectstorage-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-026",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / Object Storage",
    "difficulty": "하",
    "question": "공유 공개가 아닌 특정 파일의 업로드·다운로드를 관리할 때 적절한 기본 단위는?",
    "options": [
      "Auto Scaling Group",
      "Network ACL 규칙",
      "VPC Peering",
      "버킷 안의 객체(파일)"
    ],
    "answer": "D",
    "explanation": "Object Storage는 버킷 및 객체 단위로 저장과 파일 작업을 수행합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/objectstorage-use-file",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-027",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / Object Storage",
    "difficulty": "하",
    "question": "대용량 정적 파일을 API로 저장하고 HTTP로 접근하려는 경우 적합한 서비스는?",
    "options": [
      "Network ACL",
      "Cloud DB for MySQL",
      "Object Storage",
      "Cloud Insight"
    ],
    "answer": "C",
    "explanation": "객체 기반 정적 파일 보관은 Object Storage의 대표적인 사용 시나리오입니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/objectstorage-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-028",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / Comparison",
    "difficulty": "중",
    "question": "서버 여러 대에 동일한 파일 시스템을 마운트하고 파일 잠금·경로를 다뤄야 한다. 적합한 것은?",
    "options": [
      "Cloud Activity Tracer",
      "Object Storage의 버킷만",
      "NAS",
      "Cloud Insight"
    ],
    "answer": "C",
    "explanation": "파일 시스템을 네트워크 공유하려면 NAS가 적절하며 객체 저장소와 사용 방식이 다릅니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/nas-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-029",
    "exam": "NCP-200",
    "area": "Compute",
    "topic": "Compute / Auto Scaling",
    "difficulty": "중",
    "question": "Auto Scaling에서 서버 생성 직후 환경 설정을 자동 수행할 때 활용할 구성은?",
    "options": [
      "Cloud Log Analytics 검색 결과",
      "Global DNS TXT 레코드",
      "보안그룹 삭제",
      "Init Script"
    ],
    "answer": "D",
    "explanation": "Launch Configuration에 초기화 스크립트를 미리 연계할 수 있습니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/autoscaling-info",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-030",
    "exam": "NCP-200",
    "area": "Storage",
    "topic": "Storage / Object Storage",
    "difficulty": "중",
    "question": "Object Storage 실수 삭제에 대비한 올바른 운영 방법은?",
    "options": [
      "API 키를 코드에 하드코딩",
      "감사 로그를 비활성화",
      "버킷을 항상 공개 설정",
      "중요 데이터의 별도 정기 백업"
    ],
    "answer": "D",
    "explanation": "공식 문서는 사용자 삭제 데이터 복구 불가 가능성을 경고하고 백업을 권합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/objectstorage-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-031",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / VPC",
    "difficulty": "하",
    "question": "VPC와 서브넷의 일반적인 관계로 올바른 것은?",
    "options": [
      "하나의 VPC 안에 여러 서브넷을 생성한다",
      "ACG 아래에 VPC가 종속된다",
      "하나의 서브넷 안에 여러 리전을 만든다",
      "DNS가 VPC CIDR을 지정한다"
    ],
    "answer": "A",
    "explanation": "서브넷은 VPC 내부에서 주소 공간을 나누는 구성입니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-spec-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-032",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / VPC",
    "difficulty": "중",
    "question": "공식 VPC 가이드에서 리전당 VPC 생성 한도는?",
    "options": [
      "1개",
      "30개",
      "3개",
      "200개"
    ],
    "answer": "C",
    "explanation": "공식 사양의 VPC 개수 기준은 리전당 3개입니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-spec-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-033",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / VPC",
    "difficulty": "상",
    "question": "공식 VPC 가이드에서 VPC 하나당 Subnet 생성 최대 수는?",
    "options": [
      "1,000개",
      "20개",
      "3개",
      "200개"
    ],
    "answer": "D",
    "explanation": "가이드 표에 Subnet 개수는 VPC당 200개로 안내됩니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-spec-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-034",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / VPC",
    "difficulty": "상",
    "question": "공식 가이드에서 지원하는 VPC IPv4 CIDR 범위는?",
    "options": [
      "/16에서 /28 사이",
      "/1에서 /8 사이",
      "/8만 지원",
      "/29에서 /32 사이"
    ],
    "answer": "A",
    "explanation": "공식 VPC 기본 사양은 /16~ /28의 주소 범위를 안내합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-spec-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-035",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / Security",
    "difficulty": "하",
    "question": "VPC의 Network ACL이 주로 적용되는 단위는?",
    "options": [
      "DB 테이블",
      "개별 파일",
      "Subnet",
      "Object Storage 객체"
    ],
    "answer": "C",
    "explanation": "Network ACL은 서브넷 접근 통제를 담당합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-nacl-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-036",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / Security",
    "difficulty": "하",
    "question": "VPC의 ACG가 주로 통제하는 것은?",
    "options": [
      "서버·NIC의 네트워크 통신",
      "DNS 등록 비용",
      "서브넷 라우팅 우선순위",
      "객체 저장소 수명주기"
    ],
    "answer": "A",
    "explanation": "ACG는 서버 통신을 허용하는 방화벽 정책을 담당합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-nacl-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-037",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / Security",
    "difficulty": "중",
    "question": "ACG와 Network ACL 상태 추적 방식에 대한 설명으로 옳은 것은?",
    "options": [
      "ACG는 Stateful, Network ACL은 Stateless",
      "둘 다 항상 Stateful",
      "둘 다 항상 Stateless",
      "ACL만 Stateful이고 ACG는 Stateless"
    ],
    "answer": "A",
    "explanation": "공식 문서의 주요 구분입니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-nacl-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-038",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / Security",
    "difficulty": "중",
    "question": "Network ACL이 제공하면서 ACG는 제공하지 않는 규칙 종류는?",
    "options": [
      "아웃바운드 허용",
      "인바운드 허용",
      "IP 기반 규칙",
      "명시적 차단(Deny) 규칙"
    ],
    "answer": "D",
    "explanation": "Network ACL은 허용 및 차단 규칙을 둘 다 지원하며 ACG는 허용 규칙 중심입니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-nacl-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-039",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / Security",
    "difficulty": "중",
    "question": "Network ACL의 Stateless 특징으로 인한 설정 시 주의사항은?",
    "options": [
      "응답 트래픽을 자동 허용한다고 가정한다",
      "접근 제어를 중복 구성하지 않는다",
      "요청·응답 방향을 각각 규칙으로 검토한다",
      "모든 서버 포트를 열어 둔다"
    ],
    "answer": "C",
    "explanation": "Stateless에서는 양방향을 별개로 다뤄야 합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-nacl-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-040",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / Security",
    "difficulty": "중",
    "question": "ACG Stateful 특징이 의미하는 것은?",
    "options": [
      "허용된 연결의 응답 트래픽을 상태에 따라 처리한다",
      "로그가 자동 영구 저장된다",
      "IP 대역이 자동 확장된다",
      "모든 아웃바운드가 명시적으로 거부된다"
    ],
    "answer": "A",
    "explanation": "ACG는 연결 상태 정보를 사용합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-nacl-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-041",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / Security",
    "difficulty": "상",
    "question": "공식 가이드에서 Network Interface 한 개에 적용 가능한 ACG 최대 개수는?",
    "options": [
      "3개",
      "30개",
      "50개",
      "1개"
    ],
    "answer": "A",
    "explanation": "기본 사양에는 Network Interface당 ACG 3개까지라고 안내합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-spec-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-042",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / Security",
    "difficulty": "상",
    "question": "VPC 하나당 ACG 규칙 수에 대한 올바른 단위는?",
    "options": [
      "ACG별 최대 50개",
      "서브넷별 최대 3개",
      "라우트 테이블별 최대 1개",
      "리전별 최대 5개"
    ],
    "answer": "A",
    "explanation": "VPC 기본 사양에는 ACG 규칙이 ACG당 최대 50개입니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-spec-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-043",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / Load Balancer",
    "difficulty": "하",
    "question": "VPC Load Balancer의 Target Group은 무엇을 의미하는가?",
    "options": [
      "요청을 처리할 등록 대상 서버의 집합",
      "Auto Scaling 청구서",
      "오브젝트 버킷 권한 목록",
      "DNS 존 파일"
    ],
    "answer": "A",
    "explanation": "Target Group은 트래픽 분배 대상 서버의 모음입니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/loadbalancer-targetgroup-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-044",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / Load Balancer",
    "difficulty": "하",
    "question": "로드밸런서의 Health Check를 설정하는 목적은?",
    "options": [
      "대상 서버의 서비스 정상 여부 판단",
      "버킷 자동 생성",
      "클라이언트 IP 주소 변경",
      "DB 스키마 버전 관리"
    ],
    "answer": "A",
    "explanation": "헬스 체크에 실패한 서버는 비정상 대상으로 판단됩니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/loadbalancer-targetgroup-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-045",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / Load Balancer",
    "difficulty": "중",
    "question": "HTTP Target Group에서 Health Check에 활용할 수 있는 항목은?",
    "options": [
      "NAS 암호화 키",
      "클라우드 계정 비밀번호",
      "URL Path 및 HTTP Method",
      "가상 서버 호스트명만"
    ],
    "answer": "C",
    "explanation": "HTTP/HTTPS 헬스 체크는 URL 경로와 메서드를 설정할 수 있습니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/loadbalancer-targetgroup-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-046",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / Load Balancer",
    "difficulty": "중",
    "question": "Health Check의 실패 임계치(Failure threshold)는 무엇을 정하는가?",
    "options": [
      "연속 실패로 대상을 비정상으로 바꾸는 기준",
      "전체 요청의 청구 금액",
      "Load Balancer 최대 개수",
      "오브젝트 버킷 최대 용량"
    ],
    "answer": "A",
    "explanation": "대상의 비정상 판정을 내리기 위한 실패 횟수를 뜻합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/loadbalancer-targetgroup-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-047",
    "exam": "NCP-202",
    "area": "Network",
    "topic": "Network / Load Balancer",
    "difficulty": "중",
    "question": "동일 VPC에 있으나 다른 서브넷에 있는 서버를 Target Group에 넣을 수 있는가?",
    "options": [
      "가능하다",
      "버킷을 만들어야만 가능하다",
      "동일 리전이어도 불가능하다",
      "항상 불가능하다"
    ],
    "answer": "A",
    "explanation": "문서는 같은 VPC 안에서는 존과 서브넷이 달라도 등록 가능하다고 안내합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/loadbalancer-targetgroup-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-048",
    "exam": "NCP-202",
    "area": "Database",
    "topic": "Database / MySQL",
    "difficulty": "하",
    "question": "Cloud DB for MySQL은 어떤 유형의 서비스인가?",
    "options": [
      "오브젝트 스토리지",
      "콘텐츠 전송 CDN",
      "관리형 관계형 DB 서비스",
      "VPC 라우팅 서비스"
    ],
    "answer": "C",
    "explanation": "MySQL을 관리형으로 제공하는 데이터베이스 서비스입니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/clouddbformysql-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-049",
    "exam": "NCP-202",
    "area": "Database",
    "topic": "Database / MySQL",
    "difficulty": "중",
    "question": "Cloud DB for MySQL의 고가용성(HA) 구성에서 Master 장애 시 사용하는 동작은?",
    "options": [
      "Standby Master로 자동 Failover",
      "서버 전체 즉시 삭제",
      "DNS 레코드만 수동 복사",
      "스토리지 버킷 공개 설정"
    ],
    "answer": "A",
    "explanation": "HA 모드에서는 Standby Master로 자동 절체합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/clouddbformysql-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-050",
    "exam": "NCP-202",
    "area": "Database",
    "topic": "Database / MySQL",
    "difficulty": "중",
    "question": "MySQL 조회 부하를 분산하기 위한 DB 구성 요소는?",
    "options": [
      "NFS 마운트",
      "NAT Gateway",
      "Read Replica(Slave Server)",
      "Load Balancer Health Check만"
    ],
    "answer": "C",
    "explanation": "읽기 복제 서버는 SELECT 부하를 분산하는 데 유용합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/clouddbformysql-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-051",
    "exam": "NCP-202",
    "area": "Database",
    "topic": "Database / MySQL",
    "difficulty": "상",
    "question": "공식 소개에서 Cloud DB for MySQL의 Read Replica 최대 수는?",
    "options": [
      "10대",
      "2대",
      "100대",
      "30대"
    ],
    "answer": "A",
    "explanation": "공식 가이드에는 최대 10개 Slave 서버 복제가 가능하다고 안내합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/clouddbformysql-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-052",
    "exam": "NCP-202",
    "area": "Database",
    "topic": "Database / MySQL",
    "difficulty": "중",
    "question": "Cloud DB for MySQL의 Stand Alone 서버도 지원되는 기능은?",
    "options": [
      "읽기 전용 Replication이 기본 필수",
      "HA 전용 수동 백업 기능 모두",
      "자동 백업 및 복원",
      "다중 Master 자동 구성"
    ],
    "answer": "C",
    "explanation": "공식 백업 가이드는 Stand Alone의 백업·복원을 지원합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/database-database-5-4",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-053",
    "exam": "NCP-202",
    "area": "Database",
    "topic": "Database / MySQL",
    "difficulty": "중",
    "question": "Cloud DB for MySQL 자동 백업의 기본 수행 주기는?",
    "options": [
      "실행할 수 없음",
      "매월 1회만",
      "매일 1회",
      "매초 1회"
    ],
    "answer": "C",
    "explanation": "공식 백업 문서에 하루 한 번 수행하도록 안내합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/database-database-5-4",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-054",
    "exam": "NCP-202",
    "area": "Database",
    "topic": "Database / MySQL",
    "difficulty": "상",
    "question": "Cloud DB for MySQL 백업 파일의 최대 보관 기간(가이드)은?",
    "options": [
      "30일",
      "3일",
      "무기한 보관만",
      "180일"
    ],
    "answer": "A",
    "explanation": "공식 문서상 사용자 설정에 따라 최대 30일까지 보관합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/database-database-5-4",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-055",
    "exam": "NCP-202",
    "area": "Management",
    "topic": "Management / Cloud Insight",
    "difficulty": "하",
    "question": "Cloud Insight의 Event Rule로 설정할 수 있는 작업은?",
    "options": [
      "버킷 용량 무제한 변경",
      "조건 충족 시 SMS·이메일 알림",
      "서버 OS 새 설치만",
      "MySQL 스키마 강제 복구"
    ],
    "answer": "B",
    "explanation": "Cloud Insight는 이벤트 조건과 통보·연동 동작을 구성합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/cloudinsight-use-eventrule",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-056",
    "exam": "NCP-202",
    "area": "Management",
    "topic": "Management / Cloud Insight",
    "difficulty": "중",
    "question": "Cloud Insight Event Rule 구성에서 반드시 지정하는 흐름은?",
    "options": [
      "감시 대상→감시 지표·조건→액션",
      "버킷 생성→NAS 마운트→RAID 설정",
      "과금 신청→서버 삭제→복원",
      "도메인 구매→DNS 이관→SSL 폐기"
    ],
    "answer": "A",
    "explanation": "Event Rule 생성의 기본 단계입니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/cloudinsight-use-eventrule",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-057",
    "exam": "NCP-202",
    "area": "Management",
    "topic": "Management / Cloud Insight",
    "difficulty": "중",
    "question": "Cloud Insight 이벤트 액션으로 연계 가능한 서비스 중 하나는?",
    "options": [
      "브라우저 쿠키 자동 삭제",
      "Cloud Functions",
      "데이터센터의 물리적 출입관리",
      "직원 인사정보 등록"
    ],
    "answer": "B",
    "explanation": "공식 Event Rule 가이드는 Cloud Functions 연계를 지원합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/cloudinsight-use-eventrule",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-058",
    "exam": "NCP-202",
    "area": "Management",
    "topic": "Management / Log Analytics",
    "difficulty": "하",
    "question": "Cloud Log Analytics의 주된 용도는?",
    "options": [
      "대규모 DNS 캐시 서버 구축",
      "서버 인스턴스 유형 변경",
      "VPC IP 대역 생성",
      "여러 서비스 로그 수집·검색·분석"
    ],
    "answer": "D",
    "explanation": "Cloud Log Analytics는 로그를 수집, 분석 및 검색합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/cla-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-059",
    "exam": "NCP-202",
    "area": "Management",
    "topic": "Management / Log Analytics",
    "difficulty": "중",
    "question": "Cloud Log Analytics에서 수집한 로그를 장기 보관용으로 내보낼 대상은?",
    "options": [
      "Launch Configuration",
      "Subnet",
      "ACG",
      "Object Storage"
    ],
    "answer": "D",
    "explanation": "로그를 Object Storage에 내보내는 기능을 제공합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/cla-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-060",
    "exam": "NCP-202",
    "area": "Management",
    "topic": "Management / Log Analytics",
    "difficulty": "중",
    "question": "Cloud Log Analytics의 로그 탐색 방식에 해당하는 것은?",
    "options": [
      "CPU 클럭 수동 오버클로킹",
      "NAT 게이트웨이 자동 교체",
      "키워드 및 시간 기반 검색",
      "DNS MX 레코드 재구성"
    ],
    "answer": "C",
    "explanation": "로그 검색은 시각·키워드·Lucene Query 등을 지원합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/cla-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-061",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Network",
    "difficulty": "중",
    "question": "서브넷 간 연결 문제 발생 시 Network ACL과 ACG를 순서대로 점검하려는 이유는?",
    "options": [
      "두 서비스가 모두 DB 백업을 담당하기 때문",
      "어느 것도 네트워크 통신과 관련이 없기 때문",
      "두 서비스가 둘 다 DNS만 변경하기 때문",
      "서브넷과 서버에 서로 다른 계층의 접근 통제가 있기 때문"
    ],
    "answer": "D",
    "explanation": "Subnet의 ACL과 서버 ACG를 모두 확인해야 연결 차단 원인을 분리할 수 있습니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-nacl-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-062",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Network",
    "difficulty": "중",
    "question": "ACG 인바운드가 허용돼도 응답이 없고 Network ACL을 쓰는 환경이다. 먼저 확인할 것은?",
    "options": [
      "모니터링 대시보드 색상",
      "Object Storage 버킷 개수",
      "MySQL 읽기 복제 수",
      "Network ACL 양방향 허용·차단 규칙"
    ],
    "answer": "D",
    "explanation": "Stateless Network ACL의 양방향 규칙 누락 가능성을 점검합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-nacl-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-063",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Network",
    "difficulty": "중",
    "question": "서비스 포트의 인바운드 ACG 규칙이 없어 외부 연결이 거절된다. 적절한 조치는?",
    "options": [
      "보안그룹 전체 삭제",
      "필요한 출발지와 포트만 허용 규칙으로 추가",
      "버킷을 공개로 변경",
      "모든 서버에서 모든 포트를 상시 개방"
    ],
    "answer": "B",
    "explanation": "최소 권한 원칙에 따라 제한된 인바운드 포트만 허용해야 합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-nacl-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-064",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Network",
    "difficulty": "중",
    "question": "Load Balancer 뒤 서버가 정상 실행 중이나 비정상(Unhealthy)으로 뜬다. 우선 점검할 것은?",
    "options": [
      "Target Group의 Health Check 포트·경로·응답",
      "Launch Configuration 한도",
      "VPC 생성 리전 수",
      "Object Storage 최대 파일 크기"
    ],
    "answer": "A",
    "explanation": "헬스 체크 설정이 실제 애플리케이션의 응답 방식과 맞는지 확인해야 합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/loadbalancer-targetgroup-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-065",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Network",
    "difficulty": "중",
    "question": "웹 애플리케이션이 /health에서는 200을 반환하나 /에서는 404를 반환한다. 헬스 체크가 /로 설정되었다면?",
    "options": [
      "고정 공인 IP만 삭제",
      "DB 복제 서버만 늘림",
      "Health Check 경로를 정상 응답하는 /health로 검토",
      "즉시 ACG 전체 해제"
    ],
    "answer": "C",
    "explanation": "상태 확인 엔드포인트는 실제 정상 응답하는 경로로 설정해야 합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/loadbalancer-targetgroup-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-066",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Network",
    "difficulty": "중",
    "question": "헬스 체크에 연속 실패 후 서버가 트래픽 분산에서 제외된다. 관련성이 큰 설정은?",
    "options": [
      "Launch Configuration 설명",
      "Failure threshold",
      "DB 자동 백업 시각",
      "Object Storage 버킷 이름"
    ],
    "answer": "B",
    "explanation": "타깃 비정상 판정은 실패 임계치와 연관됩니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/loadbalancer-targetgroup-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-067",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Monitoring",
    "difficulty": "중",
    "question": "CPU 과부하 알림이 반복된다. 원인을 파악할 첫 데이터 소스 조합은?",
    "options": [
      "서브넷 이름과 계정 프로필",
      "DNS MX 레코드와 버킷 목록",
      "CDN 공개 문서와 이미지 색상",
      "Cloud Insight CPU 메트릭과 로그"
    ],
    "answer": "D",
    "explanation": "메트릭으로 시점을 확인하고 로그로 프로세스·요청 원인을 교차 검증합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/cloudinsight-use-eventrule",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-068",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Monitoring",
    "difficulty": "하",
    "question": "오류가 발생한 시각 전후 애플리케이션 로그를 조회할 때 유용한 서비스는?",
    "options": [
      "NAT Gateway",
      "NAS 스냅샷만",
      "Cloud Log Analytics",
      "Launch Configuration"
    ],
    "answer": "C",
    "explanation": "Cloud Log Analytics는 로그의 시간·키워드 검색을 지원합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/cla-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-069",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Monitoring",
    "difficulty": "중",
    "question": "서버 여러 대에서 발생한 동일한 에러 문구를 비교하려면 적합한 방법은?",
    "options": [
      "VPC 3개를 추가 생성",
      "ACG를 일괄 초기화",
      "서버의 모든 로그 영구 삭제",
      "Cloud Log Analytics에서 서비스 로그를 통합 검색"
    ],
    "answer": "D",
    "explanation": "중앙 수집된 로그의 검색이 분산 장애 분석에 도움이 됩니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/cla-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-070",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Monitoring",
    "difficulty": "상",
    "question": "CPU 전체 평균은 45%인데 Cloud Insight 50% 이벤트가 발생했다. 공식 사례에 부합하는 원인은?",
    "options": [
      "CPU별 디멘션 중 하나가 50%를 넘었을 수 있다",
      "버킷 사용량 때문에 CPU 알림이 발생했다",
      "로그 검색이 항상 잘못됐다",
      "ACG가 모든 TCP 트래픽을 차단했다"
    ],
    "answer": "A",
    "explanation": "개별 CPU 디멘션 값이 임계치를 넘으면 이벤트가 발생할 수 있습니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/cloudinsight-troubleshoot-event",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-071",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Monitoring",
    "difficulty": "상",
    "question": "서버 평균 CPU 사용률로 Cloud Insight 알림을 받고 싶다. 공식 문서가 권하는 지표는?",
    "options": [
      "NAS 볼륨의 파일 수",
      "Object Storage 버킷 수",
      "CPU/used_rto에서 모든 디멘션 미선택",
      "SERVER/avg_cpu_used_rto"
    ],
    "answer": "D",
    "explanation": "공식 트러블슈팅 문서는 평균 CPU 목적에 SERVER/avg_cpu_used_rto 지표를 안내합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/cloudinsight-troubleshoot-event",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-072",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Database",
    "difficulty": "중",
    "question": "Cloud DB for MySQL의 Master 서버 장애 후 HA가 켜진 상태라면 예상되는 동작은?",
    "options": [
      "Standby Master로 Failover 절차 진행",
      "서브넷 전체 강제 초기화",
      "MySQL이 자동으로 NoSQL로 전환",
      "반드시 백업 버킷부터 삭제"
    ],
    "answer": "A",
    "explanation": "HA의 자동 절체가 수행되며 수 분 이상 소요될 수 있습니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/clouddbformysql-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-073",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Database",
    "difficulty": "중",
    "question": "MySQL Failover 중 잠시 서비스 연결이 실패한다. 운영자가 먼저 확인할 사항은?",
    "options": [
      "HA 절체 진행 상태와 DB 연결 복구 여부",
      "정상 서버를 모두 영구 삭제",
      "VPC CIDR을 임의로 변경",
      "Object Storage를 공개로 전환"
    ],
    "answer": "A",
    "explanation": "Failover는 즉시 끝나지 않을 수 있으므로 상태와 재연결을 검토합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/clouddbformysql-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-074",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Database",
    "difficulty": "중",
    "question": "읽기 요청량 급증으로 DB 조회 지연이 발생한다. 구조적으로 검토할 방법은?",
    "options": [
      "Master에 쓰기 트래픽을 더 집중",
      "Cloud Insight 전체 사용 중지",
      "ACG를 전부 허용으로 변경",
      "Read Replica 활용과 쿼리 병목 확인"
    ],
    "answer": "D",
    "explanation": "읽기 복제와 쿼리 최적화는 Read I/O 병목을 분리하는 데 도움이 됩니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/clouddbformysql-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-075",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Database",
    "difficulty": "중",
    "question": "실수로 DB 데이터를 삭제했다. 우선 검토해야 할 복구 자원은?",
    "options": [
      "Load Balancer 라운드 로빈 설정",
      "NAT Gateway 연결 정책",
      "CDN 캐시 TTL만",
      "보유 중인 Cloud DB for MySQL 백업"
    ],
    "answer": "D",
    "explanation": "백업이 존재한다면 복구 시점을 확인하고 안전하게 복원 절차를 계획합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/database-database-5-4",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-076",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Database",
    "difficulty": "상",
    "question": "Stand Alone DB에서 '시점 복원' 기능을 기대했지만 선택할 수 없다. 주된 이유는?",
    "options": [
      "ACG가 DNS를 차단해서",
      "Auto Scaling 정책이 비활성화돼서",
      "버킷 생성수가 부족해서",
      "공식 가이드상 Stand Alone은 시점 복원을 지원하지 않음"
    ],
    "answer": "D",
    "explanation": "Stand Alone은 일반 백업·복원은 가능하나 시점 복원은 미지원입니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/database-database-5-4",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-077",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Storage",
    "difficulty": "중",
    "question": "Linux 애플리케이션의 공유 디렉터리가 마운트되지 않는다. NAS 설정에서 첫 점검 항목은?",
    "options": [
      "CDN 서비스 상품명",
      "오토스케일링 그룹 개수",
      "NFS 볼륨과 서버의 마운트 정보·접근 권한",
      "DB 백업 파일의 확장자"
    ],
    "answer": "C",
    "explanation": "Linux NAS는 NFS 기반이며 올바른 마운트와 접근 규칙이 중요합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/nas-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-078",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Storage",
    "difficulty": "중",
    "question": "Windows 서버에서 Linux용 NFS 볼륨을 CIFS 경로처럼 접근하려 했다. 올바른 접근은?",
    "options": [
      "Windows용 CIFS 볼륨과 마운트 절차 확인",
      "Object Storage 버킷 삭제",
      "Cloud Insight 알림을 모두 제거",
      "Auto Scaling 서버를 30대 생성"
    ],
    "answer": "A",
    "explanation": "NAS는 OS에 맞는 프로토콜·연결 방식이 필요합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/nas-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-079",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Storage",
    "difficulty": "중",
    "question": "2GB 파일을 Object Storage 콘솔로 올리려다 제한 오류가 났다. 해결책은?",
    "options": [
      "ACG를 500개 추가",
      "콘솔 대신 API 기반 업로드 검토",
      "DB 복제 서버를 증설",
      "VPC를 2개 더 만듦"
    ],
    "answer": "B",
    "explanation": "콘솔 단일 파일 업로드는 1GB 제한이며 더 큰 파일은 API 업로드를 검토합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/objectstorage-use-file",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-080",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Storage",
    "difficulty": "중",
    "question": "Object Storage 객체를 삭제한 뒤 복원 요청이 왔다. 가장 적절한 답은?",
    "options": [
      "기존의 별도 백업·보존 체계부터 확인",
      "Load Balancer가 이전 객체를 복구",
      "ACG 변경으로 파일 내용 복원",
      "Object Storage가 모든 삭제 객체를 자동 복원"
    ],
    "answer": "A",
    "explanation": "공식 문서는 실수 삭제 시 복구가 어려울 수 있어 별도 백업을 권고합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/objectstorage-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-081",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Scaling",
    "difficulty": "상",
    "question": "서버 자동 확장 후 신규 인스턴스가 애플리케이션 준비 전에 요청을 받는다. 점검할 것은?",
    "options": [
      "초기화 스크립트·준비 상태·헬스 체크 설정",
      "DNS TXT 레코드의 유효기간만",
      "DB Snapshot 보관 기간만",
      "버킷 생성 한도"
    ],
    "answer": "A",
    "explanation": "서버 생성 이후 초기 설정과 정상 응답 판정의 시차를 분석해야 합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/autoscaling-info",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-082",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Scaling",
    "difficulty": "중",
    "question": "부하가 증가했지만 Auto Scaling 서버 수가 늘지 않는다. 우선 확인할 것은?",
    "options": [
      "관리자 웹 페이지 테마",
      "NAS 스냅샷 암호화 알고리즘만",
      "Object Storage 버킷 이름",
      "그룹 정책·모니터링 조건·용량 한도"
    ],
    "answer": "D",
    "explanation": "Scaling 규칙의 발동 여부와 그룹 최대 용량 등 설정을 확인합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/autoscaling-info",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-083",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Scaling",
    "difficulty": "중",
    "question": "Auto Scaling 그룹의 서버 수가 30대에서 더 늘지 않는다. 유력 원인은?",
    "options": [
      "그룹당 최대 30대 제한",
      "NAS 20TB 제한",
      "Object Storage 파일명 제한",
      "ACG 기본 허용 정책"
    ],
    "answer": "A",
    "explanation": "공식 그룹 생성 서버 상한은 30대입니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/autoscaling-spec",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-084",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Monitoring",
    "difficulty": "중",
    "question": "이벤트 알림은 왔지만 실제 조치가 없었다. 먼저 확인할 이벤트 설정은?",
    "options": [
      "VPC CIDR 크기",
      "버킷 객체 이름",
      "NAS 기본 용량",
      "Event Rule의 액션과 연계 대상"
    ],
    "answer": "D",
    "explanation": "Event Rule은 조건 외에도 알림/함수/Scaling 같은 액션 구성이 필요합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/cloudinsight-use-eventrule",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-085",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Monitoring",
    "difficulty": "상",
    "question": "Cloud Insight 이벤트가 예상보다 많이 반복된다. 무엇을 우선 검토해야 하는가?",
    "options": [
      "지속 시간·집계 방식·임계치·디멘션",
      "Object Storage 버킷 개수만",
      "DB 쿼리를 무조건 삭제",
      "NAS 암호화 키만"
    ],
    "answer": "A",
    "explanation": "메트릭 조건과 집계 단위, 반복 액션 설정이 알림 빈도에 영향을 줍니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/cloudinsight-use-eventrule",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-086",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Network",
    "difficulty": "중",
    "question": "Target Group 내 일부 서버만 장애로 표시된다. 우선 비교할 항목은?",
    "options": [
      "대상별 헬스 체크 결과와 해당 서버의 앱 상태",
      "버킷 수명주기 규칙만",
      "자격증 응시 결과",
      "전체 계정의 결제 주기"
    ],
    "answer": "A",
    "explanation": "각 대상의 상태 및 Health Check 응답을 비교해야 원인을 좁힐 수 있습니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/loadbalancer-targetgroup-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-087",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Network",
    "difficulty": "중",
    "question": "ACL 설정 이후 특정 외부 IP만 접근 불가다. 먼저 확인할 규칙은?",
    "options": [
      "NAS 사용량 과금 방식",
      "MySQL 백업 보관 기간",
      "출발지 IP/CIDR과 포트가 일치하는 ACL 허용·차단 규칙",
      "오브젝트 객체명 길이 제한"
    ],
    "answer": "C",
    "explanation": "외부 특정 대역 차단은 ACL의 소스 대역 및 우선순위 설정을 점검할 단서입니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/vpc-nacl-vpc",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-088",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Database",
    "difficulty": "중",
    "question": "백업 데이터 복원을 하기 전 운영 환경에서 중요한 안전 조치는?",
    "options": [
      "보안그룹 모두 제거",
      "복구 목표 시점 확인과 기존 데이터 보존",
      "감사 로그 일괄 삭제",
      "운영 DB를 이유 없이 즉시 삭제"
    ],
    "answer": "B",
    "explanation": "백업 시점과 복구 목표를 확인하여 데이터 덮어쓰기 위험을 줄입니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/database-database-5-4",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-089",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Monitoring",
    "difficulty": "중",
    "question": "Cloud Log Analytics 검색 결과를 외부 분석·보관에 사용하려 한다. 가능한 방법은?",
    "options": [
      "Route Table을 백업 파일로 저장",
      "엑셀 다운로드 또는 Object Storage 내보내기",
      "네트워크 ACL을 CSV 쿼리로 실행",
      "ACG 직접 데이터베이스 쓰기"
    ],
    "answer": "B",
    "explanation": "공식 CLA 문서는 검색 결과 다운로드와 객체 저장소 내보내기를 지원합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/cla-overview",
    "type": "공식문서 기반 자체 제작"
  },
  {
    "id": "NCP-090",
    "exam": "NCP-207",
    "area": "Troubleshooting",
    "topic": "Troubleshooting / Scaling",
    "difficulty": "중",
    "question": "주간 트래픽 급증이 매번 같은 시간에 발생한다. 반복 장애를 줄이는 개선 방법은?",
    "options": [
      "정해진 시간 전 Scaling 일정 설정",
      "모든 서버를 수동 중지",
      "CPU 알림 임계치를 무조건 100%로 변경",
      "Health Check 영구 비활성화"
    ],
    "answer": "A",
    "explanation": "예측 가능한 패턴에는 사전 일정 기반 확장이 유용합니다.",
    "sourceUrl": "https://guide.ncloud-docs.com/docs/autoscaling-info",
    "type": "공식문서 기반 자체 제작"
  }
];
