// Reviewed 150-question interview dataset · 2026-10-09.
// Existing IDs and visible codes are preserved; outdated explanations and fabricated examples are not loaded.
const reviewedRows = [
  {
    "id": "DS-001",
    "code": "DS-001",
    "group": "자료구조·Java 컬렉션",
    "category": "자료구조 / 알고리즘",
    "subCategory": "자료구조·Java 컬렉션",
    "difficulty": "기초",
    "question": "Java에서 배열과 List는 어떤 차이가 있으며, 각각 언제 사용하나요?",
    "shortAnswer": "배열은 한 번 만들면 길이가 고정됩니다. List는 구현체에 따라 다르지만, ArrayList처럼 원소를 추가·삭제하며 크기를 조절할 수 있습니다. 원소 수가 고정되면 배열, 바뀌면 가변 List를 주로 선택합니다.",
    "answerSeconds": 31,
    "jobTags": [
      "공통",
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": [
      "컬렉션",
      "Collection"
    ]
  },
  {
    "id": "q13",
    "code": "DS-002",
    "group": "자료구조·Java 컬렉션",
    "category": "자료구조 / 알고리즘",
    "subCategory": "자료구조·Java 컬렉션",
    "difficulty": "기초",
    "question": "스택과 큐의 차이와 서비스에서의 사용 예를 설명해 보세요.",
    "shortAnswer": "스택은 나중에 넣은 데이터를 먼저 꺼내는 LIFO, 큐는 먼저 넣은 데이터를 먼저 꺼내는 FIFO 구조입니다. 실행 취소에는 스택을, 순서대로 처리할 작업에는 큐를 활용합니다.",
    "answerSeconds": 26,
    "jobTags": [
      "공통",
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": [
      "컬렉션",
      "Collection"
    ]
  },
  {
    "id": "q14",
    "code": "DS-003",
    "group": "자료구조·Java 컬렉션",
    "category": "자료구조 / 알고리즘",
    "subCategory": "자료구조·Java 컬렉션",
    "difficulty": "기본",
    "question": "Queue와 Deque의 차이는 무엇이며, Java에서 어떻게 활용하나요?",
    "shortAnswer": "Queue는 보통 먼저 들어온 원소를 먼저 꺼내는 데 사용하고, Deque는 양쪽 끝에서 삽입과 삭제가 가능합니다. Java의 ArrayDeque는 큐와 스택 용도로 모두 사용할 수 있습니다.",
    "answerSeconds": 28,
    "jobTags": [
      "공통",
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": [
      "컬렉션",
      "Collection"
    ]
  },
  {
    "id": "DS-004",
    "code": "DS-004",
    "group": "자료구조·Java 컬렉션",
    "category": "자료구조 / 알고리즘",
    "subCategory": "자료구조·Java 컬렉션",
    "difficulty": "기본",
    "question": "단일 연결 리스트와 이중 연결 리스트의 차이를 설명해 보세요.",
    "shortAnswer": "단일 연결 리스트는 각 노드가 다음 노드를 가리키고, 이중 연결 리스트는 이전 노드와 다음 노드를 모두 가리킵니다. 이중 연결 리스트는 양방향 탐색이 편하지만 참조를 하나 더 저장합니다.",
    "answerSeconds": 26,
    "jobTags": [
      "공통",
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": [
      "컬렉션",
      "Collection"
    ]
  },
  {
    "id": "DS-005",
    "code": "DS-005",
    "group": "소프트웨어공학·협업",
    "category": "자료구조 / 알고리즘",
    "subCategory": "소프트웨어공학·협업",
    "difficulty": "기초",
    "question": "스크럼(Scrum)은 어떤 방식으로 개발하며, 스프린트에서는 무엇을 하나요?",
    "shortAnswer": "스크럼은 짧고 일정한 기간인 스프린트마다 제품의 작동 가능한 결과물을 만들고 검토하는 방식입니다. 스프린트 계획, 데일리 스크럼, 리뷰, 회고를 통해 진행 상황과 개선점을 확인합니다.",
    "answerSeconds": 27,
    "jobTags": [
      "공통",
      "백엔드",
      "DevOps"
    ],
    "sourceIds": [
      "scrum"
    ],
    "aliases": []
  },
  {
    "id": "DS-006",
    "code": "DS-006",
    "group": "Spring Boot·Backend",
    "category": "자료구조 / 알고리즘",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기초",
    "question": "Spring Boot에서 프로파일(Profile)은 왜 사용하며, 환경별 설정을 어떻게 구분하나요?",
    "shortAnswer": "Spring Boot 프로파일은 개발·운영 환경마다 다른 설정을 적용하는 기능입니다. 같은 코드를 사용하면서도 DB 주소나 로그 설정은 application-dev.yml, application-prod.yml처럼 구분해 관리할 수 있습니다. 비밀번호는 설정 파일에 직접 넣지 않고 별도로 관리합니다.",
    "answerSeconds": 44,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "DS-007",
    "code": "DS-007",
    "group": "Spring Boot·Backend",
    "category": "자료구조 / 알고리즘",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기초",
    "question": "Spring Boot의 @Value와 @ConfigurationProperties는 어떤 차이가 있나요?",
    "shortAnswer": "@Value는 설정값 한두 개를 주입할 때 간편합니다. @ConfigurationProperties는 관련 설정을 객체로 묶어 타입에 맞게 바인딩하고 검증할 때 적합합니다. 여러 항목이 있는 외부 API 설정에는 후자가 관리하기 쉽습니다.",
    "answerSeconds": 35,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "DS-008",
    "code": "DS-008",
    "group": "자료구조·Java 컬렉션",
    "category": "자료구조 / 알고리즘",
    "subCategory": "자료구조·Java 컬렉션",
    "difficulty": "기초",
    "question": "HashMap과 TreeMap의 차이와 사용 사례를 설명해 보세요.",
    "shortAnswer": "HashMap은 키를 이용한 조회가 평균적으로 빠르고 순서를 보장하지 않습니다. TreeMap은 키가 정렬된 상태로 유지되므로 범위 조회나 정렬된 순회가 필요할 때 선택합니다.",
    "answerSeconds": 26,
    "jobTags": [
      "공통",
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": [
      "컬렉션",
      "Collection"
    ]
  },
  {
    "id": "DS-009",
    "code": "DS-009",
    "group": "AI·데이터 기초",
    "category": "자료구조 / 알고리즘",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기본",
    "question": "AI 에이전트와 일반 챗봇은 무엇이 다른가요?",
    "shortAnswer": "일반적인 질의응답 챗봇은 사용자의 질문에 답하는 데 집중합니다. AI 에이전트는 목표를 위해 도구를 호출하고 결과를 확인하며 다음 작업을 결정할 수 있습니다. 다만 챗봇도 도구를 사용할 수 있어 구분이 절대적인 것은 아닙니다.",
    "answerSeconds": 31,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "ml"
    ],
    "aliases": []
  },
  {
    "id": "DS-010",
    "code": "DS-010",
    "group": "자료구조·Java 컬렉션",
    "category": "자료구조 / 알고리즘",
    "subCategory": "자료구조·Java 컬렉션",
    "difficulty": "기본",
    "question": "우선순위 큐와 일반 큐를 어떻게 구분하나요?",
    "shortAnswer": "일반 큐는 들어온 순서대로 처리하지만, 우선순위 큐는 우선순위가 높은 원소를 먼저 꺼냅니다. Java의 PriorityQueue는 기본적으로 원소의 정렬 기준에 따라 순서를 결정하며, 같은 우선순위의 입력 순서까지 보장하지는 않습니다.",
    "answerSeconds": 34,
    "jobTags": [
      "공통",
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": [
      "컬렉션",
      "Collection"
    ]
  },
  {
    "id": "DS-011",
    "code": "DS-011",
    "group": "자료구조·Java 컬렉션",
    "category": "자료구조 / 알고리즘",
    "subCategory": "자료구조·Java 컬렉션",
    "difficulty": "기본",
    "question": "재귀 함수를 작성할 때 종료 조건 외에 무엇을 고려하나요?",
    "shortAnswer": "재귀 함수에는 종료 조건뿐 아니라 매 호출이 종료 조건에 가까워지는 과정이 필요합니다. 호출이 깊어지면 스택 메모리가 부족할 수 있으므로 입력 규모가 크면 반복문으로 바꿀지도 검토합니다.",
    "answerSeconds": 27,
    "jobTags": [
      "공통",
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": [
      "컬렉션",
      "Collection"
    ]
  },
  {
    "id": "DS-012",
    "code": "DS-012",
    "group": "자료구조·Java 컬렉션",
    "category": "자료구조 / 알고리즘",
    "subCategory": "자료구조·Java 컬렉션",
    "difficulty": "기본",
    "question": "퀵 정렬의 동작 원리와 장단점을 설명해 보세요.",
    "shortAnswer": "퀵 정렬은 기준값을 정해 작은 값과 큰 값을 나누고 각 부분을 재귀적으로 정렬합니다. 평균 시간복잡도는 O(n log n)이지만 분할이 치우치면 O(n²)이 될 수 있습니다.",
    "answerSeconds": 25,
    "jobTags": [
      "공통",
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": [
      "컬렉션",
      "Collection"
    ]
  },
  {
    "id": "DS-013",
    "code": "DS-013",
    "group": "소프트웨어공학·협업",
    "category": "자료구조 / 알고리즘",
    "subCategory": "소프트웨어공학·협업",
    "difficulty": "기본",
    "question": "단위 테스트, 통합 테스트, E2E 테스트는 무엇이 다른가요?",
    "shortAnswer": "단위 테스트는 메서드나 작은 기능을, 통합 테스트는 여러 구성 요소의 연결을, E2E 테스트는 사용자 관점의 전체 흐름을 확인합니다. 로그인 기능이라면 비밀번호 검증, DB 연동, 실제 로그인 흐름을 각각 검사할 수 있습니다.",
    "answerSeconds": 31,
    "jobTags": [
      "공통",
      "백엔드",
      "DevOps"
    ],
    "sourceIds": [
      "scrum"
    ],
    "aliases": []
  },
  {
    "id": "DS-014",
    "code": "DS-014",
    "group": "AI·데이터 기초",
    "category": "자료구조 / 알고리즘",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기본",
    "question": "AI 에이전트가 외부 도구를 실행할 때 어떤 보안·권한 통제가 필요한가요?",
    "shortAnswer": "AI 에이전트가 외부 도구를 호출할 때는 필요한 권한만 부여하고, 삭제·결제 같은 작업은 사용자 승인을 받도록 설계하겠습니다. 입력과 도구 결과를 그대로 신뢰하지 않고 실행 기록을 남기는 것도 중요합니다.",
    "answerSeconds": 29,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "ml"
    ],
    "aliases": []
  },
  {
    "id": "DS-015",
    "code": "DS-015",
    "group": "자료구조·Java 컬렉션",
    "category": "자료구조 / 알고리즘",
    "subCategory": "자료구조·Java 컬렉션",
    "difficulty": "심화",
    "question": "검색·추가가 많은 서비스에서 자료구조를 어떻게 선택하겠습니까?",
    "shortAnswer": "키로 빠르게 찾는 일이 많으면 HashMap, 중복 제거가 중요하면 HashSet을 검토하겠습니다. 인덱스로 접근하거나 순서대로 순회하는 경우에는 ArrayList가 적합합니다. 실제 조회·삽입 패턴을 기준으로 선택합니다.",
    "answerSeconds": 33,
    "jobTags": [
      "공통",
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": [
      "컬렉션",
      "Collection"
    ]
  },
  {
    "id": "JAVA-001",
    "code": "JAVA-001",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기초",
    "question": "객체지향의 네 가지 특징을 실제 코드 설계와 연결해 설명해 보세요.",
    "shortAnswer": "캡슐화는 내부 상태를 보호하고, 추상화는 필요한 기능만 드러냅니다. 상속은 공통 기능을 재사용하고 다형성은 같은 인터페이스로 다른 구현을 호출하게 합니다. 실무에서는 상속보다 조합이 유연한 경우도 많습니다.",
    "answerSeconds": 30,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "JAVA-002",
    "code": "JAVA-002",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기초",
    "question": "Java의 static 변수는 인스턴스 변수와 어떻게 다른가요?",
    "shortAnswer": "인스턴스 변수는 객체마다 별도로 존재하고, static 변수는 클래스에 속해 여러 인스턴스가 공유합니다. 공통 상수에는 static final을 많이 사용하며, 변경 가능한 static 값은 동시성에 주의해야 합니다.",
    "answerSeconds": 32,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "JAVA-003",
    "code": "JAVA-003",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기초",
    "question": "오버로딩과 오버라이딩의 차이를 설명해 보세요.",
    "shortAnswer": "오버로딩은 메서드 이름은 같지만 매개변수 목록이 다른 메서드를 정의하는 것이고, 오버라이딩은 상속받은 메서드의 구현을 바꾸는 것입니다. 오버로딩은 컴파일 시 호출 메서드가 결정되고, 오버라이딩은 실행 시 실제 객체 타입에 따라 호출됩니다.",
    "answerSeconds": 34,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "q4",
    "code": "JAVA-004",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기본",
    "question": "인터페이스와 추상 클래스는 무엇이 다르며, Spring Boot에서는 어떻게 활용하나요?",
    "shortAnswer": "인터페이스는 구현 클래스가 지켜야 할 기능의 계약이고, 추상 클래스는 공통 상태와 구현을 함께 제공할 수 있습니다. Spring에서는 서비스 인터페이스와 구현체를 분리해 교체나 테스트를 쉽게 할 때 인터페이스를 활용합니다.",
    "answerSeconds": 32,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "q3",
    "code": "JAVA-005",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기초",
    "question": "Java의 ==와 equals()는 어떻게 다른가요?",
    "shortAnswer": "Java에서 == 연산자는 기본형의 값 또는 참조형의 객체 동일성을 비교합니다. equals()는 객체의 논리적 동등성을 비교하며 필요하면 클래스에서 재정의할 수 있습니다. String 내용 비교에는 equals()를 사용합니다.",
    "answerSeconds": 34,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "JAVA-006",
    "code": "JAVA-006",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기본",
    "question": "객체지향에서 상속을 사용하는 이유와 주의할 점을 설명해 보세요.",
    "shortAnswer": "상속은 공통 기능을 재사용하고 다형성을 구현하기 위해 사용합니다. 하지만 하위 클래스가 상위 클래스에 강하게 의존하므로, 단순한 코드 재사용만이 목적이라면 객체를 조합하는 방식도 고려합니다.",
    "answerSeconds": 28,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "JAVA-007",
    "code": "JAVA-007",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기초",
    "question": "String, StringBuilder, StringBuffer를 어떻게 선택하나요?",
    "shortAnswer": "String은 불변 객체이므로 문자열을 반복해서 수정하면 객체가 많이 만들어질 수 있습니다. 한 스레드에서 문자열을 자주 변경할 때는 StringBuilder를, 메서드가 동기화된 가변 문자열이 필요하면 StringBuffer를 검토합니다.",
    "answerSeconds": 35,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "JAVA-008",
    "code": "JAVA-008",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기초",
    "question": "Java의 List와 Set은 데이터 저장 방식과 중복 처리에서 어떻게 다른가요?",
    "shortAnswer": "List는 순서가 있고 중복을 허용합니다. Set은 중복 원소를 허용하지 않습니다. 주문 항목처럼 순서와 중복이 필요한 데이터는 List를, 고유한 태그 목록에는 Set을 선택할 수 있습니다.",
    "answerSeconds": 28,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "JAVA-009",
    "code": "JAVA-009",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기본",
    "question": "Java의 ArrayList와 LinkedList는 어떤 차이가 있나요?",
    "shortAnswer": "ArrayList는 배열 기반이라 인덱스로 접근하기 빠르고, 중간 삽입·삭제 시 원소를 옮길 수 있습니다. LinkedList는 노드 연결 방식이라 위치를 이미 알고 있을 때 연결 변경이 쉽지만, 원하는 위치를 찾는 데 시간이 듭니다.",
    "answerSeconds": 33,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "JAVA-010",
    "code": "JAVA-010",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기본",
    "question": "Java의 Map은 어떤 자료구조이며, 실제 서비스에서 어떻게 활용하나요?",
    "shortAnswer": "Map은 키와 값을 쌍으로 저장하는 인터페이스입니다. 키는 중복될 수 없고, 키로 값을 조회하거나 갱신할 수 있습니다. 회원 ID로 회원 정보를 찾는 임시 조회 구조에 활용할 수 있습니다.",
    "answerSeconds": 26,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "JAVA-011",
    "code": "JAVA-011",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기초",
    "question": "Java Collections Framework는 무엇이며, 어떤 컬렉션을 선택해야 하나요?",
    "shortAnswer": "Java Collections Framework는 List, Set, Queue, Map 같은 인터페이스와 구현체를 제공하는 표준 라이브러리입니다. 중복 허용 여부, 순서, 검색 속도, 동시성 요구에 맞춰 구현체를 선택합니다.",
    "answerSeconds": 33,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "JAVA-012",
    "code": "JAVA-012",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기초",
    "question": "JDK, JRE, JVM의 차이와 Java 프로그램 실행 과정을 설명해 보세요.",
    "shortAnswer": "JDK는 컴파일러 등 개발 도구를 포함하고, JRE는 실행에 필요한 환경을 뜻합니다. JVM은 컴파일된 바이트코드를 실행합니다. Java 소스를 javac로 바이트코드로 만든 뒤 JVM이 해석하거나 JIT 컴파일해 실행합니다.",
    "answerSeconds": 33,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "JAVA-013",
    "code": "JAVA-013",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기본",
    "question": "GC가 있는데도 Java에서 메모리 누수가 생길 수 있나요?",
    "shortAnswer": "가능합니다. GC는 참조가 끊어진 객체를 회수하지만, 더 이상 사용하지 않는 객체를 계속 참조하면 메모리를 회수하지 못합니다. 캐시나 static 컬렉션에 데이터를 무한히 쌓는 경우가 대표적입니다.",
    "answerSeconds": 29,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "JAVA-014",
    "code": "JAVA-014",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기본",
    "question": "JVM의 스택 메모리와 힙 메모리의 차이를 설명해 보세요.",
    "shortAnswer": "스택에는 보통 메서드 호출마다 필요한 지역 변수와 호출 정보가 쌓이고, 힙에는 객체와 배열이 저장됩니다. 스택은 스레드별로 관리되고 힙은 여러 스레드가 공유합니다.",
    "answerSeconds": 24,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "JAVA-015",
    "code": "JAVA-015",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기본",
    "question": "여러 스레드가 공유 값을 바꿀 때 synchronized는 무엇을 보장하나요?",
    "shortAnswer": "synchronized는 같은 모니터를 사용하는 스레드들이 임계 구역에 동시에 들어가지 못하게 합니다. 잠금 획득·해제에 따른 메모리 가시성도 보장하지만, 서로 다른 잠금을 사용하면 같은 데이터를 안전하게 보호하지 못할 수 있습니다.",
    "answerSeconds": 33,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "JAVA-016",
    "code": "JAVA-016",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "기본",
    "question": "제네릭을 사용하면 어떤 문제를 줄일 수 있나요?",
    "shortAnswer": "제네릭은 컬렉션 등에 저장할 타입을 컴파일 시점에 검사하게 해 줍니다. List<String>을 사용하면 문자열이 아닌 값을 넣는 실수를 막고, 꺼낼 때 불필요한 형변환을 줄일 수 있습니다.",
    "answerSeconds": 27,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "JAVA-017",
    "code": "JAVA-017",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "심화",
    "question": "Java의 record는 무엇이며, 일반 클래스와 어떤 차이가 있나요?",
    "shortAnswer": "record는 데이터를 담는 클래스를 짧게 선언하는 Java 문법입니다. 생성자, 접근자, equals(), hashCode(), toString() 등을 자동으로 제공하고 상속을 위한 클래스 확장은 할 수 없습니다. 필드 참조는 고정되지만 내부 객체까지 불변인 것은 아닙니다.",
    "answerSeconds": 40,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "JAVA-018",
    "code": "JAVA-018",
    "group": "Java·객체지향",
    "category": "Java",
    "subCategory": "Java·객체지향",
    "difficulty": "심화",
    "question": "Java의 모든 클래스가 상속받는 최상위 클래스는 무엇이며, 어떤 기능을 제공하나요?",
    "shortAnswer": "모든 Java 클래스의 최상위 클래스는 Object입니다. equals(), hashCode(), toString() 같은 기본 메서드를 제공하며 필요에 따라 재정의할 수 있습니다.",
    "answerSeconds": 28,
    "jobTags": [
      "Java",
      "백엔드"
    ],
    "sourceIds": [
      "java"
    ],
    "aliases": []
  },
  {
    "id": "DB-001",
    "code": "DB-001",
    "group": "데이터베이스·SQL",
    "category": "데이터베이스 / SQL",
    "subCategory": "데이터베이스·SQL",
    "difficulty": "기초",
    "question": "DBMS와 RDBMS의 역할을 설명해 보세요.",
    "shortAnswer": "DBMS는 데이터를 저장하고 조회·수정하며 권한과 트랜잭션을 관리하는 소프트웨어입니다. RDBMS는 그중 데이터를 테이블과 관계로 표현하고 SQL을 사용하는 관계형 DBMS입니다.",
    "answerSeconds": 28,
    "jobTags": [
      "공통",
      "백엔드",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "db"
    ],
    "aliases": []
  },
  {
    "id": "DB-002",
    "code": "DB-002",
    "group": "데이터베이스·SQL",
    "category": "데이터베이스 / SQL",
    "subCategory": "데이터베이스·SQL",
    "difficulty": "기초",
    "question": "Primary Key, Foreign Key, Unique Key의 차이는 무엇인가요?",
    "shortAnswer": "Primary Key는 각 행을 식별하며 NULL을 허용하지 않습니다. Foreign Key는 같은 테이블 또는 다른 테이블의 참조 가능한 키를 가리켜 관계를 유지합니다. Unique 제약은 값의 중복을 제한하며 NULL 허용 방식은 DBMS마다 다릅니다.",
    "answerSeconds": 36,
    "jobTags": [
      "공통",
      "백엔드",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "db"
    ],
    "aliases": []
  },
  {
    "id": "DB-003",
    "code": "DB-003",
    "group": "데이터베이스·SQL",
    "category": "데이터베이스 / SQL",
    "subCategory": "데이터베이스·SQL",
    "difficulty": "기본",
    "question": "데이터베이스 정규화는 무엇이며, 왜 필요한가요?",
    "shortAnswer": "정규화는 데이터의 함수 종속 관계를 고려해 테이블을 나누고, 불필요한 중복과 삽입·수정·삭제 이상을 줄이는 과정입니다. 데이터의 일관성을 유지하고 구조를 관리하기 쉽게 만드는 것이 목적입니다.",
    "answerSeconds": 28,
    "jobTags": [
      "공통",
      "백엔드",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "db"
    ],
    "aliases": []
  },
  {
    "id": "DB-004",
    "code": "DB-004",
    "group": "데이터베이스·SQL",
    "category": "데이터베이스 / SQL",
    "subCategory": "데이터베이스·SQL",
    "difficulty": "기초",
    "question": "트랜잭션의 ACID 속성 네 가지를 설명해 보세요.",
    "shortAnswer": "ACID는 원자성, 일관성, 격리성, 지속성입니다. 트랜잭션은 전부 성공하거나 실패해야 하고, 제약 조건을 지키며, 동시 실행을 적절히 격리하고, 완료된 결과를 장애 이후에도 유지해야 합니다.",
    "answerSeconds": 28,
    "jobTags": [
      "공통",
      "백엔드",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "db"
    ],
    "aliases": []
  },
  {
    "id": "q8",
    "code": "DB-005",
    "group": "데이터베이스·SQL",
    "category": "데이터베이스 / SQL",
    "subCategory": "데이터베이스·SQL",
    "difficulty": "기본",
    "question": "인덱스가 있는데도 쿼리가 느린 이유를 어떻게 찾나요?",
    "shortAnswer": "먼저 실행 계획에서 인덱스 사용 여부와 실제 처리 행 수를 확인하겠습니다. 조건절 선택도가 낮거나 함수·형변환이 인덱스 활용을 막을 수 있고, 정렬·JOIN이나 오래된 통계 정보도 느린 원인이 됩니다.",
    "answerSeconds": 28,
    "jobTags": [
      "공통",
      "백엔드",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "db"
    ],
    "aliases": []
  },
  {
    "id": "DB-006",
    "code": "DB-006",
    "group": "데이터베이스·SQL",
    "category": "데이터베이스 / SQL",
    "subCategory": "데이터베이스·SQL",
    "difficulty": "기본",
    "question": "B-Tree 계열 인덱스가 범위 검색에 적합한 이유는 무엇인가요?",
    "shortAnswer": "B-Tree 계열 인덱스는 키가 정렬되어 있어 특정 값뿐 아니라 시작값부터 끝값까지 연속해서 찾기 좋습니다. 그래서 BETWEEN이나 범위 비교에 자주 활용됩니다.",
    "answerSeconds": 24,
    "jobTags": [
      "공통",
      "백엔드",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "db"
    ],
    "aliases": []
  },
  {
    "id": "DB-007",
    "code": "DB-007",
    "group": "데이터베이스·SQL",
    "category": "데이터베이스 / SQL",
    "subCategory": "데이터베이스·SQL",
    "difficulty": "심화",
    "question": "제1·제2·제3정규형(1NF·2NF·3NF)의 차이를 설명해 보세요.",
    "shortAnswer": "1NF는 컬럼 값이 업무에서 정의한 기준으로 원자적이어야 합니다. 2NF는 복합 후보키 일부에만 종속되는 일반 속성을 없애고, 3NF는 키가 아닌 속성 간 이행 종속을 없애는 정규형입니다.",
    "answerSeconds": 27,
    "jobTags": [
      "공통",
      "백엔드",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "db"
    ],
    "aliases": []
  },
  {
    "id": "q7",
    "code": "DB-008",
    "group": "데이터베이스·SQL",
    "category": "데이터베이스 / SQL",
    "subCategory": "데이터베이스·SQL",
    "difficulty": "기초",
    "question": "BCNF(보이스-코드 정규형)는 무엇이며, 3NF와 어떻게 다른가요?",
    "shortAnswer": "BCNF는 모든 비자명한 함수 종속에서 결정자가 슈퍼키여야 한다는 조건입니다. 3NF보다 엄격해서, 3NF를 만족하더라도 일부 종속 관계 때문에 중복이 남는 경우 BCNF로 추가 분해할 수 있습니다.",
    "answerSeconds": 29,
    "jobTags": [
      "공통",
      "백엔드",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "db"
    ],
    "aliases": []
  },
  {
    "id": "DB-009",
    "code": "DB-009",
    "group": "데이터베이스·SQL",
    "category": "데이터베이스 / SQL",
    "subCategory": "데이터베이스·SQL",
    "difficulty": "기초",
    "question": "논리적 데이터 모델링과 물리적 데이터 모델링을 구분하는 이유는 무엇인가요?",
    "shortAnswer": "논리적 모델링은 업무에 필요한 데이터, 관계, 제약을 DBMS와 무관하게 정리합니다. 물리적 모델링은 이를 실제 DBMS의 테이블, 자료형, 인덱스 같은 구조로 구현합니다.",
    "answerSeconds": 26,
    "jobTags": [
      "공통",
      "백엔드",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "db"
    ],
    "aliases": []
  },
  {
    "id": "DB-010",
    "code": "DB-010",
    "group": "소프트웨어공학·협업",
    "category": "데이터베이스 / SQL",
    "subCategory": "소프트웨어공학·협업",
    "difficulty": "기본",
    "question": "애자일(Agile) 개발 방법론은 무엇이며, 기존 순차 개발 방식과 어떻게 다른가요?",
    "shortAnswer": "애자일은 짧은 주기로 동작하는 소프트웨어를 만들고 고객 피드백을 반영하는 접근법입니다. 처음 계획을 고정하기보다 변화에 대응한다는 점이 특징이며, 계획과 문서가 필요 없다는 뜻은 아닙니다.",
    "answerSeconds": 28,
    "jobTags": [
      "공통",
      "백엔드",
      "DevOps"
    ],
    "sourceIds": [
      "scrum"
    ],
    "aliases": []
  },
  {
    "id": "DB-011",
    "code": "DB-011",
    "group": "Spring Boot·Backend",
    "category": "데이터베이스 / SQL",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기본",
    "question": "AOP는 무엇이며, Spring Boot에서는 어떤 기능에 적용하나요?",
    "shortAnswer": "AOP는 여러 기능에 반복되는 공통 처리를 핵심 업무 코드와 분리하는 방법입니다. Spring에서는 트랜잭션, 로깅, 권한 검사 같은 횡단 관심사에 적용합니다.",
    "answerSeconds": 24,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "DB-012",
    "code": "DB-012",
    "group": "데이터베이스·SQL",
    "category": "데이터베이스 / SQL",
    "subCategory": "데이터베이스·SQL",
    "difficulty": "기본",
    "question": "SQL DB와 NoSQL DB는 어떤 요구에 따라 선택하나요?",
    "shortAnswer": "SQL 관계형 DB는 정해진 관계와 JOIN, 트랜잭션이 중요한 업무에 적합합니다. NoSQL은 문서·키값·그래프 등 다양한 모델을 제공하며 데이터 구조와 확장 요구에 맞춰 선택합니다. NoSQL이 항상 더 빠른 것은 아닙니다.",
    "answerSeconds": 32,
    "jobTags": [
      "공통",
      "백엔드",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "db"
    ],
    "aliases": []
  },
  {
    "id": "DB-013",
    "code": "DB-013",
    "group": "데이터베이스·SQL",
    "category": "데이터베이스 / SQL",
    "subCategory": "데이터베이스·SQL",
    "difficulty": "심화",
    "question": "동시 예약에서 DB 잠금과 교착상태에 어떻게 대응하나요?",
    "shortAnswer": "동시 예약에서는 먼저 중복을 막는 DB 제약과 트랜잭션을 설계합니다. 시간대가 겹치는 예약은 별도의 충돌 검사와 적절한 잠금이 필요할 수 있습니다. 교착상태는 잠금 순서를 통일하고 트랜잭션을 짧게 유지하며 재시도로 대응합니다.",
    "answerSeconds": 32,
    "jobTags": [
      "공통",
      "백엔드",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "db"
    ],
    "aliases": []
  },
  {
    "id": "DB-014",
    "code": "DB-014",
    "group": "데이터베이스·SQL",
    "category": "데이터베이스 / SQL",
    "subCategory": "데이터베이스·SQL",
    "difficulty": "심화",
    "question": "트랜잭션 격리 수준을 높이면 모든 문제가 해결되나요?",
    "shortAnswer": "아닙니다. 격리 수준을 높이면 동시 실행 이상을 줄일 수 있지만 잠금 대기와 처리량 감소가 발생할 수 있습니다. 업무에서 막아야 할 이상 현상을 정하고 필요한 수준을 선택해야 합니다.",
    "answerSeconds": 26,
    "jobTags": [
      "공통",
      "백엔드",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "db"
    ],
    "aliases": []
  },
  {
    "id": "DB-015",
    "code": "DB-015",
    "group": "네트워크·Web·HTTP",
    "category": "데이터베이스 / SQL",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기본",
    "question": "동기 통신과 비동기 통신의 차이를 서비스 호출 예시로 설명해 보세요.",
    "shortAnswer": "동기 호출은 응답을 받을 때까지 해당 작업 흐름이 기다리고, 비동기 호출은 요청 후 다른 일을 하다가 결과를 나중에 처리할 수 있습니다. 다만 비동기라고 해서 전체 처리 시간이 반드시 짧아지는 것은 아닙니다.",
    "answerSeconds": 28,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "DB-016",
    "code": "DB-016",
    "group": "Spring Boot·Backend",
    "category": "데이터베이스 / SQL",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기본",
    "question": "Spring Boot 4.x에서 동기·비동기 HTTP 호출에 사용하는 클라이언트를 비교해 보세요.",
    "shortAnswer": "동기식 HTTP 호출에는 RestClient를, 논블로킹·리액티브 방식에는 WebClient를 사용합니다. Spring Framework 7에서는 RestTemplate이 사용 중단 예정 API로 표시되어 RestClient가 권장됩니다. 호출 방식에 따라 선택하면 됩니다.",
    "answerSeconds": 41,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "DB-017",
    "code": "DB-017",
    "group": "AI·데이터 기초",
    "category": "데이터베이스 / SQL",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기본",
    "question": "MCP(Model Context Protocol)는 무엇이고, AI 에이전트에서 어떤 역할을 하나요?",
    "shortAnswer": "MCP는 AI 애플리케이션이 외부 도구와 데이터에 표준 방식으로 연결하도록 하는 프로토콜입니다. MCP 서버는 도구·리소스·프롬프트를 제공하고, 클라이언트가 이를 조회하고 사용할 수 있습니다. 도구 호출 권한은 별도로 통제해야 합니다.",
    "answerSeconds": 34,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "mcp"
    ],
    "aliases": []
  },
  {
    "id": "DB-018",
    "code": "DB-018",
    "group": "AI·데이터 기초",
    "category": "데이터베이스 / SQL",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기본",
    "question": "멀티에이전트 시스템은 무엇이며, 어떤 상황에서 효과적인가요?",
    "shortAnswer": "멀티에이전트 시스템은 여러 에이전트가 역할을 나누거나 협력해 하나의 작업을 수행하는 구조입니다. 조사와 검증처럼 분리가 뚜렷한 작업에서 유리할 수 있지만, 조정 비용과 결과 불일치가 늘 수 있어 무조건 효과적인 것은 아닙니다.",
    "answerSeconds": 32,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "ml"
    ],
    "aliases": []
  },
  {
    "id": "q9",
    "code": "OS-001",
    "group": "운영체제·Linux",
    "category": "운영체제",
    "subCategory": "운영체제·Linux",
    "difficulty": "기초",
    "question": "프로세스와 스레드의 자원 공유 방식은 어떻게 다른가요?",
    "shortAnswer": "프로세스는 독립된 주소 공간과 자원을 갖고, 한 프로세스의 스레드들은 코드·힙 등 자원을 공유합니다. 스레드는 데이터 공유가 쉽지만 동시에 값을 변경하면 동기화가 필요합니다.",
    "answerSeconds": 26,
    "jobTags": [
      "공통",
      "클라우드",
      "DevOps"
    ],
    "sourceIds": [
      "linux"
    ],
    "aliases": []
  },
  {
    "id": "OS-002",
    "code": "OS-002",
    "group": "운영체제·Linux",
    "category": "운영체제",
    "subCategory": "운영체제·Linux",
    "difficulty": "기초",
    "question": "Context Switching이 많으면 왜 성능에 영향을 주나요?",
    "shortAnswer": "Context Switching은 CPU가 실행 대상을 바꾸면서 레지스터와 실행 상태를 저장·복원하는 과정입니다. 전환이 잦으면 이 작업에 시간이 들고 캐시 효율이 낮아져 실제 업무 처리에 쓸 CPU 시간이 줄 수 있습니다.",
    "answerSeconds": 32,
    "jobTags": [
      "공통",
      "클라우드",
      "DevOps"
    ],
    "sourceIds": [
      "linux"
    ],
    "aliases": []
  },
  {
    "id": "OS-003",
    "code": "OS-003",
    "group": "운영체제·Linux",
    "category": "운영체제",
    "subCategory": "운영체제·Linux",
    "difficulty": "기초",
    "question": "CPU 스케줄링은 무엇을 기준으로 실행 순서를 정하나요?",
    "shortAnswer": "CPU 스케줄링은 어떤 작업에 CPU를 먼저 배정할지 결정하는 것입니다. 처리량, 응답 시간, 대기 시간, 공정성을 고려하며, 운영체제는 우선순위와 작업 특성에 따라 실행 순서를 조절합니다.",
    "answerSeconds": 28,
    "jobTags": [
      "공통",
      "클라우드",
      "DevOps"
    ],
    "sourceIds": [
      "linux"
    ],
    "aliases": []
  },
  {
    "id": "OS-004",
    "code": "OS-004",
    "group": "운영체제·Linux",
    "category": "운영체제",
    "subCategory": "운영체제·Linux",
    "difficulty": "기본",
    "question": "경쟁 상태와 임계 구역을 예로 설명해 보세요.",
    "shortAnswer": "경쟁 상태는 여러 스레드의 실행 순서에 따라 결과가 달라지는 문제입니다. 잔액 100에서 두 스레드가 각각 10을 빼는데 둘 다 옛 값을 읽으면 90만 남을 수 있습니다. 이런 공유 값 갱신 부분이 임계 구역입니다.",
    "answerSeconds": 29,
    "jobTags": [
      "공통",
      "클라우드",
      "DevOps"
    ],
    "sourceIds": [
      "linux"
    ],
    "aliases": []
  },
  {
    "id": "OS-005",
    "code": "OS-005",
    "group": "운영체제·Linux",
    "category": "운영체제",
    "subCategory": "운영체제·Linux",
    "difficulty": "기본",
    "question": "Mutex와 Semaphore는 어떤 상황에서 사용하나요?",
    "shortAnswer": "Mutex는 한 번에 하나의 실행 흐름만 임계 구역에 진입하도록 잠급니다. Semaphore는 허용 개수를 관리해 동시에 접근할 수 있는 작업 수를 제한합니다. DB 연결 풀처럼 동시 이용 수가 정해진 자원에 세마포어를 활용할 수 있습니다.",
    "answerSeconds": 33,
    "jobTags": [
      "공통",
      "클라우드",
      "DevOps"
    ],
    "sourceIds": [
      "linux"
    ],
    "aliases": []
  },
  {
    "id": "q10",
    "code": "OS-006",
    "group": "운영체제·Linux",
    "category": "운영체제",
    "subCategory": "운영체제·Linux",
    "difficulty": "기본",
    "question": "교착상태의 네 조건과 예방 방법을 설명해 보세요.",
    "shortAnswer": "교착상태의 네 조건은 상호 배제, 점유와 대기, 비선점, 순환 대기입니다. 예방하려면 자원 획득 순서를 통일하거나 잠금을 한꺼번에 획득하는 등 네 조건 중 하나가 성립하지 않도록 설계합니다.",
    "answerSeconds": 27,
    "jobTags": [
      "공통",
      "클라우드",
      "DevOps"
    ],
    "sourceIds": [
      "linux"
    ],
    "aliases": []
  },
  {
    "id": "OS-007",
    "code": "OS-007",
    "group": "운영체제·Linux",
    "category": "운영체제",
    "subCategory": "운영체제·Linux",
    "difficulty": "기초",
    "question": "가상 메모리와 페이징은 어떤 문제를 해결하나요?",
    "shortAnswer": "가상 메모리는 프로세스마다 독립된 가상 주소 공간을 제공하고 이를 물리 메모리에 매핑합니다. 페이징은 메모리를 일정한 크기의 페이지로 나눠 필요한 부분을 적재하고 관리해 메모리를 효율적으로 사용합니다.",
    "answerSeconds": 29,
    "jobTags": [
      "공통",
      "클라우드",
      "DevOps"
    ],
    "sourceIds": [
      "linux"
    ],
    "aliases": []
  },
  {
    "id": "OS-008",
    "code": "OS-008",
    "group": "운영체제·Linux",
    "category": "운영체제",
    "subCategory": "운영체제·Linux",
    "difficulty": "심화",
    "question": "Page Fault와 Thrashing을 구분해 설명해 보세요.",
    "shortAnswer": "Page Fault는 접근한 페이지가 현재 메모리에 없거나 접근 조건을 만족하지 않아 발생하는 예외입니다. Thrashing은 페이지 교체가 지나치게 잦아 실제 실행보다 메모리 교체에 시간을 많이 쓰는 상태입니다.",
    "answerSeconds": 31,
    "jobTags": [
      "공통",
      "클라우드",
      "DevOps"
    ],
    "sourceIds": [
      "linux"
    ],
    "aliases": []
  },
  {
    "id": "OS-009",
    "code": "OS-009",
    "group": "운영체제·Linux",
    "category": "운영체제",
    "subCategory": "운영체제·Linux",
    "difficulty": "기초",
    "question": "일반적인 프로그램의 스택과 힙을 어떻게 구분하나요?",
    "shortAnswer": "프로그램의 스택은 함수 호출에 필요한 지역 데이터와 복귀 정보를 관리하고, 힙은 실행 중 동적으로 할당한 메모리를 관리합니다. 할당 방식과 수명은 언어 및 실행 환경에 따라 달라집니다.",
    "answerSeconds": 26,
    "jobTags": [
      "공통",
      "클라우드",
      "DevOps"
    ],
    "sourceIds": [
      "linux"
    ],
    "aliases": []
  },
  {
    "id": "OS-010",
    "code": "OS-010",
    "group": "운영체제·Linux",
    "category": "운영체제",
    "subCategory": "운영체제·Linux",
    "difficulty": "기본",
    "question": "블로킹 I/O와 CPU 사용률을 어떻게 연결해서 설명하나요?",
    "shortAnswer": "블로킹 I/O에서는 작업이 입출력 결과를 기다리는 동안 해당 스레드가 실행을 이어 가지 못합니다. 이때 CPU 사용률이 낮아도 응답이 느릴 수 있으므로 CPU뿐 아니라 I/O 대기와 스레드 상태를 함께 확인합니다.",
    "answerSeconds": 30,
    "jobTags": [
      "공통",
      "클라우드",
      "DevOps"
    ],
    "sourceIds": [
      "linux"
    ],
    "aliases": []
  },
  {
    "id": "q1",
    "code": "OS-011",
    "group": "운영체제·Linux",
    "category": "운영체제",
    "subCategory": "운영체제·Linux",
    "difficulty": "기초",
    "question": "컴파일과 인터프리트는 어떻게 다르며 Java는 어떻게 실행되나요?",
    "shortAnswer": "컴파일은 코드를 미리 다른 형태의 코드로 변환하는 과정이고, 인터프리트는 실행하면서 명령을 처리하는 방식입니다. Java 소스는 바이트코드로 컴파일되고 JVM이 이를 해석하거나 JIT으로 기계어로 변환해 실행합니다.",
    "answerSeconds": 32,
    "jobTags": [
      "공통",
      "클라우드",
      "DevOps"
    ],
    "sourceIds": [
      "linux"
    ],
    "aliases": []
  },
  {
    "id": "q2",
    "code": "OS-012",
    "group": "운영체제·Linux",
    "category": "운영체제",
    "subCategory": "운영체제·Linux",
    "difficulty": "기본",
    "question": "SSH 개인키 파일의 권한을 600으로 설정하는 이유는 무엇인가요?",
    "shortAnswer": "chmod 600은 파일 소유자만 읽고 쓸 수 있도록 하고 그룹과 다른 사용자 접근을 막습니다. SSH 개인키는 다른 사용자가 읽을 수 없어야 하므로 이렇게 제한합니다.",
    "answerSeconds": 24,
    "jobTags": [
      "공통",
      "클라우드",
      "DevOps"
    ],
    "sourceIds": [
      "linux"
    ],
    "aliases": []
  },
  {
    "id": "q15",
    "code": "OS-013",
    "group": "운영체제·Linux",
    "category": "운영체제",
    "subCategory": "운영체제·Linux",
    "difficulty": "기초",
    "question": "Linux 파일 권한 755의 의미와 디렉터리 권한을 설명해 보세요.",
    "shortAnswer": "755는 소유자에게 읽기·쓰기·실행, 그룹과 다른 사용자에게 읽기·실행 권한을 부여합니다. 디렉터리에서 실행 권한은 그 디렉터리 안의 경로로 접근할 수 있는 권한과 관련됩니다.",
    "answerSeconds": 26,
    "jobTags": [
      "공통",
      "클라우드",
      "DevOps"
    ],
    "sourceIds": [
      "linux"
    ],
    "aliases": []
  },
  {
    "id": "q16",
    "code": "OS-014",
    "group": "운영체제·Linux",
    "category": "운영체제",
    "subCategory": "운영체제·Linux",
    "difficulty": "기본",
    "question": "Linux 서비스 프로세스는 있는데 응답하지 않으면 무엇부터 확인하나요?",
    "shortAnswer": "먼저 프로세스가 실제 요청 포트를 듣고 있는지 ss로 확인하고, 애플리케이션 로그와 오류를 보겠습니다. 이어서 localhost 요청, 방화벽, 프록시, DB 연결 상태를 순서대로 점검하겠습니다.",
    "answerSeconds": 29,
    "jobTags": [
      "공통",
      "클라우드",
      "DevOps"
    ],
    "sourceIds": [
      "linux"
    ],
    "aliases": []
  },
  {
    "id": "NET-001",
    "code": "NET-001",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기초",
    "question": "OSI 7계층과 TCP/IP 모델은 문제 해결에 어떻게 도움이 되나요?",
    "shortAnswer": "OSI 7계층은 네트워크 문제를 역할별로 나누어 이해하는 모델이고, TCP/IP 모델은 실제 인터넷 프로토콜 구조를 설명합니다. 통신 장애가 나면 물리 연결, IP 연결, TCP 연결, HTTP 응답 순서로 원인을 좁힐 수 있습니다.",
    "answerSeconds": 32,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "q11",
    "code": "NET-002",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기초",
    "question": "TCP와 UDP의 차이와 적합한 사용 예를 설명해 보세요.",
    "shortAnswer": "TCP는 연결을 맺고 전송 순서와 신뢰성을 관리합니다. UDP는 연결 설정과 전달 보장이 없어 가볍지만, 필요한 신뢰성은 상위 계층에서 처리해야 합니다. HTTP/1.1·HTTP/2는 TCP를, HTTP/3는 UDP 기반 QUIC을 사용합니다.",
    "answerSeconds": 35,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "NET-003",
    "code": "NET-003",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기초",
    "question": "TCP 연결의 3-Way Handshake를 설명해 보세요.",
    "shortAnswer": "TCP 연결 설정은 SYN, SYN-ACK, ACK 세 단계로 진행됩니다. 양쪽이 통신에 필요한 초기 순서 번호를 교환하고 연결 상태를 확인하는 과정입니다.",
    "answerSeconds": 23,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "NET-004",
    "code": "NET-004",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기본",
    "question": "TCP 종료를 4-Way Handshake로 설명하는 이유와 예외는 무엇인가요?",
    "shortAnswer": "TCP 종료는 양쪽 방향의 전송 종료를 각각 알리므로 보통 FIN과 ACK를 주고받는 네 단계로 설명합니다. 다만 ACK와 FIN이 함께 전송되거나 RST로 연결을 끊는 경우도 있어 항상 네 패킷은 아닙니다.",
    "answerSeconds": 29,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "q12",
    "code": "NET-005",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기초",
    "question": "HTTPS가 보호하는 범위와 보호하지 못하는 것은 무엇인가요?",
    "shortAnswer": "HTTPS는 TLS로 통신 내용을 암호화하고 전송 중 변조를 탐지하며 서버 인증을 지원합니다. 하지만 서버 자체가 침해되거나 사용자가 피싱 사이트에 정보를 입력하는 문제까지 해결하지는 못합니다.",
    "answerSeconds": 28,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "NET-006",
    "code": "NET-006",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기초",
    "question": "DNS는 무엇을 하며 도메인을 바꿨는데 이전 주소로 접속되는 이유는 무엇인가요?",
    "shortAnswer": "DNS는 도메인 이름을 IP 주소 같은 레코드로 조회하는 시스템입니다. 주소를 변경해도 예전 서버로 연결된다면 DNS 캐시에 남은 값과 TTL을 확인하겠습니다.",
    "answerSeconds": 24,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "NET-007",
    "code": "NET-007",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기본",
    "question": "SSH는 어떤 프로토콜이며, 서버 접속과 인증은 어떻게 이루어지나요?",
    "shortAnswer": "SSH는 원격 시스템에 암호화된 연결을 제공하는 프로토콜입니다. 서버 호스트키로 접속 대상을 확인하고 비밀번호나 공개키 방식 등으로 사용자를 인증해 원격 명령을 실행할 수 있습니다.",
    "answerSeconds": 26,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "NET-008",
    "code": "NET-008",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기초",
    "question": "HTTP 요청과 응답에는 어떤 정보가 들어가나요?",
    "shortAnswer": "HTTP 요청에는 메서드, URL, 헤더와 필요하면 본문이 들어갑니다. 응답에는 상태 코드, 헤더와 본문이 포함됩니다. API 오류를 분석할 때 이 정보부터 확인합니다.",
    "answerSeconds": 25,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "NET-009",
    "code": "NET-009",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기초",
    "question": "GET, POST, PUT, PATCH, DELETE를 API 설계에서 어떻게 구분하나요?",
    "shortAnswer": "GET은 조회, POST는 생성이나 처리를 요청할 때 많이 사용합니다. PUT은 리소스의 전체 교체, PATCH는 부분 변경, DELETE는 삭제에 사용합니다. 실제 의미는 API 계약에 맞게 정의해야 합니다.",
    "answerSeconds": 30,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "NET-010",
    "code": "NET-010",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기본",
    "question": "HTTP 메서드의 멱등성은 응답이 항상 같다는 뜻인가요?",
    "shortAnswer": "멱등성은 같은 요청을 여러 번 보내도 서버에 의도된 최종 효과가 한 번 보냈을 때와 같다는 뜻입니다. 응답 내용까지 같을 필요는 없습니다. GET·PUT·DELETE는 HTTP에서 멱등한 메서드로 정의됩니다.",
    "answerSeconds": 30,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "NET-011",
    "code": "NET-011",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기초",
    "question": "API에서 자주 쓰는 성공·클라이언트 오류·서버 오류 상태 코드를 설명해 보세요.",
    "shortAnswer": "200은 정상 처리, 201은 생성 성공, 204는 본문 없는 성공입니다. 400은 잘못된 요청, 401은 인증 필요, 403은 권한 부족, 404는 리소스 없음, 500은 서버 내부 오류를 뜻합니다.",
    "answerSeconds": 28,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "NET-012",
    "code": "NET-012",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기초",
    "question": "쿠키와 세션은 어디에 저장되고 어떻게 로그인 상태를 유지하나요?",
    "shortAnswer": "쿠키는 브라우저에 저장되고 요청할 때 서버로 전송될 수 있습니다. 서버 세션 방식에서는 브라우저가 세션 ID를 쿠키로 보내고, 서버가 해당 세션 데이터를 조회해 로그인 상태를 확인합니다.",
    "answerSeconds": 27,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "NET-013",
    "code": "NET-013",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기본",
    "question": "클라우드 네이티브 서비스에서 JWT를 사용하는 이유와 주의사항을 설명해 보세요.",
    "shortAnswer": "JWT는 서명된 인증 정보를 담아 여러 서버가 공통 기준으로 검증할 수 있어 분산 서비스에 유용합니다. 다만 토큰 내용은 기본적으로 암호화되지 않으므로 민감정보를 넣지 않고 서명·만료·발급자·대상자를 확인해야 합니다. 즉시 폐기 정책도 필요합니다.",
    "answerSeconds": 35,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "NET-014",
    "code": "NET-014",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기본",
    "question": "CORS 오류는 왜 생기며 서버 간 통신에도 같은 방식으로 적용되나요?",
    "shortAnswer": "CORS는 브라우저가 다른 출처로 요청할 때 서버의 허용 정책을 확인하는 보안 메커니즘입니다. 서버 간 HTTP 통신에는 브라우저의 CORS 제한이 적용되지 않습니다.",
    "answerSeconds": 25,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "NET-015",
    "code": "NET-015",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기본",
    "question": "REST API를 단순히 URL에 명사를 쓰는 것 이상으로 설명해 보세요.",
    "shortAnswer": "REST는 리소스를 URI로 식별하고, 일관된 인터페이스와 무상태성 같은 제약을 따르는 아키텍처 스타일입니다. HTTP API에서는 메서드와 상태 코드를 의미에 맞게 사용하지만, URL에 명사를 쓰는 것만으로 REST가 되는 것은 아닙니다.",
    "answerSeconds": 35,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "NET-016",
    "code": "NET-016",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "기본",
    "question": "WebSocket은 일반 HTTP 요청이나 폴링과 어떻게 다른가요?",
    "shortAnswer": "WebSocket은 초기 HTTP 핸드셰이크 후 하나의 연결을 유지하며 양쪽에서 메시지를 보낼 수 있습니다. 채팅이나 실시간 알림처럼 서버가 먼저 데이터를 보내야 할 때 폴링보다 효율적일 수 있습니다.",
    "answerSeconds": 29,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "NET-017",
    "code": "NET-017",
    "group": "네트워크·Web·HTTP",
    "category": "네트워크",
    "subCategory": "네트워크·Web·HTTP",
    "difficulty": "심화",
    "question": "프록시 뒤 API의 캐시·타임아웃 문제를 어떻게 분석하나요?",
    "shortAnswer": "먼저 요청이 브라우저, 프록시, 애플리케이션 중 어디에서 지연되는지 구분하겠습니다. 캐시 헤더와 프록시 캐시 설정, 연결·응답 타임아웃, 서버 로그를 같은 요청 ID 기준으로 확인합니다.",
    "answerSeconds": 27,
    "jobTags": [
      "공통",
      "백엔드",
      "클라우드"
    ],
    "sourceIds": [
      "http"
    ],
    "aliases": []
  },
  {
    "id": "SPR-001",
    "code": "SPR-001",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기초",
    "question": "Spring Framework와 Spring Boot의 차이를 설명해 보세요.",
    "shortAnswer": "Spring Framework는 IoC, DI, 웹, 데이터 접근 같은 기능을 제공하는 기반 프레임워크입니다. Spring Boot는 자동 설정과 Starter 의존성, 내장 서버 등을 통해 Spring 애플리케이션을 빠르게 시작하고 운영하기 쉽게 만듭니다.",
    "answerSeconds": 37,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "q5",
    "code": "SPR-002",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기초",
    "question": "IoC와 DI를 사용하는 이유를 테스트 예시로 설명해 보세요.",
    "shortAnswer": "IoC는 객체 생성과 연결의 제어를 컨테이너에 맡기는 개념이고, DI는 필요한 의존 객체를 외부에서 주입받는 방식입니다. 결제 서비스를 인터페이스로 주입받으면 테스트에서 실제 PG 대신 가짜 구현체를 넣을 수 있습니다.",
    "answerSeconds": 31,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "SPR-003",
    "code": "SPR-003",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기초",
    "question": "Maven과 Gradle 같은 빌드 도구가 필요한 이유와 역할을 설명해 보세요.",
    "shortAnswer": "Maven과 Gradle은 의존성 관리, 빌드, 테스트, 패키징을 자동화합니다. Maven은 주로 pom.xml을, Gradle은 build.gradle 또는 build.gradle.kts를 사용해 빌드 작업을 정의합니다.",
    "answerSeconds": 34,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "SPR-004",
    "code": "SPR-004",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기초",
    "question": "Component Scan이 하는 일과 Bean을 찾지 못할 때 확인할 것은 무엇인가요?",
    "shortAnswer": "Component Scan은 지정한 패키지에서 @Component 계열 클래스를 찾아 Spring Bean으로 등록합니다. Bean이 안 잡히면 스캔 범위, 애너테이션, 조건부 등록 설정부터 확인하겠습니다.",
    "answerSeconds": 31,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "SPR-005",
    "code": "SPR-005",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기초",
    "question": "Controller, Service, Repository를 나누는 이유는 무엇인가요?",
    "shortAnswer": "Controller는 HTTP 요청과 응답을 처리하고, Service는 업무 규칙을, Repository는 데이터 접근을 담당합니다. 책임을 나누면 테스트와 수정 범위가 명확해집니다.",
    "answerSeconds": 28,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "SPR-006",
    "code": "SPR-006",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기본",
    "question": "Spring MVC에서 요청이 Controller까지 가는 흐름을 설명해 보세요.",
    "shortAnswer": "요청이 들어오면 DispatcherServlet이 적절한 Handler를 찾고, 필요한 인자를 변환해 Controller 메서드를 호출합니다. 반환값은 메시지 컨버터나 View Resolver를 거쳐 HTTP 응답으로 만들어집니다.",
    "answerSeconds": 35,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "SPR-007",
    "code": "SPR-007",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기본",
    "question": "Filter와 Interceptor는 어디에서 동작하고 무엇이 다른가요?",
    "shortAnswer": "Filter는 서블릿 체인에서 동작해 Spring MVC 앞뒤의 요청을 처리하고, Interceptor는 DispatcherServlet 내부에서 핸들러 실행 전후에 동작합니다. 공통 로깅은 둘 다 가능하지만 인증은 보통 Spring Security 필터 체인을 활용합니다.",
    "answerSeconds": 40,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "SPR-008",
    "code": "SPR-008",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기본",
    "question": "Spring Cloud OpenFeign은 무엇이며, 언제 사용하나요?",
    "shortAnswer": "OpenFeign은 Java 인터페이스로 외부 HTTP API 호출을 선언할 수 있게 해 주는 Spring Cloud 프로젝트입니다. 서비스 간 호출 코드를 단순화할 수 있지만 타임아웃과 오류 처리는 별도로 설계해야 합니다.",
    "answerSeconds": 32,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "q6",
    "code": "SPR-009",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "심화",
    "question": "Spring Boot에서 @Transactional을 사용하는 이유와 적용 시 주의사항을 설명해 보세요.",
    "shortAnswer": "@Transactional은 여러 DB 작업을 하나의 트랜잭션으로 처리하도록 지정할 때 사용합니다. 기본적으로 RuntimeException이나 Error가 발생하면 롤백하지만 체크 예외는 그렇지 않습니다. 같은 객체 안의 직접 호출에는 프록시가 적용되지 않을 수 있습니다.",
    "answerSeconds": 40,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "SPR-010",
    "code": "SPR-010",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기초",
    "question": "JPA, Hibernate, Spring Data JPA의 관계는 무엇인가요?",
    "shortAnswer": "JPA는 ORM 표준 명세이고, Hibernate는 JPA를 구현한 ORM 프레임워크입니다. Spring Data JPA는 JPA를 쉽게 사용하는 Repository 추상화와 쿼리 메서드 등을 제공합니다.",
    "answerSeconds": 31,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "SPR-011",
    "code": "SPR-011",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기본",
    "question": "Entity와 영속성 Context의 역할을 설명해 보세요.",
    "shortAnswer": "Entity는 DB의 데이터를 객체로 표현하고, 영속성 컨텍스트는 엔티티의 상태와 변경을 관리합니다. 관리 중인 엔티티를 수정하면 변경 감지를 통해 SQL이 실행될 수 있습니다.",
    "answerSeconds": 26,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "SPR-012",
    "code": "SPR-012",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기본",
    "question": "Lazy Loading과 Eager Loading을 어떻게 선택하나요?",
    "shortAnswer": "지연 로딩은 연관 데이터를 실제로 사용할 때 조회하고, 즉시 로딩은 연관 데이터를 바로 불러오도록 설정합니다. 즉시 로딩도 별도 SQL이 실행될 수 있으므로 목록 API에서는 실제 쿼리를 확인하고 fetch join이나 DTO 조회를 선택하겠습니다.",
    "answerSeconds": 35,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "SPR-013",
    "code": "SPR-013",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기본",
    "question": "JPA 목록 API의 N+1을 찾고 해결하는 과정을 설명해 보세요.",
    "shortAnswer": "N+1은 목록을 한 번 조회한 뒤 각 항목의 연관 데이터를 추가로 조회해 쿼리가 늘어나는 문제입니다. SQL 로그에서 반복 조회를 확인하고 fetch join, EntityGraph 또는 DTO 조회로 필요한 데이터를 묶어 가져오겠습니다.",
    "answerSeconds": 34,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "SPR-014",
    "code": "SPR-014",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기초",
    "question": "API에서 DTO와 Entity를 구분하는 이유는 무엇인가요?",
    "shortAnswer": "Entity는 영속성과 업무 모델을 표현하고, DTO는 API에서 주고받을 데이터를 정의합니다. Entity를 그대로 반환하면 내부 필드 노출과 연관관계 직렬화 문제가 생길 수 있어 DTO로 응답 범위를 제어합니다.",
    "answerSeconds": 31,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "SPR-015",
    "code": "SPR-015",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기초",
    "question": "REST Controller의 입력 검증과 업무 검증은 어떻게 나누나요?",
    "shortAnswer": "입력 검증은 필수값, 길이, 형식 같은 규칙을 @Valid 등으로 검사합니다. 업무 검증은 이미 가입된 이메일인지, 예약 가능한 상태인지처럼 DB와 업무 조건을 확인하는 것입니다.",
    "answerSeconds": 26,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "SPR-016",
    "code": "SPR-016",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기본",
    "question": "백엔드 API의 예외 응답을 일관되게 관리하려면 어떻게 하나요?",
    "shortAnswer": "@RestControllerAdvice와 @ExceptionHandler로 예외를 한곳에서 처리하겠습니다. 오류 코드, 메시지, 시간, 요청 식별자 등 응답 형식을 통일하고, 내부 예외 내용은 외부에 그대로 노출하지 않겠습니다.",
    "answerSeconds": 34,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "SPR-017",
    "code": "SPR-017",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "기본",
    "question": "Spring Security에서 인증과 인가를 어떻게 구분하나요?",
    "shortAnswer": "인증은 사용자가 누구인지 확인하는 것이고, 인가는 그 사용자가 해당 기능에 접근할 권한이 있는지 확인하는 것입니다. 로그인에 성공했어도 관리자 API 접근은 별도의 권한 검사가 필요합니다.",
    "answerSeconds": 27,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "SPR-018",
    "code": "SPR-018",
    "group": "Spring Boot·Backend",
    "category": "Spring Boot",
    "subCategory": "Spring Boot·Backend",
    "difficulty": "심화",
    "question": "Spring API에 JWT 인증을 붙일 때 토큰 읽기 외에 무엇을 구현해야 하나요?",
    "shortAnswer": "JWT를 적용할 때는 Bearer 토큰 추출, 서명과 만료 검증, 인증 정보 구성, 권한 검사, 예외 응답을 구현해야 합니다. 토큰 탈취에 대비해 HTTPS와 짧은 만료 시간, 갱신·폐기 정책도 고려하겠습니다.",
    "answerSeconds": 30,
    "jobTags": [
      "백엔드",
      "Java"
    ],
    "sourceIds": [
      "springboot",
      "spring"
    ],
    "aliases": [
      "스프링부트",
      "SpringBoot"
    ]
  },
  {
    "id": "GIT-001",
    "code": "GIT-001",
    "group": "Git·GitHub",
    "category": "Git·GitHub",
    "subCategory": "Git·GitHub",
    "difficulty": "기초",
    "question": "Git과 GitHub는 어떻게 다르며 commit은 무엇을 남기나요?",
    "shortAnswer": "Git은 변경 이력을 관리하는 분산 버전 관리 도구이고, GitHub는 Git 저장소를 공유하고 협업하는 서비스입니다. commit은 특정 시점의 파일 변경 상태와 작성 정보를 기록합니다.",
    "answerSeconds": 28,
    "jobTags": [
      "공통",
      "백엔드",
      "DevOps"
    ],
    "sourceIds": [
      "git"
    ],
    "aliases": []
  },
  {
    "id": "GIT-002",
    "code": "GIT-002",
    "group": "Git·GitHub",
    "category": "Git·GitHub",
    "subCategory": "Git·GitHub",
    "difficulty": "기초",
    "question": "branch를 사용하는 이유와 생성 비용을 설명해 보세요.",
    "shortAnswer": "브랜치는 기능 개발이나 버그 수정을 기존 코드와 분리해 진행하기 위해 사용합니다. Git 브랜치는 주로 커밋을 가리키는 참조이므로 생성 비용이 작습니다.",
    "answerSeconds": 23,
    "jobTags": [
      "공통",
      "백엔드",
      "DevOps"
    ],
    "sourceIds": [
      "git"
    ],
    "aliases": []
  },
  {
    "id": "GIT-003",
    "code": "GIT-003",
    "group": "Git·GitHub",
    "category": "Git·GitHub",
    "subCategory": "Git·GitHub",
    "difficulty": "기본",
    "question": "merge와 rebase를 어떤 기준으로 선택하나요?",
    "shortAnswer": "merge는 두 브랜치의 이력을 합치고, rebase는 커밋을 다른 기준 커밋 위에 다시 적용해 이력을 정리합니다. 공유 중인 브랜치를 함부로 rebase하면 다른 사람의 작업 이력과 충돌할 수 있습니다.",
    "answerSeconds": 29,
    "jobTags": [
      "공통",
      "백엔드",
      "DevOps"
    ],
    "sourceIds": [
      "git"
    ],
    "aliases": []
  },
  {
    "id": "GIT-004",
    "code": "GIT-004",
    "group": "Git·GitHub",
    "category": "Git·GitHub",
    "subCategory": "Git·GitHub",
    "difficulty": "기초",
    "question": "git fetch와 git pull, git push는 어떻게 다른가요?",
    "shortAnswer": "fetch는 원격 변경 이력을 가져오지만 현재 브랜치는 합치지 않습니다. pull은 가져온 뒤 merge 또는 rebase를 수행하고, push는 로컬 커밋을 원격 저장소에 올립니다.",
    "answerSeconds": 27,
    "jobTags": [
      "공통",
      "백엔드",
      "DevOps"
    ],
    "sourceIds": [
      "git"
    ],
    "aliases": []
  },
  {
    "id": "GIT-005",
    "code": "GIT-005",
    "group": "Git·GitHub",
    "category": "Git·GitHub",
    "subCategory": "Git·GitHub",
    "difficulty": "기본",
    "question": "Git 충돌이 나면 어떤 순서로 해결하나요?",
    "shortAnswer": "먼저 충돌한 파일을 확인하고 양쪽 변경 의도를 비교합니다. 필요한 코드를 남긴 뒤 충돌 표시를 제거하고 테스트해 보겠습니다. 그다음 파일을 stage에 올려 merge나 rebase를 마무리합니다.",
    "answerSeconds": 29,
    "jobTags": [
      "공통",
      "백엔드",
      "DevOps"
    ],
    "sourceIds": [
      "git"
    ],
    "aliases": []
  },
  {
    "id": "GIT-006",
    "code": "GIT-006",
    "group": "Git·GitHub",
    "category": "Git·GitHub",
    "subCategory": "Git·GitHub",
    "difficulty": "기본",
    "question": "Pull Request를 잘 작성하려면 어떤 정보를 제공하나요?",
    "shortAnswer": "PR에는 왜 바꿨는지, 주요 변경 사항, 테스트 결과, 리뷰어가 확인할 부분을 적겠습니다. UI 변경이면 화면 자료를, API 변경이면 요청·응답 변경 내용을 함께 제공하겠습니다.",
    "answerSeconds": 26,
    "jobTags": [
      "공통",
      "백엔드",
      "DevOps"
    ],
    "sourceIds": [
      "git"
    ],
    "aliases": []
  },
  {
    "id": "GIT-007",
    "code": "GIT-007",
    "group": "Git·GitHub",
    "category": "Git·GitHub",
    "subCategory": "Git·GitHub",
    "difficulty": "기본",
    "question": ".gitignore에 비밀 파일을 추가하면 이미 올라간 비밀도 사라지나요?",
    "shortAnswer": "아닙니다. .gitignore는 앞으로 추적하지 않을 파일을 정하는 데 도움이 되지만 이미 커밋된 비밀정보를 지우지는 못합니다. 노출된 비밀키는 즉시 폐기·재발급하고 Git 이력과 배포 상태도 확인해야 합니다.",
    "answerSeconds": 30,
    "jobTags": [
      "공통",
      "백엔드",
      "DevOps"
    ],
    "sourceIds": [
      "git"
    ],
    "aliases": []
  },
  {
    "id": "GIT-008",
    "code": "GIT-008",
    "group": "Docker·Kubernetes",
    "category": "Git·GitHub",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기본",
    "question": "Docker와 Docker Compose는 어떤 차이가 있으며, 각각 언제 사용하나요?",
    "shortAnswer": "Docker는 컨테이너 이미지를 만들고 실행하는 플랫폼이고, Docker Compose는 여러 컨테이너의 실행 설정을 한 파일로 관리하는 도구입니다. 웹 서버와 DB를 로컬에서 함께 띄울 때 Compose가 편리합니다.",
    "answerSeconds": 32,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "q19",
    "code": "DK-001",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기초",
    "question": "컨테이너는 무엇이며, 가상머신(VM)과 어떤 차이가 있나요?",
    "shortAnswer": "컨테이너는 호스트 OS 커널을 공유하면서 프로세스를 격리해 실행합니다. VM은 별도의 게스트 OS를 포함하므로 일반적으로 자원 사용이 더 크지만 커널 수준에서도 독립됩니다.",
    "answerSeconds": 26,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "DK-002",
    "code": "DK-002",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기초",
    "question": "Docker와 Podman은 무엇이 다르며, 운영 시 어떤 점을 고려하나요?",
    "shortAnswer": "둘 다 컨테이너를 빌드하고 실행할 수 있습니다. Podman은 상주 데몬 없이 실행할 수 있다는 특징이 있고, Docker도 rootless 실행을 지원합니다. 선택할 때는 운영 환경과 도구 호환성을 확인하겠습니다.",
    "answerSeconds": 31,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "q20",
    "code": "DK-003",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기본",
    "question": "Kubernetes의 Pod와 Service는 무엇이며, 서로 어떤 관계가 있나요?",
    "shortAnswer": "Pod는 하나 이상의 컨테이너를 함께 실행하는 Kubernetes의 최소 배포 단위입니다. Service는 조건에 맞는 Pod 집합에 안정적인 접근 경로를 제공하므로, Pod가 재생성돼 IP가 바뀌어도 클라이언트는 같은 서비스 주소를 이용할 수 있습니다.",
    "answerSeconds": 36,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "DK-004",
    "code": "DK-004",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기초",
    "question": "Docker와 Kubernetes의 관계를 설명해 보세요.",
    "shortAnswer": "Docker는 애플리케이션을 컨테이너로 묶어 실행하게 해 주고, Kubernetes는 여러 노드에서 컨테이너화된 애플리케이션의 배포, 복구, 확장을 관리합니다. Kubernetes가 Docker 자체를 반드시 필요로 하지는 않습니다.",
    "answerSeconds": 35,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "DK-005",
    "code": "DK-005",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기본",
    "question": "Docker 포트 매핑과 컨테이너 네트워크를 설명해 보세요.",
    "shortAnswer": "포트 매핑은 호스트 포트로 들어온 요청을 컨테이너의 포트에 연결합니다. 컨테이너끼리는 같은 네트워크에 있으면 서비스 이름 등으로 통신할 수 있으며, 외부 공개가 필요 없는 DB 포트는 굳이 매핑하지 않습니다.",
    "answerSeconds": 29,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "DK-006",
    "code": "DK-006",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기본",
    "question": "Docker Volume과 Bind Mount의 차이를 설명해 보세요.",
    "shortAnswer": "Volume은 Docker가 저장 위치와 수명 주기를 관리하고, Bind Mount는 호스트의 특정 파일이나 폴더를 컨테이너에 연결합니다. DB 데이터 보존에는 Volume이, 로컬 소스코드를 바로 반영할 때는 Bind Mount가 편리합니다.",
    "answerSeconds": 35,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "K8S-001",
    "code": "DK-007",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기초",
    "question": "Kubernetes를 사용하는 이유와 작은 프로젝트에서의 비용을 설명해 보세요.",
    "shortAnswer": "Kubernetes는 장애 복구, 서비스 확장, 롤링 배포를 자동화하는 데 유용합니다. 다만 클러스터 관리와 설정 복잡도가 있으므로 소규모 서비스는 Docker Compose나 관리형 플랫폼이 더 적합할 수 있습니다.",
    "answerSeconds": 31,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "q21",
    "code": "DK-008",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기초",
    "question": "Pod, ReplicaSet, Deployment의 관계를 설명해 보세요.",
    "shortAnswer": "Pod는 컨테이너가 실제 실행되는 단위입니다. ReplicaSet은 원하는 Pod 수를 유지하고, Deployment는 ReplicaSet을 관리하면서 버전 변경과 롤링 업데이트를 수행합니다.",
    "answerSeconds": 30,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "K8S-003",
    "code": "DK-009",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기초",
    "question": "Kubernetes Service의 ClusterIP, NodePort, LoadBalancer는 어떻게 다른가요?",
    "shortAnswer": "ClusterIP는 클러스터 내부에서 서비스를 노출합니다. NodePort는 각 노드의 특정 포트를 통해 접근하게 하고, LoadBalancer는 지원되는 환경에서 외부 로드밸런서를 연결합니다. 외부 공개 필요 여부에 따라 선택합니다.",
    "answerSeconds": 35,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "K8S-004",
    "code": "DK-010",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기본",
    "question": "ConfigMap과 Secret을 구분하고 Secret의 보안 한계를 설명해 보세요.",
    "shortAnswer": "ConfigMap은 일반 설정을, Secret은 비밀번호나 토큰처럼 민감한 값을 담습니다. Secret 값이 Base64로 표현된다고 암호화되는 것은 아닙니다. RBAC로 접근을 제한하고 저장 시 암호화도 설정해야 합니다.",
    "answerSeconds": 33,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "K8S-005",
    "code": "DK-011",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기초",
    "question": "Namespace는 무엇을 분리하며 무엇을 추가로 설정해야 하나요?",
    "shortAnswer": "Namespace는 한 클러스터에서 리소스 이름과 관리 범위를 논리적으로 분리합니다. 하지만 네트워크 격리나 권한 분리가 자동으로 완성되는 것은 아니어서 RBAC와 NetworkPolicy 등을 별도로 설정해야 합니다.",
    "answerSeconds": 32,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "K8S-006",
    "code": "DK-012",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기본",
    "question": "Helm은 무엇이며, Kubernetes 배포에서 왜 사용하나요?",
    "shortAnswer": "Helm은 Kubernetes 리소스 설정을 템플릿으로 묶어 배포하는 패키지 관리자입니다. 환경별 값을 분리하고 애플리케이션 설치, 업그레이드, 롤백을 관리할 때 사용합니다.",
    "answerSeconds": 26,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "K8S-007",
    "code": "DK-013",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기본",
    "question": "PersistentVolume과 PersistentVolumeClaim의 차이는 무엇인가요?",
    "shortAnswer": "PV는 클러스터에서 사용할 스토리지를 나타내고, PVC는 애플리케이션이 필요한 저장공간을 요청하는 객체입니다. Pod는 PVC를 통해 스토리지를 연결합니다.",
    "answerSeconds": 24,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "q22",
    "code": "DK-014",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기본",
    "question": "readiness, liveness, startup probe는 어떤 차이가 있나요?",
    "shortAnswer": "readiness probe는 요청을 받아도 되는 상태인지, liveness probe는 재시작이 필요한 상태인지 확인합니다. startup probe는 초기 구동이 끝날 때까지 다른 두 probe의 검사를 미뤄 시작이 느린 앱이 불필요하게 재시작되는 일을 줄입니다.",
    "answerSeconds": 38,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "K8S-009",
    "code": "DK-015",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기본",
    "question": "Kubernetes Rolling Update 중 요청 실패를 줄이려면 무엇이 필요한가요?",
    "shortAnswer": "새 Pod가 준비됐을 때만 트래픽을 받도록 readiness probe를 설정하고, 종료 중인 Pod는 기존 요청을 처리할 시간을 주겠습니다. Deployment의 업데이트 설정과 충분한 복제본 수도 함께 조정합니다.",
    "answerSeconds": 32,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "K8S-010",
    "code": "DK-016",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "기본",
    "question": "Horizontal Pod Autoscaler가 무엇을 늘리고 어떤 전제가 필요한가요?",
    "shortAnswer": "HPA는 CPU나 사용자 정의 지표에 따라 Deployment 등의 Pod 복제본 수를 조절합니다. 지표 수집 구성이 필요하고, CPU 사용률을 기준으로 확장하려면 컨테이너의 CPU requests를 적절히 설정해야 합니다.",
    "answerSeconds": 32,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "K8S-011",
    "code": "DK-017",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "심화",
    "question": "Kubernetes requests와 limits를 잘못 설정하면 어떤 문제가 생기나요?",
    "shortAnswer": "requests는 스케줄링에서 필요한 자원의 기준이고, limits는 사용 상한입니다. CPU 제한은 스로틀링을 일으킬 수 있고 메모리 상한을 넘으면 OOM으로 컨테이너가 종료될 수 있습니다.",
    "answerSeconds": 28,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "K8S-012",
    "code": "DK-018",
    "group": "Docker·Kubernetes",
    "category": "Docker",
    "subCategory": "Docker·Kubernetes",
    "difficulty": "심화",
    "question": "Pod가 반복 재시작하거나 Service가 응답하지 않으면 어떻게 원인을 좁히나요?",
    "shortAnswer": "먼저 kubectl get pods로 상태를 확인하고 describe와 logs에서 종료 이유와 이벤트를 보겠습니다. Service가 응답하지 않으면 selector·EndpointSlice·readiness 상태, 컨테이너 포트와 NetworkPolicy를 순서대로 확인합니다.",
    "answerSeconds": 43,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "docker",
      "k8s"
    ],
    "aliases": [
      "쿠버네티스",
      "K8s"
    ]
  },
  {
    "id": "DEV-001",
    "code": "CN-001",
    "group": "DevOps·Cloud Native·MSA",
    "category": "DevOps",
    "subCategory": "DevOps·Cloud Native·MSA",
    "difficulty": "기초",
    "question": "DevOps를 단순한 서버 관리와 구분해 설명해 보세요.",
    "shortAnswer": "DevOps는 개발과 운영이 협력해 소프트웨어를 빠르고 안정적으로 배포·운영하도록 만드는 문화와 실천 방법입니다. CI/CD, 자동화, 모니터링을 통해 변경 작업의 품질과 속도를 높입니다.",
    "answerSeconds": 28,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "cncf"
    ],
    "aliases": [
      "클라우드 네이티브",
      "MSA"
    ]
  },
  {
    "id": "q25",
    "code": "CN-002",
    "group": "DevOps·Cloud Native·MSA",
    "category": "DevOps",
    "subCategory": "DevOps·Cloud Native·MSA",
    "difficulty": "기초",
    "question": "CI와 CD, Continuous Delivery와 Deployment의 차이는 무엇인가요?",
    "shortAnswer": "CI는 변경 코드를 자주 통합하고 자동 빌드·테스트하는 것입니다. Continuous Delivery는 배포 가능한 상태를 유지하되 운영 배포에 승인이 들어갈 수 있고, Continuous Deployment는 검증을 통과하면 운영까지 자동 배포합니다.",
    "answerSeconds": 37,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "cncf"
    ],
    "aliases": [
      "클라우드 네이티브",
      "MSA"
    ]
  },
  {
    "id": "DEV-003",
    "code": "CN-003",
    "group": "운영체제·Linux",
    "category": "DevOps",
    "subCategory": "운영체제·Linux",
    "difficulty": "기본",
    "question": "Linux 커널은 무엇이며, 어떤 역할을 하나요?",
    "shortAnswer": "Linux 커널은 하드웨어와 사용자 프로그램 사이에서 CPU 스케줄링, 메모리, 파일 시스템, 네트워크, 장치 접근을 관리하는 운영체제 핵심 부분입니다.",
    "answerSeconds": 23,
    "jobTags": [
      "공통",
      "클라우드",
      "DevOps"
    ],
    "sourceIds": [
      "linux"
    ],
    "aliases": []
  },
  {
    "id": "DEV-004",
    "code": "CN-004",
    "group": "AI·데이터 기초",
    "category": "DevOps",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기본",
    "question": "Spring AI와 Python LangChain은 무엇이 다르며, 어느 경우에 사용하나요?",
    "shortAnswer": "Spring AI는 Java·Spring Boot 애플리케이션에서 AI 모델과 도구, 벡터 저장소를 연동하는 데 초점을 둡니다. LangChain은 Python과 JavaScript 환경에서 LLM 기반 애플리케이션을 구성할 때 많이 사용합니다. 기존 서비스 기술 스택에 맞춰 선택하겠습니다.",
    "answerSeconds": 42,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "ml"
    ],
    "aliases": []
  },
  {
    "id": "q26",
    "code": "CN-005",
    "group": "DevOps·Cloud Native·MSA",
    "category": "DevOps",
    "subCategory": "DevOps·Cloud Native·MSA",
    "difficulty": "기본",
    "question": "Spring Cloud의 주요 프로젝트와 각각의 역할을 설명해 보세요.",
    "shortAnswer": "Spring Cloud는 분산 서비스 구축에 필요한 도구 모음입니다. Gateway는 API 진입점을 제공하고, Config는 외부 설정을 관리하며, OpenFeign은 HTTP 서비스 호출을 선언식으로 구현하도록 돕습니다. 필요한 기능만 선택해 사용합니다.",
    "answerSeconds": 38,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "cncf"
    ],
    "aliases": [
      "클라우드 네이티브",
      "MSA"
    ]
  },
  {
    "id": "CN-001",
    "code": "CN-006",
    "group": "AI·데이터 기초",
    "category": "DevOps",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기초",
    "question": "벡터 데이터베이스는 무엇이며, RAG 서비스에서 어떤 역할을 하나요?",
    "shortAnswer": "벡터 데이터베이스는 텍스트나 이미지의 임베딩을 저장하고 유사한 벡터를 검색합니다. RAG에서는 질문과 관련성이 높은 문서를 찾아 LLM에 전달하는 데 활용합니다. 검색된 문서가 사실이라는 보장은 별도로 확인해야 합니다.",
    "answerSeconds": 32,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "ml"
    ],
    "aliases": []
  },
  {
    "id": "q23",
    "code": "CN-007",
    "group": "DevOps·Cloud Native·MSA",
    "category": "DevOps",
    "subCategory": "DevOps·Cloud Native·MSA",
    "difficulty": "기초",
    "question": "모놀리식과 MSA의 장단점과 선택 기준을 설명해 보세요.",
    "shortAnswer": "모놀리식은 개발과 배포가 단순하고 트랜잭션 관리가 쉬운 편입니다. MSA는 서비스별 배포와 확장이 가능하지만 통신 장애와 운영 복잡도가 늘어납니다. 팀 규모와 서비스 경계를 보고 선택해야 합니다.",
    "answerSeconds": 28,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "cncf"
    ],
    "aliases": [
      "클라우드 네이티브",
      "MSA"
    ]
  },
  {
    "id": "CN-003",
    "code": "CN-008",
    "group": "DevOps·Cloud Native·MSA",
    "category": "DevOps",
    "subCategory": "DevOps·Cloud Native·MSA",
    "difficulty": "기본",
    "question": "API Gateway와 Service Discovery는 어떤 문제를 해결하나요?",
    "shortAnswer": "API Gateway는 외부 요청의 공통 진입점으로 라우팅이나 인증 같은 기능을 담당합니다. Service Discovery는 서비스 인스턴스의 위치를 찾아주는 기능으로, 인스턴스가 늘거나 바뀌는 환경에서 유용합니다.",
    "answerSeconds": 32,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "cncf"
    ],
    "aliases": [
      "클라우드 네이티브",
      "MSA"
    ]
  },
  {
    "id": "CN-004",
    "code": "CN-009",
    "group": "DevOps·Cloud Native·MSA",
    "category": "DevOps",
    "subCategory": "DevOps·Cloud Native·MSA",
    "difficulty": "기본",
    "question": "MSA의 환경별 설정과 Secret을 어떻게 관리하나요?",
    "shortAnswer": "환경별 일반 설정은 ConfigMap이나 외부 설정 서비스에서 관리하고, 비밀번호와 토큰은 Secret 또는 전용 비밀 관리 시스템에 보관하겠습니다. 소스 저장소에 비밀값을 직접 커밋하지 않겠습니다.",
    "answerSeconds": 29,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "cncf"
    ],
    "aliases": [
      "클라우드 네이티브",
      "MSA"
    ]
  },
  {
    "id": "q17",
    "code": "CN-010",
    "group": "DevOps·Cloud Native·MSA",
    "category": "DevOps",
    "subCategory": "DevOps·Cloud Native·MSA",
    "difficulty": "기초",
    "question": "Scale Up, Scale Out과 Stateless 설계의 관계를 설명해 보세요.",
    "shortAnswer": "Scale Up은 서버 한 대의 CPU·메모리 같은 자원을 늘리고, Scale Out은 서버 인스턴스를 추가하는 방식입니다. Stateless하게 설계하면 사용자 상태를 특정 서버에 묶지 않아 여러 인스턴스로 요청을 분산하기 쉽습니다.",
    "answerSeconds": 34,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "cncf"
    ],
    "aliases": [
      "클라우드 네이티브",
      "MSA"
    ]
  },
  {
    "id": "q24",
    "code": "CN-011",
    "group": "DevOps·Cloud Native·MSA",
    "category": "DevOps",
    "subCategory": "DevOps·Cloud Native·MSA",
    "difficulty": "기본",
    "question": "분산 서비스의 타임아웃·재시도에 어떤 위험이 있나요?",
    "shortAnswer": "분산 서비스에서 타임아웃이 없으면 장애가 다른 서비스로 퍼질 수 있습니다. 무작정 재시도하면 요청이 몰리거나 결제 같은 작업이 중복 실행될 수 있어 재시도 횟수, 백오프, 멱등성을 함께 설계해야 합니다.",
    "answerSeconds": 28,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "cncf"
    ],
    "aliases": [
      "클라우드 네이티브",
      "MSA"
    ]
  },
  {
    "id": "CN-007",
    "code": "CN-012",
    "group": "DevOps·Cloud Native·MSA",
    "category": "DevOps",
    "subCategory": "DevOps·Cloud Native·MSA",
    "difficulty": "심화",
    "question": "Circuit Breaker와 장애 격리는 무엇을 막기 위한 설계인가요?",
    "shortAnswer": "Circuit Breaker는 실패가 반복되는 외부 호출을 잠시 차단해 장애 확산을 막는 패턴입니다. 서비스별 시간 제한과 격리 정책을 함께 적용하면 한 서비스의 지연이 전체 서비스로 번지는 것을 줄일 수 있습니다.",
    "answerSeconds": 30,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "cncf"
    ],
    "aliases": [
      "클라우드 네이티브",
      "MSA"
    ]
  },
  {
    "id": "CN-008",
    "code": "CN-013",
    "group": "DevOps·Cloud Native·MSA",
    "category": "DevOps",
    "subCategory": "DevOps·Cloud Native·MSA",
    "difficulty": "기본",
    "question": "Logging, Monitoring, Observability를 어떻게 구분하나요?",
    "shortAnswer": "Logging은 개별 사건의 기록이고, Monitoring은 지표로 시스템 상태를 추적하는 것입니다. Observability는 로그·지표·트레이스 등을 이용해 내부에서 무엇이 발생했는지 원인을 파악할 수 있는 능력을 말합니다.",
    "answerSeconds": 34,
    "jobTags": [
      "클라우드",
      "DevOps",
      "백엔드"
    ],
    "sourceIds": [
      "cncf"
    ],
    "aliases": [
      "클라우드 네이티브",
      "MSA"
    ]
  },
  {
    "id": "q18",
    "code": "CN-014",
    "group": "소프트웨어공학·협업",
    "category": "DevOps",
    "subCategory": "소프트웨어공학·협업",
    "difficulty": "기본",
    "question": "SOLID 설계 원칙 다섯 가지를 간단히 설명해 보세요.",
    "shortAnswer": "SRP는 한 클래스에 한 가지 변경 책임을 두는 원칙, OCP는 확장에는 열고 수정에는 닫는 원칙입니다. LSP는 하위 타입의 대체 가능성, ISP는 필요한 인터페이스만 의존하기, DIP는 구체 구현보다 추상화에 의존하기를 뜻합니다.",
    "answerSeconds": 33,
    "jobTags": [
      "공통",
      "백엔드",
      "DevOps"
    ],
    "sourceIds": [
      "scrum"
    ],
    "aliases": []
  },
  {
    "id": "AI-001",
    "code": "AI-001",
    "group": "AI·데이터 기초",
    "category": "AI / 빅데이터",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기초",
    "question": "AI, Machine Learning, Deep Learning의 관계를 설명해 보세요.",
    "shortAnswer": "AI는 사람의 지능적 작업을 수행하는 기술 전반을 말합니다. 머신러닝은 데이터에서 패턴을 학습하는 AI의 한 분야이고, 딥러닝은 여러 층의 신경망을 이용하는 머신러닝 기법입니다.",
    "answerSeconds": 26,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "ml"
    ],
    "aliases": []
  },
  {
    "id": "AI-002",
    "code": "AI-002",
    "group": "AI·데이터 기초",
    "category": "AI / 빅데이터",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기초",
    "question": "학습과 추론은 서비스에서 어떤 차이가 있나요?",
    "shortAnswer": "학습은 데이터로 모델의 가중치를 조정하는 과정이고, 추론은 학습된 모델을 이용해 새로운 입력의 결과를 만드는 과정입니다. 서비스에서는 추론 응답 시간과 비용을 별도로 관리합니다.",
    "answerSeconds": 26,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "ml"
    ],
    "aliases": []
  },
  {
    "id": "AI-003",
    "code": "AI-003",
    "group": "AI·데이터 기초",
    "category": "AI / 빅데이터",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기초",
    "question": "과적합을 어떻게 확인하고 줄이나요?",
    "shortAnswer": "과적합은 학습 데이터에는 잘 맞지만 새로운 데이터에는 성능이 떨어지는 현상입니다. 학습·검증 성능 차이를 보고 데이터 추가, 정규화, 모델 단순화, 조기 종료 등을 검토합니다.",
    "answerSeconds": 26,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "ml"
    ],
    "aliases": []
  },
  {
    "id": "q27",
    "code": "AI-004",
    "group": "AI·데이터 기초",
    "category": "AI / 빅데이터",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기초",
    "question": "Training, Validation, Test 데이터를 나누는 이유는 무엇인가요?",
    "shortAnswer": "Training 데이터는 모델을 학습시키고, Validation 데이터는 모델과 설정을 선택하는 데 사용합니다. Test 데이터는 선택이 끝난 모델을 마지막으로 평가하는 데 사용해 성능을 과대평가하지 않도록 합니다.",
    "answerSeconds": 32,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "ml"
    ],
    "aliases": []
  },
  {
    "id": "AI-005",
    "code": "AI-005",
    "group": "AI·데이터 기초",
    "category": "AI / 빅데이터",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기초",
    "question": "분류와 회귀의 차이와 평가 기준을 설명해 보세요.",
    "shortAnswer": "분류는 스팸 여부처럼 범주를 예측하고, 회귀는 집값처럼 연속된 값을 예측합니다. 분류는 정밀도·재현율·F1 등을, 회귀는 MAE·RMSE 등을 사용해 평가합니다.",
    "answerSeconds": 25,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "ml"
    ],
    "aliases": []
  },
  {
    "id": "q28",
    "code": "AI-006",
    "group": "AI·데이터 기초",
    "category": "AI / 빅데이터",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기본",
    "question": "분류 모델의 정확도만으로 성능을 평가해도 되나요?",
    "shortAnswer": "정확도만으로는 부족합니다. 불량률이 1%인 데이터에서 모두 정상이라고 예측해도 정확도는 99%가 될 수 있습니다. 불균형 데이터라면 정밀도, 재현율, F1, 혼동행렬도 확인해야 합니다.",
    "answerSeconds": 28,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "ml"
    ],
    "aliases": []
  },
  {
    "id": "AI-007",
    "code": "AI-007",
    "group": "AI·데이터 기초",
    "category": "AI / 빅데이터",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기본",
    "question": "LLM과 Token을 설명하고 서비스 적용 시 제한을 말해 보세요.",
    "shortAnswer": "LLM은 많은 데이터에서 언어 패턴을 학습하고 문맥에 따라 다음 토큰을 예측하며 답변을 생성합니다. 토큰은 모델이 처리하는 텍스트 단위이며, 입력·출력 토큰 수는 문맥 제한과 처리 시간, 비용에 영향을 줍니다.",
    "answerSeconds": 30,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "ml"
    ],
    "aliases": []
  },
  {
    "id": "AI-008",
    "code": "AI-008",
    "group": "AI·데이터 기초",
    "category": "AI / 빅데이터",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기본",
    "question": "Embedding은 무엇이고 키워드 검색과 어떻게 다른가요?",
    "shortAnswer": "임베딩은 문장이나 이미지를 의미가 반영된 숫자 벡터로 바꾸는 것입니다. 키워드 검색은 일치하는 단어를 주로 찾고, 임베딩 검색은 표현이 달라도 의미가 비슷한 자료를 찾는 데 유리합니다.",
    "answerSeconds": 26,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "ml"
    ],
    "aliases": []
  },
  {
    "id": "AI-009",
    "code": "AI-009",
    "group": "AI·데이터 기초",
    "category": "AI / 빅데이터",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기본",
    "question": "Transformer를 수식 없이 기본 개념 중심으로 설명해 보세요.",
    "shortAnswer": "Transformer는 Attention을 이용해 입력의 각 부분이 서로 어떤 관련이 있는지 학습하는 신경망 구조입니다. 문장 안에서 멀리 떨어진 단어의 관계도 다룰 수 있어 현대 LLM의 기반으로 널리 사용됩니다.",
    "answerSeconds": 31,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "ml"
    ],
    "aliases": []
  },
  {
    "id": "AI-010",
    "code": "AI-010",
    "group": "AI·데이터 기초",
    "category": "AI / 빅데이터",
    "subCategory": "AI·데이터 기초",
    "difficulty": "기본",
    "question": "RAG의 기본 흐름과 답변 검증에서 주의할 점은 무엇인가요?",
    "shortAnswer": "RAG는 질문과 관련된 문서를 먼저 검색하고 그 내용을 LLM 입력에 넣어 답변을 생성하는 방식입니다. 검색된 자료가 부정확하면 답도 틀릴 수 있으므로 출처 표시와 답변의 근거 확인이 필요합니다.",
    "answerSeconds": 28,
    "jobTags": [
      "AI개발",
      "데이터엔지니어"
    ],
    "sourceIds": [
      "ml"
    ],
    "aliases": []
  }
];

export const questions = reviewedRows.map(row => ({
  ...row,
  answer: row.shortAnswer,
  detailedAnswer: "", extra: "", learningExample: null, workedCode: null,
  keywords: [], followUps: []
}));
