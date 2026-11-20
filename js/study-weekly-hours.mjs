/* Group stored study sessions by their KST start date, Monday to Friday. */
const SEOUL_OFFSET_MS=9*60*60*1000;
const DAY_MS=24*60*60*1000;
const dateString=ms=>new Date(ms).toISOString().slice(0,10);
export function studyWeeklyTotals(rows,weekStart,secondsFor){
 const monday=Date.parse(weekStart+'T00:00:00Z');
 if(!Number.isFinite(monday))throw new TypeError('Invalid week start');
 const days=Array.from({length:5},(_,i)=>dateString(monday+i*DAY_MS));
 const seconds=Array(5).fill(0);
 for(const row of rows||[]){
  const started=Date.parse(row?.started_at||'');
  if(!Number.isFinite(started))continue;
  const index=days.indexOf(dateString(started+SEOUL_OFFSET_MS));
  if(index===-1)continue;
  seconds[index]+=Math.max(0,Number(secondsFor(row))||0);
 }
 return {days,seconds,totalSeconds:seconds.reduce((a,b)=>a+b,0)};
}
