import {mountWrittenExam} from "./written-exam-ui.mjs?v=20261123-unified-1";
mountWrittenExam({
 examType:"industrial",
 label:"정보처리산업기사",
 dataUrl:"data/industrial-written/questions.json?v=20261123-unified-1",
 storageKey:"kbigdata-industrial-written-attempts-v2",
 sourceIndexUrl:"data/industrial-written/sources.json?v=20261123-index-1"
});
