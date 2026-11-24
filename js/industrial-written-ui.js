import {mountWrittenExam} from "./written-exam-ui.mjs?v=20261124-multi-round-v4";
mountWrittenExam({
 examType:"industrial",
 label:"정보처리산업기사",
 dataUrl:"data/industrial-written/questions.json?v=20261124-hwpx100-v1",
 additionalDataUrls:["data/industrial-written/questions-20200822.json?v=20261124-third-round-v1"],
 scanManifestUrl:"data/industrial-written/scans-2026-2.json?v=20261124-scan-v1",
 scanYear:2026,
 scanSubjectNames:["정보시스템 기반 기술","프로그래밍언어 활용","데이터베이스 활용"],
 storageKey:"kbigdata-industrial-written-attempts-v2",
 sourceIndexUrl:"data/industrial-written/sources.json?v=20261123-index-1"
});
