// Verify the 50 live Ubuntu problems against the operations taught in the attached PPTs.
// Only non-destructive examples are executed; interactive Vim and system administration are syntax-checked.
import {readFileSync,mkdtempSync,rmSync,writeFileSync,mkdirSync} from "node:fs";
import {join,resolve} from "node:path";
import {tmpdir} from "node:os";
import {spawnSync} from "node:child_process";

const root=resolve(import.meta.dirname,"..");
const raw=readFileSync(join(root,"data","coding-ubuntu-ppt.js"),"utf8");
const start=raw.indexOf(" = [");
if(start<0)throw Error("PPT source array missing");
const end=raw.lastIndexOf("];");
if(end<0)throw Error("PPT source end missing");
const problems=JSON.parse(raw.slice(start+3,end+1));
const errors=[];
const assert=(ok,message)=>{if(!ok)errors.push(message)};
assert(problems.length===50,"Problem count must equal 50");
const observed={};
const allowed=new Set("mkdir vim ls chmod pwd cd rmdir cat cp mv tail grep find which ln umask echo printf alias ll date ps pgrep df du shutdown apt-cache tar gzip zcat who groups crontab useradd".split(" "));
for(let n=1;n<=50;n++){
 const p=problems[n-1], id="LINUX-"+String(n).padStart(3,"0");
 if(!p){errors.push("missing "+id);continue;}
 assert(p.id===id,"wrong ID/order "+id);
 assert(p.language==="linux",id+" not linux");
 observed[p.level]=(observed[p.level]||0)+1;
 for(const k of ["topic","title","level","statement","input","output","code","hint","explanation","initialState","afterState","verification","verificationDetail","commonMistake","pptSource"]){
  assert(typeof p[k]==="string"&&p[k].trim().length>0,id+" empty "+k);
 }
 assert(Array.isArray(p.commandParts)&&p.commandParts.length>0,id+" missing command explanation");
 assert(/^(\d+장|.*\d+장)/.test(p.pptSource),id+" missing cited chapter");
 assert(!/개인 실습 디렉터리|실습 안전 안내|touch로\s*편집|nano\s|gedit\s/.test([p.statement,p.input,p.output,p.code,p.explanation].join("\n")),id+" contains disallowed directions/editor");
 assert(!/(?:^|\n)\s*(?:rm\s+-rf|mkfs|dd\s+if=|sudo\s+shutdown)/.test(p.code),id+" risky code");
 for(const line of p.code.split("\n")){
  for(const seg of line.split(/\s*;\s*|\s+\|\s+/)){
   const name=seg.trim().split(/\s+/)[0];
   if(name)assert(allowed.has(name),id+" unapproved shell head "+name);
  }
 }
 const syntax=spawnSync("bash",["-n"],{input:p.code,encoding:"utf8",timeout:3000});
 assert(syntax.status===0,id+" shell syntax: "+syntax.stderr?.slice(0,100));
}
assert(observed["입문"]===15,"expected 15 introductory tasks");
assert(observed["기초 응용"]===25,"expected 25 intermediate tasks");
assert(observed["종합 활용"]===10,"expected 10 comprehensive tasks");

const html=readFileSync(join(root,"coding.html"),"utf8");
const client=readFileSync(join(root,"js","coding.js"),"utf8");
assert(client.includes("ubuntuPptProblems")&&!client.includes("ubuntuLegacyGuides"),"client is not using PPT data exclusively");
assert(client.includes('sampleProblems.filter(p=>p.language!=="linux")'),"legacy first two problems not filtered");
assert(html.includes("js/coding.js?v=20261111-ppt-50-v1"),"HTML module cache not refreshed");
for(const el of ["coding-ubuntu-guide","coding-ubuntu-parts","coding-ubuntu-before","coding-ubuntu-after","coding-ubuntu-verify","coding-ubuntu-mistake"]){
 assert(html.includes('id="'+el+'"'),"missing guide element: "+el);
}
// Each smoke fixture uses a disposable workspace and is safe to run locally.
const smoke=[
 [3,"",null],
 [4,"mkdir docs; : > a.txt","test \"$(ls | tr '\n' ' ')\" = 'a.txt docs '"],
 [5,": > .profile; : > note.txt","ls -a | grep -q .profile"],
 [6,"mkdir docs; : > note.txt","ls -F | grep -q 'docs/'"],
 [7,": > note.txt","ls -l note.txt | grep -q note.txt"],
 [10,"","test -d reports"],
 [12,"mkdir empty","test ! -d empty"],
 [13,"","test -f /etc/hosts"],
 [14,"printf 'hello\n' > note.txt","cmp note.txt backup.txt"],
 [15,"printf 'draft\n' > draft.txt","test -f final.txt && test ! -f draft.txt"],
 [16,"mkdir docs","ls -ld docs | grep -q '^d'"],
 [18,"printf 'INFO\nERROR first\nINFO\nINFO\nERROR second\n' > app.log","test \"$(grep -n 'ERROR' app.log | wc -l)\" -eq 2"],
 [20,"","which mv"],
 [21,"printf 'data\n' > data.txt","test \"$(readlink data-link)\" = data.txt"],
 [22,"printf 'data\n' > data.txt","test \"$(ls -i data.txt | awk '{print $1}')\" = \"$(ls -i data-hard | awk '{print $1}')\""],
 [26,"printf a > note.txt; chmod 664 note.txt","test \"$(stat -c %a note.txt)\" = 464"],
 [27,"printf a > note.txt; chmod 640 note.txt","test \"$(stat -c %a note.txt)\" = 670"],
 [28,"","umask -S"],
 [29,"","test \"$(echo -n Hello)\" = Hello"],
 [30,"","test \"$(printf '%d\n' 12)\" = 12"],
 [31,"","test \"$(echo '$SHELL')\" = '$SHELL'"],
 [32,"","test \"$(cat result.txt)\" = hello"],
 [33,"echo hello > result.txt","test \"$(cat result.txt | wc -l)\" -eq 2"],
 [35,"","pwd"],
 [36,"","ps -f"],
 [37,"","ps -ef"],
 [39,"","ps aux"],
 [40,"","df -h"],
 [41,"mkdir docs","du -sh docs"],
 [44,"","apt-cache showpkg vim"],
 [45,"mkdir docs; printf hi > docs/note.txt","test -f backup.tar"],
 [46,"mkdir docs; printf hi > docs/note.txt; tar cvf backup.tar docs >/dev/null; rm -r docs","test -f docs/note.txt"],
 [47,"printf 'hello\n' > report.txt","test \"$(zcat report.txt.gz)\" = hello"],
 [48,"","groups"],
 [50,"","useradd -D"]
];
let completed=0, skipped=0;
for(const [n,setup,check] of smoke){
 const p=problems[n-1];
 const dir=mkdtempSync(join(tmpdir(),"kbigdata-ppt-"));
 try{
  const script=[setup,p.code,check].filter(Boolean).join("\n");
  const run=spawnSync("bash",["-e","-c",script],{cwd:dir,encoding:"utf8",timeout:7000});
  if(run.status!==0){
   if(n===44 && /Unable to locate package|not found/.test(run.stderr||""))skipped++;
   else errors.push(p.id+" smoke failed: "+run.stderr?.slice(0,180));
  }else completed++;
 }finally{rmSync(dir,{recursive:true,force:true});}
}
console.log(JSON.stringify({problemCount:problems.length,difficulty:observed,structuralChecks:50,smokePassed:completed,smokeSkipped:skipped,smokePlanned:smoke.length,errors:errors.length},null,2));
for(const e of errors)console.error("FAIL:",e);
if(errors.length)process.exitCode=1;
