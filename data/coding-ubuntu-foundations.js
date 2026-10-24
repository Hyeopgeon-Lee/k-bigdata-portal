// Ubuntu 24 exercises; no shell commands are executed in the browser.
export const ubuntuFoundationProblems = [
  {
    "id": "LINUX-003",
    "language": "linux",
    "topic": "디렉터리 탐색",
    "title": "현재 작업 디렉터리 확인",
    "level": "입문",
    "statement": "현재 터미널의 작업 디렉터리 절대경로를 확인하시오.",
    "input": "사용자 홈의 실습 디렉터리에서 실행",
    "output": "현재 디렉터리의 절대경로 표시",
    "code": "pwd",
    "hint": "pwd는 현재 셸의 작업 디렉터리를 절대경로로 보여 줍니다. 경로는 사용자별로 다를 수 있습니다.",
    "explanation": "pwd — 현재 작업 디렉터리의 절대경로를 출력",
    "initialState": "사용자 홈의 실습 디렉터리에서 실행",
    "afterState": "작업 디렉터리는 유지되고 현재 경로가 표시됨",
    "commandParts": [
      {
        "token": "pwd",
        "meaning": "현재 작업 디렉터리의 절대경로를 출력"
      }
    ],
    "verification": "pwd",
    "verificationDetail": "cd 명령을 실행하지 않았으므로 위치는 변경되지 않습니다.",
    "commonMistake": "pwd 출력은 사용자마다 달라집니다. 경로 자체를 외워 정답으로 사용하지 마세요.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-004",
    "language": "linux",
    "topic": "디렉터리 탐색",
    "title": "현재 디렉터리 내용 목록",
    "level": "입문",
    "statement": "현재 디렉터리의 파일과 폴더 이름을 확인하시오.",
    "input": "실습 디렉터리에 a.txt와 docs 폴더가 존재",
    "output": "a.txt 및 docs 이름 확인",
    "code": "ls",
    "hint": "ls를 옵션 없이 실행하면 현재 디렉터리의 파일·폴더 이름을 보여 줍니다. 숨김 항목은 기본적으로 보이지 않습니다.",
    "explanation": "ls — 숨김 파일을 제외한 일반 목록 출력",
    "initialState": "실습 디렉터리에 a.txt와 docs 폴더가 존재",
    "afterState": "파일이나 디렉터리를 변경하지 않음; 목록만 표시",
    "commandParts": [
      {
        "token": "ls",
        "meaning": "숨김 파일을 제외한 일반 목록 출력"
      }
    ],
    "verification": "ls",
    "verificationDetail": "ls",
    "commonMistake": "숨김 파일 이름이 나타나지 않는 것은 오류가 아닙니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-005",
    "language": "linux",
    "topic": "디렉터리 탐색",
    "title": "숨김 파일까지 보기",
    "level": "입문",
    "statement": "점(.)으로 시작하는 숨김 파일까지 목록에 표시하시오.",
    "input": "실습 디렉터리에 .env 와 note.txt가 존재",
    "output": ".env, note.txt 등 표시",
    "code": "ls -a",
    "hint": "점(.)으로 시작하는 숨김 파일도 보려면 ls의 -a 옵션을 사용하세요.",
    "explanation": "ls — 파일 목록 확인 / -a — 점으로 시작하는 숨김 항목까지 모두 표시",
    "initialState": "실습 디렉터리에 .env 와 note.txt가 존재",
    "afterState": "디렉터리 내용은 변경되지 않고 .env 등 숨김 항목이 표시됨",
    "commandParts": [
      {
        "token": "ls",
        "meaning": "파일 목록 확인"
      },
      {
        "token": "-a",
        "meaning": "점으로 시작하는 숨김 항목까지 모두 표시"
      }
    ],
    "verification": "ls -a",
    "verificationDetail": "ls -a",
    "commonMistake": "숨김 파일은 이름이 점으로 시작합니다. -a 출력에는 . 및 ..도 포함됩니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-006",
    "language": "linux",
    "topic": "디렉터리 탐색",
    "title": "파일 크기 읽기 쉽게 표시",
    "level": "입문",
    "statement": "파일 크기가 사람이 읽기 쉬운 단위로 표시되도록 상세 목록을 출력하시오.",
    "input": "실습 폴더에 여러 크기의 파일이 있음",
    "output": "파일 크기와 권한 등 자세한 정보 표시",
    "code": "ls -lh",
    "hint": "ls에서 -l은 상세 정보를, -h는 크기를 K·M 등 읽기 쉬운 단위로 표시하는 옵션입니다.",
    "explanation": "ls — 디렉터리 목록 출력 / -l — 권한·소유자·크기 등 상세 목록 / -h — 파일 크기를 K, M 같은 사람이 읽기 쉬운 단위로 표시",
    "initialState": "실습 폴더에 여러 크기의 파일이 있음",
    "afterState": "파일을 변경하지 않고 크기·수정 시각 등을 화면에 표시",
    "commandParts": [
      {
        "token": "ls",
        "meaning": "디렉터리 목록 출력"
      },
      {
        "token": "-l",
        "meaning": "권한·소유자·크기 등 상세 목록"
      },
      {
        "token": "-h",
        "meaning": "파일 크기를 K, M 같은 사람이 읽기 쉬운 단위로 표시"
      }
    ],
    "verification": "ls -lh",
    "verificationDetail": "ls -lh",
    "commonMistake": "-h는 -l 등 크기 출력이 있는 형식과 함께 사용해야 학습 효과가 있습니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-007",
    "language": "linux",
    "topic": "디렉터리 탐색",
    "title": "하위 폴더로 이동",
    "level": "입문",
    "statement": "현재 폴더 아래에 이미 존재하는 project 폴더로 이동한 후 현재 위치를 확인하시오.",
    "input": "현재 폴더 안에 project 디렉터리가 존재",
    "output": "현재 경로의 끝이 /project",
    "code": "cd project\npwd",
    "hint": "cd 다음에 이동할 디렉터리 이름을 쓰고 pwd로 변경된 위치를 확인해 보세요.",
    "explanation": "cd — 셸의 현재 작업 디렉터리를 변경 / project — 이동할 상대경로 / pwd — 이동 후 현재 디렉터리를 표시",
    "initialState": "현재 폴더 안에 project 디렉터리가 존재",
    "afterState": "작업 디렉터리가 원래 경로에서 project로 변경",
    "commandParts": [
      {
        "token": "cd",
        "meaning": "셸의 현재 작업 디렉터리를 변경"
      },
      {
        "token": "project",
        "meaning": "이동할 상대경로"
      },
      {
        "token": "pwd",
        "meaning": "이동 후 현재 디렉터리를 표시"
      }
    ],
    "verification": "pwd",
    "verificationDetail": "pwd",
    "commonMistake": "cd는 명령을 실행한 현재 셸의 위치를 바꿉니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-008",
    "language": "linux",
    "topic": "디렉터리 탐색",
    "title": "상위 디렉터리 이동",
    "level": "입문",
    "statement": "project 폴더에서 바로 상위 디렉터리로 이동하고 경로를 확인하시오.",
    "input": "현재 위치가 /home/student/lab/project 라고 가정",
    "output": "/home/student/lab",
    "code": "cd ..\npwd",
    "hint": "상위 디렉터리를 뜻하는 상대경로 '..'을 cd와 함께 사용해 보세요.",
    "explanation": "cd — 현재 작업 디렉터리 이동 / .. — 부모 디렉터리를 나타내는 상대경로 / pwd — 이동 완료 후 현재 위치 표시",
    "initialState": "현재 위치가 /home/student/lab/project 라고 가정",
    "afterState": "작업 위치: /home/student/lab/project → /home/student/lab",
    "commandParts": [
      {
        "token": "cd",
        "meaning": "현재 작업 디렉터리 이동"
      },
      {
        "token": "..",
        "meaning": "부모 디렉터리를 나타내는 상대경로"
      },
      {
        "token": "pwd",
        "meaning": "이동 완료 후 현재 위치 표시"
      }
    ],
    "verification": "pwd",
    "verificationDetail": "pwd",
    "commonMistake": "..은 상위 폴더, .은 현재 폴더를 뜻합니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-009",
    "language": "linux",
    "topic": "디렉터리 탐색",
    "title": "사용자 홈으로 이동",
    "level": "입문",
    "statement": "현재 위치와 상관없이 자신의 홈 디렉터리로 이동하시오.",
    "input": "현재 디렉터리는 홈 밖에 있음",
    "output": "사용자 홈 디렉터리로 이동",
    "code": "cd ~\npwd",
    "hint": "물결표 '~'는 현재 사용자의 홈 디렉터리를 뜻합니다. 이동한 뒤 pwd로 위치를 확인하세요.",
    "explanation": "cd — 작업 디렉터리를 변경 / ~ — 현재 사용자 홈 디렉터리 경로 / pwd — 홈 경로 확인",
    "initialState": "현재 디렉터리는 홈 밖에 있음",
    "afterState": "작업 디렉터리가 사용자의 홈으로 변경",
    "commandParts": [
      {
        "token": "cd",
        "meaning": "작업 디렉터리를 변경"
      },
      {
        "token": "~",
        "meaning": "현재 사용자 홈 디렉터리 경로"
      },
      {
        "token": "pwd",
        "meaning": "홈 경로 확인"
      }
    ],
    "verification": "pwd",
    "verificationDetail": "pwd",
    "commonMistake": "~의 실제 경로는 사용자 환경에 따라 달라집니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-010",
    "language": "linux",
    "topic": "디렉터리 탐색",
    "title": "바로 아래 폴더만 검색",
    "level": "입문",
    "statement": "현재 디렉터리 자신과 그 바로 아래 한 단계에 있는 디렉터리의 경로만 출력하시오.",
    "input": "현재 폴더 아래 docs 및 src 존재",
    "output": "현재 폴더와 바로 아래 디렉터리 경로 표시",
    "code": "find . -maxdepth 1 -type d",
    "hint": "find에서 -maxdepth 1은 현재 디렉터리와 바로 아래 단계까지만, -type d는 디렉터리만 검사합니다.",
    "explanation": "find — 조건에 맞는 파일이나 디렉터리 검색 / . — 검색 시작 경로(현재 디렉터리) / -maxdepth 1 — 시작점과 한 단계 아래까지만 검사 / -type d — 디렉터리만 선택",
    "initialState": "현재 폴더 아래 docs 및 src 존재",
    "afterState": "파일을 변경하지 않고 ./docs, ./src 등의 검색 결과 출력",
    "commandParts": [
      {
        "token": "find",
        "meaning": "조건에 맞는 파일이나 디렉터리 검색"
      },
      {
        "token": ".",
        "meaning": "검색 시작 경로(현재 디렉터리)"
      },
      {
        "token": "-maxdepth 1",
        "meaning": "시작점과 한 단계 아래까지만 검사"
      },
      {
        "token": "-type d",
        "meaning": "디렉터리만 선택"
      }
    ],
    "verification": "find . -maxdepth 1 -type d",
    "verificationDetail": "find . -maxdepth 1 -type d",
    "commonMistake": "find는 시작 경로인 . 자신도 검색 결과에 포함할 수 있습니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-011",
    "language": "linux",
    "topic": "파일·디렉터리 관리",
    "title": "빈 파일 생성하기",
    "level": "입문",
    "statement": "연습 폴더에 note.txt라는 빈 파일을 만드시오.",
    "input": "현재 연습 폴더에 note.txt가 없음",
    "output": "빈 note.txt 파일 생성",
    "code": "touch note.txt",
    "hint": "touch는 파일이 없으면 빈 파일을 생성하며 기존 파일이 있으면 시간 정보만 갱신합니다.",
    "explanation": "touch — 파일이 없으면 빈 파일을 만들고 있으면 시간 정보를 갱신",
    "initialState": "현재 연습 폴더에 note.txt가 없음",
    "afterState": "파일 없음 → note.txt 파일 존재",
    "commandParts": [
      {
        "token": "touch",
        "meaning": "파일이 없으면 빈 파일을 만들고 있으면 시간 정보를 갱신"
      }
    ],
    "verification": "ls -l note.txt",
    "verificationDetail": "ls -l note.txt",
    "commonMistake": "기존 파일에 touch를 적용하면 내용이 삭제되는 것이 아니라 시간 정보가 갱신됩니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-012",
    "language": "linux",
    "topic": "파일·디렉터리 관리",
    "title": "디렉터리 만들기",
    "level": "입문",
    "statement": "연습 폴더에 reports라는 새 디렉터리를 생성하시오.",
    "input": "reports 폴더가 존재하지 않음",
    "output": "reports 디렉터리 생성",
    "code": "mkdir reports",
    "hint": "mkdir 뒤에 만들 디렉터리 이름을 지정하세요. 상위 디렉터리가 이미 있는 상황입니다.",
    "explanation": "mkdir — 새 디렉터리 생성 / reports — 만들 디렉터리 이름",
    "initialState": "reports 폴더가 존재하지 않음",
    "afterState": "reports 없음 → reports 폴더 존재",
    "commandParts": [
      {
        "token": "mkdir",
        "meaning": "새 디렉터리 생성"
      },
      {
        "token": "reports",
        "meaning": "만들 디렉터리 이름"
      }
    ],
    "verification": "ls -ld reports",
    "verificationDetail": "ls -ld reports",
    "commonMistake": "같은 이름의 디렉터리가 이미 있으면 일반적인 mkdir은 실패합니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-013",
    "language": "linux",
    "topic": "파일·디렉터리 관리",
    "title": "중첩 디렉터리 만들기",
    "level": "입문",
    "statement": "상위 project가 없는 상태에서 project/docs 디렉터리를 한 번에 생성하시오.",
    "input": "project 디렉터리가 아직 존재하지 않음",
    "output": "project와 하위 docs가 생성됨",
    "code": "mkdir -p project/docs",
    "hint": "중간 디렉터리도 함께 생성하려면 mkdir의 -p 옵션을 사용하세요.",
    "explanation": "mkdir — 디렉터리 생성 / -p — 필요한 부모 디렉터리도 함께 생성 / project/docs — 상대 경로",
    "initialState": "project 디렉터리가 아직 존재하지 않음",
    "afterState": "project 없음 → project/docs 존재",
    "commandParts": [
      {
        "token": "mkdir",
        "meaning": "디렉터리 생성"
      },
      {
        "token": "-p",
        "meaning": "필요한 부모 디렉터리도 함께 생성"
      },
      {
        "token": "project/docs",
        "meaning": "상대 경로"
      }
    ],
    "verification": "ls -ld project/docs",
    "verificationDetail": "ls -ld project/docs",
    "commonMistake": "-p가 없으면 상위 project가 없을 때 생성이 실패합니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-014",
    "language": "linux",
    "topic": "파일·디렉터리 관리",
    "title": "파일 내용 보존하며 복사",
    "level": "입문",
    "statement": "note.txt를 note-copy.txt로 복사하시오. 복사 대상 이름은 아직 존재하지 않는다.",
    "input": "note.txt에 hello 문자열이 있고 note-copy.txt는 없음",
    "output": "원본과 복사본의 내용이 같음",
    "code": "cp -n note.txt note-copy.txt",
    "hint": "cp로 파일을 복사할 때 -n 옵션을 주면 대상 파일이 이미 있을 경우 덮어쓰지 않습니다.",
    "explanation": "cp — 파일 복사 / -n — 기존 대상 파일이 있으면 덮어쓰지 않음 / note.txt — 원본 파일 / note-copy.txt — 복사 대상 파일",
    "initialState": "note.txt에 hello 문자열이 있고 note-copy.txt는 없음",
    "afterState": "원본은 유지되고 note-copy.txt 파일이 추가됨",
    "commandParts": [
      {
        "token": "cp",
        "meaning": "파일 복사"
      },
      {
        "token": "-n",
        "meaning": "기존 대상 파일이 있으면 덮어쓰지 않음"
      },
      {
        "token": "note.txt",
        "meaning": "원본 파일"
      },
      {
        "token": "note-copy.txt",
        "meaning": "복사 대상 파일"
      }
    ],
    "verification": "cmp note.txt note-copy.txt",
    "verificationDetail": "cmp note.txt note-copy.txt",
    "commonMistake": "cmp가 차이 없이 종료하고 아무것도 출력하지 않으면 내용이 같습니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-015",
    "language": "linux",
    "topic": "파일·디렉터리 관리",
    "title": "파일 이름 변경",
    "level": "입문",
    "statement": "draft.txt를 final.txt로 이름을 바꾸시오.",
    "input": "draft.txt는 존재하고 final.txt는 없음",
    "output": "final.txt 존재, draft.txt는 없음",
    "code": "mv -n draft.txt final.txt",
    "hint": "mv는 이름 변경에도 사용합니다. -n을 추가하면 기존 대상 파일을 덮어쓰지 않습니다.",
    "explanation": "mv — 파일 이동 또는 이름 변경 / -n — 기존 대상 파일이 있으면 덮어쓰지 않음 / draft.txt — 기존 파일 이름 / final.txt — 새 파일 이름",
    "initialState": "draft.txt는 존재하고 final.txt는 없음",
    "afterState": "draft.txt → final.txt로 이름 변경",
    "commandParts": [
      {
        "token": "mv",
        "meaning": "파일 이동 또는 이름 변경"
      },
      {
        "token": "-n",
        "meaning": "기존 대상 파일이 있으면 덮어쓰지 않음"
      },
      {
        "token": "draft.txt",
        "meaning": "기존 파일 이름"
      },
      {
        "token": "final.txt",
        "meaning": "새 파일 이름"
      }
    ],
    "verification": "ls -l final.txt",
    "verificationDetail": "ls -l final.txt",
    "commonMistake": "-n은 덮어쓰기를 막습니다. 이미 대상이 있다면 변경이 일어나지 않을 수 있습니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-016",
    "language": "linux",
    "topic": "파일·디렉터리 관리",
    "title": "다른 폴더로 파일 이동",
    "level": "입문",
    "statement": "notes.txt를 이미 존재하는 archive 폴더로 이동하시오.",
    "input": "notes.txt가 현재 위치에 있고 archive 폴더가 존재하며 동명 파일이 없음",
    "output": "archive/notes.txt 존재",
    "code": "mv -n notes.txt archive/",
    "hint": "mv는 파일을 이동하므로 복사와 달리 기존 위치에 파일이 남지 않습니다. -n은 덮어쓰기를 방지합니다.",
    "explanation": "mv — 파일 이동 / -n — 대상 파일 덮어쓰기 방지 / archive/ — 대상 디렉터리",
    "initialState": "notes.txt가 현재 위치에 있고 archive 폴더가 존재하며 동명 파일이 없음",
    "afterState": "현재 위치의 notes.txt가 archive/notes.txt로 이동",
    "commandParts": [
      {
        "token": "mv",
        "meaning": "파일 이동"
      },
      {
        "token": "-n",
        "meaning": "대상 파일 덮어쓰기 방지"
      },
      {
        "token": "archive/",
        "meaning": "대상 디렉터리"
      }
    ],
    "verification": "ls -l archive/notes.txt",
    "verificationDetail": "ls -l archive/notes.txt",
    "commonMistake": "복사(cp)와 달리 이동(mv) 후 원본 위치에는 파일이 남지 않습니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-017",
    "language": "linux",
    "topic": "파일·디렉터리 관리",
    "title": "디렉터리 전체 복사",
    "level": "입문",
    "statement": "reports 폴더와 하위 내용을 reports-backup으로 복사하시오.",
    "input": "reports 폴더에 파일이 있고 reports-backup은 아직 없음",
    "output": "reports-backup 폴더 및 원본과 같은 파일 생성",
    "code": "cp -r reports reports-backup",
    "hint": "디렉터리 내부 파일까지 복사하려면 cp의 재귀 옵션 -r을 사용하세요.",
    "explanation": "cp — 파일 및 디렉터리 복사 / -r — 하위 디렉터리까지 재귀적으로 복사 / reports — 원본 폴더 / reports-backup — 새 복사본 경로",
    "initialState": "reports 폴더에 파일이 있고 reports-backup은 아직 없음",
    "afterState": "reports 원본 유지, reports-backup 복사본 추가",
    "commandParts": [
      {
        "token": "cp",
        "meaning": "파일 및 디렉터리 복사"
      },
      {
        "token": "-r",
        "meaning": "하위 디렉터리까지 재귀적으로 복사"
      },
      {
        "token": "reports",
        "meaning": "원본 폴더"
      },
      {
        "token": "reports-backup",
        "meaning": "새 복사본 경로"
      }
    ],
    "verification": "find reports-backup -type f",
    "verificationDetail": "find reports-backup -type f",
    "commonMistake": "이미 reports-backup 디렉터리가 존재하면 복사 결과 경로가 달라질 수 있으므로 초기 조건을 확인합니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-018",
    "language": "linux",
    "topic": "파일·디렉터리 관리",
    "title": "기존 파일의 시간 정보 갱신",
    "level": "입문",
    "statement": "이미 존재하는 memo.txt의 내용을 유지하면서 수정 시간 정보를 갱신하시오.",
    "input": "memo.txt가 이미 존재하고 내용을 보존해야 함",
    "output": "memo.txt 내용 보존, 수정 시간 갱신",
    "code": "touch memo.txt",
    "hint": "touch memo.txt를 사용해 새 빈 파일을 만들 수 있습니다. 기존 파일 내용은 삭제되지 않습니다.",
    "explanation": "touch — 파일이 존재하면 접근·수정 시간 정보를 현재 시각으로 갱신",
    "initialState": "memo.txt가 이미 존재하고 내용을 보존해야 함",
    "afterState": "파일 내용 유지, 수정 시각 갱신",
    "commandParts": [
      {
        "token": "touch",
        "meaning": "파일이 존재하면 접근·수정 시간 정보를 현재 시각으로 갱신"
      }
    ],
    "verification": "stat -c '%y' memo.txt",
    "verificationDetail": "stat -c '%y' memo.txt",
    "commonMistake": "touch는 기존 파일을 비우지 않습니다. 파일이 없다면 새 빈 파일이 생성됩니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-019",
    "language": "linux",
    "topic": "파일·디렉터리 관리",
    "title": "빈 디렉터리 삭제",
    "level": "기초 응용",
    "statement": "내용물이 없는 empty 디렉터리만 삭제하시오.",
    "input": "empty 폴더가 존재하며 내부가 비어 있음",
    "output": "empty 디렉터리가 없어짐",
    "code": "rmdir empty",
    "hint": "빈 디렉터리만 제거하려면 rmdir을 사용하세요. 파일이 남아 있으면 실패합니다.",
    "explanation": "rmdir — 비어 있는 디렉터리만 제거 / empty — 삭제할 디렉터리",
    "initialState": "empty 폴더가 존재하며 내부가 비어 있음",
    "afterState": "empty 폴더 존재 → 제거됨",
    "commandParts": [
      {
        "token": "rmdir",
        "meaning": "비어 있는 디렉터리만 제거"
      },
      {
        "token": "empty",
        "meaning": "삭제할 디렉터리"
      }
    ],
    "verification": "test ! -d empty && echo OK",
    "verificationDetail": "test ! -d empty && echo OK",
    "commonMistake": "rmdir은 비어 있지 않은 디렉터리를 지우지 않습니다. 재귀 삭제보다 안전합니다.",
    "warning": "개인 실습 폴더의 비어 있는 디렉터리에만 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-020",
    "language": "linux",
    "topic": "파일·디렉터리 관리",
    "title": "임시 파일 삭제",
    "level": "기초 응용",
    "statement": "실습용 scratch.tmp 파일 하나를 삭제하시오.",
    "input": "scratch.tmp가 존재하며 중요한 자료가 없는 실습 파일",
    "output": "scratch.tmp 삭제",
    "code": "rm -- scratch.tmp",
    "hint": "rm은 파일을 즉시 삭제합니다. '--' 뒤의 문자열은 옵션이 아니라 파일명으로 취급합니다.",
    "explanation": "rm — 지정한 파일을 삭제 / -- — 이후 인수를 옵션이 아닌 파일 이름으로 취급 / scratch.tmp — 삭제 대상 실습 파일",
    "initialState": "scratch.tmp가 존재하며 중요한 자료가 없는 실습 파일",
    "afterState": "scratch.tmp 존재 → 삭제됨",
    "commandParts": [
      {
        "token": "rm",
        "meaning": "지정한 파일을 삭제"
      },
      {
        "token": "--",
        "meaning": "이후 인수를 옵션이 아닌 파일 이름으로 취급"
      },
      {
        "token": "scratch.tmp",
        "meaning": "삭제 대상 실습 파일"
      }
    ],
    "verification": "test ! -e scratch.tmp && echo OK",
    "verificationDetail": "test ! -e scratch.tmp && echo OK",
    "commonMistake": "rm은 휴지통을 거치지 않습니다. 잘못된 파일을 삭제하면 복구가 어려울 수 있습니다.",
    "warning": "개인 실습 폴더에서 임시 파일 이름을 반드시 확인하고 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-021",
    "language": "linux",
    "topic": "파일·디렉터리 관리",
    "title": "심볼릭 링크 만들기",
    "level": "기초 응용",
    "statement": "docs/readme.md를 가리키는 readme-link라는 심볼릭 링크를 생성하시오.",
    "input": "docs/readme.md가 존재하고 readme-link는 없음",
    "output": "readme-link가 docs/readme.md를 가리킴",
    "code": "ln -s docs/readme.md readme-link",
    "hint": "ln에서 -s 옵션은 원본 파일을 복사하지 않고 경로를 가리키는 심볼릭 링크를 만듭니다.",
    "explanation": "ln — 파일을 가리키는 링크 생성 / -s — 심볼릭 링크 생성 / docs/readme.md — 링크가 가리킬 상대 경로 / readme-link — 새로 만들어질 링크 이름",
    "initialState": "docs/readme.md가 존재하고 readme-link는 없음",
    "afterState": "readme-link 심볼릭 링크 추가, 원본 유지",
    "commandParts": [
      {
        "token": "ln",
        "meaning": "파일을 가리키는 링크 생성"
      },
      {
        "token": "-s",
        "meaning": "심볼릭 링크 생성"
      },
      {
        "token": "docs/readme.md",
        "meaning": "링크가 가리킬 상대 경로"
      },
      {
        "token": "readme-link",
        "meaning": "새로 만들어질 링크 이름"
      }
    ],
    "verification": "readlink readme-link",
    "verificationDetail": "readlink readme-link",
    "commonMistake": "심볼릭 링크를 다른 위치로 옮기면 상대경로가 깨질 수 있습니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-022",
    "language": "linux",
    "topic": "파일 내용·검색",
    "title": "텍스트 파일 내용 출력",
    "level": "기초 응용",
    "statement": "note.txt의 전체 내용을 터미널에 출력하시오.",
    "input": "note.txt에 Hello Ubuntu 한 줄이 있음",
    "output": "Hello Ubuntu 문자열 표시",
    "code": "cat note.txt",
    "hint": "cat은 작은 텍스트 파일의 전체 내용을 터미널에 출력할 때 사용합니다.",
    "explanation": "cat — 파일 내용을 그대로 표준 출력에 표시 / note.txt — 읽을 파일",
    "initialState": "note.txt에 Hello Ubuntu 한 줄이 있음",
    "afterState": "파일 자체는 변경되지 않고 내용만 화면에 표시됨",
    "commandParts": [
      {
        "token": "cat",
        "meaning": "파일 내용을 그대로 표준 출력에 표시"
      },
      {
        "token": "note.txt",
        "meaning": "읽을 파일"
      }
    ],
    "verification": "cat note.txt",
    "verificationDetail": "cat note.txt",
    "commonMistake": "바이너리 파일이나 매우 긴 파일에는 cat보다 다른 보기 명령이 적합할 수 있습니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-023",
    "language": "linux",
    "topic": "파일 내용·검색",
    "title": "파일 처음 세 줄 확인",
    "level": "기초 응용",
    "statement": "log.txt의 처음 3줄만 표시하시오.",
    "input": "log.txt에 5줄 이상 텍스트가 있음",
    "output": "첫 번째부터 세 번째 줄 표시",
    "code": "head -n 3 log.txt",
    "hint": "파일의 처음 세 줄만 보고 싶다면 head의 -n 3 옵션을 사용해 보세요.",
    "explanation": "head — 파일 앞부분 출력 / -n 3 — 앞에서 세 줄만 표시",
    "initialState": "log.txt에 5줄 이상 텍스트가 있음",
    "afterState": "파일 변경 없음; 앞 세 줄 출력",
    "commandParts": [
      {
        "token": "head",
        "meaning": "파일 앞부분 출력"
      },
      {
        "token": "-n 3",
        "meaning": "앞에서 세 줄만 표시"
      }
    ],
    "verification": "head -n 3 log.txt",
    "verificationDetail": "head -n 3 log.txt",
    "commonMistake": "-n 옵션 뒤 숫자를 바꾸면 출력할 줄 수가 달라집니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-024",
    "language": "linux",
    "topic": "파일 내용·검색",
    "title": "파일 마지막 다섯 줄 확인",
    "level": "기초 응용",
    "statement": "log.txt의 마지막 5줄을 확인하시오.",
    "input": "log.txt에 10줄 이상의 로그가 있음",
    "output": "파일 끝에서 다섯 줄 표시",
    "code": "tail -n 5 log.txt",
    "hint": "파일의 마지막 다섯 줄만 보고 싶다면 tail의 -n 5 옵션을 사용해 보세요.",
    "explanation": "tail — 파일 끝부분 출력 / -n 5 — 끝에서 다섯 줄 표시",
    "initialState": "log.txt에 10줄 이상의 로그가 있음",
    "afterState": "파일 변경 없음; 최근 내용에 해당하는 마지막 다섯 줄 출력",
    "commandParts": [
      {
        "token": "tail",
        "meaning": "파일 끝부분 출력"
      },
      {
        "token": "-n 5",
        "meaning": "끝에서 다섯 줄 표시"
      }
    ],
    "verification": "tail -n 5 log.txt",
    "verificationDetail": "tail -n 5 log.txt",
    "commonMistake": "tail -n 5는 실시간 감시가 아니며, 실시간 감시는 -f 옵션을 사용합니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-025",
    "language": "linux",
    "topic": "파일 내용·검색",
    "title": "텍스트 파일 줄 수 세기",
    "level": "기초 응용",
    "statement": "notes.txt의 전체 줄 수를 출력하시오.",
    "input": "notes.txt에 줄바꿈으로 끝나는 정확히 4줄이 있음",
    "output": "줄 수 4 표시",
    "code": "wc -l notes.txt",
    "hint": "wc의 -l은 줄바꿈 문자 수를 세어 줄 수를 표시합니다. 출력에는 파일명도 함께 나올 수 있습니다.",
    "explanation": "wc — 입력 데이터의 개수 집계 / -l — 줄바꿈 문자의 개수로 줄 수 계산",
    "initialState": "notes.txt에 줄바꿈으로 끝나는 정확히 4줄이 있음",
    "afterState": "파일 변경 없음; 4 notes.txt 형식의 결과 출력",
    "commandParts": [
      {
        "token": "wc",
        "meaning": "입력 데이터의 개수 집계"
      },
      {
        "token": "-l",
        "meaning": "줄바꿈 문자의 개수로 줄 수 계산"
      }
    ],
    "verification": "wc -l notes.txt",
    "verificationDetail": "wc -l notes.txt",
    "commonMistake": "마지막 줄에 줄바꿈 문자가 없으면 화면에서 보이는 줄 수와 wc -l 값이 다를 수 있습니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  },
  {
    "id": "LINUX-026",
    "language": "linux",
    "topic": "파일 내용·검색",
    "title": "텍스트 단어 수 세기",
    "level": "기초 응용",
    "statement": "notes.txt에 들어 있는 공백 구분 단어 수를 확인하시오.",
    "input": "notes.txt는 'hello world ubuntu' 한 줄을 포함",
    "output": "단어 수 3 표시",
    "code": "wc -w notes.txt",
    "hint": "wc의 -w는 공백으로 구분된 단어 수를 계산합니다. 단순한 문자 수와는 다릅니다.",
    "explanation": "wc — 텍스트 개수 집계 / -w — 공백으로 분리된 단어 개수 계산",
    "initialState": "notes.txt는 'hello world ubuntu' 한 줄을 포함",
    "afterState": "파일 내용은 변경되지 않고 단어 수가 출력됨",
    "commandParts": [
      {
        "token": "wc",
        "meaning": "텍스트 개수 집계"
      },
      {
        "token": "-w",
        "meaning": "공백으로 분리된 단어 개수 계산"
      }
    ],
    "verification": "wc -w notes.txt",
    "verificationDetail": "wc -w notes.txt",
    "commonMistake": "공백이 여러 개 있어도 단어 사이 구분자로 처리합니다.",
    "warning": "자신의 개인 실습 디렉터리에서만 변경 명령어를 실행하세요.",
    "trace": []
  }
];
