/* 운영체제 실습 PPT 제1~10장(총 328슬라이드) 근거로 작성한 50문제. 명령·옵션 출처: 각 문항의 pptSource. */
export const ubuntuPptProblems = [
  {
    "id": "LINUX-001",
    "language": "linux",
    "level": "입문",
    "topic": "파일·디렉터리",
    "title": "프로젝트 폴더와 빈 파일 만들기",
    "statement": "현재 디렉터리에 project/src를 생성하고 Vim으로 빈 main.py 파일을 저장한 뒤 하위 디렉터리 목록을 확인한다.",
    "input": "project 디렉터리가 없는 상태",
    "output": "project 아래에 src, 그 안에 main.py가 존재함",
    "code": "mkdir -p project/src\nvim project/src/main.py\nls -R project",
    "hint": "중간 경로 생성, 편집기 저장, 하위 목록 확인을 순서대로 생각한다.",
    "explanation": "mkdir -p로 중간 디렉터리를 만들고 Vim에서 :wq와 Enter로 저장·종료한다. ls -R은 하위 내용도 표시한다.",
    "initialState": "project 디렉터리가 없는 상태",
    "afterState": "project 아래에 src, 그 안에 main.py가 존재함",
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
    "verificationDetail": "mkdir -p로 중간 디렉터리를 만들고 Vim에서 :wq와 Enter로 저장·종료한다. ls -R은 하위 내용도 표시한다.",
    "commonMistake": "Vim을 열기만 하고 :wq로 저장하지 않으면 파일이 생성되지 않을 수 있다.",
    "trace": [],
    "pptSource": "2장 22쪽, 3장 4~5쪽"
  },
  {
    "id": "LINUX-002",
    "language": "linux",
    "level": "입문",
    "topic": "파일 권한",
    "title": "파일을 만들고 접근 권한 설정하기",
    "statement": "Vim으로 report.txt를 생성한 뒤 소유자는 읽기·쓰기, 그룹은 읽기, 기타 사용자는 권한이 없도록 설정하고 확인한다.",
    "input": "report.txt가 없는 상태",
    "output": "ls -l 출력의 권한 부분: -rw-r-----",
    "code": "vim report.txt\nchmod 640 report.txt\nls -l report.txt",
    "hint": "권한 세 범주를 소유자·그룹·기타 사용자 순서로 계산한다.",
    "explanation": "Vim에서 :wq로 빈 파일을 저장한다. chmod 640은 rw- / r-- / ---이다. ls -l로 확인한다.",
    "initialState": "report.txt가 없는 상태",
    "afterState": "ls -l 출력의 권한 부분: -rw-r-----",
    "commandParts": [
      {
        "token": "vim",
        "meaning": "Vim 편집기"
      },
      {
        "token": ":wq",
        "meaning": "저장·종료"
      },
      {
        "token": "chmod",
        "meaning": "파일 접근 권한 변경"
      },
      {
        "token": "640",
        "meaning": "소유자 읽기·쓰기, 그룹 읽기, 기타 권한 없음"
      },
      {
        "token": "ls -l",
        "meaning": "상세 정보 표시"
      }
    ],
    "verification": "ls -l report.txt",
    "verificationDetail": "Vim에서 :wq로 빈 파일을 저장한다. chmod 640은 rw- / r-- / ---이다. ls -l로 확인한다.",
    "commonMistake": "640과 604를 혼동하면 소유자·그룹·기타 권한이 달라진다.",
    "trace": [],
    "pptSource": "3장 4~5쪽, 5장 13~15쪽"
  },
  {
    "id": "LINUX-003",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 탐색",
    "title": "현재 위치 확인하기",
    "statement": "현재 작업 디렉터리의 절대경로를 출력한다.",
    "input": "현재 위치가 /home/ubuntu/lab임",
    "output": "ubuntu@ubuntu:~/lab$ pwd\n/home/ubuntu/lab",
    "code": "pwd",
    "hint": "절대경로는 루트 디렉터리에서 시작한다.",
    "explanation": "pwd는 현재 작업 디렉터리의 절대경로를 출력한다.",
    "initialState": "현재 위치가 /home/ubuntu/lab임",
    "afterState": "ubuntu@ubuntu:~/lab$ pwd\n/home/ubuntu/lab",
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
    "pptSource": "2장 10쪽"
  },
  {
    "id": "LINUX-004",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 탐색",
    "title": "현재 디렉터리의 파일·폴더 확인",
    "statement": "현재 디렉터리에 존재하는 a.txt 파일과 docs 디렉터리의 이름을 출력한다.",
    "input": "현재 디렉터리에 빈 a.txt 파일과 docs 디렉터리가 이미 있는 상태",
    "output": "student@ubuntu:~/lab$ ls\na.txt  docs",
    "code": "ls",
    "hint": "경로를 지정하지 않을 때의 명령 대상이 무엇인지 생각한다.",
    "explanation": "ls는 현재 디렉터리의 파일과 하위 디렉터리 이름을 표시한다.",
    "initialState": "현재 디렉터리에 빈 a.txt 파일과 docs 디렉터리가 이미 있는 상태",
    "afterState": "student@ubuntu:~/lab$ ls\na.txt  docs",
    "commandParts": [
      {
        "token": "ls",
        "meaning": "현재 디렉터리의 목록을 출력"
      }
    ],
    "verification": "ls",
    "verificationDetail": "ls는 현재 디렉터리의 파일과 하위 디렉터리 이름을 표시한다.",
    "commonMistake": "파일이 이미 존재하므로 새로 생성하지 않는다.",
    "trace": [],
    "pptSource": "2장 13쪽"
  },
  {
    "id": "LINUX-005",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 탐색",
    "title": "숨김 파일 포함하여 목록 확인",
    "statement": "현재 디렉터리에서 점으로 시작하는 숨김 파일을 포함해 목록을 출력한다.",
    "input": "현재 위치에 .profile과 note.txt가 있음",
    "output": "목록에 .profile과 note.txt가 함께 표시됨",
    "code": "ls -a",
    "hint": "일반 목록과 숨김 항목을 포함한 목록의 차이를 구별한다.",
    "explanation": "ls -a는 숨김 항목과 . 및 ..도 표시한다.",
    "initialState": "현재 위치에 .profile과 note.txt가 있음",
    "afterState": "목록에 .profile과 note.txt가 함께 표시됨",
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
    "pptSource": "2장 14쪽"
  },
  {
    "id": "LINUX-006",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 탐색",
    "title": "파일 종류 기호 확인하기",
    "statement": "현재 디렉터리에서 파일과 폴더의 종류를 구분하는 기호를 표시한다.",
    "input": "docs 디렉터리와 note.txt 파일이 있음",
    "output": "docs/ 와 note.txt처럼 종류에 따른 표시가 나타남",
    "code": "ls -F",
    "hint": "파일 종류를 표시하는 기호의 의미를 떠올린다.",
    "explanation": "ls -F는 디렉터리에 /, 심벌릭 링크에 @, 실행 파일에 *를 붙인다.",
    "initialState": "docs 디렉터리와 note.txt 파일이 있음",
    "afterState": "docs/ 와 note.txt처럼 종류에 따른 표시가 나타남",
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
    "pptSource": "2장 15쪽"
  },
  {
    "id": "LINUX-007",
    "language": "linux",
    "level": "입문",
    "topic": "파일 속성",
    "title": "상세 파일 정보 읽기",
    "statement": "note.txt 파일의 권한, 소유자, 크기, 수정 시간을 확인한다.",
    "input": "현재 디렉터리에 note.txt 파일이 있음",
    "output": "권한, 링크 수, 소유자, 그룹, 크기, 수정 시간, 파일명이 표시됨",
    "code": "ls -l note.txt",
    "hint": "간단한 이름 목록과 파일 속성 목록을 비교한다.",
    "explanation": "ls -l은 파일 접근 권한과 소유자·크기·수정 시각 등의 상세 속성을 보여준다.",
    "initialState": "현재 디렉터리에 note.txt 파일이 있음",
    "afterState": "권한, 링크 수, 소유자, 그룹, 크기, 수정 시간, 파일명이 표시됨",
    "commandParts": [
      {
        "token": "ls",
        "meaning": "목록 출력"
      },
      {
        "token": "-l",
        "meaning": "상세 정보 표시"
      }
    ],
    "verification": "ls -l note.txt",
    "verificationDetail": "ls -l은 파일 접근 권한과 소유자·크기·수정 시각 등의 상세 속성을 보여준다.",
    "commonMistake": "파일 권한은 출력 첫 번째 열에서 확인한다.",
    "trace": [],
    "pptSource": "2장 16~17쪽"
  },
  {
    "id": "LINUX-008",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 탐색",
    "title": "한 단계 상위로 이동하기",
    "statement": "project 디렉터리에서 부모 디렉터리로 이동한 뒤 위치를 확인한다.",
    "input": "현재 위치가 /home/ubuntu/lab/project임",
    "output": "/home/ubuntu/lab",
    "code": "cd ..\npwd",
    "hint": "현재 디렉터리와 부모 디렉터리의 기호를 구별한다.",
    "explanation": "cd ..으로 한 단계 위로 이동하고 pwd로 확인한다.",
    "initialState": "현재 위치가 /home/ubuntu/lab/project임",
    "afterState": "/home/ubuntu/lab",
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
    "pptSource": "2장 5~8쪽, 11쪽"
  },
  {
    "id": "LINUX-009",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 탐색",
    "title": "홈 디렉터리로 이동하기",
    "statement": "현재 위치와 관계없이 자신의 홈 디렉터리로 이동하고 확인한다.",
    "input": "현재 위치가 /tmp임",
    "output": "홈 디렉터리 /home/ubuntu가 출력됨",
    "code": "cd ~\npwd",
    "hint": "홈 디렉터리를 나타내는 단축 기호를 생각한다.",
    "explanation": "~는 현재 사용자의 홈 디렉터리이고 cd ~는 해당 경로로 이동한다.",
    "initialState": "현재 위치가 /tmp임",
    "afterState": "홈 디렉터리 /home/ubuntu가 출력됨",
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
    "pptSource": "2장 6쪽, 12쪽"
  },
  {
    "id": "LINUX-010",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 생성",
    "title": "새 폴더 만들기",
    "statement": "현재 디렉터리에 reports라는 디렉터리를 생성한다.",
    "input": "reports 디렉터리가 없음",
    "output": "reports 디렉터리가 생성됨",
    "code": "mkdir reports",
    "hint": "파일과 디렉터리의 생성 방법을 구별한다.",
    "explanation": "mkdir는 지정한 이름의 디렉터리를 만든다.",
    "initialState": "reports 디렉터리가 없음",
    "afterState": "reports 디렉터리가 생성됨",
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
    "pptSource": "2장 20쪽"
  },
  {
    "id": "LINUX-011",
    "language": "linux",
    "level": "입문",
    "topic": "문서 편집",
    "title": "Vim으로 빈 텍스트 파일 저장하기",
    "statement": "Vim으로 note.txt를 열어 내용 없이 저장하고 종료한다.",
    "input": "note.txt가 없는 상태",
    "output": "빈 note.txt 파일이 생성됨",
    "code": "vim note.txt",
    "hint": "Vim 실행 후 저장·종료를 위한 마지막 행 명령을 사용한다.",
    "explanation": "Vim 실행 후 :wq와 Enter로 저장·종료한다. 내용이 없어도 새 파일을 저장할 수 있다.",
    "initialState": "note.txt가 없는 상태",
    "afterState": "빈 note.txt 파일이 생성됨",
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
    "verificationDetail": "Vim 실행 후 :wq와 Enter로 저장·종료한다. 내용이 없어도 새 파일을 저장할 수 있다.",
    "commonMistake": "저장하지 않고 종료하면 새 파일이 남지 않을 수 있다.",
    "trace": [],
    "pptSource": "3장 2~5쪽"
  },
  {
    "id": "LINUX-012",
    "language": "linux",
    "level": "입문",
    "topic": "디렉터리 삭제",
    "title": "빈 폴더 삭제하기",
    "statement": "내용이 없는 empty 디렉터리를 삭제한다.",
    "input": "empty 디렉터리가 존재하며 내부에 파일과 하위 디렉터리가 없음",
    "output": "empty 디렉터리가 삭제됨",
    "code": "rmdir empty",
    "hint": "디렉터리 내부가 비어 있다는 조건에 주의한다.",
    "explanation": "rmdir은 빈 디렉터리를 삭제한다.",
    "initialState": "empty 디렉터리가 존재하며 내부에 파일과 하위 디렉터리가 없음",
    "afterState": "empty 디렉터리가 삭제됨",
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
    "pptSource": "2장 23쪽"
  },
  {
    "id": "LINUX-013",
    "language": "linux",
    "level": "입문",
    "topic": "파일 내용",
    "title": "텍스트 파일 내용 확인하기",
    "statement": "/etc/hosts 파일의 내용을 터미널에 출력한다.",
    "input": "Ubuntu에 /etc/hosts가 존재함",
    "output": "/etc/hosts의 내용이 화면에 표시됨",
    "code": "cat /etc/hosts",
    "hint": "파일을 수정하지 않고 내용만 출력하는 기능을 생각한다.",
    "explanation": "cat은 지정한 파일의 내용을 화면에 출력한다.",
    "initialState": "Ubuntu에 /etc/hosts가 존재함",
    "afterState": "/etc/hosts의 내용이 화면에 표시됨",
    "commandParts": [
      {
        "token": "cat",
        "meaning": "파일 내용 출력"
      }
    ],
    "verification": "cat /etc/hosts",
    "verificationDetail": "cat은 지정한 파일의 내용을 화면에 출력한다.",
    "commonMistake": "출력은 PC의 hosts 설정에 따라 달라질 수 있다.",
    "trace": [],
    "pptSource": "2장 24쪽"
  },
  {
    "id": "LINUX-014",
    "language": "linux",
    "level": "입문",
    "topic": "파일 복사",
    "title": "텍스트 파일 복사하기",
    "statement": "note.txt 파일을 backup.txt라는 이름으로 복사한다.",
    "input": "note.txt는 존재하고 backup.txt는 없음",
    "output": "note.txt를 유지한 채 backup.txt가 추가됨",
    "code": "cp note.txt backup.txt",
    "hint": "원본을 보존하는 동작과 이름을 바꾸는 동작을 구별한다.",
    "explanation": "cp는 원본 파일을 남기고 지정한 이름의 복사본을 만든다.",
    "initialState": "note.txt는 존재하고 backup.txt는 없음",
    "afterState": "note.txt를 유지한 채 backup.txt가 추가됨",
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
    "pptSource": "2장 30쪽"
  },
  {
    "id": "LINUX-015",
    "language": "linux",
    "level": "입문",
    "topic": "파일 이동",
    "title": "파일 이름 바꾸기",
    "statement": "draft.txt의 이름을 final.txt로 변경한다.",
    "input": "draft.txt가 존재하고 final.txt는 없음",
    "output": "final.txt가 존재하고 draft.txt는 사라짐",
    "code": "mv draft.txt final.txt",
    "hint": "이름 변경 전후에 존재해야 하는 파일을 생각한다.",
    "explanation": "mv는 파일의 위치를 이동하거나 파일 이름을 변경한다.",
    "initialState": "draft.txt가 존재하고 final.txt는 없음",
    "afterState": "final.txt가 존재하고 draft.txt는 사라짐",
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
    "pptSource": "2장 34~35쪽"
  },
  {
    "id": "LINUX-016",
    "language": "linux",
    "level": "기초 응용",
    "topic": "디렉터리 정보",
    "title": "폴더 자체의 상세 정보 확인",
    "statement": "docs 아래 파일이 아닌 docs 디렉터리 자체의 권한과 소유자를 확인한다.",
    "input": "docs 디렉터리가 존재함",
    "output": "docs 디렉터리 한 항목의 상세 정보가 표시됨",
    "code": "ls -ld docs",
    "hint": "디렉터리 속성과 디렉터리 내부 목록을 구분한다.",
    "explanation": "ls -l의 상세 표시와 -d의 디렉터리 자체 표시를 함께 사용한다.",
    "initialState": "docs 디렉터리가 존재함",
    "afterState": "docs 디렉터리 한 항목의 상세 정보가 표시됨",
    "commandParts": [
      {
        "token": "ls",
        "meaning": "파일·디렉터리 목록"
      },
      {
        "token": "-l",
        "meaning": "상세 정보"
      },
      {
        "token": "-d",
        "meaning": "디렉터리 자체 정보"
      }
    ],
    "verification": "ls -ld docs",
    "verificationDetail": "ls -l의 상세 표시와 -d의 디렉터리 자체 표시를 함께 사용한다.",
    "commonMistake": "-d가 없으면 폴더 내부 목록이 출력될 수 있다.",
    "trace": [],
    "pptSource": "2장 16쪽, 18쪽"
  },
  {
    "id": "LINUX-017",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 내용",
    "title": "파일의 마지막 일곱 줄 확인",
    "statement": "/etc/services 파일의 마지막 일곱 줄을 표시한다.",
    "input": "Ubuntu에 /etc/services가 존재함",
    "output": "파일 마지막 7개 행이 표시됨",
    "code": "tail -7 /etc/services",
    "hint": "파일의 시작 부분이 아니라 끝부분을 대상으로 한다.",
    "explanation": "tail의 -숫자 형식으로 파일의 끝에서 출력할 줄 수를 지정한다.",
    "initialState": "Ubuntu에 /etc/services가 존재함",
    "afterState": "파일 마지막 7개 행이 표시됨",
    "commandParts": [
      {
        "token": "tail",
        "meaning": "파일의 끝부분 출력"
      },
      {
        "token": "-7",
        "meaning": "마지막 일곱 줄 출력"
      }
    ],
    "verification": "tail -7 /etc/services",
    "verificationDetail": "tail의 -숫자 형식으로 파일의 끝에서 출력할 줄 수를 지정한다.",
    "commonMistake": "환경에 따라 각 줄의 실제 내용은 달라질 수 있다.",
    "trace": [],
    "pptSource": "2장 28~29쪽"
  },
  {
    "id": "LINUX-018",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 검색",
    "title": "검색 결과의 행 번호 함께 보기",
    "statement": "app.log에서 ERROR를 포함하는 행을 줄 번호와 함께 출력한다.",
    "input": "app.log의 2행은 ERROR first, 5행은 ERROR second이며 다른 행에는 ERROR가 없음",
    "output": "2:ERROR first\n5:ERROR second",
    "code": "grep -n 'ERROR' app.log",
    "hint": "검색 문자열과 출력 형태를 함께 고려한다.",
    "explanation": "grep -n은 일치하는 행 앞에 해당 행 번호를 함께 표시한다.",
    "initialState": "app.log의 2행은 ERROR first, 5행은 ERROR second이며 다른 행에는 ERROR가 없음",
    "afterState": "2:ERROR first\n5:ERROR second",
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
    "pptSource": "2장 53쪽"
  },
  {
    "id": "LINUX-019",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 검색",
    "title": "특정 소유자의 파일 검색하기",
    "statement": "현재 디렉터리부터 아래로 검색하여 ubuntu 사용자가 소유한 파일과 디렉터리 경로를 확인한다.",
    "input": "현재 사용자 계정 이름이 ubuntu이며 접근 가능한 실습 파일이 존재함",
    "output": "ubuntu 소유 파일과 디렉터리 경로가 표시됨",
    "code": "find . -user ubuntu",
    "hint": "검색 시작 위치와 파일 소유자 조건을 구분한다.",
    "explanation": "find는 지정 위치에서 조건에 맞는 항목을 찾고 -user는 소유자를 기준으로 검색한다.",
    "initialState": "현재 사용자 계정 이름이 ubuntu이며 접근 가능한 실습 파일이 존재함",
    "afterState": "ubuntu 소유 파일과 디렉터리 경로가 표시됨",
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
        "meaning": "특정 소유자의 파일 검색"
      }
    ],
    "verification": "find . -user ubuntu",
    "verificationDetail": "find는 지정 위치에서 조건에 맞는 항목을 찾고 -user는 소유자를 기준으로 검색한다.",
    "commonMistake": "다른 사용자가 소유한 파일은 결과에 포함되지 않는다.",
    "trace": [],
    "pptSource": "2장 54쪽"
  },
  {
    "id": "LINUX-020",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 위치",
    "title": "명령어가 저장된 위치 확인",
    "statement": "mv 명령어의 실행 파일이 위치한 경로를 확인한다.",
    "input": "mv 명령어를 사용할 수 있는 Ubuntu 환경",
    "output": "mv 명령어 실행 파일의 경로가 표시됨",
    "code": "which mv",
    "hint": "명령어 기능과 명령어 실행 파일 위치를 구별한다.",
    "explanation": "which는 명령어가 저장된 실행 파일 경로를 보여준다.",
    "initialState": "mv 명령어를 사용할 수 있는 Ubuntu 환경",
    "afterState": "mv 명령어 실행 파일의 경로가 표시됨",
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
    "pptSource": "2장 55쪽"
  },
  {
    "id": "LINUX-021",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 링크",
    "title": "심벌릭 링크 만들고 종류 확인하기",
    "statement": "data.txt를 가리키는 data-link 심벌릭 링크를 생성하고 링크 대상을 확인한다.",
    "input": "data.txt가 존재하며 data-link는 없음",
    "output": "data-link -> data.txt 형태가 상세 목록에 표시됨",
    "code": "ln -s data.txt data-link\nls -l data-link",
    "hint": "원본과 심벌릭 링크 파일의 역할을 구분한다.",
    "explanation": "ln -s로 심벌릭 링크를 생성한다. ls -l은 원본 경로와 링크 기호 l을 표시한다.",
    "initialState": "data.txt가 존재하며 data-link는 없음",
    "afterState": "data-link -> data.txt 형태가 상세 목록에 표시됨",
    "commandParts": [
      {
        "token": "ln",
        "meaning": "파일 링크 생성"
      },
      {
        "token": "-s",
        "meaning": "심벌릭 링크 생성"
      },
      {
        "token": "ls -l",
        "meaning": "링크의 상세 정보 확인"
      }
    ],
    "verification": "ls -l data-link",
    "verificationDetail": "ln -s로 심벌릭 링크를 생성한다. ls -l은 원본 경로와 링크 기호 l을 표시한다.",
    "commonMistake": "원본 파일이 사라지면 심벌릭 링크가 가리키는 내용에 접근하지 못할 수 있다.",
    "trace": [],
    "pptSource": "2장 49~50쪽"
  },
  {
    "id": "LINUX-022",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 링크",
    "title": "하드 링크의 inode 비교",
    "statement": "data.txt에 대한 하드 링크 data-hard를 생성한 뒤 두 파일의 inode 번호를 비교한다.",
    "input": "data.txt는 있고 data-hard는 없음",
    "output": "두 파일명 앞에 같은 inode 번호가 표시됨",
    "code": "ln data.txt data-hard\nls -i data.txt data-hard",
    "hint": "파일 이름과 실제 파일 정보 구조를 연결한다.",
    "explanation": "ln은 기존 파일에 다른 이름을 추가한 하드 링크를 만든다. ls -i로 inode 번호를 본다.",
    "initialState": "data.txt는 있고 data-hard는 없음",
    "afterState": "두 파일명 앞에 같은 inode 번호가 표시됨",
    "commandParts": [
      {
        "token": "ln",
        "meaning": "하드 링크 생성"
      },
      {
        "token": "ls",
        "meaning": "파일 목록 확인"
      },
      {
        "token": "-i",
        "meaning": "inode 번호 출력"
      }
    ],
    "verification": "ls -i data.txt data-hard",
    "verificationDetail": "ln은 기존 파일에 다른 이름을 추가한 하드 링크를 만든다. ls -i로 inode 번호를 본다.",
    "commonMistake": "심벌릭 링크는 하드 링크와 달리 별도의 inode를 갖는다.",
    "trace": [],
    "pptSource": "2장 44~46쪽"
  },
  {
    "id": "LINUX-023",
    "language": "linux",
    "level": "기초 응용",
    "topic": "Vim 문서 편집",
    "title": "문장 입력 후 저장하기",
    "statement": "Vim으로 memo.txt를 열어 첫 줄에 'linux study'를 입력하고 저장하여 종료한다.",
    "input": "memo.txt가 없는 상태",
    "output": "memo.txt 파일에 linux study 한 줄이 저장됨",
    "code": "vim memo.txt",
    "hint": "편집 모드에서 입력 모드로 전환하는 키를 활용한다.",
    "explanation": "Vim에서 i를 눌러 문장을 입력하고 Esc 후 :wq와 Enter로 저장·종료한다.",
    "initialState": "memo.txt가 없는 상태",
    "afterState": "memo.txt 파일에 linux study 한 줄이 저장됨",
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
    "verificationDetail": "Vim에서 i를 눌러 문장을 입력하고 Esc 후 :wq와 Enter로 저장·종료한다.",
    "commonMistake": "입력 후 Esc로 명령 입력 상태로 돌아와야 :wq가 동작한다.",
    "trace": [],
    "pptSource": "3장 5~7쪽"
  },
  {
    "id": "LINUX-024",
    "language": "linux",
    "level": "기초 응용",
    "topic": "Vim 문서 편집",
    "title": "특정 행 삭제하기",
    "statement": "Vim에서 memo.txt의 두 번째 행을 삭제한 뒤 저장한다.",
    "input": "memo.txt는 1행 one, 2행 two, 3행 three으로 구성됨",
    "output": "저장 후 1행 one, 2행 three만 남음",
    "code": "vim memo.txt",
    "hint": "명령어가 작동하는 행은 커서가 놓인 행이다.",
    "explanation": "Vim에서 :2로 두 번째 행에 이동하고 dd로 행을 지운 다음 :wq로 저장한다.",
    "initialState": "memo.txt는 1행 one, 2행 two, 3행 three으로 구성됨",
    "afterState": "저장 후 1행 one, 2행 three만 남음",
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
    "verificationDetail": "Vim에서 :2로 두 번째 행에 이동하고 dd로 행을 지운 다음 :wq로 저장한다.",
    "commonMistake": "dd는 한 글자가 아니라 커서의 현재 행을 삭제한다.",
    "trace": [],
    "pptSource": "3장 14쪽, 18~20쪽"
  },
  {
    "id": "LINUX-025",
    "language": "linux",
    "level": "기초 응용",
    "topic": "Vim 문서 편집",
    "title": "파일 전체 문자열 바꾸기",
    "statement": "Vim에서 memo.txt 안의 모든 linux를 Linux로 바꾸고 저장한다.",
    "input": "memo.txt에 linux가 세 번 등장함",
    "output": "linux 세 곳이 모두 Linux로 변경됨",
    "code": "vim memo.txt",
    "hint": "현재 행만 바꾸는 명령과 파일 전체를 바꾸는 명령을 구별한다.",
    "explanation": "Vim에서 :%s/linux/Linux/g를 실행하고 :wq로 저장한다.",
    "initialState": "memo.txt에 linux가 세 번 등장함",
    "afterState": "linux 세 곳이 모두 Linux로 변경됨",
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
    "verificationDetail": "Vim에서 :%s/linux/Linux/g를 실행하고 :wq로 저장한다.",
    "commonMistake": "마지막 g가 빠지면 한 행의 모든 일치 항목을 바꾸지 못할 수 있다.",
    "trace": [],
    "pptSource": "3장 27~29쪽"
  },
  {
    "id": "LINUX-026",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 권한",
    "title": "기호 모드로 쓰기 권한 제거",
    "statement": "note.txt 파일에서 소유자의 쓰기 권한만 제거하고 결과를 확인한다.",
    "input": "note.txt의 현재 권한이 rw-rw-r--임",
    "output": "권한이 r--rw-r--로 변경됨",
    "code": "chmod u-w note.txt\nls -l note.txt",
    "hint": "권한 기호의 사용자·연산자·권한 문자를 구분한다.",
    "explanation": "chmod u-w는 소유자(u)의 쓰기(w) 권한을 제거한다.",
    "initialState": "note.txt의 현재 권한이 rw-rw-r--임",
    "afterState": "권한이 r--rw-r--로 변경됨",
    "commandParts": [
      {
        "token": "chmod",
        "meaning": "접근 권한 변경"
      },
      {
        "token": "u-w",
        "meaning": "소유자 쓰기 권한 제거"
      },
      {
        "token": "ls -l",
        "meaning": "권한 확인"
      }
    ],
    "verification": "ls -l note.txt",
    "verificationDetail": "chmod u-w는 소유자(u)의 쓰기(w) 권한을 제거한다.",
    "commonMistake": "그룹이나 기타 사용자의 권한은 변경하지 않는다.",
    "trace": [],
    "pptSource": "5장 8~10쪽"
  },
  {
    "id": "LINUX-027",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 권한",
    "title": "그룹에 두 가지 권한 추가",
    "statement": "note.txt 파일의 그룹에 쓰기와 실행 권한을 추가한다.",
    "input": "note.txt의 권한이 rw-r-----임",
    "output": "권한이 rw-rwx---로 변경됨",
    "code": "chmod g+wx note.txt\nls -l note.txt",
    "hint": "권한의 추가와 특정 값으로 덮어쓰기를 구별한다.",
    "explanation": "chmod g+wx는 그룹에 쓰기와 실행 권한을 더한다. 이미 있던 읽기 권한은 유지한다.",
    "initialState": "note.txt의 권한이 rw-r-----임",
    "afterState": "권한이 rw-rwx---로 변경됨",
    "commandParts": [
      {
        "token": "chmod",
        "meaning": "접근 권한 변경"
      },
      {
        "token": "g+wx",
        "meaning": "그룹의 쓰기·실행 권한 추가"
      },
      {
        "token": "ls -l",
        "meaning": "권한 확인"
      }
    ],
    "verification": "ls -l note.txt",
    "verificationDetail": "chmod g+wx는 그룹에 쓰기와 실행 권한을 더한다. 이미 있던 읽기 권한은 유지한다.",
    "commonMistake": "+ 연산자는 지정하지 않은 기존 권한을 제거하지 않는다.",
    "trace": [],
    "pptSource": "5장 8~11쪽"
  },
  {
    "id": "LINUX-028",
    "language": "linux",
    "level": "기초 응용",
    "topic": "파일 권한",
    "title": "기본 권한 마스크 문자로 확인",
    "statement": "현재 셸에서 적용 중인 기본 권한 마스크를 문자 형식으로 출력한다.",
    "input": "일반 사용자로 로그인한 Ubuntu 터미널",
    "output": "u, g, o 범주별 기본 권한 설정이 문자로 표시됨",
    "code": "umask -S",
    "hint": "기본 권한을 확인하는 동작과 파일 권한을 바꾸는 동작을 구별한다.",
    "explanation": "umask -S는 마스크 설정을 문자 형태로 출력한다.",
    "initialState": "일반 사용자로 로그인한 Ubuntu 터미널",
    "afterState": "u, g, o 범주별 기본 권한 설정이 문자로 표시됨",
    "commandParts": [
      {
        "token": "umask",
        "meaning": "기본 권한 마스크 확인 또는 설정"
      },
      {
        "token": "-S",
        "meaning": "마스크를 문자 형식으로 출력"
      }
    ],
    "verification": "umask -S",
    "verificationDetail": "umask -S는 마스크 설정을 문자 형태로 출력한다.",
    "commonMistake": "기본 umask 값은 시스템 설정에 따라 달라질 수 있다.",
    "trace": [],
    "pptSource": "5장 20쪽"
  },
  {
    "id": "LINUX-029",
    "language": "linux",
    "level": "기초 응용",
    "topic": "셸 출력",
    "title": "줄바꿈 없이 문자열 출력하기",
    "statement": "터미널에서 Hello를 출력한 뒤 명령 자체의 줄바꿈을 생략한다.",
    "input": "Ubuntu 터미널에서 실행하는 상태",
    "output": "화면에 Hello가 출력되고 명령의 마지막 줄바꿈이 추가되지 않음",
    "code": "echo -n Hello",
    "hint": "문자열의 내용과 출력 끝의 줄바꿈을 구별한다.",
    "explanation": "echo -n은 문자열 출력 후 줄바꿈을 추가하지 않는다.",
    "initialState": "Ubuntu 터미널에서 실행하는 상태",
    "afterState": "화면에 Hello가 출력되고 명령의 마지막 줄바꿈이 추가되지 않음",
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
    "pptSource": "4장 4쪽"
  },
  {
    "id": "LINUX-030",
    "language": "linux",
    "level": "기초 응용",
    "topic": "셸 출력",
    "title": "정수와 줄바꿈 형식 지정",
    "statement": "숫자 12를 십진 정수로 출력하고 다음 행으로 줄바꿈한다.",
    "input": "Ubuntu 터미널에서 실행하는 상태",
    "output": "12가 출력된 뒤 줄바꿈됨",
    "code": "printf '%d\\n' 12",
    "hint": "서식 지정 문자와 줄바꿈 문자의 기능을 구분한다.",
    "explanation": "printf의 %d는 십진 정수, \\n은 줄바꿈을 뜻한다.",
    "initialState": "Ubuntu 터미널에서 실행하는 상태",
    "afterState": "12가 출력된 뒤 줄바꿈됨",
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
    "pptSource": "4장 5쪽"
  },
  {
    "id": "LINUX-031",
    "language": "linux",
    "level": "기초 응용",
    "topic": "셸 특수문자",
    "title": "변숫값과 문자 그대로 출력 비교",
    "statement": "SHELL 환경 변수에 저장된 값과 '$SHELL' 문자열을 각각 출력한다.",
    "input": "SHELL 변수가 설정된 Ubuntu 셸",
    "output": "첫 줄에는 셸 경로, 두 번째 줄에는 $SHELL 문자열이 표시됨",
    "code": "echo \"$SHELL\"\necho '$SHELL'",
    "hint": "작은따옴표와 큰따옴표에서 변수 해석이 다른 점을 생각한다.",
    "explanation": "큰따옴표 안에서는 $SHELL 변수를 확장하며 작은따옴표 안에서는 문자 그대로 출력한다.",
    "initialState": "SHELL 변수가 설정된 Ubuntu 셸",
    "afterState": "첫 줄에는 셸 경로, 두 번째 줄에는 $SHELL 문자열이 표시됨",
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
    "pptSource": "4장 10쪽"
  },
  {
    "id": "LINUX-032",
    "language": "linux",
    "level": "기초 응용",
    "topic": "셸 리다이렉션",
    "title": "출력을 파일에 저장하기",
    "statement": "echo로 출력하는 'hello'를 화면 대신 result.txt에 저장한다.",
    "input": "result.txt 파일이 없는 상태",
    "output": "result.txt에 hello 한 줄이 저장됨",
    "code": "echo hello > result.txt",
    "hint": "표준 출력과 출력 파일을 연결하는 문법을 생각한다.",
    "explanation": "출력 리다이렉션 >는 명령의 표준 출력을 파일로 보낸다. 파일이 이미 있으면 내용을 대체한다.",
    "initialState": "result.txt 파일이 없는 상태",
    "afterState": "result.txt에 hello 한 줄이 저장됨",
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
    "pptSource": "4장 13~15쪽"
  },
  {
    "id": "LINUX-033",
    "language": "linux",
    "level": "기초 응용",
    "topic": "셸 리다이렉션",
    "title": "기존 파일 끝에 내용 추가",
    "statement": "result.txt의 기존 hello 뒤에 world 한 줄을 추가한다.",
    "input": "result.txt의 첫 줄에 hello가 저장되어 있음",
    "output": "hello와 world가 차례로 두 줄에 표시됨",
    "code": "echo world >> result.txt\ncat result.txt",
    "hint": "내용을 덮어쓰는 경우와 끝에 추가하는 경우를 구별한다.",
    "explanation": "출력 리다이렉션 >>는 기존 내용 뒤에 출력 결과를 이어 붙인다.",
    "initialState": "result.txt의 첫 줄에 hello가 저장되어 있음",
    "afterState": "hello와 world가 차례로 두 줄에 표시됨",
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
    "pptSource": "4장 17쪽"
  },
  {
    "id": "LINUX-034",
    "language": "linux",
    "level": "기초 응용",
    "topic": "셸 에일리어스",
    "title": "명령어 별명 설정과 확인",
    "statement": "현재 셸에서 ls 명령을 실행할 때 파일 종류 기호가 표시되도록 별명을 설정하고, 설정된 별명 목록을 확인한다.",
    "input": "Ubuntu 터미널에서 ls를 기본 동작으로 사용하고 있는 상태",
    "output": "alias 출력에서 ls='ls -F' 설정을 확인할 수 있음",
    "code": "alias ls='ls -F'\nalias",
    "hint": "자주 쓰는 명령어에 기본 옵션을 지정한 뒤 등록된 별명 목록을 확인한다.",
    "explanation": "alias ls='ls -F'는 ls를 입력할 때 파일 종류를 표시하는 -F 옵션을 기본 적용하도록 별명을 지정한다. 인자 없이 alias를 실행하면 현재 별명 설정을 확인할 수 있다.",
    "initialState": "현재 셸에 ll 별명이 없는 상태",
    "afterState": "ll 실행 결과로 현재 디렉터리의 상세 정보가 표시됨",
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
    "pptSource": "4장 22~25쪽"
  },
  {
    "id": "LINUX-035",
    "language": "linux",
    "level": "기초 응용",
    "topic": "셸 명령 연결",
    "title": "세 가지 명령을 차례로 실행",
    "statement": "현재 날짜·시간, 현재 디렉터리 목록, 작업 디렉터리 경로를 순서대로 출력한다.",
    "input": "Ubuntu 터미널이 열린 상태",
    "output": "날짜·시간 → 목록 → 현재 경로 순서로 표시됨",
    "code": "date; ls; pwd",
    "hint": "명령어 사이의 구분 기호가 실행 순서에 미치는 영향을 생각한다.",
    "explanation": "세미콜론은 연결된 명령을 왼쪽부터 순서대로 실행한다.",
    "initialState": "Ubuntu 터미널이 열린 상태",
    "afterState": "날짜·시간 → 목록 → 현재 경로 순서로 표시됨",
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
    "pptSource": "1장 35쪽, 2장 10·13쪽, 4장 9쪽"
  },
  {
    "id": "LINUX-036",
    "language": "linux",
    "level": "기초 응용",
    "topic": "프로세스",
    "title": "현재 터미널 프로세스 상세 보기",
    "statement": "현재 터미널에서 실행한 프로세스들의 PID, PPID, 실행 명령 등 상세 정보를 확인한다.",
    "input": "Ubuntu 터미널이 실행 중인 상태",
    "output": "PID, PPID, CMD 등 자세한 프로세스 항목이 표시됨",
    "code": "ps -f",
    "hint": "기본 프로세스 목록과 상세 목록 항목을 비교한다.",
    "explanation": "ps -f는 현재 터미널 관련 프로세스의 상세 정보를 표시한다.",
    "initialState": "Ubuntu 터미널이 실행 중인 상태",
    "afterState": "PID, PPID, CMD 등 자세한 프로세스 항목이 표시됨",
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
    "pptSource": "6장 4~5쪽"
  },
  {
    "id": "LINUX-037",
    "language": "linux",
    "level": "기초 응용",
    "topic": "프로세스",
    "title": "시스템 전체 프로세스 자세히 보기",
    "statement": "시스템에서 실행 중인 전체 프로세스의 자세한 정보를 확인한다.",
    "input": "Ubuntu 시스템이 동작 중인 상태",
    "output": "시스템 전체 프로세스의 UID·PID·PPID·CMD 등이 출력됨",
    "code": "ps -ef",
    "hint": "전체 범위 선택 옵션과 상세 항목 선택 옵션을 결합한다.",
    "explanation": "ps -ef는 유닉스 형식의 -e 전체와 -f 상세 출력 옵션을 함께 적용한다.",
    "initialState": "Ubuntu 시스템이 동작 중인 상태",
    "afterState": "시스템 전체 프로세스의 UID·PID·PPID·CMD 등이 출력됨",
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
    "pptSource": "6장 4쪽, 9쪽"
  },
  {
    "id": "LINUX-038",
    "language": "linux",
    "level": "기초 응용",
    "topic": "프로세스",
    "title": "bash 프로세스 이름 함께 검색",
    "statement": "bash라는 이름이 포함된 프로세스의 PID와 프로세스 이름을 확인한다.",
    "input": "현재 시스템에 bash 프로세스가 실행 중인 상태",
    "output": "PID와 bash 프로세스 이름이 출력됨",
    "code": "pgrep -l bash",
    "hint": "PID만 확인하는 방법과 이름까지 확인하는 방법을 구별한다.",
    "explanation": "pgrep -l은 패턴에 일치하는 프로세스의 PID와 이름을 보여준다.",
    "initialState": "현재 시스템에 bash 프로세스가 실행 중인 상태",
    "afterState": "PID와 bash 프로세스 이름이 출력됨",
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
    "pptSource": "6장 14~15쪽"
  },
  {
    "id": "LINUX-039",
    "language": "linux",
    "level": "기초 응용",
    "topic": "프로세스",
    "title": "CPU·메모리 사용량 함께 확인",
    "statement": "시스템에서 실행 중인 프로세스의 사용자, CPU 비율, 메모리 비율을 확인한다.",
    "input": "Ubuntu 시스템이 동작 중인 상태",
    "output": "USER, %CPU, %MEM 등을 포함한 프로세스 정보가 출력됨",
    "code": "ps aux",
    "hint": "BSD 옵션은 하이픈 없이 사용하는 형식이다.",
    "explanation": "ps aux는 BSD 형식으로 전체 프로세스의 자세한 자원 사용량을 표시한다.",
    "initialState": "Ubuntu 시스템이 동작 중인 상태",
    "afterState": "USER, %CPU, %MEM 등을 포함한 프로세스 정보가 출력됨",
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
    "pptSource": "6장 4쪽, 11쪽"
  },
  {
    "id": "LINUX-040",
    "language": "linux",
    "level": "기초 응용",
    "topic": "디스크",
    "title": "파일 시스템의 남은 공간 확인",
    "statement": "디스크 사용량과 남은 공간을 GB·MB 등 읽기 쉬운 단위로 표시한다.",
    "input": "Ubuntu 파일 시스템이 마운트되어 있음",
    "output": "파일 시스템별 전체·사용·남은 공간 등이 읽기 쉬운 단위로 표시됨",
    "code": "df -h",
    "hint": "파일 시스템 전체 용량과 개별 디렉터리 사용량은 서로 다른 항목이다.",
    "explanation": "df -h는 파일 시스템별 용량을 사람이 읽기 쉬운 크기 단위로 출력한다.",
    "initialState": "Ubuntu 파일 시스템이 마운트되어 있음",
    "afterState": "파일 시스템별 전체·사용·남은 공간 등이 읽기 쉬운 단위로 표시됨",
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
    "pptSource": "7장 2~4쪽"
  },
  {
    "id": "LINUX-041",
    "language": "linux",
    "level": "종합 활용",
    "topic": "디스크 종합",
    "title": "파일 시스템 유형과 폴더 사용량 비교",
    "statement": "파일 시스템 종류를 확인한 뒤 docs 폴더가 사용한 총 공간을 읽기 쉬운 단위로 표시한다.",
    "input": "docs 디렉터리가 있고 파일이 포함되어 있음",
    "output": "첫 명령에서 파일 시스템 종류, 두 번째 명령에서 docs 폴더의 총사용량을 확인함",
    "code": "df -T\ndu -sh docs",
    "hint": "파일 시스템 단위 통계와 디렉터리 단위 통계를 구별한다.",
    "explanation": "df -T는 파일 시스템 종류를 보여준다. du의 -s와 -h는 지정한 디렉터리의 합계 사용량을 읽기 쉬운 단위로 표시한다.",
    "initialState": "docs 디렉터리가 있고 파일이 포함되어 있음",
    "afterState": "첫 명령에서 파일 시스템 종류, 두 번째 명령에서 docs 폴더의 총사용량을 확인함",
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
    "pptSource": "7장 2·5~8쪽"
  },
  {
    "id": "LINUX-042",
    "language": "linux",
    "level": "종합 활용",
    "topic": "프로세스 종합",
    "title": "전체 목록에서 특정 이름의 프로세스 찾기",
    "statement": "시스템 전체 프로세스 목록에서 bash 문자열이 포함된 줄만 검색한다.",
    "input": "Ubuntu에서 bash 프로세스가 실행 중인 상태",
    "output": "bash가 포함된 프로세스 정보 행들이 표시됨",
    "code": "ps -ef | grep bash",
    "hint": "앞 명령의 출력 결과를 뒤 명령의 검색 입력으로 전달한다.",
    "explanation": "|는 앞 명령의 출력을 뒤 명령의 입력으로 연결한다. ps -ef 결과를 grep이 검색한다.",
    "initialState": "Ubuntu에서 bash 프로세스가 실행 중인 상태",
    "afterState": "bash가 포함된 프로세스 정보 행들이 표시됨",
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
    "pptSource": "6장 9쪽, 13쪽, 2장 53쪽"
  },
  {
    "id": "LINUX-043",
    "language": "linux",
    "level": "종합 활용",
    "topic": "시스템 종료",
    "title": "예정된 시스템 재시작 취소하기",
    "statement": "기존에 예약한 shutdown 재시작 작업을 취소하는 명령을 작성한다. 실제 종료·재시작은 수행하지 않는다.",
    "input": "관리자가 재시작을 예약한 상태라고 가정",
    "output": "기존에 예약된 shutdown 작업이 취소됨",
    "code": "shutdown -c",
    "hint": "시스템 종료 예약과 기존 예약의 취소 기능을 구분한다.",
    "explanation": "shutdown -c는 이전에 예약한 shutdown 작업을 취소한다.",
    "initialState": "관리자가 재시작을 예약한 상태라고 가정",
    "afterState": "기존에 예약된 shutdown 작업이 취소됨",
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
    "pptSource": "8장 3~5쪽"
  },
  {
    "id": "LINUX-044",
    "language": "linux",
    "level": "종합 활용",
    "topic": "패키지 관리",
    "title": "패키지 검색 후 의존성 확인",
    "statement": "APT 캐시에서 vim 관련 패키지를 검색한 뒤 vim 패키지의 의존성 및 역의존성을 조회한다.",
    "input": "APT 패키지 정보가 저장된 Ubuntu 환경",
    "output": "vim 관련 패키지 목록과 의존성 정보가 차례로 표시됨",
    "code": "apt-cache search vim\napt-cache showpkg vim",
    "hint": "키워드 검색과 특정 패키지의 의존성 검색을 구분한다.",
    "explanation": "apt-cache search는 키워드 검색, showpkg는 패키지 의존성 및 역의존성 정보 표시다.",
    "initialState": "APT 패키지 정보가 저장된 Ubuntu 환경",
    "afterState": "vim 관련 패키지 목록과 의존성 정보가 차례로 표시됨",
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
    "pptSource": "9장 3쪽, 6~8쪽"
  },
  {
    "id": "LINUX-045",
    "language": "linux",
    "level": "종합 활용",
    "topic": "파일 아카이브",
    "title": "디렉터리를 묶고 목록 확인하기",
    "statement": "docs 디렉터리를 backup.tar 아카이브로 묶은 뒤 아카이브에 들어 있는 내용을 확인한다.",
    "input": "docs 폴더에 note.txt 파일이 있음. backup.tar는 없음",
    "output": "backup.tar가 생성되고 내부 목록에 docs 및 note.txt가 나타남",
    "code": "tar cvf backup.tar docs\ntar tvf backup.tar",
    "hint": "아카이브 생성 기능과 내용 보기 기능을 구분한다.",
    "explanation": "tar c는 새 아카이브 생성, t는 목록 출력, v는 처리 파일 표시, f는 아카이브 이름 지정이다.",
    "initialState": "docs 폴더에 note.txt 파일이 있음. backup.tar는 없음",
    "afterState": "backup.tar가 생성되고 내부 목록에 docs 및 note.txt가 나타남",
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
    "pptSource": "9장 20~23쪽"
  },
  {
    "id": "LINUX-046",
    "language": "linux",
    "level": "종합 활용",
    "topic": "파일 아카이브",
    "title": "기존 아카이브 파일 추출하기",
    "statement": "현재 디렉터리의 backup.tar에서 원래 파일과 디렉터리를 추출한다.",
    "input": "backup.tar에 docs/note.txt가 저장되어 있고 현재 위치에는 docs 폴더가 없음",
    "output": "docs/note.txt가 추출되어 존재함",
    "code": "tar xvf backup.tar",
    "hint": "아카이브 생성, 내용 확인, 추출의 기능 문자를 비교한다.",
    "explanation": "tar xvf는 아카이브의 원래 파일을 추출한다.",
    "initialState": "backup.tar에 docs/note.txt가 저장되어 있고 현재 위치에는 docs 폴더가 없음",
    "afterState": "docs/note.txt가 추출되어 존재함",
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
    "pptSource": "9장 20~24쪽"
  },
  {
    "id": "LINUX-047",
    "language": "linux",
    "level": "종합 활용",
    "topic": "파일 압축",
    "title": "압축 후 압축 파일의 내용 확인",
    "statement": "report.txt를 gzip으로 압축하고 압축을 해제하지 않은 채 내용을 화면에 표시한다.",
    "input": "report.txt에 hello 한 줄이 저장되어 있고 report.txt.gz는 없음",
    "output": "report.txt.gz가 생성되고 내용 확인 결과 hello가 표시됨",
    "code": "gzip report.txt\nzcat report.txt.gz",
    "hint": "압축 파일 자체를 읽는 방식과 압축을 푸는 방식을 구별한다.",
    "explanation": "gzip은 .gz 압축 파일을 생성한다. zcat은 gzip 압축 파일의 내용을 화면에 출력한다.",
    "initialState": "report.txt에 hello 한 줄이 저장되어 있고 report.txt.gz는 없음",
    "afterState": "report.txt.gz가 생성되고 내용 확인 결과 hello가 표시됨",
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
    "pptSource": "9장 28~30쪽"
  },
  {
    "id": "LINUX-048",
    "language": "linux",
    "level": "종합 활용",
    "topic": "사용자 정보",
    "title": "로그인 사용자와 소속 그룹 확인",
    "statement": "접속 중인 사용자 정보를 제목과 함께 출력하고 현재 사용자의 소속 그룹을 확인한다.",
    "input": "Ubuntu에 로그인하여 터미널을 실행 중인 상태",
    "output": "로그인 사용자 정보 항목 제목과 현재 소속 그룹 이름들이 표시됨",
    "code": "who -H\ngroups",
    "hint": "현재 접속한 사용자 정보와 계정의 그룹 소속 정보를 구분한다.",
    "explanation": "who -H는 로그인 사용자 정보의 제목을 함께 표시하고 groups는 사용자 소속 그룹을 보여준다.",
    "initialState": "Ubuntu에 로그인하여 터미널을 실행 중인 상태",
    "afterState": "로그인 사용자 정보 항목 제목과 현재 소속 그룹 이름들이 표시됨",
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
    "pptSource": "10장 41~42쪽, 45쪽"
  },
  {
    "id": "LINUX-049",
    "language": "linux",
    "level": "종합 활용",
    "topic": "작업 예약",
    "title": "현재 예약된 반복 작업 확인",
    "statement": "현재 사용자에게 설정된 crontab 반복 작업 목록을 읽기 전용으로 확인한다.",
    "input": "현재 사용자에게 crontab 작업이 있을 수도 없을 수도 있음",
    "output": "설정된 작업이 있으면 목록이 표시되고 없으면 crontab이 없다는 메시지가 나올 수 있음",
    "code": "crontab -l",
    "hint": "반복 작업 조회와 반복 작업 편집·삭제를 구별한다.",
    "explanation": "crontab -l은 현재 사용자에게 등록된 반복 실행 예약 내용을 조회한다.",
    "initialState": "현재 사용자에게 crontab 작업이 있을 수도 없을 수도 있음",
    "afterState": "설정된 작업이 있으면 목록이 표시되고 없으면 crontab이 없다는 메시지가 나올 수 있음",
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
    "pptSource": "6장 37~39쪽"
  },
  {
    "id": "LINUX-050",
    "language": "linux",
    "level": "종합 활용",
    "topic": "사용자 계정",
    "title": "사용자 생성 기본 설정 확인",
    "statement": "새 계정을 생성하지 않고 useradd 명령이 사용할 기본 그룹과 홈 디렉터리 등의 설정을 확인한다.",
    "input": "Ubuntu에서 사용자 계정 관리 기본 설정이 준비된 상태",
    "output": "GROUP, HOME, INACTIVE, EXPIRE, SHELL 등의 기본 설정 항목이 표시됨",
    "code": "useradd -D",
    "hint": "사용자 계정 생성과 계정 생성 시 사용할 기본값 확인을 구별한다.",
    "explanation": "useradd -D는 계정을 새로 만들지 않고 useradd의 기본 설정값을 출력한다.",
    "initialState": "Ubuntu에서 사용자 계정 관리 기본 설정이 준비된 상태",
    "afterState": "GROUP, HOME, INACTIVE, EXPIRE, SHELL 등의 기본 설정 항목이 표시됨",
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
    "pptSource": "10장 14쪽, 17~18쪽"
  }
];
