import {buildBank} from "./practical-core.js?v=20261005-codefmt-2";

const DATA_VERSION="20261005-hintflow-3";

export async function loadPracticalBank(){
 const load=async path=>{
  const url=new URL(path,import.meta.url);
  url.searchParams.set("v",DATA_VERSION);
  const response=await fetch(url);
  if(!response.ok)throw new Error("문제 데이터 로딩 실패");
  return response.json();
 };
 const [questions,extraReconstructed,history,coverage]=await Promise.all([
  load("../data/practical/questions.json"),
  load("../data/practical/reconstructed-extra.json"),
  load("../data/practical/exam-history.json"),
  load("../data/practical/coverage.json")
 ]);
 const imported=await load("../data/practical/normalized.json");
 return {bank:buildBank([...questions,...extraReconstructed,...imported.questions],history),coverage,aliases:imported.aliases};
}
