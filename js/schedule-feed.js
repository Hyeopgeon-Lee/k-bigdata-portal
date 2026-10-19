import {SCHEDULE_FEED_URL} from "./schedule-config.js?v=20261019-google-calendar-1";

const URL_PATTERN = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/;
const monthKey = date => date.toISOString().slice(0,7);
const dateKey = date => date.toISOString().slice(0,10);
let callNumber = 0;

export function scheduleFeedEnabled(){
  return typeof SCHEDULE_FEED_URL === "string" && URL_PATTERN.test(SCHEDULE_FEED_URL);
}
export function getScheduleWindow(month){
  if(!/^\d{4}-\d{2}$/.test(month)) throw new Error("Invalid month");
  const [year,mm] = month.split("-").map(Number);
  if(mm<1 || mm>12) throw new Error("Invalid month");
  const start = new Date(Date.UTC(year,mm-2,1));
  const end = new Date(Date.UTC(year,mm+8,1));
  return {start:dateKey(start), end:dateKey(end), firstMonth:monthKey(start), endMonth:monthKey(end)};
}
export function readScheduleFeed(range){
  if(!scheduleFeedEnabled()) return Promise.resolve(null);
  const callbackName = "__departmentScheduleCallback_" + Date.now() + "_" + (++callNumber);
  const url = new URL(SCHEDULE_FEED_URL);
  url.searchParams.set("start",range.start);
  url.searchParams.set("end",range.end);
  url.searchParams.set("prefix",callbackName);
  // Apps Script ContentService는 JSONP로 호출합니다. 비민감 공개 자료에만 사용.
  return new Promise((resolve,reject)=>{
    const script = document.createElement("script");
    script.async = true;
    let ended = false;
    let timeoutId;
    const cleanup = ()=>{
      if(ended)return false;
      ended=true;
      clearTimeout(timeoutId);
      script.remove();
      delete window[callbackName];
      return true;
    };
    window[callbackName] = payload=>{
      if(!cleanup())return;
      if(!payload || payload.ok!==true || !Array.isArray(payload.events)){
        reject(new Error("학과 일정 응답 오류"));return;
      }
      resolve({events:payload.events,truncated:payload.truncated===true});
    };
    script.onerror = ()=>{if(cleanup())reject(new Error("학과 일정 서버 접속 실패"));};
    timeoutId = setTimeout(()=>{if(cleanup())reject(new Error("학과 일정 서버 응답 시간 초과"));},12000);
    script.src = url.href;
    document.head.append(script);
  });
}
