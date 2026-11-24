import {mountWrittenExam} from "./written-exam-ui.mjs?v=20261124-2025-sessions-v1";
mountWrittenExam({
 examType:"industrial",
 label:"정보처리산업기사",
 dataUrl:"data/industrial-written/questions.json?v=20261124-hwpx100-v1",
 additionalDataUrls:["data/industrial-written/questions-20200822.json?v=20261124-third-round-v1"],
 scanSessions:[
  {year:2025,round:1,roundLabel:"1회",manifestUrl:"data/industrial-written/scans-2025-1.json?v=20261124-2025-metadata"},
  {year:2025,round:2,roundLabel:"2회",manifestUrl:"data/industrial-written/scans-2025-2.json?v=20261124-2025-metadata"},
  {year:2025,round:3,roundLabel:"3회",manifestUrl:"data/industrial-written/scans-2025-3.json?v=20261124-2025-metadata"},
  {year:2026,round:2,roundLabel:"2회",manifestUrl:"data/industrial-written/scans-2026-2.json?v=20261124-scan-v1"}
 ],
 scanSubjectNames:["정보시스템 기반 기술","프로그래밍언어 활용","데이터베이스 활용"],
 storageKey:"kbigdata-industrial-written-attempts-v2",
 sourceIndexUrl:"data/industrial-written/sources.json?v=20261123-index-1"
});
