// Pure learning rules. No browser storage, network, or code execution here.
export const HINT_SECONDS = 60;
export const ANSWER_SECONDS = 120;
export const REVEAL_SECONDS = ANSWER_SECONDS;
export const WAIT_SECONDS = HINT_SECONDS;
export const sourceLabels = {reconstructed:"비공식 복원기출",normalized:"공개 복원자료 기반 정규화",transformed:"기출 기반 변형",practice:"추가 연습문제"};
export const examLabels = {engineer:"정보처리기사",industrial_engineer:"정보처리산업기사"};
export const typeLabels = {output:"실행결과",blank:"빈칸채우기",interpret:"코드해석",sql_result:"SQL 결과",sql_write:"SQL 작성",error:"오류 찾기",other:"기타"};
export const languages = ["C","Java","Python","SQL"];
export const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const elapsedSeconds = (startedAt,now=Date.now()) => Math.max(0,Math.floor((now-startedAt)/1000));
export const remainingSeconds = (startedAt,now=Date.now()) => Math.max(0,Math.ceil((HINT_SECONDS*1000-(now-startedAt))/1000));
export const remainingAnswerSeconds = (startedAt,now=Date.now()) => Math.max(0,Math.ceil((ANSWER_SECONDS*1000-(now-startedAt))/1000));
export const secondsUntilHint = remainingSeconds;
export const secondsUntilAnswer = remainingAnswerSeconds;
export const hintAvailable = (attempt,now=Date.now()) => !!attempt && !attempt.submittedAt && !attempt.viewedExplanation && Number.isFinite(attempt.startedAt) && now-attempt.startedAt>=HINT_SECONDS*1000;
export const answerDeadlineReached = (attempt,now=Date.now()) => !!attempt && !attempt.submittedAt && !attempt.viewedExplanation && Number.isFinite(attempt.startedAt) && now-attempt.startedAt>=ANSWER_SECONDS*1000;
export const shouldAutoReveal = answerDeadlineReached;
export const canSubmit = (attempt,answer,now=Date.now()) => !!attempt && !attempt.submittedAt && !attempt.viewedExplanation && Number.isFinite(attempt.startedAt) && now>=attempt.startedAt && now-attempt.startedAt<ANSWER_SECONDS*1000 && !!String(answer??"").trim();
export const canReveal = (attempt,now=Date.now()) => !!attempt && Number.isFinite(attempt.startedAt) && (!!attempt.submittedAt || now-attempt.startedAt>=ANSWER_SECONDS*1000);
export function gradeAnswer(question, answer) {
  const normalize = value => String(value).normalize("NFKC").trim().replace(/\r/g,"").replace(/[\t ]+/g," ").replace(/ *\n */g,"\n");
  if(question.grading==="sql_keywords") return normalize(question.answer).toUpperCase()===normalize(answer).replace(/,/g," ").replace(/ +/g," ").toUpperCase();
  const accepted = [question.answer,...(question.acceptedAnswers||[])];
  if (accepted.some(value=>normalize(value)===normalize(answer))) return true;
  // Arbitrary SQL equivalence cannot be established without executing against a DB.
  return question.grading==="self" ? null : false;
}
export function buildBank(questions,history){
  return questions.filter(q=>q.enabled).map(q=>({...q,history:history.filter(h=>h.questionId===q.id)}));
}
export function bankStats(bank){
  const restored=bank.filter(q=>q.sourceType==="reconstructed"), histories=restored.flatMap(q=>q.history);
  return {unique:restored.length,history:histories.length,repeated:restored.filter(q=>q.history.length>1).length,
    languages:Object.fromEntries(languages.map(l=>[l,restored.filter(q=>q.language===l).flatMap(q=>q.history).length])),
    exams:Object.fromEntries(Object.keys(examLabels).map(e=>[e,histories.filter(h=>h.examType===e).length]))};
}
export function questionText(q){return [q.id,q.language,q.title,q.question,q.questionType,...q.concepts,...q.history.map(h=>[examLabels[h.examType],h.year,h.round+"회",h.questionNumber? h.questionNumber+"번":""].join(" "))].join(" ");}
export function shuffle(items,random=Math.random){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
export function dailyQuestions(bank,day){
  const seed=[...day].reduce((a,c)=>((a*31+c.charCodeAt(0))>>>0),0);
  return languages.flatMap(l=>{const items=bank.filter(q=>q.language===l&&q.sourceType==="reconstructed");return items.length?[items[seed%items.length]]:[];});
}
// Pure, deterministic recommendation. Saved daily plans keep the target stable.
export function recommendFive(bank,attempts,day){
 const latest=new Map();for(const a of [...attempts].sort((a,b)=>a.submittedAt-b.submittedAt))latest.set(a.questionId,a);
 const weak=new Set(bank.filter(q=>latest.get(q.id)?.correct===false).flatMap(q=>q.concepts));
 const seed=[...day].reduce((s,c)=>(s*31+c.charCodeAt(0))>>>0,0);
 const tie=q=>[...q.id].reduce((s,c)=>(s*33+c.charCodeAt(0))>>>0,seed);
 const sourceWeight={reconstructed:16,normalized:6,transformed:3,practice:1};
 const rank=q=>(q.concepts.some(c=>weak.has(c))?8:0)+(!latest.has(q.id)?6:0)+(sourceWeight[q.sourceType]||0);
 const ordered=[...bank].sort((a,b)=>rank(b)-rank(a)||(latest.get(a.id)?.submittedAt||0)-(latest.get(b.id)?.submittedAt||0)||tie(a)-tie(b));
 const selected=[],usedConcepts=new Set();
 const concept=q=>q.concepts[0]||q.title;
 const take=predicate=>{
   const fresh=ordered.find(q=>!selected.includes(q)&&predicate(q)&&!usedConcepts.has(concept(q)));
   const q=fresh||ordered.find(q=>!selected.includes(q)&&predicate(q));
   if(q){selected.push(q);usedConcepts.add(concept(q));}
 };
 // Verified reconstructed questions come first. Once exhausted, move to learning/variation items.
 while(selected.length<Math.min(5,bank.length)&&ordered.some(q=>!selected.includes(q)&&q.sourceType==='reconstructed'))take(q=>q.sourceType==='reconstructed');
 while(selected.length<Math.min(5,bank.length))take(q=>q.sourceType==='normalized'||q.sourceType==='transformed'||q.sourceType==='practice');
 return selected;
}
export function matchesExam(q,exam,bank=[]){
 if(exam==='all')return true;
 if(q.sourceType==='reconstructed')return q.history.some(h=>h.examType===exam);
 if(q.examTypes)return q.examTypes.includes(exam);
 const parent=bank.find(p=>p.id===q.originalQuestionId);
 return parent?matchesExam(parent,exam):true;
}
export const localDay = (date=new Date()) => [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");
export function summarizeAttempts(attempts){const judged=attempts.filter(a=>typeof a.correct==="boolean");return {total:attempts.length,correct:judged.filter(a=>a.correct).length,wrong:judged.filter(a=>!a.correct).length,pending:attempts.length-judged.length,rate:judged.length?Math.round(judged.filter(a=>a.correct).length/judged.length*100):null,average:attempts.length?Math.round(attempts.reduce((sum,a)=>sum+a.elapsedSeconds,0)/attempts.length):0};}
// Lightweight lexical coloring only; never execute student code or fetch a CDN.
export function formatCodeForDisplay(code,language){
 const source=String(code??"").replace(/\r\n?/g,"\n");
 if(language==="SQL"){
  const literals=/('(?:''|[^'])*'|"(?:""|[^"])*"|--[^\n]*|\/\*[\s\S]*?\*\/)/g;
  return source.split(literals).map((part,index)=>index%2?part:part.replace(/\s+(INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|CROSS JOIN|JOIN|ON|FROM|WHERE|GROUP BY|HAVING|ORDER BY|UNION ALL|UNION|SET|VALUES)\s+/gi,"\n$1 ")).join("").trim();
 }
 if(language!=="C"&&language!=="Java")return source.split("\n").map(line=>line.replace(/\s+$/,"")).join("\n").trim();

 // Multiline C/Java questions already carry intentional teaching indentation in the dataset.
 // Preserve that authored structure instead of reformatting it and accidentally flattening
 // brace-less control bodies such as nested for/if/while statements.
 const sourceLines=source.split("\n");
 const hasAuthoredIndentation=sourceLines.length>1&&sourceLines.some(line=>/^[ \t]+[^\s]/.test(line));
 if(hasAuthoredIndentation){
  return sourceLines
   .map(line=>line.replace(/\t/g,"    ").replace(/[ \t]+$/,""))
   .join("\n")
   .trim();
 }

 const out=[],braces=[];
 let buffer="",indent=0,parenDepth=0,bracketDepth=0,quote="",escaped=false,lineComment=false,blockComment=false;
 const emit=()=>{
  const text=buffer.trim();
  if(text){
   const prefix=text.startsWith("#")?"":"    ".repeat(Math.max(0,indent));
   out.push(prefix+text);
  }
  buffer="";
 };
 const addSpace=()=>{if(buffer&&!/\s$/.test(buffer))buffer+=" ";};
 const isStructuralBrace=prefix=>{
  const p=prefix.trim();
  if(!p)return true;
  if(/->\s*$/.test(p))return true;
  if(/\b(?:if|for|while|switch|catch|synchronized)\s*\([^{}]*\)\s*$/.test(p))return true;
  if(/^(?:else|try|finally|do|static)\b/.test(p))return true;
  if(/\b(?:class|interface|enum|record|struct|union)\b[^;]*$/.test(p))return true;
  if(/\bnew\b[^;]*\)\s*$/.test(p))return true;
  if(/(?:return|=)\s*\([^;()]*\)\s*$/.test(p))return false;
  if(/\)\s*(?:throws\b[^{}]*)?$/.test(p))return true;
  if(/(?:=|,)\s*[^;{}]*$/.test(p))return false;
  return false;
 };

 for(let i=0;i<source.length;i++){
  const ch=source[i],next=source[i+1];

  if(lineComment){
   buffer+=ch;
   if(ch==="\n"){lineComment=false;emit();}
   continue;
  }
  if(blockComment){
   buffer+=ch;
   if(ch==="*"&&next==="/"){buffer+="/";i++;blockComment=false;}
   if(ch==="\n")emit();
   continue;
  }
  if(quote){
   buffer+=ch;
   if(escaped){escaped=false;continue;}
   if(ch==="\\"){escaped=true;continue;}
   if(ch===quote)quote="";
   continue;
  }
  if(ch==="/"&&next==="/"){addSpace();buffer+="//";i++;lineComment=true;continue;}
  if(ch==="/"&&next==="*"){addSpace();buffer+="/*";i++;blockComment=true;continue;}
  if(ch==='"'||ch==="'"){quote=ch;buffer+=ch;continue;}

  if(ch==="("){parenDepth++;buffer+=ch;continue;}
  if(ch===")"){parenDepth=Math.max(0,parenDepth-1);buffer+=ch;continue;}
  if(ch==="["){bracketDepth++;buffer+=ch;continue;}
  if(ch==="]"){bracketDepth=Math.max(0,bracketDepth-1);buffer+=ch;continue;}

  if(ch==="{"){
   const structural=parenDepth===0&&bracketDepth===0&&isStructuralBrace(buffer);
   braces.push(structural);
   if(structural){
    buffer=buffer.trimEnd();
    if(buffer)buffer+=" ";
    buffer+="{";
    emit();
    indent++;
   }else buffer+="{";
   continue;
  }
  if(ch==="}"){
   const structural=braces.length?braces.pop():true;
   if(structural){
    emit();
    indent=Math.max(0,indent-1);
    buffer="}";
    emit();
   }else buffer+="}";
   continue;
  }

  const inInitializer=braces.some(value=>value===false);
  if(ch===";"&&parenDepth===0&&bracketDepth===0&&!inInitializer){
   buffer+=";";
   // Keep a trailing line comment attached to its statement.
   const tail=source.slice(i+1).match(/^[ \t]*(\/\/[^\n]*)/);
   if(tail){buffer+=" "+tail[1];i+=tail[0].length;}
   emit();
   continue;
  }
  if(ch==="\n"){emit();continue;}
  if(/\s/.test(ch)){addSpace();continue;}
  buffer+=ch;
 }
 emit();

 return out.join("\n")
  .replace(/}\n\s*(else|catch|finally)\b/g,"} $1")
  .replace(/}\n\s*(while\s*\([^\n;]+\);)/g,"} $1")
  .replace(/}\n\s*;/g,"};")
  .replace(/[ \t]+$/gm,"")
  .trim();
}

export function highlightCode(code){
  const token=/(\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:int|void|return|for|if|else|public|static|class|new|def|print|SELECT|FROM|WHERE|GROUP|BY|HAVING|ORDER|DESC|ASC|JOIN|ON|AS|NULL|COUNT|SUM|AVG)\b|\b\d+\b)/gi;
  let result="",last=0;for(const match of code.matchAll(token)){result+=escapeHTML(code.slice(last,match.index));const text=match[0],kind=/^(\/\/|#)/.test(text)?"comment":/^["']/.test(text)?"string":/^\d/.test(text)?"number":"keyword";result+='<span class="code-'+kind+'">'+escapeHTML(text)+'</span>';last=match.index+text.length;}return result+escapeHTML(code.slice(last));
}
