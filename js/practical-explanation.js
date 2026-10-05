const RULES=[
  [/배열|리스트|2차원 배열/,"배열과 리스트","여러 값을 순서대로 저장한 자료입니다. 각 값의 위치를 인덱스로 구분합니다. 문제를 풀 때는 인덱스와 현재 값을 나란히 적으면 실수가 줄어듭니다."],
  [/포인터|역참조|이중 포인터|연결 리스트/,"포인터","포인터는 값 자체가 아니라 값이 있는 위치를 가리킵니다. * 연산은 그 위치에 저장된 실제 값을 읽거나 바꿀 때 사용합니다."],
  [/문자열|문자 배열|ASCII/,"문자열과 문자","문자열도 문자들이 순서대로 저장된 자료입니다. 문자 하나를 볼 때는 위치와 문자값을 따로 확인하고, 숫자로 출력할 때는 문자 코드값인지 확인합니다."],
  [/반복문|for|while|누적|누적합/,"반복문","반복문은 같은 작업을 여러 번 수행합니다. 반복이 한 번 끝날 때마다 핵심 변수의 값을 한 줄씩 적어가면 결과를 쉽게 추적할 수 있습니다."],
  [/if|조건식|삼항|break|continue/,"조건과 분기","조건식이 참인지 거짓인지 먼저 판단한 뒤 실제로 실행되는 문장만 따라갑니다. break는 반복을 끝내고, continue는 이번 반복의 남은 부분을 건너뜁니다."],
  [/재귀|팩토리얼/,"재귀 호출","재귀 함수는 자기 자신을 다시 호출합니다. 먼저 멈추는 조건을 찾고, 가장 깊은 호출까지 내려간 뒤 반환값을 거꾸로 계산합니다."],
  [/함수|메서드|값 전달/,"함수와 메서드","함수 호출에서는 전달되는 값, 매개변수, 반환값을 구분합니다. 호출 전 값과 호출 후 값이 달라지는지도 함께 확인합니다."],
  [/상속|오버라이딩|동적 바인딩|super|필드 숨김/,"상속과 오버라이딩","상속 문제에서는 참조 변수의 선언 타입과 실제 객체 타입을 따로 적습니다. 오버라이딩된 인스턴스 메서드는 실제 객체 타입을 기준으로 선택됩니다."],
  [/오버로딩/,"오버로딩","이름이 같은 메서드가 여러 개일 때는 호출 시 전달한 인자의 개수와 자료형을 보고 어떤 메서드가 선택되는지 판단합니다."],
  [/static/,"static","static 값은 객체마다 따로 생기는 값이 아니라 클래스가 공유하는 값입니다. 여러 번 호출되어도 이전 값이 유지되는지 확인합니다."],
  [/예외|try-catch-finally/,"예외 처리","try에서 오류가 발생하면 남은 문장을 건너뛰고 맞는 catch로 이동합니다. finally는 예외 발생 여부와 관계없이 실행되는지 확인합니다."],
  [/비트|XOR|AND|시프트/,"비트 연산","비트 연산은 정수를 2진수로 바꾸어 각 자리별로 계산합니다. AND, OR, XOR, 시프트를 일반 논리 연산과 혼동하지 않는 것이 중요합니다."],
  [/정렬|버블/,"정렬","정렬 문제는 한 번의 비교가 끝날 때 배열이 어떻게 바뀌는지 적습니다. 교환되는 두 값만 표시하면 전체 흐름을 쉽게 따라갈 수 있습니다."],
  [/슬라이싱|인덱스|pop|튜플|딕셔너리|lambda/,"Python 자료 처리","Python에서는 연산 전후의 자료구조 상태를 적어보는 것이 중요합니다. 슬라이스 범위, 음수 인덱스, 메서드가 반환하는 값과 원본 변경 여부를 구분합니다."],
  [/SELECT|WHERE|DISTINCT|ORDER BY|DESC|ASC/,"SQL 조회","SQL 조회는 보통 FROM에서 데이터를 가져온 뒤 WHERE로 행을 고르고, SELECT로 출력 열을 정하고, ORDER BY로 마지막 순서를 정한다고 생각하면 이해하기 쉽습니다."],
  [/GROUP BY|HAVING|COUNT|AVG|SUM|MIN|MAX/,"SQL 집계","집계 문제는 먼저 그룹을 나눈 뒤 각 그룹의 값을 계산합니다. WHERE는 그룹을 만들기 전 행을 거르고, HAVING은 그룹 계산 뒤 조건을 적용합니다."],
  [/JOIN|서브쿼리/,"SQL 조인과 서브쿼리","JOIN은 두 테이블의 연결 기준을 먼저 찾습니다. 서브쿼리는 안쪽 SELECT의 결과를 먼저 구한 다음 그 값을 바깥 SQL에 넣어 생각합니다."],
  [/UPDATE|INSERT|DELETE|VALUES|SET/,"SQL 데이터 변경","데이터 변경 SQL은 대상 테이블, 바꿀 열 또는 값, 적용할 행 조건을 분리해서 확인합니다. 특히 UPDATE와 DELETE에서는 WHERE 조건을 빠뜨리지 않습니다."],
  [/CHECK|UNIQUE|INDEX|FOREIGN KEY|REFERENCES|제약/,"SQL 제약과 객체","제약조건은 잘못된 데이터가 들어오는 것을 막는 규칙입니다. 외래키는 자식 테이블의 열과 부모 테이블의 참조 열을 연결합니다."]
];

function plainConcepts(q){
  const source=[q.title,...(q.concepts||[])].join(" ");
  const result=[];
  for(const [pattern,title,text] of RULES){
    if(pattern.test(source)&&!result.some(item=>item.title===title))result.push({title,text});
    if(result.length===3)break;
  }
  if(!result.length){
    result.push({
      title:q.language+" 문제 읽기",
      text:q.language==="SQL"
        ?"SQL 문장을 한 번에 외우기보다 데이터가 선택되고 가공되는 순서를 단계별로 따라가면 됩니다."
        :"코드를 한 번에 계산하려 하지 말고, 한 문장이 실행될 때마다 변수와 자료구조의 값이 어떻게 바뀌는지 적어보세요."
    });
  }
  return result;
}

export function beginnerFocus(q){
  if(q.language==="SQL"){
    if(q.questionType==="sql_write")return "문제 문장에서 ① 대상 테이블 ② 필요한 열과 값 ③ 조건을 먼저 표시하세요. 그다음 SELECT·INSERT·UPDATE·DELETE·DDL 중 어떤 문장이 필요한지 정하면 됩니다.";
    if(q.questionType==="blank")return "빈칸 자체보다 앞뒤 SQL을 먼저 읽으세요. 빈칸이 조회, 조건, 그룹, 정렬, 변경, 제약 중 어느 역할인지 찾으면 후보가 크게 줄어듭니다.";
    return "SQL은 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY 순서로 중간 결과를 적어보세요. 실제 작성 순서와 실행을 이해하는 순서는 다를 수 있습니다.";
  }
  if(q.language==="C")return "처음부터 암산하지 말고 초기값을 적은 뒤, 반복문 한 번 또는 함수 호출 한 번이 끝날 때마다 변수·배열·포인터가 가리키는 값을 갱신하세요.";
  if(q.language==="Java")return "변수의 값뿐 아니라 객체의 실제 타입도 적어두세요. 상속 문제가 아니더라도 메서드 호출 전후에 어떤 값이 바뀌는지 한 문장씩 따라가면 됩니다.";
  if(q.language==="Python")return "리스트·문자열·딕셔너리의 현재 상태를 먼저 적고, 슬라이스나 메서드를 적용한 뒤 원본이 바뀌는지 새 값이 만들어지는지 확인하세요.";
  return "초기값 → 실행 순서 → 최종 출력의 세 칸으로 나누어 적어보세요.";
}

export function beginnerConcepts(q){
  return plainConcepts(q);
}

export function examMemory(q){
  if(q.language==="SQL"){
    if(q.questionType==="sql_write")return "SQL 작성형은 키워드를 외우는 것보다 ‘무엇을, 어디에서, 어떤 조건으로’ 처리하는지 문장으로 먼저 만드는 습관이 중요합니다.";
    return "SQL 결과 문제는 중간 결과를 생략하지 마세요. 특히 NULL, 중복 제거, 그룹 조건, 정렬 순서에서 실수가 많이 납니다.";
  }
  if(q.language==="C")return "C 문제는 포인터, 배열 인덱스, 정수 나눗셈, 증가 연산자의 실행 시점을 표시하면 대부분의 실수를 줄일 수 있습니다.";
  if(q.language==="Java")return "Java 문제는 선언 타입과 실제 객체 타입, static 여부, 오버라이딩과 오버로딩을 서로 구분해서 표시하세요.";
  if(q.language==="Python")return "Python 문제는 인덱스 범위, 슬라이싱의 끝값 제외, mutable 객체의 변경 여부와 출력 형식을 확인하세요.";
  return "답을 쓰기 전에 마지막 출력문 또는 문제에서 요구한 빈칸을 한 번 더 확인하세요.";
}

export function beginnerSteps(q){
  return (q.steps||[]).filter(Boolean);
}
