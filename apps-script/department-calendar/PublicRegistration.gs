/** 익명 사용자는 새 일정만 등록할 수 있습니다. 기존 일정 조회/수정/삭제는 허용하지 않습니다. */
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
  const title = String(p.title || "").trim()
    .replace(/^(?:\((?:학과|하과)\)\s*)+/, "").replace(/\s+/g, " ").trim();
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
  return {title:"(학과) [" + label + "] " + title, start:start, end:end, allDay:allDay};
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
    if (input.allDay) calendar.createAllDayEvent(input.title,input.start,input.end);
    else calendar.createEvent(input.title,input.start,input.end);
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

/** POST만 새 일정 등록을 허용. 공개 GET은 기존대로 조회만 합니다. */
function doPost(e) {
  const p = e && e.parameter || {};
  const requestId = /^[a-f0-9]{32}$/.test(String(p.requestId || "")) ? String(p.requestId) : "";
  let result;
  try {
    // 서비스 예외와 입력 검증 오류를 분리하여 내부 식별자를 노출하지 않습니다.
    try { registrationInput_(p); }
    catch (validationError) { return registrationReply_({ok:false,error:validationError.message},requestId); }
    result = registerPublicSchedule_(p);
    if (result.ok) {
      try { syncDepartmentCalendar(); }
      catch (syncError) { console.error("Registration saved; synchronization pending"); }
    }
  } catch (err) {
    console.error("Public registration failed");
    result = {ok:false,error:"일정을 등록하지 못했습니다. 같은 화면에서 다시 시도해 주세요."};
  }
  return registrationReply_(result,requestId);
}

function registrationReply_(result, requestId) {
  const message = JSON.stringify({type:"kbigdata-schedule-registration",requestId:requestId,
    ok:result.ok===true,error:result.error||""}).replace(/</g,"\\u003c")
    .replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");
  const origin = JSON.stringify(REGISTRATION.origin);
  return HtmlService.createHtmlOutput("<!doctype html><meta charset=\"utf-8\"><script>window.top.postMessage("+
    message+","+origin+");</script>")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
