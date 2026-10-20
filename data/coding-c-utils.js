import {cBlueprint} from "./coding-c-blueprint.js";
const byNumber = new Map(cBlueprint.map(p=>[Number(p.id.slice(2)),p]));
const stdIncludes = ["#include <stdio.h>"];
function describeLine(line) {
  const l=line.trim();
  if(l.startsWith("#include <stdio"))return "표준 입출력 기능을 사용합니다";
  if(l.startsWith("#include <string"))return "문자열 표준 함수를 사용합니다";
  if(l.startsWith("#include <ctype"))return "문자 처리 함수를 사용합니다";
  if(l.startsWith("typedef")||/^struct\s+\w+\s*\{/.test(l))return "구조체 형태를 정의합니다";
  if(l.startsWith("int main("))return "프로그램 실행이 시작됩니다";
  if(l.startsWith("return 0"))return "정상적으로 프로그램을 종료합니다";
  if(l.startsWith("return 1"))return "입력이 올바르지 않아 종료합니다";
  if(l.startsWith("if (scanf(")||l.startsWith("if(scanf("))return "입력값을 읽고 입력 성공 여부를 확인합니다";
  if(l.startsWith("if(")||l.startsWith("if ("))return "조건이 참인지 확인해 실행할 경로를 정합니다";
  if(l.startsWith("else"))return "앞의 조건이 거짓일 때 실행합니다";
  if(l.startsWith("for(")||l.startsWith("for ("))return "반복 변수와 반복 종료 조건을 확인합니다";
  if(l.startsWith("while(")||l.startsWith("while (")||l.startsWith("do {"))return "반복 조건을 확인하고 다음 단계로 진행합니다";
  if(l.includes("printf(")||l.includes("puts(")||l.includes("putchar("))return "계산된 결과를 요구된 출력 형식으로 출력합니다";
  if(l.startsWith("int ")||l.startsWith("double ")||l.startsWith("char ")||l.startsWith("size_t ")||l.startsWith("struct "))return "변수를 선언하고 필요한 초기값을 설정합니다";
  if(l.includes("+=")||l.includes("++"))return "기존 변수 값을 기준으로 누적하거나 1 증가시킵니다";
  if(l.includes("-=")||l.includes("--"))return "기존 변수 값을 기준으로 감소시킵니다";
  if(l.includes("*=")||l.includes("/="))return "이전 값에 연산을 적용하여 변수를 갱신합니다";
  if(l.includes("=")&&!l.includes("=="))return "오른쪽 표현식을 계산해 변수 또는 배열 원소 값을 갱신합니다";
  if(l.startsWith("break"))return "조건을 만족했으므로 현재 반복을 종료합니다";
  if(l.startsWith("continue"))return "다음 반복 단계로 이동합니다";
  if(l.startsWith("}"))return "현재 코드 블록을 마칩니다";
  return "이 문장을 실행하여 프로그램 흐름을 진행합니다";
}
function annotate(source, traceDetail="", exampleInput="") {
  const notes=traceDetail.split("|").filter(Boolean);
  const used=new Set();
  return source.split("\n").map(line=>{
    if(!line.trim()||line.includes(" // ")) return line;
    const statement=line.trim();
    let comment=describeLine(line);
    if(/scanf\(|fgets\(/.test(statement)&&exampleInput!=="입력 없음") {
      comment+=". 예제 입력: "+exampleInput.replace(/\n/g," / ").slice(0,55);
    }
    if(!/^(int |char |double |size_t |struct |if\b|for\b|while\b|do\b|return\b)/.test(statement)){
      const changed=statement.match(/^(\*?[A-Za-z_]\w*(?:\[[^\]]+\])?(?:\.[A-Za-z_]\w*)?)\s*(?:\+=|-=|\*=|\/=|=(?!=)|\+\+|--)/);
      const variable=changed?.[1]||"";
      if(variable){
        const hitIndex=notes.findIndex((note,index)=>!used.has(index)&&(
          note.startsWith(variable+":")||note.startsWith(variable+"=")||note.includes(" "+variable+":")
        ));
        if(hitIndex>=0){
          used.add(hitIndex);
          comment+=". 예제 값 변화: "+notes[hitIndex].slice(0,88);
        }
      }
    }
    return line+" // "+comment;
  }).join("\n");
}
function traceFor(spec,detail) {
  const note=(detail||"").split("|").filter(Boolean);
  return [
    ["입력","예제 입력",spec.input==="입력 없음"?"사용자 입력 없음":spec.input,spec.input==="입력 없음"?"시작":spec.input],
    ...note.map((part,i)=>[(i+1)+"단계",spec.traceFocus,part,part.includes("→")?part.split("→").at(-1).trim():part]),
    ["출력","최종 결과","예제 입력에서 계산한 출력",spec.output]
  ];
}
export function makeCProblem(n,body,options={}) {
  const spec=byNumber.get(n);
  if(!spec||[1,24].includes(n))throw Error("등록 대상 아님: "+n);
  const headers=[...stdIncludes];
  const all=(body||"")+"\n"+(options.prefix||"");
  if(/\b(strlen|strcmp|strchr|strcspn|snprintf|string.h)\b/.test(all))headers.push("#include <string.h>");
  if(/\b(toupper|tolower)\b/.test(all))headers.push("#include <ctype.h>");
  let program=headers.join("\n")+"\n"+(options.prefix?options.prefix.trim()+"\n":"")+"int main(void) {\n"
    +body.trim().split("\n").map(line=>"    "+line).join("\n")
    +"\n    return 0;\n}";
  return {
    id:spec.id,language:"c",level:spec.level,topic:spec.topic,
    title:spec.title,statement:spec.statement,
    input:spec.input,output:spec.output,
    hint:options.hint||"입력 범위와 출력 형식을 확인한 뒤, "+spec.traceFocus+"의 변화 순서대로 코드를 구성하세요.",
    code:annotate(program,options.trace||"",spec.input),
    explanation:options.explanation||"입력 예제와 동일한 값을 넣어 계산 과정을 추적해 보세요. "+spec.traceFocus+"에 주목하고, 경계 조건("+spec.boundary+")도 확인하세요.",
    trace:traceFor(spec,options.trace||""),
    testCases:options.tests||[]
  };
}
