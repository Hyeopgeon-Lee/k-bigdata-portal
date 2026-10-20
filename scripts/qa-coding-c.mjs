import {mkdtempSync,readFileSync,writeFileSync,cpSync,rmSync,mkdirSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {spawnSync} from "node:child_process";

const repo=resolve(import.meta.dirname,"..");
const dir=mkdtempSync(join(tmpdir(),"c-coding-qa-"));
const mods=["coding-c-blueprint.js","coding-c-utils.js","coding-c-foundations.js","coding-c-advanced.js"];
for(const mod of mods) cpSync(join(repo,"data",mod),join(dir,mod));
writeFileSync(join(dir,"package.json"),'{"type":"module"}');
let failures=[];
let compileCount=0,runCount=0;
const extra={
4:[["0\n","0"],["100\n","100"]],
5:[["0\n","0.00"],["99.999\n","100.00"]],
9:[["A\n","Hello, A!"]],
11:[["-6\n","36"],["1000\n","1000000"]],
13:[["3 5\n","0 3"],["10 1\n","10 0"]],
16:[["-40\n","-40.0"]],
17:[["0\n","0 0 0"],["60\n","0 1 0"],["3600\n","1 0 0"]],
18:[["7 7\n","7 7"],["-1 3\n","3 -1"]],
20:[["-2\n","-2"],["0\n","2"]],
21:[["0\n","ZERO"],["3\n","POSITIVE"]],
23:[["-5 -2 -3\n","-2"]],
25:[["90\n","A"],["60\n","D"],["59\n","F"]],
26:[["1900\n","COMMON"],["2024\n","LEAP"],["2100\n","COMMON"]],
29:[["2 2\n","="],["3 2\n",">"]],
30:[["4 7 2\n","3"],["3 7 2\n","14"]],
31:[["0\n","OUT"],["1\n","IN"],["101\n","OUT"]],
32:[["a\n","OTHER"]],
34:[["1900 2\n","28"],["2024 4\n","30"],["2023 12\n","31"]],
35:[["10000\n","9500"],["50000\n","45000"],["9999\n","9999"]],
40:[["1\n","1"],["2\n","1"]],
41:[["1\n","1"],["100\n","5050"]],
42:[["0\n","1"],["12\n","479001600"]],
43:[["0 0\n","1"],["-2 3\n","-8"]],
44:[["9\n",Array.from({length:9},(_,i)=>'9*'+(i+1)+'='+(9*(i+1))).join('\n')]],
49:[["0\n","1"],["1000\n","4"]],
50:[["0\n","0"],["100\n","1"]],
51:[["0\n","0"],["1000\n","1"]],
52:[["2\n","PRIME"],["4\n","COMPOSITE"],["9\n","COMPOSITE"]],
53:[["1\n","1"],["9\n","3"]],
54:[["3 5\n","1"],["10 10\n","10"]],
55:[["4 6\n","12"],["7 7\n","7"]],
58:[["-10 -5 -12 -3 -9\n","-3 -12"]],
59:[["0 -2 -3 8 9\n","3"]],
61:[["1 2 3 4 5\n9\n","-1"],["1 2 3 4 5\n1\n","0"]],
62:[["1 2 3 4 5\n9 8\n","1 2 3 4 5"]],
64:[["5 4 3 2 1\n","1 2 3 4 5"],["2 2 2 2 2\n","2 2 2 2 2"]],
68:[["a\n","OTHER"],["0\n","DIGIT"]],
69:[["abcdefghijklmnopqrst\n","abcdefghijklmnopqrst"]],
70:[["a\n","1"]],
72:[["AEIOU\n","5"],["bcdfg\n","0"]],
73:[["abc z\n","0"]],
74:[["cat Cat\n","DIFF"]],
75:[["same same\n","EQUAL"],["z a\n","SECOND"]],
76:[["abc z\n","-1"],["abc a\n","0"]],
77:[["\n","0"],["a b c \n","3"]],
79:[["abba\n","YES"],["abca\n","NO"]],
80:[["a b\n","ab"]],
83:[["0\n","1"],["-3\n","0"]],
85:[["0\n","1"]],
88:[["-9 -8 -7 -6 -5\n","-5"]],
89:[["3 3\n","3 3"]],
91:[["0\n","0"]],
92:[["-5\n","0"]],
94:[["-17 5\n","-3 -2"]],
98:[["1 80 2 90 3 90\n","2"],["1 90 2 90 3 90\n","1"]],
99:[["1 0 2 0 3 0\n","0.0"]],
100:[["1 50 2 50 3 70\n","3 1 2"],["1 80 2 80 3 80\n","1 2 3"]]
};
try{
const [foundation,advanced] = await Promise.all([
 import(pathToFileURL(join(dir,"coding-c-foundations.js")).href),
 import(pathToFileURL(join(dir,"coding-c-advanced.js")).href)
]);
const problems=[...foundation.cFoundationProblems,...advanced.cAdvancedProblems];
const ids=new Set(problems.map(p=>p.id));
if(problems.length!==98||ids.size!==98)failures.push("Expected 98 unique problems; found "+problems.length);
for(const p of problems){
  const number=Number(p.id.slice(2));
  if(number===1||number===24)failures.push("Existing problem overwritten: "+p.id);
  if(!p.code.includes("//"))failures.push(p.id+" missing annotated code");
  if(!p.trace?.length||!p.statement||!p.output)failures.push(p.id+" incomplete content");
  const path=join(dir,p.id+".c"),exe=join(dir,p.id);
  writeFileSync(path,p.code);
  const cc=spawnSync("gcc",["-std=c17","-Wall","-Wextra","-Wpedantic","-Werror",path,"-o",exe],{encoding:"utf8",timeout:15000});
  if(cc.status!==0){failures.push(p.id+" compilation failed: "+(cc.stderr||cc.error).slice(0,800));continue;}
  compileCount++;
  const cases=[[p.input==="입력 없음"?"":p.input,p.output],...(extra[number]||[])];
  for(const [input,expected] of cases){
    const run=spawnSync(exe,[],{input,encoding:"utf8",timeout:15000});
    runCount++;
    const normalize=s=>String(s??"").replace(/\r\n/g,"\n").replace(/\n$/,"");
    if(run.status!==0||normalize(run.stdout)!==normalize(expected)){
      failures.push(p.id+" wrong output for "+JSON.stringify(input)+": expected="+JSON.stringify(expected)+" actual="+JSON.stringify(run.stdout)+" status="+run.status);
    }
  }
}
console.log("C17 validated programs:",compileCount+"/98; executed cases:",runCount,"; failures:",failures.length);
if(failures.length){for(const msg of failures)console.error("FAIL:",msg);process.exitCode=1;}
}finally{rmSync(dir,{recursive:true,force:true});}
