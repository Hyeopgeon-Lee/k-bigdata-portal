import {pythonBlueprint} from "./coding-python-blueprint.js?v=20261024-help-122";
const byNumber=new Map(pythonBlueprint.map(p=>[Number(p.id.slice(3)),p]));
function description(line) {
  const s=line.trim();
  if(s.startsWith("def "))return "함수를 정의하고 인수를 받습니다";
  if(s.startsWith("return "))return "함수의 결과를 호출 위치로 반환합니다";
  if(s.startsWith("for "))return "반복할 값을 차례대로 가져옵니다";
  if(s.startsWith("while "))return "조건이 참인 동안 반복합니다";
  if(s.startsWith("if "))return "조건식을 검사하여 실행 여부를 결정합니다";
  if(s.startsWith("elif "))return "앞의 조건이 거짓일 때 다른 조건을 확인합니다";
  if(s.startsWith("else:"))return "앞선 조건이 거짓일 때 실행합니다";
  if(s.startsWith("break"))return "현재 반복문을 종료합니다";
  if(s.startsWith("continue"))return "이번 회차를 건너뛰고 다음 반복으로 이동합니다";
  if(s.startsWith("print("))return "계산한 값을 문제의 출력 형식으로 출력합니다";
  if(s.includes("input()")||s.includes("input("))return "표준 입력의 문자열을 읽고 필요한 자료형으로 변환합니다";
  if(s.includes(".append("))return "기존 리스트 뒤에 원소를 추가하여 원본을 변경합니다";
  if(s.includes(".sort("))return "리스트 자체의 원소 순서를 변경합니다. 반환값은 None입니다";
  if(s.includes("sorted("))return "원본은 유지하고 정렬된 새 리스트를 생성합니다";
  if(s.includes(".copy("))return "원본과 구별되는 새 리스트를 생성합니다(얕은 복사)";
  if(s.includes("set("))return "집합으로 변환해 중복된 원소를 제거합니다";
  if(s.includes(".get("))return "딕셔너리에서 키를 조회하고 기본값을 사용합니다";
  if(s.includes("+=")||s.includes("++"))return "이전 변수 값에 오른쪽 값을 누적합니다";
  if(s.includes("-="))return "이전 변수 값에서 오른쪽 값을 뺍니다";
  if(s.includes("=")&&!s.includes("=="))return "오른쪽 표현식을 계산해 왼쪽 변수·원소에 저장합니다";
  if(s==="pass")return "별도 처리 없이 진행합니다";
  return "이 문장을 실행하여 다음 코드로 진행합니다";
}
function annotate(source, example, traceDetails) {
  const notes=(traceDetails||"").split("|").filter(Boolean);
  const used=new Set();
  return source.split("\n").map((line)=>{
    if(!line.trim()||/\s+#\s/.test(line))return line;
    const s=line.trim();
    let note=description(line);
    if(s.includes("input(")&&example!=="입력 없음")note+=". 예제 입력: "+example.replace(/\n/g," / ").slice(0,50);
    const m=s.match(/^([A-Za-z_]\w*|[A-Za-z_]\w*\[[^\]]+\])\s*(?:\+=|-=|\*=|\/=|=(?!=))/);
    if(m){
      let ix=notes.findIndex((v,i)=>!used.has(i)&&(
        v.startsWith(m[1]+":")||v.startsWith(m[1]+"=")||v.includes(" "+m[1]+":")
      ));
      if(ix>=0){note+=". 예제 상태: "+notes[ix].slice(0,105);used.add(ix);}
    }
    return line+"  # "+note;
  }).join("\n");
}
function traceFor(spec,details) {
  const notes=(details||"").split("|").filter(Boolean);
  const trace=[["입력","예제 입력",spec.input==="입력 없음"?"입력 없음":spec.input,spec.input==="입력 없음"?"시작":spec.input]];
  notes.forEach((note,i)=>trace.push([String(i+1)+"단계",spec.traceFocus,note,note.includes("→")?note.split("→").at(-1).trim():note]));
  trace.push(["출력","예제 결과","입력 예제를 기준으로 계산",spec.output]);
  return trace;
}
export function makePythonProblem(n,source,opts={}){
 const spec=byNumber.get(n);
 if(!spec||[1,41].includes(n))throw Error("기존 문제 보존: "+n);
 const code=(opts.prefix?opts.prefix.trim()+"\n\n":"")+source.trim();
 return {id:spec.id,language:"python",level:spec.level,topic:spec.topic,title:spec.title,
   statement:spec.statement,input:spec.input,output:spec.output,
   hint:opts.hint||"입력·출력 형식을 확인하고 "+spec.concept+" 개념을 사용해 보세요. 변수 변화: "+spec.traceFocus,
   code:annotate(code,spec.input,opts.trace||""),
   explanation:opts.explanation||spec.concept+"을(를) 사용해 문제를 해결합니다. 예제에서 "+spec.traceFocus+"의 과정을 확인하고, "+spec.boundary+"도 검증하세요.",
   trace:traceFor(spec,opts.trace||spec.traceFocus),
   constraints:spec.boundary,concept:spec.concept,testCases:opts.tests||[]
 };
}
