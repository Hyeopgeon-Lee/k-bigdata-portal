// 신입생 코딩 학습 예제 8문제. 목표 350문제와 실제 등록 문제 수를 구분합니다.
// 변수 추적은 제공된 예제 입력에 한정됩니다.
export const codingProblems = [
  {
    "id": "JAVA-001",
    "language": "java",
    "level": "입문",
    "topic": "출력",
    "title": "Hello World 출력",
    "statement": "화면에 Hello World를 한 줄 출력하는 프로그램을 작성하시오.",
    "input": "입력 없음",
    "output": "Hello World",
    "hint": "Java에서는 System.out.println(문자열)로 문자열을 출력합니다.",
    "code": "public class Main { // 프로그램을 실행할 Main 클래스 선언\n    public static void main(String[] args) { // 프로그램의 시작 메서드\n        System.out.println(\"Hello World\"); // 문자열 Hello World 출력\n    } // main 메서드 종료\n} // Main 클래스 종료",
    "explanation": "문자열은 큰따옴표로 감싸고, println은 출력 후 줄을 바꿉니다. 이 문제에는 값을 저장하는 변수가 없습니다.",
    "trace": [
      [
        "실행",
        "—",
        "출력문 실행",
        "Hello World"
      ]
    ]
  },
  {
    "id": "JAVA-041",
    "language": "java",
    "level": "기초 응용",
    "topic": "반복문",
    "title": "1부터 N까지의 합",
    "statement": "1 이상 100 이하 정수 N을 입력받아 1부터 N까지의 합을 출력하시오.",
    "input": "4",
    "output": "10",
    "hint": "sum을 0으로 초기화한 뒤 1부터 N까지 반복하면서 현재 숫자를 누적하세요.",
    "code": "import java.util.Scanner; // 키보드 입력을 읽는 클래스 사용\npublic class Main { // 프로그램을 실행할 Main 클래스\n    public static void main(String[] args) { // 프로그램 시작\n        Scanner sc = new Scanner(System.in); // 입력 객체 생성\n        int n = sc.nextInt(); // 예제 입력 4 → n=4\n        int sum = 0; // 누적 합 초기값 sum=0\n        for (int i = 1; i <= n; i++) { // i=1,2,3,4 순서로 반복\n            sum += i; // sum: 0→1→3→6→10 (i가 1→4일 때)\n        } // i=5이면 조건 5<=4가 거짓이므로 종료\n        System.out.println(sum); // 최종 sum=10 출력\n        sc.close(); // 입력 객체 닫기\n    } // main 종료\n} // 클래스 종료",
    "explanation": "예제 입력 N=4 기준입니다. sum += i는 sum = sum + i와 같습니다. 반복문이 실행될 때 이전 sum을 기억한 상태에서 i만큼 더하므로 값이 누적됩니다.",
    "trace": [
      [
        "초기화",
        "i 없음",
        "sum=0",
        "0"
      ],
      [
        "1회",
        "i=1",
        "0+1",
        "1"
      ],
      [
        "2회",
        "i=2",
        "1+2",
        "3"
      ],
      [
        "3회",
        "i=3",
        "3+3",
        "6"
      ],
      [
        "4회",
        "i=4",
        "6+4",
        "10"
      ],
      [
        "종료",
        "i=5",
        "5<=4는 거짓",
        "10"
      ]
    ]
  },
  {
    "id": "C-001",
    "language": "c",
    "level": "입문",
    "topic": "입출력·변수",
    "title": "두 정수의 합",
    "statement": "한 줄에 입력된 두 정수를 더한 결과를 출력하시오. 정수의 절댓값은 100 이하입니다.",
    "input": "3 5",
    "output": "8",
    "hint": "scanf로 정수 두 개를 입력받아 변수 a, b에 저장합니다.",
    "code": "#include <stdio.h> // 표준 입력과 출력 함수를 사용\nint main(void) { // 프로그램 시작\n    int a, b; // 정수형 변수 a와 b 선언(아직 값 없음)\n    scanf(\"%d %d\", &a, &b); // 예제 3 5 입력 → a=3, b=5\n    int sum = a + b; // 3+5 계산 → sum=8\n    printf(\"%d\\n\", sum); // sum의 값 8을 출력\n    return 0; // 프로그램 정상 종료\n} // main 함수 종료",
    "explanation": "scanf의 &a와 &b는 입력값을 저장할 변수의 주소를 전달합니다. a와 b가 정해진 뒤에야 sum의 값을 계산합니다.",
    "trace": [
      [
        "선언",
        "a,b",
        "아직 초기화되지 않음",
        "—"
      ],
      [
        "입력",
        "a,b",
        "a=3, b=5",
        "3, 5"
      ],
      [
        "계산",
        "sum",
        "3+5",
        "8"
      ],
      [
        "출력",
        "sum",
        "8 출력",
        "8"
      ]
    ]
  },
  {
    "id": "C-024",
    "language": "c",
    "level": "입문",
    "topic": "조건문",
    "title": "홀수와 짝수 판별",
    "statement": "정수 한 개를 입력받아 짝수이면 EVEN, 홀수이면 ODD를 출력하시오.",
    "input": "7",
    "output": "ODD",
    "hint": "2로 나눈 나머지가 0이면 짝수입니다.",
    "code": "#include <stdio.h> // 표준 입출력 기능 사용\nint main(void) { // 프로그램 시작\n    int n; // 판별할 정수를 저장할 변수 선언\n    scanf(\"%d\", &n); // 예제 입력 7 → n=7\n    if (n % 2 == 0) { // 7%2=1이므로 조건은 거짓\n        printf(\"EVEN\\n\"); // 조건이 거짓이어서 실행되지 않음\n    } else { // if 조건이 거짓이므로 else 실행\n        printf(\"ODD\\n\"); // ODD 출력\n    } // 조건문 종료\n    return 0; // 정상 종료\n} // main 종료",
    "explanation": "%는 나머지 연산자입니다. 7을 2로 나눈 나머지는 1이므로 EVEN 분기를 건너뛰고 ODD를 출력합니다.",
    "trace": [
      [
        "입력",
        "n",
        "7 저장",
        "7"
      ],
      [
        "조건",
        "n % 2",
        "7 % 2 = 1",
        "거짓"
      ],
      [
        "분기",
        "else",
        "ODD 출력",
        "ODD"
      ]
    ]
  },
  {
    "id": "PY-001",
    "language": "python",
    "level": "입문",
    "topic": "입출력·변수",
    "title": "두 정수의 합",
    "statement": "두 줄에 걸쳐 입력받은 정수 두 개의 합을 출력하시오.",
    "input": "3\n4",
    "output": "7",
    "hint": "input() 결과는 문자열입니다. int()로 정수로 변환하세요.",
    "code": "a = int(input())  # 첫 입력 3 → a=3\nb = int(input())  # 두 번째 입력 4 → b=4\ntotal = a + b  # a=3, b=4 → total=7\nprint(total)  # total=7을 출력",
    "explanation": "input()은 문자열을 반환하며 int()는 이를 정수로 변환합니다. total은 이전 두 변수 a, b의 현재값을 이용해 7이 됩니다.",
    "trace": [
      [
        "1행",
        "a",
        "입력 3 → int 변환",
        "3"
      ],
      [
        "2행",
        "b",
        "입력 4 → int 변환",
        "4"
      ],
      [
        "3행",
        "total",
        "3+4",
        "7"
      ],
      [
        "4행",
        "출력",
        "total=7",
        "7"
      ]
    ]
  },
  {
    "id": "PY-041",
    "language": "python",
    "level": "기초 응용",
    "topic": "반복문",
    "title": "1부터 N까지의 합",
    "statement": "1 이상 100 이하 정수 N을 입력받아 1부터 N까지의 합을 출력하시오.",
    "input": "4",
    "output": "10",
    "hint": "range(1, n + 1)을 사용하면 1부터 n까지 반복할 수 있습니다.",
    "code": "n = int(input())  # 예제 입력 4 → n=4\ntotal = 0  # 누적 합의 초기값 0\nfor i in range(1, n + 1):  # i=1,2,3,4 순서로 실행\n    total += i  # total: 0→1→3→6→10\nprint(total)  # 반복 종료 뒤 total=10 출력",
    "explanation": "range(1, 5)는 1, 2, 3, 4를 만듭니다. 각 반복마다 total에 현재 i를 더해 이전 값에서 누적되는 구조입니다.",
    "trace": [
      [
        "초기화",
        "i 없음",
        "total=0",
        "0"
      ],
      [
        "1회",
        "i=1",
        "0+1",
        "1"
      ],
      [
        "2회",
        "i=2",
        "1+2",
        "3"
      ],
      [
        "3회",
        "i=3",
        "3+3",
        "6"
      ],
      [
        "4회",
        "i=4",
        "6+4",
        "10"
      ]
    ]
  },
  {
    "id": "LINUX-001",
    "language": "linux",
    "level": "입문",
    "topic": "파일·디렉터리",
    "title": "프로젝트 디렉터리와 파일 만들기",
    "statement": "현재 디렉터리 아래에 project/src 디렉터리를 만들고, 그 안에 빈 main.py 파일을 생성한 뒤 파일 존재를 확인하시오. 학습용 디렉터리에서 실행하세요.",
    "input": "현재 디렉터리에 project가 없다고 가정",
    "output": "project/src/main.py",
    "hint": "mkdir -p는 중간 디렉터리까지 함께 만들고, touch는 빈 파일을 생성합니다.",
    "code": "mkdir -p project/src  # 현재 위치 아래 project와 src 디렉터리 생성\ntouch project/src/main.py  # src 안에 빈 main.py 생성\nfind project -type f  # project 아래 파일 목록 확인",
    "explanation": "1행 직후 project/src 경로가 존재합니다. 2행에서 main.py가 추가됩니다. 3행은 디렉터리 자체가 아니라 파일만 표시합니다.",
    "trace": [
      [
        "시작",
        "현재 위치",
        "project 없음",
        "없음"
      ],
      [
        "mkdir",
        "디렉터리",
        "project/src 생성",
        "디렉터리 있음"
      ],
      [
        "touch",
        "파일",
        "project/src/main.py 생성",
        "파일 있음"
      ],
      [
        "find",
        "조회",
        "파일 경로 표시",
        "project/src/main.py"
      ]
    ]
  },
  {
    "id": "LINUX-002",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 권한",
    "title": "파일 접근 권한 설정",
    "statement": "학습용 report.txt를 만들고 소유자는 읽기·쓰기, 그룹은 읽기, 기타 사용자는 접근할 수 없도록 권한을 설정하시오.",
    "input": "일반 사용자 홈의 실습 폴더에서 수행",
    "output": "-rw-r----- (권한 표시 부분)",
    "hint": "소유자 rw=6, 그룹 r=4, 기타 ---=0이므로 chmod 640을 사용합니다.",
    "code": "touch report.txt  # 빈 report.txt 파일 생성(기존 파일이 있으면 시간정보 갱신)\nchmod 640 report.txt  # 소유자=rw-, 그룹=r--, 기타=---로 권한 변경\nls -l report.txt  # 변경된 파일 권한 표시",
    "explanation": "chmod 640에서 6은 4(읽기)+2(쓰기), 4는 읽기, 0은 아무 권한도 없음을 뜻합니다. ls -l 출력에는 권한 외 소유자와 시간 정보 등이 함께 표시됩니다.",
    "trace": [
      [
        "touch",
        "파일",
        "report.txt 존재",
        "생성 또는 유지"
      ],
      [
        "chmod",
        "권한",
        "640 설정",
        "rw- r-- ---"
      ],
      [
        "ls -l",
        "조회",
        "권한 확인",
        "-rw-r-----"
      ]
    ]
  }
];
