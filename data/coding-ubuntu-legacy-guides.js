// Ubuntu-specific explanation metadata for the original two problems.
export const ubuntuLegacyGuides = {
  "LINUX-001": {
    "code": "mkdir -p project/src  # project/src 디렉터리 생성\nvim project/src/main.py  # Vim에서 :wq 입력 후 Enter로 빈 파일 저장·종료\nfind project -type f  # 생성된 파일 경로 확인",
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
        "token": "vim project/src/main.py",
        "meaning": "Vim 편집기로 새 파일 열기"
      },
      {
        "token": ":wq",
        "meaning": "Vim에서 빈 파일 저장 후 종료(Enter로 실행)"
      },
      {
        "token": "find project -type f",
        "meaning": "project 아래 일반 파일의 경로 확인"
      }
    ],
    "verification": "find project -type f",
    "verificationDetail": "project/src/main.py 경로가 출력됩니다. 다른 파일이 없는 초기 환경을 전제로 합니다.",
    "commonMistake": "Vim에서 :q!로 종료하면 새 빈 파일이 저장되지 않습니다. :wq와 Enter로 저장·종료하시오.",
    "warning": "개인 실습 폴더에서 진행하고, Vim을 :wq로 종료한 뒤에 find 명령어를 실행하시오."
  },
  "LINUX-002": {
    "code": "vim report.txt  # Vim에서 :wq 입력 후 Enter로 빈 파일 저장·종료\nchmod 640 report.txt  # 소유자=rw-, 그룹=r--, 기타=---로 권한 변경\nls -l report.txt  # 변경된 파일 권한 표시",
    "initialState": "개인 실습 폴더에 report.txt가 아직 없는 상태",
    "afterState": "report.txt가 존재하고 기본 파일 접근 권한을 640(rw-r-----)으로 설정",
    "commandParts": [
      {
        "token": "vim report.txt",
        "meaning": "Vim 편집기로 새 report.txt 파일 열기"
      },
      {
        "token": ":wq",
        "meaning": "빈 파일을 저장하고 종료(Enter로 실행)"
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
        "meaning": "권한과 파일 상세 정보 확인"
      }
    ],
    "verification": "stat -c '%a %n' report.txt",
    "verificationDetail": "640 report.txt가 표시되는지 확인합니다. ls -l의 권한 부분은 -rw-r-----와 대응합니다.",
    "commonMistake": "Vim에서 저장하지 않고 종료하면 새 파일이 생성되지 않을 수 있습니다. :wq와 Enter로 저장한 다음 chmod 640을 실행하시오.",
    "warning": "개인 실습 폴더에서만 진행하시오. Vim에서 파일을 저장·종료한 후에 chmod를 실행하고, 시스템 파일의 권한은 변경하지 마시오."
  }
};
