import {buildBank} from "./practical-core.js?v=20261005-timing-1";
export async function loadPracticalBank(){
 const load=async path=>{const url=new URL(path,import.meta.url);url.searchParams.set("v","20261005-hints-1");const response=await fetch(url);if(!response.ok)throw new Error("문제 데이터 로딩 실패");return response.json();};
 const version="?v=20261005-hintflow-1";
 const [questions,extraReconstructed,history,coverage]=await Promise.all([load("../data/practical/questions.json"+version),load("../data/practical/reconstructed-extra.json"+version),load("../data/practical/exam-history.json"+version),load("../data/practical/coverage.json"+version)]);
 const imported=await load("../data/practical/normalized.json"+version);
 return {bank:buildBank([...questions,...extraReconstructed,...imported.questions],history),coverage,aliases:imported.aliases};
}
