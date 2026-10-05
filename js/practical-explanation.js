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

function topicSource(q){
  return [q.title,...(q.concepts||[])].join(" ");
}

const FOCUS_RULES=[
  [/포인터|역참조|이중 포인터|연결 리스트/,"주소와 실제 값을 따로 적으세요. 포인터가 어느 변수를 가리키는지 먼저 표시한 뒤 * 연산으로 읽히는 값을 한 단계씩 확인합니다."],
  [/배열|2차원 배열|리스트/,"배열이나 리스트의 초기값을 인덱스와 함께 적으세요. 반복이 한 번 끝날 때마다 바뀐 위치의 값만 갱신하면 흐름을 놓치지 않습니다."],
  [/문자열|문자 배열|ASCII/,"문자열의 각 문자와 위치를 먼저 표시하세요. 인덱스로 어떤 문자를 읽는지, 문자 자체를 출력하는지 코드값을 계산하는지 구분합니다."],
  [/재귀|팩토리얼/,"재귀 함수가 멈추는 조건을 먼저 찾으세요. 호출이 어디까지 내려가는지 적은 뒤 반환값을 아래에서 위로 계산합니다."],
  [/반복문|for|while|누적|누적합/,"초기값을 적은 뒤 반복문이 한 번 실행될 때마다 핵심 변수의 값만 한 줄씩 갱신하세요. 반복 조건이 언제 거짓이 되는지도 함께 확인합니다."],
  [/if|조건식|삼항|switch|break|continue/,"조건식을 먼저 참·거짓으로 판단하고 실제로 실행되는 문장만 따라가세요. break나 continue가 있다면 다음 실행 위치가 어디인지 표시합니다."],
  [/비트|XOR|AND|시프트/,"계산할 값을 2진수로 바꾸어 각 비트를 나란히 적으세요. AND·OR·XOR·시프트가 어느 자리의 값을 바꾸는지 순서대로 확인합니다."],
  [/정렬|버블/,"배열의 초기 순서를 적고 비교되는 두 값만 표시하세요. 교환이 일어날 때마다 배열 상태를 새 줄에 적으면 정렬 과정을 쉽게 추적할 수 있습니다."],
  [/구조체/,"구조체의 각 멤버에 어떤 값이 들어 있는지 먼저 적으세요. 구조체 변수인지 구조체 포인터인지 구분한 뒤 접근하는 멤버의 값을 확인합니다."],
  [/함수|메서드|값 전달/,"함수를 호출할 때 전달되는 값과 매개변수를 먼저 적으세요. 함수 안에서 계산된 값과 반환된 값이 호출한 곳에서 어떻게 사용되는지 순서대로 확인합니다."],
  [/상속|오버라이딩|동적 바인딩|super|필드 숨김/,"참조 변수의 선언 타입과 실제 생성된 객체 타입을 따로 적으세요. 그다음 어떤 필드와 메서드가 선택되는지 호출 순서대로 확인합니다."],
  [/오버로딩/,"같은 이름의 메서드 중 어떤 것이 호출되는지 인자의 개수와 자료형부터 확인하세요. 선택된 메서드만 따라가 결과를 계산합니다."],
  [/static/,"static으로 선언된 값이 클래스 전체에서 공유되는지 먼저 확인하세요. 함수나 메서드가 여러 번 호출될 때 이전 값이 유지되는지 순서대로 적습니다."],
  [/예외|try-catch-finally/,"try 블록을 위에서부터 따라가며 예외가 발생하는 지점을 찾으세요. 그 뒤 어떤 catch로 이동하고 finally가 실행되는지 확인합니다."],
  [/슬라이싱|인덱스|pop|튜플|딕셔너리|lambda/,"현재 자료의 값과 인덱스를 먼저 적으세요. 연산을 적용한 뒤 원본이 바뀌는지, 새로운 값이 만들어지는지 한 단계씩 확인합니다."]
];

const MEMORY_RULES=[
  [/포인터|역참조|이중 포인터|연결 리스트/,"포인터 문제에서는 ‘주소’와 ‘그 주소에 저장된 값’을 한 칸에 섞어 적지 마세요. 가리키는 대상과 *로 읽은 값을 분리하면 실수가 크게 줄어듭니다."],
  [/배열|2차원 배열|리스트/,"배열 문제는 인덱스를 먼저 적고 시작하세요. 반복문의 시작값과 끝 조건이 실제로 어느 인덱스까지 접근하는지 마지막에 다시 확인합니다."],
  [/문자열|문자 배열|ASCII/,"문자열 문제는 문자와 인덱스를 함께 적고, 마지막의 널 문자나 슬라이스 범위를 문제에서 실제로 사용하는지 확인하세요."],
  [/재귀|팩토리얼/,"재귀 문제는 종료 조건을 찾지 않고 계산을 시작하면 쉽게 꼬입니다. ‘종료 조건 → 호출 확장 → 반환 계산’ 순서를 고정해서 푸세요."],
  [/반복문|for|while|누적|누적합/,"반복문 문제는 머릿속으로 여러 번 돌리지 말고 반복 1회마다 변수값을 적으세요. 시작값, 증감식, 종료 조건 세 곳을 마지막에 다시 확인합니다."],
  [/if|조건식|삼항|switch|break|continue/,"조건 문제는 모든 문장을 읽는 것이 아니라 실제로 실행되는 경로만 표시하세요. break와 continue 뒤의 실행 위치를 특히 주의합니다."],
  [/비트|XOR|AND|시프트/,"비트 연산은 10진수 암산보다 2진수로 적는 편이 안전합니다. 시프트 방향과 이동한 비트 수를 마지막에 다시 확인하세요."],
  [/정렬|버블/,"정렬 문제는 전체 배열을 매번 다시 계산하지 말고 비교·교환된 위치만 갱신하세요. 몇 회전까지 수행되는지도 확인합니다."],
  [/상속|오버라이딩|동적 바인딩|super|필드 숨김/,"Java 상속 문제는 선언 타입과 실제 객체 타입을 섞지 마세요. 필드 접근과 오버라이딩 메서드 호출의 기준이 다를 수 있습니다."],
  [/오버로딩/,"오버로딩은 실행 중 객체 타입보다 호출 시점의 인자 개수와 자료형이 중요합니다. 후보 메서드의 매개변수를 먼저 비교하세요."],
  [/static/,"static 값은 객체별 값이 아니라 공유 값이라는 점을 기억하세요. 호출 횟수가 늘어날 때 값이 누적되는지 확인합니다."],
  [/예외|try-catch-finally/,"예외가 발생한 줄 다음의 try 문장은 실행되지 않습니다. 어떤 catch가 선택되고 finally가 실행되는지를 순서대로 확인하세요."],
  [/슬라이싱|인덱스|pop|튜플|딕셔너리|lambda/,"Python 자료 처리 문제는 연산 결과와 원본 변경 여부를 구분하세요. 특히 슬라이싱의 끝 인덱스는 포함되지 않는다는 점을 확인합니다."],
  [/함수|메서드|값 전달/,"함수 문제는 전달값, 지역 변수, 반환값을 서로 다른 값으로 구분해서 적으세요. 반환된 값이 이후 계산에 다시 사용되는지도 확인합니다."]
];

function matchedText(q,rules){
  const source=topicSource(q);
  const found=rules.find(([pattern])=>pattern.test(source));
  return found?found[1]:"";
}

export function beginnerFocus(q){
  if(q.language==="SQL"){
    const source=topicSource(q);
    if(/JOIN|서브쿼리/.test(source))return "연결되는 테이블과 기준 열을 먼저 표시하세요. 서브쿼리가 있다면 안쪽 SELECT의 결과를 먼저 구한 뒤 바깥 SQL에 넣어 생각합니다.";
    if(/GROUP BY|HAVING|COUNT|AVG|SUM|MIN|MAX/.test(source))return "FROM과 WHERE를 거친 행을 먼저 확인한 뒤 그룹을 나누고 집계값을 계산하세요. HAVING은 그룹 계산이 끝난 뒤 적용합니다.";
    if(/UPDATE|INSERT|DELETE|VALUES|SET/.test(source))return "대상 테이블, 바꿀 열 또는 넣을 값, 적용 조건을 각각 표시하세요. 그 세 요소를 확인한 뒤 SQL 문장을 조립합니다.";
    if(/CHECK|UNIQUE|INDEX|FOREIGN KEY|REFERENCES|제약/.test(source))return "어떤 제약이나 객체를 만드는 문제인지 먼저 확인하고, 대상 테이블·열·참조 대상을 문제 문장에서 각각 찾아 표시하세요.";
    if(q.questionType==="sql_write")return "문제 문장에서 ① 대상 테이블 ② 필요한 열과 값 ③ 조건을 먼저 표시하세요. 그다음 필요한 SQL 명령을 선택합니다.";
    if(q.questionType==="blank")return "빈칸 앞뒤 SQL을 먼저 읽고 각 빈칸이 조회·조건·그룹·정렬·변경 중 어느 역할인지 구분하세요.";
    return "먼저 FROM의 원본 데이터를 확인하고 WHERE로 남는 행을 표시하세요. 그다음 SELECT 결과와 ORDER BY 정렬을 차례대로 적용합니다.";
  }
  return matchedText(q,FOCUS_RULES)||"변수의 초기값과 실제 출력문을 먼저 표시하세요. 코드를 위에서 아래로 한 문장씩 실행하면서 값이 바뀌는 지점만 적어 최종 결과를 확인합니다.";
}

export function beginnerConcepts(q){
  return plainConcepts(q);
}

export function examMemory(q){
  if(q.language==="SQL"){
    const source=topicSource(q);
    if(/GROUP BY|HAVING|COUNT|AVG|SUM|MIN|MAX/.test(source))return "집계 SQL에서는 WHERE와 HAVING의 적용 시점을 구분하세요. WHERE는 행을 먼저 거르고, HAVING은 그룹 계산 후 조건을 적용합니다.";
    if(/JOIN|서브쿼리/.test(source))return "JOIN은 연결 조건을, 서브쿼리는 안쪽 결과를 먼저 확인하세요. 두 단계의 중간 결과를 적으면 실수를 줄일 수 있습니다.";
    if(/UPDATE|INSERT|DELETE|VALUES|SET/.test(source))return "데이터 변경 SQL에서는 테이블명·열 이름·값·WHERE 조건을 마지막에 다시 확인하세요. 특히 UPDATE와 DELETE의 조건 누락을 주의합니다.";
    if(/CHECK|UNIQUE|INDEX|FOREIGN KEY|REFERENCES|제약/.test(source))return "제약조건 문제는 제약의 종류와 대상 열을 먼저 확인하세요. 외래키라면 자식 열과 부모 테이블의 참조 열을 정확히 구분합니다.";
    if(q.questionType==="sql_write")return "SQL 작성형은 ‘무엇을, 어디에서, 어떤 조건으로’ 처리하는지 한글로 먼저 정리한 뒤 문법으로 옮기세요.";
    return "SQL 결과 문제는 중간 결과를 생략하지 마세요. WHERE 적용 후 남은 행과 최종 SELECT 결과를 따로 적으면 안전합니다.";
  }
  return matchedText(q,MEMORY_RULES)||"답을 쓰기 전에 마지막 출력문과 문제에서 요구한 값이 같은 대상인지 확인하세요. 공백·줄바꿈·대소문자도 최종 답의 일부일 수 있습니다.";
}

const STEP_BOILERPLATE=[
  /먼저 변수의 초기값과 실제 출력문을 표시합니다/,
  /이 문제의 핵심 개념은/,
  /코드나 SQL에서/,
  /^먼저 문제에서 테이블명, 처리할 열, 값, 조건을/,
  /^먼저 빈칸 앞뒤의 SQL을/,
  /^먼저 주어진 테이블과 SQL을/,
  /^먼저 빈칸 앞뒤 코드를/,
  /^마지막으로 출력문을 다시 보고/,
  /^마지막으로 문제에서 요구한 값만/,
  /^마지막으로 SELECT에 남는 열/,
  /^마지막으로 빈칸을 앞에서부터/
];

const EXPLANATION_BOILERPLATE=[
  /^먼저 변수의 초기값과 실제 출력문을 표시합니다\.$/,
  /^반복문·조건문·함수 호출이 있으면/,
  /^이 문제의 핵심 개념은 .*입니다\.$/,
  /^코드나 SQL에서 이 개념이 사용되는 부분을/,
  /^C 코드는 한 문장이/,
  /^Java 코드는 변수값과 객체 상태를/,
  /^Python 코드는 연산 전후의/,
  /^SQL은 각 절을 한 번에 읽기보다/,
  /^먼저 주어진 테이블과 SQL을/,
  /^먼저 빈칸 앞뒤 코드를/,
  /^먼저 빈칸 앞뒤의 SQL을/,
  /^먼저 문제에서 테이블명, 처리할 열, 값, 조건을/,
  /^마지막으로 출력문을 다시 보고/,
  /^마지막으로 테이블명·열 이름·조건 연산자/,
  /^마지막으로 문제에서 요구한 값만/,
  /^마지막으로 SELECT에 남는 열/,
  /^마지막으로 빈칸을 앞에서부터/,
  /^이 문제에서는 .*의 흐름을 이해하는 것이 핵심입니다\.$/
];

function languageMismatch(q,text){
  const value=String(text||"");
  if(q.language!=="SQL"&&/\bSQL\b/.test(value))return true;
  if(q.language==="SQL"&&/(?:C 코드는|Java 코드는|Python 코드는)/.test(value))return true;
  return false;
}

export function beginnerSteps(q){
  const seen=new Set();
  return (q.steps||[])
    .map(step=>String(step||"").trim())
    .filter(Boolean)
    .filter(step=>!STEP_BOILERPLATE.some(pattern=>pattern.test(step)))
    .filter(step=>!languageMismatch(q,step))
    .filter(step=>{const key=step.normalize("NFKC").replace(/\s+/g," ");if(seen.has(key))return false;seen.add(key);return true;});
}

export function beginnerExplanation(q){
  const seen=new Set();
  return String(q.explanation||"")
    .split(/(?<=[.!?])\s+/)
    .map(sentence=>sentence.trim())
    .filter(Boolean)
    .filter(sentence=>!EXPLANATION_BOILERPLATE.some(pattern=>pattern.test(sentence)))
    .filter(sentence=>!languageMismatch(q,sentence))
    .filter(sentence=>{const key=sentence.normalize("NFKC").replace(/\s+/g," ");if(seen.has(key))return false;seen.add(key);return true;})
    .join(" ");
}

// 2026-10-05: beginner-first line-by-line code interpretation.
// The UI calls this only after the learner has submitted or the answer timer has expired.
const BLOCK_ONLY=/^[{}]+[;]?$/;

function cleanCodeLine(line){
  return String(line??"").replace(/\t/g,"    ").trim();
}

function shortExpr(value,max=64){
  const text=String(value??"").replace(/\s+/g," ").trim();
  return text.length>max?text.slice(0,max-1)+"…":text;
}

function explainSqlLine(line){
  const t=cleanCodeLine(line);
  const upper=t.toUpperCase();
  if(!t)return "";
  if(/^--/.test(t))return "작성자가 남긴 SQL 주석입니다.";
  if(/^(WITH)\b/.test(upper))return "뒤에서 사용할 임시 조회 결과(CTE)를 정의하기 시작합니다.";
  if(/^(SELECT)\b/.test(upper))return "최종 결과에서 어떤 열이나 계산값을 보여줄지 정합니다.";
  if(/^(DISTINCT)\b/.test(upper))return "중복되는 결과 행을 제거합니다.";
  if(/^(FROM)\b/.test(upper))return "조회할 원본 테이블이나 서브쿼리를 정합니다.";
  if(/^(INNER\s+|LEFT\s+|RIGHT\s+|FULL\s+|CROSS\s+)?JOIN\b/.test(upper))return "다른 테이블을 연결합니다. 어떤 행이 연결되는지는 이어지는 ON 조건으로 판단합니다.";
  if(/^(ON)\b/.test(upper))return "JOIN에서 두 테이블의 행을 어떤 조건으로 연결할지 정합니다.";
  if(/^(WHERE)\b/.test(upper))return "원본 행 중 조건을 만족하는 행만 남깁니다.";
  if(/^(GROUP\s+BY)\b/.test(upper))return "같은 값을 가진 행끼리 그룹으로 묶어 집계할 준비를 합니다.";
  if(/^(HAVING)\b/.test(upper))return "GROUP BY로 만든 그룹 중 집계 조건을 만족하는 그룹만 남깁니다.";
  if(/^(ORDER\s+BY)\b/.test(upper))return "최종 결과 행의 정렬 기준과 방향을 정합니다.";
  if(/^(INSERT\s+INTO)\b/.test(upper))return "새 행을 추가할 대상 테이블과 열을 지정합니다.";
  if(/^(VALUES)\b/.test(upper))return "INSERT로 넣을 실제 값을 지정합니다.";
  if(/^(UPDATE)\b/.test(upper))return "기존 행을 수정할 대상 테이블을 지정합니다.";
  if(/^(SET)\b/.test(upper))return "UPDATE에서 어떤 열을 어떤 값으로 바꿀지 지정합니다.";
  if(/^(DELETE\s+FROM)\b/.test(upper))return "조건에 맞는 행을 삭제할 대상 테이블을 지정합니다.";
  if(/^(CREATE\s+TABLE)\b/.test(upper))return "새 테이블의 이름과 구조를 정의하기 시작합니다.";
  if(/^(CREATE\s+(UNIQUE\s+)?INDEX)\b/.test(upper))return "검색이나 제약에 사용할 인덱스를 생성합니다.";
  if(/^(ALTER\s+TABLE)\b/.test(upper))return "기존 테이블의 구조나 제약조건을 변경합니다.";
  if(/^(CONSTRAINT|PRIMARY\s+KEY|FOREIGN\s+KEY|REFERENCES|UNIQUE|CHECK)\b/.test(upper))return "테이블에 적용할 무결성 제약조건과 참조 대상을 지정합니다.";
  if(/^(AND|OR)\b/.test(upper))return "앞의 조건에 조건을 하나 더 연결합니다.";
  if(/^\)$/.test(t)||/^\);$/.test(t))return "앞에서 시작한 SQL 괄호 또는 정의를 닫습니다.";
  return "이 SQL 조각이 앞뒤 절과 어떤 역할로 연결되는지 확인합니다.";
}

function explainPythonLine(line){
  const t=cleanCodeLine(line);
  if(!t)return "";
  if(/^#/.test(t))return "작성자가 남긴 Python 주석입니다.";
  if(/^(from\s+\S+\s+import|import\s+)/.test(t))return "문제에서 사용할 모듈이나 기능을 불러옵니다.";
  let m=t.match(/^class\s+([A-Za-z_]\w*)/);
  if(m)return m[1]+" 클래스를 정의하기 시작합니다.";
  m=t.match(/^def\s+([A-Za-z_]\w*)\s*\((.*)\)\s*:/);
  if(m)return m[1]+" 함수를 정의합니다. 괄호 안의 값은 함수가 받을 매개변수입니다.";
  if(/^if\s+.+:\s*$/.test(t))return "if 뒤의 조건을 계산해 참이면 아래 들여쓰기 블록을 실행합니다.";
  if(/^elif\s+.+:\s*$/.test(t))return "앞 조건이 거짓일 때 이 조건을 다시 검사하고, 참이면 아래 블록을 실행합니다.";
  if(/^else\s*:/.test(t))return "앞의 if/elif 조건이 모두 거짓일 때 아래 블록을 실행합니다.";
  m=t.match(/^for\s+([A-Za-z_]\w*)\s+in\s+(.+):\s*$/);
  if(m)return m[1]+"에 "+shortExpr(m[2])+"의 값을 하나씩 넣으면서 아래 블록을 반복합니다.";
  if(/^while\s+.+:\s*$/.test(t))return "while 뒤의 조건이 참인 동안 아래 블록을 반복합니다.";
  if(/^try\s*:/.test(t))return "예외가 발생할 수 있는 코드를 실행하기 시작합니다.";
  if(/^except\b/.test(t))return "try에서 예외가 발생했을 때 처리할 블록입니다.";
  if(/^finally\s*:/.test(t))return "예외 발생 여부와 관계없이 마지막에 실행할 블록입니다.";
  if(/^break\b/.test(t))return "현재 반복문을 즉시 끝냅니다.";
  if(/^continue\b/.test(t))return "이번 반복의 남은 문장을 건너뛰고 다음 반복으로 이동합니다.";
  m=t.match(/^return(?:\s+(.+))?$/);
  if(m)return m[1]?"계산한 "+shortExpr(m[1])+" 값을 호출한 곳으로 돌려줍니다.":"함수 실행을 끝내고 호출한 곳으로 돌아갑니다.";
  if(/^print\s*\(/.test(t))return "괄호 안의 값이나 계산 결과를 화면에 출력합니다.";
  m=t.match(/^([A-Za-z_]\w*)\s*([+\-*/%]?=)\s*(.+)$/);
  if(m){
    if(m[2]==="=")return m[1]+"에 "+shortExpr(m[3])+"의 결과를 저장합니다.";
    return m[1]+"의 기존 값에 "+m[2][0]+" 연산을 적용한 결과를 다시 "+m[1]+"에 저장합니다.";
  }
  if(/^[A-Za-z_]\w*\.(append|extend|insert|remove|pop|sort|reverse)\s*\(/.test(t))return "리스트 메서드를 실행해 자료의 내용이나 순서를 변경합니다.";
  return "이 Python 문장을 실행한 뒤 변수나 자료구조의 값이 어떻게 달라지는지 확인합니다.";
}

function explainCJavaLine(line,language){
  const t=cleanCodeLine(line);
  if(!t)return "";
  if(/^\/\//.test(t)||/^\/\*/.test(t)||/^\*/.test(t))return "작성자가 남긴 코드 주석입니다.";
  let m=t.match(/^#include\s*[<"]([^>"]+)[>"]/);
  if(m)return m[1]+" 헤더를 포함해 필요한 함수나 자료형을 사용할 수 있게 합니다.";
  if(/^package\s+/.test(t))return "이 Java 클래스가 속한 패키지를 선언합니다.";
  if(/^import\s+/.test(t))return "Java에서 사용할 클래스나 기능을 불러옵니다.";
  m=t.match(/^(?:public\s+|private\s+|protected\s+|static\s+|final\s+|abstract\s+)*(class|interface|enum)\s+([A-Za-z_]\w*)/);
  if(m)return m[2]+" "+(m[1]==="class"?"클래스":m[1]==="interface"?"인터페이스":"열거형")+"를 정의하기 시작합니다.";
  m=t.match(/^struct\s+([A-Za-z_]\w*)\b/);
  if(m)return m[1]+" 구조체를 정의해 여러 값을 하나의 자료형으로 묶습니다.";
  if(/\bmain\s*\(/.test(t)&&/[{]?\s*$/.test(t))return "프로그램 실행이 시작되는 main 함수(메서드)를 선언하고 실행 블록을 시작합니다.";
  if(BLOCK_ONLY.test(t)){
    if(t.startsWith("{"))return "바로 앞에서 선언하거나 선택한 코드 블록을 시작합니다.";
    return "현재 함수·조건문·반복문·클래스의 코드 블록을 끝냅니다.";
  }
  if(/^else\s+if\s*\(/.test(t))return "앞 조건이 거짓일 때 이 조건을 다시 검사하고, 참이면 해당 블록을 실행합니다.";
  if(/^if\s*\(/.test(t))return "괄호 안의 조건식을 계산해 참이면 if 블록을 실행합니다.";
  if(/^else\b/.test(t))return "앞의 if 조건이 거짓일 때 else 블록을 실행합니다.";
  if(/^switch\s*\(/.test(t))return "괄호 안의 값을 계산한 뒤 일치하는 case 분기로 이동합니다.";
  m=t.match(/^case\s+(.+):/);
  if(m)return "switch 값이 "+shortExpr(m[1])+"와 같을 때 이 지점부터 실행합니다.";
  if(/^default\s*:/.test(t))return "어떤 case와도 일치하지 않을 때 실행하는 기본 분기입니다.";
  if(/^for\s*\(/.test(t)){
    const body=t.slice(t.indexOf("(")+1,t.lastIndexOf(")"));
    const parts=body.split(";");
    if(parts.length===3)return "반복문입니다. 처음 "+shortExpr(parts[0])+"을 실행하고, "+shortExpr(parts[1])+"가 참인 동안 반복하며, 매 반복 뒤 "+shortExpr(parts[2])+"를 실행합니다.";
    return "괄호 안의 범위나 조건에 따라 아래 블록을 반복 실행합니다.";
  }
  if(/^while\s*\(/.test(t))return "괄호 안의 조건이 참인 동안 아래 블록을 반복합니다.";
  if(/^do\b/.test(t))return "아래 블록을 먼저 한 번 실행한 뒤 while 조건을 검사하는 반복문을 시작합니다.";
  if(/^break\s*;/.test(t))return "현재 반복문이나 switch를 즉시 끝냅니다.";
  if(/^continue\s*;/.test(t))return "이번 반복의 남은 문장을 건너뛰고 다음 반복으로 이동합니다.";
  if(/^try\b/.test(t))return "예외가 발생할 수 있는 코드를 실행하기 시작합니다.";
  if(/^catch\s*\(/.test(t))return "try에서 발생한 예외 중 괄호의 형식과 맞는 예외를 처리합니다.";
  if(/^finally\b/.test(t))return "예외 발생 여부와 관계없이 마지막에 실행할 블록입니다.";
  m=t.match(/^return(?:\s+(.+?))?;?\s*$/);
  if(m)return m[1]&&m[1]!=="0"?"계산한 "+shortExpr(m[1])+" 값을 호출한 곳으로 돌려주고 현재 함수를 끝냅니다.":"현재 함수를 끝냅니다.";
  if(/\b(printf|puts|putchar)\s*\(/.test(t))return "괄호 안의 형식과 값을 계산해 화면에 출력합니다.";
  if(/\b(scanf|gets|fgets)\s*\(/.test(t))return "입력값을 읽어 지정한 변수나 메모리 공간에 저장합니다.";
  if(/\bSystem\.out\.(print|println|printf)\s*\(/.test(t))return "괄호 안의 값이나 계산 결과를 화면에 출력합니다.";
  if(/\bnew\s+[A-Za-z_]\w*\s*\(/.test(t)&&/=/.test(t))return "new로 객체를 생성하고 그 참조값을 왼쪽 변수에 저장합니다.";
  m=t.match(/^(.+?)\s+([A-Za-z_]\w*)\s*\[\s*([^\]]*)\s*\]\s*=\s*(.+);$/);
  if(m)return m[2]+" 배열을 만들고 "+shortExpr(m[4])+"의 값으로 초기화합니다.";
  m=t.match(/^(.+?)\s*\*\s*([A-Za-z_]\w*)\s*=\s*(.+);$/);
  if(m)return m[2]+" 포인터를 선언하고 "+shortExpr(m[3])+"이 가리키는 주소를 저장합니다.";
  m=t.match(/^(?:const\s+)?(?:unsigned\s+|signed\s+|long\s+|short\s+)?(?:int|char|float|double|long|short|boolean|bool|String|Integer|Double|Character)\s+([A-Za-z_]\w*)\s*=\s*(.+);$/);
  if(m)return m[1]+" 변수를 선언하고 "+shortExpr(m[2])+"의 계산 결과로 초기화합니다.";
  m=t.match(/^([A-Za-z_]\w*)\s*(\^=|\+=|-=|\*=|\/=|%=)\s*(.+);$/);
  if(m){
    const names={"^=":"XOR","+=":"덧셈","-=":"뺄셈","*=":"곱셈","/=":"나눗셈","%=":"나머지"};
    return m[1]+"의 현재 값과 "+shortExpr(m[3])+"을 "+names[m[2]]+"한 결과를 다시 "+m[1]+"에 저장합니다.";
  }
  m=t.match(/^([A-Za-z_]\w*)\s*=\s*(.+);$/);
  if(m)return m[1]+"에 "+shortExpr(m[2])+"의 계산 결과를 저장합니다.";
  if(/(\+\+|--)\s*;?$/.test(t))return "증가 또는 감소 연산으로 해당 변수의 값을 1만큼 바꿉니다.";
  if(/^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)?\s*\(.*\)\s*;?$/.test(t))return "함수나 메서드를 호출하고, 전달한 인자에 따라 실행 결과나 부수 효과를 확인합니다.";
  if(/^[{}].*[{}];?$/.test(t))return "자료형이나 블록의 범위를 한 줄에서 정의합니다. 중괄호 안의 선언과 값을 함께 확인합니다.";
  return (language==="Java"?"이 Java 문장을":"이 C 문장을")+" 실행한 뒤 변수·배열·객체의 값이 어떻게 달라지는지 확인합니다.";
}

export function lineByLineExplanation(q,codeOverride=""){
  const language=String(q?.language||"");
  const source=String(codeOverride||q?.code||"");
  if(!source.trim())return [];
  const lines=source.replace(/\r\n?/g,"\n").split("\n");
  return lines.map((raw,index)=>{
    const code=String(raw).replace(/\s+$/,"");
    const trimmed=cleanCodeLine(code);
    if(!trimmed)return null;
    const explanation=language==="SQL"
      ?explainSqlLine(trimmed)
      :language==="Python"
        ?explainPythonLine(trimmed)
        :explainCJavaLine(trimmed,language);
    return {line:index+1,code,explanation};
  }).filter(Boolean);
}

