// Public-event sharing only. Never include private Google Calendar data.
const PORTAL_URL = "https://portal.k-bigdata.kr/schedule.html";
const CATEGORY_LABELS = {academic:"학사",exam:"시험",project:"프로젝트",employment:"취업",certificate:"자격증",event:"행사"};
const validTime = value => typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const validDate = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

export function scheduleShareUrl(event) {
  const link = new URL(PORTAL_URL);
  if (validDate(event.startDate)) link.searchParams.set("date", event.startDate);
  if (typeof event.id === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(event.id)) {
    link.searchParams.set("event", event.id);
  }
  return link.href;
}

export function scheduleShareText(event) {
  const start = event.startDate + (validTime(event.startTime) ? " " + event.startTime : "");
  const end = event.endDate && event.endDate !== event.startDate ? " ~ " + event.endDate : "";
  const endTime = validTime(event.endTime) ? " (종료 " + event.endTime + ")" : "";
  const target = event.targetGrade === "1" ? "1학년" : event.targetGrade === "2" ? "2학년" : "전체 학년";
  return [
    "[빅데이터소프트웨어공학과 일정] " + event.title,
    "일시: " + start + end + endTime,
    "구분: " + (CATEGORY_LABELS[event.category] || "학과 일정") + " · 대상: " + target,
    "일정 확인: " + scheduleShareUrl(event)
  ].join("\n");
}

export function bandWebShareUrl(event) {
  const share = new URL("https://band.us/plugin/share");
  share.searchParams.set("body", scheduleShareText(event));
  share.searchParams.set("route", "portal.k-bigdata.kr");
  return share.href;
}

export function bandAppShareUrl(event) {
  return "bandapp://create/post?text=" + encodeURIComponent(scheduleShareText(event)) +
    "&route=portal.k-bigdata.kr";
}

const icsEscape = text => String(text || "").replace(/\\/g, "\\\\")
  .replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
const compact = date => date.replaceAll("-", "");
function nextDay(date) {
  const day = new Date(date + "T00:00:00Z");
  day.setUTCDate(day.getUTCDate() + 1);
  return day.toISOString().slice(0, 10);
}
function stableUid(event) {
  const value = String(event.id || "") + "|" + event.startDate + "|" + event.title;
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return "schedule-" + (hash >>> 0).toString(16) + "@portal.k-bigdata.kr";
}
function foldIcsLine(line) {
  const encoder = new TextEncoder();
  let output = "", bytes = 0;
  for (const character of line) {
    const width = encoder.encode(character).length;
    if (bytes + width > 75) { output += "\r\n "; bytes = 1; }
    output += character; bytes += width;
  }
  return output;
}
export function buildScheduleIcs(event, now = new Date()) {
  if (!validDate(event.startDate) || !validDate(event.endDate || event.startDate)) {
    throw new Error("유효한 일정 날짜가 없습니다.");
  }
  const start = event.startDate;
  const end = event.endDate || start;
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//K-BigData//Schedule//KO",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE", "TZID:Asia/Seoul", "BEGIN:STANDARD",
    "DTSTART:19700101T000000", "TZOFFSETFROM:+0900",
    "TZOFFSETTO:+0900", "TZNAME:KST", "END:STANDARD",
    "END:VTIMEZONE", "BEGIN:VEVENT", "UID:" + stableUid(event),
    "DTSTAMP:" + now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  ];
  if (validTime(event.startTime)) {
    lines.push("DTSTART;TZID=Asia/Seoul:" + compact(start) + "T" + event.startTime.replace(":", "") + "00");
    // The public API currently supplies start time only. Do not fabricate end time.
    if (validTime(event.endTime) && (end + event.endTime) > (start + event.startTime)) {
      lines.push("DTEND;TZID=Asia/Seoul:" + compact(end) + "T" + event.endTime.replace(":", "") + "00");
    }
  } else {
    lines.push("DTSTART;VALUE=DATE:" + compact(start));
    lines.push("DTEND;VALUE=DATE:" + compact(nextDay(end)));
  }
  lines.push("SUMMARY:" + icsEscape(event.title),
    "DESCRIPTION:" + icsEscape(scheduleShareText(event)),
    "URL:" + scheduleShareUrl(event),
    "END:VEVENT", "END:VCALENDAR");
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}

export async function copyScheduleLink(event) {
  const link = scheduleShareUrl(event);
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(link); return true; }
    catch (_) { /* Older browsers and denied permissions use fallback. */ }
  }
  const input = document.createElement("textarea");
  input.value = link; input.readOnly = true;
  input.style.position = "fixed"; input.style.left = "-9999px";
  document.body.append(input); input.select();
  let success = false;
  try { success = document.execCommand("copy"); }
  finally { input.remove(); }
  return success;
}
export function downloadScheduleIcs(event) {
  const blob = new Blob([buildScheduleIcs(event)], {type:"text/calendar;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "k-bigdata-schedule-" + event.startDate + ".ics";
  document.body.append(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 3000);
}

export function openBandShare(event) {
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    let appOpened = false;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") appOpened = true;
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.location.href = bandAppShareUrl(event);
    window.setTimeout(() => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (!appOpened && document.visibilityState === "visible") {
        window.location.assign(bandWebShareUrl(event));
      }
    }, 2200);
    return;
  }
  const share = window.open(bandWebShareUrl(event), "share_band",
    "width=450,height=650,resizable=yes,scrollbars=yes");
  if (!share) window.location.assign(bandWebShareUrl(event));
}
