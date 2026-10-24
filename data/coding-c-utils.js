import {cBlueprint} from "./coding-c-blueprint.js?v=20261022-help-c-1";
import {cGuidance} from "./coding-c-guidance.js?v=20261022-help-c-1";
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
  if(l.includes("puts("))return "문자열을 출력하고 줄바꿈합니다";
  if(l.includes("putchar("))return "문자 하나를 출력합니다";
  if(l.includes("printf("))return "형식 지정자에 따라 값을 출력합니다";
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
function traceFor(spec, detail) {
  const notes = (detail || "").split("|").filter(Boolean);
  const rows = [];
  if (spec.input !== "입력 없음") {
    rows.push(["입력", "예제 입력", "표준 입력에서 값을 읽어 변수에 저장", spec.input]);
  }
  for (const [i, part] of notes.entries()) {
    const assignments = [...part.matchAll(/(?:^|[,\s])([a-zA-Z_]\w*(?:\[[^\]]+\])?)\s*=\s*(-?\d+(?:\.\d+)?|'[^']*'|"[^"]*")/g)];
    const named = part.match(/(?:^|[^a-zA-Z_])([a-zA-Z_]\w*(?:\[[^\]]+\])?)\s*[:=]/)?.[1] || "";
    let target = assignments.length > 1
      ? [...new Set(assignments.map(match => match[1]))].join(", ")
      : named || (/출력/.test(part) ? "출력" : /비교|조건|참|거짓/.test(part) ? "조건" : "실행 단계");
    if (target.length > 38) target = "실행 단계";

    // Only show values supported by the authored example trace; never invent a state.
    let result = "—";
    if (part.includes("→")) {
      const tail = part.split("→").at(-1).trim();
      const numeric = tail.match(/^(-?\d+(?:\.\d+)?)(?:\s|$|\()/);
      result = named && numeric ? named + "=" + numeric[1] : tail;
    } else if (assignments.length > 1) {
      result = assignments.map(match => match[1] + "=" + match[2]).join(", ");
    } else {
      const finalAssignment = part.match(/=\s*(-?\d+(?:\.\d+)?|'[^']*'|"[^"]*")(?:\s*\([^)]*\))?\s*$/);
      if (finalAssignment) result = (named ? named + "=" : "") + finalAssignment[1];
      else if (/출력/.test(part)) result = spec.output;
      else if (named && part.includes(":")) result = part.slice(part.indexOf(":") + 1).trim() || "—";
    }
    rows.push([(i + 1) + "단계", target, part, result]);
  }
  rows.push(["출력", "화면", spec.input === "입력 없음"
    ? "입력 없이 지정된 문자열 출력" : "예제 입력에 대한 결과 출력", spec.output]);
  return rows;
}

export function makeCProblem(n,body,options={}) {
  const spec=byNumber.get(n);
  if(!spec||[1,24].includes(n))throw Error("등록 대상 아님: "+n);
  const guidance=cGuidance.get(n);
  if(!guidance||guidance.length!==2)throw Error("문제별 힌트·해설 없음: "+n);
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
    hint:guidance[0],
    code:annotate(program,options.trace||"",spec.input),
    explanation:guidance[1],
    trace:traceFor(spec,options.trace||""),
    testCases:options.tests||[]
  };
}
