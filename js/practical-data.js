const DATA_VERSION="20261128-performance-1";
const loads=new Map();
async function load(path){
 const url=new URL("../data/practical/indexed/"+path,import.meta.url);
 url.searchParams.set("v",DATA_VERSION);
 const response=await fetch(url);
 if(!response.ok)throw new Error("문제 데이터 로딩 실패");
 return response.json();
}
export async function loadPracticalBank(){return load("index.json");}
export function loadPracticalLanguage(bank,language){
 if(loads.has(language))return loads.get(language);
 const task=load(language.toLowerCase()+".json").then(rows=>{
  const details=new Map(rows.map(q=>[q.id,q]));
  for(const q of bank.filter(q=>q.language===language)){
   if(!details.has(q.id))throw Error("문제 상세 누락");
   Object.assign(q,details.get(q.id));
  }
 }).catch(e=>{loads.delete(language);throw e;});
 loads.set(language,task);return task;
}
