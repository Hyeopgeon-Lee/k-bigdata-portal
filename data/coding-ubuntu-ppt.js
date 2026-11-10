/* 운영체제 실습 PPT 제1~10장(총 328슬라이드) 근거로 작성한 50문제. 명령·옵션 출처: 각 문항의 pptSource. */
export const ubuntuPptProblems = [
  {
    "id": "LINUX-001",
    "language": "linux",
    "level": "입문",
    "topic": "파일·디렉터리",
    "title": "프로젝트 폴더와 빈 파일 만들기",
    "statement": "현재 디렉터리에 project 폴더를 만들고 그 안에 src 폴더를 생성하시오. Vim으로 src 폴더에 빈 main.py 파일을 저장하시오. 마지막으로 생성한 폴더와 파일을 확인하시오.",
    "input": "student@ubuntu:~/lab$ ls\n\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nproject:\nsrc\n\nproject/src:\nmain.py",
    "code": "mkdir -p project/src\nvim project/src/main.py\nls -R project",
    "vimSteps": [
      "터미널에서 mkdir -p project/src를 실행하여 폴더를 만드시오.",
      "터미널에서 vim project/src/main.py를 실행하여 Vim을 여시오.",
      "Vim 안에서 :wq를 입력하고 Enter를 누르시오. (빈 파일을 저장하고 Vim 종료)",
      "터미널로 돌아와 ls -R project를 실행하여 main.py를 확인하시오."
    ],
    "hint": "먼저 폴더를 만든 뒤 편집기를 사용합니다. 마지막에는 폴더 안의 구조를 확인합니다.",
    "explanation": "mkdir -p로 폴더를 만든 뒤 vim project/src/main.py를 실행한다. Vim 안에서 :wq를 입력하고 Enter로 저장·종료한다. 터미널에서 ls -R project로 확인한다.",
    "initialState": "student@ubuntu:~/lab$ ls\n\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nproject:\nsrc\n\nproject/src:\nmain.py",
    "commandParts": [
      {
        "token": "mkdir",
        "meaning": "디렉터리 생성"
      },
      {
        "token": "-p",
        "meaning": "중간 디렉터리 자동 생성"
      },
      {
        "token": "vim",
        "meaning": "Vim 편집기로 파일 열기"
      },
      {
        "token": ":wq",
        "meaning": "저장하고 종료"
      },
      {
        "token": "ls",
        "meaning": "디렉터리 목록 출력"
      },
      {
        "token": "-R",
        "meaning": "하위 디렉터리까지 출력"
      }
    ],
    "verification": "ls -R project",
    "verificationDetail": "mkdir -p로 폴더를 만든 뒤 vim project/src/main.py를 실행한다. Vim 안에서 :wq를 입력하고 Enter로 저장·종료한다. 터미널에서 ls -R project로 확인한다.",
    "commonMistake": "Vim을 열기만 하고 :wq로 저장하지 않으면 파일이 생성되지 않을 수 있다.",
    "trace": [],
    "pptSource": "2장 22쪽, 3장 4~5쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-002",
    "language": "linux",
    "level": "입문",
    "topic": "파일 권한",
    "title": "파일을 만들고 접근 권한 설정하기",
    "statement": "Vim으로 빈 report.txt 파일을 저장하시오. 파일 소유자에게 읽기·쓰기, 그룹에 읽기 권한을 주고 다른 사용자에게는 권한을 주지 마시오. 설정된 권한을 확인하시오.",
    "input": "student@ubuntu:~/lab$ ls\n\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\n-rw-r----- 1 student student 0 Nov 11 09:00 report.txt",
    "code": "vim report.txt\nchmod 640 report.txt\nls -l report.txt",
    "vimSteps": [
      "터미널에서 vim report.txt를 실행하여 Vim을 여시오.",
      "Vim 안에서 :wq를 입력하고 Enter를 누르시오. (빈 파일을 저장하고 Vim 종료)",
      "터미널에서 chmod 640 report.txt를 실행하시오.",
      "터미널에서 ls -l report.txt로 -rw-r----- 권한을 확인하시오."
    ],
    "hint": "소유자·그룹·기타 사용자의 세 묶음을 구분하시오. r=4, w=2, x=1을 더해 각 묶음의 숫자를 결정하시오.",
    "explanation": "1. 소유자·그룹·기타 사용자: 리눅스는 파일 접근 대상을 소유자(u, 파일을 소유한 사용자), 그룹(g, 파일에 지정된 그룹의 구성원), 기타 사용자(o, 앞의 두 범주에 해당하지 않는 사용자)로 구분합니다. 예시의 `-rw-r----- 1 student student 0 ... report.txt`에서 첫 번째 student는 소유자, 두 번째 student는 소유 그룹입니다.\n\n2. 권한 기호: r은 읽기(read), w는 쓰기(write), x는 실행(execute), -는 해당 권한이 없다는 뜻입니다. `-rw-r-----`의 맨 앞 -는 일반 파일을 뜻하고, 뒤의 세 묶음 `rw- / r-- / ---`가 차례대로 소유자·그룹·기타 사용자의 권한입니다.\n\n3. 숫자 권한 계산: 읽기(r)=4, 쓰기(w)=2, 실행(x)=1, 권한 없음(-)=0으로 놓고 각 대상의 값을 더합니다. `rw-`는 4+2=6, `r--`는 4, `---`는 0이므로 `640`입니다. 숫자 세 자리의 순서는 언제나 소유자 → 그룹 → 기타 사용자입니다.\n\n4. 대표적인 권한 비교: `777`은 rwx/rwx/rwx(모든 사용자에게 읽기·쓰기·실행), `755`는 rwx/r-x/r-x, `644`는 rw-/r--/r--, `600`은 rw-/---/---입니다. 특히 777은 다른 사용자에게도 쓰기를 허용하므로 일반 파일에 무조건 부여하면 위험합니다.\n\n5. 문제 해결과 확인: Vim에서 빈 파일을 저장한 뒤 `chmod 640 report.txt`로 권한을 설정하고 `ls -l report.txt`로 첫 10자리 `-rw-r-----`를 확인합니다. `chmod`는 파일의 접근 권한을 바꿀 뿐 소유자나 소유 그룹 자체를 변경하지는 않습니다.",
    "initialState": "student@ubuntu:~/lab$ ls\n\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n-rw-r----- 1 student student 0 Nov 11 09:00 report.txt",
    "commandParts": [
      {
        "token": "소유자(u)",
        "meaning": "파일을 소유한 사용자. ls -l 결과의 첫 번째 사용자/그룹 이름 중 첫 번째"
      },
      {
        "token": "그룹(g)",
        "meaning": "파일이 속한 그룹. ls -l 결과의 소유자 이름 다음에 표시"
      },
      {
        "token": "기타 사용자(o)",
        "meaning": "소유자도 소유 그룹의 구성원도 아닌 사용자"
      },
      {
        "token": "r / w / x",
        "meaning": "읽기 / 쓰기 / 실행 권한 (숫자값 4 / 2 / 1)"
      },
      {
        "token": "rw- / r-- / ---",
        "meaning": "소유자=6 / 그룹=4 / 기타=0, 따라서 640"
      },
      {
        "token": "777",
        "meaning": "rwx / rwx / rwx: 모든 사용자에게 읽기·쓰기·실행 허용 (주의)"
      },
      {
        "token": "755",
        "meaning": "rwx / r-x / r-x: 소유자 전체 권한, 그룹·기타는 읽기·실행"
      },
      {
        "token": "644",
        "meaning": "rw- / r-- / r--: 소유자 읽기·쓰기, 나머지는 읽기"
      },
      {
        "token": "600",
        "meaning": "rw- / --- / ---: 소유자만 읽기·쓰기"
      },
      {
        "token": "vim report.txt",
        "meaning": "Vim으로 파일을 열기 (터미널에서 실행)"
      },
      {
        "token": ":wq + Enter",
        "meaning": "Vim에서 빈 파일을 저장하고 종료"
      },
      {
        "token": "chmod 640 report.txt",
        "meaning": "소유자/그룹/기타 권한을 6/4/0으로 설정 (소유자 자체는 변경하지 않음)"
      },
      {
        "token": "ls -l report.txt",
        "meaning": "첫 10자리 파일 유형·권한과 소유자·그룹 확인"
      }
    ],
    "verification": "ls -l report.txt",
    "verificationDetail": "ls -l 결과의 첫 열 -rw-r-----는 일반 파일(-), 소유자 rw-(6), 그룹 r--(4), 기타 사용자 ---(0)를 뜻합니다. 출력의 두 student 중 앞은 소유자, 뒤는 그룹입니다.",
    "commonMistake": "숫자 640은 소유자·그룹·기타 순서입니다. 604처럼 순서를 바꾸지 마세요. 777은 모든 사용자에게 쓰기도 허용하므로 이 문제의 정답이 아닙니다.",
    "trace": [],
    "pptSource": "3장 4~5쪽, 5장 13~15쪽",
    "outputNote": "권한 외의 소유자·날짜 등은 실행 환경에 따라 달라질 수 있습니다."
  },
  {
    "id": "LINUX-003",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 탐색",
    "title": "현재 위치 확인하기",
    "statement": "현재 작업 중인 디렉터리의 전체 경로를 출력하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\n/home/student/lab",
    "code": "pwd",
    "hint": "현재 위치를 확인하는 명령을 떠올려 보세요.",
    "explanation": "pwd는 현재 작업 디렉터리의 절대경로를 출력한다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n/home/student/lab",
    "commandParts": [
      {
        "token": "pwd",
        "meaning": "현재 작업 디렉터리 절대경로 출력"
      }
    ],
    "verification": "pwd",
    "verificationDetail": "pwd는 현재 작업 디렉터리의 절대경로를 출력한다.",
    "commonMistake": "사용자에 따라 실제 출력되는 경로는 달라질 수 있다.",
    "trace": [],
    "pptSource": "2장 10쪽",
    "outputNote": "현재 위치의 전체 경로는 사용자 계정과 실습 환경에 따라 달라질 수 있습니다."
  },
  {
    "id": "LINUX-004",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 탐색",
    "title": "현재 디렉터리의 파일·폴더 확인",
    "statement": "현재 폴더에 있는 파일과 디렉터리의 이름을 출력하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]\na.txt  docs",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\na.txt  docs",
    "code": "ls",
    "hint": "현재 폴더에 어떤 항목이 있는지 표시하는 기본 명령을 생각해 보세요.",
    "explanation": "ls는 현재 디렉터리의 파일과 폴더 이름을 표시하는 명령어입니다. 옵션을 붙이지 않으면 점(.)으로 시작하는 숨김 항목은 표시하지 않습니다. 아래 표에서 주요 ls 옵션의 기능과 사용 예시를 비교해 보세요. ls 명령어와 아래 옵션들은 파일을 생성·수정·삭제하지 않고 목록의 표시 방식만 바꿉니다.",
    "optionGuideHeading": "ls 주요 옵션 비교표",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]\na.txt  docs",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\na.txt  docs",
    "commandParts": [
      {
        "token": "ls (옵션 없음)",
        "meaning": "현재 디렉터리의 일반 파일·폴더 이름 출력. 점(.)으로 시작하는 숨김 항목은 제외",
        "example": "ls"
      },
      {
        "token": "-a",
        "meaning": "숨김 항목까지 모두 출력. .(현재 디렉터리)과 ..(상위 디렉터리)도 함께 표시",
        "example": "ls -a"
      },
      {
        "token": "-l",
        "meaning": "권한·하드 링크 수·소유자·그룹·파일 크기·수정 시각 등 상세 정보 표시",
        "example": "ls -l"
      },
      {
        "token": "-F",
        "meaning": "이름 뒤에 종류 구분 기호를 붙임. 디렉터리 /, 심벌릭 링크 @, 실행 파일 *",
        "example": "ls -F"
      },
      {
        "token": "-d",
        "meaning": "디렉터리 내부 목록 대신 디렉터리 자체를 표시. -l과 함께 사용하면 디렉터리의 권한 등을 확인",
        "example": "ls -ld docs"
      },
      {
        "token": "-i",
        "meaning": "파일·디렉터리 이름 앞에 inode 번호 표시. 하드 링크를 비교할 때 활용",
        "example": "ls -i a.txt"
      },
      {
        "token": "-R",
        "meaning": "현재 디렉터리와 그 아래 하위 디렉터리의 목록을 재귀적으로 표시",
        "example": "ls -R"
      }
    ],
    "verification": "ls",
    "verificationDetail": "ls는 현재 디렉터리의 파일과 하위 디렉터리 이름을 표시한다.",
    "commonMistake": "파일이 이미 존재하므로 새로 생성하지 않는다.",
    "trace": [],
    "pptSource": "2장 13쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-005",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 탐색",
    "title": "숨김 파일 포함하여 목록 확인",
    "statement": "현재 폴더에 있는 숨김 파일을 포함해 모든 항목의 이름을 출력하시오.",
    "input": "student@ubuntu:~/lab$ ls\nnote.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\n.  ..  .profile  note.txt",
    "code": "ls -a",
    "hint": "일반 파일 목록에는 점으로 시작하는 항목이 보이지 않는 이유를 생각해 보세요.",
    "explanation": "ls -a는 숨김 항목과 . 및 ..도 표시한다.",
    "initialState": "student@ubuntu:~/lab$ ls\nnote.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n.  ..  .profile  note.txt",
    "commandParts": [
      {
        "token": "ls",
        "meaning": "디렉터리 목록 출력"
      },
      {
        "token": "-a",
        "meaning": "숨김 항목까지 출력"
      }
    ],
    "verification": "ls -a",
    "verificationDetail": "ls -a는 숨김 항목과 . 및 ..도 표시한다.",
    "commonMistake": "일반 ls에서는 .으로 시작하는 파일이 보이지 않는다.",
    "trace": [],
    "pptSource": "2장 14쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-006",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 탐색",
    "title": "파일 종류 기호 확인하기",
    "statement": "현재 폴더에 있는 파일과 디렉터리의 이름을 종류 구분 기호와 함께 출력하시오.",
    "input": "student@ubuntu:~/lab$ ls\ndocs  note.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\ndocs/  note.txt",
    "code": "ls -F",
    "hint": "파일과 디렉터리는 목록에 서로 다른 구분 기호를 붙일 수 있습니다.",
    "explanation": "ls -F는 디렉터리에 /, 심벌릭 링크에 @, 실행 파일에 *를 붙인다.",
    "initialState": "student@ubuntu:~/lab$ ls\ndocs  note.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\ndocs/  note.txt",
    "commandParts": [
      {
        "token": "ls",
        "meaning": "디렉터리 목록 표시"
      },
      {
        "token": "-F",
        "meaning": "파일 종류 표시"
      }
    ],
    "verification": "ls -F",
    "verificationDetail": "ls -F는 디렉터리에 /, 심벌릭 링크에 @, 실행 파일에 *를 붙인다.",
    "commonMistake": "-F의 / 표시는 디렉터리 이름 일부가 아니다.",
    "trace": [],
    "pptSource": "2장 15쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-007",
    "language": "linux",
    "level": "입문",
    "topic": "파일 속성",
    "title": "상세 파일 정보 읽기",
    "statement": "note.txt 파일의 접근 권한, 소유자, 크기, 수정 시간을 자세히 확인하시오.",
    "input": "student@ubuntu:~/lab$ ls\nnote.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\n-rw-r--r-- 1 student student 6 Nov 11 09:00 note.txt",
    "code": "ls -l note.txt",
    "hint": "파일 이름만 보는 목록과 상세 정보 목록의 차이를 생각해 보세요.",
    "explanation": "1. `ls -l note.txt`는 파일 이름만이 아니라 종류·접근 권한·소유자·그룹·크기·수정 시각까지 표시합니다.\n\n2. 예시 `-rw-r--r-- 1 student student 6 Nov 11 09:00 note.txt`에서 맨 앞 `-`는 일반 파일이며, `rw- / r-- / r--`는 소유자·그룹·기타 사용자 권한입니다. r=4, w=2이므로 숫자 권한은 644입니다.\n\n3. 그다음 `1`은 하드 링크 수, 첫 번째 `student`는 소유자, 두 번째 `student`는 소유 그룹, `6`은 파일 크기(바이트), `Nov 11 09:00`은 수정 시각, `note.txt`는 파일명입니다. 소유자와 그룹은 같은 이름으로 표시될 수도 있지만 서로 다른 항목입니다.",
    "initialState": "student@ubuntu:~/lab$ ls\nnote.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n-rw-r--r-- 1 student student 6 Nov 11 09:00 note.txt",
    "commandParts": [
      {
        "token": "ls -l note.txt",
        "meaning": "note.txt의 파일 유형·권한·소유자·그룹·크기·수정 시각 보기"
      },
      {
        "token": "-rw-r--r--",
        "meaning": "일반 파일(-), 소유자 rw-(6), 그룹 r--(4), 기타 r--(4)"
      },
      {
        "token": "student (첫 번째)",
        "meaning": "파일 소유자"
      },
      {
        "token": "student (두 번째)",
        "meaning": "파일 소유 그룹"
      },
      {
        "token": "6 / Nov 11 09:00",
        "meaning": "파일 크기(6바이트) / 마지막 수정 시각 (예시)"
      }
    ],
    "verification": "ls -l note.txt",
    "verificationDetail": "첫 열의 권한은 일반 파일(-)과 소유자·그룹·기타 세 묶음으로 나뉩니다. 세 번째 열은 소유자, 네 번째 열은 그룹입니다.",
    "commonMistake": "ls -l에서 같은 이름이 두 번 나와도 첫 번째는 소유자, 두 번째는 그룹입니다. 권한의 맨 앞 파일 유형 기호(-)를 숫자 세 자리 계산에 넣지 마세요.",
    "trace": [],
    "pptSource": "2장 16~17쪽",
    "outputNote": "파일 크기와 수정 시간은 실제 파일 상태에 따라 다릅니다."
  },
  {
    "id": "LINUX-008",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 탐색",
    "title": "한 단계 상위로 이동하기",
    "statement": "project 폴더에서 한 단계 위인 lab 폴더로 이동하시오. 이동한 뒤 현재 디렉터리 경로를 확인하시오.",
    "input": "student@ubuntu:~/lab/project$ [명령어 입력]\n/home/student/lab/project",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\n/home/student/lab",
    "code": "cd ..\npwd",
    "hint": "현재 디렉터리와 상위 디렉터리를 나타내는 기호가 서로 다릅니다.",
    "explanation": "cd ..으로 한 단계 위로 이동하고 pwd로 확인한다.",
    "initialState": "student@ubuntu:~/lab/project$ [명령어 입력]\n/home/student/lab/project",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n/home/student/lab",
    "commandParts": [
      {
        "token": "cd",
        "meaning": "작업 디렉터리 이동"
      },
      {
        "token": "..",
        "meaning": "부모 디렉터리"
      },
      {
        "token": "pwd",
        "meaning": "현재 경로 확인"
      }
    ],
    "verification": "pwd",
    "verificationDetail": "cd ..으로 한 단계 위로 이동하고 pwd로 확인한다.",
    "commonMistake": "..과 .은 서로 다른 위치를 나타낸다.",
    "trace": [],
    "pptSource": "2장 5~8쪽, 11쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-009",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 탐색",
    "title": "홈 디렉터리로 이동하기",
    "statement": "현재 위치에서 자신의 홈 디렉터리로 이동하시오. 이동한 위치의 전체 경로를 출력하시오.",
    "input": "student@ubuntu:/tmp$ [명령어 입력]\n/tmp",
    "output": "student@ubuntu:~$ [명령어 입력]\n/home/student",
    "code": "cd ~\npwd",
    "hint": "현재 폴더가 어디든 홈 디렉터리로 이동할 수 있습니다.",
    "explanation": "~는 현재 사용자의 홈 디렉터리이고 cd ~는 해당 경로로 이동한다.",
    "initialState": "student@ubuntu:/tmp$ [명령어 입력]\n/tmp",
    "afterState": "student@ubuntu:~$ [명령어 입력]\n/home/student",
    "commandParts": [
      {
        "token": "cd",
        "meaning": "작업 위치 이동"
      },
      {
        "token": "~",
        "meaning": "홈 디렉터리"
      },
      {
        "token": "pwd",
        "meaning": "현재 경로 출력"
      }
    ],
    "verification": "pwd",
    "verificationDetail": "~는 현재 사용자의 홈 디렉터리이고 cd ~는 해당 경로로 이동한다.",
    "commonMistake": "실행 사용자의 홈 디렉터리 경로가 ubuntu와 다를 수 있다.",
    "trace": [],
    "pptSource": "2장 6쪽, 12쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-010",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 생성",
    "title": "새 폴더 만들기",
    "statement": "현재 폴더에 reports라는 새 디렉터리를 생성하시오. 생성된 이름을 확인하시오.",
    "input": "student@ubuntu:~/lab$ ls\n\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nreports/",
    "code": "mkdir reports",
    "hint": "폴더를 생성하는 명령을 떠올리고, 생성 후 목록을 확인해 보세요.",
    "explanation": "mkdir는 지정한 이름의 디렉터리를 만든다.",
    "initialState": "student@ubuntu:~/lab$ ls\n\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nreports/",
    "commandParts": [
      {
        "token": "mkdir",
        "meaning": "새 디렉터리를 생성"
      }
    ],
    "verification": "ls -F",
    "verificationDetail": "mkdir는 지정한 이름의 디렉터리를 만든다.",
    "commonMistake": "동일한 디렉터리가 이미 있다면 일반 mkdir는 생성에 실패한다.",
    "trace": [],
    "pptSource": "2장 20쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-011",
    "language": "linux",
    "level": "입문",
    "topic": "문서 편집",
    "title": "Vim으로 빈 텍스트 파일 저장하기",
    "statement": "Vim으로 빈 note.txt 파일을 저장하고 편집기를 종료하시오. 파일이 생성되었는지 확인하시오.",
    "input": "student@ubuntu:~/lab$ ls\n\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\n-rw-r--r-- 1 student student 0 Nov 11 09:00 note.txt",
    "code": "vim note.txt\nls -l note.txt",
    "vimSteps": [
      "터미널에서 vim note.txt를 실행하여 Vim을 여시오.",
      "Vim 안에서 :wq를 입력하고 Enter를 누르시오. (빈 파일을 저장하고 Vim 종료)",
      "터미널에서 ls -l note.txt로 파일이 만들어졌는지 확인하시오."
    ],
    "hint": "Vim에서 파일을 열고 저장·종료하는 순서를 떠올려 보세요.",
    "explanation": "vim note.txt로 Vim을 열고 :wq, Enter 순서로 빈 파일을 저장·종료한다. 터미널로 돌아와 ls -l note.txt로 파일이 있는지 확인한다.",
    "initialState": "student@ubuntu:~/lab$ ls\n\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n-rw-r--r-- 1 student student 0 Nov 11 09:00 note.txt",
    "commandParts": [
      {
        "token": "vim",
        "meaning": "Vim 편집기로 파일 열기"
      },
      {
        "token": ":wq",
        "meaning": "저장하고 종료"
      }
    ],
    "verification": "ls -l note.txt",
    "verificationDetail": "vim note.txt로 Vim을 열고 :wq, Enter 순서로 빈 파일을 저장·종료한다. 터미널로 돌아와 ls -l note.txt로 파일이 있는지 확인한다.",
    "commonMistake": "저장하지 않고 종료하면 새 파일이 남지 않을 수 있다.",
    "trace": [],
    "pptSource": "3장 2~5쪽",
    "outputNote": "파일 소유자·날짜·기본 권한은 실습 환경에 따라 달라질 수 있습니다."
  },
  {
    "id": "LINUX-012",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 삭제",
    "title": "빈 폴더 삭제하기",
    "statement": "내용이 없는 empty 디렉터리를 삭제하시오. 삭제한 뒤 목록에 empty가 없는지 확인하시오.",
    "input": "student@ubuntu:~/lab$ ls -F\nempty/\nstudent@ubuntu:~/lab$ ls empty\n\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\n",
    "code": "rmdir empty",
    "hint": "비어 있는 디렉터리만 삭제하는 명령을 떠올려 보세요.",
    "explanation": "rmdir은 빈 디렉터리를 삭제한다.",
    "initialState": "student@ubuntu:~/lab$ ls -F\nempty/\nstudent@ubuntu:~/lab$ ls empty\n\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n",
    "commandParts": [
      {
        "token": "rmdir",
        "meaning": "비어 있는 디렉터리 삭제"
      }
    ],
    "verification": "ls",
    "verificationDetail": "rmdir은 빈 디렉터리를 삭제한다.",
    "commonMistake": "내용이 들어 있는 디렉터리는 rmdir만으로 지울 수 없다.",
    "trace": [],
    "pptSource": "2장 23쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-013",
    "language": "linux",
    "level": "입문",
    "topic": "파일 내용",
    "title": "텍스트 파일 내용 확인하기",
    "statement": "readme.txt 파일에 저장된 글을 터미널에 출력하시오.",
    "input": "student@ubuntu:~/lab$ ls\nreadme.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nHello Linux\nUbuntu",
    "code": "cat readme.txt",
    "hint": "파일 내용을 수정하지 않고 화면에 그대로 표시하면 됩니다.",
    "explanation": "cat 명령은 파일에 저장된 내용을 변경하지 않고 터미널에 출력합니다.",
    "initialState": "student@ubuntu:~/lab$ ls\nreadme.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nHello Linux\nUbuntu",
    "commandParts": [
      {
        "token": "cat",
        "meaning": "파일 내용 출력"
      }
    ],
    "verification": "cat readme.txt",
    "verificationDetail": "cat 명령은 파일에 저장된 내용을 변경하지 않고 터미널에 출력합니다.",
    "commonMistake": "파일을 변경하는 명령이 아니라 파일 내용을 확인하는 명령을 사용하세요.",
    "trace": [],
    "pptSource": "2장 24쪽",
    "outputNote": "readme.txt에는 Hello Linux와 Ubuntu가 한 줄씩 저장되어 있는 실습 상황입니다."
  },
  {
    "id": "LINUX-014",
    "language": "linux",
    "level": "입문",
    "topic": "파일 복사",
    "title": "텍스트 파일 복사하기",
    "statement": "현재 폴더에 있는 note.txt를 backup.txt라는 이름으로 복사하시오. 원본과 복사본이 모두 있는지 확인하시오.",
    "input": "student@ubuntu:~/lab$ ls\nnote.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nbackup.txt  note.txt",
    "code": "cp note.txt backup.txt",
    "hint": "원본을 남기면서 새 이름으로 복제하는 기능이 필요합니다.",
    "explanation": "cp는 원본 파일을 남기고 지정한 이름의 복사본을 만든다.",
    "initialState": "student@ubuntu:~/lab$ ls\nnote.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nbackup.txt  note.txt",
    "commandParts": [
      {
        "token": "cp",
        "meaning": "파일을 복사"
      }
    ],
    "verification": "ls",
    "verificationDetail": "cp는 원본 파일을 남기고 지정한 이름의 복사본을 만든다.",
    "commonMistake": "복사는 원본 파일을 삭제하지 않는다.",
    "trace": [],
    "pptSource": "2장 30쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-015",
    "language": "linux",
    "level": "입문",
    "topic": "파일 이동",
    "title": "파일 이름 바꾸기",
    "statement": "현재 폴더의 draft.txt 파일 이름을 final.txt로 바꾸시오. 변경 전 이름이 사라지고 변경 후 이름만 보이는지 확인하시오.",
    "input": "student@ubuntu:~/lab$ ls\ndraft.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nfinal.txt",
    "code": "mv draft.txt final.txt",
    "hint": "새 이름으로 바꾼 뒤 이전 이름이 남아 있는지 확인해 보세요.",
    "explanation": "mv는 파일의 위치를 이동하거나 파일 이름을 변경한다.",
    "initialState": "student@ubuntu:~/lab$ ls\ndraft.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nfinal.txt",
    "commandParts": [
      {
        "token": "mv",
        "meaning": "파일 이동 또는 이름 변경"
      }
    ],
    "verification": "ls",
    "verificationDetail": "mv는 파일의 위치를 이동하거나 파일 이름을 변경한다.",
    "commonMistake": "이름 변경과 복사는 원본 파일 존재 여부가 다르다.",
    "trace": [],
    "pptSource": "2장 34~35쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-016",
    "language": "linux",
    "level": "기초 응용",
    "topic": "디렉터리 정보",
    "title": "폴더 자체의 상세 정보 확인",
    "statement": "docs 디렉터리 안의 파일 목록이 아니라 docs 디렉터리 자체의 상세 정보를 확인하시오.",
    "input": "student@ubuntu:~/lab$ ls -F\ndocs/\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\ndrwxr-xr-x 2 student student 4096 Nov 11 09:00 docs",
    "code": "ls -ld docs",
    "hint": "디렉터리 안의 항목 목록과 디렉터리 자체의 정보를 구별해 보세요.",
    "explanation": "ls -ld docs의 -l은 상세 정보, -d는 디렉터리 자체를 의미합니다. drwxr-xr-x의 맨 앞 d는 디렉터리이며, rwx=7(소유자), r-x=5(그룹), r-x=5(기타 사용자)이므로 숫자 권한은 755입니다. r=4, w=2, x=1입니다. 일반 파일의 x는 실행 권한이지만 디렉터리의 x는 그 디렉터리에 진입하거나 경로를 통과할 권한입니다. 'student student'는 소유자와 그룹입니다.",
    "initialState": "student@ubuntu:~/lab$ ls -F\ndocs/\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\ndrwxr-xr-x 2 student student 4096 Nov 11 09:00 docs",
    "commandParts": [
      {
        "token": "ls -ld",
        "meaning": "-l 상세 표시, -d 디렉터리 자체 표시"
      },
      {
        "token": "d",
        "meaning": "첫 글자 d는 디렉터리, -는 일반 파일"
      },
      {
        "token": "rwxr-xr-x",
        "meaning": "소유자 7(rwx), 그룹 5(r-x), 기타 5(r-x): 755"
      },
      {
        "token": "student student",
        "meaning": "앞이 소유자, 뒤가 그룹"
      }
    ],
    "verification": "ls -ld docs",
    "verificationDetail": "drwxr-xr-x는 디렉터리(d)와 권한 755를 나타냅니다. 이 문제에서는 권한을 변경하지 않고 표시만 합니다.",
    "commonMistake": "-d가 없으면 폴더 내부 목록이 출력될 수 있다.",
    "trace": [],
    "pptSource": "2장 16쪽, 18쪽",
    "outputNote": "권한, 소유자, 크기와 수정 시간은 실제 시스템에 따라 달라집니다."
  },
  {
    "id": "LINUX-017",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 내용",
    "title": "파일의 마지막 일곱 줄 확인",
    "statement": "현재 폴더에 있는 log.txt 파일의 마지막 7줄만 출력하시오.",
    "input": "student@ubuntu:~/lab$ cat log.txt\nline1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nline4\nline5\nline6\nline7\nline8\nline9\nline10",
    "code": "tail -7 log.txt",
    "hint": "파일의 시작 부분이 아니라 마지막 부분을 보는 방법을 생각해 보세요.",
    "explanation": "tail은 파일의 끝에서부터 지정한 줄 수만큼 출력합니다. -7은 마지막 일곱 줄을 뜻합니다.",
    "initialState": "student@ubuntu:~/lab$ cat log.txt\nline1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nline4\nline5\nline6\nline7\nline8\nline9\nline10",
    "commandParts": [
      {
        "token": "tail",
        "meaning": "파일의 끝부분 출력"
      },
      {
        "token": "-7",
        "meaning": "마지막 일곱 줄 표시"
      }
    ],
    "verification": "tail -7 log.txt",
    "verificationDetail": "tail -7은 파일의 끝에서 7줄을 출력합니다. log.txt의 4~10번째 줄이 나오는지 확인합니다.",
    "commonMistake": "처음 일곱 줄이 아니라 마지막 일곱 줄을 출력해야 합니다.",
    "trace": [],
    "pptSource": "2장 28~29쪽",
    "outputNote": "10줄짜리 실습 파일을 기준으로 마지막 7줄만 표시했습니다."
  },
  {
    "id": "LINUX-018",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 검색",
    "title": "검색 결과의 행 번호 함께 보기",
    "statement": "app.log 파일에서 ERROR가 들어 있는 줄을 찾으시오. 해당 줄의 번호도 함께 출력하시오.",
    "input": "student@ubuntu:~/lab$ cat app.log\nINFO start\nERROR first\nINFO running\nINFO done\nERROR second\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\n2:ERROR first\n5:ERROR second",
    "code": "grep -n 'ERROR' app.log",
    "hint": "문자열 검색 결과에 줄 번호를 함께 표시해야 합니다.",
    "explanation": "grep -n은 일치하는 행 앞에 해당 행 번호를 함께 표시한다.",
    "initialState": "student@ubuntu:~/lab$ cat app.log\nINFO start\nERROR first\nINFO running\nINFO done\nERROR second\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n2:ERROR first\n5:ERROR second",
    "commandParts": [
      {
        "token": "grep",
        "meaning": "파일 내 문자열 검색"
      },
      {
        "token": "-n",
        "meaning": "일치한 행 번호 표시"
      }
    ],
    "verification": "grep -n 'ERROR' app.log",
    "verificationDetail": "grep -n은 일치하는 행 앞에 해당 행 번호를 함께 표시한다.",
    "commonMistake": "ERROR와 error는 대소문자가 달라 서로 구분될 수 있다.",
    "trace": [],
    "pptSource": "2장 53쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-019",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 검색",
    "title": "내 계정이 소유한 파일 찾기",
    "statement": "현재 디렉터리(~/lab)의 소유자는 student이며, 아래 목록의 세 번째 열에 표시된 소유자를 참고하여 현재 폴더와 하위 폴더에서 student 사용자가 소유한 파일 및 디렉터리의 경로만 검색하시오.",
    "input": "student@ubuntu:~/lab$ ls -l\ntotal 8\ndrwxr-xr-x 2 student student 4096 Nov 11 09:00 docs\n-rw-r--r-- 1 teacher teacher   20 Nov 11 09:00 note.txt\nstudent@ubuntu:~/lab$ ls -l docs\ntotal 8\n-rw-r--r-- 1 teacher teacher 18 Nov 11 09:00 guide.txt\n-rw-r--r-- 1 student student 15 Nov 11 09:00 memo.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\n.\n./docs\n./docs/memo.txt",
    "code": "find . -user student",
    "hint": "소유자는 파일 목록의 세 번째 열에서 확인할 수 있습니다. 파일 이름 대신 소유자 조건으로 검색하시오.",
    "explanation": "파일 목록의 세 번째 열은 소유자입니다. student가 소유한 현재 디렉터리(.), docs 디렉터리, docs/memo.txt만 검색 결과에 포함됩니다. teacher 소유인 note.txt와 docs/guide.txt는 제외됩니다.",
    "initialState": "student@ubuntu:~/lab$ ls -l\ntotal 8\ndrwxr-xr-x 2 student student 4096 Nov 11 09:00 docs\n-rw-r--r-- 1 teacher teacher   20 Nov 11 09:00 note.txt\nstudent@ubuntu:~/lab$ ls -l docs\ntotal 8\n-rw-r--r-- 1 teacher teacher 18 Nov 11 09:00 guide.txt\n-rw-r--r-- 1 student student 15 Nov 11 09:00 memo.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n.\n./docs\n./docs/memo.txt",
    "commandParts": [
      {
        "token": "find",
        "meaning": "조건에 맞는 파일 경로 검색"
      },
      {
        "token": ".",
        "meaning": "현재 디렉터리"
      },
      {
        "token": "-user",
        "meaning": "student 사용자에게 속한 파일 검색"
      }
    ],
    "verification": "find . -user student",
    "verificationDetail": "find는 현재 디렉터리와 하위 폴더에서 조건에 맞는 항목을 검색합니다. -user student는 소유자가 student인 항목을 찾는 조건입니다.",
    "commonMistake": "파일에 대한 접근 권한이 있다고 해서 소유자인 것은 아닙니다. 목록의 세 번째 열에 적힌 사용자 이름을 확인하시오.",
    "trace": [],
    "pptSource": "2장 54쪽",
    "outputNote": "검색 결과는 student 소유 항목만 표시합니다. 출력 순서는 환경에 따라 달라질 수 있습니다."
  },
  {
    "id": "LINUX-020",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 위치",
    "title": "명령어가 저장된 위치 확인",
    "statement": "mv 명령어의 실행 파일이 저장된 경로를 확인하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\n/usr/bin/mv",
    "code": "which mv",
    "hint": "명령어 이름을 입력할 때 시스템이 찾는 실행 파일 위치를 확인합니다.",
    "explanation": "which는 명령어가 저장된 실행 파일 경로를 보여준다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n/usr/bin/mv",
    "commandParts": [
      {
        "token": "which",
        "meaning": "명령어 실행 파일 경로 검색"
      }
    ],
    "verification": "which mv",
    "verificationDetail": "which는 명령어가 저장된 실행 파일 경로를 보여준다.",
    "commonMistake": "반환 경로는 시스템 환경에 따라 달라질 수 있다.",
    "trace": [],
    "pptSource": "2장 55쪽",
    "outputNote": "mv 실행 파일의 경로는 환경에 따라 다를 수 있습니다."
  },
  {
    "id": "LINUX-021",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 링크",
    "title": "심볼릭 링크 생성과 원본 파일 비교",
    "statement": "현재 디렉터리에 있는 data.txt를 가리키는 data-link 심볼릭 링크를 생성하시오. 링크가 가리키는 파일 이름을 확인하고, 원본과 링크의 inode 번호를 비교하시오.",
    "input": "student@ubuntu:~/lab$ ls -l data.txt\n-rw-r--r-- 1 student student 12 Nov 11 09:00 data.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nstudent@ubuntu:~/lab$ [명령어 입력]\nlrwxrwxrwx 1 student student 8 Nov 11 09:00 data-link -> data.txt\nstudent@ubuntu:~/lab$ [명령어 입력]\n123457 data-link\n123456 data.txt",
    "code": "ln -s data.txt data-link\nls -l data-link\nls -i data.txt data-link",
    "hint": "링크 생성 명령어의 옵션을 생각해 보세요. 상세 목록의 화살표(->)와 inode 번호를 살펴보세요.",
    "explanation": "심볼릭 링크는 원본 파일의 경로를 가리키는 별도의 파일입니다. ln -s로 생성하며, ls -l에서 첫 글자 l과 'data-link -> data.txt'를 확인합니다. ls -i에서는 원본과 심볼릭 링크의 inode 번호가 서로 다르게 나타납니다.",
    "initialState": "student@ubuntu:~/lab$ ls -l data.txt\n-rw-r--r-- 1 student student 12 Nov 11 09:00 data.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nstudent@ubuntu:~/lab$ [명령어 입력]\nlrwxrwxrwx 1 student student 8 Nov 11 09:00 data-link -> data.txt\nstudent@ubuntu:~/lab$ [명령어 입력]\n123457 data-link\n123456 data.txt",
    "commandParts": [
      {
        "token": "ln",
        "meaning": "파일 링크 생성"
      },
      {
        "token": "-s",
        "meaning": "심볼릭 링크 생성"
      },
      {
        "token": "ls -l",
        "meaning": "링크 종류(l)와 연결 경로(->) 확인"
      },
      {
        "token": "ls -i",
        "meaning": "inode 번호 표시"
      }
    ],
    "verification": "ls -l data-link\nls -i data.txt data-link",
    "verificationDetail": "data-link의 목록은 l로 시작하며 -> data.txt가 표시됩니다. 원본과 심볼릭 링크의 inode 번호는 다릅니다.",
    "commonMistake": "심볼릭 링크는 파일 내용을 복사한 것이 아닙니다. 대상 경로가 사라지면 링크가 끊어져 파일에 접근하지 못할 수 있습니다.",
    "trace": [],
    "pptSource": "2장 49~50쪽",
    "outputNote": "inode 번호, 시간, 크기는 예시입니다. 원본과 심볼릭 링크의 inode가 서로 다른지 확인하시오."
  },
  {
    "id": "LINUX-022",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 링크",
    "title": "하드 링크와 심볼릭 링크 비교하기",
    "statement": "현재 디렉터리에 있는 data.txt를 이용하여 data-hard 하드 링크와 data-link 심볼릭 링크를 각각 생성하시오. 원본과 두 링크의 inode 번호를 비교하고, 상세 목록에서 링크 종류와 하드 링크 개수를 확인하시오.",
    "input": "student@ubuntu:~/lab$ ls -l data.txt\n-rw-r--r-- 1 student student 12 Nov 11 09:00 data.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nstudent@ubuntu:~/lab$ [명령어 입력]\nstudent@ubuntu:~/lab$ [명령어 입력]\n123456 data-hard\n123457 data-link\n123456 data.txt\nstudent@ubuntu:~/lab$ [명령어 입력]\n-rw-r--r-- 2 student student 12 Nov 11 09:00 data-hard\nlrwxrwxrwx 1 student student 8 Nov 11 09:00 data-link -> data.txt\n-rw-r--r-- 2 student student 12 Nov 11 09:00 data.txt",
    "code": "ln data.txt data-hard\nln -s data.txt data-link\nls -i data.txt data-hard data-link\nls -l data.txt data-hard data-link",
    "hint": "두 종류의 링크를 생성한 뒤 inode 번호를 비교해 보세요. ls -l의 첫 글자와 파일 이름 앞의 링크 개수도 확인하세요.",
    "explanation": "하드 링크는 ln으로 생성하며 원본과 같은 inode 및 파일 내용을 공유합니다. 이름이 하나 추가되어 ls -l에서 링크 개수가 2가 됩니다. 기존 파일 이름을 삭제해도 남은 하드 링크로 파일 내용에 접근할 수 있습니다. 심볼릭 링크는 ln -s로 생성하며 파일의 경로를 가리키는 별도 inode를 가집니다. ls -l에 l과 '-> data.txt'가 표시됩니다. 원본 경로가 사라지면 심볼릭 링크는 끊어집니다. ls -i는 inode, ls -l은 파일 종류와 링크 개수 확인에 사용합니다.",
    "initialState": "student@ubuntu:~/lab$ ls -l data.txt\n-rw-r--r-- 1 student student 12 Nov 11 09:00 data.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nstudent@ubuntu:~/lab$ [명령어 입력]\nstudent@ubuntu:~/lab$ [명령어 입력]\n123456 data-hard\n123457 data-link\n123456 data.txt\nstudent@ubuntu:~/lab$ [명령어 입력]\n-rw-r--r-- 2 student student 12 Nov 11 09:00 data-hard\nlrwxrwxrwx 1 student student 8 Nov 11 09:00 data-link -> data.txt\n-rw-r--r-- 2 student student 12 Nov 11 09:00 data.txt",
    "commandParts": [
      {
        "token": "ln",
        "meaning": "같은 inode를 공유하는 하드 링크 생성"
      },
      {
        "token": "-s",
        "meaning": "경로를 가리키는 심볼릭 링크 생성"
      },
      {
        "token": "ls -i",
        "meaning": "파일별 inode 번호 비교"
      },
      {
        "token": "ls -l",
        "meaning": "링크 종류, 개수 및 연결 경로 확인"
      }
    ],
    "verification": "ls -i data.txt data-hard data-link\nls -l data.txt data-hard data-link",
    "verificationDetail": "data.txt와 data-hard는 inode 번호가 같고, data-link는 다릅니다. ls -l에서 data.txt와 data-hard의 링크 개수는 2이고, data-link는 l로 시작하며 -> data.txt가 표시됩니다.",
    "commonMistake": "하드 링크는 원본 파일의 복사본이 아닙니다. 심볼릭 링크의 화살표는 원본 경로 표시이지 동일한 inode를 뜻하지 않습니다. 하드 링크는 일반적으로 서로 다른 파일 시스템 사이에서 만들 수 없습니다.",
    "trace": [],
    "pptSource": "2장 44~50쪽",
    "outputNote": "inode 번호, 시간, 파일 크기는 예시입니다. 동일 inode 여부, 하드 링크 개수(2), 심볼릭 링크 표시(l, ->)를 확인하시오."
  },
  {
    "id": "LINUX-023",
    "language": "linux",
    "level": "기초 응용",
    "topic": "Vim 문서 편집",
    "title": "문장 입력 후 저장하기",
    "statement": "Vim에서 memo.txt를 새로 열고 첫 줄에 linux study를 입력하시오. 저장한 후 파일 내용을 확인하시오.",
    "input": "student@ubuntu:~/lab$ ls\n\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nlinux study",
    "code": "vim memo.txt\ncat memo.txt",
    "vimSteps": [
      "터미널에서 vim memo.txt를 실행하여 Vim을 여시오.",
      "Vim 안에서 i 키를 눌러 입력 모드로 전환하시오.",
      "linux study를 입력하시오. (첫 번째 줄의 파일 내용)",
      "Esc 키를 눌러 일반 모드로 돌아오시오.",
      ":wq를 입력하고 Enter를 눌러 저장한 뒤 Vim을 종료하시오.",
      "터미널에서 cat memo.txt를 실행하여 linux study가 출력되는지 확인하시오."
    ],
    "hint": "Vim의 입력 모드와 저장·종료 순서를 떠올려 보세요.",
    "explanation": "터미널에서 vim memo.txt 실행 → Vim 안에서 i 입력 → linux study 입력 → Esc → :wq 입력 후 Enter → 터미널에서 cat memo.txt로 확인한다.",
    "initialState": "student@ubuntu:~/lab$ ls\n\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nlinux study",
    "commandParts": [
      {
        "token": "vim",
        "meaning": "Vim 편집기로 문서 열기"
      },
      {
        "token": "i",
        "meaning": "커서 위치부터 입력"
      },
      {
        "token": "Esc",
        "meaning": "편집 모드 복귀"
      },
      {
        "token": ":wq",
        "meaning": "저장·종료"
      }
    ],
    "verification": "cat memo.txt",
    "verificationDetail": "터미널에서 vim memo.txt 실행 → Vim 안에서 i 입력 → linux study 입력 → Esc → :wq 입력 후 Enter → 터미널에서 cat memo.txt로 확인한다.",
    "commonMistake": "입력 모드에서 Esc를 누르지 않고 :wq를 입력하면 명령이 아니라 문서 내용에 입력될 수 있다.",
    "trace": [],
    "pptSource": "3장 5~7쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-024",
    "language": "linux",
    "level": "기초 응용",
    "topic": "Vim 문서 편집",
    "title": "특정 행 삭제하기",
    "statement": "Vim에서 memo.txt의 두 번째 줄을 삭제하시오. 파일을 저장한 후 남은 내용을 확인하시오.",
    "input": "student@ubuntu:~/lab$ cat memo.txt\none\ntwo\nthree\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\none\nthree",
    "code": "vim memo.txt",
    "vimSteps": [
      "터미널에서 vim memo.txt를 실행하여 Vim을 여시오.",
      "Vim 안에서 :2를 입력하고 Enter를 눌러 두 번째 줄로 이동하시오.",
      "일반 모드에서 dd 키를 차례로 눌러 현재 줄(two)을 삭제하시오.",
      ":wq를 입력하고 Enter를 눌러 저장한 뒤 Vim을 종료하시오.",
      "터미널에서 cat memo.txt를 실행하여 one과 three만 남았는지 확인하시오."
    ],
    "hint": "Vim에서는 현재 커서가 놓인 행을 기준으로 편집 명령을 실행합니다.",
    "explanation": "터미널에서 vim memo.txt 실행 → Vim 안에서 :2 입력 후 Enter로 두 번째 행 이동 → 일반 모드에서 dd로 행 삭제 → :wq 입력 후 Enter → 터미널에서 cat memo.txt로 확인한다.",
    "initialState": "student@ubuntu:~/lab$ cat memo.txt\none\ntwo\nthree\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\none\nthree",
    "commandParts": [
      {
        "token": "vim",
        "meaning": "Vim 문서 편집기"
      },
      {
        "token": ":2",
        "meaning": "두 번째 행으로 이동"
      },
      {
        "token": "dd",
        "meaning": "현재 행 삭제"
      },
      {
        "token": ":wq",
        "meaning": "저장·종료"
      }
    ],
    "verification": "cat memo.txt",
    "verificationDetail": "터미널에서 vim memo.txt 실행 → Vim 안에서 :2 입력 후 Enter로 두 번째 행 이동 → 일반 모드에서 dd로 행 삭제 → :wq 입력 후 Enter → 터미널에서 cat memo.txt로 확인한다.",
    "commonMistake": "dd는 한 글자가 아니라 커서의 현재 행을 삭제한다.",
    "trace": [],
    "pptSource": "3장 14쪽, 18~20쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-025",
    "language": "linux",
    "level": "기초 응용",
    "topic": "Vim 문서 편집",
    "title": "파일 전체 문자열 바꾸기",
    "statement": "Vim에서 memo.txt에 들어 있는 linux를 모두 Linux로 변경하시오. 저장한 후 바뀐 파일 내용을 확인하시오.",
    "input": "student@ubuntu:~/lab$ cat memo.txt\nlinux intro\nlearn linux\nlinux lab\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nLinux intro\nlearn Linux\nLinux lab",
    "code": "vim memo.txt",
    "vimSteps": [
      "터미널에서 vim memo.txt를 실행하여 Vim을 여시오.",
      "Vim 안에서 :%s/linux/Linux/g를 입력하고 Enter를 눌러 파일 전체의 linux를 Linux로 바꾸시오.",
      ":wq를 입력하고 Enter를 눌러 저장한 뒤 Vim을 종료하시오.",
      "터미널에서 cat memo.txt를 실행하여 모든 줄의 Linux 표기를 확인하시오."
    ],
    "hint": "일부만이 아니라 파일 전체를 대상으로 문자열을 바꾸어야 합니다.",
    "explanation": "터미널에서 vim memo.txt 실행 → Vim 안에서 :%s/linux/Linux/g 입력 후 Enter로 파일 전체 변경 → :wq 입력 후 Enter로 저장·종료 → 터미널에서 cat memo.txt로 확인한다.",
    "initialState": "student@ubuntu:~/lab$ cat memo.txt\nlinux intro\nlearn linux\nlinux lab\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nLinux intro\nlearn Linux\nLinux lab",
    "commandParts": [
      {
        "token": "vim",
        "meaning": "Vim 문서 편집기"
      },
      {
        "token": ":%s/linux/Linux/g",
        "meaning": "파일 전체의 문자열 모두 변경"
      },
      {
        "token": ":wq",
        "meaning": "저장·종료"
      }
    ],
    "verification": "cat memo.txt",
    "verificationDetail": "터미널에서 vim memo.txt 실행 → Vim 안에서 :%s/linux/Linux/g 입력 후 Enter로 파일 전체 변경 → :wq 입력 후 Enter로 저장·종료 → 터미널에서 cat memo.txt로 확인한다.",
    "commonMistake": "마지막 g가 빠지면 한 행의 모든 일치 항목을 바꾸지 못할 수 있다.",
    "trace": [],
    "pptSource": "3장 27~29쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-026",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 권한",
    "title": "기호 모드로 쓰기 권한 제거",
    "statement": "note.txt 파일의 소유자에게 부여된 쓰기 권한만 제거하시오. 다른 사용자의 권한은 그대로 두고 변경 결과를 확인하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]\n-rw-rw-r-- 1 student student 6 Nov 11 10:00 note.txt",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\n-r--rw-r-- 1 student student 6 Nov 11 10:00 note.txt",
    "code": "chmod u-w note.txt\nls -l note.txt",
    "hint": "권한 기호의 사용자·연산자·권한 문자를 구분한다.",
    "explanation": "소유자(u), 그룹(g), 기타 사용자(o)는 서로 다른 권한 대상입니다. `chmod u-w note.txt`에서 u는 소유자, -는 권한 제거, w는 쓰기 권한입니다. 즉 소유자의 쓰기 권한만 제거하고 그룹과 기타 사용자의 권한은 그대로 둡니다.\n\n초기 `-rw-rw-r--`는 소유자 rw-(6), 그룹 rw-(6), 기타 r--(4)입니다. 실행 후 `-r--rw-r--`가 되어 소유자 r--(4), 그룹 rw-(6), 기타 r--(4), 즉 664에서 464로 바뀝니다. `ls -l note.txt`로 확인합니다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]\n-rw-rw-r-- 1 student student 6 Nov 11 10:00 note.txt",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n-r--rw-r-- 1 student student 6 Nov 11 10:00 note.txt",
    "commandParts": [
      {
        "token": "chmod",
        "meaning": "파일 접근 권한 변경"
      },
      {
        "token": "u / g / o",
        "meaning": "소유자(user) / 그룹(group) / 기타 사용자(others)"
      },
      {
        "token": "- / +",
        "meaning": "지정한 권한 제거 / 추가"
      },
      {
        "token": "w",
        "meaning": "쓰기(write) 권한. 숫자값 2"
      },
      {
        "token": "u-w",
        "meaning": "소유자의 기존 쓰기 권한만 제거"
      },
      {
        "token": "ls -l",
        "meaning": "변경 전후 세 묶음의 권한 비교"
      }
    ],
    "verification": "ls -l note.txt",
    "verificationDetail": "변경 전 -rw-rw-r--(664), 변경 후 -r--rw-r--(464)입니다. 소유자 부분만 바뀌었는지 확인합니다.",
    "commonMistake": "u는 소유자이고 g는 그룹입니다. `u-w`는 소유자 변경이 아니라 소유자의 쓰기 권한만 제거하는 뜻입니다.",
    "trace": [],
    "pptSource": "5장 8~10쪽",
    "outputNote": "권한 이외의 파일 속성은 실습 환경에 따라 달라질 수 있습니다."
  },
  {
    "id": "LINUX-027",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 권한",
    "title": "그룹에 두 가지 권한 추가",
    "statement": "note.txt 파일의 그룹에 쓰기와 실행 권한을 추가하시오. 기존 읽기 권한은 유지하고 변경된 결과를 확인하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]\n-rw-r----- 1 student student 6 Nov 11 10:00 note.txt",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\n-rw-rwx--- 1 student student 6 Nov 11 10:00 note.txt",
    "code": "chmod g+wx note.txt\nls -l note.txt",
    "hint": "권한의 추가와 특정 값으로 덮어쓰기를 구별한다.",
    "explanation": "소유자(u), 그룹(g), 기타 사용자(o) 중 g는 파일에 지정된 그룹입니다. `chmod g+wx note.txt`의 +는 기존 권한을 유지한 채 새 권한을 추가한다는 뜻이고, w는 쓰기(2), x는 실행(1)입니다.\n\n초기 `-rw-r-----`에서 그룹 부분은 r--(4)입니다. 그룹에 w(2)와 x(1)를 더하면 4+2+1=7, 즉 rwx가 됩니다. 결과는 `-rw-rwx---`(소유자 6, 그룹 7, 기타 0 → 670)이며, 다른 두 묶음은 바뀌지 않습니다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]\n-rw-r----- 1 student student 6 Nov 11 10:00 note.txt",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n-rw-rwx--- 1 student student 6 Nov 11 10:00 note.txt",
    "commandParts": [
      {
        "token": "chmod",
        "meaning": "파일 접근 권한 변경"
      },
      {
        "token": "u / g / o",
        "meaning": "소유자 / 그룹 / 기타 사용자"
      },
      {
        "token": "g+wx",
        "meaning": "그룹의 기존 권한을 유지하면서 쓰기(w=2)와 실행(x=1) 추가"
      },
      {
        "token": "rwx = 7",
        "meaning": "읽기(4)+쓰기(2)+실행(1)"
      },
      {
        "token": "ls -l",
        "meaning": "그룹 부분이 r--에서 rwx로 변경되었는지 확인"
      }
    ],
    "verification": "ls -l note.txt",
    "verificationDetail": "출력은 -rw-r-----(640)에서 -rw-rwx---(670)으로 변경되며, 가운데 그룹 권한만 r--에서 rwx로 변합니다.",
    "commonMistake": "`+`는 기존 읽기 권한을 지우지 않습니다. 그룹 권한 7을 소유자나 기타 사용자에 적용하지 마세요.",
    "trace": [],
    "pptSource": "5장 8~11쪽",
    "outputNote": "파일 소유자와 수정 시각은 실습 환경에 따라 달라질 수 있습니다."
  },
  {
    "id": "LINUX-028",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 권한",
    "title": "기본 권한 마스크 문자로 확인",
    "statement": "현재 셸에서 사용하는 기본 파일 접근 권한 마스크를 문자 형식으로 출력하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nu=rwx,g=rx,o=rx",
    "code": "umask -S",
    "hint": "기본 권한을 확인하는 동작과 파일 권한을 바꾸는 동작을 구별한다.",
    "explanation": "`umask -S`는 현재 셸의 기본 권한 마스크를 사람이 읽기 쉬운 문자 형식으로 보여줍니다. 예시 `u=rwx,g=rx,o=rx`에서 u는 소유자, g는 그룹, o는 기타 사용자이고 r/w/x는 읽기/쓰기/실행입니다. 이 출력은 새 파일·디렉터리를 만들 때 적용되는 기본 권한 제한을 이해하기 위한 것이며, 기존 파일 하나의 현재 권한을 표시하거나 변경한 결과는 아닙니다. 실제 값은 셸 설정에 따라 달라질 수 있습니다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nu=rwx,g=rx,o=rx",
    "commandParts": [
      {
        "token": "umask -S",
        "meaning": "기본 권한 마스크를 문자 형식으로 표시"
      },
      {
        "token": "u / g / o",
        "meaning": "소유자 / 그룹 / 기타 사용자"
      },
      {
        "token": "r / w / x",
        "meaning": "읽기=4 / 쓰기=2 / 실행=1"
      },
      {
        "token": "022 (예시)",
        "meaning": "일반 파일 666 → 644, 디렉터리 777 → 755"
      },
      {
        "token": "chmod와 차이",
        "meaning": "umask는 생성 기본값, chmod는 기존 권한 변경"
      }
    ],
    "verification": "umask -S",
    "verificationDetail": "u=rwx,g=rx,o=rx는 일반적인 umask 022의 문자 표현 예시이며 실제 값은 환경마다 다릅니다. 새 일반 파일의 실행 권한은 별도로 구분합니다.",
    "commonMistake": "기본 umask 값은 시스템 설정에 따라 달라질 수 있다.",
    "trace": [],
    "pptSource": "5장 20쪽",
    "outputNote": "표시된 값은 일반적인 설정의 예시입니다. 실제 기본 권한은 시스템 설정에 따라 다를 수 있습니다."
  },
  {
    "id": "LINUX-029",
    "language": "linux",
    "level": "기초 응용",
    "topic": "셸 출력",
    "title": "줄바꿈 없이 문자열 출력하기",
    "statement": "Hello라는 문자열을 출력하되, 출력 끝에 줄바꿈 문자가 추가되지 않도록 하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nHellostudent@ubuntu:~/lab$ ",
    "code": "echo -n Hello",
    "hint": "문자열의 내용과 출력 끝의 줄바꿈을 구별한다.",
    "explanation": "echo -n은 문자열 출력 후 줄바꿈을 추가하지 않는다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nHellostudent@ubuntu:~/lab$ ",
    "commandParts": [
      {
        "token": "echo",
        "meaning": "문자열 출력"
      },
      {
        "token": "-n",
        "meaning": "출력 끝의 줄바꿈 생략"
      }
    ],
    "verification": "echo -n Hello",
    "verificationDetail": "echo -n은 문자열 출력 후 줄바꿈을 추가하지 않는다.",
    "commonMistake": "-n은 출력 문자열을 지우는 옵션이 아니다.",
    "trace": [],
    "pptSource": "4장 4쪽",
    "outputNote": "Hello 뒤에 새 줄 없이 다음 프롬프트가 이어서 나타나는 상태를 표현했습니다."
  },
  {
    "id": "LINUX-030",
    "language": "linux",
    "level": "기초 응용",
    "topic": "셸 출력",
    "title": "정수와 줄바꿈 형식 지정",
    "statement": "정수 12를 십진 정수 형식으로 출력한 뒤 줄바꿈하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\n12",
    "code": "printf '%d\\n' 12",
    "hint": "서식 지정 문자와 줄바꿈 문자의 기능을 구분한다.",
    "explanation": "printf의 %d는 십진 정수, \\n은 줄바꿈을 뜻한다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n12",
    "commandParts": [
      {
        "token": "printf",
        "meaning": "출력 형식을 지정하여 출력"
      },
      {
        "token": "%d",
        "meaning": "십진 정수 형식"
      },
      {
        "token": "\\n",
        "meaning": "줄바꿈"
      }
    ],
    "verification": "printf '%d\\n' 12",
    "verificationDetail": "printf의 %d는 십진 정수, \\n은 줄바꿈을 뜻한다.",
    "commonMistake": "서식 문자열에서 줄바꿈 기호를 빠뜨리면 출력 끝에 개행이 없다.",
    "trace": [],
    "pptSource": "4장 5쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-031",
    "language": "linux",
    "level": "기초 응용",
    "topic": "셸 특수문자",
    "title": "변숫값과 문자 그대로 출력 비교",
    "statement": "SHELL 환경 변수에 저장된 경로를 출력하시오. 이어서 변수 대신 $SHELL이라는 글자가 그대로 나오도록 출력하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\n/bin/bash\nstudent@ubuntu:~/lab$ [명령어 입력]\n$SHELL",
    "code": "echo \"$SHELL\"\necho '$SHELL'",
    "hint": "작은따옴표와 큰따옴표에서 변수 해석이 다른 점을 생각한다.",
    "explanation": "큰따옴표 안에서는 $SHELL 변수를 확장하며 작은따옴표 안에서는 문자 그대로 출력한다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n/bin/bash\nstudent@ubuntu:~/lab$ [명령어 입력]\n$SHELL",
    "commandParts": [
      {
        "token": "echo",
        "meaning": "문자열 출력"
      },
      {
        "token": "큰따옴표",
        "meaning": "환경 변수 확장 허용"
      },
      {
        "token": "작은따옴표",
        "meaning": "특수문자 해석 억제"
      }
    ],
    "verification": "echo '$SHELL'",
    "verificationDetail": "큰따옴표 안에서는 $SHELL 변수를 확장하며 작은따옴표 안에서는 문자 그대로 출력한다.",
    "commonMistake": "두 인용 부호를 바꾸면 출력 내용이 달라진다.",
    "trace": [],
    "pptSource": "4장 10쪽",
    "outputNote": "SHELL 값은 로그인 셸 설정에 따라 달라질 수 있습니다."
  },
  {
    "id": "LINUX-032",
    "language": "linux",
    "level": "기초 응용",
    "topic": "셸 리다이렉션",
    "title": "출력을 파일에 저장하기",
    "statement": "hello 문자열을 화면에 출력하지 말고 result.txt 파일에 저장하시오. 저장한 파일의 내용을 확인하시오.",
    "input": "student@ubuntu:~/lab$ ls\nnote.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nhello",
    "code": "echo hello > result.txt",
    "hint": "표준 출력과 출력 파일을 연결하는 문법을 생각한다.",
    "explanation": "출력 리다이렉션 >는 명령의 표준 출력을 파일로 보낸다. 파일이 이미 있으면 내용을 대체한다.",
    "initialState": "student@ubuntu:~/lab$ ls\nnote.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nhello",
    "commandParts": [
      {
        "token": "echo",
        "meaning": "문자열 출력"
      },
      {
        "token": ">",
        "meaning": "출력 결과를 파일에 저장"
      }
    ],
    "verification": "cat result.txt",
    "verificationDetail": "출력 리다이렉션 >는 명령의 표준 출력을 파일로 보낸다. 파일이 이미 있으면 내용을 대체한다.",
    "commonMistake": "기존 파일에서 >를 사용하면 원래 내용이 지워질 수 있다.",
    "trace": [],
    "pptSource": "4장 13~15쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-033",
    "language": "linux",
    "level": "기초 응용",
    "topic": "셸 리다이렉션",
    "title": "기존 파일 끝에 내용 추가",
    "statement": "result.txt 파일의 기존 hello 아래에 world를 새 줄로 추가하시오. 기존 내용을 유지한 상태에서 파일 전체를 확인하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]\nhello",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nhello\nworld",
    "code": "echo world >> result.txt\ncat result.txt",
    "hint": "내용을 덮어쓰는 경우와 끝에 추가하는 경우를 구별한다.",
    "explanation": "출력 리다이렉션 >>는 기존 내용 뒤에 출력 결과를 이어 붙인다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]\nhello",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nhello\nworld",
    "commandParts": [
      {
        "token": "echo",
        "meaning": "문자열 출력"
      },
      {
        "token": ">>",
        "meaning": "파일 끝에 출력 결과 추가"
      },
      {
        "token": "cat",
        "meaning": "내용 확인"
      }
    ],
    "verification": "cat result.txt",
    "verificationDetail": "출력 리다이렉션 >>는 기존 내용 뒤에 출력 결과를 이어 붙인다.",
    "commonMistake": "기존 내용을 보존하려면 >가 아니라 >>를 사용한다.",
    "trace": [],
    "pptSource": "4장 17쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-034",
    "language": "linux",
    "level": "기초 응용",
    "topic": "셸 에일리어스",
    "title": "명령어 별명 설정과 확인",
    "statement": "현재 셸에서 ls 명령을 실행할 때 파일 종류 기호를 함께 표시하도록 별명을 설정하시오. 등록한 별명을 확인하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nalias ls='ls -F'",
    "code": "alias ls='ls -F'\nalias",
    "hint": "자주 쓰는 명령어에 기본 옵션을 지정한 뒤 등록된 별명 목록을 확인한다.",
    "explanation": "alias ls='ls -F'는 ls를 입력할 때 파일 종류를 표시하는 -F 옵션을 기본 적용하도록 별명을 지정한다. 인자 없이 alias를 실행하면 현재 별명 설정을 확인할 수 있다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nalias ls='ls -F'",
    "commandParts": [
      {
        "token": "alias",
        "meaning": "명령어의 별명을 등록하거나 목록 조회"
      },
      {
        "token": "ls -F",
        "meaning": "목록에 파일 종류 구분 기호를 표시"
      }
    ],
    "verification": "alias",
    "verificationDetail": "alias 목록에 ls='ls -F'가 표시되면 설정이 완료된 것이다.",
    "commonMistake": "ls 명령 자체를 변경하는 것이 아니라 현재 셸에 적용되는 별명을 만드는 것이다.",
    "trace": [],
    "pptSource": "4장 22~25쪽",
    "outputNote": "여러 별명이 등록된 환경에서는 다른 별명들도 함께 표시됩니다."
  },
  {
    "id": "LINUX-035",
    "language": "linux",
    "level": "기초 응용",
    "topic": "셸 명령 연결",
    "title": "세 가지 명령을 차례로 실행",
    "statement": "현재 날짜와 시각을 표시하고, 이어서 현재 폴더의 목록과 작업 디렉터리 경로를 순서대로 출력하시오.",
    "input": "student@ubuntu:~/lab$ ls\ndocs  note.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nWed Nov 11 10:00:00 KST 2026\ndocs  note.txt\n/home/student/lab",
    "code": "date; ls; pwd",
    "hint": "명령어 사이의 구분 기호가 실행 순서에 미치는 영향을 생각한다.",
    "explanation": "세미콜론은 연결된 명령을 왼쪽부터 순서대로 실행한다.",
    "initialState": "student@ubuntu:~/lab$ ls\ndocs  note.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nWed Nov 11 10:00:00 KST 2026\ndocs  note.txt\n/home/student/lab",
    "commandParts": [
      {
        "token": "date",
        "meaning": "현재 날짜와 시간 출력"
      },
      {
        "token": ";",
        "meaning": "명령을 왼쪽부터 차례로 실행"
      },
      {
        "token": "ls",
        "meaning": "디렉터리 목록"
      },
      {
        "token": "pwd",
        "meaning": "작업 경로"
      }
    ],
    "verification": "date; ls; pwd",
    "verificationDetail": "세미콜론은 연결된 명령을 왼쪽부터 순서대로 실행한다.",
    "commonMistake": "세미콜론은 왼쪽 명령의 결과를 오른쪽 입력으로 전달하는 파이프와 다르다.",
    "trace": [],
    "pptSource": "1장 35쪽, 2장 10·13쪽, 4장 9쪽",
    "outputNote": "날짜·시간·파일 목록은 실습하는 시점과 컴퓨터 상태에 따라 달라집니다."
  },
  {
    "id": "LINUX-036",
    "language": "linux",
    "level": "기초 응용",
    "topic": "프로세스",
    "title": "현재 터미널 프로세스 상세 보기",
    "statement": "현재 터미널에서 실행 중인 프로세스의 PID, 부모 프로세스 번호(PPID), 실행 명령 등 자세한 정보를 출력하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nUID          PID    PPID  C STIME TTY          TIME CMD\nstudent     1842    1841  0 10:00 pts/0    00:00:00 bash\nstudent     1901    1842  0 10:05 pts/0    00:00:00 ps -f",
    "code": "ps -f",
    "hint": "기본 프로세스 목록과 상세 목록 항목을 비교한다.",
    "explanation": "ps -f는 현재 터미널 관련 프로세스의 상세 정보를 표시한다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nUID          PID    PPID  C STIME TTY          TIME CMD\nstudent     1842    1841  0 10:00 pts/0    00:00:00 bash\nstudent     1901    1842  0 10:05 pts/0    00:00:00 ps -f",
    "commandParts": [
      {
        "token": "ps",
        "meaning": "프로세스 목록 출력"
      },
      {
        "token": "-f",
        "meaning": "상세 정보 출력"
      }
    ],
    "verification": "ps -f",
    "verificationDetail": "ps -f는 현재 터미널 관련 프로세스의 상세 정보를 표시한다.",
    "commonMistake": "PID와 부모 PID인 PPID는 서로 다른 값이다.",
    "trace": [],
    "pptSource": "6장 4~5쪽",
    "outputNote": "PID, PPID, 시각 및 프로세스 수는 실행할 때마다 달라집니다."
  },
  {
    "id": "LINUX-037",
    "language": "linux",
    "level": "기초 응용",
    "topic": "프로세스",
    "title": "시스템 전체 프로세스 자세히 보기",
    "statement": "현재 터미널뿐 아니라 시스템 전체에서 실행 중인 프로세스의 상세 정보를 출력하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nUID          PID    PPID  C STIME TTY          TIME CMD\nroot           1       0  0 09:00 ?        00:00:02 /sbin/init\nstudent     1842    1841  0 10:00 pts/0    00:00:00 bash",
    "code": "ps -ef",
    "hint": "전체 범위 선택 옵션과 상세 항목 선택 옵션을 결합한다.",
    "explanation": "ps -ef는 유닉스 형식의 -e 전체와 -f 상세 출력 옵션을 함께 적용한다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nUID          PID    PPID  C STIME TTY          TIME CMD\nroot           1       0  0 09:00 ?        00:00:02 /sbin/init\nstudent     1842    1841  0 10:00 pts/0    00:00:00 bash",
    "commandParts": [
      {
        "token": "ps",
        "meaning": "프로세스 정보"
      },
      {
        "token": "-e",
        "meaning": "전체 프로세스"
      },
      {
        "token": "-f",
        "meaning": "상세 프로세스 정보"
      }
    ],
    "verification": "ps -ef",
    "verificationDetail": "ps -ef는 유닉스 형식의 -e 전체와 -f 상세 출력 옵션을 함께 적용한다.",
    "commonMistake": "ps -f만 사용하면 시스템 전체가 아니라 현재 터미널 중심의 정보가 표시된다.",
    "trace": [],
    "pptSource": "6장 4쪽, 9쪽",
    "outputNote": "이 출력은 전체 목록 중 일부를 보여주는 예시입니다. 실행 중인 프로세스는 환경마다 다릅니다."
  },
  {
    "id": "LINUX-038",
    "language": "linux",
    "level": "기초 응용",
    "topic": "프로세스",
    "title": "bash 프로세스 이름 함께 검색",
    "statement": "이름에 bash가 포함된 프로세스의 PID와 프로세스 이름을 함께 출력하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\n1842 bash",
    "code": "pgrep -l bash",
    "hint": "PID만 확인하는 방법과 이름까지 확인하는 방법을 구별한다.",
    "explanation": "pgrep -l은 패턴에 일치하는 프로세스의 PID와 이름을 보여준다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n1842 bash",
    "commandParts": [
      {
        "token": "pgrep",
        "meaning": "프로세스 패턴 검색"
      },
      {
        "token": "-l",
        "meaning": "PID와 이름 출력"
      }
    ],
    "verification": "pgrep -l bash",
    "verificationDetail": "pgrep -l은 패턴에 일치하는 프로세스의 PID와 이름을 보여준다.",
    "commonMistake": "검색 결과의 PID 값은 실행 시점마다 달라질 수 있다.",
    "trace": [],
    "pptSource": "6장 14~15쪽",
    "outputNote": "프로세스 PID 및 검색 결과의 개수는 실행할 때마다 달라질 수 있습니다."
  },
  {
    "id": "LINUX-039",
    "language": "linux",
    "level": "기초 응용",
    "topic": "프로세스",
    "title": "CPU·메모리 사용량 함께 확인",
    "statement": "시스템에서 실행 중인 프로세스의 사용자 이름, CPU 사용 비율, 메모리 사용 비율을 함께 출력하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nUSER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nstudent     1842  0.0  0.1  10560  5200 pts/0    Ss   10:00   0:00 bash",
    "code": "ps aux",
    "hint": "BSD 옵션은 하이픈 없이 사용하는 형식이다.",
    "explanation": "ps aux는 BSD 형식으로 전체 프로세스의 자세한 자원 사용량을 표시한다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nUSER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nstudent     1842  0.0  0.1  10560  5200 pts/0    Ss   10:00   0:00 bash",
    "commandParts": [
      {
        "token": "ps",
        "meaning": "프로세스 목록"
      },
      {
        "token": "a",
        "meaning": "터미널 관련 프로세스"
      },
      {
        "token": "u",
        "meaning": "사용자와 자원 사용량 상세"
      },
      {
        "token": "x",
        "meaning": "시스템 전체 프로세스"
      }
    ],
    "verification": "ps aux",
    "verificationDetail": "ps aux는 BSD 형식으로 전체 프로세스의 자세한 자원 사용량을 표시한다.",
    "commonMistake": "BSD 방식의 aux 앞에는 하이픈을 붙이지 않는다.",
    "trace": [],
    "pptSource": "6장 4쪽, 11쪽",
    "outputNote": "전체 목록 중 일부를 표시한 예시입니다. CPU·메모리 사용 비율과 PID는 매번 달라집니다."
  },
  {
    "id": "LINUX-040",
    "language": "linux",
    "level": "기초 응용",
    "topic": "디스크",
    "title": "파일 시스템의 남은 공간 확인",
    "statement": "현재 파일 시스템의 전체 용량, 사용한 공간, 남은 공간을 GB·MB 등 읽기 쉬운 단위로 표시하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nFilesystem      Size  Used Avail Use% Mounted on\n/dev/sda2        40G   12G   26G  32% /",
    "code": "df -h",
    "hint": "파일 시스템 전체 용량과 개별 디렉터리 사용량은 서로 다른 항목이다.",
    "explanation": "df -h는 파일 시스템별 용량을 사람이 읽기 쉬운 크기 단위로 출력한다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nFilesystem      Size  Used Avail Use% Mounted on\n/dev/sda2        40G   12G   26G  32% /",
    "commandParts": [
      {
        "token": "df",
        "meaning": "파일 시스템별 사용량"
      },
      {
        "token": "-h",
        "meaning": "읽기 쉬운 크기 단위"
      }
    ],
    "verification": "df -h",
    "verificationDetail": "df -h는 파일 시스템별 용량을 사람이 읽기 쉬운 크기 단위로 출력한다.",
    "commonMistake": "df 결과는 디스크 상태에 따라 달라진다.",
    "trace": [],
    "pptSource": "7장 2~4쪽",
    "outputNote": "표에 제시된 용량과 장치명은 예시이며 실제 디스크 상태에 따라 달라집니다."
  },
  {
    "id": "LINUX-041",
    "language": "linux",
    "level": "종합 활용",
    "topic": "디스크 종합",
    "title": "파일 시스템 유형과 폴더 사용량 비교",
    "statement": "먼저 파일 시스템의 종류를 확인하시오. 이어서 docs 폴더가 사용하는 전체 공간을 읽기 쉬운 단위로 출력하시오.",
    "input": "student@ubuntu:~/lab$ ls docs\nnote.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nFilesystem     Type     1K-blocks    Used Available Use% Mounted on\n/dev/sda2      ext4      41943040 12582912  27262976  32% /\nstudent@ubuntu:~/lab$ [명령어 입력]\n4.0K    docs",
    "code": "df -T\ndu -sh docs",
    "hint": "파일 시스템 단위 통계와 디렉터리 단위 통계를 구별한다.",
    "explanation": "df -T는 파일 시스템 종류를 보여준다. du의 -s와 -h는 지정한 디렉터리의 합계 사용량을 읽기 쉬운 단위로 표시한다.",
    "initialState": "student@ubuntu:~/lab$ ls docs\nnote.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nFilesystem     Type     1K-blocks    Used Available Use% Mounted on\n/dev/sda2      ext4      41943040 12582912  27262976  32% /\nstudent@ubuntu:~/lab$ [명령어 입력]\n4.0K    docs",
    "commandParts": [
      {
        "token": "df",
        "meaning": "파일 시스템별 정보"
      },
      {
        "token": "-T",
        "meaning": "파일 시스템 종류 표시"
      },
      {
        "token": "du",
        "meaning": "디렉터리 디스크 사용량"
      },
      {
        "token": "-s",
        "meaning": "사용량 합계"
      },
      {
        "token": "-h",
        "meaning": "읽기 쉬운 단위"
      }
    ],
    "verification": "du -sh docs",
    "verificationDetail": "df -T는 파일 시스템 종류를 보여준다. du의 -s와 -h는 지정한 디렉터리의 합계 사용량을 읽기 쉬운 단위로 표시한다.",
    "commonMistake": "df와 du가 나타내는 사용량의 측정 대상은 서로 다르다.",
    "trace": [],
    "pptSource": "7장 2·5~8쪽",
    "outputNote": "파일 시스템과 폴더의 용량은 예시입니다. 실제 출력은 컴퓨터에 따라 달라집니다."
  },
  {
    "id": "LINUX-042",
    "language": "linux",
    "level": "종합 활용",
    "topic": "프로세스 종합",
    "title": "전체 목록에서 특정 이름의 프로세스 찾기",
    "statement": "시스템 전체 프로세스의 상세 목록에서 bash라는 문자열이 들어 있는 줄만 검색하여 출력하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nstudent     1842    1841  0 10:00 pts/0    00:00:00 bash\nstudent     1907    1842  0 10:05 pts/0    00:00:00 grep bash",
    "code": "ps -ef | grep bash",
    "hint": "앞 명령의 출력 결과를 뒤 명령의 검색 입력으로 전달한다.",
    "explanation": "|는 앞 명령의 출력을 뒤 명령의 입력으로 연결한다. ps -ef 결과를 grep이 검색한다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nstudent     1842    1841  0 10:00 pts/0    00:00:00 bash\nstudent     1907    1842  0 10:05 pts/0    00:00:00 grep bash",
    "commandParts": [
      {
        "token": "ps -ef",
        "meaning": "전체 프로세스 상세 목록"
      },
      {
        "token": "",
        "meaning": "\\"
      },
      {
        "token": "",
        "meaning": "앞 명령 출력을 뒤 명령 입력으로 전달"
      },
      {
        "token": "grep",
        "meaning": "문자열이 있는 행 검색"
      }
    ],
    "verification": "ps -ef | grep bash",
    "verificationDetail": "|는 앞 명령의 출력을 뒤 명령의 입력으로 연결한다. ps -ef 결과를 grep이 검색한다.",
    "commonMistake": "검색 명령 자신이 검색 결과에 포함될 수도 있다.",
    "trace": [],
    "pptSource": "6장 9쪽, 13쪽, 2장 53쪽",
    "outputNote": "프로세스 정보는 예시입니다. 검색을 수행하는 grep 자신이 결과에 포함될 수도 있습니다."
  },
  {
    "id": "LINUX-043",
    "language": "linux",
    "level": "종합 활용",
    "topic": "시스템 종료",
    "title": "예정된 시스템 재시작 취소하기",
    "statement": "시스템 재시작이 예약되어 있을 때 해당 예약을 취소하는 명령을 작성하시오. 실제 시스템을 종료하거나 재시작하지 않고 예약 취소 명령만 작성하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nstudent@ubuntu:~/lab$ ",
    "code": "shutdown -c",
    "hint": "시스템 종료 예약과 기존 예약의 취소 기능을 구분한다.",
    "explanation": "shutdown -c는 이전에 예약한 shutdown 작업을 취소한다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nstudent@ubuntu:~/lab$ ",
    "commandParts": [
      {
        "token": "shutdown",
        "meaning": "시스템 종료 관리"
      },
      {
        "token": "-c",
        "meaning": "기존 shutdown 예약 취소"
      }
    ],
    "verification": "shutdown -c",
    "verificationDetail": "shutdown -c는 이전에 예약한 shutdown 작업을 취소한다.",
    "commonMistake": "shutdown -r과 -h는 실제로 시스템을 재시작하거나 종료할 수 있으므로 이 문제에서는 사용하지 않는다.",
    "trace": [],
    "pptSource": "8장 3~5쪽",
    "outputNote": "취소할 예약이 없으면 오류 또는 안내 메시지가 표시될 수 있습니다. 이 문제는 예약 취소 방법을 학습하는 상황입니다."
  },
  {
    "id": "LINUX-044",
    "language": "linux",
    "level": "종합 활용",
    "topic": "패키지 관리",
    "title": "패키지 검색 후 의존성 확인",
    "statement": "APT 캐시에서 이름이나 설명에 vim이 들어 있는 패키지를 검색하시오. 이어서 vim 패키지의 의존성 정보를 조회하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nvim - Vi IMproved - enhanced vi editor\nvim-common - Vi IMproved - Common files\nstudent@ubuntu:~/lab$ [명령어 입력]\nPackage: vim\nVersions:",
    "code": "apt-cache search vim\napt-cache showpkg vim",
    "hint": "키워드 검색과 특정 패키지의 의존성 검색을 구분한다.",
    "explanation": "apt-cache search는 키워드 검색, showpkg는 패키지 의존성 및 역의존성 정보 표시다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nvim - Vi IMproved - enhanced vi editor\nvim-common - Vi IMproved - Common files\nstudent@ubuntu:~/lab$ [명령어 입력]\nPackage: vim\nVersions:",
    "commandParts": [
      {
        "token": "apt-cache",
        "meaning": "APT 캐시 정보 조회"
      },
      {
        "token": "search",
        "meaning": "키워드로 패키지 검색"
      },
      {
        "token": "showpkg",
        "meaning": "패키지 의존성 정보 조회"
      }
    ],
    "verification": "apt-cache showpkg vim",
    "verificationDetail": "apt-cache search는 키워드 검색, showpkg는 패키지 의존성 및 역의존성 정보 표시다.",
    "commonMistake": "패키지 설치가 아니라 저장된 패키지 정보만 확인하는 문제다.",
    "trace": [],
    "pptSource": "9장 3쪽, 6~8쪽",
    "outputNote": "패키지 목록과 버전 정보는 길거나 달라질 수 있어 출력 일부만 예시로 제시했습니다."
  },
  {
    "id": "LINUX-045",
    "language": "linux",
    "level": "종합 활용",
    "topic": "파일 아카이브",
    "title": "디렉터리를 묶고 목록 확인하기",
    "statement": "docs 폴더와 그 안의 note.txt 파일을 backup.tar 파일로 묶으시오. 이어서 아카이브 안에 들어 있는 파일 목록을 확인하시오.",
    "input": "student@ubuntu:~/lab$ ls -R docs\ndocs:\nnote.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\ndrwxr-xr-x student/student   0 2026-11-11 10:00 docs/\n-rw-r--r-- student/student   6 2026-11-11 10:00 docs/note.txt",
    "code": "tar cvf backup.tar docs\ntar tvf backup.tar",
    "hint": "아카이브 생성 기능과 내용 보기 기능을 구분한다.",
    "explanation": "tar c는 새 아카이브 생성, t는 목록 출력, v는 처리 파일 표시, f는 아카이브 이름 지정이다.",
    "initialState": "student@ubuntu:~/lab$ ls -R docs\ndocs:\nnote.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\ndrwxr-xr-x student/student   0 2026-11-11 10:00 docs/\n-rw-r--r-- student/student   6 2026-11-11 10:00 docs/note.txt",
    "commandParts": [
      {
        "token": "tar",
        "meaning": "아카이브 관리"
      },
      {
        "token": "c",
        "meaning": "새 아카이브 생성"
      },
      {
        "token": "t",
        "meaning": "아카이브 내용 출력"
      },
      {
        "token": "v",
        "meaning": "파일 이름 등 표시"
      },
      {
        "token": "f",
        "meaning": "아카이브 파일 지정"
      }
    ],
    "verification": "tar tvf backup.tar",
    "verificationDetail": "tar c는 새 아카이브 생성, t는 목록 출력, v는 처리 파일 표시, f는 아카이브 이름 지정이다.",
    "commonMistake": "아카이브를 생성해도 docs의 원본 파일은 유지된다.",
    "trace": [],
    "pptSource": "9장 20~23쪽",
    "outputNote": "아카이브에 기록되는 파일 크기·권한·시각은 예시입니다."
  },
  {
    "id": "LINUX-046",
    "language": "linux",
    "level": "종합 활용",
    "topic": "파일 아카이브",
    "title": "기존 아카이브 파일 추출하기",
    "statement": "현재 폴더에 있는 backup.tar 아카이브에서 docs 폴더와 note.txt 파일을 추출하시오. 추출한 파일을 확인하시오.",
    "input": "student@ubuntu:~/lab$ ls\nbackup.tar\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\ndocs/\ndocs/note.txt",
    "code": "tar xvf backup.tar",
    "hint": "아카이브 생성, 내용 확인, 추출의 기능 문자를 비교한다.",
    "explanation": "tar xvf는 아카이브의 원래 파일을 추출한다.",
    "initialState": "student@ubuntu:~/lab$ ls\nbackup.tar\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\ndocs/\ndocs/note.txt",
    "commandParts": [
      {
        "token": "tar",
        "meaning": "아카이브 관리"
      },
      {
        "token": "x",
        "meaning": "원본 파일 추출"
      },
      {
        "token": "v",
        "meaning": "파일명 표시"
      },
      {
        "token": "f",
        "meaning": "아카이브 파일 지정"
      }
    ],
    "verification": "ls -R docs",
    "verificationDetail": "tar xvf는 아카이브의 원래 파일을 추출한다.",
    "commonMistake": "이미 같은 경로에 파일이 있으면 추출 과정에서 영향을 받을 수 있다.",
    "trace": [],
    "pptSource": "9장 20~24쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-047",
    "language": "linux",
    "level": "종합 활용",
    "topic": "파일 압축",
    "title": "압축 후 압축 파일의 내용 확인",
    "statement": "report.txt 파일을 gzip 형식으로 압축하시오. 압축을 해제하지 않고 압축된 파일의 내용을 화면에 출력하시오.",
    "input": "student@ubuntu:~/lab$ cat report.txt\nhello\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nstudent@ubuntu:~/lab$ [명령어 입력]\nhello",
    "code": "gzip report.txt\nzcat report.txt.gz",
    "hint": "압축 파일 자체를 읽는 방식과 압축을 푸는 방식을 구별한다.",
    "explanation": "gzip은 .gz 압축 파일을 생성한다. zcat은 gzip 압축 파일의 내용을 화면에 출력한다.",
    "initialState": "student@ubuntu:~/lab$ cat report.txt\nhello\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nstudent@ubuntu:~/lab$ [명령어 입력]\nhello",
    "commandParts": [
      {
        "token": "gzip",
        "meaning": "파일을 gzip 형식으로 압축"
      },
      {
        "token": "zcat",
        "meaning": "gzip 압축 파일 내용을 출력"
      }
    ],
    "verification": "zcat report.txt.gz",
    "verificationDetail": "gzip은 .gz 압축 파일을 생성한다. zcat은 gzip 압축 파일의 내용을 화면에 출력한다.",
    "commonMistake": "gzip 실행 후에는 원본 report.txt가 사라질 수 있다.",
    "trace": [],
    "pptSource": "9장 28~30쪽",
    "outputNote": ""
  },
  {
    "id": "LINUX-048",
    "language": "linux",
    "level": "종합 활용",
    "topic": "사용자 정보",
    "title": "로그인 사용자와 소속 그룹 확인",
    "statement": "현재 시스템에 로그인한 사용자의 정보를 제목과 함께 출력하시오. 이어서 현재 사용자가 속한 그룹을 출력하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nNAME     LINE         TIME             COMMENT\nstudent  pts/0        2026-11-11 10:00\nstudent@ubuntu:~/lab$ [명령어 입력]\nstudent adm cdrom sudo dip plugdev",
    "code": "who -H\ngroups",
    "hint": "현재 접속한 사용자 정보와 계정의 그룹 소속 정보를 구분한다.",
    "explanation": "who -H는 로그인 사용자 정보의 제목을 함께 표시하고 groups는 사용자 소속 그룹을 보여준다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nNAME     LINE         TIME             COMMENT\nstudent  pts/0        2026-11-11 10:00\nstudent@ubuntu:~/lab$ [명령어 입력]\nstudent adm cdrom sudo dip plugdev",
    "commandParts": [
      {
        "token": "who",
        "meaning": "현재 로그인 사용자 정보"
      },
      {
        "token": "-H",
        "meaning": "출력 항목 제목 표시"
      },
      {
        "token": "groups",
        "meaning": "소속 그룹 확인"
      }
    ],
    "verification": "groups",
    "verificationDetail": "who -H는 로그인 사용자 정보의 제목을 함께 표시하고 groups는 사용자 소속 그룹을 보여준다.",
    "commonMistake": "로그인 사용자 수와 그룹 수는 서로 다른 개념이다.",
    "trace": [],
    "pptSource": "10장 41~42쪽, 45쪽",
    "outputNote": "로그인 상태와 사용자 그룹 설정에 따라 출력 내용은 달라질 수 있습니다."
  },
  {
    "id": "LINUX-049",
    "language": "linux",
    "level": "종합 활용",
    "topic": "작업 예약",
    "title": "현재 예약된 반복 작업 확인",
    "statement": "현재 사용자에게 등록된 반복 실행 예약 작업을 확인하시오. 예약 작업이 없는 경우 표시되는 메시지도 확인하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nno crontab for student",
    "code": "crontab -l",
    "hint": "반복 작업 조회와 반복 작업 편집·삭제를 구별한다.",
    "explanation": "crontab -l은 현재 사용자에게 등록된 반복 실행 예약 내용을 조회한다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nno crontab for student",
    "commandParts": [
      {
        "token": "crontab",
        "meaning": "반복 작업 예약 관리"
      },
      {
        "token": "-l",
        "meaning": "crontab 파일의 내용 출력"
      }
    ],
    "verification": "crontab -l",
    "verificationDetail": "crontab -l은 현재 사용자에게 등록된 반복 실행 예약 내용을 조회한다.",
    "commonMistake": "-e는 편집, -r은 삭제이므로 조회용 -l과 구분한다.",
    "trace": [],
    "pptSource": "6장 37~39쪽",
    "outputNote": "예시는 현재 사용자에게 등록된 crontab이 없는 경우입니다. 예약된 작업이 있다면 해당 작업 목록이 표시됩니다."
  },
  {
    "id": "LINUX-050",
    "language": "linux",
    "level": "종합 활용",
    "topic": "사용자 계정",
    "title": "사용자 생성 기본 설정 확인",
    "statement": "새 계정을 만들지 않고 사용자 계정 생성 명령의 기본 그룹·홈 디렉터리·셸 설정을 출력하시오.",
    "input": "student@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nGROUP=100\nHOME=/home\nINACTIVE=-1\nEXPIRE=\nSHELL=/bin/sh\nSKEL=/etc/skel\nCREATE_MAIL_SPOOL=no",
    "code": "useradd -D",
    "hint": "사용자 계정 생성과 계정 생성 시 사용할 기본값 확인을 구별한다.",
    "explanation": "useradd -D는 계정을 새로 만들지 않고 useradd의 기본 설정값을 출력한다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nGROUP=100\nHOME=/home\nINACTIVE=-1\nEXPIRE=\nSHELL=/bin/sh\nSKEL=/etc/skel\nCREATE_MAIL_SPOOL=no",
    "commandParts": [
      {
        "token": "useradd",
        "meaning": "사용자 계정 생성·기본값 확인"
      },
      {
        "token": "-D",
        "meaning": "사용자 생성 기본값 출력"
      }
    ],
    "verification": "useradd -D",
    "verificationDetail": "useradd -D는 계정을 새로 만들지 않고 useradd의 기본 설정값을 출력한다.",
    "commonMistake": "useradd에 실제 로그인 ID를 지정하는 것은 이 문제의 목적이 아니다.",
    "trace": [],
    "pptSource": "10장 14쪽, 17~18쪽",
    "outputNote": "표시된 기본 설정값은 Ubuntu 버전 및 관리자의 설정에 따라 달라질 수 있습니다."
  }
];
