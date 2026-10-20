import {readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {spawnSync} from "node:child_process";
const base=resolve(import.meta.dirname,"..");
function loadArray(file,name){
 const content=readFileSync(join(base,"data",file),"utf8").replace(/^export const /m,"const ");
 return new Function(content+"\nreturn "+name+";")();
}
const samples=loadArray("coding-samples.js","codingProblems");
const a=loadArray("coding-ubuntu-foundations.js","ubuntuFoundationProblems");
const b=loadArray("coding-ubuntu-advanced.js","ubuntuAdvancedProblems");
const legacy=loadArray("coding-ubuntu-legacy-guides.js","ubuntuLegacyGuides");
const ubuntu=[...samples.filter(p=>p.language==="linux").map(p=>({...p,...legacy[p.id]})),...a,...b];
const errors=[];
if(a.length!==24||b.length!==24||ubuntu.length!==50)errors.push("expected 24+24+2 Ubuntu exercises");
const ids=ubuntu.map(p=>p.id);
if(new Set(ids).size!==50)errors.push("duplicate exercise id");
for(let n=1;n<=50;n++)if(!ids.includes("LINUX-"+String(n).padStart(3,"0")))errors.push("missing LINUX-"+n);
for(const p of ubuntu){
 for(const field of ["id","title","topic","level","statement","input","output","code","initialState","afterState","verification","verificationDetail","commonMistake","warning"]){
 if(typeof p[field]!=="string"||!p[field].trim())errors.push(p.id+" missing "+field);
 }
 if(!Array.isArray(p.commandParts)||!p.commandParts.length||p.commandParts.some(x=>!x.token||!x.meaning))errors.push(p.id+" missing option explanation");
 if(/(?:^|\n)\s*(?:sudo\b|rm\s+-rf\b|mkfs\b|dd\s+if=|curl.+\|\s*(?:ba)?sh\b)/.test(p.code))errors.push(p.id+" unsafe shell expression");
 if(/(?:^|\n)\s*#/.test(p.code))errors.push(p.id+" contains inline instructional comments");
 const syntax=spawnSync("bash",["-n"],{input:p.code,encoding:"utf8",timeout:3000});
 if(syntax.status!==0)errors.push(p.id+" bash syntax failure: "+syntax.stderr?.slice(0,150));
}
const html=readFileSync(join(base,"coding.html"),"utf8");
const js=readFileSync(join(base,"js","coding.js"),"utf8");
if(!html.includes("350문제")||!js.includes("ubuntuAdvancedProblems"))errors.push("UI not linked to Ubuntu");
const idsInHtml=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
const seen=new Set();for(const id of idsInHtml){if(seen.has(id))errors.push("duplicate DOM id "+id);seen.add(id);}
for(const id of ["coding-ubuntu-guide","coding-ubuntu-parts","coding-ubuntu-before","coding-ubuntu-after","coding-ubuntu-verify","coding-ubuntu-mistake","coding-ubuntu-warning","coding-trace-button"])if(!seen.has(id))errors.push("missing UI id "+id);
const syntax=spawnSync("node",["--check",join(base,"js","coding.js")],{encoding:"utf8"});
if(syntax.status!==0)errors.push("coding.js syntax: "+syntax.stderr);
const dataByID=Object.fromEntries(ubuntu.map(x=>[x.id,x]));
const smoke=[
{n:11,setup:"",check:"test -f note.txt"},
{n:12,setup:"",check:"test -d reports"},
{n:13,setup:"",check:"test -d project/docs"},
{n:14,setup:"printf 'hi\n' > note.txt",check:"cmp note.txt note-copy.txt"},
{n:15,setup:"printf 'draft\n' > draft.txt",check:"test -f final.txt && test ! -f draft.txt"},
{n:17,setup:"mkdir -p reports && touch reports/a.txt",check:"test -f reports-backup/a.txt"},
{n:19,setup:"mkdir empty",check:"test ! -d empty"},
{n:20,setup:"touch scratch.tmp",check:"test ! -e scratch.tmp"},
{n:21,setup:"mkdir -p docs && touch docs/readme.md",check:"test \"$(readlink readme-link)\" = docs/readme.md"},
{n:27,setup:"printf 'ok\nERROR one\nok\nok\nERROR two\n' > app.log",check:"test \"$(grep -n 'ERROR' app.log | wc -l)\" -eq 2"},
{n:29,setup:"mkdir -p src tests && touch src/main.py tests/test.py",check:"test \"$(find . -type f -name '*.py' | wc -l)\" -eq 2"},
{n:30,setup:"mkdir -p src && printf 'TODO fix\n' > src/app.py",check:"grep -q 'TODO' src/app.py"},
{n:31,setup:"printf 'Mina\nAnna\nJohn\n' > names.txt",check:"test \"$(LC_ALL=C sort names.txt | head -n 1)\" = Anna"},
{n:47,setup:"",check:"test \"$(cat greeting.txt)\" = hello"},
{n:48,setup:"printf 'hello\n' > greeting.txt",check:"test \"$(cat greeting.txt)\" = \"$(printf 'hello\nworld')\""},
{n:49,setup:"printf 'ERROR first\nINFO\nERROR second\n' > app.log",check:"test \"$(grep 'ERROR' app.log | wc -l)\" -eq 2"},
{n:50,setup:"printf 'Mina\nAnna\nMina\n' > names.txt",check:"test \"$(LC_ALL=C sort names.txt | uniq | tr '\n' ' ')\" = 'Anna Mina '"}
];
let tested=0;
for(const spec of smoke){
 const p=dataByID["LINUX-"+String(spec.n).padStart(3,"0")];
 if(!p){errors.push("missing smoke task "+spec.n);continue;}
 const dir=mkdtempSync(join(tmpdir(),"ubuntu-qa-"));
 try {
 const result=spawnSync("bash",["-euo","pipefail","-c",[spec.setup,p.code,spec.check].filter(Boolean).join("\n")],{cwd:dir,encoding:"utf8",timeout:7000});
 if(result.status!==0)errors.push(p.id+" smoke failure: "+result.stderr?.slice(0,250)); else tested++;
 }finally{rmSync(dir,{recursive:true,force:true});}
}
console.log("Ubuntu content:",ubuntu.length,"of 50; Bash syntax checked:",ubuntu.length,"; execution smoke tests:",tested,"/",smoke.length,"; errors:",errors.length);
for(const error of errors)console.error("FAIL: "+error);
if(errors.length)process.exitCode=1;
