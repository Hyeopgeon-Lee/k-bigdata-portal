// Temporary grade bridge for published department events while the currently
// deployed Google Apps Script still returns the nine-column legacy projection.
// Values were checked against the calendar descriptions on 2026-10-20.
// Only public event titles, start dates and grade codes are stored here;
// neither the original calendar notes nor any personal calendar data is copied.
// Once Apps Script emits an explicit targetGrade, it always wins.
export const legacyGradeOverrides = Object.freeze({
  "2026-10-21|발표회 이력서 제출":"2",
  "2026-10-23|중학생진로체험":"1",
  "2026-10-26|졸업작품설치":"2",
  "2026-10-28|졸업발표회":"2"
});
export function publishedGrade(event,normalizedTitle){
  if(["1","2","all"].includes(event?.targetGrade))return event.targetGrade;
  const key=String(event?.startDate||"")+"|"+String(normalizedTitle||"");
  if(Object.hasOwn(legacyGradeOverrides,key))return legacyGradeOverrides[key];
  const tag=String(event?.title||"").match(/^\[(1학년|2학년)\]\s*/);
  return tag?(tag[1]==="1학년"?"1":"2"):"all";
}
