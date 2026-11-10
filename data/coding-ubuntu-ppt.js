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
    "hint": "폴더를 만든 다음 Vim에서 빈 파일을 저장하고, 폴더 구조를 확인해 보세요.",
    "explanation": "중간 디렉터리가 없는 상태에서도 하위 경로까지 만들 수 있습니다. 새 파일은 Vim에서 저장을 완료해야 파일 시스템에 남습니다.",
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
    "verificationDetail": "",
    "commonMistake": "Vim을 종료하기 전에 저장하지 않으면 새 파일이 생성되지 않을 수 있습니다.",
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
    "hint": "소유자·그룹·기타 사용자의 권한을 각각 숫자로 계산해 보세요. 읽기 4, 쓰기 2, 실행 1을 사용합니다.",
    "explanation": "파일 권한은 소유자(u)·그룹(g)·기타 사용자(o) 순서로 해석합니다. ls -l 출력에서 첫 번째 student는 소유자, 두 번째 student는 소유 그룹입니다.\n\n권한은 읽기(r)=4, 쓰기(w)=2, 실행(x)=1을 더하여 계산합니다. rw-는 6, r--는 4, ---는 0이므로 640입니다. 대표적으로 777은 rwx/rwx/rwx, 755는 rwx/r-x/r-x, 644는 rw-/r--/r--, 600은 rw-/---/---입니다.\n\n첫 번째 권한 기호 -는 일반 파일을 뜻하며 숫자 세 자리에 포함하지 않습니다. chmod는 권한만 변경하고 소유자와 소유 그룹은 변경하지 않습니다.",
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
    "verificationDetail": "",
    "commonMistake": "640을 604로 바꾸면 그룹과 기타 사용자의 권한이 달라집니다. 777은 모든 사용자에게 쓰기까지 허용하므로 이 문제에 사용하면 안 됩니다.",
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
    "hint": "터미널이 현재 어느 디렉터리에 있는지 확인하는 명령어를 떠올려 보세요.",
    "explanation": "현재 위치를 조회해도 작업 디렉터리는 바뀌지 않습니다. 출력되는 절대경로는 사용자 계정과 실습 위치에 따라 다를 수 있습니다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n/home/student/lab",
    "commandParts": [
      {
        "token": "pwd",
        "meaning": "현재 작업 디렉터리 절대경로 출력"
      }
    ],
    "verification": "pwd",
    "verificationDetail": "",
    "commonMistake": "예시 경로를 외워 입력하지 말고, 실제 터미널에 표시되는 경로를 확인하세요.",
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
    "hint": "현재 디렉터리의 파일과 폴더 이름을 표시하는 기본 명령어를 떠올려 보세요.",
    "explanation": "초기 화면에 a.txt와 docs가 이미 있습니다. 새 파일이나 디렉터리를 만들지 않고 현재 목록을 조회하는 문제입니다.",
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
    "verificationDetail": "",
    "commonMistake": "목록을 확인하는 과정에서 기존 파일을 새로 생성하거나 변경할 필요는 없습니다.",
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
    "hint": "점(.)으로 시작하는 숨김 항목도 보이도록 목록 옵션을 생각해 보세요.",
    "explanation": "목록에 .과 ..이 보이면 각각 현재 디렉터리와 상위 디렉터리를 가리키는 항목입니다. 숨김 파일을 표시해도 파일 자체는 변경되지 않습니다.",
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
    "verificationDetail": "",
    "commonMistake": "일반 목록에서 숨김 파일이 보이지 않는 것은 파일이 삭제되었다는 뜻이 아닙니다.",
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
    "hint": "디렉터리와 실행 파일을 이름 뒤 기호로 구분하는 옵션을 떠올려 보세요.",
    "explanation": "파일 이름 뒤에 표시되는 /·@·*는 항목 유형을 구별하기 위한 표시입니다. 실제 파일 이름에 해당 기호가 추가된 것은 아닙니다.",
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
    "verificationDetail": "",
    "commonMistake": "디렉터리 뒤의 /를 실제 디렉터리 이름에 포함해서 입력하지 마세요.",
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
    "hint": "파일 이름만 나열하는 출력과 권한·소유자·그룹까지 표시하는 출력을 비교해 보세요.",
    "explanation": "ls -l 출력의 첫 문자는 파일 유형이고, 다음 아홉 문자는 소유자·그룹·기타 사용자의 권한입니다. -rw-r--r--는 일반 파일이며 숫자 권한은 644입니다.\n\n출력에서 권한 다음의 1은 하드 링크 수, 첫 번째 student는 소유자, 두 번째 student는 소유 그룹, 6은 바이트 단위 파일 크기, Nov 11 09:00은 수정 시각입니다.",
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
    "verificationDetail": "",
    "commonMistake": "소유자와 그룹의 이름이 같아도 의미는 다릅니다. 파일 유형 기호를 권한 숫자에 포함하지 마세요.",
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
    "hint": "상위 디렉터리를 나타내는 기호와 이동 후 경로를 확인하는 방법을 생각해 보세요.",
    "explanation": "상위 디렉터리로 이동하면 이후에 표시되는 작업 경로도 달라집니다. .은 현재 디렉터리, ..은 한 단계 위 디렉터리를 뜻합니다.",
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
    "verificationDetail": "",
    "commonMistake": "현재 디렉터리(.)와 상위 디렉터리(..)를 혼동하지 마세요.",
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
    "hint": "현재 위치와 관계없이 홈 디렉터리로 이동하는 방법을 생각해 보세요.",
    "explanation": "물결표(~)는 현재 로그인한 사용자의 홈 디렉터리를 가리킵니다. 홈 경로는 사용자마다 다를 수 있습니다.",
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
    "verificationDetail": "",
    "commonMistake": "홈 디렉터리의 경로를 모든 계정에서 동일하다고 가정하지 마세요.",
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
    "hint": "새 디렉터리를 만들고 목록으로 확인하는 순서를 생각해 보세요.",
    "explanation": "디렉터리 생성에 성공하면 별도 출력이 없을 수 있습니다. 생성된 reports가 목록에 나타나는지 확인합니다.",
    "initialState": "student@ubuntu:~/lab$ ls\n\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nreports/",
    "commandParts": [
      {
        "token": "mkdir",
        "meaning": "새 디렉터리를 생성"
      }
    ],
    "verification": "ls -F",
    "verificationDetail": "",
    "commonMistake": "기존에 reports가 있다면 동일한 이름으로 다시 생성할 때 오류가 발생할 수 있습니다.",
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
    "hint": "Vim에서 내용을 입력하지 않은 새 파일을 저장·종료하는 방법을 떠올려 보세요.",
    "explanation": "빈 문서는 텍스트를 입력하지 않더라도 Vim에서 저장하면 파일로 남습니다. 저장 후 터미널로 돌아와 파일의 존재를 확인합니다.",
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
    "verificationDetail": "",
    "commonMistake": "빈 파일은 편집기를 열기만 한 상태와 저장을 완료한 상태를 구분해야 합니다.",
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
    "hint": "내용이 없는 디렉터리만 삭제하는 명령어를 떠올려 보세요.",
    "explanation": "삭제 성공 여부는 목록에서 empty 디렉터리가 사라졌는지 확인합니다. 이 문제의 대상은 비어 있는 디렉터리입니다.",
    "initialState": "student@ubuntu:~/lab$ ls -F\nempty/\nstudent@ubuntu:~/lab$ ls empty\n\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n",
    "commandParts": [
      {
        "token": "rmdir",
        "meaning": "비어 있는 디렉터리 삭제"
      }
    ],
    "verification": "ls",
    "verificationDetail": "",
    "commonMistake": "디렉터리 안에 파일이 남아 있으면 삭제할 수 없습니다.",
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
    "hint": "파일을 편집하지 않고 내용만 터미널에 표시하는 방법을 생각해 보세요.",
    "explanation": "파일 내용을 읽어 출력할 뿐, 원본 문서의 글자는 바뀌지 않습니다. 출력된 문자열을 초기 파일 내용과 비교해 보세요.",
    "initialState": "student@ubuntu:~/lab$ ls\nreadme.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nHello Linux\nUbuntu",
    "commandParts": [
      {
        "token": "cat",
        "meaning": "파일 내용 출력"
      }
    ],
    "verification": "cat readme.txt",
    "verificationDetail": "",
    "commonMistake": "내용 확인을 위해 편집기로 다시 저장할 필요는 없습니다.",
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
    "hint": "원본을 보존하면서 다른 이름으로 복제하는 작업을 생각해 보세요.",
    "explanation": "복사 뒤에는 원본 note.txt와 새 파일 backup.txt가 모두 남습니다. 두 파일 이름이 함께 표시되는지 확인합니다.",
    "initialState": "student@ubuntu:~/lab$ ls\nnote.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nbackup.txt  note.txt",
    "commandParts": [
      {
        "token": "cp",
        "meaning": "파일을 복사"
      }
    ],
    "verification": "ls",
    "verificationDetail": "",
    "commonMistake": "복사는 이름 변경과 달리 원본 파일을 없애지 않습니다.",
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
    "hint": "파일을 복제하지 않고 이름만 바꾸는 방법을 생각해 보세요.",
    "explanation": "이름 변경 뒤에는 기존 draft.txt 대신 final.txt가 표시됩니다. 파일 복사와 구별하여 목록을 확인합니다.",
    "initialState": "student@ubuntu:~/lab$ ls\ndraft.txt\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\nfinal.txt",
    "commandParts": [
      {
        "token": "mv",
        "meaning": "파일 이동 또는 이름 변경"
      }
    ],
    "verification": "ls",
    "verificationDetail": "",
    "commonMistake": "이름만 바꾸는 작업에서 원본 이름과 새 이름이 모두 남아 있다고 판단하지 마세요.",
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
    "hint": "폴더 안의 목록과 폴더 자체의 권한을 표시하는 방식이 어떻게 다른지 살펴보세요.",
    "explanation": "디렉터리 자체의 상세 정보를 조회하면 첫 글자가 d로 시작합니다. drwxr-xr-x는 소유자 7(rwx), 그룹 5(r-x), 기타 사용자 5(r-x)이므로 755입니다. 읽기(r)=4, 쓰기(w)=2, 실행(x)=1을 사용합니다.\n\n디렉터리의 실행(x) 권한은 해당 경로로 진입하거나 경로를 통과할 수 있는 권한입니다. 상세 출력의 두 student는 각각 소유자와 그룹입니다.",
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
    "verificationDetail": "",
    "commonMistake": "디렉터리 자체의 정보를 보려는 경우 내부 목록만 출력하지 않도록 주의하세요.",
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
    "hint": "파일 시작 부분이 아니라 끝부분에서 정해진 줄 수만 보는 방법을 생각해 보세요.",
    "explanation": "예시 파일이 10줄로 구성되어 있다면 마지막 7줄은 4번째 줄부터 10번째 줄까지입니다. 출력 행 수와 순서를 함께 확인합니다.",
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
    "verificationDetail": "",
    "commonMistake": "처음 7줄을 출력하면 문제의 요구와 다른 결과가 됩니다.",
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
    "hint": "검색어가 있는 줄 앞에 해당 줄 번호도 표시하는 옵션을 생각해 보세요.",
    "explanation": "검색 결과의 2:와 5:처럼 콜론 앞에 표시되는 숫자는 원본 파일에서의 행 번호입니다. 검색 문자열의 대문자와 소문자도 구별됩니다.",
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
    "verificationDetail": "",
    "commonMistake": "ERROR와 error는 기본 검색에서 같은 문자열로 처리되지 않습니다.",
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
    "hint": "파일 이름이 아니라 소유자 이름을 기준으로 현재 경로 아래를 검색해 보세요.",
    "explanation": "소유자는 파일 목록의 세 번째 열에서 확인합니다. 현재 디렉터리(.)와 그 하위 경로에서 student가 소유한 항목만 찾고, teacher 소유인 항목은 제외합니다.",
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
    "verificationDetail": "",
    "commonMistake": "파일을 읽을 수 있다는 사실만으로 해당 파일의 소유자라고 판단하지 마세요.",
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
    "hint": "명령어 이름으로 실행 파일의 경로를 확인하는 방법을 떠올려 보세요.",
    "explanation": "명령어를 입력했을 때 셸이 찾는 실행 파일의 경로를 보여줍니다. 실행 파일이 설치된 위치는 환경에 따라 달라질 수 있습니다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]",
    "afterState": "student@ubuntu:~/lab$ [명령어 입력]\n/usr/bin/mv",
    "commandParts": [
      {
        "token": "which",
        "meaning": "명령어 실행 파일 경로 검색"
      }
    ],
    "verification": "which mv",
    "verificationDetail": "",
    "commonMistake": "실행 파일 경로를 예시와 똑같이 출력해야 정답이라고 판단하지 마세요.",
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
    "hint": "링크가 가리키는 경로와 원본·링크의 inode 번호를 비교해 보세요.",
    "explanation": "심볼릭 링크는 대상의 경로를 가리키므로 원본과 다른 inode 번호를 갖습니다. 상세 목록에서는 링크 유형 l과 연결 대상(data-link -> data.txt)을 확인합니다.",
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
    "verificationDetail": "",
    "commonMistake": "심볼릭 링크는 원본 데이터를 복사한 파일이 아닙니다. 대상이 사라지면 링크가 끊어질 수 있습니다.",
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
    "hint": "하드 링크와 심볼릭 링크의 inode가 각각 원본과 같은지 비교해 보세요.",
    "explanation": "하드 링크는 원본과 동일한 inode를 공유합니다. 심볼릭 링크는 원본 경로를 가리키는 별도 inode를 사용합니다.\n\n두 링크를 생성한 뒤 inode를 비교하고, 상세 목록에서 하드 링크 수와 심볼릭 링크의 연결 경로를 각각 확인합니다. 일반적으로 서로 다른 파일 시스템 사이에는 하드 링크를 만들 수 없습니다.",
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
    "verificationDetail": "",
    "commonMistake": "파일 이름이 같거나 화살표로 연결되어 보인다고 해서 inode도 같다고 판단하지 마세요.",
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
    "hint": "Vim에서 입력 모드로 전환한 후 일반 모드로 돌아와 저장하는 순서를 생각해 보세요.",
    "explanation": "텍스트를 작성할 때는 입력 모드로 전환해야 합니다. 저장 명령을 실행할 때는 일반 모드로 돌아와야 하며, :wq는 저장과 종료를 함께 수행합니다.",
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
    "verificationDetail": "",
    "commonMistake": "입력 모드에서 :wq를 입력하면 명령이 아니라 문서 내용으로 들어갈 수 있습니다.",
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
    "input": "student@ubuntu:~/lab$ [명령어 입력]\none\ntwo\nthree\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\none\nthree",
    "code": "vim memo.txt\ncat memo.txt",
    "vimSteps": [
      "터미널에서 vim memo.txt를 실행하여 Vim을 여시오.",
      "Esc 키를 눌러 일반 모드임을 확인하시오.",
      "Vim 안에서 :2를 입력하고 Enter를 눌러 두 번째 줄로 이동하시오.",
      "일반 모드에서 dd 키를 차례로 눌러 현재 줄(two)을 삭제하시오.",
      ":wq를 입력하고 Enter를 눌러 저장한 뒤 Vim을 종료하시오.",
      "터미널에서 cat memo.txt를 실행하여 one과 three만 남았는지 확인하시오."
    ],
    "hint": "Vim에서 편집할 행으로 이동한 후 해당 행 전체를 삭제하는 방법을 떠올려 보세요.",
    "explanation": "dd는 한 글자가 아니라 커서가 있는 줄 전체를 삭제합니다. 삭제 후 남는 줄의 순서를 확인합니다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]\none\ntwo\nthree\nstudent@ubuntu:~/lab$ [명령어 입력]",
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
    "verificationDetail": "",
    "commonMistake": "dd를 문자 두 개를 지우는 명령으로 오해하지 마세요.",
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
    "input": "student@ubuntu:~/lab$ [명령어 입력]\nlinux intro\nlearn linux\nlinux lab\nstudent@ubuntu:~/lab$ [명령어 입력]",
    "output": "student@ubuntu:~/lab$ [명령어 입력]\nLinux intro\nlearn Linux\nLinux lab",
    "code": "vim memo.txt\ncat memo.txt",
    "vimSteps": [
      "터미널에서 vim memo.txt를 실행하여 Vim을 여시오.",
      "Esc 키를 눌러 일반 모드임을 확인하시오.",
      "Vim 안에서 :%s/linux/Linux/g를 입력하고 Enter를 눌러 파일 전체의 linux를 Linux로 바꾸시오.",
      ":wq를 입력하고 Enter를 눌러 저장한 뒤 Vim을 종료하시오.",
      "터미널에서 cat memo.txt를 실행하여 모든 줄의 Linux 표기를 확인하시오."
    ],
    "hint": "한 줄의 일부가 아니라 문서 전체에 나타나는 동일한 문자열을 바꾸어 보세요.",
    "explanation": "파일 전체 치환에서 %는 모든 줄을 대상으로 지정하고, 마지막 g는 각 줄에 있는 모든 일치 항목을 변경합니다.",
    "initialState": "student@ubuntu:~/lab$ [명령어 입력]\nlinux intro\nlearn linux\nlinux lab\nstudent@ubuntu:~/lab$ [명령어 입력]",
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
    "verificationDetail": "",
    "commonMistake": "마지막 g가 없으면 각 줄의 첫 번째 일치 항목만 변경됩니다.",
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
    "hint": "소유자에게만 적용되는 권한 제거 기호를 생각해 보세요.",
    "explanation": "문자형 권한 변경은 u(소유자)·g(그룹)·o(기타 사용자), 연산자(+·-), 권한 문자(r·w·x)를 조합합니다.\n\n초기 -rw-rw-r--(664)에서 소유자의 쓰기 권한만 제거하면 -r--rw-r--(464)가 됩니다. 그룹과 기타 사용자 권한은 유지됩니다.",
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
    "verificationDetail": "",
    "commonMistake": "u-w는 소유자를 바꾸는 명령이 아니라 소유자의 쓰기 권한만 제거하는 명령입니다.",
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
    "hint": "그룹의 기존 권한을 유지하면서 쓰기·실행 권한을 추가하는 방법을 생각해 보세요.",
    "explanation": "문자형 권한 변경에서 +는 기존 권한을 유지하면서 새 권한을 더합니다. 그룹의 r--(4)에 쓰기(2)와 실행(1)을 추가하면 rwx(7)가 됩니다.\n\n따라서 -rw-r-----(640)은 -rw-rwx---(670)으로 바뀌며, 소유자와 기타 사용자 권한은 유지됩니다.",
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
    "verificationDetail": "",
    "commonMistake": "권한 추가 연산자는 기존 읽기 권한을 제거하지 않습니다.",
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
    "hint": "새 파일의 기본 권한 제한을 문자 형식으로 확인하는 방법을 떠올려 보세요.",
    "explanation": "umask는 새 파일과 디렉터리를 만들 때 적용되는 기본 권한 제한을 나타냅니다. 예시 u=rwx,g=rx,o=rx는 umask 022의 문자 표현이며 소유자·그룹·기타 사용자 순서입니다.\n\numask를 조회하는 작업과 기존 파일에 chmod를 적용하는 작업은 다릅니다. 실제 출력은 셸 설정에 따라 달라질 수 있습니다.",
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
    "verificationDetail": "",
    "commonMistake": "umask 조회 결과를 기존 파일 하나에 설정된 권한으로 해석하지 마세요.",
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
    "hint": "문자열을 출력한 뒤 줄바꿈을 하지 않는 옵션을 생각해 보세요.",
    "explanation": "-n을 사용하면 Hello 뒤에 줄바꿈이 없으므로 다음 셸 프롬프트가 같은 줄에 이어질 수 있습니다.",
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
    "verificationDetail": "",
    "commonMistake": "줄바꿈이 없는 출력은 문자열이 사라졌다는 뜻이 아닙니다.",
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
    "hint": "정수를 출력할 서식 기호와 줄바꿈 문자를 함께 사용해 보세요.",
    "explanation": "%d는 정수를 십진수로 표시하는 서식이며 \\n은 출력 끝의 줄바꿈을 뜻합니다. 값 12는 서식에 따라 출력됩니다.",
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
    "verificationDetail": "",
    "commonMistake": "서식 문자열에 \\n을 빠뜨리면 출력 뒤에 줄바꿈이 생기지 않습니다.",
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
    "hint": "큰따옴표와 작은따옴표에서 변수 이름이 다르게 처리되는 이유를 생각해 보세요.",
    "explanation": "같은 $SHELL도 큰따옴표에서는 변수의 값으로 바뀌고, 작은따옴표에서는 문자 자체가 표시됩니다. 두 출력 결과를 비교해 보세요.",
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
    "verificationDetail": "",
    "commonMistake": "따옴표 종류를 바꾸면 변수 확장 여부가 달라집니다.",
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
    "hint": "터미널 출력이 아닌 파일에 결과를 기록하는 리다이렉션을 생각해 보세요.",
    "explanation": "파일로 출력을 보내는 >는 기존 파일 내용이 있을 때 이를 덮어씁니다. 이 문제에서는 result.txt 안에 hello만 남는지 확인합니다.",
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
    "verificationDetail": "",
    "commonMistake": "기존 내용이 필요한 파일에 >를 사용하면 원래 내용이 사라질 수 있습니다.",
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
    "hint": "기존 파일을 덮어쓰지 않고 끝에 내용을 덧붙이는 기호를 떠올려 보세요.",
    "explanation": ">>는 기존 내용을 보존한 채 파일 끝에 새 내용을 추가합니다. 예시에서는 hello 다음 줄에 world가 이어져야 합니다.",
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
    "verificationDetail": "",
    "commonMistake": "기존 내용을 남겨야 한다면 >와 >>를 혼동하지 마세요.",
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
    "hint": "기존 명령어에 기본 옵션을 붙이는 별명을 등록한 뒤 목록으로 확인해 보세요.",
    "explanation": "별명을 등록하면 현재 셸에서 ls를 입력할 때 지정한 옵션을 함께 적용할 수 있습니다. 별명 목록에서 설정값을 확인합니다.",
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
    "verificationDetail": "",
    "commonMistake": "별명을 등록하는 작업은 원래 명령어 파일 자체를 수정하지 않습니다.",
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
    "hint": "여러 명령을 한 줄에 입력하고 차례대로 실행하는 구분 기호를 생각해 보세요.",
    "explanation": "세미콜론은 각 명령을 왼쪽부터 순서대로 실행합니다. 앞 명령의 출력을 뒤 명령의 입력으로 보내는 파이프와는 다릅니다.",
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
    "verificationDetail": "",
    "commonMistake": "명령을 순서대로 실행하는 세미콜론과 출력을 전달하는 파이프를 혼동하지 마세요.",
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
    "hint": "프로세스 목록을 자세히 표시하여 PID와 PPID 항목을 확인해 보세요.",
    "explanation": "상세 목록에서 PID는 프로세스 번호, PPID는 해당 프로세스를 실행한 부모 프로세스 번호입니다.",
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
    "verificationDetail": "",
    "commonMistake": "PID와 PPID를 같은 값으로 해석하지 마세요.",
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
    "hint": "모든 프로세스를 대상으로 상세 목록을 출력하는 옵션 조합을 생각해 보세요.",
    "explanation": "전체 프로세스를 출력할 때는 현재 터미널에 연결되지 않은 프로세스도 표시됩니다. 실행 범위와 상세 출력 여부를 구분해 보세요.",
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
    "verificationDetail": "",
    "commonMistake": "현재 터미널만 조회하는 결과와 시스템 전체 결과를 같은 것으로 보지 마세요.",
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
    "hint": "프로세스 이름을 검색하면서 PID와 이름을 함께 확인하는 옵션을 생각해 보세요.",
    "explanation": "프로세스 이름으로 검색할 때 결과에는 PID와 실행 중인 이름이 함께 표시됩니다. PID는 실행 시점마다 달라집니다.",
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
    "verificationDetail": "",
    "commonMistake": "예시에 표시된 PID와 실제 시스템의 PID가 다르더라도 오류는 아닙니다.",
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
    "hint": "자원 사용량까지 포함한 프로세스 목록을 표시하는 BSD 형식을 떠올려 보세요.",
    "explanation": "BSD 형식인 aux는 하이픈 없이 사용합니다. 사용자, CPU·메모리 사용량, 명령 정보 등의 열을 확인합니다.",
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
    "verificationDetail": "",
    "commonMistake": "ps aux 앞의 aux에 유닉스식 하이픈을 붙이지 마세요.",
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
    "hint": "파일 시스템 사용량을 읽기 쉬운 크기 단위로 표시하는 옵션을 생각해 보세요.",
    "explanation": "파일 시스템별 전체 용량과 사용량을 나타냅니다. -h는 표시 단위만 바꾸며 사용량 자체를 변경하지 않습니다.",
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
    "verificationDetail": "",
    "commonMistake": "현재 디스크의 실제 사용량은 예시 숫자와 다를 수 있습니다.",
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
    "hint": "파일 시스템 종류와 특정 디렉터리의 전체 사용량을 각각 확인해 보세요.",
    "explanation": "df는 파일 시스템 단위의 통계를, du는 지정한 디렉터리의 사용량을 보여줍니다. 두 명령의 집계 대상을 구분하여 읽습니다.",
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
    "verificationDetail": "",
    "commonMistake": "파일 시스템 전체 사용량과 docs 디렉터리 사용량을 같은 수치로 비교하지 마세요.",
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
    "hint": "전체 프로세스 출력에서 bash가 들어 있는 줄만 선별하는 연결 방식을 생각해 보세요.",
    "explanation": "파이프(|)는 왼쪽 명령의 출력을 오른쪽 명령의 입력으로 전달합니다. 검색 결과에는 실행 중인 grep 명령 자체가 포함될 수도 있습니다.",
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
    "verificationDetail": "",
    "commonMistake": "파이프가 단순히 명령 두 개를 순서대로 실행하는 기호라고 생각하지 마세요.",
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
    "hint": "시스템 종료를 새로 예약하는 기능과 기존 예약을 취소하는 기능을 구분해 보세요.",
    "explanation": "기존에 예약한 시스템 종료가 있을 때 취소하는 작업입니다. 실제로 종료하거나 재시작하는 명령은 실행하지 않습니다.",
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
    "verificationDetail": "",
    "commonMistake": "시스템 종료나 재시작을 수행하는 다른 옵션을 사용하지 마세요.",
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
    "hint": "패키지 검색과 패키지 상세 정보 조회를 순서대로 수행하는 방법을 생각해 보세요.",
    "explanation": "패키지 이름을 검색한 뒤 해당 패키지의 버전·의존성 등의 캐시 정보를 조회합니다. 이 과정에서는 패키지를 설치하지 않습니다.",
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
    "verificationDetail": "",
    "commonMistake": "정보 조회를 패키지 설치 작업과 혼동하지 마세요.",
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
    "hint": "디렉터리를 아카이브로 묶은 뒤 아카이브에 들어 있는 항목을 조회해 보세요.",
    "explanation": "tar 아카이브를 생성해도 원본 docs 디렉터리는 그대로 남습니다. 생성된 파일을 추출하지 않고도 내부 목록을 확인할 수 있습니다.",
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
    "verificationDetail": "",
    "commonMistake": "아카이브 파일을 만들었다고 해서 원본 디렉터리가 삭제되지는 않습니다.",
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
    "hint": "생성이나 내부 목록 조회가 아닌 아카이브의 내용 추출 옵션을 떠올려 보세요.",
    "explanation": "x는 아카이브에 들어 있는 항목을 현재 작업 위치에 추출합니다. 추출 후 docs와 그 아래 파일이 나타나는지 확인합니다.",
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
    "verificationDetail": "",
    "commonMistake": "기존 경로에 같은 이름의 파일이 있으면 추출 과정에서 영향을 받을 수 있습니다.",
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
    "hint": "압축 파일을 만든 뒤 압축을 풀어 저장하지 않고 내용만 확인해 보세요.",
    "explanation": "gzip은 보통 원본 파일을 .gz 압축 파일로 대체합니다. zcat은 압축을 해제하여 별도 파일을 만들지 않고 내용을 터미널에 출력합니다.",
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
    "verificationDetail": "",
    "commonMistake": "압축한 뒤에도 원본 report.txt가 반드시 남는다고 가정하지 마세요.",
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
    "hint": "로그인 사용자 정보와 소속 그룹 정보를 각각 표시하는 방법을 생각해 보세요.",
    "explanation": "who로 현재 로그인한 사용자 목록을 확인하고, groups로 사용자 계정의 소속 그룹을 확인합니다. 두 출력은 서로 다른 정보를 나타냅니다.",
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
    "verificationDetail": "",
    "commonMistake": "현재 접속 인원과 사용자에게 배정된 그룹 수를 같은 개념으로 보지 마세요.",
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
    "hint": "반복 작업을 변경하지 않고 등록된 목록만 확인하는 옵션을 떠올려 보세요.",
    "explanation": "예약된 작업이 없다면 'no crontab for ...'와 같은 메시지가 나올 수 있습니다. 작업 조회와 신규 등록·편집은 다른 동작입니다.",
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
    "verificationDetail": "",
    "commonMistake": "조회 목적이라면 편집이나 삭제 옵션을 사용하지 마세요.",
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
    "hint": "실제 계정을 만들지 않고 사용자 생성 기본 설정만 확인하는 옵션을 생각해 보세요.",
    "explanation": "-D로 사용자 생성 시 적용할 기본값을 조회합니다. 이 작업만으로 새로운 로그인 계정이 생성되지는 않습니다.",
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
    "verificationDetail": "",
    "commonMistake": "사용자 이름을 지정해 계정을 생성하는 동작과 기본값 조회를 혼동하지 마세요.",
    "trace": [],
    "pptSource": "10장 14쪽, 17~18쪽",
    "outputNote": "표시된 기본 설정값은 Ubuntu 버전 및 관리자의 설정에 따라 달라질 수 있습니다."
  }
];
