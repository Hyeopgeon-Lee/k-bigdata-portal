import {mountWrittenExam} from "./written-exam-ui.mjs?v=20261124-db-answer-fix-1";
mountWrittenExam({
 examType:"industrial",
 label:"정보처리산업기사",
 scanSessions:[
  {year:2025,round:1,roundLabel:"1회"},
  {year:2025,round:2,roundLabel:"2회"},
  {year:2025,round:3,roundLabel:"3회"},
  {year:2026,round:2,roundLabel:"2회"}
 ],
 scanSubjectNames:["정보시스템 기반 기술","프로그래밍언어 활용","데이터베이스 활용"],
 storageKey:"kbigdata-industrial-written-attempts-v2"
});
