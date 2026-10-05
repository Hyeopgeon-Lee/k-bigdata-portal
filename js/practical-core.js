// Pure learning rules. No browser storage, network, or code execution here.
export const HINT_SECONDS = 60;
export const REVEAL_SECONDS = 120;
// Backward-compatible alias: the first learning milestone is the 60-second hint.
export const WAIT_SECONDS = HINT_SECONDS;
export const sourceLabels = {reconstructed:"비공식 복원기출",normalized:"공개 복원자료 기반 정규화",transformed:"기출 기반 변형",practice:"추가 연습문제"};
export const examLabels = {engineer:"정보처리기사",industrial_engineer:"정보처리산업기사"};
export const typeLabels = {output:"실행결과",blank:"빈칸채우기",interpret:"코드해석",sql_result:"SQL 결과",sql_write:"SQL 작성",error:"오류 찾기",other:"기타"};
export const languages = ["C","Java","Python","SQL"];
export const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const elapsedSeconds = (startedAt,now=Date.now()) => Math.max(0,Math.floor((now-startedAt)/1000));
export const remainingSeconds = (startedAt, now=Date.now()) => Math.max(0,Math.ceil((HINT_SECONDS*1000-(now-startedAt))/1000));
export const remainingRevealSeconds = (startedAt, now=Date.now()) => Math.max(0,Math.ceil((REVEAL_SECONDS*1000-(now-startedAt))/1000));
export const hintAvailable = (attempt,now=Date.now()) => !!attempt && !attempt.submittedAt && !attempt.viewedExplanation && Number.isFinite(attempt.startedAt) && now-attempt.startedAt>=HINT_SECONDS*1000;
export const shouldAutoReveal = (attempt,now=Date.now()) => !!attempt && !attempt.submittedAt && !attempt.viewedExplanation && Number.isFinite(attempt.startedAt) && now-attempt.startedAt>=REVEAL_SECONDS*1000;
export const canSubmit = (attempt, answer, now=Date.now()) => !!attempt && !attempt.submittedAt && !attempt.viewedExplanation && Number.isFinite(attempt.startedAt) && now>=attempt.startedAt && now-attempt.startedAt<REVEAL_SECONDS*1000 && !!String(answer||"").trim();
export const canReveal = (attempt,now=Date.now()) => !!attempt && Number.isFinite(attempt.startedAt) && (!!attempt.submittedAt || now-attempt.startedAt>=REVEAL_SECONDS*1000);
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
export function highlightCode(code){
  const token=/(\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:int|void|return|for|if|else|public|static|class|new|def|print|SELECT|FROM|WHERE|GROUP|BY|HAVING|ORDER|DESC|ASC|JOIN|ON|AS|NULL|COUNT|SUM|AVG)\b|\b\d+\b)/gi;
  let result="",last=0;for(const match of code.matchAll(token)){result+=escapeHTML(code.slice(last,match.index));const text=match[0],kind=/^(\/\/|#)/.test(text)?"comment":/^["']/.test(text)?"string":/^\d/.test(text)?"number":"keyword";result+='<span class="code-'+kind+'">'+escapeHTML(text)+'</span>';last=match.index+text.length;}return result+escapeHTML(code.slice(last));
}
