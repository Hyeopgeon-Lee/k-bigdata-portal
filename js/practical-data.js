import {buildBank} from "./practical-core.js?v=20261005-browser-1";

const DATA_VERSION="20261005-solution-1";

export async function loadPracticalBank(){
 const load=async path=>{
  const url=new URL(path,import.meta.url);
  url.searchParams.set("v",DATA_VERSION);
  const response=await fetch(url);
  if(!response.ok)throw new Error("문제 데이터 로딩 실패");
  return response.json();
 };
 const [questions,extraReconstructed,history,coverage,imported]=await Promise.all([
  load("../data/practical/questions.json"),
  load("../data/practical/reconstructed-extra.json"),
  load("../data/practical/exam-history.json"),
  load("../data/practical/coverage.json"),
  load("../data/practical/normalized.json")
 ]);
 return {bank:buildBank([...questions,...extraReconstructed,...imported.questions],history),coverage,aliases:imported.aliases};
}
