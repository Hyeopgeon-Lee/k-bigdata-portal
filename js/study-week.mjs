/* Friday opening for the following week's study plan, based on Korea Standard Time. */
const KST_OFFSET_MS=9*60*60*1000;
const DAY_MS=24*60*60*1000;
const isoDate=ms=>new Date(ms).toISOString().slice(0,10);
export function studyPlanningWeeks(now=Date.now()){
 const local=new Date(now+KST_OFFSET_MS);
 const mondayUtc=Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),
   local.getUTCDate()-((local.getUTCDay()+6)%7));
 const thisWeek=isoDate(mondayUtc);
 const nextWeek=isoDate(mondayUtc+7*DAY_MS);
 const nextWeekOpen=local.getUTCDay()===0||local.getUTCDay()>=5; // Friday through Sunday KST
 return {thisWeek,nextWeek,nextWeekOpen,defaultWeek:nextWeekOpen?nextWeek:thisWeek};
}
