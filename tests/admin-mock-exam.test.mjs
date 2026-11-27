import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createPrintableExam,loadPrintableExam,examConfig,validPrintQuestion,numberQuestions} from "../admin/js/mock-exam-model.mjs";
import {buildPdf,A4} from "../admin/js/mock-exam-pdf.mjs";
const repo=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
for(const type of ["engineer","industrial"]){
 const config=examConfig(type);
 const bank=config.subjects.flatMap((subject,s)=>Array.from({length:25},(_,i)=>({
  id:type+"-"+s+"-"+i,examType:type,subject,question:subject+" 시험 문항 "+i,code:i%2?"a = "+i:"",
  options:["가","나","다","라"],answer:i%4+1,sourceVerified:true,answerVerified:true
 })));
 const calls=[];
 const indexed=bank.map(({code,...q})=>q);
 const full=await loadPrintableExam(indexed,type,async ids=>{calls.push(ids);return bank.filter(q=>ids.includes(q.id));},{variants:true,rng:()=>.47});
 assert.equal(full.config.total,config.total);
 assert.deepEqual(full.registeredCounts.map(q=>q.available),config.subjects.map(()=>25));
 assert.equal(calls.length,1);assert.equal(calls[0].length,config.subjects.length*24);
 const duplicate={...bank[0],id:"duplicate"},bad={...bank[1],id:"bad",answer:5};
 assert.equal(validPrintQuestion(bad,type),false);assert.equal(validPrintQuestion({...bad,answer:1,answerVerified:false},type),false);
 const exam=createPrintableExam([...bank,duplicate,bad],type,{variants:true,rng:()=>.47});
 assert.deepEqual(exam.counts.map(x=>x.available),config.subjects.map(()=>25));
 for(const form of ["A","B"]){
  const items=numberQuestions(exam.forms[form]).flatMap(s=>s.questions);
  assert.equal(items.length,config.total);
  assert.equal(new Set(items.map(({q})=>q.id)).size,config.total);
  assert.deepEqual(items.map(x=>x.number),Array.from({length:config.total},(_,i)=>i+1));
  assert.ok(items.every(({q})=>q.answer>=1&&q.answer<=4));
  assert.ok(exam.forms[form].every(s=>s.questions.length===20));
 }
 for(let i=0;i<config.subjects.length;i++){
  const a=exam.forms.A[i].questions.map(q=>q.id),b=exam.forms.B[i].questions.map(q=>q.id);
  assert.notDeepEqual(a,b);assert.deepEqual(a.slice().sort(),b.slice().sort());
 }
 assert.throws(()=>createPrintableExam(bank.slice(0,19),type),/문항이 부족/);
}
const blob=buildPdf([{blob:new Blob([new Uint8Array([255,216,255,217])]),width:1,height:1}]);
const bytes=new Uint8Array(await blob.arrayBuffer()),pdf=new TextDecoder().decode(bytes);
assert.equal(blob.type,"application/pdf");assert.match(pdf,/%PDF-1\.4/);assert.ok(pdf.includes("/MediaBox [0 0 "+A4.width+" "+A4.height+"]"));assert.match(pdf,/\/Count 1/);
let xref=Number(/startxref\n(\d+)/.exec(pdf)[1]);assert.equal(new TextDecoder().decode(bytes.slice(xref,xref+4)),"xref");
const page=repo("admin/mock-exam.html");
assert.match(page,/id="admin-secure" hidden/);assert.match(page,/data-admin-module="mock-exam.js"/);assert.match(page,/js\/guard\.mjs/);
for(const name of ["index","accounts","learning","certifications","rooms","help","alumni"])assert.match(repo("admin/"+name+".html"),/href="mock-exam.html"/);
assert.match(repo("admin/js/mock-exam.js"),/portal_super_admin_allowed/);assert.match(repo("admin/js/mock-exam.js"),/await import\("\.\/mock-exam-pdf/);assert.doesNotMatch(repo("admin/js/mock-exam.js"),/\.insert\(|\.upsert\(|\.update\(/);
console.log("PASS: 100/60 questions, per-subject quotas, duplicates, variants, answer mapping, PDF A4/xref, admin isolation and menus");
