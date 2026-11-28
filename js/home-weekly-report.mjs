// Announcement only. The authenticated weekly-report endpoint enforces access itself.
const DAY=86400000,KST=9*3600000;
const dateKey=ms=>new Date(ms+KST).toISOString().slice(0,10);
const koreanDate=(key,year=false)=>{
 const [y,m,d]=key.split('-').map(Number);
 return (year?y+'년 ':'')+m+'월 '+d+'일';
};
export function weeklyReportWindow(now=Date.now()){
 const local=new Date(now+KST);
 const monday=Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate()-(local.getUTCDay()+6)%7)-KST;
 // Monday 09:00 KST inclusive; Tuesday 00:00 KST exclusive.
 const opens=monday+9*3600000,closes=monday+DAY;
 const weekStart=dateKey(monday-7*DAY),weekEnd=dateKey(monday-DAY),crossYear=weekStart.slice(0,4)!==weekEnd.slice(0,4);
 return {visible:now>=opens&&now<closes,weekStart,weekEnd,
  period:koreanDate(weekStart,crossYear)+' ~ '+koreanDate(weekEnd,crossYear),
  next:now<opens?opens:now<closes?closes:opens+7*DAY};
}
export function weeklyReportEligible(context,access,now=Date.now()){
 const p=context?.profile;
 return Boolean(context?.user?.id&&context.isAdmin===false&&access?.read===true&&access?.write===true&&Number(access.expires)>now&&
  p?.signup_type==='student'&&p.approval_status==='approved'&&p.enrollment_status==='enrolled'&&[1,2].includes(Number(p.academic_year)));
}
export function mountWeeklyReportCard(doc=globalThis.document,win=globalThis.window){
 const card=doc?.getElementById('home-weekly-report');
 if(!card||!win)return;
 const period=doc.getElementById('home-weekly-report-period'),link=doc.getElementById('home-weekly-report-link');
 let timer;
 const refresh=()=>{
  win.clearTimeout(timer);
  const now=Date.now(),windowState=weeklyReportWindow(now);
  const show=windowState.visible&&weeklyReportEligible(win.portalVerifiedContext,win.portalLearning,now);
  if(show){
   period.textContent=windowState.period+' 학습 리포트';
   link.href='weekly-report.html?week='+windowState.weekStart;
  }
  if(card.hidden===show)card.hidden=!show;
  // No network request. Recheck at the time boundary and at most once per minute
  // for changed device clocks, session expiry and background-tab timers.
  const expiry=Number(win.portalLearning?.expires);
  const untilExpiry=Number.isFinite(expiry)&&expiry>now?expiry-now:60000;
  timer=win.setTimeout(refresh,Math.max(1,Math.min(60000,windowState.next-now,untilExpiry)));
 };
 win.addEventListener('portal-learning-ready',refresh);
 win.addEventListener('pageshow',refresh);
 win.addEventListener('focus',refresh);
 doc.addEventListener('visibilitychange',refresh);
 refresh();
 return {refresh,dispose(){
  win.clearTimeout(timer);
  win.removeEventListener('portal-learning-ready',refresh);win.removeEventListener('pageshow',refresh);win.removeEventListener('focus',refresh);doc.removeEventListener('visibilitychange',refresh);
  card.hidden=true;
 }};
}
if(typeof document!=='undefined'&&typeof window!=='undefined')mountWeeklyReportCard();
