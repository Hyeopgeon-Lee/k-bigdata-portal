// Java 17 | JAVA-002~100 (JAVA-041 제외), 기존 JAVA-001·041 유지
export const javaProblems = [
  {
    "id": "JAVA-002",
    "language": "java",
    "level": "입문",
    "topic": "출력과 입력",
    "title": "두 줄의 문장 출력",
    "statement": "입력 없이 첫 번째 줄에는 Hello, 두 번째 줄에는 Java를 출력하시오.",
    "input": "입력 없음",
    "output": "Hello\nJava",
    "hint": "println을 두 번 호출하면 두 줄이 차례대로 출력됩니다.",
    "code": "public class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        System.out.println(\"Hello\"); // 첫 줄에 Hello 출력\n        System.out.println(\"Java\"); // 다음 줄에 Java 출력\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "첫 줄에 Hello 출력. 다음 줄에 Java 출력. 예제 실행 결과는 출력 → Hello, 출력 → Java입니다. 확인할 조건: 출력 순서·줄바꿈.",
    "trace": [
      [
        "1행",
        "출력",
        "첫 번째 println",
        "Hello"
      ],
      [
        "2행",
        "출력",
        "두 번째 println",
        "Java"
      ]
    ],
    "constraints": "입력 없음, 문장은 문제에 제시",
    "edgeCases": "출력 순서·줄바꿈",
    "concept": "println 2회"
  },
  {
    "id": "JAVA-003",
    "language": "java",
    "level": "입문",
    "topic": "출력과 입력",
    "title": "문자열과 숫자 함께 출력",
    "statement": "문자열 Score: 와 정수 100을 한 줄에 출력한다\n입력 조건: 입력 없음. 출력 규격: Score: 100.",
    "input": "입력 없음",
    "output": "Score: 100",
    "hint": "문자열 + 숫자 표현식은 문자열을 연결합니다.",
    "code": "public class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        int score=100; // score 초기값 100\n        System.out.println(\"Score: \" + score); // 문자열과 숫자를 결합해 Score: 100 출력\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "score 초기값 100. 문자열과 숫자를 결합해 Score: 100 출력. 예제 실행 결과는 score → 100, score → Score: 100입니다. 확인할 조건: 숫자와 문자열 결합.",
    "trace": [
      [
        "초기화",
        "score",
        "값 100 저장",
        "100"
      ],
      [
        "출력",
        "score",
        "\"Score: \" + 100",
        "Score: 100"
      ]
    ],
    "constraints": "입력 없음",
    "edgeCases": "숫자와 문자열 결합",
    "concept": "문자열 결합"
  },
  {
    "id": "JAVA-004",
    "language": "java",
    "level": "입문",
    "topic": "출력과 입력",
    "title": "특수문자 출력",
    "statement": "입력 없이 She said \"Hi\" \\ Java 라는 문자열을 한 줄로 정확히 출력하시오.",
    "input": "입력 없음",
    "output": "She said \"Hi\" \\ Java",
    "hint": "큰따옴표는 \\\"로, 역슬래시는 \\\\로 작성합니다.",
    "code": "public class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        System.out.println(\"She said \\\"Hi\\\" \\\\ Java\"); // 따옴표와 역슬래시를 이스케이프해 출력\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "따옴표와 역슬래시를 이스케이프해 출력. 예제 실행 결과는 문자열 리터럴 → She said \"Hi\" \\ Java입니다. 확인할 조건: 따옴표·백슬래시 이스케이프.",
    "trace": [
      [
        "실행",
        "문자열 리터럴",
        "이스케이프 해석",
        "She said \"Hi\" \\ Java"
      ]
    ],
    "constraints": "입력 없음",
    "edgeCases": "따옴표·백슬래시 이스케이프",
    "concept": "이스케이프 문자"
  },
  {
    "id": "JAVA-005",
    "language": "java",
    "level": "입문",
    "topic": "출력과 입력",
    "title": "이름 한 단어 입력",
    "statement": "공백 없는 이름을 입력받아 안녕하세요, 이름을 출력한다\n입력 조건: 영문 이름 1단어. 출력 규격: 안녕하세요, 이름.",
    "input": "Mina",
    "output": "안녕하세요, Mina",
    "hint": "공백 없는 단어는 Scanner.next()로 읽습니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String name=sc.next(); // 예제 입력 Mina → name=\"Mina\"\n        System.out.println(\"안녕하세요, \" + name); // name을 문장 뒤에 연결해 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "예제 입력 Mina → name=\"Mina\". name을 문장 뒤에 연결해 출력. 예제 실행 결과는 name → Mina, name → 안녕하세요, Mina입니다. 확인할 조건: next와 nextLine 차이.",
    "trace": [
      [
        "입력",
        "name",
        "미정 → Mina",
        "Mina"
      ],
      [
        "출력",
        "name",
        "문자열 연결",
        "안녕하세요, Mina"
      ]
    ],
    "constraints": "영문 이름 1단어",
    "edgeCases": "next와 nextLine 차이",
    "concept": "Scanner.next"
  },
  {
    "id": "JAVA-006",
    "language": "java",
    "level": "입문",
    "topic": "출력과 입력",
    "title": "정수 입력 후 출력",
    "statement": "정수 한 개를 입력받아 동일한 값을 출력한다\n입력 조건: -1000≤n≤1000. 출력 규격: n.",
    "input": "-3",
    "output": "-3",
    "hint": "nextInt()가 음수도 읽을 수 있습니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 입력 -3 → n=-3\n        System.out.println(n); // 저장한 n=-3을 그대로 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "Scanner의 nextInt()는 -3처럼 음수 부호가 붙은 정수도 int로 읽습니다. 변수 n에 저장된 값을 변경하지 않고 System.out.println(n)으로 한 줄에 출력합니다.",
    "trace": [
      [
        "입력",
        "n",
        "미정 → -3",
        "-3"
      ],
      [
        "출력",
        "n",
        "-3 출력",
        "-3"
      ]
    ],
    "constraints": "-1000≤n≤1000",
    "edgeCases": "음수 처리",
    "concept": "nextInt, int"
  },
  {
    "id": "JAVA-007",
    "language": "java",
    "level": "입문",
    "topic": "출력과 입력",
    "title": "두 정수 다시 출력",
    "statement": "공백으로 구분한 두 정수를 줄을 나누어 출력한다\n입력 조건: 정수 2개. 출력 규격: 첫 수와 둘째 수 각각 한 줄.",
    "input": "3 8",
    "output": "3\n8",
    "hint": "입력 순서와 출력 순서를 일치시키세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int a=sc.nextInt(); // 첫 수 입력 3 → a=3\n        int b=sc.nextInt(); // 다음 수 입력 8 → b=8\n        System.out.println(a); // 첫 줄에 a=3 출력\n        System.out.println(b); // 둘째 줄에 b=8 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "첫 수 입력 3 → a=3. 다음 수 입력 8 → b=8. 첫 줄에 a=3 출력. 예제 실행 결과는 b → 8, a, b → 3 / 8입니다. 확인할 조건: 입력 순서.",
    "trace": [
      [
        "첫 입력",
        "a",
        "미정 → 3",
        "3"
      ],
      [
        "둘째 입력",
        "b",
        "미정 → 8",
        "8"
      ],
      [
        "출력",
        "a, b",
        "각각 다른 줄에 출력",
        "3 / 8"
      ]
    ],
    "constraints": "정수 2개",
    "edgeCases": "입력 순서",
    "concept": "Scanner와 두 변수"
  },
  {
    "id": "JAVA-008",
    "language": "java",
    "level": "입문",
    "topic": "출력과 입력",
    "title": "실수 한 개 출력",
    "statement": "실수를 입력받아 소수 둘째 자리까지 출력한다\n입력 조건: 절댓값 100 이하 실수. 출력 규격: 소수 둘째 자리 고정.",
    "input": "3.14159",
    "output": "3.14",
    "hint": "소수 둘째 자리 고정은 printf의 %.2f를 사용합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        double value=sc.nextDouble(); // 입력 3.14159 → value=3.14159\n        System.out.printf(Locale.US,\"%.2f%n\",value); // 소수 둘째 자리 반올림 → 3.14\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "입력 3.14159 → value=3.14159. 소수 둘째 자리 반올림 → 3.14. 예제 실행 결과는 value → 3.14159, value → 3.14입니다. 확인할 조건: 반올림·서식.",
    "trace": [
      [
        "입력",
        "value",
        "3.14159 저장",
        "3.14159"
      ],
      [
        "출력",
        "value",
        "%.2f로 표현",
        "3.14"
      ]
    ],
    "constraints": "절댓값 100 이하 실수",
    "edgeCases": "반올림·서식",
    "concept": "double, printf"
  },
  {
    "id": "JAVA-009",
    "language": "java",
    "level": "입문",
    "topic": "출력과 입력",
    "title": "한 줄 문장 입력",
    "statement": "공백 포함 문장 한 줄을 입력받아 그대로 출력한다\n입력 조건: 한 줄 문자열(최대 100자). 출력 규격: 입력 문장 그대로.",
    "input": "Hello Java world",
    "output": "Hello Java world",
    "hint": "공백을 포함한 문장은 nextLine()을 사용하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String line=sc.nextLine(); // 공백 포함 전체 문장 입력 → line=\"Hello Java world\"\n        System.out.println(line); // 받은 문자열 그대로 한 줄 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "공백 포함 전체 문장 입력 → line=\"Hello Java world\". 받은 문자열 그대로 한 줄 출력. 예제 실행 결과는 line → Hello Java world, line → Hello Java world입니다. 확인할 조건: 공백 유지.",
    "trace": [
      [
        "입력",
        "line",
        "한 줄 전체를 저장",
        "Hello Java world"
      ],
      [
        "출력",
        "line",
        "변경 없이 출력",
        "Hello Java world"
      ]
    ],
    "constraints": "한 줄 문자열(최대 100자)",
    "edgeCases": "공백 유지",
    "concept": "nextLine"
  },
  {
    "id": "JAVA-010",
    "language": "java",
    "level": "입문",
    "topic": "출력과 입력",
    "title": "이름과 나이 서식 출력",
    "statement": "이름과 나이를 입력받아 지정된 문장 형식으로 출력한다\n입력 조건: 이름 한 단어와 정수 나이. 출력 규격: name: 이름, age: 나이.",
    "input": "Mina 20",
    "output": "name: Mina, age: 20",
    "hint": "문제에 제시한 콜론과 쉼표, 공백도 동일하게 출력하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String name=sc.next(); // 입력 Mina → name=\"Mina\"\n        int age=sc.nextInt(); // 입력 20 → age=20\n        System.out.println(\"name: \" + name + \", age: \" + age); // name: Mina, age: 20 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "입력 Mina → name=\"Mina\". 입력 20 → age=20. name: Mina, age: 20 출력. 예제 실행 결과는 age → 20, name, age → name: Mina, age: 20입니다. 확인할 조건: 서식 문자·띄어쓰기.",
    "trace": [
      [
        "입력",
        "name",
        "Mina 저장",
        "Mina"
      ],
      [
        "입력",
        "age",
        "20 저장",
        "20"
      ],
      [
        "출력",
        "name, age",
        "문자열 연결",
        "name: Mina, age: 20"
      ]
    ],
    "constraints": "이름 한 단어와 정수 나이",
    "edgeCases": "서식 문자·띄어쓰기",
    "concept": "printf %s %d"
  },
  {
    "id": "JAVA-011",
    "language": "java",
    "level": "입문",
    "topic": "변수·자료형·연산",
    "title": "두 정수의 합",
    "statement": "정수 두 개의 합을 계산하여 출력한다\n입력 조건: 절댓값 10000 이하 정수 2개. 출력 규격: 정수 합.",
    "input": "7 3",
    "output": "10",
    "hint": "두 값을 입력받아 + 연산을 사용하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int a=sc.nextInt(); // 첫 번째 값 7 → a=7\n        int b=sc.nextInt(); // 두 번째 값 3 → b=3\n        int result=a + b; // a + b를 계산하여 result에 저장\n        System.out.println(result); // 최종 합을 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "첫 번째 값 7 → a=7. 두 번째 값 3 → b=3. a + b를 계산하여 result에 저장. 예제 실행 결과는 a,b → 7, 3, result → 10입니다. 확인할 조건: 0·음수.",
    "trace": [
      [
        "입력",
        "a,b",
        "7, 3 저장",
        "7, 3"
      ],
      [
        "연산",
        "result",
        "7 + 3",
        "10"
      ]
    ],
    "constraints": "절댓값 10000 이하 정수 2개",
    "edgeCases": "0·음수",
    "concept": "+, int"
  },
  {
    "id": "JAVA-012",
    "language": "java",
    "level": "입문",
    "topic": "변수·자료형·연산",
    "title": "두 정수의 차",
    "statement": "첫 번째 정수에서 두 번째 정수를 뺀 결과를 출력한다\n입력 조건: 절댓값 10000 이하 정수 2개. 출력 규격: 정수 차.",
    "input": "7 3",
    "output": "4",
    "hint": "두 값을 입력받아 - 연산을 사용하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int a=sc.nextInt(); // 첫 번째 값 7 → a=7\n        int b=sc.nextInt(); // 두 번째 값 3 → b=3\n        int result=a - b; // a - b를 계산하여 result에 저장\n        System.out.println(result); // 최종 차을 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "첫 번째 값 7 → a=7. 두 번째 값 3 → b=3. a - b를 계산하여 result에 저장. 예제 실행 결과는 a,b → 7, 3, result → 4입니다. 확인할 조건: 음수 결과.",
    "trace": [
      [
        "입력",
        "a,b",
        "7, 3 저장",
        "7, 3"
      ],
      [
        "연산",
        "result",
        "7 - 3",
        "4"
      ]
    ],
    "constraints": "절댓값 10000 이하 정수 2개",
    "edgeCases": "음수 결과",
    "concept": "-, int"
  },
  {
    "id": "JAVA-013",
    "language": "java",
    "level": "입문",
    "topic": "변수·자료형·연산",
    "title": "두 정수의 곱",
    "statement": "정수 두 개를 곱한 값을 출력한다\n입력 조건: 절댓값 1000 이하 정수 2개. 출력 규격: 정수 곱.",
    "input": "7 3",
    "output": "21",
    "hint": "두 값을 입력받아 * 연산을 사용하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int a=sc.nextInt(); // 첫 번째 값 7 → a=7\n        int b=sc.nextInt(); // 두 번째 값 3 → b=3\n        int result=a * b; // a * b를 계산하여 result에 저장\n        System.out.println(result); // 최종 곱을 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "첫 번째 값 7 → a=7. 두 번째 값 3 → b=3. a * b를 계산하여 result에 저장. 예제 실행 결과는 a,b → 7, 3, result → 21입니다. 확인할 조건: 0·음수·범위.",
    "trace": [
      [
        "입력",
        "a,b",
        "7, 3 저장",
        "7, 3"
      ],
      [
        "연산",
        "result",
        "7 * 3",
        "21"
      ]
    ],
    "constraints": "절댓값 1000 이하 정수 2개",
    "edgeCases": "0·음수·범위",
    "concept": "*, int"
  },
  {
    "id": "JAVA-014",
    "language": "java",
    "level": "입문",
    "topic": "변수·자료형·연산",
    "title": "몫과 나머지 구하기",
    "statement": "두 정수 a,b의 몫과 나머지를 각각 한 줄에 출력한다\n입력 조건: a≥0, b>0. 출력 규격: 몫과 나머지.",
    "input": "17 5",
    "output": "3\n2",
    "hint": "/는 정수 나눗셈의 몫, %는 나머지를 구합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int a=sc.nextInt(); // a=17 저장\n        int b=sc.nextInt(); // b=5 저장(0이 아님)\n        int quotient=a/b; // 정수 몫 17/5=3 → quotient=3\n        int remainder=a%b; // 나머지 17%5=2 → remainder=2\n        System.out.println(quotient); // 첫 줄에 3 출력\n        System.out.println(remainder); // 두 번째 줄에 2 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "a=17 저장. b=5 저장(0이 아님). 정수 몫 17/5=3 → quotient=3. 예제 실행 결과는 quotient → 3, remainder → 2입니다. 확인할 조건: 0으로 나누기 금지.",
    "trace": [
      [
        "입력",
        "a, b",
        "17, 5 저장",
        "17, 5"
      ],
      [
        "몫",
        "quotient",
        "17/5",
        "3"
      ],
      [
        "나머지",
        "remainder",
        "17%5",
        "2"
      ]
    ],
    "constraints": "a≥0, b>0",
    "edgeCases": "0으로 나누기 금지",
    "concept": "/, %"
  },
  {
    "id": "JAVA-015",
    "language": "java",
    "level": "입문",
    "topic": "변수·자료형·연산",
    "title": "세 정수의 평균",
    "statement": "세 정수의 평균을 실수로 계산하여 소수 둘째 자리까지 출력한다\n입력 조건: 절댓값 100 이하 정수 3개. 출력 규격: 소수 둘째 자리 평균.",
    "input": "3 4 8",
    "output": "5.00",
    "hint": "3이 아니라 3.0으로 나누어야 소수 부분이 보존됩니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int a=sc.nextInt(); // a=3 저장\n        int b=sc.nextInt(); // b=4 저장\n        int c=sc.nextInt(); // c=8 저장\n        double avg=(a+b+c)/3.0; // 15/3.0 → avg=5.0 (실수 나눗셈)\n        System.out.printf(Locale.US,\"%.2f%n\",avg); // 5.00 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "a=3 저장. b=4 저장. c=8 저장. 예제 실행 결과는 a,b,c → 3, 4, 8, avg → 5.0입니다. 확인할 조건: 정수 나눗셈 오류.",
    "trace": [
      [
        "입력",
        "a,b,c",
        "3, 4, 8",
        "3, 4, 8"
      ],
      [
        "계산",
        "avg",
        "(3+4+8)/3.0",
        "5.0"
      ]
    ],
    "constraints": "절댓값 100 이하 정수 3개",
    "edgeCases": "정수 나눗셈 오류",
    "concept": "형변환과 /"
  },
  {
    "id": "JAVA-016",
    "language": "java",
    "level": "입문",
    "topic": "변수·자료형·연산",
    "title": "초를 분과 초로 변환",
    "statement": "전체 초를 분과 나머지 초로 나누어 출력한다\n입력 조건: 0≤초≤36000. 출력 규격: 분 초.",
    "input": "125",
    "output": "2 5",
    "hint": "나누기의 몫은 분, 나머지는 초입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int seconds=sc.nextInt(); // 입력 125 → seconds=125\n        int minutes=seconds/60; // 125/60=2 → minutes=2\n        int remain=seconds%60; // 125%60=5 → remain=5\n        System.out.println(minutes + \" \" + remain); // 2 5 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "입력 125 → seconds=125. 125/60=2 → minutes=2. 125%60=5 → remain=5. 예제 실행 결과는 minutes → 2, remain → 5입니다. 확인할 조건: 60·0 경계.",
    "trace": [
      [
        "입력",
        "seconds",
        "125 저장",
        "125"
      ],
      [
        "몫",
        "minutes",
        "125/60",
        "2"
      ],
      [
        "나머지",
        "remain",
        "125%60",
        "5"
      ]
    ],
    "constraints": "0≤초≤36000",
    "edgeCases": "60·0 경계",
    "concept": "/, %"
  },
  {
    "id": "JAVA-017",
    "language": "java",
    "level": "입문",
    "topic": "변수·자료형·연산",
    "title": "원의 넓이 계산",
    "statement": "반지름을 입력받아 원주율 3.141592653589793을 사용해 원 넓이를 소수 둘째 자리까지 출력하시오.",
    "input": "2",
    "output": "12.57",
    "hint": "원의 넓이는 반지름의 제곱에 π를 곱합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        double radius=sc.nextDouble(); // 예제 반지름 2.0 저장\n        double area=radius*radius*3.141592653589793; // 2*2*π → area≈12.56637\n        System.out.printf(Locale.US,\"%.2f%n\",area); // 12.57 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "예제 반지름 2.0 저장. 2*2*π → area≈12.56637. 12.57 출력. 예제 실행 결과는 area → 약 12.56637, area → 12.57입니다. 확인할 조건: 0·반올림.",
    "trace": [
      [
        "입력",
        "radius",
        "2.0 저장",
        "2.0"
      ],
      [
        "계산",
        "area",
        "2*2*π",
        "약 12.56637"
      ],
      [
        "출력",
        "area",
        "소수 둘째 자리 반올림",
        "12.57"
      ]
    ],
    "constraints": "0≤반지름≤1000",
    "edgeCases": "0·반올림",
    "concept": "Math.PI, 곱셈"
  },
  {
    "id": "JAVA-018",
    "language": "java",
    "level": "입문",
    "topic": "변수·자료형·연산",
    "title": "두 변수의 값 교환",
    "statement": "정수 두 개를 입력받아 임시 변수를 사용해 순서를 바꿔 출력한다\n입력 조건: 정수 2개. 출력 규격: 교환한 두 값.",
    "input": "10 20",
    "output": "20 10",
    "hint": "임시 변수 temp에 a를 보관한 뒤 b를 a에 대입하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int a=sc.nextInt(); // a 초기값 10\n        int b=sc.nextInt(); // b 초기값 20\n        int temp=a; // temp: 미정 → 10, a는 그대로 10\n        a=b; // a: 10 → 20, b는 20 그대로\n        b=temp; // b: 20 → 10, temp는 10 그대로\n        System.out.println(a + \" \" + b); // a=20, b=10 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "a 초기값 10. b 초기값 20. temp: 미정 → 10, a는 그대로 10. 예제 실행 결과는 a → 20, b → 10입니다. 확인할 조건: 동일 값.",
    "trace": [
      [
        "입력",
        "a,b",
        "10,20",
        "10,20"
      ],
      [
        "보관",
        "temp",
        "미정 → a(10)",
        "10"
      ],
      [
        "변경",
        "a",
        "10 → b(20)",
        "20"
      ],
      [
        "변경",
        "b",
        "20 → temp(10)",
        "10"
      ]
    ],
    "constraints": "정수 2개",
    "edgeCases": "동일 값",
    "concept": "임시 변수"
  },
  {
    "id": "JAVA-019",
    "language": "java",
    "level": "입문",
    "topic": "변수·자료형·연산",
    "title": "복합 대입 연산",
    "statement": "초기값 n에 5를 더하고 2를 뺀 결과를 출력한다\n입력 조건: 절댓값 1000 이하 정수 n. 출력 규격: 최종 n.",
    "input": "7",
    "output": "10",
    "hint": "복합 대입 연산자는 이전 값을 유지하며 계산합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n 초기값 7\n        n+=5; // n: 7 → 12 (7+5)\n        n-=2; // n: 12 → 10 (12-2)\n        System.out.println(n); // 최종 n=10 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "n 초기값 7. n: 7 → 12 (7+5). n: 12 → 10 (12-2). 예제 실행 결과는 n → 12, n → 10입니다. 확인할 조건: 연산 순서.",
    "trace": [
      [
        "입력",
        "n",
        "미정 → 7",
        "7"
      ],
      [
        "+=",
        "n",
        "7+5",
        "12"
      ],
      [
        "-=",
        "n",
        "12-2",
        "10"
      ]
    ],
    "constraints": "절댓값 1000 이하 정수 n",
    "edgeCases": "연산 순서",
    "concept": "+=, -="
  },
  {
    "id": "JAVA-020",
    "language": "java",
    "level": "입문",
    "topic": "변수·자료형·연산",
    "title": "섭씨를 화씨로 변환",
    "statement": "섭씨 온도를 화씨로 바꾸어 소수 첫째 자리까지 출력한다\n입력 조건: -100≤섭씨≤100. 출력 규격: 화씨 소수 첫째 자리.",
    "input": "0",
    "output": "32.0",
    "hint": "화씨 변환 공식은 섭씨 × 9 / 5 + 32입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        double c=sc.nextDouble(); // 섭씨 0.0 → c=0.0\n        double f=c*9/5+32; // 0*9/5+32 → f=32.0\n        System.out.printf(Locale.US,\"%.1f%n\",f); // 32.0 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "섭씨 0.0 → c=0.0. 0*9/5+32 → f=32.0. 32.0 출력. 예제 실행 결과는 c → 0.0, f → 32.0입니다. 확인할 조건: 9/5 정수 나눗셈 방지.",
    "trace": [
      [
        "입력",
        "c",
        "0 저장",
        "0.0"
      ],
      [
        "계산",
        "f",
        "0*9/5+32",
        "32.0"
      ]
    ],
    "constraints": "-100≤섭씨≤100",
    "edgeCases": "9/5 정수 나눗셈 방지",
    "concept": "double 연산"
  },
  {
    "id": "JAVA-021",
    "language": "java",
    "level": "입문",
    "topic": "조건문",
    "title": "홀수와 짝수 판별",
    "statement": "정수 n이 짝수면 EVEN, 홀수면 ODD를 출력한다\n입력 조건: 절댓값 10000 이하 정수. 출력 규격: EVEN 또는 ODD.",
    "input": "-7",
    "output": "ODD",
    "hint": "나머지가 0인 경우에만 짝수입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 입력 -7 → n=-7\n        if(n%2==0){ // -7%2=-1이므로 조건 거짓\n            System.out.println(\"EVEN\"); // 짝수일 때만 출력(예제는 미실행)\n        }else{ // 짝수 조건을 만족하지 않음\n            System.out.println(\"ODD\"); // 예제에서는 ODD 출력\n        } // 조건 분기 종료\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "입력 -7 → n=-7. -7%2=-1이므로 조건 거짓. 짝수일 때만 출력(예제는 미실행). 예제 실행 결과는 n%2==0 → 거짓, else → ODD입니다. 확인할 조건: 음수·0.",
    "trace": [
      [
        "입력",
        "n",
        "-7 저장",
        "-7"
      ],
      [
        "조건",
        "n%2==0",
        "-1==0",
        "거짓"
      ],
      [
        "분기",
        "else",
        "ODD 출력",
        "ODD"
      ]
    ],
    "constraints": "절댓값 10000 이하 정수",
    "edgeCases": "음수·0",
    "concept": "if, %"
  },
  {
    "id": "JAVA-022",
    "language": "java",
    "level": "입문",
    "topic": "조건문",
    "title": "양수 음수 영 판별",
    "statement": "입력 정수를 POSITIVE, NEGATIVE, ZERO로 분류한다\n입력 조건: 정수 1개. 출력 규격: 분류 문자열.",
    "input": "0",
    "output": "ZERO",
    "hint": "0은 양수나 음수에 포함되지 않습니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 입력 0 → n=0\n        if(n>0){ // 0>0은 거짓\n            System.out.println(\"POSITIVE\"); // 양수일 때 출력\n        }else if(n<0){ // 0<0도 거짓\n            System.out.println(\"NEGATIVE\"); // 음수일 때 출력\n        }else{ // 양수도 음수도 아님\n            System.out.println(\"ZERO\"); // 입력 0이므로 ZERO 출력\n        } // 분기 종료\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "입력 0 → n=0. 0>0은 거짓. 양수일 때 출력. 예제 실행 결과는 n → 0, n>0 / n<0 → ZERO입니다. 확인할 조건: 0 경계.",
    "trace": [
      [
        "입력",
        "n",
        "0 저장",
        "0"
      ],
      [
        "조건",
        "n>0 / n<0",
        "거짓 / 거짓",
        "ZERO"
      ]
    ],
    "constraints": "정수 1개",
    "edgeCases": "0 경계",
    "concept": "if-else if"
  },
  {
    "id": "JAVA-023",
    "language": "java",
    "level": "입문",
    "topic": "조건문",
    "title": "성인 여부 판별",
    "statement": "나이가 19세 이상이면 ADULT, 아니면 MINOR를 출력한다\n입력 조건: 0≤나이≤120. 출력 규격: ADULT 또는 MINOR.",
    "input": "19",
    "output": "ADULT",
    "hint": "이 문제에서 성인 기준은 만 19세 이상으로 고정합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int age=sc.nextInt(); // 입력 19 → age=19\n        if(age>=19){ // 19>=19 참\n            System.out.println(\"ADULT\"); // 성인 출력\n        }else{ // 19세 미만일 때의 분기\n            System.out.println(\"MINOR\"); // 예제는 미실행\n        } // 분기 종료\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "입력 19 → age=19. 19>=19 참. 성인 출력. 예제 실행 결과는 age → 19, age>=19 → ADULT입니다. 확인할 조건: 18·19 경계.",
    "trace": [
      [
        "입력",
        "age",
        "19 저장",
        "19"
      ],
      [
        "조건",
        "age>=19",
        "19>=19 참",
        "ADULT"
      ]
    ],
    "constraints": "0≤나이≤120",
    "edgeCases": "18·19 경계",
    "concept": "비교 연산자"
  },
  {
    "id": "JAVA-024",
    "language": "java",
    "level": "입문",
    "topic": "조건문",
    "title": "두 정수 중 큰 값",
    "statement": "두 정수 중 큰 값을 출력한다\n입력 조건: 정수 2개. 출력 규격: 큰 정수.",
    "input": "7 7",
    "output": "7",
    "hint": "같은 숫자일 때도 큰 값은 그 숫자입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int a=sc.nextInt(); // a=7 입력\n        int b=sc.nextInt(); // b=7 입력\n        int bigger=(a>=b)?a:b; // a>=b가 참 → bigger=7\n        System.out.println(bigger); // 7 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "a=7 입력. b=7 입력. a>=b가 참 → bigger=7. 예제 실행 결과는 a,b → 7,7, a>=b → 7입니다. 확인할 조건: 동일 값.",
    "trace": [
      [
        "입력",
        "a,b",
        "7과 7 저장",
        "7,7"
      ],
      [
        "조건",
        "a>=b",
        "참",
        "7"
      ]
    ],
    "constraints": "정수 2개",
    "edgeCases": "동일 값",
    "concept": "if 비교"
  },
  {
    "id": "JAVA-025",
    "language": "java",
    "level": "입문",
    "topic": "조건문",
    "title": "세 정수의 최댓값",
    "statement": "세 정수 가운데 가장 큰 값을 출력한다\n입력 조건: 정수 3개. 출력 규격: 최댓값.",
    "input": "-2 -8 -1",
    "output": "-1",
    "hint": "최댓값은 0이 아닌 첫 입력값으로 초기화하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int a=sc.nextInt(); // a=-2\n        int b=sc.nextInt(); // b=-8\n        int c=sc.nextInt(); // c=-1\n        int biggest=a; // biggest: 미정 → -2\n        if(b>biggest) biggest=b; // -8>-2는 거짓 → -2 유지\n        if(c>biggest) biggest=c; // -1>-2는 참 → biggest: -2→-1\n        System.out.println(biggest); // -1 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "a=-2. b=-8. c=-1. 예제 실행 결과는 biggest → -2, biggest → -1입니다. 확인할 조건: 음수·중복 최대.",
    "trace": [
      [
        "초기값",
        "biggest",
        "a=-2",
        "-2"
      ],
      [
        "비교 b",
        "biggest",
        "-8>-2 거짓",
        "-2"
      ],
      [
        "비교 c",
        "biggest",
        "-1>-2 참",
        "-1"
      ]
    ],
    "constraints": "정수 3개",
    "edgeCases": "음수·중복 최대",
    "concept": "조건 결합"
  },
  {
    "id": "JAVA-026",
    "language": "java",
    "level": "입문",
    "topic": "조건문",
    "title": "점수의 학점 판별",
    "statement": "0~100 점수를 A/B/C/D/F 구간에 따라 출력한다\n입력 조건: 0≤점수≤100; A≥90 B≥80 C≥70 D≥60. 출력 규격: 학점 문자.",
    "input": "85",
    "output": "B",
    "hint": "조건은 큰 점수부터 검사해야 합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int score=sc.nextInt(); // 입력 85 → score=85\n        char grade; // 등급을 저장할 문자 변수 선언\n        if(score>=90) grade='A'; // 85>=90 거짓\n        else if(score>=80) grade='B'; // 85>=80 참 → grade=B\n        else if(score>=70) grade='C'; // 앞 조건 미충족 시 검사\n        else if(score>=60) grade='D'; // 앞 조건 미충족 시 검사\n        else grade='F'; // 60 미만일 때\n        System.out.println(grade); // B 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "입력 85 → score=85. 등급을 저장할 문자 변수 선언. 85>=90 거짓. 예제 실행 결과는 score>=90 → 계속, score>=80 → B입니다. 확인할 조건: 59·60·89·90 경계.",
    "trace": [
      [
        "입력",
        "score",
        "85 저장",
        "85"
      ],
      [
        "A 검사",
        "score>=90",
        "거짓",
        "계속"
      ],
      [
        "B 검사",
        "score>=80",
        "참",
        "B"
      ]
    ],
    "constraints": "0≤점수≤100; A≥90 B≥80 C≥70 D≥60",
    "edgeCases": "59·60·89·90 경계",
    "concept": "다중 if"
  },
  {
    "id": "JAVA-027",
    "language": "java",
    "level": "입문",
    "topic": "조건문",
    "title": "3의 배수 판별",
    "statement": "정수가 3의 배수이면 YES, 아니면 NO를 출력한다\n입력 조건: 정수 1개. 출력 규격: YES 또는 NO.",
    "input": "9",
    "output": "YES",
    "hint": "3로 나눈 나머지가 0인지 검사합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 예제 n=9 저장\n        boolean match=n%3==0; // 9%3=0 → match=true\n        System.out.println(match?\"YES\":\"NO\"); // 조건 만족 시 YES 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "예제 n=9 저장. 9%3=0 → match=true. 조건 만족 시 YES 출력. 예제 실행 결과는 n → 9, n%3 → YES입니다. 확인할 조건: 0·음수.",
    "trace": [
      [
        "입력",
        "n",
        "9",
        "9"
      ],
      [
        "나머지",
        "n%3",
        "0",
        "YES"
      ]
    ],
    "constraints": "정수 1개",
    "edgeCases": "0·음수",
    "concept": "나머지 조건"
  },
  {
    "id": "JAVA-028",
    "language": "java",
    "level": "입문",
    "topic": "조건문",
    "title": "3과 5의 공배수 판별",
    "statement": "정수가 3과 5 모두로 나누어떨어지는지 판단한다\n입력 조건: 양의 정수 n. 출력 규격: YES 또는 NO.",
    "input": "30",
    "output": "YES",
    "hint": "15로 나눈 나머지가 0인지 검사합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 예제 n=30 저장\n        boolean match=n%15==0; // 30%15=0 → match=true\n        System.out.println(match?\"YES\":\"NO\"); // 조건 만족 시 YES 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "예제 n=30 저장. 30%15=0 → match=true. 조건 만족 시 YES 출력. 예제 실행 결과는 n → 30, n%15 → YES입니다. 확인할 조건: 15·3·5.",
    "trace": [
      [
        "입력",
        "n",
        "30",
        "30"
      ],
      [
        "나머지",
        "n%15",
        "0",
        "YES"
      ]
    ],
    "constraints": "양의 정수 n",
    "edgeCases": "15·3·5",
    "concept": "논리 AND"
  },
  {
    "id": "JAVA-029",
    "language": "java",
    "level": "입문",
    "topic": "조건문",
    "title": "윤년 판별",
    "statement": "그레고리력 윤년 규칙에 따라 LEAP 또는 COMMON을 출력한다\n입력 조건: 1583≤연도≤9999. 출력 규격: LEAP 또는 COMMON.",
    "input": "2000",
    "output": "LEAP",
    "hint": "400의 배수이거나, 4의 배수이면서 100의 배수가 아닌 경우 윤년입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int year=sc.nextInt(); // 예제 year=2000 저장\n        boolean leap=(year%400==0) || (year%4==0 && year%100!=0); // 2000%400=0 → 참\n        System.out.println(leap?\"LEAP\":\"COMMON\"); // LEAP 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "예제 year=2000 저장. 2000%400=0 → 참. LEAP 출력. 예제 실행 결과는 year%400 → 참, leap → LEAP입니다. 확인할 조건: 1900·2000·2024.",
    "trace": [
      [
        "입력",
        "year",
        "2000 저장",
        "2000"
      ],
      [
        "400의 배수",
        "year%400",
        "0",
        "참"
      ],
      [
        "최종",
        "leap",
        "참",
        "LEAP"
      ]
    ],
    "constraints": "1583≤연도≤9999",
    "edgeCases": "1900·2000·2024",
    "concept": "AND와 OR"
  },
  {
    "id": "JAVA-030",
    "language": "java",
    "level": "입문",
    "topic": "조건문",
    "title": "삼각형 성립 여부",
    "statement": "세 양의 정수를 공백으로 구분해 세 변의 길이로 입력받아 삼각형을 만들 수 있으면 YES, 아니면 NO를 출력하시오. 모든 두 변 길이의 합은 나머지 한 변보다 반드시 커야 하며, 같으면 NO입니다. 각 길이는 1 이상 10000 이하입니다.",
    "input": "3 4 5",
    "output": "YES",
    "hint": "모든 두 변의 합이 나머지 변보다 커야 합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        long a=sc.nextLong(); // 첫 변 3\n        long b=sc.nextLong(); // 둘째 변 4\n        long c=sc.nextLong(); // 셋째 변 5\n        boolean ok=a+b>c && a+c>b && b+c>a; // 3+4>5 등을 모두 만족 → 참\n        System.out.println(ok?\"YES\":\"NO\"); // YES 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "첫 변 3. 둘째 변 4. 셋째 변 5. 예제 실행 결과는 a,b,c → 3,4,5, 세 부등식 → 참입니다. 확인할 조건: 합=나머지 한 변.",
    "trace": [
      [
        "입력",
        "a,b,c",
        "3,4,5",
        "3,4,5"
      ],
      [
        "검사",
        "세 부등식",
        "7>5,8>4,9>3",
        "참"
      ]
    ],
    "constraints": "양의 정수 3개≤10000",
    "edgeCases": "합=나머지 한 변",
    "concept": "복합 조건"
  },
  {
    "id": "JAVA-031",
    "language": "java",
    "level": "입문",
    "topic": "조건문",
    "title": "좌표의 사분면",
    "statement": "원점과 축을 제외한 정수 좌표의 사분면 번호를 출력한다\n입력 조건: x≠0, y≠0. 출력 규격: 1~4.",
    "input": "-3 4",
    "output": "2",
    "hint": "x와 y의 부호를 조합해 사분면을 구분하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int x=sc.nextInt(); // x=-3\n        int y=sc.nextInt(); // y=4\n        int quadrant; // 사분면 번호 저장 변수\n        if(x>0 && y>0) quadrant=1; // 오른쪽 위\n        else if(x<0 && y>0) quadrant=2; // 왼쪽 위, 예제 조건 참\n        else if(x<0) quadrant=3; // 왼쪽 아래\n        else quadrant=4; // 오른쪽 아래\n        System.out.println(quadrant); // 2 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "x=-3. y=4. 사분면 번호 저장 변수. 예제 실행 결과는 x,y → -3,4, x<0 && y>0 → 2입니다. 확인할 조건: 부호 조합.",
    "trace": [
      [
        "입력",
        "x,y",
        "-3, 4",
        "-3,4"
      ],
      [
        "조건",
        "x<0 && y>0",
        "참",
        "2"
      ]
    ],
    "constraints": "x≠0, y≠0",
    "edgeCases": "부호 조합",
    "concept": "중첩 조건"
  },
  {
    "id": "JAVA-032",
    "language": "java",
    "level": "입문",
    "topic": "조건문",
    "title": "월의 날짜 수",
    "statement": "평년의 해당 월 날짜 수를 출력한다\n입력 조건: 1≤월≤12, 평년. 출력 규격: 28,30 또는31.",
    "input": "2",
    "output": "28",
    "hint": "윤년이 아닌 평년만 다룹니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int month=sc.nextInt(); // 입력 2 → month=2\n        int days; // 해당 월의 날짜 수\n        if(month==2) days=28; // 평년 2월은 28일\n        else if(month==4 || month==6 || month==9 || month==11) days=30; // 30일인 네 달\n        else days=31; // 나머지 달은 31일\n        System.out.println(days); // 28 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "입력 2 → month=2. 해당 월의 날짜 수. 평년 2월은 28일. 예제 실행 결과는 month → 2, month==2 → 28입니다. 확인할 조건: 2월·4월.",
    "trace": [
      [
        "입력",
        "month",
        "2 저장",
        "2"
      ],
      [
        "판단",
        "month==2",
        "참",
        "28"
      ]
    ],
    "constraints": "1≤월≤12, 평년",
    "edgeCases": "2월·4월",
    "concept": "조건문"
  },
  {
    "id": "JAVA-033",
    "language": "java",
    "level": "입문",
    "topic": "조건문",
    "title": "할인 금액 계산",
    "statement": "구매금액이 10000원 이상이면 10% 할인한 결제금액을 출력한다\n입력 조건: 0≤원 단위 구매금액≤100000, 10% 할인액은 정수 나눗셈 몫. 출력 규격: 정수 결제금액.",
    "input": "15000",
    "output": "13500",
    "hint": "정수 나눗셈의 몫을 할인액으로 사용합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int price=sc.nextInt(); // 구매금액 15000원 저장\n        int payment=price; // payment 초기값=15000\n        if(price>=10000){ // 15000>=10000 참\n            payment=price-price/10; // 할인 1500원 → payment:15000→13500\n        } // 할인 조건 검사 종료\n        System.out.println(payment); // 13500 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "구매금액 15000원 저장. payment 초기값=15000. 15000>=10000 참. 예제 실행 결과는 payment → 15000, payment → 13500입니다. 확인할 조건: 9999·10000.",
    "trace": [
      [
        "입력",
        "price",
        "15000",
        "15000"
      ],
      [
        "초기화",
        "payment",
        "15000",
        "15000"
      ],
      [
        "할인",
        "payment",
        "15000-1500",
        "13500"
      ]
    ],
    "constraints": "0≤원 단위 구매금액≤100000, 10% 할인액은 정수 나눗셈 몫",
    "edgeCases": "9999·10000",
    "concept": "if와 산술"
  },
  {
    "id": "JAVA-034",
    "language": "java",
    "level": "입문",
    "topic": "조건문",
    "title": "요일 번호를 이름으로",
    "statement": "1~7 숫자를 입력받아 MON~SUN을 출력한다\n입력 조건: 1≤번호≤7. 출력 규격: MON~SUN.",
    "input": "3",
    "output": "WED",
    "hint": "배열 인덱스는 0부터 시작하므로 day-1을 사용합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int day=sc.nextInt(); // 입력 3 → day=3\n        String[] names={\"MON\",\"TUE\",\"WED\",\"THU\",\"FRI\",\"SAT\",\"SUN\"}; // 1~7번 요일 표 생성\n        System.out.println(names[day-1]); // 3-1=2 위치의 WED 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "입력 3 → day=3. 1~7번 요일 표 생성. 3-1=2 위치의 WED 출력. 예제 실행 결과는 day-1 → 2, names[2] → WED입니다. 확인할 조건: 모든 case.",
    "trace": [
      [
        "입력",
        "day",
        "3",
        "3"
      ],
      [
        "인덱스",
        "day-1",
        "3-1",
        "2"
      ],
      [
        "출력",
        "names[2]",
        "WED",
        "WED"
      ]
    ],
    "constraints": "1≤번호≤7",
    "edgeCases": "모든 case",
    "concept": "switch"
  },
  {
    "id": "JAVA-035",
    "language": "java",
    "level": "입문",
    "topic": "조건문",
    "title": "월의 계절 구분",
    "statement": "월을 입력받아 SPRING/SUMMER/FALL/WINTER 중 하나를 출력한다\n입력 조건: 1≤월≤12. 출력 규격: 계절 문자열.",
    "input": "12",
    "output": "WINTER",
    "hint": "월의 범위를 네 구간으로 나누세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int month=sc.nextInt(); // 12월 입력\n        String season; // 계절을 저장할 변수\n        if(month>=3 && month<=5) season=\"SPRING\"; // 3~5월\n        else if(month>=6 && month<=8) season=\"SUMMER\"; // 6~8월\n        else if(month>=9 && month<=11) season=\"FALL\"; // 9~11월\n        else season=\"WINTER\"; // 12~2월, 예제는 겨울\n        System.out.println(season); // WINTER 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "12월 입력. 계절을 저장할 변수. 3~5월. 예제 실행 결과는 month → 12, season → WINTER입니다. 확인할 조건: 3·6·9·12.",
    "trace": [
      [
        "입력",
        "month",
        "12",
        "12"
      ],
      [
        "계절",
        "season",
        "그 외 월(12,1,2)",
        "WINTER"
      ]
    ],
    "constraints": "1≤월≤12",
    "edgeCases": "3·6·9·12",
    "concept": "switch, 다중 case"
  },
  {
    "id": "JAVA-036",
    "language": "java",
    "level": "입문",
    "topic": "반복문",
    "title": "1부터 N까지 출력",
    "statement": "정수 1부터 N까지 공백으로 구분하여 출력한다\n입력 조건: 1≤N≤100. 출력 규격: 1 2 ... N.",
    "input": "5",
    "output": "1 2 3 4 5",
    "hint": "반복 과정에서 출력 요소 사이에만 공백을 넣으세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=5 입력\n        StringBuilder out=new StringBuilder(); // 결과를 누적할 문자열 생성\n        for(int i=1;i<=n;i++){ // i=1부터 5까지 증가\n            if(i>1) out.append(\" \"); // 첫 수 다음부터 공백 추가\n            out.append(i); // 순서대로 1,2,3,4,5를 추가\n        } // i=6에서 6<=5 거짓이므로 종료\n        System.out.println(out); // 1 2 3 4 5 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "n=5 입력. 결과를 누적할 문자열 생성. i=1부터 5까지 증가. 예제 실행 결과는 i → 1 2 3 4 5, i → 종료입니다. 확인할 조건: N=1.",
    "trace": [
      [
        "1회",
        "i",
        "1",
        "1"
      ],
      [
        "3회",
        "i",
        "3",
        "1 2 3"
      ],
      [
        "5회",
        "i",
        "5",
        "1 2 3 4 5"
      ],
      [
        "종료",
        "i",
        "6>5",
        "종료"
      ]
    ],
    "constraints": "1≤N≤100",
    "edgeCases": "N=1",
    "concept": "for"
  },
  {
    "id": "JAVA-037",
    "language": "java",
    "level": "입문",
    "topic": "반복문",
    "title": "N부터 1까지 출력",
    "statement": "N부터 1까지 내림차순 출력한다\n입력 조건: 1≤N≤100. 출력 규격: N ... 1.",
    "input": "4",
    "output": "4 3 2 1",
    "hint": "i--를 사용하여 N부터 1까지 감소합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=4 입력\n        StringBuilder out=new StringBuilder(); // 출력 문자열 준비\n        for(int i=n;i>=1;i--){ // i=4,3,2,1 순서로 감소\n            if(i<n) out.append(\" \"); // 두 번째 값부터 공백 삽입\n            out.append(i); // 현재 i를 덧붙임\n        } // i=0이면 조건 0>=1 거짓\n        System.out.println(out); // 4 3 2 1 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "n=4 입력. 출력 문자열 준비. i=4,3,2,1 순서로 감소. 예제 실행 결과는 i → 4 3, i → 4 3 2 1입니다. 확인할 조건: N=1.",
    "trace": [
      [
        "1회",
        "i",
        "4",
        "4"
      ],
      [
        "2회",
        "i",
        "3",
        "4 3"
      ],
      [
        "종료",
        "i",
        "0",
        "4 3 2 1"
      ]
    ],
    "constraints": "1≤N≤100",
    "edgeCases": "N=1",
    "concept": "for 감소"
  },
  {
    "id": "JAVA-038",
    "language": "java",
    "level": "입문",
    "topic": "반복문",
    "title": "1부터 N까지 짝수 출력",
    "statement": "N 이하의 양의 짝수를 공백으로 구분하여 출력한다\n입력 조건: 1≤N≤100. 출력 규격: 2 4 ....",
    "input": "7",
    "output": "2 4 6",
    "hint": "2부터 2씩 증가하면 짝수만 방문합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=7 입력\n        StringBuilder out=new StringBuilder(); // 짝수 출력 문자열\n        for(int i=2;i<=n;i+=2){ // i=2,4,6 순서로 증가\n            if(out.length()>0) out.append(\" \"); // 두 번째 수부터 공백\n            out.append(i); // 현재 짝수를 이어 붙임\n        } // i=8에서 반복 종료\n        System.out.println(out); // 2 4 6 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "n=7 입력. 짝수 출력 문자열. i=2,4,6 순서로 증가. 예제 실행 결과는 i → 2 4, i → 2 4 6입니다. 확인할 조건: N=1(출력 없음).",
    "trace": [
      [
        "1회",
        "i",
        "2",
        "2"
      ],
      [
        "2회",
        "i",
        "4",
        "2 4"
      ],
      [
        "3회",
        "i",
        "6",
        "2 4 6"
      ]
    ],
    "constraints": "1≤N≤100",
    "edgeCases": "N=1(출력 없음)",
    "concept": "for, if"
  },
  {
    "id": "JAVA-039",
    "language": "java",
    "level": "입문",
    "topic": "반복문",
    "title": "1부터 N까지 홀수 합",
    "statement": "N 이하 양의 홀수 합을 출력한다\n입력 조건: 1≤N≤1000. 출력 규격: 정수 합.",
    "input": "5",
    "output": "9",
    "hint": "1부터 2씩 증가하는 반복문으로 홀수만 합산합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=5 입력\n        int sum=0; // sum 초기값=0\n        for(int i=1;i<=n;i+=2){ // i=1,3,5 반복\n            sum+=i; // sum: 0→1→4→9\n        } // i=7에서 종료\n        System.out.println(sum); // 9 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "n=5 입력. sum 초기값=0. i=1,3,5 반복. 예제 실행 결과는 i=3 → 4, i=5 → 9입니다. 확인할 조건: N=1·2.",
    "trace": [
      [
        "1회",
        "i=1",
        "sum 0→1",
        "1"
      ],
      [
        "2회",
        "i=3",
        "sum 1→4",
        "4"
      ],
      [
        "3회",
        "i=5",
        "sum 4→9",
        "9"
      ]
    ],
    "constraints": "1≤N≤1000",
    "edgeCases": "N=1·2",
    "concept": "반복 누적"
  },
  {
    "id": "JAVA-040",
    "language": "java",
    "level": "입문",
    "topic": "반복문",
    "title": "3의 배수 개수",
    "statement": "1부터 N까지 3의 배수가 몇 개인지 계산한다\n입력 조건: 1≤N≤1000. 출력 규격: 개수.",
    "input": "10",
    "output": "3",
    "hint": "매번 3으로 나눈 나머지가 0인지 확인하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=10 저장\n        int count=0; // 배수 개수 초기값 0\n        for(int i=1;i<=n;i++){ // 1에서 10까지 차례로 검사\n            if(i%3==0) count++; // i=3,6,9일 때 count:0→1→2→3\n        } // i=11에서 종료\n        System.out.println(count); // 3 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "n=10 저장. 배수 개수 초기값 0. 1에서 10까지 차례로 검사. 예제 실행 결과는 count → 2, count → 3입니다. 확인할 조건: N=1·3.",
    "trace": [
      [
        "초기",
        "count",
        "0",
        "0"
      ],
      [
        "i=3",
        "count",
        "0→1",
        "1"
      ],
      [
        "i=6",
        "count",
        "1→2",
        "2"
      ],
      [
        "i=9",
        "count",
        "2→3",
        "3"
      ]
    ],
    "constraints": "1≤N≤1000",
    "edgeCases": "N=1·3",
    "concept": "for, 카운터"
  },
  {
    "id": "JAVA-042",
    "language": "java",
    "level": "입문",
    "topic": "반복문",
    "title": "팩토리얼 계산",
    "statement": "1부터 N까지의 곱을 출력한다\n입력 조건: 0≤N≤12. 출력 규격: N!.",
    "input": "5",
    "output": "120",
    "hint": "곱셈의 초기값은 1이어야 하고 0!=1입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=5 입력\n        long result=1; // 0!도 1이므로 곱의 초기값 1\n        for(int i=2;i<=n;i++){ // i=2,3,4,5 증가\n            result*=i; // result:1→2→6→24→120\n        } // i=6이면 반복 종료\n        System.out.println(result); // 120 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "n=5 입력. 0!도 1이므로 곱의 초기값 1. i=2,3,4,5 증가. 예제 실행 결과는 result → 24, result → 120입니다. 확인할 조건: 0!=1, 12!.",
    "trace": [
      [
        "초기",
        "result",
        "1",
        "1"
      ],
      [
        "i=2",
        "result",
        "1*2",
        "2"
      ],
      [
        "i=3",
        "result",
        "2*3",
        "6"
      ],
      [
        "i=4",
        "result",
        "6*4",
        "24"
      ],
      [
        "i=5",
        "result",
        "24*5",
        "120"
      ]
    ],
    "constraints": "0≤N≤12",
    "edgeCases": "0!=1, 12!",
    "concept": "반복 곱셈"
  },
  {
    "id": "JAVA-043",
    "language": "java",
    "level": "입문",
    "topic": "반복문",
    "title": "입력한 단의 구구단",
    "statement": "입력한 단의 1~9 곱셈 결과를 줄마다 출력한다\n입력 조건: 2≤단≤9. 출력 규격: 9줄: 단 x i = 결과.",
    "input": "3",
    "output": "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27",
    "hint": "곱셈 결과를 지정 형식에 맞춰 9줄 출력하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int dan=sc.nextInt(); // dan=3 저장\n        for(int i=1;i<=9;i++){ // i=1부터 9까지 반복\n            System.out.println(dan + \" x \" + i + \" = \" + dan*i); // 각 줄에 3단 곱셈 출력\n        } // i=10이면 반복 종료\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "dan=3 저장. i=1부터 9까지 반복. 각 줄에 3단 곱셈 출력. 예제 실행 결과는 dan*i → 3 x 2 = 6, dan*i → 3 x 9 = 27입니다. 확인할 조건: 2단·9단.",
    "trace": [
      [
        "i=1",
        "dan*i",
        "3*1",
        "3 x 1 = 3"
      ],
      [
        "i=2",
        "dan*i",
        "3*2",
        "3 x 2 = 6"
      ],
      [
        "i=9",
        "dan*i",
        "3*9",
        "3 x 9 = 27"
      ]
    ],
    "constraints": "2≤단≤9",
    "edgeCases": "2단·9단",
    "concept": "for"
  },
  {
    "id": "JAVA-044",
    "language": "java",
    "level": "입문",
    "topic": "반복문",
    "title": "전체 구구단 출력",
    "statement": "2단부터 9단까지 단별로 곱셈 결과를 출력한다\n입력 조건: 입력 없음. 출력 규격: 각 단 9줄, 단 사이 빈 줄.",
    "input": "입력 없음",
    "output": "2 x 1 = 2\n2 x 2 = 4\n2 x 3 = 6\n2 x 4 = 8\n2 x 5 = 10\n2 x 6 = 12\n2 x 7 = 14\n2 x 8 = 16\n2 x 9 = 18\n\n3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n\n4 x 1 = 4\n4 x 2 = 8\n4 x 3 = 12\n4 x 4 = 16\n4 x 5 = 20\n4 x 6 = 24\n4 x 7 = 28\n4 x 8 = 32\n4 x 9 = 36\n\n5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n\n6 x 1 = 6\n6 x 2 = 12\n6 x 3 = 18\n6 x 4 = 24\n6 x 5 = 30\n6 x 6 = 36\n6 x 7 = 42\n6 x 8 = 48\n6 x 9 = 54\n\n7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n\n8 x 1 = 8\n8 x 2 = 16\n8 x 3 = 24\n8 x 4 = 32\n8 x 5 = 40\n8 x 6 = 48\n8 x 7 = 56\n8 x 8 = 64\n8 x 9 = 72\n\n9 x 1 = 9\n9 x 2 = 18\n9 x 3 = 27\n9 x 4 = 36\n9 x 5 = 45\n9 x 6 = 54\n9 x 7 = 63\n9 x 8 = 72\n9 x 9 = 81",
    "hint": "바깥 반복문은 단, 안쪽 반복문은 곱할 수를 담당합니다.",
    "code": "public class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        for(int dan=2;dan<=9;dan++){ // 2단부터 9단까지 증가\n            if(dan>2) System.out.println(); // 단과 단 사이 빈 줄 1개 출력\n            for(int i=1;i<=9;i++){ // 각 단에서 1~9를 곱함\n                System.out.println(dan + \" x \" + i + \" = \" + dan*i); // 현재 단과 곱셈값 출력\n            } // 현재 단의 9개 출력 완료\n        } // 9단까지 완료\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "2단부터 9단까지 증가. 단과 단 사이 빈 줄 1개 출력. 각 단에서 1~9를 곱함. 예제 실행 결과는 dan → 빈 줄 뒤 3단, dan=9, i=9 → 9 x 9 = 81입니다. 확인할 조건: 단과 i 순서.",
    "trace": [
      [
        "처음",
        "dan",
        "2",
        "2 x 1 = 2"
      ],
      [
        "단 변경",
        "dan",
        "2→3",
        "빈 줄 뒤 3단"
      ],
      [
        "마지막",
        "dan=9, i=9",
        "9*9",
        "9 x 9 = 81"
      ]
    ],
    "constraints": "입력 없음",
    "edgeCases": "단과 i 순서",
    "concept": "중첩 for"
  },
  {
    "id": "JAVA-045",
    "language": "java",
    "level": "입문",
    "topic": "반복문",
    "title": "양의 정수 자릿수",
    "statement": "양의 정수를 10으로 나눠 자릿수를 계산한다\n입력 조건: 1≤N≤1000000000. 출력 규격: 자리수.",
    "input": "1200",
    "output": "4",
    "hint": "10으로 나눌 때마다 마지막 자리가 제거됩니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=1200 입력\n        int digits=0; // 계산된 자릿수 초기값 0\n        while(n>0){ // n이 양수인 동안 반복\n            n/=10; // n:1200→120→12→1→0\n            digits++; // digits:0→1→2→3→4\n        } // n=0이면 종료\n        System.out.println(digits); // 4 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "n=1200 입력. 계산된 자릿수 초기값 0. n이 양수인 동안 반복. 예제 실행 결과는 n,digits → 1,3, n,digits → 0,4입니다. 확인할 조건: 1·10·100.",
    "trace": [
      [
        "처음",
        "n,digits",
        "1200,0",
        "1200,0"
      ],
      [
        "1회",
        "n,digits",
        "120,1",
        "120,1"
      ],
      [
        "2회",
        "n,digits",
        "12,2",
        "12,2"
      ],
      [
        "3회",
        "n,digits",
        "1,3",
        "1,3"
      ],
      [
        "4회",
        "n,digits",
        "0,4",
        "0,4"
      ]
    ],
    "constraints": "1≤N≤1000000000",
    "edgeCases": "1·10·100",
    "concept": "while"
  },
  {
    "id": "JAVA-046",
    "language": "java",
    "level": "입문",
    "topic": "반복문",
    "title": "정수 각 자릿수의 합",
    "statement": "양의 정수의 십진수 각 자리 숫자를 모두 더한다\n입력 조건: 0≤N≤1000000000. 출력 규격: 자리수 합.",
    "input": "507",
    "output": "12",
    "hint": "10으로 나눈 나머지를 더하고 몫을 다시 사용합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=507 입력\n        int sum=0; // 자릿수 합 초기값 0\n        do{ // 입력이 0이어도 한 번 실행\n            sum+=n%10; // sum:0→7→7→12 (나머지 7,0,5)\n            n/=10; // n:507→50→5→0\n        }while(n>0); // n이 0이 될 때 종료\n        System.out.println(sum); // 12 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "n=507 입력. 자릿수 합 초기값 0. 입력이 0이어도 한 번 실행. 예제 실행 결과는 n,sum → 5,7, n,sum → 0,12입니다. 확인할 조건: N=0.",
    "trace": [
      [
        "시작",
        "n,sum",
        "507,0",
        "507,0"
      ],
      [
        "1회",
        "n,sum",
        "50,7",
        "50,7"
      ],
      [
        "2회",
        "n,sum",
        "5,7",
        "5,7"
      ],
      [
        "3회",
        "n,sum",
        "0,12",
        "0,12"
      ]
    ],
    "constraints": "0≤N≤1000000000",
    "edgeCases": "N=0",
    "concept": "while, %10"
  },
  {
    "id": "JAVA-047",
    "language": "java",
    "level": "입문",
    "topic": "반복문",
    "title": "정수를 뒤집어 출력",
    "statement": "양의 정수의 숫자 순서를 뒤집어 정수로 출력한다\n입력 조건: 1≤N≤100000000, 뒤집힌 값 int 범위. 출력 규격: 뒤집힌 정수(앞의 0 생략).",
    "input": "120",
    "output": "21",
    "hint": "뒤집힌 값에 10을 곱하고 마지막 자릿수를 붙입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=120 입력\n        int reversed=0; // 뒤집은 값 초기값 0\n        while(n>0){ // 남은 숫자가 있는 동안\n            reversed=reversed*10+n%10; // reversed:0→0→2→21\n            n/=10; // n:120→12→1→0\n        } // 원본 숫자를 모두 처리함\n        System.out.println(reversed); // 21 출력(앞의 0 제외)\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "n=120 입력. 뒤집은 값 초기값 0. 남은 숫자가 있는 동안. 예제 실행 결과는 n,reversed → 1,2, n,reversed → 0,21입니다. 확인할 조건: 120→21.",
    "trace": [
      [
        "시작",
        "n, reversed",
        "120,0",
        "120,0"
      ],
      [
        "1회",
        "n,reversed",
        "12,0",
        "12,0"
      ],
      [
        "2회",
        "n,reversed",
        "1,2",
        "1,2"
      ],
      [
        "3회",
        "n,reversed",
        "0,21",
        "0,21"
      ]
    ],
    "constraints": "1≤N≤100000000, 뒤집힌 값 int 범위",
    "edgeCases": "120→21",
    "concept": "while, %"
  },
  {
    "id": "JAVA-048",
    "language": "java",
    "level": "입문",
    "topic": "반복문",
    "title": "특정 숫자 출현 횟수",
    "statement": "음이 아닌 정수에 특정 십진 숫자가 몇 번 들어있는지 계산한다\n입력 조건: 0≤N≤100000000, 0≤d≤9. 출력 규격: 등장 횟수.",
    "input": "1010 0",
    "output": "2",
    "hint": "N=0인 경우도 한 자리 숫자로 처리해야 합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 검사할 숫자 n=1010\n        int target=sc.nextInt(); // 찾을 숫자 target=0\n        int count=0; // 등장 횟수 0\n        if(n==0 && target==0) count=1; // n=0 자체도 숫자 0 한 자리\n        while(n>0){ // 각 자리 숫자 확인\n            if(n%10==target) count++; // 마지막 자리와 같으면 count 증가\n            n/=10; // 마지막 자리를 제거하여 다음 자리 확인\n        } // 모든 자리를 조사한 뒤 종료\n        System.out.println(count); // 예제에서 0은 두 번 등장 → 2 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "검사할 숫자 n=1010. 찾을 숫자 target=0. 등장 횟수 0. 예제 실행 결과는 n,count → 2, n,count → 2입니다. 확인할 조건: N=0,d=0.",
    "trace": [
      [
        "시작",
        "n,target,count",
        "1010,0,0",
        "0"
      ],
      [
        "1회",
        "n,count",
        "101,1",
        "1"
      ],
      [
        "2회",
        "n,count",
        "10,1",
        "1"
      ],
      [
        "3회",
        "n,count",
        "1,2",
        "2"
      ],
      [
        "4회",
        "n,count",
        "0,2",
        "2"
      ]
    ],
    "constraints": "0≤N≤100000000, 0≤d≤9",
    "edgeCases": "N=0,d=0",
    "concept": "while, 카운터"
  },
  {
    "id": "JAVA-049",
    "language": "java",
    "level": "입문",
    "topic": "반복문",
    "title": "1부터 N까지 제곱 출력",
    "statement": "1에서 N까지 각 수의 제곱을 한 줄씩 출력한다\n입력 조건: 1≤N≤100. 출력 규격: 각 줄의 제곱.",
    "input": "3",
    "output": "1\n4\n9",
    "hint": "반복변수 i에 i를 곱해 제곱을 구합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=3 입력\n        for(int i=1;i<=n;i++){ // i=1,2,3 증가\n            System.out.println(i*i); // 제곱 1,4,9를 한 줄씩 출력\n        } // i=4에서 종료\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "n=3 입력. i=1,2,3 증가. 제곱 1,4,9를 한 줄씩 출력. 예제 실행 결과는 i*i → 4, i*i → 9입니다. 확인할 조건: N=1.",
    "trace": [
      [
        "i=1",
        "i*i",
        "1*1",
        "1"
      ],
      [
        "i=2",
        "i*i",
        "2*2",
        "4"
      ],
      [
        "i=3",
        "i*i",
        "3*3",
        "9"
      ]
    ],
    "constraints": "1≤N≤100",
    "edgeCases": "N=1",
    "concept": "반복·곱셈"
  },
  {
    "id": "JAVA-050",
    "language": "java",
    "level": "입문",
    "topic": "반복문",
    "title": "종료값 전까지 합산",
    "statement": "정수를 여러 개 입력받아 -1이 등장하면 끝내고 이전 입력값의 합을 출력한다\n입력 조건: 첫 줄에 0~10개 정수, 마지막 -1; 다른 수는 -100~100(단 -1 제외). 출력 규격: 누적 합.",
    "input": "3 4 -5 -1",
    "output": "2",
    "hint": "-1은 합산하지 않는 종료 신호입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int sum=0; // 합 초기값 0\n        while(true){ // 종료값을 만날 때까지 입력 반복\n            int value=sc.nextInt(); // 순서대로 3,4,-5,-1 입력\n            if(value==-1) break; // -1이면 더하지 않고 반복 종료\n            sum+=value; // sum:0→3→7→2\n        } // 종료값을 만나 반복 종료\n        System.out.println(sum); // 2 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "합 초기값 0. 종료값을 만날 때까지 입력 반복. 순서대로 3,4,-5,-1 입력. 예제 실행 결과는 sum → 2, sum → 2입니다. 확인할 조건: 바로 -1.",
    "trace": [
      [
        "초기",
        "sum",
        "0",
        "0"
      ],
      [
        "입력 3",
        "sum",
        "0→3",
        "3"
      ],
      [
        "입력 4",
        "sum",
        "3→7",
        "7"
      ],
      [
        "입력 -5",
        "sum",
        "7→2",
        "2"
      ],
      [
        "입력 -1",
        "sum",
        "그대로 2, 종료",
        "2"
      ]
    ],
    "constraints": "첫 줄에 0~10개 정수, 마지막 -1; 다른 수는 -100~100(단 -1 제외)",
    "edgeCases": "바로 -1",
    "concept": "while, 중단조건"
  },
  {
    "id": "JAVA-051",
    "language": "java",
    "level": "기초 응용",
    "topic": "반복문",
    "title": "do-while 반복 횟수",
    "statement": "양의 정수를 반복 입력받다가 0을 받으면 종료하고 양의 입력 개수를 출력한다\n입력 조건: 0~100 양의 정수 뒤 마지막 0. 출력 규격: 양수 개수.",
    "input": "4 2 7 0",
    "output": "3",
    "hint": "do-while은 본문을 먼저 실행하고 나중에 조건을 평가합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int count=0; // 양의 정수 개수 초기값 0\n        int value; // 입력값 저장 변수\n        do{ // 첫 값을 우선 입력\n            value=sc.nextInt(); // 순서대로 4,2,7,0 입력\n            if(value>0) count++; // 양수일 때 count:0→1→2→3\n        }while(value!=0); // 0을 받으면 종료\n        System.out.println(count); // 3 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "양의 정수 개수 초기값 0. 입력값 저장 변수. 첫 값을 우선 입력. 예제 실행 결과는 value,count → 3, value,count → 3입니다. 확인할 조건: 바로 0.",
    "trace": [
      [
        "처음",
        "count",
        "0",
        "0"
      ],
      [
        "4 입력",
        "value,count",
        "4,1",
        "1"
      ],
      [
        "2 입력",
        "value,count",
        "2,2",
        "2"
      ],
      [
        "7 입력",
        "value,count",
        "7,3",
        "3"
      ],
      [
        "0 입력",
        "value,count",
        "0,3(종료)",
        "3"
      ]
    ],
    "constraints": "0~100 양의 정수 뒤 마지막 0",
    "edgeCases": "바로 0",
    "concept": "do-while"
  },
  {
    "id": "JAVA-052",
    "language": "java",
    "level": "기초 응용",
    "topic": "반복문",
    "title": "소수 여부 판별",
    "statement": "입력한 정수가 소수인지 판단한다\n입력 조건: 1≤N≤100000. 출력 규격: PRIME 또는 COMPOSITE(1은 NEITHER).",
    "input": "17",
    "output": "PRIME",
    "hint": "1은 NEITHER, 2 이상의 자연수는 제곱근까지만 약수를 검사해도 됩니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=17 입력\n        if(n==1){ // 1은 소수도 합성수도 아님\n            System.out.println(\"NEITHER\"); // 1일 때만 출력\n        }else{ // n>=2에서 소수 여부 검사\n            boolean prime=true; // 현재까지 약수가 없다고 가정\n            for(int d=2;d<=n/d;d++){ // 2부터 제곱근 이하의 약수만 확인\n                if(n%d==0){ prime=false; break; } // 나누어떨어지면 합성수로 변경 후 중단\n            } // 약수 탐색 종료\n            System.out.println(prime?\"PRIME\":\"COMPOSITE\"); // 17은 PRIME 출력\n        } // 결과 분기 종료\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "n=17 입력. 1은 소수도 합성수도 아님. 1일 때만 출력. 예제 실행 결과는 n%d → true, prime → PRIME입니다. 확인할 조건: 1·2·4·97.",
    "trace": [
      [
        "입력",
        "n",
        "17",
        "17"
      ],
      [
        "초기",
        "prime",
        "true",
        "true"
      ],
      [
        "d=2,3,4",
        "n%d",
        "각각 나머지 존재",
        "true"
      ],
      [
        "종료",
        "prime",
        "약수 없음",
        "PRIME"
      ]
    ],
    "constraints": "1≤N≤100000",
    "edgeCases": "1·2·4·97",
    "concept": "for, 나눗셈"
  },
  {
    "id": "JAVA-053",
    "language": "java",
    "level": "기초 응용",
    "topic": "반복문",
    "title": "N 이하 소수 개수",
    "statement": "1부터 N까지 소수의 개수를 출력한다\n입력 조건: 1≤N≤1000. 출력 규격: 소수 개수.",
    "input": "10",
    "output": "4",
    "hint": "후보마다 소수 여부를 새로 초기화하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=10 입력\n        int count=0; // 소수 개수 초기값 0\n        for(int value=2;value<=n;value++){ // 후보 2부터 10까지 검사\n            boolean prime=true; // 현재 후보는 우선 소수라 가정\n            for(int d=2;d<=value/d;d++){ // 제곱근 이하 약수 탐색\n                if(value%d==0){ prime=false; break; } // 약수가 있으면 소수 아님\n            } // 현재 후보의 약수 검사 완료\n            if(prime) count++; // 2,3,5,7 발견 시 count:0→1→2→3→4\n        } // 10까지 검사 완료\n        System.out.println(count); // 4 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "n=10 입력. 소수 개수 초기값 0. 후보 2부터 10까지 검사. 예제 실행 결과는 count → 3, count → 4입니다. 확인할 조건: N=1·2·10.",
    "trace": [
      [
        "시작",
        "count",
        "0",
        "0"
      ],
      [
        "value=2",
        "count",
        "0→1",
        "1"
      ],
      [
        "value=3",
        "count",
        "1→2",
        "2"
      ],
      [
        "value=5",
        "count",
        "2→3",
        "3"
      ],
      [
        "value=7",
        "count",
        "3→4",
        "4"
      ]
    ],
    "constraints": "1≤N≤1000",
    "edgeCases": "N=1·2·10",
    "concept": "중첩 for"
  },
  {
    "id": "JAVA-054",
    "language": "java",
    "level": "기초 응용",
    "topic": "반복문",
    "title": "최대공약수 구하기",
    "statement": "유클리드 호제법으로 두 자연수의 최대공약수를 구한다\n입력 조건: 1≤a,b≤100000. 출력 규격: 최대공약수.",
    "input": "18 24",
    "output": "6",
    "hint": "a%b의 나머지를 새 b로 사용해 0까지 반복합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int a=sc.nextInt(); // a=18 입력\n        int b=sc.nextInt(); // b=24 입력\n        while(b!=0){ // b가 0이 될 때까지 반복\n            int remainder=a%b; // remainder: 18→6→0 (계산은 18%24,24%18,18%6)\n            a=b; // a:18→24→18→6\n            b=remainder; // b:24→18→6→0\n        } // b=0이면 종료\n        a=Math.abs(a); // 음수 방지(제약상 양수이므로 값 6 유지)\n        System.out.println(a); // 6 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "a=18 입력. b=24 입력. b가 0이 될 때까지 반복. 예제 실행 결과는 a,b → 18,6, a,b → 6,0입니다. 확인할 조건: a=b.",
    "trace": [
      [
        "시작",
        "a,b",
        "18,24",
        "18,24"
      ],
      [
        "1회",
        "a,b",
        "24,18",
        "24,18"
      ],
      [
        "2회",
        "a,b",
        "18,6",
        "18,6"
      ],
      [
        "3회",
        "a,b",
        "6,0",
        "6,0"
      ]
    ],
    "constraints": "1≤a,b≤100000",
    "edgeCases": "a=b",
    "concept": "while, 나머지"
  },
  {
    "id": "JAVA-055",
    "language": "java",
    "level": "기초 응용",
    "topic": "반복문",
    "title": "피보나치 수열 출력",
    "statement": "첫 N개의 피보나치 수를 0 1 1 2 순으로 출력한다\n입력 조건: 1≤N≤30. 출력 규격: 공백 구분한 N개 항.",
    "input": "7",
    "output": "0 1 1 2 3 5 8",
    "hint": "a, b 두 변수를 순서대로 갱신하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=7 입력\n        long a=0,b=1; // 첫 두 피보나치 수 0,1로 초기화\n        StringBuilder out=new StringBuilder(); // 출력 문자열 준비\n        for(int i=0;i<n;i++){ // 정확히 n번 반복\n            if(i>0) out.append(\" \"); // 항 사이 공백 삽입\n            out.append(a); // 현재 a를 수열 항으로 기록\n            long next=a+b; // 다음 항을 계산\n            a=b; // a를 이전 b 값으로 변경\n            b=next; // b에 새 항 저장\n        } // n개 항 출력 준비 완료\n        System.out.println(out); // 0 1 1 2 3 5 8 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "n=7 입력. 첫 두 피보나치 수 0,1로 초기화. 출력 문자열 준비. 예제 실행 결과는 출력 a → 1, 출력 a → 8입니다. 확인할 조건: N=1·2.",
    "trace": [
      [
        "초기",
        "a,b",
        "0,1",
        "0,1"
      ],
      [
        "1회",
        "출력 a",
        "0",
        "0"
      ],
      [
        "2회",
        "출력 a",
        "1",
        "1"
      ],
      [
        "3회",
        "출력 a",
        "1",
        "1"
      ],
      [
        "7회",
        "출력 a",
        "8",
        "8"
      ]
    ],
    "constraints": "1≤N≤30",
    "edgeCases": "N=1·2",
    "concept": "반복, 세 변수"
  },
  {
    "id": "JAVA-056",
    "language": "java",
    "level": "기초 응용",
    "topic": "배열",
    "title": "배열의 합계",
    "statement": "정수 N개를 배열에 저장하고 합을 출력한다\n입력 조건: 1≤N≤100, 각 정수 절댓값≤1000. 출력 규격: 합.",
    "input": "4 1 -2 3 5",
    "output": "7",
    "hint": "입력 순서대로 배열에 저장하고 누적합을 계산하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 배열에 저장할 숫자 개수를 입력받음\n        int[] arr=new int[n]; // n개 크기의 정수 배열을 생성\n        for(int i=0;i<n;i++){ // i를 0부터 n-1까지 증가\n            arr[i]=sc.nextInt(); // i번째 위치에 다음 정수를 저장\n        } // 전체 배열 입력을 완료\n        long total=0; // 합계를 저장할 변수를 0으로 초기화\n        for(int i=0;i<n;i++){ // 배열 원소를 순서대로 방문\n            total += arr[i]; // i번째 값을 기존 합계에 누적\n        } // 배열 전체 처리 완료\n        System.out.println(total); // 최종 합계를 한 줄로 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "배열에 저장할 숫자 개수를 입력받음. n개 크기의 정수 배열을 생성. i를 0부터 n-1까지 증가. 예제 실행 결과는 total → -1, total → 7입니다. 확인할 조건: 음수만.",
    "trace": [
      [
        "입력",
        "arr",
        "[1,-2,3,5]",
        "[1,-2,3,5]"
      ],
      [
        "처음",
        "total",
        "0",
        "0"
      ],
      [
        "i=0",
        "total",
        "0+1",
        "1"
      ],
      [
        "i=1",
        "total",
        "1-2",
        "-1"
      ],
      [
        "i=2,3",
        "total",
        "-1+3+5",
        "7"
      ]
    ],
    "constraints": "1≤N≤100, 각 정수 절댓값≤1000",
    "edgeCases": "음수만",
    "concept": "int[], for"
  },
  {
    "id": "JAVA-057",
    "language": "java",
    "level": "기초 응용",
    "topic": "배열",
    "title": "배열의 평균",
    "statement": "입력된 정수 배열의 평균을 소수 둘째 자리까지 출력한다\n입력 조건: 1≤N≤100, 각 정수 절댓값≤1000. 출력 규격: 소수 둘째 자리 평균.",
    "input": "3 1 2 2",
    "output": "1.67",
    "hint": "합계를 n으로 나눌 때 실수형으로 변환하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 배열에 저장할 숫자 개수를 입력받음\n        int[] arr=new int[n]; // n개 크기의 정수 배열을 생성\n        for(int i=0;i<n;i++){ // i를 0부터 n-1까지 증가\n            arr[i]=sc.nextInt(); // i번째 위치에 다음 정수를 저장\n        } // 전체 배열 입력을 완료\n        long sum=0; // 합계 초기값 0\n        for(int i=0;i<n;i++){ // 모든 원소를 방문\n            sum+=arr[i]; // 예제 sum:0→1→3→5\n        } // 원소 합산 완료\n        double avg=(double)sum/n; // 5/3 → 약 1.6667\n        System.out.printf(Locale.US,\"%.2f%n\",avg); // 1.67 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "배열에 저장할 숫자 개수를 입력받음. n개 크기의 정수 배열을 생성. i를 0부터 n-1까지 증가. 예제 실행 결과는 sum → 5, avg → 1.67입니다. 확인할 조건: 음수·N=1.",
    "trace": [
      [
        "입력",
        "arr",
        "[1,2,2]",
        "[1,2,2]"
      ],
      [
        "합계",
        "sum",
        "0→1→3→5",
        "5"
      ],
      [
        "평균",
        "avg",
        "5/3",
        "1.67"
      ]
    ],
    "constraints": "1≤N≤100, 각 정수 절댓값≤1000",
    "edgeCases": "음수·N=1",
    "concept": "배열, double"
  },
  {
    "id": "JAVA-058",
    "language": "java",
    "level": "기초 응용",
    "topic": "배열",
    "title": "배열의 최댓값",
    "statement": "배열의 원소 중 최댓값을 출력한다\n입력 조건: 1≤N≤100, 각 값 절댓값≤10000. 출력 규격: 최댓값.",
    "input": "4 -7 -2 -9 -4",
    "output": "-2",
    "hint": "최댓값의 시작값은 0이 아니라 첫 원소입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 배열에 저장할 숫자 개수를 입력받음\n        int[] arr=new int[n]; // n개 크기의 정수 배열을 생성\n        for(int i=0;i<n;i++){ // i를 0부터 n-1까지 증가\n            arr[i]=sc.nextInt(); // i번째 위치에 다음 정수를 저장\n        } // 전체 배열 입력을 완료\n        int answer=arr[0]; // 첫 원소 -7로 최댓값 초기화\n        for(int i=1;i<n;i++){ // 두 번째 원소부터 비교\n            if(arr[i]>answer) answer=arr[i]; // 조건을 만족할 때만 answer 갱신\n        } // 배열 전체 비교 완료\n        System.out.println(answer); // 예제 최댓값 -2 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "배열에 저장할 숫자 개수를 입력받음. n개 크기의 정수 배열을 생성. i를 0부터 n-1까지 증가. 예제 실행 결과는 answer → -7, answer → -2입니다. 확인할 조건: 전부 음수.",
    "trace": [
      [
        "초기",
        "answer",
        "-7",
        "-7"
      ],
      [
        "반복",
        "answer",
        "각 원소 비교 후 -2",
        "-2"
      ]
    ],
    "constraints": "1≤N≤100, 각 값 절댓값≤10000",
    "edgeCases": "전부 음수",
    "concept": "배열 순회"
  },
  {
    "id": "JAVA-059",
    "language": "java",
    "level": "기초 응용",
    "topic": "배열",
    "title": "배열의 최솟값",
    "statement": "배열의 원소 중 최솟값을 출력한다\n입력 조건: 1≤N≤100, 각 값 절댓값≤10000. 출력 규격: 최솟값.",
    "input": "4 8 3 9 4",
    "output": "3",
    "hint": "최솟값의 시작값은 0이 아니라 첫 원소입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 배열에 저장할 숫자 개수를 입력받음\n        int[] arr=new int[n]; // n개 크기의 정수 배열을 생성\n        for(int i=0;i<n;i++){ // i를 0부터 n-1까지 증가\n            arr[i]=sc.nextInt(); // i번째 위치에 다음 정수를 저장\n        } // 전체 배열 입력을 완료\n        int answer=arr[0]; // 첫 원소 8로 최솟값 초기화\n        for(int i=1;i<n;i++){ // 두 번째 원소부터 비교\n            if(arr[i]<answer) answer=arr[i]; // 조건을 만족할 때만 answer 갱신\n        } // 배열 전체 비교 완료\n        System.out.println(answer); // 예제 최솟값 3 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "배열에 저장할 숫자 개수를 입력받음. n개 크기의 정수 배열을 생성. i를 0부터 n-1까지 증가. 예제 실행 결과는 answer → 8, answer → 3입니다. 확인할 조건: 전부 양수.",
    "trace": [
      [
        "초기",
        "answer",
        "8",
        "8"
      ],
      [
        "반복",
        "answer",
        "각 원소 비교 후 3",
        "3"
      ]
    ],
    "constraints": "1≤N≤100, 각 값 절댓값≤10000",
    "edgeCases": "전부 양수",
    "concept": "배열 순회"
  },
  {
    "id": "JAVA-060",
    "language": "java",
    "level": "기초 응용",
    "topic": "배열",
    "title": "배열의 홀짝 개수",
    "statement": "배열의 짝수·홀수 원소 수를 각각 출력한다\n입력 조건: 1≤N≤100, 각 값 절댓값≤10000. 출력 규격: 짝수 개수, 홀수 개수.",
    "input": "5 0 2 3 4 7",
    "output": "3 2",
    "hint": "0은 짝수입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 배열에 저장할 숫자 개수를 입력받음\n        int[] arr=new int[n]; // n개 크기의 정수 배열을 생성\n        for(int i=0;i<n;i++){ // i를 0부터 n-1까지 증가\n            arr[i]=sc.nextInt(); // i번째 위치에 다음 정수를 저장\n        } // 전체 배열 입력을 완료\n        int evens=0, odds=0; // 짝수·홀수 개수 초기값 0\n        for(int x:arr){ // 배열 원소를 순서대로 x에 전달\n            if(x%2==0) evens++; // 0,2,4에서 evens:0→1→2→3\n            else odds++; // 3,7에서 odds:0→1→2\n        } // 전체 원소 판별 완료\n        System.out.println(evens + \" \" + odds); // 3 2 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "배열에 저장할 숫자 개수를 입력받음. n개 크기의 정수 배열을 생성. i를 0부터 n-1까지 증가. 예제 실행 결과는 evens → 3, odds → 2입니다. 확인할 조건: 0 포함.",
    "trace": [
      [
        "처음",
        "evens,odds",
        "0,0",
        "0,0"
      ],
      [
        "0 처리",
        "evens",
        "0→1",
        "1"
      ],
      [
        "2,4 처리",
        "evens",
        "1→2→3",
        "3"
      ],
      [
        "3,7 처리",
        "odds",
        "0→1→2",
        "2"
      ]
    ],
    "constraints": "1≤N≤100, 각 값 절댓값≤10000",
    "edgeCases": "0 포함",
    "concept": "배열, 조건"
  },
  {
    "id": "JAVA-061",
    "language": "java",
    "level": "기초 응용",
    "topic": "배열",
    "title": "배열을 역순으로 출력",
    "statement": "저장된 배열을 뒤에서 앞으로 출력한다\n입력 조건: 1≤N≤100, 정수 N개. 출력 규격: 원소를 역순으로 공백 구분.",
    "input": "4 10 20 30 40",
    "output": "40 30 20 10",
    "hint": "마지막 원소의 인덱스는 n-1입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 배열에 저장할 숫자 개수를 입력받음\n        int[] arr=new int[n]; // n개 크기의 정수 배열을 생성\n        for(int i=0;i<n;i++){ // i를 0부터 n-1까지 증가\n            arr[i]=sc.nextInt(); // i번째 위치에 다음 정수를 저장\n        } // 전체 배열 입력을 완료\n        StringBuilder out=new StringBuilder(); // 출력 문자열 준비\n        for(int i=n-1;i>=0;i--){ // 마지막 인덱스부터 0까지 감소\n            if(i<n-1) out.append(\" \"); // 첫 값 이후부터 공백 추가\n            out.append(arr[i]); // i=3,2,1,0 위치의 값 추가\n        } // i=-1이면 종료\n        System.out.println(out); // 40 30 20 10 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "배열에 저장할 숫자 개수를 입력받음. n개 크기의 정수 배열을 생성. i를 0부터 n-1까지 증가. 예제 실행 결과는 out → 40 30, out → 40 30 20 10입니다. 확인할 조건: N=1.",
    "trace": [
      [
        "입력",
        "arr",
        "[10,20,30,40]",
        "4개"
      ],
      [
        "i=3",
        "out",
        "40",
        "40"
      ],
      [
        "i=2",
        "out",
        "40 30",
        "40 30"
      ],
      [
        "i=0",
        "out",
        "40 30 20 10",
        "40 30 20 10"
      ]
    ],
    "constraints": "1≤N≤100, 정수 N개",
    "edgeCases": "N=1",
    "concept": "역방향 인덱스"
  },
  {
    "id": "JAVA-062",
    "language": "java",
    "level": "기초 응용",
    "topic": "배열",
    "title": "배열의 목표값 개수",
    "statement": "배열에서 주어진 정수와 같은 원소 개수를 센다\n입력 조건: 1≤N≤100, 정수 N개와 target. 출력 규격: 일치 개수.",
    "input": "5 3 2 3 1 3 3",
    "output": "3",
    "hint": "목표값은 배열 N개를 입력받은 후 읽습니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 배열에 저장할 숫자 개수를 입력받음\n        int[] arr=new int[n]; // n개 크기의 정수 배열을 생성\n        for(int i=0;i<n;i++){ // i를 0부터 n-1까지 증가\n            arr[i]=sc.nextInt(); // i번째 위치에 다음 정수를 저장\n        } // 전체 배열 입력을 완료\n        int target=sc.nextInt(); // 마지막 입력 3 → target=3\n        int count=0; // 일치 개수 초기화\n        for(int value:arr){ // 배열을 순서대로 검사\n            if(value==target) count++; // 3이 세 번 나오므로 count:0→1→2→3\n        } // 모든 원소 비교 완료\n        System.out.println(count); // 3 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "배열에 저장할 숫자 개수를 입력받음. n개 크기의 정수 배열을 생성. i를 0부터 n-1까지 증가. 예제 실행 결과는 target → 3, count → 3입니다. 확인할 조건: 없는 값.",
    "trace": [
      [
        "입력",
        "target",
        "3",
        "3"
      ],
      [
        "비교",
        "count",
        "0→1→2→3",
        "3"
      ]
    ],
    "constraints": "1≤N≤100, 정수 N개와 target",
    "edgeCases": "없는 값",
    "concept": "선형 탐색"
  },
  {
    "id": "JAVA-063",
    "language": "java",
    "level": "기초 응용",
    "topic": "배열",
    "title": "첫 번째 일치 위치",
    "statement": "배열에서 target이 처음 나타나는 0 기반 인덱스를 출력한다\n입력 조건: 1≤N≤100, 원소 N개, target. 출력 규격: 첫 인덱스 또는 -1.",
    "input": "5 7 8 7 9 7 7",
    "output": "0",
    "hint": "첫 발견 즉시 break 하면 첫 번째 인덱스를 얻습니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 배열에 저장할 숫자 개수를 입력받음\n        int[] arr=new int[n]; // n개 크기의 정수 배열을 생성\n        for(int i=0;i<n;i++){ // i를 0부터 n-1까지 증가\n            arr[i]=sc.nextInt(); // i번째 위치에 다음 정수를 저장\n        } // 전체 배열 입력을 완료\n        int target=sc.nextInt(); // 찾을 값 7 입력\n        int index=-1; // 찾지 못했을 때의 반환값 -1\n        for(int i=0;i<n;i++){ // 인덱스 0부터 순서대로 검사\n            if(arr[i]==target){ index=i; break; } // i=0에서 발견 → index=0, 종료\n        } // 탐색 완료\n        System.out.println(index); // 첫 일치 위치 0 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "배열에 저장할 숫자 개수를 입력받음. n개 크기의 정수 배열을 생성. i를 0부터 n-1까지 증가. 예제 실행 결과는 arr[i] → 참, index → 0입니다. 확인할 조건: 중복값·없음.",
    "trace": [
      [
        "초기",
        "index",
        "-1",
        "-1"
      ],
      [
        "i=0",
        "arr[i]",
        "7==7",
        "참"
      ],
      [
        "발견",
        "index",
        "-1→0",
        "0"
      ]
    ],
    "constraints": "1≤N≤100, 원소 N개, target",
    "edgeCases": "중복값·없음",
    "concept": "탐색, break"
  },
  {
    "id": "JAVA-064",
    "language": "java",
    "level": "기초 응용",
    "topic": "배열",
    "title": "배열 원소 위치 교환",
    "statement": "입력받은 0 기반 인덱스 두 위치의 값을 교환해 전체를 출력한다\n입력 조건: 1≤N≤100, N개 값, 0≤i,j<N. 출력 규격: 변경된 배열.",
    "input": "4 10 20 30 40 1 3",
    "output": "10 40 30 20",
    "hint": "원소 값을 임시 변수에 보관한 뒤 바꿉니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 배열에 저장할 숫자 개수를 입력받음\n        int[] arr=new int[n]; // n개 크기의 정수 배열을 생성\n        for(int i=0;i<n;i++){ // i를 0부터 n-1까지 증가\n            arr[i]=sc.nextInt(); // i번째 위치에 다음 정수를 저장\n        } // 전체 배열 입력을 완료\n        int i=sc.nextInt(); // 교환할 첫 번째 인덱스 1\n        int j=sc.nextInt(); // 교환할 두 번째 인덱스 3\n        int temp=arr[i]; // temp=20 저장\n        arr[i]=arr[j]; // arr[1]:20→40\n        arr[j]=temp; // arr[3]:40→20\n        StringJoiner out=new StringJoiner(\" \"); // 공백 구분 출력 준비\n        for(int value:arr) out.add(String.valueOf(value)); // 원소를 차례로 연결\n        System.out.println(out); // 10 40 30 20 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "배열에 저장할 숫자 개수를 입력받음. n개 크기의 정수 배열을 생성. i를 0부터 n-1까지 증가. 예제 실행 결과는 arr[1] → 40, arr[3] → 20입니다. 확인할 조건: i=j.",
    "trace": [
      [
        "입력",
        "arr",
        "[10,20,30,40]",
        "초기 배열"
      ],
      [
        "저장",
        "temp",
        "20",
        "20"
      ],
      [
        "교환",
        "arr[1]",
        "20→40",
        "40"
      ],
      [
        "교환",
        "arr[3]",
        "40→20",
        "20"
      ]
    ],
    "constraints": "1≤N≤100, N개 값, 0≤i,j<N",
    "edgeCases": "i=j",
    "concept": "temp, 인덱스"
  },
  {
    "id": "JAVA-065",
    "language": "java",
    "level": "기초 응용",
    "topic": "배열",
    "title": "오름차순 배열인지 검사",
    "statement": "배열이 앞에서 뒤로 비감소 순서인지 확인한다\n입력 조건: 1≤N≤100, 정수 N개. 출력 규격: YES 또는 NO.",
    "input": "4 1 2 2 4",
    "output": "YES",
    "hint": "같은 값은 허용하며 arr[i-1] > arr[i]만 위반입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 배열에 저장할 숫자 개수를 입력받음\n        int[] arr=new int[n]; // n개 크기의 정수 배열을 생성\n        for(int i=0;i<n;i++){ // i를 0부터 n-1까지 증가\n            arr[i]=sc.nextInt(); // i번째 위치에 다음 정수를 저장\n        } // 전체 배열 입력을 완료\n        boolean sorted=true; // 비감소 배열이라고 가정\n        for(int i=1;i<n;i++){ // 앞 원소와 다음 원소를 비교\n            if(arr[i-1]>arr[i]){ sorted=false; break; } // 내림 구간 발견 시 false\n        } // 순서 검사 완료\n        System.out.println(sorted?\"YES\":\"NO\"); // 1,2,2,4 → YES 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "배열에 저장할 숫자 개수를 입력받음. n개 크기의 정수 배열을 생성. i를 0부터 n-1까지 증가. 예제 실행 결과는 arr → 4개, sorted → true입니다. 확인할 조건: 같은 값 허용.",
    "trace": [
      [
        "입력",
        "arr",
        "[1,2,2,4]",
        "4개"
      ],
      [
        "검사",
        "sorted",
        "1≤2, 2≤2, 2≤4",
        "true"
      ]
    ],
    "constraints": "1≤N≤100, 정수 N개",
    "edgeCases": "같은 값 허용",
    "concept": "인접 원소 비교"
  },
  {
    "id": "JAVA-066",
    "language": "java",
    "level": "입문",
    "topic": "문자열 기초",
    "title": "문자열 길이",
    "statement": "공백 없는 문자열 길이를 출력한다\n입력 조건: 문자열 길이 1~100, 영문과 숫자. 출력 규격: 문자 수.",
    "input": "abc123",
    "output": "6",
    "hint": "String.length()로 문자 수를 구합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String s=sc.next(); // s=\"abc123\" 저장\n        int length=s.length(); // 문자열 길이 6을 반환\n        System.out.println(length); // 6 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "s=\"abc123\" 저장. 문자열 길이 6을 반환. 6 출력. 예제 실행 결과는 s → abc123, length → 6입니다. 확인할 조건: 1글자.",
    "trace": [
      [
        "입력",
        "s",
        "abc123",
        "abc123"
      ],
      [
        "길이",
        "length",
        "6",
        "6"
      ]
    ],
    "constraints": "문자열 길이 1~100, 영문과 숫자",
    "edgeCases": "1글자",
    "concept": "String.length"
  },
  {
    "id": "JAVA-067",
    "language": "java",
    "level": "기초 응용",
    "topic": "문자열 기초",
    "title": "대문자 소문자 개수",
    "statement": "영문 문자열의 대문자와 소문자 개수를 센다\n입력 조건: 문자열 1~100자, A-Z·a-z. 출력 규격: 대문자 개수, 소문자 개수.",
    "input": "AbCDz",
    "output": "3 2",
    "hint": "ASCII 영문 대소문자 범위를 구분합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String s=sc.next(); // s=\"AbCDz\"\n        int upper=0, lower=0; // 두 개수 0으로 초기화\n        for(int i=0;i<s.length();i++){ // 각 문자를 순서대로 방문\n            char ch=s.charAt(i); // 현재 문자를 꺼냄\n            if(ch>='A' && ch<='Z') upper++; // A,C,D에서 upper:0→1→2→3\n            else lower++; // b,z에서 lower:0→1→2\n        } // 문자열 끝까지 처리\n        System.out.println(upper + \" \" + lower); // 3 2 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "s=\"AbCDz\". 두 개수 0으로 초기화. 각 문자를 순서대로 방문. 예제 실행 결과는 upper → 3, lower → 2입니다. 확인할 조건: 한 종류만.",
    "trace": [
      [
        "입력",
        "s",
        "AbCDz",
        "5글자"
      ],
      [
        "대문자",
        "upper",
        "0→1→2→3",
        "3"
      ],
      [
        "소문자",
        "lower",
        "0→1→2",
        "2"
      ]
    ],
    "constraints": "문자열 1~100자, A-Z·a-z",
    "edgeCases": "한 종류만",
    "concept": "charAt, 범위 비교"
  },
  {
    "id": "JAVA-068",
    "language": "java",
    "level": "기초 응용",
    "topic": "문자열 기초",
    "title": "문자열 속 숫자 개수",
    "statement": "문자열에서 0~9 문자의 개수를 센다\n입력 조건: 공백 없는 ASCII 문자열 1~100자. 출력 규격: 숫자 문자 개수.",
    "input": "A1b23!",
    "output": "3",
    "hint": "문자 범위는 숫자 문자 0부터 9까지입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String s=sc.next(); // s=\"A1b23!\" 저장\n        int count=0; // 숫자 문자 개수 0\n        for(int i=0;i<s.length();i++){ // 모든 문자 검사\n            char ch=s.charAt(i); // 현재 인덱스의 문자 추출\n            if(ch>='0' && ch<='9') count++; // '1','2','3'에서 0→1→2→3\n        } // 문자 검색 완료\n        System.out.println(count); // 3 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "s=\"A1b23!\" 저장. 숫자 문자 개수 0. 모든 문자 검사. 예제 실행 결과는 s → 6글자, count → 3입니다. 확인할 조건: 숫자 없음.",
    "trace": [
      [
        "입력",
        "s",
        "A1b23!",
        "6글자"
      ],
      [
        "검사",
        "count",
        "0→1→2→3",
        "3"
      ]
    ],
    "constraints": "공백 없는 ASCII 문자열 1~100자",
    "edgeCases": "숫자 없음",
    "concept": "charAt, isDigit"
  },
  {
    "id": "JAVA-069",
    "language": "java",
    "level": "기초 응용",
    "topic": "문자열 기초",
    "title": "특정 문자 출현 횟수",
    "statement": "문자열에서 목표 문자와 동일한 문자가 몇 개인지 센다\n입력 조건: 공백 없는 영문 문자열, 목표 영문자 1개. 출력 규격: 출현 횟수.",
    "input": "banana a",
    "output": "3",
    "hint": "charAt(i)로 얻은 문자를 목표 문자와 비교합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String s=sc.next(); // s=\"banana\" 저장\n        char target=sc.next().charAt(0); // 목표 문자 'a' 저장\n        int count=0; // 발견 개수 초기값 0\n        for(int i=0;i<s.length();i++){ // 모든 인덱스 검사\n            if(s.charAt(i)==target) count++; // a가 세 번 나와 count:0→1→2→3\n        } // 전체 문자 검사 완료\n        System.out.println(count); // 3 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "s=\"banana\" 저장. 목표 문자 'a' 저장. 발견 개수 초기값 0. 예제 실행 결과는 s,target → banana,a, count → 3입니다. 확인할 조건: 대소문자 구분.",
    "trace": [
      [
        "입력",
        "s,target",
        "banana,a",
        "banana,a"
      ],
      [
        "검사",
        "count",
        "0→1→2→3",
        "3"
      ]
    ],
    "constraints": "공백 없는 영문 문자열, 목표 영문자 1개",
    "edgeCases": "대소문자 구분",
    "concept": "charAt, =="
  },
  {
    "id": "JAVA-070",
    "language": "java",
    "level": "기초 응용",
    "topic": "문자열 기초",
    "title": "문자열 뒤집기",
    "statement": "문자열의 문자를 역순으로 출력한다\n입력 조건: 영문 대소문자 문자열 1~100자. 출력 규격: 역순 문자열.",
    "input": "AbC",
    "output": "CbA",
    "hint": "문자열의 마지막 인덱스는 length()-1입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String s=sc.next(); // s=\"AbC\" 저장\n        StringBuilder reversed=new StringBuilder(); // 빈 결과 문자열 생성\n        for(int i=s.length()-1;i>=0;i--){ // 끝 인덱스 2에서 0까지 감소\n            reversed.append(s.charAt(i)); // 결과: \"C\"→\"Cb\"→\"CbA\"\n        } // i=-1이면 종료\n        System.out.println(reversed); // CbA 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "s=\"AbC\" 저장. 빈 결과 문자열 생성. 끝 인덱스 2에서 0까지 감소. 예제 실행 결과는 reversed → Cb, reversed → CbA입니다. 확인할 조건: 1글자.",
    "trace": [
      [
        "시작",
        "reversed",
        "\"\"",
        "빈 문자열"
      ],
      [
        "i=2",
        "reversed",
        "\"\"→\"C\"",
        "C"
      ],
      [
        "i=1",
        "reversed",
        "\"C\"→\"Cb\"",
        "Cb"
      ],
      [
        "i=0",
        "reversed",
        "\"Cb\"→\"CbA\"",
        "CbA"
      ]
    ],
    "constraints": "영문 대소문자 문자열 1~100자",
    "edgeCases": "1글자",
    "concept": "문자열 반복"
  },
  {
    "id": "JAVA-071",
    "language": "java",
    "level": "기초 응용",
    "topic": "Java 문자열·배열 API",
    "title": "문장 속 공백 개수",
    "statement": "한 줄 입력한 문장에 포함된 일반 공백 수를 출력한다\n입력 조건: 문장 최대 100자, 일반 공백 U+0020. 출력 규격: 공백 개수.",
    "input": " a b ",
    "output": "3",
    "hint": "공백 문자는 ' '이며, 앞뒤 공백도 개수에 포함합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String s=sc.nextLine(); // 앞뒤 공백까지 포함해 s=\" a b \" 저장\n        int spaces=0; // 공백 개수 초기값 0\n        for(int i=0;i<s.length();i++){ // 5글자를 모두 검사\n            if(s.charAt(i)==' ') spaces++; // 0,2,4번째 공백에서 0→1→2→3\n        } // 전체 문장 확인 완료\n        System.out.println(spaces); // 3 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "앞뒤 공백까지 포함해 s=\" a b \" 저장. 공백 개수 초기값 0. 5글자를 모두 검사. 예제 실행 결과는 s → 5글자, spaces → 3입니다. 확인할 조건: 앞뒤 공백.",
    "trace": [
      [
        "입력",
        "s",
        "\" a b \"",
        "5글자"
      ],
      [
        "공백",
        "spaces",
        "0→1→2→3",
        "3"
      ]
    ],
    "constraints": "문장 최대 100자, 일반 공백 U+0020",
    "edgeCases": "앞뒤 공백",
    "concept": "nextLine, charAt"
  },
  {
    "id": "JAVA-072",
    "language": "java",
    "level": "기초 응용",
    "topic": "Java 문자열·배열 API",
    "title": "문자열 양끝 공백 제거",
    "statement": "문장 앞뒤의 일반 공백을 제거하고 출력한다\n입력 조건: 길이≤100, ASCII 공백. 출력 규격: 양끝 공백 제거한 문자열.",
    "input": "  hello  ",
    "output": "hello",
    "hint": "입력 문자열 중 앞뒤의 일반 공백(U+0020)만 제거합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String s=sc.nextLine(); // 입력 앞뒤 공백 포함 \"  hello  \" 저장\n        String trimmed=s.replaceAll(\"^ +| +$\", \"\"); // 양끝 ASCII 공백만 제거 → \"hello\"\n        System.out.println(trimmed); // hello 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "입력 앞뒤 공백 포함 \"  hello  \" 저장. 양끝 ASCII 공백만 제거 → \"hello\". hello 출력. 예제 실행 결과는 s → 공백 포함, trimmed → hello입니다. 확인할 조건: 공백만 입력.",
    "trace": [
      [
        "입력",
        "s",
        "\"  hello  \"",
        "공백 포함"
      ],
      [
        "변환",
        "trimmed",
        "\"  hello  \"→\"hello\"",
        "hello"
      ]
    ],
    "constraints": "길이≤100, ASCII 공백",
    "edgeCases": "공백만 입력",
    "concept": "String.trim"
  },
  {
    "id": "JAVA-073",
    "language": "java",
    "level": "기초 응용",
    "topic": "Java 문자열·배열 API",
    "title": "접두어 일치 여부",
    "statement": "문자열이 주어진 접두어로 시작하는지 판단한다\n입력 조건: 공백 없는 문자열·접두어 2개. 출력 규격: YES 또는 NO.",
    "input": "spring springb",
    "output": "NO",
    "hint": "startsWith는 문자열 전체 접두어를 비교합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String s=sc.next(); // 대상 문자열 \"spring\" 입력\n        String prefix=sc.next(); // 접두어 후보 \"springb\" 입력\n        boolean starts=s.startsWith(prefix); // spring은 springb로 시작하지 않음 → false\n        System.out.println(starts?\"YES\":\"NO\"); // NO 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "대상 문자열 \"spring\" 입력. 접두어 후보 \"springb\" 입력. spring은 springb로 시작하지 않음 → false. 예제 실행 결과는 s,prefix → 2개, starts → NO입니다. 확인할 조건: 같은 길이.",
    "trace": [
      [
        "입력",
        "s,prefix",
        "spring,springb",
        "2개"
      ],
      [
        "검사",
        "starts",
        "false",
        "NO"
      ]
    ],
    "constraints": "공백 없는 문자열·접두어 2개",
    "edgeCases": "같은 길이",
    "concept": "startsWith"
  },
  {
    "id": "JAVA-074",
    "language": "java",
    "level": "기초 응용",
    "topic": "Java 문자열·배열 API",
    "title": "영문 대소문자 변환",
    "statement": "영문 문자열을 전부 대문자와 전부 소문자로 출력한다\n입력 조건: 공백 없는 영문 문자열. 출력 규격: 대문자 한 줄, 소문자 한 줄.",
    "input": "aBcD",
    "output": "ABCD\nabcd",
    "hint": "영문 대소문자 변환 시 원본 문자열은 바뀌지 않습니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String s=sc.next(); // s=\"aBcD\" 저장\n        String upper=s.toUpperCase(Locale.ROOT); // \"aBcD\"→\"ABCD\"\n        String lower=s.toLowerCase(Locale.ROOT); // \"aBcD\"→\"abcd\"\n        System.out.println(upper); // ABCD 출력\n        System.out.println(lower); // abcd 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "s=\"aBcD\" 저장. \"aBcD\"→\"ABCD\". \"aBcD\"→\"abcd\". 예제 실행 결과는 upper → ABCD, lower → abcd입니다. 확인할 조건: 혼합 대소문자.",
    "trace": [
      [
        "입력",
        "s",
        "aBcD",
        "aBcD"
      ],
      [
        "대문자",
        "upper",
        "ABCD",
        "ABCD"
      ],
      [
        "소문자",
        "lower",
        "abcd",
        "abcd"
      ]
    ],
    "constraints": "공백 없는 영문 문자열",
    "edgeCases": "혼합 대소문자",
    "concept": "toUpperCase,toLowerCase"
  },
  {
    "id": "JAVA-075",
    "language": "java",
    "level": "기초 응용",
    "topic": "Java 문자열·배열 API",
    "title": "두 문자열 내용 비교",
    "statement": "문자열 두 개의 내용이 같으면 SAME, 아니면 DIFFERENT를 출력한다\n입력 조건: 공백 없는 문자열 2개. 출력 규격: SAME 또는 DIFFERENT.",
    "input": "java java",
    "output": "SAME",
    "hint": "문자열 내용 비교는 ==가 아니라 equals를 사용합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String a=sc.next(); // 첫 문자열 a=\"java\"\n        String b=sc.next(); // 둘째 문자열 b=\"java\"\n        boolean same=a.equals(b); // 두 문자열의 내용이 같으므로 true\n        System.out.println(same?\"SAME\":\"DIFFERENT\"); // SAME 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "첫 문자열 a=\"java\". 둘째 문자열 b=\"java\". 두 문자열의 내용이 같으므로 true. 예제 실행 결과는 a,b → 2개, same → SAME입니다. 확인할 조건: 대소문자 다름.",
    "trace": [
      [
        "입력",
        "a,b",
        "java,java",
        "2개"
      ],
      [
        "내용 비교",
        "same",
        "true",
        "SAME"
      ]
    ],
    "constraints": "공백 없는 문자열 2개",
    "edgeCases": "대소문자 다름",
    "concept": "equals"
  },
  {
    "id": "JAVA-076",
    "language": "java",
    "level": "기초 응용",
    "topic": "Java 문자열·배열 API",
    "title": "문자열 구간 추출",
    "statement": "문자열에서 시작 인덱스 이상 종료 인덱스 미만 부분을 출력한다\n입력 조건: 문자열 s, 0≤start<end≤s.length(). 출력 규격: 추출 문자열.",
    "input": "abcdef 2 5",
    "output": "cde",
    "hint": "substring(start,end)는 end 위치를 포함하지 않습니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String s=sc.next(); // s=\"abcdef\" 입력\n        int start=sc.nextInt(); // 시작 인덱스 2 저장\n        int end=sc.nextInt(); // 종료 인덱스 5 저장(포함 안 함)\n        String part=s.substring(start,end); // 2,3,4 위치 → \"cde\"\n        System.out.println(part); // cde 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "s=\"abcdef\" 입력. 시작 인덱스 2 저장. 종료 인덱스 5 저장(포함 안 함). 예제 실행 결과는 start,end → 2,5, part → cde입니다. 확인할 조건: 끝 인덱스 제외.",
    "trace": [
      [
        "입력",
        "start,end",
        "2,5",
        "2,5"
      ],
      [
        "추출",
        "part",
        "s[2]~s[4]",
        "cde"
      ]
    ],
    "constraints": "문자열 s, 0≤start<end≤s.length()",
    "edgeCases": "끝 인덱스 제외",
    "concept": "substring"
  },
  {
    "id": "JAVA-077",
    "language": "java",
    "level": "기초 응용",
    "topic": "Java 문자열·배열 API",
    "title": "문장을 단어로 나누기",
    "statement": "영문 단어가 한 칸 공백으로 구분된 문장의 단어를 각 줄에 출력한다\n입력 조건: 길이 1~100, 단어 사이 공백 1개. 출력 규격: 각 단어를 줄마다.",
    "input": "red green blue",
    "output": "red\ngreen\nblue",
    "hint": "문제에서는 단어 사이 공백이 정확히 한 칸입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String s=sc.nextLine(); // 문장 전체 \"red green blue\" 입력\n        String[] words=s.split(\" \"); // 공백 한 칸을 기준으로 [red,green,blue] 나눔\n        for(String word:words){ // 각 단어를 순서대로 방문\n            System.out.println(word); // 단어를 한 줄에 하나씩 출력\n        } // 전체 단어 출력 완료\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "문장 전체 \"red green blue\" 입력. 공백 한 칸을 기준으로 [red,green,blue] 나눔. 각 단어를 순서대로 방문. 예제 실행 결과는 words → 3개, word → 3줄입니다. 확인할 조건: 단어 1개.",
    "trace": [
      [
        "입력",
        "s",
        "red green blue",
        "문장"
      ],
      [
        "분할",
        "words",
        "[red,green,blue]",
        "3개"
      ],
      [
        "반복",
        "word",
        "red→green→blue",
        "3줄"
      ]
    ],
    "constraints": "길이 1~100, 단어 사이 공백 1개",
    "edgeCases": "단어 1개",
    "concept": "split"
  },
  {
    "id": "JAVA-078",
    "language": "java",
    "level": "기초 응용",
    "topic": "Java 문자열·배열 API",
    "title": "문자 치환",
    "statement": "입력 문자열에서 a를 모두 @로 치환한다\n입력 조건: 공백 없는 영문 문자열 1~100자. 출력 규격: 치환 결과.",
    "input": "banana",
    "output": "b@n@n@",
    "hint": "replace는 모든 일치하는 문자를 바꾼 새 문자열을 반환합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String s=sc.next(); // s=\"banana\" 저장\n        String result=s.replace('a','@'); // \"banana\"→\"b@n@n@\"\n        System.out.println(result); // b@n@n@ 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "s=\"banana\" 저장. \"banana\"→\"b@n@n@\". b@n@n@ 출력. 예제 실행 결과는 s → banana, result → b@n@n@입니다. 확인할 조건: a 없음.",
    "trace": [
      [
        "입력",
        "s",
        "banana",
        "banana"
      ],
      [
        "변환",
        "result",
        "b@n@n@",
        "b@n@n@"
      ]
    ],
    "constraints": "공백 없는 영문 문자열 1~100자",
    "edgeCases": "a 없음",
    "concept": "String.replace"
  },
  {
    "id": "JAVA-079",
    "language": "java",
    "level": "기초 응용",
    "topic": "Java 문자열·배열 API",
    "title": "정수 배열 정렬",
    "statement": "정수 N개를 오름차순 정렬해 출력한다\n입력 조건: 1≤N≤100, 정수 N개. 출력 규격: 오름차순 원소.",
    "input": "5 9 -2 4 4 1",
    "output": "-2 1 4 4 9",
    "hint": "Arrays.sort(int[])는 오름차순 정렬합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 배열에 저장할 숫자 개수를 입력받음\n        int[] arr=new int[n]; // n개 크기의 정수 배열을 생성\n        for(int i=0;i<n;i++){ // i를 0부터 n-1까지 증가\n            arr[i]=sc.nextInt(); // i번째 위치에 다음 정수를 저장\n        } // 전체 배열 입력을 완료\n        Arrays.sort(arr); // 배열 [9,-2,4,4,1]→[-2,1,4,4,9] 정렬\n        StringJoiner out=new StringJoiner(\" \"); // 공백 구분 출력 준비\n        for(int x:arr) out.add(String.valueOf(x)); // 정렬된 원소를 순서대로 덧붙임\n        System.out.println(out); // -2 1 4 4 9 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "배열에 저장할 숫자 개수를 입력받음. n개 크기의 정수 배열을 생성. i를 0부터 n-1까지 증가. 예제 실행 결과는 arr → 5개, arr → 오름차순입니다. 확인할 조건: 동일값·음수.",
    "trace": [
      [
        "입력",
        "arr",
        "[9,-2,4,4,1]",
        "5개"
      ],
      [
        "정렬",
        "arr",
        "[-2,1,4,4,9]",
        "오름차순"
      ]
    ],
    "constraints": "1≤N≤100, 정수 N개",
    "edgeCases": "동일값·음수",
    "concept": "Arrays.sort"
  },
  {
    "id": "JAVA-080",
    "language": "java",
    "level": "기초 응용",
    "topic": "Java 문자열·배열 API",
    "title": "배열 일부 복사",
    "statement": "원본 배열 앞에서 k개를 복사하여 출력한다\n입력 조건: 1≤k≤N≤100, 정수 N개. 출력 규격: 복사한 k개 원소.",
    "input": "5 10 20 30 40 50 3",
    "output": "10 20 30",
    "hint": "Arrays.copyOf(원본,k)는 처음 k개를 새 배열로 복사합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 배열에 저장할 숫자 개수를 입력받음\n        int[] arr=new int[n]; // n개 크기의 정수 배열을 생성\n        for(int i=0;i<n;i++){ // i를 0부터 n-1까지 증가\n            arr[i]=sc.nextInt(); // i번째 위치에 다음 정수를 저장\n        } // 전체 배열 입력을 완료\n        int k=sc.nextInt(); // 복사할 원소 개수 k=3\n        int[] copied=Arrays.copyOf(arr,k); // 앞 3개 [10,20,30]을 새 배열에 복사\n        StringJoiner out=new StringJoiner(\" \"); // 출력 준비\n        for(int x:copied) out.add(String.valueOf(x)); // 복사된 원소 차례로 추가\n        System.out.println(out); // 10 20 30 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "배열에 저장할 숫자 개수를 입력받음. n개 크기의 정수 배열을 생성. i를 0부터 n-1까지 증가. 예제 실행 결과는 arr,k → 5개,3, copied → 3개입니다. 확인할 조건: k=N.",
    "trace": [
      [
        "입력",
        "arr,k",
        "[10,20,30,40,50], 3",
        "5개,3"
      ],
      [
        "복사",
        "copied",
        "[10,20,30]",
        "3개"
      ]
    ],
    "constraints": "1≤k≤N≤100, 정수 N개",
    "edgeCases": "k=N",
    "concept": "Arrays.copyOf"
  },
  {
    "id": "JAVA-081",
    "language": "java",
    "level": "기초 응용",
    "topic": "메서드",
    "title": "두 수의 합 메서드",
    "statement": "두 정수의 합을 반환하는 add 메서드를 구현해 사용한다\n입력 조건: 절댓값 10000 이하 두 정수. 출력 규격: 합.",
    "input": "3 8",
    "output": "11",
    "hint": "static 메서드가 반환한 정수를 변수에 저장합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static int add(int x,int y){ // 두 수를 받아 합을 돌려줄 메서드\n        return x+y; // x=3, y=8에서 3+8=11 반환\n    } // add 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int a=sc.nextInt(); // a=3 입력\n        int b=sc.nextInt(); // b=8 입력\n        int answer=add(a,b); // add(3,8) 반환값 11을 answer에 저장\n        System.out.println(answer); // 11 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "두 수를 받아 합을 돌려줄 메서드. x=3, y=8에서 3+8=11 반환. add 종료. 예제 실행 결과는 x,y → 3,8, answer → 11입니다. 확인할 조건: 0·음수.",
    "trace": [
      [
        "입력",
        "a,b",
        "3,8",
        "3,8"
      ],
      [
        "호출",
        "x,y",
        "3,8",
        "3,8"
      ],
      [
        "반환",
        "answer",
        "3+8",
        "11"
      ]
    ],
    "constraints": "절댓값 10000 이하 두 정수",
    "edgeCases": "0·음수",
    "concept": "static 메서드·return"
  },
  {
    "id": "JAVA-082",
    "language": "java",
    "level": "기초 응용",
    "topic": "메서드",
    "title": "두 수의 최댓값 메서드",
    "statement": "두 정수 중 큰 값을 반환하는 maxOf 메서드를 작성한다\n입력 조건: 정수 2개. 출력 규격: 큰 수.",
    "input": "9 4",
    "output": "9",
    "hint": "메서드 매개변수 x,y에 입력값을 전달하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static int maxOf(int x,int y){ // 정수 두 개 중 큰 값 반환\n        return x>=y?x:y; // 9>=4 참이므로 x=9 반환\n    } // maxOf 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int a=sc.nextInt(); // a=9 입력\n        int b=sc.nextInt(); // b=4 입력\n        int answer=maxOf(a,b); // maxOf(9,4) → 9\n        System.out.println(answer); // 9 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "정수 두 개 중 큰 값 반환. 9>=4 참이므로 x=9 반환. maxOf 종료. 예제 실행 결과는 x,y → 9,4, answer → 9입니다. 확인할 조건: 같은 값.",
    "trace": [
      [
        "입력",
        "a,b",
        "9,4",
        "9,4"
      ],
      [
        "호출",
        "x,y",
        "9,4",
        "9,4"
      ],
      [
        "반환",
        "answer",
        "9>=4",
        "9"
      ]
    ],
    "constraints": "정수 2개",
    "edgeCases": "같은 값",
    "concept": "메서드와 if"
  },
  {
    "id": "JAVA-083",
    "language": "java",
    "level": "기초 응용",
    "topic": "메서드",
    "title": "짝수 판별 메서드",
    "statement": "정수의 짝수 여부를 반환하는 isEven 메서드를 작성한다\n입력 조건: 정수 1개. 출력 규격: EVEN 또는 ODD.",
    "input": "-8",
    "output": "EVEN",
    "hint": "boolean 반환형은 true 또는 false를 저장합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static boolean isEven(int value){ // 정수 짝수 여부를 반환\n        return value%2==0; // -8%2=0 → true 반환\n    } // isEven 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=-8 입력\n        boolean even=isEven(n); // isEven(-8)은 true 반환\n        System.out.println(even?\"EVEN\":\"ODD\"); // EVEN 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "정수 짝수 여부를 반환. -8%2=0 → true 반환. isEven 종료. 예제 실행 결과는 value → -8, even → EVEN입니다. 확인할 조건: 0·음수.",
    "trace": [
      [
        "입력",
        "n",
        "-8",
        "-8"
      ],
      [
        "호출",
        "value",
        "-8",
        "-8"
      ],
      [
        "반환",
        "even",
        "true",
        "EVEN"
      ]
    ],
    "constraints": "정수 1개",
    "edgeCases": "0·음수",
    "concept": "boolean 반환값"
  },
  {
    "id": "JAVA-084",
    "language": "java",
    "level": "기초 응용",
    "topic": "메서드",
    "title": "1부터 N까지 합 메서드",
    "statement": "1부터 N까지의 합을 계산하는 sumTo 메서드를 작성한다\n입력 조건: 1≤N≤1000. 출력 규격: 합.",
    "input": "4",
    "output": "10",
    "hint": "매개변수로 입력값을 전달하고 반환된 결과를 출력합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static long sumTo(int n){ // 1부터 n까지 합을 구하는 메서드\n        long sum=0; // 지역 변수 합계 초기값 0\n        for(int i=1;i<=n;i++){ // i=1,2,3,4 증가\n            sum+=i; // sum:0→1→3→6→10\n        } // i=5이면 반복 종료\n        return sum; // 계산 결과 10 반환\n    } // sumTo 메서드 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=4 입력\n        long result=sumTo(n); // sumTo(4) → 10 반환\n        System.out.println(result); // 10 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "1부터 n까지 합을 구하는 메서드. 지역 변수 합계 초기값 0. i=1,2,3,4 증가. 예제 실행 결과는 sum → 10, result → 10입니다. 확인할 조건: N=1.",
    "trace": [
      [
        "입력",
        "n",
        "4",
        "4"
      ],
      [
        "합산",
        "sum",
        "0→1→3→6→10",
        "10"
      ],
      [
        "반환",
        "result",
        "10",
        "10"
      ]
    ],
    "constraints": "1≤N≤1000",
    "edgeCases": "N=1",
    "concept": "메서드 안 반복"
  },
  {
    "id": "JAVA-085",
    "language": "java",
    "level": "기초 응용",
    "topic": "메서드",
    "title": "팩토리얼 메서드",
    "statement": "0부터 12까지의 N을 받아 팩토리얼을 반환하는 factorial 메서드를 구현한다\n입력 조건: 0≤N≤12. 출력 규격: N!.",
    "input": "5",
    "output": "120",
    "hint": "곱의 초깃값은 1입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static long factorial(int n){ // 팩토리얼 계산 메서드\n        long result=1; // 0!을 고려해 1로 시작\n        for(int i=2;i<=n;i++){ // 2~n까지 곱함\n            result*=i; // n=5일 때 1→2→6→24→120\n        } // 곱셈 종료\n        return result; // 계산된 곱 반환\n    } // factorial 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // n=5 입력\n        long result=factorial(n); // factorial(5) → 120 반환\n        System.out.println(result); // 120 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "팩토리얼 계산 메서드. 0!을 고려해 1로 시작. 2~n까지 곱함. 예제 실행 결과는 result → 120, result → 120입니다. 확인할 조건: 0!=1.",
    "trace": [
      [
        "입력",
        "n",
        "5",
        "5"
      ],
      [
        "계산",
        "result",
        "1→2→6→24→120",
        "120"
      ],
      [
        "반환",
        "result",
        "120",
        "120"
      ]
    ],
    "constraints": "0≤N≤12",
    "edgeCases": "0!=1",
    "concept": "메서드와 반복"
  },
  {
    "id": "JAVA-086",
    "language": "java",
    "level": "종합 활용",
    "topic": "메서드",
    "title": "특정 문자 개수 메서드",
    "statement": "문자열과 문자를 받아 등장 횟수를 반환하는 countChar 메서드를 작성한다\n입력 조건: 영문 문자열·영문자. 출력 규격: 개수.",
    "input": "banana a",
    "output": "3",
    "hint": "String과 char 자료형 매개변수를 함께 사용합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static int countChar(String s,char target){ // 문자 등장 횟수 메서드\n        int count=0; // 결과 초기값 0\n        for(int i=0;i<s.length();i++){ // 문자열 전체 검사\n            if(s.charAt(i)==target) count++; // 'a'마다 0→1→2→3 증가\n        } // 모든 문자 확인\n        return count; // 누적 개수 3 반환\n    } // countChar 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String s=sc.next(); // 문자열 \"banana\" 입력\n        char target=sc.next().charAt(0); // 문자 'a' 입력\n        int result=countChar(s,target); // countChar(\"banana\",'a') → 3\n        System.out.println(result); // 3 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "문자 등장 횟수 메서드. 결과 초기값 0. 문자열 전체 검사. 예제 실행 결과는 count → 3, result → 3입니다. 확인할 조건: 대소문자 구분.",
    "trace": [
      [
        "입력",
        "s,target",
        "banana,a",
        "banana,a"
      ],
      [
        "반복",
        "count",
        "0→1→2→3",
        "3"
      ],
      [
        "반환",
        "result",
        "3",
        "3"
      ]
    ],
    "constraints": "영문 문자열·영문자",
    "edgeCases": "대소문자 구분",
    "concept": "String과 메서드"
  },
  {
    "id": "JAVA-087",
    "language": "java",
    "level": "종합 활용",
    "topic": "메서드",
    "title": "배열 합계 메서드",
    "statement": "int[]를 인자로 받아 모든 원소의 합을 반환하는 메서드를 구현한다\n입력 조건: 1≤N≤100, 각 수 절댓값≤1000. 출력 규격: 합.",
    "input": "3 -2 5 7",
    "output": "10",
    "hint": "배열 참조를 매개변수로 받아 내부에서 반복하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static long sumArray(int[] values){ // 배열을 매개변수로 받음\n        long sum=0; // 합 초기값 0\n        for(int value:values){ // 각 원소 -2,5,7 방문\n            sum+=value; // sum:0→-2→3→10\n        } // 배열 모두 순회 완료\n        return sum; // 최종 합계 10 반환\n    } // sumArray 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 배열에 저장할 숫자 개수를 입력받음\n        int[] arr=new int[n]; // n개 크기의 정수 배열을 생성\n        for(int i=0;i<n;i++){ // i를 0부터 n-1까지 증가\n            arr[i]=sc.nextInt(); // i번째 위치에 다음 정수를 저장\n        } // 전체 배열 입력을 완료\n        long result=sumArray(arr); // [-2,5,7] 합인 10을 반환받음\n        System.out.println(result); // 10 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "배열을 매개변수로 받음. 합 초기값 0. 각 원소 -2,5,7 방문. 예제 실행 결과는 sum → 10, result → 10입니다. 확인할 조건: 음수 합.",
    "trace": [
      [
        "입력",
        "arr",
        "[-2,5,7]",
        "배열"
      ],
      [
        "합산",
        "sum",
        "0→-2→3→10",
        "10"
      ],
      [
        "반환",
        "result",
        "10",
        "10"
      ]
    ],
    "constraints": "1≤N≤100, 각 수 절댓값≤1000",
    "edgeCases": "음수 합",
    "concept": "배열 인자와 return"
  },
  {
    "id": "JAVA-088",
    "language": "java",
    "level": "종합 활용",
    "topic": "메서드",
    "title": "배열 최댓값 메서드",
    "statement": "int[]를 인자로 받아 배열의 최댓값을 반환하는 메서드를 구현한다\n입력 조건: 1≤N≤100, 정수 N개. 출력 규격: 최댓값.",
    "input": "4 -4 -2 -7 -5",
    "output": "-2",
    "hint": "배열 첫 원소로 최대값을 초기화해야 음수만 있어도 정확합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static int maxArray(int[] values){ // 배열에서 최대값 반환\n        int max=values[0]; // 첫 원소 -4로 시작\n        for(int value:values){ // 모든 원소 비교\n            if(value>max) max=value; // -2를 만나 max:-4→-2\n        } // 비교 종료\n        return max; // max=-2 반환\n    } // maxArray 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 배열에 저장할 숫자 개수를 입력받음\n        int[] arr=new int[n]; // n개 크기의 정수 배열을 생성\n        for(int i=0;i<n;i++){ // i를 0부터 n-1까지 증가\n            arr[i]=sc.nextInt(); // i번째 위치에 다음 정수를 저장\n        } // 전체 배열 입력을 완료\n        int result=maxArray(arr); // 가장 큰 값 -2 반환\n        System.out.println(result); // -2 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "배열에서 최대값 반환. 첫 원소 -4로 시작. 모든 원소 비교. 예제 실행 결과는 max → -4, max → -2입니다. 확인할 조건: 모두 음수.",
    "trace": [
      [
        "입력",
        "arr",
        "[-4,-2,-7,-5]",
        "배열"
      ],
      [
        "초기",
        "max",
        "-4",
        "-4"
      ],
      [
        "갱신",
        "max",
        "-4→-2",
        "-2"
      ]
    ],
    "constraints": "1≤N≤100, 정수 N개",
    "edgeCases": "모두 음수",
    "concept": "반복, 메서드"
  },
  {
    "id": "JAVA-089",
    "language": "java",
    "level": "종합 활용",
    "topic": "메서드",
    "title": "최대공약수 메서드",
    "statement": "두 자연수의 최대공약수를 반환하는 gcd 메서드를 구현한다\n입력 조건: 1≤a,b≤100000. 출력 규격: 최대공약수.",
    "input": "18 24",
    "output": "6",
    "hint": "유클리드 호제법은 나머지가 0이 될 때 끝납니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static int gcd(int a,int b){ // 최대공약수를 구할 두 수 입력\n        while(b!=0){ // 나머지가 0일 때까지 반복\n            int r=a%b; // 나머지는 18→6→0 순서\n            a=b; // a:18→24→18→6\n            b=r; // b:24→18→6→0\n        } // b=0에서 종료\n        return a; // 최종 a=6 반환\n    } // gcd 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int a=sc.nextInt(); // a=18 입력\n        int b=sc.nextInt(); // b=24 입력\n        int result=gcd(a,b); // gcd(18,24) → 6\n        System.out.println(result); // 6 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "최대공약수를 구할 두 수 입력. 나머지가 0일 때까지 반복. 나머지는 18→6→0 순서. 예제 실행 결과는 a,b → 18,6, a,b → 6,0입니다. 확인할 조건: a=b.",
    "trace": [
      [
        "호출",
        "a,b",
        "18,24",
        "18,24"
      ],
      [
        "1회",
        "a,b",
        "24,18",
        "24,18"
      ],
      [
        "2회",
        "a,b",
        "18,6",
        "18,6"
      ],
      [
        "3회",
        "a,b",
        "6,0",
        "6,0"
      ]
    ],
    "constraints": "1≤a,b≤100000",
    "edgeCases": "a=b",
    "concept": "유클리드 호제법과 메서드"
  },
  {
    "id": "JAVA-090",
    "language": "java",
    "level": "종합 활용",
    "topic": "메서드",
    "title": "값 변경과 반환값 비교",
    "statement": "매개변수 int를 1 증가시키는 메서드와 반환값 대입 결과를 비교한다\n입력 조건: 정수 n(절댓값≤10000). 출력 규격: 원래 n과 반환값 대입 후 n을 각각 출력.",
    "input": "7",
    "output": "7\n8",
    "hint": "기본형 int는 매개변수에 값이 복사됩니다. 반환값을 대입해야 호출자 변수가 달라집니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static int increase(int value){ // 정수 값 전달 매개변수\n        value++; // 메서드 안에서 value:7→8, 호출자의 변수에는 영향 없음\n        return value; // 변경된 8을 반환\n    } // increase 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 입력 7 → main의 n=7\n        increase(n); // 메서드 내부 value만 7→8, main의 n은 여전히 7\n        System.out.println(n); // 첫 줄에 변경되지 않은 7 출력\n        n=increase(n); // 반환값 8을 다시 n에 대입 → n:7→8\n        System.out.println(n); // 둘째 줄에 8 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "정수 값 전달 매개변수. 메서드 안에서 value:7→8, 호출자의 변수에는 영향 없음. 변경된 8을 반환. 예제 실행 결과는 value → return=8, main.n → 8입니다. 확인할 조건: 원본 변화 오해.",
    "trace": [
      [
        "입력",
        "main.n",
        "7",
        "7"
      ],
      [
        "첫 호출",
        "value",
        "7→8",
        "main.n=7"
      ],
      [
        "재호출",
        "value",
        "7→8",
        "return=8"
      ],
      [
        "재대입",
        "main.n",
        "7→8",
        "8"
      ]
    ],
    "constraints": "정수 n(절댓값≤10000)",
    "edgeCases": "원본 변화 오해",
    "concept": "기본형 값 전달"
  },
  {
    "id": "JAVA-091",
    "language": "java",
    "level": "종합 활용",
    "topic": "클래스·객체·컬렉션",
    "title": "학생 이름과 점수 객체",
    "statement": "Student 클래스에 name과 score 필드를 정의하고 한 객체의 값을 출력한다\n입력 조건: 이름 한 단어, 0~100 점수. 출력 규격: 이름과 점수.",
    "input": "Mina 88",
    "output": "Mina 88",
    "hint": "클래스는 자료형, 객체는 실제 생성한 인스턴스입니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    static class Student { // 학생 데이터를 표현하는 중첩 클래스\n        String name; // 학생 이름 필드, 기본값 null\n        int score; // 점수 필드, 기본값 0\n    } // Student 클래스 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String name=sc.next(); // 이름 Mina 입력\n        int score=sc.nextInt(); // 점수 88 입력\n        Student student=new Student(); // Student 객체 생성\n        student.name=name; // 객체 필드 name: null→Mina\n        student.score=score; // 객체 필드 score: 0→88\n        System.out.println(student.name + \" \" + student.score); // Mina 88 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "학생 데이터를 표현하는 중첩 클래스. 학생 이름 필드, 기본값 null. 점수 필드, 기본값 0. 예제 실행 결과는 student → 초기 상태, student → Mina 88입니다. 확인할 조건: 필드 접근.",
    "trace": [
      [
        "입력",
        "name,score",
        "Mina,88",
        "Mina,88"
      ],
      [
        "생성",
        "student",
        "name=null, score=0",
        "초기 상태"
      ],
      [
        "대입",
        "student",
        "name=Mina,score=88",
        "Mina 88"
      ]
    ],
    "constraints": "이름 한 단어, 0~100 점수",
    "edgeCases": "필드 접근",
    "concept": "클래스, 객체, 필드",
    "advanced": true
  },
  {
    "id": "JAVA-092",
    "language": "java",
    "level": "종합 활용",
    "topic": "클래스·객체·컬렉션",
    "title": "학생 생성자 정의",
    "statement": "name,score를 초기화하는 Student 생성자를 작성하고 필드를 출력한다\n입력 조건: 이름, 0~100 점수. 출력 규격: 객체 필드 출력.",
    "input": "Mina 90",
    "output": "Mina 90",
    "hint": "생성자 매개변수의 값으로 필드를 초기화하세요.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    static class Student { // 학생 객체용 클래스\n        String name; // 이름 필드\n        int score; // 점수 필드\n        Student(String name,int score){ // 생성자 인수 두 개\n            this.name=name; // 필드 name: null→Mina\n            this.score=score; // 필드 score: 0→90\n        } // Student 생성자 종료\n    } // Student 클래스 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String name=sc.next(); // 이름 Mina 입력\n        int score=sc.nextInt(); // 점수 90 입력\n        Student student=new Student(name,score); // 생성자에 두 값 전달\n        System.out.println(student.name + \" \" + student.score); // Mina 90 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "학생 객체용 클래스. 이름 필드. 점수 필드. 예제 실행 결과는 this.name → Mina, this.score → 90입니다. 확인할 조건: 생성자 이름.",
    "trace": [
      [
        "입력",
        "name,score",
        "Mina,90",
        "Mina,90"
      ],
      [
        "생성자",
        "this.name",
        "null→Mina",
        "Mina"
      ],
      [
        "생성자",
        "this.score",
        "0→90",
        "90"
      ]
    ],
    "constraints": "이름, 0~100 점수",
    "edgeCases": "생성자 이름",
    "concept": "생성자, this",
    "advanced": true
  },
  {
    "id": "JAVA-093",
    "language": "java",
    "level": "종합 활용",
    "topic": "클래스·객체·컬렉션",
    "title": "객체 메서드로 점수 변경",
    "statement": "Student 객체에 점수를 올리는 addScore 메서드를 만들고 변경된 점수를 출력한다\n입력 조건: 0≤초기점수,증가점수≤100, 합≤100. 출력 규격: 변경 후 점수.",
    "input": "70 15",
    "output": "85",
    "hint": "객체의 메서드는 필드의 값을 변경할 수 있습니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    static class Student { // 점수를 관리하는 Student 클래스\n        int score; // 학생 점수 필드\n        Student(int score){ this.score=score; } // 생성 시 점수 70 저장\n        void addScore(int point){ // 점수를 더하는 인스턴스 메서드\n            score+=point; // score:70→85\n        } // addScore 종료\n    } // Student 클래스 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int score=sc.nextInt(); // 시작 점수 70\n        int increase=sc.nextInt(); // 증가할 점수 15\n        Student student=new Student(score); // score=70인 객체 생성\n        student.addScore(increase); // score:70→85\n        System.out.println(student.score); // 85 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "점수를 관리하는 Student 클래스. 학생 점수 필드. 생성 시 점수 70 저장. 예제 실행 결과는 student.score → 70, student.score → 85입니다. 확인할 조건: 초기 점수.",
    "trace": [
      [
        "입력",
        "score,increase",
        "70,15",
        "70,15"
      ],
      [
        "생성자",
        "student.score",
        "0→70",
        "70"
      ],
      [
        "메서드",
        "student.score",
        "70→85",
        "85"
      ]
    ],
    "constraints": "0≤초기점수,증가점수≤100, 합≤100",
    "edgeCases": "초기 점수",
    "concept": "인스턴스 메서드",
    "advanced": true
  },
  {
    "id": "JAVA-094",
    "language": "java",
    "level": "종합 활용",
    "topic": "클래스·객체·컬렉션",
    "title": "private 필드와 getter",
    "statement": "학생 점수를 private으로 관리하고 getScore 메서드를 통해 출력한다\n입력 조건: 이름과 점수. 출력 규격: 점수.",
    "input": "Mina 77",
    "output": "77",
    "hint": "private 필드는 외부에서 직접 조회할 수 없어 getter를 사용합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    static class Student { // 정보를 숨기는 클래스\n        private String name; // 클래스 외부에서 직접 접근 불가능한 이름\n        private int score; // private 점수 필드\n        Student(String name,int score){ // 생성자 선언\n            this.name=name; // name=Mina로 초기화\n            this.score=score; // score=77로 초기화\n        } // 생성자 종료\n        int getScore(){ return score; } // private 필드 값을 반환\n    } // Student 클래스 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        String name=sc.next(); // 이름 Mina 입력\n        int score=sc.nextInt(); // 점수 77 입력\n        Student student=new Student(name,score); // 필드에 값 저장\n        System.out.println(student.getScore()); // getter가 반환한 77 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "정보를 숨기는 클래스. 클래스 외부에서 직접 접근 불가능한 이름. private 점수 필드. 예제 실행 결과는 student.score → 77, getScore() → 77입니다. 확인할 조건: 필드 직접 접근 금지.",
    "trace": [
      [
        "입력",
        "name,score",
        "Mina,77",
        "Mina,77"
      ],
      [
        "생성",
        "student.score",
        "0→77",
        "77"
      ],
      [
        "조회",
        "getScore()",
        "77 반환",
        "77"
      ]
    ],
    "constraints": "이름과 점수",
    "edgeCases": "필드 직접 접근 금지",
    "concept": "캡슐화, getter",
    "advanced": true
  },
  {
    "id": "JAVA-095",
    "language": "java",
    "level": "종합 활용",
    "topic": "클래스·객체·컬렉션",
    "title": "생성한 객체 수 세기",
    "statement": "Student 객체를 N개 만들고 static count를 사용해 생성 개수를 출력한다\n입력 조건: 1≤N≤20. 출력 규격: 객체 개수.",
    "input": "3",
    "output": "3",
    "hint": "static 필드는 객체 각각이 아닌 클래스 전체가 공유합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    static class Student { // 객체 생성을 기록할 클래스\n        static int count=0; // 객체들이 공유하는 count의 초기값 0\n        Student(){ count++; } // 생성자가 실행될 때 count를 하나 증가\n    } // Student 클래스 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 생성할 객체 수 n=3\n        for(int i=0;i<n;i++){ // i=0,1,2 순서로 실행\n            new Student(); // 새 객체 생성 때마다 static count 증가\n        } // 3회 생성 완료\n        System.out.println(Student.count); // count=3 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "객체 생성을 기록할 클래스. 객체들이 공유하는 count의 초기값 0. 생성자가 실행될 때 count를 하나 증가. 예제 실행 결과는 Student.count → 2, Student.count → 3입니다. 확인할 조건: 인스턴스 vs static.",
    "trace": [
      [
        "초기",
        "Student.count",
        "0",
        "0"
      ],
      [
        "첫 생성",
        "Student.count",
        "0→1",
        "1"
      ],
      [
        "둘째 생성",
        "Student.count",
        "1→2",
        "2"
      ],
      [
        "셋째 생성",
        "Student.count",
        "2→3",
        "3"
      ]
    ],
    "constraints": "1≤N≤20",
    "edgeCases": "인스턴스 vs static",
    "concept": "static 필드, 생성자",
    "advanced": true
  },
  {
    "id": "JAVA-096",
    "language": "java",
    "level": "종합 활용",
    "topic": "클래스·객체·컬렉션",
    "title": "ArrayList에 점수 저장",
    "statement": "N개의 점수를 ArrayList<Integer>에 저장하고 순서대로 출력한다\n입력 조건: 1≤N≤30, 0~100 점수. 출력 규격: 점수 목록.",
    "input": "3 80 90 70",
    "output": "80 90 70",
    "hint": "ArrayList.add()는 리스트 맨 뒤에 값을 추가합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 점수 개수 n=3\n        ArrayList<Integer> scores=new ArrayList<>(); // 비어 있는 정수 리스트\n        for(int i=0;i<n;i++){ // 3개의 점수를 읽음\n            scores.add(sc.nextInt()); // scores:[]→[80]→[80,90]→[80,90,70]\n        } // 점수 저장 완료\n        StringJoiner out=new StringJoiner(\" \"); // 출력용 문자열 연결 객체\n        for(int score:scores) out.add(String.valueOf(score)); // 저장 순서대로 점수를 연결\n        System.out.println(out); // 80 90 70 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "점수 개수 n=3. 비어 있는 정수 리스트. 3개의 점수를 읽음. 예제 실행 결과는 scores → 2개, scores → 3개입니다. 확인할 조건: 인덱스 범위.",
    "trace": [
      [
        "초기",
        "scores",
        "[]",
        "빈 목록"
      ],
      [
        "i=0",
        "scores",
        "[]→[80]",
        "1개"
      ],
      [
        "i=1",
        "scores",
        "[80]→[80,90]",
        "2개"
      ],
      [
        "i=2",
        "scores",
        "[80,90]→[80,90,70]",
        "3개"
      ]
    ],
    "constraints": "1≤N≤30, 0~100 점수",
    "edgeCases": "인덱스 범위",
    "concept": "ArrayList.add,get",
    "advanced": true
  },
  {
    "id": "JAVA-097",
    "language": "java",
    "level": "종합 활용",
    "topic": "클래스·객체·컬렉션",
    "title": "ArrayList 합계 계산",
    "statement": "정수 N개를 ArrayList에 담아 반복하며 합계를 출력한다\n입력 조건: 1≤N≤30, 각 값 절댓값≤100. 출력 규격: 합.",
    "input": "3 4 -5 9",
    "output": "8",
    "hint": "확장 for문으로 ArrayList<Integer>의 값을 순회합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 정수 개수 3\n        ArrayList<Integer> values=new ArrayList<>(); // 정수 리스트 생성\n        for(int i=0;i<n;i++){ // 3번 입력\n            values.add(sc.nextInt()); // 값 4,-5,9 순서로 추가\n        } // 입력 완료\n        int sum=0; // 합 초기값 0\n        for(int value:values){ // 리스트 순회\n            sum+=value; // sum:0→4→-1→8\n        } // 모든 값 합산 완료\n        System.out.println(sum); // 8 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "정수 개수 3. 정수 리스트 생성. 3번 입력. 예제 실행 결과는 values → 3개, sum → 8입니다. 확인할 조건: 음수 합.",
    "trace": [
      [
        "입력",
        "values",
        "[4,-5,9]",
        "3개"
      ],
      [
        "누적",
        "sum",
        "0→4→-1→8",
        "8"
      ]
    ],
    "constraints": "1≤N≤30, 각 값 절댓값≤100",
    "edgeCases": "음수 합",
    "concept": "ArrayList, for-each",
    "advanced": true
  },
  {
    "id": "JAVA-098",
    "language": "java",
    "level": "종합 활용",
    "topic": "클래스·객체·컬렉션",
    "title": "ArrayList에서 값 검색",
    "statement": "정수 목록에서 target이 있는지 contains로 판단한다\n입력 조건: 1≤N≤30, 정수 N개와 target. 출력 규격: YES 또는 NO.",
    "input": "4 4 8 2 8 2",
    "output": "YES",
    "hint": "contains는 동일한 Integer 값을 포함하는지 검사합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 정수 4개 입력\n        ArrayList<Integer> values=new ArrayList<>(); // 비어 있는 정수 리스트 생성\n        for(int i=0;i<n;i++){ // n개 숫자 저장\n            values.add(sc.nextInt()); // values=[4,8,2,8]\n        } // 리스트 입력 완료\n        int target=sc.nextInt(); // 찾을 값 2 입력\n        boolean found=values.contains(target); // 2가 있으므로 true 반환\n        System.out.println(found?\"YES\":\"NO\"); // YES 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "정수 4개 입력. 비어 있는 정수 리스트 생성. n개 숫자 저장. 예제 실행 결과는 target → 2, found → YES입니다. 확인할 조건: 없음·중복.",
    "trace": [
      [
        "입력",
        "values",
        "[4,8,2,8]",
        "목록"
      ],
      [
        "대상",
        "target",
        "2",
        "2"
      ],
      [
        "조회",
        "found",
        "true",
        "YES"
      ]
    ],
    "constraints": "1≤N≤30, 정수 N개와 target",
    "edgeCases": "없음·중복",
    "concept": "contains",
    "advanced": true
  },
  {
    "id": "JAVA-099",
    "language": "java",
    "level": "종합 활용",
    "topic": "클래스·객체·컬렉션",
    "title": "학생 객체 목록 평균",
    "statement": "Student 객체 N개를 목록에 저장하고 평균 점수를 소수 첫째 자리로 출력한다\n입력 조건: 1≤N≤20, 학생 이름과 0~100점. 출력 규격: 소수 첫째 자리 평균.",
    "input": "3 Mina 70 Jisu 80 Bora 90",
    "output": "80.0",
    "hint": "객체 목록을 순회하며 각 객체의 score를 합산합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    static class Student { // 학생 데이터 클래스\n        String name; // 학생 이름 필드\n        int score; // 학생 점수 필드\n        Student(String name,int score){ // 새 학생을 만들 때 초기화\n            this.name=name; // 입력받은 이름을 객체 필드에 저장\n            this.score=score; // 입력받은 점수를 객체 필드에 저장\n        } // 생성자 종료\n    } // Student 클래스 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 학생 수 n=3\n        ArrayList<Student> students=new ArrayList<>(); // 학생 객체를 담는 리스트\n        for(int i=0;i<n;i++){ // 학생 n명 입력\n            String name=sc.next(); // 학생 이름 Mina/Jisu/Bora 저장\n            int score=sc.nextInt(); // 학생 점수 70/80/90 저장\n            students.add(new Student(name,score)); // 새 Student 객체를 리스트에 추가\n        } // 학생 3명 등록 완료\n        int sum=0; // 전체 점수 합 초기값 0\n        for(Student student:students){ // 학생 객체를 순서대로 방문\n            sum+=student.score; // sum:0→70→150→240\n        } // 합산 완료\n        double avg=(double)sum/n; // 240/3 → 80.0\n        System.out.printf(Locale.US,\"%.1f%n\",avg); // 80.0 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "학생 데이터 클래스. 학생 이름 필드. 학생 점수 필드. 예제 실행 결과는 sum → 240, avg → 80.0입니다. 확인할 조건: N=1.",
    "trace": [
      [
        "입력",
        "students",
        "Mina70,Jisu80,Bora90",
        "3명"
      ],
      [
        "합계",
        "sum",
        "0→70→150→240",
        "240"
      ],
      [
        "평균",
        "avg",
        "240/3",
        "80.0"
      ]
    ],
    "constraints": "1≤N≤20, 학생 이름과 0~100점",
    "edgeCases": "N=1",
    "concept": "객체, 리스트, 반복",
    "advanced": true
  },
  {
    "id": "JAVA-100",
    "language": "java",
    "level": "종합 활용",
    "topic": "클래스·객체·컬렉션",
    "title": "도서 대출 가능 여부",
    "statement": "Book 클래스의 title,borrowed 필드를 활용해 N개 도서 중 대출 가능한 제목만 출력한다\n입력 조건: 1≤N≤20, 제목 1단어와 대출여부 0/1. 출력 규격: 대출 가능한 책 제목을 입력 순서대로 출력(없으면 NONE).",
    "input": "3 Java 0 Cloud 1 Python 0",
    "output": "Java\nPython",
    "hint": "0은 대출 가능, 1은 대출 중입니다. 책 목록에 대출 가능한 책이 없으면 NONE을 출력합니다.",
    "code": "import java.util.*; // Scanner, Arrays, ArrayList 및 Locale 표준 API 사용\npublic class Main { // 자동 채점 실행 클래스\n    static class Book { // 책 정보를 표현하는 클래스\n        String title; // 책 제목 필드\n        boolean borrowed; // 대출 중인지 여부를 저장한 필드\n        Book(String title,boolean borrowed){ // 제목과 상태를 입력받는 생성자\n            this.title=title; // 책 제목 필드를 초기화\n            this.borrowed=borrowed; // 대출 상태 필드를 초기화\n        } // Book 생성자 종료\n    } // Book 클래스 종료\n    public static void main(String[] args) { // 프로그램 실행 시작\n        Scanner sc=new Scanner(System.in); // 표준 입력을 읽을 객체 생성\n        int n=sc.nextInt(); // 책 개수 n=3\n        ArrayList<Book> books=new ArrayList<>(); // 도서를 저장할 리스트\n        for(int i=0;i<n;i++){ // n개의 책 정보 입력\n            String title=sc.next(); // Java, Cloud, Python 순서로 책 제목 입력\n            int borrowed=sc.nextInt(); // 대출 상태 0,1,0 입력\n            books.add(new Book(title,borrowed==1)); // Book 객체를 생성해 리스트에 추가\n        } // 책 데이터 입력 완료\n        boolean any=false; // 출력한 대출 가능 책 존재 여부\n        for(Book book:books){ // 입력 순서대로 책 검사\n            if(!book.borrowed){ // borrowed가 false면 대출 가능\n                System.out.println(book.title); // Java와 Python 출력\n                any=true; // 대출 가능 도서 발견 표시\n            } // 현재 책 상태 검사 종료\n        } // 전체 책 확인 완료\n        if(!any) System.out.println(\"NONE\"); // 모두 대출 중일 때만 NONE 출력\n        sc.close(); // 사용을 마친 입력 스트림 해제\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "책 정보를 표현하는 클래스. 책 제목 필드. 대출 중인지 여부를 저장한 필드. 예제 실행 결과는 borrowed → —, any → Python입니다. 확인할 조건: 모두 대출 중.",
    "trace": [
      [
        "입력",
        "books",
        "Java:0, Cloud:1, Python:0",
        "3권"
      ],
      [
        "Java",
        "any",
        "false→true",
        "Java"
      ],
      [
        "Cloud",
        "borrowed",
        "true, 미출력",
        "—"
      ],
      [
        "Python",
        "any",
        "true 유지",
        "Python"
      ]
    ],
    "constraints": "1≤N≤20, 제목 1단어와 대출여부 0/1",
    "edgeCases": "모두 대출 중",
    "concept": "객체, ArrayList, 조건",
    "advanced": true
  }
];
