// Ubuntu-specific explanation metadata for the original two problems.
export const ubuntuLegacyGuides = {
  "LINUX-001": {
    "code": "mkdir -p project/src\ntouch project/src/main.py\nfind project -type f",
    "initialState": "개인 실습 폴더에 project 디렉터리가 없는 상태",
    "afterState": "project/src 디렉터리와 그 안의 빈 main.py 파일이 생성됨",
    "commandParts": [
      {
        "token": "mkdir",
        "meaning": "디렉터리 생성"
      },
      {
        "token": "-p",
        "meaning": "상위 디렉터리가 없으면 함께 생성"
      },
      {
        "token": "touch",
        "meaning": "파일이 없으면 빈 파일 생성; 기존 파일은 시간 정보 갱신"
      },
      {
        "token": "find project -type f",
        "meaning": "project 아래 일반 파일의 경로 확인"
      }
    ],
    "verification": "find project -type f",
    "verificationDetail": "project/src/main.py 경로가 출력됩니다. 다른 파일이 없는 초기 환경을 전제로 합니다.",
    "commonMistake": "부모 디렉터리가 없는 상태에서 mkdir project/src만 실행하면 실패할 수 있습니다.",
    "warning": "개인 실습 폴더에서 실행하세요. 이미 존재하는 프로젝트에 같은 명령어를 적용하면 의도치 않은 파일을 변경할 수 있습니다."
  },
  "LINUX-002": {
    "code": "touch report.txt\nchmod 640 report.txt\nls -l report.txt",
    "initialState": "개인 실습 폴더에서 report.txt를 새로 만들거나 기존 실습용 파일을 사용",
    "afterState": "report.txt가 존재하고 기본 파일 접근 권한을 640(rw-r-----)으로 설정",
    "commandParts": [
      {
        "token": "touch",
        "meaning": "실습 파일 생성 또는 기존 파일의 시간 정보 갱신"
      },
      {
        "token": "chmod",
        "meaning": "파일 권한 변경"
      },
      {
        "token": "640",
        "meaning": "소유자 읽기·쓰기(6), 그룹 읽기(4), 기타 접근 없음(0)"
      },
      {
        "token": "ls -l",
        "meaning": "권한 및 소유자 등 상세 정보 확인"
      }
    ],
    "verification": "stat -c '%a %n' report.txt",
    "verificationDetail": "640 report.txt가 표시되는지 확인합니다. ls -l의 권한 부분은 -rw-r-----와 대응합니다.",
    "commonMistake": "640을 세 자리 숫자의 단순 크기로 생각하면 안 됩니다. 각 자리는 소유자/그룹/기타의 비트 권한입니다.",
    "warning": "자신이 소유한 실습용 파일에만 권한을 변경하세요. 시스템 파일에 chmod를 적용하지 마세요."
  }
};
