/**
 * 학과 주요 일정 - 개인 Google 캘린더의 (학과) 접두어 일정만 공개.
 * 실행 계정은 캘린더 소유자여야 하며, 본 스크립트의 Sheet는 비공개로 유지합니다.
 * doGet은 공개 조회 전용. 공개 등록은 PublicRegistration.gs의 doPost에서 처리합니다.
 *
 * 일정 입력 예:
 *   (학과) 졸업작품 발표
 *   (학과) [시험] 중간고사
 *   (학과) [취업] 기업 채용설명회
 */
const DEPT = Object.freeze({
  prefix: /^\(학과\)\s*(?:\[(학사|시험|프로젝트|취업|자격증|행사)\]\s*)?(?:\[(1학년|2학년)\]\s*)?(.+)$/,
  sheetName: "PublishedSchedules",
  headers: ["id","title","category","startDate","endDate","startTime","important","published","source","targetGrade"],
  periodPastMonths: 6,
  periodFutureMonths: 18,
  maximumEvents: 4000
});
const CATEGORIES = Object.freeze({
  "학사":"academic","시험":"exam","프로젝트":"project",
  "취업":"employment","자격증":"certificate","행사":"event"
});
const PORTAL_SOURCE_TAG = "kbigdata_portal_registration";
// Store only the published projection, never CalendarApp objects or personal data.
// Apps Script cache entries are limited to 100 KB, so oversize payloads fall back to Sheets.
const SCHEDULE_PUBLIC_CACHE_KEY = "dept-public-events-v2";
const SCHEDULE_PUBLIC_CACHE_SECONDS = 90;
function publicCache_() {
  try { return typeof CacheService === "undefined" ? null : CacheService.getScriptCache(); }
  catch (_) { return null; }
}
function invalidatePublicCache_() {
  try { publicCache_()?.remove(SCHEDULE_PUBLIC_CACHE_KEY); } catch (_) {}
}
const PROP = PropertiesService.getScriptProperties();

/** 실행 계정의 기본 캘린더만 읽습니다. 다른 캘린더는 읽지 않습니다. */
function departmentCalendar_() {
  const calendar = CalendarApp.getDefaultCalendar();
  if (!calendar) throw new Error("대상 캘린더에 접근할 수 없습니다.");
  return calendar;
}

/** 최초 한 번 스크립트 편집기에서 실행해야 합니다. */
function setupDepartmentCalendar() {
  const existingId = PROP.getProperty("SPREADSHEET_ID");
  let spreadsheet = existingId ? SpreadsheetApp.openById(existingId) : null;
  if (!spreadsheet) {
    spreadsheet = SpreadsheetApp.create("학과 주요 일정 - 포털 공개 목록 (비공개)");
    spreadsheet.setSpreadsheetTimeZone("Asia/Seoul");
    const first = spreadsheet.getSheets()[0];
    first.setName(DEPT.sheetName);
    PROP.setProperty("SPREADSHEET_ID", spreadsheet.getId());
  }
  ensureSheet_();
  const old = ScriptApp.getProjectTriggers().filter(t =>
    t.getHandlerFunction() === "syncDepartmentCalendar");
  old.forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("syncDepartmentCalendar").timeBased().everyMinutes(10).create();
  const result = syncDepartmentCalendar();
  Logger.log("비공개 저장소: " + spreadsheet.getUrl());
  Logger.log("동기화 결과: " + JSON.stringify(result));
  return result;
}

function ensureSheet_() {
  const id = PROP.getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("먼저 setupDepartmentCalendar()를 실행하세요.");
  const spreadsheet = SpreadsheetApp.openById(id);
  let sheet = spreadsheet.getSheetByName(DEPT.sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(DEPT.sheetName);
  sheet.getRange(1,1,1,DEPT.headers.length).setValues([DEPT.headers]);
  sheet.setFrozenRows(1);
  return sheet;
}

function formattedDate_(date) {
  return Utilities.formatDate(date,"Asia/Seoul","yyyy-MM-dd");
}
function formattedTime_(date) {
  return Utilities.formatDate(date,"Asia/Seoul","HH:mm");
}
function privateEvent_(event) {
  // CalendarApp.Visibility.PRIVATE / CONFIDENTIAL인 일정은 절대 공개하지 않습니다.
  const visibility = String(event.getVisibility());
  return visibility === String(CalendarApp.Visibility.PRIVATE) ||
    visibility === String(CalendarApp.Visibility.CONFIDENTIAL);
}
function classify_(label, title) {
  if (label && CATEGORIES[label]) return CATEGORIES[label];
  if (/시험|중간고사|기말고사|평가|졸업시험/.test(title)) return "exam";
  if (/프로젝트|졸업작품|해커톤|작품발표/.test(title)) return "project";
  if (/취업|채용|기업설명회|면접|입사지원/.test(title)) return "employment";
  if (/자격증|정보처리기사|정보처리산업기사|실기시험/.test(title)) return "certificate";
  if (/개강|종강|휴강|수강|학사|보강|등록/.test(title)) return "academic";
  return "event";
}
/**
 * 캘린더 설명의 독립된 한 줄에서만 학년을 추출합니다.
 * 예: 대상학년: 1학년 / 대상학년: 2학년 / 대상학년: 전체
 * 다른 메모 내용은 시트·공개 API·캐시에 보관하지 않습니다.
 * 값이 없거나 잘못된 경우 null을 반환하여 기존 제목 태그를 유지합니다.
 */
function targetGradeFromDescription_(description) {
  const lines = String(description || "").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^[ \t]*대상[ \t]*학년[ \t]*[:：][ \t]*(1학년|2학년|전체)[ \t]*\r?$/);
    if (!match) continue;
    return match[1] === "1학년" ? "1" : match[1] === "2학년" ? "2" : "all";
  }
  return null;
}

function eventPublicRow_(event) {
  if (privateEvent_(event)) return null;
  const original = String(event.getTitle() || "");
  const match = original.match(DEPT.prefix);
  if (!match) return null;
  const title = match[3].trim().slice(0,120);
  if (!title) return null;
  // 메모는 (학과) 접두어 및 비공개 여부를 검증한 뒤에만 읽습니다.
  // 메모의 대상학년 한 줄이 제목 태그보다 우선합니다.
  const targetGrade = targetGradeFromDescription_(event.getDescription()) ||
    (match[2] === "1학년" ? "1" : match[2] === "2학년" ? "2" : "all");
  // 캘린더 제목이 수식처럼 시작해도 Sheets에서 실행되지 않도록 합니다.
  const sheetSafeTitle = /^[=+@-]/.test(title) ? "'" + title : title;
  const start = event.getStartTime();
  const end = event.getEndTime();
  const allDay = event.isAllDayEvent();
  // CalendarEvent.getEndTime()은 종일 일정의 경우 종료 다음날 00:00을 반환합니다.
  const endInclusive = end.getTime() > start.getTime()
    ? new Date(end.getTime()-1) : start;
  const instance = String(event.getId())+"|"+start.toISOString();
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, instance);
  const stableId = Utilities.base64EncodeWebSafe(bytes).replace(/=+$/,"").slice(0,28);
  return [
    stableId,
    sheetSafeTitle,
    classify_(match[1],title),
    formattedDate_(start),
    formattedDate_(endInclusive),
    allDay ? "" : formattedTime_(start),
    false,
    true,
    event.getTag(PORTAL_SOURCE_TAG) === "portal-v1" ? "portal" : "calendar",
    targetGrade
  ];
}

/** 관리자 계정의 10분 주기 트리거에서만 실행. */
function syncDepartmentCalendar() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const calendar = departmentCalendar_();
    const now = new Date();
    const from = new Date(now.getFullYear(),now.getMonth()-DEPT.periodPastMonths,1);
    const until = new Date(now.getFullYear(),now.getMonth()+DEPT.periodFutureMonths+1,1);
    const raw = calendar.getEvents(from,until);
    if (raw.length > DEPT.maximumEvents) {
      throw new Error("조회 건수 상한 초과 - 동기화하지 않았습니다.");
    }
    const rows = raw.map(eventPublicRow_).filter(Boolean)
      .sort((a,b)=>a[3].localeCompare(b[3])||a[5].localeCompare(b[5]));
    const sheet = ensureSheet_();
    if (sheet.getLastRow()>1) {
      sheet.getRange(2,1,sheet.getLastRow()-1,DEPT.headers.length).clearContent();
    }
    if (rows.length) {
      // 날짜/시각 문자열의 자동 변환 및 선행 0 손실을 방지합니다.
      sheet.getRange(2,2,rows.length,5).setNumberFormat("@");
      sheet.getRange(2,1,rows.length,DEPT.headers.length).setValues(rows);
    }
    SpreadsheetApp.flush();
    const stamp = Utilities.formatDate(new Date(),"Asia/Seoul","yyyy-MM-dd HH:mm:ss");
    PROP.setProperties({
      LAST_SYNC_AT:stamp,
      LAST_SYNC_COUNT:String(rows.length),
      SYNC_OK:"true"
    });
    invalidatePublicCache_();
    Logger.log("(학과) 일정 " + rows.length + "건 동기화 완료 (" + stamp + ")");
    return {count:rows.length, updatedAt:stamp};
  } catch (err) {
    // 접두어 제거/삭제 후 동기화 실패 시 오래된 목록을 계속 공개하지 않습니다.
    PROP.setProperty("SYNC_OK","false");
    invalidatePublicCache_();
    throw err;
  } finally {
    lock.releaseLock();
  }
}

/**
 * 공개 웹 앱 읽기 엔드포인트.
 * 요청의 callback 값은 단순 JS 식별자로 제한하며, 읽기 이외 작업을 지원하지 않습니다.
 * 포털에는 제목/날짜/시간/분류만 공개하며 개인 메모·장소·참석자·이메일·URL은 제외합니다.
 */
function doGet(e) {
  const callback = String((e && e.parameter && e.parameter.callback) || "");
  const okCallback = /^[A-Za-z_$][A-Za-z0-9_$]{0,100}$/.test(callback);
  const props = PropertiesService.getScriptProperties();
  let response;
  try {
    if (props.getProperty("SYNC_OK") !== "true") throw new Error("Sync unavailable");
    const sheetId = props.getProperty("SPREADSHEET_ID");
    if (!sheetId) throw new Error("Not configured");
    const updatedAt = props.getProperty("LAST_SYNC_AT") || "";
    const cache = publicCache_();
    let cached = null;
    try {
      const rawCache = cache?.get(SCHEDULE_PUBLIC_CACHE_KEY);
      if (rawCache) cached = JSON.parse(rawCache);
    } catch (_) { cached = null; }
    if (cached?.ok === true && cached.updatedAt === updatedAt && Array.isArray(cached.events)) {
      response = cached;
    } else {
      const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(DEPT.sheetName);
      if (!sheet) throw new Error("No published data");
      const rows = sheet.getLastRow()>1
        ? sheet.getRange(2,1,sheet.getLastRow()-1,DEPT.headers.length).getValues()
        : [];
      const events = rows.filter(r=>r[0]&&r[7]===true).map(r=>({
        id:String(r[0]),
        title:String(r[1]),
        category:String(r[2]),
        startDate:String(r[3]),
        endDate:String(r[4]),
        startTime:String(r[5]),
        important:r[6]===true,
        published:true,
        source:r[8]==="portal" ? "portal" : "calendar",
        targetGrade:r[9]==="1"||r[9]==="2"?r[9]:"all"
      }));
      response = {ok:true,updatedAt:updatedAt,events:events};
      // 25k UTF-16 units keeps even multilingual JSON comfortably below the
      // Apps Script per-item 100 KB limit; failures must not break public reads.
      try {
        const payload = JSON.stringify(response);
        if (payload.length <= 25000) cache?.put(SCHEDULE_PUBLIC_CACHE_KEY,payload,SCHEDULE_PUBLIC_CACHE_SECONDS);
      } catch (_) {}
    }
  } catch (err) {
    // 개인 설정/Sheet ID/에러 스택이 응답에 노출되지 않도록 고정 메시지로 응답.
    console.error(err);
    response = {ok:false,error:"일정 데이터를 읽을 수 없습니다.",events:[]};
  }
  const safeJson = JSON.stringify(response).replace(/</g,"\\u003c")
    .replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");
  if (okCallback) {
    return ContentService.createTextOutput(callback+"("+safeJson+");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(safeJson)
    .setMimeType(ContentService.MimeType.JSON);
}
