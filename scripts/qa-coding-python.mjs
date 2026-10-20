import {mkdtempSync,cpSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {spawnSync} from "node:child_process";
const repo=resolve(import.meta.dirname,"..");
const dir=mkdtempSync(join(tmpdir(),"python-coding-qa-"));
for(const name of ["coding-python-blueprint.js","coding-python-utils.js","coding-python-foundations.js","coding-python-advanced.js"])
  cpSync(join(repo,"data",name),join(dir,name));
writeFileSync(join(dir,"package.json"),'{"type":"module"}');
const more={
4:[["0\n","0"],["100\n","100"]],
5:[["0\n","0.00"],["99.25\n","99.25"]],
6:[["-1 0\n","-1\n0"]],
8:[["-1 -2 -3\n","-6"],["0 0 0\n","0"]],
11:[["-6\n","36"],["0\n","0"]],
13:[["3 5\n","0 3"],["10 1\n","10 0"]],
15:[["0 4\n","0.0"]],
16:[["-40\n","-40.0"]],
17:[["0\n","0 0 0"],["60\n","0 1 0"],["3600\n","1 0 0"]],
18:[["7 7\n","7 7"]],
20:[["-2\n","-2"],["0\n","2"]],
21:[["0\n","ZERO"],["3\n","POSITIVE"]],
22:[["5 3\n","5"]],
23:[["-5 -2 -3\n","-2"]],
25:[["90\n","A"],["60\n","D"],["59\n","F"]],
26:[["1900\n","COMMON"],["2024\n","LEAP"],["2100\n","COMMON"]],
29:[["2 2\n","="],["3 2\n",">"]],
30:[["4 7 2\n","3"],["3 7 2\n","14"]],
31:[["0\n","OUT"],["1\n","IN"],["101\n","OUT"]],
32:[["a\n","OTHER"]],
34:[["1900 2\n","28"],["2024 4\n","30"],["2023 12\n","31"]],
35:[["10000\n","9500"],["50000\n","45000"],["9999\n","9999"]],
36:[["1\n","1"],["20\n","1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20"]],
37:[["1\n","1"]],
38:[["2\n","2"]],
39:[["3\n","3"]],
40:[["1\n","1"],["2\n","1"]],
42:[["0\n","1"],["12\n","479001600"]],
43:[["0 0\n","1"],["-2 3\n","-8"]],
44:[["9\n",Array.from({length:9},(_,i)=>'9*'+(i+1)+'='+(9*(i+1))).join('\n')]],
46:[["1 1\n","*"]],
47:[["1\n","*"]],
48:[["1\n","*"]],
49:[["0\n","1"],["1000\n","4"]],
50:[["0\n","0"],["100\n","1"]],
51:[["0\n","0"],["1000\n","1"]],
52:[["2\n","PRIME"],["4\n","COMPOSITE"],["9\n","COMPOSITE"]],
53:[["1\n","1"],["9\n","3"]],
54:[["3 5\n","1"],["10 10\n","10"]],
55:[["4 6\n","12"],["7 7\n","7"]],
56:[["-1 -2 -3 -4 -5\n","-15"]],
57:[["1 1 1 2 3\n","1.6"]],
58:[["-10 -5 -12 -3 -9\n","-3 -12"]],
59:[["0 -2 -3 8 9\n","3"]],
60:[["5 4 3 2 1\n","1 2 3 4 5"]],
61:[["1 2 3 4 5\n9\n","-1"],["1 2 3 4 5\n1\n","0"]],
62:[["1 2 3 4 5\n9 8\n","1 2 3 4 5"]],
64:[["5 4 3 2 1\n","1 2 3 4 5"],["2 2 2 2 2\n","2 2 2 2 2"]],
66:[["Z\n","90"],["0\n","48"]],
67:[["a\n","A"],["z\n","Z"]],
68:[["a\n","OTHER"],["0\n","DIGIT"]],
70:[["a\n","1"]],
73:[["-1 -2 -3\n0 2\n","-1 -2 -3 0 2"]],
74:[["2 2 2 2 2\n","2 2 2 2 2"]],
75:[["9 0 1\n","9 99"]],
76:[["7 8 9\n","7 9"]],
77:[["2 2\n","0"]],
79:[["1 3 5 7 9\n","EMPTY"]],
80:[["0 1 2 3 4\n","4 3 2 1 0"]],
81:[["Kim 90 Lee 80 Park 70\nNone\n","-1"]],
82:[["bbb\n","b:3"]],
83:[["Kim 80 Lee 70\nLee 0\n","0"]],
84:[["Kim 80 Lee 90 Park 90\n","Lee"]],
85:[["z 1 y 2 x 3\n","x y z"]],
86:[["1 1 1 1 1\n","1"]],
87:[["1 2 3 4\n5 6 7 8\n","EMPTY"]],
88:[["2 2 2 2\n3 3 3 3\n","2 3"]],
89:[["1 2 3 4\n1 2 3 4\n","EMPTY"]],
90:[["abc\n","a"],["bbaa\n","a"]],
91:[["-5\n","25"]],
92:[["9 3\n","9"]],
93:[["7\n","ODD"]],
94:[["1\n","1"],["100\n","5050"]],
95:[["0\n","1"],["12\n","479001600"]],
96:[["3 5\n","1"]],
97:[["-1 -2 -3 -4 -5\n","-15"]],
98:[["0 0 0\n","0 99"]],
99:[["4 2 1\n","6"],["4 2 2\n","2"]],
100:[["0 0 0 0 0\n","0.0 0"],["100 100 100 100 100\n","100.0 100"]]
};
let count=0,cases=0,errors=[];
try {
 const [{pythonFoundationProblems},{pythonAdvancedProblems}] = await Promise.all([
  import(pathToFileURL(join(dir,"coding-python-foundations.js")).href),
  import(pathToFileURL(join(dir,"coding-python-advanced.js")).href)]);
 const all=[...pythonFoundationProblems,...pythonAdvancedProblems];
 const names=new Set(all.map(x=>x.id));
 if(all.length!==98||names.size!==98)errors.push("Problem count/IDs expected 98 distinct");
 for(const p of all){
  const n=Number(p.id.split("-")[1]);
  if(n===1||n===41)errors.push("Original problem replaced "+p.id);
  const lines=p.code.split("\n").filter(s=>s.trim());
  if(lines.some(x=>!x.includes(" # ")))errors.push("Unannotated code "+p.id);
  if(!p.trace?.length||!p.title||!p.statement||!p.output)errors.push("Missing metadata "+p.id);
  const compile=spawnSync("python3",["-I","-c","import ast,sys;ast.parse(sys.stdin.read())"],{input:p.code,encoding:"utf8",timeout:9000});
  if(compile.status!==0){errors.push("Compile "+p.id+" "+(compile.stderr||"").slice(0,250));continue;}
  count++;
  for(const [stdin,expected] of [[p.input==="입력 없음"?"":p.input,p.output],...(more[n]||[])]){
   const run=spawnSync("python3",["-I","-c",p.code],{input:stdin,encoding:"utf8",timeout:9000});
   cases++;
   const norm=s=>String(s??"").replace(/\r\n/g,"\n").replace(/\n$/,"");
   if(run.status!==0||norm(run.stdout)!==norm(expected)){
    errors.push("Output "+p.id+" in="+JSON.stringify(stdin)+" expected="+JSON.stringify(expected)+" got="+JSON.stringify(run.stdout)+" status="+run.status+" err="+(run.stderr||"").slice(0,140));
   }
  }
 }
 console.log("Python compiled:",count+"/98; executed:",cases,"; errors:",errors.length);
 if(errors.length){console.error(errors.slice(0,70).join("\n"));process.exitCode=1;}
}finally{rmSync(dir,{recursive:true,force:true});}
