import {buildBank} from "./practical-core.js";
export async function loadPracticalBank(){
 const load=async path=>{const response=await fetch(new URL(path,import.meta.url));if(!response.ok)throw new Error("문제 데이터 로딩 실패");return response.json();};
 const [questions,history,coverage]=await Promise.all([load("../data/practical/questions.json"),load("../data/practical/exam-history.json"),load("../data/practical/coverage.json")]);
 return {bank:buildBank(questions,history),coverage};
}
