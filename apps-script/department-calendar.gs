/**
 * 학과 포털 공개 일정 피드 (읽기 전용).
 * 웹 앱 실행 사용자: 나, 액세스 권한: 모든 사용자.
 * 기본 캘린더에서 (학과) 접두 일정만 읽습니다.
 */
var DEPT_TZ = 'Asia/Seoul';
var DEPT_PREFIX = /^\s*\(학과\)\s*(?:\[(학사|시험|프로젝트|취업|자격증|행사)\]\s*)?(.+?)\s*$/;
var DEPT_CATEGORIES = {
  '학사':'academic','시험':'exam','프로젝트':'project',
  '취업':'employment','자격증':'certificate','행사':'event'
};
function formatDeptDate_(value) {
  return Utilities.formatDate(value, DEPT_TZ, 'yyyy-MM-dd');
}
function formatDeptTime_(value) {
  return Utilities.formatDate(value, DEPT_TZ, 'HH:mm');
}
function parseDeptDate_(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('날짜 형식 오류');
  }
  var date = new Date(value + 'T00:00:00+09:00');
  if (isNaN(date.getTime()) || formatDeptDate_(date) !== value) {
    throw new Error('유효하지 않은 날짜');
  }
  return date;
}
function getDepartmentEvents_(startText, endText) {
  var start = parseDeptDate_(startText);
  var end = parseDeptDate_(endText);
  var days = (end.getTime() - start.getTime()) / 86400000;
  if (days <= 0 || days > 366) throw new Error('조회 기간 범위 오류');
  var cache = CacheService.getScriptCache();
  var cacheKey = 'dept-v1:' + startText + ':' + endText;
  var cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);
  var calendar = CalendarApp.getDefaultCalendar();
  if (!calendar) throw new Error('기본 캘린더를 확인할 수 없습니다');
  var rows = [];
  var events = calendar.getEvents(start, end);
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var matched = DEPT_PREFIX.exec(event.getTitle() || '');
    if (!matched) continue;
    if (event.getVisibility() === CalendarApp.Visibility.PRIVATE) continue;
    var title = matched[2].trim();
    if (!title) continue;
    var allDay = event.isAllDayEvent();
    var begin = allDay ? event.getAllDayStartDate() : event.getStartTime();
    // Google Calendar all-day end는 exclusive.
    var finish = allDay
      ? new Date(event.getAllDayEndDate().getTime() - 86400000)
      : new Date(event.getEndTime().getTime() - 1000);
    if (finish.getTime() < begin.getTime()) finish = begin;
    rows.push({
      id: String(event.getId()) + ':' + String(begin.getTime()),
      title: title.slice(0, 160),
      category: DEPT_CATEGORIES[matched[1]] || 'event',
      startDate: formatDeptDate_(begin),
      endDate: formatDeptDate_(finish),
      startTime: allDay ? '' : formatDeptTime_(begin),
      published: true
    });
  }
  rows.sort(function(a, b) {
    return a.startDate.localeCompare(b.startDate) ||
      a.startTime.localeCompare(b.startTime) ||
      a.title.localeCompare(b.title);
  });
  var result = { ok: true, events: rows.slice(0, 500), truncated: rows.length > 500 };
  var json = JSON.stringify(result);
  if (json.length < 90000) cache.put(cacheKey, json, 300);
  return result;
}
function doGet(request) {
  var params = (request && request.parameter) || {};
  var callback = params.prefix || '';
  var allowed = /^__departmentScheduleCallback_[A-Za-z0-9_]+$/.test(callback);
  var result;
  try {
    result = getDepartmentEvents_(params.start, params.end);
  } catch (error) {
    result = { ok: false, events: [], error: '일정을 불러오지 못했습니다.' };
  }
  var json = JSON.stringify(result).replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  if (callback && allowed) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
