/** 익명 사용자는 포털 등록 일정에 한해 등록·삭제할 수 있습니다. 캘린더 원본 일정은 보호합니다. */
const REGISTRATION = Object.freeze({
  origin: "https://portal.k-bigdata.kr",
  dailyLimit: 50,
  maximumDays: 31
});

function registrationInput_(p) {
  if (!p || p.action !== "register" || !/^[a-f0-9]{32}$/.test(String(p.requestId || ""))) {
    throw new Error("등록 요청을 확인할 수 없습니다. 다시 시도해 주세요.");
  }
  if (String(p.website || "") !== "") throw new Error("등록 요청을 확인할 수 없습니다.");
  const rawTitle = String(p.title || "").trim()
    .replace(/^(?:\((?:학과|하과)\)\s*)+/, "").replace(/\s+/g, " ").trim();
  // Also understand grade tags embedded by pre-upgrade clients. Old deployed
  // Apps Script simply stores them in the Calendar title; new code promotes
  // them to the public targetGrade field without changing the display title.
  const tagged = rawTitle.match(/^\[(1학년|2학년)\]\s*(.*)$/);
  const title = (tagged ? tagged[2] : rawTitle).trim();
  const explicitGrade=String(p.targetGrade || "");
  if (explicitGrade && !["all","1","2"].includes(explicitGrade)) {
    throw new Error("대상 학년을 확인해 주세요.");
  }
  const targetGrade=explicitGrade || (tagged ? (tagged[1]==="1학년"?"1":"2") : "all");
  if (!title || title.length > 100 || /[\x00-\x1f\x7f]/.test(title)) {
    throw new Error("일정명은 1~100자로 입력해 주세요.");
  }
  const labels = Object.keys(CATEGORIES);
  const category = String(p.category || "");
  const label = labels.find(key => CATEGORIES[key] === category);
  if (!label) throw new Error("일정 분류를 선택해 주세요.");
  const date = value => {
    const text = String(value || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error("날짜를 확인해 주세요.");
    const result = new Date(text + "T00:00:00+09:00");
    if (isNaN(result.getTime()) || formattedDate_(result) !== text) throw new Error("날짜를 확인해 주세요.");
    return result;
  };
  const startDay = date(p.startDate);
  const endDay = date(p.endDate);
  const today = date(formattedDate_(new Date()));
  const latest = new Date(today.getTime());
  latest.setMonth(latest.getMonth() + 18);
  const days = Math.round((endDay - startDay) / 86400000) + 1;
  if (startDay < today || endDay > latest || days < 1 || days > REGISTRATION.maximumDays) {
    throw new Error("오늘부터 18개월 이내, 최대 31일의 일정을 등록할 수 있습니다.");
  }
  const allDay = String(p.allDay) === "true";
  let start = startDay, end = new Date(endDay.getTime() + 86400000);
  if (!allDay) {
    const time = value => {
      const text = String(value || "");
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(text)) throw new Error("시간을 확인해 주세요.");
      return text;
    };
    start = new Date(String(p.startDate) + "T" + time(p.startTime) + ":00+09:00");
    end = new Date(String(p.endDate) + "T" + time(p.endTime) + ":00+09:00");
    if (end <= start) throw new Error("종료 시간은 시작 시간보다 늦어야 합니다.");
  }
  return {title:"(학과) [" + label + "] " + (targetGrade==="all"?"":"["+(targetGrade==="1"?"1학년":"2학년")+"] ") + title, start:start, end:end, allDay:allDay};
}

function registerPublicSchedule_(p) {
  const input = registrationInput_(p);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const today = formattedDate_(new Date());
    const key = "REG_" + today + "_" + p.requestId;
    if (PROP.getProperty(key)) return {ok:true,duplicate:true};
    const storedDay = PROP.getProperty("REGISTRATION_DAY");
    const count = storedDay === today ? Number(PROP.getProperty("REGISTRATION_COUNT") || 0) : 0;
    if (count >= REGISTRATION.dailyLimit) return {ok:false,error:"오늘의 일정 등록 한도에 도달했습니다. 내일 다시 이용해 주세요."};
    const calendar = departmentCalendar_();
    // 제목/날짜/시간만 사용합니다. 참석자, 설명, 장소, 회의 링크는 입력받지 않습니다.
    const created = input.allDay
      ? calendar.createAllDayEvent(input.title,input.start,input.end)
      : calendar.createEvent(input.title,input.start,input.end);
    // 출처는 브라우저 입력값이 아닌 서버에서만 부여합니다.
    created.setTag(PORTAL_SOURCE_TAG,"portal-v1");
    PROP.setProperties({REGISTRATION_DAY:today,REGISTRATION_COUNT:String(count+1)});
    PROP.setProperty(key,"created");
    const properties = PROP.getProperties();
    Object.keys(properties).filter(name=>name.startsWith("REG_") && !name.startsWith("REG_"+today+"_"))
      .forEach(name=>PROP.deleteProperty(name));
    return {ok:true};
  } finally {
    lock.releaseLock();
  }
}

/**
 * 공개 삭제: 비공개 Sheets에 등록 출처가 portal이고, 실제 Google 캘린더
 * 일정에 서버가 기록한 태그가 존재할 때만 삭제합니다.
 * 일정 ID는 캘린더 원본 ID 대신 공개용 해시 ID를 사용합니다.
 */
function deleteInput_(p) {
  if (!p || p.action !== "delete" ||
      !/^[a-f0-9]{32}$/.test(String(p.requestId || "")) ||
      !/^[A-Za-z0-9_-]{28}$/.test(String(p.id || "")) ||
      String(p.website || "") !== "") {
    throw new Error("삭제 요청을 확인할 수 없습니다.");
  }
  return String(p.id);
}

function deletePublicSchedule_(p) {
  const id = deleteInput_(p);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (PROP.getProperty("SYNC_OK") !== "true") {
      return {ok:false,error:"일정 동기화 중입니다. 잠시 후 다시 시도해 주세요."};
    }
    const sheet = ensureSheet_();
    const rows = sheet.getLastRow() > 1
      ? sheet.getRange(2,1,sheet.getLastRow()-1,DEPT.headers.length).getValues()
      : [];
    const row = rows.find(r => String(r[0]) === id);
    // 구버전 일정 등 출처가 입증되지 않은 항목은 삭제하지 않습니다.
    if (!row || row[7] !== true || row[8] !== "portal") {
      return {ok:false,error:"이 일정은 포털에서 삭제할 수 없습니다."};
    }
    const startDay = String(row[3]);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDay)) {
      return {ok:false,error:"일정 정보를 확인할 수 없습니다."};
    }
    const from = new Date(startDay + "T00:00:00+09:00");
    const to = new Date(from.getTime() + 86400000);
    const matching = departmentCalendar_().getEvents(from,to)
      .find(event => event.getTag(PORTAL_SOURCE_TAG) === "portal-v1" &&
        (eventPublicRow_(event) || [])[0] === id);
    if (!matching) {
      return {ok:false,error:"삭제할 일정이 없거나 변경되었습니다. 새로고침해 주세요."};
    }
    matching.deleteEvent();
    return {ok:true};
  } finally {
    lock.releaseLock();
  }
}

/** POST로 새 일정 등록 또는 포털 등록 일정만 삭제합니다. */
function doPost(e) {
  const p = e && e.parameter || {};
  const requestId = /^[a-f0-9]{32}$/.test(String(p.requestId || "")) ? String(p.requestId) : "";
  const action = String(p.action || "");
  let result;
  try {
    if (action === "register") {
      try { registrationInput_(p); }
      catch (validationError) {
        return registrationReply_({ok:false,error:validationError.message},requestId,action);
      }
      result = registerPublicSchedule_(p);
    } else if (action === "delete") {
      try { deleteInput_(p); }
      catch (validationError) {
        return registrationReply_({ok:false,error:validationError.message},requestId,action);
      }
      result = deletePublicSchedule_(p);
    } else {
      result = {ok:false,error:"지원하지 않는 일정 요청입니다."};
    }
    if (result.ok) {
      try { syncDepartmentCalendar(); }
      catch (syncError) { console.error("Schedule saved; synchronization pending"); }
    }
  } catch (err) {
    console.error("Public schedule action failed");
    result = {ok:false,error:"일정을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."};
  }
  return registrationReply_(result,requestId,action);
}

function registrationReply_(result, requestId, action) {
  const messageType = action === "delete" ? "kbigdata-schedule-delete" : "kbigdata-schedule-registration";
  const message = JSON.stringify({type:messageType,requestId:requestId,
    ok:result.ok===true,error:result.error||""}).replace(/</g,"\\u003c")
    .replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");
  const origin = JSON.stringify(REGISTRATION.origin);
  return HtmlService.createHtmlOutput("<!doctype html><meta charset=\"utf-8\"><script>window.top.postMessage("+
    message+","+origin+");</script>")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
