// Ubuntu 24 additional exercises; commands are examples, not browser-executed.
export const ubuntuAdvancedProblems = [
  {
    "id": "LINUX-027",
    "language": "linux",
    "topic": "파일 내용·검색",
    "title": "오류 문구와 줄 번호 검색",
    "level": "기초 응용",
    "statement": "app.log에서 ERROR 문자열이 포함된 줄과 해당 줄 번호를 표시하시오.",
    "input": "app.log의 2행과 5행에 ERROR가 있고 다른 행에는 없음",
    "output": "2:ERROR ... 및 5:ERROR ... 형태의 줄 표시",
    "code": "grep -n 'ERROR' app.log",
    "hint": "grep 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "grep — 문자열 패턴을 포함하는 줄 검색 / -n — 매칭된 줄 번호를 함께 출력 / 'ERROR' — 정확히 검색할 문자열(대소문자 구분)",
    "initialState": "app.log의 2행과 5행에 ERROR가 있고 다른 행에는 없음",
    "afterState": "원본 로그는 그대로 있고 ERROR가 포함된 줄이 표시",
    "commandParts": [
      {
        "token": "grep",
        "meaning": "문자열 패턴을 포함하는 줄 검색"
      },
      {
        "token": "-n",
        "meaning": "매칭된 줄 번호를 함께 출력"
      },
      {
        "token": "'ERROR'",
        "meaning": "정확히 검색할 문자열(대소문자 구분)"
      }
    ],
    "verification": "grep -n 'ERROR' app.log",
    "verificationDetail": "grep -n 'ERROR' app.log",
    "commonMistake": "grep는 기본적으로 대문자와 소문자를 구분합니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-028",
    "language": "linux",
    "topic": "파일 내용·검색",
    "title": "대소문자 구분 없는 검색",
    "level": "기초 응용",
    "statement": "notes.txt에서 ubuntu, Ubuntu, UBUNTU를 모두 검색하시오.",
    "input": "notes.txt에 'Ubuntu guide' 와 'ubuntu lab' 문장이 있음",
    "output": "대소문자와 관계없이 ubuntu를 포함한 줄 모두 표시",
    "code": "grep -i 'ubuntu' notes.txt",
    "hint": "grep 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "grep — 문자열이 포함된 행 찾기 / -i — 대소문자 구분 없이 비교 / 'ubuntu' — 검색할 문자열",
    "initialState": "notes.txt에 'Ubuntu guide' 와 'ubuntu lab' 문장이 있음",
    "afterState": "파일 변경 없음; 서로 다른 대소문자 형태의 매칭 행 출력",
    "commandParts": [
      {
        "token": "grep",
        "meaning": "문자열이 포함된 행 찾기"
      },
      {
        "token": "-i",
        "meaning": "대소문자 구분 없이 비교"
      },
      {
        "token": "'ubuntu'",
        "meaning": "검색할 문자열"
      }
    ],
    "verification": "grep -i 'ubuntu' notes.txt",
    "verificationDetail": "grep -i 'ubuntu' notes.txt",
    "commonMistake": "-i 옵션이 없으면 'Ubuntu'와 'ubuntu'는 별개로 인식됩니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-029",
    "language": "linux",
    "topic": "파일 내용·검색",
    "title": "파이썬 파일 찾기",
    "level": "기초 응용",
    "statement": "현재 실습 폴더와 하위 폴더에서 확장자가 .py인 일반 파일을 찾으시오.",
    "input": "현재 디렉터리의 src/main.py 및 tests/test.py가 존재",
    "output": "./src/main.py, ./tests/test.py 등의 경로 표시",
    "code": "find . -type f -name '*.py'",
    "hint": "find 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "find — 지정 경로를 재귀적으로 검색 / . — 현재 폴더부터 하위 전체 검색 / -type f — 일반 파일만 선택 / -name '*.py' — 파일 이름이 .py로 끝나는 항목 선택",
    "initialState": "현재 디렉터리의 src/main.py 및 tests/test.py가 존재",
    "afterState": "폴더와 파일은 변경되지 않고 .py 파일만 표시",
    "commandParts": [
      {
        "token": "find",
        "meaning": "지정 경로를 재귀적으로 검색"
      },
      {
        "token": ".",
        "meaning": "현재 폴더부터 하위 전체 검색"
      },
      {
        "token": "-type f",
        "meaning": "일반 파일만 선택"
      },
      {
        "token": "-name '*.py'",
        "meaning": "파일 이름이 .py로 끝나는 항목 선택"
      }
    ],
    "verification": "find . -type f -name '*.py'",
    "verificationDetail": "find . -type f -name '*.py'",
    "commonMistake": "*.py를 따옴표로 묶지 않으면 셸이 현재 디렉터리 파일 이름으로 먼저 확장할 수 있습니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-030",
    "language": "linux",
    "topic": "파일 내용·검색",
    "title": "하위 파일에서 TODO 검색",
    "level": "기초 응용",
    "statement": "src 폴더 아래 텍스트 파일들에서 TODO가 포함된 줄을 파일명과 줄 번호와 함께 찾으시오.",
    "input": "src 아래에 TODO가 들어 있는 코드 파일이 하나 이상 존재",
    "output": "src/file.py:줄번호:TODO ... 같은 결과",
    "code": "grep -rn 'TODO' src",
    "hint": "grep 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "grep — 문자열이 포함된 줄 검색 / -r — 하위 디렉터리까지 재귀 검색 / -n — 줄 번호 함께 출력 / src — 검색할 디렉터리",
    "initialState": "src 아래에 TODO가 들어 있는 코드 파일이 하나 이상 존재",
    "afterState": "파일 변경 없음; TODO 포함 위치가 파일명·행 번호로 출력",
    "commandParts": [
      {
        "token": "grep",
        "meaning": "문자열이 포함된 줄 검색"
      },
      {
        "token": "-r",
        "meaning": "하위 디렉터리까지 재귀 검색"
      },
      {
        "token": "-n",
        "meaning": "줄 번호 함께 출력"
      },
      {
        "token": "src",
        "meaning": "검색할 디렉터리"
      }
    ],
    "verification": "grep -rn 'TODO' src",
    "verificationDetail": "grep -rn 'TODO' src",
    "commonMistake": "바이너리 파일이 혼재된 디렉터리에서는 결과가 복잡할 수 있으니 코드 실습 폴더로 범위를 좁힙니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-031",
    "language": "linux",
    "topic": "파일 내용·검색",
    "title": "텍스트 줄 정렬",
    "level": "기초 응용",
    "statement": "names.txt의 각 행을 알파벳순으로 정렬해 화면에 보여 주시오.",
    "input": "names.txt에 Mina, Anna, John이 줄마다 들어 있음",
    "output": "Anna, John, Mina 순서로 출력",
    "code": "LC_ALL=C sort names.txt",
    "hint": "LC_ALL=C 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "LC_ALL=C — 로케일에 영향받지 않는 바이트 순서 정렬 / sort — 텍스트 줄을 정렬 / names.txt — 정렬할 원본 파일",
    "initialState": "names.txt에 Mina, Anna, John이 줄마다 들어 있음",
    "afterState": "원본 names.txt 순서는 그대로이고 정렬 결과만 화면에 표시",
    "commandParts": [
      {
        "token": "LC_ALL=C",
        "meaning": "로케일에 영향받지 않는 바이트 순서 정렬"
      },
      {
        "token": "sort",
        "meaning": "텍스트 줄을 정렬"
      },
      {
        "token": "names.txt",
        "meaning": "정렬할 원본 파일"
      }
    ],
    "verification": "LC_ALL=C sort names.txt",
    "verificationDetail": "LC_ALL=C sort names.txt",
    "commonMistake": "sort는 기본적으로 원본 파일을 수정하지 않습니다. 파일 저장은 리다이렉션을 별도로 사용합니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-032",
    "language": "linux",
    "topic": "사용자·파일 권한",
    "title": "파일의 현재 권한 표시",
    "level": "기초 응용",
    "statement": "note.txt의 소유자·그룹·접근 권한 정보를 확인하시오.",
    "input": "note.txt가 이미 존재",
    "output": "-rw-r--r-- 등 현재 권한과 소유자 정보 표시",
    "code": "ls -l note.txt",
    "hint": "ls 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "ls — 파일 목록과 속성 출력 / -l — 파일 권한, 링크 수, 소유자, 그룹, 크기 등을 출력",
    "initialState": "note.txt가 이미 존재",
    "afterState": "note.txt는 변경되지 않고 권한·소유자 정보만 표시",
    "commandParts": [
      {
        "token": "ls",
        "meaning": "파일 목록과 속성 출력"
      },
      {
        "token": "-l",
        "meaning": "파일 권한, 링크 수, 소유자, 그룹, 크기 등을 출력"
      }
    ],
    "verification": "ls -l note.txt",
    "verificationDetail": "ls -l note.txt",
    "commonMistake": "권한 표시는 파일 종류 문자와 사용자·그룹·기타 권한 순서로 읽습니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-033",
    "language": "linux",
    "topic": "사용자·파일 권한",
    "title": "스크립트 실행 권한 추가",
    "level": "기초 응용",
    "statement": "run.sh 파일의 소유자 실행 권한만 추가하시오.",
    "input": "run.sh가 존재하고 소유자 실행 권한은 없음",
    "output": "소유자 권한에 x가 추가됨",
    "code": "chmod u+x run.sh",
    "hint": "chmod 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "chmod — 파일 접근 권한 변경 / u — 소유자(user)를 지정 / +x — 기존 다른 권한을 유지하며 실행 권한 추가 / run.sh — 대상 스크립트",
    "initialState": "run.sh가 존재하고 소유자 실행 권한은 없음",
    "afterState": "소유자 실행 권한이 추가되고 나머지 권한은 유지",
    "commandParts": [
      {
        "token": "chmod",
        "meaning": "파일 접근 권한 변경"
      },
      {
        "token": "u",
        "meaning": "소유자(user)를 지정"
      },
      {
        "token": "+x",
        "meaning": "기존 다른 권한을 유지하며 실행 권한 추가"
      },
      {
        "token": "run.sh",
        "meaning": "대상 스크립트"
      }
    ],
    "verification": "ls -l run.sh",
    "verificationDetail": "ls -l run.sh",
    "commonMistake": "chmod u+x는 실행 권한을 부여하지만 스크립트 내용의 안전성을 보장하지는 않습니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-034",
    "language": "linux",
    "topic": "사용자·파일 권한",
    "title": "비밀 파일의 권한 제한",
    "level": "기초 응용",
    "statement": "secret.txt에 소유자만 읽기·쓰기 가능한 권한 600을 설정하시오.",
    "input": "secret.txt가 실습 폴더에 존재하며 소유자가 자신",
    "output": "-rw-------와 동등한 권한 설정",
    "code": "chmod 600 secret.txt",
    "hint": "chmod 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "chmod — 파일 권한 변경 / 600 — 소유자 읽기·쓰기(6), 그룹·기타 아무 권한 없음(0) / secret.txt — 대상 파일",
    "initialState": "secret.txt가 실습 폴더에 존재하며 소유자가 자신",
    "afterState": "파일 권한: 기존 값 → 600",
    "commandParts": [
      {
        "token": "chmod",
        "meaning": "파일 권한 변경"
      },
      {
        "token": "600",
        "meaning": "소유자 읽기·쓰기(6), 그룹·기타 아무 권한 없음(0)"
      },
      {
        "token": "secret.txt",
        "meaning": "대상 파일"
      }
    ],
    "verification": "stat -c '%a %n' secret.txt",
    "verificationDetail": "stat -c '%a %n' secret.txt",
    "commonMistake": "chmod 600은 일반 파일의 권한 설정입니다. 소유자나 특수 ACL 상황에 따라 추가 권한 해석이 달라질 수 있습니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-035",
    "language": "linux",
    "topic": "사용자·파일 권한",
    "title": "실행 파일 권한 755 설정",
    "level": "기초 응용",
    "statement": "tool.sh에 소유자는 읽기·쓰기·실행, 나머지는 읽기·실행 권한을 설정하시오.",
    "input": "tool.sh가 존재하고 소유자가 자신",
    "output": "-rwxr-xr-x와 동등한 권한 설정",
    "code": "chmod 755 tool.sh",
    "hint": "chmod 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "chmod — 파일 접근 권한 변경 / 755 — 소유자 7(rwx), 그룹 5(r-x), 기타 5(r-x)",
    "initialState": "tool.sh가 존재하고 소유자가 자신",
    "afterState": "tool.sh의 기본 권한 숫자가 755로 변경",
    "commandParts": [
      {
        "token": "chmod",
        "meaning": "파일 접근 권한 변경"
      },
      {
        "token": "755",
        "meaning": "소유자 7(rwx), 그룹 5(r-x), 기타 5(r-x)"
      }
    ],
    "verification": "stat -c '%a %n' tool.sh",
    "verificationDetail": "stat -c '%a %n' tool.sh",
    "commonMistake": "다른 사용자의 실행이 필요하지 않은 개인 스크립트에는 과도하게 넓은 권한을 주지 않는 편이 안전합니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-036",
    "language": "linux",
    "topic": "사용자·파일 권한",
    "title": "현재 사용자와 그룹 확인",
    "level": "기초 응용",
    "statement": "현재 로그인한 사용자 이름과 자신이 속한 그룹을 각각 확인하시오.",
    "input": "일반 사용자 세션에서 실행",
    "output": "사용자 이름과 소속 그룹 목록 출력",
    "code": "id -un\ngroups",
    "hint": "id -un 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "id -un — 현재 사용자 이름만 출력 / groups — 현재 사용자의 그룹 목록 확인",
    "initialState": "일반 사용자 세션에서 실행",
    "afterState": "시스템 정보 조회만 수행하며 계정·권한은 변경 없음",
    "commandParts": [
      {
        "token": "id -un",
        "meaning": "현재 사용자 이름만 출력"
      },
      {
        "token": "groups",
        "meaning": "현재 사용자의 그룹 목록 확인"
      }
    ],
    "verification": "id -un\ngroups",
    "verificationDetail": "id -un",
    "commonMistake": "실제 사용자 이름과 그룹 이름은 컴퓨터마다 다르므로 정해진 문자열을 출력값으로 쓰지 않습니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-037",
    "language": "linux",
    "topic": "시스템·프로세스",
    "title": "커널 버전 확인",
    "level": "종합 활용",
    "statement": "현재 Ubuntu에서 실행 중인 Linux 커널 버전 정보를 확인하시오.",
    "input": "Ubuntu 터미널 실행 중",
    "output": "현재 커널 릴리스 번호 표시",
    "code": "uname -r",
    "hint": "uname 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "uname — 시스템의 커널 정보를 출력 / -r — 커널 릴리스 문자열만 표시",
    "initialState": "Ubuntu 터미널 실행 중",
    "afterState": "시스템 변경 없이 커널 버전 문자열 출력",
    "commandParts": [
      {
        "token": "uname",
        "meaning": "시스템의 커널 정보를 출력"
      },
      {
        "token": "-r",
        "meaning": "커널 릴리스 문자열만 표시"
      }
    ],
    "verification": "uname -r",
    "verificationDetail": "uname -r",
    "commonMistake": "Ubuntu 배포판 버전과 Linux 커널 버전은 서로 다른 정보입니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-038",
    "language": "linux",
    "topic": "시스템·프로세스",
    "title": "현재 디렉터리 저장 공간",
    "level": "종합 활용",
    "statement": "현재 작업 디렉터리가 위치한 파일 시스템의 사용량과 남은 공간을 읽기 쉬운 단위로 확인하시오.",
    "input": "Ubuntu 실습 디렉터리에서 실행",
    "output": "파일 시스템의 전체·사용·여유 공간 표시",
    "code": "df -h .",
    "hint": "df 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "df — 파일 시스템 단위 사용량 출력 / -h — 용량을 사람이 읽기 쉬운 단위로 표시 / . — 현재 작업 디렉터리가 속한 파일 시스템 선택",
    "initialState": "Ubuntu 실습 디렉터리에서 실행",
    "afterState": "디스크 공간은 변경되지 않고 현재 가용 공간이 표시",
    "commandParts": [
      {
        "token": "df",
        "meaning": "파일 시스템 단위 사용량 출력"
      },
      {
        "token": "-h",
        "meaning": "용량을 사람이 읽기 쉬운 단위로 표시"
      },
      {
        "token": ".",
        "meaning": "현재 작업 디렉터리가 속한 파일 시스템 선택"
      }
    ],
    "verification": "df -h .",
    "verificationDetail": "df -h .",
    "commonMistake": "df는 디스크 파일 시스템 용량을 보여 줍니다. 특정 폴더 크기는 du를 사용합니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-039",
    "language": "linux",
    "topic": "시스템·프로세스",
    "title": "메모리 사용 상태 확인",
    "level": "종합 활용",
    "statement": "현재 시스템의 메모리 총량·사용량·가용량을 확인하시오.",
    "input": "Ubuntu에서 free 명령을 사용할 수 있음",
    "output": "Mem 행의 total, used, available 등이 표시",
    "code": "free -h",
    "hint": "free 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "free — 메모리 사용량 정보 표시 / -h — KiB/MiB/GiB 등 사람이 읽기 쉬운 단위로 표시",
    "initialState": "Ubuntu에서 free 명령을 사용할 수 있음",
    "afterState": "메모리 값은 조회 시점에 따라 달라지고 설정은 변경되지 않음",
    "commandParts": [
      {
        "token": "free",
        "meaning": "메모리 사용량 정보 표시"
      },
      {
        "token": "-h",
        "meaning": "KiB/MiB/GiB 등 사람이 읽기 쉬운 단위로 표시"
      }
    ],
    "verification": "free -h",
    "verificationDetail": "free -h",
    "commonMistake": "available은 단순 free와 다릅니다. 캐시 회수 가능량 등을 고려한 사용 가능 메모리의 추정치입니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-040",
    "language": "linux",
    "topic": "시스템·프로세스",
    "title": "현재 프로세스 목록 확인",
    "level": "종합 활용",
    "statement": "현재 시스템에서 실행 중인 프로세스 정보를 목록으로 확인하시오.",
    "input": "일반 사용자 계정에서 실행",
    "output": "PID와 실행 명령어를 포함한 프로세스 목록 표시",
    "code": "ps -ef",
    "hint": "ps 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "ps — 프로세스 상태 목록 표시 / -e — 전체 프로세스를 대상으로 조회 / -f — UID, PID 등의 상세 정보 출력",
    "initialState": "일반 사용자 계정에서 실행",
    "afterState": "프로세스를 종료하거나 시작하지 않고 실행 목록만 조회",
    "commandParts": [
      {
        "token": "ps",
        "meaning": "프로세스 상태 목록 표시"
      },
      {
        "token": "-e",
        "meaning": "전체 프로세스를 대상으로 조회"
      },
      {
        "token": "-f",
        "meaning": "UID, PID 등의 상세 정보 출력"
      }
    ],
    "verification": "ps -ef",
    "verificationDetail": "ps -ef",
    "commonMistake": "PID 값은 실행할 때마다 달라질 수 있습니다. 출력값을 고정 정답으로 취급하지 마세요.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-041",
    "language": "linux",
    "topic": "시스템·프로세스",
    "title": "시스템 부하와 가동 시간",
    "level": "종합 활용",
    "statement": "현재 시스템의 가동 시간과 평균 부하를 확인하시오.",
    "input": "Ubuntu 로그인 세션이 있음",
    "output": "가동 시간 및 1분·5분·15분 평균 부하 표시",
    "code": "uptime",
    "hint": "uptime 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "uptime — 시스템 실행 시간·사용자 수·로드 평균 표시",
    "initialState": "Ubuntu 로그인 세션이 있음",
    "afterState": "시스템 상태는 변경되지 않고 실시간 정보만 표시",
    "commandParts": [
      {
        "token": "uptime",
        "meaning": "시스템 실행 시간·사용자 수·로드 평균 표시"
      }
    ],
    "verification": "uptime",
    "verificationDetail": "uptime",
    "commonMistake": "로드 평균은 CPU 사용률과 같은 숫자가 아니며 프로세스 대기 상태도 반영합니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-042",
    "language": "linux",
    "topic": "네트워크·패키지",
    "title": "네트워크 인터페이스 목록",
    "level": "종합 활용",
    "statement": "네트워크 장치 이름과 주소를 간단한 형식으로 확인하시오.",
    "input": "Ubuntu에 iproute2 패키지와 ip 명령이 설치되어 있음",
    "output": "lo, enp... 등의 인터페이스 이름과 주소 표시",
    "code": "ip -br addr",
    "hint": "ip 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "ip — Linux 네트워크 인터페이스 및 경로 정보 조회 / -br — brief: 한 줄씩 간단히 표시 / addr — 인터페이스 IP 주소 정보 표시",
    "initialState": "Ubuntu에 iproute2 패키지와 ip 명령이 설치되어 있음",
    "afterState": "네트워크 설정은 유지되고 인터페이스 정보만 표시",
    "commandParts": [
      {
        "token": "ip",
        "meaning": "Linux 네트워크 인터페이스 및 경로 정보 조회"
      },
      {
        "token": "-br",
        "meaning": "brief: 한 줄씩 간단히 표시"
      },
      {
        "token": "addr",
        "meaning": "인터페이스 IP 주소 정보 표시"
      }
    ],
    "verification": "ip -br addr",
    "verificationDetail": "ip -br addr",
    "commonMistake": "장치 이름과 IP 주소는 컴퓨터마다 다릅니다. lo는 루프백 인터페이스입니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-043",
    "language": "linux",
    "topic": "네트워크·패키지",
    "title": "네트워크 기본 경로 확인",
    "level": "종합 활용",
    "statement": "현재 시스템의 라우팅 테이블을 확인하시오.",
    "input": "Ubuntu에 ip 명령이 설치되어 있고 네트워크가 구성됨",
    "output": "default via ... 와 목적지별 경로 정보 표시",
    "code": "ip route",
    "hint": "ip 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "ip — 네트워크 구성 정보 확인 / route — 현재 라우팅 테이블 표시",
    "initialState": "Ubuntu에 ip 명령이 설치되어 있고 네트워크가 구성됨",
    "afterState": "네트워크 설정 변경 없이 등록된 경로만 출력",
    "commandParts": [
      {
        "token": "ip",
        "meaning": "네트워크 구성 정보 확인"
      },
      {
        "token": "route",
        "meaning": "현재 라우팅 테이블 표시"
      }
    ],
    "verification": "ip route",
    "verificationDetail": "ip route",
    "commonMistake": "기본 게이트웨이 주소와 인터페이스 이름은 컴퓨터마다 다릅니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-044",
    "language": "linux",
    "topic": "네트워크·패키지",
    "title": "도메인 이름의 IP 조회",
    "level": "종합 활용",
    "statement": "example.com 도메인의 IP 주소를 이름 서비스로 조회하시오.",
    "input": "인터넷 연결 및 DNS 이름 해석이 가능한 실습 환경",
    "output": "해석된 IP 주소가 포함된 결과 표시",
    "code": "getent ahostsv4 example.com",
    "hint": "getent 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "getent — 시스템 이름 서비스 데이터베이스 조회 / ahostsv4 — IPv4 주소 조회 / example.com — 조회할 예시 도메인",
    "initialState": "인터넷 연결 및 DNS 이름 해석이 가능한 실습 환경",
    "afterState": "DNS 조회만 수행하고 설정이나 파일은 변경하지 않음",
    "commandParts": [
      {
        "token": "getent",
        "meaning": "시스템 이름 서비스 데이터베이스 조회"
      },
      {
        "token": "ahostsv4",
        "meaning": "IPv4 주소 조회"
      },
      {
        "token": "example.com",
        "meaning": "조회할 예시 도메인"
      }
    ],
    "verification": "getent ahostsv4 example.com",
    "verificationDetail": "getent ahostsv4 example.com",
    "commonMistake": "인터넷 또는 DNS가 끊겨 있다면 명령이 실패할 수 있습니다. IP는 시점·환경에 따라 달라질 수 있습니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-045",
    "language": "linux",
    "topic": "네트워크·패키지",
    "title": "패키지 후보 버전 확인",
    "level": "종합 활용",
    "statement": "python3 패키지의 설치 버전과 설치 후보 버전을 확인하시오.",
    "input": "Ubuntu APT 기반 환경, 패키지 메타데이터가 준비됨",
    "output": "Installed 및 Candidate 등 버전 정보 표시",
    "code": "apt-cache policy python3",
    "hint": "apt-cache 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "apt-cache — APT 캐시에 저장된 패키지 메타데이터 조회 / policy — 설치 버전과 사용 가능한 후보 버전 확인 / python3 — 조회할 패키지 이름",
    "initialState": "Ubuntu APT 기반 환경, 패키지 메타데이터가 준비됨",
    "afterState": "시스템에 패키지를 설치하지 않고 버전 정보만 확인",
    "commandParts": [
      {
        "token": "apt-cache",
        "meaning": "APT 캐시에 저장된 패키지 메타데이터 조회"
      },
      {
        "token": "policy",
        "meaning": "설치 버전과 사용 가능한 후보 버전 확인"
      },
      {
        "token": "python3",
        "meaning": "조회할 패키지 이름"
      }
    ],
    "verification": "apt-cache policy python3",
    "verificationDetail": "apt-cache policy python3",
    "commonMistake": "apt-cache 조회 결과는 배포판 및 패키지 목록 갱신 시점에 따라 다릅니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-046",
    "language": "linux",
    "topic": "네트워크·패키지",
    "title": "설치된 패키지 상태 확인",
    "level": "종합 활용",
    "statement": "현재 시스템에 python3 패키지가 설치되었는지 dpkg로 확인하시오.",
    "input": "Ubuntu의 dpkg 기반 환경",
    "output": "python3 패키지의 설치 상태·버전·아키텍처 표시",
    "code": "dpkg-query -W -f='${Status} ${Version}\\n' python3",
    "hint": "dpkg-query 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "dpkg-query — 설치 패키지 데이터베이스 조회 / -W — 지정한 패키지 정보 표시 / -f — 출력할 설치 상태·버전 형식 지정",
    "initialState": "Ubuntu의 dpkg 기반 환경",
    "afterState": "설치 상태는 바뀌지 않고 install ok installed 등의 상태를 출력",
    "commandParts": [
      {
        "token": "dpkg-query",
        "meaning": "설치 패키지 데이터베이스 조회"
      },
      {
        "token": "-W",
        "meaning": "지정한 패키지 정보 표시"
      },
      {
        "token": "-f",
        "meaning": "출력할 설치 상태·버전 형식 지정"
      }
    ],
    "verification": "dpkg-query -W -f='${Status} ${Version}\\n' python3",
    "verificationDetail": "dpkg-query -W -f='${Status} ${Version}\\n' python3",
    "commonMistake": "패키지가 설치되지 않았다면 0이 아닌 종료 상태와 오류 메시지가 나올 수 있습니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-047",
    "language": "linux",
    "topic": "파이프·리다이렉션",
    "title": "명령 결과를 파일에 저장",
    "level": "종합 활용",
    "statement": "hello 한 줄을 greeting.txt라는 새 파일에 저장하시오.",
    "input": "greeting.txt가 없는 개인 연습 폴더",
    "output": "greeting.txt 내용이 hello 한 줄",
    "code": "printf 'hello\\n' > greeting.txt",
    "hint": "printf 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "printf — 문자열을 정해진 형식으로 출력 / \\n — 줄바꿈 문자 / > — 표준 출력을 파일로 저장하며 기존 파일이면 덮어씀",
    "initialState": "greeting.txt가 없는 개인 연습 폴더",
    "afterState": "greeting.txt 없음 → 내용 hello가 포함된 파일 생성",
    "commandParts": [
      {
        "token": "printf",
        "meaning": "문자열을 정해진 형식으로 출력"
      },
      {
        "token": "\\n",
        "meaning": "줄바꿈 문자"
      },
      {
        "token": ">",
        "meaning": "표준 출력을 파일로 저장하며 기존 파일이면 덮어씀"
      }
    ],
    "verification": "cat greeting.txt",
    "verificationDetail": "cat greeting.txt",
    "commonMistake": ">를 기존 파일에 사용하면 내용을 덮어씁니다. 실습 문제에서는 파일이 없는 상태를 전제로 합니다.",
    "warning": "중요한 파일 이름에 >를 사용하지 마세요. 기존 내용이 지워집니다.",
    "trace": []
  },
  {
    "id": "LINUX-048",
    "language": "linux",
    "topic": "파이프·리다이렉션",
    "title": "파일 끝에 새로운 줄 추가",
    "level": "종합 활용",
    "statement": "기존 greeting.txt의 hello를 보존하면서 다음 줄에 world를 추가하시오.",
    "input": "greeting.txt에 hello 한 줄과 마지막 개행이 저장되어 있음",
    "output": "hello 다음 줄에 world가 추가",
    "code": "printf 'world\\n' >> greeting.txt",
    "hint": "printf 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "printf — 추가할 문자열 출력 / >> — 파일 끝에 표준 출력을 추가(append)",
    "initialState": "greeting.txt에 hello 한 줄과 마지막 개행이 저장되어 있음",
    "afterState": "greeting.txt: hello 한 줄 → hello와 world 두 줄",
    "commandParts": [
      {
        "token": "printf",
        "meaning": "추가할 문자열 출력"
      },
      {
        "token": ">>",
        "meaning": "파일 끝에 표준 출력을 추가(append)"
      }
    ],
    "verification": "cat greeting.txt",
    "verificationDetail": "cat greeting.txt",
    "commonMistake": ">는 덮어쓰기, >>는 이어 쓰기입니다. 기존 문장이 줄바꿈으로 끝나는지 확인하세요.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-049",
    "language": "linux",
    "topic": "파이프·리다이렉션",
    "title": "오류 로그 줄 수 세기",
    "level": "종합 활용",
    "statement": "app.log에서 ERROR가 포함된 줄의 수만 출력하시오.",
    "input": "app.log에서 ERROR가 포함된 행이 정확히 두 줄",
    "output": "숫자 2 표시",
    "code": "grep 'ERROR' app.log | wc -l",
    "hint": "grep 'ERROR' app.log 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "grep 'ERROR' app.log — ERROR 문자열이 포함된 줄만 표준 출력 / | — 왼쪽 명령의 표준 출력을 오른쪽 명령의 표준 입력으로 연결 / wc -l — 전달받은 매칭 행의 줄 수를 계산",
    "initialState": "app.log에서 ERROR가 포함된 행이 정확히 두 줄",
    "afterState": "app.log 변경 없음; ERROR 매칭 행 수 2 출력",
    "commandParts": [
      {
        "token": "grep 'ERROR' app.log",
        "meaning": "ERROR 문자열이 포함된 줄만 표준 출력"
      },
      {
        "token": "|",
        "meaning": "왼쪽 명령의 표준 출력을 오른쪽 명령의 표준 입력으로 연결"
      },
      {
        "token": "wc -l",
        "meaning": "전달받은 매칭 행의 줄 수를 계산"
      }
    ],
    "verification": "grep 'ERROR' app.log | wc -l",
    "verificationDetail": "grep 'ERROR' app.log | wc -l",
    "commonMistake": "grep는 기본적으로 대소문자를 구분합니다. ERROR와 error는 다르게 취급합니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  },
  {
    "id": "LINUX-050",
    "language": "linux",
    "topic": "파이프·리다이렉션",
    "title": "중복 이름 제거 후 정렬",
    "level": "종합 활용",
    "statement": "names.txt를 알파벳순 정렬하고 중복된 줄을 하나만 표시하시오.",
    "input": "names.txt는 Mina, Anna, Mina가 각각 한 줄에 있음",
    "output": "Anna 다음 줄에 Mina 출력",
    "code": "LC_ALL=C sort names.txt | uniq",
    "hint": "LC_ALL=C 명령어의 목적과 옵션을 생각하고, 출력 또는 파일 상태를 확인하는 방법도 떠올려 보세요.",
    "explanation": "LC_ALL=C — 정렬 기준을 바이트 순서로 고정 / sort names.txt — 파일 내용을 정렬하여 표준 출력 / | — 출력을 다음 명령 입력으로 연결 / uniq — 연속되는 중복 행을 하나로 합침",
    "initialState": "names.txt는 Mina, Anna, Mina가 각각 한 줄에 있음",
    "afterState": "원본 파일 변경 없음; 출력은 Anna, Mina 순서로 두 줄",
    "commandParts": [
      {
        "token": "LC_ALL=C",
        "meaning": "정렬 기준을 바이트 순서로 고정"
      },
      {
        "token": "sort names.txt",
        "meaning": "파일 내용을 정렬하여 표준 출력"
      },
      {
        "token": "|",
        "meaning": "출력을 다음 명령 입력으로 연결"
      },
      {
        "token": "uniq",
        "meaning": "연속되는 중복 행을 하나로 합침"
      }
    ],
    "verification": "LC_ALL=C sort names.txt | uniq",
    "verificationDetail": "LC_ALL=C sort names.txt | uniq",
    "commonMistake": "uniq는 연속된 중복 행만 제거합니다. 먼저 sort하지 않으면 떨어진 중복은 남을 수 있습니다.",
    "warning": "운영체제 상태가 달라질 수 있는 명령어는 개인 실습 환경에서만 확인하세요.",
    "trace": []
  }
];
