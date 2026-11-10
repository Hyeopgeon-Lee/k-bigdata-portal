// 운영체제 실습 PPT에 근거해 현재 Ubuntu 50문제에서 사용한 명령어·옵션만 수록합니다.
// 문제에 등장하지 않은 새로운 명령어나 옵션은 예시로 추가하지 않습니다.
export const ubuntuCommandOptionCatalog = {
  "pwd": [
    [
      "pwd",
      "현재 작업 디렉터리의 절대경로를 출력합니다. 별도의 옵션이 필요하지 않습니다.",
      "pwd"
    ]
  ],
  "cd": [
    [
      "cd ..",
      "현재 위치에서 한 단계 위인 상위 디렉터리로 이동합니다.",
      "cd .."
    ],
    [
      "cd ~",
      "현재 사용자의 홈 디렉터리로 이동합니다.",
      "cd ~"
    ]
  ],
  "mkdir": [
    [
      "mkdir 디렉터리명",
      "현재 경로에 디렉터리 하나를 만듭니다. 상위 경로는 이미 있어야 합니다.",
      "mkdir reports"
    ],
    [
      "mkdir -p 경로",
      "중간 디렉터리가 없으면 함께 만들며, 이미 있는 디렉터리도 오류 없이 처리합니다.",
      "mkdir -p project/src"
    ]
  ],
  "rmdir": [
    [
      "rmdir 디렉터리명",
      "비어 있는 디렉터리만 삭제합니다. 파일이 들어 있으면 삭제되지 않습니다.",
      "rmdir empty"
    ]
  ],
  "cat": [
    [
      "cat 파일명",
      "텍스트 파일의 내용을 터미널에 출력합니다. 편집·저장은 하지 않습니다.",
      "cat readme.txt"
    ]
  ],
  "cp": [
    [
      "cp 원본 대상",
      "원본 파일을 복사합니다. 원본은 그대로 남습니다.",
      "cp note.txt backup.txt"
    ]
  ],
  "mv": [
    [
      "mv 원본 대상",
      "파일을 이동하거나 같은 위치에서 이름을 바꿉니다.",
      "mv draft.txt final.txt"
    ]
  ],
  "tail": [
    [
      "tail -7 파일명",
      "파일의 마지막 7줄을 출력합니다. 숫자를 바꾸면 출력 줄 수도 달라집니다.",
      "tail -7 log.txt"
    ]
  ],
  "grep": [
    [
      "grep 검색어 [파일명]",
      "검색어가 포함된 줄을 출력합니다. 파일을 생략하고 파이프로 연결하면 앞 명령어의 출력을 검색합니다.",
      "ps -ef | grep bash"
    ],
    [
      "grep -n 검색어 파일명",
      "검색어가 포함된 줄 앞에 원본 파일의 줄 번호를 붙입니다.",
      "grep -n 'ERROR' app.log"
    ]
  ],
  "find": [
    [
      "find . -user 사용자명",
      "현재 디렉터리(.) 아래에서 지정한 사용자가 소유한 항목을 찾습니다.",
      "find . -user student"
    ]
  ],
  "which": [
    [
      "which 명령어",
      "PATH에서 찾을 수 있는 명령어 실행 파일의 경로를 확인합니다.",
      "which mv"
    ]
  ],
  "ln": [
    [
      "ln 원본 링크명",
      "원본과 동일한 inode를 공유하는 하드 링크를 생성합니다.",
      "ln data.txt data-hard"
    ],
    [
      "ln -s 원본 링크명",
      "원본 파일의 경로를 가리키는 심볼릭 링크를 생성합니다.",
      "ln -s data.txt data-link"
    ]
  ],
  "chmod": [
    [
      "chmod 640 파일명",
      "소유자 rw-, 그룹 r--, 기타 ---로 설정합니다. 숫자 6·4·0입니다.",
      "chmod 640 report.txt"
    ],
    [
      "chmod 644 파일명",
      "소유자 rw-, 그룹 r--, 기타 r--로 설정합니다.",
      "chmod 644 report.txt"
    ],
    [
      "chmod 600 파일명",
      "소유자에게만 읽기·쓰기를 허용합니다.",
      "chmod 600 report.txt"
    ],
    [
      "chmod 755 파일명",
      "소유자 rwx, 그룹 r-x, 기타 r-x로 설정합니다.",
      "chmod 755 docs"
    ],
    [
      "chmod 777 파일명",
      "모든 사용자에게 rwx를 허용합니다. 불필요하게 사용하면 보안상 위험합니다.",
      "chmod 777 report.txt"
    ],
    [
      "chmod u-w 파일명",
      "소유자(u)의 쓰기(w) 권한만 제거하고 나머지는 유지합니다.",
      "chmod u-w note.txt"
    ],
    [
      "chmod g+wx 파일명",
      "그룹(g)에 쓰기(w)·실행(x) 권한을 추가합니다.",
      "chmod g+wx note.txt"
    ]
  ],
  "umask": [
    [
      "umask -S",
      "새 파일·디렉터리에 적용될 기본 권한 마스크를 문자형으로 확인합니다. 기존 파일 권한은 바꾸지 않습니다.",
      "umask -S"
    ]
  ],
  "echo": [
    [
      "echo 문자열",
      "문자열을 표시하고 마지막에 줄바꿈을 넣습니다.",
      "echo hello"
    ],
    [
      "echo -n 문자열",
      "끝의 줄바꿈을 생략합니다.",
      "echo -n Hello"
    ],
    [
      "echo \"$SHELL\"",
      "큰따옴표 안의 변수 값을 확장하여 표시합니다.",
      "echo \"$SHELL\""
    ],
    [
      "echo '$SHELL'",
      "작은따옴표 안의 $SHELL을 문자 그대로 출력합니다.",
      "echo '$SHELL'"
    ],
    [
      "echo 내용 > 파일명",
      "출력을 파일로 보내며 기존 내용은 덮어씁니다.",
      "echo hello > result.txt"
    ],
    [
      "echo 내용 >> 파일명",
      "기존 파일 끝에 출력 내용을 덧붙입니다.",
      "echo world >> result.txt"
    ]
  ],
  "printf": [
    [
      "printf '형식' 값",
      "%d는 정수, \\n은 줄바꿈입니다. echo와 달리 형식에 맞게 출력합니다.",
      "printf '%d\\n' 12"
    ]
  ],
  "alias": [
    [
      "alias 이름='명령어'",
      "현재 셸에서 사용할 명령어 별명을 지정합니다.",
      "alias ls='ls -F'"
    ],
    [
      "alias",
      "현재 설정된 별명의 목록을 표시합니다.",
      "alias"
    ]
  ],
  "date": [
    [
      "date",
      "현재 시스템 날짜와 시간을 표시합니다. 옵션 없이 실행합니다.",
      "date"
    ]
  ],
  "ps": [
    [
      "ps -f",
      "프로세스의 상세 정보(UID·PID·PPID 등)를 표시합니다.",
      "ps -f"
    ],
    [
      "ps -ef",
      "시스템의 전체 프로세스(-e)를 상세 형식(-f)으로 표시합니다.",
      "ps -ef"
    ],
    [
      "ps aux",
      "a·u·x를 조합하여 사용자·CPU·메모리 정보와 터미널에 연결되지 않은 프로세스까지 확인합니다.",
      "ps aux"
    ]
  ],
  "pgrep": [
    [
      "pgrep -l 프로세스명",
      "프로세스 이름으로 검색하여 PID와 프로세스 이름을 함께 표시합니다.",
      "pgrep -l bash"
    ]
  ],
  "df": [
    [
      "df -h",
      "파일 시스템 사용량을 사람이 읽기 쉬운 크기 단위로 표시합니다.",
      "df -h"
    ],
    [
      "df -T",
      "파일 시스템 유형(Type) 열까지 표시합니다.",
      "df -T"
    ]
  ],
  "du": [
    [
      "du -sh 경로",
      "-s는 지정한 경로의 합계, -h는 읽기 쉬운 크기 단위입니다.",
      "du -sh docs"
    ]
  ],
  "shutdown": [
    [
      "shutdown -c",
      "예약된 시스템 종료 명령을 취소합니다. 새 종료를 예약하지 않습니다.",
      "shutdown -c"
    ]
  ],
  "apt-cache": [
    [
      "apt-cache search 키워드",
      "패키지 이름과 설명에서 키워드를 찾아 검색합니다.",
      "apt-cache search vim"
    ],
    [
      "apt-cache showpkg 패키지명",
      "패키지의 버전·의존성 등의 캐시 정보를 표시합니다.",
      "apt-cache showpkg vim"
    ]
  ],
  "tar": [
    [
      "tar cvf 아카이브 대상",
      "c: 생성, v: 처리 파일 표시, f: 아카이브 파일 이름 지정입니다.",
      "tar cvf backup.tar docs"
    ],
    [
      "tar tvf 아카이브",
      "t: 내부 목록 확인, v: 상세 표시, f: 아카이브 지정입니다. 풀지는 않습니다.",
      "tar tvf backup.tar"
    ],
    [
      "tar xvf 아카이브",
      "x: 압축 묶음에서 항목 추출, v: 처리 파일 표시, f: 파일 지정입니다.",
      "tar xvf backup.tar"
    ]
  ],
  "gzip": [
    [
      "gzip 파일명",
      "파일을 .gz 형태로 압축합니다. 일반적으로 원본 대신 .gz 파일이 남습니다.",
      "gzip report.txt"
    ]
  ],
  "zcat": [
    [
      "zcat 파일명.gz",
      "압축을 풀어 새 파일을 만들지 않고 .gz 내부 내용을 출력합니다.",
      "zcat report.txt.gz"
    ]
  ],
  "who": [
    [
      "who -H",
      "현재 로그인한 사용자 목록에 열 제목을 붙여 표시합니다.",
      "who -H"
    ]
  ],
  "groups": [
    [
      "groups",
      "현재 사용자가 속한 그룹을 확인합니다.",
      "groups"
    ]
  ],
  "crontab": [
    [
      "crontab -l",
      "현재 사용자의 예약된 cron 작업 목록을 출력합니다.",
      "crontab -l"
    ]
  ],
  "useradd": [
    [
      "useradd -D",
      "새 사용자를 만들지 않고 계정 생성 시 적용되는 기본 설정을 조회합니다.",
      "useradd -D"
    ]
  ]
};


// 각 문항의 정답 명령어를 분석하여 사용한 명령어의 다른 PPT 수록 옵션도 보여 줍니다.
// ls와 Vim은 화면에 이미 별도의 상세 비교표가 있으므로 여기에서는 중복하지 않습니다.
export function getUbuntuRelatedOptions(problem) {
  if (!problem || problem.language !== "linux") return [];
  const commands = new Set();
  for (const piece of String(problem.code || "").split(/[\n;|]/)) {
    const match = piece.trim().match(/^([a-z][a-z0-9-]*)\b/i);
    if (match && match[1] !== "vim" && match[1] !== "ls") commands.add(match[1]);
  }
  const rows = [];
  for (const command of commands) {
    for (const [usage, meaning, example] of ubuntuCommandOptionCatalog[command] || []) {
      rows.push({ command, usage, meaning, example });
    }
  }
  return rows;
}
