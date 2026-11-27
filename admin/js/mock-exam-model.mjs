import {normalizeSubject,writtenConfig} from "../../js/written-dashboard.mjs?v=20261127-written-parity-v3";

export const examLabels={engineer:"정보처리기사",industrial:"정보처리산업기사"};
export function examConfig(type){
 if(!Object.hasOwn(examLabels,type))throw Error("시험 종류를 확인하세요.");
 return {...writtenConfig(type),label:examLabels[type]};
}
const clean=v=>String(v??"").normalize("NFKC").replace(/\s+/g," ").trim();
const picture=v=>v&&typeof v==="object"&&/^data:image\/(?:gif|png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(v.dataUri||"");
export function validPrintQuestion(q,type){
 return !!q&&typeof q.id==="string"&&q.id.length>0&&(!q.examType||q.examType===type)&&
 q.sourceVerified===true&&q.answerVerified===true&&typeof q.question==="string"&&!!q.question.trim()&&
 Array.isArray(q.options)&&q.options.length===4&&q.options.every(v=>typeof v==="string"&&!!v.trim())&&
 Number.isInteger(q.answer)&&q.answer>=1&&q.answer<=4&&
 (!q.visuals||(Array.isArray(q.visuals)&&q.visuals.every(picture)))&&
 (!q.optionVisuals||(Array.isArray(q.optionVisuals)&&q.optionVisuals.length===4&&q.optionVisuals.every(picture)));
}
function fingerprint(q){
 return JSON.stringify([clean(q.question),clean(q.code),q.options.map(clean).sort(),(q.visuals||[]).map(v=>v.sha256||v.dataUri),(q.optionVisuals||[]).map(v=>v.sha256||v.dataUri).sort()]);
}
export function shuffled(values,rng=Math.random){
 const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
}
function reorder(items,rng){const result=shuffled(items,rng);if(result.every((q,i)=>q.id===items[i].id)&&result.length>1)result.push(result.shift());return result;}
export function createPrintableExam(bank,type,{variants=false,rng=Math.random,id=""}={}){
 const config=examConfig(type),seenIds=new Set(),seenContent=new Set(),groups=new Map(config.subjects.map(s=>[s,[]]));
 // Shuffle the full bank first so identical copies from different years cannot bias selection.
 for(const q of shuffled(bank,rng)){
  if(!validPrintQuestion(q,type))continue;
  const subject=normalizeSubject(q.subject);if(!groups.has(subject)||seenIds.has(q.id))continue;
  const key=fingerprint(q);if(seenContent.has(key))continue;
  seenIds.add(q.id);seenContent.add(key);groups.get(subject).push(q);
 }
 const counts=config.subjects.map(subject=>({subject,available:groups.get(subject).length}));
 const insufficient=counts.filter(x=>x.available<20);
 if(insufficient.length){const error=Error("출제 가능한 문항이 부족합니다: "+insufficient.map(x=>x.subject+" "+x.available+"/20").join(", "));error.code="INSUFFICIENT_QUESTIONS";throw error;}
 const sections=config.subjects.map(subject=>({subject,questions:shuffled(groups.get(subject),rng).slice(0,20)}));
 const forms={A:sections};
 if(variants)forms.B=sections.map(s=>({subject:s.subject,questions:reorder(s.questions,rng)}));
 return {type,config,id,counts,forms};
}
export function numberQuestions(sections){
 let n=0;return sections.map(s=>({...s,questions:s.questions.map(q=>({q,number:++n}))}));
}

// The compact portal index covers every registered year/round. Fetch only
// a shuffled candidate window per subject; pull more if duplicate or bad
// details reduce a subject below its quota. No student sessions are created.
export async function loadPrintableExam(index,type,fetchDetails,options={}){
 const config=examConfig(type),rng=options.rng||Math.random,groups=new Map(config.subjects.map(s=>[s,[]])),seen=new Set();
 for(const q of index){
  if(!validPrintQuestion(q,type)||seen.has(q.id))continue;
  const subject=normalizeSubject(q.subject);if(!groups.has(subject))continue;
  seen.add(q.id);groups.get(subject).push(q.id);
 }
 for(const subject of config.subjects)groups.set(subject,shuffled(groups.get(subject),rng));
 const registeredCounts=config.subjects.map(subject=>({subject,available:groups.get(subject).length}));
 const insufficient=registeredCounts.filter(x=>x.available<20);
 if(insufficient.length)throw Error("출제 가능한 문항이 부족합니다: "+insufficient.map(x=>x.subject+" "+x.available+"/20").join(", "));
 const full=[];let offset=0;
 while(true){
  const size=offset===0?24:12;
  const ids=config.subjects.flatMap(s=>groups.get(s).slice(offset,offset+size));
  if(!ids.length)throw Error("중복 및 불완전한 문항을 제외한 출제 가능 문항이 부족합니다.");
  const fetched=await fetchDetails(ids);
  const expected=new Set(ids),returned=new Set(fetched.map(q=>q.id));
  if(fetched.length!==ids.length||returned.size!==ids.length||fetched.some(q=>!expected.has(q.id)))throw Error("문제 상세 데이터가 누락되었거나 변경되었습니다. 다시 생성해 주세요.");
  full.push(...fetched);
  try{const exam=createPrintableExam(full,type,options);return {...exam,registeredCounts};}
  catch(error){if(error.code!=="INSUFFICIENT_QUESTIONS")throw error;}
  offset+=size;
 }
}
