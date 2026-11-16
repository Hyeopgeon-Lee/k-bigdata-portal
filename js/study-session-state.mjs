/* Pure study-session presentation rules; server validates eligibility and staleness again. */
const HOUR=3600000,SEOUL=9*HOUR;
const kdate=ms=>new Date(ms+SEOUL).toISOString().slice(0,10);

export function isStaleSession(session,now=Date.now()){
 if(!session||session.status!=='active')return false;
 const started=Date.parse(session.started_at);
 if(!Number.isFinite(started)||started>now)return false;
 const age=now-started;
 return age>=12*HOUR||(age>=6*HOUR&&kdate(started)<kdate(now));
}
export function studyActionButton(action){
 return action==='start'||action==='resume'||action==='restart'
  ?'study-session-primary':action==='pause'?'study-pause':'study-end';
}
export function describeStudyError(error){
 const rawCode=String(error?.code||'UNKNOWN').toUpperCase();
 const code=/^[A-Z0-9_-]{1,48}$/.test(rawCode)?rawCode:'UNKNOWN';
 const status=Number(error?.status)||null;
 const details=String(error?.message||'');
 if(code==='STUDY_TIMEOUT')return {code,status,message:'서버 응답이 지연됩니다. 실제 학습 시작 여부를 다시 확인해 주세요.'};
 if(status===401||/JWT|REFRESH_TOKEN|INVALID.+TOKEN/i.test(details))
  return {code,status,message:'로그인 인증이 만료되었습니다. 포털에서 다시 로그인해 주세요.'};
 if(status===403||code==='42501'||/NOT_ELIGIBLE|PERMISSION|AUTHORIZED|DENIED/i.test(details))
  return {code,status,message:'학습기록 권한이 없습니다. 포털 가입 승인 및 학적 상태를 확인해 주세요.'};
 if(code==='STUDY_NO_ACTIVE_SESSION'||/No active session/i.test(details))
  return {code,status,message:'진행 중인 학습을 찾지 못했습니다. 새로고침 후 다시 시작해 주세요.'};
 if(code==='STUDY_STALE_SESSION'||/STALE_SESSION/i.test(details))
  return {code,status,message:'이전 학습기록이 남아 있습니다. 기록을 확인한 뒤 새로운 학습을 시작해 주세요.'};
 if(/failed to fetch|network|load failed|connection|offline/i.test(details))
  return {code:'NETWORK_ERROR',status,message:'인터넷 연결이 불안정합니다. 연결을 확인한 뒤 학습 상태를 새로고침해 주세요.'};
 return {code,status,message:'학습기록을 처리하지 못했습니다. 새로고침 후 다시 시도해 주세요.'};
}

// Live timer includes seconds. Weekly statistics remain formatted in whole minutes.
export function formatStudyTimer(seconds){
 const total=Number.isFinite(Number(seconds))?Math.max(0,Math.floor(Number(seconds))):0;
 const hours=Math.floor(total/3600);
 const minutes=String(Math.floor(total%3600/60)).padStart(2,'0');
 const remainder=String(total%60).padStart(2,'0');
 return hours+'시간 '+minutes+'분 '+remainder+'초';
}
