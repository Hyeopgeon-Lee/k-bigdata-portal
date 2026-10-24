/**
 * Generic editor vocabulary. Deliberately independent of exercise solutions:
 * turning autocomplete on helps with syntax without revealing problem answers.
 */
export const completionCatalog = Object.freeze({
  c: [
    ["printf", "함수", "표준 출력"],
    ["scanf", "함수", "표준 입력"],
    ["puts", "함수", "문자열 출력"],
    ["putchar", "함수", "문자 출력"],
    ["getchar", "함수", "문자 입력"],
    ["fgets", "함수", "문자열 입력"],
    ["strlen", "함수", "문자열 길이"],
    ["strcmp", "함수", "문자열 비교"],
    ["size_t", "타입", "크기 자료형"],
    ["int", "키워드", "정수 자료형"],
    ["double", "키워드", "실수 자료형"],
    ["char", "키워드", "문자 자료형"],
    ["void", "키워드", "반환값 없음"],
    ["const", "키워드", "상수 한정자"],
    ["struct", "키워드", "구조체"],
    ["return", "키워드", "함수 반환"],
    ["if", "키워드", "조건문"],
    ["else", "키워드", "조건문"],
    ["switch", "키워드", "분기문"],
    ["case", "키워드", "분기문"],
    ["break", "키워드", "반복·분기 종료"],
    ["continue", "키워드", "반복 다음 단계"],
    ["for", "키워드", "반복문"],
    ["while", "키워드", "반복문"],
    ["do", "키워드", "반복문"]
  ],
  java: [
    ["System.out.println", "함수", "줄바꿈 출력"],
    ["System.out.print", "함수", "출력"],
    ["System.out.printf", "함수", "형식 지정 출력"],
    ["Scanner", "클래스", "표준 입력"],
    ["nextInt", "함수", "정수 입력"],
    ["nextDouble", "함수", "실수 입력"],
    ["nextLine", "함수", "한 줄 입력"],
    ["next", "함수", "단어 입력"],
    ["String", "클래스", "문자열"],
    ["Integer", "클래스", "정수 래퍼"],
    ["Math.max", "함수", "최댓값"],
    ["Math.min", "함수", "최솟값"],
    ["Math.abs", "함수", "절댓값"],
    ["Arrays.sort", "함수", "배열 정렬"],
    ["ArrayList", "클래스", "동적 리스트"],
    ["public", "키워드", "접근 제어자"],
    ["private", "키워드", "접근 제어자"],
    ["static", "키워드", "정적 멤버"],
    ["final", "키워드", "변경 불가"],
    ["class", "키워드", "클래스 선언"],
    ["new", "키워드", "객체 생성"],
    ["int", "키워드", "정수 자료형"],
    ["double", "키워드", "실수 자료형"],
    ["boolean", "키워드", "논리 자료형"],
    ["void", "키워드", "반환값 없음"],
    ["return", "키워드", "메서드 반환"],
    ["if", "키워드", "조건문"],
    ["else", "키워드", "조건문"],
    ["for", "키워드", "반복문"],
    ["while", "키워드", "반복문"],
    ["switch", "키워드", "분기문"],
    ["break", "키워드", "분기·반복 종료"]
  ],
  python: [
    ["print", "함수", "값 출력"],
    ["input", "함수", "문자열 입력"],
    ["int", "함수", "정수 변환"],
    ["float", "함수", "실수 변환"],
    ["str", "함수", "문자열 변환"],
    ["len", "함수", "길이 확인"],
    ["range", "함수", "반복 범위"],
    ["enumerate", "함수", "인덱스와 값"],
    ["zip", "함수", "묶어서 반복"],
    ["sum", "함수", "합계"],
    ["max", "함수", "최댓값"],
    ["min", "함수", "최솟값"],
    ["sorted", "함수", "정렬된 새 목록"],
    ["append", "함수", "리스트 원소 추가"],
    ["split", "함수", "문자열 분리"],
    ["strip", "함수", "주변 공백 제거"],
    ["join", "함수", "문자열 연결"],
    ["if", "키워드", "조건문"],
    ["elif", "키워드", "추가 조건"],
    ["else", "키워드", "조건문"],
    ["for", "키워드", "반복문"],
    ["while", "키워드", "반복문"],
    ["def", "키워드", "함수 정의"],
    ["return", "키워드", "함수 반환"],
    ["break", "키워드", "반복 종료"],
    ["continue", "키워드", "다음 반복"],
    ["import", "키워드", "모듈 불러오기"],
    ["True", "키워드", "참"],
    ["False", "키워드", "거짓"],
    ["None", "키워드", "값 없음"]
  ],
  linux: [
    ["ls", "명령어", "파일 목록"],
    ["pwd", "명령어", "현재 디렉터리"],
    ["cd", "명령어", "디렉터리 이동"],
    ["mkdir", "명령어", "디렉터리 생성"],
    ["touch", "명령어", "파일 생성"],
    ["cp", "명령어", "파일 복사"],
    ["mv", "명령어", "이동·이름 변경"],
    ["cat", "명령어", "파일 내용"],
    ["grep", "명령어", "문자열 검색"],
    ["find", "명령어", "파일 검색"],
    ["sort", "명령어", "줄 정렬"],
    ["uniq", "명령어", "중복 행 처리"],
    ["head", "명령어", "앞부분 보기"],
    ["tail", "명령어", "뒷부분 보기"],
    ["wc", "명령어", "줄·단어 수"],
    ["chmod", "명령어", "권한 변경"],
    ["echo", "명령어", "문자열 출력"],
    ["printf", "명령어", "형식 지정 출력"],
    ["ps", "명령어", "프로세스 확인"],
    ["free", "명령어", "메모리 확인"],
    ["df", "명령어", "파일시스템 용량"],
    ["du", "명령어", "디렉터리 용량"],
    ["uname", "명령어", "커널 정보"],
    ["apt-cache", "명령어", "패키지 정보"],
    ["dpkg-query", "명령어", "설치된 패키지"]
  ]
});

const completionType = {
  "함수": "function",
  "키워드": "keyword",
  "타입": "type",
  "클래스": "class",
  "명령어": "function"
};

/**
 * Return only generic language vocabulary and identifiers typed by the learner.
 * No answers, remote APIs, or data from other exercise statements are used.
 */
export function codingCompletionOptions(language, typed, source, explicit = false) {
  if (!explicit && typed.length < 2) return [];
  const catalog = completionCatalog[language] || [];
  const seen = new Set();
  const options = [];
  for (const [label, category, detail] of catalog) {
    if (seen.has(label)) continue;
    seen.add(label);
    options.push({label, type:completionType[category] || "text", detail});
  }
  if (language !== "linux") {
    const names = (source.match(/\b[A-Za-z_][A-Za-z_0-9]*\b/g) || []);
    for (const label of names.slice(0, 500)) {
      if (label.length < 2 || seen.has(label)) continue;
      seen.add(label);
      options.push({label, type:"variable", detail:"작성한 코드의 식별자"});
      if (options.length >= 110) break;
    }
  }
  return options;
}
